// MAPA DEL CALOR · QA reproducible de datos. Node >=18.
// Usage: node verify.mjs [--remote]
// Local = audit 75 aggregate records. --remote = recalculate against original ERA5-Land daily API.
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,join} from "node:path";
import {assertSeries,flatten,decadeMean,csvRows} from "./components.js";
const root=dirname(fileURLToPath(import.meta.url));
const data=JSON.parse(readFileSync(join(root,"data.json"),"utf8"));
let tests=0;const check=(name,ok)=>{if(!ok)throw Error("FAIL: "+name);tests++;console.log("PASS",name)};
const rows=assertSeries(data),flat=flatten(data);
check("75 data rows / 3 cities x 25 years",rows===75&&flat.length===75);
check("all years 2001..2025 in order",data.cities.every(c=>c.series.every((r,i)=>r.year===2001+i)));
check("25 annual rows per city and 9131 days",data.cities.every(c=>c.series.length===25&&c.observedDays===9131));
check("CSV 75 data lines and exact row count",csvRows(data).trim().split(/\r?\n/).length===76);
check("CSV year 2025 Rosario 17 hot days",csvRows(data).includes('"Rosario",2025,23.97,17,16'));
check("Buenos Aires 2025: 21.30 C / 2 hot days / 14 warm minima",JSON.stringify(data.cities[0].series.at(-1))===JSON.stringify({year:2025,days:365,meanMax:21.3,hotDays:2,warmNights:14}));
check("Rosario 2022: 34 hot days",data.cities[1].series.find(r=>r.year===2022).hotDays===34);
check("Córdoba 2023: 24.48 C annual mean max",data.cities[2].series.find(r=>r.year===2023).meanMax===24.48);
check("decade averages computed from 10 years each",data.cities.every(c=>Number.isFinite(decadeMean(c.series,"meanMax",2001))&&Number.isFinite(decadeMean(c.series,"meanMax",2016))));
check("source urls encode era5_land daily 2m min/max",data.cities.every(c=>/models=era5_land/.test(c.sourceUrl)&&/temperature_2m_max/.test(c.sourceUrl)&&/temperature_2m_min/.test(c.sourceUrl)));
if(process.argv.includes("--remote")){
 let matched=0,rawDays=0;
 for(const c of data.cities){
  const response=await fetch(c.sourceUrl,{signal:AbortSignal.timeout(60000)});
  if(!response.ok)throw Error(c.name+": HTTP "+response.status);
  const remote=await response.json(),d=remote.daily;
  if(!d||!Array.isArray(d.time)||d.time.length!==9131)throw Error(c.name+" length invalid");
  const byYear=new Map();
  for(let i=0;i<d.time.length;i++){
   const year=Number(d.time[i].slice(0,4)),hi=d.temperature_2m_max[i],lo=d.temperature_2m_min[i];
   if(!Number.isFinite(hi)||!Number.isFinite(lo))throw Error(c.name+": null day "+d.time[i]);
   const v=byYear.get(year)||{days:0,sum:0,hotDays:0,warmNights:0};
   v.days++;v.sum+=hi;v.hotDays+=hi>=35?1:0;v.warmNights+=lo>=24?1:0;byYear.set(year,v);rawDays++;
  }
  for(const r of c.series){const v=byYear.get(r.year);
   if(!v||v.days!==r.days||Math.round(v.sum/v.days*100)/100!==r.meanMax||v.hotDays!==r.hotDays||v.warmNights!==r.warmNights)
     throw Error(c.name+" year "+r.year+" differs from daily API");
   matched++;
  }
 }
 check("75/75 remote recomputation from raw daily ERA5-Land",matched===75&&rawDays===27393);
 console.log("REMOTE_RECONCILED",matched,rawDays);
}else console.log("REMOTE_RECALCULATION_NOT_RUN: use --remote with network access");
console.log("LOCAL_STRUCTURAL_PASS",tests,"checks");
