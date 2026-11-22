// CASA ENTRE PATIOS · Minimal standalone WebGL2 renderer · original code, no remote dependencies
const vs=`#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 uv;
uniform mat4 model, view, proj, lightMatrix;
out vec3 vPos,vNormal; out vec2 vUv; out vec4 vShadow;
void main(){vec4 wp=model*vec4(position,1.);vPos=wp.xyz;vNormal=normalize(mat3(transpose(inverse(model)))*normal);vUv=uv;vShadow=lightMatrix*wp;gl_Position=proj*view*wp;}`;
const fs=`#version 300 es
precision highp float;
precision highp sampler2DShadow;
in vec3 vPos,vNormal;in vec2 vUv;in vec4 vShadow;out vec4 frag;
uniform vec3 cameraPosition,baseColor,lightDirection,lightColor;
uniform float roughness,metalness,opacity,dayMix;
uniform int finish;
uniform sampler2DShadow shadowTexture;
float hash(vec3 p){p=fract(p*0.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float textureGrain(vec3 p){return sin((p.x*0.82+p.z*.17+p.y*.12)*115.+sin(p.x*16.)*2.)*.5+.5;}
float shadows(vec3 n,vec3 l){vec3 proj=vShadow.xyz/vShadow.w;proj=proj*.5+.5;if(proj.x<0.||proj.y<0.||proj.x>1.||proj.y>1.||proj.z>1.)return 1.;float bias=max(.0015,.005*(1.-dot(n,l)));float sh=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){sh+=texture(shadowTexture,vec3(proj.xy+vec2(float(x),float(y))/768.,proj.z-bias));}return mix(.38,1.,sh/9.);}
vec3 brdf(vec3 col,vec3 n,vec3 v,vec3 l,float rough,float metal){
 vec3 h=normalize(v+l);float nl=max(dot(n,l),.0001),nv=max(dot(n,v),.0001),nh=max(dot(n,h),.0001),hv=max(dot(h,v),0.);
 float a=rough*rough,a2=a*a;float D=a2/(3.14159*pow(nh*nh*(a2-1.)+1.,2.));
 float k=pow(rough+1.,2.)/8.;float G=(nl/(nl*(1.-k)+k))*(nv/(nv*(1.-k)+k));
 vec3 F0=mix(vec3(.04),col,metal),F=F0+(1.-F0)*pow(1.-hv,5.);
 return (col*(1.-F)*(1.-metal)/3.14159+D*G*F/max(4.*nv*nl,.001))*nl;
}
void main(){vec3 n=normalize(vNormal),v=normalize(cameraPosition-vPos),col=baseColor;
 float grain=hash(floor(vPos*65.)),g2=hash(floor(vPos*12.));
 if(finish==1)col*=.945+.10*g2+.02*grain; // mineral plaster
 if(finish==2)col*=.76+.30*textureGrain(vPos); // longitudinal timber grain
 if(finish==3)col*=.88+.15*grain; // terrazzo aggregate
 if(finish==4)col*=.94+.07*g2; // woven textiles
 if(finish==5)col*=.83+.12*grain; // patinated metal
 vec3 sun=normalize(lightDirection);vec3 radiance=brdf(col,n,v,sun,roughness,metalness)*lightColor*3.0*dayMix*shadows(n,sun);
 vec3 ambient=col*(.19+.27*dayMix)*mix(1.1,.65,max(0.,-n.y));
 vec3 lamppos[4];lamppos[0]=vec3(-5.2,2.78,1.8);lamppos[1]=vec3(5.1,2.65,1.4);lamppos[2]=vec3(0.,2.6,-5.5);lamppos[3]=vec3(0.,2.8,4.6);
 vec3 artificial=vec3(0.);
 for(int i=0;i<4;i++){vec3 delta=lamppos[i]-vPos;float dis=length(delta);float att=1./(1.+.14*dis*dis+.022*dis*dis*dis);artificial+=brdf(col,n,v,normalize(delta),roughness,metalness)*vec3(1.,.72,.39)*5.5*(1.-dayMix*.82)*att;}
 vec3 c=radiance+ambient+artificial;c=c/(c+vec3(.75));c=pow(c,vec3(1./2.2));frag=vec4(c,opacity);
}`;
const depthVS=`#version 300 es
layout(location=0) in vec3 position;uniform mat4 model,lightMatrix;void main(){gl_Position=lightMatrix*model*vec4(position,1.);}`;
const depthFS=`#version 300 es
precision highp float; void main(){}`;
const V=(x,y,z)=>[x,y,z];
export const vec={add:(a,b)=>a.map((v,i)=>v+b[i]),sub:(a,b)=>a.map((v,i)=>v-b[i]),mul:(a,v)=>a.map(x=>x*v),length:a=>Math.hypot(...a),norm:a=>{let l=Math.hypot(...a)||1;return a.map(v=>v/l)},cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]};
export const mat={
 identity:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
 multiply:(a,b)=>{let c=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)c[j*4+i]+=a[k*4+i]*b[j*4+k];return c},
 translation:(x,y,z)=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]),
 scaling:(x,y,z)=>new Float32Array([x,0,0,0,0,y,0,0,0,0,z,0,0,0,0,1]),
 rotationY:a=>new Float32Array([Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1]),
 rotationX:a=>new Float32Array([1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1]),
 rotationZ:a=>new Float32Array([Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1,0,0,0,0,1]),
 perspective:(fovy,aspect,n,f)=>{let t=1/Math.tan(fovy/2),o=new Float32Array(16);o[0]=t/aspect;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o},
 ortho:(l,r,b,t,n,f)=>new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]),
 lookAt:(eye,target,up=[0,1,0])=>{let z=vec.norm(vec.sub(eye,target)),x=vec.norm(vec.cross(up,z)),y=vec.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*eye[0]+x[1]*eye[1]+x[2]*eye[2]),-(y[0]*eye[0]+y[1]*eye[1]+y[2]*eye[2]),-(z[0]*eye[0]+z[1]*eye[1]+z[2]*eye[2]),1])},
 compose:(p,s=[1,1,1],rot=[0,0,0])=>mat.multiply(mat.translation(...p),mat.multiply(mat.rotationY(rot[1]),mat.multiply(mat.rotationX(rot[0]),mat.multiply(mat.rotationZ(rot[2]),mat.scaling(...s)))))
};
function cuboid(){const p=[],n=[],uv=[],ix=[];const faces=[[[1,0,0],[.5,-.5,-.5],[.5,-.5,.5],[.5,.5,.5],[.5,.5,-.5]],[[-1,0,0],[-.5,-.5,.5],[-.5,-.5,-.5],[-.5,.5,-.5],[-.5,.5,.5]],[[0,1,0],[-.5,.5,-.5],[.5,.5,-.5],[.5,.5,.5],[-.5,.5,.5]],[[0,-1,0],[-.5,-.5,.5],[.5,-.5,.5],[.5,-.5,-.5],[-.5,-.5,-.5]],[[0,0,1],[.5,-.5,.5],[-.5,-.5,.5],[-.5,.5,.5],[.5,.5,.5]],[[0,0,-1],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]]];for(const f of faces){let st=p.length/3;for(let k=1;k<=4;k++){p.push(...f[k]);n.push(...f[0]);uv.push(k===1||k===4?0:1,k<3?0:1)}ix.push(st,st+1,st+2,st,st+2,st+3)}return {p,n,uv,ix}}
function sphere(seg=14,rings=10){const p=[],n=[],uv=[],ix=[];for(let i=0;i<=rings;i++){let v=i/rings,theta=v*Math.PI;for(let j=0;j<=seg;j++){let u=j/seg,phi=u*2*Math.PI,x=Math.sin(theta)*Math.cos(phi),y=Math.cos(theta),z=Math.sin(theta)*Math.sin(phi);p.push(x*.5,y*.5,z*.5);n.push(x,y,z);uv.push(u,v);}}for(let i=0;i<rings;i++)for(let j=0;j<seg;j++){let a=i*(seg+1)+j,b=a+seg+1;ix.push(a,b,a+1,b,b+1,a+1)}return {p,n,uv,ix}}
function cylinder(seg=24){const p=[],n=[],uv=[],ix=[];for(let i=0;i<=seg;i++){let u=i/seg,a=u*2*Math.PI,x=Math.cos(a),z=Math.sin(a);for(let y of [-.5,.5]){p.push(x*.5,y,z*.5);n.push(x,0,z);uv.push(u,y+.5)}}for(let i=0;i<seg;i++){let j=i*2;ix.push(j,j+1,j+2,j+1,j+3,j+2)}for(let side of [-.5,.5]){let center=p.length/3;p.push(0,side,0);n.push(0,side>0?1:-1,0);uv.push(.5,.5);for(let i=0;i<=seg;i++){let a=i*2*Math.PI/seg;p.push(Math.cos(a)*.5,side,Math.sin(a)*.5);n.push(0,side>0?1:-1,0);uv.push(.5+.5*Math.cos(a),.5+.5*Math.sin(a))}for(let i=0;i<seg;i++){if(side>0)ix.push(center,center+i+1,center+i+2);else ix.push(center,center+i+2,center+i+1)}}return {p,n,uv,ix}}
function roundbox(segments=6,radius=.12){const p=[],n=[],uv=[],ix=[];const planes=[{a:0,b:1,c:2,sign:1},{a:0,b:1,c:2,sign:-1},{a:1,b:0,c:2,sign:1},{a:1,b:0,c:2,sign:-1},{a:2,b:0,c:1,sign:1},{a:2,b:0,c:1,sign:-1}];for(let f of planes){let st=p.length/3;for(let i=0;i<=segments;i++)for(let j=0;j<=segments;j++){let q=[0,0,0];q[f.a]=.5*f.sign;q[f.b]=i/segments-.5;q[f.c]=j/segments-.5;let inner=q.map(v=>Math.max(-.5+radius,Math.min(.5-radius,v))),normal=vec.norm(vec.sub(q,inner));let out=vec.add(inner,vec.mul(normal,radius));p.push(...out);n.push(...normal);uv.push(j/segments,i/segments)}for(let i=0;i<segments;i++)for(let j=0;j<segments;j++){let a=st+i*(segments+1)+j,b=a+segments+1;let d=f.sign>0; if((f.a===0||f.a===2)===d)ix.push(a,a+1,b,a+1,b+1,b);else ix.push(a,b,a+1,a+1,b,b+1)}}return {p,n,uv,ix}}
function compile(gl,vs,fs){let p=gl.createProgram();for(let [type,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){let sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!this.gl)throw Error('Este dispositivo no ofrece WebGL2');let g=this.gl;this.program=compile(g,vs,fs);this.depthProgram=compile(g,depthVS,depthFS);this.geometries={box:cuboid(),round:roundbox(),sphere:sphere(),cylinder:cylinder()};this.meshes={};for(let [key,v] of Object.entries(this.geometries)){let vao=g.createVertexArray();g.bindVertexArray(vao);for(let [idx,data,sz] of [[0,v.p,3],[1,v.n,3],[2,v.uv,2]]){let buf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array(data),g.STATIC_DRAW);g.enableVertexAttribArray(idx);g.vertexAttribPointer(idx,sz,g.FLOAT,false,0,0)}let eb=g.createBuffer();g.bindBuffer(g.ELEMENT_ARRAY_BUFFER,eb);g.bufferData(g.ELEMENT_ARRAY_BUFFER,new Uint16Array(v.ix),g.STATIC_DRAW);this.meshes[key]={vao,count:v.ix.length}}g.bindVertexArray(null);
 this.shadowFbo=g.createFramebuffer();this.shadowTexture=g.createTexture();g.bindTexture(g.TEXTURE_2D,this.shadowTexture);g.texImage2D(g.TEXTURE_2D,0,g.DEPTH_COMPONENT24,768,768,0,g.DEPTH_COMPONENT,g.UNSIGNED_INT,null);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_COMPARE_MODE,g.COMPARE_REF_TO_TEXTURE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_COMPARE_FUNC,g.LEQUAL);g.bindFramebuffer(g.FRAMEBUFFER,this.shadowFbo);g.framebufferTexture2D(g.FRAMEBUFFER,g.DEPTH_ATTACHMENT,g.TEXTURE_2D,this.shadowTexture,0);g.drawBuffers([g.NONE]);g.readBuffer(g.NONE);g.bindFramebuffer(g.FRAMEBUFFER,null);this.lightDirection=vec.norm([.43,.87,-.31]);const lightEye=vec.mul(this.lightDirection,21);this.lightMatrix=mat.multiply(mat.ortho(-19,19,-19,19,.1,70),mat.lookAt(lightEye,[0,0,0]));this.u={};for(let name of ['model','view','proj','lightMatrix','cameraPosition','baseColor','lightDirection','lightColor','roughness','metalness','opacity','dayMix','finish','shadowTexture'])this.u[name]=g.getUniformLocation(this.program,name);this.ud={model:g.getUniformLocation(this.depthProgram,'model'),lightMatrix:g.getUniformLocation(this.depthProgram,'lightMatrix')};g.enable(g.DEPTH_TEST);g.depthFunc(g.LEQUAL);g.disable(g.CULL_FACE);this.frame=0;}
 resize(){let d=window.__CASA_QA_MODE__?.5:Math.min(window.devicePixelRatio||1,1.45),w=Math.max(1,Math.floor(this.canvas.clientWidth*d)),h=Math.max(1,Math.floor(this.canvas.clientHeight*d));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}return [w,h]}
 draw(objects,camera,dayMix=1,hidden=new Set()){let g=this.gl,[w,h]=this.resize(),v=mat.lookAt(camera.pos,camera.target),p=mat.perspective(Math.PI/3,w/h,.07,90);if(!Number.isFinite(p[0]))return;let visible=objects.filter(o=>o.visible!==false),lit=visible.filter(o=>!hidden.has(o.id));
 if(!this.shadowReady){g.bindFramebuffer(g.FRAMEBUFFER,this.shadowFbo);g.viewport(0,0,768,768);g.clear(g.DEPTH_BUFFER_BIT);g.useProgram(this.depthProgram);g.uniformMatrix4fv(this.ud.lightMatrix,false,this.lightMatrix);for(let o of visible){if(o.opacity!=null&&o.opacity<.95)continue;let m=this.meshes[o.geometry||'box'];g.bindVertexArray(m.vao);g.uniformMatrix4fv(this.ud.model,false,o.model);g.drawElements(g.TRIANGLES,m.count,g.UNSIGNED_SHORT,0)}
 this.shadowReady=true;}g.bindFramebuffer(g.FRAMEBUFFER,null);g.viewport(0,0,w,h);g.clearColor(...(dayMix>.5?[.79,.82,.77,1]:[.085,.11,.16,1]));g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(this.program);g.uniformMatrix4fv(this.u.view,false,v);g.uniformMatrix4fv(this.u.proj,false,p);g.uniformMatrix4fv(this.u.lightMatrix,false,this.lightMatrix);g.uniform3fv(this.u.cameraPosition,camera.pos);g.uniform3fv(this.u.lightDirection,this.lightDirection);g.uniform3fv(this.u.lightColor,[1,.93,.82]);g.uniform1f(this.u.dayMix,dayMix);g.activeTexture(g.TEXTURE0);g.bindTexture(g.TEXTURE_2D,this.shadowTexture);g.uniform1i(this.u.shadowTexture,0);
 const draw=o=>{const m=this.meshes[o.geometry||'box'];g.bindVertexArray(m.vao);g.uniformMatrix4fv(this.u.model,false,o.model);g.uniform3fv(this.u.baseColor,o.color);g.uniform1f(this.u.roughness,o.roughness??.76);g.uniform1f(this.u.metalness,o.metalness??0);g.uniform1f(this.u.opacity,o.opacity??1);g.uniform1i(this.u.finish,o.finish??0);g.drawElements(g.TRIANGLES,m.count,g.UNSIGNED_SHORT,0)};
 for(let o of lit.filter(o=>!o.opacity||o.opacity>=.98))draw(o);
 g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);g.depthMask(false);for(let o of lit.filter(o=>o.opacity&&o.opacity<.98))draw(o);g.depthMask(true);g.disable(g.BLEND);g.bindVertexArray(null);this.frame++;return {width:w,height:h,frame:this.frame,glError:g.getError()}}
}
