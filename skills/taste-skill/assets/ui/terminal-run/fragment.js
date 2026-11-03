// terminal-run: one run per cycle (about 3.1 s). The finished picture is the markup as written: a
// command that ran, its output, the status line and a fresh prompt with the caret. A cycle types the
// command again at that fresh prompt, character by character, and runs it: the output lines stream in
// below one by one. Each file's line arrives running (the kit's .ui-spin where its tick goes), then
// its tick settles and the meter fills a step (its count's first figure follows); the summary and the
// status line with its green check follow, then a fresh prompt. The screen keeps its height and the
// older run scrolls up under it a whole row at a time, each line leaving the top fading out whole, so
// the cycle ends on exactly the finished picture and the next one starts from it without a jump; the
// window is never empty. Every word is the page's own: the command is [data-term-cmd] as written (or
// opts.cmd), the lines are the [data-term-out] lines as written (cloned in order), and only the
// meter's first figure changes. A phone and a page's still fragments are held by ui.plan, as for
// every fragment.
import { loop } from '../ui.js';

export default function init(root, opts = {}) {
  const screen = root.querySelector('[data-term-screen]');
  const track = root.querySelector('[data-term-track]');
  const cmd = root.querySelector('[data-term-cmd]');
  const next = root.querySelector('[data-term-next]');
  const outs = [...root.querySelectorAll('[data-term-out]')];
  const typed = next && next.querySelector('.ui-term__typed');
  if (!screen || !track || !cmd || !next || !typed || !outs.length) return null;
  // opts.cmd replaces the command as written, so the first prompt and the typed one always agree
  if (typeof opts.cmd === 'string' && opts.cmd) cmd.textContent = opts.cmd;
  const text = cmd.textContent;
  // the fresh prompt as written (empty, its caret on), for the end of each run
  const fresh = next.cloneNode(true);
  fresh.removeAttribute('data-term-next');

  // the meter: its bar at --p (0..1) and its count's first figure, the words kept as written
  const steps = outs.filter(o => o.hasAttribute('data-term-step')).length || 1;
  const meter = (el, k) => {
    const bar = el.querySelector('.ui-term__bar');
    if (bar) bar.style.setProperty('--p', String(k / steps));
    const c = el.querySelector('[data-term-count]');
    if (c) {
      if (c.dataset.termText == null) c.dataset.termText = c.textContent;
      c.textContent = c.dataset.termText.replace(/\d+/, String(k));
    }
  };

  // scroll by whole 20px rows (every line is one row) and fade out whole each line that leaves the top
  const ROW = 20;
  const pad = () => parseFloat(getComputedStyle(track).paddingTop) || 0;
  let added = [];
  const scroll = () => {
    const over = Math.max(0, track.offsetHeight - screen.clientHeight);
    const dy = Math.max(0, Math.ceil((over - 2) / ROW)) * ROW;
    track.style.transform = dy ? `translateY(${-dy}px)` : '';
    const top = dy + pad();
    for (const ln of track.children) ln.classList.toggle('is-gone', ln.offsetTop < top - 1);
  };
  const add = el => {
    el.classList.add('is-new');
    el.classList.remove('is-gone');
    el.removeAttribute('data-term-out');
    el.setAttribute('aria-hidden', 'true');
    track.append(el);
    added.push(el);
    scroll();
  };
  // a file's line arrives running: the kit's spinner where its tick goes
  const running = el => {
    const tick = el.querySelector('.ui-term__tick');
    if (!tick) return () => {};
    const wait = document.createElement('span');
    wait.className = 'ui-term__wait';
    wait.innerHTML = '<i class="ui-spin"></i>';
    tick.replaceWith(wait);
    return () => { tick.classList.add('is-new'); wait.replaceWith(tick); };
  };
  // back to the markup as written: no copies, no scroll, no faded line, the fresh prompt empty with
  // its caret; nothing transitions on the way back
  const reset = () => {
    added.forEach(el => el.remove());
    added = [];
    const gone = [...track.querySelectorAll('.is-gone')];
    gone.forEach(el => { el.style.transition = 'none'; el.classList.remove('is-gone'); });
    track.style.transition = 'none';
    track.style.transform = '';
    screen.style.height = '';
    typed.textContent = '';
    root.classList.remove('is-typing');
    next.classList.remove('is-ran');
    void track.offsetHeight;
    track.style.transition = '';
    gone.forEach(el => { el.style.transition = ''; });
  };

  // one cycle (about 3.1 s): 0.16 s on the prompt, the command typed in about 0.8 s (50 to 80 ms a
  // character, 12 to 20 characters a second), Enter, the meter and four file lines in 1.1 s (each: the
  // scroll, 0.15 s running with a spinner, then its tick), the summary and the status in 0.45 s, the
  // fresh prompt held 0.4 s (about 13% of the cycle)
  const per = Math.max(50, Math.min(80, 800 / Math.max(1, text.length)));
  return loop(root, async api => {
    reset();
    screen.style.height = `${screen.offsetHeight}px`;
    await api.wait(160);
    root.classList.add('is-typing');
    // typed by the cycle's clock, a tween of the length the characters take: a slow frame skips a character
    // instead of stretching the cycle
    let shown = 0;
    await api.tween(Math.round(per * text.length), k => {
      const n = Math.min(text.length, Math.ceil(k * text.length));
      if (n !== shown) { shown = n; typed.textContent = text.slice(0, n); }
    }, k => k);
    root.classList.remove('is-typing');
    await api.wait(100);
    next.classList.add('is-ran');
    let bar = null, k = 0;
    for (const o of outs) {
      const c = o.cloneNode(true);
      if (o.hasAttribute('data-term-meter')) { bar = c; meter(c, 0); }
      if (o.hasAttribute('data-term-step')) {
        const finish = running(c);
        add(c);
        await api.wait(80);      // the scroll, then the row arrives
        await api.wait(150);     // running: a spinner long enough to read
        finish();
        if (bar) meter(bar, ++k);
        await api.wait(30);
      } else {
        add(c);
        // the blank row comes with the line after it
        if (c.textContent.trim()) await api.wait(o.hasAttribute('data-term-done') ? 260 : 100);
      }
    }
    add(fresh.cloneNode(true));
    await api.wait(400);
  }, { still: reset });
}
