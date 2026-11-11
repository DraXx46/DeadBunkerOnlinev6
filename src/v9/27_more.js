/* ================= v9 · MAIS GAMEPLAY =================
   corrida (Shift) com fôlego · recarga tática · placar no Tab · conquistas · música dinâmica · chuva na cidade e
   relâmpagos no hospício · frases rápidas (N) · tamanho da interface · histórico de partidas · dificuldade dinâmica ·
   modos (um tiro, arma aleatória) · cabeça explodindo com escopeta e rifle de precisão de perto */

/* ---------------- corrida ---------------- */
const SPRINT={on:false,b:0,st:1,rest:0,raise:0,air:0};
function v9SprPad(){ if((IN.my||0)<-0.5&&!Wp.knifeOut&&G.state==='playing'){ SPRINT.pad=true; return true; } return false; }   // L3 com o analógico para frente = correr (senão continua sendo a faca)
function v9SprFov(){ try{ return SPRINT.b*7; }catch(e){ return 0; } }   // o campo de visão abre um pouco na corrida (usado na linha do fovT)
v9On('always',dt=>{ if((IN.my||0)>-0.35) SPRINT.pad=false;
  const want=(keys.ShiftLeft||keys.ShiftRight||SPRINT.pad)&&G.state==='playing'&&!P.down&&!(P.ads>0.2)&&!Wp.scoped&&(keys.KeyW||keys.ArrowUp||(IN.my||0)<-0.5)&&!(P.crouch>0.3)&&!DOGQ.on&&!FIN.on;
  const can=want&&SPRINT.st>0.02&&(SPRINT.on||SPRINT.st>0.15);
  if(can&&!SPRINT.on){ SPRINT.on=true; }
  if(!can&&SPRINT.on){ SPRINT.on=false; SPRINT.raise=0.22; }
  if(SPRINT.on){ SPRINT.st=Math.max(0,SPRINT.st-dt/6.5); SPRINT.rest=1.1; } else { SPRINT.rest-=dt; if(SPRINT.rest<=0) SPRINT.st=Math.min(1,SPRINT.st+dt/4); }
  SPRINT.raise=Math.max(0,SPRINT.raise-dt); SPRINT.b+=((SPRINT.on?1:0)-SPRINT.b)*Math.min(1,dt*9);
  sprintHud(); });
const _v9spk=v9SpeedK; v9SpeedK=function(){ return _v9spk()*(1+0.55*SPRINT.b*(Wp.knifeOut?1.05:1)); };
const _v9fire=fire; fire=function(){ if(SPRINT.on||SPRINT.raise>0) return; return _v9fire.apply(this,arguments); };
V9VM.push(dt=>{ SPRINT.air+=((P.y>0.02?1:0)-SPRINT.air)*Math.min(1,dt*14); const b=SPRINT.b*(1-SPRINT.air); if(b<0.01) return;   /* no ar a pose de corrida some: braços voltam ao normal durante o pulo */ const t=performance.now()/1000*11; vmRoot.rotation.z+=0.45*b; vmRoot.rotation.y+=0.35*b; vmRoot.rotation.x-=0.25*b; vmRoot.position.y-=0.05*b+Math.abs(Math.sin(t))*0.02*b; vmRoot.position.x+=0.03*b+Math.sin(t)*0.012*b; });
const SPH=v9El('div','v9sprint','<i></i>'); document.body.appendChild(SPH);
v9Css(`.v9sprint{position:fixed;left:50%;bottom:86px;width:160px;height:4px;margin-left:-80px;background:rgba(0,0,0,.45);opacity:0;transition:opacity .4s;z-index:5;pointer-events:none}.v9sprint i{display:block;height:100%;background:#e8e2d4}.v9sprint.low i{background:#e0301f}`);
function sprintHud(){ const show=G.state==='playing'&&SPRINT.st<0.999; SPH.style.opacity=show?1:0; SPH.firstChild.style.width=(SPRINT.st*100)+'%'; SPH.classList.toggle('low',SPRINT.st<0.25); }
v9On('reset',()=>{ SPRINT.on=false; SPRINT.st=1; SPRINT.b=0; });

/* ---------------- recarga tática ---------------- */
const _v9rlt=reloadTime; reloadTime=function(st){ const s=curSlot(); return _v9rlt(st)*(s&&s.mag>0?0.8:1.1); };   // com bala na câmara recarrega mais rápido; pente vazio é mais lento (puxa o ferrolho)

/* ---------------- placar no Tab ---------------- */
const SCB=v9El('div','v9scb'); document.body.appendChild(SCB); SCB.hidden=true;
v9Css(`.v9scb{position:fixed;left:50%;top:14%;transform:translateX(-50%);min-width:min(620px,92vw);background:rgba(10,8,6,.9);border:1px solid #3a3022;padding:14px 18px;z-index:30;font-family:"Special Elite",monospace;color:#e8e2d4;pointer-events:none}
.v9scb h3{margin:0 0 8px;font:700 22px "Stardos Stencil",Impact;letter-spacing:.06em}.v9scb table{width:100%;border-collapse:collapse;font-size:14px}.v9scb th{text-align:left;color:#8a8478;font-weight:400;font-size:11px;letter-spacing:.15em;text-transform:uppercase;padding:4px 6px}.v9scb td{padding:6px;border-top:1px solid #2a241c}.v9scb tr.me td{color:#ffd24a}`);
const MST={kills:0,heads:0,knife:0,revives:0,downs:0,t0:0};
v9On('reset',()=>{ Object.assign(MST,{kills:0,heads:0,knife:0,revives:0,downs:0,t0:performance.now()}); });
v9On('kill',(x,z,kind,part,src)=>{ MST.kills++; if(part==='head') MST.heads++; if(src==='knife') MST.knife++; });
function scbRender(){ const me=(SOC.acc&&SOC.acc.name)||pgPlayerName(); const rows=[{n:me,me:1,k:G.kills|0,h:G.heads|0,p:G.points|0,d:MST.downs}];
  if(NET.mode) for(const rp of NET.players.values()) if(rp&&rp.name) rows.push({n:rp.name,k:rp.kills|0,h:rp.heads|0,p:rp.points|0,d:rp.downs|0});
  rows.sort((a,b)=>b.k-a.k); const tm=Math.floor((performance.now()-MST.t0)/1000);
  SCB.innerHTML=`<h3>${CUR==='hosp'&&TM.lab?'Laboratório':MAPS[CUR]?MAPS[CUR].name:''} · Rodada ${G.round|0} · ${Math.floor(tm/60)}:${String(tm%60).padStart(2,'0')}</h3><table><tr><th>Jogador</th><th>Abates</th><th>Cabeça</th><th>Pontos</th><th>Quedas</th></tr>${rows.map(r=>`<tr class="${r.me?'me':''}"><td>${r.n}</td><td>${r.k}</td><td>${r.h||'—'}</td><td>${r.p?v9Fmt(r.p):'—'}</td><td>${r.d||0}</td></tr>`).join('')}</table>`; }
addEventListener('keydown',e=>{ if(e.code==='Tab'&&G.state==='playing'){ e.preventDefault(); if(SCB.hidden){ scbRender(); SCB.hidden=false; } } },true);
addEventListener('keyup',e=>{ if(e.code==='Tab'){ SCB.hidden=true; } },true);

/* ---------------- conquistas ---------------- */
const ACH=[['r10','Sobrevivente','Chegue na rodada 10',300],['r20','Veterano','Chegue na rodada 20',800],['r30','Lenda do Bunker','Chegue na rodada 30',2000],['r50','Imortal','Chegue na rodada 50',6000],
  ['k1000','Mil Mortos','1.000 abates no total',500],['k10000','Exterminador','10.000 abates no total',3000],['knife100','Açougueiro','100 abates na faca',400],['head500','Olho de Águia','500 tiros na cabeça',600],
  ['gib100','Pedacinhos','Exploda 100 zumbis',500],['legs50','Quebra-Pernas','Quebre 50 pernas',300],['fin25','Finalizador','25 finalizações com golpe pesado',500],['mega','Mata-Gigante','Derrube o Mutante Ácido',2500],
  ['city','Estrada Aberta','Conserte o carro e chegue na cidade',800],['time','2087','Viaje no tempo com a máquina',1500],['camo','Ouro Puro','Libere uma camuflagem',400],['allperks','Bebum','Tenha todas as bebidas na mesma partida',700]];
function achSt(){ return PROG.v9ach||(PROG.v9ach={d:{},c:{}}); }
function achDone(id){ const a=achSt(); if(a.d[id]||CHEAT.on) return; const A=ACH.find(x=>x[0]===id); if(!A) return; a.d[id]=Date.now(); PROG.drax=(PROG.drax|0)+A[3]; try{ saveProg(); renderDrax(); }catch(e){}
  const el=v9El('div','v9ach',`<small>CONQUISTA</small><b>${A[1]}</b><span>${A[2]} · +◆ ${v9Fmt(A[3])}</span>`); document.body.appendChild(el); setTimeout(()=>el.classList.add('on'),30); setTimeout(()=>{ el.classList.remove('on'); setTimeout(()=>el.remove(),600); },5200); try{ Snd.ui('confirm'); }catch(e){} }
function achAdd(k,n,goals){ const a=achSt(); a.c[k]=(a.c[k]|0)+n; for(const [id,v] of goals) if(a.c[k]>=v) achDone(id); }
v9Css(`.v9ach{position:fixed;left:50%;top:18px;transform:translate(-50%,-140%);transition:transform .5s cubic-bezier(.2,.8,.2,1);z-index:60;background:linear-gradient(90deg,#1a1208,#2a1c0a);border:1px solid #c9a24a;padding:10px 22px;text-align:center;min-width:300px;box-shadow:0 8px 30px rgba(0,0,0,.6)}.v9ach.on{transform:translate(-50%,0)}
.v9ach small{display:block;font:10px "Special Elite",monospace;letter-spacing:.3em;color:#c9a24a}.v9ach b{display:block;font:700 24px "Stardos Stencil",Impact;color:#ffd24a}.v9ach span{font-size:12px;color:#d8cbbb}`);
v9On('kill',(x,z,kind,part,src,zz)=>{ achAdd('kills',1,[['k1000',1000],['k10000',10000]]); if(src==='knife') achAdd('knife',1,[['knife100',100]]); if(part==='head') achAdd('head',1,[['head500',500]]); if(DEATH_GIB[src]) achAdd('gib',1,[['gib100',100]]); if(zz&&zz.v9fin) achAdd('fin',1,[['fin25',25]]); });
v9On('hit',(z,part)=>{ if(part==='legs'&&z&&z.legBroke&&!z._achLeg){ z._achLeg=1; achAdd('legs',1,[['legs50',50]]); } });
v9On('roundStart',r=>{ for(const [id,v] of [['r10',10],['r20',20],['r30',30],['r50',50]]) if(r>=v) achDone(id); if(CUR==='city') achDone('city'); if(TM.lab) achDone('time'); if(PERKS.every(p=>G.perks[p.key])) achDone('allperks'); try{ if(Object.keys(WEAPONS).some(id=>camoFor(id))) achDone('camo'); }catch(e){} });
const _v9md=megaDown; megaDown=function(){ achDone('mega'); return _v9md.apply(this,arguments); };

/* ---------------- histórico de partidas ---------------- */
let v9LastState='';
v9On('always',()=>{ if(G.state==='over'&&v9LastState!=='over'&&!CHEAT.on){ const h=PROG.v9hist||(PROG.v9hist=[]); h.unshift({t:Date.now(),m:CUR==='hosp'&&TM.lab?'lab':CUR,r:G.round|0,k:G.kills|0,h:G.heads|0,c:PROG.char,n:NET.mode?1+NET.players.size:1}); if(h.length>20) h.length=20; try{ saveProg(); }catch(e){} }
  if(P.down>0&&!MST._dn){ MST._dn=1; MST.downs++; DYN.down=true; } else if(!(P.down>0)) MST._dn=0; v9LastState=G.state; });
const _v9chOpen=chOpen; chOpen=function(){ _v9chOpen(); try{ const cb=document.querySelector('.v9chp .cb'); if(!cb) return; const a=achSt(); const names={bunker:'Bunker',hosp:'Hospício',farm:'Fazenda',tz:'Tranzitch',city:'Cidade',lab:'Laboratório'};
  cb.insertAdjacentHTML('beforeend',`<h3>Conquistas (${Object.keys(a.d).length}/${ACH.length})</h3><div class="cm">${ACH.map(x=>`<span style="${a.d[x[0]]?'border-color:#c9a24a;color:#ffd24a':'opacity:.55'}" title="${x[2]}">${a.d[x[0]]?'★':'☆'} ${x[1]}</span>`).join('')}</div>
   <h3>Últimas partidas</h3><table>${(PROG.v9hist||[]).slice(0,10).map(p=>`<tr><td>${new Date(p.t).toLocaleDateString('pt-BR')} · ${names[p.m]||p.m}${p.n>1?' · '+p.n+' jogadores':''}</td><td>Rodada ${p.r} · ${p.k} abates</td></tr>`).join('')||'<tr><td>Nenhuma partida ainda</td><td></td></tr>'}</table>`); }catch(e){} };

/* ---------------- dificuldade dinâmica ---------------- */
const DYN={k:1,hurt:0,down:false};
const _v9zhp=zombieHp; zombieHp=function(r){ return Math.floor(_v9zhp(r)*DYN.k); };
const _v9hurt=hurtPlayer; hurtPlayer=function(amt){ DYN.hurt+=amt|0; return _v9hurt.apply(this,arguments); };
v9On('roundEnd',()=>{ if(G.round>=4&&CUR!=='x1'){ if(DYN.down) DYN.k=Math.max(0.82,DYN.k-0.07); else if(DYN.hurt===0) DYN.k=Math.min(1.25,DYN.k+0.035); else if(DYN.hurt<40) DYN.k=Math.min(1.25,DYN.k+0.01); } DYN.hurt=0; DYN.down=false; });
v9On('reset',()=>{ DYN.k=1; DYN.hurt=0; DYN.down=false; });

/* ---------------- modos ---------------- */
const MODE={umtiro:false,aleat:false};
CMDS.modo={d:'modo umtiro | aleatorio | normal · "um tiro": zumbis morrem com um tiro, mas você também · "aleatório": arma nova sorteada a cada rodada',f:a=>{ const w=String(a[0]||'').toLowerCase(); if(!needHost()) return; MODE.umtiro=w==='umtiro'; MODE.aleat=w==='aleatorio'; cprint('Modo: '+(MODE.umtiro?'Um tiro':MODE.aleat?'Arma aleatória':'Normal')); }};
const _v9zhp2=zombieHp; zombieHp=function(r){ return MODE.umtiro?1:_v9zhp2(r); };
const _v9hurt2=hurtPlayer; hurtPlayer=function(amt,z){ return _v9hurt2.call(this,MODE.umtiro&&amt>0?9999:amt,z); };
v9On('roundStart',r=>{ if(!MODE.aleat||r<2) return; const ids=Object.keys(WEAPONS).filter(id=>WEAPONS[id].cost||WEAPONS[id].box); const id=pick(ids); try{ const i=Wp.cur; Wp.inv[i]=null; Wp.inv.splice(i,1); giveWeapon(id,0); banner('ARMA ALEATÓRIA',WEAPONS[id].name,'gold'); }catch(e){} });

/* ---------------- cabeça explodindo de perto ---------------- */
v9On('kill',(x,zz,kind,part,src,z)=>{ if(part!=='head'||!z||src!=='gun'||kind==='dog') return; const s=curSlot(); if(!s) return; const d=WEAPONS[s.id]||{}; if(!(d.snd==='shotgun'||d.snd==='sniper')) return; if(Math.hypot(x-P.pos.x,zz-P.pos.z)>8) return;
  const y=zy(z)+1.75; emit('gore',x,y,zz,18,5,1.1); emit('blood',x,y,zz,34,5.5,1); for(let i=0;i<4;i++) gibChunk(z,x+rand(-.1,.1),y,zz+rand(-.1,.1),rand(0.5,0.9)); try{ Snd.head(); }catch(e){}
  try{ const o=new THREE.Vector3(x,y,zz), dd=new THREE.Vector3(x-P.pos.x,0.05,zz-P.pos.z).normalize(); const t=rayWall(o,dd,4); if(t<3.9) v9WallBlood(o.clone().addScaledVector(dd,t),-dd.x,0,-dd.z); }catch(e){} });

/* (música dinâmica removida: as partidas ficam sem música, só com os sons do jogo) */

/* ---------------- clima: chuva na cidade, relâmpagos no hospício ---------------- */
const RAIN={m:null};
v9On('always',dt=>{ let inside=false; try{ const gx=Math.floor(P.pos.x/S), gz=Math.floor(P.pos.z/S), r=roomOf[gz]&&roomOf[gz][gx]; inside=!!(r&&r!=='CS'); }catch(e){} const on=G.state==='playing'&&CUR==='city'&&!CFG.potato&&!inside;   /* sem chuva dentro dos prédios */
  if(!RAIN.m&&on){ const n=1400, pos=new Float32Array(n*6); for(let i=0;i<n;i++){ const x=rand(-25,25), y=rand(0,16), z=rand(-25,25); pos.set([x,y,z,x+0.02,y-0.55,z],i*6); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); RAIN.m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0x8a98a8,transparent:true,opacity:0.35})); RAIN.m.frustumCulled=false; scene.add(RAIN.m); }
  if(!RAIN.m) return; RAIN.m.visible=on; if(!on) return; RAIN.m.position.set(P.pos.x,0,P.pos.z); const p=RAIN.m.geometry.attributes.position, a=p.array;
  for(let i=0;i<a.length;i+=6){ a[i+1]-=dt*22; a[i+4]-=dt*22; if(a[i+1]<0){ a[i+1]+=16; a[i+4]+=16; } } p.needsUpdate=true;
  RAIN.snd=(RAIN.snd||0)-dt; if(RAIN.snd<=0){ RAIN.snd=0.09; try{ const o=Snd.out(0.06,rand(-0.6,0.6),0.3,null); Snd.burstTo(o,{type:'highpass',freq:rand(3500,6000),dur:0.12,gain:0.3}); }catch(e){} } });
const LIT={t:12};
v9On('always',dt=>{ if(G.state!=='playing'||CUR!=='hosp') return; LIT.t-=dt; if(LIT.t>0) return; LIT.t=rand(14,32);
  const flash=n=>{ if(!hemi) return; const i0=hemi.intensity; hemi.intensity=i0+2.6; setTimeout(()=>{ hemi.intensity=i0; },70+n*30); };
  flash(0); setTimeout(()=>flash(1),180); setTimeout(()=>{ try{ Snd.distant(P.pos.x+rand(-30,30),P.pos.z+rand(-30,30)); shake(0.08); }catch(e){} },rand(600,1600)); });

/* ---------------- frases rápidas (N + 1 a 5) ---------------- */
const QP=['Recarregando!','Preciso de ajuda!','Vem comigo!','Cuidado, atrás de você!','Valeu!'];
const QPW=v9El('div','v9qp',QP.map((t,i)=>`<div><b>${i+1}</b> ${t}</div>`).join('')); QPW.hidden=true; document.body.appendChild(QPW);
v9Css(`.v9qp{position:fixed;left:24px;top:40%;z-index:30;background:rgba(10,8,6,.88);border:1px solid #3a3022;padding:10px 14px;font:14px "Special Elite",monospace;color:#e8e2d4}.v9qp div{padding:4px 0}.v9qp b{display:inline-block;width:22px;color:#ffd24a}
.v9qpm{position:fixed;left:24px;bottom:160px;z-index:30;font:15px "Special Elite",monospace;color:#fff;text-shadow:0 1px 3px #000;animation:v9qpf 3.5s forwards}.v9qpm b{color:#ffd24a}@keyframes v9qpf{0%,80%{opacity:1}100%{opacity:0}}`);
function qpShow(name,i){ const el=v9El('div','v9qpm',`<b>${name}:</b> ${QP[i]}`); document.body.appendChild(el); setTimeout(()=>el.remove(),3600); try{ Snd.ui('tab'); }catch(e){} }
function qpSend(i){ const me=(SOC.acc&&SOC.acc.name)||pgPlayerName(); qpShow(me,i); if(NET.mode==='host') pushEv(['qp',me,i]); else if(NET.mode==='client') netAct(['qp',i]); }
V9NET.ev.qp=e=>{ const me=(SOC.acc&&SOC.acc.name)||pgPlayerName(); if(e[1]!==me) qpShow(e[1],e[2]|0); };
V9NET.act.qp=(peer,a)=>{ const rp=NET.players.get(peer); const n=(rp&&rp.name)||'Amigo'; pushEv(['qp',n,a[1]|0]); qpShow(n,a[1]|0); };
addEventListener('keydown',e=>{ if(G.state!=='playing'||(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName))) return;
  if(e.code==='KeyN'&&!e.repeat){ QPW.hidden=!QPW.hidden; return; }
  if(!QPW.hidden&&/^Digit[1-5]$/.test(e.code)){ e.preventDefault(); e.stopImmediatePropagation(); qpSend(+e.code.slice(5)-1); QPW.hidden=true; } },true);

/* ---------------- tamanho da interface ---------------- */
(function(){ const box=document.querySelector('.setp[data-st="video"] .v9disp'); if(!box) return; const v=localStorage.getItem('db_uiscale')||'1';
  const lab=v9El('label','v9sel',`<span>Tamanho da interface</span><select id="v9-ui"><option value="0.85">Pequeno</option><option value="1">Normal</option><option value="1.15">Grande</option><option value="1.3">Muito grande</option></select>`); box.appendChild(lab);
  const sel=lab.querySelector('select'); sel.value=v; const ap=()=>{ const h=document.getElementById('hud'); if(h) h.style.zoom=sel.value; }; ap(); sel.addEventListener('change',()=>{ localStorage.setItem('db_uiscale',sel.value); ap(); }); })();
