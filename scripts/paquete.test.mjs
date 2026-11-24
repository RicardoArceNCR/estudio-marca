import assert from "node:assert/strict";
import { test } from "node:test";
import { contrast, formatRatio, parseColor, toHex } from "../dist/color.js";
import { defineMarca, gruposDe, validarMarca } from "../dist/config.js";
import { marcaParams } from "../dist/rutas.js";
import { makeZip } from "../dist/zip.js";
import { columnas } from "../dist/rejilla.js";
import { validarArchivo } from "../suite/revisar.mjs";
import { buscarHex, buscarProhibidos } from "./sin-clientes.mjs";

const BASE = {
  nombre: "Marca X",
  marca: "X",
  version: "1",
  archivo: "x",
  secciones: [
    { slug: "color", titulo: "Color", grupo: "Identidad", resumen: "r" },
    { slug: "voz", titulo: "Voz", grupo: "Identidad", resumen: "r", estado: "pendiente", pendiente: { falta: "f", responsable: "r", fecha: "2026-12-01" } },
    { slug: "sabores", titulo: "Sabores", grupo: "Producto", resumen: "r" },
  ],
  color: { oficiales: [{ nombre: "Uno", token: "--brand-main", fuente: "Manual p. 1", uso: "u" }] },
};

test("contraste WCAG con valores conocidos", () => {
  assert.equal(formatRatio(contrast([0, 0, 0, 1], [255, 255, 255, 1])), "21,00:1");
  // 4,499 no se redondea a 4,5: se trunca.
  assert.equal(formatRatio(4.4999), "4,49:1");
  assert.deepEqual(parseColor("rgb(91, 53, 213)"), [91, 53, 213, 1]);
  assert.equal(toHex(parseColor("color(srgb 1 0 0)")), "#FF0000");
});

test("la configuración válida pasa y una inválida dice por qué", () => {
  assert.deepEqual(validarMarca(BASE), []);
  const mala = {
    ...BASE,
    archivo: "Con Espacios",
    secciones: [...BASE.secciones, { slug: "logo", titulo: "Logo", grupo: "Identidad", resumen: "r" }, { slug: "Voz Mala", titulo: "x", grupo: "g", resumen: "r", estado: "pendiente" }],
    color: { oficiales: [{ nombre: "Hex", token: "#ff0000", fuente: "f", uso: "u" }] },
  };
  const errores = validarMarca(mala);
  assert.ok(errores.some((e) => e.includes("logo") && e.includes("falta su configuración")));
  assert.ok(errores.some((e) => e.includes("slug inválido")));
  assert.ok(errores.some((e) => e.includes("pendiente sin")));
  assert.ok(errores.some((e) => e.includes('"#ff0000" no es un token')));
  assert.ok(errores.some((e) => e.includes("archivo")));
  assert.throws(() => defineMarca(mala), /Configuración de marca inválida/);
});

test("rutas: inicio, secciones del paquete y pendientes; las propias del sitio no", () => {
  const slugs = marcaParams(BASE).map((p) => p.slug.join("/"));
  assert.deepEqual(slugs, ["", "color", "voz"]);
  assert.deepEqual(gruposDe(BASE).map((g) => g.grupo), ["Identidad", "Producto"]);
});

test("el ZIP generado es válido para la revisión", async () => {
  const enc = new TextEncoder();
  const zip = makeZip([{ name: "LEEME.txt", data: enc.encode("hola") }, { name: "svg/a.svg", data: enc.encode('<svg viewBox="0 0 1 1"/>') }]);
  const buf = Buffer.from(await zip.arrayBuffer());
  assert.equal(validarArchivo("zip", buf), null);
  assert.match(validarArchivo("zip", Buffer.from("PK\u0003\u0004 corto")), /directorio central/);
  assert.match(validarArchivo("png", Buffer.from("<svg")), /no es PNG/);
});

test("detector de datos de clientes", () => {
  assert.deepEqual(buscarProhibidos("Portal de Marca VPER", ["vper"]), ["vper"]);
  assert.deepEqual(buscarProhibidos("superposición", ["vper"]), []);
  assert.deepEqual(buscarHex("color: #D62828; a { } &#039; --x"), ["#D62828"]);
});

test("atajos: destino dentro del portal tiene que existir y no estar pendiente", () => {
  const conAtajos = {
    ...BASE,
    actualizado: "16/11/2026",
    inicio: {
      atajos: [
        { titulo: "Ir a voz", texto: "t", href: "/marca/voz" },
        { titulo: "Ir a nada", texto: "t", href: "/marca/nada#x" },
        { titulo: "Afuera", texto: "t", href: "https://example.com" },
      ],
    },
  };
  const e = validarMarca(conAtajos);
  assert.ok(e.some((m) => m.includes("Ir a voz") && m.includes("pendiente")));
  assert.ok(e.some((m) => m.includes("Ir a nada") && m.includes("no es una sección")));
  assert.ok(!e.some((m) => m.includes("Afuera")));
  assert.ok(e.some((m) => m.includes("fecha ISO")));
});

test("columnas: nunca un elemento solo en la última fila", () => {
  for (let n = 1; n <= 20; n++) {
    for (const max of [2, 3, 4]) {
      const c = columnas(n, max);
      assert.ok(c >= 1 && c <= max + 1);
      if (n > c) assert.notEqual(n % c, 1, `n=${n} max=${max} c=${c}`);
    }
  }
});

test("logo guiado: versión por defecto, porqués y acción de portada", () => {
  const logo = {
    versiones: [{ id: "principal", nombre: "Principal", svg: "/marca/logo/principal.svg", fondo: "claro", uso: "u" }],
    respeto: { medida: "m", descripcion: "d" },
    minimo: { digital: "80 px", impreso: "3 cm" },
    incorrectos: ["estirar"],
  };
  const conLogo = { ...BASE, secciones: [...BASE.secciones, { slug: "logo", titulo: "Logo", grupo: "Identidad", resumen: "r", siDudas: "Usá la principal." }] };
  assert.deepEqual(validarMarca({ ...conLogo, logo: { ...logo, porDefecto: "principal", porque: { estirar: "Se deforma." } } }), []);
  const errores = validarMarca({
    ...conLogo,
    logo: { ...logo, porDefecto: "otra", porque: { sombra: "No se muestra." } },
    portada: { logo: "/l.svg", fondo: "--brand-main", accion: { texto: "Voz", href: "/marca/voz" } },
  });
  assert.ok(errores.some((e) => e.includes('porDefecto "otra"')));
  assert.ok(errores.some((e) => e.includes("porque.sombra")));
  assert.ok(errores.some((e) => e.includes("acción de la portada") && e.includes("pendiente")));
});

test("capítulos y público: el fondo es un token y el destino existe", () => {
  const bien = {
    ...BASE,
    titulos: { punto: "." },
    secciones: BASE.secciones.map((s) => (s.slug === "color" ? { ...s, capitulo: { numero: "02", fondo: "--brand-gold", tinta: "oscura" } } : s)),
    inicio: { publico: [{ quien: "Diseño", necesita: "Copiar un color.", href: "/marca/color" }] },
  };
  assert.deepEqual(validarMarca(bien), []);
  const mal = {
    ...bien,
    secciones: bien.secciones.map((s) => (s.slug === "color" ? { ...s, capitulo: { numero: "02", fondo: "#edb824" } } : s)),
    inicio: { publico: [{ quien: "Prensa", necesita: "Ver la voz.", href: "/marca/voz" }] },
  };
  const errores = validarMarca(mal).join("\n");
  assert.match(errores, /"#edb824" no es un token/);
  assert.match(errores, /público "Prensa": \/marca\/voz está pendiente/);
});

test("manual en PDF: ruta del sitio a un .pdf; los atajos a archivos no son secciones", () => {
  assert.deepEqual(validarMarca({ ...BASE, manual: { href: "/descargas/x-manual.pdf", detalle: "PDF" } }), []);
  assert.match(validarMarca({ ...BASE, manual: { href: "https://x.com/m.doc", detalle: "x" } }).join(), /manual/);
  const conAtajo = { ...BASE, inicio: { atajos: [{ titulo: "Bajar el manual", texto: "PDF", href: "/descargas/x-manual.pdf", icono: "descargar" }] } };
  assert.deepEqual(validarMarca(conAtajo), []);
});

test("sistema: tokens solos o con uso; un uso con un token inválido falla", () => {
  const ok = { ...BASE, sistema: { espaciado: ["--spacing-4", { token: "--spacing-8", uso: "u" }], porque: { espaciado: "p" } } };
  assert.deepEqual(validarMarca(ok), []);
  const mala = { ...BASE, sistema: { radios: [{ token: "8px", uso: "u" }] } };
  assert.ok(validarMarca(mala).some((e) => e.includes('"8px" no es un token')));
});

test("siluetas: forma, viewBox, lado y copias", () => {
  const forma = { d: "M0,0L10,0L0,10Z", viewBox: "0 0 10 10" };
  const ok = { ...BASE, portada: { logo: "/l.svg", fondo: "--surface-base", siluetas: { forma, lado: "inicio" } } };
  assert.deepEqual(validarMarca(ok), []);
  const mala = { ...BASE, portada: { logo: "/l.svg", fondo: "--surface-base", siluetas: { forma: { d: "L0,0", viewBox: "0 0 0 10" }, lado: "arriba", copias: 5 } } };
  const e = validarMarca(mala);
  for (const t of ["empezar con M", "viewBox inválido", "lado tiene que ser", "copias va de 1 a 3"]) assert.ok(e.some((x) => x.includes(t)), t);
});
