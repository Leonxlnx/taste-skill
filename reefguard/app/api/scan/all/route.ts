import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const domains = await prisma.domain.findMany();
  const results = [];
  for (const d of domains) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/scan/domain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainId: d.id }),
    });
    results.push(await res.json());
  }
  return NextResponse.json({ scanned: results.length, results });
}
