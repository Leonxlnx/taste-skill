"use client"

import {
  JSXPreview,
  JSXPreviewContent,
  JSXPreviewError,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/jsx-preview";

const trustedJsx = `<article className="rounded-xl border bg-card p-5">
  <h3 className="font-semibold">Release candidate</h3>
  <p className="mt-2 text-sm text-muted-foreground">All required checks passed.</p>
  <ul className="mt-4 grid gap-2 text-sm">
    <li>Keyboard navigation</li>
    <li>Reduced motion</li>
    <li>Narrow viewport</li>
  </ul>
</article>`;

export default function JSXPreviewDemo() {
  return (
    <JSXPreview className="w-full max-w-xl" jsx={trustedJsx}>
      <JSXPreviewContent />
      <JSXPreviewError className="mt-3" />
    </JSXPreview>
  );
}
