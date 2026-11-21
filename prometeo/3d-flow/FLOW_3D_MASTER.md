# PROMETEO Estudio 3D · 2.2.0

Hash canónico: `764d5ee400a62dbc1bae1e96cec581c21e44d3d1895392b6283e8357ed3a2263`. Hereda [2.1.0](../2.1.0/METHOD.md) y [2.0.0](../2.0.0/METHOD.md) salvo contradicción con esta versión. Únicamente Estudio 3D. No cambiar briefs ni escenas históricas.

**Piso cero de personajes:** ningún avatar está aprobado. Cada proyecto con actores investiga y crea su propio avatar como un frente artístico de profundidad comparable al escenario. No hay método, asset o asignación de técnica fija. Diseñar identidad y silueta, cuerpo, rostro, manos, cabello, ropa, UV/material, topología, rig, expresión, lookdev y corrección. Comparar al menos dos rutas materialmente distintas que estén disponibles; un recolor no es ruta nueva. Modelar/esculpir o transformar una base legal de manera sustantiva. No añadir humanos a escenas que no los requieren. Mostrar vistas neutrales y plano real e intento completo. Conservar variantes; la decisión de qué base gusta es humana. Estándar compartido sólo tras aprobación y prueba en otro consumidor.

**Movimiento:** TODOS los actores que caminan y todas sus rutas. Medir frente anatómico mundial (incluye transforms/import), velocidad horizontal real; dot >=0.8 cuando marcha normal, no medir idle como marcha; retroceso/strafe intencional exige prueba de intención y clip. Medir giro, loop, parada, contacto, stride, raíz y apoyo. Un secundario al revés es FAIL aunque el héroe pase. Ausencia de medición es NOT_RUN. No usar yaw puesto por tiempo como solución general.

**UI:** modo presentación limpio de entrada; acciones esenciales contextuales/ocultables, menú cerrado, área visual persistente objetivo máximo 12%, cero solapamiento con zona focal, targets 44px cuando viable. Medir unión de rectángulos con DOM a 360x640, 412x915, 915x412 y escritorio. Overlay de juego/HTML sólo por acción explícita, cierre y retorno. No afirmar textura 3D si es overlay. Mantener el arte visible.

**Touch:** FREE_LOOK derecha mira derecha y arriba mira arriba; ORBIT el mundo proyectado sigue dedo. No asumir que los signos de ambas cámaras son las mismas. Pointer ID/capture/cancel, lostcapture, tap/drag, pinch, pan, exclusión de UI, cambio modo sin salto. Probar cuatro sentidos y marcador visual en navegador/Android; fixtures matemáticos no equivalen a experiencia física.

**Otras regresiones:** verificar carga, escala/profundidad, contacto/colisiones, clipping, giros/cortes, orientación de pantalla, pérdida contexto, audio, FPS/memoria, reset. Riesgo no significa defecto demostrado. Cambiar el subflujo causal, no personalizar prompts. Corregir bugs técnicos durante producción, no abortar la entrega por resultado artístico. Guardar fuente, recibo, traza, pruebas y preview completa aun con gaps. Nunca afirmar PASS artístico por tests.

Leer `STAGE_OPERATIONS.json`, `PRODUCTION_CONTRACT.json` y `production-gates.mjs`. Los 36 nodos adicionales son parte de las rutas existentes, no anexos opcionales. La próxima ola conserva las diez escenas y briefs; fijar este hash y construir versiones nuevas. No lanzar automáticamente.

## Nodos de la mejora
### av_role
**Diseñar el reparto antes de modelar** (planning). Inventariar todos los actores por ID: identidad, oficio, silueta, personalidad, tamaño en plano, acciones y estilo; no añadir actores ajenos al brief.

### av_budget
**Dedicar un frente artístico completo al avatar** (planning). Asignar esfuerzo comparable en profundidad al escenario: investigación, diseño, cuerpo, cara, ropa, materiales, rig, actuación y prueba. No usar minutos sobrantes.

### av_ref
**Investigar referencias de identidad y anatomía** (planning). Recuperar referencias estéticas pertinentes de rostro, silueta, vestuario y movimiento; derechos de uso y no copiar personajes propietarios.

### av_open
**Explorar dos métodos realmente distintos** (planning). Cada productor elige su ruta, incluso una nueva no catalogada. Comparar al menos dos alternativas materialmente distintas y disponibles. No fijar estilo, modelo, proveedor ni técnica universal. Catálogo de 2.1 sólo ideas.

### av_tool
**Comprobar herramientas y recursos reales** (acquisition). Probar modelador/editor/exportador, malla base y rig de verdad; derechos por asset. Si una vía no está disponible investigar otra, no volver automáticamente al modelo mediocre.

### av_design
**Diseñar silueta y model sheet** (humanoid). Diseñar proporciones, pose, frente/perfil/espalda y tres cuartos; diferenciar cabezas, cuerpos y ropa; una imagen conceptual no es malla.

### av_body
**Autoría real del cuerpo** (humanoid). Modelar/esculpir o transformar sustancialmente una base legal con editor/modelador genuino cuando sea viable. Silueta, cráneo, torso, articulaciones, topología; no entregar muñeco de primitivas ni recolor como identidad nueva.

### av_face
**Construir rostro con identidad** (humanoid). Formas de cráneo, mandíbula, nariz, ojos, párpados, boca, cejas, orejas; nivel de detalle según plano. Comprobar expresión y coherencia de anatomía.

### av_hands
**Manos, pies, cuello y uniones** (humanoid). Revisar dedos cuando visibles, cuello, muñecas, hombros, calzado, huecos, piezas flotantes, intersecciones y proporciones.

### av_hair
**Cabello y rasgos propios** (humanoid). Silueta y acabado propios, peinado y accesorios anclados, no identidad basada sólo en color.

### av_cloth
**Vestuario como geometría y material** (humanoid). Ropa con volumen, caída, costuras, capas y coherencia con oficio/época; prueba de intersección al deformar.

### av_material
**UV, piel, ropa, materiales** (humanoid). UV/atlas o técnica justificada; textura de piel, ojos, pelo, tela; densidad según cámara y materiales coherentes con luces, no ruido global.

### av_topo
**Inspeccionar geometría y exportable** (humanoid). Normales, topología, mallas conectadas y calidad de exportación editable/GLB si viable; revisar rendimiento y nivel de detalle.

### av_rig
**Rigado y poses de esfuerzo** (humanoid). Huesos, rest pose, escalas, pesos, hombros/caderas/rodillas; poses relevantes, deformación real. Rig separado del aspecto.

### av_expr
**Expresión, rostro y actuación** (humanoid). Para closeup/diálogo: gestos, mirada, blink y boca, morphs/huesos y sincronía real; no confundir voz y subtítulo con actuación facial.

### av_lookdev
**Banco de prueba visual del personaje** (humanoid). Render genuino neutral frente, perfil, espalda, tres cuartos; cara/manos según plano; pose y clip si animado; luego luz y distancia de escena.

### av_iterate
**Comparar y corregir durante autoría** (humanoid). Comparar con referencias y segunda vía; corregir mayor defecto observable antes de montaje cuando viable, guardar versión antes/después. No iterar eternamente ni cancelar entrega completa.

### av_cast
**Identidades del reparto, no clones** (humanoid). Comprobar todos los IDs visibles, variedad real de geometría facial/corporal/ropa, LOD razonable. Base legal puede ser materia prima, no estándar hasta aprobación.

### av_axis
**Calibrar frente anatómico de toda instancia** (orientation). Frente local real por malla y transform mundial, incluyendo import, offsets, jerarquía y escala negativa. No asumir eje por GLB. Guardar evidencia por perfil e instancia.

### av_route
**Orientar con velocidad real de trayectoria** (acting). Calcular tangent/velocidad del root en mundo, aplicar yaw corregido por frontLocal calibrado; giro más corto, parar a baja velocidad. Retroceso/strafe sólo intencional con clip apropiado.

### av_clips
**Calibrar clip y desplazamiento** (acting). Comprobar clip real/rig, stride, root motion o in-place, velocidad, idle, curva y giro; no aplicar doble movimiento.

### av_all_motion
**Medir cada actor que camina, incluidos extras** (acting). Cruzar roster de escena real: todos los IDs y rutas, dirección normal dot frente mundial/velocidad ≥0.8, cuatro orientaciones canario, giros, retorno, loop, marcha/idle. Muestrear poses y errores por actor, no sólo héroe.

### av_contact
**Pies, posición, asiento y manos** (acting). Medir apoyo y deslizamiento, contacto con suelo/asiento/prop y poses en sus fases; comprobar cámara real, no sólo coordenadas.

### ux_mode
**Escena protagonista, UI mínima** (assembly). Presentación inicial sin paneles invasivos, modal ni controles secundarios; acciones contextuales, menú colapsado, HUD ocultable y limpio. Modo juego/inspección explícito.

### ux_area
**Medir ocupación visual y tacto** (assembly). Objetivo candidato: unión de UI persistente ≤12% viewport y cero superposición focal, controles táctiles ≥44 CSS px cuando viable; safe area, portrait/landscape, medir rectángulos y no duplicar zonas.

### ux_layer
**Capas, interfaz y contenido del mundo** (assembly). Pantalla de prop en textura real cuando posible; HTML externo sólo overlay explícito y cerrable, no cubre escena por defecto. Excluir UI del gesto de cámara, controles no bloquean área ajena.

### touch_mode
**Fijar significado del gesto por cámara** (cinema). FREE_LOOK: derecha mira derecha, arriba mira arriba. ORBIT: la proyección de referencia sigue el arrastre. HYBRID conserva pose, GUIDED no se rompe por tap accidental.

### touch_core
**Entrada táctil común con adaptador** (cinema). Pointer ID, capture, cancel/lostcapture, umbral tap/drag, pinch/pan, CSS pixels, exclusión de UI y multitouch, límites, horizonte y resize; no signos parcheados a ojo.

### touch_probe
**Comprobar cuatro sentidos y cambios de modo** (cinema). Medir giro derecha/izquierda/arriba/abajo, gesto de dos dedos, tap/drag, reset, giro de teléfono y continuidad sin salto; probar real, no sólo signo matemático.

### qa_cast
**Cobertura de todo el reparto** (qa). El auditor cruza inventario actor real, rutas, muestras y pruebas por ID; un extra que camina atrás falla locomoción. Faltantes NOT_RUN. Arte sólo humano.

### qa_hud
**Medir interfaz en pantallas reales** (qa). 360×640, 412×915, 915×412 y escritorio; captura en estado inicial, interacción, menú, error. Presupuesto de área, focal, cierre, safe-area y targets.

### qa_touch
**Verificar gesto y continuidad** (qa). Pruebas navegador y Android por separado, arrastre, giro, pinch/pan, cancel, controles, scroll accidental, focus y zoom. Fixture numérico no prueba experiencia real.

### qa_latent
**Matriz transversal de riesgos no observados** (qa). Comprobar arranque/GLB, espacios cerrados, parallax, escala/sliding/collision, cámara clipping, cortes/pausas, resize, pérdida contexto, audio/autoplay, FPS/memoria, reset. Riesgo no es defecto confirmado.

### ux_cause
**Corregir causa, reejecutar prueba** (repair). Ubicar falla en authoring, rig, eje, clip, ruta, input, layout, runtime. Reparar problemas técnicos verificables antes de entregar sin recortar la escena ni cambiar brief.

### av_save
**Conservar variantes y autoría editable** (persistence). Guardar intentos, fuente editable, licencia, rig, clip, capturas, diferencias y decisiones por actor. Biblioteca visual aprobada vacía; no convertir versión provisional en estándar.

### av_review
**Comparar obras completas y personajes** (publish). Mostrar personaje en neutral, cara/acción y escena completa. Aprobación humana por apariencia y movimiento; sólo base después de que guste, estándar compartido con segundo consumidor probado.

## Pruebas del método
56 pruebas de código ejecutadas en V8 (fixtures de orientación, cobertura de reparto, UI, gestos, compilador, grafo y recibo). No se ejecutó Node CLI, WebGL2 ni Android físico; no hay avatares nuevos aprobados.