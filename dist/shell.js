"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { baseDe, gruposDe, hrefDe } from "./config.js";
import { enfocarSeccion, useIndice } from "./toc.js";
import { Aviso } from "./vivo.js";
/**
 * Marco del portal: salto al contenido, navegación lateral en escritorio,
 * menú modal en móvil, índice de la página y región de avisos. La navegación
 * sale de `config.secciones`: una sección nueva aparece sola en los dos
 * lugares.
 */
export function MarcaShell({ config, children, salir, }) {
    const pathname = usePathname() ?? "";
    const { indice, actual } = useIndice(pathname);
    const dialogo = useRef(null);
    const botonMenu = useRef(null);
    const [abierto, setAbierto] = useState(false);
    const cerrar = () => dialogo.current?.close();
    useEffect(cerrar, [pathname]);
    return (_jsxs("div", { className: "mk-portal", children: [_jsx("a", { className: "mk-saltar", href: "#contenido", children: "Saltar al contenido" }), _jsxs("header", { className: "mk-cabecera", children: [_jsxs(Link, { href: baseDe(config), className: "mk-marca", children: [config.cabecera ? (_jsx("span", { className: "mk-marca-insignia", style: { background: `var(${config.cabecera.fondo})` }, "aria-hidden": "true", children: _jsx("img", { src: config.cabecera.logo, alt: "" }) })) : null, config.nombre] }), _jsx("button", { ref: botonMenu, type: "button", className: "mk-menu-boton", "aria-haspopup": "dialog", "aria-expanded": abierto, "aria-controls": "mk-menu", "data-mk-menu": true, onClick: () => {
                            dialogo.current?.showModal();
                            setAbierto(true);
                        }, children: "Men\u00FA" })] }), _jsxs("div", { className: "mk-cuerpo", children: [_jsxs("aside", { className: "mk-lateral", "aria-label": config.nombre, children: [_jsx("nav", { "aria-label": "Secciones del portal", "data-mk-nav": true, children: _jsx(Navegacion, { config: config, pathname: pathname }) }), _jsx(IndicePagina, { indice: indice, actual: actual }), salir ? (_jsx("button", { type: "button", className: "mk-boton mk-boton-secundario mk-salir", onClick: () => void salir(), children: "Salir" })) : null] }), _jsxs("main", { id: "contenido", tabIndex: -1, className: "mk-principal", children: [children, _jsxs("footer", { className: "mk-pie", children: [_jsxs("span", { children: [config.nombre, " \u00B7 versi\u00F3n ", config.version] }), config.ayuda ? (_jsxs("span", { "data-mk-ayuda": true, children: [config.ayuda.texto ?? "¿Algo falta o está mal?", " Escribile a", " ", config.ayuda.correo ? (_jsx("a", { href: `mailto:${config.ayuda.correo}`, children: config.ayuda.nombre })) : (config.ayuda.nombre), "."] })) : config.contacto ? (_jsxs("span", { children: ["Consultas:", " ", config.contacto.correo ? (_jsx("a", { href: `mailto:${config.contacto.correo}`, children: config.contacto.nombre })) : (config.contacto.nombre)] })) : null] })] })] }), _jsx("dialog", { id: "mk-menu", ref: dialogo, className: "mk-dialogo", "aria-label": `Menú de ${config.nombre}`, onClose: () => {
                    setAbierto(false);
                    botonMenu.current?.focus();
                }, onClick: (e) => {
                    // Clic en el fondo (fuera de la caja): cierra y devuelve el foco.
                    if (e.target === e.currentTarget)
                        cerrar();
                }, onKeyDown: (e) => {
                    // El <dialog> modal deja salir el foco hacia el navegador después
                    // del último control: lo devolvemos al primero (y al revés).
                    if (e.key !== "Tab")
                        return;
                    const focos = Array.from(e.currentTarget.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"));
                    const primero = focos[0];
                    const ultimo = focos.at(-1);
                    if (!primero || !ultimo)
                        return;
                    if (!e.shiftKey && document.activeElement === ultimo) {
                        e.preventDefault();
                        primero.focus();
                    }
                    else if (e.shiftKey && document.activeElement === primero) {
                        e.preventDefault();
                        ultimo.focus();
                    }
                }, children: _jsxs("div", { className: "mk-dialogo-caja", children: [_jsxs("div", { className: "mk-dialogo-cabecera", children: [_jsx("span", { className: "mk-marca", children: config.nombre }), _jsx("button", { type: "button", className: "mk-boton mk-boton-secundario", onClick: cerrar, children: "Cerrar" })] }), _jsx("nav", { "aria-label": "Secciones del portal", children: _jsx(Navegacion, { config: config, pathname: pathname, alNavegar: cerrar }) }), _jsx(IndicePagina, { indice: indice, actual: actual, alElegir: (id) => {
                                cerrar();
                                requestAnimationFrame(() => enfocarSeccion(id, true));
                            } })] }) }), _jsx(Aviso, {})] }));
}
function Navegacion({ config, pathname, alNavegar, }) {
    const inicio = hrefDe(config);
    return (_jsxs(_Fragment, { children: [_jsx("ul", { className: "mk-nav-lista", children: _jsx("li", { children: _jsx(Link, { href: inicio, className: "mk-nav-enlace", "aria-current": pathname === inicio ? "page" : undefined, onClick: alNavegar, children: "Inicio" }) }) }), gruposDe(config).map(({ grupo, secciones }) => (_jsxs("div", { className: "mk-nav-grupo", children: [_jsx("h2", { className: "mk-nav-titulo", id: `mk-grupo-${grupo}`, children: grupo }), _jsx("ul", { className: "mk-nav-lista", "aria-labelledby": `mk-grupo-${grupo}`, children: secciones.map((s) => {
                            const href = hrefDe(config, s.slug);
                            return (_jsx("li", { children: _jsxs(Link, { href: href, className: "mk-nav-enlace", "aria-current": pathname === href ? "page" : undefined, onClick: alNavegar, children: [s.titulo, s.estado === "pendiente" ? _jsx("span", { className: "mk-etiqueta", children: "Pr\u00F3ximamente" }) : null] }) }, s.slug));
                        }) })] }, grupo)))] }));
}
function IndicePagina({ indice, actual, alElegir = (id) => enfocarSeccion(id, true), }) {
    if (indice.length < 2)
        return null;
    return (_jsxs("nav", { className: "mk-indice", "aria-label": "En esta p\u00E1gina", children: [_jsx("h2", { className: "mk-nav-titulo", children: "En esta p\u00E1gina" }), _jsx("ul", { className: "mk-nav-lista", children: indice.map((t) => (_jsx("li", { children: _jsx("a", { href: `#${t.id}`, className: "mk-indice-enlace", "aria-current": actual === t.id ? "location" : undefined, onClick: (e) => {
                            e.preventDefault();
                            alElegir(t.id);
                        }, children: t.titulo }) }, t.id))) })] }));
}
