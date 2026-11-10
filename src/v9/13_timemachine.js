/* ================= v9 · HOSPÍCIO: MÁQUINA DO TEMPO → LABORATÓRIO DO FUTURO =================
   No quintal (portões a 100 mil) fica uma máquina do tempo azul e transparente. As 10 peças estão espalhadas pelo hospício
   (camas, prateleiras, cantos) e 2 ficam com o 1º e o 2º chefe. Cada jogador carrega uma peça por vez; montar leva 3 s.
   Com as 10 montadas e TODOS os jogadores juntos perto dela, a máquina viaja para o futuro: o hospício vira um laboratório
   secreto que estudava a cura, invadido e abandonado — zumbis mais fortes e tudo mais caro. */
const TM_PARTS=[
  {k:'core',n:'Núcleo de Fluxo'},{k:'ringA',n:'Anel Giroscópico Maior'},{k:'ringB',n:'Anel Giroscópico Menor'},{k:'coil',n:'Bobina de Tesla'},{k:'flux',n:'Capacitor em Y'},
  {k:'panel',n:'Painel de Controle'},{k:'cell',n:'Célula de Plutônio'},{k:'antenna',n:'Antena Temporal'},{k:'gear',n:'Engrenagem Cronométrica'},{k:'lens',n:'Lente de Foco'}];
const TM={parts:[],carry:-1,holdT:0,g:null,x:0,z:0,meshes:[],lab:false,cine:false,goT:0,bossDrops:0,ghostM:null,worldG:[],labG:null,mats:null,holdGo:0};
function tmPos(){ return {x:cx(hx(37.5)),z:cx(hz(5.5))}; }
function tmMats(){ if(TM.mats) return TM.mats; return TM.mats={
  steel:new THREE.MeshPhongMaterial({color:0x8a929a,shininess:110,specular:0xffffff}), dark:new THREE.MeshPhongMaterial({color:0x1c2026,shininess:60,specular:0x667788}),
  brass:new THREE.MeshPhongMaterial({color:0xb08a3a,shininess:90,specular:0xffe0a0}), copper:new THREE.MeshPhongMaterial({color:0xb0603a,shininess:90,specular:0xffc0a0}),
  glow:new THREE.MeshBasicMaterial({color:0x6af0ff}), glowP:new THREE.MeshBasicMaterial({color:0xb07aff}), green:new THREE.MeshBasicMaterial({color:0x7aff6a}),
  glass:new THREE.MeshPhongMaterial({color:0x9ad8ff,transparent:true,opacity:0.35,shininess:140,specular:0xffffff,depthWrite:false}), red:new THREE.MeshPhongMaterial({color:0xc02a1a,shininess:60}),
  rubber:new THREE.MeshPhongMaterial({color:0x111111,shininess:10}), screen:new THREE.MeshBasicMaterial({map:tex(256,128,(g,w,h)=>{ g.fillStyle='#021a12'; g.fillRect(0,0,w,h); g.fillStyle='#4aff8a'; g.font='bold 22px monospace'; g.fillText('DESTINO: 2087',12,34); g.fillText('FLUXO  ▮▮▮▮▮▯',12,66); g.fillText('SINCRON. 88%',12,98); for(let i=0;i<w;i+=4){ g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(0,i,w,1); } })}) }; }
/* cada peça é um grupo modelado à mão; a mesma função serve para a peça solta no mundo e para o lugar dela na máquina */
function tmPartMesh(k){ const M=tmMats(), g=new THREE.Group(); const add=(geo,m,x,y,z,rx,ry,rz)=>v9Mesh(geo,m,g,x,y,z,rx,ry,rz);
  switch(k){
    case 'core': add(new THREE.IcosahedronGeometry(0.22,1),M.glow); for(let i=0;i<3;i++) add(new THREE.TorusGeometry(0.3,0.02,6,24),M.brass,0,0,0,i*1.05,i*0.7,0); add(new THREE.CylinderGeometry(0.08,0.12,0.18,10),M.dark,0,-0.3,0); break;
    case 'ringA': add(new THREE.TorusGeometry(1.15,0.07,10,48),M.brass); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; add(new THREE.BoxGeometry(0.1,0.16,0.1),M.dark,Math.cos(a)*1.15,Math.sin(a)*1.15,0,0,0,a); } for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; add(new THREE.SphereGeometry(0.025,6,4),M.glow,Math.cos(a)*1.15,Math.sin(a)*1.15,0.07); } break;
    case 'ringB': add(new THREE.TorusGeometry(0.85,0.05,10,40),M.copper); for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; add(new THREE.CylinderGeometry(0.04,0.04,0.2,8),M.steel,Math.cos(a)*0.85,Math.sin(a)*0.85,0,Math.PI/2,0,a); } break;
    case 'coil': add(new THREE.CylinderGeometry(0.12,0.16,0.7,14),M.dark,0,0.35,0); for(let i=0;i<10;i++) add(new THREE.TorusGeometry(0.15,0.02,6,16),M.copper,0,0.1+i*0.055,0,Math.PI/2,0,0); add(new THREE.TorusGeometry(0.2,0.07,10,24),M.steel,0,0.78,0,Math.PI/2,0,0); add(new THREE.SphereGeometry(0.06,8,6),M.glowP,0,0.9,0); break;
    case 'flux': { add(new THREE.BoxGeometry(0.5,0.6,0.12),M.dark,0,0.3,0); const gl=M.glass; for(const a of [0,2.09,-2.09]){ const t=add(new THREE.CylinderGeometry(0.03,0.03,0.24,8),M.glow,Math.sin(a)*0.1,0.32+Math.cos(a)*0.1,0.08,0,0,-a); } add(new THREE.CircleGeometry(0.2,24),gl,0,0.3,0.065); add(new THREE.SphereGeometry(0.04,8,6),M.glowP,0,0.32,0.09); break; }
    case 'panel': add(new THREE.BoxGeometry(0.8,0.5,0.2),M.dark,0,0.25,0,-0.5,0,0); add(new THREE.PlaneGeometry(0.42,0.22),M.screen,-0.1,0.33,0.05,-0.5,0,0); for(let i=0;i<4;i++) add(new THREE.CylinderGeometry(0.025,0.025,0.06,8),i%2?M.red:M.green,0.22+(i%2)*0.08,0.3-Math.floor(i/2)*0.1,0.06,Math.PI/2-0.5,0,0); add(new THREE.BoxGeometry(0.03,0.16,0.03),M.steel,0.3,0.42,0.02,-0.3,0,0); break;
    case 'cell': add(new THREE.CylinderGeometry(0.12,0.12,0.42,16),M.glass,0,0.21,0); add(new THREE.CylinderGeometry(0.08,0.08,0.36,12),M.green,0,0.21,0); for(const y of [0.02,0.42]) add(new THREE.CylinderGeometry(0.14,0.14,0.05,16),M.steel,0,y,0); add(new THREE.BoxGeometry(0.06,0.04,0.3),M.rubber,0,0.47,0); break;
    case 'antenna': add(new THREE.CylinderGeometry(0.02,0.04,1.1,8),M.steel,0,0.55,0); for(const y of [0.4,0.7,0.95]) add(new THREE.TorusGeometry(0.12-y*0.06,0.012,6,16),M.copper,0,y,0,Math.PI/2,0,0); add(new THREE.SphereGeometry(0.05,10,8),M.glow,0,1.12,0); add(new THREE.ConeGeometry(0.14,0.12,12),M.dark,0,0.04,0); break;
    case 'gear': { const sh=new THREE.Shape(); const N=14; for(let i=0;i<N*2;i++){ const a=i/(N*2)*Math.PI*2, r=i%2?0.3:0.24; const xx=Math.cos(a)*r, yy=Math.sin(a)*r; if(i) sh.lineTo(xx,yy); else sh.moveTo(xx,yy); } const hole=new THREE.Path(); hole.absarc(0,0,0.08,0,Math.PI*2,true); sh.holes.push(hole);
      const ge=new THREE.ExtrudeGeometry(sh,{depth:0.06,bevelEnabled:true,bevelThickness:0.01,bevelSize:0.01,bevelSegments:1}); add(ge,M.brass,0,0,-0.03); add(new THREE.CylinderGeometry(0.05,0.05,0.12,10),M.steel,0,0,0,Math.PI/2,0,0); break; }
    case 'lens': add(new THREE.SphereGeometry(0.28,20,10,0,Math.PI*2,0,Math.PI*0.35),M.glass,0,0,0,-Math.PI/2,0,0); add(new THREE.TorusGeometry(0.17,0.03,8,24),M.brass); for(let i=0;i<3;i++){ const a=i/3*Math.PI*2; add(new THREE.CylinderGeometry(0.015,0.015,0.3,6),M.steel,Math.cos(a)*0.17,Math.sin(a)*0.17,-0.15,Math.PI/2,0,0); } add(new THREE.SphereGeometry(0.05,8,6),M.glowP,0,0,-0.3); break; }
  g.traverse(o=>{ if(o.isMesh) o.userData.real=o.material; }); return g; }
/* onde cada peça vai na máquina */
const TM_SLOT={core:[0,1.65,0],ringA:[0,1.65,0],ringB:[0,1.65,0],coil:[-1.35,0.38,0.9],flux:[0,0.72,-1.05],panel:[1.55,0.4,0.85],cell:[1.35,0.38,-0.95],antenna:[-1.35,0.38,-0.95],gear:[0,0.62,1.12],lens:[0,3.05,0]};
function tmGhostMat(){ return TM.ghostM||(TM.ghostM=new THREE.MeshBasicMaterial({color:0x3aa8ff,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})); }
function tmSetGhost(m,ghost){ m.traverse(o=>{ if(o.isMesh) o.material=ghost?tmGhostMat():o.userData.real; }); }
function tmBuild(){ const p=tmPos(); TM.x=p.x; TM.z=p.z; const M=tmMats(); const g=new THREE.Group(); g.position.set(p.x,floorAt(p.x,p.z),p.z); MAPG.hosp.add(g); TM.g=g;
  // base fixa (sempre de verdade): plataforma com degraus, trilhos, cabos, pilares
  v9Mesh(new THREE.CylinderGeometry(2.1,2.3,0.22,40),M.dark,g,0,0.11,0); v9Mesh(new THREE.CylinderGeometry(1.7,1.75,0.12,40),M.steel,g,0,0.28,0);
  const ring=v9Mesh(new THREE.TorusGeometry(1.72,0.03,6,48),tmGhostMat().clone(),g,0,0.35,0,Math.PI/2,0,0); ring.material.opacity=0.6; TM.baseRing=ring;
  for(let i=0;i<4;i++){ const a=i/4*Math.PI*2+Math.PI/4; v9Mesh(new THREE.BoxGeometry(0.22,0.06,0.5),M.brass,g,Math.cos(a)*2.2,0.03,Math.sin(a)*2.2,0,-a,0);
    const pil=v9Mesh(new THREE.CylinderGeometry(0.09,0.12,2.6,10),M.dark,g,Math.cos(a)*1.55,1.3,Math.sin(a)*1.55); v9Mesh(new THREE.SphereGeometry(0.1,10,8),M.brass,g,Math.cos(a)*1.55,2.62,Math.sin(a)*1.55); }
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; const c=v9Mesh(new THREE.TorusGeometry(0.6,0.035,6,14,Math.PI*0.6),M.rubber,g,Math.cos(a)*2.4,0.02,Math.sin(a)*2.4,Math.PI/2,0,a); }
  const plate=tex(512,96,(c,w,h)=>{ c.fillStyle='#14100a'; c.fillRect(0,0,w,h); c.strokeStyle='#b08a3a'; c.lineWidth=5; c.strokeRect(4,4,w-8,h-8); c.fillStyle='#e8d8a8'; c.font='bold 46px "Stardos Stencil", Impact'; c.textAlign='center'; c.fillText('CRONO-MOTOR 1955',w/2,62); });
  v9Mesh(new THREE.PlaneGeometry(1.4,0.26),new THREE.MeshBasicMaterial({map:plate}),g,0,0.18,2.31);
  // peças da máquina (fantasmas azuis até serem montadas)
  TM.meshes=TM_PARTS.map((P0,i)=>{ const m=tmPartMesh(P0.k); const s=TM_SLOT[P0.k]; m.position.set(s[0],s[1],s[2]); if(P0.k==='ringA'||P0.k==='ringB') m.rotation.y=0; g.add(m); tmSetGhost(m,true); return m; });
  TM.light=new THREE.PointLight(0x6ac8ff,0,10,1.8); TM.light.position.set(0,1.8,0); g.add(TM.light);
  addPropBox(p.x,p.z,2.0,2.0).tm=true;
  // interação: montar peça / ligar
  interacts.push({x:p.x,z:p.z+2.6,r:3.2,hold:true,enabled:()=>CUR==='hosp'&&!TM.lab&&(TM.carry>=0||tmAllIn()),
    text:()=>TM.carry>=0?`${HOLD} para montar: ${TM_PARTS[TM.carry].n} [${tmCount()}/10]`+(TM.holdT>0?` · ${Math.floor(TM.holdT/3*100)}%`:''):tmTogether()?`${HOLD} para LIGAR A MÁQUINA DO TEMPO`+(TM.holdGo>0?` · ${Math.floor(TM.holdGo/2*100)}%`:''):`Todos precisam estar perto da máquina (${tmNear()}/${tmTotal()})`,
    holdUse:dt=>{ if(TM.carry>=0){ TM.holdT+=dt; if(Math.random()<dt*14) emit('spark',TM.x+rand(-1,1),1.2,TM.z+rand(-1,1),2,3,0.4,6); if(TM.holdT>=3){ TM.holdT=0; const i=TM.carry; TM.carry=-1; if(NET.mode==='client'){ netAct(['tmi',i]); TM.parts[i].st=2; tmVis(); } else tmInstall(i); } return; }
      if(tmAllIn()&&tmTogether()){ TM.holdGo+=dt; if(TM.holdGo>=2){ TM.holdGo=0; if(NET.mode==='client') netAct(['tmgo']); else tmGo(); } } }});
  // peças soltas no mundo
  TM.worldG=TM_PARTS.map((P0,i)=>{ const g2=new THREE.Group(); const m=tmPartMesh(P0.k); const sc={ringA:0.42,ringB:0.5,antenna:0.7}[P0.k]||0.9; m.scale.setScalar(sc); g2.add(m);
    const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x6ac8ff,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.5})); halo.scale.set(1.3,1.3,1); g2.add(halo); g2.userData.halo=halo; g2.visible=false; MAPG.hosp.add(g2);
    const it={x:0,z:0,r:1.4,enabled:()=>CUR==='hosp'&&!TM.lab&&TM.parts[i]&&TM.parts[i].st===0,text:()=>TM.carry>=0?'Você só consegue carregar uma peça por vez':`${PRESS} para pegar: ${P0.n}`,
      use:()=>{ if(TM.carry>=0){ Snd.deny(); flashPrompt(); return; } if(NET.mode==='client'){ netAct(['tmp',i]); TM.parts[i].st=1; TM.carry=i; tmVis(); } else tmPick(i,'me'); try{ Snd.ammoBox(); }catch(e){} }};
    interacts.push(it); g2.userData.it=it; return g2; });
}
const tmCount=()=>TM.parts.filter(p=>p.st===2).length;
const tmAllIn=()=>TM.parts.length===10&&tmCount()===10;
function tmTotal(){ let n=P.down===2?0:1; for(const rp of NET.players.values()) if(rp.has&&rp.down!==2) n++; return n; }
function tmNear(){ const R=6.5; let n=P.down!==2&&Math.hypot(P.pos.x-TM.x,P.pos.z-TM.z)<R?1:0; for(const rp of NET.players.values()) if(rp.has&&rp.down!==2&&rp.x!=null&&Math.hypot(rp.x-TM.x,rp.z-TM.z)<R) n++; return n; }
const tmTogether=()=>tmNear()>=tmTotal();
/* lugares das peças: muda a cada partida (camas, prateleiras, cantos de todas as alas e andares) */
function tmSpots(){ const rooms=['H','I','J','K','H2A','H2B','H3A','H3B']; const cands=[];
  for(let z=hz(-21);z<=hz(21);z++) for(let x=hx(1);x<=hx(30);x++){ if(!inB(x,z)||grid[z][x]!=='.'||!rooms.includes(roomOf[z][x])||propCell[z*MW+x]) continue; let w=0; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) if(at(x+dx,z+dz)==='#') w++; if(w>=1) cands.push([x,z,w]); }
  const out=[], byRoom={}; cands.sort(()=>Math.random()-0.5);
  for(const c of cands){ const r=roomOf[c[1]][c[0]]; if((byRoom[r]|0)>=2) continue; if(out.some(o=>Math.hypot(o[0]-c[0],o[1]-c[1])<4)) continue; byRoom[r]=(byRoom[r]|0)+1; out.push(c); if(out.length>=8) break; }
  return out; }
function tmReset(){ TM.lab=false; TM.carry=-1; TM.holdT=0; TM.holdGo=0; TM.bossDrops=0; TM.cine=false;
  const sp=tmSpots(); const order=TM_PARTS.map((_,i)=>i).sort(()=>Math.random()-0.5);
  TM.parts=TM_PARTS.map(()=>({st:3,x:0,z:0,y:0,kind:'boss'}));
  order.forEach((pi,j)=>{ const s=sp[j]; if(!s) return; const kinds=['floor','crate','shelf']; const kind=kinds[j%3]; TM.parts[pi]={st:0,x:cx(s[0])+rand(-0.3,0.3),z:cx(s[1])+rand(-0.3,0.3),y:kind==='floor'?0.12:kind==='crate'?0.72:1.32,kind}; });
  tmVis(); labUndo(); }
function tmVis(){ if(!TM.g) return; TM.meshes.forEach((m,i)=>{ const p=TM.parts[i]; tmSetGhost(m,!(p&&p.st===2)); });
  TM.worldG.forEach((g,i)=>{ const p=TM.parts[i]; g.visible=!!p&&p.st===0&&CUR==='hosp'; if(!p) return; const fb=floorAt(p.x,p.z); g.position.set(p.x,fb+p.y,p.z); g.userData.it.x=p.x; g.userData.it.z=p.z;
    if(g.userData.prop!==p.kind+p.x){ if(g.userData.propM){ MAPG.hosp.remove(g.userData.propM); g.userData.propM=null; } g.userData.prop=p.kind+p.x;
      if(p.st===0&&p.kind==='crate'){ const c=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),M.crate||tmMats().dark); c.position.set(p.x,fb+0.3,p.z); MAPG.hosp.add(c); g.userData.propM=c; }
      if(p.st===0&&p.kind==='shelf'){ const c=new THREE.Group(); const st=tmMats().steel; for(const y of [0.4,0.8,1.2]) v9Mesh(new THREE.BoxGeometry(0.9,0.04,0.45),st,c,0,y,0); for(const sx of [-0.43,0.43]) for(const sz of [-0.2,0.2]) v9Mesh(new THREE.BoxGeometry(0.04,1.25,0.04),st,c,sx,0.62,sz); c.position.set(p.x,fb,p.z); MAPG.hosp.add(c); g.userData.propM=c; } } });
  updateMissionHud(); }
function tmPick(i,by){ const p=TM.parts[i]; if(!p||p.st!==0) return; p.st=1; p.by=by; if(by==='me'){ TM.carry=i; banner(TM_PARTS[i].n.toUpperCase(),'Leve até a máquina do tempo, no quintal. Só dá para carregar uma peça por vez.','gold'); } tmVis(); }
function tmInstall(i){ const p=TM.parts[i]; if(!p||p.st===2) return; p.st=2; tmVis(); const n=tmCount(); const m=TM.meshes[i]; if(m){ v9Flash('#6ac8ff',0.25,0.5); emit('spark',TM.x,1.6,TM.z,30,4,0.6,-1); }
  try{ Snd.repair('nail',TM.x,TM.z); Snd.zap(TM.x,TM.z,2); }catch(e){}
  banner(n<10?`PEÇA ${n}/10 MONTADA`:'A MÁQUINA DO TEMPO ESTÁ PRONTA',n<10?`${TM_PARTS[i].n} no lugar. Faltam ${10-n}.`:'Juntem todos perto dela e segurem E para viajar','gold'); }
V9NET.act.tmp=(peer,a)=>tmPick(a[2]|0,peer);
V9NET.act.tmi=(peer,a)=>tmInstall(a[2]|0);
V9NET.act.tmgo=()=>{ if(tmAllIn()) tmGo(); };
V9NET.ev.tmgo=()=>tmCine();
V9HS.get.tm=()=>CUR==='hosp'?[TM.parts.map(p=>[p.st,r10(p.x),r10(p.z),Math.round(p.y*100),['floor','crate','shelf','boss'].indexOf(p.kind)]),TM.lab?1:0]:0;
V9HS.set.tm=v=>{ if(!v||CUR!=='hosp') return; const L=v[0]; let ch=false; if(Array.isArray(L)) L.forEach((e,i)=>{ const p=TM.parts[i]||(TM.parts[i]={}); const st=e[0]|0; if(TM.carry===i&&st===0) return; if(p.st!==st||p.x!==e[1]/10){ ch=true; p.st=st; p.x=e[1]/10; p.z=e[2]/10; p.y=e[3]/100; p.kind=['floor','crate','shelf','boss'][e[4]|0]; } });
  if(ch) tmVis(); if(v[1]&&!TM.lab&&!TM.cine) labApply(); };
/* chefes: o 1º e o 2º deixam cair uma peça cada */
const _v9bossDown=bossDown;
bossDown=function(name){ _v9bossDown(name); if(CUR!=='hosp'||NET.mode==='client'||TM.lab) return; const i=TM.parts.findIndex(p=>p.st===3); if(i<0) return; TM.bossDrops++;
  const z=G.boss||zombies.find(q=>q.bossKi!=null)||{pos:{x:P.pos.x,z:P.pos.z}}; const bz=zombies.filter(q=>q.dead&&q.bossKi!=null).pop(); const at2=bz?bz.pos:z.pos;
  TM.parts[i]={st:0,x:at2.x,z:at2.z,y:0.12,kind:'floor'}; tmVis(); banner('O CHEFE DEIXOU CAIR UMA PEÇA',TM_PARTS[i].n,'gold'); };
v9On('frame',dt=>{ if(CUR!=='hosp'||!TM.g) return;
  const n=tmCount(); TM.light.intensity=0.4+n*0.12+(TM.cine?3:0); TM.baseRing.material.opacity=0.35+Math.sin(G.t*3)*0.15+n*0.03;
  // anéis giram quando montados; peças soltas giram e brilham
  const iA=TM_PARTS.findIndex(q=>q.k==='ringA'), iB=TM_PARTS.findIndex(q=>q.k==='ringB'), iC=TM_PARTS.findIndex(q=>q.k==='core');
  const sp=tmAllIn()?3:1; TM.meshes[iA].rotation.y+=dt*0.6*sp; TM.meshes[iA].rotation.x=Math.sin(G.t*0.5)*0.4; TM.meshes[iB].rotation.x+=dt*0.9*sp; TM.meshes[iB].rotation.z=Math.cos(G.t*0.4)*0.5; TM.meshes[iC].rotation.y+=dt*1.5;
  for(const g of TM.worldG){ if(!g.visible) continue; g.rotation.y+=dt*0.9; g.userData.halo.material.opacity=0.35+Math.sin(G.t*4)*0.15; }
  if(TM.carry>=0&&P.down) { /* derruba a peça onde caiu */ const i=TM.carry; TM.carry=-1; TM.parts[i]={st:0,x:P.pos.x,z:P.pos.z,y:0.12,kind:'floor'}; if(NET.mode==='client') netAct(['tmd',i,r10(P.pos.x),r10(P.pos.z)]); tmVis(); }
  if(n>=10&&Math.random()<dt*10) emit('elec',TM.x+rand(-1.5,1.5),rand(0.5,2.8),TM.z+rand(-1.5,1.5),2,2,0.3,0); });
V9NET.act.tmd=(peer,a)=>{ const i=a[2]|0; TM.parts[i]={st:0,x:a[3]/10,z:a[4]/10,y:0.12,kind:'floor'}; tmVis(); };
/* objetivo no painel */
const _v9obj=objectiveDescription;
objectiveDescription=function(map){ map=map||CUR; if(map==='hosp'&&TM.lab) return ['LABORATÓRIO DO FUTURO','O hospício virou o laboratório que buscava a cura. Foi invadido. Tudo aqui é mais forte e mais caro.','ANO 2087 · SOBREVIVA'];
  if(map==='hosp'&&mapObjectiveGateOpen('hosp')&&!G.surgeActive) return ['MONTE A MÁQUINA DO TEMPO',TM.carry>=0?`Leve ${TM_PARTS[TM.carry].n.toLowerCase()} até a máquina no quintal.`:'Ache as peças pelo hospício (camas, prateleiras, cantos) — duas estão com os chefes.',`PEÇAS ${tmCount()}/10`];
  if(map==='city') return cityObjective(); return _v9obj(map); };

/* ---- a viagem ---- */
function tmGo(){ if(TM.cine||TM.lab) return; pushEv(['tmgo']); tmCine(); }
function tmCine(){ if(TM.cine) return; TM.cine=true; TM.goT=0; try{ Snd.sample('timewarp',{vol:1.2,prio:true}); Snd.distant(TM.x,TM.z); }catch(e){}
  const ov=v9El('div','tmcine',`<canvas></canvas><div class="tm-yr">1955 → 2087</div>`); document.body.appendChild(ov); const cv=ov.querySelector('canvas'); const cx2=cv.getContext('2d');
  // retratos de todos na partida
  const heads=[]; const addH=(c,v,nm)=>{ const img=new Image(); try{ img.src=charThumb3d(c,v); }catch(e){} heads.push({img,nm,ph:Math.random()*6}); };
  addH(PROG.char,PROG.cv,'Você'); for(const rp of NET.players.values()) if(rp.has&&rp.char) addH(rp.char,rp.cv,nameOf(rp.by));
  const t0=performance.now(); let half=false;
  const step=now=>{ const t=(now-t0)/1000; const W=cv.width=innerWidth, H=cv.height=innerHeight; const c=cx2; c.fillStyle=`rgba(4,6,18,${t<0.6?t/0.6:1})`; c.fillRect(0,0,W,H);
    // túnel: anéis que vêm na direção da tela
    for(let i=0;i<34;i++){ const z=((i/34)+t*0.55)%1, r=Math.pow(z,2.4)*Math.max(W,H)*1.1; const a=(1-z)*0.9;
      c.strokeStyle=`hsla(${200+i*7+t*60},90%,${50+z*20}%,${a*0.8})`; c.lineWidth=2+z*10; c.beginPath(); c.ellipse(W/2+Math.sin(t*2+i)*z*40,H/2+Math.cos(t*1.7+i)*z*30,r,r*0.62,t*0.5+i*0.2,0,Math.PI*2); c.stroke(); }
    // riscos de luz e números de relógio
    for(let i=0;i<60;i++){ const a=i*2.399+t*0.3, d=((i*37%100)/100+t*0.9)%1; const x=W/2+Math.cos(a)*d*W*0.7, y=H/2+Math.sin(a)*d*H*0.7; c.strokeStyle=`rgba(180,220,255,${d*0.7})`; c.lineWidth=1+d*2; c.beginPath(); c.moveTo(x,y); c.lineTo(x+Math.cos(a)*d*60,y+Math.sin(a)*d*60); c.stroke(); }
    c.font='bold 26px "Stardos Stencil", Impact'; c.textAlign='center'; for(let i=0;i<12;i++){ const a=i/12*Math.PI*2+t*1.4, r=Math.min(W,H)*0.36*(1+Math.sin(t*3)*0.05); c.fillStyle=`rgba(255,220,140,${0.25+0.2*Math.sin(t*4+i)})`; c.fillText(['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'][i],W/2+Math.cos(a)*r,H/2+Math.sin(a)*r*0.62); }
    // os personagens viajando juntos, girando no meio do túnel
    heads.forEach((h,i)=>{ const n=heads.length, a=i/n*Math.PI*2+t*1.1, rr=n>1?Math.min(W,H)*0.12:0; const x=W/2+Math.cos(a)*rr+Math.sin(t*3+h.ph)*12, y=H/2+Math.sin(a)*rr*0.7+Math.cos(t*2.6+h.ph)*10; const s=Math.min(W,H)*0.2*(0.9+Math.sin(t*2+h.ph)*0.08);
      c.save(); c.translate(x,y); c.rotate(Math.sin(t*1.5+h.ph)*0.35); c.shadowColor='#6ac8ff'; c.shadowBlur=40; if(h.img.complete&&h.img.naturalWidth) c.drawImage(h.img,-s/2,-s/2,s,s); c.shadowBlur=0; c.fillStyle='#cfe8ff'; c.font='14px "Special Elite", monospace'; c.fillText(h.nm,0,s/2+16); c.restore(); });
    const fl=t>5.2?Math.min(1,(t-5.2)/0.6):0; if(fl){ c.fillStyle=`rgba(255,255,255,${fl})`; c.fillRect(0,0,W,H); }
    if(t>3.2&&!half){ half=true; labApply(); }
    if(t<6.6) requestAnimationFrame(step); else { ov.classList.add('out'); setTimeout(()=>ov.remove(),900); TM.cine=false; banner('ANO 2087','O hospício virou o laboratório que buscava a cura. Ele foi invadido e abandonado.','red'); shake(0.6); }
  }; requestAnimationFrame(step); }
v9Css(`.tmcine{position:fixed;inset:0;z-index:80;pointer-events:none;transition:opacity .9s}.tmcine.out{opacity:0}.tmcine canvas{width:100%;height:100%;display:block}
.tmcine .tm-yr{position:absolute;left:50%;bottom:12%;transform:translateX(-50%);font:700 46px "Stardos Stencil",Impact;letter-spacing:.2em;color:#e8f4ff;text-shadow:0 0 20px #6ac8ff;animation:tmYr 6.5s ease forwards}
@keyframes tmYr{0%{opacity:0;letter-spacing:.6em}30%{opacity:1}80%{opacity:1;letter-spacing:.2em}100%{opacity:0}}`);
/* ---- o laboratório: mesmo prédio, transformado ---- */
const LAB={tinted:new Map(),g:null};
function labApply(){ if(TM.lab) return; TM.lab=true; Object.assign(V9DIFF,{hp:1.9,dmg:1.5,spd:1.15,cost:2,pts:1.3});
  // materiais do hospício viram aço frio de laboratório
  const steel=new THREE.Color(0x6a7a86); MAPG.hosp.traverse(o=>{ if(!o.isMesh&&!o.isInstancedMesh) return; for(const m of [].concat(o.material||[])){ if(!m||LAB.tinted.has(m)||!m.color||m.transparent||m.isShaderMaterial) continue;
    LAB.tinted.set(m,{c:m.color.getHex(),e:m.emissive?m.emissive.getHex():null}); m.color.lerp(steel,0.55).multiplyScalar(0.8); if(m.emissive&&m.emissive.getHex()===0) m.emissive.setHex(0x020a0a); } });
  for(const l of lamps) if(l.map==='hosp'&&l.L&&l.L.color){ l._c=l.L.color.getHex(); l.L.color.setHex(Math.random()<0.35?0xff2a1a:0x6affd8); }
  scene.fog.color.setHex(0x061412); scene.background.setHex(0x020806); MAPS.hosp._fd=MAPS.hosp.fogD; scene.fog.density=MAPS.hosp.fogD*1.15; if(hemi){ hemi.color.setHex(0x5ac8b0); hemi.groundColor.setHex(0x0a1410); }
  labDress(); for(const m of TM.meshes) tmSetGhost(m,false);
  if(NET.mode!=='client'){ for(const z of zombies.slice()) if(!z.dead) { z.hp*=1.9; z.maxHp*=1.9; } } }
function labUndo(){ if(!TM.lab&&!LAB.g) return; TM.lab=false; Object.assign(V9DIFF,{hp:1,dmg:1,spd:1,cost:1,pts:1});
  for(const [m,v] of LAB.tinted){ m.color.setHex(v.c); if(v.e!=null&&m.emissive) m.emissive.setHex(v.e); } LAB.tinted.clear();
  for(const l of lamps) if(l._c!=null){ l.L.color.setHex(l._c); l._c=null; } if(LAB.g){ LAB.g.parent&&LAB.g.parent.remove(LAB.g); LAB.g=null; } }
function labDress(){ if(LAB.g) return; const g=new THREE.Group(); LAB.g=g; MAPG.hosp.add(g); const M=tmMats();
  const hz2=tex(256,64,(c,w,h)=>{ for(let i=-2;i<12;i++){ c.fillStyle=i%2?'#111':'#e8c43a'; c.beginPath(); c.moveTo(i*32,0); c.lineTo(i*32+32,0); c.lineTo(i*32,h); c.lineTo(i*32-32,h); c.fill(); } });
  const sign=tex(512,256,(c,w,h)=>{ c.fillStyle='#e8e4d8'; c.fillRect(0,0,w,h); c.fillStyle='#b01a10'; c.fillRect(0,0,w,64); c.fillStyle='#fff'; c.font='bold 40px Impact'; c.textAlign='center'; c.fillText('ÁREA RESTRITA',w/2,46); c.fillStyle='#111'; c.font='bold 44px "Stardos Stencil", Impact'; c.fillText('PROJETO CURA',w/2,130); c.font='22px monospace'; c.fillText('LAB. B-7 · NÍVEL DE RISCO 4',w/2,176); c.strokeStyle='#111'; c.lineWidth=6; c.beginPath(); c.arc(w/2,220,22,0,Math.PI*2); c.stroke(); });
  const hazM=new THREE.MeshLambertMaterial({map:hz2}), signM=new THREE.MeshLambertMaterial({map:sign}), bench=new THREE.MeshPhongMaterial({color:0xc8ccd0,shininess:60}), liquid=new THREE.MeshBasicMaterial({color:0x3aff8a,transparent:true,opacity:0.45}), broken=new THREE.MeshPhongMaterial({color:0x9ad8ff,transparent:true,opacity:0.3,shininess:140,side:THREE.DoubleSide});
  const scr=new THREE.MeshBasicMaterial({map:tex(256,160,(c,w,h)=>{ c.fillStyle='#03140c'; c.fillRect(0,0,w,h); c.fillStyle='#4aff8a'; c.font='14px monospace'; ['AMOSTRA 117: FALHA','REJEIÇÃO CELULAR 98%','CONTENÇÃO: ROMPIDA','EVACUAR NÍVEL B','>>> ERRO 0x00CURA'].forEach((l,i)=>c.fillText(l,10,24+i*26)); c.strokeStyle='#4aff8a'; c.beginPath(); for(let x=0;x<w;x+=6) c.lineTo(x,140+Math.sin(x*0.2)*10*Math.random()); c.stroke(); })});
  const zoneCells=[]; for(let z=hz(-21);z<=hz(21);z++) for(let x=hx(1);x<=hx(30);x++){ if(!inB(x,z)||grid[z][x]!=='.'||propCell[z*MW+x]||RAMPC[z*MW+x]>=0) continue; const r=roomOf[z][x]; if(!r||OUTR.has(r)) continue; let wall=null; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) if(at(x+dx,z+dz)==='#') wall=[dx,dz]; if(wall) zoneCells.push([x,z,wall]); }
  zoneCells.sort(()=>Math.random()-0.5);
  zoneCells.slice(0,46).forEach(([x,z,[dx,dz]],i)=>{ const px=cx(x)+dx*0.55, pz=cx(z)+dz*0.55, fy=floorAt(cx(x),cx(z)); const ry=Math.atan2(-dx,-dz); const o=new THREE.Group(); o.position.set(px,fy,pz); o.rotation.y=ry; g.add(o);
    const k=i%5;
    if(k===0){ // tubo de contenção com um corpo flutuando
      v9Mesh(new THREE.CylinderGeometry(0.42,0.42,0.18,18),M.dark,o,0,0.09,0); v9Mesh(new THREE.CylinderGeometry(0.42,0.42,0.18,18),M.dark,o,0,2.3,0);
      const glass=v9Mesh(new THREE.CylinderGeometry(0.38,0.38,2.1,18,1,true),i%10===0?broken:M.glass,o,0,1.2,0); if(i%10!==0){ v9Mesh(new THREE.CylinderGeometry(0.36,0.36,1.9,16),liquid,o,0,1.15,0); const b=v9Mesh(new THREE.CylinderGeometry(0.14,0.12,1.1,10),new THREE.MeshLambertMaterial({color:0x4a6a4a}),o,0,1.2,0); b.rotation.z=0.1; }
      else for(let s=0;s<8;s++){ const sh=v9Mesh(new THREE.PlaneGeometry(rand(0.1,0.3),rand(0.1,0.3)),broken,o,rand(-0.6,0.6),0.01,rand(-0.6,0.6),-Math.PI/2,0,rand(0,6)); } }
    else if(k===1){ v9Mesh(new THREE.BoxGeometry(1.4,0.06,0.6),bench,o,0,0.88,0); for(const sx of [-0.62,0.62]) v9Mesh(new THREE.BoxGeometry(0.06,0.88,0.55),bench,o,sx,0.44,0); v9Mesh(new THREE.BoxGeometry(0.42,0.3,0.05),M.dark,o,0.3,1.08,-0.15,-0.2,0,0); v9Mesh(new THREE.PlaneGeometry(0.38,0.25),scr,o,0.3,1.09,-0.12,-0.2,0,0);
      for(let s=0;s<4;s++) v9Mesh(new THREE.CylinderGeometry(0.03,0.04,0.14,8),M.glass,o,-0.4+s*0.12,0.98,0.1); }
    else if(k===2){ v9Mesh(new THREE.PlaneGeometry(1.0,0.5),signM,o,0,1.6,-0.5+0.04); }
    else if(k===3){ v9Mesh(new THREE.PlaneGeometry(1.8,0.22),hazM,o,0,0.02,0.2,-Math.PI/2,0,0); for(let s=0;s<6;s++) v9Mesh(new THREE.PlaneGeometry(0.21,0.28),new THREE.MeshLambertMaterial({color:0xe8e2d0,side:THREE.DoubleSide}),o,rand(-0.8,0.8),0.012,rand(-0.3,0.6),-Math.PI/2,0,rand(0,6)); }
    else { const L=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.09,0.12,10),new THREE.MeshBasicMaterial({color:0xff2a1a})); L.position.set(0,2.6,-0.4); o.add(L); const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff2010,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.7})); sp.scale.set(1.6,1.6,1); sp.position.copy(L.position); o.add(sp); LAB.alarms=(LAB.alarms||[]); LAB.alarms.push(sp); } });
}
v9On('frame',dt=>{ if(!TM.lab||!LAB.alarms) return; for(let i=0;i<LAB.alarms.length;i++) LAB.alarms[i].material.opacity=0.2+0.6*Math.max(0,Math.sin(G.t*6+i)); });
v9On('reset',()=>{ try{ if(TM.g) tmReset(); else labUndo(); }catch(e){ console.warn('[Bunker v9] máquina do tempo',e); } });
