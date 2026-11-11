/* ================= v9 · FINALIZAÇÃO DE CINEMA (golpe pesado da faca) =================
   Quando o golpe pesado mata um zumbi de perto, entra uma sequência de ~2,4 s com câmera de cinema:
   1. faixas de cinema entram, a câmera avança e trava na cabeça; a mão esquerda agarra o zumbi pelo crânio
   2. a faca (a sua faca equipada) sobe acima da cabeça e desce com tudo — câmera lenta no impacto
   3. a lâmina entra de verdade no crânio (a parte enterrada some dentro da cabeça), sangue espirra na tela e nas luvas
   4. você empurra mais fundo e torce a faca; o zumbi convulsiona e o sangue pulsa a cada movimento
   5. arranca a faca com um jato de sangue, o corpo desaba de joelhos, e você sacode o sangue da lâmina
   O zumbi é animado no mesmo relógio da cena, então a câmera lenta vale para os dois. */
const FX2={on:false,z:null,t:0,real:0,impact:false,pumps:0,twist:false,rip:false,flick:false,drop:false,prevCam:null,plane:new THREE.Plane(new THREE.Vector3(0,0,1),1e6),E:new THREE.Vector3(),D:new THREE.Vector3(),buried:false,clipped:new WeakSet(),lh:null,ui:null};
try{ renderer.localClippingEnabled=true; }catch(e){}
const FXK=[ // poses da mão da faca (somadas à pose de repouso), calculadas para a ponta cair no centro da cabeça
  [0.00,{x:0,y:0,z:0,rx:0,ry:0,rz:0}],
  [0.18,{x:0,y:0.04,z:0.06,rx:0.4,ry:0,rz:-0.1}],
  [0.34,{x:-0.074,y:0.081,z:-0.166,rx:1.349,ry:-0.103,rz:-0.202}],
  [0.42,{x:-0.07,y:0.1,z:-0.14,rx:1.5,ry:-0.1,rz:-0.2}],
  [0.47,{x:-0.105,y:0.236,z:-0.045,rx:-1.195,ry:0.086,rz:-0.411}],
  [0.62,{x:-0.108,y:0.2285,z:-0.0576,rx:-1.195,ry:0.086,rz:-0.411}],
  [0.76,{x:-0.114,y:0.2135,z:-0.0828,rx:-1.195,ry:0.086,rz:-0.411}],
  [0.90,{x:-0.111,y:0.221,z:-0.0702,rx:-1.195,ry:0.086,rz:-0.411}],
  [1.02,{x:-0.116,y:0.2085,z:-0.0912,rx:-1.195,ry:0.086,rz:-0.411}],
  [1.30,{x:-0.116,y:0.2085,z:-0.0912,rx:-1.195,ry:0.086,rz:-0.411}],
  [1.40,{x:-0.12,y:0.132,z:0.071,rx:-0.208,ry:0.379,rz:-1.141}],
  [1.62,{x:0.01,y:0.04,z:0.02,rx:0.2,ry:0,rz:-0.2}],
  [1.76,{x:0.05,y:0.02,z:0.0,rx:-0.25,ry:-0.1,rz:0.6}],
  [2.05,{x:0,y:0,z:0,rx:0,ry:0,rz:0}]];
const FXL=[ // mão esquerda: vem de baixo, abre e crava os dedos no topo da cabeça
  [0.00,{x:-0.3,y:-0.4,z:-0.3,rx:-1.0,ry:-0.3,rz:-0.1,c:0.1}],
  [0.20,{x:-0.02,y:0.1,z:-0.53,rx:-1.25,ry:-0.34,rz:-0.12,c:0.15}],
  [0.28,{x:-0.014,y:0.074,z:-0.517,rx:-1.224,ry:-0.343,rz:-0.121,c:1.0}],
  [0.47,{x:-0.014,y:0.068,z:-0.517,rx:-1.224,ry:-0.343,rz:-0.121,c:1.0}],
  [0.52,{x:-0.016,y:0.058,z:-0.505,rx:-1.2,ry:-0.343,rz:-0.121,c:1.15}],
  [1.30,{x:-0.014,y:0.066,z:-0.512,rx:-1.224,ry:-0.343,rz:-0.121,c:1.15}],
  [1.42,{x:-0.04,y:0.06,z:-0.48,rx:-1.15,ry:-0.3,rz:-0.1,c:0.4}],
  [1.70,{x:-0.3,y:-0.4,z:-0.3,rx:-1.0,ry:-0.3,rz:-0.1,c:0.1}]];
function fxKey(K,t){ if(t<=K[0][0]) return K[0][1]; for(let i=1;i<K.length;i++){ if(t<=K[i][0]){ const a=K[i-1], b=K[i], k=smooth((t-a[0])/(b[0]-a[0])); const o={}; for(const n in b[1]) o[n]=lerp(a[1][n],b[1][n],k); return o; } } return K[K.length-1][1]; }
// mão esquerda que agarra a cabeça (mesma pele/luva das mãos da arma)
function fxLeftHand(){ if(FX2.lh) return FX2.lh; const g=new THREE.Group(); const h=makeHand(true,[0.4,0.3,0.2]); h.scale.setScalar(0.95); g.add(h); g.userData.h=h; g.visible=false; vmScene.add(g); FX2.lh=g; return g; }
// faixas de cinema + respingos na tela
function fxUi(){ if(FX2.ui) return FX2.ui; const st=document.createElement('style'); st.textContent=`
#fxbars{position:fixed;inset:0;pointer-events:none;z-index:40}
#fxbars i{position:absolute;left:0;right:0;height:0;background:#000;transition:height .28s cubic-bezier(.2,.8,.2,1)}
#fxbars i.t{top:0} #fxbars i.b{bottom:0}
#fxbars.on i{height:9vh}
#fxvig{position:fixed;inset:0;pointer-events:none;z-index:39;opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 45%,rgba(40,0,0,.55) 100%)}
#fxvig.on{opacity:1}
#fxsplat{position:fixed;inset:0;pointer-events:none;z-index:39;width:100%;height:100%;opacity:0}`; document.head.appendChild(st);
  const bars=document.createElement('div'); bars.id='fxbars'; bars.innerHTML='<i class="t"></i><i class="b"></i>'; document.body.appendChild(bars);
  const vig=document.createElement('div'); vig.id='fxvig'; document.body.appendChild(vig);
  const cv=document.createElement('canvas'); cv.id='fxsplat'; cv.width=960; cv.height=540; document.body.appendChild(cv);
  FX2.ui={bars,vig,cv,a:0}; return FX2.ui; }
function fxSplat(n,big){ const U=fxUi(), c=U.cv.getContext('2d'), W=U.cv.width, H=U.cv.height;
  for(let i=0;i<n;i++){ const x=W*(0.5+rand(-0.45,0.45)), y=H*(0.45+rand(-0.4,0.4)), r=rand(10,big?70:38); const gr=c.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(110,0,0,0.85)'); gr.addColorStop(0.6,'rgba(80,0,0,0.6)'); gr.addColorStop(1,'rgba(60,0,0,0)'); c.fillStyle=gr; c.beginPath(); c.ellipse(x,y,r,r*rand(0.6,1),rand(0,3),0,6.28); c.fill();
    for(let k=0;k<6;k++){ const a=rand(0,6.28), d=r*rand(0.9,2.2); c.fillStyle='rgba(95,0,0,0.75)'; c.beginPath(); c.arc(x+Math.cos(a)*d,y+Math.sin(a)*d,rand(1.5,5),0,6.28); c.fill(); }
    if(Math.random()<0.5){ c.strokeStyle='rgba(90,0,0,0.6)'; c.lineWidth=rand(2,5); c.beginPath(); c.moveTo(x,y); c.lineTo(x+rand(-4,4),y+rand(30,110)); c.stroke(); } }
  U.a=Math.min(1,U.a+(big?0.8:0.45)); U.cv.style.opacity=U.a; }
v9On('always',dt=>{ const U=FX2.ui; if(!U||U.a<=0) return; U.a=Math.max(0,U.a-dt*(FX2.on?0.25:0.7)); U.cv.style.opacity=U.a; if(U.a<=0) U.cv.getContext('2d').clearRect(0,0,U.cv.width,U.cv.height); });
// a parte da lâmina que entrou no crânio some: plano de corte que acompanha o ponto de entrada
function fxKnifeParts(){ return knifeModel&&knifeModel.userData; }
function fxClipOn(){ const parts=fxKnifeParts(); if(!parts||FX2.clipped.has(knifeModel)) return; FX2.clipped.add(knifeModel);
  parts.spin.traverse(o=>{ if(o.isMesh&&o.material){ o.material=o.material.clone(); o.material.clippingPlanes=[FX2.plane]; o.material.needsUpdate=true; } }); }
const _fxv=new THREE.Vector3(), _fxv2=new THREE.Vector3(), _fxm=new THREE.Matrix4();
function fxTip(out,dir){ const parts=fxKnifeParts(); if(!parts) return false; vmScene.updateMatrixWorld(true);
  if(parts.fxTipZ===undefined){ let mn=0; _fxm.copy(knifeModel.matrixWorld).invert(); parts.spin.traverse(o=>{ if(!o.isMesh||!o.geometry) return; if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox; for(const z of [b.min.z,b.max.z]) for(const x of [b.min.x,b.max.x]) for(const y of [b.min.y,b.max.y]){ _fxv.set(x,y,z).applyMatrix4(o.matrixWorld).applyMatrix4(_fxm); if(_fxv.z<mn) mn=_fxv.z; } }); parts.fxTipZ=mn; }
  out.set(0,0,parts.fxTipZ).applyMatrix4(knifeModel.matrixWorld);
  _fxv2.set(0,0,0).applyMatrix4(knifeModel.matrixWorld); dir.copy(out).sub(_fxv2).normalize(); return true; }
function fxHeadPos(z,v){ try{ (z.head&&z.head.visible?z.head:z.headP).getWorldPosition(v); }catch(e){ v.set(z.pos.x,zy(z)+1.72,z.pos.z); } return v; }
function fxBlood(z,n,spd,toCam){ const h=fxHeadPos(z,new THREE.Vector3()); let x=h.x,y=h.y+0.05,zz=h.z; if(toCam){ const dx=P.pos.x-x, dz=P.pos.z-zz, d=Math.hypot(dx,dz)||1; x+=dx/d*0.12; zz+=dz/d*0.12; } emit('blood',x,y,zz,n,spd,0.9); }
function fxSnd(n,o){ try{ return Snd.sample(n,Object.assign({prio:1},o||{})); }catch(e){ return null; } }
function fxThump(){ try{ const ctx=Snd.ctx; if(!ctx) return; const o=Snd.out(0.9,0,0.15,null); Snd.oscTo(o,{t:Snd.now,type:'sine',freq:62,freqEnd:34,dur:0.45,gain:0.75,attack:0.004}); }catch(e){} }
// ---- início ----
function fx2Start(z){ z.v9fin=true; z.fxT=0; Object.assign(FX2,{on:true,z,t:0,real:0,impact:false,pumps:0,twist:false,rip:false,flick:false,drop:false,buried:false,Eset:false,El:null,Dl:null}); FX2.plane.constant=1e6;
  try{ fxClipOn(); }catch(e){} const U=fxUi(); U.bars.classList.add('on'); U.vig.classList.add('on');
  try{ if(typeof hfxStart==='function') hfxStart('_fin',false); }catch(e){}
  fxSnd('knife_whoosh',{vol:0.7,rate:0.85}); fxSnd(['z_snarl1','z_snarl2','z_snarl3'],{vol:0.8,x:z.pos.x,z:z.pos.z,range:20,rate:0.8});
  if(V9CAM.fn!==fxCam){ FX2.prevCam=V9CAM.fn; V9CAM.fn=fxCam; } }
finStart=fx2Start;
function fx2End(){ if(!FX2.on) return; FX2.on=false; try{ knife.position.set(0,0,0); knife.quaternion.identity(); }catch(e){} FX2.plane.constant=1e6; FX2.buried=false; if(FX2.lh) FX2.lh.visible=false; const U=FX2.ui; if(U){ U.bars.classList.remove('on'); U.vig.classList.remove('on'); }
  try{ camera.zoom=1; camera.updateProjectionMatrix(); }catch(e){} if(V9CAM.fn===fxCam) V9CAM.fn=FX2.prevCam||null; FX2.prevCam=null;
  try{ if(Wp.kAct==='stab'){ Wp.kT=Wp.kDur; } }catch(e){} }
const _busyFx=busy; busy=function(){ return _busyFx()||FX2.on; };
{ const _hp=hurtPlayer; hurtPlayer=function(a,b,c,d){ if(FX2.on&&FX2.t<1.7) return; return _hp.apply(this,arguments); }; }
v9On('reset',()=>fx2End());
// ---- relógio da cena (câmera lenta no impacto) e eventos ----
v9On('always',dt=>{ if(!FX2.on) return; const z=FX2.z; if(!z||G.state!=='playing'&&G.state!=='paused'||P.down){ fx2End(); return; } if(G.state==='paused') return;
  const t0=FX2.t, slow=t0>0.46&&t0<0.6?0.22:(t0>=1.36&&t0<1.42?0.4:1); FX2.t+=dt*slow; FX2.real+=dt; z.fxT=FX2.t; const t=FX2.t;
  // jogador gruda na vítima e a câmera crava na cabeça
  const h=fxHeadPos(z,_fxv); const dx=z.pos.x-P.pos.x, dz=z.pos.z-P.pos.z, d=Math.hypot(dx,dz)||1, k=1-Math.exp(-dt*12);
  let dy=Math.atan2(-dx,-dz)-P.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; P.yaw+=dy*k;
  const hp=Math.atan2(h.y-0.06-(P.base||0)-EYE_HEIGHT-P.y+0.6*P.crouch,d); P.pitch+=(clamp(hp,-0.7,0.7)-P.pitch)*k; P.vx=P.vz=0;
  if(d>0.78&&t<0.4){ const m=Math.min(d-0.78,dt*6); P.pos.x+=dx/d*m; P.pos.z+=dz/d*m; }
  // impacto
  if(!FX2.impact&&t>=0.47){ FX2.impact=true; FX2.buried=true; shake(0.45); fxThump(); fxSnd(['knife_stab1','knife_stab2','knife_stab3'],{vol:1}); fxSnd('gore_splat',{vol:0.9}); fxSnd('hit_flesh1',{vol:0.8}); try{ Snd.head(); }catch(e){}
    fxBlood(z,46,4.6,true); emit('gore',h.x,h.y,h.z,14,3.2,1); fxSplat(7,true); try{ vmBlood(1,true); }catch(e){}
    try{ const o=h.clone(), dd=new THREE.Vector3(z.pos.x-P.pos.x,0.15,z.pos.z-P.pos.z).normalize(); emit('blood',o.x+dd.x*0.15,o.y,o.z+dd.z*0.15,30,4,0.9); const tt=rayWall(o,dd,3.5); if(tt<3.4) v9WallBlood(o.clone().addScaledVector(dd,tt),-dd.x,0,-dd.z); }catch(e){}
  }
  if(FX2.impact&&FX2.pumps<1&&t>=0.76){ FX2.pumps=1; shake(0.25); fxSnd('knife_stab3',{vol:0.75,rate:0.9}); fxSnd('hit_flesh2',{vol:0.7}); fxBlood(z,22,3.4,true); fxSplat(3); try{ vmBlood(0.7,true); }catch(e){} }
  if(FX2.impact&&FX2.pumps<2&&t>=1.02){ FX2.pumps=2; shake(0.22); fxSnd('knife_stab2',{vol:0.7,rate:0.85}); fxBlood(z,18,3,true); }
  if(FX2.impact&&!FX2.twist&&t>=1.08){ FX2.twist=true; fxSnd('knife_twist',{vol:1}); fxSnd('gore_guts',{vol:0.45,rate:1.15}); }
  if(FX2.twist&&t<1.3&&Math.random()<dt*28) fxBlood(z,3,2.2,true);
  if(!FX2.rip&&t>=1.33){ FX2.rip=true; shake(0.35); fxSnd('knife_stab1',{vol:0.9,rate:0.75}); fxSnd('gore_guts',{vol:0.7}); fxSnd('knife_whoosh',{vol:0.5,rate:1.2}); fxBlood(z,60,5.2,true); emit('gore',h.x,h.y,h.z,10,3.5,1); fxSplat(9,true); try{ vmBlood(1,true); }catch(e){} }
  if(FX2.rip&&t<1.9&&Math.random()<dt*20) fxBlood(z,2,1.6,false);
  if(FX2.rip&&FX2.buried&&t>1.42) FX2.buried=false;
  if(!FX2.flick&&t>=1.72){ FX2.flick=true; fxSnd('knife_swing',{vol:0.45,rate:1.3}); const T=new THREE.Vector3(); try{ const c=camera.position, f=new THREE.Vector3(); camera.getWorldDirection(f); emit('blood',c.x+f.x*0.6+rand(-.1,.1),c.y-0.2,c.z+f.z*0.6,8,2.4,0.8); }catch(e){} }
  if(!FX2.drop&&t>=2.05){ FX2.drop=true; fxSnd('hit_punch',{vol:0.5,rate:0.6,x:z.pos.x,z:z.pos.z,range:20}); }
  // mantém a faca na mão (a estocada normal não termina sozinha durante a cena)
  try{ if(Wp.kAct==='stab'){ Wp.kT=Math.min(Wp.kT,Wp.kDur*0.6); Wp.kHit=true; } Wp.knifeOut=true; }catch(e){}
  if(t>=2.15) fx2End(); });
// ---- câmera: rolagem de cinema, zoom e soco no impacto ----
function fxCam(dt){ if(FX2.prevCam) try{ FX2.prevCam(dt); }catch(e){} if(!FX2.on) return; const t=FX2.t;
  const roll=fxKey([[0,{r:0}],[0.3,{r:-0.06}],[0.45,{r:-0.09}],[0.5,{r:0.05}],[1.0,{r:0.03}],[1.3,{r:0.08}],[1.45,{r:-0.04}],[2.1,{r:0}]],t).r;
  const zm=fxKey([[0,{z:1}],[0.4,{z:1.18}],[0.48,{z:1.3}],[0.6,{z:1.26}],[1.3,{z:1.22}],[1.4,{z:1.1}],[2.1,{z:1}]],t).z;
  const punch=t>0.47&&t<0.62?Math.sin((t-0.47)/0.15*Math.PI)*0.05:0;
  camera.rotation.z+=roll; camera.rotation.x+=punch; camera.zoom=zm; camera.updateProjectionMatrix(); }
// ---- mãos na tela ----
V9VM.push(dt=>{ const lh=FX2.lh; if(!FX2.on){ if(lh) lh.visible=false; return; } const t=FX2.t, parts=fxKnifeParts();
  if(parts&&knife.visible){ const a=fxKey(FXK,t); let tr=0; if(FX2.impact&&t<1.33) tr=(t<0.62?0.006:0.0025)*Math.sin(FX2.real*90);
    const q={x:a.x+tr,y:a.y+tr*0.5,z:a.z,rx:a.rx,ry:a.ry,rz:a.rz}; knife.position.set(0,0,0); knife.quaternion.identity(); placeKnife(knifeModel,parts,q);
    if(FX2.buried&&!FX2.Eset){ FX2.Eset=true; const T=new THREE.Vector3(), D=new THREE.Vector3(); if(fxTip(T,D)){ FX2.D.copy(D); FX2.E.copy(T).addScaledVector(D,-0.025); vmRoot.updateMatrixWorld(true); _fxm.copy(vmRoot.matrixWorld).invert(); FX2.El=FX2.E.clone().applyMatrix4(_fxm); FX2.Dl=FX2.D.clone().transformDirection(_fxm); } }
    // torção: a mão gira em volta do eixo da lâmina, com o ponto de entrada parado
    const tw=t<1.06?0:t<1.28?-1.5*smooth((t-1.06)/0.22):t<1.33?-1.5:t<1.42?-1.5*(1-smooth((t-1.33)/0.09)):0;
    if(tw&&FX2.El){ const qq=new THREE.Quaternion().setFromAxisAngle(FX2.Dl,tw+(t<1.3?Math.sin(FX2.real*70)*0.04:0)); knife.quaternion.copy(qq); knife.position.copy(FX2.El).sub(FX2.El.clone().applyQuaternion(qq)); } }
  // plano de corte: só enquanto a lâmina está dentro da cabeça
  if(FX2.buried){ FX2.plane.normal.copy(FX2.D).negate(); FX2.plane.constant=FX2.D.dot(FX2.E); } else FX2.plane.constant=1e6;
  const L=fxLeftHand(); const b=fxKey(FXL,t); L.visible=t<1.72&&!CINEMA.noVm; L.position.set(b.x,b.y,b.z); L.rotation.set(b.rx,b.ry,b.rz);
  const U=L.userData.h.userData; if(U&&U.fingers){ const sh=FX2.impact&&t<1.3?Math.sin(FX2.real*60)*0.05:0; for(let i=0;i<4;i++) for(let k=0;k<3;k++) U.fingers[i][k].rotation.x=-(0.35+b.c*[1.0,0.85,0.7][k])-sh; U.thumb.rotation.x=-0.7-b.c*0.4; } });
// ---- o zumbi: agarrado, faca no crânio, convulsão, desaba ----
finDeath=function(z,dt){ const t=z.fxT!=null&&FX2.z===z?z.fxT:z.t*0.95, aL=z.armL, aR=z.armR, L=z.legL, R=z.legR;
  if(t<1.5){ const grab=smooth(clamp(t/0.25,0,1)), hit=t>0.47?smooth(clamp((t-0.47)/0.06,0,1)):0, sag=t>0.6?smooth(clamp((t-0.6)/0.7,0,1)):0, rip=t>1.33?smooth(clamp((t-1.33)/0.1,0,1)):0;
    const tw=FX2.z===z&&FX2.impact&&t<1.33?Math.sin(t*55)*0.06*(1-sag*0.4):0, jerk=(t>0.76&&t<0.82)||(t>1.02&&t<1.08)?0.12:0;
    z.g.position.y=0; z.hips.position.y=0.95-0.06*hit-0.1*sag;
    z.g.rotation.set(-0.1*grab+0.08*hit,0,tw*0.3);
    z.spine.rotation.set(-0.22*grab+0.25*hit+0.15*sag-jerk*0.5,tw,tw*0.5);
    z.headP.rotation.set(-0.7*grab+0.45*hit+0.2*sag+jerk+(hit>0&&t<0.6?rand(-0.06,0.06):0)-0.25*rip,tw*1.5,0.18*hit+tw);
    // braços: sobem tentando agarrar você, travam no impacto, tremem e caem moles
    const up=grab*(1-hit*0.6);
    aL.sh.rotation.set(-1.3*up-0.3*hit+0.9*sag+tw*2,0,-0.35-0.5*hit*(1-sag)); aR.sh.rotation.set(-1.4*up-0.25*hit+0.85*sag-tw*2,0,0.35+0.55*hit*(1-sag));
    aL.el.rotation.x=-0.9*up-0.2*hit+0.5*sag; aR.el.rotation.x=-1.0*up-0.25*hit+0.5*sag;
    L.th.rotation.x=-0.1*grab+0.25*sag; R.th.rotation.x=0.05*grab+0.3*sag; L.kn.rotation.x=0.2*hit+0.55*sag; R.kn.rotation.x=0.25*hit+0.6*sag;
  } else { const tt=z.t; z.t=t; try{ fallFrom(z,dt,1.5,'knees'); }finally{ z.t=tt; } }
  z.g.position.x=z.pos.x; z.g.position.z=z.pos.z; z.g.rotation.y=z.yaw; };
CMDS.finalizar={cheat:1,d:'finalizar · executa a finalização de faca no zumbi mais perto (para testar)',f:()=>{ let best=null,bd=9; for(const z of zlist()){ if(z.dead||isBossZ(z)||z.kind==='dog') continue; const d=Math.hypot(z.pos.x-P.pos.x,z.pos.z-P.pos.z); if(d<bd){ bd=d; best=z; } } if(!best){ cprint('Nenhum zumbi por perto'); return; } closeConsole(); drawKnife(); setTimeout(()=>{ Wp.kAct='stab'; Wp.kT=0.4; Wp.kHit=true; killZombie(best,'head','knife'); },250); }};
