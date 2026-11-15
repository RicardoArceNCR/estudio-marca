"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { contrast, formatRatio, parseColor, toHex, toRgb } from "./color.js";
/**
 * Muestras en vivo: pintan con `var(--token)` y después leen lo que resolvió
 * el navegador. Nunca escriben un valor a mano, así que muestran lo que de
 * verdad carga el sitio, en el tema activo.
 */
/** Sube un contador cuando cambia el tema (`class` o `data-theme` de <html>). */
export function useVersionTema() {
    const [v, setV] = useState(0);
    useEffect(() => {
        const obs = new MutationObserver(() => setV((n) => n + 1));
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
        return () => obs.disconnect();
    }, []);
    return v;
}
function medir(el, prop) {
    return el ? parseColor(getComputedStyle(el)[prop]) : null;
}
/** Fondo opaco más cercano: contra eso se mide un texto. */
function fondoEfectivo(el) {
    let n = el;
    while (n) {
        const c = medir(n, "backgroundColor");
        if (c && c[3] > 0.99)
            return c;
        n = n.parentElement;
    }
    return null;
}
/* ───────────── copiar y avisar ───────────── */
const EVENTO = "marca:aviso";
export function avisar(texto) {
    window.dispatchEvent(new CustomEvent(EVENTO, { detail: texto }));
}
export async function copiar(valor) {
    let ok = false;
    try {
        await navigator.clipboard.writeText(valor);
        ok = true;
    }
    catch {
        const ta = document.createElement("textarea");
        ta.value = valor;
        ta.setAttribute("readonly", "");
        Object.assign(ta.style, { position: "fixed", left: "-9999px" });
        document.body.appendChild(ta);
        ta.select();
        try {
            ok = document.execCommand("copy");
        }
        catch {
            ok = false;
        }
        ta.remove();
    }
    avisar(ok ? `Copiado: ${valor}` : `No se pudo copiar. Seleccioná ${valor} y copialo a mano.`);
}
/**
 * Región de estado única del portal. Vacía el texto antes de escribir el nuevo
 * para que el lector de pantalla anuncie también un mensaje repetido.
 */
export function Aviso() {
    const [texto, setTexto] = useState("");
    useEffect(() => {
        let t1 = 0;
        let t2 = 0;
        const on = (e) => {
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            setTexto("");
            t1 = window.setTimeout(() => setTexto(e.detail), 60);
            t2 = window.setTimeout(() => setTexto(""), 4000);
        };
        window.addEventListener(EVENTO, on);
        return () => {
            window.removeEventListener(EVENTO, on);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
        };
    }, []);
    return (_jsx("div", { className: "mk-aviso", role: "status", "aria-live": "polite", "data-mk-aviso": true, children: texto ? _jsx("span", { className: "mk-aviso-texto", children: texto }) : null }));
}
/* ───────────── piezas ───────────── */
export function Muestra({ nombre, token, uso, fuente, cmyk, pantone, }) {
    const ref = useRef(null);
    const v = useVersionTema();
    const [c, setC] = useState(null);
    useEffect(() => setC(medir(ref.current, "backgroundColor")), [v]);
    const hex = c ? toHex(c) : "";
    return (_jsxs("figure", { className: "mk-muestra", children: [_jsxs("button", { type: "button", className: "mk-muestra-boton", onClick: () => hex && copiar(hex), "data-mk-copiar": true, "data-mk-valor": hex, children: [_jsx("span", { ref: ref, className: "mk-muestra-color", style: { background: `var(${token})` } }), _jsx("span", { className: "mk-muestra-nombre", children: nombre }), _jsx("span", { className: "mk-muestra-hex", children: hex || "…" }), _jsx("span", { className: "mk-oculto", children: "Copiar el valor hexadecimal" })] }), _jsxs("figcaption", { className: "mk-muestra-datos", children: [c ? _jsxs("span", { children: ["RGB ", toRgb(c)] }) : null, cmyk ? _jsxs("span", { children: ["CMYK ", cmyk] }) : null, pantone ? _jsxs("span", { children: ["Pantone ", pantone] }) : null, _jsx("code", { children: token }), uso ? _jsx("span", { className: "mk-muestra-uso", children: uso }) : null, fuente ? _jsxs("span", { className: "mk-fuente", children: ["Fuente: ", fuente] }) : null] })] }));
}
export function Rampa({ familia, prefijo, pasos, ancla, }) {
    const refs = useRef([]);
    const v = useVersionTema();
    const [hex, setHex] = useState([]);
    useEffect(() => {
        setHex(refs.current.map((el) => {
            const c = medir(el, "backgroundColor");
            return c ? toHex(c) : "";
        }));
    }, [v, pasos.length]);
    return (_jsxs("div", { className: "mk-rampa", children: [_jsx("h3", { className: "mk-rampa-titulo", children: familia }), _jsx("ul", { className: "mk-rampa-pasos", children: pasos.map((paso, i) => (_jsx("li", { children: _jsxs("button", { type: "button", className: "mk-rampa-paso", "data-ancla": paso === ancla ? "" : undefined, onClick: () => hex[i] && copiar(hex[i]), "data-mk-copiar": true, "data-mk-valor": hex[i] ?? "", children: [_jsx("span", { ref: (el) => {
                                    refs.current[i] = el;
                                }, className: "mk-rampa-color", style: { background: `var(${prefijo}${paso})` } }), _jsxs("span", { className: "mk-rampa-numero", children: [_jsxs("span", { className: "mk-oculto", children: [familia, " "] }), paso, paso === ancla ? _jsx("span", { className: "mk-oculto", children: " (color de marca)" }) : null] }), _jsx("span", { className: "mk-rampa-hex", children: hex[i] ?? "" }), _jsx("span", { className: "mk-oculto", children: ", copiar" })] }) }, paso))) })] }));
}
/** Par de contraste medido sobre el CSS real, con el resultado en texto. */
export function ParContraste({ etiqueta, texto, fondo, minimo = 4.5, }) {
    const ref = useRef(null);
    const v = useVersionTema();
    const [ratio, setRatio] = useState(null);
    useEffect(() => {
        const fg = medir(ref.current, "color");
        const bg = fondoEfectivo(ref.current);
        setRatio(fg && bg ? contrast(fg, bg) : null);
    }, [v]);
    const cumple = ratio !== null && ratio >= minimo;
    return (_jsxs("figure", { className: "mk-par", children: [_jsxs("div", { ref: ref, className: "mk-par-muestra", style: { color: `var(${texto})`, background: `var(${fondo})` }, children: ["Aa ", etiqueta] }), _jsxs("figcaption", { className: "mk-par-datos", children: [_jsxs("code", { children: [texto, " sobre ", fondo] }), _jsx("span", { className: "mk-par-resultado", "data-cumple": ratio === null ? undefined : String(cumple), "data-mk-ratio": ratio ?? "", children: ratio === null ? "Midiendo…" : `${formatRatio(ratio)} · ${cumple ? "cumple" : "no cumple"} ${formatRatio(minimo)}` })] })] }));
}
export function Especimen({ nombre, size, lineHeight, family, weight, tracking, children, }) {
    const ref = useRef(null);
    const v = useVersionTema();
    const [medida, setMedida] = useState("");
    useEffect(() => {
        if (!ref.current)
            return;
        const cs = getComputedStyle(ref.current);
        setMedida(`${Math.round(parseFloat(cs.fontSize))} px / ${cs.lineHeight === "normal" ? "normal" : `${Math.round(parseFloat(cs.lineHeight))} px`}`);
    }, [v]);
    const estilo = { fontSize: `var(${size})` };
    if (lineHeight)
        estilo.lineHeight = `var(${lineHeight})`;
    if (family)
        estilo.fontFamily = `var(${family})`;
    if (weight)
        estilo.fontWeight = `var(${weight})`;
    if (tracking)
        estilo.letterSpacing = `var(${tracking})`;
    return (_jsxs("div", { className: "mk-especimen", children: [_jsxs("div", { className: "mk-especimen-datos", children: [_jsx("strong", { children: nombre }), _jsx("span", { children: medida }), _jsx("code", { children: size })] }), _jsx("p", { ref: ref, className: "mk-especimen-texto", style: estilo, children: children })] }));
}
/** Espaciado, radios o sombras: dibuja el token y escribe su valor resuelto. */
export function Escala({ tipo, tokens }) {
    const refs = useRef([]);
    const v = useVersionTema();
    const [valores, setValores] = useState([]);
    useEffect(() => {
        setValores(refs.current.map((el) => {
            if (!el)
                return "";
            const cs = getComputedStyle(el);
            if (tipo === "espaciado")
                return `${Math.round(parseFloat(cs.width))} px`;
            if (tipo === "radio")
                return `${Math.round(parseFloat(cs.borderTopLeftRadius))} px`;
            return cs.boxShadow === "none" ? "sin sombra" : "sombra";
        }));
    }, [v, tipo, tokens.length]);
    const estilo = (t) => tipo === "espaciado" ? { width: `var(${t})` } : tipo === "radio" ? { borderRadius: `var(${t})` } : { boxShadow: `var(${t})` };
    return (_jsx("ul", { className: "mk-escala", "data-tipo": tipo, children: tokens.map((t, i) => (_jsxs("li", { className: "mk-escala-fila", children: [_jsx("span", { ref: (el) => {
                        refs.current[i] = el;
                    }, className: "mk-escala-muestra", style: estilo(t) }), _jsx("code", { children: t }), _jsx("span", { className: "mk-escala-valor", children: valores[i] ?? "" })] }, t))) }));
}
