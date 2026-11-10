P=[]
# ---- Tranzitch: no bombers while anyone rides the bus; existing ones are disarmed
P.append(("""      if(rr<pd) kind='dog'; else if(rr<pd+pb) kind='bomber'; else if(rr<pd+pb+pf) kind='fat'; } }""",
"""      if(rr<pd) kind='dog'; else if(rr<pd+pb) kind='bomber'; else if(rr<pd+pb+pf) kind='fat'; } }
  if(kind==='bomber'&&tzBusBusy()) kind='normal';   // v9: sem homem-bomba enquanto tem gente no ônibus"""))
P.append(("""  if(z.kind==='bomber'&&!z.boomed){ z.boomed=true; const bx=z.pos.x, bz=z.pos.z; if(z.bombLight) z.bombLight.material.color.setHex(0xffffff); setTimeout(()=>zombieBlast(bx,bz),550); }
  if(z.kind==='fat'){""","""  if(z.kind==='bomber'&&!z.boomed){ z.boomed=true; const bx=z.pos.x, bz=z.pos.z; if(tzBusBusy()){ if(z.bombLight) z.bombLight.visible=false; } else { if(z.bombLight) z.bombLight.material.color.setHex(0xffffff); setTimeout(()=>zombieBlast(bx,bz),550); } }
  if(z.kind==='fat'){"""))
P.append(("""function tzStartPhase(ph,dur){""","""function tzBusBusy(){ return CUR==='tz'&&TZB.present&&tzAnyRider(); }
/* v9: quantos zumbis podem estar dentro/entrando no ônibus ao mesmo tempo (antes entravam todos de uma vez) */
function tzBusCrowd(){ let n=0; for(const z of zombies){ if(z.dead) continue; const st=z.state; if(tzInBus(z.pos.x,z.pos.z,0)||(z.win&&z.win.bus&&(st==='approach'||st==='wait'||st==='toTear'||st==='tear'||st==='climb'||st==='roofUp'||st==='roofWalk'||st==='roofDrop'))) n++; } return n; }
function tzBusCap(){ const np=TG.length||1; return Math.min(7,2+np+Math.floor(G.round/8)); }
function tzStartPhase(ph,dur){"""))
P.append(("""  if(!zIn&&tIn&&Math.hypot(z.pos.x-TZB.pos.x,z.pos.z-TZB.pos.z)<16&&NET.mode!=='client'){ const w=tzEntry(z); if(w){ z.win=w; z.state='approach'; return {x:w.outPt.x,z:w.outPt.z}; } }""",
"""  if(!zIn&&tIn&&Math.hypot(z.pos.x-TZB.pos.x,z.pos.z-TZB.pos.z)<16&&NET.mode!=='client'){
    if(tzBusCrowd()>=tzBusCap()){ // fila: rodeia o ônibus a uns 4 m esperando vaga, em vez de entrar todo mundo junto
      const a=((z.seed||1)%628)/100+G.t*0.15; return {x:TZB.pos.x+Math.cos(a)*(TZ_HW+3.2),z:TZB.pos.z+Math.sin(a)*(TZ_ZR+1.5)}; }
    const w=tzEntry(z); if(w){ z.win=w; z.state='approach'; return {x:w.outPt.x,z:w.outPt.z}; } }"""))
P.append(("""  if(z.win&&z.win.bus&&!z.win.door&&TZB.ph==='road'){ const w=z.win;""","""  if(z.win&&z.win.bus&&!z.win.door&&TZB.ph==='road'&&tzBusCrowd()>tzBusCap()){ z.win=null; z.state='inside'; }
  if(z.win&&z.win.bus&&!z.win.door&&TZB.ph==='road'){ const w=z.win;"""))
# slower tearing on the bus (boards hold ~2.2x longer)
P.append(("""        else { z.attackT=0; z.hitDone=false; z.tearT+=dt; if(z.tearT>(z.runner?0.75:z.kind==='brute'?0.6:1.15)){ z.tearT=0; removeBoard(w); } }""",
"""        else { z.attackT=0; z.hitDone=false; z.tearT+=dt; if(z.tearT>(z.runner?0.75:z.kind==='brute'?0.6:1.15)*(w.bus?2.2:1)){ z.tearT=0; removeBoard(w); } }"""))
# revolver on the bus roof: only when looking up at it
P.append(("""  const rvIt={x:0,z:0,r:1.4,enabled:()=>TZB.present&&P.base>0.5,""","""  const rvIt={x:0,z:0,r:1.4,enabled:()=>TZB.present&&P.base>0.5&&P.pitch>0.55,   // v9: só olhando para cima, para o desenho no teto"""))
# ---- planks give more points as the rounds go by
P.append(("""  if(byPlayer&&G.repairPts<200){ addPoints(5); G.repairPts+=5; }
}""","""  if(byPlayer&&G.repairPts<boardCap()){ const p=boardPts(); addPoints(p); G.repairPts+=p; }
}
// v9: tábua reconstruída vale mais conforme as rodadas passam (10 → 60 por tábua; o teto por rodada sobe junto)
function boardPts(){ return Math.min(60,10+Math.floor(Math.max(0,G.round-1)*2.5/5)*5); }
function boardCap(){ return 200+Math.max(0,G.round-1)*45; }"""))
P.append(("""        if(NET.mode==='client'){ if(w.boards<6){ w.localRepUntil=G.t+1.2; netAct(['rep',windows.indexOf(w)]); if(G.repairPts<200){ addPoints(5); G.repairPts+=5; } } }""",
"""        if(NET.mode==='client'){ if(w.boards<6){ w.localRepUntil=G.t+1.2; netAct(['rep',windows.indexOf(w)]); if(G.repairPts<boardCap()){ const p=boardPts(); addPoints(p); G.repairPts+=p; } } }"""))
# ---- knife insta-kill card never applies to bosses
P.append(("""function knifeDamage(heavy){ if(Mod.knifeInsta) return 9e6; return""","""function isBossZ(z){ return !!z&&(z.bossKi!=null||z.boss||z.mega||z.dopple); }
function knifeDamage(heavy,z){ if(Mod.knifeInsta&&!isBossZ(z)) return 9e6; return"""))
P.append(("""let dmg=knifeDamage(heavy); const crit=critRoll();""","""let dmg=knifeDamage(heavy,best); const crit=critRoll();"""))
# knife into the wall: recorded sounds
P.append(("""const p=camera.position.clone().addScaledVector(_d,t); impactFx(p,false); Snd.impact(surfaceAt(p,RH.c,RH.kind),p.x,p.z,0.6); }""",
"""const p=camera.position.clone().addScaledVector(_d,t); impactFx(p,false); if(!Snd.sample(heavy?'knife_wall_tip':'knife_wall_blade',{vol:1,prio:true,wet:0.2})) Snd.impact(surfaceAt(p,RH.c,RH.kind),p.x,p.z,0.6); }"""))
# ---- hospital courtyard gates: 100 000
P.append((""" doors[8].objectiveGate=true; doors[9].objectiveGate=true; // Hospício: courtyard gates""",
""" doors[8].objectiveGate=true; doors[9].objectiveGate=true; // Hospício: courtyard gates
 doors[8].noMult=doors[9].noMult=true; doors[8].cost=doors[9].cost=100000; doors[8].label=doors[9].label='o quintal da máquina do tempo';   // v9"""))
# ---- bullets no longer shove zombies by default: a small slow-down; knockback comes from endgame cards (Mod.knock, metres per shot)
P.append(("""  if(z.state==='inside'||z.state==='dying'){ const push=pw*(z.crawl?0.6:1.7); z.kbx=(z.kbx||0)+dx*push; z.kbz=(z.kbz||0)+dz*push; const sp=Math.hypot(z.kbx,z.kbz); if(sp>3.2){ z.kbx*=3.2/sp; z.kbz*=3.2/sp; } }
  z.stagT=Math.max(z.stagT||0,Math.min(0.55,pw*0.45));""","""  if(src==='gun'&&z.state!=='dying'){
    // v9: tiro só desacelera um pouquinho; o empurrão vem das cartas de fim de jogo (até 30 cm por tiro), bem menos nos chefes
    z.gunSlow=Math.max(z.gunSlow||0,0.16);
    const kn=(typeof Mod!=='undefined'&&Mod.knock)||0;
    if(kn>0&&z.state==='inside'){ const bossK=isBossZ(z)?0.2:brute?0.5:1; const push=kn*9*bossK*clamp(pw,0.35,1); z.kbx=(z.kbx||0)+dx*push; z.kbz=(z.kbz||0)+dz*push; const sp=Math.hypot(z.kbx,z.kbz); if(sp>4){ z.kbx*=4/sp; z.kbz*=4/sp; } }
  } else {
  if(z.state==='inside'||z.state==='dying'){ const push=pw*(z.crawl?0.6:1.7)*(isBossZ(z)?0.25:1); z.kbx=(z.kbx||0)+dx*push; z.kbz=(z.kbz||0)+dz*push; const sp=Math.hypot(z.kbx,z.kbz); if(sp>3.2){ z.kbx*=3.2/sp; z.kbz*=3.2/sp; } }
  z.stagT=Math.max(z.stagT||0,Math.min(0.55,pw*0.45)); }"""))
P.append(("""  if(z.stagT>0) z.stagT-=dt;
  if(z.flK>0)""","""  if(z.stagT>0) z.stagT-=dt; if(z.gunSlow>0) z.gunSlow-=dt;
  if(z.flK>0)"""))
P.append(("""          moveToward(z,tx,tz,dt*(z.stagT>0?0.2:1),z.crawl?0.8:z.speed*(z.gaitK||1));""",
"""          moveToward(z,tx,tz,dt*(z.stagT>0?0.2:z.gunSlow>0?0.8:1)*(z.frozenT>0?0.15:1),z.crawl?0.8:z.speed*(z.gaitK||1));"""))
