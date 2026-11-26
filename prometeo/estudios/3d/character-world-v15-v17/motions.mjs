// Procedural motion recipes on the existing Character System V2 rig. Distinct movement intentions, not speed variants.
import {pose} from "../../../character-system-v2/models.mjs";
const C=x=>Math.max(0,Math.min(1,x)),S=x=>{x=C(x);return x*x*(3-2*x)},L=(a,b,t)=>a+(b-a)*t;
export const CLIPS=[
 ["idle",2.4,"Reposo"],["breath",3.2,"Respiración"],["weight",2.2,"Cambio de peso"],["walk",1.15,"Marcha"],["run",.8,"Carrera"],["start",1.3,"Arranque"],["brake",1.2,"Frenado"],["turn",1.4,"Giro"],["sit",1.8,"Sentarse"],["stand",1.8,"Levantarse"],["crouch",1.7,"Agacharse"],["reach",1.35,"Alcanzar"],["grab",.85,"Agarrar"],["release",.8,"Soltar"],["point",1.6,"Señalar"],["wave",2.5,"Saludar"],["gesture",2.8,"Gesticular"],["nod",1.25,"Asentir"],["shake",1.4,"Negar"],["react",1.3,"Reaccionar"],["lean",1.8,"Apoyarse"],["drink",2.8,"Beber"],["eat",2.1,"Comer"],["phone",2.4,"Teléfono"]
].map(([id,duration,label])=>({id,duration,label}));
export function motionSample(id,time){
 const clip=CLIPS.find(c=>c.id===id);if(!clip)throw Error("Unknown motion "+id);
 let u=C(time/clip.duration),w=Math.sin(u*Math.PI*2),pulse=Math.sin(Math.PI*u),p=pose(u,"idle"),r=p.rotations,drop=p.pelvisDrop,yaw=0;
 const set=(n,x=0,y=0,z=0)=>r[n]=[x,y,z];
 const blend=(mode,a)=>{let b=pose(u,mode);for(let n of Object.keys(b.rotations)){let x=r[n]||[0,0,0];r[n]=x.map((v,i)=>L(v,b.rotations[n][i],a))}drop=L(drop,b.pelvisDrop,a)};
 const arm=(s,a,b,twist=0)=>{let sign=s==="L"?1:-1;set("upperArm_"+s,-a,twist,-sign*.43);set("lowerArm_"+s,-b,0,0)};
 const fingers=(s,a)=>{for(let i=0;i<5;i++)for(let j=1;j<=2;j++)set("finger"+i+"_0"+j+"_"+s,a*(i===0?.45:1.05),0,0)};
 switch(id){
 case "idle":set("head",.02*w,.035*w,0);break;
 case "breath":set("spine",-.035*pulse,0,0);set("chest",-.055*pulse,0,0);set("clavicle_L",0,0,-.035*pulse);set("clavicle_R",0,0,.035*pulse);break;
 case "weight":set("pelvis",0,0,.075*w);set("spine",0,0,-.11*w);set("upperLeg_L",-.12*pulse,0,.07*w);set("upperLeg_R",.05*pulse,0,.04*w);break;
 case "walk":blend("walk",1);break;
 case "run":blend("walk",1);set("spine",.24,0,0);for(let [s,k] of [["L",1],["R",-1]]){set("upperLeg_"+s,-.86*w*k,0,0);set("lowerLeg_"+s,.18+1.2*Math.max(0,w*k),0,0);set("upperArm_"+s,-.22+.78*w*k,0,-k*.32);set("lowerArm_"+s,-1.0,0,0)}drop=.025+.06*Math.max(0,Math.cos(u*4*Math.PI));break;
 case "start":blend("walk",S(u));set("spine",.22*pulse,0,0);break;
 case "brake":blend("walk",1-S(u));set("spine",-.16*pulse,0,0);break;
 case "turn":blend("walk",.35*pulse);yaw=Math.PI/2*S(u);set("head",0,.32*pulse,0);set("chest",0,.14*pulse,0);break;
 case "sit":blend("sit",S(u));break;
 case "stand":blend("sit",1-S(u));set("spine",.33*pulse,0,0);break;
 case "crouch":blend("crouch",S(u));set("head",-.16*pulse,0,0);break;
 case "reach":arm("R",.95*S(u),.30*S(u),-.12);set("spine",.15*S(u),-.09*S(u),0);break;
 case "grab":arm("R",.75,.48);fingers("R",S(u));break;
 case "release":arm("R",.75,.48);fingers("R",1-S(u));break;
 case "point":arm("R",1.0*S(u),.12*S(u),-.08);fingers("R",.8*S(u));set("finger1_01_R",0,0,0);set("finger1_02_R",0,0,0);set("head",0,-.18*S(u),0);break;
 case "wave":arm("R",.75*pulse,1.65*pulse);set("hand_R",0,.65*Math.sin(u*Math.PI*6)*pulse,0);break;
 case "gesture":arm("R",.58*pulse,.8*pulse,-.24*w);arm("L",.50*pulse,.62*pulse,.21*w);set("head",.05*w,.13*w,0);break;
 case "nod":set("head",.28*Math.sin(u*4*Math.PI)*pulse,0,0);break;
 case "shake":set("head",0,.38*Math.sin(u*4*Math.PI)*pulse,0);break;
 case "react":set("spine",-.25*pulse,0,0);set("head",-.3*pulse,0,.07*pulse);arm("L",.55*pulse,.8*pulse);arm("R",.45*pulse,.65*pulse);break;
 case "lean":set("pelvis",0,0,.09*S(u));set("spine",.22*S(u),0,-.13*S(u));arm("R",.45*S(u),.16*S(u));break;
 case "drink":arm("R",.8*pulse,1.55*pulse);set("head",-.17*pulse,0,0);set("hand_R",-.38*pulse,0,0);fingers("R",pulse);break;
 case "eat":arm("R",1.05*pulse,1.35*pulse);set("head",.19*pulse,0,0);fingers("R",.8*pulse);break;
 case "phone":arm("R",.8*S(u),1.9*S(u),.35*S(u));set("head",0,-.14*S(u),.18*S(u));fingers("R",.65*S(u));break;
 }
 return {id,duration:clip.duration,rotations:r,pelvisDrop:drop,rootYaw:yaw};
}
