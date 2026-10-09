import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const finding = await prisma.finding.update({
    where: { id: params.id },
    data: { status: body.status },
  });
  return NextResponse.json(finding);
}
