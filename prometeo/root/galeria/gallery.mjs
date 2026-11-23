import {STUDIOS,getBatchesForStudio,getResults,copyBase} from "./model.mjs";
let studio=new URL(location.href).searchParams.get("studio")||"3d";
if(!STUDIOS.some(x=>x.id===studio))studio="3d";
const labels={ "3d":"🧊","web":"🌐","music":"🎵","video":"🎬","images":"🎨"};
const nav=document.querySelector("#studios"),body=document.querySelector("#content"),status=document.querySelector("#status"),toast=document.querySelector("#toast");
const button=(text,onClick)=>{const b=document.createElement("button");b.textContent=text;b.className="copy";b.onclick=onClick;return b};
function announce(text){toast.textContent=text;toast.classList.add("visible");setTimeout(()=>toast.classList.remove("visible"),1700);}
const safeText=x=>document.createTextNode(String(x||""));
function gridFor(batch,messages){
 const grid=document.createElement("div");grid.className="grid";const items=getResults(batch,messages);
 for(const item of items){const a=document.createElement(item.href?"a":"div");a.className="item"+(item.message?"":" noresult");
 if(item.href){a.href=item.href;a.target="_blank";a.rel="noopener noreferrer"}else a.setAttribute("aria-disabled","true");
 const art=document.createElement("div");art.className="art";
 if(item.image){const img=document.createElement("img");img.loading="lazy";img.alt="Miniatura auténtica de "+item.label;img.src=item.image;
  img.onerror=()=>{img.remove();const span=document.createElement("div");span.textContent=labels[studio];span.className="type";art.append(span)};art.append(img);}
 else{const p=document.createElement("div");p.className="type";p.textContent=labels[studio];art.append(p)}
 const no=document.createElement("span");no.textContent=String(item.number).padStart(2,"0");art.append(no);
 const label=document.createElement("b");label.append(safeText(item.label));
 const state=document.createElement("small");state.className="state";state.textContent=item.message?(item.href?"Ver obra / resultado":"Resultado sin enlace"):"Sin retorno publicado";
 a.append(art,label,state);grid.append(a);}
 return grid;
}
function render(batches,messages){
 nav.replaceChildren();body.replaceChildren();
 for(const x of STUDIOS){const b=document.createElement("button");b.textContent=x.label;b.setAttribute("aria-current",String(x.id===studio));
 b.onclick=()=>{studio=x.id;history.replaceState(null,"","?studio="+studio);render(batches,messages)};nav.append(b)}
 const groups=getBatchesForStudio(batches,studio),latest=groups[0];
 if(!latest){status.textContent="No hay tandas registradas para este estudio.";return}
 const sec=document.createElement("section"),heading=document.createElement("div");heading.className="heading";
 const title=document.createElement("h2");title.textContent="Última tanda · "+latest.title.replace(/^.*?[·]/,"").trim();
 const actions=document.createElement("div");actions.className="actions";
 const copy=button("Copiar WORK",async()=>{try{await navigator.clipboard.writeText(copyBase(latest,studio));announce("Un solo prompt. Añadí el número 1–10.")}catch(e){announce("No se pudo copiar")}});
 actions.append(copy);heading.append(title,actions);sec.append(heading,gridFor(latest,messages));body.append(sec);
 if(groups.length>1){const section=document.createElement("section"),h=document.createElement("h2");h.textContent="Tandas anteriores";h.style.marginBottom="8px";section.append(h);
  for(const old of groups.slice(1)){const details=document.createElement("details"),summary=document.createElement("summary");
   summary.textContent=old.title;details.append(summary,gridFor(old,messages));section.append(details);}body.append(section);}
 status.textContent="Miniaturas reales cuando están disponibles. Un resultado publicado no implica QA aprobada.";
}
async function init(){
 try{const [br,mr]=await Promise.all([fetch("../BATCHES.json",{cache:"no-store"}),fetch("../ROOM_MESSAGES.json",{cache:"no-store"})]);
  if(!br.ok||!mr.ok)throw Error("HTTP "+br.status+"/"+mr.status);
  const batches=await br.json(),messages=await mr.json();
  render(batches.batches,messages.entries);
 }catch(e){status.textContent="No se pudieron cargar los índices: "+e.message;}
}init();