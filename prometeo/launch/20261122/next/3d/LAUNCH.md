# PROMETEO · Estudio 3D · W6 · Diez encargos nuevos

**Estado:** 10/10 PREPARED · CANDIDATE · AWAITING_ROOT_REVIEW · NO WORK STARTED.
**ID nuevo:** `3d-w6-20261122`. **Fuente:** `JuanManuelPM/Experimentos` · rama `candidate/prometeo-nextwave-3d-20261122`. **Fecha de preparación:** 2026-11-22.
**No altera:** W5 (`3d-w5-20261121`), W4, BATCHES.json, versiones del flujo, obras o mensajes históricos.

## Invocación única

`WORK · https://github.com/JuanManuelPM/Experimentos/blob/candidate/prometeo-nextwave-3d-20261122/prometeo/launch/20261122/next/3d/LAUNCH.md · N`

Reemplazar solamente N por un entero 1–10. **Un número selecciona exactamente una sección; diez chats separados no son diez prompts distintos.** Este archivo es candidato para revisión ROOT, NO autorización para despachar hasta aprobación. No ejecutar por leer o copiar.

## Resolución obligatoria del WORK después de la autorización

1. Leer este LAUNCH completo y la sección N, conservando las palabras del brief. Fijar `batchId=3d-w6-20261122`, `taskNumber=N`, `taskId=3d-w6-20261122-NN`; registrar SHA de este LAUNCH y del flujo efectivo al inicio del trabajo. **No cambiar de flujo durante el encargo**.
2. Recuperar `JuanManuelPM/pruebas@prometeo/control:sistemas/metodo/CONTRATO_COMPARTIDO.md`, `PROMETEO/START_HERE.md`, `JuanManuelPM/Experimentos@gh-pages:prometeo/launch/QUALITY_BAR.md`, `prometeo/launch/20261122/UNIVERSAL.md` y `prometeo/launch/DEEP_SPEC.md`, junto con su validador `prometeo/launch/deep-spec-v1.mjs`. Verificar su contenido y la disponibilidad concreta del método antes de afirmar que se ejecutó.
3. Flujo 3D de referencia **2.3.0**: `prometeo/3d-flow/FLOW_INDEX.json` → `versions/2.3.0/flow.json` (SHA256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`) y `METHOD.md`. Confirmar versión/sha al iniciar; aplicar principios de representación profesional, escala, cámara, material/luz, animación, UI táctil y límites reales. No promover aquí un flujo nuevo.
4. Ejecutar **Q-LOOP + QBAR-1 + DEEP-SPEC-1** de forma proporcional: buscar 3–5 referencias artísticas/técnicas relevantes y observarlas realmente; seleccionar alternativas de modelado/adquisición; registrar relaciones críticas (escala, oclusión, PBR, rig, física, datos), permisos, precondiciones, riesgos y pruebas que cambian decisiones. Persistir `PREPRODUCTION.deep-spec-v1.json` en la rama de la obra y ejecutar el validador si Node está disponible; ante riesgo alto no probado usar SPIKE_REQUIRED, no READY ficticio. Esta ficha es **interna**, no formulario del usuario.
5. Elegir técnica/asset por adecuación, con bytes y derechos reales. Un primitivo puede ser blockout artístico, pero NO un humano o producto final mediocre. No crear simulaciones visuales fingidas, PDFs en lugar de escenas, exportaciones inventadas ni capturas no autorizadas. Si una dependencia no está disponible, continuar lo legítimo y registrar su límite; no confundir avance con aprobación.
6. Para cada N, usar rama exclusiva `candidate/prometeo-3d-w6-NN-20261122` en `JuanManuelPM/Experimentos` tras comprobar colisión, y salida aislada `prometeo/previews/3d/w6/NN/` cuando proceda. No compartir árbol editable ni sobrescribir FORJA, W5 o ROOT. Publicación en Pages solo de material autorizado y seguro, con lectura remota y confirmación real.
7. Entregar obra 3D **observable y revisable**, fuentes, assets/licencias, componente reutilizable identificado, evidencia perceptual y técnica apropiada, limitaciones y estado honesto (`NOT_RUN` si no pudo renderizarse, reproducirse, usarse o exportarse). Registrar `PREPARED`, `STARTED_EVIDENCED`, `DELIVERED`, `VERIFIED` y `HUMAN_APPROVED` por separado; no certificar calidad por tests estructurales.
8. Tras el despacho autorizado, reportar a ROOT con `room="3d"`, `batchId`, `taskNumber`, identidad de mensaje única, hora, enlace público real y recibo. Usar readback + actualización condicional por SHA y reintento para `ROOM_MESSAGES.json`; nunca recrear el índice desde un HEAD viejo ni agregar entradas en la fase de diseño.

## Los diez briefs

### 01 · Actor digital · Interlocutora

Creá «Interlocutora», una breve escena original de conversación con un personaje digital que escucha, responde y cambia de emoción mediante actuación corporal, rig facial y sincronía labial con audio autorizado; dos elecciones deben alterar la interpretación sin depender de un servicio externo en vivo. Entregá el personaje reutilizable, sus fuentes editables y una experiencia 3D donde se puedan observar planos frontal, perfil y primer plano, expresiones, deformación y continuidad audio-boca.

### 02 · Arquitectura · Casa entre patios

Construí «Casa entre patios», un interior arquitectónico explorable con medidas plausibles, mobiliario de autor o licenciado, superficies PBR, cambios de luz natural y artificial y una composición cinematográfica consistente. La cámara deberá atravesar habitaciones sin que paredes o techos oculten el objetivo, y el componente reutilizable de oclusión/cámara se comprobará con un recorrido táctil y capturas comparables de tres ambientes y dos condiciones de luz.

### 03 · Mundo jugable · Asteroide Jardín

Creá «Asteroide Jardín», un pequeño mundo esférico jugable con identidad de arte propia, habitantes con rutinas legibles y una misión completa que comience, cambie el mundo y tenga resolución; el movimiento debe respetar gravedad local, orientación, colisiones y navegación de personajes. Entregá una escena ejecutable con guardado/reinicio y un módulo reutilizable de locomoción planetaria, demostrando final de misión, encuentro con habitantes y control móvil, sin convertir el planeta en un montón de cubos.

### 04 · Dirección cinematográfica · La despedida

Construí «La despedida», una escena dramática original con dos personajes y una herramienta de dirección que permita editar planos, movimientos de cámara, iluminación y actuaciones en una línea de tiempo reproducible. Entregá escena y timeline editables, un componente reutilizable de secuenciación y, cuando exista exportador real, un corto reproducible con audio; probá continuidad de miradas, duración y correspondencia exacta entre la línea de tiempo y el resultado exportado, sin fingir un MP4.

### 05 · Laboratorio mecánico · Máquina de leva

Construí un laboratorio interactivo alrededor de una máquina de leva, seguidor y transmisión con piezas manufacturables, cotas coherentes, pivotes, uniones y restricciones físicas que expliquen qué fuerza mueve cada parte. Permití variar parámetros y detener/reiniciar el mecanismo, entregando la máquina 3D editable y un módulo reutilizable de restricciones y diagnóstico; verificá ciclos completos, contactos, conservación de conexiones y ausencia de piezas que se atraviesan.

### 06 · Naturaleza · Bosque de cuatro estaciones

Creá un bosque transitable con especies vegetales reconocibles y coherentes, relieve, río, viento, lluvia y transición entre estaciones que afecte realmente follaje, luz, terreno y atmósfera, no solo el color del cielo. Entregá un paisaje 3D de autor y un sistema reutilizable de instancias, niveles de detalle y clima, con recorridos observables en móvil que muestren continuidad ambiental, reflejos y sombras plausibles y comportamiento medido al cambiar calidad.

### 07 · Captura · Una habitación verdadera

Reconstruí un espacio interior real a partir de fotografías o escaneo con permisos verificables, preservando sus proporciones y detalles mediante fotogrametría o Gaussian splatting según la evidencia y el dispositivo disponible; la captura sintética inventada no cuenta. Entregá escena navegable, fuente/licencia, una herramienta reutilizable de alineación foto-vista y comparaciones de posiciones de cámara y geometría; si falta material autorizado o exportación compatible, registrá el bloqueo específico sin sustituirlo por decoración genérica.

### 08 · Geografía · Atlas de una cuenca

Construí un atlas 3D navegable de una cuenca geográfica real con relieve, hidrografía y por lo menos dos capas de datos auténticos, con fecha, escala, proyección y atribuciones visibles. Entregá un terreno multiescala ejecutable y un componente reutilizable de carga de teselas/datos; probá puntos de referencia, superposición correcta de capas, lectura desde vista regional a detalle y funcionamiento sin claves privadas incrustadas.

### 09 · Herramienta de autor · FORJA Escena

Extendé FORJA de forma aislada hacia un editor 3D utilizable para componer una escena con jerarquías, selección, transformaciones, cámara, luces, animación por keyframes y deshacer/rehacer; mantené compatibilidad documentada con proyectos anteriores cuando sea posible. Entregá editor funcional, proyecto de demostración original y un núcleo reutilizable de serialización: importá un GLB autorizado, editá, guardá, recargá y compará estado y reproducción sin perder nodos, pivotes o tiempos.

### 10 · Ingeniería visual · Bicicleta plegable

Diseñá una bicicleta plegable original y técnicamente plausible como producto 3D de alta fidelidad, con cuadro, uniones, frenos, transmisión y acabados modelados con tolerancias y escala coherentes, no piezas suspendidas en el aire. Entregá un configurador editable de materiales y variantes, vistas de despiece y plegado y un módulo reutilizable de explosión/ensamblaje; verificá encajes, continuidad de materiales y correspondencia entre lista de piezas, modelo y animaciones.

## Auditoría y decisión

Investigación, matriz de diferenciación, referencias verificables, límites, estado del gate y condiciones de lanzamiento: [EVIDENCE.md](EVIDENCE.md). Los benchmarks señalan aspiraciones, no calidad comercial demostrada; las diez ejecuciones y su QA artístico permanecen **NOT_RUN**.
