import { rng } from './moments.mjs';
import { forms } from '../tools/lib/show.js';
import { spectrum } from '../tools/lib/colour.js';

function workflowNotes(brief, rows) {
  const actions = (brief || '').split(/(?:[.!?]\s+|,\s*(?:and\s+)?|\s+(?:and then|then)\s+)/i)
    .map(s => s.trim().replace(/[.!?]$/,''))
    .filter(s => /^(?:start|tag|send|open|add|create|select|choose|edit|save|export|import|record|review|approve|publish|copy|share|run|build)\b/i.test(s));
  if (actions.length >= 3) return actions.slice(0,5).join(' → ');
  const steps = rows.map(row => row.split('|').map(cell => cell.trim()))
    .filter(([, role, heading]) => heading && /^(?:first-step|next-step|step|result)$/.test(role))
    .map(([, , heading]) => heading);
  if (steps.length >= 3) return steps.slice(0,5).join(' → ');
  const supplied = actions.length ? actions : steps;
  return (supplied.length ? supplied.join(' → ') + '. ' : '') +
    'Record the starting state, main action and visible result from the fact sheet before scripting.';

}

export function dealContent({ page, hardware = false, assets, rows, seed, palette, heroWindow, dark, sceneHero, sceneClose, moving, brief }) {
  const text = rows.join(' ').toLowerCase();
  const count = key => Math.max(0, ...Array.from(assets, token => {
    const [name, n] = token.split(':');
    return name === key ? Number(n || 1) || 0 : 0;
  }));
  const parts = [];
  const add = (id, needs) => parts.push({id, path: 'assets/motion/parts/' + id + '/demo.html', needs});
  add('nav-highlight', 'Use real desktop links; group children only where supplied.');
  add('menu-sheet', 'Use the same destinations on a phone.');
  const hasForm = count('form') || /\b(?:booking|contact|enquiry|signup|delivery) form\b/.test(text);
  add('form-states', hasForm ? 'Mount on the form. Validate each field and report its actual submission outcome.' : 'No form supplied. Keep the form part available for a real submission.');
  if (count('tabs') || count('views') >= 2 || /\b(feature tabs|tabbed views|product views|tabs)\b/.test(text)) add('feature-tabs','Give each choice its label and matching view.');
  if (count('steps') || /\b(ordered steps|step rail|step by step)\b/.test(text)) add('step-rail','Give each ordered step its own picture.');
  if (Math.max(count('logos'), count('marks'), count('logo')) >= 6 || /\b(?:[6-9]|[1-9]\d+|six|seven|eight|nine|ten) (?:approved )?(?:logos|marks)\b/.test(text)) add('logo-row','Use at least six approved marks.');
  if (count('faq') || count('questions') || /\b(faq|question list|questions and answers)\b/.test(text)) add('accordion','Supply a separate answer for each question.');
  if (count('periods') >= 2 || /\b(monthly and annual|monthly and yearly|two billing periods)\b/.test(text)) add('price-toggle','Show both supplied totals and periods.');
  if (Math.max(count('pictures'),count('photos'),count('photo')) >= 2 || /\b(photo gallery|set of photographs)\b/.test(text)) add('snap-gallery','Use the ordered photographs and their captions.');
  if (count('compare') || /\bbefore[- ]and[- ]after\b/.test(text)) add('compare','Register both pictures at the same scale.');
  if (count('code') || count('command') || /\b(command|code) to copy\b/.test(text)) add('copy-button','Keep the exact command selectable.');
  if (count('film') || /\bfilm\b/.test(text)) add('video-inview','Supply the film, poster and native controls.');
  if (count('detail-photo')) add('lightbox','Supply a thumbnail, full-size image and description.');
  if (count('linked-card')) add('card-light','Use a material card with a working destination.');
  if (count('final-count')) add('count-once','Use the exact final figure from the fact sheet.');
  const hasWindow = count('ui') || /\b(product window|core view)\b/.test(text);
  let demo = null;
  if (page === 'software' && hasWindow && rng(seed + ':demo')() < 2/3) {
    demo = {place: heroWindow && !sceneHero ? 'hero window' : 'core-view section',
      source: workflowNotes(brief, rows)};
    add('demo-loop','Write the final result in HTML and include a pause control.');
  }
  let gradient = null;
  const roll = rng(seed + ':show')();
  const slot = roll < 1/3 ? 'hero' : roll < 1/3 + 1/5 ? 'close' : null;
  const hardwareObject = ['product','tech'].includes(page) && count('object') && (hardware || /\b(hardware|keyboard|headphones|device|controller|robot|drone)\b/i.test(brief || ''));
  if (['software','gaming','tech'].includes(page) && !hardwareObject && slot && !(slot === 'hero' ? sceneHero : sceneClose)) {
    const presets = Object.keys(forms), preset = presets[Math.floor(rng(seed + ':preset')() * presets.length)];
    gradient = {tier:'show', preset, slot, moving, effect: forms[preset], hues:palette.accent ? spectrum(palette.accent,.88) : null,
      seed: Math.floor(rng(seed + ':field')() * 1000000), placement: slot === 'close' || dark ? 'ground' : palette.bg ? 'panel' : null,
      place: slot === 'close' ? 'closing band' : !palette.bg ? 'dark art palette: hero ground; light art palette: hero panel beside the headline' : dark ? 'hero ground under headline and window' : 'hero panel behind the window or beside the headline; keep the page white'};
  }
  if (hardwareObject && !moving && roll < 1/3) {
    gradient = {tier:'quiet', preset:'mist', slot:'object', placement:'panel', place:'object panel behind the hardware',
      seed:Math.floor(rng(seed + ':field')() * 1000000), moving:false};
  }
  if (demo && gradient?.moving && gradient.slot === 'hero') demo.place = 'core-view section';
  const places = [
    'grain at native size on an untextured closing band',
    count('diagram') || count('code') ? 'pattern fading at the edge of the diagram' : 'pattern only with a diagram or map',
    count('photo') || count('pictures') ? 'shape around a supplied photograph' : 'shape only around a picture',
    'shadow only on a floating product window, device, dialog or menu',
    hasWindow ? 'one surface on the product window' : 'one surface on navigation crossing a picture',
    'divider against the incoming ground'
  ];
  return {parts, demo, gradient, tools:places.join('; ')};
}
