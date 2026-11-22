/* PROMETEO · candidate shared work status policy · not active on gh-pages. */
function validSource(s){return !!(s&&typeof s==="object"&&typeof s.repo==="string"&&/^[^/\s]+\/[^/\s]+$/.test(s.repo)&&typeof s.ref==="string"&&s.ref.trim()&&typeof s.path==="string"&&s.path.trim()&&typeof s.sha==="string"&&/^[a-f0-9]{40}$/i.test(s.sha));}
function hasProof(e,status){return !!(e&&typeof e==="object"&&e.status===status&&validSource(e.source));}
function evidenceFlags(item,copied=false){
 const r=item?.result,ev=item?.evidence||{};
 const hasContent=!!(r&&typeof r==="object"&&typeof r.id==="string"&&r.id.trim()&&((typeof r.body==="string"&&r.body.trim())||(Array.isArray(r.blocks)&&r.blocks.some(x=>x&&typeof x==="object"&&(typeof x.text==="string"&&x.text.trim()||typeof x.url==="string"&&x.url.trim()||typeof x.src==="string"&&x.src.trim())))));
 const started=hasProof(ev.started,"STARTED_EVIDENCED");
 const delivered=hasContent||hasProof(ev.delivered,"DELIVERED");
 const checked=Array.isArray(ev.verified?.checks)&&ev.verified.checks.length>0&&ev.verified.checks.some(x=>x&&x.result==="PASS"&&typeof x.evidenceRef==="string"&&x.evidenceRef.trim()&&x.kind!=="SOURCE_READBACK");
 const verified=delivered&&hasProof(ev.verified,"VERIFIED")&&checked;
 return [true,Boolean(copied),started,delivered,verified];
}
export {validSource,hasProof,evidenceFlags};
