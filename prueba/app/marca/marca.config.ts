import { defineMarca } from "@estudio/marca";

export default defineMarca({
  nombre: "Marca Cliente de prueba",
  marca: "Cliente de prueba",
  version: "0.1 · prueba",
  archivo: "cliente-prueba",
  contacto: { nombre: "Equipo de prueba", correo: "marca@example.com" },
  portada: {
    logo: "/marca/logo/negativo.svg",
    fondo: "--brand-main",
    accion: { texto: "Bajar el logo", href: "/marca/logo#si-dudas" },
  },
  estado: "vigente",
  actualizado: "2026-11-16",
  ayuda: { nombre: "el equipo de prueba", correo: "marca@example.com" },
  inicio: {
    encabezado: { titulo: "Marca de prueba", bajada: "Una marca ficticia para probar el paquete." },
    atajos: [
      { titulo: "Bajar el logo", texto: "SVG, PNG y ZIP.", href: "/marca/logo#descargas", icono: "descargar" },
      { titulo: "Copiar un color", texto: "HEX y RGB.", href: "/marca/color#oficiales", icono: "copiar" },
      { titulo: "Ver la letra", texto: "Familias y jerarquía.", href: "/marca/tipografia#familias", icono: "tipografia" },
    ],
    bloques: { atajos: { antetitulo: "Atajos", titulo: "¿Qué necesitás?" } },
  },
  cabecera: { logo: "/marca/logo/negativo.svg", fondo: "--surface-inverse" },
  secciones: [
    {
      slug: "logo",
      titulo: "Logo",
      grupo: "Identidad",
      resumen: "Versiones, área de respeto, tamaño mínimo y descargas.",
      siDudas: "Usá la principal sobre fondo claro. Si el fondo es oscuro, la negativa.",
    },
    { slug: "color", titulo: "Color", grupo: "Identidad", resumen: "Colores oficiales, combinaciones y rampas." },
    { slug: "tipografia", titulo: "Tipografía", grupo: "Identidad", resumen: "Familias, pesos y jerarquía." },
    {
      slug: "personaje",
      titulo: "Personaje",
      grupo: "Identidad",
      resumen: "Poses y reglas de uso del personaje.",
      estado: "pendiente",
      pendiente: { falta: "Originales de las poses en SVG", responsable: "Cliente", fecha: "2026-12-01" },
    },
    { slug: "sistema", titulo: "Sistema de diseño", grupo: "Diseño y desarrollo", resumen: "Tokens y componentes en vivo." },
  ],
  logo: {
    versiones: [
      { id: "principal", nombre: "Principal", svg: "/marca/logo/principal.svg", fondo: "claro", uso: "Sobre fondos claros." },
      { id: "negativo", nombre: "Negativo", svg: "/marca/logo/negativo.svg", fondo: "oscuro", uso: "Sobre fondos oscuros." },
      { id: "sobre-violeta", nombre: "Sobre violeta", svg: "/marca/logo/negativo.svg", fondo: "--brand-main", uso: "Sobre el color de marca." },
    ],
    respeto: { medida: "1 × la altura del círculo", descripcion: "Nada entra en ese margen alrededor del logo." },
    minimo: { digital: "96 px", impreso: "2,5 cm" },
    porDefecto: "principal",
    porque: { estirar: "Deformado deja de ser el mismo logo y se nota a simple vista." },
  },
  color: {
    oficiales: [
      { nombre: "Violeta", token: "--brand-main", fuente: "Manual de prueba p. 4", uso: "Color principal.", cmyk: "75 80 0 0" },
      { nombre: "Ámbar", token: "--brand-accent", fuente: "Manual de prueba p. 4", uso: "Acentos." },
    ],
    pares: [
      { etiqueta: "Texto principal", texto: "--text-primary", fondo: "--background-page" },
      { etiqueta: "Botón principal", texto: "--button-primary-text", fondo: "--button-primary-bg" },
      { etiqueta: "Texto de marca", texto: "--text-brand", fondo: "--surface-base" },
    ],
    rampas: [{ familia: "violeta", prefijo: "--color-violeta-", pasos: [100, 300, 500, 700, 900], ancla: 500 }],
  },
  tipografia: {
    muestra: "Una marca clara se aplica igual en todos lados.",
    familias: [
      { nombre: "Georgia", rol: "Títulos", token: "--typography-family-display", pesos: [400, 700], licencia: "Del sistema" },
      { nombre: "System UI", rol: "Texto e interfaz", token: "--typography-family-body", pesos: [400, 700], licencia: "Del sistema" },
    ],
    estilos: [
      { nombre: "Título", size: "--typography-size-5xl", family: "--typography-family-display" },
      { nombre: "Subtítulo", size: "--typography-size-2xl", family: "--typography-family-display" },
      { nombre: "Cuerpo", size: "--typography-size-md" },
      { nombre: "Pequeño", size: "--typography-size-sm" },
    ],
  },
  sistema: {
    espaciado: ["--spacing-2", "--spacing-4", "--spacing-8", "--spacing-16"],
    radios: ["--radius-sm", "--radius-md", "--radius-full"],
    sombras: ["--shadow-md"],
  },
});
