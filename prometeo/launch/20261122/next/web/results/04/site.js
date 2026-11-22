import { AXES, AXIS_KEYS, PRESETS, createVariableEngine, cssSettings } from "./axis-engine.js";

const $ = selector => document.querySelector(selector);
const engine = createVariableEngine(PRESETS.editorial);
const stage = $("#display-text"), textarea = $("#specimen-input");
const summary = $("#axis-summary"), specimenInputs = [...document.querySelectorAll("[data-axis]")];
const presetButtons = [...document.querySelectorAll("[data-preset]")];
const fontStatus = $("#font-status");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const format = (key, value) => key === "wght" ? String(Math.round(value)) : key === "slnt" ? value.toFixed(1) : value.toFixed(2);

function refreshSpecimen(axes) {
  stage.style.fontVariationSettings = cssSettings(axes);
  summary.textContent = "wght " + Math.round(axes.wght) + " / CASL " + axes.CASL.toFixed(2) + " / MONO " + axes.MONO.toFixed(2);
  for (const input of specimenInputs) {
    const axis = input.dataset.axis;
    input.value = String(axes[axis]);
    const out = document.querySelector('[data-output="' + axis + '"]');
    if (out) out.textContent = format(axis, axes[axis]);
    const data = AXES[axis];
    const percentage = ((axes[axis] - data.min) / (data.max - data.min) * 100).toFixed(2) + "%";
    input.style.setProperty("--progress",percentage);
  }
  for (const button of presetButtons) {
    const preset = PRESETS[button.dataset.preset];
    button.setAttribute("aria-pressed", String(AXIS_KEYS.every(key => Math.abs(preset[key] - axes[key]) < .00001)));
  }
}
engine.subscribe(refreshSpecimen);
textarea.addEventListener("input", () => {
  stage.textContent = textarea.value || " ";
});
for (const input of specimenInputs) {
  input.addEventListener("input", () => engine.set(input.dataset.axis, input.value));
}
for (const button of presetButtons) {
  button.addEventListener("click", () => engine.replace(PRESETS[button.dataset.preset]));
}

const copyButton = $("#copy-css");
copyButton.addEventListener("click", async () => {
  const css = "font-family: 'Recursive', sans-serif;\nfont-variation-settings: " + engine.css() + ";";
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(css);
    else {
      const temp = document.createElement("textarea"); temp.value = css; temp.style.position = "fixed"; temp.style.opacity = "0";
      document.body.append(temp);temp.select();if (!document.execCommand("copy")) throw Error("copy");temp.remove();
    }
    copyButton.innerHTML = 'CSS COPIADO <span aria-hidden="true">✓</span>';
  } catch {
    copyButton.textContent = "COPIA NO DISPONIBLE";
  }
  window.setTimeout(() => copyButton.innerHTML='COPIAR CSS <span aria-hidden="true">↗</span>',2200);
});

if (document.fonts?.load) {
  document.fonts.load('800 36px "Recursive"', "Tipografía variable").then(fonts => {
    fontStatus.textContent = fonts.length ? "FUENTE VARIABLE CARGADA" : "FUENTE NO DISPONIBLE · MODO SISTEMA";
  }).catch(() => fontStatus.textContent = "FUENTE NO DISPONIBLE · MODO SISTEMA");
} else {
  fontStatus.textContent = "ESTADO DE FUENTE NO DISPONIBLE";
}

/* Independent motion composition. Animation changes the actual OpenType axes. */
const DURATION = 8000;
const keyframes = [
  {at:0, axes:{wght:360,CASL:0,MONO:1,slnt:0,CRSV:0}},
  {at:2000, axes:{wght:1000,CASL:0,MONO:1,slnt:0,CRSV:0}},
  {at:4000, axes:{wght:800,CASL:1,MONO:0,slnt:-15,CRSV:1}},
  {at:6000, axes:{wght:300,CASL:0,MONO:0,slnt:0,CRSV:0}},
  {at:8000, axes:{wght:950,CASL:1,MONO:0,slnt:0,CRSV:0}}
];
const poster = $("#motion-text"), button = $("#motion-toggle"), seek = $("#motion-seek"), timer = $("#motion-time"), hint = $("#motion-hint");
let playhead = 0, playing = false, animationId = 0, clockOrigin = 0;
const timestamp = ms => "00:" + String(Math.floor(ms / 1000)).padStart(2,"0");
function sampleAt(ms) {
  const t = Math.max(0,Math.min(DURATION,Number(ms)||0));
  let left=keyframes[0],right=keyframes[keyframes.length-1];
  for (let i=0;i<keyframes.length-1;i++) if(t>=keyframes[i].at&&t<=keyframes[i+1].at){left=keyframes[i];right=keyframes[i+1];break;}
  const raw=(t-left.at)/(right.at-left.at||1);
  const eased=raw*raw*(3-2*raw);
  const values={};
  for(const axis of AXIS_KEYS) values[axis]=left.axes[axis]+(right.axes[axis]-left.axes[axis])*eased;
  return values;
}
function renderMotion(ms) {
  playhead=Math.max(0,Math.min(DURATION,Number(ms)||0));
  poster.style.fontVariationSettings=cssSettings(sampleAt(playhead));
  seek.value=String(playhead);timer.textContent=timestamp(playhead)+" / "+timestamp(DURATION);
  poster.setAttribute("data-frame",String(Math.floor(playhead/1000)));
}
function pauseMotion() {
  playing=false;window.cancelAnimationFrame(animationId);animationId=0;
  button.innerHTML='▶&nbsp; REPRODUCIR';button.setAttribute("aria-pressed","false");
}
function tick(now) {
  if(!playing)return;
  renderMotion(now-clockOrigin);
  if(playhead>=DURATION){pauseMotion();return;}
  animationId=window.requestAnimationFrame(tick);
}
function playMotion() {
  if(prefersReduced.matches){pauseMotion();hint.textContent="Movimiento reducido activo. Usá la barra para explorar los cuadros.";return;}
  if(playhead>=DURATION)renderMotion(0);
  clockOrigin=performance.now()-playhead;playing=true;
  button.innerHTML='Ⅱ&nbsp; PAUSAR';button.setAttribute("aria-pressed","true");
  animationId=window.requestAnimationFrame(tick);
}
button.addEventListener("click",()=>playing?pauseMotion():playMotion());
seek.addEventListener("input",()=>{pauseMotion();renderMotion(Number(seek.value));});
function motionPreferenceChanged(){
  if(prefersReduced.matches){pauseMotion();hint.textContent="Movimiento reducido: los ejes solo cambian manualmente.";button.disabled=true;button.setAttribute("aria-disabled","true");}
  else{button.disabled=false;button.removeAttribute("aria-disabled");hint.textContent="Sin autoplay. Vos decidís el ritmo.";}
}
if(typeof prefersReduced.addEventListener==="function")prefersReduced.addEventListener("change",motionPreferenceChanged);
else if(typeof prefersReduced.addListener==="function")prefersReduced.addListener(motionPreferenceChanged);
renderMotion(0);motionPreferenceChanged();
