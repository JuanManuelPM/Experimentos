# MAREA VARIABLE · W003/08 · QA (evidencia acotada)

**ID:** music-w003-20261122-08 · **Brief SHA (Git blob):** `5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b` · **Flow:** music v2.0.0 (Git blob `1423f13e08b743f418c42052613a6808b214d622`, canonical SHA256 `6826ce13f4bd1e0d81b8a89bd7e6728668b85c44c68185b79426b00a36b8f05f`).

## Ejecutado y observado localmente

- `node tests.mjs`: **PASS**, valida 48 compases, 96 BPM, 120 segundos, cambios rápidos y repetidos, última intención antes de frontera, cambios a mitad de frase, energía constante, longitud y finitud de las cuatro señales, maestro RIFF PCM.
- `node render.mjs dist`: **PASS**; produjo `dist/stems/{horizon,calma,deriva,tormenta}.wav`, `dist/masters/{calma,deriva,tormenta,recorrido-interactivo}.wav` y `PROJECT.json`. El render WAV fue realizado en el entorno de la conversación; **los archivos binarios completos no están subidos a GitHub**.
- `ffprobe` sobre `recorrido-interactivo.wav`: 120.000000 segundos, 7,680,044 bytes, WAV PCM 16-bit mono, 32,000 Hz. Misma duración para masters; cuatro stems con fase y SR comunes.
- RMS / peak sample en másters: Calma **0.0495 / 0.2025**, Deriva **0.0540 / 0.2141**, Tormenta **0.0634 / 0.2751**, Recorrido **0.0555 / 0.2633**. Son **sample peaks**, NO true peak ni LUFS.
- Costura `abs(first-last)` del recorrido 0.00394: análisis numérico, **NO garantía de ausencia perceptual de click**.
- Proyecto standalone HTML sin imports externos y módulos reutilizables con misma síntesis; el HTML fue persistido en rama candidate y ruta aislada gh-pages.

## No ejecutado / bloqueos

- **CHROMIUM_BROWSER_NOT_RUN**: intentos automatizados `localhost` y `file://` respondieron `net::ERR_BLOCKED_BY_ADMINISTRATOR`. No hay capturas 390/1440, uso real de slider Web Audio ni escucha del soundtrack en el navegador. La presencia del código de Play no verifica ejecución.
- **INDEPENDENT_AUDIO_LISTEN_NOT_RUN**: ninguna escucha humana crítica A/B; no afirmar mezcla profesional ni ausencia audible de cortes.
- **PAGES_HTTP_NOT_VERIFIED**: GitHub contenido readback verificado, pero navegación externa a Pages no confirmó la respuesta HTTP del visor.
- **REMOTE_WAV_NOT_PUBLISHED**: los WAV están entregados en la conversación como ZIP y enlace sandbox; el repositorio publica el renderizador Node y player que genera sus bytes. No atribuir a GitHub archivos binarios ausentes.
- **FIRST_FRAME_CAPTURE_REQUIRED**: falta evidencia fotográfica real 390/1440. **HUMAN_APPROVED=NO**.

## Invariantes / mejoras y brechas

A comparación de W002/08 (48s, 80 BPM, másters a 16 kHz en rama assets), W003/08 tiene 120s, 96 BPM, PCM a 32 kHz, cuatro secciones de 12 compases y una interfaz simplificada. Esto **no demuestra superioridad artística**. La decisión de pasar de 16 a 32 kHz y de una secuencia de 16 a 48 compases mejora la resolución y oportunidad de arco, pero el oído todavía debe juzgar timbres y transiciones.

**Riesgo pendiente de ingeniería:** el HTML sintetiza 4×120 s de PCM en el hilo principal al inicio; en dispositivos de memoria limitada puede bloquear la primera interacción. Prueba correctiva futura: worker, reproducción progresiva o stems precalculados con verificación HTTP. No ocultarlo tras overlays de progreso.

**Defecto de proceso observado:** aunque el diseño preventivo precedió la composición, la ficha JSON se persistió después del primer render; la prioridad de registrar el gate antes de producción no quedó demostrada por timestamps. La comparación futura debe medirlo.

**Aprendizaje candidato:** `stage=M06 / cause=browser render without real playback oracle / preventive_gate=probe Web Audio in real browser / test=three slider changes + audio capture / owner=music-studio / counterexample=W002/08 published code with browser NOT_RUN`. No promoción automática del flow.
