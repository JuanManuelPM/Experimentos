let model=null;
self.onmessage=async(e)=>{
  const m=e.data;
  if(m.kind==="init"){
    try{
      const mod=await import("https://cdn.jsdelivr.net/npm/parakeet.js@1.4.4/+esm");
      model=await mod.fromHub("parakeet-tdt-0.6b-v3",{backend:"wasm",encoderQuant:"int8",decoderQuant:"int8",preprocessorBackend:"js"});
      postMessage({kind:"ready"});
    }catch(err){postMessage({kind:"error",error:String(err?.message||err)})}
    return;
  }
  if(m.kind==="job"){
    const t0=performance.now();
    try{
      const pcm=new Float32Array(m.pcm);
      const r=await model.transcribeLongAudio(pcm,16000,{returnTimestamps:false,chunkLengthS:m.chunkS,timeOffset:m.start});
      postMessage({kind:"result",id:m.id,index:m.index,start:m.start,end:m.end,text:r.text||r.utterance_text||"",ms:performance.now()-t0});
    }catch(err){postMessage({kind:"joberror",id:m.id,index:m.index,error:String(err?.message||err)})}
  }
};