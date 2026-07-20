"use client"

import {
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentBody,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/context";

export default function ContextMeterPreview() {
  return (
    <Context
      maxTokens={128_000}
      modelId="openai:gpt-5"
      usage={{
        cachedInputTokens: 2_400,
        inputTokens: 28_000,
        outputTokens: 7_600,
        reasoningTokens: 3_200,
      }}
      usedTokens={38_800}
    >
      <ContextTrigger />
      <ContextContent>
        <ContextContentHeader />
        <ContextContentBody>
          <ContextInputUsage />
          <ContextOutputUsage />
          <ContextReasoningUsage />
          <ContextCacheUsage />
        </ContextContentBody>
        <ContextContentFooter />
      </ContextContent>
    </Context>
  );
}
