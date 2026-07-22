import DiscloseImage from "../components/disclose-image";

const findings = [
  ["Boot chain", "Trace trust from immutable ROM through signed updates and recovery paths."],
  ["Management plane", "Map every listener, service account, and maintenance interface before testing reachability."],
  ["Supply path", "Compare shipped components, update artifacts, debug access, and third-party firmware boundaries."],
  ["Failure behavior", "Observe what survives degraded clocks, dropped packets, partial writes, and unexpected resets."],
];

export default function Home() {
  return <main>
    <nav aria-label="Primary navigation">
      <a className="brand" href="#top" aria-label="Vector Field home"><span aria-hidden="true">VF</span> Vector Field</a>
      <div className="nav-links"><a href="#method">Method</a><a href="#systems">Systems</a><a href="#contact">Contact</a></div>
    </nav>

    <header id="top" className="hero">
      <div className="hero-copy">
        <h1>See the attack surface.</h1>
        <p>Vector Field is an independent cybersecurity research lab. We examine the hardware, firmware, protocols, and operational assumptions that sit beneath a product’s security claims.</p>
        <a className="primary" href="mailto:research@vectorfield.example?subject=Research%20scope">Discuss a research scope</a>
      </div>
      <div className="hero-media">
        <DiscloseImage src="/assets/network-lab-macro.png" alt="Open network appliance under probe on an electronics lab bench" />
        <p className="caption">Representative laboratory setup generated for this concept; it does not depict a completed engagement or a specific vendor’s equipment.</p>
      </div>
    </header>

    <section className="thesis" aria-labelledby="thesis-title"><h2 id="thesis-title">Security changes when the object is opened.</h2><p>Product diagrams usually stop at the enclosure. Our work starts there: following boot media, buses, radio paths, update mechanisms, and administrative interfaces until the real trust boundaries are visible.</p></section>

    <section id="systems" className="systems" aria-labelledby="systems-title"><h2 id="systems-title">One system, four lines of inquiry.</h2><div className="finding-grid">{findings.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>

    <section className="map" aria-labelledby="map-title"><div><h2 id="map-title">The enclosure is not the boundary.</h2><p>A credible model includes who can touch the device, what shares its network, where updates originate, how secrets enter manufacturing, and what operators can override after deployment.</p></div><div className="boundary" role="img" aria-label="A system boundary model connecting operator, network, firmware, hardware, and supplier"><span>Operator</span><span>Network</span><strong>Product</strong><span>Firmware</span><span>Supplier</span><span>Hardware</span></div></section>

    <section id="method" className="method" aria-labelledby="method-title"><h2 id="method-title">Research that leaves a trail.</h2><ol><li><strong>Model</strong><span>Define assets, adversaries, access assumptions, and safety limits with the product team.</span></li><li><strong>Measure</strong><span>Capture reproducible evidence from interfaces, traffic, binaries, and physical behavior.</span></li><li><strong>Challenge</strong><span>Test the shortest credible paths across trust boundaries without overstating impact.</span></li><li><strong>Transfer</strong><span>Deliver steps, artifacts, uncertainty, and remediation context engineers can use.</span></li></ol></section>

    <section className="evidence" aria-labelledby="evidence-title"><h2 id="evidence-title">Evidence before severity.</h2><blockquote>“Interesting” is not a finding. A finding needs a reachable condition, observable impact, reproducible steps, and an honest account of what remains unproven.</blockquote><p>We separate observation from inference, note environmental constraints, and retain enough detail for an independent engineer to repeat the work.</p></section>

    <section className="domains" aria-labelledby="domains-title"><h2 id="domains-title">Where we look.</h2><dl><div><dt>Embedded systems</dt><dd>Bootloaders, update chains, debug paths, storage, buses, and secure elements.</dd></div><div><dt>Network products</dt><dd>Protocol parsing, segmentation assumptions, management services, and control planes.</dd></div><div><dt>Identity infrastructure</dt><dd>Enrollment, credential lifecycle, recovery, device trust, and delegated administration.</dd></div><div><dt>Connected operations</dt><dd>Fleet tooling, telemetry, remote maintenance, logging, and failure recovery.</dd></div></dl></section>

    <section className="limits" aria-labelledby="limits-title"><h2 id="limits-title">What this concept does not claim.</h2><p>This regression site describes a research approach, not accreditation, certifications, customers, vulnerability discoveries, response times, or laboratory capacity. Those claims require real organizational evidence and have intentionally been omitted.</p></section>

    <section className="outputs" aria-labelledby="outputs-title"><h2 id="outputs-title">What a handoff can contain.</h2><div><p><strong>Reproduction notes</strong><br/>Exact preconditions, equipment, versions, and steps.</p><p><strong>Evidence package</strong><br/>Relevant captures, hashes, traces, and annotated images.</p><p><strong>Risk narrative</strong><br/>Confirmed impact, realistic constraints, and unresolved questions.</p><p><strong>Remediation review</strong><br/>A focused check of the implemented fix against the original path.</p></div></section>

    <section id="contact" className="contact" aria-labelledby="contact-title"><h2 id="contact-title">Bring the system, its assumptions, and the question.</h2><p>For a real deployment, replace the example address with the laboratory’s verified contact route and engagement policy.</p><a href="mailto:research@vectorfield.example?subject=Research%20scope">research@vectorfield.example</a></section>
    <footer><span>Vector Field</span><p>Concept site for Taste Skill V2 regression testing. No commercial or operational claims are implied.</p><a href="#top">Back to top</a></footer>
  </main>;
}
