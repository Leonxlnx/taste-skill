import {contrast, svg} from './common.js';
import {blend, oklch, fromLch} from './colour.js';

export const presets = ['light', 'dark'];
export const uses = ['client page', 'product interface', 'campaign'];
export const knobs = {strength: [0, 1, 0.65]};
export const choices = {temperature: ['true','warm','cool','brand'], paper: ['near-white','white','soft']};

function pigment(input) {
  if (!/^#(?:[a-f\d]{3}|[a-f\d]{6})$/i.test(input)) throw Error('Use a hex brand colour.');
  return input.length === 4 ? '#' + [...input.slice(1)].map(c => c+c).join('') : input.toLowerCase();
}

function scheme(brand, second, dark, temperature, paper, strength) {
  const [L,C,h] = oklch(brand);
  const neutralHue = {true:0, warm:75*Math.PI/180, cool:245*Math.PI/180, brand:h}[temperature];
  const chroma = {true:0, warm:.012, cool:.011, brand:Math.min(.019,C*.16)}[temperature];
  const neutral = l => fromLch(l, chroma, neutralHue);
  const paperLevel = {white:1,'near-white':.985,soft:.961}[paper];
  const bg = neutral(dark ? .17+(1-paperLevel)*.45 : paperLevel);
  const surface = neutral(dark ? .237 : paperLevel-.032);
  const ink = neutral(dark ? .956 : .235);
  let muted = ink;
  for (let i=0;i<=1000;i++) {
    const candidate = neutral(dark ? i/1000 : 1-i/1000);
    if (Math.min(contrast(candidate,bg),contrast(candidate,surface)) >= 7.05) { muted=candidate; break; }
  }
  const accentAt = l => fromLch(l,C*(.61+.6*strength),h);
  let accent = accentAt(L);
  for (let i=1;contrast(accent,bg)<3.05 && i<=500;i++) {
    accent=accentAt(L+((dark?1:0)-L)*i/500);
  }
  const accentInk = contrast('#ffffff',accent)>contrast('#000000',accent)?'#ffffff':'#000000';
  return {bg,surface,ink,muted,accent,accentInk,
    line:blend(bg,ink,dark?.24:.17),tint:blend(bg,second??accent,dark?.24:.13)};
}

function declarations(p,prefix) {
  return Object.entries({bg:p.bg,surface:p.surface,ink:p.ink,muted:p.muted,accent:p.accent,
    'accent-ink':p.accentInk,action:p.accent,'action-ink':p.accentInk})
    .map(([key,value])=>'  --p-'+prefix+key+': '+value+';').join('\n');
}

function sheet(p) {
  const roles = [['Ground',p.bg],['Surface',p.surface],['Ink',p.ink],['Muted',p.muted],
    ['Line',p.line],['Accent',p.accent],['Label',p.accentInk],['Tint',p.tint]];
  const swatches=roles.map(([name,color],i)=>{
    const x=20+72*i;
    return `<rect x="${x}" y="111" width="68" height="28" fill="${color}" stroke="${p.line}"/><text x="${x}" y="158">${name}</text><text x="${x}" y="176" font-size="14" fill="${p.muted}">${color}</text>`;
  }).join('');
  return svg(`<rect width="616" height="192" fill="${p.bg}"/><g font-family="system-ui,sans-serif" fill="${p.ink}"><text x="20" y="47" font-size="32" font-weight="600">Field notes</text><text x="20" y="76" font-size="16" fill="${p.muted}">Westfjords traverse</text><rect x="443" y="29" width="145" height="39" rx="5" fill="${p.accent}"/><text x="515" y="54" text-anchor="middle" font-size="15" fill="${p.accentInk}">Read the route</text><g font-size="15">${swatches}</g></g>`,'0 0 616 192').replace('preserveAspectRatio="none"','role="img" aria-label="Page palette and eight colour roles"');
}

export function generate(options={}) {
  const brand=pigment(options.brand??options.palette?.accent??'#265db5');
  const second=options.second?pigment(options.second):null;
  const {temperature='brand', paper='near-white', strength=.65, preset='light'}=options;
  if (!choices.temperature.includes(temperature)||!choices.paper.includes(paper)||!presets.includes(preset)) throw Error('Unknown palette setting.');
  const p=scheme(brand,second,preset==='dark',temperature,paper,strength);
  const inverse=scheme(brand,second,preset!=='dark',temperature,paper,strength);
  const {bg,surface,ink,muted,accent,accentInk}=p;
  const json={id:'brand-'+brand.slice(1)+'-'+preset,name:'Brand '+brand+' · '+preset,
    tags:[preset+'-neutral','mono-accent'],trades:[],bg,surface,ink,muted,accent,accentInk,
    fields:[{bg:inverse.bg,ink:inverse.ink}],note:'Use the accent for actions and focus.',seenIn:[]};
  const css=':root {\n'+declarations(p,'')+'\n'+declarations(inverse,'inv-')+
    '\n  --line: '+p.line+';\n  --p-tint: '+p.tint+';\n}';
  const ratios={ink:contrast(ink,bg),secondary:contrast(muted,bg),label:contrast(accentInk,accent),accent:contrast(accent,bg)};
  return {json,css,svg:sheet(p),roles:p,ratios};
}
