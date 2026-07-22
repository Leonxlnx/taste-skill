import DiscloseImage from "../components/DiscloseImage";

const pieces = [
  ["01", "Low Chair", "Oiled oak / carved seat"],
  ["02", "Trestle Table", "Ash / wedged tenons"],
  ["03", "Bedside", "Elm / hand-cut drawer"],
];

export default function Page() {
  return <main>
    <header className="nav"><a href="#top" className="wordmark">COMMON FIELD</a><nav><a href="#work">Work</a><a href="#making">Making</a><a href="#contact">Contact</a></nav></header>

    <section className="hero" id="top">
      <div className="heroCopy"><h1>Objects for daily use.</h1><p>Furniture designed slowly, made in solid timber, and intended to gather the marks of ordinary life.</p><a className="arrow" href="#work">See selected work <span>↓</span></a></div>
      <DiscloseImage src="/assets/sculptural-oak-chair.png" alt="Sculptural solid-oak lounge chair in a quiet plaster studio" />
    </section>

    <section className="statement"><p>Common Field is an independent furniture practice. Each object begins with proportion, touch, and the honest limits of a material.</p></section>

    <section className="work" id="work"><h2>Selected objects</h2><div className="workList">{pieces.map(([,name,material]) => <article key={name}><h3>{name}</h3><p>{material}</p><b>View object →</b></article>)}</div></section>

    <section className="feature"><div><h2>The Low Chair</h2><p>A broad back carries the shoulders while the carved seat keeps the posture easy. Exposed joints show how the loads travel through the frame.</p></div><figure><img src="/assets/sculptural-oak-chair.png" alt="Low Chair showing its broad oak back and exposed joinery"/><figcaption>Study in oak. Dimensions and availability supplied on request.</figcaption></figure></section>

    <section className="materials"><h2>Material decides the form.</h2><div><p>Oak is selected for strength and open grain. Ash allows lighter structures. Elm is kept for surfaces where its shifting figure can remain visible.</p><p>Natural oil leaves the timber repairable. Small variations in tone, grain, and movement belong to the object rather than counting against it.</p></div></section>

    <section className="process" id="making"><h2>From board to room</h2><ol><li><strong>Measure</strong><p>The room, posture, use, and available material set the first constraints.</p></li><li><strong>Model</strong><p>Full-scale mockups resolve reach, balance, and the pressure of an edge.</p></li><li><strong>Make</strong><p>Joinery is cut, fitted, and finished for repair rather than concealment.</p></li></ol></section>

    <section className="care"><blockquote>Good furniture should become less precious as it becomes more personal.</blockquote><div><h2>Care and repair</h2><p>Oil can be renewed, dents can be steamed, and joints can be serviced. Care instructions accompany commissioned work; repair questions are welcome throughout an object’s life.</p></div></section>

    <section className="commission"><h2>Commissioning</h2><div><p>Projects start with a conversation about the room, intended use, dimensions, material, and timing. A written proposal follows before design work begins.</p><a href="mailto:studio@example.com">Describe your project →</a></div></section>

    <section className="contact" id="contact"><h2>Make room for one good object.</h2><p>This is an independent portfolio concept. Replace the placeholder email with the studio’s real address before publication.</p><a href="mailto:studio@example.com">studio@example.com</a></section>

    <footer><span>Common Field</span><span>Independent furniture studio</span><a href="#top">Back to top ↑</a></footer>
  </main>;
}
