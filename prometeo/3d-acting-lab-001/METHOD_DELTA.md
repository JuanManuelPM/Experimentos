# METHOD_DELTA · Actor universal como adaptador, no como prompt

## Hallazgo reutilizable
El NPC civil congelado `character:ps2-civilian@0.1.3` sí declara **24 clips en el GLB** y sockets de rostro/manos. El integrador cinematográfico V1 importaba el modelo y el prop, pero no había calibrado frente, validado paso ni vinculado manos. El error histórico de moonwalk no se arregla intercambiando tomas.

## Cambio material
Nueva coreografía determinista de 480 frames, cámara semántica reutilizada por SHA, dos variantes reales del mismo actor y del mismo prop, selector de clips real, perfil de familia y frente marcado como inferido, flechas de orientación y velocidad, prueba negativa de oposición de vectores, intento CCD sobre huesos originales y apertura de bisagra condicionada por proximidad.

## CALIBRAR y alternativas
Hipótesis A: dirección frontal +Z inferida desde nariz; puede ser incorrecta para la base del GLB. Hipótesis B: clip Walk es root-motion y suma doble desplazamiento; chequeo de tracks agrega alerta. Hipótesis C: CCD no alcanza socket por longitud/posición del brazo y el mecanismo falla de forma visible, sin apertura falsa. Alternativa de mayor calidad: importar una pose Reach compatible o rigificar mediante IK con restricciones y medición de codo/contacto, bajo nueva rama de ownership, no reescribir fuentes.

## Gate a promover al One-Shotting general
Nunca declarar locomoción 3D aprobada sin **dot(frente,velocidad)**, esqueleto y clips reales, apoyo/deriva de pies a escala, evidencia WebGL/Android y ausencia de falsas acciones por encuadre. Tests de matemáticas y GLB parse son capas distintas de captura real de actor.

## Límite
Este registro es propuesta local; no modifica skills, catálogo o rutas globales. No hay comunicación automática con otros chats; se requiere integración explícita del dueño.
