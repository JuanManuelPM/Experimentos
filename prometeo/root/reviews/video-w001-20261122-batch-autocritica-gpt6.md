# PROMETEO · Video W001 · Recibo de autocrítica por tanda

**Referencia:** `video-w001-20261122` · **Modo:** revisión de la tanda, **no** de los diez chats productores.

**Cobertura:** 10 encargos, 11 retornos públicos (07 con dos resultados). **5 hallazgos**, de los cuales **3 inconsistencias observadas en fuentes** y **2 vacíos de verificación**. Se guardaron **5 propuestas** en rama privada candidata; pasaron **6/6 casos de prueba estática** del prototipo. **0 reproducciones de video/audio verificadas**, **0 evaluaciones estéticas humanas**, **0 flujos promovidos**. Ninguna obra fue modificada.

## Profesor ↔ Alumno: síntesis adversarial

- **Profesor:** Un MP4 codificado localmente no es una publicación verificable. **Alumno:** Los recibos de **03 y 09** señalan explícitamente que el binario no se publicó; se propone una comprobación real del archivo final antes de anunciarlo como entregado públicamente.
- **Profesor:** ¿Tener un botón Exportar equivale a haberlo probado? **Alumno:** No. **06** conserva `video_export=NOT_RUN`; se propone capturar, decodificar y medir un WebM real o etiquetar la entrega como preview.
- **Profesor:** ¿El preview muestra la misma pieza que el master? **Alumno:** No necesariamente. **09** declara voz en el MP4 local, pero su HTML público no tiene ruta de audio; se propone comprobación de paridad visual/sonora y leyenda de preview parcial.
- **Profesor:** FFprobe y una firma MP4 no demuestran que se vea en un teléfono. **Alumno:** Confirmados blobs reales de **01, 04, 07, 10/NOCTURNE** en GitHub, pero Pages/browser/Android siguen **NOT_RUN**; se propone smoke test remoto que avance el reloj de reproducción.
- **Profesor:** ¿Dónde está la segunda versión de 07? **Alumno:** En `ROOM_MESSAGES.json` están *RELEVO* y *BAJO EL MISMO TECHO*, pero `BATCHES.json` solo enlaza la primera en `messageIds`. Se propone conciliar los índices sin perder variantes, sin declarar que la interfaz pública falla sin probarla.

## Correcciones preventivas candidatas

1. `VIDEO_EXPORT_PUBLICATION`: exigir binario público + FFprobe + recibo SHA, o declarar `HTML_PREVIEW_ONLY`.
2. `VIDEO_EXPORT_QA`: comprobar el archivo realmente generado por Exportar, no solo el botón.
3. `VIDEO_PREVIEW_PARITY`: audio, subtítulos y narrativa equivalentes entre export y preview, o aviso explícito de diferencia.
4. `VIDEO_DELIVERY_PLAYBACK`: verificar HTTP, metadatos del medio y avance tras Play; si no se puede ejecutar, mantener `NOT_RUN`.
5. `ROOT_RESULT_INDEX`: conciliar todos los IDs de resultado del par tanda/número, conservando las alternativas.

Cada propuesta incluye etapa, disparador, contraprueba, gate medible, costo y rollback. Están guardadas en [inbox candidato privado](https://github.com/JuanManuelPM/pruebas/tree/candidate/prometeo-autocritica-video-w001-batch-20261122-gpt6/sistemas/metodo/inbox/video-studio/video-w001-20261122/batch-gpt6) y el [prototipo de verificador](https://github.com/JuanManuelPM/pruebas/tree/candidate/prometeo-autocritica-video-w001-batch-20261122-gpt6/sistemas/metodo/candidates/video-w001/video_evidence_gate.mjs).

**Pruebas ejecutadas:** seis fixtures estáticos, 6 PASS; lectura directa de cuatro blobs MP4 por GitHub; comprobación de recibos y del HTML fuente de 03, 06, 09 y 10; readback de cuatro archivos candidatos. **Bloqueos:** los reproductores Pages no fueron accesibles desde el entorno de auditoría, no hubo decodificación frame a frame, escucha ni prueba Android; no hay acceso a los diez chats productores. Estos límites no equivalen a fallas artísticas de las obras.

**Estado:** `FLOW_CANDIDATE` · `FLOW_PROMOTED=NO` · `HUMAN_APPROVED=NO` · `NO_AUTOMATIONS`.

[Recibo estructurado](./video-w001-20261122-batch-autocritica-gpt6.json) · [Contrato de revisión](../AUTOCRITICA_WHISPLASH.md)
