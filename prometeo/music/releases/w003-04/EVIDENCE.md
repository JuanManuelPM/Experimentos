# AGUA EN MOVIMIENTO · MUSIC W003-04 · segundo render comparable
**Task:** `music-w003-20261122-04` · **Owner:** music · **Nueva ruta:** `prometeo/music/releases/w003-04/` · **HUMAN_APPROVED:** NO.

## Entrega técnica comprobada
GitHub Actions [W003-04](https://github.com/JuanManuelPM/Experimentos/actions/runs/45057567425) terminó SUCCESS. Readback remoto de `MASTER.wav` 27,515,404 bytes, `MASTER.mp3` 3,745,375 bytes, cuatro stems FLAC, score editable y tres comparaciones MP3. Se lee el manifiesto con SHA256 real por archivo, calculado desde bytes por el runner.

**Obra:** 112 compases a 174 BPM, **155.983 segundos**, estéreo PCM16 44.1 kHz, cuatro stems [DRUMS, SUB_BASS, KEYS, AIR]. **1678** eventos DRUMS, 440 sub, 1016 keys y 224 air. El score original está en [SONGPROJECT.json](SONGPROJECT.json). Suma de stems contra máster: residual RMS 0.0000238; sample peak máster 0.900024; diferencia de firmas de breaks entre compases vecinos: mínima 15, mediana 32. Todas son mediciones técnicas, no evaluación estética.

**Abordaje A elegido:** interpretación por evento con matices de hats, ghost hits, fills por frase y 3 densidades. **Abordaje B descartado para producción:** loop de dos compases troceado con cambios de volumen. En el primer artículo local de 8 compases se generaron dos WAV reales PCM16 44.1k, con 14–22 diferencias de firmas de break A entre los siete límites; no se acreditó escucha humana del primer artículo.

## Cambios respecto de W002
- Brief previo fijado a blob `1045f4950c9f7ae11b455523ca664e087ec1b30d`; nuevo LAUNCH fijado a `5d7e6c2540cc49d998b7fe75fc1048d6f9cba80b`.
- Mantiene flujo especializado `prometeo-music-universal/2.0.0` **FROZEN_CANDIDATE**, blob `1423f13e08b743f418c42052613a6808b214d622`, SHA256 `6826ce13f4bd1e0d81b8a89bd7e6728668b85c44c68185b79426b00a36b8f05f`. El gate ART-DIRECTION es task-local; NO se promocionó el flujo propietario.
- W002: 96 compases, 174 BPM, 32 kHz, 2:13.914, 1385 eventos drum, cuatro FLAC, crítica auditiva NOT_RUN. W003: 112 compases, 44.1 kHz, 2:35.983, 1678 drum, tres previews de intensidad, editor WAV con licencia obligatoria. Estas diferencias **no** prueban automáticamente una mejor obra.
- No se sustituyó ninguna obra anterior ni se editaron los lanzadores anteriores.

## Licencias y auditoría
Toda la señal instrumental es síntesis generada con el código del proyecto. El editor [break_editor.py](break_editor.py) también implementa corte físico de WAV propio o autorizado: exige `sourceId`, `origin`, `license` y `permissionEvidence` antes de cortar. La producción publicada no utiliza audio de terceros. Escucha A/B con persona, true peak intersample, altavoces/mono de sala, y capturas comprobadas del reproductor en 390/1440: **NOT_RUN**.

### Referentes observados como texto (no se escucharon audios)
- [AllMusic: Calibre](https://www.allmusic.com/artist/calibre-mn0000540602): perfil de batería trabajada y melodía expresiva.
- [EDMProd: Liquid DnB](https://www.edmprod.com/how-to-make-liquid-drum-and-bass/): drum breaks, ghost hits y separación bajo/armonía.
- [Auditoría Music W002](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/repair/music/AUDIT_W002_SUMMARY.md): no confundir readback de archivo con juicio artístico.

**QBAR artístico:** NO CERTIFICADO. **Aprobación humana:** NO. **Audio binario:** GitHub Actions PASS. **Prueba URL de Pages con audio reproduciéndose:** pendiente/no confirmada.
