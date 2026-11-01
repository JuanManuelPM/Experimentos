# Universal UI 0.1.0 · Estado real (2026-11-01)

**Rama:** `universal-ui/v0`  
**Producción:** intacta; no instalar esta candidata en paralelo con ChatGPT Minimal Live.

## Hecho

- **Corrección real del observador en rama candidata:** se evitó el bucle de reaplicaciones causadas por la hoja `#uui-style` y ahora se detectan cambios de selectores por atributos sin añadir nodos (ver `OBSERVER_REPAIR_2026-11-01.md`).

- 40 archivos de fuente importados íntegramente desde `universal-ui-v0.1.0.zip` a GitHub en esta rama.
- Núcleo común, sistema de temas, perfiles y verificación; adaptadores ChatGPT, WhatsApp Web y Wikipedia.
- Interfaz con un único botón/popup de Firefox; documentación y código de demo.
- PASS: sintaxis de JS y `npm run build:demo`.
- PASS en Chromium **sobre fixtures sintéticos**: temas, visibilidad Minimal y restauración para las tres aplicaciones; véase `BROWSER_SMOKE_2026-11-01.md`.
- Suite declarada en ZIP: 32 pruebas. **No fueron ejecutadas completamente por este chat**, pues `jsdom` falta en el entorno; sin inflar el porcentaje.
- Los selectores de páginas reales **siguen pendientes de calibración**; `calibratedAt: null`.

## Siguiente acción comprobable

1. `npm ci && npm test` en un entorno con acceso a registro npm.
2. Firefox real: test de extensión temporal y adaptador ChatGPT. Registrar captura, URL, fecha, selectores encontrados, antes/después, accesibilidad de controles esenciales, reversión y resultados PASS/FAIL.
3. Repetir en WhatsApp Web, verificar privacidad.
4. Solo después, preparar una distribución sencilla y migrar el estilo viejo.

## Reglas

No modificar `master` ni `userstyles/`; no instalar en producción ni ocultar resultados no verificados. No leer conversaciones ni mensajes. Mantener configuración global separada de aplicación y excepciones. Registrar cualquier decisión nueva a partir de D16.

Ver `START_HERE.md`, `docs/DIAGNOSIS.md`, `docs/ARCHITECTURE.md` y `docs/DECISIONS.md`.
