import { PrismaClient } from '@prisma/client';
import { scanDomain } from '../lib/scanner';

const prisma = new PrismaClient();

async function main() {
  const domains = await prisma.domain.findMany();
  console.log(`Scanning ${domains.length} domain(s)...`);

  for (const domain of domains) {
    console.log(`  → ${domain.fqdn}`);
    try {
      const result = await scanDomain(domain.fqdn);
      await prisma.scanRun.create({
        data: {
          domainId: domain.id,
          score: result.score,
          posture: result.posture,
          spfStatus: result.spf.multipleRecords ? 'multiple_records' : result.spf.exists ? (result.spf.hardfail ? 'hardfail' : 'softfail') : 'missing',
          dkimStatus: result.dkim.found ? 'found' : 'missing',
          dmarcStatus: !result.dmarc.exists ? 'missing' : result.dmarc.policy ?? 'unknown',
          repStatus: result.reputation.some(r => r.listed) ? 'listed' : 'clean',
          rawResult: result as any,
        },
      });
      for (const rep of result.reputation) {
        await prisma.reputationCheck.create({
          data: { domainId: domain.id, source: rep.name, listed: rep.listed, detail: rep.detail },
        });
      }
      await prisma.finding.deleteMany({ where: { domainId: domain.id } });
      for (const f of result.findings) {
        await prisma.finding.create({ data: { domainId: domain.id, ...f } });
      }
      console.log(`    score: ${result.score} posture: ${result.posture}`);
    } catch (err) {
      console.error(`    ERROR: ${err}`);
    }
  }

  await prisma.$disconnect();
}

main();
