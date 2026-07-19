import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/csr/GithubLogo";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  catalog,
  findEntry,
  homepageCatalog,
  visibleCatalog,
} from "../catalog/catalog";
import type { CatalogEntry } from "../catalog/types";
import { PreviewStage } from "./PreviewStage";

interface Route {
  page: "home" | "blocks" | "detail" | "docs" | "sources" | "license";
  slug?: string;
}
function parseRoute(): Route {
  const route = window.location.hash.replace(/^#\/?/, "");
  if (!route) return { page: "home" };
  if (route === "blocks") return { page: "blocks" };
  if (route === "docs") return { page: "docs" };
  if (route === "sources") return { page: "sources" };
  if (route === "license") return { page: "license" };
  if (route.startsWith("blocks/")) {
    return { page: "detail", slug: route.slice("blocks/".length) };
  }
  return { page: "home" };
}

function useRoute() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const update = () => {
      setRoute(parseRoute());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return route;
}

function Header() {
  return (
    <header className="site-header">
      <a className="site-mark" href="#/" aria-label="Taste Blocks home">
        <span className="site-mark__symbol" aria-hidden="true">
          TB
        </span>
        <span>Taste Blocks</span>
      </a>
      <nav className="site-nav" aria-label="Main navigation">
        <a href="#/blocks">Blocks</a>
        <a href="#/docs">Docs</a>
        <a href="#/sources">Sources</a>
        <a href="#/license">License</a>
      </nav>
      <a
        className="icon-link"
        href="https://github.com/Leonxlnx/taste-skill"
        target="_blank"
        rel="noreferrer"
        aria-label="Taste Skill on GitHub"
      >
        <GithubLogoIcon size={19} aria-hidden="true" />
      </a>
    </header>
  );
}

function SearchField({
  value,
  onChange,
  label = "Search Taste Blocks",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  return (
    <label className="search-field">
      <span className="sr-only">{label}</span>
      <MagnifyingGlassIcon size={20} aria-hidden="true" />
      <input
        type="search"
        placeholder="Search by purpose, section, or runtime"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <kbd>/</kbd>
    </label>
  );
}

function EntryCard({
  entry,
  index,
  fill = false,
}: {
  entry: CatalogEntry;
  index: number;
  fill?: boolean;
}) {
  return (
    <article
      className={`entry-card entry-card--${entry.display?.size ?? "standard"}${fill ? " entry-card--fill" : ""}`}
    >
      <div className="entry-card__meta">
        <div>
          <h2>
            <a href={`#/blocks/${entry.name}`}>{entry.title}</a>
          </h2>
          <p>{entry.description}</p>
        </div>
        <dl>
          <div>
            <dt>Type</dt>
            <dd>{entry.category}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{entry.runtime}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{entry.origin.kind}</dd>
          </div>
        </dl>
      </div>
      <div className="entry-card__preview">
        <PreviewStage entry={entry} eager={index < 4} />
      </div>
    </article>
  );
}

function CatalogGrid({
  entries,
  fillLast = false,
}: {
  entries: CatalogEntry[];
  fillLast?: boolean;
}) {
  if (!entries.length) {
    return (
      <div className="empty-state">
        <p>No verified blocks match this view.</p>
        <a href="#/blocks">Clear filters</a>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {entries.map((entry, index) => (
        <EntryCard
          entry={entry}
          fill={fillLast && index === entries.length - 1}
          index={index}
          key={entry.name}
        />
      ))}
    </div>
  );
}

function HomePage() {
  const [query, setQuery] = useState("");
  const hasDrafts = import.meta.env.DEV && visibleCatalog.some((entry) => entry.status === "draft");
  const visibleEntries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return homepageCatalog;
    return visibleCatalog.filter((entry) =>
      [
        entry.title,
        entry.description,
        entry.category,
        entry.runtime,
        ...entry.sections,
        ...entry.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const groups = [
    {
      id: "page-blocks",
      title: "Page blocks",
      description: "Complete sections with distinct content structures and responsive behavior.",
      entries: homepageCatalog.filter((entry) => entry.kind === "block"),
    },
    {
      id: "motion-controls",
      title: "Motion and controls",
      description: "Text, state, navigation, and interaction patterns with useful static fallbacks.",
      entries: homepageCatalog.filter(
        (entry) => (entry.display?.order ?? 0) >= 11 && (entry.display?.order ?? 0) <= 24,
      ),
    },
    {
      id: "visual-surfaces",
      title: "Visual surfaces",
      description: "Bounded CSS, SVG, Canvas, media, and pointer treatments for real compositions.",
      entries: homepageCatalog.filter((entry) => (entry.display?.order ?? 0) >= 25),
    },
  ];

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement;
      if (target.matches("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      event.preventDefault();
      document.querySelector<HTMLInputElement>(".search-field input")?.focus();
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <main>
      <section className="masthead">
        <div className="masthead__copy">
          <h1>Taste Blocks</h1>
          <p>
            Open-source React blocks for expressive landing pages, portfolios,
            and websites.
          </p>
        </div>
        <div
          className="masthead__count"
          aria-label={`${visibleCatalog.length} ${hasDrafts ? "local preview" : "verified"} entries`}
        >
          <strong>{visibleCatalog.length}</strong>
          <span>{hasDrafts ? "entries under review" : "verified entries"}</span>
        </div>
        <SearchField value={query} onChange={setQuery} />
      </section>

      {query ? (
        <section className="catalog-section" aria-labelledby="search-results-heading">
          <div className="section-heading">
            <div>
              <h2 id="search-results-heading">Search results</h2>
              <p>Matches include purpose, website section, runtime, and tags.</p>
            </div>
            <a className="text-link" href="#/blocks">
              Browse all <ArrowRightIcon size={16} aria-hidden="true" />
            </a>
          </div>
          <CatalogGrid entries={visibleEntries} />
        </section>
      ) : (
        groups.map((group) => (
          <section
            className="catalog-section catalog-section--grouped"
            aria-labelledby={`${group.id}-heading`}
            key={group.id}
          >
            <div className="section-heading">
              <div>
                <h2 id={`${group.id}-heading`}>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <a className="text-link" href="#/blocks">
                Browse all <ArrowRightIcon size={16} aria-hidden="true" />
              </a>
            </div>
            <CatalogGrid
              entries={group.entries}
              fillLast={group.id === "visual-surfaces"}
            />
          </section>
        ))
      )}

      <section className="source-note">
        <div>
          <h2>Source is part of the component.</h2>
          <p>
            Every entry states whether it is original, adapted from permissive
            source, or backed by a maintained dependency. Restricted component
            libraries are excluded.
          </p>
        </div>
        <a className="button-link" href="#/sources">
          Review sources <ArrowRightIcon size={17} aria-hidden="true" />
        </a>
      </section>
    </main>
  );
}

function BlocksPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const entries = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return visibleCatalog.filter((entry) => {
      const matchesKind = kind === "all" || entry.kind === kind;
      const matchesQuery =
        !normalized ||
        [entry.title, entry.description, ...entry.tags, ...entry.sections]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesKind && matchesQuery;
    });
  }, [kind, query]);

  const kinds = [
    { value: "all", label: "All" },
    { value: "block", label: "Page blocks" },
    { value: "chrome", label: "Site chrome" },
    { value: "component", label: "Components" },
    { value: "effect", label: "Effects" },
  ];

  return (
    <main className="inner-page">
      <header className="page-intro">
        <h1>Blocks</h1>
        <p>Components, effects, and complete website sections.</p>
      </header>
      <div className="catalog-tools">
        <SearchField value={query} onChange={setQuery} />
        <div className="filter-row" aria-label="Filter by type">
          {kinds.map((item) => (
            <button
              className={kind === item.value ? "is-active" : ""}
              key={item.value}
              onClick={() => setKind(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <CatalogGrid entries={entries} />
    </main>
  );
}

function CopyInstall({ name, enabled }: { name: string; enabled: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<number | null>(null);
  const command = `npx shadcn@latest add ${window.location.origin}/r/${name}.json`;

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  async function copy() {
    if (!enabled) return;
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);

    try {
      await navigator.clipboard.writeText(command);
      setStatus("copied");
    } catch {
      setStatus("error");
    }

    resetTimer.current = window.setTimeout(() => {
      setStatus("idle");
      resetTimer.current = null;
    }, 1800);
  }

  if (!enabled) {
    return <p className="install-note">Install command available after verification.</p>;
  }

  return (
    <div className="install-command">
      <code>{command}</code>
      <button onClick={copy} type="button">
        {status === "copied" ? (
          <CheckIcon aria-hidden="true" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )}
        {status === "copied" ? "Copied" : status === "error" ? "Copy failed" : "Copy"}
      </button>
    </div>
  );
}

function DetailPage({ slug }: { slug: string }) {
  const entry = findEntry(slug);
  if (
    !entry ||
    (entry.status !== "verified" && !(import.meta.env.DEV && entry.status === "draft"))
  ) {
    return (
      <main className="inner-page not-found">
        <h1>Block not found</h1>
        <a href="#/blocks">Return to blocks</a>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <header className="detail-header">
        <div>
          <a className="back-link" href="#/blocks">
            Blocks / {entry.category}
          </a>
          <h1>{entry.title}</h1>
          <p>{entry.description}</p>
        </div>
        <dl>
          <div>
            <dt>Runtime</dt>
            <dd>{entry.runtime}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{entry.origin.kind}</dd>
          </div>
          <div>
            <dt>License</dt>
            <dd>{entry.origin.license}</dd>
          </div>
        </dl>
      </header>
      <PreviewStage entry={entry} eager expanded key={entry.name} />
      <section className="detail-docs">
        <div>
          <h2>Install</h2>
          <CopyInstall name={entry.name} enabled={entry.status === "verified"} />
        </div>
        <div>
          <h2>Behavior</h2>
          <p>{entry.accessibility.notes}</p>
          <dl className="facts-list">
            <div>
              <dt>Reduced motion</dt>
              <dd>{entry.accessibility.reducedMotion}</dd>
            </div>
            <div>
              <dt>Performance target</dt>
              <dd>{entry.performance.budget}</dd>
            </div>
            <div>
              <dt>Dependencies</dt>
              <dd>{entry.dependencies.join(", ") || "None"}</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}

function DocsPage() {
  return (
    <main className="inner-page reading-page">
      <header className="page-intro">
        <h1>Install only what you use.</h1>
        <p>
          Taste Blocks publishes independent shadcn registry items. Source lands
          in your project so content, styling, and behavior remain editable.
        </p>
      </header>
      <section>
        <h2>Install a block</h2>
        <pre>
          <code>npx shadcn@latest add https://your-domain.test/r/block-name.json</code>
        </pre>
      </section>
      <section>
        <h2>What an entry includes</h2>
        <p>
          Component source, scoped styles, dependencies, responsive behavior,
          reduced-motion behavior, accessibility notes, and provenance.
        </p>
      </section>
    </main>
  );
}

function SourcesPage() {
  return (
    <main className="inner-page">
      <header className="page-intro">
        <h1>Sources</h1>
        <p>
          Provenance is visible before installation. Unknown or restricted code
          does not enter the registry.
        </p>
      </header>
      <div className="source-table" role="table" aria-label="Component sources">
        <div className="source-table__head" role="row">
          <span role="columnheader">Entry</span>
          <span role="columnheader">Origin</span>
          <span role="columnheader">License</span>
          <span role="columnheader">Status</span>
        </div>
        {catalog.map((entry) => (
          <div className="source-table__row" role="row" key={entry.name}>
            <a href={`#/blocks/${entry.name}`} role="cell">
              {entry.title}
            </a>
            <span role="cell">{entry.origin.kind}</span>
            <span role="cell">{entry.origin.license}</span>
            <span role="cell">{entry.status}</span>
          </div>
        ))}
      </div>
    </main>
  );
}

function LicensePage() {
  return (
    <main className="inner-page reading-page">
      <header className="page-intro">
        <h1>License</h1>
        <p>
          Original Taste Blocks source is released under MIT. Adapted source
          keeps its upstream permissions, copyright, and required notices.
        </p>
      </header>
      <section>
        <h2>What is not included</h2>
        <p>
          Paid libraries, restricted templates, sample brands, unverified media,
          and code without a compatible component-library redistribution grant.
        </p>
      </section>
      <section>
        <h2>Future Pro work</h2>
        <p>
          Pro will remain a separate private registry made from original work.
          Public free source never depends on private Pro code.
        </p>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Taste Blocks</strong>
        <span>Open source React building blocks.</span>
      </div>
      <nav aria-label="Footer navigation">
        <a href="#/blocks">Blocks</a>
        <a href="#/docs">Docs</a>
        <a href="#/sources">Sources</a>
        <a href="#/license">License</a>
      </nav>
    </footer>
  );
}

export function App() {
  const route = useRoute();

  return (
    <div className="site-shell">
      <Header />
      {route.page === "home" ? <HomePage /> : null}
      {route.page === "blocks" ? <BlocksPage /> : null}
      {route.page === "detail" && route.slug ? (
        <DetailPage slug={route.slug} />
      ) : null}
      {route.page === "docs" ? <DocsPage /> : null}
      {route.page === "sources" ? <SourcesPage /> : null}
      {route.page === "license" ? <LicensePage /> : null}
      <Footer />
    </div>
  );
}
