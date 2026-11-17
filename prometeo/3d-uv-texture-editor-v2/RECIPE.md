# PROMETEO · UV Texture Editor V2 · Receta editable

## Propósito y fuente inmóvil
Esta herramienta **no modela** otro rostro ni cambia el NPC original. Ancla `civil_azul.glb` 0.1.3, SHA256 `8bec29e84c9f0d082cc8ac08fd8cbe898dfcaa82abc9e1fa1bb13de46bfa5e4b`. Original CC0: Quaternius Ultimate Modular Men, derivación de LuanDucate `fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08`. Derivado v0.1.3: `JuanManuelPM/Experimentos@candidate/prometeo-3d-npc-civilian-build-20261116`. Licencia https://github.com/LuanDucate/Ducz.CharacterCreator/blob/fcd215b58eec5c9ed97d0ba5f696d0e7dc085e08/public/models/LICENSE-Quaternius.txt .

## Lanzamiento
Servir este directorio sobre HTTP estático (`python -m http.server 8000`). Requiere navegador con WebGL2 y acceso a `cdn.jsdelivr.net` para Three.js 0.180.0 y al GLB público para carga remota. También admite **GLB local** sin subirlo. En teléfono, las columnas apilan visor arriba y atlas abajo. Cuando falle WebGL o red, el status debe indicar el error. El HTML y scripts son propios, con licencia MIT y dependencias externas respetadas.

## Uso
1. Seleccionar la malla GLB que **tiene TEXCOORD_0** (panel derecha). Se dibujan triángulos UV reales, no zonas inventadas.
2. Cargar un PNG local. Queda en el atlas como capa con centro (0.5,0.5), ancho 0.5 del atlas, opacidad 1. Arrastrar para ubicarlo; sliders ajustan escala y opacidad. La textura se asigna a material PBR de la malla elegida, con `flipY=false`, color sRGB, sin afectar otros materiales.
3. Exportar `texture_<mesh>.png`, `TEXTURE_RECIPE.json` y `UV_PROFILE.json`. `TEXTURE_RECIPE` **no incluye** datos privados de la imagen; contiene filename+sha256 de cada capa y parámetros, para reconstrucción determinista por IA (`render_recipe.py`). Guardar copias de los PNG originales localmente.
4. Ejecutar `python render_recipe.py TEXTURE_RECIPE.json --images ./ --out texture.png` para crear el atlas sin mouse. El renderer PIL verifica SHA256 para evitar aplicar la foto equivocada.
5. El botón GLB invoca `GLTFExporter`, reimporta con `GLTFLoader`, compara mallas, recuentos de vértices, índices, UV, piel, bones, morph targets y clips. **Una coincidencia estructural no garantiza apariencia o deformación visual**: observar animaciones si exporta. Si falla, se cancela export y queda PNG+receta como salida segura.

## Limitaciones honestas
No hay base de segmentación semántica probada. Si cara y ropa ocupan el mismo material o atlas, el editor dibuja todas las islas de la malla; no dice que cada polígono sea "nariz". La orientación frontal +Z es una hipótesis, no calibración anatómica. El botón GLB es experimental, no garantiza rig preservado por diseño. El GLB fuente debe conservarse inmutable.

## QA
`node --check src/core.mjs && node --check src/editor.mjs && node --test tests/core.test.mjs && python -m unittest discover -s tests -p 'test_*.py'`. Los tests de código **no** prueban WebGL. Hacen falta capturas reales frente/perfil/UV y roundtrip del NPC en navegador antes de publicar una demo aprobada.
