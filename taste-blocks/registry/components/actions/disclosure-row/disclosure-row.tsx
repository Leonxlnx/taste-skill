import type { ReactNode } from "react";
import "./disclosure-row.css";

export interface DisclosureRowProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  name?: string;
}

export function DisclosureRow({
  title,
  children,
  defaultOpen = false,
  name,
}: DisclosureRowProps) {
  return (
    <details className="tb-disclosure" name={name} open={defaultOpen || undefined}>
      <summary className="tb-disclosure__summary">
        <span>{title}</span>
        <span className="tb-disclosure__mark" aria-hidden="true" />
      </summary>
      <div className="tb-disclosure__body">{children}</div>
    </details>
  );
}
