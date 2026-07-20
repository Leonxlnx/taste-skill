import { PageHeader } from "@/components/site/page-header";
import { catalog } from "@/lib/catalog";

export const metadata = { title: "Sources" };

export default function SourcesPage() {
  const sources = [...new Map(catalog.map((component) => [component.source.project, component.source])).values()].sort(
    (left, right) => left.project.localeCompare(right.project),
  );

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[1600px] px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="Sources"
        description="Every published component names its repository, immutable revision, source path, license, and local changes."
      />
      <div className="border-l border-t border-[var(--line)]">
        {sources.map((source) => {
          const count = catalog.filter((component) => component.source.project === source.project).length;
          return (
            <a
              className="grid gap-2 border-b border-r border-[var(--line)] p-6 no-underline hover:bg-white/45 sm:grid-cols-[minmax(12rem,0.45fr)_1fr_auto] sm:items-center"
              href={source.repository}
              key={source.project}
            >
              <strong>{source.project}</strong>
              <span className="truncate text-sm text-[var(--muted)]">{source.repository}</span>
              <span className="text-sm text-[var(--muted)]">{count}</span>
            </a>
          );
        })}
      </div>
    </main>
  );
}
