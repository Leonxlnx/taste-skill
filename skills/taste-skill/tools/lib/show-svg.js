import {blend} from './colour.js';

// Convert the limited set of CSS paints used by the show presets to SVG paint
// servers. The gradient line spans the projection of the four frame corners.
const width=1200,height=630;
const rounded=n=>Number(n.toFixed(3));
function colourStop(token){
  const [colour,...positions]=token.trim().split(/\s+/);
  const value=colour==='transparent'?'#0000':colour;
  const full=value.length<6?'#'+[...value.slice(1)].map(c=>c+c).join(''):value;
  const opacity=full.length===9?parseInt(full.slice(7),16)/255:1;
  return (positions.length?positions:[null]).map(position=>({
    colour:full.slice(0,7),opacity,at:position===null?null:parseFloat(position)
  }));
}
function readStops(tokens,end){
  const stops=tokens.flatMap(colourStop);
  stops[0].at??=0;stops[stops.length-1].at??=end;
  let previous=0;
  for(let i=1;i<stops.length;i++)if(stops[i].at!==null){
    for(let j=previous+1;j<i;j++)stops[j].at=stops[previous].at+(stops[i].at-stops[previous].at)*(j-previous)/(i-previous);
    previous=i;
  }
  return stops;
}
function stopsMarkup(stops,range){
  const expanded=[];
  for(const [i,s] of stops.entries()){
    const p=stops[i-1];
    if(p&&p.opacity===1&&s.opacity===1&&p.colour!==s.colour){
      for(const t of [.25,.5,.75])expanded.push({at:p.at+(s.at-p.at)*t,opacity:1,colour:blend(p.colour,s.colour,t)});
    }
    expanded.push(s);
  }
  return expanded.map(s=>'<stop offset="'+rounded(s.at/range)+'" stop-color="'+s.colour+'" stop-opacity="'+rounded(s.opacity)+'"/>').join('');
}
function fan(geometry,stops){
  const [,rotation,px,py]=geometry.match(/from ([-.\d]+)deg at ([-.\d]+)% ([-.\d]+)%/);
  const cx=width*px/100,cy=height*py/100;
  function corner(degrees){
    const angle=(Number(rotation)+degrees)*Math.PI/180;
    return rounded(cx+2000*Math.sin(angle))+' '+rounded(cy-2000*Math.cos(angle));
  }
  let paths='';
  for(let i=1;i<stops.length;i++){
    const a=stops[i-1],b=stops[i],span=b.at-a.at;
    if(span<=0)continue;
    const pieces=Math.ceil(span/.42);
    for(let j=0;j<pieces;j++){
      const lo=a.at+span*j/pieces,hi=a.at+span*(j+1)/pieces;
      paths+='<path fill="'+blend(a.colour,b.colour,(j+.5)/pieces)+'" d="M'+cx+' '+cy+'L'+corner(lo)+' '+corner(hi+.012)+'Z"/>';
    }
  }
  return paths;
}
export function vector(layers,base,grain){
  let defs='',paint='<rect width="1200" height="630" fill="'+base+'"/>';
  const rect=id=>'<rect width="1200" height="630" fill="url(#'+id+')"/>';
  for(const [i,layer] of [...layers.matchAll(/([\w-]+)-gradient\(([^()]*)\)/g)].reverse().entries()){
    const [,kind,body]=layer,[geometry,...tokens]=body.split(','),id='paint'+i;
    const stops=readStops(tokens,kind==='conic'?360:100);
    if(kind==='conic'){paint+=fan(geometry,stops);continue}
    const last=stops.at(-1).at;
    if(kind==='radial'){
      const [,rx,ry,x,y]=geometry.match(/ellipse ([.\d]+)% ([.\d]+)% at ([.\d]+)% ([.\d]+)%/);
      defs+='<radialGradient id="'+id+'" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1" gradientTransform="translate('+width*x/100+' '+height*y/100+') scale('+width*rx*last/10000+' '+height*ry*last/10000+')">'+stopsMarkup(stops,last)+'</radialGradient>';
    }else{
      const angle=parseFloat(geometry)*Math.PI/180,dx=Math.sin(angle),dy=-Math.cos(angle);
      const length=Math.abs(width*dx)+Math.abs(height*dy),x=(width-dx*length)/2,y=(height-dy*length)/2;
      const period=kind.startsWith('repeating')?last:100;
      defs+='<linearGradient id="'+id+'" gradientUnits="userSpaceOnUse" x1="'+rounded(x)+'" y1="'+rounded(y)+'" x2="'+rounded(x+dx*length*period/100)+'" y2="'+rounded(y+dy*length*period/100)+'" spreadMethod="'+(kind.startsWith('repeating')?'repeat':'pad')+'">'+stopsMarkup(stops,period)+'</linearGradient>';
    }
    paint+=rect(id);
  }
  defs+='<pattern id="dust" patternUnits="userSpaceOnUse" width="24" height="24"><image href="'+grain+'" width="24" height="24"/></pattern>';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs>'+defs+'</defs>'+paint+rect('dust')+'</svg>';
}
