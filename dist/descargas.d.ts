import type { VersionLogo } from "./config.js";
export declare function DescargasVersion({ version, archivo }: {
    version: VersionLogo;
    archivo: string;
}): import("react").JSX.Element;
export declare function DescargaZip({ versiones, archivo, marca, version, leeme, }: {
    versiones: VersionLogo[];
    archivo: string;
    marca: string;
    version: string;
    leeme: string;
}): import("react").JSX.Element;
/**
 * Versiones y descargas: el ZIP arriba y, debajo, una galería con cada
 * versión grande sobre su fondo, para qué sirve y sus formatos a la vista.
 * Va arriba en Logo: es la tarea más común.
 */
export declare function PanelDescargas({ versiones, archivo, marca, version, leeme, fondos, porDefecto, manual, }: {
    versiones: VersionLogo[];
    archivo: string;
    marca: string;
    version: string;
    leeme: string;
    /** Estilo de la lámina de cada versión (fondo claro, oscuro o token). */
    fondos: Record<string, {
        "data-fondo": string;
        style?: Record<string, string>;
    }>;
    /** Id de la versión por defecto: lleva la etiqueta "Por defecto". */
    porDefecto?: string;
    /** Manual en PDF: va junto al ZIP. */
    manual?: {
        href: string;
        detalle: string;
    };
}): import("react").JSX.Element;
