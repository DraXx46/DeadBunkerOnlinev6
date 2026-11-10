/* ================= v9 · BESTA (arma nova): modelo em código, virote que voa e fica cravado, sons do Artlist ================= */
WEAPONS.xbow={name:'Besta Carcará',model:'xbow',sil:'xbow',snd:'xbow',dmg:950,head:3.5,mag:1,reserve:28,rpm:42,auto:false,reload:1.25,spread:0.0015,recoil:0.02,pen:5,box:true,zoom:14,boxW:0.5};
UPNAME.xbow='Besta Carcará Fúria';
SIL.xbow=[[[150,118],[300,118],[300,130],[150,130]],[[300,110],[360,104],[360,140],[300,136]],[[175,124],[205,70],[212,74],[184,124]],[[175,124],[205,178],[212,174],[184,124]],[[300,128],[322,170],[334,168],[316,128]]];
const XB={mats:null,bolts:[],vmBolt:null};
function xbMats(tier){ if(!XB.mats) XB.mats={
  wood:new THREE.MeshPhongMaterial({color:0x5a3a22,shininess:30,specular:0x332211}), dark:new THREE.MeshPhongMaterial({color:0x22252a,shininess:70,specular:0x777777}),
  steel:new THREE.MeshPhongMaterial({color:0x8a9098,shininess:110,specular:0xffffff}), limb:new THREE.MeshPhongMaterial({color:0x2c3a2a,shininess:50,specular:0x445544}),
  string:new THREE.MeshBasicMaterial({color:0xd8d0b8}), fletch:new THREE.MeshLambertMaterial({color:0xb02018,side:THREE.DoubleSide}), glass:new THREE.MeshPhongMaterial({color:0x0a1a2a,shininess:120,specular:0x99bbff}) };
  return XB.mats; }
function xbBolt(m){ const b=new THREE.Group(); const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.0045,0.0045,0.36,6),m.dark); sh.rotation.x=Math.PI/2; b.add(sh);
  const tip=new THREE.Mesh(new THREE.ConeGeometry(0.009,0.04,4),m.steel); tip.rotation.x=-Math.PI/2; tip.position.z=-0.2; b.add(tip);
  for(let i=0;i<3;i++){ const f=new THREE.Mesh(new THREE.PlaneGeometry(0.05,0.018),m.fletch); f.position.z=0.15; f.rotation.set(0,Math.PI/2,i*Math.PI*2/3); f.position.x=Math.cos(i*2.09)*0.008; f.position.y=Math.sin(i*2.09)*0.008; b.add(f); } return b; }
function xbowBuild(tier){ const m=xbMats(tier), g=new THREE.Group(); g.name='Besta';
  const add=(geo,mat,x,y,z,rx,ry,rz)=>v9Mesh(geo,mat,g,x,y,z,rx,ry,rz);
  // coronha de madeira com recorte, empunhadura de pistola, trilho de metal
  add(new THREE.BoxGeometry(0.045,0.075,0.3),m.wood,0,-0.015,0.22); add(new THREE.BoxGeometry(0.05,0.11,0.06),m.wood,0,-0.03,0.36,0.1,0,0);
  add(new THREE.BoxGeometry(0.035,0.1,0.045),m.wood,0,-0.085,0.1,-0.35,0,0);
  add(new THREE.BoxGeometry(0.04,0.035,0.62),m.dark,0,0.02,-0.12); add(new THREE.BoxGeometry(0.012,0.008,0.6),m.steel,0,0.041,-0.12);
  add(new THREE.BoxGeometry(0.012,0.03,0.04),m.steel,0,-0.03,0.06); // gatilho
  add(new THREE.TorusGeometry(0.03,0.004,6,12,Math.PI),m.dark,0,-0.035,0.07,0,Math.PI/2,Math.PI);
  // arcos (dois braços curvos) e cabo
  const L=new THREE.Group(); L.position.set(0,0.02,-0.4); g.add(L);
  for(const sx of [-1,1]){ const arc=new THREE.Mesh(new THREE.TorusGeometry(0.2,0.011,8,20,Math.PI*0.42),m.limb); arc.rotation.set(Math.PI/2,0,sx>0?-0.12:Math.PI+0.12-Math.PI*0.42); arc.position.z=0.12; L.add(arc);
    const cam=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.012,12),m.steel); cam.position.set(sx*0.195,0,0.06); L.add(cam); }
  add(new THREE.BoxGeometry(0.06,0.04,0.05),m.dark,0,0.02,-0.4);
  const str=new THREE.Group(); g.add(str); XB.strL=null;
  for(const sx of [-1,1]){ const s=new THREE.Mesh(new THREE.CylinderGeometry(0.0018,0.0018,0.29,4),m.string); s.position.set(sx*0.1,0.036,-0.24); s.rotation.set(Math.PI/2,0,0); s.rotation.y=sx*1.05; str.add(s); }
  // estribo, luneta, virote carregado
  add(new THREE.TorusGeometry(0.045,0.006,6,14,Math.PI),m.steel,0,0.02,-0.47,Math.PI/2,0,0);
  const sc=add(new THREE.CylinderGeometry(0.016,0.016,0.16,12),m.dark,0,0.085,-0.02,Math.PI/2,0,0); add(new THREE.CylinderGeometry(0.019,0.016,0.03,12),m.dark,0,0.085,-0.11,Math.PI/2,0,0); add(new THREE.CircleGeometry(0.015,12),m.glass,0,0.085,0.061);
  for(const z of [-0.06,0.03]) add(new THREE.BoxGeometry(0.01,0.03,0.012),m.dark,0,0.06,z);
  const bolt=xbBolt(m); bolt.position.set(0,0.05,-0.14); bolt.name='bolt'; g.add(bolt);
  g.userData={muzzle:-0.5,fore:-0.3,foreY:-0.03,sight:0.085,xbBolt:bolt};
  try{ Object.assign(g.userData,gunGeom(g)); }catch(e){}
  if(tier>0) g.traverse(o=>{ if(o.isMesh&&o.material&&o.material.emissive&&o.material!==m.string){ o.material=o.material.clone(); o.material.emissive.setHex(TIER_COL[tier]).multiplyScalar(0.12); } });
  return g; }
const _v9bg=buildGun;
buildGun=function(id,tier){ if(id==='xbow'){ const g=xbowBuild(tier|0); return g; } return _v9bg(id,tier); };
try{ GUN_VIEWMODEL_CONFIG.xbow=JSON.parse(JSON.stringify(GUN_VIEWMODEL_CONFIG.kar98k)); GUN_VIEWMODEL_CONFIG.xbow.weapon={position:[0.03,-0.012,-0.06],rotationDeg:[0,0,0],scale:1}; GUN_VIEWMODEL_CONFIG.xbow.ads.sightHeight=0.085; }catch(e){}
/* o virote voa até o alvo e fica cravado (no zumbi cai junto, na parede fica) */
v9On('fire',(s,d,hitZs,boomAt,firstZ,firstPt)=>{ if(s.id!=='xbow') return;
  const gm=gunModel&&gunModel.userData; if(gm&&gm.xbBolt) gm.xbBolt.visible=false; XB.empty=true;
  camera.getWorldDirection(_v9v); const o=camera.position.clone().addScaledVector(_v9v,0.6); o.y-=0.08;
  let end=firstPt?firstPt.clone():null, stuck=null; if(!end){ const t=rayWall(camera.position,_v9v,90); end=camera.position.clone().addScaledVector(_v9v,Math.min(t,90)); } else stuck=firstZ;
  const b=xbBolt(xbMats(0)); b.scale.setScalar(1.6); b.position.copy(o); b.lookAt(end); b.rotateY(Math.PI); scene.add(b);
  const dist=o.distanceTo(end); XB.bolts.push({b,o,end,t:0,dur:Math.max(0.05,dist/90),stuck,life:0});
  if(XB.bolts.length>14){ const q=XB.bolts.shift(); scene.remove(q.b); } });
v9On('always',dt=>{ for(let i=XB.bolts.length-1;i>=0;i--){ const q=XB.bolts[i];
    if(q.t<q.dur){ q.t+=dt; const k=Math.min(1,q.t/q.dur); q.b.position.lerpVectors(q.o,q.end,k); if(k>=1){ Snd.sample('arrow_hit',{x:q.end.x,z:q.end.z,range:30,vol:0.9}); if(q.stuck){ q.zoff=q.end.clone().sub(q.stuck.pos); q.zy=zy(q.stuck); } else emit('chip',q.end.x,q.end.y,q.end.z,5,2,0.4,9); } continue; }
    q.life+=dt; if(q.stuck){ const z=q.stuck; if(z.dead&&z.state!=='dying'){ scene.remove(q.b); XB.bolts.splice(i,1); continue; } q.b.position.set(z.pos.x+q.zoff.x,q.end.y+(zy(z)-q.zy),z.pos.z+q.zoff.z); }
    if(q.life>25){ scene.remove(q.b); XB.bolts.splice(i,1); } }
  // recarga: som da corda sendo puxada e virote aparecendo de novo
  const s=curSlot(); if(s&&s.id==='xbow'){ if(Wp.reloading&&!XB.relSnd){ XB.relSnd=true; setTimeout(()=>{ try{ Snd.sample('crossbow_reload',{vol:1,prio:true}); }catch(e){} },350); }
    if(!Wp.reloading) XB.relSnd=false; const gm=gunModel&&gunModel.userData; if(gm&&gm.xbBolt) gm.xbBolt.visible=s.mag>0||(Wp.reloading&&Wp.reloadT<wstat(s).reload*0.45); } });
v9On('reset',()=>{ for(const q of XB.bolts) scene.remove(q.b); XB.bolts.length=0; });
/* a besta também aparece em algumas paredes */
