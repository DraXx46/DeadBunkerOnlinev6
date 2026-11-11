/* ================= v9 · SINUCA 2.0 =================
   - A mesa também aparece no lobby de todos os mapas (antes da partida), além do bar da cidade.
   - Efeitos ao encaçapar: poeira de giz, brilho na caçapa, chocalho da bola, aviso grande com a bola e a cor.
   - Regras mais rígidas no bola 8: depois do toque alguma bola precisa ir à tabela (ou cair); saída precisa
     levar 4 bolas à tabela ou encaçapar; toda falta dá BOLA NA MÃO ao adversário (WASD posiciona a branca);
     3 faltas seguidas perde a partida. No modo sozinho, falta custa 2 tacadas.
   - Fim de partida com tela de vencedor, confete e fanfarra. */
function poolWant(){ if(G.state==='lobby') return 'lobby:'+CUR; if(CUR==='fun') return 'fun'; if(CUR==='city') return 'city'; return null; }
function poolCtx(){ const w=poolWant(); return !!w&&POOL.at===w; }
function poolLive(){ return G.state==='playing'||G.state==='lobby'; }
function poolLobbySpot(){ const sp=MAPS[CUR]&&MAPS[CUR].start; if(!sp) return null; const sx=sp[0], sz=sp[1];
  const r0=roomOf[Math.floor(sz/S)]&&roomOf[Math.floor(sz/S)][Math.floor(sx/S)];
  const free=(x,z)=>{ const gx=Math.floor(x/S), gz=Math.floor(z/S); const ch=grid[gz]&&grid[gz][gx]; if(ch==null||ch==='#'||ch==='W'||ch==='D'||ch===' ') return false; const r=roomOf[gz]&&roomOf[gz][gx]; return !r0||r===r0; };
  for(let rad=3.2;rad<=10;rad+=0.6) for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, x=sx+Math.cos(a)*rad, z=sz+Math.sin(a)*rad;
    for(const ry of [0,Math.PI/2]){ const hl=(PT.L/2+1.1), hw=(PT.W/2+1.0); let ok=true;
      for(let u=-hl;u<=hl&&ok;u+=0.5) for(let v=-hw;v<=hw&&ok;v+=0.5){ const c=Math.cos(ry), s=Math.sin(ry); if(!free(x+u*c+v*s,z-u*s+v*c)) ok=false; }
      if(!ok) continue; if(lobbyInteractables.some(q=>Math.hypot(q.x-x,q.z-z)<PT.L/2+1.6)) continue; return {x,z,ry}; } }
  return null; }
function poolCtxSwitch(){ const w=poolWant(); if(w===POOL.at||(w&&w===POOL.fail)) return;
  if(POOL.on) poolExit(); if(POOL.menu){ try{ POOL.menu.remove(); }catch(e){} POOL.menu=null; }
  if(!w){ POOL.at=null; POOL.inLobby=false; return; }
  let s=null; if(w==='city') s=POOL.home; else if(w==='fun') s=(typeof FUN!=='undefined'&&FUN.poolSpot)||null; else s=poolLobbySpot();
  if(!s){ POOL.fail=w; return; } POOL.fail=null;
  poolPlace(s.x,s.z,s.ry,w!=='city'); POOL.at=w; POOL.inLobby=w.startsWith('lobby'); POOL.mode=null; POOL.over=false; POOL.players=[]; poolRack(); poolSync(); }
/* ---------- efeitos ao encaçapar ---------- */
v9Css(`#poolPop{position:fixed;left:50%;top:30%;transform:translate(-50%,-50%) scale(.6);z-index:26;pointer-events:none;opacity:0;text-align:center;transition:transform .35s cubic-bezier(.2,1.6,.4,1),opacity .25s}
#poolPop.on{opacity:1;transform:translate(-50%,-50%) scale(1)}#poolPop .bb{width:74px;height:74px;border-radius:50%;margin:0 auto 6px;display:grid;place-items:center;font:700 28px sans-serif;color:#111;box-shadow:0 0 30px rgba(255,220,120,.6),inset -10px -12px 20px rgba(0,0,0,.35)}
#poolPop .bb b{background:#f4f0e2;border-radius:50%;width:36px;height:36px;display:grid;place-items:center}#poolPop .tx{font:700 24px "Stardos Stencil",Impact;color:#ffd24a;text-shadow:0 2px 0 #000,0 0 16px rgba(255,180,40,.6);letter-spacing:.08em}
#poolWin{position:fixed;inset:0;z-index:41;display:grid;place-items:center;pointer-events:none;background:radial-gradient(circle,rgba(20,40,20,.45),rgba(0,0,0,.75));opacity:0;transition:opacity .4s}#poolWin.on{opacity:1}
#poolWin .bx{text-align:center;transform:scale(.7);transition:transform .5s cubic-bezier(.2,1.5,.4,1)}#poolWin.on .bx{transform:scale(1)}
#poolWin .tr{font-size:84px;filter:drop-shadow(0 0 22px rgba(255,200,60,.8))}#poolWin h2{margin:4px 0;font:700 56px "Stardos Stencil",Impact;color:#ffd24a;text-shadow:0 3px 0 #000,0 0 30px rgba(255,170,40,.7);letter-spacing:.06em}
#poolWin p{margin:4px 0;color:#e8f0e4;font:16px "Special Elite",monospace}#poolWin small{color:#8aa890;font:13px "Special Elite",monospace}
#poolWin i.cf{position:absolute;top:-20px;width:9px;height:14px;animation:pcf linear forwards}@keyframes pcf{to{transform:translateY(110vh) rotate(720deg)}}
.v9pool .fl{color:#ff7a66;font-size:11px}`);
const POP=v9El('div',''); POP.id='poolPop'; document.body.appendChild(POP);
function poolBallCss(n){ const c='#'+(PCOL[n>8?n-8:n]||0xffffff).toString(16).padStart(6,'0'); return n>8?`linear-gradient(#f4f0e2 22%,${c} 22%,${c} 78%,#f4f0e2 78%)`:n===0?'#f4f0e2':c; }
function poolPopup(n,txt){ POP.innerHTML=`<div class="bb" style="background:${poolBallCss(n)}">${n?`<b>${n}</b>`:''}</div><div class="tx">${txt}</div>`; POP.classList.add('on'); clearTimeout(POP._t); POP._t=setTimeout(()=>POP.classList.remove('on'),1300); }
{ const _pp=poolPot; poolPot=function(b,px,pz){ const r=_pp.apply(this,arguments); try{ const w=poolWorld(px,pz), y=PT.H+0.02, n=b.n;
    emit('dust',w.x,y,w.z,10,0.8,0.5,0.3); emit('spark',w.x,y+0.03,w.z,n===8?22:n===0?4:10,n===8?2.2:1.4,0.5,-0.4);
    boomLight&&(boomLight.position.set(w.x,y+0.4,w.z),boomLight.color.setHex(n===0?0xffffff:(PCOL[n>8?n-8:n]||0xffd24a)),boomLight.intensity=n===8?2.4:1.1);
    // chocalho: a bola rolando dentro da caçapa
    const o=Snd.out(0.55,0,0.2,null), t=Snd.now; for(let i=0;i<5;i++) Snd.burstTo(o,{t:t+0.06+i*0.07+i*i*0.006,type:'bandpass',freq:1400-i*160,q:4,dur:0.02,gain:0.5-i*0.07});
    Snd.oscTo(o,{t:t+0.45,freq:120,freqEnd:70,dur:0.2,gain:0.35});
    if(n===8) try{ Snd.sample('slot_ding',{vol:0.7,rate:0.8,prio:1}); }catch(e){}
    if(POOL.on){ shake(n===8?0.12:0.04); poolPopup(n,n===0?'BRANCA NA CAÇAPA!':n===8?'A BOLA 8 CAIU!':`BOLA ${n} NA CAÇAPA`); }
  }catch(e){} return r; }; }

/* ---------- regras mais rígidas ---------- */
{ const _th=poolThud; poolThud=function(v){ if(POOL.moving&&POOL.firstHit!=null) POOL.rails=(POOL.rails|0)+1; if(POOL.moving&&POOL.break) POOL.breakRails=(POOL.breakRails|0)+1; return _th.apply(this,arguments); }; }
{ const _ds=poolDoShot; poolDoShot=function(){ POOL.rails=0; POOL.breakRails=0; POOL.wasInHand=POOL.inHand; POOL.inHand=false; return _ds.apply(this,arguments); }; }
{ const _rs=poolResolve; poolResolve=function(){ const pot=POOL.pottedNow.slice(), mode=POOL.mode, br=POOL.break, turn=POOL.turn;
    const noRail=POOL.firstHit!=null&&!pot.length&&!(POOL.rails>0), badBreak=br&&!pot.length&&(POOL.breakRails|0)<4;
    if(mode==='solo'){ const cue=pot.includes(0); _rs.apply(this,arguments); if(cue){ POOL.shots++; poolMsg('Branca na caçapa: +2 tacadas de punição'); } else if(noRail&&!POOL.over){ POOL.shots++; poolMsg('Nenhuma bola foi à tabela: +1 tacada'); } return; }
    if(mode!=='local'&&mode!=='online') return _rs.apply(this,arguments);
    const before=POOL.players.map(p=>p.score); _rs.apply(this,arguments); if(POOL.over) return;
    let foul=POOL.turn!==turn&&/Falta/.test(POOL.msg||'');
    const P1=POOL.players[turn], other=POOL.players[1-turn];
    if(!foul&&(noRail||badBreak)){ foul=true; POOL.turn=1-turn; poolMsg((badBreak?'Saída fraca: precisa levar 4 bolas à tabela':'Falta: nenhuma bola foi à tabela depois do toque')+'. Bola na mão para '+other.name); }
    if(foul){ P1.fouls=(P1.fouls|0)+1; POOL.inHand=true; if(!/Bola na mão/.test(POOL.msg)) poolMsg(POOL.msg+' · bola na mão (WASD posiciona a branca)',3.6);
      if(P1.fouls>=3){ poolMsg(P1.name+' fez 3 faltas seguidas e perdeu',5); poolWin(1-turn); return; }
      try{ const o=Snd.out(0.6,0,0.1,null); Snd.oscTo(o,{freq:220,freqEnd:150,dur:0.25,gain:0.25,type:'square'}); }catch(e){} }
    else P1.fouls=0; }; }
// bola na mão: WASD move a branca, relativo à câmera; não deixa encostar em outra bola
v9On('always',dt=>{ if(!POOL.on||!POOL.inHand||POOL.moving||POOL.over||!poolMyTurn()) return; const K=POOL.hk||{}; let f=0, s=0;
  if(K.KeyW||K.ArrowUp) f+=1; if(K.KeyS||K.ArrowDown) f-=1; if(K.KeyD||K.ArrowRight) s+=1; if(K.KeyA||K.ArrowLeft) s-=1; if(!f&&!s) return;
  const [dx,dz]=poolAimDir(), c=POOL.balls[0]; const sp=0.5*dt; let nx=c.x+(dx*f+(-dz)*s)*sp, nz=c.z+(dz*f+dx*s)*sp;
  const L=PT.L/2-PT.r, W=PT.W/2-PT.r; nx=clamp(nx,-L,L); nz=clamp(nz,-W,W);
  if(POOL.balls.some(b=>b.n&&!b.in&&Math.hypot(b.x-nx,b.z-nz)<PT.r*2.05)) return; c.x=nx; c.z=nz; c.in=false; c.m.visible=true; poolSync(); });
{ const _hud=poolHud; poolHud=function(){ _hud.apply(this,arguments); if(!POOL.on||!PHUD||PHUD.hidden) return;
    if(POOL.inHand&&poolMyTurn()&&!POOL.moving&&!POOL.over){ const ms=PHUD.querySelector('.ms'); if(ms&&!/mão/.test(ms.textContent)) ms.textContent='BOLA NA MÃO · WASD posiciona a branca, depois dê a tacada'; }
    if(POOL.mode!=='solo'){ const pl=PHUD.querySelectorAll('.pl div'); POOL.players.forEach((p,i)=>{ if(pl[i]&&p.fouls) pl[i].insertAdjacentHTML('beforeend',` <span class="fl">${'✕'.repeat(p.fouls)}</span>`); }); } }; }
// tela de vencedor
const PWIN=v9El('div',''); PWIN.id='poolWin'; document.body.appendChild(PWIN);
{ const _w=poolWin; poolWin=function(i){ const r=_w.apply(this,arguments); try{
    const solo=POOL.mode==='solo', w=solo?null:POOL.players[i];
    const title=solo?'MESA LIMPA!':(w?w.name:'Fim')+' VENCEU!', sub=solo?`${POOL.shots} tacadas`:POOL.players.map(p=>`${p.name}: ${p.score} bolas${p.group?' ('+p.group+')':''}`).join(' · ');
    let cf=''; const cols=['#ffd24a','#e0301f','#1a3ab8','#3ad14a','#f4f0e2','#c81d1d']; for(let k=0;k<60;k++) cf+=`<i class="cf" style="left:${(Math.random()*100).toFixed(1)}%;background:${cols[k%6]};animation-duration:${(2+Math.random()*2.5).toFixed(2)}s;animation-delay:${(Math.random()*0.8).toFixed(2)}s"></i>`;
    PWIN.innerHTML=`${cf}<div class="bx"><div class="tr">🏆</div><h2>${title}</h2><p>${sub}</p><small>R · revanche   E · sair da mesa</small></div>`; PWIN.classList.add('on');
    clearTimeout(PWIN._t); PWIN._t=setTimeout(()=>PWIN.classList.remove('on'),6500);
    const o=Snd.out(0.7,0,0.35,null), t=Snd.now; [[523,0],[659,0.12],[784,0.24],[1047,0.38]].forEach(([f,d])=>Snd.oscTo(o,{t:t+d,type:'triangle',freq:f,dur:d===0.38?0.9:0.2,gain:0.18,attack:0.005}));
  }catch(e){} return r; }; }
{ const _pn=poolNew; poolNew=function(){ PWIN.classList.remove('on'); POOL.inHand=false; const r=_pn.apply(this,arguments); for(const p of POOL.players) p.fouls=0; return r; }; }
{ const _pe=poolExit; poolExit=function(){ PWIN.classList.remove('on'); return _pe.apply(this,arguments); }; }
