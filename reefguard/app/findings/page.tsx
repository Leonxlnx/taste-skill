import { prisma } from '@/lib/prisma';
import { GlassCard } from '@/components/ui/GlassCard';
import { SeverityBadge } from '@/components/ui/Badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FindingsPage() {
  let findings: any[] = [];
  try {
    findings = await prisma.finding.findMany({
      where: { status: 'open' },
      include: { domain: { include: { customer: true } } },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });
  } catch {}

  const bySeverity = ['critical', 'high', 'medium', 'low'];

  return (
    <div className="px-8 py-10 max-w-[1400px] mx-auto">
      <div className="mb-10 animate-fade-up opacity-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-medium">Action Required</span>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Open Findings</h1>
        <p className="text-white/40 mt-1.5 text-sm">{findings.length} finding{findings.length !== 1 ? 's' : ''} requiring remediation</p>
      </div>

      <div className="animate-fade-up-delay opacity-0">
        <GlassCard padding={false}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Severity', 'Finding', 'Domain', 'Customer', 'Category'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.12em] text-white/25 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {findings.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-white/20 text-sm">No open findings</td></tr>
              )}
              {findings.map((f: any) => (
                <tr key={f.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="px-5 py-4"><SeverityBadge severity={f.severity} /></td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-white font-medium">{f.title}</div>
                    <div className="text-xs text-white/30 mt-0.5 line-clamp-1">{f.description}</div>
                  </td>
                  <td className="px-5 py-4">
                    <Link href={`/domains/${f.domain.id}`} className="text-reef-teal/80 hover:text-reef-teal font-mono text-xs transition-colors">
                      {f.domain.fqdn}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs">{f.domain.customer.name}</td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded">{f.category}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </div>
  );
}
