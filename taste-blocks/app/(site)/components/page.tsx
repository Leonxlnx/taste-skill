import { EmptyState } from "@/components/site/empty-state";
import { PageHeader } from "@/components/site/page-header";
import { catalog } from "@/lib/catalog";
import Link from "next/link";

export const metadata = { title: "Components" };

export default function ComponentsPage() {
  return (
    <main className="mx-auto min-h-[calc(100dvh-8rem)] max-w-[1600px] px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="Components"
        description="Only reviewed, source-backed React components appear here. Page sections and layout templates do not."
      />
      {catalog.length === 0 ? (
        <EmptyState>The catalog opens when the first source and license review passes.</EmptyState>
      ) : (
        <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((component) => (
            <Link
              className="min-h-44 bg-[var(--background)] p-6 no-underline hover:bg-white/45"
              href={`/components/${component.name}`}
              key={component.name}
            >
              <h2 className="text-xl font-semibold tracking-[-0.03em]">{component.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{component.description}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
