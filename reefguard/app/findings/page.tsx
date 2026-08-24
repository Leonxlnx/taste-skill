import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { SeverityBadge } from '@/components/ui/Badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function FindingsPage() {
  let findings: any[] = [];
  try {
    findings = await prisma.finding.findMany({
      where: { status: 'open' },
      include: { domain: { include: { customer: true } } },
      orderBy: { severity: 'asc' },
    });
  } catch {}

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Open Findings</h1>
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ocean-700 text-ocean-100/50 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 text-left">Severity</th>
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Domain</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Category</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-700">
            {findings.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-ocean-100/40">No open findings.</td></tr>
            )}
            {findings.map((f: any) => (
              <tr key={f.id} className="hover:bg-ocean-700/40">
                <td className="px-6 py-4"><SeverityBadge severity={f.severity} /></td>
                <td className="px-6 py-4 text-white">{f.title}</td>
                <td className="px-6 py-4">
                  <Link href={`/domains/${f.domain.id}`} className="text-reef-teal hover:underline font-mono text-xs">{f.domain.fqdn}</Link>
                </td>
                <td className="px-6 py-4 text-ocean-100/70">{f.domain.customer.name}</td>
                <td className="px-6 py-4 text-ocean-100/50 font-mono text-xs">{f.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
