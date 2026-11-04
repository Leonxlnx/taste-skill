#!/usr/bin/env node
/*
  _print-core/lint-glsl.mjs - checks shader sources for words a laptop's GPU rejects (GLSL ES 3.00
  reserved words, a qualifier such as flat used as a name, double underscores, gl_ names, names of
  built-in functions), and in a model a texture() read (inside the march's loops it must be
  textureLod). CPU-rendered Chrome (SwiftShader) compiles some of these, so a screenshot test never
  proves a shader builds on a real GPU: run this after changing a model.

    node assets/objects/_print-core/lint-glsl.mjs            every print-* object, as compiled
    node assets/objects/_print-core/lint-glsl.mjs a.js b.js  every shader string in those files

  Exit code 1 when a problem is found. print3d.js runs the same check before every compile and
  shows the poster instead of building a shader that fails it.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { glslProblems } from './print3d.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2);
let bad = 0, checked = 0;
const report = (name, problems) => {
  checked++;
  if (!problems.length) return;
  bad += problems.length;
  console.log(`${name}\n  ${problems.join('\n  ')}`);
};

if (!files.length) {
  // every object, the sources exactly as print3d.js builds them
  const dirs = fs.readdirSync(path.join(here, '..')).filter(d => /^print-/.test(d) && fs.existsSync(path.join(here, '..', d, 'object.js')));
  for (const d of dirs) {
    const obj = (await import(pathToFileURL(path.join(here, '..', d, 'object.js')).href)).default;
    const s = obj.source();
    // the model's surf() and map() run inside the march's loops: a texture read there must name its
    // level (textureLod), as a GPU's compiler (ANGLE on Direct3D) may refuse implicit gradients in a loop
    const implicit = s.form.split('\n')
      .map((ln, k) => (/\btexture\s*\(/.test(ln.replace(/\/\/.*$/, '')) ? `line ${k + 1}: texture() in the model: use textureLod (it runs inside a loop)` : null))
      .filter(Boolean);
    report(`${d} (form shader)`, glslProblems(s.form).concat(implicit));
    if (d === dirs[0]) { report('print pass', glslProblems(s.print)); report('vertex shader', glslProblems(s.vert)); }
  }
} else {
  // every template literal in a file that reads as GLSL; an interpolation counts as a blank
  const tpl = /`((?:\\[\s\S]|\$\{(?:[^{}`]|\{[^{}]*\})*\}|[^`\\])*)`/g;
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    let n = 0;
    for (const m of src.matchAll(tpl)) {
      const body = m[1].replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, ' ');
      // code, not a list of words: a constructor call, a main(), a built-in variable or a precision line
      if (!/\bvec[234]\s*\(|\bvoid\s+main\s*\(|\bgl_(FragCoord|Position|FragColor)\b|\bprecision\s+\w+p\s+float\b/.test(body)) continue;
      const line = src.slice(0, m.index).split('\n').length;
      report(`${f}:${line} (shader ${++n})`, glslProblems(body).map(p => p.replace(/^line (\d+)/, (_, l) => `line ${line + +l - 1}`)));
    }
  }
}
console.log(`${checked} shader source(s) checked, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
