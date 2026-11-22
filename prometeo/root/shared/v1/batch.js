/* PROMETEO shared batch adapter. One message, any number of independent workers. */
import {registerBlockAdapter,renderBlock} from './adapters.js';
import {copyValue,recordCopied,wasCopied,safeURL} from './actions.js';
import './response.js';
const selection=new Map();
const stylesheet=new URL('./batch.css',import.meta.url).href;
const labels=['Preparado','Copiado localmente','Iniciado con evidencia','Entregado','Verificado'];
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=String(text);return node;};
function keyFor(batch,item){return String(batch.id)+'|'+String(item.number)+'|'+String(batch.launchUrl);}
function receipt(item){const r=item.result;return r&&typeof r==='object'&&typeof r.id==='string'&&r.id? r:null;}
function flags(batch,item){
 const result=receipt(item),ev=item.evidence||{};
 const valid=x=>typeof x==='string'&&x.trim()!==''&&!x.includes('PLACEHOLDER');
 return [true,wasCopied(keyFor(batch,item)),Boolean(result)||valid(ev.started),Boolean(result&&((Array.isArray(result.blocks)&&result.blocks.some(b=>b&&b.url))||valid(result.body)))||valid(ev.delivered),valid(ev.verified)];
}
function emit(host,success,item){host.dispatchEvent(new CustomEvent('prometeo:action',{detail:{kind:'copy',success,workId:item.id},bubbles:true,composed:true}));}
function renderBatch(block){
 const items=Array.isArray(block.items)?block.items.filter(x=>x&&Number.isInteger(x.number)):[],host=el('section','p-batch');
 host.setAttribute('aria-label',block.title||'Tanda de trabajos');
 if(!items.length)return host;
 const style=document.createElement('link');style.rel='stylesheet';style.href=stylesheet;host.append(style);
 const id=String(block.id||''),tabs=el('div','p-batch-numbers'),body=el('div','p-batch-body');
 tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Trabajos de la tanda');
 host.append(tabs,body);
 let index=Math.min(Math.max(selection.get(id)||0,0),items.length-1);
 const buttons=[];
 function show(next){
  index=(next+items.length)%items.length;selection.set(id,index);
  for(let i=0;i<buttons.length;i++){
   const b=buttons[i],item=items[i],f=flags(block,item);
   b.setAttribute('aria-current',i===index?'true':'false');
   b.dataset.copied=String(f[1]);b.dataset.delivered=String(f[3]);
   b.title=(item.label||'Trabajo')+' · '+labels.filter((_,j)=>f[j]).join(' · ');
   b.setAttribute('aria-label','Ver y copiar '+item.number+'. '+b.title);
  }
  const item=items[index],f=flags(block,item);
  body.replaceChildren();
  const summary=el('div','p-batch-summary');
  summary.append(el('span','p-batch-position',String(index+1).padStart(2,'0')+' / '+items.length),el('span','p-batch-label',item.label||item.id));
  body.append(summary);
  const result=receipt(item);
  if(result){
   const response=document.createElement('prometeo-response');
   const enhanced=item.embedUrl?{...result,blocks:[{type:'scene',src:item.embedUrl,label:item.label},...(Array.isArray(result.blocks)?result.blocks:[]) ]}:result;
   response.setData(enhanced,[]);
   body.append(response);
  }else{
   body.append(el('p','p-batch-pending','Sin entrega pública registrada.'));
  }
  const footer=el('div','p-batch-footer'),status=el('span','p-batch-state',f[4]?'Verificado':f[3]?'Entregado':f[2]?'Iniciado con evidencia':f[1]?'Copiado localmente':'Preparado');
  status.title=labels.map((v,i)=>v+': '+(f[i]?'sí':'no')).join(' · ');
  footer.append(status);
  if(item.sourceUrl){const a=el('a','p-batch-source','Fuente');a.href=safeURL(item.sourceUrl)||'#';a.target='_blank';a.rel='noopener noreferrer';footer.append(a);}
  const copy=el('button','p-batch-copy',f[1]?'Copiado':'Copiar '+String(item.number).padStart(2,'0'));
  copy.type='button';copy.addEventListener('click',()=>copyItem(item));footer.append(copy);
  body.append(footer);
 }
 async function copyItem(item){
  const reference='WORK · '+String(block.launchUrl||'')+' · '+item.number;
  const ok=await copyValue(reference);
  if(ok)recordCopied(keyFor(block,item));
  show(index);emit(host,ok,item);
 }
 for(let i=0;i<items.length;i++){
  const item=items[i],f=flags(block,item);
  const button=el('button','p-batch-number',String(item.number).padStart(2,'0'));
  button.type='button';
  button.setAttribute('aria-label','Ver y copiar '+item.number+': '+(item.label||'Trabajo')+'. '+labels.filter((_,j)=>f[j]).join(', '));
  button.title=(item.label||'Trabajo')+' · '+labels.filter((_,j)=>f[j]).join(' · ');
  if(f[3])button.dataset.delivered='true';
  if(f[1])button.dataset.copied='true';
  button.addEventListener('click',()=>{show(i);copyItem(item);});
  tabs.append(button);buttons.push(button);
 }
 let start=null;
 body.addEventListener('touchstart',e=>{if(e.touches.length!==1){start=null;return;}start=[e.touches[0].clientX,e.touches[0].clientY];},{passive:true});
 body.addEventListener('touchend',e=>{
  if(!start||e.changedTouches.length!==1)return;
  const dx=e.changedTouches[0].clientX-start[0],dy=e.changedTouches[0].clientY-start[1];start=null;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)show(index+(dx<0?1:-1));
 },{passive:true});
 host.tabIndex=0;
 host.addEventListener('keydown',e=>{if(e.target!==host&&e.target!==tabs&&!e.target.classList?.contains('p-batch-number'))return;
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(index+(e.key==='ArrowRight'?1:-1));buttons[index]?.focus();}});
 show(index);
 return host;
}
registerBlockAdapter('batch',renderBatch);
export {renderBatch};