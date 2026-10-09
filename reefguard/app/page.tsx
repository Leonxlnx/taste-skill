import { prisma } from '@/lib/prisma';
import { PostureBadge, StatusBadge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let domains: any[] = [];
  try {
    domains = await prisma.domain.findMany({
      include: {
        customer: true,
        scanRuns: { orderBy: { scannedAt: 'desc' }, take: 1 },
        findings: { where: { status: 'open' } },
      },
    });
  } catch {
    // DB not connected yet — show empty state
  }

  const totals = {
    healthy: domains.filter(d => d.scanRuns[0]?.posture === 'healthy').length,
    watch: domains.filter(d => d.scanRuns[0]?.posture === 'watch').length,
    needs_improvement: domains.filter(d => d.scanRuns[0]?.posture === 'needs_improvement').length,
    poor: domains.filter(d => d.scanRuns[0]?.posture === 'poor').length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Domain Trust Dashboard</h1>
        <p className="text-ocean-100/60 mt-1">Continuous Domain &amp; Email Trust Monitoring</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Healthy', count: totals.healthy, color: 'text-emerald-400' },
          { label: 'Watch', count: totals.watch, color: 'text-amber-400' },
          { label: 'Needs Improvement', count: totals.needs_improvement, color: 'text-orange-400' },
          { label: 'Poor', count: totals.poor, color: 'text-red-400' },
        ].map(s => (
          <Card key={s.label}>
            <div className={`text-3xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-sm text-ocean-100/60 mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Domain table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-ocean-700">
          <h2 className="font-semibold text-white">Monitored Domains</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ocean-700 text-ocean-100/50 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Domain</th>
              <th className="px-6 py-3 text-left">Score</th>
              <th className="px-6 py-3 text-left">Posture</th>
              <th className="px-6 py-3 text-left">SPF</th>
              <th className="px-6 py-3 text-left">DKIM</th>
              <th className="px-6 py-3 text-left">DMARC</th>
              <th className="px-6 py-3 text-left">Findings</th>
              <th className="px-6 py-3 text-left">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-700">
            {domains.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-ocean-100/40">
                  No domains yet. Run <code className="bg-ocean-700 px-1 rounded">npm run db:seed</code> to load sample data.
                </td>
              </tr>
            )}
            {domains.map(d => {
              const latest = d.scanRuns[0];
              return (
                <tr key={d.id} className="hover:bg-ocean-700/40 transition-colors">
                  <td className="px-6 py-4 text-ocean-100/80">{d.customer.name}</td>
                  <td className="px-6 py-4">
                    <Link href={`/domains/${d.id}`} className="text-reef-teal hover:underline font-mono text-xs">
                      {d.fqdn}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {latest ? <ScoreRing score={latest.score} size={48} /> : <span className="text-ocean-100/40">–</span>}
                  </td>
                  <td className="px-6 py-4">
                    {latest ? <PostureBadge posture={latest.posture as any} /> : '–'}
                  </td>
                  <td className="px-6 py-4">
                    {latest ? <StatusBadge status={latest.spfStatus} /> : '–'}
                  </td>
                  <td className="px-6 py-4">
                    {latest ? <StatusBadge status={latest.dkimStatus} /> : '–'}
                  </td>
                  <td className="px-6 py-4">
                    {latest ? <StatusBadge status={latest.dmarcStatus} /> : '–'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-red-400 font-medium">{d.findings.length}</span>
                  </td>
                  <td className="px-6 py-4 text-ocean-100/50 text-xs">
                    {latest ? new Date(latest.scannedAt).toLocaleDateString() : '–'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
