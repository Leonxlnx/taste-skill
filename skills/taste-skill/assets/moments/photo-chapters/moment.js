/*
  photo-chapters - a short story told in three to five photographs, one large frame at a time. The
  section holds on screen while the page scrolls: its h2 and lead at the top, below them one big
  photograph the width of the page's edges, and on it, at its lower left, a panel in the page's ground
  with the chapter in hand (its number, a title and two lines). As the reader scrolls, each next
  photograph is uncovered over the one before from its foot upward, settling from a slight zoom, and
  the panel changes to its chapter half way through the wipe. The wipe follows the scrollbar (it runs
  back on the way up) and takes under half of a chapter's share of the scroll; the photograph then
  holds for the rest, so there is time to read. Photo-led and calm: for a place, a product or a
  service (the room, the kitchen, the workshop, a day of a tour). No WebGL, no canvas.

    <section class="section" data-moment="photo-chapters">
      <div class="container mo-ph">
        <div class="mo-ph__head"><h2>A night at the harbour house</h2><p>One line.</p></div>
        <ol class="mo-ph__list">
          <li class="mo-ph__ch">
            <figure class="mo-ph__pic"><img src="…" alt="…" width="1800" height="1200"></figure>
            <h3>Arrive by the coast road</h3>
            <p>Two lines.</p>
          </li>
          …three to five chapters, one photograph each
        </ol>
      </div>
    </section>

  Its height is its own: live the section is (hold + 1) screens, the hold growing with the chapters
  (three chapters hold two screens, four or five hold three: about two thirds of a screen each), and
  at rest it is as tall as its chapters, one screen at least. Write no --h and no data-screen on it:
  the checker and the layout check read a live photo-chapters section (.is-live) as whole screens, four
  at most, and still hold it to that.
  At rest (reduced motion, no script, a failed module, a screen under 600px tall such as a phone
  turned sideways) the chapters stand side by side, each photograph over its title and lines (a phone
  stacks them): the same words and pictures, nothing hidden. Live at every width from 600px of
  height, so a phone held upright gets it too (one picture at a time, a clip and a transform).
  Every chapter's words stay in the page for a screen reader; only the one in hand is shown.
  opts: zoom (the settle, 1.06; 1-1.1).
*/
export const phone = true;

export default function (root, opts, lib) {
  const box = root.querySelector('.mo-ph') || root;
  const list = root.querySelector('.mo-ph__list');
  const chapters = [...root.querySelectorAll('.mo-ph__ch')];
  const pics = chapters.map(c => c.querySelector('.mo-ph__pic'));
  if (!list || chapters.length < 2 || pics.some(p => !p)) return {};
  const homes = pics.map(p => p.parentElement);
  const listHome = { parent: list.parentElement, next: list.nextSibling };
  const zoom = lib.clamp(+opts.zoom || 1.06, 1, 1.1);
  const n = chapters.length;
  // about two thirds of a screen of scroll a chapter, in whole screens so the section stays on the grid
  const hold = n <= 3 ? 2 : 3;
  // each chapter's words in a box of their own, so the live panel can stack them in one place
  chapters.forEach(c => {
    if (c.querySelector(':scope > .mo-ph__words')) return;
    const w = document.createElement('div');
    w.className = 'mo-ph__words';
    [...c.children].filter(el => !el.classList.contains('mo-ph__pic')).forEach(el => w.append(el));
    c.append(w);
  });
  const stage = document.createElement('div');
  stage.className = 'mo-ph__stage';
  const panel = document.createElement('div');
  panel.className = 'mo-ph__panel';
  const count = document.createElement('p');
  count.className = 'mo-ph__count';
  count.setAttribute('aria-hidden', 'true');
  panel.append(count);
  const pad = v => String(v).padStart(2, '0');
  let live = false, scrubber = null, on = -1;
  const fits = () => !lib.reduced() && innerHeight >= 600;
  const show = k => {
    if (k === on) return;
    on = k;
    chapters.forEach((c, i) => c.classList.toggle('is-on', i === k));
    count.textContent = `${pad(k + 1)} / ${pad(n)}`;
  };
  // p 0-1 over the held screens: chapter k owns [k/n, (k+1)/n). Its photograph is uncovered over the
  // 45% of a share that straddles that boundary, then holds; the words change half way through the wipe.
  // The last wipe ends at 0.2 of its share, so the last chapter holds to the section's end
  const draw = p => {
    const seg = 1 / n;
    let k = 0;
    pics.forEach((pic, i) => {
      const u = i === 0 ? 1 : lib.clamp((p - (i - 0.25) * seg) / (0.45 * seg));
      const e = lib.ease.out(u);
      pic.style.setProperty('--mo-c', `${((1 - e) * 100).toFixed(2)}%`);
      pic.style.setProperty('--mo-z', (zoom - (zoom - 1) * e).toFixed(4));
      if (u >= 0.5) k = i;
    });
    show(k);
  };
  const go = () => {
    if (live) return;
    live = true;
    root.style.setProperty('--mo-hold', String(hold));
    pics.forEach(p => stage.append(p));
    panel.append(list);
    stage.append(panel);
    box.append(stage);
    root.classList.add('is-live');
    box.setAttribute('data-edge-free', '');   // live the box is one held screen of the section: the layout check skips it
    draw(0);
    scrubber = lib.scrub(root, draw);
  };
  const rest = () => {
    if (!live) return;
    live = false;
    scrubber?.destroy(); scrubber = null;
    root.classList.remove('is-live');
    root.style.removeProperty('--mo-hold');
    box.removeAttribute('data-edge-free');
    listHome.parent.insertBefore(list, listHome.next);
    pics.forEach((p, i) => { homes[i].prepend(p); p.style.removeProperty('--mo-c'); p.style.removeProperty('--mo-z'); });
    chapters.forEach(c => c.classList.remove('is-on'));
    stage.remove();
    on = -1;
  };
  const sync = () => (fits() ? go() : rest());
  sync();
  let t = 0;
  const onResize = () => { clearTimeout(t); t = setTimeout(sync, 120); };
  addEventListener('resize', onResize);
  const rq = matchMedia('(prefers-reduced-motion: reduce)');
  rq.addEventListener('change', sync);
  return { destroy() { removeEventListener('resize', onResize); rq.removeEventListener('change', sync); rest(); } };
}
