import { type ReactNode } from "react";
import { type MarcaConfig } from "./config.js";
/**
 * Marco del portal: salto al contenido, navegación lateral en escritorio,
 * menú modal en móvil, índice de la página y región de avisos. La navegación
 * sale de `config.secciones`: una sección nueva aparece sola en los dos
 * lugares.
 */
export declare function MarcaShell({ config, children, salir, }: {
    config: MarcaConfig;
    children: ReactNode;
    /** Solo si el sitio pone el portal detrás de un ingreso. */
    salir?: () => void | Promise<void>;
}): import("react").JSX.Element;
