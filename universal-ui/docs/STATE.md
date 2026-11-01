# Universal UI 0.1.0 · Estado real (2026-11-01)

**Rama:** `universal-ui/v0`  
**Producción:** intacta; no instalar esta candidata en paralelo con ChatGPT Minimal Live.

## Hecho

- **CI en GitHub Actions:** **38/38 PASS, 0 fallas** en ejecución `41312116187`; `npm ci`, `npm test`, compilación de demo y revisión de sintaxis JS, todo exitoso. Incluye 4 pruebas de permiso por sitio y 2 de observador.
- **Permisos corregidos en candidata:** ahora son `optional_host_permissions` por sitio, sin scripts declarativos. La autorización manual activa registra scripts persistentes y los inyecta en la pestaña abierta. Pendiente prueba real en Firefox.

- **Corrección real del observador en rama candidata:** se evitó el bucle de reaplicaciones causadas por la hoja `#uui-style` y ahora se detectan cambios de selectores por atributos sin añadir nodos (ver `OBSERVER_REPAIR_2026-11-01.md`).

- 40 archivos de fuente importados íntegramente desde `universal-ui-v0.1.0.zip` a GitHub en esta rama.
- Núcleo común, sistema de temas, perfiles y verificación; adaptadores ChatGPT, WhatsApp Web y Wikipedia.
- Interfaz con un único botón/popup de Firefox; documentación y código de demo.
- PASS: sintaxis de JS y `npm run build:demo`.
- PASS en Chromium **sobre fixtures sintéticos**: temas, visibilidad Minimal y restauración para las tres aplicaciones; véase `BROWSER_SMOKE_2026-11-01.md`.
- Pruebas: **38 casos escritos** (32 originales + 2 observador + 4 permisos). Los 38 pasaron en CI (`41312116187`, 38/38). Este contenedor sigue sin poder instalar `jsdom` por DNS a npm; no es bloqueo porque el runner sí pudo.
- Los selectores de páginas reales **siguen pendientes de calibración**; `calibratedAt: null`.

## Siguiente acción comprobable

1. Comprobación real de permisos y popup en Firefox; la suite de 38 casos ya pasó en GitHub Actions.
2. Firefox real: test de extensión temporal y adaptador ChatGPT. Registrar captura, URL, fecha, selectores encontrados, antes/después, accesibilidad de controles esenciales, reversión y resultados PASS/FAIL.
3. Repetir en WhatsApp Web, verificar privacidad.
4. Solo después, preparar una distribución sencilla y migrar el estilo viejo.

## Reglas

No modificar `master` ni `userstyles/`; no instalar en producción ni ocultar resultados no verificados. No leer conversaciones ni mensajes. Mantener configuración global separada de aplicación y excepciones. Registrar cualquier decisión nueva a partir de D16.

Ver `START_HERE.md`, `docs/DIAGNOSIS.md`, `docs/ARCHITECTURE.md` y `docs/DECISIONS.md`.
