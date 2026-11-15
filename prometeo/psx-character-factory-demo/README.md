# PROMETEO · PSX CHARACTER FACTORY · DEMO
Esta carpeta es una demostración aislada y experimental de una fábrica de personajes retro 3D en **Three.js**.

**Objetivo:** importar una fotografía, transformarla en una textura UV de rostro sobre una cabeza de auténtico volumen 3D, integrarla en un personaje original y mostrarlo en una escena de videoclub de 1998. La geometría del cuerpo y las texturas pueden sustituirse sin alterar el motor ni FORJA.

**Imagen de ejemplo:** retrato oficial de Donald Trump, 6 de octubre de 2017; fotografía de Shealah Craighead / Casa Blanca, dominio público por ser obra del Gobierno federal de Estados Unidos. Origen: https://commons.wikimedia.org/wiki/File:Donald_Trump_official_portrait.jpg . Utilizada **solo como referencia neutral de representación artística** y prueba técnica de semejanza, sin afirmación sobre actividades o declaraciones del retratado.

**Derechos:** no reutilizar fotografías privadas o ajenas sin autorización y revisión de licencia. La foto subida por el usuario se procesa localmente en navegador; no se envía a nuestro servidor. MediaPipe puede cargar binarios/modelos y emitir telemetría según condiciones de Google, explicar y obtener consentimiento según corresponda.

**Aislamiento:** nueva ruta `prometeo/psx-character-factory-demo/`; ningún archivo de FORJA, ARCHIVO ni catálogo global se modifica.

## Recursos reales producidos

- **Página pública** https://juanmanuelpm.github.io/Experimentos/prometeo/psx-character-factory-demo/
- **GLB de ejemplo reutilizable** [assets/psx-persona-001.glb](assets/psx-persona-001.glb) (283724 bytes, GLB real exportado y vuelto a importar con `GLTFLoader.parseAsync`).
- **Foto fuente PD** [assets/reference-trump-2017-500px.jpg](assets/reference-trump-2017-500px.jpg) (65512 bytes).
- **Código fuente** [studio.mjs](studio.mjs), interfaz [index.html](index.html).
- **Evidencia de capturas**: cuatro PNG WebGL (frontal, 3/4, perfil, escena) versionados en `JuanManuelPM/pruebas@candidate/prometeo-3d-factory-photo-character-v1-20261115` bajo `.../factory/psx-photo-character-v1/evidence/`, commit `f9b31b453c3a728ca13af8c99aac14aa9ac79724`.

## Pruebas reales

Ejecutadas en Chrome 156 headless, raster WebGL2 **SwiftShader** (no Android físico): `JS_PASS`, `PUBLIC_HTTP_200`, `WEBGL2_FRAME_VISIBLE`, fotografía sobre malla 3D, vistas en cuatro ángulos, `GLTFExporter` real y `GLTFLoader` roundtrip real: 1556 triángulos totales, 560 de cabeza, atlas Canvas 256², 305 particiones de malla y 86 instancias de material con textura. `305` son submallas de serialización, no modelos distintos.

**MediaPipe detectado en navegador real:** bug anterior `@0.10.22` 404 corregido por paquete real `@0.10.35/vision_bundle.mjs` y WASM de igual versión. Con foto pública real detectó 478 puntos faciales. También se probó el flujo de archivo local `<input type=file>` + detección → UV → export GLB → reimport: `roundtrip.passed:true`, `exportBytes:278732`.

**No aprobaciones falsas:** `PROFILE_LIKENESS=ART_REWORK` (foto frontal no asegura 360°), `HAIR_DESIGN=ART_REWORK`, `BODY_RIGGED=false`, `MOBILE_ANDROID_PHYSICAL=NOT_RUN`, `FORJA_IMPORT=NOT_RUN`, `HUMAN_ART_APPROVED=false`. El avatar de ejemplo es estático, **no un personaje profesional ya listo para actuación**. Esta demo es una etapa de fábrica, no una película.

El protocolo autónomo, alternativas y pruebas residen en el directorio `factory/psx-photo-character-v1/` del repositorio privado `JuanManuelPM/pruebas` rama `candidate/prometeo-3d-factory-photo-character-v1-20261115`. No cambiar FORJA, ARCHIVO, catálogo global, ni terceros. No subir fotos privadas al repositorio público.

