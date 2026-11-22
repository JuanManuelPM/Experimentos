# QA · SALA DE MONTAJE · W003 / 10

**Estados honestos:** `IMPLEMENTED_SOURCE_READBACK` · `DEEP_SPEC=SPIKE_REQUIRED` · `FIRST_ARTICLE=FIRST_ARTICLE_REQUIRED` · `HUMAN_APPROVED=NO`.

| Oracle | Estado | Evidencia real |
|---|---|---|
| Publicación de código a rama propia | OBSERVED | `index.html` recuperado con blob `c89c925ae360d793b652a4b5d2551538c8db59f2` y longitud 35.405 caracteres |
| Validez JavaScript | OBSERVED | En V8 `new Function()` compiló los dos scripts del HTML: 21.468 y 5.603 caracteres |
| ZIP empaquetar/desempaquetar | OBSERVED (logic only) | Se ejecutó el código extraído de HTML: 2 entradas STORE, JSON y bytes 0..255; roundtrip PASS |
| ZIP rechaza daño | OBSERVED (logic only) | Se mutó un byte de payload, error CRC específico PASS; ZIP truncado rechazado PASS |
| Línea temporal 4 pistas con split/drag/undo | IMPLEMENTED_SOURCE, NO E2E W003 | Código conservado del editor propio W002; sin Playwright sobre W003 |
| IndexedDB recarga real sin shim | NOT_RUN | Falta ejecutar sitio real con storage permitido y recargar |
| Arrastre móvil / handles | NOT_RUN | Falta ensayo con puntero táctil |
| Crear medios y preview | NOT_RUN en W003 | Codepath MediaRecorder/synth presente; no se generaron archivos en W003 desde navegador |
| Export WebM y reexport tras editar | NOT_RUN | No se ejecutó MediaRecorder W003, no hay WebM exportado publicado en esta iteración |
| Codec/duración/audio/frames exportados | NOT_RUN | Sin FFprobe/escucha/capturas W003 |
| Primera pantalla 390 y 1440 px | NOT_RUN | Falta captura auténtica de ambas resoluciones |
| ZIP usuario real en browser | NOT_RUN | Se probó la lógica pura del ZIP, no File API + IndexedDB + UI extremo a extremo |
| Aprobación humana | NO | Ningún permiso inferido |

## Defectos heredados bajo evaluación

- W002 reportó audio exportado de aproximadamente -39,8 dB: en W003 el generador subió `gain` de .022 a .09, **pero** no se comprobó nivel exportado ni clipping.
- W002 reportó duración de proyecto 6,25s frente a contenedor MP4 derivado 6,514s: permanece riesgo de reloj/encoder y necesita medición, no una cifra maquillada.
- W002 solo guardaba JSON con referencias a blobs y no rearmaba sesión en otro origen: W003 implementó ZIP con medios. La ruta completa de restauración sigue NOT_RUN.
- W002 había probado exportación con navegador simulado y almacenamiento shim: no se cuenta esa prueba como ejecución W003.
- Medio especializado propietario de Video no pudo fijarse por identidad/version SHA en esta sesión; `FLOW.json` registra la incertidumbre. No se promueve la auditoría candidata V2 automáticamente.

## Próximo gate técnico concreto

Ejecutar una secuencia en navegador real: crear medios, recortar V1, guardar ZIP, recargar sin datos, abrir ZIP, exportar WebM, decodificar con FFprobe, extraer frames 0.5/3/5s y medir señal; modificar una decisión y reexportar, comparar duración y hashes. Capturar 390px y 1440px, probar arrastre táctil. Hasta entonces `FIRST_ARTICLE_REQUIRED`, no `VERIFIED`.
