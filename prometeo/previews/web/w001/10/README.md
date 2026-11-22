# ATLAS · comparador de versiones de una obra

**WORK:** `web-w001-20261122-10` · `room:web` · tanda `web-w001-20261122`

Aplicación web estática editable, sin dependencias ni datos personales, para comparar cuatro etapas originales de un afiche ficticio: **Umbral**. La dirección visual usa papel cálido, tipografía editorial, una paleta acotada y composiciones SVG originales declaradas en la fuente.

## Funciones reales
- Vista **En paralelo**: dos obras distintas con selectores A y B independientes.
- Vista **Cortina**: composiciones superpuestas con control horizontal táctil, mouse y teclado (control `range`).
- Intercambiar A/B, estados `aria-pressed`, notas de diferencias, nombres de etapas y mensajes de estado.
- Enlace persistente en query string: `?a=v1&b=v4&mode=wipe&split=50`. Se preservan `split=0` y `split=100`.
- Cuatro variantes renderizadas por SVG inline desde datos locales. Sin APIs, tracking, librerías externas ni recursos sujetos a licencias de terceros.
- Reflow CSS de una columna para celulares, estilos de foco y alternativa a movimiento reducido.

## Prueba reproducible
Desde este directorio con Node.js 18+:
```sh
node SMOKE_TEST.cjs
```
El script ejecuta el JS de la obra en un DOM simulado, prueba selección, intercambio, modos, cortina, sincronización de URL y los límites 0 % y 100 %. **No sustituye QA en un navegador real**. Ver `RECEIPT.md` para evidencia y pendientes.

## Reutilización potencial en ROOT
El motor de comparación usa un `versions` array local: `{id,number,title,label,note,year,bg,ink,muted,accent,shape}`. La función `poster(version)` produce el SVG, y el estado es `{a,b,mode,split}`. Puede extraerse un módulo público que acepte obras/medios autorizados en lugar de este dataset y mantenga selector A/B, modo y serialización de URL. **No está integrado en ROOT y no se declara componente canónico**.

## Trazabilidad y publicación
- Owner de fuente: [pruebas · rama candidata](https://github.com/JuanManuelPM/pruebas/tree/candidate/prometeo-web-w001-10-20261122/prometeo/previews/web/w001/10).
- Publicación estática aislada: https://juanmanuelpm.github.io/Experimentos/prometeo/previews/web/w001/10/
- Fuente publicada: https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/previews/web/w001/10/index.html
- Flujo de referencia V2 (`SPEC_ONLY`): `JuanManuelPM/pruebas@candidate/prometeo-web-factory-engine-v2-20261117`, `workflows/WEB_FACTORY_V2/FLOW.json`, blob `02f7b6161b50cd5bc6b342b84c969aaa36bac90a`.
- Punto de entrada fuente: blob `6e0784d1edbd9e69c54ff6c422b8f16d025ac44b`. Esta obra aplica criterios de producción, no afirma haber ejecutado todas las etapas formales del motor pendiente.
