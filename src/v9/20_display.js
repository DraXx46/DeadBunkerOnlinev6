/* ================= v9 · MODO DE TELA E RESOLUÇÃO =================
   Opções de vídeo: modo de tela (tela cheia, janela, janela maximizada) e resolução.
   No launcher a janela muda de verdade (e o jogo já abre em tela cheia). No navegador, tela cheia pelo próprio navegador
   (no primeiro clique, porque o navegador exige um clique) e a resolução vira a resolução de desenho do jogo. */
const DISP={mode:'full',res:'native',asked:false};
try{ Object.assign(DISP,JSON.parse(localStorage.getItem('db_display')||'{}')); }catch(e){}
const RES_LIST=[['native','Nativa da tela'],['3840x2160','3840 × 2160 (4K)'],['2560x1440','2560 × 1440'],['1920x1080','1920 × 1080'],['1600x900','1600 × 900'],['1366x768','1366 × 768'],['1280x720','1280 × 720']];
function dispSave(){ try{ localStorage.setItem('db_display',JSON.stringify({mode:DISP.mode,res:DISP.res})); }catch(e){} }
function dispWH(){ const m=/^(\d+)x(\d+)$/.exec(DISP.res||''); return m?[+m[1],+m[2]]:null; }
// resolução de desenho: em tela cheia (ou no navegador) a resolução escolhida vira a densidade de pixels do jogo
const _prTarget=prTarget; prTarget=function(){ const wh=dispWH(); if(!wh||(window.deadBunker&&DISP.mode==='window')) return _prTarget();
  const pr=Math.max(0.35,Math.min(3,wh[0]/Math.max(320,innerWidth)))*CFG.quality; return CFG.potato?Math.min(pr,0.8):pr; };
function dispApplyRender(){ try{ renderer.setPixelRatio(prTarget()); resize(); }catch(e){} }
addEventListener('resize',()=>{ if(dispWH()) dispApplyRender(); });
function dispFullBrowser(on){ try{ if(on&&!document.fullscreenElement) return document.documentElement.requestFullscreen({navigationUI:'hide'}).catch(()=>{}); if(!on&&document.fullscreenElement) return document.exitFullscreen().catch(()=>{}); }catch(e){} }
function dispApply(){ dispSave(); dispApplyRender();
  const wh=dispWH()||[0,0];
  if(window.deadBunker&&window.deadBunker.setDisplay){ try{ window.deadBunker.setDisplay({mode:DISP.mode,w:wh[0],h:wh[1]}); }catch(e){} }
  else dispFullBrowser(DISP.mode==='full'); }
// navegador: pede tela cheia no primeiro clique/tecla (o vídeo de abertura não conta, ele não aceita cliques)
function dispFirstGesture(){ if(DISP.asked||window.deadBunker) return; if(document.getElementById('v9intro')) return; DISP.asked=true; if(DISP.mode==='full') dispFullBrowser(true); }
addEventListener('pointerdown',dispFirstGesture,true); addEventListener('keydown',e=>{ if(e.key!=='Escape') dispFirstGesture(); },true);
// launcher: lê o modo atual guardado nele
if(window.deadBunker&&window.deadBunker.getDisplay){ window.deadBunker.getDisplay().then(d=>{ if(d&&d.mode){ DISP.mode=d.mode; if(d.w&&d.h&&DISP.mode==='window') DISP.res=d.w+'x'+d.h; dispSave(); dispUiSync(); } }).catch(()=>{}); }
dispApplyRender();
// controles na aba Vídeo
function dispUiSync(){ const m=document.getElementById('v9-dmode'), r=document.getElementById('v9-dres'); if(m) m.value=DISP.mode; if(r) r.value=DISP.res; }
(function(){ const box=document.querySelector('.setp[data-st="video"]'); if(!box||document.getElementById('v9-dmode')) return;
  const wrap=v9El('div','v9disp',`<label class="v9sel"><span>Modo de tela</span><select id="v9-dmode"><option value="full">Tela cheia</option><option value="window">Janela</option><option value="max">Janela maximizada</option></select></label>
  <label class="v9sel"><span>Resolução</span><select id="v9-dres">${RES_LIST.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>
  <p class="v9dhint">${window.deadBunker?'F11 também alterna a tela cheia.':'No navegador, a tela cheia pede um clique; Esc sai dela.'}</p>`);
  box.prepend(wrap); dispUiSync();
  wrap.querySelector('#v9-dmode').addEventListener('change',e=>{ DISP.mode=e.target.value; dispApply(); try{ Snd.ui('tab'); }catch(_){} });
  wrap.querySelector('#v9-dres').addEventListener('change',e=>{ DISP.res=e.target.value; dispApply(); try{ Snd.ui('tab'); }catch(_){} });
  document.addEventListener('fullscreenchange',()=>{ if(!window.deadBunker&&!document.fullscreenElement&&DISP.mode==='full'){ /* saiu com Esc: mantém a escolha, mas não força de novo */ } });
})();
v9Css(`.v9disp{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:12px}.v9sel{display:flex;flex-direction:column;gap:5px}.v9sel span{font-size:13px;color:var(--muted,#a89a88)}
.v9sel select{background:#120d0b;color:#ece4d2;border:1px solid #3a2a22;padding:8px 10px;font:inherit;font-size:14px}.v9sel select:focus{outline:1px solid #c8241b}
.v9dhint{grid-column:1/-1;margin:0;font-size:11px;color:#6d5f54}`);
