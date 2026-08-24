import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { PostureBadge, SeverityBadge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

export default async function DomainDetailPage({ params }: { params: { id: string } }) {
  let domain: any;
  try {
    domain = await prisma.domain.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        scanRuns: { orderBy: { scannedAt: 'desc' }, take: 5 },
        findings: { orderBy: { severity: 'asc' } },
        reputationChecks: { orderBy: { checkedAt: 'desc' }, take: 10 },
      },
    });
  } catch {
    notFound();
  }
  if (!domain) notFound();

  const latest = domain.scanRuns[0];
  const raw = latest?.rawResult as any ?? {};

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono">{domain.fqdn}</h1>
          <p className="text-ocean-100/60 mt-1">{domain.customer.name}</p>
        </div>
        <div className="flex items-center gap-4">
          {latest && <ScoreRing score={latest.score} size={72} />}
          {latest && <PostureBadge posture={latest.posture} />}
        </div>
      </div>

      {/* Email auth */}
      <Card>
        <h2 className="font-semibold text-white mb-4">Email Authentication</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'SPF', value: raw.spf?.raw?.[0] ?? (latest?.spfStatus ?? '–') },
            { label: 'DKIM', value: raw.dkim?.selectors?.join(', ') ?? (latest?.dkimStatus ?? '–') },
            { label: 'DMARC', value: raw.dmarc?.raw ?? (latest?.dmarcStatus ?? '–') },
            { label: 'BIMI', value: 'Not checked' },
            { label: 'MTA-STS', value: 'Not checked' },
            { label: 'TLS-RPT', value: 'Not checked' },
          ].map(item => (
            <div key={item.label} className="bg-ocean-700/50 rounded-lg p-4">
              <div className="text-xs text-ocean-100/50 uppercase tracking-wider mb-2">{item.label}</div>
              <div className="text-sm text-white font-mono break-all">{String(item.value)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* DNS */}
      <Card>
        <h2 className="font-semibold text-white mb-4">DNS Hygiene</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'DNSSEC', value: raw.dnssec?.enabled ? 'Enabled' : 'Disabled' },
            { label: 'CAA', value: raw.caa?.exists ? 'Present' : 'Missing' },
            { label: 'MX Records', value: raw.mx?.length ? `${raw.mx.length} record(s)` : '–' },
            { label: 'NS Records', value: raw.ns?.join(', ') ?? '–' },
          ].map(item => (
            <div key={item.label} className="bg-ocean-700/50 rounded-lg p-4">
              <div className="text-xs text-ocean-100/50 uppercase tracking-wider mb-2">{item.label}</div>
              <div className="text-sm text-white font-mono">{String(item.value)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Findings */}
      <Card>
        <h2 className="font-semibold text-white mb-4">Findings &amp; Remediation</h2>
        <div className="space-y-3">
          {domain.findings.length === 0 && (
            <p className="text-ocean-100/40 text-sm">No open findings.</p>
          )}
          {domain.findings.map((f: any) => (
            <div key={f.id} className="bg-ocean-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <SeverityBadge severity={f.severity} />
                <span className="text-white font-medium text-sm">{f.title}</span>
              </div>
              <p className="text-ocean-100/70 text-sm mb-2">{f.description}</p>
              <p className="text-reef-teal text-xs font-mono">↳ {f.remediation}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Score history */}
      <Card>
        <h2 className="font-semibold text-white mb-4">Score History</h2>
        <div className="flex items-end gap-2 h-24">
          {domain.scanRuns.slice().reverse().map((run: any, i: number) => {
            const h = Math.max(8, (run.score / 100) * 80);
            const color = run.score >= 90 ? 'bg-emerald-500' : run.score >= 70 ? 'bg-amber-500' : run.score >= 50 ? 'bg-orange-500' : 'bg-red-500';
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="text-xs text-ocean-100/50">{run.score}</div>
                <div className={`w-8 rounded-t ${color}`} style={{ height: h }} />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
