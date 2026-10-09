type Posture = 'healthy' | 'watch' | 'needs_improvement' | 'poor';

const postureConfig: Record<Posture, { label: string; dot: string; className: string }> = {
  healthy:          { label: 'Healthy',          dot: 'bg-emerald-400', className: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20' },
  watch:            { label: 'Watch',             dot: 'bg-amber-400',   className: 'bg-amber-500/10  text-amber-300  ring-1 ring-amber-500/20' },
  needs_improvement:{ label: 'Needs Improvement', dot: 'bg-orange-400',  className: 'bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20' },
  poor:             { label: 'Poor',              dot: 'bg-red-400',     className: 'bg-red-500/10    text-red-300    ring-1 ring-red-500/20' },
};

export function PostureBadge({ posture }: { posture: string }) {
  const p = posture as Posture;
  const config = postureConfig[p] ?? postureConfig.poor;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const good = ['ok', 'found', 'enabled', 'hardfail', 'reject', 'quarantine'].includes(status);
  const warn = ['softfail', 'none', 'policy_none', 'warn'].includes(status);
  const cn = good
    ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
    : warn
    ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20'
    : 'bg-red-500/10 text-red-300 ring-1 ring-red-500/20';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono ${cn}`}>
      {status}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-500/10    text-red-300    ring-1 ring-red-500/20',
    high:     'bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20',
    medium:   'bg-amber-500/10  text-amber-300  ring-1 ring-amber-500/20',
    low:      'bg-blue-500/10   text-blue-300   ring-1 ring-blue-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${map[severity] ?? map.low}`}>
      {severity}
    </span>
  );
}
