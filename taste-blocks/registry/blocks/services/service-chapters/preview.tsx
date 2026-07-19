import { ServiceChapters } from "./service-chapters";

export default function ServiceChaptersPreview() {
  return (
    <ServiceChapters
      title="Show the work by responsibility."
      services={[
        {
          title: "Direction",
          description: "Set the visual and verbal constraints before selecting layouts or effects.",
          scope: "Brand, references, design system",
        },
        {
          title: "Composition",
          description: "Turn the content sequence into responsive page structures with a distinct rhythm.",
          scope: "Hierarchy, sections, responsive layout",
        },
        {
          title: "Delivery",
          description: "Build the chosen system with semantic markup, real states, and measured motion.",
          scope: "Frontend, accessibility, QA",
        },
      ]}
    />
  );
}
