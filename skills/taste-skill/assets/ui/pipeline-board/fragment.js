// pipeline-board: the running step moves down the pipeline to the end, the run passes, and the board goes
// back to the picture it started from. One cycle (about 3.4 s) starts and ends on the markup as written
// (here: two steps done, Test running at --k 0.6, Build and Deploy waiting): the running step's bar fills,
// it turns done with its time and the next step starts, and so on to the last; the run passes (the chip
// and the button take their done words, the total stands) and holds 0.7 s; the button is pressed and
// every step goes straight back to the written picture, which holds 0.45 s (about 13%). So a pointer
// leaving mid-run and a page's still both show exactly the picture a cycle ends on, never a jump.
// A board written with the run already passed starts with the button pressed and the first step
// running, and ends on the passed run. Every word comes from the markup: a step's time when done is
// data-time on its time cell (or the cell's text on a step already done); the chip's and the button's
// words when the run has passed are their data-done. Only figures follow: the running step's time counts
// up to its data-time with its bar, and the total adds the steps up, in the format the markup writes
// them ("1m 06s" or "1:06"); a time it cannot read stays as written.
// Held on a phone and under reduced motion by the kit (system.js or ui.plan, data-ui-still; ui.loop).
import { loop } from '../ui.js';

const secs = t => {
  const s = (t || '').trim();
  let m = s.match(/^(\d+):(\d{1,2})$/);
  if (m) return +m[1] * 60 + +m[2];
  m = s.match(/^(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?$/);
  return m && (m[1] || m[2]) ? (+m[1] || 0) * 60 + (+m[2] || 0) : NaN;
};

export default function init(root) {
  const steps = [...root.querySelectorAll('.ui-pipe__step')];
  const times = steps.map(s => s.querySelector('[data-time]'));
  if (steps.length < 2 || times.some(t => !t)) return null;
  const N = steps.length;
  const chip = root.querySelector('[data-pipe-chip]'), btn = root.querySelector('[data-pipe-btn]'), total = root.querySelector('[data-pipe-total]');
  const lines = [...root.querySelectorAll('.ui-pipe__line')];
  const text = (el, s) => { if (el && el.textContent !== s) el.textContent = s; };

  // the markup as written: the finished picture
  const first = steps.map((s, i) => ({ done: s.classList.contains('is-done'), run: s.classList.contains('is-run'), k: s.style.getPropertyValue('--k'), text: times[i].textContent }));
  const final = times.map((t, i) => t.dataset.time || (first[i].done ? t.textContent : ''));
  const waitText = first.map(f => (f.done || f.run ? '' : f.text));
  const T = final.map(secs);
  const total0 = total ? total.textContent : '';
  const chip0 = chip ? chip.textContent : '', chipDone = chip?.dataset.done ?? chip0;
  const btn0 = btn ? btn.textContent : '', btnDone = btn?.dataset.done ?? btn0;
  const colon = [total0, ...final].some(s => /:/.test(s));
  const counts = T.every(Number.isFinite);
  const fmt = v => {
    const s = Math.max(0, Math.round(v)), m = Math.floor(s / 60), r = s % 60;
    if (colon) return `${m}:${String(r).padStart(2, '0')}`;
    return m ? `${m}m ${String(r).padStart(2, '0')}s` : `${r}s`;
  };
  const run0 = first.findIndex(f => f.run);
  const j0 = run0 >= 0 ? run0 : first.every(f => f.done) ? N : Math.max(0, first.findIndex(f => !f.done));
  const k0 = Math.min(1, Math.max(0, parseFloat(first[j0]?.k) || 0));

  // j: the running step (N when the run has passed); k: its bar, 0 to 1
  let j = j0, k = k0;
  const tick = () => {
    if (j >= N) return;
    steps[j].style.setProperty('--k', k.toFixed(3));
    if (!counts) return;
    text(times[j], fmt(k * T[j]));
    if (total && Number.isFinite(secs(total0))) text(total, fmt(T.slice(0, j).reduce((a, b) => a + b, 0) + k * T[j]));
  };
  const paint = () => {
    steps.forEach((s, i) => {
      const done = i < j, run = i === j;
      s.classList.toggle('is-done', done);
      s.classList.toggle('is-run', run);
      s.style.setProperty('--k', done ? '1' : run ? k.toFixed(3) : '0');
      text(times[i], done ? final[i] : run ? (counts ? fmt(k * T[i]) : first[i].run ? first[i].text : '') : waitText[i]);
    });
    const passed = j >= N;
    root.classList.toggle('is-passed', passed);
    if (chip) { text(chip, passed ? chipDone : chip0); chip.classList.toggle('ui-chip--live', !passed); }
    text(btn, passed ? btnDone : btn0);
    if (total && counts && Number.isFinite(secs(total0))) text(total, fmt(T.slice(0, Math.min(j, N)).reduce((a, b) => a + b, 0) + (passed ? 0 : k * T[j])));
    const on = steps[Math.min(j, N - 1)].dataset.step;
    lines.forEach(l => l.classList.toggle('is-on', l.dataset.step === on));
  };
  // the markup as written, exactly: the running step's time and the total as written
  const restore = () => {
    j = j0; k = k0;
    paint();
    times.forEach((t, i) => { if (i === j0) text(t, first[i].text); });
    text(total, total0);
  };
  const still = () => {
    root.classList.remove('is-reset');
    if (btn) btn.classList.remove('is-pressed');
    restore();
  };
  const press = async api => {
    if (btn) btn.classList.add('is-pressed');
    await api.wait(160);
    if (btn) btn.classList.remove('is-pressed');
  };

  // one cycle (about 3.4 s): 0.15 s on the picture, the running step and every one after it fill in turn
  // (the first at least 0.4 s, the rest about 0.7 s), the passed run held 0.7 s, the button pressed (0.16 s),
  // every step back at once (0.14 s) and the written picture held 0.45 s
  return loop(root, async api => {
    const fill = (to, ms) => { const from = k; return api.tween(ms, e => { k = from + (to - from) * e; tick(); }, e => e); };
    await api.wait(150);
    const startPassed = j >= N;
    if (startPassed) {
      await press(api);
      root.classList.add('is-reset');
      j = 0; k = 0;
      paint();
      await api.wait(140);
      root.classList.remove('is-reset');
    }
    const units = (1 - k) + (N - j - 1);
    const unit = Math.min(900, Math.max(350, (startPassed ? 2500 : 1800) / Math.max(1, units)));
    while (j < N) {
      await fill(1, Math.max(350, Math.round((1 - k) * unit)));
      j++; k = 0;
      paint();
    }
    if (startPassed) { await api.wait(450); return; }
    await api.wait(700);                          // passed: Passed, Re-run and the frozen total, read
    await press(api);
    root.classList.add('is-reset');
    restore();
    await api.wait(140);
    root.classList.remove('is-reset');
    await api.wait(450);
  }, { still });
}
