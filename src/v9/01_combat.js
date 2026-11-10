/* ================= v9 · COMBATE: capacete, sangue na parede, Doom no nível máximo, Barrett de ferrolho ================= */

/* ---- capacete: o primeiro tiro na cabeça arranca o capacete (barulho de bala no metal) e quase não fere ---- */
function v9HelmetOf(z){ if(z._helm!==undefined) return z._helm; let h=null; try{ z.headP&&z.headP.traverse(o=>{ if(!h&&o.isMesh&&o.geometry===ZG.helmet) h=o; }); }catch(e){} let b=null; if(h) z.headP.traverse(o=>{ if(!b&&o.isMesh&&o.geometry===ZG.brim) b=o; }); z._helm=h?{h,b,on:true}:null; return z._helm; }
function v9PopHelmet(z,dir,pt){
  const H=v9HelmetOf(z); if(!H||!H.on) return false; H.on=false; H.h.visible=false; if(H.b) H.b.visible=false;
  // o capacete voa girando (cópia solta no mundo)
  const g=new THREE.Group(); const m1=new THREE.Mesh(ZG.helmet,ZT.helmet); m1.scale.set(1,.9,1.06); g.add(m1); const m2=new THREE.Mesh(ZG.brim,ZT.helmet); g.add(m2);
  const hp=new THREE.Vector3(); H.h.getWorldPosition(hp); g.position.copy(hp); g.scale.setScalar((z.g&&z.g.scale.x)||1); scene.add(g);
  const dx=dir?dir.x:0, dz=dir?dir.z:0; debris.push({g,t:0,vx:dx*3.2+rand(-1,1),vy:rand(3,4.6),vz:dz*3.2+rand(-1,1),y0:floorAt(hp.x,hp.z)+0.08,rx:Math.PI*rand(0.4,1)});
  emit('spark',hp.x,hp.y+0.1,hp.z,10,4.5,0.35,6);
  if(!Snd.sample('helmet_ping',{x:hp.x,z:hp.z,range:45,vol:1.1,prio:true,wet:0.35})){ try{ Snd.impact('metal',hp.x,hp.z,1.4); Snd.ping(); }catch(e){} }
  return true; }
/* multiplicador de dano de cada bala, antes de aplicar (capacete, congelado...) */
function v9BulletPre(z,part,pt,dir,s,d){ let k=1;
  if(part==='head'){ const H=v9HelmetOf(z); if(H&&H.on){ v9PopHelmet(z,dir,pt); k*=0.25; } }
  if(z.frozenT>0) k*=1.25;
  return k; }
// do anfitrião: quando um convidado acerta a cabeça, o capacete também cai aqui
function v9HostHelmet(z,part,dx,dz){ if(part==='head'&&NET.mode==='host'){ const H=v9HelmetOf(z); if(H&&H.on) v9PopHelmet(z,new THREE.Vector3(dx,0,dz).normalize()); } }

/* ---- sangue na parede: acerto perto de uma parede espirra sangue nela ---- */
let V9BLOOD=null;
function v9BloodTex(i){ return tex(128,128,(g,w,h)=>{ g.clearRect(0,0,w,h); const cx0=w/2, cy0=h*0.42; g.fillStyle='rgba(78,6,4,0.92)';
  g.beginPath(); g.ellipse(cx0,cy0,rand(16,26),rand(12,22),rand(0,3),0,Math.PI*2); g.fill();
  for(let k=0;k<26;k++){ const a=rand(0,6.28), r=rand(10,56); g.beginPath(); g.arc(cx0+Math.cos(a)*r,cy0+Math.sin(a)*r*0.8,rand(1,5)*(1-r/70),0,Math.PI*2); g.fill(); }
  for(let k=0;k<5;k++){ const a=rand(-0.9,0.9), L=rand(18,48); g.save(); g.translate(cx0,cy0); g.rotate(a); g.fillRect(-1.5,0,3,L); g.beginPath(); g.arc(0,L,2.6,0,Math.PI*2); g.fill(); g.restore(); }
  for(let k=0;k<3;k++){ const x=cx0+rand(-18,18); g.fillRect(x,cy0,rand(2,3.5),rand(20,60)); } }); }
function v9WallBlood(p,nx,ny,nz){
  if(!V9BLOOD){ V9BLOOD={list:[],i:0,mats:[0,1,2,3].map(i=>new THREE.MeshPhongMaterial({map:v9BloodTex(i),transparent:true,depthWrite:false,shininess:70,specular:0x330000,polygonOffset:true,polygonOffsetFactor:-3}))}; }
  let d=V9BLOOD.list.length<48?null:V9BLOOD.list[V9BLOOD.i%48]; V9BLOOD.i++;
  if(!d){ d={m:new THREE.Mesh(new THREE.PlaneGeometry(1,1),pick(V9BLOOD.mats)),t:0}; scene.add(d.m); V9BLOOD.list.push(d); }
  d.m.visible=true; d.t=0; d.m.material=pick(V9BLOOD.mats); d.m.material.opacity=0.95;
  d.m.position.set(p.x+nx*0.012,p.y+ny*0.012,p.z+nz*0.012); d.m.lookAt(p.x+nx,p.y+ny,p.z+nz); d.m.rotateZ(rand(-0.5,0.5)+(Math.abs(ny)>0.6?rand(0,6.28):0));
  const s=rand(0.45,0.95); d.m.scale.set(s,s*rand(1,1.35),1); d.s=s; }
v9On('hit',(z,part,pt,dir,dmg)=>{
  if(!pt||!dir||CFG.gore===false) return; if(Math.random()>(part==='head'?0.9:0.6)) return;
  const o=pt.clone().addScaledVector(dir,0.05); const t=rayWall(o,dir,2.6);
  if(t<2.6&&RH.kind!=='none'){ const p=o.addScaledVector(dir,t); v9WallBlood(p,RH.nx||-dir.x,RH.ny||0,RH.nz||-dir.z); if(Math.random()<0.4){ const p2=p.clone(); p2.y+=rand(-0.35,0.35); v9WallBlood(p2,RH.nx||-dir.x,RH.ny||0,RH.nz||-dir.z); } }
});
v9On('always',dt=>{ if(!V9BLOOD) return; for(const d of V9BLOOD.list){ if(!d.m.visible) continue; d.t+=dt; if(d.t<0.25) d.m.scale.y=d.s*(1+d.t*0.6); if(d.t>45){ d.m.material.opacity=Math.max(0,0.95-(d.t-45)/8); if(d.t>53) d.m.visible=false; } } });
v9On('reset',()=>{ if(V9BLOOD) for(const d of V9BLOOD.list) d.m.visible=false; });

/* ---- Doom (AA-12 pixelada) no nível máximo: cada tiro é uma onda que atinge quase todos os zumbis na tela ---- */
const _v9v=new THREE.Vector3();
v9On('fire',(s,d)=>{
  if(s.id!=='doom'||(s.lvl|0)<MAXLV||NET.mode==='client'&&false) return;
  const dmg=d.dmg*(d.pellets||1)*0.55; let n=0;
  const camP=camera.position; flashScreen(); shake(0.55); v9Flash('#ff6a10',0.35,0.5);
  for(const z of zlist()){ if(z.dead||z.predDead||z.state==='rise') continue;
    _v9v.set(z.pos.x,zy(z)+1.1,z.pos.z); const dd=_v9v.distanceTo(camP); if(dd>55) continue;
    if(!ZFR.containsPoint(_v9v)) continue;                 // está na tela
    n++; const k=Math.max(0.35,1-dd/70);
    setTimeout(()=>{ if(z.dead||z.predDead) return; emit('fire',z.pos.x,zy(z)+1.1,z.pos.z,10,3,0.6,2); fireball(z.pos.x,zy(z)+1.1,z.pos.z,1.1,0xff6a10);
      zHitReact(z,z.pos.x-P.pos.x,z.pos.z-P.pos.z,dmg*0.5,'body','splash'); const kill=applyHit(z,dmg*k*(isBossZ(z)?0.35:1),'body','splash',null); if(kill) hitmarker(true,false); },Math.min(420,dd*9));
  }
  if(n) try{ Snd.boom(P.pos.x-Math.sin(P.yaw)*6,P.pos.z-Math.cos(P.yaw)*6); }catch(e){}
});

/* ---- Barrett M107: luneta abre devagar (anel que se expande), um tiro por vez: atira → sai da mira → puxa o ferrolho → só então atira de novo ---- */
WEAPONS.ptrs.dmg=1900; WEAPONS.ptrs.head=4.5; WEAPONS.ptrs.rpm=60; WEAPONS.ptrs.pen=8; WEAPONS.ptrs.boltCycle=1.25;
const V9B={cyc:0,open:0};
v9On('fire',(s,d)=>{ if(s.id!=='ptrs') return; V9B.cyc=d.boltCycle||1.25; V9B.snd=0; IN.ads=false; Wp.fireCd=Math.max(Wp.fireCd,V9B.cyc); });
v9On('frame',dt=>{
  const s=curSlot(); if(V9B.cyc>0){ V9B.cyc-=dt; IN.ads=false;
    if(s&&s.id==='ptrs'){ const k=1-V9B.cyc/1.25; if(k>0.18&&V9B.snd===0){ V9B.snd=1; try{ Snd.rl('boltUp'); }catch(e){} } if(k>0.34&&V9B.snd===1){ V9B.snd=2; try{ Snd.rl('boltBack'); Snd.casing(false); }catch(e){} } if(k>0.62&&V9B.snd===2){ V9B.snd=3; try{ Snd.rl('boltFwd'); }catch(e){} } if(k>0.8&&V9B.snd===3){ V9B.snd=4; try{ Snd.rl('boltDown'); }catch(e){} } } }
  // abertura lenta da luneta: a mira só "entra" quando o anel termina de abrir
  const scoping=!!(s&&s.id==='ptrs'&&IN.ads&&!busy()&&!Wp.reloading&&V9B.cyc<=0&&P.ads>0.5);
  V9B.open=scoping?Math.min(1,V9B.open+dt/0.6):0;
  const el=document.getElementById('scope'); if(el) el.style.setProperty('--v9open',(s&&s.id==='ptrs'?V9B.open:1).toFixed(3));
});
function v9ScopeReady(s){ return !(s&&s.id==='ptrs')||(V9B.cyc<=0&&V9B.open>=0.98); }
function v9AdsBlocked(s){ return !!(s&&s.id==='ptrs'&&V9B.cyc>0); }
/* animações extras do braço/arma (somadas depois do rig): ferrolho da Barrett, faca no cachorro, mãos das habilidades */
const V9VM=[]; function v9VmView(dt){ for(const f of V9VM){ try{ f(dt); }catch(e){} } }
V9VM.push(dt=>{ const s=curSlot(); if(V9B.cyc>0&&s&&s.id==='ptrs'){ const k=1-V9B.cyc/1.25, a=Math.sin(Math.min(1,k)*Math.PI); vmRoot.rotation.z+=a*0.32; vmRoot.rotation.x+=a*0.12; vmRoot.position.y-=a*0.035; vmRoot.position.x-=a*0.02; } });
v9Css(`#scope{clip-path:circle(calc(15% + var(--v9open,1) * 75%) at 50% 50%)}`);
