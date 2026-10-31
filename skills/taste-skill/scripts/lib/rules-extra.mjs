// Findings from probe-extra.mjs (v2.5): what reviewers kept finding on pages the first rules passed.
// Thresholds come from the October 2026 comparison of professional sites, award sites and skill builds
// (professional sites: no giant footers, about one hue, almost no page on coloured grounds).
import { hidesOnScroll } from './frame-deal.mjs';
import { namesBusiness } from './business.mjs';

export function judgeExtra(x, { width, allow = [], screens = 1, app = false } = {}) {
  const out = [];
  const add = (level, id, message, fix) => { if (!allow.includes(id)) out.push({ level, id, width, message, fix }); };
  const desktop = width >= 1100;
  const list = (a, f, n = 3) => a.slice(0, n).map(f).join('; ');
  // an app screen: only the breakage and the words checks apply
  if (app) {
    const titles = (x.longTitles || []).filter((t) => t.level !== 'H1' || t.words > 6);
    if (titles.length) add('WARN', 'sentence-title', `${titles.length} title(s) are sentences: ${list(titles, (t) => `"${t.text}" (${t.words} words)`)}.`, 'Titles on an app screen are nouns of one to three words ("Revenue", "Failed deploys"). The finding, if any, is one short line under the page title.');
    if (desktop && x.sentences > 4) add('WARN', 'app-wordy', `${x.sentences} sentences of more than 12 words on one screen.`, 'An app screen says one thing in words (the finding, one line); the rest is figures, names, labels and controls. Cut the explanations.');
    if (x.cutText?.length) add('FAIL', 'cut-text', `Text is cut by ${x.cutText[0].by} at ${width}px: ${list(x.cutText, (c) => `"${c.text}"`, 5)}.`, 'Nothing may be wider than the screen: let panels wrap, scroll a wide table inside its own frame with a visible edge, or drop columns at this width.');
    if (x.truncated?.length) add('WARN', 'ellipsis', `Text is shortened with an ellipsis: ${list(x.truncated, (t) => `"${t.text}"`, 4)}.`, 'Never cut the figure or name that matters. Let it wrap, shorten the label, or drop a column at this width.');
    if (x.brokenAddress?.length) add('FAIL', 'broken-address', BROKEN(x), BROKEN_FIX);
    return out;
  }
  const wordy = (x.uiWords || []).filter((u) => u.words > 120);
  if (wordy.length) add('WARN', 'fragment-wordy', `${wordy.length} interface fragment(s) carry more than 120 words: ${list(wordy, (u) => `"${u.text}…" (${u.words} words)`)}.`, 'A fragment on a page shows only the part that proves the claim: one panel, three to six rows, real names and figures, no captions or helper text.');

  if (x.imageInHeadline?.length) add('FAIL', 'picture-in-headline', `A picture sits inside a headline: ${list(x.imageInHeadline, (h) => `"${h.text}" (${h.how})`)}.`, 'Headlines are words only. Put the picture beside, above or behind the headline as its own element, at a size that shows what it is. Pictures set into the words or filling the letters are a generated-page tell now.');
  if (x.inlinePictures?.length) add('FAIL', 'picture-in-sentence', `${x.inlinePictures.length} small picture(s) inside running text: ${list(x.inlinePictures, (p) => `"${p.text}" (${p.size})`)}.`, 'Take the thumbnails out of the sentences. A picture worth showing gets its own place and size; a sentence is words.');
  if (x.footer && desktop && x.footer.vw >= 7) add('FAIL', 'giant-footer', `The footer sets "${x.footer.text}" at ${x.footer.size}px (${x.footer.vw}vw).`, 'No giant name or email at the foot of the page: professional sites close with the navigation again, the contact details, the legal line and one action, set at the text sizes. The name belongs in the hero.');
  if (x.footer && (x.footer.creditLinks >= 3 || x.footer.creditMentions >= 3)) add('FAIL', 'credit-wall', `The footer carries picture credits in the open (${Math.max(x.footer.creditLinks, x.footer.creditMentions)} credit links or mentions).`, 'Use pictures that need no credit (the project\'s own, generated, or Unsplash/Pexels-licence photographs). Credits a licence requires go behind one small "Image credits" link that opens a dialog or a separate page, never a wall of links in the footer.');
  const blurry = (x.upscaled || []).filter((u) => u.scale > 1.25), soft = (x.upscaled || []).filter((u) => u.scale > 1.0 && u.scale <= 1.25);
  if (desktop && blurry.length) add('FAIL', 'upscaled-picture', `${blurry.length} picture(s) shown larger than they were made: ${list(blurry, (u) => `${u.src} ${u.natural} shown at ${u.shown} (${u.scale}x)`)}.`, 'Use a source at least 1.5 times the size it is shown (2x for the hero). A small scan blown up to fill a big slot looks cheap; use a smaller slot or a better picture.');
  if (desktop && soft.length) add('WARN', 'soft-picture', `${soft.length} picture(s) shown at about their natural size or a little over: ${list(soft, (u) => `${u.src} ${u.natural} at ${u.shown}`)}.`, 'On a high-density screen these look soft. Request the picture at about twice the shown size.');
  if (x.colour) {
    if (x.colour.hues >= 4) add('FAIL', 'colour-sprawl', `${x.colour.hues} different hues on grounds, type and buttons (${x.colour.how.join(', ')}).`, 'One ground, one ink, one accent. Professional sites use one hue (often none beyond the action). Take every other colour out of grounds, cards, chips and type; colour comes from the pictures.');
    else if (x.colour.hues === 3) add('WARN', 'colour-sprawl', `Three hues on grounds, type and buttons (${x.colour.how.join(', ')}).`, 'One accent hue, used for the action and at most one other thing. Remove the third.');
    // a page on a coloured ground with a second hue on it (pink ground, lime button) is the loudest tell of all
    if (x.colour.colouredShare > 0.6 && x.colour.hues >= 2) add('FAIL', 'colour-ground', `${Math.round(x.colour.colouredShare * 100)}% of the page stands on coloured grounds, with ${x.colour.hues} hues on it.`, 'Put the page on a neutral ground (white, off-white, near-black) and keep one accent. A whole page on colour works only with that colour alone and the ink.');
    else if (x.colour.colouredShare > 0.35) add('WARN', 'colour-ground', `${Math.round(x.colour.colouredShare * 100)}% of the page stands on coloured grounds.`, 'Most of the page belongs on the neutral ground (white, off-white, near-black). One coloured field for one section at most.');
  }
  const bars = (x.rails || []).filter((r) => r.what !== 'a sideways scroller'), scrollers = (x.rails || []).filter((r) => r.what === 'a sideways scroller');
  if (bars.length) add('FAIL', 'drag-bar', `A progress, drag or slider bar outside a working tool: ${list(bars, (r) => `${r.what} ${r.size}${r.text ? ' (' + r.text + ')' : ''}`)}.`, 'Remove it. Scroll progress bars, drag handles and sliders that only move content are decoration; show the content as a plain list or grid.');
  if (desktop && scrollers.length) add('WARN', 'sideways-rail', `${scrollers.length} sideways scroller(s) on desktop: ${list(scrollers, (r) => `${r.size} "${r.text}"`)}.`, 'On desktop show the items in a grid or list that fits the width. A sideways rail hides most of its content and needs a scrollbar or drag to reach it.');
  // (round 11: cards are wanted for grouping; a page built of nothing but boxes still fails)
  if (BOXED_TEXT(x.boxed)) add(x.boxed.share >= 0.85 ? 'FAIL' : 'WARN', 'boxed-page', `${Math.round(x.boxed.share * 100)}% of the running text sits inside filled or outlined boxes${x.boxed.share >= 0.85 ? ': the page is built of nothing but boxes' : ''}.`, 'Cards group what belongs together, not everything: let the statements, the headings and the lead lines stand on the ground, and keep cards for the things a visitor compares or handles (rooms, plans, pieces of work, a booking). Vary the cards from section to section; never a page of boxes.');
  if (x.labels) {
    const per = new Map(); for (const l of x.labels) { const k = Math.floor(l.y / 900); per.set(k, (per.get(k) || 0) + 1); }
    const worst = Math.max(0, ...per.values());
    if (worst > 6 || x.labels.length > Math.max(10, screens * 3)) add('WARN', 'label-clutter', `${x.labels.length} little labels on the page (up to ${worst} on one screen): ${list(x.labels, (l) => `"${l.text}"`, 6)}.`, 'Cut every label, tag, timestamp and caption that does not carry information a visitor needs. A card does not need "Today, 8:14 am" or "Connected source".');
  }
  if (x.walls?.length) add('WARN', 'text-wall', `${x.walls.length} paragraph(s) over 70 words: ${list(x.walls, (w) => `"${w.text}…" (${w.words} words)`)}.`, 'Say it in a third of the words. Paragraphs on a page are two or three sentences; the rest is a link to a page that has room for it.');
  // on desktop a product fragment cropped by the screen edge is a deliberate crop; on tablet and phone it is breakage
  const cut = (x.cutText || []).filter((c) => !c.ui || !desktop);
  if (cut.length) add('FAIL', 'cut-text', `Text is cut by ${cut[0].by} at ${width}px: ${list(cut, (c) => `"${c.text}"${c.ui ? ' (in a mock-up)' : ''}`, 5)}.`, 'Nothing may be wider than the screen. Give mock-ups and fixed-width panels max-width: 100% and let their content wrap, or design a narrower version for phone and tablet; never let a box clip its own words.');
  const dots = (x.truncated || []).filter((t) => !t.ui);
  if (dots.length) add('WARN', 'ellipsis', `Text is shortened with an ellipsis: ${list(dots, (t) => `"${t.text}"`, 4)}.`, 'Never cut the figure or name that matters. Let it wrap, shorten the label, or drop a column at this width.');
  if (width < 1100 && x.stickyBands?.length) add('FAIL', 'sticky-band', `A sticky or fixed band covers ${x.stickyBands[0].h}% of the ${width}px screen: ${list(x.stickyBands, (b) => `"${b.what}" (${b.h}%)`)}.`, 'Below 1100px, release pinned stages and sticky pictures: let them scroll as ordinary blocks. Only the navigation may stay fixed on a phone, and it stays thin.');
  if (x.formInSentence?.length) add('FAIL', 'form-in-sentence', `A form field sits inside a headline or sentence: ${list(x.formInSentence, (f) => `"${f.text}"`)}.`, 'Put the field and its button on their own row under the heading, with a visible label: the sentence-form field broke on 8 of 9 reviewed pages.');
  if (x.repeatedPictures?.length) add('WARN', 'repeated-picture', `The same large picture appears more than once: ${list(x.repeatedPictures, (p) => `${p.src} (${p.n}x)`)}.`, 'Use each photograph once per page; a scene that needs several pictures needs several different pictures of the subject.');
  if (x.repeatedHeadings?.length) add('WARN', 'repeated-heading', `A heading appears twice: ${list(x.repeatedHeadings, (h) => `"${h}"`)}.`, 'Each heading appears once. A scene that introduces a section and the section itself share one heading.');
  if (desktop && x.hollow?.length >= 2) add('WARN', 'hollow-box', `${x.hollow.length} boxes are mostly empty inside (content at their top and foot, nothing between): ${list(x.hollow, (b) => `"${b.text}" ${b.h}px`)}.`, 'Size boxes to their content. A price card, a tile or a slab with nothing in its middle reads as broken; shrink it or give it what it is missing.');
  if (x.switchList >= 3) add('WARN', 'switch-list', `${x.switchList} switches, checkboxes or radio buttons outside a form or a product fragment.`, 'Do not present features as toggles: half of them look switched off. A feature is a line of text (or a picture with a line), at full contrast.');
  // (round 9: a drawing past icon size fails at 1.2% of the screen or more, labels or not: diagrams and charts too)
  const big = (x.drawings || []).filter((d) => d.share >= 0.012), small = (x.drawings || []).filter((d) => d.share < 0.012);
  if (big.length) add('FAIL', 'drawn-illustration', `${big.length} drawing(s) in inline SVG: ${list(big, (d) => `${d.kind || 'a drawing'}, ${d.size ? d.size + 'px, ' : ''}${Math.round(d.share * 100)}% of the screen, ${d.shapes} shapes, near "${d.near}"`)}.`, 'No drawn diagrams, charts, illustrations or shapes: they read as clip art beside real work. Say the process in words (three short steps as type), show a real frame, a photograph or the product\'s own interface, or set the section in type. Inline SVG is for a brand\'s logo (assets.mjs --logo) and small icons.');
  if (small.length >= 3) add('WARN', 'svg-doodles', `${small.length} small drawn figures in SVG around the page.`, 'Remove decorative drawings and motifs; a page earns its look from type, space and real pictures.');
  // (round 11, Leon: "too much text": the hero 30 words at most, a section 60 outside its lists and tables, the page about
  // 500; over half as much again fails)
  if (desktop && x.firstScreenWords > 30) add(x.firstScreenWords > 45 ? 'FAIL' : 'WARN', 'wordy-hero', `The first screen carries ${x.firstScreenWords} words (30 at most).`, 'The first screen is the headline (12 words at most), one short line and the action: 30 words at most in all. Cut the rest, or move one fact down to the section that proves it.');
  if (desktop && x.wordySections?.length) for (const level of ['FAIL', 'WARN']) {
    const ws = x.wordySections.filter((s) => (level === 'FAIL' ? s.words > 90 : s.words <= 90));
    if (ws.length) add(level, 'wordy-section', `${ws.length} section(s) carry more than ${level === 'FAIL' ? 90 : 60} words outside their lists and tables: ${list(ws, (s) => `"${s.head}" (${s.words} words${s.over ? `, ${s.over} of them past 25 in its ${s.items} cards or items` : ''})`)}.`, 'A section says one thing in 60 words at most: a heading, one or two short sentences, and the facts as a list or a table. A card says its point in about 25 words. Cut, never shrink the type.');
  }
  if (desktop && x.pageWords && x.pageWords.all > 500) add(x.pageWords.all > 750 ? 'FAIL' : 'WARN', 'wordy-page', `The page carries ${x.pageWords.all} words (about 500 at most${x.pageWords.footer ? `; ${x.pageWords.footer} of them in the footer` : ''}).`, 'Cut the page to about 500 words: fewer, shorter sections, one sentence under each heading, facts in lists, nothing said twice.');
  if (desktop && x.tinyUi > 6) add('WARN', 'tiny-mockup-text', `${x.tinyUi} pieces of text inside interface fragments are under 11.5px.`, 'A fragment of the product on a page is shown at a size a visitor can read: labels 12px or more, its main text 14px or more. Crop it to fewer rows rather than shrinking it.');
  // (round 9: a template street or a zeroed phone fails, r7-p36; an example domain or a run of one digit warns)
  for (const level of ['FAIL', 'WARN']) {
    const ph = (x.placeholders || []).map((p) => (typeof p === 'string' ? { text: p, level: 'WARN' } : p)).filter((p) => p.level === level);
    if (ph.length) add(level, 'placeholder-contact', `Placeholder contact details: ${list(ph, (p) => `"${p.text}"${p.why ? ` (${p.why})` : ''}`, 4)}.`, 'Never Musterstraße, Main Street, a number of zeros or a 555 number. With no address in the brief, a place people go to prints a real street in the right district with no house number, the district, the nearest stop, the opening hours and a "Directions" link to a map; a page with no door prints no street at all. With no phone in the brief, print none. The email stays on the brand\'s own domain. List what the client must confirm in your report, never on the page (references/copy.md §5).');
  }
  if (x.builderNotes?.length) add('FAIL', 'builder-note', `A note meant for the client is on the page: ${list(x.builderNotes, (p) => `"${p}"`)}.`, 'Never tell visitors about missing pictures, sample content or what will be replaced. Design the section without the missing asset and say it in the report.');
  // (round 11: a bar fixed to the foot of a phone's screen counts as the navigation)
  if (x.nav && !(x.nav.foot >= 2) && (x.nav.links < 2 || (!desktop && x.nav.links < 3)) && !x.nav.menu) add('FAIL', 'no-nav', `No navigation at the top of the page (${x.nav.links} link(s) in the first 160px).`, 'Every page has a header: the name, links to its main sections and the one action (or a Menu button on a phone).');
  if (desktop && x.rightHuddled?.length) add('WARN', 'empty-left', `${x.rightHuddled.length} band(s) with nothing in the left ${x.rightHuddled[0].from}% of the width: ${list(x.rightHuddled, (b) => `"${b.text}" at ${b.y}px`)}.`, 'A row with an empty left side and text on the right looks broken. Put the heading on the left and the text on the right, or set the block from the left margin.');

  // ---------- round 4 ----------
  for (const g of x.giantContact || []) add('FAIL', 'giant-contact', `The ${g.what === 'name' ? 'name' : 'contact'} "${g.text}" is set at ${g.size}px (${g.vw}vw).`, 'Set the email no larger than the h3 step, as a mailto link with a Copy button beside it, among the contact facts. The name belongs in the navigation and the hero; the page ends on the action as a statement, never on its own address or name set large.');
  if (x.heroCard && width >= 700) add('FAIL', 'hero-in-card', `The hero headline "${x.heroCard.text}" sits inside a ${x.heroCard.w}×${x.heroCard.h}px panel (${x.heroCard.bg}).`, 'Set the headline on the page ground or on its picture, never in a card, panel or box. The first screen is one composition: the headline, one sentence that says what this is, the action, the picture.');
  if (x.ranges?.length) add('FAIL', 'range-slider', `${x.ranges.length} range slider(s): ${list(x.ranges, (r) => `"${r.label}"`)}.`, 'Use stepped buttons: a row of 3-6 real values (20 s, 45 s, 90 s, 2 min) as radio buttons styled as one segmented row, or a number field with − and + buttons. A slider is a drag rail and is fiddly with a thumb.');
  // (round 11: a grid of cards is fine; cards half empty inside are not)
  for (const b of x.bento || []) if (b.voids.length >= 2) add('FAIL', 'bento', `"${b.head}" is a grid of ${b.n} boxed cards; ${b.voids.length} are half empty or more (${list(b.voids, (v) => `"${v.text}" ${Math.round(v.empty * 100)}% empty`)}).`, BENTO_FIX);
  // (round 9: under 14px fails on desktop and tablet, under 15px on a phone; 14-15px warns; tables and lists count)
  const smallText = (x.smallBody || []).map((s) => ({ level: 'FAIL', what: 'text', ...s }));
  const smallFail = smallText.filter((s) => s.level === 'FAIL'), smallWarn = smallText.filter((s) => s.level !== 'FAIL');
  const smallList = (a) => list(a, (s) => `"${s.text}" ${s.size}px${s.what !== 'text' ? ` (${s.what === 'footer' ? 'in the footer' : s.what === 'labels' ? 'the labels of a list' : `a ${s.what}`})` : ''}`, 4);
  if (smallFail.length) add('FAIL', 'small-body', `${smallFail.length} block(s) of running, list or table text under ${width < 600 ? 15 : 14}px at ${width}px: ${smallList(smallFail)}.`, SMALL_FIX);
  if (smallWarn.length) add('WARN', 'small-body', `${smallWarn.length} block(s) of running, list or table text at ${width >= 1100 ? '14-15' : '14'}px: ${smallList(smallWarn)}.`, SMALL_FIX);
  if (!smallText.length && desktop && x.smallUnderHead?.length) add('WARN', 'small-body', `Small text under a display heading: ${list(x.smallUnderHead, (s) => `"${s.text}" ${s.size}px under a ${s.head}px heading`)}.`, SMALL_FIX);
  if (x.brokenAddress?.length) add('FAIL', 'broken-address', BROKEN(x), BROKEN_FIX);
  if (x.resultFirst?.length) add('FAIL', 'result-first', `A tool shows its result above the controls that set it: ${list(x.resultFirst, (r) => `"${r.text}" over the controls of "${r.tool}"`)}.`, 'Controls first and the result under them at every width (source order: controls, then the output); on desktop the result may sit beside them, never above. The result stands on the section\'s ground, not in a tinted box.');
  if (x.emptyBoxes?.length) add('WARN', 'empty-box', `${x.emptyBoxes.length} filled or outlined box(es) with nothing in them: ${list(x.emptyBoxes, (b) => `${b.size} at ${b.at}px near "${b.near}"`)}.`, 'A box with nothing in it is a leftover: remove it, or check what failed to load at this width.');
  if (desktop && x.hollowFragment?.length) add('WARN', 'hollow-fragment', `The first screen's product fragment has ${x.hollowFragment.length} pane(s) that are mostly empty: ${list(x.hollowFragment, (p) => `"${p.text}" ${p.size}, ${Math.round(p.empty * 100)}% empty`)}.`, 'Fill every pane with the mechanism at work (the replay\'s last state), or crop the panes that have nothing to say.');
  if (desktop && x.pictureSeries?.length) add('WARN', 'repeated-picture', `One series of pictures used again and again: ${list(x.pictureSeries, (s) => `"${s.stem}" ${s.n} times`)}.`, 'Pictures of one series count as one: at most two from one shoot or archive per page, and never as filler.');
  for (const d of (x.sceneDrawings || []).filter((v, i, a) => a.findIndex((q) => q.id === v.id) === i)) add('FAIL', 'scene-drawing', `A drawing inside the scene "${d.id}": ${d.shapes} shapes, ${Math.round(d.share * 100)}% of the screen.`, 'Scenes show real pictures, the product\'s interface, a labelled map or plan, the brand\'s mark, or type; no wheels, waves, polygons, axles, dials or doodles. Mark a map, a plan or the mark data-map, data-plan or data-mark (references/scenes.md rule 7).');
  for (const t of x.sceneTracks || []) add('FAIL', 'scene-track', `${t.what === 'a progress bar' ? 'A progress bar' : t.what === 'a bar that fills' ? 'A bar that fills with the scroll' : 'A track with a marker'} inside the scene "${t.id}"${t.w ? ` (${t.w}px)` : ''}.`, 'No rail, scrubber, playhead or progress bar stands for the scroll; the stage itself shows where the story is.');
  if (desktop) for (const r of x.replays || []) {
    if (r.clash) add('FAIL', 'replay-clash', `The product replay ${r.hero ? 'sits in the hero while the entrance is Product at work' : 'carries the entrance\'s or a reveal\'s markers (data-e, data-moment, data-reveal)'}.`, 'One fragment, one motion: the replay plays its own beats; the hero\'s fragment is the entrance\'s.');
    if (!r.control) add('FAIL', 'replay-control', 'The product replay has no Replay button.', 'Put a visible button ("Replay") under the window (data-replay-again); a returning visitor presses it, never sits through a loop.');
    if (r.beats < 3 || r.beats > 5 || r.marks < 3) add('WARN', 'replay-beats', `The product replay has ${r.beats} beat(s) and ${r.marks} marked step(s).`, 'Three to five beats in data-replay, each one large change marked in the window (data-open-at, data-focus-at, data-at with data-push, data-flip-at, data-roll-at on a figure at display size, data-zoom-at and the rest; references/motion.md, "Product replay"). data-point-at only aimed a cursor and is not a step.');
    if (r.recording) add('FAIL', 'replay-video', 'The product replay is a recording or a screenshot (a video or picture covers 40% of it or more) instead of live parts.', 'Build the window in HTML in its final state and let replay.js play its beats; never a video, a GIF or screenshots in sequence.');
  }

  // ---------- round 6 ----------
  // the product replay is the page's big moment: a large window, held while the visitor's scroll steps its beats
  for (const r of x.replays || []) {
    const need = desktop ? { w: 0.66, h: 0.38 } : width >= 600 ? { w: 0.8, h: 0.25 } : { w: 0.86, h: 0.22 };
    if (r.w < need.w || r.h < need.h) add('FAIL', 'replay-small', `The product replay's window is ${Math.round(r.w * 100)}% of the width and ${Math.round(r.h * 100)}% of the height of the ${width}px screen.`, 'The replay is the page\'s big moment: the window 70% of the width or more on desktop (about 1000px at 1440) and 40% of the screen\'s height, nearly the full width on a phone, its text 16px or more. Crop the product to the panel that does the task rather than shrinking it.');
    // (held for the beats it plays: replay.js skips the beats before data-replay-start, replay-unseen names them)
    const played = Math.max(1, r.beats - (r.start || 0));
    if (r.held < played * 0.35) add('FAIL', 'replay-not-held', `The product replay is not held while its ${played} beats play (${r.held} screens of hold${r.stage ? '' : ', no .replay-stage round it'}).`, 'Put the heading, the window, its sentence and the Replay button in one stage: <section class="replay-hold"><div class="replay-stage">…</div></section>. replay.js holds the stage about half a screen per beat and the visitor\'s scroll steps the beats (references/motion.md, "Product replay"). A window that plays by itself while it scrolls past is not seen.');
  }

  // ---------- round 7: replays the judges did not see move (r6-p32, r7-p33) ----------
  // what the window is built from, at every width; how much each beat changes is measured in inspect.mjs (replay-faint)
  for (const r of x.replays || []) {
    if (r.cursors) add('FAIL', 'replay-cursor', `The product replay carries ${r.cursors > 1 ? `${r.cursors} drawn cursors` : 'a drawn cursor'} (data-replay-cursor, or a small pointer drawn over the window) that stands in for the visitor.`, 'Remove it: a drawn pointer gliding about is the motion the eye follows, and the change it makes is lost under it. The change itself shows the action (the button takes its pressed state, the panel opens from it, the item takes the accent); a teammate is shown by name on the block they change (references/motion.md, "Product replay").');
    if (r.minText != null && r.minText < 14) add('FAIL', 'replay-type', `Text in the product replay's window is ${r.minText}px at ${width}px: ${r.small.map((s) => `"${s.text}" ${s.size}px`).join(', ')}.`, 'Nothing in the window under 14px, and what changes at a beat 16px or more on desktop (15px on a phone): set the window\'s type larger and show fewer rows, columns or items rather than shrinking them. The film and the judge see the window at a fraction of its size.');
    else if (r.markedSmall?.length && r.markedMin < (desktop ? 16 : 15)) add('WARN', 'replay-type', `What the product replay's beats change is set at ${r.markedMin}px at ${width}px: ${r.markedSmall.map((s) => `"${s.text}" ${s.size}px`).join(', ')}.`, `What changes at a beat is ${desktop ? '16px' : '15px'} or more: a status word, a count or a line of meta set small changes too little of the screen to be seen.`);
    if (r.boxes?.length >= 3) add('FAIL', 'replay-nested', `The product replay's window is boxes in a box: ${r.boxes.length} parts inside it on their own fill or outline (${list(r.boxes, (b) => `"${b.text}" ${b.size} on ${b.how}`)}).`, 'The window is the one surface: inside it, set the items apart by space and type, never by tiles, cards, filled rows or hairline rules, and never a panel inside the panel. Only what a beat changes takes a fill (the item at work, a panel that opens), and fields keep their outline.');
    else if (r.boxes?.length) add('WARN', 'replay-nested', `The product replay's window holds ${r.boxes.length} part(s) on a fill or outline of their own: ${list(r.boxes, (b) => `"${b.text}" ${b.size} on ${b.how}`)}.`, 'The window is the one surface: set its parts apart by space and type, not by a panel inside it. Only what a beat changes takes a fill.');
    if (r.lookalike) add('WARN', 'replay-lookalike', `What the product replay moves or changes ("${r.lookalike.text}", ${r.lookalike.size}) has ${r.lookalike.twins} look-alikes in the window: the same size, the same fill, nothing of its own to tell it apart.`, 'The item a beat changes is the one the eye finds: it takes the accent fill while it works (data-focus-at), it is larger than the items round it, or it is the only one of its kind (fewer, shorter items beside it, set as type).');
    if (desktop && (r.accentStill?.length || r.accentButton)) add('WARN', 'replay-accent', `The accent in the product replay's stage sits on what does not change: ${[...(r.accentStill || []).map((t) => `"${t}"`), r.accentButton ? 'the filled Replay button' : null].filter(Boolean).join(', ')}.`, 'The accent marks what changes at each beat and nothing else in the window; the Replay button is quiet (a text button in ink), so the change is the brightest thing on the screen.');
  }
  if (x.fragmentBoxes?.length) add('WARN', 'fragment-boxes', `${x.fragmentBoxes.length} fragment(s) of the product are boxes in a panel: ${list(x.fragmentBoxes, (f) => `${f.n} boxes ("${f.first}" …) in "${f.text}"`)}.`, 'A fragment on a page is one surface in the page\'s own ground: its rows set apart by space and type, never filled rows or cards inside a filled panel. Stacks of boxes on a ground of the same darkness read as one long screenshot (references/imagery.md, references/app-screens.md §1).');
  // (a card grid the bento check already fails is not reported twice)
  // (round 11: items on a fill are cards, and cards are wanted; a list fails when its items are drawn by an outline alone,
  // cut to a shape, or hold a box of their own)
  const BOXED_HOW = { outlined: 'outlined', shaped: 'cut to a shape by a mask or a clip-path', nested: 'each holding a box of its own' };
  const boxedLists = (x.boxedLists || []).filter((b) => BOXED_HOW[b.how] && !(x.bento || []).some((g) => g.voids.length >= 2 && b.head && g.head.startsWith(b.head)));
  if (boxedLists.length) add('FAIL', 'boxed-list', `${boxedLists.length} list(s) drawn as boxes that are not cards: ${list(boxedLists, (b) => `${b.n} items ${BOXED_HOW[b.how]}${b.how !== 'outlined' ? ` on ${b.fill}` : ''} under "${b.head}" ("${b.first}" …)`)}.`, 'Cards are fine: a fill one step from the ground, a picture-led card, a row on a surface. Not an outline as the frame, not a box cut into a ticket, a tab or a torn edge, not a box inside a box. Give each item a plain fill (or set the list as type on the ground), one level deep. Options are text buttons whose chosen one alone is filled.');
  const lone = [...(x.loneColumns || []).map((c) => (c.heading ? `"${c.text}" alone in its column beside ${c.span}px of content (${Math.round(c.fill * 100)}% of the column used)` : `"${c.text}" in a column empty for ${100 - Math.round(c.fill * 100)}% of the ${c.span}px its neighbour fills`)), ...(x.loneScreens || []).map((s) => `"${s.text}" alone on screen ${s.screen}`)];
  if (lone.length) add('FAIL', 'lone-heading', `A section heading sits alone, the rest of its row or screen empty: ${lone.slice(0, 4).join('; ')}.`, 'A heading leads its content and never holds a column or a screen by itself. Set it over its content (the list under it, in one column), or give its column real weight (the sentence that sums the section up, a figure, a picture); a heading that opens a scene arrives with its picture already in view. Only a display statement that is the section\'s whole subject stands alone.');
  const ctl = x.controls || {};
  if (ctl.decorative?.length) add('FAIL', 'decorative-control', `${ctl.decorative.length} control(s) change nothing when used: ${list(ctl.decorative, (d) => `the ${d.what} in "${d.text}"`)}.`, 'A switch, checkbox or slider on a page does what it says (filters the list, changes the price, shows the plan) or belongs to a form that is sent. Features are lines of text at full ink, never toggles: remove the controls, or wire each one to what it claims to change.');
  // (round 9: a line with dots or a round knob on it reads as a slider; r8-p38's thread tracks)
  if (x.dotTracks?.length) add('FAIL', 'decorative-control', `${x.dotTracks.length} track(s) drawn as a line with ${x.dotTracks.some((t) => t.knob) ? 'a round knob or dots' : 'dots'} read as sliders and do nothing: ${list(x.dotTracks, (t) => `"${t.text}" (${t.dots} ${t.dots === 1 ? 'dot' : 'dots'}${t.knob ? ', a knob' : ''}${t.ui ? ', in a product window' : ''})`)}.`, 'A line with a knob or dots on it is a slider to the eye, and a visitor drags it. Show the values as type: the figure or the word at its place in a row ("green on page 212, grey on 14, 88, 131"), or a short list, the one that matters named first; never a knob on a line.');
  // (round 9: a split hero's headline is display size; part A, r7-p34 and r8-p38)
  const sh = x.splitHero;
  if (desktop && sh && sh.size < width * 0.05 - 0.25) add(sh.size < (width * 64) / 1440 - 0.25 ? 'FAIL' : 'WARN', 'split-hero-title', `The h1 "${sh.text}" is ${sh.size}px (${sh.vw}vw) ${sh.how === 'beside' ? `beside a ${sh.kind}` : `in a strip between pictures, the largest a ${sh.kind}`} ${sh.w}% of the width on the first screen.`, `Beside a picture the headline still leads: ${Math.round(width * 0.05)}px (5vw) or more at this width, under ${Math.round((width * 64) / 1440)}px fails. Raise --step-display for the split (draw.mjs prints it), cut the headline to fit two lines, or let the picture go full bleed with the title on it (references/layout.md §5).`);
  if (ctl.greyed?.length) add('FAIL', 'contrast', `Greyed rows beside controls are unreadable: ${list(ctl.greyed, (g) => `"${g.text}" ${g.ratio}:1 needs ${g.need || 4.5}:1`, 4)}.`, 'Raise contrast to at least 4.5:1 for text, 3:1 for large display. Every state of a row is read: show the state with the control itself, never by greying the words.');
  return out;
}
// ---------- round 10, part B: the page as built (probe-page.mjs), from r9-p41, r9-p42 and r9-p43 ----------
// b: pageBuild() at this width; scenes: pageBuild({ scenes: true }) on the reduced-motion page (desktop only);
// boxed: the boxed-list findings' headings, so one row of boxes is not reported twice; dead: deadControls().
// Round 11: b.space (space()), b.nav (navBar()) and b.crops (crops()), set on b by inspect.mjs.
// Round 11b, on desktop: b.grounds (grounds()), b.foot (footing() and the dealt footer) and b.work (workShown()).
// Round 11c, on desktop: b.buttons (buttonShapes()), b.navs (navForm() at load, down and up, and the dealt navigation) and
// b.structures (structures()); boxedText: extra()'s running text in boxes, which judgeExtra reports as boxed-page.
// Round 11d, on desktop: b.grounds is the walk's (groundPoints() at every screen, then grounds()), b.pictures
// (pictureCredits()); b.space.hero.title at 1440 and 390.
// Round 11e, on desktop: b.places (samePlace() at the top of the page, then at every screen of the walk) and b.footLinks
// (footerLinks()); b.buttons holds the bar's shapes past the hero too (marked past).
export function judgeBuild(b, { width, allow = [], boxed = [], scenes = null, dead = null, boxedText = null } = {}) {
  const out = [];
  const add = (level, id, message, fix) => { if (!allow.includes(id)) out.push({ level, id, width, message, fix }); };
  const desktop = width >= 1100;
  const list = (a, f, n = 3) => a.slice(0, n).map(f).join('; ');
  if (!b) return out;
  // three framed elements in one section fail, two warn: the product's window alone, or one picture, is the section's
  // one frame (r9-p41's "What it does": three slabs of the product beside a photograph; r9-p43's "Where the house
  // stands": a white box on the photograph and a green tile beside it). A row of boxes the boxed-list check names is
  // not reported again.
  // Round 11 (Leon: cards are wanted, they show what belongs together): cards on a fill and product windows pass in any
  // number. A section fails for a box inside a box, a box laid on a photograph with half of it or more (r9-p43's note in
  // the corner of the fjord), a box cut to a shape by a mask or a clip-path (r9-p43's perforated tickets, r8-p38's torn
  // receipt), or three boxes or more drawn by their outline alone.
  const framed = [...(b.framed || []), ...((scenes && scenes.framed) || [])].filter((f, i, a) => a.findIndex((g) => g.head === f.head) === i && !boxed.some((h) => h && f.head.startsWith(h)));
  const faults = framed.map((f) => ({ f, why: [...(f.nested || []).map((t) => `a box in a box: ${t}`), ...(f.onPhoto || []).map((t) => `a box on a photograph: ${t}`), ...(f.shaped || []).slice(0, 1).map((t) => `${f.shapedN > 1 ? `${f.shapedN} boxes` : 'a box'} cut to a shape: ${t}`), ...((f.outlined || 0) >= 3 ? [`${f.outlined} boxes drawn by their outline alone (${f.items.slice(0, 2).join(', ')})`] : [])] })).filter((x) => x.why.length);
  // (three product windows or more on the first screen: r8-p38's four windows round its title; one is the hero's picture)
  const hw = b.heroWindows || [];
  if (hw.length >= 3) faults.unshift({ f: { name: 'the first screen' }, why: [`${hw.length} product windows at once (${hw.slice(0, 3).join(', ')})`] });
  if (faults.length) add('FAIL', 'framed-elements', `${faults.length} section(s) frame their content in a way cards should not: ${list(faults, (x) => `${x.f.name || `"${x.f.head}"`}: ${x.why.slice(0, 2).join('; ')}`)}.`, FRAMED_FIX);
  if (b.stats?.length) add('WARN', 'stats-band', `${b.stats.length} row(s) of big figures or words over short labels: ${list(b.stats, (s) => `${s.items.slice(0, 4).join(', ')}${s.head ? ` in "${s.head}"` : ''}`, 2)}.`, 'Cut the band. A figure that matters goes into the sentence that argues it ("80 kg in the box, two children on the bench") or beside the picture it proves; a row of numbers or one-word claims over labels is the template\'s proof strip.');
  if ((b.emailFields || []).length >= 2) add('WARN', 'duplicate-form', `${b.emailFields.length} email fields on one page: ${list(b.emailFields, (f) => `"${f.label || 'email'}"${f.button ? ` with "${f.button}"` : ''} in "${f.where.slice(0, 30)}"`)}.`, 'One sign-up per page, at the size of a field, where the page ends. The footer does not ask a second time; a second offer (a newsletter beside a download) is one field with one sentence that says both.');
  // three sections in a row with the same split: a picture beside the text at about the same width, on either side
  // (r9-p42: the hero, the bike and the loads beside one sticky photograph, then the ride beside its own)
  if (desktop) {
    const sp = b.splits || []; let run = [];
    const flush = () => { if (run.length >= 3) add('WARN', 'repeated-split', `${run.length} sections in a row are the same split, a picture beside the text at about ${Math.round((run.reduce((t, s) => t + s.share, 0) / run.length) * 100)}% of the width: ${run.slice(0, 5).map((s) => `"${s.head.slice(0, 32)}" (picture ${s.side})`).join(', ')}.`, 'Change the arrangement from one section to the next: a picture across the full width with the words under or on it, a headline over the whole grid, a list set as type with no picture, an 8/4 split. Never two sections in a row with the same arrangement, and at least one that breaks the split grid.'); run = []; };
    for (const s of sp) { if (s.kind === 'split' && (!run.length || Math.abs(s.share - run[0].share) <= 0.15)) run.push(s); else { flush(); if (s.kind === 'split') run.push(s); } }
    flush();
  }
  if (desktop && b.runOn?.length) add('WARN', 'empty-left', `${b.runOn.length} column(s) run out while the column beside them runs on, leaving the left side empty: ${list(b.runOn, (r) => `"${r.head}" ends ${r.gap}px above the foot of its neighbour`)}.`, 'When a column runs out, let the other one take the full width below it (the rest of the list in two or three columns across the grid), or set the heading over the list in one column. A row empty on the left reads as broken.');
  // the page's credits list against the pictures it shows (r9-p43: nine pictures, eight credits; room-attic.jpg had none)
  const c = b.credits;
  if (c && (c.ledgerMiss.length || (c.pictures > (c.capacity || c.entries) && c.unmatched.length))) add('WARN', 'uncredited-picture', c.ledgerMiss.length ? `${c.ledgerMiss.length} picture(s) fetched with a credit are shown with no entry in the page's credits: ${c.ledgerMiss.slice(0, 4).join(', ')}.` : `The page shows ${c.pictures} pictures and its credits list ${c.entries}; no entry names ${c.unmatched.slice(0, 4).join(', ')} by its file.`, 'Every photograph that is not the client\'s own has its entry in the credits (title, author, licence, a link to the source); a picture whose credit names another business (a hotel\'s room, another maker\'s product) is never shown as the client\'s (`credit-names-business`). A picture cropped from another is credited as that picture.');
  // controls on the first screen that change nothing (r9-p41's hero: a search box and a New note button drawn in the
  // product's window, clickable to the eye, dead to the hand)
  if (desktop && dead && dead.dead?.length) add('WARN', 'dead-control', `${dead.dead.length} control(s) on the first screen change nothing when used: ${list(dead.dead, (d) => `${d.what.startsWith('drawn') ? `a ${d.what.slice(6)} drawn in the product's window` : `the ${d.what}`} "${d.text}"`, 4)}.`, 'A control on the first screen works (the search finds, the button opens what it names) or reads as part of a still picture: in a product window drawn as an image, draw fields and buttons as the product draws them at rest, with no hover, no pointer and no focus ring, and never a lone call to type into.');

  // ---------- round 11 (Leon, 29 October: cluttered pages, the next section already in the first view, a sentence in the
  // bar, an info strip over it, text everywhere) ----------
  const phoneOrDesk = desktop || width < 600;
  // the hero fills the first screen alone (at 1440 by 900 and 390 by 844, the phone's screen with its address bar shown)
  const hs = b.space?.hero;
  if (phoneOrDesk && hs && (hs.next?.seen || hs.cut)) {
    const s = hs.next?.seen, c = hs.cut;
    const what = (x) => (x.what === 'ground' ? `its ground (${x.text})` : x.what === 'heading' ? `its heading "${x.text}"` : x.what === 'picture' ? `a picture (${x.text})` : x.what === 'box' ? `a box ("${x.text}")` : x.what === 'control' ? `a control ("${x.text}")` : `its words "${x.text}"`);
    add('FAIL', 'hero-not-alone', s ? `The next section shows on the first screen at ${width}px: ${what(s)}${hs.next.head && !(s.what === 'heading' && hs.next.head.startsWith(s.text)) ? ` of "${hs.next.head}"` : ''}, ${s.px}px above the foot of the screen.` : `The foot of the first screen cuts through what comes next at ${width}px: ${c.what === 'text' || c.what === 'heading' ? `the words "${c.text}"` : `${c.what === 'picture' ? 'a picture' : 'a box'} ("${c.text}")`} start ${c.px}px above it and run on under it.`, `The hero fills the first screen alone: give it the screen's height (min-height: 100svh, ${width < 600 ? 'the phone\'s screen with its address bar' : 'the full 900px at 1440'}), place everything it holds inside that height, and let the next section start under the fold with its own space above it. Nothing of the next section (a heading, a picture, a band of colour, the tops of a row of figures) shows before the visitor scrolls.`);
  }
  // round 11d: the hero's own title across the fold, at any size (r12-p56's "Kaffee Klee", dealt to cross the fold over its
  // photograph, read as cut off); its words are not named again by hero-not-alone
  const ht = hs?.title;
  if (phoneOrDesk && ht) add('FAIL', 'hero-cut', `The hero's title "${ht.text}" crosses the foot of the first screen at ${width}px: "${ht.under}" runs ${ht.px}px under it.`, `The hero's title stands whole on the first screen (${width < 600 ? 'the phone\'s screen with its address bar' : '900px tall at 1440'}): its last line ends above the fold with air under it, however the hero is dealt. A size that does not fit takes the next step down, never a crop at the fold; a title that runs on under the fold reads as cut off.`);
  // the air between sections, on desktop: under 12% of the screen warns, under 6% fails (a scene's held stretch aside)
  if (desktop && b.space?.air?.length) for (const level of ['FAIL', 'WARN']) {
    const as = b.space.air.filter((a) => (level === 'FAIL' ? a.gap < 54 : a.gap >= 54));
    if (as.length) add(level, 'section-air', `${as.length} section(s) follow the one before with ${level === 'FAIL' ? 'under 6%' : 'under 12%'} of the screen between their content: ${list(as, (a) => `"${(a.b || a.bSel).slice(0, 36)}" ${a.gap}px under "${(a.a || a.aSel).slice(0, 36)}"`, 4)}.`, 'Give sections real space: about 16% of the screen or more between one section\'s last line and the next one\'s first (140px or more at 1440 by 900), the same step everywhere, more before a change of subject. A page where the next section is already there reads as cluttered.');
  }
  // the navigation: no strip over it, and no sentence in it (r8-p38's bar: "Marks what an editor should check. Rewrites
  // nothing." between the title and the links)
  // (words of the strip over the bar are named once, as the strip)
  const nv = b.nav ? { ...b.nav, sentences: (b.nav.sentences || []).filter((t) => !(b.nav.above || []).some((a) => a.startsWith(t.slice(0, 30)) || t.startsWith(a.slice(0, 30)))) } : null;
  if (nv && nv.above?.length) add('FAIL', 'announcement-bar', `A strip sits above the navigation: ${list(nv.above, (t) => `"${t}"`, 3)}.`, 'No announcement or info bar over the navigation: the bar is the first thing on the page. Put the opening hours, the address or the offer where it belongs on the page (the visit block, the hero\'s line, the footer).');
  if (nv && (nv.sentences?.length || nv.items?.length)) add('FAIL', 'nav-sentence', `The navigation bar carries ${[nv.sentences?.length ? `${nv.sentences.length === 1 ? 'a sentence' : `${nv.sentences.length} sentences`}: ${nv.sentences.slice(0, 2).map((t) => `"${t}"`).join(', ')}` : '', nv.items?.length ? `${nv.items.length === 1 ? 'an item' : `${nv.items.length} items`} longer than three words: ${nv.items.slice(0, 3).map((t) => `"${t}"`).join(', ')}` : ''].filter(Boolean).join('; ')}.`, 'The bar holds the name, a few links of one to three words and one action, nothing else. The line that says what this is belongs in the hero, under the headline.');
  // a picture cut hard while it carries lettering or is the work (r10-p47's ZUIDKAI, KAAP and "Pelik")
  const cr = (b.crops || []).filter((c) => c.cut >= 0.15);
  if (cr.length) add('WARN', 'cropped-lettering', `${cr.length} picture(s) ${cr.some((c) => c.lettering) ? 'with lettering in them, or of the work,' : 'of the work'} are cut hard by their crop: ${list(cr, (c) => `${c.file} loses ${Math.round(c.cut * 100)}% of its ${c.axis}${c.from ? ` (a crop of ${c.from})` : ''}${c.lettering ? `, and its alt speaks of lettering ("${c.alt.slice(0, 50)}")` : ''}`, 4)}.`, 'Look at each of these crops: a name, a word or a title in a picture stays whole or leaves the frame on purpose, never cut to "Pelik". Give the frame the picture\'s own proportions, move the crop (object-position) so the lettering stays inside, or cut a version of the picture for that frame. A piece of work is shown whole, or in a crop that shows a detail on purpose.');

  // ---------- round 11b (r11-p51: seven grounds and panels, the work as type cards, a footer read as one credit
  // line) ----------
  // every ground the walk saw, by the screens a visitor sees it on (round 11d: r12-p57 passed with its stone ground, its
  // surface, the ink over 4.7 screens and a veil in the accent, r12-p58 with a band sampled from its closing photograph
  // beside its ground and its footer's surface). The page's ground and its surface count from a quarter of a screen: the
  // dealt surface, else the largest tone a step from the ground, and a tint a step off the ground beside a dealt surface
  // is one more. The ink and a dealt field may ground a band (the footer and one section, two and a half screens at most:
  // r11-p48's white pricing page, flooded by its scene and held, is 2.4) and the accent one (a section, a screen and a
  // half at most), as references/colour.md deals them, and count past it, by sections or by screens; any other
  // tone counts from a quarter of a screen, or from any band across the width. A ground a dealt hero, section, scene or
  // technique asks for (a veil or a window in the accent, the ground and the ink swapped, a scene's ground sampled from
  // its photograph: r11-p49's sky-blue chapter, built as shaped-edge-ground-change asks) is named so and fails nothing
  // alone. Three warn, four fail (this replaces round 11b's count of grounds and panels, the ink, the accent and the
  // fields aside, under the same id)
  const ROLES = { page: 'the page', surface: 'the surface', ink: 'the ink', accent: 'the accent', field: 'a dealt field' };
  const band = (g) => (g.role === 'accent' ? g.screens <= 1.5 && g.sections <= 1 : g.screens <= 2.5 && g.sections <= 2);
  // (a second group near one role's tone, a grey band beside the dealt surface, is a tone of its own)
  const firsts = new Set(), first = (g) => !!g.role && !firsts.has(g.role) && !!firsts.add(g.role);
  const gs = (b.grounds || []).filter((g) => (!first(g) ? g.screens >= 0.25 || (g.sections > 0 && g.screens >= 0.05) : ['ink', 'field', 'accent'].includes(g.role) ? !band(g) : g.screens >= 0.25));
  const step = gs.find((g) => g.role === 'page' && g.step && g.step[1] >= 0.25)?.step, tint = step && gs.some((g) => g.role === 'surface');
  const count = gs.length + (step ? 1 : 0), asked = gs.filter((g) => g.asked).length;
  const sc = (n) => `${n} screen${n === 1 ? '' : 's'}`;
  // (a second ground of one role is named by its element)
  const told = new Set(); const label = (g) => { if (!ROLES[g.role] || told.has(g.role)) return g.where; told.add(g.role); return ROLES[g.role]; };
  if (desktop && count >= 3) add(count - asked >= 4 ? 'FAIL' : 'WARN', 'surface-count', `${count} grounds on the page, by the screens they cover: ${list(gs, (g) => `${g.hex} (${label(g)}, ${sc(g.screens)}${g.role === 'page' && step ? `, with ${tint ? 'a tint a step from it' : 'its surface'} ${step[0]} on ${sc(step[1])}` : g.n > 1 && g.role !== 'page' ? `, with ${g.n - 1} tone(s) a step from it` : ''}${['ink', 'field', 'accent'].includes(g.role) ? `, over ${g.sections} section${g.sections === 1 ? '' : 's'}` : ''}${g.asked ? `, as ${g.asked} asks` : ''})`, 7)}.`, 'One ground and one surface tone a step from it, and no tint between them. The ink grounds a band at most (the footer and one section), and so do a dealt field and the accent (one section each); a scene\'s veil or band takes one of these, never a tone sampled from its photograph, unless its own sheet asks for one (then that is the page\'s band). Every other section, panel and card takes one of these, a sheet in another colour (a white receipt on grey) is set on the section ground, and a piece of work keeps its own colours inside its picture.');
  // the footer section 0 dealt, against the one built: one row of words, or under 160px on desktop, is the one-line footer
  const ft = b.foot;
  if (desktop && ft && ft.dealt && (!ft.found || ft.rows <= 1 || ft.h < 160)) add('FAIL', 'footer-not-as-dealt', `Section 0 dealt the "${ft.dealt.id}" footer (${String(ft.dealt.text || '').split(/[:.,;]/)[0].slice(0, 60)}), but the page ${ft.found ? `ends on ${ft.sel}, ${ft.rows === 1 ? 'one row of words' : `${ft.rows} rows of words`} ${ft.h}px tall ("${ft.text}")` : 'has no footer'}.`, 'Build the footer as section 0 describes it: a designed section about 40% of a screen tall at 1440, its links at body size, the © line and Image credits under it. A closing scene ends on that footer, never on a one-line foot.');
  // a portfolio's work in pictures (r11-p51: five pieces set as type in coloured frames, no frame of the work itself);
  // a slot marked for the client's picture (data-slot="work", as the sheet asks) counts as a piece
  // Round 11d (r12-p57: four work slots held other people's photographs of drawing at a pen display, credited to them):
  // a photograph among the work, marked for it or not, credited to another (a record of its fetch, a licence or a source,
  // an author who is not the client) is a stand-in and never the work: it fails, and it is no picture of the work in the
  // count (a title frame the builder lists in the credits as made for the page is no one else's)
  const shown = b.pictures?.shown || [];
  const stand = shown.filter((p) => p.slot === 'work' && p.third);
  const wk = b.work && { ...b.work, pictures: b.work.pictures - (b.work.files || []).filter((f) => stand.some((p) => (p.files || [p.file]).includes(f))).length };
  const pieces = (w) => `${w.pictures ? `${w.pictures} picture(s)` : 'no picture'} of the work${w.slots ? ` and ${w.slots} slot(s) marked for the client's own` : ''}`;
  if (desktop && stand.length) add('FAIL', 'portfolio-without-work', `${stand.length} picture(s) shown as the work are photographs credited to other people: ${list(stand, (p) => `${p.file} (${p.record ? `"${p.record.title.slice(0, 50)}"${p.record.creator ? ` by ${p.record.creator.slice(0, 30)}` : ''}` : `"${p.entry.slice(0, 60)}"`})`, 4)}${wk ? `; the work shows ${wk.pictures ? `${wk.pictures} picture(s)` : 'no picture'} of the client's own` : ''}.`, 'A slot marked for the work holds the work: the client\'s own still, or until it arrives the project\'s own still made for the page (a title frame set in the page\'s type, or a frame of the page\'s own motion of it) with its title and facts as the caption. Never a photograph of someone else making or showing work, however close the trade; the report lists every slot for the client\'s own pictures.');
  else if (desktop && wk && wk.pictures + (wk.slots || 0) < 3) add('WARN', 'portfolio-without-work', wk.sections.length || wk.slots ? `The work${wk.sections.length ? ` (${wk.sections.slice(0, 2).map((s) => `"${s}"`).join(', ')})` : ''} shows ${pieces(wk)}${wk.typeset ? `; ${wk.typeset} piece(s) are set in type` : ''}.` : 'This is a portfolio, and no section is named for the work (work, projects, selected, case studies) and no slot is marked for it.', 'A portfolio shows the work as pictures of the work: frames, stills or films of three pieces or more, the strongest large. Where the client\'s own pictures are missing, each piece gets a frame at its ratio with `data-slot="work"`, holding a still of the piece or the project\'s own still made for the page (a title frame set in the page\'s type, a frame of its own motion), listed in the report; never an empty frame, a note that a picture is missing, or small type cards of a name and a line standing in for the pieces.');

  // ---------- round 11c (Leon: three button shapes at one size, a plain bar that hides on scroll; r12-p53's three
  // unrelated buttons, r12-p54's six sections of a heading, a line and a list panel, r12-p52's page of slate boxes) ----------
  // one button family: the dealt button and at most one quieter sibling, so a third shape fails (a shape is its corner
  // and its kind; the sheet sizes the one button to the bar, a card and a form, so a height is no shape of its own)
  const bs = b.buttons || [];
  const px = (s) => (s.h ? `, ${s.h[0] === s.h[1] ? s.h[0] : `${s.h[0]}-${s.h[1]}`}px` : '');
  // (round 11e: a folder tab and a monogram drawn round count, the bar read again past the hero)
  if (desktop && bs.length > 2) add('FAIL', 'button-family', `${bs.length} button shapes on one page: ${list(bs, (s) => `${s.key === 'type' ? 'set in type' : s.key}${px(s)} (${s.labels.map((l) => `"${l}"`).join(', ')}${s.n > s.labels.length ? ` and ${s.n - s.labels.length} more` : ''}${s.past ? ', in the bar past the hero' : ''})`, 5)}.`, 'One button family, as section 0 dealt it: the dealt button for every action, in the bar, the hero, the cards, the form and the footer, at one corner (in the bar, on a card and in a form at that part\'s height), and at most one quieter sibling (the label alone with the dealt arrow, or the same shape in the surface tone). An outline, a pill or a block of its own is a second family, and so are folder tabs and a monogram in a circle: set tabs as words with the dealt underline or in the sibling\'s shape, and the monogram as type or in the tile the navigation deals.');
  // the navigation's form, as built (at load, past the hero and back up), against the one section 0 dealt (navKind); a
  // bar that hides on the way down warns whatever was dealt, and fails where the dealt one stays
  const nf = b.navs;
  if (desktop && nf && nf.load) {
    const ph = [nf.load, nf.down, nf.up].filter(Boolean), at = (f) => ph.some((s) => s.form === f);
    // (past the hero: the reading on the way down, else back up, else at load, so a navigation that hides keeps its form)
    const past = [nf.down, nf.up, nf.load].find((s) => s && s.form !== 'none');
    const built = at('bottom dock') ? 'bottom dock' : [nf.down, nf.up].some((s) => s?.form === 'side index') ? 'side index' : nf.load.form === 'masthead' ? 'masthead' : [nf.load, nf.down].some((s) => s?.form === 'centred wordmark') ? 'centred wordmark' : past ? (past.form === 'corners' ? 'corners' : 'top bar') : null;
    const hides = !!nf.down && nf.down.form === 'none' && !nf.down.held && nf.load.form !== 'none';
    const dealt = navKind(nf.dealt);
    // (corners and a top bar differ by the band behind the groups and the room between them, which a pattern's words do
    // not fix: a pattern read as a top bar for want of a named form may stand as corners, and one read as corners as a row
    // with no band behind it)
    const fits = !!dealt && (built === dealt.form || built === dealt.first || (dealt.pattern && ((!dealt.named && built === 'corners') || (dealt.form === 'corners' && built === 'top bar' && !past?.band))));
    const how = hides ? (nf.up && nf.up.form !== 'none' ? 'hides on the way down and comes back on a scroll up' : 'scrolls away with the hero and does not come back') : '';
    const seen = `"${(nf.load.items || []).slice(0, 5).join(' · ')}"`;
    if (built && dealt && (!fits || (hides && !dealt.hides))) add('FAIL', 'nav-not-as-dealt', `Section 0 dealt the "${nf.dealt.id}" navigation (${NAV_NAMES[dealt.form]}${dealt.hides ? '' : ' on every screen after the hero'}), but ${fits ? 'on the page it' : `the page builds ${NAV_NAMES[built]}${hides ? ' that' : ''}`}${hides ? ` ${how}` : ''} (${seen}).`, `Build the navigation as section 0 describes it: its form (${dealt.form}), its sizes, its fill, and where it stands on every screen after the hero. Never back to a plain bar of a wordmark, links and a button, and never a bar that hides on scroll.`);
    else if (hides) add('WARN', 'nav-not-as-dealt', `The navigation ${how} (${seen}).`, 'Keep the navigation on the screen: fixed on a solid band, a floating capsule or tabs in the corners, as section 0 dealt it. A bar that hides on the way down is the plain template bar.');
  }
  // the same structure three times on one page: what the section holds (its largest group), wherever its heading stands
  // (r12-p54's judge read its lists beside a heading and under one as six sections built alike): three warn, four fail.
  // The hero is not counted
  const st = (b.structures || []).filter((s) => !s.hero);
  if (desktop && st.length) {
    const by = new Map(); for (const s of st) by.set(s.lead, [...(by.get(s.lead) || []), s]);
    const [lead, same] = [...by].sort((x, y) => y[1].length - x[1].length)[0];
    const place = (s) => (s.lead === 'none' ? '' : ` (${s.pos === 'none' ? 'no heading' : PLACES[s.word] || 'under its heading'}${s.boxed ? ', in a box' : ''})`);
    if (same.length >= 3) add(same.length >= 4 ? 'FAIL' : 'WARN', 'same-structure', `${same.length} sections are built round ${HOLDS[lead] || lead}: ${list(same, (s) => `"${s.head}"${place(s)}`, 6)}.`, 'Give each section the structure its content asks for, and never one structure three times: a list as a list across the width, a split with a picture, cards in a row, a statement alone, a table, a gallery, a working tool. Change what the section holds, the heading\'s place and the columns from one to the next (critique.md, pass 9).');
  }
  // a page of boxes, the product's windows counted: four sections or more after the hero, all of them but one, stand in
  // a box (the sheet puts cards in two or three); not again where the running text in boxes has reported it (judgeExtra)
  const bx = st.filter((s) => s.boxed);
  if (desktop && bx.length >= 4 && bx.length >= st.length - 1 && !BOXED_TEXT(boxedText)) add('WARN', 'boxed-page', `${bx.length} of the ${st.length} sections after the hero hold their content in a box (a product window, a panel or cards on a fill): ${list(bx, (s) => `"${s.head}"`, 6)}.`, 'Cards and windows in two or three sections, where a visitor compares or handles things; the rest stands on the ground: a statement, a list set as type, a picture across the width. A page whose every section is a box reads as a dashboard of boxes.');

  // ---------- round 11d (r12-p55: another maker's bike with its name on the frame as the product, a named maker's
  // longtail as its step-through; r12-p58: two named hotels' rooms as its own; the round-11b checks passed both) ----------
  // a picture shown as the client's (a marked slot, their name in its caption, the work, a room, the house, their own
  // place, anything on a page that sells one product of its own) whose credit names a business (businessIn); a photograph
  // in the frame marked for the product that is not the client's (the sheet sets that frame with no photograph until
  // theirs arrives); on a page dealt no photograph of its product, a picture whose title names a product of its kind
  // (another maker's, however cropped); and a picture shown as theirs with no credit of its own while a credit no
  // picture matches names a business (r9-p43's rooms, cropped and renamed from two hotels' photographs)
  const kind = b.pictures?.kind ? new RegExp(b.pictures.kind, 'iu') : null;
  const loose = (b.pictures?.credits || []).map((c) => businessIn({ record: c.entry ? null : c, entry: c.entry || null })).find(Boolean);
  const biz = shown.filter((p) => !p.theirs).map((p) => {
    const name = businessIn(p), k = kind && kindIn(p, kind);
    return { p, why: name ? `its credit names ${name}` : p.slot === 'product' && (p.third || p.uncredited) ? `a photograph ${p.third ? 'credited to someone else' : 'with no credit'} in the frame for the product` : k ? `its title names a ${k.toLowerCase()}, a product of its kind` : loose && !p.record && !p.entry && ['product', 'room', 'caption', 'place'].includes(p.slot) ? `no credit of its own, while the page's credits name ${loose}` : null };
  }).filter((x) => x.why);
  if (desktop && biz.length) add('FAIL', 'credit-names-business', `${biz.length} picture(s) shown as the client's are another's: ${list(biz, (x) => `${x.p.file} (${SHOWN[x.p.slot] || `the "${x.p.slot}" slot`}: ${x.why})`, 4)}.`, 'A picture shown as the client\'s (their product, a room, the house, their own place, a piece of their work, or captioned with their name) never shows another business\'s product, room or work, whatever its credit says: no other maker\'s product however cropped or retouched, no named hotel\'s or café\'s room, no other artist\'s work, and a picture cropped from another keeps that picture\'s credit. Where the client gives none, the slot holds what the sheet describes for it (the product\'s name and facts in its frame with no photograph, details that belong to no one, the project\'s own still), and the pictures round it show the use, the place and the light with no product of its kind in them.');

  // ---------- round 11e (review-006: "Get started" twice on a screen, the same map three times on one screen, on four
  // pages of six; r13-p59's footer: three word processors and three style guides as two of its four columns) ----------
  // one place twice on one screen: a button and another action to the same address or under the same label, or two links
  // to one address under one label, in one block or two (in the bar only its buttons count, so its action and the hero's
  // button to one place fail). The top of the page and the walk's screens may read one finding twice: groups that share
  // two actions are one
  const dp = [];
  for (const d of b.places || []) {
    const ids = d.items.map((x) => x.id), hit = dp.filter((x) => ids.filter((i) => x.ids.has(i)).length >= 2);
    const g = hit[0] || dp[dp.push({ ids: new Set(), items: [], place: null, screen: d.screen }) - 1];
    for (const x of [d, ...hit.slice(1)]) { for (const i of x.items) if (!g.ids.has(i.id)) { g.ids.add(i.id); g.items.push(i); } g.place = g.place || x.place; g.screen = Math.min(g.screen, x.screen); }
    for (const x of hit.slice(1)) dp.splice(dp.indexOf(x), 1);
  }
  const ways = (d) => { const l = d.items.map((x) => x.label), u = [...new Set(l)]; return u.length === 1 ? `"${u[0]}" ${l.length === 2 ? 'twice' : `${l.length} times`}` : u.map((x) => `"${x}"`).join(' and '); };
  const blocks = (d) => { const w = [...new Set(d.items.map((x) => x.where))]; return w.length === 1 ? w[0] : `${w.slice(0, -1).join(', ')} and ${w[w.length - 1]}`; };
  if (desktop && dp.length) add('FAIL', 'duplicate-action', `One place reached twice on one screen${dp.length > 1 ? `, ${dp.length} times` : ''}: ${list(dp, (d) => `${blocks(d)}, ${ways(d)} (${d.place || 'under one label'}, screen ${d.screen})`, 4)}.`, 'One action once a screen, the bar\'s and the hero\'s included: never two ways to one place on one screen, in one block or two. Keep one and send the other somewhere else (the quieter sibling to the next section, a mail with its own subject), or bring the bar\'s action in only once the hero\'s own has scrolled away and let it step aside while the closing action is on the screen. Cards of one group each keep their own action.');
  // the footer's links to other companies' products and sites (a map, a social profile, a picture library and a credit
  // aside): one or two warn, a column of three or more fails
  const fl = b.footLinks || [];
  if (desktop && fl.length) add(fl.length >= 3 ? 'FAIL' : 'WARN', 'footer-other-sites', `The footer links to ${fl.length} other ${fl.length === 1 ? 'site' : 'sites'}, not the client's own: ${list(fl, (l) => `"${l.text}" (${l.host})`, 4)}.`, 'The footer links to the client\'s own: its sections and pages, the contact, the map, its own profiles, the legal pages and the Image credits. A product it works with or a reference it follows is named in a line of type where the page needs it, never a link column to another company\'s site.');
  return out;
}
// a credit that names a business (namesBusiness, lib/business.mjs): the record's title, its file and its author, or the
// entry's title and the files it links; else the record's notes or the entry's words saying the picture carries or names
// another maker, brand or hotel (a clause that says it does not is left out, and so is the note on a source's
// restrictions, which a photograph of people carries)
const SAYS = /\b(?:another|other|a named|named) (?:maker|brand|business|company|hotel|guesthouse|shop|roaster|roastery|artist|designer|studio)\b|\bmaker['’]?s? (?:name|mark|logo|lettering)\b|\bnames? (?:another|a|the|its) (?:maker|brand|business|company|hotel|shop)\b|\b(?:a|another) hotel['’]s\b/i;
// (an entry's title: its quoted words, else its words before the author or the licence; with the files it links)
const entryTitles = (e) => { if (!e) return []; const [text, ...files] = String(e).split(' · '); const q = text.match(/“([^”]{3,})”|"([^"]{3,})"|‘([^’]{3,})’/); return [q ? q[1] || q[2] || q[3] : text.split(/\s(?:by|photo(?:graph)?(?: by)?|©)\s|,\s*(?:cc\b|public domain|licen)/i)[0], ...files]; };
function businessIn(p) {
  const r = p.record || {};
  const author = String(p.entry || '').match(/\bby\s+([^,;.·]+)/)?.[1];
  for (const [t, c] of [[r.title, r.creator], [r.file], ...entryTitles(p.entry).map((t) => [t, author])]) { const m = t && namesBusiness(t, c); if (m) return `"${String(m).slice(0, 60)}"`; }
  const said = [r.notes, p.entry].filter(Boolean).flatMap((t) => String(t).replace(/Restrictions named on the source page[^.]*\./g, '').split(/[.;:()[\]]|,\s/)).map((t) => t.trim()).find((t) => t && SAYS.test(t) && !/\b(?:no|not|without|never|none|nor)\b/i.test(t));
  return said ? `"${said.slice(0, 60)}"` : null;
}
// the product word a picture's title, its file or the entry's title names (on a page dealt no photograph of its product)
function kindIn(p, re) {
  const r = p.record || {};
  for (const t of [r.title, r.file, ...entryTitles(p.entry), String(p.file || '').replace(/[-_]+/g, ' ')]) { const m = t && String(t).match(re); if (m) return m[0]; }
  return null;
}
const SHOWN = { product: 'the frame for the product', work: 'the work', room: 'a room', house: 'the house', place: 'the client\'s own place', caption: 'captioned with the client\'s name', 'product page': 'on the product\'s page' };
// the navigation section 0 dealt, as a form: the twelve tested designs by their id, a pattern by its text and its Must
// show line before the phone's, the form it takes once the hero has gone first (named: read from the words, not a top
// bar for want of any; first: the first screen's form beside it); and whether it hides on scroll, by the deal's own test
const NAV_KINDS = { 'hide-on-scroll': 'top bar', 'centred-logo': 'centred wordmark', 'floating-pill': 'top bar', 'menu-button': 'corners', shrinks: 'top bar', 'side-index': 'side index', 'bottom-dock': 'bottom dock', corners: 'corners', masthead: 'masthead', 'ink-band': 'top bar', 'contained-bar': 'top bar', 'big-links': 'corners', 'chapter-band': 'top bar' };
const NAV_FORMS = [
  ['side index', /\bside index\b|\bvertical list\b|\brail\b/i],
  ['bottom dock', /\bdock(?:ed)?\b|\bdial fixed at the bottom\b/i],
  ['masthead', /\bmasthead\b|\btwo rows\b/i],
  ['centred wordmark', /\b(?:wordmark|logo|monogram|emblem)\b[^.,;:]{0,40}\b(?:centred|dead centre)\b|\bcentred\b[^.,;:]{0,12}\b(?:wordmark|logo|monogram|emblem)\b|\bcentre: (?:a |the )?(?:\d+px )?(?:monogram|wordmark|logo|emblem)\b/i],
  ['corners', /\bno bar\b(?! fill)|\bfour corners\b|\beach (?:top )?corner\b|\bin (?:their|its) corners\b|\bcorners of the screen\b/i],
];
const HANDS_OVER = /\b(?:once|after|when|past) the hero\b|\bpast the first screen\b|\b(?:over|after) (?:the first )?\d+(?:px)?(?: to \d+px)? of scroll\b/i;
export function navKind(nav) {
  if (!nav?.id) return null;
  const parts = [nav.text, nav.signature].map((t) => String(t || '').split(/\bOn (?:a )?phones?\b|\b[Bb]elow \d+px\b/)[0]);
  const named = (t) => NAV_FORMS.find(([, re]) => re.test(t))?.[0] || null;
  const after = parts.map((t) => { const i = t.search(HANDS_OVER); return i >= 0 ? named(t.slice(i)) : null; }).find(Boolean) || null;
  const whole = parts.map(named).find(Boolean) || null;
  const pattern = !NAV_KINDS[nav.id], form = NAV_KINDS[nav.id] || after || whole;
  return { form: form || 'top bar', pattern, named: !!form, first: pattern && after && whole !== after ? whole : null, hides: nav.id === 'hide-on-scroll' || hidesOnScroll({ description: String(nav.text || ''), signature: nav.signature }) };
}
const NAV_NAMES = { 'top bar': 'a top bar', 'bottom dock': 'a bottom dock', 'side index': 'a side index', corners: 'a navigation in the corners', 'centred wordmark': 'a bar round a centred wordmark', masthead: 'a masthead' };
// what a section holds, and where it stands against its heading (structures())
const HOLDS = { list: 'a list', cards: 'cards', panel: 'one panel', window: 'a product window', picture: 'one picture', pictures: 'pictures', tool: 'a form', table: 'a table', text: 'text alone', none: 'a heading alone' };
const PLACES = { split: 'beside its heading', columns: 'in columns under its heading', grid: 'in a row under its heading', gallery: 'in a row under its heading' };
// the running text in boxes that judgeExtra reports (boxed-page)
const BOXED_TEXT = (x) => !!x && x.words > 150 && x.share > 0.6;
const FRAMED_FIX = 'Cards are welcome: a fill one step from the ground, a picture-led card, a card that overlaps an empty corner of a picture with less than half of itself. One level only: what sits in a card is set apart by space and type, never by a second box (a product window on a card, a dark slab in a pale card), and a photograph is a frame too, so no box lies on one; a note or a booking block stands on the ground beside the picture. A card is a plain rectangle with a radius, never cut into a ticket, a tab or a torn edge. Frame with a fill, not an outline. The first screen holds one product window at most; what the others showed is said in a line of type.';
const BENTO_FIX = 'Size each card to what it holds: a card with nothing in its middle reads as broken. Fewer, fuller cards (the picture large, the point in a line, the figure that matters), cards of different sizes for things of different weight, or the thin ones set as a list of type under the grid.';
const SMALL_FIX = 'Running text, lists and tables 16px or more on desktop and 15px on a phone, on dark grounds as well; under a display heading 18px or more; set it beside the picture it describes, never pushed to the far edge. Only captions and the footer\'s legal line may be smaller.';
const BROKEN = (x) => `${x.brokenAddress.length} email, URL or phone number(s) break over two lines: ${x.brokenAddress.slice(0, 3).map((b) => `"${b.text}"`).join('; ')}.`;
const BROKEN_FIX = 'white-space: nowrap on emails, URLs and phone numbers (a class on their link); where one is wider than its column, give it its own line or a smaller step, never a break at its hyphen or dot.';
