import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const logoSize = 62;
const badgeHeight = 126;
const gap = 20;
const out = path.join(root, "assets/sponsors/emil-sponsor-row.webp");

const logo = await sharp(path.join(root, "assets/sponsors/animations-dev.webp"))
  .resize(logoSize, logoSize)
  .toBuffer();

const badge = await sharp(path.join(root, "assets/sponsors/emil-animations-dev.webp"))
  .resize({ height: badgeHeight })
  .toBuffer();

const badgeMeta = await sharp(badge).metadata();
const width = logoSize + gap + badgeMeta.width;
const height = badgeHeight;

await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: logo, left: 0, top: Math.floor((height - logoSize) / 2) },
    { input: badge, left: logoSize + gap, top: 0 },
  ])
  .webp({ quality: 94, effort: 6, alphaQuality: 100 })
  .toFile(out);

const meta = await sharp(out).metadata();
console.log(
  `${path.basename(out)} -> ${meta.width}x${meta.height}, ${fs.statSync(out).size} bytes`
);
