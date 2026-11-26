// assets/scenes/depth-card-flythrough/classic.js - the 2.4 scene file, kept as it was; scene.js loads it through classic/classic.js.
// tasteskill / scenes / depth-card-flythrough.js — a fly-through of captioned photo cards.
//
// The camera runs forward into a one-point-perspective picture (a jetty, a road, a rail line running to
// the horizon). The ground below the horizon streams toward the reader while the far scene closes in,
// and photo cards start as faint chips at the vanishing point, grow to reading size on alternating sides
// and fly out past the screen edges, the near ones as huge passing ghosts. One short statement at a time
// changes on the top-centre axis, paired with the card that is at reading size; the first statement
// opens larger, as the scene's title, and settles as the first card arrives. A change is out, then in:
// the old statement has gone before the new one starts, so two statements are never on screen at once,
// and each card's caption leaves and arrives with its own statement.
// Use it for 5-12 proof points, manifesto lines or a product world; skip it for dense copy or photos
// that cannot be made to look like one place. Load after stage.js.
//
// DOM:
//   <section class="scene fly" data-scene="depth-card-flythrough" data-options='{"inAir":3}' aria-label="…">
//     <div class="scene-stage fly__stage">
//       <div class="fly__backdrop">
//         <img class="fly__backdrop-img" src="…" alt="" width="2600" height="1625" fetchpriority="high">
//         (or, for a moving backdrop: <video class="fly__backdrop-video" src="…" poster="…" muted playsinline preload="auto"></video>)
//       </div>
//       <div class="fly__scrim" aria-hidden="true"></div>                       (optional, see --fly-scrim; over a still the
//                                                                          script draws it inside the picture while live)
//       <div class="fly__field">
//         <figure class="fly__card" style="--dy:2">                               (x N, 3-12; 7 reads best)
//           <img class="fly__img" src="…" alt="What the photo shows" width="1200" height="800">
//           <span class="fly__fog" aria-hidden="true"></span>
//           <figcaption class="fly__cap">One to four words</figcaption>
//         </figure>
//       </div>
//       <div class="fly__copy">
//         <ol class="fly__lines">
//           <li class="fly__line">Statement one, the scene title.</li>             (x N, statement k pairs with card k)
//         </ol>
//         <p class="fly__count" aria-hidden="true"><span class="fly__count-now">1</span> of <span class="fly__count-all">7</span></p>
//       </div>
//     </div>
//   </section>
// Cards fly on the left, right, left… (data-side="-1" or "1" on a card overrides). --dy is the card's
// drop below the vanishing point in vh, 0-8; leave it out and the pattern 2 0 4 1 5 0 3 repeats.
// Add class is-portrait to a card holding a 4:5 photo (two at most, never two in a row).
// Statements: 4-7 words, about 34 characters, so they hold two lines at the live size. Captions: 1-4
// words, 22 characters at most. In flight the script shows each caption as a flat tag of constant size
// (div.fly__tags, aria-hidden) riding its card's inner top corner. Statement k takes over as card k
// reaches reading size, or as card k-1 leaves if that is sooner, so a statement never outlives its
// picture; card k's tag comes in with statement k and leaves with it (or earlier, as the card grows
// past reading size or nears the screen edge), so a passing ghost is picture only, no label is ever
// louder than the statement, and the caption on screen always belongs to the statement on screen. The
// figcaption stays in the card for screen readers and the finished composition.
// The backdrop needs its vanishing point on the vertical centre line at --fly-vp (56% of the stage by
// default; set it to where the picture's own lines meet) and a calm, low-detail band above it for the
// statement. Its lines must end at something that stands at the vanishing point (a boathouse, a door, a
// gate, a lit window): a road or rail that runs off to nothing looks the same at any zoom about that
// point, so the first and last frames match and the camera seems not to move, however far it dollies.
// Tell the scene how wide its focal object is (--fly-focus-w, the half-width at dolly 1: a plain
// number is a share of the picture's width, a length is taken as it is) and where it stands (--fly-ground):
// on a wide stage the cards fly beside it on alternating sides, and a far card is held just outside it
// until it has grown clear, so no card crosses the boathouse, mast or doorway the picture is about. On a
// tall stage (a phone, a tablet held upright) the focal object fills the width, so the cards fly the low
// path instead: each comes out at its foot, grows to about 72vw whole and on screen just below
// --fly-ground, and leaves through the bottom as a big pass. A card comes in solid under a haze that lifts
// as it nears, and leaves solid: it fades only once less than 15% of it is left on screen, and if its own
// course would not take it off the screen it veers out over the last part of its flight. With a still picture the camera dollies toward the focal object, and the script lays a copy of
// the picture over the ground (everything below the vanishing point, or below --fly-ground when the focal
// object stands on the ground below it) and runs the camera over it: the ground streams toward the reader
// along the lines that meet at the vanishing point, while the far scene holds. That suits a jetty, road,
// runway, rail line or floor; set run 0 for a picture whose lower half is not ground.
// A <video> backdrop is scrubbed instead (currentTime = progress x duration): a 6-10 s muted forward
// move, encoded with a keyframe on every frame so it seeks cleanly
// (ffmpeg -i in.mp4 -an -vf scale=1920:-2 -c:v libx264 -g 1 -crf 24 -movflags +faststart out.mp4),
// and give it a poster for the finished composition.
// Bake one grade into every card photo (same white balance, muted colour); no CSS filters.
//
// Stop mode ({"stop": 0.5}, for the work): each card comes out of the vanishing point (0.2 screen), rests
// at the centre of the stage flat-on (turned 0°), 62% of the stage wide (never under 60%, at most 70% of
// its height), for `stop` screens, then grows past and leaves through its own side (0.2 screen, over the
// next card's approach), so two cards are in the air at most. Its title rides under the card's
// bottom-left corner at --step-lead from 0.1 screen before its stop to 0.1 after it: the title and the
// piece are always on screen together. The statement list shows only the scene's heading, before the
// first stop; the count is off. The hold is N × (stop + 0.2) + 0.3 (3.1 for four at 0.5, 4.5 for six),
// and no more than about a quarter of a screen of backdrop follows the last piece. The backdrop is shaded
// toward --fly-stage (--fly-stop-shade, 0.55), so the pieces carry the colour. Phones get the finished
// composition: the pieces stacked full width, each title under its picture. Use landscape pieces (3:2).
//
// Options (data-options), defaults first:
//   stop        screens each card rests flat at the centre; 0 = the flight. 0                (0.3-0.8)
//   inAir       cards in the air at once. 3                                                  (2-4)
//   phoneInAir  cards in the air at once on a phone: two, so the passing card and the next   (2-3)
//               one sit on opposite sides and never overlap. 2
//   hold        screens the stage is held for. Default 0.36 / slot: 3.3 for 7 cards, 1.8 for 3,
//               5.1 for 12 (slot = 1 / (cards + 0.88 inAir - 0.55)); a phone works it out from
//               phoneInAir (3.0 for 7 cards)                                                 (1.5-6)
//   sideX       how far out the cards fly, as a share of the stage width. 0.32                (0.28-0.38)
//   endScale    how large a card is when it leaves. 4 = the bold ghost pass at the edge,      (2.5-5)
//               2.5 = a calm drift. The phone keeps 2.5 at most.
//   yaw         inward turn in degrees: the cards stand as the walls of a corridor. 8;        (0-10)
//               0 = flat cards facing the camera. A turned card straightens as it passes, so
//               its outer edge never comes nearer than 0.8 x perspective; a ghost turned further
//               than 10 degrees would cover so much of the frame that it could not pass solid.
//   perspective camera lens in px; lower is wider and faster at the edges. 300                (240-600)
//   title       how much larger statement one stands at the start, as the scene's title. It  (1-1.6)
//               settles to statement size as the first card reaches reading size, and never
//               grows wider than the stage. 1.3; 1 = no change
//   dolly       backdrop scale as the camera moves in: how far it travels toward the focal     (1.6-2)
//               object. 1.8 for a still; never under 1.6: a road, rail or jetty looks the same
//               at any zoom about its own vanishing point, so a smaller move leaves the first
//               and last frames alike and the camera seems not to move. A video: 1.08 (1-1.3),
//               as the footage moves itself. A tall stage uses 70% of the move. Serve a still at
//               the dolly x the stage width (2600 px for 1440) so the end of the move stays sharp
//   run         how far the camera runs over the ground of a still backdrop: the share of     (0-0.7)
//               the way to the ground at the bottom edge. 0.45; 0 = the dolly alone
//   arrive      in the last 10% the camera eases off and lifts a little, a short arrival      (true)
//               beat before the stage lets go (it keeps 95% of the dolly). true
//   haze        fog left on a card at its nearest, to pull the photos into one grade. 0      (0-0.3)
//   count       show "3 of 7" under the statement. true
//   phone       'same' (the fly-through with phone numbers) | 'rest' (the finished composition). 'same'
//   phoneMax    more cards than this and a phone gets the finished composition. 9              (3-12)
//   phoneSideX  the farthest out the cards fly on the low path (a phone, a tablet held          (0.1-0.45)
//               upright). 0.33; within it each card flies just as far out as keeps it whole on
//               screen with its outer edge on the gutter at reading size
//   phoneDy     drop below the vanishing point on a phone, in vh. Left out, each card drops    (0-40)
//               so its top edge sits on --fly-ground at reading size and reaches the bottom of
//               the screen as its flight fades, so a passing card goes out solid
//   phoneYaw    inward turn on a phone. 3                                                     (0-10)
// The script adds a visually hidden copy of the statements (ol.fly__sr) so a screen reader hears all of
// them while only one is on screen; the visible list is aria-hidden only while the flight runs.
// Page tokens it takes: --ink (statement), --font-display, --display-weight (statements and caption tags,
// 500) and --text-weight (the count, 400): set them to weights the page loads, or the browser draws the
// nearest weight it has (fake bold is off). Set per backdrop on the section (plain
// `.fly { … }` wins; the scene's defaults sit in :where()):
//   --fly-stage (the backdrop's horizon colour; the ground of the finished wall), --fly-fog (haze
//   colour, defaults to --fly-stage), --fly-ink (statement colour on the photo; must reach 4.5:1 on the
//   band behind it), --fly-shade / --fly-scrim (a flat fill over the whole backdrop when white text needs
//   it), --fly-vp / --fly-focus / --fly-lift (where the vanishing point sits; see the CSS), --fly-ground and
//   --fly-focus-w (where the focal object stands and how wide it is), --fly-rest-vp / --fly-rest-ground (the
//   same two in the finished opening),
//   --fly-card-w, --fly-size (statement size), --fly-copy-top and --fly-copy-w (the statement box; see
//   the CSS for how wide it may go).
(() => {
  const ID = 'depth-card-flythrough';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v, d, a, b) => (v === undefined || v === null || v === '' || Number.isNaN(+v) ? d : clamp(+v, a, b));
  const DY = [2, 0, 4, 1, 5, 0, 3];
  const DEG = 180 / Math.PI;
  const BACK = 0.05;         // the arrival gives back this share of the dolly
  // a statement change, in seconds: the old line (and its card's caption) leaves in OUT_S, and only then
  // does the new one come in, over IN_S, so two statements never share the screen. Each moves only SLIDE
  // (% of its own height) as it fades, so it never slides over the count under it.
  const OUT_S = 0.2, IN_S = 0.45, SLIDE = 8;
  // stop mode, in screens: a card's approach and its exit; the backdrop before the first card
  const STEP = 0.2, LEAD = 0.15;
  const r3 = (v) => Math.round(v * 1000) / 1000;
  if (window.ScrollTrigger) ScrollTrigger.config({ ignoreMobileResize: true });

  window.Scenes = window.Scenes || {};
  window.Scenes[ID] = (root, opts = {}) => {
    if (!window.Stage) return null;
    const cards = [...root.querySelectorAll('.fly__card')];
    const lines = [...root.querySelectorAll('.fly__line')];
    const N = cards.length;
    const backdrop = root.querySelector('.fly__backdrop');
    const still = backdrop && backdrop.querySelector('.fly__backdrop-img');
    const video = backdrop && backdrop.querySelector('video');
    const field = root.querySelector('.fly__field');
    const copy = root.querySelector('.fly__copy');
    const countNow = root.querySelector('.fly__count-now');
    const countAll = root.querySelector('.fly__count-all');
    if (countAll) countAll.textContent = String(Math.max(N, lines.length));
    // stop mode: each card rests flat and large with its title under it (see the header)
    const stop = opts.stop ? num(opts.stop, 0.5, 0.3, 0.8) : 0;
    if (stop) root.classList.add('fly--stop');
    if (opts.count === false || (stop && opts.count !== true)) root.classList.add('fly--no-count');
    // While the flight runs only one statement is visible; a visually hidden copy of the list keeps all
    // of them, in order, for screen readers (the CSS shows it only under .is-live).
    const list = root.querySelector('.fly__lines');
    if (list && !root.querySelector('.fly__sr')) {
      const sr = document.createElement('ol');
      sr.className = 'fly__sr';
      for (const l of lines) { const li = document.createElement('li'); li.textContent = l.textContent; sr.appendChild(li); }
      list.after(sr);
    }

    // Captions in flight: a constant-size tag per card on a flat layer above the field, riding the
    // card's inner top corner. Text inside a scaling card is either too small to read or louder than
    // the statement; a tag is always 15-20px, sits on its card and never passes the screen edge. The
    // figcaption stays in the card (transparent while the flight runs) for screen readers and the
    // finished composition.
    let tagLayer = root.querySelector('.fly__tags');
    if (!tagLayer && field) {
      tagLayer = document.createElement('div');
      tagLayer.className = 'fly__tags';
      tagLayer.setAttribute('aria-hidden', 'true');
      for (const card of cards) {
        const cap = card.querySelector('.fly__cap');
        const tag = document.createElement('span');
        tag.className = 'fly__tag';
        tag.textContent = cap ? cap.textContent.trim() : '';
        tagLayer.appendChild(tag);
      }
      field.after(tagLayer);
    }
    const tags = tagLayer ? [...tagLayer.children] : [];
    // one caption gate per card (0-1), opened and closed with the card's statement
    const gates = cards.map(() => ({ v: 0 }));

    // the clock: slot S between card starts, flight F = c slots, so c cards are in the air at once.
    // A phone runs its own clock (fewer cards in the air), so it gets its own hold.
    const clockOf = (phone) => {
      const c = phone ? num(opts.phoneInAir, 2, 2, 3) : num(opts.inAir, 3, 2, 4);
      const S = 1 / (N + 0.88 * c - 0.55);
      // stop mode: an approach, a rest and an exit a card, the exit over the next card's approach
      if (stop) return { c: 2, S, F: 2 * S, hold: num(opts.hold, clamp(N * (stop + STEP) + 0.3, 1.5, 6), 1.5, 6) };
      return { c, S, F: c * S, hold: num(opts.hold, clamp(0.36 / S, 1.5, 6), 1.5, 6) };
    };
    const desk = clockOf(false), mob = clockOf(true);
    const runOpt = video || !still ? 0 : num(opts.run, 0.45, 0, 0.7);

    // The ground the camera runs over: a copy of the still backdrop, clipped to below the vanishing
    // point. A forward move maps the ground's picture by (x, y) / (1 - k·y) about the vanishing point
    // (one matrix3d), so the planks stream outward along their own lines while the horizon holds.
    // The scrim over a still is drawn into the picture's own layers (a span in the backdrop, painted under
    // the ground, and one in the ground), so while the flight runs no separate full-screen translucent
    // layer is blended over the stage on every frame; the page's .fly__scrim stays for the finished
    // composition. A video keeps the page's scrim.
    const shade = () => { const s = document.createElement('span'); s.className = 'fly__shade'; s.setAttribute('aria-hidden', 'true'); return s; };
    if (still && !video && !backdrop.querySelector(':scope > .fly__shade')) still.after(shade());
    if (still && !video) root.classList.add('fly--shaded');
    let ground = null;
    if (runOpt > 0) {
      ground = backdrop.querySelector('.fly__ground');
      if (!ground) {
        ground = document.createElement('div');
        ground.className = 'fly__ground';
        ground.setAttribute('aria-hidden', 'true');
        const pic = still.cloneNode(false);
        pic.className = 'fly__ground-img';
        pic.alt = '';
        pic.removeAttribute('fetchpriority');
        pic.removeAttribute('id');
        ground.append(pic, shade());
        backdrop.append(ground);
      }
    }

    // a video backdrop is scrubbed: one seek at a time, the latest wanted time queued behind it
    const vid = { want: -1, busy: false, at: 0 };
    const seek = (p) => {
      if (!video || !(video.duration > 0)) return;
      const t = clamp(p, 0, 1) * Math.max(0, video.duration - 0.05);
      if (vid.busy && performance.now() - vid.at < 500) { vid.want = t; return; }   // a lost 'seeked' frees it after 0.5 s
      if (Math.abs(video.currentTime - t) < 0.015) return;
      vid.busy = true; vid.want = -1; vid.at = performance.now();
      try { video.currentTime = t; } catch { vid.busy = false; }
    };
    let live = { p: 0 };                      // the running build's clock
    if (video) {
      video.muted = true; video.playsInline = true;
      video.addEventListener('seeked', () => {
        vid.busy = false;
        if (vid.want >= 0) { const t = vid.want; vid.want = -1; if (Math.abs(video.currentTime - t) >= 0.015) { vid.busy = true; vid.at = performance.now(); video.currentTime = t; } }
      });
      video.addEventListener('loadedmetadata', () => { if (root.classList.contains('is-live')) seek(live.p); });
    }

    // everything the script writes, cleared when the scene falls back to its finished composition
    const clean = () => {
      if (window.gsap) { gsap.killTweensOf(lines); gsap.killTweensOf(gates); }
      for (const g of gates) g.v = 0;
      for (const card of cards) {
        card.style.removeProperty('transform'); card.style.removeProperty('opacity'); card.style.removeProperty('visibility');
        card.style.removeProperty('will-change'); card.style.removeProperty('z-index');
        for (const el of card.querySelectorAll('.fly__fog, .fly__cap')) el.style.removeProperty('opacity');
      }
      for (const l of lines) for (const p of ['opacity', 'visibility', 'transform', 'translate', 'will-change']) l.style.removeProperty(p);
      for (const t of tags) { t.style.removeProperty('transform'); t.style.removeProperty('opacity'); }
      if (copy) { copy.style.removeProperty('transform'); copy.style.removeProperty('will-change'); }
      if (ground) ground.style.removeProperty('transform');
      if (list) list.removeAttribute('aria-hidden');
      if (field) field.style.removeProperty('perspective');
    };
    // Stage only calls rest() when one of its media conditions matches, so a desktop that switches to
    // reduced motion never gets it: watch for .is-live going away and clear the flight's inline styles.
    new MutationObserver(() => { if (!root.classList.contains('is-live')) clean(); })
      .observe(root, { attributes: true, attributeFilter: ['class'] });

    const build = (tl, ctx) => {
      const phone = ctx.phone;
      const stage = ctx.stage;
      const { S, F } = phone ? mob : desk;
      const P = num(opts.perspective, 300, 240, 600);
      const sEnd = Math.min(phone ? 2.5 : 5, num(opts.endScale, 4, 2.5, 5));
      const zStart = -2 * P;                    // scale 1/3: a faint chip at the vanishing point
      const zEnd = P * (1 - 1 / sEnd);          // 0.8P at most: a card's centre never reaches the camera
      const zSafe = 0.8 * P;                    // nor does any point of it, the turned outer edge included
      const sideX = phone ? num(opts.phoneSideX, 0.33, 0.1, 0.45) : num(opts.sideX, 0.32, 0.28, 0.38);
      // at most 10 degrees: a ghost turned further covers so much of the frame that it would have to pass
      // half-transparent, and a see-through card over another reads as a double exposure
      const yaw = phone ? num(opts.phoneYaw, 3, 0, 10) : num(opts.yaw, 8, 0, 10);
      const sinYaw = Math.sin(yaw / DEG);
      const haze = num(opts.haze, 0, 0, 0.3);
      // a still needs a move the eye sees between the first frame and the last: 1.6 at least
      const D = video ? num(opts.dolly, 1.08, 1, 1.3) : num(opts.dolly, 1.8, 1.6, 2);
      // a tall stage (a phone, a tablet held upright) shows the focal object large already: 70% of the
      // move, so it does not grow up into the statement
      const tall = phone || stage.clientHeight > 1.15 * stage.clientWidth;
      const dolly = tall ? 1 + (D - 1) * 0.7 : D;
      const run = runOpt * (phone ? 0.85 : 1);
      const arrive = opts.arrive !== false;
      const titleOpt = num(opts.title, 1.3, 1, 1.6);
      const settle = gsap.parseEase('power2.inOut');
      // the backdrop's scale at progress p (the dolly below, worked out here so the cards can keep clear
      // of the focal object as it grows)
      const backAt = (p) => (!arrive ? 1 + (dolly - 1) * p : p < 0.9 ? 1 + ((dolly - 1) * p) / 0.9 : dolly - (dolly - 1) * BACK * settle((p - 0.9) / 0.1));
      // within one flight t (0-1): a far card comes in solid, under a haze that lifts as it nears (fog, not
      // transparency: a half-transparent card reads as a double exposure); the caption tag shows with the
      // card's statement, from the moment the card reaches reading size (S_READ, in card scale), and leaves
      // with it, or as the card grows past reading size (CAP_OUT), so a ghost passes as picture only. The
      // card stays solid while it sweeps past the edge and fades only as its last strip leaves the screen.
      const IN = 0.02, FOG = 0.45, FOG0 = 0.82, CAP_LEN = phone ? 0.06 : 0.1, OUT = 0.96;
      const S_READ = phone ? 0.56 : 0.57;
      const CAP_OUT = phone ? [1.3, 1.55] : [1.15, 1.35];
      const S_LOW = 0.92;                        // the low path lays a card out whole at this scale
      const tAt = (s) => (P * (1 - 1 / s) - zStart) / (zEnd - zStart);   // flight time at which a card reaches scale s
      // a turned card's outer edge is nearer than its centre: straighten it as it passes, so no point of
      // the card comes closer than 0.8P (behind the camera a card flips or vanishes)
      const turnAt = (z, half) => (yaw && half && zSafe - z < half * sinYaw ? Math.asin(clamp((zSafe - z) / half, 0, 1)) * DEG : yaw);
      // statement k comes in as card k reaches reading size, or as card k-1 leaves if that is sooner, so
      // a statement never outlives its picture; it holds until statement k+1 takes over the same way
      const CAP = clamp(tAt(S_READ), 0.3, 0.7);
      const swOff = Math.min(OUT * F - S, CAP * F);
      let title = 1, titleEnd = 0.12;

      clean();
      if (field) field.style.perspective = P + 'px';
      if (list) list.setAttribute('aria-hidden', 'true');   // the visually hidden copy speaks for it

      const geo = cards.map((card, i) => {
        const ds = parseFloat(card.dataset.side);
        const side = ds === 1 || ds === -1 ? ds : (i % 2 ? 1 : -1);
        card.dataset.side = String(side);
        const raw = parseFloat(getComputedStyle(card).getPropertyValue('--dy'));
        // a phone's cards fly low and leave through the bottom edge (measure() works out the drop unless
        // phoneDy sets it), so a passing card never hangs half-transparent over the picture
        const dy = phone && opts.phoneDy !== undefined ? num(opts.phoneDy, 20, 0, 40) : clamp(Number.isFinite(raw) ? raw : DY[i % DY.length], 0, 8);
        card.style.zIndex = String(N - i);       // the earlier card is always the nearer one
        const tag = tags[i] && tags[i].textContent ? tags[i] : null;
        // paired: the card has a statement of its own, and its tag shows only while that statement does
        return { card, fog: card.querySelector('.fly__fog'), tag, gate: gates[i], paired: i < lines.length, side, dy, a: S * i - 0.12 * F, half: 0, halfH: 0, ox: 0, x1: 0, y0: 0, y1: 0, tL: 1, tagW: 0, tagH: 0, vis: null, o: -1, f: -1, k: -1, kg: 0 };
      });
      // a tag's opacity: where its card is (on screen, at reading size) times its statement's gate
      const paint = (g) => {
        if (!g.tag) return;
        const k = r3(g.kg * (g.paired ? g.gate.v : 1));
        if (k !== g.k) { g.tag.style.opacity = String(k); g.k = k; }
      };

      // Two paths. On a wide stage the cards fly beside the focal object (the boathouse, the mast) on
      // alternating sides, and a far card is held just outside it (--fly-focus-w) until it has grown clear,
      // so no card ever crosses the thing the picture is about. On a tall stage (a phone, a tablet held
      // upright) the focal object fills the width, so the cards fly low instead: each comes out at its foot,
      // grows to nearly the stage width just below the ground line (--fly-ground), whole and on screen, and
      // leaves through the bottom as a big pass.
      let W = 0, H = 0, VP = 0, GH = 1, GY = 0, FW = 0, low = false, gk = -1, ts = -1;
      const measure = () => {
        W = stage.clientWidth || window.innerWidth; H = stage.clientHeight || window.innerHeight;
        VP = field ? parseFloat(getComputedStyle(field).perspectiveOrigin.split(' ')[1]) : NaN;
        if (!Number.isFinite(VP)) VP = H * 0.56;
        low = phone || H > 1.15 * W;
        // --fly-focus-w: the focal object's half-width at dolly 1, as a length, or as a plain number for a
        // share of the picture's width (it then follows the picture's crop at any screen size).
        // --fly-ground: where the focal object stands, from the top of the stage.
        const cs = getComputedStyle(root);
        const fwRaw = cs.getPropertyValue('--fly-focus-w').trim();
        const probe = document.createElement('div');
        probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;height:var(--fly-ground,0px);width:' + (fwRaw && !/^[\d.]+$/.test(fwRaw) ? fwRaw : '0px');
        stage.appendChild(probe);
        const lift = backdrop ? Math.max(0, backdrop.offsetHeight - H) : 0;
        GY = probe.offsetHeight || VP;
        FW = probe.offsetWidth;
        probe.remove();
        if (/^[\d.]+$/.test(fwRaw) && backdrop) {
          const media = still || video;
          const nw = (media && (media.naturalWidth || media.videoWidth)) || +(media && media.getAttribute('width')) || 16;
          const nh = (media && (media.naturalHeight || media.videoHeight)) || +(media && media.getAttribute('height')) || 10;
          FW = clamp(+fwRaw, 0, 0.4) * nw * Math.max(backdrop.offsetWidth / nw, (H + lift) / nh);
        }
        // the streaming ground runs from its own line (--fly-ground, the vanishing point unless the focal
        // object stands below it) to the bottom edge
        if (ground) {
          const o = parseFloat(getComputedStyle(ground).transformOrigin.split(' ')[1]);
          GH = Math.max(1, (ground.offsetHeight || H) - (Number.isFinite(o) ? o : VP));
        }
        // Every card is off the screen by the time its flight fades (OUT), so no card ever fades in view
        // over another: if its own course would not take it out, it veers out over the last part of the
        // flight, through the side on the wide path and through the bottom on the low path.
        const gutter = W < 768 ? 14 : 0.03 * W, zOut = zStart + (zEnd - zStart) * OUT, sOut = P / (P - zOut);
        for (const g of geo) {
          g.half = g.card.offsetWidth / 2; g.halfH = g.card.offsetHeight / 2;
          if (!low) {
            g.ox = sideX * W; g.y0 = g.y1 = (g.dy * H) / 100;
            // the inner edge as projected at OUT, turn included (a turned card's inner edge stands back)
            const yo = turnAt(zOut, g.half) / DEG, spIn = P / (P - (zOut - g.half * Math.sin(yo)));
            g.x1 = Math.max(g.ox, (W / 2 + 4) / spIn + g.half * Math.cos(yo));
            g.tL = clamp(tAt(1), 0, OUT - 0.05);
          } else {
            // the low path: whole and on screen at S_LOW, its outer edge on the gutter and its top edge on
            // the ground line (which the dolly lowers as it grows); after that it drops a little faster, so
            // its top edge reaches the bottom of the screen as the flight fades
            g.ox = g.x1 = clamp((W / 2 - gutter) / S_LOW - g.half, 0, sideX * W);
            g.tL = clamp(tAt(S_LOW), 0, OUT - 0.05);
            const BL = backAt(clamp(g.a + g.tL * F, 0, 1));
            g.y0 = phone && opts.phoneDy !== undefined ? (g.dy * H) / 100 : g.halfH + (Math.max(0, (GY - VP) * BL) + 0.01 * H) / S_LOW;
            g.y1 = Math.max(g.y0, g.halfH + (H - VP + 4) / sOut);
          }
          if (g.tag) { g.tagW = g.tag.offsetWidth; g.tagH = g.tag.offsetHeight; }
        }
        // the title: statement one larger at the start, never wider than the stage less its gutters
        title = 1;
        if (titleOpt > 1 && lines[0]) {
          if (copy) copy.style.transform = '';    // measured at statement size; render() puts the scale back
          const rg = document.createRange(); rg.selectNodeContents(lines[0]);
          const tw = rg.getBoundingClientRect().width;
          title = tw > 0 ? clamp((W - 48) / tw, 1, titleOpt) : 1;
        }
        titleEnd = Math.max(0.04, geo[0] ? geo[0].a + CAP * F : 0.12);
        gk = -1; ts = -1;
      };
      // the camera's run over the ground: linear (constant speed) to 0.9, then it eases back a little
      // as the camera settles and lifts for the arrival
      const runAt = (p) => (!arrive ? run * p : p < 0.9 ? (run * p) / 0.9 : run * (1 - 0.2 * settle((p - 0.9) / 0.1)));

      const render = (p) => {
        const fwB = FW * backAt(p), soft = 0.02 * W;
        for (const g of geo) {
          const t = (p - g.a) / F;
          if (t <= 0 || t >= 1) {
            if (g.vis !== false) { g.card.style.visibility = 'hidden'; g.card.style.opacity = '0'; g.card.style.willChange = 'auto'; g.vis = false; g.o = -1; }
            g.kg = 0; paint(g);
            continue;
          }
          if (g.vis !== true) { g.card.style.visibility = 'visible'; g.card.style.willChange = 'transform, opacity'; g.vis = true; }
          const z = zStart + (zEnd - zStart) * t; // linear z = constant camera speed; perspective does the rest
          const s = P / (P - z);
          const e = t > g.tL ? Math.min(1, (t - g.tL) / (OUT - g.tL)) ** 2 : 0;
          let x = g.side * (g.ox + (g.x1 - g.ox) * e);
          const y = g.y0 + (g.y1 - g.y0) * e;
          const yw = turnAt(z, g.half);
          // the card's inner edge on screen, projected as the card is (turn included)
          const a = (-g.side * yw) / DEG, cx = -g.side * g.half;
          let X = x + cx * Math.cos(a);
          const Z = z - cx * Math.sin(a), sp = P / (P - Z);
          // beside the focal object: hold the inner edge outside it (its half-width grows with the dolly)
          // until the card has grown clear of it; a soft max, so the card eases off its edge with no kink
          if (!low && FW > 0) {
            const d = fwB - g.side * X * sp;
            const push = (d + Math.sqrt(d * d + soft * soft)) / 2 / sp;
            x += g.side * push; X += g.side * push;
          }
          const sx = W / 2 + X * sp;
          g.card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(2)}px)` + (yw ? ` rotateY(${(-g.side * yw).toFixed(2)}deg)` : '');
          // on its way out the card stays solid while it sweeps past the side (or, on the low path, the
          // bottom) and fades only over its last sliver on screen (15% of it, 3% of the screen at most), so
          // a near card never hangs at the edge as a see-through slab; the time fade at the very end of the
          // flight is the backstop
          const top = VP + (y - g.halfH) * s;
          const fadeW = Math.min(0.3 * g.half * s, 0.03 * W), fadeH = Math.min(0.3 * g.halfH * s, 0.03 * H);
          const edge = s > 1 ? Math.min(clamp((g.side < 0 ? sx : W - sx) / fadeW, 0, 1), clamp((H - top) / fadeH, 0, 1)) : 1;
          const u = (t > OUT ? 1 - (t - OUT) / (1 - OUT) : 1) * edge;
          const o = r3(Math.min(1, t / IN) * u);
          if (o !== g.o) { g.card.style.opacity = String(o); g.o = o; }
          const f = r3(haze + (FOG0 - haze) * Math.max(0, 1 - t / FOG));
          if (g.fog && f !== g.f) { g.fog.style.opacity = String(f); g.f = f; }
          // the caption tag: on with its statement (the gate, a short tween in time), off with it or as the
          // card grows past reading size. A card with no statement of its own shows its tag from reading
          // size. It sits on the card's inner top corner, projected as the card is (turn included), and runs
          // outward along the top edge; over its last 20px before the screen edge it fades rather than be
          // read as a cut word.
          if (g.tag) {
            // in by reading size (a paired tag waits for its statement too), out past it
            let k = clamp((t - CAP) / CAP_LEN + (g.paired ? 1 : 0), 0, 1) * clamp((CAP_OUT[1] - s) / (CAP_OUT[1] - CAP_OUT[0]), 0, 1);
            let tx = 0, ty = 0;
            if (k > 0) {
              const sy = VP + (y - g.halfH) * sp;
              tx = g.side < 0 ? sx - g.tagW : sx; ty = sy - g.tagH;
              // near the screen edge a long tag slides up to 16px in along the card's top edge, then fades
              const room = g.side < 0 ? tx - 8 : W - 8 - tx - g.tagW;
              if (room < 0) tx += g.side * Math.max(room, -16);
              k *= clamp((room + 36) / 20, 0, 1);
            }
            g.kg = k;
            if (k > 0) g.tag.style.transform = `translate3d(${Math.round(tx)}px, ${Math.round(ty)}px, 0)`;   // whole pixels keep the type sharp
            paint(g);
          }
        }
        if (copy) {
          const v = title > 1 ? r3(1 + (title - 1) * (1 - clamp(p / titleEnd, 0, 1))) : 1;
          // its own layer only while the title settles (no repaint per frame), then drawn sharp again
          if (v !== ts) { copy.style.transform = v === 1 ? '' : `scale(${v})`; copy.style.willChange = v === 1 ? '' : 'transform'; ts = v; }
        }
        if (ground) {
          const k = Math.round((runAt(p) / GH) * 1e8) / 1e8;
          if (k !== gk) { ground.style.transform = `matrix3d(1,0,0,0,0,1,0,${-k},0,0,1,0,0,0,0,1)`; gk = k; }
        }
        if (video) seek(p);
      };

      // statements: a state change, never a scrubbed crossfade. Statement k takes over at a_k + swOff:
      // as card k's caption is fully on, or as card k-1 leaves if that comes first.
      let cur = -1, lastP = 0, countCall = null;
      const last = Math.max(0, lines.length - 1);
      const lineAt = (p) => clamp(Math.floor((p + 0.12 * F - swOff) / S + 1e-6), 0, last);
      const setCount = (k) => { if (countNow) countNow.textContent = String(k + 1); };
      // each card's caption gate follows its statement: open while statement i is the one on screen
      const gateTo = (k, animate) => geo.forEach((g, i) => {
        const v = i === k ? 1 : 0;
        if (!animate) { gsap.killTweensOf(g.gate); g.gate.v = v; paint(g); return; }
        if (g.gate.v === v && !gsap.isTweening(g.gate)) return;
        gsap.to(g.gate, v
          ? { v, duration: IN_S, ease: 'power2.out', delay: OUT_S, overwrite: true, onUpdate: () => paint(g) }
          : { v, duration: OUT_S, ease: 'power2.in', overwrite: true, onUpdate: () => paint(g) });
      });
      const force = (k) => {          // set the line with no animation (a load, a refresh, a jump)
        if (!lines.length) return;
        cur = k;
        lines.forEach((l, i) => { gsap.killTweensOf(l); gsap.set(l, { autoAlpha: i === k ? 1 : 0, yPercent: 0 }); l.style.willChange = ''; });
        gateTo(k, false);
        if (countCall) countCall.kill();
        setCount(k);
      };
      // a line is its own layer only while it moves, so a swap is drawn once rather than every frame
      const lift = (l) => { l.style.willChange = 'transform, opacity'; return () => { l.style.willChange = ''; }; };
      // out, then in: the old line (and every other) is gone after OUT_S, and only then does the new one
      // start, so two statements never share the screen; the captions change with them
      const show = (k, dir) => {
        const prev = cur; cur = k;
        lines.forEach((l, i) => { if (i !== k && i !== prev && +gsap.getProperty(l, 'opacity') > 0) gsap.to(l, { autoAlpha: 0, duration: OUT_S, overwrite: true }); });
        gsap.to(lines[prev], { yPercent: -SLIDE * dir, autoAlpha: 0, duration: OUT_S, ease: 'power2.in', overwrite: true, onComplete: lift(lines[prev]) });
        gsap.fromTo(lines[k], { yPercent: SLIDE * dir, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: IN_S, ease: 'power3.out', delay: OUT_S, overwrite: true, onComplete: lift(lines[k]) });
        gateTo(k, true);
        if (countCall) countCall.kill();
        countCall = gsap.delayedCall(OUT_S, () => setCount(k));
      };
      const sync = (p) => {
        const k = lineAt(p);
        const jump = Math.abs(p - lastP) > 2 * S;
        const dir = p >= lastP ? 1 : -1;
        lastP = p;
        if (k === cur || !lines.length) return;
        if (jump || cur < 0) force(k); else show(k, dir);
      };

      // the camera: the backdrop dollies in toward the vanishing point, then pulls back and lifts
      if (backdrop) {
        if (arrive) {
          tl.fromTo(backdrop, { scale: 1, yPercent: 0 }, { scale: dolly, duration: 0.9, ease: 'none' }, 0);
          // the arrival: the camera eases back a little and lifts, a settle rather than a retreat
          tl.fromTo(backdrop, { scale: dolly, yPercent: 0 }, { scale: dolly - (dolly - 1) * BACK, yPercent: -2, duration: 0.1, ease: 'power2.inOut', immediateRender: false }, 0.9);
        } else {
          tl.fromTo(backdrop, { scale: 1, yPercent: 0 }, { scale: dolly, duration: 1, ease: 'none' }, 0);
        }
      }
      // one clock drives every card, the title and the ground from the scene's progress, so scrolling
      // back replays it exactly
      const clock = { p: 0 };
      live = clock;
      tl.fromTo(clock, { p: 0 }, { p: 1, duration: 1, ease: 'none', immediateRender: false, onUpdate: () => { render(clock.p); sync(clock.p); } }, 0);

      // Pictures decode before they move, and every card layer is drawn once, invisibly, at reading size
      // before its first flight, so no card meets the screen as a first-time decode and upload. It starts
      // when the section is within two screens, one card per frame.
      let warm = false;
      const prewarm = () => {
        let i = 0;
        const step = () => {
          if (!root.classList.contains('is-live') || live !== clock) return;
          if (i >= geo.length) return;
          const g = geo[i++];
          if (g.vis === true) { requestAnimationFrame(step); return; }   // already flying
          g.card.style.willChange = 'transform, opacity';
          g.card.style.transform = `translate(-50%, -50%) translate3d(${(g.side * g.ox).toFixed(1)}px, ${g.y0.toFixed(1)}px, 0px)`;
          g.card.style.opacity = '0.01'; g.card.style.visibility = 'visible'; g.vis = 'warm';
          requestAnimationFrame(() => requestAnimationFrame(() => {
            if (g.vis === 'warm') { g.card.style.visibility = 'hidden'; g.card.style.opacity = '0'; g.card.style.willChange = 'auto'; g.vis = false; g.o = -1; }
            step();
          }));
        };
        step();
      };
      const warmUp = () => {
        if (warm) return; warm = true;
        const imgs = [...root.querySelectorAll('img')];
        for (const img of imgs) img.loading = 'eager';
        const cardImgs = imgs.filter((img) => img.closest('.fly__card'));
        Promise.all(cardImgs.map((img) => (img.decode ? img.decode().catch(() => {}) : null))).then(() => requestAnimationFrame(prewarm));
        if (still && still.decode) still.decode().catch(() => {});
        if (video) {
          video.preload = 'auto';
          // iOS paints no frame of a video until it has played once
          const go = video.play && video.play();
          if (go && go.then) go.then(() => { video.pause(); seek(clock.p); }).catch(() => {});
        }
      };
      ScrollTrigger.create({
        trigger: root, start: 'top bottom+=200%', end: 'bottom top',
        onToggle: (self) => { if (self.isActive) warmUp(); },
        // a resize or a rebuild: measure again and put cards, title, ground and statement where the clock is
        onRefresh: () => { measure(); render(clock.p); lastP = clock.p; if (root.classList.contains('is-live')) force(lineAt(clock.p)); },
      });

      measure();
      render(0);
      // statement state is set outside the matchMedia context: a ScrollTrigger refresh reverts what the
      // context recorded, which would undo an in-context gsap.set on the lines
      Promise.resolve().then(() => {
        if (!root.classList.contains('is-live')) return;
        lastP = clock.p;
        force(lineAt(clock.p));
      });
    };

    // Stop mode: one clock in screens. Card k comes out of the vanishing point from LEAD + k × (stop + STEP)
    // over STEP, rests centred and flat for `stop`, then grows past and leaves through its own side over STEP,
    // while card k + 1 comes in. Its title rides under its bottom-left corner while it rests.
    const buildStop = (tl, ctx) => {
      const stage = ctx.stage;
      const hold = (ctx.phone ? mob : desk).hold;
      const P = num(opts.perspective, 300, 240, 600);
      const zStart = -2 * P;
      const haze = num(opts.haze, 0, 0, 0.3);
      const D = video ? num(opts.dolly, 1.08, 1, 1.3) : num(opts.dolly, 1.8, 1.6, 2);
      const dolly = ctx.phone ? 1 + (D - 1) * 0.7 : D;
      const run = runOpt * (ctx.phone ? 0.85 : 1);
      const arrive = opts.arrive !== false;
      const ARR = Math.min(0.1, 0.3 / hold);   // the arrival beat: the last 0.3 screen at most
      const settle = gsap.parseEase('power2.inOut');
      const FOG0 = 0.82;
      clean();
      if (field) field.style.perspective = P + 'px';
      if (list) list.setAttribute('aria-hidden', 'true');
      lines.forEach((l, i) => { if (i) { l.style.visibility = 'hidden'; l.style.opacity = '0'; } });
      const geo = cards.map((card, i) => {
        const ds = parseFloat(card.dataset.side);
        const side = ds === 1 || ds === -1 ? ds : (i % 2 ? 1 : -1);
        const raw = parseFloat(getComputedStyle(card).getPropertyValue('--dy'));
        card.style.zIndex = String(N - i);       // the leaving card is the nearer one
        const t0 = LEAD + i * (stop + STEP);
        return { card, fog: card.querySelector('.fly__fog'), tag: tags[i] && tags[i].textContent ? tags[i] : null, side, dy: clamp(Number.isFinite(raw) ? raw : DY[i % DY.length], 0, 8), t0, t1: t0 + STEP, t2: t0 + STEP + stop, w: 0, h: 0, sR: 1, zR: 0, y0: 0, yR: 0, tagH: 0, vis: null, o: -1, f: -1, k: -1 };
      });
      let W = 0, H = 0, VP = 0, GH = 1, gk = -1;
      const measure = () => {
        W = stage.clientWidth || innerWidth; H = stage.clientHeight || innerHeight;
        VP = field ? parseFloat(getComputedStyle(field).perspectiveOrigin.split(' ')[1]) : NaN;
        if (!Number.isFinite(VP)) VP = H * 0.56;
        for (const g of geo) {
          g.w = g.card.offsetWidth || 1; g.h = g.card.offsetHeight || 1;
          // at rest: 62% of the stage wide, never under 60%, its height at most 70% of the stage
          g.sR = Math.min(0.62 * W / g.w, 0.7 * H / g.h);
          if (g.sR * g.w < 0.6 * W && g.h * (0.6 * W / g.w) <= 0.78 * H) g.sR = 0.6 * W / g.w;
          g.zR = P * (1 - 1 / g.sR);
          // the card and its title as one block on the stage's middle
          g.tagH = g.tag ? g.tag.offsetHeight + 12 : 0;
          g.yR = (H / 2 - g.tagH / 2 - VP) / g.sR;
          g.y0 = (g.dy * H) / 100;
        }
        if (ground) { const o = parseFloat(getComputedStyle(ground).transformOrigin.split(' ')[1]); GH = Math.max(1, (ground.offsetHeight || H) - (Number.isFinite(o) ? o : VP)); }
        gk = -1;
      };
      const runAt = (p) => (!arrive ? run * p : p < 1 - ARR ? (run * p) / (1 - ARR) : run * (1 - 0.2 * settle((p - 1 + ARR) / ARR)));
      const render = (p) => {
        const sc = p * hold;
        for (const g of geo) {
          if (sc <= g.t0 || sc >= g.t2 + STEP) {
            if (g.vis !== false) { g.card.style.visibility = 'hidden'; g.card.style.opacity = '0'; g.card.style.willChange = 'auto'; g.vis = false; g.o = -1; }
            if (g.tag && g.k !== 0) { g.tag.style.opacity = '0'; g.k = 0; }
            continue;
          }
          if (g.vis !== true) { g.card.style.visibility = 'visible'; g.card.style.willChange = 'transform, opacity'; g.vis = true; }
          let s, z, x = 0, y, o = 1, f = haze;
          if (sc < g.t1) {
            // the approach: out of the vanishing point to the centre, easing into its rest
            const a = (sc - g.t0) / STEP, k = 1 - (1 - a) * (1 - a);
            z = zStart + (g.zR - zStart) * k; s = P / (P - z);
            y = g.y0 + (g.yR - g.y0) * k; o = Math.min(1, a / 0.3); f = FOG0 + (haze - FOG0) * k;
          } else if (sc <= g.t2) {
            z = g.zR; s = g.sR; y = g.yR;
          } else {
            // the exit: it grows past and leaves through its own side, solid until its last sliver
            const e = (sc - g.t2) / STEP, k = e * e;
            s = g.sR * (1 + 0.8 * k); z = P * (1 - 1 / s); y = g.yR;
            x = (g.side * k * (W / 2 + (g.w * s) / 2 + 8)) / s;
            o = e > 0.85 ? (1 - e) / 0.15 : 1;
          }
          g.card.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(2)}px)`;
          const or = r3(o); if (or !== g.o) { g.card.style.opacity = String(or); g.o = or; }
          const fr = r3(f); if (g.fog && fr !== g.f) { g.fog.style.opacity = String(fr); g.f = fr; }
          if (g.tag) {
            // the title: on from 0.1 screen before the stop to 0.1 after it, under the card's bottom-left corner
            const k = r3(clamp((sc - (g.t1 - 0.1)) / 0.06, 0, 1) * clamp((g.t2 + 0.1 - sc) / 0.06, 0, 1));
            if (k > 0) {
              const left = W / 2 + (x - g.w / 2) * s, bottom = VP + (y + g.h / 2) * s;
              g.tag.style.transform = `translate3d(${Math.round(Math.max(8, left))}px, ${Math.round(bottom + 12)}px, 0)`;
            }
            if (k !== g.k) { g.tag.style.opacity = String(k); g.k = k; }
          }
        }
        // the heading: on the backdrop before the first card rests, gone by its stop
        if (lines[0] && geo[0]) { const h = r3(clamp((geo[0].t1 - sc) / (geo[0].t1 - Math.max(0, geo[0].t0 - 0.05)), 0, 1)); lines[0].style.opacity = String(h); lines[0].style.visibility = h > 0 ? 'visible' : 'hidden'; }
        if (ground) { const k = Math.round((runAt(p) / GH) * 1e8) / 1e8; if (k !== gk) { ground.style.transform = `matrix3d(1,0,0,0,0,1,0,${-k},0,0,1,0,0,0,0,1)`; gk = k; } }
        if (video) seek(p);
      };
      if (backdrop) {
        if (arrive) {
          tl.fromTo(backdrop, { scale: 1, yPercent: 0 }, { scale: dolly, duration: 1 - ARR, ease: 'none' }, 0);
          tl.fromTo(backdrop, { scale: dolly, yPercent: 0 }, { scale: dolly - (dolly - 1) * BACK, yPercent: -2, duration: ARR, ease: 'power2.inOut', immediateRender: false }, 1 - ARR);
        } else tl.fromTo(backdrop, { scale: 1, yPercent: 0 }, { scale: dolly, duration: 1, ease: 'none' }, 0);
      }
      const clock = { p: 0 };
      live = clock;
      tl.fromTo(clock, { p: 0 }, { p: 1, duration: 1, ease: 'none', immediateRender: false, onUpdate: () => render(clock.p) }, 0);
      // pictures decode before they move
      ScrollTrigger.create({
        trigger: root, start: 'top bottom+=200%', end: 'bottom top',
        onToggle: (self) => { if (self.isActive) for (const img of root.querySelectorAll('img')) { img.loading = 'eager'; if (img.decode) img.decode().catch(() => {}); } },
        onRefresh: () => { measure(); render(clock.p); },
      });
      measure();
      render(0);
    };

    const tooMany = N > num(opts.phoneMax, 9, 3, 12);
    const builder = stop ? buildStop : build;
    return Stage.scene(root, {
      hold: desk.hold,
      scrub: Stage.lenis ? true : 0.5,
      build: N ? builder : null,
      // stop mode rests on a phone (the pieces stacked full width) unless the page asks for 'same'
      phone: opts.phone === 'rest' || tooMany || (stop && opts.phone !== 'same') ? 'rest' : { hold: mob.hold, build: N ? builder : null },
      rest: clean,
    });
  };
})();
