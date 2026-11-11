/* ================= v9 · O CARRO DA FUGA =================
   Sedã antigo de verdade (lataria em perfil, capô, porta-malas, cromados, faróis, grade, placa, ferrugem, bagageiro com
   galões e estepe) com cabine oca: painel, bancos e assoalho. Cada jogador senta no seu banco, a câmera fica na altura
   certa e a colisão do carro desliga enquanto você está dentro — nada de ficar sendo empurrado ou tremendo. */
const CAR2={box:null,seatIdx:0};
function car2Mats(){ return { paint:v9Mat('car2Paint',{color:0x2a4a3a,shininess:70,specular:0x445544}), paint2:v9Mat('car2Paint2',{color:0xd8d0b8,shininess:60,specular:0x444444}),
  chrome:v9Mat('car2Chrome',{color:0xc8ccd0,shininess:140,specular:0xffffff}), black:v9Mat('car2Black',{color:0x0e0e0f,shininess:20}), rubber:v9Mat('car2Rubber',{color:0x151515,shininess:6}),
  glass:v9Mat('car2Glass',{color:0x22303a,shininess:140,specular:0xaaccee,transparent:true,opacity:0.32,depthWrite:false}), seat:v9Mat('car2Seat',{color:0x5a2a1a,shininess:25}),
  dash:v9Mat('car2Dash',{color:0x1e1a16,shininess:30}), carpet:v9Mat('car2Carpet',{color:0x2a2622,shininess:2}), rust:v9Mat('car2Rust',{color:0x5a2e18,shininess:5}),
  lampF:v9Mat('car2LampF',{color:0xfff4d0,emissive:0x2a2418,shininess:120}), lampR:v9Mat('car2LampR',{color:0x8a0a0a,emissive:0x2a0000,shininess:100}), orange:v9Mat('car2Orange',{color:0xe07a1a,emissive:0x1a0a00}),
  can:v9Mat('car2Can',{color:0xb81a14,shininess:40}), canG:v9Mat('car2CanG',{color:0x3a4a2a,shininess:30}) }; }
function car2Plate(){ return tex(256,80,(c,W,H)=>{ c.fillStyle='#f4f2ee'; c.fillRect(0,0,W,H); c.fillStyle='#0a3a9a'; c.fillRect(0,0,W,18); c.fillStyle='#fff'; c.font='bold 12px sans-serif'; c.textAlign='center'; c.fillText('BRASIL',W/2,13);
  c.fillStyle='#111'; c.font='bold 46px "Arial Narrow", Arial, sans-serif'; c.fillText('BDM2D87',W/2,64); c.strokeStyle='#111'; c.lineWidth=3; c.strokeRect(2,2,W-4,H-4); clGrime(c,W,H,0.3); }); }
function car2Body(g){ const M=car2Mats(); const B=(w,h,d,m,x,y,z,rx,ry,rz)=>{ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.position.set(x,y,z); o.rotation.set(rx||0,ry||0,rz||0); g.add(o); return o; };
  const Cy=(rt,rb,h,m,x,y,z,rx,ry,rz,seg)=>{ const o=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||16),m); o.position.set(x,y,z); o.rotation.set(rx||0,ry||0,rz||0); g.add(o); return o; };
  // laterais da lataria: perfil do sedã extrudado (fino, a cabine fica oca)
  const sh=new THREE.Shape(); sh.moveTo(-2.22,0.34); sh.lineTo(2.22,0.34); sh.quadraticCurveTo(2.3,0.34,2.3,0.5); sh.lineTo(2.28,0.92); sh.quadraticCurveTo(2.25,1.0,2.1,1.0); sh.lineTo(-2.1,1.0); sh.quadraticCurveTo(-2.27,1.0,-2.3,0.88); sh.lineTo(-2.3,0.5); sh.quadraticCurveTo(-2.3,0.34,-2.22,0.34);
  for(const hole of [-1.27,1.29]){ const p=new THREE.Path(); p.absarc(hole,0.4,0.38,0,Math.PI,false); p.lineTo(hole-0.38,0.4); sh.holes.push(p); }
  const geo=new THREE.ExtrudeGeometry(sh,{depth:0.06,bevelEnabled:true,bevelThickness:0.02,bevelSize:0.02,bevelSegments:2});
  for(const sx of [-1,1]){ const side=new THREE.Mesh(geo,M.paint); side.rotation.y=-Math.PI/2; side.position.set(sx>0?0.92:-0.86,0,0); g.add(side);
    B(0.02,0.04,3.9,M.chrome,sx*0.93,0.72,0);                                                                  // friso cromado
    for(const z of [-0.45,0.62]){ B(0.025,0.02,0.12,M.chrome,sx*0.935,0.9,z); B(0.01,0.5,0.01,M.black,sx*0.93,0.66,z+0.4); }   // maçanetas e vãos das portas
    for(const hz of [-1.27,1.29]){ const arc=new THREE.Mesh(new THREE.TorusGeometry(0.4,0.03,6,18,Math.PI),M.black); arc.position.set(sx*0.92,0.4,hz); arc.rotation.y=Math.PI/2; g.add(arc); }
    const mir=B(0.16,0.09,0.05,M.chrome,sx*1.0,1.08,-0.62); B(0.12,0.07,0.01,M.glass,sx*1.0,1.08,-0.65); }
  // capô, frente, grade, faróis, para-choques
  B(1.76,0.08,1.28,M.paint,0,0.97,-1.62,0.04); B(1.76,0.46,0.12,M.paint,0,0.72,-2.26);
  B(1.0,0.22,0.04,M.black,0,0.76,-2.33); for(let i=0;i<8;i++) B(0.012,0.2,0.05,M.chrome,-0.45+i*0.128,0.76,-2.335);
  for(const sx of [-0.66,0.66]){ Cy(0.11,0.11,0.06,M.chrome,sx,0.78,-2.32,Math.PI/2); const l=Cy(0.09,0.09,0.065,M.lampF,sx,0.78,-2.33,Math.PI/2); }
  for(const sx of [-0.78,0.78]) B(0.12,0.06,0.05,M.orange,sx,0.58,-2.32);
  B(1.86,0.12,0.14,M.chrome,0,0.47,-2.36); B(1.86,0.12,0.14,M.chrome,0,0.47,2.36);
  // porta-malas, traseira, lanternas, placa
  B(1.76,0.08,0.8,M.paint,0,0.97,1.86,-0.03); B(1.76,0.46,0.12,M.paint,0,0.72,2.27);
  for(const sx of [-0.62,0.62]) B(0.4,0.14,0.04,M.lampR,sx,0.8,2.335);
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.13),new THREE.MeshLambertMaterial({map:car2Plate()})); pl.position.set(0,0.6,2.34); g.add(pl);
  const pf=pl.clone(); pf.position.set(0,0.55,-2.44); pf.rotation.y=Math.PI; g.add(pf);
  // assoalho, painel, bancos (cabine oca)
  B(1.66,0.05,2.5,M.carpet,0,0.42,0.12); B(1.7,0.3,0.32,M.dash,0,0.92,-0.98); B(1.6,0.06,0.3,M.dash,0,1.07,-0.9,0.25);
  for(let i=0;i<3;i++) Cy(0.035,0.035,0.01,M.chrome,0.36+i*0.09,1.0,-0.82,Math.PI/2);                                   // relógios do painel
  for(const sx of [-0.4,0.4]){ B(0.56,0.12,0.55,M.seat,sx,0.7,-0.18); B(0.54,0.62,0.12,M.seat,sx,1.02,0.12,-0.12); B(0.3,0.16,0.1,M.seat,sx,1.4,0.16,-0.12); }
  B(1.5,0.12,0.6,M.seat,0,0.7,0.86); B(1.5,0.6,0.12,M.seat,0,1.0,1.18,-0.15);
  B(0.05,0.32,0.05,M.black,0.4,0.96,-0.7,0.9);                                                                           // coluna da direção
  // colunas, teto, vidros laterais e traseiro (o para-brisa é a peça "vidro")
  const roofY=1.64; B(1.62,0.06,1.42,M.paint2,0,roofY,0.28);
  for(const sx of [-0.8,0.8]){ B(0.06,0.74,0.06,M.paint,sx,1.31,-0.66,-0.55); B(0.06,0.64,0.07,M.paint,sx,1.32,0.32); B(0.06,0.74,0.06,M.paint,sx,1.31,1.12,0.6);
    B(0.015,0.56,0.72,M.glass,sx*0.84,1.31,-0.12); B(0.015,0.56,0.62,M.glass,sx*0.84,1.31,0.72); }
  B(1.5,0.66,0.02,M.glass,0,1.31,1.2,0.62);
  // bagageiro com galões, estepe e saco de areia
  for(const sx of [-0.7,0.7]) B(0.04,0.04,1.3,M.black,sx,roofY+0.07,0.28); for(const z of [-0.3,0.3,0.86]) B(1.44,0.03,0.04,M.black,0,roofY+0.09,z);
  for(let i=0;i<2;i++){ B(0.2,0.32,0.36,i?M.canG:M.can,-0.45+i*0.26,roofY+0.27,0.0); }
  const sp=new THREE.Mesh(new THREE.TorusGeometry(0.26,0.1,8,18),M.rubber); sp.rotation.x=Math.PI/2; sp.position.set(0.35,roofY+0.17,0.55); g.add(sp);
  // ferrugem, sujeira e marcas de tiro
  for(let i=0;i<16;i++){ const sx=Math.random()<0.5?-1:1; const p=new THREE.Mesh(new THREE.CircleGeometry(rand(0.04,0.16),8),Math.random()<0.7?M.rust:M.black); p.position.set(sx*0.945,rand(0.4,0.95),rand(-2,2)); p.rotation.y=sx*Math.PI/2; g.add(p); }
  return M; }
const _car2B=carBuild; carBuild=function(){ const r=_car2B.apply(this,arguments); try{ const g=CAR.g; if(!g) return r; const keep=new Set(CAR.meshes);
    for(let i=g.children.length-1;i>=0;i--){ const c=g.children[i]; if(!keep.has(c)) g.remove(c); }
    const M=car2Body(g);
    // rodas que já estão no lugar (as outras duas são peças a instalar) e o macaco no lugar da que falta
    for(const [sx,sz] of [[-0.86,-1.25],[-0.86,1.3]]){ const w=new THREE.Mesh(new THREE.TorusGeometry(0.28,0.12,10,24),M.rubber); w.position.set(sx,0.4,sz); w.rotation.y=Math.PI/2; g.add(w); const hb=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.16,16),M.chrome); hb.rotation.z=Math.PI/2; hb.position.set(sx-0.02,0.4,sz); g.add(hb); }
    const jack=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.3,0.3),v9Mat('carJack',{color:0x8a7a2a})); jack.position.set(0.86,0.15,-1.25); g.add(jack);
    CAR2.box=propBoxes.find(b=>Math.abs(b.x0-(CAR.x-2.3))<0.02&&Math.abs(b.z0-(CAR.z-1.05))<0.02)||null;
    CAR.seats=[[0.4,-0.12],[-0.4,-0.12],[0.4,0.86],[-0.4,0.86]];
  }catch(e){ console.warn('[Bunker v9] carro novo',e); } return r; };
// cada jogador no seu banco, câmera dentro da cabine, sem colisão enquanto sentado
v9On('frame',()=>{ if(CUR!=='bunker'||!CAR.g) return; const idx=NET.mode?clamp(playerSpawnIndex(),0,3):0; CAR2.seatIdx=idx;
  if(CAR.seats&&CAR.seats.length===4&&CAR.seats[0]!==CAR.seats[idx]) CAR.seats._mine=CAR.seats[idx];
  if(CAR2.box) CAR2.box.on=!CAR.seated;
  if(!CAR.seated) return; const s=[[0.4,-0.12],[-0.4,-0.12],[0.4,0.86],[-0.4,0.86]][idx]; const c=Math.cos(CAR.ry), sn=Math.sin(CAR.ry);
  P.pos.x=CAR.x+s[0]*c+s[1]*sn; P.pos.z=CAR.z-s[0]*sn+s[1]*c; P.vx=P.vz=0; P.vy=0; P.y=0.42; P.crouch=1; P.sprinting=false; });
// sair do carro pela porta do seu lado
{ let wasSeated=false; v9On('frame',()=>{ if(CUR!=='bunker'||!CAR.g) return; if(wasSeated&&!CAR.seated&&!CAR.going){ const s=[[0.4,-0.12],[-0.4,-0.12],[0.4,0.86],[-0.4,0.86]][CAR2.seatIdx]; const side=s[0]>0?1:-1; const lx=side*1.55, lz=s[1]; const c=Math.cos(CAR.ry), sn=Math.sin(CAR.ry);
    P.pos.x=CAR.x+lx*c+lz*sn; P.pos.z=CAR.z-lx*sn+lz*c; P.y=0; P.crouch=0; } wasSeated=CAR.seated; }); }
// enquanto sentado, as teclas de andar não empurram o jogador
addEventListener('keydown',e=>{ if(CAR.seated&&CUR==='bunker'&&/^Key[WASDC]$/.test(e.code)){ e.stopImmediatePropagation(); keys[e.code]=false; } },true);
CMDS.carro_entrar={cheat:1,d:'carro_entrar · senta no carro do bunker (para testar)',f:()=>{ if(CUR!=='bunker'){ cprint('Só no bunker'); return; } CAR.seated=true; cprint('Sentado no banco '+(CAR2.seatIdx+1)); }};
