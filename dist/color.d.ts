/**
 * Lectura de colores como los devuelve `getComputedStyle` y contraste WCAG.
 * Sin DOM: lo usan las muestras en vivo y las pruebas.
 */
export type Rgba = [number, number, number, number];
/** rgb()/rgba() o color(srgb …). */
export declare function parseColor(input: string): Rgba | null;
export declare function toHex([r, g, b]: Rgba): string;
export declare function toRgb([r, g, b]: Rgba): string;
/** Compone un color con alfa sobre su fondo antes de medir. */
export declare function over(fg: Rgba, bg: Rgba): Rgba;
export declare function contrast(fg: Rgba, bg: Rgba): number;
/** "4,52:1": con coma decimal y truncado, para no redondear un 4,499 a 4,5. */
export declare function formatRatio(ratio: number): string;
