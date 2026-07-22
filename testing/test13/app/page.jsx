import DiscloseImage from "../components/disclose-image";

const projects = [
  ["Sound House", "A sheltered court cuts the wind while every room keeps a long view to water."],
  ["Reef Rooms", "Three masonry volumes step down a granite ledge without flattening its profile."],
  ["Dune Workshop", "A light timber frame sits above root zones and lets sand move beneath it."],
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top">Tidemark</a>
        <nav aria-label="Primary navigation"><a href="#work">Work</a><a href="#method">Method</a><a href="#contact">Contact</a></nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy"><h1>Building beside the tide.</h1><p>We design houses and civic rooms for exposed shores, where salt, wind, rock, and changing water are part of the brief.</p><a className="text-link" href="#work">View coastal work <span aria-hidden="true">↘</span></a></div>
        <figure className="hero-image"><img src="/coastal-house.png" alt="Low concrete and timber house embedded in a rocky coast at dawn" /><figcaption>A study in shelter, weathering, and a long horizon.</figcaption></figure>
      </section>

      <section className="intro section-rule"><h2>The shore is the first drawing.</h2><div><p>Before form, we read swell, wind, salt paths, habitat, access, and the way a site changes between high and low water.</p><p>Architecture follows those forces. Walls become shelter. Openings frame durable light. Materials are chosen for what they become after twenty winters.</p></div></section>

      <section className="work" id="work"><h2>Three ways to hold the coast.</h2><div className="project-list">{projects.map(([name, text]) => <article key={name}><h3>{name}</h3><p>{text}</p></article>)}</div></section>

      <section className="material section-rule"><div><h2>Materials that improve in weather.</h2><p>We specify assemblies that can be inspected, repaired, and understood. Exposed concrete takes the mark of rain. Timber silvering is treated as a finish, not a defect. Metalwork is detailed to drain and dry.</p></div><dl><div><dt>Structure</dt><dd>Protected mass where storms strike hardest</dd></div><div><dt>Skin</dt><dd>Ventilated timber and mineral surfaces</dd></div><div><dt>Edges</dt><dd>Deep reveals and replaceable sacrificial parts</dd></div></dl></section>

      <section className="tide-plan"><h2>A building changes with the water.</h2><div className="tide-grid"><div className="diagram" aria-label="Abstract tidal section diagram"><span className="horizon" /><span className="house-shape" /><span className="water-line" /></div><p>We draw the same threshold at several tides and in several storms. The result is not a sealed object beside nature, but a legible sequence from road to rock, dry room to wet edge.</p></div></section>

      <section className="image-study section-rule"><div><h2>Look closely at the threshold.</h2><p>The project image opens like a pair of storm shutters. Tap it to study how concrete meets timber and how the floor holds above the tidal shelf.</p></div><DiscloseImage src="/coastal-house.png" alt="Coastal house showing concrete base, timber screen, and protected glazing" /></section>

      <section className="method" id="method"><h2>Work starts outdoors.</h2><ol><li><strong>Walk.</strong><span>We visit at more than one tide and record exposure, access, drainage, vegetation, and borrowed views.</span></li><li><strong>Test.</strong><span>Models compare shelter, section, and structural spans before rooms are fixed.</span></li><li><strong>Detail.</strong><span>Junctions are resolved around water, replacement, and the hands that will build them.</span></li></ol></section>

      <section className="habitat section-rule"><blockquote>“Leave the coast more legible than we found it.”</blockquote><div><h2>Habitat is part of the plan.</h2><p>Found ground is kept where possible. New paths are narrow. External light stays low and warm. Planting works with local salt and wind rather than against them.</p></div></section>

      <section className="long-life"><h2>Design for the second winter.</h2><div className="columns"><p>A coastal building earns trust slowly. We prioritize clear drainage, accessible fixings, robust thresholds, and maintenance notes that belong to the architecture.</p><p>This is quiet work: fewer concealed layers, fewer irreplaceable finishes, and no detail that depends on perfect weather to survive.</p></div></section>

      <section className="contact" id="contact"><h2>Bring us a difficult edge.</h2><div><p>For homes, small public buildings, and landscape rooms on exposed coastal sites.</p><a href="mailto:studio@example.com">studio@example.com</a><small>Prototype contact address — replace before publication.</small></div></section>
      <footer><a className="brand" href="#top">Tidemark</a><p>Coastal architecture, drawn from the waterline.</p><a href="#top">Back to top ↑</a></footer>
    </main>
  );
}
