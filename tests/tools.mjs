import {encode} from '../skills/taste-skill/tools/png.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
const skill=fileURLToPath(new URL('../skills/taste-skill/',import.meta.url)), dir=path.join(skill,'tools');
const names=['gradient','grain','pattern','shape','shadow','surface','divider','palette','device','grade','chart','frame','scribble','object','typescale','share'];
const palettes=JSON.parse(fs.readFileSync(path.join(skill,'library/palettes.json')));
let count=0;
for(const file of fs.readdirSync(dir,{recursive:true}).filter(f=>/\.[cm]?js$/.test(f))){
 assert.doesNotMatch(fs.readFileSync(path.join(dir,file),'utf8'),/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(|(?:node:)?child_process/);
}
for(const name of names){
 const tool=await import(pathToFileURL(path.join(dir,'lib',name+'.js')));
 for(const preset of tool.presets)for(const seed of [1,11,73]){
 const o={preset,seed,values:[2,5],name:'Plane Press',headline:'Orbital studies',palette:palettes[seed===11?11:8]}, a=tool.generate(o);
 assert.deepEqual(a,tool.generate(o));assert(Buffer.byteLength(a.css)<=6144,name+' '+preset+' CSS');
 assert(Buffer.byteLength(a.svg)<=20480,name+' '+preset+' SVG');
 for(const uri of (a.css+' '+a.svg).matchAll(/data:image\/[^"'\s)]+/g))assert(uri[0].length<=12288);
 if(name==='share'){
   assert(a.svg.includes('viewBox="0 0 1200 630"'));
   assert(a.icon.includes('viewBox="0 0 24 24"'));
   assert.throws(()=>tool.generate({...o,mark:'<script>'}),/mark/);
   if(preset==='mark'){
     const png=encode(tool.rasterize(o));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
   }
 }
 if(name==='typescale'){
   assert.equal(a.metrics.length,6);assert(a.warnings.length>0);
   for(const row of a.metrics)assert(row.desktop>=row.phone&&row.cpl.phone>0);
   if(preset==='product')assert.deepEqual(a.metrics.map(r=>r.desktop),[64,40,20,18,16,14]);
 }
 if(name==='object'){
   assert.notEqual(a.svg,tool.generate({...o,seed:seed+1}).svg);
   const moving=tool.generate({...o,motion:'drift'});
   assert(!a.css.includes('animation:')&&moving.css.includes('56s')&&moving.css.includes('.is-m-off')&&moving.css.includes('prefers-reduced-motion'));
 }
 if(name==='scribble'){
   assert.notEqual(a.svg,tool.generate({...o,seed:seed+1}).svg);
   assert(!a.svg.includes('data-m-draw'));
   assert(tool.generate({...o,draw:'on'}).svg.includes('data-m-draw'));
 }
 if(name==='chart'){
   assert.throws(()=>tool.generate({preset}),/numbers/);
   assert.throws(()=>tool.generate({...o,values:'2,,5'}),/numbers/);
   assert.throws(()=>tool.generate({...o,labels:['wrong count']}),/label/);
   const safe=tool.generate({...o,labels:['<start>','&end'],unit:'km'});
   assert(safe.svg.includes('&lt;start&gt;')&&safe.svg.includes('&amp;end'));
   if(preset==='progress-ring')assert.throws(()=>tool.generate({...o,values:[6,5]}),/capacity/);
 }
 if(name==='device'){
   for(const theme of tool.choices.theme)for(const address of tool.choices.address){
     const frame=tool.generate({...o,theme,address});
     assert(frame.css.includes('.ts-device > .device-screen'));
     assert(frame.svg.includes('data-device-screen') && frame.slot.width>0 && frame.slot.height>0);
     assert(frame.css.length<=6144 && frame.svg.length<=20480);
   }
 }
 if(name==='palette'){
    const {contrast}=await import(pathToFileURL(path.join(dir,'lib/common.js')));
    for(const brand of ['#fff','#000','#808080','#ffff00','#00ffff','#fe0101','#7a3cff']){
      for(const paper of tool.choices.paper)for(const temperature of tool.choices.temperature){
        const out=tool.generate({...o,brand,paper,temperature,strength:seed===11?0:1,second:'#37815f'});
        const p=out.json;
        assert(contrast(p.ink,p.bg)>=7 && contrast(p.muted,p.bg)>=7 && contrast(p.muted,p.bg)<=10);
        assert(contrast(p.accentInk,p.accent)>=4.5 && contrast(p.accent,p.bg)>=3);
        assert(contrast(p.muted,p.surface)>=7 && contrast(p.ink,p.surface)>=7);
        assert.deepEqual(Object.keys(p),Object.keys(palettes[0]));
      }
    }
  }
 if(name==='surface')assert(a.ratio>=7,'surface contrast');
 if(name==='gradient')for(const zone of ['left','centre','top'])assert(tool.generate({...o,zone}).ratio>=7);
 count++;
 }}
const gradient=await import(pathToFileURL(path.join(dir,'lib/gradient.js')));
for(const preset of gradient.showPresets)for(const seed of [1,11,73]){
 const opts={preset,seed,palette:palettes[seed===11?11:8]},a=gradient.generate(opts);
 assert.deepEqual(a,gradient.generate(opts));assert(a.ratio>=7);
 assert(Buffer.byteLength(a.css)<=6144 && Buffer.byteLength(a.svg)<=20480,preset+' export size');
 if(a.pixels){const file=encode(a);assert(file.length<=48000);assert.deepEqual(file,encode(gradient.generate(opts)))}
}
console.log(count+' static cases and '+(gradient.showPresets.length*3)+' show preset/seed cases passed');
const tmp=process.env.TASTE_SKILL_TMP||os.tmpdir();
const getProfile=()=>process.argv.includes('--profile')?process.argv[process.argv.indexOf('--profile')+1]:fs.mkdtempSync(path.join(tmp,'toolbox-chrome-'));
const exportsDir=fs.mkdtempSync(path.join(tmp,'show-export-'));
const basename='fold proof',hues='#19557a,#43718d,#319b9e,#6ac9a8';
const cli=spawnSync(process.execPath,[path.join(dir,'gradient.mjs'),'--tier','show','--preset','selvedge','--seed','7','--hues',hues,'--out',path.join(exportsDir,basename+'.css')],{encoding:'utf8',windowsHide:true});
assert.equal(cli.status,0,cli.stderr);
const expected=gradient.generate({preset:'selvedge',seed:'7',hues,picture:'fold%20proof.png',palette:palettes.find(p=>p.id==='white-link-blue')});
assert.equal(fs.readFileSync(path.join(exportsDir,basename+'.css'),'utf8'),expected.css);
assert.deepEqual(fs.readFileSync(path.join(exportsDir,basename+'.png')),encode(expected));
function runTool(name,args) {
  return spawnSync(process.execPath,[path.join(dir,name+'.mjs'),...args],{encoding:'utf8',windowsHide:true});
}
const chartFile=path.join(exportsDir,'measured series.json');
fs.writeFileSync(chartFile,JSON.stringify({preset:'bars',values:[-2,0,4],labels:['Before','At zero','After'],unit:'mm',title:'Offset'}));
const chartCli=runTool('chart',['--data',chartFile]);
assert.equal(chartCli.status,0,chartCli.stderr);
assert(chartCli.stdout.includes('<title>Offset</title>') && chartCli.stdout.includes('Before: -2 mm'));
const invalidChart=runTool('chart',['--preset','donut','--values','0,0']);
assert.notEqual(invalidChart.status,0);
const iconDir=path.join(exportsDir,'identity');
const shareCli=runTool('share',['--preset','mark','--name','Plane Press','--mark','dots','--icons',iconDir,'--out',path.join(exportsDir,'mark.png')]);
assert.equal(shareCli.status,0,shareCli.stderr);
for(const size of [16,32,180]){
 const bitmap=fs.readFileSync(path.join(iconDir,'icon-'+size+'.png'));
 assert.equal(bitmap.readUInt32BE(16),size);assert.equal(bitmap.readUInt32BE(20),size);
}
assert(fs.readFileSync(path.join(iconDir,'favicon.svg'),'utf8').includes('<rect'));
const brandCli=runTool('palette',['--brand','#fc0','--preset','dark','--format','json']);
assert.equal(brandCli.status,0,brandCli.stderr);
assert.deepEqual(Object.keys(JSON.parse(brandCli.stdout)),Object.keys(palettes[0]));
assert.match(brandCli.stderr,/label [\d.]+:1/);
fs.rmSync(exportsDir,{recursive:true,force:true});
if (process.argv.includes('--static')) process.exit(0);
const browserProfile=getProfile();
const chrome=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&fs.existsSync(p));assert(chrome,'Chrome is required');
const child=spawn(chrome,['--headless=new','--user-data-dir='+browserProfile,'--remote-debugging-pipe','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
const pending=new Map(),errors=[];let sequence=0,remaining='',sessionId;
child.stdio[4].setEncoding('utf8');
child.stdio[4].on('data',chunk=>{
 const messages=(remaining+chunk).split('\0');remaining=messages.pop();
 for(const raw of messages){const m=JSON.parse(raw);if(m.id)pending.get(m.id)?.(m);
 if(m.method==='Runtime.exceptionThrown'||m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params)}
});
function send(method,params={},session=sessionId){return new Promise((resolve,reject)=>{
 const id=++sequence;const timeout=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'))},45000);
 pending.set(id,m=>{clearTimeout(timeout);pending.delete(id);if(m.error)reject(Error(m.error.message));else resolve(m.result)});
 child.stdio[3].write(JSON.stringify({id,method,params,sessionId:session})+'\0');
})}
async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});assert(!r.exceptionDetails,r.exceptionDetails?.exception?.description);return r.result.value}
const exited=new Promise(r=>child.once('exit',r));
function stopOwnedBrowser(){
 if(child.exitCode!==null||!child.pid)return;
 if(process.platform==='win32')spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore',timeout:15000});
 else child.kill('SIGKILL');
}
const guard=setTimeout(stopOwnedBrowser,8*60*1000);
try{
 const {targetId}=await send('Target.createTarget',{url:'about:blank'});
 ({sessionId}=await send('Target.attachToTarget',{targetId,flatten:true}));await send('Runtime.enable');
 // Keep the layout viewport identical to the screenshot viewport. A disappearing
 // Windows scrollbar otherwise moves the centred preview by half a scrollbar.
 await send('Emulation.setScrollbarsHidden',{hidden:true});
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:pathToFileURL(path.join(dir,'lab.html')).href});
 for(let i=0;i<100&&!await evaluate('document.querySelectorAll("nav button").length==='+names.length);i++)await new Promise(r=>setTimeout(r,100));
 for(const n of names){
 await evaluate(`document.querySelector('[data-name="${n}"]').click()`);
 assert(await evaluate(`(()=>{for(const preset of [...toolbox[name].presets,...(toolbox[name].showPresets??[])])for(const seed of [1,11,73]){const a=toolbox[name].generate({preset,seed,values:[2,5],name:'Plane Press',headline:'Orbital studies',palette:palettes[8]});const sheet=new CSSStyleSheet();sheet.replaceSync(a.css);if(!sheet.cssRules.length||new DOMParser().parseFromString(a.svg,'image/svg+xml').querySelector('parsererror'))return false}return true})()`),n+' syntax');
 if(n==='gradient'){
   for(const preset of gradient.showPresets){
     const clip=await evaluate(`(()=>{options.preset=${JSON.stringify(preset)};render();const el=document.querySelector('#sample0'),rect=el.getBoundingClientRect();if(!result||getComputedStyle(el).backgroundImage==='none')throw Error('Invalid CSS');return {x:rect.x+scrollX,y:rect.y+scrollY,width:rect.width,height:rect.height,scale:1}})()`);
     // Exclude product and headline when measuring the material itself.
     await evaluate("document.querySelectorAll('.composed>strong,.mini-window').forEach(el=>el.style.visibility='hidden')");
     await evaluate(`(async()=>{const bg=getComputedStyle(document.querySelector('#sample0')).backgroundImage;
       for(const match of bg.matchAll(/url\\("([^"]+)"\\)/g)){const image=new Image();image.src=match[1];await image.decode()}
       await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
     })()`);
     const image=(await send('Page.captureScreenshot',{clip,captureBeyondViewport:false})).data;
     const stats=await evaluate(`(async()=>{const img=new Image();img.src='data:image/png;base64,${image}';await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;let minimum=21;const zones=[];for(let y=3;y<c.height-3;y+=4)for(let x=3;x<c.width-3;x+=4){const at=4*(y*c.width+x),rgb=Array.from(data.slice(at,at+3));if(x<c.width*.37)minimum=Math.min(minimum,toolbox.common.contrast('#ffffff',toolbox.common.hex(rgb)));if(zones.length<3&&zones.every(z=>Math.hypot(...z.map((v,i)=>v-rgb[i]))>38))zones.push(rgb)}return [minimum,zones.length]})()`);
     if(stats[0]<7||stats[1]<3)fs.writeFileSync(path.join(tmp,'toolbox-'+preset+'-failed.png'),Buffer.from(image,'base64'));
     assert(stats[0]>=7&&stats[1]>=3,preset+' rendered contrast/zones '+stats);
     console.log(preset+' preview: '+stats[0].toFixed(2)+':1, '+stats[1]+' separated colour zones');
   }
   const failure=await evaluate(`(async()=>{
     const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
     const ctx=canvas.getContext('2d',{willReadFrequently:true});
     for(const preset of toolbox.gradient.presets)for(const seed of [1,11,73])for(const zone of ['left','top','centre']){
       const palette=palettes[seed===11?11:8],r=toolbox.gradient.generate({palette,preset,seed,zone});
       const img=new Image();img.src=toolbox.common.uri(r.svg);await img.decode();
       ctx.drawImage(img,0,0,160,90);const pixels=ctx.getImageData(0,0,160,90).data;
       for(let y=1;y<89;y+=5)for(let x=1;x<159;x+=5){
         if(zone==='left'&&x>=60||zone==='top'&&y>=34||zone==='centre'&&(x<40||x>=120))continue;
         const at=(y*160+x)*4;
         if(toolbox.common.contrast(palette.ink,toolbox.common.hex(pixels.slice(at,at+3)))<7)return preset+' '+zone+' at '+x+','+y;
       }
     }return '';
   })()`);assert.equal(failure,'','rendered SVG reading zone');
 }
 const clip=await evaluate("(()=>{const {x,y,width,height}=document.querySelector('#sample0').getBoundingClientRect();return {x:x+scrollX,y:y+scrollY,width,height,scale:1}})()");
 const shot=async()=>(await send('Page.captureScreenshot',{clip,captureBeyondViewport:true})).data;
 const before=await shot();await evaluate("document.querySelector('#sample0').style.visibility='hidden'");assert.notEqual(await shot(),before,n+' blank preview');
 }assert.deepEqual(errors,[]);console.log('Offline lab and '+names.length+' previews passed');
}finally{
 const shutdown=setTimeout(stopOwnedBrowser,5000);
 try{await Promise.race([send('Browser.close',{},undefined).catch(()=>{}),exited]);await exited}
 finally{clearTimeout(shutdown);clearTimeout(guard)}
}
const layout=spawnSync(process.execPath,[path.join(skill,'assets/layout/check.mjs'),'--url',path.join(dir,'demo.html'),'--root',skill,'--sizes','1440x900,390x844','--profile',browserProfile],{stdio:'inherit',timeout:580000});assert.equal(layout.status,0,'demo layout');
