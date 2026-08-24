type Posture = 'healthy' | 'watch' | 'needs_improvement' | 'poor';

const postureConfig: Record<Posture, { label: string; className: string }> = {
  healthy: { label: 'Healthy', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  watch: { label: 'Watch', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  needs_improvement: { label: 'Needs Improvement', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  poor: { label: 'Poor', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

export function PostureBadge({ posture }: { posture: Posture }) {
  const config = postureConfig[posture];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
}

type StatusValue = 'ok' | 'missing' | 'warn' | 'error' | 'found' | 'none' | string;

export function StatusBadge({ status }: { status: StatusValue }) {
  const isGood = ['ok', 'found', 'enabled', 'hardfail', 'reject', 'quarantine'].includes(status);
  const isWarn = ['warn', 'softfail', 'none', 'policy_none'].includes(status);
  const className = isGood
    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : isWarn
    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-red-500/20 text-red-400 border-red-500/30';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border ${className}`}>
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[severity] ?? map.low}`}>
      {severity}
    </span>
  );
}
