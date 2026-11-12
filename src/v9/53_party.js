/* ================= v9 · GRUPO SEM SALA DE ESPERA =================
   Com o grupo montado no menu, o "Estou pronto" fica no próprio menu (o botão Jogar dos membros vira "Estou pronto"):
   cada membro confirma ali, e todos veem quem já está pronto. Quando o líder escolhe o mapa,
   a sala é criada, o grupo entra sozinho e a escolha de personagem começa direto, sem passar pela sala de espera.
   Se alguém não chegar em 25 s, começa com quem já entrou. */
const PTY={auto:false,t0:0,started:false};
// membros: o próprio botão Jogar vira "Estou pronto"; líder: o botão mostra quem falta
function ptyMe(){ if(!SOC.party) return null; const me=(SOC.acc&&SOC.acc.name)||pgPlayerName(); return SOC.party.members.find(m=>fkey(m.name)===fkey(me))||null; }
function ptyAllReady(){ return !!SOC.party&&SOC.party.members.every(m=>m.ready||m.leader); }
function ptyRender(){ const pl=$('#play'), sub=$('#playsub'); if(!pl||!sub) return; const sp=pl.querySelector('span');
  if(!inParty()){ pl.classList.remove('ptyok','ptyme'); if(sp&&sp.textContent!=='Jogar') sp.textContent='Jogar'; return; }
  const n=SOC.party.members.length, ok=SOC.party.members.filter(m=>m.ready||m.leader).length;
  if(isLeader()){ pl.classList.remove('ptyme'); pl.classList.toggle('ptyok',ptyAllReady()); if(sp) sp.textContent='Jogar';
    const falta=SOC.party.members.filter(m=>!m.ready&&!m.leader).map(m=>m.name);
    sub.textContent=falta.length?`Grupo ${ok}/${n} pronto · esperando ${falta.join(', ')}`:`Grupo de ${n} · todos prontos, escolha o mapa`; }
  else{ const me=ptyMe(), r=!!(me&&me.ready); pl.classList.add('ptyme'); pl.classList.remove('wait'); pl.classList.toggle('ptyok',r);
    if(sp) sp.textContent=r?'Pronto ✓':'Estou pronto';
    sub.textContent=r?`${ok}/${n} prontos · ${SOC.party.leader} escolhe o mapa · clique para cancelar`:`Confirme para ${SOC.party.leader} poder começar`; } }
v9Css(`#play.ptyme{background:linear-gradient(180deg,#2f7a45,#1d4e2b);border-color:#4caf6a}#play.ptyme.ptyok{background:linear-gradient(180deg,#3a3a32,#22221d);border-color:#4caf6a}#play.ptyok:not(.ptyme){box-shadow:0 0 0 2px rgba(76,175,106,.6),0 10px 30px rgba(0,0,0,.55)}`);
document.getElementById('play')?.addEventListener('click',e=>{ if(inParty()&&!isLeader()){ e.stopImmediatePropagation(); e.preventDefault(); const me=ptyMe(); netSendRaw({type:'partyReady',ready:!(me&&me.ready)}); Snd.ui('select'); } },true);
const renderParty0=renderParty; renderParty=function(){ const r=renderParty0.apply(this,arguments); try{ ptyRender(); }catch(e){} return r; };
v9On('menu',()=>{ try{ ptyRender(); }catch(e){} });
{ let last=''; setInterval(()=>{ const s=G.state+'|'+inParty(); if(s!==last){ last=s; try{ ptyRender(); }catch(e){} } },500); }

// líder: só escolhe o mapa com todo mundo pronto (ou se confirmar começar assim mesmo)
{ const pc=playChoice; playChoice=async function(k){
  if(inParty()&&isLeader()){
    if(!ptyAllReady()&&!PTY.force){ const falta=SOC.party.members.filter(m=>!m.ready&&!m.leader).map(m=>m.name).join(', ');
      toast(`Esperando ficar pronto: ${falta}`,{actions:[['Começar assim mesmo',()=>{ PTY.force=true; playChoice(k); },'ok']]}); return; }
    PTY.force=false; PTY.auto=true; PTY.t0=performance.now(); PTY.started=false; }
  return pc.apply(this,arguments); }; }
// anfitrião do grupo: começa a escolha de personagem sozinho quando todos entraram e estão prontos
v9On('always',()=>{
  if(!PTY.auto) return; if(NET.mode!=='host'||G.state!=='lobby'){ if(G.state==='playing'||!NET.mode&&performance.now()-PTY.t0>8000){ PTY.auto=false; } return; }
  if(PTY.started) return; let ps=[]; try{ ps=NET.gr?NET.gr.peers():[]; }catch(e){}
  const want=SOC.party?SOC.party.members.length:1, ready=ps.filter(p=>p.peer===NET.me||p.ready).length, age=performance.now()-PTY.t0;
  if((ps.length>=want&&ready>=ps.length)||(age>25000&&ready>=ps.length)){ PTY.started=true; beginRoomGame(); }
});
