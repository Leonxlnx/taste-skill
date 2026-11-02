export function normFont(f) {
  return String(f).toLowerCase().replace(/["']/g, '').replace(/\s+variable$/, '').trim();
}

export function checkFonts(dealtFonts, usedFamilies) {
  const used = usedFamilies
    .filter((f) => f.share >= 0.1)
    .map((f) => normFont(f.family));
  const missing = dealtFonts.filter(
    (f) => !used.some((u) => u === normFont(f) || u.startsWith(normFont(f)))
  );
  return missing;
}

