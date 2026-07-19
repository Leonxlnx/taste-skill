import { CompactFooter } from "./compact-footer";

export default function CompactFooterPreview() {
  return (
    <CompactFooter
      brand="Taste Blocks"
      statement="Open-source React sections with visible source and clear usage boundaries."
      links={[
        { label: "Blocks", href: "#/blocks" },
        { label: "Docs", href: "#/docs" },
        { label: "Sources", href: "#/sources" },
        { label: "License", href: "#/license" },
      ]}
      legalLinks={[
        { label: "MIT License", href: "#/license" },
        { label: "Source notes", href: "#/sources" },
      ]}
      copyright="© 2026 Taste Blocks"
    />
  );
}
