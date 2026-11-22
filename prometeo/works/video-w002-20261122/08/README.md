# VIDEO W002 / 08 · LA CIFRA INVISIBLE

**ID:** `video-w002-20261122-08` · **Estudio:** `video` · **Estado local:** `DELIVERED_TECHNICALLY_VERIFIED / HUMAN_APPROVED=NO`.

Documental animado original de 22 segundos: serie anual de anomalía térmica global (1880–2025), sin usar clips ajenos, narración fabricada ni estadísticas no trazables. El objetivo periodístico no es dramatizar un récord: **mostrar 146 observaciones y explicar qué significa la unidad**.

## Fuente verificable y versión

- **Fuente primaria:** NASA Goddard Institute for Space Studies, **GISTEMP v4**, Land–Ocean Temperature Index, tabla `GLB.Ts+dSST.txt`, columna anual **J-D**.
- **URL:** https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.txt
- **Captura fechada del contenido primario:** `2026-11-10T00:00:00Z`. **No mezclar con la tabla web actual**: NASA recalcula periódicamente series históricas y los números pueden cambiar en centésimas después de esta captura.
- **CSV versionado:** `annual_nasa_gistemp_1880_2025.csv`. Incluye exactamente los 146 valores completos desde 1880 hasta 2025 en grados Celsius, divididos por 100 desde la tabla NASA original.
- **Dos anclas del snapshot:** 1880 = −0,17 °C y 2025 = +1,18 °C respecto de **1951–1980**. **No son temperaturas absolutas**; 2026 está excluido por no ser un año completo.
- **Proveniencia:** antes de disponer del texto NASA se exploró el espejo GitHub `knsorrigle/earth@1bd2ca8fad44d6c33438f1184ec76e9e3dfb81cf`, pero **el artefacto definitivo se regeneró desde la captura primaria fechada**, no desde ese espejo.

## Entregas y reproducción

- `data_to_motion.py`: **DataToMotionCompiler** en Python / Pillow / NumPy; trabaja desde un CSV verificable con escala Y fija y ejes con cero visible; genera frames reales a 24 FPS y mezcla sonido original por FFmpeg.
- `qa_tests.py`: inspección numérica, coordenadas lineales, muestras visuales de cuatro tiempos y decodificación completa de H.264/AAC.
- `PREPRODUCTION.deep-spec-v1.json`: trazabilidad Q-LOOP, QBAR-1, preguntas, decisiones, componentes, riesgos, pruebas y referencias.
- `QUALITY_REPORT.md`: resultados observados y carencias.
- `LA_CIFRA_INVISIBLE.mp4` se renderizó localmente y pasó FFprobe/FFmpeg. Se publica por la acción aislada de este lote **solo si Actions efectivamente termina y el archivo se lee en Pages**.

Para reproducir en Linux con FFmpeg, Lato y Python 3:

```sh
python -m pip install 'Pillow>=10,<13' 'numpy>=1.25,<3'
python data_to_motion.py
python qa_tests.py
```

## Capacidad reutilizable y límite conocido

El compilador es **paramétrico en los valores del CSV** y deriva la línea, el contador y los fotogramas de datos realmente leídos; se puede reproducir o recalcular con otra versión de *esa misma serie anual*. **Todavía no es un motor universal para indicadores arbitrarios**, porque año inicial/final, eje, rango, identidad editorial y textos se configuran en el módulo. La generalización de dominios, unidades, duraciones, subtítulos y lectura reducida es el siguiente paso, no una capacidad falsamente certificada.

## Dirección editorial

Inspiraciones estudiadas: [NASA SVS 5603](https://svs.gsfc.nasa.gov/5603), [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md) y [Information is Beautiful Awards](https://www.informationisbeautifulawards.com/showcase?page=173&pcategory=motion-infographic). Se utilizan como criterios de claridad y procedencia, **no se incorporan imágenes o videos de terceros**. El audio sintetizado es un diseño sonoro original que marca cambios de escena, **no una sonificación de cifras científicas**.

**Licencias:** datos públicos de NASA con atribución; texto, gráficos, animación y sonido producidos originalmente. No se redistribuyen archivos de tipografías Lato. La revisión externa de contenido, legibilidad móvil y aprobación artística humana siguen pendientes.
