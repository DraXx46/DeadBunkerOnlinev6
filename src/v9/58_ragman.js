/* ================= v9 · PARQUE 4FUN · LABORATÓRIO DE FÍSICA: o homem de testes =================
   Corpo humano inteiro simulado (não é zumbi, não ataca): 17 partículas com massa real, ossos rígidos,
   articulações com limite (joelho e cotovelo só dobram para o lado certo, coluna dobra e torce pouco, quadril
   não cruza), colisão com o chão com atrito e com o próprio tronco, colisão com o jogador.
   "IA" de equilíbrio ativa: músculos seguram a postura em cima dos pés; o centro de massa e o ponto de captura
   decidem quando dar um passo para não cair; se o empurrão é grande, a perna falha ou o sangue acaba, ele cai.
   Reage aos tiros: impulso no ponto exato, recuo de dor, curva o corpo e leva a mão ao ferimento (a mão
   tampando reduz o jato). Sangue sai pulsando com o coração, pinga, mancha o chão e faz poça.
   Gore: membros arrancados nas articulações (com coto, osso e artéria), cabeça explode, barriga abre com órgãos
   e intestino com física pendurado, peito abre mostrando costelas, pulmões e coração batendo. */
const RMV=new THREE.Vector3(), RMV2=new THREE.Vector3(), RMV3=new THREE.Vector3(), RMQ=new THREE.Quaternion(), RMM=new THREE.Matrix4(), RMO=new THREE.Object3D();
// nome, x,y,z (em pé, olhando +z, +x = lado esquerdo dele), massa, raio de colisão
const RMP=[['head',0,1.66,0.01,5,0.11],['neck',0,1.47,0,4,0.06],['spine',0,1.18,0.01,14,0.12],
  ['shL',0.185,1.44,0,5,0.06],['shR',-0.185,1.44,0,5,0.06],['hipL',0.095,0.94,0,9,0.08],['hipR',-0.095,0.94,0,9,0.08],
  ['elL',0.215,1.16,-0.02,2,0.045],['elR',-0.215,1.16,-0.02,2,0.045],['haL',0.225,0.9,0.03,0.8,0.04],['haR',-0.225,0.9,0.03,0.8,0.04],
  ['knL',0.1,0.51,0.03,4.5,0.055],['knR',-0.1,0.51,0.03,4.5,0.055],['anL',0.1,0.08,0,1.5,0.045],['anR',-0.1,0.08,0,1.5,0.045],
  ['toL',0.11,0.03,0.17,0.7,0.035],['toR',-0.11,0.03,0.17,0.7,0.035]];
// [a,b,rigidez,min,max] (min/max = fração do comprimento de repouso; sem min/max = osso rígido)
const RMC=[[1,3,1],[1,4,1],[3,4,1],[2,3,1],[2,4,1],[2,1,1],[5,6,1],[2,5,1],[2,6,1],
  [3,5,0.5,0.86,1.06],[4,6,0.5,0.86,1.06],[3,6,0.5,0.9,1.05],[4,5,0.5,0.9,1.05],
  [0,1,1],[0,3,0.6,0.86,1.08],[0,4,0.6,0.86,1.08],[0,2,0.6,0.93,1.02],
  [3,7,1],[7,9,1],[3,9,0.9,0.32,1],[4,8,1],[8,10,1],[4,10,0.9,0.32,1],
  [5,11,1],[11,13,1],[5,13,0.9,0.42,1],[6,12,1],[12,14,1],[6,14,0.9,0.42,1],
  [13,15,1],[14,16,1],[11,15,0.8,0.86,1.05],[12,16,0.8,0.86,1.05],
  [11,6,0.5,0.75,1.6],[12,5,0.5,0.75,1.6],[11,12,0.4,0.35,9],[13,14,0.4,0.3,9],[9,10,0.3,0.25,99]];
// articulações que podem ser arrancadas: partícula da junta e o que vai junto
const RMJ={shL:{p:3,set:[7,9]},shR:{p:4,set:[8,10]},elL:{p:7,set:[9]},elR:{p:8,set:[10]},
  hipL:{p:5,set:[11,13,15]},hipR:{p:6,set:[12,14,16]},knL:{p:11,set:[13,15]},knR:{p:12,set:[14,16]},neck:{p:1,set:[0]}};
const RM={built:false,on:false,g:null,dyn:null,p:[],c:[],segs:[],st:'stand',blood:100,flinch:0,hunch:0,wounds:[],acc:{},shot:-1,legs:[1,1],
  t:0,acc2:0,plant:[null,null],step:null,yaw:0,deadT:0,headGone:false,openB:false,openC:false,gut:null,det:new Set(),fallT:0,writheT:0,lastHit:-9,steps:[],
  drops:[],splat:0,pools:[],gibs:[],marks:[],x:0,z:0,yaw0:0};
const RMK=[0.05,0.06,0.06,0.06,0.06,0.06,0.06,0.025,0.025,0.02,0.02,0.05,0.05,0,0,0,0];
function rmMat(c,o){ return new THREE.MeshPhongMaterial(Object.assign({color:c,shininess:12},o||{})); }
const RMMAT={};
function rmMats(){ if(RMMAT.skin) return RMMAT; Object.assign(RMMAT,{skin:rmMat(0xd9a982,{emissive:0x2a1e16}),shirt:rmMat(0x8fb3cf,{emissive:0x1a222a}),jeans:rmMat(0x3a4d6e,{emissive:0x0e1420}),shoe:rmMat(0x3a2a1e,{shininess:30}),hair:rmMat(0x2a1d14),
  eye:rmMat(0x15100c,{shininess:80}),flesh:rmMat(0x8a1414,{shininess:60}),cav:new THREE.MeshPhongMaterial({color:0x4a0808,shininess:50,side:THREE.BackSide}),bone:rmMat(0xe9e0cf,{shininess:30}),
  gut:rmMat(0xc27a74,{shininess:90,specular:0x664444}),liver:rmMat(0x5a1212,{shininess:80}),stom:rmMat(0xc48a86,{shininess:80}),lung:rmMat(0xd29a9a,{shininess:60}),heart:rmMat(0x8a0f12,{shininess:90}),
  brain:rmMat(0xd8a6a0,{shininess:60}),wound:new THREE.MeshBasicMaterial({color:0x2a0000}),stain:new THREE.MeshBasicMaterial({color:0x6a0606,transparent:true,opacity:0.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),
  drop:new THREE.MeshBasicMaterial({color:0x8a0000}),splat:new THREE.MeshBasicMaterial({color:0x520202,transparent:true,opacity:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}),
  pool:new THREE.MeshPhongMaterial({color:0x6a0606,emissive:0x2a0000,shininess:120,specular:0x664444,transparent:true,opacity:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4})}); return RMMAT; }
// sólido de revolução com perfil [raio,altura] em metros, achatado em z
function rmLathe(prof,mat,zs,phiS,phiL,seg){ const pts=prof.map(([r,y])=>new THREE.Vector2(Math.max(0.0001,r),y)); const g=new THREE.LatheGeometry(pts,seg||16,phiS||0,phiL||Math.PI*2); if(zs&&zs!==1) g.scale(1,1,zs); g.computeVertexNormals(); return new THREE.Mesh(g,mat); }
function rmCap(L,r0,r1,mat,bulge){ const b=bulge||0; return rmLathe([[0,0],[r0*0.7,0.004],[r0,0.02],[(r0+r1)/2+b,L*0.45],[r1,L-0.02],[r1*0.7,L-0.004],[0,L]],mat,1,0,0,14); }
function rmSph(r,mat,sx,sy,sz){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat); m.scale.set(sx||1,sy||1,sz||1); return m; }
const rmHC=()=>{ const a=RM.p[5], b=RM.p[6]; return RMV3.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2); };
function rmPt(e,out){ if(Array.isArray(e)){ const a=RM.p[e[0]], b=RM.p[e[1]]; return out.set((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2); } const p=RM.p[e]; return out.set(p.x,p.y,p.z); }

/* ---------- visual: cada segmento é um "quadro" (origem na junta A, eixo y até B, x = esquerda do corpo) ---------- */
function rmBuildBody(){ const M=rmMats(); const segs=[];
  const S=(name,a,b,r,part,side,build)=>{ const f=new THREE.Group(); build(f); RM.g.add(f); const s={name,a,b,r,part,side,f,L:0,hide:[]}; segs.push(s); return s; };
  // pescoço + cabeça (cabeça centrada na partícula da cabeça = fim do segmento)
  S('head',1,0,0.115,'head',0,f=>{ const L=0.19; const n=rmCap(L,0.055,0.05,M.skin); f.add(n);
    const h=new THREE.Group(); h.position.y=L; f.add(h); RM.headG=h;
    h.add(rmSph(0.1,M.skin,0.92,1.12,1)); const hair=rmSph(0.104,M.hair,0.95,0.9,1.02); hair.position.set(0,0.03,-0.012); h.add(hair);
    const jaw=rmSph(0.07,M.skin,1.05,0.8,1); jaw.position.set(0,-0.06,0.025); h.add(jaw);
    const nose=new THREE.Mesh(new THREE.ConeGeometry(0.016,0.04,8),M.skin); nose.rotation.x=Math.PI/2; nose.position.set(0,-0.005,0.105); h.add(nose);
    for(const sx of [-1,1]){ const e=rmSph(0.012,M.eye); e.position.set(sx*0.035,0.022,0.088); h.add(e); const ear=rmSph(0.025,M.skin,0.45,1,0.8); ear.position.set(sx*0.093,0,0); h.add(ear); } });
  S('chest',2,1,0.15,'chest',0,f=>{ const prof=[[0.158,0],[0.17,0.08],[0.18,0.18],[0.17,0.25],[0.12,0.29],[0.0001,0.295]];
    const back=rmLathe(prof,M.shirt,0.62,Math.PI/2,Math.PI); f.add(back); const front=rmLathe(prof,M.shirt,0.62,-Math.PI/2,Math.PI); f.add(front); RM.chestFront=front;
    const cav=rmLathe(prof.map(([r,y])=>[r*0.93,y]),M.cav,0.62,0,Math.PI*2); cav.visible=false; f.add(cav);
    const org=new THREE.Group(); org.visible=false; f.add(org); RM.chestOrg=org; RM.chestCav=cav;
    for(const sx of [-1,1]){ const l=rmSph(0.065,M.lung,1,1.9,0.85); l.position.set(sx*0.075,0.16,-0.005); org.add(l); }
    const ht=rmSph(0.045,M.heart,1,1.25,0.95); ht.position.set(0.025,0.12,0.04); ht.rotation.z=-0.4; org.add(ht); RM.heart=ht;
    for(let i=0;i<6;i++){ const y=0.04+i*0.045, r=0.165-Math.abs(i-2.5)*0.006; const rb=new THREE.Mesh(new THREE.TorusGeometry(r,0.007,5,16,Math.PI),M.bone); rb.rotation.x=Math.PI/2; rb.scale.set(1,0.62,1); rb.position.y=y; org.add(rb); }
    const st=new THREE.Mesh(new THREE.BoxGeometry(0.025,0.2,0.012),M.bone); st.position.set(0,0.15,0.1); st.visible=false; org.add(st); });
  S('belly',[5,6],2,0.14,'belly',0,f=>{ const prof=[[0.0001,-0.11],[0.12,-0.1],[0.15,-0.04],[0.152,0.02],[0.145,0.12],[0.15,0.2],[0.158,0.245]];
    const jprof=prof.filter(([r,y])=>y<=0.03); const jb=rmLathe(jprof.concat([[0.153,0.035]]),M.jeans,0.66); f.add(jb);
    const sp=prof.filter(([r,y])=>y>=0.02); const back=rmLathe(sp,M.shirt,0.64,Math.PI/2,Math.PI); f.add(back); const front=rmLathe(sp,M.shirt,0.64,-Math.PI/2,Math.PI); f.add(front); RM.bellyFront=front;
    const cav=rmLathe(sp.map(([r,y])=>[r*0.93,y]),M.cav,0.64); cav.visible=false; f.add(cav); RM.bellyCav=cav;
    const org=new THREE.Group(); org.visible=false; f.add(org); RM.bellyOrg=org;
    const lv=rmSph(0.07,M.liver,1.3,0.6,0.7); lv.position.set(-0.05,0.19,0.02); org.add(lv);
    const sto=rmSph(0.05,M.stom,1.2,0.9,0.8); sto.position.set(0.06,0.18,0.03); org.add(sto);
    const pts=[]; for(let row=0;row<6;row++){ const y=0.14-row*0.025; for(let k=0;k<=8;k++){ const u=row%2?1-k/8:k/8; pts.push(new THREE.Vector3((u-0.5)*0.2,y+Math.sin(k*1.7+row)*0.008,0.03+Math.sin(k*2.3+row*1.3)*0.018)); } }
    org.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),160,0.017,7,false),M.gut)); });
  for(const [sd,a,b,e,h,kn,an,to] of [[1,3,5,7,9,11,13,15],[-1,4,6,8,10,12,14,16]]){ const s=sd>0?'L':'R';
    S('uarm'+s,a,e,0.05,'arm',sd,f=>{ const L=0.283; f.add(rmCap(L,0.05,0.04,M.skin,0.004)); const sl=rmCap(0.13,0.058,0.052,M.shirt); sl.position.y=-0.01; f.add(sl); f.add(rmSph(0.064,M.shirt)); });
    S('farm'+s,e,h,0.042,'arm',sd,f=>{ const L=0.262; f.add(rmCap(L,0.04,0.031,M.skin,0.005)); f.add(rmSph(0.041,M.skin));
      const hd=new THREE.Mesh(new THREE.BoxGeometry(0.034,0.1,0.075),M.skin); hd.position.set(0,L+0.055,0); f.add(hd);
      const th=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.05,0.02),M.skin); th.position.set(-sd*0.004,L+0.03,0.045); th.rotation.x=0.4; f.add(th); });
    S('thigh'+s,b,kn,0.08,'leg',sd,f=>{ const L=0.432; f.add(rmCap(L,0.085,0.056,M.jeans,0.006)); f.add(rmSph(0.09,M.jeans)); });
    S('shin'+s,kn,an,0.055,'leg',sd,f=>{ const L=0.432; f.add(rmCap(L,0.056,0.042,M.jeans,0.006)); f.add(rmSph(0.058,M.jeans)); });
    S('foot'+s,an,to,0.045,'foot',sd,f=>{ const sh=new THREE.Mesh(new THREE.BoxGeometry(0.095,0.2,0.07),M.shoe); sh.position.set(0,0.07,-0.04); sh.rotation.x=0.29; f.add(sh); f.add(rmSph(0.046,M.shoe)); }); }
  return segs; }
function rmFrame(s){ const A=rmPt(s.a,RMV), B=rmPt(s.b,RMV2); const y=B.clone().sub(A); const L=y.length()||1; y.divideScalar(L);
  const pL=RM.p[3], pR=RM.p[4], hL=RM.p[5], hR=RM.p[6]; const lower=s.part==='leg'||s.part==='foot'||s.part==='belly';
  const x=lower?new THREE.Vector3(hL.x-hR.x,hL.y-hR.y,hL.z-hR.z):new THREE.Vector3(pL.x-pR.x,pL.y-pR.y,pL.z-pR.z);
  if(s.part==='foot'){ x.set(0,1,0); }   // pé: "esquerda" vira o "para cima" do pé
  x.addScaledVector(y,-x.dot(y)); if(x.lengthSq()<1e-6) x.set(1,0,0).addScaledVector(y,-y.x); x.normalize(); const z=new THREE.Vector3().crossVectors(x,y);
  if(s.part==='foot'){ RMM.makeBasis(z.clone().negate(),y,x); } else RMM.makeBasis(x,y,z);
  s.f.position.copy(A); s.f.quaternion.setFromRotationMatrix(RMM); s.L=L; }

/* ---------- montagem do lugar (placa, palco e botão de reset) ---------- */
function rmBuild(){ if(RM.built) return; RM.built=true; rmMats();
  RM.x=FX(13)-3; RM.z=FZ(44); RM.yaw0=Math.PI/2;
  const root=MAPG.fun; RM.g=new THREE.Group(); root.add(RM.g); RM.dyn=new THREE.Group(); root.add(RM.dyn);
  const pad=new THREE.Mesh(new THREE.CircleGeometry(4.2,48),new THREE.MeshBasicMaterial({color:0x1e0a2a})); pad.rotation.x=-Math.PI/2; pad.position.set(RM.x,0.012,RM.z); root.add(pad);
  const ring=new THREE.Mesh(new THREE.RingGeometry(4.1,4.25,64),funGlow(NEON.green)); ring.rotation.x=-Math.PI/2; ring.position.set(RM.x,0.02,RM.z); root.add(ring);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(5.4,1.1),funSign('LAB DE FÍSICA',5.4,1.1,'#4bff8a')); sg.position.set(RM.x-4.6,3.1,RM.z); sg.rotation.y=Math.PI/2; root.add(sg);
  neonBar(root,[RM.x-4.6,0,RM.z-2.6],[RM.x-4.6,3.6,RM.z-2.6],NEON.green,0.06); neonBar(root,[RM.x-4.6,0,RM.z+2.6],[RM.x-4.6,3.6,RM.z+2.6],NEON.green,0.06);
  // console com botão vermelho
  const bx=RM.x+2.4, bz=RM.z-3.2; const cg=G3(bx,0,bz); const ped=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.0,0.5),funMat(0x2a2a34)); ped.position.y=0.5; cg.add(ped);
  const top=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.08,0.62),funMat(0xffe14a,{e:0x302800})); top.position.y=1.04; cg.add(top);
  const btn=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,0.09,20),new THREE.MeshPhongMaterial({color:0xff1a1a,emissive:0x550000,shininess:90})); btn.position.y=1.12; cg.add(btn); RM.btn=btn;
  const lb=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.35),funSign('RESETAR',1.4,0.35,'#ff4040')); lb.position.set(0,1.55,0); lb.rotation.y=Math.PI*0.75; cg.add(lb); root.add(cg);
  funItem('rmreset',bx,bz,1.5,'Resetar o homem do laboratório',()=>{ rmReset(); btn.position.y=1.09; setTimeout(()=>btn.position.y=1.12,180); try{ Snd.ui('select'); }catch(e){} });
  RM.segs0=rmBuildBody();
  // gotas e manchas no chão (instanciadas)
  RM.dropIM=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,4),RMMAT.drop,1400); RM.dropIM.count=0; RM.dropIM.frustumCulled=false; root.add(RM.dropIM);
  RM.splIM=new THREE.InstancedMesh(new THREE.CircleGeometry(1,11),RMMAT.splat,700); RM.splIM.count=0; RM.splIM.frustumCulled=false; root.add(RM.splIM);
  rmReset(); }
function rmReset(){ if(!RM.built) return;
  const c=Math.cos(RM.yaw0), s=Math.sin(RM.yaw0);
  RM.p=RMP.map(([n,x,y,z,m,r])=>{ const wx=RM.x+x*c+z*s, wz=RM.z-x*s+z*c; return {n,x:wx,y,z:wz,ox:wx,oy:y,oz:wz,m,im:1/m,r,pin:false}; });
  RM.c=RMC.map(([a,b,k,lo,hi])=>{ const A=RM.p[a], B=RM.p[b]; const L=Math.hypot(A.x-B.x,A.y-B.y,A.z-B.z); return {a,b,k,L,lo:lo==null?1:lo,hi:hi==null?1:hi}; });
  RM.segs=RM.segs0; for(const sg of RM.segs){ const d=RMP_SEG0[sg.name]; sg.a=Array.isArray(d[0])?d[0].slice():d[0]; sg.b=d[1]; sg.gone=false; sg.f.visible=true; sg.f.traverse(o=>{ if(o.userData.hid) { o.visible=true; o.userData.hid=false; } }); }
  RM.chestFront.visible=RM.bellyFront.visible=true; RM.chestOrg.visible=RM.bellyOrg.visible=RM.chestCav.visible=RM.bellyCav.visible=false; RM.headG.visible=true;
  for(const m of RM.marks) m.parent&&m.parent.remove(m); RM.marks=[];
  while(RM.dyn.children.length) RM.dyn.remove(RM.dyn.children[0]);
  RM.st='stand'; RM.blood=100; RM.flinch=0; RM.hunch=0; RM.wounds=[]; RM.acc={}; RM.legs=[1,1]; RM.step=null; RM.yaw=RM.yaw0; RM.deadT=0; RM.headGone=false; RM.openB=false; RM.openC=false; RM.gut=null; RM.det=new Set(); RM.fallT=0; RM.lastHit=-9; RM.steps=[];
  RM.drops.length=0; RM.dropIM.count=0; RM.splat=0; RM.splIM.count=0; for(const p of RM.pools) RM.g.parent.remove(p.m); RM.pools=[]; RM.gibs=[]; RM.dead=false;
  RM.plant=[rmFoot(13,15),rmFoot(14,16)]; RM.on=true; }
const RMP_SEG0={head:[1,0],chest:[2,1],belly:[[5,6],2],uarmL:[3,7],farmL:[7,9],thighL:[5,11],shinL:[11,13],footL:[13,15],uarmR:[4,8],farmR:[8,10],thighR:[6,12],shinR:[12,14],footR:[14,16]};
function rmFoot(a,t){ const A=RM.p[a], T=RM.p[t]; return {a,t,ax:A.x,ay:A.y,az:A.z,tx:T.x,ty:T.y,tz:T.z}; }

/* ---------- física ---------- */
const RM_DT=1/120;
function rmCom(){ let m=0,x=0,y=0,z=0,vx=0,vz=0; RM.p.forEach((p,i)=>{ if(RM.det.has(i)) return; m+=p.m; x+=p.x*p.m; y+=p.y*p.m; z+=p.z*p.m; vx+=(p.x-p.ox)*p.m; vz+=(p.z-p.oz)*p.m; }); return {x:x/m,y:y/m,z:z/m,vx:vx/m/RM_DT,vz:vz/m/RM_DT}; }
function rmBasis(){ const pL=RM.p[3], pR=RM.p[4], h=rmHC(); const n=RM.p[1];
  const l=new THREE.Vector3(pL.x-pR.x,pL.y-pR.y,pL.z-pR.z).normalize(), u=new THREE.Vector3(n.x-h.x,n.y-h.y,n.z-h.z).normalize(); const f=new THREE.Vector3().crossVectors(l,u).normalize(); return {l,u,f}; }
function rmImpulse(i,vx,vy,vz){ const p=RM.p[i]; if(!p) return; p.ox-=vx*RM_DT; p.oy-=vy*RM_DT; p.oz-=vz*RM_DT; }
function rmLocal(x,y,z,out){ const c=Math.cos(RM.yaw), s=Math.sin(RM.yaw); out.x=x*c+z*s; out.y=y; out.z=-x*s+z*c; return out; }
function rmWoundPos(w,out){ const s=w.seg; s.f.updateMatrixWorld(); return out.copy(w.lp).applyMatrix4(s.f.matrixWorld); }
function rmGuard(){ // feridas que as mãos tampam: a mais recente que não esteja no próprio braço
  const ok=w=>!w.dead&&!w.seg.gone&&w.seg.part!=='head'&&w.seg.part!=='foot'&&!w.stump;
  const L=[]; for(let k=RM.wounds.length-1;k>=0&&L.length<6;k--) if(ok(RM.wounds[k])) L.push(RM.wounds[k]);
  const res=[null,null];
  for(const hi of [0,1]){ if(RM.det.has(hi?10:9)||RM.det.has(hi?8:7)) continue; const side=hi?-1:1;
    const c=L.filter(w=>!(w.seg.part==='arm'&&w.seg.side===side)); res[hi]=c.find(w=>w!==res[0])||c.find(w=>w.seg.part==='belly'||w.seg.part==='chest')||null; }
  return res; }
// puxão muscular interno: o que move a mão empurra o corpo de volta (conserva o momento, nada se autopropele)
function rmPull(i,tx,ty,tz,k,react){ const p=RM.p[i]; const dx=(tx-p.x)*k, dy=(ty-p.y)*k, dz=(tz-p.z)*k; p.x+=dx; p.y+=dy; p.z+=dz;
  let M=0; for(const j of react) M+=RM.p[j].m; if(M<=0) return; const f=p.m/M; for(const j of react){ const q=RM.p[j]; q.x-=dx*f; q.y-=dy*f; q.z-=dz*f; } }
function rmSegIdx(s){ return (Array.isArray(s.a)?s.a:[s.a]).concat([s.b]); }
function rmStep(dt){ const P0=RM.p, n=P0.length, alive=RM.st!=='dead';
  for(const p of P0){ if(p.pin) continue; const vx=(p.x-p.ox)*0.997, vy=(p.y-p.oy)*0.997, vz=(p.z-p.oz)*0.997; p.ox=p.x; p.oy=p.y; p.oz=p.z; p.x+=vx; p.y+=vy-9.8*dt*dt; p.z+=vz; }
  // ---------- controle muscular / equilíbrio ----------
  const standing=RM.st==='stand';
  const guard=alive?rmGuard():[null,null]; RM._guard=guard;
  if(standing){ const legs=Math.min(RM.legs[0],RM.legs[1]); const m=Math.max(0,1-RM.flinch*0.75)*clamp(RM.blood/55,0.35,1)*(0.55+0.45*legs);
    const sup=rmSupport(); const crouch=(1-legs)*0.18+RM.hunch*0.08, hunch=RM.hunch;
    const breath=Math.sin(RM.t*1.7)*0.006; const look=rmLook();
    for(let i=0;i<13;i++){ if(RM.det.has(i)) continue; const k=RMK[i]*m; if(k<=0) continue; const d=RMP[i]; let x=d[1], y=d[2], z=d[3];
      if(i<=6||i===11||i===12){ if(i!==11&&i!==12){ y-=crouch*0.32; z-=crouch*0.05; } else { y-=crouch*0.16; z+=crouch*0.2; } }
      if(i<=4||i===7||i===8){ const up=(y-0.95)/0.7; z+=hunch*0.24*up; y-=hunch*0.1*up; y+=breath*(i<=4?1:0); }
      if(i===0){ x+=look.x; z+=look.z+hunch*0.08; y+=look.y; }
      const hi=i===9?0:i===10?1:-1; if(hi>=0&&guard[hi]) continue; if((i===7&&guard[0])||(i===8&&guard[1])) continue;
      rmLocal(x,y,z,RMV); const p=P0[i]; p.x+=(sup.x+RMV.x-p.x)*k; p.y+=(RMV.y-p.y)*k; p.z+=(sup.z+RMV.z-p.z)*k; }
  }
  // mãos no ferimento (em pé ou caído, enquanto vivo)
  if(alive) for(const hi of [0,1]){ const w=guard[hi]; if(!w) continue; rmWoundPos(w,RMV); const k=RM.st==='stand'?0.18:0.07; RMV.addScaledVector(w.wn,0.035);
    const re=rmSegIdx(w.seg).filter(j=>j!==9&&j!==10&&j!==7&&j!==8); rmPull(hi?10:9,RMV.x,RMV.y,RMV.z,k,re.length?re:[2]); }
  // caindo: braços protegem (vão na direção da queda)
  if(RM.st==='fall'&&RM.fallT<0.8&&alive){ const c=rmCom(); const fx=c.vx, fz=c.vz, L=Math.hypot(fx,fz)||1; for(const i of [9,10]) if(!RM.det.has(i)&&!guard[i-9]) rmPull(i,c.x+fx/L*0.6,0.1,c.z+fz/L*0.6,0.03,[2,3,4,1]); }
  // caído e vivo: encolhe as pernas devagar (dor)
  if(RM.st==='down'&&alive&&RM.blood>15){ const b=rmBasis(); const h=rmHC(); for(const i of [11,12]) if(!RM.det.has(i)){ const hx=h.x, hy=h.y, hz=h.z; rmPull(i,hx+b.f.x*0.3-b.u.x*0.25,hy+b.f.y*0.3-b.u.y*0.25,hz+b.f.z*0.3-b.u.z*0.25,0.004,[5,6,2]); } }
  // ---------- passo (pé que está no ar segue um arco até o alvo) ----------
  if(standing&&RM.step){ const S=RM.step; S.s=Math.min(1,S.s+dt/S.dur); const e=S.s*S.s*(3-2*S.s), lift=Math.sin(Math.PI*S.s)*0.13;
    const f=RM.plant[S.f]; const A=P0[f.a], T=P0[f.t];
    A.x=S.ax+(S.bx-S.ax)*e; A.z=S.az+(S.bz-S.az)*e; A.y=0.08+lift; T.x=S.tax+(S.tbx-S.tax)*e; T.z=S.taz+(S.tbz-S.taz)*e; T.y=0.03+lift*0.7;
    if(S.s>=1){ RM.plant[S.f]=rmFoot(f.a,f.t); RM.plant[S.f].ay=0.08; RM.plant[S.f].ty=0.03; RM.step=null; } }
  // ---------- restrições ----------
  for(let it=0;it<10;it++){
    for(const c of RM.c){ const A=P0[c.a], B=P0[c.b]; const dx=B.x-A.x, dy=B.y-A.y, dz=B.z-A.z; const L=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-6;
      const tg=L<c.L*c.lo?c.L*c.lo:L>c.L*c.hi?c.L*c.hi:L; if(tg===L) continue; const w=A.im+B.im; if(w<=0) continue; const f=(L-tg)/L*c.k;
      const fa=A.pin?0:A.im/w, fb=B.pin?0:B.im/w; A.x+=dx*f*fa; A.y+=dy*f*fa; A.z+=dz*f*fa; B.x-=dx*f*fb; B.y-=dy*f*fb; B.z-=dz*f*fb; }
    rmHinges(); rmSelfCol();
    if(standing){ for(let fi=0;fi<2;fi++){ if(RM.step&&RM.step.f===fi) continue; const f=RM.plant[fi]; if(!f||RM.det.has(f.a)) continue; const A=P0[f.a], T=P0[f.t]; A.x=f.ax; A.y=f.ay; A.z=f.az; T.x=f.tx; T.y=f.ty; T.z=f.tz; } }
    for(const p of P0){ if(p.y<p.r){ p.y=p.r; } }
    rmPlayerPush(); }
  // atrito com o chão
  for(const p of P0){ if(p.y<=p.r+0.004){ const fr=RM.st==='stand'?0.5:0.35; p.ox+=(p.x-p.ox)*fr; p.oz+=(p.z-p.oz)*fr; if(p.oy<p.y) p.oy=p.y-(p.y-p.oy)*0.2; } }
  if(standing) for(let fi=0;fi<2;fi++){ if(RM.step&&RM.step.f===fi) continue; const f=RM.plant[fi]; if(!f) continue; const A=P0[f.a], T=P0[f.t]; A.ox=A.x; A.oy=A.y; A.oz=A.z; T.ox=T.x; T.oy=T.y; T.oz=T.z; }
  // intestino (corda com física)
  if(RM.gut) rmGutStep(dt);
}
function rmHinges(){ const P0=RM.p;
  for(const [k,h,a,t] of [[11,5,13,15],[12,6,14,16]]){ if(RM.det.has(k)!==RM.det.has(h)||RM.det.has(a)!==RM.det.has(k)) continue;
    const H=P0[h], K=P0[k], A=P0[a], T=P0[t]; let ux=A.x-H.x, uy=A.y-H.y, uz=A.z-H.z; const ul=Math.hypot(ux,uy,uz)||1; ux/=ul; uy/=ul; uz/=ul;
    let vx=K.x-H.x, vy=K.y-H.y, vz=K.z-H.z; const vd=vx*ux+vy*uy+vz*uz; vx-=ux*vd; vy-=uy*vd; vz-=uz*vd;
    let tx=T.x-A.x, ty=T.y-A.y, tz=T.z-A.z; const td=tx*ux+ty*uy+tz*uz; tx-=ux*td; ty-=uy*td; tz-=uz*td; const tl=Math.hypot(tx,ty,tz); if(tl<1e-4) continue; tx/=tl; ty/=tl; tz/=tl;
    const s=vx*tx+vy*ty+vz*tz; if(s<0.012){ const d=0.012-s; K.x+=tx*d; K.y+=ty*d; K.z+=tz*d; } }
  const b=rmBasis();
  for(const [e,sh,h,sd] of [[7,3,9,1],[8,4,10,-1]]){ if(RM.det.has(e)!==RM.det.has(h)||RM.det.has(e)!==RM.det.has(sh)) continue;
    const S=P0[sh], E=P0[e], H=P0[h]; let ux=H.x-S.x, uy=H.y-S.y, uz=H.z-S.z; const ul=Math.hypot(ux,uy,uz)||1; ux/=ul; uy/=ul; uz/=ul;
    let rx=-b.f.x-b.u.x*0.5+b.l.x*sd*0.25, ry=-b.f.y-b.u.y*0.5+b.l.y*sd*0.25, rz=-b.f.z-b.u.z*0.5+b.l.z*sd*0.25; const rd=rx*ux+ry*uy+rz*uz; rx-=ux*rd; ry-=uy*rd; rz-=uz*rd; const rl=Math.hypot(rx,ry,rz); if(rl<1e-4) continue; rx/=rl; ry/=rl; rz/=rl;
    let vx=E.x-S.x, vy=E.y-S.y, vz=E.z-S.z; const vd=vx*ux+vy*uy+vz*uz; vx-=ux*vd; vy-=uy*vd; vz-=uz*vd; const s=vx*rx+vy*ry+vz*rz; if(s<0.006){ const d=0.006-s; E.x+=rx*d; E.y+=ry*d; E.z+=rz*d; } } }
function rmSelfCol(){ const P0=RM.p; const h=rmHC(); const n=P0[1]; const ax=h.x, ay=h.y, az=h.z, bx=n.x-ax, by=n.y-ay, bz=n.z-az; const bl2=bx*bx+by*by+bz*bz||1;
  for(const i of [7,8,9,10,11,12,13,14,15,16]){ if(RM.det.has(i)) continue; const p=P0[i]; let t=((p.x-ax)*bx+(p.y-ay)*by+(p.z-az)*bz)/bl2; if(t<0.05||t>1.05) continue; t=Math.min(1,t);
    const cx_=ax+bx*t, cy=ay+by*t, cz=az+bz*t; let dx=p.x-cx_, dy=p.y-cy, dz=p.z-cz; const d=Math.hypot(dx,dy,dz), R=0.125+p.r; if(d<R&&d>1e-5){ const k=(R-d)/d; p.x+=dx*k; p.y+=dy*k; p.z+=dz*k; } } }
function rmPlayerPush(){ if(!P||!P.pos) return; const px=P.pos.x, pz=P.pos.z, py=(P.y||0); for(const p of RM.p){ if(p.y<py-0.05||p.y>py+1.85) continue; const dx=p.x-px, dz=p.z-pz, d=Math.hypot(dx,dz), R=0.34+p.r; if(d<R&&d>1e-4){ const k=(R-d)/d; p.x+=dx*k; p.z+=dz*k; } } }
function rmSupport(){ const pl=RM.plant, S=RM.step; let x=0,z=0,n=0; for(let fi=0;fi<2;fi++){ const f=pl[fi]; if(!f||RM.det.has(f.a)) continue;
    if(S&&S.f===fi){ x+=(S.bx+S.tbx)/2; z+=(S.bz+S.tbz)/2; } else { x+=(f.ax+f.tx)/2; z+=(f.az+f.tz)/2; } n++; }
  if(!n){ const c=rmCom(); return {x:c.x,z:c.z}; }
  // o pé tem o calcanhar atrás e a ponta na frente: o "centro" da pose fica um pouco atrás do meio do pé
  rmLocal(0,0,-0.07,RMV); return {x:x/n+RMV.x,z:z/n+RMV.z}; }
function rmLook(){ if(!P||!P.pos) return {x:0,y:0,z:0}; const h=RM.p[0]; const dx=P.pos.x-h.x, dz=P.pos.z-h.z; const c=Math.cos(-RM.yaw), s=Math.sin(-RM.yaw); const lx=dx*c+dz*s, lz=-dx*s+dz*c; const a=Math.atan2(lx,lz);
  const k=Math.abs(a)<1.6?1:0; return {x:Math.sin(a)*0.03*k,y:0,z:0}; }
function rmBalance(dt){ if(RM.st!=='stand') return; const c=rmCom(); const sup=rmSupport();
  const cpx=c.x+c.vx*0.32, cpz=c.z+c.vz*0.32; const ex=cpx-sup.x, ez=cpz-sup.z, e=Math.hypot(ex,ez);
  const legs=Math.min(RM.legs[0],RM.legs[1]);
  if(RM.det.has(13)||RM.det.has(14)||RM.det.has(11)||RM.det.has(12)) return rmFall('perna');
  if(e>0.75||legs<0.22||RM.blood<38||c.y<0.62) return rmFall('equilibrio');
  RM.steps=RM.steps.filter(t=>RM.t-t<1.4); if(RM.steps.length>=5) return rmFall('tropeço');
  // calmo: vira devagar para o jogador
  if(RM.t-RM.lastHit>3&&P&&P.pos){ const want=Math.atan2(P.pos.x-RM.p[2].x,P.pos.z-RM.p[2].z); let d=want-RM.yaw; d=Math.atan2(Math.sin(d),Math.cos(d)); RM.yaw+=clamp(d,-0.5*dt,0.5*dt); }
  if(RM.step) return;
  let ox=sup.x, oz=sup.z, need=false; if(e>0.12){ const L=Math.min(e*1.2,0.55); ox=sup.x+ex/e*L; oz=sup.z+ez/e*L; need=true; }
  let best=-1, bd=0, tgt=null;
  for(let fi=0;fi<2;fi++){ const f=RM.plant[fi]; if(!f) continue; const sd=fi?-1:1; rmLocal(sd*0.1,0,0.07,RMV); const ax=ox+RMV.x, az=oz+RMV.z; rmLocal(sd*0.11,0,0.24,RMV2); const tx=ox+RMV2.x, tz=oz+RMV2.z;
    const d=Math.hypot(ax-f.ax,az-f.az)+Math.hypot(tx-f.tx,tz-f.tz)*0.5; if(d>bd){ bd=d; best=fi; tgt={ax,az,tx,tz}; } }
  if(best>=0&&(need&&bd>0.08||bd>0.22)){ const f=RM.plant[best]; RM.step={f:best,s:0,dur:need?clamp(0.34-e*0.15,0.2,0.34):0.42,ax:f.ax,az:f.az,bx:tgt.ax,bz:tgt.az,tax:f.tx,taz:f.tz,tbx:tgt.tx,tbz:tgt.tz}; RM.steps.push(RM.t); } }
function rmFall(why){ if(RM.st!=='stand') return; RM.st='fall'; RM.fallT=0; RM.step=null; try{ Snd.sample&&Snd.sample('body_fall',{vol:0.7,x:RM.p[2].x,z:RM.p[2].z,range:30}); }catch(e){} }
function rmKill(){ if(RM.st==='dead') return; if(RM.st==='stand') rmFall('morte'); RM.st='dead'; RM.deadT=0; }

/* ---------- tiros, explosões e gore ---------- */
function rmRay(o,d,maxT){ let best=null; for(const s of RM.segs){ if(s.gone) continue;
    if(s.name==='head'){ if(RM.headGone) { const A=rmPt(s.a,RMV); const h=rmRayCap(o,d,A,rmPt(s.b,RMV2),0.055,maxT); if(h&&(!best||h.t<best.t)) best={t:h.t,tc:h.tc,s}; continue; }
      const C=rmPt(s.b,RMV); const ox=o.x-C.x, oy=o.y-C.y, oz=o.z-C.z; const b=ox*d.x+oy*d.y+oz*d.z, cc=ox*ox+oy*oy+oz*oz-0.115*0.115, D=b*b-cc; if(D>=0){ const t=-b-Math.sqrt(D); if(t>0&&t<maxT&&(!best||t<best.t)) best={t,tc:1,s}; }
      const h=rmRayCap(o,d,rmPt(s.a,RMV),rmPt(s.b,RMV2),0.055,maxT); if(h&&(!best||h.t<best.t)) best={t:h.t,tc:h.tc*0.8,s}; continue; }
    let A=rmPt(s.a,RMV), B=rmPt(s.b,RMV2); if(s.part==='belly'){ A=A.clone(); A.y-=0.08; }
    if(s.name.startsWith('farm')){ B=B.clone().sub(A).multiplyScalar(1.38).add(A); }
    const h=rmRayCap(o,d,A,B,s.r,maxT); if(h&&(!best||h.t<best.t)) best={t:h.t,tc:h.tc,s}; }
  return best; }
function rmRayCap(o,d,A,B,r,maxT){ const ux=B.x-A.x, uy=B.y-A.y, uz=B.z-A.z; const wx=o.x-A.x, wy=o.y-A.y, wz=o.z-A.z;
  const b=d.x*ux+d.y*uy+d.z*uz, c=ux*ux+uy*uy+uz*uz, dd=d.x*wx+d.y*wy+d.z*wz, e=ux*wx+uy*wy+uz*wz; const den=c-b*b;
  let tc=den>1e-9?(e-b*dd)/den:0; tc=clamp(tc,0,1); let sc=b*tc-dd; if(sc<0) sc=0;
  const qx=wx+d.x*sc-ux*tc, qy=wy+d.y*sc-uy*tc, qz=wz+d.z*sc-uz*tc; const d2=qx*qx+qy*qy+qz*qz; if(d2>r*r) return null;
  const t=sc-Math.sqrt(r*r-d2); if(t<0||t>maxT) return null; return {t,tc}; }
function rmAddWound(s,hp,n,dmg,artery){ s.f.updateMatrixWorld(); const inv=RMM.copy(s.f.matrixWorld).invert(); const lp=hp.clone().applyMatrix4(inv);
  const ln=n.clone().transformDirection(inv); const w={seg:s,lp,ln,wn:n.clone(),rate:clamp(dmg/40,0.6,4)*(artery?2.6:1),artery,age:0,acc:0,dead:false};
  RM.wounds.push(w); if(RM.wounds.length>40) RM.wounds.shift();
  // marca na roupa/pele: furo escuro + mancha que cresce
  const M=rmMats(); const hole=new THREE.Mesh(new THREE.CircleGeometry(clamp(0.008+dmg/9000,0.008,0.03),10),M.wound); const st=new THREE.Mesh(new THREE.CircleGeometry(0.03,12),M.stain);
  for(const [m,o] of [[hole,0.004],[st,0.002]]){ m.position.copy(lp).addScaledVector(ln,o); m.lookAt(RMV.copy(m.position).add(ln)); s.f.add(m); RM.marks.push(m); }
  w.stain=st; return w; }
function rmSpray(x,y,z,dx,dy,dz,n,spd,spread,size){ for(let i=0;i<n;i++){ if(RM.drops.length>=1400) RM.drops.shift();
    const v=spd*(0.5+Math.random()*0.7); RM.drops.push({x,y,z,vx:dx*v+(Math.random()-0.5)*spread,vy:dy*v+(Math.random()-0.5)*spread+0.4*Math.random(),vz:dz*v+(Math.random()-0.5)*spread,r:(size||0.012)*(0.6+Math.random()*0.9)}); } }
function rmHitBullet(h,o,d,dmg,wid){ const s=h.s; const hp=new THREE.Vector3(o.x+d.x*h.t,o.y+d.y*h.t,o.z+d.z*h.t);
  if(RM.shot!==NET.fs){ RM.shot=NET.fs; RM.acc={}; }
  const A=rmPt(s.a,new THREE.Vector3()), B=rmPt(s.b,new THREE.Vector3()); let n;
  if(s.name==='head'&&h.tc>=1){ n=hp.clone().sub(B).normalize(); } else { const ax=A.clone().lerp(B,h.tc); n=hp.clone().sub(ax); if(n.lengthSq()<1e-8) n.copy(d).negate(); n.normalize(); }
  RM.acc[s.name]=(RM.acc[s.name]||0)+dmg; s.tot=(s.tot||0)+dmg; RM.lastHit=RM.t;
  // impulso real no ponto do tiro, dividido entre as duas juntas do osso
  const J=clamp(dmg*0.032,1.1,26); const ia=Array.isArray(s.a)?s.a:[s.a]; const tb=s.name==='head'&&h.tc>=1?1:h.tc;
  for(const i of ia) rmImpulse(i,d.x*J*(1-tb)/ia.length*RM.p[i].im,d.y*J*(1-tb)/ia.length*RM.p[i].im*0.6,d.z*J*(1-tb)/ia.length*RM.p[i].im);
  rmImpulse(s.b,d.x*J*tb*RM.p[s.b].im,d.y*J*tb*RM.p[s.b].im*0.6,d.z*J*tb*RM.p[s.b].im);
  // ferida + sangue de entrada (volta para o atirador) e de saída (para frente) nos tiros fortes
  const artery=(s.name==='head'&&h.tc<1)||(s.part==='leg'&&s.name.startsWith('thigh')&&h.tc<0.45&&Math.random()<0.6)||(s.part==='arm'&&s.name.startsWith('uarm')&&h.tc<0.35&&Math.random()<0.4);
  const w=rmAddWound(s,hp,n,dmg,artery);
  rmSpray(hp.x,hp.y,hp.z,n.x-d.x*0.5,n.y-d.y*0.5,n.z-d.z*0.5,Math.round(clamp(dmg/6,8,40)),1.6,0.8,0.011);
  if(dmg>=100){ const ex=hp.clone().addScaledVector(d,0.2); rmSpray(ex.x,ex.y,ex.z,d.x,d.y,d.z,Math.round(clamp(dmg/8,12,60)),3.2,1.2,0.013); }
  try{ Snd.flesh(hp.x,hp.z); }catch(e){}
  if(RM.st==='dead'){ RM.deadT=Math.min(RM.deadT,0.6); }
  // dano: sangue, dor, pernas
  RM.blood-=dmg*0.045; RM.flinch=Math.min(1,RM.flinch+0.35+dmg/400); if(s.part==='chest'||s.part==='belly') RM.hunch=Math.min(1,RM.hunch+0.35+dmg/500);
  if(s.part==='leg'||s.part==='foot'){ const i=s.side>0?0:1; RM.legs[i]=Math.max(0,RM.legs[i]-dmg/320); }
  const acc=RM.acc[s.name];
  // gore
  if(s.name==='head'){ if(h.tc>=1&&(acc>=240||s.tot>=520)&&!RM.headGone) rmHeadBoom(d); else if(h.tc<1&&acc>=300) rmSever('neck',d); rmKill(); }
  else if(s.part==='arm'){ if(acc>=280||s.tot>=900){ const up=s.name.startsWith('uarm'); rmSever((up&&h.tc<0.5?'sh':'el')+(s.side>0?'L':'R'),d); } }
  else if(s.part==='leg'){ if(acc>=300||s.tot>=1000){ const up=s.name.startsWith('thigh'); rmSever((up&&h.tc<0.5?'hip':'kn')+(s.side>0?'L':'R'),d); } }
  else if(s.part==='belly'){ if((acc>=300||s.tot>=420)&&!RM.openB) rmOpenBelly(d); }
  else if(s.part==='chest'){ if((acc>=340||s.tot>=520)&&!RM.openC) rmOpenChest(d); if(Math.hypot(w.lp.x-0.025,w.lp.y-0.12)<0.035&&w.lp.z>0) { RM.blood=Math.min(RM.blood,20); w.rate*=3; } }
  if(RM.blood<=0) rmKill(); else if(dmg>=240&&RM.st==='stand') rmFall('impacto');
  hitmarker(RM.st==='dead',s.name==='head'); }
function rmBlast(p,dmg,rad){ if(!RM.on) return; const R=rad*2.4; let any=false;
  RM.p.forEach((q,i)=>{ const dx=q.x-p.x, dy=q.y-p.y+0.3, dz=q.z-p.z, d=Math.hypot(dx,dy,dz); if(d>R) return; const k=(1-d/R); const v=dmg*0.014*k/(0.5+q.m*0.08); any=true; rmImpulse(i,dx/(d||1)*v,Math.abs(dy/(d||1))*v+v*0.5,dz/(d||1)*v); });
  if(!any) return; const c=rmCom(); const d=Math.hypot(c.x-p.x,c.z-p.z); const k=clamp(1-d/R,0,1); const hit=dmg*k;
  RM.blood-=hit*0.06; RM.lastHit=RM.t; if(RM.st==='stand'&&hit>40) rmFall('explosão');
  if(hit>260){ const keys=['shL','shR','elL','elR','hipL','hipR','knL','knR']; const n=hit>700?3:hit>450?2:1; const dir=new THREE.Vector3(c.x-p.x,0.6,c.z-p.z).normalize(); for(let i=0;i<n;i++) rmSever(keys[(Math.random()*keys.length)|0],dir); if(hit>500&&!RM.openB) rmOpenBelly(dir); }
  if(RM.blood<=0) rmKill(); }
function rmStump(par,at,dir,big){ const M=rmMats(); const g=new THREE.Group(); const fl=rmSph(big?0.06:0.045,M.flesh,1,0.45,1); g.add(fl); const bn=new THREE.Mesh(new THREE.CylinderGeometry(0.012,0.014,0.05,8),M.bone); bn.position.y=0.02; g.add(bn);
  RM.marks.push(g); return {g,par,at}; }
function rmSever(key,dir){ const J=RMJ[key]; if(!J) return; const set=new Set(J.set); if(set.has(J.p)) return; if(J.set.every(i=>RM.det.has(i))) return;
  const p=J.p, src=RM.p[p]; const np={...src,n:src.n+'_x',m:src.m*0.4,im:1/(src.m*0.4),pin:false}; const ni=RM.p.push(np)-1;
  for(const c of RM.c){ if(c.a===p&&set.has(c.b)) c.a=ni; else if(c.b===p&&set.has(c.a)) c.b=ni; }
  RM.c=RM.c.filter(c=>!((set.has(c.a)||c.a===ni)!==(set.has(c.b)||c.b===ni)));   // nada mais liga o membro ao corpo
  for(const s of RM.segs){ if(s.a===p&&set.has(s.b)) s.a=ni; }
  set.add(ni); for(const i of set) RM.det.add(i);
  // impulso e jato arterial nos dois lados
  for(const i of set) rmImpulse(i,dir.x*2.5,1.2+dir.y*2,dir.z*2.5);
  let segP=RM.segs.find(s=>s.b===p&&!set.has(s.a)); let pLp=null;
  if(!segP){ segP=RM.segs.find(s=>s.name===(key.startsWith('hip')?'belly':'chest')); segP.f.updateMatrixWorld(); pLp=new THREE.Vector3(src.x,src.y,src.z).applyMatrix4(RMM.copy(segP.f.matrixWorld).invert()); }
  const segC=RM.segs.find(s=>s.a===ni);
  rmSpray(src.x,src.y,src.z,dir.x,0.6,dir.z,90,3,1.8,0.014);
  if(segP){ const isEnd=!pLp; const lp=pLp||new THREE.Vector3(0,segP.L||0.28,0); const ln=isEnd?new THREE.Vector3(0,1,0):new THREE.Vector3(lp.x,0,0).normalize(); const st=rmStump(segP,lp,dir,key==='neck'||key.startsWith('hip')); segP.f.add(st.g); st.g.position.copy(lp); if(!isEnd) st.g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),ln);
    const w={seg:segP,lp:lp.clone(),ln,wn:new THREE.Vector3(0,1,0),rate:5,artery:true,age:0,acc:0,dead:false,stump:true}; RM.wounds.push(w); }
  if(segC){ const st=rmStump(segC,new THREE.Vector3(),dir,false); segC.f.add(st.g); st.g.rotation.x=Math.PI; RM.wounds.push({seg:segC,lp:new THREE.Vector3(),ln:new THREE.Vector3(0,-1,0),wn:new THREE.Vector3(0,-1,0),rate:2.2,artery:true,age:0,acc:0,dead:false,stump:true}); }
  RM.blood-=key==='neck'?100:key.startsWith('hip')||key.startsWith('sh')?22:14; if(key==='neck') rmKill(); else if(RM.st==='stand') rmFall('membro');
  try{ Snd.flesh(src.x,src.z); Snd.flesh(src.x,src.z); }catch(e){} }
function rmGib(x,y,z,mat,r,v){ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),mat); m.position.set(x,y,z); m.rotation.set(Math.random()*6,Math.random()*6,0); RM.dyn.add(m);
  RM.gibs.push({m,vx:v.x,vy:v.y,vz:v.z,r,rest:false,spin:(Math.random()-0.5)*14}); if(RM.gibs.length>90){ const g=RM.gibs.shift(); RM.dyn.remove(g.m); } }
function rmHeadBoom(dir){ RM.headGone=true; RM.headG.visible=false; const H=RM.p[0]; const M=rmMats();
  for(let i=0;i<22;i++){ const mat=i<6?M.brain:i<10?M.bone:i<15?M.flesh:i<19?M.skin:M.hair; const v=new THREE.Vector3(dir.x*rand(2,6)+rand(-2,2),rand(1,4),dir.z*rand(2,6)+rand(-2,2)); rmGib(H.x+rand(-0.05,0.05),H.y+rand(-0.04,0.06),H.z+rand(-0.05,0.05),mat,rand(0.014,0.042),v); }
  rmSpray(H.x,H.y,H.z,dir.x,0.5,dir.z,160,4.5,2.6,0.014);
  const s=RM.segs.find(q=>q.name==='head'); const st=rmStump(s,new THREE.Vector3(0,0.19,0),dir,true); s.f.add(st.g); st.g.position.set(0,0.17,0);
  RM.wounds.push({seg:s,lp:new THREE.Vector3(0,0.18,0),ln:new THREE.Vector3(0,1,0),wn:new THREE.Vector3(0,1,0),rate:6,artery:true,age:0,acc:0,dead:false,stump:true});
  RM.p[0].m=0.6; RM.p[0].im=1/0.6; try{ Snd.flesh(H.x,H.z); Snd.flesh(H.x,H.z); }catch(e){} }
function rmOpenBelly(dir){ RM.openB=true; RM.bellyFront.visible=false; RM.bellyCav.visible=true; RM.bellyOrg.visible=true; RM.hunch=1; RM.blood-=18;
  const s=RM.segs.find(q=>q.name==='belly'); s.f.updateMatrixWorld();
  // intestino para fora: corda de 18 nós presa na barriga
  const nodes=[]; for(let i=0;i<18;i++){ const lp=new THREE.Vector3(Math.sin(i*1.3)*0.05,0.08+Math.cos(i*0.9)*0.03,0.06+i*0.004); const wp=lp.applyMatrix4(s.f.matrixWorld); nodes.push({x:wp.x,y:wp.y,z:wp.z,ox:wp.x-dir.x*0.01,oy:wp.y,oz:wp.z-dir.z*0.01}); }
  const M=rmMats(); const meshes=[]; const geo=new THREE.CylinderGeometry(0.02,0.02,1,8,1,true); for(let i=0;i<17;i++){ const m=new THREE.Mesh(geo,M.gut); RM.dyn.add(m); meshes.push(m); const k=rmSph(0.021,M.gut); RM.dyn.add(k); meshes.push(k); }
  RM.gut={nodes,meshes,seg:s,anchor:new THREE.Vector3(0,0.09,0.09)};
  const c=new THREE.Vector3(0,0.1,0.1).applyMatrix4(s.f.matrixWorld); rmSpray(c.x,c.y,c.z,dir.x,0.2,dir.z,120,2.2,1.6,0.014);
  RM.wounds.push({seg:s,lp:new THREE.Vector3(0,0.1,0.09),ln:new THREE.Vector3(0,0,1),wn:new THREE.Vector3(0,0,1),rate:4,artery:false,age:0,acc:0,dead:false});
  if(RM.st==='stand') rmFall('barriga'); }
function rmOpenChest(dir){ RM.openC=true; RM.chestFront.visible=false; RM.chestCav.visible=true; RM.chestOrg.visible=true; RM.blood-=25;
  const s=RM.segs.find(q=>q.name==='chest'); s.f.updateMatrixWorld(); const c=new THREE.Vector3(0,0.15,0.1).applyMatrix4(s.f.matrixWorld);
  const M=rmMats(); for(let i=0;i<8;i++) rmGib(c.x,c.y,c.z,i<4?M.bone:M.flesh,rand(0.01,0.025),new THREE.Vector3(dir.x*rand(1,4)+rand(-1,1),rand(0.5,2.5),dir.z*rand(1,4)+rand(-1,1)));
  rmSpray(c.x,c.y,c.z,dir.x,0.3,dir.z,140,3,1.8,0.014); RM.wounds.push({seg:s,lp:new THREE.Vector3(0.02,0.13,0.08),ln:new THREE.Vector3(0,0,1),wn:new THREE.Vector3(0,0,1),rate:4.5,artery:true,age:0,acc:0,dead:false});
  if(RM.st==='stand') rmFall('peito'); }
function rmGutStep(dt){ const G0=RM.gut, N=G0.nodes; const a=G0.anchor.clone(); G0.seg.f.updateMatrixWorld(); a.applyMatrix4(G0.seg.f.matrixWorld);
  for(let i=1;i<N.length;i++){ const p=N[i]; const vx=(p.x-p.ox)*0.985, vy=(p.y-p.oy)*0.985, vz=(p.z-p.oz)*0.985; p.ox=p.x; p.oy=p.y; p.oz=p.z; p.x+=vx; p.y+=vy-9.8*dt*dt; p.z+=vz; }
  N[0].x=a.x; N[0].y=a.y; N[0].z=a.z;
  for(let it=0;it<6;it++){ for(let i=0;i<N.length-1;i++){ const A=N[i], B=N[i+1]; const dx=B.x-A.x, dy=B.y-A.y, dz=B.z-A.z, L=Math.hypot(dx,dy,dz)||1e-6, f=(L-0.055)/L; const wa=i===0?0:0.5, wb=i===0?1:0.5;
      A.x+=dx*f*wa; A.y+=dy*f*wa; A.z+=dz*f*wa; B.x-=dx*f*wb; B.y-=dy*f*wb; B.z-=dz*f*wb; }
    for(const p of N){ if(p.y<0.02){ p.y=0.02; p.ox+=(p.x-p.ox)*0.4; p.oz+=(p.z-p.oz)*0.4; } } } }

/* ---------- loop: física em passo fixo + sangue + visual ---------- */
function rmUpdate(dt){ if(!RM.on) return; RM.t+=dt; dt=Math.min(dt,0.05);
  RM.flinch=Math.max(0,RM.flinch-dt*2.2); if(RM.t-RM.lastHit>2.5) RM.hunch=Math.max(RM.blood<60?0.35:0,RM.hunch-dt*0.25);
  // perda de sangue pelas feridas
  if(RM.st!=='dead'){ let loss=0; for(const w of RM.wounds){ if(w.dead) continue; loss+=w.rate*(w.artery?0.55:0.12)*Math.max(0.15,1-w.age/25); } RM.blood-=loss*dt*(RM._cov||1); if(RM.blood<=0) rmKill(); }
  if(RM.st==='fall'){ RM.fallT+=dt; const c=rmCom(); if(RM.fallT>1.4&&Math.hypot(c.vx,c.vz)<0.4) RM.st=RM.st==='dead'?'dead':'down'; }
  if(RM.st==='dead'){ RM.deadT+=dt; if(RM.deadT<2&&Math.random()<dt*6){ const i=[7,8,11,12,9,10][(Math.random()*6)|0]; rmImpulse(i,rand(-0.4,0.4),rand(0,0.5),rand(-0.4,0.4)); } }
  if(RM.st==='down'&&RM.blood>12){ RM.writheT-=dt; if(RM.writheT<=0){ RM.writheT=rand(0.5,1.6)*(60/Math.max(20,RM.blood)); const i=[11,12,13,14,0][(Math.random()*5)|0]; if(!RM.det.has(i)) rmImpulse(i,rand(-0.6,0.6),rand(0.2,0.9),rand(-0.6,0.6)); } }
  rmBalance(dt);
  RM.acc2+=dt; let n=0; while(RM.acc2>=RM_DT&&n<5){ rmStep(RM_DT); RM.acc2-=RM_DT; n++; } if(n>=5) RM.acc2=0;
  rmBlood(dt); rmDraw(); }
function rmBlood(dt){ const alive=RM.st!=='dead'; const hr=alive?1.1+(100-RM.blood)/60:0; const beat=Math.pow(Math.max(0,Math.sin(RM.t*Math.PI*2*hr)),3);
  const gH=RM._guard||[null,null]; let cov=1;
  for(const w of RM.wounds){ if(w.dead||w.seg.gone) continue; w.age+=dt; const pos=rmWoundPos(w,RMV); const nrm=RMV2.copy(w.ln).transformDirection(w.seg.f.matrixWorld); w.wn.copy(nrm);
    let covered=false; for(const hi of [0,1]){ if(gH[hi]===w&&!RM.det.has(hi?10:9)){ const h=RM.p[hi?10:9]; if(Math.hypot(h.x-pos.x,h.y-pos.y,h.z-pos.z)<0.11) covered=true; } } if(covered) cov*=0.85;
    const decay=w.stump?Math.max(0.15,1-w.age/14):Math.max(0.12,1-w.age/22); const bf=clamp(RM.blood/100,0.1,1);
    const pump=alive?(w.artery?0.25+beat*1.6:0.5+beat*0.5):0.12*Math.max(0,1-RM.deadT/20);
    const rate=w.rate*decay*bf*pump*(covered?0.3:1)*18; w.acc+=rate*dt; let k=Math.min(8,w.acc|0); w.acc-=k;
    const sp=covered?0.25:(w.artery?1.4+beat*2.6:0.6+beat*0.8);
    if(k>0){ const bv=w.seg.f; for(let i=0;i<k;i++) rmSpray(pos.x+nrm.x*0.015,pos.y+nrm.y*0.015,pos.z+nrm.z*0.015,covered?0:nrm.x,covered?-0.5:nrm.y,covered?0:nrm.z,1,sp,covered?0.15:0.35,0.009); }
    if(w.stain&&w.stain.scale.x<3.2) w.stain.scale.multiplyScalar(1+dt*0.06*decay);
    // poça quando o ferimento está perto do chão
    if(pos.y<0.4&&RM.st!=='stand'&&w.rate*decay>0.4) rmPool(pos.x,pos.z,dt*w.rate*decay*(w.artery?0.012:0.004)); }
  RM._cov=cov;
  // gotas
  const D=RM.drops; let j=0; for(let i=0;i<D.length;i++){ const d=D[i]; d.vy-=9.8*dt; d.vx*=0.995; d.vz*=0.995; d.x+=d.vx*dt; d.y+=d.vy*dt; d.z+=d.vz*dt;
    if(d.y<=0.004){ if(Math.random()<0.55) rmSplat(d.x,d.z,d.r*rand(3,7)*(1+Math.min(2,Math.hypot(d.vx,d.vz)*0.15))); continue; } D[j++]=d; } D.length=j;
  // pedaços
  for(const g of RM.gibs){ if(g.rest) continue; g.vy-=9.8*dt; g.m.position.x+=g.vx*dt; g.m.position.y+=g.vy*dt; g.m.position.z+=g.vz*dt; g.m.rotation.x+=g.spin*dt; g.m.rotation.y+=g.spin*0.7*dt;
    if(g.m.position.y<g.r){ g.m.position.y=g.r; g.vy=-g.vy*0.25; g.vx*=0.6; g.vz*=0.6; g.spin*=0.6; if(Math.random()<0.5) rmSplat(g.m.position.x,g.m.position.z,g.r*3); if(Math.abs(g.vy)<0.3&&Math.hypot(g.vx,g.vz)<0.15) g.rest=true; } } }
function rmSplat(x,z,r){ const i=RM.splat%700; RM.splat++; RMO.position.set(x,0.006+(i%50)*0.00008,z); RMO.rotation.set(-Math.PI/2,0,Math.random()*6.28); const sx=r*(0.7+Math.random()*0.6); RMO.scale.set(sx,r,1); RMO.updateMatrix(); RM.splIM.setMatrixAt(i,RMO.matrix); RM.splIM.count=Math.min(700,RM.splat); RM.splIM.instanceMatrix.needsUpdate=true; }
function rmPool(x,z,add){ let p=RM.pools.find(q=>Math.hypot(q.x-x,q.z-z)<0.35); if(!p){ if(RM.pools.length>=8) return; const m=new THREE.Mesh(new THREE.CircleGeometry(1,28),RMMAT.pool); m.rotation.x=-Math.PI/2; m.position.set(x,0.009+RM.pools.length*0.0006,z); m.scale.setScalar(0.02); m.userData.frs=1; RM.g.parent.add(m); p={x,z,v:0,m}; RM.pools.push(p); }
  p.v+=add; const r=Math.min(0.6,Math.sqrt(p.v)*0.9); p.m.scale.set(r,r*0.85,1); }
function rmDraw(){ for(const s of RM.segs){ rmFrame(s); }
  if(RM.heart&&RM.chestOrg.visible){ const b=RM.st==='dead'?0:Math.pow(Math.max(0,Math.sin(RM.t*Math.PI*2*(1.1+(100-RM.blood)/60))),4); RM.heart.scale.set(1+b*0.12,1.25*(1+b*0.12),0.95*(1+b*0.12)); }
  // gotas
  const D=RM.drops, IM=RM.dropIM; const n=Math.min(D.length,1400); for(let i=0;i<n;i++){ const d=D[i]; const sp=Math.hypot(d.vx,d.vy,d.vz); RMO.position.set(d.x,d.y,d.z);
    if(sp>0.5){ RMV.set(d.vx/sp,d.vy/sp,d.vz/sp); RMO.quaternion.setFromUnitVectors(RMV2.set(0,1,0),RMV); } else RMO.quaternion.identity(); RMO.scale.set(d.r,d.r*(1+Math.min(3,sp*0.35)),d.r); RMO.updateMatrix(); IM.setMatrixAt(i,RMO.matrix); }
  IM.count=n; IM.instanceMatrix.needsUpdate=true;
  if(RM.gut){ const N=RM.gut.nodes, Ms=RM.gut.meshes; for(let i=0;i<N.length-1;i++){ const A=N[i], B=N[i+1]; const m=Ms[i*2], k=Ms[i*2+1]; RMV.set(B.x-A.x,B.y-A.y,B.z-A.z); const L=RMV.length()||1e-4;
    m.position.set((A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2); m.quaternion.setFromUnitVectors(RMV2.set(0,1,0),RMV.divideScalar(L)); m.scale.set(1,L,1); k.position.set(B.x,B.y,B.z); } } }

/* ---------- ganchos no jogo ---------- */
const RMF={on:false,d:null,s:null};
{ const f0=fire; fire=function(){ if(CUR!=='fun'||!RM.on) return f0.apply(this,arguments); RMF.on=true; try{ RMF.s=curSlot(); RMF.d=RMF.s?wstat(RMF.s):null; return f0.apply(this,arguments); } finally{ RMF.on=false; } }; }
{ const rw0=rayWall; rayWall=function(o,d,max){ const t=rw0.apply(this,arguments); if(!RMF.on||!RM.on||CUR!=='fun'||!RMF.d) return t; const h=rmRay(o,d,t);
    if(!h) return t; if(RMF.d.proj) return h.t; const kind=RH.kind; RH.kind='none';
    const dmg=RMF.d.dmg*(RMF.d.range?clamp(1.25-h.t/RMF.d.range,0.25,1):1); try{ rmHitBullet(h,o,d,dmg,RMF.s&&RMF.s.id); }catch(e){ console.warn('[Bunker] homem de testes',e); } return h.t; }; }
{ const ex0=explodeSplash; explodeSplash=function(p,dmg,rad){ const r=ex0.apply(this,arguments); if(CUR==='fun'&&RM.on) try{ rmBlast(p,dmg,rad); }catch(e){} return r; }; }
v9On('frame',dt=>{ if(CUR!=='fun') return; if(!RM.built){ try{ rmBuild(); }catch(e){ console.warn('[Bunker] lab de física',e); RM.built=true; return; } } rmUpdate(dt); });
CMDS.homem={d:'homem · reseta o homem do laboratório de física (Parque 4FUN)',f:()=>{ if(CUR!=='fun'){ cprint('Só no Parque 4FUN.','err'); return; } if(!RM.built) rmBuild(); rmReset(); cprint('Homem resetado.'); }};
