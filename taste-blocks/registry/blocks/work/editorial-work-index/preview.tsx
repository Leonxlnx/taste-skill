import { EditorialWorkIndex } from "./editorial-work-index";

export default function EditorialWorkIndexPreview() {
  return (
    <EditorialWorkIndex
      title="A short index of work."
      projects={[
        { title: "Block catalog", discipline: "Browse the available sections", href: "#/blocks" },
        { title: "Installation notes", discipline: "Add one registry item", href: "#/docs" },
        { title: "Source ledger", discipline: "Review origin and license", href: "#/sources" },
        { title: "License terms", discipline: "Understand reuse boundaries", href: "#/license" },
      ]}
    />
  );
}
