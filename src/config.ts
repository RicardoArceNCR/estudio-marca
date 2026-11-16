/**
 * Configuración del portal. Todo lo visible del portal sale de acá: el paquete
 * no trae nombres, textos, colores ni imágenes de ningún cliente. Cada valor
 * de marca se escribe como token (`--brand-main`), nunca como hex: el
 * navegador lo resuelve contra el CSS del paquete de tokens del sitio.
 */

export type EstadoSeccion = "lista" | "pendiente";

/** Lo que falta para que una sección pendiente se pueda publicar. */
export interface Pendiente {
  falta: string;
  responsable: string;
  fecha: string;
}

/**
 * Secciones que el paquete sabe pintar a partir de la configuración. Otra
 * sección (por ejemplo, productos) la arma el sitio en una ruta explícita, que
 * le gana a la ruta comodín del portal.
 */
export const SECCIONES_DEL_PAQUETE = ["logo", "color", "tipografia", "sistema"] as const;

export interface Seccion {
  slug: string;
  titulo: string;
  /** Grupo de la navegación: "Identidad", "Recursos"… */
  grupo: string;
  /** Una línea: qué resuelve la sección. Va en la portada y en la navegación. */
  resumen: string;
  estado?: EstadoSeccion;
  pendiente?: Pendiente;
}

export interface VersionLogo {
  id: string;
  nombre: string;
  /** Ruta pública del SVG con curvas: `/marca/logo/principal.svg`. */
  svg: string;
  /**
   * Sobre qué se muestra: "claro", "oscuro" o un token de color de la marca
   * (`--brand-main`) cuando la versión está pensada para ese fondo.
   */
  fondo: "claro" | "oscuro" | `--${string}`;
  uso: string;
}

export type UsoIncorrecto = "estirar" | "rotar" | "recolorear" | "sombra" | "contorno" | "apretar";

export interface LogoConfig {
  versiones: VersionLogo[];
  respeto: { medida: string; descripcion: string };
  minimo: { digital: string; impreso: string };
  /** Se dibujan desde el SVG principal. Por defecto, los seis. */
  incorrectos?: UsoIncorrecto[];
}

export interface ColorOficial {
  nombre: string;
  /** Token que pinta el color: `--brand-main`. */
  token: string;
  /** De dónde sale el valor: "Manual p. 16". */
  fuente: string;
  uso: string;
  cmyk?: string;
  pantone?: string;
}

export interface Rampa {
  familia: string;
  /** Prefijo de los tokens: `--color-brand-` + paso. */
  prefijo: string;
  pasos: number[];
  ancla?: number;
}

export interface Par {
  etiqueta: string;
  texto: string;
  fondo: string;
  /** 4.5 para texto (por defecto), 3 para texto grande e indicadores. */
  minimo?: number;
}

export interface ColorConfig {
  oficiales: ColorOficial[];
  rampas?: Rampa[];
  pares?: Par[];
}

export interface Familia {
  nombre: string;
  rol: string;
  /** Token de la familia: `--typography-family-display`. */
  token: string;
  pesos: number[];
  licencia: string;
}

export interface EstiloTexto {
  nombre: string;
  /** Tokens. Solo `size` es obligatorio. */
  size: string;
  lineHeight?: string;
  family?: string;
  weight?: string;
  tracking?: string;
}

export interface TipografiaConfig {
  familias: Familia[];
  estilos?: EstiloTexto[];
  /** Frase de muestra. */
  muestra: string;
}

export interface SistemaConfig {
  espaciado?: string[];
  radios?: string[];
  sombras?: string[];
}

export interface MarcaConfig {
  /** Nombre del portal: "Marca Acme". */
  nombre: string;
  /** Nombre de la marca: "Acme". */
  marca: string;
  /** Ruta base del portal. Por defecto `/marca`. */
  base?: string;
  /** "1.0 · noviembre 2026". */
  version: string;
  /** Prefijo de los archivos descargados: `acme`. */
  archivo: string;
  contacto?: { nombre: string; correo?: string };
  /**
   * Portada del inicio: una banda con el color de marca y el logo. Sin esto,
   * el inicio abre con un encabezado simple.
   */
  portada?: { logo: string; fondo: `--${string}`; alt?: string };
  /** Marca chica junto al nombre en la cabecera: logo sobre su color. */
  cabecera?: { logo: string; fondo: `--${string}` };
  /** Aparece en buscadores. Por defecto no: el portal se comparte por enlace. */
  indexar?: boolean;
  secciones: Seccion[];
  logo?: LogoConfig;
  color?: ColorConfig;
  tipografia?: TipografiaConfig;
  sistema?: SistemaConfig;
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TOKEN = /^--[a-z0-9-]+$/;

/** Errores de forma de la configuración. Vacío = válida. */
export function validarMarca(c: MarcaConfig): string[] {
  const errores: string[] = [];
  const vistos = new Set<string>();
  for (const s of c.secciones) {
    if (!SLUG.test(s.slug)) errores.push(`sección "${s.slug}": slug inválido`);
    if (vistos.has(s.slug)) errores.push(`sección "${s.slug}": repetida`);
    vistos.add(s.slug);
    if (s.estado === "pendiente" && !s.pendiente) {
      errores.push(`sección "${s.slug}": pendiente sin falta, responsable y fecha`);
    }
    const propia = (SECCIONES_DEL_PAQUETE as readonly string[]).includes(s.slug);
    if (propia && s.estado !== "pendiente" && !c[s.slug as keyof MarcaConfig]) {
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
  for (const t of tokens) if (!TOKEN.test(t)) errores.push(`"${t}" no es un token (--nombre)`);
  for (const r of c.color?.rampas ?? []) {
    if (!TOKEN.test(`${r.prefijo}0`)) errores.push(`rampa ${r.familia}: prefijo "${r.prefijo}" inválido`);
  }
  if (!/^[a-z0-9-]+$/.test(c.archivo)) errores.push(`archivo "${c.archivo}": solo minúsculas, números y guiones`);
  return errores;
}

/** Valida y devuelve la configuración. Falla en el build, no en producción. */
export function defineMarca(c: MarcaConfig): MarcaConfig {
  const errores = validarMarca(c);
  if (errores.length) throw new Error(`Configuración de marca inválida:\n- ${errores.join("\n- ")}`);
  return c;
}

export function baseDe(c: MarcaConfig): string {
  return (c.base ?? "/marca").replace(/\/$/, "");
}

export function hrefDe(c: MarcaConfig, slug?: string): string {
  return slug ? `${baseDe(c)}/${slug}` : baseDe(c);
}

export function seccionDe(c: MarcaConfig, slug: string): Seccion | undefined {
  return c.secciones.find((s) => s.slug === slug);
}

/** Secciones agrupadas en el orden en que aparecen. */
export function gruposDe(c: MarcaConfig): { grupo: string; secciones: Seccion[] }[] {
  const grupos: { grupo: string; secciones: Seccion[] }[] = [];
  for (const s of c.secciones) {
    const g = grupos.find((x) => x.grupo === s.grupo);
    if (g) g.secciones.push(s);
    else grupos.push({ grupo: s.grupo, secciones: [s] });
  }
  return grupos;
}
