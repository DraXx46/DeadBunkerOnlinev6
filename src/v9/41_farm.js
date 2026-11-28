/* ================= v9 · FAZENDA: CELEIRO DE VERDADE E PÁTIO LIMPO =================
   O celeiro foi refeito do zero: baias com portões e nomes dos cavalos, cochos e baldes, pilha de fardos,
   silos de grão, carroça, sala de arreios debaixo do jirau (selas, rédeas, caixas de ração), bancada com
   painel de ferramentas, pilares e tesouras de madeira, lampiões pendurados, palha pelo chão, correntes,
   feixes de luz pelas frestas e poeira no ar. O corredor do meio fica livre do portão até o fundo.
   No pátio, os fardos e pilhas de suprimento que ficavam no meio da estrada saíram (ver patch p42). */
function fbMats(){ if(fbMats.m) return fbMats.m; fmat();
  const straw=tex(256,256,(g,w,h)=>{ g.clearRect(0,0,w,h); for(let i=0;i<900;i++){ const x=Math.random()*w, y=Math.random()*h, a=Math.random()*Math.PI, l=6+Math.random()*16;
      g.strokeStyle=`hsla(${40+Math.random()*12},${45+Math.random()*25}%,${38+Math.random()*25}%,${0.5+Math.random()*0.5})`; g.lineWidth=1+Math.random()*1.4; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l); g.stroke(); } });
  const peg=tex(256,128,(g,w,h)=>{ g.fillStyle='#4a3a26'; g.fillRect(0,0,w,h); g.fillStyle='#2a1e12'; for(let x=8;x<w;x+=12) for(let y=8;y<h;y+=12){ g.beginPath(); g.arc(x,y,1.6,0,7); g.fill(); }
      g.fillStyle='#1a1a1a'; g.strokeStyle='#888'; const tool=(x,y,ww,hh)=>{ g.fillRect(x,y,ww,hh); }; tool(20,20,8,70); tool(14,16,20,10); tool(50,30,6,60); g.beginPath(); g.arc(53,30,10,Math.PI,0); g.fill(); tool(80,24,40,8); tool(116,18,8,22); tool(140,20,6,70); tool(136,82,14,10);
      for(let i=0;i<5;i++) tool(170+i*14,22,5,40+i*8); g.beginPath(); g.arc(230,60,18,0,7); g.lineWidth=5; g.strokeStyle='#5a5a5a'; g.stroke(); });
  const plate=n=>tex(128,40,(g,w,h)=>{ g.fillStyle='#d8c8a0'; g.fillRect(0,0,w,h); g.strokeStyle='#3a2a1a'; g.lineWidth=3; g.strokeRect(2,2,w-4,h-4); g.fillStyle='#2a1a0e'; g.font='bold 22px Georgia,serif'; g.textAlign='center'; g.fillText(n,w/2,28); });
  fbMats.m={ straw:new THREE.MeshLambertMaterial({map:straw,transparent:true,depthWrite:false,alphaTest:0.05}), hay:FM.hay, wood:M.furn, dark:v9Mat('fbDark',{color:0x2a1c10,shininess:8}),
    iron:M.iron||v9Mat('fbIron',{color:0x3a3a3a,shininess:30}), galv:v9Mat('fbGalv',{color:0x8a9094,shininess:80,specular:0x667077}), rust:M.rust||v9Mat('fbRust',{color:0x6a3418}),
    leather:v9Mat('fbLeather',{color:0x6a3a1a,shininess:30}), leatherD:v9Mat('fbLeatherD',{color:0x3a1e0e,shininess:20}), rope:v9Mat('fbRope',{color:0xa08a5a,shininess:4}),
    water:v9Mat('fbWater',{color:0x24343a,shininess:120,specular:0x557788}), sack:FARMMAT.sack||v9Mat('fbSack',{color:0x9a8a64}),
    peg:new THREE.MeshLambertMaterial({map:peg}), glow:new THREE.MeshBasicMaterial({color:0xffc070}), lampGlass:new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0.85}),
    shaft:new THREE.MeshBasicMaterial({color:0xffe2b0,transparent:true,opacity:0.07,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}), plate };
  return fbMats.m; }
function farmBarn2(){ const T=fbMats(); const X=x=>x*S, ZR=r=>FR(r);   // X: borda da célula; FR: centro da linha
  const g=G3();
  /* --- estrutura: pilares nas bordas do corredor, vigas e tesouras --- */
  for(const r of [66.5,69.5,72.5]){ for(const x of [42.8,52.4]){ bx(g,0.26,4.8,0.26,T.wood,x,2.4,ZR(r)); bx(g,0.9,0.14,0.14,T.wood,x,4.3,ZR(r),0,0,0.6); addPropBox(x,ZR(r),0.16,0.16); }
    if(r<70){ bx(g,22.4,0.24,0.24,T.wood,41.2,4.8,ZR(r)); bx(g,13.6,0.24,0.24,T.wood,59.2,5.4,ZR(r)); }   // sobre o jirau a viga sobe: dava com a cabeça nela
    else bx(g,36,0.24,0.24,T.wood,48,4.8,ZR(r)); for(const s of [-1,1]) bx(g,0.18,3.2,0.18,T.wood,48+s*9,6.0,ZR(r),0,0,s*0.95); bx(g,0.18,1.6,0.18,T.wood,48,5.6,ZR(r)); }
  bx(g,0.2,0.2,22,T.wood,42.8,4.6,ZR(70)); bx(g,0.2,0.2,22,T.wood,52.4,4.6,ZR(70));
  /* --- baias do lado oeste: as duas janelas ficam cada uma no meio de uma baia aberta (sem portão, sem cocho),
         então dá para chegar nelas e os zumbis entram sem bater em divisória. As outras 6 baias têm nome, cocho e balde. --- */
  const WZ=[ZR(68),ZR(72)], BND=[244.1,246.9,WZ[0]-1.3,WZ[0]+1.3,255.0,WZ[1]-1.3,WZ[1]+1.3,263.15,265.9].map((v,k)=>k===0||k===8?v:v);
  const names=['ESTRELA','TROVÃO',null,'PIPOCA','BOLINHA',null,'CANELA','FAÍSCA'], openG=[false,true,true,false,true,true,true,false];   // a baia da granada (parede oeste) fica aberta
  for(const z of BND){ bx(g,2.8,1.5,0.1,T.wood,31.4,0.75,z); bx(g,2.8,0.12,0.16,T.dark,31.4,1.55,z); bx(g,0.18,2.4,0.18,T.dark,32.8,1.2,z); addPropBox(31.4,z,1.4,0.08); }
  bx(g,0.14,0.14,BND[8]-BND[0],T.dark,32.8,2.33,(BND[0]+BND[8])/2);   // travessa no alto dos postes: as plaquinhas ficam penduradas nela
  for(let i=0;i<8;i++){ const z0=BND[i], z1=BND[i+1], zc=(z0+z1)/2, w=z1-z0-0.25, win=names[i]===null, open=openG[i];
    if(!win){ const gate=G3(32.8,0,z0+0.12,open?-1.25:0); for(let k=0;k<4;k++) bx(gate,0.06,0.08,w*0.95,T.wood,0,0.3+k*0.3,w*0.475); bx(gate,0.08,1.2,0.08,T.dark,0,0.6,w*0.95); bx(gate,0.08,1.2,0.08,T.dark,0,0.6,0.02); bx(gate,0.06,1.1,0.06,T.wood,0,0.62,w*0.47,0.9,0,0); g.add(gate);
      if(!open) addPropBox(32.85,zc,0.08,w/2);
      // cocho, feno no chão, balde, plaquinha pendurada na travessa
      bx(g,0.5,0.4,1.2,T.wood,30.4,0.2,zc); bx(g,0.4,0.08,1.1,T.hay,30.4,0.44,zc);
      const pile=new THREE.Mesh(new THREE.SphereGeometry(0.7,10,6,0,6.3,0,1.2),T.hay); pile.scale.set(1,0.35,1.2); pile.position.set(31.3,0,zc+rand(-.3,.3)); g.add(pile);
      cy(g,0.17,0.13,0.3,T.galv,32.2,0.15,zc+w*0.32,0,0,0,10); cy(g,0.15,0.15,0.01,T.water,32.2,0.27,zc+w*0.32,0,0,0,10);
      const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.16),new THREE.MeshLambertMaterial({map:T.plate(names[i])})); pl.position.set(32.9,2.15,zc); pl.rotation.y=Math.PI/2; g.add(pl);
      for(const s2 of [-0.2,0.2]) cy(g,0.004,0.004,0.1,T.iron,32.9,2.24,zc+s2,0,0,0,3); }   // arames da plaquinha
    for(let k=0;k<(win?2:3);k++) floorDecal(rand(30.6,32.6),zc+rand(-w/2,w/2),rand(0.9,1.5),T.straw,rand(0,6)); }
  // ferraduras pregadas nos postes, de ponta para cima (sorte)
  for(const z of BND.slice(1,8)){ const hs=new THREE.Mesh(new THREE.TorusGeometry(0.07,0.018,5,10,Math.PI*1.4),T.iron); hs.position.set(32.91,1.9,z); hs.rotation.set(0,Math.PI/2,Math.PI*0.8); g.add(hs); }
  // sela e manta em cima de um portão fechado
  { const zc=(BND[3]+BND[4])/2; const s=G3(32.8,1.36,zc,Math.PI/2); sp(s,0.32,T.leather,0,0,0,1.2,0.45,0.9); bx(s,0.7,0.02,0.5,v9Mat('fbBlanket',{color:0x6a1a1a}),0,-0.12,0,0,0,0.2); g.add(s); }
  /* --- canto noroeste: silos de grão e pilha de sacos --- */
  for(const [x,z] of [[40.2,ZR(65.2)],[42.5,ZR(65.2)]]){ /* longe do giz da MP40 na parede norte (os silos tapavam a compra) */ cy(g,0.95,0.95,2.6,T.galv,x,1.3,z,0,0,0,16); const cone=new THREE.Mesh(new THREE.ConeGeometry(0.98,0.5,16),T.galv); cone.position.set(x,2.85,z); g.add(cone);
    for(let k=0;k<4;k++) cy(g,0.965,0.965,0.03,T.iron,x,0.4+k*0.6,z,0,0,0,16); bx(g,0.25,0.25,0.12,T.rust,x,0.3,z+0.92); addPropBox(x,z,0.95,0.95); }
  { const sg=G3(37.5,0,ZR(65.3)); for(let i=0;i<9;i++){ const m=sp(sg,0.3,T.sack,(i%3)*0.55-0.55,0.22+Math.floor(i/3)*0.36,rand(-.08,.08),1.15,0.62,0.85); m.rotation.y=rand(-.3,.3); } g.add(sg); addPropBox(37.5,ZR(65.3),0.9,0.45); }
  /* --- pilha grande de fardos (escalonada) entre as baias e o corredor --- */
  { const hx=37.4, hz=ZR(68.9); for(let lay=0;lay<3;lay++){ const nx=3-lay, nz=3-Math.min(lay,1); for(let a=0;a<nx;a++) for(let b=0;b<nz;b++){ const m=bx(g,1.1,0.55,0.6,T.hay,hx+(a-(nx-1)/2)*1.12+rand(-.04,.04),0.28+lay*0.56,hz+(b-(nz-1)/2)*0.62+rand(-.04,.04),0,rand(-.04,.04),0); } }
    addPropBox(hx,hz,1.75,1.0); cellProp(18,fz(69),0.9,0.9);
    for(let k=0;k<6;k++) floorDecal(hx+rand(-2.5,2.5),hz+rand(-1.8,1.8),rand(1,1.8),T.straw,rand(0,6));
    // forcado espetado no fardo de cima
    const pf=G3(hx+0.3,1.7,hz,0); cy(pf,0.02,0.02,1.6,T.wood,0,0.5,0,0.25,0,0.1,5); for(let k=0;k<3;k++) cy(pf,0.008,0.008,0.32,T.iron,-0.05+k*0.05,-0.38,0,0.25,0,0.1,4); g.add(pf); }
  /* --- carroça velha --- */
  { const c=G3(38.4,0,ZR(72.4),0.35); bx(c,2.2,0.12,1.3,T.wood,0,0.75,0); for(const s of [-1,1]){ bx(c,2.2,0.4,0.06,T.wood,0,1.0,s*0.62); } bx(c,0.06,0.4,1.3,T.wood,1.08,1.0,0);
    for(const s of [-1,1]){ const wh=new THREE.Mesh(new THREE.TorusGeometry(0.5,0.05,6,16),T.dark); wh.position.set(-0.4,0.55,s*0.72); c.add(wh); for(let k=0;k<6;k++) bx(c,0.04,0.95,0.04,T.wood,-0.4,0.55,s*0.72,0,0,k*Math.PI/6); }
    bx(c,2.6,0.07,0.07,T.wood,2.1,0.6,0.25,0,0,0.22); bx(c,2.6,0.07,0.07,T.wood,2.1,0.6,-0.25,0,0,0.22); for(let i=0;i<3;i++) bx(c,0.9,0.45,0.5,T.hay,rand(-.5,.4),1.05,rand(-.25,.25),0,rand(-.3,.3),0);
    g.add(c); addPropBox(38.4,ZR(72.4),1.4,1.0); }
  /* (a sala de arreios ficava debaixo do jirau, que é maciço: não aparecia e as caixas de colisão dela travavam a passagem lá em cima — saiu) */
  /* --- bancada com painel de ferramentas (sudeste) --- */
  { const bz=ZR(74.55); const pb=new THREE.Mesh(new THREE.PlaneGeometry(3.2,1.6),T.peg); pb.position.set(54,1.9,ZR(75)+0.95); pb.rotation.y=Math.PI; g.add(pb);
    bx(g,3.4,0.08,0.75,T.wood,54,0.79,bz); for(const sx of [-1.6,1.6]) for(const sz of [-0.3,0.3]) bx(g,0.08,0.76,0.08,T.dark,54+sx,0.38,bz+sz); bx(g,3.2,0.04,0.6,T.wood,54,0.22,bz);
    addPropBox(54,bz,1.72,0.4);
    bx(g,0.2,0.12,0.2,T.iron,52.7,0.89,bz-0.1); for(let i=0;i<4;i++) cy(g,0.07,0.07,0.22,i%2?T.rust:T.galv,54.9+i*0.18,0.94,bz+0.15,0,0,0,8); }
  tireStack(60.6,ZR(74.6)); addPropBox(60.6,ZR(74.6),0.5,0.5); milkCans(53.4,ZR(72.9)); addPropBox(53.4,ZR(72.9),0.4,0.4);
  { const wb=G3(57.8,0,ZR(71.3),0.8); bx(wb,0.9,0.3,0.6,T.galv,0,0.5,0,-0.1,0,0); const wh=new THREE.Mesh(new THREE.TorusGeometry(0.18,0.05,6,12),T.dark); wh.position.set(0.55,0.2,0); wh.rotation.y=Math.PI/2; wb.add(wh);
    for(const s of [-1,1]) bx(wb,1.3,0.04,0.04,T.wood,-0.3,0.45,s*0.24,0,0,0.25); g.add(wb); addPropBox(57.8,ZR(71.3),0.6,0.45); }
  /* --- correntes, roldana, lampiões pendurados nas vigas --- */
  for(const [x,r,l] of [[45.2,66.5,2.2],[45.8,66.5,1.6],[50.6,72.5,1.9]]){ /* presas nas vigas */ for(let k=0;k<Math.round(l/0.09);k++){ const lk=new THREE.Mesh(new THREE.TorusGeometry(0.035,0.01,4,8),T.iron); lk.position.set(x,4.7-k*0.085,ZR(r)); lk.rotation.y=k%2?Math.PI/2:0; g.add(lk); } }
  const lamps=[[47.6,69.5],[47.6,72.5],[36,69.5],[36,72.5]];   // pendurados nas vigas (o que ficava na beira do jirau batia na altura do joelho)
  for(const [x,r] of lamps){ const z=ZR(r); cy(g,0.008,0.008,1.2,T.iron,x,4.1,z,0,0,0,4); cy(g,0.09,0.12,0.06,T.iron,x,3.45,z,0,0,0,8); const gl=cy(g,0.08,0.08,0.22,T.lampGlass,x,3.3,z,0,0,0,8); cy(g,0.11,0.11,0.04,T.iron,x,3.17,z,0,0,0,8);
    const f=new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6),T.glow); f.position.set(x,3.3,z); g.add(f); }
  /* --- palha espalhada pelo chão (mais nas laterais, menos no corredor) --- */
  for(let i=0;i<46;i++){ const side=Math.random(); const x=side<0.42?rand(33,42):side<0.84?rand(53.5,65.5):rand(43,52); const z=rand(ZR(65)-0.8,ZR(75)+0.8); floorDecal(x,z,rand(0.8,1.8),T.straw,rand(0,6)); }
  bake(g);
  /* --- feixes de luz pelas frestas e poeira no ar (não assados: animados) --- */
  const fx=new THREE.Group(); fx.name='barnFx';
  for(const [x,r,ry] of [[31,66.2,0.5],[31,70.8,0.4],[31,73.9,0.6]]){ const p=new THREE.Mesh(new THREE.PlaneGeometry(0.5,6.5),T.shaft); p.position.set(x+(x<40?2.2:-2.2),2.6,ZR(r)); p.rotation.set(0,ry,x<40?-0.6:0.6); fx.add(p); }
  const N=420, pos=new Float32Array(N*3); for(let i=0;i<N;i++){ pos[i*3]=rand(31,65); pos[i*3+1]=rand(0.2,4.5); pos[i*3+2]=rand(ZR(65)-0.8,ZR(75)+0.8); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const dust=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffe6b8,size:0.03,transparent:true,opacity:0.55,depthWrite:false})); fx.add(dust); fx.userData.dust=dust;
  (MAPG.farm||scene).add(fx); FB2.fx=fx;
  const L=lightTake(0xffb05a,1.6,24,1.5); if(L){ L.position.set(47.6,3.2,ZR(70)); FB2.light=L; } }
const FB2={fx:null,light:null};
v9On('always',dt=>{ const fx=FB2.fx; if(!fx||CUR!=='farm') return; const d=fx.userData.dust; if(!d) return; const a=d.geometry.attributes.position.array, t=G.t||0;
  for(let i=0;i<a.length;i+=3){ a[i]+=Math.sin(t*0.3+i)*0.0015; a[i+1]+=Math.sin(t*0.5+i*0.7)*0.0012-0.0004; if(a[i+1]<0.15) a[i+1]=4.5; } d.geometry.attributes.position.needsUpdate=true;
  if(FB2.light) FB2.light.intensity=1.5+Math.sin(t*7.3)*0.05+Math.sin(t*13.1)*0.04; });
