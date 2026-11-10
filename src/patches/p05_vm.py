P=[]
P.append(("""  rigUpdate();
  repairView(dt);""","""  rigUpdate();
  repairView(dt); try{ v9VmView(dt); }catch(e){}"""))
P.append(("""  const ads=IN.ads&&!P.sprinting&&!busy()&&!d.sprite&&!Wp.reloading;""","""  const ads=IN.ads&&!P.sprinting&&!busy()&&!d.sprite&&!Wp.reloading&&!v9AdsBlocked(s);"""))
P.append(("""  Wp.scoped=!!d.scope&&ads&&P.ads>0.86; if(""","""  Wp.scoped=!!d.scope&&ads&&P.ads>0.86&&v9ScopeReady(s); if("""))
# host: helmets also pop for guests' headshots
P.append(("""if(rp&&rp.x!=null) zHitReact(z,z.pos.x-rp.x,z.pos.z-rp.z,clamp(+a[3]||0,0,300),a[4],a[5]==='knife'?'knife':'gun');""","""if(rp&&rp.x!=null){ zHitReact(z,z.pos.x-rp.x,z.pos.z-rp.z,clamp(+a[3]||0,0,300),a[4],a[5]==='knife'?'knife':'gun'); try{ v9HostHelmet(z,a[4],z.pos.x-rp.x,z.pos.z-rp.z); }catch(e){} }"""))
