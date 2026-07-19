import "./editorial-work-index.css";

export interface WorkIndexItem {
  title: string;
  discipline: string;
  href: string;
}

export interface EditorialWorkIndexProps {
  title: string;
  projects: WorkIndexItem[];
}

export function EditorialWorkIndex({ title, projects }: EditorialWorkIndexProps) {
  return (
    <section className="tb-work-index">
      <h2>{title}</h2>
      <ul>
        {projects.map((project) => (
          <li key={`${project.title}-${project.href}`}>
            <a href={project.href}>
              <strong>{project.title}</strong>
              <span>{project.discipline}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
