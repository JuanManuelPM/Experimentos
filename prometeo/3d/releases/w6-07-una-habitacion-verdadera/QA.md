# W6-07 · Evidencia de producción, límites y QA

**Identidad:** `room=3d` · `batchId=3d-w6-20261122` · `taskNumber=7` · `taskId=3d-w6-20261122-07`

- Brief fijado: `prometeo/launch/20261122/next/3d/LAUNCH.md` blob `942c3ba8b851137886e959d2790771556e2d9f5d`
- Método fijado: 3D 2.3.0, SHA256 `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.
- Fuente fotogramétrica real: University of Melbourne Digitisation Centre (Sketchfab, licencia CC BY-NC-SA).
- Recurso técnico nuestro: `photo-view-aligner.js` y el HTML contenedor; `PREPRODUCTION.deep-spec-v1.json`.
- Estado: **PARTIAL_DELIVERY / VISUAL_NOT_RUN / HUMAN_APPROVED=false**.

## Referente → intención → decisión → artefacto → brecha

| Referente observado | Intención | Decisión | Artefacto | Brecha |
|---|---|---|---|---|
| Wanderstacks inventaría mesh real de La Trobe | No fabricar geometría | Integrar modelo institucional en Sketchfab | Visor con UI original y atribución | No hay GLB local ni prueba WebGL del embed |
| Wikimedia Commons aporta imágenes CC BY-SA del mismo interior | Comparar elementos espaciales verdaderos | Exponer 3 fotos y cámara manual | Comparador de 2D con modelo y registro JSON | Son campañas distintas, sin pares extrínsecos ground truth |
| Sketchfab Viewer API documenta getScreenShot + cámara | Guardar una comparación reproducible | Separar PhotoViewAligner | Módulo reutilizable y exportador | Aún no observada ejecución API con este modelo |

## Pruebas y estado

- **Código de UI y módulo:** JavaScript compilado en prueba lógica in-memory; PhotoViewAligner pasó 4 pares con residual 0, exportación con pose, deshacer, reinicio, orden inválido y punto fuera de rango. Browser/API permanecen NOT_RUN.
- **DEEP-SPEC-1:** validador oficial aplicado al JSON publicado → **SPIKE_REQUIRED** con 0 errores de estructura, por riesgo de integración GPU/API sin observar.\n- **Modelo real:** identidad de activo enlazada y licencia externamente documentada; render del iframe **NOT_RUN**.
- **Captura de cámara, screenshot y render 3D:** **NOT_RUN** en esta sesión. Si proveedor bloquea API, el enlace de Sketchfab permite continuar.
- **Geometría y escala:** NO se afirman métricas (sin coordenadas/referencia de escala original).
- **Comparación:** el JSON distingue RMSE de coordenadas 2D normalizadas y **nunca** lo presenta como reproyección calibrada ni precisión física.
- **Android táctil, WebGL, captura de imagen y UI:** **NOT_RUN**; requiere observación en dispositivo.
- **Aprobación visual humana:** NO otorgada.
- **Riesgo:** dependencia de hosting del tercero y variación de licencia entre metadatos; no se redistribuye mesh.

## Propiedad intelectual y publicación
Escaneo original no incluido en el repositorio; servicio externo. Imágenes por URLs de Commons con créditos y licencia visibles. Código nuevo sin derechos reclamados sobre fuentes externas. No se incluyeron datos privados, fotos sintéticas ni registros de personas inventadas.

## Aprendizaje del método para revisión del estudio
Ante tareas de captura real: aplicar gate temprano de fuente/autor/licencia/bytes y disponibilidad de poses. Una foto libre del mismo lugar no equivale a frame del dataset. Una API documentada no demuestra visor operativo. Distinguir `REAL_CAPTURE_LINKED` de `RECONSTRUCTION_OWNED` y `MEASURED_ALIGNMENT`.
