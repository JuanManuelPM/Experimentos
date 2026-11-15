# PROMETEO / NO HAY VUELTA
Nueva escena cinematográfica PSX · 38 s · ratio 9:16 · Three.js r181.
**Página pública:** https://juanmanuelpm.github.io/Experimentos/prometeo/psx-night-drive/

## Objetivo artístico
Rechazar el método V1 basado en piezas geométricas acumuladas para personajes. Utilizar **mallas 3D verdaderas de artistas, texturas/UV y huesos ya diseñados**; enfocar acción y cámara en un auto que atraviesa una ciudad nocturna. No inventar facciones con primitivos. El resultado es cine web en tiempo real, no MP4.

## Mallas y fuentes
- Vehículo `assets/sedan_blue.glb`, `road.glb`, `fence.glb`: **PSX Vehicles Free** de heyheythere, licencia **CC BY 4.0**. Fuente: https://heyheythere.itch.io/psx-vehicles-free . Pack descargado realmente desde su botón y verificado `LICENSE.txt`. Una copia modificada/redistribuida se autoriza con atribución.
- Personaje `gangnam-character.glb` se carga **externamente** desde `programasweights/avatar` commit `a488723e3a93d73d5c562d88f8a85353c37bc721`, fuente https://github.com/programasweights/avatar/blob/main/ASSETS.md . Costume, hair, face y rig continuos originales según declaración del autor, MIT; base Quaternius CC0. Modelo conocido como figura ilustrativa inspirada en PSY, **no afiliada**. Se utiliza como actor estilizado sin narrar hechos sobre una persona real. Si falla el archivo, se usa `character.glb` del mismo repositorio como fallback y se señala `actorFallback`. Este asset tiene **malla con topología propia, no retrato pegado a un plano**.
- Edificios, calle, lluvia, signage, lighting, dashboard, travelling y guion: autoría original PROMETEO. Pequeñas formas rectangulares de arquitectura y volante no equivalen a un personaje antropomorfo armado con primitivas.
- El film no utiliza fotografías de personas ni voz TTS artificial: el problema de la foto-proyectada se mantiene como línea de investigación independiente y el prototipo anterior está intacto.

## Tiempo y dirección
0–4.5 auto, carretera y luz de calle (exterior);
4.5–8.2 parabrisas, rostro;
8.2–12.4 primer plano del conductor;
12.4–16.1 POV de carretera y lluvia;
16.1–20 lateral exterior y radio;
20–24.4 cartel recurrente;
24.4–29 silencio en rostro;
29–33.4 POV con el remate;
33.4–38 retirada exterior.
Cámaras por `shots[]` y muestreo absoluto `setTime(t)` para evitar la acumulación de `bone.rotation +=` del corto anterior. Se puede pausar, scrub y reproducir. Sonido original de lluvia/rumor de motor en WebAudio (sin músicas ni voces). No viewer orbital.

## Pruebas / limitación
- Verificados en fuente por consulta GitHub: archivos GLB procedentes de paquetes CC BY; sedan con 11 mallas y 9 clips (incluido drive); la serie PSX Character Creator Free separada con personaje `student` y 10 clips, evaluada como alternativa con descarga real, no incluida en este corto por limitaciones de transferencia posterior.
- Código JS procesado con analizador sintáctico (sin import statements).
- **NOT_RUN:** prueba real end-to-end WebGL del film, FPS en Android, inspección de sus 9 planos como fotogramas, carga externa del GLB de humano desde CDN, audio real hasta final, artistic acceptance. No autoatribuir ART_APPROVED ni afirmar que MP4 exista.
- Un navegador Chromium remoto con WebGL2 y/o dispositivo Android debe verificar la película cuando los recursos estén disponibles. Se rehúsa sustituir el actor por figuras improvisadas si falla su GLB.
- Cambios aislados: no tocamos FORJA, ARCHIVO, la película anterior ni catálogo global.

Este README identifica fuentes y límites para que otra IA diagnostique sin repetir la mezcla de "web carga" con "arte aprobado".