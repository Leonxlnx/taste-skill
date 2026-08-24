import { getTxtRecords } from './dns';

export interface SpfResult {
  exists: boolean;
  records: string[];
  multipleRecords: boolean;
  softfail: boolean;
  hardfail: boolean;
  tooManyLookups: boolean;
  raw: string[];
}

export async function checkSpf(domain: string): Promise<SpfResult> {
  const txtRecords = await getTxtRecords(domain);
  const spfRecords = txtRecords
    .map(r => r.join(''))
    .filter(r => r.toLowerCase().startsWith('v=spf1'));

  const exists = spfRecords.length > 0;
  const multipleRecords = spfRecords.length > 1;
  const primary = spfRecords[0] ?? '';
  const softfail = primary.includes('~all');
  const hardfail = primary.includes('-all');

  // Count DNS-lookup mechanisms (a, mx, include, exists, redirect)
  const lookupMechanisms = (primary.match(/\b(include:|a:|mx:|exists:|redirect=)/gi) ?? []).length;
  const tooManyLookups = lookupMechanisms > 10;

  return { exists, records: spfRecords, multipleRecords, softfail, hardfail, tooManyLookups, raw: spfRecords };
}
