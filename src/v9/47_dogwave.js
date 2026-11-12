/* ================= v9 · ONDA DE CHOQUE AO SE SOLTAR DO CACHORRO =================
   Quem se solta do cachorro dá um coice no chão: dano em área e todo zumbi por perto é arremessado
   para uns 15 m de distância (chefes voam bem menos). Online quem aplica é o anfitrião. */
const DGW={R:7, far:15, dmgK:0.45, dmgMin:180};
function dogWaveFx(x,zz,local){
  const y=floorAt(x,zz)+0.15;
  emit('dust',x,y,zz,46,7.5,0.9,-1); emit('dust',x,y+0.3,zz,20,4,0.6,-1);
  // anel que se espalha pelo chão
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.6,1.0,48),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2; ring.position.set(x,y+0.05,zz); scene.add(ring);
  let t=0; const step=dt=>{ t+=dt; const k=t/0.45; ring.scale.setScalar(1+k*DGW.R*1.1); ring.material.opacity=0.85*(1-k); if(k>=1){ scene.remove(ring); ring.geometry.dispose(); ring.material.dispose(); return true; } };
  DGW.fx.push(step);
  try{ Snd.boom&&Snd.boom(x,zz); Snd.kick&&Snd.kick(); }catch(e){}
  if(local){ shake(0.9); try{ padRumble(1,0.8,260); }catch(e){} }
  else if(Math.hypot(P.pos.x-x,P.pos.z-zz)<16) shake(0.4);
}
DGW.fx=[];
v9On('always',dt=>{ for(let i=DGW.fx.length-1;i>=0;i--) if(DGW.fx[i](dt)) DGW.fx.splice(i,1); });

// só o anfitrião (ou o jogo solo) mexe nos zumbis
function dogWaveApply(x,zz){
  const dmg=Math.max(DGW.dmgMin,Math.round((G.zhp||300)*DGW.dmgK));
  for(const z of zombies.slice()){
    if(!z||z.dead||z.state!=='inside') continue; const dx=z.pos.x-x, dz=z.pos.z-zz, d=Math.hypot(dx,dz); if(d>DGW.R) continue;
    const boss=isBossZ(z), ux=d>0.05?dx/d:Math.sin(Math.random()*6.28), uz=d>0.05?dz/d:Math.cos(Math.random()*6.28);
    const want=Math.max(0,(boss?Math.min(DGW.far,d+3):DGW.far)-d);   // deslocamento = velocidade / 9 (atrito do empurrão)
    z.kbx=ux*want*9; z.kbz=uz*want*9; z.stagT=Math.max(z.stagT||0,boss?0.5:1.4); z.attackT=0; z.hitDone=false;
    damageZombie(z,Math.round(dmg*(1-0.5*d/DGW.R)),'body','blast');
  }
}
V9NET.act.dgw=(peer,a)=>{ const x=+a[2], zz=+a[3]; if(!isFinite(x)||!isFinite(zz)) return; dogWaveApply(x,zz); dogWaveFx(x,zz,false); pushEv(['dgw',r10(x),r10(zz),peer]); };
V9NET.ev.dgw=(e,me)=>{ if(e[4]&&e[4]===me) return; dogWaveFx(+e[2],+e[3],false); };

const dogGrabEnd0=dogGrabEnd;
dogGrabEnd=function(won,silent){
  const r=dogGrabEnd0.apply(this,arguments);
  if(won){ const x=P.pos.x, zz=P.pos.z; dogWaveFx(x,zz,true);
    if(NET.mode==='client') netAct(['dgw',r10(x),r10(zz)]);
    else{ dogWaveApply(x,zz); if(NET.mode==='host') pushEv(['dgw',r10(x),r10(zz)]); } }
  return r;
};
CMDS.onda_cao={cheat:1,d:'onda_cao · solta a onda de choque de quando você se livra do cachorro',f:()=>{ const x=P.pos.x,zz=P.pos.z; dogWaveFx(x,zz,true); if(NET.mode==='client') netAct(['dgw',r10(x),r10(zz)]); else dogWaveApply(x,zz); }};
