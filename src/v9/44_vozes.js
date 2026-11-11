/* ================= v9 · VOZES GRAVADAS (dublagem) =================
   Personagem com dublagem (Sargento Moreira, Padre Tomás) toca o áudio gravado (audio/sfx/vo_<personagem>_<situação>_NN.mp3) no lugar da voz
   sintética do navegador, e a legenda fica na tela exatamente o tempo do áudio.
   Enquanto um personagem estiver dublado, só as falas que já têm áudio são usadas (nada de voz robótica misturada).
   Para dublar outro personagem: gravar, converter para audio/sfx/vo_<chave>_<situação>_NN.mp3 e listar aqui.
   Cada entrada: [arquivo, legenda, duração em segundos (reserva, até o áudio carregar)]. */
const VOXREC={
  moreira:{
    round:[['vo_moreira_round_01',"Couro grosso, paciência curta.",2.28],['vo_moreira_round_02',"Já enfrentei coisa pior. Acho.",2.18],['vo_moreira_round_03',"Mais uma. Eu fico na frente.",2.40],['vo_moreira_round_04',"Ninguém passa por mim hoje.",2.02]],
    a:[['vo_moreira_a_01',"Abre caminho!",1.63],['vo_moreira_a_02',"Blindado passando!",1.82],['vo_moreira_a_03',"Licença. Não, retiro: sem licença.",2.45],['vo_moreira_a_04',"Sai da frente!",0.94]],
    u:[['vo_moreira_u_01',"Agora eu fiquei bravo.",1.94],['vo_moreira_u_02',"Casca grossa, mão pesada.",1.92],['vo_moreira_u_03',"Podem vir. Todos.",1.73],['vo_moreira_u_04',"Quem quer apanhar primeiro?",1.34]],
    multi:[['vo_moreira_multi_01',"É disso que eu tô falando!",2.64],['vo_moreira_multi_02',"Igual derrubar porta, só que com gente.",3.62],['vo_moreira_multi_03',"Isso foi o aquecimento.",2.59],['vo_moreira_multi_04',"Vem mais. Ainda não esquentei.",2.23]],
    head:[['vo_moreira_head_01',"Ficou sem tampa.",1.18],['vo_moreira_head_02',"Na moleira.",0.74]],
    low:[['vo_moreira_low_01',"Arranhão. Só um arranhão.",2.28],['vo_moreira_low_02',"Já levei mais tiro que isso no café da manhã.",3.19],['vo_moreira_low_03',"Tô inteiro. Mais ou menos inteiro.",2.42]],
    revive:[['vo_moreira_revive_01',"Valeu. Agora sai que eu resolvo.",2.35]],
    pu:[['vo_moreira_pu_01',"Equipamento novo. Vamos testar neles.",2.81]],
    sur:[['vo_moreira_sur_01',"Venham. Eu sou a parede.",1.94]],
    idle:[['vo_moreira_idle_01',"Alguém tem café? Café de verdade?",2.42]]
  },
  tomas:{
    round:[['vo_tomas_round_01',"A confissão vai ser longa esta noite.",3.29],['vo_tomas_round_02',"Mais almas perdidas. Mais trabalho para mim.",3.98],['vo_tomas_round_03',"Rezo por eles. Depois resolvo.",2.69],['vo_tomas_round_04',"Senhor, dai-me paciência. E munição.",3.00]],
    a:[['vo_tomas_a_01',"Batismo de fogo, literalmente.",2.81],['vo_tomas_a_02',"Benzido e mal-humorado.",2.18],['vo_tomas_a_03',"Sinto muito, filhos. Isso vai arder.",3.00],['vo_tomas_a_04',"Água benta, sem economia.",2.23]],
    u:[['vo_tomas_u_01',"Em nome do Pai… e do meu facão.",2.45],['vo_tomas_u_02',"Exorcismo em andamento. Não interrompam.",3.70],['vo_tomas_u_03',"Hoje a missa é campal.",1.87],['vo_tomas_u_04',"Voltem para o descanso.",1.97]],
    multi:[['vo_tomas_multi_01',"Amém. Amém. Amém.",1.75],['vo_tomas_multi_02',"Isso foi um milagre ou só boa mira?",2.98],['vo_tomas_multi_03',"Um terço inteiro de uma vez.",2.50]],
    head:[['vo_tomas_head_01',"Pela graça, e pelo crânio.",2.18],['vo_tomas_head_02',"Que descanse em paz. Agora sim.",2.74]],
    low:[['vo_tomas_low_01',"Até os santos sangram.",1.82],['vo_tomas_low_02',"Estou bem. Só um pouco mais perto do céu.",3.53],['vo_tomas_low_03',"Senhor, se for agora, que seja rápido.",3.36]],
    down:[['vo_tomas_down_01',"Pai… em tuas mãos…",1.78]],
    revive:[['vo_tomas_revive_01',"Ainda não era minha hora, pelo visto.",3.22],['vo_tomas_revive_02',"Ressurreição de terceiro dia. Adiantada.",3.58]],
    pu:[['vo_tomas_pu_01',"Obrigado, lá de cima.",2.76],['vo_tomas_pu_02',"Providência divina!",1.92]],
    sur:[['vo_tomas_sur_01',"Fila para a confissão, por favor!",2.78],['vo_tomas_sur_02',"Muitos pecadores, pouco tempo.",2.76]],
    idle:[['vo_tomas_idle_01',"A diocese nunca me paga hora extra.",2.95],['vo_tomas_idle_02',"Será que zumbi tem alma? Pergunta para o bispo.",4.08]]
  }
};
// a fala nova também entra na lista de texto do personagem
if(VOX.moreira&&VOX.moreira.multi&&!VOX.moreira.multi.includes("É disso que eu tô falando!")) VOX.moreira.multi.push("É disso que eu tô falando!");

const VOXP={h:null,pre:{},until:0};
function voxRecPreload(k){ const R=VOXREC[k]; if(!R||VOXP.pre[k]||!Snd.ctx) return; VOXP.pre[k]=1;
  for(const s in R) for(const e of R[s]) if(!Snd.hasSample(e[0])) try{ Snd.sample(e[0],{vol:0}); }catch(err){} }
v9On('always',()=>{ try{ if(Snd.ctx) voxRecPreload(voxKey()); }catch(e){} });
function voxRecStop(){ if(VOXP.h){ try{ VOXP.h.stop(0.08); }catch(e){} VOXP.h=null; } VOXP.until=0; }
// volume: a voz segue o controle "Vozes" das opções, sem depender do volume de efeitos
function voxRecVol(){ const v=CFG.voice==null?1:+CFG.voice||0, s=Math.max(0.05,CFG.sfx==null?1:+CFG.sfx||0); return clamp(1.15*v/s,0,4); }

const voxSay0=voxSay;
voxSay=function(sit,force){
  const k=voxKey(), R=VOXREC[k];
  if(!R) return voxSay0(sit,force);
  if(typeof COOP_STATE!=='undefined'&&performance.now()<(COOP_STATE.voiceLockUntil||0)) return false;
  const pool=R[sit]; if(!pool||!pool.length) return false;           // situação ainda sem gravação: fica em silêncio
  if(!force&&(voxGap>0||performance.now()<VOXP.until)) return false;  // não atropela uma fala que ainda está tocando
  voxRecPreload(k);
  const rec=voxRecent[k+sit]||(voxRecent[k+sit]=[]);
  let opts=pool.filter(e=>!rec.includes(e[1])); if(!opts.length){ rec.length=0; opts=pool.slice(); }
  const ready=opts.filter(e=>Snd.hasSample(e[0])), e=pick(ready.length?ready:opts);
  rec.push(e[1]); if(rec.length>Math.max(1,pool.length-1)) rec.shift();
  try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(err){}  // nada da voz sintética por cima
  voxRecStop();
  let dur=e[2];
  if(CFG.voice!==false&&(+CFG.voice||0)>0&&Snd.hasSample(e[0])){
    const h=Snd.sample(e[0],{vol:voxRecVol(),prio:true,wet:0.06});
    if(h){ VOXP.h=h; if(h.src&&h.src.buffer) dur=h.src.buffer.duration; }
  }
  VOXP.until=performance.now()+dur*1000;
  abCaption(e[1]); abCapT=dur+0.2;                                     // legenda com o mesmo comprimento do áudio
  voxGap=force?Math.max(4,dur+0.6):9+Math.random()*6+dur; voxIdleT=45+Math.random()*40;
  return true;
};
v9On('reset',()=>voxRecStop());

CMDS.voz={d:'voz <situação> · faz o personagem falar (round, a, u, multi, head, low, down, revive, pu, sur, idle)',f:a=>{
  const s=a[0]||'round'; const ok=voxSay(s,true); cprint(ok?'Falando: '+s:'Sem fala gravada para '+s); }};

/* ---- conversas em dupla (online) ----
   Cada fala gravada: [texto exato da fala, personagem, arquivo, duração]. Quem ainda não tem gravação segue com a voz antiga.
   Padre ↔ V.I.K.T.O.R: falas do Padre prontas; as do Viktor entram quando forem gravadas. */
const VOXDUO_LIST=[
  ["Você acredita que possui uma?",'tomas','duo_tomas-viktor_c1_2_tomas',2.71],
  ["E eu não encontrei evidências científicas de que você sabe ficar quieto.",'tomas','duo_tomas-viktor_c2_2_tomas',6.48],
  ["Depende do que você fez.",'tomas','duo_tomas-viktor_c3_2_tomas',2.11],
  ["Nesse caso, vamos conversar depois.",'tomas','duo_tomas-viktor_c3_4_tomas',3.22],
  ["Os homens.",'tomas','duo_tomas-viktor_c4_2_tomas',1.37],
  ["Não complique a teologia, meu filho.",'tomas','duo_tomas-viktor_c4_4_tomas',3.19],
  ["Acredito.",'tomas','duo_tomas-viktor_c5_2_tomas',1.34]
];
const VOXDUO={}; for(const [t,ch,f,d] of VOXDUO_LIST) VOXDUO[ch+'|'+t]=[f,d];
function voxDuoGet(ch,cv,line){ return VOXDUO[coopProfile(ch||'recruta',cv||'m')+'|'+line]||null; }
const VOXDUOP={pre:false,h:null};
v9On('always',()=>{ if(VOXDUOP.pre||!Snd.ctx||!NET.mode) return; VOXDUOP.pre=true; for(const [,,f] of VOXDUO_LIST) if(!Snd.hasSample(f)) try{ Snd.sample(f,{vol:0}); }catch(e){} });

const coopCaptionEvent0=coopCaptionEvent;
coopCaptionEvent=function(e){
  const line=String(e[8]||''), rec=voxDuoGet(e[4],e[5],line);
  if(!rec) return coopCaptionEvent0(e);
  // legenda e rádio como antes, mas sem a voz sintética
  const ss=window.speechSynthesis; if(ss) ss.speak=function(){};
  try{ coopCaptionEvent0(e); }finally{ if(ss) try{ delete ss.speak; }catch(err){} }
  voxRecStop(); if(VOXDUOP.h){ try{ VOXDUOP.h.stop(0.08); }catch(err){} VOXDUOP.h=null; }
  const sp=String(e[2]||''), local=coopIsLocalPeer(sp); let sx=null,sz=null;
  if(!local){ const rp=coopRemoteById(sp); if(rp&&rp.x!=null){ sx=rp.x; sz=rp.z; } }
  const dist=local||sx==null?0:Math.hypot(P.pos.x-sx,P.pos.z-sz), radio=!local&&(sx==null||dist>COOP_NEAR_DISTANCE);
  let dur=rec[1];
  if((+CFG.voice||0)>0&&Snd.hasSample(rec[0])){
    const o={vol:voxRecVol()*(radio?0.8:1),prio:true,wet:radio?0:0.08};
    if(!local&&!radio){ o.x=sx; o.z=sz; o.range=40; o.minVol=0.45; }
    const h=Snd.sample(rec[0],o); if(h){ VOXDUOP.h=h; if(h.src&&h.src.buffer) dur=h.src.buffer.duration; }
  } else Snd.hasSample(rec[0])||Snd.sample(rec[0],{vol:0});
  // legenda com o mesmo comprimento do áudio
  if(coopCaptionEvent.timer) clearTimeout(coopCaptionEvent.timer);
  coopCaptionEvent.timer=setTimeout(()=>{ if(coopCap) coopCap.classList.remove('on'); },dur*1000+200);
  COOP_STATE.voiceLockUntil=performance.now()+dur*1000+900;
};
// o anfitrião espera o áudio terminar antes da resposta (em vez de estimar pelo tamanho do texto)
updateCoopDialogue=function(dt){
  if(NET.mode!=='host'||G.state!=='playing') return;
  if(COOP_STATE.queue.length){
    COOP_STATE.wait-=dt;
    if(COOP_STATE.wait<=0){
      const item=COOP_STATE.queue.shift(); coopDispatchLine(item);
      const rec=voxDuoGet(item.speaker.char,item.speaker.cv,item.text);
      COOP_STATE.wait=rec?rec[1]+0.9:Math.max(5.2,Math.min(8.4,item.text.length/14.5+1.2));
    }
    if(!COOP_STATE.queue.length) COOP_STATE.active=false;
    return;
  }
  COOP_STATE.next-=dt;
  if(COOP_STATE.next<=0){ if(coopMakeScene()) COOP_STATE.next=92+Math.random()*38; else COOP_STATE.next=18; }
};
