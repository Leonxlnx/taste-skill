// Indexed PNG with a stored DEFLATE block. A small palette keeps tiles compact.
function chunk(type,data){
  const tag=Array.from(type,c=>c.charCodeAt(0)), bytes=[...tag,...data];
  let crc=-1;
  for(const b of bytes){crc^=b;for(let k=0;k<8;k++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}
  return [...word(data.length),...bytes,...word(~crc)];
}
const word=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255];
export function png(size,colours,alphas,sample){
  const raw=[];
  for(let y=0;y<size;y++){raw.push(0);for(let x=0;x<size;x++)raw.push(sample(x,y))}
  let a=1,b=0;for(const v of raw){a=(a+v)%65521;b=(b+a)%65521}
  const n=raw.length, def=[120,1,1,n&255,n>>8,(~n)&255,((~n)>>8)&255,...raw,...word(b*65536+a)];
  const bytes=[137,80,78,71,13,10,26,10,...chunk('IHDR',[...word(size),...word(size),8,3,0,0,0]),...chunk('PLTE',colours.flat()),...chunk('tRNS',alphas),...chunk('IDAT',def),...chunk('IEND',[])];
  return 'data:image/png;base64,'+btoa(String.fromCharCode(...bytes));
}
