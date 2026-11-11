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
function passAdd(xp,why){ if(CHEAT.on&&!PASSDBG.on) return; const p=passSt(); if(Date.now()>SEASON.end) return; const t0=passTier(p.xp); p.xp=(p.xp|0)+Math.max(0,Math.round(xp)); const t1=passTier(p.xp);
  try{ saveProg(); }catch(e){} if(t1>t0) toast('Passe de temporada: nível '+t1+'! Resgate as recompensas no menu, em Passe.'); try{ v9Pins(); }catch(e){} }
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
  if(prestCan()) { const b=v9El('button','ghost v9presb','Prestigiar'); b.type='button'; b.onclick=e=>{ e.stopPropagation(); passOpen(); prestPanel(); }; el.appendChild(b); } }catch(e){} };
v9Css(`.pgp-lv.v9pres{position:relative;border-color:#c9a24a!important;color:#ffd24a!important;box-shadow:0 0 12px rgba(255,200,60,.35)}.v9pi{position:absolute;bottom:-9px;left:50%;transform:translateX(-50%);font:normal 10px sans-serif;color:#ffd24a;white-space:nowrap;letter-spacing:-1px}
.v9presb{margin-top:6px;padding:4px 10px;font-size:12px;border-color:#c9a24a;color:#ffd24a}`);

/* ---- painel do passe (estilo passe de batalha: recompensa grande em cima, trilha embaixo) ---- */
const BPRAR={c:['COMUM','#8f969e'],r:['RARO','#3f8fe0'],e:['ÉPICO','#a050f0'],l:['LENDÁRIO','#f0a030'],m:['MÍTICO','#ff3a2a']};
function passMeta(t){ const r=passReward(t);
  if(r.k==='drax') return {r, rar:r.drax>=700?'r':'c', type:'MOEDA', name:'◆ '+v9Fmt(r.drax)+' drax', desc:'Drax para gastar em personagens, caixas e na vitrine.'};
  if(r.k==='ruby') return {r, rar:r.ruby>=10?'e':'r', type:'GEMA', name:'♦ '+r.ruby+' rubis', desc:'Rubis: a moeda rara, usada nos itens especiais.'};
  if(r.k==='box'){ const b=BOX_BY[r.box]||{}; return {r, rar:r.box==='sombra'?'l':r.box==='bunker'?'e':'r', type:'CAIXA', name:b.name||'Caixa', desc:b.desc||'Abra no Arsenal.', col:b.col}; }
  if(r.k==='camo') return {r, rar:'l', type:'CAMUFLAGEM', name:'Cinzas', desc:'Brasa por baixo da fuligem. Vale para todas as armas e pode ser ligada e desligada aqui no passe.'};
  return {r, rar:'m', type:'TÍTULO + CAIXA', name:'Cinzento', desc:'Título exclusivo da Temporada 1, uma Caixa Oculta e ◆ 5.000.', col:(BOX_BY.oculta||{}).col}; }
const GUN_SVG=`<svg viewBox="0 0 220 80" class="pvgun"><defs><pattern id="ashp" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#2c2824"/><circle cx="3" cy="4" r="2.2" fill="#ff5a14" opacity=".75"/><circle cx="10" cy="10" r="1.4" fill="#ffae3a" opacity=".6"/><path d="M0 9 L6 7 L14 11" stroke="#141210" stroke-width="2" fill="none"/></pattern></defs><path d="M6 30 L120 26 L128 20 L150 20 L156 26 L212 26 L212 34 L160 36 L150 44 L120 44 L112 70 L92 70 L98 44 L60 44 L44 56 L10 56 L18 40 L6 38 Z" fill="url(#ashp)" stroke="#0a0806" stroke-width="2"/></svg>`;
function passVis(m,big){ const k=m.r.k, c=m.col||BPRAR[m.rar][1];
  if(k==='drax') return `<div class="pv-gem" style="--g:#c9b7ff">◆${big?`<span>${v9Fmt(m.r.drax)}</span>`:''}</div>`;
  if(k==='ruby') return `<div class="pv-gem" style="--g:#ff4a5a">♦${big?`<span>${m.r.ruby}</span>`:''}</div>`;
  if(k==='camo') return `<div class="pv-camo">${GUN_SVG}</div>`;
  const cube=`<div class="pv-cube"><div class="cb3" style="--c:${c}">${['f','b','l','r','t','d'].map(s=>`<i class="${s}"></i>`).join('')}</div></div>`;
  if(k==='final') return `<div class="pv-final">${cube}<b>CINZENTO</b></div>`;
  return cube; }
v9Css(`.v9bp{position:fixed;inset:0;z-index:45;display:flex;flex-direction:column;background:radial-gradient(ellipse at 50% 38%,#3a1210 0%,#1a0a08 45%,#070504 100%);color:#f4ead2;font-family:"Special Elite",monospace;overflow:hidden}
.v9bp:before{content:"";position:absolute;inset:0;background:url(img/tex/stain_01.png) center/cover;opacity:.12;pointer-events:none}
.v9bp .top{position:relative;flex:1;display:grid;grid-template-columns:minmax(260px,1fr) minmax(300px,1.3fr) minmax(240px,1fr);gap:20px;padding:26px 34px 0;min-height:0}
.v9bp .info .rar{display:inline-block;padding:2px 10px;font-size:12px;letter-spacing:.15em;color:#fff;background:var(--rc)}.v9bp .info .ty{margin-left:8px;font-size:13px;letter-spacing:.2em;color:#c8bba6}
.v9bp .info h2{margin:10px 0 6px;font:700 clamp(32px,4.4vw,56px)/1 "Stardos Stencil",Impact;letter-spacing:.02em;text-transform:uppercase}.v9bp .info p{margin:0;color:#c8bba6;font-size:14px;max-width:360px}
.v9bp .info .sea{margin-top:22px;font-size:12px;letter-spacing:.2em;color:#ff5a4a;text-transform:uppercase}
.v9bp .stage{position:relative;display:flex;align-items:center;justify-content:center;perspective:900px}
.v9bp .stage:after{content:"";position:absolute;bottom:8%;left:50%;width:62%;height:16%;transform:translateX(-50%);background:radial-gradient(ellipse,var(--rc) 0%,transparent 70%);opacity:.45;filter:blur(6px)}
.v9bp .side{display:flex;flex-direction:column;align-items:flex-end;gap:10px}.v9bp .lvl{display:flex;align-items:center;gap:10px;font:700 22px "Stardos Stencil",Impact}.v9bp .lvl small{font:12px "Special Elite",monospace;color:#c8bba6}
.v9bp .xpb{width:260px;height:8px;background:#2a1a14}.v9bp .xpb i{display:block;height:100%;background:linear-gradient(90deg,#b0201a,#ff8a3a)}
.v9bp .pill{padding:6px 16px;font-size:13px;letter-spacing:.1em;text-transform:uppercase;border:1px solid}.v9bp .pill.ok{background:#2f7a2a;border-color:#5fd04a}.v9bp .pill.go{background:#7a5010;border-color:#ffc04a;animation:v9pend 1.4s infinite}.v9bp .pill.lock{background:#2a2420;border-color:#5a5048;color:#a89c88}
.v9bp .bot{position:relative;padding:12px 34px 18px;background:linear-gradient(0deg,rgba(0,0,0,.75),rgba(0,0,0,0))}
.v9bp .strip{display:flex;gap:10px;align-items:flex-end}.v9bp .tile{position:relative;flex:1;height:120px;border:2px solid rgba(255,255,255,.12);background:linear-gradient(160deg,var(--rc),#120806 85%);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,border-color .15s;overflow:hidden}
.v9bp .tile:hover{transform:translateY(-4px)}.v9bp .tile.sel{height:150px;border-color:#fff;box-shadow:0 0 22px rgba(255,255,255,.25)}
.v9bp .tile .n{position:absolute;left:0;right:0;bottom:0;padding:3px 6px;background:rgba(0,0,0,.7);font-size:12px;display:flex;justify-content:space-between}.v9bp .tile.got .n{background:#2f7a2a}.v9bp .tile.can .n{background:#8a5a10}
.v9bp .tile.lock>*:not(.n){opacity:.35;filter:grayscale(.7)}.v9bp .tile .pv-gem{font-size:46px}.v9bp .tile .pv-cube{transform:scale(.45)}.v9bp .tile .pv-camo svg{width:110px}.v9bp .tile .pv-final{transform:scale(.5)}
.v9bp .nav{display:flex;align-items:center;justify-content:space-between;margin-top:12px;gap:12px}.v9bp .nav .pg{display:flex;align-items:center;gap:12px;font-size:14px;letter-spacing:.1em;white-space:nowrap}.v9bp .nav .pg button{min-width:44px;font-size:18px;padding:4px 12px}
.v9bp .nav button{padding:8px 16px}.v9bp .hint{position:absolute;top:-34px;left:34px;font-size:12px;color:#c8bba6;background:rgba(0,0,0,.6);padding:5px 10px;border:1px solid #3a3022}
.pv-gem{position:relative;font-size:clamp(150px,22vw,260px);line-height:1;color:var(--g);text-shadow:0 0 40px var(--g),0 0 90px var(--g);animation:pvfl 3.4s ease-in-out infinite}.pv-gem span{position:absolute;left:50%;bottom:-.1em;transform:translateX(-50%);font:700 .16em "Stardos Stencil",Impact;color:#fff;text-shadow:0 2px 8px #000;white-space:nowrap}
@keyframes pvfl{50%{transform:translateY(-14px) rotate(4deg)}}
.pv-cube{width:180px;height:180px;perspective:700px}.cb3{position:relative;width:100%;height:100%;transform-style:preserve-3d;animation:pvsp 9s linear infinite}@keyframes pvsp{from{transform:rotateX(-18deg) rotateY(0)}to{transform:rotateX(-18deg) rotateY(360deg)}}
.cb3 i{position:absolute;inset:0;background:linear-gradient(135deg,color-mix(in srgb,var(--c) 85%,#fff),var(--c) 45%,color-mix(in srgb,var(--c) 45%,#000));border:3px solid rgba(0,0,0,.55);box-shadow:inset 0 0 0 14px rgba(0,0,0,.18)}
.cb3 i:after{content:"";position:absolute;left:0;right:0;top:44%;height:12%;background:rgba(0,0,0,.45)}
.cb3 .f{transform:translateZ(90px)}.cb3 .b{transform:rotateY(180deg) translateZ(90px)}.cb3 .l{transform:rotateY(-90deg) translateZ(90px)}.cb3 .r{transform:rotateY(90deg) translateZ(90px)}.cb3 .t{transform:rotateX(90deg) translateZ(90px)}.cb3 .d{transform:rotateX(-90deg) translateZ(90px)}
.pv-camo svg{width:min(460px,34vw);filter:drop-shadow(0 0 26px rgba(255,90,20,.55));animation:pvfl 3.6s ease-in-out infinite}
.pv-final{display:flex;flex-direction:column;align-items:center;gap:26px}.pv-final b{font:700 46px "Stardos Stencil",Impact;letter-spacing:.12em;color:#ff5a3a;text-shadow:0 0 20px #ff3a1a;padding:4px 26px;border-top:2px solid #ff5a3a;border-bottom:2px solid #ff5a3a}
.v9prm{position:absolute;right:34px;top:150px;width:min(380px,90vw);background:#0f0a08;border:1px solid #c9a24a;padding:14px 16px;z-index:2;font-size:13px;color:#d8cbbb}`);
const BP={page:0,sel:1,el:null};
function passUnclaimed(){ const p=passSt(); return Math.max(0,passTier(p.xp)-p.got); }
function passClaim(upTo){ const p=passSt(); const top=Math.min(passTier(p.xp),upTo||SEASON.tiers); const got=[];
  while(p.got<top){ p.got++; const r=passReward(p.got); got.push(r.txt);
    if(r.drax) PROG.drax=(PROG.drax|0)+r.drax; if(r.ruby) PROG.rubies=(PROG.rubies|0)+r.ruby; if(r.box) try{ giveBox(r.box); }catch(e){}
    if(r.k==='camo'){ p.camo=true; p.useCamo=true; } if(r.k==='final') p.title=true; }
  if(got.length){ try{ saveProg(); renderDrax(); renderProfile(); Snd.sample('reward_pop',{vol:0.9,prio:true}); }catch(e){} toast('Resgatado: '+got.join(' · ')); }
  try{ v9Pins(); }catch(e){} return got.length; }
function passRender(){ const el=BP.el; if(!el) return; const p=passSt(), un=passTier(p.xp), t=BP.sel, m=passMeta(t); const rc=BPRAR[m.rar][1];
  el.style.setProperty('--rc',rc); const st=t<=p.got?'ok':t<=un?'go':'lock';
  el.querySelector('.info').innerHTML=`<span class="rar" style="--rc:${rc}">${BPRAR[m.rar][0]}</span><span class="ty">${m.type}</span><h2>${m.name}</h2><p>${m.desc}</p><div class="sea">${SEASON.name} · nível ${t}</div>`;
  el.querySelector('.stage').innerHTML=passVis(m,true);
  const n=prestN(); el.querySelector('.side').innerHTML=`<div class="lvl">${n?`<span title="Prestígio ${n}" style="color:#ffd24a">${prestIcon(n)}</span>`:''}NV ${p.got} <small>de ${SEASON.tiers}</small></div>
   <div class="xpb"><i style="width:${un>=SEASON.tiers?100:((p.xp%SEASON.per)/SEASON.per*100).toFixed(1)}%"></i></div><small style="color:#c8bba6">${un>=SEASON.tiers?'passe completo':v9Fmt(p.xp%SEASON.per)+' / '+v9Fmt(SEASON.per)+' XP para o próximo nível'}</small>
   <div class="pill ${st}">${st==='ok'?'✓ Resgatado':st==='go'?'Pronto para resgatar':'Bloqueado · nível '+t}</div>
   ${st==='go'?`<button class="cta small" data-a="claim" type="button">Resgatar até o nível ${t}</button>`:''}
   ${m.r.k==='camo'&&p.camo?`<button class="ghost" data-a="camo" type="button">${p.useCamo?'Desequipar camuflagem':'Equipar camuflagem'}</button>`:''}
   <button class="ghost" data-a="prest" type="button">Prestígio${n?' '+n:''}</button><small style="color:#8a8478">Termina em ${Math.floor(Math.max(0,SEASON.end-Date.now())/86400000)} dias</small>`;
  const per=10, pages=Math.ceil(SEASON.tiers/per), a=BP.page*per;
  el.querySelector('.strip').innerHTML=Array.from({length:per},(_,i)=>a+i+1).filter(i=>i<=SEASON.tiers).map(i=>{ const mm=passMeta(i); const s=i<=p.got?'got':i<=un?'can':'lock';
    return `<div class="tile ${s} ${i===t?'sel':''}" data-t="${i}" style="--rc:${BPRAR[mm.rar][1]}">${passVis(mm,false)}<div class="n"><span>${i}</span><span>${s==='got'?'✓':s==='can'?'!':'🔒'}</span></div></div>`; }).join('');
  el.querySelector('.pgn').textContent=`PÁGINA ${BP.page+1} / ${pages}`; const unc=passUnclaimed(); const ca=el.querySelector('[data-a=all]'); ca.disabled=!unc; ca.textContent=unc?`Resgatar tudo (${unc})`:'Nada para resgatar'; }
function passOpen(){ if(BP.el) BP.el.remove(); const p=passSt(); BP.sel=Math.min(SEASON.tiers,Math.max(1,p.got<passTier(p.xp)?p.got+1:p.got+1)); BP.page=Math.floor((BP.sel-1)/10);
  const el=v9El('div','v9bp',`<div class="top"><div class="info"></div><div class="stage"></div><div class="side"></div></div><div class="bot"><div class="hint">Jogue partidas, complete desafios e conquistas para subir de nível. Clique numa recompensa para ver.</div><div class="strip"></div>
   <div class="nav"><div class="pg"><button class="ghost" data-a="prev" type="button">‹</button><span class="pgn"></span><button class="ghost" data-a="next" type="button">›</button></div><div style="display:flex;gap:10px"><button class="cta small" data-a="all" type="button"></button><button class="ghost" data-a="close" type="button">Fechar</button></div></div></div>`);
  BP.el=el; document.body.appendChild(el); passRender();
  el.addEventListener('click',e=>{ const tl=e.target.closest('.tile'); if(tl){ BP.sel=+tl.dataset.t; passRender(); try{ Snd.ui('tab'); }catch(_){} return; }
    const b=e.target.closest('[data-a]'); if(!b) return; const a=b.dataset.a, pages=Math.ceil(SEASON.tiers/10);
    if(a==='close'){ el.remove(); BP.el=null; try{ Snd.ui('back'); }catch(_){} return; }
    if(a==='prev'||a==='next'){ BP.page=(BP.page+(a==='next'?1:pages-1))%pages; BP.sel=BP.page*10+1; passRender(); return; }
    if(a==='claim'){ passClaim(BP.sel); passRender(); return; } if(a==='all'){ passClaim(); passRender(); return; }
    if(a==='camo'){ const p2=passSt(); p2.useCamo=!p2.useCamo; try{ saveProg(); setGunModel(); }catch(_){} passRender(); return; }
    if(a==='prest') prestPanel(); });
  addEventListener('keydown',function k(e){ if(!BP.el){ removeEventListener('keydown',k,true); return; } if(e.code==='Escape'){ e.stopImmediatePropagation(); BP.el.remove(); BP.el=null; removeEventListener('keydown',k,true); } if(e.code==='ArrowRight'||e.code==='ArrowLeft'){ BP.sel=clamp(BP.sel+(e.code==='ArrowRight'?1:-1),1,SEASON.tiers); BP.page=Math.floor((BP.sel-1)/10); passRender(); } },true);
  try{ Snd.ui('tab'); }catch(e){} }
function prestPanel(){ const old=BP.el&&BP.el.querySelector('.v9prm'); if(old){ old.remove(); return; } const n=prestN(), A=accLv(PROG.acc.xp);
  const d=v9El('div','v9prm',`<b style="font:700 22px 'Stardos Stencil',Impact;color:#ffd24a">Prestígio ${n||''} ${prestIcon(n)}</b><p>${n?`+${5*n}% de XP de conta em toda partida.`:'Chegue ao nível 100 da conta para prestigiar.'} Ao prestigiar, o nível da conta volta para 1 e você ganha ◆ 5.000, ♦ 20, um emblema novo e +5% de XP para sempre (até o Prestígio ${PREST_MAX}). Personagens, armas, skins e itens continuam seus.</p>
   <button class="cta small" type="button" ${prestCan()?'':'disabled'}>${prestCan()?'Prestigiar agora':n>=PREST_MAX?'Prestígio máximo':'Conta nível '+A.L+' / '+PG.accMax}</button>`);
  BP.el.appendChild(d); const b=d.querySelector('button'); b.onclick=()=>{ if(!prestCan()) return; if(!d.dataset.sure){ d.dataset.sure=1; b.textContent='Confirmar: voltar ao nível 1'; return; } prestDo(); d.remove(); passRender(); }; }
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
const _v9omp=openMapPick; openMapPick=function(){ const r=_v9omp.apply(this,arguments); try{ const d=document.querySelector('.v9lo'); if(d&&d.refresh) d.refresh(); mpSelect(MAPS[CUR]&&CUR!=='x1'&&CUR!=='sandbox'&&MPI[CUR]?CUR:'bunker'); }catch(e){} return r; };

/* ---------------- escolha de mapa interativa: vitrine grande do mapa + fileira de cartões com foto ---------------- */
const MPI={bunker:{d:2,t:'Médio',img:'img/map_bunker.jpg',sec:'Junte as peças da máquina do tempo, conserte o carro para a cidade e enfrente o Mutante Ácido.',f:['Cidade destruída de carro','Máquina do tempo','Chefe: Mutante Ácido'],s:[3,4,5]},
  farm:{d:3,t:'Grande',img:'img/map_farm.jpg',sec:'O laboratório debaixo da mata guarda a melhor arma do mapa.',f:['Mansão de dois andares','Laboratório secreto','Campos abertos'],s:[5,3,4]},
  tz:{d:4,t:'Viagem',img:'img/map_tz.jpg',sec:'Cada parada do ônibus tem algo para pegar. Não fique para trás.',f:['Ônibus em movimento','5 paradas na neblina','Zumbis no teto'],s:[4,5,3]},
  hosp:{d:3,t:'Médio',img:'img/map_hosp.jpg',sec:'Ache as peças e vá para 2087: o hospício vira um laboratório de testes.',f:['Laboratório 2087','Celas e necrotério','Chefe do laboratório'],s:[3,4,5]},
  x1:{d:0,t:'Arena',img:'',sec:'Sem zumbis: rodadas de compra, 7 segundos de preparação e respawn na base.',f:['1 contra 1','Compra de armas','Online'],s:[1,5,1]}};
const MPS={sel:'bunker'};
v9Css(`#mappick .dossier{max-width:min(1320px,96vw);display:grid;grid-template-columns:1.5fr 1fr;grid-template-areas:"file file" "h2 h2" "hero opts" "maps maps" "row row";gap:4px 22px}
#mappick .dossier>.file{grid-area:file}#mappick .dossier>h2{grid-area:h2;margin-bottom:6px}#mappick .mpopts{grid-area:opts;align-self:start}#mappick .maps{grid-area:maps}#mappick .dossier>.row{grid-area:row}
.v9hero{grid-area:hero;position:relative;height:clamp(260px,40vh,420px);overflow:hidden;border:1px solid #3a3022;background:#0a0706;cursor:pointer}
.v9hero .bg{position:absolute;inset:-6%;background:center/cover no-repeat;transition:transform .25s ease-out,opacity .35s;animation:v9kb2 18s ease-in-out infinite alternate}
@keyframes v9kb2{from{scale:1}to{scale:1.1}}
.v9hero:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(6,4,3,.95) 0%,rgba(6,4,3,.4) 45%,rgba(6,4,3,.1) 100%),linear-gradient(90deg,rgba(6,4,3,.7),transparent 60%)}
.v9hero .ct{position:absolute;left:22px;right:22px;bottom:18px;z-index:2}.v9hero h3{margin:0;font:700 clamp(34px,4.4vw,58px)/1 "Stardos Stencil",Impact;color:#f4ead2;text-shadow:0 3px 14px #000}
.v9hero .meta{margin:6px 0;font-size:13px;color:#d8cbbb;letter-spacing:.06em}.v9hero .meta .sk{color:#ff5a3a;letter-spacing:3px}
.v9hero .ds{margin:0 0 8px;font-size:14px;color:#c8bba6;max-width:640px}.v9hero .chips{display:flex;gap:6px;flex-wrap:wrap}.v9hero .chips span{padding:3px 9px;font-size:12px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.5)}
.v9hero .bars{position:absolute;right:22px;top:18px;z-index:2;width:190px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#c8bba6}.v9hero .bars div{margin-bottom:7px}.v9hero .bars i{display:block;height:5px;margin-top:3px;background:#2a1a14}.v9hero .bars i b{display:block;height:100%;background:linear-gradient(90deg,#b0201a,#ff8a3a);transition:width .4s}
.v9hero .go{position:absolute;right:22px;bottom:18px;z-index:3;padding:12px 30px;font-size:18px}.v9hero .rec{color:#ffd24a}
.v9hero.x1 .bg{background:radial-gradient(circle at 30% 30%,#5a3a10,#120a04 70%)!important}
#mappick .maps{display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:10px;margin-top:12px}
#mappick .mapc{position:relative;height:150px;padding:0!important;overflow:hidden;justify-content:flex-end;transform-style:preserve-3d;transition:transform .2s ease-out,border-color .15s,box-shadow .2s;background:#0a0706 center/cover no-repeat}
#mappick .mapc:before{content:"";position:absolute;inset:0;background:var(--img) center/cover no-repeat;transition:transform .4s;filter:saturate(.85)}#mappick .mapc:hover:before{transform:scale(1.08)}
#mappick .mapc:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(0,0,0,.9),rgba(0,0,0,.05) 70%)}
#mappick .mapc .mt{position:relative;z-index:2;padding:0 12px 10px;font-size:20px!important;line-height:1.05}#mappick .mapc .md{display:none}
#mappick .mapc.on{border-color:#ff5a3a;box-shadow:0 0 0 1px #ff5a3a,0 10px 30px rgba(224,48,31,.35)}#mappick .mapc .rb{position:absolute;z-index:2;top:8px;right:8px;padding:2px 7px;font-size:11px;background:rgba(0,0,0,.7);color:#ffd24a}
#mappick .mapc.x1card:before{background:radial-gradient(circle at 30% 30%,#5a3a10,#120a04 70%)}
.v9hint{grid-area:row;justify-self:end;align-self:center;font-size:12px;color:#8a8478}
@media (max-width:860px){#mappick .dossier{grid-template-columns:1fr;grid-template-areas:"file" "h2" "hero" "opts" "maps" "row"}#mappick .maps{grid-template-columns:repeat(3,1fr)!important}}`);
const HERO=v9El('div','v9hero',`<div class="bg"></div><div class="bars"></div><div class="ct"><h3></h3><div class="meta"></div><p class="ds"></p><div class="chips"></div></div><button class="cta go" type="button" data-snd="confirm">Jogar</button>`);
(function(){ const d=document.querySelector('#mappick .dossier'); if(!d) return; d.insertBefore(HERO,d.querySelector('.mpopts'));
  for(const b of document.querySelectorAll('#mappick .mapc')){ const i=MPI[b.dataset.map]; if(i&&i.img) b.style.setProperty('--img',`url(${i.img})`); }
  const maps=d.querySelector('.maps');
  // clique seleciona (mostra a vitrine); clique duplo ou o botão Jogar entra no mapa
  maps.addEventListener('click',e=>{ const b=e.target.closest('.mapc'); if(!b||e.detail===0) return; e.stopPropagation(); e.preventDefault(); if(e.detail===1) mpSelect(b.dataset.map,true); },true);   /* Enter no teclado (detail 0) continua entrando direto */
  maps.addEventListener('dblclick',e=>{ const b=e.target.closest('.mapc'); if(b) mpPlay(b.dataset.map); });
  maps.addEventListener('mousemove',e=>{ const b=e.target.closest('.mapc'); if(!b) return; const r=b.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5; b.style.transform=`perspective(600px) rotateY(${x*14}deg) rotateX(${-y*12}deg) translateY(-4px)`; });
  maps.addEventListener('mouseout',e=>{ const b=e.target.closest('.mapc'); if(b&&!b.contains(e.relatedTarget)) b.style.transform=''; });
  HERO.addEventListener('mousemove',e=>{ const r=HERO.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5; HERO.querySelector('.bg').style.transform=`translate(${-x*24}px,${-y*16}px)`; });
  HERO.addEventListener('mouseleave',()=>{ HERO.querySelector('.bg').style.transform=''; });
  HERO.querySelector('.go').addEventListener('click',e=>{ e.stopPropagation(); mpPlay(MPS.sel); });
  const h=v9El('div','v9hint','clique para ver · clique duplo ou Jogar para entrar'); d.insertBefore(h,d.querySelector('.row')); })();
function mpPlay(k){ try{ playChoice(k); }catch(e){ console.warn('[v9] mapa',e); } }
function mpSelect(k,snd){ MPS.sel=k; for(const b of document.querySelectorAll('#mappick .mapc')) b.classList.toggle('on',b.dataset.map===k); if(k!=='x1') try{ _v9mth(k); }catch(e){} mpRefresh(k); if(snd) try{ Snd.ui('tab'); }catch(e){} }
function mpRefresh(k){ k=k||MPS.sel; const i=MPI[k]; if(!i) return; const rec=PROG.v9rec||{}, h=(PROG.v9hist||[]).filter(x=>x.m===k||(k==='hosp'&&x.m==='lab')||(k==='bunker'&&x.m==='city'));
  const card=document.querySelector(`#mappick .mapc[data-map="${k}"]`); const nm=card?card.querySelector('.mt').textContent:k; const ds=card&&card.querySelector('.md')?card.querySelector('.md').textContent:'';
  HERO.classList.toggle('x1',k==='x1'); const bg=HERO.querySelector('.bg'); bg.style.backgroundImage=i.img?`url(${i.img})`:''; bg.style.opacity=0; requestAnimationFrame(()=>{ bg.style.opacity=1; });
  HERO.querySelector('h3').textContent=nm; HERO.querySelector('.ds').textContent=ds;
  HERO.querySelector('.meta').innerHTML=`${i.d?`<span class="sk">${'☠'.repeat(i.d)}${'·'.repeat(5-i.d)}</span> · `:''}${i.t} · ${rec[k]?`<span class="rec">recorde: rodada ${rec[k]}</span>`:'sem recorde ainda'}${h.length?' · '+h.length+' partida'+(h.length>1?'s':'')+' recente'+(h.length>1?'s':''):''}`;
  HERO.querySelector('.chips').innerHTML=i.f.map(f=>`<span>${f}</span>`).join('')+(i.sec?`<span style="border-color:#c9a24a;color:#ffd24a">Dica: ${i.sec}</span>`:'');
  HERO.querySelector('.bars').innerHTML=[['Tamanho',i.s[0]],['Ação',i.s[1]],['Segredos',i.s[2]]].map(([n,v])=>`<div>${n}<i><b style="width:${v*20}%"></b></i></div>`).join('');
  for(const b of document.querySelectorAll('#mappick .mapc')){ const r=rec[b.dataset.map]; let e=b.querySelector('.rb'); if(r){ if(!e){ e=v9El('span','rb'); b.appendChild(e); } e.textContent='R'+r; } else if(e) e.remove(); } }
const _v9mth=mapThumb; mapThumb=function(k){ _v9mth(k); };   // a foto de fundo do mapa continua; a vitrine é atualizada por mpSelect
for(const b of document.querySelectorAll('#mappick .mapc')){ b.addEventListener('mouseenter',()=>{ if(!MPS.lock) mpRefresh(b.dataset.map); }); b.addEventListener('mouseleave',()=>{ mpRefresh(MPS.sel); }); b.addEventListener('focus',()=>mpSelect(b.dataset.map)); }

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
CMDS.passe={cheat:1,d:'passe [xp] · soma XP do passe (sem número: abre o painel)',f:a=>{ if(!a[0]){ passOpen(); return; } PASSDBG.on=true; passAdd(+a[0]||1000); PASSDBG.on=false; const p=passSt(); cprint('Passe: nível liberado '+passTier(p.xp)+' · resgatados '+p.got+' ('+p.xp+' XP)'); }};
CMDS.prestigio={cheat:1,d:'prestigio [n] · define o prestígio (0 a 10)',f:a=>{ PROG.v9prest=clamp(+a[0]|0,0,PREST_MAX); saveProg(); renderProfile(); cprint('Prestígio '+prestN()); }};
CMDS.loadout={d:'loadout · mostra arma inicial e vantagem escolhidas',f:()=>{ const L=loSt(); cprint('Arma inicial: '+L.w+' · vantagem: '+L.p+' · nível para liberar: '+loLvl()); }};
CMDS.teclas={d:'teclas · lista as teclas remapeadas · teclas reset volta ao padrão',f:a=>{ if(a[0]==='reset'){ KBIND.map={}; KBIND.save(); kbRender(); cprint('Teclas no padrão.'); return; } const m=Object.entries(KBIND.map); cprint(m.length?m.map(([d,p])=>kbName(d)+' → '+kbName(p)).join(' · '):'Nenhuma tecla remapeada.'); }};

/* ---------------- avisos (pins) no menu: desafios e passe com recompensa para receber ---------------- */
v9Css(`.v9pin{position:absolute;top:2px;right:2px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#e0301f;color:#fff;font:700 11px/18px sans-serif;text-align:center;box-shadow:0 0 0 2px #0b0806,0 0 10px rgba(224,48,31,.8);animation:v9pinp 1.6s ease-in-out infinite;pointer-events:none}@keyframes v9pinp{50%{transform:scale(1.15)}}
#chbtn,#passbtn{position:relative}`);
function v9Pins(){ const set=(id,n)=>{ const b=document.getElementById(id); if(!b) return; let p=b.querySelector('.v9pin'); if(n>0){ if(!p){ p=v9El('span','v9pin'); b.appendChild(p); } p.textContent=n>9?'9+':n; } else if(p) p.remove(); };
  let c=0; try{ c=chPending(); }catch(e){} set('chbtn',c); set('passbtn',passUnclaimed()); }
setInterval(()=>{ if(G.state!=='playing') try{ v9Pins(); }catch(e){} },1500); setTimeout(()=>{ try{ v9Pins(); }catch(e){} },500);

/* ---------------- modo cinema: também some com mãos e braços ----------------
   cinema 1 (ou F8) = sem HUD, sem mãos e braços, só a arma · cinema 2 = sem arma também · cinema 3 = como antes (com mãos) */
const CINE_HANDS={off:false};
function cineMats(){ return [VMSKIN,VMSLEEVE,VMCUFF,V9SLEEVE,RIG.mats.glove,RIG.mats.sleeve].filter(Boolean); }
function cineHands(hide){ if(CINE_HANDS.off===hide) return; CINE_HANDS.off=hide; for(const m of cineMats()) m.visible=!hide; }
const _v9cine=setCinema; setCinema=function(v){ v=v|0; _v9cine(v===3?1:v); CINEMA.lv=v; cineHands(v===1||v===2); };
v9On('always',()=>{ if(CINE_HANDS.off) for(const m of cineMats()) if(m.visible) m.visible=false; });   // as luvas são recopiadas ao trocar de personagem
const _v9rsmC=rigSyncMats; rigSyncMats=function(){ _v9rsmC(); if(CINE_HANDS.off) for(const m of cineMats()) m.visible=false; };
CMDS.cinema={d:'cinema [0|1|2|3] modo trailer · 1: sem HUD, mãos e braços (só a arma) · 2: sem a arma também · 3: sem HUD, com as mãos · F8 liga/desliga',
  f:a=>{ const v=a[0]==null?(CINEMA.on?0:1):clamp(num(a[0],1)|0,0,3); setCinema(v); cprint(v?['','Modo cinema: sem mãos e braços','Modo cinema: sem arma e sem mãos','Modo cinema: com as mãos'][v]+' · F8 ou "cinema 0" para sair':'Modo cinema desligado'); }};
