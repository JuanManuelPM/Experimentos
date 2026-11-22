// Módulo reutilizable, agnóstico de la interfaz. Todos los importes son enteros ARS ficticios.
export const PRODUCTS=Object.freeze({
 natural:Object.freeze({sku:'natural',label:'Metal natural',short:'Natural',price:189000,note:'Aluminio satinado de tono champagne. Reflejos suaves y cálidos.',position:'0% 0'}),
 grafito:Object.freeze({sku:'grafito',label:'Grafito oscuro',short:'Grafito',price:198000,note:'Carácter profundo y superficie mate, con luz de tono cálido.',position:'50% 0'}),
 arcilla:Object.freeze({sku:'arcilla',label:'Arcilla cálida',short:'Arcilla',price:205000,note:'Terracota mineral imaginaria para espacios de tacto más orgánico.',position:'100% 0'})
});
export const CURRENCY = new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0});
export function money(n){return CURRENCY.format(n)}
export function cleanCart(raw){if(!raw || typeof raw!=='object'||Array.isArray(raw))return {};const clean={};for(const [sku,count] of Object.entries(raw)){if(Object.hasOwn(PRODUCTS,sku)&&Number.isSafeInteger(count)&&count>0)clean[sku]=Math.min(count,99)}return clean}
export function changeQuantity(cart,sku,delta){if(!Object.hasOwn(PRODUCTS,sku)||!Number.isSafeInteger(delta))return cleanCart(cart);const next=cleanCart(cart),q=Math.max(0,Math.min(99,(next[sku]||0)+delta));if(q)next[sku]=q;else delete next[sku];return next}
export function cartSummary(cart){const entries=Object.entries(cleanCart(cart)).map(([sku,quantity])=>({...PRODUCTS[sku],quantity,subtotal:quantity*PRODUCTS[sku].price}));return{entries,count:entries.reduce((s,x)=>s+x.quantity,0),total:entries.reduce((s,x)=>s+x.subtotal,0)}}
