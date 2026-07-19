import "./comparison-workflow.css";

export interface ComparisonCriterion {
  label: string;
  left: string;
  right: string;
}

export interface ComparisonWorkflowProps {
  title: string;
  leftLabel: string;
  rightLabel: string;
  criteria: ComparisonCriterion[];
}

export function ComparisonWorkflow({
  title,
  leftLabel,
  rightLabel,
  criteria,
}: ComparisonWorkflowProps) {
  return (
    <section className="tb-comparison">
      <h2>{title}</h2>
      <div className="tb-comparison__labels" aria-hidden="true">
        <span />
        <strong>{leftLabel}</strong>
        <strong>{rightLabel}</strong>
      </div>
      <div className="tb-comparison__criteria">
        {criteria.map((criterion) => (
          <article key={criterion.label}>
            <h3>{criterion.label}</h3>
            <div>
              <strong>{leftLabel}</strong>
              <p>{criterion.left}</p>
            </div>
            <div>
              <strong>{rightLabel}</strong>
              <p>{criterion.right}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
