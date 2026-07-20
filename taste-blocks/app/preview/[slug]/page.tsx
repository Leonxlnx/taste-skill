import { catalog } from "@/lib/catalog";
import { previewLoaders } from "@/generated/preview-loaders";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.map(({ name }) => ({ slug: name }));
}

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const load = previewLoaders[slug];

  if (!load) notFound();

  const Preview = (await load()).default;
  return (
    <main className="grid min-h-[100dvh] place-items-center overflow-hidden bg-white p-6">
      <Preview />
    </main>
  );
}
