// Dialogue is original, editable; no copied voices or third-party performances.
// Each choice changes script, emotion, pauses, gaze and body acting.
export const takes={
  opening:{
    id:'opening',label:'Prólogo',emotion:'neutral',rate:144,pitch:44,
    lines:[
      {text:'Hay algo que me gustaría preguntarte.',pause:.48,gesture:'gaze'},
      {text:'¿Qué hacemos con las cosas que no llegamos a decir?',pause:.9,gesture:'down'}
    ]
  },
  honest:{
    id:'honest',label:'Opción A · Temor',emotion:'uneasy',rate:132,pitch:39,
    lines:[
      {text:'Creo que me daría miedo escuchar la respuesta.',pause:.63,gesture:'avert'},
      {text:'Pero también me cansé de ensayar conversaciones que nunca suceden.',pause:.56,gesture:'open'},
      {text:'Así que esta vez prefiero quedarme.',pause:.86,gesture:'look'}
    ]
  },
  warm:{
    id:'warm',label:'Opción B · Recuerdo',emotion:'warm',rate:148,pitch:48,
    lines:[
      {text:'Me acuerdo de la luz en la cocina, antes de que despertara la casa.',pause:.55,gesture:'remember'},
      {text:'No recuerdo las palabras exactas.',pause:.50,gesture:'smile'},
      {text:'Tal vez no eran lo importante.',pause:1.1,gesture:'hold'}
    ]
  }
};
// Explicit, editable phoneme approximation. Precise phoneme forced alignment is not claimed.
// The audio playback clock controls the gesture progression.
export function visemeTrack(text,duration){
 const chars=[...text.toUpperCase()], good=chars.filter(c=>/[\p{L}]/u.test(c));
 const t=[];if(!good.length)return t;
 const step=duration/good.length;let index=0;
 for(const c of chars){
   if(!/[\p{L}]/u.test(c))continue;
   const v=('ÁA'.includes(c)?'A':'ÉE'.includes(c)?'E':'ÍIY'.includes(c)?'I':'ÓO'.includes(c)?'O':'ÚU'.includes(c)?'U':'MBP'.includes(c)?'M':'FV'.includes(c)?'F':'STCZ'.includes(c)?'S':'rest');
   if(!t.length||t[t.length-1].v!==v)t.push({time:index*step,v});
   index++;
 }
 return t;
}
export function stagePose(gesture){
 return {
  gaze:{headYaw:0,headPitch:-.018,headRoll:0,gazeX:-.06,armLift:0},
  down:{headYaw:-.04,headPitch:.12,headRoll:-.04,gazeX:.11,gazeY:-.7,armLift:0},
  avert:{headYaw:.14,headPitch:.06,headRoll:.03,gazeX:-.5,gazeY:-.2,armLift:.08},
  open:{headYaw:-.06,headPitch:.02,headRoll:-.025,gazeX:.13,armLift:.23},
  look:{headYaw:0,headPitch:-.035,headRoll:.016,gazeX:0,armLift:.03},
  remember:{headYaw:-.11,headPitch:.02,headRoll:-.06,gazeX:.28,gazeY:.25,armLift:.13},
  smile:{headYaw:.04,headPitch:-.05,headRoll:-.026,gazeX:-.08,armLift:.12},
  hold:{headYaw:0,headPitch:-.013,headRoll:-.02,gazeX:0,armLift:0}
 }[gesture]||{};
}
