let renderCount = 0;

export function incRenderCount() {
  renderCount++;
}

export function getRenderCount() {
  return renderCount;
}

export function resetRenderCount() {
  renderCount = 0;
}
