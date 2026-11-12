/* ================= v9 · MENU: Inventário (filtros), Vitrine do dia (rubis), chances "1 em N", perfil com favoritos,
   nível de cada arma, destaque da loja maior com carrossel de visuais, cenário do menu mais cheio ================= */
/* ---- estatísticas salvas (para o perfil e o nível das armas) ---- */
function v9St(){ if(!PROG.v9st||typeof PROG.v9st!=='object') PROG.v9st={w:{},m:{},c:{},ch:{},games:0,kills:0,best:0,heads:0}; return PROG.v9st; }
function v9Wl(){ if(!PROG.v9wl||typeof PROG.v9wl!=='object') PROG.v9wl={}; return PROG.v9wl; }
const WLV=x=>{ x=x|0; let L=0; while(L<50&&x>=wlvNeed(L+1)) L++; const a=wlvNeed(L), b=wlvNeed(L+1); return {L,cur:x-a,need:b-a,f:(x-a)/Math.max(1,b-a)}; };
function wlvNeed(L){ return Math.round(30*L*L+70*L); }
v9On('kill',(x,z,kind,part,src)=>{ const s=curSlot(); const id=Wp.knifeOut||src==='knife'?'knife':(s?s.id:'m1911'); const st=v9St(); st.w[id]=(st.w[id]|0)+1; st.kills=(st.kills|0)+1; if(part==='head') st.heads=(st.heads|0)+1;
  const wl=v9Wl(); wl[id]=(wl[id]|0)+(part==='head'?2:1)+(kind==='brute'?3:0); const before=WLV(wl[id]-((part==='head'?2:1)+(kind==='brute'?3:0))).L, after=WLV(wl[id]).L;
  if(after>before) toast(`${id==='knife'?'Faca':(WEAPONS[id]||{}).name||id} subiu para o nível ${after}!`); });
v9On('roundStart',r=>{ if(r===1&&!x1Live()){ const st=v9St(); st.games=(st.games|0)+1; st.m[CUR]=(st.m[CUR]|0)+1; st.ch[PROG.char]=(st.ch[PROG.char]|0)+1; V9.carouselN=(st.games|0); } const st=v9St(); st.best=Math.max(st.best|0,r); });
const _v9addCard=addCard; addCard=function(id){ const r=_v9addCard(id); try{ const st=v9St(); st.c[id]=(st.c[id]|0)+1; }catch(e){} return r; };
function v9Fav(o){ let b=null,bv=0; for(const k in o) if((o[k]|0)>bv){ bv=o[k]|0; b=k; } return b?[b,bv]:null; }

/* ---- chances "1 em N" (referência: Caixa Militar, a que mais cai) ---- */
function v9ItemOdds(kind,r){ const b=BOX_BY.mil; if(!b) return '';
  if(kind==='knife'){ const nS=(SKINS_BY_R[r]||[1]).length||1; const p=(1-b.red)*0.82*(1-b.art)*(b.knife[r]||0)/nS; return p>0?v9Odds(p):v9Odds(b.red*0.5/Math.max(1,(SKINS_BY_R[5]||[1]).length)); }
  if(kind==='art'){ const p=(1-b.red)*0.82*b.art*(b.arto[r]||0)/ART_KEYS.length; return p>0?v9Odds(p):v9Odds(0.0005); }
  if(kind==='skin'){ const free=SKIN_DEFS.length||1; return v9Odds(b.red*0.5/free); }
  return ''; }

/* ---- INVENTÁRIO ---- */
const INV={cat:'all',sort:'rar',sel:null,el:null,inGame:false};
function invItems(){ const out=[];
  for(const it of PROG.items) out.push({kind:'knife',id:it.uid,name:itemName(it),r:Math.max(0,itemR(it)),col:itemRar(it).col,rar:itemRar(it).name,date:parseInt((it.uid||'k0').slice(1,9),36)||0,qty:1,it,typ:KTYPES[it.t]?KTYPES[it.t].name:'Faca'});
  for(const a of PROG.arts||[]) out.push({kind:'art',id:a.uid,name:artName(a),r:a.r,col:RAR[a.r].col,rar:RAR[a.r].name,date:parseInt((a.uid||'a0').slice(1,9),36)||0,qty:1,a,typ:'Artefato'});
  const bc={}; for(const b of PROG.boxes||[]){ const k=b.t; if(!bc[k]) bc[k]={kind:'box',id:'box:'+k,t:k,name:(BOX_BY[k]||{}).name||k,r:Math.max(0,BOXES.findIndex(x=>x.t===k)),col:(BOX_BY[k]||{}).col||'#aaa',rar:'Caixa',date:0,qty:0,typ:'Caixa'}; bc[k].qty++; bc[k].date=Math.max(bc[k].date,parseInt((b.id||'b0').slice(1,9),36)||0); }
  for(const k in bc) out.push(bc[k]);
  for(const key of PROG.skins||[]){ const [c,k]=key.split(':'); const d=SKIN_DEFS.find(x=>x.c===c&&x.k===k); if(!d) continue; out.push({kind:'skin',id:'skin:'+key,c,k,d,name:d.name,r:5,col:'#ff1a2a',rar:'Visual',date:0,qty:1,typ:(CHARS[c]||{}).name||'Visual'}); }
  return out; }
function invOpen(){ show(null); if(!INV.el) invBuild(); INV.el.hidden=false; invRender(); try{ Snd.ui('tab'); }catch(e){} }
function invClose(){ if(INV.el) INV.el.hidden=true; show('#menu'); try{ Snd.ui('back'); }catch(e){} }
function invBuild(){ const el=v9El('section','screen v9inv',`<div class="iv">
  <header class="ivh"><div><p class="file">Tudo o que você tem</p><h2>Inventário</h2></div><div class="draxbig">◆ <span class="draxv">0</span> drax <span class="rubybig">♦ <span class="rubyv">0</span> rubis</span></div>
  <div class="row"><button class="ghost" id="iv-ars" type="button">Arsenal (caixas de drax e prévia 3D)</button><button class="ghost" id="iv-wl" type="button">Nível das armas</button><button class="cta small" id="iv-back" type="button">Voltar</button></div></header>
  <div class="ivf"><nav class="tabs" id="iv-cat"><button data-c="all" class="on">Todos</button><button data-c="skin">Skins</button><button data-c="knife">Facas</button><button data-c="art">Artefatos</button><button data-c="box">Caixas</button></nav>
  <label class="ivs">Ordenar por <select id="iv-sort"><option value="rar">Raridade</option><option value="type">Tipo</option><option value="qty">Quantidade</option><option value="date">Data que recebeu</option></select></label></div>
  <div class="ivb"><div class="ivg" id="iv-grid"></div><aside class="ivd" id="iv-det"></aside></div></div>`); el.id='v9inv'; el.hidden=true; document.body.appendChild(el); INV.el=el;
  el.querySelector('#iv-back').onclick=invClose; el.querySelector('#iv-ars').onclick=()=>{ el.hidden=true; arsTab='cases'; openArsenal(); };
  el.querySelector('#iv-wl').onclick=()=>{ INV.cat='wl'; invRender(); };
  el.querySelector('#iv-cat').onclick=e=>{ const b=e.target.closest('button[data-c]'); if(!b) return; INV.cat=b.dataset.c; INV.sel=null; invRender(); Snd.ui('tab'); };
  el.querySelector('#iv-sort').onchange=e=>{ INV.sort=e.target.value; invRender(); };
  el.querySelector('#iv-grid').onclick=e=>{ const b=e.target.closest('[data-id]'); if(!b) return; INV.sel=b.dataset.id; invRender(); Snd.ui('select'); };
  el.querySelector('#iv-det').onclick=e=>{ const b=e.target.closest('[data-a]'); if(!b) return; invAct(b.dataset.a); }; }
function invThumb(o){ try{ if(o.kind==='knife') return `<img alt="" src="${knifeThumb(o.it,118,54)}">`; if(o.kind==='art') return artIcon(o.a,52); if(o.kind==='box') return v9BoxSvg(o.col,58); if(o.kind==='skin') return `<img alt="" src="${charThumb3d(o.c,o.k)}" style="height:64px">`; }catch(e){} return ''; }
function invRender(){ const el=INV.el; if(!el) return; renderDrax();
  for(const b of el.querySelectorAll('#iv-cat button')) b.classList.toggle('on',b.dataset.c===INV.cat);
  const g=el.querySelector('#iv-grid'), det=el.querySelector('#iv-det');
  if(INV.cat==='wl'){ const wl=v9Wl(); const ids=Object.keys(WEAPONS).concat(['knife']); g.innerHTML=`<div class="wlv">${ids.map(id=>{ const r=WLV(wl[id]|0); return `<div class="wl"><b>${id==='knife'?'Faca':WEAPONS[id].name}</b><span>Nv ${r.L}</span><div class="pgbar"><i style="width:${(r.f*100).toFixed(1)}%"></i></div><small>${v9Fmt(r.cur)}/${v9Fmt(r.need)} XP · ${v9Fmt(v9St().w[id]|0)} abates</small></div>`; }).join('')}</div>`; det.innerHTML='<h3>Nível das armas</h3><p class="rec">Cada abate dá XP para a arma que você estava usando (tiro na cabeça vale o dobro). O nível fica salvo na conta.</p>'; return; }
  let L=invItems().filter(o=>INV.cat==='all'||o.kind===INV.cat);
  const S={rar:(a,b)=>b.r-a.r||a.name.localeCompare(b.name),type:(a,b)=>a.typ.localeCompare(b.typ)||b.r-a.r,qty:(a,b)=>b.qty-a.qty||b.r-a.r,date:(a,b)=>b.date-a.date}[INV.sort]; L.sort(S);
  g.innerHTML=L.length?L.map(o=>`<button type="button" class="ivc${INV.sel===o.id?' sel':''}${(o.kind==='knife'&&PROG.eq===o.id)||(o.kind==='art'&&Object.values(PROG.artEq||{}).includes(o.id))?' eq':''}" data-id="${o.id}" style="--rc:${o.col}">${invThumb(o)}<b>${o.name}</b><span>${o.rar}${o.qty>1?' · ×'+o.qty:''}</span>${o.kind!=='box'?`<small class="odds">${v9ItemOdds(o.kind,o.r)}</small>`:''}</button>`).join(''):'<p class="rec">Nada aqui ainda. Jogue partidas: a cada 3 rodadas você ganha uma recompensa.</p>';
  const o=L.find(q=>q.id===INV.sel); if(!o){ det.innerHTML=`<p class="rec">${L.length} ite${L.length===1?'m':'ns'}. Selecione um para ver detalhes.</p>`; return; }
  let body=''; if(o.kind==='knife') body=`<ul class="kpas">${(o.it.pas||[]).map(p=>`<li>${fmtPas(p)}</li>`).join('')}</ul><div class="row"><button class="cta small" data-a="equip" ${PROG.eq===o.id?'disabled':''}>${PROG.eq===o.id?'Em uso':'Equipar'}</button><button class="ghost" data-a="sell">Vender · ◆ ${v9Fmt(RAR[Math.max(0,o.r)].sell*(o.it.rp?2:1))}</button></div>`;
  else if(o.kind==='art') body=`<ul class="kpas">${artLines(o.a).map(l=>`<li>${l}</li>`).join('')}</ul><p class="rec">${ART_T[o.a.a].lore}</p><div class="row"><button class="cta small" data-a="equipart">Equipar em ${curVar().name}</button></div>`;
  else if(o.kind==='box') body=`<p class="rec">${(BOX_BY[o.t]||{}).desc||''}</p><div class="row"><button class="cta small" data-a="open">Abrir</button>${o.qty>1?'<button class="ghost" data-a="open10">Abrir várias</button>':''}</div>`;
  else if(o.kind==='skin') body=`<p class="rec">${o.d.lore||''}</p><div class="row"><button class="cta small" data-a="wear">Vestir</button></div>`;
  det.innerHTML=`<div class="ivdh" style="--rc:${o.col}">${invThumb(o)}</div><p class="krar" style="color:${o.col}">${o.rar}${o.kind!=='box'?' · '+o.typ:''}</p><h3>${o.name}</h3>${o.kind!=='box'?`<p class="odds">Chance de obter: <b>${v9ItemOdds(o.kind,o.r)}</b></p>`:''}${body}`; }
function invAct(a){ const o=invItems().find(q=>q.id===INV.sel); if(!o) return;
  if(a==='equip'){ PROG.eq=o.id; saveProg(); recomputeMods(); try{ setKnifeModel(); }catch(e){} Snd.ui('select'); }
  else if(a==='sell'){ PROG.items=PROG.items.filter(i=>i!==o.it); if(PROG.eq===o.id) PROG.eq='base'; PROG.drax+=RAR[Math.max(0,o.r)].sell*(o.it.rp?2:1); saveProg(); recomputeMods(); INV.sel=null; Snd.buy(); }
  else if(a==='equipart'){ if(!PROG.artEq) PROG.artEq={}; PROG.artEq[PROG.char]=o.id; saveProg(); recomputeMods(); Snd.ui('select'); toast(`${o.name} equipado em ${curVar().name}`); }
  else if(a==='open'||a==='open10'){ INV.el.hidden=true; arsTab='cases'; openArsenal(); setTimeout(()=>{ try{ openBoxUI(o.t,false,a==='open10'?10:0); }catch(e){} },60); return; }
  else if(a==='wear'){ PROG.char=o.c; PROG.cv=o.k; saveProg(); recomputeMods(); try{ applyHands(); menuLabels(); }catch(e){} toast('Visual vestido'); }
  invRender(); }
v9Css(`.v9inv{position:fixed;inset:0;z-index:20;background:radial-gradient(ellipse at 30% 0,#1a1410,#070605 70%);overflow:auto}
.v9inv .iv{max-width:1280px;margin:0 auto;padding:26px 28px 40px}.v9inv .ivh{display:flex;gap:18px;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;border-bottom:1px solid #2a241c;padding-bottom:12px}
.v9inv .ivh h2{margin:0;font:700 40px "Stardos Stencil",Impact,sans-serif;letter-spacing:.06em}.v9inv .ivf{display:flex;justify-content:space-between;align-items:center;margin:14px 0;gap:12px;flex-wrap:wrap}
.v9inv .ivs{font:12px "Special Elite",monospace;color:#a59c8a}.v9inv select{background:#120f0b;color:#eee;border:1px solid #3a3226;padding:6px 8px;margin-left:6px;font:inherit}
.v9inv .ivb{display:grid;grid-template-columns:1fr 330px;gap:18px}.v9inv .ivg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;align-content:start}
.v9inv .ivc{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px 8px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(0,0,0,.25));border:1px solid #2a241c;border-bottom:3px solid var(--rc);color:#e8e2d4;cursor:pointer;text-align:center;min-height:150px}
.v9inv .ivc:hover{border-color:var(--rc);transform:translateY(-2px)}.v9inv .ivc.sel{box-shadow:0 0 0 2px var(--rc),0 0 22px color-mix(in srgb,var(--rc) 40%,transparent)}.v9inv .ivc.eq::after{content:'EM USO';position:absolute;top:6px;right:6px;font:10px "Special Elite",monospace;color:#6aff8a}
.v9inv .ivc img{max-width:118px;max-height:64px}.v9inv .ivc b{font-size:12px;line-height:1.15}.v9inv .ivc span{font:11px "Special Elite",monospace;color:var(--rc)}.v9inv .odds{font:10px "Special Elite",monospace;color:#8a8478}.v9inv .odds b{color:#e8e2d4}
.v9inv .ivd{background:rgba(10,9,7,.8);border:1px solid #2a241c;padding:16px;align-self:start;position:sticky;top:12px}.v9inv .ivdh{display:flex;justify-content:center;padding:12px;border-bottom:2px solid var(--rc);margin-bottom:8px}.v9inv .ivdh img{max-width:280px;max-height:140px}
.v9inv .wlv{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}.v9inv .wl{display:grid;grid-template-columns:1fr auto;gap:4px;padding:10px;border:1px solid #2a241c;background:rgba(0,0,0,.25)}.v9inv .wl .pgbar,.v9inv .wl small{grid-column:1/3}.v9inv .wl span{color:#ffb040;font:700 14px "Stardos Stencil",Impact}.v9inv .wl small{font-size:10px;color:#8a8478}
@media(max-width:820px){.v9inv .ivb{grid-template-columns:1fr}}`);
(function(){ const b=document.getElementById('arsbtn'); if(b){ b.textContent='Inventário'; const nb=b.cloneNode(true); b.parentNode.replaceChild(nb,b); nb.addEventListener('click',invOpen); } })();

/* ---- VITRINE DO DIA (Loja): 5 itens roxos, lendários ou vermelhos, comprados com rubis ---- */
const VIT_PRICE={knife:[0,0,0,650,1500,4800],art:[0,0,0,550,1300,4200]};
function vitOffers(){ const d=dayNum(); const rng=mulberry(d*7919+71); const out=[];
  for(let i=0;i<5;i++){ const roll=rng(); const r=roll<0.08?5:roll<0.45?4:3; const kind=i===4?'skin':(rng()<0.6?'knife':'art');
    if(kind==='knife'){ const it=rollItem(r,rng); it.uid='v'+d+'_'+i; out.push({i,kind,r,it,name:itemName(it),price:Math.round(VIT_PRICE.knife[r]*(0.9+rng()*0.3)/10)*10}); }
    else if(kind==='art'){ const keep=Math.random; Math.random=rng; const a=rollArtifact(r); Math.random=keep; a.uid='va'+d+'_'+i; out.push({i,kind,r,a,name:artName(a),price:Math.round(VIT_PRICE.art[r]*(0.9+rng()*0.3)/10)*10}); }
    else { const free=SKIN_DEFS.filter(x=>!ownSkin(x.c,x.k)); const sd=free.length?free[Math.floor(rng()*free.length)]:SKIN_DEFS[Math.floor(rng()*SKIN_DEFS.length)]; out.push({i,kind:'skin',r:5,d:sd,name:sd.name,price:sd.price}); } }
  return out; }
function vitHTML(){ const d=dayNum(); const bought=(PROG.vitB&&PROG.vitB.d===d)?PROG.vitB.i:[]; const left=86400000-(Date.now()%86400000); const h=Math.floor(left/3600000), m=Math.floor(left%3600000/60000);
  return `<div class="vit"><div class="vith"><div><p class="file">Loja</p><h3>Vitrine do dia</h3></div><span>troca em ${h}h ${m}min</span></div><div class="vitg">${vitOffers().map(o=>{ const col=RAR[o.r].col; const sold=bought.includes(o.i); let th='';
    try{ th=o.kind==='knife'?`<img alt="" src="${knifeThumb(o.it,236,108)}">`:o.kind==='art'?artIcon(o.a,96):`<img alt="" src="${charThumb3d(o.d.c,o.d.k)}" style="height:150px">`; }catch(e){}
    return `<div class="vc${sold?' sold':''}" style="--rc:${col}"><div class="vct">${th}</div><p class="krar" style="color:${col}">${RAR[o.r].name} · ${o.kind==='knife'?'faca':o.kind==='art'?'artefato':'visual'}</p><b>${o.name}</b><small class="odds">Chance numa caixa: ${v9ItemOdds(o.kind,o.r)}</small>
      <button class="cta small" data-vit="${o.i}" ${sold||PROG.rubies<o.price?'disabled':''}>${sold?'Comprado':'♦ '+v9Fmt(o.price)}</button></div>`; }).join('')}</div></div>`; }
function vitBuy(i){ const o=vitOffers().find(q=>q.i===i); if(!o) return; const d=dayNum(); if(!PROG.vitB||PROG.vitB.d!==d) PROG.vitB={d,i:[]}; if(PROG.vitB.i.includes(i)) return;
  if(PROG.rubies<o.price){ Snd.ui('deny'); toast(`Faltam ♦ ${v9Fmt(o.price-PROG.rubies)}`,{bad:true}); return; }
  PROG.rubies-=o.price; PROG.vitB.i.push(i); if(o.kind==='knife'){ o.it.uid='k'+Date.now().toString(36)+'v'; PROG.items.push(o.it); } else if(o.kind==='art'){ o.a.uid='a'+Date.now().toString(36)+'v'; PROG.arts.push(o.a); } else { const key=skinKey(o.d.c,o.d.k); if(!PROG.skins.includes(key)) PROG.skins.push(key); }
  saveProg(); Snd.buy(); try{ Snd.reveal(Math.min(4,o.r)); }catch(e){} toast(`${o.name} comprado!`); renderArsenal(); }
const _v9ra=renderArsenal;
renderArsenal=function(){ _v9ra(); if(arsTab==='shop'){ const t=$('#tab-shop'); t.innerHTML=vitHTML()+'<p class="file" style="margin:18px 0 8px">Facas por drax (troca todo dia)</p>'+t.innerHTML; } };
document.addEventListener('click',e=>{ const b=e.target.closest('[data-vit]'); if(b){ e.stopPropagation(); vitBuy(+b.dataset.vit); } },true);
v9Css(`.vit{margin-bottom:8px}.vit .vith{display:flex;justify-content:space-between;align-items:flex-end}.vit h3{margin:0;font:700 28px "Stardos Stencil",Impact;letter-spacing:.06em}.vit .vith span{font:12px "Special Elite",monospace;color:#8a8478}
.vit .vitg{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:10px}.vit .vc{display:flex;flex-direction:column;gap:5px;padding:10px;background:linear-gradient(180deg,color-mix(in srgb,var(--rc) 14%,#0d0b08),#0a0907);border:1px solid color-mix(in srgb,var(--rc) 45%,#222);box-shadow:inset 0 0 30px color-mix(in srgb,var(--rc) 12%,transparent)}
.vit .vct{height:150px;display:flex;align-items:center;justify-content:center}.vit .vct img{max-width:100%;max-height:150px}.vit .vc b{font-size:13px;min-height:32px}.vit .vc.sold{opacity:.45}.vit .odds{font:10px "Special Elite",monospace;color:#8a8478}
@media(max-width:900px){.vit .vitg{grid-template-columns:repeat(2,1fr)}}`);

/* ---- PERFIL: clicar no próprio perfil mostra os favoritos ---- */
function profOpen(){ const st=v9St(); const fw=v9Fav(st.w), fm=v9Fav(st.m), fc=v9Fav(st.c), fch=v9Fav(st.ch); const wl=v9Wl();
  const best=Object.keys(wl).sort((a,b)=>(wl[b]|0)-(wl[a]|0))[0];
  const card=(t,v,s)=>`<div class="pf"><small>${t}</small><b>${v||'—'}</b>${s?`<span>${s}</span>`:''}</div>`;
  const mapN=k=>(MAPS[k]||{}).name||k; const wN=k=>k==='knife'?'Faca':(WEAPONS[k]||{}).name||k;
  const el=v9El('div','v9prof',`<div class="pfc"><button class="ghost pfx" type="button">Fechar</button><p class="file">Perfil</p><h2>${(SOC&&SOC.acc&&SOC.acc.name)||localStorage.getItem('bdm_player_name')||'Sobrevivente'}</h2>
    <div class="pfg">${card('Arma favorita',fw&&wN(fw[0]),fw&&`${v9Fmt(fw[1])} abates`)}${card('Mapa favorito',fm&&mapN(fm[0]),fm&&`${fm[1]} partida${fm[1]>1?'s':''}`)}${card('Carta favorita',fc&&(CARD_BY[fc[0]]||{}).name,fc&&`escolhida ${fc[1]}×`)}${card('Personagem favorito',fch&&(CHARS[fch[0]]||{}).name,fch&&`${fch[1]} partida${fch[1]>1?'s':''}`)}
    ${card('Arma de maior nível',best&&wN(best),best&&'Nv '+WLV(wl[best]).L)}${card('Partidas',v9Fmt(st.games|0))}${card('Abates',v9Fmt(st.kills|0),v9Fmt(st.heads|0)+' na cabeça')}${card('Melhor rodada',st.best|0)}</div></div>`);
  document.body.appendChild(el); el.onclick=e=>{ if(e.target===el||e.target.closest('.pfx')){ el.remove(); Snd.ui('back'); } }; Snd.ui('tab'); }
v9Css(`.v9prof{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center}.v9prof .pfc{position:relative;background:#0f0c09;border:1px solid #3a3022;padding:22px 26px;min-width:min(720px,94vw)}
.v9prof h2{margin:2px 0 14px;font:700 34px "Stardos Stencil",Impact}.v9prof .pfx{position:absolute;right:14px;top:14px}.v9prof .pfg{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.v9prof .pf{display:flex;flex-direction:column;gap:3px;padding:12px;border:1px solid #2a241c;background:rgba(255,255,255,.02)}.v9prof .pf small{font:10px "Special Elite",monospace;letter-spacing:.15em;color:#8a8478;text-transform:uppercase}.v9prof .pf b{font-size:16px;color:#f4ead2}.v9prof .pf span{font-size:11px;color:#c9a24a}
@media(max-width:700px){.v9prof .pfg{grid-template-columns:repeat(2,1fr)}}`);
(function(){ const p=document.getElementById('pgprof'); if(p){ p.style.cursor='pointer'; p.title='Ver perfil'; p.addEventListener('click',profOpen); } })();

/* ---- PAINEL DO MENU: novidades da atualização em cima, carrossel de skins (uma por vez) embaixo ---- */
const V9NEWS=[
  ['Novo mapa','Cidade destruída','Conserte o carro do lado de fora do bunker e fuja para a cidade.'],
  ['Chefe','O Mutante Ácido','4,5 m de altura. O escudo só quebra com tiros nas costas.'],
  ['Hospício','Máquina do tempo','Ache as 10 peças e viaje com a equipe para o laboratório de 2087.'],
  ['Bebidas','Soro da Vida e Mula de Carga','Um reviver a mais e espaço para uma 3ª arma.'],
  ['Armas','Besta Carcará','Arma nova — e a Barrett agora puxa o ferrolho e bate muito mais forte.'],
  ['Cachorros','Agarrão na perna','Aperte ataque sem parar para esfaquear antes que ele te derrube.'],
  ['Eventos','Roleta, troca e chuva de pontos','Eventos mais frequentes, com prêmios e castigos.']];
const NWS={i:0,t:null};
function newsRender(){ const box=document.querySelector('#ad .v9news'); if(!box) return; const n=V9NEWS[NWS.i%V9NEWS.length];
  box.querySelector('.nw-s').innerHTML=`<small>${n[0]}</small><b>${n[1]}</b><p>${n[2]}</p>`;
  box.querySelector('.nw-dots').innerHTML=V9NEWS.map((_,i)=>`<i class="${i===NWS.i%V9NEWS.length?'on':''}" data-n="${i}"></i>`).join(''); }
const CRS={i:0,list:null,t:null};
function carList(){ const n=(v9St().games|0); const rng=mulberry(n*131+7); const pool=SKIN_DEFS.slice(); const out=[]; while(out.length<6&&pool.length) out.push(pool.splice(Math.floor(rng()*pool.length),1)[0]); return out; }
function adBuild(){ const ad=document.getElementById('ad'); if(!ad||ad.querySelector('.v9news')) return; const body=ad.querySelector('.adbody'); ad.classList.add('v9ad');
  const nw=v9El('div','v9news'); nw.innerHTML='<div class="nw-h"><span>Novidades</span><em>'+GAME_VERSION+'</em></div><div class="nw-s"></div><div class="nw-dots"></div>';
  body.prepend(nw); nw.querySelector('.nw-dots').addEventListener('click',e=>{ const i=e.target.dataset&&e.target.dataset.n; if(i==null) return; NWS.i=+i; newsRender(); });
  const cr=v9El('div','v9car'); body.appendChild(cr); }
function carRender(){ adBuild(); const box=document.querySelector('#ad .v9car'); if(!box) return; if(!CRS.list) CRS.list=carList(); const L=CRS.list, k=CRS.i%L.length;
  const d=L[k]; if(!d) return; let img=''; try{ img=charThumb3d(d.c,d.k); }catch(e){}
  const own=ownSkin(d.c,d.k);
  box.innerHTML=`<div class="cr-h"><span>Loja · Skins</span><small>${k+1} / ${L.length}</small></div>
  <div class="cr-img"><img alt="" src="${img}"><button class="cr-p" type="button" aria-label="Anterior">‹</button><button class="cr-n" type="button" aria-label="Próxima">›</button></div>
  <div class="cr-tx"><small>${(CHARS[d.c]||{}).name||''}</small><b>${d.name}</b></div>
  <div class="cr-row"><button class="cta small" type="button" data-carbuy ${own||PROG.rubies<d.price?'disabled':''}>${own?'Já é seu':'Comprar · ♦ '+v9Fmt(d.price)}</button><div class="cr-dots">${L.map((_,i)=>`<i class="${i===k?'on':''}"></i>`).join('')}</div></div>`;
  box.querySelector('.cr-p').onclick=e=>{ e.stopPropagation(); CRS.i=(CRS.i+L.length-1)%L.length; carRender(); carTimer(); Snd.ui('slide'); };
  box.querySelector('.cr-n').onclick=e=>{ e.stopPropagation(); CRS.i=(CRS.i+1)%L.length; carRender(); carTimer(); Snd.ui('slide'); };
  const bb=box.querySelector('[data-carbuy]'); if(bb) bb.onclick=e=>{ e.stopPropagation(); try{ buySkin(d.c,d.k); }catch(x){} carRender(); }; }
function carTimer(){ clearInterval(CRS.t); CRS.t=setInterval(()=>{ const m=document.getElementById('menu'); if(!m||m.hidden) return; CRS.i++; carRender(); },5000); }
v9On('menu',()=>{ CRS.list=carList(); carRender(); newsRender(); carTimer(); clearInterval(NWS.t); NWS.t=setInterval(()=>{ const m=document.getElementById('menu'); if(!m||m.hidden) return; NWS.i++; newsRender(); },7000); });
v9Css(`#ad{width:min(400px,31vw)!important;max-width:none!important}
#ad.v9ad .adtag,#ad.v9ad .adhead,#ad.v9ad .adline,#ad.v9ad .adbody>.row,#ad.v9ad .admsg{display:none!important}
#ad.v9ad .adbody{gap:0;padding:0}
#ad .v9news{padding:12px 14px 12px;border-bottom:1px solid rgba(255,40,60,.25);background:linear-gradient(180deg,rgba(255,40,60,.08),transparent)}
#ad .nw-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}#ad .nw-h span{font:11px "Special Elite",monospace;letter-spacing:.22em;text-transform:uppercase;color:#ff5a4a}#ad .nw-h em{font:10px "Special Elite",monospace;font-style:normal;color:#8a8478;letter-spacing:.12em}
#ad .nw-s{min-height:78px;animation:crIn .5s ease}#ad .nw-s small{display:block;font:10px "Special Elite",monospace;letter-spacing:.18em;text-transform:uppercase;color:#c9a24a}#ad .nw-s b{display:block;font:700 21px "Stardos Stencil",Impact;color:#f4ead2;margin:2px 0 3px}#ad .nw-s p{margin:0;font-size:12px;line-height:1.4;color:#b8ab98}
#ad .nw-dots,#ad .cr-dots{display:flex;gap:4px}#ad .nw-dots,#ad .cr-dots{margin-top:6px}#ad .nw-dots i,#ad .cr-dots i{width:14px;height:3px;background:#6a5a48;cursor:pointer;flex:none}#ad .nw-dots i.on,#ad .cr-dots i.on{background:#e0301f}
#ad .v9car{padding:10px 14px 14px}
#ad .cr-h{display:flex;justify-content:space-between;align-items:center}#ad .cr-h span{font:11px "Special Elite",monospace;letter-spacing:.22em;text-transform:uppercase;color:#ff5a4a}#ad .cr-h small{font:10px "Special Elite",monospace;color:#8a8478}
#ad .cr-img{position:relative;height:clamp(150px,22vh,230px);margin:6px 0 4px;background:radial-gradient(ellipse at 50% 75%,rgba(255,40,40,.22),transparent 70%);display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
#ad .cr-img img{height:100%;object-fit:contain;animation:crIn .55s ease}
#ad .cr-p,#ad .cr-n{position:absolute;top:50%;transform:translateY(-50%);background:rgba(0,0,0,.55);border:1px solid #3a3022;color:#eee;width:28px;height:38px;cursor:pointer;font-size:18px}#ad .cr-p{left:0}#ad .cr-n{right:0}#ad .cr-p:hover,#ad .cr-n:hover{border-color:#e0301f}
#ad .cr-tx{text-align:center}#ad .cr-tx small{display:block;font:10px "Special Elite",monospace;color:#8a8478;letter-spacing:.15em;text-transform:uppercase}#ad .cr-tx b{display:block;font:700 20px "Stardos Stencil",Impact;color:#f4ead2}
#ad .cr-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:8px}
@keyframes crIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:none}}`);
const _v9menuEnter=menuEnter; menuEnter=function(){ _v9menuEnter(); try{ v9Run('menu'); }catch(e){} };

/* ---- cenário do menu: grama, pedras, terra, entulho e mato em volta do grupo ---- */
const _v9cme=cpMenuEnv;
cpMenuEnv=function(){ const had=!!CP.env; const env=_v9cme(); if(!had) try{ v9MenuFill(env); }catch(e){ console.warn('[Bunker v9] cenário do menu',e); } return env; };
function v9MenuFill(env){
  const grassT=(()=>{ const c=document.createElement('canvas'); c.width=128; c.height=128; const g=c.getContext('2d'); for(let i=0;i<46;i++){ const x=rand(8,120), h=rand(50,124), w=rand(2,5); const gr=g.createLinearGradient(0,128,0,128-h); gr.addColorStop(0,'#1a1a0c'); gr.addColorStop(1,pick(['#5a6a2a','#6a7a34','#4a5a24','#7a7040'])); g.fillStyle=gr; g.beginPath(); g.moveTo(x-w,128); g.quadraticCurveTo(x+rand(-10,10),128-h*0.6,x+rand(-14,14),128-h); g.lineTo(x+w,128); g.fill(); } return new THREE.CanvasTexture(c); })();
  const gm=new THREE.MeshLambertMaterial({map:grassT,transparent:true,alphaTest:0.4,side:THREE.DoubleSide});
  const tuft=(x,z,s)=>{ for(let k=0;k<3;k++){ const p=new THREE.Mesh(new THREE.PlaneGeometry(0.8*s,0.3*s),gm); p.position.set(x,0.14*s,z); p.rotation.y=k*Math.PI/3+rand(0,1); env.add(p); } };
  for(let i=0;i<170;i++){ const a=rand(0,Math.PI*2), r=Math.pow(Math.random(),0.6)*16+1.2; const x=Math.cos(a)*r, z=Math.sin(a)*r*0.8-2; if(Math.abs(x)<1.6&&z>-1.2&&z<2.2) continue; tuft(x,z,rand(0.6,1.4)); }
  const rockM=[0x3a3632,0x2e2a26,0x4a443c].map(c=>new THREE.MeshPhongMaterial({color:c,flatShading:true,shininess:4}));
  for(let i=0;i<46;i++){ const s=rand(0.08,0.4); const g=new THREE.DodecahedronGeometry(s,1); const p=g.attributes.position; const sx=rand(0.85,1.25), sy=rand(0.5,0.85), sz=rand(0.85,1.25), ph=rand(0,9); for(let k=0;k<p.count;k++){ const x=p.getX(k), y=p.getY(k), z=p.getZ(k), j=1+0.18*Math.sin(x*13/s+ph)*Math.cos(z*11/s+ph*2); p.setXYZ(k,x*sx*j,y*sy*j,z*sz*j); } g.computeVertexNormals();
    const m=new THREE.Mesh(g,pick(rockM)); const a=rand(0,6.28), r=rand(3.5,15); m.position.set(Math.cos(a)*r,s*0.3,Math.sin(a)*r*0.8-2.5); m.rotation.set(rand(0,3),rand(0,3),rand(0,3)); env.add(m); }
  const dirtT=(()=>{ const c=document.createElement('canvas'); c.width=c.height=128; const g=c.getContext('2d'); const gr=g.createRadialGradient(64,64,4,64,64,62); gr.addColorStop(0,'rgba(42,32,20,.9)'); gr.addColorStop(1,'rgba(42,32,20,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); for(let i=0;i<300;i++){ g.fillStyle=`rgba(${pick(['20,16,10','60,48,30','10,8,6'])},${rand(.2,.6)})`; g.fillRect(rand(10,118),rand(10,118),rand(1,4),rand(1,4)); } return new THREE.CanvasTexture(c); })();
  const dm=new THREE.MeshLambertMaterial({map:dirtT,transparent:true,depthWrite:false});
  for(let i=0;i<22;i++){ const p=new THREE.Mesh(new THREE.PlaneGeometry(rand(1.5,4),rand(1.5,4)),dm); p.rotation.x=-Math.PI/2; p.rotation.z=rand(0,6); p.position.set(rand(-12,12),0.005+i*0.0005,rand(-9,4)); env.add(p); }
  // poças que refletem o fogo
  const pud=new THREE.MeshPhongMaterial({color:0x0a0c10,shininess:140,specular:0xff8a40,transparent:true,opacity:0.85});
  for(const [x,z,s] of [[-2.2,1.4,1.2],[3.4,0.6,0.9],[-5.2,-0.4,1.6]]){ const p=new THREE.Mesh(new THREE.CircleGeometry(s,20),pud); p.rotation.x=-Math.PI/2; p.scale.y=0.6; p.position.set(x,0.012,z); env.add(p); }
  // entulho: tijolos, tábuas e cápsulas
  const brick=new THREE.MeshLambertMaterial({color:0x5a2e22}), plank=new THREE.MeshLambertMaterial({color:0x3e2c1c}), brass=new THREE.MeshPhongMaterial({color:0xb08a3a,shininess:80});
  for(let i=0;i<40;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.07,0.11),brick); b.position.set(rand(-9,9),0.035,rand(-7,3)); b.rotation.set(rand(-.3,.3),rand(0,6),rand(-.3,.3)); env.add(b); }
  for(let i=0;i<14;i++){ const b=new THREE.Mesh(new THREE.BoxGeometry(rand(0.6,1.6),0.035,0.12),plank); b.position.set(rand(-9,9),0.02,rand(-7,2)); b.rotation.y=rand(0,6); env.add(b); }
  for(let i=0;i<30;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.006,0.03,6),brass); b.rotation.z=Math.PI/2; b.rotation.y=rand(0,6); b.position.set(rand(-3,3),0.006,rand(-2,2.5)); env.add(b); }
  // arame farpado num poste
  const wireM=new THREE.MeshBasicMaterial({color:0x2a2622}); for(const x of [-9.5,-6.5,6.8,9.6]){ const p=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,1.2,6),plank); p.position.set(x,0.6,-1.5+Math.sin(x)*0.5); env.add(p); }
  for(const [a,b] of [[-9.5,-6.5],[6.8,9.6]]) for(const y of [0.5,0.85,1.1]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,b-a,4),wireM); w.rotation.z=Math.PI/2; w.position.set((a+b)/2,y-Math.random()*0.05,-1.5); env.add(w); }
}
/* ---- logo DEAD BUNKER no menu principal ---- */
v9Css(`.dblogo{position:relative;font-family:Impact,'Haettenschweiler','Arial Narrow Bold',sans-serif;line-height:.84;margin:2px 0 16px;user-select:none;pointer-events:none;animation:dbIn 1.1s cubic-bezier(.2,.8,.2,1) both}
.dblogo .d1,.dblogo .d2{display:block;font-size:clamp(40px,4.6vw,70px);letter-spacing:.035em}
.dblogo .d1{color:#ece4d2;text-shadow:0 3px 0 #000,0 0 26px rgba(0,0,0,.7)}
.dblogo .d2{color:#b8231b;-webkit-text-stroke:1px #2a0705;text-shadow:0 3px 0 #120302,0 0 22px rgba(190,30,20,.35);transform:translateX(.08em)}
.dblogo i{position:absolute;left:.2em;bottom:-8px;width:58%;height:3px;background:linear-gradient(90deg,#b8231b,rgba(184,35,27,0));box-shadow:0 0 10px rgba(184,35,27,.5)}
.dblogo i::after{content:'';position:absolute;left:22%;top:2px;width:3px;height:12px;border-radius:0 0 3px 3px;background:#8e1912;animation:dbDrip 4s ease-in infinite}
@keyframes dbIn{from{opacity:0;transform:translateY(-10px);filter:blur(6px)}to{opacity:1;transform:none;filter:none}}
@keyframes dbDrip{0%,60%{height:0}85%{height:16px;opacity:1}100%{height:18px;opacity:0}}`);

/* ---- menu: botões "+" ao lado do personagem para chamar amigos (abre o painel de amigos/grupo) ---- */
v9Css(`.sqplus{position:absolute;transform:translate(-50%,-50%);pointer-events:auto;width:58px;height:58px;border-radius:50%;border:2px dashed rgba(236,228,210,.45);background:rgba(10,6,6,.45);color:#ece4d2;font-size:34px;line-height:50px;text-align:center;cursor:pointer;transition:transform .18s,border-color .18s,background .18s;backdrop-filter:blur(2px)}
.sqplus:hover{transform:translate(-50%,-50%) scale(1.12);border-color:#c8241b;border-style:solid;background:rgba(200,36,27,.25)}
.sqplus small{position:absolute;left:50%;top:100%;transform:translateX(-50%);margin-top:6px;font-size:11px;line-height:1;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;color:#a8998a;opacity:0;transition:opacity .18s}
.sqplus:hover small{opacity:1}`);
const SQP={els:[],v:new THREE.Vector3()};
v9On('always',()=>{ try{
  const tags=document.getElementById('squadtags'), menu=document.getElementById('menu'); if(!tags) return;
  const on=menu&&!menu.hidden&&typeof CP!=='undefined'&&CP.mode==='squad'&&CP.cam&&CP.squad&&CP.squad.length<4;
  const free=on?[[1.15,-0.35],[-1.15,-0.35],[2.25,-0.75]].slice(CP.squad.length-1,CP.squad.length+1):[];
  while(SQP.els.length<free.length){ const b=document.createElement('button'); b.type='button'; b.className='sqplus'; b.innerHTML='+<small>Chamar amigos</small>'; b.title='Chamar amigos'; b.addEventListener('click',e=>{ e.stopPropagation(); try{ Snd.ui('tab'); }catch(_){} try{ openSocial(); }catch(_){} }); SQP.els.push(b); }
  const host=document.getElementById('squadstage'), W=host?host.clientWidth:innerWidth, H=host?host.clientHeight:innerHeight;
  SQP.els.forEach((b,i)=>{ if(i>=free.length){ b.remove(); return; } if(b.parentNode!==tags) tags.appendChild(b);
    SQP.v.set(free[i][0],1.0,free[i][1]).project(CP.cam); b.style.left=((SQP.v.x+1)/2*W)+'px'; b.style.top=((1-SQP.v.y)/2*H)+'px'; });
}catch(e){} });
