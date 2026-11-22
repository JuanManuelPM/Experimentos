// ESCENA ABIERTA · obra original de ficción · W003 09
export const DAYS=[
 {date:"2027-04-23",label:"Vie 23",long:"Viernes 23 de abril"},
 {date:"2027-04-24",label:"Sáb 24",long:"Sábado 24 de abril"},
 {date:"2027-04-25",label:"Dom 25",long:"Domingo 25 de abril"}
];
export const STAGES=["Patio Solar","Nave Umbral","Sala Fuga"];
export const TYPES=["Música","Performance","Visuales","Ideas"];
// Las imágenes documentan ATMÓSFERA, no son retratos de artistas inventados.
export const PHOTOS=[
 {src:"https://images.unsplash.com/photo-1689041961947-741dfc09fa84?auto=format&fit=crop&w=1350&q=82",by:"Lachy Spratt",url:"https://unsplash.com/photos/a-large-group-of-people-at-a-concert-s3ObQUr4Kzs",alt:"Público de un concierto real con humo e iluminación naranja"},
 {src:"https://images.unsplash.com/photo-1592526698106-367d4cc984b5?auto=format&fit=crop&w=1200&q=80",by:"Yoad Shejtman",url:"https://unsplash.com/photos/yMdb69xGEco",alt:"Multitud de un concierto al aire libre bajo luces azules"},
 {src:"https://images.unsplash.com/photo-1689041961947-741dfc09fa84?auto=format&fit=crop&w=1200&q=80",by:"Lachy Spratt",url:"https://unsplash.com/photos/a-large-group-of-people-at-a-concert-s3ObQUr4Kzs",alt:"Personas en un concierto, humo de escenario y luces anaranjadas"}
];
const rows=[
["materia-sonora",0,"16:00",65,0,0,"La materia que suena","Apertura / concierto expandido","Un jardín de micrófonos, percusión de madera y sintes analógicos. Cada pulso se arma frente al público: la escucha también es una forma de estar presente.",0],
["futuros-comunes",0,"16:30",60,1,3,"Futuros comunes","Ideas / charla en círculo","Arquitectas, investigadoras y curiosos imaginan cómo serían las plazas si se diseñaran desde el sonido y no desde los autos.",1],
["cuerpo-infinito",0,"17:10",70,2,1,"Cuerpo infinito","Performance / danza y luz","Cuatro intérpretes trabajan en una sala casi vacía. La luz divide, multiplica y vuelve a reunir sus movimientos.",2],
["pulso-de-barro",0,"18:00",80,0,0,"Pulso de barro","Concierto / percusión mutante","Ritmos de tierra, muestras de campo y un bajo de largo recorrido. Una invitación física a perder la cuenta.",0],
["atlas-de-sombras",0,"18:35",65,1,2,"Atlas de sombras","Visuales / cine vivo","Imágenes de archivo imaginado se deshacen y recomponen durante la proyección, en diálogo con un paisaje sonoro en tiempo real.",1],
["las-orillas",0,"20:00",75,2,0,"Las orillas","Concierto / canciones fracturadas","Voz, guitarras y máquinas de cinta construyen canciones que cambian de textura en cada estrofa.",2],
["noche-magnetica",0,"21:20",90,0,0,"Noche magnética","Baile / electrónica y comunidad","Un cierre de primera jornada que une beats rotos, armonías cálidas y espacio para improvisar con el público.",0],
["microclimas",1,"16:00",65,0,2,"Microclimas","Instalación / imagen generativa","Una coreografía de luces que responde a la posición de cada visitante. No hay dos recorridos iguales.",1],
["la-ciudad-respira",1,"16:20",65,1,3,"La ciudad respira","Conversación / escucha urbana","Pensar la acústica de la ciudad desde quienes la atraviesan: voces, cuerpos, ciclovías, ventanas y silencios.",2],
["sala-de-eco",1,"17:20",80,2,1,"Sala de eco","Teatro / ficción sonora","Una voz se repite hasta volverse otra. Pequeñas escenas construyen una historia de memoria compartida.",2],
["lumen-club",1,"18:00",85,0,0,"Lumen Club","Concierto / baile de colores","Un proyecto colectivo de polirritmias, canto en capas y bajos que se sienten en el cuerpo.",0],
["archivo-de-aire",1,"19:10",70,1,2,"Archivo de aire","Video / capas de ciudad","Una película montada en vivo con señales, sombras y geometrías que nacen de registros documentales autorizados.",1],
["trama-oral",1,"20:20",75,2,0,"Trama oral","Concierto / voces en red","Cinco voces y electrónica austera transforman historias mínimas en una misma respiración.",2],
["frecuencia-cero",1,"22:00",95,0,0,"Frecuencia cero","Club / sesión nocturna","Un recorrido de club que empieza casi en silencio y termina con la pista completa en movimiento.",0],
["radio-semilla",2,"16:00",70,0,3,"Radio semilla","Taller / escucha compartida","Armamos una radio efímera con sonidos recolectados en la ciudad. No hace falta experiencia previa.",1],
["piel-de-pantalla",2,"16:40",75,1,2,"Piel de pantalla","Instalación / materia visual","Un entorno audiovisual en el que las imágenes parecen tener temperatura y peso propios.",2],
["desarmar-el-tiempo",2,"17:30",75,2,1,"Desarmar el tiempo","Performance / teatro físico","El tiempo se estira en un espacio mínimo donde tres cuerpos insisten, retroceden y vuelven a empezar.",2],
["circuito-de-sol",2,"18:15",75,0,0,"Circuito de sol","Concierto / folk electrónico","Instrumentos acústicos, texturas digitales y canciones abiertas que invitan a escuchar de cerca.",0],
["mapa-invisible",2,"19:10",60,1,3,"Mapa invisible","Ideas / laboratorio público","El público construye un mapa de recuerdos auditivos. Un cierre participativo de conversaciones y preguntas.",1],
["cuerdas-de-humo",2,"20:00",80,2,0,"Cuerdas de humo","Concierto / cámara eléctrica","Dos instrumentos de cuerda enfrentan pedales, resonadores y delicados pasajes de silencio.",2],
["gran-asamblea",2,"21:30",105,0,0,"Gran asamblea","Cierre / ensamble colectivo","Artistas imaginarios de las tres jornadas comparten una pieza cambiante. Un final abierto, como el festival.",0]
];
export const EVENTS=rows.map(([id,d,h,duration,s,t,title,kicker,description,photo])=>({
 id,day:DAYS[d].date,time:h,duration,stage:STAGES[s],type:TYPES[t],title,kicker,description,photo
}));
