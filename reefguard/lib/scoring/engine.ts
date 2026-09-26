export interface ScanData {
  spf: {
    exists: boolean;
    multipleRecords: boolean;
    softfail: boolean;
    tooManyLookups: boolean;
  };
  dkim: {
    found: boolean;
  };
  dmarc: {
    exists: boolean;
    policy: 'none' | 'quarantine' | 'reject' | null;
    hasRua: boolean;
    hasSpPolicy: boolean;
  };
  dnssec: {
    enabled: boolean;
  };
  caa: {
    exists: boolean;
  };
  reputation: {
    blacklistHits: number;
  };
  domain: {
    daysUntilExpiration: number | null;
  };
}

export interface ScoreResult {
  score: number;
  posture: 'healthy' | 'watch' | 'needs_improvement' | 'poor';
  deductions: Array<{ reason: string; points: number }>;
}

export function calculateScore(data: ScanData): ScoreResult {
  let score = 100;
  const deductions: Array<{ reason: string; points: number }> = [];

  const deduct = (reason: string, points: number) => {
    score -= points;
    deductions.push({ reason, points });
  };

  if (!data.dmarc.exists) deduct('Missing DMARC', 25);
  else if (data.dmarc.policy === 'none') deduct('DMARC p=none', 15);
  if (!data.dmarc.hasRua) deduct('No DMARC rua', 5);
  if (!data.dmarc.hasSpPolicy) deduct('No DMARC sp policy', 5);

  if (!data.spf.exists) deduct('SPF missing', 20);
  else {
    if (data.spf.multipleRecords) deduct('Multiple SPF records', 25);
    if (data.spf.softfail) deduct('SPF softfail (~all)', 8);
    if (data.spf.tooManyLookups) deduct('SPF too many DNS lookups', 15);
  }

  if (!data.dkim.found) deduct('DKIM missing', 20);
  if (!data.dnssec.enabled) deduct('DNSSEC missing', 5);
  if (!data.caa.exists) deduct('CAA missing', 3);

  if (data.reputation.blacklistHits > 0) deduct('Reputation blacklist hit', 30);

  if (data.domain.daysUntilExpiration !== null && data.domain.daysUntilExpiration < 30) {
    deduct('Domain expiration under 30 days', 20);
  }

  score = Math.max(0, Math.min(100, score));

  let posture: ScoreResult['posture'];
  if (score >= 90) posture = 'healthy';
  else if (score >= 70) posture = 'watch';
  else if (score >= 50) posture = 'needs_improvement';
  else posture = 'poor';

  return { score, posture, deductions };
}
