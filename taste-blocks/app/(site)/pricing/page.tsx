import { PageHeader } from "@/components/site/page-header";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-5xl px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="Pricing"
        description="The public collection stays free. A separate Pro collection may follow with original components only."
      />
      <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        <div className="grid gap-3 py-8 sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold">Free</dt>
          <dd className="m-0 text-[var(--muted)]">Reviewed components from compatible open-source projects.</dd>
        </div>
        <div className="grid gap-3 py-8 sm:grid-cols-[10rem_1fr]">
          <dt className="font-semibold">Pro</dt>
          <dd className="m-0 text-[var(--muted)]">Planned original work. No price or release date is announced.</dd>
        </div>
      </dl>
    </main>
  );
}
