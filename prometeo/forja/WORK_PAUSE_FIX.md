# FORJA · corrección candidata de pausa y cámaras

**Origen:** FORJA C102, commit `2127bb438eaa652ab53fb59dea60455ed8bf1ba0`.  
**Hallazgo independiente:** C114, `JuanManuelPM/pruebas:work/claims/C114:sistemas/work/receipts/C114/RESULT.json`.  
**Trabajo reservado:** `P-studio-3d-fix-forja-pause-transition`.

## Alcance
- Al pausar, el movimiento WASD y botones táctiles se detiene. Los controles pendientes se descartan.
- No se modifica orientación por arrastre durante la pausa.
- Al elegir ORBIT, FOLLOW, FIRST_PERSON o SHOT, se reanuda el modo nuevo y la interfaz refleja `aria-pressed=false` coherentemente.
- No se modifican assets, serialización ni editor principal.

## Reproducir el test
Desde `prometeo/forja/`:
```bash
node pause-regression.test.mjs
```

**Evidencia ejecutada:** 22 aserciones **PASS en V8** sobre `forge-cinema.mjs` exacto con `CameraRig` auténtico, DOM y cámara simulados. El control negativo con el código anterior falla específicamente en `paused WASD does not move`. **Node desde archivo**: NOT_RUN. **WebGL/WebGL2**: NOT_RUN; **Android físico**: NOT_RUN.

## Puerta de integración
Candidato de corrección aislado. No fusionar en producto sin rerun Node, navegador GPU y revisión independiente del comportamiento interactivo.
