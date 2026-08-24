import { resolveTxt, resolveMx, resolveNs, resolveCaa } from 'dns/promises';

export async function getTxtRecords(domain: string): Promise<string[][]> {
  try {
    return await resolveTxt(domain);
  } catch {
    return [];
  }
}

export async function getMxRecords(domain: string) {
  try {
    return await resolveMx(domain);
  } catch {
    return [];
  }
}

export async function getNsRecords(domain: string) {
  try {
    return await resolveNs(domain);
  } catch {
    return [];
  }
}

export async function getCaaRecords(domain: string) {
  try {
    return await resolveCaa(domain);
  } catch {
    return [];
  }
}
