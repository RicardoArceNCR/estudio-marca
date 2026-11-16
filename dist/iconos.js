import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Íconos del portal: un set propio, de línea, en `currentColor`. La
 * configuración los nombra; el paquete los dibuja. No hay íconos de clientes.
 */
export const ICONOS = {
    inicio: "M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5",
    logo: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z",
    color: "M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.6-1.2-.6-2 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4C21 7 17 3 12 3zM7.5 12.5h.01M9.5 8h.01M14.5 8h.01M16.5 11.5h.01",
    tipografia: "M4 19 9.5 5h1L16 19M6.2 14h7.6M15 19h5M17.5 11v8M15.5 13h4",
    sistema: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    descargar: "M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4 17v3h16v-3",
    copiar: "M9 9h11v11H9zM5 15H4V4h11v1",
    imagen: "M4 5h16v14H4zM4 16l5-5 4 4 2.5-2.5L20 17M15.5 9.5h.01",
    voz: "M4 5h16v11H9l-5 4z",
    correo: "M4 6h16v12H4zM4 7l8 6 8-6",
    personaje: "M12 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM8 10h3M13 10h3M9 14c1.8 1.3 4.2 1.3 6 0M7 21h10",
    documento: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6",
    externo: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
    flecha: "M5 12h14m0 0-5-5m5 5-5 5",
};
export function esIcono(nombre) {
    return Object.prototype.hasOwnProperty.call(ICONOS, nombre);
}
export function Icono({ nombre, className }) {
    return (_jsx("svg", { className: className ? `mk-icono ${className}` : "mk-icono", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: ICONOS[nombre] }) }));
}
