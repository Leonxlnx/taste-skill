import { PageHeader } from "@/components/site/page-header";

export const metadata = { title: "Docs" };

export default function DocsPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-5xl px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="Docs"
        description="Install verified source through shadcn or search the same catalog through the local read-only MCP."
      />
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        <section className="grid gap-8 py-10 md:grid-cols-[12rem_1fr] md:py-12">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Registry</h2>
          <div className="min-w-0 space-y-5">
            <p className="m-0 max-w-[58ch] leading-7 text-[var(--muted)]">
              When the registry is deployed, add its namespace to your project&apos;s components.json.
            </p>
            <pre className="overflow-x-auto border border-[var(--line)] bg-[var(--foreground)] p-5 text-sm [color:var(--background)]">
              <code>{`{
  "registries": {
    "@taste": "https://tasteblocks.dev/r/{name}.json"
  }
}`}</code>
            </pre>
            <pre className="overflow-x-auto border border-[var(--line)] bg-[var(--foreground)] p-5 text-sm [color:var(--background)]">
              <code>npx shadcn@latest add @taste/&lt;name&gt;</code>
            </pre>
          </div>
        </section>
        <section className="grid gap-8 py-10 md:grid-cols-[12rem_1fr] md:py-12">
          <h2 className="text-xl font-semibold tracking-[-0.03em]">Local MCP</h2>
          <div className="min-w-0 space-y-5">
            <p className="m-0 max-w-[58ch] leading-7 text-[var(--muted)]">
              Search verified metadata and generate install commands. The server never runs them.
            </p>
            <pre className="overflow-x-auto border border-[var(--line)] bg-[var(--foreground)] p-5 text-sm [color:var(--background)]">
              <code>npm run mcp</code>
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
