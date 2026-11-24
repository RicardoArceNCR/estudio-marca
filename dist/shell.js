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
    return (_jsxs("div", { className: "mk-portal", children: [_jsx("a", { className: "mk-saltar", href: "#contenido", children: "Saltar al contenido" }), _jsxs("header", { className: "mk-cabecera", children: [_jsxs(Link, { href: baseDe(config), className: "mk-marca", "aria-label": config.cabecera?.texto ? config.nombre : undefined, children: [config.cabecera ? (_jsx("span", { className: "mk-marca-insignia", style: { background: `var(${config.cabecera.fondo})` }, "aria-hidden": "true", children: _jsx("img", { src: config.cabecera.logo, alt: "" }) })) : null, _jsx("span", { className: "mk-marca-nombre", children: config.cabecera?.texto ?? config.nombre })] }), _jsx("button", { ref: botonMenu, type: "button", className: "mk-menu-boton", "aria-haspopup": "dialog", "aria-expanded": abierto, "aria-controls": "mk-menu", "data-mk-menu": true, onClick: () => {
                            dialogo.current?.showModal();
                            setAbierto(true);
                        }, children: "Men\u00FA" })] }), _jsxs("div", { className: "mk-cuerpo", children: [_jsxs("aside", { className: "mk-lateral", "aria-label": config.nombre, children: [_jsx("nav", { "aria-label": "Secciones del portal", "data-mk-nav": true, children: _jsx(Navegacion, { config: config, pathname: pathname }) }), _jsx(IndicePagina, { indice: indice, actual: actual }), config.ayuda ? _jsx(AyudaLateral, { ayuda: config.ayuda }) : null, salir ? (_jsx("button", { type: "button", className: "mk-boton mk-boton-secundario mk-salir", onClick: () => void salir(), children: "Salir" })) : null] }), _jsxs("main", { id: "contenido", tabIndex: -1, className: "mk-principal", children: [pathname !== baseDe(config) ? _jsx(IndiceMovil, { indice: indice, actual: actual }) : null, children, _jsxs("footer", { className: "mk-pie", children: [_jsxs("span", { children: [config.nombre, " \u00B7 versi\u00F3n ", config.version] }), config.ayuda ? (_jsxs("span", { "data-mk-ayuda": true, children: [config.ayuda.texto ?? "¿Algo falta o está mal?", " Escribile a", " ", config.ayuda.correo ? (_jsx("a", { href: `mailto:${config.ayuda.correo}`, children: config.ayuda.nombre })) : (config.ayuda.nombre), "."] })) : config.contacto ? (_jsxs("span", { children: ["Consultas:", " ", config.contacto.correo ? (_jsx("a", { href: `mailto:${config.contacto.correo}`, children: config.contacto.nombre })) : (config.contacto.nombre)] })) : null, config.creditos ? (_jsx("a", { className: "mk-creditos", href: config.creditos.href, "aria-label": config.creditos.logo ? config.creditos.nombre : undefined, children: config.creditos.logo ? (_jsx("span", { className: "mk-creditos-logo", "aria-hidden": "true", style: { "--mk-creditos-logo": `url("${config.creditos.logo}")` } })) : (config.creditos.nombre) })) : null] })] })] }), _jsx("dialog", { id: "mk-menu", ref: dialogo, className: "mk-dialogo", "aria-label": `Menú de ${config.nombre}`, onClose: () => {
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
                            } })] }) }), config.volverArriba ? _jsx(VolverArriba, { pathname: pathname }) : null, _jsx(Aviso, {})] }));
}
/**
 * Aparece después de dos pantallas de scroll. Es un enlace a #contenido: sube
 * (suave solo sin movimiento reducido) y deja el foco en el título de la
 * página, así el lector de pantalla lo anuncia y el próximo Tab sigue desde ahí.
 */
function VolverArriba({ pathname }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const medir = () => setVisible(window.scrollY > window.innerHeight * 2);
        medir();
        window.addEventListener("scroll", medir, { passive: true });
        window.addEventListener("resize", medir);
        return () => {
            window.removeEventListener("scroll", medir);
            window.removeEventListener("resize", medir);
        };
    }, [pathname]);
    return (_jsx("a", { className: "mk-arriba", href: "#contenido", hidden: !visible, "aria-label": "Volver arriba", title: "Volver arriba", onClick: (e) => {
            e.preventDefault();
            const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
            const destino = document.querySelector("#contenido h1") ?? document.getElementById("contenido");
            if (destino) {
                if (!destino.hasAttribute("tabindex"))
                    destino.setAttribute("tabindex", "-1");
                destino.focus({ preventScroll: true });
            }
        }, children: _jsx("svg", { viewBox: "0 0 24 24", width: "20", height: "20", "aria-hidden": "true", focusable: "false", children: _jsx("path", { d: "M12 19V5M5 12l7-7 7 7", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }) }));
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
function AyudaLateral({ ayuda }) {
    return (_jsxs("div", { className: "mk-ayuda-lateral", children: [_jsx("h2", { className: "mk-nav-titulo", children: "\u00BFAlgo falta?" }), _jsx("p", { children: ayuda.correo ? _jsx("a", { href: `mailto:${ayuda.correo}`, children: ayuda.nombre }) : ayuda.nombre })] }));
}
/**
 * "En esta página" en pantallas chicas: una franja que se desliza de lado,
 * pegada a la cabecera. En escritorio vive en el lateral.
 */
function IndiceMovil({ indice, actual }) {
    const lista = useRef(null);
    useEffect(() => {
        // Lleva a la vista la sección que se está leyendo, sin mover la página.
        const ul = lista.current;
        const a = ul?.querySelector("[aria-current]");
        if (!ul || !a)
            return;
        const izq = a.offsetLeft - ul.offsetLeft;
        if (izq < ul.scrollLeft || izq + a.offsetWidth > ul.scrollLeft + ul.clientWidth)
            ul.scrollLeft = izq - 16;
    }, [actual]);
    if (indice.length < 2)
        return null;
    return (_jsx("nav", { className: "mk-indice-movil", "aria-label": "En esta p\u00E1gina", "data-mk-indice-movil": true, children: _jsx("ul", { ref: lista, children: indice.map((t) => (_jsx("li", { children: _jsx("a", { href: `#${t.id}`, "aria-current": actual === t.id ? "location" : undefined, onClick: (e) => {
                        e.preventDefault();
                        enfocarSeccion(t.id, true);
                    }, children: t.titulo }) }, t.id))) }) }));
}
