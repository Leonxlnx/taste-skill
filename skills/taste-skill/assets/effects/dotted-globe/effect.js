// dotted-globe: a sphere of fine dots on a Fibonacci lattice, turning slowly about a tilted axis.
// Front dots are larger and brighter, the rim fades, the far half shows faintly through a softly lit
// body. The land is the real continents (a coarse coastline traced into a small equirectangular mask),
// or with map 0 a few large abstract masses from seeded noise. On a slow beat one thin arc lifts between
// two cities of a fixed network and lands with a faint ring. Dots in WebGL (a context made only while
// the globe is on screen; a 2D canvas without it), arcs on a 2D canvas, the body painted once. Every
// canvas covers only the globe's box, not the frame.
// A literal figure that says "global": never dealt at random (meta.json "random": false); a page names
// it only where the product's reach is global. Its WebGL context counts in fx.js's budget (glBudget).
import { lifecycle, glBudget, color, config, rng, hashSeed, normalizePalette, paletteKind, resolveParams, grainCSS } from '../fx.js';

const params = {
  speed:   { default: 3.5,  min: 0,   max: 12,  step: 0.1 },  // turn, degrees a second
  size:    { default: 0.72, min: 0.4, max: 1.1, step: 0.01 }, // globe diameter, share of the frame's shorter side
  spacing: { default: 7,    min: 4,   max: 16,  step: 0.5 },  // distance between dots on the front, CSS px
  dot:     { default: 1.05, min: 0.5, max: 2.5, step: 0.05 }, // dot radius on the front, CSS px
  map:     { default: 1,    min: 0,   max: 1,   step: 1 },    // 1: the continents, 0: abstract land from noise
  land:    { default: 0.38, min: 0,   max: 0.7, step: 0.01 }, // abstract land share (map 0; 0 gives an even sphere)
  sea:     { default: 0.16, min: 0,   max: 1,   step: 0.01 }, // brightness of the dots between the land
  back:    { default: 0.12, min: 0,   max: 0.4, step: 0.01 }, // the far half seen through the globe (0 hides it)
  arcs:    { default: 6,    min: 0,   max: 12,  step: 0.1 },  // seconds between arcs, one at a time (0: no arcs)
  glow:    { default: 0.55, min: 0,   max: 1,   step: 0.01 }, // body shading and the soft halo
  tilt:    { default: 16,   min: -40, max: 40,  step: 1 },    // pole toward the viewer, degrees
  calm:    { default: 0.5,  min: 0,   max: 1,   step: 0.01 }, // fade the globe where text sits
  calmX:   { default: 0.25, min: 0,   max: 1,   step: 0.01 },
  calmY:   { default: 0.7,  min: 0,   max: 1,   step: 0.01 },
};

const MAX_DPR = 2, MAX_DPR_2D = 1.5;
const DEG = Math.PI / 180;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const LIGHT = [-0.5, 0.55, 0.67];                  // view-space light, upper left, toward the viewer
const DRAW = 1.8, HOLD = 1.7, FADE = 1.1;          // an arc: travel, stay, fade (seconds)
const LIFE = DRAW + HOLD + FADE;
const HUBS = 12;
const STILL_T = 7;                                 // the reduced-motion frame
const BOX = 1.32;                                  // canvases cover the globe's centre +- BOX * R
const reducedQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const easeInOut = s => (s < 0.5 ? 4 * s * s * s : 1 - Math.pow(-2 * s + 2, 3) / 2);
const easeOut = s => 1 - Math.pow(1 - s, 3);
const rgba = (hex, a) => {
  const [r, g, b] = color.rgb(hex).map(v => Math.round(v * 255));
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a)).toFixed(4)})`;
};
const unit = (lon, lat) => { const p = lat * DEG, l = lon * DEG; return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]; };

/* ------------------------------------------------------------------ the continents */

// Coarse coastlines in degrees (lon, lat pairs), traced by hand at about two degrees, enough for dots
// 1.5-2 degrees apart. Longitudes past 180 continue across the date line. LAKES are cut out after.
const LAND = [
  // North America
  [-168,65.6,-163,69.5,-156,71.3,-148,70.3,-141,69.6,-135,69.5,-128,70.3,-121,69.3,-115,68,-108,68.2,-98,67.8,-94.5,71.8,-90,69,-84,69.8,-81.5,67,-86,66.4,-87.5,64.5,-90.6,63.4,-92,62.8,-94.1,61.1,-94.2,58.8,-92.3,57,-88.5,56.3,-85,55.2,-82.3,55.1,-82.2,52.9,-80.5,51.3,-79,51.6,-79,54.8,-77.8,55.3,-78.1,58.5,-77.9,62.4,-73,62.2,-70,61,-69.5,58.8,-68.4,58.1,-64.5,60.3,-61.5,56.5,-57.3,54.3,-55.7,52.1,-60,50.2,-66.5,50.2,-69,48.6,-66,49.1,-64.3,48.8,-64.8,47.6,-64.6,46.2,-61,45.6,-60,46.2,-61,45.1,-65.7,43.5,-66.8,44.8,-70.2,43.7,-70.6,42.6,-70,41.7,-71.5,41.4,-74,40.5,-74.1,39.2,-75.05,38.5,-76,36.9,-75.5,35.25,-77.9,33.9,-79.8,32.6,-81.4,30.3,-80.6,28.4,-80.1,26.8,-81.1,25.1,-81.8,26.5,-82.8,28.5,-84.3,30,-86.5,30.4,-89.6,30.2,-89.4,29,-91.5,29.5,-94,29.6,-97.2,27.6,-97.5,25,-97.7,22,-96.1,19.2,-94.5,18.2,-91.8,18.6,-90.4,20.9,-89.7,21.3,-86.8,21.2,-87.7,18.5,-88.3,16,-86.8,15.8,-83.2,15,-83.7,11,-82.3,9.3,-79.9,9.4,-77.2,8.6,-77.6,7,-78.3,8.2,-79.5,8.9,-80.3,7.4,-81.5,7.8,-83.5,8.4,-85.8,10,-87.6,13,-91.4,13.9,-94.8,16.2,-96.5,15.7,-99.9,16.85,-105.2,20.6,-106.4,23.2,-108.9,25.5,-110.9,27.9,-111.9,28.8,-114.7,31.7,-113,29,-111.3,26,-109.9,23,-112,24.8,-114.1,27.4,-115.3,29.7,-117.1,32.5,-118.4,34,-120.6,34.6,-121.9,36.6,-122.5,37.8,-123.8,39.8,-124.2,41.9,-124,46.2,-124.7,48.4,-123.2,49,-125,50,-127.5,50.8,-128.5,52.5,-130.4,54.5,-133,57,-136.5,58.3,-139.7,59.6,-144,60,-147,60.8,-149.5,59.8,-151.8,59.3,-154,58.5,-157,56.8,-162,55.3,-163.5,54.8,-161,56.5,-157.5,58.5,-161.8,58.6,-164.6,60.8,-165.3,62.5,-163.5,63.4,-161,64.2,-166.3,64.6],
  // Greenland and the Arctic islands
  [-73,78,-60,82,-30,83.5,-12,81.5,-18,77,-20,72,-22,70,-32,68,-40,65,-43,60,-49,61,-52,64,-54,67,-54,70,-58,75.5,-66,76],
  [-88.5,73.5,-80,73.7,-71,71,-66.5,68.5,-61.8,66.7,-63.5,64.5,-65,62.5,-71,62.8,-74,64.4,-77.5,65.2,-73,68,-79,70,-84,70,-88,71.5],
  [-117.5,69,-105,68.8,-101.5,70,-105,73.3,-112,73.3,-118.5,72.5,-119,71.3],
  [-125.5,72,-122,74.4,-116,73.2,-116,71.8,-122,71],
  [-90,76.5,-78,76.2,-62,82,-70,83,-88,81.5,-95,79],
  [-92,74.6,-80,74.5,-80.5,76.3,-92,76.3],
  [-87,64.3,-81,64.5,-80.3,63.6,-84,62.2,-86.5,63.3],
  [-59.3,47.6,-55.5,51.6,-53,49.5,-52.7,47.5,-53.5,46.6,-56,47.6],
  [-85,21.8,-80,23.2,-77,21.7,-74.2,20.2,-77.7,19.9,-80,21.6,-83,22],
  [-74.4,19.8,-72.7,19.9,-68.4,18.6,-70,18.2,-74.4,18.3],
  // South America
  [-77.4,8.6,-75.5,10.6,-74.2,11.3,-71.6,12.4,-71,11,-68,10.5,-64,10.6,-62,10.7,-60.8,8.6,-57.5,6.2,-54,5.8,-52,4.8,-51,3.5,-50,1.8,-49.8,0.2,-48.4,-1.3,-44.5,-2.4,-41,-2.9,-38.5,-3.7,-35.2,-5.4,-34.8,-7.5,-35.4,-9.4,-37.2,-11.3,-38.5,-13,-39,-15.5,-39.3,-17.8,-40.4,-20.3,-41.2,-22.3,-43.2,-23,-45,-23.7,-48.5,-26.5,-48.6,-28.5,-50.5,-30.9,-52.2,-32.2,-53.4,-33.7,-55,-34.9,-56.2,-34.9,-58.4,-34.6,-57.2,-35.9,-56.7,-36.4,-57.5,-38.2,-62.3,-38.8,-62.3,-40.3,-65,-41,-63.8,-42.5,-65.1,-43.5,-67.5,-45.9,-65.9,-47.2,-68,-50.1,-69.2,-51.6,-68.4,-52.4,-68.5,-53.3,-65.3,-54.8,-67.3,-55.5,-70.5,-55.2,-73.5,-53,-75,-50.5,-75.6,-46.8,-73.8,-42,-73.6,-37.2,-71.6,-33,-71.5,-29.9,-70.4,-23.6,-70.3,-18.5,-71.4,-17.6,-75.2,-15.3,-76.3,-13.4,-77.2,-12,-79,-8,-81.3,-5.1,-80.4,-3.4,-80.9,-2.2,-80.1,0,-79,1.5,-78.4,2.5,-77.3,4,-77.4,6.5,-77.9,7.2],
  // Eurasia
  [-9,37,-9.5,39,-8.9,42,-9.3,43,-8,43.7,-2,43.4,-1.5,46,-2.5,47.3,-4.7,48.4,-1.5,48.7,-1.6,49.7,1.5,50,4,51.5,5,53,8.5,53.8,8.1,56.6,10.5,57.7,10.5,56,10,54.6,11,54,14,54,18,54.8,21,55,21,56.8,23.5,59.3,29.8,59.9,25,60.3,22,60.3,21.5,61.5,25.3,65.5,22,65.7,19,63.5,17.5,62,17.5,60.6,18.8,59.3,16.5,57,16,56,13,55.4,12.5,56.5,11.5,58.3,10.5,59.2,8,58,5.5,59,5,61,7,63,12,65.5,14.5,68,19,70,25.7,71.1,31,70.3,33,69.3,41,67.5,41,66.2,34.5,66.5,35,64.5,37.5,64,40.5,64.5,44,66.2,44,68.5,53,68.5,58,68.5,60,69.8,66,69,68,68.5,66.5,71,69,73.2,72.5,72,72,69,75,68.5,77,72.5,80,73.5,86,74,87,75,95,76,104,77.7,113,74,118,73,126,72.5,130,71,140,72.5,150,71.5,160,70,170,70,180,68.5,190.3,66,186,64.5,182,65,178.5,64.5,180,62.5,174,61.8,170,60,164,59.8,163,58,163.5,56,162,54.5,156.5,51,155.5,55,156,57.5,160,61,156,61.6,151,59.2,143,59.3,137,54,141,52.5,140,48.5,135.5,43.5,132,43,129.5,41,129.4,36,129,35.1,126.5,34.5,126.1,36.8,125,38,124.4,39.9,121.6,38.9,122,40.6,119.6,39.9,117.7,39,118.9,37.7,120.8,37.8,122.6,37.4,120.4,36.1,119.4,34.7,120.9,32.6,121.9,31.4,121.6,29.8,121.5,28.5,119.5,25.5,117,23.5,114,22.3,110.5,21.2,110,20.3,109.6,21.5,108.5,21.6,106.5,20.2,105.8,19,106.5,17.5,108.8,15.5,109.3,12,107,10.5,104.8,8.6,105,10.4,103.5,10.6,102.3,12.2,100.9,12.7,100.3,13.4,99.2,10.5,99.3,9.1,100.6,7.2,102.2,6.1,103.3,3.8,104.2,1.4,102.2,2.2,101.4,3,100.3,5.4,98.3,7.9,98.6,10,98.1,13,97.6,16.5,95,15.8,94.2,16,94.3,18.5,92.9,20.1,91.8,22.3,90.5,21.9,88.8,21.6,86.9,20.6,85.8,19.8,83.3,17.7,81.2,16.2,80.3,13.1,79.9,10.3,77.5,8.1,76.3,10,74.8,12.9,73.8,15.5,72.8,19,72.8,20.4,72.6,22.2,70,20.8,69,22.3,70,22.9,68.6,23.5,67,24.8,64.6,25.2,62.3,25.1,60.6,25.3,57.8,25.6,56.3,27.1,54.9,26.6,50.8,28.9,48.5,29.9,48,29.4,50.1,26.4,51.2,26.1,51.6,25.3,51,24.6,54.4,24.5,55.3,25.3,56.3,26.4,56.4,25.1,58.6,23.6,59.8,22.5,58.8,20.4,57.7,19.6,54.1,17,49.1,14.5,45,12.8,43.4,12.6,42.9,14.8,42.6,16.9,39.2,21.5,38.1,24.1,35.7,27.4,35,29.5,34.3,31.4,34.8,32.1,35.5,33.9,35.8,35.5,36.2,36.6,34.6,36.8,30.7,36.9,28.2,36.8,27.4,37,26.8,38.4,26.4,40.1,26.2,40.5,25.9,40.8,24.4,40.9,22.9,40.6,23.8,40,22.9,39.4,24.2,38.4,23.7,37.9,23.1,36.4,22.5,36.4,21.7,36.8,21.7,38.2,20.7,39,20,39.9,19.4,40.5,19.4,41.3,19.1,42.1,18.1,42.6,16.4,43.5,15.2,44.1,14.4,45.3,13.8,45.6,12.3,45.4,12.3,44.4,13.5,43.6,14.2,42.5,16.2,41.9,16.9,41.1,17.9,40.6,18.4,39.8,17.2,40.4,17.1,39.1,15.65,38.1,16,39.4,14.8,40.6,14.3,40.8,13.6,41.2,12.6,41.4,11.8,42.1,10.5,42.9,10.3,43.5,9.8,44.1,8.9,44.4,7.3,43.7,5.9,43.1,5.4,43.3,3.9,43.5,3,42.7,3.3,42.3,2.2,41.4,0.9,40.7,-0.3,39.5,0.2,38.7,-0.5,38.3,-1,37.6,-2.2,36.7,-4.4,36.7,-5.4,36.1,-5.6,36,-6.3,36.5,-7,37.2,-7.9,37],
  [-5.7,50.1,-3.5,50.3,-1.2,50.7,1.4,51.2,1.7,52.7,0.3,53.4,-0.1,54.1,-1.3,54.9,-1.6,55.6,-2.1,57.1,-1.8,57.6,-3.4,57.7,-3,58.6,-5,58.6,-5.7,57.6,-5.7,56.5,-5.5,55.4,-4.9,54.7,-3.4,54.9,-3.2,54.1,-3,53.3,-4.6,53.3,-4.2,52.3,-5.2,51.7,-3,51.5,-4.2,51.2],
  [-6.2,52.2,-6,53.3,-6.2,54,-5.6,54.6,-7.3,55.3,-8.5,54.7,-10,54.2,-10,53.4,-9.4,52.6,-10.4,51.8,-9.5,51.5,-8.2,51.8],
  [-22,64,-24,65.5,-22,66.4,-16,66.5,-13.6,65.2,-15,64.2,-18,63.4],
  [11,78.5,17,76.6,22,77.6,27,79.5,20,80.5,11,79.8],
  [52,71.5,57,70.6,61,73.5,68.5,76.5,66,77,59,76,54,74,51.5,72.2],
  [95,79,100,78.3,105,79,100,81],
  [12.4,38.1,15.6,38.3,15.3,37,15.1,36.7,14.3,37,12.5,37.6],
  [8.2,41,9.8,41.1,9.6,39.2,9,39,8.4,39,8.4,40.4],
  [8.6,41.6,9.2,41.4,9.6,42.3,9.4,43,8.6,42.4],
  [23.5,35.3,26.3,35.2,26.2,35,24,35],
  [32.3,35,34.6,35.6,34,34.95,32.5,34.7],
  // Japan, Sakhalin, Taiwan, Hainan, the Philippines, Sri Lanka
  [130.2,31.2,131.4,31.4,131.7,32.5,132,33.2,132.5,32.9,133,32.7,134.2,33.3,134.7,34,135.8,33.5,136.9,34.5,138.2,34.6,138.8,34.6,139.8,35,140,34.9,140.9,35.7,140.9,36.9,141.5,38.3,142,39.5,141.4,41.4,140.3,41.2,140,40.4,139.8,39.9,139.8,38.9,139,37.9,138.2,37.1,137.3,37.5,136.7,36.8,136,35.7,135.2,35.7,133,35.6,132,35.3,131,34.5,130.9,34,130.4,33.6,129.6,33.3,129.8,32.7,130.2,32.2],
  [140,41.5,139.8,42.4,141.6,45.4,143.5,44.2,145.5,43.3,143.3,42,141.3,41.4],
  [142,46,143.5,46.5,143,49.5,143,54.3,142.2,54.3,141.8,51],
  [120.2,22.5,121.9,25,121.5,25.3,120.1,23.5,120.8,21.9],
  [108.6,19.2,110.5,20.1,111,19.6,109.5,18.2],
  [120,18.5,122.2,18.5,122,16.2,124,13.6,123.8,12.5,122,13.5,120.6,14.4,119.8,16.3],
  [122,10.5,124,12.3,125.5,11.3,124.5,9.9,123,9.5],
  [122,7,126.5,7.3,126.3,9.5,125.5,9.8,123.5,8.7],
  [79.8,9.8,81.8,7.5,81.4,6.2,80.1,6,79.8,7.8],
  // the islands of south-east Asia, New Guinea, Australia, New Zealand
  [109.6,2,109,0,110,-2.8,111.6,-3.5,114.5,-4,116.5,-3.5,116,-1,117.5,0.5,117.8,2,119,5.2,117,7,116,6,115.4,5,113,3.2,111,1.8],
  [95.3,5.6,97.5,5.2,100.3,2.2,103.6,-0.9,106,-3.2,105.9,-5.8,104.5,-5.9,102.3,-4,100.4,-0.8,98.6,1.7],
  [105.2,-6.8,106.8,-6,110.4,-6.9,112.7,-6.9,114.4,-7.8,114.6,-8.7,111,-8.3,108.3,-7.8,106.4,-7.4],
  [119.5,-5.5,120.5,-1,119.8,0.8,121,1.2,125,1.5,123,-1,122,-3,121,-5.5],
  [131,-1.4,134,-0.8,135.5,-3.3,138,-1.6,141,-2.6,145.7,-4.9,147.5,-6,150,-10.4,147.6,-10.1,146,-8,143.5,-9,142.5,-9.3,141,-9.1,138.9,-8.1,137.8,-5.4,135,-4.4,132.8,-4.1,132,-2.8],
  [114.1,-21.8,116.8,-20.6,121,-19.5,122.2,-17.3,125,-14.5,127,-13.8,129.5,-15,130.4,-12.4,132.6,-11.5,135.8,-12.2,136.8,-12.3,135.5,-15,137.8,-16.5,140.8,-17.5,141.6,-12.6,142.5,-10.7,143.5,-14,145.4,-15,146,-18.5,149,-20.5,150.8,-22.6,153,-25.3,153.6,-28.6,152.9,-31.5,151.2,-33.9,150,-37.5,146.4,-39.1,144.5,-38.2,141,-38.1,139.6,-37.1,138.1,-35.6,137.6,-33.2,136,-34.9,134.1,-32.7,131,-31.5,126,-32.3,123.6,-33.9,118,-35.1,115,-34.3,115.7,-31.8,114.9,-29,113.4,-26.3],
  [144.6,-40.7,148.3,-40.9,148,-43.2,146,-43.6,145.2,-42.2],
  [172.7,-34.4,174.8,-36.9,178.5,-37.7,177,-39.5,175,-41.6,174.6,-41.3,173.8,-39.2,174.6,-36.5],
  [172.7,-40.5,174.3,-41.7,173,-43.8,171.2,-44.5,169,-46.6,166.5,-46,168.3,-44,170.8,-42.7],
  // Africa and Madagascar
  [-5.8,35.8,-2.9,35.3,-0.6,35.7,3,36.8,7.8,36.9,9.9,37.3,10.2,36.8,11.1,37.1,10.8,35.8,10.8,34.7,10.1,33.9,11.5,33.1,13.2,32.9,15.2,32.4,16.6,31.2,18.5,30.4,20.2,30.8,20.1,32.1,22.6,32.8,24,32.1,28.9,30.8,29.9,31.2,32.3,31.3,34.2,31.3,34.95,29.5,34.2,27.8,33.8,27.2,35.8,24,37.2,19.6,38.7,17.8,39.5,15.6,42.7,13,43.1,11.6,45,10.4,51.3,11.8,51.4,10.4,48.5,5.3,45.3,2,42.5,-0.6,40.9,-2.3,39.7,-4.1,39.3,-6.8,39.6,-8.4,40.5,-10.5,40.7,-14.5,39.9,-16.2,36.9,-17.9,34.8,-19.8,35.5,-22,35.5,-23.9,32.6,-26,32.1,-28.8,31,-29.9,27.9,-33,25.6,-34,22.1,-34.2,20,-34.8,18.4,-34.1,17.9,-32.8,16.5,-28.6,15.2,-26.6,14.5,-22.9,11.8,-17.3,12.1,-15.2,13.4,-12.6,13.2,-8.8,12.3,-6,11.9,-4.8,8.7,-0.6,9.4,0.4,9.7,4,8.5,4.6,6,4.3,3.4,6.4,1.2,6.1,-0.2,5.6,-4,5.3,-7.5,4.4,-10.8,6.3,-13.2,8.5,-13.7,9.5,-15.6,11.9,-16.6,13.4,-17.5,14.7,-16.5,16,-16,18.1,-17,20.8,-15.9,23.7,-14.5,26.1,-12.9,27.9,-9.6,30.4,-9.8,31.5,-9.2,32.3,-7.6,33.6,-6.8,34],
  [49.3,-12,50.5,-15.5,49.5,-17,48,-22,47.1,-24.9,45.2,-25.5,43.6,-23.5,44.2,-20,44.4,-16.2,47,-15.5,48,-13.5],
  // Antarctica
  [-180,-78,-160,-77,-150,-76,-130,-74,-110,-74,-100,-73,-80,-73,-70,-69,-62,-65,-57,-63.3,-60,-67,-62,-71,-61,-75,-45,-78,-35,-77,-20,-73,0,-70,20,-70,40,-69,60,-67,80,-66.5,100,-66,120,-66.5,140,-66.5,160,-70,170,-72,170,-77,180,-78,180,-90,-180,-90],
];
const LAKES = [
  [29.1,41.2,27.5,42.5,27.9,43.2,28.7,44.3,29.6,45.1,30.7,46.5,31.8,46.6,32.5,45.4,33.5,44.5,35.2,44.8,36.5,45.3,35.3,45.9,37,46.7,39.2,47.2,38.3,46.2,37.3,44.9,38.5,44.3,39.7,43.6,41.6,41.6,40.5,41,39.7,41,37.9,41.1,36.3,41.3,35.1,42,33.4,42,31.5,41.3],
  [47,44.5,47.5,45.8,49,46.5,51.9,47.1,53.1,46.6,53,45.2,51.2,44.6,52.8,42.2,53,40,53.9,38.9,53.9,37,51.5,36.7,49.9,37.4,48.9,38.4,49.9,40.4,48.3,42,47.5,43],
];
// network nodes on the real map: lon, lat
const CITIES = [
  [-122.4, 37.8], [-74, 40.7], [-87.6, 41.9], [-99.1, 19.4], [-74.1, 4.7], [-46.6, -23.5], [-58.4, -34.6],
  [-0.1, 51.5], [8.7, 50.1], [-3.7, 40.4], [18, 59.3], [3.4, 6.5], [31.2, 30], [36.8, -1.3], [28, -26.2],
  [55.3, 25.2], [72.9, 19.1], [103.8, 1.35], [114.2, 22.3], [127, 37.6], [139.7, 35.7], [151.2, -33.9], [106.8, -6.2],
];
// front longitudes that show a well-filled hemisphere in the still frame
const VIEWS = [-80, -38, 12, 30, 78, 112];

// one 512 x 256 equirectangular coverage map, rasterised on first use and shared by every globe
let earthMask = null;
function earthSampler() {
  if (earthMask !== null) return earthMask;
  earthMask = false;
  try {
    const w = 512, h = 256, c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    const sx = w / 360, sy = h / 180;
    const fill = (poly, off) => {
      x.beginPath();
      x.moveTo((poly[0] + 180 + off) * sx, (90 - poly[1]) * sy);
      for (let i = 2; i < poly.length; i += 2) x.lineTo((poly[i] + 180 + off) * sx, (90 - poly[i + 1]) * sy);
      x.closePath();
      x.fill();
    };
    x.fillStyle = '#fff';
    for (const off of [-360, 0, 360]) for (const p of LAND) fill(p, off);
    x.globalCompositeOperation = 'destination-out';
    for (const p of LAKES) fill(p, 0);
    const d = x.getImageData(0, 0, w, h).data, a = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3];
    earthMask = (lon, lat) => {
      const u = ((lon + 180) / 360) * w - 0.5, v = ((90 - lat) / 180) * h - 0.5;
      const u0 = Math.floor(u), v0 = Math.floor(v), fu = u - u0, fv = v - v0;
      const at = (i, j) => a[Math.min(h - 1, Math.max(0, j)) * w + (((i % w) + w) % w)];
      const top = at(u0, v0) + (at(u0 + 1, v0) - at(u0, v0)) * fu;
      const bot = at(u0, v0 + 1) + (at(u0 + 1, v0 + 1) - at(u0, v0 + 1)) * fu;
      return (top + (bot - top) * fv) / 255;
    };
  } catch (_) { earthMask = false; }
  return earthMask;
}

/* ------------------------------------------------------------------ geometry */

// R = Rz(roll) * Rx(tilt) * Ry(spin), row-major; spin turns the front surface left to right (west to east)
function rotMat(spin, tilt, roll) {
  const cs = Math.cos(spin), ss = Math.sin(spin), ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(roll), sr = Math.sin(roll);
  const a = [cs, 0, ss, st * ss, ct, -st * cs, -ct * ss, st, ct * cs]; // Rx * Ry
  return [
    cr * a[0] - sr * a[3], cr * a[1] - sr * a[4], cr * a[2] - sr * a[5],
    sr * a[0] + cr * a[3], sr * a[1] + cr * a[4], sr * a[2] + cr * a[5],
    a[6], a[7], a[8],
  ];
}
const rot = (m, x, y, z) => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
const fib = (i, N) => { const y = 1 - (2 * i + 1) / N, r = Math.sqrt(Math.max(0, 1 - y * y)), ph = i * GOLDEN; return [Math.cos(ph) * r, y, Math.sin(ph) * r]; };

// seeded 3D value noise with a quintic fade, about -1..1
function makeNoise3(seed) {
  const r = rng(`land:${seed}`);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const val = new Float32Array(256);
  for (let i = 0; i < 256; i++) val[i] = r() * 2 - 1;
  const h = (x, y, z) => val[perm[perm[perm[x & 255] + (y & 255)] + (z & 255)]];
  const f = t => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + (b - a) * t;
  return (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const u = f(x - xi), v = f(y - yi), w = f(z - zi);
    return lerp(
      lerp(lerp(h(xi, yi, zi), h(xi + 1, yi, zi), u), lerp(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), u), v),
      lerp(lerp(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), u), lerp(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), u), v),
      w);
  };
}

// abstract land: a low-frequency field (few, large masses), cut at a threshold taken from a fixed
// reference lattice so the land never depends on the dot count
function noiseLand(seed, share) {
  const nz = makeNoise3(seed);
  const field = (x, y, z) => {
    const wx = x + 0.2 * nz(x * 1.5 + 31.7, y * 1.5, z * 1.5);
    const wy = y + 0.2 * nz(x * 1.5, y * 1.5 + 47.1, z * 1.5);
    const wz = z + 0.2 * nz(x * 1.5, y * 1.5, z * 1.5 + 13.9);
    let s = 0, a = 0.62, f = 0.9;
    for (let o = 0; o < 3; o++) {
      const X = wx * f + o * 17.3, Y = (wy * 0.8 + wz * 0.6) * f - o * 9.1, Z = (wz * 0.8 - wy * 0.6) * f + o * 5.7;
      s += a * nz(X, Y, Z);
      f *= 2.2; a *= 0.3;
    }
    return s - 0.2 * Math.pow(Math.abs(y), 4);
  };
  const M = 4096, ref = new Float32Array(M);
  for (let i = 0; i < M; i++) { const [x, y, z] = fib(i, M); ref[i] = field(x, y, z); }
  ref.sort();
  const q = f => ref[Math.max(0, Math.min(M - 1, Math.floor(f * (M - 1))))];
  const thr = q(1 - share), w = (q(0.84) - q(0.16)) * 0.018;
  return (x, y, z) => sstep(thr - w, thr + w, field(x, y, z));
}

// the land function for the current params: (x, y, z) on the unit sphere -> 0..1
function landFn(prm, seed) {
  if (prm.map >= 0.5) {
    const s = earthSampler();
    if (s) return (x, y, z) => sstep(0.28, 0.72, s(Math.atan2(x, z) / DEG, Math.asin(Math.max(-1, Math.min(1, y))) / DEG));
  }
  if (prm.land <= 0) return () => 1;
  return noiseLand(seed, prm.land);
}

function lattice(N, seed, land) {
  const pos = new Float32Array(N * 3), lv = new Float32Array(N), rnd = new Float32Array(N);
  const r = rng(`dots:${seed}`);
  for (let i = 0; i < N; i++) {
    const [x, y, z] = fib(i, N);
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    lv[i] = land(x, y, z);
    rnd[i] = r();
  }
  return { N, pos, land: lv, rnd };
}

// network nodes from the seed alone (never from the lattice): cities on the map, land points otherwise
function pickHubs(prm, seed, land) {
  const r = rng(`hubs:${seed}`);
  let pool;
  if (prm.map >= 0.5 && earthSampler()) pool = CITIES.map(([lo, la]) => unit(lo, la));
  else {
    pool = [];
    for (let k = 0; k < 3000 && pool.length < 160; k++) {
      const v = unit(r() * 360 - 180, Math.asin(r() * 1.5 - 0.75) / DEG);
      if (land(v[0], v[1], v[2]) > 0.9) pool.push(v);
    }
    for (let k = 0; pool.length < HUBS * 2 && k < 400; k++) pool.push(unit(r() * 360 - 180, r() * 90 - 45));
  }
  const hubs = [pool[Math.floor(r() * pool.length)]];
  while (hubs.length < HUBS && hubs.length < pool.length) {
    let best = null, bd = -1;
    for (const c of pool) {
      if (hubs.includes(c)) continue;
      let md = 9;
      for (const h of hubs) md = Math.min(md, 1 - (h[0] * c[0] + h[1] * c[1] + h[2] * c[2]));
      const sc = md * (0.75 + 0.5 * r());
      if (sc > bd) { bd = sc; best = c; }
    }
    if (!best) break;
    hubs.push(best);
  }
  return hubs;
}

// where the globe sits. Across from the text it is whole and clear of every edge by max(48px, 8% of
// the short side), the halo fading out before the edge; with the text above it rises from the bottom
// edge, cut on purpose with a third or more of it below the frame
function place(W, H, prm, seed) {
  const S = Math.min(W, H), r = rng(`place:${seed}`);
  const m = Math.max(48, 0.08 * S);
  const cx = prm.calmX, cy = prm.calmY;
  let side = cx < 0.42 ? 1 : cx > 0.58 ? -1 : 0;
  if (side === 0 && Math.abs(cy - 0.5) < 0.18) side = r() < 0.5 ? -1 : 1;
  if (side !== 0 && W > H * 1.2) {
    const R = Math.max(S * 0.16, Math.min(prm.size * S * 0.5, H / 2 - m, W * 0.27));
    const edge = Math.max(R + m, R * 1.25);
    const gx = W / 2 + side * Math.max(0, Math.min(W / 2 - edge, W * 0.25));
    const slack = Math.max(0, H / 2 - R - m);
    const gy = H / 2 + (0.5 - cy) * 1.2 * slack;
    return { gx, gy, R };
  }
  const gx = W / 2 + (0.5 - cx) * W * 0.2;
  if (cy < 0.5) {
    const R = Math.min(prm.size * S * 0.7, W / 2 - m * 0.5);
    let top = Math.max((cy + 0.2) * H, 0.3 * H);
    top = Math.max(top, H - 1.65 * R);             // at least 0.35 R hides: a clear cut, never a near-tangent
    top = Math.min(top, H - 0.6 * R);              // at least 0.6 R shows
    return { gx, gy: top + R, R };
  }
  const room = Math.max(S * 0.32, (cy - 0.12) * H - m);
  const R = Math.max(S * 0.16, Math.min(prm.size * S * 0.5, room / 2, W / 2 - m));
  return { gx, gy: m + R, R };
}

/* ------------------------------------------------------------------ colours */

const hueIn = (c, a, b) => { const [, C, h] = color.lch(c); return C > 0.035 && h >= a && h <= b; };
const violet = c => hueIn(c, 275, 350);
// a colour that reads on bg: c itself, or c with its lightness moved a little; null when that takes much
function readableOn(bg, c, min) {
  if (color.contrast(bg, c) >= min) return c;
  const L0 = color.lab(c)[0], dir = color.lab(bg)[0] >= 0.6 ? -1 : 1;
  for (let d = 0.02; d <= 0.16; d += 0.02) {
    const out = color.withLightness(c, L0 + dir * d);
    if (color.contrast(bg, out) >= min) return out;
  }
  return null;
}

// every colour is the palette's own colour, a tint or shade of it, or a mix of two that agree in hue
function tones(P, prm) {
  const kind = paletteKind(P);
  const { bg, ink, accent } = P;
  const dark = color.isDark(bg);
  const g = prm.glow;
  const Lb = color.lab(bg)[0], Li = color.lab(ink)[0];
  const inkGrey = color.chroma(ink) < 0.035;
  // the accent may tint the dots only when it agrees with the ink, is not violet, and (on light grounds,
  // where it is mixed toward a dark ink) is not a yellow that would turn olive
  let tint = !violet(accent) && (inkGrey || color.hueDistance(ink, accent) <= 55);
  if (!dark && hueIn(accent, 75, 125) && (inkGrey || color.hueDistance(ink, accent) > 25)) tint = false;
  // arcs and nodes: the accent, its lightness nudged to read; the ink when the accent cannot read
  const arc = readableOn(bg, accent, 2.2) || color.mix(ink, bg, 0.12);
  const off = c => violet(c) && !violet(bg);    // an area colour that turned violet in the mix

  if (kind === 'colour') {
    const up = Li >= Lb; // a light ink lights the halo; a dark ink on a light field would only smudge it
    return {
      kind, dark, gain: 0.78, arc, head: color.mix(arc, '#ffffff', 0.35),
      // a dark ink mixed far toward a light colour field turns olive or brown, so it stays near the ink
      dot: color.mix(ink, bg, 0.08), dot2: color.mix(ink, bg, up ? 0.32 : 0.1),
      lit: color.adjust(bg, { l: 0.075 * g, c: 1.02 }), edge: color.adjust(bg, { l: -0.03 * g }),
      halo: up ? color.mix(bg, ink, 0.35) : color.adjust(bg, { l: 0.1, c: 0.92 }), haloA: (up ? 0.2 : 0.4) * g,
      rim: up ? color.mix(bg, ink, 0.45) : color.adjust(bg, { l: 0.13, c: 0.88 }), rimA: (up ? 0.14 : 0.3) * g,
    };
  }
  if (dark) {
    const src = tint ? color.mix(accent, ink, 0.25) : ink;
    let lit = color.mix(bg, src, 0.15 * g), edge = color.mix(bg, tint ? accent : ink, 0.012 * g);
    if (off(lit) || off(edge)) { lit = color.lighten(bg, 0.05 * g); edge = color.lighten(bg, 0.004 * g); }
    let halo = tint ? accent : ink, rim = tint ? color.mix(accent, ink, 0.2) : ink;
    if (off(color.mix(bg, halo, 0.3))) halo = color.lighten(bg, 0.25);
    if (off(color.mix(bg, rim, 0.3))) rim = color.lighten(bg, 0.3);
    return {
      kind, dark, gain: 0.85, arc, head: color.mix(arc, '#ffffff', 0.55),
      dot: tint ? color.mix(ink, accent, 0.3) : ink,
      dot2: tint ? color.mix(accent, ink, 0.12) : color.withLightness(ink, Li - 0.18),
      lit, edge, halo, haloA: 0.15 * g, rim, rimA: 0.16 * g,
    };
  }
  let edge = color.mix(bg, ink, 0.07 * g);
  if (off(edge)) edge = color.darken(bg, 0.03 * g);
  return {
    kind, dark, gain: 0.68, arc, head: arc,
    dot: tint ? color.mix(ink, accent, 0.3) : ink,
    dot2: tint ? color.mix(ink, accent, 0.7) : color.withLightness(ink, Li + 0.2),
    lit: color.lighten(bg, 0.06 * g), edge,
    halo: color.lighten(bg, 0.07), haloA: 0.75 * g, rim: color.lighten(bg, 0.08), rimA: 0.35 * g,
  };
}

/* ------------------------------------------------------------------ WebGL dots */

const VS = `
attribute vec3 a_pos;
attribute vec2 a_info;      // x land 0..1, y a random 0..1
uniform mat3 u_rot;
uniform vec2 u_res;
uniform vec3 u_globe;       // centre x, y (device px in the box, y down), radius
uniform float u_dot, u_pass;
uniform vec3 u_k;           // sea, back, gain
uniform vec3 u_light;
uniform vec4 u_calm;        // x, y, radius (device px in the box), strength
uniform vec3 u_col, u_col2; // dot colour at the front, toward the rim
varying float v_a, v_r;
varying vec3 v_col;
void main() {
  vec3 p = u_rot * a_pos;
  float front = step(0.0, p.z);
  if (abs(front - u_pass) > 0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; v_a = 0.0; v_r = 0.0; v_col = u_col; return; }
  vec2 s = u_globe.xy + vec2(p.x, -p.y) * u_globe.z;
  float land = a_info.x, a, r;
  if (u_pass > 0.5) {
    float lit = 0.68 + 0.32 * max(dot(p, u_light), 0.0);
    a = (0.1 + 0.9 * pow(p.z, 0.8)) * lit * mix(u_k.x, 1.0, land);
    r = u_dot * (0.55 + 0.45 * p.z) * mix(0.72, 1.0, land) * (0.9 + 0.2 * a_info.y);
  } else {
    a = u_k.y * (0.4 + 0.6 * (1.0 + p.z)) * mix(u_k.x * 0.5, 1.0, land);
    r = u_dot * 0.6;
  }
  a *= u_k.z * (1.0 - u_calm.w * (1.0 - smoothstep(u_calm.z * 0.35, u_calm.z, length(s - u_calm.xy))));
  float edge = 1.0 - abs(p.z);
  v_col = mix(u_col, u_col2, u_pass > 0.5 ? edge * edge : 1.0);
  v_a = a;
  v_r = r;
  gl_PointSize = 2.0 * max(r, 0.75) + 2.0;
  vec2 c = s / u_res * 2.0 - 1.0;
  gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
}`;
const FS = `
precision mediump float;
varying float v_a, v_r;
varying vec3 v_col;
void main() {
  float rr = max(v_r, 0.75);
  float d = length(gl_PointCoord - 0.5) * (2.0 * rr + 2.0);
  // coverage of a round dot; dots under a pixel keep their area as lower alpha
  float a = clamp(rr - d + 0.5, 0.0, 1.0) * v_a * min(1.0, (v_r * v_r) / (rr * rr));
  if (a < 0.002) discard;
  gl_FragColor = vec4(v_col * a, a);
}`;

function makeGL(canvas) {
  let gl = null;
  try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false }); } catch (_) { gl = null; }
  if (!gl) return null;
  try {
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.bindAttribLocation(prog, 0, 'a_pos');
    gl.bindAttribLocation(prog, 1, 'a_info');
    gl.linkProgram(prog);
    gl.deleteShader(v);
    gl.deleteShader(f);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error(gl.getProgramInfoLog(prog));
    const u = {};
    for (const n of ['rot', 'res', 'globe', 'dot', 'pass', 'k', 'light', 'calm', 'col', 'col2']) u[n] = gl.getUniformLocation(prog, 'u_' + n);
    return { gl, prog, buf: gl.createBuffer(), u, n: 0 };
  } catch (err) {
    console.warn('dotted-globe: ' + err.message);
    try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) { /* gone */ }
    return null;
  }
}

/* ------------------------------------------------------------------ the effect */

function mountGlobe(el, { palette, params: given, seed }) {
  let P = normalizePalette(palette);
  let prm = resolveParams(params, given);
  const sd = hashSeed(seed ?? 1);
  const cs = getComputedStyle(el);
  if (cs.position === 'static') el.style.position = 'relative';
  if (cs.isolation !== 'isolate') el.style.isolation = 'isolate';
  const ownBg = !!el.dataset.fxOwnBg || !cs.backgroundColor || cs.backgroundColor === 'transparent' || /rgba\(.*,\s*0\)$/.test(cs.backgroundColor);
  if (ownBg) { el.style.backgroundColor = P.bg; el.dataset.fxOwnBg = '1'; }
  let T = tones(P, prm);
  const r0 = rng(`globe:${sd}`);
  const view = VIEWS[Math.floor(r0() * VIEWS.length)] + (r0() - 0.5) * 16;
  const roll = (r0() - 0.5) * 22 * DEG;
  const free0 = r0() * 360;

  let W = 0, H = 0, dpr = 1, pl = null, box = null, L = null, hubs = [], landKey = '', land = null;
  let shown = false, fallbackOn = false, dead = false, use2D = false, glr = null, dotsCv = null, losses = 0;
  let arcCache = new Map(), stillSet = null, headSprite = null, lastT = 0, acc = 0;
  let rebuildTimer = 0, releaseTimer = 0, fbEls = [], glDone = null;
  // this globe's place in the page's WebGL budget: off screen, the budget may free it for another effect
  const holder = { seen: 0, get visible() { return lc.visible; }, release: () => releaseGL() };
  const lattices = new Map();

  const mk = () => {
    const c = document.createElement('canvas');
    c.className = 'fx-canvas';
    c.setAttribute('aria-hidden', 'true');
    Object.assign(c.style, { position: 'absolute', left: '0', top: '0', display: 'block', zIndex: '-1', pointerEvents: 'none', opacity: shown ? '1' : '0', transition: 'opacity .6s ease' });
    return c;
  };
  const ground = mk(), over = mk();
  const grainEl = document.createElement('div');
  grainEl.setAttribute('aria-hidden', 'true');
  const gctx = ground.getContext('2d');
  const ctx = over.getContext('2d');
  if (config.forceFallback || !gctx || !ctx) fallbackOn = true;
  else {
    el.insertBefore(over, el.firstChild);
    el.insertBefore(grainEl, over);
    el.insertBefore(ground, grainEl);
  }

  /* ---- the still CSS stand-in: a lit body, a halo and two dot layers masked into a sphere ---- */
  function fallbackPaint() {
    const w = W || el.clientWidth || 1200, h = H || el.clientHeight || 675;
    const { gx, gy, R } = pl || place(w, h, prm, sd);
    const px = v => `${v.toFixed(1)}px`, at = `${px(gx)} ${px(gy)}`;
    el.style.background = `${grainCSS(T.dark ? 0.045 : 0.05)}, ` +
      `radial-gradient(circle at ${at}, ${rgba(T.halo, 0)} ${px(R)}, ${rgba(T.halo, T.haloA * 0.5)} ${px(R + 1)}, ${rgba(T.halo, 0)} ${px(R * 1.25)}), ` +
      `radial-gradient(circle at ${at}, transparent ${px(R - 0.5)}, ${P.bg} ${px(R + 0.5)}), ` +
      `radial-gradient(circle at ${px(gx - 0.38 * R)} ${px(gy - 0.42 * R)}, ${T.lit}, ${T.edge} ${px(R * 1.5)}), ${P.bg}`;
    const sp = Math.max(8, 2 * Math.round(prm.spacing * 0.6)), d = Math.max(0.8, prm.dot);
    const layer = (i, shift, dot, alpha, mask) => {
      let e = fbEls[i];
      if (!e) {
        e = document.createElement('div');
        e.setAttribute('aria-hidden', 'true');
        Object.assign(e.style, { position: 'absolute', inset: '0', zIndex: '-1', pointerEvents: 'none', borderRadius: 'inherit' });
        el.insertBefore(e, el.firstChild);
        fbEls[i] = e;
      }
      const ox = Math.round(gx) + shift, oy = Math.round(gy) + shift;
      e.style.background = `radial-gradient(circle, ${rgba(T.dot, alpha)} 0 ${dot}px, transparent ${dot + 0.7}px) ${ox - sp / 2}px ${oy - sp / 2}px / ${sp}px ${sp}px`;
      e.style.webkitMaskImage = mask;
      e.style.maskImage = mask;
    };
    // the front: an even grid (whole-pixel cells, so no dot smears) that thins toward the rim; the
    // limb: the same grid shifted half a cell fills in, twice the density, as foreshortening packs the
    // dots there
    layer(0, 0, d, T.gain * 0.8, `radial-gradient(circle at ${at}, #000 0, rgba(0,0,0,.85) ${px(R * 0.45)}, rgba(0,0,0,.3) ${px(R * 0.9)}, transparent ${px(R)})`);
    layer(1, sp / 2, d * 0.8, T.gain * 0.6, `radial-gradient(circle at ${at}, transparent ${px(R * 0.6)}, rgba(0,0,0,.7) ${px(R * 0.86)}, rgba(0,0,0,.4) ${px(R * 0.97)}, transparent ${px(R)})`);
  }
  function applyFallback(reason) {
    fallbackOn = true;
    releaseGL();
    for (const c of [ground, over, grainEl]) c.remove();
    fallbackPaint();
    el.dataset.fxFallback = reason;
  }

  /* ---- the body, halo and rim light: painted on resize and palette change ---- */
  function paintGround() {
    const g = gctx, { gx, gy, R } = pl, k = scaleOf(ground);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, ground.width, ground.height);
    g.setTransform(k, 0, 0, k, -box.x * k, -box.y * k);
    if (T.haloA > 0.001) {
      const R1 = R * 1.25;
      const hg = g.createRadialGradient(gx, gy, R * 0.94, gx, gy, R1);
      for (let i = 0; i <= 10; i++) { const s = i / 10; hg.addColorStop(s, rgba(T.halo, T.haloA * Math.exp(-s * s * 4.2) * (1 - s))); }
      g.fillStyle = hg;
      g.fillRect(gx - R1, gy - R1, R1 * 2, R1 * 2);
    }
    g.save();
    g.beginPath();
    g.arc(gx, gy, R, 0, Math.PI * 2);
    g.clip();
    const lx = gx - 0.38 * R, ly = gy - 0.42 * R;
    const bd = g.createRadialGradient(lx, ly, 0, lx, ly, R * 1.6);
    bd.addColorStop(0, T.lit);
    bd.addColorStop(0.45, color.mix(T.lit, T.edge, 0.45));
    bd.addColorStop(1, T.edge);
    g.fillStyle = bd;
    g.fillRect(gx - R, gy - R, R * 2, R * 2);
    if (T.rimA > 0.001) {
      // a thin lit atmosphere just inside the limb
      const rg = g.createRadialGradient(gx, gy, R * 0.8, gx, gy, R);
      rg.addColorStop(0, rgba(T.rim, 0));
      rg.addColorStop(0.75, rgba(T.rim, T.rimA * 0.3));
      rg.addColorStop(1, rgba(T.rim, T.rimA));
      g.fillStyle = rg;
      g.fillRect(gx - R, gy - R, R * 2, R * 2);
    }
    g.restore();
    // a still grain over the whole frame (one CSS tile), so the body's soft gradient never bands
    Object.assign(grainEl.style, { position: 'absolute', inset: '0', zIndex: '-1', pointerEvents: 'none', borderRadius: 'inherit', backgroundImage: grainCSS(T.dark ? 0.045 : 0.05) });
  }
  function makeHead() {
    const S = 32, c = document.createElement('canvas');
    c.width = c.height = S;
    const x = c.getContext('2d');
    const gr = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    for (let i = 0; i <= 8; i++) { const s = i / 8; gr.addColorStop(s, rgba(T.head, Math.exp(-s * s * 6) * (1 - s))); }
    x.fillStyle = gr;
    x.fillRect(0, 0, S, S);
    return c;
  }

  /* ---- WebGL: made when the globe comes on screen, released a few seconds after it leaves ---- */
  function onLost(e) {
    e.preventDefault();
    if (dead) return;
    const c = dotsCv;
    glr = null; dotsCv = null;
    if (glDone) { glDone(); glDone = null; }
    if (c) { c.removeEventListener('webglcontextlost', onLost); c.remove(); }
    if (++losses > 2) { use2D = true; fit(true); }
    setTimeout(() => { if (!dead) lc.redraw(); }, 60);
  }
  function ensureGL() {
    if (glr || use2D || dead || fallbackOn) return;
    const c = mk();
    glDone = glBudget(holder);
    const r = makeGL(c);
    if (!r) { glDone(); glDone = null; use2D = true; fit(true); return; }
    glr = r; dotsCv = c;
    c.addEventListener('webglcontextlost', onLost);
    sizeCanvas(c);
    el.insertBefore(c, over);
    upload();
  }
  function releaseGL() {
    clearTimeout(releaseTimer);
    releaseTimer = 0;
    const r = glr, c = dotsCv;
    glr = null; dotsCv = null;
    if (glDone) { glDone(); glDone = null; }
    if (c) c.removeEventListener('webglcontextlost', onLost);
    if (r && !r.gl.isContextLost()) {
      try { r.gl.deleteBuffer(r.buf); r.gl.deleteProgram(r.prog); r.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) { /* gone */ }
    }
    if (c) c.remove();
  }

  /* ---- layout and data ---- */
  function upload() {
    if (!glr || !L) return;
    const g = glr.gl, n = L.N, data = new Float32Array(n * 5);
    for (let i = 0; i < n; i++) {
      data[i * 5] = L.pos[i * 3]; data[i * 5 + 1] = L.pos[i * 3 + 1]; data[i * 5 + 2] = L.pos[i * 3 + 2];
      data[i * 5 + 3] = L.land[i]; data[i * 5 + 4] = L.rnd[i];
    }
    g.bindBuffer(g.ARRAY_BUFFER, glr.buf);
    g.bufferData(g.ARRAY_BUFFER, data, g.STATIC_DRAW);
    glr.n = n;
  }
  // the dot count follows the radius in 10% steps, so most resizes keep the lattice
  function wantN() {
    const sp = use2D ? Math.max(prm.spacing, 10) : prm.spacing;
    const Rq = Math.pow(1.1, Math.round(Math.log(Math.max(20, pl.R)) / Math.log(1.1)));
    return Math.round(Math.min(36000, Math.max(300, (4 * Math.PI * Rq * Rq) / (sp * sp))));
  }
  function latticeFor(N) {
    const key = `${landKey}|${N}`;
    let Lx = lattices.get(key);
    if (!Lx) {
      Lx = lattice(N, sd, land);
      Lx.key = key;
      lattices.set(key, Lx);
      if (lattices.size > 3) lattices.delete(lattices.keys().next().value);
    }
    return Lx;
  }
  function setLand() {
    const key = prm.map >= 0.5 && earthSampler() ? 'earth' : `noise:${prm.land}`;
    if (key === landKey) return false;
    landKey = key;
    land = landFn(prm, sd);
    lattices.clear();
    hubs = pickHubs(prm, sd, land);
    arcCache = new Map();
    stillSet = null;
    return true;
  }
  // a new lattice at once when there is none (or the land changed); after a resize it waits 150 ms and
  // the old one is drawn at the new size meanwhile
  function ensureLattice(now) {
    const N = wantN();
    if (L && L.key === `${landKey}|${N}`) return;
    clearTimeout(rebuildTimer);
    rebuildTimer = 0;
    if (!L || now) { L = latticeFor(N); upload(); return; }
    rebuildTimer = setTimeout(() => {
      rebuildTimer = 0;
      if (dead || fallbackOn) return;
      L = latticeFor(wantN());
      upload();
      lc.redraw();
    }, 150);
  }
  // the body is soft gradients only, so its canvas stays at 1x; dots and arcs get the full (capped) DPR
  const scaleOf = c => (c === ground ? Math.min(dpr, 1) : dpr);
  function sizeCanvas(c) {
    const k = scaleOf(c);
    const cw = Math.max(1, Math.round(box.w * k)), ch = Math.max(1, Math.round(box.h * k));
    if (c.width !== cw) c.width = cw;
    if (c.height !== ch) c.height = ch;
    Object.assign(c.style, { left: `${box.x}px`, top: `${box.y}px`, width: `${box.w}px`, height: `${box.h}px` });
  }
  function fit(force) {
    const w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return false;
    const d = Math.min(window.devicePixelRatio || 1, use2D ? MAX_DPR_2D : MAX_DPR);
    if (!force && w === W && h === H && d === dpr && L) return false;
    const moved = w !== W || h !== H;
    W = w; H = h; dpr = d;
    pl = place(W, H, prm, sd);
    if (fallbackOn) { fallbackPaint(); return false; }
    const k = BOX * pl.R;
    const x0 = Math.max(0, Math.floor(pl.gx - k)), y0 = Math.max(0, Math.floor(pl.gy - k));
    const x1 = Math.min(W, Math.ceil(pl.gx + k)), y1 = Math.min(H, Math.ceil(pl.gy + k));
    box = { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
    for (const c of [ground, over, dotsCv]) if (c) sizeCanvas(c);
    setLand();
    ensureLattice(!moved);
    paintGround();
    // arcs not yet born are chosen again for the new layout; the live one stays
    for (const [kk, a] of arcCache) if (!a || a.born > lastT) arcCache.delete(kk);
    stillSet = null;
    return true;
  }

  /* ---- time ---- */
  const spin0 = () => (prm.map >= 0.5 ? -view * DEG - STILL_T * prm.speed * DEG : free0 * DEG);
  const matAt = t => rotMat(spin0() + t * prm.speed * DEG, prm.tilt * DEG, roll);
  const calmRadius = () => (0.35 + 0.4 * prm.calm) * H;
  const calmAt = (x, y) => prm.calm * (1 - sstep(calmRadius() * 0.35, calmRadius(), Math.hypot(x - prm.calmX * W, y - prm.calmY * H)));
  const screen = p => [pl.gx + p[0] * pl.R, pl.gy - p[1] * pl.R];
  // a hub can carry an arc at matrix m when it faces the viewer, is inside the frame and off the text
  function hubOk(m) {
    return hubs.map(h => {
      const p = rot(m, h[0], h[1], h[2]);
      if (p[2] < 0.45) return false;
      const [x, y] = screen(p);
      return x > W * 0.05 && x < W * 0.95 && y > H * 0.08 && y < H * 0.92 && calmAt(x, y) < 0.3;
    });
  }
  function pairs(okA, okB, r) {
    const out = [];
    const lo = Math.cos(74 * DEG), hi = Math.cos(22 * DEG);
    for (let i = 0; i < hubs.length; i++) for (let j = i + 1; j < hubs.length; j++) {
      if (!okA[i] || !okA[j] || !okB[i] || !okB[j]) continue;
      const a = hubs[i], b = hubs[j], c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      if (c < lo || c > hi) continue;
      out.push(r() < 0.5 ? [i, j] : [j, i]);
    }
    return out;
  }
  // arc k is born at (k - 0.5) * period; its two hubs follow from the seed and k alone, so a frozen
  // clock or a still frame always shows the same scene
  function arcFor(k) {
    if (arcCache.has(k)) return arcCache.get(k);
    const born = (k - 0.5) * prm.arcs;
    const r = rng(`arc:${sd}:${k}`);
    const list = pairs(hubOk(matAt(born)), hubOk(matAt(born + LIFE)), r);
    const pick = list.length ? list[Math.floor(r() * list.length)] : null;
    const arc = pick ? { i: pick[0], j: pick[1], born } : null;
    if (arcCache.size > 48) arcCache.delete(arcCache.keys().next().value);
    arcCache.set(k, arc);
    return arc;
  }
  // reduced motion: two finished arcs from one shared hub, no busier than the live globe
  function stillArcs(t) {
    if (stillSet && stillSet.t === t) return stillSet.arcs;
    const r = rng(`still:${sd}`);
    const ok = hubOk(matAt(t));
    const list = pairs(ok, ok, r);
    const arcs = [];
    if (list.length) {
      const [i, j] = list.splice(Math.floor(r() * list.length), 1)[0];
      arcs.push({ i, j, born: t - DRAW - HOLD * 0.5 });
      const idx = list.findIndex(([a, b]) => a === i || b === i || a === j || b === j);
      if (idx >= 0) { const [a, b] = list[idx]; arcs.push({ i: a, j: b, born: t - DRAW - HOLD * 0.5 }); }
    }
    stillSet = { t, arcs };
    return arcs;
  }

  /* ---- drawing (2D contexts work in CSS px of the frame; the transform maps them into the box) ---- */
  function glDraw(m) {
    const g = glr.gl, U = glr.u;
    g.viewport(0, 0, dotsCv.width, dotsCv.height);
    g.clearColor(0, 0, 0, 0);
    g.clear(g.COLOR_BUFFER_BIT);
    if (!glr.n) return;
    g.useProgram(glr.prog);
    g.enable(g.BLEND);
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA);
    g.bindBuffer(g.ARRAY_BUFFER, glr.buf);
    g.enableVertexAttribArray(0);
    g.vertexAttribPointer(0, 3, g.FLOAT, false, 20, 0);
    g.enableVertexAttribArray(1);
    g.vertexAttribPointer(1, 2, g.FLOAT, false, 20, 12);
    g.uniformMatrix3fv(U.rot, false, [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);
    g.uniform2f(U.res, dotsCv.width, dotsCv.height);
    g.uniform3f(U.globe, (pl.gx - box.x) * dpr, (pl.gy - box.y) * dpr, pl.R * dpr);
    g.uniform1f(U.dot, prm.dot * dpr);
    g.uniform3f(U.k, prm.sea, prm.back, T.gain);
    g.uniform3f(U.light, LIGHT[0], LIGHT[1], LIGHT[2]);
    g.uniform4f(U.calm, (prm.calmX * W - box.x) * dpr, (prm.calmY * H - box.y) * dpr, calmRadius() * dpr, prm.calm * 0.85);
    g.uniform3fv(U.col, color.rgb(T.dot));
    g.uniform3fv(U.col2, color.rgb(T.dot2));
    if (prm.back > 0) { g.uniform1f(U.pass, 0); g.drawArrays(g.POINTS, 0, glr.n); }
    g.uniform1f(U.pass, 1);
    g.drawArrays(g.POINTS, 0, glr.n);
  }
  // the same dots on the 2D canvas when WebGL is missing: grouped by alpha into a few filled paths
  function dots2D(m) {
    const B = 12, paths = Array.from({ length: B }, () => new Path2D());
    const used = new Uint8Array(B);
    const n = L.N, R = pl.R;
    for (let i = 0; i < n; i++) {
      const x0 = L.pos[i * 3], y0 = L.pos[i * 3 + 1], z0 = L.pos[i * 3 + 2];
      const z = m[6] * x0 + m[7] * y0 + m[8] * z0;
      if (z < 0 && prm.back <= 0) continue;
      const x = m[0] * x0 + m[1] * y0 + m[2] * z0, y = m[3] * x0 + m[4] * y0 + m[5] * z0;
      const lv = L.land[i];
      let a, r;
      if (z >= 0) {
        const lit = 0.68 + 0.32 * Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
        a = (0.1 + 0.9 * Math.pow(z, 0.8)) * lit * (prm.sea + (1 - prm.sea) * lv);
        r = prm.dot * (0.55 + 0.45 * z) * (0.72 + 0.28 * lv);
      } else {
        a = prm.back * (0.4 + 0.6 * (1 + z)) * (prm.sea * 0.5 + (1 - prm.sea * 0.5) * lv);
        r = prm.dot * 0.6;
      }
      const sx = pl.gx + x * R, sy = pl.gy - y * R;
      a *= T.gain * (1 - 0.85 * calmAt(sx, sy));
      if (a < 0.01) continue;
      const b = Math.min(B - 1, Math.floor(a * B));
      const rr = Math.max(0.5, r);
      paths[b].moveTo(sx + rr, sy);
      paths[b].arc(sx, sy, rr, 0, Math.PI * 2);
      used[b] = 1;
    }
    ctx.fillStyle = T.dot;
    for (let b = 0; b < B; b++) if (used[b]) { ctx.globalAlpha = (b + 0.5) / B; ctx.fill(paths[b]); }
    ctx.globalAlpha = 1;
  }
  // points of the arc from hub a to hub b up to share `upto`, lifted off the surface, with visibility
  function arcPath(a, b, upto, m) {
    const c = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
    const om = Math.acos(c), so = Math.sin(om) || 1e-6;
    const lift = 0.08 + 0.26 * (om / (Math.PI / 2));
    const n = Math.max(2, Math.ceil(upto * 64));
    const pts = new Float32Array((n + 1) * 3);
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * upto;
      const wa = Math.sin((1 - s) * om) / so, wb = Math.sin(s * om) / so, h = 1 + lift * Math.sin(Math.PI * s);
      const p = rot(m, (wa * a[0] + wb * b[0]) * h, (wa * a[1] + wb * b[1]) * h, (wa * a[2] + wb * b[2]) * h);
      const vis = p[2] >= 0 ? 1 : 1 - (1 - sstep(0.985, 1.02, Math.hypot(p[0], p[1]))) * sstep(0, 0.05, -p[2]);
      pts[i * 3] = pl.gx + p[0] * pl.R; pts[i * 3 + 1] = pl.gy - p[1] * pl.R; pts[i * 3 + 2] = vis;
    }
    return pts;
  }
  function strokeArc(pts, alpha) {
    const n = pts.length / 3;
    const x0 = pts[0], y0 = pts[1], x1 = pts[(n - 1) * 3], y1 = pts[(n - 1) * 3 + 1];
    if (Math.hypot(x1 - x0, y1 - y0) < 0.5) return;
    const gr = ctx.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, rgba(T.arc, alpha * 0.08));
    gr.addColorStop(0.5, rgba(T.arc, alpha * 0.42));
    gr.addColorStop(1, rgba(T.arc, alpha));
    ctx.strokeStyle = gr;
    ctx.lineWidth = 1.25;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i < n; i++) {
      if (pts[i * 3 + 2] < 0.5) { pen = false; continue; }
      if (pen) ctx.lineTo(pts[i * 3], pts[i * 3 + 1]); else { ctx.moveTo(pts[i * 3], pts[i * 3 + 1]); pen = true; }
    }
    ctx.stroke();
  }
  function dot(x, y, r, fill, a) {
    ctx.globalAlpha = a;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  function ring(x, y, r, stroke, a, w = 1) {
    ctx.globalAlpha = a;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawNetwork(t, m, still) {
    const live = [];
    if (prm.arcs > 0 && hubs.length > 1) {
      if (still) live.push(...stillArcs(t));
      else {
        const P0 = prm.arcs;
        for (let k = Math.max(0, Math.floor((t - LIFE) / P0 + 0.5)); k <= Math.floor(t / P0 + 0.5); k++) {
          const a = arcFor(k);
          if (a && t >= a.born && t < a.born + LIFE) live.push(a);
        }
      }
    }
    // hubs: small steady nodes that never change with the traffic
    hubs.forEach(h => {
      const p = rot(m, h[0], h[1], h[2]);
      if (p[2] <= 0.15) return;
      const [x, y] = screen(p);
      // nodes near the rim fade out early, so none sits on the limb as a stray speck
      const fade = sstep(0.15, 0.5, p[2]) * (1 - 0.9 * calmAt(x, y));
      if (fade < 0.01) return;
      dot(x, y, 1.6, T.arc, fade * 0.7);
      ring(x, y, 4.2, T.arc, fade * 0.2);
    });
    for (const a of live) {
      const age = t - a.born;
      const head = still ? 1 : easeInOut(Math.min(1, age / DRAW));
      const f = still ? 1 : (age > DRAW + HOLD ? 1 - (age - DRAW - HOLD) / FADE : 1) * sstep(0, 0.25, age);
      const A = hubs[a.i], B = hubs[a.j];
      const pts = arcPath(A, B, Math.max(0.002, head), m);
      const n = pts.length / 3;
      const hx = pts[(n - 1) * 3], hy = pts[(n - 1) * 3 + 1];
      const cm = 1 - 0.85 * calmAt((pts[0] + hx) / 2, (pts[1] + hy) / 2);
      ctx.globalAlpha = 1;
      strokeArc(pts, (T.dark ? 0.9 : 0.95) * f * cm);
      if (!still && head < 1 && pts[(n - 1) * 3 + 2] > 0.5) {
        // the travelling head: a small soft point
        const s = 8;
        ctx.globalAlpha = 0.8 * f * cm;
        ctx.drawImage(headSprite, hx - s / 2, hy - s / 2, s, s);
        dot(hx, hy, 1.3, T.head, f * cm);
      }
      if (!still && age >= DRAW && age < DRAW + 1) {
        // one faint ring on arrival, 7 px at most
        const q = age - DRAW;
        const [x, y] = screen(rot(m, B[0], B[1], B[2]));
        ring(x, y, 2.5 + 4.5 * easeOut(q), T.arc, 0.3 * (1 - q) * (1 - q) * cm);
      }
    }
    ctx.globalAlpha = 1;
  }

  function draw(t, dt) {
    if (dead || fallbackOn || !W || !H || !L) return;
    // a 60 fps cap on fast screens (30 without WebGL); stills and redraws always draw
    if (dt > 0) {
      acc += dt;
      if (acc < 1 / (use2D ? 30 : 60) - 0.004) return;
      acc = 0;
    }
    lastT = t;
    const still = !!(reducedQuery && reducedQuery.matches) && config.clock == null;
    if (!use2D) ensureGL();
    holder.seen = performance.now();
    const m = matAt(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, over.width, over.height);
    ctx.setTransform(dpr, 0, 0, dpr, -box.x * dpr, -box.y * dpr);
    if (glr) glDraw(m); else dots2D(m);
    if (!headSprite) headSprite = makeHead();
    drawNetwork(t, m, still);
    if (!shown) { shown = true; for (const c of [ground, over, dotsCv]) if (c) c.style.opacity = '1'; }
  }

  const lc = lifecycle(el, {
    draw,
    still: STILL_T,
    fps: 60,
    idle: () => fallbackOn, // the CSS stand-in is still: no frame loop
    onShow() { clearTimeout(releaseTimer); releaseTimer = 0; },
    onHide() { clearTimeout(releaseTimer); releaseTimer = setTimeout(releaseGL, 4000); },
  });
  if (fallbackOn) applyFallback(config.forceFallback ? 'forced' : 'no-canvas');
  const ro = new ResizeObserver(() => { if (fit(false)) lc.redraw(); });
  ro.observe(el);
  if (fit(false)) lc.redraw();

  function refresh() {
    T = tones(P, prm);
    if (ownBg) el.style.backgroundColor = P.bg;
    headSprite = null;
    if (fallbackOn) { pl = place(W || el.clientWidth || 1200, H || el.clientHeight || 675, prm, sd); fallbackPaint(); return; }
    if (!W || !H) return;
    if (setLand()) { L = null; }
    fit(true);
    lc.redraw();
  }

  return {
    pause: () => lc.pause(),
    resume: () => lc.resume(),
    redraw: () => lc.redraw(),
    set(next) {
      prm = resolveParams(params, { ...prm, ...next });
      arcCache = new Map();
      refresh();
      return prm;
    },
    setPalette(p) {
      P = normalizePalette(p);
      refresh();
    },
    destroy() {
      dead = true;
      clearTimeout(rebuildTimer);
      lc.destroy();
      ro.disconnect();
      releaseGL();
      for (const c of [ground, over, grainEl]) c.remove();
      for (const e of fbEls) e.remove();
      fbEls = [];
      if (fallbackOn) { el.style.background = ''; delete el.dataset.fxFallback; }
      if (ownBg) el.style.backgroundColor = P.bg;
    },
    get canvas() { return over; },
    get info() {
      return { webgl: glr ? 1 : 0, canvas: glr ? 'webgl+2d' : '2d', fallback: fallbackOn ? el.dataset.fxFallback : null, dpr, size: [over.width, over.height], box, dots: L ? L.N : 0, land: landKey, globe: pl, running: lc.running };
    },
  };
}

export default {
  id: 'dotted-globe',
  name: 'Dotted globe',
  family: 'pattern',
  params,
  mount: mountGlobe,
};
