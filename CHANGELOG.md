# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: semver; mientras sea 0.x, un cambio de la configuración puede romper.

## [0.10.0] — 2026-11-24

### Agregado

- Siluetas al pasar el cursor por la portada: el grupo se corre y gira (`--mk-siluetas-hover-giro`, 4° por defecto) y las copias se abren en abanico sobre el pivote (`--mk-silueta-abanico`, −12° por copia); duración `--mk-siluetas-hover-duracion` (0,9 s). Solo con cursor (`hover: hover`) y sin movimiento reducido; vuelve al salir.
- `creditos` (`nombre`, `href`, `logo`): enlace al final del pie. El logo SVG se pinta como máscara en el color del texto del pie (`--mk-creditos-ancho`, `--mk-creditos-proporcion`); `nombre` es el nombre accesible.

## [0.9.0] — 2026-11-24

Cabecera con el logo a su tamaño, número de capítulo con peso propio y botón "Volver arriba". Para las demás marcas no cambia nada visible.

### Agregado

- `cabecera.texto`: texto corto junto al logo ("Marca"); el enlace sigue llamándose `nombre` (`aria-label`). El texto va en `.mk-marca-nombre`.
- Ganchos de la cabecera: `--mk-insignia-alto`, `--mk-insignia-alto-movil`, `--mk-insignia-ancho` (`auto` para el logo entero), `--mk-insignia-relleno`, `--mk-marca-separador`, `--mk-marca-separacion`, `--mk-marca-nombre-peso`, `--mk-marca-nombre-color` y `--mk-marca-nombre-movil` (`none` lo oculta en móvil).
- Número de capítulo: `--mk-capitulo-numero-peso` (también en las tarjetas del inicio), `--mk-capitulo-numero-tamano` y `--mk-capitulo-numero-tracking`.
- `volverArriba: true`: enlace fijo abajo a la derecha (44 px) que aparece después de dos pantallas de scroll, sube (suave solo sin movimiento reducido) y deja el foco en el `h1`. Mientras se ve, el aviso sube para no taparlo.

## [0.8.0] — 2026-11-24

Siluetas en las portadas: una forma de la marca, repetida y girada, cortada por un borde. SVG en el HTML y CSS, sin JS. Para las demás marcas no cambia nada hasta que configuren `siluetas`.

### Agregado

- `portada.siluetas` y `seccion.capitulo.siluetas` (`CapaSiluetas`: `forma` con `d` y `viewBox`, `copias` 1–3, `giro` en grados, `pivote`, `lado` `"inicio"` o `"fin"`). Solo datos, así viajan con la configuración al shell.
- Componente `Siluetas` (exportado) y `validarSiluetas()`; `validarMarca` revisa las siluetas de la portada y de cada capítulo.
- Ganchos `--mk-silueta-color`, `--mk-silueta-opacidad` (por defecto `currentColor` al 6 %) y `--mk-siluetas-alto` (140 % de la portada).
- Entrada de 2,4 s que se detiene (`mk-silueta-entrada`); sin movimiento con `prefers-reduced-motion`.

### Obsoleto

- `portadaCapa` de `MarcaPagina`: sigue funcionando, pero para una forma de la marca conviene `portada.siluetas`, que no necesita JS.

## [0.7.0] — 2026-11-23

Portada con capa propia. Sale de Avanz, que lleva a la portada el banner del banco animado; para las demás marcas no cambia nada.

### Agregado

- `MarcaPagina` acepta `portadaCapa` (`ReactNode`): una capa decorativa detrás del texto de la portada del inicio, con `aria-hidden` y sin recibir el puntero (`.mk-portada-capa`). Va como prop porque la configuración la lee también el shell, que es de cliente.
- Ganchos de la placa del logo de la portada: `--mk-portada-logo-fondo`, `--mk-portada-logo-relleno`, `--mk-portada-logo-radio` y `--mk-portada-logo-sombra` (por defecto, sin placa). `--mk-portada-logo-alto` fija el alto máximo del logo en pantallas medianas y grandes (por defecto, 18rem).

### Cambiado

- `.mk-portada` pasa a `position: relative` con `isolation: isolate`.

## [0.6.0] — 2026-11-23

Quinto incremento de diseño: sombras opcionales y estados visibles. Sale del pedido de Avanz de bordes más redondos y sombras; para las demás marcas no cambia nada visible hasta que pisen los ganchos.

### Agregado

- Ganchos de sombra, por defecto `none`: `--mk-sombra-tarjeta` (tarjetas y panel del ZIP), `--mk-sombra-tarjeta-hover`, `--mk-sombra-flotante` (aviso), `--mk-boton-sombra`, `--mk-boton-sombra-hover` y `--mk-boton-secundario-sombra`. Al presionar, el botón pierde la sombra y toma `--mk-accion-presionado` (lee `--button-primary-bg-press`).
- Botón deshabilitado (`:disabled`) con `--mk-boton-deshabilitado-fondo` y `--mk-boton-deshabilitado-texto`, que leen `--button-disabled-bg` y `--button-disabled-text` del cliente.
- `data-estado` (`hover`, `presionado`, `foco`) fuerza un estado del botón para mostrarlo.
- Sistema muestra los cinco estados del botón principal (`.mk-estados`).

## [0.5.0] — 2026-11-23

Cuarto incremento de diseño: que Tipografía y Sistema digan cuándo y por qué, y que la jerarquía se sostenga en móvil. Apunta a **contenido** y **jerarquía** de la rúbrica. Sale de la revisión intermedia de Avanz (12/16).

### Agregado

- `tipografia.estilos[].uso` (cuándo se usa) y `.muestra` (texto real del estilo), y `tipografia.porque` como bajada de Jerarquía.
- `sistema.espaciado`, `radios` y `sombras` aceptan `{ token, uso }` además del token solo; `sistema.porque` (`componentes`, `espaciado`, `radios`, `sombras`) va como bajada de cada bloque.
- `tokenDe()` exportado.
- Ganchos `--mk-bloque-titulo-tamano`, `--mk-dato-tamano` y `--mk-portada-titulo-movil`.

### Cambiado

- El título de bloque (H2) arranca en 2rem en móvil (antes 1,5rem): el doble del cuerpo. Una cifra destacada (`.mk-dato`) baja de 2rem a 1,75rem y queda debajo del H2. El título de la portada en móvil sube de 1,75–2,25rem a 2–2,75rem.

## [0.4.2] — 2026-11-16

### Agregado

- **Manual en PDF** (`manual`: `href`, `detalle`): botón "Descargar el manual" junto al ZIP en Logo.
- Los atajos y tarjetas que apuntan a un `.pdf` o `.zip` se bajan con un enlace común (`download`) en lugar de una ruta de Next. `marca-revisar` los pide sin navegar y comprueba que el archivo sea un PDF o un ZIP válido.

## [0.4.1] — 2026-11-16

### Cambiado

- Textos del portal más cortos y sin explicar cómo está hecho: se quitan "Los PNG se generan desde los SVG originales", "Medidas sobre el CSS que carga este sitio" y "Todo se lee del CSS que carga el sitio"; "listos para pegar" pasa a "para copiar".

## [0.4.0] — 2026-11-16

Tercer incremento de diseño: que cada marca pueda verse propia sin salir del paquete. Apunta a **marca** y **vistas** de la rúbrica.

### Agregado

- **Portadas de capítulo** (`seccion.capitulo`: `numero`, `fondo`, `tinta`): el encabezado de la sección a color pleno, de borde a borde del área de contenido, con el número enorme detrás del texto. En el inicio, la tarjeta de cada sección lleva el mismo color y número.
- **Gesto de los títulos** (`titulos.punto`): un signo de cierre pintado con `--mk-titulo-punto`, oculto para lectores de pantalla.
- **"¿Para quién es esto?"** en el inicio (`inicio.publico`): cada público con su tarea y su destino, validado como los atajos.
- **Portada de borde a borde** (`portada.sangrado`).
- Ganchos `--mk-titulo-tamano`, `--mk-capitulo-numero-color`, `--mk-capitulo-numero-opacidad`, `--mk-capitulo-texto-claro`, `--mk-capitulo-texto-oscuro`, `--mk-tarjeta-filete`, `--mk-tarjeta-fondo`, `--mk-tarjeta-icono-fondo` y `--mk-tarjeta-icono-texto`.
- `Titulo` exportado, para las rutas propias del sitio.

### Cambiado

- **Logo: versiones y descargas en una galería.** Cada versión grande sobre su fondo, con su uso y sus formatos a la vista (SVG, PNG 1200, PNG 2400). La versión por defecto va destacada en su propia fila y "Si dudás" queda solo con el texto. Reemplaza la lista con menús "Formatos" y el bloque "Versiones", que repetía las mismas láminas. Los botones llevan el nombre de la versión en su nombre accesible.
- `marca-revisar` también mide que la portada de capítulo no pase de media pantalla en móvil.

## [0.3.1] — 2026-11-16

### Corregido

- El tag v0.3.0 salió con el `dist` de la v0.2.0: los sitios no veían `siDudas`, `porDefecto`, `porque` ni `portada.accion` (error de tipos al compilar). Este release trae el `dist` compilado desde el código de la v0.3.0, sin otros cambios.
- `npm run verify` ahora falla si `dist` no coincide con `src` (`scripts/dist-al-dia.mjs`).

## [0.3.0] — 2026-11-16

Segundo incremento después de la revisión de diseño. Botones con la voz de cada marca y contenido que decide por el lector. Apunta a **contenido**, **tareas**, **jerarquía** y **móvil**.

### Agregado

- **Ganchos de botón** `--mk-boton-*`: radio, fuente, peso, mayúsculas, tracking, tamaño, alto, relleno, ancho de borde, colores del secundario y del sin relleno, y color del brillo. Cada marca los pisa en su hoja; el paquete no trae valores de ningún cliente. Por defecto el radio sale de `--button-radius`.
- **Botón sin relleno** (`mk-boton-fantasma`) y **borde iluminado** (`mk-boton-brillo`). El brillo se pinta una vez en `::after` y solo anima `opacity`; sin animación con `prefers-reduced-motion`.
- **Acción de la portada** (`portada.accion`): un botón sin relleno con brillo sobre el color de marca. Su destino se valida como el de los atajos.
- **"Si dudás"** (`seccion.siDudas`): la decisión por defecto arriba de cada sección. En Logo muestra la versión por defecto (`logo.porDefecto`) con sus descargas directas y la marca "Por defecto" en su tarjeta.
- **Porqué de cada uso incorrecto** (`logo.porque`).
- **"En esta página" en móvil**: franja pegada a la cabecera que sigue la sección que se lee.
- **Ayuda en el lateral**, además del pie.
- Tercer nivel de títulos (`--mk-nivel-3`) para tarjetas, versiones y "Si dudás".
- `marca-revisar` también verifica: botones de 44 px de alto, etiquetas que no vengan tecleadas en mayúsculas, un solo brillo por vista, el índice a la vista en móvil y que la portada no pase de media pantalla en móvil.

### Cambiado

- El botón de menú usa los ganchos de botón.
- Títulos un poco más chicos en móvil (H1 desde 2,25rem, bloque desde 1,5rem).
- Portada compacta en móvil: el logo arriba y chico (`--mk-portada-logo-movil`, 7,5rem por defecto; que no baje del mínimo de la marca), sin pasar de media pantalla.
- El punto del estado queda alineado con la primera línea cuando el texto se parte.

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
