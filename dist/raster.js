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
export const MAX_RASTER_WIDTH = 3840;
export async function rasterize(svgText, [w, h], width, opts = {}) {
    const { type = "image/png", quality = 0.85, background, plate } = opts;
    const out = Math.min(Math.round(width), MAX_RASTER_WIDTH);
    const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
    try {
        const img = new Image(out, Math.round((out * h) / w));
        img.decoding = "async";
        img.src = url;
        await img.decode();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("canvas 2d no disponible");
        if (plate) {
            canvas.width = canvas.height = out;
            ctx.fillStyle = plate;
            ctx.fillRect(0, 0, out, out);
            const mw = out * 0.62;
            const mh = (mw * h) / w;
            ctx.drawImage(img, (out - mw) / 2, (out - mh) / 2, mw, mh);
        }
        else {
            canvas.width = out;
            canvas.height = Math.round((out * h) / w);
            if (background) {
                ctx.fillStyle = background;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        return await new Promise((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("toBlob"))), type, quality));
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
/** Trae un archivo de /public como texto (los SVG de marca). */
export async function fetchText(src) {
    const res = await fetch(src);
    if (!res.ok)
        throw new Error(`${src}: ${res.status}`);
    return res.text();
}
/** Ancho y alto del viewBox de un SVG; si no hay, los atributos width/height. */
export function medidasSvg(svgText) {
    const vb = svgText.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
    if (vb?.[1] && vb[2])
        return [Number(vb[1]), Number(vb[2])];
    const w = svgText.match(/<svg[^>]*\swidth=["']([\d.]+)/)?.[1];
    const h = svgText.match(/<svg[^>]*\sheight=["']([\d.]+)/)?.[1];
    return [Number(w ?? 1000), Number(h ?? 1000)];
}
