for (const root of document.querySelectorAll('[data-part="copy-button"]')) {
  const button = root.querySelector('button'),
    value = root.querySelector('code'),
    status = root.querySelector('[role=status]');
  if (!navigator.clipboard) continue;
  let timer;
  button.hidden = false;
  button.onclick = async () => {
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(value.textContent);
      button.textContent = '✓ Copied';
      status.textContent = 'Reference copied.';
    } catch {
      status.textContent = 'Select the reference and copy it manually.';
      return;
    }
    timer = setTimeout(() => {
      button.textContent = '⧉ Copy reference';
      status.textContent = '';
    }, 1200);
  };
}
