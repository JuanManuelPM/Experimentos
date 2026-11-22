# LA DESPEDIDA · 3D · W7 / 04

**Obra:** escena dramática de dos personajes (Vera y Noé) sobre un muelle nocturno. Proyecto 3D con código editable de cámara, luz, gestos, reloj y banda sonora original generativa. Conserva la escena W6 como base técnica y se desarrolla en ruta/ramas nuevas. **No constituye certificación de calidad artística ni MP4 exportado**.

- [Abrir escena](./index.html) · [primer artículo de 3,2 segundos](./index.html?first=1)
- [Libro de decisiones y dirección artística](./PREPRODUCTION.deep-spec-v1.json)
- [Resultado honesto](./RESULT.md) · [QA](./QA_RECEIPT.json)
- Archivo de edición: `timeline.json`; lógica reusable: `sequencer.mjs` y `continuity.mjs`.
- Ejecutar localmente (si hay Node): `python3 -m http.server 8000` desde esta carpeta, abrir localhost:8000. Requiere Internet para cargar Three.js 0.170.0 desde jsDelivr.
- Test de lógica: `node test-continuity.mjs` (requiere Node con ES modules); prueba tiempos, cortes, retiming, reproducción y rechazo de cámara que cruza eje.
- Dirección: seleccionar plano y ajustar duración, FOV, trayectoria, intensidad de farol, gesto y mirada. Exportar/importar el mismo JSON. `DOS MIRADAS · 3,2 S` alterna primer artículo y montaje de 26 segundos.
- Video: `EXPORTAR VIDEO CON AUDIO` intenta grabar bytes reales únicamente cuando MediaRecorder/captureStream/WebAudio están soportados en ese navegador. El formato lo decide el MIME disponible. **No hay ningún archivo audiovisual publicado ni decodificación comprobada**.

**Gates:** DEEP-SPEC = SPIKE_REQUIRED; FIRST-ARTICLE = FIRST_ARTICLE_REQUIRED, capturas móviles/escritorio y clip reproducible NOT_RUN. `HUMAN_APPROVED=NO`.

### Cambios respecto a W6
Nuevo módulo puro de eje/contraplano, dos planos de 1,6 s previos a la película, controles de yaw en ambos actores, nariz de cono exterior eliminada, Play periférico sin tapar actores, Book con FIRST-ARTICLE-1, Trace y recibos de QA separados. Esta diferencia es de **estrategia implementada**, todavía no mejora perceptual confirmada.

### Procedencia y derechos
Todos los elementos reutilizados proceden de la obra original W6 del mismo repositorio, fuente `prometeo/works/3d-w6-20261122-04`, y no se modificó W6. No se empaquetaron recursos de los referentes externos. Para producción comercial, verificar por separado las condiciones de la dependencia Three.js y del entorno de grabación.
