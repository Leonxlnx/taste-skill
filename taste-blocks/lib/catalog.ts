import data from "@/generated/catalog.json";

export interface CatalogComponent {
  name: string;
  title: string;
  description: string;
  meta: Record<string, unknown>;
}

export const catalog = data as CatalogComponent[];

export function getComponent(name: string) {
  return catalog.find((component) => component.name === name);
}
