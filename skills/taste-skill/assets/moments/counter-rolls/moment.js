/*
  counter-rolls - the digits of one to four proof figures roll once, like an odometer, when the row
  first comes on screen, and stop on the real figure. The figure is written in the HTML as its final
  value (without script it stands); the script builds a strip for every digit that starts and ends on
  that digit, so at rest (before the row enters, in a full-page shot, after the roll) the row reads as
  written, never as zeros. The right-most column turns the most (one turn more per column).

    <div class="grid" data-moment="counter-rolls">
      <div class="span-3"><p class="t-stat">64%</p><p class="t-small muted">of the Fortune 500 use it</p></div>
      …
    </div>

  Every .t-stat or [data-count] inside the host rolls (or the host itself when it is one). Whole
  numbers read best: tabular figures make a decimal point or a thousands comma as wide as a digit.
  opts: duration ms (1400), stagger ms between figures (90).
  Reduced motion, no script: the figures stand.
*/
export default function (root, opts, lib) {
  const nums = root.matches('[data-count], .t-stat') ? [root] : [...root.querySelectorAll('[data-count], .t-stat')];
  if (!nums.length || lib.reduced()) return {};
  const dur = opts.duration || 1400, stagger = opts.stagger ?? 90;
  const built = nums.map(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.classList.add('mo-cr');
    const frag = document.createDocumentFragment();
    const cols = [];
    for (const ch of text) {
      if (/\d/.test(ch)) {
        const target = +ch, turns = Math.min(4, 1 + cols.length);   // whole turns: the strip stops on the digit
        const col = document.createElement('span');
        col.className = 'mo-cr__col';
        col.setAttribute('aria-hidden', 'true');
        const strip = document.createElement('span');
        strip.className = 'mo-cr__strip';
        // the strip starts on the final digit, runs `turns` times round and ends on it again
        for (let d = 0; d <= turns * 10; d++) { const s = document.createElement('span'); s.textContent = String((target + d) % 10); strip.append(s); }
        col.append(strip);
        frag.append(col);
        cols.push({ strip, turns });
      } else {
        const s = document.createElement('span');
        s.className = 'mo-cr__ch';
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch;
        frag.append(s);
      }
    }
    el.textContent = '';
    el.append(frag);
    return { el, cols };
  });
  const anims = [];
  const run = () => built.forEach(({ el, cols }, n) => {
    el.classList.add('is-on');
    cols.forEach(({ strip, turns }, c) => {
      const a = strip.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${-turns * 10}em)` }], { duration: dur + c * 140, delay: n * stagger, easing: 'cubic-bezier(.2, .8, .2, 1)', fill: 'forwards' });
      // the last cell is the same digit as the first: cancelling at the end leaves the strip at rest, no change on screen
      a.finished.then(() => { try { a.cancel(); } catch { /* gone */ } }, () => {});
      anims.push(a);
    });
  });
  const seen = lib.once(root, run, { threshold: 0.4 });
  return { destroy() { seen.destroy(); anims.forEach(a => { try { a.cancel(); } catch { /* done */ } }); } };
}
