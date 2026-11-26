export function mobileSheet(nav) {
  const toggle = nav.querySelector('.nav__toggle');
  const bars = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const cross = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const links = nav.querySelector('.nav__links');
  const label = toggle?.getAttribute('aria-label') || 'Menu';
  const setOpen = open => {
    if (nav.classList.contains('is-open') === open) return;
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-locked', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? toggle.dataset.closeLabel || label : label);
      toggle.innerHTML = open ? cross : bars;
    }
    if (open && links) {
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        links.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],
          {duration:180,easing:'cubic-bezier(.4,0,.2,1)'});
      }
      links.querySelector('a[href]')?.focus({preventScroll:true});
    }
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab' && nav.classList.contains('is-open')) {
      const controls = [...nav.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.offsetWidth && !el.matches('.skip-link'));
      const edge = e.shiftKey ? controls[0] : controls.at(-1);
      if (edge && document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? controls.at(-1) : controls[0]).focus();
      }
    }
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('is-open')) { setOpen(false); toggle?.focus(); return; }
    if (nav.contains(document.activeElement)) document.activeElement.blur();
  });
  // a tap on any link in the open sheet closes it (a top-level word, a menu link, an action, an
  // in-page #anchor alike), so the page it leads to is never left under the sheet
  nav.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && e.target.closest?.('a[href]')) setOpen(false);
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) setOpen(false); });
}

