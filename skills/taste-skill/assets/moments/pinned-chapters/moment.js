import { chapterFrame } from '../chapter-frame.js';
export const phone = true;

export default function (root, opts, lib) {
  const steps = [...root.querySelectorAll('.mo-pc__step')];
  const frame = root.querySelector('.mo-pc__visuals');
  const figures = steps.map(s => s.querySelector('.mo-pc__visual'));
  if (steps.length < 2 || !frame || figures.some(f => !f)) return {};
  const lengths = steps.map(step => (step.querySelector('p')?.textContent.match(/\S+/g) || []).length);
  // An author can choose compact for a short sequence with longer captions.
  if (steps.length === 3 && (lengths.every(n => n < 25) || root.hasAttribute('data-compact'))) {
    const panels = steps.map(step => [step.querySelector('p'),step.querySelector('figure')].filter(Boolean));
    const buttons = steps.map((step,i) => {
      const h = step.querySelector('h3');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = h.textContent;
      h.replaceChildren(button);
      panels[i].forEach((p,k) => { if (!p.id) p.id = (root.id || 'chapters-'+[...document.querySelectorAll('[data-moment="pinned-chapters"]')].indexOf(root))+'-detail-'+i+'-'+k; });
      button.setAttribute('aria-controls',panels[i].map(p => p.id).join(' '));
      button.addEventListener('click',() => select(i));
      return button;
    });
    function select(index) {
      buttons.forEach((b,i) => {
        b.setAttribute('aria-expanded',String(i===index));
        panels[i].forEach(p => { p.hidden = i!==index; });
      });
    }
    root.classList.add('is-compact');
    select(0);
    return {destroy() {
      root.classList.remove('is-compact');
      buttons.forEach((b,i) => { b.replaceWith(b.textContent); panels[i].forEach(p => { p.hidden=false; }); });
    }};
  }
  return chapterFrame(root, steps, figures, frame);
}
