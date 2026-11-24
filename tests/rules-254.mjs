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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(root,'skills','taste-skill');
const tmp = fs.mkdtempSync(path.join(process.env.TASTE_SKILL_TMP || os.tmpdir(),'rules-254-'));
const profile = process.env.TASTE_SKILL_CHROME_PROFILE || path.join(tmp,'profile');
const starter = fs.readFileSync(path.join(skill,'assets','starter.html'),'utf8');
fs.copyFileSync(path.join(skill,'assets','system.css'),path.join(tmp,'system.css'));
fs.mkdirSync(path.join(tmp,'.taste-skill'));
const notes = path.join(tmp,'.taste-skill','copy.md');
const deadline = Date.now()+9*60*1000;
async function run(script,args) {
  const r = await runCheck([script,...args],tmp,Math.max(1,Math.min(300000,deadline-Date.now())));
  if (r.error || r.timedOut || ![0,1].includes(r.status)) throw Error(String(r.error || r.stderr));
  return JSON.parse(r.stdout);
}
const section = (id,body,cls='',own=true) => '<section id="'+id+'" class="section '+cls+'" '+(own?'data-own="'+id+'"':'')+'><div class="wrap"><h2>'+id+'</h2>'+body+'</div></section>';
function fixture(bad) {
  const label = bad ? 'broken' : 'good', file = path.join(tmp,label+'.html');
  const head = '<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Workshop</title><link rel="stylesheet" href="system.css"><style>body{margin:0}main>.hero{display:block;height:calc(100vh + 240px);min-height:0;padding:0}main>.hero .wrap{display:block;height:auto}.hero h1{margin:0;height:90px;padding-top:16px}.hero__window{margin:clamp(250px,32vh,300px) 0 0;height:650px;background:#ddd}.section h2,.section p{margin:0}.section :is(button,input){min-height:44px}#d figure{margin:16px 0 0;width:100%}#d figure svg{display:block;width:100%;height:240px}'+(bad ? 'main>.hero{height:75vh;overflow:clip}#a{padding-bottom:24px}#b{padding-top:24px;padding-bottom:200px}#c{padding-top:200px}#d .gone{opacity:0}#d{min-height:260vh}' : '')+'</style></head>';
  const figure = '<figure><svg width="240" height="120" viewBox="0 0 240 120" preserveAspectRatio="none" role="img" aria-label="Room plan"'+(bad?' data-lookalike="replica logo"':'')+'><rect x="1" y="1" width="238" height="118" fill="#d9e6e1"/><path d="M8 8h90v104H8z M104 8h124v48H104z M104 64h124v48H104z" fill="#40877e"/></svg><figcaption class="fact-line">'+(bad ? 'Illustrative photograph' : 'Weir Room · 28 m²')+'</figcaption></figure>';
  const tabs = '<div role="tablist" aria-label="Room"><button role="tab" aria-selected="true" aria-controls="weir">Weir</button><button role="tab" aria-selected="false" aria-controls="mill">Mill</button></div><div id="weir" role="tabpanel">River room, 28 m²</div><div id="mill" role="tabpanel" hidden>Mill room, 36 m²</div>';
  const tabScript = 'document.querySelectorAll("[role=tab]").forEach(b=>b.onclick=()=>{for(const t of document.querySelectorAll("[role=tab]")){t.setAttribute("aria-selected",String(t===b));document.getElementById(t.getAttribute("aria-controls")).hidden=t!==b}})';
  const hero = '<section class="hero hero--peek"><div class="wrap"><h1>The workshop</h1><div class="hero__window" role="img" aria-label="Workshop schedule"><svg viewBox="0 0 640 300" width="100%" height="100%" aria-hidden="true"><rect width="640" height="300" fill="#dce7e2"/><g stroke="#506963" stroke-width="2"><path d="M40 70h560M40 122h560M40 174h560M40 226h560"/></g><path fill="#376b63" d="M80 48h190v20H80zM200 100h230v20H200zM340 152h195v20H340zM160 204h160v20H160z"/></svg></div></div></section>';
  const parts = [
    section('a','<p>Join the team.</p>','',false),
    section('b','<p>Our process.</p>','',false),
    section('c','<p>The drawing.</p>','',false),
    section('d','<p class="gone">Hours and rates</p><strong data-count="48">'+(bad?'24':'48')+'</strong><b id="observed">'+(bad?'8':'16')+'</b><div><span style="position:sticky;top:8px">Workshop hours</span></div>'+tabs+figure+(bad?'':'<span data-auto-advance></span><button data-pause>Pause schedule</button>')),
    section('e','<form><label>Email<input type="email"></label><button>Book a room</button></form>',bad?'':'ground-surface',!bad),
    section('f',bad?'<div data-auto-advance></div>':'<p>Route map</p>',bad?'':'section--thin',false),
    section('g','<p>Visit us.</p>','',false)
  ];
  if (!bad) for (const i of [2,6]) parts[i]=parts[i].replace('class="section ','class="section ground-surface ');
  // Keep the timer in the single own section on the bad page.
  if (bad) parts[3] = parts[3].replace('</section>','<div data-auto-advance></div></section>');
  const html = starter.replace(/<!--[\s\S]*?-->/g,'').replace(/<html[^>]*>/i,'<html lang="en" data-type="place" data-density="regular">').replace(/<head>[\s\S]*?<\/head>/i,head).replace(/<body[^>]*>[\s\S]*?<\/body>/i,'<body><main>'+hero+parts.join('')+'</main><script>'+tabScript+';const [first,second]=document.querySelectorAll("[role=tab]");second.click();if(document.getElementById("mill").hidden || !document.getElementById("weir").hidden)console.error("Room tab failed");first.click();document.getElementById("observed").textContent="16";document.querySelector(".gone").style.opacity=1</script></body>').replace('document.querySelector(".gone").style.opacity=1','document.querySelector(".gone")?.style.setProperty("opacity","1")');
  fs.writeFileSync(file,html);
  return file;
}
const variant = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only')+1] : '';
if (variant && !['good','broken','booking','bands','headings'].includes(variant)) throw Error('Use --only good, broken, booking, bands or headings');
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
    for (const id of ['section-air','empty-band','ground-flat','visual-caption','still-wrong','own-timer','hero-fold','own-count','pinned','brand-lookalike']) {
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
      for (const name of ['ground-flat','own-count','own-timer','still-wrong','empty-band','visual-caption']) {
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
if (!variant || variant==='booking') {
  const source=fs.readFileSync(path.join(assets,'layout','hero-place.html'),'utf8');
  const bar=source.match(/<form class="hero-book"[\s\S]*?<\/form>/)?.[0];
  assert.ok(bar,'shipped place hero contains the booking bar');
  const html=source.replace(/<!--[\s\S]*?-->/g,c=>c.includes(bar)?bar:c)
    .replace(/((?:src|href)=")\.\.\//g,'$1assets/').replace(/((?:src|href)=")(img\/|layout\.css|layout\.js)/g,'$1assets/layout/$2')
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
    for(const w of report.widths) {
      assert.ok(!w.errors?.length && !w.findings.some(f=>f.sev==='FAIL' && ['hero-screen','hero-fill','fold-cut'].includes(f.check)),w.width+' production booking bar failed');
      console.log('ok - '+w.width+' production checker accepts the docked booking bar');
    }
  }
}
if (!variant || variant==='headings') {
  const host = (id,words)=>'<h2 id="'+id+'" data-moment="word-highlight">'+words+'</h2>';
  const mid = host('supply','The workshop stocks a replacement part for every tool that apprentices use on the course');
  const close = host('return','Bring your finished piece back to the studio for firing the following Wednesday afternoon');
  const start=fs.readFileSync(fixture(false),'utf8')
    .replace('</head>','<link rel="stylesheet" href="assets/moments/word-highlight/moment.css"></head>')
    .replace('<h2>c</h2>',mid)
    .replace('</body>','<footer class="footer closing"><div class="wrap"><div class="closing__cta">'+close+'</div><div class="closing__links">Wednesday, 14:00</div></div></footer><script type="module" src="assets/moments/moments.js"></script></body>');
  const file=path.join(tmp,'headings.html');
  fs.writeFileSync(file,start);
  const inspect=()=>run(path.join(skill,'assets/layout/check.mjs'),['--url',file,'--profile',profile,'--sizes','1440x900,390x844','--json','--no-stress']);
  for (const w of await inspect()) {
    assert.ok(!w.findings.some(f=>['moment-target','moment-hidden','moment-text','one-heading'].includes(f.rule) && f.sev!=='WARN'),w.size+' heading moment rejected');
    console.log('ok - '+w.size+' content and closing h2 hosts meet the moment contract');
  }
  const report=await run(path.join(skill,'scripts/consistency.mjs'),[file,'--quick','--type','place','--widths','1440,390','--json','--profile',profile,'--out',path.join(tmp,'heading-check')]);
  for(const w of report.widths) {
    assert.ok(!w.errors?.length && !w.findings.some(f=>f.sev==='FAIL' && (['moment-text','one-heading','heading-scale'].includes(f.check) && /#(?:supply|return)/.test(f.sel||'') || f.check==='effect-kind' && /never run|never mounted/.test(f.msg))),w.width+' production heading moment rejected');
    console.log('ok - '+w.width+' production checker accepts mounted text at the h2 scale');
  }
  fs.writeFileSync(file,start.replace(mid,'<div data-moment="word-highlight"><span></span></div>'));
  for(const w of await inspect()) {
    assert.ok(w.findings.some(f=>f.rule==='moment-target'),w.size+' missing target escaped');
    console.log('ok - '+w.size+' a mount with no text target fails');
  }
}
console.log('Passed '+(variant || 'all')+' rules fixtures. Evidence in '+tmp);
