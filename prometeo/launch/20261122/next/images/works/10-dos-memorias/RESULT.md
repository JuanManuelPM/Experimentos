# 👷 🎨 DOS MEMORIAS · W002 · 10 — recibo de ejecución

**Identidad:** `batchId=images-w002-20261122` · `taskNumber=10` · `taskId=images-w002-20261122-10` · `qualityBarVersion=QBAR-1` · `deepSpecVersion=DEEP-SPEC-1`

**Brief fijo:** [LAUNCH.md #10](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/images/LAUNCH.md) · blob `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1`.

## Entregables realmente producidos

- Imagen A: `01_fotografia_editorial_sintetica.png`. PNG RGB **1536×1024**, 3,043,352 bytes, SHA-256 `073370f67f6daafc88d38c6ff63ae6cac54cc77d29b9bbb3da06614f65bee14a`. Composición fotográfica editorial *sintética*, no fotografía noticiosa.
- Imagen B: `02_ilustracion_grafica_original.png`. PNG RGB **1536×1024**, 1,576,875 bytes, SHA-256 `02b2414019d97dccb5410f938e4859ffac82d2fe9d3e311cb495732bf501378a`. Dibujo raster por código desde cero, no filtro de A.
- `03_comparacion_visible.jpg`: comparación lado a lado real.
- `comparador_ciego.html`: vista A/B aleatorizada, preguntas y exportación local JSON; evaluadores humanos **NOT_RUN**.
- `generar_ilustracion.py`: código reproducible de B con Pillow + NumPy.
- `CRITERIOS_Y_QA.md`, `MANIFEST.json` y paquete `DOS_MEMORIAS_10_ENTREGA.zip`.

**Custodia real:** Los dos PNG, el HTML interactivo, el script y el ZIP existen y fueron entregados **como archivos de la conversación**. **No están subidos como binarios a GitHub**; no publicar ni inventar enlaces de Pages para ellos. Este recibo público tiene archivos y hashes verificables en la sesión de producción, pero no es un enlace de acceso público a los píxeles. La rama contiene la ficha y este resultado.

## Contraste referente → elección → evidencia → brecha

| Fuente observada | Aspiración específica | Decisión ejecutada | Observado | Brecha |
|---|---|---|---|---|
| [World Press Photo · inundaciones de Brasil](https://www.worldpressphoto.org/collection/photo-contest/2025/Amanda-M-Perobelli/4) | Mostrar una acción humana pequeña ante una pérdida material | Dos adultos rescatan un álbum en el barro | A y B enfocan la acción, no un desastre espectacular | No es periodismo ni se evaluó recepción humana |
| [Pentagram · The Meteor](https://www.pentagram.com/work/the-meteor?page=2&rel=search) | Lenguajes visuales formalmente distintos | A usa detalle fotográfico; B masas de tinta e ilustración nueva | Estructura gráfica diferente, no cambio de paleta sobre un mismo raster | Arte editorial no ha recibido crítica profesional externa |
| [World Press Photo · ética](https://www.worldpressphoto.org/contest/code-of-ethics) | No difundir ficción como registro documental | A se rotula como imagen sintética ficticia en comparador y dossier | Etiqueta en las entregas | Si circula el PNG solo, el contexto puede perderse |
| [Shaun Tan · The Arrival](https://www.shauntan.net/arrival-book) | Continuidad de hechos/objetos para un relato visual | Canon único y matriz de anclas | 8 anclas OBSERVED y 1 PARTIAL | En B, los arcos laterales están parcialmente ocluidos |

## QA honesto

- `RENDERED_RASTER=OBSERVED` (dos PNG reales inspeccionables, decodificados en Pillow).
- `VISUAL_LANGUAGE_DIFFERENCE=OBSERVED` (una salida con detalle y profundidad fotográfica, otra redibujada con planos de color y líneas entintadas).
- `SEMANTIC_CONTINUITY=PARTIAL_PASS` (mismas figuras, gesto, árbol, banco, álbum, caja; edificio de arcos parcialmente oculto en B).
- `DEEP_SPEC_STRUCTURAL_GATE=READY_FOR_FIRST_SLICE` (comprobación de las reglas del validador, 0 errores; **no** certifica excelencia visual).
- `STRICT_CONTINUITY_ACCEPTANCE=FAILED` por visibilidad de arcos.
- `BLIND_HUMAN_COMPARISON=NOT_RUN`, `HUMAN_APPROVED=NO`, `GITHUB_MEDIA_PUBLISHED=NO`.

## Defecto y aprendizaje propuesto al estudio

**stage:** Generación de segundo brazo / QA de tema.

**cause:** El generador de imágenes produjo tres afiches de PROMETEO en vez de la escena ficticia, pese a seguir las instrucciones de la tarea. Es un desvío observable de tema, no evidencia de imagen ejecutada.

**preventive_gate:** Antes de contar una imagen como entrega, verificar en los propios píxeles al menos persona, lugar, acción y utilería del canon; descartar resultados ajenos al brief, sin extrapolar que un nombre de archivo equivale a contenido.

**test:** Confrontar cada imagen real con ocho anclas; rechazar si no representa la plaza inundada con dos adultos y el álbum rojo. Para ilustración, exigir formas/contornos nuevos, no transformación de paleta.

**owner:** estudio de Imágenes; propuesta candidata, sin promover automáticamente un cambio global.

**counterexample:** Los tres afiches visualmente elaborados de PROMETEO generados erróneamente no satisfacen el brief #10, aunque estén bien acabados. Se descartaron y no se publicaron como obra.

**Pendiente:** evaluación A/B humana y transferencia de los PNG a un destino público autorizado con readback; no confundir `DELIVERED_LOCAL` con `VERIFIED_PUBLIC`.
