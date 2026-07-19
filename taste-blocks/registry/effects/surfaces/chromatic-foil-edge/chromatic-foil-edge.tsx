import type { ReactNode } from "react";
import "./chromatic-foil-edge.css";

interface ChromaticFoilEdgeProps {
  children: ReactNode;
  className?: string;
}

export function ChromaticFoilEdge({
  children,
  className = "",
}: ChromaticFoilEdgeProps) {
  return (
    <div className={`tb-chromatic-foil-edge ${className}`.trim()}>
      {children}
    </div>
  );
}
