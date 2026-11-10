P=[]
P.append(("""const prizeRar=p=>p.red?5:p.kind==='art'?p.art.r:itemR(p.item);""","""const prizeRar=p=>p.red?5:p.kind==='drax'?(p.r|0):p.kind==='art'?p.art.r:itemR(p.item);"""))
P.append(("""  if(p.kind==='art') return `<div class="bt" style="--rc:${RAR[p.art.r].col}">${artIcon(p.art,54)}<b>${RAR[p.art.r].name}</b><span>${artName(p.art)}</span></div>`;
  const it=p.item""","""  if(p.kind==='art') return `<div class="bt" style="--rc:${RAR[p.art.r].col}">${artIcon(p.art,54)}<b>${RAR[p.art.r].name}</b><span>${artName(p.art)}</span></div>`;
  if(p.kind==='drax') return `<div class="bt" style="--rc:${RAR[p.r|0].col}"><span class="v9dx">◆</span><b>${RAR[p.r|0].name}</b><span>◆ ${p.n.toLocaleString('pt-BR')} drax</span></div>`;
  const it=p.item"""))
P.append(("""  if(p.kind==='art'){ const a=p.art; return `<span class="rr">${RAR[a.r].name} · artefato</span>""","""  if(p.kind==='drax') return `<span class="rr">${RAR[p.r|0].name} · drax</span><h3>◆ ${p.n.toLocaleString('pt-BR')}</h3><span class="v9dx big">◆</span><p class="rec">Os drax já foram para a sua conta.</p>`;
  if(p.kind==='art'){ const a=p.art; return `<span class="rr">${RAR[a.r].name} · artefato</span>"""))
P.append(("""function grantPrize(p){ if(p.kind==='knife') PROG.items.push(p.item);""","""function grantPrize(p){ if(p.kind==='drax'){ PROG.drax+=p.n|0; saveProg(); return; } if(p.kind==='knife') PROG.items.push(p.item);"""))
P.append(("""function rollBox(b,forceRed){ const r=Math.random(); if(forceRed||r<b.red) return Object.assign({red:true},redPrize());""","""function rollBox(b,forceRed){ const r=Math.random(); if(forceRed||r<b.red) return Object.assign({red:true},redPrize());
  if(!b.shop&&Math.random()<0.18){ const T={sup:[40,120,0],mil:[120,320,1],bunker:[300,750,2],sombra:[700,1700,3],oculta:[1600,4200,4]}[b.t]||[60,160,0]; const n=Math.round(T[0]+Math.pow(Math.random(),1.8)*(T[1]-T[0])); return {kind:'drax',n,r:Math.min(5,T[2]+(n>(T[0]+T[1])*0.6?1:0))}; }"""))
