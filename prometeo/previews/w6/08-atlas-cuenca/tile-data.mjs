/**
 * Atlas de una cuenca · reusable geospatial tile + feature loader, v1.
 * Coordinates: GeoJSON EPSG:4326, rendering Web Mercator EPSG:3857.
 * No API keys or prepackaged proprietary basemap resources.
 */
export const ATLAS_DATA = Object.freeze({
  basin: 'Grand Canyon',
  huc8: '15010002',
  crsData: 'EPSG:4326',
  crsRender: 'EPSG:3857',
  terrain: {
    tile: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    source: 'Mapzen Terrain Tiles / AWS Open Data',
    registry: 'https://registry.opendata.aws/terrain-tiles/',
    coverage: 'Global; fuentes heterogéneas, resolución vertical y horizontal variable',
    observedAt: '2026-11-22'
  },
  boundaries: {
    endpoint: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/FeatureServer/4/query',
    description: 'USGS Watershed Boundary Dataset, HUC8 (subbasin)',
    refreshed: '2026-10',
    source: 'https://hydro.nationalmap.gov/arcgis/rest/services/wbd/FeatureServer/4'
  },
  flowlines: {
    endpoint: 'https://3dhp.nationalmap.gov/arcgis/rest/services/usgs_3dhp_all/FeatureServer/50/query',
    description: 'USGS 3D Hydrography Program (3DHP) · Flowline',
    refreshed: '2026-09-04',
    source: 'https://3dhp.nationalmap.gov/arcgis/rest/services/usgs_3dhp_all/FeatureServer/50'
  },
  topo: {
    tile: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
    source: 'USGS The National Map, topographic basemap',
    metadata: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer'
  }
});

export const emptyFeatureCollection = () => ({type: 'FeatureCollection', features: []});
export const terrainSource = () => ({
  type: 'raster-dem',
  tiles: [ATLAS_DATA.terrain.tile],
  tileSize: 256,
  encoding: 'terrarium',
  minzoom: 0,
  maxzoom: 15,
  attribution: 'Mapzen/Tilezen · AWS Terrain Tiles · NASA SRTM &amp; proveedores de origen (ver fuentes)'
});
export function atlasSources() {
  return {
    'terrain-dem': terrainSource(),
    'hillshade-dem': terrainSource(),
    'usgs-topo': {type: 'raster', tiles: [ATLAS_DATA.topo.tile], tileSize: 256, maxzoom: 16,
      attribution: 'USGS The National Map'},
    'usgs-wbd': {type: 'geojson', data: emptyFeatureCollection()},
    'usgs-rivers': {type: 'geojson', data: emptyFeatureCollection()}
  };
}
export function validBBox(bbox) {
  if (!Array.isArray(bbox) || bbox.length !== 4 || !bbox.every(Number.isFinite)) return false;
  const [west, south, east, north] = bbox;
  return west >= -180 && east <= 180 && south >= -90 && north <= 90 && west < east && south < north;
}
export function featureBBoxValid(feature, bbox) {
  if (!feature?.geometry || !validBBox(bbox)) return false;
  const coords = [];
  (function walk(x) {
    if (!Array.isArray(x)) return;
    if (x.length >= 2 && Number.isFinite(x[0]) && Number.isFinite(x[1])) coords.push(x);
    else for (const y of x) walk(y);
  })(feature.geometry.coordinates);
  // Allow a real river segment that crosses the current bbox while endpoints are outside;
  // this check is intentionally only a broad sanity check, not GIS polygon clipping.
  return coords.some(c => c[0] >= -180 && c[0] <= 180 && c[1] >= -90 && c[1] <= 90);
}
export function makeQueryURL(endpoint, {where='1=1', bbox, outFields='*', offset=0, limit=800, precision=5} = {}) {
  if (!endpoint.startsWith('https://') || !endpoint.endsWith('/query')) throw new Error('Endpoint ArcGIS HTTPS inválido');
  if (!Number.isInteger(limit) || limit < 1 || limit > 2500) throw new Error('Límite por página inválido');
  if (bbox !== undefined && !validBBox(bbox)) throw new Error('Bounding box EPSG:4326 inválido');
  const q = new URLSearchParams({
    f: 'geojson', where, outFields, returnGeometry:'true', outSR:'4326',
    resultRecordCount: String(limit), resultOffset: String(offset), geometryPrecision: String(precision)
  });
  if (bbox) {
    q.set('geometry', bbox.join(','));
    q.set('geometryType', 'esriGeometryEnvelope');
    q.set('inSR', '4326');
    q.set('spatialRel', 'esriSpatialRelIntersects');
  }
  return endpoint + '?' + q;
}
export async function loadGeoJSON(endpoint, options={}, fetcher=fetch) {
  const {signal, maxPages=2, limit=800, maxFeatures=1600, ...queryOptions} = options;
  const out = emptyFeatureCollection();
  let truncated=false;
  for (let page=0; page<maxPages && out.features.length<maxFeatures; page++) {
    if (signal?.aborted) throw new DOMException('Operación cancelada', 'AbortError');
    const url = makeQueryURL(endpoint, {...queryOptions, offset:page*limit, limit});
    const response = await fetcher(url, {signal, mode:'cors', cache:'default'});
    if (!response.ok) throw new Error('Servicio HTTP ' + response.status);
    const data = await response.json();
    if (data.error) throw new Error('ArcGIS: ' + (data.error.message || 'error del servicio'));
    if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Respuesta no es GeoJSON FeatureCollection');
    const valid = data.features.filter(f => f?.type === 'Feature' && f?.geometry && f.geometry.coordinates);
    out.features.push(...valid.slice(0, maxFeatures-out.features.length));
    if (data.exceededTransferLimit || (valid.length >= limit && page === maxPages-1)) truncated=true;
    if (valid.length < limit) return {data:out, truncated, pages:page+1};
  }
  return {data:out, truncated:true, pages:maxPages};
}
export class FeatureCache {
  constructor(maxSize=12) {this.maxSize=maxSize; this.entries=new Map();}
  get(key) {if(!this.entries.has(key))return null; const value=this.entries.get(key);this.entries.delete(key);this.entries.set(key,value);return value;}
  set(key,value) {this.entries.delete(key);this.entries.set(key,value);if(this.entries.size>this.maxSize) this.entries.delete(this.entries.keys().next().value);}
}
export function assertBasinResponse(data, code=ATLAS_DATA.huc8) {
  if (!data || data.type!=='FeatureCollection') throw new Error('Límite de cuenca sin formato GeoJSON');
  const selected = data.features.filter(feature => {
    const p = feature.properties || {};
    return String(p.huc8 ?? p.HUC8 ?? '') === code && ['Polygon','MultiPolygon'].includes(feature.geometry?.type);
  });
  if (!selected.length) throw new Error('El servicio no devolvió el polígono HUC8 ' + code);
  return {type:'FeatureCollection',features:selected};
}
export function formatLonLat(lon,lat) {
  if (![lon,lat].every(Number.isFinite)) throw new Error('Coordenadas inválidas');
  return `${Math.abs(lat).toFixed(4)}° ${lat>=0?'N':'S'} · ${Math.abs(lon).toFixed(4)}° ${lon>=0?'E':'O'}`;
}