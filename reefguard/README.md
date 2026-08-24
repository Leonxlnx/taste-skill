# ReefGuard — Domain Trust Monitor

ReefGuard continuously monitors the public domain ecosystem that customers rely on for trusted email, DNS integrity, and brand reputation. It identifies broken SPF, missing DMARC, weak DKIM coverage, blacklist exposure, certificate risk, and DNS hygiene problems before they become customer-impacting incidents.

## Local Setup

```bash
git clone https://github.com/chelstein/taste-skill.git
cd taste-skill/reefguard
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL to your PostgreSQL instance
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL for alerts |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Google Safe Browsing v4 API key |
| `VIRUSTOTAL_API_KEY` | VirusTotal API key |
| `CISCO_TALOS_API_KEY` | Cisco Talos Intelligence API key |
| `URLSCAN_API_KEY` | URLScan.io API key |
| `MSFT_SMARTSCREEN_API_KEY` | Microsoft SmartScreen API key |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g. https://reefguard.example.com) |

## DigitalOcean Deployment

1. Push this repo to GitHub.
2. In the DigitalOcean App Platform console, click **Create App** → **Import from GitHub**.
3. Point to this repo and branch (`main`).
4. Upload `.do/app.yaml` as the app spec (or paste its contents).
5. Under **Environment Variables**, add `DATABASE_URL` and any API keys as **secrets**.
6. Deploy. DigitalOcean will provision the PostgreSQL database automatically using the `databases` block in `app.yaml`.

## GitHub Actions

CI runs on every push to `main` or `claude/**` branches and on pull requests to `main`. The workflow:
- Installs dependencies
- Generates the Prisma client
- Runs ESLint
- Type-checks with TypeScript
- Builds the Next.js app

See `.github/workflows/ci.yml`.

## Scanner Architecture

### Scanner Worker (`scripts/scan-all.ts`)
A standalone script (`npm run scan:all`) that iterates all domains in the database and runs a full scan on each. On DigitalOcean, this runs as a **scheduled job** every hour.

### lib/scanner
Each check is a separate module:

| Module | What it checks |
|---|---|
| `dns.ts` | Shared DNS resolver utilities (TXT, MX, NS, CAA) |
| `spf.ts` | SPF record presence, multiple records, softfail, lookup count |
| `dmarc.ts` | DMARC record presence, policy (none/quarantine/reject), rua, sp= |
| `dkim.ts` | DKIM public key presence across 13 common selectors |
| `dnssec.ts` | DS record presence (DNSSEC enabled indicator) |
| `caa.ts` | CAA record presence |
| `reputation.ts` | Spamhaus DBL DNS check + placeholders for 5 other sources |
| `index.ts` | Orchestrates all checks, feeds scoring engine, generates findings |

### Scoring Engine (`lib/scoring/engine.ts`)
Starts at 100, applies weighted deductions for each issue found. Posture thresholds: Healthy ≥90, Watch ≥70, Needs Improvement ≥50, Poor <50.

## Future API Key Integrations

- **Google Safe Browsing** — real-time URL/domain malware/phishing check
- **VirusTotal** — multi-engine domain reputation
- **Cisco Talos** — IP and domain reputation
- **URLScan.io** — passive DNS and screenshot-based scanning
- **Microsoft SmartScreen** — Windows Defender SmartScreen domain reputation
- **WHOIS/RDAP** — domain expiration date monitoring
- **Certificate Transparency** — unexpected certificate issuance alerts
