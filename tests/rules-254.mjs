#!/usr/bin/env node
// Real starter shell, CSS and browser checks. The gate flow test supplies an isolated
// browser report separately so an unrelated fixture-copy finding cannot mask drift.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import {runCheck} from './run-check.mjs';
import {fileURLToPath} from 'node:url';
// the story shapes, copy-story and the checker's story reads, without a browser (references/story.md)
await import('./story.mjs');

// Exact boundaries for the full-page finish measurements.
const {finishWarnings} = await import('../skills/taste-skill/scripts/still-finish.mjs');
const base = {empty:7, screens:20, lines:3, fraction:.5, rules:34, arrows:3};
assert.deepEqual(finishWarnings(1440,base,.006),[]);
assert.deepEqual(finishWarnings(390,base,.012),[]);
const finishIds = (w,m,p) => finishWarnings(w,m,p).map(f=>f.check).sort();
assert.deepEqual(finishIds(1440,{...base,empty:8,fraction:.49,rules:35,arrows:4},.0061),
  ['accent-wide','arrow-links','headline-narrow','picture-sparse','rule-heavy']);
assert.deepEqual(finishIds(390,base,.0121),['accent-wide']);
assert.deepEqual(finishIds(1440,{...base,lines:2,fraction:.49},0),[]);

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(root,'skills','taste-skill');
const tmp = fs.mkdtempSync(path.join(process.env.TASTE_SKILL_TMP || os.tmpdir(),'rules-254-'));
const profile = process.env.TASTE_SKILL_CHROME_PROFILE || path.join(tmp,'profile');
const starter = fs.readFileSync(path.join(skill,'assets','starter.html'),'utf8');
fs.copyFileSync(path.join(skill,'assets','system.css'),path.join(tmp,'system.css'));
fs.mkdirSync(path.join(tmp,'.taste-skill'));
const notes = path.join(tmp,'.taste-skill','copy.md');
async function run(script,args) {
  const r = await runCheck([script,...args],tmp,300000);
  if (r.error || r.timedOut || ![0,1].includes(r.status)) throw Error(String(r.error || r.stderr));
  return JSON.parse(r.stdout);
}
const section = (id,body,cls='',own=true) => '<section id="'+id+'" class="section '+cls+'" '+(own?'data-own="'+id+'"':'')+'><div class="wrap"><h2>'+id+'</h2>'+body+'</div></section>';
function fixture(bad) {
  const label = bad ? 'broken' : 'good', file = path.join(tmp,label+'.html');
  const head = '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Workshop</title><link rel="stylesheet" href="system.css"><style>body{margin:0}.service-notice{position:fixed;inset:0 0 auto;z-index:1}main>.hero{display:block;height:calc(100vh + 240px);min-height:0;padding:0}main>.hero .wrap{display:block;height:auto;padding-top:48px}.hero h1{margin:0;height:90px;padding-top:16px}.hero__window{margin:clamp(250px,32vh,300px) 0 0;height:650px;background:#ddd}.section h2,.section p{margin:0}.section :is(button,input){min-height:44px}#d figure{margin:16px 0 0;width:100%}#d figure svg{display:block;width:100%;height:240px}'+(bad ? 'main>.hero{height:65vh;overflow:clip}#a{padding-bottom:24px}#b{padding-top:24px;padding-bottom:200px}#c{padding-top:200px}#d .gone{opacity:0}#d{min-height:260vh}' : '')+'</style></head>';
  const figure = '<figure><svg width="240" height="120" viewBox="0 0 240 120" preserveAspectRatio="none" role="img" aria-label="Room plan"'+(bad?' data-lookalike="replica logo"':'')+'><rect x="1" y="1" width="238" height="118" fill="#d9e6e1"/><path d="M8 8h90v104H8z M104 8h124v48H104z M104 64h124v48H104z" fill="#40877e"/></svg><figcaption class="fact-line">'+(bad ? 'Illustrative photograph' : 'Weir Room · 28 m²')+'</figcaption></figure>';
  const tabs = '<div role="tablist" aria-label="Room"><button role="tab" aria-selected="true" aria-controls="weir">Weir</button><button role="tab" aria-selected="false" aria-controls="mill">Mill</button></div><div id="weir" role="tabpanel">River room, 28 m²</div><div id="mill" role="tabpanel" hidden>Mill room, 36 m²</div>';
  const tabScript = 'document.querySelectorAll("[role=tab]").forEach(b=>b.onclick=()=>{for(const t of document.querySelectorAll("[role=tab]")){t.setAttribute("aria-selected",String(t===b));document.getElementById(t.getAttribute("aria-controls")).hidden=t!==b}})';
  const hero = '<section class="hero hero--peek"><div class="wrap"><h1>The workshop</h1><div class="hero__window" role="img" aria-label="Workshop schedule"><span data-subject="schedule" style="display:'+(bad?'none':'block')+';position:absolute;width:100%;height:120px"><svg viewBox="0 0 300 90" role="img" aria-label="Port call"><path d="M20 25h160v15H20zm80 30h180v15H100z"/></svg></span><svg viewBox="0 0 640 300" width="100%" height="100%" aria-hidden="true"><rect width="640" height="300" fill="#dce7e2"/><g stroke="#506963" stroke-width="2"><path d="M40 70h560M40 122h560M40 174h560M40 226h560"/></g><path fill="#376b63" d="M80 48h190v20H80zM200 100h230v20H200zM340 152h195v20H340zM160 204h160v20H160z"/></svg></div></div></section>';
  const parts = [
    section('a','<p>Join the team.</p>','',false),
    section('b','<p>Our process.</p><p class="terms" style="font-size:'+(bad?12:16)+'px">From 695 kronor.</p><p style="font-size:'+(bad?12:16)+'px">Ships March 4.</p>','',false),
    section('c','<p>The drawing.</p>','',false),
    section('d','<p class="gone">Hours and rates</p><strong data-count="48">'+(bad?'24':'48')+'</strong><b id="observed">'+(bad?'8':'16')+'</b><div><span style="position:sticky;top:8px">Workshop hours</span></div>'+tabs+figure+(bad?'':'<span data-auto-advance></span><button data-pause>Pause schedule</button>')),
    section('e','<form action="mailto:test@shop.example"><label>Email<input type="email"></label><button type="submit">'+(bad?'Book a room':'Open email draft')+'</button><p class="terms">'+(bad?'Request a room.':'Opens your email with the request filled in.')+'</p></form>',bad?'':'ground-surface',!bad),
    section('f',bad?'<div data-auto-advance></div>':'<p>Route map</p>',bad?'':'section--thin',false),
    section('g','<p>Visit us.</p>','',false)
  ];
  if (!bad) for (const i of [2,6]) parts[i]=parts[i].replace('class="section ','class="section ground-surface ');
  // Keep the timer in the single own section on the bad page.
  if (bad) parts[3] = parts[3].replace('</section>','<div data-auto-advance></div></section>');
  const html = starter.replace(/<!--[\s\S]*?-->/g,'').replace(/<html[^>]*>/i,'<html lang="en" data-type="place" data-density="regular">').replace(/<head>[\s\S]*?<\/head>/i,head).replace(/<body[^>]*>[\s\S]*?<\/body>/i,'<body><header><aside class="service-notice" data-source="brief">Saturday opening changes.'+(bad?'':'<button type="button" data-dismiss-notice>Dismiss notice</button>')+'</aside></header><main>'+hero+parts.join('')+'</main><script>'+tabScript+';const [first,second]=document.querySelectorAll("[role=tab]");second.click();if(document.getElementById("mill").hidden || !document.getElementById("weir").hidden)console.error("Room tab failed");first.click();document.getElementById("observed").textContent="16";document.querySelector(".gone").style.opacity=1</script></body>').replace('document.querySelector(".gone").style.opacity=1','document.querySelector(".gone")?.style.setProperty("opacity","1")');
  fs.writeFileSync(file,html);
  return file;
}
const variant = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only')+1] : '';
const groups = ['good','broken','booking','bands','headings','outcomes','regressions','motion','finish'];
if (variant && !groups.includes(variant)) throw Error('Use --only with one of '+groups.join(', '));
if (!variant || variant==='outcomes') {
  fs.writeFileSync(path.join(tmp,'store-hop.html'),'<a href="https://store.steampowered.com/search/?term=wren">Find Wren</a>');
  fs.writeFileSync(path.join(tmp,'store-item.html'),'<a href="https://store.steampowered.com/app/1234">Official store page</a>');
  const form = (action,body,extra='') => '<form action="'+action+'" '+extra+'><input type="email" name="email">'+body+'</form>';
  const cases = [
    ['Watch the film','play','works','<video controls><source src="film.mp4"></video>'],
    ['Hear the recording','play','works','<audio controls src="audio.wav"></audio>'],
    ['See the trailer','play','works','<iframe src="https://www.youtube.com/embed/clip-id"></iframe>'],
    ['Trailer still','play','preview','<img src="poster.svg" alt="Trailer still">','film'],
    ['Play the clip','play','pretends','<video controls poster="poster.svg" src="missing.mp4"></video>'],
    ['Play the trailer','play','pretends','<button class="ly-play">Watch trailer</button><img src="poster.svg">','trailer'],
    ['Wishlist the game','go','works','<a href="https://store.steampowered.com/app/1245/">Wishlist</a>'],
    ['Get the app','go','works','<a href="https://apps.apple.com/us/app/pebble/id1234">Get for iPhone</a><a href="https://play.google.com/store/apps/details?id=com.pebble">Get for Android</a>'],
    ['Store listing','go','preview','<a href="https://game.example/">Store page preview</a>','store URL'],
    ['Visit the shop','go','pretends','<a href="https://store.steampowered.com/search?term=shop">Visit shop</a>','real store page'],
    ['Get both versions','go','pretends','<a href="https://apps.apple.com/us/app/id1234">Download for iPhone</a><a href="https://play.google.com/store/apps">Download for Android</a>'],
    ['Get the store page','go','pretends','<a href="#">Wishlist</a>'],
    ['Join the list','send','works',form('/api/join','<button>Join</button>')],
    ['Sign up','send','preview',form('mailto:hello@list.example','<button>Draft an email</button>'),'sign-up endpoint'],
    ['Request news','send','preview',form('https://news.example/join','<button>Preview signup</button>'),'form address'],
    ['Sign up for news','send','pretends',form('#','<button>Join</button><output>Success! You are signed up.</output>')],
    ['Book a table','send','pretends',form('/tables','<button>Book a table</button>')],
    ['Download the facts','file','works','<a download href="press%20kit.txt?v=1">Download facts</a>'],
    ['Download the guide','file','preview','<p>Guide preview. The PDF is coming soon.</p>','guide PDF'],
    ['Download the file','file','pretends','<a download href="absent.zip">Download</a>','file'],
    ['Download the menu','file','pretends','<a href="more.html">Download</a>'],
    ['Download the sheet','file','pretends','<a href="empty.pdf">Download the sheet</a>'],
    ['Read the menu','show','works','<h2>Menu</h2><ul><li>Pea soup, 7 euros</li></ul>'],
    ['See the area','show','works','<a href="https://www.openstreetmap.org/search?query=Ottensen">See the area</a>'],
    ['Read the menu','show','preview','<h2>Menu</h2><p>Menu preview coming soon.</p>','menu copy'],
    ['Read the menu','show','pretends','<h2>Menu</h2><div hidden>Soup, 7 euros</div>'],
    ['Download the pack',null,'works','<a href="press%20kit.txt">Download</a>'],
    ['Make the connection',null,null,'<h2>Connections</h2>'],
    ['Visit a product','go','pretends','<a href="https://game.example/">Buy now</a>','store URL'],
    ['Preview another product','go','pretends','<a href="https://other.example/">Preview the store</a>'],
    ['Get the press kit','file','preview','<a href="https://press.example/">Press kit preview</a>','press kit ZIP'],
    ['Install the preview app','go','preview','<a href="https://shop.example/" aria-describedby="app-note">Store link</a><p id="app-note">Store preview.</p>','app store URL'],
    ['Film from a decoy','play','pretends','<video controls src="more.html"></video>'],
    ['Wishlist the game','go','pretends','<a href="store-hop.html">Wishlist on Steam</a>'],
    ['Wishlist the game','go','preview','<a href="store-hop.html">Find Wren on Steam</a>','official listing'],
    ['Wishlist the game','go','works','<a href="store-item.html">Wishlist on Steam</a>'],
    ['Meet the bosses',null,'works','<p>The harbour keeper catches the last ferry.</p>'],
    ['Open the artist page','go','works','<a href="more.html">Visit the artist</a>'],
    ['Download a brochure','file','pretends','<a href="page-without-extension" download>Download</a>'],
    ['Join our mailing list','send','pretends',form('','<button>Join</button><output>Signed up!</output>','onsubmit="return false"')],
    ['Join the preview','send','pretends',form('mailto:list@list.example','<button>Join now</button>'),'form address'],
    ['Join the mailing list','send','pretends',form('','<button>Join</button>','data-endpoint="/api/signup"')],
    ['Send the enquiry','send','works',form('','<textarea name="message"></textarea><button>Send enquiry</button>','onsubmit="event.preventDefault();fetch(\'/api/send\', {method:\'POST\',body:new FormData(this)})"')],
    ['Join from the kit form','send','works',form('','<button>Join</button>','class="form" data-endpoint="/api/signup"')],
    ['Book a table for four','send','works',form('/api/tables','<input name="name"><input type="date" name="date"><input type="time" name="time"><select name="guests"><option>4</option></select><button>Book</button>')],
    ['See film two','play','pretends','<button>Play trailer</button><template><video src="film.mp4"></video></template>'],
  ];
  const file = path.join(tmp,'index.html');
  for (const name of ['film.mp4','audio.wav','poster.svg','press kit.txt','more.html','empty.pdf']) {
    // Only presence, size and destination form are checked.
    fs.writeFileSync(path.join(tmp,name),name==='empty.pdf' ? '' : 'fixture');
  }
  fs.writeFileSync(path.join(tmp,'page-without-extension'),'<!doctype html><title>Home</title>');
  fs.copyFileSync(path.join(skill,'assets/system.js'),path.join(tmp,'system.js'));
  fs.writeFileSync(file,'<script type="module" src="system.js"></script><main>'+cases.map((v,i)=>'<section id="case-'+i+'">'+v[3]+'</section>').join('')+'</main>');
  fs.writeFileSync(notes,'Asks:\n'+cases.map(([ask,outcome],i)=>'- '+ask+' -> #case-'+i+(outcome?' : '+outcome:'')).join('\n')+
    '\n\n## Client must supply\n'+cases.map((v,i)=>v[4] ? '- #case-'+i+' '+v[4] : '').join('\n'));
  for (const input of [file,notes]) {
    const report = (await run(path.join(skill,'scripts/copy-lint.mjs'),[input,'--json'])).files[0];
    assert.equal(report.asks.length,cases.length);
    for (const [i,[ask,outcome,state]] of cases.entries()) {
      const row=report.asks[i];
      assert.equal(row.ask,ask);
      assert.equal(row.outcome,outcome || (ask==='Meet the bosses' ? 'show' : state ? 'file' : null));
      assert.equal(row.state || null,state,row.line);
      const findings=report.findings.filter(f=>f.id==='ask-outcome' && f.hits.some(h=>h.match.includes('#case-'+i+' ')));
      if (state==='pretends') assert.ok(findings.some(f=>f.sev==='FAIL' && /Client must supply/.test(f.fix)),row.line);
      if (state==='preview') assert.ok(findings.some(f=>f.sev==='WARN' && /needs/.test(f.msg)),row.line);
      if (!state) assert.ok(report.findings.some(f=>f.id==='ask-outcome' && f.sev==='WARN' && f.msg.includes(ask)),row.line);
    }
    console.log('ok - '+cases.length+' outcome mappings from '+path.basename(input));
  }
  fs.writeFileSync(notes,'Asks:\n- Send an enquiry -> none: add #enquiry after the client supplies the receiving address\n');
  const deferred = (await run(path.join(skill,'scripts/copy-lint.mjs'),[file,'--json'])).files[0];
  assert.ok(!deferred.findings.some(f=>f.id==='brief-ask' && f.sev==='FAIL'));
  assert.equal(deferred.asks[0].state,'preview');
  console.log('ok - a deferred ask may name a future target');
}
if (!variant || variant==='regressions') {
  const file=path.join(tmp,'regressions.html');
  const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Harbour schedule</title><link rel="stylesheet" href="system.css">'+
    '<style>.hero--triptych .hero__cta .btn{height:64px;font-size:20px}.nav .btn,.repeat .btn{height:44px;font-size:16px}#only-price{font-size:80px}#delay{opacity:0;position:absolute;width:1px;height:1px}label{display:inline-block;padding:12px}section{padding:40px}</style>'+
    '<body><header class="nav"><div class="wrap"><a class="btn btn--primary" href="#demo">Book a demo</a></div></header><main>'+
    '<section class="hero hero--triptych"><div class="wrap"><h1>Harbour schedule</h1><p>See each call at the quay.</p><div class="hero__cta"><a class="btn btn--primary" href="#demo">Book a demo</a></div></div></section>'+
    '<section data-own="schedule"><div class="wrap"><h2>When the Wren arrives</h2><div role="img" aria-label="Schedule hours">09 10 11 12 13</div>'+
    '<input id="delay" type="radio" name="delay"><label for="delay">Six hours late</label><p id="only-price">€2,400</p></div></section>'+
    '<section id="demo" class="repeat"><div class="wrap"><h2>Review your call</h2><p data-placeholder>The demo opens an email draft with a placeholder destination.</p>'+
    '<a class="btn btn--primary" href="#demo">Book a demo</a></div></section></main></body></html>';
  fs.copyFileSync(path.join(skill,'assets/system.js'),path.join(tmp,'system.js'));
  const controls = '<section id="pick"><h2>Choose a shift</h2><label>Shifts<input type="number" value="1" data-choice="shifts"></label><a href="#request">Request shift</a></section>'+
    '<section id="request"><h2>Request your shift</h2><form><label>Shifts<input type="number" value="1" name="shifts" data-choice="shifts"></label></form></section>'+
    '<a href="#teams" data-choice-set="team:Night">Night</a><section id="teams"><h2>Teams</h2><div role="tablist" data-choice="team">'+
    '<button type="button" role="tab" aria-selected="true" aria-controls="day">Day</button><button type="button" role="tab" aria-controls="night">Night</button></div>'+
    '<div id="day" role="tabpanel">Day shift</div><div id="night" role="tabpanel">Night shift</div></section>';
  fs.writeFileSync(file,html.replace('</main>',controls+'</main><script type="module" src="system.js"></script>'));
  const layout=await run(path.join(skill,'assets/layout/check.mjs'),['--url',file,'--profile',profile,'--sizes','1440x900','--json','--no-stress','--still']);
  const rules=layout.flatMap(row=>row.findings);
  assert.ok(!rules.some(f=>f.rule==='still-wrong' && f.where.includes('delay')),'native radio has a visible label');
  assert.ok(!rules.some(f=>f.rule==='placeholder'),'an honest data-placeholder note is readable');
  const report=await run(path.join(skill,'scripts/consistency.mjs'),[file,'--quick','--widths','1440','--json','--profile',profile,'--out',path.join(tmp,'regressions')]);
  assert.ok(report.widths.every(w=>!w.errors?.length && w.screens>0));
  const fails=report.widths.flatMap(w=>w.findings).filter(f=>f.sev==='FAIL');
  for (const [rule,subject] of [['phone-number','ascending chart hours'],['placeholder','preview wording'],['heading-scale','single display price'],['same-action','triptych/nav action'],['button-styles','triptych button size'],['choice-lost','synchronised picker and linked tab']]) {
    assert.ok(!fails.some(f=>f.check===rule),subject+' '+JSON.stringify(fails.filter(f=>f.check===rule)));
    console.log('ok - '+subject);
  }
}
if (!variant || variant==='bands') {
  const scope={window:{},getComputedStyle:()=>({backgroundImage:'none',visibility:'visible',opacity:'1'})};
  vm.runInNewContext(fs.readFileSync(path.join(skill,'assets/layout/layout-check.js'),'utf8'),scope);
  const blank=(top,bottom)=>{
    const picture={getBoundingClientRect:()=>({width:1440,height:bottom-top,top,bottom})};
    return scope.window.lyRules.blankRun([{querySelectorAll:()=>[picture]}],100,500);
  };
  const {emptyRun} = scope.window.lyRules;
  assert.equal(emptyRun(150,150,10,800,280).fails,false); console.log('ok - two separate 150px end spaces stay separate');
  assert.equal(emptyRun(281,0,0,1200,280).fails,true); console.log('ok - one continuous edge beyond 280px fails');
  assert.equal(emptyRun(0,0,200,600,280).fails,true); console.log('ok - a continuous hole at one third fails');
  assert.equal(blank(0,100),400); console.log('ok - a picture earlier in the section leaves a 400px seam');
  assert.equal(blank(240,360),140); console.log('ok - a picture inside the seam splits the empty stretch');
  assert.equal(blank(470,580),370); console.log('ok - a partial picture leaves the longest continuous band measurable');
}
for (const bad of [false,true]) {
  if (variant && variant !== (bad?'broken':'good')) continue;
  const file = fixture(bad);
  fs.writeFileSync(notes,'Asks:\n- book a room -> #'+(bad?'absent':'e')+'\n- press assets -> none: client supplies the files\n');
  const copy = (await run(path.join(skill,'scripts/copy-lint.mjs'),[file,'--json'])).files[0].findings;
  const test = (ok,msg) => { assert.ok(ok,msg+' ('+file+')'); console.log('ok - '+msg); };
  test(copy.some(f=>f.id==='brief-ask' && f.sev==='FAIL') === bad,'missing ask ID '+(bad?'fails':'absent'));
  test(copy.some(f=>f.id==='brief-ask' && f.sev==='WARN' && /client supplies/.test(f.msg)),'reason is printed');
  test(copy.some(f=>f.id==='caption' && f.sev==='FAIL') === bad,'copy caption '+(bad?'fails':'passes'));
  const result = await run(path.join(skill,'assets/layout/check.mjs'),['--url',file,'--profile',profile,'--sizes','1440x900,390x844','--json','--no-stress','--still']);
  fs.writeFileSync(file+'.json',JSON.stringify(result,null,2));
  for (const row of result) {
    const f = row.findings;
    test(!f.some(v => v.rule === "ground-flat"), "a page may use one ground throughout");
    for (const id of ['section-air','empty-band','visual-caption','still-wrong','own-timer','hero-fold','own-count','pinned','brand-lookalike']) {
      test(f.some(v=>v.rule===id) === bad,row.size+' '+id+' '+(bad?'detected':'clear'));
    }
    test(f.some(v=>v.rule==='photo-set' && v.sev==='WARN'),row.size+' built subject makes the place photo count advisory');
    if (bad) test(f.some(v=>v.rule==='still-wrong' && /final value 48/.test(v.detail)) && f.some(v=>v.rule==='still-wrong' && v.where==='#observed') && f.some(v=>v.rule==='still-wrong' && /hidden/.test(v.detail)),row.size+' verifies the initial counter and hidden copy separately');
    else {
      const a=row.sections.find(s=>s.where.includes('#a')), b=row.sections.find(s=>s.where.includes('#b'));
      const expected=row.size.startsWith('1440')?144:120;
      test(a && b && Math.abs(b.contentTop-a.contentBottom-expected)<1,row.size+' measures the kit same-ground seam at '+expected+'px');
      test(!f.some(v=>/tab|effect-kind|button-styles/.test(v.rule) || /Room tab failed/.test(v.where)),'click tabs switch the room on a place page');
    }
  }
  if (!process.argv.includes('--layout-only')) {
    const report = await run(path.join(skill,'scripts/consistency.mjs'),[file,'--quick','--widths','1440,390','--json','--profile',profile,'--out',path.join(tmp,bad?'broken-check':'good-check')]);
    for (const w of report.widths) {
      test(!w.errors?.length,w.width+' consistency width completed');
      const hits=w.findings;
      for (const rule of ['small-terms','preview-handoff','service-notice', ...(w.width===390 ? ['subject-first'] : [])])
        test(hits.some(f=>f.check===rule && f.sev==='WARN') === bad,w.width+' '+rule+' '+(bad?'detected':'clear'));
      test(hits.some(f=>f.check==='small-terms' && /Ships March/.test(f.text))===bad,w.width+' an unlabelled dispatch date is measured');
      for (const name of ['own-count','own-timer','still-wrong','empty-band','visual-caption']) {
        test(hits.some(v=>v.check===name)===bad,w.width+' consistency '+name+' '+(bad?'detected':'clear'));
      }
      test(hits.some(v=>v.check==='section-air' && v.sev==='FAIL')===bad,w.width+' consistency cramped spacing');
      if (!bad) test(!hits.some(v=>v.sev==='FAIL' && /section#(?:d|e)\b/.test(v.sel || '')),w.width+' own room section passes the general checks');
      if (!bad) test(!hits.some(v=>['effect-kind','button-styles','hero-screen','hero-fill','fold-cut'].includes(v.check) && v.sev==='FAIL'),w.width+' place tabs and peek pass the production checker');
    }
  }
  if (!bad) {
    const original=fs.readFileSync(file,'utf8');
    for (const [tail,fail] of [
      ['<div><p class="fact-line">Bench · 2024</p></div>',true],
      ['<div><img src="a" alt="Bench"><p class="fact-line">Bench · 2024</p><img src="b" alt="Chair"><p class="fact-line">Chair · 2025</p></div>',false],
      ['<figure><img src="a" alt="Chair"><p class="fact-line">Chair</p><p class="fact-line">2025</p></figure>',true],
      ['<figure><svg aria-label="Chair"></svg><p class="fact-line">'+'x'.repeat(61)+'</p></figure>',true]
    ]) {
      fs.writeFileSync(file,original.replace('</main>',tail+'</main>'));
      const f=(await run(path.join(skill,'scripts/copy-lint.mjs'),[file,'--json'])).files[0].findings;
      test(f.some(x=>x.id==='caption' && x.sev==='FAIL')===fail,'copy checks the line count per picture and the 60-character limit');
    }
    fs.writeFileSync(file,original);
    fs.copyFileSync(file,path.join(tmp,'index.html'));
    for (const [mapping,expected] of [['',true],['Asks:\n- book rooms -> #a',true],['Asks:\n- book rooms -> #e',false]]) {
      fs.writeFileSync(notes,mapping);
      const results = (await run(path.join(skill,'scripts/copy-lint.mjs'),[file,'--json'])).files[0].findings;
      test(results.some(x=>x.id==='brief-ask' && x.sev==='FAIL') === expected,'ask block and booking control');
      const fromNotes=(await run(path.join(skill,'scripts/copy-lint.mjs'),[notes,'--json'])).files[0].findings;
      test(fromNotes.some(x=>x.id==='brief-ask' && x.sev==='FAIL') === expected,'direct copy.md input resolves the built page');
    }
  }
}
const assets=path.join(skill,'assets');
if (!variant || ['booking','headings'].includes(variant)) fs.symlinkSync(assets,path.join(tmp,'assets'),'junction');
if (!variant || variant==='finish') {
  for (const bad of [false,true]) {
    const file=path.join(tmp, bad?'finish-broken.html':'finish-open.html');
    const visual='<svg role="img" aria-label="Assembly drawing" width="100" height="100"><path d="M0 0h90v90H0z"/></svg>';
    const row='<div style="height:3px;border-top:1px solid #999"></div>';
    const link='<a href="#drawing">Assembly →</a> ';
    const text='Assembly instructions for the new workshop';
    const content=Array.from({length:4},(_,i)=>'<section style="height:100vh">'+
      (i===0?'<h1 style="font:64px/1 sans-serif;width:'+(bad?'260px':'95%')+'">'+text+'</h1>'+link.repeat(bad?4:3)+row.repeat(bad?35:34):'')+
      (!bad||i===0?visual:'')+'</section>').join('');
    fs.writeFileSync(file,'<!doctype html><meta name="viewport" content="width=device-width"><style>:root{--p-accent:#0055ff}body{margin:0;background:white}h1{margin:0}main{max-width:1280px;margin:auto}section{box-sizing:border-box}'+(bad?'section:first-child{background:#0055ff}':'')+'</style><main>'+content+'</main>');
    const report=await run(path.join(skill,'scripts/consistency.mjs'),[file,'--quick','--widths','1440,390','--json','--no-rhythm-expand','--no-sweep','--profile',profile,'--out',path.join(tmp,'still-'+bad)]);
    for (const view of report.widths.filter(v=>[1440,390].includes(v.width))) {
      assert.deepEqual(view.errors,[]);
      for (const id of ['accent-wide','arrow-links',...(view.width===1440?['picture-sparse','headline-narrow','rule-heavy']:[])]) {
        assert.equal(view.findings.some(f=>f.check===id && f.sev==='WARN'),bad,view.width+' '+id);
      }
    }
  }
}
if (!variant || variant==='booking') {
  const source=fs.readFileSync(path.join(assets,'layout','hero-place.html'),'utf8');
  const bar=source.match(/<form class="hero-book"[\s\S]*?<\/form>/)?.[0];
  assert.ok(bar,'shipped place hero contains the booking bar');
  const html=source.replace('class="hero hero--place"', 'class="hero hero--place" data-form="split"')
    .replace(/<img class="hero__bg"([^>]+)>/, '<picture class="hero__bg"><img$1></picture>')
    .replace(/<!--[\s\S]*?-->/g,c=>c.includes(bar)?'<div class="booking-slot">' + bar + '</div>':c)
    .replace(/((?:src|href)=")\.\.\//g,'$1assets/').replace(/((?:src|href)=")(img\/|layout\.css|layout\.js)/g,'$1assets/layout/$2')
    .replace('<div class="close__media">', '<form id="booking" aria-label="Table request"><label>Date<input type="date" name="date"></label><button>Request a table</button></form><div class="close__media">')
    .replace(/<div class="btn-row"><a[^>]*>See today's bake<\/a><\/div>/,'');
  const file=path.join(tmp,'booking.html');
  fs.writeFileSync(file,html);
  const rows=await run(path.join(skill,'assets/layout/check.mjs'),['--url',file,'--profile',profile,'--sizes','1440x900,390x844','--json','--no-stress']);
  for (const r of rows) {
    assert.ok(!r.findings.some(f=>['hero-fold','fold-cut'].includes(f.rule)),r.size+' shipped booking bar crosses the fold incorrectly');
    console.log('ok - '+r.size+' accepts the docked booking bar');
  }
  if (!process.argv.includes('--layout-only')) {
    const report=await run(path.join(skill,'scripts/consistency.mjs'),[file,'--quick','--type','place','--widths','1440,390','--json','--profile',profile,'--out',path.join(tmp,'booking-check')]);
    assert.ok(report.widths[0].frame?.heroBook, 'detect the dealt booking form');
    for(const w of report.widths) {
      assert.ok(!w.findings.some(f=>f.sev==='FAIL' && f.check==='container-edges' && /hero__bg/.test(f.sel)), 'split picture and its image occupy their five columns');
      assert.ok(!w.errors?.length && !w.findings.some(f=>f.sev==='FAIL' && ['hero-screen','hero-fill','fold-cut'].includes(f.check)),w.width+' production booking bar failed');
      console.log('ok - '+w.width+' production checker accepts the docked booking bar');
    }
  }
}
if (!variant || variant==='headings') {
  const items = '<ul><li><h4>Welcome!</h4></li></ul><table><tbody><tr><td><h4>About us</h4></td></tr></tbody></table>' +
    '<div class="cases"><div class="section-head"><h2>What we offer</h2></div><article><h3>Jordaan canal house</h3></article><article><h3>Oud-Zuid study</h3></article></div>' +
    '<div><div class="tile"><h3>Our mission</h3></div><div class="tile"><h3>Cherry and ash</h3></div></div>' +
    '<div class="faq"><div class="faq__item"><h3>Which areas do you work in?</h3><p>The north shore and the islands.</p></div></div>' +
    '<details open><summary>Other work</summary><h4>Learn more</h4></details>';
  const repeated = '<ul><li><h4>First visit</h4></li><li><h4>First visit!</h4></li></ul>' +
    '<h3>At the first sitting</h3><h3>At the first meeting</h3><h3>At the second sitting</h3>';
  const components = '<section id="booking-fixture" class="section"><div class="wrap"><h2>Workshop dates</h2>' +
    '<div class="closing__cta close--form" style="display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:24px">' +
    '<div class="section-head--center" style="grid-column:1/span 5;text-align:center"><h3 id="centred-close">Choose your dates</h3><p>Spring sessions.</p></div>' +
    '<form class="close__form" style="grid-column:1/-1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));padding:48px;gap:24px">' +
    '<label>Arrival<input type="date"></label><label>Departure<input type="date"></label><label>Guests<input type="number"></label>' +
    '<p id="form-note" style="grid-column:1/-1">Your dates go in the message.</p></form></div></div></section>' +
    '<section id="plans-fixture" data-own="plans"><div class="wrap"><h2>Allowance by traffic</h2><input type="range" aria-label="Traffic">' +
    '<div class="grid"><article data-fit class="plan span-6"><h3 id="plan-first" style="font-size:24px">Free <span class="fit" style="color:#555;margin-left:70px">Covers you</span></h3></article>' +
    '<article class="plan span-6"><h3 style="font-size:24px">Team <span class="fit" style="visibility:hidden;color:#555">Covers you</span></h3></article></div></div></section>' +
    '<section id="faq-fixture" class="section"><div class="wrap grid"><div class="section-head span-5"><h2>Before your visit</h2></div>' +
    '<div class="faq span-7"><div class="faq__item"><h3 style="font-size:18px">Can I bring a guest?</h3><p style="min-height:420px">A second seat is available.</p></div></div></div></section>';
  const host = (id,words)=>'<h2 id="'+id+'" data-moment="word-highlight">'+words+'</h2>';
  const mid = host('supply','The workshop stocks a replacement part for every tool that apprentices use on the course');
  const close = host('return','Bring your finished piece back to the studio for firing the following Wednesday afternoon');
  const start=fs.readFileSync(fixture(false),'utf8').replace('<html ', '<html data-temper="lively" ')
    .replace('</head>','<link rel="stylesheet" href="assets/moments/word-highlight/moment.css"><style>body h3{font-size:18px}@media(max-width:390px){#supply{max-width:12ch}}</style></head>')
    .replace('<h2>c</h2>',mid)
    .replace('<h2>a</h2>','<h2>Overview</h2><h3>Not in the fee</h3>')
    .replace('<h2>b</h2>','<h2>Features</h2><h3>Listed buildings: do you take them?</h3>')
    .replace('<h2>d</h2>','<h2>How a project runs</h2>' + items)
    .replace('<h2>e</h2>','<h2>What it costs</h2>' + repeated)
    .replace('</main>',components + '</main>')
    .replace('</body>','<footer class="footer closing"><div class="wrap"><div class="closing__cta">'+close+'</div><div class="closing__links">Wednesday, 14:00</div></div></footer><script type="module" src="assets/moments/moments.js"></script></body>');
  const file=path.join(tmp,'headings.html');
  fs.writeFileSync(file,start);
  function checkHeadings(terms) {
    const has = (severity, text) => terms.some(f => f.sev === severity && f.msg.includes(text));
    for (const text of ['Overview','Features','What we offer','First visit','at the first']) assert.ok(has('FAIL', text),text+' must fail');
    for (const text of ['How a project runs','What it costs']) assert.ok(has('WARN',text) && !has('FAIL',text),text+' is advisory');
    for (const text of ['Welcome!','About us','Jordaan canal house','Oud-Zuid study','Our mission','Cherry and ash','Which areas','Learn more','At the second']) {
      assert.ok(!has('FAIL',text) && (!has('WARN',text) || text === 'At the second'),text+' passes');
    }
  }
  const stockPage = path.join(tmp, 'stock-headings.html');
  const labels = ['Overview','Features','Our services','Solutions','Why choose us','Welcome','Learn more','About us','Our mission','What we offer','OUR SOLUTIONS!'];
  const specific = ['Features of the house','Welcome to Jordaan','About us and the builders'];
  fs.writeFileSync(stockPage, '<main>' + [...labels,...specific].map(text=>'<h2>'+text+'</h2>').join('') + '</main>');
  const stock = (await run(path.join(skill,'scripts/copy-lint.mjs'),[stockPage,'--json'])).files[0].findings.filter(f=>f.id==='copy-headings' && f.sev==='FAIL');
  for (const text of labels) assert.ok(stock.some(f=>f.hits[0].match === text), text+' is a stock label');
  for (const text of specific) assert.ok(!stock.some(f=>f.hits[0].match === text), text+' has a subject');
  const lint = (await run(path.join(skill,'scripts/copy-lint.mjs'),[file,'--json'])).files[0].findings;
  checkHeadings(lint.filter(f=>f.id==='copy-headings'));
  const inspect=()=>run(path.join(skill,'assets/layout/check.mjs'),['--url',file,'--profile',profile,'--sizes','1440x900,390x844','--json','--no-stress']);
  for (const w of await inspect()) {
    assert.ok(!w.findings.some(f=>['moment-target','moment-hidden','moment-text','one-heading'].includes(f.rule) && f.sev!=='WARN'),w.size+' heading moment rejected');
    assert.ok(!w.findings.some(f=>f.rule==='uneven-columns' && f.where.includes('faq-fixture')), 'FAQ introduction can be shorter than its answers');
    console.log('ok - '+w.size+' content and closing h2 hosts meet the moment contract');
  }
  const report=await run(path.join(skill,'scripts/consistency.mjs'),[file,'--quick','--type','place','--widths','1440,390','--json','--profile',profile,'--out',path.join(tmp,'heading-check')]);
  const phone = report.widths.find(w => w.width===390);
  assert.ok(phone.findings.some(f => f.check==='copy-length' && /#supply/.test(f.sel) && /lines/.test(f.msg)), 'wrap check measures the long phone heading');
  assert.ok(!phone.findings.some(f => f.check==='copy-length' && /Overview/.test(f.text)), 'one-line phone heading needs no wrap warning');
  const terms = report.widths.flatMap(w => w.findings).filter(f => f.check === 'copy-headings');
  checkHeadings(terms);
  for (const generic of ['Overview','Features']) assert.ok(terms.some(f => f.sev === 'FAIL' && f.msg.includes('"'+generic+'"')),generic+' still fails');
  assert.ok(!terms.some(f => /Not in the fee|Listed buildings/.test(f.msg)), 'specific fee and building headings pass');
  for(const w of report.widths) {
    assert.ok(!w.findings.some(f=>f.check === 'heading-scale' && f.sev === 'FAIL' && /h3 headings in/.test(f.msg) && /plan-first|plans-fixture|Covers you/.test(f.sel + f.text)), w.width+' pricing card titles keep their own size alongside FAQ questions');
    assert.ok(!w.findings.some(f=>f.sev==='FAIL' && (
      (['row-lines','container-edges'].includes(f.check) && /form-note|form\.close__form|centred-close/.test(f.sel)) ||
      (['stagger','hidden-content','still-wrong','run-on'].includes(f.check) && /fit|plan-first|Covers you|plans span/.test([f.sel,f.text,f.msg].join(' '))) ||
      (['text-only','no-visual'].includes(f.check) && f.sel.includes('faq-fixture')))), 'local form lines, selected plan label and FAQ answers pass');
    assert.ok(!w.errors?.length && !w.findings.some(f=>f.sev==='FAIL' && (['moment-text','one-heading','heading-scale','run-on'].includes(f.check) && /#(?:supply|return)/.test(f.sel||'') || f.check==='effect-kind' && /never run|never mounted/.test(f.msg))),w.width+' production heading moment rejected');
    console.log('ok - '+w.width+' production checker accepts mounted text at the h2 scale');
  }
  fs.writeFileSync(file,start.replace(mid,'<div data-moment="word-highlight"><span></span></div>'));
  for(const w of await inspect()) {
    assert.ok(w.findings.some(f=>f.rule==='moment-target'),w.size+' missing target escaped');
    console.log('ok - '+w.size+' a mount with no text target fails');
  }
}
if (!variant || variant === 'motion') {
  for (const treatment of ['heavy','still','loud']) {
    const bad = treatment === 'heavy', loud = treatment === 'loud';
    const file = path.join(tmp, 'motion-'+treatment+'.html');
    const hover = bad ? 'button:hover svg { translate: 3px; }' : 'button:hover { background: #ddd; }';
    const frames = bad ? '<h2><span>Frame</span> <span>and</span> <span>glass</span></h2>' : '<h2>Frame and glass</h2>';
    fs.writeFileSync(file, `<!doctype html><html lang="en" data-ready="1" data-temper="${loud?'loud':'quiet'}">
      <style>body{margin:0}section{min-height:100vh}button{padding:16px}button svg{width:12px;height:12px}
      ${hover} .hero p{display:inline-block} h2 span{display:inline-block}</style>
      <main><section class="hero" data-enter="${loud?'set-type':'still'}"><h1>Frames</h1><p>Blue</p><p>Red</p>
      <button>Choose a frame <svg viewBox="0 0 12 12"><circle cx="6" cy="6" r="3"/></svg></button></section>
      <section id="later" ${loud?'data-moment="lines-rise"':''}>${frames}<p>Local glass.</p></section></main>
      <script>const animate=el=>el.animate([{opacity:0,transform:'translateY(32px) scale(.9)'},{opacity:1,transform:'none'}],350);
      ${bad||loud?"document.querySelectorAll('.hero h1,.hero p').forEach(animate);":''}
      ${bad||loud?"addEventListener('scroll',()=>document.querySelectorAll('#later h2 span,#later h2').forEach(animate),{once:true});":''}
      </script></html>`);
    const rows = await run(path.join(skill,'assets/layout/check.mjs'),['--url',file,'--profile',profile,'--sizes','1440x900','--json','--no-stress']);
    fs.writeFileSync(path.join(tmp, 'motion-'+treatment+'-report.json'), JSON.stringify(rows));
    for (const rule of ['reveal-heavy','entrance-heavy','hover-shift']) {
      assert.equal(rows[0].findings.some(f => f.rule === rule && f.sev === 'WARN'),bad,treatment+' '+rule);
    }
    const lint = await run(path.join(skill,'scripts/motion-lint.mjs'),[file,'--json']);
    assert.equal(lint.files[0].findings.some(f => f.id === 'hover-shift'),bad);
  }
  const css = path.join(tmp, 'authored-motion.css');
  fs.writeFileSync(css, '@keyframes amplify { from { transform:scale(.8) translateY(32px) } to { transform:none } } .hero h1,.reveal h2 span { animation:amplify .3s } button:hover svg { translate:2px }');
  const staticFindings = async () => (await run(path.join(skill,'scripts/motion-lint.mjs'),[css,'--json'])).files[0].findings.map(f=>f.id);
  const heavy = await staticFindings();
  for (const id of ['entrance-heavy','reveal-heavy','hover-shift']) assert.ok(heavy.includes(id),id+' from authored CSS');
  fs.writeFileSync(css, '@keyframes fade {from{opacity:0}to{opacity:1}} .hero .copy,.reveal {animation:fade .3s} button:hover{background:#ddd}');
  for (const id of await staticFindings()) assert.ok(!['entrance-heavy','reveal-heavy','hover-shift'].includes(id));
  console.log('ok - heavy motion warns, still controls and permitted loud entrances pass');
}
console.log('Passed '+(variant || 'all')+' rules fixtures. Evidence in '+tmp);
