import { catalog, getComponent } from "@/lib/catalog";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.map(({ name }) => ({ slug: name }));
}

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const component = getComponent(slug);

  if (!component) notFound();

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[1600px] px-5 pb-20 pt-32 lg:px-10 lg:pt-40">
      <h1 className="text-5xl font-semibold tracking-[-0.055em] sm:text-7xl">{component.title}</h1>
      <p className="mt-5 max-w-[52ch] text-lg leading-7 text-[var(--muted)]">{component.description}</p>
      <iframe
        className="mt-10 min-h-[34rem] w-full border border-[var(--line)] bg-white"
        loading="eager"
        src={`/preview/${component.name}`}
        title={`${component.title} preview`}
      />
    </main>
  );
}
