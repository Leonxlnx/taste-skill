/*
  taste-skill diagrams/mount.js - draws every [data-diagram] on the page. One line in the page:
    <link rel="stylesheet" href="assets/diagrams/diagram.css">
    <script type="module" src="assets/diagrams/mount.js"></script>
  The icons a diagram names are the files scripts/icons.mjs wrote (icons.mjs scan index.html --out assets/icons),
  read from assets/icons/ or from data-icon-base. See references/diagrams.md.
*/
import dg from './diagram.js';

const go = () => dg.auto(document);
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go, { once: true });
else go();
