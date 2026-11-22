// Motor de programación/agenda reutilizable · ES module sin dependencias
export const STORAGE_KEY="escena-abierta-agenda-v1";
export function interval(event){
 const start=Date.parse(event.day+"T"+event.time+":00-03:00");
 if(!Number.isFinite(start)||!Number.isFinite(event.duration)||event.duration<=0)throw Error("Evento horario inválido: "+event.id);
 return {start,end:start+event.duration*60000};
}
export function overlaps(a,b){
 const x=interval(a),y=interval(b);
 return x.start<y.end&&y.start<x.end;
}
export function findClashes(ids,events){
 const chosen=events.filter(e=>ids.includes(e.id)),map={};
 for(const e of chosen)map[e.id]=[];
 for(let i=0;i<chosen.length;i++)for(let j=i+1;j<chosen.length;j++){
  if(overlaps(chosen[i],chosen[j])){
   map[chosen[i].id].push(chosen[j].id);
   map[chosen[j].id].push(chosen[i].id);
  }
 }
 return map;
}
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
export function filterEvents(events,{day="",stage="",category="",query="",onlyIds=null}={}){
 const q=norm(query);
 return events.filter(e=>(!day||e.day===day)&&(!stage||e.stage===stage)&&(!category||e.category===category)&&(!onlyIds||onlyIds.includes(e.id))&&(!q||norm([e.title,e.subtitle,e.description,e.category,e.stage].join(" ")).includes(q)))
 .sort((a,b)=>interval(a).start-interval(b).start||a.stage.localeCompare(b.stage));
}
export function createAgenda(storage=globalThis.localStorage,key=STORAGE_KEY,allowedIds=[]){
 let ids=[],persistent=true;
 try{
  const saved=JSON.parse(storage.getItem(key)||"[]");
  if(Array.isArray(saved))ids=[...new Set(saved.filter(x=>typeof x==="string"&&(!allowedIds.length||allowedIds.includes(x))))];
 }catch(e){persistent=false;}
 const save=()=>{
  try{storage.setItem(key,JSON.stringify(ids));persistent=true;}catch(e){persistent=false;}
 };
 return {get:()=>[...ids],has:id=>ids.includes(id),isPersistent:()=>persistent,
  toggle(id){
   if(allowedIds.length&&!allowedIds.includes(id))throw Error("ID desconocido");
   ids=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];save();return ids.includes(id);
  },
  clear(){ids=[];save();}
 };
}
function icsEscape(s){return String(s).replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");}
export function toICS(ids,events){
 const selected=filterEvents(events,{onlyIds:ids});
 const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
 const out=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Escena Abierta//Agenda Local//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH","X-WR-CALNAME:ESCENA ABIERTA"];
 for(const e of selected){
  const {start,end}=interval(e);
  const utc=t=>new Date(t).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  out.push("BEGIN:VEVENT","UID:"+e.id+"-2027@escenaabierta.local","DTSTAMP:"+stamp,
   "DTSTART:"+utc(start),"DTEND:"+utc(end),"SUMMARY:"+icsEscape(e.title),
   "DESCRIPTION:"+icsEscape(e.subtitle+" · Festival cultural ficticio"),"LOCATION:"+icsEscape(e.stage+", Buenos Aires"),"END:VEVENT");
 }
 out.push("END:VCALENDAR");return out.join("\r\n")+"\r\n";
}
export function timeLabel(e){
 const {end}=interval(e);
 const fmt=(t)=>new Intl.DateTimeFormat("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Argentina/Buenos_Aires"}).format(t);
 return e.time+"–"+fmt(end);
}
