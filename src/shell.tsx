"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { baseDe, gruposDe, hrefDe, type Ayuda, type MarcaConfig } from "./config.js";
import { enfocarSeccion, useIndice, type Indice } from "./toc.js";
import { Aviso } from "./vivo.js";

/**
 * Marco del portal: salto al contenido, navegación lateral en escritorio,
 * menú modal en móvil, índice de la página y región de avisos. La navegación
 * sale de `config.secciones`: una sección nueva aparece sola en los dos
 * lugares.
 */
export function MarcaShell({
  config,
  children,
  salir,
}: {
  config: MarcaConfig;
  children: ReactNode;
  /** Solo si el sitio pone el portal detrás de un ingreso. */
  salir?: () => void | Promise<void>;
}) {
  const pathname = usePathname() ?? "";
  const { indice, actual } = useIndice(pathname);
  const dialogo = useRef<HTMLDialogElement>(null);
  const botonMenu = useRef<HTMLButtonElement>(null);
  const [abierto, setAbierto] = useState(false);

  const cerrar = () => dialogo.current?.close();
  useEffect(cerrar, [pathname]);

  return (
    <div className="mk-portal">
      <a className="mk-saltar" href="#contenido">
        Saltar al contenido
      </a>
      <header className="mk-cabecera">
        <Link
          href={baseDe(config)}
          className="mk-marca"
          aria-label={config.cabecera?.texto ? config.nombre : undefined}
        >
          {config.cabecera ? (
            <span className="mk-marca-insignia" style={{ background: `var(${config.cabecera.fondo})` }} aria-hidden="true">
              <img src={config.cabecera.logo} alt="" />
            </span>
          ) : null}
          <span className="mk-marca-nombre">{config.cabecera?.texto ?? config.nombre}</span>
        </Link>
        <button
          ref={botonMenu}
          type="button"
          className="mk-menu-boton"
          aria-haspopup="dialog"
          aria-expanded={abierto}
          aria-controls="mk-menu"
          data-mk-menu
          onClick={() => {
            dialogo.current?.showModal();
            setAbierto(true);
          }}
        >
          Menú
        </button>
      </header>

      <div className="mk-cuerpo">
        <aside className="mk-lateral" aria-label={config.nombre}>
          <nav aria-label="Secciones del portal" data-mk-nav>
            <Navegacion config={config} pathname={pathname} />
          </nav>
          <IndicePagina indice={indice} actual={actual} />
          {config.ayuda ? <AyudaLateral ayuda={config.ayuda} /> : null}
          {salir ? (
            <button type="button" className="mk-boton mk-boton-secundario mk-salir" onClick={() => void salir()}>
              Salir
            </button>
          ) : null}
        </aside>
        <main id="contenido" tabIndex={-1} className="mk-principal">
          {pathname !== baseDe(config) ? <IndiceMovil indice={indice} actual={actual} /> : null}
          {children}
          <footer className="mk-pie">
            <span>
              {config.nombre} · versión {config.version}
            </span>
            {config.ayuda ? (
              <span data-mk-ayuda>
                {config.ayuda.texto ?? "¿Algo falta o está mal?"} Escribile a{" "}
                {config.ayuda.correo ? (
                  <a href={`mailto:${config.ayuda.correo}`}>{config.ayuda.nombre}</a>
                ) : (
                  config.ayuda.nombre
                )}
                .
              </span>
            ) : config.contacto ? (
              <span>
                Consultas:{" "}
                {config.contacto.correo ? (
                  <a href={`mailto:${config.contacto.correo}`}>{config.contacto.nombre}</a>
                ) : (
                  config.contacto.nombre
                )}
              </span>
            ) : null}
          </footer>
        </main>
      </div>

      <dialog
        id="mk-menu"
        ref={dialogo}
        className="mk-dialogo"
        aria-label={`Menú de ${config.nombre}`}
        onClose={() => {
          setAbierto(false);
          botonMenu.current?.focus();
        }}
        onClick={(e) => {
          // Clic en el fondo (fuera de la caja): cierra y devuelve el foco.
          if (e.target === e.currentTarget) cerrar();
        }}
        onKeyDown={(e) => {
          // El <dialog> modal deja salir el foco hacia el navegador después
          // del último control: lo devolvemos al primero (y al revés).
          if (e.key !== "Tab") return;
          const focos = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"),
          );
          const primero = focos[0];
          const ultimo = focos.at(-1);
          if (!primero || !ultimo) return;
          if (!e.shiftKey && document.activeElement === ultimo) {
            e.preventDefault();
            primero.focus();
          } else if (e.shiftKey && document.activeElement === primero) {
            e.preventDefault();
            ultimo.focus();
          }
        }}
      >
        <div className="mk-dialogo-caja">
          <div className="mk-dialogo-cabecera">
            <span className="mk-marca">{config.nombre}</span>
            <button type="button" className="mk-boton mk-boton-secundario" onClick={cerrar}>
              Cerrar
            </button>
          </div>
          <nav aria-label="Secciones del portal">
            <Navegacion config={config} pathname={pathname} alNavegar={cerrar} />
          </nav>
          <IndicePagina
            indice={indice}
            actual={actual}
            alElegir={(id) => {
              cerrar();
              requestAnimationFrame(() => enfocarSeccion(id, true));
            }}
          />
        </div>
      </dialog>
      {config.volverArriba ? <VolverArriba pathname={pathname} /> : null}
      <Aviso />
    </div>
  );
}

/**
 * Aparece después de dos pantallas de scroll. Es un enlace a #contenido: sube
 * (suave solo sin movimiento reducido) y deja el foco en el título de la
 * página, así el lector de pantalla lo anuncia y el próximo Tab sigue desde ahí.
 */
function VolverArriba({ pathname }: { pathname: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const medir = () => setVisible(window.scrollY > window.innerHeight * 2);
    medir();
    window.addEventListener("scroll", medir, { passive: true });
    window.addEventListener("resize", medir);
    return () => {
      window.removeEventListener("scroll", medir);
      window.removeEventListener("resize", medir);
    };
  }, [pathname]);
  return (
    <a
      className="mk-arriba"
      href="#contenido"
      hidden={!visible}
      aria-label="Volver arriba"
      title="Volver arriba"
      onClick={(e) => {
        e.preventDefault();
        const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: quieto ? "auto" : "smooth" });
        const destino = document.querySelector<HTMLElement>("#contenido h1") ?? document.getElementById("contenido");
        if (destino) {
          if (!destino.hasAttribute("tabindex")) destino.setAttribute("tabindex", "-1");
          destino.focus({ preventScroll: true });
        }
      }}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

function Navegacion({
  config,
  pathname,
  alNavegar,
}: {
  config: MarcaConfig;
  pathname: string;
  alNavegar?: () => void;
}) {
  const inicio = hrefDe(config);
  return (
    <>
      <ul className="mk-nav-lista">
        <li>
          <Link
            href={inicio}
            className="mk-nav-enlace"
            aria-current={pathname === inicio ? "page" : undefined}
            onClick={alNavegar}
          >
            Inicio
          </Link>
        </li>
      </ul>
      {gruposDe(config).map(({ grupo, secciones }) => (
        <div key={grupo} className="mk-nav-grupo">
          <h2 className="mk-nav-titulo" id={`mk-grupo-${grupo}`}>
            {grupo}
          </h2>
          <ul className="mk-nav-lista" aria-labelledby={`mk-grupo-${grupo}`}>
            {secciones.map((s) => {
              const href = hrefDe(config, s.slug);
              return (
                <li key={s.slug}>
                  <Link
                    href={href}
                    className="mk-nav-enlace"
                    aria-current={pathname === href ? "page" : undefined}
                    onClick={alNavegar}
                  >
                    {s.titulo}
                    {s.estado === "pendiente" ? <span className="mk-etiqueta">Próximamente</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );
}

function IndicePagina({
  indice,
  actual,
  alElegir = (id) => enfocarSeccion(id, true),
}: {
  indice: Indice;
  actual: string;
  alElegir?: (id: string) => void;
}) {
  if (indice.length < 2) return null;
  return (
    <nav className="mk-indice" aria-label="En esta página">
      <h2 className="mk-nav-titulo">En esta página</h2>
      <ul className="mk-nav-lista">
        {indice.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              className="mk-indice-enlace"
              aria-current={actual === t.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                alElegir(t.id);
              }}
            >
              {t.titulo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function AyudaLateral({ ayuda }: { ayuda: Ayuda }) {
  return (
    <div className="mk-ayuda-lateral">
      <h2 className="mk-nav-titulo">¿Algo falta?</h2>
      <p>
        {ayuda.correo ? <a href={`mailto:${ayuda.correo}`}>{ayuda.nombre}</a> : ayuda.nombre}
      </p>
    </div>
  );
}

/**
 * "En esta página" en pantallas chicas: una franja que se desliza de lado,
 * pegada a la cabecera. En escritorio vive en el lateral.
 */
function IndiceMovil({ indice, actual }: { indice: Indice; actual: string }) {
  const lista = useRef<HTMLUListElement>(null);
  useEffect(() => {
    // Lleva a la vista la sección que se está leyendo, sin mover la página.
    const ul = lista.current;
    const a = ul?.querySelector<HTMLElement>("[aria-current]");
    if (!ul || !a) return;
    const izq = a.offsetLeft - ul.offsetLeft;
    if (izq < ul.scrollLeft || izq + a.offsetWidth > ul.scrollLeft + ul.clientWidth) ul.scrollLeft = izq - 16;
  }, [actual]);
  if (indice.length < 2) return null;
  return (
    <nav className="mk-indice-movil" aria-label="En esta página" data-mk-indice-movil>
      <ul ref={lista}>
        {indice.map((t) => (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              aria-current={actual === t.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                enfocarSeccion(t.id, true);
              }}
            >
              {t.titulo}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
