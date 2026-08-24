import { checkSpf } from './spf';
import { checkDmarc } from './dmarc';
import { checkDkim } from './dkim';
import { checkDnssec } from './dnssec';
import { checkCaa } from './caa';
import { checkReputation } from './reputation';
import { getMxRecords, getNsRecords } from './dns';
import { calculateScore, ScanData } from '../scoring/engine';

export interface FullScanResult {
  domain: string;
  spf: Awaited<ReturnType<typeof checkSpf>>;
  dmarc: Awaited<ReturnType<typeof checkDmarc>>;
  dkim: Awaited<ReturnType<typeof checkDkim>>;
  dnssec: Awaited<ReturnType<typeof checkDnssec>>;
  caa: Awaited<ReturnType<typeof checkCaa>>;
  reputation: Awaited<ReturnType<typeof checkReputation>>;
  mx: any[];
  ns: string[];
  score: number;
  posture: string;
  deductions: Array<{ reason: string; points: number }>;
  findings: Array<{ category: string; severity: string; title: string; description: string; remediation: string }>;
}

export async function scanDomain(domain: string): Promise<FullScanResult> {
  const [spf, dmarc, dkim, dnssec, caa, reputation, mx, ns] = await Promise.all([
    checkSpf(domain),
    checkDmarc(domain),
    checkDkim(domain),
    checkDnssec(domain),
    checkCaa(domain),
    checkReputation(domain),
    getMxRecords(domain),
    getNsRecords(domain),
  ]);

  const blacklistHits = reputation.filter(r => r.listed).length;

  const scanData: ScanData = {
    spf: {
      exists: spf.exists,
      multipleRecords: spf.multipleRecords,
      softfail: spf.softfail,
      tooManyLookups: spf.tooManyLookups,
    },
    dkim: { found: dkim.found },
    dmarc: {
      exists: dmarc.exists,
      policy: dmarc.policy,
      hasRua: dmarc.hasRua,
      hasSpPolicy: dmarc.hasSpPolicy,
    },
    dnssec: { enabled: dnssec.enabled },
    caa: { exists: caa.exists },
    reputation: { blacklistHits },
    domain: { daysUntilExpiration: null },
  };

  const { score, posture, deductions } = calculateScore(scanData);

  const findings = deductions.map(d => ({
    category: getCategoryForReason(d.reason),
    severity: getSeverityForPoints(d.points),
    title: d.reason,
    description: getDescription(d.reason),
    remediation: getRemediation(d.reason),
  }));

  return { domain, spf, dmarc, dkim, dnssec, caa, reputation, mx, ns, score, posture, deductions, findings };
}

function getCategoryForReason(reason: string): string {
  if (reason.includes('SPF')) return 'email_auth';
  if (reason.includes('DMARC')) return 'email_auth';
  if (reason.includes('DKIM')) return 'email_auth';
  if (reason.includes('DNSSEC')) return 'dns_hygiene';
  if (reason.includes('CAA')) return 'dns_hygiene';
  if (reason.includes('Reputation') || reason.includes('blacklist')) return 'reputation';
  if (reason.includes('expiration')) return 'domain';
  return 'general';
}

function getSeverityForPoints(points: number): string {
  if (points >= 20) return 'critical';
  if (points >= 10) return 'high';
  if (points >= 5) return 'medium';
  return 'low';
}

function getDescription(reason: string): string {
  const map: Record<string, string> = {
    'Missing DMARC': 'No DMARC record found at _dmarc.<domain>. This allows spoofed emails to bypass policy enforcement.',
    'DMARC p=none': 'DMARC policy is set to p=none, which only monitors but does not quarantine or reject malicious email.',
    'No DMARC rua': 'No aggregate reporting address (rua) configured in DMARC. You will not receive visibility into email flows.',
    'No DMARC sp policy': 'No subdomain policy (sp=) configured in DMARC. Subdomains inherit the parent policy ambiguously.',
    'SPF missing': 'No SPF record found. Anyone can send email claiming to be from this domain.',
    'Multiple SPF records': 'More than one SPF TXT record found. RFC 7208 requires exactly one SPF record; multiple records cause a PermError.',
    'SPF softfail (~all)': 'SPF ends with ~all (softfail), meaning unauthorized senders are not hard-rejected.',
    'SPF too many DNS lookups': 'SPF record requires more than 10 DNS lookups, which causes a PermError and SPF failure.',
    'DKIM missing': 'No DKIM public keys found on common selectors. Emails cannot be cryptographically signed.',
    'DNSSEC missing': 'DNSSEC is not enabled. DNS responses cannot be authenticated, leaving the domain vulnerable to cache poisoning.',
    'CAA missing': 'No CAA record found. Any CA can issue TLS certificates for this domain.',
    'Reputation blacklist hit': 'Domain is listed on one or more reputation blacklists.',
    'Domain expiration under 30 days': 'Domain expires within 30 days. Failure to renew will cause full service outage.',
  };
  return map[reason] ?? reason;
}

function getRemediation(reason: string): string {
  const map: Record<string, string> = {
    'Missing DMARC': 'Add a TXT record at _dmarc.<domain> with v=DMARC1; p=quarantine; rua=mailto:dmarc@<domain>',
    'DMARC p=none': 'Change DMARC policy to p=quarantine or p=reject once reporting data is reviewed.',
    'No DMARC rua': 'Add rua=mailto:dmarc-reports@<domain> to your DMARC record.',
    'No DMARC sp policy': 'Add sp=reject to your DMARC record to explicitly set subdomain policy.',
    'SPF missing': 'Add a TXT record: v=spf1 include:<your-mail-provider> -all',
    'Multiple SPF records': 'Merge all SPF mechanisms into a single TXT record at the apex domain.',
    'SPF softfail (~all)': 'Change ~all to -all in your SPF record to enforce hard rejection.',
    'SPF too many DNS lookups': 'Flatten SPF record by replacing include: chains with direct IP4/IP6 ranges.',
    'DKIM missing': 'Configure DKIM signing in your mail platform and publish the public key as a TXT record at <selector>._domainkey.<domain>.',
    'DNSSEC missing': 'Enable DNSSEC at your DNS registrar or DNS provider.',
    'CAA missing': 'Add CAA records to restrict which CAs can issue certificates: 0 issue "letsencrypt.org"',
    'Reputation blacklist hit': 'Review the blacklist entry and follow the delisting process for the specific list.',
    'Domain expiration under 30 days': 'Renew domain immediately through your registrar.',
  };
  return map[reason] ?? 'Review and remediate this finding.';
}
