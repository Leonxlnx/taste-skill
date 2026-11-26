import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawn,spawnSync} from 'node:child_process';
const skill=fileURLToPath(new URL('../skills/taste-skill/',import.meta.url)), dir=path.join(skill,'tools');
const names=['gradient','grain','pattern','shape','shadow','surface','divider'];
const palettes=JSON.parse(fs.readFileSync(path.join(skill,'library/palettes.json')));
let count=0;
for(const file of fs.readdirSync(dir,{recursive:true}).filter(f=>/\.[cm]?js$/.test(f))){
 assert.doesNotMatch(fs.readFileSync(path.join(dir,file),'utf8'),/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\s*\(|(?:node:)?child_process/);
}
for(const name of names){
 const tool=await import(pathToFileURL(path.join(dir,'lib',name+'.js')));
 for(const preset of tool.presets)for(const seed of [1,11,73]){
 const o={preset,seed,palette:palettes[seed===11?11:8]}, a=tool.generate(o);
 assert.deepEqual(a,tool.generate(o));assert(Buffer.byteLength(a.css)<=6144,name+' '+preset+' CSS');
 assert(Buffer.byteLength(a.svg)<=20480,name+' '+preset+' SVG');
 for(const uri of (a.css+' '+a.svg).matchAll(/data:image\/[^"'\s)]+/g))assert(uri[0].length<=12288);
 if(name==='surface')assert(a.ratio>=7,'surface contrast');
 if(name==='gradient')for(const zone of ['left','centre','top'])assert(tool.generate({...o,zone}).ratio>=7);
 count++;
 }}
console.log(count+' deterministic preset/seed cases passed');
const tmp=process.env.TASTE_SKILL_TMP||os.tmpdir(),profile=process.argv.includes('--profile')?process.argv[process.argv.indexOf('--profile')+1]:fs.mkdtempSync(path.join(tmp,'toolbox-chrome-'));
const chrome=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe','/usr/bin/google-chrome','/usr/bin/chromium'].find(p=>p&&fs.existsSync(p));assert(chrome,'Chrome is required');
const child=spawn(chrome,['--headless=new','--user-data-dir='+profile,'--remote-debugging-pipe','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-gpu','--use-angle=swiftshader','--enable-unsafe-swiftshader','about:blank'],{windowsHide:true,stdio:['ignore','ignore','ignore','pipe','pipe']});
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
 await send('Page.navigate',{url:pathToFileURL(path.join(dir,'lab.html')).href});
 for(let i=0;i<100&&!await evaluate('document.querySelectorAll("nav button").length===7');i++)await new Promise(r=>setTimeout(r,100));
 for(const n of names){
 await evaluate(`document.querySelector('[data-name="${n}"]').click()`);
 assert(await evaluate(`(()=>{for(const preset of toolbox[name].presets)for(const seed of [1,11,73]){const a=toolbox[name].generate({preset,seed,palette:palettes[8]});const sheet=new CSSStyleSheet();sheet.replaceSync(a.css);if(!sheet.cssRules.length||new DOMParser().parseFromString(a.svg,'image/svg+xml').querySelector('parsererror'))return false}return true})()`),n+' syntax');
 if(n==='gradient'){
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
 }assert.deepEqual(errors,[]);console.log('Offline lab and seven previews passed');
}finally{
 const shutdown=setTimeout(stopOwnedBrowser,5000);
 try{await Promise.race([send('Browser.close',{},undefined).catch(()=>{}),exited]);await exited}
 finally{clearTimeout(shutdown);clearTimeout(guard)}
}
const layout=spawnSync(process.execPath,[path.join(skill,'assets/layout/check.mjs'),'--url',path.join(dir,'demo.html'),'--root',skill,'--sizes','1440x900,390x844','--profile',profile],{stdio:'inherit',timeout:580000});assert.equal(layout.status,0,'demo layout');
