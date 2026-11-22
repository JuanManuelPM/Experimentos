# Candidato transversal · QA por medio y transferencia de autocrítica

Estado: **FLOW_CANDIDATE_NOT_PROMOTED**. Ningún flujo vigente fue cambiado.

## Problema observado
En W001-06 Música, el recibo de QA declara WAV segmentado y score editable; la inspección de **metadatos** confirma consistencia aritmética de frames, bytes y duración. El mismo recibo indica `browserPlayback=NOT_RUN` y `studioExportParity=NOT_VERIFIED`. La afirmación «hay 12 archivos» no prueba reproducción continua, ni edición equivalente. No se afirma fallo audible: **falta evidencia de prueba**.

## Alumno ↔ crítico, transferencia
- Autor: defender cada claim con artefacto, hash, oráculo apropiado y límites.
- Crítico: cuestionar «publicado = probado», exigir una prueba negativa y una obra distinta.
- Autor: diseñar gate barato, reproducible y específico del medio.
- Crítico: rechazar si el gate mide solo JSON, existencia de archivos o opiniones de la misma IA.
- Autor: registrar prueba, fallo, rollback, versión del flujo y dueño.
- Crítico: decidir `CANDIDATE` vs `TESTED` vs `PROMOTED`; nunca mezclar.

## Gate transversal propuesto
1. **ROOT**: separar `PUBLICADO`, `FUENTE_VERIFICADA`, `MEDIO_DECODIFICADO`, `REPRODUCCIÓN_PROBADA`, `INTERACCIÓN_PROBADA`, `APROBACIÓN_HUMANA`. Cada etiqueta exige evidencia y fecha, nunca hereda automáticamente otra.
2. **Música**: WAV real → verificar RIFF/fmt/data, codec, sample rate, frames, SHA, bordes entre segmentos, reproducción/seek/descarga y diferencia con editor WebAudio. Para MP3/FLAC usar decodificador correspondiente. La falta de navegador queda `NOT_RUN`.
3. **Video**: container/codec, audio, duración, frames representativos, A/V sync, navegador móvil.
4. **Imágenes**: resolución y archivo reales, consistencia de personajes, contraste, crop y juicio visual independiente.
5. **Web**: interacción real de controles, teclado/touch, responsive, accesibilidad, performance y enlaces.
6. **3D**: WebGL render, cámara, oclusión, colisiones, escalas, touch, estabilidad de FPS y capturas.
7. **Todos**: incluir `negative_control` que debe fallar y `cross_work_transfer_test` en obra distinta antes de promover.

## Criterio de promoción
Demostrar tests de dos obras distintas del dominio o de dos dominios cuando el cambio afecta ROOT, comparar contra baseline, documentar regresiones, costo, dueño y rollback. Un test estático no reemplaza una prueba de medio. No alterar briefs, masters ni escenas antiguas.

## Reentrada
Revisar `prometeo/root/autocritica/20261122/BACKLOG.json` y `music-w001-06-audit.json` de esta rama. Mantener deduplicación por `artifact SHA + flow SHA + test profile`; no usar solo `ROOM_MESSAGES.json` porque una respuesta puede editarse conservando ID.
