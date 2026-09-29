const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const QUALITY_LAG_WORDS=5;
const SLOT_PX=9;
const DEFAULT_MIN_LEAD_PX=180;
const CAMERA_HEAD_RATIO=.80;
const BAR_VIRTUAL_MARGIN=520;

function words(s){return String(s||'').trim().match(/\S+/gu)||[]}
function normWord(s){
 return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\p{L}\p{N}]+/gu,'')
}
function rms(x){let s=0;for(let i=0;i<x.length;i++)s+=x[i]*x[i];return Math.sqrt(s/Math.max(1,x.length))}
function levelOf(x){
 const db=20*Math.log10(Math.max(1e-7,rms(x)));
 return clamp((db+55)/43,0,1)
}
function concatFloat(a,b){
 if(!a?.length)return b.slice();if(!b?.length)return a.slice();
 const o=new Float32Array(a.length+b.length);o.set(a);o.set(b,a.length);return o
}
function alignOps(a,b){
 const A=a.map(normWord),B=b.map(normWord),n=A.length,m=B.length;
 const d=Array.from({length:n+1},()=>new Uint16Array(m+1));
 for(let i=0;i<=n;i++)d[i][0]=i;for(let j=0;j<=m;j++)d[0][j]=j;
 for(let i=1;i<=n;i++)for(let j=1;j<=m;j++){
   const sub=d[i-1][j-1]+(A[i-1]===B[j-1]?0:1);
   d[i][j]=Math.min(sub,d[i-1][j]+1,d[i][j-1]+1)
 }
 const rev=[];let i=n,j=m;
 while(i||j){
   if(i&&j&&A[i-1]===B[j-1]&&d[i][j]===d[i-1][j-1]){rev.push({type:'eq'});i--;j--;continue}
   if(i&&j&&d[i][j]===d[i-1][j-1]+1){rev.push({type:'sub'});i--;j--;continue}
   if(j&&d[i][j]===d[i][j-1]+1){rev.push({type:'ins'});j--;continue}
   rev.push({type:'del'});i--
 }
 const ops=rev.reverse();let ai=0,bi=0;
 for(const op of ops){
   op.ai=ai;op.bi=bi;
   if(op.type==='eq'||op.type==='sub'||op.type==='del')ai++;
   if(op.type==='eq'||op.type==='sub'||op.type==='ins')bi++
 }
 return ops
}
function sourceConsumedByPrefix(prefix,source){
 if(!prefix.length)return 0;
 const ops=alignOps(prefix,source);let usedA=0,usedB=0;
 for(const op of ops){
   if(op.type==='eq'||op.type==='sub'){usedA++;usedB++}
   else if(op.type==='del')usedA++;
   else usedB++;
   if(usedA>=prefix.length)break
 }
 return Math.min(source.length,usedB)
}

export class TimelineTurn{
 constructor({mount,onChange,onFollow,minLead=20}){
   this.mount=mount;this.onChange=onChange||(()=>{});this.onFollow=onFollow||(()=>{});
   this.minLeadPx=Math.max(DEFAULT_MIN_LEAD_PX,minLead*SLOT_PX);
   this.tokens=[];this.confirmedCount=0;this.draftRaw=[];this.draftTarget=[];this.qualityRaw=[];
   this.draftTimer=null;this.qualityTimer=null;this.cameraFrame=0;this.audioClosed=false;this.finalMode=false;
   this.done=false;this.destroyed=false;this.visible=true;this.carry=new Float32Array();this.sampleRate=48000;
   this.barWindowMs=28;this.head=null;this.barSeq=0;this.bars=[];this.virtualCursor=0;
   this.audioFrontierPx=0;this.draftFrontierPx=0;this.cameraX=0;this.waitDraft=[];this.waitFinal=[];
   this.measureCanvas=document.createElement('canvas');this.measureCtx=this.measureCanvas.getContext('2d');
   this.#build()
 }
 #build(){
   this.row=document.createElement('div');this.row.className='timeline-turn live-visible';
   this.stage=document.createElement('div');this.stage.className='flow-stage';
   this.world=document.createElement('div');this.world.className='rail-world';
   this.barTrack=document.createElement('div');this.barTrack.className='cell-track';
   this.wordLayer=document.createElement('div');this.wordLayer.className='word-layer';
   this.world.append(this.barTrack,this.wordLayer);this.stage.appendChild(this.world);this.row.appendChild(this.stage);this.mount.appendChild(this.row);
   this.#ensureHead();this.#scheduleCamera()
 }
 setLiveVisible(flag){
   this.visible=!!flag;this.row.classList.toggle('live-visible',this.visible);this.row.hidden=!this.visible;
   if(this.visible)this.#scheduleCamera()
 }
 #font(){
   try{return getComputedStyle(this.wordLayer).font||'430 30px system-ui'}catch{return '430 30px system-ui'}
 }
 #measureWord(text){
   try{this.measureCtx.font=this.#font();return Math.ceil(this.measureCtx.measureText(String(text)+' ').width)}
   catch{return Math.ceil((String(text).length+1)*16)}
 }
 #textWidth(){
   let x=0;for(const tok of this.tokens)x+=tok.advancePx||this.#measureWord(tok.text);return x
 }
 #leadPx(){return Math.max(0,this.audioFrontierPx-this.draftFrontierPx)}
 #windowMs(){
   const lead=this.#leadPx();let target=44;
   if(!this.draftRaw.length)target=24;
   else if(lead<this.minLeadPx)target=18;
   else if(lead<this.minLeadPx+90)target=22;
   else if(lead<this.minLeadPx+180)target=28;
   else if(lead<this.minLeadPx+320)target=34;
   this.barWindowMs=this.barWindowMs*.52+target*.48;
   return this.barWindowMs
 }
 #makeBar(level=.06,head=false){
   const seq=this.barSeq++,x=seq*SLOT_PX;
   const el=document.createElement('span');el.className='speech-cell'+(head?' live-head':'');
   el.style.left=x+'px';el.style.setProperty('--level',Number(level).toFixed(3));
   const wave=document.createElement('i');wave.className='wave';el.appendChild(wave);
   const bar={seq,x,el,level,head};this.bars.push(bar);this.barTrack.appendChild(el);
   this.audioFrontierPx=Math.max(this.audioFrontierPx,(seq+1)*SLOT_PX);return bar
 }
 #ensureHead(){
   if(this.audioClosed||this.head)return;
   this.head=this.#makeBar(.06,true)
 }
 #commitHead(level){
   if(!this.head)this.#ensureHead();if(!this.head)return;
   this.head.level=level;this.head.head=false;this.head.el.classList.remove('live-head');
   this.head.el.style.setProperty('--level',level.toFixed(3));this.head=null;this.#ensureHead()
 }
 pushAudio(x,rate){
   if(this.destroyed||this.audioClosed||!x?.length)return;
   this.sampleRate=rate||this.sampleRate;this.carry=concatFloat(this.carry,x);
   let guard=0;
   while(this.carry.length&&guard++<160){
     const need=Math.max(96,Math.round(this.sampleRate*this.#windowMs()/1000));
     if(this.carry.length<need)break;
     const part=this.carry.subarray(0,need);this.#commitHead(levelOf(part));this.carry=this.carry.slice(need)
   }
   if(this.head&&this.carry.length){
     const level=levelOf(this.carry);this.head.level=level;this.head.el.style.setProperty('--level',level.toFixed(3))
   }
   this.#kickDraft();this.#scheduleCamera()
 }
 closeAudio(){
   if(this.audioClosed)return;
   if(this.head){
     if(this.carry.length){
       const level=levelOf(this.carry);this.head.level=level;this.head.el.style.setProperty('--level',level.toFixed(3));
       this.head.el.classList.remove('live-head');this.head.head=false
     }else{this.head.el.remove();this.bars.pop();this.barSeq=Math.max(0,this.barSeq-1);this.audioFrontierPx=this.barSeq*SLOT_PX}
   }
   this.head=null;this.carry=new Float32Array();this.audioClosed=true;
   this.row.classList.remove('recording');this.row.classList.add('processing');this.#kickDraft();this.#kickQuality();this.#scheduleCamera()
 }
 setDraft(text){
   if(this.destroyed||this.finalMode)return;
   this.draftRaw=words(text);
   const confirmed=this.tokens.slice(0,this.confirmedCount).map(t=>t.text);
   const consumed=sourceConsumedByPrefix(confirmed,this.draftRaw);
   this.draftTarget=confirmed.concat(this.draftRaw.slice(consumed));this.#kickDraft()
 }
 setQuality(text,{final=false}={}){
   if(this.destroyed)return Promise.resolve();
   this.qualityRaw=words(text);
   if(final){this.finalMode=true;this.row.classList.add('finalizing')}
   this.#kickQuality();return final?this.whenFinal():Promise.resolve()
 }
 #makeToken(text,status='draft'){
   const el=document.createElement('span');el.className='text-word';
   const label=document.createElement('span');label.className='word-text';el.appendChild(label);
   const token={text:String(text),status,advancePx:this.#measureWord(text),el};this.#syncToken(token);
   requestAnimationFrame(()=>el.classList.add('visible'));return token
 }
 #syncToken(t){
   const label=t.el.querySelector('.word-text');if(label.textContent!==t.text)label.textContent=t.text;
   t.el.classList.toggle('confirmed',t.status==='confirmed')
 }
 #insertToken(index,text,status='draft'){
   const tok=this.#makeToken(text,status),before=this.tokens[index]?.el||null;
   this.tokens.splice(index,0,tok);this.wordLayer.insertBefore(tok.el,before);return tok
 }
 #removeToken(index){
   const tok=this.tokens[index];if(!tok)return;tok.el.remove();this.tokens.splice(index,1)
 }
 #updateTokenText(tok,text,status=tok.status){
   const width=this.#measureWord(text);tok.text=text;tok.status=status;tok.advancePx=Math.max(tok.advancePx||0,width);this.#syncToken(tok)
 }
 #recomputeDraftFrontier(){
   this.draftFrontierPx=Math.max(this.draftFrontierPx,this.#textWidth())
 }
 #currentText(){return this.tokens.map(t=>t.text).filter(Boolean).join(' ').trim()}
 #notify(){this.#recomputeDraftFrontier();this.onChange(this.#currentText());this.onFollow();this.#scheduleCamera()}
 #kickDraft(){
   if(this.destroyed||this.draftTimer||this.finalMode)return;
   this.draftTimer=setTimeout(()=>this.#draftStep(),0)
 }
 #draftStep(){
   this.draftTimer=null;if(this.destroyed||this.finalMode)return;
   const floor=this.confirmedCount,current=this.tokens.slice(floor).map(t=>t.text),target=this.draftTarget.slice(floor);
   const ops=alignOps(current,target),op=ops.find(x=>x.type!=='eq');
   if(!op){const w=this.waitDraft.splice(0);w.forEach(r=>r());this.#kickQuality();return}
   const expected=op.type==='del'?0:this.#measureWord(target[op.bi]||'');
   if(!this.audioClosed&&(op.type==='ins'||op.type==='sub')&&this.#leadPx()<this.minLeadPx+expected){
     this.barWindowMs=18;this.draftTimer=setTimeout(()=>this.#draftStep(),16);return
   }
   const index=floor+op.ai;
   if(op.type==='sub')this.#updateTokenText(this.tokens[index],target[op.bi],'draft');
   else if(op.type==='del')this.#removeToken(index);
   else this.#insertToken(index,target[op.bi],'draft');
   this.#notify();
   const distance=Math.abs(target.length-current.length),delay=distance>10?30:distance>4?42:58;
   this.draftTimer=setTimeout(()=>this.#draftStep(),delay)
 }
 #draftSettled(){
   const a=this.tokens.slice(this.confirmedCount).map(t=>t.text),b=this.draftTarget.slice(this.confirmedCount);
   if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true
 }
 #kickQuality(){
   if(this.destroyed||this.qualityTimer||this.done)return;
   this.qualityTimer=setTimeout(()=>this.#qualityStep(),0)
 }
 #qualityStep(){
   this.qualityTimer=null;if(this.destroyed||this.done)return;
   const confirmed=this.tokens.slice(0,this.confirmedCount).map(t=>t.text);
   const consumed=sourceConsumedByPrefix(confirmed,this.qualityRaw),qSuffix=this.qualityRaw.slice(consumed);
   const gray=this.tokens.slice(this.confirmedCount).map(t=>t.text);
   if(!this.finalMode&&!qSuffix.length)return;
   const lag=this.finalMode?0:(this.audioClosed?2:QUALITY_LAG_WORDS);
   if(!this.finalMode&&gray.length<=lag){this.qualityTimer=setTimeout(()=>this.#qualityStep(),66);return}
   const ops=alignOps(gray,qSuffix);
   if(!ops.length){if(this.finalMode)this.#finishFinal();return}
   const op=ops[0],index=this.confirmedCount;
   if(!this.finalMode&&!this.audioClosed&&this.#leadPx()<this.minLeadPx){
     this.barWindowMs=18;this.qualityTimer=setTimeout(()=>this.#qualityStep(),24);return
   }
   if(op.type==='del'){
     if(!this.finalMode&&gray.length<=lag){this.qualityTimer=setTimeout(()=>this.#qualityStep(),66);return}
     this.#removeToken(index);this.#notify();this.qualityTimer=setTimeout(()=>this.#qualityStep(),50);return
   }
   if(op.type==='ins'){
     if(!this.finalMode&&gray.length<=lag){this.qualityTimer=setTimeout(()=>this.#qualityStep(),66);return}
     const tok=this.#insertToken(index,qSuffix[0],'confirmed');tok.status='confirmed';this.#syncToken(tok);
     this.confirmedCount++;this.#notify();this.qualityTimer=setTimeout(()=>this.#qualityStep(),54);return
   }
   let tok=this.tokens[index];
   if(!tok){
     if(!this.finalMode){this.qualityTimer=setTimeout(()=>this.#qualityStep(),66);return}
     tok=this.#insertToken(index,qSuffix[0],'confirmed')
   }
   this.#updateTokenText(tok,qSuffix[0],'confirmed');this.confirmedCount++;this.#notify();
   const backlog=qSuffix.length-1,delay=backlog>18?30:backlog>7?42:58;
   this.qualityTimer=setTimeout(()=>this.#qualityStep(),delay)
 }
 #finishFinal(){
   const current=this.tokens.map(t=>normWord(t.text)),target=this.qualityRaw.map(normWord);
   const exact=current.length===target.length&&current.every((v,i)=>v===target[i]);
   if(!exact){this.qualityTimer=setTimeout(()=>this.#qualityStep(),0);return}
   this.done=true;this.finalMode=false;this.confirmedCount=this.tokens.length;
   for(const tok of this.tokens){tok.status='confirmed';this.#syncToken(tok)}
   this.row.classList.remove('processing','finalizing');this.row.classList.add('done');this.#notify();
   const w=this.waitFinal.splice(0);w.forEach(r=>r())
 }
 #scheduleCamera(){
   if(this.destroyed||this.cameraFrame)return;
   this.cameraFrame=requestAnimationFrame(()=>{this.cameraFrame=0;this.#updateCamera()})
 }
 #updateCamera(){
   if(!this.stage?.isConnected)return;
   const viewport=Math.max(1,this.stage.clientWidth),headX=this.audioFrontierPx;
   const next=Math.max(0,headX-viewport*CAMERA_HEAD_RATIO);
   this.cameraX=Math.max(this.cameraX,next);
   const worldWidth=Math.max(viewport,headX+viewport*.25,this.draftFrontierPx+80);
   this.world.style.width=worldWidth+'px';this.world.style.transform='translate3d('+(-this.cameraX)+'px,0,0)';
   while(this.virtualCursor<this.bars.length){
     const bar=this.bars[this.virtualCursor];
     if(bar.x>=this.cameraX-BAR_VIRTUAL_MARGIN)break;
     if(bar.el.isConnected)bar.el.remove();this.virtualCursor++
   }
 }
 whenDraftSettled(timeout=1800){
   if(this.#draftSettled())return Promise.resolve();
   return new Promise(r=>{this.waitDraft.push(r);setTimeout(r,timeout)})
 }
 whenFinal(){
   if(this.done)return Promise.resolve();return new Promise(r=>this.waitFinal.push(r))
 }
 getText(){return this.#currentText()}
 destroy(){
   this.destroyed=true;clearTimeout(this.draftTimer);clearTimeout(this.qualityTimer);
   if(this.cameraFrame)cancelAnimationFrame(this.cameraFrame);this.row.remove()
 }
}
