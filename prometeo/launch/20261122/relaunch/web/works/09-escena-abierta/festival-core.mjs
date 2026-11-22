// Motor puro reutilizable: zona de Buenos Aires fija (-03:00 en abril de 2027).
export const STORAGE_KEY="escena-abierta-w003-agenda-v1";
export function interval(e){
 const start=Date.parse(e.day+"T"+e.time+":00-03:00");
 if(!Number.isFinite(start)||!Number.isFinite(e.duration)||e.duration<=0)throw Error("Horario inválido: "+e.id);
 return {start,end:start+e.duration*60000};
}
export function overlap(a,b){const x=interval(a),y=interval(b);return x.start<y.end&&y.start<x.end}
const normal=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export function filterEvents(events,{day="",stage="",type="",query="",onlyIds=null}={}){
 const q=normal(query).trim();
 return events.filter(e=>(!day||e.day===day)&&(!stage||e.stage===stage)&&(!type||e.type===type)
 &&(!onlyIds||onlyIds.includes(e.id))
 &&(!q||normal([e.title,e.kicker,e.description,e.stage,e.type].join(" ")).includes(q)))
 .sort((a,b)=>interval(a).start-interval(b).start||a.title.localeCompare(b.title));
}
export function conflicts(ids,events){
 const selected=filterEvents(events,{onlyIds:ids}),pairs=[];
 for(let i=0;i<selected.length;i++)for(let j=i+1;j<selected.length;j++)
  if(overlap(selected[i],selected[j]))pairs.push([selected[i].id,selected[j].id]);
 return pairs;
}
export function createAgenda(storage,key=STORAGE_KEY,allowed=[]){
 let ids=[],persistent=true;
 try{const value=JSON.parse(storage.getItem(key)||"[]");
  if(Array.isArray(value))ids=[...new Set(value.filter(id=>typeof id==="string"&&(!allowed.length||allowed.includes(id))))];
 }catch{persistent=false}
 const save=()=>{try{storage.setItem(key,JSON.stringify(ids));persistent=true}catch{persistent=false}};
 return {
  get:()=>ids.slice(),has:id=>ids.includes(id),persistent:()=>persistent,
  toggle(id){if(allowed.length&&!allowed.includes(id))throw Error("Evento desconocido");
   ids=ids.includes(id)?ids.filter(x=>x!==id):ids.concat(id);save();return ids.includes(id)},
  clear(){ids=[];save()}
 };
}
export function timeEnd(e){return new Intl.DateTimeFormat("es-AR",{hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Argentina/Buenos_Aires"}).format(interval(e).end)}
function esc(s){return String(s).replace(/\\/g,"\\\\").replace(/\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;")}
function utc(t){return new Date(t).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z")}
export function exportICS(ids,events){
 const stamp=utc(Date.now()),lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Escena Abierta W003//Agenda Local//ES","CALSCALE:GREGORIAN","X-WR-CALNAME:Escena Abierta 2027"];
 for(const e of filterEvents(events,{onlyIds:ids})){
  const span=interval(e);
  lines.push("BEGIN:VEVENT","UID:"+e.id+"@escena-abierta-w003","DTSTAMP:"+stamp,"DTSTART:"+utc(span.start),"DTEND:"+utc(span.end),"SUMMARY:"+esc(e.title),"DESCRIPTION:"+esc(e.kicker+" · Festival ficticio"),"LOCATION:"+esc(e.stage+" · Buenos Aires"),"END:VEVENT");
 }
 lines.push("END:VCALENDAR");return lines.join("\r\n")+"\r\n";
}
