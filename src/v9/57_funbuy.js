/* Parque 4FUN: tecla B abre o menu de compra do X1 com dinheiro infinito. */
const FBUY={open:false};
{ const st=document.createElement('style'); st.textContent=`body.fbuy #clickhint,body.fbuy .v9poolhint{display:none!important}
#x1buy.fun .vb-grid section h4{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:.04em}`; document.head.appendChild(st); }
function funBuyCats(){ const seen=new Set(X1_CATS.flatMap(c=>c[1])); const extra=Object.keys(WEAPONS).filter(k=>!seen.has(k)&&k!=='xbow'&&WEAPONS[k]&&WEAPONS[k].name);
  return extra.length?X1_CATS.concat([['Outras',extra]]):X1_CATS; }
function funBuyRender(){ const el=$('#x1buy'); if(!el) return; el.hidden=!FBUY.open; el.classList.toggle('fun',FBUY.open); document.body.classList.toggle('fbuy',FBUY.open); if(!FBUY.open) return;
  const TH=x1Thumbs(), cur=curSlot(), own=new Set(Wp.inv.map(s=>s.id));
  let h=`<div class="vb-top"><div class="vb-k"><small>DINHEIRO</small><b class="vb-money">∞</b></div><div class="vb-k"><small>MODO</small><b>PARQUE 4FUN</b></div><button type="button" class="vb-close" data-fclose="1">Fechar · B</button></div><div class="vb-grid">`;
  for(const [cat,ids] of funBuyCats()){ h+=`<section><h4>${cat}</h4>`;
    for(const id of ids){ const w=WEAPONS[id]; if(!w) continue; const has=own.has(id), dps=w.dmg*(w.pellets||1);
      h+=`<button type="button" class="vb-card${has?' own':''}" data-fbuy="${id}" title="${has?'Recarregar munição':'Pegar'}">${TH[id]?`<img alt="" src="${TH[id]}">`:'<span class="vb-ph"></span>'}<span class="vb-n">${w.name}</span><span class="vb-p">${has?(cur&&cur.id===id?'NA MÃO · RECARREGAR':'EQUIPADA'):'GRÁTIS'}</span><span class="vb-st"><span>Dano</span>${x1Bar(Math.log(1+dps)/Math.log(1+650))}<span>Cadência</span>${x1Bar((w.rpm||60)/1000)}<span>Precisão</span>${x1Bar(1-(w.spread||0)*12)}<span>Pente</span>${x1Bar((w.mag||1)/75)}</span></button>`; }
    h+='</section>'; }
  h+='</div><p class="vb-foot">Dinheiro infinito · clique para pegar a arma · clicar numa arma que você já tem enche a munição</p>';
  el.innerHTML=h; }
function funBuyOpen(){ if(CUR!=='fun'||G.state!=='playing') return; FBUY.open=true; IN.fire=false; IN.ads=false; for(const k in keys) keys[k]=false; funThumbQueue(); funBuyRender(); if(document.pointerLockElement) document.exitPointerLock(); }
// miniaturas das armas (as do X1 + as que só existem fora dele), geradas uma por quadro enquanto o menu está aberto
function funThumbQueue(){ x1Thumbs(); if(!FBUY.q){ FBUY.q=1; for(const [,ids] of funBuyCats()) for(const id of ids) if(!X1_THUMB[id]&&!X1_THQ.includes(id)) X1_THQ.push(id); } }
function funBuyClose(lock){ const was=FBUY.open; FBUY.open=false; const el=$('#x1buy'); if(el){ el.hidden=true; el.classList.remove('fun'); } document.body.classList.remove('fbuy'); if(was&&lock&&CUR==='fun'&&G.state==='playing') requestLock(); }
function funBuy(id){ if(!WEAPONS[id]) return;
  const isP=id==='m1911'||id==='python';
  const pistol=isP?id:(Wp.inv.find(s=>s.id==='m1911'||s.id==='python')||{}).id||'m1911';
  const prim=isP?((Wp.inv.find(s=>s.id!=='m1911'&&s.id!=='python')||{}).id||null):id;
  try{ if(FUN.tool) funSetTool(null); }catch(e){}
  x1Equip(pistol,prim,!isP); if(isP){ Wp.cur=0; setGunModel(); hudAmmo(); }
  hudAmmo(); Snd.ui('buy'); funBuyRender(); }
document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('#x1buy button'); if(!b||CUR!=='fun') return; e.stopPropagation(); e.stopImmediatePropagation();
  if(b.dataset.fclose) funBuyClose(true); else if(b.dataset.fbuy) funBuy(b.dataset.fbuy); },true);
addEventListener('keydown',e=>{ if(CUR!=='fun'||G.state!=='playing'||e.repeat) return; if(typeof CON!=='undefined'&&CON.open) return;
  const ae=document.activeElement; if(ae&&/INPUT|TEXTAREA|SELECT/.test(ae.tagName)&&ae.offsetParent!==null) return;
  if(e.code==='KeyB'){ if(FBUY.open) funBuyClose(true); else funBuyOpen(); e.preventDefault(); e.stopImmediatePropagation(); return; }
  if(FBUY.open&&e.code==='Escape'){ funBuyClose(true); e.preventDefault(); e.stopImmediatePropagation(); } },true);
v9On('always',()=>{ if(!FBUY.open) return; if(CUR!=='fun'||G.state!=='playing'){ funBuyClose(false); return; }
  if(X1_THQ&&X1_THQ.length){ x1ThumbStep(); const n=Object.keys(X1_THUMB).length; if(n!==FBUY.nth){ FBUY.nth=n; funBuyRender(); } } });
// abrir o menu solta o mouse: isso não pode pausar o jogo
{ const np0=v9NoPause; v9NoPause=function(){ return FBUY.open||np0(); }; }
