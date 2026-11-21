// ORIGINAL PAPER CHARACTER · LÍA / 2.5D rig · no external assets.
// All geometry below is hand-authored editable SVG paper artwork (CC0 by project author).
export const CHARACTER = Object.freeze({
  id: "lia-cartografa",
  title: "Lía · Cartógrafa de lo perdido",
  version: "1.0.0",
  canvas: [400, 640],
  license: "CC0-1.0",
  artMethod: "original-illustrated-cutouts-2.5d",
  animationClips: ["reposo", "saludar", "caminar"],
  expressions: ["curiosa", "alegre", "sonolienta"]
});

const cuts = [
  {id:"shadow", z:-64, pivot:[200,587], svg:
    '<ellipse cx="206" cy="595" rx="100" ry="19" fill="#16272a" opacity=".24"/>'},
  {id:"back-ribbons", z:-35, pivot:[230,230], svg:
    '<path class="edge" d="M126 200 Q91 250 126 340 Q165 330 171 265 Z" fill="#ba6642"/><path d="M130 221 Q114 267 137 318" class="inkline"/>'+
    '<path class="edge" d="M261 192 Q314 266 304 354 Q272 355 250 293 Z" fill="#d5a35c"/><path d="M282 236 Q304 293 290 329" class="inkline"/>'},
  {id:"leg-back", z:-22, pivot:[168,499], svg:
    '<path class="edge" d="M146 485 L195 484 Q187 525 181 566 L173 593 L139 581 Q141 530 146 485Z" fill="#2d4c51"/>'+
    '<path d="M150 532 L187 537" class="stitch"/><path class="edge" d="M141 565 Q151 555 178 565 L183 589 Q179 600 157 600 L121 594 Q117 579 141 565Z" fill="#332c2c"/>'+
    '<path d="M124 589 Q154 586 181 593" class="inkline"/>'},
  {id:"leg-front", z:-12, pivot:[235,499], svg:
    '<path class="edge" d="M208 485 L254 480 L254 548 L247 581 L214 582 Q205 542 208 485Z" fill="#375b5b"/>'+
    '<path class="edge" d="M215 565 Q234 554 254 562 Q272 580 284 588 Q282 600 265 600 L216 595 Q205 583 215 565Z" fill="#6c392f"/>'+
    '<path d="M222 580 L255 578 M226 586 L258 586" class="stitch"/>'},
  {id:"hair-back", z:-9, pivot:[194,218], svg:
    '<path class="edge" d="M142 195 Q117 165 139 133 Q145 100 174 112 Q194 93 217 107 Q246 94 263 126 Q288 142 272 166 Q302 194 268 220 Q270 274 242 305 L146 300 Q123 268 132 240 Q111 218 142 195Z" fill="#243d40"/>'+
    '<path d="M145 156 Q159 128 191 131 M214 119 Q251 137 248 170 M260 184 Q272 208 253 234" class="hairline"/>'},
  {id:"arm-left", z:-4, pivot:[139,320], svg:
    '<path class="edge" d="M151 307 Q116 299 105 324 Q96 355 92 401 Q90 425 105 440 L126 433 Q139 393 163 350Z" fill="#b65c43"/>'+
    '<path d="M110 345 L129 346 L113 408" class="inkline"/><path class="edge" d="M99 424 L125 418 Q136 431 126 450 L108 469 Q93 467 89 453Z" fill="#edbd89"/>'+
    '<path d="M105 449 Q110 446 111 440 M115 452 L121 443" class="inkline"/>'+
    '<path d="M110 352 L136 356" class="stitch"/>'},
  {id:"coat-back", z:0, pivot:[202,318], svg:
    '<path class="edge" d="M164 302 Q133 300 124 337 L110 427 Q118 486 106 544 Q181 576 285 538 Q265 475 280 427 L281 345 Q269 307 238 303Z" fill="#315e5d"/>'+
    '<path class="edge" d="M127 440 Q161 455 198 461 Q228 469 271 440 L286 537 Q202 569 111 542Z" fill="#254d51"/>'+
    '<path d="M118 536 Q203 562 279 535" class="stitch"/>'+
    '<path d="M139 354 L123 431 M261 347 L268 421" class="inkline"/>'+
    '<path d="M126 469 Q202 494 275 467" class="stitch"/>'},
  {id:"coat-lining", z:6, pivot:[205,333], svg:
    '<path class="edge" d="M160 307 L211 324 L241 303 L253 385 L241 531 Q213 539 194 548 Q177 498 172 426Z" fill="#e6b370"/>'+
    '<path d="M206 324 L202 538 M211 373 L238 361 M205 423 L236 415" class="inkline"/>'+
    '<circle cx="207" cy="375" r="5" fill="#783d2c"/><circle cx="206" cy="426" r="5" fill="#783d2c"/><circle cx="204" cy="486" r="5" fill="#783d2c"/>'},
  {id:"pocket", z:15, pivot:[245,460], svg:
    '<path class="edge" d="M229 442 L268 435 L265 488 Q242 501 228 479Z" fill="#c8794f"/>'+
    '<path d="M234 455 L258 452 M238 468 L256 466" class="stitch"/>'+
    '<path d="M246 442 L246 434" class="inkline"/>'},
  {id:"neck", z:17, pivot:[205,291], svg:
    '<path class="edge" d="M186 275 L232 275 L231 326 Q212 351 190 325Z" fill="#e9b884"/>'+
    '<path d="M192 308 Q214 317 228 307" class="inkline"/>'},
  {id:"collar", z:21, pivot:[198,315], svg:
    '<path class="edge" d="M186 304 L207 331 L178 354 L156 314Z" fill="#f0dbc0"/>'+
    '<path class="edge" d="M229 300 L209 332 L239 354 L258 308Z" fill="#f0dbc0"/>'+
    '<path d="M179 326 L205 336 L237 328" class="stitch"/>'+
    '<path class="edge" d="M195 333 L215 333 L213 386 Q207 395 199 383Z" fill="#b75c48"/>'},
  {id:"arm-right", z:31, pivot:[264,321], svg:
    '<path class="edge" d="M254 310 Q280 301 293 325 Q302 361 320 403 Q323 425 306 436 L285 427 Q271 385 251 348Z" fill="#ba6646"/>'+
    '<path d="M276 347 Q292 377 303 412" class="inkline"/><path class="edge" d="M285 414 Q303 406 321 412 L322 438 Q309 452 294 443Z" fill="#e9b985"/>'+
    '<path d="M291 429 Q304 422 317 429" class="inkline"/><path d="M272 354 L291 351" class="stitch"/>'},
  {id:"atlas", z:37, pivot:[311,436], svg:
    '<path class="edge" d="M300 427 L365 415 L376 487 L306 501Z" fill="#e8d9a9"/>'+
    '<path class="edge" d="M303 426 Q332 427 366 414 L370 484 Q336 479 308 500Z" fill="#e8c992"/>'+
    '<path d="M330 421 L337 490 M311 445 Q326 436 349 448 M347 445 L360 432 M347 470 Q359 459 369 463" class="inkline"/>'+
    '<path d="M319 464 L325 461 L330 466 L333 475 L322 474Z" fill="#ba6246"/>'+
    '<circle cx="350" cy="457" r="4" fill="#315e5d"/><circle cx="360" cy="442" r="3" fill="#ba6246"/>'+
    '<path d="M351 457 L326 468 L361 442" class="stitch"/>'},
  {id:"face", z:44, pivot:[199,222], svg:
    '<path class="edge" d="M155 180 Q174 147 217 150 Q259 153 268 189 L268 235 Q260 269 221 296 Q194 310 169 284 Q151 264 150 225Z" fill="#efc697"/>'+
    '<path d="M155 231 Q143 227 149 213 Q151 208 160 216 M267 220 Q279 207 275 225 Q275 230 267 232" fill="#d49c75" stroke="#362f30" stroke-width="3"/>'+
    '<path d="M164 194 Q176 176 193 183 M222 181 Q242 173 252 187" class="inkline"/>'+
    '<path d="M208 215 Q199 237 207 245 L217 245" class="inkline"/>'+
    '<path d="M176 259 Q184 268 195 265" stroke="#c47864" stroke-width="3" fill="none"/>'+
    '<path d="M222 268 Q233 267 242 257" stroke="#c47864" stroke-width="3" fill="none"/>'+
    '<ellipse cx="175" cy="249" rx="13" ry="6" fill="#cb8b76" opacity=".52"/>'+
    '<ellipse cx="244" cy="249" rx="12" ry="6" fill="#cb8b76" opacity=".52"/>'+
    '<path d="M167 272 Q191 291 209 286" class="stitch" opacity=".6"/>'},
  {id:"features", z:50, pivot:[203,220], svg:
    '<g class="face-feature brows"><path d="M170 199 Q183 193 195 200 M226 198 Q239 194 251 201" class="brow"/></g>'+
    '<g class="face-feature eye-open"><path d="M170 215 Q184 207 197 216 Q184 228 170 215 M226 215 Q238 206 251 213 Q239 226 226 215" fill="#f8eee0" stroke="#27363b" stroke-width="3"/>'+
    '<ellipse cx="184" cy="216" rx="5" ry="8" fill="#223e40"/><ellipse cx="238" cy="214" rx="5" ry="8" fill="#223e40"/>'+
    '<circle cx="186" cy="213" r="2" fill="#fff5e6"/><circle cx="240" cy="212" r="2" fill="#fff5e6"/></g>'+
    '<g class="face-feature eye-closed"><path d="M170 218 Q185 226 196 217 M225 217 Q237 226 252 216" class="inkline"/></g>'+
    '<g class="face-feature mouth-curiosa"><path d="M197 263 Q212 268 224 259" class="inkline"/></g>'+
    '<g class="face-feature mouth-alegre"><path d="M194 260 Q212 282 229 257 Q215 284 194 260Z" fill="#9b4a46" stroke="#693e39" stroke-width="2"/><path d="M200 264 Q211 270 224 261" stroke="#f6dfc0" stroke-width="3" fill="none"/></g>'+
    '<g class="face-feature mouth-sonolienta"><path d="M204 267 Q212 262 220 267" class="inkline"/></g>'+
    '<path d="M173 186 L183 183 M232 184 L243 186" class="stitch"/>'},
  {id:"hair-front", z:56, pivot:[199,164], svg:
    '<path class="edge" d="M145 187 Q133 160 154 136 Q176 112 203 126 Q228 111 251 133 Q266 145 262 172 Q232 163 220 150 Q201 171 179 163 Q167 186 145 187Z" fill="#203f43"/>'+
    '<path class="edge" d="M145 178 Q152 202 145 250 L133 259 Q124 219 145 178Z" fill="#203f43"/>'+
    '<path class="edge" d="M257 170 Q264 197 274 237 L261 253 Q245 216 257 170Z" fill="#203f43"/>'+
    '<path d="M156 151 Q167 143 182 147 M199 135 Q213 139 223 142 M230 146 Q243 152 250 156 M139 207 L142 238" class="hairline"/>'},
  {id:"hat", z:65, pivot:[205,155], svg:
    '<path class="edge" d="M146 144 Q156 89 202 82 Q254 85 267 145 Q210 170 146 144Z" fill="#b76042"/>'+
    '<path class="edge" d="M131 144 Q208 127 281 147 Q277 165 214 171 Q154 175 126 155Z" fill="#e1a45d"/>'+
    '<path d="M161 126 Q215 141 254 129" class="stitch"/>'+
    '<path class="edge" d="M215 90 Q229 53 262 53 Q246 73 239 100Z" fill="#315e5d"/>'+
    '<path d="M225 91 Q244 66 256 58" class="inkline"/>'+
    '<circle cx="189" cy="151" r="4" fill="#542c2a"/><circle cx="205" cy="150" r="4" fill="#542c2a"/>'},
  {id:"monocle", z:72, pivot:[238,215], svg:
    '<circle cx="238" cy="215" r="24" fill="none" stroke="#ddae65" stroke-width="5"/>'+
    '<path d="M260 222 Q280 243 267 309 Q258 341 245 373" fill="none" stroke="#ddb76e" stroke-width="3" stroke-dasharray="4 6"/>'+
    '<path d="M225 204 Q238 200 245 206" stroke="#fff9e9" stroke-width="3" fill="none" opacity=".7"/>'},
  {id:"star", z:88, pivot:[111,124], svg:
    '<path class="edge" d="M109 96 L115 119 L135 124 L116 131 L110 154 L104 132 L86 126 L104 120Z" fill="#e4bd79"/>'+
    '<circle cx="137" cy="95" r="4" fill="#d9ad6b"/><circle cx="83" cy="171" r="3" fill="#d9ad6b"/>'}
];

const commonDefs = '<defs><filter id="noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".08" numOctaves="2" seed="5"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".10"/></feComponentTransfer></filter></defs>';
const svgStyle = '<style>.edge{stroke:#f6e4c3;stroke-width:6;stroke-linejoin:round;paint-order:stroke fill;vector-effect:non-scaling-stroke}.inkline{fill:none;stroke:#563e36;stroke-width:3;stroke-linejoin:round;stroke-linecap:round}.hairline{fill:none;stroke:#578082;stroke-width:3;stroke-linecap:round}.stitch{fill:none;stroke:#e5c28e;stroke-width:2.2;stroke-dasharray:3 6;stroke-linecap:round}.brow{stroke:#28363b;stroke-width:5;fill:none;stroke-linecap:round}.eye-closed,.mouth-alegre,.mouth-sonolienta{display:none}</style>';

export function mountCharacter(host, options = {}) {
  if (!host || typeof host.appendChild !== 'function') throw new TypeError('host is required');
  const root = document.createElement('div');
  root.className = 'lia-rig emotion-curiosa';
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', 'Lía, cartógrafa de las cosas perdidas, un personaje animado hecho de recortes de papel');
  const layers = new Map();
  for (const part of cuts) {
    const el = document.createElement('div');
    el.className = 'lia-layer part-' + part.id;
    el.style.transformOrigin = (part.pivot[0]/4) + '% ' + (part.pivot[1]/6.4) + '%';
    el.innerHTML = '<svg viewBox="0 0 400 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + commonDefs + svgStyle + part.svg + '</svg>';
    root.appendChild(el);
    layers.set(part.id, {el, z:part.z});
  }
  host.appendChild(root);

  const state = {emotion:'curiosa', action:'reposo', yaw:options.yaw ?? -9, pitch:options.pitch ?? 0, animate:options.animate !== false};
  const motionOff = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  let raf = 0, last = 0, blinkAt = 0;

  function setPart(id, degree = 0, dx = 0, dy = 0) {
    const part = layers.get(id);
    if (!part) return;
    part.el.style.transform = 'translate3d(' + dx + 'px,' + dy + 'px,' + part.z + 'px) rotate(' + degree + 'deg)';
  }
  function redraw(ms) {
    const t = ms / 1000;
    const active = state.animate && !motionOff;
    const walk = active && state.action === 'caminar' ? Math.sin(t * 7.5) : 0;
    const wave = active && state.action === 'saludar' ? Math.sin(t * 10.5) : 0;
    const idle = active ? Math.sin(t * 1.45) : 0;
    root.style.transform = 'rotateY(' + state.yaw + 'deg) rotateX(' + state.pitch + 'deg)';
    for (const p of cuts) setPart(p.id);
    setPart('leg-front', walk * 18, 0, -Math.max(0,walk)*7);
    setPart('leg-back', -walk * 18, 0, -Math.max(0,-walk)*7);
    setPart('coat-back', walk*2, 0, idle*1.8);
    setPart('coat-lining', walk*2, 0, idle*1.8);
    setPart('pocket', walk*2, 0, idle*1.8);
    setPart('collar', idle*1.6, 0, idle*1.8);
    setPart('arm-left', state.action === 'saludar' ? -39 + wave*15 : (walk*-16+idle*2));
    setPart('arm-right', state.action === 'saludar' ? -85 + wave*18 : (walk*16-idle*2));
    setPart('atlas', state.action === 'saludar' ? -40+wave*12 : walk*9);
    setPart('face', idle*1.1);
    setPart('features', idle*1.1);
    setPart('hair-back', idle*1.7);
    setPart('hair-front', idle*1.5);
    setPart('hat', idle*2.2);
    setPart('monocle', idle*1.1);
    setPart('star', -t*8%360, 0, Math.sin(t*2)*4);
    const blink = active && ((t % 5.6) < .12);
    const sleepy = state.emotion === 'sonolienta';
    const feat = layers.get('features').el;
    feat.querySelector('.eye-open').style.display = (sleepy || blink) ? 'none' : '';
    feat.querySelector('.eye-closed').style.display = (sleepy || blink) ? 'inline' : 'none';
    feat.querySelector('.mouth-curiosa').style.display = state.emotion === 'curiosa' ? 'inline' : 'none';
    feat.querySelector('.mouth-alegre').style.display = state.emotion === 'alegre' ? 'inline' : 'none';
    feat.querySelector('.mouth-sonolienta').style.display = state.emotion === 'sonolienta' ? 'inline' : 'none';
    last = ms;
    raf = requestAnimationFrame(redraw);
  }
  raf = requestAnimationFrame(redraw);

  const api = {
    root,
    manifest: CHARACTER,
    parts: cuts.map(({id,z,pivot}) => ({id,z,pivot})),
    setEmotion(emotion) {
      if (!CHARACTER.expressions.includes(emotion)) return false;
      root.classList.remove('emotion-' + state.emotion);
      state.emotion = emotion;
      root.classList.add('emotion-' + emotion);
      return true;
    },
    setAction(action) {
      if (!CHARACTER.animationClips.includes(action)) return false;
      state.action = action;
      return true;
    },
    setOrbit(yaw, pitch=0) {
      state.yaw = Math.max(-31, Math.min(31, Number(yaw) || 0));
      state.pitch = Math.max(-13, Math.min(13, Number(pitch) || 0));
    },
    setAnimate(animate) { state.animate = Boolean(animate); },
    getState() { return {...state}; },
    destroy() { cancelAnimationFrame(raf); root.remove(); }
  };
  return api;
}
