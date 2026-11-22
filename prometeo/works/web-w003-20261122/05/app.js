import {CATALOG,readCart,writeCart,updateCart,summarizeCart,money} from './cart-core.js';
const scenes=[...document.querySelectorAll('[data-scene]')],swatches=[...document.querySelectorAll('[data-finish]')];
const label=document.getElementById('finish-label'),price=document.getElementById('price');
const dialog=document.getElementById('bag'),lines=document.getElementById('bag-lines'),bagCount=document.getElementById('bag-count'),bagTotal=document.getElementById('bag-total'),finish=document.getElementById('demo-finish'),status=document.getElementById('demo-message');
let current='tiza'; let cart=readCart(localStorage);
function chooseFinish(id,{updateUrl=true}={}){
 if(!Object.hasOwn(CATALOG,id))return;
 current=id;const item=CATALOG[id];
 document.body.classList.remove('finish-tiza','finish-arcilla','finish-noche');document.body.classList.add('finish-'+id);
 scenes.forEach(scene=>{scene.classList.remove('finish-tiza','finish-arcilla','finish-noche');scene.classList.add('finish-'+id);scene.querySelectorAll('[data-radio]').forEach(svg=>svg.setAttribute('aria-label',`Radio LENTO 01 conceptual, acabado ${item.name}`))});
 swatches.forEach(button=>{const chosen=button.dataset.finish===id;button.classList.toggle('is-selected',chosen);button.setAttribute('aria-pressed',String(chosen))});
 label.textContent=`${item.name} / ${item.subtitle.toLowerCase()}`;price.textContent=money(item.price);
 if(updateUrl){const url=new URL(location.href);url.searchParams.set('acabado',id);history.replaceState(null,'',url)}
}
function drawCart(){
 const summary=summarizeCart(cart);bagCount.textContent=summary.count;bagTotal.textContent=money(summary.total);
 finish.disabled=summary.count===0;
 if(!summary.lines.length){lines.innerHTML='<p class="empty">Todavía no agregaste ningún LENTO.</p>';return}
 lines.replaceChildren(...summary.lines.map(item=>{
  const row=document.createElement('div');row.className='bag-line';
  const desc=document.createElement('div');const name=document.createElement('h3');name.textContent=`LENTO 01 · ${item.name}`;const sub=document.createElement('small');sub.textContent=`${item.sku} · ${money(item.price)} / unidad`;desc.append(name,sub);
  const cost=document.createElement('strong');cost.textContent=money(item.subtotal);
  const controls=document.createElement('div');controls.className='qty';
  const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label',`Quitar una unidad de ${item.name}`);minus.dataset.action='less';minus.dataset.id=item.id;
  const count=document.createElement('span');count.textContent=item.quantity;
  const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.setAttribute('aria-label',`Agregar una unidad de ${item.name}`);plus.dataset.action='more';plus.dataset.id=item.id;
  const remove=document.createElement('button');remove.type='button';remove.textContent='Eliminar';remove.className='remove';remove.dataset.action='remove';remove.dataset.id=item.id;
  controls.append(minus,count,plus,remove);row.append(desc,cost,controls);return row;
 }));
}
function saveAndDraw(next){cart=next;writeCart(localStorage,cart);status.textContent='';drawCart()}
function openBag(){drawCart();if(!dialog.open)dialog.showModal()}
swatches.forEach(button=>button.addEventListener('click',()=>chooseFinish(button.dataset.finish)));
document.getElementById('add-to-bag').addEventListener('click',()=>{saveAndDraw(updateCart(cart,{type:'ADD',id:current}));openBag()});
document.getElementById('cart-open').addEventListener('click',openBag);
document.getElementById('cart-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
lines.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;const id=button.dataset.id,action=button.dataset.action;saveAndDraw(action==='remove'?updateCart(cart,{type:'REMOVE',id}):updateCart(cart,{type:'SET',id,quantity:(cart[id]||0)+(action==='more'?1:-1)}))});
finish.addEventListener('click',()=>{if(summarizeCart(cart).count===0)return;saveAndDraw(updateCart(cart,{type:'CLEAR'}));status.textContent='Simulación terminada. No se efectuó ninguna compra.'});
window.addEventListener('storage',e=>{if(e.key==='lento01-demo-cart-v1'){cart=readCart(localStorage);drawCart()}});
const selected=new URL(location.href).searchParams.get('acabado');chooseFinish(Object.hasOwn(CATALOG,selected)?selected:'tiza',{updateUrl:false});drawCart();
