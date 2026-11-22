// Reusable, side-effect-free demo commerce kernel. No payment, order or network API.
export const CATALOG=Object.freeze({
 tiza:Object.freeze({id:'tiza',sku:'LEN-01-TIZ',name:'Tiza',subtitle:'Tejido arena',price:249000}),
 arcilla:Object.freeze({id:'arcilla',sku:'LEN-01-ARC',name:'Arcilla',subtitle:'Tejido natural',price:259000}),
 noche:Object.freeze({id:'noche',sku:'LEN-01-NOC',name:'Noche',subtitle:'Tejido carbón',price:269000})
});
export const STORAGE_KEY='lento01-demo-cart-v1';
export const money=(amount)=>new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(amount);
const validId=(id)=>Object.hasOwn(CATALOG,id);
const qty=(n)=>Number.isSafeInteger(n)?Math.max(0,Math.min(n,20)):0;
export function sanitizeCart(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return {};
 const out={}; for(const [id,amount] of Object.entries(input))if(validId(id)&&qty(amount)>0)out[id]=qty(amount);
 return out;
}
export function updateCart(input,{type,id,quantity}={}){
 const cart=sanitizeCart(input);
 if(type==='CLEAR')return {};
 if(!validId(id))return cart;
 const next={...cart};
 if(type==='ADD')next[id]=qty((next[id]||0)+1);
 if(type==='SET')next[id]=qty(quantity);
 if(type==='REMOVE')delete next[id];
 if(!next[id])delete next[id];
 return next;
}
export function summarizeCart(input){
 const cart=sanitizeCart(input);
 const lines=Object.entries(cart).map(([id,quantity])=>({...CATALOG[id],quantity,subtotal:CATALOG[id].price*quantity}));
 return {lines,count:lines.reduce((n,l)=>n+l.quantity,0),total:lines.reduce((n,l)=>n+l.subtotal,0)};
}
export function readCart(storage){try{return sanitizeCart(JSON.parse(storage.getItem(STORAGE_KEY)||'{}'))}catch{return {}}}
export function writeCart(storage,cart){try{storage.setItem(STORAGE_KEY,JSON.stringify(sanitizeCart(cart)));return true}catch{return false}}
