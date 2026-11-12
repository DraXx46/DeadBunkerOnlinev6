/* ================= v9 · TELA DE CARREGAMENTO DOS MAPAS =================
   Aparece depois da escolha de personagem (solo: ao começar a partida; online: quando todos travaram). Mostra fotos passando (com zoom lento),
   o nome do mapa, dicas que vão trocando e uma barra com as etapas reais: montar o mapa, modelos e texturas,
   vozes do seu personagem (e do motorista no ônibus) e o aquecimento dos shaders. Fica no mínimo 15 s, e a partida
   só começa quando ela termina e tudo já baixou. Enquanto ela está na tela, ninguém te machuca. */
const MLD={on:false,started:false,pending:null,sg:null,t0:0,map:null,photos:[],pi:0,ti:0,phT:0,tiT:0,frames:0,stage:'',pend:0,done:0,hideT:0,why:''};
const MLD_TIPS=[
  'Tiro na cabeça dá muito mais dano, e mais pontos.',
  'Reconstrua as janelas entre os ataques: cada tábua vale pontos.',
  'Z usa a habilidade do personagem. X solta a ultimate quando ela estiver carregada.',
  'Viu "ALERTA DE HITKILL" na barra de vida? Um único golpe te derruba. Recue e se cure.',
  'O cachorro agarrou sua perna? Livre-se dele: você solta uma onda de choque que joga os zumbis longe.',
  'A Barrett só atira de novo depois de puxar o ferrolho. Respire, mire e espere a luneta abrir.',
  'Cartas de Pacto são fortes, mas sempre cobram um preço.',
  'O Soro da Vida te levanta uma vez, e você volta num ponto aleatório do mapa.',
  'A Dra. Helena reanima aliados mesmo de longe, uma vez por minuto.',
  'A ultimate do Cabo Davi chama um ataque aéreo e enche a munição de todo o time.',
  'Na ultimate do Sargento Moreira a munição não acaba e cada tiro bate mais forte.',
  'No ônibus, preste atenção no Motorista 115: quem não embarca a tempo fica para trás.',
  'Habilidades evoluem jogando. Se tiver pressa, dá para acelerar com rubis em Personagens.',
  'Caiu a internet no meio da partida? O jogo tenta te reconectar sozinho.',
  'Zumbi atordoado e faca pesada na mão? Prepare-se para um finalizador.',
  'No Parque 4FUN, a arma de teletransporte te leva aonde a bola parar.',
  'Na Arena X1, tiro na cabeça decide a luta.',
  'Ouvindo passos atrás de você? Eles adoram atacar pelas costas.',
  'Agachar diminui o coice das armas pesadas.',
  'Jogando em grupo, fiquem perto: reanimar um amigo é mais rápido que recomeçar.'
];
const MLD_PICS={all:['img/load/menu.jpg','img/load/v9_rua.jpg','img/load/v9_faca.jpg','img/load/v9_bar.jpg','img/load/v9_delegacia.jpg','img/load/v9_besta.jpg','img/load/v9_carro.jpg','img/load/boss.jpg','img/load/city.jpg'],
  bunker:'img/map_bunker.jpg',hosp:'img/map_hosp.jpg',farm:'img/map_farm.jpg',tz:'img/map_tz.jpg',city:'img/load/city.jpg'};
const MLD_SUB={bunker:'Segure as janelas. Ninguém vem te buscar.',hosp:'Os corredores ainda cheiram a desinfetante. E a sangue.',farm:'A colheita deste ano anda sozinha.',tz:'Linha 115. Destino: o fim do mundo.',city:'O que sobrou da cidade ainda está com fome.',fun:'Neon, apostas e portais. Divirta-se enquanto dá.',x1:'Só um sai vivo da arena.'};

v9Css(`
#mload{position:fixed;inset:0;z-index:9000;background:#050404;overflow:hidden;opacity:0;pointer-events:none;transition:opacity .45s ease}
#mload.on{opacity:1;pointer-events:auto}
#mload .ph{position:absolute;inset:-4%;background-size:cover;background-position:center;opacity:0;transition:opacity 1.4s ease;transform:scale(1.04);animation:mldKen 9s ease-out forwards}
#mload .ph.show{opacity:1}
@keyframes mldKen{from{transform:scale(1.04) translate(0,0)}to{transform:scale(1.16) translate(-1.5%,-1%)}}
#mload .shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(0,0,0,.15) 0,rgba(0,0,0,.55) 60%,rgba(0,0,0,.92) 100%),linear-gradient(180deg,rgba(0,0,0,.55) 0,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 55%,rgba(0,0,0,.94) 100%)}
#mload .grain{position:absolute;inset:0;opacity:.07;background-image:repeating-radial-gradient(circle at 17% 32%,#fff 0 1px,transparent 1px 3px);mix-blend-mode:overlay}
#mload .top{position:absolute;left:clamp(20px,4vw,64px);top:clamp(18px,4vh,46px);display:flex;align-items:center;gap:14px}
#mload .top img{width:46px;height:46px;border-radius:8px;box-shadow:0 0 22px rgba(200,30,20,.45);animation:mldPulse 1.6s ease-in-out infinite}
@keyframes mldPulse{50%{box-shadow:0 0 34px rgba(255,50,30,.75);transform:scale(1.04)}}
#mload .top b{font-weight:700;font-size:13px;line-height:1;letter-spacing:.42em;color:#e8dcd0}
#mload .top i{display:block;margin-top:5px;font-style:normal;font-size:10px;letter-spacing:.3em;color:#a8302a}
#mload .mid{position:absolute;left:clamp(20px,4vw,64px);right:clamp(20px,4vw,64px);bottom:clamp(120px,19vh,190px)}
#mload .mk{font-size:11px;letter-spacing:.5em;color:#c0392b;margin-bottom:8px}
#mload .mn{font-weight:700;font-size:clamp(34px,6.4vw,86px);line-height:.95;font-family:var(--f-display,inherit);letter-spacing:.02em;color:#f3ebe2;text-shadow:0 6px 30px rgba(0,0,0,.8);text-transform:uppercase}
#mload .ms{margin-top:10px;font-size:clamp(13px,1.5vw,17px);color:#cfc3b6;max-width:640px}
#mload .bot{position:absolute;left:clamp(20px,4vw,64px);right:clamp(20px,4vw,64px);bottom:clamp(22px,5vh,48px)}
#mload .tip{display:flex;gap:12px;align-items:flex-start;max-width:760px;min-height:44px;margin-bottom:18px}
#mload .tip span{flex:none;font-size:10px;letter-spacing:.3em;color:#0b0909;background:#d9a441;padding:4px 7px 3px;border-radius:2px;margin-top:2px}
#mload .tip p{margin:0;font-size:clamp(13px,1.45vw,16px);line-height:1.45;color:#efe6da;transition:opacity .35s,transform .35s}
#mload .tip p.out{opacity:0;transform:translateY(6px)}
#mload .bar{position:relative;height:4px;background:rgba(255,255,255,.12);border-radius:2px;overflow:hidden}
#mload .bar i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(90deg,#7a1410,#e0452f 70%,#ffb38a);box-shadow:0 0 12px rgba(255,70,40,.7);transition:width .35s ease}
#mload .bar i::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);animation:mldSheen 1.3s linear infinite}
@keyframes mldSheen{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
#mload .st{display:flex;justify-content:space-between;margin-top:9px;font-size:11px;letter-spacing:.22em;color:#a99c8f;text-transform:uppercase}
#mload .st b{color:#f0e4d6;font-weight:600}
#mload .dots{position:absolute;right:clamp(20px,4vw,64px);top:clamp(26px,5vh,54px);display:flex;gap:6px}
#mload .dots u{width:22px;height:3px;background:rgba(255,255,255,.18);border-radius:2px}
#mload .dots u.on{background:#e0452f}
`);
{ const el=document.createElement('div'); el.id='mload'; el.setAttribute('aria-live','polite');
  el.innerHTML=`<div class="ph"></div><div class="ph"></div><div class="shade"></div><div class="grain"></div>
  <div class="top"><img src="icon.png" alt=""><div><b>DEAD BUNKER</b><i>CARREGANDO</i></div></div><div class="dots"></div>
  <div class="mid"><div class="mk">PRÓXIMA OPERAÇÃO</div><div class="mn"></div><div class="ms"></div></div>
  <div class="bot"><div class="tip"><span>DICA</span><p></p></div><div class="bar"><i></i></div><div class="st"><b></b><em></em></div></div>`;
  document.body.appendChild(el); MLD.el=el; }

// texturas e modelos: conta o que ainda está baixando
{ const LM=THREE.DefaultLoadingManager, s0=LM.itemStart.bind(LM), e0=LM.itemEnd.bind(LM), r0=LM.itemError.bind(LM);
  LM.itemStart=u=>{ MLD.pend++; return s0(u); }; LM.itemEnd=u=>{ MLD.pend=Math.max(0,MLD.pend-1); MLD.done++; return e0(u); };
  LM.itemError=u=>{ MLD.pend=Math.max(0,MLD.pend-1); return r0(u); }; }

function mldPhotoList(map){ const own=MLD_PICS[map]; const all=MLD_PICS.all.slice().sort(()=>Math.random()-0.5); if(own) all.unshift(own); return all; }
function mldShowPhoto(){ const ph=MLD.el.querySelectorAll('.ph'), a=ph[MLD.pi%2], b=ph[(MLD.pi+1)%2], src=MLD.photos[MLD.pi%MLD.photos.length];
  b.style.backgroundImage=`url("${src}")`; b.style.animation='none'; void b.offsetWidth; b.style.animation=''; b.classList.add('show'); a.classList.remove('show'); MLD.pi++; }
function mldTip(){ const p=MLD.el.querySelector('.tip p'); p.classList.add('out'); setTimeout(()=>{ p.textContent=MLD_TIPS[MLD.ti++%MLD_TIPS.length]; p.classList.remove('out'); },330); }
function mldVoiceFiles(){ const L=[]; try{ const R=VOXREC[voxKey()]; if(R) for(const s in R) for(const e of R[s]) L.push(e[0]); if(MLD.map==='tz') for(const c in TZREC) for(const e of TZREC[c]) L.push(e[0]); }catch(e){} return L; }

function mldBegin(map,why){
  map=map||CUR; const fresh=!MLD.on;
  MLD.on=true; MLD.map=map; MLD.why=why||''; MLD.frames=0; MLD.hideT=0; if(fresh){ MLD.t0=performance.now(); MLD.done=0; }
  const M=MAPS[map]||{}; MLD.el.querySelector('.mn').textContent=M.name||'Dead Bunker';
  MLD.el.querySelector('.ms').textContent=MLD_SUB[map]||'Prepare-se.';
  MLD.el.querySelector('.mk').textContent=why==='lobby'?'ENTRANDO NA SALA':why==='join'?'ENTRANDO NA PARTIDA':'PRÓXIMA OPERAÇÃO';
  if(fresh){ MLD.photos=mldPhotoList(map); MLD.pi=0; MLD.ti=(Math.random()*MLD_TIPS.length)|0; mldShowPhoto(); MLD.phT=performance.now(); MLD.tiT=performance.now();
    MLD.el.querySelector('.tip p').textContent=MLD_TIPS[MLD.ti++%MLD_TIPS.length];
    MLD.el.querySelector('.dots').innerHTML=MLD.photos.slice(0,6).map(()=>'<u></u>').join(''); }
  MLD.el.classList.add('on'); mldUpdate();
}
const MLD_MIN=15000;   // a tela fica no mínimo 15 s (barra "falsa" que anda com o tempo, mas só chega ao fim com tudo baixado)
const MLD_STAGES=[[0,'Montando o mapa'],[3000,'Carregando modelos e texturas'],[7000,'Carregando vozes'],[11000,'Aquecendo os gráficos'],[14000,'Preparando a partida']];
function mldReal(){
  const vf=mldVoiceFiles(), vl=vf.filter(f=>Snd.hasSample&&Snd.hasSample(f)).length, vk=!Snd.ctx||!vf.length?1:vl/vf.length;
  const tk=MLD.pend?Math.min(0.95,MLD.done/(MLD.done+MLD.pend)):1, mk=MAPS[MLD.map]&&CUR===MLD.map?1:0.3;
  return {p:0.4*mk+0.3*tk+0.3*vk, ready:mk>=1&&!MLD.pend&&vk>=1, vk, tk};
}
function mldProgress(){
  const age=performance.now()-MLD.t0, R=mldReal(), tp=Math.min(1,age/MLD_MIN);
  let p=Math.min(tp*0.97,R.p*0.97+0.03*tp), stage=MLD_STAGES.filter(s=>age>=s[0]).pop()[1];
  if(tp>=1&&!R.ready){ p=Math.min(0.97,R.p); stage=R.vk<1?'Baixando as vozes':R.tk<1?'Baixando modelos e texturas':'Montando o mapa'; }
  else if(tp>=1&&!MLD.started){ p=0.98; stage=MLD.pending?'Começando':'Esperando o anfitrião começar'; }
  if(MLD.started) { p=1; stage='Pronto'; }
  return {p,stage,ready:R.ready&&tp>=1};
}
function mldUpdate(){ if(!MLD.on) return; const r=mldProgress(), el=MLD.el;
  el.querySelector('.bar i').style.width=(Math.round(r.p*100))+'%'; el.querySelector('.st b').textContent=r.stage; el.querySelector('.st em').textContent=Math.round(r.p*100)+'%';
  const dots=el.querySelectorAll('.dots u'); dots.forEach((d,i)=>d.classList.toggle('on',i===(MLD.pi-1)%dots.length)); return r; }
function mldEnd(){ if(!MLD.on) return; MLD.on=false; MLD.started=false; MLD.pending=null; MLD.el.querySelector('.bar i').style.width='100%'; MLD.el.querySelector('.st b').textContent='Pronto'; MLD.el.querySelector('.st em').textContent='100%';
  setTimeout(()=>{ if(!MLD.on) MLD.el.classList.remove('on'); },220); }
// a partida só começa quando a tela termina: 15 s no mínimo e tudo baixado
function mldRelease(){ if(!MLD.on||MLD.started||!MLD.pending) return; MLD.started=true; MLD.frames=0; const a=MLD.pending; MLD.pending=null;
  try{ MLD.sg.apply(null,a); }catch(e){ console.warn('[Bunker v9] start',e); } }
function mldTick(){ if(!MLD.on) return; const n=performance.now(), age=n-MLD.t0;
  if(n-MLD.phT>5200){ MLD.phT=n; mldShowPhoto(); } if(n-MLD.tiT>4800){ MLD.tiT=n; mldTip(); }
  const r=mldUpdate();
  if(MLD.started){ if(MLD.frames>=4) mldEnd(); return; }
  if((r.ready||age>45000)&&MLD.pending) mldRelease();
  else if(age>75000&&!MLD.pending) mldEnd();   // o anfitrião nunca começou
}
v9On('always',()=>{ if(MLD.on){ MLD.frames++; mldTick(); } });
setInterval(()=>{ if(MLD.on&&(G.state==='menu'||G.state==='lobby')) mldTick(); },250);   // também anda com o jogo parado no menu
// pontos de entrada: só depois da escolha de personagem (solo: ao começar; online: quando todos travaram)
{ const sg=startGame; MLD.sg=sg; startGame=function(){
  if(MLD.on&&MLD.started) return sg.apply(this,arguments);            // liberado pela própria tela
  if(!MLD.on) mldBegin(CUR,'start');
  MLD.pending=Array.from(arguments); mldTick(); }; }
{ const pn=pickNetMsg; pickNetMsg=function(m){ const r=pn.apply(this,arguments); if(m&&m.type==='pickDone'&&!MLD.on) mldBegin(CUR,'start'); return r; }; }
// ninguém leva dano enquanto a tela de carregamento está aberta
{ const hp=hurtPlayer; hurtPlayer=function(){ if(MLD.on) return; return hp.apply(this,arguments); }; }
