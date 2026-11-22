# LA ESTACIÓN VACÍA · PROMETEO IMAGES W003/06

**Estado:** ENTREGA PARCIAL comprobable · `HUMAN_APPROVED=NO` · seis escenas previstas, **cuatro imágenes generadas**, **tres generaciones remotas completas** y **una prueba maestra local**. Ningún resultado se anuncia como secuencia completa. Rama aislada, obras anteriores intactas.

## Ver

- [Galería editorial de esta rama](index.html) (el archivo HTML de rama candidata se descarga o previsualiza según GitHub; NO es todavía GitHub Pages).
- [Previsualización raster real de 05 (128×72)](media/first_article_preview.webp), derivada del máster local 1672×941 (SHA256 `a8ba45d5a11031aea12c84a28bf0e0275308b2e3659b0a32286b4b2c6a2e624e`).
- [Galería de generación del editor conectado](https://elevenlabs.io/app/flows/PX6GnoXhnhJCgp3rJFLv) (el acceso puede requerir sesión de la cuenta).
- 01, 02 y 04: generaciones de imagen con IDs `nA8QI0FFhUjRNGo9EPH7`, `jj0fgs8GZ9eRGiRzS1KO`, `zhYdCKwW24w3SF4JiFWg`. Un workflow aislado intentó o intentará guardar los bytes aquí; **la mera existencia del workflow no prueba que la copia se haya publicado**.

## Seis momentos de narrativa (sin texto sobre los cuadros)

| Nº | Función narrativa | Representación | Estado |
|---|---|---|---|
| 01 | Llegada y vacío | Plano general frío de la viajera entrando | GENERADO_REMOTO |
| 02 | Pista de vida | Plano detalle de huella fresca | GENERADO_REMOTO |
| 03 | Búsqueda | Diagonal siguiendo huellas hacia vagón verde | NO_GENERADO |
| 04 | Umbral | Puerta del vagón, primera silueta | GENERADO_REMOTO |
| 05 | Encuentro | Viajera se agacha ante terrier con pata blanca | MÁSTER_LOCAL + PREVIEW_REMOTO |
| 06 | Compañía | Salida conjunta al amanecer | NO_GENERADO |

## Qué cambió respecto a W002

El auditor registró una única plancha 1536×1024 recortada en seis cuadros de 506×506, sin prueba ciega de comprensión. Esta W003 parte de una escena pictórica real 1672×941 y genera imágenes independientes de 1280×720 para 01/02/04. **No implica mejora de continuidad:** el resto de la historia no está completado ni leído a ciegas.

## Evidencia, QA y derechos

- [PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json): un único Book con artDirection anidado.
- [CANON.json](CANON.json): personaje, perro, utilería, estación y shotlist.
- [FLOW.json](FLOW.json): fuentes y Git blob SHA fijados.
- [TRACE.json](TRACE.json): etapas recorridas y fallos reales; no inventa nodos.
- [QA.json](QA.json): pruebas ejecutadas / no ejecutadas.
- [media/QA_BINARY.json](media/QA_BINARY.json), si existe, prueba decodificación de archivos remotos, **no calidad artística**.

Referencia externa observada: [galería oficial de Shaun Tan](https://www.shauntan.net/arrival-images-gallery), [The Red Book, reseña](https://www.kirkusreviews.com/book-reviews/barbara-lehman/the-red-book/). Inspiración de gramática narrativa sin copiar assets. Los originales generados no incluyen material de referencia externo y no se atribuye aprobación de derechos comerciales específicos sin revisión de términos.

**Límites:** no hay screenshot real navegador 390/1440, ni prueba ciega de orden con lectores externos; no hay verificación de identidad completa ni de calidad de la serie. El límite de cuota del generador impidió finalizar 03 y 06. Los dos afiches PROMETEO fuera de tema fueron descartados, no cuentan como obra.

**Identidad:** `room=images` · `batchId=images-w003-20261122` · `taskNumber=6` · `taskId=images-w003-20261122-06` · `LAUNCH blob=a97b91ca103847ea75eeb9d1d2af10b6c9c0dddd` · `HUMAN_APPROVED=NO`.

Publicado: 2026-11-22T19:12:55.584Z. Este README no equivale a autorización ROOT para presentar “DELIVERED”.
