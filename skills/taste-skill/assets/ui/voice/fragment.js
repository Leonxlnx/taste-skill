// voice: one line per cycle (about 2.75 s): the assistant speaks it (its words step back to about 72% ink
// and come up in order in under 0.8 s while the waveform moves), the finished line holds while it
// listens; the timer counts on. No word ever drops below 72% ink (4.5:1 on white). The lines are the page's own: the caption as written, or
// opts.lines in turn; the timer starts from the time as written. The orb follows the fragment's surface (see fragment.css):
// - dark surface: a live orb-sphere from ../effects (a pale nebula with specks of light in a dark disc);
// - light surface: the CSS pearl, no WebGL at all.
// opts.lines: the captions; opts.orb: false keeps the CSS pearl on dark too; opts.orbParams tunes the live orb.
import { loop, isStill, withLoop } from '../ui.js';


// the surface the fragment actually paints (any CSS colour, relative colours too), read through a canvas
let probe = null;
function isDarkSurface(el) {
  try {
    probe = probe || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    probe.canvas.width = probe.canvas.height = 1;
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = '#fff';
    probe.fillStyle = getComputedStyle(el).backgroundColor;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
    if (a < 128) return false;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b < 110;
  } catch { return false; }
}

export default function init(root, opts = {}) {
  const cap = root.querySelector('[data-voice-cap]'), time = root.querySelector('[data-voice-time]');
  const lines = opts.lines || [cap ? cap.textContent.trim() : ''];
  const orb = root.querySelector('[data-voice-orb]');
  let fxCtl = null, fxMod = null, alive = true, want = 0;
  const orbPalette = () => {
    const pal = fxMod.default.readPalette(root);
    // a pale, nearly neutral light: the ink with a trace of the surface, so the orb never takes a hue
    return { ...pal, bg: fxMod.color.mix(pal.bg, '#000000', 0.35), accent: fxMod.color.mix(pal.ink, pal.bg, 0.12) };
  };
  async function sync() {
    const n = ++want;
    const dark = opts.orb !== false && orb && isDarkSurface(root);
    if (!dark) {
      if (fxCtl) { fxCtl.destroy(); fxCtl = null; }
      if (orb) orb.classList.remove('has-fx');
      return;
    }
    try {
      fxMod = fxMod || await import(new URL('../../effects/fx.js', import.meta.url).href);
      if (!alive || n !== want) return;
      if (fxCtl) { fxCtl.setPalette(orbPalette()); return; }
      fxCtl = await fxMod.default.mount(orb, 'orb-sphere', {
        palette: orbPalette(),
        params: { size: 0.5, rim: 0.7, glow: 0.12, stars: 46, innerContrast: 0.6, speed: 0.06, pulse: 0, calm: 0, orbX: 0.5, orbY: 0.5, ...(opts.orbParams || {}) },
        seed: 12,
      });
      if (!alive || n !== want) { fxCtl.destroy(); fxCtl = null; return; }
      orb.classList.add('has-fx');
      // held still (data-ui-still) or paused: the orb holds one frame too
      if (isStill(root) || root.classList.contains('is-ui-paused')) fxCtl.pause();
    } catch { /* no effects next to ui: the pearl stays */ }
  }
  sync();
  // the timer counts on from the time as written (mm:ss); one it cannot read is left as it is
  const t0 = time ? time.textContent.trim().match(/^(\d+):(\d{2})$/) : null;
  const secs0 = t0 ? +t0[1] * 60 + +t0[2] : null;
  let secs = secs0;
  const clock = () => { if (secs == null) return; const m = Math.floor(secs / 60), s = secs % 60; time.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`; };
  const esc = w => w.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const wordsOf = line => line.split(/\s+/).filter(Boolean);
  const say = (line, k) => {
    if (!cap) return;
    cap.innerHTML = wordsOf(line).map((w, i) => `<span${i < k ? '' : ' class="is-off"'}>${esc(w)}</span>`).join(' ');
  };
  let k = 0;
  const ctl = loop(root, async api => {
    const line = lines[k++ % lines.length];
    const n = wordsOf(line).length;
    const per = Math.max(40, Math.min(110, 720 / Math.max(1, n)));
    say(line, 0);
    root.classList.add('is-talking');
    await api.wait(400);
    for (let j = 1; j <= n; j++) { say(line, j); await api.wait(per); }
    await api.wait(Math.max(1000, 1970 - per * n));
    root.classList.remove('is-talking');
    if (secs != null) { secs += 3; clock(); }
    await api.wait(380);
  }, { still: () => { k = 0; secs = secs0; root.classList.remove('is-talking'); say(lines[0], 999); clock(); } });
  return {
    ...withLoop(ctl, () => { alive = false; ctl.destroy(); if (fxCtl) fxCtl.destroy(); }),
    // after a theme change: the live orb takes the new colours, or gives way to the pearl (and back)
    repaint() { sync(); },
  };
}
