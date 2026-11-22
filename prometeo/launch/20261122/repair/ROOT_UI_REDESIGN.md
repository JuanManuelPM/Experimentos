# PROMETEO · CALIBRAR ROOT · REHACER UI UNIVERSAL Y BIBLIOTECA DE OBRAS

## Identidad y objetivo humano

**Un solo chat.** Implementar una experiencia ROOT final, extremadamente minimalista, móvil primero, organizada por tandas y **orden de publicación real**. No crear una página nueva ni cambiar el enlace estable de acceso: `https://juanmanuelpm.github.io/Experimentos/prometeo/root/`.

**No es un experimento de diseño ni una explicación de diseño:** reparar código y probar un artefacto existente, con screenshots de navegador. No tocar obras de los estudios ni relanzar las cincuenta tareas. Usar una rama candidata y, si cumple pruebas de navegador, integrar el cambio de UI pública con commit y rollback comprobable; no modificar el método creativo de los estudios por esta tarea.

### Contexto de captura humana, 22/11/2026, revisar sin exigir nuevo audio

- Captura Android de «Obras»: grandes tarjetas negras casi vacías, mucha separación, solo títulos en blanco y un identificador W001/XX diminuto; la lista empieza por trabajos W001 antiguos cuando ya hay W002. No hay miniatura/preview y requiere demasiado scroll.
- Captura de una obra 3D: controles, detalles y copy se superponen en móvil. El render contiene personaje poco convincente, pero esa obra se audita en 3D, **no se repara desde ROOT UI**.
- Captura de un interior 3D: una pared vacía ocupa casi toda la vista. Es defecto artístico/cámara de la obra; en ROOT solo se requiere no esconderlo con miniaturas falsas.

### Fuentes obligatorias

Recuperar GitHub `JuanManuelPM/Experimentos@gh-pages`, en particular:
- `prometeo/root/index.html`, `portal-v1.js`, `studio-unified.css`, `shared/v1/{shell.js,batch.js,batch.css,response.js,actions.js}`.
- `prometeo/root/{BATCHES.json,ROOM_MESSAGES.json,WORKSPACES.json}` (el último solo si existe); recuperar formatos reales, no asumir endpoints.
- `prometeo/launch/{QUALITY_BAR.md,DEEP_SPEC.md}`; `JuanManuelPM/pruebas@prometeo/control:sistemas/metodo/CONTRATO_COMPARTIDO.md`.
- Las cinco tandas recientes: `3d-w6-20261122`, `web-w002-20261122`, `music-w002-20261122`, `video-w002-20261122`, `images-w002-20261122`, preservando W5/W001 históricas.

## Experiencia que debe quedar implementada

1. **Portada de obras útil:** navegar entre todos los estudios o filtrar uno, ver el contenido real inmediatamente, sin pantallas intermedias redundantes, títulos explicativos grandes ni tarjetas vacías gigantes. Conservar acceso al estudio/editor y a ROOT, pero quitar duplicidad de menús y navegación confusa. Menú universal compartido, no cinco UIs distintas.
2. **Tandas plegables:** un bloque compacto por tanda, encabezado con estudio, código de versión, fecha de entrega más reciente verificable y contador `N/10 entregas`; abrir/cerrar, recordar expansión preferida sin impedir el funcionamiento sin almacenamiento. La **tanda más reciente abierta por defecto** y las viejas plegadas. Si un proyecto tiene varias tandas, mostrar siempre lo nuevo arriba. Una tanda no desaparece cuando hay entregas faltantes.
3. **Cronología verdadera:** ordenar obras por `publishedAt` válido descendente, con fallback honesto (commit verificado o «sin fecha registrada»), desempate estable por batchId+N. No ordenar por número, hora inventada, orden de lectura de JSON o W001 primero. Que el usuario pueda usar `Recientes` sin elegir estudio, además del agrupamiento por tandas.
4. **Representación visual por medio:** cada obra visible como miniatura/preview fiable: imagen final real; screenshot real de Web o WebGL; fotograma real de video; carátula existente o waveform real de audio. Obtener thumbnails desde URL pública verificada, artefactos publicables y permitidos, o producirlos con Playwright/headless browser/ffmpeg en un proceso de captura verificable. **Nunca fabricar capturas**, y no dibujar una falsa maqueta para disimular ausencia. Si no hay preview, usar un **placeholder universal neutro**, por ejemplo cuadrícula sutil, con icono de medio e identificador; no un bloque gigante sin contenido. Estado explícito de recurso no accesible.
5. **Diseño y comportamiento:** grilla adaptable de miniaturas con relación constante y alto de tarjeta moderado; título corto legible, estudio/tanda, fecha; una sola acción evidente para abrir. Tamaños táctiles adecuados, pocos colores, contraste legible, máximo aprovechamiento del ancho de Android. No forzar 10 tarjetas en una columna de 250px de alto. Evitar hover obligatorio, overlays tapando contenido, scroll horizontal, menús dobles y párrafos explicativos dentro del producto.
6. **Obras accesibles:** al abrir, dar prioridad máxima a la pieza real (render/web/audio/video/raster) y el mínimo UI universal. Un botón de volver claro, contexto compacto y detalles/recibos como panel secundario; respetar reproducir/pausar, gesto táctil, foco y navegación por teclado cuando corresponda.
7. **Enlace fijo + frescura:** conservar `https://juanmanuelpm.github.io/Experimentos/prometeo/root/` sin hashes necesarios para entrada. Cargar índices `BATCHES.json` y `ROOM_MESSAGES.json` en modo actualizado, detectar cambios sin esperar a que el usuario borre caché; resolver módulos cacheados mediante versionado de URL o política de caché apropiada. Si existe service worker, auditar y corregir su ciclo de actualización; si no existe, **no inventar** que hay uno. Mantener deep-links internos estables y compatibilidad con acceso directo de Chrome en Android.
8. **Datos y concurrencia:** no eliminar historias, messageIds ni obras. Unir retornos por `(batchId,taskNumber)` y no duplicar por tener mensaje y ficha. Faltantes deben ser visibles y etiquetados, no presentar 10/10 solo porque existan 10 briefs. Evitar relaciones engañosas entre `PREPARED`, `DELIVERED`, `VERIFIED`, `HUMAN_APPROVED`.

## Implementación y aceptación

- **No quedarse en un informe/plan.** Producir código de ROOT en ruta propietaria, integrando componentes y tokens compartidos; no cinco forks. Priorizar el primer corte vertical y terminar la experiencia responsive completa en el mismo WORK.
- **Capturas reales obligatorias si hay ejecución de navegador:** instrumentar o aprovechar Playwright/Chromium reproducible, si es necesario mediante GitHub Actions manual/CI, sacar screenshots 360x780, 390x844, 768x1024 y desktop 1440. Capturar portada/recientes, tandas plegadas/abiertas, detalle Web, detalle 3D, audio, video e imagen, y un estado sin miniatura. Guardar PNG auténticos accesibles en la rama de evidencia con hash y ruta; **mostrar miniaturas y enlazar la evidencia en el recibo**. Si no hay navegador, registrar `NOT_RUN`; no declarar validada la UI. Probar scroll, toque, plegado, navegación y reload.
- Comprobar 5 tandas nuevas con 10 entradas numeradas cada una, todas las entregas que estén efectivamente registradas al momento, nuevas sobre antiguas, ausencia de overflow, tamaño táctil, accesibilidad y pantalla vacía. Medir antes/después en captura real y evitar aprobaciones estéticas automáticas.
- Registrar causas y gates preventivos de UX y publicación de thumbnails para que futuras tandas hereden una miniatura/preview verificable desde el recibo (no inventar referencias). Distinguir problemas de UI de los defectos de modelado y mezcla de las obras.
- Trabajar en rama candidata exclusiva, integrando a gh-pages solo cuando las pruebas disponibles lo sustenten y la operación sea reversible/autorizada. Hacer readback del commit publicado, comprobar el enlace fijo y documentar limitaciones reales. No publicar secretos de `pruebas`.
- Entrega humana mínima: **URL fija ROOT**, 2–4 enlaces a screenshots reales, commit, tres mejoras comprobadas, fallos `NOT_RUN`, estado público preciso y propuesta de gate universal. Sin nuevo prompt para cada estudio.

**Estado de esta instrucción:** preparada para pegarse en un chat nuevo. Su existencia no implementa cambios de UI, no obtiene capturas ni inicia tareas.
