import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { PostureBadge, SeverityBadge } from '@/components/ui/Badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const CheckRow = ({ label, value, good }: { label: string; value: string; good?: boolean }) => (
  <div className="flex items-start justify-between py-3 border-b border-white/[0.05] last:border-0">
    <span className="text-[11px] uppercase tracking-[0.1em] text-white/30 font-medium pt-0.5">{label}</span>
    <span className={`text-xs font-mono text-right max-w-[60%] break-all ${good === undefined ? 'text-white/60' : good ? 'text-emerald-400' : 'text-red-400'}`}>
      {value || '–'}
    </span>
  </div>
);

export default async function DomainDetailPage({ params }: { params: { id: string } }) {
  let domain: any;
  try {
    domain = await prisma.domain.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        scanRuns: { orderBy: { scannedAt: 'desc' }, take: 10 },
        findings: { orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }] },
        reputationChecks: { orderBy: { checkedAt: 'desc' }, take: 10 },
      },
    });
  } catch { notFound(); }
  if (!domain) notFound();

  const latest = domain.scanRuns[0];
  const raw = latest?.rawResult as any ?? {};
  const openFindings = domain.findings.filter((f: any) => f.status === 'open');

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-white/25 mb-8">
        <Link href="/" className="hover:text-white/50 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/domains" className="hover:text-white/50 transition-colors">Domains</Link>
        <span>/</span>
        <span className="text-white/60 font-mono">{domain.fqdn}</span>
      </div>

      {/* Hero header */}
      <div className="flex items-start justify-between mb-10 animate-fade-up opacity-0">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">{domain.customer.name}</span>
          </div>
          <h1 className="text-3xl font-semibold text-white tracking-tight font-mono">{domain.fqdn}</h1>
          {latest && (
            <p className="text-white/30 text-sm mt-2">
              Last scanned {new Date(latest.scannedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-5">
          {latest && <ScoreRing score={latest.score} size={80} />}
          {latest && <PostureBadge posture={latest.posture} />}
        </div>
      </div>

      {/* 3-col grid */}
      <div className="grid grid-cols-12 gap-5">

        {/* Email auth */}
        <div className="col-span-4 animate-fade-up opacity-0">
          <GlassCard glow="teal">
            <div className="text-[10px] uppercase tracking-[0.2em] text-reef-teal/60 font-medium mb-4">Email Authentication</div>
            <CheckRow label="SPF" value={raw.spf?.records?.[0] ?? (latest?.spfStatus ?? 'not checked')} good={raw.spf?.exists} />
            <CheckRow label="Multiple SPF" value={raw.spf?.multipleRecords ? 'Yes — PermError!' : 'No'} good={!raw.spf?.multipleRecords} />
            <CheckRow label="DKIM" value={raw.dkim?.selectors?.length ? raw.dkim.selectors.join(', ') : 'Not found'} good={raw.dkim?.found} />
            <CheckRow label="DMARC" value={raw.dmarc?.raw ?? (latest?.dmarcStatus ?? 'not checked')} good={raw.dmarc?.exists} />
            <CheckRow label="DMARC Policy" value={raw.dmarc?.policy ?? '–'} good={['quarantine','reject'].includes(raw.dmarc?.policy)} />
            <CheckRow label="DMARC rua" value={raw.dmarc?.hasRua ? 'Present' : 'Missing'} good={raw.dmarc?.hasRua} />
            <CheckRow label="BIMI" value="Not checked" />
            <CheckRow label="MTA-STS" value="Not checked" />
            <CheckRow label="TLS-RPT" value="Not checked" />
          </GlassCard>
        </div>

        {/* DNS hygiene */}
        <div className="col-span-4 animate-fade-up-delay opacity-0">
          <GlassCard glow="cyan">
            <div className="text-[10px] uppercase tracking-[0.2em] text-reef-cyan/60 font-medium mb-4">DNS Hygiene</div>
            <CheckRow label="DNSSEC" value={raw.dnssec?.enabled ? 'Enabled' : 'Disabled'} good={raw.dnssec?.enabled} />
            <CheckRow label="CAA" value={raw.caa?.exists ? `${raw.caa.records?.length ?? ''} record(s)` : 'Missing'} good={raw.caa?.exists} />
            <CheckRow label="MX Records" value={raw.mx?.length ? `${raw.mx.length} record(s)` : 'None'} good={raw.mx?.length > 0} />
            <CheckRow label="NS Records" value={raw.ns?.slice(0, 2).join(', ') ?? '–'} />
            <CheckRow label="Registrar" value="Not available" />
            <CheckRow label="Expiration" value="Not available" />
          </GlassCard>
        </div>

        {/* Score history + quick stats */}
        <div className="col-span-4 flex flex-col gap-5">
          <div className="animate-fade-up-delay-2 opacity-0">
            <GlassCard>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-4">Score History</div>
              <div className="flex items-end gap-1.5 h-20">
                {domain.scanRuns.length === 0 && (
                  <span className="text-white/20 text-xs">No scan history</span>
                )}
                {[...domain.scanRuns].reverse().map((run: any, i: number) => {
                  const h = Math.max(6, (run.score / 100) * 68);
                  const col =
                    run.score >= 90 ? 'bg-emerald-500' :
                    run.score >= 70 ? 'bg-amber-500' :
                    run.score >= 50 ? 'bg-orange-500' : 'bg-red-500';
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[9px] text-white/25 tabular-nums">{run.score}</span>
                      <div className={`w-full rounded-t ${col} opacity-80`} style={{ height: h }} />
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          <div className="animate-fade-up-delay-3 opacity-0">
            <GlassCard>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-3">Quick Stats</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Open Findings</span>
                  <span className={openFindings.length > 0 ? 'text-red-400 font-semibold' : 'text-emerald-400'}>{openFindings.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Total Scans</span>
                  <span className="text-white/70">{domain.scanRuns.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Rep Checks</span>
                  <span className="text-white/70">{domain.reputationChecks.length}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Findings */}
        <div className="col-span-8 animate-fade-up-delay-2 opacity-0">
          <GlassCard padding={false}>
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-0.5">Findings &amp; Remediation</div>
              <div className="text-sm font-medium text-white">{openFindings.length} open finding{openFindings.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {openFindings.length === 0 && (
                <div className="px-5 py-10 text-center text-white/20 text-sm">No open findings — looking good</div>
              )}
              {openFindings.map((f: any) => (
                <div key={f.id} className="px-5 py-4 hover:bg-white/[0.02] transition-colors duration-200">
                  <div className="flex items-start gap-3">
                    <SeverityBadge severity={f.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{f.title}</div>
                      <div className="text-xs text-white/40 mt-1 leading-relaxed">{f.description}</div>
                      <div className="mt-2 flex items-start gap-1.5">
                        <span className="text-reef-teal text-xs mt-0.5">↳</span>
                        <span className="text-reef-teal/70 text-xs leading-relaxed">{f.remediation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Reputation */}
        <div className="col-span-4 animate-fade-up-delay-3 opacity-0">
          <GlassCard padding={false}>
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-0.5">Reputation</div>
              <div className="text-sm font-medium text-white">{domain.reputationChecks.length} sources checked</div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {domain.reputationChecks.length === 0 && (
                <div className="px-5 py-8 text-center text-white/20 text-xs">Trigger a scan to check</div>
              )}
              {domain.reputationChecks.slice(0, 8).map((c: any) => (
                <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-white/50">{c.source}</span>
                  <span className={`text-[11px] font-medium ${c.listed ? 'text-red-400' : 'text-emerald-400/60'}`}>
                    {c.listed ? 'LISTED' : 'Clean'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
