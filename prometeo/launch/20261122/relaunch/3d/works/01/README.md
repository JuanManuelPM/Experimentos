# INTERLOCUTORA · PROMETEO 3D · W7 / 01

**Identidad:** `3d-w7-20261122-01` · room `3d` · batch `3d-w7-20261122` · taskNumber `1`.
**Launcher fijado:** `gh-pages:prometeo/launch/20261122/relaunch/3d/LAUNCH.md` · blob SHA `58de659e2aa01c0746d59ca6f95c36bdc59f3030`.
**No modifica W6 ni obras anteriores.** Rama de trabajo `candidate/prometeo-3d-w7-20261122-01`.

## Obra

**[Abrir el primer artículo interactivo](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/relaunch/3d/works/01/)** · [fuente versionada en GitHub](https://github.com/JuanManuelPM/Experimentos/tree/candidate/prometeo-3d-w7-20261122-01/prometeo/launch/20261122/relaunch/3d/works/01).

Una escena 3D original de dirección con personaje robotizado coherente, no un humano fotorealista falso. El personaje GLB CC0 tiene rig esquelético y tres morphs faciales de autor; la interfaz proporciona cámaras de frente, perfil y detalle y dos respuestas originales. **Verdad:** tristeza, gesto de negación y confesión. **Cuidado:** expresión de apertura, asentimiento y cercanía. Ambos caminos alteran actuación y luz. Audio opcional generado mediante `SpeechSynthesis` del navegador en español, sin servicio conversacional propio ni petición a una IA en tiempo real. Lip-sync **aproximado** por reloj del audio, no alineación fonética profesional. La fuente está separada y editable.

## Archivos

- `index.html`: escena, layout móvil/escritorio, cambios de cámara, audio, decisiones, render WebGL.
- `actor-rig.js`: módulo reutilizable `loadActor(scene)`, mezcla de clips, expresiones, inspección de rig, serialización de pose.
- `dialogue.js`: dos rutas dramáticas originales y editables.
- `PREPRODUCTION.deep-spec-v1.json`: Book de decisiones, QBAR, riesgos, pruebas y único `artDirection`.
- `STAGE_TRACE.json`: Flow pin, etapas reales y estados.
- `QA_RECEIPT.md`: matriz de pruebas y límites.

## Derechos / dependencias

- **Modelo:** RobotExpressive.glb por Tomás Laulhé, modificaciones de Don McCurdy. CC0 1.0 explícita en [README oficial del tag r164](https://github.com/mrdoob/three.js/blob/r164/examples/models/gltf/RobotExpressive/README.md). Objeto Git `6fec9cfb4b41cb319c70d38cf86965aba5630964`, 463.988 bytes.
- **Three.js:** motor MIT, ESM anclado a `0.164.1`. Modelo servido desde jsDelivr con tag `r164`, archivo estático externo (no integrado). Si falla CDN o WebGL no se carga; no se reemplaza con una miniatura que finja el actor.
- **Audio:** guion propio y voz que ofrece el navegador. Sin garantía de voz española instalada o de ejecución 100% offline a nivel del sistema operativo. No se incluyen grabaciones de terceros.

## Comparación con W6

**Antes:** cabeza ensamblada con SphereGeometry y varias piezas pegadas para nariz, mejillas, ojos y cabello, superposición de UI en móvil. **Ahora:** importación de geometría skinned con morphs de fuente verificada; escena dedicada, 3 cámaras y controles por fuera del actor. El cambio está en la familia de representación, no en un shader cosmético. **No se ha demostrado mejora perceptual en ejecución real** hasta disponer de capturas de los mismos viewports y observación humana.

## Estado

`SOURCE_PUBLISHED` condicionado a readback · `JS_SYNTAX_PASS` · `DEEP_SPEC_SPIKE_REQUIRED` · `FIRST_ARTICLE_REQUIRED` · `WEBGL_CAPTURE_NOT_RUN` · `AUDIO_LISTEN_NOT_RUN` · `MOBILE_NOT_RUN` · `HUMAN_APPROVED=NO`.

La escena puede abrirse como preview/primer artículo. No se declara obra completa, QA visual aprobada ni sincronización labial profesional. Ver `QA_RECEIPT.md`.
