/* ================= v9 · VOZ DO MOTORISTA E CARREGAMENTO DAS VOZES =================
   - Motorista 115 com voz gravada (legenda pelo tempo do áudio). Falas ainda sem gravação ficam em silêncio.
   - Todas as vozes gravadas são baixadas logo que o som do jogo liga (o seu personagem e o motorista primeiro),
     e uma fala que ainda não terminou de baixar espera até 3 s em vez de sair muda. */
const TZREC={
  radio:[['tz_radio_01',"Atenção, passageiros: linha 115 com destino ao fim do mundo. Embarque em trinta segundos.",5.66]],
  arrive0:[['tz_arrive0_01',"Quem pediu ônibus com zumbi incluso?",2.52]],
  stop0:[['tz_stop0_01',"Posto Pereira. Gasolina cara e clientes mortos. Literalmente.",3.60],['tz_stop0_02',"Posto. Quem for comprar salgadinho, compre dois. Um para você, um para jogar neles.",4.32]],
  stop1:[['tz_stop1_01',"Lanchonete Estrela. O café é de ontem. O cozinheiro é de anteontem.",5.50]],
  stop2:[['tz_stop2_01',"Fazenda Boa Vista. A vista era boa antes dos vizinhos começarem a comer gente.",4.37],['tz_stop2_02',"Fazenda. Cuidado com o tratorista. Ele morde.",2.54]],
  stop3:[['tz_stop3_01',"Usina Velha. Se ligarem a energia, eu ganho ar-condicionado. Brincadeira. Eu não sinto calor. Nem pena.",5.83]],
  stop4:[['tz_stop4_01',"Vila São Jorge. O santo não está atendendo hoje.",2.71]],
  depart:[['tz_depart_01',"Fechando as portas. Mãos, pés e órgãos internos para dentro, por favor.",3.96],['tz_depart_02',"Partindo. Quem ficou para trás, foi um prazer.",2.62]],
  warn30:[['tz_warn30_01',"Trinta segundos. Eu não espero nem a minha avó. Ela também não respira.",6.41]],
  warn10:[['tz_warn10_01',"Dez segundos. Eu conto rápido quando quero.",2.78]],
  road:[['tz_road_01',"Apertem os cintos. Brincadeira, eles foram roubados em 1987.",5.04],['tz_road_02',"Estimativa de chegada: quando os zumbis deixarem.",2.90],['tz_road_03',"Sou programado para dirigir com segurança. A segurança de vocês não estava no manual.",4.94]],
  ride:[['tz_ride_01',"Tem alguém batendo na janela. Não, não é passageiro.",2.93],['tz_ride_02',"Se ouvirem barulho no teto, é chuva.",3.05],['tz_ride_03',"Por favor, não alimentem os zumbis. Principalmente com vocês mesmos.",3.89],['tz_ride_04',"Já perdi doze passageiros este mês.",2.78],['tz_ride_05',"Sabiam que eu tenho cinco estrelas no aplicativo? Todas dadas por mim.",4.63],['tz_ride_06',"Música ambiente indisponível. Gritos disponíveis.",3.53]],
  idle:[['tz_idle_01',"Lembrem: o ônibus é seguro. Mais ou menos. Depende do que vocês chamam de seguro.",4.51]],
  rev:[['tz_rev_01',"Ah, o revólver do teto. Eu escondi ali para uma ocasião especial. Tipo esta.",4.94]],
  board:[['tz_board_01',"Passageiro novo! Por favor, não sangre no estofado.",2.93],['tz_board_02',"Bem-vindo a bordo. A passagem é sua alma.",2.76]],
  left:[['tz_left_01',"Ficou para trás. Mandarei flores. Ou uma pá.",3.22]]
};
/* ---- carregamento antecipado ---- */
const VLOAD={q:null,t:0};
function vloadBuild(){ const own=voxKey(), list=[], add=f=>{ if(f&&!list.includes(f)) list.push(f); };
  const addChar=k=>{ const R=VOXREC[k]; if(R) for(const s in R) for(const e of R[s]) add(e[0]); };
  addChar(own); for(const c in TZREC) for(const e of TZREC[c]) add(e[0]);
  for(const k in VOXREC) addChar(k); for(const e of VOXDUO_LIST) add(e[2]); return list; }
v9On('always',()=>{ if(!Snd.ctx) return; if(!VLOAD.q){ VLOAD.q=vloadBuild(); }
  const n0=performance.now(); if(n0<VLOAD.t||!VLOAD.q.length) return; VLOAD.t=n0+150;
  for(let n=0;n<4&&VLOAD.q.length;n++){ const f=VLOAD.q.shift(); if(!Snd.hasSample(f)) try{ Snd.sample(f,{vol:0}); }catch(e){} } });
// trocou de personagem: o novo vai para a frente da fila
{ let last=''; v9On('always',()=>{ let k=''; try{ k=voxKey(); }catch(e){} if(k&&k!==last){ last=k; if(VLOAD.q){ const R=VOXREC[k]; if(R) for(const s in R) for(const e of R[s]) if(!Snd.hasSample(e[0])) VLOAD.q.unshift(e[0]); } } }); }

function voxWaitLoad(f,ok,fail,maxMs){ const t0=performance.now(), tok=VOXG.seq=(VOXG.seq||0)+1; try{ Snd.sample(f,{vol:0}); }catch(e){}
  const poll=()=>{ if(VOXG.seq!==tok) return; if(Snd.hasSample(f)) return ok(); if(performance.now()-t0>(maxMs||3000)) return fail&&fail(); setTimeout(poll,100); }; setTimeout(poll,100); }
// uma fala nova (de quem for) cancela a que ainda esperava o download
const voxPlayS=voxPlay; voxPlay=function(){ VOXG.seq=(VOXG.seq||0)+1; return voxPlayS.apply(this,arguments); };

/* fala gravada que ainda não baixou: segura a vez e toca assim que chegar (ou usa a voz do navegador se não chegar) */
const voxPlay0=voxPlay;
voxPlay=function(k,sit,i,opt){
  const e=voxLines(k,sit)[i];
  if(!e||!e.f||Snd.hasSample(e.f)||!Snd.ctx||!((+CFG.voice||0)>0)) return voxPlay0(k,sit,i,opt);
  voxStopAll(); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(err){}
  VOXG.until=performance.now()+3400+e.d*1000;
  voxWaitLoad(e.f,()=>voxPlay0(k,sit,i,opt),()=>{
    try{ const vv=VOX_VOICE[k]||{p:1,r:1}, u=new SpeechSynthesisUtterance(e.t); u.lang='pt-BR'; u.pitch=vv.p; u.rate=vv.r; u.volume=1; speechSynthesis.speak(u); }catch(err){}
    abCaption(e.t); if(!opt.own&&abCap) abCap.textContent=`${voxName(k)}: “${e.t}”`; abCapT=e.d+0.2; VOXG.until=performance.now()+e.d*1000+250; },3000);
  return e.d;
};

/* ---- Motorista 115 ---- */
const TZV={recent:{},h:null};
function tzShow(line,dur){
  if(!tzCapEl){ tzCapEl=document.createElement('div'); tzCapEl.id='tzcap'; tzCapEl.innerHTML='<b>MOTORISTA 115:</b> <span></span>'; document.body.appendChild(tzCapEl); }
  tzCapEl.querySelector('span').textContent=line; tzCapEl.classList.add('on'); clearTimeout(tzSay.tm); tzSay.tm=setTimeout(()=>tzCapEl.classList.remove('on'),dur*1000+300);
}
tzSay=function(cat){
  const pool=TZREC[cat]; if(!pool||!pool.length) return; if(G.state!=='playing'&&G.state!=='paused') return;
  const last=TZV.recent[cat]; let opts=pool.filter(e=>e[0]!==last); if(!opts.length) opts=pool; const e=pick(opts); TZV.recent[cat]=e[0]; VOXG.seq=(VOXG.seq||0)+1;
  voxStopAll(); try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(err){} if(TZV.h){ try{ TZV.h.stop(0.1); }catch(err){} TZV.h=null; }
  try{ if(abCap) abCap.classList.remove('on'); }catch(err){}
  const lock=d=>{ const n=performance.now(); VOXG.driverUntil=n+d*1000+400; TZB.sayT=d+0.3; if(typeof COOP_STATE!=='undefined') COOP_STATE.voiceLockUntil=Math.max(COOP_STATE.voiceLockUntil||0,n+d*1000+600); };
  const play=()=>{ let dur=e[2];
    if((+CFG.voice||0)>0&&Snd.hasSample(e[0])){ try{ Snd.comms(true); }catch(err){} const h=Snd.sample(e[0],{vol:voxRecVol()*0.95,prio:true,wet:0.12}); if(h){ TZV.h=h; if(h.src&&h.src.buffer) dur=h.src.buffer.duration; } }
    tzShow(e[1],dur); lock(dur); };
  lock(e[2]+3);
  if(Snd.ctx&&!Snd.hasSample(e[0])&&(+CFG.voice||0)>0) voxWaitLoad(e[0],play,play,3000); else play();
};
v9On('reset',()=>{ if(TZV.h){ try{ TZV.h.stop(0.05); }catch(e){} TZV.h=null; } });
CMDS.motorista={d:'motorista <momento> · toca uma fala do Motorista 115 (radio, stop0..stop4, depart, warn30, warn10, road, ride, idle, rev, board, left)',f:a=>{ tzSay(a[0]||'ride'); }};
