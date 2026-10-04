# Demo Engine Window Lab V1

Copia experimental separada de Prometeo para probar Demo Engine V4 sobre una shell de widgets inspirada en `current-tree/control-v11/work-score/`.

## Objetivo

Tener un mundo de prueba suficientemente real para evaluar el motor sin usar datos, iframes ni estado de Prometeo.

## Qué prueba

- scroll dentro de una app
- click + waitFor
- typing humano
- select / slider / toggle
- comentarios anclados
- drag con objeto pegado al cursor
- resize con medida visible
- look / trace / cameraFocus
- gestos narrativos
- pacing y continuidad entre acciones

## Regla

Este experimento no es una nueva UI de Prometeo. Es un **fixture visual** para mejorar el motor de demos.

## Dependencias

Reutiliza desde `../demo-engine-v4/`:

- `demo-engine-v3-base.js`
- `demo-engine-v4.js`
- `pointer-assets.js`
- `gesture-assets.js`

Así, una mejora al motor puede verse inmediatamente en este laboratorio sin duplicar el runtime.
