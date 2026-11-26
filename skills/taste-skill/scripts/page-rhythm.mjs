const routes = {
  physical: 'hero object-in-use annotated-plate specifications box-contents compatibility comparison price-and-delivery closing-action',
  software: 'hero wide-product-view logo-wall feature-grid split comparison single-quote pricing closing-action',
  tech: 'hero wide-product-view evidence code-panel feature-grid integration-grid comparison pricing closing-action',
  product: 'hero wide-product-view figures annotated-plate steps comparison case-studies inventory closing-action',
  gaming: 'hero wide-product-view editorial-statement photo-gallery product-shelf closing-action',
  service: 'hero case-studies wide-product-view steps team closing-action',
  place: 'hero product-shelf photo-gallery split event-list visit-hours closing-action'
};
function rowFamily(row) {
  const word = row.match(/(?:^|\|)\s*family\s+([a-z][a-z0-9-]*)\s*(?=\||$)/i)?.[1].toLowerCase();
  return word?.startsWith('split-') ? 'split' : word || null;
}
const widths = {
  'wide-product-view':'wide', 'object-in-use':'wide', 'annotated-plate':'wide', 'photo-gallery':'wide',
  'product-shelf':'wide', 'case-studies':'wide', 'editorial-statement':'reading',
  'code-panel':'reading', 'single-quote':'reading', 'closing-action':'reading'
};
function rhythmWidth(family) {
  return widths[family] || 'content';
}
export function dealRhythm(kind, rows = [], shows = []) {
  const sequence = routes[kind].split(' ');
  const families = rows.map(rowFamily);
  const mapped = rows.map((row, i) => {
    const family = families[i];
    const width = row.match(/(?:^|\|)\s*width\s+(wide|content|reading|bleed)\s*(?=\||$)/i)?.[1];
    return { subject: shows[i], family, width: width?.toLowerCase() || rhythmWidth(family) };
  });
  return {
    usualSections: sequence.length,
    range: [sequence.length - 2, sequence.length + 2],
    sequence,
    widths: sequence.map(rhythmWidth),
    families,
    mapped,
    rules: 'Drop unsupported subjects. Use one wide view and change content width twice. At seven sections use four families or more. Keep consecutive splits to two.'
  };
}
