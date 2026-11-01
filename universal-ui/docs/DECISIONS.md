# Registro de decisiones

Formato: decisión · motivo · alternativa descartada.

## D1 · Extensión de Firefox (MV3) con botón de barra, no userscript
Un solo botón fuera de la página, atajo `Alt+Shift+U` (`commands._execute_action`), permisos por sitio nativos, almacenamiento compartido entre pestañas. *Descartado*: seguir con userscript + botón flotante (pide un botón por página y no tiene permisos por sitio).

## D2 · Adaptadores declarativos, motor único
Los adaptadores describen; `engine.js` aplica. Añadir una app no añade lógica. Un test comprueba que `core/` no menciona ninguna app. *Descartado*: un módulo con funciones `apply()` por app (duplicaría verificación y restauración en cada una).

## D3 · El estado lo decide el DOM
Cada control se marca *Aplicado* solo tras leer el estilo computado. *No encontrado* e *Incompatible* deshabilitan el control y muestran el motivo. Es la respuesta directa al problema principal (ver DIAGNOSIS.md).

## D4 · Selectores como listas de candidatos
Primero el más específico, luego respaldos estables (`aria-label`, roles). El informe dice cuál coincidió; usar un respaldo se registra como invalidación parcial (*selector alternativo*). Permite que una actualización del sitio degrade en vez de romper.

## D5 · Anclas por app
Si falta un ancla (p. ej. el cuadro de texto de ChatGPT), la app entera queda *Incompatible* y no se aplica nada. Mejor no tocar una estructura desconocida que aplicar reglas a ciegas.

## D6 · Esenciales protegidos en el motor
Un elemento que es o contiene un esencial no se oculta nunca, aunque el adaptador lo pida. La protección no depende de que cada adaptador lo recuerde.

## D7 · Cuatro capas; las excepciones sobreviven
Global → App → Componente → Excepción. El modo es un valor de la capa app que define la visibilidad por defecto; lo que el usuario cambia a mano es una excepción y no se borra al cambiar de modo ni al aplicar un perfil. Corrige el modo destructivo de v1.3.0.

## D8 · Controles universales mínimos
`theme, mode, fontScale, font, density, readingWidth, margin` + visibilidad por elemento. Todo lo demás es específico de un adaptador o no se incluye. Pregunta aplicada: “¿se necesita en al menos dos apps?”. La distribución de WhatsApp se resuelve con `density` y `readingWidth` sobre sus componentes, no con un control propio.

## D9 · Tema por tokens + puente
Siete tokens universales. Cada adaptador traduce a sus variables. El tema se verifica en superficies reales (no en las variables que el propio motor escribe, que sería tautológico) y se revierte si el contraste baja de 4.5:1.

## D10 · Tema solo con el modo oscuro del sitio (ChatGPT y WhatsApp)
Heredado de v1.3.0: en modo claro los sitios fijan colores de texto y el resultado es ilegible. Se informa como *Incompatible* con el motivo. *Pendiente*: valorar puentes de modo claro una vez calibrados.

## D11 · Estilos de diseño en línea con registro de valores previos
`fontScale`, `density`, `margin`, `readingWidth` se escriben con `style.setProperty(..., 'important')` sobre objetivos concretos y se guardan los valores previos. Permite verificar con valores exactos y restaurar sin residuos. Valores en px (no rem) para poder compararlos con el computado.

## D12 · Sin descargas en tiempo de ejecución
Reglas y lógica viajan juntas en la extensión versionada. *Descartado*: CSS remoto cada 25 s (origen del desfase en v1.3.0).

## D13 · Acciones solo sobre controles nativos, nunca envío
`runAction` hace `click()` sobre el control real si existe. Un selector fijo bloquea `type=submit`, `send`, `enviar`. No se simulan integraciones.

## D14 · Privacidad por construcción
El motor no lee texto ni valores. Prueba con trampas en `textContent`, `innerText`, `innerHTML` y `value`. Nada sale del navegador.

## D15 · Diseño visual: sistema Riel (tema Tide)
Panel de 380 px, hairlines, un solo énfasis (`focus`), mono para estados e informes, sans para controles. Los estados se distinguen también por forma (relleno, contorno, guiones), no solo por color.

## Limitaciones conocidas

- **Sin calibrar en vivo.** Este entorno no puede abrir chatgpt.com ni web.whatsapp.com. Los selectores de ChatGPT vienen de v1.3.0; los de WhatsApp Web, de la estructura pública conocida. `calibratedAt: null` y el panel lo indica. Es el primer paso pendiente.
- **jsdom no resuelve `var()`**: el motor incluye un resolutor de variables para que la verificación funcione igual en pruebas y en navegador (en el navegador ya vienen resueltas).
- **Estilos en línea frente a re-renderizados**: si el sitio reemplaza un nodo, el observador lo vuelve a procesar (probado). Si el sitio reescribe el atributo `style` del mismo nodo sin cambiar el árbol, el observador no lo detecta hasta el siguiente cambio de árbol.
- **Firefox puede cerrar el panel al pedir permiso**; tras concederlo hay que reabrirlo (el script se inyecta igualmente).
- **Componentes no siempre presentes**: el composer de WhatsApp solo existe con un chat abierto; aparece como *No encontrado* hasta entonces.
