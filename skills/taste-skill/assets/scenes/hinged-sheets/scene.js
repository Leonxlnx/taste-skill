/* Hinged sheets (hinged-sheets): a restored 2.4 scene. The finished composition is the markup; the scene file is
   classic.js beside this one, run on the shared classic stage (../classic/classic.js loads GSAP once). */
import { run } from '../classic/classic.js';
export default function mount(root, opts) {
  if (root.querySelector('.hs-price, [itemprop="price"], [data-price], [data-purchase]')) {
    root.classList.add('is-rest');
    return { destroy() {} };
  }
  return run(root, opts, 'hinged-sheets', { split: false });
}
