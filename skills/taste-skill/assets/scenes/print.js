/*
  scenes/print.js - an object render (assets/objects/print-*) driven by a scene. The scene moves the
  host by transform and turns the object by its scroll: turnTo(deg) sets the rest angle and draws that
  pose. The object is mounted only while the scene is live and near the screen (wake()), and destroyed
  when the scene is far, at rest or gone (sleep()): one WebGL context, counted in the page's shared
  budget (window.__tpGl, at most 4 on a page) by print3d's pool, which refuses it when the page is full (the still stays). Under prefers-reduced-motion, on a phone
  plan that rests, without WebGL or when the shader fails nothing is mounted: the still picture the
  markup carries under the host (an <img> made with assets/scenes/_demo/shoot.mjs make) is the finished composition.
    import { attachPrint } from '../print.js';
    const obj = attachPrint(host, { object: 'print-globe', effect: 'render', params: {...} });
    obj.wake(); obj.turnTo(90); obj.sleep(); obj.destroy();
*/
import { reduced } from './lib.js';

const OBJECTS = new URL('../objects/', import.meta.url);

export function attachPrint(host, { object, effect, params = {}, palette } = {}) {
  let print = null, last = 0, dead = false, awake = false, loading = null;
  const mod = () => (loading ??= import(new URL(`${object}/object.js`, OBJECTS).href).catch(e => { console.warn('scenes: no object', object, e); host.classList.add('is-failed'); return null; }));
  function turnTo(deg, force) {
    if (!print) { last = deg; return; }
    if (!force && Math.abs(deg - last) < 0.8) return;
    last = deg;
    const a = ((deg + 180) % 360 + 360) % 360 - 180;
    try { print.set({ angle: a }); print.pose && print.pose({ t: 0 }); } catch (e) { /* the object draws its fallback */ }
  }
  async function wake() {
    if (dead || awake || reduced() || !host.isConnected) return;
    awake = true;
    const m = await mod();
    if (!m || dead || !awake) return;
    const p = { transparent: 1, turn: 0, interactive: 0, shadow: 0.55, size: 0.96, angle: 0, ...(effect ? { effect } : {}), ...params };
    try { print = m.default.mount(host, { place: 'none', params: p, palette }); host.classList.add('is-awake'); turnTo(last, true); }
    catch (e) { console.warn('scenes: object failed', object, e); host.classList.add('is-failed'); awake = false; }
  }
  function sleep() {
    awake = false;
    if (print) { try { print.destroy(); } catch (_) { /* gone */ } print = null; host.classList.remove('is-awake'); }
  }
  return {
    wake, sleep, turnTo,
    get print() { return print; },
    get awake() { return !!print; },
    destroy() { dead = true; sleep(); },
  };
}
