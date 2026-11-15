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
