import { ComponentCatalog } from "@/components/site/component-catalog";
import { EmptyState } from "@/components/site/empty-state";
import { PageHeader } from "@/components/site/page-header";
import { catalog } from "@/lib/catalog";

export const metadata = { title: "Components" };

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; source?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto min-h-[calc(100dvh-8rem)] max-w-[1600px] px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="Components"
        description="Reviewed, source-backed React components. No page sections or layout templates."
      />
      {catalog.length === 0 ? (
        <EmptyState>The catalog opens when the first source and license review passes.</EmptyState>
      ) : (
        <ComponentCatalog
          category={params.category}
          items={catalog}
          query={params.q}
          source={params.source}
        />
      )}
    </main>
  );
}
