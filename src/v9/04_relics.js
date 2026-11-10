/* ================= v9 · RELÍQUIAS: drop raríssimo dos zumbis, vale 5 rodadas, só para quem pegou ================= */
const RELICS={
  luz:{name:'Lanterna Extraforte',sub:'Facho largo e muito forte, sem gastar bateria',col:0xfff2a0,css:'#fff2a0',ico:'☀'},
  exp:{name:'Tiro Explosivo',sub:'Cada acerto explode no alvo',col:0xff6a1a,css:'#ff6a1a',ico:'✹'},
  vel:{name:'Super Velocidade',sub:'+35% de velocidade',col:0x5af0ff,css:'#5af0ff',ico:'➤'},
  reg:{name:'Super Regeneração',sub:'A vida volta 4× mais rápido e logo depois do golpe',col:0x6aff7a,css:'#6aff7a',ico:'✚'},
  pts:{name:'Olho Gordo',sub:'+50% de pontos',col:0xffd24a,css:'#ffd24a',ico:'$'},
  vamp:{name:'Presas de Vampiro',sub:'Cada abate cura 12 de vida',col:0xd02040,css:'#d02040',ico:'♥'},
};
const RK=Object.keys(RELICS);
const REL={drops:[],hud:null,lastT:-99};
function v9Relics(){ return G.relics||(G.relics={}); }
const relOn=k=>(v9Relics()[k]|0)>0;
function v9RelicFlags(){ let f=0; RK.forEach((k,i)=>{ if(relOn(k)) f|=1<<i; }); return f; }
function v9SpeedK(){ return (relOn('vel')?1.35:1)*(typeof V9EV!=='undefined'&&V9EV.speedK||1); }
function v9RegenK(){ return relOn('reg')?4:1; }
function v9RegenDelay(){ return relOn('reg')?0.9:2.6; }
v9On('kill',(x,z,kind,part,src)=>{
  if(relOn('vamp')) P.hp=Math.min(P.maxHp,P.hp+12);
  if(G.t-REL.lastT<25||REL.drops.length>=1||x1Live()) return;
  const ch=0.0035*(Mod.drop||1)*(kind==='brute'||kind==='fat'?3:1)*(G.round<3?0.3:1);
  if(Math.random()<ch){ REL.lastT=G.t; relicSpawn(pick(RK),x,z); }
});
function relicModel(k){ const R=RELICS[k], g=new THREE.Group();
  const gold=v9Mat('relGold',{color:0xc8a24a,emissive:0x2a1a04,shininess:100,specular:0xfff0c0});
  const gem=new THREE.MeshPhongMaterial({color:R.col,emissive:R.col,emissiveIntensity:0.55,shininess:120,transparent:true,opacity:0.9});
  v9Mesh(new THREE.OctahedronGeometry(0.16,1),gem,g,0,0,0); const ring=v9Mesh(new THREE.TorusGeometry(0.24,0.018,8,28),gold,g,0,0,0,Math.PI/2,0,0);
  const ring2=v9Mesh(new THREE.TorusGeometry(0.3,0.012,6,28),gold,g,0,0,0,0.6,0.5,0); for(let i=0;i<4;i++) v9Mesh(new THREE.ConeGeometry(0.03,0.09,6),gold,g,Math.cos(i*Math.PI/2)*0.24,0,Math.sin(i*Math.PI/2)*0.24,0,0,Math.PI/2);
  g.userData={ring,ring2}; return g; }
function relicSpawn(k,x,z){ const g=new THREE.Group(); const m=relicModel(k); g.add(m);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:RELICS[k].col,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false,opacity:0.8})); glow.scale.set(2.2,2.2,1); g.add(glow);
  const beam=v9Mesh(new THREE.CylinderGeometry(0.06,0.32,6,10,1,true),new THREE.MeshBasicMaterial({color:RELICS[k].col,transparent:true,opacity:0.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),g,0,2.6,0);
  const fb=floorAt(x,z); g.position.set(x,fb+1,z); scene.add(g); REL.drops.push({k,g,m,glow,beam,x,z,fb,t:0});
  try{ Snd.reveal(3); }catch(e){} toast(`Uma relíquia caiu: ${RELICS[k].name}`); }
function relicPick(d){ const R=RELICS[d.k]; const rl=v9Relics(); rl[d.k]=Math.max(rl[d.k]|0,5); relicHud();
  banner(R.name.toUpperCase(),R.sub+' · por 5 rodadas','gold'); v9Flash(R.css,0.25,0.6); try{ Snd.reveal(4); Snd.puGet(); }catch(e){} actLog(`{n} pegou a relíquia ${R.name}`); }
v9On('frame',dt=>{
  for(let i=REL.drops.length-1;i>=0;i--){ const d=REL.drops[i]; d.t+=dt; d.m.rotation.y+=dt*1.6; d.m.userData.ring.rotation.z+=dt*2; d.m.userData.ring2.rotation.y-=dt*1.4;
    d.g.position.y=d.fb+1+Math.sin(G.t*2.2)*0.12; d.glow.material.opacity=0.6+Math.sin(G.t*5)*0.2; d.g.visible=d.t<40||Math.floor(d.t*8)%2===0;
    if(!P.down&&Math.hypot(P.pos.x-d.x,P.pos.z-d.z)<1.3){ scene.remove(d.g); REL.drops.splice(i,1); relicPick(d); continue; }
    if(d.t>46){ scene.remove(d.g); REL.drops.splice(i,1); } }
  // lanterna extraforte: sem gastar bateria, facho largo
  if(relOn('luz')){ FL.bat=Math.max(FL.bat,0.999); if(FL.on){ flashL.intensity*=1.9; flashL.distance=48; flashL.angle=0.62; flashHot.intensity*=1.6; } } else if(flashL.distance!==30){ flashL.distance=30; flashL.angle=0.46; }
});
v9On('fire',(s,d,hitZs,boomAt)=>{ if(relOn('exp')&&boomAt&&!d.proj&&(!d.auto||Math.random()<0.5)) explodeSplash(boomAt,d.dmg*0.45*(d.pellets?1.8:1),1.9,0xff6a1a,d.auto); });
v9On('roundEnd',()=>{ const rl=v9Relics(); let ch=false; for(const k of RK) if(rl[k]>0){ rl[k]--; ch=true; if(!rl[k]) toast(`${RELICS[k].name} acabou`,{bad:true}); } if(ch) relicHud(); });
v9On('reset',()=>{ G.relics={}; for(const d of REL.drops) scene.remove(d.g); REL.drops.length=0; REL.lastT=-99; relicHud(); });
function relicHud(){ if(!REL.hud){ REL.hud=v9El('div'); REL.hud.id='relhud'; const h=document.getElementById('hud')||document.body; h.appendChild(REL.hud); }
  const rl=v9Relics(); REL.hud.innerHTML=RK.filter(k=>rl[k]>0).map(k=>`<div class="rel" style="--c:${RELICS[k].css}" title="${RELICS[k].name}"><b>${RELICS[k].ico}</b><small>${rl[k]}</small></div>`).join(''); }
v9Css(`#relhud{position:fixed;left:18px;bottom:150px;display:flex;gap:6px;z-index:6}
#relhud .rel{width:34px;height:34px;border:1px solid var(--c);background:rgba(8,8,6,.7);box-shadow:0 0 10px var(--c) inset;display:flex;align-items:center;justify-content:center;position:relative;color:var(--c);font:700 17px Impact,sans-serif}
#relhud .rel small{position:absolute;right:-4px;bottom:-6px;font:700 11px "Special Elite",monospace;background:#0b0a08;color:#eee;padding:0 3px;border:1px solid var(--c)}`);
/* pontos +50% (Olho Gordo): multiplicador aplicado em addPoints */
function v9PtsK(){ return relOn('pts')?1.5:1; }
