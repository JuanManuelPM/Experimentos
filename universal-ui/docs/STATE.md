# Estado · para continuar en otra conversación

Actualizado: 2026-11-01 · rama `universal-ui/v0` · versión 0.1.0

## Hecho

- Núcleo universal, sistema visual, contrato de adaptadores, motor de verificación (`extension/core/`).
- Adaptadores ChatGPT, WhatsApp Web y Wikipedia (ejemplo de tercera app). **Ninguno calibrado en vivo.**
- Panel con Aplicaciones · Personalización · Perfiles, botón de barra y `Alt+Shift+U`.
- 32 pruebas en verde. Demo funcional en `demo/index.html`.
- Diseño en un canvas de Claude con el sistema Riel; copia de las fuentes en `design/`.
- `userstyles/` sin modificar.

## Siguiente, en orden

1. **Calibrar ChatGPT** en Firefox real: cargar la extensión temporal, abrir el panel, corregir selectores *No encontrado* o *alternativo* en `adapters/chatgpt.js`, fijar `calibratedAt`. Empezar por `brand`, `manage` y `feedback`.
2. **Calibrar WhatsApp Web** igual (`adapters/whatsapp.js`); sobre todo el puente de tema (nombres de variables) y `nav`.
3. Probar en Firefox: permiso por sitio, inyección inmediata tras conceder, atajo.
4. Migrar la configuración de v1.3.0 a un perfil (DIAGNOSIS.md, *Migración propuesta*).
5. Valorar: puentes de tema para modo claro; observar también cambios de atributo `style` en objetivos de diseño.

## Cómo retomar

```bash
git checkout universal-ui/v0
cd universal-ui && npm install && npm test
```

Leer en este orden: `docs/DIAGNOSIS.md` → `docs/ARCHITECTURE.md` → `docs/DECISIONS.md`. Las decisiones D1–D15 están cerradas salvo que la calibración en vivo demuestre lo contrario; registrar cualquier cambio como D16+.

## Reglas del proyecto

- No modificar `userstyles/` ni publicar en `master` hasta tener paridad calibrada.
- Ningún control se muestra como funcional sin verificación.
- No leer ni transmitir conversaciones, mensajes ni credenciales; no automatizar envíos.
- Una app nueva no puede requerir cambios en `core/`.
