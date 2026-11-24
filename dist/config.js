/**
 * Configuración del portal. Todo lo visible del portal sale de acá: el paquete
 * no trae nombres, textos, colores ni imágenes de ningún cliente. Cada valor
 * de marca se escribe como token (`--brand-main`), nunca como hex: el
 * navegador lo resuelve contra el CSS del paquete de tokens del sitio.
 */
import { esIcono } from "./iconos.js";
/**
 * Secciones que el paquete sabe pintar a partir de la configuración. Otra
 * sección (por ejemplo, productos) la arma el sitio en una ruta explícita, que
 * le gana a la ruta comodín del portal.
 */
export const SECCIONES_DEL_PAQUETE = ["logo", "color", "tipografia", "sistema"];
export const USOS_INCORRECTOS = ["estirar", "rotar", "recolorear", "sombra", "contorno", "apretar"];
/** El nombre del token de una entrada del sistema. */
export function tokenDe(t) {
    return typeof t === "string" ? t : t.token;
}
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TOKEN = /^--[a-z0-9-]+$/;
/** Errores de forma de la configuración. Vacío = válida. */
const VIEWBOX = /^\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+[\d.]*[1-9][\d.]*[\s,]+[\d.]*[1-9][\d.]*\s*$/;
/** Errores de forma de unas siluetas. Vacío = válidas. */
export function validarSiluetas(donde, s) {
    const e = [];
    if (!/^\s*[Mm]/.test(s.forma.d))
        e.push(`${donde}: el trazo de las siluetas tiene que empezar con M`);
    if (!VIEWBOX.test(s.forma.viewBox))
        e.push(`${donde}: viewBox inválido ("x y ancho alto")`);
    if (s.lado !== "inicio" && s.lado !== "fin")
        e.push(`${donde}: lado tiene que ser "inicio" o "fin"`);
    if (s.copias !== undefined && (s.copias < 1 || s.copias > 3))
        e.push(`${donde}: copias va de 1 a 3`);
    return e;
}
export function validarMarca(c) {
    const errores = [];
    const vistos = new Set();
    if (c.portada?.siluetas)
        errores.push(...validarSiluetas("portada", c.portada.siluetas));
    for (const s of c.secciones) {
        if (s.capitulo?.siluetas)
            errores.push(...validarSiluetas(`sección "${s.slug}"`, s.capitulo.siluetas));
        if (!SLUG.test(s.slug))
            errores.push(`sección "${s.slug}": slug inválido`);
        if (vistos.has(s.slug))
            errores.push(`sección "${s.slug}": repetida`);
        vistos.add(s.slug);
        if (s.estado === "pendiente" && !s.pendiente) {
            errores.push(`sección "${s.slug}": pendiente sin falta, responsable y fecha`);
        }
        const propia = SECCIONES_DEL_PAQUETE.includes(s.slug);
        if (propia && s.estado !== "pendiente" && !c[s.slug]) {
            errores.push(`sección "${s.slug}": está lista pero falta su configuración`);
        }
    }
    const tokens = [
        ...(c.color?.oficiales.map((o) => o.token) ?? []),
        ...(c.color?.pares?.flatMap((p) => [p.texto, p.fondo]) ?? []),
        ...(c.tipografia?.familias.map((f) => f.token) ?? []),
        ...(c.logo?.versiones.map((v) => v.fondo).filter((f) => f.startsWith("--")) ?? []),
        ...(c.portada ? [c.portada.fondo] : []),
        ...c.secciones.flatMap((s) => (s.capitulo ? [s.capitulo.fondo] : [])),
        ...(c.cabecera ? [c.cabecera.fondo] : []),
        ...(c.sistema?.espaciado ?? []).map(tokenDe),
        ...(c.sistema?.radios ?? []).map(tokenDe),
        ...(c.sistema?.sombras ?? []).map(tokenDe),
    ];
    for (const t of tokens)
        if (!TOKEN.test(t))
            errores.push(`"${t}" no es un token (--nombre)`);
    for (const r of c.color?.rampas ?? []) {
        if (!TOKEN.test(`${r.prefijo}0`))
            errores.push(`rampa ${r.familia}: prefijo "${r.prefijo}" inválido`);
    }
    if (c.manual && !/^\/.+\.pdf$/i.test(c.manual.href))
        errores.push(`manual "${c.manual.href}": ruta del sitio a un .pdf`);
    if (!/^[a-z0-9-]+$/.test(c.archivo))
        errores.push(`archivo "${c.archivo}": solo minúsculas, números y guiones`);
    if (c.actualizado && !/^\d{4}-\d{2}-\d{2}$/.test(c.actualizado))
        errores.push(`actualizado "${c.actualizado}": fecha ISO (AAAA-MM-DD)`);
    const base = baseDe(c);
    const destino = (que, href) => {
        const ruta = href.split("#")[0] ?? "";
        if (!ruta.startsWith(`${base}/`))
            return;
        const s = seccionDe(c, ruta.slice(base.length + 1));
        if (!s)
            errores.push(`${que}: ${ruta} no es una sección del portal`);
        else if (s.estado === "pendiente")
            errores.push(`${que}: ${ruta} está pendiente`);
    };
    for (const a of c.inicio?.atajos || []) {
        if (a.icono && !esIcono(a.icono))
            errores.push(`atajo "${a.titulo}": ícono "${a.icono}" no existe`);
        destino(`atajo "${a.titulo}"`, a.href);
    }
    for (const p of c.inicio?.publico ?? [])
        destino(`público "${p.quien}"`, p.href);
    if (c.portada?.accion)
        destino(`acción de la portada "${c.portada.accion.texto}"`, c.portada.accion.href);
    if (c.logo?.porDefecto && !c.logo.versiones.some((v) => v.id === c.logo.porDefecto)) {
        errores.push(`logo.porDefecto "${c.logo.porDefecto}": no es el id de ninguna versión`);
    }
    for (const u of Object.keys(c.logo?.porque ?? {})) {
        if (!(c.logo?.incorrectos ?? USOS_INCORRECTOS).includes(u)) {
            errores.push(`logo.porque.${u}: ese uso incorrecto no se muestra`);
        }
    }
    return errores;
}
/** Valida y devuelve la configuración. Falla en el build, no en producción. */
export function defineMarca(c) {
    const errores = validarMarca(c);
    if (errores.length)
        throw new Error(`Configuración de marca inválida:\n- ${errores.join("\n- ")}`);
    return c;
}
/** El destino es un archivo para bajar (PDF o ZIP), no una página. */
export function esArchivo(href) {
    return /\.(pdf|zip)(#.*)?$/i.test(href);
}
export function baseDe(c) {
    return (c.base ?? "/marca").replace(/\/$/, "");
}
export function hrefDe(c, slug) {
    return slug ? `${baseDe(c)}/${slug}` : baseDe(c);
}
export function seccionDe(c, slug) {
    return c.secciones.find((s) => s.slug === slug);
}
/** Secciones agrupadas en el orden en que aparecen. */
export function gruposDe(c) {
    const grupos = [];
    for (const s of c.secciones) {
        const g = grupos.find((x) => x.grupo === s.grupo);
        if (g)
            g.secciones.push(s);
        else
            grupos.push({ grupo: s.grupo, secciones: [s] });
    }
    return grupos;
}
