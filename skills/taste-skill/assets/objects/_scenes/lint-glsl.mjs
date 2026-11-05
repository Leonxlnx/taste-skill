#!/usr/bin/env node
/*
  _scenes/lint-glsl.mjs - checks every scene shader for words a laptop's GPU rejects: a word GLSL ES
  1.00 or 3.00 reserves (flat, smooth, sample, filter, input...), a keyword or type used as a name
  or a field, a double underscore, an unknown gl_ name, and a name that hides a built-in function.
  CPU-rendered Chrome (SwiftShader) compiles some of these, so a screenshot never proves a shader
  builds on a real GPU: run this after changing a scene's shader.

    node assets/objects/_scenes/lint-glsl.mjs            the five scene objects, as compiled
    node assets/objects/_scenes/lint-glsl.mjs a.js b.js  every /* glsl * / template in those files

  It first proves the check itself on known-bad and known-good samples. Exit code 1 on any problem.
  kit.js runs the same glslLint before every compile and shows the scene's still instead of
  compiling a shader that fails it.
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { glslLint, GLSL_PRINT, GLSL_LIB } from './kit.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const OBJECTS = ['product-turntable', 'exploded-layers', 'split-reveal', 'dot-object', 'dither-sequence'];
let bad = 0, checked = 0;
const report = (name, problems) => {
  checked++;
  if (!problems.length) return;
  bad += problems.length;
  console.log(`${name}\n  ${problems.join('\n  ')}`);
};

// 1. the check itself: each bad sample must be caught, each good one must pass
const MUST_CATCH = {
  'a struct field named flat': 'struct Hit { float d; float flat; };\nvoid main() { Hit h; h.d = 1.0; }',
  'a field read .flat': 'void main() { vec2 a; float b = a.flat; }',
  'sample as a name': 'void main() { float sample = 1.0; }',
  'smooth as a name': 'vec3 smooth = vec3(1.0);',
  'a second name in a list': 'void main() { float a = 1.0, filter = 2.0; }',
  'a built-in as a name': 'void main() { float length = 2.0; }',
  'a parameter named input': 'float f(float input) { return input; }',
  'a double underscore': 'float a__b = 1.0;',
  'a gl_ prefix': 'float gl_mine = 1.0;',
  'a type as a name': 'float vec3 = 1.0;',
  'switch as a name': 'void main() { float switch = 1.0; }',
  'image2D as a name': 'void main() { float image2D = 1.0; }',
};
const MUST_PASS = {
  'exponents and hex': 'void main() { float a = 1e5 + 2.0e-3; uint b = 0x7feb352du; uint c = 1u; }',
  'parameters and a list': 'vec2 rot(vec2 v, float a) { float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }',
  'a loop': 'void main() { for (float i = 0.0; i < 4.0; i++) { } }',
  'names that only start like a reserved word': 'void main() { vec2 imageUV = vec2(0.0); float sampled = 1.0, flatness = 0.5, inputs = 2.0; }',
};
for (const [k, src] of Object.entries(MUST_CATCH)) if (!glslLint(src).length) { bad++; console.log(`the check missed: ${k}`); }
for (const [k, src] of Object.entries(MUST_PASS)) { const p = glslLint(src); if (p.length) { bad++; console.log(`the check wrongly flags: ${k}\n  ${p.join('\n  ')}`); } }

// 2. the shaders
const literals = txt => [...txt.matchAll(/\/\*\s*glsl\s*\*\/\s*`([\s\S]*?)`/g)].map(m => ({ body: m[1], line: txt.slice(0, m.index).split('\n').length }));
const files = process.argv.slice(2);
if (!files.length) {
  report('fx GLSL_LIB (prepended to every scene shader)', glslLint(GLSL_LIB));
  report('kit GLSL_PRINT', glslLint(GLSL_PRINT));
  for (const id of OBJECTS) {
    const f = path.join(here, '..', id, 'object.js');
    const txt = fs.readFileSync(f, 'utf8');
    for (const { body, line } of literals(txt)) {
      // the shader as compiled: the print helpers in, and each turntable form in turn
      const forms = body.includes('${form}') ? [0, 1, 2, 3] : [null];
      for (const form of forms) {
        const src = body.replace(/\$\{GLSL_PRINT\}/g, GLSL_PRINT).replace(/\$\{form\}/g, String(form)).replace(/\$\{[^}]*\}/g, ' ');
        report(`${id}/object.js:${line}${form != null ? ` (form ${form})` : ''}`, glslLint(src));
      }
    }
  }
} else {
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    for (const { body, line } of literals(txt)) {
      report(`${f}:${line}`, glslLint(body.replace(/\$\{[^}]*\}/g, ' ')).map(p => p.replace(/^line (\d+)/, (_, l) => `line ${line + +l - 1}`)));
    }
  }
}
console.log(`${checked} shader source(s) checked, ${bad} problem(s)`);
process.exit(bad ? 1 : 0);
