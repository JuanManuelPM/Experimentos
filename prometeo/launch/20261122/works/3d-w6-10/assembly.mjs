/** L-20 assembly controller. No rendering dependency. Input groups expose position.{x,y,z}; pivot exposes quaternion.setFromAxisAngle. */
export const clamp01 = v => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
export const smooth = v => { const t = clamp01(v); return t * t * (3 - 2 * t); };
export const stage = (v, lo, hi) => smooth((v-lo)/(hi-lo));
/** interpolates logical modes; fold and explode remain mutually exclusive for collision clarity. */
export class AssemblyController {
  constructor({groups, pivot, hingeAxis, updateStatus=()=>{}}) {
    this.groups=groups; this.pivot=pivot; this.hingeAxis=hingeAxis;
    this.fold=0; this.explode=0; this.updateStatus=updateStatus;
    this.base=new Map(Object.entries(groups).map(([id,g])=>[id,{x:g.position.x,y:g.position.y,z:g.position.z}]));
    this.offsets={
      rearWheel:[0,0,-.35],frontWheel:[0,0,.38],rearFrame:[-.06,0,-.10],
      frontFrame:[.12,.03,.12],hinge:[.02,.16,.38],seat:[-.09,.34,0],
      cockpit:[.06,.38,.14],drivetrain:[-.02,-.05,.35],chain:[-.04,0,.48],
      brakes:[.10,.14,.50]
    };
  }
  setFold(v){ this.fold=clamp01(v); if(this.fold>0)this.explode=0; this.apply(); }
  setExplode(v){ this.explode=clamp01(v); if(this.explode>0)this.fold=0; this.apply(); }
  apply(){
    const f=this.fold, e=smooth(this.explode);
    const yaw=stage(f,.14,.94) * Math.PI*.93;
    this.pivot.quaternion.setFromAxisAngle(this.hingeAxis,yaw);
    Object.entries(this.groups).forEach(([id,g])=>{
      const b=this.base.get(id),o=this.offsets[id]||[0,0,0];
      g.position.set(b.x+o[0]*e,b.y+o[1]*e,b.z+o[2]*e);
    });
    this.groups.cockpit.position.y-= .27*stage(f,.08,.48);
    this.groups.seat.position.y-= .23*stage(f,.10,.58);
    // disengages the latch before the hinge starts to pivot
    this.groups.hinge.position.z+=.055*stage(f,0,.17);
    this.updateStatus({fold:f,explode:this.explode});
  }
}
export const BOM = Object.freeze([
  {id:'rearFrame',sku:'F-101',name:'Cuadro trasero y vainas',material:'Aluminio 6061-T6',qty:1},
  {id:'frontFrame',sku:'F-102',name:'Cuadro delantero y horquilla',material:'Aluminio 6061-T6',qty:1},
  {id:'hinge',sku:'J-110',name:'Bisagra, eje y cierre',material:'Acero inoxidable 17-4PH',qty:1},
  {id:'rearWheel',sku:'R-201',name:'Rueda trasera 50-406',material:'Aluminio · caucho · acero',qty:1},
  {id:'frontWheel',sku:'R-202',name:'Rueda delantera 50-406',material:'Aluminio · caucho · acero',qty:1},
  {id:'cockpit',sku:'C-301',name:'Manillar, puños y potencia',material:'Aluminio · elastómero',qty:1},
  {id:'seat',sku:'C-302',name:'Tija y sillín',material:'Aluminio · polímero',qty:1},
  {id:'drivetrain',sku:'T-401',name:'Bielas, platos y pedales',material:'Aleación · acero',qty:1},
  {id:'chain',sku:'T-402',name:'Cadena y cassette 8v',material:'Acero niquelado',qty:1},
  {id:'brakes',sku:'S-501',name:'Discos, pinzas y cables',material:'Acero · polímero',qty:1}
]);
export function validateAssembly({groups,parts=BOM}){
  const ids=parts.map(x=>x.id),fail=[];
  if(new Set(ids).size!==ids.length) fail.push('BOM duplicate IDs');
  for(const p of parts){
    if(!groups[p.id])fail.push(`Missing group ${p.id}`);
    else if(groups[p.id].children.length===0)fail.push(`Empty group ${p.id}`);
  }
  for(const id of Object.keys(groups))if(!ids.includes(id))fail.push(`Unlisted group ${id}`);
  return {ok:fail.length===0,checks:parts.length,fail};
}