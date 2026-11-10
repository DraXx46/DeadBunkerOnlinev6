/* ================= v9 · BEBIDAS: Soro da Vida (revive extra) e Mula de Carga (3ª arma), máquinas e garrafas novas,
   e o auto-revive com drax no solo ================= */
PERKS.push(
  {key:'revive',name:'Soro da Vida',desc:'te levanta sozinho uma vez',letter:'S',cost:2500,color:0x2f7fd8,css:'#2f7fd8',spots:[],v9:true},
  {key:'mule',name:'Mula de Carga',desc:'carrega uma terceira arma',letter:'3',cost:4000,color:0x1f9a72,css:'#1f9a72',spots:[],v9:true});
const PERK_BY={}; for(const p of PERKS) PERK_BY[p.key]=p;
/* lugar para as máquinas novas: perto de uma máquina que já existe no mesmo mapa, encostada numa parede, fora de portas/janelas */
function v9PerkSpot(nearCell,map,taken){
  const [x0,z0]=nearCell; let best=null, bd=1e9;
  const isWall=c=>c==='#'; const used=new Set(taken.map(([x,z])=>x+','+z));
  for(let z=z0-9;z<=z0+9;z++) for(let x=x0-9;x<=x0+9;x++){ if(!inB(x,z)||grid[z][x]!=='.'||mapAtRow(z)!==map) continue;
    for(const [nx,nz] of [[1,0],[-1,0],[0,1],[0,-1]]){ if(!isWall(at(x-nx,z-nz))) continue; if(at(x+nx,z+nz)!=='.') continue;
      // longe de portas, janelas, compras na parede, outras máquinas
      let bad=false; for(let dz=-1;dz<=1&&!bad;dz++) for(let dx=-1;dx<=1&&!bad;dx++){ const c=at(x+dx,z+dz); if(c==='D'||c==='W'||used.has((x+dx)+','+(z+dz))) bad=true; }
      if(bad) continue; const d=Math.hypot(x-x0,z-z0); if(d<2.5) continue; const sc=d+(roomOf[z][x]!==roomOf[z0][x0]?4:0); if(sc<bd){ bd=sc; best={cell:[x,z],n:[nx,nz]}; } } }
  return best; }
(function placeNewPerks(){ try{
  const taken=[]; for(const p of PERKS) for(const s of p.spots) taken.push(s.cell);
  for(const s of (typeof wallBuys!=='undefined'?[]:[])) taken.push(s);
  const maps={bunker:[[2,10],[24,5]],hosp:[[hx(12),hz(2)],[hx(16),hz(19)]],farm:[[26,90],[29,122]],sandbox:[[30,148],[34,148]]};
  for(const [map,arr] of Object.entries(maps)) ['revive','mule'].forEach((k,i)=>{ const sp=v9PerkSpot(arr[i],map,taken); if(sp){ PERK_BY[k].spots.push(sp); taken.push(sp.cell); } });
}catch(e){ console.warn('[Bunker v9] bebidas novas',e); } })();
function v9Slots(){ return (G.perks&&G.perks.mule)?3:2; }

/* ---- máquina de bebida detalhada (por código): gabinete com chanfro, vitrine iluminada com garrafas nas prateleiras,
   letreiro em neon, moedeiro, bandeja, pés, ferrugem e o cabo indo para a parede ---- */
const PMC={};
function pmTex(p){ if(PMC[p.key]) return PMC[p.key];
  const side=tex(256,512,(c,w,h)=>{ const gr=c.createLinearGradient(0,0,w,0); const col='#'+p.color.toString(16).padStart(6,'0'); gr.addColorStop(0,'rgba(0,0,0,.35)'); gr.addColorStop(.5,'rgba(255,255,255,.06)'); gr.addColorStop(1,'rgba(0,0,0,.4)'); c.fillStyle=col; c.fillRect(0,0,w,h); c.fillStyle=gr; c.fillRect(0,0,w,h);
    c.globalAlpha=.9; c.fillStyle='#f4ead2'; c.font='bold 120px "Stardos Stencil", Impact, sans-serif'; c.textAlign='center'; c.save(); c.translate(w/2,h/2); c.rotate(-Math.PI/2); c.fillText(p.name.toUpperCase(),0,40); c.restore(); c.globalAlpha=1;
    for(let i=0;i<70;i++){ c.fillStyle=`rgba(${70+rand(0,40)|0},${30+rand(0,20)|0},10,${rand(.08,.3)})`; c.beginPath(); c.ellipse(rand(0,w),rand(0,h),rand(4,26),rand(3,18),rand(0,3),0,Math.PI*2); c.fill(); }
    for(let i=0;i<14;i++){ c.strokeStyle='rgba(0,0,0,.35)'; c.lineWidth=rand(1,2); c.beginPath(); const x=rand(0,w),y=rand(0,h); c.moveTo(x,y); c.lineTo(x+rand(-30,30),y+rand(-30,30)); c.stroke(); }
    c.fillStyle='rgba(0,0,0,.45)'; c.fillRect(0,h-40,w,40); });
  const logo=tex(512,256,(c,w,h)=>{ c.fillStyle='#0d0a07'; c.fillRect(0,0,w,h); const col='#'+p.color.toString(16).padStart(6,'0');
    c.strokeStyle=col; c.lineWidth=10; c.shadowColor=col; c.shadowBlur=24; c.strokeRect(14,14,w-28,h-28); c.shadowBlur=30; c.fillStyle='#fff6e0'; c.textAlign='center'; c.textBaseline='middle';
    c.font='bold 74px "Stardos Stencil", Impact, sans-serif'; c.fillText(p.name.toUpperCase(),w/2,h*0.42); c.shadowBlur=0; c.font='26px "Special Elite", monospace'; c.fillStyle='#e9d9b8'; c.fillText(p.desc,w/2,h*0.74);
    c.fillStyle=col; c.beginPath(); c.arc(54,h/2,26,0,Math.PI*2); c.fill(); c.fillStyle='#0d0a07'; c.font='bold 34px Impact'; c.fillText(p.letter,54,h/2+2); });
  return PMC[p.key]={side,logo}; }
function v9BottleGeo(){ if(PMC._bg) return PMC._bg; const pts=[]; const prof=[[0,0],[.42,0],[.5,.04],[.5,.52],[.46,.6],[.22,.74],[.17,.8],[.17,.92],[.2,.94],[.2,1],[0,1]];
  for(const [r,y] of prof) pts.push(new THREE.Vector2(r*0.11,y*0.3)); return PMC._bg=new THREE.LatheGeometry(pts,14); }
function v9PerkMachine(p,g){
  const T=pmTex(p); const colM=new THREE.MeshPhongMaterial({map:T.side,shininess:45,specular:0x555555});
  const dark=v9Mat('pmDark',{color:0x15130f,shininess:20}), chrome=v9Mat('pmChrome',{color:0xc8ccd0,shininess:110,specular:0xffffff}), rub=v9Mat('pmRub',{color:0x0a0a0a,shininess:5});
  const W=1.12,H=2.15,D=0.82;
  // gabinete: laterais com textura, frente escura, topo arredondado
  v9Mesh(new THREE.BoxGeometry(W,H-0.1,D),colM,g,0,(H-0.1)/2+0.06,0);
  const top=v9Mesh(new THREE.CylinderGeometry(D/2,D/2,W,18,1,false,0,Math.PI),colM,g,0,H-0.04,0,0,0,Math.PI/2); top.rotation.set(Math.PI/2,0,Math.PI/2);
  for(const sx of [-1,1]) v9Mesh(new THREE.BoxGeometry(0.06,H-0.1,0.07),chrome,g,sx*(W/2-0.02),(H-0.1)/2+0.06,D/2+0.01);
  v9Mesh(new THREE.BoxGeometry(W-0.04,0.06,0.07),chrome,g,0,H-0.07,D/2+0.01); v9Mesh(new THREE.BoxGeometry(W-0.04,0.06,0.07),chrome,g,0,0.12,D/2+0.01);
  // pés
  for(const sx of [-1,1]) for(const sz of [-1,1]) v9Mesh(new THREE.CylinderGeometry(0.05,0.06,0.08,8),rub,g,sx*(W/2-0.1),0.04,sz*(D/2-0.1));
  // letreiro (neon) no alto
  const sign=v9Mesh(new THREE.PlaneGeometry(W-0.12,0.5),new THREE.MeshBasicMaterial({map:T.logo,color:0x333333}),g,0,1.78,D/2+0.051);
  // vitrine: fundo iluminado, prateleiras e garrafas
  const backM=new THREE.MeshBasicMaterial({color:0x222222}); v9Mesh(new THREE.PlaneGeometry(0.66,0.86),backM,g,-0.12,1.02,D/2-0.12);
  const frame=v9Mat('pmFrame',{color:0x2a2a28,shininess:60}); for(const [w2,h2,x2,y2] of [[0.74,0.05,-0.12,1.47],[0.74,0.05,-0.12,0.57],[0.05,0.92,-0.48,1.02],[0.05,0.92,0.24,1.02]]) v9Mesh(new THREE.BoxGeometry(w2,h2,0.12),frame,g,x2,y2,D/2-0.02);
  const shelf=v9Mat('pmShelf',{color:0x8a8a84,shininess:50}); const bottles=[];
  for(let r=0;r<3;r++){ v9Mesh(new THREE.BoxGeometry(0.66,0.015,0.2),shelf,g,-0.12,0.66+r*0.28,D/2-0.12);
    for(let i=0;i<4;i++){ const b=v9Mesh(v9BottleGeo(),new THREE.MeshBasicMaterial({color:0x222222}),g,-0.39+i*0.18,0.67+r*0.28,D/2-0.12); bottles.push(b);
      const cap=v9Mesh(new THREE.CylinderGeometry(0.024,0.024,0.025,8),chrome,b,0,0.305,0); } }
  const glass=v9Mesh(new THREE.PlaneGeometry(0.68,0.88),v9Mat('pmGlass',{color:0x88aab8,transparent:true,opacity:0.18,shininess:120,specular:0xffffff,depthWrite:false}),g,-0.12,1.02,D/2+0.035);
  // painel de botões, moedeiro e bandeja
  v9Mesh(new THREE.BoxGeometry(0.22,0.86,0.06),dark,g,0.4,1.02,D/2+0.02);
  for(let i=0;i<6;i++) v9Mesh(new THREE.BoxGeometry(0.07,0.05,0.025),v9Mat('pmBtn'+(i%3),{color:[0xd8c060,0xc04030,0x50a060][i%3],shininess:80}),g,0.36+(i%2)*0.09,1.3-Math.floor(i/2)*0.1,D/2+0.06);
  v9Mesh(new THREE.BoxGeometry(0.06,0.12,0.02),chrome,g,0.4,0.88,D/2+0.06); v9Mesh(new THREE.BoxGeometry(0.02,0.06,0.03),dark,g,0.4,0.88,D/2+0.07);
  v9Mesh(new THREE.BoxGeometry(0.5,0.2,0.12),dark,g,-0.1,0.32,D/2+0.02); v9Mesh(new THREE.BoxGeometry(0.46,0.14,0.02),v9Mat('pmFlap',{color:0x3a3a36,shininess:40}),g,-0.1,0.33,D/2+0.085);
  // cabo até a parede
  const cab=v9Mesh(new THREE.TorusGeometry(0.18,0.02,6,12,Math.PI),rub,g,0.45,0.18,-D/2-0.12,Math.PI/2,0,0);
  // luz que só acende com a energia
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:p.color,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0})); glow.scale.set(2.4,2.4,1); glow.position.set(0,1.75,D/2+0.3); g.add(glow);
  const floorGlow=v9Mesh(new THREE.PlaneGeometry(1.6,1.2),new THREE.MeshBasicMaterial({map:glowTex,color:p.color,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}),g,0,0.02,D/2+0.5,-Math.PI/2,0,0);
  return {sign,bottles,glow,floorGlow,backM};
}
const PM_EXTRA=[];
function v9PerkSignsExtra(on){ for(const e of PM_EXTRA){ e.glow.material.opacity=on?0.55:0; e.floorGlow.material.opacity=on?0.35:0; e.backM.color.setHex(on?0xfff2d8:0x222222); } }
v9On('always',()=>{ if(!G.power) return; for(const e of PM_EXTRA){ if(e.g.parent&&!e.g.parent.visible) continue; e.glow.material.opacity=0.45+Math.sin(G.t*3+e.ph)*0.08+(Math.random()<0.006?-0.4:0); } });

/* garrafa da animação de beber (primeira pessoa): vidro colorido, rótulo, tampa, líquido */
(function(){ try{ bottle.geometry=v9BottleGeo(); bottle.scale.setScalar(0.9); bottle.material.transparent=true; bottle.material.opacity=0.85;
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.024,0.025,10),new THREE.MeshPhongMaterial({color:0xc8ccd0,shininess:110})); cap.position.y=0.305; bottle.add(cap);
  const lab=new THREE.Mesh(new THREE.CylinderGeometry(0.0565,0.0565,0.07,14,1,true),new THREE.MeshPhongMaterial({color:0xf2e8cf,shininess:20})); lab.position.y=0.1; bottle.add(lab);
  const liq=new THREE.Mesh(new THREE.CylinderGeometry(0.045,0.042,0.14,12),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.5})); liq.position.y=0.075; bottle.add(liq); }catch(e){} })();

/* ---- Soro da Vida e auto-revive com drax ---- */
const SREV={on:false,t:0,dur:3,kind:'',offer:false,el:null,cost:0};
function selfReviveCost(){ return Math.round(250*Math.pow(4,G.selfRevN|0)); }
function v9BeforeDeath(){
  if(SREV.on||SREV.offer) return true;
  if(x1Live()||CUR==='sandbox') return false;
  if(G.perks&&G.perks.revive){ G.perks.revive=false; hudPerks(); srevStart('soro'); return true; }
  if(!NET.mode&&!CHEAT.on){ srevOffer(); return true; }
  return false;
}
function srevStart(kind){ SREV.on=true; SREV.t=0; SREV.dur=kind==='soro'?3:2.2; SREV.kind=kind; P.down=1; P.bleed=99; P.hp=0; Wp.reloading=false; IN.ads=false;
  banner(kind==='soro'?'SORO DA VIDA':'DE VOLTA À LUTA',kind==='soro'?'O soro te põe de pé em instantes…':'Os drax te trouxeram de volta','gold'); srevHud(); }
function srevHud(){ if(!SREV.el){ const el=v9El('div','',''); el.id='srev'; document.body.appendChild(el); SREV.el=el;
    el.addEventListener('click',e=>{ const b=e.target.closest('[data-srev]'); if(b) srevChoose(b.dataset.srev==='yes'); }); }
  const el=SREV.el; el.hidden=!(SREV.on||SREV.offer); if(el.hidden) return;
  if(SREV.offer){ const c=SREV.cost, have=PROG.drax+Math.floor(G.drax-(G.draxBank|0));
    el.innerHTML=`<div class="sr-card"><small>VOCÊ CAIU</small><h3>Levantar com drax?</h3><p>${(G.selfRevN|0)?`Já levantou ${G.selfRevN}× nesta partida — cada vez fica muito mais caro.`:'Primeira queda: o preço mais baixo da partida.'}</p>
      <div class="sr-cost">◆ ${v9Fmt(c)}</div><div class="sr-have">Você tem ◆ ${v9Fmt(have)}</div>
      <div class="sr-btns"><button data-srev="yes" class="cta"${have<c?' disabled':''}>Levantar · E</button><button data-srev="no" class="ghost">Desistir · Esc</button></div><i class="sr-t"></i></div>`; }
  else el.innerHTML=`<div class="sr-card mini"><small>${SREV.kind==='soro'?'SORO DA VIDA':'LEVANTANDO'}</small><i class="sr-t"></i></div>`; }
v9Css(`#srev{position:fixed;inset:0;z-index:45;display:flex;align-items:center;justify-content:center;pointer-events:none}
#srev .sr-card{pointer-events:auto;background:rgba(12,8,6,.86);border:1px solid #7a5a2a;padding:18px 26px 16px;min-width:320px;text-align:center;box-shadow:0 0 50px rgba(0,0,0,.6)}
#srev .sr-card.mini{pointer-events:none;min-width:240px;padding:10px 18px;margin-top:30vh}
#srev small{font:12px "Special Elite",monospace;letter-spacing:.3em;color:#c9a24a}#srev h3{margin:6px 0 4px;font:700 28px "Stardos Stencil",Impact,sans-serif;color:#f4ead2}
#srev p{margin:0 0 8px;color:#a59c8a;font-size:13px}#srev .sr-cost{font:700 34px "Stardos Stencil",Impact;color:#7fc8ff;text-shadow:0 0 12px #2f7fd8}#srev .sr-have{font-size:12px;color:#8a8478;margin-bottom:10px}
#srev .sr-btns{display:flex;gap:10px;justify-content:center}#srev .sr-t{display:block;height:4px;margin-top:12px;background:linear-gradient(90deg,#2f7fd8,#9fe0ff);transform-origin:left}`);
function srevOffer(){ SREV.offer=true; SREV.t=0; SREV.dur=7; SREV.cost=selfReviveCost(); P.down=1; P.bleed=99; P.hp=0; Wp.reloading=false; IN.ads=false; try{ bankDrax(); }catch(e){}
  if(document.pointerLockElement) document.exitPointerLock(); srevHud(); try{ Snd.heart(); }catch(e){} }
function srevChoose(yes){ if(!SREV.offer) return; SREV.offer=false;
  if(yes){ try{ bankDrax(); }catch(e){} if(PROG.drax>=SREV.cost){ PROG.drax-=SREV.cost; saveProg(); G.selfRevN=(G.selfRevN|0)+1; try{ Snd.ui('unlock'); }catch(e){} srevStart('drax'); if(!isTouch) try{ requestLock(); }catch(e){} return; } try{ Snd.ui('deny'); }catch(e){} }
  srevHud(); P.down=0; gameOver(); }
addEventListener('keydown',e=>{ if(!SREV.offer) return; if(e.code==='KeyE'||e.code==='Enter'){ e.preventDefault(); e.stopImmediatePropagation(); srevChoose(true); } else if(e.code==='Escape'){ e.preventDefault(); e.stopImmediatePropagation(); srevChoose(false); } },true);
v9On('frame',dt=>{
  if(!SREV.on&&!SREV.offer) return; SREV.t+=dt; const k=clamp(SREV.t/SREV.dur,0,1); const bar=SREV.el&&SREV.el.querySelector('.sr-t'); if(bar) bar.style.transform=`scaleX(${SREV.offer?(1-k).toFixed(3):k.toFixed(3)})`;
  if(SREV.offer){ if(k>=1) srevChoose(false); return; }
  if(k>=1){ SREV.on=false; P.down=0; P.maxHp=maxHp(); P.hp=P.maxHp; P.lastHit=G.t; P.y=0; srevHud(); flashScreen(); try{ Snd.puGet(); }catch(e){}
    // empurra os zumbis colados para trás ao levantar
    for(const z of zlist()){ if(z.dead) continue; const dx=z.pos.x-P.pos.x, dz=z.pos.z-P.pos.z, d=Math.hypot(dx,dz); if(d<3&&d>0.01&&!z.ghost){ z.kbx=(z.kbx||0)+dx/d*6; z.kbz=(z.kbz||0)+dz/d*6; z.stagT=Math.max(z.stagT||0,1); } } }
});
v9On('reset',()=>{ SREV.on=SREV.offer=false; G.selfRevN=0; if(SREV.el) SREV.el.hidden=true; });
/* perder a Mula (cair no cooperativo) larga a 3ª arma */
v9On('frame',()=>{ if(Wp.inv.length>v9Slots()){ const extra=Wp.inv.splice(v9Slots()); if(Wp.cur>=Wp.inv.length) Wp.cur=0; setGunModel(); hudAmmo(); toast(`Sem a Mula de Carga: ${extra.map(s=>wstat(s).name).join(', ')} ficou para trás`,{bad:true}); } });
