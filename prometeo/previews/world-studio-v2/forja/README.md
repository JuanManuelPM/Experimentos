# FORJA V2 · candidato aislado

Editor original conservado con catálogo Atlas + Quaternius por commits fijos. 4406 referencias seleccionables, no equivalen a diseños visualmente únicos. 130 FBX fuera del soporte actual. Los GLB idénticos por SHA256 dentro del pack comparten referencia; no se deduplica glTF por JSON ni entre catálogos sin hash comparable. Las dependencias se resuelven mediante URL relativa del GLTFLoader. Estado de pack parcial visible; no se promete integridad de cada modelo.

## Uso
Abrir index.html servido por HTTP desde esta rama, con acceso a CDN y fuentes. Elegir el preset ATLAS + QUATERNIUS para cargar una construcción histórica y dos Alpacas independientes. JSON v1 se lee, v2 conserva XYZ y fuente; el autoguardado v1 queda intacto. Si falla un modelo durante la apertura, se restaura la escena anterior y no se guarda una versión incompleta. El caché de metadatos permite consultar el catálogo si se leyó antes; no garantiza modelos fuera de línea.

## Verificación
node catalog.test.mjs. Pruebas ejecutadas en V8 sobre fuentes reales y fixtures; detalles en BUILD_RECEIPT.json. WebGL, Android, exportación GLB, tiempos y memoria reales NOT_RUN por entorno sin acceso de red desde navegador. El GLB exporta geometría y materiales sin timeline. El candidato no está publicado en Pages; no se cambia producción ni catálogos dueños.
