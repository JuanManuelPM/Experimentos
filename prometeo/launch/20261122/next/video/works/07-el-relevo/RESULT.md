# 🎬 PROMETEO · VIDEO W002/07 · EL RELEVO

**Encargo** `video-w002-20261122-07`, solo número **7**. Fuente [LAUNCH 07](../../video/LAUNCH.md) (ruta completa: [W002](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/launch/20261122/next/video/LAUNCH.md)). Published LAUNCH blob `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`.

## Resultado exportado y publicado

- [**Reproducir EL RELEVO en GitHub Pages**](https://juanmanuelpm.github.io/Experimentos/prometeo/previews/video/w002/07-el-relevo/) · [MP4 directo](https://juanmanuelpm.github.io/Experimentos/prometeo/previews/video/w002/07-el-relevo/EL_RELEVO_07.mp4). Página con reproductor HTML5 real; **HTTP externo independiente no comprobado en este entorno**.
- Cortometraje animado original sin diálogos de 28.000 s, ocho planos, un mitón rojo que cambia de propietario/significado entre anciano, niño y perro. Todos los sonidos y dibujos son originales.
- **Video remoto reproducible como archivo:** [blob GitHub MP4](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/07-el-relevo/EL_RELEVO_07.mp4); GitHub Contents muestra 1 522 782 bytes, blob SHA `117580410a4af00a22e407a0b9432fd1c8a6f215`. [Reporte de exportación CI PROBE.json](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/07-el-relevo/PROBE.json): SHA256 `da94704e8ab291b3977c071fe4133ac6fa567083dca0eba7fd22e8a4434f1c40`, 448 fotogramas, 960×540, 16 fps, H.264, AAC 32 kHz.
- [**GitHub Actions W002/07**](https://github.com/JuanManuelPM/Experimentos/actions/runs/45045051537): `completed/success`. El primer intento `45044980662` falló por dependencia FFmpeg ausente; se corrigió el workflow y el reintento codificó y publicó efectivamente el medio.
- [Código de render original reproducible](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/07-el-relevo/render.py), [pruebas QA ejecutadas en CI](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/07-el-relevo/qa.py), [grafo de continuidad original](https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/video/w002/07-el-relevo/SilentContinuityGraph.json). Las fuentes también se preservan en la rama exclusiva, sin tocar W001 ni otros números.
- Se conserva la exportación local de la conversación: MP4 SHA256 `3e7c6b8853fafcf3c8ee63e95ceebcbee4c43f176dc4d64a3cc2056c0e51ac60`. Diferencias menores de bytes son normales por variación de versión de encoder/metadata; ambas versiones pasaron QA mecánica.
- QA: local y runner `ffprobe`, decodificación íntegra `ffmpeg`, grafo de ocho tramos y dos handoffs **PASS**. DEEP-SPEC-1: `READY_FOR_FIRST_SLICE` (trazabilidad lógica), **no aprobación artística**.
- **Límites:** acceso HTTP público mediante cliente independiente `NOT_RUN`; espectadores sin contexto `NOT_RUN`; escucha crítica independiente `NOT_RUN`; `HUMAN_APPROVED=NO`. No anunciar calidad cinematográfica profesional certificada.

## Fuentes y control de continuidad

- [Dossier y QA, rama exclusiva](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-video-w002-07-20261122/PROMETEO/spaces/video-studio/productions/w002/07-el-relevo/README.md)
- [SilentContinuityGraph-1, ocho planos y dos handoffs](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-video-w002-07-20261122/PROMETEO/spaces/video-studio/productions/w002/07-el-relevo/SilentContinuityGraph.json)
- [PREPRODUCTION.deep-spec-v1.json](https://github.com/JuanManuelPM/pruebas/blob/candidate/prometeo-video-w002-07-20261122/PROMETEO/spaces/video-studio/productions/w002/07-el-relevo/PREPRODUCTION.deep-spec-v1.json)

## Benchmark y brechas

Se consultaron textos/fichas de [Kitbull (proceso)](https://www.waltdisney.org/education/talks/behind-scenes-disney-and-pixars-sparkshorts-film-kitbull-2019-director-rosana), [Bao](https://www.pixar.com/bao), [The Present](https://vimeo.com/152985022), [SparkShorts](https://www.pixar.com/sparkshorts). No se visualizaron esas películas completas en este WORK. Se transfirieron principios (puesta, acciones, identidad de objeto), no material protegido.

La animación procedural lograda presenta una **brecha artística importante** frente al acting, los materiales y las expresiones de esas referencias. Recomendación a Video Studio: ensayar contactos de mano/prop y tres keyframes de interpretación antes del render completo; test de comprensión por espectador sin explicar trama. No se cambia el flujo activo automáticamente.
