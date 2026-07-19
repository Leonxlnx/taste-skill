"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import "./filter-token-transfer.css";

export interface FilterToken {
  id: string;
  label: string;
}

export interface FilterTokenTransferProps {
  tokens: FilterToken[];
  defaultSelected?: string[];
  onChange?: (selected: string[]) => void;
}

export function FilterTokenTransfer({
  tokens,
  defaultSelected = [],
  onChange,
}: FilterTokenTransferProps) {
  const [selected, setSelected] = useState(defaultSelected);
  const [announcement, setAnnouncement] = useState("");
  const availableId = useId();
  const appliedId = useId();
  const tokenRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);
  const available = tokens.filter((token) => !selected.includes(token.id));
  const applied = tokens.filter((token) => selected.includes(token.id));

  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    tokenRefs.current.get(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  }, [selected]);

  useEffect(() => {
    const validIds = new Set(tokens.map((token) => token.id));
    for (const id of tokenRefs.current.keys()) {
      if (!validIds.has(id)) tokenRefs.current.delete(id);
    }

    const next = selected.filter((id) => validIds.has(id));
    if (next.length === selected.length) return;
    if (pendingFocus.current && !validIds.has(pendingFocus.current)) {
      pendingFocus.current = null;
    }
    setSelected(next);
    setAnnouncement("Unavailable filters removed.");
    onChange?.(next);
  }, [onChange, selected, tokens]);

  function move(token: FilterToken, apply: boolean) {
    const next = apply
      ? [...selected, token.id]
      : selected.filter((id) => id !== token.id);
    pendingFocus.current = token.id;
    setSelected(next);
    setAnnouncement(`${token.label} ${apply ? "applied" : "removed"}.`);
    onChange?.(next);
  }

  return (
    <div className="tb-token-transfer">
      <section className="tb-token-transfer__bucket" aria-labelledby={availableId}>
        <div className="tb-token-transfer__header">
          <span className="tb-token-transfer__label" id={availableId}>Available</span>
          <span>{available.length}</span>
        </div>
        <div className="tb-token-transfer__tokens">
          {available.map((token) => (
            <button
              aria-label={`Add ${token.label}`}
              className="tb-token-transfer__token"
              key={token.id}
              onClick={() => move(token, true)}
              ref={(element) => {
                if (element) tokenRefs.current.set(token.id, element);
                else tokenRefs.current.delete(token.id);
              }}
              type="button"
            >
              <span>{token.label}</span>
              <span aria-hidden="true">Add</span>
            </button>
          ))}
          {!available.length ? <p>All filters are applied.</p> : null}
        </div>
      </section>
      <section className="tb-token-transfer__bucket tb-token-transfer__bucket--applied" aria-labelledby={appliedId}>
        <div className="tb-token-transfer__header">
          <span className="tb-token-transfer__label" id={appliedId}>Applied</span>
          <span>{applied.length}</span>
        </div>
        <div className="tb-token-transfer__tokens">
          {applied.map((token) => (
            <button
              aria-label={`Remove ${token.label}`}
              className="tb-token-transfer__token"
              key={token.id}
              onClick={() => move(token, false)}
              ref={(element) => {
                if (element) tokenRefs.current.set(token.id, element);
                else tokenRefs.current.delete(token.id);
              }}
              type="button"
            >
              <span>{token.label}</span>
              <span aria-hidden="true">Remove</span>
            </button>
          ))}
          {!applied.length ? <p>No filters applied.</p> : null}
        </div>
      </section>
      <span className="tb-token-transfer__status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
