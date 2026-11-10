P=[]
P.append(("""function handleEv(e){
  const t=e[1], me=NET.me;""","""function handleEv(e){
  const t=e[1], me=NET.me;
  if(V9NET.ev[t]){ try{ V9NET.ev[t](e,me); }catch(err){ console.warn('[Bunker v9] ev',t,err); } return; }"""))
P.append(("""function handleAct(peer,a){
  const t=a[1];""","""function handleAct(peer,a){
  const t=a[1];
  if(V9NET.act[t]){ try{ V9NET.act[t](peer,a); }catch(err){ console.warn('[Bunker v9] act',t,err); } return; }"""))
P.append(("""function busy(){ return P.down>0||""","""function busy(){ return P.down>0||(typeof DOGQ!=='undefined'&&DOGQ.on)||"""))
P.append(("""  if(P.down){ P.ads=0; if(camera.fov!==CHEAT.fov){ camera.fov=CHEAT.fov; camera.updateProjectionMatrix(); } return; }
  if(Wp.swapT>0)""","""  if(P.down){ P.ads=0; if(camera.fov!==CHEAT.fov){ camera.fov=CHEAT.fov; camera.updateProjectionMatrix(); } return; }
  if(DOGQ.on){ P.ads=0; dogWeapons(dt); return; }
  if(Wp.swapT>0)"""))
P.append(("""function killZombie(z,part,src,shooter,luck){
  z.dead=true;""","""function killZombie(z,part,src,shooter,luck){
  z.dead=true; z.lastSrc=src;"""))
