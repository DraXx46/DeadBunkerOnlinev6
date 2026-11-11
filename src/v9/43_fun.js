/* ================= v9 · PARQUE 4FUN =================
   Um mapa sem zumbis, só de diversão, para jogar sozinho ou com os amigos. Tudo é interativo:
   - SALÃO DE JOGOS: sinuca, dardos, derrubar copos, roleta e caça-níquel apostando DRAX DE VERDADE.
   - ARENA X1: o portão leva os dois jogadores para o 1 contra 1 (o X1 saiu da lista de mapas).
   - PARKOUR: torre de plataformas com cronômetro, pontos de controle e recorde; camas elásticas; tirolesa.
   - CABINE DO BICHO: vire galinha, cachorro ou porco (os outros jogadores veem o bicho).
   - ARMA DE PORTAIS: portal azul (clique esquerdo) e laranja (direito) nas paredes e no chão.
   - TIRO AO ALVO: patinhos andando no trilho, 30 s, recorde.
   - PISTA DE DANÇA com luzes, ROLETA-GIGANTE e CARROSSEL girando, botão de FOGOS. */
MAPS.fun={name:'Parque 4FUN',start:[cx(24),cx(FUN0+50)],start2:[cx(25.5),cx(FUN0+50)],room:'FN',menu:{x:cx(24),z:cx(FUN0+53),yaw:0},fog:0x120c1c,fogD:0.012,bg:0x0a0612,sky:'bunker'};
MAPG.fun=new THREE.Group(); scene.add(MAPG.fun); MAPG.fun.visible=false;
const FUN={items:[],plats:[],tramps:[],near:null,mode:null,poolSpot:null,t:0,anim:null,portal:null,run:null,ducks:[],remoteAnimals:new Map()};
const FZ=r=>cx(FUN0+r), FX=c=>cx(c);
function funRec(){ return PROG.v9fun||(PROG.v9fun={darts:0,cups:0,park:0,duck:0}); }
function funMat(c,o){ return v9Mat('fun'+c.toString(16)+(o&&o.e?'e':''),Object.assign({color:c,shininess:40},o&&o.e?{emissive:o.e}:{})); }
function funGlow(c){ return new THREE.MeshBasicMaterial({color:c}); }
function funSign(txt,w,h,col,bg){ return new THREE.MeshBasicMaterial({map:tex(512,Math.round(512*h/w),(g,W,H)=>{ g.fillStyle=bg||'#14081e'; g.fillRect(0,0,W,H); g.strokeStyle=col; g.lineWidth=10; g.strokeRect(8,8,W-16,H-16);
  g.font=`bold ${Math.round(H*0.5)}px "Stardos Stencil",Impact,sans-serif`; g.textAlign='center'; g.textBaseline='middle'; g.shadowColor=col; g.shadowBlur=24; g.fillStyle=col; g.fillText(txt,W/2,H/2+4); g.shadowBlur=0; g.fillStyle='#fff'; g.globalAlpha=0.55; g.fillText(txt,W/2,H/2+4); }),transparent:true}); }
function funItem(id,x,z,r,label,use){ FUN.items.push({id,x,z,r,label,use}); }

/* ======================== MONTAGEM ======================== */
function buildFun(){ const root=MAPG.fun; const z0=FUN0, z1=FUN1, zc=(z0*S+(z1+1)*S)/2, len=(z1-z0+1)*S;
  // chão: grama escura, caminhos de pedra e praça central
  const grass=new THREE.MeshLambertMaterial({map:tex(256,256,(g,w,h)=>{ g.fillStyle='#1e2a16'; g.fillRect(0,0,w,h); for(let i=0;i<4000;i++){ g.fillStyle=`hsl(${90+Math.random()*30},${30+Math.random()*25}%,${10+Math.random()*14}%)`; g.fillRect(Math.random()*w,Math.random()*h,2,3); } })});
  grass.map.wrapS=grass.map.wrapT=THREE.RepeatWrapping; grass.map.repeat.set(24,28);
  const gnd=new THREE.Mesh(new THREE.PlaneGeometry(MW*S+80,len+60),grass); gnd.rotation.x=-Math.PI/2; gnd.position.set(MW*S/2,0,zc); root.add(gnd);
  const stone=new THREE.MeshLambertMaterial({map:tex(256,256,(g,w,h)=>{ g.fillStyle='#4a4450'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=32) for(let x=(y/32)%2?16:0;x<w;x+=32){ g.fillStyle=`hsl(270,${6+Math.random()*6}%,${24+Math.random()*10}%)`; g.fillRect(x+1,y+1,30,30); } })});
  stone.map.wrapS=stone.map.wrapT=THREE.RepeatWrapping;
  const path=(x,z,w,d)=>{ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),stone.clone()); m.material.map=stone.map.clone(); m.material.map.repeat.set(w/4,d/4); m.material.map.needsUpdate=true; m.rotation.x=-Math.PI/2; m.position.set(x,0.02,z); root.add(m); };
  path(FX(24),FZ(30),6,96); path(FX(30),FZ(34),30,5); path(FX(31),FZ(12),26,5);
  const plaza=new THREE.Mesh(new THREE.CircleGeometry(9,40),stone); plaza.rotation.x=-Math.PI/2; plaza.position.set(FX(24),0.03,FZ(34)); root.add(plaza);
  // paredes do salão (grid) com telhado
  const wallM=new THREE.MeshLambertMaterial({map:tex(256,256,(g,w,h)=>{ g.fillStyle='#3a1e2c'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=32) for(let x=(y/32)%2?32:0;x<w;x+=64){ g.fillStyle=`hsl(340,${30+Math.random()*10}%,${18+Math.random()*8}%)`; g.fillRect(x+2,y+2,60,28); } })});
  buildWalls(z0,z1,wallM,wallM,false);
  try{ const M3=TZG.M||tzBuildMats(); tzRoofed(3,FUN0+4,17,FUN0+21,M3.floorW,M3.ceil,M3.roof,{trim:M3.trim}); }catch(e){}
  // cercas iluminadas, árvores no limite
  for(let z=z0;z<=z1;z++) for(let x=0;x<MW;x++) if(grid[z][x]==='T'&&(x+z)%3===0){ try{ mkTree(cx(x)+rand(-.5,.5),cx(z)+rand(-.5,.5)); }catch(e){} }
  // varais de lâmpadas coloridas cruzando o parque
  const bulbCols=[0xff4a6a,0xffd24a,0x4ad2ff,0x7aff6a,0xd27aff];
  for(const [a,b] of [[[6,26],[42,26]],[[6,40],[42,40]],[[24,24],[24,56]],[[8,30],[40,48]],[[40,30],[8,48]]]){ const A=new THREE.Vector3(FX(a[0]),5.2,FZ(a[1])), B=new THREE.Vector3(FX(b[0]),5.2,FZ(b[1]));
    const n=Math.round(A.distanceTo(B)/1.4); const pts=[]; for(let i=0;i<=n;i++){ const k=i/n; const p=A.clone().lerp(B,k); p.y-=Math.sin(k*Math.PI)*1.2; pts.push(p); if(i%1===0){ const bl=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,5),funGlow(bulbCols[i%5])); bl.position.copy(p).add(new THREE.Vector3(0,-0.1,0)); root.add(bl); } }
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x111111}))); for(const P0 of [A,B]){ const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,5.3,6),funMat(0x3a2a1a)); pole.position.set(P0.x,2.65,P0.z); root.add(pole); } }
  // portal de entrada "PARQUE 4FUN"
  { const g=G3(FX(24),0,FZ(55)); for(const s of [-1,1]){ bx(g,0.6,5.5,0.6,funMat(0x6a1a3a),s*4.2,2.75,0); for(let i=0;i<8;i++){ const l=new THREE.Mesh(new THREE.SphereGeometry(0.09,6,5),funGlow(bulbCols[i%5])); l.position.set(s*4.2+(s>0?-0.32:0.32),0.5+i*0.65,0.32); g.add(l); } }
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(9,1.8),funSign('PARQUE 4FUN',9,1.8,'#ff5ad2')); sg.position.set(0,5.4,0.05); g.add(sg); const sg2=sg.clone(); sg2.rotation.y=Math.PI; sg2.position.z=-0.05; g.add(sg2); root.add(g); addPropBox(FX(24)-4.2,FZ(55),0.3,0.3); addPropBox(FX(24)+4.2,FZ(55),0.3,0.3); }
  // roda-gigante (decoração girando) e carrossel
  { const g=G3(FX(40),0,FZ(50)); const fr=funMat(0xd8d0e0); for(const s of [-1,1]){ bx(g,0.25,9,0.25,fr,s*2.2,4.2,0,0,0,s*0.25); bx(g,0.25,9,0.25,fr,s*2.2,4.2,1.2,0,0,s*0.25); }
    const wheel=new THREE.Group(); wheel.position.set(0,8.4,0.6); const R=6.4; wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R,0.1,6,48),fr));
    for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; const sp2=new THREE.Mesh(new THREE.BoxGeometry(0.08,R,0.08),fr); sp2.position.set(Math.cos(a)*R/2,Math.sin(a)*R/2,0); sp2.rotation.z=a+Math.PI/2; wheel.add(sp2);
      const cab=new THREE.Mesh(new THREE.BoxGeometry(1,0.9,0.9),funMat(bulbCols[i%5])); cab.position.set(Math.cos(a)*R,Math.sin(a)*R-0.6,0); cab.userData.cab=true; wheel.add(cab);
      for(let k=0;k<4;k++){ const b2=new THREE.Mesh(new THREE.SphereGeometry(0.08,5,4),funGlow(bulbCols[(i+k)%5])); const aa=a+k/4*(Math.PI*2/12); b2.position.set(Math.cos(aa)*R,Math.sin(aa)*R,0.12); wheel.add(b2); } }
    g.add(wheel); FUN.wheel=wheel; root.add(g); addPropBox(FX(40),FZ(50),2.8,1.2); }
  { const g=G3(FX(8),0,FZ(48)); const base=new THREE.Mesh(new THREE.CylinderGeometry(4,4.2,0.4,24),funMat(0x6a2a5a)); base.position.y=0.2; g.add(base); const top=new THREE.Mesh(new THREE.ConeGeometry(4.6,1.6,24),funMat(0xd84a8a)); top.position.y=4.2; g.add(top);
    const rot=new THREE.Group(); rot.position.y=0.4; for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,3.2,6),funMat(0xd4b040,{e:0x2a2000})); pole.position.set(Math.cos(a)*3,1.6,Math.sin(a)*3); rot.add(pole);
      const horse=new THREE.Group(); horse.position.set(Math.cos(a)*3,1.1,Math.sin(a)*3); horse.rotation.y=-a; bx(horse,0.3,0.4,0.9,funMat(0xf0e8e0),0,0,0); bx(horse,0.22,0.5,0.25,funMat(0xf0e8e0),0,0.3,0.42,0.5,0,0); horse.userData.ph=i; rot.add(horse); }
    for(let i=0;i<24;i++){ const l=new THREE.Mesh(new THREE.SphereGeometry(0.08,5,4),funGlow(bulbCols[i%5])); const a=i/24*Math.PI*2; l.position.set(Math.cos(a)*4.3,3.4,Math.sin(a)*4.3); g.add(l); }
    g.add(rot); FUN.carousel=rot; root.add(g); addPropBox(FX(8),FZ(48),3.4,3.4); }
  buildFunSalao(root); buildFunPark(root); buildFunBooths(root);
  const L1=lightTake(0xff6ab0,1.4,30,1.4); if(L1){ L1.position.set(FX(24),6,FZ(34)); } }

/* ---- salão de jogos ---- */
function buildFunSalao(root){ const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.2),funSign('SALÃO DE JOGOS',6,1.2,'#ffd24a')); sg.position.set(FX(18)+1.05,3.6,FZ(12.5)); sg.rotation.y=Math.PI/2; root.add(sg);
  const fl=new THREE.MeshLambertMaterial({map:tex(256,256,(g,w,h)=>{ for(let y=0;y<8;y++) for(let x=0;x<8;x++){ g.fillStyle=(x+y)%2?'#1a1a22':'#d8d0c0'; g.fillRect(x*32,y*32,32,32); } })});
  const f=new THREE.Mesh(new THREE.PlaneGeometry(30,36),fl); f.rotation.x=-Math.PI/2; f.position.set(FX(10),0.03,FZ(12.5)); f.material.map.wrapS=f.material.map.wrapT=THREE.RepeatWrapping; f.material.map.repeat.set(4,4.8); root.add(f);
  for(const [x,r] of [[10,8],[10,17]]){ const L=lightTake(0xffe0b0,1.2,14,1.6); if(L) L.position.set(FX(x),3.2,FZ(r)); }
  // sinuca no fundo (usa a mesa da sinuca 2.0)
  FUN.poolSpot={x:FX(7),z:FZ(16.5),ry:0};
  // dardos: alvo na parede oeste
  { const bxp=FX(3)-0.95, bz=FZ(7.5); const board=new THREE.Mesh(new THREE.CircleGeometry(0.34,40),new THREE.MeshLambertMaterial({map:funDartTex()})); board.position.set(bxp,1.73,bz); board.rotation.y=Math.PI/2; root.add(board);
    const cab=new THREE.Mesh(new THREE.BoxGeometry(0.06,1.1,1.1),funMat(0x3a1a0a)); cab.position.set(bxp-0.04,1.73,bz); root.add(cab); FUN.dart={x:bxp,y:1.73,z:bz,board,darts:[]};
    const line=new THREE.Mesh(new THREE.PlaneGeometry(0.05,1.2),funGlow(0xffd24a)); line.rotation.x=-Math.PI/2; line.position.set(bxp+2.37,0.04,bz); root.add(line);
    funItem('dart',bxp+2.4,bz,1.3,'Jogar DARDOS (3 dardos, maior pontuação)',funDartStart); }
  // derrubar copos
  { const tx=FX(10), tz=FZ(5.2); const t=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.08,0.9),funMat(0x5a3a1a)); t.position.set(tx,0.9,tz); root.add(t); for(const sx of [-1,1]) for(const sz of [-1,1]){ const l=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.9,0.08),funMat(0x3a2a1a)); l.position.set(tx+sx*1,0.45,tz+sz*0.38); root.add(l); }
    addPropBox(tx,tz,1.1,0.45); FUN.cups={x:tx,y:0.94,z:tz,cups:[],balls:0,proj:[]}; funCupsRack(); funItem('cups',tx,tz+2.6,1.4,'DERRUBE OS COPOS (3 bolas)',funCupsStart); }
  // roleta (aposta com drax)
  { const tx=FX(14), tz=FZ(8.5); const t=new THREE.Mesh(new THREE.BoxGeometry(1.6,0.9,1.6),funMat(0x0e4a26)); t.position.set(tx,0.45,tz); root.add(t); addPropBox(tx,tz,0.8,0.8);
    const wh=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.08,37),new THREE.MeshLambertMaterial({map:funRouletteTex()})); wh.position.set(tx,0.95,tz); root.add(wh); FUN.rou={x:tx,z:tz,wh,spin:0,v:0,ball:null};
    const ball=new THREE.Mesh(new THREE.SphereGeometry(0.025,8,6),funMat(0xffffff)); ball.position.set(tx+0.55,1.0,tz); root.add(ball); FUN.rou.ball=ball;
    funItem('rou',tx,tz+1.6,1.3,'ROLETA · aposte drax',funRouOpen); }
  // caça-níquel
  { const tx=FX(16.4), tz=FZ(17.5); const m=new THREE.Group(); m.position.set(tx,0,tz); m.rotation.y=-Math.PI/2; bx(m,0.8,1.7,0.6,funMat(0x8a1a1a),0,0.85,0); const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.3),funGlow(0xfff2c0)); sc.position.set(0,1.2,0.31); m.add(sc); bx(m,0.85,0.25,0.65,funMat(0xd4b040,{e:0x3a2a00}),0,1.82,0);
    const lever=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.5,6),funMat(0xcccccc)); lever.position.set(0.45,1.25,0); m.add(lever); const kn=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,6),funMat(0xe02020)); kn.position.set(0.45,1.5,0); m.add(kn); root.add(m); addPropBox(tx,tz,0.35,0.45);
    funItem('slot',tx-1.3,tz,1.2,'CAÇA-NÍQUEL · 10 drax por giro',funSlotSpin); }
}
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

/* ---- parque: parkour, camas elásticas, tirolesa ---- */
function buildFunPark(root){ const neon=[0x4ad2ff,0xff4a8a,0x7aff6a,0xffd24a];
  // plataformas: [x, r, w, d, topo]  (subindo em espiral no canto nordeste)
  const CX=FX(35), CZ=FZ(10);   // plataformas em espiral: [dx, dz, largura, profundidade, topo]
  const P=[[-6,-3,3,3,0.8],[-3,-5.5,2.4,2.4,1.55],[0.5,-6,2.2,2.2,2.3],[4,-4.5,2.6,2.6,3.05],[6,-1,2.2,2.2,3.8],[5,2.6,2.2,2.2,4.55],[2,5,2.6,2.6,5.3],[-1.5,4.5,2,2,6.05],[-4.5,2,2,2,6.8],[-1,-0.5,3.2,3.2,7.55]];
  P.forEach(([dx,dz,w,d,top],i)=>{ const x=CX+dx, z=CZ+dz; const m=new THREE.Mesh(new THREE.BoxGeometry(w,top,d),funMat(0x2a2236)); m.position.set(x,top/2,z); root.add(m);
    const edge=new THREE.Mesh(new THREE.BoxGeometry(w+0.04,0.06,d+0.04),funGlow(neon[i%4])); edge.position.set(x,top+0.02,z); root.add(edge);
    FUN.plats.push({x0:x-w/2,x1:x+w/2,z0:z-d/2,z1:z+d/2,top,i,cp:i===3||i===6,end:i===P.length-1}); });
  const last=FUN.plats[FUN.plats.length-1]; const bell=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.35,0.4,12,1,true),funMat(0xd4b040,{e:0x3a2a00})); bell.position.set((last.x0+last.x1)/2,last.top+1.6,(last.z0+last.z1)/2); root.add(bell); FUN.bell=bell;
  const post=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1.8,6),funMat(0x888888)); post.position.set(bell.position.x,last.top+0.9,bell.position.z); root.add(post);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(4,0.9),funSign('PARKOUR',4,0.9,'#4ad2ff')); sg.position.set(CX-9.2,2.2,CZ-3); sg.rotation.y=Math.PI/2; root.add(sg);
  funItem('park',CX-8.8,CZ-3,1.4,'PARKOUR · começar o cronômetro',funParkStart);
  // camas elásticas
  for(const [c,r] of [[28,20],[31,22],[26,24]]){ const x=FX(c), z=FZ(r); const ring=new THREE.Mesh(new THREE.TorusGeometry(1.1,0.12,8,24),funMat(0x1a6aff)); ring.rotation.x=Math.PI/2; ring.position.set(x,0.45,z); root.add(ring);
    const mat=new THREE.Mesh(new THREE.CircleGeometry(1.05,24),funMat(0x111111)); mat.rotation.x=-Math.PI/2; mat.position.set(x,0.42,z); root.add(mat); for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; const l=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.45,5),funMat(0x888888)); l.position.set(x+Math.cos(a)*1.05,0.22,z+Math.sin(a)*1.05); root.add(l); }
    FUN.tramps.push({x,z,mat}); }
  // tirolesa: do topo da torre até perto da praça
  { const A=new THREE.Vector3((last.x0+last.x1)/2,last.top+2.2,(last.z0+last.z1)/2+1.2), B=new THREE.Vector3(FX(30),2.4,FZ(30)); const cable=new THREE.Line(new THREE.BufferGeometry().setFromPoints([A,B]),new THREE.LineBasicMaterial({color:0xaaaaaa})); root.add(cable);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.14,2.6,8),funMat(0x5a4a3a)); pole.position.set(B.x,1.3,B.z); root.add(pole); addPropBox(B.x,B.z,0.2,0.2); FUN.zip={A,B};
    funItem('zip',A.x,A.z-1.2,1.2,'TIROLESA · descer até a praça',funZip); }
}
/* ---- barracas: bicho, portais, tiro ao alvo, x1, fogos, dança ---- */
function buildFunBooths(root){
  const booth=(c,r,col,txt,ry)=>{ const g=G3(FX(c),0,FZ(r),ry||0); bx(g,3,2.6,0.2,funMat(col),0,1.3,-1.2); for(const s of [-1,1]) bx(g,0.2,2.6,2.4,funMat(col),s*1.4,1.3,0); bx(g,3.2,0.2,2.8,funMat(0xf0e8e0),0,2.7,0); bx(g,3,0.9,0.4,funMat(0x2a1a0a),0,0.45,1.0);
    for(let i=0;i<7;i++) bx(g,0.46,0.1,2.9,funMat(i%2?0xf0e8e0:col),-1.38+i*0.46,2.85,0,0.18,0,0);
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(3,0.7),funSign(txt,3,0.7,'#ffd24a')); sg.position.set(0,3.35,1.3); g.add(sg); root.add(g); return g; };
  booth(8,28,0x2a8a3a,'CABINE DO BICHO',0); funItem('bicho',FX(8),FZ(28)+2.2,1.4,'CABINE DO BICHO · virar bicho (E de novo troca)',funAnimalCycle); addPropBox(FX(8),FZ(28)-1.2,1.5,0.2);
  booth(14,28,0x2a4aaa,'ARMA DE PORTAIS',0); funItem('portal',FX(14),FZ(28)+2.2,1.4,'ARMA DE PORTAIS · pegar / devolver',funPortalToggle); addPropBox(FX(14),FZ(28)-1.2,1.5,0.2);
  { const g=booth(36,26,0xaa3a1a,'TIRO AO ALVO',Math.PI); FUN.duckZ=FZ(26)-0.4; for(let i=0;i<6;i++){ const d=new THREE.Group(); const body=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,8),funMat(0xffd24a)); body.scale.set(1.3,1,1); d.add(body); const head=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),funMat(0xffd24a)); head.position.set(0.18,0.14,0); d.add(head); const bk=new THREE.Mesh(new THREE.ConeGeometry(0.04,0.12,6),funMat(0xff7a1a)); bk.rotation.z=-Math.PI/2; bk.position.set(0.3,0.13,0); d.add(bk);
      d.position.set(FX(36)-1.2+i*0.5,1.5,FUN.duckZ); root.add(d); FUN.ducks.push({g:d,i,hit:0}); }
    funItem('duck',FX(36),FZ(26)-2.4,1.4,'TIRO AO ALVO · 30 s, acerte os patos com sua arma',funDuckStart); addPropBox(FX(36),FZ(26)+1.2,1.5,0.2); }
  // portão da arena X1
  { const g=G3(FX(44),0,FZ(38),-Math.PI/2); bx(g,0.6,5,0.6,funMat(0x3a3a40),-2.4,2.5,0); bx(g,0.6,5,0.6,funMat(0x3a3a40),2.4,2.5,0); bx(g,5.4,0.8,0.6,funMat(0x3a3a40),0,5.2,0);
    const gate=new THREE.Mesh(new THREE.PlaneGeometry(4.2,4.4),new THREE.MeshBasicMaterial({color:0xff3a1a,transparent:true,opacity:0.35,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false})); gate.position.set(0,2.3,0); g.add(gate); FUN.x1gate=gate;
    const sg=new THREE.Mesh(new THREE.PlaneGeometry(4,0.9),funSign('ARENA X1',4,0.9,'#ff5a3a')); sg.position.set(0,6.1,0.32); g.add(sg); root.add(g);
    funItem('x1',FX(44)-1.6,FZ(38),1.8,'ARENA X1 · 1 contra 1 (online, 2 jogadores)',funX1); }
  // pista de dança
  { const g=G3(FX(24),0,FZ(42)); FUN.danceTiles=[]; for(let i=0;i<6;i++) for(let k=0;k<6;k++){ const t=new THREE.Mesh(new THREE.PlaneGeometry(0.95,0.95),new THREE.MeshBasicMaterial({color:0x222222})); t.rotation.x=-Math.PI/2; t.position.set(-2.5+i,0.05,-2.5+k); g.add(t); FUN.danceTiles.push(t); } root.add(g); FUN.dance={x:FX(24),z:FZ(42)}; }
  // botão de fogos
  { const g=G3(FX(20),0,FZ(36)); bx(g,0.6,1.0,0.6,funMat(0x3a3a3a),0,0.5,0); const b=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.1,16),funMat(0xe02020,{e:0x400000})); b.position.y=1.05; g.add(b); root.add(g); addPropBox(FX(20),FZ(36),0.3,0.3);
    funItem('fire',FX(20),FZ(36)+0.9,1.2,'FOGOS DE ARTIFÍCIO',funFireworks); }
}

/* ======================== QUADRO A QUADRO ======================== */
const FHINT=v9El('div','v9poolhint',''); FHINT.hidden=true; document.body.appendChild(FHINT);
function funBegin(){ G.rooms=new Set(['FN','FS']); G.power=true; banner('PARQUE 4FUN','Sem zumbis: sinuca, dardos, apostas, parkour, portais, bichos e a Arena X1','gold'); }
v9On('reset',()=>{ funAnimalSet(null,true); funPortalOff(); FUN.mode=null; FUN.run=null; });
v9On('always',dt=>{ if(CUR!=='fun'){ FHINT.hidden=true; return; } FUN.t+=dt; const t=FUN.t;
  if(FUN.wheel) FUN.wheel.rotation.z+=dt*0.12; if(FUN.wheel) for(const c of FUN.wheel.children) if(c.userData.cab) c.rotation.z=-FUN.wheel.rotation.z;
  if(FUN.carousel){ FUN.carousel.rotation.y+=dt*0.5; for(const h of FUN.carousel.children) if(h.userData.ph!=null) h.position.y=1.1+Math.sin(t*2+h.userData.ph)*0.25; }
  if(FUN.x1gate) FUN.x1gate.material.opacity=0.25+Math.sin(t*3)*0.1;
  if(FUN.danceTiles){ const beat=Math.floor(t*2.2); FUN.danceTiles.forEach((m,i)=>{ const h=((i*7+beat*3)%10)/10; m.material.color.setHSL(h,1,((i+beat)%3===0)?0.5:0.12); }); }
  for(const d of FUN.ducks){ const run=FUN.mode==='duck'; const x=FX(36)-1.4+((d.i*0.5+t*(run?1.2:0.4))%3); d.g.position.x=x; if(d.hit>0){ d.hit-=dt; d.g.rotation.x=Math.min(Math.PI/2,(0.6-d.hit)*6); } else d.g.rotation.x=0; }
  // interações
  let best=null, bd=9; if(G.state==='playing'&&!FUN.mode&&!POOL.on) for(const it of FUN.items){ const d=Math.hypot(P.pos.x-it.x,P.pos.z-it.z); if(d<it.r&&d<bd){ bd=d; best=it; } }
  FUN.near=best; FHINT.hidden=!best; if(best){ const h='<b>E</b> · '+best.label; if(FHINT._t!==h){ FHINT._t=h; FHINT.innerHTML=h; } } });
addEventListener('keydown',e=>{ if(CUR!=='fun'||G.state!=='playing'||e.repeat) return; if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if(e.code==='KeyE'){ if(FUN.mode==='dart'||FUN.mode==='cups'){ e.preventDefault(); e.stopImmediatePropagation(); funModeEnd(); return; } if(FUN.near){ e.preventDefault(); e.stopImmediatePropagation(); FUN.near.use(); } } },true);

/* ---- plataformas: dá para subir pulando, cair da beirada, e não atravessar ---- */
{ const _fa=floorAt; floorAt=function(x,z){ const b=_fa(x,z); if(CUR!=='fun'||!FUN.plats.length) return b; let top=b; for(const p of FUN.plats) if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1&&p.top>top) top=p.top; return top; }; }
{ let prev=null; v9On('frame',dt=>{ if(CUR!=='fun'){ prev=null; return; } const b=floorAt(P.pos.x,P.pos.z);
  if(prev){ const abs=prev.base+prev.y; if(b>abs+0.35){ P.pos.x=prev.x; P.pos.z=prev.z; P.vx=P.vz=0; } else if(b<prev.base-0.05){ P.y+=prev.base-b; } }
  // camas elásticas
  for(const tr of FUN.tramps){ if(Math.hypot(P.pos.x-tr.x,P.pos.z-tr.z)<1.0&&P.y<=0.02&&!P.down){ P.vy=13.5; P.y=0.05; tr.mat.scale.set(1,1,1); try{ const o=Snd.out(0.7,0,0.2,null); Snd.oscTo(o,{freq:180,freqEnd:420,dur:0.25,gain:0.25}); }catch(e){} } }
  // parkour
  if(FUN.run){ const R=FUN.run; R.t+=dt; const p=FUN.plats.find(q=>P.pos.x>=q.x0&&P.pos.x<=q.x1&&P.pos.z>=q.z0&&P.pos.z<=q.z1&&Math.abs(P.base+P.y-q.top)<0.3);
    if(p&&p.cp&&R.cp<p.i){ R.cp=p.i; banner('PONTO DE CONTROLE',`${R.t.toFixed(1)} s`,'gold'); try{ Snd.sample('slot_ding',{vol:0.6}); }catch(e){} }
    if(p&&p.end){ const rec=funRec(); const best=!rec.park||R.t<rec.park; if(best){ rec.park=+R.t.toFixed(2); saveProg(); } banner('PARKOUR COMPLETO!',`${R.t.toFixed(2)} s`+(best?' · NOVO RECORDE':' · recorde '+rec.park+' s'),'gold'); try{ Snd.sample('powerup_win',{vol:0.8}); }catch(e){} actLog(`{n} completou o parkour em ${R.t.toFixed(2)} s`); FUN.run=null; }
    else if(P.base+P.y<0.2&&R.t>1.5){ const cp=FUN.plats[R.cp]; if(cp&&R.cp>0){ P.pos.set((cp.x0+cp.x1)/2,0,(cp.z0+cp.z1)/2); P.y=0; P.vy=0; banner('CAIU!','De volta ao ponto de controle','red'); } else { FUN.run=null; banner('CAIU!','Parkour cancelado','red'); } } }
  prev={x:P.pos.x,z:P.pos.z,base:floorAt(P.pos.x,P.pos.z),y:P.y}; }); }
function funParkStart(){ const p=FUN.plats[0]; FUN.run={t:0,cp:0}; banner('PARKOUR','Suba até o sino! Os pontos de controle salvam seu progresso','gold'); P.pos.set(p.x0-1.2,0,(p.z0+p.z1)/2); }
function funZip(){ const Z=FUN.zip; if(!Z||FUN.mode) return; FUN.mode='zip'; FUN.zipT=0; try{ Snd.sample('knife_whoosh',{vol:0.6,rate:0.6}); }catch(e){} }
v9On('frame',dt=>{ if(FUN.mode!=='zip') return; const Z=FUN.zip; FUN.zipT+=dt/3.2; const k=Math.min(1,FUN.zipT), e=k*k*(3-2*k); const p=Z.A.clone().lerp(Z.B,e); P.pos.x=p.x; P.pos.z=p.z; P.y=Math.max(0,p.y-1.9-floorAt(p.x,p.z)); P.vy=0; P.vx=P.vz=0;
  if(k>=1){ FUN.mode=null; P.y=0; } });

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
function funDuckStart(){ FUN.mode='duck'; FUN.duckT=30; FUN.duckScore=0; banner('TIRO AO ALVO','30 segundos!','gold'); }
v9On('frame',dt=>{ if(FUN.mode!=='duck') return; FUN.duckT-=dt; if(FUN.duckT<=0){ FUN.mode=null; const rec=funRec(); const best=FUN.duckScore>rec.duck; if(best){ rec.duck=FUN.duckScore; saveProg(); } banner('FIM DO TIRO AO ALVO',`${FUN.duckScore} patos`+(best?' · NOVO RECORDE':' · recorde '+rec.duck),'gold'); } });
v9On('fire',()=>{ if(CUR!=='fun') return; const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d);
  if(FUN.mode==='duck') for(const k of FUN.ducks){ if(k.hit>0) continue; const p=k.g.position; const t=p.clone().sub(o).dot(d); if(t<0) continue; const q=o.clone().addScaledVector(d,t); if(q.distanceTo(p)<0.26){ k.hit=0.6; FUN.duckScore++; try{ Snd.sample('helmet_ping',{vol:0.7}); }catch(e){} hitmarker(true); break; } } });
/* cliques nos modos dardo/copos (o tiro da arma é bloqueado nesses modos) */
{ const _f=fire; fire=function(){ if(CUR==='fun'&&(FUN.mode==='dart'||FUN.mode==='cups'||FUN.anim||FUN.portal)) return; return _f.apply(this,arguments); }; }
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
  if(FUN.portal&&(e.button===0||e.button===2)){ e.stopImmediatePropagation(); funPortalShoot(e.button===0?0:1); return; } },true);
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
function funFireworks(){ if(FUN.fwT>0) return; FUN.fwT=6; for(let i=0;i<7;i++) setTimeout(()=>{ if(CUR!=='fun') return; const x=FX(24)+rand(-14,14), z=FZ(30)+rand(-14,14), y=rand(16,24); const cols=['spark','elec','green','blood']; emit(cols[i%3],x,y,z,40,9,1.2,-0.15); boomLight.position.set(x,y,z); boomLight.color.setHSL(Math.random(),1,0.6); boomLight.intensity=3;
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
function funAnimalSet(k,silent){ const prev=FUN.anim; FUN.anim=k; if(k){ FUN.animPrevVm=CINEMA.noVm; CINEMA.noVm=true; } else if(prev){ CINEMA.noVm=!!FUN.animPrevVm; }
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
const PORT={g:null,p:[null,null],cd:0};
function funPortalMesh(col){ const g=new THREE.Group(); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.06,8,32),new THREE.MeshBasicMaterial({color:col})); ring.scale.y=1.6; g.add(ring);
  const inner=new THREE.Mesh(new THREE.CircleGeometry(0.6,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:0.45,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false})); inner.scale.y=1.6; g.add(inner); g.userData.inner=inner; return g; }
function funPortalToggle(){ if(FUN.portal){ funPortalOff(); banner('ARMA DE PORTAIS','Devolvida',''); return; } FUN.portal=true; FUN.portVm=CINEMA.noVm; CINEMA.noVm=true; if(!PORT.g){ const g=new THREE.Group(); const body=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.04,0.28,10),funMat(0xe8e8e8)); body.rotation.x=Math.PI/2; g.add(body); const tip=new THREE.Mesh(new THREE.SphereGeometry(0.035,10,8),funGlow(0x4ad2ff)); tip.position.z=-0.15; g.add(tip); PORT.tip=tip; const cl=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.06,0.04),funMat(0x222222)); cl.position.set(0,-0.05,0.05); g.add(cl); g.position.set(0.17,-0.17,-0.38); vmScene.add(g); PORT.g=g; } PORT.g.visible=true; banner('ARMA DE PORTAIS','Clique esquerdo: portal azul · direito: laranja · atravesse um para sair no outro','gold'); }
function funPortalOff(){ if(!FUN.portal) return; FUN.portal=false; CINEMA.noVm=!!FUN.portVm; if(PORT.g) PORT.g.visible=false; for(let i=0;i<2;i++) if(PORT.p[i]){ MAPG.fun.remove(PORT.p[i].g); PORT.p[i]=null; } }
function funPortalShoot(i){ const o=camera.position.clone(), d=new THREE.Vector3(); camera.getWorldDirection(d); let t=40, n=null; try{ const tw=rayWall(o,d,40); if(tw<t){ t=tw; } }catch(e){}
  if(d.y<-0.05){ const tf=(floorAt(o.x,o.z)+0.02-o.y)/d.y; if(tf>0&&tf<t){ t=tf; n=new THREE.Vector3(0,1,0); } }
  if(t>=40) return; const p=o.addScaledVector(d,t-0.05); if(!n){ const fx=Math.abs(d.x)>Math.abs(d.z); n=fx?new THREE.Vector3(-Math.sign(d.x),0,0):new THREE.Vector3(0,0,-Math.sign(d.z)); p.y=Math.max(1.1,Math.min(p.y,2.2)); }
  const col=i?0xff8a1a:0x2a9aff; if(PORT.p[i]) MAPG.fun.remove(PORT.p[i].g); const g=funPortalMesh(col); g.position.copy(p).addScaledVector(n,0.03); g.lookAt(g.position.clone().add(n)); MAPG.fun.add(g); PORT.p[i]={g,p:g.position.clone(),n};
  if(PORT.tip) PORT.tip.material.color.setHex(col); try{ const s=Snd.out(0.7,0,0.3,null); Snd.oscTo(s,{type:'sine',freq:i?500:800,freqEnd:i?1200:1600,dur:0.18,gain:0.2}); }catch(e){} emit('spark',p.x,p.y,p.z,14,2,0.4,0); }
v9On('frame',dt=>{ PORT.cd=Math.max(0,PORT.cd-dt); for(let i=0;i<2;i++){ const q=PORT.p[i]; if(q){ q.g.rotation.z+=dt*2; q.g.userData.inner.material.opacity=0.35+Math.sin(G.t*6+i)*0.12; } }
  if(CUR!=='fun'||PORT.cd>0||!PORT.p[0]||!PORT.p[1]) return; const eye=new THREE.Vector3(P.pos.x,floorAt(P.pos.x,P.pos.z)+P.y+0.9,P.pos.z);
  for(let i=0;i<2;i++){ const a=PORT.p[i], b=PORT.p[1-i]; if(eye.distanceTo(a.p)<(a.n.y>0.5?0.75:0.8)){ const out=b.p.clone().addScaledVector(b.n,b.n.y>0.5?0.2:0.9); P.pos.x=out.x; P.pos.z=out.z;
      if(b.n.y>0.5){ P.y=Math.max(0,out.y-floorAt(out.x,out.z)); P.vy=6; } else { P.yaw=Math.atan2(-b.n.x,-b.n.z)+Math.PI; P.y=Math.max(0,b.p.y-1.3-floorAt(out.x,out.z)); }
      PORT.cd=0.6; try{ Snd.sample('timewarp',{vol:0.6,rate:1.8}); }catch(e){} flashScreen&&flashScreen(); break; } } });

/* ---- mapa na seleção: entra o 4FUN, sai o X1 ---- */
try{ const x=document.querySelector('.mapc.x1card'); if(x){ const b=document.createElement('button'); b.className='mapc'; b.dataset.map='fun'; b.type='button'; b.innerHTML='<span class="mt">Parque 4FUN · diversão</span><span class="md">Sem zumbis. Sinuca, dardos, copos, roleta e caça-níquel com drax de verdade, parkour, tirolesa, cabine do bicho, arma de portais e a Arena X1.</span>';
  x.parentNode.insertBefore(b,x); x.style.display='none'; b.addEventListener('pointerenter',()=>mapThumb('fun')); b.addEventListener('focus',()=>mapThumb('fun')); b.addEventListener('click',()=>playChoice('fun')); } }catch(e){}
try{ MPI.fun={d:1,t:'Diversão',img:'img/map_bunker.jpg',sec:'O portão vermelho leva para a Arena X1. A roleta paga 36× no número certo.',f:['Salão de jogos com apostas','Parkour, tirolesa e camas elásticas','Bichos e arma de portais'],s:[1,5,5]}; }catch(e){}
CMDS.parque={d:'parque · vai para o Parque 4FUN',f:()=>{ setMap('fun'); P.pos.set(MAPS.fun.start[0],0,MAPS.fun.start[1]); funBegin(); cprint('Parque 4FUN'); }};
