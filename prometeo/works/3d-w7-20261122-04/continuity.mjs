/**
 * PROMETEO / W7-04 · Continuidad de eje y primer artículo.
 * Engine-independent and deterministic. Artistic approval remains human.
 */
export function inspectEyelineAxis(film){
 const errors=[];
 const axisZ=0; // two actors share the X axis and look to each other over the lantern.
 for(const shot of film.shots){
  const {camera,actors}=shot;
  if([camera.from[2],camera.to[2]].some(z=>z<=axisZ+.15))
   errors.push(shot.id+': camara cruza eje de accion o cae sobre el');
  if([actors.vera.head[0],actors.vera.head[1]].some(y=>y<-.02))
   errors.push(shot.id+': Vera mira fuera del lado de Noe');
  if([actors.noe.head[0],actors.noe.head[1]].some(y=>y>.02))
   errors.push(shot.id+': Noe mira fuera del lado de Vera');
 }
 return {ok:errors.length===0,errors,checkedShots:film.shots.length};
}
export function firstArticleCut(source){
 const shots=[source.shots[1],source.shots[2]].map((s,index)=>{
  const clone=JSON.parse(JSON.stringify(s));
  clone.id='fa0'+(index+1);
  clone.name=(index===0?'I · LA PREGUNTA':'II · LA RESPUESTA');
  clone.start=Number((index*1.6).toFixed(3));
  clone.end=Number(((index+1)*1.6).toFixed(3));
  return clone;
 });
 return {schema:'prometeo.cinematic-timeline/v1',title:'La despedida / primer artículo',duration:3.2,shots};
}
