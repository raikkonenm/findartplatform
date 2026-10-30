// One synthetic transport test using existing bot secrets. No real applications.
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { TelegramClient } from '../telegram/telegram-client.mjs';
import { loadForwarder, syntheticMessage } from './runtime.mjs';

async function main() {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.FINDART_FORWARDER_TEST_ENABLED !== 'true') throw new Error('APPROVED_CLOUD_TEST_REQUIRED');
  const repository=process.env.GITHUB_REPOSITORY, headers={Authorization:`Bearer ${process.env.GITHUB_TOKEN}`,Accept:'application/vnd.github+json'};
  const list=await fetch(`https://api.github.com/repos/${repository}/actions/workflows/findart-simple-forwarder.yml/runs?per_page=10`,{headers,signal:AbortSignal.timeout(15000)});
  if(!list.ok)throw new Error('TEST_HISTORY_UNAVAILABLE');
  for(const run of (await list.json()).workflow_runs.filter(run=>String(run.id)!==process.env.GITHUB_RUN_ID)){
    const response=await fetch(`https://api.github.com/repos/${repository}/actions/runs/${run.id}/jobs`,{headers,signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('TEST_HISTORY_UNAVAILABLE');
    const step=(await response.json()).jobs.flatMap(job=>job.steps).find(step=>step.name==='Send one synthetic submission');
    if(step?.conclusion==='success'){console.log('SYNTHETIC_TEST_ALREADY_CONFIRMED_NO_RESEND');return;}
    if(step?.started_at && step.conclusion!=='skipped')throw new Error('PREVIOUS_TEST_NEEDS_RECEIPT_REVIEW_NO_AUTOMATIC_RESEND');
  }
  const client=new TelegramClient({token:process.env.TELEGRAM_BOT_TOKEN,chatId:process.env.TELEGRAM_CHAT_ID,expectedUsername:'FINDART_content_bot'});
  await client.verifyPrivateChat();
  const {api,Blob}=await loadForwarder(), message=syntheticMessage();
  const jpeg=await sharp({create:{width:400,height:300,channels:3,background:'#eeeeee'}}).jpeg({quality:95,chromaSubsampling:'4:4:4'}).toBuffer();
  const txt=Buffer.from('FINDART synthetic forwarding test. No real applicant data.\n','utf8');
  message.payload={...message.payload,mimeType:'multipart/mixed',body:undefined,parts:[{mimeType:'text/plain',body:{data:Buffer.from('Name:\nTest Applicant\n\nEmail:\ntest@example.invalid\n\nDownload Link:\nhttps://example.invalid/portfolio\n\nMessage:\nProject Title:\nFINDART forwarding test\n\nSynthetic technical test, not a real application.').toString('base64url')}},...[[jpeg,'image/jpeg','FINDART-test.jpg'],[txt,'text/plain','FINDART-test.txt']].map(([bytes,mimeType,filename])=>({mimeType,filename,body:{data:bytes.toString('base64url'),size:bytes.length}}))]};
  const packet=api.packet_(message), directory=await mkdtemp(path.join(tmpdir(),'findart-synthetic-forwarder-'));
  let texts=0,documents=0;
  for(const [index,step] of packet.steps.entries()){
    let result;
    if(step.text){result=await client.request('sendMessage',{text:step.text});if(result.text!==step.text)throw new Error('TEST_TEXT_RECEIPT_MISMATCH');texts++;}
    else{
      const original=Buffer.from(step.attachment.body.data,'base64url');
      const blob=api.document_(new Blob(original,step.attachment.mime,step.attachment.name));
      const bytes=Buffer.from(blob.getBytes()),file=path.join(directory,String(index));await writeFile(file,bytes);
      result=await client.request('sendDocument',{},[{path:file,filename:blob.getName()}]);
      if(result.document?.file_name!==blob.getName() || result.document.file_size!==bytes.length || (blob.getContentType()==='image/jpeg'&&result.document.mime_type!=='image/jpeg'))throw new Error('TEST_FILE_RECEIPT_MISMATCH');
      documents++;
    }
    console.log('SYNTHETIC_TEST_STEP_ACK='+JSON.stringify({index,method:step.text?'sendMessage':'sendDocument',messageId:result.message_id,filename:result.document?.file_name,bytes:result.document?.file_size,mime:result.document?.mime_type}));
    await new Promise(resolve=>setTimeout(resolve,1200));
  }
  console.log('SYNTHETIC_TEST_CONFIRMED='+JSON.stringify({textMessages:texts,documents,jpegDocuments:1,txtDocuments:1,realApplications:0,gmailAutomationEnabled:false}));
}
main().catch(()=>{console.error('FINDART_SYNTHETIC_TEST_STOPPED_CHECK_RECEIPTS_BEFORE_RETRY');process.exitCode=1;});
