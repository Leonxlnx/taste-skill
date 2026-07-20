"use client"

import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationSource,
  InlineCitationText,
} from "@/registry/sources/vercel-ai-elements/components/vercel-ai-elements/inline-citation";

const sources = [
  { description: "Keyboard behavior and focus order.", title: "Interaction audit", url: "#interaction-audit" },
  { description: "Narrow viewport and RTL checks.", title: "Responsive audit", url: "#responsive-audit" },
];

export default function InlineCitationPreview() {
  return (
    <p className="max-w-2xl text-sm leading-7">
      The component passed the interaction and responsive checks.{" "}
      <InlineCitation>
        <InlineCitationText>Review the evidence</InlineCitationText>
        <InlineCitationCard>
          <InlineCitationCardTrigger sources={sources.map((source) => source.url)} />
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselHeader>
                <InlineCitationCarouselPrev />
                <InlineCitationCarouselNext />
                <InlineCitationCarouselIndex />
              </InlineCitationCarouselHeader>
              <InlineCitationCarouselContent>
                {sources.map((source) => (
                  <InlineCitationCarouselItem key={source.url}>
                    <InlineCitationSource {...source} />
                  </InlineCitationCarouselItem>
                ))}
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    </p>
  );
}
