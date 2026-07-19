import { SectionThemeHandoff } from "./section-theme-handoff";
import "./preview.css";

const chapters = [
  {
    id: "scope",
    title: "Scope the question",
    summary: "Define the decision, the people affected, and the evidence needed before choosing a format.",
    background: "#eee9dc",
    foreground: "#233028",
    accent: "#236144",
  },
  {
    id: "evidence",
    title: "Test the evidence",
    summary: "Separate observed behavior from assumptions, record uncertainty, and keep the source beside the claim.",
    background: "#cbd6c3",
    foreground: "#1e3028",
    accent: "#173f31",
  },
  {
    id: "decision",
    title: "Make the decision",
    summary: "Choose the smallest response that answers the question, then state what still needs verification.",
    background: "#20342d",
    foreground: "#f0ede2",
    accent: "#d7f26a",
  },
];

export default function SectionThemeHandoffPreview() {
  return (
    <div className="tb-section-theme-handoff-preview">
      <SectionThemeHandoff chapters={chapters} navigationLabel="Research process chapters" />
    </div>
  );
}
