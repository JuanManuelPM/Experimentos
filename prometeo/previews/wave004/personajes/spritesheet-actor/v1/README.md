# LUMA · Personaje con spritesheet transparente · Ola 4 / Personajes 7

**Entrega:** recurso ilustrado original reutilizable. Este no es un videojuego ni una malla humanoide de primitivas. El personaje se presenta sobre un escenario Three.js con orbitado táctil.

## Archivos

- `atlas.svg`: atlas vectorial transparente de **8 columnas × 4 filas**, 32 cuadros, cada cuadro 280 × 360 px.
- `generator.mjs`: autoría editable/determinista del atlas, sin dependencia de fotos, texturas propietarias ni packs externos.
- `manifest.json`: estados, índices, tamaños, FPS y hashes fijados del método/brief.
- `actor.mjs`: módulo independiente para Three.js que no importa una versión propia de la librería.
- `index.html`, `app.mjs`, `style.css`: exhibidor con reposo/caminar/giro/reacción, FPS, órbita y respaldo visual 2D.

## Reutilizar sin copiar el exhibidor

```js
import * as THREE from "three";
import { createLumaSprite } from "./actor.mjs";
const actor = await createLumaSprite({ THREE, atlasUrl: "https://juanmanuelpm.github.io/Experimentos/prometeo/previews/wave004/personajes/spritesheet-actor/v1/atlas.svg" });
scene.add(actor.object);
actor.setAnimation("walk"); // idle | walk | turn | react
// en el bucle existente
actor.update(deltaSeconds, camera);
// para liberar memoria: actor.dispose()
```

Este módulo es un plano de imagen transparente y no añade colisiones, IA ni modelo 3D. El modo "turn" es una rotación ilustrada estilizada, no un rig de 360 grados. El girado real en la escena lo realiza la cámara/objeto del integrador.

## Decisión artística preventiva

Se comparó (A) importar un pack de sprites 2D con licencia libre o (B) diseñar ilustración vectorial original con los cuatro clips. Se eligió B por identidad, transparencia, trazabilidad y porque no dependía de un conjunto externo que quizá careciera de giro o reacción. Los cuatro estados conservan la silueta, vestuario y farol del mismo personaje. La fuente está incluida y es regenerable. Recursos artísticos externos **ninguno**.

## Verificación y límites

- **Comprobado en autoría:** generación de 32 cuadros, controles de valores inválidos y subida de archivos con commits.
- **Comprobación pendiente:** carga en navegador real/GPU Android y aprobación estética humana. Un hash, un commit o una prueba estática no acredita eso.
- **Dependencia de exhibidor:** Three.js 0.160.1 desde jsDelivr; el recurso/adapter es independiente. Sin WebGL se usa vista 2D animada.
- **Privacidad:** no incluye datos personales. No se cambió el método universal 2.3.0.
