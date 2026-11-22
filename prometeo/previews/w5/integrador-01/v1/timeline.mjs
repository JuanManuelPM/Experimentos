/** Respawn Desk W5 · V5 camera continuity: apparent single travel through the target aperture. */
export const SHOTLIST={
 schema:'prometeo.3d.world-to-scene-rail/v1',fps:24,
 layers:{city:{mode:'out',range:[11.0,12.7]},roof:{mode:'out',range:[10.8,12.9]},room:{mode:'in',range:[10.3,12.55]}},
 shots:[
 {id:'01_CITY_AERIAL',from:0,to:8,ease:'linear',transition:'continuous',camera:[[170,270,300],[135,185,220],[83,103,124],[42,58,66]],target:[[0,5,0],[0,8,0],[0,4,0],[0,2.4,0]],fov:[49,44]},
 {id:'02_WINDOW_APPROACH',from:8,to:11.8,ease:'linear',transition:'continuous',camera:[[42,58,66],[23,32,36],[4,7,10],[0,2.2,4.48]],target:[[0,2.4,0],[0,2.5,0],[0,2.1,0],[0,1.75,-1.6]],fov:[44,46]},
 {id:'03_CROSS_APERTURE',from:11.8,to:15.5,ease:'smooth',transition:'continuous',camera:[[0,2.2,4.48],[.25,2.12,3.54],[1.55,1.95,2.65]],target:[[0,1.75,-1.6],[0,1.57,-1.52],[0,1.57,-1.2]],fov:[46,41]},
 {id:'04_DISCOVER_WAKE',from:15.5,to:21.8,ease:'smooth',transition:'continuous',camera:[[1.55,1.95,2.65],[2.08,1.65,1.45],[1.18,1.44,-.28]],target:[[0,1.57,-1.2],[0,1.22,1.2],[0,1.31,1.18]],fov:[41,34]},
 {id:'05_RISE',from:21.8,to:25.5,ease:'smooth',transition:'continuous',camera:[[1.18,1.44,-.28],[2.46,1.51,.28]],target:[[0,1.31,1.18],[0,1.02,1.02]],fov:[34,60]},
 {id:'06_WALK',from:25.5,to:31,ease:'smooth',transition:'continuous',camera:[[2.46,1.51,.28],[2.20,1.53,-.59]],target:[[0,1.02,1.02],[0,1.22,-.12]],fov:[60,58]},
 {id:'07_ARRIVE_SCREEN',from:31,to:36,ease:'smooth',transition:'continuous',camera:[[2.20,1.53,-.59],[1.52,1.56,-.86]],target:[[0,1.22,-.12],[0,1.59,-1.55]],fov:[58,47]}
 ]};