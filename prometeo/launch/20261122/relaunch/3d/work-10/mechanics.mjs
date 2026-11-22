// F/20 original folding bicycle. Units: metres, radians, seconds.
// No finite-element or structural-strength certification is implied.
export const DESIGN = Object.freeze({
  wheelRadius: .276, tyreWidth: .043, rimRadius: .236,
  rearAxle: [-.55,.276,0], frontAxle: [.58,.276,0],
  hinge: [.02,.545,-.09], bottomBracket: [-.22,.365,.0],
  hingeAxleDiameter: .014, frameTubeDiameter: .039,
  rearSprocketRadius:.04, chainringRadius:.089, foldedAngle:Math.PI
});
export const BOM = Object.freeze([
  {id:'rear-frame',name:'Cuadro trasero · triángulo',qty:1,material:'frame',group:'rear',offset:[-.1,.08,0]},
  {id:'front-frame',name:'Cuadro delantero · doble viga',qty:1,material:'frame',group:'front',offset:[.22,.05,0]},
  {id:'hinge',name:'Bisagra central · eje y cierre',qty:1,material:'metal',group:'rear',offset:[0,.21,.17]},
  {id:'rear-wheel',name:'Rueda trasera · conjunto',qty:1,material:'rubber/alloy',group:'rear',offset:[-.4,-.05,.04]},
  {id:'front-wheel',name:'Rueda delantera · conjunto',qty:1,material:'rubber/alloy',group:'front',offset:[.43,-.05,.06]},
  {id:'fork',name:'Horquilla y dirección',qty:1,material:'frame',group:'front',offset:[.24,.06,-.06]},
  {id:'cockpit',name:'Potencia plegable y manillar',qty:1,material:'metal',group:'front',offset:[.05,.32,.12]},
  {id:'seat',name:'Tija telescópica y sillín',qty:1,material:'metal/leather',group:'rear',offset:[-.12,.32,-.09]},
  {id:'crank',name:'Bielas y pedales',qty:1,material:'metal',group:'rear',offset:[-.08,-.22,.22]},
  {id:'chain',name:'Transmisión · cadena y piñones',qty:1,material:'metal',group:'rear',offset:[-.07,-.13,.22]},
  {id:'rear-brake',name:'Freno de disco trasero',qty:1,material:'metal',group:'rear',offset:[-.20,.11,-.18]},
  {id:'front-brake',name:'Freno de disco delantero',qty:1,material:'metal',group:'front',offset:[.26,.07,-.18]},
  {id:'rear-fender',name:'Guardabarros trasero',qty:1,material:'metal',group:'rear',offset:[-.26,.20,0]},
  {id:'front-fender',name:'Guardabarros delantero',qty:1,material:'metal',group:'front',offset:[.28,.20,0]}
]);
export const PALETTES = Object.freeze({
  graphite:{name:'GRAFITO',frame:0x28353b,detail:0xd6b88c},
  cobalt:{name:'AZUL NOCHE',frame:0x224867,detail:0xb3c7d4},
  copper:{name:'ARCILLA',frame:0x934d3d,detail:0xe8bb86}
});
export const VARIANTS = Object.freeze({
  city:{name:'CIUDAD',tyre:0.043,barWidth:.58,description:'cubiertas urbanas + manillar ancho'},
  swift:{name:'VELOZ',tyre:0.034,barWidth:.48,description:'cubiertas angostas + manillar compacto'}
});
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export function foldPose(value){
  const p=clamp(value);
  return {seatDrop:.25*ease(p/.27),stemAngle:-1.44*ease((p-.06)/.34),mainYaw:Math.PI*ease((p-.22)/.78)};
}
export function foldedFrontAxle(value) {
  const [hx,,hz]=DESIGN.hinge;
  const [x,y,z]=DESIGN.frontAxle, a=foldPose(value).mainYaw;
  const dx=x-hx,dz=z-hz;
  return [hx+Math.cos(a)*dx+Math.sin(a)*dz,y,hz-Math.sin(a)*dx+Math.cos(a)*dz];
}
export function axleSeparation(value){
  const [fx,,fz]=foldedFrontAxle(value),[rx,,rz]=DESIGN.rearAxle;
  return {along:Math.abs(fx-rx),lateral:Math.abs(fz-rz),spatial:Math.hypot(fx-rx,fz-rz)};
}
export function validateDesign(){
  const issues=[], at0=foldedFrontAxle(0), f=axleSeparation(1);
  if(Math.abs(at0[0]-DESIGN.frontAxle[0])>1e-9||Math.abs(at0[2])>1e-9)issues.push('Unfolded axles drift');
  if(Math.abs(DESIGN.frontAxle[0]-DESIGN.rearAxle[0]-1.13)>1e-9)issues.push('Wheelbase mismatch');
  if(f.along>.15||f.lateral<.12||f.lateral>.26)issues.push('Folded wheel packing');
  if(f.lateral<DESIGN.tyreWidth*2+.02)issues.push('Folded tyres intersect');
  if(new Set(BOM.map(x=>x.id)).size!==BOM.length)issues.push('Duplicate BOM id');
  if(!BOM.every(x=>x.qty===1&&x.offset.length===3&&['rear','front'].includes(x.group)))issues.push('Invalid BOM hierarchy');
  return {ok:issues.length===0,issues,wheelbase:1.13,foldedAxleSeparation:f,parts:BOM.length,limitations:['No FEA/load certification','No continuous mesh-mesh collision solver','No industrial manufacturing tolerance stackup']};
}
