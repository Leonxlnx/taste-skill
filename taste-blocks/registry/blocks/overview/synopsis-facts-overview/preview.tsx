import { SynopsisFactsOverview } from "./synopsis-facts-overview";

export default function SynopsisFactsOverviewPreview() {
  return (
    <SynopsisFactsOverview
      title="Context before detail."
      synopsis="This composition introduces the work in plain language, then keeps the practical facts close enough to scan."
      facts={[
        { label: "Purpose", value: "Introduce a project or offer" },
        { label: "Best for", value: "Case studies and service pages" },
        { label: "Content", value: "One synopsis and a few verified facts" },
      ]}
    />
  );
}
