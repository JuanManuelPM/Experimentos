let model=null;
let backend='wasm';
let initPromise=null;
let chain=Promise.resolve();

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

async function transcribe(msg){
  const m=await ensureModel();
  const pcm=new Float32Array(msg.pcm);
  const started=performance.now();
  const r=await m.transcribeLongAudio(pcm,16000,msg.options||{});
  self.postMessage({
    type:'result',
    id:msg.id,
    text:(r.text||r.utterance_text||'').trim(),
    ms:performance.now()-started
  });
}

self.onmessage=e=>{
  const msg=e.data||{};
  if(msg.type==='init'){
    chain=chain.then(()=>ensureModel()).catch(err=>{
      self.postMessage({type:'fatal',message:String(err&&err.message||err)});
    });
    return;
  }
  if(msg.type==='transcribe'){
    chain=chain.then(()=>transcribe(msg)).catch(err=>{
      self.postMessage({type:'error',id:msg.id,message:String(err&&err.message||err)});
    });
  }
};