#!/usr/bin/env node
// Construye el paquete, lo instala como lo instalaría un sitio (tarball, no
// enlace), arma el "Cliente de prueba" desde cero y corre la revisión en
// navegador. Es el gate de un release.
import { execFileSync, spawn } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PRUEBA = path.join(RAIZ, "prueba");
const PUERTO = process.env.PUERTO ?? "3107";
const { version } = JSON.parse(readFileSync(path.join(RAIZ, "package.json"), "utf8"));
const { terminos } = JSON.parse(readFileSync(path.join(RAIZ, "scripts/prohibidos.json"), "utf8"));

const correr = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: "inherit" });

correr("npm", ["run", "build"], RAIZ);
correr("npm", ["pack", "--silent"], RAIZ);
const tgz = path.join(RAIZ, `estudio-marca-${version}.tgz`);
correr("npm", ["install", "--no-audit", "--no-fund", "--no-save", tgz], PRUEBA);
// Sin caché: Next reusa el paquete viejo si la versión no cambió.
rmSync(path.join(PRUEBA, ".next"), { recursive: true, force: true });
correr("npx", ["next", "build"], PRUEBA);

const servidor = spawn("npx", ["next", "start", "-p", PUERTO], { cwd: PRUEBA, stdio: "ignore", detached: true });
let codigo = 1;
try {
  const url = `http://localhost:${PUERTO}/marca`;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(url)).ok) break;
    } catch {
      /* todavía no */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  try {
    correr("node", [path.join(RAIZ, "suite/revisar.mjs"), "--url", url, "--prohibidos", terminos.join(",")], PRUEBA);
    codigo = 0;
  } catch {
    codigo = 1;
  }
} finally {
  process.kill(-servidor.pid);
  rmSync(tgz, { force: true });
}
process.exit(codigo);
