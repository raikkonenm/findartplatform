import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadForwarder, syntheticMessage } from './runtime.mjs';

const subjects = ['New FindArt Exhibition Submission','New ArtNomads Artist Submission','New Editorial Pitch','New Opportunity Submission','New Index Website Submission'];
function response(result, ok = true) { return { getContentText: () => JSON.stringify(ok ? { ok:true,result } : result), getResponseCode: () => ok ? 200 : 429 }; }

test('only the five exact website subjects from the actual submission sender qualify', async () => {
  const { api } = await loadForwarder();
  for (const subject of subjects) {
    const message = syntheticMessage(); message.payload.headers[1].value = subject + ' — Test Applicant';
    assert.ok(api.formType_(message));
    message.payload.headers[0].value = 'Personal <personal@example.invalid>';
    assert.equal(api.formType_(message), null);
  }
  for (const subject of ['Personal mail','New Advertising Placement Request','FindArt Contact: Hello','Re: New Editorial Pitch']) {
    const message=syntheticMessage(); message.payload.headers[1].value=subject; assert.equal(api.packet_(message), null);
  }
});

test('every original field, long body, emoji and material URL is preserved without AI or folder crawling', async () => {
  const { api }=await loadForwarder(); const message=syntheticMessage();
  const text='Name:\nTest Applicant\n\nEmail:\ntest@example.invalid\n\nMessage:\n'+('Original field 🌍 https://www.dropbox.com/folder\n'.repeat(130))+'https://drive.google.com/drive/folders/abc\nhttps://www.dropbox.com/press.pdf';
  message.payload.body.data=Buffer.from(text).toString('base64url');
  const packet=api.packet_(message), texts=packet.steps.filter(step=>step.text).map(step=>step.text);
  assert.ok(texts.every(text=>text.length<=3800)); assert.ok(texts.join('').includes(text));
  assert.deepEqual(Array.from(packet.steps.filter(step=>step.link).map(step=>step.link)), ['https://www.dropbox.com/press.pdf']);
  assert.ok(texts.join('').includes('Project / exhibition: Not provided'));
});

test('confirmed steps are skipped after a definite failure and ambiguous requests never resend', async () => {
  let calls=0, reject=true;
  const { api,properties }=await loadForwarder({ UrlFetchApp: { fetch: (_url,options)=>{
    calls++; if (calls===2 && reject) return response({ok:false,error_code:429},false);
    return response({message_id:calls,text:options.payload.text});
  } } });
  const config={token:'synthetic',chat:'12345',properties}, packet={steps:[{text:'First'},{text:'Second'}]};
  assert.ok(api.deliver_(config,'P_test',packet,'id',Date.now()+10000).pending);
  reject=false; assert.ok(api.deliver_(config,'P_test',packet,'id',Date.now()+10000).complete); assert.equal(calls,3);
  properties.setProperty('P_uncertain',JSON.stringify({next:0,ids:[],inflight:0}));
  assert.ok(api.deliver_(config,'P_uncertain',packet,'id',Date.now()+10000).held); assert.equal(calls,3);
  const state=properties.getProperty('P_test'); assert.ok(!state.includes('First')); assert.ok(!state.includes('Second'));
});

test('JPEG documents keep exact original bytes and filenames become jpg; unsupported WebP is never mislabeled', async () => {
  const sent=[]; const { api,properties,Blob }=await loadForwarder({ UrlFetchApp:{fetch:(_url,options)=>{sent.push(options.payload); return response({message_id:sent.length,text:options.payload.text});}} });
  const original=Buffer.from([255,216,255,224,0,1,2,3]), blob=new Blob(original,'image/jpeg','original.jpeg');
  const output=api.document_(blob); assert.deepEqual(Buffer.from(output.getBytes()),original); assert.equal(output.getName(),'original.jpg');
  const packet={steps:[{attachment:{name:'photo.webp',mime:'image/webp',body:{data:Buffer.from('RIFF WEBP').toString('base64url')}}}]};
  assert.ok(api.deliver_({token:'synthetic',chat:'12345',properties},'P_webp',packet,'id',Date.now()+10000).complete);
  assert.equal(sent.length,1); assert.equal(sent[0].document,undefined); assert.match(sent[0].text,/could not be attached/);
});

test('one Gmail source prevents duplicate copies and never marks mail read or forwards personal messages', async () => {
  const labels=[], sent=[], one=syntheticMessage(), two={...one,id:'duplicate-copy'};
  const personal=syntheticMessage(); personal.id='personal';personal.payload={...personal.payload,headers:[{name:'From',value:'personal@example.invalid'},{name:'Subject',value:'Hello'}]};
  const { api,properties }=await loadForwarder({ Gmail:{Users:{getProfile:()=>({emailAddress:'raikkonenmaria7@gmail.com'}),Labels:{list:()=>({labels:[{name:'FINDART_TELEGRAM_SENT',id:'sent'},{name:'FINDART_TELEGRAM_REVIEW',id:'review'}]})},Messages:{list:()=>({messages:[{id:'one'},{id:'two'},{id:'personal'}]}),get:(_me,id)=>({one,two,personal})[id],modify:(patch,_me,id)=>labels.push({patch,id})}}},UrlFetchApp:{fetch:(url,options)=>{
    if(url.endsWith('/getMe'))return response({id:999,username:'FINDART_content_bot'});
    if(url.endsWith('/getChat'))return response({id:12345,type:'private'});
    sent.push(options.payload);return response({message_id:sent.length,text:options.payload.text});
  }}});
  properties.setProperty('TELEGRAM_BOT_TOKEN','synthetic'); properties.setProperty('TELEGRAM_CHAT_ID','12345');properties.setProperty('ENABLED','true');properties.setProperty('START_AFTER',String(Date.now()-60000));
  api.forwardFindart(); assert.equal(sent.length,1);assert.equal(labels.length,2);
  assert.ok(labels.every(item=>item.patch.addLabelIds[0]==='sent' && item.patch.removeLabelIds===undefined));
});

test('all five website forms still call only Resend and preserve the existing recipient and success response', async () => {
  const file=new URL('../../src/app/api/submissions/route.ts',import.meta.url), native=createRequire(file), loaded={exports:{}};
  const code=ts.transpileModule(await readFile(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',code)(name=>name==='next/server'?{NextResponse:{json:(body,options)=>new Response(JSON.stringify(body),{status:options?.status||200})}}:native(name),loaded,loaded.exports);
  const previous={key:process.env.RESEND_API_KEY,from:process.env.SUBMISSION_FROM_EMAIL,fetch:globalThis.fetch};let count=0;
  process.env.RESEND_API_KEY='synthetic';process.env.SUBMISSION_FROM_EMAIL='submissions@findartplatform.com';
  globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');assert.deepEqual(JSON.parse(options.body).to,['raikkonenmaria7@gmail.com']);count++;return new Response('{}');};
  const allFields=['Name','Email','Download Link','Message','Instagram','Artist Statement / CV','Portfolio / Documentation Link','Website (optional)','Additional Notes (optional)','Organization','Opportunity Title','Opportunity Type','Deadline','Location','For (audience)','Application Fee','Application Link','Description','Website URL','Short Description','Contribution Type','Pitch Title','Pitch','Sample / Portfolio Link','Short Bio','Notes (optional)'];
  try { for(const type of ['exhibition','artist','contribute','opportunity','index']){const body={submissionType:type,...Object.fromEntries(allFields.map(name=>[name,name==='Email'?'test@example.invalid':'Provided '+name]))};const result=await loaded.exports.POST(new Request('https://example.invalid/api/submissions',{method:'POST',body:JSON.stringify(body)}));assert.equal(result.status,200);assert.deepEqual(await result.json(),{ok:true});}assert.equal(count,5); }
  finally{globalThis.fetch=previous.fetch;for(const[name,value]of[['RESEND_API_KEY',previous.key],['SUBMISSION_FROM_EMAIL',previous.from]]){if(value===undefined)delete process.env[name];else process.env[name]=value;}}
});

test('setup enables one cloud timer only after the correct mailbox and bot test, without repeating its confirmed message', async () => {
  const triggers=[],sent=[];let mailbox='wrong@example.invalid';
  const {api,properties}=await loadForwarder({Gmail:{Users:{getProfile:()=>({emailAddress:mailbox}),Labels:{list:()=>({labels:[{name:'FINDART_TELEGRAM_SENT',id:'sent'},{name:'FINDART_TELEGRAM_REVIEW',id:'review'}]})}}},ScriptApp:{getProjectTriggers:()=>triggers.slice(),deleteTrigger:trigger=>triggers.splice(triggers.indexOf(trigger),1),newTrigger:handler=>({timeBased(){return this;},everyMinutes(minutes){assert.equal(minutes,5);return this;},create(){triggers.push({getHandlerFunction:()=>handler});}})},UrlFetchApp:{fetch:(url,options)=>{
    if(url.endsWith('/getMe'))return response({id:999,username:'FINDART_content_bot'});
    if(url.endsWith('/getChat'))return response({id:12345,type:'private'});
    sent.push(options.payload);return response({message_id:sent.length,text:options.payload.text});
  }}});
  properties.setProperty('TELEGRAM_BOT_TOKEN','synthetic');properties.setProperty('TELEGRAM_CHAT_ID','12345');
  assert.throws(()=>api.setupAndEnable(),/WRONG_GMAIL_ACCOUNT/);assert.equal(triggers.length,0);assert.equal(sent.length,0);
  mailbox='raikkonenmaria7@gmail.com';api.setupAndEnable();const start=properties.getProperty('START_AFTER');
  assert.equal(triggers.length,1);assert.equal(properties.getProperty('ENABLED'),'true');assert.equal(sent.length,1);
  api.setupAndEnable();assert.equal(triggers.length,1);assert.equal(sent.length,1);assert.equal(properties.getProperty('START_AFTER'),start);
});
