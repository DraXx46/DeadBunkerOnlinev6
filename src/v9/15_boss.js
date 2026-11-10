/* ================= v9 · CHEFE DA CIDADE: O MUTANTE ÁCIDO (~4,5 m, bolhas de ácido nas costas) =================
   - Escudo: só tiros nas COSTAS gastam o escudo (de frente ele quase não sente). As bolhas estouram conforme o escudo cai.
   - Sozinho: qualquer tiro enche a barra de atordoamento; cheia, ele cai de cara no chão por alguns segundos — hora de atirar nas costas.
   - Sem escudo: tiro nas costas vale o DOBRO do tiro na cabeça, mas estoura bolhas que espalham ácido no chão.
   - Ataques: pancada no chão (área), cuspe de ácido de longe, investida. Entrada com câmera cinematográfica para todos. */
function megaBody(z,rng){
  buildZTex(); const si=Math.floor(rng()*SKIN_PAL.length);
  const skin=new THREE.MeshPhongMaterial({map:ZT.skins[si],color:0x8a7a70,shininess:30,specular:0x332a22}), face=new THREE.MeshPhongMaterial({map:ZT.faces[si],color:0x9a8a80,shininess:30}), pants=new THREE.MeshPhongMaterial({map:ZT.pants.worker,color:0x5a5a50,shininess:6}),
    acid=new THREE.MeshPhongMaterial({color:0x8aff2a,emissive:0x3a8a00,shininess:140,specular:0xffffff,transparent:true,opacity:0.88}), bone=zx().bone, gore=ZT.gore;
  z.mats=[skin,face,pants,acid]; const mesh=(geo,mat,par,x,y,zz,sx,sy,sz)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x||0,y||0,zz||0); if(sx) m.scale.set(sx,sy||sx,sz||sx); par.add(m); return m; };
  const g=new THREE.Group(); g.rotation.order='YXZ'; const hips=new THREE.Group(); hips.position.y=0.95; g.add(hips); const hipM=mesh(ZG.hips,pants,hips,0,0,0,1.15,1,1.1);
  const mkLeg=sx=>{ const th=new THREE.Group(); th.position.set(sx*.11,-.04,0); hips.add(th); const a=mesh(ZG.thigh,pants,th,0,0,0,1.25,1,1.25); const kn=new THREE.Group(); kn.position.y=-.44; th.add(kn); mesh(ZG.knee,skin,kn); const b=mesh(ZG.shin,skin,kn,0,0,0,1.15,1,1.15);
    const ft=mesh(new THREE.BoxGeometry(.13,.07,.28),skin,kn,0,-.45,.05); for(let i=0;i<3;i++){ const c=mesh(new THREE.ConeGeometry(.018,.07,5),bone,kn,-.04+i*.04,-.45,.2); c.rotation.x=Math.PI/2; } return {th,kn,meshes:[a,b]}; };
  const legL=mkLeg(-1), legR=mkLeg(1);
  const spine=new THREE.Group(); spine.position.y=.06; hips.add(spine);
  const torso=mesh(ZG.torso,skin,spine,0,0,0,1.35,1.08,.9); const chest=mesh(ZG.chest,skin,spine,0,.56,0,1.4,.55,.95);
  for(let i=0;i<5;i++){ const rb=mesh(zx().ribG,bone,spine,0,.22+i*.07,.12,1.2,1.2,1); rb.rotation.x=Math.PI/2+0.3; }
  const neckP=new THREE.Group(); neckP.position.set(0,.6,.08); spine.add(neckP); mesh(ZG.neck,skin,neckP,0,0,0,1.4,1,1.4);
  const headP=new THREE.Group(); headP.position.y=.05; neckP.add(headP); const headM=mesh(ZG.head,face,headP,0,0,0,1.0,1.18,1.1);
  for(const sx of [-1,1]){ const e=mesh(ZG.eye,new THREE.MeshBasicMaterial({color:0xff3010,fog:false}),headP,sx*.04,.17,.13); e.scale.setScalar(1.3); }
  const jawP=new THREE.Group(); jawP.position.set(0,.085,.02); headP.add(jawP); mesh(ZG.jaw,skin,jawP,0,0,0,1.3,1.4,1.2); const te=mesh(ZG.teeth,ZT.teeth,jawP,0,.004,.085); te.scale.set(1.3,2,1);
  for(let i=0;i<6;i++){ const d=mesh(new THREE.CylinderGeometry(.006,.003,rand(.08,.18),4),acid,jawP,rand(-.04,.04),-.06,.08); }
  // bolhas de ácido nas costas e nos ombros (estouram com o escudo)
  z.bubbles=[]; for(let i=0;i<26;i++){ const a=rand(-1.3,1.3), y=rand(.25,.72), r=rand(.05,.11); const b=mesh(new THREE.SphereGeometry(r,10,8),acid,spine,Math.sin(a)*.2,y,-Math.cos(a)*.13-.04); z.bubbles.push(b); }
  for(let i=0;i<8;i++){ const sx=i%2?1:-1; const b=mesh(new THREE.SphereGeometry(rand(.05,.09),10,8),acid,spine,sx*rand(.2,.3),rand(.55,.68),rand(-.08,.02)); z.bubbles.push(b); }
  const mkArm=sx=>{ const sh=new THREE.Group(); sh.position.set(sx*.3,.52,0); spine.add(sh); mesh(ZG.shoulder,skin,sh,0,0,0,1.5,1.5,1.5); const ua=mesh(ZG.uarm,skin,sh,0,0,0,1.5,1.3,1.5); const el=new THREE.Group(); el.position.y=-.39; sh.add(el);
    mesh(ZG.elbow,skin,el,0,0,0,1.4,1.4,1.4); const fa=mesh(ZG.farm,skin,el,0,0,0,1.5,1.45,1.5); const hand=new THREE.Group(); hand.position.y=-.4; el.add(hand); const palm=mesh(ZG.palm,skin,hand,0,0,0,1.6,1.4,1.6);
    for(let i=0;i<4;i++){ const f=mesh(ZG.finger,skin,hand,-.036+i*.024,-.11,0,1.4,1.8,1.4); f.rotation.x=-0.5; const cl=mesh(new THREE.ConeGeometry(.012,.05,5),bone,f,0,-.07,0); cl.rotation.x=Math.PI; } return {sh,el,meshes:[ua,fa,palm]}; };
  const armL=mkArm(-1), armR=mkArm(1);
  g.scale.setScalar(2.35);
  Object.assign(z,{g,hips,spine,neckP,headP,jawP,legL,legR,armL,armR,head:headP,torso,headM});
  const tag=(m,part)=>{ m.userData={z,part}; }; tag(headM,'head'); tag(torso,'body'); tag(chest,'body'); tag(hipM,'body'); for(const a of [armL,armR]) for(const m of a.meshes) tag(m,'body'); for(const l of [legL,legR]) for(const m of l.meshes) tag(m,'legs');
  z.hit=[headM,torso,chest,hipM,...armL.meshes,...armR.meshes,...legL.meshes,...legR.meshes];
  const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x7aff30,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.3})); aura.scale.set(1.4,1.8,1); aura.position.y=1.0; g.add(aura); z.aura=aura;
  const root=new THREE.Group(); root.add(g); z.root=root; scene.add(root); zSkin(z);
}
function megaSpawn(){ if(CITY.boss) return; const x=cx(23.5), zz=cx(czr(31));
  const z=makeZombie({x,z:zz,kind:'mega',boss:false}); z.state='inside'; z.mega=true; z.name='O Mutante Ácido'; const np=1+TG.filter(t=>!t.local).length;
  z.hp=z.maxHp=Math.max(30000,teamPower()*55)*(1+0.7*(np-1)); z.maxShield=z.shield=z.maxHp*0.45; z.speed=1.55*V9DIFF.spd; z.zdmg=80; z.stag=0; z.downT=0; z.cd1=3; z.cd2=6; z.cd3=10; z.yaw=Math.PI;
  CITY.boss=z; CITY.bossSt=1; pushEv(['mgi',r10(x),r10(zz)]); megaIntro(x,zz); updateMissionHud(); }
v9On('roundStart',r=>{ if(CUR==='city'&&r===4&&NET.mode!=='client'&&!CITY.boss) setTimeout(megaSpawn,2500); });
V9NET.ev.mgi=e=>megaIntro(e[2]/10,e[3]/10);
/* ---- entrada: câmera em volta dele, faixas de cinema, nome na tela ---- */
function megaIntro(x,z){ CITY.cam={x,z,t:0,dur:5.2}; const wasGod=CHEAT.god; CHEAT.god=true; setTimeout(()=>{ CHEAT.god=wasGod; },5400);
  document.body.classList.add('cine'); try{ Snd.sample('boss_roar',{vol:1.4,prio:true}); Snd.distant(x,z); }catch(e){} shake(0.8);
  const card=v9El('div','megacard',`<small>CHEFE</small><b>O MUTANTE ÁCIDO</b><span>Atire nas costas para quebrar o escudo</span>`); document.body.appendChild(card); setTimeout(()=>card.classList.add('on'),900); setTimeout(()=>{ card.classList.remove('on'); setTimeout(()=>card.remove(),800); },4600);
  setTimeout(()=>{ document.body.classList.remove('cine'); CITY.cam=null; },5200); setTimeout(()=>{ try{ Snd.sample('boss_roar',{vol:1.1,rate:0.85,prio:true}); }catch(e){} shake(0.6); },2600); }
function v9Cam(dt){ const C=CITY.cam; if(!C) return; C.t+=dt; const k=C.t/C.dur; const a=-Math.PI/2+k*2.2, r=lerp(14,8,k), y=lerp(1.2,4.5,Math.sin(k*Math.PI));
  camera.position.set(C.x+Math.cos(a)*r,floorAt(C.x,C.z)+y,C.z+Math.sin(a)*r); camera.lookAt(C.x,floorAt(C.x,C.z)+3.2+Math.sin(k*6)*0.2,C.z); }
v9Css(`.megacard{position:fixed;left:50%;top:70%;transform:translate(-50%,-50%) scale(1.3);z-index:62;text-align:center;opacity:0;transition:all .8s cubic-bezier(.2,1,.3,1);pointer-events:none}.megacard.on{opacity:1;transform:translate(-50%,-50%)}
.megacard small{display:block;font:13px "Special Elite",monospace;letter-spacing:.5em;color:#9aff4a}.megacard b{display:block;font:700 72px/1 "Stardos Stencil",Impact;letter-spacing:.08em;color:#e8f8d0;text-shadow:0 0 30px #5aff1a,0 4px 0 #000}.megacard span{font:14px "Special Elite",monospace;color:#c8d8b8}`);
/* ---- dano: costas, escudo, atordoamento ---- */
function megaBack(z,dir){ if(z.downT>0) return true; const fx=Math.sin(z.yaw), fz=Math.cos(z.yaw); return (dir.x*fx+dir.z*fz)>0.25; }
const _v9bp=v9BulletPre;
v9BulletPre=function(z,part,pt,dir,s,d){ let k=_v9bp(z,part,pt,dir,s,d); if(z.kind!=='mega'||!dir) return k;
  const base=d.dmg*(d.pellets?0.6:1); const back=megaBack(z,dir); const solo=!NET.mode;
  if(solo&&!(z.downT>0)) z.stag=(z.stag||0)+base;
  const sh=NET.mode==='client'?(CITY.info?CITY.info[3]:0):z.shield;
  if(sh>0){ if(back){ megaShield(z,base); return k*0.15; } return k*0.06; }
  if(back){ if(Math.random()<0.35&&pt) megaAcid(pt.x,pt.z); megaPop(z,1); return k*2*(d.head||2.5); }
  return k*(part==='head'?1:0.6); };
function megaShield(z,dmg){ if(NET.mode==='client'){ netAct(['msh',z.id,Math.round(dmg)]); return; } if(!(z.shield>0)) return; z.shield=Math.max(0,z.shield-dmg);
  const want=Math.ceil(z.bubbles.length*z.shield/z.maxShield); const vis=z.bubbles.filter(b=>b.visible).length; if(vis>want) megaPop(z,vis-want);
  try{ Snd.sample('shield_hit',{x:z.pos.x,z:z.pos.z,range:40,vol:0.6}); }catch(e){}
  if(z.shield<=0){ banner('O ESCUDO QUEBROU!','Agora tiro nas costas vale o dobro de um tiro na cabeça — cuidado com o ácido','gold'); try{ Snd.sample('shield_break',{vol:1.2,prio:true}); }catch(e){} v9Flash('#9aff4a',0.35,0.7); pushEv(['mgb']); } }
V9NET.act.msh=(peer,a)=>{ const z=zombies.find(q=>q.id===a[2]); if(z&&z.kind==='mega') megaShield(z,clamp(+a[3]||0,0,1e6)); };
V9NET.ev.mgb=()=>{ banner('O ESCUDO QUEBROU!','Agora tiro nas costas vale o dobro de um tiro na cabeça — cuidado com o ácido','gold'); try{ Snd.sample('shield_break',{vol:1.2,prio:true}); }catch(e){} };
function megaPop(z,n){ if(!z.bubbles) return; for(let i=0;i<n;i++){ const b=z.bubbles.find(q=>q.visible); if(!b) return; b.visible=false; const p=new THREE.Vector3(); b.getWorldPosition(p); emit('green',p.x,p.y,p.z,10,3,0.7,6); } try{ Snd.sample('acid_sizzle',{x:z.pos.x,z:z.pos.z,range:35,vol:0.6}); }catch(e){} }
let megaAcidT=0; function megaAcid(x,z){ if(G.t-megaAcidT<0.6) return; megaAcidT=G.t; if(NET.mode==='client') return; pushEv(['acid',r10(x),r10(z)]); acidPool(x,z,true); }
/* ---- comportamento (anfitrião) ---- */
v9On('frame',dt=>{ const z=CITY.boss; if(!z||NET.mode==='client') return; if(z.dead){ if(CITY.bossSt===1) megaDown(); return; }
  if(CITY.cam){ z.stagT=Math.max(z.stagT||0,0.3); return; }
  // atordoamento solo: cai de cara no chão por 6 s
  if(!NET.mode&&!(z.downT>0)&&(z.stag||0)>z.maxHp*0.07){ z.stag=0; z.downT=6; banner('ELE CAIU!','Rápido: atire nas costas dele!','gold'); shake(0.6); try{ Snd.distant(z.pos.x,z.pos.z); }catch(e){} emit('dust',z.pos.x,0.3,z.pos.z,30,3,1.2,-0.5); }
  if(z.downT>0){ z.downT-=dt; z.stagT=Math.max(z.stagT||0,0.2); z.moving=false; z.attackT=0; z.g.rotation.x=lerp(z.g.rotation.x,1.35,dt*5); if(z.downT<=0){ z.stag=0; } return; }
  z.g.rotation.x=lerp(z.g.rotation.x,0,dt*4);
  const T=nearestTarget(z.pos.x,z.pos.z); if(!T) return; const d=Math.hypot(T.x-z.pos.x,T.z-z.pos.z);
  z.cd1-=dt; z.cd2-=dt; z.cd3-=dt;
  if(z.slamT>0){ z.slamT-=dt; z.stagT=0.1; if(z.slamT<=0){ pushEv(['bx','slam',r10(z.pos.x),r10(z.pos.z)]); bossFx('slam',z.pos.x,z.pos.z); for(const t of playersNear(z.pos.x,z.pos.z,4.6)) hurtTarget(t,70,z); } return; }
  if(z.cd1<=0&&d<4.2){ z.cd1=rand(3,4.5); z.slamT=0.75; z.attackT=0.01; try{ Snd.sample('boss_roar',{x:z.pos.x,z:z.pos.z,range:60,vol:0.7,rate:1.2}); }catch(e){} return; }
  if(z.cd2<=0&&d>5&&d<28&&losClear(z.pos,T)){ z.cd2=rand(5,7); const tx=T.x+rand(-1,1), tz=T.z+rand(-1,1); pushEv(['mgs',r10(z.pos.x),r10(z.pos.z),r10(tx),r10(tz)]); megaSpit(z.pos.x,z.pos.z,tx,tz,true); }
  if(z.cd3<=0&&d>6&&d<18){ z.cd3=rand(9,12); z.speed*=2.6; setTimeout(()=>{ if(!z.dead) z.speed/=2.6; },1400); try{ Snd.sample('boss_roar',{x:z.pos.x,z:z.pos.z,range:60,vol:0.9}); }catch(e){} }
  if(Math.random()<dt*0.6&&z.bubbles&&z.shield<=0) megaAcid(z.pos.x+rand(-1.5,1.5),z.pos.z+rand(-1.5,1.5));
});
V9NET.ev.mgs=e=>megaSpit(e[2]/10,e[3]/10,e[4]/10,e[5]/10,false);
const MSP=[];
function megaSpit(x0,z0,x1,z1,real){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.3,10,8),new THREE.MeshBasicMaterial({color:0x9aff3a})); const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x7aff20,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false})); gl.scale.set(1.6,1.6,1); m.add(gl); scene.add(m);
  MSP.push({m,x0,z0,x1,z1,t:0,dur:1.1,real}); try{ Snd.sample('acid_sizzle',{x:x0,z:z0,range:40,vol:0.8}); }catch(e){} }
v9On('always',dt=>{ for(let i=MSP.length-1;i>=0;i--){ const f=MSP[i]; f.t+=dt; const k=Math.min(1,f.t/f.dur); const x=lerp(f.x0,f.x1,k), zz=lerp(f.z0,f.z1,k); f.m.position.set(x,floorAt(x,zz)+4.2*(1-k)+Math.sin(k*Math.PI)*3,zz);
    if(Math.random()<0.5) emit('green',x,f.m.position.y,zz,1,0.5,0.4,4);
    if(k>=1){ scene.remove(f.m); MSP.splice(i,1); explodeFx({x:f.x1,y:0.3,z:f.z1},2.2,0x7aff30); acidPool(f.x1,f.z1,f.real); if(f.real) for(const T of playersNear(f.x1,f.z1,2.2)) hurtTarget(T,35,null); } }
  // bolhas pulsando e escorrendo ácido
  for(const z of zlist()){ if(z.kind!=='mega'||!z.bubbles) continue; for(let i=0;i<z.bubbles.length;i++){ const b=z.bubbles[i]; if(!b.visible) continue; const s=1+Math.sin(G.t*3+i)*0.08; b.scale.setScalar(s); } if(z.aura) z.aura.material.opacity=0.2+Math.sin(G.t*4)*0.1; } });
function megaDown(){ CITY.bossSt=2; const z=CITY.boss; banner('O MUTANTE ÁCIDO CAIU','+5.000 pontos para todos · uma relíquia e uma caixa','gold'); addPoints(5000,true); addDrax(150); try{ relicSpawn(pick(RK),z.pos.x,z.pos.z); v9GiveReward((G.round|0)+20); Snd.ui('levelup'); }catch(e){} pushEv(['mgd']); updateMissionHud(); }
V9NET.ev.mgd=()=>{ if(CITY.bossSt!==2){ CITY.bossSt=2; banner('O MUTANTE ÁCIDO CAIU','+5.000 pontos para todos','gold'); addPoints(5000,true); addDrax(150); try{ v9GiveReward((G.round|0)+20); }catch(e){} updateMissionHud(); } };
/* ---- barra do chefe (vida + escudo) ---- */
let MHUD=null;
v9On('always',()=>{ let info=null; if(CUR==='city'&&(G.state==='playing'||G.state==='paused')){ if(NET.mode==='client'){ const v=CITY.info; if(v&&v[0]===1&&v[2]>0) info=v.slice(1); } else { const z=CITY.boss; if(z&&!z.dead) info=[z.hp,z.maxHp,z.shield,z.maxShield,z.downT>0?1:0]; } }
  if(!MHUD){ MHUD=v9El('div','megabar','<b>O MUTANTE ÁCIDO</b><div class="mb-hp"><i></i></div><div class="mb-sh"><i></i></div><small></small>'); document.body.appendChild(MHUD); }
  MHUD.hidden=!info; if(!info) return; MHUD.querySelector('.mb-hp i').style.transform=`scaleX(${clamp(info[0]/Math.max(1,info[1]),0,1).toFixed(3)})`; MHUD.querySelector('.mb-sh i').style.transform=`scaleX(${clamp(info[2]/Math.max(1,info[3]),0,1).toFixed(3)})`;
  MHUD.querySelector('small').textContent=info[4]?'CAÍDO — ATIRE NAS COSTAS!':info[2]>0?'Escudo ativo: só tiros nas costas quebram':'Sem escudo: costas = dano dobrado de cabeça'; });
v9Css(`.megabar{position:fixed;left:50%;top:18px;transform:translateX(-50%);width:min(560px,70vw);z-index:8;text-align:center;pointer-events:none}.megabar b{font:700 20px "Stardos Stencil",Impact;letter-spacing:.12em;color:#d8ffb0;text-shadow:0 0 12px #5aff1a}
.megabar .mb-hp,.megabar .mb-sh{height:12px;background:#120a08;border:1px solid #3a4a22;margin-top:4px;overflow:hidden}.megabar .mb-sh{height:6px;border-color:#22445a}.megabar i{display:block;height:100%;transform-origin:left;background:linear-gradient(90deg,#6aff2a,#c8ff6a)}.megabar .mb-sh i{background:linear-gradient(90deg,#3aa8ff,#9ad8ff)}.megabar small{font:11px "Special Elite",monospace;color:#c8d8b8}`);
