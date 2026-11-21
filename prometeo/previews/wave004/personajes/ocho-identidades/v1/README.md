# Ocho identidades · Personajes 09 · V1

**Ola:** 004 · **Puesto:** 9 · **Especialidad:** PERSONAJE.
**Método fijado:** 2.3.0, SHA-256 canónico `53bc9e2e4b37c99e92d3494af8dfa4461cd4644b15f980e32497a8428b067b3f`.
**Brief SHA-256:** `c80069d388d625093fc6fdde276dc7b5ee12a6c10807e839d636473e36323031`.

> Quiero ocho personajes secundarios de siluetas, caras, ropa y movimientos diferentes, en una pequeña escena de presentación. No una ciudad ni un simulador completo; demostrar variedad real de autoría.

## Abrir

- [Presentación interactiva](./index.html) (personajes con ocho movimientos independientes).
- [Manifiesto de elenco](./cast.json) (rutas legibles por otras aplicaciones).
- [SVG originales individuales](./assets/) (dibujo editable y reutilizable).

Los ocho son: Iris (florista), Bruno (guardia), Lila (mensajera), Mora (archivista), Elio (músico), Nara (exploradora), Ada (sastre) y Teo (patinador). Cada silueta y vestuario está dibujado específicamente: no son copias recoloreadas de un mismo muñeco.

## Arquitectura, derechos y portabilidad

Esta obra usa **ilustraciones SVG originales en una pequeña escena 2.5D** con animación por CSS 3D transforms. **No es geometría 3D volumétrica**, no incorpora huesos, rigs, skinning, blend shapes ni exportación GLB. Se eligió esta técnica en fase preventiva para asegurar ocho caras y siluetas editables, sin recurrir a modelos genéricos previamente rechazados.

Cero imágenes, texturas, música, código de motor o modelos externos importados. No se presume ninguna licencia de terceros para el arte original. El archivo HTML funciona sin dependencias de red cuando se abre localmente con los SVG incorporados en línea. Cualquier escena web puede consumir un SVG por ruta relativa `assets/01-iris.svg`, etc.; la animación de la presentación vive en `index.html`. Un consumidor que necesite **GLB riggeado** no debe anunciar estos SVG como sustituto.

## Investigación preventiva

Se compararon dos técnicas materialmente diferentes:
1. **Modelos 3D existentes**, como [Kenney Mini Characters](https://kenney.nl/assets/mini-characters) (página CC0) o [Quaternius Ultimate Animated Character Pack](https://quaternius.com/packs/ultimatedanimatedcharacter). Ventaja: mallas reales potencialmente animables. Riesgo para este encargo: identidad visual compartida, caras poco expresivas y reutilización de una familia de personajes que el usuario ya rechazó. **No se descargaron ni importaron esos modelos**.
2. **Autoría original en SVG animado sobre escenario 2.5D.** Ventaja: ocho contornos independientes, expresiones y vestuario controlables, fuentes separadas, carga ligera en Android y coste cero. **Ruta efectivamente producida**.

## Estado de pruebas

- GitHub Contents API devolvió commit para HTML, ocho SVG y `cast.json`.
- Relectura de `index.html` realizada; ocho identidades en datos, controles y compilación sintáctica del script confirmados.
- Render real, capturas de navegador, GPU, Android y aceptación estética humana: **NO VERIFICADOS**.
- GitHub Pages puede tardar en servir la ruta nueva. Existencia confirmada en `gh-pages` **no prueba** disponibilidad externa desde todos los clientes.

Método universal y briefs de los otros puestos sin modificar.
