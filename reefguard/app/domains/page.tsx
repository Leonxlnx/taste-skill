import { prisma } from '@/lib/prisma';
import { GlassCard } from '@/components/ui/GlassCard';
import { PostureBadge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DomainsPage() {
  let domains: any[] = [];
  try {
    domains = await prisma.domain.findMany({
      include: {
        customer: true,
        scanRuns: { orderBy: { scannedAt: 'desc' }, take: 1 },
        findings: { where: { status: 'open' } },
      },
    });
  } catch {}

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      <div className="mb-10 animate-fade-up opacity-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-medium">{domains.length} Domain{domains.length !== 1 ? 's' : ''}</span>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Domains</h1>
        <p className="text-white/35 mt-1.5 text-sm">All monitored domains and their current trust posture</p>
      </div>

      <div className="space-y-3 animate-fade-up-d1 opacity-0">
        {domains.map(d => {
          const latest = d.scanRuns[0];
          return (
            <GlassCard key={d.id} className="hover:shadow-[0_0_30px_rgba(20,184,166,0.04)] transition-shadow duration-300">
              <div className="flex items-center gap-5">
                {latest
                  ? <ScoreRing score={latest.score} size={52} />
                  : <div className="w-[52px] h-[52px] rounded-full border border-white/[0.06] flex items-center justify-center text-white/20 text-xs">–</div>
                }
                <div className="flex-1 min-w-0">
                  <Link href={`/domains/${d.id}`} className="font-mono text-sm font-semibold text-[#14b8a6]/80 hover:text-[#14b8a6] transition-colors">
                    {d.fqdn}
                  </Link>
                  <div className="text-xs text-white/25 mt-0.5">{d.customer.name}</div>
                </div>
                {latest && <PostureBadge posture={latest.posture} />}
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm font-semibold ${d.findings.length > 0 ? 'text-red-400' : 'text-white/20'}`}>
                    {d.findings.length > 0 ? `${d.findings.length} findings` : 'clean'}
                  </div>
                  <div className="text-white/20 text-xs mt-0.5 font-mono">
                    {latest ? new Date(latest.scannedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Never scanned'}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
        {domains.length === 0 && (
          <GlassCard>
            <p className="text-white/20 text-center py-8 text-sm">
              No domains. Run <code className="bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-white/40">npm run db:seed</code>
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
