import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const spinatos = await prisma.customer.upsert({
    where: { id: 'spinatos-001' },
    update: {},
    create: {
      id: 'spinatos-001',
      name: "Spinato's Pizza",
      domains: {
        create: {
          id: 'domain-spinatos',
          fqdn: 'spinatospizzeria.com',
          scanRuns: {
            create: {
              score: 35,
              posture: 'poor',
              spfStatus: 'multiple_records',
              dkimStatus: 'missing',
              dmarcStatus: 'policy_none',
              repStatus: 'clean',
              rawResult: {},
            },
          },
          findings: {
            create: [
              {
                category: 'email_auth',
                severity: 'critical',
                title: 'Multiple SPF records',
                description: 'More than one SPF TXT record found causing PermError.',
                remediation: 'Merge all SPF mechanisms into a single TXT record.',
                status: 'open',
              },
              {
                category: 'email_auth',
                severity: 'high',
                title: 'DMARC p=none',
                description: 'DMARC policy is set to p=none, providing no enforcement.',
                remediation: 'Upgrade DMARC policy to p=quarantine or p=reject.',
                status: 'open',
              },
              {
                category: 'email_auth',
                severity: 'critical',
                title: 'DKIM missing',
                description: 'No DKIM public keys found on any common selector.',
                remediation: 'Configure DKIM signing and publish the public key.',
                status: 'open',
              },
              {
                category: 'email_auth',
                severity: 'medium',
                title: 'No DMARC rua',
                description: 'No aggregate reporting address configured in DMARC.',
                remediation: 'Add rua=mailto:dmarc-reports@spinatospizzeria.com',
                status: 'open',
              },
              {
                category: 'email_auth',
                severity: 'medium',
                title: 'No DMARC sp policy',
                description: 'No explicit subdomain policy configured.',
                remediation: 'Add sp=reject to the DMARC record.',
                status: 'open',
              },
            ],
          },
        },
      },
    },
  });

  const atlas = await prisma.customer.upsert({
    where: { id: 'atlas-001' },
    update: {},
    create: {
      id: 'atlas-001',
      name: 'Atlas Healthcare Partners',
      domains: {
        create: {
          id: 'domain-atlas',
          fqdn: 'atlashp.com',
          scanRuns: {
            create: {
              score: 65,
              posture: 'needs_improvement',
              spfStatus: 'hardfail',
              dkimStatus: 'found',
              dmarcStatus: 'missing',
              repStatus: 'clean',
              rawResult: {},
            },
          },
          findings: {
            create: [
              {
                category: 'email_auth',
                severity: 'critical',
                title: 'Missing DMARC',
                description: 'No DMARC record found. Email spoofing is unrestricted.',
                remediation: 'Add a TXT record at _dmarc.atlashp.com with v=DMARC1; p=quarantine; rua=mailto:dmarc@atlashp.com',
                status: 'open',
              },
            ],
          },
        },
      },
    },
  });

  console.log('Seeded:', spinatos.name, atlas.name);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
