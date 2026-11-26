const groups={'Colour and type':['palette','typescale'],'Grounds and textures':['gradient','grain','pattern','surface'],'Shapes and frames':['scribble','frame','device','shape','shadow','divider'],'Pictures and figures':['grade','chart','object','share']};
const get=s=>document.querySelector(s), titleCase=s=>s.charAt(0).toUpperCase()+s.slice(1).replaceAll('-',' ').replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase();
let name, options, result;
const motionObserver=new IntersectionObserver(entries=>{
  for(const entry of entries)entry.target.classList.toggle('is-m-off',!entry.isIntersecting);
});
function control(label,key,choices,range){
 const wrap=document.createElement('label');const caption=document.createElement('span');caption.textContent=label;wrap.append(caption);
 const input=document.createElement(choices?'select':'input');
 if(choices){for(const [value,text] of choices)input.add(new Option(text,value))}
 else if(range){input.type='range';[input.min,input.max]=range;input.step='.01'}
 else input.type=['brand','second'].includes(key)?'color':['values','labels','unit','label','name','headline','mark'].includes(key)?'text':'number';
 input.dataset.key=key;input.value=options[key]??range?.[2]??'';
 if(range){const value=document.createElement('span');value.className='reading';value.dataset.value=key;caption.append(value)}
 input.oninput=()=>{
   const previous=options[key];
   options[key]=input.value;
   if(key==='preset'&&name==='chart'){
     const oldExample=chartExample(previous);
     if(['values','labels','unit'].every(k=>options[k]===oldExample[k])){
       Object.assign(options,chartExample(input.value));
       for(const k of ['values','labels','unit'])get('[data-key='+k+']').value=options[k];
     }
   }
   if(key==='palette'&&name==='palette'){
     options.brand=palettes.find(p=>p.id===input.value).accent;
     get('[data-key=brand]').value=options.brand;
   }
   if(key==='palette'||key==='rich')delete options.hues;
   if(key==='preset'||key==='seed'){delete options.focusX;delete options.focusY}
   render();
 };
 wrap.append(input);get('aside').append(wrap);
}
function chartExample(preset){
 const paired=['progress-ring','range-bar'].includes(preset);
 return paired?{values:'16,31',labels:preset==='progress-ring'?'Ridge,Route':'From,To',unit:'km'}:{values:'12,18,9,24',labels:'North,East,South,West',unit:'km'};
}
function selectTool(value,tier='show'){
 name=value;const tool=toolbox[name];options={seed:1,preset:name==='gradient'&&tier==='show'?tool.showPresets[0]:tool.presets[0],palette:'moss-sand'};
 get('#title').textContent=titleCase(name);get('aside').replaceChildren();
 for(const b of get('nav').querySelectorAll('button'))b.setAttribute('aria-pressed',b.dataset.name===name);
 const showing=name==='gradient'&&tier==='show';
 if(name==='gradient'){control('Treatment','tier',[['show','Show'],['quiet','Quiet']]);const el=get('[data-key=tier]');el.value=tier;el.oninput=()=>selectTool(name,el.value)}
 control('Preset','preset',(showing?tool.showPresets:tool.presets).map(v=>[v,titleCase(v)]));
 control('Palette','palette',palettes.map(v=>[v.id,v.name]));if(!['typescale','chart','grade','device','palette'].includes(name))control('Seed','seed');
 if(name==='share'){Object.assign(options,{name:'Plane Press',headline:'Orbital studies',mark:'ring'});for(const key of ['name','headline','mark'])control(titleCase(key),key)}
 if(name==='frame'){options.label='31 km';control('Measurement','label')}
 if(name==='chart'){Object.assign(options,chartExample(options.preset));for(const k of ['values','labels','unit'])control(titleCase(k),k)}
 if(name==='palette'){options.brand=palettes.find(p=>p.id===options.palette).accent;control('Brand','brand');const add=document.createElement('button');add.textContent='Add second colour';add.onclick=()=>{if(options.second){delete options.second;get('[data-key=second]').parentElement.remove();add.textContent='Add second colour'}else{options.second=options.brand;control('Tint colour','second');add.textContent='Remove second colour'}render()};get('aside').append(add)}
 for(const [key,values] of Object.entries(tool.choices??{})){options[key]=key==='temperature'?'brand':values[0];control(titleCase(key),key,values.map(v=>[v,titleCase(v)]))}
 for(const [key,range] of Object.entries(showing?{rich:[0,1,.88]}:tool.knobs)){
 if(key.startsWith('focus')){control(titleCase(key),key,null,range);continue;}
 options[key]=range[2];control(key==='rich'?'Colour strength':titleCase(key),key,null,range)}
 if(showing){const group=document.createElement('div');group.id='swatches';get('aside').append(group)}
 if(name==='pattern'||name==='gradient'&&!showing){const key=name==='pattern'?'fade':'zone',values=key==='fade'?['radial','linear','none']:['left','centre','top','none'];options[key]=values[0];control(titleCase(key),key,values.map(v=>[v,titleCase(v)]))}
 render();
}
function bitmap(r){
 const canvas=document.createElement('canvas');canvas.width=r.width;canvas.height=r.height;
 const ctx=canvas.getContext('2d'),im=ctx.createImageData(r.width,r.height);
 for(let i=0;i<r.width*r.height;i++){im.data.set(r.pixels.subarray(i*3,i*3+3),i*4);im.data[i*4+3]=255}
 ctx.putImageData(im,0,0);return canvas;
}
function render(){
 const applicable={
   edge:name==='frame'&&['measure','ruler'].includes(options.preset),
   label:name==='frame'&&options.preset==='measure',
   address:name==='device'&&options.preset==='browser',
   panel:name==='share'&&options.preset==='panel',
   headline:name==='share'&&options.preset!=='mark',
 };
 for(const [key,show] of Object.entries(applicable)){
   const field=get('aside [data-key="'+key+'"]');
   if(field)field.parentElement.hidden=!show;
 }
 motionObserver.disconnect();
 const palette=palettes.find(p=>p.id===options.palette);
 const other=palettes[toolbox.common.luminance(palette.bg)>.4?11:8];get('#previews').replaceChildren();
 try{for(const [i,p] of [palette,other].entries()){
 const r=toolbox[name].generate({...options,palette:p,...(name==='palette'&&i?{preset:options.preset==='light'?'dark':'light'}:{})});if(!i){result=r;for(const input of document.querySelectorAll('aside input[type=range]')){const key=input.dataset.key;if(key.startsWith('focus')&&options[key]===undefined){input.value=(100*r.settings[key==='focusX'?'x':'y']).toFixed(2)}get('[data-value="'+key+'"]').textContent=String(+Number(input.value).toFixed(2))}}
 if(!i && r.hues){const group=get('#swatches');group.replaceChildren();r.hues.forEach((h,j)=>{
 const sw=document.createElement('input');sw.type='color';sw.value=h;sw.setAttribute('aria-label','Hue '+(j+1));sw.oninput=()=>{const hs=r.hues.slice();hs[j]=sw.value;options.hues=hs.join(',');render()};group.append(sw)})}
 const figure=document.createElement('figure'),stage=document.createElement('div'),sample=document.createElement('div'),style=document.createElement('style'),caption=document.createElement('figcaption');
 let css=r.css;if(r.pixels)css=css.replace(options.preset+'.png',bitmap(r).toDataURL());
 sample.id='sample'+i;stage.className='stage';stage.style.background=p.bg;stage.style.setProperty('--preview-ink',p.ink);stage.style.setProperty('--preview-ground',p.bg);
 sample.className='sample';style.textContent=css.replaceAll('.ts-'+name,'#'+sample.id);
 if(name==='palette'){style.textContent='';sample.innerHTML=r.svg;sample.classList.add('swatch-sheet');stage.style.background=r.roles.bg}
 if(name==='scribble'){sample.className='mark-example';sample.textContent='Traverse';style.textContent=r.css.replaceAll('.ts-scribble','#'+sample.id)}
 if(name==='frame'){sample.className='frame-preview';sample.innerHTML='<img src="../assets/photos/img/m108358720-1200.webp" alt="Gravel road">'}
 if(name==='typescale'){style.textContent='';sample.className='type-preview';sample.innerHTML=r.svg;stage.style.background=p.bg}
 if(name==='share'){style.textContent='';sample.className='share-preview';sample.innerHTML=r.svg}
 if(name==='object'){
   sample.className='object-preview';sample.innerHTML=r.svg;
   style.textContent=r.css.replaceAll('.ts-object','#'+sample.id);
   if(options.motion==='drift'){
     sample.dataset.mLoop='';
     const pause=document.createElement('button');
     pause.className='loop-pause';pause.textContent='Pause';pause.setAttribute('aria-label','Pause object motion');
     pause.onclick=()=>{const paused=sample.classList.toggle('is-m-paused');pause.textContent=paused?'Play':'Pause';pause.setAttribute('aria-label',pause.textContent+' object motion')};
     sample.append(pause);motionObserver.observe(sample);
   }
 }
 if(name==='chart'){style.textContent='';sample.className='chart-preview';sample.innerHTML=r.svg}
 if(name==='grade'){
   sample.className='grade-preview';sample.innerHTML=r.defs+'<img alt="Gravel road in the Westfjords" src="../assets/photos/img/m108358720-1200.webp">';
   style.textContent=r.css.replace('.ts-grade','#'+sample.id+' img');
 }
 if(name==='device'){
   style.textContent=r.css.replaceAll('.ts-device','#'+sample.id);
   sample.className='device-preview';sample.innerHTML='<div class="device-screen"></div>';
   const screen=sample.firstChild;
   if(options.preset==='terminal'){screen.classList.add('terminal-example');screen.innerHTML='<p>Fieldbook</p><p>› route show 06</p><p>Westfjords · 31 km</p>'}
   else {screen.classList.add('route-example');screen.innerHTML='<div>Westfjords <small>Route 06</small></div><img src="../assets/photos/img/m108358720-1200.webp" alt="Mountain road in the Westfjords">'}
   sample.style.width='min(78%, '+(149*r.slot.width/r.slot.height)+'px)';
 }
 if(name==='shape'||name==='shadow')sample.style.background=name==='shape'?p.accent:p.surface;
 if(['gradient','pattern','grain'].includes(name))sample.style.cssText='width:100%;height:100%';
 if(name==='surface')sample.textContent=titleCase(options.preset);
 if(r.hues){stage.classList.add('composed');if(toolbox.common.luminance(p.bg)>.4)stage.classList.add('paper');const heading=document.createElement('strong');heading.textContent='Field sessions.';const win=document.createElement('div');win.className='mini-window';win.innerHTML='<div class="chart-title">Westfjords traverse</div><div class="chart-meta">Elevation profile <span>31 km</span></div><svg viewBox="0 0 212 44" preserveAspectRatio="none" aria-hidden="true"><path stroke="#39433e" fill="none" stroke-width=".5" d="M0 12H212M0 23H212M0 34H212"/><path fill="#50695a" d="M0 39L9 36 15 37 25 31 31 32 45 24 51 25 62 20 73 24 87 13 95 15 109 7 114 9 128 3 138 11 146 13 156 24 166 20 179 29 188 27 200 33 212 36V44H0Z"/><path d="M128 2V44" fill="none" stroke="#c4d0bd" stroke-width=".6" stroke-dasharray="2 2"/><circle cx="128" cy="3" r="1.8" fill="#eef1e8"/></svg>';stage.append(heading,win)}
 if(name==='divider')stage.style.background=p.surface;
 caption.textContent=p.name+(r.zone?' · Left text zone':'')+(r.ratio?' · '+r.ratio.toFixed(2)+':1':'');if(r.ratios)caption.textContent=(i?(options.preset==='light'?'Dark':'Light'):titleCase(options.preset))+' · '+Object.entries(r.ratios).map(([k,v])=>k+' '+v.toFixed(2)+':1').join(' · ');stage.append(sample);figure.append(style,stage,caption);get('#previews').append(figure)}
 get('[data-copy=defs]').hidden=!result?.defs;get('[data-copy=html]').hidden=!['object','device','share'].includes(name);get('[data-copy=json]').hidden=name!=='palette';get('#picture').hidden=!result?.hues;get('output').value=result?.metrics?'Estimated body measure · '+Object.entries(result.metrics[4].cpl).map(([k,v])=>k+' '+v).join(' / ')+' characters. '+result.warnings.join(' '):'';
 }catch(e){result=null;get('output').value=e.message}
}
for(const [label,items] of Object.entries(groups)){const group=document.createElement('div');group.className='tool-group';const heading=document.createElement('strong');heading.textContent=label;group.append(heading);get('nav').append(group);for(const n of items){const b=document.createElement('button');b.textContent=titleCase(n);b.dataset.name=n;b.onclick=()=>selectTool(n);group.append(b)}}
for(const b of document.querySelectorAll('[data-copy]'))b.onclick=async()=>{
 if(!result)return;
 const quote=v=>{const s=String(v);return /^[A-Za-z0-9.,_-]+$/.test(s)?s:"'"+s.replaceAll("'","''")+"'"};
 const value=b.dataset.copy==='command'?'node tools/'+name+'.mjs '+Object.entries(options).map(([k,v])=>'--'+k+' '+quote(v)).join(' ')+(result.pixels?' --out '+options.preset+'.css':''):result[b.dataset.copy];
 try{await navigator.clipboard.writeText(typeof value==='object'?JSON.stringify(value,null,2):value);get('output').value='Copied.'}catch{const field=document.createElement('textarea');field.value=typeof value==='object'?JSON.stringify(value,null,2):value;get('output').replaceChildren(field);field.select()}
};
get('#picture').onclick=async()=>{
 if(!result?.hues)return;
 const current=result, preset=options.preset;
 let canvas;
 try{
   if(current.pixels)canvas=bitmap(current);
   else{
     const img=new Image();img.src=toolbox.common.uri(current.svg);await img.decode();
     canvas=document.createElement('canvas');canvas.width=1200;canvas.height=630;
     canvas.getContext('2d').drawImage(img,0,0);
   }
   const blob=await new Promise(resolve=>canvas.toBlob(resolve));
   try{await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);get('output').value='Picture copied.'}
   catch{const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=preset+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);get('output').value='Picture downloaded.'}
 }catch(error){get('output').value=error.message}
};
selectTool('gradient');
