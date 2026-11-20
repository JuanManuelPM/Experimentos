export const PROFILES=[
["ines",0xc48b6c,0x3a6374,0x292322,0,0.91,"newspaper"],
["raul",0x976346,0x80603c,0x282b2a,1,1.18,"satchel"],
["flora",0xe3b38b,0xa34a40,0x653b26,2,.86,"book"],
["dario",0x895d47,0x576175,0x17191c,3,1.05,"none"],
["elena",0xc78f70,0x74745e,0x625954,4,1.10,"bag"],
["tomas",0xda9d7a,0x52714a,0x463021,1,.98,"paper"],
["mila",0x765341,0xcfa454,0x151820,2,.88,"bag"],
["oscar",0xc58f70,0x684a65,0xb2a28c,4,1.22,"cane"],
["luz",0xae795b,0x546d68,0x30211e,0,.94,"book"]
].map(([id,skin,coat,hair,hairStyle,shape,accessory])=>({id,skin,coat,hair,hairStyle,shape,accessory}));
export function populateSeats(seats,{profiles=PROFILES,count=profiles.length}={}){
 const occupied=seats.filter(s=>!s.vacant), ordering=[0,4,7,10,1,5,8,2,9];
 if(occupied.length<count)throw Error("insufficient seating");
 const order=[...new Set([...ordering.filter(i=>i<occupied.length),...occupied.map((_,i)=>i)])];return profiles.slice(0,count).map((p,i)=>({...p,seatId:occupied[order[i]].id}));
}
export function assertCrowd(p,seats){
 let ids=new Set(seats.map(s=>s.id)),taken=new Set(),errors=[];
 for(const x of p){if(!ids.has(x.seatId))errors.push("MISSING_SEAT");if(taken.has(x.seatId))errors.push("DUPLICATE_OCCUPANT");taken.add(x.seatId);}
 if(new Set(p.map(x=>x.coat)).size<Math.min(6,p.length))errors.push("CLONE_PALETTE");return errors;
}
