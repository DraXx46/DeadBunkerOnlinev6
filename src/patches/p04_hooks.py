P=[]
P.append(("updateTeleporters(dt); updateMapObjectives(dt);","updateTeleporters(dt); updateMapObjectives(dt); v9Frame(dt);"))
P.append(("updateAbilities(dt); updateVox(dt);","updateAbilities(dt); try{ v9Always(dt,rawDt); }catch(e){} updateVox(dt);"))
P.append(("""  camera.fov=CHEAT.fov; camera.updateProjectionMatrix();
}
function show(id){""","""  camera.fov=CHEAT.fov; camera.updateProjectionMatrix();
  try{ v9Reset(); }catch(e){ console.warn('[Bunker v9] reset',e); }
}
function show(id){"""))
P.append(("""  Snd.roundStart(); respawnIfDead(); if(!x1Live()) sysLog(`— Rodada ${r} —`);
}""","""  Snd.roundStart(); respawnIfDead(); if(!x1Live()) sysLog(`— Rodada ${r} —`);
  try{ v9RoundStart(r); }catch(e){}
}"""))
P.append(("""function roundEndLocal(){ G.inGap=true; addDrax(3+G.round);
  if(G.round>0&&G.round%5===0&&!x1Live()&&CUR!=='sandbox'&&!CHEAT.on){""","""function roundEndLocal(){ G.inGap=true; addDrax(3+G.round); try{ v9RoundEnd(G.round); }catch(e){}
  if(false&&G.round>0&&G.round%5===0&&!x1Live()&&CUR!=='sandbox'&&!CHEAT.on){ /* v9: recompensa a cada 3 rodadas (07_rewards) */"""))
# local kills
P.append(("""  if(!shooter){ if(src!=='nuke'){ G.kills++; if(part==='head') G.heads++; addPoints(Math.round(killPoints(part,src,z.kind)*Mod.killPts)); if(Mod.healKill) P.hp=Math.min(P.maxHp,P.hp+Mod.healKill); addDrax(killDrax(part,z.kind)); invCoins(z.pos.x,z.pos.z,z.kind,part); } }""",
"""  if(!shooter){ if(src!=='nuke'){ G.kills++; if(part==='head') G.heads++; addPoints(Math.round(killPoints(part,src,z.kind)*Mod.killPts)); if(Mod.healKill) P.hp=Math.min(P.maxHp,P.hp+Mod.healKill); addDrax(killDrax(part,z.kind)); invCoins(z.pos.x,z.pos.z,z.kind,part); try{ v9OnKill(z.pos.x,z.pos.z,z.kind,part,src,z); }catch(e){} } }"""))
P.append(("""  if(t==='k'){ const [, , , peer,part,src,br]=e; if(peer===me&&me){ G.kills++;""","""  if(t==='k'){ const [, , , peer,part,src,br]=e; if(peer===me&&me){ try{ const gz=NET.ghosts.get(e[2]); v9OnKill(gz?gz.pos.x:P.pos.x,gz?gz.pos.z:P.pos.z,gz?gz.kind:'normal',part,src,gz); }catch(err){} G.kills++;"""))
# bullets
P.append(("""      const crit=critRoll(); if(crit){ dmg*=Mod.critD; anyCrit=true; } else dmg*=Mod.nonCrit; DN.crit=crit;
      anyHit=true;""","""      const crit=critRoll(); if(crit){ dmg*=Mod.critD; anyCrit=true; } else dmg*=Mod.nonCrit; DN.crit=crit;
      try{ dmg*=v9BulletPre(z,part,h.point,dir,s,d); }catch(e){}
      anyHit=true;"""))
P.append(("""      if(crit) emit('spark',h.point.x,h.point.y,h.point.z,4,3,0.25,4);
      if(!boomAt) boomAt=h.point.clone();""","""      if(crit) emit('spark',h.point.x,h.point.y,h.point.z,4,3,0.25,4);
      try{ v9Run('hit',z,part,h.point,dir,dmg,s); }catch(e){}
      if(!boomAt) boomAt=h.point.clone();"""))
P.append(("""  if(s.mag<=0&&s.reserve>0&&!d.sprite) setTimeout(()=>{ if(G.state==='playing'&&curSlot()===s&&!Wp.knifeOut) startReload(); },150);
  hudAmmo();
}""","""  try{ v9Run('fire',s,d,hitZs,boomAt,firstZ,firstPt); }catch(e){}
  if(s.mag<=0&&s.reserve>0&&!d.sprite) setTimeout(()=>{ if(G.state==='playing'&&curSlot()===s&&!Wp.knifeOut) startReload(); },150);
  hudAmmo();
}"""))
# player speed / regen multipliers from relics etc.
P.append(("""*(Wp.knifeOut?1.12:1)*Mod.speed*((G.slowT||0)>0?0.55:1);""","""*(Wp.knifeOut?1.12:1)*Mod.speed*((G.slowT||0)>0?0.55:1)*v9SpeedK();"""))
P.append(("""  if(!Mod.noRegen&&G.t-P.lastHit>2.6) P.hp=Math.min(P.maxHp,P.hp+70*Mod.regen*dt);""",
"""  if(!Mod.noRegen&&G.t-P.lastHit>v9RegenDelay()) P.hp=Math.min(P.maxHp,P.hp+70*Mod.regen*v9RegenK()*dt);"""))
# death interception (self-revive with drax, extra-revive perk)
P.append(("""  if(P.hp<=0){ if(NET.mode) goDown(); else gameOver(); }
}""","""  if(P.hp<=0){ try{ if(v9BeforeDeath()) return; }catch(e){ console.warn(e); } if(NET.mode) goDown(); else gameOver(); }
}"""))
# weapon slots: 2, or 3 with the Mula perk
P.append(("""  if(Wp.inv.length<2){ Wp.inv.push(s); Wp.cur=Wp.inv.length-1; } else { Wp.inv[Wp.cur]=s; }""","""  if(Wp.inv.length<v9Slots()){ Wp.inv.push(s); Wp.cur=Wp.inv.length-1; } else { Wp.inv[Wp.cur]=s; }"""))
P.append(("""  if(Wp.inv.length>=2){ old=Wp.inv[Wp.cur]; Wp.inv[Wp.cur]=s; } else { Wp.inv.push(s); Wp.cur=Wp.inv.length-1; }""","""  if(Wp.inv.length>=v9Slots()){ old=Wp.inv[Wp.cur]; Wp.inv[Wp.cur]=s; } else { Wp.inv.push(s); Wp.cur=Wp.inv.length-1; }"""))
P.append(("""Wp.inv.length>=2) continue; giveWeapon(e[0]""","""Wp.inv.length>=v9Slots()) continue; giveWeapon(e[0]"""))
P.append(("""    case 'Digit1': press('slot0'); break; case 'Digit2': press('slot1'); break; case 'Digit3': press('slot2'); break;""",
"""    case 'Digit1': press('slot0'); break; case 'Digit2': press('slot1'); break; case 'Digit3': press('slot2'); break; case 'Digit4': press('slot3'); break;"""))
P.append(("""  if(E.has('slot0')) switchTo(0); if(E.has('slot1')) switchTo(1); if(E.has('slot2')) drawKnife();""",
"""  if(E.has('slot0')) switchTo(0); if(E.has('slot1')) switchTo(1); if(E.has('slot2')){ if(Wp.inv.length>=3) switchTo(2); else drawKnife(); } if(E.has('slot3')) drawKnife();"""))
P.append(("""    if(E.has('slot0')) switchTo(0); if(E.has('slot1')) switchTo(1); if(E.has('swap')||E.has('slot2')) switchTo(Wp.cur);""",
"""    if(E.has('slot0')) switchTo(0); if(E.has('slot1')) switchTo(1); if(E.has('slot2')&&Wp.inv.length>=3) switchTo(2); else if(E.has('swap')||E.has('slot2')||E.has('slot3')) switchTo(Wp.cur);"""))
# zombie attack: dogs grab instead of the old one-hit kill
P.append(("""  if(z.attackT>0.42&&!z.hitDone){ z.hitDone=true; if(T&&dist<reach){ if(z.bossKi!=null) bossHurt(T,85,z); else hurtTarget(T,z.zdmg!=null?z.zdmg:z.kind==='brute'?85:z.crawl?40:55,z); } }""",
"""  if(z.kind==='dog'&&!z.dead){ try{ if(dogTryGrab(z,T,dist,reach)){ z.attackT=0; z.hitDone=false; return; } }catch(e){} }
  if(z.attackT>0.42&&!z.hitDone){ z.hitDone=true; if(T&&dist<reach){ if(z.bossKi!=null) bossHurt(T,85,z); else if(z.kind==='dog') hurtTarget(T,25,z); else hurtTarget(T,z.zdmg!=null?z.zdmg:z.kind==='brute'?85:z.crawl?40:55,z); } }"""))
P.append(("""  if(kind==='dog'){ z.hp=z.maxHp=z.hp*0.45; z.speed=rand(4.0,4.6)*diffSpeed; z.zdmg=9999; }""",
"""  if(kind==='dog'){ z.hp=z.maxHp=z.hp*0.45; z.speed=rand(4.0,4.6)*diffSpeed; z.zdmg=25; }"""))
