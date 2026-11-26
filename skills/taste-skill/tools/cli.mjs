import path from 'node:path';
import {encode} from './png.mjs';
import fs from 'node:fs';
import {parseArgs} from 'node:util';

const palettes = JSON.parse(fs.readFileSync(new URL('../library/palettes.json', import.meta.url), 'utf8'));
const roles = ['bg', 'ink', 'accent', 'muted'];
const switches = {gradient: ['zone','rich','hues','tier','placement'], pattern: ['fade'], divider: ['next']};
const extraFormats = {gradient: ['settings','png'], grain: ['uri'], shape: ['path']};

function colour(value) {
  const token = value.trim();
  if (/^#[a-f\d]{6}$/i.test(token)) return token.toLowerCase();
  if (/^#[a-f\d]{3}$/i.test(token)) return '#' + [...token.slice(1)].map(c => c+c).join('');
  const rgb = token.match(/^rgb\(\s*([\d.]+)(%?)[,\s]+([\d.]+)(%?)[,\s]+([\d.]+)(%?)\s*\)$/i);
  if (rgb) {
    const channels = [1, 3, 5].map(i => +rgb[i] * (rgb[i+1] ? 2.55 : 1));
    if (channels.every(v => v <= 255)) return '#' + channels.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
  throw Error('Expected an opaque hex or rgb() colour, received '+token);
}

function readPage(filename) {
  const source = fs.readFileSync(filename, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const tokens = new Map();
  for (const [, key, value] of source.matchAll(/(--[\w-]+)\s*:\s*([^;}]+)/g)) {
    if (!tokens.has(key)) tokens.set(key, value.trim());
  }
  const palette = {};
  for (const role of roles) {
    let key = tokens.has('--p-'+role) ? '--p-'+role : '--'+role;
    if (!tokens.has(key) && role === 'muted') continue;
    const seen = new Set();
    while (true) {
      if (seen.has(key)) throw Error('Cyclic colour token '+key);
      seen.add(key);
      const value = tokens.get(key);
      if (!value) throw Error('Missing colour token '+key);
      const alias = value.match(/^var\(\s*(--[\w-]+)\s*\)$/);
      if (alias) { key = alias[1]; continue; }
      palette[role] = colour(value);
      break;
    }
  }
  return palette;
}

function readPalette(options) {
  if ([options.from, options.colours, options.palette].filter(Boolean).length > 1)
    throw Error('Choose one palette source.');
  if (options.from) return readPage(options.from);
  if (options.colours) {
    const values = options.colours.trim().split(/[ ,]+/);
    if (values.length < 3 || values.length > 4) throw Error('Expected ground, ink, accent and optional muted.');
    return Object.fromEntries(values.map((value, i) => [roles[i], colour(value)]));
  }
  const palette = palettes.find(p => p.id === (options.palette ?? 'white-link-blue'));
  if (!palette) throw Error('Unknown palette '+options.palette);
  return palette;
}

export function run(name, tool) {
  try {
    const keys = ['preset','seed','palette','from','colours','format','out', ...(switches[name] ?? []), ...Object.keys(tool.knobs)];
    const flags = Object.fromEntries(keys.map(key => [key, {type:'string'}]));
    const {values: options} = parseArgs({options: {...flags, help:{type:'boolean'}}});
    const formats = ['css', 'svg', ...(extraFormats[name] ?? [])];
    if (options.help) {
      const ranges = Object.entries(tool.knobs).map(([key,[min,max,value]]) => '  --'+key+' '+(key==='exponent'?'positive finite number':min+'..'+max)+' (default '+value+')');
      console.log([
        name+' — '+tool.uses.join(', '),
        ...(tool.showPresets?['Quiet presets: '+tool.presets.join(', '),'Show presets: '+tool.showPresets.join(', ')]:['Presets: '+tool.presets.join(', ')]),
        'Options: '+keys.map(k => '--'+k).join(' '),
        ...ranges,
        ...(name==='gradient'?['Show: --tier show --rich 0..1 --hues "#rrggbb,#rrggbb,#rrggbb,#rrggbb" --placement panel|ground','Raster CSS and SVG require the adjacent PNG. Use --out hero.css to write both.']:[]),
        'Formats: '+formats.join(', '),
        'Colours: ground,ink,accent[,muted] in hex.',
      ].join('\n'));
      return;
    }
    if(options.tier && !['quiet','show'].includes(options.tier))throw Error('Choose quiet or show.');
    options.preset ??= options.tier==='show'?tool.showPresets[0]:tool.presets[0];
    if(options.tier && (options.tier==='show')!==tool.showPresets.includes(options.preset))throw Error('Preset belongs to the other tier.');
    if (![...tool.presets,...(tool.showPresets??[])].includes(options.preset)) throw Error('Unknown preset '+options.preset);
    for (const [key,[min,max]] of Object.entries(tool.knobs)) {
      if (options[key] === undefined) continue;
      const n = Number(options[key]);
      if (!Number.isFinite(n) || (key==='exponent' ? n<=0 : n<min || n>max)) throw Error(key+' outside '+min+'..'+max);
      options[key] = n;
    }
    if (options.zone && !['left','centre','top','none'].includes(options.zone)) throw Error('Unknown text zone');
    if (options.fade && !['radial','linear','none'].includes(options.fade)) throw Error('Unknown fade');
    if (options.next) options.next = colour(options.next);
    const format = options.format ?? (options.out?.endsWith('.png') ? 'png' : options.out?.toLowerCase().endsWith('.svg') ? 'svg' : 'css');
    if (!formats.includes(format)) throw Error('Unavailable format '+format);
    const picture=options.out?path.parse(options.out).name+'.png':options.preset+'.png';
    const result = tool.generate({...options, picture:encodeURIComponent(picture),palette:readPalette(options)});
    if(result.pixels && options.out && ['css','svg'].includes(format)) fs.writeFileSync(path.join(path.dirname(options.out),picture),encode(result));
    if(format==='png'&&!result.pixels)throw Error('PNG export requires a raster preset.');
    const output = format==='png'?encode(result):typeof result[format] === 'string' ? result[format] : JSON.stringify(result[format], null, 2);
    if (options.out) fs.writeFileSync(options.out, output);
    else process.stdout.write(output);
    if (result.ratio) console.error((result.zone?'Text zone '+result.zone+' · ':'')+'Contrast '+result.ratio.toFixed(2)+':1');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
