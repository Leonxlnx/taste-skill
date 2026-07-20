"use client"

import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/reasoning";

export default function ReasoningPreview() {
  return (
    <Reasoning className="w-full max-w-2xl" defaultOpen duration={6}>
      <ReasoningTrigger />
      <ReasoningContent>
        I compared the current API contract, verified the dependency versions,
        and checked the result against the narrow viewport and keyboard paths.
      </ReasoningContent>
    </Reasoning>
  );
}
