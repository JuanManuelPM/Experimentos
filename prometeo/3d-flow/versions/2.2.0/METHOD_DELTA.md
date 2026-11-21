# METHOD_DELTA 2.1.0 → 2.2.0

## Avatar: no hay base visual aprobada
USER_REPORTED: El flujo dedicó selección de recursos pero no una secuencia de autoría artística completa; usuario rechaza avatares actuales.

Nodos: AV_ROLE, AV_OPEN, AV_BODY, AV_FACE, AV_CLOTH, AV_LOOKDEV, AV_ITERATE.

## UI invasiva tapa la escena
USER_REPORTED_SOURCE_SUPPORTED: Arcade V2 incluye top, panel de acciones, pad, fire y capa de juego explícita. No se midió cobertura real; usuario informa obstrucción.
- prometeo/previews/arcade-retro/v2/index.html@6f9ec4d3a86796f23ef6fdbf2ef888c523547401
- prometeo/previews/arcade-retro/v2/app.mjs@5bcb619ea3ec6174549be162065d0fbcb7b334e1
Nodos: UX_MODE, UX_AREA, UX_LAYER, QA_HUD.

## Gestos táctiles invertidos o inconsistentes
USER_REPORTED_SOURCE_RISK: Implementaciones separadas de signos yaw/pitch y eventos pointer; Arcade/Transporte no muestran cleanup canvas cancel en handlers revisados. No se reprodujo gesto físico exacto.
- prometeo/previews/arcade-retro/v2/app.mjs@5bcb619ea3ec6174549be162065d0fbcb7b334e1
- prometeo/previews/transporte-retro/v3/scene.mjs@b7d628e4241d7e949f8342c1e04442afda1d3af3
- prometeo/previews/laboratorio-submarino/v2/scene.mjs@431c3af78f23c07cff61140de339c346a5fc387e
Nodos: TOUCH_MODE, TOUCH_CORE, TOUCH_PROBE, QA_TOUCH.

## Secundarios caminan hacia atrás
USER_REPORTED_SOURCE_RISK: Estación usa yaw por tiempo separado de trayectoria; Transporte yaw discontinuo por tiempo; Cruce necesita prueba de frente mundial de modelo importado. No se verificó qué actor exacto falló.
- prometeo/previews/estacion-servicio-tormenta/v2/scene.mjs@709180a950a47ed197817c4209cf9e9f63e2f917
- prometeo/previews/transporte-retro/v3/scene.mjs@b7d628e4241d7e949f8342c1e04442afda1d3af3
- prometeo/previews/cruce-urbano/v2/scene.mjs@f0a2d1f6f0f59fb3af0cfd14f0f0710e782c4f89
Nodos: AV_AXIS, AV_ROUTE, AV_ALL_MOTION, QA_CAST.

Preservar w2, briefs, escenas y versiones anteriores. QA de GPU/Android/art pendiente; los riesgos latentes son hipótesis preventivas.
