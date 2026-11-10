/* ================= v9 · BUNKER → CARRO → CIDADE DESTRUÍDA → CHEFE MUTANTE =================
   Lá fora do bunker tem um carro sem 10 peças, espalhadas pelo bunker (perto de caixas, em prateleiras, nos cantos).
   Montar cada uma leva 3 s. Com tudo montado, todos entram no carro, alguém segura E por 3 s, o motor pega e o grupo vai
   para a cidade: as rodadas recomeçam do zero, mas armas, níveis e cartas ficam. Depois de 3 rodadas na cidade, o chefe
   aparece no centro, com animação de entrada para todos. Escudo nas costas, queda no solo, ácido. */
MAPS.city={name:'Cidade Destruída',start:[cx(23.5),cx(czr(53))],start2:[cx(24.5),cx(czr(53))],room:'CS',menu:{x:cx(24),z:cx(czr(56)),yaw:0},fog:0x1a1410,fogD:0.028,bg:0x0c0806,sky:'bunker'};
MAPG.city=new THREE.Group(); scene.add(MAPG.city); MAPG.city.visible=false;
const V9_WB=[];
WEAPONS.xbow.cost=2500; WEAPONS.xbow.ammo=800;
function cityRegister(){ const c=czr;
  V9_WB.push({id:'mp40',cell:[12,c(2)],n:[0,1]},{id:'thompson',cell:[8,c(18)],n:[0,1]},{id:'stg44',cell:[2,c(20)],n:[1,0]},{id:'bar',cell:[9,c(44)],n:[0,1]},{id:'garand',cell:[9,c(56)],n:[0,-1]},
    {id:'kar98k',cell:[2,c(47)],n:[1,0]},{id:'xbow',cell:[2,c(53)],n:[1,0]},{id:'db',cell:[38,c(2)],n:[0,1]},{id:'ppsh',cell:[34,c(18)],n:[0,1]},{id:'nades',cell:[34,c(30)],n:[0,-1]},{id:'trench',cell:[34,c(44)],n:[0,1]});
  PERK_BY.armor.spots.push({cell:[5,c(12)],n:[0,-1]}); PERK_BY.speed.spots.push({cell:[40,c(3)],n:[0,1]}); PERK_BY.rof.spots.push({cell:[12,c(27)],n:[0,-1]});
  PERK_BY.revive.spots.push({cell:[34,c(55)],n:[0,-1]}); PERK_BY.mule.spots.push({cell:[42,c(29)],n:[0,-1]});
  for(const b of [{cells:[[11,c(3)],[12,c(3)]],n:[0,1],room:'CM'},{cells:[[35,c(45)],[36,c(45)]],n:[0,1],room:'CK'},{cells:[[42,c(12)],[43,c(12)]],n:[0,-1],room:'CB'}]){ b.map='city'; BOX.spots.push(b); }
  LEVER_SPOTS.push({x:32,z:c(19),n:[0,1]}); AF_SPOTS.push({cells:[[8,c(55)],[9,c(55)]],n:[0,-1]});
  AMMO_SPOTS.push({x:15,z:c(45),n:[-1,0],map:'city'},{x:32,z:c(12),n:[1,0],map:'city'});
  // bunker: o carro também tem um ponto de munição perto
}
/* ---- montagem da cidade ---- */
function buildCity(){ const M3=TZG.M||tzBuildMats(); const root=MAPG.city; const z0=CZ0, z1=CZ1; const zc=(z0*S+(z1+1)*S)/2, len=(z1-z0+1)*S;
  // chão: terra/entulho em volta, asfalto rachado na rua e nas transversais, calçadas
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(MW*S+60,len+40),M3.dirt); gnd.rotation.x=-Math.PI/2; gnd.position.set(MW*S/2,0,zc); root.add(gnd);
  const road=M3.road; const rd=new THREE.Mesh(new THREE.PlaneGeometry(20,len),road); rd.rotation.x=-Math.PI/2; rd.position.set(cx(23.5),0.03,zc); const uv=rd.geometry.attributes.uv; for(let i=0;i<uv.count;i++) uv.setY(i,uv.getY(i)*len/24); root.add(rd);
  for(const r of [16,40]){ const t=new THREE.Mesh(new THREE.PlaneGeometry(MW*S,6),road); t.rotation.set(-Math.PI/2,0,Math.PI/2); t.position.set(MW*S/2,0.06,cx(czr(r))); root.add(t); }
  const side=new THREE.MeshLambertMaterial({color:0x5a5650}); for(const sx of [cx(17)+0.2,cx(30)-0.2]){ const s2=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.16,len-4),side); s2.position.set(sx,0.08,zc); root.add(s2); }
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(9,40),M3.floorC); plaza.rotation.x=-Math.PI/2; plaza.position.set(cx(23.5),0.09,cx(czr(33.5))); root.add(plaza);
  // paredes: tijolo/reboco por fora (cada loja de um jeito), reboco/azulejo por dentro
  const outM={CM:M3.brick,CF:M3.plaster,CA:M3.brickG,CB:M3.brick,CP:M3.conc,CK:M3.concDark}, inM={CM:M3.tiles,CF:M3.tiles,CA:M3.panel,CB:M3.paper,CP:M3.plaster,CK:M3.panel};
  const g=new THREE.Group(); const H=WH+0.65;
  for(let z=z0;z<=z1;z++) for(let x=0;x<MW;x++){ if(grid[z][x]!=='#') continue; let own=null; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){ const r=inB(x+dx,z+dz)?roomOf[z+dz][x+dx]:null; if(r&&r!=='CS'){ own=r; break; } }
    tzBx(g,S,H,S,outM[own]||M3.brick,cx(x),H/2,cx(z));
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ const r=inB(x+dx,z+dz)?roomOf[z+dz][x+dx]:null, cc=at(x+dx,z+dz); if(!r||r==='CS'||cc==='#') continue; tzPl(g,S,ROOM_CEIL,inM[r]||M3.plaster,cx(x)+dx*(S/2+0.01),ROOM_CEIL/2,cx(z)+dz*(S/2+0.01),0,Math.atan2(dx,dz)); } }
  bake(g);
  for(const s of CITY_SHOPS){ const fl={CM:M3.floorT,CF:M3.floorD,CA:M3.floorW,CB:M3.floorW,CP:M3.floorT,CK:M3.floorC}[s.id]; tzRoofed(s.x0,czr(s.r0),s.x1,czr(s.r1),fl,M3.ceil,M3.roof,{trim:M3.trim}); cityShop(s,M3); }
  // borda da cidade: cerca de alambrado com arame farpado em volta de tudo, mata fechada depois dela e, bem no fundo, a silhueta dos prédios
  { const X0=-3, X1=MW*S+3, Z0=z0*S-3, Z1=(z1+1)*S+3; const post=new THREE.MeshLambertMaterial({color:0x3a3c3e}), wireM=new THREE.MeshBasicMaterial({color:0x2a2c2e,transparent:true,opacity:0.55,side:THREE.DoubleSide,depthWrite:false});
    const meshT=tex(64,64,(c,w,h)=>{ c.clearRect(0,0,w,h); c.strokeStyle='rgba(150,150,150,1)'; c.lineWidth=2; for(let i=-64;i<128;i+=16){ c.beginPath(); c.moveTo(i,0); c.lineTo(i+64,64); c.stroke(); c.beginPath(); c.moveTo(i+64,0); c.lineTo(i,64); c.stroke(); } }); meshT.wrapS=meshT.wrapT=THREE.RepeatWrapping;
    const fenceM=new THREE.MeshLambertMaterial({map:meshT,transparent:true,alphaTest:0.3,side:THREE.DoubleSide,color:0x8a8a88});
    const side=(ax,az,bx,bz)=>{ const L=Math.hypot(bx-ax,bz-az), ang=Math.atan2(bx-ax,bz-az); const n=Math.ceil(L/3);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(L,2.6),fenceM.clone()); pl.material.map=meshT.clone(); pl.material.map.repeat.set(L/1.2,2.6/1.2); pl.material.map.needsUpdate=true; pl.position.set((ax+bx)/2,1.3,(az+bz)/2); pl.rotation.y=ang+Math.PI/2; root.add(pl);
      for(let i=0;i<=n;i++){ const t=i/n, x=ax+(bx-ax)*t, z=ax===bx?az+(bz-az)*t:az+(bz-az)*t; const g=G3(x,0,z); tzBx(g,0.08,2.9,0.08,post,0,1.45,0); const arm=tzBx(g,0.05,0.5,0.05,post,0,3.05,0.15); arm.rotation.x=0.6; bake(g); }
      for(const [y,o] of [[2.75,0],[2.95,0.12],[3.15,0.24]]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,L,4),wireM); w.rotation.z=Math.PI/2; w.rotation.y=ang+Math.PI/2; w.position.set((ax+bx)/2+Math.cos(ang)*o,y,(az+bz)/2-Math.sin(ang)*o); root.add(w); } };
    side(X0,Z0,X1,Z0); side(X0,Z1,X1,Z1); side(X0,Z0,X0,Z1); side(X1,Z0,X1,Z1);
    // mata: pinheiros escuros e árvores secas em várias fileiras depois da cerca
    const pine=new THREE.MeshLambertMaterial({color:0x14201a}), pine2=new THREE.MeshLambertMaterial({color:0x1c2a20}), bark=new THREE.MeshLambertMaterial({color:0x2a221c});
    const tree=(x,z)=>{ if(Math.random()<0.28){ const t=tzDeadTree(); t.position.set(x,0,z); t.scale.setScalar(rand(0.9,1.5)); bake(t); return; }
      const g=G3(x,0,z,rand(0,6)); const h=rand(7,14); tzBx(g,0.3,h*0.4,0.3,bark,0,h*0.2,0); const m=Math.random()<0.5?pine:pine2;
      for(let k=0;k<4;k++){ const c=new THREE.Mesh(new THREE.ConeGeometry(h*(0.32-k*0.06),h*0.38,7),m); c.position.y=h*(0.3+k*0.17); g.add(c); } bake(g); };
    for(let d=4;d<34;d+=rand(3,4.5)){ for(let x=X0-d;x<X1+d;x+=rand(2.8,4.5)){ tree(x+rand(-1,1),Z0-d+rand(-1,1)); tree(x+rand(-1,1),Z1+d+rand(-1,1)); }
      for(let z=Z0;z<Z1;z+=rand(2.8,4.5)){ tree(X0-d+rand(-1,1),z+rand(-1,1)); tree(X1+d+rand(-1,1),z+rand(-1,1)); } }
    // silhueta da cidade lá no fundo: blocos escuros com poucas janelas acesas, sem neblina, recortados no céu
    const winT=tex(64,128,(c,w,h)=>{ c.fillStyle='#07080b'; c.fillRect(0,0,w,h); for(let y=6;y<h-4;y+=12) for(let x=5;x<w-4;x+=12){ const r=Math.random(); if(r<0.06){ c.fillStyle=r<0.03?'#ff9a40':'#c0602a'; c.fillRect(x,y,5,6); } } }); winT.wrapS=winT.wrapT=THREE.RepeatWrapping;
    const silM=new THREE.MeshBasicMaterial({map:winT,fog:false,color:0x9aa0b0});
    const cxm=(X0+X1)/2, czm=(Z0+Z1)/2, R=Math.max(X1-X0,Z1-Z0)/2+95;
    for(let a=0;a<Math.PI*2;a+=rand(0.05,0.11)){ const w=rand(10,26), h=rand(18,60), d=rand(10,20); const geo=new THREE.BoxGeometry(w,h,d); const u=geo.attributes.uv; for(let k=0;k<u.count;k++) u.setXY(k,u.getX(k)*w/8,u.getY(k)*h/14);
      const m=new THREE.Mesh(geo,silM); const rr=R+rand(0,40); m.position.set(cxm+Math.cos(a)*rr,h/2-2,czm+Math.sin(a)*rr*1.1); m.rotation.y=-a; m.renderOrder=-1; root.add(m);
      if(Math.random()<0.25){ const top=new THREE.Mesh(new THREE.BoxGeometry(w*0.15,h*0.3,d*0.15),silM); top.position.set(m.position.x,h+h*0.15-2,m.position.z); root.add(top); } } }
  // rua: carros destruídos, ônibus tombado, sacos de areia, estátua, postes, fogo, entulho, cratera
  const cars=[[20.5,7,0.2],[19.5,25,1.4],[27.5,42,2.8],[21.5,47.5,0.9],[25.5,52.5,-0.4]]; for(const [c0,r,ry] of cars){ const x=cx(c0), z=cx(czr(r)); if(PH.models.covered_car&&Math.random()<0.5) hProp('covered_car',x,z,ry,4.4,{box:false}); else cityWreck(x,z,ry); }
  if(PH.models.tz_bus){ const bus=new THREE.Group(); phPlace('tz_bus',0,0,0,0,1,{parent:bus,keep:true}); bus.scale.setScalar(0.95); bus.rotation.set(0,0.3,Math.PI/2.15); bus.position.set(cx(26.5)+1.4,1.3,cx(czr(13.5))); root.add(bus); }
  else cityWreck(cx(26.5),cx(czr(13.5)),1.6);
  for(let z=z0;z<=z1;z++) for(let x=0;x<MW;x++){ const c=grid[z][x]; if(c==='s'){ for(let k=0;k<3;k++) for(let i=0;i<3-k;i++){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.21,0.66,8),new THREE.MeshLambertMaterial({color:0x6a5e42})); b.rotation.set(0,0,Math.PI/2); b.position.set(cx(x)-0.6+i*0.6+k*0.3,0.2+k*0.36,cx(z)); root.add(b); } } }
  { const st=new THREE.Group(); st.position.set(cx(23.5),0,cx(czr(33.5))); const ped=v9Mat('cityStone',{color:0x8a8478,shininess:10}); v9Mesh(new THREE.CylinderGeometry(1.9,2.1,0.5,8),ped,st,0,0.25,0); v9Mesh(new THREE.BoxGeometry(1.4,1.6,1.4),ped,st,0,1.3,0);
    const brz=v9Mat('cityBronze',{color:0x3a4a3a,shininess:40,specular:0x88aa88}); v9Mesh(new THREE.CylinderGeometry(0.28,0.35,1.5,10),brz,st,0,2.85,0); v9Mesh(new THREE.SphereGeometry(0.25,12,10),brz,st,0,3.75,0); const arm=v9Mesh(new THREE.CylinderGeometry(0.08,0.08,1.1,8),brz,st,0.4,3.4,0,0,0,-1); v9Mesh(new THREE.BoxGeometry(0.5,0.1,0.06),brz,st,0.85,3.85,0,0,0,-0.3); root.add(st); }
  for(const r of [4,12,20,28,38,46,54]){ streetLamp(cx(18),cx(czr(r)),'city',0xffb070); streetLamp(cx(29),cx(czr(r+3)),'city',0xffc890); }
  for(const [c0,r] of [[22,10],[26,22],[20,36],[27,36],[24,48],[8,16],[40,40],[23,58]]) fireBarrel(cx(c0),cx(czr(r)),'city');
  const rubM=[0x5a4a3e,0x4a4440,0x6a5a48].map(c=>new THREE.MeshPhongMaterial({color:c,flatShading:true,shininess:4}));
  for(let i=0;i<140;i++){ const x=rand(2,MW*S-2), z=rand(z0*S+2,(z1+1)*S-2); const cX=Math.floor(x/S), cZ=Math.floor(z/S); if(!inB(cX,cZ)||grid[cZ][cX]!=='.'||roomOf[cZ][cX]!=='CS') continue; const s2=rand(0.1,0.5); const geo=new THREE.DodecahedronGeometry(s2,0); const m=new THREE.Mesh(geo,pick(rubM)); m.position.set(x,s2*0.35,z); m.rotation.set(rand(0,3),rand(0,3),rand(0,3)); root.add(m); }
  { const cr=new THREE.Mesh(new THREE.RingGeometry(0.4,3.2,24),new THREE.MeshLambertMaterial({color:0x0e0c0a,transparent:true,opacity:0.85})); cr.rotation.x=-Math.PI/2; cr.position.set(cx(21),0.12,cx(czr(30))); root.add(cr); }
  try{ vegScatter('city',cellsOf((x,z,c,r)=>r==='CS'&&c==='.'&&(x<17||x>30)),0.8,null,'grass',1.0); }catch(e){}
  // o carro em que o grupo chegou
  if(PH.models.covered_car){ const p=hProp('covered_car',cx(24.5),cx(czr(55.5)),Math.PI,4.4); }
}
function cityWreck(x,z,ry){ const g=G3(x,0,z,ry); const rust=v9Mat('cityRust',{color:0x4a2a1c,shininess:20}), dark=v9Mat('cityBlack',{color:0x111111,shininess:5}), glass=v9Mat('cityGlass',{color:0x182028,shininess:90,transparent:true,opacity:0.6});
  tzBx(g,1.9,0.7,4.2,rust,0,0.55,0); tzBx(g,1.7,0.6,2.0,rust,0,1.15,0.2); tzBx(g,1.62,0.5,0.05,glass,0,1.15,-0.82); for(const [sx,sz] of [[-0.9,-1.3],[0.9,-1.3],[-0.9,1.3]]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.25,12),dark); w.rotation.z=Math.PI/2; w.position.set(sx,0.34,sz); g.add(w); }
  g.rotation.z=rand(-0.08,0.08); bake(g); fireBarrel(x+rand(-1,1),z+rand(-1,1),'city'); }
function cityShop(s,M3){ const g=new THREE.Group(); const front=s.side>0?(s.x1+1)*S+0.06:s.x0*S-0.06, zm=(cx(czr(s.r0))+cx(czr(s.r1)))/2, ry=s.side>0?Math.PI/2:-Math.PI/2;
  const col={CM:'#ffd24a',CF:'#4aff8a',CA:'#ff5a3a',CB:'#ff6ad0',CP:'#5fd6ff',CK:'#ffe6a0'}[s.id];
  const t=tex(1024,160,(c,w,h)=>{ c.clearRect(0,0,w,h); c.font=`bold 96px "Stardos Stencil", Impact, sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.shadowColor=col; c.shadowBlur=30; c.fillStyle=col; c.fillText(s.name.toUpperCase(),w/2,h/2); });
  tzPl(g,(s.r1-s.r0+1)*S*0.7,1.4,new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,fog:false}),front+(s.side>0?0.05:-0.05),WH+0.35,zm,0,ry);
  // toldo rasgado e vitrines quebradas
  const aw=new THREE.MeshLambertMaterial({color:new THREE.Color(col).multiplyScalar(0.5),side:THREE.DoubleSide}); const awn=tzBx(g,1.4,0.06,(s.r1-s.r0)*S*0.8,aw,front+s.side*0.7,2.75,zm); awn.rotation.z=s.side*0.25;
  bake(g);
  // dentro: prateleiras, balcão, mesas e o que cada loja tem
  const P0=(c0,r)=>[cx(c0),cx(czr(r))]; const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
  const props={CM:['steel_frame_shelves_01','steel_frame_shelves_01','steel_frame_shelves_01','metal_office_desk','Barrel_01','ammo_box'],CF:['steel_frame_shelves_01','steel_frame_shelves_01','metal_office_desk','chemistry_set','bunsen_burner'],
    CA:['ammo_box','ammo_box','metal_toolbox','steel_frame_shelves_01','metal_office_desk','metal_jerrycan'],CB:['WoodenTable_01','WoodenTable_01','WoodenChair_01','WoodenChair_01','Barrel_01','barrel_03'],CP:['metal_office_desk','metal_office_desk','steel_frame_shelves_01','metal_toolbox'],CK:['metal_office_desk','metal_office_desk','GothicCabinet_01','ArmChair_01']}[s.id]||[];
  for(const name of props){ for(let tries=0;tries<8;tries++){ const c0=rnd(s.x0+2,s.x1-2), r=rnd(s.r0+2,s.r1-2); const cell=czr(r); if(grid[cell][c0]!=='.'||propCell[cell*MW+c0]) continue; const [x,z]=P0(c0,r); const sz={steel_frame_shelves_01:1.9,metal_office_desk:1.5,WoodenTable_01:1.3,ArmChair_01:0.9,GothicCabinet_01:1.2,WoodenChair_01:0.6}[name]||0.6; if(!PH.models[name]) break; hProp(name,x,z,rand(0,6.28),sz,{byH:name==='steel_frame_shelves_01'?false:undefined}); break; } }
  hangingBulb(cx((s.x0+s.x1)/2),cx(czr((s.r0+s.r1)/2)),s.id,'city'); }
/* ---- o carro do bunker ---- */
const CAR_PARTS=[{k:'wheelFL',n:'Pneu dianteiro'},{k:'wheelRR',n:'Pneu traseiro'},{k:'battery',n:'Bateria'},{k:'plugs',n:'Jogo de velas'},{k:'belt',n:'Correia do motor'},{k:'radiator',n:'Radiador'},{k:'fuel',n:'Galão de gasolina'},{k:'key',n:'Chave do carro'},{k:'wheel',n:'Volante'},{k:'glass',n:'Para-brisa'}];
const CAR={g:null,x:0,z:0,ry:0,parts:[],meshes:[],worldG:[],carry:-1,holdT:0,seated:false,startT:0,going:false,seats:[]};
function carPos(){ return {x:cx(40.5),z:cx(12.5),ry:Math.PI/2}; }
function carPartMesh(k){ const M=tmMats(), g=new THREE.Group(); const add=(geo,m,x,y,z,rx,ry,rz)=>v9Mesh(geo,m,g,x,y,z,rx,ry,rz); const tire=v9Mat('carTire',{color:0x161616,shininess:8}), paint=v9Mat('carPaint',{color:0x6a1a14,shininess:80,specular:0x664444});
  switch(k){
    case 'wheelFL': case 'wheelRR': add(new THREE.TorusGeometry(0.28,0.12,10,24),tire); add(new THREE.CylinderGeometry(0.2,0.2,0.18,16),M.steel,0,0,0,Math.PI/2,0,0); for(let i=0;i<5;i++){ const a=i/5*Math.PI*2; add(new THREE.CylinderGeometry(0.02,0.02,0.2,6),M.dark,Math.cos(a)*0.1,Math.sin(a)*0.1,0,Math.PI/2,0,0); } break;
    case 'battery': add(new THREE.BoxGeometry(0.34,0.24,0.2),M.dark,0,0.12,0); add(new THREE.CylinderGeometry(0.025,0.025,0.05,8),M.red,-0.1,0.26,0); add(new THREE.CylinderGeometry(0.025,0.025,0.05,8),M.steel,0.1,0.26,0); break;
    case 'plugs': for(let i=0;i<4;i++){ add(new THREE.CylinderGeometry(0.02,0.02,0.12,8),M.steel,-0.09+i*0.06,0.06,0); add(new THREE.CylinderGeometry(0.03,0.03,0.06,6),new THREE.MeshPhongMaterial({color:0xe8e4d8}),-0.09+i*0.06,0.14,0); } add(new THREE.BoxGeometry(0.3,0.03,0.1),M.dark,0,0.01,0); break;
    case 'belt': add(new THREE.TorusGeometry(0.2,0.025,6,28),tire,0,0.2,0); break;
    case 'radiator': add(new THREE.BoxGeometry(0.7,0.45,0.08),M.steel,0,0.25,0); for(let i=0;i<10;i++) add(new THREE.BoxGeometry(0.02,0.4,0.09),M.dark,-0.3+i*0.066,0.25,0); break;
    case 'fuel': add(new THREE.BoxGeometry(0.28,0.4,0.16),M.red,0,0.2,0); add(new THREE.CylinderGeometry(0.03,0.03,0.08,8),M.dark,0.08,0.44,0); add(new THREE.BoxGeometry(0.14,0.05,0.04),M.dark,-0.04,0.42,0); break;
    case 'key': add(new THREE.BoxGeometry(0.03,0.09,0.015),M.dark,0,0.05,0); add(new THREE.BoxGeometry(0.012,0.07,0.006),M.steel,0,-0.03,0); add(new THREE.TorusGeometry(0.03,0.005,6,12),M.steel,0,0.12,0); break;
    case 'wheel': add(new THREE.TorusGeometry(0.19,0.025,8,24),tire); for(let i=0;i<3;i++) add(new THREE.BoxGeometry(0.02,0.19,0.02),M.dark,Math.sin(i*2.09)*0.09,Math.cos(i*2.09)*0.09,0,0,0,-i*2.09); add(new THREE.CylinderGeometry(0.04,0.04,0.05,10),M.dark,0,0,0,Math.PI/2,0,0); break;
    case 'glass': add(new THREE.BoxGeometry(1.3,0.6,0.03),M.glass,0,0.3,0); break; }
  g.traverse(o=>{ if(o.isMesh) o.userData.real=o.material; }); return g; }
const CAR_SLOT={wheelFL:[0.86,0.4,-1.25,0,Math.PI/2,0],wheelRR:[0.86,0.4,1.3,0,Math.PI/2,0],battery:[0.4,0.85,-1.7,0,0,0],plugs:[-0.2,0.95,-1.65,0,0,0],belt:[0,0.78,-1.95,0,Math.PI/2,0],radiator:[0,0.62,-2.05,0,0,0],fuel:[-0.6,0.62,1.95,0,0,0],key:[0.3,1.05,-0.5,0.5,0,0],wheel:[0.4,1.15,-0.45,-0.5,0,0],glass:[0,1.25,-0.75,-0.55,0,0]};
function carBuild(){ const p=carPos(); CAR.x=p.x; CAR.z=p.z; CAR.ry=p.ry; const g=new THREE.Group(); g.position.set(p.x,0,p.z); g.rotation.y=p.ry; MAPG.bunker.add(g); CAR.g=g;
  const paint=v9Mat('carPaint',{color:0x6a1a14,shininess:80,specular:0x664444}), chrome=tmMats().steel, dark=tmMats().dark, tire=v9Mat('carTire',{color:0x161616,shininess:8}), seat=v9Mat('carSeat',{color:0x3a2a20,shininess:10}), rust=v9Mat('cityRust',{color:0x4a2a1c,shininess:20});
  const add=(geo,m,x,y,z,rx,ry,rz)=>v9Mesh(geo,m,g,x,y,z,rx,ry,rz);
  add(new THREE.BoxGeometry(1.8,0.5,4.4),paint,0,0.62,0); add(new THREE.BoxGeometry(1.7,0.12,1.5),paint,0,0.92,-1.45,0.05,0,0); add(new THREE.BoxGeometry(1.7,0.5,2.2),paint,0,1.18,0.35);
  add(new THREE.BoxGeometry(1.6,0.06,2.0),dark,0,1.45,0.35); for(const sx of [-0.92,0.92]) add(new THREE.BoxGeometry(0.04,0.35,1.6),v9Mat('carWin',{color:0x101418,shininess:100,transparent:true,opacity:0.5}),sx,1.2,0.4);
  add(new THREE.BoxGeometry(1.84,0.14,0.18),chrome,0,0.45,-2.25); add(new THREE.BoxGeometry(1.84,0.14,0.18),chrome,0,0.45,2.25); for(const sx of [-0.6,0.6]) add(new THREE.CylinderGeometry(0.12,0.12,0.06,12),v9Mat('carLamp',{color:0xfff0c0,emissive:0x302010}),sx,0.68,-2.22,Math.PI/2,0,0);
  for(const [sx,sz] of [[-0.86,-1.25],[-0.86,1.3]]){ const w=add(new THREE.TorusGeometry(0.28,0.12,10,24),tire,sx,0.4,sz,0,Math.PI/2,0); }
  for(const z of [-0.2,0.9]) add(new THREE.BoxGeometry(1.4,0.45,0.5),seat,0,0.95,z);
  for(let i=0;i<8;i++) add(new THREE.CircleGeometry(rand(0.05,0.18),8),rust,rand(-0.9,0.9)*0.98,rand(0.4,0.85),2.21);
  // cavalete no lugar da roda que falta
  add(new THREE.BoxGeometry(0.3,0.3,0.3),v9Mat('carJack',{color:0x8a7a2a}),0.86,0.15,-1.25);
  CAR.meshes=CAR_PARTS.map(P0=>{ const m=carPartMesh(P0.k); const s=CAR_SLOT[P0.k]; m.position.set(s[0],s[1],s[2]); m.rotation.set(s[3],s[4],s[5]); g.add(m); tmSetGhost(m,true); return m; });
  addPropBox(p.x,p.z,2.3,1.05);
  CAR.seats=[[0.4,-0.2],[-0.4,-0.2],[0.4,0.9],[-0.4,0.9]];
  interacts.push({x:p.x,z:p.z+1.7,r:3.2,hold:true,enabled:()=>CUR==='bunker'&&!CAR.going&&(CAR.carry>=0||carAllIn()),
    text:()=>CAR.carry>=0?`${HOLD} para instalar: ${CAR_PARTS[CAR.carry].n} [${carCount()}/10]`+(CAR.holdT>0?` · ${Math.floor(CAR.holdT/3*100)}%`:''):!CAR.seated?`${PRESS} para entrar no carro`:carAllSeated()?`${HOLD} para dar a partida`+(CAR.startT>0?` · ${Math.floor(CAR.startT/3*100)}%`:''):`Esperando todos entrarem (${carSeatedN()}/${tmTotal()})`,
    holdUse:dt=>{ if(CAR.carry>=0){ CAR.holdT+=dt; if(Math.random()<dt*10) emit('spark',CAR.x+rand(-1,1),0.8,CAR.z+rand(-1,1),2,2,0.3,8); if(CAR.holdT>=3){ CAR.holdT=0; const i=CAR.carry; CAR.carry=-1; if(NET.mode==='client'){ netAct(['cpi',i]); CAR.parts[i].st=2; carVis(); } else carInstall(i); } return; }
      if(!CAR.seated){ if(IN.edges.has('use')||CAR.startT<=0){ CAR.seated=true; banner('VOCÊ ENTROU NO CARRO','Quando todos estiverem dentro, segure E para dar a partida',''); } return; }
      if(carAllSeated()){ if(CAR.startT===0) try{ Snd.sample('car_start',{vol:1.1,prio:true}); }catch(e){} CAR.startT+=dt; shake(0.05); if(CAR.startT>=3){ CAR.startT=0; if(NET.mode==='client') netAct(['cgo']); else carGo(); } } }});
  CAR.worldG=CAR_PARTS.map((P0,i)=>{ const g2=new THREE.Group(); const m=carPartMesh(P0.k); m.scale.setScalar(P0.k==='glass'?0.6:1.2); g2.add(m); const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffc040,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.5})); halo.scale.set(1.2,1.2,1); g2.add(halo); g2.userData.halo=halo; g2.visible=false; MAPG.bunker.add(g2);
    const it={x:0,z:0,r:1.4,enabled:()=>CUR==='bunker'&&CAR.parts[i]&&CAR.parts[i].st===0,text:()=>CAR.carry>=0?'Você só consegue carregar uma peça por vez':`${PRESS} para pegar: ${P0.n}`,
      use:()=>{ if(CAR.carry>=0){ Snd.deny(); flashPrompt(); return; } if(NET.mode==='client'){ netAct(['cpp',i]); CAR.parts[i].st=1; CAR.carry=i; carVis(); } else carPick(i,'me'); try{ Snd.ammoBox(); }catch(e){} }};
    interacts.push(it); g2.userData.it=it; return g2; });
}
const carCount=()=>CAR.parts.filter(p=>p.st===2).length;
const carAllIn=()=>CAR.parts.length===10&&carCount()===10;
function carSeatedN(){ let n=CAR.seated?1:0; for(const rp of NET.players.values()) if(rp.has&&rp.down!==2&&((rp.v9x|0)&1)) n++; return n; }
const carAllSeated=()=>CAR.seated&&carSeatedN()>=tmTotal();
function carReset(){ CAR.going=false; CAR.carry=-1; CAR.seated=false; CAR.startT=0; CAR.holdT=0;
  const rooms=['A','B','C','D','F','G','E']; const cands=[]; for(let z=0;z<=46;z++) for(let x=0;x<MW;x++){ if(grid[z][x]!=='.'||!rooms.includes(roomOf[z][x])||propCell[z*MW+x]) continue; let w=0; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ const c=at(x+dx,z+dz); if(c==='#'||c==='c'||c==='x') w++; } if(w) cands.push([x,z]); }
  cands.sort(()=>Math.random()-0.5); const out=[], byR={}; for(const c of cands){ const r=roomOf[c[1]][c[0]]; if((byR[r]|0)>=2) continue; if(out.some(o=>Math.hypot(o[0]-c[0],o[1]-c[1])<4)) continue; byR[r]=(byR[r]|0)+1; out.push(c); if(out.length>=10) break; }
  CAR.parts=CAR_PARTS.map((_,i)=>{ const c=out[i]||[cx(5),cx(7)]; const kind=['floor','crate','shelf'][i%3]; return {st:0,x:cx(c[0])+rand(-0.3,0.3),z:cx(c[1])+rand(-0.3,0.3),y:kind==='floor'?0.12:kind==='crate'?0.72:1.32,kind}; });
  carVis(); }
function carVis(){ if(!CAR.g) return; CAR.meshes.forEach((m,i)=>tmSetGhost(m,!(CAR.parts[i]&&CAR.parts[i].st===2)));
  CAR.worldG.forEach((g,i)=>{ const p=CAR.parts[i]; g.visible=!!p&&p.st===0; if(!p) return; g.position.set(p.x,p.y,p.z); g.userData.it.x=p.x; g.userData.it.z=p.z;
    if(g.userData.prop!==p.kind+p.x){ if(g.userData.propM){ MAPG.bunker.remove(g.userData.propM); g.userData.propM=null; } g.userData.prop=p.kind+p.x;
      if(p.st===0&&p.kind==='crate'){ const c=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.6,0.7),M.crate||tmMats().dark); c.position.set(p.x,0.3,p.z); MAPG.bunker.add(c); g.userData.propM=c; }
      if(p.st===0&&p.kind==='shelf'){ const c=new THREE.Group(); const st=tmMats().steel; for(const y of [0.4,0.8,1.2]) v9Mesh(new THREE.BoxGeometry(0.9,0.04,0.45),st,c,0,y,0); for(const sx of [-0.43,0.43]) for(const sz of [-0.2,0.2]) v9Mesh(new THREE.BoxGeometry(0.04,1.25,0.04),st,c,sx,0.62,sz); c.position.set(p.x,0,p.z); MAPG.bunker.add(c); g.userData.propM=c; } } }); updateMissionHud(); }
function carPick(i,by){ const p=CAR.parts[i]; if(!p||p.st!==0) return; p.st=1; if(by==='me'){ CAR.carry=i; banner(CAR_PARTS[i].n.toUpperCase(),'Leve até o carro, lá fora do bunker. Uma peça por vez.','gold'); } carVis(); }
function carInstall(i){ const p=CAR.parts[i]; if(!p||p.st===2) return; p.st=2; carVis(); const n=carCount(); try{ Snd.repair('nail',CAR.x,CAR.z); }catch(e){} emit('spark',CAR.x,0.9,CAR.z,16,3,0.5,6);
  banner(n<10?`PEÇA ${n}/10 INSTALADA`:'O CARRO ESTÁ PRONTO',n<10?`${CAR_PARTS[i].n} no lugar. Faltam ${10-n}.`:'Todos entram no carro e alguém segura E para dar a partida','gold'); }
V9NET.act.cpp=(peer,a)=>carPick(a[2]|0,peer); V9NET.act.cpi=(peer,a)=>carInstall(a[2]|0); V9NET.act.cgo=()=>{ if(carAllIn()) carGo(); };
V9HS.get.car=()=>CUR==='bunker'?CAR.parts.map(p=>[p.st,r10(p.x),r10(p.z),Math.round(p.y*100),['floor','crate','shelf'].indexOf(p.kind)]):0;
V9HS.set.car=v=>{ if(!Array.isArray(v)||CUR!=='bunker') return; let ch=false; v.forEach((e,i)=>{ const p=CAR.parts[i]||(CAR.parts[i]={}); if(CAR.carry===i&&(e[0]|0)===0) return; if(p.st!==(e[0]|0)||p.x!==e[1]/10){ ch=true; p.st=e[0]|0; p.x=e[1]/10; p.z=e[2]/10; p.y=e[3]/100; p.kind=['floor','crate','shelf'][e[4]|0]; } }); if(ch) carVis(); };
V9NX=0; v9On('frame',()=>{ V9NX=(CAR.seated?1:0); });
/* sentado: o jogador fica num banco e a câmera abaixa */
v9On('frame',dt=>{ if(CUR!=='bunker'||!CAR.g) return;
  for(const g of CAR.worldG){ if(!g.visible) continue; g.rotation.y+=dt; g.userData.halo.material.opacity=0.35+Math.sin(G.t*4)*0.15; }
  if(CAR.carry>=0&&P.down){ const i=CAR.carry; CAR.carry=-1; CAR.parts[i]={st:0,x:P.pos.x,z:P.pos.z,y:0.12,kind:'floor'}; carVis(); }
  if(CAR.seated){ if(P.down||IN.edges.has('jump')){ CAR.seated=false; P.pos.set(CAR.x,0,CAR.z+2.4); return; } const s=CAR.seats[0]; const c=Math.cos(CAR.ry), sn=Math.sin(CAR.ry); P.pos.x=CAR.x+s[0]*c+s[1]*sn; P.pos.z=CAR.z-s[0]*sn+s[1]*c; P.vx=P.vz=0; P.y=0.15; P.crouch=0.4; }
  if(!CAR.seated&&CAR.startT>0) CAR.startT=0; });
function carGo(){ if(CAR.going) return; CAR.going=true; pushEv(['cgo']); cityEnter(); }
V9NET.ev.cgo=()=>{ if(!CAR.going){ CAR.going=true; cityEnter(); } };
V9HS.get.cty=()=>CUR==='city'?[CITY.bossSt|0,CITY.boss?Math.ceil(CITY.boss.hp):0,CITY.boss?Math.ceil(CITY.boss.maxHp):0,CITY.boss?Math.ceil(CITY.boss.shield||0):0,CITY.boss?Math.ceil(CITY.boss.maxShield||1):1,CITY.boss&&CITY.boss.downT>0?1:0]:0;
V9HS.set.cty=v=>{ if(!v) return; if(CUR!=='city'){ CAR.going=true; cityEnter(true); } CITY.info=v; };
/* ---- entrada na cidade: tela preta com o carro, rodadas do zero, armas ficam ---- */
const CITY={boss:null,bossSt:0,info:null,cam:null,introT:0};
function cityEnter(silent){
  const fade=v9El('div','cityfade',`<div><small>ALGUNS QUILÔMETROS DEPOIS…</small><b>CIDADE DESTRUÍDA</b></div>`); document.body.appendChild(fade); requestAnimationFrame(()=>fade.classList.add('on'));
  setTimeout(()=>{
    for(const z of zombies.slice()) removeZombie(z); for(const z of Array.from(NET.ghosts.values())) removeGhost(z);
    const keep={inv:Wp.inv.slice(),cur:Wp.cur,pts:G.points,perks:Object.assign({},G.perks),power:false};
    setMap('city'); resetWindows(); G.rooms=new Set(['CS']); G.power=false; setPerkSigns(false); CAR.seated=false; P.y=0; P.crouch=0;
    const st=MAPS.city.start; const idx=NET.mode?playerSpawnIndex():0; const offs=[[-.6,0],[.6,0],[0,.7],[0,-.7]][idx]||[0,0]; P.pos.set(st[0]+offs[0],0,st[1]+offs[1]); P.yaw=0; resetMotion(); flowDirty=true;
    Wp.inv=keep.inv; Wp.cur=Math.min(keep.cur,Wp.inv.length-1); setGunModel(); hudAmmo();
    G.round=0; G.toSpawn=0; G.roundGap=0; CITY.bossSt=0; CITY.boss=null; G.cityArr=true;
    if(NET.mode!=='client') setTimeout(()=>startRound(1),1500); updateMissionHud();
    banner('CIDADE DESTRUÍDA','As rodadas recomeçam. Suas armas, níveis e cartas vieram junto.','red'); try{ Snd.distant(P.pos.x,P.pos.z); }catch(e){}
    setTimeout(()=>{ fade.classList.remove('on'); setTimeout(()=>fade.remove(),1200); },500);
  },1700); }
v9Css(`.cityfade{position:fixed;inset:0;z-index:70;background:#000;opacity:0;transition:opacity 1.2s;display:flex;align-items:center;justify-content:center;pointer-events:none}.cityfade.on{opacity:1}
.cityfade div{text-align:center}.cityfade small{display:block;font:13px "Special Elite",monospace;letter-spacing:.4em;color:#8a8478}.cityfade b{font:700 64px "Stardos Stencil",Impact;letter-spacing:.12em;color:#e8e2d4}`);
function cityObjective(){ if(CITY.bossSt===1) return ['DERRUBE O MUTANTE','O escudo dele quebra com tiros nas COSTAS. Sozinho: atire até ele cair e mire nas costas.','CHEFE NA PRAÇA'];
  if(CITY.bossSt===2) return ['SOBREVIVA NA CIDADE','O mutante caiu. Explore as lojas, ligue a energia na delegacia.','CIDADE'];
  return ['SOBREVIVA NA CIDADE',`Algo grande se mexe no centro da cidade… ${Math.max(0,3-(G.round|0))>0?`chega em ${Math.max(1,4-(G.round|0))} rodada(s)`:''}`,'ENERGIA NA DELEGACIA']; }
const _v9obj2=objectiveDescription; // (cityObjective é chamado pelo objectiveDescription da máquina do tempo)
v9On('reset',()=>{ G.cityArr=false; CITY.boss=null; CITY.bossSt=0; CITY.info=null; try{ if(CAR.g) carReset(); }catch(e){} });
/* nova partida sempre começa no bunker (a cidade só se chega de carro) */
v9On('reset',()=>{ if(CUR==='city'){ setMap('bunker'); const st=NET.mode==='client'?MAPS.bunker.start2:MAPS.bunker.start; P.pos.set(st[0],0,st[1]); G.rooms=new Set([MAPS.bunker.room]); resetWindows(); flowDirty=true; } MHUD&&(MHUD.hidden=true); });
