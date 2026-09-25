import fs from "node:fs/promises";import path from "node:path";
const out=path.resolve("worker-lab/asset-hunter/out");await fs.mkdir(out,{recursive:true});
const searches=[
 {id:"hands",query:"pointing hand engraving manicule"},
 {id:"masks",query:"black mask face"},
 {id:"eyes",query:"eye close up"},
 {id:"flea",query:"Micrographia flea Hooke"}
];
const allowed=/public domain|cc0|cc by|cc-by|cc by-sa|cc-by-sa|pd-/i;
function strip(x=""){return String(x).replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()}
const groups=[];
for(const s of searches){
 const u=new URL("https://commons.wikimedia.org/w/api.php");
 Object.entries({action:"query",generator:"search",gsrsearch:s.query,gsrnamespace:"6",gsrlimit:"12",prop:"imageinfo",iiprop:"url|mime|extmetadata",iiurlwidth:"480",format:"json",origin:"*"}).forEach(([k,v])=>u.searchParams.set(k,v));
 const r=await fetch(u);if(!r.ok)throw new Error("Commons "+r.status);const b=await r.json();const pages=Object.values(b.query?.pages||{});
 const items=pages.map(p=>{const ii=p.imageinfo?.[0]||{},m=ii.extmetadata||{},lic=strip(m.LicenseShortName?.value||m.UsageTerms?.value||"");return{
   title:p.title?.replace(/^File:/,""),pageid:p.pageid,mime:ii.mime||"",thumb:ii.thumburl||ii.url||"",source:ii.descriptionurl||"",license:lic,artist:strip(m.Artist?.value||""),credit:strip(m.Credit?.value||""),description:strip(m.ImageDescription?.value||"")
 }}).filter(x=>/^image\//.test(x.mime)&&x.thumb&&allowed.test(x.license)).slice(0,6);
 groups.push({...s,items});
}
const report={generated_at:new Date().toISOString(),source:"Wikimedia Commons API",license_filter:"Public domain / CC0 / CC BY / CC BY-SA",groups,total:groups.reduce((n,g)=>n+g.items.length,0)};
await fs.writeFile(path.join(out,"latest.json"),JSON.stringify(report,null,2));console.log(JSON.stringify({groups:groups.map(g=>({id:g.id,count:g.items.length})),total:report.total},null,2));