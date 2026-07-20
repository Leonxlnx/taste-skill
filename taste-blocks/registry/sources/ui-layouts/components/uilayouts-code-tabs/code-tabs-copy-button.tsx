"use client";

import { CheckCheck, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "../../lib/utils";

export function CopyButton({ code, classname }: { code: string; classname?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setStatus("idle"), 1000);
  };

  return (
    <button
      aria-label={status === "copied" ? "Code copied" : status === "failed" ? "Copy failed" : "Copy code"}
      className={cn(
        "absolute right-2 top-2 grid h-8 w-9 cursor-pointer place-content-center rounded-md border-2 bg-card backdrop-blur-2xl transition-shadow hover:border-blue-300 hover:shadow-[0px_1px_10px_5px_#9abaf7] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none dark:hover:border-blue-500 dark:hover:shadow-[0px_1px_10px_5px_#3f7ef3]",
        classname,
      )}
      onClick={onCopy}
      type="button"
    >
      {status === "copied" ? (
        <CheckCheck aria-hidden="true" className="h-4 w-4 text-foreground/80" />
      ) : (
        <Copy aria-hidden="true" className="h-4 w-4 text-foreground/80" />
      )}
    </button>
  );
}
