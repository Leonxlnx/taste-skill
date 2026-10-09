import { getTxtRecords } from './dns';

const COMMON_SELECTORS = [
  'selector1', 'selector2', 'google', 'default', 'k1', 'dkim',
  'mail', 'smtp', 'mandrill', 'sendgrid', 'pm', 's1', 's2',
];

export interface DkimResult {
  found: boolean;
  selectors: string[];
}

export async function checkDkim(domain: string): Promise<DkimResult> {
  const found: string[] = [];
  await Promise.all(
    COMMON_SELECTORS.map(async selector => {
      const records = await getTxtRecords(`${selector}._domainkey.${domain}`);
      if (records.length > 0 && records.some(r => r.join('').toLowerCase().includes('v=dkim1'))) {
        found.push(selector);
      }
    })
  );
  return { found: found.length > 0, selectors: found };
}
