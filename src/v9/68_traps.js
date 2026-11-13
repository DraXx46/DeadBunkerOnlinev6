/* ================= v9 · ARMADILHAS: CHÃO DE FOGO E VENTILADOR DE LÂMINAS =================
   O choque elétrico já existia. Agora o Bunker, a Fazenda e o Hospício ganham mais duas armadilhas cada:
   · chão de fogo — grelhas de ferro no piso de uma passagem. Puxou a alavanca: estalos do piloto, um "VUUUM" e
     a passagem vira uma parede de chamas. A grelha fica em brasa, sobe fumaça e fagulha. Zumbi que pisa pega fogo
     e cai queimando em meio segundo; chefe só queima.
   · ventilador de lâminas — rotor industrial com duas alturas de lâminas (cintura e canela, pega até rastejante),
     no meio de uma porta. Gira devagar, embala, e corta quem passar: o corpo voa em ragdoll e perde braço ou perna.
     As lâminas vão ficando sujas de sangue a cada corpo.
   Mesmas regras do choque: energia ligada, alavanca na parede, pontos, tempo ligado e recarga. Online o anfitrião
   decide (e devolve os pontos se não der); todos veem e ouvem a armadilha, e cada um se machuca nela localmente. */
const TRX_DEF={
  fire:{cost:900, on:20,cd:60,name:'chão de fogo',top:'FOGO',sub:'CHÃO INCENDIÁRIO',col:'#ff8a2a'},
  fan: {cost:1200,on:22,cd:60,name:'ventilador de lâminas',top:'LÂMINAS',sub:'NÃO SE APROXIME',col:'#e8e8e0'},
};
// coordenadas em células do mapa (já globais); 'at' é o centro do rotor em unidades de célula
const TRX_SPOTS=[
  {kind:'fire',map:'bunker',lever:{x:10,z:31,n:[0,-1]},cells:[[8,32],[9,32],[8,33],[9,33]]},
  {kind:'fan', map:'bunker',lever:{x:20,z:20,n:[0,-1]},at:[22,21.5]},
  {kind:'fire',map:'farm',  lever:{x:10,z:67,n:[-1,0]},cells:[[8,68],[9,68],[8,69],[9,69]]},
  {kind:'fan', map:'farm',  lever:{x:36,z:69,n:[1,0]}, at:[38,72.5]},
  {kind:'fire',map:'hosp',  lever:{x:11,z:207,n:[0,-1]},cells:[[9,208],[10,208],[9,209],[10,209]]},
  {kind:'fan', map:'hosp',  lever:{x:17,z:211,n:[1,0]},at:[16.5,213]},
];
const TRX=[];
const FAN_R=1.72, FAN_WMAX=21;

/* ---------- texturas ---------- */
const TRXT={};
function trxLabel(top,sub,col){ return tex(128,64,(c,w,h)=>{ c.fillStyle='#1a1a16'; c.fillRect(0,0,w,h); c.fillStyle=col==='#e8e8e0'?'#d8c020':col;
  for(let i=-2;i<10;i++){ c.beginPath(); c.moveTo(i*16,0); c.lineTo(i*16+8,0); c.lineTo(i*16-4,h); c.lineTo(i*16-12,h); c.fill(); }
  c.fillStyle='#111'; c.fillRect(8,14,w-16,36); c.fillStyle=col; c.textAlign='center'; c.font='bold 21px "Stardos Stencil", Impact, sans-serif'; c.fillText(top,w/2,32);
  c.font='10px "Special Elite", monospace'; c.fillText(sub,w/2,46); }); }
// quadros de chama: bolhas somadas que sobem e afinam, cada quadro com outro ruído (trocar de quadro = labareda viva)
function trxFlameFrames(){ if(TRXT.flame) return TRXT.flame; const fr=[];
  for(let f=0;f<8;f++){ fr.push(tex(64,128,(c,w,h)=>{ c.clearRect(0,0,w,h); c.globalCompositeOperation='lighter';
    const seed=f*13.7; let x=w/2;
    for(let i=0;i<26;i++){ const k=i/25, y=h*(0.94-k*0.86); x=w/2+Math.sin(seed+k*7.3+i*0.4)*w*0.13*k+Math.sin(seed*1.7+k*13)*w*0.05*k; const r=w*(0.36-0.27*k)*(0.85+0.3*Math.sin(seed+i*2.1));
      const g=c.createRadialGradient(x,y,0,x,y,r); const a=0.32*(1-k*0.55);
      if(k<0.18){ g.addColorStop(0,`rgba(255,250,215,${a})`); g.addColorStop(0.5,`rgba(255,190,70,${a*0.7})`); }
      else if(k<0.55){ g.addColorStop(0,`rgba(255,200,90,${a})`); g.addColorStop(0.5,`rgba(255,110,20,${a*0.6})`); }
      else { g.addColorStop(0,`rgba(255,120,30,${a*0.8})`); g.addColorStop(0.5,`rgba(170,40,8,${a*0.4})`); }
      g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(x-r,y-r,r*2,r*2); }
    // pé azulado do queimador
    const g=c.createRadialGradient(w/2,h*0.95,0,w/2,h*0.95,w*0.3); g.addColorStop(0,'rgba(120,170,255,0.35)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,h*0.8,w,h*0.2); })); }
  return TRXT.flame=fr; }
function trxGrateTex(){ if(TRXT.grate) return TRXT.grate; return TRXT.grate=tex(128,128,(c,w,h)=>{
  c.fillStyle='#2a2826'; c.fillRect(0,0,w,h);
  for(let i=0;i<500;i++){ c.fillStyle=`rgba(${rand(60,110)|0},${rand(40,60)|0},${rand(25,40)|0},${rand(0.05,0.18)})`; c.fillRect(rand(0,w),rand(0,h),rand(1,6),rand(1,4)); }   // ferrugem
  c.fillStyle='#0a0908'; for(let r=0;r<7;r++) for(let k=0;k<3;k++) c.fillRect(10+k*38,8+r*17,30,8);                         // fendas
  c.strokeStyle='#4a4642'; c.lineWidth=3; c.strokeRect(2,2,w-4,h-4);
  c.fillStyle='#55504a'; for(const [x,y] of [[7,7],[w-7,7],[7,h-7],[w-7,h-7]]){ c.beginPath(); c.arc(x,y,3,0,7); c.fill(); }  // parafusos
  const g=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w*0.7); g.addColorStop(0,'rgba(0,0,0,0.35)'); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=g; c.fillRect(0,0,w,h); }); }   // fuligem
function trxHeatTex(){ if(TRXT.heat) return TRXT.heat; return TRXT.heat=tex(128,128,(c,w,h)=>{ c.fillStyle='#000'; c.fillRect(0,0,w,h);
  c.fillStyle='#fff'; for(let r=0;r<7;r++) for(let k=0;k<3;k++) c.fillRect(10+k*38,8+r*17,30,8); }); }
function trxRingTex(){ if(TRXT.ring) return TRXT.ring; return TRXT.ring=tex(256,32,(c,w,h)=>{ c.fillStyle='#1a1814'; c.fillRect(0,0,w,h); c.fillStyle='#c9a414';
  for(let i=-2;i<20;i++){ c.beginPath(); c.moveTo(i*16,0); c.lineTo(i*16+8,0); c.lineTo(i*16,h); c.lineTo(i*16-8,h); c.fill(); }
  c.fillStyle='rgba(0,0,0,0.35)'; for(let i=0;i<60;i++) c.fillRect(rand(0,w),rand(0,h),rand(2,9),rand(1,3)); },[1,1]); }
function trxRingGeo(r0,r1){ const g=new THREE.RingGeometry(r0,r1,64,1), p=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i); uv.setXY(i,(i%65)/64*4,(Math.hypot(x,y)-r0)/(r1-r0)); }
  uv.needsUpdate=true; return g; }
function trxBlurTex(){ if(TRXT.blur) return TRXT.blur; return TRXT.blur=tex(256,256,(c,w,h)=>{ c.clearRect(0,0,w,h); const cx0=w/2, R=w/2-2;
  // rastros circulares das lâminas: anéis finos de brilho variado (o fio brilha mais na borda), nada de disco sólido
  for(let i=0;i<70;i++){ const r=R*(0.1+0.9*Math.random()), a0=Math.random()*6.3, len=rand(1.2,6.3); const edge=r/R;
    c.strokeStyle=`rgba(${200+edge*40|0},${205+edge*35|0},${210+edge*30|0},${rand(0.05,0.22)*(0.4+edge)})`; c.lineWidth=rand(1,3.5); c.beginPath(); c.arc(cx0,cx0,r,a0,a0+len); c.stroke(); }
  c.strokeStyle='rgba(240,242,245,0.55)'; c.lineWidth=3; c.beginPath(); c.arc(cx0,cx0,R*0.97,0,7); c.stroke();
  c.strokeStyle='rgba(150,30,20,0.0)'; }); }

/* ---------- peças comuns ---------- */
function trxBase(tr){ if(tr.cells) return fhCell(tr.cells[0][0],tr.cells[0][1]); return fhCell(Math.floor(tr.at[0]),Math.floor(tr.at[1])); }
function trxLever(tr,L,root){ const D=TRX_DEF[tr.kind], [nx,nz]=L.n; const fx=cx(L.x)+nx*S/2, fz=cx(L.z)+nz*S/2;
  const g=new THREE.Group(); g.position.set(fx,tr.base+1.35,fz); g.rotation.y=Math.atan2(nx,nz);
  const plate=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.8,0.12),M.iron); plate.position.z=0.06; g.add(plate);
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(0.58,0.29),new THREE.MeshBasicMaterial({map:trxLabel(D.top,D.sub,D.col)})); lab.position.set(0,0.58,0.02); g.add(lab);
  const piv=new THREE.Group(); piv.position.set(0,0,0.14); g.add(piv);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.38,0.06),M.iron); arm.position.y=0.19; piv.add(arm);
  const knob=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),new THREE.MeshPhongMaterial({color:tr.kind==='fire'?0x9a2a10:0x5a5a5a,shininess:60})); knob.position.y=0.4; piv.add(knob);
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),new THREE.MeshBasicMaterial({color:0x222222})); lamp.position.set(0.22,-0.28,0.14); g.add(lamp);
  // conduíte descendo até o chão (a armadilha "puxa" força da parede)
  const cond=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,1.35,6),M.iron); cond.position.set(-0.22,-0.72,0.05); g.add(cond);
  piv.rotation.x=0.6; root.add(g); tr.piv=piv; tr.lamp=lamp;
  const ix=fx+nx*0.9, iz=fz+nz*0.9, i=tr.i;
  interacts.push({x:ix,z:iz,r:1.7,
    text:()=>{ if(!G.power) return 'É preciso ligar a energia'; if(tr.on>0) return null; if(tr.cd>0) return `Armadilha recarregando… ${Math.ceil(tr.cd)} s`; if(tr.pending&&G.t-tr.pending<2) return null;
      return `${PRESS} para ligar o ${D.name} [${price(D.cost)}]`; },
    use:()=>{ if(!G.power||tr.on>0||tr.cd>0||(tr.pending&&G.t-tr.pending<2)){ Snd.deny(); return; } if(!spend(D.cost)) return;
      try{ actLog(`{n} ligou o ${D.name}`); }catch(e){}
      if(NET.mode==='client'){ tr.pending=G.t; netAct(['tx',i]); return; } trxStart(tr); pushEv(['tx',i]); }}); }

/* ---------- chão de fogo ---------- */
function trxBuildFire(tr,root){
  tr.set=new Set(tr.cells.map(([x,z])=>x+','+z));
  const grateM=new THREE.MeshPhongMaterial({map:trxGrateTex(),shininess:12,specular:0x222222,emissiveMap:trxHeatTex(),emissive:0x000000});
  const nozM=new THREE.MeshPhongMaterial({color:0x1c1a18,shininess:30});
  const gm=new THREE.MeshBasicMaterial({map:glowTex,color:0xff6a18,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0});
  tr.grateM=grateM; tr.glowM=gm; tr.sheets=[]; tr.pilots=[];
  const flameMats=trxFlameFrames().map(t=>new THREE.MeshBasicMaterial({map:t,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  tr.flameMats=flameMats;
  const pilotM=new THREE.SpriteMaterial({map:glowTex,color:0x4a8aff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0}); tr.pilotM=pilotM;
  const sg=new THREE.PlaneGeometry(1.0,2.1); sg.translate(0,1.05,0);
  const bgG=new THREE.PlaneGeometry(2.0,2.7); bgG.translate(0,1.35,0);
  for(const [x,z] of tr.cells){ const wx=cx(x), wz=cx(z), y=fhCell(x,z);
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(S*0.96,S*0.96),grateM); gr.rotation.x=-Math.PI/2; gr.position.set(wx,y+0.012,wz); root.add(gr);
    const fl=new THREE.Mesh(new THREE.PlaneGeometry(S*1.5,S*1.5),gm); fl.rotation.x=-Math.PI/2; fl.position.set(wx,y+0.02,wz); root.add(fl);
    // corpo da labareda: duas lâminas grandes no centro da grelha (dá volume à parede de fogo)
    for(let k=0;k<2;k++){ const m=new THREE.Mesh(bgG,flameMats[0]); m.position.set(wx+rand(-.1,.1),y+0.02,wz+rand(-.1,.1)); m.rotation.y=k*Math.PI/2+Math.PI/4+rand(-0.2,0.2); m.scale.set(1,0.001,1); m.visible=false; root.add(m);
      tr.sheets.push({m,off:(Math.random()*8)|0,ph:Math.random()*6.3,sp:rand(0.6,0.9),h:rand(0.9,1.1),big:1}); }
    // 4 queimadores por grelha, cada um com 2 lâminas de chama cruzadas
    for(const [ox,oz] of [[-0.48,-0.48],[0.48,-0.48],[-0.48,0.48],[0.48,0.48]]){ const px=wx+ox, pz=wz+oz;
      const n=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.05,10),nozM); n.position.set(px,y+0.03,pz); root.add(n);
      const pl=new THREE.Sprite(pilotM); pl.scale.set(0.14,0.2,1); pl.position.set(px,y+0.1,pz); root.add(pl);
      for(let k=0;k<2;k++){ const m=new THREE.Mesh(sg,flameMats[0]); m.position.set(px,y+0.03,pz); m.rotation.y=k*Math.PI/2+rand(-0.3,0.3); m.scale.set(1,0.001,1); m.visible=false; root.add(m);
        tr.sheets.push({m,off:(Math.random()*8)|0,ph:Math.random()*6.3,sp:rand(0.8,1.25),h:rand(0.85,1.15)}); } } }
  tr.c0=new THREE.Vector3(tr.cells.reduce((a,c)=>a+cx(c[0]),0)/tr.cells.length,tr.base,tr.cells.reduce((a,c)=>a+cx(c[1]),0)/tr.cells.length);
  tr.flame=0; tr.heat=0; tr.ign=0; tr.fr=0; tr.fT=0; tr.crT=0; }
function trxInFire(tr,x,z){ return tr.set.has(Math.floor(x/S)+','+Math.floor(z/S)); }
function trxFireTick(tr,dt,vis){
  // fases: ignição (piloto azul, estalos) → labareda → apaga
  const live=tr.on>0;
  if(live&&tr.ign>0){ tr.ign-=dt; if(tr.ign<=0) trxWhoomp(tr); }
  const want=live&&tr.ign<=0?1:0; tr.flame+=(want-tr.flame)*Math.min(1,dt*(want?9:3.2)); if(tr.flame<0.003) tr.flame=0;
  tr.heat=clamp(tr.heat+(want?dt*0.16:-dt*0.1),0,1);
  if(!vis) return;
  tr.pilotM.opacity=live&&tr.ign>0?0.5+Math.random()*0.4:(G.power&&tr.cd<=0&&!live?0.12+Math.random()*0.05:0);
  // grelha em brasa (só as fendas acendem: o emissiveMap é a máscara das fendas)
  const h=tr.heat; tr.grateM.emissive.setRGB(h*0.95+tr.flame*0.15,h*0.28+tr.flame*0.05,h*0.04);
  tr.glowM.opacity=tr.flame*(0.55+Math.random()*0.2)+h*0.12;
  tr.fT+=dt; const step=tr.fT>=1/20; if(step){ tr.fT=0; tr.fr++; }
  const t=G.t;
  for(const s of tr.sheets){ const on=tr.flame>0.01; s.m.visible=on; if(!on) continue;
    if(step) s.m.material=tr.flameMats[(tr.fr+s.off)%8];
    const fl=0.78+0.22*Math.sin(t*9*s.sp+s.ph)+0.12*Math.sin(t*23+s.ph*3);
    s.m.scale.set((s.big?0.9:0.85)+0.15*Math.sin(t*7+s.ph),Math.max(0.001,tr.flame*s.h*fl*(s.big?1:1.2)),1); }
  if(tr.flame>0.3){ const n=tr.cells.length;
    if(Math.random()<dt*26*n/4){ const c=pick(tr.cells); emit('fire',cx(c[0])+rand(-.85,.85),tr.base+rand(0.1,0.7),cx(c[1])+rand(-.85,.85),1,1.1,0.7,-3.4); }
    if(Math.random()<dt*9){ const c=pick(tr.cells); emit('spark',cx(c[0])+rand(-.8,.8),tr.base+rand(0.6,1.6),cx(c[1])+rand(-.8,.8),1,1.6,1.1,-1.2); }
    if(Math.random()<dt*5){ const c=pick(tr.cells); wPuff(cx(c[0])+rand(-.5,.5),tr.base+rand(2.0,2.6),cx(c[1])+rand(-.5,.5),1,0x2a2622,0.35,2.2,0.9,0.3); }
    tr.crT-=dt; if(tr.crT<=0){ tr.crT=rand(0.08,0.24); trxCrackle(tr); } }
  else if(tr.heat>0.15&&Math.random()<dt*2.2){ const c=pick(tr.cells); wPuff(cx(c[0])+rand(-.6,.6),tr.base+0.2,cx(c[1])+rand(-.6,.6),1,0x5a5650,0.25,1.8,0.7,0.18); }
}
function trxFireHurt(tr,dt){
  if(tr.flame<0.45) return;
  if(NET.mode!=='client') for(const z of zombies){ if(z.dead||z.state==='rise'||!trxInFire(tr,z.pos.x,z.pos.z)) { if(z._trF) z._trF=Math.max(0,z._trF-dt); continue; }
    z._trF=(z._trF||0)+dt; try{ igniteZ(z,isBossZ(z)?180:60); }catch(e){}
    if(Math.random()<dt*20) emit('fire',z.pos.x+rand(-.25,.25),zy(z)+rand(0.2,1.7),z.pos.z+rand(-.25,.25),1,0.9,0.6,-2.8);
    if(!isBossZ(z)&&z._trF>0.42){ z._trF=0; damageZombie(z,9e6,'body','fire',null,null); } }
  if(!P.down&&!CHEAT.noclip&&G.state==='playing'&&trxInFire(tr,P.pos.x,P.pos.z)){ hurtPlayer(42*dt,null); trxBurnFx(dt); if(Math.random()<dt*3) shake(0.12); }
}
/* tela queimando quando o jogador pisa no fogo */
function trxBurnFx(dt){ let el=document.getElementById('trxburn'); if(!el){ el=document.createElement('div'); el.id='trxburn';
    el.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:6;opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at 50% 120%,rgba(255,120,20,.55),rgba(255,60,0,.18) 45%,rgba(0,0,0,0) 70%);mix-blend-mode:screen';
    document.body.appendChild(el); }
  el.style.opacity='1'; clearTimeout(trxBurnFx.t); trxBurnFx.t=setTimeout(()=>{ el.style.opacity='0'; },180); }

/* ---------- ventilador de lâminas ---------- */
function trxBladeGeo(){ if(TRXT.bladeG) return TRXT.bladeG;
  // lâmina em forma de cimitarra: raiz larga presa no cubo, fio curvo, ponta em gancho
  const s=new THREE.Shape(); s.moveTo(0.1,-0.07); s.lineTo(0.55,-0.09); s.quadraticCurveTo(1.25,-0.1,1.66,0.05); s.lineTo(1.6,0.1); s.quadraticCurveTo(1.15,0.06,0.55,0.07); s.lineTo(0.1,0.06); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:0.018,bevelEnabled:true,bevelThickness:0.004,bevelSize:0.006,bevelSegments:1,curveSegments:10});
  g.translate(0,0,-0.009); g.rotateX(-Math.PI/2); return TRXT.bladeG=g; }
function trxBuildFan(tr,root){
  const wx=tr.at[0]*S, wz=tr.at[1]*S; tr.c0=new THREE.Vector3(wx,tr.base,wz);
  const g=new THREE.Group(); g.position.copy(tr.c0); root.add(g); tr.g=g;
  const paint=new THREE.MeshPhongMaterial({color:0x4a4d2e,shininess:18,specular:0x1a1a14});
  const steel=new THREE.MeshPhongMaterial({color:0x9aa0a6,shininess:90,specular:0xbbbbbb}); tr.steel=steel; tr.blood=0;
  const dark=new THREE.MeshPhongMaterial({color:0x1a1b1c,shininess:40});
  // chão: placa aparafusada + anel listrado marcando o alcance
  const ring=new THREE.Mesh(trxRingGeo(FAN_R-0.18,FAN_R+0.05),new THREE.MeshLambertMaterial({map:trxRingTex(),transparent:true,polygonOffset:true,polygonOffsetFactor:-2}));
  ring.rotation.x=-Math.PI/2; ring.position.y=0.014; g.add(ring);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.48,0.07,20),M.iron); base.position.y=0.035; g.add(base);
  for(let k=0;k<6;k++){ const a=k/6*Math.PI*2, b=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.04,6),dark); b.position.set(Math.cos(a)*0.38,0.08,Math.sin(a)*0.38); g.add(b); }
  const col=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.17,1.2,14),paint); col.position.y=0.62; g.add(col);
  // motor em cima, com aletas de refrigeração e uma lâmpada de aviso
  const mot=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,0.36,18),paint); mot.position.y=1.42; g.add(mot);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.24,0.08,18),dark); cap.position.y=1.64; g.add(cap);
  for(let k=0;k<12;k++){ const a=k/12*Math.PI*2, f=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.3,0.07),dark); f.position.set(Math.cos(a)*0.26,1.42,Math.sin(a)*0.26); f.rotation.y=-a; g.add(f); }
  const bm=new THREE.MeshBasicMaterial({color:0x3a1a0a}); const bea=new THREE.Mesh(new THREE.SphereGeometry(0.06,10,8),bm); bea.position.y=1.72; g.add(bea); tr.beacon=bm;
  // dois rotores (cintura e canela), girando em sentidos opostos, com 4 lâminas cada
  const bg=trxBladeGeo(); tr.rot=[];
  for(const [y,dir] of [[1.04,1],[0.36,-1.12]]){ const r=new THREE.Group(); r.position.y=y; g.add(r);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.1,16),dark); r.add(hub);
    const nut=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.14,6),steel); r.add(nut);
    for(let k=0;k<4;k++){ const b=new THREE.Mesh(bg,steel); b.rotation.y=k*Math.PI/2; b.rotation.order='YXZ'; b.rotation.x=dir>0?0.2:-0.2; r.add(b); }
    const blur=new THREE.Mesh(new THREE.CircleGeometry(FAN_R-0.04,48),new THREE.MeshBasicMaterial({map:trxBlurTex(),transparent:true,depthWrite:false,opacity:0,side:THREE.DoubleSide}));
    blur.rotation.x=-Math.PI/2; r.add(blur);
    tr.rot.push({r,dir,blur}); }
  tr.w=0; tr.ang=0; tr.passT=0; tr.hitT=0; tr.cutN=0; }
function trxInFan(tr,x,z,pad){ return Math.hypot(x-tr.c0.x,z-tr.c0.z)<FAN_R+(pad||0); }
function trxFanTick(tr,dt,vis){
  const live=tr.on>0, tgt=live?FAN_WMAX:0;
  tr.w+=(tgt-tr.w)*Math.min(1,dt*(live?(tr.w<6?0.9:1.6):0.55)); if(!live&&tr.w<0.05) tr.w=0;
  if(live&&tr.w<1.2) tr.w+=dt*1.6;   // arranque: começa a girar logo
  tr.ang+=tr.w*dt;
  if(!vis) return;
  for(const R of tr.rot){ R.r.rotation.y=tr.ang*R.dir; R.blur.material.opacity=clamp((tr.w-6)/12,0,1)*0.38; R.blur.rotation.z=-tr.ang*R.dir*0.8; }
  tr.beacon.color.setHex(!G.power?0x1a0a04:live?(Math.sin(G.t*14)>0?0xff5a10:0x501a04):tr.cd>0?0x6a1a08:0x2a6a1a);
  // sangue acumulado nas lâminas
  const b=Math.min(0.75,tr.blood); tr.steel.color.setRGB(0.6-0.25*b,0.63-0.53*b,0.65-0.55*b); tr.steel.shininess=90-50*b;
  if(tr.w>4){ tr.passT-=dt*tr.w*4/(Math.PI*2); if(tr.passT<=0){ tr.passT+=1; trxWhoosh(tr); } }
}
function trxFanHurt(tr,dt){
  if(tr.w<6) return;
  // corpos de quem morreu dentro do alcance (aqui ou no anfitrião) voam cortados
  for(const z of zlist()){ if(!z||!z.pos) continue; const d=Math.hypot(z.pos.x-tr.c0.x,z.pos.z-tr.c0.z); if(d>FAN_R+0.35) continue;
    if(!z.dead&&!z.predDead){ if(NET.mode==='client'||z.state==='rise') continue;
      if(isBossZ(z)){ z._trB=(z._trB||0)-dt; if(z._trB<=0){ z._trB=0.3; trxCutFx(tr,z); damageZombie(z,Math.max(120,(z.maxHp||3000)*0.025),'body','blade',null,null); } continue; }
      trxCutFx(tr,z); damageZombie(z,9e6,Math.random()<0.25?'head':'body','blade',null,null); }
    if(z.dead&&z._zr===undefined&&!z._trCut) trxMarkCut(tr,z,d); }
  if(!P.down&&!CHEAT.noclip&&G.state==='playing'&&trxInFan(tr,P.pos.x,P.pos.z,0.3)){
    const dx=P.pos.x-tr.c0.x, dz=P.pos.z-tr.c0.z, d=Math.hypot(dx,dz)||0.01;
    tr.hitT-=dt; if(tr.hitT<=0){ tr.hitT=0.32; hurtPlayer(26,null); shake(0.28); try{ Snd.sample('knife_whoosh',{vol:0.9,x:P.pos.x,z:P.pos.z,range:20,rate:1.3}); }catch(e){} emit('blood',P.pos.x,tr.base+1.1,P.pos.z,8,2.6,0.6); }
    // empurra para fora do círculo
    const push=dt*7.5; P.pos.x+=dx/d*push; P.pos.z+=dz/d*push; try{ collide(P.pos,0.36,solidIn,true); }catch(e){} }
}
function trxCutFx(tr,z){ const y=zy(z); emit('blood',z.pos.x,y+1.0,z.pos.z,18,3.6,0.8); emit('gore',z.pos.x,y+0.9,z.pos.z,6,3.2,0.9); emit('spark',z.pos.x,y+1.0,z.pos.z,5,4,0.25);
  tr.blood+=0.07; try{ Snd.sample('knife_whoosh',{vol:0.55,x:z.pos.x,z:z.pos.z,range:28,rate:rand(0.6,0.8)}); }catch(e){} trxChop(tr,z.pos.x,z.pos.z); }
// prepara o ragdoll: coice na direção em que a lâmina passa (tangente do giro) e um membro arrancado
function trxMarkCut(tr,z,d){ z._trCut=1; const dx=z.pos.x-tr.c0.x, dz=z.pos.z-tr.c0.z, l=Math.hypot(dx,dz)||1, s=tr.rot[0].dir;
  const tx=-dz/l*s+dx/l*0.45, tz=dx/l*s+dz/l*0.45; const y=zy(z)+(z.crawl?0.3:rand(0.75,1.1));
  z._lh={t:zrNow(),cls:'shotgun',src:'blade',dx:tx,dz:tz,dmg:110,part:'body',pt:{x:z.pos.x-dx/l*0.15,y,z:z.pos.z-dz/l*0.15}};
  const L=['shL','shR','elL','elR','hipL','hipR','knL','knR']; const n=Math.random()<0.35?2:1; z._trSev=[]; for(let k=0;k<n;k++) z._trSev.push(L.splice((Math.random()*L.length)|0,1)[0]);
  if(NET.mode==='client'){ trxCutFx(tr,z); try{ if(Math.hypot(z.pos.x-P.pos.x,z.pos.z-P.pos.z)<14) shake(0.1); }catch(e){} } }
if(typeof zrStart==='function'){ const zs0=zrStart; zrStart=function(z){ const r=zs0.apply(this,arguments);
  try{ const E=z&&z._zr; if(E&&z._trSev&&z._trSev.length){ const k0=rmInst0(); rmUse(E.I); try{ const lh=z._lh||{}; const dir=rmv(lh.dx||0,0,lh.dz||0); for(const jn of z._trSev) zrSever(E,jn,dir); } finally{ rmUse(k0); } zrWrite(E); } }catch(e){ console.warn('[Bunker] corte da lâmina',e); }
  return r; }; }

/* ---------- sons (sintetizados, posicionados) ---------- */
function trxSp(x,z,range){ const dx=x-P.pos.x, dz=z-P.pos.z, d=Math.hypot(dx,dz)||0.001, yaw=P.yaw; const k=clamp(1-d/range,0,1);
  const side=(dx*Math.cos(yaw)-dz*Math.sin(yaw))/d; let vol=k*k; try{ if(d>2.5&&typeof losClear==='function'&&!losClear({x:P.pos.x,z:P.pos.z},{x,z})) vol*=0.5; }catch(e){}
  return {vol,pan:clamp(side,-1,1)*Math.min(1,d/2),lp:Math.max(500,16000*(1-d/range))}; }
function trxNoise(){ const c=Snd.ctx; if(!c) return null; if(TRXT.nb&&TRXT.nb.sampleRate===c.sampleRate) return TRXT.nb; const n=c.sampleRate*2, b=c.createBuffer(1,n,c.sampleRate), a=b.getChannelData(0);
  let last=0; for(let i=0;i<n;i++){ const w=Math.random()*2-1; last=last*0.6+w*0.4; a[i]=last*1.4; } return TRXT.nb=b; }
function trxWhoomp(tr){ const p=tr.c0; try{ Snd.sample('fire_burst',{vol:1,x:p.x,z:p.z,range:45,rate:0.75}); }catch(e){}
  try{ const s=trxSp(p.x,p.z,45); if(s.vol>0.01){ const o=Snd.out(s.vol*0.9,s.pan,0.3,s.lp); if(o){ const t=Snd.now; Snd.burstTo(o,{t,type:'lowpass',freq:380,dur:1.1,gain:0.8,attack:0.06}); Snd.oscTo(o,{t,type:'sine',freq:70,freqEnd:38,dur:0.7,gain:0.5,attack:0.03}); } } }catch(e){}
  for(let i=0;i<14;i++){ const c=pick(tr.cells); emit('fire',cx(c[0])+rand(-.8,.8),tr.base+rand(0.1,1.2),cx(c[1])+rand(-.8,.8),2,2.6,0.6,-3); }
  if(Math.hypot(P.pos.x-p.x,P.pos.z-p.z)<9) shake(0.22); }
function trxCrackle(tr){ const p=tr.c0; try{ const s=trxSp(p.x,p.z,30); if(s.vol<0.02) return; Snd.at(1,()=>{ const o=Snd.out(s.vol*0.55,s.pan,0.15,s.lp); if(!o) return; const t=Snd.now;
  for(let i=0,n=1+(Math.random()*3|0);i<n;i++) Snd.burstTo(o,{t:t+i*rand(0.01,0.04),type:'bandpass',freq:rand(1800,4200),q:3,dur:rand(0.01,0.03),gain:rand(0.25,0.6)}); }); }catch(e){} }
function trxWhoosh(tr){ const p=tr.c0; try{ const s=trxSp(p.x,p.z,26); if(s.vol<0.02) return; const k=clamp(tr.w/FAN_WMAX,0,1); const o=Snd.out(s.vol*(0.25+0.45*k),s.pan,0.12,s.lp); if(!o) return; const t=Snd.now;
  Snd.burstTo(o,{t,type:'bandpass',freq:500+900*k,q:1.4,dur:0.07,gain:0.4,attack:0.02}); }catch(e){} }
function trxChop(tr,x,z){ try{ const s=trxSp(x,z,32); if(s.vol<0.02) return; const o=Snd.out(s.vol,s.pan,0.2,s.lp); if(!o) return; const t=Snd.now;
  Snd.burstTo(o,{t,type:'lowpass',freq:900,dur:0.14,gain:0.8,attack:0.002}); Snd.burstTo(o,{t:t+0.01,type:'bandpass',freq:2600,q:2,dur:0.06,gain:0.4});
  Snd.oscTo(o,{t,type:'sine',freq:120,freqEnd:55,dur:0.16,gain:0.5,attack:0.003}); }catch(e){} }
// laço contínuo: ronco do fogo / zumbido do motor (nós próprios, volume e pan atualizados por quadro)
function trxLoop(tr){ if(tr.loop) return tr.loop; const c=Snd.ctx; if(!c) return null; try{
  const out=Snd.out(1,0,0.15,null); if(!out||!out.connect) return null;
  const pan=c.createStereoPanner?c.createStereoPanner():null, vg=c.createGain(); vg.gain.value=0; if(pan){ vg.connect(pan); pan.connect(out); } else vg.connect(out);
  const L={vg,pan,nodes:[]};
  const ns=c.createBufferSource(); ns.buffer=trxNoise(); ns.loop=true;
  if(tr.kind==='fire'){ const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=420; const g1=c.createGain(); g1.gain.value=0.9; ns.connect(lp); lp.connect(g1); g1.connect(vg);
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1300; bp.Q.value=0.7; const g2=c.createGain(); g2.gain.value=0.18; ns.connect(bp); bp.connect(g2); g2.connect(vg);
    const lfo=c.createOscillator(); lfo.frequency.value=0.7; const lg=c.createGain(); lg.gain.value=0.25; lfo.connect(lg); lg.connect(g1.gain); lfo.start(); L.nodes.push(lfo); }
  else { const os=c.createOscillator(); os.type='sawtooth'; os.frequency.value=40; const lp=c.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=300; const og=c.createGain(); og.gain.value=0.22; os.connect(lp); lp.connect(og); og.connect(vg); os.start(); L.nodes.push(os); L.os=os; L.olp=lp;
    const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=700; bp.Q.value=0.9; const ng=c.createGain(); ng.gain.value=0.35; ns.connect(bp); bp.connect(ng); ng.connect(vg); L.bp=bp;
    const lfo=c.createOscillator(); lfo.type='triangle'; lfo.frequency.value=4; const lg=c.createGain(); lg.gain.value=0.3; lfo.connect(lg); lg.connect(ng.gain); lfo.start(); L.nodes.push(lfo); L.lfo=lfo; }
  ns.start(); L.nodes.push(ns); return tr.loop=L; }catch(e){ return null; } }
function trxLoopStop(tr){ const L=tr.loop; if(!L) return; tr.loop=null; try{ const c=Snd.ctx; L.vg.gain.setTargetAtTime(0,c.currentTime,0.08); setTimeout(()=>{ for(const n of L.nodes) try{ n.stop(); }catch(e){} try{ L.vg.disconnect(); }catch(e){} },500); }catch(e){} }
function trxLoopTick(tr){ const amt=tr.kind==='fire'?tr.flame:clamp(tr.w/FAN_WMAX,0,1);
  if(amt<0.02||tr.map!==CUR||G.state!=='playing'){ if(tr.loop) trxLoopStop(tr); return; }
  const L=trxLoop(tr); if(!L) return; const c=Snd.ctx, t=c.currentTime, s=trxSp(tr.c0.x,tr.c0.z,tr.kind==='fire'?34:30);
  L.vg.gain.setTargetAtTime(s.vol*amt*(tr.kind==='fire'?0.55:0.5),t,0.1); if(L.pan) L.pan.pan.setTargetAtTime(s.pan,t,0.1);
  if(L.os){ L.os.frequency.setTargetAtTime(38+tr.w*6.5,t,0.15); L.olp.frequency.setTargetAtTime(220+tr.w*45,t,0.15); L.bp.frequency.setTargetAtTime(380+tr.w*55,t,0.15); L.lfo.frequency.setTargetAtTime(Math.max(0.5,tr.w*4/(Math.PI*2)),t,0.1); } }

/* ---------- ciclo ---------- */
function trxStart(tr){ if(!tr||tr.on>0) return; const D=TRX_DEF[tr.kind]; tr.on=D.on; tr.cd=0; tr.pending=0;
  tween(0.25,k=>{ tr.piv.rotation.x=0.6+k*(Math.PI-1.2); });
  if(tr.kind==='fire') tr.ign=0.75;
  if(tr.map===CUR){ try{ Snd.power(); }catch(e){} const p=tr.c0;
    if(tr.kind==='fire'){ for(let i=0;i<5;i++) setTimeout(()=>{ try{ const s=trxSp(p.x,p.z,30); const o=Snd.out(s.vol*0.6,s.pan,0.1,s.lp); if(o) Snd.burstTo(o,{t:Snd.now,type:'bandpass',freq:3200,q:5,dur:0.015,gain:0.7}); }catch(e){} },i*140); }
    else { try{ const s=trxSp(p.x,p.z,34); const o=Snd.out(s.vol*0.8,s.pan,0.2,s.lp); if(o){ const t=Snd.now; Snd.burstTo(o,{t,type:'lowpass',freq:300,dur:0.25,gain:0.7,attack:0.005}); Snd.oscTo(o,{t:t+0.05,type:'sawtooth',freq:30,freqEnd:90,dur:1.4,gain:0.18,attack:0.2}); } }catch(e){} } } }
function trxEnd(tr){ const D=TRX_DEF[tr.kind]; tr.on=0; tr.cd=D.cd; tween(0.4,k=>{ tr.piv.rotation.x=Math.PI-0.6-k*(Math.PI-1.2); });
  if(tr.map===CUR&&tr.kind==='fire'){ const p=tr.c0; for(let i=0;i<8;i++){ const c=pick(tr.cells); wPuff(cx(c[0])+rand(-.6,.6),tr.base+rand(0.3,1.2),cx(c[1])+rand(-.6,.6),1,0x4a4640,0.4,2.4,1,0.35); }
    try{ const s=trxSp(p.x,p.z,30); const o=Snd.out(s.vol*0.5,s.pan,0.15,s.lp); if(o) Snd.burstTo(o,{t:Snd.now,type:'highpass',freq:2500,dur:0.9,gain:0.35,attack:0.05}); }catch(e){} } }
function trxUpdate(dt){
  for(const tr of TRX){
    if(tr.on>0){ tr.on-=dt; if(tr.on<=0) trxEnd(tr); }
    else if(tr.cd>0) tr.cd=Math.max(0,tr.cd-dt);
    const vis=tr.map===CUR;
    if(vis) tr.lamp.material.color.setHex(!G.power?0x222222:tr.on>0?(Math.random()<0.5?(tr.kind==='fire'?0xffa040:0xffffff):(tr.kind==='fire'?0xff3a00:0x9a9a9a)):tr.cd>0?0x8a2a10:0x2a8a2a);
    if(tr.kind==='fire'){ trxFireTick(tr,dt,vis); if(vis) trxFireHurt(tr,dt); }
    else { trxFanTick(tr,dt,vis); if(vis) trxFanHurt(tr,dt); }
    trxLoopTick(tr); } }
function trxReset(){ for(const tr of TRX){ tr.on=0; tr.cd=0; tr.pending=0; if(tr.piv) tr.piv.rotation.x=0.6; trxLoopStop(tr);
    if(tr.kind==='fire'){ tr.flame=0; tr.heat=0; tr.ign=0; for(const s of tr.sheets) s.m.visible=false; tr.glowM.opacity=0; tr.grateM.emissive.setHex(0); }
    else { tr.w=0; tr.blood=0; for(const R of tr.rot) R.blur.material.opacity=0; } } }
function trxBuild(){ if(TRX.length) return;
  TRX_SPOTS.forEach((sp,i)=>{ try{ const root=MAPG[sp.map]; if(!root) return; const tr={i,kind:sp.kind,map:sp.map,cells:sp.cells||null,at:sp.at||null,on:0,cd:0,pending:0};
    tr.base=trxBase(tr); if(sp.kind==='fire') trxBuildFire(tr,root); else trxBuildFan(tr,root); trxLever(tr,sp.lever,root); TRX.push(tr); }catch(e){ console.warn('[Bunker v9] armadilha',sp.kind,sp.map,e); } });
  console.log('[Bunker v9] armadilhas novas',TRX.length); }
{ const bw=buildWorld; buildWorld=function(){ const r=bw.apply(this,arguments); try{ trxBuild(); }catch(e){ console.warn('[Bunker v9] armadilhas',e); } return r; }; }
{ const u0=updateTraps; updateTraps=function(dt){ const r=u0.apply(this,arguments); try{ trxUpdate(dt); }catch(e){ console.warn('[Bunker v9] armadilhas',e); } return r; }; }
{ const r0=resetTraps; resetTraps=function(){ const r=r0.apply(this,arguments); try{ trxReset(); }catch(e){} return r; }; }
v9On('always',()=>{ if(G.state!=='playing') for(const tr of TRX) if(tr.loop) trxLoopStop(tr); });

/* ---------- rede ---------- */
V9NET.act.tx=(peer,a)=>{ const tr=TRX[a[2]|0]; if(tr&&G.power&&!(tr.on>0)&&!(tr.cd>0)){ trxStart(tr); pushEv(['tx',a[2]|0]); } else if(tr) pushEv(['rf',peer,price(TRX_DEF[tr.kind].cost)]); };
V9NET.ev.tx=e=>{ trxStart(TRX[e[2]|0]); };

CMDS.armadilha={cheat:1,d:'armadilha [fogo|lamina] · liga a armadilha nova mais próxima do tipo (teste, sem custo)',f:a=>{ const w=(a[0]||'').toLowerCase(), k=w.startsWith('f')?'fire':w.startsWith('l')||w.startsWith('v')?'fan':null;
  let best=null, bd=1e9; for(const tr of TRX){ if(tr.map!==CUR||(k&&tr.kind!==k)) continue; const d=Math.hypot(tr.c0.x-P.pos.x,tr.c0.z-P.pos.z); if(d<bd){ bd=d; best=tr; } }
  if(!best){ cprint('nenhuma armadilha nova neste mapa'); return; } best.cd=0; best.on=0; trxStart(best); if(NET.mode==='host') pushEv(['tx',best.i]); cprint(`${TRX_DEF[best.kind].name} ligado (${Math.round(bd)} m)`); }};
