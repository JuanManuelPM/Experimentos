# 👷 🎵 07 · CUERPO Y CIRCUITO
**Batch:** `music-w002-20261122` · **task:** `music-w002-20261122-07` · **brief SHA:** `1045f4950c9f7ae11b455523ca664e087ec1b30d`

## Escuchar y abrir la obra
[**Reproductor público**](https://juanmanuelpm.github.io/Experimentos/prometeo/previews/music/w002/07/) · `index.html`

La obra es una composición original para guitarra de nylon sampleada y circuito electrónico reactivo, a 88 BPM durante 48 compases / 135 s incluyendo cola. Cinco movimientos, 227 articulaciones en 14 alturas. Forma original: gesto acústico solo → diálogo → interrupción → regreso → respiración final.

**Botones funcionales en la página:** Play desde cualquier movimiento, detener, A/B seco vs procesado, exportar WAV estéreo PCM16 de master, acústica, circuito, ecos y seco. El render offline se ejecuta al pulsar exportar y conserva un `SONGPROJECT.json` y un módulo reusable `articulation-map.js`.

## Qué hay y qué no hay
- **Sí:** 19 archivos OGG grabados de un instrumento acústico real, con procedencia SHA, licencia CC0 y variante finger/pick, junto con arreglo de notas humano-variado y síntesis original; `engine.js` renderiza efectivamente con WebAudio.
- **No:** las 19 muestras no constituyen una *interpretación humana continua grabada para esta obra*. Son notas humanas reales montadas en una interpretación nueva. No se debe presentar el resultado como un músico que tocó estos 135 s en vivo.
- **No verificado:** audio escuchado en navegador / Android, exportación de WAV de 135 s en dispositivo real, stems sumados medidos, LUFS, true peak, calidad perceptual ni aprobación humana. **No hay WAV binario prerenderizado publicado**; la página lo genera a demanda.
- No se copió música de los referentes ni se utilizaron grabaciones sin permiso.

## Archivos
`PREPRODUCTION.deep-spec-v1.json`: decisiones y preguntas previas, gate READY_FOR_FIRST_SLICE.
`SONGPROJECT.json`: partitura detallada y mapa de archivos CC0, editable.
`samples/`: 19 OGG acústicos reales.
`articulation-map.js`: mapa independiente de ataque, registro, intensidad, gap, brillo y respuesta.
`engine.js`: sampler con WebAudio, síntesis electrónica FM, colas de eco por nota y export PCM WAV.
`index.html`: reproductor y interfaz de contraste.
`checks.mjs`: invariantes de partitura; ejecutar `node checks.mjs` (recomendado instalar Node moderno).
`QA_RECEIPT.json`: observaciones y NOT_RUN.
`SOURCE_CREDITS.md`: procedencia y licencias.

## Referencias examinadas
[Holden/Zimpel](https://www.ableton.com/en/blog/james-holden-waclaw-zimpel/): patch musical reactivo y fraseo sin rigidez. [Christopher Tignor 2026](https://www.ableton.com/en/blog/input-output-christopher-tignor/): aparato que responde a articulación acústica en tiempo real. [Christopher Tignor 2016](https://www.ableton.com/en/blog/christopher-tignor-risk-and-reward/): performance completa realmente en vivo, benchmark que esta entrega aún no puede cumplir. [Meta Open Sound nylon guitar](https://github.com/facebookincubator/Meta-open-sound): audios realmente grabados y permiso CC0. Los artículos se leyeron; la música de referencia **no** se evaluó con escucha A/B.

## Aprendizaje pendiente para estudio
`stage=production | cause=ausencia de grabación continua humana | preventive_gate=validar material acústico de performance antes del montaje | test=A/B muestra seca + articulación continua y mezcla | owner=music-studio | counterexample=sample de instrumento ≠ interpretación musical registrada`.
`stage=QA | cause=verificación de código sin reproducción real | preventive_gate=obligar a generar y escuchar master + stems antes de entregar status VERIFIED | test=playback, RMS/pico, mono, export real | owner=music-studio | counterexample=OfflineAudioContext implementado ≠ WAV exportado comprobado`.

**Estado:** implementación publicada como obra navegable; el umbral profesional y la escucha completa siguen pendientes de QA real.
