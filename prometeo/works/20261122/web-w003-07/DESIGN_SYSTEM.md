# CONTRAPUNTO · Sistema editorial reusable / v2

Este sistema no es una librería universal de tarjetas. Cambia el **modelo editorial de lectura** por pieza y conserva primitivas comunes de composición, tipografía, estado y accesibilidad.

## Tokens y tipografía
`styles.css` define `--paper`, `--ink`, `--red`, `--line`, `--soft`, `--night`, `--muted`, `--serif`, `--sans`, `--gutter`, `--max` y `--reading`. La jerarquía separa titulares serif de cuerpo Georgia y controles DM Sans. Tipografía remota con fallbacks locales. Evitar anuncios, widgets y recuadros que invadan la obra.

## Estructura extensible
`#front` es home/archivo. Cada obra es `<section class="story format-XXX" data-story id="nota-slug">`, título enfocable `h1[tabindex=-1]`, metadata, `.story-body` y texto `.prose`. Géneros concretos:
- `format-essay`: jerarquía de ensayo y ensayo largo.
- `format-interview`: pieza de ficción con turnos de diálogo `dl`.
- `format-column`: lectura estrecha, cuerpo dominante y capitular.
- `format-visual`: tres láminas con tabs ARIA; los SVG llevan `title` y `desc`.
- `format-chronicle`: narrativa y fotografía documental contextual.
- `format-notebook`: cinco notas breves numeradas.

Para agregar una lectura: sumar `section[data-story]` con `id` único, entrada `li[data-entry][data-target][data-topic][data-search]` y enlace `href="#id"`. Los títulos y prosa siguen disponibles con JS inhabilitado. Para agregar un tema, nueva opción `[data-filter]`; `updateArchive` trabaja sobre DOM real, sin API.

## Motores reutilizables
`app.js` contiene normalización de diacríticos, `updateArchive`, `selectTopic`, `route` y `activateTab`. La búsqueda usa metadata **y el texto íntegro** del artículo. Las rutas hash se pueden guardar. Los tabs sincronizan `aria-selected`, `tabIndex`, panel visible y foco; aceptan Home, End, ArrowLeft y ArrowRight. CSS `[hidden]{display:none!important}` corrige contraejemplo W002.

## Test antes de extender
Primer artículo/portada: 390 y 1440 con foto real y sin overflow; estrés de tipografía en 320. Matriz de regresión: homepage + cada lectura en 320/390/768/1440. Probar filtro → búsqueda dentro de artículo → vacío → limpiar → deep link → tabs por teclado. Imágenes de terceros solo con licencia y atribución adecuada, y controles nunca meramente decorativos.

## Alcance
Son componentes extractables y documentados del producto, no un paquete NPM publicado ni conformidad WCAG certificada. Ninguna obra W002 fue reemplazada.
