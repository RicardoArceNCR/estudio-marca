import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  hrefDe,
  seccionDe,
  type LogoConfig,
  type MarcaConfig,
  type Seccion,
  type UsoIncorrecto,
  type VersionLogo,
} from "./config.js";
import { DescargaZip, DescargasVersion } from "./descargas.js";
import { slugDe } from "./rutas.js";
import { Escala, Especimen, Muestra, ParContraste, Rampa } from "./vivo.js";

/* ───────────── bloques ───────────── */

export function Encabezado({ antetitulo, titulo, children }: { antetitulo: string; titulo: string; children?: ReactNode }) {
  return (
    <header className="mk-encabezado">
      <p className="mk-antetitulo">{antetitulo}</p>
      <h1 className="mk-titulo">{titulo}</h1>
      {children ? <div className="mk-bajada">{children}</div> : null}
    </header>
  );
}

export function Bloque({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} className="mk-bloque" aria-labelledby={`${id}-titulo`}>
      <h2 id={`${id}-titulo`} className="mk-bloque-titulo">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Tarjeta({ href, titulo, children, pendiente = false }: { href: string; titulo: string; children: ReactNode; pendiente?: boolean }) {
  return (
    <Link href={href} className="mk-tarjeta">
      <span className="mk-tarjeta-titulo">
        {titulo}
        {pendiente ? <span className="mk-etiqueta">Próximamente</span> : null}
      </span>
      <span className="mk-tarjeta-texto">{children}</span>
    </Link>
  );
}

/* ───────────── páginas ───────────── */

function PaginaInicio({ config }: { config: MarcaConfig }) {
  const lista = (slug: string) => {
    const s = seccionDe(config, slug);
    return s && s.estado !== "pendiente" ? s : undefined;
  };
  const tareas = [
    lista("logo") && { href: `${hrefDe(config, "logo")}#descargas`, titulo: "Descargar el logo", texto: "SVG, PNG y un ZIP con todas las versiones." },
    lista("color") && { href: `${hrefDe(config, "color")}#oficiales`, titulo: "Copiar un color", texto: "Valores en HEX, RGB y CMYK, listos para pegar." },
    lista("tipografia") && { href: hrefDe(config, "tipografia"), titulo: "Ver la tipografía", texto: "Familias, pesos y jerarquía." },
    lista("sistema") && { href: hrefDe(config, "sistema"), titulo: "Usar el sistema", texto: "Tokens y componentes como los pinta el sitio." },
  ].filter((t): t is { href: string; titulo: string; texto: string } => Boolean(t));
  return (
    <>
      <Encabezado antetitulo={`Versión ${config.version}`} titulo={config.nombre}>
        <p>Todo lo necesario para aplicar la marca {config.marca}: lineamientos, archivos y el sistema de diseño en uso.</p>
      </Encabezado>
      {tareas.length ? (
        <Bloque id="tareas" titulo="Lo más usado">
          <div className="mk-rejilla">
            {tareas.map((t) => (
              <Tarjeta key={t.href} href={t.href} titulo={t.titulo}>
                {t.texto}
              </Tarjeta>
            ))}
          </div>
        </Bloque>
      ) : null}
      <Bloque id="secciones" titulo="Secciones">
        <div className="mk-rejilla">
          {config.secciones.map((s) => (
            <Tarjeta key={s.slug} href={hrefDe(config, s.slug)} titulo={s.titulo} pendiente={s.estado === "pendiente"}>
              {s.resumen}
            </Tarjeta>
          ))}
        </div>
      </Bloque>
    </>
  );
}

const INCORRECTOS: Record<UsoIncorrecto, { texto: string; clase: string }> = {
  estirar: { texto: "No lo estires ni lo deformes.", clase: "mk-mal-estirar" },
  rotar: { texto: "No lo rotes.", clase: "mk-mal-rotar" },
  recolorear: { texto: "No cambies sus colores.", clase: "mk-mal-recolorear" },
  sombra: { texto: "No le agregues sombras ni efectos.", clase: "mk-mal-sombra" },
  contorno: { texto: "No lo encierres en formas ni contornos.", clase: "mk-mal-contorno" },
  apretar: { texto: "No invadas su área de respeto.", clase: "mk-mal-apretar" },
};

/** Lámina del logo: fondo claro, oscuro o el color de marca que pide la versión. */
function lamina(fondo: VersionLogo["fondo"]) {
  return fondo.startsWith("--")
    ? { "data-fondo": "marca", style: { background: `var(${fondo})` } }
    : { "data-fondo": fondo };
}

function PaginaLogo({ config, logo, seccion }: { config: MarcaConfig; logo: LogoConfig; seccion: Seccion }) {
  const principal = logo.versiones[0];
  const incorrectos = logo.incorrectos ?? (Object.keys(INCORRECTOS) as UsoIncorrecto[]);
  const anchoMinimo = /^\d+(\.\d+)?px$/.test(logo.minimo.digital.replace(/\s/g, "")) ? logo.minimo.digital.replace(/\s/g, "") : undefined;
  return (
    <>
      <Encabezado antetitulo="Identidad" titulo={seccion.titulo}>
        <p>{seccion.resumen}</p>
      </Encabezado>
      <Bloque id="versiones" titulo="Versiones">
        <div className="mk-rejilla">
          {logo.versiones.map((v) => (
            <figure key={v.id} className="mk-logo">
              <div className="mk-logo-lamina" {...lamina(v.fondo)}>
                <img src={v.svg} alt={`${config.marca}: ${v.nombre}`} />
              </div>
              <figcaption>
                <strong>{v.nombre}</strong>
                <span>{v.uso}</span>
                <DescargasVersion version={v} archivo={config.archivo} />
              </figcaption>
            </figure>
          ))}
        </div>
      </Bloque>
      {principal ? (
        <>
          <Bloque id="respeto" titulo="Área de respeto">
            <div className="mk-columnas">
              <div className="mk-logo-lamina mk-respeto" {...lamina(principal.fondo)}>
                <img src={principal.svg} alt={`${config.marca} con su área de respeto marcada`} />
              </div>
              <div>
                <p className="mk-dato">{logo.respeto.medida}</p>
                <p>{logo.respeto.descripcion}</p>
              </div>
            </div>
          </Bloque>
          <Bloque id="minimo" titulo="Tamaño mínimo">
            <div className="mk-rejilla">
              <div className="mk-tarjeta mk-tarjeta-fija">
                <span className="mk-dato">{logo.minimo.digital}</span>
                <span>En pantalla, de ancho.</span>
                {anchoMinimo ? (
                  <span className="mk-minimo" {...lamina(principal.fondo)}>
                    <img src={principal.svg} alt={`${config.marca} a ${logo.minimo.digital}`} style={{ width: anchoMinimo }} />
                  </span>
                ) : null}
              </div>
              <div className="mk-tarjeta mk-tarjeta-fija">
                <span className="mk-dato">{logo.minimo.impreso}</span>
                <span>En impresión, de ancho.</span>
              </div>
            </div>
          </Bloque>
          <Bloque id="incorrectos" titulo="Usos incorrectos">
            <div className="mk-rejilla">
              {incorrectos.map((id) => (
                <figure key={id} className="mk-logo mk-incorrecto">
                  <div
                    {...lamina(principal.fondo)}
                    className={`mk-logo-lamina${id === "recolorear" ? ` ${INCORRECTOS[id].clase}` : ""}`}
                  >
                    <img
                      className={id === "recolorear" ? undefined : INCORRECTOS[id].clase}
                      src={principal.svg}
                      alt={`Ejemplo incorrecto: ${INCORRECTOS[id].texto}`}
                    />
                  </div>
                  <figcaption>
                    <span className="mk-no" aria-hidden="true">
                      ✕
                    </span>{" "}
                    {INCORRECTOS[id].texto}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Bloque>
        </>
      ) : null}
      <Bloque id="descargas" titulo="Descargas">
        <p>Los PNG se generan desde los SVG originales al momento de descargar. El ZIP trae todas las versiones en SVG y en PNG de 2400 px.</p>
        <DescargaZip
          versiones={logo.versiones}
          archivo={config.archivo}
          marca={config.marca}
          version={config.version}
          leeme={`Usá el SVG siempre que se pueda. Respetá el área de respeto (${logo.respeto.medida}) y el tamaño mínimo (${logo.minimo.digital} en pantalla, ${logo.minimo.impreso} impreso).`}
        />
      </Bloque>
    </>
  );
}

function PaginaColor({ config, seccion }: { config: MarcaConfig; seccion: Seccion }) {
  const color = config.color!;
  return (
    <>
      <Encabezado antetitulo="Identidad" titulo={seccion.titulo}>
        <p>{seccion.resumen} Hacé clic en una muestra para copiar su valor.</p>
      </Encabezado>
      <Bloque id="oficiales" titulo="Colores oficiales">
        <div className="mk-rejilla mk-rejilla-muestras">
          {color.oficiales.map((c) => (
            <Muestra key={c.token} {...c} />
          ))}
        </div>
      </Bloque>
      {color.pares?.length ? (
        <Bloque id="combinaciones" titulo="Combinaciones con texto">
          <p>Medidas sobre el CSS que carga este sitio. Texto: 4,5:1 como mínimo; texto grande e indicadores: 3:1.</p>
          <div className="mk-rejilla">
            {color.pares.map((p) => (
              <ParContraste key={`${p.texto}-${p.fondo}`} {...p} />
            ))}
          </div>
        </Bloque>
      ) : null}
      {color.rampas?.length ? (
        <Bloque id="rampas" titulo="Rampas">
          {color.rampas.map((r) => (
            <Rampa key={r.prefijo} {...r} />
          ))}
        </Bloque>
      ) : null}
    </>
  );
}

function PaginaTipografia({ config, seccion }: { config: MarcaConfig; seccion: Seccion }) {
  const tipo = config.tipografia!;
  return (
    <>
      <Encabezado antetitulo="Identidad" titulo={seccion.titulo}>
        <p>{seccion.resumen}</p>
      </Encabezado>
      <Bloque id="familias" titulo="Familias">
        <div className="mk-rejilla">
          {tipo.familias.map((f) => (
            <div key={f.token} className="mk-tarjeta mk-tarjeta-fija">
              <span className="mk-familia" style={{ fontFamily: `var(${f.token})` }}>
                {f.nombre}
              </span>
              <span>{f.rol}</span>
              <ul className="mk-pesos">
                {f.pesos.map((p) => (
                  <li key={p} style={{ fontFamily: `var(${f.token})`, fontWeight: p }}>
                    {p} · Aa Bb Cc 123
                  </li>
                ))}
              </ul>
              <span className="mk-fuente">Licencia: {f.licencia}</span>
              <code>{f.token}</code>
            </div>
          ))}
        </div>
      </Bloque>
      {tipo.estilos?.length ? (
        <Bloque id="jerarquia" titulo="Jerarquía">
          {tipo.estilos.map((e) => (
            <Especimen key={e.nombre} {...e}>
              {tipo.muestra}
            </Especimen>
          ))}
        </Bloque>
      ) : null}
    </>
  );
}

function PaginaSistema({ config, seccion }: { config: MarcaConfig; seccion: Seccion }) {
  const s = config.sistema!;
  return (
    <>
      <Encabezado antetitulo="Diseño y desarrollo" titulo={seccion.titulo}>
        <p>{seccion.resumen} Todo se lee del CSS que carga el sitio.</p>
      </Encabezado>
      <Bloque id="componentes" titulo="Componentes y estados">
        <div className="mk-componentes">
          <div className="mk-fila">
            <button type="button" className="mk-boton">
              Acción principal
            </button>
            <button type="button" className="mk-boton mk-boton-secundario">
              Acción secundaria
            </button>
            <a className="mk-enlace" href="#componentes">
              Enlace de texto
            </a>
          </div>
          <div className="mk-campo">
            <label htmlFor="mk-campo-ejemplo">Correo</label>
            <input id="mk-campo-ejemplo" type="email" defaultValue="nombre@" aria-invalid="true" aria-describedby="mk-campo-error" />
            <p id="mk-campo-error" className="mk-campo-error">
              <span aria-hidden="true">!</span> Falta el dominio del correo.
            </p>
          </div>
        </div>
      </Bloque>
      {s.espaciado?.length ? (
        <Bloque id="espaciado" titulo="Espaciado">
          <Escala tipo="espaciado" tokens={s.espaciado} />
        </Bloque>
      ) : null}
      {s.radios?.length ? (
        <Bloque id="radios" titulo="Radios">
          <Escala tipo="radio" tokens={s.radios} />
        </Bloque>
      ) : null}
      {s.sombras?.length ? (
        <Bloque id="sombras" titulo="Sombras">
          <Escala tipo="sombra" tokens={s.sombras} />
        </Bloque>
      ) : null}
    </>
  );
}

function PaginaPendiente({ seccion }: { seccion: Seccion }) {
  const p = seccion.pendiente!;
  return (
    <>
      <Encabezado antetitulo="Próximamente" titulo={seccion.titulo}>
        <p>{seccion.resumen}</p>
      </Encabezado>
      <Bloque id="estado" titulo="Qué falta">
        <dl className="mk-pendiente">
          <dt>Falta</dt>
          <dd>{p.falta}</dd>
          <dt>Responsable</dt>
          <dd>{p.responsable}</dd>
          <dt>Fecha comprometida</dt>
          <dd>{p.fecha}</dd>
        </dl>
      </Bloque>
    </>
  );
}

/* ───────────── rutas ───────────── */

/**
 * Página del portal para una ruta comodín opcional (`app/marca/[[...slug]]`).
 * Pinta inicio, las secciones del paquete y las pendientes; cualquier otra
 * ruta da 404. Una sección propia del sitio va en una ruta explícita.
 */
export function MarcaPagina({ config, slug }: { config: MarcaConfig; slug?: string[] | string }) {
  const s = slugDe(slug);
  if (s === "") return <PaginaInicio config={config} />;
  const seccion = s ? seccionDe(config, s) : undefined;
  if (!seccion) notFound();
  if (seccion.estado === "pendiente") return <PaginaPendiente seccion={seccion} />;
  switch (seccion.slug) {
    case "logo":
      return <PaginaLogo config={config} logo={config.logo!} seccion={seccion} />;
    case "color":
      return <PaginaColor config={config} seccion={seccion} />;
    case "tipografia":
      return <PaginaTipografia config={config} seccion={seccion} />;
    case "sistema":
      return <PaginaSistema config={config} seccion={seccion} />;
    default:
      notFound();
  }
}

export function MarcaNoEncontrada({ config }: { config: MarcaConfig }) {
  return (
    <>
      <Encabezado antetitulo="Error 404" titulo="Esta página no existe">
        <p>Puede que la sección haya cambiado de nombre o todavía no esté publicada.</p>
      </Encabezado>
      <p>
        <Link className="mk-boton" href={hrefDe(config)}>
          Volver al inicio de {config.nombre}
        </Link>
      </p>
    </>
  );
}
