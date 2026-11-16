"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { fetchText, medidasSvg, rasterize } from "./raster.js";
import { saveBlob } from "./save.js";
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
function BotonDescarga({ id, tipo, nombre, ocupado, onClick, children, principal = false, }) {
    const este = ocupado === id;
    return (_jsx("button", { type: "button", className: principal ? "mk-boton" : "mk-boton mk-boton-secundario", "aria-disabled": ocupado ? true : undefined, onClick: onClick, "data-mk-descarga": true, "data-mk-tipo": tipo, "data-mk-archivo": nombre, children: este ? `Preparando ${children}…` : children }));
}
const png = async (svg, ancho) => rasterize(svg, medidasSvg(svg), ancho);
export function DescargasVersion({ version, archivo }) {
    const { ocupado, correr } = useTarea();
    const base = `${archivo}-logo-${version.id}`;
    return (_jsxs("div", { className: "mk-descargas", role: "group", "aria-label": `Descargas: ${version.nombre}`, children: [_jsx(BotonDescarga, { id: "svg", tipo: "svg", nombre: `${base}.svg`, ocupado: ocupado, onClick: () => correr("svg", `${base}.svg`, async () => {
                    const svg = await fetchText(version.svg);
                    saveBlob(new Blob([svg], { type: "image/svg+xml" }), `${base}.svg`);
                }), children: "SVG" }), ANCHOS_PNG.map((ancho) => (_jsx(BotonDescarga, { id: `png-${ancho}`, tipo: "png", nombre: `${base}-${ancho}.png`, ocupado: ocupado, onClick: () => correr(`png-${ancho}`, `${base}-${ancho}.png`, async () => {
                    saveBlob(await png(await fetchText(version.svg), ancho), `${base}-${ancho}.png`);
                }), children: `PNG ${ancho} px` }, ancho)))] }));
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
 * Panel de descargas: el ZIP primero y, por versión, una vista previa con sus
 * formatos agrupados en un menú. Va arriba en Logo: es la tarea más común.
 */
export function PanelDescargas({ versiones, archivo, marca, version, leeme, fondos, }) {
    return (_jsxs("div", { className: "mk-panel-descargas", children: [_jsxs("div", { className: "mk-panel-zip", children: [_jsx("p", { className: "mk-panel-zip-texto", children: "Todas las versiones en SVG y en PNG de 2400 px, con un LEEME. Los PNG se generan desde los SVG originales." }), _jsx(DescargaZip, { versiones: versiones, archivo: archivo, marca: marca, version: version, leeme: leeme })] }), _jsx("ul", { className: "mk-panel-lista", children: versiones.map((v) => (_jsxs("li", { className: "mk-panel-item", children: [_jsx("span", { className: "mk-panel-vista mk-logo-lamina", ...fondos[v.id], children: _jsx("img", { src: v.svg, alt: "" }) }), _jsx("span", { className: "mk-panel-nombre", children: v.nombre }), _jsx(Formatos, { version: v, archivo: archivo })] }, v.id))) })] }));
}
function Formatos({ version, archivo }) {
    const [abierto, setAbierto] = useState(false);
    const id = `mk-formatos-${version.id}`;
    return (_jsxs("div", { className: "mk-formatos", onKeyDown: (e) => {
            if (e.key === "Escape" && abierto) {
                setAbierto(false);
                e.currentTarget.querySelector("[data-mk-formatos]")?.focus();
            }
        }, children: [_jsxs("button", { type: "button", className: "mk-boton mk-boton-secundario", "aria-expanded": abierto, "aria-controls": id, "data-mk-formatos": true, onClick: () => setAbierto((a) => !a), children: ["Formatos", _jsxs("span", { className: "mk-oculto", children: [" de ", version.nombre] }), _jsx("span", { "aria-hidden": "true", children: abierto ? " ▴" : " ▾" })] }), _jsx("div", { id: id, hidden: !abierto, className: "mk-formatos-lista", children: _jsx(DescargasVersion, { version: version, archivo: archivo }) })] }));
}
