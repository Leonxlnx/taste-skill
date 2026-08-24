import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { scanDomain } from '@/lib/scanner';
import { alertBlacklistHit, alertDmarcDisappeared, alertPoorPosture, alertScoreDrop, alertSpfInvalid } from '@/lib/alerts/slack';

export async function POST(req: Request) {
  const { domainId } = await req.json();
  const domain = await prisma.domain.findUnique({ where: { id: domainId } });
  if (!domain) return NextResponse.json({ error: 'Domain not found' }, { status: 404 });

  const previousRun = await prisma.scanRun.findFirst({
    where: { domainId },
    orderBy: { scannedAt: 'desc' },
  });

  const result = await scanDomain(domain.fqdn);

  const run = await prisma.scanRun.create({
    data: {
      domainId,
      score: result.score,
      posture: result.posture,
      spfStatus: result.spf.multipleRecords ? 'multiple_records' : result.spf.exists ? (result.spf.hardfail ? 'hardfail' : 'softfail') : 'missing',
      dkimStatus: result.dkim.found ? 'found' : 'missing',
      dmarcStatus: !result.dmarc.exists ? 'missing' : result.dmarc.policy ?? 'unknown',
      repStatus: result.reputation.some(r => r.listed) ? 'listed' : 'clean',
      rawResult: result as any,
    },
  });

  // Upsert reputation checks
  for (const rep of result.reputation) {
    await prisma.reputationCheck.create({
      data: { domainId, source: rep.name, listed: rep.listed, detail: rep.detail },
    });
  }

  // Alerts
  if (previousRun) {
    await alertScoreDrop(domain.fqdn, previousRun.score, result.score);
    if (previousRun.dmarcStatus !== 'missing' && !result.dmarc.exists) {
      await alertDmarcDisappeared(domain.fqdn);
    }
    if (!result.spf.exists) await alertSpfInvalid(domain.fqdn, 'SPF record missing');
  }
  if (result.posture === 'poor') await alertPoorPosture(domain.fqdn, result.score);
  for (const rep of result.reputation.filter(r => r.listed)) {
    await alertBlacklistHit(domain.fqdn, rep.name);
  }

  // Upsert findings
  await prisma.finding.deleteMany({ where: { domainId } });
  for (const f of result.findings) {
    await prisma.finding.create({ data: { domainId, ...f } });
  }

  return NextResponse.json(run);
}
