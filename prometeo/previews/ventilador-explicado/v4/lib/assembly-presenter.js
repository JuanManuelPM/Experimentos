/* PROMETEO · Technical Assembly Presenter 0.2.0 · original · MIT */
(function(root){'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
 const lerp=(a,b,t)=>a+(b-a)*t;
 function createPresenter(spec){
  if(!spec||!Array.isArray(spec.parts)||!spec.parts.length)throw Error('parts required');
  const ids=new Set();
  for(const p of spec.parts){if(!p.id||ids.has(p.id)||!Array.isArray(p.explode)||p.explode.length!==3||p.explode.some(v=>!Number.isFinite(v)))throw Error('invalid part');ids.add(p.id)}
  const count=spec.parts.length, stages=spec.stages||['general','exploded','detail','assembly','operating'];
  let stage=0,selection=null,isolate=false,phase=0,playing=false,elapsed=0,explodeScale=1;
  const order=spec.assemblyOrder||spec.parts.map(p=>p.id);
  function setStage(n){stage=clamp(Math.round(n),0,stages.length-1);elapsed=0;playing=stage===3;return stage}
  function state(){return {stage,stageName:stages[stage],selection,isolate,playing,phase,elapsed,explodeScale,count}}
  function select(id){selection=id&&ids.has(id)?id:null;return selection}
  function toggleIsolate(){isolate=!isolate;return isolate}
  function setPlaying(v){playing=!!v}
  function update(dt){dt=clamp(Number(dt)||0,0,.15);elapsed+=dt;if(stage===3&&playing){phase+=dt/9.6;if(phase>=1){phase=1;playing=false}}if(stage!==3)phase=0;return state()}
  function resetAssembly(){phase=0;elapsed=0;playing=true;setStage(3)}
  function pose(id){const p=spec.parts.find(p=>p.id===id);if(!p)return null;
   let t=(stage===1||stage===2)?1:stage===3?1-smooth(phase*order.length-order.indexOf(id)):0;
   if(stage===3&&!order.includes(id))t=0;
   return {position:p.explode.map(x=>x*t*explodeScale),alpha:isolate&&selection&&selection!==id?.06:(stage===2&&selection&&selection!==id?.18:1),highlight:selection===id,explodeFactor:t};
  }
  function setExplodeScale(value){explodeScale=clamp(Number(value)||1,.5,2);return explodeScale}
  function setIsolate(value){isolate=!!value;return isolate}
  function snapshot(){return {schema:'prometeo.tech-scene-state/v1',stage,selection,isolate,phase,explodeScale}}
  function restore(s){if(!s||s.schema!=='prometeo.tech-scene-state/v1')return false;setStage(s.stage);select(s.selection);isolate=!!s.isolate;phase=clamp(s.phase||0,0,1);explodeScale=clamp(Number(s.explodeScale)||1,.5,2);playing=false;return true}
  return {parts:spec.parts.slice(),stages:stages.slice(),state,setStage,select,toggleIsolate,setIsolate,setExplodeScale,setPlaying,update,resetAssembly,pose,snapshot,restore};
 }
 root.AssemblyKit={createPresenter,clamp,smooth,lerp,version:'0.2.0'};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.AssemblyKit;
})(typeof globalThis!=='undefined'?globalThis:this);
