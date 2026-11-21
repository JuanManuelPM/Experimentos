"use strict";
(function(){
const BASE="https://juanmanuelpm.github.io/Experimentos/";
const COHORT="root-ui-benchmark-w001";
const BRIEF="558b9babbf23e0fdf1cfeb6b4af7dd0fa7afb9dab5a84b14e280c04b6e2a770a";
const ROOT="35ee98a3c32538ed02191c1b21917e2d47af9b9bbcdd3e0e03932aa137d1b918";
const STAGES=["scope","recovery","prevention","alternatives","capabilities","planning","production","integration","persistence","delivery"];
const STORE="prometeo-root-w001-review-05";
const $=id=>document.getElementById(id);
let availability=Array(11).fill("checking"), selected=0, current=1, reviews=loadSaved();
function preview(n){return BASE+"prometeo/root/ui-lab/w1/"+n+"/";}
function isReady(n){return availability[n]==="ready";}
function statusText(n){return {ready:"Publicado",pending:"Pendiente",checking:"Consultando…",unverified:"Sin verificar"}[availability[n]]||"Sin verificar";}
function element(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x;}
function loadSaved(){try{const v=JSON.parse(sessionStorage.getItem(STORE)||"{}");return v&&typeof v==="object"&&!Array.isArray(v)?v:{};}catch(_){return {};}}
function item(n){if(!reviews[n]||typeof reviews[n]!=="object")reviews[n]={note:"",score:"",stage:"",attachments:[]};if(!Array.isArray(reviews[n].attachments))reviews[n].attachments=[];return reviews[n];}
function report(msg){$("review-feedback").textContent=msg;}
function persist(){try{const safe={};for(let i=1;i<=10;i++){const r=item(i);safe[i]={note:r.note||"",score:r.score||"",stage:r.stage||""};}sessionStorage.setItem(STORE,JSON.stringify(safe));}catch(_){report("No se pudo guardar en esta pestaña. Exportá el JSON para conservar tu trabajo.");}}
function reviewedCount(){let n=0;for(let i=1;i<=10;i++){const r=item(i);if(r.note||r.score||r.stage||r.attachments.length)n++;}$("review-count").textContent=n+" de 10 revisadas";}
function drawSlots(){
const grid=$("slots");grid.replaceChildren();
for(let i=1;i<=10;i++){
const card=element("article","slot");card.dataset.status=availability[i];card.dataset.selected=String(i===selected);
const button=element("button","");button.type="button";button.disabled=!isReady(i);button.setAttribute("aria-label","Versión "+i+". "+statusText(i)+". Mostrar vista previa.");button.append(element("span","num",String(i).padStart(2,"0")),element("span","status",statusText(i)));button.addEventListener("click",()=>showPreview(i));
const foot=element("div","foot");foot.appendChild(element("span","",i===5?"Esta versión":"Ola 001"));
const a=element("a","","Abrir ↗");a.href=isReady(i)?preview(i):"#";a.target="_blank";a.rel="noopener noreferrer";a.setAttribute("aria-label","Abrir versión "+i+" en otra pestaña");
if(!isReady(i)){a.setAttribute("aria-disabled","true");a.tabIndex=-1;}foot.appendChild(a);card.append(button,foot);grid.appendChild(card);
}
$("available-count").textContent=availability.slice(1).filter(x=>x==="ready").length+"/10";
$("available-label").textContent="previews publicados (no certificados)";
}
function placeholder(title,message){const d=element("div","placeholder");d.append(element("strong","",title),element("p","",message));return d;}
function frame(box,n){
const host=$(box),key=n+":"+availability[n];if(host.dataset.key===key)return;host.dataset.key=key;host.replaceChildren();
if(!isReady(n)){host.appendChild(placeholder(statusText(n),availability[n]==="unverified"?"No fue posible comprobar este enlace. Probá actualizar.":"Aún no existe un preview público verificado."));return;}
const f=document.createElement("iframe");f.title="Versión "+String(n).padStart(2,"0")+" · PROMETEO ROOT";f.src=preview(n);f.loading="lazy";f.referrerPolicy="no-referrer";f.setAttribute("sandbox","allow-scripts allow-forms allow-popups allow-pointer-lock");host.appendChild(f);
}
function linkAvailability(id,n){const a=$(id);a.href=isReady(n)?preview(n):"#";a.setAttribute("aria-disabled",String(!isReady(n)));a.tabIndex=isReady(n)?0:-1;}
function showPreview(n){if(!isReady(n))return;selected=n;drawSlots();$("preview-heading").textContent="Versión "+String(n).padStart(2,"0");$("preview-subheading").textContent="Vista aislada · publicada, no evaluada";$("preview-link").hidden=false;$("preview-note").hidden=false;$("preview-link").href=preview(n);frame("preview-frame",n);$("preview-section").scrollIntoView({behavior:"smooth",block:"start"});}
function refreshComparison(){
const a=Number($("compare-a").value),b=Number($("compare-b").value);frame("frame-a",a);frame("frame-b",b);linkAvailability("open-a",a);linkAvailability("open-b",b);
}
function initSelects(){
for(let i=1;i<=10;i++)for(const id of ["compare-a","compare-b","review-version"])$(id).add(new Option("Versión "+String(i).padStart(2,"0"),String(i)));
$("compare-a").value="1";$("compare-b").value="2";$("review-version").value="1";
$("compare-a").addEventListener("change",refreshComparison);$("compare-b").addEventListener("change",refreshComparison);
}
async function checkPreviews(){
$("refresh").disabled=true;
try{
await Promise.all(Array.from({length:10},(_,z)=>{
const n=z+1;
return fetch(preview(n),{method:"HEAD",cache:"no-store"}).then(r=>{availability[n]=r.ok?"ready":r.status===404?"pending":"unverified";}).catch(()=>{availability[n]="unverified";});
}));
drawSlots();refreshComparison();if(selected)frame("preview-frame",selected);
}finally{$("refresh").disabled=false;}
}
function fillReview(n){current=n;const r=item(n);$("review-version").value=String(n);$("review-score").value=r.score||"";$("review-text").value=r.note||"";$("review-stage").value=r.stage||"";drawImages();report("");}
function saveReview(silent=false){
const r=item(current);r.note=$("review-text").value.slice(0,4000);r.score=/^[1-5]$/.test($("review-score").value)?$("review-score").value:"";r.stage=STAGES.includes($("review-stage").value)?$("review-stage").value:"";
persist();reviewedCount();if(!silent)report("Nota de la versión "+String(current).padStart(2,"0")+" guardada en esta pestaña.");
}
function drawImages(){
$("image-list").replaceChildren();item(current).attachments.forEach((a,i)=>{
const li=element("li","");li.appendChild(element("span","",a.name+" · "+Math.round(a.sizeBytes/1024)+" KB"));
const b=element("button","","×");b.type="button";b.setAttribute("aria-label","Quitar captura "+a.name);b.addEventListener("click",()=>{item(current).attachments.splice(i,1);drawImages();reviewedCount();report("Captura retirada de esta versión.");});li.appendChild(b);$("image-list").appendChild(li);
});
}
function compress(file){
return new Promise((resolve,reject)=>{
const objectUrl=URL.createObjectURL(file),img=new Image();
img.onload=()=>{
try{
const s=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight)),c=document.createElement("canvas");
c.width=Math.max(1,Math.round(img.naturalWidth*s));c.height=Math.max(1,Math.round(img.naturalHeight*s));
const ctx=c.getContext("2d");if(!ctx)throw Error("Canvas no disponible.");
ctx.fillStyle="#ffffff";ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,0,0,c.width,c.height);
const dataUrl=c.toDataURL("image/jpeg",.76);const bytes=Math.round((dataUrl.length-dataUrl.indexOf(",")-1)*.75);
if(bytes>1700000)throw Error("La captura sigue siendo demasiado grande.");
resolve({name:file.name.slice(0,120),type:"image/jpeg",sizeBytes:bytes,dataUrl});
}catch(err){reject(err);}finally{URL.revokeObjectURL(objectUrl);}
};
img.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(Error("No se pudo leer la imagen."));};img.src=objectUrl;
});
}
async function addImages(fileList,target){
const imgs=Array.from(fileList).slice(0,2),r=item(target);
if(fileList.length>2)report("Se admiten hasta dos capturas por versión.");
for(const file of imgs){
if(r.attachments.length>=2){report("Ya hay dos capturas para esta versión. Quitá una para reemplazarla.");break;}
if(!file.type.startsWith("image/")||file.size>8000000){report("La imagen debe pesar menos de 8 MB.");continue;}
try{r.attachments.push(await compress(file));report("Captura reducida localmente. Exportá el JSON para conservarla.");}
catch(err){report("No se pudo preparar una captura: "+err.message);}
}
if(current===target)drawImages();reviewedCount();$("review-images").value="";
}
function makePacket(){
saveReview(true);return {schema:"prometeo.root.review/v1",cohortId:COHORT,wave:1,sourceVariant:5,briefSha256:BRIEF,root:{id:"prometeo-root-selfbuild",version:"0.1.1",sha256Canonical:ROOT},exportedAt:new Date().toISOString(),transport:"manual-local-download",reviews:Array.from({length:10},(_,z)=>{const n=z+1,r=item(n);return {variant:n,score:r.score?Number(r.score):null,stage:r.stage||null,note:r.note||"",attachments:r.attachments.map(a=>({name:a.name,type:a.type,sizeBytes:a.sizeBytes,dataUrl:a.dataUrl}))};})};}
function download(){
const pack=makePacket(),blob=new Blob([JSON.stringify(pack,null,2)],{type:"application/json;charset=utf-8"}),a=document.createElement("a");
a.href=URL.createObjectURL(blob);a.download="PROMETEO_ROOT_W001_REVISION.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);report("Archivo JSON preparado. Revisá la carpeta de descargas del navegador.");
}
async function importReview(file){
if(!file||file.size>28000000)throw Error("Archivo ausente o demasiado grande (límite 28 MB).");
const data=JSON.parse(await file.text());if(data.schema!=="prometeo.root.review/v1"||data.cohortId!==COHORT||data.briefSha256!==BRIEF||!Array.isArray(data.reviews)||data.reviews.length>10)throw Error("La revisión no corresponde a la misma ola y brief.");
const incoming={};
for(const r of data.reviews){
if(!Number.isInteger(r.variant)||r.variant<1||r.variant>10||incoming[r.variant])throw Error("Números repetidos o inválidos.");
const files=Array.isArray(r.attachments)?r.attachments:[];if(files.length>2)throw Error("Demasiadas capturas.");
incoming[r.variant]={note:String(r.note||"").slice(0,4000),score:Number.isInteger(r.score)&&r.score>=1&&r.score<=5?String(r.score):"",stage:STAGES.includes(r.stage)?r.stage:"",attachments:files.map(a=>{
if(typeof a.dataUrl!=="string"||a.dataUrl.length>2600000||!/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(a.dataUrl))throw Error("Imagen incorporada no válida.");
return {name:String(a.name||"captura").slice(0,120),type:String(a.type||"image/jpeg"),sizeBytes:Number(a.sizeBytes)||0,dataUrl:a.dataUrl};
})};
}
saveReview(true);Object.assign(reviews,incoming);persist();fillReview(current);reviewedCount();report("Revisión importada en este navegador; no se envió por red.");
}
async function loadStudios(){
try{
const res=await fetch(BASE+"prometeo/site/spaces.json",{cache:"no-store"});if(!res.ok)throw Error("No se pudo consultar estudios.");
const json=await res.json();if(json.schema!=="prometeo/public-studios/v1"||!Array.isArray(json.studios))throw Error("Índice incompatible.");
for(const s of json.studios){
if(!s||typeof s.name!=="string")continue;
const card=element("article","studio");card.append(element("h3","",s.name),element("p","",s.subtitle||s.view_status||""));
if(typeof s.public_view==="string"&&/^prometeo\/[a-z0-9/-]+\/$/.test(s.public_view)){
const a=element("a","","Abrir estudio ↗");a.href=BASE+s.public_view;a.target="_blank";a.rel="noopener noreferrer";card.appendChild(a);
}else{card.appendChild(element("span","no-link",s.view_status||"Sin galería publicada"));}
$("studios-list").appendChild(card);
}
}catch(err){$("studios-list").appendChild(element("p","fine","Otros estudios: índice público no disponible. Usá el portal general."));}
try{
const res=await fetch(BASE+"prometeo/3d-flow/w4/MANIFEST.json",{cache:"no-store"});if(res.ok){const m=await res.json();if(Array.isArray(m.tasks))$("3d-description").textContent=m.tasks.length+" encargos registrados en ola 004. Registro no equivale a obras terminadas.";}
}catch(_){}
}
async function checkNextWave(){
const label=$("next-wave-result");label.textContent="Consultando manifiesto público…";
try{
const res=await fetch(BASE+"prometeo/root/ui-lab/BATCH.json",{cache:"no-store"});if(!res.ok)throw Error("Sin manifiesto");
const next=await res.json();
if(next.briefSha256!==BRIEF){label.textContent="El manifiesto actual usa otro brief: no es comparable literalmente.";return;}
if(!next.method||next.method.sha256Canonical===ROOT){label.textContent="No hay todavía otra versión de ROOT en el manifiesto público actual.";return;}
label.textContent="Otra raíz pública detectada: "+String(next.method.version||"sin versión")+" · SHA "+String(next.method.sha256Canonical||"desconocido")+". Compará desde la galería fija.";
}catch(_){label.textContent="No se pudo verificar otra ola. No se presupone que exista.";}
}
function browserSmoke(){
const tests=[
["Diez slots en DOM",$("slots").children.length===10],
["IDs de ola bloqueados",BRIEF.length===64&&ROOT.length===64],
["Enlaces aislados",preview(5)===BASE+"prometeo/root/ui-lab/w1/5/"],
["10 etapas disponibles",STAGES.length===10],
["Exportación de 10 notas",makePacket().reviews.length===10],
["Sin iframe con same-origin",document.querySelector('iframe[sandbox~="allow-same-origin"]')===null]
];
const node=element("pre","",tests.map(t=>(t[1]?"PASS":"FAIL")+" · "+t[0]).join("\n"));node.style.cssText="padding:20px;border:1px solid;white-space:pre-wrap";document.querySelector("main").prepend(node);
}
initSelects();drawSlots();fillReview(1);reviewedCount();refreshComparison();checkPreviews();loadStudios();
$("refresh").addEventListener("click",checkPreviews);
$("preview-note").addEventListener("click",()=>{saveReview(true);fillReview(selected);$("revision").scrollIntoView({behavior:"smooth",block:"start"});});
$("review-version").addEventListener("change",function(){saveReview(true);fillReview(Number(this.value));});
$("review-form").addEventListener("submit",e=>{e.preventDefault();saveReview();});
$("review-images").addEventListener("change",function(){addImages(this.files,current);});
$("export").addEventListener("click",download);
$("import").addEventListener("change",async function(){try{await importReview(this.files[0]);}catch(err){report("Importación rechazada: "+err.message);}this.value="";});
$("next-wave").addEventListener("click",checkNextWave);
setInterval(()=>{if(document.visibilityState==="visible")checkPreviews();},90000);
if(new URLSearchParams(location.search).get("qa")==="1")browserSmoke();
})();
