import "./compact-footer.css";

export interface CompactFooterLink {
  label: string;
  href: string;
}

export interface CompactFooterProps {
  brand: string;
  statement?: string;
  links: CompactFooterLink[];
  legalLinks?: CompactFooterLink[];
  copyright: string;
}

export function CompactFooter({
  brand,
  statement,
  links,
  legalLinks = [],
  copyright,
}: CompactFooterProps) {
  return (
    <footer className="tb-compact-footer">
      <div className="tb-compact-footer__brand">
        <strong>{brand}</strong>
        {statement ? <p>{statement}</p> : null}
      </div>
      <nav aria-label="Footer navigation">
        {links.map((link) => (
          <a href={link.href} key={`${link.label}-${link.href}`}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="tb-compact-footer__legal">
        <span>{copyright}</span>
        {legalLinks.map((link) => (
          <a href={link.href} key={`${link.label}-${link.href}`}>
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
