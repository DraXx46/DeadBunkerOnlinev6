/* ================= v9 · CUSPIDOR =================
   Zumbi especial (rodada 5+): pescoço inchado com bolsas verdes que pulsam, baba ácida. Mantém distância: quando o alvo está
   entre ~5 e 17 m e à vista, para, infla as bolsas (gorgolejo), e cospe uma bola de ácido em arco. Onde cai fica uma poça
   que queima. De perto ele morde como os outros. Ao morrer, as bolsas estouram numa poça.
   Online: o anfitrião decide e avisa; todo mundo vê o mesmo arco e a mesma poça; o dano é do anfitrião. */
const SPIT={list:[],pend:new Map()};
const spitSacM=new THREE.MeshPhongMaterial({color:0x8ccf2c,emissive:0x2f6408,shininess:90,specular:0x99ff44,transparent:true,opacity:0.9});
const spitGlobM=new THREE.MeshBasicMaterial({color:0xa8ff3a});
const spitGlobG=new THREE.SphereGeometry(0.13,10,8);
function spitDress(z){ if(!z||z._spitD||!z.g) return; z._spitD=1; const np=z.neckP||z.headP||z.spine; if(!np) return;
  const sacs=[]; for(const [x,y,zz,s] of [[0,-0.02,0.09,1],[0.07,0.02,0.06,0.7],[-0.07,0.01,0.06,0.75]]){ const m=new THREE.Mesh(new THREE.SphereGeometry(0.11*s,12,9),spitSacM); m.position.set(x,y,zz); m.scale.set(1.15,0.9,1); np.add(m); sacs.push(m); }
  z._sacs=sacs; if(z.mats) z.mats.forEach(m=>{ if(m.color&&!m._spitTint){ m._spitTint=1; m.color.lerp(new THREE.Color(0x9ab84a),0.28); } }); }
function v9MakeSpit(z){ if(!z||z.v9var) return; z.v9var='spit'; z.hp*=1.15; z.maxHp=z.hp; z.speed*=0.9; z.spitCd=rand(2.5,4); spitDress(z); }
// sorteio (anfitrião/solo)
{ const mz0=makeZombie; makeZombie=function(spawn){ const z=mz0.apply(this,arguments);
    try{ if(z&&NET.mode!=='client'&&z.kind==='normal'&&!z.boss&&!(spawn&&spawn.kind)&&!z.v9var&&G.round>=5&&!(typeof SPR!=='undefined'&&SPR.k)&&CUR!=='x1'&&CUR!=='fun'&&Math.random()<0.075){ v9MakeSpit(z); if(NET.mode==='host') pushEv(['spz',z.id]); } }catch(e){ console.warn('[Bunker] cuspidor',e); }
    return z; }; }
// convidados: o fantasma pode nascer depois do aviso
V9NET.ev.spz=e=>{ SPIT.pend.set(e[2],3); };
// sons
function spitGurgle(x,z){ try{ const near=clamp(1-Math.hypot(P.pos.x-x,P.pos.z-z)/30,0,1); if(near<=0) return; Snd.sample('acid_sizzle',{vol:0.35,rate:0.6,x,z,range:30});
    Snd.at(near,()=>{ const o=Snd.out(0.7*near,0,0.3,null); if(!o) return; const t=Snd.now; for(let i=0;i<5;i++) Snd.oscTo(o,{t:t+i*0.09,type:'sine',freq:rand(90,160),freqEnd:rand(60,90),dur:0.12,gain:0.35,attack:0.01}); Snd.burstTo(o,{t,type:'bandpass',freq:420,q:2,dur:0.6,gain:0.25,attack:0.1}); }); }catch(e){} }
function spitSpitSnd(x,z){ try{ const near=clamp(1-Math.hypot(P.pos.x-x,P.pos.z-z)/32,0,1); if(near<=0) return; Snd.at(near,()=>{ const o=Snd.out(0.8*near,0,0.25,null); if(!o) return; const t=Snd.now; Snd.burstTo(o,{t,type:'bandpass',freq:900,q:1.2,dur:0.22,gain:0.5,attack:0.005}); Snd.oscTo(o,{t,type:'sawtooth',freq:180,freqEnd:70,dur:0.18,gain:0.18,attack:0.004,lp:800}); }); }catch(e){} }
// projétil: todos animam o mesmo arco
function spitLaunch(ox,oy,oz,tx,tz,T){ const m=new THREE.Mesh(spitGlobG,spitGlobM); m.position.set(ox,oy,oz); scene.add(m);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x8aff30,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.7})); s.scale.setScalar(0.7); m.add(s);
  const d=Math.hypot(tx-ox,tz-oz); SPIT.list.push({m,ox,oy,oz,tx,tz,ty:floorAt(tx,tz)+0.05,T,t:0,h:0.9+d*0.07}); spitSpitSnd(ox,oz); }
V9NET.ev.spt=e=>{ spitLaunch(e[2]/10,e[3]/10,e[4]/10,e[5]/10,e[6]/10,(e[7]|0)/100); };
V9NET.ev.spw=e=>{ const z=zlist().find(q=>q.id===e[2]); if(z){ z.spitWind=0.65; spitGurgle(z.pos.x,z.pos.z); } };
function spitImpact(p){ const x=p.tx, z=p.tz; scene.remove(p.m);
  try{ emit('green',x,floorAt(x,z)+0.2,z,26,3.2,0.9,-0.6); Snd.sample('acid_sizzle',{vol:0.8,x,z,range:28}); }catch(e){}
  const host=NET.mode!=='client'; acidPool(x,z,host);
  if(host){ try{ for(const T of playersNear(x,z,1.05)) hurtTarget(T,16,null); }catch(e){} }
  if(Math.hypot(P.pos.x-x,P.pos.z-z)<2.2){ try{ padRumble(0.5,0.3,120); }catch(e){} } }
// por quadro
v9On('always',dt=>{
  // projéteis (todos)
  for(let i=SPIT.list.length-1;i>=0;i--){ const p=SPIT.list[i]; p.t+=dt; const k=Math.min(1,p.t/p.T);
    p.m.position.set(p.ox+(p.tx-p.ox)*k,p.oy+(p.ty-p.oy)*k+4*p.h*k*(1-k),p.oz+(p.tz-p.oz)*k); p.m.rotation.x+=dt*9;
    if(Math.random()<dt*30) emit('green',p.m.position.x,p.m.position.y,p.m.position.z,1,0.4,0.4,-0.6);
    if(k>=1){ spitImpact(p); SPIT.list.splice(i,1); } }
  // visual pendente nos convidados
  if(SPIT.pend.size){ for(const [id,t] of SPIT.pend){ const z=zlist().find(q=>q.id===id); if(z&&z.g){ z.v9var='spit'; spitDress(z); SPIT.pend.delete(id); } else if(t-dt<=0) SPIT.pend.delete(id); else SPIT.pend.set(id,t-dt); } }
  const host=NET.mode!=='client';
  for(const z of zlist()){ if(z.v9var!=='spit') continue; if(z.dead){ if(z._sacs&&!z._popped){ z._popped=1; for(const s of z._sacs) s.visible=false; if(host) acidPool(z.pos.x,z.pos.z,true); else acidPool(z.pos.x,z.pos.z,false); } continue; }
    // bolsas pulsando (mais forte ao inflar) e baba
    const w=z.spitWind>0?1:0; if(z._sacs){ const s=1+Math.sin(G.t*(w?22:5)+z.id)*(w?0.22:0.06)+w*0.25; for(const m of z._sacs) m.scale.set(1.15*s,0.9*s,s); }
    if(Math.random()<dt*2.2){ const np=z.neckP||z.headP; if(np){ const v=new THREE.Vector3(); np.getWorldPosition(v); emit('green',v.x,v.y-0.05,v.z,1,0.3,0.5,-1); } }
    if(z.spitWind>0&&!host){ z.spitWind-=dt; }
    if(!host||z.state==='rise'||z.state==='dying'||z.crawl) continue;
    z.spitCd=(z.spitCd==null?3:z.spitCd)-dt;
    const T=nearestTarget(z.pos.x,z.pos.z); if(!T) continue; const d=Math.hypot(T.x-z.pos.x,T.z-z.pos.z);
    if(z.spitWind>0){ z.spitWind-=dt; z.stagT=Math.max(z.stagT||0,0.08); z.yaw=Math.atan2(T.x-z.pos.x,T.z-z.pos.z);
      if(z.spitWind<=0){ const np=z.headP||z.neckP||z.g; const v=new THREE.Vector3(); np.getWorldPosition(v); v.x+=Math.sin(z.yaw)*0.25; v.z+=Math.cos(z.yaw)*0.25;
        const tx=T.x+rand(-0.7,0.7), tz=T.z+rand(-0.7,0.7), Tf=clamp(d/13,0.45,1.15); spitLaunch(v.x,v.y,v.z,tx,tz,Tf);
        if(NET.mode==='host') pushEv(['spt',r10(v.x),r10(v.y),r10(v.z),r10(tx),r10(tz),Math.round(Tf*100)]); } }
    else if(z.spitCd<=0&&d>4.8&&d<17){ let see=true; try{ see=losClear({x:z.pos.x,z:z.pos.z},{x:T.x,z:T.z}); }catch(e){}
      if(see){ z.spitWind=0.65; z.spitCd=rand(3.6,5.6); spitGurgle(z.pos.x,z.pos.z); if(NET.mode==='host') pushEv(['spw',z.id]); } else z.spitCd=0.6; } } });
// a cabeça inclina para trás ao inflar (por cima da animação)
{ const az0=animateZombie; animateZombie=function(z,dt){ const r=az0.apply(this,arguments); try{ if(z&&z.v9var==='spit'&&z.spitWind>0&&z.headP&&z.state!=='dying'){ const k=Math.sin(Math.min(1,(0.65-z.spitWind)/0.65)*Math.PI); z.headP.rotation.x-=k*0.55; if(z.spine) z.spine.rotation.x-=k*0.18; } }catch(e){} return r; }; }
CMDS.cuspidor={cheat:1,d:'cuspidor · cria um cuspidor perto (teste)',f:()=>{ needGame&&needGame(); const fx=-Math.sin(P.yaw), fz=-Math.cos(P.yaw); const z=makeZombie({x:P.pos.x+fx*10,z:P.pos.z+fz*10}); if(z){ v9MakeSpit(z); z.spitCd=1; if(NET.mode==='host') pushEv(['spz',z.id]); cprint('cuspidor criado'); } } };
