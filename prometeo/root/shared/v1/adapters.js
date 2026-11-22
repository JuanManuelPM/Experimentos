/* Typed media and capability adapters, with safe DOM rendering. */
import {safeURL} from './actions.js';
const extensions=new Map();
export function registerBlockAdapter(type,render){
 if(!/^[a-z0-9-]+$/.test(type)||typeof render!=='function')throw Error('Invalid block adapter');
 extensions.set(type,render);return ()=>extensions.delete(type);
}
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=String(text);return n;}
function resource(block,kind){
 const url=safeURL(block.src);if(!url)return null;const n=el(kind,'p-media');n.src=url;
 if(kind==='img'){n.alt=String(block.alt||'');n.loading='lazy';}else{n.controls=true;n.preload='metadata';}return n;
}
function link(label,url){const href=safeURL(url);if(!href)return null;const a=el('a','p-file',label||'Archivo');a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;}
export function renderBlock(block){
 if(!block||typeof block!=='object')return null;
 if(extensions.has(block.type)){const n=extensions.get(block.type)(block);return n instanceof Node?n:null;}
 switch(block.type){
 case 'text':return el('p','p-prose',block.text||'');
 case 'heading':return el('h3','p-subhead',block.text||'');
 case 'image':case 'diagram':return resource(block,'img');
 case 'video':return resource(block,'video');
 case 'audio':return resource(block,'audio');
 case 'file':return link(block.label,block.url);
 case 'table':{
 if(!Array.isArray(block.rows))return null;const wrap=el('div','p-table-scroll'),table=el('table','p-table');
 if(Array.isArray(block.columns)){const tr=el('tr');for(const c of block.columns)tr.append(el('th','',c));table.append(tr);}
 for(const row of block.rows.slice(0,1000)){if(!Array.isArray(row))continue;const tr=el('tr');for(const c of row.slice(0,30))tr.append(el('td','',c));table.append(tr);}
 wrap.append(table);return wrap;}
 default:return null;
 }}
