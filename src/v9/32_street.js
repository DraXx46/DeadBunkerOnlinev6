/* ================= v9 · CIDADE: RUA E IMERSÃO =================
   Asfalto refeito (sem as placas sobrepostas que piscavam), sem a estátua no meio, faixas e meio-fio, calçada de pedra
   portuguesa, bandeiras do Brasil balançando, bandeirinhas verde e amarelo cruzando a rua, orelhões, banca de jornal,
   ponto de ônibus, postes com fiação embolada, semáforos piscando, pichações e corpos cobertos. Por dentro, cada loja
   ganha entulho, vidro quebrado, sangue, papéis, móveis tombados e pichações; o mercado tem um acampamento de sobrevivente.
   Quando a energia da delegacia é ligada, as lojas acendem as lâmpadas fluorescentes. */
const ST={flags:[],bunting:[],lights:[],tubes:null,on:false,t:0,blink:[],wires:[]};
const stM=(k,o)=>v9Mat('st_'+k,o);
function stOffset(m,f){ m.polygonOffset=true; m.polygonOffsetFactor=f; m.polygonOffsetUnits=f; return m; }
/* ---- texturas ---- */
function stAsphalt(w,h,mark){ return tex(w,h,(c,W,H)=>{ c.fillStyle='#26262a'; c.fillRect(0,0,W,H);
  const id=c.getImageData(0,0,W,H), d=id.data; for(let i=0;i<d.length;i+=4){ const n=(Math.random()*26-13)|0; d[i]+=n; d[i+1]+=n; d[i+2]+=n; } c.putImageData(id,0,0);
  for(let i=0;i<10;i++){ c.fillStyle=`rgba(${Math.random()<0.5?'45,45,48':'18,18,20'},.55)`; c.fillRect(Math.random()*W,Math.random()*H,30+Math.random()*120,20+Math.random()*90); }   // remendos
  c.strokeStyle='rgba(8,8,9,.85)'; for(let k=0;k<14;k++){ c.lineWidth=1+Math.random()*2; c.beginPath(); let x=Math.random()*W, y=Math.random()*H; c.moveTo(x,y); for(let s=0;s<8;s++){ x+=Math.random()*40-20; y+=Math.random()*40-20; c.lineTo(x,y); } c.stroke(); }   // rachaduras
  for(let i=0;i<5;i++){ const g=c.createRadialGradient(0,0,0,0,0,40); g.addColorStop(0,'rgba(5,5,6,.5)'); g.addColorStop(1,'rgba(5,5,6,0)'); c.save(); c.translate(Math.random()*W,Math.random()*H); c.scale(1,0.6); c.fillStyle=g; c.beginPath(); c.arc(0,0,40,0,6.28); c.fill(); c.restore(); }   // óleo
  if(mark) mark(c,W,H); }); }
function stRoadTex(){ return stAsphalt(512,614,(c,W,H)=>{ const px=W/20; // 20 m de largura
  const paint=(a)=>`rgba(214,${a?'176,40':'214,206'},${0.62+Math.random()*0.2})`;
  c.fillStyle=paint(1); c.fillRect(W/2-0.22*px,0,0.12*px,H); c.fillRect(W/2+0.1*px,0,0.12*px,H);           // faixa dupla amarela
  c.fillStyle=paint(0); for(const lx of [-5,5]) for(let y=0;y<H;y+=H/4) c.fillRect(W/2+lx*px-0.07*px,y,0.14*px,H/8);   // tracejadas
  for(const lx of [-9.4,9.4]) c.fillRect(W/2+lx*px-0.08*px,0,0.16*px,H);                                     // bordas
  c.globalCompositeOperation='destination-out'; for(let i=0;i<260;i++){ c.fillStyle=`rgba(0,0,0,${Math.random()*0.7})`; c.fillRect(Math.random()*W,Math.random()*H,Math.random()*6,Math.random()*4); } c.globalCompositeOperation='source-over';
  // tinta gasta: devolve o asfalto por baixo
  c.globalCompositeOperation='destination-over'; c.fillStyle='#26262a'; c.fillRect(0,0,W,H); c.globalCompositeOperation='source-over'; }); }
function stZebraTex(){ return stAsphalt(512,154,(c,W,H)=>{ c.fillStyle='rgba(214,214,206,.7)'; for(let x=W*0.06;x<W*0.94;x+=W/14) c.fillRect(x,H*0.12,W/28,H*0.76); }); }
function stPortuguese(){ return tex(256,256,(c,W,H)=>{ c.fillStyle='#bcb6aa'; c.fillRect(0,0,W,H); c.fillStyle='#2a2826';
  for(let y=-64;y<H+64;y+=64){ c.beginPath(); for(let x=0;x<=W;x+=4) c.lineTo(x,y+Math.sin(x/W*Math.PI*2)*16); for(let x=W;x>=0;x-=4) c.lineTo(x,y+30+Math.sin(x/W*Math.PI*2)*16); c.closePath(); c.fill(); }
  c.strokeStyle='rgba(0,0,0,.22)'; for(let y=0;y<H;y+=8) for(let x=(y/8%2)*4;x<W;x+=8) c.strokeRect(x,y,8,8); clGrime(c,W,H,0.3); }); }
let ST_FLAGTEX=null; function stBrazilFlag(){ return ST_FLAGTEX||(ST_FLAGTEX=stBrazilFlag0()); }
function stBrazilFlag0(){ return tex(400,280,(c,W,H)=>{ c.fillStyle='#009c3b'; c.fillRect(0,0,W,H); c.fillStyle='#ffdf00'; c.beginPath(); c.moveTo(W*0.085,H/2); c.lineTo(W/2,H*0.12); c.lineTo(W*0.915,H/2); c.lineTo(W/2,H*0.88); c.closePath(); c.fill();
  c.fillStyle='#002776'; c.beginPath(); c.arc(W/2,H/2,H*0.25,0,6.28); c.fill(); c.save(); c.beginPath(); c.arc(W/2,H/2,H*0.25,0,6.28); c.clip(); c.strokeStyle='#fff'; c.lineWidth=H*0.045; c.beginPath(); c.arc(W*0.43,H*1.05,H*0.6,-1.95,-0.95); c.stroke();
  c.fillStyle='#009c3b'; c.font=`bold ${H*0.03}px sans-serif`; c.textAlign='center'; c.save(); c.translate(W/2,H/2); c.rotate(-0.13); c.fillText('ORDEM E PROGRESSO',0,-H*0.01); c.restore();
  c.fillStyle='#fff'; for(let i=0;i<22;i++){ c.beginPath(); c.arc(W/2+(Math.random()-0.5)*H*0.38,H/2+H*0.03+Math.random()*H*0.17,1+Math.random()*1.6,0,6.28); c.fill(); } c.restore();
  const g=c.createLinearGradient(0,0,W,0); g.addColorStop(0,'rgba(0,0,0,.25)'); g.addColorStop(0.5,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.3)'); c.fillStyle=g; c.fillRect(0,0,W,H); clGrime(c,W,H,0.12); }); }
const ST_GRAF=['SOCORRO','NÃO TEM CURA','FIM DOS TEMPOS','DEUS PERDOE','ELES OUVEM','FUJAM','SEM SAÍDA','2 VIVOS AQUI','NÃO ENTRE','A CULPA É DO LAB'];
const ST_GCACHE={}; function stGraffiti(txt,col){ const k=txt+col; return ST_GCACHE[k]||(ST_GCACHE[k]=stGraffiti0(txt,col)); }
function stGraffiti0(txt,col){ return tex(512,160,(c,W,H)=>{ c.clearRect(0,0,W,H); c.font='bold 92px "Permanent Marker", Impact, sans-serif'; c.textAlign='center'; c.textBaseline='middle'; let sz=92; while(c.measureText(txt).width>W*0.92&&sz>30){ sz-=6; c.font=`bold ${sz}px Impact, sans-serif`; }
  c.save(); c.translate(W/2,H/2); c.rotate((Math.random()-0.5)*0.12); c.fillStyle=col; c.globalAlpha=0.85; c.fillText(txt,0,0); for(let i=0;i<8;i++){ c.fillRect(-W*0.4+Math.random()*W*0.8,sz*0.3,3,10+Math.random()*30); } c.restore(); }); }
/* ---- limpeza da montagem antiga ---- */
function stCleanup(){ const root=MAPG.city, kill=[]; const roadX0=cx(23.5)-10.5, roadX1=cx(23.5)+10.5;
  for(const o of root.children){
    if(o.isMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.material===((TZG.M||{}).road)) kill.push(o);                       // asfalto e transversais antigos
    else if(o.isMesh&&o.geometry&&o.geometry.type==='CircleGeometry'&&o.geometry.parameters.radius===9) kill.push(o);                 // praça
    else if(o.isMesh&&o.geometry&&o.geometry.type==='RingGeometry'&&o.geometry.parameters.outerRadius>3) kill.push(o);                 // cratera
    else if(o.isGroup&&o.children.some(c=>c.material===V9M.cityBronze)) kill.push(o);                                                 // estátua
    else if(o.isMesh&&o.geometry&&o.geometry.type==='DodecahedronGeometry'&&o.position.x>roadX0&&o.position.x<roadX1&&Math.random()<0.7) kill.push(o);   // entulho no meio da rua
  }
  for(const o of kill){ root.remove(o); }
  return kill.length; }
/* ---- rua nova ---- */
function stRoad(){ const root=MAPG.city, z0=CZ0*S, z1=(CZ1+1)*S, len=z1-z0, zc=(z0+z1)/2, X=cx(23.5);
  const rt=stRoadTex(); rt.wrapS=rt.wrapT=THREE.RepeatWrapping; rt.repeat.set(1,len/24); rt.anisotropy=4;
  const rm=stOffset(new THREE.MeshLambertMaterial({map:rt}),-1); const rd=new THREE.Mesh(new THREE.PlaneGeometry(20,len),rm); rd.rotation.x=-Math.PI/2; rd.position.set(X,0.02,zc); root.add(rd);
  // transversais (sem a faixa central) com faixa de pedestre na boca da avenida
  const ct=stAsphalt(512,154); ct.wrapS=ct.wrapT=THREE.RepeatWrapping; ct.repeat.set(MW*S/20,1); const cm=stOffset(new THREE.MeshLambertMaterial({map:ct}),-2);
  const zt=stZebraTex(); const zm=stOffset(new THREE.MeshLambertMaterial({map:zt,transparent:true}),-3);
  for(const r of [16,40]){ const z=cx(czr(r)); for(const [a,b] of [[0,X-10],[X+10,MW*S]]){ const w=b-a; if(w<1) continue; const t=new THREE.Mesh(new THREE.PlaneGeometry(w,6),cm); t.rotation.x=-Math.PI/2; t.position.set((a+b)/2,0.021,z); root.add(t); }
    for(const sx of [-1,1]){ const zb=new THREE.Mesh(new THREE.PlaneGeometry(6,3.2),zm); zb.rotation.set(-Math.PI/2,0,Math.PI/2); zb.position.set(X+sx*7.6,0.024,z); root.add(zb); } }
  // bueiros e buracos
  const mh=stM('manhole',{color:0x2a2a28,shininess:30}); for(let i=0;i<6;i++){ const m=new THREE.Mesh(new THREE.CircleGeometry(0.45,18),stOffset(mh.clone(),-4)); m.rotation.x=-Math.PI/2; m.position.set(X+rand(-7,7),0.026,rand(z0+6,z1-6)); root.add(m); }
  const ph=stOffset(new THREE.MeshLambertMaterial({color:0x08080a,transparent:true,opacity:0.85}),-5); for(let i=0;i<9;i++){ const p=new THREE.Mesh(new THREE.CircleGeometry(rand(0.3,0.8),10),ph); p.scale.set(1,rand(0.5,1),1); p.rotation.set(-Math.PI/2,0,rand(0,6)); p.position.set(X+rand(-8,8),0.028,rand(z0+4,z1-4)); root.add(p); }
  // meio-fio pintado
  const g=new THREE.Group(); const curbA=stM('curb',{color:0x8a8478}), curbY=stM('curbY',{color:0xc8a020}), curbK=stM('curbK',{color:0x1a1a18});
  for(const sx of [-10.1,10.1]) for(let z=z0+1;z<z1-1;z+=1){ const zz=z+0.5; if([16,40].some(r=>Math.abs(zz-cx(czr(r)))<3.2)) continue; tzBx(g,0.2,0.16,1.0,Math.abs(zz-cx(czr(28)))<10?((Math.floor(z)%2)?curbY:curbK):curbA,X+sx,0.08,zz); }
  bake(g);
  // calçada de pedra portuguesa (as calçadas antigas ganham a textura)
  const pt=stPortuguese(); pt.wrapS=pt.wrapT=THREE.RepeatWrapping; pt.repeat.set(1,len/2.4); const pm=new THREE.MeshLambertMaterial({map:pt});
  for(const o of MAPG.city.children) if(o.isMesh&&o.geometry&&o.geometry.type==='BoxGeometry'&&Math.abs(o.geometry.parameters.width-2.4)<0.01&&o.geometry.parameters.height<0.2) o.material=[pm,pm,pm,pm,pm,pm].map(()=>pm)[0]; }
/* ---- bandeiras e bandeirinhas ---- */
function stFlagPole(x,z,h,tw){ const root=MAPG.city, g=new THREE.Group(); g.position.set(x,0,z); root.add(g);
  const pole=stM('flagPole',{color:0xc0c4c6,shininess:80}); const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.08,h,8),pole); p.position.y=h/2; g.add(p); const top=new THREE.Mesh(new THREE.SphereGeometry(0.09,8,6),stM('poleTop',{color:0xc9a24a,shininess:90})); top.position.y=h+0.05; g.add(top);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(0.35,0.42,0.4,10),stM('poleBase',{color:0x6a6460})); base.position.y=0.2; g.add(base);
  const geo=new THREE.PlaneGeometry(2.1,1.47,14,6); const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:tw||stBrazilFlag(),side:THREE.DoubleSide})); m.position.set(1.08,h-0.85,0); g.add(m);
  ST.flags.push({m,base:geo.attributes.position.array.slice(),ph:Math.random()*6,amp:1}); return g; }
function stHangFlag(x,z,ry,w,h){ const geo=new THREE.PlaneGeometry(w,h,10,8); const m=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({map:stBrazilFlag(),side:THREE.DoubleSide})); m.position.set(x,0,z); m.rotation.y=ry; MAPG.city.add(m); ST.flags.push({m,base:geo.attributes.position.array.slice(),ph:Math.random()*6,amp:0.35,hang:true,y0:0}); return m; }
function stBunting(x0,z0,x1,z1,y){ const n=Math.max(8,Math.round(Math.hypot(x1-x0,z1-z0)/0.45)); const cols=[[0,0.63,0.25],[0.94,0.82,0],[0.04,0.23,0.6]];
  const dx=x1-x0, dz=z1-z0, L=Math.hypot(dx,dz), ux=dx/L, uz=dz/L; const pos=new Float32Array((n+1)*9), col=new Float32Array((n+1)*9), anchors=[];
  for(let i=0;i<=n;i++){ const t=i/n; const ax=x0+dx*t, ay=y-Math.sin(t*Math.PI)*0.9, az=z0+dz*t; anchors.push([ax,ay,az]); const c=cols[i%3]; for(let k=0;k<3;k++) col.set(c,i*9+k*3); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.Mesh(geo,stM('buntV',{vertexColors:true,side:THREE.DoubleSide,emissive:0x111111})); m.frustumCulled=false; MAPG.city.add(m);
  const bunt={geo,anchors,ux,uz,ph:Math.random()*6}; stBuntPose(bunt,0); ST.bunting.push(bunt); ST.wires.push(anchors.map(a=>[a[0],a[1]+0.01,a[2]])); }
function stBuntPose(b,t){ const p=b.geo.attributes.position.array; for(let i=0;i<b.anchors.length;i++){ const [ax,ay,az]=b.anchors[i]; const sw=Math.sin(t*3.1+i*0.7+b.ph)*0.12; const nx=-b.uz*sw, nz=b.ux*sw;
    p.set([ax-b.ux*0.16,ay,az-b.uz*0.16, ax+b.ux*0.16,ay,az+b.uz*0.16, ax+nx,ay-0.32,az+nz],i*9); } b.geo.attributes.position.needsUpdate=true; b.geo.computeVertexNormals(); b.geo.computeBoundingSphere(); }
/* ---- mobiliário urbano ---- */
function stOrelhao(x,z,ry){ const g=G3(x,0,z,ry); const or=stM('orelhao',{color:0xe0601a,shininess:40}), dk=stM('orelhaoDk',{color:0x2a2a2a,shininess:30});
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,2.3,8),dk); pole.position.set(0,1.15,-0.25); g.add(pole);
  const shell=new THREE.Mesh(new THREE.SphereGeometry(0.62,18,12,0,Math.PI*2,0,Math.PI*0.55),or); shell.scale.set(1,1.25,0.95); shell.rotation.x=-0.25; shell.position.set(0,1.85,0.05); g.add(shell);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(0.6,18,12,0,Math.PI*2,0,Math.PI*0.55),stM('orelhaoIn',{color:0xd8d0c0,side:THREE.BackSide})); inner.scale.copy(shell.scale); inner.rotation.copy(shell.rotation); inner.position.copy(shell.position); g.add(inner);
  tzBx(g,0.3,0.45,0.16,stM('phoneBox',{color:0x3a5a8a,shininess:40}),0,1.45,-0.12); tzBx(g,0.08,0.24,0.06,dk,0.18,1.42,-0.03); bake(g); }
function stBanca(x,z,ry){ const g=G3(x,0,z,ry); const gr=stM('banca',{color:0x1e5a3a,shininess:30}); tzBx(g,2.6,2.3,1.7,gr,0,1.15,0); tzBx(g,2.9,0.12,2.1,gr,0,2.36,0.1);
  const sh=clSignTex('BANCA DO ZÉ',{w:512,h:96,bg:'#f0c020',fg:'#1e5a3a',size:60}); clPL(g,2.4,0.4,new THREE.MeshLambertMaterial({map:sh}),0,2.6,1.05,0);
  for(let i=0;i<12;i++){ const p=clPL(g,0.32,0.42,new THREE.MeshLambertMaterial({map:clSignTex(pick(['EXTRA!','SURTO','CAOS','EXÉRCITO','QUARENTENA','PÂNICO']),{w:128,h:160,bg:pick(['#e8e0d0','#f0e8a0','#e0c8c8']),fg:'#111',size:30,grime:true})}),-1.1+(i%6)*0.42,1.2+Math.floor(i/6)*0.5,0.86,0); }
  tzBx(g,2.4,1.0,0.06,stM('bancaShut',{color:0x4a4e4a}),0,0.5,0.86); bake(g); addPropBox(x,z,1.4,1.4); }
function stPonto(x,z,ry){ const g=G3(x,0,z,ry); const mt=stM('busStop',{color:0x6a7074,shininess:50}); for(const sx of [-1.4,1.4]) tzBx(g,0.08,2.5,0.08,mt,sx,1.25,-0.4); tzBx(g,3.1,0.08,1.3,mt,0,2.5,0.05); tzBx(g,2.6,0.06,0.4,stM('bench',{color:0x5a3a20}),0,0.48,-0.15);
  const gl=CLP.glass(); clPL(g,2.8,1.8,gl,0,1.4,-0.45,0); clPL(g,1.0,1.5,new THREE.MeshLambertMaterial({map:clSignTex('DESAPARECIDOS',{w:256,h:384,bg:'#e8e0d0',fg:'#8a1010',size:34,dy:-150})}),-0.8,1.4,-0.42,0);
  const sg=clSignTex('PONTO',{w:256,h:256,bg:'#0a3a9a',fg:'#fff',size:56}); clPL(g,0.5,0.5,new THREE.MeshLambertMaterial({map:sg}),1.4,2.9,-0.35,0); bake(g); }
function stPlaca(x,z,ry,txt){ const g=G3(x,0,z,ry); tzBx(g,0.07,2.9,0.07,stM('signPole',{color:0x3a3e40}),0,1.45,0); const t=clSignTex(txt,{w:512,h:128,bg:'#14306a',fg:'#fff',size:58,border:'#fff'}); const m=new THREE.MeshLambertMaterial({map:t,side:THREE.DoubleSide}); clPL(g,1.4,0.35,m,0.72,2.75,0,0); bake(g); }
function stSemaforo(x,z,ry){ const g=G3(x,0,z,ry); const dk=stM('tlight',{color:0x1a1a1a,shininess:40}); tzBx(g,0.12,3.4,0.12,dk,0,1.7,0); tzBx(g,0.12,0.12,2.2,dk,0,3.35,1.1); tzBx(g,0.34,0.95,0.3,dk,0,2.95,2.1); bake(g);
  const y=new THREE.MeshBasicMaterial({color:0x2a2000}); const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,8),y); const a=G3(x,0,z,ry); lamp.position.set(0,2.95,2.1); a.add(lamp);
  for(const yy of [3.22,2.68]){ const off=new THREE.Mesh(new THREE.SphereGeometry(0.1,10,8),stM('tlOff',{color:0x111111})); off.position.set(0,yy,2.1); a.add(off); } MAPG.city.add(a); ST.blink.push(y); }
function stPoste(x,z){ const g=G3(x,0,z,0); const cn=stM('poste',{color:0x8a8680}); tzBx(g,0.28,8.5,0.28,cn,0,4.25,0); tzBx(g,2.0,0.14,0.14,cn,0,7.6,0); tzBx(g,0.5,0.7,0.5,stM('transf',{color:0x5a6062,shininess:30}),0.35,6.6,0.3); bake(g); return [x,7.55,z]; }
function stWire(a,b,sag){ const pts=[]; for(let i=0;i<=16;i++){ const t=i/16; pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*Math.PI)*sag,a[2]+(b[2]-a[2])*t]); } ST.wires.push(pts); }
function stWiresFlush(){ const v=[]; for(const w of ST.wires) for(let i=0;i<w.length-1;i++) v.push(...w[i],...w[i+1]); const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(v,3)); const l=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x111111})); l.frustumCulled=false; MAPG.city.add(l); ST.wires.length=0; }
function stBody(x,z,ry){ const g=G3(x,0,z,ry); const sh=stM('sheet',{color:0xc8c0b0}); const b=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.3,1.7,10),sh); b.rotation.z=Math.PI/2; b.scale.set(1,1,0.55); b.position.y=0.15; g.add(b);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,8),sh); head.position.set(0.95,0.15,0); head.scale.set(1,0.7,1); g.add(head); bake(g); try{ bloodPool(x+rand(-0.4,0.4),z+rand(-0.4,0.4),rand(0.8,1.3)); }catch(e){} }
function stTrash(x,z){ const g=G3(x,0,z,rand(0,6)); for(let i=0;i<5;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(rand(0.28,0.4),8,6),stM('trashbag',{color:0x111214,shininess:70})); b.scale.set(1,0.8,1); b.position.set(rand(-0.6,0.6),0.25+Math.floor(i/3)*0.3,rand(-0.5,0.5)); g.add(b); } bake(g); }
function stLixeira(x,z){ const g=G3(x,0,z,0); tzBx(g,0.08,0.95,0.08,stM('signPole',{color:0x3a3e40}),0,0.47,0); const b=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.18,0.5,12,1,true),stM('lixeira',{color:0xe0701a,shininess:40,side:THREE.DoubleSide})); b.position.set(0,0.9,0.22); g.add(b); bake(g); }
/* ---- interiores pós-apocalípticos ---- */
function stInterior(s){ const R=clReserved(); const g=new THREE.Group(); const free=[];
  for(let r=s.r0+1;r<s.r1;r++) for(let c=s.x0+1;c<s.x1;c++){ const z=czr(r); if(grid[z][c]==='.'&&!R.has(c+','+z)&&!propCell[z*MW+c]) free.push([c,z]); }
  const wood=stM('debrisWood',{color:0x4a3220}), conc=stM('debrisConc',{color:0x6a645c}), glass=stM('shard',{color:0xa8c8d0,transparent:true,opacity:0.5,shininess:120,side:THREE.DoubleSide}), paper=stM('paper2',{color:0xd8d0bc,side:THREE.DoubleSide});
  for(let i=0;i<Math.min(10,free.length/3);i++){ const [c,z]=pick(free); const x=cx(c)+rand(-0.6,0.6), zz=cx(z)+rand(-0.6,0.6);
    const k=Math.random(); if(k<0.35){ for(let j=0;j<6;j++){ const b=tzBx(g,rand(0.4,1.4),0.05,rand(0.1,0.18),wood,x+rand(-0.5,0.5),0.03+j*0.04,zz+rand(-0.5,0.5)); b.rotation.set(rand(-0.3,0.3),rand(0,6),rand(-0.3,0.3)); } }
    else if(k<0.65){ for(let j=0;j<7;j++){ const m=new THREE.Mesh(new THREE.DodecahedronGeometry(rand(0.08,0.25),0),conc); m.position.set(x+rand(-0.6,0.6),0.08,zz+rand(-0.6,0.6)); m.rotation.set(rand(0,3),rand(0,3),rand(0,3)); g.add(m); } }
    else { CLP.chair(g,x,zz,rand(0,6),pick([0x3a2a1a,0x5a5e60,0x8a1a1a])).rotation.z=Math.PI/2; } }
  for(let i=0;i<40;i++){ const [c,z]=pick(free.length?free:[[s.x0+2,czr(s.r0+2)]]); const p=clPL(g,rand(0.15,0.3),rand(0.2,0.3),Math.random()<0.4?glass:paper,cx(c)+rand(-0.9,0.9),0.006+i*0.0002,cx(z)+rand(-0.9,0.9),rand(0,6),-Math.PI/2); }
  bake(g);
  for(let i=0;i<3;i++){ const [c,z]=pick(free.length?free:[[s.x0+2,czr(s.r0+2)]]); try{ bloodPool(cx(c)+rand(-0.5,0.5),cx(z)+rand(-0.5,0.5),rand(0.6,1.4)); }catch(e){} }
  // pichação numa parede de dentro
  const wall=(CL.wall&&CL.wall[s.id])||[]; const used=(CL.used&&CL.used[s.id])||new Set(); const ws=wall.filter(q=>!used.has(q.x+','+q.z)); for(let i=0;i<2&&ws.length;i++){ const q=ws.splice(Math.floor(Math.random()*ws.length),1)[0]; const ry=Math.atan2(q.n[0],q.n[1]); const gg=G3(cx(q.x),0,cx(q.z),ry);
    clPL(gg,2.0,0.62,new THREE.MeshBasicMaterial({map:stGraffiti(pick(ST_GRAF),pick(['#b81010','#e8e8e0','#1a1a1a'])),transparent:true,depthWrite:false}),0,1.9,-0.95,0); bake(gg); } }
function stCamp(s){ // acampamento de sobrevivente no estoque do mercado
  const wall=(CL.wall&&CL.wall[s.id])||[], used=(CL.used&&CL.used[s.id])||new Set(); const q=wall.find(c=>!used.has(c.x+','+c.z)&&(s.side>0?c.x<8:c.x>38)); if(!q) return; used.add(q.x+','+q.z);
  const g=G3(cx(q.x),0,cx(q.z),Math.atan2(q.n[0],q.n[1])); tzBx(g,0.9,0.14,1.9,stM('mattress2',{color:0x6a6250}),0,0.07,-0.3); tzBx(g,0.8,0.05,1.2,stM('sleepbag',{color:0x2a4a2a}),0,0.17,-0.1);
  for(let i=0;i<6;i++) clCY(g,0.04,0.04,0.11,stM('can',{color:0xa8a8a0,shininess:80}),rand(-0.5,0.5),0.055,rand(0.4,0.9),8); clCY(g,0.03,0.03,0.12,stM('candle',{color:0xe8e0c8,emissive:0x3a3020}),0.4,0.06,0.2,8); bake(g);
  const fl=new THREE.PointLight(0xff9a40,0.6,4,2); const w=new THREE.Vector3(0.4,0.3,0.2).applyMatrix4(g.matrixWorld); fl.position.copy(w); MAPG.city.add(fl); ST.candle=fl; }
function stForaLula(){ // cartaz pedido para o bar
  const s=CITY_SHOPS.find(q=>q.id==='CB'); if(!s) return; const wall=(CL.wall&&CL.wall.CB)||[], used=(CL.used&&CL.used.CB)||new Set(); const q=wall.find(c=>!used.has(c.x+','+c.z)&&c.n[0]===0)||wall.find(c=>!used.has(c.x+','+c.z)); if(!q) return; used.add(q.x+','+q.z);
  const t=tex(512,360,(c,W,H)=>{ c.fillStyle='#f2ede0'; c.fillRect(0,0,W,H); c.fillStyle='#c81414'; c.font='bold 150px Impact, "Arial Black", sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('FORA',W/2,H*0.3); c.fillStyle='#111'; c.fillText('LULA',W/2,H*0.72);
    c.globalCompositeOperation='destination-out'; for(let i=0;i<40;i++){ c.beginPath(); c.arc(Math.random()<0.5?Math.random()*20:W-Math.random()*20,Math.random()*H,6+Math.random()*12,0,6.28); c.fill(); } c.globalCompositeOperation='source-over'; clGrime(c,W,H,0.22);
    c.fillStyle='rgba(120,120,120,.8)'; for(const [x,y] of [[16,16],[W-16,16],[16,H-16],[W-16,H-16]]){ c.beginPath(); c.arc(x,y,6,0,6.28); c.fill(); } });
  const g=G3(cx(q.x),0,cx(q.z),Math.atan2(q.n[0],q.n[1])); clPL(g,1.3,0.92,new THREE.MeshLambertMaterial({map:t,transparent:true}),0,1.75,-0.94,0); bake(g); ST.poster=[q.x,q.z]; }
/* ---- peças antigas soltas (pedras e sacos de areia) viram uma malha só ---- */
function stBakeOld(){ const root=MAPG.city, g=new THREE.Group(), kill=[]; const sand=stM('sandOld',{color:0x6a5e42}), rock=[0x5a4a3e,0x4a4440,0x6a5a48].map(c=>stM('rock'+c,{color:c,flatShading:true,shininess:4}));
  for(const o of root.children){ if(!o.isMesh||!o.geometry) continue; const t=o.geometry.type;
    if(t==='DodecahedronGeometry'){ const m=new THREE.Mesh(o.geometry,pick(rock)); m.position.copy(o.position); m.rotation.copy(o.rotation); m.scale.copy(o.scale); g.add(m); kill.push(o); }
    else if(t==='CylinderGeometry'&&o.material&&o.material.color&&o.material.color.getHex()===0x6a5e42){ const m=new THREE.Mesh(o.geometry,sand); m.position.copy(o.position); m.rotation.copy(o.rotation); g.add(m); kill.push(o); } }
  for(const o of kill) root.remove(o); bake(g); }
/* ---- montagem ---- */
const _stBC=buildCity; buildCity=function(){ const r=_stBC.apply(this,arguments); try{ stBuild(); }catch(e){ console.warn('[Bunker v9] rua da cidade',e); } return r; };
function stBuild(){ stCleanup(); stRoad(); const X=cx(23.5);
  // bandeiras do Brasil: mastros, penduradas nas fachadas e bandeirinhas cruzando a avenida
  stFlagPole(X,cx(czr(33.5)),9,null);
  for(const [c0,r] of [[30.2,22],[16.8,47],[30.2,51]]) stFlagPole(cx(c0),cx(czr(r)),7.5,null);
  for(const s of CITY_SHOPS){ const fx=s.side>0?(s.x1+1)*S+0.08:s.x0*S-0.08; const r=s.r0+((s.r1-s.r0)>>1); if(Math.random()<0.7) stHangFlag(fx,cx(czr(r))+rand(-3,3),s.side>0?Math.PI/2:-Math.PI/2,1.5,2.1).position.y=4.6; }
  for(const r of [6,20,30,46,54]) stBunting(cx(18),cx(czr(r)),cx(29),cx(czr(r+1.5)),6.3);
  // mobiliário
  stOrelhao(cx(17.4),cx(czr(10)),Math.PI/2); stOrelhao(cx(29.6),cx(czr(36)),-Math.PI/2); stOrelhao(cx(17.4),cx(czr(52)),Math.PI/2);
  stBanca(cx(31.5),cx(czr(28)),-Math.PI/2);
  stPonto(cx(17.4),cx(czr(30)),Math.PI/2); stPonto(cx(29.6),cx(czr(12)),-Math.PI/2);
  for(const [c0,r,ry,t] of [[18.6,15,0,'AV. BRASIL'],[28.4,41,Math.PI,'R. 7 DE SETEMBRO'],[18.6,39,0,'R. TIRADENTES'],[28.4,17,Math.PI,'AV. BRASIL']]) stPlaca(cx(c0),cx(czr(r)),ry,t);
  for(const [c0,r,ry] of [[18.4,18,Math.PI/2],[28.6,14,-Math.PI/2],[18.4,42,Math.PI/2],[28.6,38,-Math.PI/2]]) stSemaforo(cx(c0),cx(czr(r)),ry);
  const posts=[]; for(const r of [2,10,18,26,34,42,50,58]) posts.push(stPoste(cx(17.6),cx(czr(r))));
  for(let i=0;i<posts.length-1;i++){ for(let k=0;k<3;k++) stWire([posts[i][0]+k*0.4-0.4,posts[i][1],posts[i][2]],[posts[i+1][0]+k*0.4-0.4,posts[i+1][1],posts[i+1][2]],0.6+k*0.25); }
  for(const i of [1,3,5]) stWire(posts[i],[cx(30),6.5,posts[i][2]+rand(-3,3)],1.4);   // fios atravessando a rua
  for(let i=0;i<4;i++){ const p=posts[1+i*2]; const pts=[]; for(let k=0;k<30;k++){ const a=k/30*Math.PI*6; pts.push([p[0]+Math.cos(a)*0.35*(1-k/40),p[1]-0.6-k*0.03,p[2]+Math.sin(a)*0.3]); } ST.wires.push(pts); }   // fiação embolada
  for(const [c0,r] of [[17.2,6],[29.8,24],[17.2,33],[29.8,47],[17.2,57]]) stLixeira(cx(c0),cx(czr(r)));
  for(const [c0,r] of [[19.5,9],[27.4,27],[20.2,44],[26.6,55],[16.6,21]]) stTrash(cx(c0),cx(czr(r)));
  for(const [c0,r,ry] of [[21.5,31,0.4],[25.8,35.5,2.2],[19.6,50,1.2]]) stBody(cx(c0),cx(czr(r)),ry);
  // pichações nas fachadas
  for(const s of CITY_SHOPS){ const fx=s.side>0?(s.x1+1)*S+0.5:s.x0*S-0.5; const ry=s.side>0?Math.PI/2:-Math.PI/2; const z=cx(czr(s.r0+1))+rand(0,2);
    const g=G3(fx,0,z,ry); clPL(g,2.4,0.75,new THREE.MeshBasicMaterial({map:stGraffiti(pick(ST_GRAF),pick(['#b81010','#e8e8e0','#2a8a2a'])),transparent:true,depthWrite:false}),0,1.6,0,0); bake(g); }
  // interiores, acampamento e o cartaz do bar
  for(const s of CITY_SHOPS) stInterior(s); const cm=CITY_SHOPS.find(q=>q.id==='CM'); if(cm) stCamp(cm); stForaLula();
  // lâmpadas fluorescentes (apagadas até ligar a energia na delegacia)
  ST.tubes=new THREE.MeshBasicMaterial({color:0x202422}); const tg=new THREE.Group();
  for(const s of CITY_SHOPS){ for(let k=0;k<4;k++){ const c=s.x0+2+Math.round((s.x1-s.x0-4)*(k%2?0.75:0.25)), r=s.r0+2+Math.round((s.r1-s.r0-4)*(k<2?0.3:0.7)); const x=cx(c), z=cx(czr(r)); tzBx(tg,1.3,0.05,0.18,stM('tubeHousing',{color:0xd8d8d0}),x,ROOM_CEIL-0.06,z); const t=tzBx(tg,1.2,0.04,0.08,ST.tubes,x,ROOM_CEIL-0.1,z); }
    const L=new THREE.PointLight(0xdff0ff,0,16,1.5); L.position.set(cx((s.x0+s.x1)/2),ROOM_CEIL-0.3,cx(czr((s.r0+s.r1)/2))); MAPG.city.add(L); ST.lights.push(L); }
  bake(tg); stWiresFlush(); stBakeOld(); }
/* ---- animação: bandeiras ao vento, bandeirinhas, semáforo piscando, luz quando liga a energia ---- */
v9On('always',dt=>{ if(CUR!=='city') return; ST.t+=dt; const t=ST.t;
  const near=f=>Math.hypot(f.m.position.x-P.pos.x,f.m.position.z-P.pos.z)<60;
  for(const f of ST.flags){ if(!near(f)) continue; const p=f.m.geometry.attributes.position, b=f.base;
    for(let i=0;i<p.count;i++){ const x=b[i*3], y=b[i*3+1]; const u=(x+1.05)/2.1; const w=f.hang?Math.sin(t*1.6+y*2+f.ph)*0.05*f.amp:Math.sin(t*4.2-u*5+f.ph)*0.16*u+Math.sin(t*7.3-u*9)*0.04*u; p.setZ(i,b[i*3+2]+w); if(!f.hang) p.setY(i,y-u*u*0.08+Math.sin(t*3-u*4)*0.03*u); } p.needsUpdate=true; f.m.geometry.computeVertexNormals(); }
  ST.bt=(ST.bt||0)+dt; if(ST.bt>0.05){ ST.bt=0; for(const bn of ST.bunting) if(Math.hypot(bn.anchors[0][0]-P.pos.x,bn.anchors[0][2]-P.pos.z)<70) stBuntPose(bn,t); }
  const on=Math.floor(t*1.3)%2===0; for(const m of ST.blink) m.color.setHex(on?0xffb000:0x2a2000);
  if(ST.candle) ST.candle.intensity=0.5+Math.sin(t*13)*0.08+Math.random()*0.06;
  const pw=!!G.power; if(pw!==ST.on){ ST.on=pw; if(pw){ let k=0; const flick=()=>{ k++; const lit=k>6||Math.random()<0.5; if(ST.tubes) ST.tubes.color.setHex(lit?0xeaf6ff:0x202422); for(const L of ST.lights) L.intensity=lit?1.1:0; if(k<9) setTimeout(flick,90+Math.random()*120); }; flick(); try{ Snd.sample('generator',{vol:0.5}); }catch(e){} }
    else { if(ST.tubes) ST.tubes.color.setHex(0x202422); for(const L of ST.lights) L.intensity=0; } } });
