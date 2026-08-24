import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const domain = await prisma.domain.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      scanRuns: { orderBy: { scannedAt: 'desc' }, take: 10 },
      findings: true,
      reputationChecks: { orderBy: { checkedAt: 'desc' }, take: 20 },
    },
  });
  if (!domain) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(domain);
}
