/**
 * Lectura de colores como los devuelve `getComputedStyle` y contraste WCAG.
 * Sin DOM: lo usan las muestras en vivo y las pruebas.
 */
/** rgb()/rgba() o color(srgb …). */
export function parseColor(input) {
    const s = input.trim();
    let m = s.match(/^rgba?\(([^)]+)\)$/);
    if (m?.[1]) {
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, p[3] ?? 1];
    }
    m = s.match(/^color\(srgb ([^)]+)\)$/);
    if (m?.[1]) {
        const p = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
        return [(p[0] ?? 0) * 255, (p[1] ?? 0) * 255, (p[2] ?? 0) * 255, p[3] ?? 1];
    }
    return null;
}
export function toHex([r, g, b]) {
    return ("#" +
        [r, g, b]
            .map((n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase());
}
export function toRgb([r, g, b]) {
    return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`;
}
function luminance([r, g, b]) {
    const ch = (c) => {
        const x = c / 255;
        return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
/** Compone un color con alfa sobre su fondo antes de medir. */
export function over(fg, bg) {
    const a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
}
export function contrast(fg, bg) {
    const f = luminance(over(fg, bg));
    const b = luminance(bg);
    const [hi, lo] = f > b ? [f, b] : [b, f];
    return (hi + 0.05) / (lo + 0.05);
}
/** "4,52:1": con coma decimal y truncado, para no redondear un 4,499 a 4,5. */
export function formatRatio(ratio) {
    return `${(Math.floor(ratio * 100) / 100).toFixed(2).replace(".", ",")}:1`;
}
