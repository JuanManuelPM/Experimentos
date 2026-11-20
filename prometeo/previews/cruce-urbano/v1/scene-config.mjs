/** Configuration is specific to this corner, never exported as a generic traffic law. */
export const config={
 duration:19,
 phases:[
  {start:0,end:3.5,cars:'GREEN',walk:'RED',label:'Tráfico avanza'},
  {start:3.5,end:4.5,cars:'AMBER',walk:'RED',label:'Precaución'},
  {start:4.5,end:13.9,cars:'RED',walk:'GREEN',label:'Cruce habilitado'},
  {start:13.9,end:14.5,cars:'RED',walk:'RED',label:'Despeje'},
  {start:14.5,end:19,cars:'GREEN',walk:'RED',label:'Tráfico avanza'}
 ],
 pedestrian:[{t:0,x:0.27,z:-6.4},{t:4.5,x:0.27,z:-4.02},{t:5.2,x:0.27,z:-4.02},{t:12.4,x:0.27,z:4.35},{t:19,x:0.27,z:4.35}],
 vehicle:[{t:0,x:-8,z:-1.5},{t:3.5,x:-3.15,z:-1.5},{t:14.5,x:-3.15,z:-1.5},{t:19,x:3.0,z:-1.5}],
 vehicleExtent:{halfX:1.8,halfZ:1.10},personRadius:0.33,
 glb:{person:'./assets/cesium-man.glb',vehicle:'./assets/cesium-milk-truck.glb'},
 camera:{loopCutAt:19,subject:'peaton-protagonista'}
};
