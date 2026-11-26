for (const root of document.querySelectorAll('[data-part="nav-highlight"]')) {
  const nav = root.querySelector('nav'),
    trigger = nav.querySelector('button'),
    pill = nav.querySelector('i'),
    panel = nav.querySelector('.desk-panel');
  trigger.hidden = false;
  nav.dataset.ready = '';
  function open(value) {
    trigger.setAttribute('aria-expanded', value);
    panel.inert = !value;
  }
  open(false);
  for (const el of [nav.querySelector('a'), trigger]) {
    function mark() {
      pill.style.width = el.offsetWidth + 'px';
      pill.style.height = el.offsetHeight + 'px';
      pill.style.transform = 'translateX(' + el.offsetLeft + 'px)';
      pill.style.opacity = 1;
    }
    el.onpointerenter = el.onfocus = mark;
  }
  trigger.onclick = () => open(panel.inert);
  nav.onkeydown = (e) => {
    if (e.key === 'Escape') {
      open(false);
      trigger.focus();
    }
  };
  function leave() {
    if (!nav.matches(':hover,:focus-within')) pill.style.opacity = 0;
  }
  nav.onpointerleave = leave;
  nav.onfocusout = () =>
    setTimeout(() => {
      if (!nav.matches(':focus-within')) open(false);
      leave();
    });
  document.addEventListener('pointerdown', (e) => {
    if (!nav.contains(e.target)) open(false);
  });
}
