/* ================= v9 · MIRA (ADS) AJUSTADA ARMA POR ARMA =================
   O ADS automático alinha a linha de mira (topo da alça → topo da massa) com o centro da tela, mas punha o olho a 7 cm
   da alça em quase todas as armas: a alça virava um bloco preto gigante tapando o alvo e a massa sumia atrás dela.
   Aqui cada arma tem a sua distância de olho (o quanto a arma fica "longe do rosto") e, quando a alça é alta demais
   (orelhas, tambor), o quanto a linha desce para o olho olhar pelo meio dela. A Barrett tem a luneta própria (61). */
const ADSFIX={
  //            eye: distância olho→alça (m) · dr/df: quanto a linha desce na alça/massa (unidades do modelo)
  m1911:   {eye:0.27},
  python:  {eye:0.27},
  kar98k:  {eye:0.2},
  garand:  {eye:0.17},
  db:      {eye:0.2},
  trench:  {eye:0.18},
  thompson:{eye:0.16},
  mp40:    {eye:0.2},
  ppsh:    {eye:0.2},
  stg44:   {eye:0.17},
  bar:     {eye:0.2},
  mg42:    {eye:0.23},
  doom:    {eye:0.18},
  ray:     {eye:0.2},
};
{ const ga0=gunAutoAds; gunAutoAds=function(gm,pose){
    let id=null; try{ const s=curSlot(); id=s&&s.id; }catch(e){}
    const f=id&&ADSFIX[id]; if(!f||VMDBG.eye!=null) return ga0.apply(this,arguments);
    const u=gm.userData, R0=u.sightR, F0=u.sightF, e0=VMDBG.eye;
    if(R0&&f.dr) u.sightR=[R0[0],R0[1]-f.dr,R0[2]]; if(F0&&f.df) u.sightF=[F0[0],F0[1]-f.df,F0[2]];
    VMDBG.eye=f.eye;
    try{ return ga0.apply(this,arguments); } finally{ VMDBG.eye=e0; u.sightR=R0; u.sightF=F0; } }; }
CMDS.ads_ajuste={cheat:1,d:'ads_ajuste <olho> [dr] [df] · ajusta a mira da arma atual (teste)',f:a=>{ const s=curSlot(); if(!s){ cprint('sem arma'); return; } const f=ADSFIX[s.id]||(ADSFIX[s.id]={eye:0.16});
  if(a[0]!=null) f.eye=+a[0]; if(a[1]!=null) f.dr=+a[1]; if(a[2]!=null) f.df=+a[2]; setGunModel(); cprint(`${s.id}: ${JSON.stringify(f)}`); }};

/* ---------- pegada da mão de apoio (fuzis, submetralhadoras, escopetas, metralhadoras) ----------
   Antes a mão esquerda ficava de lado no guarda-mão, com a palma aberta e o polegar em pé ("joinha").
   Agora a palma fica por baixo do guarda-mão, os dedos sobem pelo lado de lá e o polegar deita no lado de cá. */
const GRIPL={dx:0.5,dy:-0.004,f:[0.85,0.3,-0.45],b:[0.3,-0.95,0],thumb:[0.95,0.7,0.5],fing:1.25};
{ const ga=gripAuto; gripAuto=function(id){ const o=ga.apply(this,arguments);
    try{ const L=o&&o.L; if(!GRIPL.off&&L&&!L.pistol&&L.lhw!=null){ const p=L.p; p[0]+=L.lhw*GRIPL.dx; p[1]+=GRIPL.dy; L.f=new THREE.Vector3(...GRIPL.f).normalize().toArray(); L.b=new THREE.Vector3(...GRIPL.b).normalize().toArray(); L.sup=1; } }catch(e){}
    return o; }; }
{ const gs=gripSolveHand; gripSolveHand=function(sd,frame,shape,meshes,trig,thumb){
    if(!GRIPL.off&&typeof RIG!=='undefined'&&sd===RIG.sides.L&&thumb&&thumb[0]===0.45){ thumb=GRIPL.thumb; const k=GRIPL.fing; shape={}; for(const f of ['index','middle','ring','pinky']) shape[f]=[1*k,1.1*k,0.75*k]; shape.thumb=[0.8,0.6,0.45]; }
    return gs.call(this,sd,frame,shape,meshes,trig,thumb); }; }
// a pegada nova fica guardada em outra chave (a antiga, salva no navegador de quem já jogou, é ignorada)
gripGet=function(id){
  if(GRIPF[id]) return GRIPF[id];
  let B=GRIP_BAKE[id]; const LK='bdm_grip4_'+id; if(!B&&!GRIPL.nocache){ try{ const j=localStorage.getItem(LK); if(j) B=JSON.parse(j); }catch(e){} }
  if(!B){ try{ B=gripSolve(id); if(B) try{ localStorage.setItem(LK,JSON.stringify(B)); }catch(e){} }catch(e){ console.warn('[Bunker] ajuste de pegada',e); } }
  if(!B) return null;
  const mk=h=>h?{p:V3(h.p),q:handQ(h.f,h.b),c:h.c||HC.grab}:null;
  return GRIPF[id]={R:mk(B.R),L:mk(B.L),s:0.85}; };
