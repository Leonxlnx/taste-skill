"use client";

import { type ReactNode, useEffect, useState } from "react";

import { cn } from "../../lib/utils";
import { CopyButton } from "./code-tabs-copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./code-tabs-tabs";

export type CodeTabInput = {
  id: string;
  label: ReactNode;
  code: string;
  lang?: string;
};

export function CodeTabs({
  tabs,
  defaultValue,
  className,
}: {
  tabs: CodeTabInput[];
  defaultValue?: string;
  className?: string;
}) {
  const [highlighted, setHighlighted] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { codeToHtml } = await import("shiki/bundle/web");
        const entries = await Promise.all(
          tabs.map(async (tab) => {
            const html = await codeToHtml(tab.code, {
              lang: tab.lang ?? "tsx",
              themes: { light: "github-light", dark: "slack-dark" },
            });
            return [tab.id, html] as const;
          }),
        );
        if (!cancelled) setHighlighted(Object.fromEntries(entries));
      } catch {
        if (!cancelled) setHighlighted({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tabs]);

  if (tabs.length === 0) return null;

  if (tabs.length === 1) {
    const tab = tabs[0];
    return (
      <div className={cn("relative overflow-x-auto rounded bg-zinc-900 p-4", className)}>
        <CopyButton classname="absolute right-2 top-2" code={tab.code} />
        {highlighted[tab.id] ? (
          <div dangerouslySetInnerHTML={{ __html: highlighted[tab.id] }} />
        ) : (
          <pre className="opacity-50">
            <code>{tab.code}</code>
          </pre>
        )}
      </div>
    );
  }

  const initialValue = tabs.some((tab) => tab.id === defaultValue) ? defaultValue : tabs[0].id;

  return (
    <Tabs
      className={cn("relative my-5 rounded-xl border bg-muted p-1 backdrop-blur-md", className)}
      defaultValue={initialValue}
    >
      <TabsList aria-label="Code examples" className="mx-1 mt-1 rounded-lg border-0 bg-transparent">
        {tabs.map((tab) => (
          <TabsTrigger
            className="gap-1 data-[state=active]:border data-[state=active]:bg-card"
            key={tab.id}
            value={tab.id}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent className="mt-1 overflow-x-auto border-none" key={tab.id} value={tab.id}>
          <CopyButton classname="absolute right-3 top-1.5 border bg-card" code={tab.code} />
          {highlighted[tab.id] ? (
            <div
              className="cliblocks rounded-xl border-none px-2 py-1"
              dangerouslySetInnerHTML={{ __html: highlighted[tab.id] }}
            />
          ) : (
            <pre className="cliblocks rounded-xl px-2 py-1 opacity-50">
              <code>{tab.code}</code>
            </pre>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
