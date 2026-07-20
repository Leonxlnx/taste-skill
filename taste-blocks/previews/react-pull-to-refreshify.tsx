"use client";

import { useEffect, useRef, useState } from "react";

import { PullToRefreshify } from "@/registry/sources/react-pull-to-refreshify/components/react-pull-to-refreshify/PullToRefreshify";
import type { PullStatus } from "@/registry/sources/react-pull-to-refreshify/components/react-pull-to-refreshify/types";

const statusCopy: Record<PullStatus, string> = {
  normal: "Pull down or use the refresh button",
  pulling: "Keep pulling",
  canRelease: "Release to refresh",
  refreshing: "Refreshing activity",
  complete: "Activity refreshed",
};

const activity = [
  "Design review notes",
  "Accessibility audit",
  "Release checklist",
  "API migration",
  "Mobile interaction QA",
  "Copy review",
  "Dependency update",
  "Performance trace",
];

export default function ReactPullToRefreshifyPreview() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [revision, setRevision] = useState(1);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    []
  );

  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setRevision((value) => value + 1);
      setRefreshing(false);
    }, 700);
  };

  return (
    <div
      style={{
        width: "min(100%, 32rem)",
        border: "1px solid #cbd5d1",
        borderRadius: "0.875rem",
        background: "#f8faf9",
        color: "#17201d",
        boxShadow: "0 1rem 3rem rgba(23, 32, 29, 0.1)",
        overflow: "hidden",
      }}
    >
      <PullToRefreshify
        refreshing={refreshing}
        onRefresh={refresh}
        refreshButtonLabel="Refresh activity"
        renderStatus={(status) => statusCopy[status]}
        renderText={(status, percent) =>
          status === "pulling"
            ? `${statusCopy[status]} ${Math.round(percent)}%`
            : statusCopy[status]
        }
        style={{
          maxHeight: 360,
          overflowY: "auto",
          overscrollBehaviorY: "contain",
        }}
      >
        <div style={{ paddingInline: "1rem", paddingBlockEnd: "1rem" }}>
          <p
            style={{
              margin: "0 0 0.75rem",
              color: "#52605b",
              fontSize: "0.8125rem",
            }}
          >
            Activity revision {revision}
          </p>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {activity.map((item, index) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: 48,
                  padding: "0.75rem",
                  border: "1px solid #dce3e0",
                  borderRadius: "0.625rem",
                  background: "#ffffff",
                }}
              >
                <span>{item}</span>
                <span style={{ color: "#66736e", fontSize: "0.75rem" }}>
                  {revision + index}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PullToRefreshify>
    </div>
  );
}
