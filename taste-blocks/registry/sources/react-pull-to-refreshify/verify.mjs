import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

import { checkDrafts } from "../../../scripts/check-drafts.mjs";

const sourceRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(sourceRoot, "../../..");
const componentRoot = path.join(
  sourceRoot,
  "components/react-pull-to-refreshify"
);
const mainFile = path.join(componentRoot, "PullToRefreshify.tsx");
const previewFile = path.join(
  projectRoot,
  "previews/drafts/react-pull-to-refreshify/react-pull-to-refreshify.tsx"
);

const { total } = await checkDrafts(projectRoot, "react-pull-to-refreshify");
assert.equal(total, 1);

const program = ts.createProgram([mainFile, previewFile], {
  baseUrl: projectRoot,
  esModuleInterop: true,
  isolatedModules: true,
  jsx: ts.JsxEmit.ReactJSX,
  lib: ["lib.dom.d.ts", "lib.dom.iterable.d.ts", "lib.esnext.d.ts"],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  paths: { "@/*": ["*"] },
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2017,
});
const diagnostics = ts.getPreEmitDiagnostics(program);
assert.equal(
  diagnostics.length,
  0,
  ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: () => projectRoot,
    getNewLine: () => "\n",
  })
);

const main = await readFile(mainFile, "utf8");
const drag = await readFile(path.join(componentRoot, "utils/useDrag.ts"), "utf8");
const scroll = await readFile(
  path.join(componentRoot, "utils/useScrollParent.ts"),
  "utf8"
);

for (const required of [
  'type="button"',
  'role="status"',
  "aria-busy",
  "prefers-reduced-motion: reduce",
  "refreshRequestedRef",
  "completeTimerRef",
]) {
  assert(main.includes(required), `Missing component gate: ${required}`);
}
for (const required of [
  '"touchcancel"',
  '"pointercancel"',
  '"mousemove"',
  '"mouseup"',
  '"visibilitychange"',
]) {
  assert(drag.includes(required), `Missing drag cleanup gate: ${required}`);
}
for (const required of [
  "ResizeObserver",
  '"orientationchange"',
  "scrollHeight > current.clientHeight",
]) {
  assert(scroll.includes(required), `Missing scroll-boundary gate: ${required}`);
}

const tsxCli = path.join(projectRoot, "node_modules/tsx/dist/cli.mjs");
const ssrCheck = String.raw`
  import React from "react";
  import { renderToString } from "react-dom/server";
  import { PullToRefreshify } from "./registry/sources/react-pull-to-refreshify/components/react-pull-to-refreshify/PullToRefreshify.tsx";

  const html = renderToString(React.createElement(PullToRefreshify, {
    onRefresh() {},
    renderText(status) { return status; },
  }, React.createElement("div", null, "Content")));
  if (!html.includes("Refresh") || !html.includes("aria-busy")) process.exitCode = 1;
`;
execFileSync(
  process.execPath,
  [tsxCli, "--tsconfig", path.join(projectRoot, "tsconfig.json"), "--eval", ssrCheck],
  {
    cwd: projectRoot,
    stdio: "pipe",
  }
);

console.log("react-pull-to-refreshify: policy, strict TypeScript, gates, and SSR passed");
