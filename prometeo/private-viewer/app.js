'use strict';
/* PROMETEO Viewer V1: public client, private GitHub content. No credential persistence. */
const $ = id => document.getElementById(id);
const $files = $('files'), $preview = $('preview'), $status = $('status');
let token = '';
let owner = '', repository = '', branch = '', folder = '';
let activePath = '', activeId = '', activeRoot = '', lastOpened = '';
let fileCache = new Map(), moduleCache = new Map(), busy = false;
const decoder = new TextDecoder('utf-8');
const allowed = /\.(html?|m?js|css|json|glb|gltf|bin|obj|mtl|png|jpe?g|gif|webp|svg|avif|ico|mp3|wav|ogg|flac|m4a|mp4|webm|vtt|txt|md|woff2?|ttf|otf|wasm|pdf)$/i;

function status(text) { $status.textContent = text; }
function escapeHtml(text) { return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function normalizePath(path) {
  const parts = [];
  for (const p of String(path).replace(/\\/g, '/').split('/')) {
    if (!p || p === '.') continue;
    if (p === '..') { if (!parts.length) throw Error('Ruta fuera del repositorio'); parts.pop(); }
    else parts.push(p);
  }
  return parts.join('/');
}
function dirname(path) { const at = path.lastIndexOf('/'); return at < 0 ? '' : path.slice(0, at); }
function joinPath(base, relative) { return normalizePath((base ? base + '/' : '') + relative.split(/[?#]/)[0]); }
function ghPath(path) { return path.split('/').map(encodeURIComponent).join('/'); }
function key(path) { return owner + '/' + repository + '@' + branch + ':' + path; }
function mime(path) {
  const ext = (path.split('.').pop() || '').toLowerCase();
  const types = {html:'text/html',htm:'text/html',js:'text/javascript',mjs:'text/javascript',css:'text/css',json:'application/json',glb:'model/gltf-binary',gltf:'model/gltf+json',bin:'application/octet-stream',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',svg:'image/svg+xml',avif:'image/avif',ico:'image/x-icon',mp3:'audio/mpeg',wav:'audio/wav',ogg:'audio/ogg',flac:'audio/flac',m4a:'audio/mp4',mp4:'video/mp4',webm:'video/webm',vtt:'text/vtt',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',wasm:'application/wasm',pdf:'application/pdf',md:'text/plain',txt:'text/plain'};
  return types[ext] || 'application/octet-stream';
}
function b64Bytes(b64) {
  const clean = b64.replace(/\s/g, '');
  const data = atob(clean);
  const bytes = new Uint8Array(data.length);
  for (let i=0; i<data.length; i++) bytes[i] = data.charCodeAt(i);
  return bytes;
}
function bytesB64(bytes) {
  let str = '';
  for (let i=0; i<bytes.length; i+=0x8000) str += String.fromCharCode(...bytes.subarray(i, i+0x8000));
  return btoa(str);
}
async function github(path) {
  const response = await fetch('https://api.github.com' + path, {
    headers: Object.assign({'Accept':'application/vnd.github+json'}, token ? {'Authorization':'Bearer ' + token} : {}),
    cache: 'no-store',
    referrerPolicy: 'no-referrer'
  });
  if (!response.ok) {
    let message = 'GitHub HTTP ' + response.status;
    try { message = (await response.json()).message || message; } catch (_) {}
    throw Error(message + (response.status === 404 ? ' (¿rama incorrecta o sin acceso privado?)' : ''));
  }
  return response.json();
}
function contentsURL(path) {
  return '/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repository) + '/contents/' + ghPath(path) + '?ref=' + encodeURIComponent(branch);
}
async function fetchBytes(path) {
  path = normalizePath(path);
  if (!allowed.test(path)) throw Error('Tipo de archivo bloqueado: ' + path);
  const cacheKey = key(path);
  if (fileCache.has(cacheKey)) return fileCache.get(cacheKey);
  const pending = (async () => {
    const data = await github(contentsURL(path));
    if (!data || data.type !== 'file') throw Error('No es un archivo: ' + path);
    if (data.size > 24 * 1024 * 1024) throw Error('Archivo demasiado grande para V1 (24 MiB): ' + path);
    let blob = data;
    if (!blob.content || blob.encoding !== 'base64') {
      blob = await github('/repos/' + encodeURIComponent(owner) + '/' + encodeURIComponent(repository) + '/git/blobs/' + encodeURIComponent(data.sha));
    }
    if (!blob.content || blob.encoding !== 'base64') throw Error('GitHub no entregó contenido Base64: ' + path);
    return b64Bytes(blob.content);
  })();
  fileCache.set(cacheKey, pending);
  try { return await pending; } catch (e) { fileCache.delete(cacheKey); throw e; }
}
async function getText(path) { return decoder.decode(await fetchBytes(path)); }
async function dataURL(path) { return 'data:' + mime(path) + ';base64,' + bytesB64(await fetchBytes(path)); }
function isRelative(url) { return /^(?:\.{1,2}\/|[^/#.:?][^:]*$)/.test(url) && !url.startsWith('//'); }
function withinRoot(path) { return !activeRoot || path === activeRoot || path.startsWith(activeRoot + '/'); }
function assertAsset(path) {
  path = normalizePath(path);
  if (!withinRoot(path)) throw Error('Recurso fuera de la carpeta abierta: ' + path);
  if (!allowed.test(path)) throw Error('Formato de recurso bloqueado: ' + path);
  return path;
}

/* Local ES imports are converted to data: modules before a sandboxed document runs. */
async function compileModule(path, seen = new Set()) {
  path = assertAsset(path);
  if (seen.has(path)) throw Error('Importación circular no compatible en V1: ' + path);
  const cacheKey = key(path);
  if (moduleCache.has(cacheKey)) return moduleCache.get(cacheKey);
  const nextSeen = new Set(seen); nextSeen.add(path);
  const task = (async () => {
    const source = await getText(path);
    // Static import/export and string-literal import() with local specifiers.
    const re = /(\b(?:import|export)\s+(?:(?:[\w\s{},*$]+?)\s+from\s*)?|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"]+)\2/g;
    let match, result = '', cursor = 0;
    while ((match = re.exec(source))) {
      const local = joinPath(dirname(path), match[3]);
      const compiled = await compileModule(local, nextSeen);
      result += source.slice(cursor, match.index) + match[1] + match[2] + compiled + match[2];
      cursor = match.index + match[0].length;
    }
    result += source.slice(cursor);
    return 'data:text/javascript;charset=utf-8,' + encodeURIComponent(result).replace(/'/g,'%27');
  })();
  moduleCache.set(cacheKey, task);
  try { return await task; } catch(e) { moduleCache.delete(cacheKey); throw e; }
}
async function rewriteCss(css, base) {
  const re = /url\(\s*(["']?)(\.{1,2}\/[^'")]+)\1\s*\)/g;
  let match, result='', cursor=0;
  while ((match = re.exec(css))) {
    const src = joinPath(base, match[2]);
    result += css.slice(cursor, match.index) + 'url("' + await dataURL(assertAsset(src)) + '")';
    cursor = match.index + match[0].length;
  }
  return result + css.slice(cursor);
}

/* A sandboxed iframe may message its parent for files, but never receives the token. */
function bridgeSource(id, directory) {
  const info = JSON.stringify({id:id, dir:directory});
  return '(function(){ "use strict"; const cfg=' + info + '; let index=0; const jobs=new Map();'
    + 'const nativeFetch=window.fetch.bind(window);'
    + 'window.addEventListener("message",function(ev){const m=ev.data; if(ev.source!==parent||!m||m.kind!=="pv:result"||m.id!==cfg.id)return; const job=jobs.get(m.n);if(!job)return;jobs.delete(m.n);clearTimeout(job.timer);'
    + 'if(m.error){job.reject(new Error(m.error));return;}job.resolve(new Response(m.bytes,{status:200,headers:{"Content-Type":m.mime||"application/octet-stream"}}));});'
    + 'window.fetch=function(input,opts){const raw=typeof input==="string"?input:(input&&input.url);if(!raw)return nativeFetch(input,opts);'
    + 'const method=(opts&&opts.method)||(input&&input.method)||"GET";if(method.toUpperCase()!=="GET")return nativeFetch(input,opts);'
    + 'if((/^(?:https?:|data:|blob:)/i.test(raw)||raw.startsWith("//"))&&!raw.startsWith("https://prometeo-viewer.invalid/"))return nativeFetch(input,opts);'
    + 'let path;try{path=new URL(raw,"https://prometeo-viewer.invalid/"+cfg.dir).pathname.slice(1);}catch(e){return Promise.reject(e);}'
    + 'return new Promise(function(resolve,reject){const n=++index;const timer=setTimeout(()=>{jobs.delete(n);reject(new Error("Tiempo agotado al cargar "+path));},30000);jobs.set(n,{resolve,reject,timer});parent.postMessage({kind:"pv:fetch",id:cfg.id,n,path},"*");});'
    + '};window.__PROMETEO_VIEWER__={mode:"sandboxed",private:true,version:1};})();';
}
function newSession() { return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + String(Math.random())); }
async function prepareHtml(path) {
  activePath = path; activeRoot = dirname(path); activeId = newSession();
  moduleCache.clear();
  const html = await getText(path);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  for (const base of doc.querySelectorAll('base')) base.remove();
  // Relative Request() URLs in WebGL loaders resolve against a synthetic base.
  const virtualBase = doc.createElement('base');
  virtualBase.setAttribute('href', 'https://prometeo-viewer.invalid/' + (activeRoot ? activeRoot + '/' : ''));
  doc.head.insertBefore(virtualBase, doc.head.firstChild);
  for (const link of Array.from(doc.querySelectorAll('link[rel="stylesheet"][href]'))) {
    const src = link.getAttribute('href');
    if (!isRelative(src)) continue;
    const cssPath = assertAsset(joinPath(activeRoot, src));
    const node = doc.createElement('style');
    node.textContent = await rewriteCss(await getText(cssPath), dirname(cssPath));
    link.replaceWith(node);
  }
  for (const style of Array.from(doc.querySelectorAll('style'))) {
    style.textContent = await rewriteCss(style.textContent, activeRoot);
  }
  for (const el of Array.from(doc.querySelectorAll('img[src],audio[src],video[src],source[src],video[poster],input[src]'))) {
    const attr = el.hasAttribute('src') ? 'src' : 'poster';
    const src = el.getAttribute(attr);
    if (isRelative(src)) el.setAttribute(attr, await dataURL(assertAsset(joinPath(activeRoot, src))));
  }
  for (const el of Array.from(doc.querySelectorAll('script'))) {
    const src = el.getAttribute('src');
    if (src && isRelative(src)) {
      const jsPath = assertAsset(joinPath(activeRoot, src));
      if (el.getAttribute('type') === 'module') el.setAttribute('src', await compileModule(jsPath));
      else { el.removeAttribute('src'); el.textContent = await getText(jsPath); }
    } else if (!src && el.getAttribute('type') === 'module') {
      const text = el.textContent;
      const re = /(\b(?:import|export)\s+(?:(?:[\w\s{},*$]+?)\s+from\s*)?|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"]+)\2/g;
      let match, result='', cursor=0;
      while ((match = re.exec(text))) {
        const compiled = await compileModule(joinPath(activeRoot, match[3]));
        result += text.slice(cursor, match.index) + match[1] + match[2] + compiled + match[2];
        cursor = match.index + match[0].length;
      }
      el.textContent = result + text.slice(cursor);
    }
  }
  const shim = doc.createElement('script');
  shim.textContent = bridgeSource(activeId, activeRoot ? activeRoot + '/' : '');
  doc.head.insertBefore(shim, doc.head.firstChild);
  return '<!doctype html>\n' + doc.documentElement.outerHTML;
}
function clearFrame() {
  activePath = ''; activeId=''; activeRoot=''; lastOpened='';
  $preview.hidden = true; $preview.removeAttribute('srcdoc');
  $('welcome').hidden = false;
  $('reload').disabled = true; $('fullscreen').disabled = true;
  $('title').textContent = 'Ningún archivo abierto';
  $('subtitle').textContent = 'El HTML se ejecuta aislado en este dispositivo';
}
async function openFile(path) {
  if (busy) return;
  busy = true;
  try {
    status('Preparando vista privada…');
    const type = mime(path);
    let documentHtml;
    if (type === 'text/html') documentHtml = await prepareHtml(path);
    else {
      activePath=path;activeRoot=dirname(path);activeId=newSession();
      const url=await dataURL(path);
      if (type.startsWith('image/')) documentHtml = '<!doctype html><style>body{margin:0;background:#080b0c;height:100vh;display:grid;place-items:center}img{max-width:100%;max-height:100vh;object-fit:contain}</style><img src="' + url + '">';
      else if (type.startsWith('audio/')) documentHtml = '<!doctype html><style>body{margin:0;background:#080b0c;height:100vh;display:grid;place-items:center}</style><audio controls autoplay src="' + url + '"></audio>';
      else if (type.startsWith('video/')) documentHtml = '<!doctype html><style>body{margin:0;background:#080b0c;height:100vh;display:grid;place-items:center}</style><video controls playsinline style="max-width:100%;max-height:100%" src="' + url + '"></video>';
      else if (type === 'application/pdf') documentHtml = '<!doctype html><iframe style="position:fixed;inset:0;width:100%;height:100%;border:0" src="' + url + '"></iframe>';
      else documentHtml = '<!doctype html><pre style="white-space:pre-wrap;overflow-wrap:anywhere;padding:25px;color:#d9e8df;background:#101614;font:13px/1.55 monospace">' + escapeHtml(await getText(path)) + '</pre>';
    }
    $preview.srcdoc = documentHtml;
    $preview.hidden = false; $('welcome').hidden = true;
    $('reload').disabled = false; $('fullscreen').disabled = false;
    $('title').textContent = path.split('/').pop();
    $('subtitle').textContent = owner + '/' + repository + ' · ' + branch + ' · ' + path;
    lastOpened = path;
    status('Vista preparada · ejecutándose en un marco aislado');
  } catch (e) { console.error('Viewer:', e.message); status('Error: ' + e.message); }
  finally { busy = false; }
}
function fileButton(label, icon, detail, onClick) {
  const button = document.createElement('button');
  button.className = 'file';
  const sym = document.createElement('span');sym.className='sym';sym.textContent=icon;
  const name = document.createElement('span');name.textContent=label;
  const small = document.createElement('small');small.textContent=detail;
  button.append(sym,name,small);button.addEventListener('click',onClick);
  return button;
}
async function listFolder(path) {
  status('Leyendo carpeta privada…');
  const data = await github(contentsURL(path));
  if (!Array.isArray(data)) throw Error('Ruta no es carpeta');
  folder = path; $('location').textContent = '/' + path;
  $files.replaceChildren();
  if (path) $files.append(fileButton('..','↰','VOLVER',()=>listFolder(dirname(path)).catch(e=>status('Error: '+e.message))));
  const items = data.slice().sort((a,b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
  $('count').textContent = items.length + ' ELEMENTOS';
  for (const item of items) {
    if (item.type === 'dir') $files.append(fileButton(item.name,'▣','CARPETA',()=>listFolder(item.path).catch(e=>status('Error: '+e.message))));
    else if (item.type === 'file' && allowed.test(item.path)) $files.append(fileButton(item.name, /\.html?$/i.test(item.name)?'▶':'•',item.size>1048576?Math.round(item.size/1048576)+' MB':Math.round(item.size/1024)+' KB',()=>openFile(item.path)));
  }
  if (!$files.children.length) $files.innerHTML='<div class="empty">La carpeta no contiene archivos compatibles.</div>';
  status('Carpeta cargada. Abrí un HTML o recurso multimedia.');
}
async function browse(initialFolder='') {
  const parts = $('repository').value.trim().split('/');
  if (parts.length !== 2 || !/^[\w.-]+$/.test(parts[0]) || !/^[\w.-]+$/.test(parts[1])) { status('Repositorio inválido. Usá usuario/repositorio.'); return; }
  const nextBranch = $('branch').value.trim();
  if (!nextBranch || nextBranch.includes('..') || nextBranch.includes('?')) { status('Ingresá una rama o SHA válido.'); return; }
  owner=parts[0];repository=parts[1];branch=nextBranch;
  clearFrame();fileCache.clear();moduleCache.clear();
  try { await listFolder(initialFolder); }
  catch(e) { $files.replaceChildren();status('Error al explorar: '+e.message); }
}
window.addEventListener('message', async e => {
  const data = e.data;
  if (e.source !== $preview.contentWindow || !data || data.kind !== 'pv:fetch' || data.id !== activeId || !activeId) return;
  const reply = {kind:'pv:result',id:activeId,n:data.n};
  try {
    const path = assertAsset(data.path);
    const bytes = await fetchBytes(path);
    reply.mime = mime(path);reply.bytes = bytes.slice().buffer;
    e.source.postMessage(reply,'*',[reply.bytes]);
  } catch(error) {
    reply.error = String(error.message||error);
    e.source.postMessage(reply,'*');
  }
});
$('connect').addEventListener('click', async () => {
  const candidate = $('token').value.trim();
  $('token').value = '';
  if (!candidate) { status('Pegá un token de solo lectura o usá la demo pública.');return; }
  token=candidate;fileCache.clear();moduleCache.clear();
  try {
    const data=await github('/repos/JuanManuelPM/pruebas');
    $('auth-state').textContent = data.private ? 'Conectado · privado' : 'Token activo';
    $('auth-state').classList.add('active');
    status('Token validado para ' + data.full_name + '. No se guardó.');
  } catch(e) { token='';$('auth-state').textContent='Sin conectar';$('auth-state').classList.remove('active');status('Conexión fallida: '+e.message); }
});
$('disconnect').addEventListener('click', () => {
  token='';fileCache.clear();moduleCache.clear();clearFrame();
  $('auth-state').textContent='Sin conectar';$('auth-state').classList.remove('active');
  status('Credencial eliminada de memoria. Cerrá la pestaña para completar el cierre.');
});
$('browse').addEventListener('click', () => browse());
$('demo').addEventListener('click', async () => {
  $('repository').value='JuanManuelPM/Experimentos';
  $('branch').value='candidate/cocina-umbria-002-production-20261119';
  await browse('prometeo/cocina-umbria-002');
});
$('reload').addEventListener('click', () => {
  if (lastOpened && !busy) { const path=lastOpened;fileCache.clear();moduleCache.clear();openFile(path); }
});
$('fullscreen').addEventListener('click', () => {
  const stage=$('stage');if (!document.fullscreenElement) stage.requestFullscreen?.().catch(e=>status('Pantalla completa: '+e.message));else document.exitFullscreen?.();
});
window.addEventListener('pagehide',()=> { token=''; });
status('Listo. Conectá GitHub o abrí la demo pública.');
window.PrometeoViewer = { browse, openFile, hasVisibleFile(name) { return Array.from($files.querySelectorAll('button.file')).some(x => x.textContent.includes(name)); } };
