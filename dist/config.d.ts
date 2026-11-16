/**
 * Configuración del portal. Todo lo visible del portal sale de acá: el paquete
 * no trae nombres, textos, colores ni imágenes de ningún cliente. Cada valor
 * de marca se escribe como token (`--brand-main`), nunca como hex: el
 * navegador lo resuelve contra el CSS del paquete de tokens del sitio.
 */
import { type IconoMarca } from "./iconos.js";
export type { IconoMarca };
export type EstadoSeccion = "lista" | "pendiente";
/** Antetítulo, título y bajada de un bloque o una página. */
export interface Titular {
    antetitulo?: string;
    titulo?: string;
    bajada?: string;
}
/** Atajo del inicio: una tarea escrita con verbo, con su destino. */
export interface Atajo {
    titulo: string;
    texto: string;
    href: string;
    icono?: IconoMarca;
}
/** Datos de ayuda para el pie: a quién escribir si algo falta o está mal. */
export interface Ayuda {
    nombre: string;
    correo?: string;
    texto?: string;
}
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
export declare const SECCIONES_DEL_PAQUETE: readonly ["logo", "color", "tipografia", "sistema"];
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
    respeto: {
        medida: string;
        descripcion: string;
    };
    minimo: {
        digital: string;
        impreso: string;
    };
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
    contacto?: {
        nombre: string;
        correo?: string;
    };
    /**
     * Portada del inicio: una banda con el color de marca y el logo. Sin esto,
     * el inicio abre con un encabezado simple.
     */
    portada?: {
        logo: string;
        fondo: `--${string}`;
        alt?: string;
    };
    /** Marca chica junto al nombre en la cabecera: logo sobre su color. */
    cabecera?: {
        logo: string;
        fondo: `--${string}`;
    };
    /** Inicio: encabezado propio, atajos por tarea y títulos de sus bloques. */
    inicio?: {
        encabezado?: Titular;
        /** `false` quita los atajos; sin el campo, el paquete arma los de siempre. */
        atajos?: Atajo[] | false;
        bloques?: {
            atajos?: Titular;
            secciones?: Titular;
        };
    };
    /** Estado del portal, a la vista en cada página. */
    estado?: "vigente" | "borrador" | "en-revision";
    /** Fecha de la última actualización, ISO (2026-11-15). */
    actualizado?: string;
    /** A quién escribir. Reemplaza a `contacto`. */
    ayuda?: Ayuda;
    /** Aparece en buscadores. Por defecto no: el portal se comparte por enlace. */
    indexar?: boolean;
    secciones: Seccion[];
    logo?: LogoConfig;
    color?: ColorConfig;
    tipografia?: TipografiaConfig;
    sistema?: SistemaConfig;
}
/** Errores de forma de la configuración. Vacío = válida. */
export declare function validarMarca(c: MarcaConfig): string[];
/** Valida y devuelve la configuración. Falla en el build, no en producción. */
export declare function defineMarca(c: MarcaConfig): MarcaConfig;
export declare function baseDe(c: MarcaConfig): string;
export declare function hrefDe(c: MarcaConfig, slug?: string): string;
export declare function seccionDe(c: MarcaConfig, slug: string): Seccion | undefined;
/** Secciones agrupadas en el orden en que aparecen. */
export declare function gruposDe(c: MarcaConfig): {
    grupo: string;
    secciones: Seccion[];
}[];
