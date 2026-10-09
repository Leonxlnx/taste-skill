import { getCaaRecords } from './dns';
import type { CaaRecord } from 'dns';

export interface CaaResult {
  exists: boolean;
  records: CaaRecord[];
}

export async function checkCaa(domain: string): Promise<CaaResult> {
  const records = await getCaaRecords(domain);
  return { exists: records.length > 0, records: records as CaaRecord[] };
}
