# Bajo el mismo techo · Shotlist

**ID:** `video-w001-20261122-07-bajo-mismo-techo`  
**Formato:** 12 s, 24 fps, 960×540, tres planos duros de 4 s.  
**Idea:** un gesto pequeño cambia el destino de otro ser.  
**Sin diálogo ni textos sobreimpresos.**

| Tiempo | Plano | Acción | Continuidad |
|---|---|---|---|
| 00–04 s | General nocturno, lluvia | Un robot amarillo cruza una azotea hacia una flor caída en una maceta. | Robot llega por la izquierda; maceta permanece a la derecha. |
| 04–08 s | Medio corto | El robot abre un paraguas coral sobre la flor, que levanta lentamente la cabeza. | Mismos personajes, posición, eje y paraguas, acercamiento de cámara sin inversión. |
| 08–12 s | General al amanecer | La flor florece y le envía un pétalo al robot; este mantiene el paraguas. | Se repite la geografía del primer plano; el gesto devuelve un regalo. |

## Reproducción

El archivo `index.html` contiene la animación Canvas2D determinista y controles de reproducción/seek. `render.py` abre exactamente ese documento en Chromium sin acceso externo, captura sus 288 fotogramas a reloj fijo, genera una atmósfera de audio propia (lluvia sintetizada, pulso, efectos de apertura y flores) y los codifica con FFmpeg a MP4 H.264/AAC.

```bash
python render.py bajo_el_mismo_techo.mp4
ffprobe -v error -show_streams -show_format bajo_el_mismo_techo.mp4
```

Dependencias en el *runner* (no en el teléfono del usuario): Python 3, NumPy, Playwright, Chromium y FFmpeg con libx264 y AAC. No utiliza material de terceros ni requiere descargas para visualizar la página publicada.

## Límite de prueba

`FILE_ENCODED`: sí, en el runtime del trabajo; `BROWSER_PREVIEW_RENDERED`: sí, en Chromium local; `PAGES_HTTP_VERIFIED`: pendiente cuando GitHub Pages procese el nuevo commit; `HUMAN_APPROVED`: no. Ninguna prueba automática sustituye la evaluación artística.