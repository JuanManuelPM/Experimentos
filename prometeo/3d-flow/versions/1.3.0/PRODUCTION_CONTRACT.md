# PROMETEO · Flujo 3D 1.3.0 · ENTREGA ÍNTEGRA EN UNA PASADA

**Prioridad humana:** EL RESULTADO VISIBLE COMPLETO, aunque sea feo o tenga errores.
**Estado:** nuevo método para siguientes tandas, sin atribución retroactiva. `flowVersionUsed=1.3.0`, SHA-256 `66dc6c74ea3b734369347e797c5ca3ede41f280d0a6c1a7d6abc372b42b51223`.
**Lección:** en Ola 001 el flujo 1.2.0 utilizó D40/D41/NOT_RUN para cancelar, limitar a un canario o esconder entregables. Eso estaba expresamente contra la intención humana.

## Regla cardinal, no negociable

**NO CANCELAR, NO RECHAZAR, NO ACORTAR A PRIMER ARTÍCULO, NO AUTOCORREGIR LA ESTÉTICA DESPUÉS DE LA PRODUCCIÓN.**
Cada nuevo encargo se realiza en un **primer intento completo y sostenido**, con todo el esfuerzo y las herramientas disponibles dentro de la ejecución actual. Terminar con un personaje y un asiento cuando se pidió un colectivo lleno es un fallo del contrato, no un éxito de prevención. Lo mismo aplica a un arcade con una única máquina o laboratorio con sólo una ventana.

Cosas que **NO** autorizan detener, reducir, bloquear la vista previa ni considerar terminado:
- Un control de apariencia visual negativo, o que D40/D41/QA hayan fallado.
- Que falte GPU/WebGL/Android para probar capturas.
- No encontrar el asset perfecto; elegir el mejor recurso real y legal o construir una alternativa original viable.
- Que la cámara, personaje, objeto o textura sea mediocre.
- No alcanzar un criterio artístico que deberá evaluar el usuario.
- No poder completar un manifiesto de prevención de forma perfecta o el hash de un archivo binario durante el intento.

**Excepción real:** no mentir, no violar licencias/privacidad, y no fingir infraestructura disponible. Si una acción es técnica/legalmente imposible, registrar causa concreta, persistir íntegramente todo lo realizado y mostrar las alternativas viables; nunca emplear estas excepciones como excusa artística.

## Proceso ordenado por tiempo y propiedad

### 0 · Antes de producir (breve)
Leer el flujo y fijar versión. Entender **toda la escena** y sus partes. Elegir técnicas de producción apropiadas: asset real con materiales/UV para NPCs, muebles y vehículos; geometría paramétrica para mecanismos donde corresponde. Anotar brevemente objetivo visual positivo, contraejemplo de cumplimiento literal pobre y assets que se necesitan. Esta elección *reduce* errores de origen; no requiere informes extensos ni pasa a ser el entregable.

### 1 · Producción integral (máxima prioridad)
**HACER** la escena solicitada en un primer intento: todos los escenarios, personajes, objetos, movimientos, planos y efectos principales dentro del alcance humano. Reutilizar módulos reales. Cambiar estrategia durante creación si hace falta para terminar, pero no entrar en bucles de revisar/reparar el mismo trabajo. Si hay CPU y no GPU, continuar con la escena WebGL/Three o técnica disponible aunque el render final quede sin prueba. Ninguna calidad insuficiente es motivo de paro. No gastar capacidad en documentos que puedan escribirse después.

### 2 · Entrega visible y persistencia
Publicar siempre que sea lícito/viable una **vista previa técnica** pública, ejecutable y marcada claramente CANDIDATE / REAL_RENDER_NOT_VERIFIED si corresponde. **No exige D41 PASS ni aprobación artística humana para mostrar un intento.** Publicar no es aprobar. Si GitHub Pages no se puede usar, preservar escena completa en repo privado con archivos fuente y, si existen, capturas/video reales y rutas para abrirla; no inventar enlaces. La galería y el visor deben poder acceder a los diez intentos, aunque sean malos.

### 3 · Informe posterior, sin nueva producción
Registrar QA factual de lo que ya existe: PASS/FAIL/NOT_RUN sin falsificar, defectos visibles si hay evidencia, limitaciones técnicas reales, fuente, commit, versión, artefactos. **No volver al inicio ni modificar/rechazar artístico después de la entrega** por iniciativa de la IA. La evaluación artística y las soluciones del *método* corresponden al usuario y al próximo ciclo.

### 4 · Nueva tanda (sólo luego de nueva instrucción)
Comparar versiones por proyecto, detectar patrones entre al menos dos casos si existen, formular reglas más generales en subflujos correspondientes y fijar la nueva versión de método antes de lanzar la próxima ronda. Evitar hardcodes para obras específicas.

## Guardrails del flujo

- `D39`, `D40`, `D41`, `D42`: **diagnósticos no bloqueantes**. PASS/FAIL/NOT_RUN se archivan, siempre se continúa. `preflight.mjs` comunica advertencias pero `mayScale=true` y `mustContinueProduction=true` incluso en fallos.
- `PP2` y `PP3`: ambos continúan a `B0` para **toda la escena**, no reintentan adquisición ni se quedan en `SOURCE_ONLY_REDUCED`.
- `D29-D38`: QA de hechos después de producir, no terapia infinita de correcciones automáticas.
- `PUB1`: si faltan pruebas de GPU/móvil, publicar igual vista candidata honesta, cuando sea viable.
- `FIX0`: reservado como referencia de futura calibración decidida por el usuario, **no usar en la misma ejecución**.
- Preservar la distinción entre `FULL_ATTEMPT`, `PREVIEW_CANDIDATE`, `ART_APPROVED`: el primer intento completo no implica aprobación de arte.
- Prohibido celebrar que el flujo “frenó” algo feo cuando el objetivo era observar el mejor intento del agente.

## Ejemplo de resultado adecuado
Pedido de diez proyectos: si el agente cree que sus NPCs son malos, **igual entrega todo el tren con los NPCs que alcanzó a construir**. La crítica de la IA se escribe aparte y **nunca ocupa el lugar del tren**. Si una máquina de arcade se ve artificial, construir el salón entero en vez de entregar sólo esa máquina. Si la luz es oscura, intentar el tratamiento inicial mejor y entregar la película completa. El usuario decidirá qué mejorar en el subflujo de arte/cámara/actores/recursos.

## Pruebas para un próximo agente
1. `FULL_ATTEMPT` con D41 FAIL no impide continuar ni entregar `CANDIDATE`.
2. No WebGL no convierte escena entera en `FIRST_ARTICLE`.
3. Un resultado pobre no impide una URL de preview técnica y no se convierte en `ART_APPROVED`.
4. El flujo antiguo 1.2.0 permanece inmutable para comparar por qué produjo los canarios.
5. El alcance humano manda. Si se pide un salón, un gabinete es sólo uno de sus elementos.

## Limitaciones honestas
Esta versión elimina el veto de proceso, **no garantiza** calidad estética ni que una IA pueda terminar todo lo pedido bajo limitaciones reales de herramientas o ejecución. En ningún caso se promete trabajo asíncrono inexistente. Los resultados deben surgir de una ejecución real, no de declaraciones de intención.
