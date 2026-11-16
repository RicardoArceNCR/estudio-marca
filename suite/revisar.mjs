#!/usr/bin/env node
// Revisión en navegador de un portal hecho con @estudio/marca.
//
//   npx marca-revisar --url http://localhost:3101/marca [--anchos 320,390,1440] [--prohibidos a,b]
//
// Descubre las rutas desde la navegación del portal, así que no hay que
// mantener una lista. Necesita `playwright` y `@axe-core/playwright` como
// devDependencies del sitio. Sale con 1 si algo falla; los avisos no fallan.
import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SEVERIDADES_QUE_FALLAN = new Set(["serious", "critical"]);
const ETIQUETAS_AXE = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

async function cargar(nombre) {
  // Primero desde el sitio que corre la revisión; si no, desde el paquete.
  for (const base of [path.join(process.cwd(), "package.json"), import.meta.url]) {
    try {
      const ruta = createRequire(base).resolve(nombre);
      return await import(pathToFileURL(ruta).href);
    } catch {
      /* siguiente */
    }
  }
  throw new Error(`Falta ${nombre}: instalalo como devDependency del sitio.`);
}

function crearInforme() {
  const fallas = [];
  const avisos = [];
  return {
    fallas,
    avisos,
    falla: (donde, msg) => fallas.push(`${donde}: ${msg}`),
    aviso: (donde, msg) => avisos.push(`${donde}: ${msg}`),
  };
}

function firma(buf, bytes) {
  return bytes.every((b, i) => buf[i] === b);
}

/** Valida el archivo descargado por su contenido, no por su nombre. */
export function validarArchivo(tipo, buf) {
  if (tipo === "svg") {
    const t = buf.toString("utf8");
    if (!/<svg[\s>]/.test(t)) return "no es SVG";
    if (!/viewBox=/.test(t)) return "SVG sin viewBox";
    return null;
  }
  if (tipo === "png") {
    if (!firma(buf, [0x89, 0x50, 0x4e, 0x47])) return "no es PNG";
    const ancho = buf.readUInt32BE(16);
    const alto = buf.readUInt32BE(20);
    if (!ancho || !alto) return "PNG sin medidas";
    return null;
  }
  if (tipo === "zip") {
    if (!firma(buf, [0x50, 0x4b, 0x03, 0x04])) return "no es ZIP";
    const fin = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (fin < 0) return "ZIP sin directorio central";
    const entradas = buf.readUInt16LE(fin + 10);
    if (entradas < 2) return `ZIP con ${entradas} entradas`;
    return null;
  }
  return `tipo ${tipo} desconocido`;
}

async function rutasDelPortal(page, url) {
  await page.goto(url, { waitUntil: "networkidle" });
  const base = new URL(url);
  const hrefs = await page.$$eval("[data-mk-nav] a[href]", (as) => as.map((a) => a.getAttribute("href")));
  const rutas = new Set([base.pathname.replace(/\/$/, "") || "/"]);
  for (const h of hrefs) {
    if (!h) continue;
    const u = new URL(h, base);
    if (u.origin === base.origin && u.pathname.startsWith(base.pathname.replace(/\/$/, ""))) rutas.add(u.pathname);
  }
  return [...rutas];
}

async function revisarPagina({ page, AxeBuilder, origen, ruta, ancho, informe, prohibidos }) {
  const donde = `${ruta} @${ancho}`;
  const errores = [];
  const onConsola = (m) => m.type() === "error" && errores.push(m.text());
  const onError = (e) => errores.push(e.message);
  page.on("console", onConsola);
  page.on("pageerror", onError);
  await page.setViewportSize({ width: ancho, height: 900 });
  const res = await page.goto(origen + ruta, { waitUntil: "networkidle" });
  if (res?.status() !== 200) informe.falla(donde, `respondió ${res?.status()}`);

  const datos = await page.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    main: document.querySelectorAll("main").length,
    titulo: document.title.trim(),
    desborde: document.documentElement.scrollWidth - window.innerWidth,
    imagenes: Array.from(document.images).map((i) => ({
      src: i.getAttribute("src"),
      alt: i.getAttribute("alt"),
      ok: i.complete && i.naturalWidth > 0,
    })),
    html: document.documentElement.outerHTML.toLowerCase(),
  }));
  if (datos.h1 !== 1) informe.falla(donde, `${datos.h1} h1 (tiene que haber 1)`);
  if (datos.main !== 1) informe.falla(donde, `${datos.main} <main>`);
  if (!datos.titulo) informe.falla(donde, "sin <title>");
  if (datos.desborde > 0) informe.falla(donde, `desborde horizontal de ${datos.desborde} px`);
  for (const img of datos.imagenes) {
    if (!img.ok) informe.falla(donde, `imagen que no carga: ${img.src}`);
    if (img.alt === null) informe.falla(donde, `imagen sin alt: ${img.src}`);
    else if (/\.(svg|png|jpe?g|webp)$/i.test(img.alt)) informe.aviso(donde, `alt con nombre de archivo: ${img.alt}`);
  }
  const medidas = await page.evaluate(() => {
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none";
    };
    const chico = [];
    const caminante = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (caminante.nextNode()) {
      const nodo = caminante.currentNode;
      const el = nodo.parentElement;
      if (!el || !nodo.textContent.trim() || !visible(el)) continue;
      if (el.closest(".mk-oculto, [aria-hidden='true'], dialog:not([open]), [hidden]")) continue;
      const px = parseFloat(getComputedStyle(el).fontSize);
      if (px < 12) chico.push(`${nodo.textContent.trim().slice(0, 30)} (${px} px)`);
    }
    const objetivos = [];
    for (const el of document.querySelectorAll("a[href], button, summary, input, select")) {
      if (!visible(el) || el.closest("dialog:not([open]), [hidden]")) continue;
      if (el.tagName === "A" && el.closest("p, li > span, figcaption, .mk-pie")) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 24 || r.height < 24) objetivos.push(`${(el.textContent || el.getAttribute("aria-label") || el.tagName).trim().slice(0, 30)} (${Math.round(r.width)}×${Math.round(r.height)})`);
    }
    const huerfanas = [];
    for (const g of document.querySelectorAll("[data-mk-rejilla]")) {
      const filas = new Map();
      for (const h of g.children) if (visible(h)) filas.set(h.offsetTop, (filas.get(h.offsetTop) ?? 0) + 1);
      const conteos = [...filas.values()];
      if (conteos.length > 1 && conteos[0] > 1 && conteos.at(-1) === 1) {
        huerfanas.push(g.closest("section")?.id ?? "rejilla");
      }
    }
    // Botones: alto de 44 px, mayúsculas solo por CSS y un único brillo por vista.
    const botones = [...document.querySelectorAll(".mk-boton")].filter(visible);
    const botonesBajos = botones.filter((b) => b.getBoundingClientRect().height < 43.5).map((b) => b.textContent.trim().slice(0, 30));
    const mayusTecleadas = botones
      .map((b) => b.textContent.trim())
      .filter((t) => /\p{L}{4,}/u.test(t) && t === t.toUpperCase() && t !== t.toLowerCase());
    const brillos = botones.filter((b) => b.classList.contains("mk-boton-brillo")).length;
    const secciones = [...document.querySelectorAll("main section[id]")].filter((x) => !x.parentElement?.closest("section[id]")).length;
    const indiceMovil = document.querySelector("[data-mk-indice-movil]");
    const portada = document.querySelector(".mk-portada, .mk-capitulo")?.getBoundingClientRect().height ?? 0;
    const alto = window.innerHeight;
    const esInicio = location.pathname.replace(/\/$/, "") === (document.querySelector(".mk-marca")?.getAttribute("href") ?? "").replace(/\/$/, "");
    return { chico, objetivos, huerfanas, botonesBajos, mayusTecleadas, brillos, secciones, esInicio, portada, alto, indiceMovil: indiceMovil ? visible(indiceMovil) : false };
  });
  if (medidas.botonesBajos.length) informe.falla(donde, `botones de menos de 44 px de alto: ${medidas.botonesBajos.slice(0, 3).join("; ")}`);
  if (medidas.mayusTecleadas.length) {
    informe.falla(donde, `botones escritos en mayúsculas en el HTML (van en minúscula y las pone el CSS): ${medidas.mayusTecleadas.slice(0, 3).join("; ")}`);
  }
  if (medidas.brillos > 1) informe.falla(donde, `${medidas.brillos} botones con brillo: uno por vista`);
  if (ancho < 768 && medidas.portada > medidas.alto / 2) {
    informe.falla(donde, `la portada ocupa ${Math.round(medidas.portada)} de ${medidas.alto} px: más de media pantalla`);
  }
  if (ancho < 1024 && !medidas.esInicio && medidas.secciones >= 3 && !medidas.indiceMovil) {
    informe.falla(donde, "en móvil falta el índice «En esta página» a la vista");
  }
  if (medidas.chico.length) informe.falla(donde, `texto de menos de 12 px: ${medidas.chico.slice(0, 3).join("; ")}`);
  if (medidas.objetivos.length) informe.falla(donde, `objetivos de menos de 24 px: ${medidas.objetivos.slice(0, 3).join("; ")}`);
  for (const h of medidas.huerfanas) informe.falla(donde, `la rejilla de "${h}" deja un elemento solo en la última fila`);
  const faltas = await page.$$eval("[data-mk-falta]", (els) => els.map((e) => e.getAttribute("data-mk-falta")));
  for (const f of faltas) informe.falla(donde, `la configuración usa tokens que el CSS no define: ${f}`);
  const midiendo = await page.$$eval(".mk-par-resultado", (els) => els.filter((e) => /Midiendo/.test(e.textContent ?? "")).length);
  if (midiendo) informe.falla(donde, `${midiendo} par(es) de contraste sin medir`);
  for (const termino of prohibidos) {
    if (datos.html.includes(termino)) informe.falla(donde, `el HTML contiene "${termino}" (dato de otro cliente)`);
  }

  {
    const axe = await new AxeBuilder({ page }).withTags(ETIQUETAS_AXE).analyze();
    for (const v of axe.violations) {
      const msg = `axe ${v.id} (${v.impact}): ${v.nodes.length} nodo(s) — ${v.help}`;
      SEVERIDADES_QUE_FALLAN.has(v.impact) ? informe.falla(donde, msg) : informe.aviso(donde, msg);
    }
  }
  page.off("console", onConsola);
  page.off("pageerror", onError);
  for (const e of errores) informe.falla(donde, `error en consola: ${e.slice(0, 160)}`);
}

async function revisarTeclado({ page, url, informe }) {
  const donde = "teclado @1440";
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const primero = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
  if (!/saltar al contenido/i.test(primero)) informe.falla(donde, `el primer Tab enfoca "${primero}", no el salto al contenido`);
  await page.keyboard.press("Enter");
  const enMain = await page.evaluate(() => Boolean(document.activeElement?.closest("main")));
  if (!enMain) informe.falla(donde, "el salto al contenido no lleva el foco a <main>");

  // Foco visible y no tapado en los primeros 25 elementos.
  await page.goto(url, { waitUntil: "networkidle" });
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press("Tab");
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const transparente = (c) => /rgba\([^)]*,\s*0\)|transparent/.test(c);
      const visible =
        (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 && !transparente(cs.outlineColor)) ||
        (cs.boxShadow !== "none" && !transparente(cs.boxShadow));
      const rect = el.getBoundingClientRect();
      const x = Math.min(Math.max(rect.left + rect.width / 2, 0), window.innerWidth - 1);
      const y = Math.min(Math.max(rect.top + Math.min(rect.height / 2, 10), 0), window.innerHeight - 1);
      const arriba = document.elementFromPoint(x, y);
      const tapado = arriba && !el.contains(arriba) && !arriba.contains(el);
      return { nombre: (el.textContent ?? el.tagName).trim().slice(0, 40), visible, tapado };
    });
    if (!r) continue;
    if (!r.visible) informe.falla(donde, `foco sin indicador visible en "${r.nombre}"`);
    if (r.tapado) informe.falla(donde, `foco tapado por otro elemento en "${r.nombre}"`);
  }
}

async function revisarMenu({ page, url, informe }) {
  const donde = "menú @390";
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url, { waitUntil: "networkidle" });
  const boton = page.locator("[data-mk-menu]");
  if (!(await boton.isVisible())) return informe.falla(donde, "no hay botón de menú visible");
  await boton.click();
  const abierto = await page.evaluate(() => document.querySelector("dialog")?.open === true);
  if (!abierto) return informe.falla(donde, "el menú no abre un <dialog> modal");
  if ((await boton.getAttribute("aria-expanded")) !== "true") informe.falla(donde, "aria-expanded no pasa a true");
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    const dentro = await page.evaluate(() => Boolean(document.activeElement?.closest("dialog")));
    if (!dentro) {
      informe.falla(donde, `el foco sale del menú abierto al Tab ${i + 1}`);
      break;
    }
  }
  await page.keyboard.press("Escape");
  const estado = await page.evaluate(() => ({
    abierto: document.querySelector("dialog")?.open === true,
    foco: document.activeElement?.hasAttribute("data-mk-menu") ?? false,
  }));
  if (estado.abierto) informe.falla(donde, "Escape no cierra el menú");
  if (!estado.foco) informe.falla(donde, "al cerrar, el foco no vuelve al botón del menú");
}

async function revisarCopiar({ page, origen, rutas, informe }) {
  await page.setViewportSize({ width: 1440, height: 900 });
  const base = new URL(origen + rutas[0]).pathname.replace(/\/$/, "");
  let probado = false;
  for (const ruta of rutas) {
    await page.goto(origen + ruta, { waitUntil: "networkidle" });
    const botones = page.locator("[data-mk-copiar]");
    if (!(await botones.count())) continue;
    const donde = `copiar ${ruta}`;
    const boton = botones.first();
    try {
      await page.waitForFunction(() => document.querySelector("[data-mk-copiar]")?.getAttribute("data-mk-valor"), null, { timeout: 5000 });
    } catch {
      informe.falla(donde, "la primera muestra nunca resolvió su valor");
      probado = true;
      break;
    }
    const valor = await boton.getAttribute("data-mk-valor");
    await page.evaluate(() => {
      window.__mkAnuncios = 0;
      const aviso = document.querySelector("[data-mk-aviso]");
      new MutationObserver(() => {
        if (aviso?.textContent?.trim()) window.__mkAnuncios++;
      }).observe(aviso, { childList: true, subtree: true, characterData: true });
    });
    for (let i = 0; i < 2; i++) {
      await boton.click();
      await page.waitForTimeout(250);
    }
    const copiado = await page.evaluate(() => navigator.clipboard.readText());
    if (copiado !== valor) informe.falla(donde, `se copió "${copiado}" y la muestra dice "${valor}"`);
    const anuncios = await page.evaluate(() => window.__mkAnuncios);
    if (anuncios < 2) informe.falla(donde, `copiar dos veces se anunció ${anuncios} vez(ces): el lector no se entera`);
    probado = true;
    break;
  }
  if (!probado && rutas.includes(`${base}/color`)) informe.falla("copiar", "la sección de color no tiene muestras para copiar");
}

async function revisarDescargas({ page, origen, rutas, informe }) {
  await page.setViewportSize({ width: 1440, height: 900 });
  let total = 0;
  for (const ruta of rutas) {
    await page.goto(origen + ruta, { waitUntil: "networkidle" });
    const botones = page.locator("[data-mk-descarga]");
    const n = await botones.count();
    for (let i = 0; i < n; i++) {
      const boton = botones.nth(i);
      const tipo = await boton.getAttribute("data-mk-tipo");
      const esperado = await boton.getAttribute("data-mk-archivo");
      const donde = `descarga ${esperado}`;
      try {
        // Otra descarga en curso deja los botones en aria-disabled y el clic no hace nada.
        await page.waitForFunction(() => !document.querySelector('[data-mk-descarga][aria-disabled="true"]'), null, { timeout: 20000 });
        const intentar = () => Promise.all([page.waitForEvent("download", { timeout: 15000 }), boton.click()]);
        const [descarga] = await intentar().catch(intentar);
        const stream = await descarga.createReadStream();
        const partes = [];
        for await (const p of stream) partes.push(p);
        const motivo = validarArchivo(tipo, Buffer.concat(partes));
        if (motivo) informe.falla(donde, motivo);
        if (descarga.suggestedFilename() !== esperado) {
          informe.falla(donde, `el archivo se llama ${descarga.suggestedFilename()}`);
        }
        const foco = await page.evaluate(() => document.activeElement?.hasAttribute("data-mk-descarga") ?? false);
        if (!foco) informe.falla(donde, "el foco se pierde al descargar");
        total++;
      } catch (e) {
        informe.falla(donde, `no se descargó (${e.message.split("\n")[0]})`);
      }
    }
  }
  return total;
}

async function revisarZipALaVista({ page, origen, rutas, informe }) {
  const base = new URL(origen + rutas[0]).pathname.replace(/\/$/, "");
  if (!rutas.includes(`${base}/logo`)) return;
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto(`${origen}${base}/logo`, { waitUntil: "networkidle" });
    const caja = await page.locator("[data-mk-tipo='zip']").first().boundingBox();
    if (!caja) informe.falla(`descargas @${w}`, "la página de logo no tiene ZIP");
    else if (caja.y + caja.height > 2 * h) informe.falla(`descargas @${w}`, `el ZIP aparece a ${Math.round(caja.y)} px: tiene que estar en las dos primeras pantallas`);
  }
}

async function revisarAtajos({ page, url, informe }) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: "networkidle" });
  const hrefs = await page.$$eval("[data-mk-atajo]", (as) => as.map((a) => a.getAttribute("href")));
  for (const href of hrefs) {
    const destino = new URL(href, url);
    const res = await page.goto(destino.href, { waitUntil: "networkidle" });
    if (res?.status() !== 200) informe.falla("atajos", `${href} respondió ${res?.status()}`);
    else if (destino.hash && !(await page.locator(destino.hash).count())) informe.falla("atajos", `${href}: la página no tiene ${destino.hash}`);
  }
}

export async function revisar({ url, anchos = [320, 390, 1440], prohibidos = [] }) {
  const pw = await cargar("playwright");
  const chromium = pw.chromium ?? pw.default?.chromium;
  const axe = await cargar("@axe-core/playwright");
  const AxeBuilder = axe.AxeBuilder ?? axe.default?.default ?? axe.default;
  const informe = crearInforme();
  const origen = new URL(url).origin;
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({ acceptDownloads: true, permissions: ["clipboard-read", "clipboard-write"] });
  const page = await contexto.newPage();
  try {
    const rutas = await rutasDelPortal(page, url);
    if (rutas.length < 2) informe.falla("navegación", "no se encontraron secciones en [data-mk-nav]");
    for (const ruta of rutas) {
      for (const ancho of anchos) {
        await revisarPagina({ page, AxeBuilder, origen, ruta, ancho, informe, prohibidos });
      }
    }
    const inexistente = `${new URL(url).pathname.replace(/\/$/, "")}/no-existe-${Date.now()}`;
    const r404 = await page.goto(origen + inexistente);
    if (r404?.status() !== 404) informe.falla("404", `${inexistente} respondió ${r404?.status()}`);
    if (!(await page.locator("[data-mk-nav]").count())) informe.falla("404", "la página 404 no tiene la navegación del portal");

    await revisarTeclado({ page, url, informe });
    await revisarMenu({ page, url, informe });
    await revisarCopiar({ page, origen, rutas, informe });
    const descargas = await revisarDescargas({ page, origen, rutas, informe });
    await revisarZipALaVista({ page, origen, rutas, informe });
    await revisarAtajos({ page, url, informe });
    const base = new URL(url).pathname.replace(/\/$/, "");
    if (rutas.includes(`${base}/logo`) && descargas === 0) informe.falla("descargas", "la sección de logo no ofrece ninguna descarga");
    return { rutas, descargas, ...informe };
  } finally {
    await navegador.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  const args = process.argv.slice(2);
  const valor = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : undefined);
  const url = valor("--url");
  if (!url) {
    console.log("Uso: marca-revisar --url http://localhost:3101/marca [--anchos 320,390,1440] [--prohibidos a,b]");
    process.exit(2);
  }
  const res = await revisar({
    url,
    anchos: valor("--anchos")?.split(",").map(Number) ?? undefined,
    prohibidos: valor("--prohibidos")?.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean) ?? [],
  });
  console.log(`Rutas: ${res.rutas.join(", ")}`);
  console.log(`Descargas probadas: ${res.descargas}`);
  for (const a of res.avisos) console.log(`  ! ${a}`);
  for (const f of res.fallas) console.log(`  ✗ ${f}`);
  console.log(res.fallas.length ? `\n${res.fallas.length} falla(s).` : "\nPortal en verde.");
  process.exit(res.fallas.length ? 1 : 0);
}
