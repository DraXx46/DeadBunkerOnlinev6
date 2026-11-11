P=[]
P.append(("""  EVT.next-=dt; if(EVT.next>0) return; EVT.next=rand(60,110);""","""  EVT.next-=dt; if(EVT.next>0) return; EVT.next=rand(32,62);   // v9: eventos mais frequentes"""))
P.append(("""  const opts=['neblina','furia','suprimento','armamento']; if(G.power) opts.push('apagao','apagao');""","""  const opts=['neblina','furia','suprimento','armamento']; if(G.power) opts.push('apagao','apagao');
  opts.push('troca','roleta','roleta','chuva','eclipse');   // v9"""))
P.append(("""  const k=pick(opts.filter(q=>q!=='armamento')); const I=EVT_INFO[k];""","""  const k=pick(opts.filter(q=>q!=='armamento')); const I=EVT_INFO[k];
  if(k==='roleta'){ const sp=portalSpot(); EVT.px=sp[0]; EVT.pz=sp[1]; }"""))
P.append(("""EVT.k=null; EVT.t=0; EVT.next=rand(55,85); document.body.classList.remove('furia');""","""EVT.k=null; EVT.t=0; EVT.next=rand(30,50); document.body.classList.remove('furia');"""))
P.append(("""function saveProg(){ PROG.rev=(PROG.rev|0)+1; store.set('bdm_prog',JSON.stringify(PROG)); writeProg(); renderDrax(); }""",
"""function saveProg(){ const sw=v9SwapHold(); PROG.rev=(PROG.rev|0)+1; store.set('bdm_prog',JSON.stringify(PROG)); writeProg(); v9SwapRelease(sw); renderDrax(); }"""))
P.append(("""  let kind=brute?'brute':'normal';""","""  let kind=spawn.kind||(brute?'brute':'normal');"""))
P.append(("""  if(!boss&&!brute){ const R=G.round, rr=Math.random();""","""  if(!boss&&!brute&&!spawn.kind){ const R=G.round, rr=Math.random();"""))
P.append(("""const ZKIND=['normal','brute','dog','bomber','fat'];""","""const ZKIND=['normal','brute','dog','bomber','fat','dopple','mega'];"""))
P.append(("""  if(z.kind==='dog'){ dogBody(z,rng); zSkin(z); return; }""","""  if(z.kind==='dog'){ dogBody(z,rng); zSkin(z); return; }
  if(z.kind==='mega'&&typeof megaBody==='function'){ megaBody(z,rng); return; }"""))
P.append(("""  try{ zombieDetails(z,rng,{hat:hatOn,eyes,brute}); }catch(e){}
  const root=new THREE.Group(); root.add(g); z.root=root; scene.add(root); zSkin(z);""","""  try{ zombieDetails(z,rng,{hat:hatOn,eyes,brute}); }catch(e){}
  if(z.kind==='dopple'){ try{ doppleDress(z); }catch(e){ console.warn('[Bunker v9] sósia',e); } }
  const root=new THREE.Group(); root.add(g); z.root=root; scene.add(root); zSkin(z);"""))
