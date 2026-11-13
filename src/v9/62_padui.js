/* ================= v9 · MENUS NO DUALSENSE =================
   · L1/R1: troca a categoria do menu principal (Jogar, Personagens, Inventário, Loja, Passe, Desafios, Config., Ajuda, Extras)
     — fora do menu principal trocam as abas da tela; L2/R2: abas internas (Áudio/Vídeo…, Caixas/Vitrine…, Perfil/História) e páginas
   · ○ volta/fecha qualquer janela (inclusive Passe e Desafios) · □ resgata recompensas · △ compra/desbloqueia/abre · OPTIONS abre as configurações
   · Personagens: o foco já mostra o personagem, analógico direito gira o boneco, △ troca o visual, □/✕ seleciona; vibração diferente
     para personagem liberado, bloqueado e ao equipar
   · ícones dos botões nas próprias ações e uma legenda no canto com o que cada botão faz na tela atual
   · vibração leve ao mover o foco, média ao trocar de aba/categoria, forte ao confirmar compra/equipar */
const PUI={cat:0,switching:false,legT:0,scanT:0,rotT:0,chId:null,chT:0,lastLeg:''};
v9Css(`.pg.sh{width:auto;min-width:1.9em;padding:0 .35em;border-radius:.45em;font-size:.72em;letter-spacing:.02em;color:#e9e4da}
#padleg{position:fixed;right:16px;bottom:12px;z-index:9000;display:none;gap:14px;align-items:center;padding:8px 14px;border-radius:999px;background:rgba(8,8,10,.78);border:1px solid rgba(255,255,255,.12);
  font:600 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif;color:#ece6da;pointer-events:none;backdrop-filter:blur(6px);box-shadow:0 6px 24px rgba(0,0,0,.45)}
body.padmode #padleg.on{display:flex}
#padleg span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.pgmt{display:none;align-self:center;margin:0 6px;opacity:.9}
body.padmode .pgmt{display:inline-flex}
body.padmode [data-pgk]::before{content:attr(data-pgk);display:inline-flex;align-items:center;justify-content:center;width:1.45em;height:1.45em;border-radius:50%;border:2px solid currentColor;
  font-size:.8em;font-weight:800;line-height:1;margin-right:.5em;vertical-align:-.2em;background:rgba(0,0,0,.45);flex:none}
body.padmode [data-pgk="○"]::before{color:#ff7474;border-color:#ff7474}
body.padmode [data-pgk="□"]::before{color:#ff86d8;border-color:#ff86d8}
body.padmode [data-pgk="△"]::before{color:#5ee6a8;border-color:#5ee6a8}
body.padmode .tabs.pgtabs{position:relative}
body.padmode .tabs.pgtabs::before,body.padmode .tabs.pgtabs::after{content:"L2";display:inline-flex;align-items:center;padding:0 .4em;height:1.5em;border-radius:.4em;border:2px solid #e9e4da;color:#e9e4da;
  font:800 10px/1 system-ui,sans-serif;align-self:center;margin:0 6px;opacity:.85}
body.padmode .tabs.pgtabs::after{content:"R2"}
body.padmode .chc.padfocus{transform:translateX(6px);transition:transform .12s}
.pgcat{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:9001;padding:8px 18px;border-radius:999px;background:rgba(10,8,8,.82);border:1px solid rgba(244,192,58,.5);
  color:#f4c03a;font:700 13px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;pointer-events:none;animation:pgcat 1.1s ease forwards}
@keyframes pgcat{0%{opacity:0;transform:translate(-50%,-6px)}12%{opacity:1;transform:translate(-50%,0)}75%{opacity:1}100%{opacity:0}}`);
const PGK={X:'<i class="pg x">✕</i>',O:'<i class="pg o">○</i>',SQ:'<i class="pg sq">□</i>',TRI:'<i class="pg tri">△</i>',L1:'<i class="pg sh">L1</i>',R1:'<i class="pg sh">R1</i>',L2:'<i class="pg sh">L2</i>',R2:'<i class="pg sh">R2</i>',OPT:'<i class="pg sh">☰</i>',RS:'<i class="pg sh">R</i>'};
const PUI_LEG=document.createElement('div'); PUI_LEG.id='padleg'; document.body.appendChild(PUI_LEG);
// L1/R1 nas pontas da barra de categorias
{ const m=document.querySelector('.mtabs'); if(m){ const a=document.createElement('span'); a.className='pgmt'; a.innerHTML=PGK.L1; const b=document.createElement('span'); b.className='pgmt'; b.innerHTML=PGK.R1; m.insertBefore(a,m.firstChild); m.appendChild(b); } }
/* ---- vibração ---- */
function puiHap(k){ if(!PAD.active) return; const R=(s,w,ms,d)=>d?setTimeout(()=>padRumble(s,w,ms),d):padRumble(s,w,ms);
  if(k==='tick') R(0,0.16,22); else if(k==='tab') R(0.12,0.34,38); else if(k==='cat'){ R(0.22,0.45,45); R(0,0.25,30,70); }
  else if(k==='back') R(0.08,0.22,30); else if(k==='ok') R(0.3,0.5,50);
  else if(k==='lock'){ R(0.35,0,45); R(0.35,0,45,95); }
  else if(k==='equip'){ R(0.9,0.45,90); R(0.4,0.85,140,120); }
  else if(k==='buy'){ R(0.6,0.6,70); R(0.2,0.9,180,90); }
  else if(k==='claim'){ R(0.3,0.7,60); R(0.5,0.9,80,110); R(0.2,0.6,160,230); }
  else if(k==='char'){ R(0.18,0.4,40); } }
{ const pf0=padFocus; padFocus=function(el){ const prev=PAD.nav.el; const r=pf0.apply(this,arguments); if(el&&el!==prev&&PAD.active){
    if(el.classList&&el.classList.contains('chc')) puiCharFocus(el); else puiHap('tick'); } return r; }; }
/* ---- o que dá para focar: além de botões, os cartões clicáveis (passe, mapas, inventário) ---- */
{ const pfs0=padFocusables; padFocusables=function(){ const L=pfs0.apply(this,arguments); const extra=[...document.querySelectorAll('.tile[data-t],.mapc,[data-vit],.mt,[data-w]:not(button),[data-srev]:not(button)')].filter(e=>!L.includes(e)&&padVisible(e)); return extra.length?L.concat(extra):L; }; }
/* ---- camada do topo e botões por função ---- */
const PUI_TXT={back:/^(fechar|voltar|cancelar|sair|×|✕|close)$/i, claim:/(resgat|coletar|receber|pegar tudo)/i, buy:/^(comprar|desbloquear|abrir|liberar)\b/i};
function puiBtns(){ return [...document.querySelectorAll('button,[data-a]')].filter(b=>!b.disabled&&padVisible(b)); }
function puiFind(kind){ const L=puiBtns(); const t=b=>(b.textContent||'').replace(/\s+/g,' ').trim();
  if(kind==='back'){ const pri=['#bx-close','#set-back','#ars-close','#resume','#kv-close','#ch-back','#iv-back','#ex-close'];
    for(const s of pri){ const e=document.querySelector(s); if(e&&padVisible(e)) return e; }
    return L.find(b=>b.dataset.a==='close')||L.find(b=>b.dataset.snd==='back')||L.find(b=>/(^|-)(close|back)$/.test(b.id||''))||L.find(b=>b.classList.contains('x')||b.classList.contains('close'))||L.find(b=>PUI_TXT.back.test(t(b)))||null; }
  if(kind==='claim'){ return L.find(b=>b.dataset.a==='all')||L.find(b=>b.dataset.a==='claim')||L.find(b=>PUI_TXT.claim.test(t(b)))||null; }
  if(kind==='buy'){ const f=PAD.nav.el; const near=f&&f.closest&&f.closest('.kcard,.card,.tile,.ivi,.item,li,article,section,.chinfo,.box');
    const c=L.filter(b=>PUI_TXT.buy.test(t(b))||b.id==='bx-open'||b.id==='ch-pick'&&/comprar/i.test(t(b)));
    if(near){ const inn=c.find(b=>near.contains(b)); if(inn) return inn; }
    return c.length===1?c[0]:null; }
  return null; }
function puiBack(){ const e=puiFind('back'); if(e){ e.click(); return true; }
  for(const ty of ['keydown','keyup']) dispatchEvent(new KeyboardEvent(ty,{key:'Escape',code:'Escape',bubbles:true})); return false; }
padBack=function(){ puiBack(); };
/* ---- categorias do menu principal ---- */
function puiVis(sel){ const e=document.querySelector(sel); if(!e||e.hidden) return false; const r=e.getBoundingClientRect(); if(r.width<10||r.height<10) return false; return getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'; }
function puiHubClear(){ const e=document.getElementById('tab-play'); return !!e&&padVisible(e); }
function puiCats(){ return [...document.querySelectorAll('.mtabs .mtab')]; }
function puiCurCat(){ if(puiHubClear()) return 0; const ids=puiCats().map(b=>b.id);
  const help=()=>{ const on=document.querySelector('#settabs .on'); return on&&on.dataset.st==='info'; };
  const det={charbtn:()=>puiVis('#chars'),arsbtn:()=>puiVis('#v9inv'),shopbtn:()=>puiVis('#arsenal'),passbtn:()=>puiVis('.v9bp'),chbtn:()=>!!document.querySelector('.v9chp:not(.v9pubw)')&&puiVis('.v9chp:not(.v9pubw)'),setbtn:()=>puiVis('#settings')&&!help(),helpbtn:()=>puiVis('#settings')&&help(),extrabtn:()=>puiVis('#extras')};
  // a última aberta pelo controle tem prioridade (janelas podem estar empilhadas)
  const last=ids[PUI.cat]; if(last&&det[last]&&det[last]()) return PUI.cat;
  for(const k of ['passbtn','chbtn','extrabtn','helpbtn','setbtn','shopbtn','arsbtn','charbtn']){ const i=ids.indexOf(k); if(i>=0&&det[k]&&det[k]()) return i; }
  return -1; }
function puiCatFlash(name){ const d=document.createElement('div'); d.className='pgcat'; d.textContent=name; document.body.appendChild(d); setTimeout(()=>d.remove(),1150); }
function puiCat(d){ if(PUI.switching) return; const cats=puiCats(); if(!cats.length) return false; const cur=puiCurCat(); if(cur<0) return false;
  const n=cats.length, tgt=(cur+d+n)%n; PUI.switching=true; PUI.cat=tgt; puiHap('cat'); try{ Snd.ui('tab'); }catch(e){}
  let tries=0; const step=()=>{ if(!puiHubClear()&&tries<6){ tries++; puiBack(); setTimeout(step,90); return; }
    try{ if(tgt>0) cats[tgt].click(); for(const t of cats) t.classList.toggle('on',t===cats[tgt]); }catch(e){}
    puiCatFlash((cats[tgt].childNodes[0]&&cats[tgt].childNodes[0].textContent||cats[tgt].textContent).trim());
    setTimeout(()=>{ PUI.switching=false; const L=padFocusables(); padFocus(padDefault(L)); },140); };
  step(); return true; }
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('.mtabs .mtab'); if(b){ const i=puiCats().indexOf(b); if(i>=0) PUI.cat=i; } },true);
/* ---- abas internas e páginas ---- */
function puiTabsEl(){ return [...document.querySelectorAll('.tabs')].find(t=>{ const b=t.querySelector('button'); return b&&padVisible(b); })||null; }
function puiSub(d){ const t=puiTabsEl(); if(t){ padTab(d); puiHap('tab'); return true; }
  const L=puiBtns(); const nx=L.find(b=>b.dataset.a===(d>0?'next':'prev'))||L.find(b=>(d>0?/^(›|>|→|próxim)/i:/^(‹|<|←|anterior)/i).test((b.textContent||'').trim()));
  if(nx){ nx.click(); puiHap('tab'); return true; } return false; }
/* ---- personagens ---- */
function puiCharFocus(el){ const id=el.dataset.id; if(!id) return; const owned=(()=>{ try{ return pgOwn(id); }catch(e){ return true; } })();
  puiHap(owned?'char':'lock'); PUI.chId=id; PUI.chT=0.12; }
function puiCharApply(){ const id=PUI.chId; PUI.chId=null; if(id&&typeof chSel!=='undefined'&&chSel!==id){ const b=document.querySelector('#chlist .chc[data-id="'+id+'"]'); if(b) b.click(); } }
function puiCharTick(dt,R){ if(!puiVis('#chars')) return;
  // o foco mostra o personagem (com um respiro para não refazer a tela a cada passo segurado)
  if(PUI.chId){ PUI.chT-=dt; if(PUI.chT<=0) puiCharApply(); }
  // analógico direito gira o boneco
  if(typeof CP!=='undefined'){ if(Math.abs(R[0])>0.15){ if(!CP.drag||CP.drag.pad){ CP.drag={x:0,y0:0,pad:1}; CP.yaw+=R[0]*dt*3.2; PUI.rotT=1.4; } }
    else if(CP.drag&&CP.drag.pad){ PUI.rotT-=dt; if(PUI.rotT<=0) CP.drag=null; } } }
// a lista é refeita a cada clique: devolve o foco ao mesmo personagem/botão
{ const rc0=renderChars; renderChars=function(){ const f=PAD.nav.el, fid=f&&f.dataset&&f.dataset.id, fpid=f&&f.id, inCh=f&&f.closest&&f.closest('#chars');
    const r=rc0.apply(this,arguments);
    if(PAD.active&&inCh){ let n=null; if(fid) n=document.querySelector('#chlist .chc[data-id="'+fid+'"]'); else if(fpid) n=document.getElementById(fpid);
      if(n){ PAD.nav.el=null; f.classList.remove('padfocus'); PAD.nav.el=n; n.classList.add('padfocus'); try{ n.focus({preventScroll:true}); }catch(e){} } }
    return r; }; }
// selecionar/comprar o personagem com vibração própria
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('#ch-pick'); if(!b||!PAD.active) return; puiHap(/comprar/i.test(b.textContent)?'buy':'equip'); },true);
/* ---- legenda e ícones nos botões ---- */
function puiScan(){ const mark=(e,g)=>{ if(e&&e.dataset.pgk!==g){ e.dataset.pgk=g; } };
  for(const e of document.querySelectorAll('[data-pgk]')) if(!padVisible(e)) delete e.dataset.pgk;
  const bk=puiFind('back'), cl=puiFind('claim'), by=puiFind('buy');
  if(bk) mark(bk,'○'); if(cl) mark(cl,'□'); if(by&&by!==cl) mark(by,'△');
  for(const t of document.querySelectorAll('.tabs')) t.classList.toggle('pgtabs',t===puiTabsEl());
  return {bk,cl,by}; }
function puiLegend(ctx){ const it=[]; const hub=G.state==='menu'&&puiCurCat()>=0;
  it.push(PGK.X+' Selecionar'); if(ctx.bk||!puiHubClear()) it.push(PGK.O+' Voltar');
  if(hub) it.push(PGK.L1+PGK.R1+' Categoria');
  if(puiTabsEl()) it.push((hub?PGK.L2+PGK.R2:PGK.L1+PGK.R1)+' Aba');
  else if(puiBtns().some(b=>b.dataset.a==='next')) it.push(PGK.L2+PGK.R2+' Página');
  if(ctx.cl) it.push(PGK.SQ+' Resgatar');
  if(puiVis('#chars')){ it.push(PGK.RS+' Girar'); if(document.querySelector('.chvars')) it.push(PGK.TRI+' Visual'); }
  else if(ctx.by) it.push(PGK.TRI+' '+((ctx.by.textContent||'').trim().split(/\s|·/)[0]||'Comprar'));
  if(G.state==='menu'&&puiHubClear()) it.push(PGK.OPT+' Config.');
  const h=it.map(s=>'<span>'+s+'</span>').join(''); if(h!==PUI.lastLeg){ PUI.lastLeg=h; PUI_LEG.innerHTML=h; } }
/* ---- o controle nos menus (substitui o anterior, mantendo navegação, ✕ e ○) ---- */
padMenus=function(b,was,L,R,dt){ const edge=i=>(b[i]||0)>0.5&&!((was[i]||0)>0.5); const N=PAD.nav;
  let dir=''; if(b[PB.UP]>0.5||L[1]<-0.55) dir='up'; else if(b[PB.DOWN]>0.5||L[1]>0.55) dir='down'; else if(b[PB.LEFT]>0.5||L[0]<-0.55) dir='left'; else if(b[PB.RIGHT]>0.5||L[0]>0.55) dir='right';
  if(dir){ if(dir!==N.dir){ N.dir=dir; N.rep=0.38; padNav(dir); } else { N.rep-=dt; if(N.rep<=0){ N.rep=0.11; padNav(dir); } } } else N.dir='';
  if(N.el&&(!document.contains(N.el)||!padVisible(N.el))){ N.el.classList.remove('padfocus'); N.el=null; }
  N.chk=(N.chk||0)-dt; if(!N.el&&N.chk<=0){ N.chk=0.25; const d=padDefault(padFocusables()); if(d){ PAD.nav.el=d; d.classList.add('padfocus'); try{ d.focus({preventScroll:true}); }catch(e){} } }
  const inChars=puiVis('#chars');
  if(edge(PB.X)){ const e=N.el&&padVisible(N.el)?N.el:null;
    if(e){ if(e.type==='range'){} else if(inChars&&e.classList.contains('chc')){ // ✕ no personagem: seleciona (se precisa comprar, leva o foco ao botão)
        if(PUI.chId) puiCharApply(); else if(e.dataset.id&&typeof chSel!=='undefined'&&chSel!==e.dataset.id) e.click();
        setTimeout(()=>{ const pk=document.getElementById('ch-pick'); if(!pk) return; if(/comprar/i.test(pk.textContent)||pk.disabled){ padFocus(pk); if(pk.disabled) puiHap('lock'); } else pk.click(); },30); }
      else { e.click(); puiHap('ok'); } }
    else padMove('down'); }
  if(edge(PB.O)){ puiBack(); puiHap('back'); }
  if(edge(PB.OPT)){ if(G.state==='paused') resumeGame(); else if(G.state==='lobby'&&LP.on) closeLobbyPause(false); else if(G.state==='menu'&&puiHubClear()){ const s=document.getElementById('setbtn'); if(s){ s.click(); PUI.cat=puiCats().indexOf(s); puiHap('tab'); } } else puiBack(); }
  const hub=G.state==='menu'&&puiCurCat()>=0;
  if(edge(PB.R1)){ if(hub) puiCat(1); else { padTab(1); puiHap('tab'); } }
  if(edge(PB.L1)){ if(hub) puiCat(-1); else { padTab(-1); puiHap('tab'); } }
  if(edge(PB.R2)) puiSub(1); if(edge(PB.L2)) puiSub(-1);
  if(edge(PB.SQ)){ if(inChars){ const pk=document.getElementById('ch-pick'); if(pk&&!pk.disabled) pk.click(); else puiHap('lock'); }
    else { const c=puiFind('claim'); if(c){ c.click(); puiHap('claim'); } } }
  if(edge(PB.TRI)){ if(inChars){ const vs=[...document.querySelectorAll('.chvars .chv')]; if(vs.length>1){ let i=vs.findIndex(v=>v.classList.contains('on')); vs[(i+1)%vs.length].click(); puiHap('tab'); } }
    else { const by=puiFind('buy'); if(by){ by.click(); puiHap('buy'); } } }
  if(inChars) puiCharTick(dt,R);
  else if(Math.abs(R[1])>0.2&&N.el){ let p=N.el.parentElement; while(p&&p!==document.body){ if(p.scrollHeight>p.clientHeight+4&&/(auto|scroll)/.test(getComputedStyle(p).overflowY)){ p.scrollTop+=R[1]*900*dt; break; } p=p.parentElement; } }
  PUI.scanT-=dt; if(PUI.scanT<=0){ PUI.scanT=0.2; try{ puiLegend(puiScan()); }catch(e){} }
  PUI_LEG.classList.add('on'); PUI.legT=0.3; };
v9On('always',dt=>{ if(PUI.legT>0){ PUI.legT-=dt; if(PUI.legT<=0) PUI_LEG.classList.remove('on'); } });
