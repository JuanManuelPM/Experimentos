const $=s=>document.querySelector(s);
const voice=$('#voiceButton'),prepare=$('#prepareButton'),send=$('#sendButton'),toggle=$('#shelfToggle'),drawer=$('#preparedShelf'),list=$('#shelfList');
if(voice){voice.title='Elegir voz';voice.setAttribute('aria-label','Elegir voz')}
if(prepare){prepare.title='Guardar para después';prepare.setAttribute('aria-label','Guardar para después')}
if(send){send.title='Enviar ahora';send.setAttribute('aria-label','Enviar ahora')}
if(toggle){const count=toggle.querySelector('b')?.textContent||'0';toggle.innerHTML=`<span class="srOnly">Guardados</span><b>${count}</b>`;toggle.title='Abrir mensajes guardados';toggle.setAttribute('aria-label','Abrir mensajes guardados')}
if(drawer){const title=drawer.querySelector('.shelfHead b'),sub=drawer.querySelector('.shelfHead span'),close=drawer.querySelector('.shelfClose');if(title)title.textContent='GUARDADOS';if(sub)sub.textContent='Una generación · reutilizables';if(close)close.textContent='CERRAR'}
let allowOpenUntil=0;
if(toggle&&drawer){toggle.onclick=()=>{allowOpenUntil=performance.now()+180;drawer.classList.toggle('open')};const clsObs=new MutationObserver(()=>{if(drawer.classList.contains('open')&&performance.now()>allowOpenUntil)drawer.classList.remove('open')});clsObs.observe(drawer,{attributes:true,attributeFilter:['class']})}
function polishShelf(){
 if(!list)return;
 const empty=list.querySelector('.shelfEmpty span');if(empty&&empty.textContent!=='Escribí algo y tocá el ícono de guardar.')empty.textContent='Escribí algo y tocá el ícono de guardar.';
 list.querySelectorAll('.preparedCard').forEach(card=>{
  const meta=card.querySelector('.preparedMeta');if(!meta||meta.dataset.v11==='1')return;
  const t=meta.textContent.trim(),m=t.match(/^ENVIADO\s+(\d+)/i);const next=m?`1 GENERACIÓN · REUTILIZADO ${m[1]} ${m[1]==='1'?'VEZ':'VECES'}`:'1 GENERACIÓN · REUTILIZABLE';
  if(meta.textContent!==next)meta.textContent=next;meta.dataset.v11='1';
 });
}
polishShelf();if(list)new MutationObserver(polishShelf).observe(list,{childList:true,subtree:true});
if(voice){const updateVoiceTitle=()=>{const n=voice.textContent.trim();voice.title=n&&n!=='Voz'?`Voz: ${n}`:'Elegir voz';voice.setAttribute('aria-label',voice.title)};updateVoiceTitle();new MutationObserver(updateVoiceTitle).observe(voice,{childList:true,characterData:true,subtree:true})}
const style=document.createElement('style');style.textContent='.srOnly{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}';document.head.append(style);
