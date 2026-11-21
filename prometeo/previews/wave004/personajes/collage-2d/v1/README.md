# Lía · Cartógrafa de lo perdido

**Estudio 3D / Ola 004 / Personajes 06 / V1.** Entrega independiente de un personaje original de collage ilustrado 2.5D, animado dentro de una escena editorial de papel.

- Brief congelado: `BRIEF.md` y `BRIEF_LOCK.json` (SHA-256 `3703e95b54ab5fa5c3547981007a3094b6f5f0920388553f19ba92f07998d7fc`).
- Flujo fijado: 2.3.0, SHA-256 canónico publicado `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.
- Implementación: SVG editable original, 19 capas con eje Z, 3 expresiones, 3 acciones, cámara arrastrable, respuesta a teclado, control de animación y diseño adaptable a móvil.
- Dependencias: ninguna. No se descarga ningún asset ni biblioteca al abrir la página.
- Estado: fuente producida y confirmada en GitHub. **Prueba visual real en navegador, Android y aprobación humana: NOT_RUN** hasta obtenerlas.

## Cómo reutilizar el personaje

Copiar `character-kit.mjs` y `character.css` a cualquier aplicación web. El contenedor receptor debe tener tamaño explícito y perspectiva:

```html
<link rel="stylesheet" href="./character.css">
<div id="actor" style="position:relative;width:320px;aspect-ratio:400/640;perspective:900px"></div>
<script type="module">
  import {mountCharacter} from './character-kit.mjs';
  const lia = mountCharacter(document.getElementById('actor'));
  lia.setEmotion('alegre');      // 'curiosa' | 'alegre' | 'sonolienta'
  lia.setAction('saludar');      // 'reposo' | 'saludar' | 'caminar'
  lia.setOrbit(14, -4);          // grados: Y, X
  // lia.setAnimate(false);
  // lia.destroy();
</script>
```

El objeto también expone `manifest`, `parts`, `root`, `getState()`, `setAnimate(bool)` y `destroy()`. Los recortes se describen como paths originales con nombres de articulaciones en `character-kit.mjs`; no son una captura ni un muñeco 3D de cajas. Para cambiar ropa, expresión o silueta, editar SVG de la capa indicada. Las transformaciones y ciclos pueden sustituirse por un controlador de animación externo sin rehacer las piezas.

## Edición visual y comportamiento

El rig representa una figura ilustrada con vestido/abrigo, atlas desplegado, sombrero, pelo, rostro, ojos, boca y accesorios. Cada pieza se mantiene en su propio plano con `translate3d(..., z)`. El paisaje de papel está separado del personaje. La interfaz pública permite girar horizontal y verticalmente mediante arrastre, usar flechas del teclado, restaurar perspectiva, controlar gestos y pausar.

La decisión artística fue **autoría vectorial original** frente a **fotografías licenciadas recortadas**. La segunda ruta no disponía de archivos cuya licencia, iluminación y homogeneidad de pose estuvieran verificadas. Se optó antes de modelar por geometría recortada original para mantener coherencia, permiso de uso y control expresivo. Véase `COMPILED_PLAN.json`.

## Alcance y límites

Es una demostración espacial y **recurso de personaje reutilizable**, no un juego completo ni un modelo volumétrico GLB. La animación de caminar es un ciclo en el lugar (sin locomoción de ruta). La profundidad 2.5D se aprecia al girar, pero los planos son deliberadamente delgados, por eso el giro está limitado a ±31°. No declarar QA visual PASS a partir de una lectura de código.

**Procedencia y derechos:** `LICENSE.md`; ilustración original, sin fotografías ni modelos de terceros. Referencias técnicas: [CSS preserve-3d](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/transform-style) y [SVG feTurbulence](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence).

**Evidencia:** `STAGE_TRACE.json`, 17 etapas abreviadas sin ciclo obligatorio de autocorrección estética. El usuario revisa el arte y las mejoras pertenecen al flujo universal en una ronda posterior, no al brief congelado.
