# QA · MUSIC W003 / 07

| Control | Resultado | Evidencia / límite |
| --- | --- | --- |
| Fuentes humanas auténticas | OBSERVED | 4 WAV CC0 de GuitarJam descargados, SHA256 en SOURCE_PROVENANCE.json; guitarras DI, no micrófono |
| Licencia | SOURCE_VERIFIED | Tarjeta pública GuitarJam CC0-1.0 y ruta de cada WAV |
| Primer artículo | TECHNICAL_OBSERVED | 25 s exportados (18 s fuente + 7 s cola); análisis auditivo perceptual pendiente |
| Máster y stems | TECHNICAL_OBSERVED | Un máster WAV, OGG, 4 stems reales y dos WAV A/B |
| Duración | 85,114 s | ffprobe sobre OGG y 4 stems en Github Actions |
| Frecuencia | 44.100 Hz | ffprobe: OGG Vorbis 44.100 Hz, 2 canales |
| Articulación | 130 gestos | onset RMS no cuantizado + FFT local; mapa JSON |
| Paridad de stems | PASS_FLOAT | suma float del máster antes del PCM; no paridad binaria |
| Finito/no silencioso | PASS | aserciones Python |
| Página 390/1440 | LOCAL_DOM_OBSERVED | page.set_content en Chromium, sin overflow, no equivalente a HTTP Pages |
| Escucha crítica y aprobación | NOT_RUN | No se escuchó el máster con altavoces ni se pidió visto bueno humano |
| Audio independiente de navegador | NOT_RUN | Los tests ffprobe no demuestran playback real en Android |
| True peak y LUFS | PARTIAL | Estimación oversampled 4× y RMS, no medición EBU true-peak/LUFS formal |
| Gate FIRST-ARTICLE | STILL_REQUIRES_PERCEPTUAL | Test técnico PASS; el oráculo musical no está observado |

Las referencias profesionales se consultaron como **artículos**, no como grabaciones escuchadas. La primera fuente de Wikimedia fue bloqueada HTTP 429, no se falsificó ni se descargó mediante evasión. El recurso alternativo es DI. Un render válido no acredita calidad artística.

El código del trabajo, los originales, la procedencia, la sesión y el informe están en el mismo directorio. Acciones: [ver log del render exitoso](https://github.com/JuanManuelPM/Experimentos/actions/runs/45058076738).
