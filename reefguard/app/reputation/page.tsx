import { prisma } from '@/lib/prisma';
import { GlassCard } from '@/components/ui/GlassCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReputationPage() {
  let checks: any[] = [];
  try {
    checks = await prisma.reputationCheck.findMany({
      include: { domain: { include: { customer: true } } },
      orderBy: { checkedAt: 'desc' },
    });
  } catch {}

  const listedCount = checks.filter(c => c.listed).length;

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      <div className="mb-10 animate-fade-up opacity-0">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 ${listedCount > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-white/[0.04] border-white/[0.07]'}`}>
          <span className={`text-[10px] uppercase tracking-[0.2em] font-medium ${listedCount > 0 ? 'text-red-400' : 'text-white/35'}`}>
            {listedCount > 0 ? `${listedCount} Listing${listedCount !== 1 ? 's' : ''}` : 'Reputation Clean'}
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Reputation</h1>
        <p className="text-white/35 mt-1.5 text-sm">Blacklist and threat intelligence checks across {checks.length} entries</p>
      </div>

      <div className="animate-fade-up-d1 opacity-0">
        <GlassCard padding={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['Domain', 'Source', 'Status', 'Detail', 'Checked'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-white/20 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center text-white/20 text-sm">No reputation checks yet — trigger a scan</td>
                </tr>
              )}
              {checks.map((c: any) => (
                <tr key={c.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-5 py-4">
                    <Link href={`/domains/${c.domain.id}`} className="text-[#14b8a6]/70 hover:text-[#14b8a6] font-mono text-xs transition-colors">
                      {c.domain.fqdn}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-white/50 text-xs">{c.source}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${c.listed ? 'text-red-400' : 'text-emerald-400/60'}`}>
                      {c.listed ? 'LISTED' : 'Clean'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/25 text-xs">{c.detail}</td>
                  <td className="px-5 py-4 text-white/20 text-xs font-mono">{new Date(c.checkedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
}
