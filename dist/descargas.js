"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { fetchText, medidasSvg, rasterize } from "./raster.js";
import { saveBlob } from "./save.js";
import { columnas } from "./rejilla.js";
import { avisar } from "./vivo.js";
import { makeZip } from "./zip.js";
/**
 * Descargas del logo, generadas en el navegador desde los SVG originales que
 * publica el sitio. No hay PNG ni ZIP precocinados que se queden viejos.
 */
const ANCHOS_PNG = [1200, 2400];
function useTarea() {
    const [ocupado, setOcupado] = useState(null);
    async function correr(id, nombre, tarea) {
        if (ocupado)
            return;
        setOcupado(id);
        avisar(`Preparando ${nombre}…`);
        try {
            await tarea();
            avisar(`Descargado: ${nombre}`);
        }
        catch {
            avisar(`No se pudo preparar ${nombre}.`);
        }
        finally {
            setOcupado(null);
        }
    }
    return { ocupado, correr };
}
function BotonDescarga({ id, tipo, nombre, ocupado, onClick, children, principal = false, etiqueta, }) {
    const este = ocupado === id;
    return (_jsx("button", { type: "button", className: principal ? "mk-boton" : "mk-boton mk-boton-secundario", "aria-label": etiqueta && !este ? etiqueta : undefined, "aria-disabled": ocupado ? true : undefined, onClick: onClick, "data-mk-descarga": true, "data-mk-tipo": tipo, "data-mk-archivo": nombre, children: este ? `Preparando ${children}…` : children }));
}
const png = async (svg, ancho) => rasterize(svg, medidasSvg(svg), ancho);
export function DescargasVersion({ version, archivo }) {
    const { ocupado, correr } = useTarea();
    const base = `${archivo}-logo-${version.id}`;
    const de = `de ${version.nombre}`;
    return (_jsxs("div", { className: "mk-descargas", role: "group", "aria-label": `Descargas: ${version.nombre}`, children: [_jsx(BotonDescarga, { id: "svg", tipo: "svg", nombre: `${base}.svg`, ocupado: ocupado, onClick: () => correr("svg", `${base}.svg`, async () => {
                    const svg = await fetchText(version.svg);
                    saveBlob(new Blob([svg], { type: "image/svg+xml" }), `${base}.svg`);
                }), etiqueta: `SVG ${de}`, children: "SVG" }), ANCHOS_PNG.map((ancho) => (_jsx(BotonDescarga, { id: `png-${ancho}`, tipo: "png", nombre: `${base}-${ancho}.png`, ocupado: ocupado, onClick: () => correr(`png-${ancho}`, `${base}-${ancho}.png`, async () => {
                    saveBlob(await png(await fetchText(version.svg), ancho), `${base}-${ancho}.png`);
                }), etiqueta: `PNG ${ancho} px ${de}`, children: `PNG ${ancho}` }, ancho)))] }));
}
export function DescargaZip({ versiones, archivo, marca, version, leeme, }) {
    const { ocupado, correr } = useTarea();
    const nombre = `${archivo}-logos.zip`;
    return (_jsx(BotonDescarga, { id: "zip", tipo: "zip", nombre: nombre, ocupado: ocupado, principal: true, onClick: () => correr("zip", nombre, async () => {
            const enc = new TextEncoder();
            const entradas = [];
            for (const v of versiones) {
                const svg = await fetchText(v.svg);
                entradas.push({ name: `svg/${archivo}-logo-${v.id}.svg`, data: enc.encode(svg) });
                const blob = await png(svg, 2400);
                entradas.push({ name: `png/${archivo}-logo-${v.id}-2400.png`, data: new Uint8Array(await blob.arrayBuffer()) });
            }
            entradas.unshift({
                name: "LEEME.txt",
                data: enc.encode(`${marca} · logos · versión ${version}\n\n${leeme}\n`),
            });
            saveBlob(makeZip(entradas), nombre);
        }), children: `Descargar todo (.zip)` }));
}
/**
 * Versiones y descargas: el ZIP arriba y, debajo, una galería con cada
 * versión grande sobre su fondo, para qué sirve y sus formatos a la vista.
 * Va arriba en Logo: es la tarea más común.
 */
export function PanelDescargas({ versiones, archivo, marca, version, leeme, fondos, porDefecto, manual, }) {
    // La versión por defecto ocupa su propia fila; el resto se reparte sin huérfanos.
    const destacada = versiones.some((v) => v.id === porDefecto);
    const n = versiones.length - (destacada ? 1 : 0);
    const estilo = { "--mk-cols": columnas(n, 3), "--mk-cols-md": columnas(n, 2) };
    return (_jsxs("div", { className: "mk-panel-descargas", children: [_jsxs("div", { className: "mk-panel-zip", children: [_jsxs("p", { className: "mk-panel-zip-texto", children: ["Todas las versiones en SVG y en PNG de 2400 px, con un LEEME.", manual ? ` El manual: ${manual.detalle}.` : null] }), _jsxs("div", { className: "mk-panel-botones", children: [_jsx(DescargaZip, { versiones: versiones, archivo: archivo, marca: marca, version: version, leeme: leeme }), manual ? (_jsx("a", { className: "mk-boton mk-boton-secundario", href: manual.href, download: true, "data-mk-manual": true, children: "Descargar el manual" })) : null] })] }), _jsx("div", { className: "mk-rejilla mk-galeria", style: estilo, "data-mk-rejilla": true, children: versiones.map((v) => (_jsxs("figure", { id: `version-${v.id}`, className: "mk-logo mk-galeria-item", "data-mk-destacada": v.id === porDefecto ? "" : undefined, children: [_jsx("div", { className: "mk-logo-lamina", ...fondos[v.id], children: _jsx("img", { src: v.svg, alt: `${marca}: ${v.nombre}` }) }), _jsxs("figcaption", { children: [_jsxs("strong", { children: [v.nombre, v.id === porDefecto ? _jsx("span", { className: "mk-etiqueta", children: "Por defecto" }) : null] }), _jsx("span", { children: v.uso }), _jsx(DescargasVersion, { version: v, archivo: archivo })] })] }, v.id))) })] }));
}
