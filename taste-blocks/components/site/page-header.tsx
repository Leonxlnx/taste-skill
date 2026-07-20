export function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="border-b border-[var(--line)] pb-10">
      <h1 className="text-[clamp(3rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">{title}</h1>
      <p className="mt-6 max-w-[52ch] text-lg leading-7 text-[var(--muted)]">{description}</p>
    </header>
  );
}
