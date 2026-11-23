"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { contrast, formatRatio, parseColor, toHex, toRgb, type Rgba } from "./color.js";
import { tokenDe, type TokenSistema } from "./config.js";

/**
 * Muestras en vivo: pintan con `var(--token)` y después leen lo que resolvió
 * el navegador. Nunca escriben un valor a mano, así que muestran lo que de
 * verdad carga el sitio, en el tema activo.
 */

/** Sube un contador cuando cambia el tema (`class` o `data-theme` de <html>). */
export function useVersionTema(): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const obs = new MutationObserver(() => setV((n) => n + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => obs.disconnect();
  }, []);
  return v;
}

/**
 * Color resuelto de un elemento. Si el navegador lo devuelve en un espacio
 * que no es sRGB (oklch, lab, display-p3), lo pasa por un canvas.
 */
function medir(el: Element | null, prop: "color" | "backgroundColor"): Rgba | null {
  if (!el) return null;
  const valor = getComputedStyle(el)[prop];
  const directo = parseColor(valor);
  if (directo) return directo;
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.canvas.width = ctx.canvas.height = 1;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = valor;
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 0] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** Un token sin definir pinta el valor heredado: hay que decirlo, no medirlo. */
function faltan(...tokens: string[]): string[] {
  const raiz = getComputedStyle(document.documentElement);
  return tokens.filter((t) => !raiz.getPropertyValue(t).trim());
}

function FaltaToken({ tokens }: { tokens: string[] }) {
  return (
    <span className="mk-falta" data-mk-falta={tokens.join(" ")}>
      Falta el token {tokens.join(", ")}
    </span>
  );
}

/** Fondo opaco más cercano: contra eso se mide un texto. */
function fondoEfectivo(el: Element | null): Rgba | null {
  let n: Element | null = el;
  while (n) {
    const c = medir(n, "backgroundColor");
    if (c && c[3] > 0.99) return c;
    n = n.parentElement;
  }
  return null;
}

/* ───────────── copiar y avisar ───────────── */

const EVENTO = "marca:aviso";

export function avisar(texto: string): void {
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: texto }));
}

export async function copiar(valor: string): Promise<void> {
  let ok = false;
  try {
    await navigator.clipboard.writeText(valor);
    ok = true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = valor;
    ta.setAttribute("readonly", "");
    Object.assign(ta.style, { position: "fixed", left: "-9999px" });
    document.body.appendChild(ta);
    ta.select();
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
  }
  avisar(ok ? `Copiado: ${valor}` : `No se pudo copiar. Seleccioná ${valor} y copialo a mano.`);
}

/**
 * Región de estado única del portal. Vacía el texto antes de escribir el nuevo
 * para que el lector de pantalla anuncie también un mensaje repetido.
 */
export function Aviso() {
  const [texto, setTexto] = useState("");
  useEffect(() => {
    let t1 = 0;
    let t2 = 0;
    const on = (e: Event) => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      setTexto("");
      t1 = window.setTimeout(() => setTexto((e as CustomEvent<string>).detail), 60);
      t2 = window.setTimeout(() => setTexto(""), 4000);
    };
    window.addEventListener(EVENTO, on);
    return () => {
      window.removeEventListener(EVENTO, on);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);
  return (
    <div className="mk-aviso" role="status" aria-live="polite" data-mk-aviso>
      {texto ? <span className="mk-aviso-texto">{texto}</span> : null}
    </div>
  );
}

/* ───────────── piezas ───────────── */

export function Muestra({
  nombre,
  token,
  uso,
  fuente,
  cmyk,
  pantone,
}: {
  nombre: string;
  token: string;
  uso?: string;
  fuente?: string;
  cmyk?: string;
  pantone?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const v = useVersionTema();
  const [c, setC] = useState<Rgba | null>(null);
  const [falta, setFalta] = useState<string[]>([]);
  useEffect(() => {
    const f = faltan(token);
    setFalta(f);
    setC(f.length ? null : medir(ref.current, "backgroundColor"));
  }, [v, token]);
  const hex = c ? toHex(c) : "";
  return (
    <figure className="mk-muestra">
      <button
        type="button"
        className="mk-muestra-boton"
        onClick={() => hex && copiar(hex)}
        data-mk-copiar
        data-mk-valor={hex}
      >
        <span ref={ref} className="mk-muestra-color" style={{ background: `var(${token})` }} />
        <span className="mk-muestra-nombre">{nombre}</span>
        {falta.length ? <FaltaToken tokens={falta} /> : <span className="mk-muestra-hex">{hex || "…"}</span>}
        <span className="mk-oculto">Copiar el valor hexadecimal</span>
      </button>
      <figcaption className="mk-muestra-datos">
        {c ? <span>RGB {toRgb(c)}</span> : null}
        {cmyk ? <span>CMYK {cmyk}</span> : null}
        {pantone ? <span>Pantone {pantone}</span> : null}
        <code>{token}</code>
        {uso ? <span className="mk-muestra-uso">{uso}</span> : null}
        {fuente ? <span className="mk-fuente">Fuente: {fuente}</span> : null}
      </figcaption>
    </figure>
  );
}

export function Rampa({
  familia,
  prefijo,
  pasos,
  ancla,
}: {
  familia: string;
  prefijo: string;
  pasos: number[];
  ancla?: number;
}) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const v = useVersionTema();
  const [hex, setHex] = useState<string[]>([]);
  const [falta, setFalta] = useState<string[]>([]);
  useEffect(() => {
    setFalta(faltan(...pasos.map((p) => `${prefijo}${p}`)));
    setHex(refs.current.map((el) => {
      const c = medir(el, "backgroundColor");
      return c ? toHex(c) : "";
    }));
  }, [v, prefijo, pasos]);
  return (
    <div className="mk-rampa">
      <h3 className="mk-rampa-titulo">{familia}</h3>
      {falta.length ? <FaltaToken tokens={falta} /> : null}
      <ul className="mk-rampa-pasos">
        {pasos.map((paso, i) => (
          <li key={paso}>
            <button
              type="button"
              className="mk-rampa-paso"
              data-ancla={paso === ancla ? "" : undefined}
              onClick={() => hex[i] && copiar(hex[i] as string)}
              data-mk-copiar
              data-mk-valor={hex[i] ?? ""}
            >
              <span
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="mk-rampa-color"
                style={{ background: `var(${prefijo}${paso})` }}
              />
              <span className="mk-rampa-numero">
                <span className="mk-oculto">{familia} </span>
                {paso}
                {paso === ancla ? <span className="mk-oculto"> (color de marca)</span> : null}
              </span>
              <span className="mk-rampa-hex">{hex[i] ?? ""}</span>
              <span className="mk-oculto">, copiar</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Par de contraste medido sobre el CSS real, con el resultado en texto. */
export function ParContraste({
  etiqueta,
  texto,
  fondo,
  minimo = 4.5,
}: {
  etiqueta: string;
  texto: string;
  fondo: string;
  minimo?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVersionTema();
  const [ratio, setRatio] = useState<number | null>(null);
  const [falta, setFalta] = useState<string[]>([]);
  useEffect(() => {
    const f = faltan(texto, fondo);
    setFalta(f);
    const fg = medir(ref.current, "color");
    const bg = fondoEfectivo(ref.current);
    setRatio(!f.length && fg && bg ? contrast(fg, bg) : null);
  }, [v, texto, fondo]);
  const cumple = ratio !== null && ratio >= minimo;
  return (
    <figure className="mk-par">
      <div ref={ref} className="mk-par-muestra" style={{ color: `var(${texto})`, background: `var(${fondo})` }}>
        Aa {etiqueta}
      </div>
      <figcaption className="mk-par-datos">
        <code>
          {texto} sobre {fondo}
        </code>
        {falta.length ? (
          <FaltaToken tokens={falta} />
        ) : (
          <span className="mk-par-resultado" data-cumple={ratio === null ? undefined : String(cumple)} data-mk-ratio={ratio ?? ""}>
            {ratio === null ? "Midiendo…" : `${formatRatio(ratio)} · ${cumple ? "cumple" : "no cumple"} ${formatRatio(minimo)}`}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function Especimen({
  nombre,
  size,
  lineHeight,
  family,
  weight,
  tracking,
  uso,
  children,
}: {
  nombre: string;
  size: string;
  lineHeight?: string;
  family?: string;
  weight?: string;
  tracking?: string;
  /** Cuándo se usa el estilo. */
  uso?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const v = useVersionTema();
  const [medida, setMedida] = useState("");
  useEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    setMedida(`${Math.round(parseFloat(cs.fontSize))} px / ${cs.lineHeight === "normal" ? "normal" : `${Math.round(parseFloat(cs.lineHeight))} px`}`);
  }, [v]);
  const estilo: Record<string, string> = { fontSize: `var(${size})` };
  if (lineHeight) estilo.lineHeight = `var(${lineHeight})`;
  if (family) estilo.fontFamily = `var(${family})`;
  if (weight) estilo.fontWeight = `var(${weight})`;
  if (tracking) estilo.letterSpacing = `var(${tracking})`;
  return (
    <div className="mk-especimen">
      <div className="mk-especimen-datos">
        <strong>{nombre}</strong>
        <span>{medida}</span>
        <code>{size}</code>
        {uso ? <span className="mk-especimen-uso">{uso}</span> : null}
      </div>
      <p ref={ref} className="mk-especimen-texto" style={estilo}>
        {children}
      </p>
    </div>
  );
}

/** Espaciado, radios o sombras: dibuja el token y escribe su valor resuelto. */
export function Escala({ tipo, tokens: entradas }: { tipo: "espaciado" | "radio" | "sombra"; tokens: TokenSistema[] }) {
  const tokens = entradas.map(tokenDe);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const v = useVersionTema();
  const [valores, setValores] = useState<string[]>([]);
  useEffect(() => {
    setValores(
      refs.current.map((el) => {
        if (!el) return "";
        const cs = getComputedStyle(el);
        if (tipo === "espaciado") return `${Math.round(parseFloat(cs.width))} px`;
        if (tipo === "radio") return `${Math.round(parseFloat(cs.borderTopLeftRadius))} px`;
        return cs.boxShadow === "none" ? "sin sombra" : "sombra";
      }),
    );
  }, [v, tipo, tokens.length]);
  const estilo = (t: string): Record<string, string> =>
    tipo === "espaciado" ? { width: `var(${t})` } : tipo === "radio" ? { borderRadius: `var(${t})` } : { boxShadow: `var(${t})` };
  return (
    <ul className="mk-escala" data-tipo={tipo}>
      {tokens.map((t, i) => (
        <li key={t} className="mk-escala-fila">
          <span
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="mk-escala-muestra"
            style={estilo(t)}
          />
          <code>{t}</code>
          <span className="mk-escala-valor">{valores[i] ?? ""}</span>
          {typeof entradas[i] === "object" ? <span className="mk-escala-uso">{(entradas[i] as { uso: string }).uso}</span> : null}
        </li>
      ))}
    </ul>
  );
}
