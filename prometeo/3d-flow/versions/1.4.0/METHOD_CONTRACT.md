# PROMETEO · Estudio 3D · Método 1.4.0: el prompt NO se optimiza

**Fuente de verdad:** `FLOW_INDEX.json` → `versions/1.4.0/flow.json`; SHA-256 `267130c29bacef26ed2e41ba855b5f20166300a73d8cffef82d36b051f44ca7d`.
**Prioridad:** aprovechar el esfuerzo en producir una **obra completa y visible**. Que un test falle o el agente crea que algo salió feo **nunca** cancela ni reduce a un canario. Calidad inicial se mejora por elección técnica, no reescritura artística después de entregar.

## Principio central: separación entre problema, método, ejecución y aprendizaje

- **Brief humano:** natural, corto, literal. Se versiona como `BRIEF.md` con ID y SHA-256 exacto. No añadirle a posteriori un paquete de consejos (Arcade, luces, mallas...). Sólo se cambia al comenzar **otro benchmark** y con autorización humana.
- **Flujo:** interpreta el mismo brief usando sus subflujos de representación, personajes, props, escena, FX, cámara, movimiento, presentación mecánica y web. Cada revisión V1.2/V1.3/V1.4 puede tomar decisiones diferentes sin modificar el problema original.
- **Compilación del brief:** `COMPILED_PLAN.json`, generado por la IA desde `BRIEF.md` y el flujo fijado. Es un artefacto interno y cambia con el método; jamás se presenta como otro prompt manual que el humano deba refinar.
- **Primera producción íntegra:** construir todo el alcance pedido con máximo esfuerzo disponible. No es aceptable terminar en un único objeto/primer artículo si se pidió una escena amplia.
- **Registro factual:** cada etapa deja un rastro corto en `STAGE_TRACE.json` al trabajar, marcado `EXECUTED`, `SKIPPED` o `NOT_RUN`. Un registro EXECUTED tiene `action`, `decision`, `conclusion`, `evidenceLevel` y `evidenceRefs`. Las otras etapas explican por qué no se ejecutaron. **La traza no reemplaza los archivos de la obra y no bloquea su entrega.**
- **Revisión humana después:** se compara el primer intento con los anteriores y se anotan errores de usuarios. `synthesize-wave.mjs` agrupa por etapa, patrón y proyectos; las propuestas se revisan para modificar la siguiente versión del flujo, nunca el brief ni las ramas de los proyectos en curso.

## Nuevos nodos del grafo

### br0 · Brief literal congelado
Conservar texto y hash, sin agregar supuestos técnicos. El mismo ID+SHA debe utilizarse para comparar distintos flujos. **No afirmar** que los briefs propuestos en `BENCHMARK_BRIEFS.v1.json` son los originales de Ola 001: están marcados `DRAFT_NEEDS_USER_CONFIRMATION`.

### br1 · Compilador de escena
De un brief corto inferir internamente proyecto completo: prioridades visuales, número/tipo de objetos, personajes, sonido, acciones, cámaras, recursos, técnicas, entorno, interfaz y entrega. Registrar por qué se seleccionó cada técnica. **La calidad de la compilación es parte de lo que estamos evaluando**.

### ql0 · Recetas de calidad transferible
Leer `QUALITY_TRANSFER.json`. Arcade fue la referencia favorita del usuario: gabinete de silueta extruida en vez de caja, arte UV 512×1024, múltiples materiales, ribetes, elementos mecánicos cuidados, luces y niebla, cámara y pantalla real `CanvasTexture` controlable. Cruce Urbano fue otro favorito: GLB auténticos con licencia y animación/tráfico, HUD y cámara guiada. Ascensor destaca por luces, composición y contraste de materiales. Ventilador es referencia de despiece. **No copiar una paleta única.** Las recetas deben traducirse a cada obra en silueta, materiales, textura, iluminación, presentación, acción y navegación.

Arcade usa `prometeo/prop/signal-cabinet@0.1.0` y `live-surface@0.1.0` como prototipos extraíbles; deben comprobarse con segundo consumidor y derechos antes de promocionarlos como capacidad global. La pantalla configurable podría recibir juegos/aplicaciones propios futuros, pero **esa función genérica aún no está implementada**. Cruce usa Cesium Man/Milk Truck CC BY 4.0: preservar crédito y fuente si se reutiliza. El modelo de entrevista sí era GLB de Quaternius, pero su presencia no garantiza un rostro útil en plano cercano.

**Pruebas de transferencia:** el estilo resultante debe respetar la obra y la cámara. Un gabinete con cuerpo extruido es buena elección; una cara humana que parece piezas ensambladas no. Una pared art déco de cajas y materiales elaborados puede verse excelente. Para submarino, el shader UV de agua debe acompañarse de cue espacial 3D/parallax cuando se pida profundidad; planos simples no deben fingir una profundidad inexistente. Para cruce, diferenciar cámara cinematográfica guiada de cámara con órbita táctil libre: ninguna es obligatoria si no sirve al pedido.

### web0 · Arranque compatible
Seguir `WEB_RUNTIME_CONTRACT.md`. La estación tiene un loader exclusivo `fetch .gz → DecompressionStream → Blob import` y un mensaje genérico «WebGL2». Son riesgos **comprobados en código**, no causa probada del fallo en el Android del usuario. Preferir módulos JS normales, carga comprobable por path, errores tipificados `FETCH/DECOMPRESS/MODULE/WEBGL/SHADER/ASSET`, manejo de context loss, fallback 2D/imagen genuina si está disponible, sin mentir sobre que es WebGL.

Ejecutar `browser-check.mjs` como advertencia estática; no abortar si falla. No afirmar que una captura es real si no se pudo hacer. El producto completo se conserva y la preview técnica se publica cuando sea legal/técnicamente posible aunque sea defectuosa.

### tr0 · Traza corta por etapa
Generar una fila por cada una de las 17 etapas. Máximo orientativo 45 palabras por etapa, sin rellenar etapas inventadas ni dedicar el trabajo principal a documentación. El usuario podrá decir «el problema fue en adquisición» y leer exactamente qué asset eligió, qué técnica usó y con qué evidencia. `validate-trace.mjs` prueba la consistencia del reporte, no califica estética ni censura resultados.

## Contratos que permanecen vigentes
- **No autocancelación:** D39/D40/D41/D42 son diagnósticos orientativos. D29-D38 no bloquean la obra candidata. QA factual después del intento; evaluación artística por usuario entre tandas.
- **No hardcode de proyecto en módulo compartido:** los datos por obra viven en configuración. Capacidades API y atlas están versionadas con hashes y licencias.
- **No inventar assets, tests, render ni enlaces.** Las restricciones legales y de privacidad sí aplican.
- **No tocar ramas ajenas**, catálogo global ni FORJA desde esta corrección; comparar versiones V1/V2/V3 bajo un mismo ID de proyecto.
- **No prometer trabajo de muchas horas en segundo plano:** el chat ejecuta el trabajo posible en su turno. La capacidad disponible debe dirigirse a producir, no a justificar recortes.

## Cómo medir la mejora REAL
Mismo `briefSha256`, distinto `flowSha256`, comparar videos/previews y resultados artísticos en los diez proyectos. Si cambia el brief, el ensayo deja de aislar el efecto del flujo. Diferenciar fuente publicada, aplicación cargada, GPU renderizada, compatibilidad móvil y aprobación artística humana. El flujo aprende de errores de más de un proyecto mediante patrones; una observación aislada es hipótesis hasta validarla más.

## Archivos operativos
- `flow.json`: grafo 262 nodos, 352 edges y 17 etapas.
- `QUALITY_TRANSFER.json`: código fuente observado de referencias exitosas, sus límites y contratos de transferencia.
- `USER_REVIEW_WAVE001.json`: diez observaciones de usuario / fuente mapeadas a etapas, sin falsificar QA visual.
- `BENCHMARK_BRIEFS.v1.json`: briefs humanos breves propuestos; **no congelados ni usados en Ola 001**.
- `STAGE_TRACE.schema.json`, `validate-trace.mjs`: decisiones por etapa para comparar rondas.
- `browser-check.mjs`, `WEB_RUNTIME_CONTRACT.md`: compatibilidad web y error observado de estación.
- `synthesize-wave.mjs`: sintetiza patrones sin modificar automáticamente otra versión.

**Límite:** este método está probado estructuralmente, pero su transferencia estética y la compatibilidad WebGL/Android no están demostradas hasta una nueva tanda con el mismo brief.
