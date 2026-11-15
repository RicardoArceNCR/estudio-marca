#!/usr/bin/env node
// El paquete no puede traer datos de ningún cliente (ADR 0011 del estudio):
//   1. ningún término de prohibidos.json en src/, dist/, portal.css, suite/ ni README;
//   2. ningún hex en src/ ni portal.css: todo color entra como token;
//   3. `npm pack` publica solo dist (.js, .d.ts), portal.css, suite y README.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { terminos } = JSON.parse(readFileSync(path.join(RAIZ, "scripts/prohibidos.json"), "utf8"));

function archivos(ruta) {
  const abs = path.join(RAIZ, ruta);
  if (!existsSync(abs)) return [];
  if (statSync(abs).isFile()) return [abs];
  return readdirSync(abs, { recursive: true }).map((f) => path.join(abs, f)).filter((f) => statSync(f).isFile());
}

export function buscarProhibidos(texto, lista = terminos) {
  const bajo = texto.toLowerCase();
  return lista.filter((t) => new RegExp(`(^|[^a-z])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(bajo));
}

export function buscarHex(texto) {
  return [...texto.matchAll(/(?<![\w&-])#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
}

const PERMITIDOS_EN_PAQUETE = /^(package\.json|README\.md|portal\.css|suite\/[\w-]+\.mjs|dist\/[\w-]+\.(js|d\.ts))$/;

export function revisar() {
  const fallas = [];
  for (const f of ["src", "dist", "portal.css", "suite", "README.md"].flatMap(archivos)) {
    const texto = readFileSync(f, "utf8");
    const rel = path.relative(RAIZ, f);
    for (const t of buscarProhibidos(texto)) fallas.push(`${rel}: nombra "${t}"`);
    if (rel.startsWith("src") || rel === "portal.css") {
      for (const h of buscarHex(texto)) fallas.push(`${rel}: hex ${h} (los colores entran como token)`);
    }
  }
  const pack = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], { cwd: RAIZ, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
  for (const { path: p } of pack[0].files) {
    if (!PERMITIDOS_EN_PAQUETE.test(p)) fallas.push(`el paquete publicaría ${p}`);
  }
  return fallas;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const fallas = revisar();
  for (const f of fallas) console.log(`✗ ${f}`);
  console.log(fallas.length ? `\n${fallas.length} falla(s).` : "Sin datos de clientes.");
  process.exit(fallas.length ? 1 : 0);
}
