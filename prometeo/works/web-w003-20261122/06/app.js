import {assertSeries,flatten,format,decadeMean,domain,heatColor,METRICS,plotSeries,csvRows} from "./components.js";
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const state={data:null,metric:"meanMax",city:"buenos-aires",year:2025};
const hero=$("#hero-strips"),yearInput=$("#hero-year"),yearLabel=$("#hero-year-label"),plot=$("#main-chart");
const getCity=()=>state.data.cities.find(c=>c.id===state.city);
function safeOutput(sel,value){const el=$(sel);if(el)el.textContent=String(value)}
function buildHero(){
 const all=flatten(state.data),[lo,hi]=domain(all,"meanMax");hero.replaceChildren();
 state.data.cities.forEach(c=>{
  const row=document.createElement("div");row.className="heat-row";row.setAttribute("role","group");row.setAttribute("aria-label",c.name+", media anual de máximas");
  const head=document.createElement("div");head.className="heat-row-head";
  const name=document.createElement("span");name.className="heat-name";name.textContent=c.name;
  const value=document.createElement("span");value.className="heat-val";value.textContent=format(c.series[state.year-2001].meanMax,2)+" °C";
  head.append(name,value);row.appendChild(head);
  const stripe=document.createElement("div");stripe.className="heat-stripe";stripe.setAttribute("aria-hidden","true");
  for(const r of c.series){const bar=document.createElement("span");bar.className="bar"+(r.year===state.year?" is-selected":"");bar.style.height=String(35+65*(r.meanMax-lo)/((hi-lo)||1))+"%";bar.style.backgroundColor=heatColor(r.meanMax,lo,hi);bar.title=c.name+", "+r.year+": "+format(r.meanMax,2)+" °C";stripe.appendChild(bar)}
  row.appendChild(stripe);hero.appendChild(row);
 });
 yearLabel.textContent=state.year;
}
function renderChart(){
 const c=getCity(),m=METRICS[state.metric],record=c.series[state.year-2001];
 safeOutput("#metric-description",m.description);
 const drawn=plotSeries(plot,c,state.metric,state.year);
 $("#plot-title").textContent="Serie anual "+m.title+" en "+c.name;
 $("#plot-desc").textContent="De 2001 a 2025; escala vertical de "+format(drawn.min,state.metric==="meanMax"?1:0)+" a "+format(drawn.max,state.metric==="meanMax"?1:0)+" "+m.unit+". Año "+state.year+": "+format(drawn.selected,state.metric==="meanMax"?2:0)+" "+m.unit+". Ver tabla de datos.";
 safeOutput("#readout",format(record[state.metric],state.metric==="meanMax"?2:0)+(state.metric==="meanMax"?" °C":""));
 safeOutput("#readout-caption",c.name+" · "+state.year+" · "+m.unit);
 const first=decadeMean(c.series,state.metric,2001),last=decadeMean(c.series,state.metric,2016),diff=last-first;
 safeOutput("#chart-annotation","2001–2010: "+format(first,2)+" "+m.unit+" por año. 2016–2025: "+format(last,2)+" "+m.unit+" por año. Diferencia descriptiva: "+(diff>=0?"+":"")+format(diff,2)+" "+m.unit+".");
 $$(".city-controls button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.city===state.city)));
 $$(".metric-controls button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.metric===state.metric)));
}
function renderDecades(){
 const root=$("#decades");root.replaceChildren();
 for(const c of state.data.cities){
  const prev=decadeMean(c.series,"meanMax",2001),next=decadeMean(c.series,"meanMax",2016),delta=next-prev;
  const row=document.createElement("div");row.className="decade-row";
  const name=document.createElement("strong");name.textContent=c.name;
  const bars=document.createElement("div");bars.className="compare-bars";
  for(const [v,period] of [[prev,"2001–2010"],[next,"2016–2025"]]){const track=document.createElement("div");track.className="track";const bar=document.createElement("span");bar.className="fill";bar.style.width=(v/26*100).toFixed(2)+"%";track.title=period+": "+format(v,2)+" °C";track.appendChild(bar);bars.appendChild(track)}
  const val=document.createElement("div");val.className="decade-delta";val.textContent=(delta>=0?"+":"")+format(delta,2)+" °C";
  const label=document.createElement("small");label.textContent="diferencia de medias";val.appendChild(label);
  row.append(name,bars,val);root.appendChild(row);
 }
}
function renderTable(){
 const tbody=$("#data-rows");tbody.replaceChildren();
 const selected=$("#table-city").value;
 for(const r of flatten(state.data)){
  if(selected!=="all"&&r.id!==selected)continue;
  const tr=document.createElement("tr");if(r.year===state.year&&(selected==="all"?r.id===state.city:true))tr.className="highlight";
  const th=document.createElement("th");th.scope="row";th.textContent=r.city;tr.appendChild(th);
  for(const v of [r.year,format(r.meanMax,2),r.hotDays,r.warmNights]){const td=document.createElement("td");td.textContent=String(v);tr.appendChild(td)}
  tbody.appendChild(tr);
 }
}
function render(){buildHero();renderChart();renderTable()}
function chooseMetric(value){if(!METRICS[value])return;state.metric=value;renderChart()}
function chooseYear(value){const v=Number(value);if(!Number.isInteger(v)||v<2001||v>2025)return;state.year=v;yearInput.value=String(v);render()}
function setupInteraction(){
 yearInput.addEventListener("input",()=>chooseYear(yearInput.value));
 $$(".city-controls button").forEach(b=>b.addEventListener("click",()=>{state.city=b.dataset.city;renderChart();renderTable()}));
 $$(".metric-controls button").forEach(b=>b.addEventListener("click",()=>chooseMetric(b.dataset.metric)));
 $("#table-city").addEventListener("change",renderTable);
 $("#download-csv").addEventListener("click",()=>{
  const csv=csvRows(state.data);const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download="mapa-del-calor_era5-land_2001-2025.csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
 });
 if("IntersectionObserver" in window){
  let previous=null;
  const observer=new IntersectionObserver(entries=>{
   const candidates=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
   if(candidates.length===0)return;
   const target=candidates[0].target;if(target===previous)return;
   previous=target;$$(".chapters article").forEach(a=>a.classList.toggle("active",a===target));chooseMetric(target.dataset.story);
  },{rootMargin:"-18% 0px -35% 0px",threshold:[0,.1,.4,.7]});
  $$(".chapters article").forEach(a=>observer.observe(a));
 }
}
async function main(){
 try{
  const response=await fetch("./data.json",{cache:"no-cache"});
  if(!response.ok)throw Error("HTTP "+response.status+" al cargar data.json");
  const data=await response.json(),n=assertSeries(data);
  if(n!==75)throw Error("Cantidad de registros inesperada");
  state.data=data;setupInteraction();render();renderDecades();
  window.__MAPA_CALOR_READY__={rows:n,source:data.source,model:data.model,version:"web-w003-20261122-06"};
 }catch(error){
  $("#load-status").hidden=false;$("#load-status").textContent="No se pudo cargar la serie. Verificá la conexión o abrí data.json desde la sección Fuentes. Detalle: "+error.message;
  hero.textContent="Serie no disponible: no se muestran datos de reemplazo.";
  $("#data-rows").textContent="Los datos no están disponibles.";
  $("#decades").textContent="Sin datos. No se calcula la comparación.";
  $("#download-csv").disabled=true;yearInput.disabled=true;
  window.__MAPA_CALOR_ERROR__=error.message;
  console.error("MAPA DEL CALOR: falla de datos",error);
 }
}
main();
