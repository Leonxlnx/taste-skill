# Media and galleries gap-source research

Checked: 2026-07-20
Scope: additional permissively licensed React source components for **Media and galleries** only. Portfolio sections, hero media blocks, layouts, templates, pages, dashboards, demo variants, skins, and dependency wrappers without a distinct implementation are excluded.
Status: source research only. No component, dependency, preview asset, or registry entry was imported.

## Decision and honest count

The current global shortlist contains **46** Media and galleries components against a target of **60**, leaving a gap of **14**. This pass found **8 conditionally viable components** across seven source families. It found **0 import-now components**.

| Decision | Components | Count |
| --- | --- | ---: |
| Accepted / import now | None | **0** |
| Conditional repair | Image Turntable, Pan/Zoom Viewer, Image Mapper, Video Seek Slider, Webcam Capture, Video Storyboard Thumbnail, Audio Blob Waveform, Live Audio Spectrum | **8** |
| Rejected | Legal conflicts, dependency wrappers, global duplicates, inaccessible rewrites, and weaker variants listed below | **0 countable** |
| Current verified shortlist | Existing globally deduplicated Media and galleries total | **46** |
| Best-case ceiling from this pass | Existing 46 + all 8 conditionals after implementation and QA | **54** |
| Residual target gap | 60 - 54 | **6** |

The catalog remains at **46**, not 54. Conditional candidates do not count until their repair is implemented, their source/license manifest is recorded, their isolated preview uses owned media, and build, keyboard, touch, responsive, reduced-motion, cleanup, provenance, and registry-output checks pass.

## Accepted / import now — none

Every novel source inspected has at least one release blocker: default autoplay without reduced-motion handling, incomplete keyboard semantics, fixed-size canvas behavior, camera-consent requirements, a beta dependency boundary, or missing cleanup. Padding the count with generic carousels, another cropper/lightbox/player, thin wrappers, or cosmetic media treatments would violate the global dedupe rules.

## Conditional repair — 8 components

### 1. Image Turntable — 1

| Field | Evidence |
| --- | --- |
| Repository | [nerdyman/react-image-turntable](https://github.com/nerdyman/react-image-turntable) |
| Immutable pin | [`ecefe10b403a8f518d3566abdcddf7026c8f6a9d`](https://github.com/nerdyman/react-image-turntable/tree/ecefe10b403a8f518d3566abdcddf7026c8f6a9d), 2024-04-08; package `react-image-turntable@3.1.2` |
| Exact source | [`src/ReactImageTurntable.tsx`](https://github.com/nerdyman/react-image-turntable/blob/ecefe10b403a8f518d3566abdcddf7026c8f6a9d/src/ReactImageTurntable.tsx), with `src/hooks.ts`, `src/types.ts`, and `src/index.ts` at the same pin |
| License | [MIT, copyright 2022 nerdyman](https://github.com/nerdyman/react-image-turntable/blob/ecefe10b403a8f518d3566abdcddf7026c8f6a9d/LICENSE). Retain the complete copyright and permission notice. |
| Runtime | React `>=16.8`; no runtime package dependency |
| Assets | Caller supplies the ordered image-frame sequence. Do not copy example photos. |

Why it is distinct: this is direct 360-degree frame-sequence scrubbing, not a before/after comparison, lightbox, generic carousel, lens, or video player.

Upstream quality:

- The root uses `role="slider"`, focusability, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`, Arrow Left/Right, and Pointer Events, so mouse and touch share one path.
- Images use `max-width: 100%`, a common frame, and `object-fit: cover`; the source does not provide `srcSet`, `sizes`, lazy loading, error handling, or a bounded preload policy.
- All frames remain in the accessibility tree with generated `Turntable image N` alternatives. An empty `images` array also produces invalid slider state.
- Auto-rotation is on by default at 200 ms and does not honor `prefers-reduced-motion`, page visibility, or viewport visibility.

Required repair:

- Default auto-rotation to off. When explicitly enabled, pause on focus/hover/drag, when hidden or offscreen, and under reduced motion; expose a real start/stop button if rotation remains user-visible.
- Require a caller-owned alternative for the product/object, expose only the active frame to assistive technology, and hide duplicate frame images.
- Guard zero/one-frame inputs, clamp the initial index, prevent Arrow-key page scrolling, and add image error behavior.
- Keep responsive dimensions caller-controlled and document optional `srcSet`/`sizes` or a frame-source callback rather than eagerly prescribing remote assets.

### 2. Inline Pan/Zoom Viewer with minimap — 1

| Field | Evidence |
| --- | --- |
| Repository | [michelesandroni/react-viewer-pan-zoom](https://github.com/michelesandroni/react-viewer-pan-zoom) |
| Immutable pin | [`25c138af17579ef0af98e87332551dceb6130642`](https://github.com/michelesandroni/react-viewer-pan-zoom/tree/25c138af17579ef0af98e87332551dceb6130642), 2025-09-01; package `react-viewer-pan-zoom@1.3.1` |
| Exact source | [`lib/components/Viewer.tsx`](https://github.com/michelesandroni/react-viewer-pan-zoom/blob/25c138af17579ef0af98e87332551dceb6130642/lib/components/Viewer.tsx), plus `ViewerProvider.tsx`, `ViewerContext.tsx`, `ViewerDefaults.tsx`, `ViewportContent.tsx`, `Minimap.tsx`, `useOptimizedCrop.ts`, `types.ts`, `Viewer.module.css`, and `lib/index.ts` |
| License | [MIT, copyright 2024 Michele Sandroni](https://github.com/michelesandroni/react-viewer-pan-zoom/blob/25c138af17579ef0af98e87332551dceb6130642/LICENSE). Retain the complete notice. |
| Runtime | React/React DOM `^18.3 || ^19`; `@use-gesture/react ^10.3.1`; `lodash ^4.17.21` |
| Assets | Caller supplies both the viewport and minimap React nodes. No bundled image/video asset is needed. |

Why it is distinct: it is an inline arbitrary-content transform surface with a persistent minimap. Kibo Image Zoom and YARL Zoom are image/lightbox experiences; Magic UI Lens is a local magnifier. Reject React SVG Pan Zoom and React Image Hotspots below as weaker collisions with this slot.

Upstream quality:

- Supports drag, touch pinch, touchpad pinch, wheel zoom, minimap manipulation, reset/center/minimap commands, `ResizeObserver`, window resize, and image/video load recalculation.
- It provides only global `r`, `c`, and `m` shortcuts. The viewer itself has no focus target, role, accessible name, keyboard pan, or keyboard zoom; shortcuts can fire while the user is typing elsewhere.
- Default spring/rubber-band transitions do not honor reduced motion. A queued animation frame in `useOptimizedCrop` is not cancelled on unmount.
- The package has no test suite and brings two runtime dependencies, including `lodash` for one settings-merge path.

Required repair:

- Make the viewport a named focusable region; scope shortcuts to it; add Arrow-key pan, `+`/`-` zoom, Home/reset, and labeled native zoom/reset/center/minimap buttons with visible focus.
- Disable spring and rubber-band motion under `prefers-reduced-motion`; direct pointer movement can remain direct.
- Cancel pending RAF, avoid adding `lodash` if an existing project merge path is sufficient, and test observer/listener cleanup.
- Require intrinsic media dimensions and caller-owned responsive `<img>`/`<video>` props; verify the minimap does not duplicate meaningful content for assistive technology.

### 3. Interactive Image Mapper — 1

| Field | Evidence |
| --- | --- |
| Repository | [img-mapper/img-mapper](https://github.com/img-mapper/img-mapper) |
| Immutable pin | [`03304dfcacfb51f249f79375233d749832d045d5`](https://github.com/img-mapper/img-mapper/tree/03304dfcacfb51f249f79375233d749832d045d5), 2025-10-23; package `react-img-mapper@2.0.3` |
| Exact source | [`packages/react-img-mapper/src/ImageMapper.tsx`](https://github.com/img-mapper/img-mapper/blob/03304dfcacfb51f249f79375233d749832d045d5/packages/react-img-mapper/src/ImageMapper.tsx), `src/helpers/{area,constants,dimensions,draw,events,styles}.ts`, `src/@types/{area,constants,dimensions,draw,events,index,lib,styles}.d.ts`, and `src/index.ts` |
| License | [MIT, copyright 2025 Nisharg Shah](https://github.com/img-mapper/img-mapper/blob/03304dfcacfb51f249f79375233d749832d045d5/LICENSE.txt). Retain the complete notice. |
| Runtime | React/React DOM 16.8–19; `react-fast-compare ^3.2.2` |
| Assets | Caller supplies the image and rectangle/circle/polygon coordinate data. No demo image may enter the catalog. |

Why it is distinct: selectable arbitrary-shaped image regions are a different contract from point hotspots, annotation authoring, a zoom lens, or a comparison divider.

Upstream quality:

- Uses native `<map>/<area>` hit regions plus a canvas highlight overlay. Mouse and touch callbacks are present, and coordinates can scale from `imgWidth` to a caller-provided `parentWidth`.
- Responsive mode does not measure its own host; the caller must keep `parentWidth` current.
- The image is forced to `role="presentation"` with `alt="map"`; every area also defaults to `alt="map"`. Areas without `href` are not reliably keyboard reachable, there is no focus highlight or selected-state announcement, and `areaProps` intentionally excludes click handlers.
- Its image-readiness polling interval has no unmount cleanup path. There is no authored animation, so reduced motion is otherwise not applicable.

Required repair:

- Require a meaningful image alternative and a unique accessible name for every enabled area. Make action areas focusable and activate on Enter/Space; preserve real navigation when an `href` exists.
- Draw the same highlight for focus as hover, expose selected state, and keep touch activation equivalent.
- Replace caller-width polling with a host `ResizeObserver`, clear the readiness interval on every exit path, and handle image failure.
- Reject the candidate if these changes require replacing the native map/area model rather than a contained repair.

### 4. Chaptered Video Seek Slider — 1

| Field | Evidence |
| --- | --- |
| Repository | [egorovsa/react-video-seek-slider](https://github.com/egorovsa/react-video-seek-slider) |
| Immutable pin | [`3b50e814c7885eaca27d1b895c13c28ac81511ad`](https://github.com/egorovsa/react-video-seek-slider/tree/3b50e814c7885eaca27d1b895c13c28ac81511ad), 2025-09-25; package `react-video-seek-slider@8.0.4` |
| Exact source | [`src/index.tsx`](https://github.com/egorovsa/react-video-seek-slider/blob/3b50e814c7885eaca27d1b895c13c28ac81511ad/src/index.tsx), `src/components/{hoverTimeWithPreview,thumb,timeCodeItem,timeCodes}.tsx`, `src/utils/{getEndTimeByIndex,getHoverTimePosition,getPositionPercent,getTimeScale,isInRange,positionToMs,secondsToTime,timeToTimeString}.ts`, and `src/ui-video-seek-slider.scss` |
| License | [MIT; exact notice `Copyright (c) <2021> <Sergey Egorov>` plus repository URL](https://github.com/egorovsa/react-video-seek-slider/blob/3b50e814c7885eaca27d1b895c13c28ac81511ad/LICENSE). Preserve it verbatim rather than normalizing the brackets. |
| Runtime | React/React DOM `>=18`; no runtime package dependency |
| Assets | Caller supplies duration, buffered/current values, chapter labels, and optional preview URLs. Documentation video/preview media is excluded. |

Why it is distinct: it is a standalone chaptered seek control with buffered state and preview positioning, not another complete player. Dice Media Player plus Media Chrome remains the canonical full player.

Upstream quality:

- Supports mouse drag, touch drag, buffered progress, chapter segments, time labels, and a caller preview callback.
- The visual track has no slider role, focusability, ARIA value, keyboard controls, or visible focus. CSS explicitly removes outlines.
- Track width is read opportunistically during render rather than observed. Global mouse/touch listeners are cleaned up, but the touch listener is not explicitly registered as non-passive while calling `preventDefault`.
- Cosmetic height/opacity/scale transitions ignore reduced motion. The thumb class currently resolves to `active` on both ternary branches.

Required repair:

- Implement the WAI-ARIA slider contract: focus, name, min/max/now/value text, Arrow/Page/Home/End keys, visible focus, and clamped zero-duration handling.
- Observe track resize, use Pointer Events or correctly configured non-passive touch handling, and keep a practical touch target without blocking page scroll outside an active drag.
- Remove the always-active thumb bug and disable cosmetic transitions under reduced motion.
- Keep storyboard parsing/rendering separate; the Video.js Thumbnail candidate below may be composed with this slider but does not add another seek-control count.

### 5. Webcam Capture Surface — 1

| Field | Evidence |
| --- | --- |
| Repository | [mozmorris/react-webcam](https://github.com/mozmorris/react-webcam) |
| Immutable pin | [`7522284fd66f98ff2d846e73881f65d35e840dab`](https://github.com/mozmorris/react-webcam/tree/7522284fd66f98ff2d846e73881f65d35e840dab), 2024-01-08; package `react-webcam@7.1.1` |
| Exact source | [`src/react-webcam.tsx`](https://github.com/mozmorris/react-webcam/blob/7522284fd66f98ff2d846e73881f65d35e840dab/src/react-webcam.tsx) and `src/dom.d.ts` |
| License | [MIT, copyright 2018 Moz Morris](https://github.com/mozmorris/react-webcam/blob/7522284fd66f98ff2d846e73881f65d35e840dab/LICENSE). Retain the complete notice. |
| Runtime | React/React DOM `>=16.2`; no runtime package dependency |
| Assets | Live `MediaStream` and generated data URL remain caller/user data. No fixture photo or recording is bundled or persisted by the component. |

Why it is distinct: this is a capture source and mirrored screenshot surface, not media playback, upload, crop, or a decorative camera frame.

Upstream quality:

- Uses native `getUserMedia`, forwards video constraints and video-element props, supports mirrored capture, configurable screenshot format/quality, `playsInline`, PiP opt-out, stale-request protection, track stopping, and object-URL revocation.
- It requests camera access immediately on mount. The source does not provide consent/start/stop/capture controls, permission status, error UI, or an accessible live-region contract; those are consumer responsibilities.
- Responsive presentation is available only through forwarded native width/style props. The capture canvas uses the rendered video size unless source-size capture is requested.
- Reduced motion does not require suppressing an explicitly requested live camera feed, but decorative capture flashes/transitions must not be added for reduced-motion users.

Required repair:

- Mount the component only after an explicit, labeled user action; provide labeled Start, Capture, Retake, and Stop controls with keyboard operation, visible focus, permission/error status, and deterministic return focus.
- Stop tracks when the capture surface closes, not only when its React instance eventually unmounts. Default audio to off and request it only after separate explanation.
- Document secure-context and Permissions-Policy requirements, never persist or upload captures implicitly, and make the preview label/captured-image alternative caller-owned.
- Provide an aspect-ratio wrapper and explicit intrinsic capture dimensions; test mobile orientation/camera switching.

### 6. Video Storyboard Thumbnail — 1

| Field | Evidence |
| --- | --- |
| Repository | [videojs/v10](https://github.com/videojs/v10) |
| Immutable pin | [`72e175e1bd1886124fc907be79a23b405ee6ab1a`](https://github.com/videojs/v10/tree/72e175e1bd1886124fc907be79a23b405ee6ab1a), 2026-07-17; package family `10.0.0-beta.25` |
| Exact source | [`packages/react/src/ui/thumbnail/thumbnail.tsx`](https://github.com/videojs/v10/blob/72e175e1bd1886124fc907be79a23b405ee6ab1a/packages/react/src/ui/thumbnail/thumbnail.tsx), with `packages/core/src/core/ui/thumbnail/{thumbnail-core,thumbnail-data-attrs,thumbnail-media-fragment,types}.ts` and `packages/core/src/dom/ui/thumbnail.ts` |
| License | [Apache-2.0, copyright 2025-present Video.js contributors, with the Video.js/Brightcove trademark notice](https://github.com/videojs/v10/blob/72e175e1bd1886124fc907be79a23b405ee6ab1a/LICENSE). Ship the license, retain notices, and mark modified files prominently. No separate `NOTICE` file exists at this pin. |
| Runtime boundary | The published `@videojs/react` package depends on `@videojs/core`, `@videojs/spf`, `@videojs/store`, and `@videojs/utils`; core declares `@vimeo/player`, `dashjs`, `hls.js`, and `mux-embed`. Do not install that player stack solely for this thumbnail. |
| Assets | Caller supplies thumbnail arrays or VTT/storyboard sprite images. Official Mux/demo media and Video.js branding are excluded. |

Why it is distinct: it resolves a time to a standalone storyboard tile, parses `#xywh` media fragments, clips/scales sprite sheets, and reports loading/error/hidden state. It is not another player or slider.

Upstream quality:

- Uses binary search for the active thumbnail, supports pre-parsed arrays and player text-track cues, parses sprite coordinates, clips/scales without aspect distortion, observes resize, cleans listeners/observer, and exposes native image loading/fetch-priority/CORS options.
- The inner image is correctly decorative (`alt=""`, `aria-hidden`) because the adjacent seek control should expose the time. There is no independent keyboard/touch behavior and no authored animation; reduced motion is not applicable.
- The source is a beta and its React file is coupled to internal player context/render hooks even though the external `thumbnails` path can work independently.

Required repair:

- Source-adapt only the external-thumbnail path and the small core/DOM closure above, replacing internal `listen`/predicate/render helpers with native project utilities. Do not add the full Video.js package graph for one preview.
- Preserve array and optional VTT/media-fragment support, loading/error state, cleanup, CORS, and resize behavior; add a deterministic placeholder that does not become another count.
- Keep it `aria-hidden` when paired with a named slider. If used independently to convey information, require a caller label rather than exposing a redundant sprite description.
- Pin the beta exactly and re-audit before import; reject if extraction grows into a player-framework fork.

### 7–8. Audio Blob Waveform and Live Audio Spectrum — 2

| Field | Evidence |
| --- | --- |
| Repository | [samhirtarif/react-audio-visualize](https://github.com/samhirtarif/react-audio-visualize) |
| Immutable pin | [`e284411a8ffb304ef53802caea6f52db171524ef`](https://github.com/samhirtarif/react-audio-visualize/tree/e284411a8ffb304ef53802caea6f52db171524ef), 2024-09-07; package `react-audio-visualize@1.2.0` |
| Exact static source | [`src/AudioVisualizer/AudioVisualizer.tsx`](https://github.com/samhirtarif/react-audio-visualize/blob/e284411a8ffb304ef53802caea6f52db171524ef/src/AudioVisualizer/AudioVisualizer.tsx), with `utils.ts`, `types.ts`, `index.ts`, and root `src/index.ts` |
| Exact live source | [`src/LiveAudioVisualizer/LiveAudioVisualizer.tsx`](https://github.com/samhirtarif/react-audio-visualize/blob/e284411a8ffb304ef53802caea6f52db171524ef/src/LiveAudioVisualizer/LiveAudioVisualizer.tsx), with `utils.ts`, `index.ts`, and root `src/index.ts` |
| License | [MIT, copyright 2023 Samhir Tarif](https://github.com/samhirtarif/react-audio-visualize/blob/e284411a8ffb304ef53802caea6f52db171524ef/LICENSE). Retain the complete notice. |
| Runtime | React/React DOM `>=16.2`; no runtime package dependency; native Canvas, Web Audio, and `MediaRecorder` APIs |
| Assets | Caller supplies an audio `Blob` or an already-consented `MediaRecorder`. No audio fixture or recording is bundled, uploaded, or persisted. |

Why these are two components rather than variants:

- `AudioVisualizer` decodes a finite audio blob into a whole-file time-domain waveform and can color played versus unplayed progress.
- `LiveAudioVisualizer` consumes a live recorder stream and renders current frequency-domain levels. Its lifecycle, privacy boundary, and motion contract differ materially from a static waveform.

Upstream quality and required repair for `AudioVisualizer`:

- It uses a canvas and native `decodeAudioData`, but creates an `AudioContext` without closing it, has no rejected-decode/stale-result path, samples only channel 0, and can produce non-finite averages for empty positive/negative buckets.
- Width and height are fixed numeric canvas attributes; it does not observe its host or scale the backing store for device pixel ratio. Redraw dependencies omit size and color changes.
- Close the context in `finally`, ignore stale async results, handle decode failure/silence/multichannel input, recalculate for every data-affecting prop, and add `ResizeObserver` plus DPR-aware drawing.
- The canvas is non-interactive. Allow either a caller-owned `aria-label`/fallback summary or `aria-hidden`; keyboard and reduced motion are otherwise not applicable to the static waveform.

Upstream quality and required repair for `LiveAudioVisualizer`:

- It connects an analyser to the caller's recorder stream and closes/disconnects the Web Audio graph on the main effect cleanup.
- The recursive RAF is not retained/cancelled, the callback dependencies are incomplete, and it continues producing rapid decorative motion without page-visibility, viewport-visibility, or reduced-motion handling.
- Default canvas width/height are strings (`"100%"`) even though the canvas backing-store attributes need numeric dimensions; there is no DPR or host resize handling.
- Retain and cancel the RAF; run only while recording and visible; under reduced motion replace continuous bars with a static or low-frequency recording-state indicator. Use measured numeric backing-store dimensions and CSS sizing.
- Treat the canvas as decorative beside an accessible recording status, or require a concise caller label. Camera/microphone consent and Start/Pause/Stop controls belong to the host and must be keyboard accessible.

## Global dedupe map

| Normalized behavior | Canonical result | Collisions excluded |
| --- | --- | --- |
| Before/after comparison | Existing React Compare Slider | Dice Compare Slider, Motion Image Comparison, other comparison skins |
| Photo layout | Existing React Photo Album Rows, Columns, Masonry | Generic grid/masonry gallery packages and page galleries |
| Lightbox and lightbox plugins | Existing YARL core plus functional plugins | React Motion Gallery fullscreen, modal image viewers, Kibo duplicates |
| Full media player | Existing Dice Media Player with complete Media Chrome closure | Video.js player/presets/skins, Kibo/Origin players, Plyr wrappers |
| Image crop | Existing Dice Cropper | React Easy Crop, Kibo Image Crop, avatar editors |
| Generic carousel | Existing selected Box/Progressive/behavior-specific carousel entries | Nuka Carousel, Pure React Carousel, generic React carousel packages |
| 360 frame scrub | **Conditional Image Turntable** | Other product-spin/turntable packages |
| Inline pan/zoom with minimap | **Conditional React Viewer Pan Zoom** | React SVG Pan Zoom, React Image Hotspots |
| Arbitrary selectable image zones | **Conditional Img Mapper** | Point-hotspot packages and non-keyboard image annotation packages |
| Standalone chaptered seek control | **Conditional React Video Seek Slider** | Video.js Time Slider and full-player control anatomy |
| Camera capture | **Conditional React Webcam** | Capture Photo and other app-sized camera compositions |
| Storyboard/VTT sprite thumbnail | **Conditional Video.js Thumbnail extraction** | Preview callbacks alone and full player frameworks |
| Whole-file audio waveform | **Conditional AudioVisualizer** | Audio-player skins and generic decorative bar charts |
| Live audio spectrum | **Conditional LiveAudioVisualizer** | Static waveform and generic perpetual visual effects |

## Rejected sources

These were inspected at immutable pins. They add **zero** to the gap count.

| Source and pin | Exact source/license boundary | Decision |
| --- | --- | --- |
| [filipecorrea/react-image-hotspots `bcc0cdf8a213abbd90fbdf23918b2568bb90ab3f`](https://github.com/filipecorrea/react-image-hotspots/tree/bcc0cdf8a213abbd90fbdf23918b2568bb90ab3f), package 2.5.0 | `src/ImageHotspots.js`, `src/Hotspot.js`; [MIT, copyright 2019 Filipe Corrêa](https://github.com/filipecorrea/react-image-hotspots/blob/bcc0cdf8a213abbd90fbdf23918b2568bb90ab3f/LICENSE) | Reject. Panning is mouse-only, controls rely on text glyphs/titles, keyboard pan is absent, fullscreen state can desync on external Escape, and there is no reduced-motion path. It is a weaker union of the selected pan/zoom viewer and image mapper. Exclude `src/portrait.jpg` and `src/landscape.jpg`. |
| [gusttaswe/react-image-color-picker `4f6416f282dbaa904e7185aa1a503a4fdfcb164c`](https://github.com/gusttaswe/react-image-color-picker/tree/4f6416f282dbaa904e7185aa1a503a4fdfcb164c), package 1.3.4 | `src/components/ImageColorPicker/**`, `src/hooks/{useColorPick,useMobileDetect}.tsx`, `src/util/{canvas,imageLoader}.tsx`; [MIT, copyright 2023 gusttaswe](https://github.com/gusttaswe/react-image-color-picker/blob/4f6416f282dbaa904e7185aa1a503a4fdfcb164c/LICENSE); runtime `styled-components ^6.0.0-rc.6` | Reject. Canvas sampling is pointer/touch-only with no focus, semantics, or keyboard path; cross-origin failures are not handled; cleanup adds a `pointermove` listener where it should remove one. Repair is a rewrite, and Dice Color Picker already owns the general color-control slot. |
| [Secretmapper/react-image-annotation `3ddde7c7f52073c7f977485456e825b5592afb1d`](https://github.com/Secretmapper/react-image-annotation/tree/3ddde7c7f52073c7f977485456e825b5592afb1d), package 0.9.10 | `src/components/Annotation.js`, selectors/HOCs/components/utils closure; [MIT, copyright 2018-present Arian Allenson Valdez](https://github.com/Secretmapper/react-image-annotation/blob/3ddde7c7f52073c7f977485456e825b5592afb1d/LICENSE.md); runtime `styled-components ^3.1.6`, React 16 peer | Reject. Archived/stale source, mouse/touch drawing only, hover-dependent content, no keyboard/focus/ARIA authoring model, and no reduced-motion path. Keyboard annotation would require a new interaction design. |
| [annotorious/annotorious `22c3f6052acdcedebd0c8684c2bd3d8d4c46305d`](https://github.com/annotorious/annotorious/tree/22c3f6052acdcedebd0c8684c2bd3d8d4c46305d), `@annotorious/react@3.8.8` | `packages/annotorious-react/src/ImageAnnotator.tsx` and `Annotorious.tsx` over `packages/annotorious/**` and `packages/annotorious-core/**`; [BSD-3-Clause, copyright 2023 Rainer Simon](https://github.com/annotorious/annotorious/blob/22c3f6052acdcedebd0c8684c2bd3d8d4c46305d/LICENSE) | Reject as a source-component count. The React layer is lifecycle/context binding around the Svelte/core annotation engine and optional OpenSeadragon package, so it violates the no-thin-wrapper rule. It may be a valid application dependency, but not a copyable standalone React component for this catalog. |
| [davidmedero/react-motion-gallery `cea6ae3aee1ce91793935d0a3ba5df21514f374e`](https://github.com/davidmedero/react-motion-gallery/tree/cea6ae3aee1ce91793935d0a3ba5df21514f374e), package 2.0.99 | `packages/react-motion-gallery/src/**`; [project license](https://github.com/davidmedero/react-motion-gallery/blob/cea6ae3aee1ce91793935d0a3ba5df21514f374e/packages/react-motion-gallery/LICENSE.md) restricts use to non-commercial purposes and requires a paid commercial license; [Embla third-party notice](https://github.com/davidmedero/react-motion-gallery/blob/cea6ae3aee1ce91793935d0a3ba5df21514f374e/packages/react-motion-gallery/THIRD_PARTY_NOTICES.md) | Hard reject. Source-available/non-commercial is not a permissive open-source grant for Taste Blocks redistribution. The embedded Embla MIT notice does not relicense the package. Its slider, grid, masonry, fullscreen, video, and zoom features also collide with existing winners. |
| [FormidableLabs/nuka-carousel `e1e3fd05e58090be78b80e6a4bda52e54ff21b91`](https://github.com/FormidableLabs/nuka-carousel/tree/e1e3fd05e58090be78b80e6a4bda52e54ff21b91), package 8.2.0 | `packages/nuka/src/Carousel/**`, `hooks/**`, `types.ts`, `utils/**`; [MIT notices for Formidable Labs and DefinitelyTyped contributors](https://github.com/FormidableLabs/nuka-carousel/blob/e1e3fd05e58090be78b80e6a4bda52e54ff21b91/LICENSE) | Reject. Measurement, swipe, keyboard, autoplay pause, and reduced-motion hooks are useful, but it is another generic carousel. Default navigation is rendered as clickable `div` elements without sufficient button semantics, so it is not a stronger global replacement. |
| [express-labs/pure-react-carousel `a73776b73dac491f38eed48ced25974f57bc0195`](https://github.com/express-labs/pure-react-carousel/tree/a73776b73dac491f38eed48ced25974f57bc0195), package 1.35.0 | `src/CarouselProvider/**`, `src/Slider/**`, `src/Slide/**`, control/dot/image components; [MIT, copyright 2019 Express](https://github.com/express-labs/pure-react-carousel/blob/a73776b73dac491f38eed48ced25974f57bc0195/LICENSE.md); five runtime dependencies plus React peers | Reject. A generic carousel/anatomy duplicate with an older class/Redux-style internal store and more runtime surface than the selected carousel entries. `ImageWithZoom` is also a Kibo/Magic/YARL collision. |
| [ValentinH/react-easy-crop `dedb45980c2c17bf47c8e8eeea7fd05eea066ee9`](https://github.com/ValentinH/react-easy-crop/tree/dedb45980c2c17bf47c8e8eeea7fd05eea066ee9), package 6.2.2 | `src/Cropper.tsx`, `helpers.ts`, `types.ts`, `styles.css`, `index.ts`; [MIT, copyright 2022 Valentin Hervieu](https://github.com/ValentinH/react-easy-crop/blob/dedb45980c2c17bf47c8e8eeea7fd05eea066ee9/LICENSE); runtime `normalize-wheel ^1.0.1` | Reject only for global dedupe. It is a credible image/video cropper, but Dice Cropper is already selected and Kibo/Origin crop variants were already rejected. Video input is a media type, not a second crop behavior. |
| [UretzkyZvi/capture-photo `5710d0261f172dce17d79970b5452f1d6185c7ba`](https://github.com/UretzkyZvi/capture-photo/tree/5710d0261f172dce17d79970b5452f1d6185c7ba), private package 0.1.0 | `src/components/ui/camera/{camera,camera-provider,camera-types,camera-view}.tsx` plus Radix/shadcn app UI. The repository contains no license file or full copyright/permission text at this pin; its README only says MIT. | Reject. The missing license text/notice fails provenance, and the source is an app-sized dialog/capture composition with a broad Next/Radix/shadcn dependency closure. React Webcam is the smaller canonical capture primitive. |
| [chrvadala/react-svg-pan-zoom `3669b01158db09795d5c5204ae01f4e2157a3c5d`](https://github.com/chrvadala/react-svg-pan-zoom/tree/3669b01158db09795d5c5204ae01f4e2157a3c5d), package 3.13.1 | `src/viewer.js`, `features/**`, `events/**`, `ui-toolbar/**`, `ui-miniature/**`; [MIT, copyright 2016 chrvadala URL](https://github.com/chrvadala/react-svg-pan-zoom/blob/3669b01158db09795d5c5204ae01f4e2157a3c5d/LICENSE); runtime `prop-types`, `transformation-matrix` | Reject as the pan/zoom duplicate. SVG tool modes and touch pinch are real, but the viewer has no focused keyboard navigation, focus outlines are suppressed, the minimap toggle is unnamed, responsiveness requires externally supplied numeric dimensions, and an idle RAF loop runs continuously for auto-pan. Keep the arbitrary-content Viewer Pan Zoom candidate instead. |

Within the Video.js pin, reject `TimeSlider`, all full-player presets, skins, and control anatomy as separate counts. They collide with React Video Seek Slider and the already selected Dice/Media Chrome player. Only the standalone storyboard-thumbnail behavior remains conditional.

## Release gate for the eight conditionals

A future import pass must:

1. Re-fetch the exact pin and record a source manifest with every copied file and SHA-256 digest.
2. Preserve MIT notices verbatim; for Video.js, ship Apache-2.0, retain its copyright/trademark notice, and mark adaptations.
3. Use only caller-owned/local preview media. Record provenance for every image, video, audio clip, storyboard, and frame sequence.
4. Keep native media and controls first: `<img>`, `<video>`, `<canvas>`, `<map>/<area>`, Pointer Events, ResizeObserver, MediaDevices, Web Audio, and real buttons/links.
5. Verify keyboard, touch, no-hover, mobile resize/orientation, forced colors, screen-reader naming/state, reduced motion, page/viewport visibility, listener/observer/RAF/track cleanup, and zero/error inputs.
6. Re-run global normalized behavior/code dedupe. Helpers, placeholders, preview controls, and source adapters do not add counts.
7. Count a candidate only after a working isolated preview, registry output, build, and all policy checks pass.

Until then, the honest Media and galleries count is **46**, with **8 researched conditionals** and a **best-case residual gap of 6**.
