P=[]
P.append(("""  const sandboxWeaponIds=Object.keys(WEAPONS);""","""  for(const d of V9_WB) defs.push(d);
  const sandboxWeaponIds=Object.keys(WEAPONS).filter(k=>k!=='xbow');"""))
P.append(("""  try{ tzRegister(); }catch(e){ console.warn('[Bunker] tranzitch (pontos)',e); }""","""  try{ tzRegister(); }catch(e){ console.warn('[Bunker] tranzitch (pontos)',e); }
  try{ cityRegister(); }catch(e){ console.warn('[Bunker v9] cidade (pontos)',e); }"""))
P.append(("""  try{ buildTz(); }catch(e){ console.warn('[Bunker] tranzitch',e); } ROOT=MAPG.bunker;""","""  try{ buildTz(); }catch(e){ console.warn('[Bunker] tranzitch',e); } ROOT=MAPG.bunker;
  try{ ROOT=MAPG.city; BATCH=new Batch(); buildCity(); BATCH.flush(MAPG.city); }catch(e){ console.warn('[Bunker v9] cidade',e); } ROOT=MAPG.bunker;"""))
P.append(("""  world=true;
  setMap('bunker');""","""  try{ tmBuild(); tmReset(); }catch(e){ console.warn('[Bunker v9] máquina do tempo',e); }
  try{ carBuild(); carReset(); }catch(e){ console.warn('[Bunker v9] carro',e); }
  world=true;
  setMap('bunker');"""))
P.append(("""  specCamera();
  updateFlash(rawDt);""","""  specCamera(); try{ v9Cam(rawDt); }catch(e){}
  updateFlash(rawDt);"""))
