/** Ivo, original fictional technician. V4. Editable continuous profiled sculpture;
 * actor geometry and pose defined separately. No likeness or external asset. MIT.
 * Metres, Y up, anatomical forward -Z. Bent limbs are continuous swept topology.
 */
const PI=Math.PI,cl=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),sm=x=>{x=cl(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]),mul=(a,s)=>a.map(x=>x*s),norm=a=>mul(a,1/(Math.hypot(...a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],lerp=(a,b,t)=>a.map((x,i)=>mix(x,b[i],t));
const skin=[.65,.44,.31],hair=[.055,.039,.033],jacket=[.28,.36,.40],shirt=[.30,.34,.32],pants=[.12,.15,.19],boots=[.075,.069,.065],sole=[.042,.038,.038],seam=[.38,.44,.46];
class Mesh{
 constructor(){this.p=[];this.n=[];this.c=[];this.e=[]}
 v(p,n,c){this.p.push(...p);this.n.push(...n);this.c.push(...c);this.e.push(0)}
 tri(a,b,c,na,nb,nc,col){this.v(a,na,col);this.v(b,nb,col);this.v(c,nc,col)}
 record(){return{positions:Float32Array.from(this.p),normals:Float32Array.from(this.n),colors:Float32Array.from(this.c),emissives:Float32Array.from(this.e),count:this.e.length}}
}
const sec=(p,rx,rz=rx)=>({p,rx,rz});
function sweep(m,sections,color,N=18,modify=null){
 const pts=sections.map((r,i)=>{const tangent=norm(sub(sections[Math.min(i+1,sections.length-1)].p,sections[Math.max(0,i-1)].p)),side=norm(cross(tangent,Math.abs(tangent[0])>.92?[0,0,1]:[1,0,0])),right=norm(cross(side,tangent));
 return Array.from({length:N},(_,j)=>{const a=j*2*PI/N,p=add(r.p,add(mul(right,Math.cos(a)*r.rx),mul(side,Math.sin(a)*r.rz)));return modify?modify(p,a,i):p})});
 const ns=pts.map((row,i)=>row.map((p,j)=>{const along=sub(pts[Math.min(i+1,pts.length-1)][j],pts[Math.max(0,i-1)][j]),around=sub(row[(j+1)%N],row[(j+N-1)%N]);let n=norm(cross(around,along));if(n.reduce((v,x,k)=>v+x*(p[k]-sections[i].p[k]),0)<0)n=mul(n,-1);return n}));
 for(let i=0;i<pts.length-1;i++)for(let j=0;j<N;j++){const k=(j+1)%N,a=pts[i][j],b=pts[i+1][j],c=pts[i+1][k],d=pts[i][k],na=ns[i][j],nb=ns[i+1][j],nc=ns[i+1][k],nd=ns[i][k];const tint=typeof color==='function'?color(lerp(a,c,.5),i,j):color;m.tri(a,b,c,na,nb,nc,tint);m.tri(a,c,d,na,nc,nd,tint)}
}
function limb(m,a,b,c,w,col,N=16){
 sweep(m,[sec(a,.002),sec(lerp(a,b,.12),w*1.05,w*.92),sec(lerp(a,b,.5),w,w*.85),sec(lerp(a,b,.86),w*.77,w*.79),sec(b,w*.73,w*.72),sec(lerp(b,c,.2),w*.77,w*.72),sec(lerp(b,c,.55),w*.64,w*.60),sec(lerp(b,c,.91),w*.46,w*.44),sec(c,.002)],col,N)
}
function knee(h,a){const d=sub(a,h),l=Math.hypot(d[1],d[2]),q=Math.min(.795,l),k=Math.sqrt(Math.max(0,.16-q*q/4)),mid=lerp(h,a,.5),den=l||1;return[mid[0],mid[1]-d[2]/den*k,mid[2]-Math.abs(d[1])/den*k]}
export function poseAt(t){
 const wake=sm((t-16.2)/2.7),rise=sm((t-21)/3.25),w=cl((t-25)/.78,0,7);
 const feet=[{z:1.02,y:.09},{z:1.02,y:.09}];
 for(let i=0;i<7;i++){if(w<=i)break;const k=i%2,u=cl(w-i),target=i===6?-.18:1.02-.20*(i+1);feet[k]={z:mix(feet[k].z,target,sm(u)),y:.09+.095*Math.sin(PI*u)}}
 const z=t<25?mix(1.39,1.02,rise):(feet[0].z+feet[1].z)/2,y=mix(.57,.86,rise)+.017*Math.sin(PI*w)**2*(t>=25&&w<7?1:0),lean=mix(.16,.035,rise)+.11*(1-wake)*(1-rise);
 const hip=[0,y,z],chest=[0,y+.42,z-lean],head=[0,y+.68,z-lean-.025],ankles=feet.map((f,i)=>[(i?1:-1)*.115,f.y,f.z]),hips=ankles.map(a=>[a[0]*.88,y,z]),knees=hips.map((h,i)=>knee(h,ankles[i]));
 return{hip,chest,head,hips,knees,ankles,wake,rise,gait:t>=25&&w<7?Math.sin(PI*w):0,front:[0,0,-1],walk:t>=25&&w<7}
}
function face(m,H,tilt,wake){
 const off=(x,y,z)=>add(H,[x,y,z]),move=p=>{let y=p[1]-H[1],z=p[2]-H[2],c=Math.cos(tilt),s=Math.sin(tilt);return[p[0],H[1]+c*y-s*z,H[2]+s*y+c*z]};
 const g=(x,c,s)=>Math.exp(-(((x-c)/s)**2)),profile=[[-.142,.002,.002,.019],[-.128,.057,.054,.012],[-.107,.080,.074,.003],[-.086,.093,.091,.002],[-.064,.103,.099,.004],[-.044,.109,.104,.006],[-.025,.109,.104,.007],[-.008,.108,.102,.008],[.012,.107,.100,.010],[.03,.108,.101,.011],[.051,.108,.102,.011],[.075,.104,.098,.012],[.098,.093,.086,.015],[.122,.074,.068,.016],[.142,.034,.034,.016],[.151,.002,.002,.016]];
 function bump(x,y,z){if(z>=-.025)return 0;let f=cl((-z-.025)/.055);return f*(.052*g(x,0,.018)*g(y,-.020,.028)+.026*g(x,0,.024)*g(y,.015,.044)+.013*g(Math.abs(x),.019,.013)*g(y,-.036,.014)+.011*g(Math.abs(x),.065,.025)*g(y,-.038,.029)-.013*g(Math.abs(x),.044,.023)*g(y,.019,.014)+.011*g(x,0,.060)*g(y,-.072,.014)+.007*g(Math.abs(x),.042,.029)*g(y,.048,.014))}
 function surfaceZ(x,y){let idx=profile.findIndex(r=>r[0]>=y);if(idx<1)idx=1;let a=profile[idx-1],b=profile[idx],u=cl((y-a[0])/(b[0]-a[0])),rx=mix(a[1],b[1],u),rz=mix(a[2],b[2],u),d=mix(a[3],b[3],u);let z=d-rz*Math.sqrt(Math.max(.001,1-(x/rx)**2));return z-bump(x,y,z)}
 const skinshade=p=>{let x=p[0]-H[0],y=p[1]-H[1],z=p[2]-H[2],beard=cl((-.036-y)*12)*cl((-z-.02)*15),cheek=g(Math.abs(x),.065,.027)*g(y,-.038,.035)*cl((-z-.03)*18);return skin.map((v,i)=>v*(1-.19*beard)+cheek*[.05,.014,.006][i])};
 sweep(m,profile.map(([y,x,z,d])=>sec(off(0,y,d),x,z)),skinshade,64,p=>{p[2]-=bump(p[0]-H[0],p[1]-H[1],p[2]-H[2]);return move(p)});
 const hairrows=[sec(off(0,.036,.035),.110,.102),sec(off(-.003,.072,.020),.116,.109),sec(off(-.010,.108,.014),.107,.098),sec(off(-.016,.141,.007),.090,.079),sec(off(-.023,.166,.013),.055,.053),sec(off(-.025,.175,.015),.002,.003)];
 const strand=(p,i,j)=>{let grain=.014*(.5+.5*Math.cos(j*.63+i*.82))+.007*(j%3===0);return hair.map((v,k)=>v+grain*[1,.74,.50][k])};
 sweep(m,hairrows,strand,52,(p,a,i)=>{if(i===0){if(p[2]<H[2]){p[1]+=.015*Math.sin(a*3)+.033*(p[0]>H[0]?1:0);p[2]-=.005}else p[1]-=.065;}return move(p)});
 function patch(x,y,rx,ry,col,offset=.003,almond=false,slope=0){const pt=(xx,yy)=>move(off(xx,yy,surfaceZ(xx,yy)-offset)),center=pt(x,y);for(let j=0;j<28;j++){let ta=j*PI/14,tb=(j+1)*PI/14,ax=rx*Math.cos(ta),bx=rx*Math.cos(tb),ay=ry*Math.sin(ta)*(almond?Math.abs(Math.sin(ta))**.55:1),by=ry*Math.sin(tb)*(almond?Math.abs(Math.sin(tb))**.55:1);let p=pt(x+ax,y+ay+ax*slope),q=pt(x+bx,y+by+bx*slope),n=norm(cross(sub(q,center),sub(p,center)));m.tri(center,p,q,n,n,n,col)}}
 for(const s of [-1,1]){let x=s*.043;patch(x,.019,.028,.009+.004*wake,[.21,.12,.08],.003,true,-s*.07);if(wake>.16){patch(x,.019,.025,.009*wake,[.67,.64,.57],.004,true,-s*.07);patch(x-s*.001,.019,.0085,.009*wake,[.16,.19,.13],.005);patch(x-s*.001,.019,.0046,.007*wake,[.022,.025,.021],.006);patch(x-.003,.022,.0018,.002,[.78,.78,.70],.0065)}patch(x,.047,.029,.0038,[.081,.052,.038],.003,true,s*.13);patch(s*.017,-.037,.0065,.0028,[.24,.12,.085],.003,true,s*.35);
 sweep(m,[sec(off(s*.101,-.057,.015),.002),sec(off(s*.115,-.036,.006),.013,.012),sec(off(s*.119,-.013,.009),.014,.016),sec(off(s*.109,.010,.014),.007),sec(off(s*.103,.017,.014),.002)],skin,18,move);
 const earC=move(off(s*.128,-.018,.008));for(let j=0;j<18;j++){const k=j*PI/9,l=(j+1)*PI/9,p=move(off(s*.130,-.018+.016*Math.sin(k),.008+.007*Math.cos(k))),q=move(off(s*.130,-.018+.016*Math.sin(l),.008+.007*Math.cos(l))),n=[s,0,0];m.tri(earC,p,q,n,n,n,[.42,.24,.16])}}
 patch(0,-.068,.031,.004,[.38,.19,.16],.0025,true);patch(0,-.073,.025,.0035,[.48,.25,.20],.002,true);patch(0,-.069,.028,.0016,[.22,.10,.08],.0037,true);
}
function shoe(m,a){const q=(x,y,z)=>add(a,[x,y,z]);sweep(m,[sec(q(0,-.084,-.035),.002),sec(q(0,-.072,-.042),.074,.138),sec(q(0,-.035,-.042),.073,.137),sec(q(0,.002,-.018),.061,.10),sec(q(0,.04,.005),.047,.052),sec(q(0,.048,.008),.002)],boots,20);sweep(m,[sec(q(0,-.086,-.044),.002),sec(q(0,-.081,-.044),.077,.14),sec(q(0,-.065,-.044),.077,.14),sec(q(0,-.06,-.044),.002)],sole,20)}
function hand(m,p,s){const q=(x,y,z)=>add(p,[x,y,z]);sweep(m,[sec(q(0,.033,0),.002),sec(q(0,.009,0),.033,.025),sec(q(0,-.043,-.004),.035,.023),sec(q(0,-.069,-.003),.024,.016)],skin,14);for(let i=0;i<4;i++){let x=(i-1.5)*.014,l=[.043,.052,.048,.037][i];sweep(m,[sec(q(x,-.046,-.005),.008),sec(q(x,-.067,-.012),.007),sec(q(x,-.049-l,-.018),.002)],skin,8)}sweep(m,[sec(q(-s*.023,-.012,-.008),.01),sec(q(-s*.046,-.035,-.018),.009),sec(q(-s*.043,-.059,-.024),.002)],skin,8)}
export function createRigFrame(t){
 const p=poseAt(t),m=new Mesh(),H=p.hip,C=p.chest,F=p.head,a=(x,y,z)=>add(H,[x,y,z]),b=(x,y,z)=>add(C,[x,y,z]);
 sweep(m,[sec(a(0,-.105,0),.002),sec(a(0,-.075,0),.145,.100),sec(a(0,.045,-.004),.181,.122),sec(a(0,.13,-.02),.165,.106),sec(lerp(H,C,.53),.156,.105),sec(b(0,-.10,.02),.194,.117),sec(b(0,0,0),.218,.115),sec(b(0,.075,0),.177,.092),sec(b(0,.11,-.01),.069,.06),sec(b(0,.115,-.01),.002)],jacket,28);
 sweep(m,[sec(b(0,-.12,-.103),.002),sec(b(0,-.07,-.111),.072,.009),sec(b(0,.047,-.096),.073,.012),sec(b(0,.095,-.059),.055,.01),sec(b(0,.11,-.034),.002)],shirt,18);
 sweep(m,[sec(b(0,-.20,-.105),.004),sec(b(.006,-.10,-.117),.005),sec(b(.005,.005,-.122),.005),sec(b(0,.055,-.098),.002)],seam,8);
 sweep(m,[sec(b(0,.07,0),.002),sec(b(0,.09,0),.058,.053),sec(add(F,[0,-.135,.016]),.054,.048),sec(add(F,[0,-.10,.017]),.002)],skin,20);
 face(m,F,(1-p.wake)*.42+.07*(1-p.rise),p.wake);
 for(let i=0;i<2;i++){const s=i?1:-1,hip=p.hips[i],kn=p.knees[i],ank=p.ankles[i];limb(m,add(hip,[0,.058,0]),kn,add(ank,[0,.034,0]),.086,pants,18);shoe(m,ank);
 const shoulder=b(s*.195,.015,.005),elbow=b(s*mix(.24,.205,p.rise),mix(-.17,-.27,p.rise),mix(-.11,.04+s*p.gait*.045,p.rise)),wrist=b(s*mix(.15,.20,p.rise),mix(-.29,-.49,p.rise),mix(-.23,.025-s*p.gait*.105,p.rise));limb(m,shoulder,elbow,wrist,.065,jacket,16);hand(m,wrist,s)}
 return m.record()
}
export const ACTOR_META={identity:"Ivo / fictional technician",front:[0,0,-1],rig:"continuous joint-driven sweep with analytic knee and fixed stance anchors",rights:"original",approval:"NOT_REVIEWED"};
