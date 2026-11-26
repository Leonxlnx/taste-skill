// Run with Node 22 or newer. CHROME_PATH may point to a Chromium installation.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const assets = new URL("../skills/taste-skill/assets/", import.meta.url);
const gallery = readFileSync(new URL("own/gallery-own-c.html", assets), "utf8");
const sections = [...gallery.matchAll(/<section\b[^>]* data-own="([^"]+)"/g)].map(
  (match) => "own/" + match[1] + ".html",
);
assert.equal(new Set(sections).size, 20, "The gallery must expose twenty distinct examples");
const pages = ["software", "app", "product", "place"].map((name) => "pages/" + name + ".html");
const rules = readFileSync(new URL("layout/layout-check.js", assets), "utf8");
const catalogue = JSON.parse(readFileSync(new URL("moments/index.json", assets))).moments.map(
  ({ id, text }) => ({ id, text }),
);
const chrome = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/chromium",
  "/usr/bin/google-chrome",
].find((p) => p && existsSync(p));
assert(chrome, "Set CHROME_PATH to a Chromium executable");
const suppliedProfile = process.env.TASTE_SKILL_CHROME_PROFILE;
const profileRoot = suppliedProfile || process.env.TASTE_SKILL_TMP || tmpdir();
mkdirSync(profileRoot, { recursive: true });
const profile = mkdtempSync(join(profileRoot, "layouts-"));
const child = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--disable-background-networking",
    "--no-first-run",
    "--remote-debugging-port=0",
    "--user-data-dir=" + profile,
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);
const contentTypes = {
  html: "text/html; charset=utf-8",
  js: "text/javascript",
  css: "text/css",
  jpg: "image/jpeg",
  webp: "image/webp",
};
const server = createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const source = new URL("." + pathname, assets);
    if (!source.href.startsWith(assets.href)) throw Error("Outside assets");
    const data = readFileSync(source);
    response.writeHead(200, {
      "Content-Type": contentTypes[pathname.split(".").pop()] || "application/octet-stream",
    });
    response.end(data);
  } catch {
    response.writeHead(404).end();
  }
});
let ws;
try {
  await new Promise((resolve, reject) =>
    server.once("error", reject).listen(0, "127.0.0.1", resolve),
  );
  const origin = "http://127.0.0.1:" + server.address().port + "/";
  const portFile = join(profile, "DevToolsActivePort");
  let port = 0;
  for (let i = 0; i < 600 && !port; i++) {
    try {
      port = Number.parseInt(readFileSync(portFile, "utf8"), 10) || 0;
    } catch (error) {
      if (!["ENOENT", "EBUSY", "EPERM", "EACCES"].includes(error.code)) throw error;
    }
    if (!port) await sleep(100);
  }
  assert(port, "Chrome did not publish a readable debugging port");
  const [tab] = await (await fetch("http://127.0.0.1:" + port + "/json/list")).json();
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  const pending = new Map(),
    errors = [];
  let seq = 0,
    loads = 0;
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.method === "Page.loadEventFired") loads++;
    if (msg.id) {
      const callback = pending.get(msg.id);
      if (callback) callback(msg);
      pending.delete(msg.id);
    }
    if (
      msg.method === "Runtime.exceptionThrown" ||
      (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error")
    )
      errors.push(msg.params);
  };
  function send(method, params = {}) {
    const id = ++seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error("Chrome timed out during " + method));
      }, 60000);
      pending.set(id, (msg) => {
        clearTimeout(timer);
        msg.error ? reject(Error(msg.error.message)) : resolve(msg.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  await send("Page.enable");
  await send("Runtime.enable");
  await send("DOM.enable");
  const failures = [];
  for (const file of [...sections, ...pages]) {
    const page = pages.includes(file);
    const previousLoads = loads;
    await send("Page.navigate", { url: new URL(file, origin).href });
    for (let i = 0; i < 600 && loads === previousLoads; i++) await sleep(100);
    assert(loads > previousLoads, "Load timed out: " + file);
    await evaluate("document.fonts.ready.then(() => true)");
    for (const width of [1440, 1024, 390]) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: width === 390 ? 844 : 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await evaluate(
        "new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done)))",
      );
      const context = file + " at " + width;
      const overflow = await evaluate("document.documentElement.scrollWidth - innerWidth");
      if (overflow > 0) failures.push(context + ": overflow " + overflow);
      const broken = await evaluate(
        "[...document.images].filter(img => !img.complete || !img.naturalWidth).map(img => img.src)",
      );
      if (broken.length) failures.push(context + ": broken images " + broken.join(", "));
      const findings = await evaluate(rules + "\nwindow.lyCheck().findings");
      if (width !== 1024)
        findings.push(
          ...(await evaluate("window.lyFinish(" + JSON.stringify({ catalogue }) + ")")),
        );
      for (const finding of findings.filter((finding) => finding.sev !== "WARN")) {
        failures.push(context + ": " + finding.rule + " " + finding.where + " " + finding.detail);
      }
      if (page && width === 1440) {
        const wideSubject = await evaluate(`[...document.querySelectorAll("main figure, main img, main svg, main .drinks")].some(el => el.getBoundingClientRect().width >= innerWidth * .8)`);
        assert(wideSubject, context + ": no wide subject");
        const missingDestinations = await evaluate(`[...document.querySelectorAll('a[href^="#"]')].filter(a => !document.getElementById(a.hash.slice(1))).map(a => a.hash)`);
        assert.deepEqual(missingDestinations, [], context + ": broken section link");
      }
      if (page) {
        const bands = await evaluate(
          'Array.from(document.querySelectorAll("main > section"), el => ({family:el.dataset.family,width:el.dataset.width}))',
        );
        assert(
          bands.every((band) => band.family && band.width),
          context + ": missing rhythm metadata",
        );
        assert([9, 10].includes(bands.length), context + ": expected nine or ten sections");
        assert(new Set(bands.map((band) => band.family)).size >= 5, context + ": one-family");
        let splits = 0;
        for (const band of bands) {
          splits = band.family === "split" ? splits + 1 : 0;
          assert(splits <= 2, context + ": split-run");
        }
        assert(
          bands.filter((band, i) => i && band.width !== bands[i - 1].width).length >= 2,
          context + ": width changes",
        );
      }
    }
    console.log("Checked " + file);
  }
  const previousLoads = loads;
  await send("Page.navigate", {url:"about:blank"});
  for (let i=0; i<600 && loads === previousLoads; i++) await sleep(100);
  assert(loads > previousLoads, "Rhythm fixture did not load");
  await evaluate(rules + "\ntrue");
  // Exercise the public page check against real side-by-side geometry and declared families.
  for (const labelled of [false,true]) {
    for (const [forms, expected] of [
      [['hero','split','split','split'], []],
      [['hero','split','split','split','reading'], ['split-run']],
      [Array(5).fill('reading'), []],
      [Array(6).fill('reading'), ['one-family']],
      [['hero','split','split','reading','split','split'], []],
    ]) {
      const html = forms.map((family,i) => {
        const body = family === 'split' ? '<div style="display:flex"><p>Room schedule</p><p>Therapist schedule</p></div>'
          : family === 'hero' ? '<h1>Schedule</h1>' : '<p>Appointment</p>';
        return '<section id="s'+i+'"'+(labelled?' data-family="'+family+'"':'')+'>'+body+'</section>';
      }).join('');
      await evaluate('document.body.innerHTML = ' + JSON.stringify('<main>'+html+'</main>'));
      const findings = await evaluate('window.lyRules.page().filter(f => ["split-run","one-family"].includes(f.rule))');
      assert.deepEqual(findings.map(f => f.rule),expected,forms.join(', ')+' labelled='+labelled);
      assert(findings.every(f => f.sev === 'WARN'));
    }
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
  assert.equal(failures.length, 0, failures.join("\n"));
} finally {
  server.close();
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ id: 1000000, method: "Browser.close" }));
    for (let i = 0; i < 50 && child.exitCode === null; i++) await sleep(100);
  }
  ws?.close();
  if (child.exitCode === null && child.pid) {
    if (process.platform === "win32") {
      try {
        execFileSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      } catch {}
    } else child.kill();
  }
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  } catch (error) {
    console.warn("Profile cleanup deferred:", profile, error.code);
  }
}
