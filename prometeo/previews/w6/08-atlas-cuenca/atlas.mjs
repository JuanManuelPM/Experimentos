import {ATLAS_DATA, atlasSources, emptyFeatureCollection, loadGeoJSON, assertBasinResponse, FeatureCache, formatLonLat, validBBox} from './tile-data.mjs';

const $ = id => document.getElementById(id);
const ui = {
  terrain: $('terrain-status'), basin: $('basin-status'), rivers: $('river-status'),
  lonlat: $('coords'), zoom: $('zoom'), pitch: $('pitch'),
  side: $('side'), panel: $('toggle-panel'), elevation: $('exaggeration'),
  value: $('exagg-value'), toast: $('toast')
};
const points = {
  regional:{center:[-112.7,36.22],zoom:7.25,pitch:57,bearing:-16,label:'Región de la subcuenca'},
  'grand-canyon':{center:[-112.121516,36.000117],zoom:11.75,pitch:68,bearing:-42,label:'Grand Canyon Village · Recreation.gov'},
  'desert-view':{center:[-111.827023,36.043304],zoom:12.1,pitch:70,bearing:27,label:'Desert View · National Park Service'},
  toroweap:{center:[-113.056,36.216],zoom:12.3,pitch:70,bearing:-22,label:'Tuweep / Toroweap · ubicación aproximada'}
};
const updateStatus=(el, message, state='')=>{el.textContent=message;el.className='status'+(state?' '+state:'');};
function toast(text){ui.toast.textContent=text;ui.toast.style.display='block';clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>ui.toast.style.display='none',3900);}
function togglePanel(force){const open=force===undefined?!document.body.classList.contains('panel-open'):!!force;document.body.classList.toggle('panel-open',open);ui.panel.setAttribute('aria-expanded',String(open));ui.panel.textContent=open?'× Cerrar capas':'☷ Capas y datos';}
ui.panel.addEventListener('click',()=>togglePanel());
window.addEventListener('keydown',event=>{if(event.key==='Escape')togglePanel(false)});

let map, is3d=true, basinReady=false, riverRequest=0, riverController=null;
const riverCache=new FeatureCache(12);

async function init(){
  let maplibregl;
  try {maplibregl=await import('https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs');}
  catch(error){failEngine('No se pudo cargar MapLibre. Requiere internet para el motor WebGL.', error);return;}
  if(!maplibregl.supported()){failEngine('Este navegador no admite WebGL. El atlas necesita aceleración gráfica.');return;}

  const sources = atlasSources();
  const style={version:8,name:'Atlas de una cuenca · Grand Canyon',sources,
    layers:[
      {id:'land',type:'background',paint:{'background-color':'#c0ac90'}},
      {id:'topographic',type:'raster',source:'usgs-topo',paint:{'raster-opacity':0.91,'raster-fade-duration':220}},
      {id:'relief-shading',type:'hillshade',source:'hillshade-dem',paint:{'hillshade-exaggeration':0.48,'hillshade-shadow-color':'#563a35','hillshade-highlight-color':'#fcf0d6','hillshade-accent-color':'#aa775d'}},
      {id:'basin-fill',type:'fill',source:'usgs-wbd',paint:{'fill-color':'#f3a75e','fill-opacity':0.095}},
      {id:'basin-line-halo',type:'line',source:'usgs-wbd',paint:{'line-color':'#372421','line-width':4,'line-opacity':0.48}},
      {id:'basin-line',type:'line',source:'usgs-wbd',paint:{'line-color':'#ffbd78','line-width':2.4,'line-opacity':0.95,'line-dasharray':[3,1.3]}},
      {id:'streams-halo',type:'line',source:'usgs-rivers',paint:{'line-color':'#133d50','line-width':['interpolate',['linear'],['zoom'],7,2.5,13,6.5],'line-opacity':0.85}},
      {id:'streams',type:'line',source:'usgs-rivers',paint:{'line-color':'#72e4f5','line-width':['interpolate',['linear'],['zoom'],7,1.1,13,3],'line-opacity':0.96}}
    ],
    terrain:{source:'terrain-dem',exaggeration:1}
  };
  try {
    map=new maplibregl.Map({
      container:'map',style,center:points.regional.center,zoom:points.regional.zoom,
      pitch:points.regional.pitch,bearing:points.regional.bearing,
      antialias:true,maxPitch:80,maxZoom:15,minZoom:4,hash:false,renderWorldCopies:false,trackResize:true,
      attributionControl:false
    });
  }catch(error){failEngine('El motor WebGL no pudo iniciar.',error);return;}
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true,showCompass:true}),'top-right');
  map.addControl(new maplibregl.ScaleControl({maxWidth:130,unit:'metric'}),'bottom-left');
  map.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
  map.on('error',event=>{
    const msg=String(event.error?.message||event.error||'Error de carga');
    if(/terrain|terrarium|elevation-tiles-prod|raster-dem/i.test(msg))updateStatus(ui.terrain,'Relieve: fallo de descarga de teselas','warn');
    else if(/USGSTopo|basemap.nationalmap/i.test(msg))toast('No se pudo cargar el mapa base USGS. El relieve sigue disponible si las teselas responden.');
    else console.warn('Atlas map resource:',msg);
  });
  let terrainLoaded=false;
  map.on('sourcedata',e=>{
    if(e.sourceId==='terrain-dem' && e.isSourceLoaded && !terrainLoaded){terrainLoaded=true;updateStatus(ui.terrain,'Relieve: teselas DEM disponibles','good');}
  });
  map.on('load',()=>{
    updateStatus(ui.terrain,'Relieve: consultando teselas reales…');
    installLandmarks(maplibregl);
    bindControls();
    updateMetrics();
    queryBasin();
    queueRivers();
  });
  map.on('move',updateMetrics);
  map.on('moveend',()=>{updateMetrics();queueRivers();});
  map.on('click',event=>{if(!event.originalEvent?.target?.closest?.('.maplibregl-marker')) ui.lonlat.textContent=formatLonLat(event.lngLat.lng,event.lngLat.lat);});
}
function failEngine(message,error){
  updateStatus(ui.terrain,message,'warn');updateStatus(ui.basin,'Consulta de límites: NO EJECUTADA','warn');updateStatus(ui.rivers,'Consulta de ríos: NO EJECUTADA','warn');
  if(error)console.error(error);
}
function installLandmarks(maplibregl){
  const a=[
    ['grand-canyon','VILLAGE',points['grand-canyon'].center],
    ['desert-view','DESERT VIEW',points['desert-view'].center],
    ['toroweap','TOROWEAP',points.toroweap.center]
  ];
  for(const [key,label,coord] of a){
    const marker=document.createElement('button');marker.type='button';marker.setAttribute('aria-label','Ir a '+label);
    marker.innerHTML='<i aria-hidden="true" style="display:block;width:9px;height:9px;background:#fee0b2;border:2px solid #2b4648;border-radius:50%;box-shadow:0 0 0 3px #213a3ba8;margin:auto"></i><span style="display:block;font:700 9px system-ui;letter-spacing:.09em;text-shadow:0 1px 4px #102a30;color:white;margin-top:6px">'+label+'</span>';
    marker.style.cssText='border:0;background:transparent;cursor:pointer;min-width:40px;min-height:45px;';
    marker.addEventListener('click',()=>visit(key));
    new maplibregl.Marker({element:marker,anchor:'center'}).setLngLat(coord).addTo(map);
  }
}
function getBBox(){const b=map.getBounds();let bbox=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()].map(Number);
  if(bbox[0]<-180)bbox[0]=-180;if(bbox[2]>180)bbox[2]=180;
  return validBBox(bbox)?bbox:null;
}
async function queryBasin(){
  updateStatus(ui.basin,'WBD: consultando HUC8 15010002…');
  try{
    const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
    let result;
    try{result=await loadGeoJSON(ATLAS_DATA.boundaries.endpoint,{where:"huc8='15010002'",outFields:'huc8,name,areasqkm',limit:5,maxPages:1,signal:controller.signal});}
    finally{clearTimeout(timeout)}
    const selected=assertBasinResponse(result.data);
    map.getSource('usgs-wbd').setData(selected);
    basinReady=true;
    const area=selected.features[0]?.properties?.areasqkm;
    const suffix=Number.isFinite(area)?` · ${Math.round(area).toLocaleString('es-AR')} km²`:'';
    updateStatus(ui.basin,'WBD: HUC8 15010002 cargada'+suffix,'good');
  }catch(error){basinReady=false;updateStatus(ui.basin,'WBD: no se pudo verificar la delimitación ('+(error.name==='AbortError'?'tiempo agotado':'servicio no disponible')+')','warn');console.warn('WBD',error);}
}
let delayRivers=0;
function queueRivers(){clearTimeout(delayRivers);delayRivers=setTimeout(queryRivers,420)}
async function queryRivers(){
  if(!map?.getSource('usgs-rivers'))return;
  if(!$('layer-rivers').checked){riverController?.abort();updateStatus(ui.rivers,'Hidrografía: capa oculta');return;}
  const zoom=map.getZoom();
  if(zoom<7.0){riverController?.abort();map.getSource('usgs-rivers').setData(emptyFeatureCollection());updateStatus(ui.rivers,'Ríos: acercá la vista para consultar datos');return;}
  const bbox=getBBox();if(!bbox)return;
  // Low zoom suppresses tiny segments; closer views preserve detail, with bounded requests.
  const minLength=zoom<9?5:zoom<11?1.5:0.3;
  const key=JSON.stringify([bbox.map(n=>Math.round(n*10)/10),minLength]);
  const cached=riverCache.get(key);
  if(cached){map.getSource('usgs-rivers').setData(cached.data);updateStatus(ui.rivers,`3DHP: ${cached.data.features.length} tramos · caché${cached.truncated?' (muestra parcial)':''}`,'good');return;}
  riverController?.abort();const controller=new AbortController();riverController=controller;
  const ticket=++riverRequest;
  const timeout=setTimeout(()=>controller.abort(),19000);
  updateStatus(ui.rivers,'3DHP: descargando cursos de agua…');
  try{
    const result=await loadGeoJSON(ATLAS_DATA.flowlines.endpoint,{
      where:`featuretype=1 AND lengthkm>=${minLength}`,bbox,
      outFields:'id3dhp,featuretype,gnisidlabel,lengthkm,featuredate',
      maxPages:2,limit:600,maxFeatures:1200,signal:controller.signal
    });
    if(ticket!==riverRequest || controller.signal.aborted)return;
    // Only render actual GeoJSON returned by USGS. Missing values stay missing.
    riverCache.set(key,result);
    map.getSource('usgs-rivers').setData(result.data);
    updateStatus(ui.rivers,`3DHP: ${result.data.features.length} tramos reales${result.truncated?' · muestra parcial':''}`,result.data.features.length?'good':'warn');
  }catch(error){
    if(ticket===riverRequest && !controller.signal.aborted)updateStatus(ui.rivers,'3DHP: error de servicio / conexión','warn');
    if(ticket===riverRequest && controller.signal.aborted && error.name==='AbortError')updateStatus(ui.rivers,'3DHP: solicitud interrumpida o vencida','warn');
    console.warn('USGS 3DHP',error);
  }finally{clearTimeout(timeout)}
}
function updateMetrics(){
  if(!map)return;
  const c=map.getCenter();ui.lonlat.textContent=formatLonLat(c.lng,c.lat);ui.zoom.textContent='z '+map.getZoom().toFixed(1);ui.pitch.textContent=Math.round(map.getPitch())+'°';
}
function visit(key){const p=points[key];if(!p||!map)return;
  map.flyTo({center:p.center,zoom:p.zoom,pitch:is3d?p.pitch:0,bearing:p.bearing,speed:1.0,essential:true});
  toast(p.label);if(matchMedia('(max-width:750px)').matches)togglePanel(false);
}
function set2D(twoD){
  is3d=!twoD;
  if(is3d){map.setTerrain({source:'terrain-dem',exaggeration:Number(ui.elevation.value)});map.easeTo({pitch:65,duration:800});}
  else{map.setTerrain(null);map.easeTo({pitch:0,duration:800});}
  $('btn-2d').classList.toggle('active',twoD);$('btn-3d').classList.toggle('active',!twoD);
}
function bindControls(){
  document.querySelectorAll('[data-point]').forEach(b=>b.addEventListener('click',()=>visit(b.dataset.point)));
  $('btn-2d').addEventListener('click',()=>set2D(true));$('btn-3d').addEventListener('click',()=>set2D(false));
  ui.elevation.addEventListener('input',()=>{
    const n=Number(ui.elevation.value);ui.value.textContent=n.toFixed(2)+'×';
    if(is3d)map.setTerrain({source:'terrain-dem',exaggeration:n});
  });
  $('layer-basin').addEventListener('change',e=>{
    ['basin-line','basin-line-halo','basin-fill'].forEach(id=>map.setLayoutProperty(id,'visibility',e.target.checked?'visible':'none'));
    if(e.target.checked&&!basinReady)queryBasin();
  });
  $('layer-rivers').addEventListener('change',e=>{
    ['streams','streams-halo'].forEach(id=>map.setLayoutProperty(id,'visibility',e.target.checked?'visible':'none'));
    if(e.target.checked)queueRivers();else riverController?.abort();
  });
  $('layer-topo').addEventListener('change',e=>map.setLayoutProperty('topographic','visibility',e.target.checked?'visible':'none'));
  $('layer-shade').addEventListener('change',e=>map.setLayoutProperty('relief-shading','visibility',e.target.checked?'visible':'none'));
}
init();