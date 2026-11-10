/* ================= v9 · EVENTOS ALEATÓRIOS NOVOS =================
   troca  — você vira outro sobrevivente por 60 s (habilidades e passiva dele)
   sosia  — um Sósia (clone sombrio de um jogador) entra como mini-chefe
   roleta — uma roleta aparece perto de vocês; cada um gira uma vez: drax, rubis, carta, arma, caixa… ou azar
   chuva  — chuva de pontos: cada abate vale o dobro e solta moedas de drax por 40 s
   eclipse— o céu escurece, os zumbis ficam mais rápidos, mas tiros na cabeça valem o triplo por 35 s */
Object.assign(EVT_INFO,{
  troca:['TROCA DE CORPO','Você virou outro sobrevivente por 60 segundos. Experimente as habilidades dele!',60],
  sosia:['UM SÓSIA APARECEU','Algo com o seu rosto está caçando vocês. Derrube o Sósia (mini-chefe).',70],
  roleta:['A ROLETA DO DESTINO','Uma roleta apareceu perto de vocês. Cada um pode girar uma vez: sorte ou azar.',40],
  chuva:['CHUVA DE PONTOS','Abates valem o dobro e soltam drax por 40 segundos!',40],
  eclipse:['ECLIPSE','Os mortos ficaram rápidos — mas tiro na cabeça vale o triplo.',35],
});
EVT_CODES.push('troca','sosia','roleta','chuva','eclipse');
const V9EV={swap:null,sosia:null,rol:null,rolDone:'',curseT:0,speedK:1,last:null};
/* ---- troca de corpo ---- */
function v9SwapHold(){ if(!V9EV.swap) return null; const cur={char:PROG.char,cv:PROG.cv}; PROG.char=V9EV.swap.char; PROG.cv=V9EV.swap.cv; return cur; }
function v9SwapRelease(c){ if(c){ PROG.char=c.char; PROG.cv=c.cv; } }
function swapStart(){ if(V9EV.swap) return; const ids=Object.keys(CHARS).filter(k=>k!==PROG.char); const ch=pick(ids); const cv=varKeys(ch)[0];
  V9EV.swap={char:PROG.char,cv:PROG.cv}; PROG.char=ch; PROG.cv=cv;
  try{ abReset(); recomputeMods(); applyHands(); }catch(e){} flashScreen(); v9Flash('#9a6aff',0.45,0.9); shake(0.4);
  banner('VOCÊ AGORA É '+CHARS[ch].name.toUpperCase(),'Z e X usam as habilidades dele por 60 s','gold'); try{ Snd.abil('ult'); }catch(e){} }
function swapEnd(){ if(!V9EV.swap) return; PROG.char=V9EV.swap.char; PROG.cv=V9EV.swap.cv; V9EV.swap=null; try{ abReset(); recomputeMods(); applyHands(); }catch(e){} v9Flash('#9a6aff',0.3,0.7); banner('DE VOLTA AO SEU CORPO','',''); }
/* ---- Sósia: zumbi com o corpo de um jogador, pintado de sombra vermelha ---- */
const CHAR_IDS=Object.keys(CHARS);
function sosiaSpawn(){ const T=pick(TG.length?TG:[{x:P.pos.x,z:P.pos.z,key:'me',local:true}]);
  let ch=PROG.char, cv=PROG.cv; if(!T.local){ const rp=NET.players.get(T.key); if(rp&&rp.char){ ch=rp.char; cv=rp.cv; } }
  const ci=Math.max(0,CHAR_IDS.indexOf(ch)), vi=Math.max(0,varKeys(ch).indexOf(cv));
  const sp=portalSpot(); const seed=ci*1000+vi*100+1+Math.floor(Math.random()*90);
  const z=makeZombie({x:sp[0],z:sp[1],kind:'dopple',seed}); z.dopple=true; z.state='inside'; z.name='Sósia';
  z.hp=z.maxHp=Math.max(4000,G.zhp*threatHp(G.tl|0)*16*(1+0.5*(TG.length-1))); z.speed=2.9; z.zdmg=60; z.runner=true; V9EV.sosia=z;
  emit('green',sp[0],0.8,sp[1],30,3,1.2,-0.3); try{ Snd.distant(sp[0],sp[1]); }catch(e){} }
function doppleDress(z){
  const ci=Math.floor(z.seed/1000)%CHAR_IDS.length, ch=CHAR_IDS[ci]||'recruta'; const vk=varKeys(ch); const cv=vk[Math.floor(z.seed/100)%10]||vk[0];
  z.g.traverse(o=>{ if(o.isMesh||o.isSprite) o.visible=false; });
  const b=buildChar(ch,cv,{pose:'gun'}); const inv=1/((z.g.scale&&z.g.scale.x)||1); b.scale.setScalar(inv*1.06); b.rotation.y=Math.PI;
  b.traverse(o=>{ if(o.isMesh&&o.material){ const ms=[].concat(o.material).map(m=>{ const c=m.clone(); if(c.color) c.color.multiplyScalar(0.42).lerp(new THREE.Color(0x3a0606),0.35); if(c.emissive) c.emissive.setHex(0x2a0000); return c; }); o.material=Array.isArray(o.material)?ms:ms[0]; } });
  z.g.add(b); z.dop=b.userData; z.dopB=b;
  const eye=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff2010,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false})); eye.scale.set(0.5,0.25,1); eye.position.set(0,1.62,-0.15); b.add(eye);
  const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xff1010,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.35})); aura.scale.set(2.2,3,1); aura.position.y=1.1; b.add(aura); z.aura=aura;
}
v9On('always',dt=>{ for(const z of zlist()){ if(z.kind!=='dopple'||!z.dop) continue; const p=z.dop, m=z.moving&&!z.dead?1:0; const ph=(z.animT||0)*1.6+G.t*(m?9:1);
  if(p.legL) p.legL.rotation.x=Math.sin(ph)*0.75*m; if(p.legR) p.legR.rotation.x=-Math.sin(ph)*0.75*m;
  const atk=z.attackT>0?Math.sin(Math.min(1,z.attackT/0.5)*Math.PI):0;
  if(p.armR) p.armR.rotation.set(-1.45-atk*0.8,0,-0.15); if(p.armL) p.armL.rotation.set(-1.4-atk*0.6,0,0.15);
  if(p.chest) p.chest.rotation.x=0.18+atk*0.3; if(z.dead&&z.dopB){ z.dopB.rotation.x=lerp(z.dopB.rotation.x,-1.5,dt*5); } } });
/* ---- roleta ---- */
const ROL_SLICES=[
  {k:'drax',t:'◆ Drax',good:1,col:'#3a8aff',w:16},{k:'rubi',t:'♦ Rubis',good:1,col:'#e0283a',w:7},{k:'carta',t:'Carta extra',good:1,col:'#ffd24a',w:10},
  {k:'arma',t:'Arma da caixa',good:1,col:'#b07bff',w:12},{k:'caixa',t:'Caixa de recompensa',good:1,col:'#5af0ff',w:7},{k:'pu',t:'Power-up',good:1,col:'#6aff7a',w:12},
  {k:'forte',t:'Zumbis fortes',good:0,col:'#6a1010',w:12},{k:'nivel',t:'Perde 1 nível',good:0,col:'#3a0a0a',w:8},{k:'pontos',t:'Perde pontos',good:0,col:'#4a1a10',w:10},{k:'maldicao',t:'Maldição',good:0,col:'#2a0a1a',w:6}];
function rolTex(){ return tex(512,512,(g,w,h)=>{ const c=w/2, R=c-8; const tot=ROL_SLICES.reduce((a,s)=>a+s.w,0); let a0=-Math.PI/2;
  for(const s of ROL_SLICES){ const a1=a0+s.w/tot*Math.PI*2; g.fillStyle=s.col; g.beginPath(); g.moveTo(c,c); g.arc(c,c,R,a0,a1); g.closePath(); g.fill(); g.strokeStyle='#d8b04a'; g.lineWidth=4; g.stroke();
    g.save(); g.translate(c,c); g.rotate((a0+a1)/2); g.fillStyle='#fff'; g.font='bold 22px "Stardos Stencil", Impact, sans-serif'; g.textAlign='right'; g.textBaseline='middle'; g.fillText(s.t.toUpperCase(),R-14,0); g.restore(); a0=a1; }
  g.lineWidth=12; g.strokeStyle='#d8b04a'; g.beginPath(); g.arc(c,c,R,0,Math.PI*2); g.stroke(); g.fillStyle='#1a120a'; g.beginPath(); g.arc(c,c,46,0,Math.PI*2); g.fill(); g.strokeStyle='#d8b04a'; g.lineWidth=6; g.stroke(); }); }
function rolShow(x,z){ if(V9EV.rol&&V9EV.rol.x===x&&V9EV.rol.z===z) return; rolHide();
  const g=new THREE.Group(); const fb=floorAt(x,z); g.position.set(x,fb,z); const gold=v9Mat('rolGold',{color:0xc8a24a,shininess:90,specular:0xfff0c0}), wood=v9Mat('rolWood',{color:0x3a2416,shininess:20});
  v9Mesh(new THREE.CylinderGeometry(0.5,0.65,0.18,20),wood,g,0,0.09,0); v9Mesh(new THREE.CylinderGeometry(0.07,0.09,1.5,10),gold,g,0,0.9,0);
  const wheel=new THREE.Group(); wheel.position.set(0,1.75,0); g.add(wheel);
  const disc=v9Mesh(new THREE.CylinderGeometry(0.85,0.85,0.08,40),[gold,new THREE.MeshBasicMaterial({map:rolTex()}),gold],wheel,0,0,0,Math.PI/2,0,0);
  for(let i=0;i<24;i++){ const a=i/24*Math.PI*2; v9Mesh(new THREE.SphereGeometry(0.03,6,4),new THREE.MeshBasicMaterial({color:0xfff2b0}),wheel,Math.cos(a)*0.9,Math.sin(a)*0.9,0.05); }
  const ptr=v9Mesh(new THREE.ConeGeometry(0.08,0.22,4),v9Mat('rolPtr',{color:0xff3020,emissive:0x400000}),g,0,2.7,0.06,Math.PI,0,0);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffd24a,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.5})); glow.scale.set(3.6,3.6,1); glow.position.y=1.75; g.add(glow);
  scene.add(g); V9EV.rol={g,wheel,x,z,spin:0,spinT:0,res:null,key:x.toFixed(1)+','+z.toFixed(1)}; addPropBox(x,z,0.5,0.5).rol=true; }
function rolHide(){ if(V9EV.rol){ scene.remove(V9EV.rol.g); V9EV.rol=null; } for(let i=propBoxes.length-1;i>=0;i--) if(propBoxes[i].rol) propBoxes.splice(i,1); }
function rolNear(){ const R=V9EV.rol; return R&&EVT.k==='roleta'&&V9EV.rolDone!==R.key&&R.spinT<=0&&Math.hypot(R.x-P.pos.x,R.z-P.pos.z)<2.2; }
function rolSpin(){ const R=V9EV.rol; if(!R) return; V9EV.rolDone=R.key; const tot=ROL_SLICES.reduce((a,s)=>a+s.w,0); let r=Math.random()*tot, idx=0; for(let i=0;i<ROL_SLICES.length;i++){ r-=ROL_SLICES[i].w; if(r<=0){ idx=i; break; } }
  // ângulo final para o ponteiro (no topo) cair no meio da fatia
  let a0=0; for(let i=0;i<idx;i++) a0+=ROL_SLICES[i].w/tot*Math.PI*2; const mid=a0+ROL_SLICES[idx].w/tot*Math.PI; R.res=idx; R.spinT=4.2; R.from=R.wheel.rotation.z%(Math.PI*2); R.to=Math.PI*2*6+mid; R.tick=0;
  try{ if(!Snd.sample('roulette_spin',{vol:0.9,prio:true})) Snd.rl('reel'); }catch(e){} }
function rolResult(idx){ const s=ROL_SLICES[idx]; const R=V9EV.rol; let sub='';
  switch(s.k){
    case 'drax': { const n=20+Math.floor(Math.random()*60)+G.round*2; addDrax(n/Math.max(0.01,Mod.drax||1)); sub=`+◆ ${n}`; break; }
    case 'rubi': { const n=1+Math.floor(Math.random()*3); PROG.rubies=(PROG.rubies|0)+n; saveProg(); sub=`+♦ ${n} rubi${n>1?'s':''}`; break; }
    case 'carta': G.cardBank=(G.cardBank|0)+1; sub='Escolha uma carta a mais no fim da rodada'; break;
    case 'arma': { const ids=Object.keys(WEAPONS).filter(k=>WEAPONS[k].box&&!Wp.inv.some(q=>q.id===k)&&k!=='xbow2'); const w=pick(ids.length?ids:['mg42']); giveWeapon(w,0); sub=WEAPONS[w].name; break; }
    case 'caixa': { try{ const b=v9GiveReward(G.round+6,true); sub=b; }catch(e){ sub='Caixa no inventário'; } break; }
    case 'pu': { const t=pick(['max','insta','double','nuke']); if(NET.mode==='client') puEffect(t,false); else applyPU(t); sub=PU_NAMES[t]; break; }
    case 'forte': V9EV.curseT=45; sub='Você recebe +60% de dano por 45 s'; break;
    case 'nivel': { const sl=curSlot(); if(sl&&(sl.lvl|0)>0){ sl.lvl--; const nd=wstat(sl); sl.mag=Math.min(sl.mag,nd.mag); setGunModel(); hudAmmo(); sub=`${wstat(sl).name} caiu um nível`; } else { G.points=Math.max(0,G.points-1000); $('#ptsv').textContent=G.points; sub='Sem nível para perder: −1.000 pontos'; } break; }
    case 'pontos': { const n=Math.min(G.points,Math.round(G.points*0.25)); G.points-=n; $('#ptsv').textContent=G.points; sub=`−${v9Fmt(n)} pontos`; break; }
    case 'maldicao': V9EV.curseT=30; V9EV.speedK=0.75; V9EV.slowT=30; sub='Mais lento e mais frágil por 30 s'; break; }
  banner(s.good?'SORTE! '+s.t.toUpperCase():'AZAR! '+s.t.toUpperCase(),sub,s.good?'gold':'red'); try{ Snd.sample(s.good?'slot_ding':'boss_roar',{vol:0.8,prio:true})||Snd.ui(s.good?'levelup':'deny'); }catch(e){}
  if(R) emit(s.good?'spark':'fire',R.x,1.8,R.z,24,3.5,0.8,-1); actLog(`{n} girou a roleta: ${s.t}`); }
v9On('frame',dt=>{
  // efeitos da troca / sósia / roleta conforme o evento atual (vale para anfitrião e convidados)
  const k=EVT.k;
  if(k==='troca'&&!V9EV.swap&&V9EV.last!=='troca'&&!x1Live()) swapStart(); if(k!=='troca'&&V9EV.swap) swapEnd();
  if(k==='sosia'&&NET.mode!=='client'&&!V9EV.sosia&&V9EV.last!=='sosia') sosiaSpawn(); if(k!=='sosia') V9EV.sosia=null; else if(V9EV.sosia&&V9EV.sosia.dead&&EVT.t>3){ EVT.t=Math.min(EVT.t,2); banner('SÓSIA DERROTADO','+1.500 pontos e uma relíquia','gold'); addPoints(1500,true); try{ relicSpawn(pick(RK),V9EV.sosia.pos.x,V9EV.sosia.pos.z); }catch(e){} V9EV.sosia={dead:true,done:true}; }
  if(k==='roleta'&&EVT.px!=null) rolShow(EVT.px,EVT.pz); else if(k!=='roleta'&&V9EV.rol&&!(V9EV.rol.spinT>0)) rolHide();
  V9EV.last=k;
  const R=V9EV.rol; if(R){ if(R.spinT>0){ R.spinT-=dt; const kk=1-Math.max(0,R.spinT)/4.2, e=1-Math.pow(1-kk,3.2); const ang=lerp(R.from,R.to,e); const step=Math.floor(ang/(Math.PI/12)); if(step!==R.tick){ R.tick=step; try{ Snd.reelTick(1+kk*0.3); }catch(e){} } R.wheel.rotation.z=ang; if(R.spinT<=0) rolResult(R.res); } else R.wheel.rotation.z+=dt*0.15; }
  if(rolNear()){ setPrompt(`${PRESS} para girar a roleta (uma vez)`); if(IN.edges.has('use')&&!busy()){ IN.edges.delete('use'); rolSpin(); } }
  if(V9EV.curseT>0){ V9EV.curseT-=dt; if(V9EV.curseT<=0){ V9EV.speedK=1; toast('A maldição passou'); } }
});
/* eclipse e chuva de pontos */
v9On('kill',(x,z,kind,part)=>{ if(EVT.k==='chuva'){ addPoints(Math.round(60*Mod.killPts)); draxCoins(x,z,2+Math.floor(Math.random()*3)); } if(EVT.k==='eclipse'&&part==='head') addPoints(Math.round(140*Mod.killPts)); });
v9On('frame',dt=>{ if(EVT.k==='eclipse'){ hemi.intensity*=0.45; if(NET.mode!=='client') for(const z of zombies) if(!z.dead&&!z._ecl){ z._ecl=true; z.speed*=1.25; } }
  if(EVT.k!=='eclipse'&&V9EV.eclOn) for(const z of zombies) if(z._ecl){ z._ecl=false; z.speed/=1.25; } V9EV.eclOn=EVT.k==='eclipse'; });
v9On('reset',()=>{ if(V9EV.swap) swapEnd(); V9EV.sosia=null; rolHide(); V9EV.rolDone=''; V9EV.curseT=0; V9EV.speedK=1; V9EV.last=null; });
function v9TakenK(){ return V9EV.curseT>0?1.6:1; }
