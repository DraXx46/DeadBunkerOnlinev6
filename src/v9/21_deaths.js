/* ================= v9 · MORTES DOS ZUMBIS =================
   Cada causa de morte tem a sua animação (tiros e faca normal continuam com as quedas que já existiam):
   · fogo         — o zumbi se debate em chamas, vai ficando carvão, cai de joelhos e solta fumaça
   · choque       — trava com os braços duros, treme com raios saindo do corpo e cai duro de costas, soltando fumaça
   · explosão     — granada, morteiro e bomba arrebentam o zumbi em pedaços (cabeça, braços, pernas, tripas), muito sangue
   · golpe pesado — finalização: você agarra o zumbi pela cabeça e enterra a faca nela; ele cai de joelhos com sangue jorrando
   Além disso, decapitados jorram sangue do pescoço enquanto caem. */
const DEATH_GIB={grenade:1,splash:1,bomb:1,mortar:1,boom:1,nade:1,rocket:1,explode:1};
function deathCause(z){ if(!z||z.kind==='dog'||isBossZ(z)) return ''; const s=z.lastSrc||'';
  if(z.v9fin) return 'fin';
  if(DEATH_GIB[s]&&!z.crawl) return 'gib';
  if(z.crawl) return '';
  if(s==='burn'||s==='fire'||BURN.has(z)) return 'fire';
  if(s==='zap'||s==='emp'||s==='tesla'||(z.zapT&&G.t-z.zapT<0.4)) return 'elec';
  return ''; }
// guarda a causa antes da morte (no anfitrião e em quem matou); convidados recebem a causa pelo evento 'k'
const _v9kill=killZombie; killZombie=function(z,part,src,shooter,luck){
  try{ if(z&&!z.dead){ z.lastSrc=src; if(src==='knife'&&!shooter&&Wp.kAct==='stab'&&!isBossZ(z)&&z.kind!=='dog'&&!z.crawl&&Math.hypot(z.pos.x-P.pos.x,z.pos.z-P.pos.z)<2.8&&!x1Live()) finStart(z); } }catch(e){}
  return _v9kill.apply(this,arguments); };
const _v9zdp=zDeathPose;
zDeathPose=function(z,dt){
  if(z.dcause===undefined){ z.dcause=deathCause(z); try{ deathBegin(z); }catch(e){ console.warn('[Bunker v9] morte',e); z.dcause=''; } }
  const c=z.dcause;
  try{
    if(c==='gib'){ z.g.visible=false; return; }
    if(c==='fire') return fireDeath(z,dt);
    if(c==='elec') return elecDeath(z,dt);
    if(c==='fin') return finDeath(z,dt);
  }catch(e){ z.dcause=''; }
  if(!z.head.visible&&z.t<1.6&&Math.random()<dt*22){ const y=zy(z)+1.55*Math.max(0.2,1-z.t*0.6); emit('blood',z.pos.x+rand(-.04,.04),y,z.pos.z+rand(-.04,.04),2,2.6,0.7); }   // pescoço jorrando
  return _v9zdp(z,dt); };
// roda a queda padrão a partir de um instante (para as mortes que primeiro se debatem e depois caem)
function fallFrom(z,dt,t0,type){ if(!z.fall){ _v9zdp(z,0); } z.fall.type=type; const tt=z.t; z.t=Math.max(0,tt-t0); try{ _v9zdp(z,dt); }finally{ z.t=tt; } if(tt>3.7) z.g.position.y-=(tt-3.7)*0.7; }
function deathBegin(z){ const c=z.dcause;
  if(c==='gib') gibZombie(z);
  if(c==='fire'){ z.burnT=0; try{ Snd.sample('fire_burst',{vol:0.6,x:z.pos.x,z:z.pos.z,range:30,rate:rand(0.85,1)}); }catch(e){} }
  if(c==='elec'){ z.zapN=0; try{ Snd.sample('elec_zap',{vol:0.8,x:z.pos.x,z:z.pos.z,range:34,rate:rand(0.9,1.1)}); }catch(e){} }
  if(c==='fin'){ z.yaw=Math.atan2(P.pos.x-z.pos.x,P.pos.z-z.pos.z); } }
const _dc=new THREE.Color();
function deathChar(z,k){ if(!z.mats) return; for(const m of z.mats){ if(!m||!m.color) continue; if(!m.userData.v9c0) m.userData.v9c0=m.color.getHex(); _dc.setHex(m.userData.v9c0).lerp(new THREE.Color(0x120c08),k); m.color.copy(_dc); } }
/* ---- fogo ---- */
function fireDeath(z,dt){ const t=z.t, aL=z.armL, aR=z.armR, L=z.legL, R=z.legR;
  const y=zy(z); if(t<2.4&&Math.random()<dt*34) emit('fire',z.pos.x+rand(-.25,.25),y+rand(0.2,1.8),z.pos.z+rand(-.25,.25),1,0.9,0.6,-2.8);
  if(Math.random()<dt*(t<2?6:3)) wPuff(z.pos.x,y+(t<1.7?1.7:0.5),z.pos.z,1,0x2a2622,0.22,1.6,1,0.3);
  deathChar(z,Math.min(0.85,t/2.2)); if(z.mats&&z.mats[2]&&z.mats[2].emissive) z.mats[2].emissive.setHex(t<2.2&&Math.random()<0.5?0x5a1a00:0x200800);
  if(t<1.6){ const k=Math.min(1,t*4);
    z.g.rotation.x=0; z.g.rotation.z=Math.sin(t*6)*0.08; z.g.position.y=0; z.hips.position.y=0.95-Math.abs(Math.sin(t*7))*0.04;
    z.spine.rotation.set(0.15+Math.sin(t*5)*0.25,Math.sin(t*9)*0.35*k,Math.sin(t*7)*0.2);
    z.headP.rotation.set(-0.5+Math.sin(t*13)*0.35,Math.sin(t*11)*0.5,Math.sin(t*8)*0.3);
    aL.sh.rotation.set(-1.9+Math.sin(t*15)*0.7,0.4,-0.6+Math.sin(t*12)*0.5); aR.sh.rotation.set(-1.7+Math.sin(t*14+1)*0.7,-0.4,0.6+Math.sin(t*11)*0.5);
    aL.el.rotation.x=-1.1+Math.sin(t*16)*0.5; aR.el.rotation.x=-1.0+Math.sin(t*17)*0.5;
    L.th.rotation.x=Math.sin(t*9)*0.45; R.th.rotation.x=-Math.sin(t*9)*0.45; L.kn.rotation.x=Math.max(0,Math.sin(t*9))*0.7; R.kn.rotation.x=Math.max(0,-Math.sin(t*9))*0.7;
    z.yaw+=Math.sin(t*3)*dt*2.4; z.pos.x+=Math.sin(z.yaw)*dt*0.5; z.pos.z+=Math.cos(z.yaw)*dt*0.5;
    if(t>0.3&&t<0.33) try{ zvoice(z,'pain',1.2); }catch(e){}
  } else fallFrom(z,dt,1.6,'knees');
  z.g.position.x=z.pos.x; z.g.position.z=z.pos.z; z.g.rotation.y=z.yaw; }
/* ---- choque ---- */
const _ea=new THREE.Vector3(), _eb=new THREE.Vector3();
function elecDeath(z,dt){ const t=z.t, aL=z.armL, aR=z.armR, L=z.legL, R=z.legR, j=()=>rand(-1,1);
  const live=t<1.25, y=zy(z);
  if(z.mats) for(const m of z.mats) if(m&&m.emissive) m.emissive.setHex(live&&Math.random()<0.6?(Math.random()<0.5?0x2a6aff:0x9ad8ff):0x000000);
  if(live){ const J=0.16;
    z.g.rotation.set(j()*0.03,0,j()*0.04); z.g.position.y=Math.abs(j())*0.03; z.hips.position.y=0.95;
    z.spine.rotation.set(-0.35+j()*J,j()*J,j()*J); z.headP.rotation.set(-0.7+j()*0.3,j()*0.4,j()*0.3);
    aL.sh.rotation.set(-0.3+j()*J,0,-1.35+j()*J); aR.sh.rotation.set(-0.3+j()*J,0,1.35+j()*J); aL.el.rotation.x=-0.2+j()*0.3; aR.el.rotation.x=-0.2+j()*0.3;
    L.th.rotation.x=j()*0.1; R.th.rotation.x=j()*0.1; L.kn.rotation.x=0.1+Math.abs(j())*0.2; R.kn.rotation.x=0.1+Math.abs(j())*0.2;
    if(Math.random()<dt*14){ _ea.set(z.pos.x+rand(-.3,.3),y+rand(0.4,1.8),z.pos.z+rand(-.3,.3)); _eb.set(z.pos.x+rand(-1.2,1.2),y+rand(-0.1,1.9),z.pos.z+rand(-1.2,1.2)); try{ arcFx(_ea,_eb); }catch(e){} emit('elec',_ea.x,_ea.y,_ea.z,3,2.4,0.25,1); }
    if(Math.random()<dt*5) try{ Snd.sample('elec_zap',{vol:0.3,x:z.pos.x,z:z.pos.z,range:24,rate:rand(1.2,1.6)}); }catch(e){}
  } else { fallFrom(z,dt,1.25,'back'); aL.sh.rotation.z=-1.2; aR.sh.rotation.z=1.2; if(Math.random()<dt*4) wPuff(z.pos.x,y+0.4,z.pos.z,1,0x3a3a40,0.18,1.4,0.8,0.25); }
  z.g.position.x=z.pos.x; z.g.position.z=z.pos.z; z.g.rotation.y=z.yaw; }
/* ---- explosão: pedaços ---- */
const _gm=new THREE.Vector3(), _gq=new THREE.Quaternion(), _gs=new THREE.Vector3();
function gibPiece(src,z,spd){ if(!src||!src.visible) return; src.updateWorldMatrix(true,true); const c=cloneBare(src); src.matrixWorld.decompose(_gm,_gq,_gs); c.position.copy(_gm); c.quaternion.copy(_gq); c.scale.copy(_gs);
  const g=new THREE.Group(); g.position.copy(_gm); c.position.set(0,0,0); g.add(c); const st=new THREE.Mesh(ZG.stump,ZT.gore); st.scale.setScalar(1.6); g.add(st); scene.add(g);
  const a=Math.atan2(_gm.x-z.blX,_gm.z-z.blZ)+rand(-0.6,0.6); debris.push({g,t:0,vx:Math.sin(a)*spd*rand(0.6,1.2),vy:rand(3.5,7.5),vz:Math.cos(a)*spd*rand(0.6,1.2),y0:floorAt(_gm.x,_gm.z)+0.08,rx:rand(-1.6,1.6)}); }
function gibChunk(z,x,y,zz,s){ const g=new THREE.Group(); g.position.set(x,y,zz); const m=new THREE.Mesh(new THREE.DodecahedronGeometry(0.09*s,1),ZT.gore); m.scale.set(1,rand(0.5,1),rand(0.7,1.3)); g.add(m);
  if(Math.random()<0.4){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.07*s,0.018*s,5,10,Math.PI),ZT.gore); r.position.y=0.05; g.add(r); } scene.add(g);
  const a=rand(0,6.28), sp=rand(2,6); debris.push({g,t:0,vx:Math.sin(a)*sp,vy:rand(2,8),vz:Math.cos(a)*sp,y0:floorAt(x,zz)+0.04,rx:rand(-2,2)}); }
function gibZombie(z){ const y=zy(z), x=z.pos.x, zz=z.pos.z; z.blX=x-rand(-0.3,0.3); z.blZ=zz-rand(-0.3,0.3);
  // o corpo some e voam os pedaços: cabeça, braços, pernas, tronco e tripas
  gibPiece(z.headP,z,4.5); gibPiece(z.armL&&z.armL.sh,z,5); gibPiece(z.armR&&z.armR.sh,z,5); gibPiece(z.legL&&z.legL.th,z,3.5); gibPiece(z.legR&&z.legR.th,z,3.5);
  for(let i=0;i<7;i++) gibChunk(z,x+rand(-.2,.2),y+rand(0.6,1.5),zz+rand(-.2,.2),rand(0.8,1.6));
  z.g.visible=false;
  emit('gore',x,y+1.1,zz,26,6,1.4); emit('blood',x,y+1.1,zz,46,6.5,1.1); emit('blood',x,y+0.4,zz,20,3,0.8);
  bloodPool(x,zz,rand(2.2,2.9)); for(let i=0;i<4;i++){ const a=rand(0,6.28), r=rand(0.8,2.4); setTimeout(()=>bloodPool(x+Math.cos(a)*r,zz+Math.sin(a)*r,rand(0.7,1.3)),200+i*90); }
  // espirra nas paredes perto
  try{ const o=new THREE.Vector3(x,y+1.1,zz), d=new THREE.Vector3(); for(let i=0;i<6;i++){ const a=rand(0,6.28); d.set(Math.cos(a),rand(-0.2,0.35),Math.sin(a)).normalize(); const t=rayWall(o,d,3.2); if(t<3.1){ const p=o.clone().addScaledVector(d,t); v9WallBlood(p,-d.x,0,-d.z); } } }catch(e){}
  try{ Snd.head(); Snd.sample('acid_sizzle',{vol:0.25,x,z:zz,range:24,rate:0.6}); }catch(e){} }
/* ---- golpe pesado: finalização na cabeça ---- */
const FIN={on:false,z:null,t:0,stab:false};
function finStart(z){ z.v9fin=true; Object.assign(FIN,{on:true,z,t:0,stab:false,yaw:P.yaw,pitch:P.pitch}); try{ if(typeof hfxStart==='function') hfxStart('_fin',false); }catch(e){} }
function finDeath(z,dt){ const t=z.t, aL=z.armL, aR=z.armR, L=z.legL, R=z.legR;
  if(t<0.75){ // preso pela cabeça: cambaleia para trás, cabeça puxada, braços moles
    const k=Math.min(1,t/0.2), hit=t>0.3?Math.min(1,(t-0.3)/0.08):0;
    z.g.rotation.set(-0.12*k,0,0); z.g.position.y=0; z.hips.position.y=0.95-0.05*hit;
    z.spine.rotation.set(-0.25*k+0.15*hit,0,0); z.headP.rotation.set(-0.75*k+0.35*hit+(hit>0&&t<0.45?rand(-0.08,0.08):0),0,0.15*hit);
    aL.sh.rotation.set(-0.5*k+0.6*hit,0,-0.3); aR.sh.rotation.set(-0.6*k+0.6*hit,0,0.3); aL.el.rotation.x=-0.8+0.6*hit; aR.el.rotation.x=-0.9+0.6*hit;
    L.th.rotation.x=0; R.th.rotation.x=0; L.kn.rotation.x=0.15*hit; R.kn.rotation.x=0.2*hit;
    if(hit>0&&!z.finBlood){ z.finBlood=true; const hy=zy(z)+1.72; emit('blood',z.pos.x,hy,z.pos.z,34,4.2,1); emit('gore',z.pos.x,hy,z.pos.z,10,3,0.9); try{ Snd.head(); Snd.stab(true); }catch(e){}
      try{ const o=new THREE.Vector3(z.pos.x,hy,z.pos.z), d=new THREE.Vector3(z.pos.x-P.pos.x,0.1,z.pos.z-P.pos.z).normalize(); const tt=rayWall(o,d,3); if(tt<2.9) v9WallBlood(o.clone().addScaledVector(d,tt),-d.x,0,-d.z); }catch(e){} vmBlood(1,true); shake(0.3); }
    if(hit>0&&t<0.75&&Math.random()<dt*30) emit('blood',z.pos.x,zy(z)+1.7,z.pos.z,2,2.2,0.6);
  } else fallFrom(z,dt,0.75,'knees');
  z.g.position.x=z.pos.x; z.g.position.z=z.pos.z; z.g.rotation.y=z.yaw; }
// câmera e corpo do jogador durante a finalização: chega perto e olha na cabeça
v9On('always',dt=>{ if(!FIN.on) return; const z=FIN.z; FIN.t+=dt; if(!z||G.state!=='playing'||P.down||FIN.t>0.9){ FIN.on=false; return; }
  const dx=z.pos.x-P.pos.x, dz=z.pos.z-P.pos.z, d=Math.hypot(dx,dz)||1, k=1-Math.exp(-dt*14);
  const ty=Math.atan2(-dx,-dz); let dy=ty-P.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; P.yaw+=dy*k;
  const hp=Math.atan2(zy(z)+1.7-(P.base||0)-EYE_HEIGHT,d); P.pitch+= (clamp(hp,-0.6,0.6)-P.pitch)*k;
  if(d>0.85&&FIN.t<0.35){ const m=Math.min(d-0.85,dt*5); P.pos.x+=dx/d*m; P.pos.z+=dz/d*m; } });
V9VM.push(dt=>{ if(!FIN.on) return; const t=FIN.t, s=t>0.22&&t<0.5?Math.sin((t-0.22)/0.28*Math.PI):0; vmRoot.position.z-=s*0.12; vmRoot.position.y+=s*0.05; vmRoot.rotation.x+=s*0.35; });
const _busyFin=busy; busy=function(){ return _busyFin()||FIN.on; };
v9On('reset',()=>{ FIN.on=false; });
