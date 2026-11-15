/**
 * Rasteriza un SVG (texto) a PNG o JPG en el navegador.
 *
 * - El `<img>` se carga con ancho y alto explícitos y enteros: con las medidas
 *   decimales del archivo, Firefox puede dibujarlo en blanco o a 1×.
 * - `background` pinta un soporte sólido antes del dibujo (obligatorio en JPG:
 *   sin él la transparencia sale negra).
 * - `plate` hace un cuadrado del color dado con el arte al 62 % del lado
 *   (avatar / ícono).
 * - Ancho tope 3840: Safari en iOS corta el canvas cerca de 16,7 MP.
 */
export declare const MAX_RASTER_WIDTH = 3840;
export declare function rasterize(svgText: string, [w, h]: readonly [number, number], width: number, opts?: {
    type?: "image/png" | "image/jpeg";
    quality?: number;
    background?: string;
    plate?: string;
}): Promise<Blob>;
/** Trae un archivo de /public como texto (los SVG de marca). */
export declare function fetchText(src: string): Promise<string>;
/** Ancho y alto del viewBox de un SVG; si no hay, los atributos width/height. */
export declare function medidasSvg(svgText: string): [number, number];
