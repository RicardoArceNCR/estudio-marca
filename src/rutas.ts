import { SECCIONES_DEL_PAQUETE, seccionDe, type MarcaConfig } from "./config.js";

/** Slug de la ruta comodín: "" es el inicio; null, una ruta de más de un nivel. */
export function slugDe(slug?: string[] | string): string | null {
  if (!slug || (Array.isArray(slug) && slug.length === 0)) return "";
  if (Array.isArray(slug)) return slug.length === 1 ? (slug[0] ?? null) : null;
  return slug;
}

/** Para `generateStaticParams` de la ruta comodín. */
export function marcaParams(config: MarcaConfig): { slug: string[] }[] {
  const propias = config.secciones.filter(
    (s) => s.estado === "pendiente" || (SECCIONES_DEL_PAQUETE as readonly string[]).includes(s.slug),
  );
  return [{ slug: [] }, ...propias.map((s) => ({ slug: [s.slug] }))];
}

/** Para `generateMetadata`. Sin indexar salvo que la configuración lo pida. */
export function marcaMetadata(config: MarcaConfig, slug?: string[] | string) {
  const s = slugDe(slug);
  const seccion = s ? seccionDe(config, s) : undefined;
  return {
    title: seccion ? `${seccion.titulo} · ${config.nombre}` : config.nombre,
    description: seccion?.resumen ?? `Lineamientos, archivos y sistema de diseño de ${config.marca}.`,
    robots: config.indexar ? undefined : { index: false, follow: false },
  };
}
