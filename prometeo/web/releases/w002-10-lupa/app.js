/* LUPA · reusable visual-inspection engine. No remote captures happen here. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const dbName = 'lupa-visual-evidence-v1';
  const state = { a:null, b:null, aURL:null, bURL:null, aSHA:null, bSHA:null,
    width:0, height:0, ready:false, changed:0, total:0, threshold:32,
    position:50, mode:'split', manifest:null, provenance:'UNVERIFIED_UPLOAD',
    savedId:null, token:0 };
  const format = (n) => new Intl.NumberFormat('es-AR').format(n);
  const short = (sha) => sha ? sha.slice(0,12) + '…' : 'no disponible';
  const modes = { split:'CORTINA', blend:'OPACIDAD A', difference:'CAMBIOS', parallel:'VISTA A/B' };
  const tell = (message, kind='info') => {
    $('status').textContent = message;
    $('status').className = 'status' + (kind==='error' ? ' error' : kind==='success' ? ' success' : '');
  };
  const asSHA = async (file) => {
    if (!crypto?.subtle) return null;
    const bytes = await file.arrayBuffer();
    return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))]
      .map((b)=>b.toString(16).padStart(2,'0')).join('');
  };
  const inspect = async (file) => {
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) throw Error('Formato inválido. Importá PNG, JPG o WEBP.');
    if (file.size > 40*1024*1024) throw Error('La imagen supera 40 MiB. Recortá la captura desde el runner, no desde el visor.');
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (!image.naturalWidth || !image.naturalHeight) throw Error('No se puede decodificar la imagen.');
      const sha = await asSHA(file);
      return {file,url,image,sha,width:image.naturalWidth,height:image.naturalHeight};
    } catch (error) { URL.revokeObjectURL(url); throw error; }
  };
  const fileLabel = (slot,data) => {
    $('name'+slot).textContent = data ? data.file.name : 'Sin imagen seleccionada';
    $('detail'+slot).textContent = data ? format(data.width)+' × '+format(data.height)+' px · '+(data.file.size/1024).toFixed(1)+' KiB' : 'Seleccioná una captura local';
    $('caption'+slot).textContent = data ? slot+': '+data.file.name : slot+': sin archivo';
    $('sha'+slot).textContent = data ? short(data.sha) : '—';
    $('sha'+slot).title = data?.sha || 'Sin SHA-256';
  };
  function provenance() {
    if (!state.a || !state.b) {
      state.provenance = 'UNVERIFIED_UPLOAD';
      $('provenance').textContent = 'Procedencia: faltan imágenes. No hay evidencia verificable.';
      $('sourceState').textContent = 'Sin par cargado';
      return;
    }
    const manifest = state.manifest;
    if (!manifest) {
      state.provenance = 'UNVERIFIED_UPLOAD';
      $('provenance').textContent = 'Imágenes reales importadas por usuario. Sin manifiesto: sus URLs o condiciones de captura no están verificadas.';
      $('sourceState').textContent = 'IMPORTACIÓN LOCAL';
      return;
    }
    const imA = manifest.images?.find((v)=>v.slot==='A');
    const imB = manifest.images?.find((v)=>v.slot==='B');
    const match = manifest.schema==='lupa.capture.v1'
      && imA?.sha256===state.aSHA && imB?.sha256===state.bSHA
      && manifest.viewport?.width===state.width
      && manifest.viewport?.height===state.height;
    state.provenance = match ? 'MANIFEST_HASH_MATCH' : 'MANIFEST_MISMATCH';
    $('sourceState').textContent = match ? 'SHA Y VIEWPORT COINCIDEN' : 'MANIFIESTO NO COINCIDE';
    $('provenance').textContent = match
      ? 'SHA-256 y dimensiones coinciden con el manifiesto aportado. La identidad/permiso del sitio no se certifica desde este visor.'
      : 'Atención: hashes, formato o viewport no coinciden con el manifiesto. No usarlo como prueba de origen.';
  }
  const clearPictures = () => {
    state.ready=false;
    $('picture').style.display='none';
    $('blank').hidden=false;
    $('scrub').disabled=true;
    ['save','downloadDiff','downloadA','downloadB','downloadManifest'].forEach((id)=>$(id).disabled=true);
    $('percent').textContent='—'; $('changed').textContent='—'; $('dimensions').textContent='—';
  };
  const startLoad = async () => {
    const token = ++state.token;
    clearPictures();
    fileLabel('A',state.a); fileLabel('B',state.b);
    if (!state.a || !state.b) { provenance(); return; }
    if (state.a.width!==state.b.width || state.a.height!==state.b.height) {
      state.width=0; state.height=0;
      provenance();
      tell('DIMENSIONES DISTINTAS · A '+state.a.width+'×'+state.a.height+' / B '+state.b.width+'×'+state.b.height+'. Usá capturas del mismo viewport, sin reescalarlas.', 'error');
      return;
    }
    state.width=state.a.width;state.height=state.a.height;state.aSHA=state.a.sha;state.bSHA=state.b.sha;
    try {
      $('imgA').src=state.a.url; $('imgB').src=state.b.url;
      await Promise.all([$('imgA').decode(),$('imgB').decode()]);
      if (token!==state.token) return;
      $('diff').width=state.width; $('diff').height=state.height;
      state.ready=true; state.total=state.width*state.height;
      $('picture').style.display='block'; $('blank').hidden=true;
      $('scrub').disabled=false;
      ['save','downloadDiff','downloadA','downloadB','downloadManifest'].forEach((id)=>$(id).disabled=false);
      $('dimensions').textContent=format(state.width)+' × '+format(state.height);
      provenance(); renderMode(); calculate();
      tell('Par cargado: imágenes de '+state.width+'×'+state.height+' px. El análisis usa los píxeles reales.', 'success');
    } catch (error) { tell('No se pudieron abrir ambas imágenes: '+error.message,'error'); }
  };
  const ingest = async (slot,file) => {
    if (!file) return;
    const previous=state[slot.toLowerCase()];
    try {
      tell('Leyendo bytes e imagen '+slot+'…');
      const data=await inspect(file);
      state[slot.toLowerCase()]=data;
      if (previous?.url) URL.revokeObjectURL(previous.url);
      state.savedId=null;
      await startLoad();
    } catch (error) {
      tell('Error en '+slot+': '+error.message,'error');
    }
  };
  const drawPx = (img,ctx) => { ctx.clearRect(0,0,state.width,state.height);ctx.drawImage(img,0,0);return ctx.getImageData(0,0,state.width,state.height).data; };
  const calculate = () => {
    if (!state.ready) return;
    try {
      const aCanvas=document.createElement('canvas'), bCanvas=document.createElement('canvas');
      aCanvas.width=bCanvas.width=state.width; aCanvas.height=bCanvas.height=state.height;
      const a=drawPx($('imgA'),aCanvas.getContext('2d',{willReadFrequently:true}));
      const b=drawPx($('imgB'),bCanvas.getContext('2d',{willReadFrequently:true}));
      const c=$('diff'), ctx=c.getContext('2d');
      const result=ctx.createImageData(state.width,state.height);
      let changed=0;
      for(let i=0;i<a.length;i+=4) {
        const delta=Math.max(Math.abs(a[i]-b[i]),Math.abs(a[i+1]-b[i+1]),Math.abs(a[i+2]-b[i+2]));
        if(delta>state.threshold) {
          result.data[i]=255;result.data[i+1]=171;result.data[i+2]=84;result.data[i+3]=225;
          changed++;
        }
      }
      ctx.putImageData(result,0,0);
      state.changed=changed;
      $('percent').textContent=(changed/state.total*100).toFixed(2)+'%';
      $('changed').textContent=format(changed);
      $('activeThreshold').textContent=String(state.threshold);
      $('thresholdText').textContent=String(state.threshold);
    }catch(error){tell('No se pudo analizar el par: '+error.message,'error');}
  };
  const renderMode = () => {
    const picture=$('picture');
    picture.className='picture '+state.mode;
    document.querySelectorAll('.mode').forEach((b)=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
    $('scrubLabel').textContent=modes[state.mode];
    $('scrubValue').textContent=state.position+'%';
    $('scrub').value=state.position;
    const pct=state.position+'%';
    $('imgA').style.clipPath=state.mode==='split' ? 'inset(0 '+(100-state.position)+'% 0 0)' : 'none';
    $('imgA').style.opacity=state.mode==='blend' ? String(state.position/100) : state.mode==='difference' ? '0':'1';
    $('cursor').style.left=pct;
    $('picture').setAttribute('aria-label',state.mode==='split'?'Comparación A/B interactiva. Usá flechas izquierda y derecha para mover la cortina.':'Modo '+modes[state.mode]+'. Usá el control de rango debajo para ajustar la vista.');
    $('scrub').setAttribute('aria-label',state.mode==='split'?'Posición cortina A/B':'Nivel de '+modes[state.mode]);
  };
  function moveTo(value) { state.position=Math.max(0,Math.min(100,Math.round(value)));renderMode(); }
  function download(blob,filename) {
    const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2500);
  }
  function evidence() {
    return {schema:'lupa.comparison.v1',id:state.savedId||null,createdAt:new Date().toISOString(),
      note:$('comparisonName').value.trim()||null,viewport:{width:state.width,height:state.height,scale:'css-pixel'},
      images:[{slot:'A',name:state.a.file.name,sha256:state.aSHA,bytes:state.a.file.size},
              {slot:'B',name:state.b.file.name,sha256:state.bSHA,bytes:state.b.file.size}],
      comparison:{algorithm:'max_absolute_rgb_channel_delta',comparison:'>',threshold:state.threshold,
        totalPixels:state.total,changedPixels:state.changed,changedPercent:+(state.changed/state.total*100).toFixed(4),
        alphaIgnored:true,noResampling:true},provenance:state.provenance,
      captureManifest:state.provenance==='MANIFEST_HASH_MATCH'?state.manifest:null,
      disclaimer:'La coincidencia de hashes no prueba por sí misma autorización ni origen del contenido. No se midió Lighthouse, carga ni severidad perceptual.'};
  }
  function openDB() {
    return new Promise((resolve,reject)=>{
      if(!indexedDB){reject(new Error('IndexedDB no disponible'));return;}
      const req=indexedDB.open(dbName,1);
      req.onupgradeneeded=()=>req.result.createObjectStore('snapshots',{keyPath:'id'});
      req.onerror=()=>reject(req.error);
      req.onsuccess=()=>resolve(req.result);
    });
  }
  async function transaction(mode,cb) {
    const db=await openDB();
    try {
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction('snapshots',mode);
        const store=tx.objectStore('snapshots');
        let result;
        tx.oncomplete=()=>resolve(result);
        tx.onerror=()=>reject(tx.error);
        tx.onabort=()=>reject(tx.error||new Error('Transacción cancelada'));
        try{const req=cb(store);if(req){req.onsuccess=()=>{result=req.result;};}}catch(err){reject(err);tx.abort();}
      });
    }finally{db.close();}
  }
  const updateHistory=async()=>{
    try{
      const list=await transaction('readonly',(s)=>s.getAll());
      list.sort((a,b)=>b.savedAt.localeCompare(a.savedAt));
      $('historyCount').textContent=list.length+' GUARDADAS';
      const container=$('history');container.replaceChildren();
      if(!list.length){const p=document.createElement('p');p.className='note';p.textContent='Aún no hay comparaciones guardadas.';container.append(p);return;}
      for(const record of list){
        const row=document.createElement('div');row.className='history-row';
        const open=document.createElement('button');open.className='history-open';open.type='button';
        const strong=document.createElement('strong');strong.textContent=record.name||'Comparación sin título';
        const small=document.createElement('small');small.textContent=record.width+'×'+record.height+' · '+record.changedPercent.toFixed(2)+'% · '+new Date(record.savedAt).toLocaleDateString('es-AR');
        open.append(strong,small);open.addEventListener('click',()=>reopen(record));
        const del=document.createElement('button');del.className='delete';del.type='button';del.textContent='×';del.setAttribute('aria-label','Borrar '+(record.name||'comparación'));
        del.addEventListener('click',async()=>{try{await transaction('readwrite',(s)=>s.delete(record.id));await updateHistory();tell('Comparación eliminada del almacenamiento local.');}catch(e){tell('No se pudo borrar: '+e.message,'error');}});
        row.append(open,del);container.append(row);
      }
    }catch(e){$('history').textContent='El historial no está disponible: '+e.message; $('historyCount').textContent='NO DISPONIBLE';}
  };
  async function reopen(record){
    try{
      state.threshold=record.threshold;$('threshold').value=record.threshold;
      state.manifest=record.manifest||null;
      const a=new File([record.aBlob],record.aName,{type:record.aBlob.type||'image/png'});
      const b=new File([record.bBlob],record.bName,{type:record.bBlob.type||'image/png'});
      const [newA,newB]=await Promise.all([inspect(a),inspect(b)]);
      if(state.a?.url)URL.revokeObjectURL(state.a.url);
      if(state.b?.url)URL.revokeObjectURL(state.b.url);
      state.a=newA;state.b=newB;state.savedId=record.id;
      $('comparisonName').value=record.name||'';
      await startLoad();
      tell('Comparación recuperada desde IndexedDB: '+(record.name||record.id),'success');
    }catch(e){tell('No se pudo recuperar el historial: '+e.message,'error');}
  }
  $('fileA').addEventListener('change',(e)=>ingest('A',e.target.files?.[0]));
  $('fileB').addEventListener('change',(e)=>ingest('B',e.target.files?.[0]));
  for(const [id,slot] of [['dropA','A'],['dropB','B']]){
    const box=$(id);
    box.addEventListener('dragover',(e)=>{e.preventDefault();box.classList.add('drag');});
    box.addEventListener('dragleave',()=>box.classList.remove('drag'));
    box.addEventListener('drop',(e)=>{e.preventDefault();box.classList.remove('drag');ingest(slot,e.dataTransfer?.files?.[0]);});
  }
  $('fileManifest').addEventListener('change',async(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    try {
      const manifest=JSON.parse(await file.text());
      if(manifest.schema!=='lupa.capture.v1' || !Array.isArray(manifest.images))throw Error('Se esperaba lupa.capture.v1 con images[]');
      state.manifest=manifest;provenance();
      tell(state.provenance==='MANIFEST_HASH_MATCH'?'Manifiesto: hashes y viewport coinciden.':'Manifiesto importado; verificá que coincida con el par.');
    }catch(err){state.manifest=null;tell('Manifiesto inválido: '+err.message,'error');}
  });
  $('threshold').addEventListener('input',(e)=>{state.threshold=+e.target.value;$('activeThreshold').textContent=state.threshold;$('thresholdText').textContent=state.threshold;calculate();});
  $('scrub').addEventListener('input',(e)=>moveTo(+e.target.value));
  document.querySelectorAll('.mode').forEach((b)=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;renderMode();}));
  let dragging=false;
  $('picture').addEventListener('pointerdown',(e)=>{if(state.mode!=='split')return;dragging=true;$('picture').setPointerCapture(e.pointerId);scrubPointer(e);});
  $('picture').addEventListener('pointermove',(e)=>{if(dragging) scrubPointer(e);});
  $('picture').addEventListener('pointerup',()=>{dragging=false;});
  $('picture').addEventListener('pointercancel',()=>{dragging=false;});
  $('picture').addEventListener('keydown',(e)=>{
    if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveTo(state.position+(e.key==='ArrowLeft'?-2:2));}
    if(e.key==='Home'){e.preventDefault();moveTo(0);}if(e.key==='End'){e.preventDefault();moveTo(100);}
  });
  function scrubPointer(e){const r=$('picture').getBoundingClientRect();moveTo((e.clientX-r.left)/r.width*100);}
  $('save').addEventListener('click',async()=>{
    if(!state.ready)return;
    const id=state.savedId||'lupa-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
    const record={id,savedAt:new Date().toISOString(),name:$('comparisonName').value.trim()||'Comparación sin título',
      width:state.width,height:state.height,threshold:state.threshold,changedPercent:state.changed/state.total*100,
      aBlob:state.a.file,bBlob:state.b.file,aName:state.a.file.name,bName:state.b.file.name,manifest:state.manifest};
    try{await transaction('readwrite',(s)=>s.put(record));state.savedId=id;await updateHistory();tell('Guardado local confirmado. Podés cerrar y reabrir esta comparación.','success');}
    catch(e){tell('No se pudo guardar el historial: '+e.message,'error');}
  });
  $('reset').addEventListener('click',()=>{
    ++state.token;
    if(state.a?.url)URL.revokeObjectURL(state.a.url);
    if(state.b?.url)URL.revokeObjectURL(state.b.url);
    state.a=null;state.b=null;state.aSHA=null;state.bSHA=null;state.manifest=null;state.savedId=null;
    $('fileA').value='';$('fileB').value='';$('fileManifest').value='';$('comparisonName').value='';
    clearPictures();fileLabel('A',null);fileLabel('B',null);provenance();tell('Inspector limpio; no se borró el historial.');
  });
  $('downloadA').addEventListener('click',()=>{if(state.ready)download(state.a.file,'lupa-A-'+state.width+'x'+state.height+'.'+state.a.file.name.split('.').pop());});
  $('downloadB').addEventListener('click',()=>{if(state.ready)download(state.b.file,'lupa-B-'+state.width+'x'+state.height+'.'+state.b.file.name.split('.').pop());});
  $('downloadDiff').addEventListener('click',()=>{if(state.ready)$('diff').toBlob((blob)=>blob?download(blob,'lupa-diff-'+state.width+'x'+state.height+'.png'):tell('No se pudo exportar el PNG de diferencias.','error'),'image/png');});
  $('downloadManifest').addEventListener('click',()=>{if(state.ready)download(new Blob([JSON.stringify(evidence(),null,2)+'\n'],{type:'application/json'}),'lupa-evidence-'+state.width+'x'+state.height+'.json');});
  renderMode();updateHistory();
})();