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
 * Panel de descargas: el ZIP primero y, por versión, una vista previa con sus
 * formatos agrupados en un menú. Va arriba en Logo: es la tarea más común.
 */
export declare function PanelDescargas({ versiones, archivo, marca, version, leeme, fondos, }: {
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
}): import("react").JSX.Element;
