export const STUDIOS=[
 {id:"3d",label:"3D",emoji:"🧊"},{id:"web",label:"Web",emoji:"🌐"},{id:"music",label:"Música",emoji:"🎵"},{id:"video",label:"Video",emoji:"🎬"},{id:"images",label:"Imágenes",emoji:"🎨"}
];
export function getBatchesForStudio(batches,studio){
 return batches.filter(x=>x.room===studio).slice().sort((a,b)=>
  Date.parse(b.createdAt||0)-Date.parse(a.createdAt||0)||b.id.localeCompare(a.id));
}
export function getResults(batch,messages){
 const matching=messages.filter(x=>x.batchId===batch.id);
 const byNumber=new Map();
 for(const m of matching){const n=Number(m.taskNumber);if(!Number.isInteger(n)||n<1||n>batch.taskCount)continue;
  const current=byNumber.get(n);if(!current||Date.parse(m.publishedAt||0)>Date.parse(current.publishedAt||0))byNumber.set(n,m);
 }
 return Array.from({length:batch.taskCount},(_,i)=>{const task=batch.tasks?.find(x=>Number(x.number)===i+1),m=byNumber.get(i+1);
  return{number:i+1,label:task?.label||m?.title||"Sin título",message:m||null,href:bestLink(m),image:bestImage(m)};});
}
function validUrl(s){try{const u=new URL(s);return u.protocol==="https:"&&["github.com","raw.githubusercontent.com","juanmanuelpm.github.io"].includes(u.hostname)}catch{return false}}
export function bestLink(message){
 const links=(message?.blocks||[]).filter(x=>x.url&&validUrl(x.url));
 const pages=links.find(b=>b.url.startsWith("https://juanmanuelpm.github.io/Experimentos/"));
 return pages?.url || links.find(b=>/obra|ver|abrir|preview|página|web|sitio|escuchar/i.test(b.label||""))?.url || links[0]?.url || "";
}
export function bestImage(message){
 const links=(message?.blocks||[]).filter(x=>x.url&&validUrl(x.url)&&/\.(png|jpe?g|webp|svg)(?:\?.*)?$/i.test(x.url));
 const first=links.find(x=>x.url.startsWith("https://juanmanuelpm.github.io/Experimentos/")||x.url.startsWith("https://raw.githubusercontent.com/"));
 if(first)return first.url;
 // Public gh-pages image files can be served from raw.githubusercontent.com instead of a GitHub HTML blob page.
 const publicBlob=links.find(x=>x.url.startsWith("https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/"));
 return publicBlob?publicBlob.url.replace("https://github.com/JuanManuelPM/Experimentos/blob/gh-pages/","https://raw.githubusercontent.com/JuanManuelPM/Experimentos/gh-pages/"):"";
}
export function copyBase(batch,studio){
 const emoji=STUDIOS.find(x=>x.id===studio)?.emoji||"👷";
 return "👷 "+emoji+" WORK · "+batch.launchUrl+" · ";
}