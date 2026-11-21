# LÚMEA · Criatura fantástica · Personajes 04 / Wave 004
**Estado:** candidato publicado, pendiente de evaluación humana en navegador real.
**Brief literal e inmutable:** Quiero una criatura fantástica original no humana, de anatomía e identidad visual memorables, con movimiento de extremidades y emociones expresadas por su cuerpo y mirada.
**Brief SHA256 declarado en lanzador:** 282a5a32b0a770230fb616f54c236d2c91810f4c5b6c36da5774a656f81e3fc4
**Método fijado:** `prometeo-3d-production@2.3.0`, SHA256 `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.

## Resultado
Personaje fantástico **no humano** creado como fuente geométrica 3D orgánica: silueta tallada de campana, máscara nacarada, dos aletas membranosas, cinco filamentos de corona, seis apéndices flexibles de malla, tres ojos con pupila orientable y parpadeo, y gestos corporales diferentes (Curiosa, Alegre, Cautelosa).

- `creature.mjs`: **recurso reutilizable**. Exporta `createCreature()`, devuelve `{root, update(time, mood, gaze), metadata}`. Puede importarse en otra escena Three.js.
- `index.html`: estudio web de presentación, sin juego completo. Gestos orbit/pinch y selección de emociones. Dependencia Three.js 0.187.0 fijada en el importmap.
- Botón **GLB ↓**: exporta el instante de la pose como archivo glTF binario estático. Las animaciones son procedurales en el código fuente, no clips embebidos en ese GLB.

## Diseño preventivo, rutas consideradas antes de autoría
A. Escultura orgánica propia en THREE.BufferGeometry con mallas de membranas y aletas deformables: anatomía realmente 3D, distintos perfiles y sin avatar humano genérico. **Elegida** por permitir ángulos libres, control de ojos y autoría editable.
B. Collage original 2.5D de partes ilustradas y animación de planos: viable y de bajo costo, pero sacrifica perfil/espalda y exportación de malla en un estudio 3D.
C. Asset externo licenciado/adaptado: no elegido porque el brief exige una especie original y un asset ajeno requeriría adaptación extensa para garantizar identidad y rig; no se afirma haber descargado ningún modelo.

**Derechos:** geometría y programa originales creados en esta tarea, sin mallas/ilustraciones importadas de terceros. Única dependencia externa: Three.js, licencia MIT https://threejs.org/license/. Importar el módulo no requiere nuevas licencias de imagen.
**Investigación verificada:** https://threejs.org/manual/pages/installation.html y https://threejs.org/docs/pages/GLTFExporter.html, consulta 2026-11-21.

## Límites honestos
No hay una prueba de render sobre Android, ni capturas reales ni aprobación estética humana. La página necesita acceso de red para cargar Three.js de jsDelivr. La exportación es una pose estática, no una animación GLB independiente. El personaje es procedural y su malla sí se genera de forma tridimensional; no se afirma un esqueleto exportable ni rig profesional de Blender. El usuario puede evaluar el candidato y corregir el **flujo universal** de la siguiente tanda; este brief no se modifica.

## URL
https://juanmanuelpm.github.io/Experimentos/prometeo/previews/wave004/personajes/criatura-fantastica/v1/
