#!/usr/bin/env node
// `dist` va commiteado: los sitios instalan el paquete desde el tag de git,
// sin compilar. Este control compila a una carpeta aparte y falla si `dist`
// no coincide con lo que sale de `src`. Corre en `npm run verify`.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fresco = mkdtempSync(path.join(tmpdir(), "marca-dist-"));
execFileSync(path.join(RAIZ, "node_modules/.bin/tsc"), ["-p", "tsconfig.json", "--outDir", fresco], { cwd: RAIZ, stdio: "inherit" });

const dist = path.join(RAIZ, "dist");
const a = readdirSync(fresco).sort();
const b = readdirSync(dist).sort();
const distintos = [...new Set([...a, ...b])].filter((f) => {
  try {
    return readFileSync(path.join(fresco, f), "utf8") !== readFileSync(path.join(dist, f), "utf8");
  } catch {
    return true;
  }
});
if (distintos.length) {
  console.error(`dist no está al día con src: ${distintos.join(", ")}. Corré npm run build y commiteá dist.`);
  process.exit(1);
}
console.log("dist al día con src.");
