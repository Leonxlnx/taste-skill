# Responsive, Adaptive, Inclusive, and Accessible Web Design

Research for a professional design skill covering portfolios, websites, and landing pages. Source baseline: 2026-07-18. WCAG 2.2 is the conformance baseline; WCAG 3 drafts are not used as requirements.

## 1. Terms and scope

These terms overlap, but they are not interchangeable:

- **Responsive design** is continuous accommodation of available space and user settings. Layout, type, media, and controls flex without loss.
- **Adaptive design** introduces a deliberate composition or behavior change when the existing one no longer works: columns stack, persistent navigation becomes a disclosure, a dense comparison changes presentation, or an action bar relocates.
- **Inclusive design** considers the range of people, environments, languages, devices, and input methods from the beginning. It treats disability as part of ordinary human variation rather than a post-design exception.
- **Accessible design** produces content and interaction that people with disabilities can perceive, understand, navigate, and operate, including with assistive technology. WCAG supplies testable outcomes, but compliance alone does not guarantee a good experience.

The skill should not equate “responsive” with a desktop/mobile pair. A page also has to respond to zoom, enlarged text, narrow windows, split-screen, browser chrome, virtual keyboards, pointer precision, hover availability, keyboard use, forced colors, reduced motion, content length, writing direction, and user-generated content.

Primary baseline: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [WAI Essential Components of Web Accessibility](https://www.w3.org/WAI/fundamentals/components/), and [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design).

## 2. Design categories

This section describes what the design skill should decide and communicate. These are design categories, not implementation recipes or pass/fail checks.

### D1. Viewport and layout transformation

**Outcome:** The composition remains coherent from a narrow reading column to a wide canvas, at enlarged text sizes, and in intermediate window states.

Design the transformation, not just scaled screenshots:

- Start with the smallest complete composition, then add columns or peripheral material only when space supports them.
- Choose breakpoints where the content becomes crowded, lines become unreadably long, controls collide, or relationships become ambiguous. Do not choose breakpoints from current device model widths.
- Specify what each region does as space changes: retain, wrap, stack, reorder, disclose, scroll locally, simplify, or move.
- Prefer fluid regions with sensible minimum and maximum sizes. Use bounded content widths for reading, but do not place the entire experience in a fixed-width frame.
- Preserve the same task and information across variants. A smaller viewport may change presentation and sequence; it should not silently remove essential content or functionality.
- Treat two-dimensional content deliberately. A data table, map, timeline, code sample, or diagram may legitimately need local two-axis movement; the whole page generally should not.
- Design intermediate states. Tablet, split-window, landscape phone, browser sidebar, foldable segment, and desktop zoom often expose failures hidden by polished endpoint mockups.
- Avoid orientation-dependent meaning. If a particular orientation is truly essential, document why; otherwise both portrait and landscape must work.

For portfolio and landing pages, the visual concept must survive stacking. Art direction can change, but project proof, proposition, primary action, and trust evidence cannot vanish merely because the screen narrows.

Sources: [WCAG 1.3.4 Orientation and 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#distinguishable), [Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design), [MDN Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries).

### D2. Content priority and meaningful sequence

**Outcome:** The page tells the same story and supports the same task when read visually, linearly, or through a smaller composition.

- Identify the page promise, primary proof, primary action, secondary evidence, and optional atmosphere before laying out a hero.
- Set a canonical content order that makes sense without columns, overlaps, pinned scenes, or visual position.
- Keep the primary heading, proposition, action, and qualification close enough to be understood as one unit.
- When a multi-column region stacks, specify a meaningful order rather than relying on left-to-right geometry.
- Do not use CSS rearrangement to create a visual order that conflicts with DOM, keyboard, or screen-reader order.
- Use progressive disclosure only for secondary detail. Essential terms, prices, constraints, contact routes, and form requirements stay findable.
- Make duplicated calls to action consistent in label and destination. Repetition can support long landing pages, but it must not create competing “primary” actions.
- Keep project cards and testimonials independently understandable; do not make their interpretation depend only on spatial adjacency.

Sources: [WCAG 1.3.1 Info and Relationships, 1.3.2 Meaningful Sequence, and 2.4.3 Focus Order](https://www.w3.org/TR/WCAG22/), [Understanding Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html).

### D3. Responsive typography and reading comfort

**Outcome:** Type preserves hierarchy, legibility, and content capacity as the viewport, zoom, language, and text settings change.

- Use a fluid but bounded type scale. Display type may compress more aggressively than body type; body text must remain comfortably readable.
- Define hierarchy by more than size alone: weight, spacing, position, and wording can reinforce levels.
- Limit measure for prose while allowing headings, labels, and data to wrap naturally. Do not force single-line headings as a design invariant.
- Plan for 200% text enlargement, 400% browser zoom/reflow, user text-spacing overrides, and longer translations.
- Avoid clipping, fixed-height text boxes, and decorative masks that cut glyphs or diacritics.
- Use real text rather than images of text, except for essential brand marks. Text over photography needs a reliable contrast treatment across every crop and frame.
- Do not reduce text size at narrow widths merely to preserve the desktop composition. Change the composition.
- Keep supporting copy readable: captions, legal text, form help, metadata, and footer links are not decorative texture.
- Choose fonts with the needed scripts, weights, numerals, punctuation, and diacritics. A fallback must not collapse the hierarchy or overflow controls.

Apple’s platform guidance is useful as a design analogy: larger text often requires a stacked layout and fewer columns, while retaining information hierarchy. Web conformance remains governed by WCAG.

Sources: [WCAG 1.4.3 Contrast, 1.4.4 Resize Text, 1.4.5 Images of Text, 1.4.10 Reflow, and 1.4.12 Text Spacing](https://www.w3.org/TR/WCAG22/#distinguishable), [Apple Typography](https://developer.apple.com/design/human-interface-guidelines/typography).

### D4. Responsive media, art direction, and non-text content

**Outcome:** Images, video, animation, charts, and embeds preserve meaning without breaking layout or excluding non-visual users.

- Decide whether each image is informative, functional, decorative, or complex. Its accessibility treatment follows its purpose, not its file type.
- Art-direct crops by content: protect faces, products, artwork, text, and focal action. A blind center crop is not a responsive strategy.
- Reserve aspect ratio or dimensions to avoid disruptive layout shift, but let media shrink within its container.
- Keep essential text and calls to action outside images. If a graphic contains essential data or a process, provide an equivalent nearby explanation.
- Design captions and credits as part of the composition; they must wrap and remain associated with the correct media.
- Give video players enough room for controls and captions at narrow widths and zoom. Do not place important content beneath overlays.
- Provide captions for meaningful speech and sounds, a transcript where useful or required, and audio description or an equivalent for important visual information.
- Avoid autoplay with sound. If moving media begins automatically, provide an obvious pause/stop control and ensure the experience remains useful when motion is reduced.
- For portfolios, descriptions should communicate the contribution, constraints, and result rather than using alt text as a duplicate marketing paragraph.

Sources: [WAI Images Tutorial](https://www.w3.org/WAI/tutorials/images/), [WAI Making Audio and Video Accessible](https://www.w3.org/WAI/media/av/), [WCAG 1.1 and 1.2](https://www.w3.org/TR/WCAG22/#perceivable).

### D5. Navigation, wayfinding, and responsive disclosure

**Outcome:** People can understand where they are, what is available, and how to move through the site with any input mode.

- Keep the information architecture consistent across viewport variants. A compact menu is a different presentation of the same navigation, not a smaller sitemap.
- Show the current location and distinguish it from hover and keyboard focus.
- Give menu triggers explicit text or an accessible name; an unexplained icon is weaker than a labeled control.
- Design open, closed, hover, focus, active, current, and disabled states. Hover must never be the only route to a submenu or explanation.
- When navigation becomes a disclosure, specify trigger position, expanded state, focus behavior, close behavior, scroll behavior, and what happens after following a link.
- Make the primary action easy to find without displacing navigation or covering content. Sticky elements should earn their persistent viewport cost.
- Provide a visible-on-focus skip link for repeated headers. Long pages benefit from a table of contents or anchored section navigation, but it must not obscure focus or headings.
- Preserve browser expectations: links navigate, buttons perform actions, and the logo link has a clear destination.
- For portfolios, project browsing must remain possible without precision hover effects. For landing pages, repeated conversion links need descriptive, consistent labels.

Sources: [WAI Menus Tutorial](https://www.w3.org/WAI/tutorials/menus/), [WAI Navigation Design](https://www.w3.org/WAI/curricula/designer-modules/navigation-design/), [WCAG 2.4 Navigable](https://www.w3.org/TR/WCAG22/#navigable).

### D6. Input-mode independence and target design

**Outcome:** Core interactions work by mouse, touch, stylus, keyboard, switch, voice, and assistive technology without guessing the user’s device.

- Do not require hover, precise pointing, multipoint gestures, path-based gestures, device motion, or dragging for a core task without a simple alternative.
- Design visible labels that speech-input users can say and that agree with accessible names.
- Give controls generous hit areas and separation. WCAG 2.2 AA has a 24 by 24 CSS pixel target-size criterion with exceptions; a professional design default should usually be larger. Apple commonly recommends a 44 by 44 point hit region and Android 48 by 48 dp for touch interfaces, but those platform units are not direct web conformance measurements.
- Make compact icon controls visibly distinct, labeled where ambiguity is likely, and comfortably spaced.
- Define hover as enhancement. The same information must be available on focus and through activation where needed.
- Ensure pointer actions can be cancelled or completed on up-event, and do not bind irreversible outcomes to pointer-down.
- Provide buttons for drag-and-drop outcomes such as move up/down, add/remove, or choose a destination.
- Do not infer touch from viewport width or assume a touchscreen cannot also have a mouse and keyboard.

Sources: [WCAG 2.5 Input Modalities](https://www.w3.org/TR/WCAG22/#input-modalities), [MDN Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries), [Apple Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons), [Android accessibility touch targets](https://developer.android.com/guide/topics/ui/accessibility/views/apps-views).

### D7. Forms, conversion tasks, and error recovery

**Outcome:** Forms are short, understandable, forgiving, and completable at high zoom and with assistive technology.

- Ask only for information required for the task. Every field increases motor, cognitive, privacy, and abandonment cost.
- Use persistent visible labels. Placeholder text may demonstrate a format but must not carry the label.
- Group related controls and make required/optional status explicit in text.
- Choose controls that match the data and support native input, autofill, password managers, and appropriate virtual keyboards.
- Put instructions before the action they govern; keep field-specific help close to the field.
- Validate at a humane moment. Do not interrupt typing with noisy errors; do not wait until the end to reveal a complex format problem that could have been prevented.
- Error messages identify the field, explain the problem in plain language, and say how to fix it. Use more than color. Preserve entered data.
- After submit, provide a clear success or failure state. For important, legal, financial, or destructive actions, allow review, confirmation, correction, or undo.
- Avoid memory tests, transcription puzzles, and blocked paste in authentication. Support password managers and accessible alternatives to cognitive function tests.
- At narrow widths, keep label, control, help, and error in a stable reading order. Do not place two unrelated fields side by side merely to shorten the form.

Sources: [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/), [WAI Form Notifications](https://www.w3.org/WAI/tutorials/forms/notifications/), [WCAG 3.3 Input Assistance](https://www.w3.org/TR/WCAG22/#input-assistance), [MDN autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete).

### D8. Keyboard interaction and focus experience

**Outcome:** Keyboard users can reach, identify, operate, and leave every interactive element in a predictable order.

- Treat focus as a designed state, not a browser artifact to erase. It should be clearly visible against every local background and distinct from selection or active state.
- Keep focus order aligned with visual and reading order.
- Ensure sticky headers, cookie banners, drawers, and bottom action bars do not fully cover the focused element.
- Define focus entry, containment, restoration, and dismissal for dialogs, menus, drawers, popovers, tabs, carousels, and other composites.
- Use familiar keyboard conventions for custom widgets. A modal needs more than a close icon; a menu needs more than hover behavior.
- Do not trigger navigation, submission, or another context change merely because an element receives focus.
- Avoid positive `tabindex` as a design requirement. Fix the source order.
- Make skip links and other keyboard-only utilities visually coherent when revealed.

Sources: [WCAG 2.1 Keyboard Accessible and 2.4 Navigable](https://www.w3.org/TR/WCAG22/), [WAI APG Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/), [Understanding On Focus](https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html).

### D9. Semantics and the non-visual experience

**Outcome:** The structure, controls, relationships, and changes that are apparent visually are also available programmatically.

- Plan one descriptive page title, a clear main heading, a logical heading hierarchy, and recognizable page regions.
- Use actual lists for collections, tables for tabular relationships, figures for self-contained media, and native controls for interaction.
- Ensure every control has an accessible name that communicates purpose. Visible control text should be contained in that name for speech input.
- Use links for destinations and buttons for actions. Do not style generic containers into controls unless no native element fits.
- Define accessible names for repeated landmarks and repeated controls so users can distinguish them.
- Specify announcements for important asynchronous outcomes: form errors, saved state, loading completion, item addition, or changes that are otherwise only visual.
- Avoid excessive landmark, heading, or live-region noise. More semantics is not automatically better semantics.
- Write alt text from the information or function the image provides in context. Decorative images use a null alternative; complex visuals need a nearby equivalent.
- Prefer native HTML. ARIA can expose semantics, but it does not add keyboard behavior, focus management, layout, or interaction by itself.

Sources: [WAI APG Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/), [WAI Page Structure Tutorial](https://www.w3.org/WAI/tutorials/page-structure/), [WHATWG HTML Standard](https://html.spec.whatwg.org/), [WAI Images Tutorial](https://www.w3.org/WAI/tutorials/images/).

### D10. Color, contrast, visual states, and user color preferences

**Outcome:** Content and states remain distinguishable across vision differences, display conditions, themes, and forced-color settings.

- Never use color as the only signal for status, validation, selection, links, required fields, or chart series. Add text, shape, iconography, pattern, position, or underline.
- Meet at least WCAG AA contrast: 4.5:1 for normal text, 3:1 for large text, and 3:1 for visual information required to identify controls, states, and meaningful graphics. Test actual rendered combinations, not palette swatches in isolation.
- Check text over gradients, photographs, video, glass effects, disabled states, placeholders, focus indicators, borders, icons, charts, and both light and dark themes.
- Do not communicate interactivity through faint contrast alone. Links in body copy need a non-color cue unless the specific WCAG contrast/focus conditions are met.
- Let system colors survive where possible. In forced-colors mode, custom fills, shadows, and background images can disappear; essential boundaries and states need robust alternatives.
- Do not lower contrast to create hierarchy for essential content. Use size, weight, spacing, and placement.
- Treat brand colors as inputs, not exceptions. Adjust their usage or pairings when they cannot carry accessible text or controls.

Sources: [WCAG 1.4 Distinguishable](https://www.w3.org/TR/WCAG22/#distinguishable), [Understanding Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html), [Understanding Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [MDN forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors).

### D11. Motion, animation, timing, and sensory safety

**Outcome:** Motion supports understanding without becoming required, distracting, nauseating, seizure-provoking, or time pressure.

- Give every animation a job: orientation, continuity, feedback, or emphasis. Remove ambient motion that competes with the message.
- Design a reduced-motion version, not merely a faster version. Replace large translations, parallax, zoom, spin, and depth motion with stable state changes or restrained fades where appropriate.
- Pause or stop automatically moving, blinking, scrolling, or updating content that lasts long enough to distract, unless essential.
- Avoid content that flashes more than three times per second or exceeds WCAG flash thresholds.
- Do not make scroll-driven choreography the only way to receive content. Pinned scenes must release cleanly under zoom, reduced motion, keyboard navigation, and small viewports.
- Keep time limits adjustable or avoid them. Announce session expiry in advance and preserve work where possible.
- Never require device motion; provide a conventional control that performs the same action.
- Ensure carousels can be paused, are operable without swipe, do not steal focus, and do not auto-advance while a user is interacting.

Sources: [WCAG 2.2 Enough Time, 2.3 Seizures and Physical Reactions, and 2.5.4 Motion Actuation](https://www.w3.org/TR/WCAG22/), [MDN Using Media Queries for Accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility), [WAI Carousels Tutorial](https://www.w3.org/WAI/tutorials/carousels/).

### D12. Cognitive accessibility and predictable interaction

**Outcome:** People can identify purpose, understand content, recover from mistakes, and complete tasks without unnecessary memory or attention demands.

- Use familiar words, short sentences, descriptive headings, and concise blocks. Explain necessary specialist terms.
- Make the page purpose and primary next step evident. A visually dramatic hero should not force visitors to decode what the site offers.
- Keep navigation, help, control labels, and repeated patterns consistent across pages.
- Reduce simultaneous choices and competing calls to action. Progressive disclosure can reduce load when it does not hide essential information.
- Provide clear status and feedback. Do not rely on transient toast messages for consequential information.
- Avoid unexpected context changes on focus or ordinary input. Ask before destructive actions and make recovery possible.
- Support recognition instead of recall: visible labels, examples, saved progress, recently entered values, and step context.
- Avoid artificial urgency, aggressive countdowns, autoplay distractions, and interaction traps.
- Authentication should work with autofill, paste, password managers, and alternatives to puzzles or memorized transformations.
- Include people with cognitive and learning disabilities in usability research; WCAG does not cover every relevant need.

Sources: [W3C Making Content Usable for People with Cognitive and Learning Disabilities](https://www.w3.org/TR/coga-usable/), [WAI Clear and Understandable Content](https://www.w3.org/WAI/WCAG2/supplemental/objectives/o3-clear-content/), [WCAG 3.2 Predictable and 3.3 Input Assistance](https://www.w3.org/TR/WCAG22/).

### D13. Localization, bidirectionality, and content expansion

**Outcome:** The design works when language, writing direction, grammar, formatting conventions, and text length change.

- Reserve space for expansion rather than sizing components to English labels. Navigation, buttons, tabs, pricing cards, statistics, and form errors are common failure points.
- Let text wrap. Avoid fixed heights, manual line breaks, and label truncation unless the complete value is available and truncation is harmless.
- Use start/end and inline/block concepts in design annotations rather than left/right where the relationship should mirror.
- Treat RTL as a layout direction, not a canvas flip. Text flow, navigation sequence, progress, directional icons, tables, and mixed-direction content need contextual decisions; brand marks, media controls, clocks, and some data conventions may not mirror.
- Specify language and direction changes for quotations, names, user-generated content, and mixed-script fields.
- Use locale-appropriate dates, times, numbers, currency, names, addresses, plural rules, and sorting. Do not make every locale fit a US form model.
- Check fonts and line height with Arabic, Hebrew, Devanagari, Thai, CJK, accented Latin, and any actual target scripts.
- Keep translated accessible names, alt text, captions, errors, metadata, and document titles in scope; localization is not only visible body copy.

Sources: [W3C Internationalization: Structural Markup and RTL Text](https://www.w3.org/International/questions/qa-html-dir), [W3C Internationalization Techniques](https://www.w3.org/International/techniques/authoring-html), [WCAG 3.1 Readable](https://www.w3.org/TR/WCAG22/#readable).

### D14. Device geometry, safe areas, and transient viewport UI

**Outcome:** Essential content and controls remain visible when browser chrome, notches, rounded corners, keyboards, and viewport changes consume space.

- Keep essential controls inside safe visual and interactive regions while allowing decorative backgrounds to bleed outward.
- Add safe-area padding to edge-pinned headers, bottom bars, full-screen overlays, and media controls.
- Anticipate mobile browser toolbars expanding and collapsing. A “full viewport” hero should not jump, crop essential content, or hide its call to action.
- Anticipate the on-screen keyboard reducing or overlaying available space. Focused fields, instructions, errors, and submit controls need a usable route into view.
- Do not place controls flush against rounded corners, display cutouts, home indicators, or fold/hinge regions.
- Prefer content-height sections over forcing every section to a viewport height. Use viewport-filling treatment only when the content can safely fit at enlarged text and reduced height.
- Distinguish small, large, and dynamic viewport behavior in the design spec when a full-screen surface genuinely needs it.

Sources: [MDN CSS length and viewport-percentage units](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length), [MDN env() and safe-area insets](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/env), [MDN viewport meta](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport), [Apple Layout and Safe Areas](https://developer.apple.com/design/human-interface-guidelines/layout).

## 3. Engineering checks

These checks verify implementation. They should be kept separate from design categories so the skill does not mistake a polished specification for a working accessible page.

### E1. Viewport, reflow, and overflow

- Include `<meta name="viewport" content="width=device-width, initial-scale=1">`.
- Do not disable pinch zoom with `user-scalable=no` or restrictive `maximum-scale`.
- Verify no loss of content or functionality and no page-level two-dimensional scrolling at 320 CSS pixels wide for vertical content, corresponding to 400% zoom on a 1280 CSS pixel viewport. Test the horizontal-writing equivalent at 256 CSS pixels high.
- Verify text can resize to 200% without clipping, overlap, lost controls, or lost content.
- Override text spacing to WCAG test values: line height 1.5 times font size, paragraph spacing 2 times font size, letter spacing 0.12 times font size, and word spacing 0.16 times font size; verify no loss.
- Check narrow, short, wide, landscape, portrait, split-window, and intermediate widths rather than a fixed device list.
- Detect unintended horizontal overflow, including long URLs, code, unbroken identifiers, translated strings, SVGs, iframes, tables, transforms, and absolutely positioned decoration.
- Keep justified two-axis regions locally scrollable and labeled; do not make their overflow expand the page.

### E2. CSS responsiveness and component adaptation

- Use Grid, Flexbox, intrinsic sizing, relative units, `min()`, `max()`, and `clamp()` before adding many breakpoints.
- Use media queries for viewport/environment changes and container queries when a component should adapt to its allocated space.
- Define breakpoints from content failure, preferably in relative units, not device names.
- Do not use JavaScript user-agent or screen-width branching for layout that CSS can handle.
- Ensure source order remains meaningful; verify that `order`, grid placement, absolute positioning, and transformed layouts do not desynchronize visual, focus, and reading order.
- Do not lock orientation unless essential to the function.
- Test components in every container width they can actually receive, not only on full-page canvases.

### E3. Dynamic viewport units, safe areas, and keyboards

- Choose viewport units intentionally: `svh` for a stable “fits with browser UI visible” minimum, `lvh` for the largest viewport state, and `dvh` for live viewport changes. Provide appropriate fallback where supported browser scope requires it.
- Avoid unconditional `height: 100vh` on content-rich sections and forms. Prefer `min-height` and allow content growth.
- Apply `env(safe-area-inset-*)` padding where edge-pinned UI could be obscured. Confirm the viewport configuration supports the intended full-bleed behavior before relying on insets.
- Test bottom bars, dialogs, sheets, and focused form controls with the on-screen keyboard open on iOS and Android.
- Verify fixed and sticky regions do not consume the usable viewport at zoom or obscure keyboard focus.
- Test URL bar expanded/collapsed, standalone/PWA display if supported, landscape, and devices with cutouts or rounded corners.

### E4. Input modes and pointer behavior

- All functionality works with keyboard alone and with pointer input.
- No functionality or information is hover-only. Content revealed by hover/focus is dismissible, hoverable, and persistent as required by WCAG 1.4.13.
- Use `hover`, `any-hover`, `pointer`, and `any-pointer` only as capability enhancements, not as device identity.
- Click/tap targets meet WCAG 2.2 target-size requirements and the product’s larger default. Measure the actual hit region, not only the visible icon.
- Dragging has a non-drag alternative. Path-based and multipoint gestures have simple alternatives.
- Pointer cancellation is supported; destructive actions do not fire irreversibly on down-event.
- Visible labels match or are contained in accessible names for speech control.
- Device-motion features have conventional UI alternatives.

### E5. Keyboard and focus

- Reach every interactive element using expected keys; no keyboard traps.
- Tab and Shift+Tab order matches the meaningful visual/DOM order.
- Focus is always visible, not clipped, and not fully obscured by authored content.
- Test focus contrast against every background and state. Do not remove outlines without an equal or stronger replacement.
- Opening a modal or composite moves focus appropriately; closing it returns focus to a logical trigger or next location.
- Escape closes dismissible overlays where the established pattern calls for it.
- Avoid positive `tabindex`. Use `tabindex="0"` only to add an appropriate custom focus stop and `tabindex="-1"` for programmatic focus where needed.
- Custom widgets implement the applicable [ARIA Authoring Practices pattern](https://www.w3.org/WAI/ARIA/apg/patterns/) and are tested, not merely assigned a role.
- Focus does not cause submission, navigation, unexpected expansion, or another change of context.

### E6. HTML semantics and screen readers

- Use semantic HTML landmarks and sectioning elements: a unique main region, appropriate navigation regions, header/footer context, and forms/search where applicable.
- Give the document a descriptive, route-specific `<title>` and one clear primary heading; use headings to express hierarchy, not visual size.
- Use native buttons, links, inputs, selects, textareas, details/disclosure, lists, and tables when they fit.
- Every control exposes an accurate accessible name, role, value/state, and relationship.
- Distinguish repeated landmarks and controls with names that make sense in a landmarks or controls list.
- Images have context-appropriate `alt`; decorative images use `alt=""`; functional images name the action; complex images have an equivalent explanation.
- Data tables use proper headers and associations. Layout is never constructed with tables.
- Dynamic changes that require notification use restrained, correctly timed status/live-region patterns. Avoid announcing every visual update.
- Hidden content is actually removed from relevant interaction and accessibility trees; visually hidden content remains available when intended.
- Inspect the browser accessibility tree and test actual reading/navigation behavior. ARIA validity alone does not prove a usable screen-reader experience.

### E7. Navigation and interactive patterns

- A keyboard-visible skip link moves focus to main content.
- Navigation is usable at all widths with keyboard, touch, zoom, and screen reader.
- Current page or section is communicated programmatically and visually, not by color alone.
- Disclosure triggers are buttons with an exposed expanded state and a clear relationship to controlled content.
- Dialogs, drawers, menus, tabs, accordions, carousels, tooltips, and popovers follow established semantics and keyboard models.
- Hover/focus popups satisfy dismissible, hoverable, and persistent behavior.
- Sticky navigation and anchored headings account for scroll offset and focus visibility.
- Links have descriptive purpose in context; identical labels do not unexpectedly point to different outcomes.

### E8. Forms and authentication

- Every form control has a programmatically associated label; use `<label>` whenever applicable.
- Related radio buttons and checkboxes use `<fieldset>` and `<legend>` or an equally robust native grouping.
- Required state, format, constraints, and instructions are available before submission and not encoded only through color or an asterisk.
- Use correct `type`, `name`, `autocomplete`, `inputmode`, and where helpful `enterkeyhint`. Do not disable autocomplete without a defensible requirement.
- Native validation is used where it fits; server-side validation remains authoritative. Custom errors are programmatically associated and announced at an appropriate time.
- After failed submission, present an error summary, preserve values, move focus deliberately, and link errors to fields as appropriate.
- Success is clearly confirmed. Destructive or consequential submission supports review, reversal, or confirmation according to risk.
- Paste, password managers, and one-time-code autofill work. Authentication does not require solving, recalling, or transcribing information without an accessible alternative.
- Test mobile keyboard open, zoom, autofill, validation, loading, network failure, and resubmission.

### E9. Color, contrast, forced colors, and themes

- Measure all foreground/background pairs in rendered states: default, hover, focus, active, visited, selected, invalid, disabled, light, dark, and high contrast.
- Meet 4.5:1 for normal text and 3:1 for large text under WCAG definitions; meet 3:1 for required control/state indicators and meaningful graphics.
- Verify color is never the only means of conveying information.
- Test `forced-colors: active` on Windows. Use system color keywords and `forced-color-adjust` only with a concrete reason.
- Check operating-system contrast preferences where supported and ensure custom themes do not override user needs.
- Test text over every responsive image crop and every animation frame where the background changes.
- Verify focus indicators remain perceptible in all themes and forced colors.

### E10. Motion, media, and time

- Respect `prefers-reduced-motion: reduce`; remove or replace nonessential large movement, parallax, auto-scrolling, zoom, and looping animation.
- Do not depend on motion events or transition completion to expose essential content.
- Provide pause/stop/hide for qualifying automatic motion and updates.
- Test flashing content against WCAG thresholds; the simplest safe rule is to avoid flashing.
- Video has synchronized captions for meaningful audio, audio description or an allowed equivalent for meaningful visuals, and an accessible player. Provide transcripts according to the media use and user need.
- Audio does not autoplay unexpectedly; if it starts automatically for more than three seconds, a pause/stop or independent volume mechanism is available.
- Time limits can be turned off, adjusted, or extended unless a WCAG exception applies. Preserve entered work through expiry and re-authentication where possible.
- Carousels remain understandable with autoplay off and work through buttons and keyboard, not swipe alone.

### E11. Localization and RTL

- Set a valid `lang` on the document and language changes on passages where pronunciation rules change.
- Set page direction with HTML `dir`, not CSS. Use `dir="auto"` where user-entered mixed-direction content requires it.
- Use CSS logical properties and values for relationships that should mirror.
- Test actual RTL layout and mixed bidi text; do not rely on screenshot mirroring.
- Localize visible copy, accessible names, alt text, document titles, metadata, captions, errors, and live announcements.
- Use locale-aware formatting for dates, times, numbers, currencies, units, addresses, and names.
- Run pseudo-localization for expansion and diacritics, plus at least one real RTL locale if supported.
- Verify SVG icons, chevrons, timelines, charts, and progress direction individually; mirror only semantically directional assets.

### E12. Performance and resilience as inclusion

- Essential content and controls remain usable under slow networks, delayed fonts, missing images, and failed third-party embeds.
- Avoid loading behavior that causes focus loss, reading-order churn, or repeated announcements.
- Reserve space for media and embeds to reduce layout shifts that disorient users or move targets.
- Do not make a heavy animation, WebGL scene, or client-side router the only route to essential content.
- Preserve usable fallback text for portfolio media, embedded forms, maps, video, and third-party scheduling or payment widgets.
- Respect data and battery constraints: responsive images, deferred nonessential media, and a useful experience without autoplay are inclusive design decisions as well as performance work.

## 4. Testing strategy

Automation is useful but incomplete. A professional skill should require a small repeatable matrix rather than treating an audit score as proof.

### 4.1 At design review

- Review narrow, intermediate, wide, short-height, 200% text, 400% zoom/reflow, reduced-motion, forced-color, and RTL representations.
- Annotate canonical reading/focus order, accessible names, heading levels, landmarks, alternative text intent, errors, status announcements, and overlay focus behavior.
- Review every interactive state, not only pristine default screens.
- Include realistic long headings, names, navigation labels, form errors, translated strings, missing images, empty states, and dense project content.
- Confirm the page still has a clear promise, proof, and action when images, animation, color, and two-column composition are removed.

### 4.2 During implementation

- Run semantic HTML validation, linting, and an automated accessibility scanner in component previews and representative pages.
- Add focused regression tests for critical interaction semantics and keyboard behavior, especially disclosures, dialogs, forms, navigation, and carousels.
- Use responsive visual regression across a few failure-oriented viewports rather than a long device catalog.
- Check the accessibility tree and computed names/roles/states in browser developer tools.
- Run contrast checks on actual rendered states and themes.

### 4.3 Manual browser checks

- Keyboard-only: Tab, Shift+Tab, Enter, Space, arrows, Escape, and any documented widget keys. Confirm order, visibility, operation, dismissal, and return focus.
- Zoom and reflow: 200% text and browser zoom through 400%; test at 320 CSS pixel equivalent without page-level two-axis scrolling.
- User styling: WCAG text-spacing overrides, increased default font size, disabled images, and where relevant custom colors.
- Input: touch/coarse pointer, mouse/precise pointer, hover unavailable, and hybrid devices where possible.
- Preferences: reduced motion, forced colors/high contrast, light/dark color scheme, and increased contrast where supported.
- Mobile conditions: browser bars expanded/collapsed, virtual keyboard open, landscape, safe-area devices, slow connection, and interrupted/resumed form submission.
- Localization: pseudo-localized expansion, one long-word locale, one target non-Latin script, and RTL if supported.

### 4.4 Assistive-technology checks

- Test at least one common screen reader/browser combination on each supported desktop platform and the primary mobile screen reader for mobile-critical work. Browser and screen-reader combinations matter.
- Navigate by headings, landmarks, links, controls, and form fields; also read linearly. Confirm the experience is concise and the order is meaningful.
- Complete the real core task: find a project, understand the offer, open the menu, submit the lead form, recover from errors, and confirm success.
- Verify dynamic status, route changes, dialogs, menus, errors, and loading completion are announced without excessive chatter.
- Where the audience or product warrants it, test magnification, voice control, switch access, and users’ own assistive configurations.

### 4.5 Human evaluation

- Include disabled people in usability studies, particularly for novel motion, dense interaction, authentication, and high-stakes flows.
- Test outcomes and comprehension, not only criterion-by-criterion mechanics.
- Treat automated tools as issue detectors, manual expert review as conformance evidence, and user research as experience evidence.

Sources: [WAI Easy Checks](https://www.w3.org/WAI/test-evaluate/easy-checks/), [WAI Evaluating Web Accessibility Overview](https://www.w3.org/WAI/test-evaluate/), [WAI APG Read Me First](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/).

## 5. Recommended categories for the professional skill

Use the following compact taxonomy in the skill. It is broad enough to cover portfolios, websites, and landing pages without turning each WCAG criterion into a separate design category.

### Design categories

1. **Composition and transformation** — viewport behavior, adaptive layouts, content priority, meaningful sequence, and two-dimensional exceptions.
2. **Typography and reading** — scale, measure, wrapping, zoom, text expansion, hierarchy, and script coverage.
3. **Media and data** — responsive art direction, alternatives, captions, transcripts, audio description, charts, embeds, and layout stability.
4. **Navigation and wayfinding** — information architecture, responsive disclosure, current location, skip routes, and long-page navigation.
5. **Interaction and input** — target design, mouse/touch/keyboard/voice equivalence, hover, gestures, drag alternatives, and feedback states.
6. **Forms and task completion** — labels, grouping, input assistance, validation, error recovery, authentication, and success confirmation.
7. **Focus and non-visual structure** — focus experience, reading order, headings, landmarks, names, roles, states, and dynamic announcements.
8. **Color and perception** — contrast, non-color cues, themes, forced colors, focus visibility, and meaningful graphics.
9. **Motion, media control, and timing** — reduced motion, pausing, flashing safety, autoplay, carousels, time limits, and device-motion alternatives.
10. **Clarity and cognition** — plain language, predictability, reduced distraction, recognition over recall, consistent help, and reversible action.
11. **Localization and direction** — expansion, scripts, locale formats, RTL/bidi behavior, and semantically directional assets.
12. **Viewport environment** — safe areas, browser chrome, dynamic viewport height, virtual keyboards, cutouts, and short-height layouts.

### Engineering verification categories

1. **Reflow and responsive CSS**
2. **Viewport mechanics and safe areas**
3. **Keyboard, focus, and input modes**
4. **Semantic HTML, ARIA, and screen readers**
5. **Navigation and widget behavior**
6. **Forms, errors, and authentication**
7. **Contrast, themes, and forced colors**
8. **Motion, media alternatives, and timing**
9. **Localization, language, and RTL**
10. **Performance, resilience, and test coverage**

## 6. Cross-cutting rules

1. **Preserve the task, not the screenshot.** Change composition when space, zoom, language, or input changes; do not remove essential information or functionality.
2. **One meaningful order.** Source, reading, focus, and visual order should agree. Responsive styling must not create parallel narratives.
3. **Native before custom.** Prefer semantic HTML and platform behavior; custom widgets inherit keyboard, focus, semantics, and testing obligations.
4. **No single-sense or single-input dependency.** Color, sound, motion, hover, dragging, or precise pointing may enhance an experience but cannot be the only route.
5. **User settings outrank art direction.** Preserve zoom, text enlargement, reduced motion, forced colors, contrast preferences, language, direction, and browser defaults.
6. **Content defines breakpoints.** Adapt when relationships or readability fail, not at fashionable device widths.
7. **Text must be allowed to become inconvenient.** Wrapping, expansion, larger fonts, errors, and translated labels are normal states; the layout absorbs them.
8. **Focus is part of the composition.** It stays visible, ordered, unobscured, and deliberately managed through every overlay and route change.
9. **Accessibility includes the full state space.** Test loading, error, empty, success, disabled, selected, expanded, hover, focus, dark, forced-color, reduced-motion, and localized states.
10. **Automation cannot sign off experience.** Combine automated checks, manual keyboard/zoom review, real screen-reader tasks, and disabled-user evaluation for important work.
11. **WCAG is the floor.** Target WCAG 2.2 AA, use relevant AAA guidance where it materially improves the design, and supplement it with cognitive and platform guidance.
12. **When a visual idea conflicts with access, redesign the idea.** Accessibility is a quality constraint on the concept, not an alternate skin applied after approval.
