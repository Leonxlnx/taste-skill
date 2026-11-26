export function forms() {
  document.querySelectorAll('form.form').forEach(form => {
    form.noValidate = true;
    const status = form.querySelector('[data-form-status]');
    if (status && !status.hasAttribute('role') && !status.hasAttribute('aria-live')) status.setAttribute('role', 'status');
    const say = text => { if (status) status.textContent = text || ''; };
    const fields = [...form.elements].filter(el => el.matches('input, select, textarea') && !/^(hidden|submit|button|reset|image)$/.test(el.type));
    const errOf = el => {
      const ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      let err = ids.map(id => document.getElementById(id)).find(e => e && e.classList.contains('field__error'));
      if (!err) {
        err = document.createElement('p');
        err.className = 'field__error'; err.hidden = true;
        err.id = `${el.id || el.name || 'field'}-err-${Math.random().toString(36).slice(2, 7)}`;
        (el.closest('.field') || el.parentElement).append(err);
        el.setAttribute('aria-describedby', [...ids, err.id].join(' '));
      }
      // the written reason is kept once, the first time; an empty one stays empty, so a later failure shows the
      // browser's message of that moment, never the one an earlier failure left in the line
      if (!('text' in err.dataset)) err.dataset.text = err.textContent.trim();
      return err;
    };
    const check = el => {
      const ok = el.checkValidity();
      const err = errOf(el);
      if (ok) { el.removeAttribute('aria-invalid'); err.hidden = true; return true; }
      el.setAttribute('aria-invalid', 'true');
      err.textContent = err.dataset.text || el.dataset.error || el.validationMessage;
      err.hidden = false;
      return false;
    };
    fields.forEach(el => el.addEventListener(el.matches('select') ? 'change' : 'input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); }));
    form.addEventListener('submit', async e => {
      if (form.getAttribute('aria-busy') === 'true') { e.preventDefault(); return; }
      const bad = fields.filter(el => !check(el));
      if (bad.length) {
        e.preventDefault();
        say(form.dataset.fix ? form.dataset.fix.replace('{n}', bad.length) : bad.length === 1 ? '1 field to fix.' : `${bad.length} fields to fix.`);
        bad[0].focus();
        return;
      }
      say('');
      const endpoint = (form.dataset.endpoint || '').trim();
      if (!/^https?:\/\//.test(endpoint) && !endpoint.startsWith('/')) return;
      e.preventDefault();
      const button = form.querySelector('[type="submit"]');
      form.setAttribute('aria-busy','true');
      const wait = setTimeout(() => say(form.dataset.sending || 'Sending'), 300);
      if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
      try {
        const res = await fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        clearTimeout(wait); form.reset(); say(form.dataset.sent || 'Sent.');
      } catch {
        clearTimeout(wait); say(form.dataset.failed || 'Not sent: the connection failed. Your words are still here; try again.');
      } finally {
        form.removeAttribute('aria-busy');
        if (button) { button.disabled = false; button.removeAttribute('aria-busy'); }
      }
    });
  });
}
