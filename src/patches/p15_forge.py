P=[]
P.append(("""      text:()=>{ if(!G.power) return 'É preciso ligar a energia'; if(Wp.upT>0) return null; const s=curSlot(); if(!s||Wp.knifeOut) return null; const L=s.lvl|0; if(L>=MAXLV) return""",
"""      text:()=>{ if(!G.power) return 'É preciso ligar a energia'; if(Wp.upT>0) return null; const s=curSlot(); { const ft=v9AfText(af,s); if(ft!==undefined) return ft; } if(!s||Wp.knifeOut) return null; const L=s.lvl|0; if(L>=MAXLV) return"""))
P.append(("""      use:()=>{ if(!G.power){ Snd.deny(); flashPrompt(); return; } const s=curSlot(); if(!s||Wp.knifeOut||(s.lvl|0)>=MAXLV""",
"""      use:()=>{ if(!G.power){ Snd.deny(); flashPrompt(); return; } const s=curSlot(); if(v9AfUse(af,s)) return; if(!s||Wp.knifeOut||(s.lvl|0)>=MAXLV"""))
P.append(("""  const key=s.id+'+'+(s.lvl|0)+':'+modVer; let r=wsCache.get(key); if(r) return r;
  const d=wdef(s);
  r=Object.assign({},d,{dmg:d.dmg*Mod.dmg,""","""  const key=s.id+'+'+(s.lvl|0)+(s.ov?'ov':'')+':'+modVer; let r=wsCache.get(key); if(r) return r;
  const d=wdef(s);
  r=Object.assign({},d,{dmg:d.dmg*Mod.dmg*(s.ov?6:1),"""))
P.append(("""  if(d.fixedMag) r.mag=d.mag;
  wsCache.set(key,r); return r;""","""  if(d.fixedMag) r.mag=d.mag;
  if(s.ov){ r.name=d.name+' ✦ Forjada'; r.mag=Math.ceil(r.mag*1.5); r.reserve=Math.ceil(r.reserve*1.6); r.rpm*=1.15; r.pen=(r.pen||1)+3; r.lvlSplash=Math.max(r.lvlSplash||0,2.8); r.forged=true; }
  wsCache.set(key,r); return r;"""))
