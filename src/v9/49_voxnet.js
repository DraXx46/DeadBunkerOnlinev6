/* ================= v9 · VOZES NO ONLINE E FILA DE FALAS =================
   - Online, todo mundo ouve as falas dos outros personagens (habilidade, ultimate, comentários no meio da partida).
     A fala de início de rodada é só sua: cada jogador ouve o próprio personagem.
   - Nunca duas vozes ao mesmo tempo: o anfitrião é quem libera cada fala (quem pede enquanto alguém fala fica quieto),
     e as conversas em dupla também esperam a fala atual terminar.
   - No mapa do ônibus, enquanto o Motorista 115 fala nenhuma voz de personagem é ativada (e a que estiver tocando é cortada). */
const VOXG={until:0,h:null,driverUntil:0};
function voxBusy(){ const n=performance.now(); return n<VOXG.until||n<VOXG.driverUntil||(typeof COOP_STATE!=='undefined'&&n<(COOP_STATE.voiceLockUntil||0)); }
function voxStopAll(){ if(VOXG.h){ try{ VOXG.h.stop(0.08); }catch(e){} VOXG.h=null; } try{ voxRecStop(); }catch(e){} }
// falas possíveis de um personagem numa situação: gravadas (arquivo) ou só texto (voz do navegador)
function voxLines(k,sit){ const R=VOXREC[k]; if(R) return (R[sit]||[]).map(e=>({t:e[1],f:e[0],d:e[2]}));
  const L=(VOX[k]&&VOX[k][sit])||[]; return L.map(t=>({t,f:null,d:Math.max(1.6,t.length/12+0.6)})); }
function voxChoose(k,sit){ const pool=voxLines(k,sit); if(!pool.length) return -1;
  const rec=voxRecent[k+sit]||(voxRecent[k+sit]=[]); let idx=pool.map((e,i)=>i).filter(i=>!rec.includes(pool[i].t)); if(!idx.length){ rec.length=0; idx=pool.map((e,i)=>i); }
  const ready=idx.filter(i=>pool[i].f&&Snd.hasSample(pool[i].f)), i=pick(ready.length?ready:idx);
  rec.push(pool[i].t); if(rec.length>Math.max(1,pool.length-1)) rec.shift(); return i; }
function voxCharOf(k){ return k==='vamp'?'recruta':k; }
function voxFem(k,cv){ try{ const V=CHARS[voxCharOf(k)].vars[cv]||{}; return !!(V.look&&V.look.fem); }catch(e){ return false; } }
function voxName(k){ try{ return k==='vamp'?'Conde':CHARS[voxCharOf(k)].name; }catch(e){ return k; } }

// toca uma fala: a sua (opt.own) ou a de outro jogador (opt.peer), com a legenda pelo tempo do áudio
function voxPlay(k,sit,i,opt){
  const e=voxLines(k,sit)[i]; if(!e) return 0;
  try{ voxRecPreload(k); }catch(err){}
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(err){}
  voxStopAll();
  let dur=e.d; const on=(+CFG.voice||0)>0;
  let sx=null,sz=null; if(!opt.own&&opt.peer){ const rp=coopRemoteById(opt.peer); if(rp&&rp.x!=null){ sx=rp.x; sz=rp.z; } }
  if(e.f){
    if(on&&Snd.hasSample(e.f)){ const o={vol:voxRecVol()*(opt.own?1:0.9),prio:true,wet:0.06};
      if(sx!=null&&Math.hypot(P.pos.x-sx,P.pos.z-sz)<COOP_NEAR_DISTANCE){ o.x=sx; o.z=sz; o.range=45; o.minVol=0.55; }
      const h=Snd.sample(e.f,o); if(h){ VOXG.h=h; if(h.src&&h.src.buffer) dur=h.src.buffer.duration; } }
    else if(!Snd.hasSample(e.f)) try{ Snd.sample(e.f,{vol:0}); }catch(err){}
  } else if(on&&window.speechSynthesis){
    try{ const vv=VOX_VOICE[k]||{p:1,r:1}, fem=voxFem(k,opt.own?PROG.cv:opt.cv), u=new SpeechSynthesisUtterance(e.t); u.lang='pt-BR';
      u.pitch=fem&&k!=='helena'&&k!=='iara'?Math.max(vv.p,1.05):vv.p; u.rate=vv.r; u.volume=opt.own?1:0.92; speechSynthesis.speak(u); }catch(err){}
  }
  abCaption(e.t); if(!opt.own&&abCap) abCap.textContent=`${voxName(k)}: “${e.t}”`; abCapT=dur+0.2;
  VOXG.until=performance.now()+dur*1000+250;
  return dur;
}

voxSay=function(sit,force){
  if(G.state!=='playing') return false;
  if(voxBusy()) return false;                       // alguém (ou o motorista) já está falando
  if(!force&&voxGap>0) return false;
  const k=voxKey(), i=voxChoose(k,sit); if(i<0) return false;
  const e=voxLines(k,sit)[i];
  voxGap=(force?4:9+Math.random()*6)+e.d; voxIdleT=45+Math.random()*40;
  if(sit==='round'||!NET.mode||NET.mode==='spectator'){ voxPlay(k,sit,i,{own:true}); return true; }   // início de rodada: só você ouve
  if(NET.mode==='host'){ voxPlay(k,sit,i,{own:true}); pushEv(['vox',NET.me,k,sit,i,PROG.cv]); return true; }
  // convidado: pede a vez ao anfitrião e só fala quando ele liberar
  netAct(['voxr',k,sit,i,PROG.cv]); VOXG.until=performance.now()+700; return true;
};
V9NET.act.voxr=(peer,a)=>{ const k=String(a[2]||''), sit=String(a[3]||''), i=a[4]|0, cv=String(a[5]||'m');
  if(!VOX[k]||sit==='round'||voxBusy()||!voxLines(k,sit)[i]) return;
  voxPlay(k,sit,i,{own:false,peer,cv}); pushEv(['vox',peer,k,sit,i,cv]); };
V9NET.ev.vox=(e,me)=>{ if(NET.mode==='host') return; const peer=e[2], k=String(e[3]||''), sit=String(e[4]||''), i=e[5]|0, cv=String(e[6]||'m');
  if(!VOX[k]||!voxLines(k,sit)[i]) return;
  if(CUR==='tz'&&performance.now()<VOXG.driverUntil) return;
  voxPlay(k,sit,i,peer===me?{own:true}:{own:false,peer,cv}); };

// o motorista tem prioridade: corta a voz atual e bloqueia novas enquanto fala
const tzSay0=tzSay;
tzSay=function(cat){ const was=tzCapEl&&tzCapEl.querySelector('span')?tzCapEl.querySelector('span').textContent:'';
  const r=tzSay0.apply(this,arguments);
  const sp=tzCapEl&&tzCapEl.querySelector('span'), line=sp?sp.textContent:'';
  if(line&&(line!==was||tzCapEl.classList.contains('on'))){ voxStopAll(); VOXG.driverUntil=performance.now()+(Math.max(2.5,line.length*0.075)+0.5)*1000;
    try{ if(abCap) abCap.classList.remove('on'); }catch(e){} }
  return r; };
v9On('reset',()=>{ VOXG.until=0; VOXG.driverUntil=0; voxStopAll(); });

// as conversas em dupla esperam a fala atual (e o motorista) terminar antes de começar a próxima linha
updateCoopDialogue=function(dt){
  if(NET.mode!=='host'||G.state!=='playing') return;
  if(COOP_STATE.queue.length){
    COOP_STATE.wait-=dt;
    const n=performance.now();
    if(COOP_STATE.wait<=0&&n>=VOXG.until&&n>=VOXG.driverUntil){
      const item=COOP_STATE.queue.shift(); coopDispatchLine(item);
      const rec=voxDuoGet(item.speaker.char,item.speaker.cv,item.text);
      COOP_STATE.wait=rec?rec[1]+0.9:Math.max(5.2,Math.min(8.4,item.text.length/14.5+1.2));
    }
    if(!COOP_STATE.queue.length) COOP_STATE.active=false;
    return;
  }
  COOP_STATE.next-=dt;
  if(COOP_STATE.next<=0){ const n=performance.now(); if(n<VOXG.until||n<VOXG.driverUntil){ COOP_STATE.next=3; return; }
    if(coopMakeScene()) COOP_STATE.next=92+Math.random()*38; else COOP_STATE.next=18; }
};
// uma linha de conversa que chega também conta como "alguém falando"
{ const cce=coopCaptionEvent; coopCaptionEvent=function(e){ if(CUR==='tz'&&performance.now()<VOXG.driverUntil) return; voxStopAll(); return cce.apply(this,arguments); }; }
