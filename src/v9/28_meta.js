/* ================= v9 · META =================
   passe de temporada · prestígio · loadout · prévia dos mapas · salas públicas · reconfiguração de teclas */

/* ---------------- passe de temporada ---------------- */
const SEASON={id:1,name:'Temporada 1 · Cinzas',end:Date.UTC(2027,1,1),tiers:50,per:1000};
const ASH={n:'Cinzas',c:0x3a3530,e:0x5a1404,s:30};   // camuflagem exclusiva do passe
function passReward(t){ if(t===50) return {k:'final',drax:5000,box:'oculta',txt:'Título “Cinzento” · Caixa Oculta · ◆ 5.000'};
  if(t===25) return {k:'camo',txt:'Camuflagem Cinzas (todas as armas)'};
  if(t%10===0) return {k:'ruby',ruby:10,txt:'♦ 10 rubis'};
  if(t%5===0) return {k:'box',box:t>=40?'sombra':t>=20?'bunker':'mil',txt:'Caixa '+(t>=40?'Sombria':t>=20?'do Bunker':'Militar')};
  if(t%3===0) return {k:'ruby',ruby:2,txt:'♦ 2 rubis'};
  return {k:'drax',drax:200+t*20,txt:'◆ '+v9Fmt(200+t*20)}; }
function passSt(){ let p=PROG.v9pass; if(!p||p.s!==SEASON.id) p=PROG.v9pass={s:SEASON.id,xp:0,got:0,camo:false,useCamo:false,title:false}; return p; }
const passTier=xp=>Math.min(SEASON.tiers,Math.floor(xp/SEASON.per));
function passAdd(xp,why){ if(CHEAT.on&&!PASSDBG.on) return; const p=passSt(); if(Date.now()>SEASON.end) return; p.xp=(p.xp|0)+Math.max(0,Math.round(xp)); const t=passTier(p.xp); const got=[];
  while(p.got<t){ p.got++; const r=passReward(p.got); got.push(p.got+': '+r.txt);
    if(r.drax) PROG.drax=(PROG.drax|0)+r.drax; if(r.ruby) PROG.rubies=(PROG.rubies|0)+r.ruby; if(r.box) try{ giveBox(r.box); }catch(e){}
    if(r.k==='camo'){ p.camo=true; p.useCamo=true; } if(r.k==='final') p.title=true; }
  try{ saveProg(); }catch(e){} if(got.length) toast('Passe de temporada · nível '+got.map(g=>g).join(' · ')); }
const PASSDBG={on:false};
const _v9pem=pgEndMatch; pgEndMatch=function(){ const S=_v9pem.apply(this,arguments); try{ if(S&&!S.cheat){ passAdd(S.base*1.2+((G.round|0)>=15?400:0),'partida'); prestBonus(S); } }catch(e){ console.warn('[v9] passe',e); } return S; };
const _v9achd=achDone; achDone=function(id){ const a=achSt(); const had=!!a.d[id]; _v9achd(id); if(!had&&a.d[id]) passAdd(300,'conquista'); };
const _v9chadd=chAdd; chAdd=function(){ const s=chState(); const before=[...s.daily,s.week].filter(c=>c.ok).length; const r=_v9chadd.apply(this,arguments); try{ const s2=chState(); const after=[...s2.daily,s2.week].filter(c=>c.ok).length; if(after>before) passAdd(s2.week.ok&&!s.week.ok?1500:400,'desafio'); }catch(e){} return r; };
// camuflagem Cinzas: quando ativada, vale para todas as armas (as de nível continuam liberando por cima se o jogador desligar)
const _v9camo=camoFor; camoFor=function(id){ const p=PROG.v9pass; if(p&&p.camo&&p.useCamo) return ASH; return _v9camo(id); };

/* ---------------- prestígio ---------------- */
const PREST_MAX=10;
const prestN=()=>Math.min(PREST_MAX,PROG.v9prest|0);
function prestIcon(n){ return n<=0?'':['','✦','✦✦','✦✦✦','★','★✦','★✦✦','★✦✦✦','★★','★★✦','☠'][n]; }
function prestBonus(S){ const n=prestN(); if(!n||!S||!S.base) return; const add=Math.round(S.base*0.05*n); const a0=accLv(PROG.acc.xp).L; PROG.acc.xp+=add; const a1=accLv(PROG.acc.xp).L;
  for(let L=a0+1;L<=a1;L++){ const r=accReward(L); if(r){ PROG.drax+=r.drax; PROG.acc.xp+=r.xp; } } S.acc1=PROG.acc.xp; try{ saveProg(); }catch(e){} }
function prestCan(){ return accLv(PROG.acc.xp).L>=PG.accMax&&prestN()<PREST_MAX; }
function prestDo(){ if(!prestCan()) return; const n=prestN()+1; PROG.v9prest=n; PROG.acc.xp=0; PROG.drax=(PROG.drax|0)+5000; PROG.rubies=(PROG.rubies|0)+20; try{ saveProg(); renderProfile(); }catch(e){}
  banner('PRESTÍGIO '+n,'O nível da conta voltou para 1. +'+(5*n)+'% de XP para sempre · ◆ 5.000 · ♦ 20','gold'); try{ Snd.ui('unlock'); }catch(e){} }
const _v9rprof=renderProfile; renderProfile=function(){ _v9rprof.apply(this,arguments); try{ const el=$('#pgprof'); if(!el) return; const n=prestN(); const lv=el.querySelector('.pgp-lv');
  if(lv&&n){ lv.classList.add('v9pres'); lv.title='Prestígio '+n; lv.insertAdjacentHTML('beforeend',`<i class="v9pi">${prestIcon(n)}</i>`); }
  const who=el.querySelector('.pgp-who small'); const p=PROG.v9pass; if(who) who.textContent=(n?'Prestígio '+n+' · ':'')+'Nível da conta'+(p&&p.title?' · Cinzento':'');
  if(prestCan()) { const b=v9El('button','ghost v9presb','Prestigiar'); b.type='button'; b.onclick=e=>{ e.stopPropagation(); passOpen(); }; el.appendChild(b); } }catch(e){} };
v9Css(`.pgp-lv.v9pres{position:relative;border-color:#c9a24a!important;color:#ffd24a!important;box-shadow:0 0 12px rgba(255,200,60,.35)}.v9pi{position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);font:normal 10px sans-serif;color:#ffd24a;white-space:nowrap;letter-spacing:-1px}
.v9presb{margin-top:6px;padding:4px 10px;font-size:12px;border-color:#c9a24a;color:#ffd24a}`);

/* ---- painel: Passe + Prestígio ---- */
v9Css(`.v9pass .trk{display:grid;grid-template-columns:repeat(10,1fr);gap:6px}.v9pass .tc{position:relative;border:1px solid #2a241c;padding:6px 4px;min-height:58px;font-size:10px;line-height:1.25;color:#a89c88;background:rgba(255,255,255,.02);text-align:center}
.v9pass .tc b{display:block;font:700 14px "Stardos Stencil",Impact;color:#6a6258}.v9pass .tc.ok{border-color:#5a7a3a;background:rgba(90,200,80,.07);color:#cfe6c0}.v9pass .tc.ok b{color:#9fe080}.v9pass .tc.big{border-color:#c9a24a}.v9pass .tc.cur{outline:2px solid #e0301f}
.v9pass .xpb{height:10px;background:#2a241c;margin:8px 0 4px}.v9pass .xpb i{display:block;height:100%;background:linear-gradient(90deg,#b0201a,#ff7a3a)}.v9pass .row2{display:flex;gap:10px;align-items:center;flex-wrap:wrap}`);
function passOpen(){ const p=passSt(); const t=passTier(p.xp), left=Math.max(0,SEASON.end-Date.now()); const n=prestN(), A=accLv(PROG.acc.xp);
  const cells=[]; for(let i=1;i<=SEASON.tiers;i++){ const r=passReward(i); cells.push(`<div class="tc ${i<=p.got?'ok':''} ${i===p.got+1?'cur':''} ${r.k==='camo'||r.k==='final'?'big':''}"><b>${i}</b>${r.txt}</div>`); }
  const el=v9El('div','v9chp v9pass',`<div class="cb" style="width:min(980px,96vw)"><button class="ghost x" type="button">Fechar</button><h2>${SEASON.name}</h2>
  <p style="margin:0;color:#8a8478;font-size:13px">Termina em ${Math.floor(left/86400000)} dias · ganhe XP do passe jogando partidas, completando desafios e conquistas · prêmios entram sozinhos</p>
  <div class="xpb"><i style="width:${t>=SEASON.tiers?100:((p.xp%SEASON.per)/SEASON.per*100).toFixed(1)}%"></i></div><p style="margin:0 0 10px;font-size:13px;color:#e8e2d4">Nível ${p.got} de ${SEASON.tiers} · ${t>=SEASON.tiers?'passe completo':v9Fmt(p.xp%SEASON.per)+' / '+v9Fmt(SEASON.per)+' XP'}</p>
  <div class="trk">${cells.join('')}</div>
  ${p.camo?`<div class="row2" style="margin-top:10px"><label class="mpchk"><input type="checkbox" id="v9ashc" ${p.useCamo?'checked':''}> Usar a camuflagem Cinzas em todas as armas</label></div>`:''}
  <h3>Prestígio</h3><p style="margin:0 0 8px;font-size:13px;color:#d8cbbb">${n?`Você está no Prestígio ${n} ${prestIcon(n)} · +${5*n}% de XP de conta em toda partida.`:'Chegue ao nível 100 da conta para prestigiar.'} Ao prestigiar, o nível da conta volta para 1 e você ganha ◆ 5.000, ♦ 20, um emblema novo e +5% de XP para sempre (até o Prestígio ${PREST_MAX}). Personagens, armas, skins e itens não são perdidos.</p>
  <div class="row2"><button class="cta small" id="v9presgo" type="button" ${prestCan()?'':'disabled'}>${prestCan()?'Prestigiar agora':n>=PREST_MAX?'Prestígio máximo':'Nível '+A.L+' / '+PG.accMax}</button></div></div>`);
  document.body.appendChild(el); el.onclick=e=>{ if(e.target===el||e.target.classList.contains('x')){ el.remove(); Snd.ui('back'); } };
  const c=el.querySelector('#v9ashc'); if(c) c.onchange=()=>{ p.useCamo=c.checked; try{ saveProg(); setGunModel(); }catch(e){} };
  el.querySelector('#v9presgo').onclick=()=>{ if(!prestCan()) return; if(!el.dataset.sure){ el.dataset.sure=1; el.querySelector('#v9presgo').textContent='Confirmar: voltar ao nível 1'; return; } prestDo(); el.remove(); };
  try{ Snd.ui('tab'); }catch(e){} }
(function(){ const nav=document.querySelector('.mtabs'); if(!nav||document.getElementById('passbtn')) return; const b=v9El('button','mtab'); b.id='passbtn'; b.type='button'; b.textContent='Passe'; nav.insertBefore(b,document.getElementById('chbtn')||document.getElementById('setbtn')); b.addEventListener('click',passOpen); })();

/* ---------------- loadout ---------------- */
const LO_W=[['m1911','Glock 17',1],['python','Blazeson & Julius 357',10],['db','XMA-10 (escopeta curta)',25]];
const LO_P=[['none','Nenhuma',1,''],['folego','Fôlego','5','corrida dura 50% mais'],['bolso','Bolso Extra','15','+1 granada no início e no limite'],['coldre','Coldre Rápido','20','troca de arma 35% mais rápida'],['colete','Colete Leve','35','+15 de vida máxima']];
function loSt(){ return PROG.v9load||(PROG.v9load={w:'m1911',p:'none'}); }
const loLvl=()=>accLv(PROG.acc.xp).L+prestN()*100;   // prestígio mantém tudo liberado
const loPerk=k=>CUR!=='x1'&&CUR!=='sandbox'&&loSt().p===k;
v9On('reset',()=>{ if(CUR==='x1'||CUR==='sandbox') return; const L=loSt(); const w=LO_W.find(x=>x[0]===L.w);
  if(w&&w[0]!=='m1911'&&loLvl()>=w[2]){ Wp.inv=[]; Wp.cur=0; giveWeapon(w[0],0); }
  if(L.p==='bolso'){ G.nades=(G.nades|0)+1; try{ hudNades(); }catch(e){} }
  if(L.p==='colete'){ P.maxHp=maxHp(); P.hp=P.maxHp; } });
const _v9mhp=maxHp; maxHp=function(){ return _v9mhp()+(loPerk('colete')?15:0); };
const _v9swp=abSwap; abSwap=function(){ return _v9swp()*(loPerk('coldre')?1.35:1); };
v9On('always',dt=>{ if(loPerk('folego')&&SPRINT.on) SPRINT.st=Math.min(1,SPRINT.st+dt/6.5/3); if(loPerk('bolso')&&Mod.nadeCap&&!Mod._v9b){ Mod._v9b=1; Mod.nadeCap+=1; } });
const _v9rcm=recomputeMods; recomputeMods=function(){ const r=_v9rcm.apply(this,arguments); try{ Mod._v9b=0; }catch(e){} return r; };
(function(){ const box=document.querySelector('#mappick .mpopts'); if(!box) return; const L=loSt(), lv=loLvl();
  const opt=(arr,cur)=>arr.map(x=>`<option value="${x[0]}" ${lv<+x[2]?'disabled':''} ${cur===x[0]?'selected':''}>${x[1]}${lv<+x[2]?' · Nv '+x[2]:''}</option>`).join('');
  const d=v9El('div','v9lo',`<label>Arma inicial<select id="v9lo-w">${opt(LO_W,L.w)}</select></label><label>Vantagem<select id="v9lo-p">${opt(LO_P,L.p)}</select></label><small id="v9lo-d"></small>`); box.appendChild(d);
  const sw=d.querySelector('#v9lo-w'), sp=d.querySelector('#v9lo-p'), dd=d.querySelector('#v9lo-d'); const desc=()=>{ const p=LO_P.find(x=>x[0]===sp.value); dd.textContent=p&&p[3]?p[3]:''; }; desc();
  sw.onchange=()=>{ loSt().w=sw.value; saveProg(); }; sp.onchange=()=>{ loSt().p=sp.value; saveProg(); desc(); };
  for(const el of d.querySelectorAll('select')) el.addEventListener('keydown',e=>e.stopPropagation());
  d.refresh=()=>{ const lv2=loLvl(); for(const [sel,arr] of [[sw,LO_W],[sp,LO_P]]) for(const o of sel.options){ const x=arr.find(a=>a[0]===o.value); const lock=lv2<+x[2]; o.disabled=lock; o.textContent=x[1]+(lock?' · Nv '+x[2]:''); } const L2=loSt(); sw.value=L2.w; sp.value=L2.p; desc(); }; })();
v9Css(`.v9lo{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;margin-top:8px}.v9lo label{display:flex;flex-direction:column;gap:4px;font-size:12px}.v9lo small{color:#8a8478;font-size:12px}`);
const _v9omp=openMapPick; openMapPick=function(){ const r=_v9omp.apply(this,arguments); try{ const d=document.querySelector('.v9lo'); if(d&&d.refresh) d.refresh(); mpRefresh(); }catch(e){} return r; };

/* ---------------- prévia dos mapas ---------------- */
const MPI={bunker:{d:2,t:'Médio',sec:'Mapa das peças da máquina do tempo, o carro para a cidade e o Mutante Ácido.',f:['Cidade destruída de carro','Máquina do tempo','Chefe: Mutante Ácido']},
  farm:{d:3,t:'Grande',sec:'O laboratório debaixo da mata guarda a melhor arma do mapa.',f:['Dois andares na mansão','Laboratório secreto','Campos abertos']},
  tz:{d:4,t:'Viagem',sec:'Cada parada do ônibus tem algo para pegar. Não fique para trás.',f:['Ônibus em movimento','5 paradas na neblina','Zumbis no teto']},
  hosp:{d:3,t:'Médio',sec:'Ache as peças e vá para 2087: o hospício vira um laboratório de testes.',f:['Viagem para o Laboratório 2087','Celas e necrotério','Chefe do laboratório']},
  x1:{d:0,t:'Arena',sec:'',f:['1 contra 1','Compra de armas','Respawn na base']}};
const MPV=v9El('div','v9mprev'); v9Css(`.v9mprev{margin:10px 0;padding:10px 14px;border:1px solid #3a3022;background:rgba(0,0,0,.45);font-size:13px;color:#d8cbbb;min-height:88px}.v9mprev h4{margin:0 0 4px;font:700 20px "Stardos Stencil",Impact;color:#f4ead2}.v9mprev .st{color:#ffd24a;letter-spacing:2px}.v9mprev ul{margin:6px 0 0;padding-left:18px;columns:2}.v9mprev em{color:#8a8478}
#mappick{animation:v9kb 26s ease-in-out infinite alternate}@keyframes v9kb{0%{background-size:110%;background-position:20% 40%}100%{background-size:128%;background-position:80% 60%}}`);
(function(){ const maps=document.querySelector('#mappick .maps'); if(maps) maps.parentNode.insertBefore(MPV,maps); })();
function mpRefresh(k){ k=k||(document.querySelector('.mapc.on')||{}).dataset?.map||'bunker'; const i=MPI[k]; if(!i){ MPV.hidden=true; return; } MPV.hidden=false; const rec=PROG.v9rec||{}, h=(PROG.v9hist||[]).filter(x=>x.m===k||(k==='hosp'&&x.m==='lab')||(k==='bunker'&&x.m==='city'));
  const nm=k==='x1'?'Arena X1':(MAPS[k]?MAPS[k].name:k);
  MPV.innerHTML=`<h4>${nm}</h4>${i.d?`<span class="st">${'☠'.repeat(i.d)}${'·'.repeat(5-i.d)}</span> · `:''}${i.t} · ${rec[k]?'seu recorde: rodada '+rec[k]:'sem recorde ainda'}${h.length?' · '+h.length+' partida'+(h.length>1?'s':'')+' recente'+(h.length>1?'s':''):''}
  <ul>${i.f.map(f=>`<li>${f}</li>`).join('')}</ul>${i.sec?`<em>Dica: ${i.sec}</em>`:''}`; }
const _v9mth=mapThumb; mapThumb=function(k){ _v9mth(k); try{ mpRefresh(k); }catch(e){} };
for(const b of document.querySelectorAll('.mapc')){ b.addEventListener('mouseenter',()=>mpRefresh(b.dataset.map)); b.addEventListener('focus',()=>mpRefresh(b.dataset.map)); }

/* ---------------- salas públicas ---------------- */
const PUB={on:false,list:[],timer:0};
(function(){ const chk=document.querySelector('#mappick .mpchk'); if(!chk) return; const l=v9El('label','mpchk v9pubc','<input type="checkbox" id="v9pub"> Sala pública · qualquer um pode achar e entrar pela lista'); chk.after(l);
  const on=$('#mp-online'), pub=l.querySelector('input'); pub.checked=localStorage.getItem('db_pub')==='1'; const sync=()=>{ l.style.display=on.checked?'':'none'; }; on.addEventListener('change',sync); sync(); setInterval(sync,800);
  pub.onchange=()=>{ localStorage.setItem('db_pub',pub.checked?'1':'0'); }; })();
const _v9nreq=netRequest; netRequest=function(type,payload){ if(type==='createRoom'){ const c=document.getElementById('v9pub'); payload=Object.assign({},payload||{},{public:!!(c&&c.checked&&$('#mp-online').checked)}); } return _v9nreq.call(this,type,payload); };
const PUBW=v9El('div','v9chp v9pubw',`<div class="cb"><button class="ghost x" type="button">Fechar</button><h2>Salas públicas</h2><p style="margin:0;color:#8a8478;font-size:13px">Salas abertas esperando jogadores. A lista atualiza sozinha.</p><div class="pl"></div><div class="row2" style="margin-top:12px;display:flex;gap:10px"><button class="cta small" id="v9pubnew" type="button">Criar sala pública</button><button class="ghost" id="v9pubref" type="button">Atualizar</button></div></div>`);
PUBW.hidden=true; document.body.appendChild(PUBW);
v9Css(`.v9pubw .pl{margin-top:12px;display:flex;flex-direction:column;gap:6px;min-height:60px}.v9pubw .pr{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:10px 12px;border:1px solid #2a241c;background:rgba(255,255,255,.02)}.v9pubw .pr b{color:#f4ead2}.v9pubw .pr small{color:#8a8478}`);
const DIFN={normal:'Normal',hard:'Difícil',nightmare:'Pesadelo'}, MAPN={bunker:'Dead Bunker',farm:'Fazenda Santa Luzia',tz:'Tranzitch',hosp:'Hospício Vale Negro'};
async function pubLoad(){ const pl=PUBW.querySelector('.pl'); if(!NET.connected){ pl.innerHTML='<p style="color:#ff7a6a">Servidor online indisponível agora.</p>'; return; }
  try{ const r=await netRequest('listRooms'); const rs=(r&&r.rooms)||[]; pl.innerHTML=rs.length?rs.map(x=>`<div class="pr"><div><b>${MAPN[x.map]||x.map}</b> · ${DIFN[x.difficulty]||x.difficulty}<br><small>anfitrião: ${String(x.host||'?').replace(/[<>&]/g,'')} · aberta há ${Math.floor(x.age/60)} min</small></div><span>${x.players}/${x.max}</span><button class="ghost" data-c="${x.code}" type="button">Entrar</button></div>`).join(''):'<p style="color:#8a8478">Nenhuma sala pública aberta agora. Crie uma e espere alguém entrar.</p>';
    for(const b of pl.querySelectorAll('button[data-c]')) b.onclick=()=>{ pubClose(); if(SOC.acc) try{ $('#player-name').value=SOC.acc.name; }catch(e){} joinGame(b.dataset.c); };
  }catch(e){ pl.innerHTML=`<p style="color:#ff7a6a">${/listRooms|Tipo|desconhec/i.test(e.message)?'O servidor ainda não tem a lista de salas (precisa atualizar o servidor).':e.message}</p>`; } }
function pubOpen(){ PUBW.hidden=false; pubLoad(); clearInterval(PUB.timer); PUB.timer=setInterval(()=>{ if(!PUBW.hidden) pubLoad(); },4000); try{ Snd.ui('tab'); }catch(e){} }
function pubClose(){ PUBW.hidden=true; clearInterval(PUB.timer); }
PUBW.onclick=e=>{ if(e.target===PUBW||e.target.classList.contains('x')) pubClose(); };
PUBW.querySelector('#v9pubref').onclick=pubLoad;
PUBW.querySelector('#v9pubnew').onclick=()=>{ pubClose(); localStorage.setItem('db_pub','1'); const c=document.getElementById('v9pub'); if(c) c.checked=true; openMapPick('solo'); const on=$('#mp-online'); if(on&&!on.disabled){ on.checked=true; on.dispatchEvent(new Event('change')); } };
(function(){ const mc=document.querySelector('.mcode'); if(!mc) return; const b=v9El('button','ghost v9pubb','Salas públicas'); b.type='button'; b.onclick=pubOpen; mc.after(b); v9Css(`.v9pubb{width:100%;margin-top:6px}`); })();
CMDS.salas={d:'abre a lista de salas públicas',f:()=>{ pubOpen(); }};

/* ---------------- reconfiguração de teclas ---------------- */
const KB_ACT=[['KeyW','Andar para frente'],['KeyS','Andar para trás'],['KeyA','Andar para a esquerda'],['KeyD','Andar para a direita'],['ShiftLeft','Correr'],['Space','Pular'],['KeyC','Agachar'],
  ['KeyE','Usar · comprar · abrir'],['KeyR','Recarregar'],['KeyQ','Trocar de arma'],['KeyV','Golpe de faca'],['KeyF','Faca · inspecionar'],['KeyG','Granada'],['KeyZ','Habilidade'],['KeyX','Ultimate'],
  ['KeyL','Lanterna'],['KeyH','Largar a arma'],['KeyB','Marcar (ping)'],['KeyN','Frases rápidas'],['KeyY','Chat'],['Tab','Placar']];
const KB_LOCK=new Set(['Escape','Enter','Backquote','Quote','Digit1','Digit2','Digit3','Digit4','F8','F11','F12','MetaLeft','MetaRight']);
const kbName=c=>!c?'—':/^Key[A-Z]$/.test(c)?c.slice(3):/^Digit/.test(c)?c.slice(5):/^Numpad/.test(c)?'Num '+c.slice(6):({Space:'Espaço',ShiftLeft:'Shift',ShiftRight:'Shift dir.',ControlLeft:'Ctrl',ControlRight:'Ctrl dir.',AltLeft:'Alt',AltRight:'Alt Gr',Tab:'Tab',CapsLock:'Caps',Backspace:'Backspace',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Comma:',',Period:'.',Slash:';',Semicolon:'Ç',BracketLeft:'´',BracketRight:'[',Backslash:']',IntlBackslash:'\\',Minus:'-',Equal:'='})[c]||c;
const kbCur=d=>KBIND.map[d]||d;
function kbRender(){ const box=document.getElementById('v9kb'); if(!box) return; box.querySelector('.kl').innerHTML=KB_ACT.map(([d,n])=>`<div class="kr"><span>${n}</span><button type="button" class="ghost ${kbCur(d)!==d?'chg':''}" data-d="${d}">${kbName(kbCur(d))}</button></div>`).join('');
  for(const b of box.querySelectorAll('button[data-d]')) b.onclick=()=>kbCapture(b); }
function kbCapture(btn){ if(KBIND.cap) return; KBIND.cap=true; btn.textContent='aperte uma tecla…'; btn.classList.add('wait');
  const done=()=>{ KBIND.cap=false; removeEventListener('keydown',on,true); kbRender(); };
  const on=e=>{ e.preventDefault(); e.stopImmediatePropagation(); if(e.code==='Escape'){ done(); return; } if(KB_LOCK.has(e.code)){ btn.textContent='tecla reservada'; setTimeout(done,700); return; }
    const d=btn.dataset.d, old=kbCur(d); const other=KB_ACT.find(([d2])=>d2!==d&&kbCur(d2)===e.code);
    KBIND.map[d]=e.code; if(other) KBIND.map[other[0]]=old;   // troca com a ação que usava essa tecla
    for(const k in KBIND.map) if(KBIND.map[k]===k) delete KBIND.map[k]; KBIND.save(); try{ Snd.ui('confirm'); }catch(_){} done(); };
  addEventListener('keydown',on,true); }
(function(){ const p=document.querySelector('.setp[data-st="ctrl"]'); if(!p) return; const dl=p.querySelector('#keys'); if(dl) dl.hidden=true;
  const box=v9El('div','v9kb',`<h4>Teclas</h4><p>Clique numa ação e aperte a nova tecla (Esc cancela). Se a tecla já estiver em uso, as duas ações trocam. Ctrl continua agachando e 1 a 4 continuam trocando de arma.</p><div class="kl"></div><button type="button" class="ghost" id="v9kbreset">Restaurar padrão</button>`); box.id='v9kb'; p.appendChild(box);
  box.querySelector('#v9kbreset').onclick=()=>{ KBIND.map={}; KBIND.save(); kbRender(); }; kbRender(); })();
v9Css(`.v9kb{margin-top:14px}.v9kb h4{margin:0 0 4px;font:12px "Special Elite",monospace;letter-spacing:.2em;text-transform:uppercase;color:#ff5a4a}.v9kb p{margin:0 0 8px;font-size:12px;color:#8a8478}
.v9kb .kl{display:grid;grid-template-columns:1fr 1fr;gap:4px 16px}.v9kb .kr{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:13px;padding:2px 0;border-bottom:1px solid #1e1a15}
.v9kb .kr button{min-width:92px;padding:3px 8px;font-size:12px}.v9kb .kr button.chg{border-color:#c9a24a;color:#ffd24a}.v9kb .kr button.wait{border-color:#e0301f;color:#ff7a6a}#v9kbreset{margin-top:10px}`);

/* ---------------- console ---------------- */
CMDS.passe={cheat:1,d:'passe [xp] · soma XP do passe (sem número: abre o painel)',f:a=>{ if(!a[0]){ passOpen(); return; } PASSDBG.on=true; passAdd(+a[0]||1000); PASSDBG.on=false; const p=passSt(); cprint('Passe nível '+p.got+' ('+p.xp+' XP)'); }};
CMDS.prestigio={cheat:1,d:'prestigio [n] · define o prestígio (0 a 10)',f:a=>{ PROG.v9prest=clamp(+a[0]|0,0,PREST_MAX); saveProg(); renderProfile(); cprint('Prestígio '+prestN()); }};
CMDS.loadout={d:'loadout · mostra arma inicial e vantagem escolhidas',f:()=>{ const L=loSt(); cprint('Arma inicial: '+L.w+' · vantagem: '+L.p+' · nível para liberar: '+loLvl()); }};
CMDS.teclas={d:'teclas · lista as teclas remapeadas · teclas reset volta ao padrão',f:a=>{ if(a[0]==='reset'){ KBIND.map={}; KBIND.save(); kbRender(); cprint('Teclas no padrão.'); return; } const m=Object.entries(KBIND.map); cprint(m.length?m.map(([d,p])=>kbName(d)+' → '+kbName(p)).join(' · '):'Nenhuma tecla remapeada.'); }};
