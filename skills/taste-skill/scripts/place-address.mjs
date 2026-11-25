// Recognize supplied street names without treating mentions of a missing street as an address.
const streetName = /(?:\b(?:\d+[A-Za-z]?\s+)?[\p{Lu}][\p{L}'’-]*(?:\s+[\p{Lu}][\p{L}'’-]*){0,2}\s+(?:Street|St\.|Road|Rd\.|Lane|Avenue|Boulevard|Drive|Square)(?=[\s,.;]|$)|(?:[\p{Lu}][\p{L}'’-]+er\s+)?[\p{Lu}][\p{L}'’-]*(?:straße|strasse|gasse|gatan|vägen|straat|gracht)\b(?:\s+\d+[A-Za-z]?)?)/u;
export function suppliedStreet(text) {
  const explicit = text.match(/^street(?: address)?:\s*([^\n;]+)/im)?.[1]?.trim();
  if (explicit && !/^(?:none|no |not |missing|unknown|needed|unsupplied)/i.test(explicit)) return explicit.split(',')[0];
  return text.match(streetName)?.[0] || '';
}

export function areaInSource(query,source) {
  const tokens = s => s.toLowerCase().normalize('NFC').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const terms = tokens(query), supplied = new Set(tokens(source));
  const town = source.match(/^(?:city|town):\s*([^\n,;.]+)/im)?.[1];
  return terms.length > 0 && terms.every(w => supplied.has(w)) && (!town || tokens(town).join(' ') !== terms.join(' '));
}
