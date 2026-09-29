const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const QUALITY_LAG_WORDS=5;

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
   this.minLead=minLead;this.tokens=[];this.bars=[];this.confirmedCount=0;
   this.draftRaw=[];this.draftTarget=[];this.qualityRaw=[];
   this.draftTimer=null;this.qualityTimer=null;this.layoutFrame=0;
   this.audioClosed=false;this.finalMode=false;this.done=false;this.destroyed=false;
   this.carry=new Float32Array();this.sampleRate=48000;this.barWindowMs=38;this.head=null;
   this.frontierIndex=0;this.waitDraft=[];this.waitFinal=[];
   this.#build()
 }
 #build(){
   this.row=document.createElement('div');this.row.className='timeline-turn recording';
   this.stage=document.createElement('div');this.stage.className='flow-stage';
   this.barTrack=document.createElement('div');this.barTrack.className='cell-track';
   this.wordLayer=document.createElement('div');this.wordLayer.className='word-layer';
   this.stage.append(this.barTrack,this.wordLayer);this.row.appendChild(this.stage);this.mount.appendChild(this.row);
   this.#ensureHead();this.#scheduleLayout()
 }
 #makeBar(level=.06,head=false){
   const el=document.createElement('span');el.className='speech-cell'+(head?' live-head':'');
   el.style.setProperty('--level',Number(level).toFixed(3));
   const wave=document.createElement('i');wave.className='wave';el.appendChild(wave);
   const bar={el,level,head,everCovered:false};this.bars.push(bar);this.barTrack.appendChild(el);return bar
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
 #lead(){
   const committed=this.bars.length-(this.head?1:0);
   return Math.max(0,committed-this.frontierIndex)
 }
 #windowMs(){
   const lead=this.#lead();let target=72;
   if(!this.draftRaw.length)target=38;
   else if(lead<this.minLead)target=32;
   else if(lead<this.minLead+8)target=40;
   else if(lead<this.minLead+20)target=50;
   else if(lead<this.minLead+36)target=60;
   this.barWindowMs=this.barWindowMs*.56+target*.44;
   return this.barWindowMs
 }
 pushAudio(x,rate){
   if(this.destroyed||this.audioClosed||!x?.length)return;
   this.sampleRate=rate||this.sampleRate;this.carry=concatFloat(this.carry,x);
   let guard=0;
   while(this.carry.length&&guard++<128){
     const need=Math.max(128,Math.round(this.sampleRate*this.#windowMs()/1000));
     if(this.carry.length<need)break;
     const part=this.carry.subarray(0,need);this.#commitHead(levelOf(part));this.carry=this.carry.slice(need)
   }
   if(this.head&&this.carry.length){
     const level=levelOf(this.carry);this.head.level=level;this.head.el.style.setProperty('--level',level.toFixed(3))
   }
   this.#kickDraft();this.#scheduleLayout()
 }
 closeAudio(){
   if(this.audioClosed)return;
   if(this.head){
     if(this.carry.length){
       const level=levelOf(this.carry);this.head.level=level;this.head.el.style.setProperty('--level',level.toFixed(3));
       this.head.el.classList.remove('live-head');this.head.head=false
     }else{this.head.el.remove();this.bars.pop()}
   }
   this.head=null;this.carry=new Float32Array();this.audioClosed=true;
   this.row.classList.remove('recording');this.row.classList.add('processing');
   this.#kickDraft();this.#kickQuality();this.#scheduleLayout()
 }
 setDraft(text){
   if(this.destroyed)return;
   this.draftRaw=words(text);
   const confirmed=this.tokens.slice(0,this.confirmedCount).map(t=>t.text);
   const consumed=sourceConsumedByPrefix(confirmed,this.draftRaw);
   this.draftTarget=confirmed.concat(this.draftRaw.slice(consumed));
   this.#kickDraft()
 }
 setQuality(text,{final=false}={}){
   if(this.destroyed)return Promise.resolve();
   this.qualityRaw=words(text);
   if(final){this.finalMode=true;this.row.classList.add('finalizing')}
   this.#kickQuality();
   return final?this.whenFinal():Promise.resolve()
 }
 #makeToken(text,status='draft'){
   const el=document.createElement('span');el.className='text-word';
   const label=document.createElement('span');label.className='word-text';el.appendChild(label);
   const token={text:String(text),status,el};this.#syncToken(token);
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
 #currentText(){return this.tokens.map(t=>t.text).join(' ').trim()}
 #notify(){this.onChange(this.#currentText());this.onFollow();this.#scheduleLayout()}
 #kickDraft(){
   if(this.destroyed||this.draftTimer)return;
   this.draftTimer=setTimeout(()=>this.#draftStep(),0)
 }
 #draftStep(){
   this.draftTimer=null;if(this.destroyed||this.finalMode)return;
   const floor=this.confirmedCount,current=this.tokens.slice(floor).map(t=>t.text),target=this.draftTarget.slice(floor);
   const ops=alignOps(current,target),op=ops.find(x=>x.type!=='eq');
   if(!op){const w=this.waitDraft.splice(0);w.forEach(r=>r());this.#kickQuality();return}
   const index=floor+op.ai;
   if(op.type==='sub'){
     const tok=this.tokens[index];tok.text=target[op.bi];tok.status='draft';this.#syncToken(tok)
   }else if(op.type==='del')this.#removeToken(index);
   else if(op.type==='ins')this.#insertToken(index,target[op.bi],'draft');
   this.#notify();
   const distance=Math.abs(target.length-current.length),delay=distance>10?34:distance>4?48:66;
   this.draftTimer=setTimeout(()=>this.#draftStep(),delay)
 }
 #draftSettled(){
   const a=this.tokens.slice(this.confirmedCount).map(t=>t.text),b=this.draftTarget.slice(this.confirmedCount);
   if(a.length!==b.length)return false;
   for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true
 }
 #kickQuality(){
   if(this.destroyed||this.qualityTimer)return;
   this.qualityTimer=setTimeout(()=>this.#qualityStep(),0)
 }
 #qualityStep(){
   this.qualityTimer=null;if(this.destroyed||this.done)return;
   const confirmed=this.tokens.slice(0,this.confirmedCount).map(t=>t.text);
   const consumed=sourceConsumedByPrefix(confirmed,this.qualityRaw);
   const qSuffix=this.qualityRaw.slice(consumed);
   const gray=this.tokens.slice(this.confirmedCount).map(t=>t.text);
   const lag=this.finalMode?0:(this.audioClosed?2:QUALITY_LAG_WORDS);
   if(!this.finalMode&&gray.length<=lag){
     this.qualityTimer=setTimeout(()=>this.#qualityStep(),70);return
   }
   const ops=alignOps(gray,qSuffix);
   if(!ops.length){
     if(this.finalMode)this.#finishFinal();
     return
   }
   const op=ops[0],index=this.confirmedCount;
   if(op.type==='del'){
     if(gray.length<=lag&&!this.finalMode){this.qualityTimer=setTimeout(()=>this.#qualityStep(),70);return}
     this.#removeToken(index);this.#notify();this.qualityTimer=setTimeout(()=>this.#qualityStep(),58);return
   }
   if(op.type==='ins'){
     if(!this.finalMode&&gray.length<=lag){this.qualityTimer=setTimeout(()=>this.#qualityStep(),70);return}
     const tok=this.#insertToken(index,qSuffix[0],'confirmed');tok.status='confirmed';this.#syncToken(tok);
     this.confirmedCount++;this.#notify();this.qualityTimer=setTimeout(()=>this.#qualityStep(),62);return
   }
   let tok=this.tokens[index];
   if(!tok){
     if(!this.finalMode){this.qualityTimer=setTimeout(()=>this.#qualityStep(),70);return}
     tok=this.#insertToken(index,qSuffix[0],'confirmed')
   }
   tok.text=qSuffix[0];tok.status='confirmed';this.#syncToken(tok);this.confirmedCount++;this.#notify();
   const backlog=qSuffix.length-1,delay=backlog>18?34:backlog>7?48:68;
   this.qualityTimer=setTimeout(()=>this.#qualityStep(),delay)
 }
 #finishFinal(){
   this.done=true;this.finalMode=false;this.confirmedCount=this.tokens.length;
   for(const tok of this.tokens){tok.status='confirmed';this.#syncToken(tok)}
   this.row.classList.remove('processing','finalizing');this.row.classList.add('done');
   this.#notify();const w=this.waitFinal.splice(0);w.forEach(r=>r())
 }
 #scheduleLayout(){
   if(this.destroyed||this.layoutFrame)return;
   this.layoutFrame=requestAnimationFrame(()=>{this.layoutFrame=0;this.#layout()})
 }
 #layout(){
   if(!this.stage?.isConnected)return;
   const stageRect=this.stage.getBoundingClientRect();
   const lineH=parseFloat(getComputedStyle(this.wordLayer).lineHeight)||34;
   const tokenRects=this.tokens.map(t=>t.el.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0);
   const buckets=new Map();
   for(const r of tokenRects){
     const a=Math.floor((r.top-stageRect.top+1)/lineH),b=Math.floor((r.bottom-stageRect.top-1)/lineH);
     for(let line=a;line<=b;line++){if(!buckets.has(line))buckets.set(line,[]);buckets.get(line).push(r)}
   }
   let geometryFrontier=this.frontierIndex;
   let lastRect=tokenRects[tokenRects.length-1]||null,lastLine=lastRect?Math.floor((lastRect.top-stageRect.top+1)/lineH):-1;
   for(let i=0;i<this.bars.length;i++){
     const bar=this.bars[i],r=bar.el.getBoundingClientRect(),cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2;
     const line=Math.floor((cy-stageRect.top)/lineH),rects=buckets.get(line)||[];
     let covered=bar.everCovered;
     if(!covered){
       for(const wr of rects){
         if(cx>=wr.left-2&&cx<=wr.right+2&&cy>=wr.top-1&&cy<=wr.bottom+1){covered=true;break}
       }
     }
     if(covered)bar.everCovered=true;
     bar.el.classList.toggle('covered',bar.everCovered);
     if(lastRect&&(line<lastLine||(line===lastLine&&cx<=lastRect.right+2)))geometryFrontier=Math.max(geometryFrontier,i+1)
   }
   this.frontierIndex=Math.max(this.frontierIndex,geometryFrontier);
   this.stage.style.height=Math.max(40,this.barTrack.scrollHeight,this.wordLayer.scrollHeight)+'px'
 }
 whenDraftSettled(timeout=1800){
   if(this.#draftSettled())return Promise.resolve();
   return new Promise(r=>{this.waitDraft.push(r);setTimeout(r,timeout)})
 }
 whenFinal(){
   if(this.done)return Promise.resolve();
   return new Promise(r=>this.waitFinal.push(r))
 }
 getText(){return this.#currentText()}
 destroy(){
   this.destroyed=true;clearTimeout(this.draftTimer);clearTimeout(this.qualityTimer);
   if(this.layoutFrame)cancelAnimationFrame(this.layoutFrame);this.row.remove()
 }
}
