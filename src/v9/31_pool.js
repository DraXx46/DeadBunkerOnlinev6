/* ================= v9 · SINUCA DO BAR =================
   Mesa feita do zero, com física de verdade (colisão elástica entre bolas, tabelas, atrito, caçapas), bola 8 com lisas e
   listradas, modo sozinho (contra o relógio e as tacadas), 2 jogadores no mesmo PC e online com alguém do esquadrão.
   E perto da mesa para jogar. Mouse mira, segurar o botão esquerdo dá força, soltar dá a tacada, roda do mouse aproxima,
   F alterna a visão de cima, E ou Esc saem. */
const V9CAM={fn:null};
const PT={L:2.34,W:1.17,r:0.0286,H:0.84,railW:0.11,mu:0.42,damp:0.18,eBall:0.94,eRail:0.72,vMax:7.2};
const POOL={x:0,z:0,ry:0,g:null,built:false,balls:[],on:false,mode:null,players:[],turn:0,moving:false,power:0,charging:false,shots:0,t0:0,
  dist:1.15,top:false,msg:'',msgT:0,firstHit:null,pottedNow:[],cueIn:false,open:true,over:false,netId:null,seq:0,waiting:false,cue:null,guide:null,ghost:null,hud:null,menu:null,near:false,cool:0};
const PCOL={1:0xe8b81a,2:0x1a3ab8,3:0xc81d1d,4:0x5a1a8a,5:0xe0601a,6:0x1a7a3a,7:0x7a1a1a,8:0x111111};
function poolBallTex(n){ return tex(256,128,(c,w,h)=>{ const col='#'+(PCOL[n>8?n-8:n]||0xf0f0e8).toString(16).padStart(6,'0');
  if(n===0){ c.fillStyle='#f4f0e2'; c.fillRect(0,0,w,h); c.fillStyle='#c81d1d'; c.beginPath(); c.arc(w*0.25,h/2,5,0,6.28); c.fill(); return; }
  if(n>8){ c.fillStyle='#f4f0e2'; c.fillRect(0,0,w,h); c.fillStyle=col; c.fillRect(0,h*0.27,w,h*0.46); } else { c.fillStyle=col; c.fillRect(0,0,w,h); }
  for(const u of [0.25,0.75]){ c.fillStyle='#f4f0e2'; c.beginPath(); c.arc(w*u,h/2,h*0.2,0,6.28); c.fill(); c.fillStyle='#111'; c.font=`bold ${h*0.24}px sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(String(n),w*u,h/2+1); } }); }
function poolPockets(){ const L=PT.L/2, W=PT.W/2; return [[-L,-W,0.068],[0,-W-0.012,0.058],[L,-W,0.068],[-L,W,0.068],[0,W+0.012,0.058],[L,W,0.068]]; }
/* ---------- mesa ---------- */
function poolPlace(x,z,ry,lobby){ if(!lobby) POOL.home={x,z,ry}; POOL.x=x; POOL.z=z; POOL.ry=ry; if(POOL.g){ POOL.g.position.set(x,lobby?floorAt(x,z):0,z); POOL.g.rotation.y=ry; return; } const g=G3(x,0,z,ry); POOL.g=g; scene.add(g);
  const L=PT.L, W=PT.W, H=PT.H, rw=PT.railW; const wood=v9Mat('poolWood',{color:0x3a1a0a,shininess:60,specular:0x553322}), felt=new THREE.MeshLambertMaterial({color:0x14602e}), cush=new THREE.MeshLambertMaterial({color:0x0f4a24}), blk=v9Mat('poolBlk',{color:0x070707,shininess:5});
  const st=new THREE.Group(); // parte fixa (assada)
  tzBx(st,L+rw*2+0.06,0.16,W+rw*2+0.06,wood,0,H-0.1,0); tzBx(st,L,0.02,W,felt,0,H,0);
  for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1]]) if(a||1){ const lx=a*(L/2+rw*0.5), lz=b*(W/2+rw*0.5); if(a===0) continue; tzBx(st,0.16,H-0.1,0.16,wood,lx*0.92,(H-0.1)/2,lz*0.86); }
  tzBx(st,0.14,H-0.1,0.14,wood,0,(H-0.1)/2,-(W/2)*0.86); tzBx(st,0.14,H-0.1,0.14,wood,0,(H-0.1)/2,(W/2)*0.86);
  // tabelas (com folga nas caçapas)
  const gapC=0.075, gapS=0.06, ch=0.045;
  for(const s of [-1,1]){ // compridas, duas metades
    for(const half of [-1,1]){ const x0=half<0?-L/2+gapC:gapS, x1=half<0?-gapS:L/2-gapC; tzBx(st,x1-x0,ch,0.05,cush,(x0+x1)/2,H+ch/2,s*(W/2+0.025)); tzBx(st,x1-x0+0.02,0.05,rw,wood,(x0+x1)/2,H+0.025,s*(W/2+0.05+rw/2)); }
    tzBx(st,0.05,ch,W-gapC*2,cush,s*(L/2+0.025),H+ch/2,0); tzBx(st,rw,0.05,W-gapC*2+0.02,wood,s*(L/2+0.05+rw/2),H+0.025,0); }
  for(const [px,pz] of poolPockets()){ const c=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.06,0.08,16),blk); c.position.set(px*1.01,H-0.02,pz*1.01); st.add(c); const ring=new THREE.Mesh(new THREE.TorusGeometry(0.068,0.012,6,16),v9Mat('poolBrass',{color:0xb8902a,shininess:90})); ring.rotation.x=Math.PI/2; ring.position.set(px*1.01,H+0.05,pz*1.01); st.add(ring); }
  for(let i=1;i<8;i++){ if(i===4) continue; for(const s of [-1,1]){ const d=new THREE.Mesh(new THREE.CircleGeometry(0.008,8),v9Mat('poolDia',{color:0xe8e0c8,emissive:0x222018})); d.rotation.x=-Math.PI/2; d.position.set(-L/2+i*L/8,H+0.051,s*(W/2+0.05+rw/2)); st.add(d); } }
  const spot=new THREE.Mesh(new THREE.CircleGeometry(0.008,10),v9Mat('poolDia',{color:0xe8e0c8,emissive:0x222018})); spot.rotation.x=-Math.PI/2; spot.position.set(L/4,H+0.011,0); st.add(spot);
  g.add(st);   // a mesa fica como objeto próprio (não entra no lote do cenário)
  // luminária de bar em cima
  const lamp=new THREE.Group(); lamp.position.set(0,H+1.05,0); g.add(lamp); tzBx(lamp,1.5,0.12,0.42,v9Mat('poolLampShade',{color:0x0e3a1e,shininess:40}),0,0,0); tzBx(lamp,1.4,0.02,0.36,new THREE.MeshBasicMaterial({color:0xfff0c8}),0,-0.065,0);
  for(const s of [-0.6,0.6]){ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005,1.2,4),v9Mat('wire',{color:0x111111})); w.position.set(s,0.6,0); lamp.add(w); }
  const lt=new THREE.SpotLight(0xffe8b8,1.6,4.5,0.9,0.55,1.2); lt.position.set(0,H+0.95,0); lt.target.position.set(0,H,0); g.add(lt); g.add(lt.target); POOL.light=lt;
  // bolas
  for(let n=0;n<16;n++){ const m=new THREE.Mesh(new THREE.SphereGeometry(PT.r,18,12),new THREE.MeshPhongMaterial({map:poolBallTex(n),shininess:110,specular:0x999999})); m.castShadow=false; g.add(m); POOL.balls.push({n,x:0,z:0,vx:0,vz:0,in:false,m,drop:0}); }
  // taco, mira e bola fantasma
  const cue=new THREE.Group(); const sh=new THREE.Mesh(new THREE.CylinderGeometry(0.006,0.014,1.45,10),v9Mat('cueWood',{color:0x7a5030,shininess:20,specular:0x221a10})); sh.rotation.z=Math.PI/2; sh.position.x=-0.725; cue.add(sh);
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(0.0065,0.0065,0.015,8),v9Mat('cueTip',{color:0x2a5a9a})); tip.rotation.z=Math.PI/2; tip.position.x=-0.003; cue.add(tip);
  const butt=new THREE.Mesh(new THREE.CylinderGeometry(0.0145,0.016,0.45,10),v9Mat('cueButt',{color:0x1a0c06,shininess:60})); butt.rotation.z=Math.PI/2; butt.position.x=-1.23; cue.add(butt);
  cue.visible=false; g.add(cue); POOL.cue=cue;
  const gl=new THREE.BufferGeometry(); gl.setAttribute('position',new THREE.BufferAttribute(new Float32Array(9),3)); POOL.guide=new THREE.Line(gl,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.55,depthWrite:false})); POOL.guide.frustumCulled=false; POOL.guide.visible=false; g.add(POOL.guide);
  POOL.ghost=new THREE.Mesh(new THREE.RingGeometry(PT.r*0.85,PT.r,20),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false})); POOL.ghost.rotation.x=-Math.PI/2; POOL.ghost.visible=false; g.add(POOL.ghost);
  poolRack(); poolSync(); POOL.built=true;
  // colisão do jogador com a mesa
  const c=Math.abs(Math.cos(ry)), s=Math.abs(Math.sin(ry)); addPropBox(x,z,(c*(L/2+rw)+s*(W/2+rw))+0.05,(s*(L/2+rw)+c*(W/2+rw))+0.05); }
function poolRack(){ const r=PT.r, B=POOL.balls; const fx=PT.L/4; const order=[1,9,2,10,8,3,11,4,12,5,13,6,14,7,15];
  // 8 no meio, uma lisa e uma listrada nos cantos de trás
  const rows=[[1],[9,2],[10,8,3],[11,4,12,5],[13,6,14,7,15]]; let k=0;
  for(let i=0;i<5;i++) for(let j=0;j<=i;j++){ const n=rows[i][j]; const b=B[n]; b.x=fx+i*r*2*0.8661+0.0005*i; b.z=(j-i/2)*r*2.002; b.vx=b.vz=0; b.in=false; b.drop=0; b.m.visible=true; b.m.quaternion.set(Math.random(),Math.random(),Math.random(),Math.random()).normalize(); k++; }
  const c=B[0]; c.x=-PT.L/4; c.z=0; c.vx=c.vz=0; c.in=false; c.drop=0; c.m.visible=true; }
function poolSync(){ const y=PT.H+PT.r; for(const b of POOL.balls){ if(b.drop>0) continue; b.m.position.set(b.x,b.in?y-1:y,b.z); b.m.visible=!b.in; } }
/* ---------- física ---------- */
function poolStep(dt){ const B=POOL.balls, r=PT.r, L=PT.L/2, W=PT.W/2, pk=poolPockets(); let vmax=0; for(const b of B) if(!b.in) vmax=Math.max(vmax,Math.hypot(b.vx,b.vz));
  if(vmax<1e-4) return false; const n=Math.min(48,Math.max(2,Math.ceil(vmax*dt/(r*0.45)))), h=dt/n; let moving=false;
  for(let s=0;s<n;s++){
    for(const b of B){ if(b.in) continue; const sp=Math.hypot(b.vx,b.vz); if(sp<1e-6) continue; const dec=(PT.mu+PT.damp*sp)*h, ns=Math.max(0,sp-dec); const k=ns/sp; b.vx*=k; b.vz*=k;
      const ox=b.x, oz=b.z; b.x+=b.vx*h; b.z+=b.vz*h; const d=Math.hypot(b.x-ox,b.z-oz); if(d>0){ const ax=new THREE.Vector3(b.vz,0,-b.vx).normalize(); poolQ.setFromAxisAngle(ax,d/r); b.m.quaternion.premultiply(poolQ); } }
    // bola com bola
    for(let i=0;i<16;i++){ const a=B[i]; if(a.in) continue; for(let j=i+1;j<16;j++){ const c=B[j]; if(c.in) continue; const dx=c.x-a.x, dz=c.z-a.z, d2=dx*dx+dz*dz; if(d2>=4*r*r||d2<1e-12) continue;
      const d=Math.sqrt(d2), nx=dx/d, nz=dz/d, ov=(2*r-d)/2; a.x-=nx*ov; a.z-=nz*ov; c.x+=nx*ov; c.z+=nz*ov;
      const rel=(a.vx-c.vx)*nx+(a.vz-c.vz)*nz; if(rel<=0) continue; const jj=(1+PT.eBall)/2*rel; a.vx-=jj*nx; a.vz-=jj*nz; c.vx+=jj*nx; c.vz+=jj*nz;
      if(i===0&&POOL.firstHit==null) POOL.firstHit=c.n; else if(j===0&&POOL.firstHit==null) POOL.firstHit=a.n;
      if(rel>0.15) poolClick(Math.min(1,rel/3)); } }
    // caçapas e tabelas
    for(const b of B){ if(b.in) continue; let nearP=false;
      for(const [px,pz,pr] of pk){ const d=Math.hypot(b.x-px,b.z-pz); if(d<pr+0.004){ poolPot(b,px,pz); nearP=true; break; } if(d<pr+0.05) nearP=true; }
      if(b.in) continue;
      if(!nearP){ if(b.x>L-r){ b.x=L-r; if(b.vx>0){ b.vx=-b.vx*PT.eRail; b.vz*=0.96; poolThud(Math.abs(b.vx)); } } else if(b.x<-L+r){ b.x=-L+r; if(b.vx<0){ b.vx=-b.vx*PT.eRail; b.vz*=0.96; poolThud(Math.abs(b.vx)); } }
        if(b.z>W-r){ b.z=W-r; if(b.vz>0){ b.vz=-b.vz*PT.eRail; b.vx*=0.96; poolThud(Math.abs(b.vz)); } } else if(b.z<-W+r){ b.z=-W+r; if(b.vz<0){ b.vz=-b.vz*PT.eRail; b.vx*=0.96; poolThud(Math.abs(b.vz)); } } }
      else if(Math.abs(b.x)>L+0.03||Math.abs(b.z)>W+0.03){ const p=pk.reduce((m,q)=>Math.hypot(b.x-q[0],b.z-q[1])<Math.hypot(b.x-m[0],b.z-m[1])?q:m); poolPot(b,p[0],p[1]); } } }
  for(const b of B) if(!b.in&&(Math.abs(b.vx)>1e-4||Math.abs(b.vz)>1e-4)){ moving=true; if(Math.hypot(b.vx,b.vz)<0.006){ b.vx=b.vz=0; } }
  return moving; }
const poolQ=new THREE.Quaternion();
function poolPot(b,px,pz){ b.in=true; b.vx=b.vz=0; b.drop=0.35; b.px=px; b.pz=pz; POOL.pottedNow.push(b.n); try{ const o=Snd.out(0.7,0,0.25,null); if(o){ Snd.burstTo(o,{type:'lowpass',freq:420,dur:0.12,gain:0.6}); Snd.oscTo(o,{freq:180,freqEnd:90,dur:0.18,gain:0.25}); } }catch(e){} }
function poolClick(k){ const t=performance.now(); if(t-(POOL.lc||0)<25) return; POOL.lc=t; try{ const o=Snd.out(0.35+k*0.6,0,0.12,null); if(o){ Snd.burstTo(o,{type:'bandpass',freq:3200,q:3,dur:0.015,gain:0.9}); Snd.oscTo(o,{freq:2600,dur:0.03,gain:0.15}); } }catch(e){} }
function poolThud(v){ if(v<0.15) return; const t=performance.now(); if(t-(POOL.lt||0)<40) return; POOL.lt=t; try{ const o=Snd.out(Math.min(0.6,v/4),0,0.15,null); if(o) Snd.burstTo(o,{type:'lowpass',freq:500,dur:0.05,gain:0.6}); }catch(e){} }
/* ---------- regras ---------- */
const isSolid=n=>n>=1&&n<=7, isStripe=n=>n>=9&&n<=15;
function poolGroupLeft(g){ return POOL.balls.filter(b=>!b.in&&(g==='lisas'?isSolid(b.n):isStripe(b.n))).length; }
function poolMsg(t,dur){ POOL.msg=t; POOL.msgT=dur||3.2; }
function poolResolve(){ const pot=POOL.pottedNow.slice(), P1=POOL.players[POOL.turn], other=POOL.players[1-POOL.turn]; POOL.pottedNow.length=0;
  const cueIn=pot.includes(0), eight=pot.includes(8), own=pot.filter(n=>n!==0&&n!==8);
  if(POOL.mode==='solo'){ POOL.shots++; if(cueIn){ POOL.shots++; poolMsg('Branca na caçapa: +1 tacada de punição'); poolRespotCue(); }
    if(eight&&POOL.balls.some(b=>!b.in&&b.n!==0&&b.n!==8)){ poolRespot(8); poolMsg('A 8 só no final: ela volta para a mesa'); }
    if(own.length) poolMsg(own.length>1?own.length+' bolas de uma vez!':'Boa!',1.6);
    const left=POOL.balls.filter(b=>!b.in&&b.n!==0).length; if(left===0) poolWin(null); return; }
  // bola 8 entre dois jogadores
  let foul=cueIn||POOL.firstHit==null; const g=P1.group;
  if(!foul&&g&&POOL.firstHit!=null&&POOL.firstHit!==8&&(g==='lisas'?!isSolid(POOL.firstHit):!isStripe(POOL.firstHit))) foul=true;
  if(!foul&&g&&POOL.firstHit===8&&poolGroupLeft(g)>0) foul=true;
  if(eight){ const cleared=g&&poolGroupLeft(g)===0; if(POOL.break){ poolRespot(8); poolMsg('A 8 caiu na saída: ela volta para a mesa'); }
    else if(cleared&&!cueIn){ poolWin(POOL.turn); return; } else { poolMsg(P1.name+' derrubou a 8 antes da hora'); poolWin(1-POOL.turn); return; } }
  if(!g&&own.length&&!POOL.break){ const first=own[0]; P1.group=isSolid(first)?'lisas':'listradas'; other.group=P1.group==='lisas'?'listradas':'lisas'; poolMsg(P1.name+' fica com as '+P1.group); }
  for(const n of own){ const pl=POOL.players.find(p=>p.group&&(p.group==='lisas'?isSolid(n):isStripe(n))); if(pl) pl.score++; }
  const mine=own.some(n=>P1.group?(P1.group==='lisas'?isSolid(n):isStripe(n)):true);
  if(cueIn) poolRespotCue();
  if(foul){ poolMsg(cueIn?'Falta: branca na caçapa. Vez de '+other.name:POOL.firstHit==null?'Falta: não acertou nenhuma bola. Vez de '+other.name:'Falta: tocou primeiro na bola errada. Vez de '+other.name); POOL.turn=1-POOL.turn; }
  else if(!mine){ POOL.turn=1-POOL.turn; if(!POOL.msgT||POOL.msgT<0.5) poolMsg('Vez de '+POOL.players[POOL.turn].name,1.8); }
  POOL.break=false; }
function poolRespot(n){ const b=POOL.balls[n]; b.in=false; b.drop=0; let x=PT.L/4, z=0; for(let k=0;k<30&&POOL.balls.some(o=>o!==b&&!o.in&&Math.hypot(o.x-x,o.z-z)<PT.r*2.05);k++) x+=PT.r*2.1; b.x=x; b.z=z; b.vx=b.vz=0; b.m.visible=true; }
function poolRespotCue(){ const b=POOL.balls[0]; b.in=false; b.drop=0; let x=-PT.L/4, z=0; for(let k=0;k<30&&POOL.balls.some(o=>o!==b&&!o.in&&Math.hypot(o.x-x,o.z-z)<PT.r*2.05);k++) z+=PT.r*2.1*(k%2?-k:k); b.x=x; b.z=z; b.vx=b.vz=0; b.m.visible=true; }
function poolWin(i){ POOL.over=true; POOL.winner=i; const sec=Math.round((performance.now()-POOL.t0)/1000);
  if(POOL.mode==='solo'){ const rec=PROG.v9pool||(PROG.v9pool={best:0,wins:0}); const best=!rec.best||POOL.shots<rec.best; if(best) rec.best=POOL.shots; try{ saveProg(); }catch(e){}
    poolMsg(`Mesa limpa em ${POOL.shots} tacadas e ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}${best?' · novo recorde!':' · recorde: '+rec.best}`,8); }
  else { const w=POOL.players[i]; poolMsg(w.name+' venceu a partida!',8); if(POOL.mode==='online'&&w.id===NET.me||POOL.mode==='local'){ const rec=PROG.v9pool||(PROG.v9pool={best:0,wins:0}); rec.wins=(rec.wins|0)+1; try{ saveProg(); }catch(e){} } }
  try{ Snd.sample('powerup_win',{vol:0.8,prio:true}); }catch(e){} poolHud(); }
/* ---------- partida ---------- */
function poolMyTurn(){ if(POOL.mode!=='online') return true; const p=POOL.players[POOL.turn]; return p&&String(p.id)===String(NET.me); }
function poolNew(mode,players){ POOL.mode=mode; POOL.players=players; POOL.turn=0; POOL.shots=0; POOL.t0=performance.now(); POOL.over=false; POOL.break=true; POOL.pottedNow.length=0; POOL.firstHit=null; poolRack(); poolSync();
  poolMsg(mode==='solo'?'Limpe a mesa com o menor número de tacadas':'Saída de '+players[0].name,3); }
function poolEnter(){ if(POOL.on) return; POOL.on=true; POOL.top=false; POOL.dist=1.15; POOL.saved={yaw:P.yaw,pitch:P.pitch}; POOL.vm=CINEMA.noVm; CINEMA.noVm=true;
  for(const k of ['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyC','ControlLeft']) keys[k]=false;
  const c=POOL.balls[0]; const wp=poolWorld(c.x,c.z); P.yaw=Math.atan2(P.pos.x-wp.x,P.pos.z-wp.z); P.pitch=-0.35; V9CAM.fn=poolCam; poolHud(); }
function poolExit(){ if(!POOL.on) return; POOL.on=false; POOL.charging=false; POOL.power=0; V9CAM.fn=null; CINEMA.noVm=POOL.vm; POOL.cue.visible=false; POOL.guide.visible=false; POOL.ghost.visible=false; if(POOL.saved){ P.yaw=POOL.saved.yaw; P.pitch=POOL.saved.pitch; } poolHud(); POOL.cool=0.4; }
function poolWorld(lx,lz){ const c=Math.cos(POOL.ry), s=Math.sin(POOL.ry); return {x:POOL.x+lx*c+lz*s, z:POOL.z-lx*s+lz*c}; }
function poolAimDir(){ // direção da mira no plano da mesa (coordenadas locais), a partir do yaw do jogador
  const wx=-Math.sin(P.yaw), wz=-Math.cos(P.yaw); const c=Math.cos(-POOL.ry), s=Math.sin(-POOL.ry); return [wx*c+wz*s, -wx*s+wz*c]; }
function poolShoot(power){ if(POOL.moving||POOL.over||!poolMyTurn()) return; const [dx,dz]=poolAimDir(); const p=Math.max(0.03,power);
  if(POOL.mode==='online'){ const seq=++POOL.seq; poolNetSend(['pool','shot',POOL.netId,seq,Math.round(dx*1e5),Math.round(dz*1e5),Math.round(p*1e4),NET.me]); }
  poolDoShot(dx,dz,p); }
function poolDoShot(dx,dz,p){ const c=POOL.balls[0]; const v=PT.vMax*p*p*0.85+PT.vMax*0.15*p; c.vx=dx*v; c.vz=dz*v; POOL.moving=true; POOL.firstHit=null; POOL.pottedNow.length=0; POOL.cue.visible=false;
  try{ const o=Snd.out(0.5+p*0.5,0,0.1,null); if(o){ Snd.burstTo(o,{type:'bandpass',freq:1800,q:2,dur:0.03,gain:1}); Snd.oscTo(o,{freq:900,freqEnd:500,dur:0.05,gain:0.2}); } }catch(e){} }
/* ---------- online (o anfitrião repassa; cada um simula a mesma tacada e quem jogou manda as posições finais) ---------- */
function poolNetSend(e){ if(NET.mode==='host') pushEv(e); else if(NET.mode==='client') netAct(e); }
V9NET.act.pool=(peer,a)=>{ pushEv(a.slice(1)); poolNetIn(a.slice(1)); };
V9NET.ev.pool=e=>poolNetIn(e.slice(1));
function poolNetIn(e){ const k=e[1]; const from=e[e.length-1];
  if(k==='open'){ if(String(from)===String(NET.me)) return; POOL.invite={id:e[2],name:e[3],from}; poolMsg(e[3]+' quer jogar sinuca no bar. Vá até a mesa e aperte E',6); return; }
  if(k==='join'){ if(POOL.netId!==e[2]) return; if(POOL.mode==='online'&&POOL.players.length===1&&String(POOL.players[0].id)===String(NET.me)){ POOL.players.push({id:from,name:e[3],group:null,score:0}); poolNew('online',POOL.players); poolNetSend(['pool','start',POOL.netId,JSON.stringify(POOL.players.map(p=>[p.id,p.name])),NET.me]); } return; }
  if(k==='start'){ if(String(from)===String(NET.me)) return; const ps=JSON.parse(e[3]).map(q=>({id:q[0],name:q[1],group:null,score:0})); if(!ps.some(p=>String(p.id)===String(NET.me))) return; POOL.netId=e[2]; poolNew('online',ps); return; }
  if(k==='shot'){ if(String(from)===String(NET.me)||e[2]!==POOL.netId) return; poolDoShot(e[4]/1e5,e[5]/1e5,e[6]/1e4); return; }
  if(k==='sync'){ if(String(from)===String(NET.me)||e[2]!==POOL.netId) return; const st=JSON.parse(e[3]); st.b.forEach((q,i)=>{ const b=POOL.balls[i]; b.x=q[0]/1e4; b.z=q[1]/1e4; b.in=!!q[2]; b.vx=b.vz=0; b.drop=0; });
    POOL.turn=st.t; POOL.inHand=!!st.ih; st.p.forEach((q,i)=>{ if(POOL.players[i]){ POOL.players[i].group=q[0]; POOL.players[i].score=q[1]; if(st.f) POOL.players[i].fouls=st.f[i]|0; } }); POOL.break=!!st.br; POOL.moving=false; poolSync(); if(st.o!=null) poolWin(st.o); else POOL.over=false; return; }
  if(k==='quit'){ if(e[2]!==POOL.netId) return; poolMsg('O outro jogador saiu da mesa',4); POOL.mode='solo'; POOL.players=[{id:NET.me,name:poolMe(),group:null,score:0}]; } }
function poolMe(){ return (SOC.acc&&SOC.acc.name)||pgPlayerName(); }
/* ---------- quadro a quadro ---------- */
v9On('always',dt=>{ try{ poolCtxSwitch(); }catch(e){} if(POOL.g) POOL.g.visible=poolCtx(); if(!POOL.built||!poolCtx()) return; POOL.cool=Math.max(0,POOL.cool-dt);
  // bolas caindo na caçapa
  for(const b of POOL.balls) if(b.drop>0){ b.drop-=dt; const k=1-b.drop/0.35; b.m.position.set(lerp(b.m.position.x,b.px,0.25),PT.H+PT.r-k*0.12,lerp(b.m.position.z,b.pz,0.25)); if(b.drop<=0) b.m.visible=false; }
  if(POOL.moving){ const m=poolStep(Math.min(dt,0.033)); poolSync(); if(!m){ POOL.moving=false; const shooterTurn=POOL.turn, shooter=POOL.players[shooterTurn];
      if(POOL.mode==='online'&&!(shooter&&String(shooter.id)===String(NET.me))){ /* espera as posições de quem jogou */ }
      else { poolResolve(); if(POOL.mode==='online') poolNetSend(['pool','sync',POOL.netId,JSON.stringify({b:POOL.balls.map(b=>[Math.round(b.x*1e4),Math.round(b.z*1e4),b.in?1:0]),t:POOL.turn,p:POOL.players.map(p=>[p.group,p.score]),br:POOL.break?1:0,o:POOL.over?POOL.winner:null,ih:POOL.inHand?1:0,f:POOL.players.map(p=>p.fouls|0)}),NET.me]); } } }
  // perto da mesa: dica
  const wp=POOL; const d=Math.hypot(P.pos.x-wp.x,P.pos.z-wp.z); POOL.near=poolLive()&&d<2.4&&!POOL.on;
  if(POOL.on){ if(!poolLive()||P.down){ poolExit(); return; }
    if(POOL.charging){ POOL.power=Math.min(1,POOL.power+dt*0.62); }
    poolAimVis(); }
  POOL.msgT=Math.max(0,POOL.msgT-dt); poolHud(); });
function poolAimVis(){ const c=POOL.balls[0]; const can=!POOL.moving&&!POOL.over&&!c.in&&poolMyTurn(); POOL.cue.visible=can; POOL.guide.visible=can; POOL.ghost.visible=false; if(!can) return;
  const [dx,dz]=poolAimDir(); const y=PT.H+PT.r; const ang=Math.atan2(-dz,dx);
  POOL.cue.position.set(c.x-dx*(0.02+POOL.power*0.28),y+0.012,c.z-dz*(0.02+POOL.power*0.28)); POOL.cue.rotation.set(0,ang,-0.07);
  // até onde a branca vai: primeira bola ou tabela
  let tBest=6, hit=null; for(const b of POOL.balls){ if(b.n===0||b.in) continue; const ox=b.x-c.x, oz=b.z-c.z, proj=ox*dx+oz*dz; if(proj<=0) continue; const perp2=ox*ox+oz*oz-proj*proj, R=2*PT.r; if(perp2>R*R) continue; const t=proj-Math.sqrt(R*R-perp2); if(t<tBest){ tBest=t; hit=b; } }
  const L=PT.L/2-PT.r, W=PT.W/2-PT.r; for(const [v,lim,d0] of [[dx,L,c.x],[dz,W,c.z]]) if(Math.abs(v)>1e-6){ const t=((v>0?lim:-lim)-d0)/v; if(t>0&&t<tBest){ tBest=t; hit=null; } }
  const ex=c.x+dx*tBest, ez=c.z+dz*tBest; const a=POOL.guide.geometry.attributes.position.array; a[0]=c.x; a[1]=y; a[2]=c.z; a[3]=ex; a[4]=y; a[5]=ez;
  if(hit){ const nx=hit.x-ex, nz=hit.z-ez, nl=Math.hypot(nx,nz)||1; a[6]=hit.x+nx/nl*0.25; a[7]=y; a[8]=hit.z+nz/nl*0.25; POOL.ghost.visible=true; POOL.ghost.position.set(ex,PT.H+0.004,ez); } else { a[6]=ex; a[7]=y; a[8]=ez; }
  POOL.guide.geometry.attributes.position.needsUpdate=true; }
function poolCam(){ if(!POOL.on) return; const c=POOL.balls[0]; const tgt=c.in?{x:0,z:0}:{x:c.x,z:c.z};
  if(POOL.top||POOL.moving&&POOL.mode!=='solo'&&false){ const w=poolWorld(0,0); camera.position.set(w.x,PT.H+2.7,w.z+0.001); camera.lookAt(w.x,PT.H,w.z); return; }
  const [dx,dz]=poolAimDir(); const el=clamp(-P.pitch,0.06,1.35); const dist=POOL.dist; const lx=tgt.x-dx*Math.cos(el)*dist, lz=tgt.z-dz*Math.cos(el)*dist;
  const w=poolWorld(lx,lz), t=poolWorld(tgt.x+dx*0.25,tgt.z+dz*0.25); camera.position.set(w.x,PT.H+PT.r+Math.sin(el)*dist+0.02,w.z); camera.lookAt(t.x,PT.H+PT.r,t.z); }
/* ---------- entrada ---------- */
addEventListener('keyup',e=>{ if(POOL.hk) delete POOL.hk[e.code]; },true);
addEventListener('keydown',e=>{ if(!poolCtx()||!poolLive()||!POOL.built) return; if(POOL.on&&POOL.inHand&&/^(Key[WASD]|Arrow)/.test(e.code)){ (POOL.hk||(POOL.hk={}))[e.code]=true; e.preventDefault(); e.stopImmediatePropagation(); return; } if(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
  if(POOL.on){ if(e.code==='KeyE'||e.code==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); poolExit(); return; } if(e.code==='KeyF'){ e.preventDefault(); e.stopImmediatePropagation(); POOL.top=!POOL.top; return; }
    if(e.code==='KeyR'&&POOL.over){ e.stopImmediatePropagation(); poolNew(POOL.mode,POOL.players.map(p=>Object.assign(p,{group:null,score:0}))); return; }
    if(/^(Key[WASDCQGVZXRHLB]|Space|Shift|Control|Digit|Tab)/.test(e.code)){ e.preventDefault(); e.stopImmediatePropagation(); } return; }
  if(e.code==='KeyE'&&POOL.near&&POOL.cool<=0&&!e.repeat){ e.preventDefault(); e.stopImmediatePropagation(); poolMenu(); } },true);
addEventListener('keyup',e=>{ if(POOL.on&&/^(Key[WASDC]|Space|Shift)/.test(e.code)) e.stopImmediatePropagation(); },true);
addEventListener('mousedown',e=>{ if(!POOL.on) return; e.stopImmediatePropagation(); if(!document.pointerLockElement){ try{ requestLock(); }catch(_){} return; } if(e.button===0&&!POOL.moving&&!POOL.over&&poolMyTurn()){ POOL.charging=true; POOL.power=0; } if(e.button===2){ POOL.charging=false; POOL.power=0; } },true);
addEventListener('mouseup',e=>{ if(!POOL.on) return; e.stopImmediatePropagation(); if(e.button===0&&POOL.charging){ POOL.charging=false; poolShoot(POOL.power); POOL.power=0; } },true);
addEventListener('wheel',e=>{ if(!POOL.on) return; e.stopImmediatePropagation(); POOL.dist=clamp(POOL.dist+(e.deltaY>0?0.12:-0.12),0.45,2.8); },{capture:true,passive:true});
{ const _f=fire; fire=function(){ if(POOL.on) return; return _f.apply(this,arguments); }; }
{ const _h=hurtPlayer; hurtPlayer=function(amt){ if(POOL.on&&amt>0){ poolExit(); poolMsg('Um zumbi te pegou na mesa!',2.5); } return _h.apply(this,arguments); }; }
/* ---------- menu e HUD ---------- */
v9Css(`.v9pool{position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:25;min-width:min(560px,94vw);padding:10px 16px;background:rgba(8,14,10,.88);border:1px solid #2a6a3a;color:#e8f0e4;font:13px "Special Elite",monospace;text-align:center;pointer-events:none}
.v9pool .pl{display:flex;justify-content:space-between;gap:16px;margin:6px 0}.v9pool .pl div{flex:1;padding:4px 8px;border:1px solid transparent}.v9pool .pl .on{border-color:#ffd24a;color:#ffd24a}.v9pool .bl{display:flex;gap:3px;justify-content:center;flex-wrap:wrap;margin-top:4px}
.v9pool .bl i{width:16px;height:16px;border-radius:50%;display:inline-block;font:bold 9px/16px sans-serif;color:#111;font-style:normal}.v9pool .bl i.out{opacity:.18}.v9pool .ms{min-height:18px;color:#ffd24a;margin-top:4px}.v9pool .ky{margin-top:6px;font-size:11px;color:#8aa890}
.v9pow{position:fixed;left:50%;bottom:90px;width:300px;height:12px;margin-left:-150px;background:rgba(0,0,0,.6);border:1px solid #2a6a3a;z-index:25;pointer-events:none}.v9pow i{display:block;height:100%;background:linear-gradient(90deg,#3ad14a,#ffd24a,#e0301f)}
.v9poolhint{position:fixed;left:50%;bottom:28%;transform:translateX(-50%);z-index:20;padding:6px 14px;background:rgba(0,0,0,.65);color:#fff;font:15px "Special Elite",monospace;pointer-events:none}.v9poolhint b{color:#ffd24a}
.v9poolm{position:fixed;inset:0;z-index:40;display:grid;place-items:center;background:rgba(0,0,0,.55)}.v9poolm .bx{width:min(420px,92vw);padding:18px 20px;background:#0c120e;border:1px solid #2a6a3a;color:#e8f0e4;font-family:"Special Elite",monospace}
.v9poolm h3{margin:0 0 4px;font:700 26px "Stardos Stencil",Impact}.v9poolm p{margin:0 0 12px;font-size:12px;color:#8aa890}.v9poolm button{display:block;width:100%;margin:6px 0;padding:10px;text-align:left}.v9poolm input{width:100%;margin:4px 0 8px;padding:7px;background:#000;color:#fff;border:1px solid #2a6a3a}`);
const PHUD=v9El('div','v9pool'); PHUD.hidden=true; document.body.appendChild(PHUD); const PPOW=v9El('div','v9pow','<i></i>'); PPOW.hidden=true; document.body.appendChild(PPOW); const PHINT=v9El('div','v9poolhint','<b>E</b> · Jogar sinuca'); PHINT.hidden=true; document.body.appendChild(PHINT);
function poolHud(){ PHINT.hidden=!(POOL.near&&!POOL.on); const ht=POOL.invite?`<b>E</b> · Jogar sinuca (${POOL.invite.name} está chamando)`:'<b>E</b> · Jogar sinuca'; if(PHINT._t!==ht){ PHINT._t=ht; PHINT.innerHTML=ht; }
  PHUD.hidden=!POOL.on; PPOW.hidden=!(POOL.on&&POOL.charging); if(PPOW.firstChild) PPOW.firstChild.style.width=(POOL.power*100)+'%'; if(!POOL.on) return;
  const left=POOL.balls.filter(b=>b.n&&!b.in).length; const sec=Math.round((performance.now()-POOL.t0)/1000);
  const ball=n=>{ const c='#'+(PCOL[n>8?n-8:n]||0xffffff).toString(16).padStart(6,'0'); return `<i class="${POOL.balls[n].in?'out':''}" style="background:${n>8?`linear-gradient(#f4f0e2 25%,${c} 25%,${c} 75%,#f4f0e2 75%)`:c};${n===8?'color:#fff':''}">${n}</i>`; };
  const head=POOL.mode==='solo'?`<div class="pl"><div class="on">Sozinho · ${POOL.shots} tacadas · ${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}</div><div>${left} bolas na mesa${PROG.v9pool&&PROG.v9pool.best?' · recorde '+PROG.v9pool.best:''}</div></div>`
    :`<div class="pl">${POOL.players.map((p,i)=>`<div class="${i===POOL.turn?'on':''}">${p.name}${p.group?' · '+p.group:''} · ${p.score}</div>`).join('')}</div>`;
  PHUD.innerHTML=`${head}<div class="bl">${Array.from({length:15},(_,i)=>ball(i+1)).join('')}</div><div class="ms">${POOL.msgT>0?POOL.msg:POOL.moving?'…':POOL.over?'R · jogar de novo':poolMyTurn()?(POOL.mode==='solo'?'Sua tacada':'Vez de '+POOL.players[POOL.turn].name):'Esperando '+(POOL.players[POOL.turn]||{}).name}</div>
    <div class="ky">mouse: mirar e altura · segure o botão esquerdo: força · solte: tacada · roda: zoom · F: visão de cima · E: sair</div>`; }
function poolMenu(){ if(POOL.menu) return; try{ document.exitPointerLock(); }catch(e){}
  const inv=POOL.invite; const online=!!NET.mode;
  const el=v9El('div','v9poolm',`<div class="bx"><h3>Sinuca</h3><p>Bola 8: lisas contra listradas. Derrube as suas e depois a 8.</p>
    ${inv?`<button class="cta small" data-m="join" type="button">Entrar na partida de ${inv.name}</button>`:''}
    ${POOL.mode&&!POOL.over&&POOL.players.length?`<button class="ghost" data-m="cont" type="button">Continuar a partida</button>`:''}
    <button class="ghost" data-m="solo" type="button">Sozinho · limpar a mesa com menos tacadas</button>
    <button class="ghost" data-m="local" type="button">2 jogadores neste PC · passam o mouse</button>
    <input id="v9p2" placeholder="Nome do jogador 2" maxlength="18" value="Jogador 2">
    ${online?`<button class="ghost" data-m="online" type="button">Chamar alguém do esquadrão (online)</button>`:''}
    <button class="ghost" data-m="x" type="button">Cancelar</button></div>`);
  document.body.appendChild(el); POOL.menu=el; el.querySelector('input').addEventListener('keydown',e=>e.stopPropagation());
  const close=()=>{ el.remove(); POOL.menu=null; try{ requestLock(); }catch(e){} };
  el.addEventListener('click',e=>{ const b=e.target.closest('[data-m]'); if(!b) return; const m=b.dataset.m; const me={id:NET.me||'me',name:poolMe(),group:null,score:0};
    if(m==='x'){ close(); return; }
    if(m==='cont'){ close(); poolEnter(); return; }
    if(m==='solo'){ close(); poolNew('solo',[me]); poolEnter(); return; }
    if(m==='local'){ const n2=(el.querySelector('#v9p2').value||'Jogador 2').slice(0,18); close(); poolNew('local',[me,{id:'p2',name:n2,group:null,score:0}]); poolEnter(); return; }
    if(m==='online'){ close(); POOL.netId='t'+Date.now().toString(36); POOL.mode='online'; POOL.players=[me]; poolNetSend(['pool','open',POOL.netId,me.name,NET.me]); poolRack(); poolSync(); poolMsg('Esperando alguém do esquadrão entrar na mesa…',30); poolEnter(); return; }
    if(m==='join'&&inv){ close(); POOL.netId=inv.id; poolNetSend(['pool','join',inv.id,me.name,NET.me]); POOL.invite=null; poolMsg('Entrando na partida…',4); poolEnter(); return; } }); }
v9On('reset',()=>{ if(POOL.on) poolExit(); POOL.invite=null; });
CMDS.sinuca={d:'sinuca · vai até a mesa do bar (na cidade) · sinuca reset arruma as bolas',f:a=>{ if(CUR!=='city'||!POOL.built){ cprint('A mesa fica no bar da cidade. Use "map cidade".'); return; } if(a[0]==='reset'){ poolRack(); poolSync(); cprint('Bolas arrumadas.'); return; } const w=poolWorld(-PT.L/2-0.9,0); P.pos.x=w.x; P.pos.z=w.z; cprint('No bar. Aperte E perto da mesa.'); }};
/* ---- correções: o menu da mesa não pausa o jogo; durante a partida o bar fecha (portas e janelas de aço) ---- */
{ const _np=v9NoPause; v9NoPause=function(){ return !!(POOL.menu||POOL.on||POOL.cool>0)||_np(); }; }
const PDOOR={closed:false,cells:[],sh:[],t:0};
function poolBar(){ return CITY_SHOPS.find(q=>q.id==='CB'); }
function poolInBar(x,z){ const s=poolBar(); if(!s) return false; const gx=Math.floor(x/S), gz=Math.floor(z/S); return gx>=s.x0&&gx<=s.x1&&gz>=czr(s.r0)&&gz<=czr(s.r1); }
function poolDoors(close){ const s=poolBar(); if(!s||PDOOR.closed===close) return; PDOOR.closed=close;
  if(close){ PDOOR.cells=[]; const z0=czr(s.r0), z1=czr(s.r1);
    for(let z=z0;z<=z1;z++) for(let x=s.x0;x<=s.x1;x++){ if(!(x===s.x0||x===s.x1||z===z0||z===z1)) continue; const ch=grid[z][x]; if(ch==='#') continue; PDOOR.cells.push([x,z,ch]); grid[z][x]='#'; }
    for(const [x,z] of PDOOR.cells){ const m=new THREE.Mesh(new THREE.BoxGeometry(S,1,S*0.3),stM('shutter',{color:0x5a5e60,shininess:40})); m.position.set(cx(x),WH,cx(z)); m.scale.y=0.01; MAPG.city.add(m); PDOOR.sh.push(m); }
    PDOOR.t=0; flowDirty=true;
    // zumbi que estava lá dentro é jogado para fora (volta a nascer em outro lugar)
    for(const z of zombies.slice()) if(!z.dead&&poolInBar(z.pos.x,z.pos.z)){ removeZombie(z); G.toSpawn=(G.toSpawn|0)+1; }
    try{ Snd.sample('door_metal',{vol:0.9,prio:true}); }catch(e){} poolMsg('O bar foi fechado: os zumbis não entram enquanto vocês jogam',3); }
  else { for(const [x,z,ch] of PDOOR.cells) grid[z][x]=ch; PDOOR.cells=[]; for(const m of PDOOR.sh) MAPG.city.remove(m); PDOOR.sh=[]; flowDirty=true; try{ Snd.sample('door_metal',{vol:0.7}); }catch(e){} } }
{ const _sp=spawnPoints; spawnPoints=function(){ const out=_sp.apply(this,arguments); if(!PDOOR.closed) return out; return out.filter(p=>!poolInBar(p.x,p.z)&&!(p.win&&poolInBar(p.win.wx,p.win.wz))); }; }
v9On('always',dt=>{ if(!PDOOR.sh.length) return; PDOOR.t=Math.min(1,PDOOR.t+dt*1.6); const k=PDOOR.t; for(const m of PDOOR.sh){ m.scale.y=Math.max(0.01,k*WH*1.25); m.position.y=WH*1.25-k*WH*1.25/2; } });
{ const _pe=poolEnter; poolEnter=function(){ _pe.apply(this,arguments); if(POOL.on&&poolInBar(P.pos.x,P.pos.z)) poolDoors(true); }; }
{ const _px=poolExit; poolExit=function(){ _px.apply(this,arguments); poolDoors(false); }; }
v9On('reset',()=>{ if(PDOOR.closed) poolDoors(false); });
/* as cartas de fim de rodada esperam a partida de sinuca acabar (não abrem por cima da mesa) */
{ const _oc=offerCards; offerCards=function(){ if(POOL.on||POOL.menu){ setTimeout(()=>{ if(G.state==='playing'||G.state==='paused') offerCards(); },1500); return; } return _oc.apply(this,arguments); }; }
