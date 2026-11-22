/** HERBARIUM · deterministic ecosystem and season model. Reusable independently of WebGL. MIT. */
export const WORLD_RADIUS = 107;
export const SEASONS = ['PRIMAVERA','VERANO','OTOÑO','INVIERNO'];
export const QUALITY = {
  eco: {dpr:0.65, leaves:0.40, grasses:0.24, rain:0.30, distance:70},
  balanced: {dpr:0.90, leaves:0.74, grasses:0.60, rain:0.62, distance:108},
  high: {dpr:1.15, leaves:1, grasses:1, rain:1, distance:160}
};
export const SP = Object.freeze({OAK:0,BIRCH:1,MAPLE:2,PINE:3,WILLOW:4});
export const SPECIES = Object.freeze([
  {id:0, common:'Roble', scientific:'Quercus robur', height:[9,15], deciduous:true},
  {id:1, common:'Abedul', scientific:'Betula pendula', height:[10,16], deciduous:true},
  {id:2, common:'Arce', scientific:'Acer campestre', height:[8,13], deciduous:true},
  {id:3, common:'Pino', scientific:'Pinus sylvestris', height:[12,19], deciduous:false},
  {id:4, common:'Sauce', scientific:'Salix alba', height:[8,12], deciduous:true}
]);
export function fract(x){return x-Math.floor(x)}
export function hash(x,z){return fract(Math.sin(x*127.1+z*311.7)*43758.5453)}
export function smooth(t){return t*t*(3-2*t)}
export function mix(a,b,t){return a+(b-a)*t}
export function noise(x,z){const i=Math.floor(x),j=Math.floor(z),u=smooth(fract(x)),v=smooth(fract(z));return mix(mix(hash(i,j),hash(i+1,j),u),mix(hash(i,j+1),hash(i+1,j+1),u),v)}
export function riverX(z){return -13+11*Math.sin(z*.025)+5*Math.sin(z*.064+1.2)}
export function riverWidth(z){return 4.2+1.7*(.5+.5*Math.sin(z*.073))}
export function riverDistance(x,z){return Math.abs(x-riverX(z))}
export function terrainHeight(x,z){
  const ridge=1.2*Math.sin(x*.028+z*.013)+1.3*Math.cos(z*.038-x*.017);
  const detail=(noise(x*.067,z*.067)-.5)*2.5+(noise(x*.16,z*.16)-.5)*.32;
  const dist=riverDistance(x,z),width=riverWidth(z);
  const riverBlend=smooth(Math.max(0,Math.min(1,(dist-width*.64)/8.5)));
  return mix(-1.45,ridge+detail+1.1,riverBlend);
}
export function waterHeight(z){return -0.74+0.10*Math.sin(z*.019)}
export function seasonalWeights(season){let s=((season%4)+4)%4;let i=Math.floor(s),f=smooth(s-i);return [0,1,2,3].map(n=>(n===i?1-f:0)+(n===(i+1)%4?f:0))}
export function seasonalCanopy(season,deciduous=true){if(!deciduous)return 1; const [sp,su,fa,wi]=seasonalWeights(season);return sp*.85+su*1+fa*.77+wi*.035}
export function rainIntensity(enabled){return enabled?1:0}
export function createRng(seed=609061){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}}
export function generateTrees(seed=609061,count=230){const rng=createRng(seed),trees=[];let attempts=0;while(trees.length<count&&attempts<count*50){attempts++;let x=(rng()*2-1)*102,z=(rng()*2-1)*102;
 if(Math.hypot(x,z)<10 || riverDistance(x,z)<riverWidth(z)+3.3)continue;
 if(trees.some(t=>Math.hypot(t.x-x,t.z-z)<(t.species===3?3.7:4.3)))continue;
 const wet=riverDistance(x,z)<19;
 const r=rng(),species=wet&&r<.26?SP.WILLOW:r<.25?SP.PINE:r<.48?SP.BIRCH:r<.72?SP.OAK:r<.94?SP.MAPLE:SP.PINE;
 const descriptor=SPECIES[species],height=mix(...descriptor.height,rng());
 trees.push({x,z,y:terrainHeight(x,z),species,height,radius:height*(species===3?.24:.26),phase:rng()*6.283,seed:Math.floor(rng()*1e9)});
 }return trees;
}
export function validateTrees(trees){return {count:trees.length,uniqueSpecies:[...new Set(trees.map(t=>t.species))].sort(),floating:trees.filter(t=>Math.abs(t.y-terrainHeight(t.x,t.z))>.05).length,riverIntrusion:trees.filter(t=>riverDistance(t.x,t.z)<riverWidth(t.z)+3.2).length};}