/* ================= v9 · ANIMAÇÕES DAS HABILIDADES (coreografia de mãos) =================
   Cada habilidade e cada ultimate tem uma coreografia própria quadro a quadro: posição e giro do pulso das
   duas mãos, cada dedo dobrando separado (indicador, médio, anelar, mindinho e polegar), abertura dos dedos,
   tremor, objetos na mão (seringa, frasco de água benta, crucifixo, pente, sinalizador, relógio-rádio)
   e eventos no tempo certo: som, faísca, brilho, tranco de câmera.
   Chaves: t (0..1 da duração), R/L = [x,y,z, rx,ry,rz, dedos[i,m,a,p], polegar, abertura]  (null = mão fora da tela). */
const HQ={};   // coreografias
const HFO=[0.1,0.08,0.06,0.06], HFF=[1.55,1.55,1.55,1.5], HFC=[0.6,0.55,0.5,0.45], HFP=[0.05,1.5,1.5,1.45], HFV=[0.05,0.05,1.5,1.45];   // aberta, punho, concha, apontando, "V"
const HOFF=null;
// ---- Cabo Davi ----
HQ['recruta.a']={dur:1.15,props:{L:'mag'},snd:[[0.05,'swish'],[0.32,'magout'],[0.55,'tap'],[0.62,'tap'],[0.69,'tap'],[0.82,'magin']],fx:'gold',
  R:[[0,[0.16,-0.5,-0.3,-0.4,-0.2,0.2,HFO,0.3,0]],[0.25,[0.12,-0.2,-0.3,-0.5,-0.3,0.3,HFO,0.2,0.1]],[0.5,[0.06,-0.12,-0.3,-0.9,-0.5,0.6,[0.9,0.3,1.4,1.4],0.6,0]],[0.72,[0.05,-0.11,-0.31,-0.95,-0.5,0.6,[0.4,0.2,1.4,1.4],0.6,0]],[0.85,[0.08,-0.16,-0.3,-0.6,-0.3,0.3,HFF,1.0,0]],[1,[0.16,-0.5,-0.3,-0.4,-0.2,0.2,HFF,1,0]]],
  L:[[0,[-0.18,-0.55,-0.3,-0.3,0.3,-0.4,HFC,0.4,0]],[0.3,[-0.06,-0.12,-0.32,-0.2,0.6,-0.9,HFC,0.9,0]],[0.55,[-0.04,-0.1,-0.32,-0.25,0.7,-1.0,HFC,0.95,0]],[0.82,[-0.05,-0.13,-0.33,-0.6,0.4,-0.6,HFC,0.9,0]],[0.95,[-0.1,-0.4,-0.33,-0.4,0.3,-0.4,HFC,0.9,0]],[1,[-0.18,-0.6,-0.3,-0.3,0.3,-0.4,HFC,0.4,0]]]};
HQ['recruta.u']={dur:1.6,props:{R:'flare',L:'watch'},snd:[[0.04,'radio'],[0.42,'pin'],[0.62,'whoosh'],[0.66,'flare']],fx:'mark',shake:[[0.62,0.18]],
  L:[[0,[-0.2,-0.6,-0.3,-0.2,0.3,-0.3,HFO,0.2,0]],[0.12,[-0.17,-0.02,-0.28,0.25,1.1,-0.25,[0.3,0.25,1.2,1.3],0.4,0]],[0.36,[-0.16,0.0,-0.28,0.28,1.1,-0.2,[0.25,0.2,1.2,1.3],0.4,0]],[0.42,[-0.02,-0.1,-0.3,-0.4,0.4,-0.6,[1.2,0.4,1.4,1.4],1.1,0]],[0.5,[-0.08,-0.18,-0.28,-0.3,0.4,-0.4,[1.3,1.2,1.4,1.4],1.1,0]],[0.62,[-0.2,-0.5,-0.3,-0.2,0.3,-0.3,HFO,0.2,0]],[1,[-0.2,-0.6,-0.3,-0.2,0.3,-0.3,HFO,0.2,0]]],
  R:[[0,[0.18,-0.6,-0.3,-0.6,-0.2,0.2,HFF,1,0]],[0.3,[0.08,-0.16,-0.3,-0.4,-0.3,0.4,HFF,1.1,0]],[0.48,[0.12,-0.04,-0.18,0.4,-0.2,0.1,HFF,1.1,0]],[0.62,[0.04,0.0,-0.55,-1.2,-0.1,0.0,[0.3,0.25,0.25,0.3],0.3,0.12]],[0.75,[0.03,-0.04,-0.5,-1.3,0,0,HFP,0.4,0]],[0.9,[0.06,-0.08,-0.5,-1.3,0,-0.1,HFP,0.4,0]],[1,[0.16,-0.55,-0.3,-0.6,-0.2,0.2,HFO,0.3,0]]]};
// ---- Dra. Helena ----
HQ['helena.a']={dur:1.2,props:{R:'syringe'},snd:[[0.2,'tick'],[0.3,'tick'],[0.55,'stab'],[0.62,'hiss']],fx:'heal',shake:[[0.56,0.05]],
  R:[[0,[0.18,-0.55,-0.3,-0.3,-0.3,0.4,[0.9,0.9,1.3,1.3],0.2,0]],[0.18,[0.06,-0.08,-0.32,0.2,-0.6,1.35,[0.9,0.9,1.3,1.3],0.2,0]],[0.4,[0.05,-0.09,-0.32,0.2,-0.6,1.35,[0.9,0.9,1.3,1.3],0.2,0]],[0.55,[-0.01,-0.16,-0.3,-0.3,-0.2,1.0,[0.9,0.9,1.3,1.3],1.0,0]],[0.72,[-0.01,-0.16,-0.3,-0.3,-0.2,1.0,[0.9,0.9,1.3,1.3],1.25,0]],[0.85,[0.1,-0.3,-0.3,-0.3,-0.3,0.6,HFO,0.4,0]],[1,[0.18,-0.6,-0.3,-0.3,-0.3,0.4,HFO,0.3,0]]],
  L:[[0,[-0.2,-0.6,-0.3,-0.4,0.3,-0.3,HFO,0.3,0]],[0.16,[-0.07,-0.13,-0.32,-0.5,0.4,-0.8,[0.4,1.2,1.4,1.4],1.0,0]],[0.2,[-0.06,-0.12,-0.32,-0.5,0.4,-0.8,[0.0,1.2,1.4,1.4],1.0,0]],[0.25,[-0.07,-0.13,-0.32,-0.5,0.4,-0.8,[0.5,1.2,1.4,1.4],1.0,0]],[0.3,[-0.06,-0.12,-0.32,-0.5,0.4,-0.8,[0.0,1.2,1.4,1.4],1.0,0]],[0.42,[-0.04,-0.2,-0.3,-1.3,0.2,-1.5,HFO,0.2,0.1]],[0.85,[-0.04,-0.2,-0.3,-1.3,0.2,-1.5,HFC,0.3,0.05]],[1,[-0.2,-0.6,-0.3,-0.4,0.3,-0.3,HFO,0.3,0]]]};
HQ['helena.u']={dur:1.5,snd:[[0.1,'heal'],[0.5,'pulse'],[0.8,'pulse']],fx:'heal',shake:[[0.5,0.12]],
  R:[[0,[0.15,-0.6,-0.3,-0.4,-0.3,0.2,HFC,0.4,0]],[0.3,[0.13,-0.06,-0.34,-0.2,-0.4,0.25,HFO,0.1,0.25]],[0.5,[0.11,-0.22,-0.36,-1.3,-0.2,0.1,HFO,0.1,0.35]],[0.8,[0.12,-0.24,-0.37,-1.35,-0.2,0.1,HFO,0.1,0.35]],[1,[0.15,-0.6,-0.3,-0.4,-0.3,0.2,HFC,0.4,0]]],
  L:[[0,[-0.15,-0.6,-0.3,-0.4,0.3,-0.2,HFC,0.4,0]],[0.3,[-0.13,-0.06,-0.34,-0.2,0.4,-0.25,HFO,0.1,0.25]],[0.5,[-0.11,-0.22,-0.36,-1.3,0.2,-0.1,HFO,0.1,0.35]],[0.8,[-0.12,-0.24,-0.37,-1.35,0.2,-0.1,HFO,0.1,0.35]],[1,[-0.15,-0.6,-0.3,-0.4,0.3,-0.2,HFC,0.4,0]]]};
// ---- Sargento Moreira ----
HQ['moreira.a']={dur:0.85,snd:[[0.08,'crack'],[0.16,'crack'],[0.24,'crack'],[0.45,'whoosh'],[0.52,'punch']],fx:'dust',shake:[[0.52,0.3]],
  R:[[0,[0.18,-0.5,-0.25,-1.2,-0.2,0.2,HFO,0.3,0]],[0.08,[0.14,-0.2,-0.22,-1.3,-0.2,0.3,[1.55,0.2,0.2,0.2],0.4,0]],[0.16,[0.14,-0.2,-0.22,-1.3,-0.2,0.3,[1.55,1.55,0.2,0.2],0.6,0]],[0.24,[0.14,-0.2,-0.2,-1.3,-0.2,0.3,HFF,1.1,0]],[0.42,[0.17,-0.17,-0.1,-1.4,-0.3,0.5,HFF,1.2,0]],[0.52,[0.03,-0.07,-0.62,-1.5,0,-0.4,HFF,1.2,0]],[0.7,[0.05,-0.1,-0.5,-1.45,0,-0.3,HFF,1.2,0]],[1,[0.18,-0.55,-0.25,-1.2,-0.2,0.2,HFF,1,0]]],
  L:[[0,HOFF],[0.2,[-0.2,-0.6,-0.3,-1.2,0.2,-0.2,HFF,1,0]],[0.42,[-0.12,-0.2,-0.3,-1.3,0.2,-0.3,HFF,1.1,0]],[0.6,[-0.15,-0.3,-0.25,-1.2,0.2,-0.3,HFF,1.1,0]],[1,[-0.2,-0.65,-0.3,-1.2,0.2,-0.2,HFF,1,0]]]};
HQ['moreira.u']={dur:1.55,snd:[[0.15,'crack'],[0.22,'crack'],[0.42,'thump'],[0.58,'thump'],[0.75,'roar']],fx:'fire',shake:[[0.42,0.22],[0.58,0.22],[0.75,0.45]],
  R:[[0,[0.18,-0.6,-0.3,-1.3,-0.2,0.2,HFO,0.3,0]],[0.22,[0.11,-0.12,-0.3,-1.35,-0.2,0.3,HFF,1.1,0]],[0.34,[0.05,-0.16,-0.2,-0.4,-0.9,1.3,HFF,1.1,0]],[0.42,[0.03,-0.24,-0.13,-0.4,-0.9,1.3,HFF,1.1,0]],[0.5,[0.05,-0.16,-0.2,-0.4,-0.9,1.3,HFF,1.1,0]],[0.58,[0.03,-0.24,-0.13,-0.4,-0.9,1.3,HFF,1.1,0]],[0.75,[0.16,0.02,-0.36,-0.2,-0.3,0.4,HFF,1.2,0]],[0.9,[0.17,0.0,-0.36,-0.2,-0.3,0.4,HFF,1.2,0]],[1,[0.18,-0.6,-0.3,-1.3,-0.2,0.2,HFF,1,0]]],
  L:[[0,[-0.18,-0.6,-0.3,-1.3,0.2,-0.2,HFO,0.3,0]],[0.22,[-0.11,-0.12,-0.3,-1.35,0.2,-0.3,HFF,1.1,0]],[0.34,[-0.05,-0.16,-0.2,-0.4,0.9,-1.3,HFF,1.1,0]],[0.42,[-0.03,-0.24,-0.13,-0.4,0.9,-1.3,HFF,1.1,0]],[0.5,[-0.05,-0.16,-0.2,-0.4,0.9,-1.3,HFF,1.1,0]],[0.58,[-0.03,-0.24,-0.13,-0.4,0.9,-1.3,HFF,1.1,0]],[0.75,[-0.16,0.02,-0.36,-0.2,0.3,-0.4,HFF,1.2,0]],[0.9,[-0.17,0.0,-0.36,-0.2,0.3,-0.4,HFF,1.2,0]],[1,[-0.18,-0.6,-0.3,-1.3,0.2,-0.2,HFF,1,0]]]};
// ---- Padre Tomás ----
HQ['tomas.a']={dur:1.25,props:{R:'flask'},snd:[[0.25,'cork'],[0.5,'splash'],[0.62,'splash'],[0.74,'splash']],fx:'holy',shake:[[0.5,0.08]],
  R:[[0,[0.18,-0.55,-0.3,-0.3,-0.2,0.2,HFC,0.8,0]],[0.2,[0.07,-0.1,-0.32,0.1,-0.4,0.3,[1.2,1.2,1.3,1.3],0.9,0]],[0.3,[0.07,-0.09,-0.32,0.1,-0.4,0.3,[1.2,1.2,1.3,1.3],0.2,0]],[0.48,[0.12,-0.02,-0.36,-0.3,-0.2,-0.9,[1.2,1.2,1.3,1.3],1.0,0]],[0.56,[-0.04,-0.06,-0.38,-0.3,0.2,0.6,[1.2,1.2,1.3,1.3],1.0,0]],[0.66,[0.12,-0.04,-0.38,-0.3,-0.2,-0.8,[1.2,1.2,1.3,1.3],1.0,0]],[0.76,[-0.04,-0.06,-0.38,-0.3,0.2,0.6,[1.2,1.2,1.3,1.3],1.0,0]],[1,[0.18,-0.6,-0.3,-0.3,-0.2,0.2,HFC,0.8,0]]],
  L:[[0,HOFF],[0.1,[-0.2,-0.6,-0.3,-0.2,0.3,-0.2,HFO,0.2,0]],[0.3,[-0.06,-0.05,-0.34,-0.1,0.3,-0.2,HFV,1.2,0]],[0.4,[-0.06,-0.14,-0.34,-0.1,0.3,-0.2,HFV,1.2,0]],[0.48,[-0.1,-0.1,-0.34,-0.1,0.3,-0.2,HFV,1.2,0]],[0.56,[-0.02,-0.1,-0.34,-0.1,0.3,-0.2,HFV,1.2,0]],[0.75,[-0.2,-0.55,-0.3,-0.2,0.3,-0.2,HFO,0.3,0]],[1,[-0.2,-0.6,-0.3,-0.2,0.3,-0.2,HFO,0.3,0]]]};
HQ['tomas.u']={dur:1.6,props:{L:'cross'},snd:[[0.15,'choir'],[0.5,'holy'],[0.85,'holy']],fx:'holy',shake:[[0.5,0.2]],
  L:[[0,[-0.18,-0.6,-0.3,-0.2,0.3,-0.2,HFF,1,0]],[0.3,[-0.08,0.0,-0.36,0.05,0.2,-0.1,HFF,1.1,0]],[0.9,[-0.08,0.02,-0.37,0.05,0.2,-0.1,HFF,1.1,0]],[1,[-0.18,-0.6,-0.3,-0.2,0.3,-0.2,HFF,1,0]]],
  R:[[0,[0.18,-0.6,-0.3,-0.2,-0.3,0.2,HFC,0.4,0]],[0.35,[0.1,-0.04,-0.34,-0.05,-0.35,0.15,HFO,0.1,0.35]],[0.5,[0.1,-0.03,-0.42,-0.05,-0.35,0.15,HFO,0.1,0.42]],[0.9,[0.1,-0.03,-0.42,-0.05,-0.35,0.15,HFO,0.1,0.42]],[1,[0.18,-0.6,-0.3,-0.2,-0.3,0.2,HFC,0.4,0]]]};
// ---- Iara ----
HQ['iara.a']={dur:1.0,snd:[[0.12,'tick'],[0.48,'whoosh'],[0.56,'mark']],fx:'mark',
  L:[[0,[-0.18,-0.55,-0.3,-0.2,0.3,-0.2,HFO,0.3,0]],[0.22,[-0.03,0.02,-0.2,0.15,0.1,0.2,HFV,1.2,0]],[0.38,[-0.03,0.02,-0.19,0.15,0.1,0.2,HFV,1.2,0]],[0.56,[-0.04,-0.06,-0.5,-1.25,0.1,0.2,HFV,1.2,0]],[0.8,[-0.04,-0.06,-0.5,-1.25,0.1,0.2,HFV,1.2,0]],[1,[-0.18,-0.55,-0.3,-0.2,0.3,-0.2,HFO,0.3,0]]]};
HQ['iara.u']={dur:1.2,snd:[[0.1,'breath'],[0.65,'tick'],[0.75,'mark']],fx:'mark',
  L:[[0,[-0.18,-0.6,-0.3,-0.2,0.3,-0.2,HFO,0.3,0]],[0.25,[-0.01,0.03,-0.13,0.3,1.0,-1.3,HFC,0.8,0]],[0.6,[-0.01,0.03,-0.13,0.3,1.0,-1.3,[0.7,0.65,0.6,0.55],0.9,0]],[0.75,[-0.08,-0.15,-0.32,-0.2,0.5,-0.4,HFO,0.3,0.2]],[1,[-0.18,-0.6,-0.3,-0.2,0.3,-0.2,HFO,0.3,0]]],
  R:[[0,HOFF],[0.6,HOFF],[0.7,[0.18,-0.55,-0.3,-0.5,-0.2,0.2,[0.05,1.4,1.4,1.4],1.0,0]],[0.8,[0.08,-0.12,-0.36,-0.4,-0.2,0.2,[0.05,1.4,1.4,1.4],1.0,0]],[1,[0.18,-0.6,-0.3,-0.5,-0.2,0.2,HFF,1,0]]]};
// ---- V.I.K.T.O.R ----
HQ['viktor.a']={dur:1.0,snd:[[0.2,'zap'],[0.3,'zap'],[0.5,'boot']],fx:'elec',glitch:true,
  R:[[0,[0.18,-0.55,-0.3,-0.3,-0.2,0.2,HFO,0.3,0]],[0.22,[0.17,0.08,-0.17,0.2,-1.2,0.6,HFP,1.1,0]],[0.48,[0.17,0.08,-0.17,0.2,-1.2,0.6,HFP,1.1,0]],[0.62,[0.09,-0.1,-0.32,-0.3,-0.3,0.2,HFO,0.1,0.35]],[0.85,[0.09,-0.1,-0.32,-0.3,-0.3,0.2,HFF,1.1,0]],[1,[0.18,-0.55,-0.3,-0.3,-0.2,0.2,HFF,1,0]]]};
HQ['viktor.u']={dur:1.4,snd:[[0.1,'charge'],[0.62,'emp']],fx:'elec',glitch:true,shake:[[0.62,0.4]],
  R:[[0,[0.15,-0.6,-0.3,-0.2,-0.3,0.2,HFC,0.4,0]],[0.3,[0.03,-0.1,-0.3,-0.2,-1.3,0.2,HFC,0.5,0]],[0.55,[0.02,-0.1,-0.3,-0.2,-1.35,0.2,[0.8,0.75,0.7,0.65],0.5,0]],[0.65,[0.14,-0.04,-0.4,-0.1,-0.35,0.2,HFO,0.1,0.4]],[0.9,[0.15,-0.04,-0.41,-0.1,-0.35,0.2,HFO,0.1,0.4]],[1,[0.15,-0.6,-0.3,-0.2,-0.3,0.2,HFC,0.4,0]]],
  L:[[0,[-0.15,-0.6,-0.3,-0.2,0.3,-0.2,HFC,0.4,0]],[0.3,[-0.03,-0.1,-0.3,-0.2,1.3,-0.2,HFC,0.5,0]],[0.55,[-0.02,-0.1,-0.3,-0.2,1.35,-0.2,[0.8,0.75,0.7,0.65],0.5,0]],[0.65,[-0.14,-0.04,-0.4,-0.1,0.35,-0.2,HFO,0.1,0.4]],[0.9,[-0.15,-0.04,-0.41,-0.1,0.35,-0.2,HFO,0.1,0.4]],[1,[-0.15,-0.6,-0.3,-0.2,0.3,-0.2,HFC,0.4,0]]]};

/* ---------- objetos de mão ---------- */
const HPROP={};
function hpropMake(k){ if(HPROP[k]) return HPROP[k]; const g=new THREE.Group(), M2=(c,o)=>new THREE.MeshPhongMaterial(Object.assign({color:c,shininess:60},o||{}));
  if(k==='mag'){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.022,0.075,0.04),M2(0x2a2c2a)); b.rotation.x=0.18; g.add(b); for(let i=0;i<3;i++){ const r=new THREE.Mesh(new THREE.CylinderGeometry(0.004,0.004,0.03,6),M2(0xc8a040,{shininess:120})); r.rotation.x=Math.PI/2; r.position.set(0,0.04+i*0.002,-0.006+i*0.006); g.add(r); } g.position.set(0,0.035,-0.03); }
  if(k==='flare'){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.016,0.016,0.11,10),M2(0xb81a14)); g.add(b); const c=new THREE.Mesh(new THREE.CylinderGeometry(0.017,0.017,0.02,10),M2(0x1a1a1a)); c.position.y=0.065; g.add(c); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.012,0.002,4,10),M2(0xcccccc,{shininess:120})); ring.position.set(0.018,0.075,0); g.add(ring); g.userData.ring=ring; g.position.set(0,0.03,-0.03); g.rotation.x=0.3; }
  if(k==='watch'){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.012,0.04),M2(0x1a1a1a)); b.position.set(0,-0.03,0.04); g.add(b); const sc=new THREE.Mesh(new THREE.PlaneGeometry(0.026,0.03),new THREE.MeshBasicMaterial({color:0x6aff8a})); sc.rotation.x=-Math.PI/2; sc.position.set(0,-0.023,0.04); g.add(sc); }
  if(k==='syringe'){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.009,0.009,0.08,10),M2(0xddeeff,{transparent:true,opacity:0.55})); g.add(b); const liq=new THREE.Mesh(new THREE.CylinderGeometry(0.0075,0.0075,0.05,10),new THREE.MeshBasicMaterial({color:0x5aff9a})); liq.position.y=-0.01; g.add(liq); g.userData.liq=liq;
    const nd=new THREE.Mesh(new THREE.CylinderGeometry(0.0012,0.0012,0.035,4),M2(0xcccccc,{shininess:140})); nd.position.y=-0.057; g.add(nd); const pl=new THREE.Mesh(new THREE.CylinderGeometry(0.011,0.011,0.004,10),M2(0x2a6a9a)); pl.position.y=0.05; g.add(pl); g.userData.pl=pl; g.position.set(0,0.03,-0.022); g.rotation.z=Math.PI/2; }
  if(k==='flask'){ const b=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.024,0.06,12),M2(0x9ab0c8,{transparent:true,opacity:0.6,shininess:140})); g.add(b); const w=new THREE.Mesh(new THREE.CylinderGeometry(0.019,0.022,0.04,12),new THREE.MeshBasicMaterial({color:0x7ad0ff,transparent:true,opacity:0.7})); w.position.y=-0.008; g.add(w);
    const nk=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.012,0.02,10),M2(0x9ab0c8,{transparent:true,opacity:0.6})); nk.position.y=0.04; g.add(nk); const ck=new THREE.Mesh(new THREE.CylinderGeometry(0.009,0.008,0.014,8),M2(0x8a5a2a)); ck.position.y=0.055; g.add(ck); g.userData.cork=ck;
    const cr=new THREE.Mesh(new THREE.BoxGeometry(0.004,0.022,0.001),M2(0xd4b040)); cr.position.set(0,0.0,-0.023); g.add(cr); const cr2=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.004,0.001),M2(0xd4b040)); cr2.position.set(0,0.005,-0.023); g.add(cr2); g.position.set(0,0.03,-0.028); }
  if(k==='cross'){ const gm=M2(0xd4b040,{shininess:140,specular:0xffeeaa,emissive:0x3a2a00}); const v=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.11,0.008),gm); v.position.y=0.07; g.add(v); const h=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.012,0.008),gm); h.position.y=0.095; g.add(h);
    const ch=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.0015,4,16,Math.PI),gm); ch.position.set(0,0.0,0.01); ch.rotation.z=Math.PI; g.add(ch); g.position.set(0,0.02,-0.02); g.userData.glow=true; }
  HPROP[k]=g; return g; }

/* ---------- motor ---------- */
const HQS={q:null,hand:{R:null,L:null},prop:{R:null,L:null},fired:new Set(),prevC:null,vikAct:0};
function hqLerp(a,b,k){ if(!a&&!b) return null; if(!a) return k>0.5?b:null; if(!b) return k<0.5?a:null; const o=[]; for(let i=0;i<6;i++) o.push(lerp(a[i],b[i],k)); const fa=a[6], fb=b[6]; o.push([0,1,2,3].map(i=>lerp(fa[i],fb[i],k))); o.push(lerp(a[7],b[7],k)); o.push(lerp(a[8]||0,b[8]||0,k)); return o; }
function hqAt(keys,t){ if(!keys) return null; if(t<=keys[0][0]) return keys[0][1]; for(let i=1;i<keys.length;i++){ if(t<=keys[i][0]){ const a=keys[i-1], b=keys[i]; const k=smooth((t-a[0])/Math.max(1e-4,b[0]-a[0])); return hqLerp(a[1],b[1],k); } } return keys[keys.length-1][1]; }
function hqApply(h,p,side,trem){ if(!p){ h.visible=false; return; } h.visible=true; const s=side==='L'?-1:1;
  h.position.set(p[0]+trem*Math.sin(G.t*41+s),p[1]+trem*Math.sin(G.t*37),p[2]); h.rotation.set(p[3],p[4],p[5]);
  const U=h.userData, sx=U.sx||1; for(let i=0;i<4;i++){ const c=p[6][i]; for(let k=0;k<3;k++) U.fingers[i][k].rotation.x=-c*[1,0.92,0.72][k]; if(U.fingers[i].root) U.fingers[i].root.rotation.z=(i-1.5)*p[8]*0.5*sx; }
  if(U.thumb){ U.thumb.rotation.set(-0.7-p[7]*0.5,0,0.75*sx*(1-p[7]*0.45)); if(U.thumbSegs&&U.thumbSegs[1]) U.thumbSegs[1].rotation.x=-0.5-p[7]*0.6; } }
function hqSnd(k,dt){ try{ const t=Snd.now; const o=()=>Snd.out(0.7,0,0.25,null); const smp=(n,op)=>Snd.sample(n,Object.assign({prio:1,wet:0.15},op||{}));
  switch(k){
    case 'swish': smp('knife_whoosh',{vol:0.3,rate:1.5}); break;
    case 'whoosh': smp('knife_whoosh',{vol:0.5,rate:1.1}); break;
    case 'magout': smp('rl_mag_out',{vol:0.8}); break; case 'magin': smp('rl_mag_in',{vol:0.9}); setTimeout(()=>smp('rl_slide',{vol:0.6}),90); break;
    case 'tap': { const n=o(); Snd.burstTo(n,{t,type:'bandpass',freq:3400,q:5,dur:0.012,gain:0.6}); break; }
    case 'tick': { const n=o(); Snd.burstTo(n,{t,type:'bandpass',freq:5200,q:6,dur:0.01,gain:0.5}); Snd.oscTo(n,{t,freq:4200,dur:0.02,gain:0.05}); break; }
    case 'radio': try{ Snd.comms(true); }catch(e){} { const n=o(); Snd.burstTo(n,{t,type:'bandpass',freq:1800,q:1.5,dur:0.25,gain:0.25}); } break;
    case 'pin': { const n=o(); Snd.oscTo(n,{t,freq:2900,freqEnd:2600,dur:0.15,gain:0.12,type:'triangle'}); Snd.burstTo(n,{t,type:'highpass',freq:4000,dur:0.02,gain:0.4}); break; }
    case 'flare': { const n=o(); Snd.burstTo(n,{t,type:'highpass',freq:1500,dur:1.2,gain:0.35,attack:0.02}); break; }
    case 'stab': smp('knife_stab3',{vol:0.25,rate:1.8}); break;
    case 'hiss': { const n=o(); Snd.burstTo(n,{t,type:'highpass',freq:6000,dur:0.45,gain:0.25,attack:0.03}); break; }
    case 'heal': try{ Snd.abil('heal'); }catch(e){} break;
    case 'pulse': { const n=o(); Snd.oscTo(n,{t,freq:330,freqEnd:660,dur:0.35,gain:0.12,type:'sine'}); Snd.oscTo(n,{t,freq:495,freqEnd:990,dur:0.35,gain:0.07}); break; }
    case 'crack': { const n=o(); for(let i=0;i<3;i++) Snd.burstTo(n,{t:t+i*0.018,type:'bandpass',freq:2200+i*500,q:4,dur:0.01,gain:0.55}); break; }
    case 'punch': smp('hit_punch',{vol:0.9}); break;
    case 'thump': { const n=Snd.out(1,0,0.1,null); Snd.oscTo(n,{t,freq:80,freqEnd:42,dur:0.2,gain:0.7}); smp('hit_punch',{vol:0.4,rate:0.6}); break; }
    case 'roar': smp('z_groan_big',{vol:0.35,rate:1.35}); { const n=Snd.out(1,0,0.3,null); Snd.oscTo(n,{t,freq:70,freqEnd:50,dur:0.6,gain:0.45,type:'sawtooth'}); } break;
    case 'cork': { const n=o(); Snd.oscTo(n,{t,freq:900,freqEnd:300,dur:0.06,gain:0.3}); Snd.burstTo(n,{t,type:'bandpass',freq:1200,q:2,dur:0.03,gain:0.5}); break; }
    case 'splash': { const n=o(); Snd.burstTo(n,{t,type:'bandpass',freq:2600,q:0.9,dur:0.18,gain:0.35}); break; }
    case 'choir': { const n=Snd.out(0.8,0,0.6,null); [262,330,392,523].forEach((f,i)=>Snd.oscTo(n,{t:t+i*0.03,freq:f,dur:1.4,gain:0.05,attack:0.25,type:'triangle'})); break; }
    case 'holy': try{ Snd.abil('holy'); }catch(e){} break;
    case 'mark': try{ Snd.abil('mark'); }catch(e){} break;
    case 'breath': { const n=o(); Snd.burstTo(n,{t,type:'lowpass',freq:700,dur:0.6,gain:0.18,attack:0.2}); break; }
    case 'zap': { const n=o(); Snd.burstTo(n,{t,type:'bandpass',freq:5000,q:3,dur:0.05,gain:0.4}); Snd.oscTo(n,{t,freq:1800,freqEnd:400,dur:0.06,gain:0.08,type:'square'}); break; }
    case 'boot': { const n=o(); Snd.oscTo(n,{t,freq:200,freqEnd:1600,dur:0.3,gain:0.1,type:'square'}); break; }
    case 'charge': { const n=o(); Snd.oscTo(n,{t,freq:120,freqEnd:1400,dur:0.8,gain:0.12,type:'sawtooth'}); break; }
    case 'emp': try{ Snd.abil('emp'); }catch(e){} break; } }catch(e){} }
function hqProp(side,k){ const h=HFX.hands[side]; const cur=HQS.prop[side]; if(cur&&cur.userData.k===k) return; if(cur){ h.remove(cur); HQS.prop[side]=null; } if(!k) return; const g=hpropMake(k); g.userData.k=k; h.add(g); HQS.prop[side]=g; }
// substitui o início e o quadro da animação de mão
hfxStart=function(c,ult){ const q=HQ[c+'.'+(ult?'u':'a')];
  if(!q){ const G2=HFX_GESTURE[c]; const d=G2&&G2[ult?'u':'a']; if(!d) return; hfxBuild(); HQS.q=null; Object.assign(HFX,{on:true,t:0,dur:d.dur,c,ult,pose:d.pose,kind:d.fx}); return hfxOld(c,ult); }
  hfxBuild(); HQS.q=q; HQS.fired.clear(); Object.assign(HFX,{on:true,t:0,dur:q.dur,c,ult,pose:'hq',kind:q.fx==='gold'?'mark':q.fx==='holy'?'heal':q.fx});
  const col={gold:0xffcf72,mark:0xff9a59,heal:0x6affb5,dust:0xffb070,fire:0xff6a2a,holy:0x9ae8ff,elec:0x6ae8ff}[q.fx]||0xffffff; HFX.light.color.setHex(col); for(const p of HFX.parts){ p.s.material.color.setHex(col); p.s.visible=false; p.life=0; }
  hqProp('R',q.props&&q.props.R); hqProp('L',q.props&&q.props.L); };
const hfxOld=(function(){ const src=HFX_GESTURE; return function(c,ult){ const d=src[c]&&src[c][ult?'u':'a']; const col=HFX_COL[d.fx]; HFX.light.color.setHex(col); for(const p of HFX.parts){ p.s.material.color.setHex(col); p.s.visible=false; p.life=0; }
  const open=[0.12,0.08,0.04], fist=[1.55,1.5,1.2]; const {R,L}=HFX.hands; R.visible=L.visible=true; hqProp('R',null); hqProp('L',null);
  if(d.pose==='grab'){ hfxCurl(L,[0.2,0.15,0.1]); R.visible=false; } else { hfxCurl(R,open); hfxCurl(L,open); } }; })();
const _hfxFrame0=hfxFrame;
hfxFrame=function(dt){ const q=HQS.q; if(!HFX.on||!q||HFX.pose!=='hq') return _hfxFrame0(dt); if(!HFX.g) return;
  HFX.t+=dt; const k=HFX.t/HFX.dur; if(k>=1||P.down||G.state!=='playing'){ HFX.on=false; HFX.g.visible=false; HFX.light.intensity=0; hqProp('R',null); hqProp('L',null); return; }
  HFX.g.visible=true; const {R,L}=HFX.hands; const trem=(q.glitch?0.0025:0.0008)+(q.fx==='fire'&&k>0.6?0.002:0);
  const pr=hqAt(q.R,k), pl=hqAt(q.L,k); hqApply(R,pr?[pr[0]*1.3,pr[1]*1.15,pr[2]*1.4,pr[3],pr[4],pr[5],pr[6],pr[7],pr[8]]:null,'R',trem); hqApply(L,pl?[pl[0]*1.3,pl[1]*1.15,pl[2]*1.4,pl[3],pl[4],pl[5],pl[6],pl[7],pl[8]]:null,'L',trem);
  if(q.glitch&&Math.random()<dt*14){ const h=Math.random()<0.5?R:L; if(h.visible){ const f=h.userData.fingers[(Math.random()*4)|0]; f[0].rotation.x-=rand(0.2,0.6); } }
  // eventos de som e tranco no tempo certo
  for(const [tk,n] of (q.snd||[])) if(k>=tk&&!HQS.fired.has('s'+tk+n)){ HQS.fired.add('s'+tk+n); hqSnd(n); }
  for(const [tk,a] of (q.shake||[])) if(k>=tk&&!HQS.fired.has('k'+tk)){ HQS.fired.add('k'+tk); shake(a); try{ shotShake(a); }catch(e){} HFX.burst=1; }
  // objetos: pino do sinalizador sai, seringa esvazia, rolha do frasco sai, crucifixo brilha
  const pf=HQS.prop.R; if(pf&&pf.userData.k==='flare'&&pf.userData.ring) pf.userData.ring.visible=k<0.42; if(pf&&pf.userData.k==='flare') pf.visible=k<0.63;
  if(pf&&pf.userData.k==='syringe'){ const e=clamp((k-0.6)/0.15,0,1); pf.userData.liq.scale.y=1-e*0.9; pf.userData.liq.position.y=-0.01-e*0.022; pf.userData.pl.position.y=0.05-e*0.045; }
  if(pf&&pf.userData.k==='flask') pf.userData.cork.visible=k<0.28;
  // brilho, partículas e raios (mesmo sistema de antes, mas mais intenso nos picos)
  const up=smooth(clamp(k/0.18,0,1))*(1-smooth(clamp((k-0.85)/0.15,0,1))); HFX.burst=Math.max(0,(HFX.burst||0)-dt*3);
  const hs=[R,L].filter(h=>h.visible); if(hs.length){ HFX.light.intensity=up*(1.4+Math.sin(G.t*25)*0.3+HFX.burst*3); hs[0].getWorldPosition(_hv); HFX.g.worldToLocal(_hv); HFX.light.position.copy(_hv).add(new THREE.Vector3(0,0.05,-0.05)); }
  const kind=HFX.kind, rate=(kind==='elec'?10:kind==='dust'?30:55)*(1+HFX.burst*4);
  HFX.acc=(HFX.acc||0)+dt*rate*up; while(HFX.acc>=1&&hs.length){ HFX.acc--; const p=HFX.parts.find(q2=>q2.life<=0); if(!p) break; const h=pick(hs); h.getWorldPosition(_hv); HFX.g.worldToLocal(_hv);
    p.s.position.set(_hv.x+rand(-0.03,0.03),_hv.y+rand(0,0.06),_hv.z+rand(-0.03,0.03)); p.life=p.t=rand(0.25,0.55); p.sz=kind==='fire'?rand(0.04,0.09):rand(0.02,0.05);
    if(kind==='fire') p.v.set(rand(-0.05,0.05),rand(0.25,0.5),rand(-0.12,-0.02)); else if(kind==='heal') p.v.set(Math.cos(G.t*7+p.sz*99)*0.12,rand(0.1,0.28),Math.sin(G.t*7+p.sz*99)*0.12); else p.v.set(rand(-0.15,0.15),rand(-0.05,0.18),rand(-0.35,-0.1)); p.s.visible=true; }
  for(const p of HFX.parts){ if(p.life<=0) continue; p.life-=dt; const a=Math.max(0,p.life/p.t); p.s.position.addScaledVector(p.v,dt); p.s.material.opacity=a*(kind==='fire'?0.9:0.75); const sz=p.sz*(kind==='fire'?(0.6+a*0.6):1); p.s.scale.set(sz,sz*(kind==='fire'?1.5:1),1); if(kind==='fire') p.s.material.color.setHSL(0.03+a*0.08,1,0.45+a*0.2); if(p.life<=0) p.s.visible=false; }
  for(let i=0;i<HFX.arcs.length;i++){ const l=HFX.arcs[i]; const on=kind==='elec'&&up>0.3&&hs.length&&Math.random()<0.7; l.visible=!!on; if(!on) continue;
    const a=new THREE.Vector3(), b=new THREE.Vector3(); hs[0].getWorldPosition(a); (hs[1]||hs[0]).getWorldPosition(b); HFX.g.worldToLocal(a); HFX.g.worldToLocal(b); a.y+=0.05; b.y+=0.05; if(i>=2||hs.length<2){ b.copy(a); b.z-=rand(0.3,0.9); b.x+=rand(-0.25,0.25); b.y+=rand(-0.1,0.2); }
    const pa=l.geometry.attributes.position; for(let j=0;j<10;j++){ const f=j/9; pa.setXYZ(j,lerp(a.x,b.x,f)+(j&&j<9?rand(-0.02,0.02):0),lerp(a.y,b.y,f)+(j&&j<9?rand(-0.025,0.025):0),lerp(a.z,b.z,f)+(j&&j<9?rand(-0.02,0.02):0)); } pa.needsUpdate=true; l.material.opacity=0.6+Math.random()*0.4; }
  HFX.down=up; };
// o Overclock do Viktor não liga a recarga na hora (só depois), então dispara a animação quando ele ativa
v9On('frame',()=>{ const c=abc(); const on=c==='viktor'&&AB.act>0; if(on&&!HQS.vikAct&&!HFX.on) hfxStart('viktor',false); HQS.vikAct=on; });
// a Iara não tinha gesto na ultimate e o Cabo não tinha na habilidade: agora todas têm (ver HQ)
HFX_GESTURE.recruta.a={dur:1.15,pose:'hq',fx:'mark'}; HFX_GESTURE.iara.u={dur:1.2,pose:'hq',fx:'mark'}; HFX_GESTURE.viktor.a={dur:1.0,pose:'hq',fx:'elec'};
CMDS.gesto={d:'gesto <personagem> [ult] · mostra a animação de mãos da habilidade',f:a=>{ const c=a[0]||abc(); hfxStart(c,a[1]==='ult'); }};
