# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: semver; mientras sea 0.x, un cambio de la configuración puede romper.

## [0.1.0] — 2026-11-15

### Agregado

- `defineMarca` con validación de la configuración en el build.
- `MarcaShell`: salto al contenido, navegación lateral, menú modal con foco atrapado y devuelto, índice de la página, región de avisos.
- `MarcaPagina` para la ruta comodín: inicio por tareas, logo (versiones, respeto, mínimo, usos incorrectos, descargas SVG/PNG/ZIP), color (oficiales, combinaciones medidas, rampas), tipografía, sistema y secciones pendientes.
- `portal.css` con ganchos `--mk-*` sobre los tokens semánticos del sitio.
- `marca-revisar`: revisión en navegador (rutas, 404, axe, teclado, menú, copiar, descargas, datos de otros clientes).
- Muestras que leen colores en cualquier espacio (oklch de Tailwind v4 incluido) y avisan cuando un token de la configuración no existe, en vez de medir el color heredado.
- Chequeo `sin-clientes` y cliente de prueba ficticio.
