/* ================= v9 · PARQUE 4FUN (anos 80, neon) =================
   Mapa sem zumbis, compacto: tudo em volta da praça central, a poucos passos um do outro.
   Visual synthwave: chão com grade neon, sol retrô listrado e montanhas de arame no horizonte, palmeiras neon,
   tubos de neon em tudo, céu roxo e luz rosa/ciano (nada de breu).
   - Você nasce com o TELEPORTADOR: atira uma bola branca com física (quica no chão, nas paredes e nas plataformas);
     onde ela parar, você aparece. Q alterna entre a ferramenta e suas armas.
   - ARMA DE PORTAIS (na barraca): modelo próprio na mão, portal azul (esquerdo) e laranja (direito).
   - SALÃO: sinuca, dardos, copos, roleta e caça-níquel com drax de verdade. PARKOUR, camas elásticas, tirolesa,
     cabine do bicho, tiro ao alvo, pista de dança, fogos, roda-gigante, carrossel e o PORTAL DA ARENA X1. */
MAPS.fun={name:'Parque 4FUN',start:[cx(29),cx(FUN0+44)],start2:[cx(30.5),cx(FUN0+44)],room:'FN',menu:{x:cx(29),z:cx(FUN0+47),yaw:0},fog:0x2a0f4a,fogD:0.007,bg:0x1a0630,sky:'bunker'};
MAPG.fun=new THREE.Group(); scene.add(MAPG.fun); MAPG.fun.visible=false;
const FUN={items:[],plats:[],tramps:[],near:null,mode:null,poolSpot:null,t:0,anim:null,tool:null,lastTool:'tele',run:null,ducks:[],remoteAnimals:new Map(),neon:[],balls:[]};
const FZ=r=>cx(FUN0+r), FX=c=>cx(c), SX=c=>FX(c+4), SZ=r=>FZ(r+15);
const NEON={pink:0xff2bd6,cyan:0x2bf3ff,purple:0xa94bff,yellow:0xffe14a,orange:0xff7a2b,green:0x4bff8a};
function funRec(){ return PROG.v9fun||(PROG.v9fun={darts:0,cups:0,park:0,duck:0}); }
function funMat(c,o){ return v9Mat('fun'+c.toString(16)+(o&&o.e?'e'+o.e.toString(16):''),Object.assign({color:c,shininess:40},o&&o.e?{emissive:o.e}:{})); }
function funGlow(c){ return new THREE.MeshBasicMaterial({color:c,fog:false}); }
function funSign(txt,w,h,col,bg){ return new THREE.MeshBasicMaterial({map:tex(512,Math.round(512*h/w),(g,W,H)=>{ g.fillStyle=bg||'#14051f'; g.fillRect(0,0,W,H); g.shadowColor=col; g.shadowBlur=26; g.strokeStyle=col; g.lineWidth=9; g.strokeRect(10,10,W-20,H-20);
  g.font=`bold ${Math.round(H*0.5)}px "Stardos Stencil",Impact,sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.fillStyle=col; g.fillText(txt,W/2,H/2+4); g.shadowBlur=0; g.fillStyle='#fff'; g.globalAlpha=0.6; g.fillText(txt,W/2,H/2+4); }),transparent:true,fog:false}); }
function funItem(id,x,z,r,label,use){ FUN.items.push({id,x,z,r,label,use}); }
// tubo de neon: linha reta grossa + halo
function neonBar(root,a,b,col,th){ th=th||0.06; const A=new THREE.Vector3(...a), B=new THREE.Vector3(...b), L=A.distanceTo(B); const m=new THREE.Mesh(new THREE.CylinderGeometry(th,th,L,6),funGlow(col)); m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),B.clone().sub(A).normalize()); root.add(m);
  const h=new THREE.Mesh(new THREE.CylinderGeometry(th*3.2,th*3.2,L,6),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.18,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); h.position.copy(m.position); h.quaternion.copy(m.quaternion); root.add(h); FUN.neon.push({m,h,col}); return m; }
function neonRect(root,x0,z0,x1,z1,y,col){ neonBar(root,[x0,y,z0],[x1,y,z0],col); neonBar(root,[x1,y,z0],[x1,y,z1],col); neonBar(root,[x1,y,z1],[x0,y,z1],col); neonBar(root,[x0,y,z1],[x0,y,z0],col); }

/* ======================== MONTAGEM ======================== */
function buildFun(){ const root=MAPG.fun; const z0=FUN0, z1=FUN1, zc=(z0*S+(z1+1)*S)/2, len=(z1-z0+1)*S;
  // chão synthwave: roxo escuro com grade neon (brilha sozinho)
  const gridTex=tex(256,256,(g,w,h)=>{ g.fillStyle='#160428'; g.fillRect(0,0,w,h); g.shadowColor='#ff2bd6'; g.shadowBlur=10; g.strokeStyle='rgba(255,43,214,.85)'; g.lineWidth=3; g.strokeRect(1,1,w-2,h-2); g.shadowBlur=0; g.strokeStyle='rgba(255,43,214,.25)'; g.lineWidth=1; g.strokeRect(w/2,0,0.1,h); g.strokeRect(0,h/2,w,0.1); });
  gridTex.wrapS=gridTex.wrapT=THREE.RepeatWrapping; gridTex.repeat.set((MW*S+80)/4,(len+60)/4);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(MW*S+80,len+60),new THREE.MeshBasicMaterial({map:gridTex})); gnd.rotation.x=-Math.PI/2; gnd.position.set(MW*S/2,0,zc); root.add(gnd);
  // praça central (pista de dança no meio) e caminho até o portal de entrada
  const plz=new THREE.Mesh(new THREE.CircleGeometry(8,48),new THREE.MeshBasicMaterial({color:0x22073a})); plz.rotation.x=-Math.PI/2; plz.position.set(FX(29),0.02,FZ(31)); root.add(plz);
  const ring=new THREE.Mesh(new THREE.RingGeometry(7.85,8.05,64),funGlow(NEON.cyan)); ring.rotation.x=-Math.PI/2; ring.position.set(FX(29),0.03,FZ(31)); root.add(ring);
  const walk=new THREE.Mesh(new THREE.PlaneGeometry(4,26),new THREE.MeshBasicMaterial({color:0x22073a})); walk.rotation.x=-Math.PI/2; walk.position.set(FX(29),0.025,FZ(43)); root.add(walk);
  neonBar(root,[FX(29)-2,0.04,FZ(37)],[FX(29)-2,0.04,FZ(49)],NEON.pink,0.04); neonBar(root,[FX(29)+2,0.04,FZ(37)],[FX(29)+2,0.04,FZ(49)],NEON.pink,0.04);
  // salão (paredes do grid) + telhado + contorno neon
  const wallM=new THREE.MeshLambertMaterial({map:tex(256,256,(g,w,h)=>{ g.fillStyle='#2a0c3a'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=32) for(let x=(y/32)%2?32:0;x<w;x+=64){ g.fillStyle=`hsl(${280+Math.random()*30},${35+Math.random()*10}%,${16+Math.random()*8}%)`; g.fillRect(x+2,y+2,60,28); } }),emissive:0x1a0624});
  buildWalls(z0,z1,wallM,wallM,false);
  try{ const M3=TZG.M||tzBuildMats(); tzRoofed(7,FUN0+19,21,FUN0+36,M3.floorW,M3.ceil,M3.roof,{trim:M3.trim}); }catch(e){}
  neonRect(root,FX(6)-1,FZ(18)-1,FX(22)+1,FZ(37)+1,3.25,NEON.pink); neonRect(root,FX(6)-1,FZ(18)-1,FX(22)+1,FZ(37)+1,0.08,NEON.cyan);
  // horizonte retrô: sol listrado e montanhas de arame (ao norte)
  { const sunTex=tex(512,512,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#ffe14a'); gr.addColorStop(0.55,'#ff6a3a'); gr.addColorStop(1,'#ff2bd6'); g.fillStyle=gr; g.beginPath(); g.arc(w/2,h/2,w/2-2,0,7); g.fill(); g.globalCompositeOperation='destination-out'; for(let i=0;i<8;i++){ const y=h*0.55+i*i*3.2+i*10; g.fillRect(0,y,w,4+i*1.6); } });
    const sun=new THREE.Mesh(new THREE.CircleGeometry(38,48),new THREE.MeshBasicMaterial({map:sunTex,transparent:true,fog:false,depthWrite:false})); sun.position.set(MW*S/2,22,FZ(-60)); root.add(sun);
    const mg=new THREE.PlaneGeometry(240,40,48,8); const pa=mg.attributes.position; for(let i=0;i<pa.count;i++){ const x=pa.getX(i), y=pa.getY(i); pa.setZ(i,y>-19?Math.max(0,(Math.sin(x*0.07)+Math.sin(x*0.19+1)*0.6+Math.random()*0.4)*9*(1-(y+20)/40*0.2)):0); }
    const mts=new THREE.Mesh(mg,new THREE.MeshBasicMaterial({color:NEON.purple,wireframe:true,fog:false,transparent:true,opacity:0.7})); mts.rotation.x=-Math.PI/2; mts.position.set(MW*S/2,0,FZ(-30)); root.add(mts); }
  // palmeiras neon em volta da área
  for(const [c,r] of [[5,15],[24,14],[44,15],[3,40],[46,30],[45,47],[12,50],[20,47],[38,48]]){ const x=FX(c), z=FZ(r), h=rand(6,8); neonBar(root,[x,0,z],[x+0.5,h,z+0.2],NEON.orange,0.09);
    for(let k=0;k<7;k++){ const a=k/7*Math.PI*2; neonBar(root,[x+0.5,h,z+0.2],[x+0.5+Math.cos(a)*2.4,h-1.1,z+0.2+Math.sin(a)*2.4],NEON.green,0.05); } }
  // cerca neon delimitando o parque compacto
  neonRect(root,FX(3),FZ(13),FX(46),FZ(50),0.6,NEON.purple);
  // varais de lâmpadas
  const bulbCols=[NEON.pink,NEON.yellow,NEON.cyan,NEON.green,NEON.purple];
  for(const [a,b] of [[[22,26],[36,26]],[[22,36],[36,36]],[[29,24],[29,38]],[[24,27],[34,35]],[[34,27],[24,35]]]){ const A=new THREE.Vector3(FX(a[0]),5.6,FZ(a[1])), B=new THREE.Vector3(FX(b[0]),5.6,FZ(b[1]));
    const n=Math.round(A.distanceTo(B)/1.1); const pts=[]; for(let i=0;i<=n;i++){ const k=i/n; const p=A.clone().lerp(B,k); p.y-=Math.sin(k*Math.PI)*1.1; pts.push(p); const bl=new THREE.Mesh(new THREE.SphereGeometry(0.09,6,5),funGlow(bulbCols[i%5])); bl.position.copy(p).add(new THREE.Vector3(0,-0.12,0)); root.add(bl); }
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x111111}))); for(const P0 of [A,B]){ neonBar(root,[P0.x,0,P0.z],[P0.x,5.7,P0.z],NEON.cyan,0.05); } }
  // portal de entrada
  { const g=G3(FX(29),0,FZ(47)); for(const s of [-1,1]) neonBar(g,[s*4.2,0,0],[s*4.2,5.5,0],NEON.pink,0.12); neonBar(g,[-4.2,5.5,0],[4.2,5.5,0],NEON.cyan,0.1);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(9,1.8),funSign('PARQUE 4FUN',9,1.8,'#ff2bd6')); sg.position.set(0,6.6,0.05); g.add(sg); const sg2=sg.clone(); sg2.rotation.y=Math.PI; sg2.position.z=-0.05; g.add(sg2); root.add(g); }
  // roda-gigante e carrossel (perto da praça)
  { const g=G3(FX(41),0,FZ(42)); const fr=funMat(0xe8e0f0); for(const s of [-1,1]){ bx(g,0.25,9,0.25,fr,s*2.2,4.2,0,0,0,s*0.25); bx(g,0.25,9,0.25,fr,s*2.2,4.2,1.2,0,0,s*0.25); }
    const wheel=new THREE.Group(); wheel.position.set(0,8.4,0.6); const R=6.4; wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R,0.1,6,48),funGlow(NEON.pink)));
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; const sp2=new THREE.Mesh(new THREE.BoxGeometry(0.08,R,0.08),funGlow(NEON.cyan)); sp2.position.set(Math.cos(a)*R/2,Math.sin(a)*R/2,0); sp2.rotation.z=a+Math.PI/2; wheel.add(sp2);
      const cab=new THREE.Mesh(new THREE.BoxGeometry(1,0.9,0.9),funMat(bulbCols[i%5],{e:bulbCols[i%5]&0x3f3f3f})); cab.position.set(Math.cos(a)*R,Math.sin(a)*R-0.6,0); cab.userData.cab=true; wheel.add(cab); }
    g.add(wheel); FUN.wheel=wheel; root.add(g); addPropBox(FX(41),FZ(42),2.8,1.2); }
  { const g=G3(FX(16),0,FZ(43)); const base=new THREE.Mesh(new THREE.CylinderGeometry(4,4.2,0.4,24),funMat(0x6a2a8a,{e:0x200a2a})); base.position.y=0.2; g.add(base); const top=new THREE.Mesh(new THREE.ConeGeometry(4.6,1.6,24),funMat(0xff2bd6,{e:0x400a30})); top.position.y=4.2; g.add(top);
    const rot=new THREE.Group(); rot.position.y=0.4; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,3.2,6),funGlow(NEON.yellow)); pole.position.set(Math.cos(a)*3,1.6,Math.sin(a)*3); rot.add(pole);
      const horse=new THREE.Group(); horse.position.set(Math.cos(a)*3,1.1,Math.sin(a)*3); horse.rotation.y=-a; bx(horse,0.3,0.4,0.9,funMat(0xf0e8e0),0,0,0); bx(horse,0.22,0.5,0.25,funMat(0xf0e8e0),0,0.3,0.42,0.5,0,0); horse.userData.ph=i; rot.add(horse); }
    for(let i=0;i<24;i++){ const l=new THREE.Mesh(new THREE.SphereGeometry(0.09,5,4),funGlow(bulbCols[i%5])); const a=i/24*Math.PI*2; l.position.set(Math.cos(a)*4.3,3.4,Math.sin(a)*4.3); g.add(l); }
    g.add(rot); FUN.carousel=rot; root.add(g); addPropBox(FX(16),FZ(43),3.4,3.4); }
  buildFunSalao(root); buildFunPark(root); buildFunBooths(root);
  // luzes coloridas (rosa e ciano) para o parque não ficar escuro
  for(const [c,r,col] of [[29,31,NEON.pink],[37,20,NEON.cyan],[22,42,NEON.purple],[40,33,NEON.orange]]){ const L=lightTake(col,1.8,28,1.2); if(L) L.position.set(FX(c),6,FZ(r)); } }
// clima de anos 80: luz ambiente forte e roxa no parque
{ const _sm=setMap; let h0=null; setMap=function(k){ const r=_sm.apply(this,arguments); try{ if(hemi){ if(h0==null) h0=hemi.intensity; if(k==='fun'){ hemi.color.setHex(0xff9ae8); hemi.groundColor.setHex(0x4a2a9a); hemi.intensity=1.25; } else hemi.intensity=h0; } }catch(e){} return r; }; }

/* ---- salão de jogos (deslocado para perto da praça: SX/SZ) ---- */
function buildFunSalao(root){ const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.2),funSign('SALÃO DE JOGOS',6,1.2,'#2bf3ff')); sg.position.set(SX(18)+1.05,3.9,SZ(12.5)); sg.rotation.y=Math.PI/2; root.add(sg);
  const fl=new THREE.MeshLambertMaterial({map:tex(256,256,(g,w,h)=>{ for(let y=0;y<8;y++) for(let x=0;x<8;x++){ g.fillStyle=(x+y)%2?'#1a0a2a':'#e8d8f0'; g.fillRect(x*32,y*32,32,32); } })});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(30,36),fl); f.rotation.x=-Math.PI/2; f.position.set(SX(10),0.03,SZ(12.5)); f.material.map.wrapS=f.material.map.wrapT=THREE.RepeatWrapping; f.material.map.repeat.set(4,4.8); root.add(f);
  for(const [x,r,col] of [[10,8,0xffb0f0],[10,17,0xb0f0ff]]){ const L=lightTake(col,1.6,16,1.4); if(L) L.position.set(SX(x),3.2,SZ(r)); }
  for(const z of [SZ(4)-0.9,SZ(21)+0.9]) neonBar(root,[SX(3)-0.9,3.0,z],[SX(17)+0.9,3.0,z],NEON.purple,0.04);
  FUN.poolSpot={x:SX(7),z:SZ(16.5),ry:0};
  { const bxp=SX(3)-0.95, bz=SZ(7.5); const board=new THREE.Mesh(new THREE.CircleGeometry(0.34,40),new THREE.MeshLambertMaterial({map:funDartTex(),emissive:0x222222})); board.position.set(bxp,1.73,bz); board.rotation.y=Math.PI/2; root.add(board);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(0.06,1.1,1.1),funMat(0x3a1a0a)); cab.position.set(bxp-0.04,1.73,bz); root.add(cab); neonRect(root,bxp+0.02,bz-0.6,bxp+0.02,bz+0.6,2.35,NEON.yellow); FUN.dart={x:bxp,y:1.73,z:bz,board,darts:[]};
    const line=new THREE.Mesh(new THREE.PlaneGeometry(0.05,1.2),funGlow(NEON.yellow)); line.rotation.x=-Math.PI/2; line.position.set(bxp+2.37,0.04,bz); root.add(line);
    funItem('dart',bxp+2.4,bz,1.3,'Jogar DARDOS (3 dardos, maior pontuação)',funDartStart); }
  { const tx=SX(10), tz=SZ(5.2); const t=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.08,0.9),funMat(0x5a3a1a)); t.position.set(tx,0.9,tz); root.add(t); for(const sx of [-1,1]) for(const sz of [-1,1]){ const l=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.9,0.08),funMat(0x3a2a1a)); l.position.set(tx+sx*1,0.45,tz+sz*0.38); root.add(l); }
    addPropBox(tx,tz,1.1,0.45); FUN.cups={x:tx,y:0.94,z:tz,cups:[],balls:0,proj:[]}; funCupsRack(); funItem('cups',tx,tz+2.6,1.4,'DERRUBE OS COPOS (3 bolas)',funCupsStart); }
  { const tx=SX(14), tz=SZ(8.5); const t=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.9,1.6),funMat(0x0e4a26)); t.position.set(tx,0.45,tz); root.add(t); addPropBox(tx,tz,0.8,0.8);
    const wh=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.08,37),new THREE.MeshLambertMaterial({map:funRouletteTex(),emissive:0x202020})); wh.position.set(tx,0.95,tz); root.add(wh); FUN.rou={x:tx,z:tz,wh,spin:0,v:0,ball:null};
    const ball=new THREE.Mesh(new THREE.SphereGeometry(0.025,8,6),funMat(0xffffff)); ball.position.set(tx+0.55,1.0,tz); root.add(ball); FUN.rou.ball=ball;
    funItem('rou',tx,tz+1.6,1.3,'ROLETA · aposte drax',funRouOpen); }
  { const tx=SX(16.4), tz=SZ(17.5); const m=new THREE.Group(); m.position.set(tx,0,tz); m.rotation.y=-Math.PI/2; bx(m,0.8,1.7,0.6,funMat(0x8a1a5a,{e:0x2a0618}),0,0.85,0); const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.3),funGlow(0xfff2c0)); sc.position.set(0,1.2,0.31); m.add(sc); bx(m,0.85,0.25,0.65,funMat(0xd4b040,{e:0x3a2a00}),0,1.82,0);
    const lever=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.5,6),funMat(0xcccccc)); lever.position.set(0.45,1.25,0); m.add(lever); const kn=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),funMat(0xe02020)); kn.position.set(0.45,1.5,0); m.add(kn); root.add(m); addPropBox(tx,tz,0.35,0.45);
    funItem('slot',tx-1.3,tz,1.2,'CAÇA-NÍQUEL · 10 drax por giro',funSlotSpin); } }
function funDartTex(){ return tex(512,512,(g,w,h)=>{ const c=w/2, R=w/2-4; const order=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5];
  g.fillStyle='#111'; g.beginPath(); g.arc(c,c,R,0,7); g.fill();
  const ring=(r0,r1,colA,colB)=>{ for(let i=0;i<20;i++){ const a0=(i*18-99)*Math.PI/180, a1=a0+18*Math.PI/180; g.fillStyle=i%2?colA:colB; g.beginPath(); g.arc(c,c,r1,a0,a1); g.arc(c,c,r0,a1,a0,true); g.fill(); } };
  const s=R/0.34; ring(0.016*s,0.099*s,'#e8dcc0','#151515'); ring(0.099*s,0.107*s,'#1a8a3a','#c81d1d'); ring(0.107*s,0.162*s,'#e8dcc0','#151515'); ring(0.162*s,0.17*s,'#1a8a3a','#c81d1d');
  g.fillStyle='#1a8a3a'; g.beginPath(); g.arc(c,c,0.016*s,0,7); g.fill(); g.fillStyle='#c81d1d'; g.beginPath(); g.arc(c,c,0.0064*s,0,7); g.fill();
  g.fillStyle='#fff'; g.font='bold 30px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; for(let i=0;i<20;i++){ const a=(i*18-90)*Math.PI/180; g.fillText(order[i],c+Math.cos(a)*0.2*s,c+Math.sin(a)*0.2*s); } }); }
function funRouletteTex(){ return tex(512,512,(g,w,h)=>{ const c=w/2; const ord=FUN_ROU; for(let i=0;i<37;i++){ const a0=i/37*Math.PI*2, a1=(i+1)/37*Math.PI*2, n=ord[i]; g.fillStyle=n===0?'#1a8a3a':FUN_RED.has(n)?'#c81d1d':'#151515'; g.beginPath(); g.moveTo(c,c); g.arc(c,c,c-2,a0,a1); g.fill();
  g.save(); g.translate(c,c); g.rotate((a0+a1)/2); g.fillStyle='#fff'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.fillText(n,c-24,6); g.restore(); } g.fillStyle='#6a4a1a'; g.beginPath(); g.arc(c,c,c*0.45,0,7); g.fill(); g.fillStyle='#d4b040'; g.beginPath(); g.arc(c,c,c*0.12,0,7); g.fill(); }); }
const FUN_ROU=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const FUN_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

/* ---- parque: parkour, camas elásticas, tirolesa (ao lado da praça) ---- */
function buildFunPark(root){ const neon=[NEON.cyan,NEON.pink,NEON.green,NEON.yellow];
  const CX=FX(37), CZ=FZ(19);
  const P=[[-6,-3,3,3,0.8],[-3,-5.5,2.4,2.4,1.55],[0.5,-6,2.2,2.2,2.3],[4,-4.5,2.6,2.6,3.05],[6,-1,2.2,2.2,3.8],[5,2.6,2.2,2.2,4.55],[2,5,2.6,2.6,5.3],[-1.5,4.5,2,2,6.05],[-4.5,2,2,2,6.8],[-1,-0.5,3.2,3.2,7.55]];
  P.forEach(([dx,dz,w,d,top],i)=>{ const x=CX+dx, z=CZ+dz; const m=new THREE.Mesh(new THREE.BoxGeometry(w,top,d),funMat(0x2a1640,{e:0x0e0618})); m.position.set(x,top/2,z); root.add(m);
    neonRect(root,x-w/2,z-d/2,x+w/2,z+d/2,top+0.02,neon[i%4]); for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]]) neonBar(root,[x+sx*w/2,0,z+sz*d/2],[x+sx*w/2,top,z+sz*d/2],neon[i%4],0.025);
    FUN.plats.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,top,i,cp:i===3||i===6,end:i===P.length-1}); });
  const last=FUN.plats[FUN.plats.length-1]; const bell=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,0.4,12,1,true),funMat(0xd4b040,{e:0x5a4000})); bell.position.set((last.x0+last.x1)/2,last.top+1.6,(last.z0+last.z1)/2); root.add(bell); FUN.bell=bell;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.8,6),funMat(0x888888)); post.position.set(bell.position.x,last.top+0.9,bell.position.z); root.add(post);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(4,0.9),funSign('PARKOUR',4,0.9,'#2bf3ff')); sg.position.set(CX-9.2,2.4,CZ-3); sg.rotation.y=Math.PI/2; root.add(sg);
  funItem('park',CX-8.8,CZ-3,1.4,'PARKOUR · começar o cronômetro',funParkStart);
  for(const [c,r] of [[31,24],[34,25.5],[28,23]]){ const x=FX(c), z=FZ(r); const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,0.12,8,24),funGlow(NEON.cyan)); ring.rotation.x=Math.PI/2; ring.position.set(x,0.45,z); root.add(ring);
    const mat=new THREE.Mesh(new THREE.CircleGeometry(1.05,24),new THREE.MeshBasicMaterial({color:0x220a3a})); mat.rotation.x=-Math.PI/2; mat.position.set(x,0.42,z); root.add(mat); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; const l=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.45,5),funMat(0x888888)); l.position.set(x+Math.cos(a)*1.05,0.22,z+Math.sin(a)*1.05); root.add(l); }
    FUN.tramps.push({x,z,mat}); }
  { const A=new THREE.Vector3((last.x0+last.x1)/2,last.top+2.2,(last.z0+last.z1)/2+1.2), B=new THREE.Vector3(FX(33),2.4,FZ(28)); root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([A,B]),new THREE.LineBasicMaterial({color:NEON.yellow})));
    neonBar(root,[B.x,0,B.z],[B.x,2.6,B.z],NEON.yellow,0.08); addPropBox(B.x,B.z,0.2,0.2); FUN.zip={A,B};
    funItem('zip',A.x,A.z-1.2,1.2,'TIROLESA · descer até a praça',funZip); } }
/* ---- barracas e portal X1 ---- */
function buildFunBooths(root){
  const booth=(c,r,col,txt,ry,ncol)=>{ const g=G3(FX(c),0,FZ(r),ry||0); bx(g,3,2.6,0.2,funMat(col,{e:col&0x2f2f2f}),0,1.3,-1.2); for(const s of [-1,1]) bx(g,0.2,2.6,2.4,funMat(col,{e:col&0x2f2f2f}),s*1.4,1.3,0); bx(g,3.2,0.2,2.8,funMat(0xf0e8e0),0,2.7,0); bx(g,3,0.9,0.4,funMat(0x2a1a0a),0,0.45,1.0);
    for(let i=0;i<7;i++) bx(g,0.46,0.1,2.9,funMat(i%2?0xf0e8e0:col),-1.38+i*0.46,2.85,0,0.18,0,0);
    neonBar(g,[-1.6,2.62,1.42],[1.6,2.62,1.42],ncol,0.04); neonBar(g,[-1.6,0.9,1.22],[1.6,0.9,1.22],ncol,0.03);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(3,0.7),funSign(txt,3,0.7,'#'+ncol.toString(16).padStart(6,'0'))); sg.position.set(0,3.35,1.3); g.add(sg); root.add(g); return g; };
  booth(23,39,0x2a8a3a,'CABINE DO BICHO',0,NEON.green); funItem('bicho',FX(23),FZ(39)+2.2,1.4,'CABINE DO BICHO · virar bicho (E de novo troca)',funAnimalCycle); addPropBox(FX(23),FZ(39)-1.2,1.5,0.2);
  booth(35,39,0x2a4aaa,'ARMA DE PORTAIS',0,NEON.cyan); funItem('portal',FX(35),FZ(39)+2.2,1.4,'ARMA DE PORTAIS · pegar / devolver',()=>funSetTool(FUN.tool==='portal'?'tele':'portal')); addPropBox(FX(35),FZ(39)-1.2,1.5,0.2);
  { booth(40,26.5,0xaa3a1a,'TIRO AO ALVO',Math.PI,NEON.orange); FUN.duckZ=FZ(26.5)-0.4; for(let i=0;i<6;i++){ const d=new THREE.Group(); const body=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,8),funMat(0xffd24a,{e:0x302000})); body.scale.set(1.3,1,1); d.add(body); const head=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),funMat(0xffd24a,{e:0x302000})); head.position.set(0.18,0.14,0); d.add(head); const bk=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.12,6),funMat(0xff7a1a)); bk.rotation.z=-Math.PI/2; bk.position.set(0.3,0.13,0); d.add(bk);
      d.position.set(FX(40)-1.2+i*0.5,1.5,FUN.duckZ); root.add(d); FUN.ducks.push({g:d,i,hit:0}); }
    funItem('duck',FX(40),FZ(26.5)-2.4,1.4,'TIRO AO ALVO · 30 s, acerte os patos com sua arma',funDuckStart); addPropBox(FX(40),FZ(26.5)+1.2,1.5,0.2); }
  funBuildX1Portal(root);
  { const g=G3(FX(29),0,FZ(31)); FUN.danceTiles=[]; for(let i=0;i<6;i++) for(let k=0;k<6;k++){ const t=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.95),new THREE.MeshBasicMaterial({color:0x222222})); t.rotation.x=-Math.PI/2; t.position.set(-2.5+i,0.05,-2.5+k); g.add(t); FUN.danceTiles.push(t); } root.add(g); FUN.dance={x:FX(29),z:FZ(31)}; }
  { const g=G3(FX(25),0,FZ(26.5)); bx(g,0.6,1.0,0.6,funMat(0x3a3a3a),0,0.5,0); const b=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.1,16),funGlow(0xff2020)); b.position.y=1.05; g.add(b); root.add(g); addPropBox(FX(25),FZ(26.5),0.3,0.3);
    funItem('fire',FX(25),FZ(26.5)+0.9,1.2,'FOGOS DE ARTIFÍCIO',funFireworks); } }
/* ---- portal da Arena X1: anel de fogo, vórtice girando, pilares com chamas, brasas subindo ---- */
function funBuildX1Portal(root){ const g=G3(FX(42.5),0,FZ(31),-Math.PI/2); const H=2.7;
  const vtx=(c1,c2)=>tex(256,256,(c,w,h)=>{ const cx2=w/2; const gr=c.createRadialGradient(cx2,cx2,4,cx2,cx2,cx2); gr.addColorStop(0,'#fff6d0'); gr.addColorStop(0.25,c1); gr.addColorStop(0.75,c2); gr.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle=gr; c.fillRect(0,0,w,h);
    c.globalCompositeOperation='lighter'; for(let k=0;k<6;k++){ c.strokeStyle='rgba(255,220,140,.35)'; c.lineWidth=6; c.beginPath(); for(let t=0;t<1;t+=0.01){ const a=t*Math.PI*3+k*Math.PI/3, r=t*cx2*0.95; c.lineTo(cx2+Math.cos(a)*r,cx2+Math.sin(a)*r); } c.stroke(); } });
  const d1=new THREE.Mesh(new THREE.CircleGeometry(2.2,48),new THREE.MeshBasicMaterial({map:vtx('#ff7a2b','#a01010'),transparent:true,opacity:0.95,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})); d1.position.y=H; g.add(d1);
  const d2=new THREE.Mesh(new THREE.CircleGeometry(1.7,48),new THREE.MeshBasicMaterial({map:vtx('#ffd24a','#ff2b2b'),transparent:true,opacity:0.7,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,fog:false})); d2.position.set(0,H,0.02); g.add(d2);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,0.16,10,64),funGlow(0xff4a1a)); ring.position.y=H; g.add(ring); const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.55,0.05,8,64),funGlow(NEON.yellow)); ring2.position.y=H; g.add(ring2);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(2.4,0.6,8,48),new THREE.MeshBasicMaterial({color:0xff3a0a,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); halo.position.y=H; g.add(halo);
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; const r=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.5,0.18),funMat(0x2a1a1a,{e:0x401000})); r.position.set(Math.cos(a)*2.55,H+Math.sin(a)*2.55,0); r.rotation.z=a; g.add(r); }
  // pilares de pedra com braseiro e chamas
  FUN.x1fl=[]; for(const s of [-1,1]){ bx(g,0.8,3.6,0.8,funMat(0x3a3036,{e:0x100808}),s*3.4,1.8,0); const bowl=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.35,0.35,12),funMat(0x5a4a3a)); bowl.position.set(s*3.4,3.78,0); g.add(bowl);
    const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:hfxTex(),color:0xff7a1a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); fl.position.set(s*3.4,4.4,0); fl.scale.set(1.1,1.8,1); g.add(fl); FUN.x1fl.push(fl);
    addPropBox(FX(42.5),FZ(31)+s*3.4,0.45,0.45); }
  // letreiro e emblema: "ARENA X1" com espadas cruzadas de neon
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(5,1.1),funSign('ARENA X1',5,1.1,'#ff5a2a','#1a0505')); sg.position.set(0,5.8,0); g.add(sg); const sgb=sg.clone(); sgb.rotation.y=Math.PI; g.add(sgb);
  for(const s of [-1,1]){ neonBar(g,[-0.9*s,6.6,0.05],[0.9*s,8.2,0.05],NEON.yellow,0.05); neonBar(g,[-0.55*s,7.15,0.05],[-0.2*s,6.95,0.05],NEON.orange,0.05); }
  const glyph=new THREE.Mesh(new THREE.RingGeometry(2.4,2.75,64),new THREE.MeshBasicMaterial({color:0xff3a0a,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); glyph.rotation.x=-Math.PI/2; glyph.position.set(0,0.04,2.4); g.add(glyph);
  const pts=new Float32Array(90*3); for(let i=0;i<90;i++){ pts[i*3]=rand(-2.3,2.3); pts[i*3+1]=rand(0,5); pts[i*3+2]=rand(-0.6,0.6); } const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(pts,3));
  const emb=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffa04a,size:0.08,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false,fog:false})); g.add(emb);
  root.add(g); FUN.x1p={g,d1,d2,ring,halo,glyph,emb}; const L=lightTake(0xff5a1a,2.4,16,1.3); if(L){ L.position.set(FX(42.5)-1.5,H,FZ(31)); FUN.x1p.L=L; }
  funItem('x1',FX(42.5)-2.2,FZ(31),2.2,'ARENA X1 · 1 contra 1 (online, 2 jogadores)',funX1); }

/* ======================== QUADRO A QUADRO ======================== */
const FHINT=v9El('div','v9poolhint',''); FHINT.hidden=true; document.body.appendChild(FHINT);
const FTOOL=v9El('div','v9poolhint',''); FTOOL.hidden=true; FTOOL.style.bottom='14%'; FTOOL.style.fontSize='13px'; document.body.appendChild(FTOOL);
function funBegin(){ G.rooms=new Set(['FN','FS']); G.power=true; funSetTool('tele'); banner('PARQUE 4FUN','Você está com o TELEPORTADOR: atire a bola e apareça onde ela parar · Q troca para suas armas','gold'); }
v9On('reset',()=>{ funAnimalSet(null,true); funSetTool(null); FUN.mode=null; FUN.run=null; });
v9On('always',dt=>{ if(CUR!=='fun'){ FHINT.hidden=true; FTOOL.hidden=true; if(FUN.tool) funSetTool(null); return; } FUN.t+=dt; const t=FUN.t;
  if(FUN.wheel){ FUN.wheel.rotation.z+=dt*0.12; for(const c of FUN.wheel.children) if(c.userData.cab) c.rotation.z=-FUN.wheel.rotation.z; }
  if(FUN.carousel){ FUN.carousel.rotation.y+=dt*0.5; for(const h of FUN.carousel.children) if(h.userData.ph!=null) h.position.y=1.1+Math.sin(t*2+h.userData.ph)*0.25; }
  const X=FUN.x1p; if(X){ X.d1.rotation.z-=dt*1.6; X.d2.rotation.z+=dt*2.6; const pul=0.5+0.5*Math.sin(t*3.2); X.halo.material.opacity=0.15+pul*0.2; X.glyph.material.opacity=0.35+pul*0.35; X.ring.scale.setScalar(1+pul*0.02); if(X.L) X.L.intensity=2.0+pul*1.2+Math.random()*0.3;
    const a=X.emb.geometry.attributes.position.array; for(let i=0;i<a.length;i+=3){ a[i+1]+=dt*rand(0.6,1.6); a[i]+=Math.sin(t*3+i)*dt*0.2; if(a[i+1]>5.5){ a[i+1]=0; a[i]=rand(-2.3,2.3); } } X.emb.geometry.attributes.position.needsUpdate=true;
    for(const f of FUN.x1fl){ f.scale.set(1+Math.random()*0.25,1.6+Math.random()*0.5,1); f.material.color.setHSL(0.04+Math.random()*0.05,1,0.55); } }
  if(FUN.danceTiles){ const beat=Math.floor(t*2.2); FUN.danceTiles.forEach((m,i)=>{ const h=0.78+((i*7+beat*3)%10)/40; m.material.color.setHSL(h%1,1,((i+beat)%3===0)?0.55:0.18); }); }
  for(const n of FUN.neon){ n.h.material.opacity=0.14+Math.sin(t*2+n.m.position.x*0.3)*0.05; }
  for(const d of FUN.ducks){ const run=FUN.mode==='duck'; const x=FX(40)-1.4+((d.i*0.5+t*(run?1.2:0.4))%3); d.g.position.x=x; if(d.hit>0){ d.hit-=dt; d.g.rotation.x=Math.min(Math.PI/2,(0.6-d.hit)*6); } else d.g.rotation.x=0; }
  let best=null, bd=9; if(G.state==='playing'&&!FUN.mode&&!POOL.on) for(const it of FUN.items){ const d=Math.hypot(P.pos.x-it.x,P.pos.z-it.z); if(d<it.r&&d<bd){ bd=d; best=it; } }
  FUN.near=best; FHINT.hidden=!best; if(best){ const h='<b>E</b> · '+best.label; if(FHINT._t!==h){ FHINT._t=h; FHINT.innerHTML=h; } }
  const tt=FUN.tool==='tele'?'TELEPORTADOR · clique: atirar a bola · <b>Q</b>: suas armas':FUN.tool==='portal'?'PORTAIS · esquerdo: azul · direito: laranja · <b>Q</b>: suas armas':FUN.anim?'':'<b>Q</b> · pegar o teletransportador';
  FTOOL.hidden=!tt||G.state!=='playing'||POOL.on||!!FUN.mode; if(FTOOL._t!==tt){ FTOOL._t=tt; FTOOL.innerHTML=tt; } });
addEventListener('keydown',e=>{ if(CUR!=='fun'||G.state!=='playing'||e.repeat) return; if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if(e.code==='KeyE'){ if(FUN.mode==='dart'||FUN.mode==='cups'){ e.preventDefault(); e.stopImmediatePropagation(); funModeEnd(); return; } if(FUN.near){ e.preventDefault(); e.stopImmediatePropagation(); FUN.near.use(); } }
  if(e.code==='KeyQ'&&!FUN.anim&&!POOL.on&&!FUN.mode){ e.preventDefault(); e.stopImmediatePropagation(); funSetTool(FUN.tool?null:(FUN.lastTool||'tele')); } },true);

/* ---- plataformas: dá para subir pulando, cair da beirada, e não atravessar ---- */
{ const _fa=floorAt; floorAt=function(x,z){ const b=_fa(x,z); if(CUR!=='fun'||!FUN.plats.length) return b; let top=b; for(const p of FUN.plats) if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1&&p.top>top) top=p.top; return top; }; }
{ let prev=null; v9On('frame',dt=>{ if(CUR!=='fun'){ prev=null; return; } const b=floorAt(P.pos.x,P.pos.z);
  if(prev&&FUN.mode!=='zip'&&!FUN.tpJust){ const abs=prev.base+prev.y; if(b>abs+0.35){ P.pos.x=prev.x; P.pos.z=prev.z; P.vx=P.vz=0; } else if(b<prev.base-0.05){ P.y+=prev.base-b; } }
  FUN.tpJust=false;
  for(const tr of FUN.tramps){ if(Math.hypot(P.pos.x-tr.x,P.pos.z-tr.z)<1.0&&P.y<=0.02&&!P.down){ P.vy=13.5; P.y=0.05; try{ const o=Snd.out(0.7,0,0.2,null); Snd.oscTo(o,{freq:180,freqEnd:420,dur:0.25,gain:0.25}); }catch(e){} } }
  if(FUN.run){ const R=FUN.run; R.t+=dt; const p=FUN.plats.find(q=>P.pos.x>=q.x0&&P.pos.x<=q.x1&&P.pos.z>=q.z0&&P.pos.z<=q.z1&&Math.abs(P.base+P.y-q.top)<0.3);
    if(p&&p.cp&&R.cp<p.i){ R.cp=p.i; banner('PONTO DE CONTROLE',`${R.t.toFixed(1)} s`,'gold'); try{ Snd.sample('slot_ding',{vol:0.6}); }catch(e){} }
    if(p&&p.end){ const rec=funRec(); const best=!rec.park||R.t<rec.park; if(best){ rec.park=+R.t.toFixed(2); saveProg(); } banner('PARKOUR COMPLETO!',`${R.t.toFixed(2)} s`+(best?' · NOVO RECORDE':' · recorde '+rec.park+' s'),'gold'); try{ Snd.sample('powerup_win',{vol:0.8}); }catch(e){} actLog(`{n} completou o parkour em ${R.t.toFixed(2)} s`); FUN.run=null; }
    else if(P.base+P.y<0.2&&R.t>1.5){ const cp=FUN.plats[R.cp]; if(cp&&R.cp>0){ P.pos.set((cp.x0+cp.x1)/2,0,(cp.z0+cp.z1)/2); P.y=0; P.vy=0; banner('CAIU!','De volta ao ponto de controle','red'); } else { FUN.run=null; banner('CAIU!','Parkour cancelado','red'); } } }
  prev={x:P.pos.x,z:P.pos.z,base:floorAt(P.pos.x,P.pos.z),y:P.y}; }); }
function funParkStart(){ const p=FUN.plats[0]; FUN.run={t:0,cp:0}; banner('PARKOUR','Suba até o sino! Os pontos de controle salvam seu progresso (o teleportador não vale)','gold'); P.pos.set(p.x0-1.2,0,(p.z0+p.z1)/2); }
function funZip(){ const Z=FUN.zip; if(!Z||FUN.mode) return; FUN.mode='zip'; FUN.zipT=0; try{ Snd.sample('knife_whoosh',{vol:0.6,rate:0.6}); }catch(e){} }
v9On('frame',dt=>{ if(FUN.mode!=='zip') return; const Z=FUN.zip; FUN.zipT+=dt/3.2; const k=Math.min(1,FUN.zipT), e=k*k*(3-2*k); const p=Z.A.clone().lerp(Z.B,e); P.pos.x=p.x; P.pos.z=p.z; P.y=Math.max(0,p.y-1.9-floorAt(p.x,p.z)); P.vy=0; P.vx=P.vz=0;
  if(k>=1){ FUN.mode=null; P.y=0; } });

/* ======================== FERRAMENTAS NA MÃO ======================== */
function funVmSync(){ if(FUN.vm0==null) FUN.vm0=!!CINEMA.noVm; CINEMA.noVm=FUN.vm0||!!FUN.anim; if(!FUN.anim){ CINEMA.noVm=FUN.vm0; FUN.vm0=null; } }
// com a ferramenta na mão, só a arma some (a cena da mão continua sendo desenhada)
V9VM.push(()=>{ const on=CUR==='fun'&&!!FUN.tool&&!FUN.anim; if(on){ vmRoot.visible=false; FUN.hidVm=true; } else if(FUN.hidVm){ vmRoot.visible=true; FUN.hidVm=false; } });
{ const _oc=offerCards; offerCards=function(){ if(CUR==='fun') return; return _oc.apply(this,arguments); }; }
v9On('always',()=>{ const m=document.getElementById('mission'); if(m){ if(CUR==='fun'){ if(!m.hidden){ m.hidden=true; FUN.misHid=true; } } else if(FUN.misHid){ m.hidden=false; FUN.misHid=false; } } });
const TOOL={tele:null,portal:null,kick:0,sw:0};
function funToolModel(k){ if(TOOL[k]) return TOOL[k]; const g=new THREE.Group(); const W=funMat(0xeef0f2,{e:0x202224}), B=funMat(0x1c1e22), G=funMat(0x9aa0a8);
  if(k==='portal'){ // ferramenta de portais (design próprio): carenagem branca, garras escuras, núcleo de energia aceso
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.07,0.26,16),W); body.rotation.x=Math.PI/2; body.position.z=0.02; g.add(body);
    const back=new THREE.Mesh(new THREE.SphereGeometry(0.075,16,12),W); back.scale.set(1,1,1.3); back.position.z=0.15; g.add(back);
    const sh=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.03,0.2),B); sh.position.set(0,0.07,0.05); g.add(sh);
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.2,12),new THREE.MeshBasicMaterial({color:0x2a9aff,transparent:true,opacity:0.9})); tube.rotation.x=Math.PI/2; tube.position.set(0,0.095,0.04); g.add(tube); g.userData.core=tube;
    const glass=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.21,12),new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:0.25,shininess:120})); glass.rotation.x=Math.PI/2; glass.position.copy(tube.position); g.add(glass);
    const nose=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.055,0.06,16),B); nose.rotation.x=Math.PI/2; nose.position.z=-0.13; g.add(nose);
    const emitter=new THREE.Mesh(new THREE.SphereGeometry(0.03,12,10),new THREE.MeshBasicMaterial({color:0x2a9aff})); emitter.position.z=-0.165; g.add(emitter); g.userData.tip=emitter;
    g.userData.claws=[]; for(let i=0;i<3;i++){ const a=i/3*Math.PI*2+Math.PI/2; const c=new THREE.Group(); c.position.set(Math.cos(a)*0.05,Math.sin(a)*0.05,-0.15); const s1=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.014,0.09),B); s1.position.z=-0.035; s1.rotation.x=0.0; c.add(s1); const s2=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.012,0.04),B); s2.position.set(0,0,-0.08); c.add(s2); c.rotation.set(-Math.sin(a)*0.35,Math.cos(a)*0.35,0); g.add(c); g.userData.claws.push(c); }
    const grip=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.11,0.05),B); grip.position.set(0,-0.08,0.07); grip.rotation.x=0.25; g.add(grip);
    for(let i=0;i<3;i++){ const st=new THREE.Mesh(new THREE.TorusGeometry(0.068,0.006,6,20),G); st.position.z=-0.06+i*0.06; g.add(st); }
  } else { // teleportador: corpo cromado, cúpula transparente com a bola branca dentro
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.1,0.3),G); g.add(body);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(0.06,16,12),new THREE.MeshPhongMaterial({color:0xbfe8ff,transparent:true,opacity:0.35,shininess:140})); dome.position.set(0,0.07,0.02); g.add(dome);
    const ball=new THREE.Mesh(new THREE.SphereGeometry(0.035,14,10),new THREE.MeshBasicMaterial({color:0xffffff})); ball.position.set(0,0.07,0.02); g.add(ball); g.userData.ball=ball;
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.04,0.16,14),W); barrel.rotation.x=Math.PI/2; barrel.position.z=-0.21; g.add(barrel);
    const mz=new THREE.Mesh(new THREE.TorusGeometry(0.035,0.008,6,16),new THREE.MeshBasicMaterial({color:NEON.cyan})); mz.position.z=-0.29; g.add(mz); g.userData.tip=mz;
    for(const s of [-1,1]){ const fin=new THREE.Mesh(new THREE.BoxGeometry(0.01,0.06,0.18),new THREE.MeshBasicMaterial({color:NEON.pink})); fin.position.set(s*0.05,0.0,-0.02); g.add(fin); }
    const grip=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.11,0.05),B); grip.position.set(0,-0.09,0.08); grip.rotation.x=0.3; g.add(grip); }
  const hand=makeHand(false,[1.2,1.1,0.9]); hand.scale.setScalar(0.95); hand.position.set(0.0,-0.09,0.1); hand.rotation.set(-1.45,0,0); g.add(hand);
  g.visible=false; vmScene.add(g); TOOL[k]=g; return g; }
function funSetTool(k){ if(k&&FUN.anim) return; for(const kk of ['tele','portal']){ if(TOOL[kk]) TOOL[kk].visible=false; } if(FUN.tool==='portal'&&k!=='portal'){ for(let i=0;i<2;i++) if(PORT.p[i]){ MAPG.fun.remove(PORT.p[i].g); PORT.p[i]=null; } }
  FUN.tool=k||null; if(k){ FUN.lastTool=k; funToolModel(k).visible=true; TOOL.sw=1; try{ Snd.sample('rl_slide',{vol:0.5,rate:1.3}); }catch(e){} } funVmSync(); }
// pose na tela: balanço ao andar, tranco ao atirar, troca subindo de baixo
v9On('always',dt=>{ const k=FUN.tool; if(!k||!TOOL[k]) return; const g=TOOL[k]; const sp=Math.hypot(P.vx||0,P.vz||0), t=G.t||0; TOOL.kick=Math.max(0,TOOL.kick-dt*5); TOOL.sw=Math.max(0,TOOL.sw-dt*4);
  g.scale.setScalar(0.62); g.position.set(0.15+Math.sin(t*8)*0.005*Math.min(1,sp/4),-0.145+Math.abs(Math.cos(t*8))*0.006*Math.min(1,sp/4)-TOOL.sw*0.25,-0.42+TOOL.kick*0.05); g.rotation.set(TOOL.kick*0.3-TOOL.sw*0.6+0.04,0.1,0);
  if(k==='portal'&&g.userData.claws) g.userData.claws.forEach((c,i)=>{ c.position.z=-0.15-Math.sin(t*3+i)*0.004-TOOL.kick*0.02; });
  if(k==='tele'&&g.userData.ball){ g.userData.ball.visible=!FUN.balls.length&&TOOL.kick<0.5; g.userData.ball.rotation.y+=dt*3; } });
{ const _f=fire; fire=function(){ if(CUR==='fun'&&(FUN.mode==='dart'||FUN.mode==='cups'||FUN.anim||FUN.tool)) return; return _f.apply(this,arguments); }; }

/* ---- teleportador: bola branca com física ---- */
function funSolid(x,z,y){ const ch=grid[Math.floor(z/S)]&&grid[Math.floor(z/S)][Math.floor(x/S)]; if(ch!=='.') return true; for(const p of FUN.plats) if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1&&y<p.top-0.05) return true; return false; }
function funTeleShoot(){ if(FUN.balls.length) return; const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d);
  const m=new THREE.Mesh(new THREE.SphereGeometry(0.09,16,12),new THREE.MeshBasicMaterial({color:0xffffff})); const p=o.clone().addScaledVector(d,0.5); m.position.copy(p); MAPG.fun.add(m);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:hfxTex(),color:0xbfeaff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); glow.scale.set(0.6,0.6,1); m.add(glow);
  FUN.balls.push({m,p,v:d.clone().multiplyScalar(17).add(new THREE.Vector3(0,1.5,0)),t:0,rest:0,last:p.clone()}); TOOL.kick=1;
  try{ const s=Snd.out(0.7,0,0.25,null); Snd.oscTo(s,{type:'sine',freq:300,freqEnd:900,dur:0.15,gain:0.25}); Snd.burstTo(s,{type:'highpass',freq:2500,dur:0.08,gain:0.3}); }catch(e){} }
v9On('frame',dt=>{ if(!FUN.balls.length) return; const b=FUN.balls[0]; const n=4, h=dt/n, r=0.09;
  for(let i=0;i<n;i++){ b.t+=h; b.v.y-=15*h; const nx=b.p.x+b.v.x*h, ny=b.p.y+b.v.y*h, nz=b.p.z+b.v.z*h;
    if(funSolid(nx,b.p.z,b.p.y)){ b.v.x*=-0.55; funBounce(b); } else b.p.x=nx;
    if(funSolid(b.p.x,nz,b.p.y)){ b.v.z*=-0.55; funBounce(b); } else b.p.z=nz;
    const f=floorAt(b.p.x,b.p.z); if(ny<f+r){ b.p.y=f+r; if(b.v.y<-0.8){ b.v.y*=-0.48; b.v.x*=0.78; b.v.z*=0.78; funBounce(b); } else { b.v.y=0; b.v.x*=1-h*4; b.v.z*=1-h*4; } } else b.p.y=ny;
    if(b.p.y>f+r+0.02) b.last.copy(b.p); }
  b.m.position.copy(b.p); if(Math.random()<0.6) emit('spark',b.p.x,b.p.y,b.p.z,1,0.3,0.25,0);
  const slow=Math.hypot(b.v.x,b.v.y,b.v.z)<0.5&&b.p.y<=floorAt(b.p.x,b.p.z)+r+0.01; if(slow) b.rest+=dt; else b.rest=0;
  if(b.rest>0.12||b.t>4.5||b.p.y<-5){ FUN.balls.shift(); MAPG.fun.remove(b.m); funTeleTo(b.p); } });
function funBounce(b){ const t=performance.now(); if(t-(b.lb||0)<70) return; b.lb=t; try{ const s=Snd.out(0.4,0,0.1,null); Snd.oscTo(s,{type:'sine',freq:700,freqEnd:500,dur:0.05,gain:0.18}); }catch(e){} }
function funTeleTo(p){ if(!p||P.down) return; const ch=grid[Math.floor(p.z/S)]&&grid[Math.floor(p.z/S)][Math.floor(p.x/S)]; if(ch!=='.') return;
  emit('spark',P.pos.x,floorAt(P.pos.x,P.pos.z)+1,P.pos.z,24,2.5,0.5,0); P.pos.x=p.x; P.pos.z=p.z; P.y=0; P.vy=0; P.vx=P.vz=0; FUN.tpJust=true; if(FUN.run){ FUN.run=null; banner('PARKOUR','O teleportador cancela o cronômetro','red'); }
  emit('spark',p.x,floorAt(p.x,p.z)+1,p.z,30,3,0.6,0); try{ Snd.sample('timewarp',{vol:0.55,rate:1.7}); flashScreen(); }catch(e){} }

/* ---- dardos ---- */
function funDartStart(){ if(!FUN.dart) return; FUN.mode='dart'; FUN.dartN=3; FUN.dartScore=0; const D=FUN.dart; for(const d of D.darts) MAPG.fun.remove(d); D.darts.length=0; P.pos.set(D.x+2.4,0,D.z); P.yaw=Math.PI/2; P.pitch=0.04; banner('DARDOS','Mire e clique · 3 dardos · E sai','gold'); }
function funDartScore(dy,dz){ const r=Math.hypot(dy,dz); if(r>0.17) return [0,'fora']; if(r<0.0064) return [50,'MOSCA!']; if(r<0.016) return [25,'25'];
  const order=[20,1,18,4,13,6,10,15,2,17,3,19,7,16,8,11,14,9,12,5]; let a=Math.atan2(-dy,-dz)*180/Math.PI+90+9; a=((a%360)+360)%360; const n=order[Math.floor(a/18)%20];
  if(r>=0.099&&r<0.107) return [n*3,'TRIPLO '+n]; if(r>=0.162) return [n*2,'DUPLO '+n]; return [n,''+n]; }
function funModeEnd(){ if(FUN.mode==='dart'&&FUN.dartScore!=null){ const rec=funRec(); if(FUN.dartN<3&&FUN.dartScore>rec.darts){ rec.darts=FUN.dartScore; saveProg(); } } FUN.mode=null; }
/* ---- copos ---- */
function funCupsRack(){ const C=FUN.cups; for(const c of C.cups) MAPG.fun.remove(c.m); C.cups=[]; const mat=funMat(0xe02020); let k=0; for(let row=0;row<4;row++) for(let i=0;i<4-row;i++){ const m=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.04,0.12,10),mat); const x=C.x-0.2+i*0.11+row*0.055, y=C.y+0.06+row*0.12, z=C.z;
  m.position.set(x,y,z); MAPG.fun.add(m); C.cups.push({m,x,y,z,vx:0,vy:0,vz:0,down:false,k:k++}); } }
function funCupsStart(){ FUN.mode='cups'; FUN.cups.balls=3; funCupsRack(); banner('DERRUBE OS COPOS','3 bolas · clique para arremessar · E sai','gold'); }
/* ---- tiro ao alvo ---- */
function funDuckStart(){ funSetTool(null); FUN.mode='duck'; FUN.duckT=30; FUN.duckScore=0; banner('TIRO AO ALVO','30 segundos!','gold'); }
v9On('frame',dt=>{ if(FUN.mode!=='duck') return; FUN.duckT-=dt; if(FUN.duckT<=0){ FUN.mode=null; const rec=funRec(); const best=FUN.duckScore>rec.duck; if(best){ rec.duck=FUN.duckScore; saveProg(); } banner('FIM DO TIRO AO ALVO',`${FUN.duckScore} patos`+(best?' · NOVO RECORDE':' · recorde '+rec.duck),'gold'); } });
v9On('fire',()=>{ if(CUR!=='fun') return; const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d);
  if(FUN.mode==='duck') for(const k of FUN.ducks){ if(k.hit>0) continue; const p=k.g.position; const t=p.clone().sub(o).dot(d); if(t<0) continue; const q=o.clone().addScaledVector(d,t); if(q.distanceTo(p)<0.26){ k.hit=0.6; FUN.duckScore++; try{ Snd.sample('helmet_ping',{vol:0.7}); }catch(e){} hitmarker(true); break; } } });
/* cliques nos modos dardo/copos (o tiro da arma é bloqueado nesses modos) */
addEventListener('mousedown',e=>{ if(CUR!=='fun'||G.state!=='playing'||!document.pointerLockElement) return;
  if(FUN.mode==='dart'&&e.button===0&&FUN.dartN>0){ e.stopImmediatePropagation(); const D=FUN.dart; const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d); if(d.x>=-0.05) return; const t=(D.x+0.02-o.x)/d.x; const hit=o.clone().addScaledVector(d,t);
    const wob=0.012+Math.hypot(P.vx||0,P.vz||0)*0.03; hit.y+=rand(-wob,wob); hit.z+=rand(-wob,wob); const dy=hit.y-D.y, dz=hit.z-D.z; const [pts,name]=funDartScore(dy,dz);
    const dm=new THREE.Group(); const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.008,0.14,6),funMat(0xcccccc)); sh.rotation.z=Math.PI/2; dm.add(sh); const fl=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.002),funMat(0xff3a6a)); fl.position.x=0.08; dm.add(fl); const fl2=fl.clone(); fl2.rotation.x=Math.PI/2; dm.add(fl2);
    dm.position.copy(o).addScaledVector(d,0.5); MAPG.fun.add(dm); D.darts.push(dm); const from=dm.position.clone(), to=new THREE.Vector3(D.x+0.06,hit.y,hit.z); let k=0; const tick=()=>{ k=Math.min(1,k+0.12); dm.position.lerpVectors(from,to,k); dm.position.y+=Math.sin(k*Math.PI)*0.08; if(k<1) requestAnimationFrame(tick); else { try{ const n=Snd.out(0.6,0,0.1,null); Snd.burstTo(n,{type:'bandpass',freq:900,q:2,dur:0.03,gain:0.8}); }catch(err){} } }; tick();
    FUN.dartN--; FUN.dartScore+=pts; banner(name==='fora'?'FORA!':name,`+${pts} · total ${FUN.dartScore}`+(FUN.dartN?'':` · fim! recorde ${Math.max(funRec().darts,FUN.dartScore)}`),'gold');
    if(!FUN.dartN){ funModeEnd(); actLog(`{n} fez ${FUN.dartScore} pontos nos dardos`); } return; }
  if(FUN.mode==='cups'&&e.button===0&&FUN.cups.balls>0){ e.stopImmediatePropagation(); const C=FUN.cups; C.balls--; const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d);
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.035,10,8),funMat(0xffffff)); m.position.copy(o).addScaledVector(d,0.4); MAPG.fun.add(m); C.proj.push({m,v:d.clone().multiplyScalar(8.5).add(new THREE.Vector3(0,1.2,0)),t:0}); try{ Snd.sample('knife_whoosh',{vol:0.35,rate:1.4}); }catch(err){} return; }
  if(FUN.anim&&e.button===0){ e.stopImmediatePropagation(); funAnimalSound(); return; }
  if(FUN.tool==='portal'&&(e.button===0||e.button===2)){ e.stopImmediatePropagation(); funPortalShoot(e.button===0?0:1); return; }
  if(FUN.tool==='tele'&&e.button===0){ e.stopImmediatePropagation(); funTeleShoot(); return; } },true);
v9On('frame',dt=>{ const C=FUN.cups; if(!C) return; for(let i=C.proj.length-1;i>=0;i--){ const b=C.proj[i]; b.t+=dt; b.v.y-=9.8*dt; b.m.position.addScaledVector(b.v,dt);
    for(const c of C.cups){ if(c.down) continue; if(b.m.position.distanceTo(c.m.position)<0.09){ c.down=true; c.vx=b.v.x*0.4+rand(-.5,.5); c.vy=1.5; c.vz=b.v.z*0.4+rand(-.5,.5); try{ const n=Snd.out(0.5,0,0.1,null); Snd.burstTo(n,{type:'bandpass',freq:1600,q:3,dur:0.04,gain:0.6}); }catch(e){} for(const o of C.cups) if(!o.down&&o.m.position.y>c.m.position.y&&Math.abs(o.m.position.x-c.m.position.x)<0.12){ o.down=true; o.vx=rand(-.6,.6); o.vy=0.8; o.vz=rand(-.4,.4); } } }
    if(b.t>2.5||b.m.position.y<0){ MAPG.fun.remove(b.m); C.proj.splice(i,1); if(C.balls===0&&!C.proj.length&&FUN.mode==='cups'){ const n=C.cups.filter(c=>c.down).length; const rec=funRec(); const best=n>rec.cups; if(best){ rec.cups=n; saveProg(); } banner(n===10?'STRIKE! TODOS OS COPOS!':'FIM',`${n} de 10 copos`+(best?' · NOVO RECORDE':''),'gold'); FUN.mode=null; } } }
  for(const c of C.cups){ if(!c.down) continue; if(c.m.position.y>0.06){ c.vy-=9.8*dt; c.m.position.x+=c.vx*dt; c.m.position.y+=c.vy*dt; c.m.position.z+=c.vz*dt; c.m.rotation.x+=dt*6; c.m.rotation.z+=dt*4; if(c.m.position.y<0.06){ c.m.position.y=0.06; } } } });

/* ---- roleta e caça-níquel: drax de verdade (os do perfil) ---- */
function funDrax(){ return PROG.drax|0; }
function funRouOpen(){ if(FUN.rou.v>0) return; try{ document.exitPointerLock(); }catch(e){}
  const el=v9El('div','v9poolm',`<div class="bx"><h3>Roleta</h3><p>Você tem <b>${funDrax()}</b> drax. Cor/par/ímpar paga 2×, número paga 36×.</p>
    <div style="display:flex;gap:6px;margin-bottom:8px">${[10,25,50,100].map(v=>`<button class="ghost" data-b="${v}" type="button" style="text-align:center">${v}</button>`).join('')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">${[['red','Vermelho'],['black','Preto'],['even','Par'],['odd','Ímpar']].map(([k,l])=>`<button class="ghost" data-k="${k}" type="button">${l}</button>`).join('')}</div>
    <input id="rnum" placeholder="ou um número de 0 a 36" maxlength="2"><button class="cta small" data-go="1" type="button">Girar</button><button class="ghost" data-x="1" type="button">Sair</button></div>`);
  document.body.appendChild(el); let bet=10, kind='red'; const sel=()=>{ for(const b of el.querySelectorAll('[data-b]')) b.style.outline=+b.dataset.b===bet?'2px solid #ffd24a':''; for(const b of el.querySelectorAll('[data-k]')) b.style.outline=b.dataset.k===kind?'2px solid #ffd24a':''; }; sel();
  el.querySelector('input').addEventListener('keydown',e=>e.stopPropagation());
  el.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; if(b.dataset.b){ bet=+b.dataset.b; sel(); } else if(b.dataset.k){ kind=b.dataset.k; el.querySelector('input').value=''; sel(); }
    else if(b.dataset.x){ el.remove(); try{ requestLock(); }catch(e){} }
    else if(b.dataset.go){ const nv=el.querySelector('input').value.trim(); const num=nv!==''?clamp(parseInt(nv)||0,0,36):null; if(funDrax()<bet){ b.textContent='Drax insuficiente'; return; } el.remove(); try{ requestLock(); }catch(e){} funRouSpin(bet,num!=null?'n'+num:kind); } });
  FUN.menuEl=el; }
function funRouSpin(bet,kind){ PROG.drax-=bet; saveProg(); const R=FUN.rou; R.result=(Math.random()*37)|0; R.bet=bet; R.kind=kind; R.v=1; R.t=0; try{ Snd.sample('roulette_spin',{vol:0.8}); }catch(e){} }
v9On('frame',dt=>{ const R=FUN.rou; if(!R||!R.v) return; R.t+=dt; const dur=4.2, k=Math.min(1,R.t/dur); const idx=FUN_ROU.indexOf(FUN_ROU[R.result]);
  const target=-(idx+0.5)/37*Math.PI*2; R.wh.rotation.y=(1-Math.pow(1-k,3))*(Math.PI*12)+target*(k); const ba=-R.t*9*(1-k)+R.wh.rotation.y+Math.PI/2; const rr=0.55-k*0.12; R.ball.position.set(R.x+Math.cos(ba)*rr,1.0,R.z+Math.sin(ba)*rr);
  if(k>=1){ R.v=0; const n=FUN_ROU[R.result]; const red=FUN_RED.has(n); let win=0; if(R.kind[0]==='n'){ if(+R.kind.slice(1)===n) win=R.bet*36; } else if(n!==0){ if((R.kind==='red'&&red)||(R.kind==='black'&&!red)||(R.kind==='even'&&n%2===0)||(R.kind==='odd'&&n%2===1)) win=R.bet*2; }
    if(win){ PROG.drax+=win; saveProg(); try{ Snd.sample('cash',{vol:0.8}); Snd.sample('slot_ding',{vol:0.7}); }catch(e){} actLog(`{n} ganhou ${win} drax na roleta`); }
    banner(`${n} ${n===0?'VERDE':red?'VERMELHO':'PRETO'}`,win?`VOCÊ GANHOU ${win} DRAX!`:`Perdeu ${R.bet} drax · saldo ${funDrax()}`,win?'gold':'red'); } });
function funSlotSpin(){ if(FUN.slotBusy) return; if(funDrax()<10){ banner('Drax insuficiente','Precisa de 10 drax','red'); return; } PROG.drax-=10; saveProg(); FUN.slotBusy=true; try{ Snd.sample('roulette_spin',{vol:0.6,rate:1.4}); }catch(e){}
  const sy=['🍒','🍋','🔔','💀','💎','7']; const w=[30,25,18,14,9,4]; const pick1=()=>{ let r=Math.random()*100; for(let i=0;i<6;i++){ if((r-=w[i])<0) return i; } return 0; }; const res=[pick1(),pick1(),pick1()];
  let n=0; const iv=setInterval(()=>{ n++; banner(`${sy[(Math.random()*6)|0]} ${sy[(Math.random()*6)|0]} ${sy[(Math.random()*6)|0]}`,'girando…','gold'); if(n>=8){ clearInterval(iv); FUN.slotBusy=false;
    const pay=res[0]===res[1]&&res[1]===res[2]?[20,30,50,80,150,500][res[0]]:(res[0]===res[1]||res[1]===res[2]||res[0]===res[2])?15:0;
    if(pay){ PROG.drax+=pay; saveProg(); try{ Snd.sample('cash',{vol:0.8}); }catch(e){} } banner(res.map(i=>sy[i]).join(' '),pay?`+${pay} DRAX!`:`Nada · saldo ${funDrax()}`,pay?'gold':'red'); } },140); }

/* ---- fogos ---- */
function funFireworks(){ if(FUN.fwT>0) return; FUN.fwT=6; for(let i=0;i<7;i++) setTimeout(()=>{ if(CUR!=='fun') return; const x=FX(29)+rand(-12,12), z=FZ(31)+rand(-12,12), y=rand(16,24); const cols=['spark','elec','green','blood']; emit(cols[i%3],x,y,z,40,9,1.2,-0.15); boomLight.position.set(x,y,z); boomLight.color.setHSL(Math.random(),1,0.6); boomLight.intensity=3;
  try{ const o=Snd.out(0.8,0,0.6,null); Snd.burstTo(o,{type:'lowpass',freq:400,dur:0.4,gain:0.9}); for(let k=0;k<8;k++) Snd.burstTo(o,{t:Snd.now+0.3+k*0.05,type:'highpass',freq:3000,dur:0.02,gain:0.3}); }catch(e){} },i*600); }
v9On('always',dt=>{ if(FUN.fwT>0) FUN.fwT-=dt; });

/* ---- arena X1 ---- */
function funX1(){ if(NET.mode!=='host'){ banner('ARENA X1',NET.mode==='client'?'O anfitrião da sala abre a arena':'Crie uma sala online com um amigo para jogar o X1','red'); return; }
  const n=Array.from(NET.players.values()).filter(rp=>rp.has).length+1; if(n!==2){ banner('ARENA X1','Precisa de exatamente 2 jogadores na sala','red'); return; }
  X1.fromFun=true; NET.gen++; netRequest('backToLobby').catch(()=>{}); enterRoomLobby('x1'); }
{ const _xf=x1Finish; x1Finish=function(){ const back=X1.fromFun; const r=_xf.apply(this,arguments); if(back&&NET.mode==='host'){ X1.fromFun=false; setTimeout(()=>{ try{ NET.gen++; netRequest('backToLobby').catch(()=>{}); enterRoomLobby('fun'); }catch(e){} },300); } return r; }; }

/* ---- cabine do bicho ---- */
const ANIMALS=[{k:'galinha',name:'Galinha',eye:0.55,spd:1.25,col:0xf4f0e2},{k:'cachorro',name:'Cachorro',eye:0.75,spd:1.4,col:0x8a5a2a},{k:'porco',name:'Porco',eye:0.65,spd:0.95,col:0xf0a0a8}];
function funAnimalMesh(k){ const a=ANIMALS.find(q=>q.k===k)||ANIMALS[0]; const g=new THREE.Group(), m=funMat(a.col);
  if(k==='galinha'){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,8),m); b.scale.set(1,0.9,1.3); b.position.y=0.35; g.add(b); const h=new THREE.Mesh(new THREE.SphereGeometry(0.11,8,6),m); h.position.set(0,0.6,0.22); g.add(h); const c=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.08,0.1),funMat(0xd82020)); c.position.set(0,0.72,0.22); g.add(c); const bk=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.08,6),funMat(0xffa020)); bk.rotation.x=Math.PI/2; bk.position.set(0,0.58,0.34); g.add(bk); for(const s of [-1,1]){ const l=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.012,0.18,4),funMat(0xffa020)); l.position.set(s*0.07,0.09,0); g.add(l); } }
  else { const big=k==='porco'; const b=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.4,big?0.8:0.75),m); b.position.y=0.5; g.add(b); const h=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.28,0.3),m); h.position.set(0,0.66,0.5); g.add(h);
    if(big){ const sn=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.06,10),funMat(0xe07a88)); sn.rotation.x=Math.PI/2; sn.position.set(0,0.62,0.67); g.add(sn); } else { const sn=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.12,0.16),m); sn.position.set(0,0.6,0.7); g.add(sn); for(const s of [-1,1]){ const e=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.14,0.04),funMat(0x4a2a10)); e.position.set(s*0.12,0.84,0.46); g.add(e); } }
    for(const sx of [-1,1]) for(const sz of [-1,1]){ const l=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.32,0.1),m); l.position.set(sx*0.14,0.16,sz*0.28); g.add(l); } }
  return g; }
function funAnimalSet(k,silent){ if(k&&FUN.tool) funSetTool(null); FUN.anim=k; funVmSync();
  if(!silent){ const a=ANIMALS.find(q=>q.k===k); banner(a?'VOCÊ VIROU '+a.name.toUpperCase():'DE VOLTA AO NORMAL',a?'Clique para fazer barulho · E na cabine troca':'',a?'gold':''); }
  if(NET.mode){ const ev=['fa',NET.me||'',k||'']; if(NET.mode==='host') pushEv(ev); else netAct(ev); } }
function funAnimalCycle(){ const i=FUN.anim?ANIMALS.findIndex(q=>q.k===FUN.anim):-1; const n=i+1; funAnimalSet(n<ANIMALS.length?ANIMALS[n].k:null); emit('dust',P.pos.x,0.5,P.pos.z,24,2.5,0.7,0.5); try{ Snd.sample('timewarp',{vol:0.5,rate:1.5}); }catch(e){} }
function funAnimalSound(){ const k=FUN.anim; try{ const o=Snd.out(0.8,0,0.2,null), t=Snd.now;
  if(k==='galinha'){ for(let i=0;i<3;i++) Snd.oscTo(o,{t:t+i*0.11,type:'square',freq:900,freqEnd:620,dur:0.08,gain:0.12}); Snd.oscTo(o,{t:t+0.36,type:'square',freq:1100,freqEnd:500,dur:0.25,gain:0.12}); }
  else if(k==='cachorro') Snd.sample(['dog_growl1','dog_growl2'],{vol:0.7,rate:1.5});
  else { Snd.oscTo(o,{t,type:'sawtooth',freq:180,freqEnd:120,dur:0.25,gain:0.2}); Snd.burstTo(o,{t,type:'bandpass',freq:500,q:2,dur:0.25,gain:0.4}); } }catch(e){} }
// olho na altura do bicho e velocidade
{ const _sk=v9SpeedK; v9SpeedK=function(){ const a=FUN.anim&&ANIMALS.find(q=>q.k===FUN.anim); return _sk()*(a?a.spd:1); }; }
function funCam(dt){ if(FUN.camPrev) try{ FUN.camPrev(dt); }catch(e){} if(!FUN.anim||CUR!=='fun'||POOL.on) return; const a=ANIMALS.find(q=>q.k===FUN.anim); if(a) camera.position.y=floorAt(P.pos.x,P.pos.z)+a.eye+P.y; }
v9On('always',()=>{ const want=!!FUN.anim&&CUR==='fun'; if(want&&V9CAM.fn!==funCam){ FUN.camPrev=V9CAM.fn; V9CAM.fn=funCam; } else if(!want&&V9CAM.fn===funCam){ V9CAM.fn=FUN.camPrev||null; FUN.camPrev=null; } });
// os outros veem o bicho no lugar do boneco
V9NET.ev.fa=(e,me)=>{ const id=e[2], k=e[3]; if(String(id)===String(me)) return; funRemoteAnimal(id,k); };
V9NET.act.fa=(peer,a)=>{ pushEv(['fa',peer,a[3]||'']); funRemoteAnimal(peer,a[3]||''); };
function funRemoteAnimal(id,k){ const old=FUN.remoteAnimals.get(String(id)); if(old){ scene.remove(old.g); FUN.remoteAnimals.delete(String(id)); } const rp=NET.players.get(id)||Array.from(NET.players.values()).find(q=>String(q.peer)===String(id));
  if(rp&&rp.g) rp.g.visible=!k; if(!k) return; const g=funAnimalMesh(k); scene.add(g); FUN.remoteAnimals.set(String(id),{g,rp}); }
v9On('always',()=>{ for(const [id,o] of FUN.remoteAnimals){ const rp=o.rp; if(!rp||rp.x==null||CUR!=='fun'){ o.g.visible=false; continue; } o.g.visible=true; o.g.position.set(rp.x,floorAt(rp.x,rp.z),rp.z); o.g.rotation.y=(rp.yaw||rp.tyaw||0)+Math.PI; if(rp.g) rp.g.visible=false; } });

/* ---- arma de portais ---- */
const PORT={p:[null,null],cd:0};
/* portais "de verdade": cada portal mostra, em tempo real, o que a câmera veria saindo pelo outro
   (câmera virtual com o mesmo enquadramento + plano de recorte oblíquo na superfície do portal de saída). */
const PRT={rt:[null,null],vcam:new THREE.PerspectiveCamera(),busy:false,R180:new THREE.Matrix4().makeRotationY(Math.PI),sz:new THREE.Vector2(),cp:new THREE.Plane(),q:new THREE.Vector4(),v4:new THREE.Vector4()};
function prtRT(i){ if(!PRT.rt[i]){ PRT.rt[i]=new THREE.WebGLRenderTarget(512,512,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}); try{ PRT.rt[i].texture.encoding=renderer.outputEncoding; }catch(e){} } return PRT.rt[i]; }
function prtLink(i){ const A=PORT.p[i].g, B=PORT.p[1-i].g; A.updateMatrixWorld(true); B.updateMatrixWorld(true); return B.matrixWorld.clone().multiply(PRT.R180).multiply(A.matrixWorld.clone().invert()); }
function funPortalMesh(col,i){ const g=new THREE.Group(); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.06,8,40),new THREE.MeshBasicMaterial({color:col})); ring.scale.y=1.6; g.add(ring);
  const glow=new THREE.Mesh(new THREE.TorusGeometry(0.64,0.16,8,40),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false})); glow.scale.y=1.6; g.add(glow);
  const mat=new THREE.ShaderMaterial({uniforms:{tView:{value:prtRT(i).texture},uRes:{value:new THREE.Vector2(1,1)},uCol:{value:new THREE.Color(col)},uOn:{value:0},uT:{value:0}},
    vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:'uniform sampler2D tView; uniform vec2 uRes; uniform vec3 uCol; uniform float uOn; uniform float uT; varying vec2 vUv; void main(){ vec2 s=gl_FragCoord.xy/uRes; vec3 v=texture2D(tView,s).rgb; float r=length(vUv-0.5)*2.0; float a=atan(vUv.y-0.5,vUv.x-0.5); vec3 sw=uCol*(0.35+0.35*sin(r*18.0-uT*5.0+a*3.0)); vec3 c=mix(sw,v,uOn); c=mix(c,uCol*1.5,smoothstep(0.82,1.0,r)*0.9); gl_FragColor=vec4(c,1.0); }'});
  const view=new THREE.Mesh(new THREE.CircleGeometry(0.62,40),mat); view.scale.y=1.6; view.position.z=0.005; g.add(view); g.userData.view=view; g.userData.inner=glow; g.userData.mat=mat;
  view.onBeforeRender=(rn,sc,cam)=>{ mat.uniforms.uT.value=G.t||0; rn.getDrawingBufferSize(PRT.sz); mat.uniforms.uRes.value.copy(PRT.sz);
    if(PRT.busy||!PORT.p[0]||!PORT.p[1]||cam!==camera){ if(!PRT.busy) mat.uniforms.uOn.value=0; return; }
    const A=PORT.p[i], B=PORT.p[1-i]; if(cam.position.clone().sub(A.p).dot(A.n)<0.02){ return; }
    const rt=prtRT(i), w=Math.max(256,PRT.sz.x>>1), h=Math.max(256,PRT.sz.y>>1); if(rt.width!==w||rt.height!==h) rt.setSize(w,h);
    const M=prtLink(i), vc=PRT.vcam; vc.matrixWorld.multiplyMatrices(M,cam.matrixWorld); vc.matrixWorld.decompose(vc.position,vc.quaternion,vc.scale); vc.scale.set(1,1,1); vc.updateMatrixWorld(true); vc.matrixWorldInverse.copy(vc.matrixWorld).invert();
    vc.projectionMatrix.copy(cam.projectionMatrix);
    // plano oblíquo: nada atrás da superfície do portal de saída aparece (senão a parede tampava a vista)
    PRT.cp.setFromNormalAndCoplanarPoint(B.n,B.p.clone().addScaledVector(B.n,-0.01)); PRT.cp.applyMatrix4(vc.matrixWorldInverse);
    const cp=PRT.v4.set(PRT.cp.normal.x,PRT.cp.normal.y,PRT.cp.normal.z,PRT.cp.constant), pm=vc.projectionMatrix.elements, q=PRT.q;
    q.x=(Math.sign(cp.x)+pm[8])/pm[0]; q.y=(Math.sign(cp.y)+pm[9])/pm[5]; q.z=-1.0; q.w=(1.0+pm[10])/pm[14]; cp.multiplyScalar(2.0/cp.dot(q)); pm[2]=cp.x; pm[6]=cp.y; pm[10]=cp.z+1.0; pm[14]=cp.w; vc.projectionMatrixInverse.copy(vc.projectionMatrix).invert();
    const old=rn.getRenderTarget(), xr=rn.xr.enabled, sh=rn.shadowMap.autoUpdate, sk=skyG.position.clone(); PRT.busy=true; view.visible=false; const bv=B.g.userData.view; if(bv) bv.visible=false;
    try{ rn.xr.enabled=false; rn.shadowMap.autoUpdate=false; skyG.position.copy(vc.position); rn.setRenderTarget(rt); rn.state.buffers.depth.setMask(true); rn.clear(); rn.render(sc,vc); }catch(e){} finally{ rn.setRenderTarget(old); rn.xr.enabled=xr; rn.shadowMap.autoUpdate=sh; skyG.position.copy(sk); view.visible=true; if(bv) bv.visible=true; PRT.busy=false; }
    mat.uniforms.uOn.value=1; };
  return g; }
function funPortalShoot(i){ const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d); let t=40, n=null; try{ const tw=rayWall(o,d,40); if(tw<t){ t=tw; } }catch(e){}
  if(d.y<-0.05){ const tf=(floorAt(o.x,o.z)+0.02-o.y)/d.y; if(tf>0&&tf<t){ t=tf; n=new THREE.Vector3(0,1,0); } }
  if(t>=40) return; const p=o.addScaledVector(d,t-0.05); if(!n){ const fx=Math.abs(d.x)>Math.abs(d.z); n=fx?new THREE.Vector3(-Math.sign(d.x),0,0):new THREE.Vector3(0,0,-Math.sign(d.z)); p.y=Math.max(1.1,Math.min(p.y,2.2)); }
  const col=i?0xff8a1a:0x2a9aff; if(PORT.p[i]) MAPG.fun.remove(PORT.p[i].g); const g=funPortalMesh(col,i); g.position.copy(p).addScaledVector(n,0.03); g.lookAt(g.position.clone().add(n)); MAPG.fun.add(g); PORT.p[i]={g,p:g.position.clone(),n};
  const T=TOOL.portal; if(T){ T.userData.core.material.color.setHex(col); T.userData.tip.material.color.setHex(col); } TOOL.kick=1;
  try{ const s=Snd.out(0.7,0,0.3,null); Snd.oscTo(s,{type:'sine',freq:i?500:800,freqEnd:i?1200:1600,dur:0.18,gain:0.2}); }catch(e){} emit('spark',p.x,p.y,p.z,14,2,0.4,0); }
v9On('frame',dt=>{ PORT.cd=Math.max(0,PORT.cd-dt); for(let i=0;i<2;i++){ const q=PORT.p[i]; if(q){ q.g.userData.inner.material.opacity=0.28+Math.sin(G.t*6+i)*0.1; } }
  if(CUR!=='fun'||PORT.cd>0||!PORT.p[0]||!PORT.p[1]) return; const eye=new THREE.Vector3(P.pos.x,floorAt(P.pos.x,P.pos.z)+P.y+(PORT.p[0].n.y>0.5||PORT.p[1].n.y>0.5?0.3:0.9),P.pos.z);
  for(let i=0;i<2;i++){ const a=PORT.p[i], b=PORT.p[1-i]; const d=eye.clone().sub(a.p), along=d.dot(a.n), lat=d.clone().addScaledVector(a.n,-along).length();
    if(along<0.45&&along>-0.6&&lat<(a.n.y>0.5?0.75:0.62)){ const M=prtLink(i);
      const f=new THREE.Vector3(-Math.sin(P.yaw),0,-Math.cos(P.yaw)).transformDirection(M), v=new THREE.Vector3(P.vx||0,P.vy||0,P.vz||0).transformDirection(M).multiplyScalar(Math.hypot(P.vx||0,P.vy||0,P.vz||0));
      const out=b.p.clone().addScaledVector(b.n,b.n.y>0.5?0.15:0.75); P.pos.x=out.x; P.pos.z=out.z; FUN.tpJust=true;
      if(Math.abs(f.y)<0.8) P.yaw=Math.atan2(-f.x,-f.z); else if(b.n.y<0.5) P.yaw=Math.atan2(-b.n.x,-b.n.z);
      if(b.n.y>0.5){ P.y=Math.max(0,out.y-floorAt(out.x,out.z)); P.vy=Math.max(6.5,v.length()*0.9); } else { P.y=Math.max(0,b.p.y-1.3-floorAt(out.x,out.z)); P.vx=b.n.x*Math.max(3,Math.hypot(v.x,v.z)); P.vz=b.n.z*Math.max(3,Math.hypot(v.x,v.z)); }
      PORT.cd=0.5; try{ Snd.sample('timewarp',{vol:0.5,rate:1.9}); }catch(e){} break; } } });

/* ---- mapa na seleção: entra o 4FUN, sai o X1 ---- */
try{ const x=document.querySelector('.mapc.x1card'); if(x){ const b=document.createElement('button'); b.className='mapc'; b.dataset.map='fun'; b.type='button'; b.innerHTML='<span class="mt">Parque 4FUN · diversão</span><span class="md">Sem zumbis. Sinuca, dardos, copos, roleta e caça-níquel com drax de verdade, parkour, tirolesa, cabine do bicho, arma de portais e a Arena X1.</span>';
  x.parentNode.insertBefore(b,x); x.style.display='none'; b.addEventListener('pointerenter',()=>mapThumb('fun')); b.addEventListener('focus',()=>mapThumb('fun')); b.addEventListener('click',()=>playChoice('fun')); } }catch(e){}
try{ MPI.fun={d:1,t:'Diversão',img:'img/map_bunker.jpg',sec:'O portão vermelho leva para a Arena X1. A roleta paga 36× no número certo.',f:['Salão de jogos com apostas','Parkour, tirolesa e camas elásticas','Bichos e arma de portais'],s:[1,5,5]}; }catch(e){}
CMDS.parque={d:'parque · vai para o Parque 4FUN',f:()=>{ setMap('fun'); P.pos.set(MAPS.fun.start[0],0,MAPS.fun.start[1]); funBegin(); cprint('Parque 4FUN'); }};
