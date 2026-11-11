P=[("""  const fovT=Wp.scoped?CHEAT.fov/(Wp.scopeLv===2?6.5:2.6):CHEAT.fov-(d.scope?10:(d.zoom||12))*P.ads;""",
"""  const fovT=Wp.scoped?CHEAT.fov/(Wp.scopeLv===2?6.5:2.6):CHEAT.fov-(d.scope?10:(d.zoom||12))*P.ads+v9SprFov();"""),
("""    P.ads=lerp(P.ads,0,dt*12); if(Math.abs(camera.fov-CHEAT.fov)>0.01){ camera.fov=lerp(camera.fov,CHEAT.fov,Math.min(1,dt*12)); camera.updateProjectionMatrix(); }""",
"""    P.ads=lerp(P.ads,0,dt*12); if(Math.abs(camera.fov-CHEAT.fov-v9SprFov())>0.01){ camera.fov=lerp(camera.fov,CHEAT.fov+v9SprFov(),Math.min(1,dt*12)); camera.updateProjectionMatrix(); }""")]
P+=[("""if(edge(PB.L3)) press(Wp.knifeOut?'inspect':'knife');""","""if(edge(PB.L3)){ if(!v9SprPad()) press(Wp.knifeOut?'inspect':'knife'); }""")]
