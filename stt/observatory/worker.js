let model=null;
let workerId=null;

function words(s){return String(s||"").trim().split(/\s+/).filter(Boolean).length}

self.onmessage=async (e)=>{
  const m=e.data||{};
  if(m.kind==="init"){
    workerId=m.workerId;
    const t0=performance.now();
    try{
      const mod=await import("https://cdn.jsdelivr.net/npm/parakeet.js@1.4.4/+esm");
      const backend=m.backend||"wasm";
      model=await mod.fromHub("parakeet-tdt-0.6b-v3",{
        backend,
        encoderQuant:backend==="webgpu"?"fp32":"int8",
        decoderQuant:"int8",
        preprocessorBackend:"js"
      });
      postMessage({kind:"ready",workerId,init_ms:performance.now()-t0,backend});
    }catch(err){
      postMessage({kind:"error",workerId,error:String(err?.message||err)});
    }
    return;
  }
  if(m.kind==="job"){
    const t0=performance.now();
    try{
      const pcm=new Float32Array(m.pcm);
      const r=await model.transcribeLongAudio(pcm,16000,{
        returnTimestamps:false,
        returnConfidences:false,
        chunkLengthS:m.innerChunkS||m.audioSeconds,
        timeOffset:m.start
      });
      const text=r.text||r.utterance_text||"";
      postMessage({
        kind:"result",
        id:m.id,
        workerId,
        blockIndex:m.blockIndex,
        start:m.start,
        end:m.end,
        text,
        words:words(text),
        infer_ms:performance.now()-t0
      });
    }catch(err){
      postMessage({kind:"joberror",id:m.id,workerId,blockIndex:m.blockIndex,error:String(err?.message||err)});
    }
  }
};