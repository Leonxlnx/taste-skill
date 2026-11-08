/* Window names its parts (window-names-its-parts): a restored 2.4 scene. The finished composition is the markup; the scene file is
   classic.js beside this one, run on the shared classic stage (../classic/classic.js loads GSAP once). */
import { run } from '../classic/classic.js';
export default (root, opts) => run(root, opts, 'window-names-its-parts', { split: false });
