export function desktopLinks(nav) {
  nav.querySelectorAll('.nav__item').forEach(item => {
    if (!item.querySelector('.nav__menu')) return;
    let btn = item.querySelector('.nav__expand');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'nav__expand';
      btn.type = 'button';
      btn.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      item.querySelector('.nav__link').after(btn);
    }
    const label = item.querySelector('.nav__link')?.textContent.trim() || 'section';
    btn.setAttribute('aria-label', `Show ${label} links`);
    btn.setAttribute('aria-expanded', 'false');
    const link = item.querySelector('.nav__link');
    const desktop = matchMedia('(min-width: 1024px)');
    // CSS opens this menu on pointer intent or focus. Mirror its actual visibility.
    const menu = item.querySelector('.nav__menu');
    const sync = () => {
      if (desktop.matches) link.setAttribute('aria-expanded', String(getComputedStyle(menu).visibility === 'visible'));
      else link.removeAttribute('aria-expanded');
    };
    menu.addEventListener('transitionstart', sync);
    menu.addEventListener('transitionend', sync);
    for (const event of ['pointerenter','pointerleave','focusin','focusout']) item.addEventListener(event, () => requestAnimationFrame(sync));
    desktop.addEventListener('change', sync);
    sync();
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-expanded');
      item.classList.toggle('is-expanded', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  const links = nav.querySelector('.nav__links');
  if (!links || !links.children.length) return;
  const pill = document.createElement('i');
  pill.className = 'nav__highlight';
  pill.setAttribute('aria-hidden','true');
  links.prepend(pill);
  function mark(e) {
    const link = e.target.closest('.nav__link');
    if (!link || !links.contains(link)) return;
    const item = link.getBoundingClientRect(), box = links.getBoundingClientRect();
    pill.style.width = item.width + 'px';
    pill.style.height = item.height + 'px';
    pill.style.transform = 'translate('+(item.left-box.left)+'px,'+(item.top-box.top)+'px)';
    pill.style.opacity = '1';
  }
  links.addEventListener('pointerover',mark);
  links.addEventListener('focusin',mark);
  const clear = () => { pill.style.opacity = '0'; };
  links.addEventListener('pointerleave',clear);
  links.addEventListener('focusout',clear);
}
