import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'teal' | 'cyan' | 'none';
  padding?: boolean;
}

export function GlassCard({ children, className = '', glow = 'none', padding = true }: GlassCardProps) {
  const glowClass =
    glow === 'teal' ? 'shadow-[0_0_40px_rgba(20,184,166,0.08)]' :
    glow === 'cyan' ? 'shadow-[0_0_40px_rgba(6,182,212,0.08)]' :
    '';

  return (
    <div className={`bg-white/[0.03] border border-white/[0.08] p-1.5 rounded-2xl ${glowClass} ${className}`}>
      <div className={`bg-[#0d1117] rounded-[calc(1rem-6px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ${padding ? 'p-5' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <GlassCard className={className}>{children}</GlassCard>;
}
