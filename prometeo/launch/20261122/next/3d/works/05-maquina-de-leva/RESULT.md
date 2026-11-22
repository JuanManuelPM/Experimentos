# PROMETEO · 3D W6 · 05 · Máquina de leva · Recibo de ejecución

- ID: `3d-w6-20261122-05`; rama exclusiva `candidate/prometeo-3d-w6-05-20261122`
- Brief fuente: [LAUNCH.md](../../LAUNCH.md), blob SHA `942c3ba8b851137886e959d2790771556e2d9f5d`
- Flujo observado al comenzar: `2.3.0`, SHA256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`
- QBAR `QBAR-1`; profundidad `DEEP-SPEC-1`, gate estructural **READY_FOR_FIRST_SLICE** (validador oficial ejecutado sobre JSON de ficha por motor JS)
- Estado: **DELIVERED_SOURCE_VERIFIED · MATH_RUNTIME_PASS · RENDER_GPU_NOT_RUN · HUMAN_APPROVED_NO**

## Artefactos públicos

1. [Abrir laboratorio interactivo](https://juanmanuelpm.github.io/Experimentos/prometeo/launch/20261122/next/3d/works/05-maquina-de-leva/)
2. [Código del visor](./index.html)
3. [Núcleo reutilizable de restricciones y diagnóstico](./mechanics.mjs)
4. [Preproducción versionada](./PREPRODUCTION.deep-spec-v1.json)
5. [Tests reproducibles en Node](./test.mjs)
6. [Manual de precisión y limitaciones](./README.md)

Archivo `index.html` y módulo `mechanics.mjs` creados en rama exclusiva y copiados a la ruta aislada `gh-pages`. Lectura posterior de GitHub confirmó los archivos. No se alteraron escenas antiguas W5 ni el flujo privado compartido.

## Implementación real

- Banco 3D original en Three.js con placa, guías, levas, ejes, rodillo, volante, resorte y correa plana de relación cinemática 1:1.
- Carreras y fases configurables, controles pausa/paso/reinicio, vistas frontal y oblicua, orbit móvil, lectura de velocidad, fuerza ideal, presión, y desplazamiento.
- Geometría de la leva y localización del rodillo derivadas de una **misma ley de alzada 4-5-6-7**; perfil compensado por radio en la normal de la curva de paso.
- Exportadores de mallas GLB, contorno nominal DXF, configuración JSON y captura PNG implementados en el visor; **exportación en navegador no ejecutada** en este test.

## Pruebas realmente ejecutadas

Motor JavaScript V8: lectura del `mechanics.mjs` publicado, ejecución de su cuerpo de funciones sin los marcadores ES `export` (sin sustituir fórmulas), **8 grupos PASS**:

| Oráculo | Resultado |
|---|---|
| Cierre angular completo | PASS |
| Meseta y retorno | PASS |
| Continuidad de primera y segunda derivada en fases | PASS |
| Tangencia leva-rodillo en 720 fases | PASS; error radial máximo `1.78e-14 mm` |
| Muestreo de segmento, presión y contacto, valores base | PASS; presión máxima ~`13.39°` |
| Emisión de DXF con nuevas líneas y contorno | PASS; `1467` líneas |
| Cambio de carrera modifica efectivamente contorno | PASS |
| Barrido de 24 configuraciones admisibles | PASS; presión máxima observada ~`25.15°` |

Pruebas adicionales: JavaScript de `index.html` compiló sintácticamente al eliminar imports de módulo para el análisis **PASS**; `DEEP-SPEC-1` oficial evaluó la ficha **READY_FOR_FIRST_SLICE** con cero errores. Esos checks prueban lógica y estructura, **no** el render.

## Referentes efectivamente examinados

- [CMU, Cams](https://www.cs.cmu.edu/~rapidproto/mechanisms/chpt6.html) · geometría de envolvente.
- [RoyMech, Cam and Follower](https://www.roymech.co.uk/Useful_Tables/Cams_Springs/Cams.html) · derivadas, presión y fuerza.
- [lu.ca Cam Design](https://lu.ca/calc/cam/) · continuidad de leyes de movimiento.
- [Rapier Joints](https://rapier.rs/docs/user_guides/javascript/joints/) · límites de revolutas/prismáticas estándar.
- [Three.js GLTFExporter](https://threejs.org/docs/pages/GLTFExporter.html) · contrato GLB.

## Evaluación honesta frente al benchmark

| Referente → intención | Decisión | Evidencia | Brecha |
|---|---|---|---|
| CMU → contacto conjugado | Envolvente normal del rodillo | 720/720 fases tangentes; error radial bajo | No se midieron fuerzas de contacto reales en GPU |
| RoyMech → movimiento físicamente interpretable | 4-5-6-7 y cálculo de presión/fuerza | Test de derivadas y 24 combinaciones | Sin fricción, fatiga, deformación o salto real |
| Visualización 3D industrial → comprender el mecanismo | Piezas y cámaras originales con controles | Implementación JS y readback GitHub | Render perceptual y táctil Android: NOT_RUN |
| Export CAD → conservar modelo | Mallas GLB, perfil DXF, JSON | Implementación y prueba textual DXF | Importación GLB/DXF externa: NOT_RUN |

No equivale a ingeniería manufacturera certificada. La correa es plana y las juntas están **restringidas cinemáticamente**, no integradas mediante solver dinámico de contacto. La calidad visual aún no ha sido verificada por persona. No se produjo vídeo ni captura verificada.

**Aprendizaje transferible al Estudio 3D:** la geometría conjugada debe probarse antes de construir la escena; no basta hacer girar geometrías y sincronizar dos animaciones. `stage=kinematic_representation; cause=independent decorative motion; preventive_gate=contact-envelope analytic spike; test=360° radial clearance and phase agreement; owner=3d studio; counterexample=ellipse+animated slider`. A ROOT se transfiere el principio general de distinguir física ideal y evidencia observada, no la fórmula 3D especializada.
