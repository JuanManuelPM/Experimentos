/* CASA MATERIAL · catalog and accessible direct-linked object sheets */
const pieces={
 caliza:{number:'01',name:'Caliza',family:'RECIPIENTES',material:'ARCILLA CLARA / PIEDRA CALIZA',image:'assets/cuenco-caliza.webp',alt:'Cuenco conceptual irregular de cerámica clara sobre un bloque de piedra',copy:'El volumen nace de una sola pregunta: ¿cuánto espacio hace falta para guardar algo? Un borde imperfecto deja que la luz responda.'},
 raiz:{number:'02',name:'Raíz',family:'VASIJAS',material:'TIERRA ROJA / SUPERFICIE SIN ESMALTE',image:'assets/vasija-arcilla.webp',alt:'Vasija conceptual roja de arcilla, con dos asas asimétricas',copy:'Una silueta vertical que lleva su propia memoria. Dos asas desiguales hablan de la mano, la presión y la pausa.'},
 umbra:{number:'03',name:'Umbra',family:'SUPERFICIES',material:'ARCILLA NEGRA / TEXTURA MINERAL',image:'assets/bandeja-carbon.webp',alt:'Bandeja conceptual ovalada de arcilla negra con aceituna y hojas',copy:'Una forma baja donde la sombra se queda. La superficie oscura recorta la luz y organiza lo pequeño.'},
 duo:{number:'04',name:'Dúo',family:'RECIPIENTES',material:'ARCILLA ROJA / CALIZA / LINO',image:'assets/estudio-terracota.webp',alt:'Jarra y cuenco conceptuales sobre piedra con lino',copy:'La distancia entre dos piezas también es materia. Una composición de alturas, ritmos y superficies.'}
};
const filterButtons=[...document.querySelectorAll('[data-filter]')];
const cards=[...document.querySelectorAll('.piece')];
const status=document.getElementById('filter-status');
function selectFilter(family){
 let count=0;
 filterButtons.forEach(button=>{const active=button.dataset.filter===family;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 cards.forEach(card=>{const visible=family==='todas'||card.dataset.family===family;card.hidden=!visible;if(visible)count++;});
 status.textContent=`MOSTRANDO ${String(count).padStart(2,'0')} DE 04 ESTUDIOS`;
 return count;
}
filterButtons.forEach(button=>button.addEventListener('click',()=>selectFilter(button.dataset.filter)));
const dialog=document.getElementById('piece-dialog');
const closeButton=document.getElementById('dialog-close');
let trigger=null;
function renderPiece(id){const p=pieces[id];if(!p)return false;
 document.getElementById('dialog-img').src=p.image;
 document.getElementById('dialog-img').alt=p.alt;
 document.getElementById('dialog-title').textContent=p.name;
 document.getElementById('dialog-num').textContent=`N.º ${p.number} / ESTUDIO DE FORMA`;
 document.getElementById('dialog-copy').textContent=p.copy;
 document.getElementById('dialog-family').textContent=p.family;
 document.getElementById('dialog-material').textContent=p.material;
 return true;}
function openPiece(id,{push=true,source=null}={}){
 if(!renderPiece(id))return;
 if(source)trigger=source;
 if(!dialog.open)dialog.showModal();
 closeButton.focus();
 if(push){const u=new URL(window.location.href);u.searchParams.set('pieza',id);try{history.pushState({piece:id},'',u);}catch(_){/* Offline file origin can disallow URL history; dialog remains usable. */}}
}
function clearQuery(){const u=new URL(window.location.href);if(u.searchParams.has('pieza')){u.searchParams.delete('pieza');try{history.replaceState({},'',u);}catch(_){/* Keep offline dialog usable. */}}}
function closePiece({updateUrl=true}={}){if(dialog.open)dialog.close();if(updateUrl)clearQuery();if(trigger?.isConnected)trigger.focus();trigger=null;}
document.querySelectorAll('[data-piece]').forEach(button=>button.addEventListener('click',()=>openPiece(button.dataset.piece,{source:button})));
closeButton.addEventListener('click',()=>closePiece());
dialog.addEventListener('cancel',event=>{event.preventDefault();closePiece();});
dialog.addEventListener('click',event=>{if(event.target===dialog)closePiece();});
window.addEventListener('popstate',()=>{const id=new URL(window.location.href).searchParams.get('pieza');if(id&&pieces[id])openPiece(id,{push:false});else closePiece({updateUrl:false});});
const initialPiece=new URL(window.location.href).searchParams.get('pieza');if(initialPiece&&pieces[initialPiece])openPiece(initialPiece,{push:false});
