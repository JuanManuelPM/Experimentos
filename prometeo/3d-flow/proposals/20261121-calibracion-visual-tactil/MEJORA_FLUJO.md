# PROMETEO · CALIBRAR · Feedback humano transversal a Estudio 3D
**Registro:** 2026-11-21 (Argentina). **Estado:** CAPTURADO + PROPUESTA CANDIDATA, NO PROMOVIDA, EFECTO NO PROBADO. **Destino:** próxima versión del flujo 3D después de integración y regresiones; **no** reparación individual de los ejemplos. Propietario: `JuanManuelPM/Experimentos:prometeo/3d-flow/`.

## Autoridad, límites y contexto
- Feedback humano recibido tras revisar obras W4/W5: arcade de objetivos, Cocina Umbría 001 y 002, FORJA, ciudad, colectivo/tren y personajes. Es observación **reportada**, no inspección propia de cada runtime.
- Fuente del método vigente: `gh-pages:prometeo/3d-flow/FLOW_INDEX.json`, CURRENT_CANDIDATE `2.3.0`, SHA canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.
- Contexto de ROOT: `JuanManuelPM/pruebas@prometeo/control:sistemas/metodo/CONTRATO_COMPARTIDO.md`; crítica previa de interfaz `candidate/prometeo-3d-unified-ux-feedback-20261121:PROMETEO/spaces/studio-3d/ideas/UNIFICACION_ESTUDIO_3D_20261121.md`.
- No cambiar brief inmutable, no recrear Cocina/FORJA/ciudad/bondi de esta tanda, no usar sus outputs como canon estético, no alterar trabajos activos ni `FLOW_INDEX.json`, ni archivos inmutables `versions/2.3.0/`. No promover automáticamente esta propuesta ni afirmar que ha sido ejecutada. Todo el conocimiento aplicable se incorpora al **flujo de producción futuro**, conservando una sola raíz compartida.
- Método de aprendizaje: observación -> clase de fallo -> hipótesis técnica (no certeza) -> decisión **antes de construir** -> primer artículo barato -> artefacto completo -> evaluación humana posterior -> revisión de flujo para siguiente tanda. No convertirlo en una campaña de tests estéticos post-entrega ni aumentar el número de prompts humanos.

## Patrones observados (sin deducir causas como hechos)
| Código | Observación humana reportada | Riesgo de proceso que debe neutralizarse |
|---|---|---|
| F01 | Arcade de tocar/disparar puntos: formas de escala inconsistente, geometría extraña, poco acabada; idea jugable interesante | Elegir composición, siluetas y lenguaje gráfico **antes** de poblar la pantalla; evitar primitives/fallbacks presentados como arte final; gameplay insuficientemente profundo |
| F02 | Cocina 001: falta techo, clipping y cámara que choca/atraviesa estructuras; mala visibilidad | Arquitectura sin modelo de oclusión/cámara exterior-interior, falta de prueba temprana de line-of-sight |
| F03 | Cocina 001: actor se desplaza mirando hacia atrás | Dirección locomotora y eje local del modelo no alineados ni calibrados con trayectoria |
| F04 | Cocina 002: movimiento mejora, pero persisten visión y calidad; elemento flotante sin causalidad comprensible y sin cambio de cámara | Actuación/affordance y anclajes de props indefinidos; cámara sin gramática adaptativa para acción |
| F05 | FORJA y otros: UI parece una web con paneles, no una herramienta o juego inmersivo | Mezclar shell/depuración/navegación con la superficie de la obra; doble UI y exceso de chrome |
| F06 | Ciudad: bloques enormes, casa sin lógica en el centro, perspectiva débil | Distribución espacial y escala sin composición urbana, gradiente de detalle ni reglas de tipología |
| F07 | Bondi/tren: forma, asientos, calles y detalles pobres | Falta de estudio de proporciones, piezas funcionales, referencias y contextualización de la escena |
| F08 | Personajes siguen abstractos o genéricos | Tratamiento insuficiente de silueta, cara, ropa, rig, materiales, expresión y coherencia con estilo |

## Cambio causal: calidad desde la elección de representación
Las reglas 2.3.0 de «prevención», «cámara», «cerramiento», «no humano de primitivas» y «UI minimalista» existen, pero **no impidieron los defectos reportados**. No basta copiar los mismos títulos o escribir «más calidad». Al compilar un nuevo brief, seleccionar criterios concretos según el **tipo de obra** y resolver el mayor riesgo con prueba **anterior a la autoría masiva**. Rechazar rutas de representación que ya no pueden producir un primer artículo convincente; reemplazar estrategia antes de multiplicar activos malos. Un fallo temprano no impide entregar el intento completo, pero exige cambiar la decisión mientras aún es barato.

### C01. Dirección artística y consistencia de escala
Antes de crear recursos masivos, definir guía mínima específica del proyecto: escala métrica u otra referencia interna explícita, familia de siluetas, proporciones, materialidad, luz, cámara y densidad de detalle por distancias. Probar un módulo de escena con 1 actor/objeto significativo y un encuadre objetivo. Comparar con 2 referencias legales y apropiadas al estilo elegido, sin copiarlas. Rechazar piezas con discrepancias de tamaño, perspectiva, pivote o acabado que hacen que parezcan pegadas al azar. Mantener diversidad artística: no imponer «realismo» a un arcade estilizado, sí **coherencia e intención**.

### C02. Cámara interior y oclusión, parte del diseño arquitectónico
El interior debe tener techo, paredes y cerramiento coherentes con el mundo. Su visualización no puede volverlo ilegible. Diseñar explícitamente el **contrato de cámara** según modo primera/tercera persona, cenital, libre o cinematográfico:
- zona segura de visión de actor y objetivo con distancia, clipping cercano y colisiones del brazo/cámara separadas de las del jugador;
- manejo activo de oclusión: cortar/transparentar/fade **solo** paredes y techos que obstruyan el objetivo, restaurarlos al cambiar ángulo; o cambiar a cámara interior/primer plano cuando resulte adecuado. No borrar permanentemente medio edificio;
- colisiones y límites que impiden atravesar mallas, no un clamp que deje la cámara adentro de una pared; transiciones suaves, encuadre estable, cámara de contingencia, reset y orientación táctil;
- primer artículo: circulación junto a puerta, bajo techo, contra esquinas y detrás de muebles, visto desde dos alturas y orientación horizontal/vertical. Si el encuadre queda bloqueado, cambiar la técnica **antes** de decorar la escena.

### C03. Locomoción y actuación legibles
Para cada actor móvil fijar ejes locales (`modelForward`, `worldUp`) y la relación de animación/root motion con su velocidad efectiva. Para marcha **normal** el producto escalar entre forward transformado y dirección de desplazamiento debe ser positivo y suficientemente alineado; backpedal/strafe son excepciones **explícitas del brief**. Verificar inicio, giro, parada, contacto de pies, trayectoria y respuesta a obstáculos en un trayecto de prueba pequeño antes de poblar el mundo. Cada interacción necesita: objeto anclado o físicamente justificado si flota; alcance/contacto; animación de intención; cambio visible de estado; reacción o sonido; cámara que permita entender qué sucedió. Un objeto inexplicable no cuenta como «interacción».

### C04. Espacios, vehículos y recursos con lógica de uso
Resolver el layout primero: zonas, circulaciones, accesos, proporciones, centro de interés, horizonte, silueta lejana, capas cerca/medio/lejos, densidad de detalle y continuidad de materiales. Para ciudad: manzanas, jerarquía vial, lotes, setbacks/alturas compatibles, calles y fachadas con escala de peatón y variedad controlada, no cubos arbitrarios ni una casa aislada sin contexto. Para transporte: estudiar volumen de carrocería, ventanas, ruedas, accesos, altura de techo, disposición/cantidades de asientos, espacio circulable y relación vehículo-calle; construir al menos un detalle visible de autoría no genérico y comprobarlo desde el plano en que se usa. Priorizar un sector convincente antes de clonarlo; el entorno completo conserva el alcance original.

### C05. Pantalla completa y UI universal
Obra/visor/juego usan el área completa disponible (incluyendo móvil y safe areas), sin un dashboard HTML disfrazado de experiencia. Un único shell universal de ROOT: control pequeño de dos líneas arriba a la derecha -> X; navegación contextual secundaria cuando corresponda; herramientas y diagnóstico **dentro del menú** y solo mientras se usan. Sin doble encabezado FORJA, barras fijas, botones redundantes, paneles de instrucciones o estadísticas que invadan obra. No esconder controles indispensables al juego: feedback de ritmo, vida, puntuación u objetivo pueden ser HUD genuino, discreto y legible. FORJA se abre en modo edición, no obliga al visitante a ver un sitio de administración.

### C06. Mecánica musical táctil, si el brief pide arcade/rhythm
El arcade puede evolucionar a un **juego de ritmo táctil original**, sin trasplantar canciones, mapas de notas ni interfaz propietaria de osu!. El flujo debe evaluar en preproducción tres gestos: toque al pulso, mantener con inicio-duración-fin, y deslizar/seguir trayectoria; combinaciones/chords solo si son útiles y legibles en la pantalla. La canción original/licenciada continúa con base temporal de audio monotónica; calibrar latencia táctil/audio, ventanas de juicio, offset, pausa/reanudación y respuesta a pérdida de foco. Sonidos/haptics/partículas **se suman** cuando se acierta, de forma sincronizada y satisfactoria; no simular tocar una melodía simplemente cambiando el color del punto. Seleccionar una estética coherente (hit circles/hold paths/pulsos), tamaños táctiles, ritmo visual, progresión de dificultad y rendimiento móvil. El primer artículo debe demostrar una secuencia corta con tap + hold + slide sincronizada y legible antes de producir el repertorio completo.

### C07. Personajes y objetos no genéricos
Antes de escoger técnica, determinar rol dramático y distancia de cámara, diseñar silueta, proporción, expresión, ropa, articulación, color/material y coherencia con mundo. Elegir entre modelo editable de calidad, recurso con licencia, autoría 2D/2.5D integrada, o técnica alternativa justificable. No «mejorar» un maniquí de cápsulas cambiándole color/iluminación. Evitar que un objeto tenga escala extraña por transformaciones independientes: fijar jerarquías locales, anclajes, medidas consistentes y revisar en relación con personaje y set.

## Puerta preventiva compacta por intención (sin formularios humanos)
El ejecutor genera **internamente**, antes de la producción costosa, un recibo breve:
1. `experienceType`, `heroView`, `inputMode`, `referenceScale`, `artLanguage` y `comparables` (referencias no copiadas).
2. `risk`: máximo tres fallos capaces de arruinar el resultado; `firstArticle`: prueba material mínima que distingue las dos rutas de mayor impacto; `decision`: ruta elegida, alternativa y motivo.
3. `contracts` relevantes según brief, **no todos por defecto**: `cameraOcclusion`, `motionForward`, `worldUseLogic`, `vehicleScale`, `uiShell`, `rhythmTiming`, `characterLookdev`.
4. `previewEvidence` de esa prueba cuando herramientas lo permitan. Si no es posible, `NOT_RUN` y método de mitigación, nunca PASS inventado. Inmediatamente pasar a la construcción completa; el recibo no es el producto.
5. `delivery`: conservar URL, branch, commit, visualización real o NOT_RUN y comentarios humanos **como nueva evidencia**, no como evaluación automática estética.

## Verificación de una eventual versión 2.3.1
El integrador del flujo (no los workers de W5) toma estos requisitos, fusiona una versión **inmutable** futura y valida regresión en al menos dos obras de clases distintas, por ejemplo una escena interior y un arcade/vehículo, con escenarios de prueba reproducibles **antes** de promover `FLOW_INDEX.json`. Una comparación debe demostrar que la nueva **decisión previa** evitaría el error, no solamente que un test posterior lo detecta. Comprobar que conserva briefs, licencias, trabajos independientes, una sola UI universal y que no obliga nuevas preguntas al humano.

**Resultado de este registro:** mejora candidata documentada y transportable. **No prueba que ninguna escena existente esté corregida ni que el flujo vigente esté actualizado.**
