"use client";

import { useState } from "react";
import type { VersionLogo } from "./config.js";
import { fetchText, medidasSvg, rasterize } from "./raster.js";
import { saveBlob } from "./save.js";
import { columnas } from "./rejilla.js";
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
  etiqueta,
}: {
  id: string;
  tipo: "svg" | "png" | "zip";
  nombre: string;
  ocupado: string | null;
  onClick: () => void;
  children: string;
  principal?: boolean;
  /** Nombre accesible completo; empieza con el texto visible. */
  etiqueta?: string;
}) {
  const este = ocupado === id;
  return (
    <button
      type="button"
      className={principal ? "mk-boton" : "mk-boton mk-boton-secundario"}
      aria-label={etiqueta && !este ? etiqueta : undefined}
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
  const de = `de ${version.nombre}`;
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
        etiqueta={`SVG ${de}`}
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
          etiqueta={`PNG ${ancho} px ${de}`}
        >
          {`PNG ${ancho}`}
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

/**
 * Versiones y descargas: el ZIP arriba y, debajo, una galería con cada
 * versión grande sobre su fondo, para qué sirve y sus formatos a la vista.
 * Va arriba en Logo: es la tarea más común.
 */
export function PanelDescargas({
  versiones,
  archivo,
  marca,
  version,
  leeme,
  fondos,
  porDefecto,
}: {
  versiones: VersionLogo[];
  archivo: string;
  marca: string;
  version: string;
  leeme: string;
  /** Estilo de la lámina de cada versión (fondo claro, oscuro o token). */
  fondos: Record<string, { "data-fondo": string; style?: Record<string, string> }>;
  /** Id de la versión por defecto: lleva la etiqueta "Por defecto". */
  porDefecto?: string;
}) {
  // La versión por defecto ocupa su propia fila; el resto se reparte sin huérfanos.
  const destacada = versiones.some((v) => v.id === porDefecto);
  const n = versiones.length - (destacada ? 1 : 0);
  const estilo = { "--mk-cols": columnas(n, 3), "--mk-cols-md": columnas(n, 2) } as Record<string, number>;
  return (
    <div className="mk-panel-descargas">
      <div className="mk-panel-zip">
        <p className="mk-panel-zip-texto">
          Todas las versiones en SVG y en PNG de 2400 px, con un LEEME.
        </p>
        <DescargaZip versiones={versiones} archivo={archivo} marca={marca} version={version} leeme={leeme} />
      </div>
      <div className="mk-rejilla mk-galeria" style={estilo} data-mk-rejilla>
        {versiones.map((v) => (
          <figure
            key={v.id}
            id={`version-${v.id}`}
            className="mk-logo mk-galeria-item"
            data-mk-destacada={v.id === porDefecto ? "" : undefined}
          >
            <div className="mk-logo-lamina" {...fondos[v.id]}>
              <img src={v.svg} alt={`${marca}: ${v.nombre}`} />
            </div>
            <figcaption>
              <strong>
                {v.nombre}
                {v.id === porDefecto ? <span className="mk-etiqueta">Por defecto</span> : null}
              </strong>
              <span>{v.uso}</span>
              <DescargasVersion version={v} archivo={archivo} />
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
