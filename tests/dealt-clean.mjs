#!/usr/bin/env node
// Enumerate the live dealer catalogue. Run one fixture with --only, or all serially.
// --isolate <composition> measures one recipe in the shell, retaining a preceding section when required.
// --reuse points at saved kit-clean tables for an already measured shipped page.
// The complete page findings are retained, including a demo's surrounding scaffold.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const skill = path.resolve(dir,'../skills/taste-skill');
const assets = path.join(skill,'assets');
const args = process.argv.slice(2);
const arg = (name,fallback) => args.includes('--'+name) ? args[args.indexOf('--'+name)+1] : fallback;
const out = path.resolve(arg('out',path.join(process.env.TASTE_SKILL_TMP || os.tmpdir(),'dealt-clean')));
const profile = process.env.TASTE_SKILL_CHROME_PROFILE || arg('profile',path.join(out,'profile'));
const text = f => fs.readFileSync(f,'utf8');
const json = f => JSON.parse(text(f));
const dealer = text(path.join(skill,'scripts/start.mjs'));
const comps = [...new Set([...dealer.match(/const COMPS = \{([\s\S]*?)\n\};/)[1].matchAll(/:\s*'([^']+)'/g)].flatMap(m=>m[1].split('|')))];
const framePool = prefix => [...new Set((dealer.match(new RegExp('^  '+prefix+': \\{[\\s\\S]+?\\},','m'))?.[0] || '').match(new RegExp(prefix+'-[a-z]+','g')))];
const navs = framePool('nav'), footers = framePool('footer'), closes = [...new Set([...framePool('close'),'close-form'])];
const heroes = json(path.join(assets,'layout/heroes.json')).heroes.map(h=>h.id);
const moments = json(path.join(assets,'moments/index.json')).moments.filter(m=>m.weight>0);
const jobs = [
  ...[...heroes,'peek-demo'].map(id=>({name:'hero-'+id,parts:['hero-'+id],page:'assets/layout/hero-'+id+'.html'})),
  ...moments.map(({id,pages})=>{
    const page='assets/moments/'+id+'/demo.html', html=text(path.join(skill,page));
    const kind=html.match(/<html\b[^>]*\bdata-type="([^"]+)"/i)?.[1] || html.match(/<meta name="page-(?:kind|type)" content="([^"]+)"/i)?.[1] || pages[0];
    return {name:'moment-'+id,parts:[id],page,kind};
  }),
  ...closes.map((close,i)=>({name:'recipe-'+(i+1),nav:navs[i%navs.length],footer:footers[i%footers.length],close,
    comps:comps.filter((c,j)=>c!=='close-form' && j%closes.length===i)}))
];
for (const j of jobs.filter(j=>j.comps)) j.parts=[...j.comps,j.nav,j.footer,j.close];
jobs.push(...comps.filter(id=>id!=='close-form').map(id=>({name:'isolated-'+id,isolated:id,parts:[id],nav:'nav-mega',footer:'footer-columns',close:'close-type',comps:[id]})));
if (args.includes('--list')) { for (const j of jobs) console.log(j.name+'\t'+j.parts.join(', ')); process.exit(0); }
fs.mkdirSync(out,{recursive:true});
const site=path.join(out,'site'), link=path.join(site,'assets');
fs.mkdirSync(site,{recursive:true});
if (!fs.existsSync(link)) fs.symlinkSync(assets,link,'junction');
if (fs.realpathSync(link)!==fs.realpathSync(assets)) throw Error('Unexpected asset link in '+site);
const starter=text(path.join(assets,'starter.html'));
const base=text(path.join(assets,'layout/hero-split.html'))
  .replace(/((?:src|href)=")\.\.\//g,'$1assets/').replace(/((?:src|href)=")(img\/|layout\.css|layout\.js)/g,'$1assets/layout/$2');
const photos=json(path.join(assets,'layout/img/credits.json')).photos.filter(p=>/coffee|latte|cappuccino|dripper/i.test(p.alt));
const titles={'split-7-5':'The morning service','split-5-7':'Coffee for an evening reception','split-6-6':'Visit the roastery',mirrored:'From Leith to the venue','list-tall':'Coffee bar packages','bleed-panel':'Coffee services','offset-pair':'Coffee menu','three-up':'Three ways to brew',wall:'Coffee bar gallery',story:'About the roastery',row:'Service options',side:'Bar hire', 'street-large':'Visit the Leith roastery','form-photo':'Book a tasting','form-band':'Booking dates'};
let imageCount;
const pic=(classes='')=>{
  const i=imageCount++%photos.length;
  return '<img class="'+classes+'" src="assets/layout/img/'+photos[i].file+'" alt="'+photos[i].alt.replaceAll('"','&quot;')+'" loading="lazy">';
};
const strip=s=>s.replace(/<!--[\s\S]*?-->/g,'');
function template(name) {
  const body=starter.match(new RegExp('<template data-part="'+name+'">([\\s\\S]*?)</template>'))?.[1];
  if (!body) throw Error('Missing starter template '+name);
  const translate={'Name':'Saltmarsh','Company':'Saltmarsh','Main action':'Ask for a date','section id':'packages','Street':'Commercial Street','district':'Leith','street%20district%20city':'Commercial%20Street%20Leith','Europe/Berlin':'Europe/London','Mon to Fri':'Mon to Fri','8 to 18':'8 to 18','Sat':'Sat','9 to 16':'9 to 16','sources used':'Wikimedia Commons','hello@brand.example':'book@saltmarsh.example','what it shows':'Rosetta latte art in a white cup on a grey slate table','client | library | shoot':'library','what it is of':'coffee','Label':'Service','Fact':'Four hours','Request a table':'Ask for a date'};
  return strip(body).replace(/src="\[[^"]+\]"/g,'src="assets/layout/img/photo-c7.jpg"').replace(/\[([^\]]+)\]/g,(_,key)=>{
    if (key.startsWith('Something new')) return 'From the first cup to closing';
    if (key.startsWith('One line')) return 'Four hours of service from £480.';
    if (name==='booking-form' && key==='Name') return 'Name';
    return translate[key] || key;
  });
}
function composition(id) {
  const head='<h2>'+titles[id]+'</h2>', lead='<p>Two baristas bring the espresso machine, beans, cups and milk to the venue.</p>';
  const rates=[['Morning bar','Four hours, up to 100 cups','£480'],['Full-day bar','Eight hours with a second bag of beans','£860'],['Office service','Two hours for the morning shift','£290'],['Evening reception','Three hours after dinner','£390']];
  const rows='<ul class="rows">'+rates.map(([name,detail,rate])=>'<li><span class="rows__name">'+name+'<small>'+detail+'</small></span><span class="rows__value">'+rate+'</span></li>').join('')+'</ul>';
  const figure=cls=>'<figure class="'+cls+'">'+pic()+'</figure>';
  const section=(body,cls='')=>'<section class="section '+cls+'" id="'+id+'">'+body+'</section>';
  if (!titles[id]) throw Error('No composition fixture for '+id);
  if (id==='bleed-panel') return section(pic('layer')+'<div class="wrap"><div class="comp-panel">'+head+lead+'<a class="link" href="#book">Ask for a date</a></div></div>','comp-bleed');
  if (id==='row' || id==='side') {
    const items=['Morning bar, £480','Evening reception, £390','Full-day service, £860'].map(t=>'<article class="span-4">'+figure('tile__media')+'<h3>'+t+'</h3><a class="link" href="#book">Ask for a date</a></article>').join('');
    return id==='row' ? section('<div class="wrap"><div class="section-head">'+head+'</div><div class="grid">'+items+'</div></div>') :
      section('<div class="wrap grid grid--top"><div class="span-6 split-col">'+head+lead+'<a class="link split-col__end" href="#book">Ask for a date</a></div><div class="span-6">'+rows+'</div></div>');
  }
  if (['offset-pair','three-up','wall'].includes(id)) {
    const columns=id==='offset-pair'?[7,5]:[4,4,4];
    return section('<div class="wrap"><div class="section-head">'+head+'</div><div class="grid '+(id==='offset-pair'?'comp-offset':'comp-three')+'">'+columns.map(n=>figure('media span-'+n)).join('')+'</div></div>');
  }
  if (id.startsWith('form-')) {
    const form=template('booking-form').replace(/\bf-([\w-]+)/g,id+'-$1');
    if (id==='form-photo') return section('<div class="wrap grid grid--top"><div class="span-7 split-col">'+head+form+'</div>'+figure('pl-photo span-5')+'</div>');
    const details='<p>Tell us the date, guest count and room. We will confirm which bar fits the space.</p><p class="split-col__end"><strong>Morning bar · £480</strong><br>Two baristas, four hours and up to 100 cups.</p>';
    return section('<div class="wrap grid grid--top"><div class="span-5 split-col">'+head+details+'</div><div class="span-7">'+form+'</div></div>',id==='form-band'?'ground-surface':'');
  }
  const n=id==='split-7-5'?7:id==='split-5-7'||id==='side'?5:6;
  return section('<div class="wrap grid grid--top '+(id==='mirrored'?'grid--mirror':'')+'"><div class="span-'+n+'">'+head+
    (id==='street-large'?'<p class="type-moment">Commercial Street</p>':lead)+(id==='list-tall' ? rows :
      id==='split-7-5' ? '<p>Choose a service length and guest count.</p>'+rows :
      id==='mirrored' ? '<p>We load the cart in Leith and set up on site before the first guests arrive.</p><p><strong>At the venue</strong><br>Allow one clear doorway and power beside the bar.</p>' :
      id==='split-5-7' ? '<p><strong>Evening reception · £390</strong><br>Three hours of espresso service after dinner.</p>' :
      id==='story' ? '<p>We roast the beans in Leith before each service and bring the grinder to the venue. The baristas dial in the espresso before guests arrive.</p>' :
      id==='street-large' ? '<p>Leith, Edinburgh<br>Monday to Friday, 8 to 18. Saturday, 9 to 16.</p>' :
      id==='split-6-6' ? '<p><strong>Commercial Street, Leith</strong><br>Monday to Friday, 8 to 18. Saturday, 9 to 16.</p><a class="link" href="#book">Arrange a tasting</a>' : '')+
    '</div>'+figure('pl-photo span-'+(12-n))+'</div>');
}
function recipe(j) {
  imageCount=0;
  let page=base;
  if (['nav-centre','nav-split'].includes(j.nav)) page=page.replace('<header class="nav">','<header class="nav nav--'+j.nav.slice(4)+'">');
  if (j.nav==='nav-mega') {
    const card='<a class="menu-card span-4" href="#packages"><div class="panel panel--flush">'+pic('frame__img')+'</div><span class="t-card">Coffee bar packages</span></a>';
    page=page.replace(/(<div class="menu-col span-3">[\s\S]+?<\/div>\s*<div class="menu-col span-3">[\s\S]+?<\/div>)/,'$1'+card);
  }
  if (['nav-cards','nav-split'].includes(j.nav)) {
    const menu=['Weddings','Office mornings','Parties'].map(t=>'<a class="menu-card span-4" href="#packages"><div class="panel panel--flush">'+pic('frame__img')+'</div><span class="t-card">'+t+'</span></a>').join('');
    page=page.replace(/<div class="menu-col span-3">[\s\S]+?<\/div>\s*<div class="menu-col span-3">[\s\S]+?<\/div>/,menu);
  }
  page=page.replace('<header class="nav','<header id="'+j.nav+'" class="nav');
  const fc={'footer-statement':'footer--statement','footer-dark':'footer--dark ground-inverse','footer-visit':'footer--visit','footer-columns':''}[j.footer];
  page=page.replace('<footer class="footer"','<footer class="footer '+(j.footer==='footer-statement'?'':fc)+'"')
    .replace('class="section closing"','class="section closing '+(j.footer==='footer-statement'?fc:'')+'"');
  if (j.footer==='footer-statement') page=page.replace(/data-type="service"/,'data-type="tech"').replace(/(name="(?:page-type|page-kind|site-kind)" content=")[^"]+/g,'$1tech');
  if (j.footer==='footer-visit') page=page.replace(/<div class="closing__links">[\s\S]*?(?=<\/footer>)/,template('links-visit')+'</div>\n');
  if (j.close!=='close-type') {
    let close=template(j.close);
    if (j.close==='close-form') close=close.replace(/<form[\s\S]*?<\/form>/,template('booking-form').replace('class="form"','class="form close__form"'));
    page=page.replace(/<div class="closing__cta close--type">[\s\S]*?(?=\s*<\/div>\s*<\/section>)/,close);
  }
  page=page.replace('<div class="closing__cta ','<div id="'+j.close+'" class="closing__cta ').replace('<div class="closing__links">','<div id="'+j.footer+'" class="closing__links">');
  if (j.isolated==='bleed-panel') {
    // The photographed panel requires a content section between it and the hero.
    page=page.replace('<section class="section closing',composition(j.isolated)+'<section class="section closing');
  } else if (j.isolated) {
    page=page.replace(/<section class="section" id="packages"[\s\S]*?<\/section>/,composition(j.isolated))
      .replaceAll('href="#packages"','href="#'+j.isolated+'"');
  } else {
    const sections=j.comps.map((id,i)=>{
      const section=composition(id);
      return i===0 && ['footer-columns','footer-visit'].includes(j.footer) ? section.replace('class="section ','class="section ground-surface ') : section;
    });
    page=page.replace('<section class="section closing',sections.join('\n')+'<section class="section closing');
  }
  const file=path.join(site,j.name+'.html');
  fs.writeFileSync(file,page);
  if (j.footer==='footer-visit') for (const [name,label] of [['privacy','Booking privacy'],['credits','Image credits']]) fs.writeFileSync(path.join(site,name+'.html'),'<html lang="en"><title>'+label+'</title><main><h1>'+label+'</h1></main></html>');
  return file;
}
const reuse=arg('reuse','');
const cached=new Map();
if (reuse) for (const f of fs.readdirSync(reuse).filter(f=>/^kit-.+\.json$/.test(f))) {
  for (const r of json(path.join(reuse,f))) if (!r.error && !r.notCheckedAt?.length) cached.set(r.page,r);
}
const only=arg('only','');
const isolated=arg('isolate','');
if(isolated && (!comps.includes(isolated) || isolated==='close-form')) throw Error('Use --isolate with a composition; close-form is tested as a close.');
const selected=isolated ? jobs.filter(j=>j.isolated===isolated) :
  jobs.filter(j=>!only || j.name===only || j.parts.includes(only));
if (!selected.length) throw Error('No fixture matches '+only);
let result=0;
for (const j of selected) {
  const file=path.join(out,j.name+'.json');
  if (args.includes('--resume') && fs.existsSync(file)) {
    const row=json(file).rows[0];
    if (!row.error && !row.notCheckedAt?.length) { if (Object.keys(row.fails).length) result=1; continue; }
  }
  let rows=cached.has(j.page)?[cached.get(j.page)]:null;
  if (!rows) {
    const temp=path.join(out,j.name+'-kit.json');
    fs.rmSync(temp,{force:true});
    const select=j.page?['--demos','--only',j.page]:['--page',recipe(j)];
    const r=spawnSync(process.execPath,[path.join(dir,'kit-clean.mjs'),...select,...(j.kind?['--type',j.kind]:[]),'--profile',profile,'--out',path.join(out,'evidence'),'--save',temp],{stdio:'inherit',env:{...process.env,TASTE_SKILL_CHROME_PROFILE:profile},windowsHide:true});
    if (r.error || !fs.existsSync(temp)) throw Error(String(r.error||'no kit-clean result for '+j.name));
    rows=json(temp);
  }
  fs.writeFileSync(file,JSON.stringify({parts:j.parts,page:j.page||j.name,kind:j.kind,rows},null,2));
  const row=rows[0];
  console.log(j.parts.join(', ')+' | '+(row.error||Object.keys(row.fails).join(', ')||'clean'));
  if (row.error || row.notCheckedAt?.length) result=2;
  else if (Object.keys(row.fails).length && !result) result=1;
}
process.exitCode=result;
