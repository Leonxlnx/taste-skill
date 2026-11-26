import {crc32, deflateSync} from 'node:zlib';
function chunk(type,data){
  const body=Buffer.concat([Buffer.from(type),data]),out=Buffer.alloc(body.length+8);
  out.writeUInt32BE(data.length);body.copy(out,4);
  out.writeUInt32BE(crc32(body),out.length-4);
  return out;
}
export function encode({pixels,width,height}){
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
  const stride=width*3,raw=Buffer.alloc((stride+1)*height);
  for(let y=0;y<height;y++){
    const row=y*(stride+1);raw[row]=1;
    for(let i=0;i<stride;i++)raw[row+i+1]=pixels[y*stride+i]-(i<3?0:pixels[y*stride+i-3]);
  }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]);
}
