"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChartNetworkIcon, type ChartNetworkIconHandle } from "../components/chart-network-icon";

const spans = [
  ["edge", "18 ms", 14], ["identity", "41 ms", 29], ["catalog", "86 ms", 58],
  ["inventory", "127 ms", 82], ["checkout", "156 ms", 100],
] as const;

export default function Home() {
  const network = useRef<ChartNetworkIconHandle>(null);
  return <main>
    <header className="nav"><a className="brand" href="#top" aria-label="Spanline home"><i />spanline</a><nav aria-label="Primary"><a href="#trace">Trace</a><a href="#context">Context</a><a href="#deploy">Deploy</a></nav><a className="navCta" href="#start">Read the setup guide</a></header>

    <section className="hero" id="top">
      <div className="heroCopy"><h1>Trace requests across services.</h1><p>See the complete path behind a slow endpoint—from edge to database—without stitching together isolated logs.</p><a className="button" href="#trace">Follow a request <span>↘</span></a></div>
      <figure className="heroArt"><Image src="/assets/request-path.png" alt="Material visualization of request paths branching between service nodes" width={1536} height={1024} priority unoptimized /><figcaption>One request, rendered as a connected system—not a stack of disconnected screens.</figcaption></figure>
    </section>

    <section className="trace" id="trace"><div><h2>The whole path, in causal order.</h2><p>A trace should answer what happened before you start querying. Parent-child spans keep queues, calls, retries, and database work in one readable chain.</p></div><div className="waterfall" aria-label="Example request span waterfall">{spans.map(([name,time,width],i)=><div className="span" key={name}><b>{name}</b><span style={{width:`${width}%`,marginLeft:`${i*4}%`}} /><em>{time}</em></div>)}</div></section>

    <section className="boundary"><blockquote>“Where did the time go?” becomes a path you can point to.</blockquote><p>Service boundaries stop being blind spots when trace context travels with the request.</p></section>

    <section className="context" id="context"><div className="contextMap"><button onClick={()=>network.current?.startAnimation()} onBlur={()=>network.current?.stopAnimation()} onMouseLeave={()=>network.current?.stopAnimation()} aria-label="Animate service graph"><ChartNetworkIcon ref={network} size={82} duration={1.1} /><span>Replay dependency flow</span></button><ul><li>gateway <small>root span</small></li><li>orders <small>child span</small></li><li>payments <small>linked span</small></li></ul></div><div><h2>Carry context across every hop.</h2><p>Propagate trace and span identifiers through HTTP, queues, and background work. Keep the reason for the work attached to the work itself.</p><p className="note">The network control uses the verified Taste Blocks animated chart-network component. Hover, focus, or activate it to replay the relationship.</p></div></section>

    <section className="failure"><div><h2>Read failures where they begin.</h2><p>Separate the service that reports an error from the span that caused it. Error events remain attached to duration, attributes, and the upstream call.</p></div><div className="faultLine"><span>POST /checkout</span><span>inventory.reserve</span><strong>lock timeout</strong><span>checkout.abort</span></div></section>

    <section className="query"><h2>Ask about behavior, not filenames.</h2><div className="queryLine"><code>service = checkout AND duration &gt; 1s AND deployment = current</code></div><div className="queryNotes"><p>Start from a route, service, duration, error, or deployment marker.</p><p>Move from the matching trace to its related logs without losing request context.</p><p>Save the query when it describes a recurring investigation.</p></div></section>

    <section className="compare"><div className="before"><h2>Compare the path before and after a deploy.</h2><p>Put two trace shapes beside each other. New spans, changed fan-out, and shifted duration expose behavioral drift.</p></div><div className="compareRows"><div><b>previous</b><span className="old" /></div><div><b>current</b><span className="new" /></div></div></section>

    <section className="sampling"><div><h2>Keep the traces that explain change.</h2><p>Tail-based decisions can retain errors and slow requests after the full trace completes, while routine traffic stays sampled.</p></div><ol><li><b>Receive</b><span>Collect complete spans.</span></li><li><b>Decide</b><span>Evaluate duration and outcome.</span></li><li><b>Retain</b><span>Keep evidence worth investigating.</span></li></ol></section>

    <section className="deploy" id="deploy"><h2>Instrument without rewriting the system.</h2><div className="steps"><p><b>01</b>Add an OpenTelemetry SDK or collector beside the services you already run.</p><p><b>02</b>Export traces using OTLP and preserve resource attributes that identify the service and deployment.</p><p><b>03</b>Verify one request end to end before changing sampling or retention.</p></div></section>

    <section className="start" id="start"><h2>Start with one request.</h2><p>Instrument a single route, confirm its context crosses each boundary, then widen coverage from evidence—not guesswork.</p><a className="button light" href="#top">Return to the trace <span>↑</span></a></section>
    <footer><a className="brand" href="#top"><i />spanline</a><p>Concept website for a developer observability product. No customer, usage, or performance claims are implied.</p></footer>
  </main>;
}
