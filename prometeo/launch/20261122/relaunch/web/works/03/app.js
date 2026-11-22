import {WORKS,renderArtwork} from "./art.js";
import {RasterZoomViewer} from "./viewer.js";
const $=s=>document.querySelector(s);
const state={filter:"Todas",search:"",selected:null,fromHistory:false};
const gallery=$("#gallery"),count=$("#count"),filters=$("#filters"),dialog=$("#detail"),image=$("#full-image"),stage=$("#stage"),zoom=$("#zoom"),download=$("#download-image");
const viewer=new RasterZoomViewer(stage,image,v=>zoom.textContent=Math.round(v*100)+" %");
const series=["Todas",...new Set(WORKS.map(w=>w.series))];
const normalize=s=>s.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
function results(){return WORKS.filter(w=>(state.filter==="Todas"||w.series===state.filter)&&normalize(w.title+" "+w.medium+" "+w.year+" "+w.series).includes(normalize(state.search)))}
function makeFilters(){filters.replaceChildren();series.forEach(name=>{const b=document.createElement("button");b.type="button";b.className="filter";b.textContent=name;b.setAttribute("aria-pressed",String(state.filter===name));b.addEventListener("click",()=>{state.filter=name;makeFilters();drawGallery()});filters.append(b)})}
function thumbCanvas(work){const canvas=document.createElement("canvas");canvas.setAttribute("role","img");canvas.setAttribute("aria-label","Reproducción digital: "+work.title);canvas.loading="lazy";return canvas}
function card(work){const article=document.createElement("article");article.className="work";article.dataset.id=work.id;
 const a=document.createElement("a");a.href="#obra="+work.id;a.className="art-link";a.setAttribute("aria-label","Ver obra "+work.title+", "+work.year);
 const frame=document.createElement("div");frame.className="thumb-wrap";const canvas=thumbCanvas(work);frame.append(canvas);
 const code=document.createElement("span");code.className="thumb-code";code.textContent="N/A · "+work.id;frame.append(code);
 const caption=document.createElement("div");caption.className="work-info";const name=document.createElement("strong");name.textContent=work.title;const year=document.createElement("span");year.textContent=work.year;caption.append(name,year);a.append(frame,caption);
 const medium=document.createElement("div");medium.className="work-medium";medium.textContent=work.medium+" / "+work.series;
 article.append(a,medium);a.addEventListener("click",e=>{e.preventDefault();openWork(work.id)});
 return {article,canvas,work}
}
let drawVersion=0;
function drawGallery(){const version=++drawVersion;gallery.replaceChildren();const selected=results();count.textContent=selected.length+" / "+WORKS.length+" obras";$("#archive-empty").hidden=selected.length!==0;
 const items=selected.map(card);items.forEach(x=>gallery.append(x.article));
 // Una pieza por frame: las imágenes del catálogo no bloquean el primer gesto.
 let n=0;function next(){if(version!==drawVersion||n>=items.length)return;const {canvas,work}=items[n++];renderArtwork(canvas,work,620);if(n<items.length)requestAnimationFrame(next)}
 requestAnimationFrame(next)
}
function setFacts(work){$("#detail-title").textContent=work.title;$("#detail-description").textContent=work.desc;$("#detail-number").textContent="NA–"+work.id;$("#f-year").textContent=work.year;$("#f-medium").textContent=work.medium;$("#f-series").textContent=work.series;$("#f-size").textContent=work.dimensions;$("#f-origin").textContent="Nadia Arocena (personaje ficticio) · archivo digital original";$("#provenance").textContent=work.provenance;$("#work-label").textContent="Obra "+work.id+" / 06"}
let activeUrl="";
function openWork(id,history=true){const work=WORKS.find(w=>w.id===id);if(!work)return false;state.selected=id;setFacts(work);
 if(!dialog.open)dialog.showModal();image.removeAttribute("src");download.removeAttribute("href");$("#resolution").textContent="Preparando raster original…";
 const size=window.matchMedia("(max-width:700px)").matches?2100:2600;
 const canvas=document.createElement("canvas");const info=renderArtwork(canvas,work,size);
 activeUrl=canvas.toDataURL("image/jpeg",.93);image.src=activeUrl;download.href=activeUrl;download.download="NA-"+work.id+"-"+normalize(work.title).replace(/[^a-z0-9]+/g,"-")+".jpg";
 $("#resolution").textContent=info.width+" × "+info.height+" px · raster original";
 viewer.reset();stage.focus({preventScroll:true});
 if(history&&location.hash!=="#obra="+id)window.history.pushState({obra:id},"","#obra="+id);
 return true
}
function closeWork(history=true){if(dialog.open)dialog.close();state.selected=null;activeUrl="";if(history&&location.hash.startsWith("#obra="))window.history.pushState({},"","#archivo")}
function adjacent(delta){const i=WORKS.findIndex(w=>w.id===state.selected);if(i>=0)openWork(WORKS[(i+delta+WORKS.length)%WORKS.length].id)}
function syncUrl(){const m=location.hash.match(/^#obra=(0[1-6])$/);if(m){if(state.selected!==m[1])openWork(m[1],false)}else if(dialog.open)closeWork(false)}
$("#search-input").addEventListener("input",e=>{state.search=e.target.value;drawGallery()});
$("#clear-filters").addEventListener("click",()=>{state.filter="Todas";state.search="";$("#search-input").value="";makeFilters();drawGallery()});
$("#zoom-in").addEventListener("click",()=>viewer.setScale(viewer.scale*1.4));
$("#zoom-out").addEventListener("click",()=>viewer.setScale(viewer.scale/1.4));
$("#zoom-reset").addEventListener("click",()=>viewer.reset());
$("#close-detail").addEventListener("click",()=>closeWork());
$("#prev-work").addEventListener("click",()=>adjacent(-1));
$("#next-work").addEventListener("click",()=>adjacent(1));
$("#copy-link").addEventListener("click",async()=>{const link=location.origin+location.pathname+"#obra="+state.selected;try{await navigator.clipboard.writeText(link);$("#copy-link").textContent="Enlace copiado";setTimeout(()=>$("#copy-link").textContent="Copiar enlace",1700)}catch{window.prompt("Enlace directo a la obra:",link)}});
dialog.addEventListener("close",()=>{if(state.selected){state.selected=null;if(location.hash.startsWith("#obra="))history.replaceState({},"","#archivo")}});
window.addEventListener("popstate",syncUrl);window.addEventListener("hashchange",syncUrl);
const hero=$("#hero-art");renderArtwork(hero,WORKS[0],800);
makeFilters();drawGallery();syncUrl();
document.documentElement.dataset.ready="true";
