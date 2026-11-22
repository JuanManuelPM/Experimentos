/** Reusable variable-font axis engine. No DOM, fonts, timers or network dependencies. */
export const AXES=Object.freeze({
 wght:Object.freeze({min:100,max:900,step:1,default:720,label:"Peso"}),
 opsz:Object.freeze({min:9,max:144,step:1,default:120,label:"Tamaño óptico"}),
 SOFT:Object.freeze({min:0,max:100,step:1,default:70,label:"Suavidad"}),
 WONK:Object.freeze({min:0,max:1,step:1,default:1,label:"Rareza"})
});
export const TAGS=Object.freeze(Object.keys(AXES));
export const PRESETS=Object.freeze({
 pulso:Object.freeze({wght:720,opsz:120,SOFT:70,WONK:1}),
 filo:Object.freeze({wght:900,opsz:144,SOFT:0,WONK:0}),
 neblina:Object.freeze({wght:300,opsz:28,SOFT:100,WONK:1})
});
export function clampAxis(tag,value){
 if(!Object.prototype.hasOwnProperty.call(AXES,tag))throw new RangeError("Eje desconocido: "+String(tag));
 const axis=AXES[tag], number=Number(value);
 if(value===null||value===undefined||value===""||!Number.isFinite(number))return axis.default;
 const limited=Math.max(axis.min,Math.min(axis.max,number));
 return Math.min(axis.max,Math.max(axis.min,axis.min+Math.round((limited-axis.min)/axis.step)*axis.step));
}
export function normalizeAxes(input={}){
 return Object.fromEntries(TAGS.map(tag=>[tag,clampAxis(tag,input?.[tag]??AXES[tag].default)]));
}
export function fontSettings(input){
 const values=normalizeAxes(input);
 return TAGS.map(tag=>'"'+tag+'" '+values[tag]).join(", ");
}
export function interpolateAxes(from,to,progress){
 const a=normalizeAxes(from),b=normalizeAxes(to),t=Math.max(0,Math.min(1,Number.isFinite(+progress)?Number(progress):0));
 return Object.fromEntries(TAGS.map(tag=>[tag,clampAxis(tag,a[tag]+(b[tag]-a[tag])*t)]));
}
export function createAxisEngine(seed=PRESETS.pulso){
 let state=normalizeAxes(seed);const listeners=new Set();
 function emit(){const snapshot={...state};for(const fn of listeners)fn(snapshot);return snapshot}
 return Object.freeze({
 get:()=>({...state}),
 setAxis:(tag,value)=>{state={...state,[tag]:clampAxis(tag,value)};return emit()},
 setAll:(values)=>{state=normalizeAxes(values);return emit()},
 subscribe:(fn)=>{if(typeof fn!=="function")throw new TypeError("Listener inválido");listeners.add(fn);return()=>listeners.delete(fn)},
 css:()=>fontSettings(state)
 });
}
export const MOTION_FRAMES=Object.freeze([
 Object.freeze({name:"PULSO",position:0,axes:PRESETS.pulso}),
 Object.freeze({name:"FILO",position:0.34,axes:PRESETS.filo}),
 Object.freeze({name:"NEBLINA",position:0.68,axes:PRESETS.neblina}),
 Object.freeze({name:"PULSO",position:1,axes:PRESETS.pulso})
]);
export function motionAt(position){
 const t=Math.max(0,Math.min(1,Number.isFinite(+position)?Number(position):0));
 let i=0;while(i<MOTION_FRAMES.length-2 && t>MOTION_FRAMES[i+1].position)i++;
 const a=MOTION_FRAMES[i],b=MOTION_FRAMES[i+1],relative=(t-a.position)/(b.position-a.position),ease=relative*relative*(3-2*relative);
 return {axes:interpolateAxes(a.axes,b.axes,ease),name:a.name+" → "+b.name};
}
