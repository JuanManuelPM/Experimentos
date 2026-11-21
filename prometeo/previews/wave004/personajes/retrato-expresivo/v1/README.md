# NARA · Retrato expresivo · Personajes 01 / Ola 004

**Estudio:** PROMETEO / Estudio 3D. **Especialidad:** PERSONAJE. **Versión:** V1. **Flujo fijado:** 2.3.0 (`53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`). **Brief SHA-256:** `db0d4f80e9662571265c98d0969604691bf08db45a703677ec74e49ebb504ee2`.

## Brief literal e inmutable

> Quiero un personaje humano original para primeros planos: identidad en cara, silueta, ojos, pelo y materiales, con gestos y expresiones claras. El recurso central es el personaje; no un muñeco de esferas y cilindros.

## Qué es

**Nara**, restauradora de mapas ficticia: ilustración vectorial original de rostro y busto, recortada en capas de pelo, cara, ojos, mandíbula, nariz, vestuario y ornamentos. Con expresión serena, sonrisa, duda, sorpresa y tristeza; mirada dirigida, parpadeo y giro 2.5D táctil. Diseñada para primeros planos. No usa esferas, cajas, cilindros ni cuerpos 3D formados por primitivas.

Es una **producción de arte 2.5D**, NO una escultura 3D volumétrica ni un rig óseo. La perspectiva CSS y el desplazamiento de capas no sustituyen la topología de un rostro 3D real. Esta elección fue deliberada: permitir buena definición facial con fuentes editables y sin depender de GLB externos dudosos o librerías de red. Si otra obra necesita giros de 180°, blendshapes reales o exportación glTF, necesitará una nueva fuente 3D.

## Archivos

- `index.html`: visor editorial responsive, controles con teclado/táctil, enlace al original.
- `character.svg`: arte vectorial independiente y editable. Solo se usa contenido dibujado para este encargo. No contiene fotos, tipografías importadas ni modelos externos.
- `viewer.js`: actuación facial y protocolo de integración.
- `ASSET_MANIFEST.json`: derechos, hashes y alcance.

## Integración en otras escenas

- `https://juanmanuelpm.github.io/Experimentos/prometeo/previews/wave004/personajes/retrato-expresivo/v1/?embed=1`: modo sin interfaz ni fondo.
- `?embed=1&expression=sonrisa`: expresión inicial; opciones `serena`, `sonrisa`, `duda`, `sorpresa`, `tristeza`.
- En la misma página: `window.PROMETEO_CHARACTER.setExpression('duda')`, `.setGaze(x,y)`, `.setPose(x,y)`, `.blink()`, `.reset()`, `.getState()`; x/y de -1 a +1.
- Si se usa un `iframe` desde otra página, enviar un comando con `iframe.contentWindow.postMessage({channel:'prometeo.character.v1',type:'command',action:'expression',value:'sonrisa'}, '*')` después de recibir el evento `ready`; no se ejecutan scripts externos desde mensajes.
- El SVG editable puede integrarse directamente en otra composición, pero las expresiones requieren el controlador del visor o un adaptador propio.

## Prevención y rutas contrastadas

1. **Malla humana con rig/blendshapes importada o modelada**: permitiría movimiento volumétrico pero no había Blender disponible en este entorno; una malla cualquiera sin blendshapes ni licencia comprobable no cumple el primer plano. No se declaró asset adquirido.
2. **Ilustración vectorial por capas original**: fuente y derechos íntegramente controlables, rasgos de identidad y actuación facial con cinco estados. Seleccionada y realizada para esta entrega como representación 2.5D, dentro de las vías permitidas por el método.

**Pruebas hechas:** SVG parseado como XML; render PNG estático generado para inspección de composición; JS revisado con `node --check`; HTML parseado. **NO EJECUTADO:** prueba del visor completo en Chrome/Android real, interacción táctil física, pruebas de GPU ni aprobación artística humana. No se confunde la comprobación estática con aprobación.

**No modificado:** brief, flujo global, catálogo, otros personajes o ramas ajenas. La crítica humana de este retrato corresponde a una ronda posterior de CALIBRAR sobre el método universal.
