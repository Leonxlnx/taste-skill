import { PageHeader } from "@/components/site/page-header";

export const metadata = { title: "License" };

export default function LicensePage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-5xl px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="License"
        description="Catalog code and imported component code are licensed separately. Every component keeps its upstream terms and required notices."
      />
      <section className="grid gap-8 py-12 text-base leading-7 text-[var(--muted)] sm:grid-cols-2">
        <p>Restricted, paid, or ambiguously licensed component source is not published.</p>
        <p>Third-party copyright and modification records ship beside every accepted source.</p>
      </section>
    </main>
  );
}
