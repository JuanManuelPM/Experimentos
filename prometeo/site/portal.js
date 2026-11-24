(()=>{'use strict';
const src=document.currentScript;const root=new URL('../',src.src),page=document.body.dataset.space||'home',host=document.getElementById('app');
const make=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el};
const href=id=>new URL('estudios/'+id+'/',root).href;
const add=(parent,...children)=>{parent.append(...children);return parent};
const link=(text,url,cls)=>{const el=make('a',cls,text);el.href=url;return el};
function header(items){const header=make('header','bar'),inner=make('div','bar-inner'),brand=link('PROMETEO',root.href,'brand'),nav=make('nav','site-nav');brand.setAttribute('aria-label','PROMETEO inicio');nav.setAttribute('aria-label','Estudios');
const links=[{id:'home',name:'Todos',url:root.href},...items.map(x=>({id:x.id,name:x.name.replace('Estudio ','').replace('Diseño ','Web'),url:href(x.id)}))];
for(const item of links){const a=link(item.name,item.url);if(item.id===page)a.setAttribute('aria-current','page');nav.append(a)}
return add(header,add(inner,brand,nav))}
function footer(){const f=make('footer');add(f,make('span',null,'PROMETEO · Navegador público de estudios'),link('Inicio',root.href));return f}
function heading(rootel,kind,title,description){const h=make('section','hero');add(h,make('div','eyebrow',kind),make('h1',null,title),make('p','lead',description));rootel.append(h)}
function card(studio,i){const a=link('',href(studio.id),'card');add(a,make('span','card-num',String(i+1).padStart(2,'0')+' / '+studio.category),make('h3',null,studio.name),make('p',null,studio.subtitle));
const foot=make('div','card-foot');add(foot,make('span',null,studio.view_status),make('span','arrow','↗'));a.append(foot);return a}
function section(title,info){const s=make('div','section-heading');add(s,make('h2',null,title),make('span','small',info));return s}
function related(parent,items,lookup){const bar=make('div','inline-links');for(const id of items){if(lookup.has(id))bar.append(link(lookup.get(id).name,href(id)))}parent.append(bar)}
function home(main,data){heading(main,'LOS ESTUDIOS','Todos los estudios.','Una entrada para encontrar las obras, las herramientas y las galerías de cada especialidad. Cada estudio conserva su trabajo y su identidad.');
main.append(make('div','rule'),section('Espacios','Páginas de acceso estable'));
const cards=make('div','cards');data.studios.forEach((s,i)=>cards.append(card(s,i)));main.append(cards);
const desc=make('p','notice','Esta es una navegación pública. Los proyectos privados, las ideas internas y las tareas de WORK no se exponen aquí.');main.append(desc)}
async function load3D(main){const sectionEl=make('section','preview');sectionEl.append(section('Visualizaciones 3D','Registro público del Estudio 3D'));const grid=make('div','preview-items');sectionEl.append(grid);main.append(sectionEl);
try{const response=await fetch(new URL('project-explorer/projects.json',root),{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);const data=await response.json();if(!Array.isArray(data.projects))throw Error('Registro inválido');
for(const project of data.projects){if(!/^https:\/\/juanmanuelpm\.github\.io\/Experimentos\/prometeo\/[a-z0-9_/-]+\/$/.test(project.url||''))continue;const card=link('',project.url,'preview-item');add(card,make('strong',null,project.title),make('small',null,project.description||''),make('span',null,'Abrir proyecto ↗'));grid.append(card)}
if(!grid.children.length)grid.append(make('p','small','No se encontraron enlaces públicos verificados en el registro.'))}
catch(e){grid.append(make('p','small','No se pudo cargar la lista en este momento. Usá el explorador 3D.'))}}
function studio(main,space,lookup){heading(main,space.category.toUpperCase(),space.name+'.',space.description);main.append(make('div','rule'));const panels=make('div','desk'),about=make('section','panel'),other=make('aside','panel');add(about,make('h2',null,'Página del estudio'),make('p',null,space.id==='3d'?'El navegador 3D existente sigue siendo la galería principal. Este acceso solo la conecta con los demás estudios.':'Esta dirección conecta con la biblioteca existente por estudio. Se conservan proyectos y herramientas propietarios.'));if(space.id==='3d')about.append(link('Abrir el explorador 3D ↗',new URL('project-explorer/',root).href,'primary'));else {about.append(link('Ver obras y tandas ↗',new URL('root/galeria/?studio='+encodeURIComponent(space.id),root).href,'primary'));if(space.id==='music')about.append(link('Reproductor y herramientas musicales',new URL('music/',root).href));about.append(make('p','small','La galería muestra los retornos publicados; identidad, pruebas y faltantes se distinguen.'));}
add(other,make('h2',null,'Estudios relacionados'),make('p',null,'Cambiá de especialidad sin regresar a GitHub.'));related(other,space.related||[],lookup);add(panels,about,other);main.append(panels);
if(space.id==='3d')load3D(main);else main.append(make('p','notice','No se muestran aquí informes privados, avances no publicados ni resultados experimentales como si fueran productos terminados.'))}
async function run(){if(!host)return;try{const response=await fetch(new URL('site/spaces.json',root),{cache:'no-store'});if(!response.ok)throw Error('No se pudo leer el catálogo');const data=await response.json();if(!Array.isArray(data.studios))throw Error('Catálogo inválido');const lookup=new Map(data.studios.map(s=>[s.id,s]));host.replaceChildren(header(data.studios));const shell=make('div');shell.id='shell';const main=make('main');if(page==='home')home(main,data);else{const found=lookup.get(page);if(!found){heading(main,'ESTUDIO','Espacio no registrado','Volvé al inicio para encontrar los estudios públicos.');main.append(link('Volver al inicio',root.href,'primary'))}else studio(main,found,lookup)}add(shell,main,footer());host.append(shell)}
catch(e){host.replaceChildren();const holder=make('main');holder.id='shell';heading(holder,'PROMETEO','Navegación temporalmente no disponible','El catálogo no se pudo cargar. Volvé al inicio del sitio.');holder.append(link('Ir al inicio',root.href,'primary'));host.append(holder)}}
run();
})();
