// diff-review: one cycle (about 3.0 s) of a reviewer's suggestion being applied. The finished picture is
// the suggestion applied (.is-applied on the root): the reviewed line ([data-diff-target]) is a removed
// line, the suggestion ([data-diff-sug], an added line written under it) has unfolded, the header's
// counts take their applied values and the Applied status stands where the button was. A cycle reads
// in this order: the diff as it was with the reviewer's comment and its button, the button steps
// (lifted, ringed) and is pressed, waits with a spinner, the suggestion is applied and the status
// replaces the button, the applied picture holds, then it resets (the status leaves FIRST, so the
// button never shows over a diff that is still applied; then the suggestion folds away and the counts
// go back; only then does the button return). Every word is the page's own: both lines, both counts,
// the button and the status are in the markup.
import { loop } from '../ui.js';

export default function init(root) {
  const act = root.querySelector('[data-diff-act]');
  const btn = root.querySelector('[data-diff-apply]');
  if (!act || !btn || !root.querySelector('[data-diff-target]') || !root.querySelector('[data-diff-sug]')) return null;
  const clear = () => btn.classList.remove('is-step', 'is-pressed', 'is-wait');
  const still = () => { clear(); act.classList.remove('is-gone'); root.classList.add('is-applied'); act.classList.add('is-done'); };
  // one cycle (3.0 s): the status leaves (0.15 s), the diff goes back (0.26 s), the button returns and the
  // comment waits (0.85 s), the button steps (0.36 s), is pressed (0.14 s) and waits (0.52 s, two turns of the spinner), the
  // suggestion is applied (0.3 s), the status replaces the button, and the finished picture holds
  // 0.3 s more (about 10%)
  return loop(root, async api => {
    clear();
    act.classList.add('is-gone');
    await api.wait(150);
    root.classList.remove('is-applied');
    act.classList.remove('is-done');
    await api.wait(260);
    act.classList.remove('is-gone');
    await api.wait(850);
    btn.classList.add('is-step');
    await api.wait(360);
    btn.classList.add('is-pressed');
    await api.wait(140);
    btn.classList.remove('is-pressed');
    btn.classList.add('is-wait');
    await api.wait(520);
    root.classList.add('is-applied');
    await api.wait(300);
    act.classList.add('is-done');
    await api.wait(140);
    clear();
    await api.wait(300);
  }, { still });
}
