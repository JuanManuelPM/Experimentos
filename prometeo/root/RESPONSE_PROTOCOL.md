# ROOT · Protocolo de respuestas públicas y capturas visuales

Página fija: https://juanmanuelpm.github.io/Experimentos/prometeo/root/

## Cuando el usuario diga CALIBRAR
1. Recuperar las fuentes privadas necesarias usando GitHub conectado y las diez trazas, sin exponerlas en la web.
2. Procesar observaciones por número (audio transcripto por ChatGPT cuando venga por esa vía; jamás asumir acceso a audios guardados en otro lugar).
3. Preparar un **resumen público apto para difusión**, sin notas sensibles, audios, adjuntos privados, tokens, autenticación ni razonamiento interno. La web es pública: no publicar literal una observación personal sin consentimiento.
4. Actualizar `prometeo/root/REPLIES.json` en `JuanManuelPM/Experimentos@gh-pages`, preservando entradas previas, con lectura actual y blob SHA como condición CAS. Los campos son `schema`, `visibility`, `updatedAt`, `entries[]` con `id`, `publishedAt`, `tag`, `cohort`, `title`, `body`.
5. Verificar readback y, cuando sea posible, la lectura en GitHub Pages. Si no hay permisos o falla la publicación, **no afirmar que la respuesta llegó a la página**. Mantener el mínimo aviso de estado en el chat.
6. No mover la aprobación humana ni cambiar automáticamente ROOT 0.1.1/0.1.2, BRIEF, otras ramas o variantes.

## Capturas de cada producción
- La fuente de cada imagen es su HTML público. Captura a viewport móvil 430px, **fullPage = true**, PNG. Guardar, junto con su fecha y SHA/identidad de producción, bajo la ruta aislada del experimento `prometeo/root/captures/wN/K/full.png` o equivalente público estable. Registrar la ruta en `SNAPSHOTS.json`, preferir `assetPath` de imagen estable a `screenshotUrl` externa.
- Si la herramienta devuelve una URL firmada, marcar **temporal** y conservar `expiresAt`; no tratarla como archivo archivado. Si no se consigue subir PNG permanentemente, mantener el HTML enlazado y decir la verdad.
- El recolector de imágenes es una capacidad compartida de la galería. No reemplaza el flujo ROOT ni cambia la consigna de productores. Los próximos productores pueden adjuntar imágenes persistentes cuando sea seguro hacerlo.
- No borrar imágenes, trazas ni variantes sin autorización explícita. El color verde de la galería sólo indica presencia del HTML, no aprobación.

## Restricciones operativas
- Esta web es estática. No contiene ChatGPT integrado, ni credenciales, ni recibe audio, ni tiene un canal de escritura automático desde el navegador.
- No prometer que futuros chats publican solos; cada ejecución debe usar GitHub conectado y verificar el write.
- El sintetizador de voz de la interfaz utiliza `speechSynthesis` del navegador si existe. No representa generación de voz original de ChatGPT.
