import {PRODUCTS,money,cleanCart,changeQuantity,cartSummary} from './cart-core.js';
const KEY='prometeo-web-w002-05-cart-v1';const SELECT='prometeo-web-w002-05-finish-v1';
const $=id=>document.getElementById(id), swatches=[...document.querySelectorAll('.swatch')];
const photo=[...document.querySelectorAll('[data-photo]')];
let cart={},selected='natural',toastTimer=0,lastFocus=null;
function read(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch{return fallback}}
function store(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{ /* Estado en memoria si storage no disponible. */ }}
const saved=read(KEY,{});cart=cleanCart(saved);
const query=new URLSearchParams(location.search).get('acabado');
const preferred=Object.hasOwn(PRODUCTS,query)?query:read(SELECT,'natural');
function setFinish(sku,{write=true}={}){if(!Object.hasOwn(PRODUCTS,sku))return;selected=sku;const p=PRODUCTS[sku];$('finishName').textContent=p.label;$('finishNote').textContent=p.note;$('priceValue').textContent=money(p.price);for(const b of swatches){const on=b.dataset.sku===sku;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));}for(const img of photo){img.dataset.finish=sku;img.setAttribute('aria-label',`Imagen conceptual de luminaria NÓDO 01, acabado ${p.label}`)}if(write){store(SELECT,sku);const url=new URL(location.href);url.searchParams.set('acabado',sku);history.replaceState(null,'',url.pathname+url.search+url.hash)}}
function renderCart(){const info=cartSummary(cart);$('cartCount').textContent=info.count;$('cartTotal').textContent=money(info.total);$('clearCart').disabled=!info.count;$('demoCheckout').disabled=!info.count;if(!info.count){$('cartItems').innerHTML='<p class="cart-empty">Tu bolsa está vacía.<br>Un poco de luz puede cambiar eso.</p>';return}const fragment=document.createDocumentFragment();for(const item of info.entries){const card=document.createElement('article');card.className='cart-item';const thumb=document.createElement('div');thumb.className='cart-thumb';thumb.style.backgroundPosition=item.position;thumb.setAttribute('role','img');thumb.setAttribute('aria-label',`Acabado ${item.label}`);const copy=document.createElement('div');const h=document.createElement('h3');h.textContent='NÓDO 01';const label=document.createElement('div');label.className='cart-finish';label.textContent=item.label;const qty=document.createElement('div');qty.className='qty';const minus=document.createElement('button');minus.type='button';minus.textContent='−';minus.setAttribute('aria-label',`Quitar una unidad de ${item.label}`);minus.addEventListener('click',()=>alter(item.sku,-1));const count=document.createElement('span');count.textContent=item.quantity;const plus=document.createElement('button');plus.type='button';plus.textContent='+';plus.disabled=item.quantity>=99;plus.setAttribute('aria-label',`Agregar una unidad de ${item.label}`);plus.addEventListener('click',()=>alter(item.sku,1));qty.append(minus,count,plus);copy.append(h,label,qty);const subtotal=document.createElement('strong');subtotal.textContent=money(item.subtotal);card.append(thumb,copy,subtotal);fragment.append(card)}$('cartItems').replaceChildren(fragment)}
function alter(sku,delta){cart=changeQuantity(cart,sku,delta);store(KEY,cart);renderCart();$('checkoutMessage').textContent=''}
function notify(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2500)}
const dialog=$('cartDialog');function openCart(){lastFocus=document.activeElement;renderCart();if(!dialog.open)dialog.showModal();$('cartClose').focus()}
function closeCart(){dialog.close();lastFocus?.focus?.()}
for(const b of swatches)b.addEventListener('click',()=>setFinish(b.dataset.sku));
$('addToCart').addEventListener('click',()=>{alter(selected,1);notify(`${PRODUCTS[selected].label} agregado a tu bolsa`);openCart()});
$('cartOpen').addEventListener('click',openCart);$('cartClose').addEventListener('click',closeCart);
dialog.addEventListener('click',e=>{if(e.target===dialog)closeCart()});
dialog.addEventListener('close',()=>{if(lastFocus&&document.contains(lastFocus))lastFocus.focus()});
$('clearCart').addEventListener('click',()=>{cart={};store(KEY,cart);renderCart()});
$('demoCheckout').addEventListener('click',()=>{$('checkoutMessage').textContent='Demostración terminada. No se generó ningún pedido ni cargo.';notify('Demostración completa, sin transacción')});
setFinish(Object.hasOwn(PRODUCTS,preferred)?preferred:'natural',{write:false});renderCart();
window.addEventListener('storage',e=>{if(e.key===KEY){cart=cleanCart(read(KEY,{}));renderCart()}});
