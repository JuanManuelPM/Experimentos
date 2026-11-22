# AGUA EN MOVIMIENTO · MUSIC W002-04

**ID:** music-w002-20261122-04 · **Brief blob:** 1045f4950c9f7ae11b455523ca664e087ec1b30d · **Flow Music:** 2.0.0.

## Artefactos implementados
Composición original liquid DnB de 96 compases a 174 BPM, siete movimientos y tres niveles. Breaks con ghost hits, microtiming y fills editables. Subgrave monofónico con duck al kick, melodía y acordes de Rhodes sintetizados, atmósferas originales. El motor render.py está diseñado para exportar MASTER.wav, MASTER.mp3, cuatro stems FLAC, SONGPROJECT.json y QA_RECEIPT.json. El editor reutilizable break_editor.py conserva origen y licencias por hit.

**Un archivo de código no prueba audio renderizado.** La verdad operativa requiere readback real de los binarios, QA_RECEIPT.json y resultado de GitHub Actions.

## Referencias examinadas como documentos, NO escuchadas A/B
- [Paradox / Ableton](https://www.ableton.com/en/blog/paradox-breakbeat-mastery/): aire entre golpes y edición de break.
- [Brendon Moeller / Ableton](https://www.ableton.com/en/blog/brendon-moeller-life-begins-at-170/): breaks interpretados y propósito artístico.
- [High Contrast / Sound on Sound](https://www.soundonsound.com/techniques/lincoln-barrett-producing-drum-bass): capas de batería y tratamiento de producción.
- [MusicRadar, consejos DnB](https://www.musicradar.com/tuition/tech/11-cutting-edge-drum-n-bass-tips-600957): separación de fundamentales del kick y del sub.

## Criterios de aceptación
Máster PCM16 y MP3 reales, cuatro FLAC de la misma longitud, score con >900 eventos, duración >130 s, sample peak <=0.902, residual stems-vs-master <0.00015 RMS y tres niveles de densidad contrastables.

**NOT_RUN:** escucha A/B a loudness igualado, master comercial, medición true peak intersample, revisión en altavoces/mono, aprobación humana.

## Calibración preventiva
M05/M07: causa a prevenir = break único repetido. Gate = velocidad, timing, origen y patrón separados por hit. Test = evento por evento + A/B por sección. Owner = music-studio. Contraejemplo = mismo break a diferente BPM.

Todos los sonidos se sintetizan desde código propio; no se importaron samples comerciales o grabaciones de terceros.
