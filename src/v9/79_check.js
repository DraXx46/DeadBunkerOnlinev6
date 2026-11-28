/* ================= v9 · CONFERIR A ARMA (segurar R) =================
   Tocar R recarrega como sempre (a recarga sai quando solta a tecla, ou na hora se for no controle/toque).
   SEGURAR R (CHK.HOLD s) faz o personagem conferir a arma, usando as mesmas peças, mãos e sons da recarga:
   · carregador: inclina a arma, a mão puxa o carregador até a metade, vira para olhar, encaixa de volta e dá um tapa;
     depois "press check" no ferrolho/alavanca (puxa um pouco para ver a câmara e solta)
   · Kar98k: ergue o ferrolho e puxa um pouco · escopeta: abre um pouco a telha · Ray Gun: abre a trava
   · Python: abre o tambor, olha e fecha com um tranco
   Atirar, mirar, correr, recarregar, trocar de arma ou a faca cancelam na hora. */
const CHK={pend:false,hold:0,HOLD:0.3};
function chkHeld(){ if(keys.KeyR) return true;
  try{ if(typeof PAD!=='undefined'&&PAD.sqUsed) return false; const gs=navigator.getGamepads?navigator.getGamepads():[]; for(const g of gs) if(g&&g.connected&&g.buttons[2]&&g.buttons[2].pressed) return true; }catch(e){}
  return false; }
function chkCan(){ const s=curSlot(); return G.state==='playing'&&s&&!P.down&&!Wp.knifeOut&&!Wp.reloading&&Wp.swapT<=0&&Wp.drinkT<=0&&Wp.upT<=0&&!Wp.scoped&&P.ads<0.2&&!P.sprinting
  &&!(WEAPONS[s.id]&&WEAPONS[s.id].sprite)&&gunModel&&gunModel.userData.vmp&&!(VMA.on&&VMA.kind!=='cycle')&&!(typeof FIN!=='undefined'&&FIN.on); }
/* ---- carregador + press check ---- */
function chkPress(G,c,t0,trk){
  const P=G[c.part]; if(!P) return t0; const B=pbox(P), k=c.k||0.45, pull=[c.pull[0]*k,c.pull[1]*k,c.pull[2]*k], h=c.hand(B,c.part), T=c.tilt||T_CHR, HT=c.side==='R'?trk.R:trk.L;
  trk.parts[c.part]=[[0,null],[t0+0.32,null],[t0+0.48,{t:pull},'o'],[t0+0.9,{t:pull}],[t0+1.0,null,'i3']];
  trk.gun.push([t0+0.28,T,'io'],[t0+0.48,Object.assign({},T,{z:(T.z||0)+0.006}),'o'],[t0+0.9,T],[t0+1.02,Object.assign({},T,{z:(T.z||0)-0.005,rx:(T.rx||0)-0.025}),'o'],[t0+1.1,T]);
  if(c.side==='R'){ HT.push([t0+0.06,'g']); trk.L.push([t0+0.22,'g','io']); }
  HT.push([t0+0.32,h,'io'],[t0+0.98,h]);
  trk.ev.push([t0+0.3,'grab',0.6],[t0+0.46,'chBack',0.5],[t0+1.0,'chFwd',0.8]);
  return t0+1.1; }
function chkMag(G,o,s){
  const B=pbox(G.mag), TL=o.tilt||{x:-0.06,y:0.055,z:0.03,rx:0.14,ry:0.36,rz:-0.5};
  const LK=Object.assign({},TL,{y:(TL.y||0)+0.012,ry:(TL.ry||0)+0.14,rz:(TL.rz||0)-0.22});
  const out=o.out||{t:[0,-0.05,0.006],r:[-7,0,0]}, hm=H.magSide(B,'mag');
  const gun=[[0,{}],[0.34,TL,'o'],[0.62,TL],[0.84,LK,'io'],[1.32,LK],[1.5,TL,'io'],[1.6,Object.assign({},TL,{y:(TL.y||0)+0.008,rx:(TL.rx||0)+0.04}),'o'],[1.68,TL]];
  const trk={gun,L:[[0,'g'],[0.38,hm,'io'],[1.58,hm]],R:[[0,'g']],parts:{mag:[[0,null],[0.52,null],[0.7,out,'o'],[1.38,out],[1.58,null,'i3']]},
    ev:[[0.36,'grab',0.7],[0.52,'magRel',0.8],[0.64,'magOut',0.55],[0.9,()=>chkAmmoFlash()],[1.52,'magIn',0.8],[1.58,'magSeat',0.9]]};
  let t=1.62;
  if(o.slap!==false){ trk.L.push([t+0.08,H.magUnder(B,'mag',0.03),'o'],[t+0.14,H.magUnder(B,'mag',0),'i3']); trk.ev.push([t+0.14,'slap',0.7]);
    gun.push([t+0.14,Object.assign({},TL,{y:(TL.y||0)+0.01})],[t+0.2,TL]); t+=0.2; }
  if(o.ch&&s.mag>0) t=chkPress(G,o.ch,t+0.04,trk);   // sem munição o ferrolho já está travado atrás: não faz o press check
  return chkEnd(trk,t); }
// volta suave para a pegada
function chkEnd(trk,t){ const E=Math.max(t+0.5,trk.len||0);
  trk.L.push([E-0.4,'g','io'],[E,'g']); if(trk.R.length>1) trk.R.push([Math.max(E-0.32,trk.R[trk.R.length-1][0]+0.02),'g','io'],[E,'g']);
  trk.gun.push([E-0.36,{},'io'],[E,{}]); trk.len=E; return trk; }
function chkAmmoFlash(){ try{ const el=document.getElementById('ammo'); if(!el) return; el.classList.remove('chkf'); void el.offsetWidth; el.classList.add('chkf'); hudAmmo(); }catch(e){} }
v9Css(`#ammo.chkf{animation:chkf 1.1s ease-out}@keyframes chkf{0%{filter:brightness(1)}18%{filter:brightness(2.2) drop-shadow(0 0 8px rgba(255,220,150,.8));transform:scale(1.08)}100%{filter:brightness(1);transform:scale(1)}}`);
/* ---- por arma ---- */
const CHK_SPEC={
  stg44:{ch:{part:'ch',side:'R',pull:[0,0,0.05],hand:H.rightHand}},
  bar:{tilt:Object.assign({},T_MAG,{y:0.05,rx:0.12}),ch:{part:'ch',side:'R',pull:[0,0,0.055],hand:H.rightHand}},
  garand:{ch:{part:'ch',side:'R',pull:[0,0,0.04],hand:H.rightHand}},
  thompson:{ch:{part:'ch',side:'L',pull:[0,0,0.045],hand:(b,rel)=>H.hookTop(b,rel,-1),tilt:{x:-0.05,y:0.04,z:0.03,rx:0.12,ry:0.3,rz:-0.15}}},
  mp40:{ch:{part:'ch',side:'L',pull:[0,0,0.035],hand:(b,rel)=>HP([b.cx,b.y1+0.014,b.z1-0.006],[0.1,-0.35,-0.95],[-0.1,1,0.3],'hook',rel),tilt:{x:-0.05,y:0.05,z:0.03,rx:0.2,ry:0.25,rz:-0.1}}},
  ppsh:{ch:{part:'ch',side:'L',pull:[0,0,0.04],hand:H.hookLeft,tilt:{x:-0.06,y:0.05,z:0.03,rx:0.12,ry:0.4,rz:-0.45}}},
  ptrs:{tilt:Object.assign({},T_MAG,{x:-0.08,y:0.04,rx:0.1}),ch:{part:'ch',side:'R',pull:[0,0,0.07],hand:(b,rel)=>HP([b.x1+0.006,b.cy+0.004,b.z1-0.025],[-0.2,-0.3,-0.95],[1,0.25,0.1],'hook',rel)}},
  m1911:{tilt:{x:-0.05,y:0.05,z:-0.02,rx:0.22,ry:0.4,rz:-0.4},out:{t:[0,-0.035,0.004],r:[-5,0,0]},
    ch:{part:'slide',side:'L',pull:[0,0,0.024],hand:(b,rel)=>HP([b.x0-0.012,b.cy+0.006,b.z1-0.014],[0.25,0.92,-0.3],[-1,0.2,0.1],'hook',rel),tilt:{x:-0.06,y:0.04,z:-0.03,rx:0.15,ry:0.45,rz:-0.6}}},
  mg42:{out:{t:[0,-0.02,0.004],r:[-4,0,0]},slap:false}
};
const CHK_BUILD={
  kar98k(G){ if(!G.bolt) return null; const b=pbox(G.bolt), T={x:-0.1,y:0.04,z:0,rx:-0.06,ry:0.35,rz:-0.5}, LK=Object.assign({},T,{y:T.y+0.01,rz:T.rz-0.16}), up=rlBoltOff(G,0), bk=rlBoltOff(G,0.03), knob=rlBoltKnob(b,'bolt');
    return chkEnd({gun:[[0,{}],[0.3,T,'o'],[0.6,T],[0.82,LK,'io'],[1.3,LK],[1.46,T,'io'],[1.6,T],[1.66,Object.assign({},T,{z:T.z-0.008}),'o'],[1.74,T]],
      R:[[0,'g'],[0.1,'g'],[0.32,knob,'io'],[1.64,knob]],L:[[0,'g']],
      parts:{bolt:[[0,null],[0.34,null],[0.44,up,'o'],[0.6,bk,'io'],[1.42,bk],[1.52,up,'i'],[1.62,null,'o']]},
      ev:[[0.32,'grab',0.6],[0.42,'boltUp',0.7],[0.58,'boltBack',0.55],[0.9,()=>chkAmmoFlash()],[1.5,'boltFwd',0.8],[1.62,'boltDown',0.8]]},1.76); },
  trench(G){ if(!G.fore) return null; const T={x:-0.07,y:0.05,z:0.02,rx:0.12,ry:0.3,rz:-0.7}, LK=Object.assign({},T,{ry:T.ry+0.1,rz:T.rz-0.2}), pb={t:[0,0,0.032]}, grip={g:1,rel:'fore'};
    return chkEnd({gun:[[0,{}],[0.3,T,'o'],[0.55,T],[0.76,LK,'io'],[1.26,LK],[1.44,T,'io'],[1.5,T]],
      L:[[0,'g'],[0.2,grip],[1.46,grip]],R:[[0,'g']],parts:{fore:[[0,null],[0.4,null],[0.58,pb,'o'],[1.3,pb],[1.42,null,'i3']]},
      ev:[[0.44,'chBack',0.5],[0.9,()=>chkAmmoFlash()],[1.4,'chFwd',0.8]]},1.5); },
  ray(G){ if(!G.latch) return null; const Lb=pbox(G.latch), T={x:-0.06,y:0.05,z:0.02,rx:0.1,ry:0.45,rz:-0.4}, LK=Object.assign({},T,{y:T.y+0.01,rz:T.rz-0.2}), open={r:[0,0,60],pv:[Lb.x1,Lb.y0,Lb.cz]};
    const flick=HP([Lb.x0-0.004,Lb.y1+0.004,Lb.z0+0.012],[0.3,-0.3,-0.9],[-0.9,0.35,0.2],'thumbPush','latch');
    return chkEnd({gun:[[0,{}],[0.26,T,'o'],[0.5,T],[0.72,LK,'io'],[1.2,LK],[1.38,T,'io'],[1.5,Object.assign({},T,{x:T.x+0.006}),'o'],[1.58,T]],
      L:[[0,'g'],[0.22,flick,'io'],[1.36,flick],[1.5,HP(flick.p,flick.f,flick.b,'push','latch'),'i3']],R:[[0,'g']],
      parts:{latch:[[0,null],[0.3,null],[0.42,open,'o'],[1.4,open],[1.5,null,'i3']]},
      ev:[[0.22,'grab',0.6],[0.38,'magRel',0.6],[0.9,()=>chkAmmoFlash()],[1.5,'magSeat',0.8]]},1.6); },
  python(G){ if(!G.crane||!G.cyl) return null; const Bc=pbox(G.crane), Cy=pbox(G.cyl), open={r:[0,0,RV_ANG],pv:[Bc.x0+0.003,Bc.y0+0.003,Bc.cz]};
    const T0={x:-0.07,y:0.07,z:-0.05,rx:0.15,ry:0.5,rz:-0.45}, LK={x:-0.07,y:0.08,z:-0.05,rx:0.35,ry:0.55,rz:-0.62};
    const th=HP([Cy.x0-0.006,Cy.cy+0.004,Cy.cz+0.03],[0.1,-0.2,-1],[-1,0.15,0.05],'thumbPush','crane'), thO=HP(th.p,th.f,th.b,'open','crane'), push=HP([Cy.x0-0.012,Cy.cy,Cy.cz],[0.15,-0.15,-1],[-1,0.1,0.1],'push','crane');
    return chkEnd({gun:[[0,{}],[0.24,T0,'o'],[0.4,T0],[0.64,LK,'io'],[1.2,LK],[1.38,T0,'io'],[1.48,Object.assign({},T0,{rz:T0.rz+0.12}),'o'],[1.58,T0]],
      L:[[0,'g'],[0.2,th,'io'],[0.3,th],[0.46,thO,'o'],[1.3,thO],[1.42,push,'io'],[1.5,push,'i3']],R:[[0,'g']],
      parts:{crane:[[0,null],[0.3,null],[0.42,open,'o'],[1.42,open],[1.5,null,'i3']]},
      ev:[[0.24,'grab',0.6],[0.32,'cylOut',0.8],[0.9,()=>chkAmmoFlash()],[1.48,'cylIn',0.9]]},1.6); }
};
CHK_BUILD.db=CHK_BUILD.trench;
// reserva: só vira a arma para um lado e para o outro
function chkLook(){ const T1={x:-0.05,y:0.05,z:0.03,rx:0.12,ry:0.4,rz:-0.5}, T2={x:0.03,y:0.04,z:0.03,rx:0.05,ry:-0.3,rz:0.35};
  return chkEnd({gun:[[0,{}],[0.36,T1,'o'],[0.86,T1],[1.26,T2,'io'],[1.66,T2]],L:[[0,'g']],R:[[0,'g']],ev:[[0.3,'grab',0.4],[0.9,()=>chkAmmoFlash()]]},1.66); }
function chkBuild(s){ const G=gunModel.userData.vmp;
  if(CHK_BUILD[s.id]){ const A=CHK_BUILD[s.id](G); if(A) return A; }
  if(G.mag) return chkMag(G,CHK_SPEC[s.id]||{},s);
  return chkLook(); }
function chkStart(){ if(!chkCan()) return false; const s=curSlot(); if(!gripGet(s.id)) return false;
  let A=null; try{ A=chkBuild(s); }catch(e){ console.warn('[Bunker] conferir arma',e); A=null; }
  if(!A) return false; if(typeof INS!=='undefined'&&INS.on) INS.on=false;
  return vmaStart('check',A,A.len); }
/* ---- entrada: separa toque (recarrega) de segurar (confere) ---- */
{ const uw=updateWeapons; updateWeapons=function(dt){
    try{ const E=IN.edges, s=curSlot(); dt=Math.min(dt||0.016,0.1);
      if(G.state!=='playing'||!s||Wp.knifeOut||(WEAPONS[s.id]&&WEAPONS[s.id].sprite)) CHK.pend=false;
      else {
        if(E.has('reload')&&!CHK.pend&&chkHeld()){ E.delete('reload'); CHK.pend=true; CHK.hold=0; }
        else if(CHK.pend) E.delete('reload');
        if(CHK.pend){ if(chkHeld()){ CHK.hold+=dt; if(CHK.hold>=CHK.HOLD){ CHK.pend=false; chkStart(); } } else { CHK.pend=false; E.add('reload'); } } }
      if(VMA.on&&VMA.kind==='check'&&(IN.fire||IN.ads||P.sprinting||Wp.reloading||P.down)) vmaStop(true);
    }catch(e){ CHK.pend=false; }
    return uw.apply(this,arguments); }; }
v9On('reset',()=>{ CHK.pend=false; });
CMDS.conferir={d:'conferir · toca a animação de conferir a arma atual (o mesmo que segurar R)',f:()=>{ cprint(chkStart()?'conferindo '+curSlot().id:'agora não dá para conferir'); }};
