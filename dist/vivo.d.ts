import { type ReactNode } from "react";
import { type TokenSistema } from "./config.js";
/**
 * Muestras en vivo: pintan con `var(--token)` y después leen lo que resolvió
 * el navegador. Nunca escriben un valor a mano, así que muestran lo que de
 * verdad carga el sitio, en el tema activo.
 */
/** Sube un contador cuando cambia el tema (`class` o `data-theme` de <html>). */
export declare function useVersionTema(): number;
export declare function avisar(texto: string): void;
export declare function copiar(valor: string): Promise<void>;
/**
 * Región de estado única del portal. Vacía el texto antes de escribir el nuevo
 * para que el lector de pantalla anuncie también un mensaje repetido.
 */
export declare function Aviso(): import("react").JSX.Element;
export declare function Muestra({ nombre, token, uso, fuente, cmyk, pantone, }: {
    nombre: string;
    token: string;
    uso?: string;
    fuente?: string;
    cmyk?: string;
    pantone?: string;
}): import("react").JSX.Element;
export declare function Rampa({ familia, prefijo, pasos, ancla, }: {
    familia: string;
    prefijo: string;
    pasos: number[];
    ancla?: number;
}): import("react").JSX.Element;
/** Par de contraste medido sobre el CSS real, con el resultado en texto. */
export declare function ParContraste({ etiqueta, texto, fondo, minimo, }: {
    etiqueta: string;
    texto: string;
    fondo: string;
    minimo?: number;
}): import("react").JSX.Element;
export declare function Especimen({ nombre, size, lineHeight, family, weight, tracking, uso, children, }: {
    nombre: string;
    size: string;
    lineHeight?: string;
    family?: string;
    weight?: string;
    tracking?: string;
    /** Cuándo se usa el estilo. */
    uso?: string;
    children: ReactNode;
}): import("react").JSX.Element;
/** Espaciado, radios o sombras: dibuja el token y escribe su valor resuelto. */
export declare function Escala({ tipo, tokens: entradas }: {
    tipo: "espaciado" | "radio" | "sombra";
    tokens: TokenSistema[];
}): import("react").JSX.Element;
