export const profiles=[
  {
    "id": "P01",
    "h": 1.75,
    "shoulder": 0.205,
    "chest": 0.183,
    "waist": 0.137,
    "hip": 0.163,
    "depth": 0.113,
    "arm": 0.056,
    "thigh": 0.084,
    "calf": 0.057,
    "head": 0.087
  },
  {
    "id": "P02",
    "h": 1.62,
    "shoulder": 0.181,
    "chest": 0.161,
    "waist": 0.125,
    "hip": 0.177,
    "depth": 0.104,
    "arm": 0.047,
    "thigh": 0.087,
    "calf": 0.053,
    "head": 0.082
  },
  {
    "id": "P03",
    "h": 1.89,
    "shoulder": 0.242,
    "chest": 0.215,
    "waist": 0.177,
    "hip": 0.188,
    "depth": 0.139,
    "arm": 0.07,
    "thigh": 0.101,
    "calf": 0.072,
    "head": 0.094
  },
  {
    "id": "P04",
    "h": 1.7,
    "shoulder": 0.194,
    "chest": 0.19,
    "waist": 0.183,
    "hip": 0.207,
    "depth": 0.145,
    "arm": 0.063,
    "thigh": 0.105,
    "calf": 0.065,
    "head": 0.086
  },
  {
    "id": "P05",
    "h": 1.82,
    "shoulder": 0.195,
    "chest": 0.16,
    "waist": 0.116,
    "hip": 0.145,
    "depth": 0.093,
    "arm": 0.043,
    "thigh": 0.07,
    "calf": 0.048,
    "head": 0.084
  }
];
export const outfits=[
  {
    "id": "fire",
    "name": "BRASA",
    "outer": "#b79554",
    "under": "#293438",
    "lower": "#ab8c50",
    "boot": "#262c2b",
    "trim": "#d9ef74",
    "dark": "#514635",
    "metal": "#b9bec0",
    "clear": 0.028,
    "hem": 0.78,
    "gap": 0,
    "sleeve": 1,
    "bootTop": 0.31,
    "rough": 0.88
  },
  {
    "id": "medic",
    "name": "GUARDIA",
    "outer": "#e7e9e4",
    "under": "#427b78",
    "lower": "#3d7775",
    "boot": "#d9dfdf",
    "trim": "#b6c3c0",
    "dark": "#386363",
    "metal": "#c9d4d4",
    "clear": 0.019,
    "hem": 0.59,
    "gap": 0.3,
    "sleeve": 0.94,
    "bootTop": 0.1,
    "rough": 0.83
  },
  {
    "id": "space",
    "name": "ORBITAL",
    "outer": "#d5d9d5",
    "under": "#344653",
    "lower": "#d5d9d5",
    "boot": "#bcc5c7",
    "trim": "#b76539",
    "dark": "#3b4c58",
    "metal": "#9ca8ad",
    "clear": 0.048,
    "hem": 0.86,
    "gap": 0,
    "sleeve": 1,
    "bootTop": 0.26,
    "rough": 0.58
  },
  {
    "id": "medieval",
    "name": "SENDA",
    "outer": "#775b37",
    "under": "#827b56",
    "lower": "#4d5140",
    "boot": "#4d3628",
    "trim": "#c2a273",
    "dark": "#43392b",
    "metal": "#aa8751",
    "clear": 0.024,
    "hem": 0.59,
    "gap": 0.12,
    "sleeve": 0.92,
    "bootTop": 0.24,
    "rough": 0.95
  },
  {
    "id": "rain",
    "name": "LLUVIA",
    "outer": "#b49b38",
    "under": "#4c5451",
    "lower": "#343f41",
    "boot": "#303c3b",
    "trim": "#d2bd6a",
    "dark": "#4b5340",
    "metal": "#a7b0ae",
    "clear": 0.032,
    "hem": 0.67,
    "gap": 0,
    "sleeve": 1,
    "bootTop": 0.19,
    "rough": 0.4
  }
];
export function rig(p){
 const S=p.h/1.75,v=(x,y,z=0)=>[x,y*S,z],b=[];
 const add=(name,parent,position)=>b.push({name,parent,position});
 add("root",null,[0,0,0]);add("pelvis","root",v(0,.91));add("spine","pelvis",v(0,1.09));add("chest","spine",v(0,1.30));add("neck","chest",v(0,1.49));add("head","neck",v(0,1.57));
 for(const [side,s] of [["L",1],["R",-1]]){let a=p.shoulder,el=a+.145*S,wr=el+.145*S;
 add("clavicle_"+side,"chest",v(s*.052,1.40));add("upperArm_"+side,"clavicle_"+side,v(s*a,1.39));add("lowerArm_"+side,"upperArm_"+side,v(s*el,1.17));add("hand_"+side,"lowerArm_"+side,v(s*wr,.96));
 for(let f=0;f<5;f++){let x=s*(wr+.014*S);add("finger"+f+"_01_"+side,"hand_"+side,v(x,.92,.023-f*.012));add("finger"+f+"_02_"+side,"finger"+f+"_01_"+side,v(x+s*.015*S,.89,.023-f*.012));}
 let hip=p.hip*.52;add("upperLeg_"+side,"pelvis",v(s*hip,.86));add("lowerLeg_"+side,"upperLeg_"+side,v(s*hip,.48,.008));add("foot_"+side,"lowerLeg_"+side,v(s*hip,.085));add("toes_"+side,"foot_"+side,v(s*hip,.044,.118*S));}
 return b;
}

export function build(p,o){
 const S=p.h/1.75,bones=rig(p),B=Object.fromEntries(bones.map((b,i)=>[b.name,{...b,i}])),meshes=[],tau=2*Math.PI;
 const clamp=x=>Math.max(0,Math.min(1,x)),sm=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t,lerp=(a,b,t)=>a.map((x,i)=>mix(x,b[i],t));
 const norm=a=>{let l=Math.hypot(...a);return a.map(x=>x/l)},add=(a,b)=>a.map((x,i)=>x+b[i]),mul=(a,t)=>a.map(x=>x*t),sub=(a,b)=>a.map((x,i)=>x-b[i]);
 function weights(pairs){let q=pairs.filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=q.reduce((s,x)=>s+x[1],0);while(q.length<4)q.push(["root",0]);return [q.map(x=>B[x[0]].i),q.map(x=>x[1]/sum)]}
 const rigid=n=>()=>weights([[n,1]]);
 function tw(v){let y=v[1]/S;if(y<.93){let t=sm((.93-y)/.28),l=sm((v[0]/p.hip+1)/2);return weights([["pelvis",1-t],["upperLeg_L",t*l],["upperLeg_R",t*(1-l)]])}if(y<1.17){let t=sm((y-.93)/.24);return weights([["pelvis",1-t],["spine",t]])}let t=sm((y-1.17)/.22);return weights([["spine",1-t],["chest",t]])}
 function lw(side,t,arm){let names=arm?["upperArm_","lowerArm_","hand_"]:["upperLeg_","lowerLeg_","foot_"],a=sm((t-.32)/.34),b=sm((t-.85)/.18);return weights([[names[0]+side,1-a],[names[1]+side,a*(1-b)],[names[2]+side,a*b]])}
 function mesh(name,slot,color,rough=.8,metal=0){let m={name,slot,color,rough,metal,positions:[],uv:[],indices:[],joints:[],weights:[]};meshes.push(m);return m}
 function vertex(m,v,w,u=0,t=0){let n=m.positions.length/3;m.positions.push(...v);m.uv.push(u,t);m.joints.push(...w[0]);m.weights.push(...w[1]);return n}
 function quad(m,a,b,c,d){m.indices.push(a,b,d,b,c,d)}
 function grid(m,rows,cols,fn,wf,wrap=true,thick=0){let ids=[];for(let j=0;j<=rows;j++){let r=[];for(let i=0;i<(wrap?cols:cols+1);i++){let u=i/cols,t=j/rows,v=fn(u,t);r.push(vertex(m,v,wf(v,u,t),u,t))}ids.push(r)}
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){let k=wrap?(i+1)%cols:i+1;quad(m,ids[j][i],ids[j][k],ids[j+1][k],ids[j+1][i])}
 if(thick)for(const t of [0,1]){let r=ids[t?rows:0],pts=r.map(i=>m.positions.slice(i*3,i*3+3)),center=pts.reduce((s,v)=>add(s,v),[0,0,0]).map(x=>x/pts.length),q=pts.map((v,i)=>{let d=sub(center,v),v2=add(v,mul(d,Math.min(.18,thick/Math.max(.001,Math.hypot(...d)))));return vertex(m,v2,wf(v2,i/cols,t),i/cols,t)});for(let i=0;i<cols;i++){let k=wrap?(i+1)%cols:i+1;quad(m,r[i],r[k],q[k],q[i])}}
 return ids}
 const curves=[[.52,p.hip,p.depth],[.86,p.hip,p.depth],[.96,p.waist*1.07,p.depth],[1.10,p.waist,p.depth],[1.24,p.chest*.94,p.depth*1.03],[1.36,p.chest,p.depth],[1.42,p.shoulder,p.depth*.83],[1.48,.076,.063],[1.50,.066,.057]];
 function radius(y){let i=curves.findIndex(r=>r[0]>=y);if(i<=0)return curves[i<0?curves.length-1:0].slice(1);let a=curves[i-1],b=curves[i],t=(y-a[0])/(b[0]-a[0]);return [mix(a[1],b[1],t),mix(a[2],b[2],t)]}
 function cp(y,a,c,fold=.004,extra=0){let [rx,rz]=radius(y),f=fold*(Math.sin(a*7+y*22)+.36*Math.sin(a*13-y*32)),flare=Math.max(0,.9-y)*.15;return [(rx+c+f+flare+extra)*Math.sin(a),y*S,(rz+c+f+flare*.65+extra)*Math.cos(a)]}
 function torso(name,slot,col,c,hem,gap,fold,rough,top=1.49){let m=mesh(name,slot,col,rough);grid(m,28,48,(u,t)=>cp(mix(hem,top,t),gap+(tau-2*gap)*u,c,fold),tw,gap===0,.005);return m}
 function patch(name,slot,col,c,y0,y1,a0,a1,extra=.008,rough=o.rough,metal=0){let m=mesh(name,slot,col,rough,metal);grid(m,6,16,(u,t)=>cp(mix(y0,y1,t),mix(a0,a1,u),c,.004,extra+.002*Math.sin(Math.PI*u)*Math.sin(Math.PI*t)),tw,false);return m}
 function sleeve(name,side,slot,color,c,length=1,rough=.85,band=null){let m=mesh(name,slot,color,rough),s=side==="L"?1:-1,sh=B["upperArm_"+side].position,el=B["lowerArm_"+side].position,wr=B["hand_"+side].position,a=add(sh,[-s*.051,.012*S,0]),d=lerp(el,wr,length),dir=norm(sub(d,a)),axis=[-dir[1]*s,dir[0]*s,0];
 function pt(u,t,ex=0){let center=t<.53?lerp(a,el,t/.53):lerp(el,d,(t-.53)/.47),rr=p.arm*(1.05-.33*t)+c+.003*Math.sin(t*49+u*18)*Math.sin(Math.PI*t),ang=tau*u;return add(center,add(mul(axis,(rr+ex)*Math.cos(ang)),[0,0,(rr*.91+ex)*Math.sin(ang)]))}
 function wf(v,u,t){let a=sm(t/.19);return t<.19?weights([["chest",1-a],["upperArm_"+side,a]]):lw(side,t,true)}
 grid(m,24,32,pt,wf,true,.005);
 if(band)for(let [j,t0,t1] of band.ranges.entries()){let b=mesh(name+"-band-"+j,slot,band.color,.56);grid(b,4,32,(u,t)=>pt(u,mix(t0,t1,t),.004),(v,u,t)=>wf(v,u,mix(t0,t1,t)))}return m}
 function pants(name,slot,col,c,rough,top=.99,bottom=.075,band=null){let m=mesh(name,slot,col,rough),N=40,H=N/2,hip=p.hip*.52,wa=[],pe=[];
 for(let i=0;i<N;i++){let a=tau*i/N,x=Math.sin(a),z=Math.cos(a);wa.push(vertex(m,[(p.waist+c)*x,top*S,(p.depth+c)*z],rigid("pelvis")(),i/N,1));pe.push(vertex(m,[(p.hip+c)*x,.855*S,(p.depth*.88+c)*z],weights([["pelvis",.7],["upperLeg_L",.3*sm((x+1)/2)],["upperLeg_R",.3*(1-sm((x+1)/2))]]),i/N,.83))}
 for(let i=0;i<N;i++)quad(m,wa[i],wa[(i+1)%N],pe[(i+1)%N],pe[i]);
 let seam=[pe[H]];for(let i=1;i<H;i++){let t=i/H;seam.push(vertex(m,[0,(.855-.079*Math.sin(Math.PI*t))*S,-(p.depth*.88+c)*Math.cos(Math.PI*t)],weights([["pelvis",.52],["upperLeg_L",.24],["upperLeg_R",.24]]),t,.7))}seam.push(pe[0]);
 for(let [side,s] of [["L",1],["R",-1]]){let loop=side==="L"?pe.slice(0,H+1).concat(seam.slice(1,-1)):pe.slice(H).concat([pe[0]],seam.slice(1,-1).reverse()),a0=Math.atan2(m.positions[loop[0]*3]-s*hip,m.positions[loop[0]*3+2]),prev=loop;
 function pt(u,t,ex=0){let y=mix(.79,bottom,t),a=a0+tau*u,rr=mix(p.thigh,p.calf,sm((.79-y)/.34))-.012*sm((.48-y)/.40)+c+ex+.0035*Math.sin(a*6+y*54)*Math.sin(Math.PI*t);return [s*hip+rr*Math.sin(a),y*S,rr*.92*Math.cos(a)+.008*Math.sin(t*Math.PI)]}
 for(let j=0;j<=30;j++){let t=j/30,r=[];for(let i=0;i<N;i++)r.push(vertex(m,pt(i/N,t),lw(side,t,false),i/N,t));for(let i=0;i<N;i++)quad(m,prev[i],prev[(i+1)%N],r[(i+1)%N],r[i]);prev=r}
 if(band){let k=mesh(name+"-ankle-"+side,slot,band,.59);grid(k,4,N,(u,t)=>pt(u,mix(.73,.80,t),.004),(v,u,t)=>lw(side,mix(.73,.80,t),false))}}
 return m}
 function boot(side){let x=(side==="L"?1:-1)*p.hip*.52,m=mesh("boot-"+side,"footwear",o.boot,.68),sol=mesh("sole-"+side,"footwear",o.dark,.95),rf=p.calf*.91+.023+(o.id==="space"?.012:0);
 function pt(u,t,sole=false){let a=tau*u,y=sole?mix(.003,.028,t):mix(.028,o.bootTop,t),k=sm((.13-y)/.10),rx=mix(rf,rf*1.1,k),rz=mix(rf*.89,.116*S,k);return [x+rx*Math.sin(a),y*S,.052*k*S+rz*Math.cos(a)]}
 grid(m,18,36,(u,t)=>pt(u,t),(v)=>{let a=sm((v[1]/S-.09)/.18);return weights([["foot_"+side,1-a],["lowerLeg_"+side,a]])},true,.006);grid(sol,4,36,(u,t)=>pt(u,t,true),rigid("foot_"+side),true,.009);
 let toe=mesh("toe-reinforcement-"+side,"footwear",o.dark,.77);grid(toe,6,18,(u,t)=>{let v=pt((u-.5)*.48,.20*t);return [v[0],v[1]+.001,v[2]+.003]},rigid("foot_"+side),false)}
 function head(){let m=mesh("identity-head","anatomy","#b98a69",.87),H=p.head;
 function hp(u,t,extra=0){let a=tau*u,r=Math.pow(Math.sin(Math.PI*(.015+.97*t)),.66),y=(1.49+.26*t)*S,jaw=.83+.18*sm(t/.38),da=Math.atan2(Math.sin(a),Math.cos(a)),nose=.026*Math.exp(-Math.pow(da/.20,2)-Math.pow((t-.47)/.105,2));return [(H*r*jaw+extra)*Math.sin(a),y,(H*1.02*r+extra)*Math.cos(a)+nose]}
 grid(m,28,48,(u,t)=>hp(u,t),rigid("head"),true,.002);let hair=mesh("identity-hair","anatomy","#47362a",.94);grid(hair,16,48,(u,t)=>hp(u,mix(.36+.34*Math.max(0,Math.cos(tau*u)),.998,t),.0045),rigid("head"));
 for(let s of [-1,1]){let e=mesh("eye-"+s,"anatomy","#342b24",.62);grid(e,4,10,(u,t)=>hp((s*.36+(u-.5)*.24)/tau,.61+(t-.5)*.033*Math.sin(Math.PI*u),.0022),rigid("head"),false)}
 let mouth=mesh("mouth","anatomy","#845747",.86);grid(mouth,3,12,(u,t)=>hp((u-.5)*.07,.35+(t-.5)*.014,.002),rigid("head"),false);
 let neck=mesh("identity-neck","anatomy","#b98a69");grid(neck,7,24,(u,t)=>[.054*Math.sin(tau*u),mix(1.43,1.57,t)*S,.050*Math.cos(tau*u)],rigid("neck"))}
 function hand(side){let s=side==="L"?1:-1,c=B["hand_"+side].position,dir=norm(sub(c,B["lowerArm_"+side].position)),axis=[-dir[1]*s,dir[0]*s,0],m=mesh("hand-"+side,"anatomy","#b98a69",.82);grid(m,16,24,(u,t)=>{let r=(.027+.013*Math.sin(t*Math.PI))*(1-.85*sm((t-.72)/.28)),v=add(c,mul(dir,.117*S*t));return add(v,add(mul(axis,r*Math.cos(tau*u)),[0,0,r*.64*Math.sin(tau*u)]))},rigid("hand_"+side),true,.002)}
 // Independent identity and covered base meshes, not replacements for the outfit.
 torso("body-torso","covered-anatomy","#b98a69",-.006,.86,0,0,.8,1.47);pants("body-legs","covered-anatomy","#b98a69",-.011,.8,.94,.06);
 for(let s of ["L","R"])sleeve("body-arm-"+s,s,"covered-anatomy","#b98a69",-.009,.99,.8);head();for(let s of ["L","R"])hand(s);
 const c=o.clear;
 torso("base-layer","inner",o.under,.005,.83,0,.002,.85,1.465);
 torso(o.id+"-shell","outer",o.outer,c,o.hem,o.gap,.004,o.rough);
 let band=o.id==="fire"?{color:o.trim,ranges:[[.53,.60],[.85,.91]]}:o.id==="space"?{color:o.dark,ranges:[[.39,.48],[.78,.85]]}:o.id==="rain"?{color:o.dark,ranges:[[.91,.97]]}:null;
 for(let s of ["L","R"]){sleeve(o.id+"-sleeve-"+s,s,"outer",o.outer,c,o.sleeve,o.rough,band);boot(s)}
 pants(o.id+"-trousers","lower",o.lower,c*.68,.82,.985,Math.max(.06,o.bootTop-.025),o.id==="fire"?o.trim:null);
 const P=(n,col,y0,y1,a0,a1,e=.008,rr=o.rough,mm=0)=>patch(n,"outer",col,c,y0,y1,a0,a1,e,rr,mm);
 if(o.id==="fire"){for(let y of [.82,1.13])P("reflective-"+y,o.trim,y,y+.045,0,tau,.009);
 for(let s of [-1,1]){P("cargo-pocket-"+s,o.dark,.88,1.04,s*.72-.24,s*.72+.24,.014);P("cargo-flap-"+s,o.outer,1.01,1.06,s*.72-.28,s*.72+.28,.023);P("chest-pocket-"+s,o.outer,1.23,1.34,s*.62-.20,s*.62+.20,.015)}P("storm-closure",o.dark,.80,1.45,-.095,.095,.013);P("back-panel","#65583c",1.19,1.32,Math.PI-.72,Math.PI+.72)}
 if(o.id==="medic"){for(let s of [-1,1]){P("lapel-"+s,"#f5f3eb",1.13,1.46,s*.48-.16,s*.48+.16,.012);P("coat-pocket-"+s,"#d5dbd5",.68,.85,s*.86-.30,s*.86+.30,.012)}P("chest-pocket","#d5dbd5",1.23,1.34,.60,1.12,.014);P("id-card","#e9e6d9",1.27,1.36,.79,1.01,.021)}
 if(o.id==="space"){for(let y of [.89,1.02,1.39])P("pressure-joint-"+y,o.dark,y,y+.035,0,tau,.012);P("chest-computer",o.dark,1.16,1.33,-.63,.63,.026);for(let j=0;j<4;j++)P("switch-"+j,j===2?o.trim:o.metal,1.24,1.277,-.47+j*.26,-.30+j*.26,.033,.32,.5);
 let pack=mesh("life-support-pack","accessory","#afb9bc",.48);grid(pack,16,32,(u,t)=>{let a=tau*u,k=.72+.28*Math.sin(Math.PI*t);return [p.chest*.83*k*Math.sin(a),(1.24+.19*(2*t-1))*S,-p.depth-c-.075+.083*k*Math.cos(a)]},rigid("chest"),true,.006);
 let helmet=mesh("helmet-shell","accessory","#dce2dd",.34);grid(helmet,24,48,(u,t)=>{let a=tau*u,r=(p.head+.047)*Math.pow(Math.sin(Math.PI*(.18+.80*t)),.62);return [r*Math.sin(a),(1.47+.32*t)*S,r*Math.cos(a)]},rigid("head"));let visor=mesh("gold-visor","accessory","#8b6335",.22,.75);grid(visor,16,32,(u,t)=>{let a=(u-.5)*2.2,k=Math.pow(Math.sin(Math.PI*(.28+.52*t)),.65),r=p.head+.055;return [r*k*Math.sin(a),(1.52+.19*t)*S,r*k*Math.cos(a)+.006]},rigid("head"),false)}
 if(o.id==="medieval"){torso("long-wool-tunic","mid",o.under,.013,.61,.035,.006,.95,1.44);for(let s of [-1,1]){P("leather-facing-"+s,o.dark,.62,1.43,s*.23-.08,s*.23+.08,.013);P("shoulder-yoke-"+s,o.trim,1.34,1.43,s*.96-.42,s*.96+.42,.011)}P("leather-belt",o.dark,.94,1.005,0,tau,.016);P("belt-buckle",o.metal,.948,.999,-.13,.13,.024,.43,.5);P("belt-pouch",o.dark,.80,.96,.76,1.35,.035);P("hem-braid",o.trim,.60,.62,0,tau)}
 if(o.id==="rain"){for(let s of [-1,1]){P("welded-pocket-"+s,o.dark,.79,.93,s*.76-.22,s*.76+.22,.013);P("pocket-flap-"+s,o.outer,.91,.96,s*.76-.28,s*.76+.28,.019)}P("sealed-zipper",o.dark,.69,1.47,-.065,.065,.010);P("storm-flap",o.outer,.70,1.46,.065,.19,.015);P("rear-yoke",o.trim,1.29,1.33,Math.PI-.9,Math.PI+.9,.012);let hood=mesh("open-hood","outer",o.outer,.40);grid(hood,24,40,(u,t)=>{let a=.84+(tau-1.68)*u,r=(p.head+.042)*(.70+.30*Math.sin(Math.PI*t));return [r*Math.sin(a),(1.46+.30*t)*S,r*Math.cos(a)-.006]},rigid("head"),false)}
 if(o.gap===0&&o.id!=="space"){let z=mesh("zipper-teeth","outer",o.metal,.47,.55);for(let y=o.hem+.05;y<1.40;y+=.018)grid(z,1,2,(u,t)=>cp(y+.007*t,(u-.5)*.065,c,.004,.016),tw,false)}
 for(let s of [-1,1])P("side-seam-"+s,o.dark,o.hem+.015,1.30,s*Math.PI/2-.009,s*Math.PI/2+.009,.0035);
 const anchors={head_top:{bone:"head",local:[0,.18*S,0],clearance:.02},face:{bone:"head",local:[0,.045*S,p.head],clearance:.015},neck:{bone:"neck",local:[0,0,0],diameter:.13},chest:{bone:"chest",local:[0,0,p.depth],width:p.chest*2},back:{bone:"chest",local:[0,0,-p.depth],orientation:[0,1,0,0],width:p.chest*2},waist:{bone:"pelvis",local:[0,.08*S,0],width:p.waist*2}};
 for(let s of ["L","R"]){anchors["hand_"+s]={bone:"hand_"+s,local:[0,0,0],clearance:.008};anchors["wrist_"+s]={bone:"hand_"+s,local:[0,0,0],diameter:p.arm*1.35};anchors["foot_"+s]={bone:"foot_"+s,local:[0,-.04*S,.035*S],length:.23*S}}
 for(let a of Object.values(anchors))a.orientation??=[0,0,0,1];
 return {profile:p.id,outfit:o.id,bones,meshes,anchors,layerRules:{hidden:["covered-anatomy"],exclusive:["outer","lower","footwear"],innerUnderOuter:true},dimensions:p};
}

export function pose(t,mode){const r={},put=(n,x=0,y=0,z=0)=>r[n]=[x,y,z],w=Math.sin(t*Math.PI*2),w2=Math.cos(t*Math.PI*2),a=mode==="walk"?.65:0,k=mode==="sit"?.92:mode==="crouch"?.72:0,raise=mode==="flex"?.78:mode==="action"?.55:0;put("spine",k*.25,0,.025*w);put("chest",-.10*k,.04*w,0);put("head",.03*w,.11*w2,0);for(let [s,sign] of [["L",1],["R",-1]]){put("upperArm_"+s,a*.58*w*sign-raise*.48,0,sign*.43);put("lowerArm_"+s,-(.12+a*.18*(1+w*sign)+raise*1.1),0,0);put("upperLeg_"+s,-k-a*w*sign,0,0);put("lowerLeg_"+s,k*1.35+a*.78*Math.max(0,w*sign),0,0);put("foot_"+s,-k*.35-a*.30*Math.max(0,w*sign),0,0)}return {rotations:r,pelvisDrop:k*.27+(mode==="walk"?.025*(1-Math.cos(t*4*Math.PI)):0)}}

export function inspect(m){let errs=[],tri=0,visibleTri=0;for(let q of m.meshes){let n=q.positions.length/3;tri+=q.indices.length/3;if(q.slot!=="covered-anatomy")visibleTri+=q.indices.length/3;if(q.positions.some(x=>!Number.isFinite(x))||q.indices.some(i=>i<0||i>=n)||q.joints.some(i=>i<0||i>=m.bones.length))errs.push(q.name+": bad data");for(let i=0;i<n;i++){let w=q.weights.slice(i*4,i*4+4);if(w.some(x=>!Number.isFinite(x)||x<0)||Math.abs(w.reduce((a,b)=>a+b,0)-1)>1e-6){errs.push(q.name+": bad weight");break}}}return {profile:m.profile,outfit:m.outfit,meshes:m.meshes.length,triangles:tri,visibleTriangles:visibleTri,joints:m.bones.length,errors:errs,structural:errs.length?"FAIL":"PASS",animatedFit:"NOT_RUN",visual:"NOT_RUN"}}