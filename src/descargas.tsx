"use client";

import { useState } from "react";
import type { VersionLogo } from "./config.js";
import { fetchText, medidasSvg, rasterize } from "./raster.js";
import { saveBlob } from "./save.js";
import { avisar } from "./vivo.js";
import { makeZip, type ZipEntry } from "./zip.js";

/**
 * Descargas del logo, generadas en el navegador desde los SVG originales que
 * publica el sitio. No hay PNG ni ZIP precocinados que se queden viejos.
 */

const ANCHOS_PNG = [1200, 2400] as const;

type Tarea = () => Promise<void>;

function useTarea() {
  const [ocupado, setOcupado] = useState<string | null>(null);
  async function correr(id: string, nombre: string, tarea: Tarea) {
    if (ocupado) return;
    setOcupado(id);
    avisar(`Preparando ${nombre}…`);
    try {
      await tarea();
      avisar(`Descargado: ${nombre}`);
    } catch {
      avisar(`No se pudo preparar ${nombre}.`);
    } finally {
      setOcupado(null);
    }
  }
  return { ocupado, correr };
}

function BotonDescarga({
  id,
  tipo,
  nombre,
  ocupado,
  onClick,
  children,
  principal = false,
}: {
  id: string;
  tipo: "svg" | "png" | "zip";
  nombre: string;
  ocupado: string | null;
  onClick: () => void;
  children: string;
  principal?: boolean;
}) {
  const este = ocupado === id;
  return (
    <button
      type="button"
      className={principal ? "mk-boton" : "mk-boton mk-boton-secundario"}
      aria-disabled={ocupado ? true : undefined}
      onClick={onClick}
      data-mk-descarga
      data-mk-tipo={tipo}
      data-mk-archivo={nombre}
    >
      {este ? `Preparando ${children}…` : children}
    </button>
  );
}

const png = async (svg: string, ancho: number) => rasterize(svg, medidasSvg(svg), ancho);

export function DescargasVersion({ version, archivo }: { version: VersionLogo; archivo: string }) {
  const { ocupado, correr } = useTarea();
  const base = `${archivo}-logo-${version.id}`;
  return (
    <div className="mk-descargas" role="group" aria-label={`Descargas: ${version.nombre}`}>
      <BotonDescarga
        id="svg"
        tipo="svg"
        nombre={`${base}.svg`}
        ocupado={ocupado}
        onClick={() =>
          correr("svg", `${base}.svg`, async () => {
            const svg = await fetchText(version.svg);
            saveBlob(new Blob([svg], { type: "image/svg+xml" }), `${base}.svg`);
          })
        }
      >
        SVG
      </BotonDescarga>
      {ANCHOS_PNG.map((ancho) => (
        <BotonDescarga
          key={ancho}
          id={`png-${ancho}`}
          tipo="png"
          nombre={`${base}-${ancho}.png`}
          ocupado={ocupado}
          onClick={() =>
            correr(`png-${ancho}`, `${base}-${ancho}.png`, async () => {
              saveBlob(await png(await fetchText(version.svg), ancho), `${base}-${ancho}.png`);
            })
          }
        >
          {`PNG ${ancho} px`}
        </BotonDescarga>
      ))}
    </div>
  );
}

export function DescargaZip({
  versiones,
  archivo,
  marca,
  version,
  leeme,
}: {
  versiones: VersionLogo[];
  archivo: string;
  marca: string;
  version: string;
  leeme: string;
}) {
  const { ocupado, correr } = useTarea();
  const nombre = `${archivo}-logos.zip`;
  return (
    <BotonDescarga
      id="zip"
      tipo="zip"
      nombre={nombre}
      ocupado={ocupado}
      principal
      onClick={() =>
        correr("zip", nombre, async () => {
          const enc = new TextEncoder();
          const entradas: ZipEntry[] = [];
          for (const v of versiones) {
            const svg = await fetchText(v.svg);
            entradas.push({ name: `svg/${archivo}-logo-${v.id}.svg`, data: enc.encode(svg) });
            const blob = await png(svg, 2400);
            entradas.push({ name: `png/${archivo}-logo-${v.id}-2400.png`, data: new Uint8Array(await blob.arrayBuffer()) });
          }
          entradas.unshift({
            name: "LEEME.txt",
            data: enc.encode(`${marca} · logos · versión ${version}\n\n${leeme}\n`),
          });
          saveBlob(makeZip(entradas), nombre);
        })
      }
    >
      {`Descargar todo (.zip)`}
    </BotonDescarga>
  );
}
