/* ================= v9 · LUNETA REAL DA BARRETT (lente renderizada) =================
   Igual às lunetas de jogos grandes: a ocular sobe do canto da arma até o olho, a lente mostra a imagem
   ampliada de verdade (uma segunda câmera), e fora dela o mundo continua visível, desfocado e escuro.
   Lente: distorção de barril nas bordas, franja cromática, vinheta, sombra do olho (a meia-lua escura que
   aparece quando o olho sai do centro: ao girar rápido, andar, respirar e no coice), reflexo do vidro.
   Retículo duplex com mil-dots e ponto vermelho iluminado, desenhado dentro da lente.
   Carcaça: anel grosso de metal com chanfro iluminado e o corpo da luneta indo para o canto ao abrir. */
const BSC={e:0,ev:0,on:false,sx:0,sy:0,vx:0,vy:0,ly:0,lp:0,t:0,mat:null,rti:null,rto:null,w:0,h:0,fail:false};
v9Css(`#bscope.gl .tube,#bscope.gl .ret{display:none!important}
#bscope.gl .glass{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:none!important;box-shadow:none!important}
#bscope .rng{position:absolute;right:20%;bottom:16%;font:600 11px/1 var(--f-type,monospace);letter-spacing:.14em;color:#ff4a2a;text-shadow:0 0 5px rgba(255,60,30,.8);opacity:var(--o)}
#bscope .zl{position:absolute;left:20%;bottom:16%;font:600 10px/1 var(--f-type,monospace);letter-spacing:.2em;color:rgba(230,230,220,.55);opacity:var(--o)}`);
{ const g=document.querySelector('#bscope .glass'); if(g){ const a=document.createElement('div'); a.className='rng'; g.appendChild(a); const b=document.createElement('div'); b.className='zl'; g.appendChild(b); } }
const BSC_FS=`uniform sampler2D tIn,tOut; uniform vec2 uRes,uC,uS; uniform float uR,uO,uK,uT,uSq,uPx;
float hsh(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
float ln(float d,float w){ return 1.-smoothstep(w-uPx,w+uPx,d); }
vec3 sIn(vec2 dd,float bar,float ca){ vec2 c=uRes*.5; return vec3(texture2D(tIn,(c+dd*bar*(1.+ca))/uRes).r,texture2D(tIn,(c+dd*bar)/uRes).g,texture2D(tIn,(c+dd*bar*(1.-ca))/uRes).b); }
void main(){
  vec2 p=gl_FragCoord.xy, dd=p-uC, d=dd; d.x/=uSq; float r=length(d)/uR;
  // mundo fora da luneta: desfocado e mais escuro conforme o olho encosta
  vec2 uo=p/uRes, px=2.5/uRes; vec3 o=texture2D(tOut,uo).rgb*.4+(texture2D(tOut,uo+vec2(px.x,0.)).rgb+texture2D(tOut,uo-vec2(px.x,0.)).rgb+texture2D(tOut,uo+vec2(0.,px.y)).rgb+texture2D(tOut,uo-vec2(0.,px.y)).rgb)*.15;
  o*=mix(1.,.32,uO);
  vec3 col=o;
  // corpo da luneta (tubo indo para o canto de baixo/direita) enquanto ela sobe
  vec2 ax=normalize(vec2(.45,-1.)); float t=dot(dd,ax); float pr=length(dd-ax*t);
  float bw=uR*1.22*(1.+max(t,0.)/uR*.18);
  if(t>0.&&pr<bw){ float s=pr/bw; vec3 bc=vec3(.035,.037,.04)+vec3(.05)*smoothstep(.55,.95,s)*(1.-smoothstep(.95,1.,s))+vec3(.03)*pow(1.-s,3.); col=mix(col,bc,(1.-smoothstep(.97,1.,s))*clamp((1.-uO)*1.6,0.,1.)); }
  // carcaça (anel grosso), chanfro de fora iluminado de cima-esquerda e filete fino na borda do vidro
  float RO=1.3;
  if(r<RO){ vec2 nd=normalize(d+1e-4); float lit=dot(nd,normalize(vec2(-.55,.85)))*.5+.5;
    vec3 rc=vec3(.018,.019,.021)+vec3(.02)*lit;
    rc+=vec3(.16,.16,.15)*smoothstep(1.2,1.27,r)*(1.-smoothstep(1.27,1.3,r))*(.35+lit*.9);
    rc+=vec3(.07)*smoothstep(1.,1.015,r)*(1.-smoothstep(1.015,1.05,r))*(.4+lit);
    col=mix(col,rc,smoothstep(RO,RO-1.5*uPx,r)); }
  // lente
  if(r<1.){ vec2 q=d/uR; float rr=r;
    float bar=1.+.11*rr*rr, ca=(.0035+(1.-uO)*.022)*rr*rr*rr;
    vec3 c=sIn(dd,bar,ca);
    float bl=(1.-uO)*5.+smoothstep(.8,1.,rr)*2.5+uK*3.;
    if(bl>.3){ vec3 a=vec3(0.); for(int i=0;i<6;i++){ float an=float(i)*1.0472+uT*3.; a+=sIn(dd+vec2(cos(an),sin(an))*bl,bar,ca); } c=c*.4+a*.1; }
    c=(c-.5)*1.06+.5; c*=vec3(.97,1.,1.03);
    c*=1.-.5*smoothstep(.5,1.,rr);
    c+=vec3(.05,.06,.07)*smoothstep(.55,0.,length(q-vec2(-.38,.42)))*uO;
    c+=(hsh(floor(p*.5)+floor(uT*24.))-.5)*.018;
    // retículo duplex
    float aq=uO*uO, pxu=uPx; vec2 aqq=abs(q);
    float wT=.011, wt=max(.0016,pxu*.7);
    float ret=0.;
    ret=max(ret,ln(aqq.y,wT)*step(.42,aqq.x)); ret=max(ret,ln(aqq.x,wT)*step(.42,aqq.y));
    ret=max(ret,ln(aqq.y,wt)*step(aqq.x,.42)); ret=max(ret,ln(aqq.x,wt)*step(aqq.y,.42));
    float sp=.06; float kx=abs(fract(q.x/sp+.5)-.5)*sp, ky=abs(fract(q.y/sp+.5)-.5)*sp;
    float big=step(.5,fract(floor(q.x/sp+.5)*.5)), bigy=step(.5,fract(floor(q.y/sp+.5)*.5));
    ret=max(ret,ln(kx,wt*1.2)*ln(aqq.y,.011+.008*big)*step(aqq.x,.4)*step(.02,aqq.x));
    ret=max(ret,ln(ky,wt*1.2)*ln(aqq.x,.011+.012*bigy)*step(aqq.y,.4)*step(.02,aqq.y)*step(q.y,0.));
    ret=max(ret,ln(ky,wt*1.2)*ln(aqq.x,.009)*step(aqq.y,.4)*step(.02,aqq.y)*step(0.,q.y));
    c=mix(c,vec3(.01),ret*aq);
    float cd=length(q); c=mix(c,vec3(1.,.12,.06),(1.-smoothstep(.0045,.0045+pxu*1.5,cd))*aq); c+=vec3(1.,.15,.05)*exp(-cd*cd/.0004)*.35*aq;
    // sombra do olho (meia-lua quando o olho sai do eixo)
    float sh=smoothstep(.78,1.02,length(q-uS)); c*=1.-sh*.97;
    c=mix(c,vec3(.0),smoothstep(1.-2./uR,1.,rr));
    col=c; }
  gl_FragColor=vec4(clamp(col,0.,1.),1.); }`;
function bscEnsure(){ const sz=renderer.getDrawingBufferSize(new THREE.Vector2()); const w=sz.x|0, h=sz.y|0;
  if(!BSC.mat){ BSC.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); BSC.scn=new THREE.Scene();
    BSC.mat=new THREE.ShaderMaterial({uniforms:{tIn:{value:null},tOut:{value:null},uRes:{value:new THREE.Vector2()},uC:{value:new THREE.Vector2()},uS:{value:new THREE.Vector2()},uR:{value:100},uO:{value:0},uK:{value:0},uT:{value:0},uSq:{value:1},uPx:{value:1}},
      depthTest:false,depthWrite:false,vertexShader:'void main(){ gl_Position=vec4(position.xy,0.,1.); }',fragmentShader:BSC_FS});
    const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),BSC.mat); q.frustumCulled=false; BSC.scn.add(q); }
  if(BSC.rti&&BSC.w===w&&BSC.h===h) return; BSC.w=w; BSC.h=h; if(BSC.rti) BSC.rti.dispose(); if(BSC.rto) BSC.rto.dispose();
  const o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};
  BSC.rti=new THREE.WebGLRenderTarget(w,h,Object.assign({depthBuffer:true},o)); const k=CFG.potato?4:2; BSC.rto=new THREE.WebGLRenderTarget(Math.max(2,w/k|0),Math.max(2,h/k|0),Object.assign({depthBuffer:true},o));
  try{ BSC.rti.texture.encoding=renderer.outputEncoding; BSC.rto.texture.encoding=renderer.outputEncoding; }catch(e){} }
function bscRender(dt){ bscEnsure(); const f0=camera.fov, U=BSC.mat.uniforms, w=BSC.w, h=BSC.h;
  const fOut=CHEAT.fov-10*Math.min(1,P.ads), fIn=CHEAT.fov/(Wp.scopeLv===2?6.5:2.6);
  try{
    camera.fov=fOut; camera.updateProjectionMatrix(); renderer.setRenderTarget(BSC.rto); renderer.clear(); renderer.render(scene,camera);
    camera.fov=fIn; camera.updateProjectionMatrix(); renderer.setRenderTarget(BSC.rti); renderer.clear(); renderer.render(scene,camera);
  } finally{ camera.fov=f0; camera.updateProjectionMatrix(); renderer.setRenderTarget(null); }
  // posição da ocular: sobe do canto de baixo/direita até o centro, crescendo; o coice joga para cima
  const e=BSC.e, m=Math.min(w,h), ez=e*e*(3-2*e);
  const Rf=m*0.43, R0=m*0.075, R=R0+(Rf-R0)*Math.pow(ez,1.35);
  const cx=w*(0.5+0.2*(1-ez)), cy=h*(0.5-0.34*(1-ez))+HV.kick*h*0.05;
  U.tIn.value=BSC.rti.texture; U.tOut.value=BSC.rto.texture; U.uRes.value.set(w,h); U.uC.value.set(cx,cy); U.uR.value=R; U.uO.value=ez; U.uK.value=HV.kick; U.uT.value=BSC.t; U.uSq.value=0.82+0.18*ez; U.uPx.value=1/R;
  U.uS.value.set(BSC.sx,BSC.sy);
  renderer.render(BSC.scn,BSC.cam); }
{ const po=v9PostOn; v9PostOn=function(){ return (BSC.on&&!BSC.fail)||po.apply(this,arguments); };
  const rp=v9RenderPost; v9RenderPost=function(dt){ if(BSC.on&&!BSC.fail){ try{ bscRender(dt); return; }catch(e){ BSC.fail=true; console.warn('[Bunker] luneta renderizada desligada',e); try{ renderer.setRenderTarget(null); }catch(e2){} } } if(po.call(this)) return rp.apply(this,arguments); renderer.render(scene,camera); }; }
v9On('frame',dt=>{ const s=curSlot(), isB=!!(s&&s.id==='ptrs'), ok=isB&&(G.state==='playing'||G.state==='paused')&&!P.down&&!BSC.fail;
  dt=Math.min(dt||0.016,0.05); BSC.t+=dt;
  const tgt=!ok?0:Wp.scoped?1:Math.max(0,Math.min(1,(P.ads-0.1)/0.86))*0.93+0.07*V9B.open*(P.ads>0.5?1:0);
  // mola: a luneta chega com um leve assentamento, sem estalo
  BSC.ev+=((tgt-BSC.e)*170-BSC.ev*24)*dt; BSC.e=Math.max(0,Math.min(1.02,BSC.e+BSC.ev*dt)); if(!ok&&BSC.e<0.02){ BSC.e=0; BSC.ev=0; }
  BSC.on=ok&&BSC.e>0.015;
  const el=document.getElementById('bscope'); if(el) el.classList.toggle('gl',BSC.on);
  if(BSC.on) HV.coverVm=true;
  // sombra do olho: atraso do olho ao girar, passada, respiração, coice e o olho ainda chegando
  const dy=angLerp(BSC.ly,P.yaw,1)-BSC.ly, dp=P.pitch-BSC.lp; BSC.ly=P.yaw; BSC.lp=P.pitch;
  const sp=Math.hypot(P.vx||0,P.vz||0), mv=Math.min(1,sp/4);
  let tx=-dy/dt*0.045+Math.sin(BSC.t*7.5)*0.05*mv+Math.sin(BSC.t*1.3)*0.012, ty=dp/dt*0.045+Math.abs(Math.cos(BSC.t*7.5))*0.05*mv+Math.sin(BSC.t*0.9)*0.012-HV.kick*0.32;
  tx+=(1-Math.min(1,BSC.e))*0.22; ty-=(1-Math.min(1,BSC.e))*0.16;
  tx=Math.max(-0.4,Math.min(0.4,tx)); ty=Math.max(-0.4,Math.min(0.4,ty));
  BSC.vx+=((tx-BSC.sx)*90-BSC.vx*13)*dt; BSC.vy+=((ty-BSC.sy)*90-BSC.vy*13)*dt; BSC.sx+=BSC.vx*dt; BSC.sy+=BSC.vy*dt;
  // telêmetro (distância até o que está no centro) e nível de zoom
  if(BSC.on&&el&&(BSC.rT=(BSC.rT||0)-dt)<=0){ BSC.rT=0.15; try{ const o=camera.position, d=new THREE.Vector3(); camera.getWorldDirection(d); const t=rayWall(o,d,600);
      const rg=el.querySelector('.rng'); if(rg) rg.textContent=(t>=599?'---':Math.round(t))+' m'; const zl=el.querySelector('.zl'); if(zl) zl.textContent=(Wp.scopeLv===2?'6.5':'2.6')+'×'; }catch(e){} }
});
