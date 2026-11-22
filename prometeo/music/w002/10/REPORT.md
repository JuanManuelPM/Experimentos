# 👷 🎵 SALA DE CONTROL · W002 · 10/10

**Identidad:** `room=music` · `batchId=music-w002-20261122` · `taskNumber=10` · `taskId=music-w002-20261122-10`

**Estado comprobado:** `DELIVERED_LOCAL_VERIFIED_PUBLIC_AUDIO_NOT_PUBLISHED`.

## Qué se construyó

Obra original por síntesis, 112 BPM, 24 compases, **51.429 segundos**, seis secciones. Exportadas **tres mezclas WAV PCM16 estéreo**, **cinco stems FLAC PCM24**, partitura editable en JSON, generador Python, comprobador de mezcla reusable y comparador A/B con conmutación sincronizada, controles mono y seek.

**Dónde se escucha hoy:** ZIP `SALA_DE_CONTROL_W002_10.zip` adjunto directamente a la conversación ChatGPT que disparó este trabajo. No se ha subido el audio a GitHub; por tanto, esta página **no es un reproductor público y no debe mostrarse como uno**.

## Evidencia reabriendo los WAV

| Medida | A · base | B · revisión | Máster |
|---|---:|---:|---:|
| LUFS integrados | −20.00 | −20.01 | −18.05 |
| True peak **estimado**, oversampling 4× | −3.38 dBTP | −1.79 dBTP | −1.10 dBTP |
| Duración | 51.429 s | 51.429 s | 51.429 s |

- Diferencia A/B integrada: **0.01 LU**.
- La suma de los cinco stems de B reconstruye el WAV revisado dentro de tolerancia PCM16; máximo absoluto **0.00003064**.
- Revisión real: bajo centrado, reducción de enmascaramiento grave y medios bajos, balance instrumental corregido, espacio revisado. No hay cambio en los eventos musicales entre A y B.
- El primer render de B falló: **+0.45 dBTP** estimado y clipping. Después de corregir ganancia, el ensayo vuelve a pasar.
- Test parcial de panel: headless Chromium decodificó extractos reales de 2 s de los WAV y ejercitó transporte/A-B/mono sin excepciones de JavaScript. Navegación HTTP de la obra completa fue bloqueada por el entorno: **NOT_RUN**.
- **No hubo escucha humana, salas calibradas, mediciones certificadas de true peak ni aprobación artística.** Los tests son técnicos, no equivalentes a una mezcla comercial profesional.

## Registro durable

- [Rama exclusiva y README del trabajador](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-music-w002-10-20261122/PROMETEO/spaces/music-studio/production-universal/waves/W002/jobs/10/README.md)
- [Ficha DEEP-SPEC-1](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-music-w002-10-20261122/PROMETEO/spaces/music-studio/production-universal/waves/W002/jobs/10/PREPRODUCTION.deep-spec-v1.json)
- [Auditor de mezcla reusable](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-music-w002-10-20261122/PROMETEO/spaces/music-studio/production-universal/waves/W002/jobs/10/AUDIT_CHAIN.py)
- [QA numérico](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-music-w002-10-20261122/PROMETEO/spaces/music-studio/production-universal/waves/W002/jobs/10/MIX_QA.json)
- [Resultado y faltantes](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-music-w002-10-20261122/PROMETEO/spaces/music-studio/production-universal/waves/W002/jobs/10/RESULT.json)

**SHA-256 del ZIP local:** `8aaff3aac0911cc8393692057d44beb6d9704b9dc86f0e5556e66006b3b35abe`.

## Referencias realmente examinadas

- [ITU-R BS.1770](https://www.itu.int/rec/R-REC-BS.1770/en) para loudness y true peak.
- [Sonarworks: Mixing and Mastering with Reference Tracks](https://www.sonarworks.com/blog/learn/mixing-and-mastering-with-reference-tracks) para A/B nivelado, mono, imagen y profundidad.
- [Sonarworks: 6 Tips for Creating Masters that Translate Well to All Systems](https://www.sonarworks.com/blog/learn/6-tips-for-creating-masters-that-translate-well-to-all-systems) para separar mezcla y mastering, controlar nivel de referencia y transferibilidad.

No se reprodujeron pistas comerciales ni se copiaron sonidos de terceros. Una URL visitada o una métrica aprobada no constituye una evaluación auditiva de excelencia.

### Aprendizaje para revisión musical

`stage=M09` · `cause=AB_EXPORT_GAIN_STAGING` · `preventive_gate=TRUE_PEAK_AND_STEM_PARITY_BEFORE_FINAL_EXPORT` · `test=OVERSAMPLED_PEAK_AND_REIMPORTED_STEM_SUM` · `owner=music-studio` · `counterexample=B +0.45 dBTP, 0.1044 null error`.

**Próximo bloqueo:** alojamiento durable de los binarios y verificación de audio completo en URL pública, más escucha crítica independiente.
