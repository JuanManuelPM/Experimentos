# CUERPO Y CIRCUITO · PROMETEO MUSIC W003 / 07

**Obra musical generada con fuente humana real.** Duración verificada inicial: **85,114 segundos** a 44.100 Hz, estéreo. El máster y los cuatro stems están publicados como WAV auténticos; preview OGG. Fuente y código son reproducibles. No hay botón decorativo ni audio simulado.

## Escucha directa

- [Reproductor de una pantalla](index.html) con máster y A/B.
- [Máster WAV PCM](audio/master.wav) · [Máster OGG Vorbis](audio/master.ogg).
- [Toma humana seca](audio/stems/acoustic_dry.wav) · [Guitarra procesada](audio/stems/acoustic_processed.wav) · [Circuito](audio/stems/circuit.wav) · [Ambiente](audio/stems/room.wav).
- [Comparación A](audio/ab_dry.wav) · [Comparación B nivelada por RMS](audio/ab_processed_level_matched.wav).
- [Mapa de ataques reales](audio/articulation_map.json) · [Informe técnico](audio/QA.json) · [fuentes con SHA256 y derechos](audio/SOURCE_PROVENANCE.json).

## Dirección artística y recurso: cambio consciente de representación

La versión inicial intentó preservar una improvisación completa de **espineta** de Ulrich Metzner, publicada bajo CC0 en Wikimedia Commons, pero GitHub Actions devolvió **HTTP 429**. En lugar de inventar una espineta mediante MIDI, se seleccionaron cuatro improvisaciones reales de guitarra humana procedentes del conjunto [GuitarJam de Julian-br](https://huggingface.co/datasets/Julian-br/GuitarJam), publicado bajo **CC0-1.0**. Son cuatro interpretaciones distintas de 16,667; 24,750; 21,000; y 14,048 segundos; se separan con 0,55 segundos de silencio. **No se afirma que sean una sola toma continua, ni que la guitarra DI sea acústica microfoneada.** Los WAV crudos originales quedan en `audio/source_clips/`, y la trazabilidad individual en `SOURCE_PROVENANCE.json`. La composición electrónica, el arreglo del diálogo y el motor de procesado sí se generaron para este encargo.

## Mecanismo y edición

`render.py` analiza energía y pitch aproximado de la interpretación (no usa grid MIDI), guarda **130 ataques detectados** en un mapa JSON y crea respuestas filtradas con retardo vinculado a cada articulación. Preserva toma seca y guitarra procesada independientemente de la pista electrónica. `SESSION.json` describe las variables editables de la sesión; los controles efectivos están declarados en `render.py` porque no hay una sesión DAW propietaria. Cambiar esas constantes y ejecutar de nuevo produce otro render determinista, con fuentes y semilla registradas.

```bash
sudo apt-get install ffmpeg
python3 -m pip install numpy scipy soundfile
python3 render.py --first-article
python3 render.py --full
```

## QA y límites

- **OBSERVED técnico**: GitHub Actions logró descargar cuatro WAV CC0 y producir/decodificar primer artículo, máster, cuatro stems, A/B y preview OGG. Su suma en float frente al máster es exacta antes de cuantizar PCM; no se afirma igualdad byte a byte.
- **OBSERVED diseño**: apertura local visualizada en Chromium con ancho 390 y 1440 px mediante `page.set_content()` (no por HTTP publicado). Sin desbordamiento horizontal, con una única entrada principal de escucha; DOM de 3 elementos audio, los secundarios plegados. Capturas locales realizadas, no publicadas como prueba HTTP.
- **NOT_RUN**: reproducción efectiva del máster publicado en móvil, escucha crítica de timbres, juicio independiente del primer artículo y arte final, medición LUFS integrada y true peak conforme a norma, aprobación humana. `oversampled_peak_estimate_dbfs` es solo estimación 4×, no medición metrológica certificada.
- **DEEP-SPEC-1**: [ficha preventiva](PREPRODUCTION.deep-spec-v1.json) con riesgo artístico alto aún **SPIKE_REQUIRED**. Fuente DI es una brecha expresa respecto a captura acústica por microfonía.
- **W002 preservado**: no se reescribió brief, flujo v2.0.0, versiones antiguas ni otras tareas de la tanda.

## Referencias de proceso, no materiales copiados

- [James Holden + Wacław Zimpel, diálogo de instrumento y sistema](https://www.ableton.com/en/blog/james-holden-waclaw-zimpel/).
- [Christopher Tignor, gesto con instrumento de cuerda y procesamiento](https://www.ableton.com/en/blog/input-output-christopher-tignor/).
- [GuitarJam, procedencia y CC0](https://huggingface.co/datasets/Julian-br/GuitarJam).

**Estado**: obra técnicamente exportada; evaluación perceptual y autorización de ROOT para cualquier promoción como obra aprobada, pendientes. No se declara escuchada ni perfecta.
