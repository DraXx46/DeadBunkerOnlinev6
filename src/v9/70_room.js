/* ================= v9 · SALA ONLINE NO PRÓPRIO MENU (sem pré-lobby físico) =================
   Antes, criar/entrar numa sala carregava o mapa e soltava todo mundo andando num lobby 3D (com sinuca e passatempos),
   e era ali que se marcava "pronto". Isso dava problema: quem ainda estava carregando o mapa ficava de fora da escolha
   de personagem e não entrava na partida junto. Agora:
   · a sala fica no menu: um cartão no canto inferior esquerdo mostra o mapa, a dificuldade, o código e quem está
     na sala (com o pronto de cada um), logo acima do botão principal;
   · em grupo: enquanto o líder não escolhe mapa e dificuldade, o botão dos outros fica travado ("aguardando o líder");
     quando ele escolhe, a sala é criada, todo mundo entra sozinho e o botão vira "Estou pronto";
   · o líder/anfitrião só consegue iniciar com todo o grupo dentro da sala e pronto. Aí abre a escolha de personagem
     para todos ao mesmo tempo e, no fim dela, a partida começa para todos.
   A Arena X1 continua com a sala dela (as regras do X1 são ajustadas lá). */
const RMQ={on:true,t0:0,forceT:0};
const rmSkip=m=>m==='x1'||m==='fun';
function rmActive(){ return RMQ.on&&!!NET.mode&&!!NET.roomMeta&&!rmSkip(NET.roomMeta.map)&&G.state==='menu'; }
function rmPeers(){ return (NET.peerCache||[]).slice(); }
function rmWant(){ return (typeof inParty==='function'&&inParty())?SOC.party.members.length:1; }
const RM_DIFF={normal:'Normal',hard:'Difícil',nightmare:'Pesadelo'};
const RM_IMG={bunker:'img/map_bunker.jpg',hosp:'img/map_hosp.jpg',farm:'img/map_farm.jpg',tz:'img/map_tz.jpg'};
function rmMapName(k){ if(k==='tz') return 'Tranzitch · o ônibus'; if(k==='city') return 'A Cidade'; try{ return lobbyMapData(k).name; }catch(e){ return k; } }

/* ---------- entrar na sala = ficar no menu ---------- */
{ const erl0=enterRoomLobby; enterRoomLobby=function(map,isRemote){
    if(!RMQ.on||rmSkip(map)) return erl0.apply(this,arguments);
    map=MAPS[map]?map:'bunker';
    try{ clearLobbyEnvironment(); }catch(e){} try{ if(LP.on) closeLobbyPause(false); }catch(e){}
    if(CUR!==map) setMap(map); try{ resetGame(); }catch(e){}
    G.state='menu'; NET.phase='lobby'; NET.ready=NET.mode==='host'; NET.hostGen=null; NET.lastHostPres=null; NET.gapSeen=0; RMQ.t0=performance.now();
    $('#hud').hidden=true; $('#touch').hidden=true; $('#roomLobby').hidden=true; show('#menu');
    try{ if(document.pointerLockElement) document.exitPointerLock(); }catch(e){} try{ if(Snd.ready) Snd.startMusic(); }catch(e){}
    rmRender(); }; }
// o anfitrião no menu avisa "lobby" (senão os outros achariam que a partida começou)
{ const hs0=hostState; hostState=function(){ const r=hs0.apply(this,arguments); if(r&&G.state==='menu') r.phase='lobby'; return r; }; }
// quem está na sala do menu: começa quando o anfitrião começa; fora isso só acompanha o mapa
{ const ah0=applyHost; applyHost=function(pr){ const g=pr&&pr.g;
    if(g&&typeof g==='object'&&NET.mode==='client'&&G.state==='menu'&&RMQ.on){
      const want=g.mp===1?'hosp':g.mp===2?'farm':g.mp===4?'x1':g.mp===5?'tz':g.mp===6?'city':'bunker';
      if(rmSkip(want)) return ah0.apply(this,arguments);
      if(g.phase==='playing'){ if(want!==CUR) setMap(want); NET.hostGen=g.gn; try{ if(PICK.on) closePick(); }catch(e){} clientRestart(); return; }
      if(want!==CUR) setMap(want); return; }
    return ah0.apply(this,arguments); }; }
// no menu não aparece boneco dos outros na frente da câmera
{ const ur0=updateRemote; updateRemote=function(p,pl){ if(G.state==='menu'&&RMQ.on){ try{ if(NET.players.has(p.peer)) removeRemote(p.peer); }catch(e){} return; } return ur0.apply(this,arguments); }; }
// sinuca e passatempos do lobby não existem mais fora do X1
{ const pw0=poolWant; poolWant=function(){ if(G.state==='lobby'&&RMQ.on&&!rmSkip(CUR)) return null; return pw0.apply(this,arguments); }; }

/* ---------- grupo: o líder escolhe o mapa primeiro; os outros entram sozinhos e aí marcam pronto ---------- */
{ const pc2=playChoice; playChoice=async function(k){
    if(typeof PTY!=='undefined') PTY.force=true;   // não exige mais "todos prontos" antes do mapa: o pronto vem depois
    try{ return await pc2.apply(this,arguments); } finally{ if(typeof PTY!=='undefined'){ PTY.auto=false; PTY.force=false; } rmRender(); } }; }
partyFollow=async function(code,map){
  if(NET.mode==='client'&&NET.code===code) return;
  if(NET.mode==='client'){ try{ leaveNet(); }catch(e){} } else if(NET.mode){ return; }
  if(G.state!=='menu'){ toast(`Seu grupo abriu a sala ${code}. Volte para o menu e use o código para entrar.`,{ms:12000}); return; }
  try{ closeSocial(); }catch(e){} try{ if(PICK.on&&PICK.mode!=='net') closePick(); }catch(e){}
  toast('Entrando na sala do grupo…'); await joinGame(code); rmRender(); };
// o ready automático do grupo antigo sai: cada um confirma no botão
if(typeof PTY!=='undefined') PTY.auto=false;

/* ---------- botão principal ---------- */
function rmMissing(){ const ps=rmPeers(); const names=new Set(ps.map(p=>fkey(p.name||''))); if(!(typeof inParty==='function'&&inParty())) return [];
  return SOC.party.members.filter(m=>!names.has(fkey(m.name))).map(m=>m.name); }
function rmNotReady(){ return rmPeers().filter(p=>p.id!==NET.me&&p.role!=='host'&&!p.ready).map(p=>p.name||'Sobrevivente'); }
async function rmPlayClick(){
  if(NET.mode==='client'){ await setReady(!NET.ready); Snd.ui(NET.ready?'confirm':'back'); rmRender(); return; }
  if(NET.mode==='host'){
    const miss=rmMissing(), nr=rmNotReady();
    if(nr.length){ toast(`Ainda não estão prontos: ${nr.join(', ')}`,{bad:true}); Snd.ui('deny'); return; }
    if(miss.length&&performance.now()>RMQ.forceT){ toast(`Ainda entrando na sala: ${miss.join(', ')}`,{actions:[['Começar sem eles',()=>{ RMQ.forceT=performance.now()+8000; rmPlayClick(); },'ok']]}); Snd.ui('deny'); return; }
    Snd.ui('confirm'); await beginRoomGame(); } }
addEventListener('click',e=>{ const pl=document.getElementById('play'); if(!pl||!pl.contains(e.target)) return;
  if(rmActive()){ e.stopImmediatePropagation(); e.preventDefault(); rmPlayClick(); return; }
  if(RMQ.on&&typeof inParty==='function'&&inParty()&&!isLeader()){ e.stopImmediatePropagation(); e.preventDefault(); Snd.ui('deny'); toast(`Espere ${SOC.party.leader} escolher o mapa e a dificuldade. Depois disso o "Estou pronto" libera.`); } },true);

/* ---------- cartão da sala (canto inferior esquerdo, acima do botão) ---------- */
v9Css(`
#rmdock{display:none;flex:0 0 auto;position:relative;margin:auto 0 0;border:1px solid rgba(240,210,138,.35);background:linear-gradient(180deg,rgba(20,14,10,.92),rgba(8,6,5,.95));box-shadow:0 10px 30px rgba(0,0,0,.55);overflow:hidden;max-width:420px}
body.inroom #rmdock{display:block} body.inroom #play{margin-top:0!important} #rmdock .rmcode:empty{display:none} body.inroom #ad, body.inroom .mleft .mcode, body.inroom .mleft .v9pubb, body.inroom .mleft .mmfoot{display:none!important}
#rmdock .rmimg{height:118px;background:#1a1410 center/cover no-repeat;position:relative}
#rmdock .rmimg::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(8,6,5,.96))}
#rmdock .rmtag{position:absolute;left:12px;top:10px;z-index:1;font:700 10px var(--f-mono,monospace);letter-spacing:.22em;color:#ff6a4a;text-transform:uppercase}
#rmdock .rmcode{position:absolute;right:12px;top:8px;z-index:1;font:700 13px var(--f-mono,monospace);letter-spacing:.2em;color:#f0d28a;background:rgba(0,0,0,.55);padding:3px 8px;border:1px solid rgba(240,210,138,.35)}
#rmdock .rmb{padding:0 14px 12px;margin-top:-34px;position:relative;z-index:1}
#rmdock h3{margin:0;font:700 22px var(--f-display,serif);color:#f3ead8;text-shadow:0 2px 8px #000}
#rmdock .rmd{margin:2px 0 8px;font:11px var(--f-mono,monospace);letter-spacing:.12em;color:#b9ab95;text-transform:uppercase}
#rmdock .rmps{display:flex;flex-direction:column;gap:4px}
#rmdock .rmp{display:flex;align-items:center;gap:8px;font:13px var(--f-body,sans-serif);color:#e8dfcf;padding:4px 8px;background:rgba(255,255,255,.04);border-left:3px solid #6b5a44}
#rmdock .rmp.ok{border-left-color:#4caf6a} #rmdock .rmp.wait{opacity:.6;border-left-style:dashed}
#rmdock .rmp i{margin-left:auto;font-style:normal;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#a99c8f}
#rmdock .rmp.ok i{color:#6fe08f}
#rmdock .rmrow{display:flex;gap:8px;margin-top:10px}
#rmdock .rmrow button{all:unset;cursor:pointer;font:11px var(--f-mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:#cbbda6;padding:6px 10px;border:1px solid rgba(203,189,166,.3)}
#rmdock .rmrow button:hover{color:#fff;border-color:#f0d28a}
#rmdock.waitlead .rmimg{filter:grayscale(1) brightness(.5)}
#play.rmoff span,#play.rmgo span,#play.rmon span{font-size:30px!important;color:#fff!important;white-space:nowrap}
#play.rmoff{filter:grayscale(.85) brightness(.7);cursor:not-allowed}
#play.rmgo{background:linear-gradient(180deg,#2f7a45,#1d4e2b)!important;border-color:#4caf6a!important}
#play.rmon{background:linear-gradient(180deg,#3a3a32,#22221d)!important;border-color:#4caf6a!important}
`);
function rmDock(){ let d=document.getElementById('rmdock'); if(d) return d; const pl=document.getElementById('play'); if(!pl) return null;
  d=document.createElement('div'); d.id='rmdock'; d.innerHTML='<div class="rmimg"><span class="rmtag"></span><span class="rmcode"></span></div><div class="rmb"><h3></h3><p class="rmd"></p><div class="rmps"></div><div class="rmrow"></div></div>';
  pl.parentNode.insertBefore(d,pl); return d; }
function rmRow(d,btns){ const row=d.querySelector('.rmrow'); row.textContent=''; for(const [t,fn] of btns){ const b=document.createElement('button'); b.type='button'; b.textContent=t; b.addEventListener('click',e=>{ e.stopPropagation(); fn(); }); row.appendChild(b); } }
function rmRender(){
  const d=rmDock(), pl=document.getElementById('play'), sub=document.getElementById('playsub'); if(!d||!pl||!sub) return; const sp=pl.querySelector('span');
  const grp=typeof inParty==='function'&&inParty(), lead=grp&&isLeader();
  const inRoom=rmActive(), waitLead=!NET.mode&&grp&&!lead&&RMQ.on&&G.state==='menu';
  document.body.classList.toggle('inroom',inRoom||waitLead); d.classList.toggle('waitlead',waitLead);
  pl.classList.remove('rmoff','rmgo','rmon','ptyme','ptyok');
  if(inRoom){
    const map=NET.roomMeta.map||CUR, ps=rmPeers(), max=NET.roomMeta.maxPlayers||4, host=NET.mode==='host';
    d.querySelector('.rmimg').style.backgroundImage=RM_IMG[map]?`url(${RM_IMG[map]})`:'';
    d.querySelector('.rmtag').textContent=host?'Sua sala':'Sala de '+((ps.find(p=>p.role==='host')||{}).name||'anfitrião');
    d.querySelector('.rmcode').textContent=NET.code||NET.roomMeta.code||'----';
    d.querySelector('h3').textContent=rmMapName(map);
    d.querySelector('.rmd').textContent=`Dificuldade ${RM_DIFF[NET.roomMeta.difficulty]||'Normal'} · ${ps.length}/${max} na sala`;
    const list=d.querySelector('.rmps'); list.textContent='';
    for(const p of ps){ const ok=p.role==='host'||p.ready; const r=document.createElement('div'); r.className='rmp'+(ok?' ok':''); const n=document.createElement('span'); n.textContent=(p.name||'Sobrevivente')+(p.id===NET.me?' (você)':'');
      const t=document.createElement('i'); t.textContent=p.role==='host'?'Anfitrião':ok?'Pronto':'Não pronto'; r.append(n,t); list.appendChild(r); }
    for(const n of rmMissing()){ const r=document.createElement('div'); r.className='rmp wait'; const s=document.createElement('span'); s.textContent=n; const t=document.createElement('i'); t.textContent='Entrando…'; r.append(s,t); list.appendChild(r); }
    if(host){ const nr=rmNotReady(), miss=rmMissing(), go=!nr.length&&!miss.length;
      if(sp) sp.textContent='Iniciar partida'; pl.classList.add(go?'rmgo':'rmoff');
      sub.textContent=go?(ps.length>1?'Todos prontos · abre a escolha de personagem':'Sozinho na sala · passe o código ou inicie'):miss.length?`Esperando entrar: ${miss.join(', ')}`:`Esperando ficar pronto: ${nr.join(', ')}`;
      rmRow(d,[['Trocar mapa',()=>{ try{ leaveNet(); }catch(e){} rmRender(); openMapPick(grp?'host':'solo'); }],['Fechar sala',()=>{ toMenu(); rmRender(); }]]); }
    else { const okN=ps.filter(p=>p.role==='host'||p.ready).length;
      if(sp) sp.textContent=NET.ready?'Pronto ✓':'Estou pronto'; pl.classList.add(NET.ready?'rmon':'rmgo');
      sub.textContent=NET.ready?`${okN}/${ps.length} prontos · o anfitrião inicia · clique para cancelar`:'Confirme para o anfitrião poder começar';
      rmRow(d,[['Sair da sala',()=>{ toMenu(); rmRender(); }]]); }
    return; }
  if(waitLead){ d.querySelector('.rmimg').style.backgroundImage=''; d.querySelector('.rmtag').textContent='Grupo'; d.querySelector('.rmcode').textContent='';
    d.querySelector('h3').textContent='Aguardando o líder'; d.querySelector('.rmd').textContent=`${SOC.party.leader} escolhe o mapa e a dificuldade`;
    const list=d.querySelector('.rmps'); list.textContent=''; for(const m of SOC.party.members){ const r=document.createElement('div'); r.className='rmp'+(m.leader?' ok':''); const s=document.createElement('span'); s.textContent=m.name; const t=document.createElement('i'); t.textContent=m.leader?'Líder':'No grupo'; r.append(s,t); list.appendChild(r); }
    rmRow(d,[]); if(sp) sp.textContent='Estou pronto'; pl.classList.add('rmoff'); sub.textContent=`Libera quando ${SOC.party.leader} escolher o mapa`; return; }
  // fora de sala: botão normal
  if(sp&&sp.textContent!=='Jogar') sp.textContent='Jogar';
  if(grp&&lead) sub.textContent=`Grupo de ${SOC.party.members.length} · escolha o mapa e a dificuldade`;
  else if(!grp&&/prontos|pronto|anfitri|líder|grupo/i.test(sub.textContent)) sub.textContent='Solo ou sala online · escolha o mapa';
}
// o render antigo do grupo (53) passa a ser este
ptyRender=function(){ rmRender(); };
{ const ru0=updateRoomLobbyUI; updateRoomLobbyUI=function(){ try{ rmRender(); }catch(e){} return ru0.apply(this,arguments); }; }
{ let last=''; setInterval(()=>{ try{ const ps=rmPeers(); const s=[G.state,NET.mode,NET.code,NET.ready,ps.map(p=>p.id+(p.ready?1:0)).join(','),typeof inParty==='function'&&inParty()?SOC.party.members.map(m=>m.name).join(','):'',$('#menu')&&!$('#menu').hidden].join('|');
    if(s!==last){ last=s; rmRender(); } }catch(e){} },300); }
// saiu da sala (fechou, caiu, anfitrião saiu): limpa o cartão
{ const ln0=leaveNet; leaveNet=function(){ const r=ln0.apply(this,arguments); try{ rmRender(); }catch(e){} return r; }; }
CMDS.sala_menu={cheat:1,d:'sala_menu [on|off] · sala online no menu (off volta o lobby físico antigo)',f:a=>{ RMQ.on=(a[0]||'on')!=='off'; rmRender(); cprint('sala no menu: '+(RMQ.on?'ligada':'desligada')); }};
