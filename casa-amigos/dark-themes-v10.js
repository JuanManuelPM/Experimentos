const THEMES=[
 ['bordo-crema','Bordó / Crema','#F5DABF','#6C151E'],
 ['verde-crema','Verde / Crema','#F5DABF','#0F3D3A'],
 ['lima-carbon','Lima / Carbón','#C7F464','#202124'],
 ['cobalto-crema','Cobalto / Crema','#F5DABF','#1546A0'],
 ['menta-bosque','Menta / Bosque','#B8E0D2','#174A3A'],
 ['rosa-ciruela','Rosa / Ciruela','#F4B6C2','#5B2448'],
 ['mandarina-noche','Mandarina / Noche','#F28C28','#102A43'],
 ['hueso-tinta','Hueso / Tinta','#EADFCB','#1B1B1A'],
 ['negro-hueso','Negro / Hueso','#111111','#F2E8D5'],
 ['azul-noche','Azul noche / Hielo','#0E1726','#DCE9F7'],
 ['berenjena-humo','Berenjena / Rosa humo','#21131F','#E8C9D8'],
 ['bosque-menta-dark','Bosque / Menta','#0D211A','#BFE7D5'],
 ['petroleo-aqua','Petróleo / Aqua','#071F24','#BFE9E6'],
 ['bordo-noche','Bordó noche / Rosa','#260E14','#F0CDD5'],
 ['carbon-lima-dark','Carbón / Lima','#171A17','#C7F464'],
 ['cafe-arena','Café / Arena','#211713','#E9D2B6'],
 ['indigo-lavanda','Índigo / Lavanda','#151329','#D9D4FF'],
 ['medianoche-mandarina','Medianoche / Mandarina','#111827','#FFB05A']
];

const $=s=>document.querySelector(s);
let index=Math.max(0,THEMES.findIndex(t=>t[0]===(localStorage.getItem('casa_palette')||'verde-crema')));

function isDark(hex){
 const h=hex.replace('#','');
 const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
 return (.2126*r+.7152*g+.0722*b)<105;
}
function apply(i){
 index=(i+THEMES.length)%THEMES.length;
 const t=THEMES[index];
 document.documentElement.style.setProperty('--paper',t[2]);
 document.documentElement.style.setProperty('--ink',t[3]);
 document.documentElement.style.colorScheme=isDark(t[2])?'dark':'light';
 localStorage.setItem('casa_palette',t[0]);
 const name=$('#themeName'),a=$('#swatchA'),b=$('#swatchB'),meta=document.querySelector('meta[name="theme-color"]');
 if(name)name.textContent=t[1];
 if(a)a.style.background=t[2];
 if(b)b.style.background=t[3];
 if(meta)meta.content=t[2];
}

const prev=$('#themePrev'),next=$('#themeNext');
if(prev)prev.onclick=()=>apply(index-1);
if(next)next.onclick=()=>apply(index+1);
apply(index);
