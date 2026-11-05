// fx-photo: the section's own photograph in its natural colour, as figma.com and x.ai show theirs: the
// copy sits on a soft dark scrim in its corner (white type, 4.5:1 over any picture), and pointed at, the
// picture eases in a little. No filter, no WebGL, nothing at rest.
// data-cx-grade="duotone" (an editorial page that prints every picture in its tones): duotone-grade reads
// the frame's <img data-fx-photo> and grades it into three page tones, drawn once and kept as a picture
// (still() in shared.js); a cool accent gets the tones without their colour, so it reads as a neutral print.
import { still, palette, color, bag } from '../shared.js';

export default function init(root) {
  const b = bag();
  const frame = root.querySelector('.cx-photo__frame');
  // only the hand-set grade: a dealt effect (data-cx-effect) never filters a photograph
  if (root.dataset.cxGrade !== 'duotone') return b;
  // is-graded (page ink, no scrim) only once the graded picture is in place (below): until then the scrim and white type stay
  b.add(() => root.classList.remove('is-graded'));
  const page = palette(root);
  const narrow = frame.clientWidth < 640;
  const [, C, h] = color.lch(page.accent);
  const neutral = C > 0.04 && h > 180 && h < 300;
  const de = c => color.saturate(c, 0.12);
  const pal = neutral ? { ...page, bg: de(page.bg), surface: de(page.surface), ink: de(page.ink), muted: de(page.muted), accent: de(page.accent) } : page;
  b.add(still(frame, 'duotone-grade', {
    // the graded picture replaces the photograph at once (a fade would show the ungraded photo under it)
    fade: false,
    palette: pal,
    seed: frame.dataset.cxSeed,
    params: { tones: 3, contrast: 0.42, exposure: 0.08, grain: 0.3, ink: neutral && color.isDark(page.bg) ? 1 : 0, scrim: 0.5, calm: 0.72, calmX: narrow ? 0.3 : 0.2, calmY: narrow ? 0.82 : 0.74, drift: 0 },
  })).ready.then(() => root.classList.add('is-graded'));
  return b;
}
