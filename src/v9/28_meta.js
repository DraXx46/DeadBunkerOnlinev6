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
/* ---------------- seleção de mapas: limpa, minimalista, em vidro líquido ----------------
   A foto do mapa ocupa a tela inteira (com zoom lento). Em cima dela: nome, uma frase curta, dificuldade/tamanho/recorde
   e os botões Jogar e Voltar. Embaixo, a fileira de cartões de vidro; à direita, o painel de vidro com as opções da partida.
   Clique seleciona, clique duplo ou Jogar entra. Passar o mouse num cartão mostra a foto daquele mapa. */
const MPI={bunker:{d:2,t:'Médio',img:'img/map_bunker.jpg',b:'Segure as janelas do bunker, conserte o carro e fuja para a cidade em chamas.',sec:'Junte as peças da máquina do tempo, conserte o carro para a cidade e enfrente o Mutante Ácido.',f:['Cidade destruída de carro','Máquina do tempo','Chefe: Mutante Ácido'],s:[3,4,5]},
  farm:{d:3,t:'Grande',img:'img/map_farm.jpg',b:'Uma fazenda isolada, uma mansão de dois andares e um laboratório escondido debaixo da mata.',sec:'O laboratório debaixo da mata guarda a melhor arma do mapa.',f:['Mansão de dois andares','Laboratório secreto','Campos abertos'],s:[5,3,4]},
  tz:{d:4,t:'Viagem',img:'img/map_tz.jpg',b:'Preso num posto de gasolina, você pega o ônibus 115 por cinco paradas na neblina.',sec:'Cada parada do ônibus tem algo para pegar. Não fique para trás.',f:['Ônibus em movimento','5 paradas na neblina','Zumbis no teto'],s:[4,5,3]},
  hosp:{d:3,t:'Médio',img:'img/map_hosp.jpg',b:'Um hospício abandonado no meio do mato, e uma máquina do tempo que leva tudo para 2087.',sec:'Ache as peças e vá para 2087: o hospício vira um laboratório de testes.',f:['Laboratório 2087','Celas e necrotério','Chefe do laboratório'],s:[3,4,5]},
  x1:{d:0,t:'Arena',img:'img/map_x1.jpg',b:'Só você e seu amigo. Compra de armas, 7 segundos de preparação e respawn na base.',sec:'Sem zumbis: rodadas de compra, 7 segundos de preparação e respawn na base.',f:['1 contra 1','Compra de armas','Online'],s:[1,5,1]}};
const MPS={sel:'bunker',bgi:0,bgk:null};
v9Css(`
#mappick{background:#050505!important;padding:0!important;overflow:hidden}
#mappick .mgbg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;background:#050505}
#mappick .mgbg i{position:absolute;inset:-5%;background:center/cover no-repeat;opacity:0;transition:opacity .9s ease;will-change:opacity,transform}
#mappick .mgbg i.on{opacity:1;animation:mgKen 22s ease-in-out infinite alternate}
@keyframes mgKen{from{transform:scale(1) translate3d(0,0,0)}to{transform:scale(1.09) translate3d(-1.2%,-.8%,0)}}
#mappick .mgbg b{position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,4,6,.78) 0%,rgba(4,4,6,.38) 38%,rgba(4,4,6,0) 62%),linear-gradient(0deg,rgba(4,4,6,.92) 0%,rgba(4,4,6,.35) 32%,rgba(4,4,6,0) 55%),linear-gradient(180deg,rgba(4,4,6,.55) 0%,rgba(4,4,6,0) 18%)}
#mappick .dossier{position:relative;z-index:1;max-width:none!important;margin:0!important;height:100%;display:block!important;padding:0!important}
#mappick .dossier>h2,#mappick .v9hint,#mappick .dossier>.row{display:none!important}
#mappick .dossier>.file{position:absolute;left:clamp(20px,5.5vw,96px);top:clamp(70px,10vh,104px);font-size:11px;letter-spacing:.42em;color:rgba(255,255,255,.62)}
/* vidro líquido */
.lgl{position:relative;isolation:isolate;border-radius:22px;border:1px solid rgba(255,255,255,.16);
  background:linear-gradient(155deg,rgba(255,255,255,.15) 0%,rgba(255,255,255,.06) 38%,rgba(255,255,255,.025) 100%);
  -webkit-backdrop-filter:blur(20px) saturate(175%);backdrop-filter:blur(20px) saturate(175%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.42),inset 1px 0 0 rgba(255,255,255,.12),inset 0 -1px 0 rgba(255,255,255,.06),inset 0 0 24px rgba(255,255,255,.04),0 18px 48px rgba(0,0,0,.42)}
.lgl::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:-1;
  background:radial-gradient(120% 70% at var(--mx,30%) var(--my,0%),rgba(255,255,255,.22),rgba(255,255,255,0) 55%);mix-blend-mode:screen;opacity:.8;transition:opacity .3s}
.lgl::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;padding:1px;
  background:linear-gradient(150deg,rgba(255,255,255,.55),rgba(255,255,255,0) 30%,rgba(255,255,255,0) 70%,rgba(255,255,255,.22));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
/* vitrine (texto sobre a foto) */
.mghero{position:absolute;left:clamp(20px,5.5vw,96px);bottom:clamp(218px,28vh,262px);max-width:min(620px,58vw);color:#f5f1ea}
.mghero .k{font:500 11px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.42em;text-transform:uppercase;color:rgba(255,255,255,.55);margin:0 0 10px}
.mghero h3{margin:0;font:700 clamp(40px,5.6vw,84px)/.95 var(--f-display);letter-spacing:.01em;text-transform:uppercase;text-shadow:0 6px 40px rgba(0,0,0,.55)}
.mghero p.ds{margin:14px 0 0;font:400 clamp(15px,1.35vw,18px)/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:rgba(255,255,255,.82);max-width:520px;text-wrap:pretty}
.mghero .meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:16px}
.mghero .pill{display:inline-flex;align-items:center;gap:8px;height:30px;padding:0 13px;border-radius:999px;font:500 12px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.04em;color:rgba(255,255,255,.86)}
.mghero .pill .dots{display:inline-flex;gap:4px}.mghero .pill .dots u{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.22)}.mghero .pill .dots u.f{background:#ff5a3a;box-shadow:0 0 8px rgba(255,90,58,.8)}
.mghero .pill.rec{color:#ffd76a}
.mghero .acts{display:flex;gap:10px;margin-top:22px}
.mghero .acts button{all:unset;position:relative;isolation:isolate;box-sizing:border-box;cursor:pointer;height:50px;padding:0 28px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;font:700 15px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#fff;transition:transform .18s ease,box-shadow .2s,background .2s}
.mghero .acts .go{background:linear-gradient(155deg,rgba(255,92,64,.78),rgba(176,24,14,.72));border-color:rgba(255,170,150,.45);box-shadow:inset 0 1px 0 rgba(255,220,210,.6),0 10px 34px rgba(224,48,31,.45)}
.mghero .acts .go:hover{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,220,210,.7),0 14px 40px rgba(224,48,31,.6)}
.mghero .acts .bk{font-weight:500;color:rgba(255,255,255,.86)}
.mghero .acts button:focus-visible{outline:2px solid #fff;outline-offset:3px}
.mghero.mgsw h3,.mghero.mgsw p.ds,.mghero.mgsw .meta{animation:mgIn .45s cubic-bezier(.2,.7,.2,1) both}.mghero.mgsw p.ds{animation-delay:.04s}.mghero.mgsw .meta{animation-delay:.08s}
@keyframes mgIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
/* painel de opções */
#mappick .mpopts{position:absolute;top:clamp(70px,10vh,104px);right:clamp(16px,4vw,64px);width:min(320px,36vw);padding:18px 18px 16px;display:flex;flex-direction:column;gap:12px;color:rgba(255,255,255,.88);font:400 13px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
#mappick .mpopts::marker{content:none}
#mappick .mpopts .mgt{font-size:10px;letter-spacing:.38em;text-transform:uppercase;color:rgba(255,255,255,.5);margin:0 0 2px}
#mappick .mpopts label,#mappick .mpopts .v9lo label{display:flex!important;flex-direction:column;align-items:stretch!important;align-self:stretch!important;width:100%!important;box-sizing:border-box;text-align:left;margin:0!important;gap:6px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.6)}
#mappick .mpopts select{appearance:none;-webkit-appearance:none;width:100%;max-width:none;margin:0;height:38px;padding:0 34px 0 14px;border-radius:12px;border:1px solid rgba(255,255,255,.16);color:#fff;font:500 14px system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;letter-spacing:0;text-transform:none;
  background:rgba(255,255,255,.07) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='white' stroke-opacity='.7' stroke-width='1.6'/%3E%3C/svg%3E") no-repeat right 13px center;box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}
#mappick .mpopts select option{background:#16161a;color:#fff}
#mappick .mpopts select:focus-visible{outline:2px solid rgba(255,255,255,.8);outline-offset:2px}
#mappick .mpopts .mpchk{flex-direction:row!important;align-items:flex-start!important;gap:10px;text-transform:none;letter-spacing:0;font-size:13px;color:rgba(255,255,255,.82);cursor:pointer}
#mappick .mpopts .v9pubc[style*="none"]{display:none!important}
#mappick .mpopts .mpchk input{appearance:none;-webkit-appearance:none;flex:none;width:34px;height:20px;margin:0;border-radius:999px;background:rgba(255,255,255,.16);box-shadow:inset 0 1px 2px rgba(0,0,0,.4);position:relative;cursor:pointer;transition:background .2s}
#mappick .mpopts .mpchk input::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.4);transition:transform .2s}
#mappick .mpopts .mpchk input:checked{background:#e0452f}#mappick .mpopts .mpchk input:checked::after{transform:translateX(14px)}
#mappick .mpopts .mpchk input:disabled{opacity:.5}
#mappick .mpopts #mp-note{margin:0;font-size:12px;color:rgba(255,255,255,.5)}#mappick .mpopts #mp-note:empty{display:none}
#mappick .mpopts .v9lo{display:flex;flex-direction:column;align-items:stretch;width:100%;gap:12px;margin:2px 0 0;padding-top:12px;border-top:1px solid rgba(255,255,255,.1)}
#mappick .mpopts .v9lo small{font-size:12px;color:rgba(255,255,255,.5);text-transform:none;letter-spacing:0}
/* cartões */
#mappick .maps{position:absolute;left:clamp(20px,5.5vw,96px);right:clamp(16px,4vw,64px);bottom:clamp(20px,4vh,40px);display:flex!important;flex-direction:row!important;gap:14px;margin:0!important;overflow-x:auto;overflow-y:visible;padding:14px 4px 6px;scrollbar-width:none}
#mappick .maps::-webkit-scrollbar{display:none}
#mappick .mapc{all:unset;box-sizing:border-box;cursor:pointer;flex:1 1 0;min-width:168px;max-width:270px;height:auto!important;padding:8px!important;display:flex!important;flex-direction:column;gap:9px;border-radius:20px;transform:none;transition:transform .25s cubic-bezier(.2,.7,.2,1),background .25s,box-shadow .25s,border-color .25s;overflow:visible!important}
#mappick .mapc:before{content:"";position:relative!important;inset:auto!important;display:block;aspect-ratio:16/9;width:100%;border-radius:14px;background:var(--img,#111) center/cover no-repeat!important;filter:saturate(.8) brightness(.78);transition:filter .3s,transform .3s!important;transform:none!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}
#mappick .mapc:after{display:none!important}
#mappick .mapc.x1card{display:none!important}
#mappick .mapc .mt{position:static!important;padding:0 6px 4px!important;font:600 13px/1.2 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif!important;letter-spacing:.02em;color:rgba(255,255,255,.74);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#mappick .mapc .md{display:none!important}
#mappick .mapc:hover{transform:translateY(-4px)}
#mappick .mapc:hover:before{filter:saturate(1) brightness(.95)}
#mappick .mapc.on{transform:translateY(-6px);border-color:rgba(255,255,255,.4);background:linear-gradient(155deg,rgba(255,255,255,.24),rgba(255,255,255,.08) 45%,rgba(255,255,255,.04));box-shadow:inset 0 1px 0 rgba(255,255,255,.6),0 0 0 1px rgba(255,255,255,.12),0 18px 44px rgba(0,0,0,.5),0 0 34px rgba(255,90,58,.18)}
#mappick .mapc.on:before{filter:none}
#mappick .mapc.on .mt{color:#fff}
#mappick .mapc.on .mt::before{content:"";display:inline-block;width:6px;height:6px;margin:0 8px 1px 0;border-radius:50%;background:#ff5a3a;box-shadow:0 0 10px #ff5a3a;vertical-align:middle}
#mappick .mapc:focus-visible{outline:2px solid #fff;outline-offset:3px}
#mappick .mapc .rb{position:absolute!important;z-index:2;top:16px!important;right:16px!important;padding:3px 8px!important;border-radius:999px;font:600 11px/1 system-ui,sans-serif!important;background:rgba(0,0,0,.45)!important;color:#ffd76a!important;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
@media (max-height:760px) and (min-width:861px){#mappick .mapc{max-width:220px}.mghero{bottom:236px}.mghero .acts{margin-top:16px}.mghero .meta{margin-top:12px}.mghero h3{font-size:clamp(36px,4.6vw,64px)}}
@media (max-width:860px){
  #mappick{overflow:auto!important}
  #mappick .dossier{display:flex!important;flex-direction:column;gap:16px;padding:76px 16px 24px!important;height:auto;min-height:100%}
  #mappick .dossier>.file,.mghero,#mappick .mpopts,#mappick .maps{position:static;max-width:none;width:auto}
  .mghero{order:1;margin-top:26vh}#mappick .maps{order:2;padding:6px 2px}#mappick .mpopts{order:3}
  #mappick .mapc{min-width:150px}
}
@media (prefers-reduced-motion:reduce){#mappick .mgbg i.on{animation:none}.mghero.mgsw *{animation:none!important}}`);
const HERO=v9El('div','mghero',`<p class="k"></p><h3></h3><p class="ds"></p><div class="meta"></div><div class="acts"><button class="go lgl" type="button" data-snd="confirm">Jogar</button></div>`);
const MGBG=v9El('div','mgbg','<i></i><i></i><b></b>');
(function(){ const sc=document.getElementById('mappick'), d=sc&&sc.querySelector('.dossier'); if(!d) return;
  sc.insertBefore(MGBG,sc.firstChild); d.insertBefore(HERO,d.querySelector('.mpopts'));
  const opts=d.querySelector('.mpopts'); opts.classList.add('lgl'); opts.insertAdjacentHTML('afterbegin','<p class="mgt">Partida</p>');
  const bk=document.getElementById('mp-back'); if(bk){ bk.classList.add('bk','lgl'); bk.classList.remove('ghost'); HERO.querySelector('.acts').appendChild(bk); }
  for(const b of d.querySelectorAll('.mapc')){ const i=MPI[b.dataset.map]; if(i&&i.img) b.style.setProperty('--img',`url(${i.img})`); b.classList.add('lgl'); }
  // o brilho do vidro acompanha o mouse
  sc.addEventListener('pointermove',e=>{ const g=e.target.closest&&e.target.closest('.lgl'); if(!g) return; const r=g.getBoundingClientRect(); g.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%'); g.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%'); });
  const maps=d.querySelector('.maps');
  // clique seleciona; clique duplo ou o botão Jogar entra no mapa (Enter no teclado, detail 0, continua entrando direto)
  maps.addEventListener('click',e=>{ const b=e.target.closest('.mapc'); if(!b||e.detail===0) return; e.stopPropagation(); e.preventDefault(); if(e.detail===1) mpSelect(b.dataset.map,true); },true);
  maps.addEventListener('dblclick',e=>{ const b=e.target.closest('.mapc'); if(b) mpPlay(b.dataset.map); });
  HERO.querySelector('.go').addEventListener('click',e=>{ e.stopPropagation(); mpPlay(MPS.sel); }); })();
function mpPlay(k){ try{ playChoice(k); }catch(e){ console.warn('[v9] mapa',e); } }
function mpBg(img){ if(MPS.bgk===img) return; MPS.bgk=img; const L=MGBG.querySelectorAll('i'), a=L[MPS.bgi%2], b=L[(MPS.bgi+1)%2]; MPS.bgi++;
  b.style.backgroundImage=img?`url(${img})`:'radial-gradient(circle at 30% 30%,#3a2410,#0a0604 70%)'; b.style.animation='none'; void b.offsetWidth; b.style.animation=''; b.classList.add('on'); a.classList.remove('on'); }
function mpSelect(k,snd){ MPS.sel=k; for(const b of document.querySelectorAll('#mappick .mapc')) b.classList.toggle('on',b.dataset.map===k); mpRefresh(k,true); if(snd) try{ Snd.ui('tab'); }catch(e){} }
function mpRefresh(k,sw){ k=k||MPS.sel; const i=MPI[k]; if(!i) return; const rec=PROG.v9rec||{};
  mpBg(i.img); if(k!==MPS.shown){ MPS.shown=k; HERO.classList.remove('mgsw'); void HERO.offsetWidth; HERO.classList.add('mgsw'); }
  const card=document.querySelector(`#mappick .mapc[data-map="${k}"]`); const full=card?card.querySelector('.mt').textContent:k; const pr=full.split(' · ');
  HERO.querySelector('.k').textContent=pr[1]||({bunker:'Sobrevivência',farm:'Sobrevivência',hosp:'Sobrevivência',x1:'Online'})[k]||'Sobrevivência';
  HERO.querySelector('h3').textContent=pr[0]; HERO.querySelector('.ds').textContent=i.b||i.sec||'';
  HERO.querySelector('.meta').innerHTML=(i.d?`<span class="pill lgl" title="Dificuldade"><span class="dots">${[1,2,3,4,5].map(n=>`<u class="${n<=i.d?'f':''}"></u>`).join('')}</span></span>`:'')+
    `<span class="pill lgl">${i.t}</span><span class="pill lgl ${rec[k]?'rec':''}">${rec[k]?'Recorde · rodada '+rec[k]:'Sem recorde ainda'}</span>`;
  for(const b of document.querySelectorAll('#mappick .mapc')){ const r=rec[b.dataset.map]; let e=b.querySelector('.rb'); if(r){ if(!e){ e=v9El('span','rb'); b.appendChild(e); } e.textContent='R'+r; } else if(e) e.remove(); } }
const _v9mth=mapThumb; mapThumb=function(k){ const el=document.getElementById('mappick'); if(el){ el.style.backgroundImage=''; } if(MPI[k]) mpRefresh(k); for(const b of document.querySelectorAll('#mappick .mapc')) b.classList.toggle('on',b.dataset.map===MPS.sel); };   // a foto agora fica na camada de fundo; a seleção continua no cartão escolhido
for(const b of document.querySelectorAll('#mappick .mapc')){ b.addEventListener('mouseenter',()=>mpRefresh(b.dataset.map)); b.addEventListener('mouseleave',()=>mpRefresh(MPS.sel)); b.addEventListener('focus',()=>mpSelect(b.dataset.map)); }

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
const KB_MOUSE={Mouse3:'Botão do meio',Mouse4:'Mouse 4 (lateral)',Mouse5:'Mouse 5 (lateral)',WheelUp:'Rolar ↑',WheelDown:'Rolar ↓'};
const kbName=c=>!c?'—':KB_MOUSE[c]?KB_MOUSE[c]:/^Key[A-Z]$/.test(c)?c.slice(3):/^Digit/.test(c)?c.slice(5):/^Numpad/.test(c)?'Num '+c.slice(6):({Space:'Espaço',ShiftLeft:'Shift',ShiftRight:'Shift dir.',ControlLeft:'Ctrl',ControlRight:'Ctrl dir.',AltLeft:'Alt',AltRight:'Alt Gr',Tab:'Tab',CapsLock:'Caps',Backspace:'Backspace',ArrowUp:'↑',ArrowDown:'↓',ArrowLeft:'←',ArrowRight:'→',Comma:',',Period:'.',Slash:';',Semicolon:'Ç',BracketLeft:'´',BracketRight:'[',Backslash:']',IntlBackslash:'\\',Minus:'-',Equal:'='})[c]||c;
const kbCur=d=>KBIND.map[d]||d;
function kbRender(){ const box=document.getElementById('v9kb'); if(!box) return; box.querySelector('.kl').innerHTML=KB_ACT.map(([d,n])=>`<div class="kr"><span>${n}</span><button type="button" class="ghost ${kbCur(d)!==d?'chg':''}" data-d="${d}">${kbName(kbCur(d))}</button></div>`).join('');
  for(const b of box.querySelectorAll('button[data-d]')) b.onclick=()=>kbCapture(b); }
function kbCapture(btn){ if(KBIND.cap) return; KBIND.cap=true; btn.textContent='aperte uma tecla…'; btn.classList.add('wait');
  btn.textContent='aperte uma tecla ou botão…';
  const done=()=>{ KBIND.cap=false; removeEventListener('keydown',on,true); removeEventListener('mousedown',onM,true); removeEventListener('wheel',onW,true); removeEventListener('auxclick',noAux,true); kbRender(); };
  const noAux=e=>{ e.preventDefault(); e.stopImmediatePropagation(); };
  // botão do meio, laterais (4 e 5) e a rodinha também valem; esquerdo e direito ficam com atirar e mirar
  const onM=e=>{ const c=KB_MBTN[e.button]; if(!c) return; e.preventDefault(); e.stopImmediatePropagation(); on({code:c,preventDefault(){},stopImmediatePropagation(){}}); };
  const onW=e=>{ if(Math.abs(e.deltaY)<2) return; e.preventDefault(); e.stopImmediatePropagation(); on({code:e.deltaY<0?'WheelUp':'WheelDown',preventDefault(){},stopImmediatePropagation(){}}); };
  const on=e=>{ e.preventDefault(); e.stopImmediatePropagation(); if(e.code==='Escape'){ done(); return; } if(KB_LOCK.has(e.code)){ btn.textContent='tecla reservada'; setTimeout(done,700); return; }
    const d=btn.dataset.d, old=kbCur(d); const other=KB_ACT.find(([d2])=>d2!==d&&kbCur(d2)===e.code);
    KBIND.map[d]=e.code; if(other) KBIND.map[other[0]]=old;   // troca com a ação que usava essa tecla
    for(const k in KBIND.map) if(KBIND.map[k]===k) delete KBIND.map[k]; KBIND.save(); try{ Snd.ui('confirm'); }catch(_){} done(); };
  addEventListener('keydown',on,true); setTimeout(()=>{ if(!KBIND.cap) return; addEventListener('mousedown',onM,true); addEventListener('wheel',onW,{capture:true,passive:false}); addEventListener('auxclick',noAux,true); },0); }
/* tecla presa (agachar no Ctrl ficava travado): o navegador às vezes engole o "soltar" do Ctrl/Shift/Alt quando ele vira atalho.
   Todo movimento de mouse e toda tecla trazem o estado real desses modificadores; se ele diz "solto", solta aqui também.
   (Não mexe no modificador que virou destino de uma tecla remapeada.) Perder a mira do mouse ou a aba solta tudo. */
function kbMods(e){ if(!e.isTrusted) return; const M=[['ctrlKey','ControlLeft','ControlRight'],['shiftKey','ShiftLeft','ShiftRight'],['altKey','AltLeft','AltRight']];
  for(const [f,a,b] of M){ if(e[f]!==false) continue; for(const k of [a,b]) if(keys[k]&&!KBIND.block.has(k)&&!Object.values(KBIND.fwd).includes(k)) keys[k]=false; } }
addEventListener('mousemove',kbMods,true); addEventListener('mousedown',kbMods,true); addEventListener('keydown',kbMods,true); addEventListener('keyup',kbMods,true);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) for(const k in keys) keys[k]=false; });
document.addEventListener('pointerlockchange',()=>{ if(!document.pointerLockElement&&!isTouch) for(const k of ['KeyC','ControlLeft','ControlRight']) keys[k]=false; });
/* botões do mouse e rodinha como teclas: viram a tecla padrão da ação, do mesmo jeito que as teclas remapeadas */
const KB_MBTN={1:'Mouse3',3:'Mouse4',4:'Mouse5'};
function kbMouseKey(code,down){ const to=KBIND.fwd[code]; if(!to) return false; dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code:to,key:KBIND.keyOf(to),bubbles:true,cancelable:true})); return true; }
addEventListener('mousedown',e=>{ if(KBIND.cap||!e.isTrusted) return; const c=KB_MBTN[e.button]; if(c&&kbMouseKey(c,true)){ e.preventDefault(); e.stopImmediatePropagation(); } },true);
addEventListener('mouseup',e=>{ if(KBIND.cap||!e.isTrusted) return; const c=KB_MBTN[e.button]; if(c&&KBIND.fwd[c]){ kbMouseKey(c,false); e.preventDefault(); e.stopImmediatePropagation(); } },true);
addEventListener('auxclick',e=>{ const c=KB_MBTN[e.button]; if(c&&KBIND.fwd[c]){ e.preventDefault(); e.stopImmediatePropagation(); } },true);   // laterais não voltam a página
addEventListener('wheel',e=>{ if(KBIND.cap||!e.isTrusted||Math.abs(e.deltaY)<2) return; const c=e.deltaY<0?'WheelUp':'WheelDown'; if(!KBIND.fwd[c]) return; if(G.state!=='playing') return;
  e.stopImmediatePropagation(); kbMouseKey(c,true); setTimeout(()=>kbMouseKey(c,false),60); },{capture:true,passive:true});
(function(){ const p=document.querySelector('.setp[data-st="ctrl"]'); if(!p) return; const dl=p.querySelector('#keys'); if(dl) dl.hidden=true;
  const box=v9El('div','v9kb',`<h4>Teclas</h4><p>Clique numa ação e aperte a nova tecla, o botão do meio, um botão lateral do mouse ou role a rodinha (Esc cancela). Se já estiver em uso, as duas ações trocam. Ctrl continua agachando e 1 a 4 continuam trocando de arma.</p><div class="kl"></div><button type="button" class="ghost" id="v9kbreset">Restaurar padrão</button>`); box.id='v9kb'; p.appendChild(box);
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
