# PUNTO DE RETORNO · MUSIC W003 · 09

**Estado:** obra AUDIO RENDERED LOCAL / código fuente en ZIP entregado en chat; máster remoto GitHub **NOT_PUBLISHED**. No declarar PUBLIC_LISTENABLE. 

**Identidad:** `music-w003-20261122-09`; branch `candidate/prometeo-music-w003-20261122-09`; brief de relanzamiento Git blob `5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b`; flow candidato música v2.0.0 Git blob `1423f13e08b743f418c42052613a6808b214d622` SHA256 original declarado en W001 `6826ce13f4bd1e0d81b8a89bd7e6728668b85c44c68185b79426b00a36b8f05f`.

## Obra

6:42.581, 124 BPM, re menor, 208 compases, 8 secciones (32 intro y 32 outro), 6 stems originales: kick, percussion, bass, harmony, motif, space. El motivo reaparece en octava baja después del clímax. Master WAV 24 bit/44,1k, MP3, seis FLAC PCM16, premix, AB_equal_level.wav y proyecto editable `PROJECT.json`. Todos los audios y el ejecutable `render.py` están disponibles en la descarga ZIP de la respuesta de este WORK; no en este repositorio. NO atribuir a este repositorio bytes que no alojó.

El generador reutilizable `energy_map.py` del ZIP mide energía RMS, centroide espectral, proporción de subgrave, flux y transitorios sobre el **PCM real**. El archivo `PROJECT.json` aquí fija arreglo y partitura; `PREPRODUCTION.deep-spec-v1.json` conserva la dirección y los riesgos; `QA_RECEIPT.json` expone métricas reales, no un juicio artístico. Un HTML no sustituye el audio ni una escucha humana.

## QA y límites

- Render y decodificación local WAV/FLAC: **PASS** (402.581 s; 44.1 kHz; 6 stems de igual duración; cero frames clip).
- Máximo peak de muestra: **-5.87 dBFS**; RMS general **-23.28 dBFS**. No son LUFS ni true peak.
- VACÍO -29.19 dBFS RMS vs CUMBRE -21.80 dBFS. Clímax sube principalmente por arreglo; no prueba percepción.
- A/B de 6 extractos con RMS nivelado: **WAV exportado; escucha humana NOT_RUN**.
- Primer artículo: 8 compases de intro con audio real, pero la comparación del riesgo artístico antes de full render **NO SE COMPLETÓ**; FIRST_ARTICLE_REQUIRED.
- Chromium screenshot 390/1440: intento bloqueado por timeout, **NOT_RUN**.
- HTTP readback de máster en GitHub Pages: **NOT_RUN** (no hay máster remoto).
- HUMAN_APPROVED **NO**.

### Comparación 

oldBatchId=music-w002-20261122; newBatchId=music-w003-20261122. Mayor diferencia: 208 compases de audio real y 6 stems locales con detector calculado sobre bytes, no sólo score. La estrategia de assets es 100% síntesis original. No hay prueba causal de mejora artística vs W002 porque faltan escuchas comparativas.

**Aprendizaje transferible:** agregar gate que compare cambio de timbre y forma audible en el primer artículo *antes* del full render, no solo existencia de un WAV de intro.
