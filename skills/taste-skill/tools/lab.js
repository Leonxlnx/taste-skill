const names=['gradient','grain','pattern','shape','shadow','surface','divider'];
const get=s=>document.querySelector(s), titleCase=s=>s.charAt(0).toUpperCase()+s.slice(1).replaceAll('-',' ').replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase();
let name, options, result;
function control(label,key,choices,range){
 const wrap=document.createElement('label');const caption=document.createElement('span');caption.textContent=label;wrap.append(caption);
 const input=document.createElement(choices?'select':'input');
 if(choices){for(const [value,text] of choices)input.add(new Option(text,value))}
 else if(range){input.type='range';[input.min,input.max]=range;input.step='.01'}
 else input.type='number';
 input.dataset.key=key;input.value=options[key]??range?.[2]??'';
 if(range){const value=document.createElement('span');value.className='reading';value.dataset.value=key;caption.append(value)}
 input.oninput=()=>{options[key]=input.value;if(key==='preset'||key==='seed'){delete options.focusX;delete options.focusY}render()};wrap.append(input);get('aside').append(wrap);
}
function selectTool(value){
 name=value;const tool=toolbox[name];options={seed:1,preset:tool.presets[0],palette:'moss-sand'};
 get('#title').textContent=titleCase(name);get('aside').replaceChildren();
 for(const b of get('nav').children)b.setAttribute('aria-pressed',b.dataset.name===name);
 control('Preset','preset',tool.presets.map(v=>[v,titleCase(v)]));
 control('Palette','palette',palettes.map(v=>[v.id,v.name]));control('Seed','seed');
 for(const [key,range] of Object.entries(tool.knobs)){
 if(key.startsWith('focus')){control(titleCase(key),key,null,range);continue;}
 options[key]=range[2];control(titleCase(key),key,null,range)}
 if(name==='pattern'||name==='gradient'){const key=name==='pattern'?'fade':'zone',values=key==='fade'?['radial','linear','none']:['left','centre','top','none'];options[key]=values[0];control(titleCase(key),key,values.map(v=>[v,titleCase(v)]))}
 render();
}
function render(){
 const palette=palettes.find(p=>p.id===options.palette);
 const other=palettes[toolbox.common.luminance(palette.bg)>.4?11:8];get('#previews').replaceChildren();
 try{for(const [i,p] of [palette,other].entries()){
 const r=toolbox[name].generate({...options,palette:p});if(!i){result=r;for(const input of document.querySelectorAll('aside input[type=range]')){const key=input.dataset.key;if(key.startsWith('focus')&&options[key]===undefined){input.value=(100*r.settings[key==='focusX'?'x':'y']).toFixed(2)}get('[data-value="'+key+'"]').textContent=String(+Number(input.value).toFixed(2))}}
 const figure=document.createElement('figure'),stage=document.createElement('div'),sample=document.createElement('div'),style=document.createElement('style'),caption=document.createElement('figcaption');
 sample.id='sample'+i;stage.className='stage';stage.style.background=p.bg;
 sample.className='sample';style.textContent=r.css.replaceAll('.ts-'+name,'#'+sample.id);
 if(name==='shape'||name==='shadow')sample.style.background=name==='shape'?p.accent:p.surface;
 if(['gradient','pattern','grain'].includes(name))sample.style.cssText='width:100%;height:100%';
 if(name==='surface')sample.textContent=titleCase(options.preset);
 if(name==='divider')stage.style.background=p.surface;
 caption.textContent=p.name+(r.ratio?' · '+r.ratio.toFixed(2)+':1':'');stage.append(sample);figure.append(style,stage,caption);get('#previews').append(figure)}
 get('output').value='';
 }catch(e){result=null;get('output').value=e.message}
}
for(const n of names){const b=document.createElement('button');b.textContent=titleCase(n);b.dataset.name=n;b.onclick=()=>selectTool(n);get('nav').append(b)}
for(const b of document.querySelectorAll('[data-copy]'))b.onclick=async()=>{
 if(!result)return;
 const value=b.dataset.copy==='command'?'node tools/'+name+'.mjs '+Object.entries(options).map(([k,v])=>'--'+k+' '+v).join(' '):result[b.dataset.copy];
 try{await navigator.clipboard.writeText(value);get('output').value='Copied.'}catch{const field=document.createElement('textarea');field.value=value;get('output').replaceChildren(field);field.select()}
};
selectTool('gradient');
