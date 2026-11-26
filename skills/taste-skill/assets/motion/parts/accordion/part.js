for (const root of document.querySelectorAll('[data-part="accordion"]')) {
  for (const [i, item] of [...root.querySelectorAll('.fold')].entries()) {
    const title = item.querySelector('h3'),
      body = item.querySelector('.fold-body'),
      button = document.createElement('button');
    button.textContent = title.textContent;
    const mark = document.createElement('b');
    mark.textContent = '+';
    mark.setAttribute('aria-hidden', 'true');
    button.append(mark);
    title.replaceChildren(button);
    const update = (open) => {
      button.setAttribute('aria-expanded', open);
      body.inert = !open;
    };
    update(i === 0);
    button.onclick = () => update(body.inert);
  }
}
