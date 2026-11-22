// SECUENCIA · Node 20+ · QA lógico reproducible. NO prueba visual/browser/video.
import {readFileSync} from "node:fs";
import {Script,runInNewContext} from "node:vm";
import assert from "node:assert/strict";
const get=name=>readFileSync(new URL("./"+name,import.meta.url),"utf8");
const e=get("engine.js"),editor=get("editor.js"),sample=get("sample-story.html"),html=get("index.html");
const box={window:{}};runInNewContext(e,box);const api=box.window.SEQ;let ok=0;
function check(name,fn){fn();console.log("PASS",name);ok++}
check("editor parses",()=>new Script(editor));
check("sample equals exporter",()=>assert.equal(api.makeStandalone(api.SEQ_SAMPLE),sample));
check("original illustration embedded",()=>assert.ok(sample.includes("data:image/svg+xml")));
check("no remote dependencies",()=>assert.doesNotMatch(sample,/<script[^>]+src=|<link[^>]+href=|(?:src|href)="https?:\/\//i));
check("shared renderer",()=>assert.ok(editor.includes("window.SEQ.makeStandalone(state)")));
check("mobile and reduced-motion",()=>{assert.ok(sample.includes("max-width:600px"));assert.ok(sample.includes("prefers-reduced-motion:reduce"))});
check("accessible form labels",()=>assert.ok(html.includes("aria-label=")));
check("media upload validation",()=>{assert.ok(editor.includes("MAX=4*1024*1024"));assert.ok(editor.includes("video/webm"))});
check("SVG charset accepted by import",()=>assert.ok(editor.includes("(?:;[^,]*)?,")));
check("malicious script terminator escaped",()=>{const data=JSON.parse(JSON.stringify(api.SEQ_SAMPLE));data.blocks[0].body="</script><img src=x onerror=1>";const h=api.makeStandalone(data),m=h.match(/<script type="application\/json" id="seq-data">([\s\S]*?)<\/script>/);assert.ok(m);assert.equal(JSON.parse(m[1]).blocks[0].body,data.blocks[0].body)});
check("HTML title escaped",()=>{const data=JSON.parse(JSON.stringify(api.SEQ_SAMPLE));data.title="</title><script>";assert.ok(api.makeStandalone(data).includes("&lt;/title&gt;"))});
class El {constructor(tag){this.tagName=tag;this.children=[];this.className="";this.dataset={};this.style={};this.textContent="";this.classList={add:()=>{}};}append(...xs){this.children.push(...xs)}addEventListener(){}setAttribute(){}scrollIntoView(){}querySelectorAll(){return this.children.filter(x=>x.className.split(" ").includes("chapter"))}}
function mount(data){const root=new El("main"),document={querySelector:s=>s==="#story"?root:s==="#seq-data"?{textContent:JSON.stringify(data)}:null,createElement:t=>new El(t),body:{prepend(){}},activeElement:{tagName:"BODY"}};runInNewContext("("+api.storyRuntime.toString()+")()",{document,window:{addEventListener(){}},matchMedia:()=>({matches:false})});return root}
const root=mount(api.SEQ_SAMPLE);
check("four chapters mounted",()=>assert.equal(root.children.filter(x=>x.className.split(" ").includes("chapter")).length,4));
check("image element mounted",()=>assert.ok(root.children[0].children.some(x=>x.tagName==="img")));
check("text preserved",()=>assert.ok(root.children[2].children.some(x=>x.className==="chapter-body"&&x.children.some(y=>y.textContent==="El ruido no desaparece. Se aleja."))));
check("video element can mount (playback NOT_RUN)",()=>{const data=JSON.parse(JSON.stringify(api.SEQ_SAMPLE));data.blocks[2].type="video";data.blocks[2].media="data:video/webm;base64,AAAA";const r=mount(data);assert.ok(r.children[2].children.some(x=>x.className==="chapter-body"&&x.children.some(y=>y.tagName==="video")))});
console.log(ok+" logical checks PASS; browser, video playback and visual QA NOT_RUN.");
