export const CAR={width:3.16,length:12.8,aisleWidth:1,floorY:0.06,ceilingY:2.82};
export function seatLayout({rows=6,spacing=1.5,start=3.55,seatX=1.17,empty="L4"}={}){
 if(!Number.isInteger(rows)||rows<2||rows>12||spacing<1.1||seatX<.9||seatX>1.3)throw Error("invalid layout");
 let a=[];for(let i=0;i<rows;i++)for(const side of ["L","R"]){const id=side+i;a.push({id,side,row:i,x:side==="L"?-seatX:seatX,z:start-i*spacing,yaw:side==="L"?Math.PI/2:-Math.PI/2,forward:side==="L"?[1,0,0]:[-1,0,0],vacant:id===empty})}return a;
}
export function validateClearance(seats,car=CAR){
 let e=[];if(new Set(seats.map(s=>s.id)).size!==seats.length)e.push("DUPLICATE_ID");
 for(const s of seats){if(Math.abs(s.x)<car.aisleWidth/2+.30)e.push("BLOCKED_AISLE");if(Math.abs(s.z)>car.length/2-.9)e.push("BLOCKED_DOOR");}
 for(let i=0;i<seats.length;i++)for(let j=i+1;j<seats.length;j++)if(Math.hypot(seats[i].x-seats[j].x,seats[i].z-seats[j].z)<1)e.push("OVERLAP");return [...new Set(e)];
}
