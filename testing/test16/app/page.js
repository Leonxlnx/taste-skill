import DiscloseImage from "../components/disclose-image";

const roomImage = "/assets/coastal-room.png";

export default function Home() {
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#top">Stillwater House</a>
        <nav aria-label="Main navigation">
          <a href="#rooms">Rooms</a><a href="#table">The table</a><a href="#arrival">Find us</a>
        </nav>
        <a className="book" href="#plan">Plan a stay</a>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <img src={roomImage} alt="A linen-dressed room looking through rain towards the sea" />
          <div className="hero-copy">
            <h1>Stay close to the weather.</h1>
            <p>Seven rooms behind the dunes, with the North Sea at the window and everything you need to settle in.</p>
            <a href="#rooms">See the rooms</a>
          </div>
          <p className="weather-note">The coast is the itinerary. Bring a warm layer.</p>
        </section>

        <section className="opening">
          <h2>A house for slow days.</h2>
          <p>Stillwater House is imagined as a small, independent coastal hotel: quiet rooms, an unhurried breakfast, and a front door a short walk from the beach. This page is a design concept, so availability and reservations are not yet connected.</p>
        </section>

        <section className="rooms" id="rooms">
          <div className="rooms-copy">
            <h2>Rooms that hold the horizon.</h2>
            <p>Natural linen, limewashed walls, deep window seats and proper hooks for wet coats. Each room is planned around rest rather than excess.</p>
            <dl><div><dt>Sea rooms</dt><dd>Wide water views and a window seat</dd></div><div><dt>Dune rooms</dt><dd>Sheltered light and garden access</dd></div><div><dt>All rooms</dt><dd>Private bath, wool blankets and tea</dd></div></dl>
          </div>
          <DiscloseImage src={roomImage} alt="A warm coastal room with a bed beside a rain-marked sea window" />
        </section>

        <section className="table" id="table">
          <div><h2>Breakfast follows the morning.</h2><p>Strong coffee, warm bread, eggs, fruit and whatever suits the season. Served at one long oak table, with smaller window tables for quieter starts.</p></div>
          <blockquote>Come down in socks. Stay for another pot.</blockquote>
          <p>Dietary needs would be confirmed directly before arrival. No restaurant service or menus are represented as operating on this concept site.</p>
        </section>

        <section className="day">
          <h2>Let the tide set the pace.</h2>
          <ol>
            <li><span>Morning</span><strong>Walk the firm sand</strong><p>Low tide opens the broadest route along the waterline.</p></li>
            <li><span>Afternoon</span><strong>Read out of the wind</strong><p>The library faces inland, where the light stays soft.</p></li>
            <li><span>Evening</span><strong>Watch the weather turn</strong><p>Return by dusk for tea, a hot shower and the view.</p></li>
          </ol>
        </section>

        <section className="shelter">
          <h2>Made for the return.</h2>
          <div className="shelter-grid"><p>Boot trays at the door</p><p>A drying room for coats</p><p>Books chosen for long weather</p><p>Flasks to borrow for walks</p><p>Outdoor shower for sandy feet</p><p>Quiet hours after ten</p></div>
        </section>

        <section className="arrival" id="arrival">
          <div><h2>The last mile is the lovely part.</h2><p>The concept places Stillwater House beyond a small coastal village, reached by a narrow road through marram grass. Exact address, transport links and accessibility details still require a real property.</p></div>
          <aside><h3>Arriving well</h3><p>Plan to arrive before dark in winter. A real hotel would provide confirmed directions, parking details and station transfers with your booking.</p></aside>
        </section>

        <section className="plan" id="plan">
          <h2>Come when the coast calls.</h2>
          <p>This is a truthful design concept rather than an operating booking service. Prices, dates and contact details will be added only when a real hotel supplies them.</p>
          <a href="mailto:hello@example.com">Discuss the concept</a>
        </section>
      </main>

      <footer><a className="wordmark" href="#top">Stillwater House</a><p>A fictional hospitality concept created for a design regression test. No stays are currently sold.</p><a href="#top">Back to the weather ↑</a></footer>
    </>
  );
}
