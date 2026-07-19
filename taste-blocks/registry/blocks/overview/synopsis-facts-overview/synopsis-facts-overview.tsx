import "./synopsis-facts-overview.css";

export interface SynopsisFact {
  label: string;
  value: string;
}

export interface SynopsisFactsOverviewProps {
  title: string;
  synopsis: string;
  facts: SynopsisFact[];
}

export function SynopsisFactsOverview({
  title,
  synopsis,
  facts,
}: SynopsisFactsOverviewProps) {
  return (
    <section className="tb-synopsis">
      <div className="tb-synopsis__statement">
        <h2>{title}</h2>
        <p>{synopsis}</p>
      </div>
      <dl className="tb-synopsis__facts">
        {facts.map((fact) => (
          <div key={`${fact.label}-${fact.value}`}>
            <dt>{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
