/* Casa Material / CM Dialog + Collection. Reusable vanilla-JS interaction layer. */
(() => {
  "use strict";
  const studies = Object.freeze({
    umbral: Object.freeze({
      number:"ESTUDIO 01 / CONTENEDORES",title:"Cuenco Umbral",tagline:"El borde también es un gesto.",
      description:"Un ejercicio sobre los límites entre sostener y ofrecer. El volumen conceptual propone una presencia tranquila en la mesa: suficiente para el uso, abierta al espacio que la rodea.",
      category:"Contenedor · estudio conceptual",image:"https://images.unsplash.com/photo-1784921305660-51269e12e68f?auto=format&fit=crop&w=1050&q=80",
      alt:"Tres cuencos cerámicos en una composición con una mano.",credit:"https://unsplash.com/photos/Lew9h_-gwj8"
    }),
    raiz: Object.freeze({
      number:"ESTUDIO 02 / VASIJAS",title:"Vasija Raíz",tagline:"El peso de una forma sencilla.",
      description:"Una exploración imaginaria del recipiente como arquitectura en miniatura: base, cuello y cuerpo en tensión amable. Ningún borde pretende ser perfecto; cada detalle invita a una mirada más lenta.",
      category:"Vasija · estudio conceptual",image:"https://images.unsplash.com/photo-1784901392739-c17de5ebeb59?auto=format&fit=crop&w=1050&q=80",
      alt:"Vasija rústica de cerámica color tiza con dos asas.",credit:"https://unsplash.com/photos/rMXj3xI-3KY"
    }),
    pulso: Object.freeze({
      number:"ESTUDIO 03 / CONTENEDORES",title:"Objeto Pulso",tagline:"Lo cotidiano también puede sorprender.",
      description:"Forma pequeña, carácter largo. Este concepto investiga cómo la textura y la luz convierten un contenedor en una presencia familiar que cambia a lo largo del día.",
      category:"Contenedor · estudio conceptual",image:"https://images.unsplash.com/photo-1613424777445-f93a2a48e285?auto=format&fit=crop&w=1050&q=80",
      alt:"Jarrón cerámico marrón en una escena doméstica.",credit:"https://unsplash.com/photos/4GvsTa3Y-5I"
    })
  });
  const nav = document.getElementById("site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  if (nav && navToggle) {
    const closeNavigation=()=>{nav.classList.remove("is-open");navToggle.setAttribute("aria-expanded","false");};
    navToggle.addEventListener("click",()=>{
      const next=navToggle.getAttribute("aria-expanded")!=="true";
      nav.classList.toggle("is-open",next);navToggle.setAttribute("aria-expanded",String(next));
    });
    nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",closeNavigation));
    document.addEventListener("keydown",event=>{if(event.key==="Escape")closeNavigation();});
    document.addEventListener("click",event=>{if(!nav.contains(event.target)&&!navToggle.contains(event.target))closeNavigation();});
  }

  // Filter logic is independent of layout: data-category and data-filter are the public API.
  const filterButtons=Array.from(document.querySelectorAll("[data-filter]"));
  const cards=Array.from(document.querySelectorAll(".product-card[data-category]"));
  const status=document.getElementById("filter-status");
  function showCategory(category){
    let visible=0;
    cards.forEach(card=>{
      const show=category==="todos"||card.dataset.category===category;
      card.hidden=!show;if(show)visible++;
    });
    filterButtons.forEach(button=>{
      const on=button.dataset.filter===category;
      button.classList.toggle("is-active",on);
      button.setAttribute("aria-pressed",String(on));
    });
    if(status)status.textContent="MOSTRANDO "+String(visible).padStart(2,"0")+" "+(visible===1?"ESTUDIO":"ESTUDIOS");
  }
  filterButtons.forEach(button=>button.addEventListener("click",()=>showCategory(button.dataset.filter)));
  showCategory("todos");

  // Native dialog handles Tab trapping and Escape. Its trigger receives focus on close.
  const dialog=document.getElementById("object-dialog");
  const dialogClose=document.getElementById("dialog-close");
  let activeTrigger=null;
  function put(id,value){const target=document.getElementById(id);if(target)target.textContent=value;}
  function openStudy(key,trigger){
    const data=studies[key];
    if(!data||!dialog||typeof dialog.showModal!=="function")return;
    activeTrigger=trigger;
    put("dialog-number",data.number);
    put("dialog-title",data.title);
    put("dialog-tagline",data.tagline);
    put("dialog-description",data.description);
    put("dialog-category",data.category);
    const img=document.getElementById("dialog-image");
    if(img){img.src=data.image;img.alt=data.alt;}
    const credit=document.getElementById("dialog-credit");
    if(credit)credit.href=data.credit;
    if(!dialog.open)dialog.showModal();
    dialogClose?.focus();
  }
  document.querySelectorAll("[data-open]").forEach(button=>button.addEventListener("click",()=>openStudy(button.dataset.open,button)));
  dialogClose?.addEventListener("click",()=>dialog?.close());
  dialog?.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
  dialog?.addEventListener("close",()=>{if(activeTrigger?.isConnected)activeTrigger.focus();activeTrigger=null;});

  // Media errors are visible; photographic content is never silently invented or replaced.
  document.querySelectorAll("img[src*='images.unsplash.com']").forEach(img=>{
    img.addEventListener("error",()=>{
      img.classList.add("media-error");
      img.setAttribute("title","Imagen fotográfica no disponible. Revisá la conexión o los créditos al final.");
      img.parentElement?.classList.add("has-media-error");
    });
  });
})();
