/* ================= v9 · BESTA CARCARÁ (modelo novo + animações) =================
   Besta moderna: trilho de alumínio com recortes, coronha esquelética, empunhadura emborrachada, braços divididos de
   fibra de carbono com polias, corda e cabos de verdade, luneta com retículo aceso, estribo, aljava com virotes de reserva.
   Tiro: a corda dispara para frente e os braços vibram. Recarga: a arma inclina, a corda é puxada (os braços flexionam,
   catraca clicando), trava com clique, um virote sai da aljava e desliza no trilho até encaixar. */
const XB2={tex:{},anim:{draw:1,snap:0,vib:0,lastMag:-1,clicks:0,latch:false,slide:0,phase:0}};
function xb2Tex(){ if(XB2.tex.carbon) return XB2.tex;
  XB2.tex.carbon=tex(128,128,(c,W,H)=>{ c.fillStyle='#16181a'; c.fillRect(0,0,W,H); for(let y=0;y<H;y+=8) for(let x=0;x<W;x+=8){ const g=c.createLinearGradient(x,y,x+8,y+8); const a=((x+y)/8)%2; g.addColorStop(0,a?'#2a2e32':'#121416'); g.addColorStop(1,a?'#0e1012':'#2a2e32'); c.fillStyle=g; c.fillRect(x,y,8,8); } });
  XB2.tex.carbon.wrapS=XB2.tex.carbon.wrapT=THREE.RepeatWrapping; XB2.tex.carbon.repeat.set(4,1);
  XB2.tex.grip=tex(64,64,(c,W,H)=>{ c.fillStyle='#1a1b1d'; c.fillRect(0,0,W,H); for(let i=0;i<500;i++){ c.fillStyle=Math.random()<0.5?'#26282b':'#0e0f10'; c.fillRect(Math.random()*W,Math.random()*H,2,2); } });
  XB2.tex.grip.wrapS=XB2.tex.grip.wrapT=THREE.RepeatWrapping;
  XB2.tex.decal=tex(256,64,(c,W,H)=>{ c.clearRect(0,0,W,H); c.font='bold 30px "Stardos Stencil", Impact, sans-serif'; c.fillStyle='#e8701a'; c.textBaseline='middle'; c.fillText('CARCARÁ',8,H/2+2); c.font='12px sans-serif'; c.fillStyle='#8a8478'; c.fillText('420 FPS',178,H/2+2); });
  return XB2.tex; }
function xb2Mats(tier){ const T=xb2Tex(); const k='m'+tier; if(XB2[k]) return XB2[k]; const glowT=tier>0?TIER_COL[tier]:0xff6a10;
  const M={ alu:new THREE.MeshPhongMaterial({color:0x2a2d31,shininess:90,specular:0x666a70}), aluD:new THREE.MeshPhongMaterial({color:0x121315,shininess:40,specular:0x333333}),
    carbon:new THREE.MeshPhongMaterial({map:T.carbon,color:0xffffff,shininess:110,specular:0x8a8a8a}), grip:new THREE.MeshPhongMaterial({map:T.grip,color:0xffffff,shininess:8,specular:0x111111}),
    rubber:new THREE.MeshPhongMaterial({color:0x0c0c0d,shininess:5}), steel:new THREE.MeshPhongMaterial({color:0x9aa2aa,shininess:130,specular:0xffffff}),
    accent:new THREE.MeshPhongMaterial({color:0xd8601a,shininess:70,specular:0x664422}), string:new THREE.MeshPhongMaterial({color:0x2a2622,shininess:20}),
    cable:new THREE.MeshPhongMaterial({color:0x1a1a1a,shininess:40}), glass:new THREE.MeshPhongMaterial({color:0x0a1420,shininess:140,specular:0xa8c8ff,transparent:true,opacity:0.85}),
    reticle:new THREE.MeshBasicMaterial({color:glowT}), nock:new THREE.MeshBasicMaterial({color:glowT}),
    vaneA:new THREE.MeshPhongMaterial({color:0xd8601a,side:THREE.DoubleSide,shininess:30}), vaneB:new THREE.MeshPhongMaterial({color:0x111111,side:THREE.DoubleSide,shininess:30}),
    decal:new THREE.MeshBasicMaterial({map:T.decal,transparent:true,depthWrite:false}) };
  if(tier>0) for(const n of ['alu','carbon','accent']){ M[n]=M[n].clone(); M[n].emissive=new THREE.Color(TIER_COL[tier]).multiplyScalar(0.14); }
  return XB2[k]=M; }
function xb2Line(m,a,b){ const d=new THREE.Vector3().subVectors(b,a), L=d.length(); m.position.copy(a).addScaledVector(d,0.5); m.scale.set(1,Math.max(1e-4,L),1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); }
function xb2Bolt(M,scale){ const b=new THREE.Group(); const s=scale||1;
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.0042*s,0.0042*s,0.42*s,8),M.carbon); sh.rotation.x=Math.PI/2; b.add(sh);
  const fp=new THREE.Mesh(new THREE.ConeGeometry(0.006*s,0.03*s,8),M.steel); fp.rotation.x=-Math.PI/2; fp.position.z=-0.225*s; b.add(fp);
  const in1=new THREE.Mesh(new THREE.CylinderGeometry(0.0055*s,0.0045*s,0.012*s,8),M.steel); in1.rotation.x=Math.PI/2; in1.position.z=-0.205*s; b.add(in1);
  for(let i=0;i<3;i++){ const v=new THREE.Mesh(new THREE.PlaneGeometry(0.06*s,0.016*s),i?M.vaneB:M.vaneA); const a=i*Math.PI*2/3; v.position.set(Math.cos(a)*0.011*s,Math.sin(a)*0.011*s,0.17*s); v.rotation.set(0,Math.PI/2,a); b.add(v); }
  const nk=new THREE.Mesh(new THREE.CylinderGeometry(0.0048*s,0.0048*s,0.016*s,8),M.nock); nk.rotation.x=Math.PI/2; nk.position.z=0.215*s; b.add(nk); return b; }
function xb2Build(tier){ const M=xb2Mats(tier|0), g=new THREE.Group(); g.name='Besta';
  const B=(w,h,d,m,x,y,z,rx,ry,rz,p)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.rotation.set(rx||0,ry||0,rz||0); (p||g).add(o); return o; };
  const C=(rt,rb,h,m,x,y,z,rx,ry,rz,seg,p)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),m); o.position.set(x,y,z); o.rotation.set(rx||0,ry||0,rz||0); (p||g).add(o); return o; };
  // ---- trilho (flight deck) com recortes e sulco do virote
  B(0.05,0.038,0.5,M.alu,0,0.02,-0.17); B(0.012,0.004,0.48,M.aluD,0,0.0405,-0.17);
  for(const sx of [-1,1]) for(let i=0;i<4;i++) B(0.002,0.018,0.06,M.aluD,sx*0.0255,0.018,-0.33+i*0.085);
  B(0.052,0.008,0.5,M.aluD,0,0.0,-0.17);                                   // friso inferior
  const dec=new THREE.Mesh(new THREE.PlaneGeometry(0.16,0.04),M.decal); dec.position.set(0.0262,0.02,-0.2); dec.rotation.y=Math.PI/2; g.add(dec);
  // trilho picatinny em cima (onde vai a luneta)
  B(0.024,0.008,0.16,M.aluD,0,0.045,0.0); for(let i=0;i<9;i++) B(0.028,0.006,0.008,M.aluD,0,0.051,-0.07+i*0.0175);
  // ---- caixa do gatilho, trava, empunhadura emborrachada, gatilho e guarda-mato
  B(0.048,0.055,0.12,M.alu,0,-0.008,0.07); B(0.012,0.008,0.02,M.accent,0.026,0.012,0.09);  // trava de segurança laranja
  const grip=B(0.034,0.115,0.048,M.grip,0,-0.085,0.135,-0.32); for(let i=0;i<3;i++) B(0.036,0.006,0.006,M.rubber,0,-0.05-i*0.028,0.112+i*0.009,-0.32);
  const trg=new THREE.Mesh(new THREE.TorusGeometry(0.014,0.0035,6,12,Math.PI*0.7),M.steel); trg.position.set(0,-0.045,0.085); trg.rotation.set(0,Math.PI/2,Math.PI*0.9); g.add(trg); g.userData.trigger=trg;
  B(0.006,0.006,0.075,M.alu,0,-0.068,0.088); B(0.006,0.03,0.006,M.alu,0,-0.052,0.05);
  // ---- coronha esquelética com apoio de rosto e soleira de borracha
  B(0.03,0.026,0.3,M.alu,0,0.012,0.28); B(0.026,0.022,0.26,M.alu,0,-0.075,0.3,0.18);
  B(0.028,0.11,0.022,M.alu,0,-0.03,0.42); B(0.04,0.13,0.03,M.rubber,0,-0.03,0.445);
  B(0.032,0.03,0.12,M.grip,0,0.04,0.3);                                    // apoio de rosto
  B(0.022,0.07,0.012,M.alu,0,-0.03,0.18,0.25);                              // treliça
  // ---- telha (foregrip) com nervuras
  B(0.044,0.03,0.15,M.grip,0,-0.012,-0.22); for(let i=0;i<5;i++) B(0.046,0.004,0.006,M.rubber,0,-0.028,-0.28+i*0.03);
  // ---- riser, pockets, estribo
  B(0.1,0.05,0.06,M.alu,0,0.02,-0.42); B(0.03,0.07,0.03,M.accent,0,0.02,-0.45);
  for(const sx of [-1,1]) B(0.03,0.045,0.04,M.aluD,sx*0.055,0.02,-0.43);
  const st=new THREE.Mesh(new THREE.TorusGeometry(0.05,0.006,8,18,Math.PI),M.alu); st.position.set(0,0.02,-0.47); st.rotation.set(Math.PI/2,0,0); g.add(st); B(0.02,0.012,0.04,M.rubber,0,0.02,-0.52);
  // ---- braços divididos (cima e baixo de cada lado), com pivô no pocket para flexionar
  const limbs=[], cams=[];
  for(const sx of [-1,1]){ const piv=new THREE.Group(); piv.position.set(sx*0.07,0.02,-0.43); g.add(piv); limbs.push(piv); }
  limbs.forEach((piv,li)=>{ const sx=li?1:-1; const pts=[[0,0],[0.06,0.012],[0.115,0.035],[0.16,0.068]];
    for(const dy of [-0.013,0.013]) for(let k=0;k<3;k++){ const a=pts[k], b=pts[k+1]; const dx=(b[0]-a[0])*sx, dz=b[1]-a[1], L=Math.hypot(dx,dz); const seg=B(L+0.004,0.007,0.022-k*0.004,M.carbon,(a[0]+b[0])/2*sx,dy,(a[1]+b[1])/2,0,-Math.atan2(dz,dx),0,piv); }
    const tip=new THREE.Group(); tip.position.set(0.16*sx,0,0.068); piv.add(tip);
    const cam=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.024,0.012,18),M.alu); tip.add(cam); const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.007,0.007,0.04,10),M.steel); tip.add(hub);
    for(let i=0;i<5;i++){ const h=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.014,6),M.aluD); const a=i/5*Math.PI*2; h.position.set(Math.cos(a)*0.014,0,Math.sin(a)*0.014); tip.add(h); }
    cams.push(tip); });
  // ---- corda e cabos (cilindros esticados entre pontos a cada quadro)
  const strMat=M.string; const unit=new THREE.CylinderGeometry(0.0017,0.0017,1,5);
  const sL=new THREE.Mesh(unit,strMat), sR=new THREE.Mesh(unit,strMat), c1=new THREE.Mesh(unit,M.cable), c2=new THREE.Mesh(unit,M.cable); g.add(sL,sR,c1,c2);
  const serv=new THREE.Mesh(new THREE.CylinderGeometry(0.0028,0.0028,0.03,6),M.accent); serv.rotation.z=Math.PI/2; g.add(serv);   // servo central da corda
  const latch=B(0.02,0.012,0.016,M.steel,0,0.044,0.0);
  // ---- luneta com retículo aceso
  const sc=new THREE.Group(); sc.position.set(0,0.085,0.01); g.add(sc);
  C(0.016,0.016,0.17,M.aluD,0,0,0,Math.PI/2,0,0,18,sc); C(0.024,0.017,0.045,M.aluD,0,0,-0.1,Math.PI/2,0,0,18,sc); C(0.019,0.016,0.035,M.aluD,0,0,0.095,Math.PI/2,0,0,18,sc);
  C(0.008,0.008,0.024,M.aluD,0,0.022,0,0,0,0,12,sc); C(0.008,0.008,0.024,M.aluD,0.022,0,0,0,0,Math.PI/2,12,sc); C(0.0085,0.0085,0.006,M.accent,0,0.035,0,0,0,0,12,sc);
  const fg=new THREE.Mesh(new THREE.CircleGeometry(0.021,18),M.glass); fg.position.z=-0.123; fg.rotation.y=Math.PI; sc.add(fg);
  const rg=new THREE.Mesh(new THREE.CircleGeometry(0.017,18),M.glass); rg.position.z=0.113; sc.add(rg); const dot=new THREE.Mesh(new THREE.CircleGeometry(0.0016,10),M.reticle); dot.position.z=0.1135; sc.add(dot);
  for(const z of [-0.04,0.05]){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.019,0.004,6,16),M.aluD); r.position.z=z; sc.add(r); B(0.012,0.03,0.012,M.aluD,0,-0.032,z,0,0,0,sc); }
  // ---- aljava lateral com dois virotes de reserva
  const qv=new THREE.Group(); qv.position.set(0.05,-0.02,-0.2); g.add(qv); B(0.012,0.04,0.03,M.aluD,0,0,0.12,0,0,0,qv); B(0.024,0.03,0.05,M.rubber,0.004,0,-0.14,0,0,0,qv);
  for(const dy of [-0.008,0.008]){ const vb=xb2Bolt(M,0.95); vb.position.set(0.01,dy,0); qv.add(vb); }
  // ---- virote carregado
  const bolt=xb2Bolt(M,1); bolt.position.set(0,0.047,-0.2); bolt.name='bolt'; g.add(bolt);
  g.userData={muzzle:-0.52,fore:-0.22,foreY:-0.03,sight:0.085,xbBolt:bolt,xb2:{limbs,cams,sL,sR,c1,c2,serv,latch,bolt,trg}};
  try{ Object.assign(g.userData,gunGeom(g)); }catch(e){}
  g.userData.xbBolt=bolt; g.userData.xb2={limbs,cams,sL,sR,c1,c2,serv,latch,bolt,trg};
  xb2Pose(g,1,0); return g; }
// pose da corda e dos braços: draw 0 = corda solta lá na frente, 1 = armada na trava. vib = vibração depois do tiro
const _xbA=new THREE.Vector3(), _xbB=new THREE.Vector3(), _xbC=new THREE.Vector3(), _xbD=new THREE.Vector3();
function xb2Pose(g,draw,vib){ const X=g.userData.xb2; if(!X) return; const t=performance.now()/1000;
  const flex=0.12+draw*0.38+Math.sin(t*90)*vib*0.06;
  X.limbs[0].rotation.y=flex; X.limbs[1].rotation.y=-flex;
  for(const c of X.cams) c.rotation.y=draw*2.4;
  g.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(g.matrixWorld).invert();
  X.cams[0].getWorldPosition(_xbA).applyMatrix4(inv); X.cams[1].getWorldPosition(_xbB).applyMatrix4(inv);
  const nz=lerp(-0.36,0.0,draw)+Math.sin(t*120)*vib*0.006; _xbC.set(0,0.046,nz);
  _xbA.y=0.046; _xbB.y=0.046; _xbA.x-=0.02; _xbB.x+=0.02;
  xb2Line(X.sL,_xbA,_xbC); xb2Line(X.sR,_xbB,_xbC); X.serv.position.copy(_xbC);
  _xbD.set(0.05,0.03,-0.43); xb2Line(X.c1,_xbA.clone().setY(0.03),_xbD); _xbD.set(-0.05,0.012,-0.43); xb2Line(X.c2,_xbB.clone().setY(0.012),_xbD); }
// troca o modelo antigo pelo novo (e a recarga fica com tempo para a animação inteira)
xbowBuild=function(tier){ return xb2Build(tier); };
WEAPONS.xbow.reload=1.8;
/* ---- animação na primeira pessoa ---- */
v9On('fire',(s)=>{ if(s.id!=='xbow') return; const A=XB2.anim; A.snap=1; A.vib=1; A.draw=0; A.latch=false; A.clicks=0; });
V9VM.push(dt=>{ const s=curSlot(); if(!s||s.id!=='xbow'||!gunModel||!gunModel.userData.xb2) return; const A=XB2.anim, g=gunModel, X=g.userData.xb2, st=wstat(s);
  A.vib=Math.max(0,A.vib-dt*3.2);
  let pose=0, boltK=s.mag>0?1:0, boltSlide=0;
  if(Wp.reloading){ const p=clamp(1-Wp.reloadT/Math.max(0.05,st.reload),0,1);
    pose=p<0.12?p/0.12:p>0.9?(1-p)/0.1:1;                                   // inclina a arma durante a recarga
    const d=clamp((p-0.15)/0.45,0,1); A.draw=d*d*(3-2*d);                    // puxa a corda
    const ck=Math.floor(d*7); if(ck>A.clicks&&d<1){ A.clicks=ck; try{ const o=Snd.out(0.35,0.2,0.05,null); if(o) Snd.burstTo(o,{type:'bandpass',freq:3200,q:7,dur:0.012,gain:0.7}); }catch(e){} }
    if(d>=1&&!A.latch){ A.latch=true; try{ Snd.sample('dry_fire',{vol:0.55,prio:true,rate:1.2}); }catch(e){} }
    if(p>0.62){ const k=clamp((p-0.62)/0.26,0,1); boltK=1; boltSlide=1-(k*k*(3-2*k)); } else boltK=0; }
  else { if(s.mag>0) A.draw=Math.min(1,A.draw+dt*8); A.clicks=0; A.latch=s.mag>0; }
  if(A.snap>0){ A.snap=Math.max(0,A.snap-dt*20); A.draw=0; }
  xb2Pose(g,A.draw,A.vib);
  X.bolt.visible=boltK>0; X.bolt.position.set(0.035*boltSlide,0.047+0.03*boltSlide,-0.2+0.26*boltSlide); X.bolt.rotation.z=boltSlide*1.2;
  X.trg.rotation.z=Math.PI*0.9+(A.snap>0.5?0.25:0);
  if(pose>0){ const e=pose*pose*(3-2*pose); vmRoot.rotation.x+=0.32*e; vmRoot.rotation.z+=0.5*e; vmRoot.rotation.y-=0.18*e; vmRoot.position.y-=0.045*e; vmRoot.position.x-=0.02*e; } });
// o 10_xbow.js antigo controlava a visibilidade do virote; agora quem manda é a animação nova
v9On('always',()=>{ const s=curSlot(); if(s&&s.id==='xbow'&&gunModel&&gunModel.userData.xb2){ const X=gunModel.userData.xb2; const A=XB2.anim; if(Wp.reloading) return; X.bolt.visible=s.mag>0; } });
