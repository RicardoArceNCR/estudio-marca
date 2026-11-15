/**
 * ZIP mínimo, sin compresión (método "store"). Los PNG ya vienen comprimidos, así
 * que deflate no ganaría casi nada, y esto evita sumar una dependencia. Formato: PKWARE APPNOTE 6.3 (cabecera local
 * + directorio central + fin de directorio). Nombres en UTF-8 (bit 11).
 */
export interface ZipEntry {
    /** Ruta dentro del ZIP, con "/" como separador. */
    name: string;
    data: Uint8Array;
}
export declare function makeZip(entries: readonly ZipEntry[], when?: Date): Blob;
