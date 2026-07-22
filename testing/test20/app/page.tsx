import Image from "next/image";
import DiscloseImage from "../components/DiscloseImage";

const hero = "/assets/noma-h1-studio.png";

export default function Home() {
  return <>
    <a className="skip" href="#main">Skip to content</a>
    <header className="nav"><a className="wordmark" href="#top" aria-label="NOMA home">NOMA</a><nav aria-label="Primary"><a href="#sound">Sound</a><a href="#design">Design</a><a href="#details">Details</a></nav><a className="nav-action" href="#availability">Check availability</a></header>
    <main id="main">
      <section className="hero" id="top">
        <Image src={hero} alt="Matte graphite over-ear headphones on a cool gray studio plinth" fill priority sizes="100vw" />
        <div className="hero-scrim" />
        <div className="hero-copy"><h1>Listen past the room.</h1><p>H1 is an over-ear listening concept shaped around quiet focus, tactile controls, and an honest material palette.</p><a className="primary" href="#sound">Explore the listening design</a></div>
      </section>

      <section className="opening" id="sound"><h2>The room falls back.</h2><div><p>H1 starts with a simple aim: make attention easier to hold. The closed-back form, deep cushions, and close controls are arranged to reduce interruption without turning listening into a technical exercise.</p><p>This launch page presents a design concept. Final acoustic specifications and production details have not been announced.</p></div></section>

      <section className="architecture"><div className="ring" aria-hidden="true"><span /></div><div><h2>Built from the ear outward.</h2><p>The cup geometry follows the space around the ear. A suspended inner frame separates the listening chamber from the outer shell, while the broad yoke keeps adjustment direct and visible.</p><ul><li>Closed over-ear architecture</li><li>Replaceable contact cushions</li><li>Physical listening controls</li></ul></div></section>

      <section className="soundstage"><div className="stage-copy"><h2>One object. Every angle.</h2><p>The reveal keeps the product itself as the evidence. Open and close the studio view to examine the headband, yoke, cushion depth, and machined cup surface.</p></div><DiscloseImage src={hero} alt="Studio view of the H1 headphone concept" /></section>

      <section className="quiet"><div><h2>Quiet without the theater.</h2><p>The interface avoids glowing modes and status spectacle. A single press moves between listening states; a long press returns ambient sound. Exact cancellation performance will be published only after production testing.</p></div><div className="control-demo"><button type="button" aria-pressed="false">Listening mode</button><p>Physical control concept shown at full scale.</p></div></section>

      <section className="materials" id="design"><h2>Materials you can read by touch.</h2><div className="material-grid"><article><div className="swatch aluminum"/><h3>Brushed aluminum</h3><p>A cool, directional finish makes the cup orientation legible before it catches the light.</p></article><article><div className="swatch textile"/><h3>Woven acoustic cloth</h3><p>The inner surface stays soft and matte, visually separating the chamber from the shell.</p></article><article><div className="swatch cushion"/><h3>Soft contact cushion</h3><p>A broad profile distributes contact around the ear rather than pressing on it.</p></article></div></section>

      <section className="wear"><div className="wear-copy"><h2>Designed for the long side.</h2><p>The headband widens where it meets the crown, the yokes rotate without exposed rails, and touch points are intended to be serviceable rather than permanent. Final weight and fit range remain subject to validation.</p></div><blockquote>Comfort is treated as part of the acoustic system, not an accessory to it.</blockquote></section>

      <section className="details" id="details"><h2>What is defined now.</h2><dl><div><dt>Format</dt><dd>Wireless, closed over-ear concept</dd></div><div><dt>Controls</dt><dd>Physical crown and listening-mode key</dd></div><div><dt>Connection intent</dt><dd>Wireless listening with wired fallback</dd></div><div><dt>Finish direction</dt><dd>Graphite metal, charcoal cushion, dark textile</dd></div></dl><p>Codec support, battery duration, driver measurements, weight, price, and ship date are intentionally omitted until verified.</p></section>

      <section className="package"><div className="package-shape" aria-hidden="true"/><div><h2>Less in the box.</h2><p>The packaging direction uses a fitted fiber shell and a compact cable envelope. No display layers, plastic window, or decorative insert is planned for this concept.</p></div></section>

      <section className="availability" id="availability"><h2>Hear what comes next.</h2><p>NOMA H1 is a product-launch design study, not a purchasable product. Pricing, release timing, retail availability, and final specifications still require a real product program.</p><a className="primary light" href="mailto:studio@example.com?subject=NOMA%20H1%20concept">Ask about the concept</a></section>
    </main>
    <footer><a className="wordmark" href="#top">NOMA</a><p>This independent concept uses generated product imagery and makes no claim of current manufacture or sale.</p><a href="mailto:studio@example.com">Contact</a></footer>
  </>;
}
