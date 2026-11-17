# PROMETEO 3D · UV Texture Editor V2 · receta ejecutable

## Fijación de origen y licencia
Fixture: **civil_azul.glb v0.1.3** (`SHA256 8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b`), producido por la cápsula CC0 anterior. Quaternius Ultimate Modular Men, conversión LuanDucate fijada al commit `fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08` y [licencia CC0](https://github.com/LuanDucate/Ducz.CharacterCreator/blob/fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08/public/models/LICENSE-Quaternius.txt). La fuente 0.1.3 queda INMUTABLE. No se copiaron modelos de GTA.

## Descubrimiento REAL de UV
El inspector Python sobre el archivo GLB auténtico verificó **5 meshes / 11 primitives / 1 skin / 24 animaciones**. De las 11 `TEXCOORD_0`, **10 están colapsadas al punto (0,1)**; únicamente `PROMETEO_FaceMouth_Original_UV` tiene UV original extendido. Que exista un atributo UV no significa que pueda recibir una fotografía. Ver `UV_PROFILE.source.json` (fuente inspeccionada) y el reporte de Actions.

La solución derivada **front-back-planar-v1** calcula U,V a partir de las posiciones (x,y) y el signo de la normal z sin modificar la posición de ningún vértice ni cambiar el índice/topología. Utiliza la mitad izquierda del atlas para superficies frontales y la derecha para traseras. Sí permite ubicar imágenes por malla; **no es unwrap manual de islas sin solapamientos**, y la proyección puede estirar costados o superponer superficies. Una UV derivada no se presenta como original. Guardar en el perfil de cada malla `uvMode` y `sourceRef` antes de texturar.

Mapa semántico **sólo para el fixture de SHA conocido**: mesh 0 primitive 0 manos/piel, 0:1 buzo; 1:0 y 1:1 zapatos; **2:0 cabeza/piel (cara)**, 2:1 cejas, 2:2 ojos, 2:3 pelo; 3:0 piernas/piel, 3:1 short; 4:0 boca original. El nombre propio no autoriza usar este mapa en otra topología.

## Editor web, archivos privados del usuario
Ejecutar `python -m http.server 8765` desde esta carpeta y abrir `http://localhost:8765/`. Three.js fijo v0.180.0 desde CDN, WebGL2 del navegador. A la izquierda OrbitControls y cámaras cuerpo/cara/manos, a la derecha seleccionar submalla, atlas TRIANGLES real o proyección explícita, importar PNG local, ajustar ubicación (arrastrar), escala, opacidad, rugosidad y metal, deshacer, exportar PNG/perfil/receta. Los PNG elegidos **no se suben a ningún servidor**. `flipY=false`, `THREE.SRGBColorSpace`.

El botón «Exportar GLB» usa `GLTFExporter` **solamente si** el GLB reimportado conserva cantidad total de skins y clips además de las firmas de mallas/bones/UV. En el primer canario Three.js multiplicó skins 1→11; ese export se trata como **ROUNDTRIP_BLOCKED**, NO como «rig conservado». No sustituir el GLB seguro de la etapa Python por ese exporter de la web.

## Vía automatizable sin mouse para IA
Se puede poner un PNG directamente en el rostro sin editar la geometría ni romper el rig glTF original:

```bash
python render_recipe.py TEXTURE_RECIPE.canary.json --images . --out face-atlas.png
python tools/build_uv_glb.py \
  --source civil_azul.glb --texture face-atlas.png \
  --mesh-index 2 --primitive-index 0 \
  --out civil_azul_uv_face.glb --report UV_BAKE_REPORT.json
python tools/inspect_glb.py civil_azul_uv_face.glb UV_PROFILE.derived.json --allow-derived
```

`build_uv_glb.py` verifica SHA256 del GLB original, recalcula los 11 accesores UV cuando están presentes, añade imagen PNG embebida, textura, sampler y una copia del material **solamente de la primitiva objetivo**. Reconstruye contenedor GLB auténtico glTF 2.0 con bytes originales de posiciones, índices, skin weights, joints, morph, nodos y clips; después **compara estructuralmente cada accessor no UV con el original** y rechaza cualquier diferencia. No requiere Blender; esta operación no es una verificación visual de cómo se deforma el personaje con 24 animaciones, que debe hacerse aparte.

Para una imagen diferente, actualizar `TEXTURE_RECIPE.json` con su filename y SHA256, `widthUV`, `cx`, `cy`, `opacity` y `sourceRef.meshIndex / primitiveIndex`. El renderizador PIL valida el hash y compone el atlas. La vista web y el script Python utilizan el mismo algoritmo `front-back-planar-v1`; la identidad del método forma parte de la receta.

## QA reproducible

```bash
node --check src/core.mjs
node --check src/editor.mjs
node --check tests/remote_browser.mjs
node --test tests/core.test.mjs
python -m unittest discover -s tests -p 'test_*.py' -v
```

GitHub Actions `ci/public-canary.yml` ejecuta SHA del original, inspección de UV real, bake Python, reimportación 3D Chromium+WebGL2, screenshots 01..05, diferencia de píxeles de misma cámara y UI 320px. Las evidencias se recogen como artefacto de workflow y se incluyen en el paquete de conversación si está disponible. Android físico, deformación animada en navegador e inspección de costuras en todas las prendas siguen sin sustituirse por pruebas de código.
