# Expressive pages

The dealer decides when a page may have character; the kit holds the parts; the gate counts the limits.

## The temper

`start.mjs plan --brief "<the brief's words>"` deals `temper: quiet | lively | loud`, prints it with its reason and
writes it to `plan.json`; `--temper` overrides. In order: the client's words for a quiet look (calm, premium, minimal,
serious) win; then loud words (punk, metal, retro, arcade, pixel, 8-bit, horror) or lively ones (fun, cute, cosy,
mascot, kids, toy, snack, drink, music, merch); then the kind (a game is lively unless it is a sober strategy game; an
app with a mascot or streaks and a drink, snack, toy or apparel brand are lively; a place or service stays quiet);
then supplied pixel, drawn or painted art moves a game one step toward loud. Quiet keeps every rule as written.

Set `<html data-temper="lively|loud">` and enable the `expressive.css` line in `starter.html`.

## The source rule

Every expressive move names its source in the game or brand on the plan comment: `torn edge: the game's menus are
paper`. No source, no move. One world runs through the page; the buy button and the reading order never move.

## What a lively or loud page may do

| Move | Limit |
|---|---|
| A display face from the expressive set at its own weight | capitals only on h1 and h2 in a face drawn for them, 24px up |
| An h1 to 160px; the name as `data-lettering` (shadow, outline, reflect) | two off-scale words: the hero and the close |
| The world's art across the hero to the screen edge, not in a card | the name on a plate |
| Colours from the art or brand | four flat grounds; the action colour is the only button fill |
| Frames from the world: dialogue box, ornament frame, field document | one material a page |
| One edge between grounds, `<html data-edge>` | one kind a page |
| Crossing art, `data-crossing` | one a boundary, `aria-hidden`, never over text, a control or a price |
| Stickers, `data-sticker` with `--tilt` | 8 degrees, two a screen, off controls, words repeated as real text |
| A button family, `data-buttons` push, bevel, ribbon or offset | one a page, 44px, a verb and an object |
| A mascot or cast | may act in each section; never on payment or dense data |
| One texture, `<html data-texture>` | 5 to 7%, still; it is the page's one effect |
| Plates, `data-plate` | how text sits on busy art |
| The voice one step further | never on the price, a form or an error |

## What no page may do

- Move, rename or restyle the main action between nav, hero, phone bar and close.
- Set reading text (body, answers, prices, labels, errors) in a pixel, hand, blackletter, condensed or arcade face, or
  in capitals.
- Put text on busy art without a plate, or art over text, a control or a price.
- Turn a paragraph or a control, turn anything on hover or in 3D, or show more than two turned things on a screen.
- A marquee of adjectives, a self-advancing carousel, scroll-jacking, a pinned section that only animates words;
  two drawing styles, or a stand-in photograph in a drawn world.
- Monospace uppercase kickers, an invented violet gradient, glass panels, a banned face; a pixel face off its grid;
  invented awards, laurels, scores or press quotes.

A loud game can place one short label above a heading, set in the display face and drawn as a tag from that world (`data-sticker="tag" data-world-tag`). Name the source in the plan. Quiet and lively pages leave it out.

Lively pages use the same still, fade and rise hero deck as quiet pages. Loud pages may add set-type, line-blocks or one line rise. At every temper, keep controls and icons in place on hover. Change colour or underline and reserve the small press for activation.

## A scene the player can try

Without a trailer, the strongest hero picture can be a small scene from the game. Show one action and its consequence inside a framed canvas with its pause button in the corner. A click or keyboard activation hands control to the player. Start with a complete still beneath the canvas and keep it for reduced motion or when script is unavailable.

## Picking the type

A lively or loud deal gives two expressive pairings and one plain one as the exit; brief words such as pixel, arcade,
cosy, drink or horror bring the matching face forward. Pixel faces (Pixelify Sans, Silkscreen, Press Start 2P, VT323, Jacquard 12) print `--display-grid`, and sizes
snap to it; capital faces (Anton, Big Shoulders Display, Saira, Bungee, Silkscreen) print `--display-case`. Rounded,
slab, hand and blackletter faces and Courier Prime as a document voice complete the set. Paragraphs stay in the text
face at 400.

## The kit parts

`assets/expressive/` (`demo.html` shows each on light and dark grounds): `sticker`; `edge` (pixel, torn, wave,
scallop, saw, diagonal); `dialogue-box` (name tab, a caret that blinks four times); `collectible` (name bar, art
window, type line, stat chips, flavour line, set number, optional keyboard-operated reverse); the `push`, `bevel`, `ribbon` and `offset` buttons;
`lettering`; `texture` (scanlines, grain, dither); `plate`; `crossing`; `sprite-strip` (`steps(n)`, three plays, again
on hover or focus); `field-document` (typed fields, one stamp); `ornament-frame` (rivet, corner, filigree).

## Three directions

**A pixel-art fishing game, loud.** Pixelify Sans on its 8px grid, Figtree below; the sea drawn in pixels in one
palette; a pixel edge (the game's tiles), the fish as collectibles, the keeper's line in a dialogue box, one sticker
for the release month, push buttons (the menu buttons press). Scanlines only if the game has a CRT mode.

**A loud canned drink.** Anton or Big Shoulders in capitals, Work Sans or Hanken Grotesk below; the can's colours as
up to four grounds, grain from its print, two stickers from the label, a ribbon or push button. Jokes stay off the
price and the order form.

**A cosy mascot app, lively.** Fredoka, Nunito Sans below; the mascot does each section's action; push buttons, a
scallop or wave edge, a dialogue box for its line. No texture, no capitals.
