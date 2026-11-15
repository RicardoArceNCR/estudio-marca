import assert from "node:assert/strict";
import { test } from "node:test";
import { contrast, formatRatio, parseColor, toHex } from "../dist/color.js";
import { defineMarca, gruposDe, validarMarca } from "../dist/config.js";
import { marcaParams } from "../dist/rutas.js";
import { makeZip } from "../dist/zip.js";
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
