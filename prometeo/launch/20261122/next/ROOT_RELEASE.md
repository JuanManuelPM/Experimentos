# PROMETEO · ROOT · Auditoría de cinco lanzadores · Ola de exigencia

**Decisión:** los cinco lanzadores están **habilitados para despachar trabajos individuales cuando el humano pegue WORK numerado**, no iniciados por publicar archivos. Fecha 2026-11-22. La calidad de futuras obras sigue `NOT_RUN`. Este registro es un acuerdo operativo, no un premio ni una aprobación artística.

| Estudio | Lote | Briefs | Lanzador estable | Comparación y riesgos |
|---|---|---:|---|---|
| 3d | 3d-w6-20261122 | 10/10 | [WORK](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/3d/LAUNCH.md) | [EVIDENCE](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/3d/EVIDENCE.md) |
| web | web-w002-20261122 | 10/10 | [WORK](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/web/LAUNCH.md) | [EVIDENCE](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/web/EVIDENCE.md) |
| music | music-w002-20261122 | 10/10 | [WORK](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/music/LAUNCH.md) | [EVIDENCE](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/music/EVIDENCE.md) |
| video | video-w002-20261122 | 10/10 | [WORK](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/video/LAUNCH.md) | [EVIDENCE](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/video/EVIDENCE.md) |
| images | images-w002-20261122 | 10/10 | [WORK](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/images/LAUNCH.md) | [EVIDENCE](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/images/EVIDENCE.md) |

**Test estructural del lanzamiento:** 5 enlaces públicos GH `gh-pages` existentes, cada uno 10 encabezados numerados 01–10, 50 tareas únicas con ID `<batch>-NN`, un único comando `WORK · URL · N`, 5 referencias EVIDENCE y ninguna producción declarada. `prometeo/root/BATCHES.json` tiene 10 tandas, 5 históricas preservadas y 5 nuevas. Blob índice `4de1de75f8f0c2b0e2030f0ee4b8f276e77eaaf6`.

**Calidad comprobada al nivel de brief, no de obra:**
- 3D: 10 nuevas capacidades, como actor digital con rig/emociones, arquitectura/materiales/cámara, planeta jugable, timeline cinematográfico, física, clima, captura real, GIS, FORJA y configurador. No son retoques W5. Ojo: MetaHuman/Unreal no está integrado a Three.js y el WORK debe buscar herramientas/recursos realmente accesibles y probar un corte, no fingir equivalencia.
- Web: 10 capacidades propias del medio con referencias a The Pudding, Dropbox Brand, Exat, accesibilidad, IIIF y Webflow, y pruebas de navegador, scroll, interacción, recursos auténticos y export. No se sustituye diseño web con otro videojuego 3D.
- Música: 10 composiciones/sistemas distintivos (groove por pista, rack de eco, break slicing, patch graph, música interactiva, mastering A/B, etc.). Referencias de productores de alta exigencia y documentación técnica. **Pendiente perceptual:** escuchar máster y stems reales; no certificar calidad por BPM/loudness o archivo válido.
- Video: cortos, publicidad, documental, motion, montaje, fenómenos atmosféricos y editor con salida binaria. La producción debe aportar filmación/render/audio coherente y video decodificable real; no presentar transición Canvas como cine completo.
- Imágenes: campaña editorial, arquitectura multivista, personaje consistente, producto, álbum, relato gráfico, paisaje, concepto, infografía y dos estilos comparados. Salida raster genuina, no SVG/HTML geométrico de relleno.

**Método disponible:** `pruebas@prometeo/control:sistemas/metodo/CONTRATO_COMPARTIDO.md` enlaza Q-LOOP + QBAR-1 y `Experimentos@gh-pages:prometeo/launch/DEEP_SPEC.md` + `deep-spec-v1.mjs` de preproducción profunda. Se documentaron 28 casos de validador lógico; **un trabajo específico todavía debe completar ficha, ejecutar spike si corresponde e inspeccionar el resultado real**. El método no garantiza por sí solo acceso a herramientas externas o calidad profesional. No se actualizaron plugins locales ni flujos propietarios especializados automáticamente.

**Riesgos abiertos, NO bloqueos para iniciar una prueba experimental:** acceso a audio/raster/video real, assets y licencias, render y QA de móvil, importación de modelos, evaluación artística independiente. Si faltan herramientas/autoridad, WORK debe trabajar lo legítimo y señalar `NOT_RUN/BLOCKED` sin fabricar resultados. Registrar `HUMAN_APPROVED=NO` hasta observación humana.

**Aislamiento:** cada WORK sólo una tarea y rama exclusiva; conservar SHA del brief, W5/W001 y fuentes. No lanzar trabajos por cron ni con una publicación de ROOT.

**Fase humana siguiente:** copiar el mismo prompt de cada uno de los cinco estudios y agregar sucesivamente 1,2,3...10 en chats nuevos. Se pueden enviar independientemente sin nueva aprobación entre tareas.
