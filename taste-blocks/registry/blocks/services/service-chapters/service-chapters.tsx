import "./service-chapters.css";

export interface ServiceChapter {
  title: string;
  description: string;
  scope: string;
}

export interface ServiceChaptersProps {
  title: string;
  services: ServiceChapter[];
}

export function ServiceChapters({ title, services }: ServiceChaptersProps) {
  return (
    <section className="tb-service-chapters">
      <h2>{title}</h2>
      <div className="tb-service-chapters__list">
        {services.map((service) => (
          <article className="tb-service-chapters__item" key={service.title}>
            <h3>{service.title}</h3>
            <div>
              <p>{service.description}</p>
              <span>{service.scope}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
