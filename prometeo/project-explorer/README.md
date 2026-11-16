# PROMETEO 3D · Explorador público de proyectos

**Entrada pública:** https://juanmanuelpm.github.io/Experimentos/prometeo/project-explorer/

## Qué se instaló
- `projects.json`: las **12 visualizaciones públicas preexistentes** descubiertas en `gh-pages/prometeo/**/index.html` a la fecha inicial, agrupadas por dominio, con fecha y SHA del **último commit de contenido de su carpeta** al momento de inventariar.
- `launcher.js`: un único explorador de carpetas táctil, aislado por Shadow DOM para no romper estilos ni herramientas. Se agrega mediante **un único script** en las páginas de `prometeo/`.
- `index.html`: vista autónoma del explorador para entrar sin abrir antes una escena.

En `prometeo/quality-ab-npc-001/`, el botón ⓘ existente abre el explorador en vez de mostrar la ficha técnica. Su panel de diagnóstico sigue disponible en el DOM para el motor pero no aparece ante el usuario. En las demás escenas/visores se coloca **un solo ícono discreto** en la esquina superior derecha. Un toque abre las carpetas; otro proyecto abre su enlace en la misma pestaña. No se modificaron materiales, escenas, rigs ni clips.

## Recencia confiable
- Orden: carpetas por su proyecto más reciente; cada carpeta por fecha descendente.
- Fuente: último commit de contenido de cada **directorio público** en `gh-pages`, mediante `GET /repos/JuanManuelPM/Experimentos/commits?sha=gh-pages&path=prometeo/<id>`.
- **Excepción obligatoria:** ignorar commits exclusivamente cosméticos de incorporación del menú (`prometeo 3d: acceso compartido...` y `prometeo 3d: navegación de proyectos...`). Cambiar menús no debe falsificar la fecha de actualización artística.
- Primer render: snapshot `projects.json` realmente verificado en GitHub; no espera API.
- Al abrir: intentar descubrir nuevos `index.html` públicos consultando el árbol `gh-pages`, actualizar timestamps por carpeta y guardar cache en navegador durante **30 minutos**. Si la API está sin conexión o limitada, permanece el snapshot anterior, no una fecha inventada.
- La navegación muestra **solo sitios públicos**; los proyectos y ramas privados permanecen en `JuanManuelPM/pruebas`. El timestamp no significa que el render ni la calidad estén aprobados.

## Contrato para el próximo publicador
Si publicás `prometeo/nuevo-experimento/index.html`, incluir al final del body:

```html
<script defer src="../project-explorer/launcher.js" data-prometeo-3d-nav="1"></script>
```

Para subcarpetas, calcular `../` según la profundidad. El explorador descubrirá la página por GitHub y actualizará su última modificación, pero para que pueda abrirse desde esa nueva página ésta debe **incluir el script**. Para aparecer inmediatamente antes de la próxima consulta a la API, también agregar entrada a `projects.json` en el mismo commit de publicación.

**Prohibido:** usar el menú como sustituto de tests WebGL; bloquear un 3D con paneles por fallos de clips; afirmar QA visual o artístico por un enlace público; publicar material privado del usuario.

## Estado de verificación
- Se comprobó mediante el conector GitHub la existencia de las 12 `index.html` de origen, los 12 commits por carpeta, y el enlace de `launcher.js` agregado a cada una.
- Se confirmó con GitHub que los commits de menú no cambian la recencia de contenido al filtrarlos.
- **No se comprobó ejecución JavaScript y controles táctiles desde un Android real o navegador remoto WebGL**. El proveedor web no pudo abrir la URL pública y el entorno local no tiene salida a Internet. Este límite afecta QA del portal, no la integridad de los archivos versionados.
- **No se reconstruyó ningún personaje**; Q3D-001 continúa con el humanoide estático sin clips en el GLB. Es un pendiente de otro trabajo.
