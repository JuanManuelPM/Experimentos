# PROMETEO 3D · Flujo maestro de producción v1.0.0

> **Estado:** CURRENT_CANDIDATE, creado 2026-11-19. 17 etapas, 224 nodos y 288 conexiones. SHA-256 canónico del JSON sin campo `sha256Canonical`: `366506432cd5aa015efd1bff5a2e7d2fc26f91b5121b5b9450b7bef5469deaa7`.

**Enlace visual público:** `https://juanmanuelpm.github.io/Experimentos/prometeo/3d-flow/`

**Fuentes técnicas:** `JuanManuelPM/Experimentos@gh-pages:prometeo/cocina-umbria-001/scene.mjs`, evidencia de usuario y diagnóstico privado `PROMETEO/spaces/studio-3d/qa/orientation-room-20261119/CALIBRAR_ORIENTACION_Y_CERRAMIENTO_20261119.md` en `candidate/prometeo-3d-orientation-scene-qa-20261119`.

## Contrato de uso

1. La IA lee `FLOW_INDEX.json` para encontrar la versión actual y congela `flowVersion` y `flowSha256` en el proyecto antes de actuar.
2. Ejecuta desde `I0`; sigue relaciones del grafo y etiquetas de decisión. Usa la ficha del nodo cuando necesita el procedimiento, fuentes y QA.
3. Si no puede verificar un gate, registra `NOT_RUN` o `BLOCKED`, **nunca PASS**. El camino de fallo va por CALIBRAR y vuelve a QA.
4. Una escena no prueba que usó esta versión porque aparezca en el catálogo: `flowVersionUsed: null` expresa que fue anterior o carece de evidencia.
5. Cambios de flujo crean `versions/1.1.0/flow.json` (u otra versión), no alteran `versions/1.0.0/flow.json`. El selector CURRENT cambia solo tras commit y recibo.
6. Resultados comparables requieren mismos criterios, capturas y condiciones; no llamar mejora a distinta escena sin reejecución.

## Fallos históricos vinculados

### UMBRIA-ORIENT-001 · Actor de espaldas

Frente local +Z supuesto, no certificado; yaw fijo.

Nodos relacionados: `H4`, `D7`, `H5`, `OR1`, `OR6`, `D14`, `M10`, `D16`, `QA8`.

### UMBRIA-ORIENT-002 · Sillas al revés

Rotaciones manuales sin seatFrontLocal ni target.

Nodos relacionados: `O3`, `O8`, `OR2`, `OR7`, `OR12`, `QA9`.

### UMBRIA-ARCH-003 · Cocina sin techo

Sin malla de techo en world().

Nodos relacionados: `E5`, `D10`, `E6`, `E10`, `QA6`.

### UMBRIA-QA-004 · Aprobación sin visión real

Se publicó sin validar WebGL, frente, pies ni cierre de habitación.

Nodos relacionados: `QA2`, `QA17`, `FIX6`, `PUB0`, `D28`.

## 01 · Objetivo y encargo

Definir qué se va a producir, para quién y bajo qué restricciones.

### I0 · INICIO · nuevo pedido 3D

INICIO · nuevo pedido 3D

**Tipo:** `action`. **Siguientes:** `I1`.

### I1 · Interpretar objetivo y resultado observable

Interpretar objetivo y resultado observable

**Tipo:** `action`. **Siguientes:** `I2`.

### I2 · Definir destinatario, plataforma y restricciones

Definir destinatario, plataforma y restricciones

**Tipo:** `action`. **Siguientes:** `D0`.

### D0 · ¿Qué especialidad principal requiere?

¿Qué especialidad principal requiere?

**Tipo:** `decision`. **Siguientes:** `T1` (Escena), `T2` (Personaje), `T3` (Movimiento), `T4` (Cine), `T5` (Texturas), `T6` (FX), `T7` (Integración).

### T1 · Escena / set

Escena / set

**Tipo:** `action`. **Siguientes:** `I3`.

### T2 · Personaje / vestuario

Personaje / vestuario

**Tipo:** `action`. **Siguientes:** `I3`.

### T3 · Animación / actuación

Animación / actuación

**Tipo:** `action`. **Siguientes:** `I3`.

### T4 · Cámara / montaje

Cámara / montaje

**Tipo:** `action`. **Siguientes:** `I3`.

### T5 · Material / UV

Material / UV

**Tipo:** `action`. **Siguientes:** `I3`.

### T6 · Luz / FX

Luz / FX

**Tipo:** `action`. **Siguientes:** `I3`.

### T7 · Integración / FORJA

Integración / FORJA

**Tipo:** `action`. **Siguientes:** `I3`.

### I3 · Definir qué NO se va a modificar

Definir qué NO se va a modificar

**Tipo:** `action`. **Siguientes:** `I4`.

### I4 · Distinguir arte aprobado, canario y documentación

Distinguir arte aprobado, canario y documentación

**Tipo:** `action`. **Siguientes:** `R0`.

## 02 · Recuperación y fuentes

Conservar trabajo versionado, identificar propietarios y evitar duplicaciones.

### R0 · Recuperar PROMETEO y espacio dueño

Recuperar PROMETEO y espacio dueño

**Tipo:** `action`. **Siguientes:** `R1`.

### R1 · Leer bootstrap, handoff y control instalado

Leer bootstrap, handoff y control instalado

**Tipo:** `action`. **Siguientes:** `R2`.

### R2 · Consultar ramas, HEAD y últimas evidencias

Consultar ramas, HEAD y últimas evidencias

**Tipo:** `action`. **Siguientes:** `R3`.

### R3 · Inspeccionar Atlas, FORJA y catálogo shared

Inspeccionar Atlas, FORJA y catálogo shared

**Tipo:** `action`. **Siguientes:** `D1`.

### D1 · ¿Existe capacidad reutilizable?

¿Existe capacidad reutilizable?

**Tipo:** `decision`. **Siguientes:** `R4` (Sí), `R5` (Parcial), `R6` (No).

### R4 · Reutilizar capacidad verificada

Reutilizar capacidad verificada

**Tipo:** `action`. **Siguientes:** `R7`.

### R5 · Aprovechar base parcial y documentar faltantes

Aprovechar base parcial y documentar faltantes

**Tipo:** `action`. **Siguientes:** `R7`.

### R6 · Investigar necesidad ausente

Investigar necesidad ausente

**Tipo:** `action`. **Siguientes:** `R8`.

### R7 · Fijar licencia, owner, versión y SHA

Fijar licencia, owner, versión y SHA

**Tipo:** `action`. **Siguientes:** `P0`.

### R8 · Investigar fuentes oficiales y pruebas reales

Investigar fuentes oficiales y pruebas reales

**Tipo:** `action`. **Siguientes:** `R9`.

### R9 · Comparar al menos dos alternativas

Comparar al menos dos alternativas

**Tipo:** `action`. **Siguientes:** `D2`.

### D2 · ¿Hay método más sólido disponible?

¿Hay método más sólido disponible?

**Tipo:** `decision`. **Siguientes:** `R10` (Sí), `R11` (No).

### R10 · Adoptar asset / motor adecuado

Adoptar asset / motor adecuado

**Tipo:** `action`. **Siguientes:** `P0`.

### R11 · Diseñar solución nueva justificada

Diseñar solución nueva justificada

**Tipo:** `action`. **Siguientes:** `P0`.

## 03 · Producción y dependencias

Planear frentes, costos, riesgo, bloqueos y puertas de calidad.

### P0 · Definir plan y gates por evidencia

Definir plan y gates por evidencia

**Tipo:** `action`. **Siguientes:** `P1`.

### P1 · Descomponer en frentes

Descomponer en frentes

**Tipo:** `action`. **Siguientes:** `P2`, `P3`, `P4`, `P5`, `P6`, `P7`, `P8`.

### P2 · Frente escena

Frente escena

**Tipo:** `action`. **Siguientes:** `D3`.

### P3 · Frente actor

Frente actor

**Tipo:** `action`. **Siguientes:** `D3`.

### P4 · Frente movimiento

Frente movimiento

**Tipo:** `action`. **Siguientes:** `D3`.

### P5 · Frente cine

Frente cine

**Tipo:** `action`. **Siguientes:** `D3`.

### P6 · Frente materiales

Frente materiales

**Tipo:** `action`. **Siguientes:** `D3`.

### P7 · Frente FX

Frente FX

**Tipo:** `action`. **Siguientes:** `D3`.

### P8 · Frente QA y publicación

Frente QA y publicación

**Tipo:** `action`. **Siguientes:** `D3`.

### D3 · ¿Dependencias permiten paralelismo?

¿Dependencias permiten paralelismo?

**Tipo:** `decision`. **Siguientes:** `W0` (Sí), `W1` (No).

### W0 · Separar owners y contratos sin pisar fuentes

Separar owners y contratos sin pisar fuentes

**Tipo:** `action`. **Siguientes:** `P9`.

### W1 · Encadenar trabajos en el mismo chat

Encadenar trabajos en el mismo chat

**Tipo:** `action`. **Siguientes:** `P9`.

### P9 · Registrar entradas, salidas y rollback

Registrar entradas, salidas y rollback

**Tipo:** `action`. **Siguientes:** `A0`.

## 04 · Adquisición de recursos

Buscar o generar piezas reales con derechos y pruebas.

### A0 · Identificar recursos existentes necesarios

Identificar recursos existentes necesarios

**Tipo:** `action`. **Siguientes:** `A1`.

### A1 · Armar manifiesto mínimo

Armar manifiesto mínimo

**Tipo:** `action`. **Siguientes:** `D4`.

### D4 · ¿Qué tipo de recurso falta?

¿Qué tipo de recurso falta?

**Tipo:** `decision`. **Siguientes:** `A2` (Modelos), `A3` (Personajes), `A4` (Clips), `A5` (Texturas), `A6` (Audio), `A7` (Efectos).

### A2 · Modelos / geometría

Modelos / geometría

**Tipo:** `action`. **Siguientes:** `A8`.

### A3 · Personajes

Personajes

**Tipo:** `action`. **Siguientes:** `A8`.

### A4 · Animaciones / rigs

Animaciones / rigs

**Tipo:** `action`. **Siguientes:** `A8`.

### A5 · Texturas / atlas

Texturas / atlas

**Tipo:** `action`. **Siguientes:** `A8`.

### A6 · Audio y licencias si aplica

Audio y licencias si aplica

**Tipo:** `action`. **Siguientes:** `A8`.

### A7 · VFX y materiales

VFX y materiales

**Tipo:** `action`. **Siguientes:** `A8`.

### A8 · Verificar formato, licencia y calidad

Verificar formato, licencia y calidad

**Tipo:** `action`. **Siguientes:** `D5`.

### D5 · ¿Asset supera gate mínimo?

¿Asset supera gate mínimo?

**Tipo:** `decision`. **Siguientes:** `A9` (No), `A10` (Sí).

### A9 · Descartar con causa persistente

Descartar con causa persistente

**Tipo:** `action`. **Siguientes:** `A0` (Buscar alternativa).

### A10 · Registrar URL, commit, hash y licencia

Registrar URL, commit, hash y licencia

**Tipo:** `action`. **Siguientes:** `A11`.

### A11 · Importar y verificar bytes reales

Importar y verificar bytes reales

**Tipo:** `action`. **Siguientes:** `A12`.

### A12 · Bloquear reemplazo visual ficticio

Bloquear reemplazo visual ficticio

**Tipo:** `action`. **Siguientes:** `B0`.

## 05 · Clasificar piezas

Elegir el contrato correcto para cada tipo de asset.

### B0 · Clasificar pieza por comportamiento y uso

Clasificar pieza por comportamiento y uso

**Tipo:** `action`. **Siguientes:** `D6`.

### D6 · ¿Cuál es la familia semántica?

¿Cuál es la familia semántica?

**Tipo:** `decision`. **Siguientes:** `H0` (Humanoide), `Q0` (Animal), `O0` (Prop), `E0` (Arquitectura), `F0` (FX), `C0` (Cámara).

### H0 · Humanoide

Humanoide

**Tipo:** `action`. **Siguientes:** `H1`.

### Q0 · Cuadrúpedo / no humano

Cuadrúpedo / no humano

**Tipo:** `action`. **Siguientes:** `B1` (Perfil de rig propio).

### O0 · Mueble / objeto / prop

Mueble / objeto / prop

**Tipo:** `action`. **Siguientes:** `O1`.

### E0 · Arquitectura / ambiente

Arquitectura / ambiente

**Tipo:** `action`. **Siguientes:** `E1`.

### F0 · Material / luz / FX

Material / luz / FX

**Tipo:** `action`. **Siguientes:** `F1`.

### C0 · Recurso de cámara

Recurso de cámara

**Tipo:** `action`. **Siguientes:** `C1`.

### B1 · Exigir contrato específico o bloquear

Exigir contrato específico o bloquear

**Tipo:** `action`. **Siguientes:** `H1` (Si se adapta).

## 06 · Personajes y rigs

Calibrar cuerpo, cara, esqueleto, frente nativo y clips.

### H1 · Comprobar malla, escala y proporciones

Comprobar malla, escala y proporciones

**Tipo:** `action`. **Siguientes:** `H2`.

### H2 · Inspeccionar rostro, cabello, ropa y manos

Inspeccionar rostro, cabello, ropa y manos

**Tipo:** `action`. **Siguientes:** `H3`.

### H3 · Inspeccionar skeleton, pivote, bind pose

Inspeccionar skeleton, pivote, bind pose

**Tipo:** `action`. **Siguientes:** `H4`.

### H4 · Observar frente físico del GLB en 3 vistas

La geometría facial, huesos, rig y prueba frontal determinan el frente; nunca inferir +Z por convención.

**Tipo:** `action`. **Siguientes:** `D7`.

### D7 · ¿Frente nativo verificado con evidencia?

Se debe inspeccionar el frente REAL del modelo (cara/ojos/espalda) en vistas ortogonales y el esqueleto/clip. No asumir +Z. Registrar perfil por asset SHA. Si no se puede, FAIL/NOT_RUN, no aprobar.

**Tipo:** `decision`. **Siguientes:** `H5` (No), `H6` (Sí).

### H5 · Calibrar frontLocal y bindYawOffset

Calibrar frente nativo y offset de bind pose por GLB, con captura. No girar todo a ciegas 180°.

**Tipo:** `action`. **Siguientes:** `H7`.

### H6 · Recuperar perfil exacto por SHA

Recuperar perfil exacto por SHA

**Tipo:** `action`. **Siguientes:** `H7`.

### H7 · Persistir perfil de identidad + orientación

Perfil persistido y validado, no un número arbitrario por escena.

**Tipo:** `action`. **Siguientes:** `H8`.

### H8 · Inspeccionar Idle, Walk, Turn, Interact

Inspeccionar Idle, Walk, Turn, Interact

**Tipo:** `action`. **Siguientes:** `D8`.

### D8 · ¿Clips válidos para acción pretendida?

¿Clips válidos para acción pretendida?

**Tipo:** `decision`. **Siguientes:** `H11` (Sí), `H9` (No).

### H9 · Buscar clips compatibles y derechos

Buscar clips compatibles y derechos

**Tipo:** `action`. **Siguientes:** `H10`.

### H10 · Retarget / adaptar y probar deformación

Retarget / adaptar y probar deformación

**Tipo:** `action`. **Siguientes:** `H11`.

### H11 · Confirmar actor compatible para puesta

Confirmar actor compatible para puesta

**Tipo:** `action`. **Siguientes:** `S0`.

## 07 · Objetos y muebles

Registrar frente funcional, anclajes y relaciones entre objetos.

### O1 · Inspeccionar pivote, escala y bounds

Inspeccionar pivote, escala y bounds

**Tipo:** `action`. **Siguientes:** `O2`.

### O2 · Distinguir frente visual, respaldo y frente funcional

Distinguir frente visual, respaldo y frente funcional

**Tipo:** `action`. **Siguientes:** `D9`.

### D9 · ¿Clase funcional del objeto?

¿Clase funcional del objeto?

**Tipo:** `decision`. **Siguientes:** `O3` (Silla), `O4` (Mesa), `O5` (Libre), `O6` (Funcional), `O7` (Luz).

### O3 · Silla: reconocer asiento y respaldo

Silla: reconocer asiento y respaldo

**Tipo:** `action`. **Siguientes:** `O8`.

### O4 · Mesa: centro, superficie y zona de uso

Mesa: centro, superficie y zona de uso

**Tipo:** `action`. **Siguientes:** `O9`.

### O5 · Decoración libre sin lookAt automático

Decoración libre sin lookAt automático

**Tipo:** `action`. **Siguientes:** `O10`.

### O6 · Electrodoméstico: lado operable

Electrodoméstico: lado operable

**Tipo:** `action`. **Siguientes:** `O11`.

### O7 · Lámpara: anclaje y dirección de luz

Lámpara: anclaje y dirección de luz

**Tipo:** `action`. **Siguientes:** `O12`.

### O8 · Persistir seatFrontLocal / backLocal

Persistir seatFrontLocal / backLocal

**Tipo:** `action`. **Siguientes:** `S0`.

### O9 · Persistir tableCenter / interactionZone

Persistir tableCenter / interactionZone

**Tipo:** `action`. **Siguientes:** `S0`.

### O10 · Persistir libertad de rotación

Persistir libertad de rotación

**Tipo:** `action`. **Siguientes:** `S0`.

### O11 · Persistir functionalFront / gripSockets

Persistir functionalFront / gripSockets

**Tipo:** `action`. **Siguientes:** `S0`.

### O12 · Persistir anchor rules y superficies

Persistir anchor rules y superficies

**Tipo:** `action`. **Siguientes:** `S0`.

## 08 · Arquitectura y cerramiento

Volúmenes, techo, aberturas, navegación y cámara de edición.

### E1 · Definir tipo de recinto y escala

Definir tipo de recinto y escala

**Tipo:** `action`. **Siguientes:** `E2`.

### E2 · Construir suelo real y colisiones

Construir suelo real y colisiones

**Tipo:** `action`. **Siguientes:** `E3`.

### E3 · Construir paredes y encuentros

Construir paredes y encuentros

**Tipo:** `action`. **Siguientes:** `E4`.

### E4 · Definir puertas y ventanas reales

Definir puertas y ventanas reales

**Tipo:** `action`. **Siguientes:** `E5`.

### E5 · Definir techo o cubierta

La lámpara de techo no constituye techo. En interiores debe existir superficie física de cubierta y continuidad de muros.

**Tipo:** `action`. **Siguientes:** `D10`.

### D10 · ¿Interior cerrado o escena intencionalmente abierta?

¿Interior cerrado o escena intencionalmente abierta?

**Tipo:** `decision`. **Siguientes:** `E6` (Interior), `E7` (Exterior).

### E6 · Interior: exigir cerramiento completo

Interior: exigir cerramiento completo

**Tipo:** `action`. **Siguientes:** `E8`.

### E7 · Exterior: documentar cielo abierto

Exterior: documentar cielo abierto

**Tipo:** `action`. **Siguientes:** `E8`.

### E8 · Comprobar exterior solo por aberturas

Comprobar exterior solo por aberturas

**Tipo:** `action`. **Siguientes:** `E9`.

### E9 · Zonas navegables / puntos de acción

Zonas navegables / puntos de acción

**Tipo:** `action`. **Siguientes:** `E10`.

### E10 · Modo film con techo / modo editor cutaway

Modo PRODUCCIÓN presenta techo y cerramiento. Modo EDICIÓN habilita corte sin cambiar el recurso de producción.

**Tipo:** `action`. **Siguientes:** `S0`.

## 09 · Materiales, luz y FX

Controlar textura, atmósfera, visibilidad y rendimiento.

### F1 · Elegir función de luz, material o FX

Elegir función de luz, material o FX

**Tipo:** `action`. **Siguientes:** `D11`.

### D11 · ¿Qué tratamiento se necesita?

¿Qué tratamiento se necesita?

**Tipo:** `decision`. **Siguientes:** `F2` (Lluvia), `F3` (Niebla), `F4` (Humo), `F5` (Luz), `F6` (Textura).

### F2 · Lluvia con profundidad física

Lluvia con profundidad física

**Tipo:** `action`. **Siguientes:** `F7`.

### F3 · Niebla y distancia

Niebla y distancia

**Tipo:** `action`. **Siguientes:** `F7`.

### F4 · Humo y volumen

Humo y volumen

**Tipo:** `action`. **Siguientes:** `F7`.

### F5 · Iluminación y parpadeo

Iluminación y parpadeo

**Tipo:** `action`. **Siguientes:** `F7`.

### F6 · UV / textura / PBR

UV / textura / PBR

**Tipo:** `action`. **Siguientes:** `F7`.

### F7 · Comprobar rendimiento y coherencia

Comprobar rendimiento y coherencia

**Tipo:** `action`. **Siguientes:** `F8`.

### F8 · Verificar materiales importados y derechos

Verificar materiales importados y derechos

**Tipo:** `action`. **Siguientes:** `S0`.

## 10 · Montaje de escena

Posición, escala, pivote, relaciones y conservación del proyecto.

### S0 · Construir escena sobre recursos reales

Construir escena sobre recursos reales

**Tipo:** `action`. **Siguientes:** `S1`.

### S1 · Ubicar actor con escala y pivote

Ubicar actor con escala y pivote

**Tipo:** `action`. **Siguientes:** `S2`.

### S2 · Ubicar muebles principales

Ubicar muebles principales

**Tipo:** `action`. **Siguientes:** `S3`.

### S3 · Agregar muebles secundarios sin ruido

Agregar muebles secundarios sin ruido

**Tipo:** `action`. **Siguientes:** `S4`.

### S4 · Aplicar materiales editables

Aplicar materiales editables

**Tipo:** `action`. **Siguientes:** `S5`.

### S5 · Montar luces y ambiente

Montar luces y ambiente

**Tipo:** `action`. **Siguientes:** `S6`.

### S6 · Aplicar FX sin tapar geometría

Aplicar FX sin tapar geometría

**Tipo:** `action`. **Siguientes:** `S7`.

### S7 · Definir blocking / rutas libres

Definir blocking / rutas libres

**Tipo:** `action`. **Siguientes:** `D12`.

### D12 · ¿Todos colocados y orientados funcionalmente?

¿Todos colocados y orientados funcionalmente?

**Tipo:** `decision`. **Siguientes:** `S8` (No), `S9` (Sí).

### S8 · Derivar a calibración semántica

Derivar a calibración semántica

**Tipo:** `action`. **Siguientes:** `OR0`.

### S9 · Guardar escena candidata editable

Guardar escena candidata editable

**Tipo:** `action`. **Siguientes:** `OR0`.

## 11 · Orientación semántica

No confundir ubicación con facing funcional o de locomoción.

### OR0 · Revisar orientación de cada asset relevante

Revisar orientación de cada asset relevante

**Tipo:** `action`. **Siguientes:** `D13`.

### D13 · ¿Qué relación semántica debe cumplir?

¿Qué relación semántica debe cumplir?

**Tipo:** `decision`. **Siguientes:** `OR1` (Actor), `OR2` (Silla), `OR3` (Funcional), `OR4` (Anclaje), `OR5` (Libre).

### OR1 · Actor: frente hacia velocidad / objetivo

Actor: frente hacia velocidad / objetivo

**Tipo:** `action`. **Siguientes:** `OR6`.

### OR2 · Silla: asiento apunta a mesa

Calcular dirección desde silla hacia mesa; orientar seatFrontLocal certificado. El respaldo debe apuntar hacia afuera; permitir override manual explícito, nunca auto-lookAt indiscriminado.

**Tipo:** `action`. **Siguientes:** `OR7`.

### OR3 · Prop: cara funcional mira al usuario

Prop: cara funcional mira al usuario

**Tipo:** `action`. **Siguientes:** `OR8`.

### OR4 · Lámpara: orientación según anclaje

Lámpara: orientación según anclaje

**Tipo:** `action`. **Siguientes:** `OR9`.

### OR5 · Decoración: libertad artística explícita

Decoración: libertad artística explícita

**Tipo:** `action`. **Siguientes:** `OR10`.

### OR6 · Vincular frente humano a SHA del rig

Vincular frente humano a SHA del rig

**Tipo:** `action`. **Siguientes:** `D14`.

### OR7 · Vincular respaldo al target de asiento

Vincular respaldo al target de asiento

**Tipo:** `action`. **Siguientes:** `D14`.

### OR8 · Vincular cara funcional a interacción

Vincular cara funcional a interacción

**Tipo:** `action`. **Siguientes:** `D14`.

### OR9 · Vincular anclaje real a superficie

Vincular anclaje real a superficie

**Tipo:** `action`. **Siguientes:** `D14`.

### OR10 · Guardar orientación libre y justificación

Guardar orientación libre y justificación

**Tipo:** `action`. **Siguientes:** `D14`.

### D14 · ¿Hay evidencia de orientación real?

¿Hay evidencia de orientación real?

**Tipo:** `decision`. **Siguientes:** `OR11` (No), `OR14` (Sí).

### OR11 · Crear vistas frontal, lateral y planta

Guardar 3 capturas con mismo asset, frente, lateral y planta. Para muebles comprobar respaldo/operador. Para persona observar nariz y feet pose.

**Tipo:** `action`. **Siguientes:** `OR12`.

### OR12 · Comparar facing y target / colisiones

Comprobar dot >= cos(25°) para asiento→mesa, dot >= 0.9 para rostro→velocidad, intersecciones y contacto.

**Tipo:** `action`. **Siguientes:** `D15`.

### D15 · ¿Apunta correctamente con fuente real?

¿Apunta correctamente con fuente real?

**Tipo:** `decision`. **Siguientes:** `OR13` (No), `OR14` (Sí).

### OR13 · Corregir eje, pivot o yaw con causa

Corregir eje, pivot o yaw con causa

**Tipo:** `action`. **Siguientes:** `OR11` (Reinspección).

### OR14 · Registrar comprobación y evidencia

Registrar comprobación y evidencia

**Tipo:** `action`. **Siguientes:** `M0`.

## 12 · Locomoción e interacción

Acción real, root motion, pies y contacto con props.

### M0 · Definir acción narrativa e intención

Definir acción narrativa e intención

**Tipo:** `action`. **Siguientes:** `M1`.

### M1 · Elegir actor y clips REALES

Elegir actor y clips REALES

**Tipo:** `action`. **Siguientes:** `M2`.

### M2 · Crear secuencia temporal editable

Crear secuencia temporal editable

**Tipo:** `action`. **Siguientes:** `M3`.

### M3 · Idle inicial

Idle inicial

**Tipo:** `action`. **Siguientes:** `M4`.

### M4 · Trayecto uno y contacto de pies

Trayecto uno y contacto de pies

**Tipo:** `action`. **Siguientes:** `M5`.

### M5 · Giro con interpolación de yaw

Giro con interpolación de yaw

**Tipo:** `action`. **Siguientes:** `M6`.

### M6 · Trayecto dos / evitar moonwalk

Trayecto dos / evitar moonwalk

**Tipo:** `action`. **Siguientes:** `M7`.

### M7 · Aproximación al prop

Aproximación al prop

**Tipo:** `action`. **Siguientes:** `M8`.

### M8 · Interacción: manos/IK/socket/clip

Interacción: manos/IK/socket/clip

**Tipo:** `action`. **Siguientes:** `M9`.

### M9 · Idle final mirando objetivo

Idle final mirando objetivo

**Tipo:** `action`. **Siguientes:** `D16`.

### D16 · ¿Facing real coherente con velocidad?

¿Facing real coherente con velocidad?

**Tipo:** `decision`. **Siguientes:** `M10` (No), `D17` (Sí).

### M10 · Recalcular heading desde trayectoria y frente

Usar Δpos para calcular heading en mundo y sumar offset del eje local calibrado para la malla. No hardcodear yaw absoluto para todas las mallas.

**Tipo:** `action`. **Siguientes:** `M11`.

### M11 · Distinguir root motion vs in-place

Distinguir traslación por animación y por código. Evitar doble movimiento, clip in-place contra root motion.
**Tipo:** `action`. **Siguientes:** `M12`.

### M12 · Medir slip y hundimiento de pies

Medir desplazamiento de pies en fase de apoyo y penetración de suelo. Test matemático de facing no prueba calidad.

**Tipo:** `action`. **Siguientes:** `M13`.

### M13 · Corregir pose final y blending

Corregir pose final y blending

**Tipo:** `action`. **Siguientes:** `M14`.

### M14 · Repetir playback y medición

Repetir playback y medición

**Tipo:** `action`. **Siguientes:** `D16` (Reprueba).

### D17 · ¿Interacción demostrada con clip/IK real?

¿Interacción demostrada con clip/IK real?

**Tipo:** `decision`. **Siguientes:** `M15` (Sí), `M16` (No).

### M15 · Validar agarre/contacto

Un saludo o una cámara que oculta la mano NO equivale a agarrar un objeto. Requiere clip compatible o IK y contacto medido.

**Tipo:** `action`. **Siguientes:** `C1`.

### M16 · Marcar interacción pendiente sin fingirla

Marcar interacción pendiente sin fingirla

**Tipo:** `action`. **Siguientes:** `C1`.

## 13 · Cine y cámaras

Planos verificables, cortes, timeline y objetivos de mirada.

### C1 · Dirección cinematográfica reutilizable

Dirección cinematográfica reutilizable

**Tipo:** `action`. **Siguientes:** `C2`.

### C2 · Plano general y ubicación espacial

Plano general y ubicación espacial

**Tipo:** `action`. **Siguientes:** `C3`.

### C3 · Plano de seguimiento

Plano de seguimiento

**Tipo:** `action`. **Siguientes:** `C4`.

### C4 · Plano medio de acción

Plano medio de acción

**Tipo:** `action`. **Siguientes:** `C5`.

### C5 · Primer plano de rostro

Primer plano de rostro

**Tipo:** `action`. **Siguientes:** `C6`.

### C6 · Plano manos / prop verificable

Plano manos / prop verificable

**Tipo:** `action`. **Siguientes:** `C7`.

### C7 · Plano final y continuidad

Plano final y continuidad

**Tipo:** `action`. **Siguientes:** `C8`.

### C8 · Timeline, subtítulos y cortes exactos

Timeline, subtítulos y cortes exactos

**Tipo:** `action`. **Siguientes:** `D18`.

### D18 · ¿Cámara muestra acción real o la oculta?

¿Cámara muestra acción real o la oculta?

**Tipo:** `decision`. **Siguientes:** `C9` (Oculta error), `C10` (Muestra accion).

### C9 · Rechazar montaje engañoso

Rechazar montaje engañoso

**Tipo:** `action`. **Siguientes:** `M0` (Reparar actuación).

### C10 · Guardar shotlist versionada

Guardar shotlist versionada

**Tipo:** `action`. **Siguientes:** `QA0`.

## 14 · Verificación integral

PASS, FAIL y NOT_RUN específicos, prueba visual independiente.

### QA0 · Correr QA independiente sobre resultado real

Correr QA independiente sobre resultado real

**Tipo:** `action`. **Siguientes:** `QA1`.

### QA1 · Validar estructura y procedencia GLB

Validar estructura y procedencia GLB

**Tipo:** `action`. **Siguientes:** `QA2`.

### QA2 · Inspeccionar píxeles WebGL / render

Exigir screenshot/video WebGL real cuando objetivo es artístico. Si WebGL falta marcar NOT_RUN; no convertir Node PASS en VISUAL PASS.

**Tipo:** `action`. **Siguientes:** `QA3`, `QA17` (WebGL no disponible).

### QA3 · Validar relaciones semánticas

Validar relaciones semánticas

**Tipo:** `action`. **Siguientes:** `QA4`.

### QA4 · Validar código, clips y timeline

Validar código, clips y timeline

**Tipo:** `action`. **Siguientes:** `QA5`.

### QA5 · Verificar móvil, controles y memoria

Verificar móvil, controles y memoria

**Tipo:** `action`. **Siguientes:** `D19`.

### D19 · ¿Arquitectura y recursos completos?

¿Arquitectura y recursos completos?

**Tipo:** `decision`. **Siguientes:** `QA6` (No), `D20` (Sí).

### QA6 · FAIL_ROOM_CLOSURE o faltantes

Error UMBRIA-ARCH-003: cielo visible encima de paredes por no existir techo.

**Tipo:** `action`. **Siguientes:** `FIX0` (Corregir).

### D20 · ¿Actor y props orientados correctamente?

¿Actor y props orientados correctamente?

**Tipo:** `decision`. **Siguientes:** `QA8` (Actor), `QA9` (Props), `D21` (Sí).

### QA8 · FAIL_ACTOR_FACING

Error UMBRIA-ORIENT-001: actor se desplaza de espaldas; incidencia vinculada al modelo y código reales.

**Tipo:** `action`. **Siguientes:** `FIX0`.

### QA9 · FAIL_PROP_ORIENTATION

Error UMBRIA-ORIENT-002: sillas orientadas con ángulos arbitrarios en lugar de hacia mesa.

**Tipo:** `action`. **Siguientes:** `FIX0`.

### D21 · ¿Locomoción sin defectos visibles?

¿Locomoción sin defectos visibles?

**Tipo:** `decision`. **Siguientes:** `QA10` (Pies), `QA11` (Raíz), `D22` (Sí).

### QA10 · FAIL_FOOT_SLIP

FAIL_FOOT_SLIP

**Tipo:** `action`. **Siguientes:** `FIX0`.

### QA11 · FAIL_ROOT_MOTION

FAIL_ROOT_MOTION

**Tipo:** `action`. **Siguientes:** `FIX0`.

### D22 · ¿Interacción realmente demostrada?

¿Interacción realmente demostrada?

**Tipo:** `decision`. **Siguientes:** `QA12` (No), `D23` (Sí).

### QA12 · FAIL_INTERACTION

FAIL_INTERACTION

**Tipo:** `action`. **Siguientes:** `FIX0`.

### D23 · ¿Cámara cubre correctamente?

¿Cámara cubre correctamente?

**Tipo:** `decision`. **Siguientes:** `QA13` (No), `D24` (Sí).

### QA13 · FAIL_CAMERA_COVERAGE

FAIL_CAMERA_COVERAGE

**Tipo:** `action`. **Siguientes:** `FIX0`.

### D24 · ¿Arte y móvil alcanzan criterios?

¿Arte y móvil alcanzan criterios?

**Tipo:** `decision`. **Siguientes:** `QA14` (Arte), `QA15` (Móvil), `QA16` (Sí).

### QA14 · FAIL_ART_DIRECTION

FAIL_ART_DIRECTION

**Tipo:** `action`. **Siguientes:** `FIX0`.

### QA15 · FAIL_MOBILE_USABILITY

FAIL_MOBILE_USABILITY

**Tipo:** `action`. **Siguientes:** `FIX0`.

### QA16 · PASS técnico + visual según evidencia

PASS técnico + visual según evidencia

**Tipo:** `action`. **Siguientes:** `G0`.

### QA17 · NOT_RUN si entorno impide la prueba

NOT_RUN si entorno impide la prueba

**Tipo:** `action`. **Siguientes:** `G0` (Persistir bloqueo sin PASS).

## 15 · CALIBRAR y corrección

Encontrar la causa, corregirla y volver a probar el gate.

### FIX0 · CALIBRAR: registrar error concreto

CALIBRAR: registrar error concreto

**Tipo:** `action`. **Siguientes:** `FIX1`.

### FIX1 · Reproducir con evidencia y condiciones

Reproducir con evidencia y condiciones

**Tipo:** `action`. **Siguientes:** `FIX2`.

### FIX2 · Localizar línea, asset y suposiciones

Localizar línea, asset y suposiciones

**Tipo:** `action`. **Siguientes:** `D25`.

### D25 · ¿Origen principal del fallo?

¿Origen principal del fallo?

**Tipo:** `decision`. **Siguientes:** `FIX3` (Asset), `FIX4` (Código), `FIX5` (Supuesto), `FIX6` (QA), `FIX7` (Layout).

### FIX3 · Asset: reparar o reemplazar legalmente

Asset: reparar o reemplazar legalmente

**Tipo:** `action`. **Siguientes:** `FIX8`.

### FIX4 · Código: arreglar pose/cámara/carga

Código: arreglar pose/cámara/carga

**Tipo:** `action`. **Siguientes:** `FIX8`.

### FIX5 · Supuesto: medir eje/pivote real

Supuesto: medir eje/pivote real

**Tipo:** `action`. **Siguientes:** `FIX8`.

### FIX6 · QA: agregar gate obligatorio

Error UMBRIA-QA-004: publicación anterior basó la aceptación en estructura sin probar píxeles visuales.

**Tipo:** `action`. **Siguientes:** `FIX8`.

### FIX7 · Composición: corregir blocking

Composición: corregir blocking

**Tipo:** `action`. **Siguientes:** `FIX8`.

### FIX8 · Correr prueba original y nueva regresión

Correr prueba original y nueva regresión

**Tipo:** `action`. **Siguientes:** `D26`.

### D26 · ¿El fallo se resolvió de verdad?

¿El fallo se resolvió de verdad?

**Tipo:** `decision`. **Siguientes:** `QA0` (Sí), `FIX9` (No).

### FIX9 · Comparar método alternativo

Comparar método alternativo

**Tipo:** `action`. **Siguientes:** `R8` (Investigar otra ruta).

## 16 · Persistencia y versiones

Guardar scene lock, evidencias, perfiles, reglas y uso del flujo.

### G0 · Persistir resultado sin exagerar madurez

Persistir resultado sin exagerar madurez

**Tipo:** `action`. **Siguientes:** `G1`.

### G1 · Guardar escena, fuentes y proyecto editable

Guardar escena, fuentes y proyecto editable

**Tipo:** `action`. **Siguientes:** `G2`.

### G2 · Fijar manifiesto SHA de assets

Fijar manifiesto SHA de assets

**Tipo:** `action`. **Siguientes:** `G3`.

### G3 · Guardar RESULT, QA y clips ejecutados

Guardar RESULT, QA y clips ejecutados

**Tipo:** `action`. **Siguientes:** `G4`.

### G4 · Registrar issues + causa + patch

Registrar issues + causa + patch

**Tipo:** `action`. **Siguientes:** `G5`.

### G5 · Guardar perfiles de orientación por asset

Guardar perfiles de orientación por asset

**Tipo:** `action`. **Siguientes:** `G6`.

### G6 · Proponer capacidad reusable con propietario

Proponer capacidad reusable con propietario

**Tipo:** `action`. **Siguientes:** `G7`.

### G7 · Guardar NEXT_ACTION y rollback

Guardar NEXT_ACTION y rollback

**Tipo:** `action`. **Siguientes:** `G8`.

### G8 · Vincular creación al flujo y versión exacta

Toda creación nueva debe conservar flowId, flowVersion, flowSha256, commit/archivo de resultado, QA de nodos y lineage. Obras anteriores: flowVersionUsed = null (desconocido), no atribuir flujo nuevo retroactivamente.

**Tipo:** `action`. **Siguientes:** `D27`.

### D27 · ¿Capacidad demostrada en otro consumidor?

¿Capacidad demostrada en otro consumidor?

**Tipo:** `decision`. **Siguientes:** `G9` (Sí), `G10` (No).

### G9 · Propuesta compartida con QA autónomo

Propuesta compartida con QA autónomo

**Tipo:** `action`. **Siguientes:** `PUB0`.

### G10 · Mantener como artefacto propio

Mantener como artefacto propio

**Tipo:** `action`. **Siguientes:** `PUB0`.

## 17 · Publicar y aprender

Promover únicamente lo demostrado y vincular la obra al flujo.

### PUB0 · Evaluar madurez y derechos

Evaluar madurez y derechos

**Tipo:** `action`. **Siguientes:** `D28`.

### D28 · ¿Hay prueba REAL suficiente para publicar como validado?

¿Hay prueba REAL suficiente para publicar como validado?

**Tipo:** `decision`. **Siguientes:** `PUB1` (No), `PUB2` (Sí).

### PUB1 · Dejar candidato / no fingir PASS

Dejar candidato / no fingir PASS

**Tipo:** `action`. **Siguientes:** `PUB4`, `END0` (Si no hay nueva prueba).

### PUB2 · Publicar demo aislada y verificable

Publicar demo aislada y verificable

**Tipo:** `action`. **Siguientes:** `PUB3`.

### PUB3 · Registrar enlace, commit, QA y limitaciones

Registrar enlace, commit, QA y limitaciones

**Tipo:** `action`. **Siguientes:** `PUB4`.

### PUB4 · Capturar aprendizaje para versión siguiente del flujo

Un nuevo fallo propone versión NUEVA del flujo, conserva versiones anteriores inmutables y compara en misma tarea y evidencia. No sobrescribir histórico ni decir mejora si no hay corrida comparable.

**Tipo:** `action`. **Siguientes:** `END1`.

### END0 · FIN · Candidato o bloqueo documentado

FIN · Candidato o bloqueo documentado

**Tipo:** `terminal`. **Siguientes:** .

### END1 · FIN · Publicado con evidencias y trazabilidad

FIN · Publicado con evidencias y trazabilidad

**Tipo:** `terminal`. **Siguientes:** .

## Plantilla de registro por creación

Consultar `CREATION_RECORD.example.json`. Cada publicación debe fijar IDs de nodos probados, fallidos y NOT_RUN, URLs de prueba, versión del flujo y commit. Si el flujo fue asignado después del hecho: conservar `flowVersionUsed:null`.
