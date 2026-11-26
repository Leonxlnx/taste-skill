function hash(value) {
  let state=2166136261;
  for (const character of String(value)) state=Math.imul(state^character.charCodeAt(0),16777619);
  return state>>>0;
}

export function random(seed=1) {
  let state=hash(seed);
  return () => {
    state=(Math.imul(state,1664525)+1013904223)>>>0;
    return state/4294967296;
  };
}

export const number=(value,min,max)=>Math.min(max,Math.max(min,Number(value)));
export const rgb=colour=>colour.slice(1).match(/../g).map(byte=>parseInt(byte,16));
export const hex=channels=>'#'+Array.from(channels, value=>Math.round(number(value,0,255)).toString(16).padStart(2,'0')).join('');
export function mix(a,b,t) {
  const end=rgb(b);
  return hex(rgb(a).map((value,i)=>value+(end[i]-value)*t));
}

export function luminance(colour) {
  const weights=[.2126,.7152,.0722];
  return rgb(colour).reduce((sum,value,i)=>{
    const x=value/255;
    return sum+weights[i]*(x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  },0);
}
export function contrast(a,b) {
  const x=luminance(a), y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export function svg(body,box='0 0 320 180') {
  // Inline siblings must not resolve a pattern or filter to another specimen.
  const prefix='m'+hash(body).toString(36)+'-';
  const scoped=body.replace(/id="([\w-]+)"/g,(_,id)=>'id="'+prefix+id+'"')
    .replace(/url\(#([\w-]+)\)/g,(_,id)=>'url(#'+prefix+id+')');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" preserveAspectRatio="none">${scoped}</svg>`;
}
export const uri=art=>'data:image/svg+xml,'+encodeURIComponent(art).replace(/'/g,'%27');
export function background(name,art) {
  return {svg:art,css:`.ts-${name} { --${name}-art: url("${uri(art)}"); background-image: var(--${name}-art); background-size: 100% 100%; }`};
}
export function config(options) {
  const palette={bg:'#f5f3ee',ink:'#242622',accent:'#55795e',...options.palette};
  return {...palette,rng:random(options.seed),amount:number(options.amount??.5,0,1)};
}
