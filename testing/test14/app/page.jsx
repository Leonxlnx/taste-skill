import DiscloseImage from '../components/DiscloseImage'

const chapters=[
  ['01','Tides are arriving on higher ground','Sea level sets the stage. Storms, waves, sediment and development decide how each shoreline responds.'],
  ['02','A marsh can move—or disappear','As water rises, salt marshes survive by building elevation and migrating inland. Roads and seawalls can close that route.'],
  ['03','The map is not the territory','A shoreline is a moving boundary. One survey captures a moment; repeated measurements reveal the direction of travel.']
]

export default function Page(){return <>
  <header><a className="brand" href="#top">LITTORAL</a><nav aria-label="Primary"><a href="#field-notes">Field notes</a><a href="#methods">Methods</a><a href="#reading">Reading room</a></nav></header>
  <main id="top">
    <section className="hero"><h1>Read the changing coast.</h1><p>Climate science reported from the boundary between land and water—where sea-level rise becomes visible, local and measurable.</p><a className="arrow" href="#field-notes">Begin at the waterline ↓</a></section>

    <section className="cover" aria-label="Aerial view of salt marsh and coast"><DiscloseImage src="/assets/salt-marsh-coast.png" alt="Aerial view of tidal creeks crossing a salt marsh beside shallow coastal water" doorClassName="marsh-door"/><p className="caption">Tidal channels divide a salt marsh at the open-water edge. Generated editorial image; full provenance below.</p></section>

    <section className="dispatch" id="field-notes"><div><h2>The coast records change in layers.</h2></div><div><p className="lead">A wrack line, a drowned root system, a creek cut deeper into peat: each is evidence, but none tells the whole story alone.</p><p>Researchers join field observations with tide gauges, elevation surveys, sediment cores and satellite records. The useful question is not whether a coast has changed. It is how fast, by which process, and with what uncertainty.</p></div></section>

    <section className="chapters">{chapters.map(([n,h,p])=><article key={n}><h3>{h}</h3><p>{p}</p></article>)}</section>

    <section className="transect"><h2>Walk a transect inland.</h2><div className="line"><i/><b>Open water</b><i/><b>Low marsh</b><i/><b>High marsh</b><i/><b>Upland</b></div><p>Elevation changes by centimeters, but plant communities and flood frequency can change sharply across the same short walk.</p></section>

    <section className="methods" id="methods"><aside><h2>How the evidence fits together</h2><p>No single instrument explains a coast. Agreement across independent records makes the interpretation stronger.</p></aside><ol><li><strong>Tide gauge</strong><span>Tracks water level through time at one location.</span></li><li><strong>Surface elevation table</strong><span>Measures whether marsh soil gains height relative to a fixed benchmark.</span></li><li><strong>Satellite image</strong><span>Extends the view across whole estuaries and repeated dates.</span></li><li><strong>Sediment core</strong><span>Preserves older environmental change beneath the living surface.</span></li></ol></section>

    <section className="uncertainty"><blockquote>“Uncertainty” does not mean “unknown.”</blockquote><p>It describes a measured range around an estimate. Good climate reporting keeps that range attached to the claim—and distinguishes a projected future from an observed past.</p></section>

    <section className="atlas"><div className="atlas-map" aria-hidden="true"><span/><span/><span/></div><div><h2>One ocean, different shores.</h2><p>Relative sea-level change varies by place because the land itself can rise or sink. Currents, sediment supply, storms and coastal engineering shape the local result.</p><dl><dt>Rocky coast</dt><dd>Cliffs, platforms and narrow sediment stores</dd><dt>Barrier island</dt><dd>Mobile sand linked to inlets and overwash</dd><dt>River delta</dt><dd>High sediment exchange and often subsiding ground</dd></dl></div></section>

    <section className="reading" id="reading"><h2>A field guide for careful reading</h2><div><p><b>Check the baseline.</b> “Rise” and “loss” need a start date and reference point.</p><p><b>Separate event from trend.</b> A storm can redraw a beach overnight; climate shifts the conditions around many events.</p><p><b>Look for scale.</b> A global average cannot predict every inlet, and a single inlet cannot represent the globe.</p></div></section>

    <section className="close"><h2>Stay with the evidence.</h2><p>Return as new field notes, methods explainers and annotated coastlines are added to this independent editorial study.</p><a className="arrow" href="#top">Return to the beginning ↑</a></section>
  </main>
  <footer><span>Littoral / climate science publication</span><span>Independent editorial concept. No live subscription or data service.</span></footer>
  </>}
