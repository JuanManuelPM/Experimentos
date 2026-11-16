# ÚLTIMA PARADA · PROMETEO Estudio 3D
**Candidato artístico Three.js** · 2026-11-15 · URL pública prevista: https://juanmanuelpm.github.io/Experimentos/prometeo/psx-after-hours/

## Hipótesis dirigida por causa (no otro “corto con controles”)
La película anterior *No hay vuelta* tenía conductor hecho de malla externa pero sin clip de sentarse, pose de torso que penetraba asiento, brazos disparados al frente, vehículo aparentemente en reversa, lluvia LineSegments uniforme, calle negra y coche blanco. Un simple detector de defectos no los repara.

**Cambio probado en CÓDIGO de esta nueva versión:**
- Reemplazamos el acting inventado por un actor GLB con clips auténticos **Idle/Walk** de Three.js `Soldier.glb`. `AnimationMixer.setTime(t)` y pesos controlados por función de playhead. El personaje CAMINA, no desliza sin animar. No manos falsas sobre un volante.
- Conservamos `sedan_blue.glb` PSX licenciado, estacionado y separado: no posibilidad de conducir en reversa ni cabina falsa. Modelado real con materiales y textura propios; ajuste de albedo de superficies claras, luz de estación motivada y 2 faros que se activan en remate.
- Lluvia mediante **InstancedMesh con 3 capas y atlas RGBA soft** (no `LineSegments`); posición según tiempo, pseudoaleatoriedad seeded, color de instancia basado en distancia a faroles. Es un modelo óptico estilizado, no simulación física.
- Calle y estación construidas como **un único set**: letrero ESTACIÓN 24 HORAS, alero, vitrinas con luz, veredas, pintura, cunetas, fachadas por parcelas, luces con sombra y charcos con halo vinculado a fuentes. Son mallas semánticas de arquitectura, no personajes compuestos de geometría básica.
- Nuevo guion sin TTS, voz genérica eliminada; gestos por clips reales, 9 planos cinematográficos, secuencia de 30 segundos y audio original de ambiente/huellas.
- `?frame=12` muestra un fotograma programático concreto, estado `window.__AFTERHOURS_QA` permite distinguir loading/clip/actuación/duración sin panel sobre la película.

## Fuentes reales, no atribuir GTA
**Personaje:** `Soldier.glb`, Three.js examples, URL fija en commit `ab6386854db0dcebd9800b95a9a5effde6071b19`: `https://github.com/mrdoob/three.js/blob/ab6386854db0dcebd9800b95a9a5effde6071b19/examples/models/gltf/Soldier.glb`. Los ejemplos de Three.js distribuyen código MIT; la documentación de three.ws los identifica como clips MIT; revisar la atribución individual del modelo antes de empaquetarlo como asset propio. No fue copiado al repositorio, el navegador lo carga desde CDN fijado al commit. **No es el modelo de GTA de Rockstar, ni se distribuyen sus assets propietarios.**
**Vehículo:** PSX Vehicles Free por heyheythere, licencia **CC BY 4.0**, fuente https://heyheythere.itch.io/psx-vehicles-free (licencia del ZIP inspeccionada en trabajo previo). GLB reutilizado desde `../psx-night-drive/assets/sedan_blue.glb`. Modelo modificado vía parámetros de material y transform en tiempo de ejecución; atribución visible.
**Técnica de actuación:** https://threejs.org/manual/pages/loading-3d-models.html · https://threejs.org/docs/pages/AnimationMixer.html
**Técnica de instancing:** https://threejs.org/docs/pages/InstancedMesh.html

## Storyboard determinista
0–3.7 general estación · 3.7–7.2 traveling lateral caminata · 7.2–10.1 pies sobre asfalto · 10.1–13.3 retrato personaje en movimiento · 13.3–16.1 detalle letrero · 16.1–19 coche vacío · 19–22.5 mirada · 22.5–26.1 faros encendidos · 26.1–30 retirada final. Los textos naturales son deliberadamente escasos.

## Matriz de garantías
| Señal | Estado |
|---|---|
| Código JS sintaxis | PASS (new Function después de quitar imports) |
| Asset remoto 3D y clips declarados en fuente | SOURCE_CONFIRMED (no equivalen a load) |
| Soldado/auto efectivamente cargados y clips reproducidos en navegador | NOT_RUN hasta reproducir mediante navegador GPU |
| Física de lluvia | NO: óptica de instancias, no particle physics |
| Script generativo de mallas humanas | NONE |
| Material/iluminación calificados con capturas nuevas | ART_PENDING |
| Reproducción WebGL de inicio a fin, dispositivo Android | NOT_RUN |
| MP4 | NO, cortometraje web |
| Aprobación humana | NO |

## Transferencia universal
Esta rama aporta una decisión que futuras IAs deben aplicar: cuando la escena demanda *caminar* seleccionar una malla con `Idle/Walk/Run` antes de elegir estética secundaria; si demanda *conducir*, seleccionar primero actor sentado y cabina compatible, o **no filmar conducción**. Los controles de QA anteriores indican si falla, pero la fábrica debe tener rutas de sustitución y componentes funcionales. Handoff: `JuanManuelPM/pruebas@candidate/prometeo-3d-solution-first-factory-v1-20261115`, método bajo `factory/solution-first-v1/`.

**No se modificaron FORJA, ARCHIVO 03:17, Night Drive anterior ni catálogo general.**
