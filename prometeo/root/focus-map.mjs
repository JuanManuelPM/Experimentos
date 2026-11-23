/* PROMETEO ROOT · vista de nodos derivada, sin copiar documentos privados. */
const PUB='https://juanmanuelpm.github.io/Experimentos/prometeo/';
const GH='https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/prometeo/';
const CONTROL='https://github.com/JuanManuelPM/pruebas/blob/prometeo/control/PROMETEO/';
const NODES=[
 {id:'root',parent:null,title:'ROOT',type:'Coordinación',goal:'Ver, continuar y despachar sin cambiar de portal',why:'Una entrada pública para obras; la coordinación y las escrituras siguen en sus propietarios',source:GH+'root/README.md',view:'#root/obras',next:'Seguir con la integración del mobiliario'},
 {id:'3d',parent:'root',title:'Estudio 3D',type:'Estudio',goal:'Construir y revisar escenas y geometría reutilizable',why:'El estudio conserva técnicas, modelos y versiones propios',source:GH+'3d-flow/README.md',view:'#3d/biblioteca',next:'Abrir la rama mobiliario'},
 {id:'mobiliario',parent:'3d',title:'Mobiliario',type:'Colección vinculada',goal:'Recuperar silla, mesa y escena sin crear duplicados',why:'Vincular fuentes existentes antes de generar nuevos modelos',source:GH+'asset-lab/chair-01/ASSET.json',next:'Comprobar las fuentes de mesa independiente'},
 {id:'arc-chair',parent:'mobiliario',title:'ARC CHAIR 01',type:'Obra procedural',goal:'Inspeccionar silueta y unión de las piezas en tres vistas',why:'Primer artículo editable con geometría procedural, todavía sin aprobación artística',source:GH+'asset-lab/chair-01/geometry.mjs',qa:GH+'asset-lab/chair-01/QA_RECEIPT.json',view:'#3d/obra/arc-chair-01',next:'Revisar el render real antes de aceptar'},
 {id:'respaldo',parent:'arc-chair',title:'Respaldo curvo',type:'Subpieza',goal:'Conservar el arco y sus tres soportes conectados',why:'El primer respaldo resultaba genérico; se rehizo el perfil',source:GH+'asset-lab/chair-01/geometry.mjs',qa:GH+'asset-lab/chair-01/QA_RECEIPT.json',view:'#3d/obra/arc-chair-01',next:'Comprobar la unión en el render real'},
 {id:'mesa',parent:'mobiliario',title:'Mesa',type:'Elemento de escena',goal:'Localizar la mesa ya usada sin hacer pasar una previsualización por asset independiente',why:'Aparece como TABLE en la composición y table en la escena Cocina Umbría',source:GH+'cocina-umbria-001/scene.mjs',extra:GH+'3d-composition-previs-001/index.html',view:'#3d/obra/3d-composition-previs-001',next:'Localizar y verificar una fuente de mesa independiente'},
 {id:'comedor',parent:'mobiliario',title:'Composición de comedor',type:'Escena',goal:'Inspeccionar el ensamblaje existente de mesa y sillas',why:'La escena de cocina existente utiliza mobiliario, pero no acredita un comedor independiente aprobado',source:GH+'cocina-umbria-001/scene.mjs',extra:GH+'cocina-umbria-001/RESULT.json',view:'#3d/obra/cocina-umbria-001',next:'Revisar la escena en WebGL y Android'}
];
const BY_ID=new Map(NODES.map(x=>[x.id,x]));
function elt(tag,cls,content){const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=String(content);return e;}
function link(url,label){const a=elt('a','p-focus-link',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function button(label,fn){const b=elt('button','p-focus-button',label);b.type='button';b.addEventListener('click',fn);return b;}
function chain(node){const out=[];while(node){out.unshift(node);node=BY_ID.get(node.parent);}return out;}
function evidence(n,ctx){
 if(n.id==='arc-chair'||n.id==='respaldo'){
  const a=ctx.chair||{};const q=a.qa||{};
  return {status:a.status||'NO_VERIFICADO',done:q.geometry||'Fuente procedural identificada',missing:['webgl','android','artistic'].filter(k=>String(q[k]||'').includes('NOT_RUN')).join(' · ')||'Ver QA del propietario',approved:a.humanApproved===true};
 }
 if(n.id==='mesa')return {status:'COMPONENTE_EN_ESCENA; ASSET_INDEPENDIENTE_DESCONOCIDO',done:'TABLE en previsualización técnica y table en scene.mjs',missing:'No se acreditó un generador independiente ni aprobación artística',approved:false};
 if(n.id==='comedor')return {status:ctx.cocina?.state||'ESCENA SIN VALIDACIÓN FINAL',done:'PROPS: mesa y sillas en escena pública',missing:(ctx.cocina?.unverified||[]).slice(0,3).join(' · ')||'WebGL/Android sin verificar',approved:false};
 if(n.id==='mobiliario')return {status:'FUENTES PARCIALES RECUPERADAS',done:'ARC CHAIR y dos escenas con mesa/sillas vinculadas',missing:'Mesa autónoma y comedor final no acreditados',approved:false};
 return {status:'VISTA DE NAVEGACIÓN',done:'Enlaces al shell y a las fuentes dueñas',missing:'Las obras y el envío de mensajes no se aprueban desde este panel',approved:false};
}
export function createFocusMap({copy,toast,go}){
 const host=elt('section','p-focus');host.id='focus-map';host.setAttribute('aria-label','Plano contextual por nodo');
 let mounted=false;
 const bootstrap=[CONTROL+'START_HERE.md',CONTROL+'system/CONTINUIDAD_FOCO_Y_PLANES.md'];
 const selected=id=>BY_ID.get(id)||BY_ID.get('mobiliario');
 function contextOf(n){
  const chainName=chain(n).map(x=>x.title).join(' / ');
  const owner=n.id==='root'?'prometeo-root':'studio-3d';
  return ['Nodo contextual (no cambia ACTIVE): '+chainName,'ID: '+n.id,'Propietario de referencia: '+owner,'Fuente original: '+n.source];
 }
 function ideaPrompt(nodeId){
  const n=selected(nodeId);
  return ['PROMETEO · IDEA','Leer con GitHub autorizado:',...bootstrap,
   'La idea nueva se captura una sola vez en el dueño que corresponda, aunque sea distinto del nodo contextual. No lanzar WORK ni desplazar el ACTIVE salvo giro humano explícito.',
   'El nodo seleccionado solo brinda contexto; verificar el dueño real antes de guardar.',
   ...contextOf(n),'Responder con dónde quedamos y el menú SEGUIR · IDEA · TRABAJAR · VER.',
   'MI IDEA:'].join('\n');
 }
 function workPrompt(nodeId){
  const n=selected(nodeId);
  return ['👷 WORK · PROMETEO · FOCO PROTEGIDO','Leer con GitHub autorizado:',...bootstrap,
   'ACTIVE: integrar el visor, la biblioteca y el despacho de ROOT con el shell compartido EXISTENTE.',
   'Recuperar primero los artefactos de silla, mesa y comedor; no inventar una mesa autónoma ni declarar aprobado un comedor.',
   'Fijar criterios críticos antes de producir, construir y comprobar dentro de esta ejecución; sin nueva QA serial.',
   'Guardar únicamente en propietarios y entregar URL y commits exactos. Copiar este mensaje NO ejecuta otro chat.',
   'No divulgar contexto humano privado. El nodo elegido no cambia el objetivo ACTIVE.',
   ...contextOf(n)].join('\n');
 }
 function mount(){
  if(mounted)return;
  const lib=document.getElementById('library');
  lib.querySelector('.p-library-top').insertAdjacentElement('afterend',host);
  mounted=true;
 }
 function render({active=false,nodeId,chair,cocina,items}){
  mount();host.hidden=!active;if(!active)return;
  const n=selected(nodeId),ev=evidence(n,{chair,cocina});
  host.replaceChildren();host.dataset.node=n.id;
  const root=n.id==='root',collection=n.id==='mobiliario',model=['arc-chair','respaldo'].includes(n.id),scene=['mesa','comedor'].includes(n.id);
  const primary=root?'#root/obras':scene?(n.id==='mesa'?PUB+'3d-composition-previs-001/':PUB+'cocina-umbria-001/'):'#3d/obra/arc-chair-01';
  const action=root?'Ver obras':scene?'Explorar escena':'Explorar silla';
  function open(target){
   if(target.startsWith('#')){
    const id=target.split('/').pop();
    if(target.includes('/obra/')&&!(items||[]).some(x=>x.id===id)){
     window.location.assign(id==='arc-chair-01'?(chair?.publicUrl||PUB+'asset-lab/chair-01/'):PUB+'cocina-umbria-001/');
    }else go(target);
   }else window.location.assign(target);
  }
  const head=elt('div','p-focus-visual-head');
  if(n.parent){const back=button('← '+(BY_ID.get(n.parent)?.title||'Volver'),()=>go('#root/plano/'+n.parent));back.classList.add('p-focus-parent');head.append(back);}
  head.append(
   elt('span','p-focus-overline',root?'PROMETEO':collection?'ESTUDIO 3D':'MOBILIARIO'),
   elt('h1','p-focus-title',root?'Obras':n.title),
   elt('p','p-focus-lede',root?'Explorá los trabajos publicados.':collection?'Una silla. Una mesa. Un espacio.':model?'Modelo 3D procedural.':'Abrí la escena y explorala.')
  );
  host.append(head);
  if(!root){
   const art=elt('div','p-focus-art');
   if(!scene){
    const picture=document.createElement('img');
    picture.src=PUB+'asset-lab/chair-01/evidence/three-quarter.svg';
    picture.alt='Proyección real de la geometría publicada de ARC CHAIR';picture.loading='eager';picture.decoding='async';art.append(picture);
   }else{
    art.classList.add('p-focus-art--scene');
    art.append(elt('span','p-focus-scene-icon','◫'),elt('span','p-focus-scene-caption','ESCENA 3D'));
   }
   const hit=button(collection?'Abrir silla 3D':action,()=>open(primary));
   hit.classList.add('p-focus-art-hit');hit.setAttribute('aria-label',action);
   art.append(hit);host.append(art);
  }
  const controls=elt('div','p-focus-main-actions');
  const main=button(action+' ↗',()=>open(primary));main.classList.add('p-focus-primary');controls.append(main);
  if(collection){
   const other=button('Ver escena',()=>open(PUB+'cocina-umbria-001/'));other.classList.add('p-focus-secondary');controls.append(other);
  }else if(!root){
   const back=button('Volver a mobiliario',()=>go('#root/plano/mobiliario'));back.classList.add('p-focus-secondary');controls.append(back);
  }
  host.append(controls);
  if(root||collection){
   const nav=elt('nav','p-focus-mininav');nav.setAttribute('aria-label','Explorar proyecto');
   const children=root?[{id:'3d',title:'3D'},{id:'mobiliario',title:'Mobiliario'}]:[{id:'arc-chair',title:'Silla'},{id:'mesa',title:'Mesa'},{id:'comedor',title:'Espacio'}];
   for(const child of children){nav.append(button(child.title,()=>go('#root/plano/'+child.id)));}
   host.append(nav);
  }
  const details=elt('details','p-focus-more');details.append(elt('summary','','Plano y fuentes'));
  const info=elt('div','p-focus-more-body');
  info.append(elt('p','',n.goal),elt('p','',n.why),elt('p','p-focus-source-status',ev.done),elt('p','p-focus-source-status','Límites: '+ev.missing));
  info.append(link(n.source,'Fuente original'));if(n.extra)info.append(link(n.extra,'Fuente relacionada'));
  const technical=elt('div','p-focus-technical');
  technical.append(button('Copiar IDEA',async()=>toast(await copy(ideaPrompt(n.id))?'IDEA copiada':'No se pudo copiar')));
  technical.append(button('Copiar comentario',async()=>{
   const msg=['PROMETEO · COMENTARIO DE OBRA','Nodo: '+n.id,'Fuente: '+n.source,'Observación: '].join('\n');
   toast(await copy(msg)?'Comentario copiado':'No se pudo copiar');
  }));
  technical.append(button('Copiar WORK',async()=>toast(await copy(workPrompt(n.id))?'WORK copiado':'No se pudo copiar')));
  info.append(technical);details.append(info);host.append(details);
 }
 return {render,ideaPrompt,workPrompt,ids:new Set(BY_ID.keys())};
}
