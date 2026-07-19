"use client";

import { useId, useRef, useState } from "react";
import "./expanding-action-group.css";

export interface ExpandingAction {
  id: string;
  label: string;
}

export interface ExpandingActionGroupProps {
  actions: ExpandingAction[];
  label?: string;
  onAction: (id: string) => void;
}

export function ExpandingActionGroup({
  actions,
  label = "More actions",
  onAction,
}: ExpandingActionGroupProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div
      className="tb-action-group"
      data-open={open}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.preventDefault();
          close();
        }
      }}
    >
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className="tb-action-group__trigger"
        disabled={!actions.length}
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        type="button"
      >
        <span>{label}</span>
        <span className="tb-action-group__mark" aria-hidden="true" />
      </button>
      {open ? (
        <div
          className="tb-action-group__panel"
          id={panelId}
          role="group"
          aria-label={label}
        >
          {actions.map((action) => (
            <button
              className="tb-action-group__action"
              key={action.id}
              onClick={() => {
                onAction(action.id);
                close();
              }}
              type="button"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
