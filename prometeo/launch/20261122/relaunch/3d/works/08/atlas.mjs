import {GEO,empty,basin,rivers,terrainURL,probeTile,LRU,formatDegrees,coordinatesOf,validBBox} from './geo-loader.mjs';
const $=id=>document.getElementById(id);
const sites={
 region:{name:'Cuenca Grand Canyon',center:[-112.64,36.21],zoom:7.25,pitch:61,bearing:-17},
 village:{name:'South Rim / Grand Canyon Village',center:[-112.121516,36.000117],zoom:12.05,pitch:68,bearing:-39},
 desert:{name:'Desert View',center:[-111.827023,36.043304],zoom:12.2,pitch:69,bearing:26},
 toroweap:{name:'Tuweep / Toroweap (posición aproximada)',center:[-113.056,36.216],zoom:11.9,pitch:66,bearing:-18}
};
const state={engine:'PENDING',dem:'PENDING',wbd:'PENDING',flow:'PENDING',topo:'PENDING',geoChecked:'NOT_RUN',flowCount:0,terrainLoaded:false,meta:[],lastDataAt:null};
let map=null,threeD=true,controller=null,riverTimer,riverTicket=0,wbdCache=null;
const cache=new LRU(12),checked=[];
const clock=()=>new Date().toISOString();
function record(kind,status,detail){checked.push({at:clock(),kind,status,detail});checked.splice(0,Math.max(0,checked.length-20));sync()}
function sync(){
 const names={dem:'Relieve',wbd:'Cuenca',flow:'Hidrografía'};
 const lines=Object.entries(names).map(([k,v])=>`${v}: ${state[k]}`).join(' · ');
 const failures=['dem','wbd','flow'].filter(k=>state[k]==='FAILED');
 const main=$('state');main.textContent=failures.length?`Fuente no disponible: ${failures.map(k=>names[k]).join(', ')}. Abrí «Capas + datos».`:lines;
 main.dataset.ok=String(!failures.length);main.dataset.complete=String(['dem','wbd','flow'].every(k=>['PASS','DEFERRED'].includes(state[k])));
 $('status-inside').innerHTML=`<strong>Actualización:</strong> ${state.lastDataAt?new Date(state.lastDataAt).toLocaleString('es-AR'):'sin respuesta de datos'}<br><strong>Relieve:</strong> ${state.dem}<br><strong>WBD:</strong> ${state.wbd}<br><strong>3DHP:</strong> ${state.flow} · ${state.flowCount} tramos visibles<br><strong>Revisión geográfica:</strong> ${state.geoChecked}`;
 $('diagnostics').textContent=checked.length?checked.slice(-9).map(x=>`${x.at.slice(11,19)} ${x.status} ${x.kind} · ${x.detail}`).join('\n'):'Las respuestas reales todavía no fueron observadas';
}
function toggleSheet(force){const open=force??!document.body.classList.contains('sheet-open');document.body.classList.toggle('sheet-open',open);$('info').setAttribute('aria-expanded',String(open));}
$('info').onclick=()=>toggleSheet();$('close').onclick=()=>toggleSheet(false);$('shade').onclick=()=>toggleSheet(false);document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleSheet(false)});
function source(){return {type:'raster-dem',tiles:[GEO.dem],tileSize:256,encoding:'terrarium',maxzoom:15,attribution:'Mapzen Terrain Tiles / AWS Open Data (múltiples fuentes; ver atribuciones)'}}
function style(){return {version:8,name:'Grand Canyon / Atlas de una cuenca',sources:{
  land:{type:'geojson',data:empty()},'terrain-dem':source(),'hill-dem':source(),
  topo:{type:'raster',tiles:[GEO.topo],tileSize:256,maxzoom:16,attribution:'USGS The National Map'},
  basin:{type:'geojson',data:empty(),attribution:'U.S. Geological Survey · WBD HUC8'},
  flow:{type:'geojson',data:empty(),attribution:'U.S. Geological Survey · 3DHP'}},
  layers:[
   {id:'background',type:'background',paint:{'background-color':'#928a76'}},
   {id:'topography',type:'raster',source:'topo',paint:{'raster-opacity':0.78,'raster-saturation':-0.46,'raster-contrast':0.12,'raster-fade-duration':0}},
   {id:'relief',type:'hillshade',source:'hill-dem',paint:{'hillshade-exaggeration':0.62,'hillshade-shadow-color':'#483e3b','hillshade-highlight-color':'#f4e9d5','hillshade-accent-color':'#b78a67'}},
   {id:'basin-area',type:'fill',source:'basin',paint:{'fill-color':'#e8ab6a','fill-opacity':0.065}},
   {id:'basin-outer',type:'line',source:'basin',paint:{'line-color':'#2b3837','line-width':['interpolate',['linear'],['zoom'],6,3.5,12,6],'line-opacity':0.7}},
   {id:'basin-border',type:'line',source:'basin',paint:{'line-color':'#f3c18a','line-width':['interpolate',['linear'],['zoom'],6,1.5,12,2.3],'line-dasharray':[2.6,1.6]}},
   {id:'water-outer',type:'line',source:'flow',paint:{'line-color':'#193e46','line-width':['interpolate',['linear'],['zoom'],9,3,13,7],'line-opacity':0.86}},
   {id:'water-flow',type:'line',source:'flow',paint:{'line-color':'#8fdae1','line-width':['interpolate',['linear'],['zoom'],9,1.4,13,3.2],'line-opacity':0.96}}
  ],terrain:{source:'terrain-dem',exaggeration:1}}}
function visibleBounds(){if(!map)return null;const b=map.getBounds();const c=[b.getWest(),b.getSouth(),b.getEast(),b.getNorth()];return validBBox(c)?c:null}
function bindLayers(){
 const flip=(input,layers)=>$(input).addEventListener('change',e=>layers.forEach(id=>map.setLayoutProperty(id,'visibility',e.target.checked?'visible':'none')));
 flip('wbd',['basin-area','basin-outer','basin-border']);flip('topo',['topography']);flip('hill',['relief']);
 $('flow').addEventListener('change',e=>{['water-outer','water-flow'].forEach(id=>map.setLayoutProperty(id,'visibility',e.target.checked?'visible':'none'));if(e.target.checked)queueFlow();else{controller?.abort();state.flow='DEFERRED';sync()}});
 $('height').addEventListener('input',e=>{const v=+e.target.value;$('heightout').textContent=v.toFixed(2);if(threeD)map.setTerrain({source:'terrain-dem',exaggeration:v})});
 $('mode').onclick=()=>{threeD=!threeD;$('mode').setAttribute('aria-pressed',String(threeD));map.setTerrain(threeD?{source:'terrain-dem',exaggeration:+$('height').value}:null);map.easeTo({pitch:threeD?65:0,duration:650,essential:true});record('PERSPECTIVA','INTERACTIVE',threeD?'3D terrain activo':'planta 2D')};
 document.querySelectorAll('[data-site]').forEach(b=>b.onclick=()=>go(b.dataset.site));
}
function go(key){const s=sites[key];if(!s||!map)return;document.querySelectorAll('[data-site]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.site===key)));map.flyTo({center:s.center,zoom:s.zoom,pitch:threeD?s.pitch:0,bearing:s.bearing,essential:true,speed:1.1});toggleSheet(false);record('RECORRIDO','INTERACTIVE',s.name)}
function landmarks(gl){Object.entries(sites).filter(([k])=>k!=='region').forEach(([k,s])=>{const b=document.createElement('button');b.className='poi';b.type='button';b.setAttribute('aria-label','Ir a '+s.name);const i=document.createElement('i');const span=document.createElement('span');span.textContent=s.name;b.append(i,span);b.onclick=()=>go(k);new gl.Marker({element:b,anchor:'center'}).setLngLat(s.center).addTo(map)})}
async function getBasin(){try{wbdCache=await basin();map.getSource('basin').setData(wbdCache);const coords=coordinatesOf(wbdCache.features[0]);if(coords.length<4)throw Error('Polígono devuelto sin vértices válidos');state.wbd='PASS';state.lastDataAt=clock();record('USGS WBD','OBSERVED',`HUC8 ${GEO.huc8} con ${coords.length} vértices; GeoJSON válido`);checkGeoref();}catch(e){state.wbd='FAILED';record('USGS WBD','FAILED',e.message)}}
async function checkGeoref(){if(!wbdCache||!map)return;const c=coordinatesOf(wbdCache.features[0]);const focus=c[0];if(!focus)return;
 // The check is deliberately basic: verifies CRS projection round-trip, NOT visual overlay quality.
 const px=map.project(focus),back=map.unproject(px);const drift=Math.hypot(back.lng-focus[0],back.lat-focus[1]);state.geoChecked=Number.isFinite(drift)&&drift<0.0005?'PROJECT_ROUNDTRIP_PASS · OVERLAY_NOT_RUN':'PROJECT_ROUNDTRIP_FAIL';record('EPSG 4326→3857→4326',state.geoChecked.startsWith('PROJECT_ROUNDTRIP_PASS')?'LOGIC_PASS':'FAILED',`drift=${drift.toExponential(2)}° (no acredita solapamiento visual)`)}
function queueFlow(){clearTimeout(riverTimer);riverTimer=setTimeout(getFlow,500)}
async function getFlow(){if(!map||!$('flow').checked)return;const z=map.getZoom();if(z<9){controller?.abort();map.getSource('flow').setData(empty());state.flow='DEFERRED';state.flowCount=0;sync();return}const bbox=visibleBounds();if(!bbox){state.flow='FAILED';record('USGS 3DHP','FAILED','BBox fuera de límites Web Mercator');return}
 const minKm=z<10?5:z<12?1:0.2;const rounded=bbox.map(v=>Math.round(v*100)/100);const key=JSON.stringify([rounded,minKm]);const hit=cache.get(key);if(hit){map.getSource('flow').setData(hit.data);state.flow='PASS';state.flowCount=hit.data.features.length;sync();return}
 controller?.abort();const activeController=new AbortController();controller=activeController;const ticket=++riverTicket;state.flow='PENDING';sync();
 const timeout=setTimeout(()=>activeController.abort(),18000);
 try{const out=await rivers(bbox,z,fetch,activeController.signal);if(ticket!==riverTicket||activeController.signal.aborted)return;
 const good=out.data.features.filter(f=>coordinatesOf(f).length>=2);if(!good.length)throw Error('Sin tramos comprobables en la vista');
 const data={type:'FeatureCollection',features:good};map.getSource('flow').setData(data);cache.set(key,{data,truncated:out.truncated});state.flow='PASS';state.flowCount=good.length;state.lastDataAt=clock();record('USGS 3DHP','OBSERVED',`${good.length} tramos, ${out.pages} páginas${out.truncated?' (muestra parcial)':''}`);
 }catch(e){if(ticket!==riverTicket)return;if(e.name==='AbortError'){state.flow='DEFERRED';record('USGS 3DHP','NOT_RUN','Consulta cancelada por navegación o timeout')}else{state.flow='FAILED';record('USGS 3DHP','FAILED',e.message)}}finally{clearTimeout(timeout);sync()}}
async function boot(){sync();let gl;
 try{gl=await import('https://cdn.jsdelivr.net/npm/maplibre-gl@6.19.0/dist/maplibre-gl.mjs');if(!gl.supported())throw Error('WebGL no disponible');state.engine='PASS';record('MAPLIBRE','OBSERVED','Módulo y WebGL disponibles en el navegador');}
 catch(e){state.engine='FAILED';state.dem='FAILED';state.wbd='DEFERRED';state.flow='DEFERRED';record('MOTOR','FAILED',e.message);return}
 try{map=new gl.Map({container:'map',style:style(),center:sites.region.center,zoom:sites.region.zoom,pitch:sites.region.pitch,bearing:sites.region.bearing,antialias:true,preserveDrawingBuffer:false,maxZoom:15,minZoom:6,maxPitch:75,renderWorldCopies:false,attributionControl:false});}
 catch(e){state.engine='FAILED';record('MAP','FAILED',e.message);return}
 map.addControl(new gl.ScaleControl({unit:'metric',maxWidth:110}),'bottom-left');map.addControl(new gl.AttributionControl({compact:true}),'bottom-right');
 map.on('error',e=>{const msg=String(e.error?.message||e.error||'error');if(/terrarium|elevation-tiles-prod/i.test(msg)){state.dem='FAILED';record('DEM','FAILED',msg.slice(0,110))}else if(/USGSTopo|basemap.nationalmap/i.test(msg))record('USGS TOPO','FAILED',msg.slice(0,110));else console.warn('Atlas runtime:',msg)});
 map.on('sourcedata',e=>{if(e.sourceId==='terrain-dem'&&e.isSourceLoaded&&!state.terrainLoaded){state.terrainLoaded=true;if(state.dem==='PASS')record('MAPLIBRE DEM','OBSERVED','La fuente DEM terminó de cargar en el renderer')}});
 map.on('moveend',queueFlow);
 map.once('load',()=>{bindLayers();landmarks(gl);getBasin();queueFlow();record('ESCENA','IMPLEMENTED','Mapa WebGL inicializado; fuentes remotas por separado')});
 try{const r=await probeTile(terrainURL(sites.village.center[0],sites.village.center[1],9));state.dem='PASS';record('TERRARIUM TILE','OBSERVED',`${r.width}×${r.height}; z9; decodificación de imagen`);}catch(e){state.dem='FAILED';record('TERRARIUM TILE','FAILED',e.message)}
}
boot();