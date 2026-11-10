P=[]
P.append(("""/* ================= REAL ASSETS (Poly Haven, CC0): baked models and PBR surface textures =================""",
"""/* ================= v9 · INTRO EM VÍDEO =================
   Toca assim que a página abre (o jogo carrega por trás). A música do menu (REND · Tom Meira Armony) entra exatamente em 17:10
   da intro (17 s + 10 quadros a 30 fps). No fim, o menu aparece com fade in. Clique/tecla pulam (depois do 1º segundo). */
const INTRO={done:false,musicAt:17+10/30,musicFired:false,ready:false};
function introFireMusic(){ if(INTRO.musicFired) return; INTRO.musicFired=true; try{ Snd.init(); Snd.startMusic(); }catch(e){} }
function introInit(){
  const el=document.getElementById('intro'), v=document.getElementById('introv');
  if(!el||!v){ INTRO.done=true; return; }
  let finQ=false;
  const fin=()=>{ if(INTRO.done) return; INTRO.done=true; introFireMusic(); el.classList.add('out'); document.body.classList.add('menu-fadein'); setTimeout(()=>{ try{ el.remove(); }catch(e){} document.body.classList.remove('menu-fadein'); },1700); };
  const finWhenReady=()=>{ if(finQ) return; finQ=true; const w=()=>{ if(INTRO.ready) fin(); else setTimeout(w,120); }; w(); };
  const poll=()=>{ if(INTRO.done) return; if(v.currentTime>=INTRO.musicAt) introFireMusic(); requestAnimationFrame(poll); }; requestAnimationFrame(poll);
  v.addEventListener('playing',()=>el.classList.add('playing'));
  v.addEventListener('ended',finWhenReady); v.addEventListener('error',finWhenReady);
  try{ const p=v.play(); if(p&&p.catch) p.catch(()=>finWhenReady()); }catch(e){ finWhenReady(); }
  setTimeout(()=>{ if(!INTRO.done&&(v.readyState<2||v.currentTime<0.05)) finWhenReady(); },6000);   // vídeo não carregou: segue para o menu
  const skip=e=>{ if(INTRO.done) return; if(v.currentTime<1.0&&!v.error) return; finWhenReady(); if(e&&e.type==='keydown'){ e.stopPropagation(); } removeEventListener('keydown',skip,true); };
  el.addEventListener('pointerdown',skip); addEventListener('keydown',skip,true);
}
introInit();

/* ================= REAL ASSETS (Poly Haven, CC0): baked models and PBR surface textures ================="""))
P.append(("""  G.state='menu'; $('#loading').hidden=true; applyCfg();""","""  G.state='menu'; INTRO.ready=true; $('#loading').hidden=true; applyCfg();"""))
