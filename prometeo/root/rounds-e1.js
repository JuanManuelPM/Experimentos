(()=>{'use strict';
const $=id=>document.getElementById(id);
const E={round:null,active:1,notes:{},copied:{},status:[],images:[],review:'e1',capture:'e1',busy:false};
const num=n=>String(n).padStart(2,'0');
const create=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const storage=(key,value)=>{try{if(value===undefined)return localStorage.getItem(key);localStorage.setItem(key,value)}catch(e){}return null};
const parseStorage=(key)=>{try{return JSON.parse(storage(key)||'{}')||{}}catch(e){return {}}};
const toast=(m)=>{const t=$('toast');if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.hidden=true,1750)};
async function copy(v){try{await navigator.clipboard.writeText(v);return true}catch(e){const el=create('textarea');el.value=v;el.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.append(el);el.select();let ok=false;try{ok=document.execCommand('copy')}catch(e){}el.remove();return ok}}
const get=async name=>{const r=await fetch('./'+name+'?_='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json()};
function setToggle(name,value){document.querySelectorAll('[data-e1-toggle="'+name+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.target===value)))}
function selectReview(k){E.review=k;setToggle('review',k);$('review-e1').hidden=k!=='e1';$('review-w1').hidden=k!=='w1'}
function selectCapture(k){E.capture=k;setToggle('capture',k);$('e1-captures').hidden=k!=='e1';$('gallery').hidden=k!=='w1';$('capture-counter').hidden=k!=='w1';$('e1-capture-counter').hidden=k!=='e1';if(k==='e1')renderCaptures()}
function roundItems(){return E.round&&Array.isArray(E.round.items)?E.round.items:[]}
function item(n){return roundItems().find(x=>x.number===n)}
function selectedPrompt(n){return item(n)?.prompt||null}
function save(){E.notes[E.active]=$('e1-note').value;storage('root:e001:notes',JSON.stringify(E.notes))}
function choose(n){save();E.active=n;$('e1-note').value=E.notes[n]||'';$('e1-current').textContent=num(n);document.querySelectorAll('#e1-numbers button').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.n)===n)))}
function drawNumbers(){const host=$('e1-numbers');host.replaceChildren();for(let n=1;n<=10;n++){const b=create('button','',num(n));b.type='button';b.dataset.n=String(n);b.setAttribute('aria-pressed',String(n===E.active));b.addEventListener('click',()=>choose(n));host.append(b)}}
function state(n){return E.status[n-1]==='ready'?'ready':E.copied[n]?'copied':'none'}
function stateText(n){const s=state(n);if(s==='ready')return 'Publicado';if(s==='copied')return 'Copiado';return E.status[n-1]==='unknown'?'Sin comprobar':'Pendiente'}
function renderRound(){const host=$('e1-launchers');host.replaceChildren();const rows=roundItems();$('e1-launch-count').textContent=num(rows.length)+' / 10';
for(const r of rows){const card=create('article','e1-item'),head=create('div','e1-title'),idx=create('span','e1-index',num(r.number)),name=create('h2','e1-name',r.title),tag=create('span','e1-tag',r.axis.toUpperCase());head.append(idx,name,tag);
const acts=create('div','e1-actions'),b=create('button','','Copiar'),s=create('span','e1-state '+state(r.number),stateText(r.number));b.type='button';
b.addEventListener('click',async()=>{if(await copy(r.prompt)){E.copied[r.number]=true;storage('root:e001:copied',JSON.stringify(E.copied));s.className='e1-state '+state(r.number);s.textContent=stateText(r.number);toast(num(r.number)+' copiado')}else toast('No se pudo copiar')});
acts.append(b,s);if(E.status[r.number-1]==='ready'){const a=create('a','','Abrir ↗');a.href=r.previewURL;a.target='_blank';a.rel='noopener noreferrer';acts.append(a)}
card.append(head,acts);host.append(card)}
if(!rows.length)host.append(create('div','e1-empty','Sin lanzadores'))}
function imageFor(n){const x=E.images.find(v=>v.number===n);if(!x)return null;
if(x.assetPath&&/^prometeo\/root\/ui-lab\/e1\/(?:[1-9]|10)\/[a-z0-9_./-]+\.(?:png|jpg|webp)$/i.test(x.assetPath)&&x.assetPath.startsWith('prometeo/root/ui-lab/e1/'+n+'/')&&!x.assetPath.includes('..')){return new URL('../../'+x.assetPath,location.href).href}
if(x.screenshotUrl&&/^https:\/\/storage\.googleapis\.com\/firecrawl-scrape-media\//.test(x.screenshotUrl)&&(!x.expiresAt||Date.now()<Date.parse(x.expiresAt)))return x.screenshotUrl;return null}
function openCapture(n,url){const viewer=$('viewer');$('viewer-img').src=url;$('viewer-name').textContent=num(n);$('viewer-link').href=item(n)?.previewURL||'#';viewer.hidden=false;document.body.classList.add('viewer-open');$('viewer-scroll').scrollTop=0;$('viewer-close').focus()}
function renderCaptures(){if(E.capture!=='e1')return;const host=$('e1-capture-grid');host.replaceChildren();let count=0;
for(const r of roundItems()){const n=r.number,u=imageFor(n);if(!u)continue;count++;
const box=create('article','e1-shot'),media=create('button','e1-shot-figure');media.type='button';media.setAttribute('aria-label','Ver captura completa '+num(n));const img=create('img');img.src=u;img.alt='Captura completa versión '+num(n);img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.onerror=()=>{box.remove();count--;updateCount()};media.append(img);media.addEventListener('click',()=>openCapture(n,u));const foot=create('div','e1-shot-meta');foot.append(create('b','',num(n)));if(E.status[n-1]==='ready'){const a=create('a','','HTML ↗');a.href=r.previewURL;a.target='_blank';a.rel='noopener noreferrer';foot.append(a)}box.append(media,foot);host.append(box)}
function updateCount(){$('e1-capture-counter').textContent=num(count)+' / 10';$('e1-capture-empty').hidden=count>0}
updateCount();
const strip=$('e1-capture-strip');strip.replaceChildren();for(const r of roundItems()){const x=create('span','',num(r.number));x.title=stateText(r.number);x.style.cssText='color:'+(E.status[r.number-1]==='ready'?'var(--accent)':'var(--muted)')+';font-size:11px';strip.append(x)}
}
async function scan(){if(E.busy||!roundItems().length)return;E.busy=true;
try{const rows=roundItems();E.status=await Promise.all(rows.map(async r=>{const a=new AbortController(),t=setTimeout(()=>a.abort(),8500);try{const v=await fetch(r.previewURL+'?_='+Date.now(),{method:'HEAD',cache:'no-store',signal:a.signal});return v.ok?'ready':v.status===404?'pending':'unknown'}catch(e){return 'unknown'}finally{clearTimeout(t)}}));renderRound();await fetchImages()}finally{E.busy=false}}
async function fetchImages(){let central=[];try{const d=await get('E001_SNAPSHOTS.json');central=Array.isArray(d.items)?d.items:[]}catch(e){}
const ready=roundItems().filter(r=>E.status[r.number-1]==='ready');
const additional=await Promise.all(ready.map(async r=>{const a=new AbortController(),t=setTimeout(()=>a.abort(),6000);try{const u=new URL('CAPTURE.json',r.previewURL),response=await fetch(u.href+'?_='+Date.now(),{cache:'no-store',signal:a.signal});if(!response.ok)return null;const j=await response.json();return j.schema==='prometeo.root.capture/v1'&&j.number===r.number&&j.fullPage===true?j:null}catch(e){return null}finally{clearTimeout(t)}}));
const merge=new Map(central.filter(x=>Number.isInteger(x.number)&&x.number>=1&&x.number<=10).map(x=>[x.number,x]));
for(const x of additional)if(x)merge.set(x.number,x);
E.images=[...merge.values()];renderCaptures()}
async function init(){E.notes=parseStorage('root:e001:notes');E.copied=parseStorage('root:e001:copied');$('e1-note').value=E.notes[1]||'';drawNumbers();selectReview('e1');selectCapture('e1');
try{const data=await get('ROUNDS_E001.json');if(data.round!=='E001'||data.items?.length!==10||data.items.some((x,i)=>x.number!==i+1||!/^https:\/\/github\.com\/JuanManuelPM\/pruebas\/blob\//.test(x.prompt.split(' · ').pop())||!/^https:\/\/juanmanuelpm\.github\.io\/Experimentos\/prometeo\/root\/ui-lab\/e1\//.test(x.previewURL)))throw Error('invalid manifest');E.round=data;renderRound();await scan()}catch(e){$('e1-launchers').replaceChildren(create('div','e1-empty','Sin conexión al manifiesto'))}}
document.querySelectorAll('[data-e1-toggle]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.e1Toggle==='capture')selectCapture(b.dataset.target);else selectReview(b.dataset.target)}));
$('e1-note').addEventListener('input',save);
$('e1-copy').addEventListener('click',async()=>{save();const notes=Array.from({length:10},(_,i)=>({n:i+1,text:E.notes[i+1]||''})).filter(x=>x.text.trim()).map(x=>num(x.n)+': '+x.text.trim()).join('\n');const body='CALIBRAR · ROOT · E001\nRecuperá las diez trazas y capturas del experimento E001. Identificá causas por etapa y proponé una sola modificación compartida. No tocar el ROOT global ni iniciar E002 sin autorización.\n'+(notes||'Voy a enviarte las observaciones numeradas por audio o texto en ChatGPT.')+'\nRespondé en la página ROOT con un resumen publicable sin audio ni datos privados.';toast(await copy(body)?'CALIBRAR copiado':'No se pudo copiar')});
$('e1-export').addEventListener('click',()=>{save();const notes={schema:'prometeo.root.explore-review/v1',cohort:'root-explore-e001',notes:Array.from({length:10},(_,i)=>({number:i+1,text:E.notes[i+1]||''}))};const blob=new Blob([JSON.stringify(notes,null,2)],{type:'application/json'}),a=create('a');a.href=URL.createObjectURL(blob);a.download='root-e001-calibrar.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1200)});
$('e1-copy-all').addEventListener('click',async()=>toast(await copy(roundItems().map(x=>x.prompt).join('\n\n'))?'Diez prompts copiados':'No se pudo copiar'));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&E.round)scan()});
setInterval(()=>{if(!document.hidden&&E.round)scan()},120000);
init();
})();