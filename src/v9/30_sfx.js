/* ================= v9 · SONS DO ARTLIST =================
   50 efeitos gravados (audio/sfx) entram no lugar dos sons sintetizados. Se algum arquivo ainda não carregou,
   o som antigo toca no lugar, então nada fica mudo. */
const SFX_NEW=['z_death','z_groan_big','z_groan_long','z_scream','z_attack','z_snarl1','z_snarl2','z_snarl3',
  'knife_stab1','knife_stab2','knife_stab3','knife_twist','knife_swing','knife_whoosh',
  'step_walk1','step_walk2','step_walk3','step_walk4','step_walk5','step_run1','step_run2','step_run3','step_run4','step_run5','jump_land',
  'hit_metal','hit_flesh1','hit_flesh2','hit_punch','gore_guts','gore_splat','expl_sharp','expl_big',
  'gun_pistol','gun_shotgun','gun_sniper','gun_smg','gun_revolver','gun_ar','gun_lmg','gun_barrett','gun_rifle',
  'rl_mag_out','rl_mag_in','rl_arm','rl_shotgun','rl_slide','rl_lever','dry_fire','shell_drop',
  'box_open','levelup','powerup_win','cash','hammer','wood_break','door_metal','drink_open','generator','scare'];
const SFX={pre:false};
function sfxPreload(){ if(SFX.pre||!Snd.ctx) return; SFX.pre=true; for(const n of SFX_NEW) if(!Snd.hasSample(n)) try{ Snd.sample(n,{vol:0}); }catch(e){} }
v9On('always',()=>{ if(!SFX.pre) sfxPreload(); });
const sfx=(n,o)=>{ try{ return Snd.sample(n,o||{}); }catch(e){ return null; } };
const sfxR=(a,b)=>a+Math.random()*(b-a);
const sfxPick=(base,n)=>base+(1+Math.floor(Math.random()*n));
// quanto cada arma soa (o volume do jogo continua valendo por cima)
const GUN_SFX={pistol:['gun_pistol',0.85],revolver:['gun_revolver',0.95],smg:['gun_smg',0.62],ar:['gun_ar',0.7],rifle:['gun_rifle',0.95],shotgun:['gun_shotgun',1.0],lmg:['gun_lmg',0.72],sniper:['gun_sniper',1.0]};
{ const S0={};
  for(const k of ['shot','dry','swing','stab','flesh','head','board','repair','buy','door','power','gulp','boom','boxOpen','levelUp','casing','step','impact','rl']) S0[k]=Snd[k];
  Snd.shot=function(kind,up,vol,x,z){ const g=GUN_SFX[kind]; if(g){ const o={vol:(vol==null?1:vol)*g[1],prio:x==null,wet:0.22,rate:sfxR(0.97,1.03)*(up?0.94:1)}; if(x!=null){ o.x=x; o.z=z; o.range=70; }
      if(sfx(kind==='sniper'&&up?'gun_barrett':g[0],o)) return; } return S0.shot.apply(this,arguments); };
  Snd.dry=function(){ if(sfx('dry_fire',{vol:0.8,prio:true,wet:0.05})) return; return S0.dry.apply(this,arguments); };
  Snd.swing=function(heavy){ if(sfx(heavy?'knife_whoosh':'knife_swing',{vol:heavy?0.9:0.75,prio:true,wet:0.08,rate:sfxR(0.95,1.08)})) return; return S0.swing.apply(this,arguments); };
  Snd.stab=function(heavy){ if(sfx(heavy?'knife_stab3':pick(['knife_stab1','knife_stab2']),{vol:heavy?1:0.85,prio:true,wet:0.15,rate:sfxR(0.95,1.05)})) return; return S0.stab.apply(this,arguments); };
  Snd.flesh=function(x,z){ if(sfx(pick(['hit_flesh1','hit_flesh2']),{vol:0.55,x,z,range:30,wet:0.15,rate:sfxR(0.9,1.1)})) return; return S0.flesh.apply(this,arguments); };
  Snd.head=function(){ sfx('gore_splat',{vol:0.55,prio:true,wet:0.15,rate:sfxR(0.95,1.1)}); return S0.head.apply(this,arguments); };
  Snd.board=function(x,z){ const o={vol:0.85,wet:0.3,rate:sfxR(0.92,1.08)}; if(x!=null){ o.x=x; o.z=z; o.range=32; } if(sfx('wood_break',o)) return; return S0.board.apply(this,arguments); };
  Snd.repair=function(k,x,z){ const h=sfx('hammer',{vol:0.8,x,z,range:18,wet:0.2,offset:sfxR(0,1.1)}); if(h){ setTimeout(()=>{ try{ h.stop(0.06); }catch(e){} },380); return; } return S0.repair.apply(this,arguments); };
  Snd.buy=function(){ if(sfx('cash',{vol:0.6,prio:true,wet:0.15})) return; return S0.buy.apply(this,arguments); };
  Snd.door=function(){ if(sfx('door_metal',{vol:0.85,prio:true,wet:0.5})) return; return S0.door.apply(this,arguments); };
  Snd.power=function(){ if(sfx('generator',{vol:1,prio:true,wet:0.6})) return; return S0.power.apply(this,arguments); };
  Snd.gulp=function(){ sfx('drink_open',{vol:0.8,prio:true,wet:0.1}); const a=arguments, t=this; setTimeout(()=>{ try{ S0.gulp.apply(t,a); }catch(e){} },420); };
  Snd.boom=function(x,z){ let near=true; if(x!=null) near=Math.hypot(x-P.pos.x,z-P.pos.z)<14; const o={vol:1,wet:0.6,rate:sfxR(0.94,1.04),prio:true}; if(x!=null){ o.x=x; o.z=z; o.range=90; o.minVol=0.15; }
    if(sfx(near?'expl_big':'expl_sharp',o)) return; return S0.boom.apply(this,arguments); };
  Snd.boxOpen=function(){ if(sfx('box_open',{vol:0.9,prio:true,wet:0.3})) return; return S0.boxOpen.apply(this,arguments); };
  Snd.levelUp=function(L){ if(sfx('levelup',{vol:0.8,prio:true,wet:0.2})) return; return S0.levelUp.apply(this,arguments); };
  Snd.casing=function(soft){ if(Math.random()<0.55){ const h=SFX.lastCas; const t=performance.now(); if(!h||t-h>140){ SFX.lastCas=t; setTimeout(()=>sfx('shell_drop',{vol:soft?0.18:0.32,wet:0.1,rate:sfxR(0.9,1.15)}),sfxR(320,520)); return; } } return S0.casing.apply(this,arguments); };
  Snd.step=function(outside,run){ if(sfx(sfxPick(run?'step_run':'step_walk',5),{vol:run?0.5:0.4,wet:outside?0.06:0.14,rate:sfxR(0.93,1.07)})) return; return S0.step.apply(this,arguments); };
  Snd.impact=function(surf,x,z,vol){ if(surf==='metal'&&Math.random()<0.6&&sfx('hit_metal',{vol:(vol||1)*0.5,x,z,range:40,wet:0.25,rate:sfxR(0.9,1.15),offset:sfxR(0,0.15)})) return; return S0.impact.apply(this,arguments); };
  const RLMAP={magOut:['rl_mag_out',0.85],magRel:['rl_mag_out',0.7],magIn:['rl_mag_in',0.85],magSeat:['rl_mag_in',0.6],slideBack:['rl_slide',0.85],slideRel:['rl_slide',0.8],chBack:['rl_lever',0.8],pumpBack:['rl_shotgun',0.9],boltBack:['rl_arm',0.85]};
  const RLSKIP={slideFwd:1,chFwd:1,pumpFwd:1};
  Snd.rl=function(k,vol){ const m=RLMAP[k]; if(m&&sfx(m[0],{vol:(vol||1)*m[1],prio:true,wet:0.1,rate:sfxR(0.97,1.04)})){ SFX.rlT=performance.now(); SFX.rlK=k; return; }
    if(RLSKIP[k]&&SFX.rlT&&performance.now()-SFX.rlT<900) return;   // a gravação já tem o vai e volta
    return S0.rl.apply(this,arguments); };
}
// vozes extras dos zumbis
v9On('kill',(x,z,kind,part,src)=>{ if(kind==='dog') return; if(Math.random()<0.28) sfx('z_death',{vol:0.6,x,z,range:28,wet:0.3,rate:sfxR(0.85,1.1),offset:sfxR(0,0.4)}); if(src==='explosive'||src==='nade') sfx('gore_guts',{vol:0.8,x,z,range:35,wet:0.25}); });
{ const _h=hurtPlayer; hurtPlayer=function(amt){ if(amt>0&&Math.random()<0.5){ const n=SFX.lastAtk||0, t=performance.now(); if(t-n>700){ SFX.lastAtk=t; sfx(pick(['z_attack','z_snarl1','z_snarl2','z_snarl3']),{vol:0.7,wet:0.2,rate:sfxR(0.9,1.1)}); } } return _h.apply(this,arguments); }; }
v9On('roundStart',r=>{ if(r>1) setTimeout(()=>{ const a=Math.random()*6.28; sfx(r%5===0?'z_groan_big':'z_groan_long',{vol:0.75,x:P.pos.x+Math.cos(a)*18,z:P.pos.z+Math.sin(a)*18,range:60,minVol:0.25,wet:0.8,rate:sfxR(0.85,1.0)}); },1800); });
v9On('always',dt=>{ if(G.state!=='playing') return; SFX.snT=(SFX.snT||0)-dt; if(SFX.snT>0) return; SFX.snT=sfxR(3,7);
  let best=null, bd=4.5; for(const z of zlist()){ if(z.dead||z.kind==='dog') continue; const d=Math.hypot(z.pos.x-P.pos.x,z.pos.z-P.pos.z); if(d<bd){ bd=d; best=z; } }
  if(best) sfx(z_snarlPick(best),{vol:0.55,x:best.pos.x,z:best.pos.z,range:16,wet:0.2,rate:sfxR(0.85,1.05)}); });
function z_snarlPick(z){ return z.sprint||z.kind==='sprinter'?'z_scream':pick(['z_snarl1','z_snarl2','z_snarl3']); }
// pouso do pulo
v9On('always',()=>{ const air=P.y>0.12; if(SFX.air&&!air&&G.state==='playing') sfx('jump_land',{vol:0.45,wet:0.08,rate:sfxR(0.95,1.05)}); SFX.air=air; });
// gore, finalização, susto do chefe, conquistas
{ const _g=gibZombie; gibZombie=function(z){ try{ sfx('gore_guts',{vol:1,x:z.pos.x,z:z.pos.z,range:40,wet:0.25}); sfx('gore_splat',{vol:0.7,x:z.pos.x,z:z.pos.z,range:40,wet:0.25,rate:0.9}); }catch(e){} return _g.apply(this,arguments); }; }
{ const _f=finStart; finStart=function(z){ setTimeout(()=>sfx('knife_twist',{vol:1,prio:true,wet:0.15}),260); return _f.apply(this,arguments); }; }
{ const _m=megaIntro; megaIntro=function(){ sfx('scare',{vol:0.9,prio:true,wet:0.4}); return _m.apply(this,arguments); }; }
{ const _a=achDone; achDone=function(id){ const had=!!(PROG.v9ach&&PROG.v9ach.d&&PROG.v9ach.d[id]); _a(id); if(!had&&PROG.v9ach&&PROG.v9ach.d[id]) sfx('powerup_win',{vol:0.8,prio:true,wet:0.25}); }; }
CMDS.som={d:'som <nome> · toca um dos sons novos (sem nome lista todos)',f:a=>{ if(!a[0]){ cprint(SFX_NEW.join(' · ')); return; } const h=sfx(a[0],{vol:1,prio:true}); cprint(h?'Tocando '+a[0]:'Ainda carregando ou não existe: '+a[0]); }};
