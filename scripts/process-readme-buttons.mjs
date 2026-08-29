import fs from "fs";
import path from "path";
import sharp from "sharp";

const srcDir = "C:/Users/User/Downloads";
const outDir = path.join(process.cwd(), "assets/readme-buttons");

const mapping = [
  { src: "ChatGPT Image Jun 17, 2026, 04_04_16 PM (1).png", out: "btn-site.png" },
  { src: "ChatGPT Image Jun 17, 2026, 04_04_16 PM (2).png", out: "btn-mit.png" },
  { src: "ChatGPT Image Jun 17, 2026, 04_04_17 PM (3).png", out: "btn-agent-skills.png" },
  { src: "ChatGPT Image Jun 17, 2026, 04_04_17 PM (4).png", out: "btn-tools.png" },
  { src: "ChatGPT Image Jun 17, 2026, 04_04_20 PM (5).png", out: "btn-changelog.png" },
];

function isBackground(r, g, b, a, threshold = 28) {
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
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const a = rgba[i + 3];
    if (!isBackground(r, g, b, a)) continue;

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

async function processOne(srcPath, outPath) {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = Buffer.from(data);
  removeOuterBackground(rgba, info.width, info.height);
  const bounds = getBounds(rgba, info.width, info.height);

  await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract(bounds)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outPath);

  const meta = await sharp(outPath).metadata();
  console.log(
    `${path.basename(outPath)} -> ${meta.width}x${meta.height}, ${fs.statSync(outPath).size} bytes`
  );
}

fs.mkdirSync(outDir, { recursive: true });

for (const { src, out } of mapping) {
  await processOne(path.join(srcDir, src), path.join(outDir, out));
}
