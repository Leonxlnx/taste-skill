# Moments

Deal one moment by default. A page of seven sections or more can take a second. Zero is a complete deal when the content supplies none. The entrance, reveals, hover feedback and motion inside own sections still work.

```sh
node <skill>/scripts/moments.mjs pick --page service --sections 7 --carry photos,steps --history .taste-skill/history.json
```

`--carry` describes the copy notes. Use `words` for a sentence or heading alternatives the brief already supplies, `list` for named items, `photos` for at least three photographs that show the claim, `steps` for a real sequence and `figures` for supplied measurements. An explicitly empty carry is empty. Without the flag, place, product and service assume photos. `--has` describes actual assets such as UI or film. `--long` keeps the long-page deal for older callers. `--count 1` re-deals one slot.

| Moment | Use it on | What the content supplies |
| --- | --- | --- |
| `photo-chapters` | A picture story | Three or four related photographs, each with a title and two lines. Desktop holds half a screen per chapter. On a phone each photograph flows above its words. |
| `pinned-chapters` | A process or product explanation | Two steps or short descriptions flow beside their frames. Longer sequences can pin on desktop. Phones show each step with its frame. |
| `picture-develops` | An existing section’s main picture | One clear subject from the carried photographs, at least half the container wide. Use the film look. |
| `window-parallax` | A wide picture already in the section | A photograph with room above and below its subject for a small crop. |
| `closing-lift` | The close | A closing photograph, line and action. Light text needs a calm, dark lower third. Use a solid reading band if the crop is bright. |
| `word-highlight` | An existing h2 or closing heading | `--carry words` and a statement of 12–40 words. Mark the heading itself or its text with `.mo-wh__text`. |
| `word-rotate` | One word inside an h1 or h2 | Two to four alternatives that belong in that heading. Keep the written word first. Refuse the part when the widest alternative changes the line count at 390px. Keep the pause button. |

Details outside the count are `lines-rise` on a heading, `marquee-row` for a named list and `liquid-hover` for a game or creative tool whose picture is the product.

By name in the brief only: `giant-type-pass`, `letters-assemble`, `iris-opens`, `line-carries-colour`, `liquid-type`, `cursor-spotlight`, `counter-rolls`, `headline-arrives`.

## Mount it

Follow the section or inline host in the plan’s demo. Give its `data-moment` element the ID and its `data-moment-opts` the demo’s JSON options. Link `assets/moments/<id>/moment.css` in the head. The starter’s `system.js` loads the modules. Outside the starter, load `assets/moments/moments.js` once as a module. Keep all words and pictures in the HTML.

A text moment rides on an existing heading at its section’s type scale. Put `data-moment="word-rotate"` on the inline word, not the whole heading. Only the page’s main claim may stand alone, once, with thin air. Keep a normal footer after a closing moment. Keep moments out of cards.

## Check every set piece

Film the live range at 1440 and 390. Keep one plain section between set pieces. Every frame preserves reading order, whole sentences and legible words. Check display type at 3:1 and body type at 4.5:1 against the pixels behind them. The effect must visibly change its host without moving the layout.

A stretch with less than 12% of the viewport different from the ground may last at most 0.15 screen. An empty panel in a second colour still counts as empty. Allow at most one screen of held scroll per chapter with its own picture or per 25 words. Reveal anything to read or buy within a quarter screen and 300 ms. Use the client’s picture where a picture carries the effect. Its crop and the material in the brief must meet the part’s needs.

Animate transforms, clips or opacity. Keep per-frame custom properties off elements with more than 20 descendants. Never animate top, height, width or a mask image in a set piece. Without script and under reduced motion, show the complete content in ordinary flow.
