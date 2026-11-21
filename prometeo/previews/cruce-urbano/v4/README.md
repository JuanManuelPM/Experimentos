# CRUCE URBANO · Integrador 10 · V4
**Candidato producido con método 2.3.0, brief original fijado.** La V4 conserva el cruce, 8 vehículos, 12 identidades, 80 s de fases semafóricas, fachadas, negocios, mobiliario, señalética, árboles, inspector y cámara orbital/libre de V3. Modifica materialmente la representación del reparto: ilustración vectorial original 2.5D animada en plano dentro de un mundo arquitectónico 3D.

## Qué observar
Abrir la escena y acercarse a Mara, Dante, Sol, Nico, Luz, Ivo, Uma, Leo, Ana, Tomi, Río o Eva. Cada figura tiene diferente prenda estructural, pelo, silueta, accesorio y papel urbano. Caminan/cruzan según las trayectorias previas, miran a cámara con vistas frontal, lateral y posterior y alternan poses de paso. El plano 2.5D **es una decisión estética explícita**, no una malla humana 3D ni un rig esquelético.
Cámara: arrastrar para orbitar; pellizcar para zoom; dos dedos para desplazar. Botón LIBRE alterna la cámara libre, deslizar para mirar y gesto de dos dedos para translación. En PC, WASD/Q/E, clic/arrastre y rueda; botón ? explica.

## Archivos principales
- `scene.mjs`: ciudad y simulación integrada, basada en V3
- `scene-config.mjs`: doce caminantes y ocho autos
- `traffic-core.mjs`: continuidad semafórica y trayectorias deterministas
- `art-characters.mjs`: **fuente original editable** de personajes ilustrados
- `citizens.mjs`: archivo de escultura V3 conservado solo como referencia, no importado por la escena

## Créditos y derechos
Three.js MIT (threejs.org). El camión GLB recuperado desde `../v1/assets/cesium-milk-truck.glb` procede de Cesium / Khronos glTF Sample Assets y requiere atribución **CC BY 4.0**. Los doce personajes ilustrados fueron creados para este candidato. No se empleó la base CesiumMan rechazada.
Método 2.3.0 SHA256 fijado `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`; brief SHA256 `e5d5b3b482dbc8e4c6dba1295a0ab26b3ef549a4355a74cfaf61a06c2af4bea5`.
No se afirma aprobación de arte, rendimiento en Android ni render WebGL comprobado si no se ejecutaron.
