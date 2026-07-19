import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const ignoredDirectories = new Set([".git", ".vite", "dist", "node_modules"]);
const ignoredExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
  ".woff",
  ".woff2",
]);
const secretPatterns = [
  /RBPP-[A-F0-9-]{20,}/i,
  /REACTBITS_LICENSE_KEY\s*=\s*[^\s]+/i,
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(resolved)));
    else if (!ignoredExtensions.has(path.extname(entry.name).toLowerCase())) files.push(resolved);
  }

  return files;
}

const matches = [];
for (const file of await walk(root)) {
  const content = await readFile(file, "utf8");
  if (secretPatterns.some((pattern) => pattern.test(content))) {
    matches.push(path.relative(root, file));
  }
}

if (matches.length) {
  console.error("Secret scan failed:");
  for (const file of matches) console.error(`- ${file}`);
  process.exit(1);
}

console.log("Secret scan clean.");
