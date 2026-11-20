# PROMETEO · Flujo 3D 1.2.0 · PREVENCIÓN EN ORIGEN

**Versión operativa:** 1.2.0 candidata, fijada por `FLOW_INDEX.json`.
**Propiedad:** Estudio 3D. **No modifica** las 17 etapas previas, los diez gates D29-D38, otras fábricas ni obras históricas.
**Filosofía:** construir calidad al elegir la técnica, no intentar remediar un producto entero al final. Inspirado en *poka-yoke* / *jidoka* (ASQ, Toyota), con contratos falsables y control temprano antes de multiplicar.
**Implementación:** `preflight.mjs` expone `validatePreflightPlan(plan)` y `validateFirstArticle(plan)`. Es código ejecutable, no sólo una instrucción en el prompt.

## Contrato mínimo por obra: tres decisiones, no veinticinco informes

1. **Antes de escribir geometría** identificar los elementos visualmente importantes y las cámaras desde las que se juzgarán. Definir un resultado deseado observABLE y un contraejemplo que cumpliría la letra pero fracasaría artísticamente. Ejemplo: «nueve pasajeros» NO equivale a «nueve conjuntos de esferas». Guardar una sola `PREVENTIVE_BLUEPRINT.json`.
2. **Antes de adquirir o fabricar** elegir entre modelo legal texturado con origen y licencia; malla propia hecha con herramientas/UV; cutout/2.5D para ángulos limitados; geometría paramétrica para ingeniería, mecanismos y partes que requieren despiece. Comparar dos opciones al menos para cada objeto HERO/CLOSEUP. No fabricar un pseudo-asset con primitivas porque el asset no se encontró.
3. **Antes de multiplicar** fabricar UNA muestra crítica: un pasajero sentado, un asiento, una vista de cámara; o una carcasa que cubra el volumen barrido de las aspas; o un plano que muestre algo distinto de negro. Sin render real disponible: limitarse a fuente/canario SOURCE_ONLY, declarar NOT_RUN, NO multiplicar una estrategia visual sin pruebas.

**Prohibición específica:** Humanos/NPC/animales protagonistas no pueden presentarse como arte final si están hechos con caras/cuerpos de `BoxGeometry`, `SphereGeometry`, `CylinderGeometry`, `CapsuleGeometry` o montajes equivalentes sin malla/textura/identidad coherente. Las primitivas SÍ están permitidas para COLLISION, BLOCKOUT y objetos técnicos donde son adecuadas. Una silla HERO requiere asset, malla modelada/UV o solución visual deliberada que pase prueba de plano, no geometría funcional presentada como resultado artístico.

**No confundir** «no hardcodear» con «no usar coordenadas concretas». La escena configura instancias, luces y tiempos concretos; el módulo reutilizable toma datos, no nombres/posiciones/colores del proyecto.

## Nodos preventivos incorporados al grafo

### PF0
Clasificar todas las entidades con visibilidad HERO/CLOSEUP/SUPPORT/BACKGROUND/BLOCKING/TECHNICAL. El tamaño en pantalla y la naturaleza del objeto determinan la técnica apropiada.

### PF1
Escribir contratos positivos por entidad: `intent`, `closeupAcceptance`, `rejectionRisk`, `firstArticleShot`. No basta «no usar esferas»; decir cómo SÍ debe verse, de qué distancia y con qué prueba.

### PF2
Justificar dos alternativas por cada elemento protagonista. `LICENSED_TEXTURED_ASSET`, `EDITABLE_MODELED_ASSET`, `TEXTURED_IMPOSTOR` o `MECHANICAL_PARAMETRIC`. `BLOCKOUT_ONLY` y `RUNTIME_PRIMITIVE_COMPOSITE` no son soluciones finales para héroes. Las imágenes 2.5D deben declarar los ángulos soportados.

### PF3
Declarar la imagen temprana que se necesita, plataforma, mínimo visible; para cámara MOVING, beats temporales y `CONTINUITY_OR_INTENTIONAL_CUT`. Para mecanismos paramétricos, ensamblaje, ejes, zonas de encaje y límites barridos antes de construir el resto.

### D39
`validatePreflightPlan(PREVENTIVE_BLUEPRINT.json)`: si falla, corregir el plan antes de código. PASS habilita adquisición, NO significa arte aprobado.

### PP0
Comprobar que las alternativas aprobadas tienen bytes/fontes y derechos adecuados y que se usarán realmente, no sustitutos de color/forma arbitrarios.

### D40
La técnica elegida debe ser apta para la cámara y papel visual. Si no lo es, volver al catálogo/autoría, no avanzar con un falso positivo estructural.

### PP1
Una muestra (first article), con objeto y cámara representativos, antes de clonar. Verificar caso más exigente, no sólo vista lejana que disimula defectos.

### D41
`validateFirstArticle`: exige hash real del asset, licencia, prueba de render y aceptación de la muestra. FAIL conduce a cambiar de técnica, no a corregir muchos defectos al final. NOT_RUN conduce a prototipo reducido SOURCE_ONLY.

### PP2
Cambio temprano de estrategia tras muestra fallida.

### PP3
Preservar fuente y resultado acotado cuando no hay navegador/GPU. Nunca simular captura ni aprobar arte. Bloquea la fabricación masiva NO verificada pero no impide entregar una base real.

### CAM0
La cámara MOVING no es una lista de posiciones inmóviles: los beats tienen velocidades, transiciones y una intención narrativa. El corte explícito es válido; la pausa entre cada desplazamiento, sin razón, no.

### D42
Comprobar timeline temporal sin gaps/overlaps ni frenadas automáticas. HOLD requiere `motivation`. Si es una escena estática, declarar N/A razonado en el recibo; no obligar travelling artificial.

## Decisiones por especialidad: un flujo raíz, subflujos independientes

Los subflujos declarados dentro de `flow.json.subflows` son: representación/adquisición, personajes, props/entornos, materiales/FX, actuación, cámaras, presentación mecánica y publicación/aprendizaje. Cada uno es contrato funcional con dueño. **No son ocho nuevos motores, ni permisos para editar fuentes de otros.**
Los mecanismos técnicos como el ventilador no deben adoptar la prohibición literal de primitivas: aquí lo correcto puede ser una malla paramétrica original, **siempre con prueba de encaje**. Los NPCs de Transporte necesitan una técnica visual distinta.

## Reconstrucción de errores: antes, durante, después

- **TRANSPORTE 001**: problema primario anterior a QA, selección de técnica inadecuada. El plan habría fallado en D39/D40 y el primer humano junto al asiento en D41, sin construir nueve.
- **CÁMARA TRANSPORTE**: no basta lista de siete planos; D42 bloquea frenadas no deliberadas. Lo que un programa puede verificar es continuidad de beats, no automáticamente buen cine.
- **RESPAWN NEGRO**: D41 exige como mínimo una imagen de cámara real antes de fabricar el vuelo de 21,5 s; el usuario reportó negro, no hay causa definitiva demostrada.
- **VENTILADOR**: conservar la decisión correcta (geometría propia controlada por partes) y añadir chequeo de volumen barrido/carcasa, no prohibir paramétricos. La reclamación de carcasa insuficiente es juicio visual humano, no diagnóstico de causa verificado.

## Recursos y madurez

Pedir `sourceGitBlob` y licencia NO certifica derechos por sí solo; comprobar derechos de cada proveedor y guardar evidencia. `renderRef` NO certifica píxeles si es inventado; conservar artefacto real y revisar. Tests automatizados previenen clases de fallos, no evalúan gusto o calidad estética por sí solos.

- La ejecución `FIRST_ARTICLE` puede terminar como candidato técnico con D41 NOT_RUN; **no escalar a multitudes ni final**.
- Una ejecución `SCALED` requiere PASS de D39-D41 (y D42 si cámara MOVING).
- El render final mantiene D29-D38 para asegurar derechos, técnica, interacción, móvil y roundtrip; esos gates son protección residual, no el lugar donde se decide el método artístico.
- Reutilizar módulos de dueño + `version/gitBlob`, antes de ampliar infraestructura. `assembly-presenter` de ventilador y `world-to-scene-rails` de respawn son técnicamente candidatos/consumibles; no atribuir aprobación visual que no tienen.

## Versiones y rondas de 10 proyectos

Cada proyecto mantiene ID estable; las versiones V1,V2,V3... son **artefactos inmutables separados** aunque una versión esté rechazada. Una ronda fija `flowVersionUsed` + `flowSha256` al inicio. Nunca atribuir 1.2.0 a las primeras escenas (usaron 1.1.0). La biblioteca muestra sólo última obra por proyecto con selector discreto de versiones.
Las capacidades tienen su propia versión. La mejora del resultado se evalúa contra el anterior y con pruebas de transferencia a otra escena. Aprender no equivale a reescribir el mismo tren diez veces.

## Referencias conceptuales

- ASQ *Mistake Proofing*: https://asq.org/quality-resources/mistake-proofing
- Toyota *Production System / Jidoka*: https://global.toyota/en/company/vision-and-philosophy/production-system/
- Contrato de propiedad 3D, privado: `PROMETEO/spaces/studio-3d/imports/pruebas/factories/specialty-v1/v1/shared/OWNERSHIP_AND_INTERFACES.md`.

**Limitaciones declaradas:** el gate ejecuta validaciones declarativas y compara pruebas registradas; no inspecciona el contenido semántico de cada píxel ni prueba solo la calidad artística. La efectividad del flujo 1.2.0 con diez producciones todavía no ha sido medida.
