/* ================= v9 · ESCOLHA DE RISCO =================
   No fim das rodadas 10, 15, 20… aparece a proposta: a próxima rodada vem mais pesada (mais zumbis, mais vida, mais
   rápidos) e em troca todo ponto ganho nela vale o dobro. No solo é só escolher; no online o grupo vota (maioria aceita,
   empate recusa, 12 s para votar). O intervalo entre rodadas espera a decisão.
   Teclado: J aceita · K recusa · mouse nos botões · controle: direcional + ✕ */
const RISK={open:false,voted:false,round:0,next:0,yes:0,no:0,total:1,t:0,votes:new Map(),active:0,decided:false};
const RISK_MUL={count:1.4,hp:1.3,speed:1.12,pts:2};
v9Css(`#riskp{position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:30;width:min(440px,92vw);padding:18px 20px 16px;border-radius:14px;
  background:linear-gradient(180deg,rgba(40,6,6,.94),rgba(14,4,4,.94));border:1px solid rgba(255,80,60,.45);box-shadow:0 18px 48px rgba(0,0,0,.6),0 0 30px rgba(200,30,20,.25);color:#f3e6dc;
  font:14px/1.35 system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;display:none}
#riskp.on{display:block;animation:riskin .35s ease}
@keyframes riskin{0%{opacity:0;transform:translate(-50%,-10px) scale(.96)}100%{opacity:1;transform:translate(-50%,0) scale(1)}}
#riskp h3{margin:0 0 4px;font:700 22px/1.1 "Stardos Stencil",Impact,sans-serif;letter-spacing:.08em;color:#ff6a50;text-transform:uppercase}
#riskp p{margin:0 0 12px;color:#e2c9bd}
#riskp .rk{display:flex;gap:10px;justify-content:center}
#riskp button{flex:1;padding:11px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#f3e6dc;font:700 14px system-ui,sans-serif;cursor:pointer}
#riskp button.yes{background:linear-gradient(180deg,#b3261a,#7a130c);border-color:#ff7a60}
#riskp button:disabled{opacity:.45;cursor:default}
#riskp .kb{display:inline-block;margin-left:6px;padding:1px 6px;border-radius:4px;background:rgba(0,0,0,.4);font-size:11px;opacity:.8}
#riskp .vt{margin-top:10px;font-size:12px;color:#d8b8aa;min-height:16px}
#riskp .bar{height:3px;margin-top:10px;background:rgba(255,255,255,.12);border-radius:3px;overflow:hidden}#riskp .bar i{display:block;height:100%;background:#ff6a50;width:100%}
#riskhud{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:6;padding:4px 12px;border-radius:999px;background:rgba(120,10,6,.75);border:1px solid rgba(255,90,60,.6);
  color:#ffd8cc;font:700 11px/1 system-ui,sans-serif;letter-spacing:.14em;display:none;pointer-events:none}
#riskhud.on{display:block;animation:riskpulse 1.6s ease-in-out infinite}
@keyframes riskpulse{50%{box-shadow:0 0 16px rgba(255,60,40,.6)}}`);
const RISKP=document.createElement('div'); RISKP.id='riskp'; RISKP.innerHTML=`<h3>Escolha de risco</h3><p class="d"></p><div class="rk"><button class="yes" type="button">Aceitar o risco<span class="kb">J</span></button><button class="no" type="button">Recusar<span class="kb">K</span></button></div><div class="vt"></div><div class="bar"><i></i></div>`;
document.body.appendChild(RISKP);
const RISKH=document.createElement('div'); RISKH.id='riskhud'; RISKH.textContent='RODADA DE RISCO · PONTOS ×2'; document.body.appendChild(RISKH);
RISKP.querySelector('.yes').addEventListener('click',()=>riskVote(true));
RISKP.querySelector('.no').addEventListener('click',()=>riskVote(false));
addEventListener('keydown',e=>{ if(!RISK.open||RISK.voted||e.repeat) return; if(CON&&CON.open) return; if(e.code==='KeyJ'){ e.preventDefault(); riskVote(true); } else if(e.code==='KeyK'){ e.preventDefault(); riskVote(false); } },true);
function riskPeers(){ let n=1; try{ for(const rp of NET.players.values()) if(rp&&!rp.left) n++; }catch(e){} return n; }
function riskUI(){ const nx=RISK.next; RISKP.querySelector('.d').innerHTML=`A rodada ${nx} vem com <b>+${Math.round((RISK_MUL.count-1)*100)}% de zumbis</b>, <b>+${Math.round((RISK_MUL.hp-1)*100)}% de vida</b> e mais rápidos.<br>Em troca, <b>todos os pontos dela valem o dobro</b>.`;
  const on=!!NET.mode; RISKP.querySelector('.vt').textContent=on?`Votação do grupo: ${RISK.yes} sim · ${RISK.no} não · ${RISK.total} jogador${RISK.total>1?'es':''}`+(RISK.voted?' · você já votou':''):'';
  for(const b of RISKP.querySelectorAll('button')) b.disabled=RISK.voted; }
function riskOpen(r,total){ RISK.open=true; RISK.voted=false; RISK.round=r; RISK.next=r+1; RISK.yes=0; RISK.no=0; RISK.total=total||riskPeers(); RISK.t=12; RISK.votes=new Map(); RISK.decided=false;
  riskUI(); RISKP.classList.add('on');
  try{ Snd.sample('z_groan_big',{vol:0.5,rate:0.7,prio:1}); const o=Snd.out(0.6,0,0.4,null); if(o){ const t=Snd.now; for(const d of [0,0.18]) Snd.oscTo(o,{t:t+d,type:'sine',freq:68,freqEnd:38,dur:0.22,gain:0.6,attack:0.003}); } }catch(e){}
  try{ padRumble(0.5,0,70); setTimeout(()=>padRumble(0.35,0,60),180); }catch(e){}
  if(!PAD.active){ try{ RISK.freed=!!document.pointerLockElement; document.exitPointerLock&&document.exitPointerLock(); }catch(e){} }
  setTimeout(()=>{ if(PAD.active&&RISK.open){ try{ padFocus(RISKP.querySelector('.yes')); }catch(e){} } },60); }
function riskClose(){ RISK.open=false; RISKP.classList.remove('on'); if(RISK.freed&&G.state==='playing'){ RISK.freed=false; try{ requestLock(); }catch(e){} } }
// voto local (no solo decide na hora)
function riskVote(yes){ if(!RISK.open||RISK.voted) return; RISK.voted=true; try{ Snd.ui('select'); }catch(e){} try{ padRumble(yes?0.7:0.2,0.4,yes?90:40); }catch(e){}
  if(!NET.mode){ riskDecide(yes); return; }
  if(NET.mode==='host'){ RISK.votes.set('host',yes); riskTally(); } else { netAct(['rkv',yes?1:0,RISK.round]); RISK.yes+=yes?1:0; RISK.no+=yes?0:1; riskUI(); } }
// anfitrião conta os votos e avisa todo mundo
function riskTally(){ let y=0,n=0; for(const v of RISK.votes.values()) v?y++:n++; RISK.yes=y; RISK.no=n; RISK.total=riskPeers(); riskUI();
  pushEv(['rkt',y,n,RISK.total]); if(y+n>=RISK.total) riskDecide(y>n); }
V9NET.act.rkv=(peer,a)=>{ if(!RISK.open||RISK.decided||(a[3]|0)!==RISK.round) return; RISK.votes.set(peer,!!a[2]); riskTally(); };
V9NET.ev.rko=e=>{ riskOpen(e[2]|0,e[3]|0); };
V9NET.ev.rkt=e=>{ if(!RISK.open) return; RISK.yes=e[2]|0; RISK.no=e[3]|0; RISK.total=e[4]|0; riskUI(); };
V9NET.ev.rkd=e=>{ riskApplyDecision(!!e[2],e[3]|0); };
function riskDecide(yes){ if(RISK.decided) return; RISK.decided=true; if(NET.mode==='host') pushEv(['rkd',yes?1:0,RISK.next]); riskApplyDecision(yes,RISK.next); }
function riskApplyDecision(yes,next){ RISK.decided=true; riskClose(); if(yes){ RISK.active=next; banner('RISCO ACEITO',`Rodada ${next}: mais zumbis, mais fortes e mais rápidos · pontos ×2`,'red');
    try{ Snd.sample('boss_roar',{vol:0.35,rate:1.3,prio:1}); }catch(e){} try{ padRumble(0.9,0.5,200); }catch(e){} }
  else { RISK.active=0; banner('RISCO RECUSADO','Segue o jogo normal','gold'); } }
// oferta no fim da rodada (o anfitrião/solo decide quando)
v9On('roundEnd',r=>{ try{ if(NET.mode==='client') return; if(!(r>=10)||(r-10)%5!==0) return; if(G.state!=='playing'||(typeof x1Live==='function'&&x1Live())||CUR==='sandbox'||CUR==='fun') return;
  const total=riskPeers(); setTimeout(()=>{ if(G.state!=='playing'&&G.state!=='paused') return; riskOpen(r,total); if(NET.mode==='host') pushEv(['rko',r,total]); },1600); }catch(e){} });
// o intervalo espera a decisão; o tempo de votação acaba recusando (ou contando o que tiver)
v9On('always',dt=>{ if(!RISK.open) return; if(NET.mode!=='client'&&G.roundGap>0&&G.roundGap<1.2) G.roundGap=1.2;
  if(G.state==='paused'&&!NET.mode) return; RISK.t-=dt; const bar=RISKP.querySelector('.bar i'); if(bar) bar.style.width=Math.max(0,RISK.t/12*100)+'%';
  if(RISK.t<=0&&!RISK.decided){ if(!NET.mode) riskDecide(false); else if(NET.mode==='host') riskDecide(RISK.yes>RISK.no); } });
// controle: enquanto a escolha está aberta (e ainda não votou), o controle navega nos botões
{ const pg0=padGameplay; padGameplay=function(){ if(RISK.open&&!RISK.voted) return false; return pg0.apply(this,arguments); }; }
{ const np0=v9NoPause; v9NoPause=function(){ return (RISK.open&&!RISK.voted)||np0(); }; }
/* ---- efeitos da rodada de risco ---- */
{ const sr0=startRound; startRound=function(r){ const res=sr0.apply(this,arguments); try{ if(RISK.active===r&&NET.mode!=='client'){ G.toSpawn=Math.ceil(G.toSpawn*RISK_MUL.count); G.zhp=Math.floor(G.zhp*RISK_MUL.hp); } }catch(e){} return res; }; }
{ const mz0=makeZombie; makeZombie=function(){ const z=mz0.apply(this,arguments); try{ if(z&&RISK.active===G.round&&NET.mode!=='client'&&z.speed) z.speed*=RISK_MUL.speed; }catch(e){} return z; }; }
{ const ap0=addPoints; addPoints=function(n,raw){ if(RISK.active&&RISK.active===G.round&&!G.inGap&&n>0) n=Math.round(n*RISK_MUL.pts); return ap0.call(this,n,raw); }; }
v9On('roundStart',r=>{ RISKH.classList.toggle('on',RISK.active===r); if(RISK.active===r) banner('RODADA DE RISCO','Pontos ×2 · aguente firme','red'); });
v9On('roundEnd',r=>{ if(RISK.active===r){ RISK.active=0; RISKH.classList.remove('on'); try{ addDrax(5); toast('Rodada de risco superada! +5 drax'); }catch(e){} } });
v9On('always',()=>{ if(G.state!=='playing'&&G.state!=='paused'&&(RISK.open||RISK.active)){ RISK.active=0; riskClose(); RISKH.classList.remove('on'); } });
CMDS.risco={cheat:1,d:'risco · abre a escolha de risco agora (teste)',f:()=>{ riskOpen(G.round||10,riskPeers()); if(NET.mode==='host') pushEv(['rko',G.round||10,riskPeers()]); } };
