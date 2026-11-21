/** Respawn Desk V3 · authored camera: apparent single travel through the target aperture. */
export const SHOTLIST={
 schema:'prometeo.3d.world-to-scene-rail/v1',fps:24,
 layers:{city:{mode:'out',range:[11.0,12.7]},roof:{mode:'out',range:[10.8,12.9]},room:{mode:'in',range:[10.3,12.55]}},
 shots:[
 {id:'01_CITY_AERIAL',from:0,to:8,ease:'linear',transition:'continuous',camera:[[190,550,440],[160,360,280],[103,165,134],[42,58,66]],target:[[0,480,0],[0,8,0],[0,4,0],[0,2.4,0]],fov:[49,44]},
 {id:'02_WINDOW_APPROACH',from:8,to:11.8,ease:'linear',transition:'continuous',camera:[[42,58,66],[23,32,36],[4,7,10],[0,2.2,4.48]],target:[[0,2.4,0],[0,2.5,0],[0,2.1,0],[0,1.75,-1.6]],fov:[44,46]},
 {id:'03_CROSS_APERTURE',from:11.8,to:15.5,ease:'smooth',transition:'continuous',camera:[[0,2.2,4.48],[.45,2.12,3.54],[1.10,2.26,2.8]],target:[[0,1.75,-1.6],[0,1.57,-1.52],[0,1.57,-1.2]],fov:[46,41]},
 {id:'04_DISCOVER_WAKE',from:15.5,to:21.8,ease:'smooth',transition:'continuous',camera:[[1.10,2.26,2.8],[1.20,2.19,2.35],[1.32,2.11,2.05]],target:[[0,1.57,-1.2],[0,1.83,.46],[0,1.90,.47]],fov:[41,39]},
 {id:'05_RISE',from:21.8,to:25.5,ease:'smooth',transition:'continuous',camera:[[1.32,2.11,2.05],[2.55,1.60,.95]],target:[[0,1.90,.47],[0,1.20,.32]],fov:[39,60]},
 {id:'06_WALK',from:25.5,to:31,ease:'smooth',transition:'continuous',camera:[[2.55,1.60,.95],[2.35,1.60,-.20]],target:[[0,1.20,.32],[0,1.20,-.55]],fov:[60,58]},
 {id:'07_ARRIVE_SCREEN',from:31,to:36,ease:'smooth',transition:'continuous',camera:[[2.35,1.60,-.20],[1.65,1.76,-.80]],target:[[0,1.20,-.55],[0,1.50,-1.40]],fov:[58,47]}
 ]};