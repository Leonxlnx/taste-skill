import { PageHeader } from "@/components/site/page-header";

export const metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-5xl px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="Install source"
        description="Each published component is an editable shadcn registry item with its dependencies and provenance recorded."
      />
      <section className="py-12">
        <h2 className="text-2xl font-semibold tracking-[-0.035em]">Install</h2>
        <pre className="mt-5 overflow-x-auto border border-[var(--line)] bg-[var(--foreground)] p-5 text-sm [color:var(--background)]">
          <code>npx shadcn@latest add &lt;registry-item-url&gt;</code>
        </pre>
      </section>
    </main>
  );
}
