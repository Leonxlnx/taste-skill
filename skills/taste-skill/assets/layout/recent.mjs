import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const setting = process.env.TASTE_SKILL_RECENT;
const file = setting === 'off' || process.argv.includes('--no-recent') ? null
  : setting || path.join(os.homedir(), '.taste-skill', 'recent.json');
const limits = { palettes: 12, types: 6, heroes: 6 };

function read() {
  if (file) try { return JSON.parse(fs.readFileSync(file, 'utf8')) || {}; } catch { /* first deal */ }
  return {};
}
function ids(state, key) {
  const value = state[key];
  // Earlier files grouped palette IDs by trade.
  const list = Array.isArray(value) ? value : Object.values(value || {}).flat();
  return list.filter(id => typeof id === 'string').slice(-limits[key]);
}
export const recentIds = key => ids(read(), key);

export function recordIds(choices) {
  if (!file || process.argv.includes('--no-record')) return;
  const lock = file + '.lock', pending = file + '.' + process.pid + '.tmp';
  let held = false;
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    for (let i = 0; i < 100; i++) {
      try { fs.mkdirSync(lock); held = true; break; } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        try { if (Date.now() - fs.statSync(lock).mtimeMs > 60000) fs.rmdirSync(lock); } catch {}
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
      }
    }
    if (!held) return;
    const state = read();
    for (const [key,id] of Object.entries(choices)) if (limits[key] && id) state[key] = [...ids(state,key),id].slice(-limits[key]);
    fs.writeFileSync(pending, JSON.stringify(state) + '\n');
    fs.renameSync(pending,file);
  } catch (err) { console.error('recent deals: ' + err.message); }
  finally { if (held) { fs.rmSync(pending,{force:true}); fs.rmdirSync(lock); } }
}
