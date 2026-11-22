/* SUBTERRÁNEO W001-01 · original deterministic PCM synthesis */
window.renderSubterraneo=function renderSubterraneo(rate=16000){
const bpm=136,bars=72,beat=60/bpm,duration=bars*4*beat,N=Math.ceil(duration*rate);
let seed=0x51a33177;function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/2147483648-1}
const keys=["kick","rumble","bass","hats","atmos"],stems=Object.fromEntries(keys.map(k=>[k,new Float32Array(N)])),ev=Object.fromEntries(keys.map(k=>[k,[]]));
const note=(k,t,d,n,v)=>ev[k].push({time:+t.toFixed(6),dur:+d.toFixed(4),note:n,vel:v});
function kick(t,v){note("kick",t,.36,36,Math.round(100*v));const a=stems.kick,j=Math.round(t*rate);for(let i=0;i<Math.min(rate*.46,N-j);i++){const x=i/rate,p=2*Math.PI*(47*x+124*(1-Math.exp(-33*x))/33),env=Math.exp(-8.7*x)*(1-Math.exp(-1700*x));a[j+i]+=v*(.59*env*Math.tanh((Math.sin(p)+.16*Math.sin(2*p)*Math.exp(-28*x))*1.2)+rnd()*.028*Math.exp(-110*x)*(1-Math.exp(-1300*x)))}}
function rumble(t,v){note("rumble",t,.55,36,Math.round(83*v));const a=stems.rumble,j=Math.round(t*rate);let lo=0;for(let i=0;i<Math.min(rate*.68,N-j);i++){const x=i/rate,p=2*Math.PI*(44*x+9*(1-Math.exp(-4.5*x))/4.5);lo+=.011*(rnd()-lo);a[j+i]+=v*.27*(1-Math.exp(-26*x))*Math.exp(-3.7*x)*(Math.sin(p)+.14*Math.sin(2*p)+lo*.16)}}
function bass(t,m,vel){note("bass",t,.23,m,vel);const f=440*2**((m-69)/12),a=stems.bass,j=Math.round(t*rate);let p=0;for(let i=0;i<Math.min(rate*.32,N-j);i++){const x=i/rate;p+=2*Math.PI*f*(1+.012*Math.exp(-16*x))/rate;a[j+i]+=.29*(vel/110)*(1-Math.exp(-70*x))*Math.exp(-11*x)*Math.tanh(1.4*(Math.sin(p)+.18*Math.sin(2*p)+.045*Math.sin(3*p)))}}
function hat(t,vel,open){note("hats",t,open?.23:.095,open?46:42,vel);const a=stems.hats,j=Math.round(t*rate);let lp=0;for(let i=0;i<Math.min(rate*(open?.23:.13),N-j);i++){const x=i/rate,n=rnd();lp+=.15*(n-lp);a[j+i]+=.065*(vel/98)*(n-lp)*(1-Math.exp(-(open?185:260)*x))*Math.exp(-(open?23:62)*x)*(open?.73:1)}}
const section=bar=>bar<8?0:bar<24?1:bar<32?2:bar<40?3:bar<56?4:bar<64?5:6;
for(let bar=0;bar<bars;bar++){const s=section(bar),o=bar*4*beat;
for(let k=0;k<4;k++){if(s===3){if(bar%4===0&&k===0)kick(o+k*beat,.62);continue}if(s===0&&(bar<4&&k!==0||bar>=4&&k===3&&bar%2===0))continue;if(s===6&&bar>=68&&k%2)continue;
kick(o+k*beat,(k===0?1:k===2?.91:.94)*(s===0?.81:s===6?.80:1));if(([1,2,4,5].includes(s)&&k!==3)||(s===6&&k%2===0))rumble(o+k*beat+beat*.23,s===5?.67:.61)}
if([1,2,4,5].includes(s)){const root=bar%16===15?29:bar%8===6?32:28,os=[2,5].includes(s)?[.75,1.75,2.75,3.5]:[.75,1.75,3.25];for(let z=0;z<os.length;z++)if(!(bar%8===7&&z===os.length-1))bass(o+os[z]*beat,root,z%2?70:82)}
if(s===6&&bar<68&&bar%2===0)bass(o+2.75*beat,28,55);
if(([1,2,4,5].includes(s))||(s===6&&bar<68)){for(let h=0;h<4;h++){if([1,4].includes(s)&&h%2&&bar%4===0)continue;hat(o+(h+.5)*beat,(s===5?62:50)+(bar+h)%4*4,s===5&&h===3&&bar%2===1)}if([2,5].includes(s)&&bar%2===1)for(let h of [1.25,3.25])hat(o+h*beat,36,false)}
}
let lo=0,mid=0;for(let i=0;i<N;i++){const t=i/rate,s=section(Math.min(bars-1,Math.floor(t/(4*beat)))),n=rnd();lo+=.009*(n-lo);mid+=.047*(lo-mid);const sway=(.6+.4*Math.sin(2*Math.PI*t/23.2+1.1))*(.68+.32*Math.sin(2*Math.PI*t/37));const strength=[.11,.07,.083,.17,.085,.095,.12][s];stems.atmos[i]=Math.min(1,t*.3,Math.max(0,(duration-t)/3.5))*strength*(mid*7.2+.057*Math.sin(2*Math.PI*(55*t+.9*Math.sin(t*.04))))*sway;
const dt=t%beat;stems.rumble[i]*=.40+.60*(1-Math.exp(-dt*13));stems.bass[i]*=.55+.45*(1-Math.exp(-dt*17))}
for(let bar=0;bar<bars;bar+=8)note("atmos",bar*4*beat,3,48,42);
const master=new Float32Array(N);let pre=0,ss=0,jump=0;for(let i=0;i<N;i++){let v=0;for(let k of keys)v+=stems[k][i];v*=Math.max(0,Math.min(1,i/(rate*.024),(N-1-i)/(rate*2.4)));master[i]=v;pre=Math.max(pre,Math.abs(v))}const scale=Math.min(1.35,.89/Math.max(pre,.000001));
for(let i=0;i<N;i++){master[i]*=scale;ss+=master[i]*master[i];if(i>0)jump=Math.max(jump,Math.abs(master[i]-master[i-1]));for(let k of keys)stems[k][i]*=scale*Math.max(0,Math.min(1,i/(rate*.024),(N-1-i)/(rate*2.4)))}
const configs=[["kick","01 · BOMBO / NÚCLEO","techkick",.63],["rumble","02 · RUMBLE / SUBSUELO","techrumble",.27],["bass","03 · PULSO / BAJO","racebass",.15],["hats","04 · SEDA / AIRE","velsilkhat",.26],["atmos","05 · VAPOR / TENSIÓN","velhush",.13]];
const sections=[["APERTURA / BAJO TIERRA",0,8],["MOTOR / I",8,24],["PRESIÓN / CONTRAPESO",24,32],["VACÍO / RESPIRAR",32,40],["MOTOR / II",40,56],["PICO / HIPNOSIS",56,64],["SALIDA / REVERBERACIÓN",64,72]].map(([name,start_bar,end_bar])=>({name,start_bar,end_bar}));
const tracks=configs.map(([id,name,type,gain])=>({id,name,type,gain,pan:0,mute:false,solo:false,fx:{reverb:0,delay:0},events:ev[id]}));
const project={schema:"prometeo.songproject/v2",id:"subterraneo-w001-01",title:"SUBTERRÁNEO",author:"PROMETEO · original",bpm,meter:[4,4],bars,duration_seconds:+duration.toFixed(6),render_sample_rate:rate,master_gain:.8,sections,harmony:[],tracks,sound_intent:{style:"techno pesado hipnótico minimalista",no_vocals:true,no_lead:true,pinnedFlowSha256:"6826ce13f4bd1e0d81b8a89bd7e6728668b85c44c68185b79426b00a36b8f05f",briefSha256:"34c2567575314168d6b4bba6d850394c4e8eeb0f0cdb96b354484363c9209432"}};
return {master,stems,project,qa:{sampleRate:rate,samples:N,durationSeconds:duration,peak:pre*scale,rms:Math.sqrt(ss/N),maximumAdjacentSampleDelta:jump,clipCount:0,originalSynthesis:true}};
};
