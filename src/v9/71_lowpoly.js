/* ================= v9 · PERSONAGENS LOW POLY "DE VERDADE" — 1º: SARGENTO MOREIRA =================
   Estilo da referência: low poly facetado (cada face com seu tom, sombreamento plano), mas com estrutura de
   personagem grande: ombro largo, braço grosso, manga dobrada com divisa, regata por baixo da camisa aberta,
   bandoleira com fivela, cinto com bornais, calça cargo com bolso, coturno amarrado, barba, cicatriz e tatuagem.
   Mão é uma concha (palma + bloco dos dedos) com os dedos desenhados — sem animar dedo por dedo.
   O esqueleto é o mesmo dos outros personagens (quadril, joelho, ombro, cotovelo, punho, pescoço), então todas as
   poses, gestos do lobby e animações online continuam valendo, e a malha vira uma peça só (70_chars). */
const LPX={on:true,mats:null};
function lpRng(seed){ let a=seed>>>0||1; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const _lpC=new THREE.Color(), _lpC2=new THREE.Color();
/* termina uma peça: sem índice (cada face com vértices próprios), normais planas e cor por face com variação */
function lpFin(geo,col,vary,seed){ let g=geo.index?geo.toNonIndexed():geo; g.computeVertexNormals(); const p=g.attributes.position, n=p.count, c=new Float32Array(n*3); const R=lpRng(seed||((Math.random()*1e9)|0)); vary=vary==null?0.09:vary;
  for(let i=0;i<n;i+=3){ const x=(p.getX(i)+p.getX(i+1)+p.getX(i+2))/3, y=(p.getY(i)+p.getY(i+1)+p.getY(i+2))/3, z=(p.getZ(i)+p.getZ(i+1)+p.getZ(i+2))/3;
    const h=typeof col==='function'?col(x,y,z):col; _lpC.set(h); const k=1+(R()*2-1)*vary; for(let j=0;j<3;j++){ c[(i+j)*3]=Math.min(1,_lpC.r*k); c[(i+j)*3+1]=Math.min(1,_lpC.g*k); c[(i+j)*3+2]=Math.min(1,_lpC.b*k); } }
  g.setAttribute('color',new THREE.BufferAttribute(c,3)); return g; }
/* loft facetado sem suavização: anéis [y, rx, rzFrente, rzTrás, cx, cz] */
function lpLoft(rings,N,o){ o=o||{}; const pos=[],uv=[],idx=[]; const R=rings.length, y0=rings[0][0], y1=rings[R-1][0], span=Math.abs(y0-y1)||1, a0=o.rot||0;
  for(let r=0;r<R;r++){ const [y,rx,rzF,rzB,cx,cz]=rings[r]; for(let i=0;i<=N;i++){ const ph=a0+(i/N-0.5)*Math.PI*2, s=Math.sin(ph), c=Math.cos(ph); pos.push((cx||0)+rx*s,y,(cz||0)+(c>=0?rzF:rzB)*c); uv.push(i/N,1-(y0-y)/span); } }
  for(let r=0;r<R-1;r++) for(let i=0;i<N;i++){ const a=r*(N+1)+i, b=a+N+1; idx.push(a,b,a+1,a+1,b,b+1); }
  const cap=(r,up)=>{ const [y,,,,cx,cz]=rings[r]; const c=pos.length/3; pos.push(cx||0,y,cz||0); uv.push(0.5,up?1:0); for(let i=0;i<N;i++){ const a=r*(N+1)+i; if(up) idx.push(c,a,a+1); else idx.push(c,a+1,a); } };
  if(o.top) cap(0,true); if(o.bot) cap(R-1,false);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); return g; }
/* desloca vértices que se repetem igual (não abre rachaduras) */
function lpWarp(g,fn){ const p=g.attributes.position, memo=new Map(); for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i), k=Math.round(x*1e4)+','+Math.round(y*1e4)+','+Math.round(z*1e4); let v=memo.get(k); if(!v){ v=fn(x,y,z); memo.set(k,v); } p.setXYZ(i,v[0],v[1],v[2]); } p.needsUpdate=true; return g; }
/* tira: caixa ligando dois pontos (alças, cadarços, golas) */
function lpSeg(a,b,w,d,mat,col,par,up){ const dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2], L=Math.hypot(dx,dy,dz)||1e-4; const g=lpFin(new THREE.BoxGeometry(w,L,d),col,0.06);
  const m=new THREE.Mesh(g,mat); m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2); const dir=new THREE.Vector3(dx/L,dy/L,dz/L);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir); if(up){ const nrm=new THREE.Vector3(...up).normalize(); const zA=new THREE.Vector3(0,0,1).applyQuaternion(m.quaternion); const ang=Math.atan2(new THREE.Vector3().crossVectors(zA,nrm).dot(dir),zA.dot(nrm)); m.rotateY(ang); }
  par.add(m); return m; }
function lpMats(){ if(LPX.mats) return LPX.mats; const base=o=>new THREE.MeshPhongMaterial(Object.assign({vertexColors:true,flatShading:true,shininess:6,specular:0x0c0c0c,side:THREE.DoubleSide},o));
  const tat=new THREE.CanvasTexture((()=>{ const c=document.createElement('canvas'); c.width=128; c.height=128; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,128,128);
    // tatuagem: desenhos tribais na parte de fora do antebraço (u≈0.25 e u≈0.75 são os lados)
    const R=lpRng(77); g.fillStyle='rgba(52,60,72,0.78)';
    for(const cu of [32,96]){ for(let i=0;i<7;i++){ const y=10+i*16+R()*6, x=cu+(R()*2-1)*10, w=10+R()*12, h=8+R()*10;
        g.beginPath(); g.moveTo(x-w,y); g.quadraticCurveTo(x,y-h,x+w,y-h*0.2); g.quadraticCurveTo(x+w*0.3,y+h*0.1,x+w*0.6,y+h*0.9); g.quadraticCurveTo(x,y+h*0.2,x-w,y); g.fill(); }
      g.lineWidth=3; g.strokeStyle='rgba(52,60,72,0.7)'; g.beginPath(); g.arc(cu,70,12,0.4,5.4); g.stroke(); }
    return c; })());
  const fing=new THREE.CanvasTexture((()=>{ const c=document.createElement('canvas'); c.width=64; c.height=64; const g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,64,64);
    g.fillStyle='rgba(30,18,12,0.55)'; for(const u of [0.12,0.2,0.28,0.62,0.7,0.78]) g.fillRect(u*64-1,6,2,58);   // vãos entre os dedos (dos dois lados)
    g.fillStyle='rgba(30,18,12,0.35)'; g.fillRect(0,22,64,2); g.fillRect(0,44,64,2); return c; })());   // dobras das juntas
  const patch=new THREE.CanvasTexture((()=>{ const c=document.createElement('canvas'); c.width=64; c.height=80; const g=c.getContext('2d');
    g.fillStyle='#2a2b22'; g.beginPath(); g.moveTo(4,4); g.lineTo(60,4); g.lineTo(60,56); g.lineTo(32,76); g.lineTo(4,56); g.closePath(); g.fill(); g.strokeStyle='#14140f'; g.lineWidth=3; g.stroke();
    g.fillStyle='#e0a81e'; for(let i=0;i<2;i++){ const y=22+i*20; g.beginPath(); g.moveTo(10,y); g.lineTo(32,y-14); g.lineTo(54,y); g.lineTo(54,y+9); g.lineTo(32,y-5); g.lineTo(10,y+9); g.closePath(); g.fill(); } return c; })());
  for(const t of [tat,fing,patch]){ t.anisotropy=4; }
  return LPX.mats={c:base(),tat:base({map:tat}),fing:base({map:fing}),patch:new THREE.MeshPhongMaterial({map:patch,flatShading:true,shininess:4,transparent:false,alphaTest:0.5,side:THREE.DoubleSide})}; }

/* ---------- cabeça esculpida ---------- */
function lpHeadBase(){ const g=new THREE.IcosahedronGeometry(1,2); return lpWarp(g,(x,y,z)=>{
  if(y>0.55) y=0.55+(y-0.55)*0.82;                                          // topo achatado
  const k=Math.max(0,(-y-0.1)/0.9);                                         // mandíbula quadrada, queixo marcado
  x*=y<-0.55?1-0.38*((-y-0.55)/0.45):1-0.06*k; if(y<-0.65&&z>0) z+=0.1*(1-Math.abs(x)*1.5);
  if(z>0.55&&y>0.12&&y<0.36) z+=0.08;                                       // arco da sobrancelha
  if(z>0.5&&Math.abs(x)>0.16&&Math.abs(x)<0.56&&y>-0.08&&y<0.14) z-=0.08;   // olho fundo
  if(Math.abs(x)>0.5&&z>0.15&&y>-0.3&&y<0.05) x*=1.07;                       // maçã do rosto
  if(Math.abs(x)>0.55&&z>0&&y>-0.62&&y<-0.3) x*=0.96;                        // bochecha
  if(z<0) z*=0.94;
  return [x*0.084,y*0.118,z*0.101]; }); }
function lpNose(){ const v={t:[0,0.024,0.099],b:[0,-0.026,0.127],l:[-0.017,-0.04,0.106],r:[0.017,-0.04,0.106],u:[0,-0.044,0.103],sl:[-0.011,0.004,0.101],sr:[0.011,0.004,0.101]};
  const F=[['t','sl','b'],['t','b','sr'],['sl','l','b'],['b','r','sr'],['l','u','b'],['b','u','r']]; const pos=[]; for(const f of F) for(const k of f) pos.push(...v[k]);
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); return g; }
function lpHead(head,M,L){ const skin=L.lpSkin, beardC=0x231a14, hairC=0x1d1612;
  const base=lpHeadBase(); const hm=new THREE.Mesh(lpFin(base.clone(),(x,y,z)=>{ _lpC2.set(skin); if(z>0.06&&y<-0.01&&y>-0.03&&Math.abs(x)<0.04) _lpC2.multiplyScalar(0.92); return _lpC2.getHex(); },0.07,11),M.c); head.add(hm);
  head.add(new THREE.Mesh(lpFin(lpNose(),skin,0.08,12),M.c));
  // orelhas
  for(const s of [-1,1]){ const e=new THREE.Mesh(lpFin(new THREE.IcosahedronGeometry(1,0),skin,0.1,13+s),M.c); e.scale.set(0.012,0.03,0.019); e.position.set(s*0.083,-0.002,-0.01); e.rotation.y=s*0.35; head.add(e); }
  // olhos: amêndoa clara com íris escura, fundos sob a sobrancelha
  for(const s of [-1,1]){ const sh=new THREE.Shape(); sh.moveTo(-0.012,0); sh.quadraticCurveTo(0,0.0065,0.012,0.001); sh.quadraticCurveTo(0,-0.005,-0.012,0);
    const sc=new THREE.Mesh(lpFin(new THREE.ShapeGeometry(sh,3),0x9c9086,0.03,14),M.c); sc.position.set(s*0.031,0.009,0.0905); sc.rotation.y=s*0.28; sc.scale.set(s*1.2,1.25,1); head.add(sc);
    const lid=lpSeg([s*0.016,0.0145,0.094],[s*0.046,0.0125,0.088],0.0032,0.004,M.c,0x2a1a12,head);
    const ir=new THREE.Mesh(lpFin(new THREE.CircleGeometry(0.0055,6),0x1a120c,0.02,15),M.c); ir.position.set(s*0.0295,0.0092,0.0918); ir.rotation.y=s*0.28; head.add(ir);
    // sobrancelha grossa, franzida (ponta de dentro mais baixa)
    const br=new THREE.Mesh(lpFin(new THREE.BoxGeometry(0.036,0.009,0.012),hairC,0.08,16+s),M.c); br.position.set(s*0.031,0.03,0.097); br.rotation.set(-0.1,s*0.3,-s*0.24); head.add(br); }
  // cicatriz atravessando a sobrancelha até a bochecha (lado esquerdo de quem olha)
  lpSeg([-0.042,0.05,0.099],[-0.037,0.034,0.1],0.002,0.004,M.c,0x6a3a2e,head); lpSeg([-0.037,0.026,0.1],[-0.032,0.0,0.099],0.002,0.004,M.c,0x6a3a2e,head);
  // barba cheia aparada: casca da cabeça só na parte de baixo do rosto
  const bg=base.clone(); bg.scale(1.06,1.03,1.07); const bp=bg.attributes.position, keep=[];
  for(let i=0;i<bp.count;i+=3){ const x=(bp.getX(i)+bp.getX(i+1)+bp.getX(i+2))/3/0.084/1.06, y=(bp.getY(i)+bp.getY(i+1)+bp.getY(i+2))/3/0.118/1.03, z=(bp.getZ(i)+bp.getZ(i+1)+bp.getZ(i+2))/3/0.101/1.07;
    const side=Math.abs(x)>0.8&&y<-0.02&&z>-0.3, low=y<-0.3&&z>-0.3, lip=y<-0.18&&y>-0.32&&Math.abs(x)<0.4&&z>0.55;
    if(side||low||lip) for(let j=0;j<3;j++) keep.push(bp.getX(i+j),bp.getY(i+j),bp.getZ(i+j)); }
  const bgeo=new THREE.BufferGeometry(); bgeo.setAttribute('position',new THREE.Float32BufferAttribute(keep,3)); head.add(new THREE.Mesh(lpFin(bgeo,beardC,0.14,17),M.c));
  // boca: lábio de baixo e a linha
  lpSeg([-0.014,-0.046,0.103],[0.014,-0.046,0.103],0.006,0.008,M.c,0x6a4030,head).rotation.z=Math.PI/2;
  // cabelo curto, topo espetado
  const hg=base.clone(); lpWarp(hg,(x,y,z)=>{ const ux=x/0.084, uy=y/0.118, uz=z/0.101; const top=Math.max(0,uy-0.3); const spike=0.022*top*(0.45+0.55*Math.abs(Math.sin(ux*19+uz*15))); return [x*1.07+ux*spike*0.3,y*1.05+spike,z*1.07+uz*spike*0.3]; });
  const hp=hg.attributes.position, hk=[]; for(let i=0;i<hp.count;i+=3){ const y=(hp.getY(i)+hp.getY(i+1)+hp.getY(i+2))/3/0.118, z=(hp.getZ(i)+hp.getZ(i+1)+hp.getZ(i+2))/3/0.101, x=(hp.getX(i)+hp.getX(i+1)+hp.getX(i+2))/3/0.084;
    const front=z>0.3, ok=front?y>0.6:(z>-0.2?y>0.28-(Math.abs(x)>0.75?0.3:0):y>-0.45); if(ok) for(let j=0;j<3;j++) hk.push(hp.getX(i+j),hp.getY(i+j),hp.getZ(i+j)); }
  const hgeo=new THREE.BufferGeometry(); hgeo.setAttribute('position',new THREE.Float32BufferAttribute(hk,3)); head.add(new THREE.Mesh(lpFin(hgeo,hairC,0.16,18),M.c)); }

/* ---------- o sargento ---------- */
function lpSarge(id,vk,L0,opts){ opts=opts||{}; const M=lpMats(); const L=Object.assign({},L0,{lpSkin:0xa8734f}); const skin=L.lpSkin;
  const GREEN=0x56613a, GREEN2=0x4c5733, PANTS=0x4b5531, TANK=0x232220, LEATHER=0x4d3a28, BOOT=0x3b2c22, METAL=0x7c786e;
  const root=new THREE.Group(), body=new THREE.Group(); root.add(body);
  const add=(geo,mat,par,x,y,z)=>{ const m=new THREE.Mesh(geo,mat); m.position.set(x||0,y||0,z||0); par.add(m); return m; };
  // ---- pernas: calça cargo larga, coturno amarrado
  const legs=[];
  for(const s of [-1,1]){ const lg=new THREE.Group(); lg.position.set(s*0.1,0.92,0); body.add(lg);
    add(lpFin(lpLoft([[0.07,0.105,0.1,0.11],[-0.06,0.108,0.105,0.112],[-0.24,0.094,0.09,0.095],[-0.42,0.076,0.074,0.078]],9,{rot:s*0.3}),PANTS,0.1,21+s),M.c,lg);
    // bolso cargo do lado de fora
    const pk=add(lpFin(new THREE.BoxGeometry(0.03,0.13,0.11),GREEN2,0.08,23+s),M.c,lg,s*0.098,-0.26,0.005); pk.rotation.z=s*0.08;
    const fl=add(lpFin(new THREE.BoxGeometry(0.036,0.035,0.118),0x434c2b,0.06,24+s),M.c,lg,s*0.104,-0.19,0.005); fl.rotation.z=s*0.08;
    const kn=new THREE.Group(); kn.position.y=-0.44; lg.add(kn);
    add(lpFin(lpLoft([[0.04,0.08,0.08,0.082],[-0.08,0.084,0.086,0.084],[-0.17,0.082,0.084,0.08],[-0.23,0.07,0.072,0.07]],9,{rot:s*0.3}),PANTS,0.1,25+s),M.c,kn);
    // coturno: cano, dobra do topo, pé com bico e sola
    add(lpFin(lpLoft([[-0.19,0.068,0.072,0.07],[-0.21,0.066,0.07,0.068],[-0.36,0.06,0.064,0.064],[-0.43,0.062,0.07,0.07]],8),BOOT,0.1,27+s),M.c,kn);
    add(lpFin(lpLoft([[-0.185,0.073,0.077,0.075],[-0.215,0.073,0.077,0.075]],8),0x32251c,0.08,28+s),M.c,kn);
    const foot=zloft([[-0.085,0.054,0.085,0],[-0.03,0.058,0.1,0],[0.05,0.06,0.075,0],[0.12,0.06,0.05,0],[0.18,0.052,0.042,0],[0.21,0.036,0.03,0.004]]); add(lpFin(foot,BOOT,0.1,29+s),M.c,kn,0,-0.47,0.01);
    add(lpFin(new THREE.BoxGeometry(0.125,0.024,0.31),0x1e1712,0.06,30+s),M.c,kn,0,-0.468,0.07);
    // cadarço em X na frente do cano
    for(let i=0;i<4;i++){ const y0=-0.235-i*0.045, y1=y0-0.04, z=0.068; lpSeg([-0.03,y0,z],[0.03,y1,z+0.002],0.007,0.005,M.c,0x6b5a44,kn); lpSeg([0.03,y0,z],[-0.03,y1,z+0.002],0.007,0.005,M.c,0x6b5a44,kn); }
    lpSeg([-0.03,-0.42,0.09],[0.03,-0.42,0.09],0.007,0.005,M.c,0x6b5a44,kn);
    legs.push(lg); }
  // ---- tronco: camisa verde aberta, regata preta, peito com tatuagem
  const up=new THREE.Group(), chest=new THREE.Group(); chest.position.y=0.92; body.add(chest); up.position.y=-0.92; chest.add(up);
  const TR=[[1.535,0.075,0.068,0.068],[1.5,0.17,0.09,0.095],[1.465,0.235,0.118,0.112],[1.4,0.238,0.14,0.118],[1.32,0.226,0.145,0.118],[1.22,0.2,0.128,0.112],[1.12,0.186,0.118,0.106],[1.04,0.186,0.112,0.11],[0.97,0.19,0.112,0.12],[0.88,0.165,0.098,0.106]];
  const zF=y=>{ for(let i=0;i<TR.length-1;i++){ const a=TR[i], b=TR[i+1]; if(y<=a[0]&&y>=b[0]){ const t=(a[0]-y)/(a[0]-b[0]); return a[2]+(b[2]-a[2])*t; } } return 0.1; };
  const rX=y=>{ for(let i=0;i<TR.length-1;i++){ const a=TR[i], b=TR[i+1]; if(y<=a[0]&&y>=b[0]){ const t=(a[0]-y)/(a[0]-b[0]); return a[1]+(b[1]-a[1])*t; } } return 0.18; };
  const surf=(x,y,dz)=>{ const rx=rX(y), u=Math.min(0.98,Math.abs(x)/rx); return zF(y)*Math.sqrt(1-u*u)+(dz||0); };
  add(lpFin(lpLoft(TR,12,{top:true,bot:true}),(x,y,z)=>{ if(y<1.0) return PANTS; if(z>0.02&&Math.abs(x)<0.07&&y>1.43) return (Math.abs(x)>0.02&&y<1.49)?0x6a5048:skin; if(z>0.03&&Math.abs(x)<0.088&&y>1.02) return TANK; return GREEN; },0.09,31),M.c,up);
  // bordas da camisa aberta (vista da frente) e gola
  for(const s of [-1,1]){ let prev=null; for(let y=1.47;y>=1.02;y-=0.05){ const x=s*(0.075+(1.47-y)*0.03), p=[x,y,surf(x,y,0.006)]; if(prev) lpSeg(prev,p,0.028,0.012,M.c,GREEN2,up); prev=p; }
    const cl=add(lpFin(new THREE.BoxGeometry(0.1,0.07,0.014),GREEN2,0.08,33+s),M.c,up,s*0.085,1.5,0.07); cl.rotation.set(-0.7,s*0.55,-s*0.5);
  }
  add(lpFin(lpLoft([[1.56,0.088,0.06,0.09],[1.5,0.105,0.075,0.105]],8),(x,y,z)=>z>0.04?skin:GREEN2,0.08,35),M.c,up);   // gola em pé atrás do pescoço
  add(lpFin(lpLoft([[1.64,0.06,0.058,0.062,0,-0.008],[1.56,0.068,0.066,0.068,0,-0.003],[1.5,0.078,0.074,0.074]],8),skin,0.07,36),M.c,up);   // pescoço grosso
  // cinto, fivela e bornais
  add(lpFin(lpLoft([[1.035,0.196,0.12,0.118],[0.975,0.198,0.122,0.124]],12),LEATHER,0.08,37),M.c,up);
  const bz=0.122+0.012; for(const [w,h,x,y] of [[0.052,0.008,0,1.025],[0.052,0.008,0,0.985],[0.008,0.048,-0.022,1.005],[0.008,0.048,0.022,1.005]]) add(lpFin(new THREE.BoxGeometry(w,h,0.008),METAL,0.05,38),M.c,up,x,y,bz);
  for(const x of [-0.165,-0.095,0.095,0.165]){ const a=Math.atan2(x,0.12); const g=new THREE.Group(); g.position.set(x,1.0,surf(x,1.0,0.026)); g.rotation.y=a*0.9; up.add(g);
    add(lpFin(new THREE.BoxGeometry(0.058,0.068,0.042),0x4a3826,0.08,39),M.c,g); add(lpFin(new THREE.BoxGeometry(0.062,0.026,0.046),0x3e2f20,0.06,40),M.c,g,0,0.03,0.002); add(lpFin(new THREE.BoxGeometry(0.01,0.012,0.006),METAL,0.04,41),M.c,g,0,0.018,0.025); }
  // bandoleira: do ombro direito (esquerda de quem olha) até o quadril do outro lado, com fivela
  { const P=[]; for(let t=0;t<=1.0001;t+=0.125){ const x=-0.17+0.33*t, y=1.475-0.43*t; P.push([x,y,surf(x,y,0.016)]); }
    for(let i=0;i<P.length-1;i++) lpSeg(P[i],P[i+1],0.056,0.012,M.c,LEATHER,up,[0,0,1]);
    lpSeg([-0.17,1.475,P[0][2]],[-0.2,1.5,0],0.056,0.012,M.c,LEATHER,up); lpSeg([-0.2,1.5,0],[-0.17,1.47,-0.1],0.056,0.012,M.c,LEATHER,up);
    for(let t=0;t<1.0;t+=0.125){ const x=-0.17+0.33*t, y=1.47-0.43*t, x2=-0.17+0.33*(t+0.125), y2=1.47-0.43*(t+0.125); lpSeg([x,y,-surf(x,y,0.014)*0.92],[x2,y2,-surf(x2,y2,0.014)*0.92],0.056,0.012,M.c,LEATHER,up,[0,0,-1]); }
    const bx=-0.17+0.33*0.3, by=1.475-0.43*0.3, bzz=surf(bx,by,0.026); const fr=new THREE.Group(); fr.position.set(bx,by,bzz); fr.rotation.z=Math.atan2(0.43,0.33)-Math.PI/2; up.add(fr);
    for(const [w,h,x,y] of [[0.07,0.01,0,0.03],[0.07,0.01,0,-0.03],[0.01,0.07,-0.03,0],[0.01,0.07,0.03,0]]) add(lpFin(new THREE.BoxGeometry(w,h,0.01),METAL,0.05,42),M.c,fr,x,y,0); }
  // ---- cabeça
  const head=new THREE.Group(); head.position.set(0,1.708,0.012); head.scale.setScalar(1.13); up.add(head); lpHead(head,M,L);
  // ---- braços: manga curta dobrada com divisa, bíceps e antebraço tatuados, mão-concha
  const arms=[];
  for(const s of [-1,1]){ const a=new THREE.Group(); a.position.set(s*0.245,1.43,-0.005); up.add(a);
    add(lpFin(lpLoft([[0.07,0.055,0.065,0.065],[0.03,0.094,0.09,0.09],[-0.06,0.097,0.093,0.09],[-0.14,0.09,0.088,0.086]],9,{top:true}),GREEN,0.09,51+s),M.c,a);
    add(lpFin(lpLoft([[-0.13,0.098,0.096,0.094],[-0.165,0.102,0.098,0.096],[-0.19,0.097,0.094,0.092]],9),0x5d6a40,0.08,52+s),M.c,a);   // dobra da manga
    add(lpFin(lpLoft([[-0.15,0.08,0.078,0.075],[-0.21,0.082,0.08,0.074],[-0.29,0.064,0.064,0.062]],8),skin,0.08,53+s),M.c,a);           // bíceps
    if(s<0){ const pg=new THREE.Mesh(new THREE.PlaneGeometry(0.075,0.094),M.patch); pg.position.set(-0.1,-0.05,0.0); pg.rotation.y=-Math.PI/2; pg.rotation.x=0.0; a.add(pg); }
    const fo=new THREE.Group(); fo.position.y=-0.29; a.add(fo);
    add(lpFin(lpLoft([[0.03,0.064,0.064,0.062],[-0.05,0.074,0.072,0.068],[-0.15,0.06,0.058,0.056],[-0.245,0.046,0.044,0.044]],9),skin,0.08,54+s),M.tat,fo);
    const hand=new THREE.Group(); hand.position.y=-0.25; fo.add(hand);
    add(lpFin(lpLoft([[0.012,0.03,0.046,0.046],[-0.045,0.032,0.054,0.054],[-0.088,0.028,0.052,0.05]],8,{bot:true}),skin,0.08,55+s),M.c,hand);
    const fg=new THREE.Group(); fg.position.y=-0.084; fg.rotation.z=s*0.42; hand.add(fg);
    add(lpFin(lpLoft([[0.006,0.024,0.05,0.05],[-0.045,0.022,0.048,0.046],[-0.078,0.018,0.04,0.038]],8,{bot:true}),skin,0.07,56+s),M.fing,fg);
    const th=add(lpFin(lpLoft([[0,0.015,0.015,0.015],[-0.055,0.012,0.012,0.012]],6,{bot:true}),skin,0.08,57+s),M.c,hand,-s*0.012,-0.03,0.04); th.rotation.set(0.5,0,-s*0.3);
    a.userData={fo,hand}; arms.push(a); }
  const parts={root,body,chest,head,legL:legs[0],legR:legs[1],armL:arms[0],armR:arms[1],fem:false,look:L0,spine:null,skirt:null,S:1.14,cid:id,lp:1};
  poseChar(parts,opts.pose||'idle',0);
  if(opts.knife){ const k=buildKnifeModel(opts.knife,false); k.scale.setScalar(1.2); k.rotation.set(-Math.PI/2+0.25,0,0); k.position.set(0,-0.05,0.02); arms[1].userData.hand.add(k); parts.knife=k; }
  root.userData=parts; return root; }
const LP_BUILD={'moreira:u':lpSarge};
{ const bc1=buildChar; buildChar=function(id,vk,opts){ const C=CHARS[id]; const k=id+':'+(vk&&C&&C.vars[vk]?vk:(C?varKeys(id)[0]:vk)); const f=LPX.on&&!CHX.skip&&LP_BUILD[k];
    if(!f) return bc1.apply(this,arguments);
    try{ const L=C.vars[k.split(':')[1]].look; const r=f(id,k.split(':')[1],L,opts||{}); try{ chxSkin(r); }catch(e){ console.warn('[Bunker] low poly sem malha única',e); } return r; }
    catch(e){ console.warn('[Bunker] personagem low poly',e); return bc1.apply(this,arguments); } }; }
CMDS.lowpoly={cheat:1,d:'lowpoly [on|off] · personagens no estilo low poly novo (sargento)',f:a=>{ LPX.on=(a[0]||'on')!=='off'; cprint('low poly: '+(LPX.on?'ligado':'desligado')); }};
