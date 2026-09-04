import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.114.0/+esm';

const URL='https://catnohyouxqjjtseaueb.supabase.co';
const KEY='sb_publishable_eqh3PngXs4UjLLWiY3pz1w_nhHtf7X-';
const ROOM='casa-amigos-v1';

const VOICE_PRESETS={
  normal:{label:'Normal',rate:1,pitch:1},
  grave:{label:'Grave',rate:.92,pitch:.68},
  aguda:{label:'Aguda',rate:1.04,pitch:1.55},
  robot:{label:'Robot',rate:.82,pitch:.52},
  rapida:{label:'Rápida',rate:1.38,pitch:1.06},
  lenta:{label:'Lenta',rate:.72,pitch:.93}
};

const supabase=createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const $=s=>document.querySelector(s);
const el={
  join:$('#joinView'),chat:$('#chatView'),nameForm:$('#nameForm'),name:$('#nameInput'),joinError:$('#joinError'),
  form:$('#messageForm'),input:$('#messageInput'),send:$('#sendButton'),speakDraft:$('#speakDraft'),
  walkieToggle:$('#walkieToggle'),voicePresets:$('#voicePresets'),messages:$('#messages'),empty:$('#empty'),
  people:$('#people'),count:$('#onlineCount'),mobileCount:$('#mobileCount'),status:$('#status'),leave:$('#leaveButton')
};

let channel=null,connected=false,currentName='',lastSend=0,walkieEnabled=true,selectedPreset='normal',voices=[];
const clientId=sessionStorage.getItem('casa_client_id')||crypto.randomUUID();
sessionStorage.setItem('casa_client_id',clientId);
el.name.value=localStorage.getItem('casa_name')||'';
selectedPreset=localStorage.getItem('casa_voice_preset')||'normal';
if(!VOICE_PRESETS[selectedPreset])selectedPreset='normal';

const clean=v=>v.replace(/\s+/g,' ').trim().slice(0,24);
const initials=n=>n.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'?';
const speechSupported='speechSynthesis'in window&&'SpeechSynthesisUtterance'in window;

function color(v){
  let h=0;
  for(const c of v)h=c.charCodeAt(0)+((h<<5)-h);
  return`hsl(${Math.abs(h)%360} 38% 48%)`;
}

function setStatus(ok,text){
  connected=ok;
  el.status.classList.toggle('online',ok);
  el.status.querySelector('span').textContent=text;
  el.input.disabled=!ok;
  el.send.disabled=!ok;
  el.speakDraft.disabled=!ok||!speechSupported;
  if(ok)queueMicrotask(()=>el.input.focus());
}

function time(iso){
  return new Intl.DateTimeFormat('es-AR',{hour:'2-digit',minute:'2-digit'}).format(new Date(iso));
}

function loadVoices(){
  if(!speechSupported)return;
  voices=window.speechSynthesis.getVoices()||[];
}

function spanishVoice(){
  loadVoices();
  return voices.find(v=>/^es-AR$/i.test(v.lang))
    ||voices.find(v=>/^es-(419|MX|US)$/i.test(v.lang))
    ||voices.find(v=>/^es(?:-|_)/i.test(v.lang))
    ||voices.find(v=>/^es$/i.test(v.lang))
    ||null;
}

function presetOf(id){
  return VOICE_PRESETS[id]||VOICE_PRESETS.normal;
}

function speakText(text,{preset='normal',interrupt=false,button=null,announceName=''}={}){
  if(!speechSupported||!text?.trim())return false;
  const synth=window.speechSynthesis;
  if(interrupt)synth.cancel();

  const cfg=presetOf(preset);
  const spoken=announceName?`${announceName} dice. ${text.trim()}`:text.trim();
  const utterance=new SpeechSynthesisUtterance(spoken.slice(0,560));
  utterance.lang='es-AR';
  utterance.rate=cfg.rate;
  utterance.pitch=cfg.pitch;
  utterance.volume=1;

  const voice=spanishVoice();
  if(voice)utterance.voice=voice;

  utterance.onstart=()=>button?.classList.add('speaking');
  const done=()=>button?.classList.remove('speaking');
  utterance.onend=done;
  utterance.onerror=done;

  synth.speak(utterance);
  return true;
}

function updatePresetUI(){
  for(const b of el.voicePresets.querySelectorAll('[data-preset]')){
    const chosen=b.dataset.preset===selectedPreset;
    b.classList.toggle('selected',chosen);
    b.setAttribute('aria-pressed',String(chosen));
  }
}

function updateWalkieUI(){
  el.walkieToggle.classList.toggle('active',walkieEnabled);
  el.walkieToggle.setAttribute('aria-pressed',String(walkieEnabled));
  el.walkieToggle.querySelector('span').textContent=walkieEnabled?'🔊':'🔇';
  el.walkieToggle.querySelector('b').textContent=walkieEnabled?'Walkie':'Mute';
  el.walkieToggle.title=walkieEnabled?'Silenciar el walkie':'Activar el walkie';
}

function addMessage(m){
  if(!m||typeof m.text!=='string'||typeof m.name!=='string')return;

  const text=m.text.trim().slice(0,500);
  const name=clean(m.name);
  const voicePreset=VOICE_PRESETS[m.voicePreset]?m.voicePreset:'normal';
  if(!text||!name)return;

  el.empty?.remove();
  const isMine=m.clientId===clientId;
  const row=document.createElement('article');
  row.className='message'+(isMine?' mine':'');

  const avatar=document.createElement('div');
  avatar.className='avatar';
  avatar.style.background=color(m.clientId||name);
  avatar.textContent=initials(name);

  const body=document.createElement('div');
  body.className='body';

  const meta=document.createElement('div');
  meta.className='meta';

  const who=document.createElement('b');
  who.textContent=isMine?'Vos':name;

  const when=document.createElement('span');
  when.textContent=time(m.sentAt||new Date().toISOString());

  const voiceTag=document.createElement('span');
  voiceTag.className='voiceTag';
  voiceTag.textContent=presetOf(voicePreset).label;

  const replay=document.createElement('button');
  replay.className='speakMessage';
  replay.type='button';
  replay.textContent='▶';
  replay.setAttribute('aria-label',`Repetir mensaje de ${isMine?'vos':name}`);
  replay.title=`Repetir con voz ${presetOf(voicePreset).label.toLowerCase()}`;
  replay.disabled=!speechSupported;
  replay.addEventListener('click',()=>speakText(text,{preset:voicePreset,interrupt:true,button:replay,announceName:name}));

  meta.append(who,when,voiceTag,replay);

  const bubble=document.createElement('div');
  bubble.className='bubble';
  bubble.textContent=text;

  body.append(meta,bubble);
  row.append(avatar,body);
  el.messages.append(row);

  while(el.messages.querySelectorAll('.message').length>100){
    el.messages.querySelector('.message')?.remove();
  }
  el.messages.scrollTop=el.messages.scrollHeight;

  if(walkieEnabled){
    speakText(text,{preset:voicePreset,interrupt:false,announceName:name});
  }
}

function renderPeople(){
  if(!channel)return;
  const seen=new Map();

  for(const item of Object.values(channel.presenceState()).flat()){
    if(item?.clientId&&item?.name){
      seen.set(item.clientId,{clientId:item.clientId,name:clean(item.name)});
    }
  }

  const list=[...seen.values()].sort((a,b)=>
    a.clientId===clientId?-1:
    b.clientId===clientId?1:
    a.name.localeCompare(b.name,'es')
  );

  el.people.replaceChildren();

  for(const p of list){
    const row=document.createElement('div');
    row.className='person'+(p.clientId===clientId?' me':'');

    const avatar=document.createElement('div');
    avatar.className='avatar';
    avatar.style.background=color(p.clientId);
    avatar.textContent=initials(p.name);

    const txt=document.createElement('div');
    txt.className='personText';

    const b=document.createElement('b');
    b.textContent=p.name;

    const s=document.createElement('span');
    s.textContent=p.clientId===clientId?'vos':'escuchando';

    txt.append(b,s);

    const dot=document.createElement('i');
    dot.className='dot';

    row.append(avatar,txt,dot);
    el.people.append(row);
  }

  el.count.textContent=`${list.length} online`;
  el.mobileCount.textContent=`${list.length} online`;
}

async function enter(name){
  currentName=name;
  localStorage.setItem('casa_name',name);
  el.joinError.textContent='';
  el.join.classList.add('hidden');
  el.chat.classList.remove('hidden');
  setStatus(false,'Conectando…');

  if(speechSupported){
    loadVoices();
    window.speechSynthesis.resume();
  }

  channel=supabase.channel(ROOM,{
    config:{
      broadcast:{self:true,ack:true},
      presence:{key:clientId}
    }
  });

  channel
    .on('broadcast',{event:'message'},({payload})=>addMessage(payload))
    .on('presence',{event:'sync'},renderPeople)
    .subscribe(async status=>{
      if(status==='SUBSCRIBED'){
        const tracked=await channel.track({
          clientId,
          name:currentName,
          joinedAt:new Date().toISOString()
        });

        if(tracked!=='ok'){
          setStatus(false,'Error de presencia');
          return;
        }

        setStatus(true,'Conectado');
        renderPeople();
      }else if(status==='CHANNEL_ERROR'){
        setStatus(false,'Error de conexión');
      }else if(status==='TIMED_OUT'){
        setStatus(false,'Reintentando…');
      }else if(status==='CLOSED'){
        setStatus(false,'Desconectado');
      }
    });
}

async function leave(){
  setStatus(false,'Saliendo…');
  if(speechSupported)window.speechSynthesis.cancel();

  if(channel){
    try{await channel.untrack()}catch{}
    try{await supabase.removeChannel(channel)}catch{}
  }

  channel=null;
  el.people.replaceChildren();
  el.messages.replaceChildren();

  const empty=document.createElement('div');
  empty.id='empty';
  empty.className='empty';

  const b=document.createElement('b');
  b.textContent='Canal abierto.';

  const s=document.createElement('span');
  s.textContent='El próximo mensaje se va a escuchar acá.';

  empty.append(b,s);
  el.messages.append(empty);
  el.empty=empty;

  el.chat.classList.add('hidden');
  el.join.classList.remove('hidden');
  el.name.value=currentName;
  el.name.focus();
}

el.nameForm.addEventListener('submit',e=>{
  e.preventDefault();
  if(channel)return;

  const name=clean(el.name.value);
  if(!name){
    el.joinError.textContent='Poné un nombre para entrar.';
    return;
  }

  enter(name);
});

el.form.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!connected||!channel)return;

  const text=el.input.value.trim().slice(0,500);
  if(!text)return;

  const now=Date.now();
  if(now-lastSend<350)return;
  lastSend=now;

  const voicePreset=selectedPreset;
  el.input.value='';
  el.input.focus();

  const result=await channel.send({
    type:'broadcast',
    event:'message',
    payload:{
      id:crypto.randomUUID(),
      clientId,
      name:currentName,
      text,
      voicePreset,
      sentAt:new Date().toISOString()
    }
  });

  if(result!=='ok'){
    el.input.value=text;
    setStatus(false,'No se pudo enviar');
  }
});

el.speakDraft.addEventListener('click',()=>{
  speakText(el.input.value,{preset:selectedPreset,interrupt:true,button:el.speakDraft});
});

el.voicePresets.addEventListener('click',e=>{
  const button=e.target.closest('[data-preset]');
  if(!button)return;

  const preset=button.dataset.preset;
  if(!VOICE_PRESETS[preset])return;

  selectedPreset=preset;
  localStorage.setItem('casa_voice_preset',selectedPreset);
  updatePresetUI();

  if(speechSupported){
    speakText(`Esta es la voz ${VOICE_PRESETS[preset].label.toLowerCase()}.`,{
      preset,
      interrupt:true,
      button
    });
  }
});

el.walkieToggle.addEventListener('click',()=>{
  if(!speechSupported)return;

  walkieEnabled=!walkieEnabled;
  updateWalkieUI();

  if(!walkieEnabled){
    window.speechSynthesis.cancel();
  }else{
    speakText('Walkie activado.',{preset:'normal',interrupt:true});
  }
});

el.leave.addEventListener('click',leave);

el.mobileCount.addEventListener('click',()=>{
  const names=[...el.people.querySelectorAll('.personText b')].map(x=>x.textContent).join(', ');
  alert(names?`Online: ${names}`:'Todavía no hay nadie online.');
});

window.addEventListener('beforeunload',()=>{
  try{channel?.untrack()}catch{}
  try{window.speechSynthesis?.cancel()}catch{}
});

if(speechSupported){
  loadVoices();
  if('onvoiceschanged'in window.speechSynthesis){
    window.speechSynthesis.onvoiceschanged=loadVoices;
  }
}else{
  walkieEnabled=false;
  el.walkieToggle.disabled=true;
  el.walkieToggle.title='Este navegador no ofrece síntesis de voz';
  el.speakDraft.disabled=true;
}

updatePresetUI();
updateWalkieUI();
el.name.focus();
