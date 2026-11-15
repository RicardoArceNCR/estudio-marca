import type { ReactNode } from "react";
import { type MarcaConfig } from "./config.js";
export declare function Encabezado({ antetitulo, titulo, children }: {
    antetitulo: string;
    titulo: string;
    children?: ReactNode;
}): import("react").JSX.Element;
export declare function Bloque({ id, titulo, children }: {
    id: string;
    titulo: string;
    children: ReactNode;
}): import("react").JSX.Element;
/**
 * Página del portal para una ruta comodín opcional (`app/marca/[[...slug]]`).
 * Pinta inicio, las secciones del paquete y las pendientes; cualquier otra
 * ruta da 404. Una sección propia del sitio va en una ruta explícita.
 */
export declare function MarcaPagina({ config, slug }: {
    config: MarcaConfig;
    slug?: string[] | string;
}): import("react").JSX.Element;
export declare function MarcaNoEncontrada({ config }: {
    config: MarcaConfig;
}): import("react").JSX.Element;
