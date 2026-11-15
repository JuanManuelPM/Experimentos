/* PROMETEO · Preproduction source linter.
 * Conservative static signals, NOT a substitute for WebGL screenshots.
 * CLI: node scene-source-lint.mjs ../psx-night-drive/film.mjs [out.json]
 */
import {readFile,writeFile} from 'node:fs/promises';
export function inspectThreeSource(src){
 if(typeof src!=='string')throw new TypeError('Source JS required');
 const warnings=[];
 function flag(id,reg,severity,description,remediation){
  const matched=src.match(reg);
  if(matched)warnings.push({id,severity,signature:matched[0].slice(0,140),description,remediation,provenance:'source_regex'});
 }
 flag('RAIN_LINES',/function\s+(?:createRain|createPrecipitation)\s*\([^)]*\)\s*\{[\s\S]{0,1100}?new\s+THREE\.LineSegments/, 'BLOCK','Lluvia dibujada como líneas regulares','Comparar partículas en profundidad, oclusión y respuesta lumínica; renderizar 3 vistas');
 flag('ADDITIVE_ROTATION',/\.rotation\.(?:x|y|z)\s*\+=/,'REVIEW','Rotación incremental potencialmente no determinista','Definir pose desde estado base en cada t y comparar muestreos invertidos');
 flag('DIRECT_LIGHT_NOT_CASTING_SHADOW',/new\s+THREE\.(?:SpotLight|DirectionalLight)\(/,'REVIEW','Hay luces direccionales o spot: revisar castShadow por fuente','Verificar luz principal, sombras y contacto en 3 capturas');
 flag('MAGIC_SEAT_OFFSET',/bottom\s*\*\s*scale\s*[-+]\s*\d*\.?\d+/,'BLOCK','Posición del conductor calculada con offset arbitrario','Usar sockets de pelvis y asiento y medir penetración real');
 flag('WORLD_MOTION_NO_AXIS_CHECK',/\bz\s*=\s*\d+(?:\.\d+)?\s*-\s*now\s*\*/,'BLOCK','Movimiento de coche con signo hardcoded sin verificación de eje local','Determinar orientación real del GLB, forward vector y dot con velocidad; probar frame+1');
 flag('VISIBILITY_SPLIT',/carModel\.visible\s*=\s*shot\.kind\s*===\s*['"]ext['"]/,'REVIEW','El modelo completo del auto desaparece en interiores','Separar techo/occlusión de vidrio y preservar continuidad del vehículo');
 flag('FLAT_PUDDLE',/new\s+THREE\.MeshBasicMaterial\s*\(\{\s*color:\s*0x[0-9a-f]+,\s*transparent:\s*true,\s*opacity:/,'REVIEW','Charcos planos sin reflexión de escena','Probar máscara roughness/SSR limitado o highlights estilizados motivados por faroles');
 return {schema:'prometeo.scene-lint/v1',tool:'scene-source-lint',warnings,blockCount:warnings.filter(x=>x.severity==='BLOCK').length,reviewCount:warnings.filter(x=>x.severity==='REVIEW').length,disclaimer:'Regex only: never counts as actual visual verification. Missing detection does not imply approval.'};
}
const executed=process.argv[1]&&import.meta.url===new URL(process.argv[1],'file:').href;
if(executed){
 try{
  const input=process.argv[2];if(!input)throw Error('Usage: node scene-source-lint.mjs source.mjs [out.json]');
  const result=inspectThreeSource(await readFile(input,'utf8'));
  console.log(JSON.stringify(result,null,2));
  if(process.argv[3])await writeFile(process.argv[3],JSON.stringify(result,null,2)+'\n');
  if(result.blockCount>0)process.exitCode=2;
 }catch(e){console.error('SCENE_LINT_ERROR',e.message);process.exitCode=3}
}
