import * as T from 'three';import {OrbitControls} from 'three/addons/controls/OrbitControls.js';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const status=document.querySelector('#status'),error=document.querySelector('#error');
async function main(){
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;document.body.prepend(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0x111c26);
const camera=new T.PerspectiveCamera(42,1,.1,500);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.maxPolarAngle=Math.PI*.48;controls.minDistance=8;controls.maxDistance=120;
function view(top){camera.position.set(...(top?[0,76,.01]:[47,40,45]));controls.target.set(0,0,0);controls.update()}view(false);document.querySelector('#orbit').onclick=()=>view(false);document.querySelector('#top').onclick=()=>view(true);
scene.add(new T.HemisphereLight(0xc7e3ff,0x55616d,2.5));const sun=new T.DirectionalLight(0xffedcd,3.1);sun.position.set(-24,40,16);scene.add(sun);const fill=new T.DirectionalLight(0x75b6ff,1.3);fill.position.set(30,8,-20);scene.add(fill);
const groups={floor:new T.Group(),wall:new T.Group(),front:new T.Group(),roof:new T.Group(),prop:new T.Group(),detail:new T.Group()};Object.values(groups).forEach(g=>scene.add(g));groups.roof.visible=false;groups.front.visible=false;
document.querySelector('#roof').onclick=e=>{groups.roof.visible=!groups.roof.visible;e.target.textContent='Techo: '+(groups.roof.visible?'sí':'no')};document.querySelector('#walls').onclick=e=>{groups.front.visible=!groups.front.visible;e.target.textContent='Corte: '+(!groups.front.visible?'sí':'no')};
const names=['FloorTile_Basic','FloorTile_Basic2','FloorTile_Empty','Wall_1','Wall_2','Wall_3','Wall_4','DoorSingle_Wall_SideA','LongWindow_Wall_SideA','Column_1','RoofTile_Details','RoofTile_Vents','Props_Computer','Props_ComputerSmall','Props_Capsule','Props_Pod','Props_Crate','Props_CrateLong','Props_Shelf','Props_Vessel','Props_Teleporter_1','Props_ContainerFull','Props_Base','Props_Chest','Details_Vent_1','Details_Pipes_Medium','Details_Plate_Large'];
const loader=new GLTFLoader(),assets=new Map(),failed=[];let done=0;
await Promise.all(names.map(async n=>{try{const g=await loader.loadAsync('models/'+n+'.glb');g.scene.updateMatrixWorld(true);const b=new T.Box3().setFromObject(g.scene),s=b.getSize(new T.Vector3());if(!Number.isFinite(s.length())||s.length()<.001)throw Error('empty bounds');assets.set(n,{scene:g.scene,b,s})}catch(e){failed.push(n)}finally{status.textContent=++done+'/'+names.length+' tipos de piezas procesados'}}));
let count=0;function place(name,x,y,z,kind,opts={}){const a=assets.get(name);if(!a)return;const outer=new T.Group(),o=a.scene.clone(true),center=a.b.getCenter(new T.Vector3());let sx=1,sy=1,sz=1,angle=opts.angle||0;const s=a.s,eps=.00001;
if(kind==='floor'||kind==='roof'){sx=4/Math.max(s.x,eps);sz=4/Math.max(s.z,eps);sy=Math.min(sx,sz)}
else if(kind==='wall'||kind==='front'){const alongX=s.x>=s.z;const len=alongX?s.x:s.z;const k=4/Math.max(len,eps);sx=sz=k;sy=3.4/Math.max(s.y,eps);if(!alongX)angle+=Math.PI/2}
else{sx=sy=sz=(opts.height||1.5)/Math.max(s.y,eps)}
o.scale.set(sx,sy,sz);o.position.set(-center.x*sx,-a.b.min.y*sy,-center.z*sz);if(kind==='floor'||kind==='roof'){o.position.y=-a.b.max.y*sy}outer.add(o);outer.position.set(x,y,z);outer.rotation.y=angle;groups[kind].add(outer);count++;}
const cell=4;for(let i=-4;i<=4;i++)for(let j=-3;j<=3;j++){const corridor=j===0;place(corridor?'FloorTile_Basic2':(i+j)%3===0?'FloorTile_Empty':'FloorTile_Basic',i*cell,0,j*cell,'floor');place((i+j)%2===0?'RoofTile_Details':'RoofTile_Vents',i*cell,3.65,j*cell,'roof')}
for(let i=-4;i<=4;i++){place(i%3===0?'LongWindow_Wall_SideA':'Wall_2',i*4,0,-14,'wall');place(i%2===0?'Wall_1':'Wall_3',i*4,0,14,'front')}
for(let j=-3;j<=3;j++){place(j===0?'DoorSingle_Wall_SideA':'Wall_3',-18,0,j*4,'wall',{angle:Math.PI/2});place(j===0?'DoorSingle_Wall_SideA':'Wall_4',18,0,j*4,'front',{angle:Math.PI/2})}
for(const z of [-2,2])for(let i=-4;i<=4;i++){if([-3,0,3].includes(i))continue;place(i%2===0?'Wall_1':'Wall_2',i*4,0,z,z<0?'wall':'front')}
for(const x of [-6,6])for(const z of [-12,-8,8,12])place('Wall_3',x,0,z,z<0?'wall':'front',{angle:Math.PI/2});
const prop=(n,x,z,h,angle=0)=>place(n,x,0,z,'prop',{height:h,angle});
for(const x of [-16,-8,0,8,16])for(const z of [-13,13])prop('Column_1',x,z,3.4);
for(const x of [-14,-10]){prop('Props_Computer',x,-11,2.4);prop('Props_ComputerSmall',x,-6,1.5,Math.PI)}
for(const x of [-3,0,3])prop('Props_Capsule',x,-10,2.8);
prop('Props_Base',0,-5,.65);prop('Props_Pod',0,-5,2.1);
for(const x of [10,14])prop('Props_Vessel',x,-10,2.6);prop('Props_Teleporter_1',12,-5,2.8);
for(const x of [-14,-10]){prop('Props_Shelf',x,11,2.6,Math.PI);prop('Props_CrateLong',x,6,1.1,Math.PI/2)}
for(const x of [-3,0,3])prop('Props_ContainerFull',x,10,1.6);prop('Props_Chest',0,5,1.2);
for(const x of [10,14])prop('Props_ComputerSmall',x,10,1.5,Math.PI);prop('Props_Crate',12,5,1.0);
for(const x of [-16,-8,0,8,16]){place('Details_Vent_1',x,.4,-13.7,'detail',{height:.6});place('Details_Pipes_Medium',x,.3,13.7,'detail',{height:.6})}
place('Details_Plate_Large',0,.04,0,'detail',{height:.08});
const stars=new T.BufferGeometry(),pos=[];let seed=12;const rnd=()=>((seed=Math.imul(seed,1664525)+1013904223|0)>>>0)/4294967296;for(let i=0;i<700;i++){const a=rnd()*Math.PI*2,r=70+rnd()*90;pos.push(Math.cos(a)*r,(rnd()-.5)*120,Math.sin(a)*r)}stars.setAttribute('position',new T.Float32BufferAttribute(pos,3));scene.add(new T.Points(stars,new T.PointsMaterial({color:0x98b3d0,size:.17,sizeAttenuation:true})));
status.textContent=assets.size+'/'+names.length+' tipos de GLB · '+count+' instancias';if(failed.length)error.textContent='No cargaron: '+failed.join(', ');
function resize(){renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}addEventListener('resize',resize);resize();renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera)});
}main().catch(e=>{status.textContent='Error de inicio';error.textContent=e.message;console.error(e)});
