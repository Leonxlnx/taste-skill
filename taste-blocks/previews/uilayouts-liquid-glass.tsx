"use client";

import { LiquidGlassCard } from "@/registry/sources/ui-layouts/components/uilayouts-liquid-glass/liquid-glass";

export default function LiquidGlassPreview() {
  return (
    <div className="grid min-h-80 place-items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_20%_20%,#fde68a,transparent_30%),radial-gradient(circle_at_75%_65%,#a78bfa,transparent_35%),#0f172a] p-8">
      <LiquidGlassCard
        className="grid place-items-center border border-white/30 p-8 text-center text-white"
        draggable={false}
        expandable
        expandedHeight="240px"
        expandedWidth="320px"
        height="190px"
        width="260px"
      >
        <div className="relative z-30">
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">Forecast</p>
          <p className="mt-2 text-4xl font-semibold">18°</p>
          <p className="mt-2 text-sm text-white/80">Use the expand control</p>
        </div>
      </LiquidGlassCard>
    </div>
  );
}
