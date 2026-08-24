import { getTxtRecords } from './dns';

export interface DmarcResult {
  exists: boolean;
  policy: 'none' | 'quarantine' | 'reject' | null;
  hasRua: boolean;
  hasRuf: boolean;
  hasSpPolicy: boolean;
  spPolicy: string | null;
  raw: string | null;
}

export async function checkDmarc(domain: string): Promise<DmarcResult> {
  const records = await getTxtRecords(`_dmarc.${domain}`);
  const flat = records.map(r => r.join('')).find(r => r.toLowerCase().startsWith('v=dmarc1'));

  if (!flat) {
    return { exists: false, policy: null, hasRua: false, hasRuf: false, hasSpPolicy: false, spPolicy: null, raw: null };
  }

  const get = (tag: string) => {
    const m = flat.match(new RegExp(`${tag}=([^;]+)`, 'i'));
    return m ? m[1].trim() : null;
  };

  const p = get('p') as 'none' | 'quarantine' | 'reject' | null;
  const sp = get('sp');

  return {
    exists: true,
    policy: p,
    hasRua: flat.toLowerCase().includes('rua='),
    hasRuf: flat.toLowerCase().includes('ruf='),
    hasSpPolicy: !!sp,
    spPolicy: sp,
    raw: flat,
  };
}
