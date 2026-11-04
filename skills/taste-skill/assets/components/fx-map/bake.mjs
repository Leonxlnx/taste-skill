#!/usr/bin/env node
// fx-map/bake.mjs: the real streets, water, parks and rails around one place, taken from OpenStreetMap
// once at build time and written as a small JSON that fx-map draws in the page's own colours, with the
// walk from a station (only with --from). One request to an Overpass server; the page itself loads nothing from a
// map service and needs no key.
//
//   node bake.mjs --lat 52.4879 --lon 13.4301 --out map.json
//   node bake.mjs --lat 52.4879 --lon 13.4301 --from 52.4862,13.4246 --from-name "U Hermannplatz" --out map.json
//
//   --from none (default): no walk, only the streets around the pin; --from auto: the nearest named rail,
//   metro or tram station 150 m to 1.6 km away, drawn as a walk (a client whose brief names a station). --w / --h: the area in metres (default 3000 x 2000). --in <file>: a saved Overpass answer
//   (no request). --save <file>: keep the answer. --endpoint: another Overpass server.
// The map's data is (c) OpenStreetMap contributors (ODbL): the credit goes in the page's one footer credit line,
// never on the map.
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : d; };
const lat = +opt('lat'), lon = +opt('lon');
if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
  console.error('usage: node bake.mjs --lat <deg> --lon <deg> [--from none|auto|lat,lon] [--from-name "Name"] [--w 3000] [--h 2000] [--out map.json] [--in saved.json] [--save saved.json]');
  process.exit(2);
}
const W = +opt('w', 3000), H = +opt('h', 2000);
const out = opt('out', 'map.json');
const from = opt('from', 'none');
const endpoint = opt('endpoint', 'https://overpass-api.de/api/interpreter');

// metres east (x) and south (y) of the place, y down as on a screen
const KX = 111320 * Math.cos(lat * Math.PI / 180), KY = 110574;
const P = (la, lo) => [(lo - lon) * KX, (lat - la) * KY];
const BOX = { x0: -W / 2, y0: -H / 2, x1: W / 2, y1: H / 2 };
const PAD = 1.3;                                   // lines run on past the frame
const bb = [lat - H / 2 * PAD / KY, lon - W / 2 * PAD / KX, lat + H / 2 * PAD / KY, lon + W / 2 * PAD / KX].map(v => v.toFixed(6)).join(',');

const QUERY = `[out:json][timeout:120];
(
  way["highway"](${bb});
  way["railway"~"^(rail|light_rail|tram|narrow_gauge)$"](${bb});
  way["natural"~"^(water|wood|scrub|grassland|heath|wetland|beach|sand)$"](${bb});
  relation["natural"~"^(water|wood|wetland)$"](${bb});
  way["waterway"~"^(riverbank|dock|canal|river|stream)$"](${bb});
  way["landuse"~"^(basin|reservoir|grass|recreation_ground|cemetery|forest|meadow|allotments|village_green)$"](${bb});
  relation["landuse"~"^(basin|reservoir|forest|grass|recreation_ground|cemetery|meadow)$"](${bb});
  way["leisure"~"^(park|garden|playground|pitch|common|nature_reserve|golf_course)$"](${bb});
  relation["leisure"~"^(park|garden|nature_reserve|golf_course)$"](${bb});
  way["natural"="coastline"](${bb});
  node["railway"~"^(station|halt|tram_stop)$"](${bb});
  node["public_transport"="station"](${bb});
);
out geom qt;`;

async function overpass() {
  const inFile = opt('in', '');
  if (inFile) return JSON.parse(fs.readFileSync(inFile, 'utf8'));
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json', 'User-Agent': 'taste-skill fx-map bake (one static map per site)' },
      body: 'data=' + encodeURIComponent(QUERY),
    });
    if (r.ok) {
      const j = await r.json();
      const save = opt('save', '');
      if (save) fs.writeFileSync(save, JSON.stringify(j));
      return j;
    }
    console.error(`overpass: ${r.status}, trying again`);
    await new Promise(res => setTimeout(res, 4000 * (attempt + 1)));
  }
  throw new Error('the Overpass server did not answer: try --endpoint https://overpass.kumi.systems/api/interpreter');
}

/* ------------------------------------------------------------------ geometry */
const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
const dist = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
const inside = (p, b) => p[0] >= b.x0 && p[0] <= b.x1 && p[1] >= b.y0 && p[1] <= b.y1;
// Liang-Barsky: the part of segment p-q inside box b, as [t0, t1], or null
function lb(p, q, b) {
  let t0 = 0, t1 = 1;
  const dx = q[0] - p[0], dy = q[1] - p[1];
  for (const [pp, qq] of [[-dx, p[0] - b.x0], [dx, b.x1 - p[0]], [-dy, p[1] - b.y0], [dy, b.y1 - p[1]]]) {
    if (pp === 0) { if (qq < 0) return null; continue; }
    const r = qq / pp;
    if (pp < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [t0, t1];
}
// a polyline cut to the box: pieces, each marked by whether it starts or ends on the box's edge
function clipLine(pts, b) {
  const pieces = [];
  let cur = null;
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1], r = lb(p, q, b);
    if (!r) { if (cur) { cur.end = false; pieces.push(cur); cur = null; } continue; }
    if (!cur) cur = { pts: [lerp(p, q, r[0])], start: r[0] > 0 || !inside(p, b) };
    cur.pts.push(lerp(p, q, r[1]));
    if (r[1] < 1) { cur.end = true; pieces.push(cur); cur = null; }
  }
  if (cur) { cur.end = false; pieces.push(cur); }
  return pieces.filter(x => x.pts.length > 1);
}
// Sutherland-Hodgman: a ring cut to the box
function clipRing(ring, b) {
  let pts = ring;
  const edges = [
    [p => p[0] >= b.x0, (p, q) => lerp(p, q, (b.x0 - p[0]) / (q[0] - p[0]))],
    [p => p[0] <= b.x1, (p, q) => lerp(p, q, (b.x1 - p[0]) / (q[0] - p[0]))],
    [p => p[1] >= b.y0, (p, q) => lerp(p, q, (b.y0 - p[1]) / (q[1] - p[1]))],
    [p => p[1] <= b.y1, (p, q) => lerp(p, q, (b.y1 - p[1]) / (q[1] - p[1]))],
  ];
  for (const [isIn, cut] of edges) {
    if (!pts.length) break;
    const next = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      if (isIn(p)) { next.push(p); if (!isIn(q)) next.push(cut(p, q)); } else if (isIn(q)) next.push(cut(p, q));
    }
    pts = next;
  }
  return pts.length > 2 ? pts : null;
}
// Ramer-Douglas-Peucker
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, z] = stack.pop();
    const [ax, ay] = pts[a], [zx, zy] = pts[z];
    const len = Math.hypot(zx - ax, zy - ay) || 1e-9;
    let best = -1, bi = -1;
    for (let i = a + 1; i < z; i++) {
      const d = Math.abs((zx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (zy - ay)) / len;
      if (d > best) { best = d; bi = i; }
    }
    if (best > tol) { keep[bi] = 1; stack.push([a, bi], [bi, z]); }
  }
  return pts.filter((_, i) => keep[i]);
}
// a closed ring: split at the point farthest from its start, so both halves have a chord to measure from
function simplifyRing(pts, tol) {
  let k = 1, best = -1;
  for (let i = 1; i < pts.length - 1; i++) { const d = dist(pts[0], pts[i]); if (d > best) { best = d; k = i; } }
  return simplify(pts.slice(0, k + 1), tol).concat(simplify(pts.slice(k), tol).slice(1));
}
const lengthOf = pts => pts.reduce((s, p, i) => (i ? s + dist(pts[i - 1], p) : 0), 0);
const area = ring => ring.reduce((s, p, i) => { const q = ring[(i + 1) % ring.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
// SVG path data: absolute M, then relative steps on whole metres
function pathOf(lines, closed = false) {
  let s = '';
  for (const pts of lines) {
    const r = [];
    for (const [x, y] of pts) { const q = [Math.round(x), Math.round(y)]; const l = r[r.length - 1]; if (!l || l[0] !== q[0] || l[1] !== q[1]) r.push(q); }
    if (r.length < (closed ? 3 : 2)) continue;
    s += `M${r[0][0]} ${r[0][1]}l` + r.slice(1).map((q, i) => `${q[0] - r[i][0]} ${q[1] - r[i][1]}`).join(' ') + (closed ? 'z' : '');
  }
  return s;
}
// ways joined into chains by their end nodes (same direction only, as coastlines are drawn)
function chains(ways, { either = false } = {}) {
  const left = new Set(ways.map((_, i) => i));
  const byFirst = new Map(), byLast = new Map();
  ways.forEach((w, i) => {
    (byFirst.get(w.ids[0]) || byFirst.set(w.ids[0], []).get(w.ids[0])).push(i);
    (byLast.get(w.ids.at(-1)) || byLast.set(w.ids.at(-1), []).get(w.ids.at(-1))).push(i);
  });
  const take = (list, rev) => { for (const i of list || []) if (left.has(i)) { left.delete(i); return rev ? { ids: [...ways[i].ids].reverse(), pts: [...ways[i].pts].reverse() } : ways[i]; } return null; };
  const out = [];
  for (const i0 of [...left]) {
    if (!left.has(i0)) continue;
    left.delete(i0);
    let ids = [...ways[i0].ids], pts = [...ways[i0].pts];
    for (let grew = true; grew && ids[0] !== ids.at(-1);) {
      grew = false;
      let n = take(byFirst.get(ids.at(-1))) || (either && take(byLast.get(ids.at(-1)), true));
      if (n) { ids = ids.concat(n.ids.slice(1)); pts = pts.concat(n.pts.slice(1)); grew = true; continue; }
      n = take(byLast.get(ids[0])) || (either && take(byFirst.get(ids[0]), true));
      if (n) { ids = n.ids.slice(0, -1).concat(ids); pts = n.pts.slice(0, -1).concat(pts); grew = true; }
    }
    out.push({ ids, pts, closed: ids.length > 2 && ids[0] === ids.at(-1) });
  }
  return out;
}

/* ------------------------------------------------------------------ the sea, from coastlines */
// OSM coastlines run with the land on the left and the sea on the right. Each piece that crosses the
// frame is joined to the next piece's entry by walking the frame's edge clockwise, which keeps the sea
// on the right. Islands (closed rings inside) are land drawn over it.
function sea(coastWays, b) {
  const per = 2 * (b.x1 - b.x0) + 2 * (b.y1 - b.y0), w = b.x1 - b.x0, h = b.y1 - b.y0;
  const tOf = ([x, y]) => {
    const e = 0.01;
    if (Math.abs(y - b.y0) < e) return x - b.x0;
    if (Math.abs(x - b.x1) < e) return w + (y - b.y0);
    if (Math.abs(y - b.y1) < e) return w + h + (b.x1 - x);
    return 2 * w + h + (b.y1 - y);
  };
  const corners = [[w, [b.x1, b.y0]], [w + h, [b.x1, b.y1]], [2 * w + h, [b.x0, b.y1]], [per, [b.x0, b.y0]]];
  const pieces = [], islands = [];
  for (const c of chains(coastWays)) {
    if (c.closed && c.pts.every(p => inside(p, b))) { islands.push(c.pts); continue; }
    for (const pc of clipLine(c.pts, b)) if (pc.start && pc.end) pieces.push({ pts: pc.pts, a: tOf(pc.pts[0]), z: tOf(pc.pts.at(-1)) });
  }
  const water = [];
  if (!pieces.length) {
    // the whole frame is sea only around an island that holds the place itself
    if (islands.some(r => pointIn([0, 0], r))) water.push([[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]]);
    return { water, islands };
  }
  const used = new Set();
  for (const first of pieces) {
    if (used.has(first)) continue;
    const ring = [];
    let cur = first;
    for (let guard = 0; guard < pieces.length + 1; guard++) {
      used.add(cur);
      ring.push(...cur.pts);
      // the next entry clockwise from this exit
      let best = null, bd = Infinity;
      for (const p of pieces) { const d = ((p.a - cur.z) % per + per) % per; if (d < bd && (!used.has(p) || p === first)) { bd = d; best = p; } }
      if (!best) break;
      for (const [t, pt] of corners.concat(corners.map(([t, pt]) => [t + per, pt]))) {
        const d = t - cur.z;
        if (d > 0 && d < bd) ring.push(pt);
      }
      if (best === first) break;
      cur = best;
    }
    water.push(ring);
  }
  return { water, islands };
}
function pointIn([x, y], ring) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/* ------------------------------------------------------------------ main */
const ROAD = {
  major: /^(motorway|trunk|primary|secondary)(_link)?$/,
  street: /^(tertiary|tertiary_link|unclassified|residential|living_street|road)$/,
  minor: /^(service|pedestrian|busway)$/,
  path: /^(footway|path|cycleway|steps|track)$/,
};
const classOf = t => {
  const h = t.highway;
  if (!h || /^(construction|proposed|platform|corridor|elevator|raceway|bus_guideway|escape|abandoned|disused|bridleway|via_ferrata|rest_area|services)$/.test(h)) return null;
  for (const [k, re] of Object.entries(ROAD)) if (re.test(h)) return k;
  return null;
};
const walkable = t => {
  if (!t.highway || /^(motorway|motorway_link|construction|proposed|raceway|bus_guideway|busway)$/.test(t.highway)) return false;
  if (/^(no|private)$/.test(t.foot || '')) return false;
  if (/^(no|private)$/.test(t.access || '') && !/^(yes|designated|permissive)$/.test(t.foot || '')) return false;
  return true;
};

// what the card calls the stop: metro, train, tram, ferry or bus
const kindOf = t => (t.station === 'subway' || t.subway === 'yes' || t.railway === 'subway_entrance') ? 'metro'
  : t.railway === 'tram_stop' || t.tram === 'yes' ? 'tram'
  : /^(station|halt)$/.test(t.railway || '') ? (t.station === 'light_rail' ? 'light rail' : 'train')
  : t.ferry === 'yes' || t.amenity === 'ferry_terminal' ? 'ferry' : t.bus === 'yes' ? 'bus' : 'station';
const json = await overpass();
const els = json.elements || [];
const wayPts = el => (el.geometry || []).map(g => (g ? P(g.lat, g.lon) : null)).filter(Boolean);

const lines = { major: [], street: [], minor: [], path: [], rail: [], tram: [] };
const rivers = { river: [], canal: [], stream: [] };
const polys = { water: [], green: [], plaza: [] };
const coast = [];
const named = [];                 // ways with a street name, for labels
const graph = new Map();          // node id -> { p, e: [[id, metres]] }
const stations = [];

// small rings (verges, back lawns) are left out: they only speckle the map
const addRing = (bucket, pts, min = 60) => { const r = clipRing(simplifyRing(pts, 1.6), BOX); if (r && Math.abs(area(r)) > min) bucket.push(r); };
const relRings = el => chains((el.members || []).filter(m => m.type === 'way' && m.geometry && m.geometry.length > 1)
  .map(m => ({ ids: m.geometry.map(g => `${g.lat.toFixed(7)},${g.lon.toFixed(7)}`), pts: m.geometry.map(g => P(g.lat, g.lon)) })), { either: true })
  .filter(c => c.closed).map(c => c.pts);

for (const el of els) {
  const t = el.tags || {};
  if (el.type === 'node') {
    if (t.name && (/^(station|halt|tram_stop)$/.test(t.railway || '') || t.public_transport === 'station')) stations.push({ name: t.name, p: P(el.lat, el.lon), kind: kindOf(t) });
    continue;
  }
  const isWater = t.natural === 'water' || /^(riverbank|dock)$/.test(t.waterway || '') || /^(basin|reservoir)$/.test(t.landuse || '');
  const isGreen = /^(wood|scrub|grassland|heath|wetland)$/.test(t.natural || '') || /^(grass|recreation_ground|cemetery|forest|meadow|allotments|village_green)$/.test(t.landuse || '') || /^(park|playground|pitch|common|nature_reserve|golf_course)$/.test(t.leisure || '')
    || (t.leisure === 'garden' && !!t.name && !/^(private|no)$/.test(t.access || ''));   // never the back gardens
  if (el.type === 'relation') {
    if (isWater) for (const r of relRings(el)) addRing(polys.water, r);
    else if (isGreen) for (const r of relRings(el)) addRing(polys.green, r, 900);
    continue;
  }
  const pts = wayPts(el);
  if (pts.length < 2) continue;
  const closed = el.nodes && el.nodes.length > 3 && el.nodes[0] === el.nodes.at(-1);
  if (t.natural === 'coastline') { coast.push({ ids: el.nodes, pts }); continue; }
  if (isWater && closed) { addRing(polys.water, pts); continue; }
  if (isGreen && closed) { addRing(polys.green, pts, t.name ? 200 : 900); continue; }
  if (/^(river|canal|stream)$/.test(t.waterway || '') && t.tunnel !== 'culvert' && !t.tunnel) {
    for (const pc of clipLine(simplify(pts, 1.5), BOX)) rivers[t.waterway].push(pc.pts);
    continue;
  }
  if (t.railway) {
    if (t.tunnel && t.tunnel !== 'no') continue;
    if (/^(platform)$/.test(t.railway)) continue;
    for (const pc of clipLine(simplify(pts, 1.5), BOX)) (t.railway === 'tram' ? lines.tram : lines.rail).push(pc.pts);
    continue;
  }
  if (!t.highway) continue;
  // the walking graph takes every walkable way, tunnels and sidewalks too
  if (walkable(t) && el.nodes && el.nodes.length === pts.length) {
    for (let i = 0; i < pts.length; i++) {
      const id = el.nodes[i];
      if (!graph.has(id)) graph.set(id, { p: pts[i], e: [] });
      if (i) { const m = dist(pts[i - 1], pts[i]); graph.get(id).e.push([el.nodes[i - 1], m]); graph.get(el.nodes[i - 1]).e.push([id, m]); }
    }
  }
  if (t.highway === 'pedestrian' && closed && t.area === 'yes') { addRing(polys.plaza, pts); continue; }
  if (t.tunnel && t.tunnel !== 'no') continue;
  if (t.area === 'yes') continue;
  const cls = classOf(t);
  if (!cls) continue;
  if (cls === 'minor' && /^(parking_aisle|driveway|drive-through)$/.test(t.service || '')) continue;
  if (cls === 'path' && /^(sidewalk|crossing|traffic_island)$/.test(t.footway || '')) continue;
  for (const pc of clipLine(simplify(pts, cls === 'path' ? 2 : 1.2), BOX)) {
    // short service stubs and path bits only add noise (and weight)
    if ((cls === 'minor' && t.highway === 'service' && lengthOf(pc.pts) < 25) || (cls === 'path' && lengthOf(pc.pts) < 30)) continue;
    lines[cls].push(pc.pts);
  }
  if (t.name && (cls === 'major' || cls === 'street' || t.highway === 'pedestrian')) named.push({ name: t.name, cls, ids: el.nodes, pts });
}

/* the sea */
const coastal = sea(coast, BOX);

/* street names: the straightest long run of each named street near the place */
const labels = [];
{
  const inner = { x0: BOX.x0 * 0.92, y0: BOX.y0 * 0.92, x1: BOX.x1 * 0.92, y1: BOX.y1 * 0.92 };
  const byName = new Map();
  for (const w of named) (byName.get(w.name) || byName.set(w.name, []).get(w.name)).push(w);
  const cand = [];
  for (const [name, ws] of byName) {
    const cls = ws.some(w => w.cls === 'major') ? 'major' : ws.some(w => w.cls === 'street') ? 'street' : 'minor';
    for (const c of chains(ws.map(w => ({ ids: w.ids, pts: w.pts })), { either: true })) {
      for (const pc of clipLine(simplify(c.pts, 2), inner)) {
        const pts = pc.pts;
        // the longest run with less than about 22 degrees of turning in all
        let best = null;
        for (let i = 0; i < pts.length - 1; i++) {
          let turn = 0, len = 0, j = i + 1, h0 = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]), hp = h0;
          len += dist(pts[i], pts[i + 1]);
          for (; j < pts.length - 1; j++) {
            const h = Math.atan2(pts[j + 1][1] - pts[j][1], pts[j + 1][0] - pts[j][0]);
            let d = Math.abs(h - hp); if (d > Math.PI) d = 2 * Math.PI - d;
            if (turn + d > 0.38) break;
            turn += d; hp = h; len += dist(pts[j], pts[j + 1]);
          }
          if (!best || len > best.len) best = { i, j, len };
        }
        if (!best || best.len < 90) continue;
        const whole = pts.slice(best.i, best.j + 1), total = lengthOf(whole);
        // a window of up to 300 m: the middle of the run, and on a long run two more toward its ends,
        // so a small frame that shows only part of the street still finds its name in view
        const span = Math.min(300, total);
        const at = total > 520 ? [0.5, 0.2, 0.8] : [0.5];
        for (const f of at) {
          const s0 = Math.max(0, Math.min(total - span, total * f - span / 2)), keep = [];
          let acc = 0;
          for (let k = 0; k < whole.length - 1; k++) {
            const a = whole[k], b2 = whole[k + 1], l = dist(a, b2);
            const u0 = Math.max(0, s0 - acc), u1 = Math.min(l, s0 + span - acc);
            if (u1 > u0) { if (!keep.length) keep.push(lerp(a, b2, u0 / l)); keep.push(lerp(a, b2, u1 / l)); }
            acc += l;
          }
          if (keep.length < 2) continue;
          // read left to right (or top to bottom when the street runs straight up)
          const dx = keep.at(-1)[0] - keep[0][0], dy = keep.at(-1)[1] - keep[0][1];
          if (dx < 0 || (Math.abs(dx) < 1 && dy < 0)) keep.reverse();
          const mid = keep[Math.floor(keep.length / 2)];
          const near = 1 / (1 + Math.hypot(mid[0], mid[1]) / 500);
          cand.push({ name, cls, run: keep, len: lengthOf(keep), score: lengthOf(keep) * (cls === 'major' ? 1.7 : cls === 'street' ? 1 : 0.7) * near });
        }
      }
    }
  }
  cand.sort((a, b2) => b2.score - a.score);
  // the 14 best streets, up to three windows each (the part shows one name per street)
  const names = [...new Set(cand.map(c => c.name))].slice(0, 14);
  for (const n of names) {
    for (const c of cand.filter(x => x.name === n).slice(0, 3)) labels.push({ name: c.name, d: pathOf([c.run]), len: Math.round(c.len), cls: c.cls });
  }
}

/* the walk from the nearest station */
let route = null;
{
  let st = null;
  if (from !== 'none') {
    if (from !== 'auto') {
      const [fl, fo] = from.split(',').map(Number);
      if (Number.isFinite(fl) && Number.isFinite(fo)) st = { name: opt('from-name', 'Station'), p: P(fl, fo) };
    } else {
      // one point per station name, the nearest within the frame, 150 m to 1.6 km away
      const best = new Map();
      for (const s of stations) {
        const d = Math.hypot(...s.p);
        if (!inside(s.p, BOX) || d < 150 || d > 1600) continue;
        const k = s.name;
        if (!best.has(k) || d < best.get(k).d) best.set(k, { ...s, d });
      }
      // a metro, train or tram stop over a ferry or bus stop up to 1.6 times as far
      const w = x => x.d * (/^(ferry|bus|station)$/.test(x.kind) ? 1.6 : 1);
      st = [...best.values()].sort((a, b2) => w(a) - w(b2))[0] || null;
      if (st && opt('from-name', '')) st.name = opt('from-name', '');
    }
  }
  if (st && graph.size) {
    // the walk joins the street network at the closest point on a street (not its nearest corner,
    // which made the line run past the door and back)
    const onStreet = p => {
      let best = null;
      for (const [id, n] of graph) for (const [nb] of n.e) {
        if (nb < id) continue;
        const a2 = n.p, b2 = graph.get(nb).p, dx = b2[0] - a2[0], dy = b2[1] - a2[1];
        const t = Math.max(0, Math.min(1, ((p[0] - a2[0]) * dx + (p[1] - a2[1]) * dy) / (dx * dx + dy * dy || 1)));
        const q = [a2[0] + dx * t, a2[1] + dy * t], d = dist(q, p);
        if (!best || d < best.d) best = { d, q, a: id, b: nb };
      }
      return best;
    };
    const S = onStreet(st.p), Z = onStreet([0, 0]);
    // Dijkstra with a binary heap, from both ends of the station's street piece
    const D = new Map(), prev = new Map(), heap = [];
    const push = x => { heap.push(x); let i = heap.length - 1; while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    for (const id of [S.a, S.b]) { const d0 = dist(S.q, graph.get(id).p); if (d0 < (D.get(id) ?? Infinity)) { D.set(id, d0); push([d0, id]); } }
    while (heap.length) {
      const [d, id] = pop();
      if (d > (D.get(id) ?? Infinity)) continue;
      if (d > 4000) break;
      for (const [nb, m] of graph.get(id).e) { const nd = d + m; if (nd < (D.get(nb) ?? Infinity)) { D.set(nb, nd); prev.set(nb, id); push([nd, nb]); } }
    }
    // the door's street piece, entered from whichever end is nearer by the walk
    const ends = [Z.a, Z.b].filter(id => D.has(id)).map(id => [D.get(id) + dist(graph.get(id).p, Z.q), id]).sort((x, y) => x[0] - y[0]);
    const same = (S.a === Z.a && S.b === Z.b);
    if (same || ends.length) {
      const ids = [];
      if (!same) { ids.push(ends[0][1]); while (prev.has(ids.at(-1))) ids.push(prev.get(ids.at(-1))); ids.reverse(); }
      const pts = [st.p, S.q, ...ids.map(id => graph.get(id).p), Z.q, [0, 0]];
      const m = lengthOf(pts);
      route = { d: pathOf([simplify(pts, 1)]), m: Math.round(m), min: Math.max(1, Math.round(m / 80)), from: { name: st.name, kind: st.kind || 'station', x: Math.round(st.p[0]), y: Math.round(st.p[1]) } };
    }
  }
}

const data = {
  v: 1,
  place: { lat, lon },
  box: [BOX.x0, BOX.y0, W, H],
  credit: '© OpenStreetMap contributors',
  sea: pathOf(coastal.water, true),
  land: pathOf(coastal.islands.map(r => clipRing(r, BOX)).filter(Boolean), true),
  water: pathOf(polys.water, true),
  green: pathOf(polys.green, true),
  plaza: pathOf(polys.plaza, true),
  river: pathOf(rivers.river), canal: pathOf(rivers.canal), stream: pathOf(rivers.stream),
  rail: pathOf(lines.rail), tram: pathOf(lines.tram),
  path: pathOf(lines.path), minor: pathOf(lines.minor), street: pathOf(lines.street), major: pathOf(lines.major),
  labels,
  route,
};
fs.writeFileSync(out, JSON.stringify(data));
const kb = (fs.statSync(out).size / 1024).toFixed(1);
console.log(`saved ${out} (${kb} KB): ${lines.major.length + lines.street.length + lines.minor.length} street pieces, ${labels.length} names, ` +
  (route ? `${route.min} min walk (${route.m} m) from ${route.from.name} (${route.from.kind})` : 'no route') + (coast.length ? `, coast ${coastal.water.length} sea / ${coastal.islands.length} islands` : ''));
const nearestName = [...new Set(labels.map(l => l.name))].slice(0, 4).join(', ');
if (nearestName) console.log(`streets near the place: ${nearestName}`);
