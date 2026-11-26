// Run with Node 22 or newer. CHROME_PATH may point to a Chromium installation.
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const parts = new URL('../skills/taste-skill/assets/motion/parts/', import.meta.url);
const demos = readdirSync(parts, { withFileTypes: true })
  .filter((item) => item.isDirectory())
  .map((item) => item.name + '/demo.html');
demos.push('demo-loop/phone.html', 'index.html');
const chrome = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].find((p) => p && existsSync(p));
assert(chrome, 'Set CHROME_PATH to a Chromium executable');
const profile = mkdtempSync(join(process.env.MOTION_PARTS_PROFILE_ROOT || tmpdir(), 'motion-parts-'));
const child = spawn(
  chrome,
  [
    '--headless=new',
    '--disable-gpu',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--disable-background-networking',
    '--no-first-run',
    '--remote-debugging-port=0',
    '--user-data-dir=' + profile,
    'about:blank',
  ],
  { stdio: 'ignore', windowsHide: true },
);
function readableInReducedMode(){
  const visible=el=>el.getBoundingClientRect().height>0 && getComputedStyle(el).visibility!=='hidden' && Number(getComputedStyle(el).opacity)>0 && !el.closest('[inert]');
  for(const section of document.querySelectorAll('section[data-part]')){
    if(!visible(section))return false;
    switch(section.dataset.part){
      case 'feature-tabs':
        for(const tab of section.querySelectorAll('[role=tab]')){
          tab.click();if(!visible(document.getElementById(tab.getAttribute('aria-controls'))))return false;
        }
        break;
      case 'accordion':
        for(const fold of section.querySelectorAll('.fold')){
          const button=fold.querySelector('button');
          if(button.getAttribute('aria-expanded')==='false')button.click();
          if(!visible(fold.querySelector('.fold-body p')))return false;
        }
        break;
      case 'price-toggle':
        for(let i=0;i<2;i++){
          const checkbox=section.querySelector('input'),price=section.querySelectorAll('.rates p')[i];
          if(checkbox.checked!==Boolean(i))checkbox.click();
          if(!visible(price))return false;
        }
        break;
      case 'step-rail':
        if(![...section.querySelectorAll('article img')].every(visible))return false;
        break;
      case 'count-once': {
        const value=section.querySelector('[data-figure]');if(value.textContent!==value.dataset.figure)return false;
        break;
      }
      case 'video-inview':
        if(!section.querySelector('video').paused || !section.querySelector('video').poster)return false;
        break;
    }
  }
  return true;
}

let ws;
try {
  const portFile = join(profile, 'DevToolsActivePort');
  let port = 0;
  for (let i=0;i<600&&!port;i++) {
    try { port = Number.parseInt(readFileSync(portFile,'utf8'),10) || 0; }
    catch(error) { if(!['ENOENT','EBUSY','EPERM','EACCES'].includes(error.code)) throw error; }
    if(!port) await sleep(100);
  }
  assert(port,'Chrome did not publish a readable debugging port');
  const [tab] = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json();
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
    if (msg.method === 'Page.loadEventFired') loads++;
    if (msg.id) {
      const callback = pending.get(msg.id);
      if (callback) callback(msg);
      pending.delete(msg.id);
    }
    if (
      msg.method === 'Runtime.exceptionThrown' ||
      (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error')
    )
      errors.push(msg.params);
  };
  function send(method, params = {}) {
    const id = ++seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(Error(method + ' timed out'));
      }, 30000);
      pending.set(id, (msg) => {
        clearTimeout(timer);
        msg.error ? reject(Error(msg.error.message)) : resolve(msg.result);
      });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    assert(!result.exceptionDetails, JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');
  for (const file of process.argv.includes('--keyboard') ? [] : demos) {
    const url = new URL(file, parts).href;
    for (const width of [1440, 390]) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height: width === 390 ? 844 : 900,
        deviceScaleFactor: 1,
        mobile: false,
      });
      for (const mode of ['normal', 'reduced', 'static']) {
        await send('Emulation.setEmulatedMedia', {
          features: [
            { name: 'prefers-reduced-motion', value: mode === 'reduced' ? 'reduce' : 'no-preference' },
          ],
        });
        await send('Emulation.setScriptExecutionDisabled', { value: mode === 'static' });
        const target = url + '?' + mode + width;
        const previousLoads = loads;
        await send('Page.navigate', { url: target });
        for (let i = 0; i < 600 && previousLoads === loads; i++) await sleep(50);
        assert(loads > previousLoads, 'Load timed out: ' + target);
        // Running an inspector expression after load does not execute scripts skipped during parsing.
        await send('Emulation.setScriptExecutionDisabled', { value: false });
        await evaluate('document.fonts.ready');
        await sleep(100);
        assert(
          await evaluate('document.documentElement.scrollWidth<=innerWidth'),
          file + ' overflow ' + width + ' ' + mode,
        );
        assert(
          await evaluate('[...document.images].every(i=>i.complete&&i.naturalWidth>0)'),
          file + ' image',
        );
        assert.equal(await evaluate('location.href'), target);
        if (mode === 'static')
          assert(
            await evaluate(
              '!document.querySelector("[data-running],[data-ready],[role=tab],.fold button")',
            ),
            'script executed on static page',
          );
        if (mode === 'static')
          assert(
            await evaluate(
              '[...document.querySelectorAll("section figure,section article,.fold-body,.rates p,section .desk-panel,section nav")].every(el=>el.getBoundingClientRect().height>0)',
            ),
            file + ' static content',
          );
        if(mode==='reduced')assert(await evaluate('('+readableInReducedMode.toString()+')()'),file+' reduced content');
        if (mode === 'reduced' && file.startsWith('demo-loop/')) {
          assert(
            await evaluate(
              "document.querySelector('[data-status]').textContent===document.querySelector('template').content.querySelector('[data-action=status]').textContent && getComputedStyle(document.querySelector('[data-toast]')).opacity==='1'",
            ),
            file + ' finished proof',
          );
        }
        if (mode === 'reduced' && file === 'logo-row/demo.html') {
          assert(
            await evaluate(
              "!document.querySelector('[data-drift]') && !document.querySelector('.stock-track ul').hidden",
            ),
            'still stockist list',
          );
        }
        if (mode === 'reduced')
          assert(
            await evaluate('!document.querySelector(\'[data-running="true"]\')'),
            file + ' reduced loop',
          );
      }
    }
    assert.equal(errors.length, 0, JSON.stringify(errors));
    console.log(file + ' · desktop, mobile, reduced, static');
  }
  async function open(id) {
    await send('Page.navigate', { url: new URL(id + '/demo.html', parts).href });
    for (let i = 0; i < 100; i++) {
      if (
        await evaluate(
          'document.readyState==="complete" && !!document.querySelector(' +
            JSON.stringify('[data-part="' + id + '"]') +
            ')',
        )
      )
        break;
      await sleep(50);
    }
    await sleep(120);
  }
  async function key(name, code, virtual) {
    for (const type of ['keyDown', 'keyUp'])
      await send('Input.dispatchKeyEvent', {
        type,
        key: name,
        code,
        windowsVirtualKeyCode: virtual,
        text: type === 'keyDown' ? { Enter: '\r', Space: ' ' }[code] || '' : '',
      });
    await sleep(220);
  }
  await open('feature-tabs');
  await evaluate('document.querySelector("[role=tab]").focus()');
  await key('ArrowRight', 'ArrowRight', 39);
  assert.equal(
    await evaluate('document.querySelector("[aria-selected=true]").textContent'),
    'Drivetrain',
  );
  await open('accordion');
  await evaluate('document.querySelector(".fold button").focus()');
  await key('Enter', 'Enter', 13);
  assert(await evaluate('document.querySelector(".fold-body").inert'));
  await open('snap-gallery');
  await evaluate('document.querySelector(".gallery-track").focus()');
  await key('ArrowRight', 'ArrowRight', 39);
  assert(await evaluate('document.querySelector(".gallery-track").scrollLeft>0'));
  await open('compare');
  await evaluate('document.querySelector("input").focus()');
  await key('ArrowRight', 'ArrowRight', 39);
  assert.equal(await evaluate('document.querySelector("input").value'), '51');
  await open('price-toggle');
  await evaluate('document.querySelector("input").focus()');
  await key(' ', 'Space', 32);
  assert(
    await evaluate(
      'document.querySelector("input").checked && !document.querySelector(".rates p:last-child").inert',
    ),
  );
  await open('menu-sheet');
  await evaluate('document.querySelector("button").focus()');
  await key('Enter', 'Enter', 13);
  assert(await evaluate('document.querySelector("dialog").open'));
  for (let i = 0; i < 4; i++) {
    await key('Tab', 'Tab', 9);
    assert(
      await evaluate('document.querySelector("dialog").contains(document.activeElement)'),
      'modal focus',
    );
  }
  await key('Escape', 'Escape', 27);
  assert(
    await evaluate(
      '!document.querySelector("dialog").open && document.activeElement===document.querySelector("button")',
    ),
  );
  await open('demo-loop');
  assert(await evaluate('document.querySelector(".proof").dataset.running==="true"'));
  await evaluate('document.body.style.paddingBottom="220vh";scrollTo(0,document.body.scrollHeight)');
  await sleep(200);
  assert(await evaluate('document.querySelector(".proof").dataset.running==="false"'));
  console.log('Keyboard actions and off-screen pause passed.');
  assert.equal(errors.length, 0, JSON.stringify(errors));
} finally {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ id: 1000000, method: 'Browser.close' }));
    for (let i = 0; i < 50 && child.exitCode === null; i++) await sleep(100);
  }
  ws?.close();
  if (child.exitCode === null && child.pid) {
    if (process.platform === 'win32') {
      try {
        execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      } catch {}
    } else child.kill();
  }
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 });
  } catch (error) {
    console.warn('Profile cleanup deferred:', profile, error.code);
  }
}
