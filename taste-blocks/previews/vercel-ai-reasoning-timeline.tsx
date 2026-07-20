"use client"

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtSearchResult,
  ChainOfThoughtSearchResults,
  ChainOfThoughtStep,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/chain-of-thought";
import { SearchIcon } from "lucide-react";

export default function ReasoningTimelinePreview() {
  return (
    <ChainOfThought className="w-full max-w-2xl" defaultOpen>
      <ChainOfThoughtHeader>Research trace</ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        <ChainOfThoughtStep
          icon={SearchIcon}
          label="Compared the primary documentation"
          status="complete"
        >
          <ChainOfThoughtSearchResults>
            <ChainOfThoughtSearchResult>API reference</ChainOfThoughtSearchResult>
            <ChainOfThoughtSearchResult>Migration guide</ChainOfThoughtSearchResult>
          </ChainOfThoughtSearchResults>
        </ChainOfThoughtStep>
        <ChainOfThoughtStep
          label="Checked the implementation against the current release"
          status="complete"
        />
        <ChainOfThoughtStep
          label="Preparing the final recommendation"
          status="active"
        />
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
