"use client";

import { useRef } from "react";

import { GitPullRequestIcon, type GitPullRequestIconHandle } from "@/registry/sources/lucide-animated/components/lucide-animated-git-pull-request-icon/git-pull-request";

export default function Preview() {
  const icon = useRef<GitPullRequestIconHandle>(null);
  const start = () => icon.current?.startAnimation();
  const stop = () => icon.current?.stopAnimation();

  return (
    <div className="flex min-h-72 items-center justify-center">
      <button
        type="button"
        aria-label="Animate Git Pull Request Icon"
        className="touch-manipulation rounded-xl p-4 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onFocus={start}
        onBlur={stop}
        onPointerEnter={start}
        onPointerLeave={stop}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <GitPullRequestIcon ref={icon} aria-hidden="true" size={64} />
      </button>
    </div>
  );
}
