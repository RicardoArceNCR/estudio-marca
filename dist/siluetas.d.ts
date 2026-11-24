import type { CapaSiluetas } from "./config.js";
/**
 * Siluetas decorativas detrás del texto de una portada: una forma de la marca,
 * repetida y girada sobre un pivote, cortada por el borde del lado elegido.
 * SVG en el HTML (sin JS): la composición quieta existe aunque no cargue nada.
 * Entran una vez con CSS y se detienen; con movimiento reducido no se mueven.
 * Color y opacidad por ganchos: --mk-silueta-color, --mk-silueta-opacidad.
 */
export declare function Siluetas({ capa }: {
    capa: CapaSiluetas;
}): import("react").JSX.Element;
