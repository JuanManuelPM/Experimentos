import assert from "node:assert/strict";
import {EVENTS,DAYS,STAGES,CATEGORIES} from "./data.mjs";
import {interval,overlaps,findClashes,filterEvents,createAgenda,toICS} from "./festival-core.mjs";
const check=(label,fn)=>{fn();console.log("PASS",label);};
check("24 eventos únicos y tres jornadas",()=>{
 assert.equal(EVENTS.length,24);assert.equal(new Set(EVENTS.map(e=>e.id)).size,24);
 for(const day of DAYS)assert.equal(EVENTS.filter(e=>e.day===day.date).length,8);
 for(const e of EVENTS){assert.ok(STAGES.includes(e.stage));assert.ok(CATEGORIES.includes(e.category));assert.ok(interval(e).end>interval(e).start);}
});
check("intersección estricta; contiguos no chocan",()=>{
 const a={id:"a",day:"2027-03-12",time:"16:00",duration:60};
 const b={id:"b",day:"2027-03-12",time:"17:00",duration:60};
 const c={id:"c",day:"2027-03-12",time:"16:59",duration:30};
 assert.equal(overlaps(a,b),false);assert.equal(overlaps(a,c),true);
});
check("choque entre escenarios y cruce de medianoche",()=>{
 const a=EVENTS.find(e=>e.id==="ultima-frecuencia");
 const b={id:"a-las-doce",day:"2027-03-15",time:"00:00",duration:30};
 assert.equal(overlaps(a,b),true);
 const inMap=findClashes([a.id,b.id],[a,b]);
 assert.deepEqual(inMap[a.id],[b.id]);assert.deepEqual(inMap[b.id],[a.id]);
});
check("combinar día, escenario, categoría y búsqueda insensible a acentos",()=>{
 const result=filterEvents(EVENTS,{day:"2027-03-12",stage:"Patio Luz",category:"Música",query:"electrico"});
 assert.deepEqual(result.map(x=>x.id),["brote-electrico"]);
 const empty=filterEvents(EVENTS,{day:"2027-03-14",category:"Ideas",query:"no existe"});
 assert.equal(empty.length,0);
});
check("agenda persiste, evita duplicados, valida ids y vacía",()=>{
 const map=new Map();
 const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const a=createAgenda(storage,"test",EVENTS.map(e=>e.id));
 assert.equal(a.toggle("brote-electrico"),true);
 assert.equal(a.toggle("brote-electrico"),false);
 a.toggle("brote-electrico");
 assert.deepEqual(createAgenda(storage,"test",EVENTS.map(e=>e.id)).get(),["brote-electrico"]);
 assert.throws(()=>a.toggle("id-inexistente"));a.clear();assert.deepEqual(a.get(),[]);
});
check("bloqueo de localStorage no rompe uso temporal",()=>{
 const bad={getItem(){throw Error("denegado");},setItem(){throw Error("denegado");}};
 const a=createAgenda(bad,"test",EVENTS.map(e=>e.id));
 a.toggle("brote-electrico");assert.deepEqual(a.get(),["brote-electrico"]);assert.equal(a.isPersistent(),false);
});
check("ICS real en UTC con 2 eventos y textos escapados",()=>{
 const s=toICS(["invernadero-sonoro","brote-electrico"],EVENTS);
 assert.ok(s.startsWith("BEGIN:VCALENDAR\r\n"));assert.equal((s.match(/BEGIN:VEVENT/g)||[]).length,2);
 assert.ok(s.includes("DTSTART:20270312T190000Z"));
 assert.ok(s.includes("END:VCALENDAR"));assert.ok(!s.includes("undefined"));
});
console.log("7 pruebas Node completas.");
