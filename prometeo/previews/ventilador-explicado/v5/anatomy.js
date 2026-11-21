/* PROMETEO V5 · Laboratorio mecánico · obra original MIT */
(function(){'use strict';
const $=id=>document.getElementById(id),api=()=>window.__FAN_QA__;
const chapters=[
{title:'Despiece',part:'rear-guard',stage:1,view:'trescuartos',text:'Explorá las 16 piezas independientes. La rejilla, los cierres, el motor y el eje conservan sus identidades a lo largo del desmontaje y del montaje.',fact:'Elegí 04 · Montaje en la barra inferior para observar la secuencia de regreso.'},
{title:'Electromotor',part:'rotor',stage:2,view:'mecanica',text:'Las bobinas y el rotor reciben torque entre polos del estator. El conmutador y las escobillas pertenecen al esquema de motor de corriente continua mostrado.',fact:'Muchos ventiladores hogareños de CA emplean motores de inducción sin conmutador; aquí se estudia un motor CC didáctico.'},
{title:'Oscilación',part:'gearbox',stage:4,view:'trasera',text:'El engranaje de entrada transfiere el giro a un engranaje menor y a la manivela. El cabezal oscila con la fase reducida: la oscilación depende del motor en marcha.',fact:'La biela y el engranaje sinfín completos no están reconstruidos con cotas reales. El vaivén visible es una aproximación cinemática.'},
{title:'Flujo de aire',part:'blades',stage:4,view:'frontal',text:'Las palas giran con tres velocidades; las líneas delante de la rejilla indican dirección del flujo. Encendé o apagá el ventilador para comparar.',fact:'El aire está ilustrado, no simulado: no hay cálculos de presión, caudal o turbulencia (CFD).'}
];
let opened=false,current=0;
function sync(){const q=api();if(!q)return;const d=q.getDrive();$('anatomyFact').textContent=chapters[current].fact+'  ·  '+(d.on?'Encendido, nivel '+d.speed:'Apagado')+(d.oscillate?' · Oscilando':'');}
function choose(n){current=n;const c=chapters[n],q=api();if(!q)return;q.setStage(c.stage);q.select(c.part);q.setView(c.view);if(n>=2){q.setPower(true);q.setOscillation(n===2)}
$('anatomyTitle').textContent=c.title;$('anatomyText').textContent=c.text;
document.querySelectorAll('#anatomyChapters button').forEach((b,i)=>{if(i===n)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});sync();}
function toggle(open){opened=open;$('anatomyPanel').classList.toggle('open',open);$('anatomyPanel').setAttribute('aria-hidden',String(!open));$('anatomyToggle').setAttribute('aria-expanded',String(open));$('anatomyToggle').classList.toggle('active',open);if(open)choose(current);}
$('anatomyToggle').onclick=()=>toggle(!opened);$('anatomyClose').onclick=()=>toggle(false);
document.querySelectorAll('#anatomyChapters button').forEach(b=>b.onclick=()=>choose(Number(b.dataset.chapter)));
for(const id of ['power','speed','swing'])$(id).addEventListener('click',()=>requestAnimationFrame(sync));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&opened)toggle(false)});
$('anatomyTitle').textContent=chapters[0].title;$('anatomyText').textContent=chapters[0].text;$('anatomyFact').textContent=chapters[0].fact;
})();