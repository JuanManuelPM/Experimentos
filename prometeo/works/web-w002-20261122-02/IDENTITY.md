# CASA MATERIAL · Sistema de identidad CM/01

**Objeto:** marca ficticia de cerámica de autor, no comercio real. **Edición:** WEB W002 · 02 · 2026-11-22. Sistema original diseñado para funcionar en portada, producto, editorial, navegación y móvil.

## Idea rectora
La materia tiene memoria. La identidad traduce **peso, pausa y uso**, no un imaginario de lujo por acumulación. El tono habla de acciones y materia, no de “productos premium”.

## Regla tipográfica
- **Voz principal:** Instrument Serif (con Georgia de respaldo). Altura de gran formato, interlineado ajustado, itálica reservada para la conclusión sensible de una frase: *La forma / de quedarse*.
- **Orientación:** DM Sans (Arial de respaldo). Textos cortos, funcionales y legibles en detalles, navegación, filtros y cuerpo.
- **Inventario y datos:** monoespaciada de sistema en 10 px para capítulo, edición, figura, identificación y créditos. No para párrafos largos.
- Escala fluida con `clamp`; no convertir tipografía en imagen.

## Color
| Token | Valor | Función |
| --- | --- | --- |
| `--paper` | `#f0eadf` | Superficie predominante, cálida, casi sin contraste visual de ruido |
| `--paper-light` | `#f9f5ed` | Fondos de ficha y footer |
| `--chalk` | `#e6dfd0` | Portada de materia y reservas visuales |
| `--ink` | `#28251e` | Texto, borde y cierre |
| `--rust` | `#995137` | Capítulo manifiesto y acción focal |
| `--rust-dark` | `#713a29` | Itálica, numeración y acentos |

Un fondo rojo arcilla aparece **solo** donde hay una tesis editorial; el negro aparece como remate, no como plantilla repetida.

## Composición y ritmo
- Retícula de 12 unidades para objetos, con asimetría intencional: 5 columnas / salto / 6 columnas y tercer objeto desplazado.
- Portada partida 51/49: texto de escala editorial frente a materia fotografiada; la tipografía puede cruzar ópticamente la división.
- Índices `01 / ...` separan capítulos y nunca reemplazan títulos semánticos.
- Líneas de 1 px indican cambio de función, no decoración.
- Móvil: **recomponer** a una columna y reordenar sin perder jerarquía; no encoger el escritorio como una miniatura.

## Dirección fotográfica y derechos
La colección usa **fotografías reales bajo Unsplash License** como *referencias de atmósfera*, no como inventario propio. Mantener: luz suave, materias mates, tonalidades cal/arcilla, escala humana; moderar saturación por CSS sin mutilar el contexto de la obra. Cada imagen tiene página de autor vinculada desde footer. Ninguna fotografía certifica que CASA MATERIAL haya fabricado el objeto. Ver enlaces en `index.html`.

**Restricción:** alojadas externamente en `images.unsplash.com`, pueden fallar sin conexión. No reutilizar fotografías de las referencias de benchmarking, salvo licencia explícita.

## Comportamiento: componentes reutilizables
- `tokens.css`: color, tipo, espaciado, borde, enlace con flecha, numeración pequeña, reset accesible.
- `app.js`: `studies` (datos de ficha), `data-open` (activador semántico), `dialog` nativo (foco y Escape), filtro `data-category` ↔ `data-filter`, navegación `aria-expanded`.
- `site.css`: arquitectura editorial y recomposición por breakpoint. Motion solo opcional; `prefers-reduced-motion` lo reduce.
- Fotografía no disponible: nunca fingir reemplazo automático por producto fabricado digitalmente.

## Voz
Preferir: “La materia recuerda”, “La forma de quedarse”, “No hacemos más cosas. Les hacemos lugar”.
Evitar: “la mejor calidad”, “100% artesanal de nuestro taller” (sin taller real), urgencia artificial, descuentos ficticios y falsa escasez.

## Prueba de continuidad de marca
| Superficie | Elemento heredado | Diferencia deliberada |
| --- | --- | --- |
| Portada | Tipo, numeración, tinta y fotografía | Contraste escala/espacio |
| Colección | Línea fina, número, fotografía y voz | Ritmo desigual de tamaños |
| Ficha | Tokens, microetiqueta, tipografía | Síntesis funcional y accesible |
| Navegación | Sans de orientación, índice 01–04 | Menú móvil de controles táctiles |
| Taller | Fotografías con manos y materia | Texto largo, observación y proceso |
| Móvil | Misma semántica y tokens | Una columna y navegación desplegable |

## Condición de cierre
Ninguna pantalla sin contenido: página real, secciones con hash, colección filtrable, fichas con información y créditos verificables. La cohesión visual final requiere captura y evaluación humana, **no está certificada por este manual**.
