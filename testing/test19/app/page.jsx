import DiscloseImage from '../components/DiscloseImage'

const steps=[['Choose together','Members vote on what the co-op stocks and how it serves the block.'],['Buy close to home','Seasonal food comes from regional growers and independent makers whenever supply allows.'],['Share the work','A few volunteer hours keep shelves full, prices legible, and neighbors connected.']]

export default function Page(){return <>
  <header><a className="wordmark" href="#top">COMMON<br/>TABLE</a><nav aria-label="Primary"><a href="#market">The market</a><a href="#membership">Membership</a><a href="#calendar">This week</a></nav><a className="join" href="#membership">Become a member</a></header>
  <main id="top">
    <section className="hero"><div className="hero-copy"><h1>Food stays in the neighborhood.</h1><p>A member-owned grocery for good produce, fair purchasing, and the everyday pleasure of running into someone you know.</p><a className="button" href="#visit">Plan a visit <span>↘</span></a></div><DiscloseImage src="/assets/neighborhood-market.png" alt="Neighbors selecting fresh produce together at a community market"/></section>

    <section className="ticker" aria-label="Cooperative principles"><span>Member owned</span><span>Season-led buying</span><span>Open books</span><span>Everyone welcome</span></section>

    <section className="manifesto" id="market"><h2>A grocery store with a front porch.</h2><div><p>Common Table is imagined as a practical neighborhood cooperative: a place to pick up supper, meet the people who stock the shelves, and have a real say in how the shop runs.</p><p>This site is a concept and does not represent an operating business. Details such as address, opening hours, suppliers, and membership dues still need to be set by a real founding group.</p></div></section>

    <section className="shelf"><div className="produce-shape">SEASON<br/>BY<br/>SEASON</div><div><h2>What earns shelf space</h2><ul><li><b>Everyday staples</b><span>Beans, grains, bread, dairy alternatives, eggs, and household basics.</span></li><li><b>Regional produce</b><span>What nearby soil and weather can honestly provide.</span></li><li><b>Small-batch goods</b><span>Preserves, sauces, coffee, and pantry goods from independent makers.</span></li></ul></div></section>

    <section className="how" id="membership"><h2>Ownership is a verb.</h2><div className="steps">{steps.map((s)=><article key={s[0]}><h3>{s[0]}</h3><p>{s[1]}</p></article>)}</div></section>

    <section className="ledger"><div><h2>The price tag tells the whole story.</h2><p>Clear shelf labels can show where food came from, how it was grown or made, and what portion of the price supports the producer. No mystery math, no invented savings claims.</p></div><div className="receipt" aria-label="Example transparent price breakdown"><h3>Example shelf label</h3><dl><div><dt>Grower or maker</dt><dd>shown at shelf</dd></div><div><dt>Co-op operations</dt><dd>shown at shelf</dd></div><div><dt>Member price</dt><dd>shown at shelf</dd></div></dl><small>Exact figures require real supplier agreements.</small></div></section>

    <section className="calendar" id="calendar"><h2>A week shaped around the block.</h2><div className="days"><article><time>Tuesday</time><h3>Produce delivery</h3><p>What arrived is posted when the receiving team finishes checking it in.</p></article><article><time>Thursday</time><h3>Open table</h3><p>A shared counter for recipe swaps, planning notes, and the occasional surplus crate.</p></article><article><time>Saturday</time><h3>Member shift</h3><p>Stocking, sorting, and welcoming—work matched to different bodies and schedules.</p></article></div></section>

    <section className="voices"><blockquote>“The point isn’t to make shopping feel exclusive. It’s to make good food feel ordinary, nearby, and shared.”</blockquote><p>— A statement of intent for the future founding group, not a customer testimonial.</p></section>

    <section className="visit" id="visit"><div><h2>Bring a tote. Bring a question.</h2><p>The address and hours will belong here once a real site is secured. Until then, prospective organizers can use this concept as a starting point for a neighborhood meeting.</p></div><a className="button dark" href="mailto:organize@example.com">Start a conversation <span>→</span></a></section>
  </main>
  <footer><div className="wordmark">COMMON<br/>TABLE</div><p>A concept for a member-owned neighborhood food cooperative. No store, membership, or supplier relationships are claimed.</p><a href="#top">Back to top ↑</a></footer>
  </>}
