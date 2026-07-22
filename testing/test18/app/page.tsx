"use client";

import Image from "next/image";
import { BouncyAccordion } from "../components/bouncy-accordion";

const works = [
  ["Threshold", "A line of amber light redraws the room as visitors move across it."],
  ["Afterimage", "Slow pulses turn perception into the exhibition’s second surface."],
  ["Common Field", "Reflected light gathers architecture and audience into one image."],
];

export default function Home() {
  return <main>
    <nav><a className="wordmark" href="#top">Lumen</a><div><a href="#works">Works</a><a href="#visit">Visit</a></div></nav>

    <header id="top" className="hero"><h1>Light becomes <br />the material.</h1><p>A spatial study in glow, reflection, duration, and the bodies that move between them.</p><a className="arrow" href="#image" aria-label="Continue to exhibition image">↓</a></header>

    <section id="image" className="image-stage"><Image src="/assets/light-installation.png" alt="Conceptual amber light installation crossing a dark concrete gallery" fill priority sizes="100vw" /><p>Light is not used to reveal the work. Light is the work.</p></section>

    <section className="statement"><h2>When illumination leaves the ceiling, the whole room changes.</h2><p>This concept exhibition treats brightness, shadow, haze, and reflection as physical elements. Each encounter is shaped by distance and time.</p></section>

    <section id="works" className="works"><div><h2>Three studies<br />in perception</h2><p>Open a work to read its spatial premise.</p></div><BouncyAccordion items={works.map(([title, description]) => ({ id: title.toLowerCase(), title, description }))} /></section>

    <section className="field"><div className="orb" /><blockquote>“The eye adjusts. The room answers.”</blockquote></section>

    <section className="sequence"><h2>A score for the senses</h2><div className="steps"><p><span>Enter</span>Let darkness establish the edges.</p><p><span>Attend</span>Notice color collect on surfaces.</p><p><span>Return</span>See what remains after looking away.</p></div></section>

    <section className="material"><p>Air</p><p>Glass</p><p>Concrete</p><p>Light</p></section>

    <section className="essay"><h2>An exhibition without a fixed image</h2><p>No single viewpoint completes a light work. The installations unfold as the visitor approaches, crosses, and leaves. Photography can document their outline; presence supplies their scale, duration, and atmosphere.</p></section>

    <section id="visit" className="visit"><h2>Come after dark.</h2><p>This is a fictional exhibition concept created as a design study. Venue, dates, artists, and ticketing are intentionally unstated.</p><a href="mailto:studio@example.com">Contact the studio ↗</a></section>

    <footer><p>Lumen — exhibition concept</p><a href="#top">Back to light ↑</a></footer>
  </main>;
}
