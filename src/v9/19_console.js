/* ================= v9 · CONSOLE DO DESENVOLVEDOR: comandos para tudo que entrou na v9 =================
   Mapas novos (cidade, laboratório, Tranzitch), teleporte para os pontos importantes, carro e máquina do tempo já montados,
   chefes novos (Mutante e Sósia), eventos novos, relíquias, forja, agarrão do cachorro, recompensas, bebidas novas,
   vitrine e inventário. Os de trapaça pedem sv_cheats 1, como os outros. */
(function(){
  const MAPN={bunker:'bunker',hosp:'hosp',hospital:'hosp',hospicio:'hosp',farm:'farm',fazenda:'farm',mansao:'farm',tz:'tz',tranzitch:'tz',onibus:'tz',city:'city',cidade:'city',lab:'lab',laboratorio:'lab',futuro:'lab'};
  // entra num mapa (recomeçando a partida) e roda cb quando o mapa estiver pronto
  // espera o jogo ficar de pé (a escolha de personagem e o início da rodada podem demorar) antes de seguir
  function waitFor(cond,cb,ms){ const t0=performance.now(); const tick=()=>{ let okk=false; try{ okk=cond(); }catch(e){} if(okk){ cb(); return; } if(performance.now()-t0>(ms||20000)){ cprint('Demorou demais para carregar o mapa; tente de novo.','err'); return; } setTimeout(tick,150); }; tick(); }
  const playing=k=>()=>CUR===k&&G.state==='playing';
  function startOn(k,cb){ if(TM.lab&&k!=='hosp') labUndo(); if(CUR===k&&inGame()){ cb&&cb(); return; } setMap(k); closeConsole(); startGame(); waitFor(playing(k),()=>setTimeout(()=>cb&&cb(),200)); }
  // entra num mapa (recomeçando a partida) e roda cb quando o mapa estiver pronto
  function goMap(k,cb){
    if(k==='city'){ if(CUR==='city'&&inGame()){ cb&&cb(); return; } if(TM.lab) labUndo();
      startOn('bunker',()=>{ closeConsole(); CAR.going=true; cityEnter(); waitFor(()=>CUR==='city'&&G.state==='playing'&&G.round>=1,()=>cb&&cb()); }); return; }
    if(k==='lab'){ startOn('hosp',()=>{ labApply(); updateMissionHud(); cb&&cb(); }); return; }
    startOn(k,cb); }
  function tpTo(x,z,yaw){ P.pos.set(x,0,z); P.y=0; P.vy=0; if(yaw!=null) P.yaw=yaw; try{ resetMotion(); }catch(e){} flowDirty=true; }
  const SPOTS={
    carro:{m:'bunker',d:'ao lado do carro (fora do bunker)',p:()=>{ const c=carPos(); return [c.x-3,c.z,Math.PI/2]; }},
    maquina:{m:'hosp',d:'na máquina do tempo (quintal do hospício)',p:()=>{ const t=tmPos(); return [t.x,t.z+3.5,0]; }},
    quintal:{m:'hosp',d:'quintal do hospício',p:()=>{ const t=tmPos(); return [t.x-3,t.z+5,0]; }},
    posto:{m:'tz',d:'dentro do posto do Tranzitch',p:()=>[cx(37),cx(tzSec(0)+12),Math.PI/2]},
    estoque:{m:'tz',d:'estoque do posto (porta de 750)',p:()=>[cx(42.5),cx(tzSec(0)+11),Math.PI/2]},
    oficina:{m:'tz',d:'oficina do posto (porta de 1000)',p:()=>[cx(42.5),cx(tzSec(0)+18),Math.PI/2]},
    praca:{m:'city',d:'praça central da cidade (onde o Mutante aparece)',p:()=>[cx(23.5),cx(czr(36)),0]},
    rua:{m:'city',d:'rua onde o carro chega na cidade',p:()=>[MAPS.city.start[0],MAPS.city.start[1],0]},
    lab:{m:'lab',d:'laboratório secreto (hospício no futuro)',p:()=>{ const t=tmPos(); return [t.x,t.z+3.5,0]; }}
  };
  for(const i of [0,1,2,3,4]) SPOTS['parada'+(i+1)]={m:'tz',d:'parada '+(i+1)+' do ônibus',p:()=>[cx(23),cx(tzSec(i)+12),0]};
  const ok=s=>cprint(s), err=s=>cprint(s,'err');

  /* ---- map: agora com tz, cidade e laboratório ---- */
  CMDS.map={d:'map bunker | hosp | farm | tz | cidade | lab (troca de mapa e recomeça; cidade entra pelo carro, lab já viaja no tempo)',f:a=>{
    const k=MAPN[String(a[0]||'').toLowerCase()]; if(!k){ err('Mapas: bunker, hosp, farm, tz, cidade, lab. Use sandbox 7824 para a área de testes.'); return; } if(!needHost()) return;
    if((k==='city'||k==='lab')&&!CHEAT.on){ err('cidade e lab precisam de sv_cheats 1'); return; }
    if(k!=='city'&&k!=='lab'&&!inGame()&&G.state!=='over'){ if(TM.lab) labUndo(); setMap(k); const m=MAPS[k].menu; P.pos.set(m.x,0,m.z); ok('Mapa: '+MAPS[k].name); return; }
    goMap(k,()=>{ const s=k==='city'?SPOTS.rua:k==='lab'?SPOTS.lab:null; if(s){ const [x,z,y]=s.p(); tpTo(x,z,y); } }); ok('Mapa: '+(k==='city'?'Cidade destruída':k==='lab'?'Laboratório secreto (2087)':MAPS[k].name)); }};

  /* ---- tp ---- */
  CMDS.tp={cheat:1,d:'tp <lugar> | tp x z · lugares: carro, maquina, quintal, posto, estoque, oficina, parada1-5, praca, rua, lab (troca de mapa se precisar)',f:a=>{
    if(!needHost()) return; const w=String(a[0]||'').toLowerCase();
    if(a.length>=2&&!isNaN(parseFloat(a[0]))){ if(!needGame()) return; tpTo(num(a[0],P.pos.x),num(a[1],P.pos.z)); ok(`tp ${P.pos.x.toFixed(1)} ${P.pos.z.toFixed(1)}`); return; }
    const s=SPOTS[w]; if(!s){ err('Lugares: '+Object.keys(SPOTS).join(', ')+' · ou tp x z'); return; }
    const go=()=>{ const [x,z,y]=s.p(); tpTo(x,z,y); ok('Teleportado: '+s.d); };
    if((s.m==='lab'&&TM.lab&&CUR==='hosp')||(s.m===CUR&&!(s.m==='hosp'&&TM.lab&&w!=='lab'))) { if(!needGame()) return; go(); } else goMap(s.m,go); }};
  CMDS.pos={d:'mostra sua posição (x z), a célula e a sala',f:()=>{ const X=Math.floor(P.pos.x/S), Z=Math.floor(P.pos.z/S); ok(`${CUR} · x ${P.pos.x.toFixed(2)} z ${P.pos.z.toFixed(2)} · célula ${X},${Z} '${at(X,Z)}'`); }};

  /* ---- carro do bunker ---- */
  CMDS.carro={cheat:1,d:'carro montar | partida | pecas | reset · montar instala as 10 peças; partida já leva todo mundo para a cidade',f:a=>{
    if(!needHost()) return; const w=String(a[0]||'montar').toLowerCase();
    if(w==='pecas'){ ok('Peças do carro: '+CAR.parts.map((p,i)=>`${i+1}.${CAR_PARTS[i].n}=${['no chão','carregada','instalada','—'][p.st|0]||p.st}`).join(' · ')); return; }
    const run=()=>{ if(w==='reset'){ carReset(); ok('Carro desmontado, peças espalhadas de novo.'); return; }
      for(let i=0;i<CAR.parts.length;i++) if(CAR.parts[i].st!==2) carInstall(i); CAR.carry=-1; carVis(); updateMissionHud(); ok('Carro montado. Use "carro partida" ou entre e segure E.');
      if(w==='partida'){ closeConsole(); CAR.seated=true; setTimeout(carGo,300); ok('Partindo para a cidade…'); } };
    goMap('bunker',run); }};

  /* ---- máquina do tempo ---- */
  CMDS.maquina={cheat:1,d:'maquina montar | viajar | pecas | reset · montar instala as 10 peças; viajar faz a viagem para 2087',f:a=>{
    if(!needHost()) return; const w=String(a[0]||'montar').toLowerCase();
    if(w==='pecas'){ ok('Peças da máquina: '+TM.parts.map((p,i)=>`${i+1}=${['no chão','carregada','instalada','com o chefe'][p.st|0]||p.st}`).join(' · ')); return; }
    const run=()=>{ if(w==='reset'){ if(TM.lab) labUndo(); tmReset(); ok('Máquina desmontada, peças espalhadas de novo (2 com os chefes).'); return; }
      for(let i=0;i<TM.parts.length;i++) if(TM.parts[i].st!==2) tmInstall(i); TM.carry=-1; tmVis(); updateMissionHud(); ok('Máquina do tempo montada.');
      if(w==='viajar'){ closeConsole(); setTimeout(tmGo,300); ok('Viajando para 2087…'); } };
    if(TM.lab&&w!=='reset'){ run(); return; } goMap('hosp',run); }};
  CMDS.lab={cheat:1,d:'lab 0/1 liga ou desliga o laboratório do futuro no hospício (mais difícil e mais caro)',f:a=>{ if(!needHost()) return; const b=bool(a[0]); const on=b==null?!TM.lab:b;
    if(on){ goMap('lab',()=>ok('Laboratório ligado: tudo mais difícil e mais caro.')); } else { labUndo(); updateMissionHud(); ok('Laboratório desligado.'); } }};

  /* ---- chefes: 5 Mutante Ácido, 6 Sósia ---- */
  const _chefe=CMDS.chefe.f;
  CMDS.chefe.d='chefe 1-6 chama um chefe agora (1 Brutamontes, 2 Gritadora, 3 Incendiário, 4 Necromante, 5 Mutante Ácido — vai para a cidade, 6 Sósia)';
  CMDS.chefe.f=a=>{ const w=String(a[0]||'').toLowerCase();
    if(w==='5'||w==='mutante'){ if(!needHost()) return; const spawn=()=>{ if(CITY.boss&&!CITY.boss.dead){ err('O Mutante já está vivo.'); return; } CITY.boss=null; megaSpawn(); ok('O Mutante Ácido apareceu na praça.'); };
      if(CUR!=='city'){ ok('Indo para a cidade…'); goMap('city',()=>setTimeout(spawn,300)); } else { if(!needGame()) return; closeConsole(); spawn(); } return; }
    if(w==='6'||w==='sosia'){ if(!needGame()||!needHost()) return; sosiaSpawn(); ok('Um Sósia apareceu.'); return; }
    _chefe(a); };
  CMDS.mutante={cheat:1,d:'mutante cair | escudo | morrer · controla o Mutante Ácido vivo (cair = derrubado, escudo = quebra o escudo)',f:a=>{ if(!needGame()||!needHost()) return; const z=CITY.boss; if(!z||z.dead){ err('Nenhum Mutante vivo (use chefe 5).'); return; }
    const w=String(a[0]||'').toLowerCase(); if(w==='cair'){ z.downT=6; ok('Mutante caído por 6 s: mire nas costas.'); } else if(w==='escudo'){ try{ megaShield(z,z.shield||0); }catch(e){} z.shield=0; ok('Escudo quebrado.'); } else if(w==='morrer'){ try{ megaShield(z,z.shield||0); }catch(e){} z.shield=0; z.hp=1; try{ applyHit(z,999999,'head','gun'); }catch(e){ err(e.message); } ok('Mutante abatido.'); } else ok(`Mutante: vida ${Math.ceil(z.hp)}/${Math.ceil(z.maxHp)} · escudo ${Math.ceil(z.shield||0)}${z.downT>0?' · caído':''}`); }};

  /* ---- eventos (inclui troca, sósia, roleta, chuva e eclipse) ---- */
  const _ev=CMDS.evento.f;
  CMDS.evento.d='evento '+Object.keys(EVT_INFO).join('|')+' força um evento';
  CMDS.evento.f=a=>{ const k=String(a[0]||''); if(k==='roleta'&&EVT_INFO.roleta){ if(!needGame()||!needHost()) return; if(EVT.k) evEnd(false); const p=frontPoint(3); EVT.px=p.x; EVT.pz=p.z; evStart('roleta',EVT_INFO.roleta[2],true); ok('Evento: roleta (na sua frente)'); return; }
    if(k==='troca'){ V9EV.last=null; } if(k==='sosia'){ V9EV.last=null; V9EV.sosia=null; } _ev(a); };
  CMDS.troca={cheat:1,d:'troca [personagem] vira outro sobrevivente agora (troca fim volta ao seu)',f:a=>{ if(!needGame()) return; const w=String(a[0]||'').toLowerCase();
    if(w==='fim'){ swapEnd(); ok('Voltou ao seu personagem.'); return; } if(V9EV.swap) swapEnd(); swapStart(); if(CHARS[w]&&PROG.char!==w){ PROG.char=w; PROG.cv=varKeys(w)[0]; try{ applyHands(); abApplyLevels(); recomputeMods(); }catch(e){} } ok('Agora você é: '+CHARS[PROG.char].name); }};

  /* ---- relíquias ---- */
  CMDS.reliquia={cheat:1,d:'reliquia '+RK.join('|')+'|todas [chao] · aplica por 5 rodadas (com "chao" solta na sua frente)',f:a=>{ if(!needGame()) return; const w=String(a[0]||'todas').toLowerCase(), drop=String(a[1]||'')==='chao';
    const ks=w==='todas'?RK:RK.includes(w)?[w]:null; if(!ks){ err('Relíquias: '+RK.join(', ')+', todas'); return; }
    if(drop){ const p=frontPoint(2.5); relicSpawn(ks[0],p.x,p.z); ok('Relíquia no chão: '+RELICS[ks[0]].name); return; }
    const rl=v9Relics(); for(const k of ks) rl[k]=5; relicHud(); ok('Relíquias: '+ks.map(k=>RELICS[k].name).join(', ')); }};

  /* ---- bebidas novas ---- */
  CMDS.perk.d='perk all | '+PERKS.map(p=>p.key).join(' | ')+' (revive = Soro da Vida, mule = Mula de Carga)';
  CMDS.reviver={cheat:1,d:'reviver oferta | soro · testa o reviver sozinho com drax (oferta) ou o Soro da Vida (soro)',f:a=>{ if(!needGame()) return; const w=String(a[0]||'oferta').toLowerCase(); closeConsole();
    if(w==='soro'){ G.perks.revive=true; hudPerks(); } P.hp=0; ok('Caindo para testar o reviver…'); setTimeout(()=>{ try{ hurtPlayer(9999,null); }catch(e){} },200); }};

  /* ---- armas: forja, nível máximo ---- */
  CMDS.forja={cheat:1,d:'forja agora | pronta · agora = a arma na mão já sai forjada; pronta = a arma na forja fica pronta para buscar',f:a=>{ if(!needGame()) return; const w=String(a[0]||'agora').toLowerCase();
    if(w==='pronta'){ if(!G.forge){ err('Nenhuma arma na forja.'); return; } G.forge.left=0; ok('A arma na forja está pronta.'); return; }
    const s=curSlot(); if(!s||Wp.knifeOut){ err('Pegue uma arma na mão.'); return; } s.lvl=MAXLV; s.ov=1; const st=wstat(s); s.mag=st.mag; s.reserve=st.reserve; setGunModel(); hudAmmo(); ok(st.name+' forjada (nível máximo + forja).'); }};

  /* ---- cachorro, recompensas, capacete ---- */
  CMDS.cachorro_agarrar={cheat:1,d:'cachorro_agarrar testa o agarrão do cachorro (aperte ataque para esfaquear)',f:()=>{ if(!needGame()) return; closeConsole(); setTimeout(()=>{ try{ dogGrabStart(null,null,NET.mode!=='client'); }catch(e){ err('Falhou: '+e.message); } },250); }};
  CMDS.recompensa={cheat:1,d:'recompensa [N] [rodada] ganha N recompensas (caixa, faca ou artefato) com a animação do canto',f:a=>{ const n=clamp(num(a[0],1)|0,1,20), R=num(a[1],G.round||10)|0; for(let i=0;i<n;i++) setTimeout(()=>{ try{ v9GiveReward(R,false); }catch(e){} },i*900); ok(`${n} recompensa(s) da rodada ${R}.`); }};
  CMDS.recompensa_fim={cheat:1,d:'mostra a tela de fim de partida com o anel de XP (dados de exemplo)',f:()=>{ try{ CMDS.pg_demo.f([]); }catch(e){ err(e.message); } }};

  /* ---- loja e menu ---- */
  CMDS.vitrine={cheat:1,d:'vitrine reset · libera comprar de novo os itens da vitrine de hoje',f:a=>{ PROG.vitB=null; try{ saveProg(); }catch(e){} try{ renderArsenal(); }catch(e){} ok('Vitrine liberada de novo.'); }};
  CMDS.carrossel={d:'carrossel proximo | novo · avança o carrossel de skins do menu ou sorteia outro',f:a=>{ if(String(a[0]||'')==='novo') CRS.list=SKIN_DEFS.slice().sort(()=>Math.random()-0.5).slice(0,6); CRS.i++; carRender(); ok('Carrossel atualizado.'); }};
  CMDS.arma_xp={cheat:1,d:'arma_xp <id> N dá XP de arma (nível de cada arma no menu) · arma_xp todas N',f:a=>{ const w=String(a[0]||'').replace('weapon_',''); const n=num(a[1],1000)|0; const ids=w==='todas'?Object.keys(WEAPONS):WEAPONS[w]?[w]:null; if(!ids){ err('Use o id da arma (ex.: ptrs, xbow) ou todas'); return; }
    const st=PROG.v9wl||(PROG.v9wl={}); for(const id of ids) st[id]=(st[id]|0)+n; saveProg(); ok(`+${n} XP em ${ids.length} arma(s).`); }};
  CMDS.intro={d:'toca de novo o vídeo de abertura',f:()=>{ closeConsole(); const d=v9El('div','',`<video src="intro.mp4" autoplay playsinline style="width:100%;height:100%;object-fit:contain;background:#000"></video>`); d.style.cssText='position:fixed;inset:0;z-index:300;background:#000'; document.body.appendChild(d); const v=d.querySelector('video'); v.muted=false; const end=()=>d.remove(); v.onended=end; v.onerror=end; d.onclick=end; }};

  /* ---- lista do que é novo ---- */
  CMDS.v9={d:'lista os comandos da v9',f:()=>{ cprint('Comandos da v9 (os marcados com * pedem sv_cheats 1):','dim'); for(const k of ['map','tp','pos','carro','maquina','lab','chefe','mutante','evento','troca','reliquia','perk','reviver','forja','cachorro_agarrar','recompensa','recompensa_fim','carregar','hab_infinita','vitrine','carrossel','arma_xp','intro','give']) if(CMDS[k]) cprint(`${CMDS[k].cheat?'* ':'  '}${k} — ${CMDS[k].d}`); cprint('  give weapon_xbow · Besta Carcará (as outras armas novas também estão no give)','dim'); }};
  for(const k of ['vitrine','tp','carro','maquina','lab','mutante','troca','reliquia','reviver','forja','cachorro_agarrar','recompensa','recompensa_fim','arma_xp']) if(CMDS[k]) CMDS[k].cheat=1;
})();
/* ---- habilidade e ultimate na hora ---- */
const V9AB={inf:false};
function abReadyNow(){ V9AB.unlock=true; AB.ult=100; AB.cd=0; AB.heat=0; AB.act=0; AB.dash=0; AB.ultAct=0; AB.ready=true; try{ abHud(true); }catch(e){} }
// com o carregar, habilidade e ultimate ficam liberadas nesta sessão mesmo se o personagem ainda não desbloqueou
const _v9lvA=abLvAx; abLvAx=function(ax,z){ const r=_v9lvA(ax,z); return V9AB.unlock&&CHEAT.on?Math.max(r,0):r; };
const _v9lvU=abLvUx; abLvUx=function(ax,z){ const r=_v9lvU(ax,z); return V9AB.unlock&&CHEAT.on?Math.max(r,1):r; };
CMDS.carregar={cheat:1,d:'carregar · habilidade (Z) e ultimate (X) prontas para usar agora: sem recarga, sem efeito ativo travando e liberadas mesmo se bloqueadas',f:()=>{ abReadyNow(); cprint('Habilidade (Z) e ultimate (X) prontas para usar.'); }};
CMDS.hab_infinita={cheat:1,d:'hab_infinita 0/1 · habilidade e ultimate sempre carregadas (recarregam na hora depois de usar)',f:a=>{ const b=bool(a[0]); V9AB.inf=b==null?!V9AB.inf:b; cprint('Habilidade infinita '+(V9AB.inf?'LIGADA':'DESLIGADA')); }};
v9On('always',()=>{ if(!V9AB.inf||!CHEAT.on||G.state!=='playing') return; V9AB.unlock=true; if(AB.ult<100) AB.ult=100; if(AB.cd>0) AB.cd=0; AB.heat=0; AB.ready=true; });
v9On('reset',()=>{ if(!CHEAT.on) V9AB.inf=false; });
