// Inspect the mapped element and the shape of its destination. Never open a URL.
import fs from 'node:fs';
import path from 'node:path';

export const outcomes = ['play', 'go', 'send', 'file', 'show'];
const mapAsk = /\b(directions|map|see the area|find the way|where to find)\b/i;
const booking = /\b(book(?:ing)?|reserv(?:e|ation))\b/i;
const purchase = /\b(buy|purchase|pay|checkout)\b/i;
const order = /\b(?:pre[- ]?)?order\b/i;
const signup = /\b(sign[- ]?up|register|subscribe|join|start the .+ plan)\b/i;
const enquiry = /\b(enquir\w*|inquir\w*|quote|contact|message)\b/i;
export function inferOutcome(ask) {
  if (/\b(wishlist|app store|google play|store (?:page|listing)|download page|(?:download|get|install) (?:the )?(?:app|game) on (?:iphone|android)|download.*(?:app|iphone|android))\b/i.test(ask) ||
      /^(?:visit|open|go to)\b.*\b(?:website|site|shop|store|profile|channel)\b/i.test(ask)) return 'go';
  if (/\b(download|press (?:kit|assets)|pdf|zip)\b/i.test(ask)) return 'file';
  if (/\b(trailer|film|teaser|audio clip|podcast)\b|^(?:play|watch|listen to)\b/i.test(ask)) return 'play';
  if (mapAsk.test(ask) || /^(?:see|read|show|find out whether)\b/i.test(ask)) return 'show';
  if (/^send\b/i.test(ask) || [booking, purchase, order, signup, enquiry].some(pattern => pattern.test(ask))) return 'send';
  if (/\b(view|menu|projects?|prices?|pricing|hours|choose|devlog|shipping|woven|review|mascot|streaks?|timeline|sdk|alerts?|ping|tap|release|spring|nights)\b|[€$£]\s*\d/i.test(ask)) return 'show';
  return null;
}

const works = () => ({state:'works'});
const fails = why => ({state:'pretends', detail:why});
const previewWords = /\b(preview|unavailable|coming soon|not yet available|forthcoming|sample|opens? (?:an? |your )?(?:email|mail)|(?:mail|email) draft|draft (?:an? )?(?:email|message))\b/i;
const needs = {play:'the playable media file or embed', go:'the product page URL', send:'the receiving form address', file:'the downloadable file', show:'the requested content'};
const supplyWords = {play:/trailer|film|video|audio|recording|embed|media file/i, go:/store|wishlist|product page|destination|URL|link/i, send:/endpoint|checkout|mail|form (?:address|service)|booking system/i, file:/download|press kit|pdf|zip|file/i, show:/content|copy|menu|project|price|photo/i};

const attr = (n,k) => n?.get(k) ?? '';
const nodesIn = (page,n) => page.nodes.slice(n.start,n.end);
const words = nodes => nodes.map(n=>n.text.trim()).filter(Boolean).join(' ').replace(/\s+/g,' ');
function label(page,node) {
  const accessible = attr(node,'aria-label') || node.labelText?.replace(/\s+/g,' ').trim() || attr(node,'value');
  return accessible || nodesIn(page,node).map(n=>attr(n,'alt')).filter(Boolean).join(' ') || node.name;
}
function disclosure(page,node) {
  return attr(node,'aria-describedby').split(/\s+/).map(id=>page.ids.get(id)).filter(Boolean)
    .map(n=>words(nodesIn(page,n))).join(' ');
}
const isControl = n => ['a','button'].includes(n.name) || attr(n,'role')==='button';
const isDisabled = n => n.disabled || attr(n,'aria-disabled')==='true';
const playControl = (p,n) => isControl(n) && !isDisabled(n) && (/^(play|watch|listen)\b|^[▶►]$/i.test(label(p,n)) || /\b(?:ly-play|play-button|btn--play|play)\b|__play\b/i.test(attr(n,'class')));

function localAsset(raw,page) {
  // Reject URLs and UNC paths before touching the filesystem.
  try {
    if (!raw || /^[\s#?]|^[a-z][a-z\d+.-]*:|^[/\\]{2}|\\/i.test(raw)) return null;
    const name = decodeURIComponent(raw.split(/[?#]/)[0]);
    if (!name || name.includes('\\') || name.startsWith('//') || name.includes(':')) return null;
    const file = name.startsWith('/') ? path.join(page.root,name) : path.resolve(path.dirname(page.file),name);
    const st = fs.statSync(file);
    return st.isFile() && st.size > 0 ? file : null;
  } catch { return null; }
}

function webURL(raw) {
  try {
    const url = new URL(raw.startsWith('//') ? 'https:' + raw : raw);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url : null;
  } catch { return null; }
}
const example = u => u && /(?:^|\.)example$/i.test(u.hostname);
function imageSource(raw,page) {
  const url = webURL(raw);
  return !!(url && !example(url) || /^data:image\//i.test(raw) || localAsset(raw,page));
}
const searchPath = /(?:^|\/)(?:search|results|searchpage)(?:\/|$)/i;
// Known shared platforms have recognisable item URLs. A locale, a category or
// a tracking query on the home page doesn't identify an item.
const sharedHosts = [
  [/(^|\.)steampowered\.com$/, u => /^\/(?:app|sub|bundle)\/\d+(?:\/|$)/i.test(u.pathname)],
  [/^(apps|itunes)\.apple\.com$/, u => /\/(?:app|app-bundle)\/(?:[^/]+\/)?id\d+\/?$/i.test(u.pathname)],
  [/^play\.google\.com$/, u => /^\/store\/apps\/details\/?$/.test(u.pathname) && !!u.searchParams.get('id')],
  [/(^|\.)epicgames\.com$/, u => /\/p\/[^/]+/i.test(u.pathname)],
  [/(^|\.)gog\.com$/, u => /\/game\/[^/]+/i.test(u.pathname)],
  [/(^|\.)(nintendo|playstation|xbox|microsoft)\.com$/, u => /\/(?:products?|games?|concept|detail|apps)\/(?!browse\/?$|all\/?$)[\w-]+\/?$/i.test(u.pathname) || /\/[\w-]{8,}\/?$/i.test(u.pathname) && /\/(?:store|games)\//i.test(u.pathname)],
  [/(^|\.)youtube(?:-nocookie)?\.com$/, u => (u.pathname==='/watch' && !!u.searchParams.get('v')) || /^\/(?:embed|shorts|live)\/[\w-]+|^\/@[\w.-]+/.test(u.pathname)],
  [/(^|\.)youtu\.be$/, u => /^\/[\w-]+\/?$/.test(u.pathname)],
  [/(^|\.)vimeo\.com$/, u => /\/\d+\/?$/.test(u.pathname)],
  [/(^|\.)itch\.io$/, u => u.hostname!=='itch.io' && /^\/[\w-]+\/?$/.test(u.pathname)],
  [/(^|\.)(tiktok\.com|instagram\.com|facebook\.com|x\.com|twitter\.com|linkedin\.com)$/, u => /^\/(?!home|login|feed|explore|discover|trending|browse|marketplace|reels?\/?$)[@\w.-]+/i.test(u.pathname)],
  [/(^|\.)(openstreetmap\.org|maps\.apple\.com|(?:maps\.)?google\.com)$/, u => /\/(?:place|node|way|relation)\/[^/]+/.test(u.pathname) || !!u.searchParams.get('place_id')]
];
function destinationProblem(url) {
  if (searchPath.test(url.pathname) || [...url.searchParams.keys()].some(k=>/^(?:q|query|term|search|search_query|keywords?)$/i.test(k))) return 'a search result';
  if (/^(?:www\.)?apple\.com$/.test(url.hostname) && /^\/(?:[a-z]{2}\/)?(?:app-store\/?)?$/.test(url.pathname)) return 'the store front page';
  const platform = sharedHosts.find(([host]) => host.test(url.hostname));
  if (platform && !platform[1](url)) return 'a platform front page or listing';
  return '';
}
const remedies = {
  go:'Supply the product URL, or label a .example link as a preview and list its URL under Client must supply.',
  send:'Supply the fields and receiving endpoint, or label the .example form as a draft and list the endpoint under Client must supply.',
  play:'Supply the playable file or embed, or show a still without a play control and list the film under Client must supply.',
  file:'Supply the download, or remove the download control, label the preview and list the file under Client must supply.',
  show:'Supply the content, or label its preview and list the missing content under Client must supply.'
};
export const remedy = outcome => remedies[outcome];


const mediaHref = /\.(?:mp4|m4v|mov|webm|og[agv]|mp[34]|wav|flac|aac|m4a|opus)$/i;
const webPage = /\.(?:html?|shtml|asp[x]?|php|jsp)$/i;

function playerWorks(page,scope) {
  return scope.some(n=>{
    if (n.name==='iframe' || n.name==='embed') {
      const url = webURL(attr(n,'src'));
      return url && !example(url) && !destinationProblem(url) &&
        /\/(?:embed|video|player)\/[^/]+|\/embed\/?\?[^#]+/i.test(url.pathname+url.search);
    }
    if (!['video','audio'].includes(n.name)) return false;
    return nodesIn(page,n).some(source=>{
      if (source!==n && source.name!=='source') return false;
      const file = localAsset(attr(source,'src'),page);
      return file && (mediaHref.test(file) || !path.extname(file) && /^(audio|video)\//i.test(attr(source,'type')));
    });
  });
}

function playResult(page,scope,active,preview) {
  const controls = active.filter(n=>playControl(page,n));
  const controlled = controls.flatMap(n=>attr(n,'aria-controls').split(/\s+/).map(id=>page.ids.get(id)).filter(Boolean));
  const result = evaluate();
  // Suppress the older play-dead finding only on the very controls inspected.
  return {...result,playControls:controls.map(n=>n.at)};

  function evaluate() {
    let playable = playerWorks(page,scope) || controlled.some(n=>playerWorks(page,nodesIn(page,n)));
    for (const control of controls.filter(n=>n.name==='a')) {
      const href = attr(control,'href');
      const next = href.startsWith('#') && page.ids.get(href.slice(1));
      const file = localAsset(href,page);
      if ((next && playerWorks(page,nodesIn(page,next))) || (file && mediaHref.test(file))) {
        playable = true;
        continue;
      }
      return fails('"'+label(page,control)+'" opens '+(href || 'nothing')+' instead of playable media');
    }
    if (playable) return works();
    const native = scope.find(n=>['audio','video'].includes(n.name) && n.get('controls')!==null);
    const poster = scope.some(n=>imageSource(attr(n,'poster') || (n.name==='img' ? attr(n,'src') : ''),page));
    if (poster && !native && !controls.length) return preview();
    const src = scope.filter(n=>['video','audio','source','iframe','embed'].includes(n.name)).map(n=>attr(n,'src')).find(Boolean);
    return fails((controls.length ? '"'+label(page,controls[0])+'"' : 'the player')+' has no playable media'+(src ? ' at '+src : ''));
  }
}

function fileProblem(href,page) {
  const file = localAsset(href,page);
  if (!file) return 'missing, empty or not a local file';
  if (webPage.test(file)) return 'a web page';
  // An extensionless HTML page with a download attribute is still a page.
  if (!path.extname(file)) {
    let fd;
    try {
      fd = fs.openSync(file,'r');
      const first = Buffer.alloc(512);
      fs.readSync(fd,first,0,first.length,0);
      if (/<(?:!doctype\s+html|html|head|body)\b/i.test(first.toString())) return 'a web page';
    } catch { return 'an unreadable file'; }
    finally { if (fd!==undefined) fs.closeSync(fd); }
  }
  return '';
}

function linkResult(outcome,page,scope,active,preview) {
  const fileAsk = outcome==='file';
  const related = active.filter(n=>n.get('download')!==null || (fileAsk
    ? /download|press kit|\b(?:zip|pdf)\b/i
    : /download|wishlist|store|visit|watch|open|view|install|get the/i).test(label(page,n)));
  const links = related.length ? related : active.filter(n=>n.name==='a');
  if (!links.length) {
    if (fileAsk && !active.length && previewWords.test(words(scope))) return preview();
    return fails('the target has no destination');
  }
  const problems = [];
  let waiting = false;
  for (const node of links) {
    const href = attr(node,'href').trim();
    const title = label(page,node);
    const url = webURL(href);
    let problem;
    const promised = title+' '+disclosure(page,node);
    if (example(url) && previewWords.test(promised)) waiting=true;
    else if (fileAsk) problem = fileProblem(href,page);
    else if (url) problem = example(url) ? 'an unlabelled placeholder' : destinationProblem(url);
    else {
      const file = localAsset(href,page);
      if (!file || !webPage.test(file) || path.resolve(file)===path.resolve(page.file)) problem = 'no product page';
    }
    if (problem) problems.push('"'+title+'" opens '+(href || 'nothing')+' ('+problem+')');
  }
  if (problems.length) return fails(problems.join(' / '));
  return waiting ? preview() : works();
}

function missingFields(ask,fields) {
  const input = fields.filter(n=>['input','textarea','select'].includes(n.name) &&
    !/^(?:hidden|submit|button|reset|image)$/i.test(attr(n,'type')) && attr(n,'name'));
  const names = input.map(n=>[n.name,attr(n,'name'),attr(n,'type'),attr(n,'autocomplete'),attr(n,'aria-label')].join(' ')).join(' ');
  const wants = [[/e-?mail|tel|phone/i,'a contact field']];
  if (booking.test(ask) || /\bname\b/i.test(ask)) wants.push([/name/i,'a name']);
  if (booking.test(ask)) {
    wants.push([/date|arrival|day|check.?in/i,'a day']);
    if (/room|stay|hotel/i.test(ask)) wants.push([/departure|check.?out|end.?date/i,'a departure date']);
    else wants.push([/time|slot/i,'a time']);
    if (/table|room/i.test(ask)) wants.push([/guest|party|people|pax/i,'a party size']);
  }
  if (order.test(ask) || purchase.test(ask)) wants.push([/qty|quantit|item|product|variant|box|number/i,'an item or quantity']);
  if (enquiry.test(ask)) wants.push([/textarea|message|details/i,'an enquiry field']);
  return wants.filter(([pattern])=>!pattern.test(names)).map(([,what])=>what);
}

function sendResult(row,page,scope,active,preview) {
  const form = scope.find(n=>n.name==='form');
  if (!form) {
    // A local bag may lead to an order review in a dialog. The visitor can
    // review that bag, but a purchase needs a merchant handoff.
    const cart = active.some(n=>/add to (?:bag|cart)|review order/i.test(label(page,n)));
    const payment = active.some(n=>/\b(buy now|pay now|place order)\b/i.test(label(page,n)));
    const review = page.nodes.some(n=>n.name==='dialog' && /\b(bag|cart)\b/i.test(n.dialogText) &&
      /checkout preview|payments? (?:is |are )?(?:currently )?unavailable/i.test(n.dialogText));
    if (purchase.test(row.ask) && cart && !payment && review) return preview('the merchant checkout');
    const first = active[0];
    if (first) return fails('"'+label(page,first)+'" leads to '+(attr(first,'href') || 'a local control')+' with no receiving form');
    return {...fails('the target has no form to send'),missingForm:true};
  }
  const fields = [...new Set([...nodesIn(page,form), ...(form.id ? page.nodes.filter(n=>attr(n,'form')===form.id) : [])])]
    .filter(n=>!isDisabled(n) && (!attr(n,'form') || attr(n,'form')===form.id));
  const submit = fields.find(n=>(n.name==='button' && /^(?:submit)?$/i.test(attr(n,'type'))) ||
    (n.name==='input' && /^(?:submit|image)$/i.test(attr(n,'type'))));
  if (!submit) return fails('the form has no submit control');
  const onsubmit = attr(form,'onsubmit');
  const configured = attr(form,'data-endpoint').trim();
  const kitSends = configured && /(?:^|\s)form(?:\s|$)/.test(attr(form,'class')) &&
    /^(?:https?:\/\/|\/)/i.test(configured) && page.modules.some(src=>
      /(?:^|\/)system\.js(?:[?#]|$)/.test(src) && localAsset(src,page));
  const inline = onsubmit.match(/\bfetch\s*\(\s*['"]([^'"]+)['"]/);
  const endpoint = (kitSends ? configured : inline?.[1] || attr(submit,'formaction') || attr(form,'action')).trim();
  const title = '"'+label(page,submit)+'"';
  const missing = missingFields(row.ask,fields);
  if (missing.length) return fails(title+' points to '+(endpoint || 'no endpoint')+' but lacks '+missing.join(' and '));

  const url = webURL(endpoint);
  const draft = /^mailto:[^@\s?]+@[^@\s?]+/i.test(endpoint) || example(url);
  const status = fields.filter(n=>n.name==='output' || attr(n,'role')==='status' || n.get('data-form-status')!==null);
  const publicSuccess = fields.some(n=>/^(?:(?:thanks|thank you) for (?:booking|ordering|signing up)|thank you[!.]|(?:your )?(?:order|booking|message|request) (?:is |has been )?(?:sent|confirmed|received)\b)/i.test(n.text.trim()));
  const claimsSent = publicSuccess || status.some(n=>/\b(success|thank you|signed up|(?:order|request|message|booking) (?:is |has been )?(?:sent|received|confirmed))\b/i.test(words(nodesIn(page,n))));
  const cancelled = /\breturn\s+false\b|preventDefault\s*\(/.test(onsubmit) && !/\b(?:fetch|send)\s*\(/.test(onsubmit);
  if (claimsSent || cancelled) {
    return fails(title+' claims a send before delivery to '+(endpoint || 'any endpoint'));
  }
  if (draft) {
    const publicNote = [label(page,submit), words(fields), disclosure(page,form), disclosure(page,submit)].join(' ');
    if (previewWords.test(publicNote)) return preview();
    // The old mail fallback opens the visitor's mail app and never shows the
    // kit's data-sent confirmation. Preserve its advisory verdict during migration.
    if (row.legacy && /^mailto:[^?]*@[^?\s]+\.example(?:\?|$)/i.test(endpoint)) return preview(needs.send,'Label the submit as an email draft.');
    return fails(title+' points to '+endpoint+' without disclosing the draft or preview');
  }
  const route = /^(?:\/(?!\/)|\.{0,2}\/)?[\w-][\w./-]*(?:\?[^#]*)?$/.test(endpoint);
  if (attr(form,'method').toLowerCase()!=='dialog' && (url || route) && !/\.html?(?:[?#]|$)/i.test(endpoint)) return works();
  return fails(title+' has no receiving endpoint'+(endpoint ? ' ('+endpoint+')' : ''));
}

function showResult(ask,page,scope,active,preview) {
  const content = scope.filter(n=>!n.inLabel && n.text.trim());
  if (previewWords.test(words(scope)) && content.every(n=>previewWords.test(n.text) || n.inHeading)) return preview();
  const visual = scope.some(n=>n.name==='img' && imageSource(attr(n,'src'),page) ||
    n.name==='svg' && n.end>n.start+1 ||
    n.name==='canvas' || n.name==='option' && n.text || n.name==='input' && attr(n,'type')!=='hidden');
  const amounts = ask.match(/(?:[€$£]\s*)?\b\d+(?:[.,]\d+)?\b/g) || [];
  const fact = amounts.length && amounts.every(value=>words(scope).includes(value));
  if (content.some(n=>!n.inHeading) || visual || fact) return works();
  if (mapAsk.test(ask) && active.some(n=>{
    const url = webURL(attr(n,'href'));
    return url && /(?:^|\.)(?:openstreetmap\.org|google\.com|maps\.apple\.com)$/.test(url.hostname) &&
      (['q','query','destination'].some(k=>url.searchParams.get(k)?.trim()) || /\/(?:place|dir)\/[^/]+/.test(url.pathname));
  })) return works();
  return fails('the target shows only a label or has no visible content');
}

export function assessAsk(row,page,supply,sharedOutcome) {
  const {ask,id,outcome} = row;
  let target = page.ids.get(id);
  if (!target) return fails('#'+id+' is missing');
  // Follow a section link to its actual destination; a bare # goes nowhere.
  const seen = new Set();
  while (target.name==='a' && /^#.+/.test(attr(target,'href')) && !seen.has(target)) {
    seen.add(target);
    const next = page.ids.get(attr(target,'href').slice(1));
    if (!next) break;
    target=next;
  }
  if (outcome==='send' && ['button','input','select','textarea'].includes(target.name)) {
    const form = page.ids.get(attr(target,'form')) || target.form;
    if (form?.name==='form') target=form;
  }
  const scope = nodesIn(page,target);
  const active = scope.filter(n=>isControl(n) && !isDisabled(n));

  function preview(piece=needs[outcome],hint='') {
    const subject = (ask.toLowerCase().match(/[a-z]{3,}/g) || []).filter(w=>
      !/^(?:the|and|our|your|for|from|with|this|that|read|show|visit|open|watch|preview|download)$/.test(w));
    const purpose = [booking, purchase, order, signup, enquiry].find(pattern=>pattern.test(ask));
    const entry = supply.find(line=>{
      const ids = [...line.matchAll(/#([\w-]+)/g)].map(m=>m[1]);
      if (ids.length) return ids.includes(id);
      if (subject.some(w=>line.toLowerCase().includes(w)) || (outcome==='send' && purpose?.test(line))) return true;
      return !sharedOutcome && supplyWords[outcome].test(line);
    });
    if (!entry) return fails(piece+' is missing at #'+id+' and is unlisted under Client must supply');
    return {state:'preview',detail:piece,...(hint ? {hint} : {})};
  }
  if (outcome==='play') {
    const result = playResult(page,scope,active,preview);
    result.playControls.push(...[...seen].filter(n=>playControl(page,n)).map(n=>n.at));
    return result;
  }
  if (outcome==='send') return sendResult(row,page,scope,active,preview);
  if (outcome==='show') return showResult(ask,page,scope,active,preview);
  return linkResult(outcome,page,scope,active,preview);
}
