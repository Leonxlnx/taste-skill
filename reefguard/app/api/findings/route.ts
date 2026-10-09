import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const findings = await prisma.finding.findMany({
    include: { domain: { include: { customer: true } } },
    orderBy: { severity: 'asc' },
  });
  return NextResponse.json(findings);
}
