# MAREA VARIABLE · W002 / 08

**Estado:** entrega técnica publicada en GitHub · audio real WAV generado · QA de navegador y escucha humana pendientes.

[**Abrir reproductor interactivo**](https://juanmanuelpm.github.io/Experimentos/prometeo/music/w002/08/)

Una banda sonora original de **48 s / 16 compases / 80 BPM** con armonía Dm(add9) → Bbmaj7 → F(add9) → Csus2. Un stem armónico compartido y tres interpretaciones emocionales (Calma, Deriva, Tormenta) permanecen sincronizados. El motor admite peticiones reiteradas, conserva la **última intención antes de la próxima frontera de compás** y transiciona con curva de potencia constante de un compás, sin reiniciar la fase.

## Archivos audibles reales

Los WAV PCM están versionados en una rama exclusiva de activos, separada del portal público. Links de descarga directos:

- [Máster Calma](https://raw.githubusercontent.com/JuanManuelPM/Experimentos/assets/prometeo-music-w002-08-20261122/prometeo/music/w002/08/masters/calma.wav)
- [Máster Deriva](https://raw.githubusercontent.com/JuanManuelPM/Experimentos/assets/prometeo-music-w002-08-20261122/prometeo/music/w002/08/masters/deriva.wav)
- [Máster Tormenta](https://raw.githubusercontent.com/JuanManuelPM/Experimentos/assets/prometeo-music-w002-08-20261122/prometeo/music/w002/08/masters/tormenta.wav)
- [Stem armónico compartido](https://raw.githubusercontent.com/JuanManuelPM/Experimentos/assets/prometeo-music-w002-08-20261122/prometeo/music/w002/08/stems/bed.wav)
- [Stem Calma](https://raw.githubusercontent.com/JuanManuelPM/Experimentos/assets/prometeo-music-w002-08-20261122/prometeo/music/w002/08/stems/calma.wav)
- [Stem Deriva](https://raw.githubusercontent.com/JuanManuelPM/Experimentos/assets/prometeo-music-w002-08-20261122/prometeo/music/w002/08/stems/deriva.wav)
- [Stem Tormenta](https://raw.githubusercontent.com/JuanManuelPM/Experimentos/assets/prometeo-music-w002-08-20261122/prometeo/music/w002/08/stems/tormenta.wav)

El navegador también sintetiza las mismas partituras localmente a **24 kHz** y permite exportar másters y stems con botones. Los archivos de GitHub fueron renderizados a **16 kHz** para aligerar el acceso, con las mismas notas y algoritmo. Los stems son archivos mono PCM y el reproductor mantiene un transporte compartido.

## Código y proyecto editable

- `index.html`: interfaz, reproducción Web Audio y exportación de WAV y receta JSON.
- `score.mjs`: partitura original, instrumentación, síntesis determinista y sumador de máster.
- `transition-engine.mjs`: función portable de cuantización, cola de intención y crossfade de potencia constante.
- Ficha `PREPRODUCTION.deep-spec-v1.json` y código fuente histórico en `JuanManuelPM/pruebas@candidate/prometeo-music-w002-08-20261122`.
- `RESULT.json`: evidencia, límites y aprendizajes auditables.

## Pruebas realizadas y límites

Node: pruebas de tempo/compás, solicitudes rápidas, muestras finitas, duración y seam del bucle **PASS**. `ffprobe`: WAV PCM legibles de 48 s **PASS**. Picos de máster: Calma 0.46324, Deriva 0.44945, Tormenta 0.66627. Recorrido de 8 transiciones cuantizadas: saltos de muestra en frontera como máximo 0.01129. DEEP-SPEC-1 validó `READY_FOR_FIRST_SLICE`; **no es certificación artística**.

**NOT_RUN:** prueba de escucha humana A/B, navegador con reproducción de audio en vivo y Android. La navegación automatizada local fue bloqueada; GitHub Pages HTTP no pudo confirmarse desde la herramienta aunque los archivos se releyeron en GitHub. No hay `HUMAN_APPROVED`.

## Referentes realmente consultados

[Austin Wintory sobre música interactiva](https://awintory.medium.com/from-journey-to-erica-214355002896) · [FMOD: quantization y marcadores](https://www.fmod.com/docs/2.04/studio/authoring-events.html) · [Diseño de música dinámica Wwise: regiones post-exit](https://www.gamesounddesign.com/in-depth-creation-of-dynamic-music-in-a-video-game.html). Son referencias de método; no se copiaron audios ni composiciones.

**Aprendizaje transferible:** una transición sin clicks en PCM demuestra continuidad numérica pero no continuidad dramática; las QA offline, navegador real y escucha humana deben registrarse por separado.
