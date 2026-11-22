/* PROMETEO shared content v1.1.0; data independent of any app. */
const safeType=t=>typeof t==='string'&&/^[a-z0-9-]+$/.test(t);
export function normalizeResponse(source){
 const e=source&&typeof source==='object'?source:{};
 const blocks=Array.isArray(e.blocks)?e.blocks.filter(b=>b&&typeof b==='object'&&safeType(b.type)):[];
 if(!blocks.length&&typeof e.body==='string'&&e.body)blocks.push({type:'text',text:e.body});
 return {id:String(e.id||''),room:String(e.room||''),title:typeof e.title==='string'?e.title:'',publishedAt:typeof e.publishedAt==='string'?e.publishedAt:'',original:e.original?.authorized===true&&typeof e.original.text==='string'?e.original.text:null,blocks};
}
export function workEvidence(item){
 const ev=item?.evidence||{},valid=x=>typeof x==='string'&&x.trim().length>0&&!x.includes('PLACEHOLDER');
 return {prepared:true,started:valid(ev.started),delivered:valid(ev.delivered),verified:valid(ev.verified)};
}
