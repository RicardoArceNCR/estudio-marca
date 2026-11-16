# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: semver; mientras sea 0.x, un cambio de la configuración puede romper.

## [0.1.2] — 2026-11-15

### Agregado

- `portada`: el inicio abre con una banda del color de marca y el logo.
- `cabecera`: insignia con el logo junto al nombre del portal.
- Ganchos `--mk-nav-actual-*`, `--mk-portada-texto` y `--mk-tarjeta-acento`: la sección actual, el índice y las tarjetas toman el color de la marca (`--brand-subtle`, `--text-brand`, `--border-brand`).

### Corregido

- "Copiar un color" no promete CMYK si la configuración no lo trae.

## [0.1.1] — 2026-11-15

### Corregido

- Los logos verticales se cortaban en su lámina: ahora entran enteros, sean verticales u horizontales.
- "No cambies sus colores" recolorea la lámina entera, no solo el logo.
- Código, valores y textos caen en fuentes genéricas si el token de familia nombra una fuente que el sitio no carga.

## [0.1.0] — 2026-11-15

### Agregado

- `defineMarca` con validación de la configuración en el build.
- `MarcaShell`: salto al contenido, navegación lateral, menú modal con foco atrapado y devuelto, índice de la página, región de avisos.
- `MarcaPagina` para la ruta comodín: inicio por tareas, logo (versiones, respeto, mínimo, usos incorrectos, descargas SVG/PNG/ZIP), color (oficiales, combinaciones medidas, rampas), tipografía, sistema y secciones pendientes.
- Versiones de logo sobre un color de marca (`fondo: "--brand-main"`), además de claro y oscuro.
- `portal.css` con ganchos `--mk-*` sobre los tokens semánticos del sitio.
- `marca-revisar`: revisión en navegador (rutas, 404, axe, teclado, menú, copiar, descargas, datos de otros clientes).
- Muestras que leen colores en cualquier espacio (oklch de Tailwind v4 incluido) y avisan cuando un token de la configuración no existe, en vez de medir el color heredado.
- Chequeo `sin-clientes` y cliente de prueba ficticio.
