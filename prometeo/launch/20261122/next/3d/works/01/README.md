# INTERLOCUTORA · PROMETEO 3D W6 · tarea 01

**Identidad:** batch \`3d-w6-20261122\` · task \`3d-w6-20261122-01\` · **sólo N=01**.  
**Consigna de autoridad:** [LAUNCH.md (SHA blob 942c3ba8…)](../../../LAUNCH.md).  
**Rama propietaria:** \`candidate/prometeo-3d-w6-01-20261122\`.  
**Publicación aislada:** \`gh-pages:prometeo/launch/20261122/next/3d/works/01/\`.

## Experiencia

[Probar la escena en GitHub Pages](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/next/3d/works/01/)

Una intérprete original estilizada, en un estudio de luz cinematográfica, intenta formular una pregunta difícil. Dos elecciones disparan guiones y emociones distintos: vulnerabilidad o calidez, con cambios de pausas, mirada, cabeza, gesto de brazo, tono de voz y forma de boca. Un prólogo es repetible. La cámara alterna frente, perfil y primer plano. Se puede arrastrar para orbitar, usar la rueda para zoom, guardar una captura PNG y exportar estado de rig como pose JSON.

### Archivos editables

- **\`interlocutora-rig.js\`:** componente reutilizable \`createInterlocutora(THREE)\`, con geometría original en metros, cabeza, cuello, torso, cabello por cintas, mirada y párpados, visemas, dos morph targets faciales (smile / concern), emoción y pose, método \`update(dt, time, command)\`.
- **\`dialogue.js\`:** texto original, tomas / pausas / gestos, tabla de fonemas aproximados y \`stagePose()\`.
- **\`index.html\`:** escena WebGL, iluminación, tres cámaras, interacción táctil, audio, render y export.
- **\`PREPRODUCTION.deep-spec-v1.json\`:** decisiones trazables, referencias efectivamente consultadas, limitaciones y aceptación pendiente.

Todo el código, guion y mallas del personaje son originales para esta obra. Las bibliotecas **Three.js** (MIT) y **meSpeak** (GNU GPLv3 en el repositorio de referencia) se descargan como dependencias desde distribución estática externa. Se atribuyen aquí y se enlazan a sus proyectos; el repo no redistribuye sus archivos. La compatibilidad/licencia de cualquier redistribución integrada requiere su propia revisión antes de comercializar.

## Estado de prueba real

| Comprobación | Estado |
|---|---|
| Archivos fuente públicos recuperados por SHA de blob | **OBSERVED** |
| Sintaxis de los tres módulos JS; JSON válido | **OBSERVED** |
| DEEP-SPEC-1 validador canónico | **SPIKE_REQUIRED**, sin errores estructurales |
| Control de dos caminos, tres cámaras y stop en fuente | **IMPLEMENTED**, interacción **NOT_RUN** |
| Morph targets, labios, ojos y actuación corporal en fuente | **IMPLEMENTED**, render perceptual **NOT_RUN** |
| Generación local de voz + reproducción + audio / boca | **IMPLEMENTED**, escucha real **NOT_RUN** |
| Android WebGL, FPS, captura, visual desde perfil | **NOT_RUN** |
| Visita HTTP pública a GitHub Pages | **NOT_VERIFIED** |
| Aprobación humana / calidad profesional | **NO** |

**Qué NO se afirma:** la topología y la simulación de piel/cabello no compiten todavía con MetaHuman, Unity Enemies o personajes capturados. El lip-sync interpreta letras como visemas y se sincroniza al reloj del audio generado, pero **no** es alineación fonética profesional ni captura facial; hay que medirlo en navegador real y corregir desvíos. La voz estándar meSpeak es sintética y robótica, no actriz humana; el fallback Web Speech depende del dispositivo. El render y el audio están bloqueados en QA al no haberse observado GPU/audio real.

## Contraste profesional (fuentes examinadas)

1. [Unity Enemies](https://unity.com/demos/enemies): trabajo de ojos, piel, cabello y cinematografía que revela la brecha de fidelidad.
2. [MetaHuman · Audio Driven Animation](https://dev.epicgames.com/documentation/en-us/metahuman/audio-driven-animation): lip-sync fonoacústico real, comparador técnico, no herramienta integrada.
3. [Blender · Shape Keys](https://docs.blender.org/manual/en/5.3/animation/shape_keys/introduction.html): deformación facial por morphs.
4. [meSpeak](https://github.com/mikolalysenko/mespeak), [licencia upstream GPLv3](https://github.com/btopro/mespeak/blob/master/LICENSE): alternativa local, no llamada a servicio conversacional.

## Riesgo no resuelto y prevención para la próxima obra

**stage:** QA perceptual + voice. **cause:** falta de navegación WebGL con audio real y assets faciales profesionales. **preventive_gate:** prueba de render frente/perfil/primer plano, escucha de tres tomas y calibración fonética con audio auténtico; el archivo presente por GitHub no basta. **test:** capturas GPU y registro de reproducción con timestamp / FPS en PC + Android, incluyendo interrupción A→B. **owner:** estudio 3D, sin promoción a ROOT como estándar aprobado. **counterexample:** una web con escena compilable y botones funcionales, pero actriz de apariencia rígida o boca desincronizada.

## Retorno

La obra se publica como **preview de implementación**. \`STARTED_EVIDENCED\` y \`SOURCE_PUBLISHED\`, no \`VERIFIED\` visual ni \`HUMAN_APPROVED\`. La ruta de fuente se conserva en una rama propia y el lanzamiento/otras obras/W5 no se alteraron.
