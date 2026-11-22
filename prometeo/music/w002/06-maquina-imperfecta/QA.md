# MÁQUINA IMPERFECTA · QA W002/06

- **Tarea:** music-w002-20261122-06, original electro synthesized, 48 bars / 116 BPM / 100.310375s.
- **Fuente de artefacto:** `renderer.js`, `SONG_PROJECT.json` en esta carpeta; maestro WAV original PCM16 estéreo 24k, cinco stems obtenidos del mismo render.
- **Render reproducible:** PASS, dos renders completos con 4,814,898 muestras float32 de máster comparadas, 0 diferencias. Esto prueba reproducibilidad dentro del mismo runtime de JS, no across browsers/engines.
- **Suma de stems a premaster:** PASS, residual RMS = 6.44002974468659e-9 (float32), ratio RMS=4.879477195352808e-8. Master después de bus tanh. Máster pico=0.89 FS; no se midió true peak intersample.
- **Eventos por pista:** kick 151, percussion 338, bass 224, sequence 144, atmosphere 65 = 922.
- **Spike previo DEEP-SPEC-1:** PASS. En 12 compases, parámetro cutoff +340 Hz dio diferencia RMS=0.002208 en secuencia tras igualar RMS. Gate `READY_FOR_FIRST_SLICE` comprobado con validador canónico. No iguala escuchar dos versiones.
- **Receta:** patch graph y rutas de modulación serializados, render `node renderer.js 24000` o `node renderer.js 48000` desde rama privada de la obra.
- **Riesgos y límites:** navegador HTTP, reproducción real Web Worker, export de WAV y compatibilidad Android físico **NOT_RUN**; escucha humana y benchmarking de mezcla profesional **NOT_RUN**. Referencias de Barbieri, Bitwig y SOS leídas, no audios analizados. No reclamar calidad comercial ni aprobación humana.
- **Rama dueña:** https://github.com/JuanManuelPM/pruebas/tree/candidate/prometeo-music-w002-06-20261122/PROMETEO/spaces/music-studio/production-universal/waves/W002/works/06-maquina-imperfecta
