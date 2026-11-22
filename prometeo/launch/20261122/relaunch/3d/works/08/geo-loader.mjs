/** Atlas de una cuenca · W7 independent reusable remote data/tile loader.
 * GeoJSON coordinates EPSG:4326. Map display EPSG:3857. Does not fabricate geography.
 */
export const GEO = Object.freeze({
  huc8:'15010002', label:'Grand Canyon',
  wbd:'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/FeatureServer/4/query',
  flow:'https://3dhp.nationalmap.gov/arcgis/rest/services/usgs_3dhp_all/FeatureServer/50/query',
  dem:'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  topo:'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
  retrieved:'2026-11-22', dataCRS:'EPSG:4326', renderCRS:'EPSG:3857'
});
export const empty = () => ({type:'FeatureCollection',features:[]});
export function validBBox(b){return Array.isArray(b)&&b.length===4&&b.every(Number.isFinite)&&b[0]>=-180&&b[2]<=180&&b[1]>=-85.051129&&b[3]<=85.051129&&b[0]<b[2]&&b[1]<b[3]}
export function tileXYZ(lon,lat,z){
  if(!Number.isFinite(lon)||!Number.isFinite(lat)||!Number.isInteger(z)||z<0||z>15||lon< -180||lon>180||lat< -85.051129||lat>85.051129) throw Error('Coordenadas de tesela fuera de Web Mercator');
  const n=2**z,phi=lat*Math.PI/180;
  return {z,x:Math.min(n-1,Math.max(0,Math.floor((lon+180)/360*n))),y:Math.min(n-1,Math.max(0,Math.floor((1-Math.asinh(Math.tan(phi))/Math.PI)/2*n)))};
}
export function terrainURL(lon,lat,z=9){const t=tileXYZ(lon,lat,z);return GEO.dem.replace('{z}',t.z).replace('{x}',t.x).replace('{y}',t.y)}
export function buildArcGIS(endpoint,{where='1=1',bbox,limit=500,offset=0,outFields='*'}={}){
  if(![GEO.wbd,GEO.flow].includes(endpoint))throw Error('Solo endpoints aprobados');
  if(bbox&&!validBBox(bbox))throw Error('bbox inválido');
  if(!Number.isInteger(limit)||limit<1||limit>1000||!Number.isInteger(offset)||offset<0)throw Error('paginación inválida');
  const q=new URLSearchParams({f:'geojson',where,outFields,returnGeometry:'true',outSR:'4326',geometryPrecision:'5',resultRecordCount:String(limit),resultOffset:String(offset)});
  if(bbox)Object.entries({geometry:bbox.join(','),geometryType:'esriGeometryEnvelope',inSR:'4326',spatialRel:'esriSpatialRelIntersects'}).forEach(([k,v])=>q.set(k,v));
  return `${endpoint}?${q}`;
}
export function validCollection(doc){return doc?.type==='FeatureCollection'&&Array.isArray(doc.features)&&doc.features.every(f=>f?.type==='Feature'&&['Polygon','MultiPolygon','LineString','MultiLineString'].includes(f.geometry?.type)&&Array.isArray(f.geometry.coordinates))}
export async function pages(endpoint,options={},fetcher=fetch){
  const {signal,maxPages=2,limit=500,...query}=options;
  let features=[],truncated=false,seen=0;
  for(let page=0;page<maxPages;page++){
    const r=await fetcher(buildArcGIS(endpoint,{...query,limit,offset:page*limit}),{signal,mode:'cors'});
    if(!r.ok)throw Error(`HTTP ${r.status} en USGS`);
    const j=await r.json();if(j.error)throw Error(`ArcGIS: ${j.error.message||'error'}`);
    if(!validCollection(j))throw Error('GeoJSON incompleto o incompatible');
    features.push(...j.features);seen++;
    if(j.features.length<limit)return {data:{type:'FeatureCollection',features},pages:seen,truncated};
    if(page===maxPages-1)truncated=true;
  }
  return {data:{type:'FeatureCollection',features},pages:seen,truncated};
}
export function assertBasin(collection){
  if(!validCollection(collection))throw Error('Límite no es GeoJSON válido');
  const matches=collection.features.filter(f=>String(f.properties?.huc8??f.properties?.HUC8)==GEO.huc8&&['Polygon','MultiPolygon'].includes(f.geometry.type));
  if(matches.length!==1)throw Error('HUC8 no identificado inequívocamente');
  return {type:'FeatureCollection',features:matches};
}
export async function basin(fetcher=fetch,signal){
  const response=await pages(GEO.wbd,{where:"huc8='15010002'",outFields:'huc8,name,areasqkm',limit:5,maxPages:1,signal},fetcher);
  return assertBasin(response.data);
}
export async function rivers(bbox,zoom,fetcher=fetch,signal){
  if(!validBBox(bbox))throw Error('BBox de consulta de ríos inválido');
  const minKm=zoom<10?5:zoom<12?1:0.2;
  return pages(GEO.flow,{where:`featuretype=1 AND lengthkm>=${minKm}`,bbox,limit:500,maxPages:2,outFields:'id3dhp,featuretype,featuretypelabel,lengthkm,gnisidlabel,featuredate',signal},fetcher);
}
export class LRU {constructor(cap=10){this.cap=cap;this.items=new Map()}get(k){const v=this.items.get(k);if(v!==undefined){this.items.delete(k);this.items.set(k,v)}return v}set(k,v){this.items.delete(k);this.items.set(k,v);if(this.items.size>this.cap)this.items.delete(this.items.keys().next().value)}}
export function checkPoint([lon,lat],tol=0){return Number.isFinite(lon)&&Number.isFinite(lat)&&lon>=-180-tol&&lon<=180+tol&&lat>=-85.051129-tol&&lat<=85.051129+tol}
export function coordinatesOf(feature){const found=[];const walk=a=>{if(!Array.isArray(a))return;if(a.length>=2&&typeof a[0]==='number'&&typeof a[1]==='number'){if(checkPoint(a))found.push(a);return}a.forEach(walk)};walk(feature?.geometry?.coordinates);return found}
export async function probeTile(url,makeImage=()=>new Image(),timeout=12000){
  return new Promise((resolve,reject)=>{let done=false;const img=makeImage();const timer=setTimeout(()=>finish(Error('Tiempo agotado: tesela DEM')),timeout);
    const finish=(e)=>{if(done)return;done=true;clearTimeout(timer);img.onload=null;img.onerror=null;e?reject(e):resolve({url,width:img.naturalWidth,height:img.naturalHeight})};
    img.crossOrigin='anonymous';img.onload=()=>{if(img.naturalWidth!==256||img.naturalHeight!==256)finish(Error('Tesela DEM no es 256×256'));else finish()};img.onerror=()=>finish(Error('Tesela DEM no se pudo descargar o decodificar'));img.src=url;
  });
}
export function formatDegrees(lon,lat){return `${Math.abs(lat).toFixed(3)}° ${lat<0?'S':'N'} / ${Math.abs(lon).toFixed(3)}° ${lon<0?'O':'E'}`}