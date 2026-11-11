/* ================= v9 · ÔNIBUS E CACHORROS =================
   - O ônibus só sai quando não sobra nenhum zumbi vivo (entre uma rodada e outra) — ver patch p40.
   - Entrar no ônibus solta a mordida do cachorro; durante a saída e a viagem não existem cachorros perto do ônibus.
   - A mordida não prende mais o jogador na parada quando o ônibus parte.
   - Zumbi que está do lado de fora não acerta quem está dentro do ônibus em movimento.
   - Cachorro morre com um tiro e o QTE ficou bem mais curto. */
function tzRoundClear(){ if((G.toSpawn|0)>0) return false; for(const z of zombies){ if(!z.dead&&z.state!=='dying') return false; } return true; }
function tzRideActive(){ return CUR==='tz'&&TZB.present&&(TZB.ph==='depart'||TZB.ph==='road'); }
function tzShield(px,pz,z){ if(!z||!tzRideActive()) return false; if(!tzInBus(px,pz,0.35)) return false; if(tzInBus(z.pos.x,z.pos.z,0.2)) return false; if(z.win&&z.win.bus) return false; return true; }
{ const _ht=hurtTarget; hurtTarget=function(T,amt,z){ try{ if(T){ const px=T.local?P.pos.x:(NET.players.get(T.key)||{}).x, pz=T.local?P.pos.z:(NET.players.get(T.key)||{}).z; if(px!=null&&tzShield(px,pz,z)) return; } }catch(e){} return _ht.apply(this,arguments); }; }
{ const _hp=hurtPlayer; hurtPlayer=function(amt,z){ try{ if(z&&tzShield(P.pos.x,P.pos.z,z)) return; }catch(e){} return _hp.apply(this,arguments); }; }
// a mordida acaba se o ônibus parte com você dentro (antes você ficava preso na parada)
{ const _tm=tzMove; tzMove=function(dx,dz,teleport){ try{ if(DOGQ.on&&tzInBus(P.pos.x,P.pos.z,0.6)){ if(DOGQ.pos){ DOGQ.pos.x+=dx; DOGQ.pos.z+=dz; } dogGrabEnd(true,true); } }catch(e){} return _tm.apply(this,arguments); }; }
v9On('frame',dt=>{ if(CUR!=='tz'||!TZB.present) return;
  const inBus=tzInBus(P.pos.x,P.pos.z,0.35), rideish=TZB.ph==='leave'||TZB.ph==='depart'||TZB.ph==='road';
  // entrou no ônibus: o cachorro solta
  if(DOGQ.on&&inBus) dogGrabEnd(true,true);
  if(NET.mode==='client') return;
  for(const z of zombies.slice()){ if(z.kind!=='dog'||z.dead) continue;
    const near=Math.hypot(z.pos.x-TZB.pos.x,z.pos.z-TZB.pos.z);
    if((TZB.ph==='depart'||TZB.ph==='road')&&near<40){ removeZombie(z); G.toSpawn++; continue; }
    if(rideish&&tzInBus(z.pos.x,z.pos.z,1.2)){ if(z.grabbing){ const rp=NET.players.get(z.grabbing); if(rp) rp.dogGrab=null; } removeZombie(z); G.toSpawn++; } } });
// cachorro: um tiro basta
{ const _dz=damageZombie; damageZombie=function(z,amt,part,src){ if(z&&z.kind==='dog'&&!z.dead&&amt>0) arguments[1]=z.hp+1; return _dz.apply(this,arguments); }; }
// QTE bem mais rápido: poucas facadas e janela curta
dogNeed=function(){ return (G.round||1)>=20?5:4; };
{ const _gs=dogGrabStart; dogGrabStart=function(){ const r=_gs.apply(this,arguments); if(DOGQ.on){ DOGQ.need=dogNeed(); DOGQ.dur=2.2; dogHud(true); } return r; }; }
