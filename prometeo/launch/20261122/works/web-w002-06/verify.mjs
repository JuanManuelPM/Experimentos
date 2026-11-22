// MAPA DEL CALOR · reproductor independiente (Node.js 18+)
// node verify.mjs                  => controla el JSON publicado
// node verify.mjs --remote         => vuelve a descargar las tres series diarias y reconcilia cada agregado
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
const here=dirname(fileURLToPath(import.meta.url));
const doc=JSON.parse(readFileSync(join(here,"data.json"),"utf8"));
const assert=(ok,msg)=>{if(!ok)throw Error("FALLO: "+msg)};
const eq=(a,b)=>Math.abs(a-b)<0.011;
const leap=y=>y%4===0&&(y%100!==0||y%400===0);
function checkStatic(c){
 assert(c.series.length===25,"25 años, "+c.id);
 assert(c.observedDays===9131,"9131 días, "+c.id);
 assert(c.series.every((r,i)=>r.year===2001+i),"orden de años, "+c.id);
 assert(c.series.reduce((s,r)=>s+r.days,0)===9131,"total diario, "+c.id);
 for(const r of c.series){
  assert(r.days===(leap(r.year)?366:365),"días del año "+r.year+" en "+c.id);
  assert(Number.isFinite(r.meanMax)&&Number.isInteger(r.hotDays)&&Number.isInteger(r.warmNights),"tipos, "+c.id);
  assert(r.hotDays>=0&&r.hotDays<=r.days&&r.warmNights>=0&&r.warmNights<=r.days,"rangos, "+c.id);
 }
}
function rebuild(daily){
 const s=new Map(),{time,temperature_2m_max:x,temperature_2m_min:y}=daily;
 assert(time.length===9131&&x.length===9131&&y.length===9131,"dimensiones diarias");
 for(let i=0;i<time.length;i++){
  const yr=Number(time[i].slice(0,4));
  assert(Number.isFinite(x[i])&&Number.isFinite(y[i])&&x[i]>=y[i],"temperaturas válidas "+time[i]);
  if(!s.has(yr))s.set(yr,{year:yr,days:0,sumMax:0,hotDays:0,warmNights:0});
  const r=s.get(yr);r.days++;r.sumMax+=x[i];r.hotDays+=+(x[i]>=35);r.warmNights+=+(y[i]>=24);
 }
 return [...s.values()].map(r=>({...r,meanMax:Math.round(r.sumMax/r.days*100)/100}));
}
assert(doc.cities.length===3,"tres ciudades");
for(const c of doc.cities)checkStatic(c);
console.log("OK: 3 ciudades / 75 años-ciudad / 27.393 días / 0 años incompletos");
if(process.argv.includes("--remote")){
 for(const c of doc.cities){
  const res=await fetch(c.sourceUrl);
  assert(res.ok,"descarga "+c.id+": "+res.status);
  const api=await res.json();
  assert(api.daily&&api.daily.time[0]==="2001-01-01"&&api.daily.time.at(-1)==="2025-12-31","rango "+c.id);
  const rebuilt=rebuild(api.daily);
  for(let i=0;i<25;i++){
   const actual=c.series[i],expected=rebuilt[i];
   for(const key of ["year","days","hotDays","warmNights"])assert(actual[key]===expected[key],c.id+" "+actual.year+" "+key);
   assert(eq(actual.meanMax,expected.meanMax),c.id+" "+actual.year+" meanMax");
  }
  console.log("API reconciliada: "+c.name+" / 9131 jornadas");
 }
}
