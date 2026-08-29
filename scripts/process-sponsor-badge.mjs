import fs from "fs";
import path from "path";
import sharp from "sharp";

const src =
  "C:/Users/User/Downloads/c4f8c4a7-2566-4644-b752-b652e0c103f5.png";
const out = path.join(process.cwd(), "assets/sponsors/emil-animations-dev.png");

function isBackground(r, g, b, a, threshold = 22) {
  if (a < 8) return true;
  return r <= threshold && g <= threshold && b <= threshold;
}

function removeOuterBackground(rgba, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  for (let x = 0; x < width; x++) {
    queue.push(x, 0, x, height - 1);
  }
  for (let y = 1; y < height - 1; y++) {
    queue.push(0, y, width - 1, y);
  }

  while (queue.length) {
    const y = queue.pop();
    const x = queue.pop();
    const idx = y * width + x;
    if (x < 0 || y < 0 || x >= width || y >= height || visited[idx]) continue;

    const i = idx * 4;
    if (!isBackground(rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3])) continue;

    visited[idx] = 1;
    rgba[i + 3] = 0;
    queue.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
  }

  return rgba;
}

function getBounds(rgba, width, height) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = rgba[(y * width + x) * 4 + 3];
      if (a > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const pad = 2;
  return {
    left: Math.max(0, minX - pad),
    top: Math.max(0, minY - pad),
    width: Math.min(width, maxX - minX + 1 + pad * 2),
    height: Math.min(height, maxY - minY + 1 + pad * 2),
  };
}

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const rgba = Buffer.from(data);
removeOuterBackground(rgba, info.width, info.height);
const bounds = getBounds(rgba, info.width, info.height);

const tmp = `${out}.tmp.png`;
await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
  .extract(bounds)
  .resize({ height: 36, withoutEnlargement: true })
  .png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
  .toFile(tmp);

fs.renameSync(tmp, out);
const meta = await sharp(out).metadata();
console.log(`${path.basename(out)} -> ${meta.width}x${meta.height}, ${fs.statSync(out).size} bytes`);
