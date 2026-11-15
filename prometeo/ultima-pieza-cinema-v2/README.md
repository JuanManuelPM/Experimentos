# LA ÚLTIMA PIEZA · Cine PSX V2

Microficción 3D retro de 53 segundos, concebida para reproducirse desde el navegador móvil en relación 9:16.

**Página pública**: https://juanmanuelpm.github.io/Experimentos/prometeo/ultima-pieza-cinema-v2/

## Producción
- Motor: Three.js 0.181, GLTFLoader, WebGL2; creación original de taller, robot y props mediante mallas 3D, no imágenes de personajes superpuestas.
- Actores: Rogue_Hooded y Barbarian de KayKit Adventurers 1.0. GLB con esqueletos, texturas y clips reales; animación base Idle y actuación adicional de cabeza, brazo y postura.
- Escenografía: carpintería, marco de ventana, puerta, piezas mecánicas, herramientas, tuberías, lámpara articulada, lluvia y motas en volumen. Contraste entre luz ámbar y ventana azul.
- Render: sombras PCFSoft sobre mallas, exposición ACES, 360x640 intencional y texturas de atlas a muestreo retro.
- Cine: 17 planos con transición por corte (0–53 s), travelling bajo mesa, cámara macro, planos de reacción, cenital y revelación.
- Sonido: ambiente de lluvia, Foley y sonidos originales tipo videojuego producidos en WebAudio. No voces humanas ni música de terceros. Se inicia con gesto de usuario.
- Diálogo: 4 globos anclados en pantalla al actor correspondiente; texto propio en castellano.
- Reproducción: iniciar/pausar/repetir, scrubber temporal, mute, pantalla móvil sin herramientas de edición.

## Planos (segundos)
0–3.7 ventana/taller; 3.7–6.2 recorrido bajo mesa; 6.2–9.3 plano general; 9.3–12.4 Vera; 12.4–15.2 sobre hombro; 15.2–18.1 ojos del robot; 18.1–20.9 Nico; 20.9–23.3 gesto; 23.3–26.2 cenital; 26.2–29.8 Nico; 29.8–33.2 la última pieza; 33.2–36.4 desplazamiento bajo mesa; 36.4–40.4 tensión; 40.4–44 encendido; 44–47.6 réplica; 47.6–50.4 reacción; 50.4–53 cierre.

## Fuente, versiones y licencias
- Modelos de [Kay Lousberg / KayKit – Character Pack Adventurers](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) en commit inmutable `672074b73ba276876a19e8816ecdc5241817ab47`.
- [Licencia CC0 original](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0/blob/672074b73ba276876a19e8816ecdc5241817ab47/LICENSE.txt), blob `877e44735b5869c10e17a59e3b757905aa390626`; permite proyectos comerciales y uso sin atribución obligatoria.
- Se descargan archivos GLB desde CDN jsDelivr anclado a SHA, con origen GitHub como fallback. El runtime depende de CDN externo. Sin secretos.
- Escenografía y guion: originales de PROMETEO. Sonido: generado al vuelo, sin grabaciones de terceros.

## Estado de verificación independiente (15-11-2026)
- `STATIC_PAGE_HTTP_200`: confirmado en GitHub Pages mediante acceso externo.
- `JS_PARSE_PASS`: comprobación sintáctica por ejecución de analizador JavaScript sin importaciones.
- `GLB_HTTP_200/CORS_PASS`: ambos GLB accesibles desde navegador remoto.
- `GLB_REAL_GEOMETRY`: confirmado al leer header GLB/JSON: 12–13 mallas, skin, 76 clips y atlas por GLB.
- `HEADLESS_WEBGL_UNAVAILABLE`: el navegador de QA externo devuelve null en WebGL1 y WebGL2, por lo que no puede renderizar la película.
- `ANDROID_PHYSICAL_NOT_RUN`, `FULL_PLAYBACK_NOT_VERIFIED`, `ART_APPROVED_NOT_CLAIMED`.
- Reproducción real requiere Chrome/Android con WebGL2 y red para descargar GLB. No es un MP4 exportado.

## Evaluación artística crítica
El primer corte falló por protagonistas geométricos improvisados, falta de acting, movimiento de cámara limitado y voces TTS extrañas. Esta versión cambia materialmente el pipeline hacia actores licenciados con rig y montaje de 17 cámaras. Sigue pendiente evaluar fotogramas reales en dispositivo compatible: staging, sombras, legibilidad de burbujas, actuación y calidad del robot. No convertir las comprobaciones de HTTP y JavaScript en aprobación estética.

## Aislamiento
Esta ruta es nueva; no reemplaza FORJA ni ARCHIVO 03:17 ni cambia catálogo, index global o recursos de terceros.
