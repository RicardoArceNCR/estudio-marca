import { type MarcaConfig } from "./config.js";
/** Slug de la ruta comodín: "" es el inicio; null, una ruta de más de un nivel. */
export declare function slugDe(slug?: string[] | string): string | null;
/** Para `generateStaticParams` de la ruta comodín. */
export declare function marcaParams(config: MarcaConfig): {
    slug: string[];
}[];
/** Para `generateMetadata`. Sin indexar salvo que la configuración lo pida. */
export declare function marcaMetadata(config: MarcaConfig, slug?: string[] | string): {
    title: string;
    description: string;
    robots: {
        index: boolean;
        follow: boolean;
    } | undefined;
};
