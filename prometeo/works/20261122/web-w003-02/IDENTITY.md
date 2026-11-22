# CASA MATERIAL · Mini sistema de identidad · v1

**Clase de proyecto:** identidad y web experimental para estudio ficticio. No es comercio real. Este archivo define los recursos reutilizables; la obra no lleva panel de herramientas.

## Promesa
Un catálogo de presencia y tacto, no una landing comercial. La materia pesa, los espacios respiran. Tres pilares: **materia, tiempo, uso**. Voz en primera persona plural moderada, frases breves y específicas sin adjetivos vacíos.

## Variables / tokens

| Función | Token | Valor |
| --- | --- | --- |
| Papel | `--paper` | `#ede6d8` |
| Tinta | `--ink` | `#27221e` |
| Arcilla | `--rust` | `#994b30` |
| Suavidad | `--milk` | `#f7f1e6` |
| Titulares | `--display` | Georgia / serif del sistema, con cursiva editorial |
| Texto | `--body` | Arial / sistema |
| Metadatos | `--meta` | Courier New / mono |
| Márgenes | `--gutter` | clamp(18px,3.6vw,65px) |

## Reglas y escalas
- Identidad: `CASA·MATERIAL`, dos líneas y un punto como pausa. Marca textual, sin bitmap ni logo falso.
- Primera pantalla: titular serif de gran escala + fotografía conceptual a su lado (desktop) o debajo (móvil), nunca texto ilegible encima de la pieza.
- Imágenes: familia de cuatro escenas coherentes con luz rasante, arcilla y piedra, producidas en la misma generación. Crops locales 627×627. La secuencia es **visualización generada**, no fotografía de un taller o producto fabricado.
- Catálogo: cada imagen tiene folio, familia, nombre, una frase y ficha. No agregar precio, checkout o inventario.
- Detalle: reutilizar imagen, familia, material y nota; `dialog` semántico, Escape, URL con `?pieza=` y retorno de foco.
- Móvil: una columna real, navegación visible, sin overlays; la composición conserva imagen, texto y ficha. A 320 px las acciones siguen disponibles.
- Movimiento: sólo zoom leve al hover/foco en imagen, transform de flecha, y sin transición con `prefers-reduced-motion: reduce`.
- Coherencia: el acento óxido del título reaparece en títulos de sección, hover y el capítulo de pausa. Las reglas de folio unen cubierta, colección y proceso.

## Recursos / derechos
Las cuatro escenas fueron generadas específicamente para CASA MATERIAL dentro de este WORK, derivadas de un único master de 2×2 escenas. No se atribuye artesanía física ni autoría fotográfica documental. No se reutiliza la obra anterior. Sin recursos remotos ni fuentes CDN.

## Integración reutilizable
`identity.css` contiene tokens y componentes; `site.js` expone `pieces`, `selectFilter`, `renderPiece`, `openPiece` y `closePiece` como funciones del sistema de catálogo, sin dependencias npm ni backend. Copiar estos dos archivos con un HTML que use las clases semánticas indicadas permite montar otra marca sin copiar las obras originales.
