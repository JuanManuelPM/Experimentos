/* PROMETEO W003/06 · Planner reutilizable por estructura musical · CC0-1.0
   No hace cortes por cada beat. Consume secciones y eventos narrativo-musicales
   con razón y confianza, selecciona anclas por contraste y distancia mínima.
*/
export const SCHEMA="prometeo.video.phrase-edit-plan/v1";
export function planCuts({duration,sections,events=[],minGap=.65,maxCuts=18}){
  if(!Number.isFinite(duration)||duration<=0)throw new Error("duration");
  if(!Array.isArray(sections)||!sections.length)throw new Error("sections");
  const candidates=[
    {time:0,reason:"apertura",weight:100,kind:"boundary"},
    ...sections.flatMap(s=>[{
      time:s.start,reason:"inicio de movimiento: "+s.name,weight:90,kind:"section"
    },{time:s.end,reason:"fin de movimiento: "+s.name,weight:90,kind:"section"}]),
    ...events.filter(e=>e.kind!=="beat").map(e=>({
      time:e.time,reason:e.reason,weight:e.weight??60,kind:e.kind??"phrase"
    }))
  ].filter(e=>Number.isFinite(e.time)&&e.time>=0&&e.time<=duration);
  const uniq=new Map();
  for(const c of candidates){
    const key=c.time.toFixed(3);
    if(!uniq.has(key)||uniq.get(key).weight<c.weight)uniq.set(key,c)
  }
  let out=[{time:0,reason:"apertura",weight:100,kind:"boundary"},
           {time:duration,reason:"cierre",weight:100,kind:"boundary"}];
  const ordered=[...uniq.values()].filter(e=>e.time>0&&e.time<duration).sort((a,b)=>b.weight-a.weight);
  for(const c of ordered){
    if(out.length>=maxCuts)break;
    if(out.every(x=>Math.abs(x.time-c.time)>=minGap))out.push(c);
  }
  return {schema:SCHEMA,duration,cuts:out.sort((a,b)=>a.time-b.time),
    philosophy:"Los beats articulan movimiento interno; los cortes responden a frase, densidad y silencio."};
}
export const PULSO_INPUT={
duration:24,minGap:.55,maxCuts:16,
sections:[
{name:"GERMINACIÓN",start:0,end:4.8},
{name:"FRICCIÓN",start:4.8,end:9.6},
{name:"FRACTURA",start:9.6,end:14.4},
{name:"VACÍO",start:14.4,end:19.2},
{name:"RESONANCIA",start:19.2,end:24}],
events:[
{time:2.7,kind:"phrase",weight:60,reason:"expansión del motivo"},
{time:7.25,kind:"phrase",weight:60,reason:"respuesta de pliegues y transición tímbrica"},
{time:12.6,kind:"accent",weight:63,reason:"acento estructural de fractura"},
{time:17.4,kind:"silence",weight:76,reason:"ruptura hacia descanso real"},
{time:21.75,kind:"phrase",weight:60,reason:"eco final y resolución"}]
};
export const PULSO_EDIT=planCuts(PULSO_INPUT);
if(typeof process!=="undefined"&&process.argv?.[1]?.endsWith("cut_planner.mjs")){
 const actual=PULSO_EDIT.cuts.map(c=>c.time);
 const expected=[0,2.7,4.8,7.25,9.6,12.6,14.4,17.4,19.2,21.75,24];
 if(JSON.stringify(actual)!==JSON.stringify(expected))throw new Error("Regresión de puntos de montaje: "+actual);
 if(actual.length>=24*100/60)throw new Error("Cortes equivocados: exceso a beat");
 process.stdout.write(JSON.stringify(PULSO_EDIT,null,2)+"\n");
}