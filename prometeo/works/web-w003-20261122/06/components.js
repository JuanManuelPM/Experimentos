// MAPA DEL CALOR / componentes de datos reutilizables. ES Module, sin dependencias.
// Datos: Open-Meteo Historical / ECMWF ERA5-Land, atribución CC BY 4.0.
export const METRICS=Object.freeze({
 meanMax:{title:"Máxima media",unit:"°C",description:"Media de las máximas diarias del aire a 2 metros, en °C."},
 hotDays:{title:"Días ≥35 °C",unit:"días",description:"Cantidad de jornadas con máxima diaria del aire ≥35 °C."},
 warmNights:{title:"Mínimas ≥24 °C",unit:"días",description:"Cantidad de jornadas con mínima diaria del aire ≥24 °C. Proxy editorial de noches cálidas."}
});
export const format=(x,decimal=0)=>new Intl.NumberFormat("es-AR",{minimumFractionDigits:decimal,maximumFractionDigits:decimal}).format(x);
export function assertSeries(data){
 if(!data||data.model!=="era5_land"||!Array.isArray(data.cities)||data.cities.length!==3)throw Error("Se esperaban 3 series ERA5-Land.");
 const names=new Set(),ids=new Set();
 for(const c of data.cities){
  if(names.has(c.name)||ids.has(c.id)||!c.sourceUrl?.startsWith("https://archive-api.open-meteo.com/"))throw Error("Fuente/ciudad duplicada o incorrecta.");
  names.add(c.name);ids.add(c.id);
  if(!Array.isArray(c.series)||c.series.length!==25)throw Error("La localidad no tiene 25 años.");
  c.series.forEach((r,i)=>{
   const year=2001+i,expectedDays=new Date(Date.UTC(year+1,0,1))-new Date(Date.UTC(year,0,1));
   if(r.year!==year||r.days!==expectedDays/86400000||!Number.isFinite(r.meanMax)||r.meanMax<0||r.meanMax>50||!Number.isInteger(r.hotDays)||!Number.isInteger(r.warmNights)||r.hotDays<0||r.warmNights<0||r.hotDays>r.days||r.warmNights>r.days)throw Error("Registro inválido: "+c.name+" "+year);
  });
 }
 return 75;
}
export function flatten(data){return data.cities.flatMap(c=>c.series.map(r=>({city:c.name,id:c.id,year:r.year,meanMax:r.meanMax,hotDays:r.hotDays,warmNights:r.warmNights})))}
export function decadeMean(series,metric,start){const selected=series.filter(r=>r.year>=start&&r.year<start+10);if(selected.length!==10)throw Error("Década incompleta");return selected.reduce((s,r)=>s+r[metric],0)/10}
export function domain(series,metric){const vals=series.map(x=>x[metric]),min=Math.min(...vals),max=Math.max(...vals);return min===max?[min-1,max+1]:[min,max]}
const blend=(from,to,t)=>from.map((v,i)=>Math.round(v+(to[i]-v)*t));
const hex=(c)=>"#"+c.map(x=>x.toString(16).padStart(2,"0")).join("");
export function heatColor(x,min,max){let t=Math.max(0,Math.min(1,(x-min)/((max-min)||1)));return t<.5?hex(blend([205,196,169],[240,139,85],t*2)):hex(blend([240,139,85],[165,43,37],(t-.5)*2))}
const ns="http://www.w3.org/2000/svg";
function node(name,attrs,text){const el=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs||{}))el.setAttribute(k,String(v));if(text!=null)el.textContent=text;return el}
export function plotSeries(svg,city,metric,year){
 const vals=city.series.map(v=>v[metric]),[rawMin,rawMax]=domain(city.series,metric);
 const min=metric==="meanMax"?Math.floor(rawMin-.2):0,max=metric==="meanMax"?Math.ceil(rawMax+.2):Math.max(1,Math.ceil(rawMax*1.12));
 const L=54,R=574,T=24,B=221,dx=(R-L)/24,dy=(B-T)/(max-min);
 const x=i=>L+dx*i,y=v=>B-(v-min)*dy;
 svg.replaceChildren();
 for(let i=0;i<=4;i++){let gy=T+(B-T)*i/4,gval=max-(max-min)*i/4;svg.appendChild(node("line",{x1:L,y1:gy,x2:R,y2:gy,class:"plot-bg"}));svg.appendChild(node("text",{x:0,y:gy+4,class:"plot-label"},metric==="meanMax"?format(gval,1):format(gval,0)));}
 const d=vals.map((v,i)=>(i?"L":"M")+x(i).toFixed(2)+" "+y(v).toFixed(2)).join(" ");
 svg.appendChild(node("path",{d,class:"plot-line"}));
 for(let i=0;i<25;i++){let r=city.series[i],circ=node("circle",{cx:x(i),cy:y(vals[i]),r:r.year===year?7.4:3.8,class:r.year===year?"plot-focus":"plot-dot"});circ.appendChild(node("title",{},city.name+" "+r.year+": "+format(vals[i],metric==="meanMax"?2:0)+" "+METRICS[metric].unit));svg.appendChild(circ)}
 for(const i of [0,6,12,18,24])svg.appendChild(node("text",{x:x(i),y:252,"text-anchor":"middle",class:"plot-label"},String(2001+i)));
 return {min,max,selected:city.series[year-2001][metric]};
}
export function csvRows(data){
 const q=x=>'"'+String(x).replaceAll('"','""')+'"';
 const header=["localidad","año","maxima_media_celsius","dias_max_35_celsius","dias_min_24_celsius"];
 return "\ufeff"+header.join(",")+"\r\n"+flatten(data).map(r=>[q(r.city),r.year,r.meanMax.toFixed(2),r.hotDays,r.warmNights].join(",")).join("\r\n")+"\r\n";
}
export function mountAnnotations(root,annotations){root.replaceChildren();for(const a of annotations){const e=document.createElement("p");e.textContent=a;root.appendChild(e)}}
