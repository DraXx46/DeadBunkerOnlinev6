/* ================= v9 · PACOTE DE MELHORIAS (sensação, progressão, ritmo, social, desempenho) =================
   · Sensação: a arma "pesa" (atrasa um pouco no giro), marcador de acerto mais forte, tiro na cabeça com som e marca próprios
   · Progressão: desafios diários (3) e semanal (1) com prêmio, recordes por mapa, camuflagens de arma (Ouro, Platina, Diamante)
   · Ritmo: rodadas especiais (5, 15, 25…): só cães, neblina, gigantes; zumbis novos: Bolha de Gás e Blindado
   · Social: ping (B ou botão do meio do mouse) visto por todos, marcador de amigo caído com distância
   · Desempenho: modo automático que baixa a qualidade se o FPS cair; névoa baixa nos mapas; dicas na tela de carregamento */

/* ---------------- sensação ---------------- */
const SWAY={yaw:null,pitch:null,x:0,y:0,vx:0,vy:0};
V9VM.push(dt=>{ if(SWAY.yaw==null){ SWAY.yaw=P.yaw; SWAY.pitch=P.pitch; return; } let dy=P.yaw-SWAY.yaw; while(dy>Math.PI) dy-=Math.PI*2; while(dy<-Math.PI) dy+=Math.PI*2; const dp=P.pitch-SWAY.pitch; SWAY.yaw=P.yaw; SWAY.pitch=P.pitch;
  const k=Wp.scoped||P.ads>0.6?0.15:1; SWAY.vx+=(-dy*0.9*k-SWAY.x*60)*dt*0+(-dy*0.9*k); SWAY.vy+=(dp*0.7*k);
  SWAY.x+=SWAY.vx; SWAY.y+=SWAY.vy; SWAY.vx*=0.55; SWAY.vy*=0.55; SWAY.x*=Math.exp(-dt*9); SWAY.y*=Math.exp(-dt*9); SWAY.x=clamp(SWAY.x,-0.12,0.12); SWAY.y=clamp(SWAY.y,-0.1,0.1);
  vmRoot.rotation.y+=SWAY.x*0.9; vmRoot.position.x+=SWAY.x*0.12; vmRoot.rotation.x+=SWAY.y*0.6; vmRoot.position.y-=SWAY.y*0.08; vmRoot.rotation.z+=SWAY.x*0.5; });
v9Css(`#hitm.on{animation:v9hm .14s ease-out}#hitm.kill{animation:v9hm .2s ease-out}#hitm.v9head::before,#hitm.v9head::after{background:#ff3a2a!important}
@keyframes v9hm{0%{transform:scale(1.7) rotate(8deg)}100%{transform:none}}
#v9headx{position:fixed;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;pointer-events:none;z-index:6;opacity:0}
#v9headx.on{animation:v9hx .35s ease-out}#v9headx::before,#v9headx::after{content:'';position:absolute;left:50%;top:0;width:3px;height:100%;margin-left:-1.5px;background:#ff4a2a;box-shadow:0 0 6px #ff2a1a}#v9headx::before{transform:rotate(45deg)}#v9headx::after{transform:rotate(-45deg)}
@keyframes v9hx{0%{opacity:1;transform:scale(.6)}100%{opacity:0;transform:scale(1.25)}}`);
const HEADX=v9El('div',''); HEADX.id='v9headx'; document.body.appendChild(HEADX);
let v9HeadT=0; v9On('hit',(z,part)=>{ if(part!=='head'||!z) return; const n=performance.now(); if(n-v9HeadT<70) return; v9HeadT=n; HEADX.classList.remove('on'); void HEADX.offsetWidth; HEADX.classList.add('on');
  try{ Snd.prio(()=>{ const o=Snd.out(0.55,0,0.1); Snd.oscTo(o,{freq:2600,freqEnd:1900,dur:0.07,gain:0.14,type:'triangle'}); Snd.burstTo(o,{type:'bandpass',freq:3800,q:6,dur:0.03,gain:0.3}); }); }catch(e){} });

/* ---------------- progressão: desafios, recordes, camuflagens ---------------- */
const CH_DAILY=[{k:'kills',t:'Mate {n} zumbis',n:150},{k:'knife',t:'Mate {n} zumbis na faca',n:25},{k:'heads',t:'Faça {n} tiros na cabeça que matam',n:60},{k:'boom',t:'Mate {n} zumbis com explosões',n:30},
  {k:'round',t:'Chegue na rodada {n}',n:12},{k:'dogs',t:'Mate {n} cachorros',n:15},{k:'fire',t:'Mate {n} zumbis com fogo ou choque',n:20},{k:'legs',t:'Quebre a perna de {n} zumbis',n:20}];
const CH_WEEK=[{k:'kills',t:'Mate {n} zumbis na semana',n:1500},{k:'round',t:'Chegue na rodada {n}',n:25},{k:'knife',t:'Mate {n} zumbis na faca',n:200},{k:'heads',t:'Faça {n} tiros na cabeça que matam',n:500}];
function chDay(){ return Math.floor(Date.now()/86400000); } function chWeek(){ return Math.floor((Date.now()/86400000+3)/7); }
function chState(){ const d=chDay(), w=chWeek(); let s=PROG.v9ch; if(!s||typeof s!=='object') s=PROG.v9ch={};
  if(s.d!==d){ const rng=mulberry(d*977+13); const pool=CH_DAILY.slice(); s.d=d; s.daily=[0,1,2].map(()=>{ const c=pool.splice(Math.floor(rng()*pool.length),1)[0]; return {k:c.k,t:c.t,n:c.n,p:0,ok:false}; }); }
  if(s.w!==w){ const rng=mulberry(w*131+7); const c=CH_WEEK[Math.floor(rng()*CH_WEEK.length)]; s.w=w; s.week={k:c.k,t:c.t,n:c.n,p:0,ok:false}; }
  return s; }
function chAdd(k,v,set){ if(CHEAT.on) return; const s=chState(); for(const c of s.daily.concat([s.week])){ if(c.ok||c.k!==k) continue; c.p=set?Math.max(c.p,v):c.p+v; if(c.p>=c.n){ c.p=c.n; c.ok=true; const week=c===s.week;
    const dx=week?1200:200, rb=week?5:1; PROG.drax=(PROG.drax|0)+dx; PROG.rubies=(PROG.rubies|0)+rb; try{ saveProg(); }catch(e){} toast(`Desafio ${week?'semanal':'diário'} completo: ${c.t.replace('{n}',c.n)} · +◆ ${dx} e ♦ ${rb}`); try{ Snd.sample('reward_pop',{vol:0.8,prio:true}); }catch(e){} } } }
v9On('kill',(x,z,kind,part,src,zz)=>{ chAdd('kills',1); if(src==='knife') chAdd('knife',1); if(part==='head') chAdd('heads',1); if(DEATH_GIB[src]) chAdd('boom',1); if(kind==='dog') chAdd('dogs',1); if(src==='burn'||src==='zap') chAdd('fire',1); });
v9On('hit',(z,part)=>{ if(part==='legs'&&z&&z.legBroke&&!z._chLeg){ z._chLeg=1; chAdd('legs',1); } });
v9On('roundStart',r=>{ chAdd('round',r,true); const rec=PROG.v9rec||(PROG.v9rec={}); const key=CUR==='hosp'&&TM.lab?'lab':CUR; if((rec[key]|0)<r){ rec[key]=r; if(r%5===0) try{ saveProg(); }catch(e){} } });
v9On('roundEnd',()=>{ try{ if(G.round%3===0) saveProg(); }catch(e){} });
// camuflagens por nível da arma (ganho com abates): Ouro (nv 5), Platina (nv 9), Diamante (nv 14)
const CAMO=[{L:14,n:'Diamante',c:0x9ae8ff,e:0x0a2a3a,s:140},{L:9,n:'Platina',c:0xd8dde2,e:0x111418,s:120},{L:5,n:'Ouro',c:0xd4a43a,e:0x1a1000,s:100}];
function camoFor(id){ const L=WLV(v9Wl()[id]|0).L; return CAMO.find(c=>L>=c.L)||null; }
const _v9sgm=setGunModel; setGunModel=function(){ const r=_v9sgm.apply(this,arguments); try{ const s=curSlot(); const cm=s&&!Wp.knifeOut?camoFor(s.id):null; if(cm&&gunModel){ gunModel.traverse(o=>{ if(!o.isMesh||!o.material) return; const ms=[].concat(o.material).map(m=>{ if(!m.color||m.transparent) return m; const q=m.clone(); q.color.lerp(new THREE.Color(cm.c),0.85); if(q.emissive) q.emissive.setHex(cm.e); if(q.shininess!=null){ q.shininess=cm.s; if(q.specular) q.specular.setHex(0xffffff); } if(q.metalness!=null){ q.metalness=0.9; q.roughness=0.25; } return q; }); o.material=Array.isArray(o.material)?ms:ms[0]; }); } }catch(e){} return r; };
// painel de desafios e recordes no menu
v9Css(`.v9chp{position:fixed;inset:0;z-index:40;background:rgba(0,0,0,.74);display:flex;align-items:center;justify-content:center}.v9chp .cb{position:relative;background:#0f0c09;border:1px solid #3a3022;padding:22px 26px;width:min(760px,94vw);max-height:88vh;overflow:auto}
.v9chp h2{margin:0 0 4px;font:700 32px "Stardos Stencil",Impact;color:#f4ead2}.v9chp h3{margin:18px 0 8px;font:12px "Special Elite",monospace;letter-spacing:.2em;text-transform:uppercase;color:#ff5a4a}
.v9chp .ch{display:grid;grid-template-columns:1fr 120px;gap:4px 14px;align-items:center;padding:10px 12px;border:1px solid #2a241c;margin-bottom:6px;background:rgba(255,255,255,.02)}.v9chp .ch.ok{border-color:#3a6a32;background:rgba(80,200,80,.06)}
.v9chp .ch b{color:#f4ead2;font-size:15px}.v9chp .ch small{color:#c9a24a;text-align:right}.v9chp .bar{grid-column:1/-1;height:5px;background:#2a241c}.v9chp .bar i{display:block;height:100%;background:#e0301f}.v9chp .ch.ok .bar i{background:#5acc4a}
.v9chp table{width:100%;border-collapse:collapse;font-size:14px}.v9chp td{padding:7px 8px;border-bottom:1px solid #241e18;color:#d8cbbb}.v9chp td:last-child{text-align:right;color:#f4ead2;font-weight:700}
.v9chp .x{position:absolute;right:14px;top:12px}.v9chp .cm{display:flex;gap:10px;flex-wrap:wrap}.v9chp .cm span{padding:6px 10px;border:1px solid #2a241c;font-size:13px}`);
function chOpen(){ const s=chState(); const left=86400000-(Date.now()%86400000); const row=c=>`<div class="ch ${c.ok?'ok':''}"><b>${c.t.replace('{n}',v9Fmt(c.n))}</b><small>${c.ok?'✓ completo':v9Fmt(c.p)+' / '+v9Fmt(c.n)}</small><div class="bar"><i style="width:${Math.round(c.p/c.n*100)}%"></i></div></div>`;
  const rec=PROG.v9rec||{}; const names={bunker:'O Bunker',hosp:'Hospício Vale Negro',farm:'Fazenda Santa Luzia',tz:'Tranzitch',city:'Cidade destruída',lab:'Laboratório 2087'};
  const el=v9El('div','v9chp',`<div class="cb"><button class="ghost x" type="button">Fechar</button><h2>Desafios</h2><p style="margin:0;color:#8a8478;font-size:13px">Diários renovam em ${Math.floor(left/3600000)} h ${Math.floor(left%3600000/60000)} min · prêmio: ◆ 200 e ♦ 1 cada · semanal: ◆ 1.200 e ♦ 5</p>
  <h3>Diários</h3>${s.daily.map(row).join('')}<h3>Semanal</h3>${row(s.week)}
  <h3>Recordes por mapa (maior rodada)</h3><table>${Object.keys(names).map(k=>`<tr><td>${names[k]}</td><td>${rec[k]?'Rodada '+rec[k]:'—'}</td></tr>`).join('')}</table>
  <h3>Camuflagens de arma</h3><p style="margin:0 0 8px;color:#8a8478;font-size:13px">Ganhe nível com a arma (abates com ela) para liberar: Ouro no nível 5, Platina no 9 e Diamante no 14.</p>
  <div class="cm">${Object.keys(WEAPONS).filter(id=>camoFor(id)).map(id=>`<span>${WEAPONS[id].name} · ${camoFor(id).n}</span>`).join('')||'<span>Nenhuma ainda</span>'}</div></div>`);
  document.body.appendChild(el); el.onclick=e=>{ if(e.target===el||e.target.classList.contains('x')){ el.remove(); Snd.ui('back'); } }; Snd.ui('tab'); }
(function(){ const nav=document.querySelector('.mtabs'); if(!nav||document.getElementById('chbtn')) return; const b=v9El('button','mtab'); b.id='chbtn'; b.type='button'; b.textContent='Desafios'; const ref=document.getElementById('setbtn'); nav.insertBefore(b,ref); b.addEventListener('click',chOpen); })();

/* ---------------- ritmo: rodadas especiais e zumbis novos ---------------- */
const SPR={k:'',fog:null,fk:null};
const SPR_LIST=[['caes','RODADA DOS CÃES','Só cachorros nesta rodada. Fiquem de costas para a parede.'],['neblina','NEBLINA DENSA','Mal dá para ver um palmo à frente. Escutem os passos.'],['gigantes','RODADA DOS GIGANTES','Menos zumbis, mas enormes e muito resistentes.']];
v9On('roundStart',r=>{ sprEnd(); if(r<5||r%10!==5||x1Live()||CUR==='sandbox') return; const s=pick(SPR_LIST); SPR.k=s[0]; banner(s[1],s[2],'red'); try{ Snd.sample('boss_roar',{vol:0.5,prio:true,rate:1.3}); }catch(e){}
  if(SPR.k==='caes'&&NET.mode!=='client'){ SPR.fk=CHEAT.forceKind; CHEAT.forceKind='dog'; }
  if(SPR.k==='neblina'&&scene.fog){ SPR.fog=scene.fog.density; scene.fog.density*=3.2; } });
v9On('roundEnd',()=>sprEnd()); v9On('reset',()=>sprEnd());
function sprEnd(){ if(SPR.k==='caes'&&SPR.fk!==undefined){ CHEAT.forceKind=SPR.fk; } if(SPR.k==='neblina'&&SPR.fog!=null&&scene.fog) scene.fog.density=SPR.fog; SPR.k=''; SPR.fog=null; SPR.fk=undefined; }
// zumbis novos (a partir da rodada 6): Bolha de Gás (explode numa nuvem tóxica) e Blindado (couraça na frente: atire pelas costas)
const armorM=new THREE.MeshPhongMaterial({color:0x5a5e62,shininess:70,specular:0x888888}), gasM=new THREE.MeshPhongMaterial({color:0x6a8a2a,shininess:80,specular:0x446622,transparent:true,opacity:0.92});
const _v9mz=makeZombie; makeZombie=function(spawn){ const z=_v9mz.apply(this,arguments); try{ if(z&&z.kind==='normal'&&!z.boss&&!spawn.kind&&G.round>=6&&!SPR.k){ const r=Math.random();
    if(SPR.k==='gigantes'){} else if(r<0.07) v9MakeGas(z); else if(r<0.13&&G.round>=9) v9MakeArmor(z); }
    if(SPR.k==='gigantes'&&z&&z.kind!=='dog'&&!z.boss){ z.g.scale.multiplyScalar(1.4); z.hp*=2.4; z.maxHp=z.hp; z.speed*=0.85; z.zdmg=(z.zdmg||30)*1.6; } }catch(e){} return z; };
function v9MakeGas(z){ z.v9var='gas'; z.hp*=1.3; z.maxHp=z.hp; z.speed*=0.8; const sp=z.spine||z.g; for(let i=0;i<6;i++){ const b=new THREE.Mesh(new THREE.SphereGeometry(rand(0.08,0.16),10,8),gasM); b.position.set(rand(-0.18,0.18),rand(0.15,0.55),rand(-0.2,0.2)); sp.add(b); } if(z.mats) z.mats.forEach(m=>m.color&&m.color.lerp(new THREE.Color(0x8aa04a),0.35)); }
function v9MakeArmor(z){ z.v9var='armor'; z.hp*=1.5; z.maxHp=z.hp; z.speed*=0.9; const sp=z.spine||z.g; const plate=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.5,0.06),armorM); plate.position.set(0,0.32,0.2); sp.add(plate);
  for(const s of [-1,1]){ const sh=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.08,0.24),armorM); sh.position.set(s*0.24,0.56,0); sp.add(sh); } if(z.headP){ const h=new THREE.Mesh(new THREE.SphereGeometry(0.16,12,8,0,Math.PI*2,0,Math.PI/2),armorM); h.position.y=0.16; z.headP.add(h); } }
const _v9bpre=v9BulletPre; v9BulletPre=function(z,part,pt,dir,s,d){ let k=_v9bpre.apply(this,arguments); try{ if(z&&z.v9var==='armor'&&dir){ const fx=Math.sin(z.yaw), fz=Math.cos(z.yaw); const front=-(dir.x*fx+dir.z*fz); if(front>0.2){ k*=0.25; if(Math.random()<0.4) emit('spark',z.pos.x,zy(z)+1.2,z.pos.z,4,2.5,0.2); } else if(front<-0.2) k*=1.6; } }catch(e){} return k; };
v9On('kill',(x,zz,kind,part,src,z)=>{ if(!z||z.v9var!=='gas') return; gasCloud(x,zz,true); });
const GAS=[]; function gasCloud(x,z,real){ const g=new THREE.Group(); g.position.set(x,floorAt(x,z),z); for(let i=0;i<14;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x8acc3a,transparent:true,opacity:0.35,depthWrite:false})); s.position.set(rand(-1.6,1.6),rand(0.3,1.6),rand(-1.6,1.6)); s.scale.setScalar(rand(1.6,2.6)); g.add(s); } scene.add(g); GAS.push({g,x,z,t:0,real}); try{ Snd.sample('acid_sizzle',{vol:0.6,x,z,range:30}); }catch(e){} if(real) pushEv(['gas',r10(x),r10(z)]); }
V9NET.ev.gas=e=>gasCloud(e[1]/10,e[2]/10,false);
v9On('frame',dt=>{ for(let i=GAS.length-1;i>=0;i--){ const q=GAS[i]; q.t+=dt; q.g.children.forEach((s,j)=>{ s.material.opacity=0.35*Math.min(1,(6-q.t)/1.5); s.position.y+=dt*0.08; s.material.rotation+=dt*0.3*(j%2?1:-1); });
  if(!P.down&&Math.hypot(P.pos.x-q.x,P.pos.z-q.z)<2.2&&q.t<5.5){ q.tick=(q.tick||0)-dt; if(q.tick<=0){ q.tick=0.5; hurtPlayer(6,null); } }
  if(q.t>6){ scene.remove(q.g); GAS.splice(i,1); } } });

/* ---------------- social: ping e amigo caído ---------------- */
v9Css(`.v9ping{position:fixed;z-index:6;pointer-events:none;transform:translate(-50%,-100%);text-align:center;font:700 12px "Special Elite",monospace;color:#ffd24a;text-shadow:0 1px 3px #000}.v9ping i{display:block;width:16px;height:16px;margin:0 auto 2px;border:2px solid currentColor;transform:rotate(45deg);box-shadow:0 0 8px currentColor}
.v9ping.zb{color:#ff5a3a}.v9down{position:fixed;z-index:6;pointer-events:none;transform:translate(-50%,-100%);text-align:center;font:700 12px "Special Elite",monospace;color:#ff3a2a;text-shadow:0 1px 3px #000;animation:v9dp 1s infinite}.v9down b{display:block;font-size:22px}@keyframes v9dp{50%{opacity:.5}}`);
const PINGS=[]; const _pv=new THREE.Vector3(), _pd=new THREE.Vector3();
function pingMake(x,y,z,zb,who){ const el=v9El('div','v9ping'+(zb?' zb':''),`<i></i><span></span>`); document.body.appendChild(el); PINGS.push({el,x,y,z,t:0,who}); while(PINGS.length>6){ const o=PINGS.shift(); o.el.remove(); } try{ Snd.ui('tick'); }catch(e){} }
function pingNow(){ if(G.state!=='playing'||P.down) return; camera.getWorldDirection(_pd); let best=null, bd=60; for(const z of zlist()){ if(z.dead) continue; _pv.set(z.pos.x-camera.position.x,zy(z)+1.2-camera.position.y,z.pos.z-camera.position.z); const d=_pv.length(); if(d>bd) continue; if(_pv.normalize().dot(_pd)>0.985){ best=z; bd=d; } }
  let x,y,z,zb=false; if(best){ x=best.pos.x; y=zy(best)+2.1; z=best.pos.z; zb=true; } else { const t=Math.min(rayWall(camera.position,_pd,50),50); x=camera.position.x+_pd.x*t; y=camera.position.y+_pd.y*t+0.3; z=camera.position.z+_pd.z*t; }
  pingMake(x,y,z,zb,'me'); const a=['png',r10(x),r10(y),r10(z),zb?1:0]; if(NET.mode==='host') pushEv(a.concat([NET.me||''])); else if(NET.mode==='client') netAct(a); }
V9NET.ev.png=e=>{ if(e[5]&&String(e[5])===String(NET.me)) return; pingMake(e[1]/10,e[2]/10,e[3]/10,!!e[4],'o'); };
V9NET.act.png=(peer,a)=>{ pushEv(['png',a[1],a[2],a[3],a[4],peer]); pingMake(a[1]/10,a[2]/10,a[3]/10,!!a[4],'o'); };
addEventListener('keydown',e=>{ if(e.code==='KeyB'&&!e.repeat&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))) pingNow(); });
addEventListener('mousedown',e=>{ if(e.button===1&&G.state==='playing'){ e.preventDefault(); pingNow(); } });
const DOWNS=new Map();
v9On('always',dt=>{ const W=innerWidth, H=innerHeight;
  for(let i=PINGS.length-1;i>=0;i--){ const p=PINGS[i]; p.t+=dt; if(p.t>6||G.state==='menu'){ p.el.remove(); PINGS.splice(i,1); continue; } _pv.set(p.x,p.y,p.z).project(camera); const vis=_pv.z<1; p.el.style.display=vis?'':'none'; if(vis){ p.el.style.left=((_pv.x+1)/2*W)+'px'; p.el.style.top=((1-_pv.y)/2*H)+'px'; p.el.querySelector('span').textContent=Math.round(Math.hypot(p.x-P.pos.x,p.z-P.pos.z))+' m'; p.el.style.opacity=p.t>5?6-p.t:1; } }
  // amigo caído: ícone com distância por cima dele
  const seen=new Set(); if(NET.mode&&G.state==='playing') for(const rp of NET.players.values()){ if(!rp||rp.x==null||!(rp.down>0)) continue; seen.add(rp); let el=DOWNS.get(rp); if(!el){ el=v9El('div','v9down','<b>✚</b><span></span>'); document.body.appendChild(el); DOWNS.set(rp,el); }
    _pv.set(rp.x,(rp.y||0)+1.2,rp.z).project(camera); const vis=_pv.z<1; el.style.display=vis?'':'none'; el.style.left=clamp((_pv.x+1)/2*W,30,W-30)+'px'; el.style.top=clamp((1-_pv.y)/2*H,40,H-30)+'px'; el.querySelector('span').textContent=(rp.name||'Amigo')+' caído · '+Math.round(Math.hypot(rp.x-P.pos.x,rp.z-P.pos.z))+' m'; }
  for(const [rp,el] of DOWNS) if(!seen.has(rp)){ el.remove(); DOWNS.delete(rp); } });

/* ---------------- desempenho automático, névoa baixa, dicas ---------------- */
const AUTOQ={on:localStorage.getItem('db_autoq')!=='0',acc:0,n:0,t:0,low:0,done:0};
v9On('always',(dt,raw)=>{ if(!AUTOQ.on||G.state!=='playing') return; const r=raw||dt; AUTOQ.acc+=r; AUTOQ.n++; AUTOQ.t+=r; if(AUTOQ.t<4) return; const fps=AUTOQ.n/AUTOQ.acc; AUTOQ.t=0; AUTOQ.acc=0; AUTOQ.n=0;
  if(fps<38){ AUTOQ.low++; if(AUTOQ.low>=2&&AUTOQ.done<4){ AUTOQ.low=0; AUTOQ.done++; let msg='';
      if(CFG.bloom||CFG.mblur||CFG.flShadow||CFG.grain||CFG.chroma){ CFG.bloom=CFG.mblur=CFG.flShadow=CFG.grain=CFG.chroma=false; msg='efeitos pesados desligados'; }
      else if(CFG.quality>0.6){ CFG.quality=Math.max(0.6,+(CFG.quality-0.1).toFixed(2)); msg='escala de renderização '+Math.round(CFG.quality*100)+'%'; }
      if(msg){ try{ saveCfg(); applyCfg(); syncSettings(); }catch(e){} toast('Desempenho automático: '+msg); } } } else AUTOQ.low=0; });
(function(){ const box=document.querySelector('.setp[data-st="video"]'); if(!box) return; const b=v9El('button','sw'); b.type='button'; b.setAttribute('role','switch'); b.innerHTML='<span>Desempenho automático (baixa a qualidade sozinho se o FPS cair)</span><i></i>'; const sync=()=>b.classList.toggle('on',AUTOQ.on); sync(); b.setAttribute('aria-checked',AUTOQ.on);
  b.addEventListener('click',e=>{ e.stopPropagation(); AUTOQ.on=!AUTOQ.on; localStorage.setItem('db_autoq',AUTOQ.on?'1':'0'); sync(); b.setAttribute('aria-checked',AUTOQ.on); }); const p=box.querySelector('p.file'); box.insertBefore(b,p||null); })();
// névoa baixa: nuvens rasteiras em volta do jogador
const LOWFOG={g:null,s:[]};
v9On('always',dt=>{ if(G.state!=='playing'||CFG.potato){ if(LOWFOG.g) LOWFOG.g.visible=false; return; } if(!LOWFOG.g){ LOWFOG.g=new THREE.Group(); scene.add(LOWFOG.g); for(let i=0;i<22;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0x8a9098,transparent:true,opacity:0.07,depthWrite:false})); s.scale.set(rand(5,9),rand(1.2,2),1); s.position.set(rand(-18,18),rand(0.2,0.7),rand(-18,18)); s.userData.v=rand(0.2,0.5); LOWFOG.g.add(s); LOWFOG.s.push(s); } }
  LOWFOG.g.visible=true; for(const s of LOWFOG.s){ s.position.x+=s.userData.v*dt; const dx=s.position.x-P.pos.x, dz=s.position.z-P.pos.z; if(Math.abs(dx)>20||Math.abs(dz)>20){ s.position.x=P.pos.x+rand(-18,-12)*Math.sign(dx||1)*-1; s.position.z=P.pos.z+rand(-18,18); } s.position.y=floorAt(s.position.x,s.position.z)+0.45; } });
// dicas na tela preta de carregamento
const TIPS=['Tiro na perna quebra a perna: o zumbi passa a mancar. Nas duas, ele rasteja.','Golpe pesado da faca (botão direito) em um zumbi de frente: finalização na cabeça.','O Blindado tem couraça na frente. Atire pelas costas.','Não fique perto quando a Bolha de Gás morrer.','Aperte B (ou o botão do meio do mouse) para marcar um lugar para o grupo.','Desafios diários dão drax e rubis: veja em Desafios no menu.','Armas ganham camuflagem Ouro, Platina e Diamante conforme você mata com elas.','A cada 5 rodadas pode vir uma rodada especial: cães, neblina ou gigantes.'];
(function(){ const el=document.querySelector('#v9intro .intro-load'); if(!el) return; let i=Math.floor(Math.random()*TIPS.length); el.textContent='carregando… · '+TIPS[i]; setInterval(()=>{ if(!document.body.contains(el)) return; i=(i+1)%TIPS.length; el.textContent='carregando… · '+TIPS[i]; },4500); })();
