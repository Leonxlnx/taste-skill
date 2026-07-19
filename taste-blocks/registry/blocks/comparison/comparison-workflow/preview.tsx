import { ComparisonWorkflow } from "./comparison-workflow";

export default function ComparisonWorkflowPreview() {
  return (
    <ComparisonWorkflow
      title="Compare the real tradeoffs."
      leftLabel="Single page"
      rightLabel="Multi-page"
      criteria={[
        { label: "Navigation", left: "A short sequence keeps the main decision in one flow.", right: "Dedicated routes give distinct topics stable destinations." },
        { label: "Content depth", left: "Best when the argument can stay concise.", right: "Better when subjects need independent detail and search context." },
        { label: "Maintenance", left: "Fewer surfaces to update, with tighter content limits.", right: "More structure to maintain, with room for content to grow." },
      ]}
    />
  );
}
