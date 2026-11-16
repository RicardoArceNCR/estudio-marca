import type { ReactNode } from "react";
import { type MarcaConfig } from "./config.js";
/** "Vigente · Actualizado el 15 de noviembre de 2026", si la configuración lo trae. */
export declare function EstadoPortal({ config }: {
    config: MarcaConfig;
}): import("react").JSX.Element | null;
export declare function Encabezado({ antetitulo, titulo, children, config, }: {
    antetitulo: string;
    titulo: string;
    children?: ReactNode;
    config?: MarcaConfig;
}): import("react").JSX.Element;
export declare function Bloque({ id, titulo, antetitulo, bajada, children, }: {
    id: string;
    titulo: string;
    antetitulo?: string;
    bajada?: string;
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
