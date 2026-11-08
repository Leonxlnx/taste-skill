/* Panels re-proportion as they arrive (panels-reproportion-on-arrival): a restored 2.4 scene. The finished composition is the markup; the scene file is
   classic.js beside this one, run on the shared classic stage (../classic/classic.js loads GSAP once). */
import { run } from '../classic/classic.js';
export default (root, opts) => run(root, opts, 'panels-reproportion-on-arrival', { split: true });
