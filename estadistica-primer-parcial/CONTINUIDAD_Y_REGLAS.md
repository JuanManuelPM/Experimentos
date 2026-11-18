# Estadística UP · Continuidad de la web de estudio

**Sitio público y enlace estable:** https://juanmanuelpm.github.io/Experimentos/estadistica-primer-parcial/

**Código público:** repositorio `JuanManuelPM/Experimentos`, rama **`gh-pages`**, archivo `estadistica-primer-parcial/index.html`.
**Fuente del material académico (privada):** `JuanManuelPM/pruebas`, rama `candidate/estadistica-up-content-pack-20261117`, carpeta `cloud-lab/flow-studio-v3/experiments/semilla-parallel-launchpad/launcher-workspace-v4/prometeo/learning/pilots/academic-statistics-001-20261111/content-pack-v2`.
**Manual editorial de referencia:** `MANUAL_DE_PRODUCCION_DE_MATERIALES_DE_ESTUDIO.md` del proyecto ChatGPT «psicología UP».

## Estado comprobado al publicar esta versión

- Primer parcial completo en la interfaz: cuatro unidades (01–04); 25 conceptos; 36 ejercicios interactivos.
- Teoría, Práctica y Machete son tres *lecturas verticales continuas*, no carruseles ni pantallas paginadas.
- Las tres pestañas forman una barra redondeada compacta, con el número de unidad integrado en la misma fila.
- Navegación general por niveles: **Parciales → Unidades → Unidad (Teoría / Práctica / Machete)**. La selección del segundo parcial es una entrada futura, todavía **sin contenido**; no declararlo listo.
- Deslizamiento horizontal: dentro de la unidad cambia Teoría ↔ Práctica ↔ Machete; desde Teoría hacia el nivel anterior vuelve a Unidades; desde Unidades retrocede a Parciales.
- No pedir respuestas redactadas ni mostrar instrucciones redundantes («deslizá», «acá está la teoría», etc.).
- Práctica con elecciones rápidas V/F, datos seleccionables y opciones numéricas; corrección breve inmediata.
- Por ejercicio, **Pista y Resolución comparten un solo lugar**: abrir una reemplaza la otra.
- Enunciados, ejemplos, fórmulas y tablas deben representarse según su estructura, nunca con contenedores o espacios decorativos.
- Las respuestas se almacenan en localStorage del navegador; conservar la clave al editar para no perder progreso.

## Cómo editar una unidad sin romper la plataforma

1. Leer este documento, el manual editorial y el contenido original correspondiente.
2. Recuperar la versión **actual de `gh-pages`**. No modificar `master` creyendo que eso publica la página.
3. El HTML es autocontenido. Los datos están en las etiquetas JSON `course-data`, `extra-data`, `cheats-data`, `numeric-data`, `multi-data` y `tf-data`.
4. En `course-data`, cada unidad contiene `id`, `title`, `theory` y `practice`; conservar todos los identificadores existentes para no romper correcciones, vínculos ni progreso.
5. Modificar **solo el contenido y los ejercicios de la unidad solicitada**; no reescribir ni eliminar otras unidades ni la navegación compartida salvo autorización explícita.
6. Si se amplían procedimientos o tipos de interacción, agregar un renderizador reutilizable, con verificación independiente de claves y cálculos. Nunca atribuir ejercicios generados a una guía original.
7. Probar la unidad intervenida, **el resto de las unidades**, las tres pestañas, las ayudas excluyentes, las respuestas, el enlace profundo `?unit=01` y la ausencia de desplazamiento horizontal a 360 px.
8. Publicar en **el mismo archivo de `gh-pages`** y verificar que GitHub Pages terminó correctamente y que la URL pública responde 200.

## Criterios de revisión editorial

Teoría: explicar qué es, para qué sirve y ejemplo concreto, sin frases generales de relleno. Elegir párrafos, bullets, comparaciones o fórmulas según la información.

Machete: una hoja vertical por unidad, sin paginación. Notas compactas, jerarquizadas, con procedimientos y fórmulas verificables; no tablas repetitivas «si dice...respondé...».

Práctica: actividades de reconocimiento, elección, clasificación, cálculo y transferencia, sin campos de texto libre; priorizar la habilidad real exigida por el examen.

Verificación: conservar trazabilidad a la fuente y distinguir soluciones verificadas de adaptaciones o ejemplos generados. Los ejercicios que requieren bases/figuras faltantes siguen pendientes de corroboración independiente.

## No hacer

- No usar MagicPath u otros editores ajenos a GitHub para esta página.
- No crear un enlace distinto para cada revisión.
- No modificar la versión anterior de otras páginas públicas ni el repositorio académico privado sin razón.
- No sacrificar información necesaria por hacer el diseño más compacto.
