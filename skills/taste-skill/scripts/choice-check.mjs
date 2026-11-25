// Runs in a disposable rendered tab. Only same-document links are exercised.
export async function choiceProbe() {
  const all = (s, root=document) => [...root.querySelectorAll(s)];
  const norm = s => String(s ?? '').trim().toLowerCase().replace(/\s+/g,' ');
  const label = e => norm(e.getAttribute('aria-label') || e.labels?.[0]?.innerText || e.textContent);
  const val = e => e.dataset.value ?? (e.matches('button,[role=tab]') ? e.getAttribute('value') || e.textContent.trim() : e.value);
  const active = e => e.matches(':checked,[aria-selected=true],[aria-pressed=true]');
  const option = e => e.matches('[type=radio],[type=checkbox],button,[role=tab]');
  const fields = all('input:not(:disabled),select:not(:disabled),button[data-choice],[role=tab][data-choice],output[data-choice],textarea[data-choice]');
  const findings = [];
  document.addEventListener('submit', event => event.preventDefault(), true);
  function lost(e,msg) {
    findings.push({check:'choice-lost',sev:'FAIL',id:0,sel:e.id ? '#'+e.id : e.localName,text:label(e).slice(0,48),msg,fix:'Carry the selected value into the matching field or tab.'});
  }
  const change = e => ['input','change'].forEach(type => e.dispatchEvent(new Event(type,{bubbles:true})));
  const settle = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const links = all('a[href^="#"]').filter(a => a.hash.length > 1);
  const target = a => document.getElementById((() => { try { return decodeURIComponent(a.hash.slice(1)); } catch { return a.hash.slice(1); } })());
  function pick(e, peers) {
    if (option(e)) {
      const candidate = peers.find(x => option(x) && !active(x)) || (e.type==='checkbox' ? e : null);
      if (!candidate) return;
      candidate.click();
    } else if (e.matches('select')) {
      const next = [...e.options].find(o => !o.disabled && !o.selected);
      if (!next) return;
      e.value = next.value; change(e);
    } else if (e.matches('input[type=number],input[type=range],input[type=date]')) {
      const old = e.value;
      try { e.stepUp(); if (e.value === old) e.stepDown(); } catch { return; }
      if (old === e.value) return;
      change(e);
    } else if (e.matches('input:not([type=hidden])')) {
      e.value = 'Example selection'; change(e);
    } else return;
    return true;
  }
  const groupName = e => norm(e.closest('fieldset')?.querySelector('legend')?.innerText).replace(/[?]/g,'').replace(/^which /,'');
  const labels = e => [norm(e.name),label(e),groupName(e)].filter(Boolean);
  const processed = new Set();
  for (const first of fields) {
    const name = first.dataset.choice;
    if (!name && (first.form || !first.matches('select,[type=radio],[type=checkbox],[type=range],[type=number]'))) continue;
    const section = first.closest('section');
    const formLink = section && links.find(a => section.contains(a) && target(a)?.matches('form,section:has(form),div:has(form),footer:has(form)'));
    const receiver = formLink && (target(formLink).closest('form') || target(formLink).querySelector('form'));
    const after = e => !!(first.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_FOLLOWING);
    const matches = fields.filter(e => e !== first && after(e) && (name ? e.dataset.choice===name :
      e.form && (!receiver || e.form===receiver) && labels(e).some(x => labels(first).includes(x))));
    const sourceRoot = first.closest('[role=tablist],[role=group],[role=radiogroup],fieldset') || section || first.form;
    const peers = option(first) && sourceRoot ? fields.filter(e => sourceRoot.contains(e) && (name ? e.dataset.choice===name : e.name===first.name && e.type===first.type)) : [first];
    const dest = matches.filter(e => !peers.includes(e));
    const key = name || (section?.id || '')+' '+(first.name || first.id);
    if (processed.has(key) || !dest.length && !receiver) continue;
    processed.add(key);
    if (!pick(first,peers)) continue;
    const selected = option(first) ? peers.filter(active).map(e => e.dataset.name || val(e)) : [val(first)];
    if (formLink) formLink.click();
    await settle();
    if (!dest.length && name && peers.length > 1 && peers.every(e=>e.closest('[role=tablist]'))) continue;
    if (!dest.length) { lost(first,'The linked form has no field for '+(label(first) || key)+'.'); continue; }
    const expected = selected.map(norm);
    const bad = dest.find(e => {
      if (option(e)) return active(e) !== expected.includes(norm(e.dataset.name || val(e)));
      if (e.multiple) return [...e.selectedOptions].map(o => norm(o.value)).sort().join('|') !== [...expected].sort().join('|');
      return norm(val(e)).replace(/ and /g,', ').split(/,\s*/).sort().join('|') !== [...expected].sort().join('|');
    });
    if (bad) lost(first,'Selecting '+selected.join(', ')+' leaves '+(label(bad) || bad.name)+' at '+(val(bad) || 'empty')+'.');
  }
  for (const a of links) {
    const dest = target(a);
    if (!dest) continue;
    const tabs = all('[role=tab]');
    const expected = tabs.find(t => {
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (!panel) return false;
      if (dest===panel || dest===t) return true;
      if (!dest.contains(t) && !dest.contains(panel)) return false;
      const [name,value] = (a.dataset.choiceSet || '').split(':');
      return name && t.dataset.choice===name && norm(val(t))===norm(value) || label(a)===label(t);
    });
    if (!expected) continue;
    const other = all('[role=tab]',expected.closest('[role=tablist]') || dest).find(t => t!==expected);
    if (other) other.click();
    a.click(); await settle();
    const panel = document.getElementById(expected.getAttribute('aria-controls'));
    if (!active(expected) || panel?.hidden) lost(a,'The link "'+label(a)+'" does not open its '+label(expected)+' tab.');
  }
  return findings;
}
