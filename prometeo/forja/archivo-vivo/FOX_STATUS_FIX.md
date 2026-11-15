# FORJA · persistir errores tras controles Fox (15 noviembre 2026)

En scene.mjs de PR #7, report() muestra fallos de carga pero setClip() escribía mensaje de éxito sobre esos fallos. Con asset fallado y click Walk/Idle/Gallop el error desaparecía (también al cerrar Promise.all).

Corrección: función pura sceneStatusText(state), con fallos de asset + clip prioritarios sobre éxito; todas las rutas report/setClip/settled llaman updateStatus(). Se mantiene el contador y el control de clips. Prueba nativa: `node --test scene-status.test.mjs clip-resolver.test.mjs`. Test de fuente aislada, sin WebGL GPU ni Android físicos. PR y rama candidatos, nunca main.

Base fuente: ef9bbaeea88d6f4456e43831b408218187a3d98c; scene original Git blob 7309bcd5ba848af7ce8711fc2299807e638b68ff.
