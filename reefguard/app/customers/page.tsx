import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Customers</h1>
      <div className="space-y-4">
        {customers.map(c => (
          <Card key={c.id}>
            <h2 className="font-semibold text-white mb-3">{c.name}</h2>
            <div className="space-y-2">
              {c.domains.map((d: any) => {
                const latest = d.scanRuns[0];
                return (
                  <div key={d.id} className="flex items-center justify-between bg-ocean-700/50 rounded-lg px-4 py-3">
                    <Link href={`/domains/${d.id}`} className="text-reef-teal hover:underline font-mono text-sm">{d.fqdn}</Link>
                    <div className="flex items-center gap-4 text-sm text-ocean-100/60">
                      <span>Score: <span className="text-white font-bold">{latest?.score ?? '–'}</span></span>
                      <span>Open findings: <span className="text-red-400 font-bold">{d.findings.length}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
        {customers.length === 0 && (
          <p className="text-ocean-100/40">No customers. Run <code className="bg-ocean-700 px-1 rounded">npm run db:seed</code>.</p>
        )}
      </div>
    </div>
  );
}
