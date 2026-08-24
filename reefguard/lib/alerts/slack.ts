interface AlertPayload {
  domain: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export async function sendSlackAlert(payload: AlertPayload): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const color = payload.severity === 'critical' ? '#FF0000' : payload.severity === 'warning' ? '#FFA500' : '#0099FF';

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [{
        color,
        title: `ReefGuard Alert: ${payload.domain}`,
        text: payload.message,
        ts: Math.floor(Date.now() / 1000),
      }],
    }),
  });
}

export async function alertScoreDrop(domain: string, oldScore: number, newScore: number) {
  if (oldScore - newScore >= 10) {
    await sendSlackAlert({ domain, message: `Score dropped from ${oldScore} to ${newScore}`, severity: 'warning' });
  }
}

export async function alertPoorPosture(domain: string, score: number) {
  await sendSlackAlert({ domain, message: `Domain moved to POOR posture (score: ${score})`, severity: 'critical' });
}

export async function alertDmarcDisappeared(domain: string) {
  await sendSlackAlert({ domain, message: 'DMARC record has disappeared', severity: 'critical' });
}

export async function alertSpfInvalid(domain: string, reason: string) {
  await sendSlackAlert({ domain, message: `SPF record is now invalid: ${reason}`, severity: 'critical' });
}

export async function alertBlacklistHit(domain: string, source: string) {
  await sendSlackAlert({ domain, message: `Reputation blacklist hit detected on ${source}`, severity: 'critical' });
}
