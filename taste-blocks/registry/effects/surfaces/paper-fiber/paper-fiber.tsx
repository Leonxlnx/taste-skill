import type { CSSProperties, ReactNode } from "react";
import "./paper-fiber.css";

interface PaperFiberProps {
  children: ReactNode;
  className?: string;
  ink?: string;
  surface?: string;
}

export function PaperFiber({
  children,
  className = "",
  ink = "#24221f",
  surface = "#eee9dc",
}: PaperFiberProps) {
  const style = {
    "--tb-paper-fiber-ink": ink,
    "--tb-paper-fiber-surface": surface,
  } as CSSProperties;

  return (
    <div className={`tb-paper-fiber ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
