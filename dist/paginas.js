import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Link from "next/link";
import { notFound } from "next/navigation";
import { hrefDe, seccionDe, } from "./config.js";
import { PanelDescargas } from "./descargas.js";
import { Icono } from "./iconos.js";
import { columnas } from "./rejilla.js";
import { slugDe } from "./rutas.js";
import { Escala, Especimen, Muestra, ParContraste, Rampa } from "./vivo.js";
/* ───────────── bloques ───────────── */
const ESTADOS = { vigente: "Vigente", borrador: "Borrador", "en-revision": "En revisión" };
/** "Vigente · Actualizado el 15 de noviembre de 2026", si la configuración lo trae. */
export function EstadoPortal({ config }) {
    const partes = [];
    if (config.estado)
        partes.push(ESTADOS[config.estado]);
    if (config.actualizado) {
        const [a, m, d] = config.actualizado.split("-").map(Number);
        const fecha = new Date(Date.UTC(a ?? 2000, (m ?? 1) - 1, d ?? 1)).toLocaleDateString("es", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
        partes.push(`Actualizado el ${fecha}`);
    }
    if (!partes.length)
        return null;
    return (_jsx("p", { className: "mk-estado", "data-estado": config.estado, children: partes.join(" · ") }));
}
function Rejilla({ n, max = 4, className, children }) {
    const estilo = { "--mk-cols": columnas(n, max), "--mk-cols-md": columnas(n, 2) };
    return (_jsx("div", { className: className ? `mk-rejilla ${className}` : "mk-rejilla", style: estilo, "data-mk-rejilla": true, children: children }));
}
export function Encabezado({ antetitulo, titulo, children, config, }) {
    return (_jsxs("header", { className: "mk-encabezado", children: [config ? _jsx(EstadoPortal, { config: config }) : null, _jsx("p", { className: "mk-antetitulo", children: antetitulo }), _jsx("h1", { className: "mk-titulo", children: titulo }), children ? _jsx("div", { className: "mk-bajada", children: children }) : null] }));
}
export function Bloque({ id, titulo, antetitulo, bajada, children, }) {
    return (_jsxs("section", { id: id, className: "mk-bloque", "aria-labelledby": `${id}-titulo`, "data-toc": titulo, children: [antetitulo ? _jsx("p", { className: "mk-antetitulo", children: antetitulo }) : null, _jsx("h2", { id: `${id}-titulo`, className: "mk-bloque-titulo", children: titulo }), bajada ? _jsx("p", { className: "mk-bloque-bajada", children: bajada }) : null, children] }));
}
function Tarjeta({ href, titulo, children, pendiente = false, icono, atajo = false, }) {
    return (_jsxs(Link, { href: href, className: "mk-tarjeta", "data-mk-atajo": atajo ? "" : undefined, children: [icono ? (_jsx("span", { className: "mk-tarjeta-icono", children: _jsx(Icono, { nombre: icono }) })) : null, _jsxs("span", { className: "mk-tarjeta-titulo", children: [titulo, pendiente ? _jsx("span", { className: "mk-etiqueta", children: "Pr\u00F3ximamente" }) : null] }), _jsx("span", { className: "mk-tarjeta-texto", children: children })] }));
}
/* ───────────── páginas ───────────── */
function PaginaInicio({ config }) {
    const lista = (slug) => {
        const s = seccionDe(config, slug);
        return s && s.estado !== "pendiente" ? s : undefined;
    };
    const candidatos = [
        lista("logo") && { href: `${hrefDe(config, "logo")}#descargas`, titulo: "Descargar el logo", texto: "SVG, PNG y un ZIP con todas las versiones.", icono: "descargar" },
        lista("color") && {
            href: `${hrefDe(config, "color")}#oficiales`,
            titulo: "Copiar un color",
            texto: config.color?.oficiales.some((o) => o.cmyk) ? "Valores en HEX, RGB y CMYK, listos para pegar." : "Valores en HEX y RGB, listos para pegar.",
            icono: "copiar",
        },
        lista("tipografia") && { href: hrefDe(config, "tipografia"), titulo: "Ver la tipografía", texto: "Familias, pesos y jerarquía.", icono: "tipografia" },
        lista("sistema") && { href: hrefDe(config, "sistema"), titulo: "Usar el sistema", texto: "Tokens y componentes como los pinta el sitio.", icono: "sistema" },
    ];
    const generados = candidatos.filter((t) => Boolean(t));
    const tareas = config.inicio?.atajos === false ? [] : (config.inicio?.atajos ?? generados);
    const enc = config.inicio?.encabezado;
    const bajadaInicio = enc?.bajada ?? `Todo lo necesario para aplicar la marca ${config.marca}: lineamientos, archivos y el sistema de diseño en uso.`;
    const bAtajos = config.inicio?.bloques?.atajos;
    const bSecciones = config.inicio?.bloques?.secciones;
    return (_jsxs(_Fragment, { children: [config.portada ? (_jsxs("header", { className: "mk-portada", style: { background: `var(${config.portada.fondo})` }, children: [_jsxs("div", { className: "mk-portada-texto", children: [_jsx(EstadoPortal, { config: config }), _jsx("p", { className: "mk-antetitulo", children: enc?.antetitulo ?? `Versión ${config.version}` }), _jsx("h1", { className: "mk-titulo", children: enc?.titulo ?? config.nombre }), _jsx("p", { className: "mk-portada-bajada", children: bajadaInicio })] }), _jsx("img", { className: "mk-portada-logo", src: config.portada.logo, alt: config.portada.alt ?? config.marca })] })) : (_jsx(Encabezado, { antetitulo: enc?.antetitulo ?? `Versión ${config.version}`, titulo: enc?.titulo ?? config.nombre, config: config, children: _jsx("p", { children: bajadaInicio }) })), tareas.length ? (_jsx(Bloque, { id: "tareas", titulo: bAtajos?.titulo ?? "Lo más usado", antetitulo: bAtajos?.antetitulo, bajada: bAtajos?.bajada, children: _jsx(Rejilla, { n: tareas.length, children: tareas.map((t) => (_jsx(Tarjeta, { href: t.href, titulo: t.titulo, icono: t.icono, atajo: true, children: t.texto }, t.href))) }) })) : null, _jsx(Bloque, { id: "secciones", titulo: bSecciones?.titulo ?? "Secciones", antetitulo: bSecciones?.antetitulo, bajada: bSecciones?.bajada, children: _jsx(Rejilla, { n: config.secciones.length, children: config.secciones.map((s) => (_jsx(Tarjeta, { href: hrefDe(config, s.slug), titulo: s.titulo, pendiente: s.estado === "pendiente", children: s.resumen }, s.slug))) }) })] }));
}
const INCORRECTOS = {
    estirar: { texto: "No lo estires ni lo deformes.", clase: "mk-mal-estirar" },
    rotar: { texto: "No lo rotes.", clase: "mk-mal-rotar" },
    recolorear: { texto: "No cambies sus colores.", clase: "mk-mal-recolorear" },
    sombra: { texto: "No le agregues sombras ni efectos.", clase: "mk-mal-sombra" },
    contorno: { texto: "No lo encierres en formas ni contornos.", clase: "mk-mal-contorno" },
    apretar: { texto: "No invadas su área de respeto.", clase: "mk-mal-apretar" },
};
/** Lámina del logo: fondo claro, oscuro o el color de marca que pide la versión. */
function lamina(fondo) {
    return fondo.startsWith("--")
        ? { "data-fondo": "marca", style: { background: `var(${fondo})` } }
        : { "data-fondo": fondo };
}
function PaginaLogo({ config, logo, seccion }) {
    const principal = logo.versiones[0];
    const incorrectos = logo.incorrectos ?? Object.keys(INCORRECTOS);
    const medida = (v, unidad) => {
        const limpio = v.replace(/\s/g, "").replace(",", ".");
        return new RegExp(`^\\d+(\\.\\d+)?${unidad}$`).test(limpio) ? limpio : undefined;
    };
    const anchoMinimo = medida(logo.minimo.digital, "px");
    const anchoImpreso = medida(logo.minimo.impreso, "cm");
    const fondos = Object.fromEntries(logo.versiones.map((v) => [v.id, lamina(v.fondo)]));
    return (_jsxs(_Fragment, { children: [_jsx(Encabezado, { antetitulo: seccion.grupo, titulo: seccion.titulo, config: config, children: _jsx("p", { children: seccion.resumen }) }), _jsx(Bloque, { id: "descargas", titulo: "Descargas", children: _jsx(PanelDescargas, { versiones: logo.versiones, archivo: config.archivo, marca: config.marca, version: config.version, fondos: fondos, leeme: `Usá el SVG siempre que se pueda. Respetá el área de respeto (${logo.respeto.medida}) y el tamaño mínimo (${logo.minimo.digital} en pantalla, ${logo.minimo.impreso} impreso).` }) }), _jsx(Bloque, { id: "versiones", titulo: "Versiones", children: _jsx(Rejilla, { n: logo.versiones.length, max: 3, children: logo.versiones.map((v) => (_jsxs("figure", { className: "mk-logo", children: [_jsx("div", { className: "mk-logo-lamina", ...lamina(v.fondo), children: _jsx("img", { src: v.svg, alt: `${config.marca}: ${v.nombre}` }) }), _jsxs("figcaption", { children: [_jsx("strong", { children: v.nombre }), _jsx("span", { children: v.uso })] })] }, v.id))) }) }), principal ? (_jsxs(_Fragment, { children: [_jsx(Bloque, { id: "respeto", titulo: "\u00C1rea de respeto", children: _jsxs("div", { className: "mk-columnas", children: [_jsx("div", { className: "mk-logo-lamina mk-respeto", ...lamina(principal.fondo), children: _jsx("img", { src: principal.svg, alt: `${config.marca} con su área de respeto marcada` }) }), _jsxs("div", { children: [_jsx("p", { className: "mk-dato", children: logo.respeto.medida }), _jsx("p", { children: logo.respeto.descripcion })] })] }) }), _jsx(Bloque, { id: "minimo", titulo: "Tama\u00F1o m\u00EDnimo", children: _jsxs(Rejilla, { n: 2, max: 2, children: [_jsxs("div", { className: "mk-tarjeta mk-tarjeta-fija", children: [_jsx("span", { className: "mk-dato", children: logo.minimo.digital }), _jsx("span", { children: "En pantalla, de ancho." }), anchoMinimo ? (_jsx("span", { className: "mk-minimo", ...lamina(principal.fondo), children: _jsx("img", { src: principal.svg, alt: `${config.marca} a ${logo.minimo.digital}`, style: { width: anchoMinimo } }) })) : null] }), _jsxs("div", { className: "mk-tarjeta mk-tarjeta-fija", children: [_jsx("span", { className: "mk-dato", children: logo.minimo.impreso }), _jsx("span", { children: "En impresi\u00F3n, de ancho. En pantalla, a escala aproximada." }), anchoImpreso ? (_jsx("span", { className: "mk-minimo", ...lamina(principal.fondo), children: _jsx("img", { src: principal.svg, alt: `${config.marca} a ${logo.minimo.impreso}, a escala aproximada`, style: { width: anchoImpreso } }) })) : null] })] }) }), _jsx(Bloque, { id: "incorrectos", titulo: "Usos incorrectos", children: _jsx(Rejilla, { n: incorrectos.length, max: 3, children: incorrectos.map((id) => (_jsxs("figure", { className: "mk-logo mk-incorrecto", children: [_jsx("div", { ...lamina(principal.fondo), className: `mk-logo-lamina${id === "recolorear" ? ` ${INCORRECTOS[id].clase}` : ""}`, children: _jsx("img", { className: id === "recolorear" ? undefined : INCORRECTOS[id].clase, src: principal.svg, alt: `Ejemplo incorrecto: ${INCORRECTOS[id].texto}` }) }), _jsxs("figcaption", { children: [_jsx("span", { className: "mk-no", "aria-hidden": "true", children: "\u2715" }), " ", INCORRECTOS[id].texto] })] }, id))) }) })] })) : null] }));
}
function PaginaColor({ config, seccion }) {
    const color = config.color;
    return (_jsxs(_Fragment, { children: [_jsx(Encabezado, { antetitulo: seccion.grupo, titulo: seccion.titulo, config: config, children: _jsxs("p", { children: [seccion.resumen, " Hac\u00E9 clic en una muestra para copiar su valor."] }) }), _jsx(Bloque, { id: "oficiales", titulo: "Colores oficiales", children: _jsx(Rejilla, { n: color.oficiales.length, max: 4, className: "mk-rejilla-muestras", children: color.oficiales.map((c) => (_jsx(Muestra, { ...c }, c.token))) }) }), color.pares?.length ? (_jsxs(Bloque, { id: "combinaciones", titulo: "Combinaciones con texto", children: [_jsx("p", { children: "Medidas sobre el CSS que carga este sitio. Texto: 4,5:1 como m\u00EDnimo; texto grande e indicadores: 3:1." }), _jsx(Rejilla, { n: color.pares.length, max: 4, children: color.pares.map((p) => (_jsx(ParContraste, { ...p }, `${p.texto}-${p.fondo}`))) })] })) : null, color.rampas?.length ? (_jsx(Bloque, { id: "rampas", titulo: "Rampas", children: color.rampas.map((r) => (_jsx(Rampa, { ...r }, r.prefijo))) })) : null] }));
}
function PaginaTipografia({ config, seccion }) {
    const tipo = config.tipografia;
    return (_jsxs(_Fragment, { children: [_jsx(Encabezado, { antetitulo: seccion.grupo, titulo: seccion.titulo, config: config, children: _jsx("p", { children: seccion.resumen }) }), _jsx(Bloque, { id: "familias", titulo: "Familias", children: _jsx(Rejilla, { n: tipo.familias.length, max: 3, children: tipo.familias.map((f) => (_jsxs("div", { className: "mk-tarjeta mk-tarjeta-fija", children: [_jsx("span", { className: "mk-familia", style: { fontFamily: `var(${f.token})` }, children: f.nombre }), _jsx("span", { children: f.rol }), _jsx("ul", { className: "mk-pesos", children: f.pesos.map((p) => (_jsxs("li", { style: { fontFamily: `var(${f.token})`, fontWeight: p }, children: [p, " \u00B7 Aa Bb Cc 123"] }, p))) }), _jsxs("span", { className: "mk-fuente", children: ["Licencia: ", f.licencia] }), _jsx("code", { children: f.token })] }, f.token))) }) }), tipo.estilos?.length ? (_jsx(Bloque, { id: "jerarquia", titulo: "Jerarqu\u00EDa", children: tipo.estilos.map((e) => (_jsx(Especimen, { ...e, children: tipo.muestra }, e.nombre))) })) : null] }));
}
function PaginaSistema({ config, seccion }) {
    const s = config.sistema;
    return (_jsxs(_Fragment, { children: [_jsx(Encabezado, { antetitulo: seccion.grupo, titulo: seccion.titulo, config: config, children: _jsxs("p", { children: [seccion.resumen, " Todo se lee del CSS que carga el sitio."] }) }), _jsx(Bloque, { id: "componentes", titulo: "Componentes y estados", children: _jsxs("div", { className: "mk-componentes", children: [_jsxs("div", { className: "mk-fila", children: [_jsx("button", { type: "button", className: "mk-boton", children: "Acci\u00F3n principal" }), _jsx("button", { type: "button", className: "mk-boton mk-boton-secundario", children: "Acci\u00F3n secundaria" }), _jsx("a", { className: "mk-enlace", href: "#componentes", children: "Enlace de texto" })] }), _jsxs("div", { className: "mk-campo", children: [_jsx("label", { htmlFor: "mk-campo-ejemplo", children: "Correo" }), _jsx("input", { id: "mk-campo-ejemplo", type: "email", defaultValue: "nombre@", "aria-invalid": "true", "aria-describedby": "mk-campo-error" }), _jsxs("p", { id: "mk-campo-error", className: "mk-campo-error", children: [_jsx("span", { "aria-hidden": "true", children: "!" }), " Falta el dominio del correo."] })] })] }) }), s.espaciado?.length ? (_jsx(Bloque, { id: "espaciado", titulo: "Espaciado", children: _jsx(Escala, { tipo: "espaciado", tokens: s.espaciado }) })) : null, s.radios?.length ? (_jsx(Bloque, { id: "radios", titulo: "Radios", children: _jsx(Escala, { tipo: "radio", tokens: s.radios }) })) : null, s.sombras?.length ? (_jsx(Bloque, { id: "sombras", titulo: "Sombras", children: _jsx(Escala, { tipo: "sombra", tokens: s.sombras }) })) : null] }));
}
function PaginaPendiente({ seccion }) {
    const p = seccion.pendiente;
    return (_jsxs(_Fragment, { children: [_jsx(Encabezado, { antetitulo: "Pr\u00F3ximamente", titulo: seccion.titulo, children: _jsx("p", { children: seccion.resumen }) }), _jsx(Bloque, { id: "estado", titulo: "Qu\u00E9 falta", children: _jsxs("dl", { className: "mk-pendiente", children: [_jsx("dt", { children: "Falta" }), _jsx("dd", { children: p.falta }), _jsx("dt", { children: "Responsable" }), _jsx("dd", { children: p.responsable }), _jsx("dt", { children: "Fecha comprometida" }), _jsx("dd", { children: p.fecha })] }) })] }));
}
/* ───────────── rutas ───────────── */
/**
 * Página del portal para una ruta comodín opcional (`app/marca/[[...slug]]`).
 * Pinta inicio, las secciones del paquete y las pendientes; cualquier otra
 * ruta da 404. Una sección propia del sitio va en una ruta explícita.
 */
export function MarcaPagina({ config, slug }) {
    const s = slugDe(slug);
    if (s === "")
        return _jsx(PaginaInicio, { config: config });
    const seccion = s ? seccionDe(config, s) : undefined;
    if (!seccion)
        notFound();
    if (seccion.estado === "pendiente")
        return _jsx(PaginaPendiente, { seccion: seccion });
    switch (seccion.slug) {
        case "logo":
            return _jsx(PaginaLogo, { config: config, logo: config.logo, seccion: seccion });
        case "color":
            return _jsx(PaginaColor, { config: config, seccion: seccion });
        case "tipografia":
            return _jsx(PaginaTipografia, { config: config, seccion: seccion });
        case "sistema":
            return _jsx(PaginaSistema, { config: config, seccion: seccion });
        default:
            notFound();
    }
}
export function MarcaNoEncontrada({ config }) {
    return (_jsxs(_Fragment, { children: [_jsx(Encabezado, { antetitulo: "Error 404", titulo: "Esta p\u00E1gina no existe", children: _jsx("p", { children: "Puede que la secci\u00F3n haya cambiado de nombre o todav\u00EDa no est\u00E9 publicada." }) }), _jsx("p", { children: _jsxs(Link, { className: "mk-boton", href: hrefDe(config), children: ["Volver al inicio de ", config.nombre] }) })] }));
}
