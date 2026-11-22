// Pruebas lógicas de calibración; NO ejecutan ninguna obra ni validan calidad artística.
import assert from "node:assert/strict";
import { inspectDeepSpec } from "./deep-spec-v1.mjs";

const cases = [
  {
    medium:"3d", brief:"Cocina Umbría 001: conservar escena y mejorar encuadre e interacción sin reemplazar materiales",
    source:"https://www.khronos.org/gltf/pbr",
    observation:"Khronos documenta que roughness cambia reflejos y oclusión ambiental da sombras de contacto; la coherencia material y la visibilidad deben revisarse con render real.",
    a:"CAMARA", ar:"Cámara y sujeto humano a escala", at:"Conservar el sujeto visible sin atravesar muros", 
    b:"ESCENA", br:"Muros, luz y superficies PBR", bt:"Controlar luz de entorno y roughness sin material de muestra",
    qa:"¿En qué ángulos la cámara interseca paredes y deja de mostrar el sujeto durante la órbita?",
    qb:"¿Cómo afectan rugosidad y oclusión ambiental a la credibilidad de encimera, paredes y objetos?",
    da:"Desvanecer solo pared oclusora tras raycast", db:"Probar roughness según material y sombra de contacto",
    fail:"El avatar desaparece detrás de paredes al orbitar", kind:"visual", severity:"high", test:"Captura real 360 grados con cámara orbitando en dispositivo"
  },
  {
    medium:"web", brief:"Portada editorial de ciencia cotidiana con historia de tapa y navegación responsive real",
    source:"https://web.dev/learn/design/accessibility",
    observation:"web.dev pide aplicar prefers-reduced-motion cuando hay animaciones y usar jerarquía semántica de encabezados para navegación asistida.",
    a:"TITULOS", ar:"Sistema de jerarquía editorial real", at:"Escala tipográfica variable y contraste responsive",
    b:"NAVEGACION", br:"Navegación semántica y de teclado", bt:"Mantener orden lógico y alternativas a animación",
    qa:"¿Qué relación de tamaño y ancho conserva la jerarquía de tapa a 320px sin perder el tema central?",
    qb:"¿Cómo preserva la navegación teclado y prefers-reduced-motion si el menú tiene transiciones?",
    da:"Escalas fluidas con mínimo de lectura móvil", db:"Menú semántico sin animación obligatoria",
    fail:"La portada parece bella pero el menú no funciona con teclado", kind:"interactive", severity:"medium",test:"Teclado real y emulación 320px con reducción de movimiento"
  },
  {
    medium:"music", brief:"FÁBRICA VACÍA: producir obra musical original conservando W001 y su SHA",
    source:"https://www.ableton.com/en/manual/using-grooves/",
    observation:"El manual de Ableton explica que groove altera el timing y velocidad MIDI/audio y ofrece controles de Timing, Quantize y Velocity para modificar el swing musical.",
    a:"PERCUSION", ar:"Batería con función rítmica propia", at:"Preservar transitorios y timing humano deliberado",
    b:"BAJO", br:"Bajo y motivo que dialogan con kick", bt:"Definir espacios rítmicos entre kick y nota grave",
    qa:"¿Qué combinación de swing, anticipaciones y ghost notes crea groove mecánico sin repetición vacía?",
    qb:"¿Cómo acoplar la frase de bajo con kick para evitar enmascaramiento y rigidez excesiva?",
    da:"Diseñar dos patrones de timing diferentes y elegir por escucha", db:"Compases con silencios de bajo donde golpea kick",
    fail:"El loop repite cuatro compases sin tensión ni variación", kind:"audio", severity:"high", test:"Escucha A/B de dos grooves con máster de 30 segundos"
  },
  {
    medium:"video", brief:"Microhistoria sin diálogo en tres planos, manteniendo continuidad espacial y final comprensible",
    source:"https://docs.blender.org/manual/en/latest/video_editing/",
    observation:"Blender documenta que el secuenciador reúne canales visuales y audio y permite sincronizar la pista temporal con la secuencia de montaje.",
    a:"PLANO01", ar:"Plano de establecimiento con dirección de mirada", at:"Ubicación coherente del eje y dirección de acción",
    b:"PLANO02", br:"Plano de acción con corte significativo", bt:"Conservar orientación y sonido en raccord",
    qa:"¿Dónde ubicar el eje para no invertir la dirección del personaje entre los cortes consecutivos?",
    qb:"¿Cómo encadenar sonido y tiempos del segundo plano para que el montaje exprese una causa?",
    da:"Definir eje constante y bloquear posición de cámara", db:"Transición motivada por acción y ambiente continuo",
    fail:"Dos planos bien compuestos contradicen dirección espacial al cortar", kind:"visual", severity:"high", test:"Reproducir secuencia exportada completa con sonido sincronizado"
  },
  {
    medium:"images", brief:"Ilustración interior ficticia de arquitectura con escala humana, perspectiva e iluminación controladas",
    source:"https://helpx.adobe.com/illustrator/desktop/manage-objects/reshape-transform-objects/draw-and-modify-objects-on-perspective-grid.html",
    observation:"La documentación oficial de Adobe relaciona los tres planos de la retícula con la ubicación y transformación precisa de objetos para mantener perspectiva coherente.",
    a:"HABITACION", ar:"Espacio y líneas de perspectiva correctas", at:"Unificar convergencia del mobiliario y suelo",
    b:"MOBILIARIO", br:"Mesa y silla con tamaño humano consistente", bt:"Mantener puntos de fuga comunes y altura creíble",
    qa:"¿Dónde fijar horizonte y puntos de fuga para mantener paredes y suelo sin deformación?",
    qb:"¿Cómo dibujar muebles y figuras respetando escala humana y los mismos puntos de fuga?",
    da:"Fijar retícula antes de dibujar objetos", db:"Construir proporciones con guías de altura y fuga",
    fail:"Mesas, puertas y personas pertenecen a perspectivas incompatibles", kind:"visual", severity:"medium", test:"Inspección de puntos de fuga sobre raster final y guía de altura"
  }
];

function spec(c) {
  const components=[
    {id:c.a,role:c.ar,strategy:"Construcción o importación elegida tras comparar dos técnicas",constraints:c.at+" y prueba en medio final"},
    {id:c.b,role:c.br,strategy:"Producir recurso editable, no usar placeholder genérico",constraints:c.bt+" y verificar recurso/licencia"}
  ];
  const questions=[
    {id:"Q1",target:c.a,question:c.qa,alternatives:["Técnica especializada de referencia","Solución manual verificable"],finding:"Fuente técnica examinada y límites aplicados al componente "+c.a,decisionImpact:"Cambia construcción y prueba de "+c.a+" antes de crear la obra",evidenceRef:"REF"},
    {id:"Q2",target:c.b,question:c.qb,alternatives:["Construir desde fuente propia","Importar recurso verificado"],finding:"La fuente revisada impone una relación que afecta directamente "+c.b,decisionImpact:"Elige material y verificación de "+c.b+" antes de producir",evidenceRef:"REF"}
  ];
  const decisions=[
    {id:"D1",questionId:"Q1",componentIds:[c.a],choice:c.da,rejected:"Usar solución genérica de conveniencia",why:"Una alternativa profesional verificable evita el defecto prioritario",productionChange:"Cambiar el primer corte y su test: "+c.da},
    {id:"D2",questionId:"Q2",componentIds:[c.b],choice:c.db,rejected:"Ignorar interacción entre componentes",why:"El detalle de la referencia afecta directamente la credibilidad",productionChange:"Modificar el componente antes de construir: "+c.db}
  ];
  return {version:"DEEP-SPEC-1",medium:c.medium,depth:"OPERATIVO",brief:c.brief,
   intent:{experience:"Pieza original con credibilidad y experiencia humana específica",distinctAbility:"Demostrar una capacidad distinta a un demo de plantillas"},
   references:[{id:"REF",url:c.source,status:"OBSERVED",observation:c.observation}],
   components,questions,decisions,
   relations:[{from:c.a,to:c.b,invariant:c.at+" en relación con "+c.bt,failure:c.fail,test:c.test}],
   risks:[{componentIds:[c.a,c.b],severity:c.severity,failure:c.fail,prevention:"Ejecutar primero componente mínimo y descartar resultado erróneo",test:c.test,status:"NOT_RUN"}],
   acceptance:[{kind:c.kind,criterion:"La obra completa debe evitar este defecto: "+c.fail,oracle:c.test,status:"NOT_RUN"}],
   resources:"Herramienta apropiada a la especialidad con fuente editable y control de calidad",
   licensing:"Solo recursos propios o autorizados con licencia verificada antes de publicación"};
}
let passed=0;
function check(label, condition){assert.ok(condition,label);passed++; console.log("PASS",label)}
for(const c of cases){
 const s=spec(c),gate=inspectDeepSpec(s);
 check(c.medium+" ficha estructurada específica",gate.gate===(c.severity==="high"?"SPIKE_REQUIRED":"READY_FOR_FIRST_SLICE"));
 check(c.medium+" detecta ausencia de relación",inspectDeepSpec({...s,relations:[]}).gate==="INVALID");
 check(c.medium+" detecta evidencia no observada",inspectDeepSpec({...s,references:[{...s.references[0],status:"NOT_RUN"}]}).gate==="INVALID");
 check(c.medium+" detecta decisión no ligada",inspectDeepSpec({...s,decisions:[]}).gate==="INVALID");
 check(c.medium+" detecta pregunta sin objetivo",inspectDeepSpec({...s,questions:[{...s.questions[0],target:"TODOS"},s.questions[1]]}).gate==="INVALID");
}
const three=spec(cases[0]);
check("alto riesgo fallido bloquea",inspectDeepSpec({...three,risks:[{...three.risks[0],status:"FAILED"}]}).gate==="BLOCKED");
check("spike alto observado desbloquea estructura",inspectDeepSpec({...three,risks:[{...three.risks[0],status:"OBSERVED"}]}).gate==="READY_FOR_FIRST_SLICE");
check("medio nuevo hereda lógica",inspectDeepSpec({...spec(cases[1]),medium:"holografia"}).gate==="READY_FOR_FIRST_SLICE");
console.log("TOTAL",passed,"pruebas lógicas; PRUEBAS PERCEPTUALES/INTERACTIVAS DE OBRAS: NOT_RUN");
