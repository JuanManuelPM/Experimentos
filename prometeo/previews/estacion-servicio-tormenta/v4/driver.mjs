import * as T from 'three';
/*
 NOCTURNA V4 · Actor de ilustración articulada 2.5D.
 Todos los dibujos son originales, editables y se construyen en Canvas 2D.
 Las texturas NO contienen figuras primitivas tridimensionales apiladas.
 Dibujo tipo cartel serigráfico noir: impermeable, rostro, ropa y botas.
 */
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
function part(w,h,draw){
 const c=document.createElement('canvas');c.width=w;c.height=h;
 const x=c.getContext('2d');x.lineJoin='round';x.lineCap='round';draw(x,w,h);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
 t.anisotropy=4;return t;
}
function polygon(c,pts,fill,stroke='#172127',lw=10){
 c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
 if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}
}
function line(c,pts,color,width=8){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function gradient(c,x,y,w,h,a,b){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,a);g.addColorStop(1,b);return g}
const coat=part(560,710,(c)=>{
 // Hand-illustrated trench coat with an asymmetrical hem and deep folds.
 polygon(c,[[160,53],[212,30],[346,35],[408,76],[441,198],[423,370],[467,631],[408,657],[333,630],[278,664],[209,636],[132,667],[93,614],[125,369],[103,204]],gradient(c,70,0,440,670,'#e6c777','#80613e'),'#17232a',15);
 polygon(c,[[202,76],[275,108],[318,75],[350,121],[323,620],[280,642],[253,226]],gradient(c,200,90,140,510,'#d0a858','#6f563a'),null);
 polygon(c,[[148,87],[213,62],[261,178],[226,228],[134,162]],'#e7c17b','#6b543a',6);
 polygon(c,[[341,63],[409,102],[427,163],[348,221],[302,177]],'#8f7044','#695137',6);
 polygon(c,[[244,169],[279,211],[303,172],[296,562],[273,617],[252,564]],'#5d4b36',null);
 line(c,[[285,233],[290,592]],'#f2d49a',5);
 polygon(c,[[155,278],[232,283],[239,369],[148,383]],'#735c40','#292e2c',6);
 polygon(c,[[341,280],[416,266],[421,374],[339,379]],'#74583e','#292e2c',6);
 line(c,[[162,287],[224,301]],'#ebcc8e',5);line(c,[[351,299],[406,288]],'#b99b68',5);
 polygon(c,[[123,426],[444,416],[442,453],[119,462]],'#463d35','#1a2427',8);
 polygon(c,[[270,415],[307,415],[311,470],[265,470]],'#c6a063','#252d2b',7);
 line(c,[[159,488],[145,610]],'#eed398',4);line(c,[[380,487],[413,611]],'#e0b875',4);
 line(c,[[318,510],[335,599]],'#523e34',6);line(c,[[229,511],[208,615]],'#5e4636',6);
 for(let i=0;i<5;i++){c.fillStyle='#e8ddba';c.beginPath();c.arc(285,256+i*61,5,0,Math.PI*2);c.fill()}
 line(c,[[143,73],[111,195],[125,320]],'#f2d99f',4);
});
const face=part(560,610,(c)=>{
 // The hood surrounds a drawn face: silhouette, cheeks, eyes, mouth, hair.
 polygon(c,[[122,416],[100,345],[107,218],[142,107],[217,55],[333,49],[405,96],[451,202],[459,351],[418,451],[380,510],[173,513]],gradient(c,92,58,420,490,'#c8a463','#564d38'),'#1c282e',16);
 polygon(c,[[181,448],[147,349],[156,207],[202,130],[343,129],[392,203],[404,352],[357,452],[281,489]],'#1f3035','#121d20',8);
 polygon(c,[[206,411],[188,315],[194,231],[235,187],[329,177],[365,229],[369,332],[340,409],[289,443],[248,440]],gradient(c,213,197,220,270,'#e5ae8c','#835747'),'#3c3030',8);
 polygon(c,[[199,242],[230,184],[318,165],[363,203],[361,257],[340,224],[296,213],[251,237],[207,271]],'#2a282b','#252b2b',7);
 polygon(c,[[225,215],[283,194],[338,200],[363,248],[358,273],[324,245],[263,250],[199,277]],'#37302c',null);
 line(c,[[221,298],[253,290],[267,293]],'#3a3031',10);
 line(c,[[304,293],[327,288],[347,296]],'#3a3031',10);
 c.fillStyle='#f7e1c6';c.fillRect(239,300,19,6);c.fillRect(315,298,19,6);
 line(c,[[292,303],[281,358],[294,368]],'#885c4c',7);
 line(c,[[267,400],[289,406],[313,397]],'#613b38',7);
 polygon(c,[[156,433],[216,465],[290,480],[365,459],[417,420],[414,502],[363,557],[202,555],[140,501]],'#a27b4c','#17262a',13);
 polygon(c,[[208,466],[278,483],[335,468],[321,512],[245,523]],'#d8b77f',null);
 line(c,[[171,174],[211,104],[296,83],[362,117]],'#ead08e',7);
});
function armTexture(side){
 return part(320,760,c=>{
  c.save();if(side<0){c.translate(320,0);c.scale(-1,1)}
  polygon(c,[[74,70],[167,40],[221,108],[245,215],[212,405],[194,575],[146,625],[65,587],[71,459],[106,299],[57,168]],gradient(c,55,40,200,620,'#e6c77d','#715a40'),'#1e282b',15);
  polygon(c,[[75,457],[210,461],[195,577],[152,603],[69,569]],'#755c42','#2b302c',7);
  line(c,[[112,98],[150,155],[155,263]],'#f4dea2',6);
  line(c,[[180,238],[157,390]],'#6a543f',7);
  polygon(c,[[79,560],[194,564],[200,622],[169,673],[102,673],[65,624]],'#282f32','#131d22',11);
  line(c,[[89,586],[184,593]],'#8c856e',5);
  c.restore();
 });
}
const legTex=part(270,850,c=>{
 polygon(c,[[42,44],[216,40],[223,283],[204,567],[196,657],[84,671],[65,546],[42,301]],gradient(c,48,55,150,580,'#56636a','#202b32'),'#182027',12);
 line(c,[[117,82],[128,575]],'#819098',5);
 polygon(c,[[62,587],[200,591],[205,652],[251,707],[235,768],[35,773],[25,729],[56,667]],'#20272a','#11191e',13);
 polygon(c,[[46,731],[243,732],[247,762],[27,762]],'#637175','#182126',6);
 line(c,[[87,647],[164,645]],'#8c8f86',5);
});
function createPlane(tex,width,height,group,x,y,z,order){
 const m=new T.MeshBasicMaterial({map:tex,transparent:true,alphaTest:.13,side:T.DoubleSide,depthWrite:false,toneMapped:false});
 const o=new T.Mesh(new T.PlaneGeometry(width,height),m);
 o.position.set(x,y,z);o.renderOrder=order;group.add(o);return o;
}
export function createDriver(){
 const root=new T.Group(),visual=new T.Group();root.add(visual);
 const legs=[],arms=[];const handPivot=new T.Group();
 for(const s of [-1,1]){
  const lg=new T.Group();lg.position.set(s*.135,.86,-.03);visual.add(lg);
  createPlane(legTex,.31,.95,lg,0,-.46,.001,2);legs.push({g:lg,s});
 }
 createPlane(coat,.92,1.05,visual,0,1.15,.055,4);
 for(const s of [-1,1]){
  const ag=new T.Group();ag.position.set(s*.31,1.43,.08);visual.add(ag);
  createPlane(armTexture(s),.32,.64,ag,0,-.30,.03,6);
  if(s===1){handPivot.position.set(0,-.56,.045);ag.add(handPivot)}
  arms.push({g:ag,s});
 }
 createPlane(face,.56,.59,visual,0,1.75,.12,8);
 const hoodShadow=part(250,90,c=>{polygon(c,[[8,19],[60,35],[126,49],[187,31],[244,16],[215,77],[32,80]],'#514438','#2b3030',5)});
 createPlane(hoodShadow,.43,.13,visual,0,1.51,.16,9);
 let lastY=0;
 function faceCamera(camera){
  const d=camera.position.clone().sub(root.position);const bearing=Math.atan2(d.x,d.z);
  visual.rotation.y=bearing-root.rotation.y;
 }
 function pose({distance=0,speed=0,sit=0,reach=null,carry=false,look=0}={}){
  const walk=Math.min(1,speed/.8),phase=distance/1.08;
  const bob=Math.abs(Math.sin(phase*Math.PI*2))*.018*walk;
  visual.position.y=bob-.32*sit;
  visual.rotation.z=-.09*sit;
  legs.forEach(({g,s},i)=>{const a=phase*Math.PI*2+i*Math.PI;g.rotation.z=Math.sin(a)*.34*walk+s*.10*sit;g.position.y=.86-.32*sit;});
  arms.forEach(({g,s},i)=>{
   g.position.y=1.43-.32*sit;
   let angle=s*.07+Math.sin(phase*Math.PI*2+i*Math.PI)*.25*walk;
   if(s===1&&carry)angle=-.36;
   if(s===1&&reach){
    const dx=reach.x-s*.31,dy=reach.y-(1.43-.32*sit);
    angle=Math.max(-1.7,Math.min(1.45,Math.atan2(dx,-dy)));
   }
   g.rotation.z=angle;
  });
  lastY=look;visual.children.forEach(()=>{});
 }
 pose();
 return {root,pose,faceCamera,handWorld:()=>handPivot.getWorldPosition(V()),artDirection:'hand-painted articulated 2.5D'};
}
