const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const test = require("node:test");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const ts = require("typescript");

const componentDirectory = path.join(__dirname, "components/splitflap-display");
const displayFile = path.join(componentDirectory, "split-flap-display.tsx");
const slatFile = path.join(componentDirectory, "split-flap-slat.tsx");
const cssFile = path.join(componentDirectory, "split-flap.css");

function loadTsx(file, mocks = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const componentModule = new Module(file);
  componentModule.filename = file;
  componentModule.paths = Module._nodeModulePaths(path.dirname(file));
  const localRequire = componentModule.require.bind(componentModule);
  componentModule.require = (id) => (Object.hasOwn(mocks, id) ? mocks[id] : localRequire(id));
  componentModule._compile(output, file);
  return componentModule.exports;
}

const slat = loadTsx(slatFile);
const display = loadTsx(displayFile, {
  "./split-flap-slat": slat,
  "./split-flap.css": {},
});

test("keeps the mechanical alphabet deterministic", () => {
  assert.equal(slat.computeFlipCount("X", "D"), 18);
  assert.equal(slat.computeFlipCount("?", "D"), 0);
});

test("renders unsupported characters and keeps announcements opt-in", () => {
  const quiet = renderToStaticMarkup(
    React.createElement(display.SplitFlapDisplay, { words: ["A?"], slotCount: 2 }),
  );
  assert.match(quiet, /aria-live="off"[^>]*>A\?</);
  assert.doesNotMatch(quiet, /role="status"/);

  const announced = renderToStaticMarkup(
    React.createElement(display.SplitFlapDisplay, {
      announce: true,
      anchorWord: "HOME",
      words: ["AWAY", "HOME"],
    }),
  );
  assert.match(announced, /role="status"/);
  assert.match(announced, /aria-live="polite"[^>]*aria-atomic="true"[^>]*>HOME</);
});

test("excludes autonomous cycling and keeps motion work suspendable and cancelable", () => {
  const displaySource = fs.readFileSync(displayFile, "utf8");
  const slatSource = fs.readFileSync(slatFile, "utf8");
  const css = fs.readFileSync(cssFile, "utf8");

  assert.doesNotMatch(displaySource, /\bautoRotate\b|Math\.random|setInterval/);
  assert.match(displaySource, /Object\.is\(refreshSignal, previousRefreshSignal\.current\)/);
  assert.match(slatSource, /document\.hidden/);
  assert.match(slatSource, /addEventListener\("visibilitychange"/);
  assert.match(slatSource, /removeEventListener\("visibilitychange"/);
  assert.match(slatSource, /clearTimeout\(timer\)/);
  assert.match(slatSource, /cancelled = true/);
  assert.match(slatSource, /currentRef\.current = nextCharacter/);
  assert.match(slatSource, /prefers-reduced-motion: reduce/);
  assert.match(css, /max-width:\s*100%/);
  assert.match(css, /overflow-x:\s*auto/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
