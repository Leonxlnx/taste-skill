"use client";

import { BouncyAccordion } from "@/registry/sources/componentry/components/componentry/bouncy-accordion";

const items = [
  {
    id: "scope",
    title: "What is included?",
    description: "The component, its dependency closure, source record, and install metadata.",
  },
  {
    id: "motion",
    title: "Does it respect reduced motion?",
    description: "Yes. The connected-row transition becomes immediate when motion is reduced.",
  },
  {
    id: "control",
    title: "Can it be controlled?",
    description: "Use value and onValueChange, or provide a defaultValue for local state.",
  },
];

export default function ComponentryBouncyAccordionPreview() {
  return (
    <div className="w-full max-w-xl">
      <BouncyAccordion items={items} defaultValue="scope" />
    </div>
  );
}
