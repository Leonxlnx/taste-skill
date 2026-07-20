import type { CatalogComponent } from "@/lib/catalog";
import Link from "next/link";

type CatalogItem = Pick<
  CatalogComponent,
  "category" | "description" | "name" | "renderer" | "source" | "title"
>;

function label(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ComponentCatalog({
  items,
  query = "",
  category = "",
  source = "",
}: {
  items: CatalogItem[];
  query?: string;
  category?: string;
  source?: string;
}) {
  const categories = [...new Set(items.map((item) => item.category))].sort();
  const sources = [...new Set(items.map((item) => item.source.project))].sort();
  const needle = query.trim().toLowerCase();
  const matches = items.filter((item) => {
    if (category && item.category !== category) return false;
    if (source && item.source.project !== source) return false;
    if (!needle) return true;
    return [item.title, item.name, item.description, item.category, item.renderer, item.source.project]
      .join(" ")
      .toLowerCase()
      .includes(needle);
  });

  const filtered = query || category || source;

  return (
    <section aria-label="Component catalog">
      <form
        action="/components"
        className="grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-[minmax(16rem,1fr)_14rem_14rem_auto]"
      >
        <label className="bg-[var(--background)] p-4">
          <span className="sr-only">Search components</span>
          <input
            className="h-11 w-full border-0 bg-transparent px-1 text-base outline-none placeholder:text-[var(--muted)]"
            defaultValue={query}
            name="q"
            placeholder="Search components"
            type="search"
            value={query}
          />
        </label>
        <label className="bg-[var(--background)] p-4">
          <span className="sr-only">Filter by category</span>
          <select
            className="h-11 w-full border-0 bg-transparent px-1 text-sm outline-none"
            defaultValue={category}
            name="category"
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>{label(value)}</option>
            ))}
          </select>
        </label>
        <label className="bg-[var(--background)] p-4">
          <span className="sr-only">Filter by source</span>
          <select
            className="h-11 w-full border-0 bg-transparent px-1 text-sm outline-none"
            defaultValue={source}
            name="source"
          >
            <option value="">All sources</option>
            {sources.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center bg-[var(--background)] p-4">
          <button
            className="h-11 w-full cursor-pointer border border-[var(--foreground)] bg-[var(--foreground)] px-5 text-sm text-[var(--background)]"
            type="submit"
          >
            Apply
          </button>
        </div>
      </form>

      <div className="flex min-h-16 items-center justify-between gap-5 border-x border-b border-[var(--line)] px-5 text-sm text-[var(--muted)]">
        <span>{matches.length} {matches.length === 1 ? "component" : "components"}</span>
        {filtered ? (
          <Link className="p-2 text-[var(--foreground)] underline decoration-1 underline-offset-4" href="/components">
            Clear
          </Link>
        ) : null}
      </div>

      {matches.length ? (
        <div className="grid border-l border-[var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((component) => (
            <Link
              className="min-h-44 border-b border-r border-[var(--line)] bg-[var(--background)] p-6 no-underline transition-colors hover:bg-white/45"
              href={`/components/${component.name}`}
              key={component.name}
            >
              <h2 className="text-xl font-semibold tracking-[-0.03em]">{component.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{component.description}</p>
              <p className="mt-6 text-xs text-[var(--muted)]">{component.source.project}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="border-x border-b border-[var(--line)] px-5 py-16 text-[var(--muted)]">No matches.</p>
      )}
    </section>
  );
}
