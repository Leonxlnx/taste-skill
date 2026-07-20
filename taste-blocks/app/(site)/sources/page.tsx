import { EmptyState } from "@/components/site/empty-state";
import { PageHeader } from "@/components/site/page-header";

export const metadata = { title: "Sources" };

export default function SourcesPage() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-[1600px] px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <PageHeader
        title="Sources"
        description="Every published component names its repository, immutable revision, source path, license, and local changes."
      />
      <EmptyState>No source has passed publication review yet.</EmptyState>
    </main>
  );
}
