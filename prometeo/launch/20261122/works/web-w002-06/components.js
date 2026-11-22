/* MAPA DEL CALOR · generic public-domain-original presentation components
   Intentional dependencies: none. SVG, keyboard, scroll and reduced-motion. */
const NS = "http://www.w3.org/2000/svg";
const E = (tag,attrs={}) => {const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e};
const txt = (x,y,s,attrs={}) => {const e=E("text",{x,y,...attrs});e.textContent=s;return e};
export const formatValue=(n,d=0)=>Number(n).toLocaleString("es-AR",{maximumFractionDigits:d,minimumFractionDigits:d});

export class ScrollChapterController {
  constructor(selector,onChange) {
    this.steps=[...document.querySelectorAll(selector)];
    this.onChange=onChange;
    this.active=-1;
    this.observer=null;
    if("IntersectionObserver" in window){
      this.observer=new IntersectionObserver(entries=>{
        const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
        if(visible.length)this.set(this.steps.indexOf(visible[0].target));
      },{rootMargin:"-17% 0px -49% 0px",threshold:[0,.2,.5,1]});
      this.steps.forEach(e=>this.observer.observe(e));
    }
  }
  set(i){
    if(i<0||i===this.active||i>=this.steps.length)return;
    this.active=i;
    this.steps.forEach((el,j)=>el.classList.toggle("is-active",j===i));
    this.onChange(i,this.steps[i]);
  }
  destroy(){if(this.observer)this.observer.disconnect()}
}

export class ChartAnnotation {
  constructor(element){this.element=element}
  show({eyebrow,title,body}){
    this.element.replaceChildren();
    const k=document.createElement("span");k.className="annotation-kicker";k.textContent=eyebrow;
    const t=document.createElement("strong");t.textContent=title;
    const p=document.createElement("p");p.textContent=body;
    this.element.append(k,t,p);
  }
}

export class SeriesChart {
  constructor(svg,detail){this.svg=svg;this.detail=detail}
  mount(series,{field,unit,selectedYear,onSelect,title,zeroBased=true}) {
    const w=760,h=380,L=56,R=21,T=25,B=56;
    const vw=w-L-R,vh=h-T-B;
    const values=series.map(r=>Number(r[field]));
    const lo=zeroBased?0:Math.floor((Math.min(...values)-1)/2)*2;
    const hiRaw=Math.max(...values),hi=zeroBased?Math.max(5,Math.ceil(hiRaw/5)*5):Math.ceil((hiRaw+1)/2)*2;
    const max=hi<=lo?lo+1:hi;
    const x=i=>L+(i/(series.length-1))*vw;
    const y=v=>T+((max-v)/(max-lo))*vh;
    const root=this.svg;root.replaceChildren();
    root.setAttribute("viewBox","0 0 "+w+" "+h);
    root.setAttribute("role","img");
    root.setAttribute("aria-label",title+". Gráfico de "+series.length+" años, valores en "+unit+". Tabla completa debajo.");
    const defs=E("defs"),grad=E("linearGradient",{id:"heat-area",x1:"0",y1:"0",x2:"0",y2:"1"});
    for(const [offset,opacity] of [["0%","0.3"],["100%","0.01"]])grad.append(E("stop",{offset,"stop-color":"#e87544","stop-opacity":opacity}));
    defs.append(grad);root.append(defs);
    const avg=values.reduce((a,b)=>a+b,0)/values.length;
    for(let i=0;i<=4;i++){
      const v=lo+(max-lo)*i/4,yy=y(v);
      root.append(E("line",{x1:L,y1:yy,x2:w-R,y2:yy,stroke:"#b6b1a5","stroke-opacity":".55","stroke-dasharray":i?"2 7":"0"}));
      root.append(txt(L-10,yy+4,formatValue(v,Math.abs(max-lo)<12?1:0),{"text-anchor":"end",fill:"#585950","font-size":"12","font-family":"system-ui"}));
    }
    root.append(txt(L,T-13,unit,{fill:"#555b50","font-size":"12","font-family":"system-ui"}));
    const points=series.map((r,i)=>[x(i),y(r[field])]);
    const d=points.map((p,i)=>(i?"L":"M")+p[0].toFixed(2)+" "+p[1].toFixed(2)).join(" ");
    const area=d+" L"+x(series.length-1)+" "+y(lo)+" L"+x(0)+" "+y(lo)+" Z";
    root.append(E("path",{d:area,fill:"url(#heat-area)"}));
    root.append(E("line",{x1:L,y1:y(avg),x2:w-R,y2:y(avg),stroke:"#77766c","stroke-width":"1.4","stroke-dasharray":"6 7"}));
    root.append(E("path",{d,fill:"none",stroke:"#be5438","stroke-width":"3.2","stroke-linejoin":"round","stroke-linecap":"round"}));
    for(let i=0;i<series.length;i++){
      const r=series[i],p=points[i],active=r.year===selectedYear,point=E("circle",{cx:p[0],cy:p[1],r:active?7:4,stroke:active?"#fff6e7":"#b94f34","stroke-width":active?"3":"1.5",fill:active?"#be5438":"#efeae0",tabindex:"0",role:"button","aria-label":r.year+": "+formatValue(r[field],field==="meanMax"?2:0)+" "+unit});
      const title=E("title");title.textContent=r.year+": "+formatValue(r[field],field==="meanMax"?2:0)+" "+unit;point.append(title);
      const choose=()=>onSelect(r.year);
      point.addEventListener("click",choose);
      point.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();choose()}});
      root.append(point);
    }
    for(let i=0;i<series.length;i+=4)root.append(txt(x(i),h-24,String(series[i].year),{"text-anchor":"middle",fill:"#5f6156","font-size":"13","font-family":"system-ui"}));
    root.append(txt(w-R,h-8,"FUENTE: ERA5-LAND / OPEN-METEO",{"text-anchor":"end",fill:"#5f6156","font-size":"10","font-family":"system-ui","letter-spacing":"1"}));
    const selected=series.find(r=>r.year===selectedYear)||series[0];
    this.detail.textContent=selected.year+"  /  "+formatValue(selected[field],field==="meanMax"?2:0)+" "+unit+"  ·  Promedio 2001–2025: "+formatValue(avg,field==="meanMax"?2:1)+" "+unit;
  }
}
