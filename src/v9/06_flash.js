/* ================= v9 · LANTERNA DOS AMIGOS: facho de luz de verdade + cone visível + brilho na lente ================= */
const FLR={coneG:null,coneM:null};
function flrEnsure(rp){ if(rp.flr) return rp.flr;
  if(!FLR.coneG){ FLR.coneG=new THREE.ConeGeometry(1.9,9,20,1,true); FLR.coneG.translate(0,-4.5,0); FLR.coneG.rotateX(-Math.PI/2);
    FLR.coneM=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uC:{value:new THREE.Color(0xfff0d4)},uA:{value:0.11}},
      vertexShader:'varying float vZ; varying vec3 vN; varying vec3 vV; void main(){ vZ=-position.z/9.0; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
      fragmentShader:'uniform vec3 uC; uniform float uA; varying float vZ; varying vec3 vN; varying vec3 vV; void main(){ float edge=pow(abs(dot(vN,vV)),1.4); float f=(1.0-vZ)*(1.0-vZ); gl_FragColor=vec4(uC,uA*f*edge); }'}); }
  const L=new THREE.SpotLight(0xfff0d4,0,26,0.45,0.55,1.3); L.userData.noBud=true; L.castShadow=false; scene.add(L); scene.add(L.target);
  const cone=new THREE.Mesh(FLR.coneG,FLR.coneM.clone()); cone.frustumCulled=false; scene.add(cone);
  const lens=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xfff6e0,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0})); lens.scale.set(0.5,0.5,1); scene.add(lens);
  return rp.flr={L,cone,lens,k:0}; }
const _flo=new THREE.Vector3(), _fld=new THREE.Vector3();
v9On('always',dt=>{
  let n=0;
  for(const rp of NET.players.values()){
    const want=!!rp.fl&&rp.x!=null&&rp.down===0&&(G.state==='playing'||G.state==='paused'||G.state==='lobby')&&n<3; if(want) n++;
    if(!want&&!rp.flr) continue; const F=flrEnsure(rp); F.k=lerp(F.k,want?1:0,Math.min(1,dt*10));
    const strong=(rp.rf&1)?1.8:1; const vis=F.k>0.01; F.L.visible=vis; F.cone.visible=vis; F.lens.visible=vis; if(!vis){ F.L.intensity=0; continue; }
    const yaw=rp.yaw, pitch=clamp(rp.pitch||0,-1.2,1.2), cp=Math.cos(pitch);
    _fld.set(-Math.sin(yaw)*cp,Math.sin(pitch),-Math.cos(yaw)*cp);
    _flo.set(rp.x,floorAt(rp.x,rp.z)+1.42-(rp.crouchK||0)*0.36,rp.z).addScaledVector(_fld,0.35); _flo.x+=Math.cos(yaw)*0.14; _flo.z-=Math.sin(yaw)*0.14;
    F.L.position.copy(_flo); F.L.target.position.copy(_flo).addScaledVector(_fld,10); F.L.target.updateMatrixWorld();
    F.L.intensity=2.2*F.k*strong*(0.985+Math.sin(G.t*31+rp.animT)*0.01); F.L.distance=strong>1?44:26; F.L.angle=strong>1?0.6:0.45;
    F.cone.position.copy(_flo); F.cone.lookAt(_flo.x+_fld.x,_flo.y+_fld.y,_flo.z+_fld.z); F.cone.material.uniforms.uA.value=0.09*F.k*(strong>1?1.5:1); F.cone.scale.setScalar(strong>1?1.3:1);
    F.lens.position.copy(_flo); const toCam=camera.position.clone().sub(_flo).normalize(); F.lens.material.opacity=F.k*clamp(toCam.dot(_fld)*1.4,0.1,1); F.lens.scale.setScalar(0.35+F.lens.material.opacity*0.9);
  }
});
/* quando alguém sai da sala, a luz dele some junto */
function v9DropRemoteLight(rp){ if(rp&&rp.flr){ scene.remove(rp.flr.L); scene.remove(rp.flr.L.target); scene.remove(rp.flr.cone); scene.remove(rp.flr.lens); rp.flr=null; } }
