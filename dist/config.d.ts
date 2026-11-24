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
/**
 * Portada de capítulo: el encabezado de la sección a color pleno, de borde a
 * borde, con su número enorme. `tinta` es el color del texto: "clara" sobre
 * fondos oscuros o saturados, "oscura" sobre fondos claros.
 */
export interface Capitulo {
    /** "01". Va grande y decorativo (oculto para lectores de pantalla). */
    numero: string;
    /** Token del fondo: `--brand-main`. */
    fondo: `--${string}`;
    tinta?: "clara" | "oscura";
    /** Siluetas decorativas detrás del texto (0.8.0). */
    siluetas?: CapaSiluetas;
}
/**
 * Siluetas de una portada (0.8.0): una forma de la marca repetida y girada,
 * cortada por el borde de `lado`. Solo datos: la configuración la lee también
 * el shell, que es de cliente.
 */
export interface CapaSiluetas {
    /** Un trazo cerrado y su viewBox ("0 0 355.5 327.5"). */
    forma: {
        d: string;
        viewBox: string;
    };
    /** Cuántas copias, de 1 a 3. Por defecto 2. */
    copias?: number;
    /** Grados entre una copia y la siguiente. Por defecto 18. */
    giro?: number;
    /** Punto de giro en unidades del viewBox. Por defecto, el centro. */
    pivote?: [number, number];
    /** Borde por el que se cortan: "inicio" (izquierda) o "fin" (derecha). */
    lado: "inicio" | "fin";
}
/** Un público del portal y la tarea que viene a resolver. */
export interface Perfil {
    /** "Diseñadores y agencias". */
    quien: string;
    /** Qué necesita, con verbo: "Bajar el logo y copiar los colores." */
    necesita: string;
    href: string;
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
    /**
     * "Si dudás, usá esto": la decisión por defecto de la sección, en una o dos
     * frases. Va arriba de todo, antes de las reglas.
     */
    siDudas?: string;
    /** Portada de capítulo de la sección. Sin esto, encabezado simple. */
    capitulo?: Capitulo;
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
export declare const USOS_INCORRECTOS: readonly ["estirar", "rotar", "recolorear", "sombra", "contorno", "apretar"];
export type UsoIncorrecto = (typeof USOS_INCORRECTOS)[number];
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
    /** Por qué no: una frase por uso incorrecto, con la consecuencia real. */
    porque?: Partial<Record<UsoIncorrecto, string>>;
    /**
     * Id de la versión que se usa cuando no hay otra indicación. Se muestra
     * arriba, con sus descargas directas. Sin esto, la primera.
     */
    porDefecto?: string;
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
    /** Cuándo se usa, en una frase: "Títulos de página; uno por pantalla." */
    uso?: string;
    /** Texto real de muestra para este estilo. Sin esto, `tipografia.muestra`. */
    muestra?: string;
}
export interface TipografiaConfig {
    familias: Familia[];
    estilos?: EstiloTexto[];
    /** Frase de muestra. */
    muestra: string;
    /** Por qué la jerarquía es así: va como bajada del bloque Jerarquía. */
    porque?: string;
}
/** Un token del sistema, solo o con cuándo se usa. */
export type TokenSistema = string | {
    token: string;
    uso: string;
};
/** El nombre del token de una entrada del sistema. */
export declare function tokenDe(t: TokenSistema): string;
export interface SistemaConfig {
    espaciado?: TokenSistema[];
    radios?: TokenSistema[];
    sombras?: TokenSistema[];
    /** Por qué de cada bloque, en una o dos frases. Va como bajada. */
    porque?: {
        componentes?: string;
        espaciado?: string;
        radios?: string;
        sombras?: string;
    };
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
        /** Una sola acción en la portada: botón sin relleno con borde iluminado. */
        accion?: {
            texto: string;
            href: string;
        };
        /** De borde a borde del área de contenido, sin radio, como las portadas de capítulo. */
        sangrado?: boolean;
        /** Siluetas decorativas detrás del texto (0.8.0). */
        siluetas?: CapaSiluetas;
    };
    /**
     * Gesto de los títulos de página: un signo de cierre (por ejemplo, ".")
     * pintado con `--mk-titulo-punto`. Decorativo: no lo leen los lectores de
     * pantalla, y no se agrega si el título ya termina en un signo.
     */
    titulos?: {
        punto?: string;
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
            publico?: Titular;
        };
        /** "¿Para quién es esto?": cada público con su tarea y su destino. */
        publico?: Perfil[];
    };
    /** Estado del portal, a la vista en cada página. */
    estado?: "vigente" | "borrador" | "en-revision";
    /** Fecha de la última actualización, ISO (2026-11-15). */
    actualizado?: string;
    /**
     * Manual de marca en PDF, servido por el sitio fuera del portal
     * (`/descargas/acme-manual.pdf`). Va junto al ZIP en Logo.
     */
    manual?: {
        href: string;
        detalle: string;
    };
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
/** Errores de forma de unas siluetas. Vacío = válidas. */
export declare function validarSiluetas(donde: string, s: CapaSiluetas): string[];
export declare function validarMarca(c: MarcaConfig): string[];
/** Valida y devuelve la configuración. Falla en el build, no en producción. */
export declare function defineMarca(c: MarcaConfig): MarcaConfig;
/** El destino es un archivo para bajar (PDF o ZIP), no una página. */
export declare function esArchivo(href: string): boolean;
export declare function baseDe(c: MarcaConfig): string;
export declare function hrefDe(c: MarcaConfig, slug?: string): string;
export declare function seccionDe(c: MarcaConfig, slug: string): Seccion | undefined;
/** Secciones agrupadas en el orden en que aparecen. */
export declare function gruposDe(c: MarcaConfig): {
    grupo: string;
    secciones: Seccion[];
}[];
