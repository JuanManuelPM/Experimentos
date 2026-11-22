/* Shared response web component v1.1.0. Independent of 3D/audio/video. */
import {normalizeResponse,workEvidence} from './content.js';
import {renderBlock} from './adapters.js';
import {runAction,wasCopied,recordCopied} from './actions.js';
const stylesheet=new URL('./response.css',import.meta.url).href;
const labels=['Preparado','Copiado localmente','Iniciado con evidencia','Entregado','Verificado'];
function element(tag,cls,value){const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n;}
function dateLabel(v){if(!v)return '';const d=new Date(v);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('es-AR',{day:'2-digit',month:'short'});}
class PrometeoResponse extends HTMLElement{
 constructor(){super();this._source=null;this._actions=[];this.attachShadow({mode:'open'}).innerHTML='<link rel="stylesheet" href="'+stylesheet+'"><article id="response"></article>';}
 setData(source,actions=[]){this._source=normalizeResponse(source);this._actions=Array.isArray(actions)?actions:[];this.render();}
 connectedCallback(){if(this._source)this.render();}
 _actionButton(a){const b=element('button','p-action',a.label||'Abrir');b.type='button';b.addEventListener('click',async()=>{
 const ok=await runAction(a);this.dispatchEvent(new CustomEvent('prometeo:action',{detail:{kind:a.kind,success:ok},bubbles:true,composed:true}));});return b;}
 _workset(block){
 const section=element('section','p-workset');section.setAttribute('aria-label',block.label||'Trabajos');
 for(const item of Array.isArray(block.items)?block.items.slice(0,100):[]){
 if(!item||typeof item.reference!=='string'||!item.reference)continue;
 const key=String(item.id||'')+'|'+item.reference,row=element('div','p-work');row.dataset.workId=String(item.id||'');
 row.append(element('div','p-work-label',item.label||item.id||'Trabajo'));
 const controls=element('div','p-work-controls'),status=element('span','p-status');
 const evid=workEvidence(item),flags=[true,wasCopied(key),evid.started,evid.delivered,evid.verified];
 status.setAttribute('role','group');status.setAttribute('aria-label',labels.filter((_,i)=>flags[i]).join(', '));
 for(let i=0;i<5;i++){const dot=element('i',flags[i]?(i===1?'copied':i===4?'verified':'yes'):'');dot.title=labels[i]+(flags[i]?' ✓':' · pendiente');dot.setAttribute('aria-label',dot.title);status.append(dot);}
 const button=element('button','p-work-copy',flags[1]?'Copiado':'Copiar');button.type='button';button.dataset.copied=String(flags[1]);button.setAttribute('aria-label','Copiar referencia de '+(item.label||item.id||'trabajo'));
 button.addEventListener('click',async()=>{const ok=await runAction({kind:'copy',value:item.reference});if(ok){recordCopied(key);button.dataset.copied='true';button.textContent='Copiado';status.children[1].className='copied';status.children[1].title=labels[1]+' ✓';status.setAttribute('aria-label',labels.filter((_,i)=>i===1||flags[i]).join(', '));}this.dispatchEvent(new CustomEvent('prometeo:action',{detail:{kind:'copy',success:ok,workId:item.id},bubbles:true,composed:true}));});
 controls.append(status,button);row.append(controls);section.append(row);
 }return section;
 }
 render(){
 if(!this._source)return;const r=this._source,root=this.shadowRoot.getElementById('response');root.replaceChildren();
 if(r.publishedAt){const time=element('time','p-date',dateLabel(r.publishedAt));time.dateTime=r.publishedAt;root.append(time);}
 if(r.title)root.append(element('h2','p-title',r.title));
 if(r.original!==null){const original=element('blockquote','p-original',r.original);original.setAttribute('aria-label','Pedido original');root.append(original);}
 const content=element('div','p-blocks');for(const block of r.blocks){const node=block.type==='workset'?this._workset(block):renderBlock(block);if(node)content.append(node);}root.append(content);
 if(this._actions.length){const actions=element('div','p-actions');for(const a of this._actions)if(a&&(a.kind==='copy'||a.kind==='open'))actions.append(this._actionButton(a));root.append(actions);}
 }}
if(!customElements.get('prometeo-response'))customElements.define('prometeo-response',PrometeoResponse);
export {PrometeoResponse};
