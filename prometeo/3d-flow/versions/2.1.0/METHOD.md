# PROMETEO · Estudio 3D · Método 2.1.0

**Ámbito:** sólo Estudio 3D. **Cambio localizado:** decisiones de selección, representación y animación de personajes; flujo para corregir el flujo con evidencia. Se heredan **sin modificaciones** las reglas de escenario completo, cámara, ambiente, props, efectos y publicación del [Método 2.0](../2.0.0/METHOD.md).

**Identidad inmutable:** `FLOW_INDEX.json` → `versions/2.1.0/flow.json`, SHA-256 `1a5b7e270f725974208236eb6b4e1a299f397eb976677f49d8e2143332506db8`. Versiones 2.0 y anteriores quedan intactas. Las diez unidades de Ola 002 quedaron fijadas explícitamente al flujo 2.0: este cambio **no reescribe su brief ni relanza esas producciones**.

## Qué originó esta corrección

Se inspeccionaron seis fuentes públicas y seis trazas/manifest privados de Ola 002. Los hechos se pueden recuperar en `CHARACTER_DECISION_AUDIT.json` con rutas, blobs y etapas. El usuario rechazó **todas las familias visuales humanas observadas** en la nueva tanda. En cambio, destacó la fluidez aparente del actor del Cruce: se conserva esa valoración **sólo para movimiento**, no para rostro, geometría ni skin.

- Bondi: se conocía la deficiencia de `seated-crowd` con esferas y cilindros, pero se usó igual.
- Cruce: doce instancias de un único `CesiumMan`, con colores y accesorios, no doce identidades.
- Estación/Submarino: repitieron el mismo CesiumMan por tener animación.
- Entrevista: dos GLB de apariencia Quaternius/civilian recoloreados, pero rostros y actuación no aptos para closeup; ser GLB real no es aprobación.
- Respawn: malla original de loft/profilado en código; no son primitivas obvias, pero sus proporciones/cara no satisfacen al usuario. Algunas trazas repitieron el mismo texto genérico en muchas etapas.

## Prioridad: corregir donde se decidió mal

**Primera causa frecuente = recuperación/adquisición**, no sólo QA final:
1. `recovery/CHAR_AUDIT`: leer todas las observaciones humanas y fuentes, versiones/SHAs y fábrica especializada previa, no reciclar lo que ya fue rechazado.
2. `planning/CHAR_ALLOC + CHAR_REJECT`: seleccionar método de autoría distinto por proyecto; no contar recolor ni cambio de accesorio como familia visual nueva. Usar `CHARACTER_STRATEGIES.json` y `NEGATIVE_CHARACTER_REGISTRY.json`.
3. `acquisition/CHAR_SELECT`: investigar y comparar **dos fuentes/autorías materialmente distintas**, con fecha/URL, licencia por asset, rig, texturas y disponibilidad real de bytes. Elegir según distancia del plano y estilo, no por comodidad.
4. `classification/CHAR_PARTS`: crear `CHARACTER_COMPONENT.json` (esquema `CHARACTER_COMPONENT.schema.json`) con visualSourceId, rigId, motionPackId, behaviorId independientes.
5. `humanoid/CHAR_LOOK + CHAR_ALTERNATE`: pedir 3 vistas neutras, closeup de cara para actor dramático y acción bajo luz neutral. Si aparece modelo previamente rechazado, **cambiar de fuente antes de montar**, siempre que exista alternativa viable. Si no, terminar la escena completa con FAIL visible y explicitar limitación; no regresar al viejo canario ni prometer 100% de perfección.
6. `acting/CHAR_RETARGET`: una buena animación no obliga a copiar el modelo. Compatibilidad real: huesos, rest pose, eje frontal, root motion, longitud de zancada, pies. Reusar las antiguas fábricas de personajes y movimiento; NO afirmar retarget terminado por tener un array de nombres de huesos.
7. `qa/CHAR_QA`: verificar FACE / BODY / UV / RIG / MOTION / ACTING por separado. `WEBGL NOT_RUN` no es PASS ni veto artístico. `ART_APPROVED` sólo si la persona evalúa capturas/renders auténticos.
8. `repair/CHAR_CAUSE`: enlazar feedback y screenshots a la primera decisión errónea usando `flow-repair.mjs`. Cambiar procedimiento de etapa, no prompt humano. Versión nueva, prueba de regresión y SHA.
9. `persistence/CHAR_PROMOTE`: conservar fuente, alternativas, motivo elegido y errores. La biblioteca visual aprobada **empieza vacía**; movimiento de Cruce = candidato parcial. Para estándar compartido exigir estética aprobada por humano y segundo consumidor real.

## Exploración deliberadamente diversa

`CHARACTER_STRATEGIES.json` contiene **10 rutas experimentales materialmente diferentes**: escultura/UV Blender, humanos paramétricos MPFB, rig propio/Mixamo, Quaternius remodelado, blend shapes de actuación facial, VRoid/VRM, fuentes CC0 diversas, KayKit reeditado, UV creado con Blockbench y multi-view impostor para fondo.

No son diez modelos ya producidos. **Siete** de las diez escenas anteriores requieren actores por brief: Respawn, Bondi, Estación, Ascensor, Entrevista, Submarino y Cruce. Las otras tres (Ventilador, Reloj y Arcade) no justifican crear humanos de oficio. El asignador `assignDistinctStrategies` preserva 7 rutas diferenciadas y 3 alternativas en el laboratorio. Las rutas que necesitan Blender, Adobe ID o VRoid sólo pueden usarse si realmente están disponibles; documentar sustitución en lugar de repetir Cesium.

**Fidelidad objetivo:** convencimiento e identidad de personajes de un juego 3D comercial cuidado. No se prometen personajes exactamente de GTA ni se usan modelos o animaciones extraídas sin derechos.

## Fábricas anteriores que se reutilizan

1. Character Flow V3, rama privada `candidate/prometeo-3d-character-flow-v3-20261116`, ruta larga `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/3d-studio/work-decision-flow/v3/character/`. Leer `FLOW_CHARACTER.md`, `GATES.json` y `character_gate.mjs`. Fallo histórico: `Casual.glb` tiene 4 mallas, 4 skins, 49 articulaciones y **0 clips**; un skeleton no demuestra Walk.
2. Character Motion Factory v1, rama `candidate/prometeo-3d-character-motion-factory-calibrar-20261116`, ruta `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/3d-studio/factory/character-motion-v1/`. Leer `PLANS_A_B_C_D.md` y `SOURCE_AUDIT.md` para planes, medición de facing/pie y retarget.
3. Los contratos de dueño `character:*` de `candidate/prometeo-3d-specialty-factories-v1-20261116`; otros módulos consumen por ID+SHA, no reescriben assets de otro autor.

### Fuentes primarias de tecnología, para INVESTIGAR, no garantía de disponibilidad

- <https://www.makehumancommunity.org/mpfb/about.html> · MPFB Blender, paramétrico/rig.
- <https://quaternius.com/packs/universalbasecharacters.html> · modelos CC0 y posibles animaciones separadas.
- <https://threejs.org/docs/pages/module-SkeletonUtils> · `retargetClip`; exige mapeos y poses correctas.
- <https://www.makehumancommunity.org/about/license.html> · licencias y outputs estándar vs terceros.
- <https://pixiv.github.io/three-vrm/docs/index.html> · VRM no es GLB simple; usar loader adecuado.
- <https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html> · Mixamo requiere Adobe ID.
- <https://kaylousberg.com/game-assets/character-animations> · pack de clips, no face kit.
- <https://docs.blender.org/manual/en/latest/addons/scene_gltf2.html> · export glTF de shape keys/movimiento.
- <https://www.blockbench.net/> · editor de formas/UV deliberadas.

## Verificación y límites

`character-strategy.mjs` audita la elección, independencia de componentes, compatibilidad de movimiento y promoción. `flow-repair.mjs` propone deltas y aplica cambios **sólo a un objeto de nueva versión**, no escribe GitHub ni se autoaprueba. `flow-audit.mjs` comprueba que 280 nodos, 370 aristas y los enlaces por etapa existan. Las pruebas estructurales son evidencia de SOFTWARE, no de personajes bellos. Se permitirá FULL SCENE CANDIDATE con fallos visibles; queda prohibido `ART_APPROVED` ficticio.

**Alcance de este turno:** corregir el flujo, NO editar producciones previas, lanzar diez workers, ni cambiar el router universal de otros estudios. Cada nueva ola debe fijar qué flow hash usa y preservar sus briefs humanos si se quiere comparar el método.
