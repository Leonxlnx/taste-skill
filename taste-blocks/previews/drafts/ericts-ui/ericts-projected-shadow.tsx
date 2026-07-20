"use client";

import { useState } from "react";

import { ProjectedShadow } from "@/registry/sources/ericts-ui/components/ericts-projected-shadow/projected-shadow-animation";

export default function EricTsProjectedShadowPreview() {
  const [active, setActive] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-8 rounded-2xl border border-neutral-200 bg-white p-8 text-neutral-950 shadow-sm">
      <ProjectedShadow
        active={active}
        className="size-28 text-neutral-950"
        projectedShadowClassName="inset-[12%] text-neutral-300"
        contactShadowClassName="inset-[12%] text-neutral-400"
        targetClassName="absolute inset-[12%] text-neutral-950"
      >
        <span
          aria-hidden="true"
          className="grid size-full place-items-center rounded-2xl bg-current font-mono text-lg font-semibold"
        >
          <span className="text-white">TB</span>
        </span>
      </ProjectedShadow>

      <button
        type="button"
        aria-pressed={active}
        onClick={() => setActive((current) => !current)}
        className="min-h-11 rounded-lg bg-neutral-950 px-4 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950"
      >
        {active ? "Release shadow" : "Gather shadow"}
      </button>
    </div>
  );
}
