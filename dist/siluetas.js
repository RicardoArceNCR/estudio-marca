import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Siluetas decorativas detrás del texto de una portada: una forma de la marca,
 * repetida y girada sobre un pivote, cortada por el borde del lado elegido.
 * SVG en el HTML (sin JS): la composición quieta existe aunque no cargue nada.
 * Entran una vez con CSS y se detienen. Al pasar el cursor por la portada el
 * grupo se corre y las copias se abren en abanico sobre el pivote (0.10.0);
 * vuelven al salir. Con movimiento reducido, o sin cursor, no se mueven.
 * Color y opacidad por ganchos: --mk-silueta-color, --mk-silueta-opacidad.
 */
export function Siluetas({ capa }) {
    const [, , ancho = 1, alto = 1] = capa.forma.viewBox.trim().split(/[\s,]+/).map(Number);
    const copias = Math.min(Math.max(Math.round(capa.copias ?? 2), 1), 3);
    const giro = capa.giro ?? 18;
    const [px, py] = capa.pivote ?? [ancho / 2, alto / 2];
    return (_jsx("svg", { className: "mk-siluetas", "data-lado": capa.lado, viewBox: capa.forma.viewBox, style: { aspectRatio: `${ancho} / ${alto}`, "--mk-pivote": `${px}px ${py}px` }, "aria-hidden": "true", focusable: "false", children: Array.from({ length: copias }, (_, i) => (_jsx("g", { transform: i ? `rotate(${giro * i} ${px} ${py})` : undefined, children: _jsx("g", { className: "mk-silueta-capa", style: { "--mk-silueta-i": i }, children: _jsx("path", { className: "mk-silueta", d: capa.forma.d, style: { "--mk-silueta-i": i } }) }) }, i))) }));
}
