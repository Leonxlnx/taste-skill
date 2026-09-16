import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
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
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Domains</h1>
      <div className="grid grid-cols-1 gap-4">
        {domains.map(d => {
          const latest = d.scanRuns[0];
          return (
            <Card key={d.id} className="flex items-center gap-6">
              {latest && <ScoreRing score={latest.score} size={56} />}
              <div className="flex-1">
                <Link href={`/domains/${d.id}`} className="text-reef-teal hover:underline font-mono font-semibold">{d.fqdn}</Link>
                <div className="text-ocean-100/60 text-sm">{d.customer.name}</div>
              </div>
              {latest && <PostureBadge posture={latest.posture} />}
              <div className="text-right">
                <div className="text-red-400 text-sm font-bold">{d.findings.length} findings</div>
                <div className="text-ocean-100/40 text-xs">
                  {latest ? new Date(latest.scannedAt).toLocaleDateString() : 'Never scanned'}
                </div>
              </div>
            </Card>
          );
        })}
        {domains.length === 0 && (
          <p className="text-ocean-100/40">No domains. Run <code className="bg-ocean-700 px-1 rounded">npm run db:seed</code>.</p>
        )}
      </div>
    </div>
  );
}
