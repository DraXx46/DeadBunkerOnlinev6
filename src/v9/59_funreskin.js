/* Parque 4FUN · visual de parque de diversões abandonado (sem neon), com luz boa de fim de tarde.
   Repinta o que o 43_fun montou: neon vira cano/estrutura de ferro enferrujado ou tinta desbotada, halos e
   montanhas de arame somem, placas ficam desbotadas e sujas, chão vira asfalto rachado com mato, lâmpadas
   dos varais ficam acesas em tom quente. Materiais usados por outros mapas não são tocados. */
const FRS={done:new WeakSet(),mats:new Map(),other:null,ground:null,dir:null};
MAPS.fun.fog=0x5a5048; MAPS.fun.fogD=0.0095; MAPS.fun.bg=0x6e625a;
function frsHash(n){ n=(n*2654435761)>>>0; return n/4294967296; }
const FRS_METAL=[0x6b4a36,0x7a7468,0x8a4030,0x5f6852,0x8a7a5a,0x4e4a48];
function frsDesat(hex,s,lMin,lMax){ const c=new THREE.Color(hex); const h={}; c.getHSL(h); c.setHSL(h.h,h.s*s,clamp(h.l,lMin,lMax)); return c; }
function frsOther(){ if(FRS.other) return FRS.other; const set=new Set(); for(const k in MAPG){ if(k==='fun') continue; MAPG[k].traverse(o=>{ if(o.material){ for(const m of [].concat(o.material)){ if(!m) continue; set.add(m); if(m.map) set.add(m.map); } } }); } return FRS.other=set; }
function frsCanvas(t,opt){ if(!t||!t.image||FRS.done.has(t)||frsOther().has(t)) return; const im=t.image; if(!(im instanceof HTMLCanvasElement)) return; FRS.done.add(t);
  try{ const g=im.getContext('2d'); const W=im.width, H=im.height; const d=g.getImageData(0,0,W,H), a=d.data;
    for(let i=0;i<a.length;i+=4){ const r=a[i],gg=a[i+1],b=a[i+2]; const l=(r*0.3+gg*0.59+b*0.11); const k=opt.sat;
      let R=l+(r-l)*k, G=l+(gg-l)*k, B=l+(b-l)*k; R=R*opt.mul+opt.warm*18; G=G*opt.mul+opt.warm*10; B=B*opt.mul; a[i]=clamp(R,0,255); a[i+1]=clamp(G,0,255); a[i+2]=clamp(B,0,255); }
    g.putImageData(d,0,0);
    // sujeira, ferrugem escorrendo e descascado
    for(let i=0;i<W*H/900;i++){ g.fillStyle=`rgba(${60+Math.random()*40|0},${40+Math.random()*20|0},${25},${Math.random()*0.18})`; g.beginPath(); g.arc(Math.random()*W,Math.random()*H,2+Math.random()*W*0.05,0,7); g.fill(); }
    for(let i=0;i<W/40;i++){ const x=Math.random()*W, y=Math.random()*H*0.5; const gr=g.createLinearGradient(x,y,x,y+H*0.4); gr.addColorStop(0,'rgba(110,60,30,.35)'); gr.addColorStop(1,'rgba(110,60,30,0)'); g.fillStyle=gr; g.fillRect(x,y,2+Math.random()*4,H*0.4); }
    t.needsUpdate=true; }catch(e){} }
function frsGroundTex(){ const c=document.createElement('canvas'); c.width=c.height=512; const g=c.getContext('2d');
  g.fillStyle='#55514b'; g.fillRect(0,0,512,512);
  for(let i=0;i<14000;i++){ const v=60+Math.random()*50|0; g.fillStyle=`rgba(${v},${v-3},${v-8},0.5)`; g.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*2,1+Math.random()*2); }
  for(let i=0;i<40;i++){ g.fillStyle=`rgba(${35+Math.random()*20|0},${32+Math.random()*15|0},${28},${0.15+Math.random()*0.2})`; g.beginPath(); g.ellipse(Math.random()*512,Math.random()*512,10+Math.random()*60,8+Math.random()*40,Math.random()*3,0,7); g.fill(); }
  g.strokeStyle='rgba(22,20,18,.8)'; for(let i=0;i<22;i++){ let x=Math.random()*512, y=Math.random()*512; g.lineWidth=0.8+Math.random()*1.6; g.beginPath(); g.moveTo(x,y); for(let k=0;k<9;k++){ x+=(Math.random()-0.5)*60; y+=(Math.random()-0.5)*60; g.lineTo(x,y); } g.stroke(); }
  for(let i=0;i<70;i++){ const x=Math.random()*512, y=Math.random()*512; for(let k=0;k<14;k++){ g.strokeStyle=`rgba(${70+Math.random()*30|0},${85+Math.random()*40|0},${40},.7)`; g.lineWidth=1; g.beginPath(); g.moveTo(x,y); g.lineTo(x+(Math.random()-0.5)*10,y-3-Math.random()*8); g.stroke(); } }
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.anisotropy=4; return t; }
function frsMat(m,mesh){ if(FRS.mats.has(m)) return FRS.mats.get(m); let out=m;
  if(frsOther().has(m)){ FRS.mats.set(m,m); return m; }
  const geo=mesh.geometry, gp=geo&&geo.parameters||{};
  if(m.isMeshBasicMaterial){
    if(m.map){ frsCanvas(m.map,{sat:0.32,mul:0.78,warm:1}); out=new THREE.MeshLambertMaterial({map:m.map,transparent:m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest}); }
    else if(m.fog===false){ out='glow'; }
    else { out=new THREE.MeshLambertMaterial({color:frsDesat(m.color.getHex(),0.08,0.2,0.42),side:m.side,transparent:m.transparent,opacity:m.opacity}); }
  } else if(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial){
    if(!FRS.done.has(m)){ FRS.done.add(m); m.color&&m.color.copy(frsDesat(m.color.getHex(),0.2,0.12,0.7)); if(m.emissive){ const e=m.emissive.getHex(); if(e) m.emissive.copy(frsDesat(e,0.3,0,0.06)); } if(m.map) frsCanvas(m.map,{sat:0.12,mul:0.95,warm:1.2}); m.needsUpdate=true; }
  }
  FRS.mats.set(m,out); return out; }
function funReskin(root){ root=root||MAPG.fun; const skip=new Set([typeof RM!=='undefined'&&RM.g,typeof RM!=='undefined'&&RM.dyn,typeof RM!=='undefined'&&RM.dropIM,typeof RM!=='undefined'&&RM.splIM].filter(Boolean));
  const todo=[]; root.traverse(o=>{ for(let q=o;q;q=q.parent) if(q.userData&&q.userData.rag) return; for(const s of skip){ let q=o; while(q){ if(q===s) return; q=q.parent; } } if(o.isMesh||o.isLine||o.isLineSegments||o.isInstancedMesh) todo.push(o); });
  let n=0;
  for(const o of todo){ if(o.userData.frs) continue; try{ n+=frsOne(o); o.userData.frs=1; }catch(e){ if(!FRS.warned){ FRS.warned=1; console.warn('[Bunker] 4fun visual',e); } } }
  return n; }
function frsOne(o){ let n=0; const m=o.material; if(!m||Array.isArray(m)) return 0;
    if(o.isLine||o.isLineSegments){ if(m.color) m.color.copy(frsDesat(m.color.getHex(),0.2,0.05,0.25)); return 0; }
    if(m.wireframe){ o.visible=false; return n; }
    if(m.blending===THREE.AdditiveBlending&&!frsOther().has(m)){ o.visible=false; return n; }
    const gp=o.geometry&&o.geometry.parameters||{};
    if(o.geometry&&o.geometry.type==='CircleGeometry'&&gp.radius>=30){ o.visible=false; return n; }       // sol retrô
    if(o.geometry&&o.geometry.type==='PlaneGeometry'&&gp.width>100&&m.isMeshBasicMaterial){                // chão
      if(!FRS.ground){ FRS.ground=new THREE.MeshLambertMaterial({map:frsGroundTex()}); FRS.ground.map.repeat.set(gp.width/9,gp.height/9); } o.material=FRS.ground; return n; }
    const r=frsMat(m,o);
    if(r==='glow'){ const tp=o.geometry&&o.geometry.type; const small=tp==='SphereGeometry'&&(gp.radius||1)<0.16;
      if(small){ o.material=frsMat.bulb||(frsMat.bulb=new THREE.MeshBasicMaterial({color:0xffd9a0})); }
      else { const k=(Math.floor(frsHash((o.id||0)+7)*FRS_METAL.length)); const key='metal'+k; o.material=FRS.mats.get(key)||(FRS.mats.set(key,new THREE.MeshLambertMaterial({color:FRS_METAL[k]})),FRS.mats.get(key)); }
      n++; return n; }
    if(r!==m){ o.material=r; n++; }
  return n; }
function frsDance(){ if(!FUN.danceTiles) return; const T=FUN.danceTiles; FUN.danceTiles=null; FRS.dance=T; T.forEach((m,i)=>{ m.material=new THREE.MeshLambertMaterial({color:((i+(i/6|0))%2)?0x5a524a:0x3a3430}); }); }
function frsLight(){ frsDance(); if(CUR!=='fun') return; if(hemi){ hemi.color.setHex(0xffe6c8); hemi.groundColor.setHex(0x5a4c3e); hemi.intensity=1.25; }
  if(!FRS.dir){ const d=new THREE.DirectionalLight(0xffc890,0.85); d.position.set(-40,30,-20); const t=new THREE.Object3D(); MAPG.fun.add(t); d.target=t; MAPG.fun.add(d); FRS.dir=d; t.position.set(MW*S/2,0,(FUN0+30)*S); d.position.set(MW*S/2-60,45,(FUN0+30)*S-40); }
  try{ skyG.visible=false; }catch(e){} }
{ const sm0=setMap; setMap=function(k){ const r=sm0.apply(this,arguments); try{ if(k==='fun'){ funReskin(); frsLight(); } else { try{ skyG.visible=true; }catch(e){} } }catch(e){ console.warn('[Bunker] 4fun visual',e); } return r; }; }
// coisas montadas depois (laboratório, brinquedos que aparecem na hora) também passam pela tinta
v9On('frame',()=>{ if(CUR!=='fun') return; FRS.tick=(FRS.tick||0)+1; if(FRS.tick%90===1) funReskin(); });
// o loop de luz geral baixa a luz ambiente todo frame; no parque ela fica clara (fim de tarde)
{ const ul0=updateLights; updateLights=function(dt){ const r=ul0.apply(this,arguments); if(CUR==='fun'&&hemi){ hemi.intensity=1.05; if(hemi.color.getHex()!==0xffe6c8){ hemi.color.setHex(0xffe6c8); hemi.groundColor.setHex(0x5a4c3e); } } return r; }; }
