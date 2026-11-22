# ÚLTIMA GUARDIA · VIDEO W002 · 01

**Estado de este encargo: `BLOCKED` para el cortometraje, `PREPRODUCTION COMPLETED` para los materiales de trabajo.**
No hay archivo MP4/WebM de la obra ni audio final; no hay película producida, revisada ni aprobada. Este repositorio contiene guion de rodaje y un kit reutilizable de continuidad **en una rama candidata**, no un resultado audiovisual.

## Premisa y propuesta original
Inés, guardia de turno noche en una clínica, descubre que la fila de una habitación vacía, la 214, fue modificada mientras ella la vigilaba. Oye un golpe desde esa habitación, entra, encuentra una cama intacta y una huella húmeda en el marco. De vuelta al registro, aparece la misma huella. Decide asegurar el cerrojo y pedir ayuda. El segundo golpe llega desde adentro. No aparece texto explicativo en pantalla: la información debe leerse por gestos, utilería y espacio.

**Duración objetivo:** 48 s, 8 planos, 24 fps, 1920×804, color frío con lámpara práctica cálida sobre el registro. **Un solo personaje:** misma intérprete, rodete, uniforme y credencial en toda la película. Sin música; dos golpes de procedencia localizada. El sonido y la actuación deben narrar, no camuflar una sucesión de stills.

## Documentación
- `PREPRODUCTION.deep-spec-v1.json`: preguntas, alternativas, referencias consultadas, decisiones, riesgos y gate.
- `SHOTLIST.json`: 8 planos con lugar de cámara, miradas, tiempos, utilería, foco dramático, Foley y cambios de estado.
- `src/continuity-kit.mjs`: kit reutilizable que detecta inversiones de eje, eyelines inconsistentes, saltos de utilería, huecos, cues fuera del plano y desajuste técnico de un archivo **si existe**.
- `tests/continuity-kit.test.mjs`: pruebas positivas y negativas. No garantizan calidad perceptual.

## QA reproducible
```bash
node --test tests/continuity-kit.test.mjs
node src/continuity-kit.mjs SHOTLIST.json
node src/continuity-kit.mjs SHOTLIST.json --media pelicula-final.mp4
node ../../../deep-spec-v1.mjs PREPRODUCTION.deep-spec-v1.json
```
El gate DEEP-SPEC esperado es `BLOCKED` (el spike audiovisual fue rechazado). Esto no es un error del validador; el comando termina con código 3. Los tests de Node incluidos todavía no fueron ejecutados en un checkout real en esta sesión.

## Boceto sonoro reproducible (no es mezcla final)
`python3 src/foley_boceto.py --output ultima_guardia_foley_boceto.wav` (requiere NumPy y SciPy). Se renderizó un WAV estéreo original de 48 s a 32 kHz y ffprobe confirmó formato y duración. El binario está adjunto al chat, **no publicado en esta rama**. El diseño tiene dos golpes y respiración, pero su sincronía con actuación filmada es NOT_RUN.

## Bloqueo observado
Dos llamadas `estimate_only` al generador audiovisual conectado, con modelos Kling-3-Pro y Seedance-v2.5, fallaron sin gasto ni generación: la cuenta exige un plan pago. FFmpeg disponible para el montaje, pero ningún video de actuación autorizado ha sido creado o aportado. No se utilizaron fotos, clips ajenos ni suplantación de material. **No llamar `DELIVERED` a estos documentos.** Para terminar la película hacen falta rodaje con intérprete y sonido con permiso, o generación cinematográfica habilitada más export/QA cuadro por cuadro.

## Benchmarks observados, sin reutilización de imagen ni audio
1. Alfred Hitchcock, *My Own Methods*, BFI (ensayo textual, reacción y detalle): https://www.bfi.org.uk/sight-and-sound/features/alfred-hitchcock-my-own-methods
2. David F. Sandberg, *Lights Out* (ficha del autor, **video NO visto**): https://vimeo.com/82920243
3. Rosana Sullivan, proceso de dirección de *Kitbull* (texto de museo, **corto NO visto**): https://www.waltdisney.org/education/talks/behind-scenes-disney-and-pixars-sparkshorts-film-kitbull-2019-director-rosana
4. Tom Barrance, eje, eyeline y continuidad: https://learnaboutfilm.com/film-language/sequence/180-degree-rule/

**Aspiración → decisión → prueba → brecha:** tensión por reacción → microgestos definidos en S03/S08 → prueba perceptual NOT_RUN → falta video; geografía fija → semiplano sur → lint planificado → falta comprobar fotogramas; sonido fuera de campo → cues A03/A07 → escucha NOT_RUN → falta mezcla.

**Propiedad:** `JuanManuelPM/Experimentos` · `candidate/prometeo-video-w002-01-20261122` · `video-w002-20261122-01`. LAUNCH origen SHA `d7eebea6d36fc6e5aa3b72cba4e35dd149dc552d`. No altera otras tareas ni w001.
