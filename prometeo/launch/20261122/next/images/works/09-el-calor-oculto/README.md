# EL CALOR OCULTO · Images W002 · 09

**Identidad:** `batchId=images-w002-20261122`, `taskNumber=9`, `taskId=images-w002-20261122-09` · `QBAR-1 / DEEP-SPEC-1` · brief original blob `2e0e5e8ca226d546005349dc44b31cd9abcf5dd1`.

**Obra:** infografía científica original en español sobre el contraste térmico entre una calle arbolada y una calle sin sombra. La ilustración pictórica es conceptual: **no es termografía, simulación ni medición local**. Los datos son referencias observadas y atribuidas, no números generados para la imagen.

## Entregables

- `el_calor_oculto_A4_300dpi.png`: lámina A4 a 300 dpi (2480 × 3508) para impresión; `el_calor_oculto_A4_300dpi.jpg`: vista raster optimizada para publicación.
- `el_calor_oculto_movil_01.png` a `03.png`: serie de tres pantallas de 1080 × 1920; existen vistas `.jpg` livianas para web.
- `ilustracion_original_sin_datos.jpg`: arte visual original, sin números ni etiquetas, usado en el montaje.
- `render_heat.py`: composición de texto, diagramas, leyendas, escenas y export. Usa Pillow e Inter instalados en el sistema. Ejecutar `python render_heat.py --art ilustracion_original_sin_datos.jpg --out .`.
- `PROCEDENCIA.csv`: registro por afirmación científica, magnitud, unidad, transformación, contexto y limitaciones.
- `PREPRODUCTION.deep-spec-v1.json`: ficha vinculada de decisiones, referencias, riesgos y pruebas.
- `QA.md`: inspección técnica, brechas y estados reales.

## Qué se sabe y qué no

1. La **EPA** informa que las superficies sombreadas *pueden* ser 11–25 °C más frescas que las temperaturas máximas de materiales expuestos al sol. Es un **rango para superficies**, no un dato de temperatura del aire ni de las dos calles ilustradas. [EPA](https://www.epa.gov/green-infrastructure/environmental-benefits-green-infrastructure)
2. Un estudio de campo en **tres calles de Montevideo**, con trabajo de verano 2018–2019, halló que la proporción de personas que declaró confort térmico bajo la sombra de árboles fue más del doble que en sectores sin sombra. Es **confort declarado**, no grados. [Cruz y colaboradores, 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11233938/)
3. **NASA** advierte que temperatura de superficie no equivale a temperatura del aire del pronóstico meteorológico. [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/global-maps/land-surface-temperature-anomaly/)
4. **EPA** distingue los mecanismos de sombra y evapotranspiración. [EPA Benefits of Trees and Vegetation](https://www.epa.gov/heatislands/benefits-trees-and-vegetation)

El clima, la hora, la especie de árbol, el agua disponible, la dirección de viento y las condiciones materiales modifican la intensidad de estos efectos.

## Gráficos / leyendas reutilizables

El archivo `render_heat.py` provee `hero`, `small_header`, `bars_icon`, `capsule`, `paragraph`, `round_rect` y paleta editorial. Los valores NO están inyectados en la ilustración: son texto auditable. No se mezclaron datos de estudios distintos en un único gráfico cuantitativo.

## Referencias visuales y método

- [Information is Beautiful Awards, explicador de calor de Hong Kong](https://www.informationisbeautifulawards.com/showcase/7234-in-summer-of-2023-hong-kong-sweltered-as-world-set-heat-record): estudio explícito de sitios y comparaciones reales. **Aspiración**: que la imagen responda a una pregunta real, no estética vacía.
- [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/global-maps/land-surface-temperature-anomaly/): atribución y distinción de variables. **Capacidad adoptada**: separar calor superficial del aire.
- [Datawrapper Accessibility](https://www.datawrapper.de/docs/how-we-make-sure-our-charts-maps-and-tables-are-accessible): leyendas redundantes, texto y contraste. **Capacidad adoptada**: etiquetas tipográficas por encima de color solo.
- [EPA](https://www.epa.gov/green-infrastructure/environmental-benefits-green-infrastructure): mecanismos y cifras. **Capacidad adoptada**: cada dato con fuente y alcance.

No se copiararon medios de esas fuentes; toda la escena principal se generó originalmente. La tipografía Inter tiene licencia Open Font License; no se incluyen fuentes de terceros en los archivos fuente.

## Aceptación / honestidad

- **IMPLEMENTED**: cuatro raster finales, arte de base, componentes de diagramas y leyendas, fichas y tabla de procedencia.
- **OBSERVED**: apertura de PNG/JPG, medidas de píxeles, montaje visual en hoja de contacto y cotejo de afirmaciones con las fuentes.
- **NOT_RUN**: impresión física en papel, comprensión por participantes externos, revisión independiente de diseño gráfico.
- **HUMAN_APPROVED**: pendiente.

No se altera ninguna obra ni lanzador de la tanda anterior. Este branch es independiente del lote y número de otros trabajadores.