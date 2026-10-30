/* Private Google Apps Script. No website changes, database, AI or public log. */
var FINDART_FORMS = [
  ['EXHIBITION', 'New FindArt Exhibition Submission'],
  ['ARTIST', 'New ArtNomads Artist Submission'],
  ['EDITORIAL', 'New Editorial Pitch'],
  ['OPPORTUNITIES', 'New Opportunity Submission'],
  ['WEBSITE / INDEX', 'New Index Website Submission']
];
var FINDART_SENT = 'FINDART_TELEGRAM_SENT';
var FINDART_REVIEW = 'FINDART_TELEGRAM_REVIEW';

function config_() {
  var properties = PropertiesService.getScriptProperties();
  var token = (properties.getProperty('TELEGRAM_BOT_TOKEN') || '').trim();
  var chat = (properties.getProperty('TELEGRAM_CHAT_ID') || '').trim();
  if (!token || !/^[1-9][0-9]*$/.test(chat)) throw new Error('BOT_PROPERTIES_REQUIRED');
  return { token: token, chat: chat, properties: properties };
}
function telegram_(config, method, fields) {
  var payload = Object.assign({}, fields || {});
  if (method !== 'getMe') payload.chat_id = config.chat;
  var response, data;
  try {
    response = UrlFetchApp.fetch('https://api.telegram.org/bot' + config.token + '/' + method, { method: 'post', payload: payload, muteHttpExceptions: true });
    data = JSON.parse(response.getContentText());
  } catch (_) { throw new Error('TELEGRAM_OUTCOME_UNKNOWN'); }
  if (response.getResponseCode() < 300 && data.ok && data.result) return data.result;
  var error = new Error('TELEGRAM_REJECTED_' + Number(data.error_code || response.getResponseCode()));
  error.definite = data.ok === false;
  throw error;
}
function checkConnections_() {
  var config = config_();
  if (Gmail.Users.getProfile('me').emailAddress.toLowerCase() !== 'raikkonenmaria7@gmail.com') throw new Error('WRONG_GMAIL_ACCOUNT');
  var bot = telegram_(config, 'getMe');
  var chat = telegram_(config, 'getChat');
  if (String(bot.username).toLowerCase() !== 'findart_content_bot' || chat.type !== 'private' || String(chat.id) !== config.chat || String(bot.id) === config.chat) throw new Error('WRONG_BOT_OR_PRIVATE_CHAT');
  return config;
}
function header_(message, name) {
  var found = (message.payload.headers || []).filter(function (item) { return item.name.toLowerCase() === name.toLowerCase(); });
  return found.length ? found[0].value : '';
}
function formType_(message) {
  var from = header_(message, 'From').toLowerCase();
  var address = /<([^>]+)>/.exec(from);
  if ((address ? address[1] : from.trim()) !== 'submissions@findartplatform.com') return null;
  var subject = header_(message, 'Subject');
  for (var i = 0; i < FINDART_FORMS.length; i++) {
    var prefix = FINDART_FORMS[i][1];
    if (subject === prefix || subject.indexOf(prefix + ' — ') === 0 || subject.indexOf(prefix + ' - ') === 0) return FINDART_FORMS[i][0];
  }
  return null;
}
function decode_(text) { return Utilities.newBlob(Utilities.base64DecodeWebSafe(text || '')).getDataAsString('UTF-8'); }
function plainHtml_(text) {
  return text.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<br\s*\/?\s*>|<\/(?:p|div|li)>/gi, '\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}
function readMessage_(message) {
  var text = [], html = [], files = [];
  function walk(part) {
    if (part.filename) files.push({ name: part.filename, mime: part.mimeType || 'application/octet-stream', body: part.body || {}, part: part.partId });
    else if (part.body && part.body.data) {
      if (part.mimeType === 'text/plain') text.push(decode_(part.body.data));
      if (part.mimeType === 'text/html') html.push(decode_(part.body.data));
    }
    (part.parts || []).forEach(walk);
  }
  walk(message.payload);
  var body = (text.length ? text.join('\n\n') : plainHtml_(html.join('\n\n'))).replace(/\r\n/g, '\n').trim();
  var links = [];
  (body + '\n' + html.join('\n')).replace(/https?:\/\/[^\s<>"\u201c\u201d]+/g, function (link) {
    link = link.replace(/[),.;]+$/, ''); if (links.indexOf(link) < 0) links.push(link); return link;
  });
  return { body: body, links: links, files: files };
}
function chunks_(text) {
  var chunks = [], chunk = '';
  Array.from(text).forEach(function (character) { if (chunk.length + character.length > 3800) { chunks.push(chunk); chunk = ''; } chunk += character; });
  if (chunk) chunks.push(chunk);
  return chunks;
}
function field_(body, label) {
  var escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var match = new RegExp('(?:^|\\n)' + escaped + ':\\s*\\n([^\\n]+)', 'i').exec(body);
  return match ? match[1].trim() : 'Not provided';
}
function fingerprint_(type, body) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, type + '\n' + body.replace(/\s+/g, ' ').trim()).map(function (byte) { return ('0' + (byte & 255).toString(16)).slice(-2); }).join('');
}
function directLink_(link) {
  return /^https:\/\//i.test(link) && (/\.(?:jpe?g|png|gif|bmp|pdf|zip|docx?|txt)(?:[?#]|$)/i.test(link) || /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/.test(link));
}
function packet_(message) {
  var type = formType_(message);
  if (!type) return null;
  var material = readMessage_(message);
  var title = ['Opportunity Title','Pitch Title','Exhibition Title','Project Title'].map(function (name) { return field_(material.body, name); }).filter(function (value) { return value !== 'Not provided'; })[0] || 'Not provided';
  var intro = 'NEW SUBMISSION — ' + type + '\n\nName: ' + field_(material.body, 'Name') + '\nEmail: ' + field_(material.body, 'Email') + '\nProject / exhibition: ' + title + '\n\nORIGINAL FORM FIELDS\n\n' + material.body;
  if (material.links.length) intro += '\n\nMATERIAL LINKS\n' + material.links.join('\n');
  var steps = chunks_(intro).map(function (text) { return { text: text }; });
  material.files.forEach(function (file) { if (!/^(?:logo|signature|tracking|spacer|favicon)[_.-]/i.test(file.name)) steps.push({ attachment: file }); });
  material.links.filter(directLink_).forEach(function (link) { steps.push({ link: link }); });
  return { fingerprint: fingerprint_(type, material.body), steps: steps };
}
function safeName_(name) { return String(name || 'attachment').replace(/[\x00-\x1f<>:"/\\|?*]/g, '_').slice(0,180); }
function publicUrl_(url) {
  var match = /^https:\/\/([a-zA-Z0-9.-]+)(?::443)?(?:\/[^\s]*)?$/.exec(url);
  if (!match || /^[0-9.]+$/.test(match[1]) || /(?:^|\.)(?:localhost|local|internal)$/.test(match[1]) || match[1].indexOf('.') < 0) throw new Error('UNSUPPORTED_DOWNLOAD_URL');
  return match[1];
}
function download_(link) {
  if (/^https:\/\/drive\.google\.com\/file\/d\//.test(link)) link = 'https://drive.google.com/uc?export=download&id=' + /\/d\/([a-zA-Z0-9_-]+)/.exec(link)[1];
  if (/^https:\/\/(?:www\.)?dropbox\.com\//.test(link)) {
    link = link.replace(/([?&])dl=[01]/, '$1dl=1');
    if (!/[?&]dl=1/.test(link)) link += (link.indexOf('?') < 0 ? '?' : '&') + 'dl=1';
  }
  for (var i = 0; i < 5; i++) {
    var host = publicUrl_(link);
    var response = UrlFetchApp.fetch(link, { muteHttpExceptions: true, followRedirects: false });
    var code = response.getResponseCode(), headers = response.getHeaders();
    if ([301,302,303,307,308].indexOf(code) >= 0) {
      var next = headers.Location || headers.location || '';
      if (next.indexOf('//') === 0) next = 'https:' + next;
      if (next.charAt(0) === '/') next = 'https://' + host + next;
      if (!/^https:\/\//.test(next)) throw new Error('DOWNLOAD_REDIRECT_REQUIRES_REVIEW');
      link = next; continue;
    }
    if (code !== 200) throw new Error('DOWNLOAD_UNAVAILABLE');
    var blob = response.getBlob(), mime = String(blob.getContentType() || '').split(';')[0];
    if (/^(?:text\/html|application\/json)/i.test(mime)) throw new Error('LINK_IS_NOT_A_FILE');
    var disposition = String(headers['Content-Disposition'] || headers['content-disposition'] || '');
    var filename = /filename="?([^";]+)/i.exec(disposition);
    var fallback = decodeURIComponent(link.split('?')[0].split('/').pop() || 'attachment');
    return blob.setName(safeName_(filename ? filename[1] : fallback));
  }
  throw new Error('DOWNLOAD_REDIRECT_LIMIT');
}
function document_(blob) {
  var bytes = blob.getBytes(), name = safeName_(blob.getName()), mime = blob.getContentType() || '';
  if (bytes.length > 45000000) throw new Error('FILE_EXCEEDS_UPLOAD_LIMIT');
  var jpeg = bytes.length > 3 && (bytes[0] & 255) === 255 && (bytes[1] & 255) === 216 && (bytes[2] & 255) === 255;
  if (jpeg) return blob.setContentType('image/jpeg').setName(name.replace(/\.[^.]+$/, '') + '.jpg');
  if (bytes.length > 4 && (bytes[0] & 255) === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) mime = 'image/png';
  if (bytes.length > 4 && bytes[0] === 71 && bytes[1] === 73 && bytes[2] === 70) mime = 'image/gif';
  if (bytes.length > 2 && bytes[0] === 66 && bytes[1] === 77) mime = 'image/bmp';
  blob.setContentType(mime);
  if (/^image\//.test(mime) || /\.(?:png|gif|bmp|webp|tiff?|avif)$/i.test(name)) {
    if (!/^image\/(?:png|gif|bmp)$/.test(mime)) throw new Error('IMAGE_CONVERSION_UNSUPPORTED_SOURCE_RETAINED_IN_EMAIL');
    var converted = blob.getAs('image/jpeg').setName(name.replace(/\.[^.]+$/, '') + '.jpg');
    var output = converted.getBytes();
    if (output.length > 45000000 || (output[0] & 255) !== 255 || (output[1] & 255) !== 216) throw new Error('JPEG_CONVERSION_FAILED');
    return converted;
  }
  return blob.setName(name);
}
function deliver_(config, key, packet, messageId, until) {
  var state = JSON.parse(config.properties.getProperty(key) || '{"next":0,"ids":[]}');
  if (state.uncertain) return { held: true };
  for (var i = state.next; i < packet.steps.length; i++) {
    if (Date.now() > until) return { pending: true };
    var step = packet.steps[i], blob, text = step.text;
    if (step.attachment || step.link) {
      try {
        if (step.link) blob = download_(step.link);
        else {
          var file = step.attachment, data;
          try { data = file.body.data || Gmail.Users.Messages.Attachments.get('me', messageId, file.body.attachmentId).data; }
          catch (_) {
            state.readFailures = (state.readFailures || 0) + 1;
            config.properties.setProperty(key, JSON.stringify(state));
            return state.readFailures >= 3 ? { held: true } : { pending: true };
          }
          blob = Utilities.newBlob(Utilities.base64DecodeWebSafe(data), file.mime, file.name);
        }
        blob = document_(blob);
      } catch (_) { blob = null; text = 'Material could not be attached. The original file/link remains in the submission email.\n' + (step.link || step.attachment.name); }
    }
    if (state.inflight !== undefined) { state.uncertain = true; config.properties.setProperty(key, JSON.stringify(state)); return { held: true }; }
    state.inflight = i; config.properties.setProperty(key, JSON.stringify(state));
    var result;
    try { result = blob ? telegram_(config, 'sendDocument', { document: blob, disable_content_type_detection: 'true' }) : telegram_(config, 'sendMessage', { text: text, link_preview_options: '{"is_disabled":true}' }); }
    catch (error) {
      if (error.definite) { delete state.inflight; state.failures = (state.failures || 0) + 1; state.uncertain = state.failures >= 3; }
      else state.uncertain = true;
      config.properties.setProperty(key, JSON.stringify(state));
      return state.uncertain ? { held: true } : { pending: true };
    }
    var matches = blob ? result.document && result.document.file_name === blob.getName() && result.document.file_size === blob.getBytes().length && (blob.getContentType() !== 'image/jpeg' || result.document.mime_type === 'image/jpeg') : result.text === text;
    state.ids.push(result.message_id); state.next = i + 1; state.failures = 0; state.readFailures = 0; delete state.inflight;
    if (!matches) state.uncertain = true;
    config.properties.setProperty(key, JSON.stringify(state));
    if (!matches) return { held: true };
    Utilities.sleep(1100);
  }
  return { complete: true, receipts: state.ids.length };
}
function labels_() {
  var existing = Gmail.Users.Labels.list('me').labels || [], result = {};
  [FINDART_SENT,FINDART_REVIEW].forEach(function (name) { var label = existing.filter(function (item) { return item.name === name; })[0] || Gmail.Users.Labels.create({ name: name, labelListVisibility: 'labelHide', messageListVisibility: 'hide' }, 'me'); result[name] = label.id; });
  return result;
}
function forwardFindart() {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  try {
    var config = config_(); if (config.properties.getProperty('ENABLED') !== 'true') return;
    config = checkConnections_();
    var start = Number(config.properties.getProperty('START_AFTER')); if (!start) throw new Error('START_TIME_REQUIRED');
    var until = Date.now() + 240000, labels = labels_(), properties = config.properties.getProperties();
    Object.keys(properties).forEach(function (key) { if (key.indexOf('D_') === 0 && Number(properties[key]) < Date.now() - 30*86400000) config.properties.deleteProperty(key); });
    var query = 'from:submissions@findartplatform.com after:' + Math.floor(start/1000) + ' -in:trash -label:' + FINDART_SENT + ' -label:' + FINDART_REVIEW + ' {' + FINDART_FORMS.map(function (item) { return 'subject:"' + item[1] + '"'; }).join(' ') + '}';
    var list = Gmail.Users.Messages.list('me', { q: query, maxResults: 25 });
    var messages = (list.messages || []).map(function (entry) { return Gmail.Users.Messages.get('me', entry.id, { format: 'full' }); }).filter(function (message) { return Number(message.internalDate) > start && formType_(message); }).sort(function (a,b) { return Number(a.internalDate) - Number(b.internalDate); });
    for (var i = 0; i < messages.length && Date.now() < until; i++) {
      var message = messages[i], packet = packet_(message), key = 'P_' + message.id;
      if (!packet) continue;
      var duplicate = config.properties.getProperty('D_' + packet.fingerprint);
      var result = duplicate ? { complete: true } : deliver_(config, key, packet, message.id, until);
      if (result.complete) {
        config.properties.setProperty('D_' + packet.fingerprint, String(Date.now()));
        Gmail.Users.Messages.modify({ addLabelIds: [labels[FINDART_SENT]] }, 'me', message.id);
        config.properties.deleteProperty(key);
      } else if (result.held) Gmail.Users.Messages.modify({ addLabelIds: [labels[FINDART_REVIEW]] }, 'me', message.id);
    }
  } finally { lock.releaseLock(); }
}
function setupAndEnable() {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) throw new Error('SETUP_ALREADY_RUNNING');
  try {
    var config = checkConnections_();
    if (config.properties.getProperty('SELF_TEST_OK') !== 'true') {
      var packet = { steps: [{ text: 'FINDART Gmail connection test succeeded. This is a setup notification, not an application.' }] };
      var result = deliver_(config, 'SELF_TEST_DELIVERY', packet, null, Date.now() + 240000);
      if (!result.complete) throw new Error('SELF_TEST_NOT_CONFIRMED_AUTOMATION_DISABLED');
      config.properties.setProperty('SELF_TEST_OK', 'true');
    }
    labels_();
    if (!config.properties.getProperty('START_AFTER')) config.properties.setProperty('START_AFTER', String(Date.now()));
    ScriptApp.getProjectTriggers().filter(function (trigger) { return trigger.getHandlerFunction() === 'forwardFindart'; }).forEach(function (trigger) { ScriptApp.deleteTrigger(trigger); });
    ScriptApp.newTrigger('forwardFindart').timeBased().everyMinutes(5).create();
    config.properties.setProperty('ENABLED', 'true');
    console.log('FINDART_FORWARDER_ENABLED_AFTER_CONFIRMED_TEST');
  } finally { lock.releaseLock(); }
}
function disableFindart() {
  PropertiesService.getScriptProperties().setProperty('ENABLED', 'false');
  ScriptApp.getProjectTriggers().filter(function (trigger) { return trigger.getHandlerFunction() === 'forwardFindart'; }).forEach(function (trigger) { ScriptApp.deleteTrigger(trigger); });
}
