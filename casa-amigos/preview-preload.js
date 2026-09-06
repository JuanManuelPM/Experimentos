const AUDIO_API='https://catnohyouxqjjtseaueb.supabase.co/functions/v1/casa-room-audio';
const VOICE_IDS=['sergeant','otaku','grandma','goblin','giant','evilkid','apocalypse','novela','witch','gamer','barman','fairy'];
const cache=new Map();
const url=(id,intro=false)=>`${AUDIO_API}?id=${encodeURIComponent(`${intro?'preview-intro':'preview'}-v1-${id}`)}`;
function getBlob(u){if(!cache.has(u))cache.set(u,fetch(u,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(String(r.status));return r.blob()}).catch(e=>{cache.delete(u);throw e}));return cache.get(u)}
let ctx=null;
async function play(blob){ctx=ctx||new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')await ctx.resume();const ab=await blob.arrayBuffer(),buf=await ctx.decodeAudioData(ab.slice(0));await new Promise(resolve=>{const s=ctx.createBufferSource();s.buffer=buf;s.connect(ctx.destination);s.onended=resolve;s.start()})}
let chain=Promise.resolve();
function preload(){let delay=0;for(const id of VOICE_IDS){for(const u of [url(id,true),url(id,false)]){setTimeout(()=>getBlob(u).catch(()=>{}),delay);delay+=45}}}
setTimeout(preload,500);
document.addEventListener('click',e=>{
 const btn=e.target.closest?.('.previewVoice');if(!btn)return;
 const rows=[...document.querySelectorAll('#voiceList .voiceRow')],row=btn.closest('.voiceRow'),i=rows.indexOf(row),id=VOICE_IDS[i];if(!id)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(btn.dataset.fixedPreviewBusy)return;btn.dataset.fixedPreviewBusy='1';btn.classList.add('busy');
 const run=chain.then(async()=>{await play(await getBlob(url(id,true)));await play(await getBlob(url(id,false)))});
 chain=run.catch(()=>{});run.catch(()=>{}).finally(()=>{delete btn.dataset.fixedPreviewBusy;btn.classList.remove('busy');btn.textContent='▶'});
},true);
