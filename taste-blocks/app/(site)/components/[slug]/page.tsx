import { CopyCommand } from "@/components/site/copy-command";
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
      <div className="mt-14 grid gap-10 border-t border-[var(--line)] pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]">
        <section>
          <h2 className="text-2xl font-semibold tracking-[-0.035em]">Install</h2>
          <div className="mt-5">
            <CopyCommand command={component.installCommand} />
          </div>
        </section>
        <dl className="m-0 grid grid-cols-[7rem_1fr] gap-x-5 gap-y-3 text-sm">
          <dt className="text-[var(--muted)]">Source</dt>
          <dd className="m-0"><a className="underline underline-offset-4" href={component.source.repository}>{component.source.project}</a></dd>
          <dt className="text-[var(--muted)]">License</dt>
          <dd className="m-0">{component.license.spdx}</dd>
          <dt className="text-[var(--muted)]">Category</dt>
          <dd className="m-0">{component.category.replaceAll("-", " ")}</dd>
          <dt className="text-[var(--muted)]">Renderer</dt>
          <dd className="m-0">{component.renderer}</dd>
        </dl>
      </div>
    </main>
  );
}
