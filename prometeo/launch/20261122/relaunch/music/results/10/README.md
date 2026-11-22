# SALA DE CONTROL · PROMETEO MUSIC W003 · WORK 10

Obra musical original de 56,185 s a 104 BPM / 48 kHz: una composición única con cinco pistas y tres productos de mezcla. **No es una grabación profesional auditada**, ni un loop presentado como mezcla final. Fue sintetizada, mezclada y medida localmente a partir del código de este paquete.

## Escuchar

Abrí `index.html` junto a la carpeta `assets/` desde un servidor local. El panel permite reproducir A/B/C en el mismo punto, nivelar la sonoridad (−17 LUFS como referencia de monitoreo), hacer fold-down mono y revisar métricas. El panel no debe utilizarse como supuesto certificado de calidad perceptual. Los archivos OGG de 56,185 segundos también se pueden escuchar por separado.

- `assets/base.ogg`: mezcla original A, **−17,03 LUFS** / **−3,60 dBTP**.
- `assets/revised.ogg`: revisión B, **−16,93 LUFS** / **−2,96 dBTP**.
- `assets/master.ogg`: derivado de B, **−14,05 LUFS** / **−2,35 dBTP**.
- `assets/stem_{drums,bass,keys,melody,atmosphere}.ogg`: stems reales, de los mismos eventos que alimentan las mezclas.
- `render.py`: sesión y receta de síntesis originales, editables, sample-accurate con semilla fija y export de PCM WAV 24-bit.
- `session.json`: arreglo, BPM, niveles de mezcla, orden de derivación y procedencia.
- `qa/METRICS.json`: comprobaciones sobre los WAV PCM originales. Las cifras no pertenecen a las versiones OGG con compresión con pérdida.
- `PREPRODUCTION.deep-spec-v1.json`, `FLOW.json`, `TRACE.json`: decisiones y trazabilidad, con límites de verificación honestos.

Para reproducir los WAV de máxima fidelidad: `python render.py --mode full --out assets` (requiere NumPy, SciPy y SoundFile). Después de exportar los WAV, `ffmpeg -i assets/master_raw.wav -af volume=3.4dB -c:a pcm_s24le assets/master.wav` reproduce el máster con el mismo gain. FFmpeg `libopus` crea las versiones OGG de entrega.

## Cambios entre A y B

1. Graves: el bajo se centra y se atenúa en B; la versión A conserva una ligera disparidad estéreo.
2. Teclados: EQ correctiva debajo de 460 Hz en B para reducir enmascaramiento.
3. Percusión: suavización alta de hats en B, preservando transitorios del bombo.
4. Motivación: recuperar el primer plano de la melodía, sin aumentar todo el mix por igual.
5. Máster: compresión soft de B, luego +3,4 dB. No hay master independiente de fuentes distintas.

**Pruebas realizadas:** ambos PCM de mezcla tienen 0,10 LU de diferencia integrada; picos verdaderos todos inferiores a −1 dBTP; mono no cancela; cinco stems PCM distintos; audio codificado a OGG real; primer artículo de 5,4 s renderizado y medido. **No realizadas:** escucha humana independiente, juicio artístico contra grabaciones profesionales, inspección funcional Web Audio en Android, capturas de 390/1440 (Chromium headless agotó el tiempo) ni aprobación humana. `HUMAN_APPROVED=NO`.

## Origen / conservación

`room=music`, `batchId=music-w003-20261122`, `taskNumber=10`, `taskId=music-w003-20261122-10`, `briefSHA=5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b`. No toca W002, otros nueve WORK, BATCHES ni flujos especializados privados. El flujo anterior 2.0.0 se conserva sin promoción en su fuente original. La interpretación **superior** de B es hipótesis técnica respaldada por cambios y medición, no hecho aprobado por un oyente.