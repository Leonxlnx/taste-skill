// Build-time sample. Run node fixture.mjs to replace the figure in index.html.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const spec = {
  last: 40, deploy: 12, rollback: 28, budget: 400, top: 800,
  knots: [[0,205],[8,215],[11,210],[12,235],[13,460],[15,650],[19,610],
    [22,710],[26,645],[28,635],[29,510],[30,355],[32,220],[40,210]]
};

export function samples(seed = 24112) {
  let noise = 0;
  return Array.from({length: spec.last + 1}, (_, minute) => {
    const index = spec.knots.findIndex(([time]) => time >= minute);
    const [end, target] = spec.knots[index];
    const [start, previous] = spec.knots[Math.max(0, index - 1)];
    const phase = end === start ? 0 : (minute - start) / (end - start);
    seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
    noise = noise * 0.42 + (seed / 4294967296 - 0.5) * (minute > spec.deploy && minute <= spec.rollback ? 72 : 24);
    return Math.round((previous + phase * (target - previous) + noise) / 5) * 5;
  });
}

export function figure() {
  const values = samples();
  const x = minute => minute / spec.last * 100;
  const y = latency => 100 * (1 - latency / spec.top);
  const clock = minute => '14:' + String(minute).padStart(2,'0');
  const path = values.map((ms,i) => (i ? 'L' : 'M') + x(i) + ',' + y(ms)).join(' ');
  const event = (minute, label) => `<div class="event" style="left:${x(minute)}%"><span><b>${clock(minute)}</b> ${label}</span><i style="top:${y(values[minute])}%"></i></div>`;
  const peak = Math.max(...values);
  const peakMinute = values.indexOf(peak);
  const before = values.slice(0,spec.deploy);
  const baseline = Math.round(before.reduce((total, value) => total + value, 0) / before.length / 5) * 5;
  const recovery = values.findIndex((ms,i) => i >= spec.rollback && ms <= spec.budget);
  const peakMark = `<span class="peak" style="left:${x(peakMinute)}%;top:${y(peak)}%">${peak} ms</span>`;
  const tick = minute => `<time style="left:${x(minute)}%">${clock(minute)}</time>`;
  return `<figure class="trace" data-picture aria-labelledby="trace-title">
  <div class="trace-head"><h2 id="trace-title">Checkout response time</h2><span>95th percentile · 1-minute samples</span></div>
  <div class="chart" role="img" aria-label="Checkout latency averaged ${baseline} ms before the ${clock(spec.deploy)} deploy, peaked at ${peak} ms, and fell below the ${spec.budget} ms budget at ${clock(recovery)} after rollback.">
    <div class="plot">
      <div class="budget" style="top:${y(spec.budget)}%"><span>${spec.budget} ms budget</span></div>
      ${event(spec.deploy,'Deploy')}${event(spec.rollback,'Rollback')}
      <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><clipPath id="checkout-over"><rect width="100" height="${y(spec.budget)}"/></clipPath></defs>
        <path d="${path}"/><path class="breach" clip-path="url(#checkout-over)" d="${path}"/>
      </svg>
      ${peakMark}
      <span class="start-value" style="top:${y(values[0])}%">${values[0]} ms</span>
      <div class="clock">${[0,10,20,30,40].map(tick).join('')}</div>
    </div>
  </div>
</figure>
<p class="trace-summary">Sample incident · From a ${baseline} ms average before deploy to ${peak} ms at ${clock(peakMinute)}. Back within budget at ${clock(recovery)}.</p>`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const file = new URL('index.html', import.meta.url);
  const html = readFileSync(file, 'utf8');
  const slot = /<!-- figure -->[\s\S]*?<!-- end figure -->/;
  if (!slot.test(html)) throw new Error('Missing figure markers in index.html');
  writeFileSync(file, html.replace(slot, '<!-- figure -->\n' + figure() + '\n<!-- end figure -->'));
}
