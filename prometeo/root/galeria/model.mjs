export const STUDIOS=[
 {id:"3d",label:"3D",emoji:"🧊"},{id:"web",label:"Web",emoji:"🌐"},{id:"music",label:"Música",emoji:"🎵"},{id:"video",label:"Video",emoji:"🎬"},{id:"images",label:"Imágenes",emoji:"🎨"}
];
export function getBatchesForStudio(batches,studio){
 return batches.filter(x=>x.room===studio).slice().sort((a,b)=>
  Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0)||b.id.localeCompare(a.id));
}
const pages="https://juanmanuelpm.github.io/Experimentos/";
const blob="https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/";
function publicUrl(s){return typeof s==="string"&&s.startsWith(pages+"prometeo/")&&!/\\|%2e|%2f|%5c|\s|(?:^|\/)\.\.?($|\/)/i.test(s)?s:""}
const isImage=s=>/\.(png|jpe?g|webp|svg|gif|avif)(?:[?#]|$)/i.test(s);
const isMedia=s=>/\.(mp4|webm|mp3|wav|ogg|m4a|flac)(?:[?#]|$)/i.test(s);
const isPage=s=>/\/(?:[?#].*)?$|\.html?(?:[?#]|$)/i.test(s);
const stamp=m=>Date.parse(m?.publishedAt||"")||0;
export function findResult(batch,task,messages){
 const n=Number(task.number),ids=Array.isArray(task.messageIds)?task.messageIds:[];
 return messages.filter(m=>m?.room===batch.room&&((m.batchId===batch.id&&Number(m.taskNumber)===n)||(!m.batchId&&ids.includes(m.id)))).sort((a,b)=>stamp(b)-stamp(a))[0]||null;
}
export function getResults(batch,messages){
 return (Array.isArray(batch.tasks)?batch.tasks:[]).map(task=>{
  const m=findResult(batch,task,messages);
  return {number:Number(task.number),label:task.label||m?.title||"Sin título",message:m,href:bestLink(m),image:bestImage(m)};
 }).sort((a,b)=>a.number-b.number);
}
export function bestLink(message){
 const urls=(message?.blocks||[]).map(b=>publicUrl(b?.src||b?.url)).filter(Boolean);
 return urls.find(isPage)||urls.find(isMedia)||urls.find(isImage)||"";
}
export function bestImage(message){
 for(const b of message?.blocks||[]){
  const s=b?.src||b?.url;
  if(typeof s!=="string"||!isImage(s))continue;
  const u=publicUrl(s)||(s.startsWith(blob)?publicUrl(pages+s.slice(blob.length)):"");
  if(u)return u;
 }
 return "";
}
export function copyBase(batch,studio){
 const emoji=STUDIOS.find(x=>x.id===studio)?.emoji||"👷";
 return "👷 "+emoji+" WORK · "+batch.launchUrl+" · ";
}