/**
 * Configuración del portal. Todo lo visible del portal sale de acá: el paquete
 * no trae nombres, textos, colores ni imágenes de ningún cliente. Cada valor
 * de marca se escribe como token (`--brand-main`), nunca como hex: el
 * navegador lo resuelve contra el CSS del paquete de tokens del sitio.
 */
/**
 * Secciones que el paquete sabe pintar a partir de la configuración. Otra
 * sección (por ejemplo, productos) la arma el sitio en una ruta explícita, que
 * le gana a la ruta comodín del portal.
 */
export const SECCIONES_DEL_PAQUETE = ["logo", "color", "tipografia", "sistema"];
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TOKEN = /^--[a-z0-9-]+$/;
/** Errores de forma de la configuración. Vacío = válida. */
export function validarMarca(c) {
    const errores = [];
    const vistos = new Set();
    for (const s of c.secciones) {
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
        ...(c.cabecera ? [c.cabecera.fondo] : []),
        ...(c.sistema?.espaciado ?? []),
        ...(c.sistema?.radios ?? []),
        ...(c.sistema?.sombras ?? []),
    ];
    for (const t of tokens)
        if (!TOKEN.test(t))
            errores.push(`"${t}" no es un token (--nombre)`);
    for (const r of c.color?.rampas ?? []) {
        if (!TOKEN.test(`${r.prefijo}0`))
            errores.push(`rampa ${r.familia}: prefijo "${r.prefijo}" inválido`);
    }
    if (!/^[a-z0-9-]+$/.test(c.archivo))
        errores.push(`archivo "${c.archivo}": solo minúsculas, números y guiones`);
    return errores;
}
/** Valida y devuelve la configuración. Falla en el build, no en producción. */
export function defineMarca(c) {
    const errores = validarMarca(c);
    if (errores.length)
        throw new Error(`Configuración de marca inválida:\n- ${errores.join("\n- ")}`);
    return c;
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
