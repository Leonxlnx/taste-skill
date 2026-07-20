"use client"

import {
  WebPreview,
  WebPreviewBody,
  WebPreviewConsole,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/web-preview";
import { ArrowLeftIcon, ArrowRightIcon, RefreshCcwIcon } from "lucide-react";

const document = `<!doctype html><html><body style="margin:0;font-family:system-ui;background:#f5f5f4;color:#1c1917"><main style="padding:32px"><h1 style="margin:0 0 8px;font-size:28px">Local preview</h1><p style="margin:0;color:#78716c">Rendered from srcDoc without a network request.</p></main></body></html>`;

const logs = [
  { level: "log" as const, message: "Preview rendered", timestamp: new Date("2026-07-20T06:00:00Z") },
];

export default function WebPreviewDemo() {
  return (
    <WebPreview className="h-[390px] w-full max-w-3xl" defaultUrl="local-preview">
      <WebPreviewNavigation>
        <WebPreviewNavigationButton disabled tooltip="Back">
          <ArrowLeftIcon className="size-4 rtl:rotate-180" />
        </WebPreviewNavigationButton>
        <WebPreviewNavigationButton disabled tooltip="Forward">
          <ArrowRightIcon className="size-4 rtl:rotate-180" />
        </WebPreviewNavigationButton>
        <WebPreviewNavigationButton tooltip="Reload">
          <RefreshCcwIcon className="size-4" />
        </WebPreviewNavigationButton>
        <WebPreviewUrl readOnly />
      </WebPreviewNavigation>
      <WebPreviewBody srcDoc={document} />
      <WebPreviewConsole logs={logs} />
    </WebPreview>
  );
}
