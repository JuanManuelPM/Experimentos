import assert from 'node:assert/strict';
import {ATLAS_DATA, atlasSources, terrainSource, makeQueryURL, loadGeoJSON, FeatureCache, assertBasinResponse, validBBox, formatLonLat} from './tile-data.mjs';
const log=[];
function test(name, fn){return Promise.resolve().then(fn).then(()=>log.push({test:name,status:'PASS'})).catch(e=>{log.push({test:name,status:'FAIL',error:String(e)});process.exitCode=1;});}
await test('Terrarium DEM auténtico, dos fuentes separadas y encoding correcto',()=>{
 const s=atlasSources();assert.equal(s['terrain-dem'].encoding,'terrarium');assert.notEqual(s['terrain-dem'],s['hillshade-dem']);assert.match(terrainSource().tiles[0],/elevation-tiles-prod/);assert.ok(s['usgs-wbd']&&s['usgs-rivers']);
});
await test('Consulta ArcGIS GeoJSON WGS84 por HUC8, sin key',()=>{
 const url=new URL(makeQueryURL(ATLAS_DATA.boundaries.endpoint,{where:"huc8='15010002'",outFields:'huc8,name,areasqkm'}));assert.equal(url.searchParams.get('outSR'),'4326');assert.equal(url.searchParams.get('f'),'geojson');assert.equal(url.searchParams.get('where'),"huc8='15010002'");assert.ok(!url.searchParams.has('token'));
});
await test('BBox válido y paginación ArcGIS para capa fluvial',()=>{
 const bbox=[-113.5,35.7,-112,36.5];assert.ok(validBBox(bbox));assert.ok(!validBBox([-111,37,-113,36]));const q=new URL(makeQueryURL(ATLAS_DATA.flowlines.endpoint,{where:'featuretype=1 AND lengthkm>=3',bbox,limit:600,offset:600})).searchParams;assert.equal(q.get('geometry'),bbox.join(','));assert.equal(q.get('inSR'),'4326');assert.equal(q.get('resultOffset'),'600');
});
await test('Sin FeatureCollection no se finge carga real',async()=>{
 await assert.rejects(()=>loadGeoJSON(ATLAS_DATA.boundaries.endpoint,{},async()=>({ok:true,json:async()=>({type:'Feature',geometry:{}})})),/FeatureCollection/);
});
await test('Filtro HUC8 no acepta otra unidad ni geometría ajena',()=>{
 const d={type:'FeatureCollection',features:[{type:'Feature',properties:{huc8:'15010001'},geometry:{type:'Polygon',coordinates:[]}}]};assert.throws(()=>assertBasinResponse(d),/15010002/);d.features.push({type:'Feature',properties:{huc8:'15010002'},geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,0]]]}});assert.equal(assertBasinResponse(d).features.length,1);
});
await test('No marcar éxito con error de servicio, soportar CORS/HTTP',async()=>{
 await assert.rejects(()=>loadGeoJSON(ATLAS_DATA.flowlines.endpoint,{},async()=>({ok:false,status:503})),/503/);
});
await test('Cache limitada LRU conserva resultados más recientes',()=>{
 const c=new FeatureCache(2);c.set('a',1);c.set('b',2);c.get('a');c.set('c',3);assert.equal(c.get('b'),null);assert.equal(c.get('a'),1);
});
await test('Referencias de coordenadas y presentación hemisférica',()=>{
 assert.equal(formatLonLat(-112.14,36.05),'36.0500° N · 112.1400° O');assert.equal(ATLAS_DATA.crsRender,'EPSG:3857');
});
console.log(JSON.stringify({suite:'3d-w6-08',executedAt:'2026-11-22',results:log,passed:log.filter(x=>x.status==='PASS').length,total:log.length},null,2));