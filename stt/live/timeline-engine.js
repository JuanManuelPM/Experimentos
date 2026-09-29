const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function words(s){return String(s||'').trim().match(/\S+/gu)||[]}
function rms(x){let s=0;for(let i=0;i<x.length;i++)s+=x[i]*x[i];return Math.sqrt(s/Math.max(1,x.length))}
function levelOf(x){
 const db=20*Math.log10(Math.max(1e-7,rms(x)));
 return clamp((db+55)/43,0,1)
}
function concatFloat(a,b){
 if(!a?.length)return b.slice();if(!b?.length)return a.slice();
 const o=new Float32Array(a.length+b.length);o.set(a);o.set(b,a.length);return o
}

export class TimelineTurn{
 constructor({mount,onChange,onFollow,minLead=20}){
   this.mount=mount;this.onChange=onChange||(()=>{});this.onFollow=onFollow||(()=>{});
   this.minLead=minLead;this.tokens=[];this.bars=[];this.consumedSlots=0;
   this.draftTarget=[];this.qualityTarget=[];this.qualityCursor=0;
   this.draftTimer=null;this.qualityTimer=null;this.audioClosed=false;this.finalTarget=null;
   this.carry=new Float32Array();this.sampleRate=48000;this.barWindowMs=48;this.head=null;
   this.waitDraft=[];this.waitQuality=[];this.finalWait=[];this.destroyed=false;
   this.#build()
 }
 #build(){
   this.row=document.createElement('div');this.row.className='timeline-turn recording';
   this.stage=document.createElement('div');this.stage.className='flow-stage';
   this.barTrack=document.createElement('div');this.barTrack.className='cell-track';
   this.wordLayer=document.createElement('div');this.wordLayer.className='word-layer';
   this.stage.append(this.barTrack,this.wordLayer);this.row.appendChild(this.stage);this.mount.appendChild(this.row);
   this.#ensureHead();this.#layout()
 }
 #makeBar(level=.06,head=false){
   const el=document.createElement('span');el.className='speech-cell'+(head?' live-head':'');
   el.style.setProperty('--level',Number(level).toFixed(3));
   const wave=document.createElement('i');wave.className='wave';el.appendChild(wave);
   const bar={el,level,head};this.bars.push(bar);this.barTrack.appendChild(el);return bar
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
   return Math.max(0,committed-this.consumedSlots)
 }
 #windowMs(){
   const lead=this.#lead();
   let target=82;
   if(lead<this.minLead)target=42;
   else if(lead<this.minLead+8)target=48;
   else if(lead<this.minLead+18)target=58;
   else if(lead<this.minLead+32)target=70;
   this.barWindowMs=this.barWindowMs*.52+target*.48;
   return this.barWindowMs
 }
 pushAudio(x,rate){
   if(this.destroyed||this.audioClosed||!x?.length)return;
   this.sampleRate=rate||this.sampleRate;this.carry=concatFloat(this.carry,x);
   let guard=0;
   while(this.carry.length&&guard++<96){
     const need=Math.max(160,Math.round(this.sampleRate*this.#windowMs()/1000));
     if(this.carry.length<need)break;
     const part=this.carry.subarray(0,need),level=levelOf(part);
     this.#commitHead(level);this.carry=this.carry.slice(need)
   }
   if(this.head&&this.carry.length){
     const level=levelOf(this.carry);this.head.level=level;this.head.el.style.setProperty('--level',level.toFixed(3))
   }
   this.#kickDraft();this.#layout()
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
   this.#kickDraft();this.#kickQuality();this.#layout()
 }
 setDraft(text){
   if(this.destroyed)return;
   const raw=words(text),confirmed=Math.min(this.qualityCursor,this.tokens.length);
   this.draftTarget=this.tokens.slice(0,confirmed).map(t=>t.text).concat(raw.slice(confirmed));
   this.#kickDraft()
 }
 setQuality(text,{final=false}={}){
   if(this.destroyed)return Promise.resolve();
   const next=words(text);
   if(next.length>=this.qualityCursor)this.qualityTarget=next;
   if(final)this.finalTarget=next.slice();
   this.#kickQuality();
   return final?this.whenFinal():Promise.resolve()
 }
 #wordSlots(text){
   if(!this.measureCanvas){this.measureCanvas=document.createElement('canvas');this.measureCtx=this.measureCanvas.getContext('2d')}
   try{
     const st=getComputedStyle(this.wordLayer);this.measureCtx.font=st.font;
     return Math.max(2,Math.ceil(this.measureCtx.measureText(String(text)+' ').width/9))
   }catch{return Math.max(2,Math.ceil((String(text).length+1)*1.1))}
 }
 #makeToken(text,status='draft'){
   const el=document.createElement('span');el.className='text-word';
   const label=document.createElement('span');label.className='word-text';el.appendChild(label);
   const token={text:String(text),status,slots:this.#wordSlots(text),el};this.#syncToken(token);
   requestAnimationFrame(()=>el.classList.add('visible'));return token
 }
 #syncToken(t){
   const label=t.el.querySelector('.word-text');if(label.textContent!==t.text)label.textContent=t.text;
   t.el.classList.toggle('confirmed',t.status==='confirmed')
 }
 #growTokenSlots(tok,nextText){
   const n=this.#wordSlots(nextText);
   if(n>tok.slots){this.consumedSlots+=n-tok.slots;tok.slots=n}
 }
 #currentText(){return this.tokens.filter(t=>t.text).map(t=>t.text).join(' ').trim()}
 #notify(){this.onChange(this.#currentText());this.onFollow();this.#layout()}
 #kickDraft(){
   if(this.destroyed||this.draftTimer)return;
   this.draftTimer=setTimeout(()=>this.#draftStep(),0)
 }
 #draftStep(){
   this.draftTimer=null;if(this.destroyed)return;
   const floor=this.qualityCursor,target=this.draftTarget;
   let i=floor;
   while(i<this.tokens.length&&i<target.length&&this.tokens[i].text===target[i])i++;
   if(i<this.tokens.length&&i>=floor){
     if(i<target.length){
       const tok=this.tokens[i];this.#growTokenSlots(tok,target[i]);tok.text=target[i];tok.status='draft';this.#syncToken(tok)
     }else{
       for(let j=this.tokens.length-1;j>=i;j--){if(j>=floor)this.tokens[j].el.remove()}
       this.tokens.length=i
     }
     this.#notify()
   }else if(this.tokens.length<target.length){
     const text=target[this.tokens.length],slots=this.#wordSlots(text);
     const committed=this.bars.length-(this.head?1:0),lead=committed-this.consumedSlots;
     if(!this.audioClosed&&lead-slots<this.minLead){
       this.barWindowMs=42;this.draftTimer=setTimeout(()=>this.#draftStep(),22);return
     }
     const tok=this.#makeToken(text,'draft');this.tokens.push(tok);this.wordLayer.append(tok.el,document.createTextNode(' '));
     this.consumedSlots+=tok.slots;this.#notify()
   }
   if(!this.#draftSettled()){
     const backlog=Math.max(0,target.length-this.tokens.length),delay=backlog>10?36:backlog>4?50:70;
     this.draftTimer=setTimeout(()=>this.#draftStep(),delay)
   }else{
     const w=this.waitDraft.splice(0);w.forEach(r=>r());this.#kickQuality()
   }
 }
 #draftSettled(){
   if(this.tokens.length!==this.draftTarget.length)return false;
   for(let i=this.qualityCursor;i<this.draftTarget.length;i++)if(this.tokens[i]?.text!==this.draftTarget[i])return false;
   return true
 }
 #kickQuality(){
   if(this.destroyed||this.qualityTimer)return;
   this.qualityTimer=setTimeout(()=>this.#qualityStep(),0)
 }
 #qualityStep(){
   this.qualityTimer=null;if(this.destroyed)return;
   const target=this.qualityTarget;
   if(this.qualityCursor<target.length){
     if(this.qualityCursor>=this.tokens.length){
       if(!this.audioClosed){this.qualityTimer=setTimeout(()=>this.#qualityStep(),40);return}
       const tok=this.#makeToken(target[this.qualityCursor],'draft');this.tokens.push(tok);this.wordLayer.append(tok.el,document.createTextNode(' '));this.consumedSlots+=tok.slots
     }
     const tok=this.tokens[this.qualityCursor];this.#growTokenSlots(tok,target[this.qualityCursor]);
     tok.text=target[this.qualityCursor];tok.status='confirmed';this.#syncToken(tok);
     this.qualityCursor++;this.#notify();this.qualityTimer=setTimeout(()=>this.#qualityStep(),84);return
   }
   const w=this.waitQuality.splice(0);w.forEach(r=>r());
   if(this.finalTarget)this.#settleFinal()
 }
 #settleFinal(){
   const final=this.finalTarget;if(!final)return;
   if(this.qualityCursor<final.length){this.qualityTarget=final;this.#kickQuality();return}
   this.tokens=this.tokens.slice(0,final.length);
   for(let i=0;i<final.length;i++){
     let tok=this.tokens[i];if(!tok){tok=this.#makeToken(final[i],'confirmed');this.tokens[i]=tok}
     tok.text=final[i];tok.status='confirmed';this.#syncToken(tok)
   }
   this.wordLayer.replaceChildren();
   for(const tok of this.tokens)this.wordLayer.append(tok.el,document.createTextNode(' '));
   this.consumedSlots=this.bars.length;this.finalTarget=null;
   this.row.classList.remove('processing');this.row.classList.add('done');
   this.#notify();const w=this.finalWait.splice(0);w.forEach(r=>r())
 }
 #layout(){
   const done=this.row.classList.contains('done');
   const covered=done?this.bars.length:Math.min(this.bars.length,this.consumedSlots);
   for(let i=0;i<this.bars.length;i++)this.bars[i].el.classList.toggle('covered',i<covered);
   requestAnimationFrame(()=>{
     if(!this.stage?.isConnected)return;
     this.stage.style.height=Math.max(40,this.barTrack.scrollHeight,this.wordLayer.scrollHeight)+'px'
   })
 }
 whenDraftSettled(timeout=1800){
   if(this.#draftSettled())return Promise.resolve();
   return new Promise(r=>{this.waitDraft.push(r);setTimeout(r,timeout)})
 }
 whenQualitySettled(timeout=2200){
   if(this.qualityCursor>=this.qualityTarget.length)return Promise.resolve();
   return new Promise(r=>{this.waitQuality.push(r);setTimeout(r,timeout)})
 }
 whenFinal(timeout=10000){
   if(!this.finalTarget&&this.row.classList.contains('done'))return Promise.resolve();
   return new Promise(r=>{this.finalWait.push(r);setTimeout(r,timeout)})
 }
 getText(){return this.#currentText()}
 destroy(){this.destroyed=true;clearTimeout(this.draftTimer);clearTimeout(this.qualityTimer);this.row.remove()}
}
