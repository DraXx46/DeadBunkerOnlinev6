P=[]
P.append(("""function zombieHp(r){ const base=r<10?150+100*(r-1):Math.floor(950*Math.pow(1.1,r-9)); const d=onlineDifficulty(); return Math.floor(base*(d==='nightmare'?1.55:d==='hard'?1.25:1)); }""",
"""function zombieHp(r){ const base=r<10?150+100*(r-1):Math.floor(950*Math.pow(1.1,r-9)); const d=onlineDifficulty(); return Math.floor(base*(d==='nightmare'?1.55:d==='hard'?1.25:1)*V9DIFF.hp); }"""))
P.append(("""  amt*=Mod.taken*threatDmg()*abTaken();""","""  amt*=Mod.taken*threatDmg()*abTaken()*V9DIFF.dmg*v9TakenK();"""))
P.append(("""*(1+Math.min(0.3,0.03*L))*diffSpeed*(boss?0.88:1);""","""*(1+Math.min(0.3,0.03*L))*diffSpeed*(boss?0.88:1)*V9DIFF.spd;"""))
P.append(("""function price(c){ return Math.max(10,Math.round(c*Mod.cost/10)*10); }""","""function price(c){ return Math.max(10,Math.round(c*Mod.cost*V9DIFF.cost/10)*10); }"""))
