import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { label: "Components", href: "/components", compact: true },
  { label: "Docs", href: "/docs", compact: true },
  { label: "Sources", href: "/sources", compact: false },
  { label: "Pricing", href: "/pricing", compact: false },
] as const;

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh]">
      <header className="fixed inset-x-0 top-0 z-10 border-b border-[var(--line)] bg-[color:var(--background)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-6 px-5 lg:px-10">
          <Link
            aria-label="Taste Blocks home"
            className="shrink-0 text-sm font-semibold tracking-[-0.02em] no-underline"
            href="/"
          >
            <span className="sm:hidden">TB</span>
            <span className="hidden sm:inline">Taste Blocks</span>
          </Link>
          <nav aria-label="Primary navigation" className="flex items-center gap-4 whitespace-nowrap text-sm sm:gap-7">
            {links.map(({ label, href, compact }) => (
              <Link
                className={`${compact ? "" : "hidden sm:inline"} decoration-1 underline-offset-5 hover:underline`}
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 px-5 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>Taste Blocks</span>
          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map(({ label, href }) => (
              <Link className="hover:text-[var(--foreground)]" href={href} key={href}>
                {label}
              </Link>
            ))}
            <Link className="hover:text-[var(--foreground)]" href="/license">
              License
            </Link>
            <a className="hover:text-[var(--foreground)]" href="https://github.com/Leonxlnx/taste-skill">
              GitHub
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
