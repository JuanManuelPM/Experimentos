# ANTES DE LA TORMENTA · VIDEO W002 / 09

**ID:** `video-w002-20261122-09` · **Rama exclusiva:** `candidate/prometeo-video-w002-09-20261122` · **Brief blob:** `e6d8075d33c342767dd249593256ca7667a20041`.

Una escena original digital de un faro en un espigón costero, de calma densa a temporal. Película **14 s / 800×450 / 24 fps / H.264 + AAC estéreo 48 kHz**, generada localmente y comprobada con ffprobe. Los archivos binarios del sitio se generan con la acción de GitHub asociada a esta rama; la mera presencia de este documento **no significa** que la acción haya terminado.

## Componentes

- `render.py`: `CoupledAtmosphereCompositor` con semilla fija, nubes adveccionadas, mar y reflejos animados, faro y muelle persistentes, niebla, lluvia estratificada, vegetación flexible, destellos y síntesis estéreo. Las pistas derivan de `climate(t)`.
- `PREPRODUCTION.deep-spec-v1.json`: preguntas específicas, alternativas, riesgos, decisiones, fuentes y QA. QBAR-1 y DEEP-SPEC-1.
- `QA.json`: artefactos locales observados y pruebas aún pendientes.
- `ANTES-DE-LA-TORMENTA-009.mp4`: archivo generado por el flujo de render en CI si la ejecución de GitHub Actions tuvo éxito.
- `contact.png`: fotogramas de 1, 6, 10.4, 13 s si CI los produjo.

## Reproducción

```bash
python -m pip install numpy opencv-python-headless pillow scipy
python render.py --output ANTES-DE-LA-TORMENTA-009.mp4 --seconds 14 --width 800 --fps 24
ffprobe -v error -show_entries format=duration:stream=codec_name,codec_type,width,height,avg_frame_rate,sample_rate -of json ANTES-DE-LA-TORMENTA-009.mp4
```

Necesita FFmpeg con libx264 y AAC. Imagen y sonido proceden exclusivamente de código original: no se incorporan clips, voces ni músicas de terceros. La ficha usa referencias de fotografía para decisiones, no para copiar sus materiales.

## Observado versus pendiente

**OBSERVED (local):** 336 fotogramas, MP4 real H.264 800×450 24 fps, AAC 48 kHz, 14.000 s, tamaño 9,097,657 bytes, contacto visual de cuatro cuadros y fuente coincidente por blob SHA `879042545a9a1fc98f32a126a48830aff743218b`.

**PENDIENTE:** readback del archivo binario que produzca CI, escucha independiente, comparación artística experta y aprobación humana. No se afirma fotorrealismo ni equivalencia con fotografía live-action.

## Criterio de calidad

La transición no se resuelve con lluvia superpuesta: viento → advección de nubes / cañas / trayectoria de gotas; tormenta → pérdida de luz / contraste / niebla / lluvia / superficie marina; relámpagos → iluminación de cielo y agua → truenos diferidos. Es una demostración procedural de acoplamiento causal, todavía con limitaciones de detalle fotorrealista.

**Propiedad de la obra:** contenido y código originales de este encargo; no afecta W001 ni los otros nueve números.
