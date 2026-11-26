for (const root of document.querySelectorAll('[data-part="lightbox"]')) {
  const link = root.querySelector('figure a'),
    photo = link.firstElementChild,
    dialog = document.createElement('dialog'),
    large = photo.cloneNode(),
    close = document.createElement('button');
  dialog.className = 'plate-dialog';
  dialog.setAttribute('aria-label', photo.alt);
  large.className = '';
  close.textContent = 'Close photograph';
  dialog.append(large, close);
  root.append(dialog);
  let closing = false;
  function motion(reverse) {
    const from = photo.getBoundingClientRect(),
      to = large.getBoundingClientRect();
    const dx = from.x + from.width / 2 - to.x - to.width / 2,
      dy = from.y + from.height / 2 - to.y - to.height / 2;
    return large.animate(
      [
        {
          transform:
            'translate(' +
            dx +
            'px,' +
            dy +
            'px) scale(' +
            from.width / to.width +
            ',' +
            from.height / to.height +
            ')',
        },
        { transform: 'none' },
      ],
      {
        duration: matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 280,
        easing: 'cubic-bezier(.4,0,.2,1)',
        direction: reverse ? 'reverse' : 'normal',
      },
    );
  }
  link.onclick = (e) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    dialog.showModal();
    motion(false);
  };
  async function dismiss() {
    if (closing) return;
    closing = true;
    await motion(true).finished;
    dialog.close();
    closing = false;
    link.focus({ preventScroll: true });
  }
  close.onclick = dismiss;
  dialog.oncancel = (e) => {
    e.preventDefault();
    dismiss();
  };
  dialog.onclick = (e) => {
    if (e.target === dialog) dismiss();
  };
}
