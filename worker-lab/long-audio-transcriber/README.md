# Long Audio Transcriber

Transcriptor de archivos largos para `JuanManuelPM/Experimentos`.

- Reutiliza la credencial Groq guardada en IndexedDB del mismo origen: `worker-lab-fast-vault / provider_tokens / groq` (con fallback al vault legacy).
- No contiene claves ni las imprime.
- `whisper-large-v3` es el modelo por defecto; `whisper-large-v3-turbo` queda seleccionable.
- Archivos de hasta 24 MiB se envían directamente.
- Archivos mayores se comprimen localmente primero a AAC mono 16 kHz / 32 kbps. Sólo si siguen superando 24 MiB se parten en tramos de 10 minutos con 4 segundos de solape.
- Los tramos se envían secuencialmente, con contexto del tramo previo mediante `prompt`, y el solape textual se deduplica al unir.
- Retry automático para 429/5xx y cancelación con `AbortController`.
- No hay diarización ni resumen: el resultado es transcripción cruda, copiable y descargable como TXT.
- El audio no se almacena en GitHub; el audio que se transcribe sí se envía a Groq.
