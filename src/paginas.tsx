import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  hrefDe,
  seccionDe,
  type LogoConfig,
  type MarcaConfig,
  type Seccion,
  type Atajo,
  type UsoIncorrecto,
  type VersionLogo,
} from "./config.js";
import { DescargasVersion, PanelDescargas } from "./descargas.js";
import { Icono } from "./iconos.js";
import { columnas } from "./rejilla.js";
import { slugDe } from "./rutas.js";
import { Escala, Especimen, Muestra, ParContraste, Rampa } from "./vivo.js";

/* ───────────── bloques ───────────── */

const ESTADOS = { vigente: "Vigente", borrador: "Borrador", "en-revision": "En revisión" } as const;

/** "Vigente · Actualizado el 15 de noviembre de 2026", si la configuración lo trae. */
export function EstadoPortal({ config }: { config: MarcaConfig }) {
  const partes: string[] = [];
  if (config.estado) partes.push(ESTADOS[config.estado]);
  if (config.actualizado) {
    const [a, m, d] = config.actualizado.split("-").map(Number);
    const fecha = new Date(Date.UTC(a ?? 2000, (m ?? 1) - 1, d ?? 1)).toLocaleDateString("es", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    partes.push(`Actualizado el ${fecha}`);
  }
  if (!partes.length) return null;
  return (
    <p className="mk-estado" data-estado={config.estado}>
      {partes.join(" · ")}
    </p>
  );
}

function Rejilla({ n, max = 4, className, children }: { n: number; max?: number; className?: string; children: ReactNode }) {
  const estilo = { "--mk-cols": columnas(n, max), "--mk-cols-md": columnas(n, 2) } as Record<string, number>;
  return (
    <div className={className ? `mk-rejilla ${className}` : "mk-rejilla"} style={estilo} data-mk-rejilla>
      {children}
    </div>
  );
}

export function Encabezado({
  antetitulo,
  titulo,
  children,
  config,
}: {
  antetitulo: string;
  titulo: string;
  children?: ReactNode;
  config?: MarcaConfig;
}) {
  return (
    <header className="mk-encabezado">
      {config ? <EstadoPortal config={config} /> : null}
      <p className="mk-antetitulo">{antetitulo}</p>
      <h1 className="mk-titulo">{titulo}</h1>
      {children ? <div className="mk-bajada">{children}</div> : null}
    </header>
  );
}

export function Bloque({
  id,
  titulo,
  antetitulo,
  bajada,
  children,
}: {
  id: string;
  titulo: string;
  antetitulo?: string;
  bajada?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mk-bloque" aria-labelledby={`${id}-titulo`} data-toc={titulo}>
      {antetitulo ? <p className="mk-antetitulo">{antetitulo}</p> : null}
      <h2 id={`${id}-titulo`} className="mk-bloque-titulo">
        {titulo}
      </h2>
      {bajada ? <p className="mk-bloque-bajada">{bajada}</p> : null}
      {children}
    </section>
  );
}

/** "Si dudás, usá esto": la decisión por defecto, arriba de las reglas. */
function SiDudas({ texto, children }: { texto: string; children?: ReactNode }) {
  return (
    <section id="si-dudas" className="mk-si-dudas" aria-labelledby="si-dudas-titulo" data-toc="Si dudás">
      <div className="mk-si-dudas-texto">
        <h2 id="si-dudas-titulo" className="mk-si-dudas-titulo">
          Si dudás
        </h2>
        <p>{texto}</p>
      </div>
      {children}
    </section>
  );
}

function Tarjeta({
  href,
  titulo,
  children,
  pendiente = false,
  icono,
  atajo = false,
}: {
  href: string;
  titulo: string;
  children: ReactNode;
  pendiente?: boolean;
  icono?: Atajo["icono"];
  atajo?: boolean;
}) {
  return (
    <Link href={href} className="mk-tarjeta" data-mk-atajo={atajo ? "" : undefined}>
      {icono ? (
        <span className="mk-tarjeta-icono">
          <Icono nombre={icono} />
        </span>
      ) : null}
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
  const candidatos: (Atajo | false | undefined)[] = [
    lista("logo") && { href: `${hrefDe(config, "logo")}#descargas`, titulo: "Descargar el logo", texto: "SVG, PNG y un ZIP con todas las versiones.", icono: "descargar" as const },
    lista("color") && {
      href: `${hrefDe(config, "color")}#oficiales`,
      titulo: "Copiar un color",
      texto: config.color?.oficiales.some((o) => o.cmyk) ? "Valores en HEX, RGB y CMYK, listos para pegar." : "Valores en HEX y RGB, listos para pegar.",
      icono: "copiar" as const,
    },
    lista("tipografia") && { href: hrefDe(config, "tipografia"), titulo: "Ver la tipografía", texto: "Familias, pesos y jerarquía.", icono: "tipografia" as const },
    lista("sistema") && { href: hrefDe(config, "sistema"), titulo: "Usar el sistema", texto: "Tokens y componentes como los pinta el sitio.", icono: "sistema" as const },
  ];
  const generados = candidatos.filter((t): t is Atajo => Boolean(t));
  const tareas: Atajo[] = config.inicio?.atajos === false ? [] : (config.inicio?.atajos ?? generados);
  const enc = config.inicio?.encabezado;
  const bajadaInicio = enc?.bajada ?? `Todo lo necesario para aplicar la marca ${config.marca}: lineamientos, archivos y el sistema de diseño en uso.`;
  const bAtajos = config.inicio?.bloques?.atajos;
  const bSecciones = config.inicio?.bloques?.secciones;
  return (
    <>
      {config.portada ? (
        <header className="mk-portada" style={{ background: `var(${config.portada.fondo})` }}>
          <div className="mk-portada-texto">
            <EstadoPortal config={config} />
            <p className="mk-antetitulo">{enc?.antetitulo ?? `Versión ${config.version}`}</p>
            <h1 className="mk-titulo">{enc?.titulo ?? config.nombre}</h1>
            <p className="mk-portada-bajada">{bajadaInicio}</p>
            {config.portada.accion ? (
              <p className="mk-portada-accion">
                <Link className="mk-boton mk-boton-fantasma mk-boton-brillo" href={config.portada.accion.href}>
                  {config.portada.accion.texto}
                </Link>
              </p>
            ) : null}
          </div>
          <img className="mk-portada-logo" src={config.portada.logo} alt={config.portada.alt ?? config.marca} />
        </header>
      ) : (
        <Encabezado antetitulo={enc?.antetitulo ?? `Versión ${config.version}`} titulo={enc?.titulo ?? config.nombre} config={config}>
          <p>{bajadaInicio}</p>
        </Encabezado>
      )}
      {tareas.length ? (
        <Bloque id="tareas" titulo={bAtajos?.titulo ?? "Lo más usado"} antetitulo={bAtajos?.antetitulo} bajada={bAtajos?.bajada}>
          <Rejilla n={tareas.length}>
            {tareas.map((t) => (
              <Tarjeta key={t.href} href={t.href} titulo={t.titulo} icono={t.icono} atajo>
                {t.texto}
              </Tarjeta>
            ))}
          </Rejilla>
        </Bloque>
      ) : null}
      <Bloque id="secciones" titulo={bSecciones?.titulo ?? "Secciones"} antetitulo={bSecciones?.antetitulo} bajada={bSecciones?.bajada}>
        <Rejilla n={config.secciones.length}>
          {config.secciones.map((s) => (
            <Tarjeta key={s.slug} href={hrefDe(config, s.slug)} titulo={s.titulo} pendiente={s.estado === "pendiente"}>
              {s.resumen}
            </Tarjeta>
          ))}
        </Rejilla>
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
  const porDefecto = logo.versiones.find((v) => v.id === logo.porDefecto) ?? (seccion.siDudas ? principal : undefined);
  const incorrectos = logo.incorrectos ?? (Object.keys(INCORRECTOS) as UsoIncorrecto[]);
  const medida = (v: string, unidad: "px" | "cm") => {
    const limpio = v.replace(/\s/g, "").replace(",", ".");
    return new RegExp(`^\\d+(\\.\\d+)?${unidad}$`).test(limpio) ? limpio : undefined;
  };
  const anchoMinimo = medida(logo.minimo.digital, "px");
  const anchoImpreso = medida(logo.minimo.impreso, "cm");
  const fondos = Object.fromEntries(logo.versiones.map((v) => [v.id, lamina(v.fondo)]));
  return (
    <>
      <Encabezado antetitulo={seccion.grupo} titulo={seccion.titulo} config={config}>
        <p>{seccion.resumen}</p>
      </Encabezado>
      {seccion.siDudas ? (
        <SiDudas texto={seccion.siDudas}>
          {porDefecto ? (
            <figure className="mk-logo mk-si-dudas-logo">
              <div className="mk-logo-lamina" {...lamina(porDefecto.fondo)}>
                <img src={porDefecto.svg} alt={`${config.marca}: ${porDefecto.nombre}`} />
              </div>
              <figcaption>
                <strong>{porDefecto.nombre}</strong>
                <DescargasVersion version={porDefecto} archivo={config.archivo} />
              </figcaption>
            </figure>
          ) : null}
        </SiDudas>
      ) : null}
      <Bloque id="descargas" titulo="Descargas">
        <PanelDescargas
          versiones={logo.versiones}
          archivo={config.archivo}
          marca={config.marca}
          version={config.version}
          fondos={fondos}
          leeme={`Usá el SVG siempre que se pueda. Respetá el área de respeto (${logo.respeto.medida}) y el tamaño mínimo (${logo.minimo.digital} en pantalla, ${logo.minimo.impreso} impreso).`}
        />
      </Bloque>
      <Bloque id="versiones" titulo="Versiones">
        <Rejilla n={logo.versiones.length} max={3}>
          {logo.versiones.map((v) => (
            <figure key={v.id} className="mk-logo">
              <div className="mk-logo-lamina" {...lamina(v.fondo)}>
                <img src={v.svg} alt={`${config.marca}: ${v.nombre}`} />
              </div>
              <figcaption>
                <strong>
                  {v.nombre}
                  {porDefecto && v.id === porDefecto.id ? <span className="mk-etiqueta">Por defecto</span> : null}
                </strong>
                <span>{v.uso}</span>
              </figcaption>
            </figure>
          ))}
        </Rejilla>
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
            <Rejilla n={2} max={2}>
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
                <span>En impresión, de ancho. En pantalla, a escala aproximada.</span>
                {anchoImpreso ? (
                  <span className="mk-minimo" {...lamina(principal.fondo)}>
                    <img src={principal.svg} alt={`${config.marca} a ${logo.minimo.impreso}, a escala aproximada`} style={{ width: anchoImpreso }} />
                  </span>
                ) : null}
              </div>
            </Rejilla>
          </Bloque>
          <Bloque id="incorrectos" titulo="Usos incorrectos">
            <Rejilla n={incorrectos.length} max={3}>
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
                    {logo.porque?.[id] ? <span className="mk-porque">{logo.porque[id]}</span> : null}
                  </figcaption>
                </figure>
              ))}
            </Rejilla>
          </Bloque>
        </>
      ) : null}
    </>
  );
}

function PaginaColor({ config, seccion }: { config: MarcaConfig; seccion: Seccion }) {
  const color = config.color!;
  return (
    <>
      <Encabezado antetitulo={seccion.grupo} titulo={seccion.titulo} config={config}>
        <p>{seccion.resumen} Hacé clic en una muestra para copiar su valor.</p>
      </Encabezado>
      {seccion.siDudas ? <SiDudas texto={seccion.siDudas} /> : null}
      <Bloque id="oficiales" titulo="Colores oficiales">
        <Rejilla n={color.oficiales.length} max={4} className="mk-rejilla-muestras">
          {color.oficiales.map((c) => (
            <Muestra key={c.token} {...c} />
          ))}
        </Rejilla>
      </Bloque>
      {color.pares?.length ? (
        <Bloque id="combinaciones" titulo="Combinaciones con texto">
          <p>Medidas sobre el CSS que carga este sitio. Texto: 4,5:1 como mínimo; texto grande e indicadores: 3:1.</p>
          <Rejilla n={color.pares.length} max={4}>
            {color.pares.map((p) => (
              <ParContraste key={`${p.texto}-${p.fondo}`} {...p} />
            ))}
          </Rejilla>
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
      <Encabezado antetitulo={seccion.grupo} titulo={seccion.titulo} config={config}>
        <p>{seccion.resumen}</p>
      </Encabezado>
      {seccion.siDudas ? <SiDudas texto={seccion.siDudas} /> : null}
      <Bloque id="familias" titulo="Familias">
        <Rejilla n={tipo.familias.length} max={3}>
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
        </Rejilla>
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
      <Encabezado antetitulo={seccion.grupo} titulo={seccion.titulo} config={config}>
        <p>{seccion.resumen} Todo se lee del CSS que carga el sitio.</p>
      </Encabezado>
      {seccion.siDudas ? <SiDudas texto={seccion.siDudas} /> : null}
      <Bloque id="componentes" titulo="Componentes y estados">
        <div className="mk-componentes">
          <div className="mk-fila">
            <button type="button" className="mk-boton">
              Acción principal
            </button>
            <button type="button" className="mk-boton mk-boton-secundario">
              Acción secundaria
            </button>
            <button type="button" className="mk-boton mk-boton-fantasma">
              Sin relleno
            </button>
            <a className="mk-enlace" href="#componentes">
              Enlace de texto
            </a>
          </div>
          <div className="mk-fila mk-banda-inversa">
            <button type="button" className="mk-boton mk-boton-fantasma mk-boton-brillo">
              Con brillo
            </button>
            <span>Sin relleno y con brillo: uno solo por vista, sobre un fondo oscuro o de marca.</span>
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
