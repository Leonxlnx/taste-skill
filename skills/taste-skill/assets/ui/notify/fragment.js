// notify: one cycle (about 3 s): a notification slides in at the top and the oldest fades out at the
// bottom (FLIP for the shift); hold. What slides in is the page's own: opts.items [[icon, title, body]]
// (HTML) when given, else the oldest notification of the stack comes round to the top again. The times
// stay with their places ("now" at the top), and only the top one keeps its button.
import { loop } from '../ui.js';

export default function init(root, opts = {}) {
  const list = root.querySelector('[data-notify-list]');
  if (!list || !list.children.length) return null;
  const keep = list.children.length;
  const list0 = list.innerHTML;
  const times = [...list.children].map(li => li.querySelector('time')?.textContent ?? null);
  const fresh = opts.items ? opts.items.map(([ico, title, body]) => {
    const li = document.createElement('li');
    li.className = 'ui-note';
    li.innerHTML = `${ico}<span class="ui-note__text"><span class="ui-note__title">${title}<time></time></span><span class="ui-note__body">${body}</span></span>`;
    return li;
  }) : null;
  // the finished picture is the stack as written
  let n = 0;
  const still = () => { n = 0; if (list.innerHTML !== list0) list.innerHTML = list0; };
  // one cycle (2.82 s): three notifications slide in in turn, the oldest leaving; the third is held 0.4 s
  return loop(root, async api => { for (let step = 0; step < 3; step++) {
    const kids = [...list.children];
    const before = kids.map(k => k.getBoundingClientRect().top);
    const old = kids[kids.length - 1];
    const li = fresh ? fresh[n++ % fresh.length].cloneNode(true) : old.cloneNode(true);
    li.classList.remove('is-leave');
    li.classList.add('is-enter');
    li.querySelector('.ui-note__btn')?.remove();
    old.classList.add('is-leave');
    await api.wait(260);
    old.style.position = 'absolute';
    old.style.visibility = 'hidden';
    list.prepend(li);
    kids.forEach((k, i) => {
      if (k === old) return;
      const dy = before[i] - k.getBoundingClientRect().top;
      k.style.transition = 'none';
      k.style.transform = `translateY(${dy}px)`;
    });
    li.getBoundingClientRect();
    kids.forEach(k => { if (k !== old) { k.style.transition = ''; k.style.transform = ''; } });
    li.classList.remove('is-enter');
    old.remove();
    while (list.children.length > keep) list.lastElementChild.remove();
    // the times belong to the places: the top one is always the newest; only it keeps a button
    [...list.children].forEach((k, i) => {
      const t = k.querySelector('time');
      if (t && times[i] != null) t.textContent = times[i];
      if (i) k.querySelector('.ui-note__btn')?.remove();
    });
    await api.wait(step < 2 ? 820 : 400);
  } }, { still });
}
