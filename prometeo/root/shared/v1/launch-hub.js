/* Shared ROOT launch hub: a single message, existing batches, no fake task starts. */
import {registerBlockAdapter} from './adapters.js';
const stylesheet=new URL('./launch-hub.css',import.meta.url).href;
const names={music:'Música',web:'Web',video:'Video',images:'Imágenes'};
function renderHub(){
 const section=document.createElement('section');section.setAttribute('aria-label','Tandas preparadas');
 const link=document.createElement('link');link.rel='stylesheet';link.href=stylesheet;section.append(link);
 const grid=document.createElement('div');grid.className='p-launch-grid';
 const batches=window.PROMETEO_PUBLIC_BATCHES||[];
 for(const room of ['music','web','video','images']){
  const batch=batches.find(x=>x.room===room&&x.id.endsWith('20261122'));if(!batch)continue;
  const a=document.createElement('a');a.className='p-launch-card';a.href='#'+room+'/tanda/'+encodeURIComponent(batch.id);
  a.setAttribute('aria-label','Abrir '+names[room]+' · '+(batch.tasks?.length||0)+' trabajos preparados');
  const title=document.createElement('strong');title.textContent=names[room];
  const count=document.createElement('span');
  const msgs=window.PROMETEO_PUBLIC_MESSAGES||[];
  let done=0;for(const task of batch.tasks||[])if(msgs.some(x=>x.room===room&&(x.batchId===batch.id&&Number(x.taskNumber)===Number(task.number)||task.messageIds?.includes(x.id))))done++;
  count.textContent=done+' / '+(batch.tasks?.length||0)+' entregas';
  a.append(title,count);grid.append(a);
 }
 section.append(grid);return section;
}
registerBlockAdapter('launch-hub',renderHub);export {renderHub};