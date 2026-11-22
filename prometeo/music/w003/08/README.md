# MAREA VARIABLE · W003 · 08

**Entrega:** código musical original + reproductor interactivo + WAV local real + fuentes modulares + pruebas. **Estados:** CODE_PUBLISHED, PCM_GENERATED_LOCAL, NODE_TEST_PASS, FIRST_FRAME_CAPTURE_REQUIRED, BROWSER_NOT_RUN, PAGES_HTTP_NOT_VERIFIED, HUMAN_APPROVED_NO.

[**Reproductor en GitHub Pages (HTTP no verificado)**](https://juanmanuelpm.github.io/Experimentos/prometeo/music/w003/08/) · [**Fuente candidata aislada**](https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-music-w003-20261122-08/prometeo/music/w003/08) · [**Fuente publicada en gh-pages**](https://github.com/JuanManuelPM/Experimentos/tree/gh-pages/prometeo/music/w003/08)

Sonido compuesto por cuatro stems sincronizados: `horizon` (armónico compartido), `calma`, `deriva` y `tormenta`. 48 compases a 96 BPM en cuatro movimientos, 120 segundos. Motivo de ocho notas rearmonizado, percusión sintética, diseño tímbrico FM, delays acotados. El código `score.mjs` renderiza PCM original y permite exportar WAV. `transition-engine.mjs` aplica última intención y cambios en el compás con curva equal-power de un compás, sin reiniciar las fuentes.

Los WAV completos fueron generados y entregados **localmente dentro del chat**, con archivo ZIP y audio descargable. No se subieron esos binarios al repositorio: el sitio los sintetiza al darle Play y permite exportarlos. La fuente GitHub no debe confundirse con un máster WAV hospedado remotamente.

### Reproducir el proyecto en Node

```bash
node tests.mjs
node render.mjs dist
```

No requiere dependencias npm ni librerías de samples. `render.mjs` emite cuatro stems, tres másters y recorrido de eventos, todos originales. Para un control perceptual honesto ver [QA.md](QA.md); para preguntas y estrategia ver [PREPRODUCTION.deep-spec-v1.json](PREPRODUCTION.deep-spec-v1.json). Aquí **FIRST_ARTICLE digital PCM PASS** no significa audio escuchado o navegador verificado.

### Comparación entre tandas

| Rasgo | W002 / 08 | W003 / 08 |
|---|---|---|
| Duración | 48 s | 120 s |
| Tempo | 80 BPM | 96 BPM |
| Render publicado anteriormente | PCM 16 kHz en rama assets | PCM 32 kHz local; remoto por síntesis al uso |
| Motor | última intención y crossfade de compás | cuantización única independiente de partitura y fuentes en fase |
| Observación | Node OK, navegador NOT_RUN | Node OK, navegador NOT_RUN |

**Conclusión causal:** cobertura de material y resolución superiores, prueba musical perceptual y rendimiento Android pendientes. Las versiones W002 se conservan intactas.

**Preview remoto con audio real:** [escuchar el recorrido de 120 s en Ogg Opus](escuchar.html) (24 kb/s mono, embed HTML; no reemplaza WAV local).
