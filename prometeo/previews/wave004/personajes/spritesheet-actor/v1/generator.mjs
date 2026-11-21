// LUMA · Original illustrated spritesheet generator · CC0 equivalent: original work; see LICENSE.md
function frameMarkup(state,i,col,row){
  const phase=i*Math.PI/4, sw=Math.sin(phase), cs=Math.cos(phase), walk=state==="walk", react=state==="react", turn=state==="turn";
  const back=turn&&(i===3||i===4||i===5), side=turn&&(i===2||i===6), sideLeft=turn&&i===6;
  const bob=walk?Math.round(Math.abs(sw)*4):react?(-3-Math.round(Math.sin(phase)*3)):Math.round(Math.sin(phase)*2);
  const lean=walk?Math.round(sw*3):react?(-2+Math.round(cs*2)):0;
  const sway=walk?Math.round(sw*8):react?Math.round(cs*3):Math.round(sw*2);
  const eye=react?7:4.8;
  const lampY=react?-37:walk?Math.round(Math.abs(sw)*7):Math.round(Math.sin(phase)*2);
  const footL=walk?Math.round(sw*13):0, footR=walk?-footL:0;
  const coatNarrow=side?0.78:back?0.93:1;
  const front=!(back);
  const cloakBack=`<path d="M113 146 C97 152 80 169 76 193 C74 232 82 267 68 ${316+sway} Q91 329 110 319 L128 326 Q143 316 152 324 Q177 328 207 ${309-sway} C196 270 208 219 199 184 Q191 158 166 146 Z" fill="url(#cloak)" stroke="#0a202f" stroke-width="4" stroke-linejoin="round"/>`;
  const foot=(x,offset,rot)=>`<g transform="translate(${offset},0) rotate(${rot},${x},284)"><path d="M${x-9} 273 Q${x-15} 293 ${x-15} 309 L${x-17} 320 Q${x-12} 330 ${x+12} 326 L${x+15} 321 L${x+5} 278 Z" fill="url(#boot)" stroke="#081820" stroke-width="3"/><path d="M${x-15} 316 Q${x-2} 320 ${x+14} 316" stroke="#6c8e96" stroke-width="2.4" fill="none"/></g>`;
  const hoodFront=`<path d="M100 118 Q89 106 96 83 Q108 44 142 38 Q176 44 191 83 Q195 110 178 124 L162 148 L119 149 Z" fill="url(#hood)" stroke="#091c2c" stroke-width="4"/><path d="M111 84 Q125 51 143 51 Q166 55 182 87" stroke="#a8d0c5" stroke-opacity=".55" stroke-width="3" fill="none"/><path d="M97 91 Q66 77 54 49 Q73 49 106 63 L119 81" fill="#17465b" stroke="#0d2936" stroke-width="3"/><path d="M182 88 Q219 65 228 45 Q238 76 193 104" fill="#17586b" stroke="#0d2936" stroke-width="3"/><path d="M110 108 Q111 75 145 72 Q179 75 175 111 Q170 138 141 140 Q114 135 110 108Z" fill="url(#face)" stroke="#0d2936" stroke-width="3"/>${back?"":side?`<path d="M139 95 Q164 87 170 100 L159 123 L139 121 Z" fill="#f6cca3" opacity=".65"/><ellipse cx="${sideLeft?137:157}" cy="104" rx="${eye}" ry="${eye+1}" fill="#24303b"/><circle cx="${sideLeft?138:159}" cy="102" r="2.2" fill="#fff4d1"/>`:`<path d="M114 90 Q141 72 171 90" stroke="#6f8a80" stroke-width="3" fill="none"/><ellipse cx="128" cy="106" rx="${eye}" ry="${eye+1}" fill="#172d38"/><ellipse cx="157" cy="106" rx="${eye}" ry="${eye+1}" fill="#172d38"/><circle cx="130" cy="104" r="2.2" fill="#fff9dc"/><circle cx="159" cy="104" r="2.2" fill="#fff9dc"/><path d="M137 119 Q145 ${react?126:122} 151 119" stroke="#934d57" stroke-width="2.1" fill="none"/>`}`;
  const hoodBack=`<path d="M102 125 Q85 107 96 77 Q108 44 141 39 Q177 47 188 84 Q194 107 179 128 L162 149 L122 151 Z" fill="url(#hood)" stroke="#091c2c" stroke-width="4"/><path d="M104 88 Q147 71 181 91" stroke="#8cbbb4" stroke-opacity=".55" stroke-width="3" fill="none"/><path d="M115 120 Q139 129 166 119" stroke="#9fb3ab" stroke-opacity=".5" stroke-width="2" fill="none"/>`;
  const lantern=`<g transform="translate(${react?4:0},${lampY})"><path d="M202 193 Q219 193 218 215 L222 248 Q219 261 205 263 Q189 261 185 248 L189 215 Q190 193 202 193 Z" fill="url(#glass)" stroke="#1c3842" stroke-width="4"/><path d="M197 202 Q205 192 211 204 M195 249 L214 249" fill="none" stroke="#fce2a5" stroke-width="3"/><path d="M199 192 Q198 179 205 179 Q212 179 211 192" stroke="#a4c8bc" stroke-width="3.4" fill="none"/><path d="M202 207 Q191 224 201 243 Q211 242 214 231 Q218 216 208 209 Z" fill="#ffdc80" opacity=".84"/><circle cx="204" cy="226" r="${react?20:14}" fill="#ffc969" opacity=".11" filter="url(#glow)"/><circle cx="204" cy="228" r="5" fill="#fffad2"/><path d="M189 231 L218 231" stroke="#5b574a" stroke-width="2" opacity=".55"/></g>`;
  return `<g data-state="${state}" data-frame="${i}" transform="translate(${col*280} ${row*360})"><g transform="translate(0 ${bob}) rotate(${lean} 140 171)"><g transform="translate(140 0) scale(${coatNarrow} 1) translate(-140 0)">
    ${foot(116,footL,walk?Math.round(sw*9):0)}${foot(165,footR,walk?-Math.round(sw*9):0)}
    <path d="M116 165 Q81 175 78 209 L85 257 Q72 290 70 ${315+sway} Q92 327 113 318 Q138 327 157 318 Q177 330 211 ${311-sway} Q190 272 201 223 Q211 182 172 163 Z" fill="url(#cloak)" stroke="#0b2432" stroke-width="4" stroke-linejoin="round"/>
    <path d="M92 210 Q109 237 104 304 M177 188 Q185 241 194 300" stroke="#a3d6c9" stroke-opacity=".25" stroke-width="2.5" fill="none"/>
    <path d="M101 179 Q134 193 178 170 L180 293 Q157 305 146 320 Q126 304 104 308Z" fill="url(#coat)" stroke="#102832" stroke-width="3"/>
    <path d="M110 184 Q142 219 153 306" stroke="#a1dac4" stroke-width="3" opacity=".36" fill="none"/>
    <path d="M156 190 L166 293" stroke="#081c29" stroke-width="2" opacity=".5"/>
    <path d="M112 221 Q146 234 180 221 L181 236 Q142 251 113 237Z" fill="#854d4e" stroke="#301f34" stroke-width="2"/>
    <path d="M142 226 L150 236 L157 225" fill="#edbc7c" stroke="#f3d59e" stroke-width="1"/>
    ${back?`<path d="M126 196 Q142 209 160 195 L160 266 L140 279 L121 267 Z" fill="#1d4752" stroke="#9abbb2" stroke-opacity=".65" stroke-width="2"/><path d="M127 226 L155 226 M140 213 L140 262" stroke="#ffc76d" stroke-width="2" opacity=".8"/>`:`
    <path d="M108 172 Q142 189 181 170 L174 204 Q137 215 112 200Z" fill="#d6aa7d" stroke="#2b4850" stroke-width="3"/>
    <path d="M111 173 L126 200 L152 178" fill="none" stroke="#fff0d1" stroke-width="4" stroke-opacity=".55"/>
    <path d="M115 176 Q93 187 89 215 L104 233 Q121 219 122 202Z" fill="#264956" stroke="#0e2734" stroke-width="3"/>
    <path d="M171 176 Q190 185 197 205 L191 222 L174 206Z" fill="#1d4155" stroke="#0e2734" stroke-width="3"/>
    <path d="M93 216 L104 222" stroke="#e6be93" stroke-width="7" stroke-linecap="round"/>
    <path d="M190 218 Q199 224 205 215" fill="none" stroke="#edc69d" stroke-width="7" stroke-linecap="round"/>
    <path d="M119 244 L146 251 L142 270 L119 265 Z" fill="#163548" stroke="#91b4a7" stroke-width="2"/><path d="M123 251 L136 255" stroke="#f0c67d" stroke-width="2"/>
    ${lantern}
    `}
    ${back?hoodBack:hoodFront}
    <path d="M104 153 Q118 142 140 147 Q164 144 180 156 L167 173 Q138 184 112 174Z" fill="#c57971" stroke="#693f49" stroke-width="3"/>
    <path d="M107 157 Q94 163 ${85+sway} 182 Q102 180 118 169" fill="#c98779" stroke="#854953" stroke-width="2"/>
    <path d="M128 151 L155 154" stroke="#f1bca0" stroke-width="3" opacity=".6"/>
    ${react?`<path d="M55 125 L49 113 M229 121 L237 110 M211 78 L213 64" stroke="#f9d48e" stroke-width="4" stroke-linecap="round" opacity=".85"/>`:``}
    </g></g></g>`;
}

function buildAtlas(){
  const states=["idle","walk","turn","react"];
  const defs=`<defs>
  <linearGradient id="cloak" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#478a85"/><stop offset=".28" stop-color="#245465"/><stop offset=".75" stop-color="#173b52"/><stop offset="1" stop-color="#0c2737"/></linearGradient>
  <linearGradient id="coat" x1="0" x2="1" y1="0" y2=".5"><stop stop-color="#172f40"/><stop offset=".55" stop-color="#315b65"/><stop offset="1" stop-color="#112b3b"/></linearGradient>
  <linearGradient id="hood" x1="0" x2="1" y1="0" y2=".8"><stop stop-color="#4a8580"/><stop offset=".45" stop-color="#1a4a5f"/><stop offset="1" stop-color="#142e46"/></linearGradient>
  <linearGradient id="face" x1="0" y1="0" x2=".9" y2="1"><stop stop-color="#f8deb2"/><stop offset=".5" stop-color="#d8a483"/><stop offset="1" stop-color="#af7480"/></linearGradient>
  <linearGradient id="boot" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4c6d77"/><stop offset=".75" stop-color="#142a3b"/></linearGradient>
  <radialGradient id="glass"><stop stop-color="#fff8c9"/><stop offset=".36" stop-color="#f3c474"/><stop offset="1" stop-color="#815a48"/></radialGradient>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>
  </defs>`;
  let frames=""; for(let row=0;row<4;row++){for(let i=0;i<8;i++)frames+=frameMarkup(states[row],i,i,row);}
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2240" height="1440" viewBox="0 0 2240 1440" role="img" aria-label="Luma, personaje vectorial con 32 cuadros transparentes: reposo, caminar, giro y reaccion">${defs}${frames}</svg>`;
}

if (typeof process !== 'undefined' && process?.stdout) process.stdout.write(buildAtlas());
