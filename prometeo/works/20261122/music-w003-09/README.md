# PUNTO DE RETORNO · PROMETEO MUSIC W003 · 09

**Obra:** club progresivo original, 124 BPM, 208 compases, ocho secciones, 6:42.581. Arreglo con introducción y salida DJ de 32 compases, motivo que cambia de registro y reaparece después del clímax.

## Audio publicado y entregado
- En esta rama candidata existen ocho archivos binarios `audio/master.p00` a `master.p07` que son los **fragmentos exactos** del MP3 completo (7.111.715 bytes), archivados en commit `90f3790c16b6abdbe1bb3d3eb4039460d09527e4`.
- Concatenarlos en orden reproduce `master.mp3` con SHA256 `37ba5bea97d1dcf48b36103cd6be9215bc535c05030c881f4f231be3020f8267`. `AUDIO_PARTS_MANIFEST.json` conserva los SHA Git de cada fragmento.
- `audio/listening_excerpt.mp3` es un fragmento original de 58 segundos, no una recreación.
- La página `index.html`, publicada además en `gh-pages`, descarga los fragmentos binarios desde el commit Git fijo, los reúne, verifica SHA-256 en el navegador y recién entonces reproduce el **máster original**. Si el remoto falla no se proclama escucha verificada.
- Máster WAV PCM24 44.1k, seis stems FLAC editables, A/B nivelado y proyecto ZIP están adjuntos en la respuesta a WORK 09. No afirmar que los WAV/FLAC estén dentro de GitHub.

## Fuentes y pruebas
`render.py` sintetiza el arreglo sin grabaciones de terceros; `PROJECT.json` define partitura/timeline editable. `energy_map.py` mide, sobre audio PCM, RMS por compás, centroide, flux y cambios. `ENERGY_MAP.json` tiene datos de 208 compases. `qa.py`, `QA_RECEIPT.json`, `STAGE_TRACE.json`, `PREPRODUCTION.deep-spec-v1.json` y `FIRST_ARTICLE_QA.json` documentan decisiones, pruebas y límites.

QA técnica local: duración 402.581 s; 0 clipping; peak de muestra -5.87 dBFS, RMS general -23.28 dBFS (NO LUFS); seis stems de duración igual y suma coherente con el premix; first article real de ocho compases renderizado. Las secciones VACÍO (-29.19 dBFS RMS) y CUMBRE (-21.80) muestran contraste medido, no una certificación artística.

**Límites:** HTTP GitHub Pages y reproducción remota NOT_VERIFIED; screenshot 390/1440 NOT_RUN; escucha humana y primer artículo artístico contrastado antes del render completo NOT_RUN; HUMAN_APPROVED=NO. No hubo promoción del flujo privado. El único flujo fijado sigue música v2.0.0 (Git blob `1423f13e08b743f418c42052613a6808b214d622`). Brief nuevo `5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b`, oldBatchId `music-w002-20261122`, newBatchId `music-w003-20261122`.

**Preview:** https://juanmanuelpm.github.io/Experimentos/prometeo/works/20261122/music-w003-09/ (estado HTTP no comprobado).
