import { ArtifactProcess } from "./artifact-process";

export default function ArtifactProcessPreview() {
  return (
    <ArtifactProcess
      title="Keep one artifact in view."
      phases={[
        {
          title: "Frame",
          description: "Define the audience, material, and decision the page must support.",
          artifactTitle: "Content frame",
          artifactDetails: ["Audience", "Primary decision", "Available proof"],
        },
        {
          title: "Arrange",
          description: "Test hierarchy and sequence with the real content before adding effects.",
          artifactTitle: "Page sequence",
          artifactDetails: ["Opening", "Evidence", "Next action"],
        },
        {
          title: "Refine",
          description: "Tune responsive behavior, interaction states, motion, and delivery details.",
          artifactTitle: "Release check",
          artifactDetails: ["Keyboard", "Reflow", "Reduced motion"],
        },
      ]}
    />
  );
}
