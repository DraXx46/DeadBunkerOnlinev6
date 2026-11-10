P=[]
old_start="""    const body=new THREE.Mesh(new THREE.BoxGeometry(1.15,2.15,0.85),new THREE.MeshPhongMaterial({color:p.color,specular:0x444444,shininess:30})); body.position.y=1.075; g.add(body);"""
s=open('/home/claude/draxx46/deadbunkeronlinev6/BunkerDosMortos/index.html',encoding='utf-8').read()
i=s.index(old_start); j=s.index("    ROOT.add(g);\n    addPropBox(px,pz,Math.abs(nx)?0.45:0.6",i)
P.append((s[i:j],"""    const PMx=v9PerkMachine(p,g); const sign=PMx.sign, bottles=PMx.bottles; PM_EXTRA.push({g,glow:PMx.glow,floorGlow:PMx.floorGlow,backM:PMx.backM,ph:Math.random()*9});
"""))
P.append(("""function setPerkSigns(on){ for(const s of perkSigns){ s.sign.material.color.setHex(on?0xffffff:0x333333); s.bottles.forEach(b=>b.material.color.setHex(on?s.p.color:0x222222)); } }""",
"""function setPerkSigns(on){ for(const s of perkSigns){ s.sign.material.color.setHex(on?0xffffff:0x333333); s.bottles.forEach(b=>b.material.color.setHex(on?s.p.color:0x222222)); } try{ v9PerkSignsExtra(on); }catch(e){} }"""))
