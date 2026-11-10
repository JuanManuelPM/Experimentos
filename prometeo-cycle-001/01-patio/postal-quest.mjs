// PATIO: one small, persistent, single-player social toy. No network or simulated people.
export const POSTAL_ROUTE=Object.freeze(["mora","tilo","luz"]);
export const POSTAL_NAMES=Object.freeze({mora:"Mora",tilo:"Tilo",luz:"Luz"});
export const POSTAL_SAVE_KEY="patio-postal-v1";
export function normalizePostal(q){
  const raw=Number(q?.step);
  const step=Number.isInteger(raw)?Math.min(3,Math.max(0,raw)):0;
  const completed=q?.completed===true;
  return {step:completed?3:step===3?0:step,active:!completed&&q?.active===true,completed};
}
export function postalHint(input){
  const q=normalizePostal(input);
  if(q.completed)return "✉ Reparto completo · la plaza tiene un secreto";
  if(q.active)return "✉ Carta "+(q.step+1)+"/3 · Entregásela a "+POSTAL_NAMES[POSTAL_ROUTE[q.step]];
  return "✉ Una misión te espera en el buzón";
}
export function advancePostal(input,targetId){
  const q=normalizePostal(input);
  if(targetId==="postbox"){
    if(q.completed)return {postal:q,status:"ALREADY_COMPLETE",next:null};
    if(q.active)return {postal:q,status:"REMINDER",next:POSTAL_ROUTE[q.step]};
    return {postal:{step:0,active:true,completed:false},status:"STARTED",next:POSTAL_ROUTE[0]};
  }
  if(!POSTAL_ROUTE.includes(targetId))return {postal:q,status:"NO_ACTION",next:q.active?POSTAL_ROUTE[q.step]:null};
  if(!q.active)return {postal:q,status:q.completed?"ALREADY_COMPLETE":"NOT_STARTED",next:null};
  const next=POSTAL_ROUTE[q.step];
  if(targetId!==next)return {postal:q,status:"WRONG_RECIPIENT",next};
  if(q.step===POSTAL_ROUTE.length-1)return {postal:{step:3,active:false,completed:true},status:"COMPLETED",next:null};
  return {postal:{step:q.step+1,active:true,completed:false},status:"DELIVERED",next:POSTAL_ROUTE[q.step+1]};
}
export function readPostal(store){
  try{return normalizePostal(JSON.parse(store?.getItem(POSTAL_SAVE_KEY)||"null"))}
  catch{return normalizePostal(null)}
}
export function writePostal(store,state){
  try{store?.setItem(POSTAL_SAVE_KEY,JSON.stringify(normalizePostal(state)));return Boolean(store)}
  catch{return false}
}
