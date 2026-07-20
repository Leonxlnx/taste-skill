import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const previewRoot = path.resolve(root, "../../../previews/drafts/beui");
const read = (relative) => readFile(path.join(root, relative), "utf8");

const manifest = JSON.parse(await read("drafts.json"));
assert.equal(manifest.items.length, 8);
assert.deepEqual(
  manifest.items.map((item) => item.name).sort(),
  [
    "beui-bloom-menu",
    "beui-cylinder-carousel",
    "beui-hold-action",
    "beui-notification-stack",
    "beui-overflow-actions",
    "beui-slide-action",
    "beui-toast-stack",
    "beui-wheel-picker",
  ],
);

const hold = await read("components/beui-hold-action/hold-action.tsx");
assert.match(hold, /--beui-hold-origin/);
assert.match(hold, /rtl:\[--beui-hold-origin:right\]/);
assert.match(hold, /setPointerCapture/);
assert.match(hold, /catch \{/);

const slide = await read("components/beui-slide-action/slide-action.tsx");
assert.match(slide, /getComputedStyle\(track\)\.direction/);
assert.match(slide, /direction === "rtl" \? -maxDistance : maxDistance/);
assert.match(slide, /Math\.abs\(x\.get\(\)\)/);
assert.match(slide, /observer\.disconnect\(\)/);
assert.match(slide, /clearTimeout\(resetTimerRef\.current\)/);

const toast = await read("components/beui-toast-stack/toast-stack.tsx");
assert.match(toast, /layout=\{!reduce\}/);
assert.match(toast, /motion-safe:animate-spin/);
assert.match(toast, /filter: \{ duration: 0\.22/);
assert.match(toast, /window\.clearTimeout/);

const wheel = await read("components/beui-wheel-picker/wheel-picker.tsx");
assert.match(wheel, /role="spinbutton"/);
assert.match(wheel, /aria-valuetext/);
assert.match(wheel, /touchcancel/);
assert.match(wheel, /hasPointerCapture/);
assert.match(wheel, /cancelAnimationFrame\(dragFrame\.current\)/);
assert.match(wheel, /tickPlayer\.current\?\.dispose\(\)/);

const cylinder = await read(
  "components/beui-cylinder-carousel/cylinder-carousel.tsx",
);
assert.match(cylinder, /role="group"/);
assert.match(cylinder, /matches\(":dir\(rtl\)"\)/);
assert.match(cylinder, /stopGlide\(\)/);
assert.match(cylinder, /setPointerCapture/);
assert.match(cylinder, /window\.clearTimeout\(wheelSettleRef\.current\)/);

const bloom = await read("components/beui-bloom-menu/bloom-menu.tsx");
assert.match(bloom, /items: BloomMenuItem\[\]/);
assert.doesNotMatch(bloom, /const ITEMS/);
assert.match(bloom, /role="dialog"/);
assert.match(bloom, /autoFocus/);
assert.match(bloom, /onExitComplete/);
assert.match(bloom, /triggerRef\.current\?\.focus\(\)/);
assert.match(bloom, /querySelector<HTMLButtonElement>/);

const notification = await read(
  "components/beui-notification-stack/notification-stack.tsx",
);
assert.match(notification, /Collapse notifications/);
assert.match(notification, /useHoverCapable/);
const actionSwap = await read(
  "components/beui-notification-stack/beui-action-swap.tsx",
);
assert.match(actionSwap, /filter: \{ duration: 0\.18/);

const overflow = await read(
  "components/beui-overflow-actions/overflow-actions.tsx",
);
assert.match(overflow, /ariaLabel: string/);
assert.match(overflow, /style\.insetInlineStart/);
assert.match(overflow, /event\.key !== "Escape"/);
assert.match(overflow, /toggleRef\.current\?\.focus\(\)/);
assert.match(overflow, /filter: \{ duration: 0\.18/);

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(absolute)));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(absolute);
  }
  return files;
}

const secret =
  /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----|\b(?:AKIA|ASIA)[A-Z0-9]{16}\b|\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b|\bRBPP-[A-Z0-9-]+\b/;
const remoteAsset =
  /(?:src|srcset|poster|image|video|font|model|texture|asset)\s*[:=]\s*(?:\{\s*)?["'`]https?:\/\//i;

for (const file of [
  ...(await sourceFiles(path.join(root, "components"))),
  ...(await sourceFiles(path.join(root, "hooks"))),
  ...(await sourceFiles(path.join(root, "lib"))),
  ...(await sourceFiles(previewRoot)),
]) {
  const content = await readFile(file, "utf8");
  assert.doesNotMatch(content, secret, `${file} contains a possible secret`);
  assert.doesNotMatch(
    content,
    remoteAsset,
    `${file} contains a remote runtime asset`,
  );
  assert.doesNotMatch(content, /[ \t]+$/m, `${file} has trailing whitespace`);
  assert.ok(content.endsWith("\n"), `${file} must end with a newline`);
  if (file.startsWith(path.join(root, "components"))) {
    assert.doesNotMatch(content, /from ["']@\//, `${file} retains a project alias`);
  }
}

console.log("beui: 8 component drafts passed source and interaction checks");
