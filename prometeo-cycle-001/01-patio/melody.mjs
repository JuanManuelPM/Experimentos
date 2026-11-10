
export const MELODY=Object.freeze(["amber","teal","coral"]);
export function advanceMelody(step,tone,completed=false){
 if(completed)return {step:MELODY.length,completed:true,status:"ALREADY_DONE"};
 if(!Number.isInteger(step)||step<0||step>=MELODY.length)step=0;
 if(tone!==MELODY[step])return {step:0,completed:false,status:"MISS"};
 const next=step+1;
 return next===MELODY.length
  ? {step:next,completed:true,status:"COMPLETE"}
  : {step:next,completed:false,status:"HIT"};
}
