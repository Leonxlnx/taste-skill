// Marching squares on a seeded scalar field. A zero boundary closes every isoline.
export function contours(random, size) {
  const cells = 16, stride = cells+1, points = [];
  const peaks = [
    [.31+random()*.18,.35+random()*.19,.22,.29,1],
    [.56+random()*.15,.50+random()*.19,.20,.20,.72],
    [.22+random()*.12,.66+random()*.13,.14,.15,.29],
  ];
  const phase = random()*Math.PI*2;
  for (let y=0;y<=cells;y++) for (let x=0;x<=cells;x++) {
    const u=x/cells,v=y/cells;
    const warp=.043*Math.sin(phase+v*9)+.025*Math.cos(u*12-v*3);
    const sum=peaks.reduce((s,[cx,cy,rx,ry,h]) =>
      s+h*Math.exp(-(((u+warp-cx)/rx)**2+((v-cy)/ry)**2)), 0);
    const envelope=Math.min(1,7*u,7*v,7*(1-u),7*(1-v));
    points.push({x:u*size,y:v*size,value:sum*envelope});
  }
  let path='';
  for(const level of [.14,.29,.47,.67,.85]) {
    const endpoints=new Map(), links=new Map();
    function edge(a,b) {
      const key=Math.min(a,b)*points.length+Math.max(a,b);
      if(!endpoints.has(key)){
        const start=points[a],end=points[b],t=(level-start.value)/(end.value-start.value);
        endpoints.set(key,[(start.x+(end.x-start.x)*t).toFixed(1),(start.y+(end.y-start.y)*t).toFixed(1)].join(' '));
      }
      return key;
    }
    function join(a,b) {
      if(!links.has(a))links.set(a,[]);
      if(!links.has(b))links.set(b,[]);
      links.get(a).push(b);links.get(b).push(a);
    }
    for(let y=0;y<cells;y++)for(let x=0;x<cells;x++){
      const i=y*stride+x, corners=[i,i+1,i+stride+1,i+stride], crossed=[];
      for(let side=0;side<4;side++){
        const a=corners[side],b=corners[(side+1)%4];
        if((points[a].value>level)!==(points[b].value>level))crossed.push(edge(a,b));
      }
      if(crossed.length===4){
        const middle=corners.reduce((sum,id)=>sum+points[id].value,0)/4;
        if((middle>level)!==(points[i].value>level))crossed.unshift(crossed.pop());
        join(crossed[2],crossed[3]);
      }
      if(crossed.length)join(crossed[0],crossed[1]);
    }
    const seen=new Set();
    for(const start of links.keys()){
      if(seen.has(start))continue;
      let id=start, previous=-1;
      do {
        path+=(id===start?'M':'L')+endpoints.get(id);
        seen.add(id);
        const next=links.get(id).find(n=>n!==previous);
        previous=id;id=next;
      } while(!seen.has(id));
      path+='Z';
    }
  }
  return path;
}
