import { chapterFrame } from '../chapter-frame.js';
export const phone = true;

export default function mount(root) {
  const list = root.querySelector('.mo-ph__list');
  const steps = [...root.querySelectorAll('.mo-ph__ch')];
  const pictures = steps.map(step => step.querySelector('.mo-ph__pic'));
  if (!list || steps.length < 2 || pictures.some(pic => !pic)) return {};
  const frame = document.createElement('div');
  frame.className = 'mo-ph__stage';
  list.after(frame);
  const view = chapterFrame(root, steps, pictures, frame);
  return { destroy() { view.destroy(); frame.remove(); } };
}
