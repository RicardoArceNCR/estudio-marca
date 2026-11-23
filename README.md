# @estudio/marca

Portal de marca (`/marca`) para sitios Next.js del estudio. Trae el marco, las
páginas que se arman desde la configuración, las descargas y las pruebas. **No
trae datos de ningún cliente**: nombres, textos, archivos y colores los pone el
sitio. Por qué existe: ADR 0011 del estudio.

## Usarlo en un sitio

```sh
pnpm add "github:RicardoArceNCR/estudio-marca#v0.4.0"
pnpm add -D playwright @axe-core/playwright
```

1. **Estilos**, en el layout raíz y después de los tokens del cliente:

   ```tsx
   import "@cliente/ui/tokens.css";
   import "@estudio/marca/portal.css";
   ```

2. **Configuración** en `src/app/marca/marca.config.ts`, con `defineMarca`.
   Los colores se escriben como tokens (`--brand-main`), nunca como hex. Una
   sección sin material va con `estado: "pendiente"` y su `pendiente`.

3. **Rutas**, tres archivos de pocas líneas:

   ```tsx
   // src/app/marca/layout.tsx
   import { MarcaShell } from "@estudio/marca";
   import config from "./marca.config";
   export default function Layout({ children }) {
     return <MarcaShell config={config}>{children}</MarcaShell>;
   }

   // src/app/marca/[[...slug]]/page.tsx
   import { MarcaPagina, marcaMetadata, marcaParams } from "@estudio/marca";
   import config from "../marca.config";
   export const generateStaticParams = () => marcaParams(config);
   export async function generateMetadata({ params }) {
     return marcaMetadata(config, (await params).slug);
   }
   export default async function Pagina({ params }) {
     return <MarcaPagina config={config} slug={(await params).slug} />;
   }

   // src/app/marca/not-found.tsx
   import { MarcaNoEncontrada } from "@estudio/marca";
   import config from "./marca.config";
   export default function NoEncontrada() {
     return <MarcaNoEncontrada config={config} />;
   }
   ```

   Una sección propia del sitio va en su ruta explícita
   (`src/app/marca/productos/page.tsx`): le gana a la comodín. Puede usar
   `Encabezado`, `Bloque`, `Muestra` y el resto de las piezas.

4. **Revisión** en `quality`, con el build servido:

   ```sh
   npx marca-revisar --url http://localhost:3101/marca
   ```

## Portadas de capítulo

```ts
secciones: [
  { slug: "logo", titulo: "Logo", grupo: "Identidad", resumen: "…",
    capitulo: { numero: "01", fondo: "--brand-main", tinta: "clara" } },
]
```

El encabezado de la sección va a color pleno, de borde a borde, con el
número enorme detrás del texto; en el inicio, la tarjeta de la sección lleva
el mismo color. `tinta: "oscura"` para fondos claros. Comprobá el contraste
del texto sobre cada fondo en `color.pares`.

## Campos para que el portal oriente, no solo describa

```ts
defineMarca({
  // …
  estado: "vigente",              // vigente | borrador | en-revision
  actualizado: "2026-11-16",      // ISO: va en el encabezado de cada página
  ayuda: { nombre: "Equipo de marca", correo: "marca@cliente.com" },
  titulos: { punto: "." },        // gesto: cierre de los títulos en --mk-titulo-punto
  manual: { href: "/descargas/acme-manual.pdf", detalle: "PDF, 40 páginas" }, // junto al ZIP en Logo
  inicio: {
    encabezado: { titulo: "Marca Acme", bajada: "Para quién es y qué encuentra." },
    publico: [
      { quien: "Diseño y agencias", necesita: "Bajar el logo y copiar colores.", href: "/marca/logo#descargas" },
    ],
    atajos: [
      { titulo: "Bajar el logo", texto: "SVG, PNG y ZIP.", href: "/marca/logo#descargas", icono: "descargar" },
    ],
    bloques: { atajos: { antetitulo: "Atajos", titulo: "¿Qué necesitás?" } },
  },
});
```

- Atajos: títulos con verbo, escritos como la tarea de quien llega. Un
  atajo a una sección inexistente o pendiente falla en el build.
- Íconos disponibles: `inicio`, `logo`, `color`, `tipografia`, `sistema`,
  `descargar`, `copiar`, `imagen`, `voz`, `correo`, `personaje`,
  `documento`, `externo` y `flecha`.
- La rúbrica de diseño del estudio (ADR 0012) es la vara: cada versión del
  CHANGELOG dice qué criterio sube.

Cuándo y por qué, en Tipografía y Sistema (v0.5):

```ts
tipografia: {
  muestra: "Frase por defecto",
  porque: "Una sola familia: la jerarquía la dan el tamaño y el peso.",
  estilos: [
    { nombre: "Título 1", size: "--typography-styles-heading-h1-size",
      uso: "Un título por página.", muestra: "Cómo usar el logo" },
  ],
},
sistema: {
  porque: { espaciado: "Múltiplos de 4: el ritmo se arma con pocos pasos." },
  espaciado: [{ token: "--spacing-4", uso: "Entre elementos de un grupo." }, "--spacing-8"],
},
```

## Qué pinta el paquete

| Sección | Desde |
| --- | --- |
| Inicio | `secciones`: accesos a tareas y a cada sección |
| Toda sección | `siDudas`: la decisión por defecto, arriba de todo |
| `logo` | `logo`: "si dudás" con la versión `porDefecto` y sus descargas, panel de descargas (ZIP y formatos por versión), versiones sobre su fondo, área de respeto, tamaño mínimo, usos incorrectos dibujados desde el SVG, con su `porque` |
| `color` | `color`: muestras copiables con HEX, RGB y CMYK, pares medidos con resultado en texto, rampas |
| `tipografia` | `tipografia`: familias con pesos y licencia, jerarquía medida; cada estilo con `uso` (cuándo) y `muestra` (texto real), y `porque` de la jerarquía |
| `sistema` | `sistema`: componentes con estados, espaciado, radios, sombras; cada token puede ir como `{ token, uso }` y cada bloque con su `porque` |
| Pendiente | `estado: "pendiente"`: qué falta, quién y para cuándo |

## Tokens que lee

`portal.css` usa ganchos `--mk-*` que caen en los tokens semánticos del
estudio: `--background-page`, `--surface-*`, `--text-primary`,
`--text-secondary`, `--text-brand`, `--border-default`, `--border-subtle`,
`--focus-ring-color`, `--button-primary-*`, `--feedback-error-text` y
`--typography-family-*`. Para ajustar uno, pisá su `--mk-*` en el CSS del
sitio.

### Botones con la voz de la marca

Los botones (`mk-boton`, `mk-boton-secundario`, `mk-boton-fantasma`) leen
`--mk-boton-*`. Un ejemplo, en el CSS del sitio:

```css
:root {
  --mk-boton-radio: var(--button-radius);
  --mk-boton-mayus: uppercase; /* las etiquetas se escriben en minúscula */
  --mk-boton-tracking: 0.06em;
  --mk-boton-tamano: 0.875rem;
}
.mk-portada { --mk-boton-brillo: var(--color-white); }
```

`mk-boton-brillo` agrega un borde iluminado que solo anima su opacidad. Va
en **un** botón por vista, sobre un fondo oscuro o de marca; `marca-revisar`
falla si hay más de uno. El color del brillo tiene que dar 3:1 contra el
fondo (el dorado sobre un rojo medio, por ejemplo, no llega).

### Capas de CSS

`portal.css` vive en `@layer marca`, así el sitio puede pisarlo sin pelear
especificidad. La contracara: cualquier regla **sin capa** del sitio le gana.
Si el `globals.css` del sitio estiliza elementos sueltos (`h1`, `section`,
`dialog`, `input`), metelos en una capa (`@layer base { … }`) o acotalos a
las páginas del sitio; si no, se cuelan en el portal. Con Tailwind v4 el
orden de capas ya lo resuelve.

## Desarrollo

```sh
npm ci
npm run verify   # build, pruebas y sin-clientes
npm run prueba   # arma el cliente de prueba y corre marca-revisar
```

Reglas:

- Nada de nombres, textos, hex ni archivos de un cliente. `sin-clientes` lo
  verifica; al sumar un cliente al estudio, agregalo a
  `scripts/prohibidos.json`.
- Cada release: `npm run prueba` en verde, `CHANGELOG.md` y tag igual a
  `version`. Nunca se mueve un tag publicado.
