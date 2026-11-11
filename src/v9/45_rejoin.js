/* ================= v9 · RECONECTAR NA PARTIDA =================
   Quem começou a partida online pode voltar para ela mesmo com o jogo em andamento.
   - Caiu a internet no meio do jogo: o jogo continua na tela e tenta reconectar sozinho por até 90 s,
     voltando para a mesma partida com as armas e os pontos que tinha.
   - Fechou o jogo ou a página: ao abrir de novo aparece o botão "Voltar para a partida" no menu
     (entra no round atual, com o equipamento inicial).
   O servidor reconhece o jogador por um código de reconexão guardado neste navegador (bdm_rid).
   Se o anfitrião sair, a partida acaba para todos (o jogo roda no computador dele). */
const REJ={rid:'',on:false,t0:0,tryT:0,joining:false,keep:false,saveT:0,btn:null};
try{ REJ.rid=localStorage.getItem('bdm_rid')||''; if(REJ.rid.length<8){ REJ.rid=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)+Date.now()).replace(/[^a-zA-Z0-9]/g,'').slice(0,32); localStorage.setItem('bdm_rid',REJ.rid); } }catch(e){ REJ.rid='r'+Math.random().toString(36).slice(2,14); }
function rejSaved(){ try{ const o=JSON.parse(localStorage.getItem('bdm_rejoin')||'null'); if(o&&o.code&&Date.now()-o.t<3*3600*1000) return o; }catch(e){} return null; }
function rejSave(code){ try{ localStorage.setItem('bdm_rejoin',JSON.stringify({code,t:Date.now(),map:CUR})); }catch(e){} }
function rejClear(){ try{ localStorage.removeItem('bdm_rejoin'); }catch(e){} }

// o código de reconexão vai junto quando o jogo se apresenta ao servidor e quando cria ou entra numa sala
const netSendRaw0=netSendRaw;
netSendRaw=function(obj){ if(obj&&(obj.type==='hello'||obj.type==='createRoom'||obj.type==='joinRoom')) obj.rid=REJ.rid; return netSendRaw0(obj); };
// voltando para a partida depois de fechar o jogo: usa o mesmo personagem que tinha escolhido
const netRequest0=netRequest;
netRequest=function(type,payload){ const pr=netRequest0(type,payload);
  if(type==='joinRoom') pr.then(r=>{ if(r&&r.rejoin&&r.char&&!REJ.on) try{ pickApply(r.char); closePick(); }catch(e){} }).catch(()=>{});
  return pr; };

// enquanto reconecta, a falta do anfitrião na lista não derruba o jogador para o menu
const hostGone0=hostGone;
hostGone=function(){ if(REJ.on) return; return hostGone0.apply(this,arguments); };
// sair de propósito (ou a partida acabar) apaga a partida salva; cair a conexão não
const leaveNet0=leaveNet;
leaveNet=function(){ if(!REJ.keep) rejClear(); REJ.keep=false; return leaveNet0.apply(this,arguments); };

function rejGiveUp(msg,keep){ REJ.on=false; REJ.joining=false; REJ.keep=!!keep; banner('Não deu para reconectar',msg,'red'); setTimeout(()=>{ if(NET.mode) toMenu(); },2600); }
function rejJoin(){
  if(REJ.joining||!NET.code) return; REJ.joining=true;
  netRequest0('joinRoom',{code:NET.code,name:getPlayerName()}).then(r=>{
    REJ.joining=false; if(!REJ.on) return;
    REJ.on=false; NET.roomMeta=r.room; NET.hostPeer=r.room.hostId; NET.hostSeen=performance.now(); NET.ready=true;
    setLobbyPeerList(r.room.players||[]);
    banner('RECONECTADO','Você voltou para a partida.','gold'); try{ Snd.ui&&Snd.ui('ok'); }catch(e){}
  }).catch(err=>{ REJ.joining=false; if(REJ.on) rejGiveUp((err&&err.message)||'A partida não existe mais.',false); });
}
const handleNetMessage0=handleNetMessage;
handleNetMessage=function(m){ const r=handleNetMessage0.apply(this,arguments);
  if(m&&m.type==='welcome'){ if(REJ.on) rejJoin(); rejBtnUpdate(); }
  return r; };

v9On('always',()=>{
  const now=performance.now(), inMatch=G.state!=='menu'&&G.state!=='lobby';
  // guarda a partida em andamento (só convidados: o anfitrião é quem roda a partida)
  if(NET.mode==='client'&&NET.code&&inMatch&&now-REJ.saveT>5000){ REJ.saveT=now; rejSave(NET.code); }
  // a conexão caiu no meio da sala ou da partida: tenta voltar sozinho
  if(NET.mode==='client'&&NET.code&&NET.ws&&NET.ws.readyState===3&&!REJ.on){
    REJ.on=true; REJ.t0=now; REJ.tryT=0; banner('CONEXÃO PERDIDA','Tentando reconectar na partida…','red');
  }
  if(REJ.on){
    if(now-REJ.t0>90000){ rejGiveUp('A conexão não voltou. Abra o menu e use "Voltar para a partida" quando a internet voltar.',true); return; }
    if(NET.ws&&NET.ws.readyState===3&&now-REJ.tryT>3000){ REJ.tryT=now; try{ initNet(); }catch(e){} }
  }
  if(G.state==='menu'&&now-(REJ.btnT||0)>1000){ REJ.btnT=now; rejBtnUpdate(); }
});

/* botão no menu para voltar para a partida depois de fechar o jogo */
function rejBtnUpdate(){
  const s=rejSaved(), show=!!s&&G.state==='menu'&&!NET.mode&&NET.connected;
  if(!REJ.btn&&show){ const b=document.createElement('button'); b.id='rejoinBtn'; b.type='button';
    b.style.cssText='position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:60;padding:12px 22px;font:600 15px/1.2 inherit;letter-spacing:.04em;color:#fff;background:#8a1d14;border:1px solid #e0573f;border-radius:6px;box-shadow:0 6px 24px rgba(0,0,0,.5);cursor:pointer';
    b.addEventListener('click',()=>{ const s2=rejSaved(); if(!s2) return rejBtnUpdate(); b.disabled=true; b.textContent='Entrando…';
      joinGame(s2.code).then(()=>{ b.disabled=false; if(!NET.mode){ rejClear(); toast('Essa partida já acabou.',{bad:true}); } rejBtnUpdate(); }); });
    document.body.appendChild(b); REJ.btn=b; }
  if(REJ.btn){ REJ.btn.hidden=!show; if(show&&!REJ.btn.disabled) REJ.btn.textContent='Voltar para a partida '+s.code; }
}

CMDS.reconectar={d:'reconectar · volta para a última partida online que você começou',f:()=>{ const s=rejSaved(); if(!s) return cprint('Nenhuma partida para voltar.'); joinGame(s.code); cprint('Entrando na sala '+s.code+'…'); }};
