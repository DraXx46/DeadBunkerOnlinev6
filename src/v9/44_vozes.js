/* ================= v9 · VOZES GRAVADAS (dublagem) =================
   Personagem com dublagem toca o áudio gravado (audio/sfx/vo_<personagem>_<situação>_NN.mp3) no lugar da voz
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
