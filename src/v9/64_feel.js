/* ================= v9 · SENSAÇÃO DE JOGO =================
   Câmera lenta no último zumbi da rodada: o tempo desacelera, a câmera fecha um pouco, o som abafa e a cor some por um
   instante; depois tudo volta com um "respiro". No solo o mundo inteiro desacelera; no online (onde o tempo é do anfitrião)
   o efeito é só local: câmera, som, cor e o ragdoll do último corpo caindo devagar. */
const SLOW={on:false,t:0,k:1,ts0:1,fov:0,last:null};
const SLOW_IN=0.12, SLOW_HOLD=0.95, SLOW_OUT=0.55;   // segundos reais
v9Css(`#game.slowfx{filter:saturate(.45) contrast(1.12) brightness(.96);transition:filter .25s}
#slowvig{position:fixed;inset:0;pointer-events:none;z-index:3;opacity:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.55) 100%);transition:opacity .25s}
#slowvig.on{opacity:1}`);
const SLOW_V=document.createElement('div'); SLOW_V.id='slowvig'; document.body.appendChild(SLOW_V);
function slowStart(){ if(SLOW.on) return; SLOW.on=true; SLOW.t=0; SLOW.solo=!NET.mode; SLOW.ts0=CHEAT.ts||1;
  try{ Snd.muffle(true); }catch(e){}
  try{ const o=Snd.out(0.8,0,0.4,null); if(o){ const t=Snd.now; Snd.burstTo(o,{t,type:'lowpass',freq:500,dur:0.9,gain:0.35,attack:0.05}); Snd.oscTo(o,{t,type:'sine',freq:62,freqEnd:34,dur:1.2,gain:0.5,attack:0.01}); Snd.oscTo(o,{t:t+0.02,type:'sine',freq:880,freqEnd:220,dur:0.9,gain:0.05,attack:0.02}); } }catch(e){}
  try{ padRumble(0.6,0.2,140); setTimeout(()=>padRumble(0.25,0,260),180); }catch(e){}
  const g=document.getElementById('game'); if(g) g.classList.add('slowfx'); SLOW_V.classList.add('on'); }
function slowEnd(){ SLOW.on=false; SLOW.k=1; if(SLOW.solo) CHEAT.ts=SLOW.ts0; try{ Snd.muffle(false); }catch(e){}
  try{ const o=Snd.out(0.6,0,0.3,null); if(o) Snd.burstTo(o,{t:Snd.now,type:'bandpass',freq:1200,q:0.7,dur:0.45,gain:0.25,attack:0.12}); }catch(e){}
  const g=document.getElementById('game'); if(g) g.classList.remove('slowfx'); SLOW_V.classList.remove('on'); }
// o tempo real (não o do jogo) conduz o efeito
let slowLast=performance.now();
setInterval(()=>{ const now=performance.now(), rdt=Math.min(0.1,(now-slowLast)/1000); slowLast=now; if(!SLOW.on) return;
  if(G.state!=='playing'&&G.state!=='paused'){ slowEnd(); return; }
  if(G.state==='paused') return; SLOW.t+=rdt; const t=SLOW.t;
  let k; if(t<SLOW_IN) k=1-(t/SLOW_IN)*0.78; else if(t<SLOW_IN+SLOW_HOLD) k=0.22; else if(t<SLOW_IN+SLOW_HOLD+SLOW_OUT){ const q=(t-SLOW_IN-SLOW_HOLD)/SLOW_OUT; k=0.22+0.78*q*q*(3-2*q); } else { slowEnd(); return; }
  SLOW.k=k; if(SLOW.solo) CHEAT.ts=SLOW.ts0*k;
  SLOW.fov=(1-k)/0.78; },16);
// o último corpo cai devagar também no online (o ragdoll é local)
{ const zt0=zrTick; zrTick=function(E,dt){ return zt0.call(this,E,SLOW.on&&!SLOW.solo?dt*SLOW.k:dt); }; }
// câmera fecha um pouco durante o efeito
{ const vc0=v9Cam; v9Cam=function(dt){ const r=vc0.apply(this,arguments); if(SLOW.on&&SLOW.fov>0.01&&G.state==='playing'){ camera.fov=Math.max(20,camera.fov-SLOW.fov*7); camera.updateProjectionMatrix(); } return r; }; }
// gatilho: fim de rodada (o último zumbi acabou de cair) — no anfitrião, no solo e nos convidados
v9On('roundEnd',r=>{ try{ if(!(r>0)||G.state!=='playing'||(typeof x1Live==='function'&&x1Live())||CUR==='sandbox'||CUR==='fun') return; if(CFG.noSlow) return; slowStart(); }catch(e){} });
CMDS.camera_lenta={d:'camera_lenta [on|off] · efeito de câmera lenta no último zumbi da rodada (teste: sem argumento)',f:a=>{ const c=(a[0]||'').toLowerCase(); if(c==='off'){ CFG.noSlow=true; cprint('câmera lenta desligada'); return; } if(c==='on'){ CFG.noSlow=false; cprint('câmera lenta ligada'); return; } slowStart(); cprint('câmera lenta'); } };
