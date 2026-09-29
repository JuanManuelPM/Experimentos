let model=null;
self.onmessage=async e=>{
  const m=e.data||{};
  if(m.kind==="init"){
    const t=performance.now();
    try{
      const mod=await import("https://cdn.jsdelivr.net/npm/parakeet.js@1.4.4/+esm");
      model=await mod.fromHub("parakeet-tdt-0.6b-v3",{
        backend:m.backend||"wasm",
        encoderQuant:"int8",
        decoderQuant:"int8",
        preprocessorBackend:"js"
      });
      postMessage({kind:"ready",load_ms:performance.now()-t});
    }catch(err){postMessage({kind:"error",stage:"init",error:String(err?.message||err)})}
    return;
  }
  if(m.kind==="job"){
    const workerReceivedEpoch=Date.now(), t=performance.now();
    try{
      const pcm=new Float32Array(m.pcm);
      const r=await model.transcribeLongAudio(pcm,16000,{
        returnTimestamps:false,
        chunkLengthS:m.chunkS||30,
        timeOffset:m.start||0
      });
      const infer_ms=performance.now()-t;
      postMessage({
        kind:"result",jobId:m.jobId,start:m.start,end:m.end,
        text:r.text||r.utterance_text||"",infer_ms,
        worker_delivery_ms:Math.max(0,workerReceivedEpoch-(m.runnerSentEpoch||workerReceivedEpoch)),
        worker_result_epoch:Date.now()
      });
    }catch(err){postMessage({kind:"error",stage:"job",jobId:m.jobId,error:String(err?.message||err)})}
  }
};