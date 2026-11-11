/* ================= v9 · PERSONAGENS: BALANCEAMENTO E ULTIMATES NOVAS =================
   O Padre e o V.I.K.T.O.R estavam bem à frente; os outros quatro ficaram mais fortes.
   - Cabo Davi (Recruta): ultimate vira APOIO AÉREO — munição cheia (pente e reserva) para todo mundo
     e um caça passa soltando bombas no ponto exato para onde você mira.
   - Dra. Helena: passiva nova — levanta um aliado caído à distância (até 40 m), recarga de 1 min.
   - Sargento Moreira: ultimate vira FRENESI — pente infinito, super força, pulo 2× mais alto,
     cadência maior, quase não leva dano e anda mais rápido.
   - Iara: marcação e Olho da Raposa mais longos e fortes.
   - Soro da Vida: depois de levantar, você renasce num lugar aleatório e seguro do mapa. */
Object.assign(AB_CFG.recruta,{cd:30,buff:10,reload:0.4,dmgBuff:1.5,shells:12,radius:4.5,dmg:1100,dmgRound:300});
Object.assign(AB_CFG.helena,{cd:28,heal:80,range:10,fieldT:15,fieldR:8,fieldHps:25,adrT:6,adrDmg:1.45,fieldDmg:70,fieldRound:24,farRevR:40,farRevCd:60});
Object.assign(AB_CFG.moreira,{cd:18,dmg:260,dmgRound:60,furyT:12,taken:0.12,knife:3,regen:8,furyR:3.6,furyDmg:90,furyRound:30,furyDmgMul:1.8,furyRof:1.6,furySpd:1.3,furyJump:1.42});
Object.assign(AB_CFG.iara,{cd:25,range:45,markT:12,mark:1.8,ultT:10,head:2.6,ricoN:3,ricoP:0.7});
AB_DEF.recruta.u={name:'Apoio Aéreo',desc:'Munição cheia para todo o time (pente e reserva) e um caça bombardeia o ponto exato para onde você está mirando.'};
AB_DEF.moreira.u={name:'Frenesi',desc:'Por 12 s: pente infinito, super força, pulo 2× mais alto, cadência maior, mais velocidade e quase nenhum dano recebido.'};
AB_DEF.recruta.a.desc='Enche o pente de todas as armas, recarrega bem mais rápido e os tiros causam +50% de dano por 10 s.';
AB_DEF.iara.u.desc='Por 10 s todo tiro conta como tiro na cabeça, o pente não esvazia e cada acerto ricocheteia em até 3 zumbis.';
AB_LINES.recruta.ult='Apoio aéreo, marcando o alvo!'; AB_LINES.moreira.ult='AGORA É COMIGO!';
// passiva da médica aparece na ficha
{ const P0=CHARS.helena.passive.lv; CHARS.helena.passive.lv=L=>P0(L).concat(['Levanta um aliado caído a até 40 m, sem encostar (1 vez por minuto)']); }

/* ---------- ponto mirado (chão ou parede) ---------- */
function abAimPoint(max){ const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d); let t=max||60;
  try{ const tw=rayWall(o,d,t); if(tw<t) t=tw; }catch(e){}
  if(d.y<-0.01){ const tf=(floorAt(o.x,o.z)-o.y)/d.y; if(tf>0&&tf<t) t=tf; }
  const p=o.addScaledVector(d,Math.max(2,t-0.3)); return {x:p.x,z:p.z}; }

/* ---------- Cabo Davi: munição para todos + caça ---------- */
function abFullAmmo(msg){ for(const q of Wp.inv){ const d=wstat(q); if(!d||d.sprite) continue; q.mag=d.mag; q.reserve=d.reserve; } Wp.reloading=false; hudAmmo();
  try{ Snd.sample('rl_mag_in',{vol:0.9,prio:1}); setTimeout(()=>Snd.sample('rl_slide',{vol:0.8,prio:1}),160); }catch(e){} if(msg) banner('MUNIÇÃO CHEIA',msg,'gold'); }
const JET={list:[]};
function jetMesh(){ const g=new THREE.Group(), m=v9Mat('jetBody',{color:0x4a5048,shininess:60}), dk=v9Mat('jetDark',{color:0x1a1c1a}), gl=v9Mat('jetGlass',{color:0x203040,shininess:120,specular:0x99bbdd});
  const b=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.35,9,12),m); b.rotation.x=Math.PI/2; g.add(b);
  const n=new THREE.Mesh(new THREE.ConeGeometry(0.55,2.2,12),m); n.rotation.x=-Math.PI/2; n.position.z=-5.6; g.add(n);
  const c=new THREE.Mesh(new THREE.SphereGeometry(0.5,12,8,0,6.3,0,1.4),gl); c.scale.set(0.8,0.7,1.8); c.position.set(0,0.42,-3); g.add(c);
  const w=new THREE.Mesh(new THREE.BoxGeometry(11,0.14,2.6),m); w.position.z=0.4; g.add(w);
  const t=new THREE.Mesh(new THREE.BoxGeometry(4,0.1,1.2),m); t.position.z=4.1; g.add(t); const f=new THREE.Mesh(new THREE.BoxGeometry(0.12,2,1.6),m); f.position.set(0,1,4); g.add(f);
  for(const sx of [-2.6,2.6]){ const bomb=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,1.4,8),dk); bomb.rotation.x=Math.PI/2; bomb.position.set(sx,-0.3,0.3); g.add(bomb); }
  const glow=new THREE.Mesh(new THREE.CircleGeometry(0.34,12),new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending})); glow.position.z=4.55; g.add(glow);
  return g; }
function jetRun(tx,tz,yaw,mine){ const g=jetMesh(); const fx=-Math.sin(yaw), fz=-Math.cos(yaw); const H=34, L=150;
  g.position.set(tx-fx*L,H,tz-fz*L); g.rotation.y=yaw; scene.add(g); const J={g,tx,tz,fx,fz,t:0,dur:4.2,L,H,mine,drops:[],dropped:false}; JET.list.push(J);
  try{ const o=Snd.out(1.4,0,0.5,null), t=Snd.now; Snd.burstTo(o,{t,type:'lowpass',freq:500,dur:3.6,gain:0.9,attack:1.4}); Snd.oscTo(o,{t,type:'sawtooth',freq:180,freqEnd:70,dur:3.8,gain:0.07,attack:1.2,lp:900}); }catch(e){}
  return J; }
v9On('always',dt=>{ for(let i=JET.list.length-1;i>=0;i--){ const J=JET.list[i]; J.t+=dt; const k=J.t/J.dur, d=-J.L+2*J.L*k;
    J.g.position.set(J.tx+J.fx*d,J.H-Math.sin(k*Math.PI)*6,J.tz+J.fz*d); J.g.rotation.z=Math.sin(J.t*2)*0.06;
    if(!J.dropped&&d>-16){ J.dropped=true; for(let b=0;b<6;b++){ const bm=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,1.2,8),v9Mat('jetDark',{color:0x1a1c1a})); bm.position.copy(J.g.position); bm.position.y-=0.4; scene.add(bm); J.drops.push({m:bm,vx:J.fx*38,vz:J.fz*38,vy:0,t:-b*0.09}); } }
    for(const q of J.drops){ if(q.done) continue; q.t+=dt; if(q.t<0){ q.m.position.copy(J.g.position); continue; } q.vy-=24*dt; q.vx*=1-dt*0.9; q.vz*=1-dt*0.9; q.m.position.x+=q.vx*dt; q.m.position.y+=q.vy*dt; q.m.position.z+=q.vz*dt; q.m.rotation.x=Math.atan2(Math.hypot(q.vx,q.vz),-q.vy)-Math.PI/2; q.m.rotation.y=Math.atan2(q.vx,q.vz);
      if(q.m.position.y<=floorAt(q.m.position.x,q.m.position.z)+0.3){ q.done=true; scene.remove(q.m); } }
    if(J.t>=J.dur){ scene.remove(J.g); for(const q of J.drops) scene.remove(q.m); JET.list.splice(i,1); } } });
{ const _ult=abUlt; abUlt=function(){ const c=abc();
    if(c!=='recruta'||abLvU(c)<1||P.down||AB.ult<100||AB.ultAct>0||(x1Live()&&!X1.cfg.ult)) return _ult.apply(this,arguments);
    // a barragem original continua, só que no ponto mirado e em linha, como um bombardeio de caça
    const A=abAimPoint(70), me=P.pos, dx=A.x-me.x, dz=A.z-me.z, D=Math.max(0.5,Math.hypot(dx,dz));
    const f0=abFwd, s0=abSend; abFwd=()=>({x:dx/14,z:dz/14}); abSend=function(k){ if(k==='mortar') return; return s0.apply(this,arguments); }; let r; try{ r=_ult.apply(this,arguments); }finally{ abFwd=f0; abSend=s0; }
    const yaw=P.yaw, fx=-Math.sin(yaw), fz=-Math.cos(yaw), C=AB_CFG.recruta; AB.mortars.length=0; const shells=[];
    for(let i=0;i<C.shells;i++){ const s=(i/(C.shells-1)-0.5)*16, sx=A.x+fx*s+rand(-1.4,1.4), sz=A.z+fz*s+rand(-1.4,1.4), delay=1.9+i*0.11; AB.mortars.push({t:delay,x:sx,z:sz,w:false}); shells.push([r10(sx),r10(sz),Math.round(delay*100)]); }
    abSend('mortar',me.x,me.z,shells); jetRun(A.x,A.z,yaw,true); abSend('jet',A.x,A.z,{yaw:r100(yaw)});
    abFullAmmo('Apoio aéreo a caminho — o time todo recarregou'); abSend('ammo',me.x,me.z);
    return r; }; }

/* ---------- Sargento: frenesi ---------- */
function moreiraFury(){ return abc()==='moreira'&&AB.ultAct>0; }
{ const _fa=abFreeAmmo; abFreeAmmo=function(){ return _fa()||moreiraFury(); }; }
{ const _ah=abHit; abHit=function(z,dmg,part,src){ const r=_ah.apply(this,arguments); if(moreiraFury()&&src!=='knife') r[0]*=AB_CFG.moreira.furyDmgMul; return r; }; }
{ const _s0=abSpeed0; abSpeed0=function(m){ const v=_s0(m); return moreiraFury()?Math.max(v,m*AB_CFG.moreira.furySpd):v; }; }
v9On('fire',()=>{ if(moreiraFury()) Wp.fireCd/=AB_CFG.moreira.furyRof; });
{ let wasGround=true; v9On('frame',()=>{ const g=P.y<=0.001; if(moreiraFury()&&wasGround&&!g&&P.vy>3.5){ P.vy*=AB_CFG.moreira.furyJump; try{ Snd.sample('jump_land',{vol:0.5,rate:0.7}); }catch(e){} } wasGround=g; }); }
// tela do frenesi: borda vermelha pulsando + coração
{ let el=null, beat=0; v9On('always',dt=>{ const on=moreiraFury()&&G.state==='playing';
  if(!el){ el=document.createElement('div'); el.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:38;opacity:0;transition:opacity .25s;box-shadow:inset 0 0 160px 40px rgba(190,20,10,.55)'; document.body.appendChild(el); }
  if(!on){ el.style.opacity=0; return; } beat-=dt; const k=Math.max(0,beat/0.5); el.style.opacity=(0.55+0.45*k).toFixed(2);
  if(beat<=0){ beat=0.62; try{ const o=Snd.out(0.9,0,0.1,null), t=Snd.now; for(const d of [0,0.14]) Snd.oscTo(o,{t:t+d,type:'sine',freq:62,freqEnd:38,dur:0.18,gain:0.55,attack:0.003}); }catch(e){} } }); }

/* ---------- Médica: levantar de longe ---------- */
const FARREV={cd:0};
v9On('frame',dt=>{ if(FARREV.cd>0) FARREV.cd-=dt; if(!NET.mode||abc()!=='helena'||P.down||FARREV.cd>0||G.state!=='playing') return; const C=AB_CFG.helena;
  for(const rp of NET.players.values()){ if(!rp.has||rp.down!==1||rp.x==null) continue; if(!rp.farSeen) rp.farSeen=G.t; if(G.t-rp.farSeen<1.2) continue;
    if(Math.hypot(rp.x-P.pos.x,rp.z-P.pos.z)>C.farRevR) continue;
    FARREV.cd=C.farRevCd; rp.revAt=G.t; rp.farSeen=0; if(NET.mode==='host') pushEv(['rv',rp.peer]); else netAct(['rv',rp.peer]);
    try{ Snd.abil('heal',rp.x,rp.z); Snd.puGet(); }catch(e){} emit('green',rp.x,1.0,rp.z,24,3.4,0.8,-1); abSend('farrev',rp.x,rp.z);
    banner('LEVANTADO À DISTÂNCIA',`Você levantou ${nameOf(rp.peer)} · próxima em 60 s`,'gold'); actLog(`{n} levantou ${nameOf(rp.peer)} de longe`); break; }
  for(const rp of NET.players.values()) if(rp.down!==1) rp.farSeen=0; });

/* ---------- efeitos nos outros jogadores ---------- */
{ const _ev=abOnEv; abOnEv=function(peer,kind,x,z,ch,info){
    if(peer&&String(peer)===String(NET.me)) return _ev.apply(this,arguments);
    if(kind==='ammo'){ if(!P.down) abFullAmmo('O Cabo Davi chamou apoio aéreo: munição cheia'); return; }
    if(kind==='jet'){ const yaw=info&&Number.isFinite(+info.yaw)?(+info.yaw)/100:0; jetRun(x,z,yaw,false); return; }
    if(kind==='farrev'){ emit('green',x,1.0,z,24,3.4,0.8,-1); try{ Snd.abil('heal',x,z); }catch(e){} return; }
    return _ev.apply(this,arguments); }; }

/* ---------- Soro da Vida: renasce em lugar aleatório ---------- */
function v9SoroTp(){ if(CUR==='tz'&&TZB.present&&tzInBus(P.pos.x,P.pos.z,0.4)&&TZB.ph!=='stop') return;
  const cand=[]; for(let gz=0;gz<grid.length;gz++){ const row=grid[gz]; for(let gx=0;gx<row.length;gx++){ if(row[gx]!=='.') continue; const r=roomOf[gz]&&roomOf[gz][gx]; if(!r||!G.rooms.has(r)) continue; cand.push([gx,gz]); } }
  for(let tries=0;tries<80&&cand.length;tries++){ const [gx,gz]=cand[(Math.random()*cand.length)|0]; const x=gx*S+S/2, z=gz*S+S/2;
    if(Math.hypot(x-P.pos.x,z-P.pos.z)<12) continue; let ok=true; for(const q of zombies){ if(!q.dead&&Math.hypot(q.pos.x-x,q.pos.z-z)<9){ ok=false; break; } } if(!ok) continue;
    try{ if(grid[gz-1]&&grid[gz-1][gx]==='#'&&grid[gz+1]&&grid[gz+1][gx]==='#') continue; }catch(e){}
    P.pos.set(x,0,z); P.vx=P.vz=P.vy=0; P.y=0; try{ resetMotion(); }catch(e){} flowDirty=true; emit('green',x,1.0,z,20,3,0.7,-1); banner('SORO DA VIDA','Você acordou em outro lugar do mapa','gold'); return; } }
