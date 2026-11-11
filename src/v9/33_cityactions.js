/* ================= v9 · CIDADE: O QUE FAZER EM CADA LOJA =================
   Farmácia: kit de primeiros socorros (cura tudo). Bar: cerveja gelada (aguenta mais pancada, mas a visão balança) e a
   sinuca. Mercado: energético (corrida sem cansar). Armaria: colete (absorve dano). Banco: arrombar o cofre (segura E).
   Delegacia: a alavanca de energia acende as luzes de todas as lojas. */
const CA={pts:[],near:null,hold:0,buffs:{beer:0,beers:0,energy:0,armor:0},vault:false,el:null};
function caSpot(tag,fallbackShop){ const sp=CL.spots&&CL.spots[tag]; if(sp){ const a=sp.run[0], b=sp.run[sp.run.length-1], n=a.n; const mx=(cx(a.x)+cx(b.x))/2, mz=(cx(a.z)+cx(b.z))/2; const off=-S/2+sp.fd+0.55; return {x:mx+n[0]*off,z:mz+n[1]*off}; }
  const s=CITY_SHOPS.find(q=>q.id===fallbackShop); if(!s) return null; return {x:cx(Math.round((s.x0+s.x1)/2)),z:cx(czr(s.r0+2))}; }
function caBuild(){ CA.pts.length=0;
  const add=(tag,shop,o)=>{ const p=caSpot(tag,shop); if(p) CA.pts.push(Object.assign({x:p.x,z:p.z,r:1.7},o)); };
  add('cf_counter','CF',{id:'med',label:()=>'Kit de primeiros socorros · cura tudo',cost:500,can:()=>P.hp<P.maxHp?true:'Você já está inteiro',act:()=>{ P.hp=P.maxHp; CA.buffs.regen=8; try{ Snd.sample('drink_open',{vol:0.5}); }catch(e){} banner('KIT MÉDICO','Vida cheia e regeneração por 8 segundos','green'); }});
  add('cb_bar','CB',{id:'beer',label:()=>CA.buffs.beers>=3?'Cerveja gelada · você já está bem alegre':'Cerveja gelada · aguenta mais pancada por 45 s',cost:150,can:()=>true,act:()=>{ CA.buffs.beer=45; CA.buffs.beers++; try{ Snd.gulp(); }catch(e){} banner(CA.buffs.beers>=3?'TÁ BÊBADO, HEIN':'CERVEJA GELADA',CA.buffs.beers>=3?'A visão balança mais, mas a dor diminui':'-25% de dano recebido por 45 segundos','gold'); }});
  add('cm_fridge','CM',{id:'energy',label:()=>'Energético · correr sem cansar por 60 s',cost:300,can:()=>true,act:()=>{ CA.buffs.energy=60; try{ Snd.sample('drink_open',{vol:0.8}); setTimeout(()=>Snd.gulp(),300); }catch(e){} banner('ENERGÉTICO','Corrida sem gastar fôlego e um pouco mais rápida por 60 segundos','gold'); }});
  add('ca_case','CA',{id:'armor',label:()=>CA.buffs.armor>0?`Colete · trocar (${Math.ceil(CA.buffs.armor)} de proteção)`:'Colete balístico · absorve 75 de dano',cost:1200,can:()=>CA.buffs.armor<75?true:'Seu colete está inteiro',act:()=>{ CA.buffs.armor=75; try{ Snd.sample('rl_mag_in',{vol:0.7}); }catch(e){} banner('COLETE','Absorve os próximos 75 de dano','blue'); }});
  add('ck_vault','CK',{id:'vault',hold:6,label:()=>CA.vault?'Cofre vazio':'Arrombar o cofre · segure E',cost:0,can:()=>CA.vault?'Já levaram tudo daqui':true,act:()=>{ CA.vault=true; addPoints(3000,true); try{ Snd.sample('door_metal',{vol:1,prio:true}); Snd.sample('box_open',{vol:0.8}); }catch(e){} banner('COFRE ABERTO','+3.000 pontos. O alarme chamou atenção…','gold'); caAlarm(); }}); }
function caAlarm(){ let n=0; const beep=()=>{ if(n++>14||CUR!=='city') return; try{ const o=Snd.out(0.5,0,0.3,null); if(o) Snd.oscTo(o,{type:'square',freq:n%2?880:660,dur:0.32,gain:0.18}); }catch(e){} setTimeout(beep,380); }; beep();
  try{ for(let i=0;i<4;i++) setTimeout(()=>{ if(G.state==='playing'&&typeof spawnZombieNear==='function') spawnZombieNear(P.pos.x,P.pos.z); },1500+i*900); }catch(e){} }
const _caBC=buildCity; buildCity=function(){ const r=_caBC.apply(this,arguments); try{ caBuild(); }catch(e){ console.warn('[Bunker v9] lojas da cidade',e); } return r; };
v9On('reset',()=>{ CA.buffs={beer:0,beers:0,energy:0,armor:0,regen:0}; CA.vault=false; CA.hold=0; });
/* ---- efeitos ---- */
{ const _h=hurtPlayer; hurtPlayer=function(amt){ let a=amt; if(a>0&&CA.buffs.beer>0) a*=CA.buffs.beers>=3?0.65:0.75; if(a>0&&CA.buffs.armor>0){ const take=Math.min(CA.buffs.armor,a*0.85); CA.buffs.armor-=take; a-=take; if(CA.buffs.armor<=0) banner('O COLETE QUEBROU','','red'); }
  return _h.call(this,a,...[].slice.call(arguments,1)); }; }
{ const _k=v9SpeedK; v9SpeedK=function(){ return _k()*(CA.buffs.energy>0?1.08:1); }; }
V9VM.push(dt=>{ if(CA.buffs.beer<=0) return; const k=CA.buffs.beers>=3?1:0.45, t=performance.now()/1000; vmRoot.rotation.z+=Math.sin(t*0.9)*0.05*k; vmRoot.position.x+=Math.sin(t*0.7)*0.012*k; });
v9On('always',dt=>{ const b=CA.buffs; if(G.state!=='playing') return;
  if(b.beer>0){ b.beer-=dt; const k=b.beers>=3?1:0.4, t=performance.now()/1000; P.yaw+=Math.sin(t*0.8)*0.0009*k; P.pitch+=Math.sin(t*1.1)*0.0006*k; if(b.beer<=0){ b.beers=0; } }
  if(b.energy>0){ b.energy-=dt; if(typeof SPRINT!=='undefined') SPRINT.st=1; }
  if(b.regen>0){ b.regen-=dt; P.hp=Math.min(P.maxHp,P.hp+12*dt); }
  caHud(); });
/* ---- interação (E) ---- */
const CAEL=v9El('div','v9poolhint'); CAEL.hidden=true; document.body.appendChild(CAEL);
const CAB=v9El('div','v9cabuff'); document.body.appendChild(CAB);
v9Css(`.v9cabuff{position:fixed;left:24px;bottom:150px;z-index:6;font:12px "Special Elite",monospace;color:#e8e2d4;pointer-events:none;text-shadow:0 1px 2px #000}.v9cabuff div{margin-top:3px}.v9cabuff b{color:#ffd24a}
.v9cahold{display:block;height:4px;margin-top:5px;background:rgba(255,255,255,.15)}.v9cahold i{display:block;height:100%;background:#ffd24a}`);
function caHud(){ const b=CA.buffs, l=[]; if(b.beer>0) l.push(`<div>🍺 <b>Cerveja</b> ${Math.ceil(b.beer)} s</div>`); if(b.energy>0) l.push(`<div>⚡ <b>Energético</b> ${Math.ceil(b.energy)} s</div>`); if(b.armor>0) l.push(`<div>🛡 <b>Colete</b> ${Math.ceil(b.armor)}</div>`);
  const h=G.state==='playing'?l.join(''):''; if(CAB._h!==h){ CAB._h=h; CAB.innerHTML=h; } }
v9On('always',dt=>{ if(CUR!=='city'||G.state!=='playing'||(typeof POOL!=='undefined'&&POOL.on)){ CAEL.hidden=true; CA.near=null; CA.hold=0; return; }
  let best=null, bd=1e9; for(const p of CA.pts){ const d=Math.hypot(P.pos.x-p.x,P.pos.z-p.z); if(d<p.r&&d<bd){ bd=d; best=p; } }
  const busy=typeof curInteract!=='undefined'&&curInteract; CA.near=busy?null:best; if(!CA.near){ CAEL.hidden=true; CA.hold=0; return; }
  const p=CA.near, ok=p.can();
  if(p.hold&&ok===true&&(keys.KeyE||IN.use)){ CA.hold+=dt; if(CA.hold>=p.hold){ CA.hold=0; p.act(); } } else if(!(keys.KeyE||IN.use)) CA.hold=0;
  const html=`<b>E</b> · ${p.label()}${p.cost?` · <b>${v9Fmt(p.cost)}</b>`:''}${ok!==true?`<br><small>${ok}</small>`:''}${p.hold&&CA.hold>0?`<span class="v9cahold"><i style="width:${CA.hold/p.hold*100}%"></i></span>`:''}`;
  if(CAEL._h!==html){ CAEL._h=html; CAEL.innerHTML=html; } CAEL.hidden=false; });
addEventListener('keydown',e=>{ if(e.code!=='KeyE'||e.repeat||!CA.near||G.state!=='playing') return; const p=CA.near; if(p.hold) return; e.preventDefault(); e.stopImmediatePropagation();
  const ok=p.can(); if(ok!==true){ try{ Snd.deny(); }catch(_){} return; } if(p.cost&&!spend(p.cost)) return; p.act(); },true);
CMDS.lojas={d:'lojas · lista o que dá para fazer em cada loja da cidade',f:()=>{ cprint(CA.pts.map(p=>p.id+' ('+(p.cost||'grátis')+')').join(' · ')||'Entre na cidade primeiro'); }};
/* a cidade é montada uma vez só: existe outra função antiga com o mesmo nome (a rua do bunker) e a montagem do bunker
   acabava chamando esta também, duplicando o asfalto (as placas que piscavam), luzes e objetos */
{ const _bcOnce=buildCity; buildCity=function(){ if(typeof ROOT!=='undefined'&&ROOT!==MAPG.city) return; return _bcOnce.apply(this,arguments); }; }
