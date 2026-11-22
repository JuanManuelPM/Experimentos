# DESPLAZAMIENTO · music-w003-20261122-02

**UK garage nocturno, arreglo original de 32 compases a 133 BPM.** Total **63.744 s**, 44.1 kHz / 16-bit PCM / estéreo. Todos los timbres, patrones y melodías se generaron con código original, sin grabaciones ni samples externos. Seis secciones: `arrival`, `first-drive`, `hollow`, `release`, `absence`, `return`.

## Escuchar y editar

- [Página de escucha](https://juanmanuelpm.github.io/Experimentos/prometeo/music/w003/02/) (fuente Pages publicada, HTTP/playback independiente **NOT_RUN**).
- [Máster WAV original](master.wav), blob Git `0450835ecc77c2d62e74ced580f8eaa09c63bcb8`, SHA-256 `03b58e70fd520af5b1c0ae08c6077f87157864c6388eb461ad36b92610f8b394`.
- [A/B interpretado](ab/played.wav) / [A/B recto, igualado](ab/straight-matched.wav).
- [MIDI editable](DESPLAZAMIENTO.mid) y [eventos+groove por pista](EVENTS.json); [motor original reutilizable](engine.mjs), [generación reproducible](build.mjs).
- Stems WAV estéreo individuales: [kick](stems/kick.wav), [snare](stems/snare.wav), [hats](stems/hats.wav), [ghost](stems/ghost.wav), [bass](stems/bass.wav), [chords](stems/chords.wav), [motif](stems/motif.wav), [air](stems/air.wav).

## Métodos y QA

- El primer artículo se renderizó **antes** del tema completo, en cuatro compases de alta densidad. La mezcla inicial era demasiado dominada por el bombo por RMS de fuentes. Se revisaron los niveles antes de exportar. Primer artículo binario `first-slice-groove.wav` (no confundirlo con la mezcla final corregida).
- El motor aplica **offsets de tiempo en milisegundos y acentos independientes por instrumento**, a diferencia del swing global. El A/B conserva las notas armónicas por identidad y tiene una diferencia de RMS medida de `6.03e-10 dB`.
- **724 eventos**; **ocho stems WAV** presentes y leídos por metadatos GitHub. En la ejecución CI **45057712069**, los 11 archivos PCM (máster, ocho stems, dos A/B) pasaron el chequeo de encabezados RIFF, tamaño y duración en Node. La suma en float de los ocho stems difiere del máster en como máximo `1.05e-7` antes de cuantizar.
- **No afirmamos** escucha subjetiva en auriculares, decodificación FFmpeg, true peak interpolado, validación de MIDI por DAW real, screenshots 390/1440, HTTP/playback Pages ni aprobación humana. El runner no tenía FFmpeg y se usó un gate PCM limitado en su lugar.
- La CI **falló globalmente** al hacer push masivo a `gh-pages`, por carreras con trabajos simultáneos. El máster y los stems **sí quedaron versionados en la rama exclusiva**, con SHA/metadatos comprobados; se publicó una página ligera en `gh-pages` con enlaces directos a esos binarios. Estado final **AUDIO_IN_GITHUB · SOURCE_PAGE_PUBLISHED · HTTP_PLAYBACK_NOT_RUN · HUMAN_APPROVED=NO**.
- [Book / decisiones y referencias](PREPRODUCTION.deep-spec-v1.json) · [Trace visitada](TRACE.visited.json) · [QA](QA.json) · [CI](https://github.com/JuanManuelPM/Experimentos/actions/runs/45057712069).

## Comparabilidad

`oldBatchId=music-w002-20261122` · `newBatchId=music-w003-20261122`. Brief W002 `1045f4950c9f7ae11b455523ca664e087ec1b30d`, W003 `5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b`. Flow especializado congelado 2.0.0 blob `1423f13e08b743f418c42052613a6808b214d622`. W002 entregó audio completo en el chat pero no publicaba binario; W003 incorpora la publicación del binario en GitHub. No existe escucha A/B comparativa entre tandas: mejora musical **UNVERIFIED**, no promover flujo por este resultado.
