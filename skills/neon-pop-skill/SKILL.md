---
name: neon-pop-giftshop-ui
description: Loud playful ecommerce interfaces built from neon colour blocking, rounded modular grids, bubble typography, sticker-like product cutouts, mascot energy, and toy-like brand systems. For youth-led beauty, skincare, gift shops, candy brands, playful DTC ecommerce, and Gen Z landing pages that need to feel maximalist, joyful, collectible, and instantly shoppable.
---

# SKILL: Neon Pop Giftshop UI

## 1. Skill Meta
**Name:** Neon Pop Giftshop Interface Engineering
**Description:** Advanced proficiency in architecting playful ecommerce interfaces that synthesize toy packaging, sticker sheets, pop-art graphics, and youth-led beauty retail. This discipline requires mastery over saturated colour blocking, rounded modular panels, thick black dividers, bubble typography, floating product cutouts, mascot-like icons, and oversized promotional messaging. The objective is to construct digital shops that feel joyful, highly branded, collectible, and immediately shoppable, deliberately discarding minimalist luxury, corporate SaaS polish, brutalist severity, and muted wellness aesthetics.

## 2. Visual Archetypes
The design system operates by merging two compatible visual paradigms. **Pick ONE dominant mode per project and commit to it. Do not alternate between unrelated visual languages within the same interface.**

### 2.1 Neon Gift Shop Grid
Derived from playful ecommerce homepages, toy catalogues, sweet-shop displays, and pop-up retail signage.
* **Characteristics:** Bright modular panels, large rounded corners, thick black borders, vertical brand sidebars, oversized sale messaging, category rows, product cutouts, sticker shapes, and high-contrast colour blocking.

### 2.2 Sticker Pop Campaign
Derived from collectible stickers, stationery graphics, bubble lettering, mascot packaging, and Y2K product campaigns.
* **Characteristics:** Starbursts, smileys, blob shapes, chunky outlined typography, offset colour shadows, floating products, playful scale shifts, and campaign tiles that feel like digital posters.

## 3. Typographic Architecture
Typography is playful, chunky, and commercial. It must carry personality while keeping products, categories, and promotions immediately readable.

### 3.1 Hero Typography
* **Classification:** Rounded display sans / bubble type / cartoon-heavy sans.
* **Optimal Web Fonts:** Cooper Black, Fredoka, Baloo 2, Luckiest Guy, Chewy, DynaPuff, Bricolage Grotesque.
* **Implementation Parameters:**
  * **Scale:** Large and expressive, often occupying 30–60% of a panel.
  * **Weight:** Extra bold or black.
  * **Tracking:** Neutral to slightly tight.
  * **Leading:** Tight but readable, usually `0.85` to `1.05`.
  * **Casing:** Lowercase preferred for friendliness; uppercase reserved for badges or urgent sale copy.
  * **Effects:** Thick black outlines, offset shadows, duplicated colour layers, sticker strokes, or comic-style depth.

### 3.2 Navigation and Category Type
* **Classification:** Rounded sans-serif / friendly geometric sans.
* **Optimal Web Fonts:** Fredoka, Nunito Sans, Rubik, Baloo 2, Gabarito.
* **Implementation Parameters:**
  * **Scale:** Large enough to feel tactile and tappable.
  * **Weight:** Bold to extra bold.
  * **Leading:** Comfortable, `1.1` to `1.25`.
  * **Casing:** Mostly lowercase.
  * **Usage:** Category labels, menu rows, product groups, sale banners, shipping badges.

### 3.3 Supporting Text
* **Classification:** Simple rounded sans or casual mono.
* **Optimal Web Fonts:** Nunito Sans, Rubik, Space Mono, DM Sans.
* **Implementation Parameters:** Use small, clear, short text for dates, subtitles, product labels, promo details, and utility copy. Keep tone direct, friendly, and punchy.

## 4. Colour System
The colour architecture is saturated, synthetic, and deliberately clashing. Colours should feel like toy packaging, stickers, beauty products, and candy wrappers.

**CRITICAL: Use bright solid colour fields. Avoid muted neutrals, beige editorial systems, luxury monochrome, and subtle wellness palettes.**

### Core Palette
* **Electric Yellow:** `#F9FF00`, `#FFF200`
* **Hot Pink:** `#FF00B8`, `#FF4FC3`
* **Toy Green:** `#20C928`, `#37D633`
* **Sky Cyan:** `#20C7F4`, `#33D6FF`
* **Candy Purple:** `#9B6CFF`
* **Bubblegum Pink:** `#FF9AD9`
* **Ink Black:** `#050505`

### Colour Rules
* Use solid panel backgrounds rather than gradients.
* Use black for outlines, text, dividers, and graphic emphasis.
* Let neighbouring panels clash boldly.
* Neon yellow often works best as the dominant campaign colour.
* Green works well for navigation/category zones.
* Pink, cyan, and purple work well for stickers, blobs, product areas, and accents.

## 5. Layout and Spatial Engineering
The layout must feel like a playful modular shop window. It rejects generic ecommerce templates in favour of poster-like compartments.

* **Rounded Modular Grid:** Strict use of CSS Grid with thick black dividers or black gaps. Panels should have large rounded corners, usually `24px` to `44px`.
* **Visible Compartmentalisation:** Major areas are separated by `2px` to `4px` black borders. Each panel acts as a self-contained campaign tile, category tile, or product zone.
* **Sidebar Identity Strip:** A vertical brand strip is strongly encouraged. It may contain a hamburger menu, vertical wordmark, mascot mark, smiley icon, or utility controls.
* **Product-Led Composition:** Product cutouts float, rotate, overlap colour blobs, and bleed slightly into corners. Product imagery should feel glossy, tactile, toy-like, and collectible.
* **Promotional Hierarchy:** Sale messages and gift-shop headlines should dominate. Supporting text stays short and secondary.

## 6. UI Components and Symbology
Standard ecommerce components are transformed into playful brand objects.

* **Category Rows:** Large tappable rows with bold lowercase labels, small product icons, and strong dividing lines.
* **Sticker Graphics:** Stars, smileys, sparkles, blobs, rounded square mascots, squiggles, burst badges, and chunky arrows.
* **Product Cutouts:** Isolated product renders or illustrations with transparent backgrounds, soft shadows, playful rotation, and exaggerated scale.
* **Buttons and Badges:** Chunky, rounded, high-contrast, often black-filled with white text for callouts such as “free shipping”.
* **Copy Fragments:** Short, playful ecommerce phrases like “big lil gift shop”, “30% off everything”, “bestsellers”, “bundles”, “skincare”, “new drops”, and “the place to find everything for your bffs”.

## 7. Texture and Depth
The interface should feel clean and digital, but tactile enough to resemble product packaging or a sticker sheet.

* **Allowed Effects:** Chunky text shadows, offset duplicate text layers, thick black strokes, sticker outlines, soft product shadows, glossy 3D product rendering, bright blobs, and simple poster-like layering.
* **Avoid:** Grunge, CRT scanlines, halftone degradation, military markings, blueprint textures, harsh industrial noise, glassmorphism, subtle SaaS gradients, and sharp brutalist boxes.

## 8. Web Engineering Directives
1. **Grid Construction:** Use `display: grid` with black gaps or borders to create the graphic divided layout.
2. **Rounded Panels:** Build each area as a large rounded panel with its own saturated background, product objects, copy, and decorative shapes.
3. **Sticker Typography:** Use CSS text strokes and offset shadows where supported:
   ```css
   -webkit-text-stroke: 2px #000;
   text-shadow: 4px 4px 0 #20C928;
   ```
