# RESULT · W7-04 «La despedida» · 2026-11-22T18:52:19.277Z

**Estado:** `SOURCE_PUBLISHED / FIRST_ARTICLE_REQUIRED / QUALITY_NOT_OBSERVED / VIDEO_NOT_RUN / HUMAN_APPROVED=NO`

Se publicó una **nueva variante aislada** del proyecto cinematográfico 3D con actor Vera / Noé, escena WebGL de autor W6 reutilizada legalmente, inspector y línea de tiempo original de 26 s. Para esta W7 se implementaron nuevas pruebas previas y un **primer artículo de dos planos con duración total 3,2 s y corte a t=1,6**. No se tocaron W6, sus URLs ni los lanzadores.

**Obra / código:** [abrir en Pages](https://juanmanuelpm.github.io/Experimentos/prometeo/works/3d-w7-20261122-04/), [corte de primer artículo](https://juanmanuelpm.github.io/Experimentos/prometeo/works/3d-w7-20261122-04/?first=1), [fuente candidata](https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-3d-w7-20261122-04/prometeo/works/3d-w7-20261122-04/), [código público](https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/works/3d-w7-20261122-04/).

**Tests observados en V8:** validación de timeline full y artículo, corte exacto, continuidad matemática del eje, ida/vuelta JSON en 64 tiempos, control de falsos positivos al mover cámara y presencia de controles. El test `node test-continuity.mjs` quedó publicado, pero no se ejecutó ese archivo bajo Node.

**Gates que NO pasaron:** `DEEP-SPEC SPIKE_REQUIRED` y `ART-DIRECTION FIRST_ARTICLE_REQUIRED`. El WebGL/Android/CDN, screenshots 390 y 1440, actuación artística, escucha y archivo audiovisual reproducible siguen `NOT_RUN`; el servicio de screenshot remoto denegó la solicitud por falta de créditos. Los controles/MediaRecorder están en código, no certificados por uso real. No se anuncia MP4.

**Comparación controlada:** W6 = `3d-w6-20261122` brief SHA `942c3ba8b851137886e959d2790771556e2d9f5d`. W7 = `3d-w7-20261122` brief SHA `58de659e2aa01c0746d59ca6f95c36bdc59f3030`. El flujo 3D 2.3.0 / SHA es el fijado en la ficha W6, **no verificado de nuevo como promoción privada actual**. La nueva estrategia prioriza corte preventivo y pruebas de miradas; no se demostró diferencia de calidad visual.

**Siguiente bloqueo técnico:** ejecutar render real y captura 390/1440 del corte, evaluar la actuación; si falla, cambiar a alternativa 2.5D antes de continuar. Grabar 3,2 s, reproducir y medir duración/audio. Solo entonces considerar la obra `VERIFIED`.
