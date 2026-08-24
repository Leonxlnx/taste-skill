import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Reputation</h1>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ocean-700 text-ocean-100/50 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Domain</th>
              <th className="px-6 py-3 text-left">Source</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Detail</th>
              <th className="px-6 py-3 text-left">Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-700">
            {checks.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-ocean-100/40">No reputation checks yet. Trigger a scan.</td></tr>
            )}
            {checks.map((c: any) => (
              <tr key={c.id} className="hover:bg-ocean-700/40">
                <td className="px-6 py-4">
                  <Link href={`/domains/${c.domain.id}`} className="text-reef-teal hover:underline font-mono text-xs">{c.domain.fqdn}</Link>
                </td>
                <td className="px-6 py-4 text-ocean-100/80">{c.source}</td>
                <td className="px-6 py-4">
                  <span className={c.listed ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {c.listed ? 'LISTED' : 'Clean'}
                  </span>
                </td>
                <td className="px-6 py-4 text-ocean-100/50 text-xs">{c.detail}</td>
                <td className="px-6 py-4 text-ocean-100/40 text-xs">{new Date(c.checkedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
