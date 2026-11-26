import {vector} from './show-svg.js';
import {config, rgb, hex, contrast, mix, luminance} from './common.js';
import {blend, spectrum} from './colour.js';
import {png} from './tile.js';

export const forms = {
  selvedge:'silk-folds', current:'gradient-mesh', organza:'silk-folds', drape:'aurora-curtains',
  transit:'soft-light-bars', limb:'edge-glow', afterlight:'grain-gradient', aperture:'prism-dispersion',
  reeded:'fluted-glass', occult:'edge-glow'
};
const motion={
 selvedge:{speed:.04,angle:53,scale:1.8,folds:.82},organza:{speed:.045,angle:-37,scale:1.1,folds:.72},current:{show:1},drape:{speed:.045,bands:4,stars:0,waviness:.79},
 transit:{bars:4,tilt:1,softness:.27},limb:{speed:30,radius:48,segment:.65,width:1.1},afterlight:{show:1},
 aperture:{splitX:.47,splitY:.5,fanSpread:.54,hueSpread:64,sway:.014},reeded:{speed:.033,angle:3,ribWidth:30,clear:.38},occult:{speed:25,radius:48,glow:34,segment:.52}
};
const clamp=x=>Math.min(1,Math.max(0,x));
const fraction=x=>x-Math.floor(x);
const meshPoints=[[.48,-.12,.32],[.91,.05,1],[.71,.43,.03],[1.16,.55,.6],[.81,.96,.9]];
function field(form,x,y,phase) {
  const bend=Math.sin(4.5*x+phase);
  switch(form){
    case 'selvedge': {
      const mid=.51+.25*Math.sin(5.8*x+.8+phase*.3)+.08*Math.sin(10*x);
      const breadth=.26*Math.sin((x-.74)*5.1+phase*.35);
      const s=(y-mid)/(breadth||.00001);
      const ground=.035+.045*Math.exp(-14*Math.abs(y-mid));
      const distance=Math.abs(breadth)-Math.abs(y-mid);
      const slope=1.45*Math.cos(5.8*x+.8+phase*.3)+.8*Math.cos(10*x)
        +Math.sign(y-mid)*Math.sign(breadth)*1.326*Math.cos((x-.74)*5.1+phase*.35);
      const footprint=1/235+Math.abs(slope)/448;
      const coverage=clamp(.5+distance/footprint);
      const across=clamp((s+1)/2);
      const face=breadth<0 ? .20+.69*across**.88+.07*Math.exp(-18*(1-across)) : .17+.58*(1-across)**1.5;
      return ground+(face-ground)*coverage;
    }
    case 'current': {
      const u=x+.16*Math.sin(y*5+x*3+phase), v=y+.18*Math.sin(x*5-y*2);
      let sum=0,total=0;
      for(const [cx,cy,level] of meshPoints){
        const dx=u-cx,dy=v-cy,weight=Math.exp(-17*(dx*dx+dy*dy));
        sum+=weight*level;total+=weight;
      }
      const relief=.32*Math.sin(8*u-5*v+2.8*Math.sin(3*v))+.21*Math.sin(8*v+3*u);
      return clamp(.52*sum/total+.22+.68*relief);
    }
    case 'organza': {
      const wave=y*5+x*3;
      const t=fraction(2.2*y-1.9*x+.64*bend+.16*Math.sin(wave));
      const dx=-1.9+2.88*Math.cos(4.5*x+phase)+.48*Math.cos(wave);
      const dy=2.2+.8*Math.cos(wave);
      const footprint=Math.abs(dx)/320+Math.abs(dy)/168;
      const signed=t<.5?t:t-1;
      if(Math.abs(signed)<footprint/2)return .06+.92*clamp(.5+signed/footprint);
      return .06+.92*(1-t)**2.3;
    }
    default: {
      const hem=.59+.13*Math.sin(6.1*x+phase)+.08*Math.sin(14*x-.7);
      const drop=y-hem;
      const pleat=fraction(5.8*x+.48*Math.sin(8*x+1.5*y+phase)+.09*y);
      const light=(.40+.58*(1-pleat)**1.7)*Math.exp(drop<0?3.1*drop:-30*drop);
      return .035+light;
    }
  }
}
function native(form,c,base){
  const [a,b,d,e]=c;
  const ramp=a+' 0%, '+b+' 36%, '+d+' 66%, '+e+' 100%';
  switch(form){
    case 'transit':return 'linear-gradient(122deg, transparent 0 46%, '+base+' 46.4%, transparent 54%, '+base+' 61%, transparent 61.5% 69%, '+base+' 69.4%, transparent 81%, '+base+' 90%), linear-gradient(115deg, '+ramp+')';
    case 'limb':return 'radial-gradient(ellipse 106% 138% at 107% 146%, '+base+' 46%, '+mix(base,a,.14)+' 79.5%, '+base+' 82%, '+a+' 82.4%, '+e+' 83.4%, '+d+' 85%, '+b+' 89%, '+base+' 103%)';
    case 'afterlight':return 'linear-gradient(169deg, '+base+' 4%, '+a+' 34%, '+b+' 46%, '+d+' 57%, '+e+' 64%, '+b+' 67%, '+base+' 97%)';
    case 'aperture':return 'conic-gradient(from 43deg at 47% 55%, '+base+' 0deg, '+a+' 6deg, '+b+' 17deg, '+d+' 28deg, '+e+' 32deg, '+base+' 32.4deg)';
    case 'reeded':return 'repeating-linear-gradient(93deg, #0005 0%, transparent 1.5%, #fff1 2.9%, #0007 3.2%),linear-gradient(143deg,'+base+' 14%, '+a+' 31%, '+b+' 48%, '+d+' 57%, '+e+' 64%, '+base+' 86%)';
    case 'occult':return 'radial-gradient(ellipse 45% 85% at 86% 85%, '+base+' 80%, '+a+' 80.6%, '+e+' 81.2%, '+d+' 84%, '+b+' 90%, '+base+' 111%)';
    default:throw Error('Unknown CSS form '+form);
  }
}
export function show(options){
  const {accent,bg,rng}=config(options), form=options.preset;
  const placement=options.placement??(luminance(bg)>.4?'panel':'ground');
  if(!['ground','panel'].includes(placement))throw Error('Choose panel or ground.');
  if(options.zone&&options.zone!=='left')throw Error('Show presets reserve the left text zone.');
  const rich=Number(options.rich??.88);
  if(!Number.isFinite(rich)||rich<0||rich>1)throw Error('rich must be between 0 and 1.');
  const hues=options.hues?String(options.hues).split(','):spectrum(accent,rich);
  if(hues.length!==4||hues.some(c=>!/^#[a-f0-9]{6}$/i.test(c)))throw Error('Supply four hex colours for hues.');
  const base=mix('#090910',hues[0],placement==='panel'?.16:.055), ink='#ffffff', filename=options.picture??form+'.png';
  const alpha=Math.round(clamp(Number(options.grain??.67))*3);
  const grain=png(24,[[0,0,0],[255,255,255]],[alpha,alpha],()=>+(rng()>.5));
  const raster=['selvedge','current','organza','drape'].includes(form);
  const width=form==='selvedge'?448:320,height=Math.round(width*630/1200),phase=rng()*.65;
  let pixels,ratio=raster?21:contrast(ink,mix(mix(base,'#ffffff',.075),'#ffffff',alpha/255));
  if(raster){
    const stops=[base,...hues], lut=Array.from({length:256},(_,i)=>{
      const t=i/255*4,k=Math.min(3,Math.floor(t));return rgb(blend(stops[k],stops[k+1],t-k));
    });
    pixels=new Uint8Array(width*height*3);
    const ground=rgb(base);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const u=x/(width-1),v=y/(height-1);
      // Average across a pixel at cloth seams before the browser enlarges it.
      const dx=.25/width,dy=.25/height;
      const light=form==='current'?field(form,u,v,phase):(
        field(form,u-dx,v-dy,phase)+field(form,u+dx,v-dy,phase)+
        field(form,u-dx,v+dy,phase)+field(form,u+dx,v+dy,phase))/4;
      const t=clamp((u-.38)/.29), fade=.065+.935*t*t*(3-2*t), colour=lut[Math.round(clamp(light)*255)];
      const offset=(y*width+x)*3;
      for(let k=0;k<3;k++)pixels[offset+k]=Math.round(ground[k]+(colour[k]-ground[k])*fade);
    }
    const seen=new Set();
    for(let y=0;y<height;y++)for(let x=0;x<Math.floor(width*.38);x++){
      const offset=3*(y*width+x),key=pixels[offset]*65536+pixels[offset+1]*256+pixels[offset+2];
      if(seen.has(key))continue;
      seen.add(key);ratio=Math.min(ratio,contrast(ink,mix(hex(pixels.subarray(offset,offset+3)),'#ffffff',alpha/255)));
    }
  }
  const layer=raster?'url("'+filename+'")':'linear-gradient(90deg,'+base+'ed 38%, '+base+'d9 46%, '+base+'80 54%, '+base+'29 62%, transparent 69%),'+native(form,hues,base);
  const texture='url("'+grain+'"), ';
  const perceptual=raster?'':'  background-image: '+texture+layer.replace(/(-gradient\([^,]+),/g,'$1 in oklab,')+';\n';
  const css='.ts-gradient {\n  color: '+ink+';\n  background-color: '+base+';\n  background-position: left center;\n  background-image: '+texture+layer+';\n'+perceptual+'  background-size: 24px 24px, cover'+(raster?'':', cover, cover')+';\n}';
  const svg=raster?'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><pattern id="dust" patternUnits="userSpaceOnUse" width="24" height="24"><image href="'+grain+'" width="24" height="24"/></pattern></defs><image href="'+filename+'" width="1200" height="630"/><rect width="100%" height="100%" fill="url(#dust)"/></svg>':vector(layer,base,grain);
  const settings={
    effect:forms[form],seed:options.seed??1,colours:hues,
    palette:{bg:base,ink,accent:hues[0],surface:hues[1],muted:hues[2],accentInk:hues[3]},
    params:form==='current'?{...motion.current,phase}:motion[form]
  };
  // Edge-glow draws a local outline. The host's transform supplies the crop.
  if(form==='limb'||form==='occult'){
    const horizon=form==='limb';
    settings.frame={unit:'fraction',centre:horizon?[1.07,1.46]:[.86,.85],
      radius:horizon?[1.06*.824,1.38*.824]:[.45*.806,.85*.806],sourceSize:96};
  }
  return {css,svg,hues,pixels,width,height,placement,ratio,zone:'left',settings};
}
