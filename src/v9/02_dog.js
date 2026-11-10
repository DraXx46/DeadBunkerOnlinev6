/* ================= v9 · CACHORRO: agarra a perna, QTE de facadas =================
   O cachorro não mata mais com uma mordida. Ele pula e agarra a perna: −50 de vida, o jogador olha para baixo, saca a faca e precisa
   apertar ATACAR várias vezes antes do tempo acabar. Cada aperto é uma facada no cachorro. Acertou tudo: o cachorro morre.
   Errou: sozinho você morre; no cooperativo você cai (e pode ser levantado). */
const DOGQ={on:false,z:null,zid:null,need:8,got:0,t:0,dur:3.4,host:true,pos:null,yaw:0,stabT:0,stabN:0,el:null,cd:0,yelpT:0};
function dogNeed(){ return Math.min(14,7+Math.floor((G.round||1)/5)); }
/* anfitrião: o cachorro em alcance tenta agarrar; devolve true se está (ou ficou) agarrado */
function dogTryGrab(z,T,dist,reach){
  if(z.grabbing){ return true; }
  if(!T||dist>reach+0.25||z.state!=='inside'||(z.grabCd||0)>G.t||x1Live()) return false;
  if(T.local){ if(DOGQ.on||P.down) return false; z.grabbing='me'; dogGrabStart(z,z.id,true); }
  else { const rp=NET.players.get(T.key); if(!rp||rp.down||rp.dogGrab) return false; rp.dogGrab=z.id; z.grabbing=T.key; pushEv(['dg',T.key,z.id]); }
  z.grabT=0; z.grabCd=G.t+6; return true;
}
V9NET.ev.dg=(e,me)=>{ if(e[2]===me&&me&&!DOGQ.on&&!P.down){ const gz=NET.ghosts.get(e[3]); dogGrabStart(gz||null,e[3],false); } };
V9NET.act.dgr=(peer,a)=>{ const z=zombies.find(q=>q.id===a[2]); const rp=NET.players.get(peer); if(rp) rp.dogGrab=null;
  if(!z) return; z.grabbing=null; z.grabCd=G.t+4; if(a[3]===1&&!z.dead){ z.dogQte=true; damageZombie(z,z.hp+1,'head','knife',null,peer,1); } };
function dogGrabStart(z,zid,host){
  Object.assign(DOGQ,{on:true,z,zid,host,need:dogNeed(),got:0,t:0,dur:Math.max(2.6,3.6-(G.round||1)*0.02),pos:{x:P.pos.x,z:P.pos.z},stabT:0,stabN:0,yelpT:0});
  if(z){ DOGQ.yaw=Math.atan2(-(z.pos.x-P.pos.x),-(z.pos.z-P.pos.z)); } else DOGQ.yaw=P.yaw;
  DOGQ.prevKnife=Wp.knifeOut; Wp.reloading=false; IN.ads=false; Wp.knifeOut=true; Wp.kAct=null;
  try{ Snd.sample(['dog_growl1','dog_growl2','dog_growl3'],{vol:1.2,prio:true}); Snd.hurt(); }catch(e){}
  shake(0.6); shotShake(0.8); flashScreen(); vmBlood(0.6,true);
  // −50 de vida no agarrão (pode derrubar na hora)
  if(!CHEAT.god){ P.hp-=50; P.lastHit=G.t; if(P.hp<=0){ dogGrabEnd(false,true); P.hp=0; if(v9BeforeDeath()) return; if(NET.mode) goDown(); else gameOver(); return; } }
  dogHud(true); banner('O CACHORRO AGARROU SUA PERNA!',(isTouch?'Toque em ATIRAR':'Aperte ATACAR (clique)')+' várias vezes!','red');
}
function dogHud(on){
  if(!DOGQ.el){ const el=v9El('div','',`<div class="dq-in"><b>SOLTE-SE!</b><div class="dq-keys"><span class="dq-key">${isTouch?'ATIRAR':'CLIQUE'}</span></div><div class="dq-bar"><i></i></div><div class="dq-pips"></div><div class="dq-time"><i></i></div></div>`); el.id='dogqte'; el.hidden=true; document.body.appendChild(el); DOGQ.el=el; }
  const el=DOGQ.el; el.hidden=!on; if(!on) return;
  el.querySelector('.dq-pips').innerHTML=Array.from({length:DOGQ.need},(_,i)=>`<i class="${i<DOGQ.got?'on':''}"></i>`).join('');
}
v9Css(`#dogqte{position:fixed;left:50%;top:62%;transform:translate(-50%,-50%);z-index:40;pointer-events:none;text-align:center}
#dogqte .dq-in{background:rgba(10,4,3,.72);border:1px solid #a3261a;padding:12px 22px 14px;min-width:280px;box-shadow:0 0 40px rgba(160,20,10,.35)}
#dogqte b{display:block;font:700 30px/1 "Stardos Stencil",Impact,sans-serif;letter-spacing:.12em;color:#ffdfd2;text-shadow:0 0 14px #c21a0e;animation:dqPulse .32s ease-in-out infinite alternate}
#dogqte .dq-key{display:inline-block;margin:10px 0 8px;padding:6px 16px;border:2px solid #ffd0b8;font:700 16px "Special Elite",monospace;color:#fff;animation:dqKey .18s ease-in-out infinite alternate}
#dogqte .dq-pips{display:flex;gap:5px;justify-content:center;margin-top:8px}#dogqte .dq-pips i{width:14px;height:14px;transform:rotate(45deg);background:#3a1a14;border:1px solid #8a3a2a;transition:background .1s,transform .1s}
#dogqte .dq-pips i.on{background:#ff4a2a;box-shadow:0 0 8px #ff4a2a;transform:rotate(45deg) scale(1.15)}
#dogqte .dq-time{height:4px;background:#2a1210;margin-top:10px}#dogqte .dq-time i{display:block;height:100%;background:linear-gradient(90deg,#ff3a1a,#ffb04a);transform-origin:left}
#dogqte .dq-bar{display:none}
@keyframes dqPulse{from{transform:scale(1)}to{transform:scale(1.06)}}@keyframes dqKey{from{transform:translateY(0)}to{transform:translateY(2px);background:rgba(255,255,255,.12)}}`);
function dogGrabEnd(won,silent){
  const z=DOGQ.z; DOGQ.on=false; dogHud(false); Wp.kAct=null; Wp.knifeOut=!!DOGQ.prevKnife; if(!Wp.knifeOut) setGunModel(); Wp.swapT=0.35;
  if(DOGQ.host){ if(z&&!z.dead){ z.grabbing=null; z.grabCd=G.t+4; if(won){ z.dogQte=true; damageZombie(z,z.hp+1,'head','knife'); hitmarker(true,false); } } }
  else netAct(['dgr',DOGQ.zid,won?1:0]);
  if(won){ banner('VOCÊ SE SOLTOU','O cachorro não levanta mais','gold'); if(DOGQ.host===false&&z){ z.predDead=true; z.predT=1.5; } }
  else if(!silent){ banner(NET.mode?'O CACHORRO TE DERRUBOU':'O CACHORRO TE PEGOU',NET.mode?'Seu parceiro pode te levantar':'Você não conseguiu se soltar','red');
    P.hp=0; if(!(v9BeforeDeath&&v9BeforeDeath())){ if(NET.mode) goDown(); else gameOver(); } }
}
/* chamado por updateWeapons enquanto o QTE está ativo: cada aperto é uma facada */
function dogWeapons(dt){
  const E=IN.edges; const press=E.has('fire')||E.has('knife')||E.has('alt');
  if(press&&DOGQ.stabT<=0.02){ DOGQ.got++; DOGQ.stabT=0.2; Wp.kAct='stab'; Wp.kT=0; Wp.kDur=0.2;
    const z=DOGQ.z; const hx=z?z.pos.x:P.pos.x-Math.sin(P.yaw)*0.6, hz=z?z.pos.z:P.pos.z-Math.cos(P.yaw)*0.6;
    emit('blood',hx,floorAt(hx,hz)+0.55,hz,10,2.6,0.7); vmBlood(0.45,true); Snd.stab(true); shake(0.12); shotShake(0.25); if(z) z.flashT=0.08;
    try{ padRumble(0.7,0.4,90); }catch(e){}
    if(DOGQ.got>=DOGQ.need){ dogGrabEnd(true); return; } dogHud(true); }
  if(DOGQ.stabT>0){ DOGQ.stabT-=dt; Wp.kT=Math.min(Wp.kDur,Wp.kT+dt); } else Wp.kAct=null;
}
v9On('frame',dt=>{
  // quem está agarrando: o cachorro fica preso no pé do alvo, mordendo
  if(NET.mode!=='client') for(const z of zombies){ if(!z.grabbing||z.dead) continue; z.grabT=(z.grabT||0)+dt;
    let tx,tz,tyaw; if(z.grabbing==='me'){ tx=P.pos.x; tz=P.pos.z; tyaw=P.yaw; if(!DOGQ.on||P.down){ z.grabbing=null; continue; } }
    else { const rp=NET.players.get(z.grabbing); if(!rp||rp.x==null||rp.down||z.grabT>6){ z.grabbing=null; if(rp) rp.dogGrab=null; continue; } tx=rp.x; tz=rp.z; tyaw=rp.yaw; }
    const fx=-Math.sin(tyaw), fz=-Math.cos(tyaw); z.pos.x=tx+fx*0.62; z.pos.z=tz+fz*0.62; z.yaw=Math.atan2(tx-z.pos.x,tz-z.pos.z); z.moving=false; z.attackT=0.15+Math.abs(Math.sin(G.t*14))*0.3; }
  if(!DOGQ.on) return;
  DOGQ.t+=dt;
  // trava o jogador e força o olhar para baixo, para a perna
  if(DOGQ.pos){ P.pos.x=DOGQ.pos.x; P.pos.z=DOGQ.pos.z; P.vx=P.vz=0; }
  P.pitch=lerp(P.pitch,-1.05,Math.min(1,dt*9)); P.yaw=angLerp(P.yaw,DOGQ.yaw,Math.min(1,dt*6));
  const z=DOGQ.z; if(z&&(z.dead||z.predDead)&&DOGQ.on){ dogGrabEnd(true); return; }
  DOGQ.yelpT-=dt; if(DOGQ.yelpT<=0){ DOGQ.yelpT=rand(0.6,1.1); try{ Snd.sample(['dog_growl1','dog_growl2','dog_growl3'],{vol:0.9,rate:rand(1.05,1.25)}); }catch(e){} }
  const el=DOGQ.el; if(el){ const k=clamp(1-DOGQ.t/DOGQ.dur,0,1); el.querySelector('.dq-time i').style.transform=`scaleX(${k.toFixed(3)})`; }
  if(P.down&&DOGQ.on){ DOGQ.on=false; dogHud(false); return; }
  if(DOGQ.t>=DOGQ.dur) dogGrabEnd(false);
});
/* a faca desce na diagonal até a perna a cada facada */
V9VM.push(dt=>{ if(!DOGQ.on) return; const k=DOGQ.stabT>0?Math.sin((1-DOGQ.stabT/0.2)*Math.PI):0; vmRoot.rotation.x-=0.55+k*0.5; vmRoot.position.y+=0.03-k*0.06; vmRoot.position.z-=k*0.08; vmRoot.rotation.z+=0.12; });
v9On('reset',()=>{ if(DOGQ.on){ DOGQ.on=false; dogHud(false); } });

/* ---- sons gravados do cachorro: rosnado enquanto vivo (corta na hora que morre) e o ganido certo para cada morte ---- */
v9On('frame',dt=>{
  for(const z of zlist()){ if(z.kind!=='dog') continue;
    if(!z.dead&&!z.predDead){ z._gT=(z._gT==null?rand(0.2,1.5):z._gT)-dt; const d=Math.hypot(z.pos.x-P.pos.x,z.pos.z-P.pos.z);
      if(z._gT<=0&&d<34){ z._gT=rand(1.8,3.6); if(z._gh) z._gh.stop(0.08); z._gh=Snd.sample(['dog_growl1','dog_growl2','dog_growl3'],{x:z.pos.x,z:z.pos.z,range:34,vol:1.0,rate:rand(0.92,1.1)}); } }
    else if(!z._dsnd){ z._dsnd=true; if(z._gh){ z._gh.stop(0.04); z._gh=null; }
      const s=z.dogQte?'dog_die_knife2':(z.lastSrc==='knife'?'dog_die_knife1':'dog_die_shot');
      Snd.sample(s,{x:z.pos.x,z:z.pos.z,range:40,vol:1.15,minVol:0.15}); } }
});
