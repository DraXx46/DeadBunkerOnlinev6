/* ================= v9 · ZUMBIS COM RAGDOLL NA MORTE =================
   Vivo: animação pronta (barata). Na morte por tiro/faca: o corpo vira o ragdoll de física do laboratório (58_ragman),
   começando exatamente da pose e da velocidade da animação, com o coice do golpe que matou. Quando ele assenta no chão
   o corpo congela (para de simular e de reagir) e o processamento é devolvido. Tudo local: cada jogador simula o seu.
   · no máximo ZRAG.max corpos simulando ao mesmo tempo (o mais antigo congela na hora)
   · longe ou fora da tela: usa a queda animada antiga
   · tronco articulado (barriga e peito separados, com a camisa dobrando) e animações suavizadas
   · tiros e explosões empurram o corpo enquanto ele ainda está caindo; escopeta/sniper podem arrancar braço ou perna */
const ZRAG={on:true,max:8,life:9,keep:22,active:[],pool:[],ms:0,n:0,starts:0,frozen:0,skips:0};
const ZRG={on:false,s:1};
/* ---- proporções: o esqueleto do laboratório (1,76 m) esticado para o corpo dos zumbis (~1,9 m, ombros largos) ---- */
const ZRY=[[0,0],[0.085,0.07],[0.5,0.47],[0.925,0.91],[1.02,1.01],[1.185,1.2],[1.425,1.5],[1.47,1.59],[1.655,1.775],[1.8,1.92],[3,3.1]];
function zrY(y){ for(let i=1;i<ZRY.length;i++){ const a=ZRY[i-1], b=ZRY[i]; if(y<=b[0]) return a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]); } return y; }
function zrSkMap(fn){ const keep={}; for(const k in RMSK){ keep[k]=RMSK[k].slice(); const p=RMSK[k]; p[1]=zrY(p[1]); if(k==='sh'||k==='el'||k==='wr'||k==='fing') p[0]+=0.065; }
  try{ return fn(); } finally{ for(const k in keep){ const p=RMSK[k]; p[0]=keep[k][0]; p[1]=keep[k][1]; p[2]=keep[k][2]; } } }
{ const bd0=rmBodyDefs; rmBodyDefs=function(){ if(!ZRG.on) return bd0(); const B=zrSkMap(bd0), s=ZRG.s;
    for(const d of B){ if(d.part==='pelvis'||d.part==='belly'||d.part==='chest'||d.part==='head'||d.part==='foot'){ d.com.y=zrY(d.com.y); if(d.part!=='foot') for(const sh of d.shapes){ sh.a.y=zrY(sh.a.y); sh.b.y=zrY(sh.b.y); } }
      d.com.x*=s; d.com.y*=s; d.com.z*=s; d.m*=s*s*s; d.box=d.box.map(v=>v*s); for(const sh of d.shapes){ for(const p of [sh.a,sh.b]){ p.x*=s; p.y*=s; p.z*=s; } sh.r*=s; } }
    return B; };
  const jd0=rmJointDefs; rmJointDefs=function(){ if(!ZRG.on) return jd0(); const J=zrSkMap(jd0), s=ZRG.s; for(const j of J){ j.at.x*=s; j.at.y*=s; j.at.z*=s; j.k*=s*s*s; } return J; }; }
/* ---- tronco articulado: o peito vira um "osso" próprio filho da coluna; a metade de cima da camisa acompanha o peito ---- */
function zrSplitTorso(z){ if(z._chestP||!z.spine||!z.torso||z.kind==='dog'||z.kind==='mega') return;
  const sp=z.spine, cp=new THREE.Group(); cp.position.y=0.3; const mv=[];
  for(const c of sp.children) if(c!==z.torso&&c.position.y>=0.29) mv.push(c);
  if(!mv.length) return; for(const c of mv){ sp.remove(c); c.position.y-=0.3; cp.add(c); } sp.add(cp); z._chestP=cp;
  z._chestM=mv.find(c=>c.isMesh&&c.geometry===ZG.chest)||mv.find(c=>c.isMesh)||null; }
{ const zs0=zSkin; zSkin=function(z){ try{ if(z&&z.kind!=='dog'&&!z.skin) zrSplitTorso(z); }catch(e){ console.warn('[Bunker] tronco articulado',e); }
    const r=zs0.apply(this,arguments);
    try{ if(z&&z.skin&&z._chestM&&z.torso){ const bones=z.skin.skel.bones, ti=bones.indexOf(z.torso), ci=bones.indexOf(z._chestM);
        if(ti>=0&&ci>=0) for(const sm of z.skin.meshes){ const ge=sm.geometry, P=ge.attributes.position, SI=ge.attributes.skinIndex, SW=ge.attributes.skinWeight;
          for(let v=0;v<P.count;v++){ if(SI.getX(v)!==ti) continue; const y=P.getY(v), t=Math.min(1,Math.max(0,(y-1.24)/0.22)), w=t*t*(3-2*t); if(w<=0) continue;
            SI.setXY(v,ti,ci); SW.setXY(v,1-w,w); } } } }catch(e){ console.warn('[Bunker] dobra do tronco',e); }
    return r; }; }
/* ---- roupas novas (mesmo modelo articulado; escolhidas pela semente, então todo mundo vê igual) ---- */
Object.assign(OUTFITS,{
  cop:{base:'#24304a',collar:'#1a2236',buttons:'#c8c070',pockets:true,belt:'#121212',tears:2,blood:8,pants:'#1e2638'},
  prisoner:{base:'#c8642a',collar:'#a8501e',tears:2,blood:9,pants:'#c8642a'},
  hoodie:{base:'#4a4a4e',straps:'#38383c',tears:3,blood:10,pants:'#2c3442'},
  firefighter:{base:'#4a3e26',bib:'#57492c',belt:'#c9b23a',tears:2,blood:7,pants:'#4a3e26'},
  tracksuit:{base:'#2a4f3a',collar:'#e0e0d8',straps:'#d8d8d0',tears:2,blood:8,pants:'#2a4f3a'},
  construction:{base:'#b8a43a',bib:'#d06a1e',pockets:true,tears:2,blood:9,pants:'#3a4a5e'} });
const ZRNEW=['cop','prisoner','hoodie','firefighter','tracksuit','construction'];
{ const zb0=zombieBody; zombieBody=function(z){ let set=false;
    try{ if(z&&!CHEAT.forceOutfit&&!z.boss&&z.kind!=='brute'&&z.kind!=='dog'&&z.kind!=='mega'&&CUR!=='hosp'){ const r=mulberry((z.seed|0)*7+3); if(r()<0.3){ CHEAT.forceOutfit=ZRNEW[Math.floor(r()*ZRNEW.length)]; set=true; } } }catch(e){}
    try{ return zb0.apply(this,arguments); } finally{ if(set) CHEAT.forceOutfit=null; } }; }
/* ---- animação viva: torção de quadril/ombro na passada e transições suaves (sem estalo entre andar, correr, atacar, rastejar) ---- */
const ZRSM=['hips','spine','_chestP','headP'];
function zrBones(z){ if(z._smB) return z._smB; const L=[]; for(const n of ZRSM) if(z[n]) L.push([z[n],18]);
  for(const a of [z.armL,z.armR]) if(a){ if(a.sh) L.push([a.sh,16]); if(a.el) L.push([a.el,16]); }
  for(const l of [z.legL,z.legR]) if(l){ if(l.th) L.push([l.th,30]); if(l.kn) L.push([l.kn,30]); }
  return z._smB=L; }
{ const az0=animateZombie; animateZombie=function(z,dt){ if(!z||z.kind==='dog'||z.state==='dying'||!z.hips||z.kind==='mega') return az0.apply(this,arguments);
    const r=az0.apply(this,arguments);
    try{ const cp=z._chestP, walk=z.moving&&!z.crawl&&z.attackT<=0&&z.state!=='tear'&&z.state!=='climb'&&z.state!=='rise';
      const ph=z.animT||0, s=Math.sin(ph), run=z.runner&&walk;
      if(walk){ z.hips.rotation.y=s*(run?0.16:0.1); z.hips.rotation.z=Math.cos(ph)*(run?0.03:0.045); if(cp){ cp.rotation.y=-s*(run?0.24:0.14); cp.rotation.x=run?0.06:0.03; } z.headP.rotation.y=s*0.06; }
      else { z.hips.rotation.y=0; z.hips.rotation.z=0; if(cp) cp.rotation.set(z.crawl?0.15:0,0,0); }
      if(dt>0&&dt<0.5){ const B=zrBones(z); if(!z._sm){ z._sm=new Float32Array(B.length*3+1); for(let i=0;i<B.length;i++){ const o=B[i][0].rotation; z._sm[i*3]=o.x; z._sm[i*3+1]=o.y; z._sm[i*3+2]=o.z; } z._sm[B.length*3]=z.hips.position.y; }
        else { const S=z._sm; for(let i=0;i<B.length;i++){ const o=B[i][0].rotation, k=1-Math.exp(-B[i][1]*dt); S[i*3]+=(o.x-S[i*3])*k; S[i*3+1]+=(o.y-S[i*3+1])*k; S[i*3+2]+=(o.z-S[i*3+2])*k; o.set(S[i*3],S[i*3+1],S[i*3+2]); }
          const n=B.length*3, k=1-Math.exp(-20*dt); S[n]+=(z.hips.position.y-S[n])*k; z.hips.position.y=S[n]; } } }catch(e){}
    return r; }; }
/* ---- registro do golpe que matou (direção, ponto, arma) ---- */
function zrNow(){ return performance.now()/1000; }
{ const hr0=zHitReact; zHitReact=function(z,dx,dz,dmg,part,src){ try{ if(z){ const l=z._lh||(z._lh={}); l.dx=dx; l.dz=dz; l.dmg=dmg; l.part=part; l.src=src; l.t=zrNow(); l.pt=null;
      let cls=src==='knife'?(dmg>=150?'knifeH':'knife'):src==='splash'?'blast':null;
      if(src==='gun'){ try{ const sl=curSlot(); const w=sl&&WEAPONS[sl.id]; cls=w&&w.snd||null; }catch(e){} } l.cls=cls; } }catch(e){} return hr0.apply(this,arguments); }; }
{ const dz0=damageZombie; damageZombie=function(z,amt,part,src,hitPt){ try{ if(z&&hitPt&&z._lh&&zrNow()-z._lh.t<0.05) z._lh.pt={x:hitPt.x,y:hitPt.y,z:hitPt.z}; }catch(e){} return dz0.apply(this,arguments); }; }
/* ---- instâncias de física (só física, sem malha própria) ---- */
function zrInst(){ return ZRAG.pool.pop()||{RM:null,RMPH:null}; }
const ZRMAP=[['pelvis','hips'],['abdomen','spine'],['chest','_chestP'],['head','neckP'],['uarmL','R.sh'],['farmL','R.el'],['handL','R.hand'],['uarmR','L.sh'],['farmR','L.el'],['handR','L.hand'],['thighL','R.th'],['shinL','R.kn'],['thighR','L.th'],['shinR','L.kn']];
function zrBone(z,key){ if(key[1]!=='.') return z[key]; const side=key[0]==='R', n=key.slice(2);
  if(n==='th'||n==='kn'){ const l=side?z.legR:z.legL; return l?l[n]:null; }
  const a=side?z.armR:z.armL; if(!a) return null;
  if(n==='hand'){ if(a._hand!==undefined) return a._hand; const pm=a.meshes&&a.meshes[2]; return a._hand=pm&&pm.parent&&pm.parent!==a.el?pm.parent:null; }
  return a[n]; }
function zrRestPivot(z,o){ const p=new THREE.Vector3(); for(let n=o;n&&n!==z.g;n=n.parent){ if(n===z.hips) p.y+=0.95, p.x+=n.position.x, p.z+=n.position.z; else p.add(n.position); } return p; }
function zrVisible(o,g){ for(let n=o;n&&n!==g;n=n.parent) if(!n.visible) return false; return true; }
const _zq=new THREE.Quaternion(), _zp=new THREE.Vector3(), _zs=new THREE.Vector3();
function zrEligible(z){ if(!ZRAG.on||!z||z.kind==='dog'||z.kind==='mega'||z.crawl||!z.hips||!z.spine||!z.legL||!z.armL||!z.root) return false;
  if(z.dcause) return false; try{ if(CUR==='tz'&&typeof tzInBus==='function'&&tzInBus(z.pos.x,z.pos.z,0.6)) return false; }catch(e){} const c=typeof deathCause==='function'?deathCause(z):''; if(c) return false;
  if(typeof camera!=='undefined'){ const d=Math.hypot(z.pos.x-camera.position.x,z.pos.z-camera.position.z); if(d>(CFG.potato?26:42)) return false; }
  return true; }
function zrStart(z){
  // limite de corpos simulando: o mais antigo congela agora
  const max=CFG.potato?Math.min(3,ZRAG.max):ZRAG.max; while(ZRAG.active.length>=max) zrFreeze(ZRAG.active[0]);
  const k0=rmInst0(), I=zrInst(); const S=z.g.scale, s=S.y;
  if(!I.RM){ I.RM=JSON.parse(RM0); I.RMPH={B:[],J:[],byName:{},pairs:[],cts:[],scts:[],h:1/720}; }
  rmUse(I); ZRG.on=true; ZRG.s=s;
  try{ rmPhysBuild(); } finally{ ZRG.on=false; }
  RM.map=CUR; RM.on=true; RM.built=true; RM.t=0; rmPhysReset(0,0,0); rmUnplantAll();
  z.root.updateMatrixWorld(true);
  const N=RMPH.byName, off={}, bones={}, done=new Set();
  for(const [bn,key] of ZRMAP){ let o=key==='_chestP'?(z._chestP||z.spine):key==='neckP'?(z.neckP||z.headP):zrBone(z,key); const b=N[bn];
    if(!o||!zrVisible(o,z.g)){ // parte que não existe (braço perdido, perna arrancada): solta e estaciona
      for(const j of RMPH.J) if(j.C===b){ j.on=false; } b.kin=true; b.im=0; b.iI.x=b.iI.y=b.iI.z=0; b.x.y=-60; for(const sh of b.shapes) sh.r=0.001; continue; }
    const R=zrRestPivot(z,o).multiplyScalar(s); off[bn]=rmv(b.com.x-R.x,b.com.y-R.y,b.com.z-R.z); bones[bn]=o;
    o.matrixWorld.decompose(_zp,_zq,_zs); _zq.normalize(); b.q.x=_zq.x; b.q.y=_zq.y; b.q.z=_zq.z; b.q.w=_zq.w;
    const r=qrot(rmv(),b.q,off[bn]); b.x.x=_zp.x+r.x; b.x.y=_zp.y+r.y; b.x.z=_zp.z+r.z; done.add(bn); }
  // pés seguem a canela
  for(const [f,sh] of [['footL','shinL'],['footR','shinR']]){ const b=N[f], c=N[sh]; if(!done.has(sh)){ for(const j of RMPH.J) if(j.C===b) j.on=false; b.kin=true; b.im=0; b.iI.x=b.iI.y=b.iI.z=0; b.x.y=-60; for(const q of b.shapes) q.r=0.001; continue; }
    const d=rmv(b.com.x-c.com.x,b.com.y-c.com.y,b.com.z-c.com.z); qcp(b.q,c.q); const r=qrot(rmv(),c.q,d); b.x.x=c.x.x+r.x; b.x.y=c.x.y+r.y; b.x.z=c.x.z+r.z; }
  if(z.head&&!z.head.visible){ for(const q of N.head.shapes) if(q.tag==='head') q.r=0.001; }
  // nunca começa dentro do chão (zumbi saindo da terra, degrau): sobe o corpo inteiro
  { let lo=0; const e=rmv(); for(const b of RMPH.B){ if(b.kin) continue; const fy=rmFloor(b.x.x,b.x.z); for(const q of b.shapes){ for(const p of [q.a,q.b]){ qrot(e,b.q,p); lo=Math.min(lo,b.x.y+e.y-q.r-fy); } } }
    if(lo<0) for(const b of RMPH.B){ if(!b.kin) b.x.y-=lo; } }
  for(const b of RMPH.B){ vcp(b.xp,b.x); qcp(b.qp,b.q); }
  rmAttach(); for(const b of RMPH.B) rmIwUpd(b);
  // velocidade da animação (andando/correndo) + empurrão que ele já levava
  const sp=z.moving?(z.speed||1.3)*(z.runner?0.85:0.6):0, yaw=z.yaw||0; const vx=Math.sin(yaw)*sp+(z.kbx||0)*0.5, vz=Math.cos(yaw)*sp+(z.kbz||0)*0.5;
  for(const b of RMPH.B){ if(b.kin) continue; b.v.x=vx; b.v.y=0; b.v.z=vz; }
  RM.st='stand'; rmKill();
  // coice do golpe que matou
  const lh=z._lh&&zrNow()-z._lh.t<0.35?z._lh:null; let cls='rifle', J=14, hb=N.chest, hp=null, dir=null, big=false;
  if(lh){ cls=lh.cls||(lh.src==='knife'?'knife':'rifle'); const dl=Math.hypot(lh.dx,lh.dz)||1; dir=rmv(lh.dx/dl,0,lh.dz/dl);
    // o golpe que mata é o tiro inteiro (todos os chumbos da escopeta) e cai com mais vontade que um tiro qualquer
    const mul=cls==='shotgun'?5.5:cls==='sniper'?1.1:cls==='knife'?1.6:cls==='knifeH'?1.4:1.8;
    if(cls==='blast'){ J=150; dir.y=0.55; } else J=(RMKB[cls]!=null?RMKB[cls]:24)*mul*rmCl((lh.dmg||40)/45,0.7,1.5);
    if(lh.pt){ hp=rmv(lh.pt.x,lh.pt.y,lh.pt.z); let bd=9; for(const b of RMPH.B){ if(b.kin) continue; const d=Math.hypot(b.x.x-hp.x,b.x.y-hp.y,b.x.z-hp.z); if(d<bd){ bd=d; hb=b; } } }
    else hb=lh.part==='head'?N.head:lh.part==='legs'?N[Math.random()<0.5?'thighL':'shinR']:N[Math.random()<0.6?'chest':'abdomen'];
    big=cls==='shotgun'||cls==='sniper'||cls==='revolver'&&lh.dmg>90; }
  else { dir=rmv(-Math.sin(yaw)+(Math.random()-0.5)*0.6,0,-Math.cos(yaw)+(Math.random()-0.5)*0.6); const l=Math.hypot(dir.x,dir.z)||1; dir.x/=l; dir.z/=l; }
  if(hb.kin) hb=N.chest; if(!hp) hp=vcp(rmv(),hb.x);
  J*=Math.pow(s,1.2)*(isBossZ(z)?0.6:1);   // corpo maior é mais pesado: o mesmo tiro joga menos
  rmKnock(hb,hp,dir,J,cls==='blast'?'shotgun':cls);
  RM.crumple=J>90?0.15:J>45?0.3:0.42;
  // arrancar membro (escopeta, sniper ou revólver forte no braço/perna)
  const sev=[]; if(big&&Math.random()<0.55){ const p=hb.name; if(p.startsWith('uarm')||p.startsWith('farm')||p.startsWith('hand')) sev.push(p.startsWith('uarm')?'sh'+p.slice(-1):'el'+p.slice(-1)); else if(p.startsWith('thigh')||p.startsWith('shin')) sev.push(p.startsWith('thigh')?'hip'+p.slice(-1):'kn'+p.slice(-1)); }
  const E={z,I,off,bones,t:0,J,lh:!!lh,still:0,x0:z.pos.x,z0:z.pos.z,bleed:[],neck:!!(z.head&&!z.head.visible),hit:hb.name,sev:[]};
  z._zr=E; ZRAG.active.push(E); ZRAG.starts++;
  z.spine.position.set(0,0.06,0); if(z.headP){ z.headP.rotation.set(0,0,0); } z.g.rotation.set(0,0,0); z.yaw=0; z.g.rotation.order='YXZ';
  E.bleed.push({b:hb.name,lp:qroti(rmv(),hb.q,rmv(hp.x-hb.x.x,hp.y-hb.x.y,hp.z-hb.x.z)),t:1.4});
  for(const jn of sev) zrSever(E,jn,dir);
  rmUse(k0); zrWrite(E); }
// arranca um membro: a junta solta, o pedaço vira osso solto da malha e os dois lados ganham coto
const ZRSEV={shL:['uarmL','R.sh'],shR:['uarmR','L.sh'],elL:['farmL','R.el'],elR:['farmR','L.el'],hipL:['thighL','R.th'],hipR:['thighR','L.th'],knL:['shinL','R.kn'],knR:['shinR','L.kn']};
function zrSever(E,jn,dir){ const j=RMPH.byName['j_'+jn], m=ZRSEV[jn]; if(!j||!j.on||!m) return; const o=E.bones[m[0]]; if(!o) return;
  j.on=false; rmAttach(); const C=j.C; const kick=6+Math.random()*3; C.v.x+=dir.x*kick; C.v.y+=2.5; C.v.z+=dir.z*kick; C.w.x+=(Math.random()-0.5)*25; C.w.z+=(Math.random()-0.5)*25;
  const par=o.parent, z=E.z; try{ if(ZG.stump&&ZT.gore){ const a=new THREE.Mesh(ZG.stump,ZT.gore); a.position.copy(o.position); a.scale.setScalar(1.5); par.add(a); const b=new THREE.Mesh(ZG.stump,ZT.gore); b.scale.setScalar(1.4); o.add(b); } }catch(e){}
  z.g.attach(o); E.sev.push(m[0]); const at=qrot(rmv(),j.P.q,j.rp); E.bleed.push({b:j.P.name,lp:qroti(rmv(),j.P.q,at),t:2.6,big:1}); E.bleed.push({b:C.name,lp:qroti(rmv(),C.q,qrot(rmv(),C.q,j.rc)),t:1.2});
  try{ emit('gore',j.P.x.x+at.x,j.P.x.y+at.y,j.P.x.z+at.z,6,3,0.8); emit('blood',j.P.x.x+at.x,j.P.x.y+at.y,j.P.x.z+at.z,14,3.2,0.8); }catch(e){} }
// escreve a física nos ossos do zumbi (a malha única já segue os ossos)
const ZRQ=rmq(), ZRQ2=rmq(), ZRV=rmv();
function zrWrite(E){ const k0=rmInst0(); rmUse(E.I); try{
  const z=E.z, N=RMPH.byName, S=z.g.scale, pel=N.pelvis, root=z.root.position;
  z.pos.x=pel.x.x; z.pos.z=pel.x.z; z.g.position.set(pel.x.x-root.x,-root.y,pel.x.z-root.z); z.g.rotation.set(0,0,0); z.yaw=0;
  const gx=pel.x.x, gz=pel.x.z;
  const W=new Map();
  for(const [bn] of ZRMAP){ const o=E.bones[bn]; if(!o) continue; const b=N[bn];
    let par=null; for(let p=o.parent;p&&p!==z.g;p=p.parent){ if(W.has(p)){ par=W.get(p); break; } }
    if(!par||E.sev.includes(bn)||bn==='pelvis'){ // raiz (quadril) ou pedaço solto: posição e rotação no mundo
      qrot(ZRV,b.q,E.off[bn]); const px=b.x.x-ZRV.x, py=b.x.y-ZRV.y, pz=b.x.z-ZRV.z;
      if(o.parent===z.g){ o.position.set((px-gx)/S.x,py/S.y,(pz-gz)/S.z); o.quaternion.set(b.q.x,b.q.y,b.q.z,b.q.w); }
      else { qcj(ZRQ,par||rmq()); qmul(ZRQ2,ZRQ,b.q); o.quaternion.set(ZRQ2.x,ZRQ2.y,ZRQ2.z,ZRQ2.w); } }
    else { qcj(ZRQ,par); qmul(ZRQ2,ZRQ,b.q); o.quaternion.set(ZRQ2.x,ZRQ2.y,ZRQ2.z,ZRQ2.w); }
    W.set(o,b.q); }
  if(z.headP&&E.bones.head===z.neckP) z.headP.quaternion.set(0,0,0,1);
  } finally{ rmUse(k0); } }
function zrBlood(E,dt){ const N=RMPH.byName; for(const w of E.bleed){ if(w.t<=0) continue; w.t-=dt; const b=N[w.b]; if(!b||b.x.y<-10) continue;
    if(Math.random()<dt*(w.big?30:12)){ const p=qrot(rmv(),b.q,w.lp); emit('blood',b.x.x+p.x,b.x.y+p.y,b.x.z+p.z,w.big?3:1,w.big?2.4:1.4,0.6); } }
  if(E.neck&&E.t<1.8&&Math.random()<dt*24){ const h=N.head; const p=qrot(rmv(),h.q,rmv(0,0.02,0)); emit('blood',h.x.x+p.x,h.x.y+p.y,h.x.z+p.z,2,2.6,0.7); } }
function zrTick(E,dt){ if(E.frozen) return; dt=Math.min(dt,0.05); const t0=performance.now(), k0=rmInst0(); rmUse(E.I);
  try{ E.t+=dt; RM.t+=dt; rmCtrl(dt); rmPhysStep(dt); zrBlood(E,dt);
    let mv=0; const cd=E.t>1?Math.exp(-3*dt):1; for(const b of RMPH.B){ if(b.kin) continue; if(cd<1){ b.w.x*=cd; b.w.y*=cd; b.w.z*=cd; } mv=Math.max(mv,vlen(b.v),vlen(b.w)*0.06); }
    E.still=mv<0.1?E.still+dt:0; } catch(e){ console.warn('[Bunker] ragdoll do zumbi',e); E.err=1; }
  finally{ rmUse(k0); }
  zrWrite(E); ZRAG.ms+=performance.now()-t0;
  if(E.err||(E.still>0.25&&E.t>0.8)||E.t>3.4) zrFreeze(E); }
function zrFreeze(E){ if(!E||E.frozen) return; E.frozen=true; const i=ZRAG.active.indexOf(E); if(i>=0) ZRAG.active.splice(i,1); ZRAG.frozen++;
  const z=E.z; try{ if(Math.hypot(z.pos.x-E.x0,z.pos.z-E.z0)>0.8) bloodPool(z.pos.x,z.pos.z,rand(0.9,1.4)); }catch(e){}
  if(E.I){ ZRAG.pool.push(E.I); E.I=null; } }
function zrRelease(z){ const E=z&&z._zr; if(!E) return; if(!E.frozen) zrFreeze(E); }
/* ---- ganchos ---- */
{ const dp0=zDeathPose; zDeathPose=function(z,dt){
    if(z._zr===undefined){ z._zr=null; if(zrEligible(z)){ try{ zrStart(z); }catch(e){ console.warn('[Bunker] ragdoll do zumbi',e); try{ rmUse(rmInst0()); }catch(e2){} z._zr=null; } } else ZRAG.skips++; }
    const E=z._zr; if(!E) return dp0.apply(this,arguments);
    z.dcause=''; if(!E.frozen) zrTick(E,dt);
    else { const life=z.state==='dying'?(z.t||0):0, end=ZRAG.life; if(life>end-0.9){ z.g.position.y=-z.root.position.y-(life-(end-0.9))*0.55; } else z.g.position.y=-z.root.position.y; }
    z.pos.x=z.g.position.x+z.root.position.x; z.pos.z=z.g.position.z+z.root.position.z; z.yaw=0; }; }
// corpo de ragdoll fica mais tempo no chão (congelado não custa nada além do desenho); o resto continua como antes
{ const rz0=removeZombie; removeZombie=function(z){ try{ if(z&&z._zr&&z.state==='dying'&&(z.t||0)<ZRAG.life&&G.state==='playing'){ let n=0; for(const q of zombies) if(q._zr&&q.state==='dying') n++; if(n<=ZRAG.keep) return; } }catch(e){} return rz0.apply(this,arguments); }; }
{ const dz0=disposeZ; disposeZ=function(z){ try{ zrRelease(z); }catch(e){} return dz0.apply(this,arguments); }; }
// tiros e explosões ainda empurram o corpo enquanto ele cai
const ZRF={on:false,d:null,s:null};
{ const f0=fire; fire=function(){ if(!ZRAG.active.length) return f0.apply(this,arguments); ZRF.on=true; try{ ZRF.s=curSlot(); ZRF.d=ZRF.s?wstat(ZRF.s):null; return f0.apply(this,arguments); } finally{ ZRF.on=false; } }; }
{ const rw0=rayWall; rayWall=function(o,d,max){ const t=rw0.apply(this,arguments); if(!ZRF.on||!ZRF.d||ZRF.d.proj||!ZRAG.active.length) return t;
    let h=null, hE=null; const k0=rmInst0(); try{ for(const E of ZRAG.active){ if(!E.I) continue; rmUse(E.I); const r=rmRay(o,d,h?h.t:t); if(r){ h=r; hE=E; } } } finally{ rmUse(k0); }
    if(!h) return t; RH.kind='none';
    rmUse(hE.I); try{ const hp=rmv(o.x+d.x*h.t,o.y+d.y*h.t,o.z+d.z*h.t); const w=ZRF.s&&WEAPONS[ZRF.s.id]; const cls=w&&w.snd||'rifle';
      rmKnock(h.b,hp,d,(RMKB[cls]!=null?RMKB[cls]:20)*0.9,cls); hE.still=0; hE.bleed.push({b:h.b.name,lp:qroti(rmv(),h.b.q,rmv(hp.x-h.b.x.x,hp.y-h.b.x.y,hp.z-h.b.x.z)),t:0.9});
      emit('blood',hp.x,hp.y,hp.z,5,2.2,0.6); try{ Snd.flesh(hp.x,hp.z); }catch(e){} } finally{ rmUse(k0); }
    return h.t; }; }
{ const ex0=explodeSplash; explodeSplash=function(p,dmg,rad){ const r=ex0.apply(this,arguments);
    try{ if(ZRAG.active.length){ const k0=rmInst0(); try{ for(const E of ZRAG.active){ if(!E.I) continue; rmUse(E.I); const R=rad*1.6;
        for(const b of RMPH.B){ if(b.kin) continue; const dx=b.x.x-p.x, dy=b.x.y-p.y, dz=b.x.z-p.z, d=Math.hypot(dx,dy,dz); if(d>R) continue; const f=(1-d/R)*9/(d||1);
          b.v.x+=dx*f; b.v.y+=Math.abs(dy)*f*0.5+(1-d/R)*4; b.v.z+=dz*f; b.w.x+=(Math.random()-0.5)*8*(1-d/R); b.w.z+=(Math.random()-0.5)*8*(1-d/R); } E.still=0; E.t=Math.min(E.t,1.5); } } finally{ rmUse(k0); } } }catch(e){}
    return r; }; }
// medição
v9On('frame',()=>{ ZRAG.n=ZRAG.active.length; ZRAG.msS=(ZRAG.msS||0)*0.95+ZRAG.ms*0.05; ZRAG.ms=0; });
CMDS.zrag={d:'zrag [on|off|max N|status] · ragdoll dos zumbis ao morrer',f:a=>{ const c=(a[0]||'status').toLowerCase();
  if(c==='on'||c==='off'){ ZRAG.on=c==='on'; cprint('ragdoll dos zumbis: '+(ZRAG.on?'ligado':'desligado')); return; }
  if(c==='max'){ ZRAG.max=Math.max(1,Math.min(30,parseInt(a[1])||8)); cprint('máximo simulando: '+ZRAG.max); return; }
  cprint('ragdolls: '+ZRAG.n+' simulando · '+ZRAG.starts+' mortes com física · '+ZRAG.frozen+' congelados · '+(ZRAG.msS||0).toFixed(2)+' ms/quadro · máx '+ZRAG.max+(ZRAG.on?'':' (desligado)')); } };
