for (const root of document.querySelectorAll('[data-part="menu-sheet"]')) {
  const button = root.querySelector('button'),
    nav = root.querySelector('nav'),
    dialog = document.createElement('dialog'),
    close = document.createElement('button');
  button.hidden = false;
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-expanded', 'false');
  close.textContent = 'Close menu';
  dialog.className = 'edition-sheet';
  dialog.setAttribute('aria-label', 'Edition desk');
  dialog.append(close, nav);
  root.append(dialog);
  let busy = false;
  function animate(closing) {
    return dialog.animate(
      [
        { transform: 'translateY(16px)', opacity: 0 },
        { transform: 'none', opacity: 1 },
      ],
      {
        duration: matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : closing ? 150 : 180,
        direction: closing ? 'reverse' : 'normal',
        easing: 'cubic-bezier(.4,0,.2,1)',
      },
    );
  }
  button.onclick = () => {
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
    animate(false);
    close.focus();
  };
  async function dismiss(destination) {
    if (busy) return;
    busy = true;
    await animate(true).finished;
    dialog.close();
    busy = false;
    button.setAttribute('aria-expanded', 'false');
    if (destination instanceof HTMLElement) {
      if (!destination.hasAttribute('tabindex')) destination.tabIndex = -1;
      destination.focus();
      destination.scrollIntoView();
    } else button.focus();
  }
  close.onclick = dismiss;
  dialog.oncancel = (e) => {
    e.preventDefault();
    dismiss();
  };
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href]')];
    const first = controls[0],
      last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  nav.onclick = (e) => {
    const link = e.target.closest('a');
    if (link) dismiss(link.hash ? document.getElementById(decodeURIComponent(link.hash.slice(1))) : null);
  };
}
