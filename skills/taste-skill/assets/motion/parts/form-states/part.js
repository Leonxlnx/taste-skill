for (const root of document.querySelectorAll('[data-part="form-states"]')) {
  if (root.matches('form.form')) continue; // system.js mounts the starter variant.
  const form = root.querySelector('form'),
    field = form.elements.email,
    button = form.querySelector('button'),
    msg = form.querySelector('.message'),
    toast = form.querySelector('output');
  button.hidden = false;
  field.disabled = false;
  form.noValidate = true;
  try {
    field.value = localStorage.getItem('folio.delivery-email') || '';
  } catch {
    /* Saving reports storage errors. */
  }
  field.oninput = () => {
    field.removeAttribute('aria-invalid');
    delete field.dataset.saved;
    msg.textContent = toast.textContent = '';
    button.textContent = 'Save contact';
  };
  form.onsubmit = async (e) => {
    e.preventDefault();
    if (button.disabled) return;
    if (!field.validity.valid) {
      field.setAttribute('aria-invalid', 'true');
      msg.textContent = 'Enter a complete email address.';
      field.focus();
      return;
    }
    button.disabled = true;
    button.textContent = 'Saving…';
    const email = field.value;
    field.readOnly = true;
    await new Promise(requestAnimationFrame);
    try {
      localStorage.setItem('folio.delivery-email', email);
      field.dataset.saved = '';
      button.textContent = 'Saved';
      toast.textContent = 'Delivery contact saved on this device.';
    } catch {
      button.textContent = 'Try again';
      msg.textContent = 'This device could not save the contact.';
    }
    button.disabled = false;
    field.readOnly = false;
  };
}
