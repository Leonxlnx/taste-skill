import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const domains = await prisma.domain.findMany({
    include: {
      customer: true,
      scanRuns: { orderBy: { scannedAt: 'desc' }, take: 1 },
      findings: { where: { status: 'open' } },
    },
  });
  return NextResponse.json(domains);
}

export async function POST(req: Request) {
  const body = await req.json();
  const domain = await prisma.domain.create({
    data: { fqdn: body.fqdn, customerId: body.customerId },
  });
  return NextResponse.json(domain, { status: 201 });
}
