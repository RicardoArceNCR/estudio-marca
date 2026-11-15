"use client";

import { useEffect, useState } from "react";

/**
 * Índice de la página, leído del DOM: las `<section id>` de primer nivel dentro
 * de `<main>`, con el texto de su h2 o de `data-toc`. `actual` es la sección
 * que se está leyendo.
 */
export type Indice = { id: string; titulo: string }[];

function leerIndice(): Indice {
  return Array.from(document.querySelectorAll<HTMLElement>("main section[id]"))
    .filter((s) => !s.parentElement?.closest("section[id]"))
    .map((s) => ({
      id: s.id,
      titulo: (s.dataset.toc ?? s.querySelector("h2")?.textContent ?? "").trim().replace(/\.$/, ""),
    }))
    .filter((t) => t.titulo);
}

export function useIndice(pathname: string) {
  const [indice, setIndice] = useState<Indice>([]);
  const [actual, setActual] = useState("");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIndice(leerIndice()));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  useEffect(() => {
    if (!indice.length) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const linea = window.innerHeight * 0.3;
        let id = "";
        for (const t of indice) {
          const el = document.getElementById(t.id);
          if (el && el.getBoundingClientRect().top <= linea) id = t.id;
        }
        const alFinal =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
        setActual(alFinal ? (indice.at(-1)?.id ?? id) : id);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [indice]);

  return { indice, actual };
}

/**
 * Lleva el foco a una sección después de saltar a ella. Sin esto el scroll se
 * mueve pero el próximo Tab arranca desde donde estaba el foco.
 */
export function enfocarSeccion(id: string, desplazar = false): void {
  const el = document.getElementById(id);
  if (!el) return;
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (desplazar) el.scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
  el.focus({ preventScroll: desplazar });
  history.replaceState(null, "", `#${id}`);
}
