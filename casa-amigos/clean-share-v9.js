const share=document.querySelector('#shareButton');
if(share){
  share.addEventListener('click',async e=>{
    e.preventDefault();
    e.stopImmediatePropagation();
    const params=new URLSearchParams(location.search);
    const room=(params.get('r')||'clase').replace(/[^a-z0-9_-]/gi,'').slice(0,24)||'clase';
    const url=new URL(location.origin+'/');
    if(room!=='clase')url.searchParams.set('r',room);
    try{
      if(navigator.share)await navigator.share({title:'Walkie',text:'Entrá a Walkie',url:url.href});
      else{
        await navigator.clipboard.writeText(url.href);
        const toast=document.querySelector('#toast');
        if(toast){toast.textContent='LINK COPIADO';toast.classList.remove('hidden');setTimeout(()=>toast.classList.add('hidden'),1600)}
      }
    }catch{}
  },true);
}
