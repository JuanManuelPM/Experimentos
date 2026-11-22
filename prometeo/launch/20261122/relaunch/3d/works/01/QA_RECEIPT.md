# QA · Interlocutora W7/01

Actualizado: 2026-11-22T18:51:36.382Z. **Categorías de evidencia distintas: fuente, lógica, render, audio, aprobación.**

| Prueba | Estado | Evidencia o límite |
|---|---|---|
| Launcher, versión y brief | OBSERVED | Blob `58de659e2aa01c0746d59ca6f95c36bdc59f3030` y texto N01 recuperados, W6 intacto. |
| Modelo 3D y derechos | OBSERVED_SOURCE | README oficial r164 CC0; entrada Git del .glb de 463.988 B; bytes no descargados en este contenedor. |
| JS `actor-rig.js` y `dialogue.js` | PASS_SYNTAX | Parseo de ambos módulos, quitando imports/exports para compilar el cuerpo en V8. |
| JS dentro de `index.html` | PASS_SYNTAX | Parseo de la sección module con V8; NO equivale a ejecutar WebGL. |
| PREPRODUCTION JSON | PASS_JSON | JSON cargado; SHA del brief fijado. |
| DEEP-SPEC-1 | SPIKE_REQUIRED | Validador canónico `deep-spec-v1.mjs`: `{gate:"SPIKE_REQUIRED",errors:[]}`. |
| ART-DIRECTION-1 | FIRST_ARTICLE_REQUIRED | Validador canónico `art-direction-first-article-v1.mjs`: `{gate:"FIRST_ARTICLE_REQUIRED",errors:[]}`. |
| Actor renderizado frontal/perfil/detalle | NOT_RUN | No existe captura propia GPU; no afirmar corrección de encuadre. |
| Primera pantalla 390×844 y 1440×900 | NOT_RUN | Layout CSS definido; inspección real pendiente, no inventar PNG. |
| Dos elecciones + deformación + actuación corporal | IMPLEMENTED_SOURCE / NOT_RUN | Código define clips Yes/No y morph Sad/Surprised; interacción gráfica sin observar. |
| Voz en español y continuidad boca-audio | IMPLEMENTED_SOURCE / NOT_RUN | Browser SpeechSynthesis; no se escuchó ni midió sincronía en dispositivo. |
| GitHub Pages público | NOT_VERIFIED | Se verificará separadamente lectura remota del archivo en el branch de publicación; JavaScript/CDN/GPU independiente. |
| Calidad profesional / juicio humano | HUMAN_APPROVED=NO | Sin afirmación de calidad certificada. |

**Observación sobre representación.** La diferencia de estrategia resuelve a nivel de fuente el defecto anterior de construir anatomía humana con primitivas aisladas. RobotExpressive es deliberadamente low-poly, con diseño integral y referencia visible; NO es equivalente en actuación facial a MetaHuman, y su morph Surprise sirve sólo como apertura aproximada de boca.

**Faltante para gate de primer artículo:** captura REAL del personaje en frente, perfil y primer plano a 390 y 1440; probar que carga skin+morphs; probar A→B y B→A con audio y escuchar la voz. En caso de encuadre/rig incorrecto: SWITCH_REPRESENTATION a nueva escultura con blendshapes o asset de licencia verificada. No degradar a una cara de esferas.

**Limitación de entorno:** contenedor sin DNS público para GLB/CDN, Playwright local no demuestra modelo externo descargado. Ninguna traza de navegador remoto ni test Android está implicado por tests estáticos.

**Aprendizaje candidato de estudio:** `stage=PREPRODUCTION_ARTICLE;cause=primitive-collage W6;gate=glTF+facial rig source and observed multi-view spike;test=390/1440 frontal/profile/detail screenshots + speech timing;owner=studio-3d;counterexample=head modeled from separately glued geometric primitives`. No promoción al método privado sin verificación.
