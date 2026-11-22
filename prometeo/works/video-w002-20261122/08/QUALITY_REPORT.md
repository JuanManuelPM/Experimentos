# VIDEO W002-08 · QUALITY_REPORT / 2026-11-22

**Identidad:** `batchId=video-w002-20261122`, `taskNumber=8`, `taskId=video-w002-20261122-08`
**Brief:** `LAUNCH.md` en `Experimentos@gh-pages`, blob `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`, línea 08.
**Fuentes de metodología:** QBAR-1, DEEP-SPEC-1, contrato compartido. DEEP-SPEC: `READY_FOR_FIRST_SLICE` en validación de estructura (no equivale a arte aprobado).

## Referente → capacidad → decisión → evidencia → brecha

| Referencia | Capacidad observada | Decisión y resultado | Brecha |
|---|---|---|---|
| NASA GISTEMP v4, descarga primaria Land-Ocean J-D | Serie pública, unidad de anomalía y período base | Congelar 1880–2025, 146 años, base 1951–1980; lectura de tabla primaria fechada 2026-11-10 | Revisiones posteriores NASA cambian centésimas. Para actualidad volver a extraer y renderizar con fuente citada |
| NASA SVS 5603 | Contexto temporal de serie y leyendas de referencia | Historia de 3 actos, gráfica temporal, explicación explícita del baseline | No produce locución ni revisión editorial por tercero |
| Financial Times Visual Vocabulary | Selección de visualización por significado | Eje lineal fijo [-0.6,+1.4] °C, cero visible y sin relleno de área | Guion y formato no constituyen automáticamente una edición premiada |
| Information is Beautiful Awards | Ejemplos públicos de periodismo visual | Cifras y contexto por encima de la decoración | No se vio íntegramente todo el metraje de referencia |

## Pruebas locales observadas

- **DATA NUMERIC PASS:** 146 años consecutivos (1880 a 2025), sin 2026 parcial. Anclas primarias NASA: 1880 `-0.17`, 2024 `+1.28`, 2025 `+1.18` °C en captura 2026-11-10. Cambios frente a un espejo externo motivaron rehacer el corte desde la fuente primaria.
- **AXIS PASS:** mapeos monótonos lineales, dominio Y constante, unidad Celsius y baseline 1951–1980 rotulados. Los datos anuales no se suavizan, estiman o extrapolan.
- **FRAMES PASS (código):** cuatro tiempos de muestra (1, 7, 13 y 19 s) generan fotogramas de 960×540.
- **ENCODE PASS:** MP4 real de 22,000 s, 528 cuadros, 24 FPS, 960×540, códec video H.264 y pista audio AAC original.
- **DECODE PASS:** FFmpeg decodificó la película íntegra sin errores de códec.
- **CODE READBACK PASS:** fuente de compilador publicada en rama candidata y leída por SHA.
- **PIPELINE REPRODUCIBLE:** `python data_to_motion.py`, `python qa_tests.py` con Python/Pillow/NumPy/Lato/FFmpeg. El script acepta `--input` y `--output` para usar otra revisión compatible de la misma serie.
- **DEEP_SPEC STRUCTURE PASS:** validador lógico equivalente examinó 4 refs, 4 componentes, 4 preguntas, 4 decisiones, 3 relaciones y 3 riesgos; ningún campo inválido. Esta comprobación no evalúa artes visuales.

## Estados NO acreditados

- `HUMAN_APPROVED=NO`: ningún espectador externo realizó evaluación editorial ni comprensión sin guía.
- `ACCESSIBILITY_FULL_AUDIT=NOT_RUN`: alto contraste y letra amplia son decisiones, no una certificación WCAG; falta prueba en teléfonos y lectores.
- `LISTENING_QA=NOT_RUN`: se verificó la pista codificada; no hubo revisión auditiva humana en varios dispositivos.
- `ARBITRARY_DATASET_ENGINE=NOT_VERIFIED`: el motor está parametrizado para una serie anual con campos y dominio específicos, no soporta datasets arbitrarios sin adaptación.
- `GITHUB_PAGES_DEPLOY`: requiere corrida Actions, prueba de enlace MP4 y evidencia posterior; crear un flujo no prueba deploy ni producción.

**Licencias:** uso de cifras públicas NASA con atribución, medios gráficos/sonoros propios; sin incrustar películas, canciones ni activos gráficos de terceros ni distribuir archivos de fuente.

**Snapshot:** URL https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.txt · contenido adquirido `2026-11-10T00:00:00Z`. NASA puede revisar datos históricos, por lo que publicar una fecha de captura junto con la fuente es indispensable.
