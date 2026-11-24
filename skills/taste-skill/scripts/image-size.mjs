// Intrinsic pixel dimensions from a local image header.
export function imageSize(bytes) {
  if (bytes.length >= 24 && bytes.toString('ascii',1,4) === 'PNG') return [bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
  if (bytes.length >= 4 && bytes.readUInt16BE(0) === 0xffd8) {
    for (let at = 2; at + 8 < bytes.length && bytes[at] === 0xff;) {
      const marker = bytes[at + 1];
      if (marker === 0xff) { at++; continue; }
      const length = bytes.readUInt16BE(at + 2);
      if (length < 2 || marker === 0xda || marker === 0xd9) break;
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
        return [bytes.readUInt16BE(at + 7), bytes.readUInt16BE(at + 5)];
      }
      at += length + 2;
    }
  }
  if (bytes.length < 30 || bytes.toString('ascii',8,12) !== 'WEBP') return;
  switch (bytes.toString('ascii',12,16)) {
    case 'VP8X': return [bytes.readUIntLE(24,3) + 1, bytes.readUIntLE(27,3) + 1];
    case 'VP8 ': return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
    case 'VP8L': {
      const packed = bytes.readUInt32LE(21);
      return [(packed & 0x3fff) + 1, ((packed >>> 14) & 0x3fff) + 1];
    }
  }
}
