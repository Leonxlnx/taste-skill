import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();

const pngToWebp = [
  "assets/readme-banner.png",
  "assets/readme-buttons/btn-site.png",
  "assets/readme-buttons/btn-mit.png",
  "assets/readme-buttons/btn-agent-skills.png",
  "assets/readme-buttons/btn-tools.png",
  "assets/readme-buttons/btn-changelog.png",
];

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

async function pngFileToWebp(inputRel, { maxWidth } = {}) {
  const input = path.join(root, inputRel);
  const output = input.replace(/\.png$/i, ".webp");
  let pipeline = sharp(input);
  const meta = await pipeline.metadata();

  if (maxWidth && meta.width > maxWidth) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
  }

  await pipeline.webp({ quality: 92, effort: 6, alphaQuality: 100 }).toFile(output);
  const outMeta = await sharp(output).metadata();
  console.log(
    `${path.basename(output)} -> ${outMeta.width}x${outMeta.height}, ${fs.statSync(output).size} bytes`
  );
}

async function emilBadgeToWebp() {
  const src =
    "C:/Users/User/Downloads/c4f8c4a7-2566-4644-b752-b652e0c103f5.png";
  const output = path.join(root, "assets/sponsors/emil-animations-dev.webp");
  const exportHeight = 240;

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.from(data);
  removeOuterBackground(rgba, info.width, info.height);
  const bounds = getBounds(rgba, info.width, info.height);

  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract(bounds)
    .resize({ height: exportHeight, withoutEnlargement: true })
    .webp({ quality: 94, effort: 6, alphaQuality: 100 })
    .toFile(output);

  const outMeta = await sharp(output).metadata();
  console.log(
    `${path.basename(output)} -> ${outMeta.width}x${outMeta.height}, ${fs.statSync(output).size} bytes`
  );
}

async function sponsorLogoToWebp() {
  const jfif = "C:/Users/User/Downloads/6b610a0c-8889-49fc-9684-e172d7172ea0.jfif";
  const output = path.join(root, "assets/sponsors/animations-dev.webp");
  const source = fs.existsSync(jfif)
    ? jfif
    : path.join(root, "assets/sponsors/animations-dev.png");

  await sharp(source)
    .resize(192, 192, { fit: "cover" })
    .webp({ quality: 92, effort: 6, alphaQuality: 100 })
    .toFile(`${output}.tmp`);
  fs.renameSync(`${output}.tmp`, output);

  const outMeta = await sharp(output).metadata();
  console.log(
    `${path.basename(output)} -> ${outMeta.width}x${outMeta.height}, ${fs.statSync(output).size} bytes`
  );
}

for (const file of pngToWebp) {
  await pngFileToWebp(file, {
    maxWidth: file.includes("readme-buttons") ? 1400 : undefined,
  });
}

await sponsorLogoToWebp();
await emilBadgeToWebp();
