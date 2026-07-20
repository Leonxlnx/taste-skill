import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto grid min-h-[100dvh] max-w-[1600px] grid-cols-1 items-end gap-14 px-5 pb-8 pt-28 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:px-10 lg:pb-10">
        <div className="max-w-5xl">
          <h1 className="max-w-[15ch] text-[clamp(3.5rem,8vw,8rem)] font-semibold leading-[0.9] tracking-[-0.07em]">
            Components with sources attached.
          </h1>
          <p className="mt-7 max-w-[42ch] text-lg leading-7 text-[var(--muted)] sm:text-xl">
            Reviewed React source, exact provenance, and a clear install path for every published component.
          </p>
          <Link
            className="mt-8 inline-flex min-h-12 items-center border border-[var(--foreground)] bg-[var(--foreground)] px-5 text-sm font-medium whitespace-nowrap [color:var(--background)] transition-transform active:translate-y-px"
            href="/components"
          >
            Browse components
          </Link>
        </div>
        <div aria-hidden="true" className="justify-self-end font-[family-name:var(--font-mono)] text-[clamp(7rem,19vw,21rem)] leading-[0.72] tracking-[-0.12em] text-[var(--line)]">
          TB
        </div>
      </section>
    </main>
  );
}
