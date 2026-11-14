# PROMETEO · FORJA 3D

**Primer compositor reutilizable de escenas** construido sobre la biblioteca real de **1.883 GLB / 19 colecciones** que ya alimenta [ATLAS](../asset-atlas/). No es otro gato ni un catálogo estático: ahora se puede **construir una escena** con edificios, caminos, vehículos, muebles, vegetación y personajes sin preparar código.

## Abrir

- Web (GitHub Pages después de publicar en `master`): https://juanmanuelpm.github.io/Experimentos/prometeo/forja/
- [Atlas original](../asset-atlas/) para inspeccionar recursos individuales.
- Fuente de los modelos, fijada a commit inmutable: [Hidencod/tge-assets @ 3ddcc695](https://github.com/Hidencod/tge-assets/tree/3ddcc695adbba9fb918cf31b7c139b3f95b76910).
- Los recursos de ese catálogo están identificados como CC0. La aplicación **no redistribuye archivos privados** y los recupera desde su repositorio público de origen cuando se necesitan.

## Qué hace

1. **Buscador sobre 1.883 modelos reales**, filtrado por 19 colecciones. Miniaturas de origen y agregado con un toque o arrastrando al mundo en escritorio.
2. **Tres escenas iniciales**: Barrio nocturno (edificios, autos, camino, árboles y gato), Interior 03:17 (muebles, luz, objetos y animal) y Bosque (naturaleza y criaturas). Cada pieza es un GLB cargado realmente.
3. **Editor 3D** con selección por toque/raycast y lista, gizmo de mover/rotar/escalar, snap opcional, inspector con valores numéricos, duplicación, borrado y enfoque de cámara.
4. **Animaciones reales del archivo GLB**: si el recurso incluye clips, reproducir el clip seleccionado por prioridad `idle/walk/run` y mostrar el número de clips presentes. No inventar clips ni suponer que todos los modelos se animan.
5. **Persistencia local** tras acciones y cambios de nombre; deshacer/rehacer hasta 50 snapshots; exportar/importar una escena JSON portátil que guarda ids de activos, posiciones, giros y escalas por eje, y procedencia.
6. **Exportar geometría/materiales a GLB** de la escena editada. Los clips animados **no se incluyen en esa exportación** en esta versión; el proyecto JSON conserva los modelos de origen y permite recargar clips.
7. **Modo Android**: biblioteca e inspector se abren como paneles laterales grandes; escena ocupa pantalla, con controles táctiles y OrbitControls.

## Manejo rápido

- Biblioteca: tocar un asset para insertarlo cerca del centro; en PC, arrastrar su tarjeta y soltar sobre el mundo.
- Objeto seleccionado: `W` mover, `E` rotar, `R` escala, `Delete` eliminar. `Ctrl+Z` deshacer, `Ctrl+Y` o `Ctrl+Shift+Z` rehacer.
- La cámara se mueve arrastrando fuera del gizmo. La rueda o pellizco acercan/alejan.
- El botón **GUARDAR** exporta JSON. **ABRIR** importa ese JSON y valida todos sus ids contra el catálogo fijado al commit. No ejecuta código del JSON.
- **EXPORTAR GLB** exporta el mundo construido como archivo 3D.
- La interfaz guarda automáticamente en `localStorage`; eso pertenece al navegador/dispositivo. Para transportar entre equipos usar GUARDAR y ABRIR. No hay sincronización remota silenciosa.

## Arquitectura

```
Hidencod/tge-assets (GLB CC0 + catalog.json, SHA fijo)
             |
             v
   forge.mjs / catálogo buscable 1.883
             |
        GLTFLoader -> SkeletonUtils.clone
             |
  escena editable + TransformControls
       /          |           \
 JSON/import   GLB export   Autosave/Undo
```

No copiar `catalog.json` ni miles de GLB a la rama pública: mantener una fuente deduplicada con SHA fijo y cargar **por demanda**, más barato y seguro para móviles. El formato de proyecto es `prometeo.forja.scene/v1`; no es el JSON histórico de OmniAtlas, que carga OBJ/MTL con otras rutas.

## Estado y pruebas

- **Verificado por código:** índice de origen de 1.883 modelos y nombres de packs; ids de los recursos seleccionados en las escenas iniciales presentes en el catálogo original.
- **Validación rápida del candidato:** análisis sintáctico del módulo JS, coincidencia de IDs de DOM, verificación de enlaces de importmap, esquema de serialización y aislamiento en un directorio nuevo.
- **Pendiente:** prueba real del navegador/WebGL2, carga de todas las piezas de cada escena, facilidad de uso táctil en el Jelly Star y calidad artística. No presentar lo anterior como equivalente a aprobación visual.
- Si faltan recursos por red/CORS, se muestran errores concretos, sin sustituir automáticamente el modelo por una caja ficticia.

## Límites conocidos

- No incluye motor de colisiones ni físicos; es un **compositor visual**.
- La ejecución de clips GLB dentro del editor no implica edición o montaje de las pistas de animación. Exportación GLB solo geometría y materiales.
- La escena puede utilizar mucha memoria en teléfonos pequeños. Los presets están deliberadamente limitados a 7-9 archivos y el renderer limita el pixel ratio.
- Los modelos se normalizan por altura para editar con tamaños comparables; su unidad original no necesariamente coincide con metros reales.
- Los proyectos JSON solo aceptan hasta 150 instancias y transformaciones limitadas; un modelo externo que no esté en el catálogo es rechazado.
- No se modifica el catálogo original ni la web pública `asset-atlas`.

## Próxima frontera

Agregar escenas compartidas/versionadas mediante una API autorizada, composición asistida por IA desde el catálogo, mezcla explícita de animaciones y un render/evaluación comparativa en navegador real. Esas capacidades **no se declaran implementadas**.

**Regla de calidad:** esta edición se construyó en modo **impulso**. Las verificaciones estructurales son un control rápido, NO sustituyen la auditoría artística posterior.
