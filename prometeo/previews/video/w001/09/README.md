# VIDEO W001/09 · La ciudad respira

**Tarea:** `video-w001-20261122-09` · **Duración:** 12,00 s · **Formato del MP4 generado localmente:** 540×960, 24 fps, H.264 + AAC mono.

## Guion/shotlist
1. 0–3 s: ciudad nocturna y primera ventana encendida; voz «Una ventana se enciende».
2. 3–6 s: otras ventanas responden; voz «Otra responde desde lejos».
3. 6–9 s: color cálido invade gradualmente el cielo; voz «La ciudad aprende a respirar».
4. 9–12 s: amanecer y cierre; voz «Y empieza un día nuevo».

## Archivos públicos
- `index.html`: previsualización animada original con timeline scrubbable; **sin audio integrado**. Es una reconstrucción browser de la misma receta, no el MP4.
- `recipe.json`: cuatro cues fuente única, duración, lenguaje, shotlist y permisos.
- `captions.vtt`: cuatro cues de subtítulo con el mismo reloj.
- `RECEIPT.json`: evidencia y límites reales.
- Entrega del chat: `final.mp4`, `render.py`, `captions.srt`, `poster.jpg` y `verify.json` generados localmente. El MP4 no se insertó en GitHub: **no afirmar que el preview público reproduce ese binario**.

## Render mecánico realmente ejecutado
Render local Python (Pillow + NumPy) con voz eSpeak es-la, cama de audio sinusoidal original, multiplexado con FFmpeg. Archivo final: 462.151 bytes, SHA-256 `044568b0ce9f650683f53b0a592c4424068a3e8d06557bdf98ebbfc815c28322`. FFprobe comprobó 12,000 s, 540×960, 24/1 fps, H.264/AAC. El audio fue construido colocando los cuatro audios a los inicios de `recipe.json`. La sincronización visual se verifica por reloj común y SRT; la apreciación humana y lip sync no están aprobados.

## Límites
- `index.html` publicado mediante GitHub no equivale a navegador probado/MediaRecorder exportado.
- Solo se afirma `VIDEO_FILE_ENCODED` para el MP4 descargable **en el chat**.
- No se reutilizaron videos, fotos, voces de terceros ni samples protegidos. Narración sintetizada mediante eSpeak.
- Dirección artística y legibilidad en Android: pendientes de evaluación humana real.

## Fuentes de método
- PROMETEO Video PROJECT_BOOTSTRAP, ref `candidate/prometeo-video-studio-parallel-20261111`, blob `c1ea01fe4475c43e4affe6fbf4f475f93fc3d365`
- X01-RENDER, recibo de spike leído en `candidate/prometeo-video-spike-x01-render-20261111`. Su video MP4 también fue producido localmente y no publicado como binario.
