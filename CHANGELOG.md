# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: semver; mientras sea 0.x, un cambio de la configuración puede romper.

## [0.2.0] — 2026-11-16

Primer incremento después de la revisión de diseño (ADR 0012 del estudio). Sube los criterios **descargas**, **tareas**, **arquitectura** y **jerarquía**.

### Agregado

- **Panel de descargas arriba en Logo.** El ZIP primero y, por versión, una vista previa con sus formatos (SVG, PNG 1200 y 2400) en un menú desplegable. Reemplaza los botones sueltos y el bloque de descargas del final.
- **Inicio configurable** (`inicio`): encabezado propio, atajos por tarea con ícono (`inicio.atajos`, o `false` para quitarlos) y títulos de sus bloques. Sin el campo, se arman los atajos de siempre.
- **Íconos**: un set propio de 14 íconos de línea (`Icono`, `ICONOS`), nombrados desde la configuración.
- **Estado y fecha** (`estado`, `actualizado`) en el encabezado de cada página.
- **Ayuda** (`ayuda`) en el pie: a quién escribir si algo falta o está mal. Reemplaza a `contacto`, que sigue funcionando.
- **Rejillas sin huérfanos**: cada rejilla calcula sus columnas para no dejar un elemento solo en la última fila.
- Bloques con antetítulo y bajada opcionales; el antetítulo de cada página es el grupo de su sección.
- `marca-revisar` también verifica: ZIP en las dos primeras pantallas de Logo a 390 y 1440, texto de 12 px o más, objetivos de 24 px o más, rejillas sin huérfanos y que cada atajo lleve a una página y un ancla que existen.

### Cambiado

- Escala de títulos: H1 hasta 4,5rem (4 veces el cuerpo o más en escritorio) y títulos de bloque hasta 2,25rem.
- El tamaño mínimo impreso se muestra a escala aproximada cuando viene en cm.

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
