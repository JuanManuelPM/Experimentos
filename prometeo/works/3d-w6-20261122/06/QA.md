# HERBARIUM · 3d-w6-20261122-06 · evidencia, pruebas y límites

**Estado:** IMPLEMENTED / VISUAL_OBSERVED / FUNCTIONAL_PARTIAL / HUMAN_APPROVED=NO.
**Brief:** Bosque de cuatro estaciones, 06, según LAUNCH.md blob `942c3ba8b851137886e959d2790771556e2d9f5d`.
**Versión:** 0.1.0 · candidata · no afirma calidad profesional.

## Obra realmente escrita

- `index.html`: interfaz responsiva para cuatro estaciones, lluvia, viento, paseo automático, cámara y tres calidades.
- `app.mjs`: WebGL2 original; shader de terreno y luz por estación, cauce, lluvia, follaje animado, vegetación instanciada nativa GPU, tonos estacionales, niebla, control táctil y controles con teclado.
- `forest-core.mjs`: componente reutilizable sin dependencia de motor para bioma determinista, relieve, río, cinco especies, cobertura, semillas y presupuesto de calidad.
- `PREPRODUCTION.deep-spec-v1.json`: decisiones y límites estructurados con fuentes.

## Pruebas efectivamente ejecutadas

1. `node --check app.mjs` y `node --check forest-core.mjs`: **PASS**.
2. Prueba Node del modelo `generateTrees(609061,245)`: **245 árboles**, especies `0..4`, `floating=0`, `riverIntrusion=0`, **PASS**. Corresponden a altura y cauce procedural, no a colisiones exhaustivas reales.
3. Invariante de estacionalidad: caducifolias disminuyen cobertura en invierno; pinos mantienen cobertura. **PASS (logic)**.
4. Invariante de calidad: ECO contiene menos instancias y menor presupuesto de píxeles que ALTA. **PASS (logic)**.
5. Chromium 144 + Xvfb + SwiftShader/ANGLE, render WebGL2 real: **PASS**. Captura observada a **1024×640**, sin error JS en el primer cuadro; diagnóstico: 245 árboles, 29.581 instancias nominales dibujadas con calidad EQUILIBRADA, 12 draw calls aproximadas, **5 FPS sobre software**, no GPU móvil.
6. Chromium 144 + Xvfb + SwiftShader/ANGLE, viewport 480×700, calidad ECO activada de forma automática: **PASS**. Canvas **360×525**, 12.516 instancias nominales, **7 FPS en software**. No extrapolar estos FPS a teléfono real.
7. Captura del navegador real revisada: un paisaje tridimensional navegable potencial, vegetación diferenciada, curvas del río y controles visibles. **OBSERVED**. Brecha importante: follaje y sombras simplificados, siluetas todavía de geometría low-poly reconocible; requiere mejorar para competir con referencias profesionales.
8. Cuatro estaciones de una misma cámara, autoplay completo, colisiones en dispositivos reales, reflejos físicamente correctos y benchmark móvil comparativo: **NOT_RUN**. Intentos de prueba automatizada completa quedaron limitados por FPS bajo de SwiftShader / timeout de automatización.

## Referencia → intención → decisión → evidencia → brecha

- [Ghost of Tsushima, VFX](https://blog.playstation.com/2021/01/12/how-stunning-visual-effects-bring-ghost-of-tsushima-to-life/): viento global consistente entre vegetación y partículas → usar estado compartido de viento → shaders conectados para follaje y pasto; no dispone de colisión física fina de hojas.
- [Unreal Foliage Mode](https://dev.epicgames.com/documentation/unreal-engine/foliage-mode-in-unreal-engine): alta densidad por instancing → usar `drawArraysInstanced` por grupo botánico → **observado en WebGL2**, pero sin HLOD por clusters y sin occlusion culling avanzado.
- [Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html): reducir draw calls → agrupar hojas y pastos en VAOs instanciados → 12 calls aproximadas; todavía hay limitaciones severas en CPU renderizador software.

## Defectos preventivos hacia el estudio 3D

- `stage=visual QA; cause=foliage procedural oversimplified; preventive_gate=mandatory canopy silhouette comparison to photographic forest from first-person height; test=three distances in every season; owner=3D studio; counterexample=trees built from broad flat triangles without layered crown volumes`.
- `stage=performance QA; cause=GPU software renderer extremely slow, no profile on target Android; preventive_gate=explicit performance baseline using device class; test=same route/viewport across ECO/BALANCED/HIGH; owner=3D studio; counterexample=reporting desktop GPU estimates as measured mobile FPS`.
- `stage=weather QA; cause=visual delta across all seasons not captured in automated run; preventive_gate=4×same-camera screenshot and rain on/off before VERIFIED; test=pixel-difference plus semantic review; owner=3D studio; counterexample=declaring complete seasons from slider callback alone`.

## Licencia y derechos

Todas las formas, datos del valle, código y materiales visuales son originales de este encargo. Ninguna textura, personaje o asset ajeno fue copiado. Las referencias se usan solo para extraer técnicas de diseño; no constituyen fuentes de assets. El código y la interfaz se generaron sin incorporar recursos protegidos de terceros; cualquier licencia de distribución queda a decisión del propietario.

**Nota:** Esta entrega es una **versión candidata interactiva**, no una reconstrucción física de un ecosistema real ni una acreditación de nivel AAA, rendimiento móvil real o aprobación humana. La publicación en GitHub Pages requiere readback separado.