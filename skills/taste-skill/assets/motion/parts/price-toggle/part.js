for (const root of document.querySelectorAll('[data-part="price-toggle"]')) {
  const box = root.querySelector('.billing'),
    input = box.querySelector('input'),
    rates = [...box.querySelectorAll('.rates p')];
  box.dataset.ready = '';
  input.parentElement.hidden = false;
  function update() {
    rates.forEach((el, i) => (el.inert = i !== Number(input.checked)));
  }
  input.onchange = update;
  update();
}
