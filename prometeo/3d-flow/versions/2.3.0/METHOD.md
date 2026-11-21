# PROMETEO · Estudio 3D · Flujo universal 2.3.0
**Canónico:** `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`. **Fecha:** 2026-11-21. Hereda los 17 estadios, modelado, licencia, animación, cámara, UI y límites técnicos de [2.2.1](../2.2.1/METHOD.md), salvo conflictos resueltos expresamente abajo.

## LEY SUPERIOR: PREVENIR EL ERROR ANTES DE CONSTRUIR
**QA = calidad asegurada en el diseño y elección temprana de técnica, fuente, representación y proceso de autoría.** Los tests posteriores no crean calidad visual ni reemplazan QA. No lanzar una ronda obligatoria de errores, métricas, capturas, reparación estética postproducción o QUALITY_DELTA para justificar la creación. Sí resolver fallos técnicos graves durante la implementación normal. Al terminar, entregar el mejor intento y permitir revisión humana; el usuario determina qué cambiar en el **flujo universal** para la próxima ronda mediante CALIBRAR. Prohibido hardcodear en el brief un arreglo por proyecto.

**Secuencia sustantiva:** brief intacto -> recuperar obras / feedback -> investigar alternativas reales -> elegir enfoque artístico adecuado -> conseguir bytes y licencias o crear fuente editable -> producir recurso / escena / juego -> publicar candidato -> revisión humana / cambio de flujo en ronda separada.

## CARÁCTER NO NEGOCIABLE DE LOS PERSONAJES
**NO ENTREGAR HUMANOS FINALES** como muñecos hechos con esferas, cilindros, cápsulas, cajas, lofts triviales o cuerpos de primitivas apiladas. Una forma temporal en blockout/previz es aceptable, pero nunca como cara/cuerpo terminado. Un recolor del mismo muñeco tampoco es una nueva estrategia. Antes de autoría efectiva, investigar y comparar dos métodos realmente distintos y disponibles: asset/modelo legal descargado e importado/adaptado con licencia; autoría editable con herramientas de modelado; collage 2D con partes animadas; 2.5D / planos texturados / spritesheets; formas ilustradas originales; combinaciones apropiadas. No limitarse a esos ejemplos ni fijar proveedor o estética. Para el primer plano estudiar cara/vestuario/expresión antes de construir el mundo. Si la tecnología ideal no está disponible, elegir una ruta creativa realmente distinta, no recaer en geometría mediocre.

## TRES SERIES, UN SOLO MÉTODO, CERO CUPO DE CHATS
- `integradores`: 10 revisiones de las escenas existentes con sus 10 **briefs inmutables**. No reconstruir desde cero.
- `personajes`: 10 proyectos centrados únicamente en arte, representación, movimiento y reutilización de personajes. No fabricar un videojuego ni una ciudad completa para exhibir un personaje.
- `videojuegos`: 10 pequeños **vertical slices jugables** de géneros y mecánicas diferentes. No hacer juegos completos.
- Cualquier número de chats puede abrirse de manera concurrente; no existe límite de 10, 30 ni 50 impuesto por el flujo. Las limitaciones reales de cuenta/proveedor, si existieran, no se atribuyen al método.
- Las tandas pueden superponerse: lanzar diez integradores, diez personajes y diez videojuegos inmediatamente, o nuevas tandas mientras otras siguen trabajando. **Ninguna depende de terminar otra tanda.**
- Cada chat ejecuta exactamente **un brief**, en una rama privada aislada y una ruta de publicación aislada, con hash de flujo y brief fijados. Si se publica una nueva versión del método, las tareas activas conservan la versión fijada. Los commits públicos usan integración segura de GitHub, sin force y sin sobrescribir otras rutas. Un lanzador en GitHub NO ejecuta una tarea de fondo por sí mismo.

## QA, TESTS Y CALIBRAR: SEPARACIÓN
1. QA preventivo: en scope/recovery/planning/acquisition, antes del coste artístico mayor.
2. Tests técnicos: pruebas finitas para errores funcionales reales, no evaluaciones automáticas de belleza, no diagnósticos retrospectivos a escala de cada proyecto.
3. CALIBRAR: humanos revisan las obras terminadas; el responsable del flujo cambia después las reglas generales. No modificar prompts individuales para corregir errores observados ni convertir la propia escena en un bot autocorrector.

## ENTREGABLES
Prioridad al arte y código ejecutable, no a informes. Breve identidad/hash/recursos/URL, evidencia factual mínima, honestidad sobre lo que no se comprobó. Evitar calidad falsa, pero también controles que impidan llegar al entregable.

**Aplicabilidad:** mismo flujo y mismas reglas de derechos, visual, cámara, navegación y arquitectura; cada serie reduce el alcance a lo que pide SU brief y nunca fuerza personajes en un prop mecánico o un juego entero en un ensayo de personaje.
