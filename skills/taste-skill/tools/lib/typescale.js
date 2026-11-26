import {config} from './common.js';

export const presets=['product','editorial','compact','display'];
export const uses=['product page','long read','dense interface'];
export const knobs={ratio:[1.12,1.42,1.25]};
const profiles={
  product:[[36,28,18,16,16,14],[64,40,20,18,16,14]],
  editorial:[[44,30,21,19,17,14],[88,46,25,22,18,15]],
  compact:[[32,24,17,16,15,13],[48,32,18,17,15,13]],
  display:[[48,34,21,18,16,14],[112,64,26,21,17,14]],
};
const roles=['h1','h2','h3','lead','body','small'];
const lineHeights=[1.02,1.1,1.22,1.45,1.55,1.45],tracking=[-.045,-.031,-.015,-.008,0,.003];
const round=n=>Number(n.toFixed(4));
function fluid(a,b){
  if(a===b)return a+'px';
  const slope=(b-a)/1050;
  return `clamp(${Math.min(a,b)}px, calc(${round(a-390*slope)}px ${slope<0?'-':'+'} ${Math.abs(round(100*slope))}vw), ${Math.max(a,b)}px)`;
}
function specimen(rows,p){
  const words=['Orbits','Projected circles','Construction','Seven rings share one centre.','Each ring turns on its own plane.','Edition notes'];
  const names=['Headline','Section','Small heading','Lead','Body','Small'];
  let y=10;
  const lines=rows.map(({role,phone,desktop,leading,spacing},i)=>{
    y+=desktop;
    const row=`<text x="16" y="${round(y)}" font-size="${desktop}" letter-spacing="${spacing}em" fill="${i===5?p.muted:p.ink}">${words[i]}</text><text x="604" y="${round(y)}" text-anchor="end" font-size="17" fill="${p.muted}">${names[i]} · ${phone===desktop?desktop:phone+'–'+desktop}</text>`;
    y+=desktop*(leading-1)+(i===2?22:11);
    return row;
  });
  const h=Math.ceil(y+5);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 ${h}" role="img" aria-label="Six type roles at desktop size"><rect width="620" height="${h}" fill="${p.bg}"/><g font-family="system-ui,sans-serif">${lines.join('')}</g></svg>`;
}

export function generate(options={}){
  const preset=options.preset??'product',ratio=Number(options.ratio??1.25);
  if(!presets.includes(preset)||!Number.isFinite(ratio)||ratio<1.12||ratio>1.42)throw Error('Choose a type preset and ratio from 1.12 to 1.42.');
  const p=config(options);p.muted=options.palette?.muted??p.ink;
  const [phone,wide]=profiles[preset];
  const rows=roles.map((role,i)=>{
    const factor=(ratio/1.25)**[2.1,1.45,.65,.32,0,0][i];
    return {role,phone:Math.round(phone[i]*factor),desktop:Math.round(wide[i]*factor),leading:lineHeights[i],spacing:tracking[i]};
  });
  const variables=rows.map(r=>`  --t-${r.role}: ${fluid(r.phone,r.desktop)}; --lh-${r.role}: ${r.leading}; --ls-${r.role}: ${r.spacing}em;`).join('\n');
  const rules=rows.map(({role})=>{
    const selectors=role==='body'?'body, .t-body':role.startsWith('h')?role+', .t-'+role:'.t-'+role;
    return `${selectors} { font-size: var(--t-${role}); line-height: var(--lh-${role}); letter-spacing: var(--ls-${role}); }`;
  }).join('\n');
  const css=':root {\n'+variables+'\n  --t-card: var(--t-h3);\n}\n'+rules;
  // Width is the kit's max container minus the unused tracks and their 24px gaps.
  const columns={phone:342,third:(1280-2*24)/3,half:(1280-24)/2,full:1280};
  const metrics=rows.map(r=>{
    const cpl={};
    for(const [name,width] of Object.entries(columns)){
      const size=name==='phone'?r.phone:r.desktop;
      cpl[name]=Math.floor(width/(size*(.52+r.spacing)));
    }
    return {...r,cpl};
  });
  const body=metrics.find(r=>r.role==='body');
  const warnings=Object.entries(body.cpl).filter(([,n])=>n<45||n>75).map(([k,n])=>`${k} body measure: approximately ${n} characters (target 45–75).`);
  return {css,svg:specimen(rows,p),metrics,warnings};
}
