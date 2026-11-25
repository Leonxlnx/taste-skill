# Expressive kit

For a lively or loud page only (`<html data-temper="lively|loud">`, `references/expressive.md`). Link `expressive.css`
after the kit's stylesheets; every part reads without script. `demo.html` shows each part on a light and a dark ground
(`?buttons=`, `?edge=` and `?texture=` switch the families).

- `sticker`: `<span data-sticker[="round|tag|stamp"] style="--tilt: -4deg" aria-hidden="true">2 to 4 words</span>`, 8 degrees at most, two a screen, its words repeated nearby; `data-at="top right"` puts it on a picture's corner.
- `edge`: `<html data-edge="pixel|torn|wave|scallop|saw|diagonal">`, one a page, drawn in each changed ground's colour above it.
- `dialogue-box`: `<div data-dialogue[="pixel"]><span data-dialogue-name>Name</span><p>…</p></div>`, the caret blinks four times.
- `collectible`: `<article data-collectible>` with `.ex-name > h3 + .ex-set`, `.ex-art`, `.ex-type`, `ul.ex-stats`, `.ex-flavour`.
- `push`, `bevel`, `ribbon`, `offset`: `<html data-buttons>` values for the kit's `.btn` pair, one a page.
- `lettering`: `data-lettering="shadow|outline|reflect"` (reflect needs `data-text`) on the hero's h1 and the close's word, two a page.
- `texture`: `<html data-texture="scanlines|grain|dither">`, one still layer under the nav.
- `plate`: `<span data-plate>` behind each line of text on busy art, or `data-plate="panel"`.
- `crossing`: `<span data-crossing="top|bottom" style="--crossing-x: 62%" aria-hidden="true"><svg>…</svg></span>` as a section's child, one a boundary.
- `sprite-strip`: `<span data-sprite style="--sheet: url(…); --frames: 3; --frame-w: 10; --frame-h: 14">` inside a `[data-sprite-host]`.
- `field-document`: `<div data-field-doc>` with a `dl` of typed fields and one `data-sticker="stamp"`.
- `ornament-frame`: `<div data-ornament="rivet|corner|filigree">`, one material a page.

A collectible can put its reverse in `details.ex-flip`. Its summary turns the card by click, tap, Enter or Space and returns to the front. See the tea cards in `demo.html`.
