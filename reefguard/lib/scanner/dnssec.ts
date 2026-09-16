import { resolve } from 'dns/promises';

export interface DnssecResult {
  enabled: boolean;
}

export async function checkDnssec(domain: string): Promise<DnssecResult> {
  try {
    // DS records indicate DNSSEC is enabled
    await resolve(domain, 'DS' as Parameters<typeof resolve>[1]);
    return { enabled: true };
  } catch {
    return { enabled: false };
  }
}
