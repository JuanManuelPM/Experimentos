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
 const header=elt('div','p-focus-header'),heading=elt('div');
 heading.append(elt('span','p-focus-overline','ACTIVE · FOCO PROTEGIDO'),elt('h2','','ROOT / integración de obras'));
 header.append(heading,elt('span','p-focus-hint','Fuente real, no duplicado'));
 const layout=elt('div','p-focus-layout'),tree=elt('nav','p-focus-tree'),plan=elt('article','p-focus-plan');
 tree.setAttribute('aria-label','Jerarquía de contexto');plan.setAttribute('aria-label','Detalle contextual');
 layout.append(tree,plan);host.append(header,layout);
 let mounted=false;
 function mount(){if(mounted)return;const lib=document.getElementById('library');lib.querySelector('.p-library-top').insertAdjacentElement('afterend',host);mounted=true;}
 function render({room,nodeId,chair,cocina,items}){
  mount();host.hidden=!['root','3d'].includes(room);if(host.hidden)return;
  const n=BY_ID.get(nodeId)||BY_ID.get('mobiliario'),context={chair,cocina};
  tree.replaceChildren();plan.replaceChildren();
  for(const item of NODES){
   const depth=chain(item).length-1;
   const b=button(item.title,()=>go('#root/plano/'+item.id));
   b.classList.add('p-focus-tree-item');b.style.setProperty('--depth',depth);
   b.setAttribute('aria-current',String(item.id===n.id));b.setAttribute('aria-label',item.type+' · '+item.title);
   tree.append(b);
  }
  const breadcrumbs=elt('div','p-focus-crumb');
  for(const ancestor of chain(n)){
   const b=button(ancestor.title,()=>go('#root/plano/'+ancestor.id));breadcrumbs.append(b);
  }plan.append(breadcrumbs);
  const mobileBack=button('← Volver',()=>go('#root/plano/'+(n.parent||'root')));
  mobileBack.classList.add('p-focus-back');mobileBack.disabled=!n.parent;plan.append(mobileBack);
  plan.append(elt('div','p-focus-type',n.type),elt('h3','',n.title));
  const small=elt('div','p-focus-summary');
  small.append(elt('strong','','Para qué'),elt('p','',n.goal));plan.append(small);
  const ev=evidence(n,context),status=elt('div','p-focus-state');
  status.append(elt('span','','Estado verificado'),elt('strong','',ev.status));
  plan.append(status);
  const now=elt('div','p-focus-now');now.append(elt('span','','Hecho / conocido'),elt('p','',ev.done),elt('span','','Pendiente / desconocido'),elt('p','',ev.missing));plan.append(now);
  const next=elt('div','p-focus-next');next.append(elt('strong','','Siguiente acción'),elt('p','',n.next));plan.append(next);
  const actions=elt('div','p-focus-actions');
  if(n.view){
    const target=(items||[]).find(x=>n.view.endsWith('/'+x.id));
    if(!n.view.includes('/obra/')||target){actions.append(button(n.view.includes('/obra/')?'Ver obra':'Abrir sección',()=>go(n.view)));}
    else{const sourceLink=n.id==='arc-chair'||n.id==='respaldo'?(chair?.publicUrl||PUB+'asset-lab/chair-01/'):n.id==='mesa'?PUB+'3d-composition-previs-001/':PUB+'cocina-umbria-001/';
      actions.append(link(sourceLink,'Ver fuente publicada'));
    }
  }
  actions.append(button('Copiar comentario',async()=>{
   const body=['PROMETEO · COMENTARIO DE OBRA','Nodo: '+n.id,'Fuente: '+n.source,'Estado: '+ev.status,'Objetivo ACTIVE: integración ROOT, biblioteca y despacho','Observación humana: '].join('\n');
   toast(await copy(body)?'Comentario copiado; no enviado':'No se pudo copiar');}));
  actions.append(button('Copiar WORK',async()=>{
   const msg=['👷 WORK · PROMETEO · FOCO PROTEGIDO','Leer con GitHub autorizado:',CONTROL+'START_HERE.md',CONTROL+'system/CONTINUIDAD_FOCO_Y_PLANES.md','Nodo: '+n.id,'Fuente de propietario: '+n.source,'Continuar ACTIVE sin recrear obra. Recuperar evidencia existente, fijar criterios antes de actuar, implementar y verificar en esta ejecución. Guardar solo en dueño, no divulgar contexto privado, no QA serial. Entregar commits/URLs exactos.'].join('\n');
   toast(await copy(msg)?'WORK copiado; no despachado':'No se pudo copiar');}));
  plan.append(actions);
  const details=elt('details','p-focus-more'),summary=elt('summary','','Por qué · fuentes · límites');details.append(summary);
  const intro=elt('p','',n.why);details.append(intro);
  const links=elt('div','p-focus-sources');links.append(link(n.source,'Fuente propietaria'));if(n.qa)links.append(link(n.qa,'Evidencia QA'));if(n.extra)links.append(link(n.extra,'Fuente relacionada'));details.append(links);
  details.append(elt('p','p-focus-warning','Los enlaces señalan fuentes existentes. No equivalen a aprobación humana ni a ejecución de WORK. Las anotaciones se copian localmente y deben enviarse explícitamente.'));
  plan.append(details);
  host.dataset.node=n.id;
 }
 return {render,ids:new Set(BY_ID.keys())};
}
