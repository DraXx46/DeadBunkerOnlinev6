P=[]
# --- intro overlay (HTML + CSS)
P.append(('<div id="loading">CARREGANDO O BUNKER…</div>',
'''<div id="loading">CARREGANDO O BUNKER…</div>
<div id="intro" aria-hidden="true"><video id="introv" src="intro.mp4" muted playsinline preload="auto"></video><p class="intro-skip">clique ou aperte qualquer tecla para pular</p></div>'''))
P.append(('#loading{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1;color:var(--muted);letter-spacing:.2em;font-size:13px}',
'''#loading{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:1;color:var(--muted);letter-spacing:.2em;font-size:13px}
#intro{position:fixed;inset:0;z-index:300;background:#000;display:flex;align-items:center;justify-content:center;opacity:1;transition:opacity 1.6s ease;cursor:pointer}
#intro video{width:100%;height:100%;object-fit:contain;background:#000}
#intro.out{opacity:0;pointer-events:none}
#intro .intro-skip{position:absolute;right:22px;bottom:16px;margin:0;font:11px "Special Elite","Courier New",monospace;letter-spacing:.18em;text-transform:uppercase;color:#3c3a36;opacity:0;transition:opacity 1s ease 2.5s}
#intro.playing .intro-skip{opacity:1}
body.menu-fadein .screen:not([hidden]){animation:mmFadeIn 1.6s ease both}
@keyframes mmFadeIn{from{opacity:0;filter:blur(3px)}to{opacity:1;filter:none}}'''))
# --- menu music file
P.append(("['m','audio/menu.mp3']","['m','audio/menu_rend.mp3']"))
# --- splash removed (the intro video replaces it)
P.append(("function showSplash(){ if(window.__splashDone) return; window.__splashDone=true;",
"function showSplash(){ window.__splashDone=true; return; /* v9: a vinheta foi trocada pela intro em vídeo (introInit) */"))
# --- master chain: compressor + brickwall limiter; watchdog rebuilds the whole sfx bus
P.append(("""    comp=ctx.createDynamicsCompressor(); comp.threshold.value=-10; comp.knee.value=10; comp.ratio.value=4; comp.attack.value=0.003; comp.release.value=0.12;
    if(!pre){ pre=ctx.createGain(); pre.gain.value=0.72; } try{ pre.disconnect(); }catch(e){}
    master.connect(pre); pre.connect(comp); comp.connect(ctx.destination);
    if(!ana){ ana=ctx.createAnalyser(); ana.fftSize=256; anaBuf=new Float32Array(256); } comp.connect(ana);""",
"""    if(lim){ try{ lim.disconnect(); }catch(e){} }
    // v9: glue compressor + brickwall limiter. Muitos sons ao mesmo tempo agora são achatados com suavidade em vez de estourar o mix
    comp=ctx.createDynamicsCompressor(); comp.threshold.value=-14; comp.knee.value=8; comp.ratio.value=5; comp.attack.value=0.002; comp.release.value=0.22;
    lim=ctx.createDynamicsCompressor(); lim.threshold.value=-2; lim.knee.value=0; lim.ratio.value=20; lim.attack.value=0.0008; lim.release.value=0.09;
    if(!pre){ pre=ctx.createGain(); pre.gain.value=0.72; } try{ pre.disconnect(); }catch(e){}
    master.connect(pre); pre.connect(comp); comp.connect(lim); lim.connect(ctx.destination);
    if(!ana){ ana=ctx.createAnalyser(); ana.fftSize=256; anaBuf=new Float32Array(256); } lim.connect(ana);"""))
P.append(("let comp=null,pre=null,ana=null,anaBuf=null,IRs=null,verb=null,lastShotT=-9,shotLoad=0,gunVoices=[];",
"let comp=null,lim=null,pre=null,ana=null,anaBuf=null,IRs=null,verb=null,lastShotT=-9,shotLoad=0,gunVoices=[];\n  const VB={load:0,t:0,cap:64,null:null}; let PRIO=0;"))
P.append(("""    if(bad){ buildMaster(); buildVerb(); }""",
"""    if(bad){ // v9: um NaN envenena filtros para sempre; refaz o barramento de efeitos inteiro (não só o master) e volta em 1 quadro
      try{ sfx.disconnect(); mf.disconnect(); }catch(e){} sfx=ctx.createGain(); mf=ctx.createBiquadFilter(); mf.type='lowpass'; mf.frequency.value=22000; sfx.connect(mf); mf.connect(master);
      buildMaster(); buildVerb(); VB.load=0; }"""))
P.append(("""  function outNode(vol,pan,wet,lp,dest){
    vol=fin(vol,0); pan=fin(pan,0); wet=fin(wet,0); lp=lp==null?null:fin(lp,null);""",
"""  function outNode(vol,pan,wet,lp,dest){
    vol=fin(vol,0); pan=fin(pan,0); wet=fin(wet,0); lp=lp==null?null:fin(lp,null);
    // v9: orçamento global de vozes. Cada som novo soma 1 à "carga", que escoa ~2,4/s. Acima do teto, sons distantes/secundários são
    // descartados (nunca a interface, as habilidades, nem os tiros do próprio jogador) — antes o motor de áudio do navegador engasgava e calava tudo
    { const tn=ctx.currentTime; VB.load=VB.load*Math.exp(-(tn-VB.t)*2.4); VB.t=tn;
      if(!PRIO&&dest!==master&&BUS!==VOLS.ui){ if(VB.load>VB.cap||(VB.load>VB.cap*0.7&&vol<0.25)){ if(!VB.null) VB.null=ctx.createGain(); return VB.null; } }
      VB.load+=PRIO?0.4:1; }"""))
P.append(("""  function burst(dest,o){
    const t0=""","""  function burst(dest,o){
    if(dest===VB.null) return;
    const t0="""))
P.append(("""  function osc(dest,o){
    const t0=""","""  function osc(dest,o){
    if(dest===VB.null) return;
    const t0="""))
P.append(("""  function gunshot(kind,up,vol,x,z){ if(!ctx) return; try{ gunshot0(kind,up,vol,x,z); }catch(e){} }""",
"""  function gunshot(kind,up,vol,x,z){ if(!ctx) return; if(x==null) PRIO++; try{ gunshot0(kind,up,vol,x,z); }catch(e){} finally{ if(x==null) PRIO--; } }"""))
# --- recorded samples
P.append(("""  function setBus(k,v){ VOLS[k]=v; }""",
"""  function setBus(k,v){ VOLS[k]=v; }
  /* v9: amostras gravadas (audio/sfx/*.mp3) — carregadas sob demanda, com teto de vozes, espacialização e fade-out.
     sample(nome|[nomes], {vol, x, z, range, rate, loop, master, prio, wet}) → {stop(fade), src} ou null (ainda carregando) */
  const SMP={buf:{},req:{},live:[]};
  const SMP_PRELOAD=['dog_growl1','dog_growl2','dog_growl3','dog_die_knife1','dog_die_knife2','dog_die_shot','knife_wall_tip','knife_wall_blade','padre_ability','padre_ult','medic_ult','helmet_ping','crossbow_shot','crossbow_reload','timewarp','car_start','boss_roar','shield_break','roulette_spin','slot_ding','reward_pop','perk_jingle_rev','perk_jingle_mule'];
  function smpLoad(n){ if(!ctx||SMP.buf[n]||SMP.req[n]) return; SMP.req[n]=1;
    fetch('audio/sfx/'+n+'.mp3').then(r=>r.ok?r.arrayBuffer():null).then(ab=>ab&&new Promise((res,rej)=>{ try{ const p=ctx.decodeAudioData(ab,res,rej); if(p&&p.then) p.then(res,rej); }catch(e){ rej(e); } })).then(b=>{ if(b) SMP.buf[n]=b; else SMP.req[n]=2; }).catch(()=>{ SMP.req[n]=2; }); }
  function hasSample(n){ return !!SMP.buf[n]; }
  function sample(n,o){ o=o||{}; if(!ctx) return null; if(Array.isArray(n)){ const ok=n.filter(k=>SMP.buf[k]); n.forEach(smpLoad); if(!ok.length) return null; n=pick(ok); }
    const b=SMP.buf[n]; if(!b){ smpLoad(n); return null; }
    const tn=now(); SMP.live=SMP.live.filter(h=>h.end>tn&&!h.dead); if(SMP.live.length>=22&&!o.prio) return null;
    let v=o.vol==null?1:o.vol, pan=0, lp=null; if(o.x!=null){ const sp=spatial(o.x,o.z,o.range||40); if(sp.vol<0.01&&!o.loop) return null; v*=Math.max(o.minVol||0,sp.vol); pan=sp.pan; lp=sp.lp; }
    if(o.prio) PRIO++; let out; try{ out=outNode(v,pan,o.wet==null?0.25:o.wet,lp,o.master?master:undefined); }finally{ if(o.prio) PRIO--; }
    if(out===VB.null) return null;
    const s=ctx.createBufferSource(); s.buffer=b; s.loop=!!o.loop; s.playbackRate.value=o.rate||1; const g=ctx.createGain(); g.gain.value=1; s.connect(g); g.connect(out);
    const off=o.offset||0; s.start(tn,off); const h={src:s,g,end:o.loop?1e9:tn+(b.duration-off)/(o.rate||1),dead:false,x:o.x,z:o.z,range:o.range,base:o.vol==null?1:o.vol,
      stop(fade){ if(h.dead) return; h.dead=true; const t=now(), f=Math.max(0.01,fade||0.05); try{ g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value,t); g.gain.linearRampToValueAtTime(0.0001,t+f); s.stop(t+f+0.02); }catch(e){} } };
    s.onended=()=>{ h.dead=true; }; SMP.live.push(h); return h; }"""))
P.append(("""    ui,setBus,init,setVol,setMusicVol,startMusic,stopMusic,casing,reload,rl,step,zvoice,impact,setMap,""",
"""    ui,setBus,init,setVol,setMusicVol,startMusic,stopMusic,casing,reload,rl,step,zvoice,impact,setMap,sample,hasSample,
    get ctx(){ return ctx; }, get now(){ return ctx?ctx.currentTime:0; }, out(v,pan,wet,lp){ return ctx?outNode(v,pan,wet,lp):null; }, burstTo(o,b){ if(ctx&&o) burst(o,b); }, oscTo(o,b){ if(ctx&&o) osc(o,b); }, prio(fn){ PRIO++; try{ return fn(); }finally{ PRIO--; } },"""))
P.append(("""    ambient(); setMap(mapKey);
  }""","""    ambient(); setMap(mapKey);
    for(const n of SMP_PRELOAD) smpLoad(n);
  }"""))
