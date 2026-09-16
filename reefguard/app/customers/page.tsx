import { prisma } from '@/lib/prisma';
import { GlassCard } from '@/components/ui/GlassCard';
import { PostureBadge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  let customers: any[] = [];
  try {
    customers = await prisma.customer.findMany({
      include: {
        domains: {
          include: {
            scanRuns: { orderBy: { scannedAt: 'desc' }, take: 1 },
            findings: { where: { status: 'open' } },
          },
        },
      },
    });
  } catch {}

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      <div className="mb-10 animate-fade-up opacity-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">{customers.length} Customer{customers.length !== 1 ? 's' : ''}</span>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Customers</h1>
        <p className="text-white/40 mt-1.5 text-sm">Manage monitored organizations and their domains</p>
      </div>

      <div className="space-y-5">
        {customers.map((c, ci) => {
          const totalFindings = c.domains.reduce((a: number, d: any) => a + d.findings.length, 0);
          return (
            <div key={c.id} className="animate-fade-up opacity-0" style={{ animationDelay: `${ci * 80}ms` }}>
              <GlassCard glow="none">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-white text-lg tracking-tight">{c.name}</h2>
                    <div className="text-xs text-white/30 mt-0.5">{c.domains.length} domain{c.domains.length !== 1 ? 's' : ''} · {totalFindings} open finding{totalFindings !== 1 ? 's' : ''}</div>
                  </div>
                  {totalFindings > 0 && (
                    <span className="text-red-400 font-semibold text-sm">{totalFindings} findings</span>
                  )}
                </div>
                <div className="space-y-2">
                  {c.domains.map((d: any) => {
                    const latest = d.scanRuns[0];
                    return (
                      <div key={d.id} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 hover:bg-white/[0.05] transition-all duration-200">
                        {latest && <ScoreRing score={latest.score} size={40} />}
                        <Link href={`/domains/${d.id}`} className="font-mono text-sm text-reef-teal/80 hover:text-reef-teal transition-colors flex-1">
                          {d.fqdn}
                        </Link>
                        {latest && <PostureBadge posture={latest.posture} />}
                        <span className={`text-xs font-medium ${d.findings.length > 0 ? 'text-red-400' : 'text-white/20'}`}>
                          {d.findings.length > 0 ? `${d.findings.length} findings` : 'clean'}
                        </span>
                      </div>
                    );
                  })}
                  {c.domains.length === 0 && (
                    <div className="text-white/20 text-xs text-center py-4">No domains added</div>
                  )}
                </div>
              </GlassCard>
            </div>
          );
        })}
        {customers.length === 0 && (
          <GlassCard>
            <p className="text-white/20 text-center py-8 text-sm">No customers. Run <code className="bg-white/[0.06] px-1.5 py-0.5 rounded text-white/40">npm run db:seed</code></p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
