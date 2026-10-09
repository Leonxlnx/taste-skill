import { GlassCard } from '@/components/ui/GlassCard';

const envVars = [
  { key: 'DATABASE_URL',                desc: 'PostgreSQL connection string', required: true },
  { key: 'SLACK_WEBHOOK_URL',           desc: 'Slack incoming webhook for alerts', required: false },
  { key: 'GOOGLE_SAFE_BROWSING_API_KEY',desc: 'Google Safe Browsing API', required: false },
  { key: 'VIRUSTOTAL_API_KEY',          desc: 'VirusTotal API', required: false },
  { key: 'CISCO_TALOS_API_KEY',         desc: 'Cisco Talos', required: false },
  { key: 'URLSCAN_API_KEY',             desc: 'URLScan.io', required: false },
  { key: 'MSFT_SMARTSCREEN_API_KEY',    desc: 'Microsoft SmartScreen', required: false },
  { key: 'NEXT_PUBLIC_APP_URL',         desc: 'Public URL of the app', required: true },
];

export default function SettingsPage() {
  return (
    <div className="px-8 py-10 max-w-[900px] mx-auto">
      <div className="mb-10 animate-fade-up opacity-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-medium">Configuration</span>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight">Settings</h1>
        <p className="text-white/40 mt-1.5 text-sm">Environment variables and integrations</p>
      </div>

      <div className="space-y-5">
        <div className="animate-fade-up-delay opacity-0">
          <GlassCard>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-5">Environment Variables</div>
            <div className="space-y-2">
              {envVars.map(v => (
                <div key={v.key} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
                  <code className="text-reef-teal/80 text-xs font-mono min-w-fit">{v.key}</code>
                  <span className="text-white/30 text-xs flex-1">{v.desc}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${v.required ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' : 'bg-white/[0.04] text-white/20'}`}>
                    {v.required ? 'required' : 'optional'}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="animate-fade-up-delay-2 opacity-0">
          <GlassCard>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-medium mb-3">Authentication</div>
            <p className="text-white/40 text-sm">Auth is a placeholder. Integrate NextAuth.js or Clerk for production access control.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
