import { Card } from '@/components/ui/Card';

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
      <div className="space-y-4 max-w-2xl">
        <Card>
          <h2 className="font-semibold text-white mb-4">Environment Variables</h2>
          <div className="space-y-3 text-sm">
            {[
              { key: 'DATABASE_URL', desc: 'PostgreSQL connection string' },
              { key: 'SLACK_WEBHOOK_URL', desc: 'Slack incoming webhook for alerts' },
              { key: 'GOOGLE_SAFE_BROWSING_API_KEY', desc: 'Google Safe Browsing API' },
              { key: 'VIRUSTOTAL_API_KEY', desc: 'VirusTotal API key' },
              { key: 'CISCO_TALOS_API_KEY', desc: 'Cisco Talos API key' },
              { key: 'URLSCAN_API_KEY', desc: 'URLScan.io API key' },
              { key: 'MSFT_SMARTSCREEN_API_KEY', desc: 'Microsoft SmartScreen API key' },
            ].map(v => (
              <div key={v.key} className="flex items-start gap-3 bg-ocean-700/50 rounded-lg px-4 py-3">
                <code className="text-reef-teal text-xs font-mono mt-0.5 min-w-fit">{v.key}</code>
                <span className="text-ocean-100/60">{v.desc}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold text-white mb-2">Auth</h2>
          <p className="text-ocean-100/60 text-sm">Authentication is currently a placeholder. Integrate NextAuth or Clerk for production use.</p>
        </Card>
      </div>
    </div>
  );
}
