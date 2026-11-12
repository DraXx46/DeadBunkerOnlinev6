/* ================= v9 · LOCK IN NA ESCOLHA DE PERSONAGEM =================
   Clicar num personagem só seleciona (dá para trocar à vontade). Para confirmar, aperte "TRAVAR" (ou Enter,
   ou clique duas vezes no cartão): o cartão ganha o carimbo TRAVADO, a tela pisca, toca um impacto
   e o personagem fala uma frase com a própria voz. Depois de travar não dá mais para trocar.
   Se o tempo acabar com alguém selecionado e não travado, o jogo trava sozinho a seleção. */
const PKL={sel:null,locked:false,voice:null};
v9Css(`
#pickscr .pkhead h2{font-size:clamp(28px,4.2vw,54px);line-height:1}
#pk-lockrow{display:flex;flex-direction:column;align-items:center;gap:6px;margin-left:auto}
#pk-lock{all:unset;box-sizing:border-box;cursor:pointer;position:relative;overflow:hidden;min-width:260px;text-align:center;padding:14px 26px;font:700 18px var(--f-display);letter-spacing:.28em;color:#fff;background:linear-gradient(180deg,#c4161f,#7d0a10);border:1px solid #ff4a32;box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 22px rgba(220,40,30,.35);transition:transform .12s,filter .2s,opacity .2s}
#pk-lock::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);transform:translateX(-120%);animation:pklShine 2.2s ease-in-out infinite}
#pk-lock:hover:not(:disabled){transform:translateY(-2px) scale(1.02);filter:brightness(1.15)}
#pk-lock:active:not(:disabled){transform:scale(.97)}
#pk-lock:disabled{cursor:default;opacity:.35;filter:grayscale(.7)}
#pk-lock:disabled::after{animation:none}
#pk-lock.done{opacity:1;filter:none;background:linear-gradient(180deg,#2f7a45,#1d4e2b);border-color:#6fe08f;box-shadow:0 0 24px rgba(80,220,120,.4)}
#pk-lockrow small{text-align:center;font-size:10px;line-height:1.4;letter-spacing:.14em;color:#a99c8f;text-transform:uppercase}
@keyframes pklShine{0%,55%{transform:translateX(-120%)}100%{transform:translateX(120%)}}
.pkc.sel:not(.off){border-color:#f0d28a;box-shadow:0 0 0 2px rgba(240,210,138,.65),0 0 28px rgba(240,210,138,.3);animation:pklPulse 1.1s ease-in-out infinite}
@keyframes pklPulse{50%{box-shadow:0 0 0 2px rgba(240,210,138,.95),0 0 38px rgba(240,210,138,.45)}}
.pkc.locked{border-color:#ff4a32!important;box-shadow:0 0 0 2px #ff4a32,0 0 40px rgba(255,60,30,.55)!important;animation:none!important;transform:translateY(-6px) scale(1.05)!important}
.pkc .stamp{position:absolute;left:50%;top:38%;transform:translate3d(-50%,-50%,60px) rotate(-14deg) scale(2.4);opacity:0;padding:4px 12px;font:700 20px var(--f-display);letter-spacing:.22em;color:#ff4a32;border:3px solid #ff4a32;background:rgba(10,4,3,.6);text-shadow:0 0 10px rgba(255,60,30,.6);pointer-events:none;z-index:3}
.pkc.locked .stamp{animation:pklStamp .38s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes pklStamp{to{opacity:1;transform:translate3d(-50%,-50%,60px) rotate(-14deg) scale(1)}}
#pickscr.pklocked .pkc:not(.locked){opacity:.4;filter:grayscale(.6);transition:opacity .4s,filter .4s}
#pk-flash{position:fixed;inset:0;pointer-events:none;z-index:56;background:radial-gradient(circle at var(--fx,50%) var(--fy,40%),rgba(255,220,180,.85),rgba(255,80,40,.35) 30%,rgba(0,0,0,0) 65%);opacity:0}
#pk-flash.go{animation:pklFlash .55s ease-out}
@keyframes pklFlash{0%{opacity:1}100%{opacity:0}}
#pickscr.pkshake .pkbox{animation:pklShake .32s}
@keyframes pklShake{20%{transform:translate(-6px,3px)}40%{transform:translate(5px,-4px)}60%{transform:translate(-3px,2px)}80%{transform:translate(2px,-1px)}}
#pk-info .quote{grid-column:2/4;margin-top:6px;padding:8px 12px;border-left:3px solid #ff4a32;background:rgba(255,60,30,.08);font-size:14px;font-style:italic;color:#f3ebe2;animation:pkxIn .3s ease-out}
`);
{ const box=document.querySelector('#pickscr .pkbox'), pl=document.querySelector('#pickscr .pktime');
  const row=document.createElement('div'); row.id='pk-lockrow';
  row.innerHTML='<button id="pk-lock" type="button" data-snd="none" disabled>TRAVAR</button><small>Selecione e trave<br>Enter também trava</small>';
  if(pl&&pl.parentNode) pl.parentNode.insertBefore(row,pl); else if(box) box.appendChild(row);
  const fl=document.createElement('div'); fl.id='pk-flash'; document.body.appendChild(fl);
  row.querySelector('#pk-lock').addEventListener('click',()=>pklLock()); }

// impacto do lock in feito na hora (grave + estalo), no volume dos efeitos
function pklImpact(){ const c=Snd.ctx; if(!c) return; const v=Math.max(0,Math.min(1.5,CFG.sfx==null?1:+CFG.sfx||0))*0.9, t=c.currentTime;
  const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(38,t+0.45);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.9*v,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.6); o.connect(g).connect(c.destination); o.start(t); o.stop(t+0.65);
  const n=c.createBufferSource(), b=c.createBuffer(1,c.sampleRate*0.25,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
  const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=1800; f.Q.value=0.8; const g2=c.createGain(); g2.gain.value=0.55*v; n.buffer=b; n.connect(f).connect(g2).connect(c.destination); n.start(t);
  const o2=c.createOscillator(), g3=c.createGain(); o2.type='triangle'; o2.frequency.setValueAtTime(880,t+0.06); o2.frequency.exponentialRampToValueAtTime(1320,t+0.2);
  g3.gain.setValueAtTime(0.0001,t+0.06); g3.gain.exponentialRampToValueAtTime(0.18*v,t+0.08); g3.gain.exponentialRampToValueAtTime(0.0001,t+0.7); o2.connect(g3).connect(c.destination); o2.start(t+0.06); o2.stop(t+0.75); }

// a fala do lock in: uma das frases de início de rodada do personagem, com a voz dele (gravada quando houver)
function pklVoice(c){
  const k=c==='recruta'&&(pickVar(c)==='vm'||pickVar(c)==='vf')?'vamp':c; let line=null, file=null;
  const R=VOXREC[k]; if(R&&R.round&&R.round.length){ const e=pick(R.round); line=e[1]; file=e[0]; } else { const L=VOX[k]&&VOX[k].round; if(L&&L.length) line=pick(L); }
  if(!line) return null;
  try{ if(PKL.voice){ PKL.voice.stop(0.05); PKL.voice=null; } if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
  const on=(+CFG.voice||0)>0, tts=()=>{ try{ if(!on||!window.speechSynthesis) return; const vv=VOX_VOICE[k]||{p:1,r:1}, u=new SpeechSynthesisUtterance(line); u.lang='pt-BR'; u.pitch=vv.p; u.rate=vv.r; u.volume=1; speechSynthesis.speak(u); }catch(e){} };
  if(file&&on&&Snd.ctx){ const go=()=>{ const h=Snd.sample(file,{vol:voxRecVol(),prio:true,wet:0.05}); if(h) PKL.voice=h; else tts(); };
    if(Snd.hasSample(file)) setTimeout(go,260); else voxWaitLoad(file,go,tts,2500); }
  else setTimeout(tts,260);
  return line; }

function pklRefresh(){
  document.querySelectorAll('#pk-grid .pkc').forEach(b=>{ const c=b.dataset.c; b.classList.toggle('sel',!PKL.locked&&c===PKL.sel); b.classList.toggle('locked',PKL.locked&&c===PKL.sel);
    if(!b.querySelector('.stamp')){ const s=document.createElement('div'); s.className='stamp'; s.textContent='TRAVADO'; b.appendChild(s); }
    b.ondblclick=()=>{ if(!PKL.locked&&pickAllowed(c)){ PKL.sel=c; pklLock(); } }; });
  const btn=document.getElementById('pk-lock'), sc=document.getElementById('pickscr');
  if(btn){ btn.disabled=PKL.locked||!PKL.sel||!pickAllowed(PKL.sel); btn.classList.toggle('done',PKL.locked);
    btn.textContent=PKL.locked?'TRAVADO ✓':PKL.sel?'TRAVAR '+(((CHARS[PKL.sel].vars[pickVar(PKL.sel)]||{}).name||CHARS[PKL.sel].name).split(' ').slice(-1)[0]).toUpperCase():'TRAVAR'; }
  if(sc) sc.classList.toggle('pklocked',PKL.locked);
}
const pickChooseLock=pickChoose;
pickChoose=function(c){ // clicar só seleciona
  if(!PICK.on||PICK.finishing||PKL.locked||!pickAllowed(c)){ Snd.ui('deny'); return; }
  if(PKL.sel!==c){ PKL.sel=c; Snd.ui('select'); }
  try{ pkxShow(c); }catch(e){} pklRefresh(); };
function pklLock(){
  const c=PKL.sel; if(!c||PKL.locked||!PICK.on||PICK.finishing) return;
  if(!pickAllowed(c)){ Snd.ui('deny'); return; }
  pickChooseLock(c); if(PICK.picks[PICK.me]!==c) return;          // o jogo recusou
  PKL.locked=true; pklRefresh(); pklImpact(); try{ Snd.ui('unlock'); }catch(e){}
  const card=document.querySelector(`#pk-grid .pkc[data-c="${c}"]`), fl=document.getElementById('pk-flash'), sc=document.getElementById('pickscr');
  if(card&&fl){ const R=card.getBoundingClientRect(); fl.style.setProperty('--fx',(R.left+R.width/2)+'px'); fl.style.setProperty('--fy',(R.top+R.height/2)+'px'); }
  if(fl){ fl.classList.remove('go'); void fl.offsetWidth; fl.classList.add('go'); }
  if(sc){ sc.classList.remove('pkshake'); void sc.offsetWidth; sc.classList.add('pkshake'); }
  const line=pklVoice(c);
  try{ pkxShow(c); const el=document.getElementById('pk-info'); if(el&&line){ el.querySelector('.quote')?.remove(); const q=document.createElement('div'); q.className='quote'; q.textContent='“'+line+'”'; el.appendChild(q); } }catch(e){}
}
const openPickLock=openPick;
openPick=function(){ PKL.sel=null; PKL.locked=false; const r=openPickLock.apply(this,arguments);
  const own=PICK.picks&&PICK.picks[PICK.me]; if(own){ PKL.sel=own; PKL.locked=true; } pklRefresh(); return r; };
const renderPickLock=renderPick;
renderPick=function(){ const r=renderPickLock.apply(this,arguments); try{ pklRefresh(); }catch(e){} return r; };
// o servidor recusou (alguém travou antes): destrava para escolher outro
const pickNetMsgLock=pickNetMsg;
pickNetMsg=function(m){ if(m&&m.type==='pickTaken'){ PKL.locked=false; PKL.sel=null; }
  const r=pickNetMsgLock.apply(this,arguments); if(m&&m.type==='pickState'){ const own=PICK.picks&&PICK.picks[PICK.me]; if(own&&!PKL.locked){ PKL.sel=own; PKL.locked=true; } pklRefresh(); } return r; };
// tempo acabando: trava sozinho o que estiver selecionado
setInterval(()=>{ if(!PICK.on||PKL.locked||!PKL.sel) return; if(PICK.deadline-performance.now()<1200) pklLock(); },200);
addEventListener('keydown',e=>{ if(!PICK.on) return; if(e.code==='Enter'||e.code==='NumpadEnter'){ e.preventDefault(); pklLock(); } },true);
