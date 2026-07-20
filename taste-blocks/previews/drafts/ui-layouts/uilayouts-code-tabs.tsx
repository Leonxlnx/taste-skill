"use client";

import { CodeTabs } from "@/registry/sources/ui-layouts/components/uilayouts-code-tabs/code-tabs";

const tabs = [
  {
    id: "tsx",
    label: "React",
    lang: "tsx",
    code: `export function Greeting({ name }: { name: string }) {
  return <p>Hello, {name}.</p>;
}`,
  },
  {
    id: "css",
    label: "CSS",
    lang: "css",
    code: `.greeting {
  color: oklch(0.72 0.14 250);
}`,
  },
];

export default function CodeTabsPreview() {
  return (
    <div className="min-h-80 rounded-2xl bg-zinc-950 p-6 text-white">
      <CodeTabs className="mx-auto max-w-2xl" tabs={tabs} />
    </div>
  );
}
