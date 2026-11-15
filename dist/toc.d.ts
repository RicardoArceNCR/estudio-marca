/**
 * Índice de la página, leído del DOM: las `<section id>` de primer nivel dentro
 * de `<main>`, con el texto de su h2 o de `data-toc`. `actual` es la sección
 * que se está leyendo.
 */
export type Indice = {
    id: string;
    titulo: string;
}[];
export declare function useIndice(pathname: string): {
    indice: Indice;
    actual: string;
};
/**
 * Lleva el foco a una sección después de saltar a ella. Sin esto el scroll se
 * mueve pero el próximo Tab arranca desde donde estaba el foco.
 */
export declare function enfocarSeccion(id: string, desplazar?: boolean): void;
