/* ================= v9 · LABORATÓRIO DO FUTURO (2087): o hospício inteiro vira outro lugar =================
   Ao viajar no tempo: piso de chapa, paredes de painel metálico, teto técnico, faixas de neon nos rodapés e no teto,
   placas holográficas de setor (Setor de Testes A–D, Criogenia, Biocontenção, Servidores, Arsenal Experimental),
   marcação de piso por setor, cápsulas de criogenia, racks de servidor piscando, braços robóticos, grades de laser,
   dutos no teto e terminais. Tudo some quando volta para 1955. */
const LABX={maps:null,g:null,holo:[],leds:[],lasers:[],arms:[]};
const LAB_SECT=[['SETOR DE TESTES A','#36eaff'],['SETOR DE TESTES B','#36eaff'],['SETOR DE TESTES C','#ffb03a'],['SETOR DE TESTES D','#ffb03a'],['CRIOGENIA','#9ad8ff'],['BIOCONTENÇÃO','#6aff8a'],['SERVIDORES','#b45cff'],['ARSENAL EXPERIMENTAL','#ff4a3a'],['ISOLAMENTO','#ff4a3a'],['OBSERVAÇÃO','#36eaff']];
function labSkin(on){ const sets=[[M.hfloor,'floor_09.jpg'],[M.hwall,'metal_12.jpg'],[M.hceil,'metal_06.jpg']].concat((M.hwallV||[]).map(m=>[m,'metal_11.jpg']));
  if(on){ if(LABX.maps) return; LABX.maps=sets.map(([m])=>m?[m,m.map]:null); for(const [m,n] of sets) if(m) v9SetMap(m,n); }
  else { if(!LABX.maps) return; for(const e of LABX.maps) if(e){ e[0].map=e[1]; e[0].needsUpdate=true; } LABX.maps=null; } }
function labHoloTex(t,col){ return tex(512,128,(c,w,h)=>{ c.clearRect(0,0,w,h); c.strokeStyle=col; c.lineWidth=3; c.globalAlpha=0.9; c.strokeRect(6,6,w-12,h-12); c.globalAlpha=0.18; c.fillStyle=col; c.fillRect(6,6,w-12,h-12); c.globalAlpha=1;
  for(let y=10;y<h;y+=4){ c.fillStyle='rgba(255,255,255,.05)'; c.fillRect(6,y,w-12,1); } c.fillStyle=col; c.font='bold 46px "Stardos Stencil", Impact, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.shadowColor=col; c.shadowBlur=18; c.fillText(t,w/2,h/2+2); c.font='14px monospace'; c.shadowBlur=0; c.textAlign='left'; c.fillText('NÍVEL B · ACESSO 7 · 2087',18,h-16); }); }
function labFuture(){ if(LABX.g) return; const g=new THREE.Group(); LABX.g=g; (LAB.g||MAPG.hosp).add(g); ROOT=g; BATCH=new Batch();
  const neonC=new THREE.MeshBasicMaterial({color:0x36eaff}), neonR=new THREE.MeshBasicMaterial({color:0xff3a2a}), panel=new THREE.MeshPhongMaterial({color:0x2a3036,shininess:60,specular:0x556070}), white=new THREE.MeshPhongMaterial({color:0xd8dde2,shininess:80,specular:0x888888}),
    dark=new THREE.MeshPhongMaterial({color:0x0e1114,shininess:40}), glass=new THREE.MeshPhongMaterial({color:0x9ad8ff,transparent:true,opacity:0.28,shininess:120,specular:0xffffff}), frost=new THREE.MeshBasicMaterial({color:0xc8f0ff,transparent:true,opacity:0.35}), duct=new THREE.MeshPhongMaterial({color:0x5a6066,shininess:40});
  // células do hospício por sala (andar térreo e de cima)
  const rooms={}, wallCells=[];
  for(let z=hz(-21);z<=hz(21);z++) for(let x=hx(0);x<=hx(31);x++){ if(!inB(x,z)||grid[z][x]!=='.') continue; const r=roomOf[z][x]; if(!r||OUTR.has(r)) continue; (rooms[r]=rooms[r]||[]).push([x,z]);
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) if(at(x+dx,z+dz)==='#'){ wallCells.push([x,z,dx,dz]); break; } }
  // faixas de neon no rodapé e no teto, ao longo das paredes
  for(const [x,z,dx,dz] of wallCells){ const fy=floorAt(cx(x),cx(z)), px=cx(x)+dx*(S/2-0.06), pz=cx(z)+dz*(S/2-0.06); const o=G3(px,fy,pz,Math.atan2(dx,dz)); const red=(x+z)%7===0;
    tzBx(o,S,0.04,0.03,red?neonR:neonC,0,0.12,0); tzBx(o,S,0.03,0.03,neonC,0,ROOM_CEIL-0.2,0); tzBx(o,S,0.5,0.02,panel,0,0.42,-0.005); bake(o); }
  // placas holográficas e marcação no chão de cada setor
  const rk=Object.keys(rooms).sort(); rk.forEach((r,i)=>{ const cells=rooms[r]; if(cells.length<4) return; const [t,col]=LAB_SECT[i%LAB_SECT.length]; let sx=0,sz=0; for(const [x,z] of cells){ sx+=x; sz+=z; } const mx=cx(sx/cells.length), mz=cx(sz/cells.length), fy=floorAt(mx,mz);
    const h=new THREE.Mesh(new THREE.PlaneGeometry(2.2,0.55),new THREE.MeshBasicMaterial({map:labHoloTex(t,col),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));
    h.position.set(mx,fy+2.45,mz); g.add(h); LABX.holo.push({m:h,ph:i});
    const fm=new THREE.Mesh(new THREE.RingGeometry(1.1,1.25,40),new THREE.MeshBasicMaterial({color:new THREE.Color(col),transparent:true,opacity:0.5,depthWrite:false})); fm.rotation.x=-Math.PI/2; fm.position.set(mx,fy+0.03,mz); g.add(fm); });
  // equipamentos encostados nas paredes
  const spots=wallCells.filter(([x,z])=>!propCell[z*MW+x]&&RAMPC[z*MW+x]<0).sort(()=>Math.random()-0.5).slice(0,70);
  spots.forEach(([x,z,dx,dz],i)=>{ const fy=floorAt(cx(x),cx(z)), o=new THREE.Group(); o.position.set(cx(x)+dx*0.5,fy,cx(z)+dz*0.5); o.rotation.y=Math.atan2(-dx,-dz); const k=i%6;
    if(k===0){ // cápsula de criogenia em pé, com névoa gelada
      tzBx(o,0.9,0.15,0.7,dark,0,0.07,0); tzBx(o,0.9,0.15,0.7,dark,0,2.25,0); const gl=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,2.0,18,1,true,-Math.PI/2,Math.PI),glass); gl.position.y=1.15; o.add(gl); const back=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,2.0,18,1,true,Math.PI/2,Math.PI),white); back.position.y=1.15; o.add(back);
      const fr=new THREE.Mesh(new THREE.PlaneGeometry(0.7,1.8),frost); fr.position.set(0,1.15,0.05); o.add(fr); tzBx(o,0.5,0.06,0.04,neonC,0,2.1,0.36); g.add(o); }
    else if(k===1){ // rack de servidor com LEDs piscando
      tzBx(o,0.8,2.1,0.7,dark,0,1.05,0); for(let s=0;s<9;s++){ tzBx(o,0.7,0.16,0.02,panel,0,0.3+s*0.2,0.36); const led=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.03,0.02),new THREE.MeshBasicMaterial({color:pick([0x36eaff,0x6aff8a,0xff3a2a,0xffb03a])})); led.position.set(-0.28+Math.random()*0.5,0.3+s*0.2,0.375); o.add(led); LABX.leds.push(led); } g.add(o); }
    else if(k===2){ // braço robótico de testes
      tzBx(o,0.6,0.2,0.6,panel,0,0.1,0); const a1=new THREE.Group(); a1.position.y=0.2; o.add(a1); tzBx(a1,0.16,1.0,0.16,white,0,0.5,0); const a2=new THREE.Group(); a2.position.y=1.0; a1.add(a2); tzBx(a2,0.12,0.8,0.12,white,0,0.4,0); tzBx(a2,0.22,0.08,0.22,neonR,0,0.82,0);
      a1.rotation.z=0.4; a2.rotation.z=-1.1; LABX.arms.push({a1,a2,ph:i}); g.add(o); }
    else if(k===3){ // terminal com tela holográfica
      tzBx(o,0.7,1.0,0.4,panel,0,0.5,0); const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.5),new THREE.MeshBasicMaterial({map:labHoloTex('AMOSTRA '+(100+i),'#36eaff'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})); sc.position.set(0,1.45,0.1); sc.rotation.x=-0.2; o.add(sc); g.add(o); }
    else if(k===4){ // cápsula deitada de teste com tampa de vidro
      tzBx(o,1.9,0.6,0.8,white,0,0.3,0.3); const lid=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,1.8,16,1,false,0,Math.PI),glass); lid.rotation.z=Math.PI/2; lid.position.set(0,0.6,0.3); o.add(lid); tzBx(o,1.7,0.03,0.04,neonC,0,0.62,0.71); g.add(o); }
    else { // grade de laser vermelha (só visual)
      for(let s=0;s<5;s++){ const l=new THREE.Mesh(new THREE.BoxGeometry(S*0.9,0.012,0.012),neonR); l.position.set(0,0.3+s*0.45,0.2); o.add(l); LABX.lasers.push(l); } tzBx(o,0.08,2.4,0.08,dark,-S*0.45,1.2,0.2); tzBx(o,0.08,2.4,0.08,dark,S*0.45,1.2,0.2); g.add(o); } });
  // dutos e cabos pelo teto
  for(const r of rk){ const cells=rooms[r]; if(cells.length<6) continue; const [x,z]=pick(cells); const fy=floorAt(cx(x),cx(z)); const o=G3(cx(x),fy+ROOM_CEIL-0.3,cx(z),Math.random()<0.5?0:Math.PI/2); tzBx(o,0.5,0.35,S*3,duct,0,0,0); for(let s=-1;s<=1;s++) tzBx(o,0.56,0.06,0.06,dark,0,0,s*S); bake(o); }
  BATCH.flush(g); ROOT=MAPG.bunker; }
v9On('frame',dt=>{ if(!TM.lab||!LABX.g) return; const t=G.t;
  for(const h of LABX.holo){ h.m.rotation.y=Math.sin(t*0.5+h.ph)*0.6; h.m.material.opacity=0.75+Math.sin(t*9+h.ph)*0.1*(Math.random()<0.03?4:1); }
  for(let i=0;i<LABX.leds.length;i++) LABX.leds[i].visible=Math.sin(t*(3+i%5)+i)>-0.3;
  for(let i=0;i<LABX.lasers.length;i++) LABX.lasers[i].visible=Math.random()>0.02;
  for(const a of LABX.arms){ a.a1.rotation.y=Math.sin(t*0.7+a.ph)*1.2; a.a2.rotation.z=-1.1+Math.sin(t*1.3+a.ph)*0.4; } });
const _v9labDress=labDress; labDress=function(){ _v9labDress(); try{ labFuture(); labSkin(true); }catch(e){ console.warn('[Bunker v9] laboratório',e); ROOT=MAPG.bunker; } };
const _v9labUndo=labUndo; labUndo=function(){ try{ labSkin(false); }catch(e){} LABX.g=null; LABX.holo.length=0; LABX.leds.length=0; LABX.lasers.length=0; LABX.arms.length=0; return _v9labUndo(); };
