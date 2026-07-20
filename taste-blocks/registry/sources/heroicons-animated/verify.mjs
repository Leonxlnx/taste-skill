import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const revision = "93c14cc04222375a965ffa33b5d390c474822405";
const upstreamRoot = process.env.HEROICONS_ANIMATED_UPSTREAM_ROOT;
const manifest = JSON.parse(await readFile(path.join(root, "drafts.json"), "utf8"));
const report = JSON.parse(await readFile(path.join(root, "dedupe-report.json"), "utf8"));
const digest = (value) => createHash("sha256").update(value).digest("hex");
const storedDigest = (value) => value.replace(/^sha256:/, "");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

if (manifest.items.length !== 30) throw new Error("Expected 30 retained icons");
if (new Set(manifest.items.map((item) => item.name)).size !== manifest.items.length) throw new Error("Duplicate item names");
assert(report.source.repository === "https://github.com/heroicons-animated/heroicons-animated", "Audit repository changed");
assert(report.source.revision === revision, "Audit revision changed");
assert(report.source.inventory.reactComponentCount === 316, "Upstream inventory count changed");
assert(report.source.inventory.registryItemCount === 316, "Upstream registry count changed");
assert(report.decision.selectedCount === 30, "Selected count changed");
assert(report.decision.rejectedCount === 286, "Rejected count changed");
assert(report.decision.auditedCount === 316, "Audited count changed");

const expectedReasons = {
  "brand-rights": 0,
  "static-or-no-motion": 0,
  "loop-or-repeat": 16,
  "scale-zero": 24,
  "motion-shorthand": 84,
  "existing-semantic": 88,
  "direction-style-state-pack": 61,
  "whole-svg-template-motion": 10,
  "quality-or-motion-template": 3,
};
assert(JSON.stringify(report.rejectionReasonCounts) === JSON.stringify(expectedReasons), "Rejection counts changed");
const rejected = Object.values(report.rejectedByPrimaryReason).flat();
assert(rejected.length === 286 && new Set(rejected).size === 286, "Rejected icons are not an exact once-only partition");
assert(report.selected.length === 30 && new Set(report.selected).size === 30, "Selected icons are not unique");
assert(report.selected.every((name) => !rejected.includes(name)), "Selected and rejected icons overlap");
assert(new Set([...report.selected, ...rejected]).size === 316, "Audit does not account for 316 unique icons");
assert(report.comparison.priorityInventories.animateicons.count === 230, "AnimateIcons comparison inventory changed");
assert(report.comparison.priorityInventories.heroiconsAnimatedRetained.count === 30, "Retained comparison inventory changed");
for (const result of [
  report.comparison.semantic.retainedVsAnimateiconsCollisions,
  report.comparison.geometry.retainedVsAnimateiconsExactCollisions,
  report.comparison.motion.retainedVsAnimateiconsExactCollisions,
  report.comparison.raster.retainedVsAnimateiconsExactCollisions,
]) {
  assert(result.length === 0, "A retained collision remains in the audit report");
}
assert(report.comparison.raster.pairComparisons === 6900, "Raster comparison count changed");
assert(report.purposefulNearPairDecisions.length === 6, "Purposeful near-pair decisions changed");

const manifestSelection = manifest.items
  .map((item) => item.name.replace(/^heroicons-animated-/, "").replace(/-icon$/, ""))
  .sort();
assert(JSON.stringify([...report.selected].sort()) === JSON.stringify(manifestSelection), "Audit selection differs from drafts.json");

for (const item of manifest.items) {
  const component = item.files.find((file) => file.type === "registry:component");
  const sourceBytes = await readFile(path.join(root, component.path));
  const source = sourceBytes.toString("utf8");
  const sourceMapping = item.meta.tasteblocks.source.files.find((file) => file.shippedPath === component.path);
  assert(sourceMapping, `${item.name} misses its source mapping`);
  assert(digest(sourceBytes) === storedDigest(sourceMapping.contentSha256), `${item.name} content hash changed`);
  assert(item.meta.tasteblocks.source.revision === revision, `${item.name} source revision changed`);
  for (const marker of ["useReducedMotion", "isAnimated?: boolean", "!isAnimated || reduced"]) {
    if (!source.includes(marker)) throw new Error(item.name + " misses " + marker);
  }
  if (/\b(?:x|y|scale):\s*/.test(source) || /\brepeat:\s*/.test(source)) throw new Error(item.name + " contains rejected motion");
  for (const match of source.matchAll(/\b(duration|delay):\s*(\d+(?:\.\d+)?)/g)) {
    const limit = match[1] === "duration" ? 0.28 : 0.08;
    if (Number(match[2]) > limit) throw new Error(item.name + " exceeds " + match[1] + " budget");
  }
  for (const match of source.matchAll(/delay:\s*(?:\d+(?:\.\d+)?\s*\+\s*)?(?:custom|i)\s*\*\s*(\d+(?:\.\d+)?)/g)) {
    if (Number(match[1]) > 0.04) throw new Error(item.name + " exceeds dynamic delay budget");
  }
  for (const match of source.matchAll(/CREATE_[A-Z_]+_VARIANTS\((\d+(?:\.\d+)?)\)/g)) {
    if (Number(match[1]) > 0.08) throw new Error(item.name + " exceeds variant delay budget");
  }
  const previewPath = item.meta.tasteblocks.preview.replace("previews/drafts/heroicons-animated/", "");
  const preview = await readFile(path.join(root, "../../../previews/drafts/heroicons-animated", previewPath), "utf8");
  for (const event of ["onFocus", "onBlur", "onPointerEnter", "onPointerLeave", "onPointerDown", "onPointerUp", "onPointerCancel"]) {
    if (!preview.includes(event)) throw new Error(item.name + " preview misses " + event);
  }
}
if (digest(await readFile(path.join(root, "LICENSE"))) !== "523f3bb472b7b76b6137becbf45c4d6019cdfbe7a1eef0807e480f7d1cf7ed40") throw new Error("Heroicons Animated license changed");
if (digest(await readFile(path.join(root, "LUCIDE_ANIMATED_LICENSE"))) !== "b77c01c81935b05f8f5ec43652cd6a29675e1b1b7505ac66cd9ac1f4ef4ac3ef") throw new Error("Lucide Animated license changed");
if (digest(await readFile(path.join(root, "HEROICONS_LICENSE"))) !== "60e0b68c0f35c078eef3a5d29419d0b03ff84ec1df9c3f9d6e39a519a5ae7985") throw new Error("Heroicons license changed");

if (upstreamRoot) {
  const git = (args, encoding) => execFileSync("git", ["-C", upstreamRoot, ...args], encoding ? { encoding } : undefined);
  assert(git(["rev-parse", `${revision}^{commit}`], "utf8").trim() === revision, "Pinned upstream revision is unavailable");
  const inventory = git(["ls-tree", "-r", "--name-only", revision, "packages/react/src/icons"], "utf8")
    .split(/\r?\n/)
    .filter((file) => /^packages\/react\/src\/icons\/[a-z0-9-]+\.tsx$/.test(file));
  assert(inventory.length === 316, "Deep upstream inventory is not 316 React icons");
  assert(
    digest(git(["show", `${revision}:registry.json`])) === storedDigest(report.source.inventory.registrySha256),
    "Pinned upstream registry hash changed",
  );
  for (const item of manifest.items) {
    for (const mapping of item.meta.tasteblocks.source.files) {
      const upstream = git(["show", `${revision}:${mapping.upstreamPath}`]);
      assert(digest(upstream) === storedDigest(mapping.upstreamSha256), `${item.name} upstream hash changed for ${mapping.upstreamPath}`);
    }
  }
}

console.log(JSON.stringify({
  upstream: 316,
  retained: 30,
  rejected: 286,
  collisions: 0,
  deepUpstreamGitChecks: Boolean(upstreamRoot),
}, null, 2));
