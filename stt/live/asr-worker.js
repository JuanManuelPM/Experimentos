let model=null;
let backend='wasm';
let initPromise=null;
let busy=false;
let seq=0;
const queue=[];

async function ensureModel(){
  if(model)return model;
  if(initPromise)return initPromise;
  initPromise=(async()=>{
    const mod=await import('https://cdn.jsdelivr.net/npm/parakeet.js@1.4.4/+esm');
    const candidates=(self.navigator&&self.navigator.gpu)?['webgpu','wasm']:['wasm'];
    let lastError=null;
    for(const candidate of candidates){
      try{
        const m=await mod.fromHub('parakeet-tdt-0.6b-v3',{
          backend:candidate,
          encoderQuant:candidate==='webgpu'?'fp32':'int8',
          decoderQuant:'int8',
          preprocessorBackend:'js'
        });
        model=m;backend=candidate;
        self.postMessage({type:'ready',backend});
        return model;
      }catch(err){lastError=err}
    }
    throw lastError||new Error('No se pudo inicializar Parakeet');
  })();
  try{return await initPromise}
  catch(err){initPromise=null;throw err}
}

function weight(priority){
  if(priority==='live')return 0;
  if(priority==='draft')return 1;
  if(priority==='quality')return 2;
  if(priority==='normal')return 3;
  return 4;
}

async function processNext(){
  if(busy||!queue.length)return;
  busy=true;
  queue.sort((a,b)=>weight(a.msg.priority)-weight(b.msg.priority)||a.seq-b.seq);
  const item=queue.shift(),msg=item.msg;
  try{
    const m=await ensureModel();
    const pcm=new Float32Array(msg.pcm);
    const started=performance.now();
    const r=await m.transcribeLongAudio(pcm,16000,msg.options||{});
    self.postMessage({
      type:'result',
      id:msg.id,
      text:(r.text||r.utterance_text||'').trim(),
      ms:performance.now()-started,
      priority:msg.priority||'normal'
    });
  }catch(err){
    self.postMessage({type:'error',id:msg.id,message:String(err&&err.message||err)});
  }finally{
    busy=false;
    processNext();
  }
}

self.onmessage=e=>{
  const msg=e.data||{};
  if(msg.type==='init'){
    ensureModel().catch(err=>{
      self.postMessage({type:'fatal',message:String(err&&err.message||err)});
    });
    return;
  }
  if(msg.type==='transcribe'){
    queue.push({msg,seq:++seq});
    processNext();
  }
};