"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import "./shared-nav-marker.css";

export interface SharedNavMarkerItem {
  label: string;
  href: string;
}

export interface SharedNavMarkerProps {
  items: SharedNavMarkerItem[];
  activeHref: string;
  label?: string;
  className?: string;
}

export function SharedNavMarker({
  items,
  activeHref,
  label = "Primary navigation",
  className = "",
}: SharedNavMarkerProps) {
  const usableItems = useMemo(
    () => items.filter((item) => item.label.trim() && item.href.trim()),
    [items],
  );
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const markerHome = usableItems.some((item) => item.href === activeHref)
    ? activeHref
    : usableItems[0]?.href;
  const markerTarget = useRef(markerHome);

  const placeMarker = useCallback((href?: string, animate = true) => {
    const root = rootRef.current;
    const marker = markerRef.current;
    if (!href || !root || !marker) return;
    const link = linkRefs.current[href];
    if (!link) return;

    const rootBox = root.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    markerTarget.current = href;
    marker.dataset.animate = marker.dataset.ready === "true" && animate ? "true" : "false";
    marker.style.setProperty("--tb-nav-marker-x", `${linkBox.left - rootBox.left}px`);
    marker.style.setProperty("--tb-nav-marker-scale", `${Math.max(linkBox.width, 1)}`);
    marker.dataset.ready = "true";
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!markerHome || !root || !track) return;

    markerTarget.current = markerHome;
    placeMarker(markerHome, false);
    const updateMarker = () => placeMarker(markerTarget.current, false);
    const observer = new ResizeObserver(updateMarker);
    observer.observe(root);
    for (const link of Object.values(linkRefs.current)) {
      if (link) observer.observe(link);
    }
    track.addEventListener("scroll", updateMarker, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", updateMarker);
    };
  }, [markerHome, placeMarker, usableItems]);

  if (!markerHome) return null;

  return (
    <nav
      ref={rootRef}
      className={`tb-shared-nav-marker ${className}`.trim()}
      aria-label={label}
      onPointerLeave={() => placeMarker(markerHome)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          placeMarker(markerHome);
        }
      }}
    >
      <span className="tb-shared-nav-marker__track" ref={trackRef}>
        {usableItems.map((item) => (
          <a
            key={item.href}
            ref={(node) => {
              linkRefs.current[item.href] = node;
            }}
            href={item.href}
            aria-current={item.href === activeHref ? "page" : undefined}
            onFocus={() => placeMarker(item.href, false)}
            onPointerEnter={(event) => {
              const fineHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
              placeMarker(item.href, fineHover && event.pointerType === "mouse");
            }}
          >
            {item.label}
          </a>
        ))}
      </span>
      <span className="tb-shared-nav-marker__clip" aria-hidden="true">
        <span className="tb-shared-nav-marker__line" ref={markerRef} />
      </span>
    </nav>
  );
}

export default SharedNavMarker;
