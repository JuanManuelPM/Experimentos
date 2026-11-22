# Registro de etapas · W003/02

**No es un grafo visitado validado.** No se recuperó el archivo de nodos/aristas y SHA de la versión especializada activa, por lo que no se ejecutó `visited-trace-v1.mjs`. Se conserva aquí el trayecto documental, sin inventar nodos ni usar 1.4.0 como si validara 2.3.0.

| Paso | Resultado | Evidencia |
|---|---|---|
| Despacho del N=02 | EXECUTED | LAUNCH GH blob a97b91ca; sólo W003/02 |
| Recuperación Q-LOOP/QBAR/DEEP-SPEC | EXECUTED | SHAs en Book |
| Benchmark profesional | EXECUTED | Tres páginas y foto de referencia en Book |
| Primer artículo: render foto | EXECUTED | PNG 1536×1024 en ZIP local |
| Segundo artículo foto para continuidad | FAILED | Generó póster no relacionado, descartado |
| Decisión de cambio de familia de representación | EXECUTED | VTK en lugar de otra foto independiente |
| Construcción de modelo métrico único | EXECUTED | source scene.py y SCENE_CANON.json |
| Render de cámaras A/B/C | EXECUTED | Tres PNG de 1440×960 observados localmente |
| Validación de realismo fotográfico multivista | FAILED | Renders geométricos no son fotos |
| Browser 390/1440 | NOT_RUN | No hay superficie pública con media |
| Check remoto de media original | NOT_RUN | Binarios no publicados en GitHub |
| Trazabilidad de nodos/aristas v2.3.0 | NOT_RUN | Flujo privado no recuperado |
| Aprobación humana | NOT_RUN | No atribuible a la IA |

## Reglas de comparación

No homologar *3 cameras true* con *3 photo-grade outputs*. No considerar un banner u objeto fuera del tema como variante válida. Conservar W002 como comparación histórica, sin reemplazar sus assets ni informes.

**Rol del ROOT:** informar estado parcial al agregador; no sobrescribir resultados concurrentes de otras tareas. Documento: este `TRACE.md`. Resultado artístico final aún abierto.
