import {
  type ComponentType,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CatalogEntry } from "../catalog/types";

interface PreviewStageProps {
  entry: CatalogEntry;
  eager?: boolean;
  expanded?: boolean;
}
export function PreviewStage({
  entry,
  eager = false,
  expanded = false,
}: PreviewStageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);
  const [Preview, setPreview] = useState<ComponentType | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (shouldLoad || !rootRef.current) return;

    const observer = new IntersectionObserver(
      ([entryState]) => {
        if (entryState?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "360px" },
    );

    observer.observe(rootRef.current);
    return () => observer.disconnect();
  }, [shouldLoad]);

  useEffect(() => {
    let active = true;
    if (!shouldLoad || Preview || error) return;

    entry
      .loadPreview()
      .then((module) => {
        if (active) setPreview(() => module.default);
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [Preview, entry, error, shouldLoad]);

  const style = {
    "--preview-min-height": expanded ? "min(72dvh, 760px)" : undefined,
  } as CSSProperties;

  return (
    <div
      className={`preview-stage${expanded ? " preview-stage--expanded" : ""}`}
      ref={rootRef}
      style={style}
    >
      {Preview ? <Preview /> : null}
      {!Preview && !error ? (
        <div className="preview-stage__placeholder" aria-hidden="true" />
      ) : null}
      {error ? (
        <p className="preview-stage__error" role="status">
          Preview unavailable. The catalog remains usable.
        </p>
      ) : null}
    </div>
  );
}
