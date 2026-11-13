/* ================= v9 · LUNETA REAL DA BARRETT =================
   A arma sobe de verdade até o olho: a ocular da luneta 3D vem para o centro e encosta no olho, e a imagem
   ampliada aparece DENTRO da ocular (uma segunda câmera desenhada só onde está o vidro, como nos jogos grandes).
   Ao soltar a mira o caminho é o inverso, sem corte. Faca, troca de arma, beber/upar ou cair cancelam na hora.
   · lente: distorção nas bordas, franja de cor (forte enquanto chega), vinheta, reflexo, sombra do olho
   · retículo duplex com mil-dots e ponto vermelho, preso à luneta (inclina junto se a arma inclinar)
   · coice: a luneta pula para cima e vem contra o olho; respiração leve
   · o resto da tela continua sendo o desenho normal do jogo (mesma qualidade), só escurece perto do fim */
const BSC={q:0,qv:0,w:0,cut:false,lens:false,e:0,sx:0,sy:0,vx:0,vy:0,ly:0,lp:0,t:0,mat:null,rti:null,w0:0,h0:0,fail:false,fovOut:null,rawQ:null,rawSet:false,ks:1};
const BSC_Y=0.104, BSC_HZ=0.2125, BSC_HR=0.021;
v9Css(`#bscope .tube,#bscope .ret{display:none!important}
#bscope .glass{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:none!important;box-shadow:none!important;transform:none!important}
#bscope .rng{position:absolute;right:19%;bottom:15%;font:600 11px/1 var(--f-type,monospace);letter-spacing:.14em;color:#ff4a2a;text-shadow:0 0 5px rgba(255,60,30,.8);opacity:var(--o)}
#bscope .zl{position:absolute;left:19%;bottom:15%;font:600 10px/1 var(--f-type,monospace);letter-spacing:.2em;color:rgba(230,230,220,.55);opacity:var(--o)}`);
{ const g=document.querySelector('#bscope .glass'); if(g){ const a=document.createElement('div'); a.className='rng'; g.appendChild(a); const b=document.createElement('div'); b.className='zl'; g.appendChild(b); } }
const BSC_FS=`uniform sampler2D tIn; uniform vec2 uRes,uC,uS; uniform vec4 uMi; uniform float uRg,uRf,uO,uK,uT,uDim,uKs,uMode;
float hsh(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
float ln(float d,float w,float px){ return 1.-smoothstep(w-px,w+px,d); }
vec3 sIn(vec2 u,float ca){ vec2 c=uRes*.5; vec2 k=vec2(uKs)/uRes; return vec3(texture2D(tIn,(c+u*(1.+ca))*k).r,texture2D(tIn,(c+u)*k).g,texture2D(tIn,(c+u*(1.-ca))*k).b); }
void main(){
  vec2 p=gl_FragCoord.xy, dd=p-uC; vec2 U=vec2(uMi.x*dd.x+uMi.y*dd.y,uMi.z*dd.x+uMi.w*dd.y); float r=length(U);
  float px=1./max(uRg,1.);
  if(uMode<.5){ gl_FragColor=vec4(0.,0.,0.,uDim*smoothstep(1.,1.08,r)); return; }   // passo 1: escurece o mundo em volta
  if(r>1.){ discard; }
  // imagem ampliada: o centro da ocular mostra sempre o ponto de mira; o tamanho acompanha a ocular
  vec2 Ui=dd/uRg; float rr=min(length(Ui),1.3); float bar=1.+.11*rr*rr; float ca=(.003+(1.-uO)*.03)*rr*rr*rr;
  vec2 u=Ui*uRf*bar;
  vec3 c=sIn(u,ca);
  float bl=(1.-uO)*6.+smoothstep(.82,1.,r)*2.+uK*3.5;
  if(bl>.35){ vec3 a=vec3(0.); for(int i=0;i<6;i++){ float an=float(i)*1.0472+uT*2.7; a+=sIn(u+vec2(cos(an),sin(an))*bl,ca); } c=c*.4+a*.1; }
  c=(c-.5)*1.06+.5; c*=vec3(.97,1.,1.03);
  c*=1.-.48*smoothstep(.52,1.,r);
  c+=vec3(.05,.06,.07)*smoothstep(.55,0.,length(U-vec2(-.38,.42)))*(.4+uO*.6);
  c+=(hsh(floor(p*.5)+floor(uT*24.))-.5)*.016;
  // retículo duplex (preso à luneta)
  float aq=smoothstep(.15,.9,uO); vec2 a2=abs(U);
  float wT=.011, wt=max(.0017,px*.75), ret=0.;
  ret=max(ret,ln(a2.y,wT,px)*step(.42,a2.x)); ret=max(ret,ln(a2.x,wT,px)*step(.42,a2.y));
  ret=max(ret,ln(a2.y,wt,px)*step(a2.x,.42)); ret=max(ret,ln(a2.x,wt,px)*step(a2.y,.42));
  float sp=.06, kx=abs(fract(U.x/sp+.5)-.5)*sp, ky=abs(fract(U.y/sp+.5)-.5)*sp;
  float bx=step(.5,fract(floor(U.x/sp+.5)*.5)), by=step(.5,fract(floor(U.y/sp+.5)*.5));
  ret=max(ret,ln(kx,wt*1.2,px)*ln(a2.y,.011+.008*bx,px)*step(a2.x,.4)*step(.02,a2.x));
  ret=max(ret,ln(ky,wt*1.2,px)*ln(a2.x,.011+.012*by,px)*step(a2.y,.4)*step(.02,a2.y)*step(U.y,0.));
  ret=max(ret,ln(ky,wt*1.2,px)*ln(a2.x,.009,px)*step(a2.y,.4)*step(.02,a2.y)*step(0.,U.y));
  c=mix(c,vec3(.01),ret*aq);
  float cd=length(U); c=mix(c,vec3(1.,.12,.06),(1.-smoothstep(.0045,.0045+px*1.5,cd))*aq); c+=vec3(1.,.15,.05)*exp(-cd*cd/.0004)*.35*aq;
  // sombra do olho e parede interna do tubo
  float sh=smoothstep(.76,1.02,length(U-uS)); c*=1.-sh*.97;
  c*=1.-smoothstep(.9,1.,r)*.85;
  gl_FragColor=vec4(clamp(c,0.,1.),1.-smoothstep(1.-px*1.5,1.,r)); }`;
function bscEnsure(){ const sz=renderer.getDrawingBufferSize(new THREE.Vector2()); const w=sz.x|0, h=sz.y|0;
  if(!BSC.mat){ BSC.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); BSC.scn=new THREE.Scene();
    BSC.mat=new THREE.ShaderMaterial({uniforms:{tIn:{value:null},uRes:{value:new THREE.Vector2()},uC:{value:new THREE.Vector2()},uS:{value:new THREE.Vector2()},uMi:{value:new THREE.Vector4(1,0,0,1)},uRg:{value:100},uRf:{value:100},uO:{value:0},uK:{value:0},uT:{value:0},uDim:{value:0},uKs:{value:1},uMode:{value:0}},
      depthTest:false,depthWrite:false,transparent:true,vertexShader:'void main(){ gl_Position=vec4(position.xy,0.,1.); }',fragmentShader:BSC_FS});
    const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),BSC.mat); q.frustumCulled=false; BSC.scn.add(q); }
  if(BSC.rti&&BSC.w0===w&&BSC.h0===h) return; BSC.w0=w; BSC.h0=h; if(BSC.rti) BSC.rti.dispose();
  const o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:true};
  let rt=null; try{ if(THREE.WebGLMultisampleRenderTarget&&renderer.capabilities.isWebGL2&&!CFG.potato){ rt=new THREE.WebGLMultisampleRenderTarget(w,h,o); rt.samples=4; } }catch(e){ rt=null; }
  BSC.rti=rt||new THREE.WebGLRenderTarget(w,h,o); try{ BSC.rti.texture.encoding=renderer.outputEncoding; }catch(e){} }
/* ---- luneta 3D: furo na ocular (escreve profundidade, não cor) para a imagem ampliada aparecer ali ---- */
function bscParts(){ const g=gunModel&&gunModel.userData.scope3d; if(!g) return null;
  if(!g.userData.bsc){ const hole=new THREE.Mesh(new THREE.CircleGeometry(BSC_HR,40),new THREE.MeshBasicMaterial({colorWrite:false}));
    hole.position.set(0,BSC_Y,BSC_HZ); hole.renderOrder=-10; hole.frustumCulled=false; hole.visible=false; g.add(hole);
    const glass=g.children.find(m=>m.isMesh&&m.geometry&&m.geometry.parameters&&m.geometry.parameters.radius===0.021&&m.position.z>0.2);
    g.userData.bsc={hole,glass}; }
  return Object.assign({g},g.userData.bsc); }
/* ---- estado por quadro ---- */
function bscCancel(){ return !!(Wp.knifeOut||Wp.knifeT>0||Wp.swapT>0||Wp.drinkT>0||Wp.upT>0||P.down||(typeof DOGQ!=='undefined'&&DOGQ.on)); }
function bscActiveGun(){ const s=curSlot(); return !!(s&&s.id==='ptrs'&&gunModel&&gunModel.userData.scope3d&&(G.state==='playing'||G.state==='paused')); }
v9On('frame',dt=>{ if(BSC.vmHid){ vmScene.visible=true; BSC.vmHid=false; } dt=Math.min(dt||0.016,0.05); BSC.t+=dt;
  const isB=bscActiveGun(), cancel=!isB||bscCancel();
  // 48_heavy escondia a arma e a luneta 3D ao mirar: agora a arma vai até o olho
  HV.coverVm=false; const g3=gunModel&&gunModel.userData.scope3d; if(g3) g3.visible=true;
  // faca/troca/etc.: corta na hora; depois a correção volta suave (sem tranco se o jogador continuar mirando)
  if(cancel){ BSC.q=0; BSC.qv=0; BSC.wc=0; } else BSC.wc=Math.min(1,(BSC.wc==null?1:BSC.wc)+dt/0.28);
  const intent=!cancel&&IN.ads&&!Wp.reloading&&V9B.cyc<=0&&P.ads>0.5;
  if(!cancel){
    if(Wp.scoped){ BSC.q=1; BSC.qv=0; }
    else if(intent){ const tq=V9B.open*V9B.open*(3-2*V9B.open); BSC.qv+=((tq-BSC.q)*260-BSC.qv*30)*dt; BSC.q=Math.max(0,Math.min(1,BSC.q+BSC.qv*dt)); }
    else { BSC.q=Math.max(0,BSC.q-dt/0.18); BSC.qv=0; } }
  const a=Math.max(0,Math.min(1,(P.ads-0.08)/0.85)), wc=BSC.wc==null?1:BSC.wc; BSC.w=a*a*(3-2*a)*wc*wc*(3-2*wc);
  // sombra do olho: atraso do olho ao girar, passada, respiração e coice
  const dy=angLerp(BSC.ly,P.yaw,1)-BSC.ly, dp=P.pitch-BSC.lp; BSC.ly=P.yaw; BSC.lp=P.pitch;
  const mv=Math.min(1,Math.hypot(P.vx||0,P.vz||0)/4);
  let tx=-dy/dt*0.04+Math.sin(BSC.t*7.5)*0.05*mv+Math.sin(BSC.t*1.3)*0.01, ty=dp/dt*0.04+Math.abs(Math.cos(BSC.t*7.5))*0.05*mv+Math.sin(BSC.t*0.9)*0.01-HV.kick*0.28;
  tx+=(1-BSC.q)*0.1; ty-=(1-BSC.q)*0.07;
  tx=Math.max(-0.4,Math.min(0.4,tx)); ty=Math.max(-0.4,Math.min(0.4,ty));
  BSC.vx+=((tx-BSC.sx)*90-BSC.vx*13)*dt; BSC.vy+=((ty-BSC.sy)*90-BSC.vy*13)*dt; BSC.sx+=BSC.vx*dt; BSC.sy+=BSC.vy*dt;
  if(!isB) BSC.lens=false;
});
/* ---- pose: leva a ocular até o eixo do olho (distância diminui com a abertura), sem inclinação, com coice ---- */
const _bq=new THREE.Quaternion(), _bq2=new THREE.Quaternion(), _bv=new THREE.Vector3(), _bv2=new THREE.Vector3(), _bI=new THREE.Quaternion(), _bx=new THREE.Quaternion();
// raio real do vidro no mundo da arma (o modelo pode estar em escala)
function bscRW(){ const P3=bscParts(); if(!P3) return BSC_HR; P3.g.updateMatrixWorld(true); const a=P3.g.localToWorld(new THREE.Vector3(0,BSC_Y,BSC_HZ)), b=P3.g.localToWorld(new THREE.Vector3(BSC_HR,BSC_Y,BSC_HZ)); return a.distanceTo(b)||BSC_HR; }
function bscZ(){ const sz=renderer.getDrawingBufferSize(new THREE.Vector2()); const h=sz.y, m=Math.min(sz.x,sz.y); const Rf=m*0.43;
  return {zf:bscRW()*(h/2)/(Rf*Math.tan(vmCam.fov*Math.PI/360)), Rf}; }
function bscPose(){ if(BSC.w<=0.0005) return; const P3=bscParts(); if(!P3) return;
  vmRoot.updateMatrixWorld(true); const g=P3.g;
  g.getWorldQuaternion(_bq); _bv.set(0,BSC_Y,BSC_HZ); g.localToWorld(_bv);   // _bv = ocular agora (espaço da câmera da arma)
  const w=BSC.w, k=HV.kick;
  // gira em volta da ocular: alinha o eixo da luneta com o olho (tira a inclinação), mais o salto do coice
  _bq2.copy(_bq).invert(); _bx.copy(_bI).slerp(_bq2,w);
  if(k>0){ _bq2.setFromAxisAngle(_bv2.set(1,0,0),k*k*0.11*w); _bx.premultiply(_bq2); }
  vmRoot.quaternion.premultiply(_bx); vmRoot.position.sub(_bv).applyQuaternion(_bx).add(_bv);
  // leva a ocular ao eixo: na mira fica a um palmo, na abertura encosta no olho; o coice traz contra o olho
  const Z=bscZ(); const qe=BSC.q*BSC.q*(3-2*BSC.q); const zt=Math.max(Z.zf*0.8,(Z.zf*2.1+(Z.zf-Z.zf*2.1)*qe)-k*0.012);
  const bx=Math.sin(BSC.t*0.9)*0.0004*qe, by=Math.sin(BSC.t*1.3)*0.00035*qe+k*0.004;
  vmRoot.position.x+=(bx-_bv.x)*w; vmRoot.position.y+=(by-_bv.y)*w; vmRoot.position.z+=(-zt-_bv.z)*w; }
V9VM.push(()=>{ if(!bscActiveGun()) return; BSC.rawQ=(BSC.rawQ||new THREE.Quaternion()).copy(vmRoot.quaternion); BSC.rawSet=true; bscPose(); });
/* ---- projeção da ocular na tela (elipse) ---- */
const _bp=new THREE.Vector3();
function bscProj(v,w,h){ _bp.copy(v).project(vmCam); return [(_bp.x*0.5+0.5)*w,(_bp.y*0.5+0.5)*h,_bp.z]; }
function bscEllipse(w,h){ const P3=bscParts(); if(!P3) return null; const g=P3.g; vmScene.updateMatrixWorld(true);
  const c=g.localToWorld(new THREE.Vector3(0,BSC_Y,BSC_HZ)), ex=g.localToWorld(new THREE.Vector3(BSC_HR,BSC_Y,BSC_HZ)), ey=g.localToWorld(new THREE.Vector3(0,BSC_Y+BSC_HR,BSC_HZ));
  const nz=g.localToWorld(new THREE.Vector3(0,BSC_Y,BSC_HZ+0.01)).sub(c).normalize(); const toCam=c.clone().negate().normalize();
  if(c.z>-0.012||nz.dot(toCam)<0.25) return null;
  const C=bscProj(c,w,h), A=bscProj(ex,w,h), B=bscProj(ey,w,h); const a=[A[0]-C[0],A[1]-C[1]], b=[B[0]-C[0],B[1]-C[1]];
  const det=a[0]*b[1]-b[0]*a[1]; if(Math.abs(det)<9) return null;
  return {C,a,b,det,Rg:Math.sqrt(Math.abs(det))}; }
/* ---- desenho ---- */
function bscRender(dt,mainFn){ bscEnsure(); const w=BSC.w0, h=BSC.h0, U=BSC.mat.uniforms, Z=bscZ();
  const scoped=!!(Wp.scoped&&(G.state==='playing'||G.state==='paused')&&!P.down);
  if(scoped&&BSC.rawSet){ vmRoot.quaternion.copy(BSC.rawQ); bscPose(); } // com a mira fechada o jogo não atualiza a arma
  const E=bscEllipse(w,h), P3=bscParts();
  BSC.lens=!!E; if(P3){ P3.hole.visible=false; if(P3.glass) P3.glass.visible=!E; }
  const f0=camera.fov; if(!scoped) BSC.fovOut=f0;
  if(E){ const k=Math.max(0.3,Math.min(1,E.Rg/Z.Rf*1.2));
    BSC.rti.viewport.set(0,0,Math.max(2,Math.round(w*k)),Math.max(2,Math.round(h*k)));
    camera.fov=CHEAT.fov/(Wp.scopeLv===2?6.5:2.6); camera.updateProjectionMatrix();
    try{ renderer.setRenderTarget(BSC.rti); renderer.clear(); renderer.render(scene,camera); }
    finally{ renderer.setRenderTarget(null); }
    BSC.ks=k; }
  // mundo normal (mesma qualidade de sempre); com a mira fechada usa o campo de visão de fora da luneta
  camera.fov=scoped&&BSC.fovOut?BSC.fovOut:f0; camera.updateProjectionMatrix();
  try{ mainFn(); } finally{ camera.fov=f0; camera.updateProjectionMatrix(); }
  if(E){ const e=Math.min(1,E.Rg/Z.Rf); BSC.e=e;
    const id=1/E.det; U.uMi.value.set(E.b[1]*id,-E.b[0]*id,-E.a[1]*id,E.a[0]*id);
    U.tIn.value=BSC.rti.texture; U.uRes.value.set(w,h); U.uC.value.set(E.C[0],E.C[1]); U.uRg.value=E.Rg; U.uRf.value=Z.Rf; U.uKs.value=BSC.ks;
    U.uO.value=Math.max(0,Math.min(1,(e-0.25)/0.72)); U.uK.value=HV.kick; U.uT.value=BSC.t; U.uDim.value=Math.max(0,Math.min(1,(e-0.55)/0.45))*0.6; U.uS.value.set(BSC.sx,BSC.sy);
    U.uMode.value=0; renderer.render(BSC.scn,BSC.cam); }
  else BSC.e=0;
  // a arma é desenhada aqui (com a mira fechada o jogo nem desenharia) e a lente vai POR CIMA dela:
  // nada do modelo entre o olho e a ocular aparece dentro do vidro
  renderer.clearDepth(); try{ if(!scoped&&typeof vmLightFrame==='function') vmLightFrame(dt); }catch(e){}
  const hid=[]; if(BSC.e>0.6) for(const o of vmScene.children){ if(o!==vmRoot&&!o.isLight&&o.visible){ o.visible=false; hid.push(o); } }
  try{ if(!CINEMA.noVm) renderer.render(vmScene,vmCam); } finally{ for(const o of hid) o.visible=true; }
  if(!scoped){ vmScene.visible=false; BSC.vmHid=true; }
  if(E){ U.uMode.value=1; renderer.render(BSC.scn,BSC.cam); }
  bscHud(E); }
function bscHud(E){ const el=document.getElementById('bscope'); if(!el) return; el.classList.add('gl');
  const show=!!E&&BSC.e>0.5; el.classList.toggle('on',show); document.body.classList.toggle('barscope',!!E||!!Wp.scoped);
  if(!show) return; const pr=renderer.getPixelRatio(), gl=el.querySelector('.glass');
  const R=E.Rg/pr, cx=E.C[0]/pr, cy=(BSC.h0-E.C[1])/pr;
  if(gl){ gl.style.left=cx+'px'; gl.style.top=cy+'px'; gl.style.width=(2*R)+'px'; gl.style.height=(2*R)+'px'; gl.style.margin=(-R)+'px 0 0 '+(-R)+'px'; }
  el.style.setProperty('--R',R+'px'); el.style.setProperty('--o',Math.max(0,(BSC.e-0.6)/0.4).toFixed(3)); el.style.opacity='1';
  if((BSC.rT=(BSC.rT||0)-0.016)<=0){ BSC.rT=0.15; try{ const o=camera.position, d=new THREE.Vector3(); camera.getWorldDirection(d); const t=rayWall(o,d,600);
      const rg=el.querySelector('.rng'); if(rg) rg.textContent=(t>=599?'---':Math.round(t))+' m'; const zl=el.querySelector('.zl'); if(zl) zl.textContent=(Wp.scopeLv===2?'6.5':'2.6')+'×'; }catch(e){} } }
{ const po=v9PostOn, rp=v9RenderPost;
  const want=()=>!BSC.fail&&bscActiveGun()&&!bscCancel()&&(P.ads>0.03||!!Wp.scoped);
  v9PostOn=function(){ return want()||po.apply(this,arguments); };
  v9RenderPost=function(dt){ const self=this, main=()=>{ if(po.call(self)) rp.call(self,dt); else renderer.render(scene,camera); };
    if(want()){ try{ bscRender(dt,main); return; }catch(e){ BSC.fail=true; console.warn('[Bunker] luneta renderizada desligada',e); try{ renderer.setRenderTarget(null); }catch(e2){} } }
    const P3=bscParts(); if(P3){ P3.hole.visible=false; if(P3.glass) P3.glass.visible=true; } BSC.lens=false;
    main(); }; }
// fora da Barrett (ou cancelado): vidro normal na ocular e nada de HUD da luneta
v9On('frame',()=>{ if(!bscActiveGun()||bscCancel()||(P.ads<=0.03&&!Wp.scoped)){ const P3=bscParts(); if(P3){ P3.hole.visible=false; if(P3.glass) P3.glass.visible=true; }
  const el=document.getElementById('bscope'); if(el){ el.classList.add('gl'); el.classList.remove('on'); } if(!Wp.scoped) document.body.classList.remove('barscope'); } });
CMDS.luneta={d:'luneta · estado da luneta da Barrett',f:()=>{ cprint('luneta: lente '+(BSC.lens?'na tela':'fora')+' · aproximação '+(BSC.e*100|0)+'% · abertura '+(BSC.q*100|0)+'%'+(BSC.fail?' · DESLIGADA por erro':'')); } };
