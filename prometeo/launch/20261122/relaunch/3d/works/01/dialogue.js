// Guion original. Dos elecciones: distintas actuaciones y respuestas locales.
export const routes={
  verdad:{
    label:"Quiero que seas sincera",
    emotion:"vulnerable",
    gesture:"No",
    line:"Tengo miedo de equivocarme. A veces callo porque creo que una verdad puede romper algo hermoso.",
    light:"#d4a0ad",
    pace:0.86,
    delivery:"Una confesión. Baja la mirada antes de hablar."
  },
  cuidado:{
    label:"Quiero que te quedes",
    emotion:"warm",
    gesture:"Yes",
    line:"Estoy acá. No hace falta encontrar las palabras perfectas; podemos quedarnos un rato en silencio.",
    light:"#f4c99c",
    pace:0.93,
    delivery:"Una respuesta cálida. Se aproxima, asiente y escucha."
  }
};
export function chooseRoute(name){if(!(name in routes))throw Error("Ruta desconocida");return routes[name];}
