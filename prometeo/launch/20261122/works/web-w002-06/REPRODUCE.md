# MAPA DEL CALOR · fuente, reproducción y lectura

**Entrega:** `web-w002-20261122-06` · **obra:** `index.html` · **componentes reutilizables:** `components.js` · **fuente derivada:** `data.json` · **reconciliación:** `verify.mjs`.

## Qué contiene

Ensayo editorial original sobre evolución térmica en tres ciudades argentinas entre 2001 y 2025, con secuencia de lectura por capítulos, gráfico anual consultable, puntos geográficos con coordenadas y tamaño por indicador, controles accesibles por teclado, tabla de 25 filas por ciudad, descarga CSV de 75 registros y fallback de movimiento reducido. No se presentaron las comparaciones como medición causal de isla de calor urbana.

## Fuente y transformaciones exactas

Los datos provienen de la **API histórica de Open-Meteo** (modelo `era5_land`, fuente ECMWF) y usan máximas y mínimas diarias del aire a 2 metros en grados Celsius. Licencia de datos **CC BY 4.0** con atribución Open-Meteo/ECMWF. Consultas: URLs exactas en cada `cities[i].sourceUrl` del JSON; parámetros `start_date=2001-01-01`, `end_date=2025-12-31`, `timezone=America/Argentina/Buenos_Aires` y `daily=temperature_2m_max,temperature_2m_min`.

- Buenos Aires: coordenada solicitada -34.61, -58.38. Grilla devuelta -34.6, -58.4.
- Rosario: coordenada solicitada -32.95, -60.64. Grilla devuelta -32.899998, -60.6.
- Córdoba: coordenada solicitada -31.42, -64.19. Grilla devuelta -31.399998, -64.2.

Para cada año civil, `meanMax = round(sum(temperature_2m_max) / n, 2)`; `hotDays = count(temperature_2m_max >= 35)`; `warmNights = count(temperature_2m_min >= 24)`. El último nombre describe un **proxy editorial** basado en mínimas diarias, no la definición meteorológica reglada de «noche tropical». Cada ciudad tiene 9.131 días (25 años calendario), ninguna ausencia; en total, 27.393 entradas diarias y 75 filas anuales. Los cambios de décadas usan `mean(2016..2025) - mean(2001..2010)` sobre cada indicador, sin inferencia de causalidad ni incertidumbre estadística estimada.

## Verificación reproducible

Con Node.js 18 o superior, dentro de la carpeta publicada:

```bash
node verify.mjs
node verify.mjs --remote
```

El primer modo verifica estructura y completitud de `data.json`; el segundo vuelve a solicitar las tres series originales y recalcula **cada** suma, media y conteo. El modo remoto necesita conectividad; no altera archivos.

**Control independiente realizado durante producción el 22/11/2026:** segunda descarga completa desde las URLs del JSON, comparación de 75 filas con los 27.393 registros diarios originales, **75/75 coincidencias**, 0 faltantes. El control se limita a coherencia de datos, no certifica la exactitud local del reanálisis. La ficha `PREPRODUCTION.deep-spec-v1.json` fue evaluada por `DEEP-SPEC-1`: `READY_FOR_FIRST_SLICE`, que no constituye aprobación artística.

## Limitaciones científicas y editoriales

**ERA5-Land no mide temperaturas de veredas individuales.** Su resolución es aproximadamente 0.1° (~9 km); al ser un reanálisis su correspondencia con una estación o microclima puede diferir. Para medir una isla de calor hacen falta contrastes urbanos/rurales con instrumentos y criterios comparables; este artefacto no lo hace. Los umbrales 35 °C y 24 °C son decisiones editoriales explícitas y pueden no equivaler a criterios oficiales de alerta de un servicio meteorológico.

**Referencias examinadas documentalmente:** [The Pudding, método de scrollytelling](https://pudding.cool/process/how-to-make-dope-shit-part-3/); [Reuters Climate Monitor, presentación Copernicus](https://climate.copernicus.eu/reuters-launches-climate-monitor-tool-powered-copernicus-climate-change-service-data); [EPA, medir islas de calor](https://www.epa.gov/heatislands/measuring-heat-islands); [documentación Open-Meteo](https://open-meteo.com/en/docs/historical-weather-api). No se copiaron sus identidades ni se atribuye una auditoría pixel a los referentes.

## Pruebas y brecha

- **OBSERVED:** descarga remota original y comparación independiente de datos, 75/75 filas; tres ciudades x 9.131 días.
- **OBSERVED:** se validó la sintaxis del JavaScript principal y del módulo reutilizable; se comprobó el enlazado a `data.json` y `components.js`, y etiquetas SVG de apertura y cierre.
- **OBSERVED:** validador `DEEP-SPEC-1` sobre la ficha publicada; salida `READY_FOR_FIRST_SLICE` sin errores.
- **NOT_RUN:** navegador real y prueba de interacción en 320/768/1440, compatibilidad táctil y lector de pantalla, navegación scroll bidireccional, capturas visuales y performance.
- **NOT_RUN:** inspección humana, prueba perceptual comparativa y `HUMAN_APPROVED`.

### Transferencia al estudio Web

**Defecto evitado** `stage=preproduction; cause=usar el término isla de calor para una serie de un solo punto; preventive_gate=verificar definición física y escala espacial; test=exigir fuente urbana y rural explícitas si el claim es UHI; owner=web`; **contraejemplo:** llamar «isla de calor» a un mapa de temperaturas de grilla sin estación rural.

**Brecha abierta** `stage=QA; cause=no se dispone en este entorno de test navegador ejecutado para esta publicación; preventive_gate=runner Playwright con fotos reales por viewport y reduced-motion; test=320/768/1440 + teclado + CSV + scroll ascendente/descendente; owner=web`; **contraejemplo:** afirmar «responsive verificado» solo por tener reglas CSS.

El estado de esta obra es **IMPLEMENTED / DATA_RECONCILED / CODE_SYNTAX_OBSERVED / BROWSER_NOT_RUN / HUMAN_APPROVED_NOT_RUN**.
