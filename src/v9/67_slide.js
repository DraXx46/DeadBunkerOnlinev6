/* ================= v9 · DESLIZAR =================
   Correndo, aperte agachar (C / Ctrl · ○ no controle): o personagem desliza no chão com o embalo da corrida, a câmera
   abaixa e inclina, a arma deita um pouco, levanta poeira e faz o som de arrasto. Dá para atirar deslizando; pular cancela.
   No fim, se ainda estiver segurando agachar, continua agachado; senão levanta. Recarga curta entre deslizadas. */
const SLD={on:false,t:0,dur:0.82,dx:0,dz:0,v0:0,v:0,cd:0,k:0,roll:0,ct0:false,kc:false,dustT:0};
function sldSprintSpd(){ try{ return BASE_SPD*abSpeed(G.adren>0?1.35:1)*Mod.speed*v9SpeedK(); }catch(e){ return BASE_SPD*1.5; } }
function sldCan(){ return G.state==='playing'&&!P.down&&P.y<=0.001&&SLD.cd<=0&&!SLD.on&&(SPRINT.on||SPRINT.b>0.55)&&Math.hypot(P.vx,P.vz)>BASE_SPD*1.05&&!CHEAT.noclip&&!(typeof x1Frozen==='function'&&x1Frozen())&&!(typeof DOGQ!=='undefined'&&DOGQ.on)&&!(typeof FIN!=='undefined'&&FIN.on); }
function sldStart(){ if(!sldCan()) return false; const sp=Math.hypot(P.vx,P.vz); SLD.on=true; SLD.t=0; SLD.dx=P.vx/sp; SLD.dz=P.vz/sp; SLD.v0=Math.max(sp,sldSprintSpd())*1.32; SLD.v=SLD.v0;
  SPRINT.on=false; SPRINT.raise=0; try{ SPRINT.st=Math.max(0,SPRINT.st-0.08); }catch(e){}
  try{ Snd.sample('jump_land',{vol:0.45,rate:1.35,prio:1}); Snd.sample('knife_whoosh',{vol:0.3,rate:0.55,prio:1});
    const o=Snd.out(0.65,0,0.15,null); if(o){ const t=Snd.now; Snd.burstTo(o,{t,type:'bandpass',freq:1500,q:0.9,dur:0.72,gain:0.32,attack:0.02}); Snd.burstTo(o,{t,type:'lowpass',freq:420,dur:0.55,gain:0.25,attack:0.01}); } }catch(e){}
  try{ padRumble(0.45,0.2,90); for(let i=1;i<6;i++) setTimeout(()=>{ if(SLD.on) padRumble(0.12,0.22,45); },i*110); }catch(e){}
  return true; }
function sldEnd(){ if(!SLD.on) return; SLD.on=false; SLD.cd=0.55; if(SLD.padCrouch){ IN.crouchT=false; SLD.padCrouch=false; } try{ Snd.step(isOutside(P.pos.x,P.pos.z),false); }catch(e){} }
// gatilho no teclado: apertou agachar correndo
addEventListener('keydown',e=>{ if(e.repeat) return; if((e.code==='KeyC'||e.code==='ControlLeft'||e.code==='ControlRight')&&sldCan()) sldStart(); },true);
// gatilho no controle: ○ alterna o agachar (IN.crouchT); correndo, vira deslizar e no fim levanta sozinho
v9On('always',dt=>{ SLD.cd=Math.max(0,SLD.cd-dt); const ct=!!IN.crouchT; if(ct&&!SLD.ct0&&sldCan()){ if(sldStart()) SLD.padCrouch=true; } SLD.ct0=ct;
  SLD.k+=((SLD.on?1:0)-SLD.k)*Math.min(1,dt*(SLD.on?14:7)); });
// movimento: o embalo do deslize substitui a vontade do jogador (com um pouco de direção)
{ const up0=updatePlayer; updatePlayer=function(dt){ if(!SLD.on) return up0.apply(this,arguments);
    if(P.down||G.state!=='playing'){ sldEnd(); return up0.apply(this,arguments); }
    const x0=P.pos.x, z0=P.pos.z; const jump=IN.edges&&IN.edges.has('jump');
    const r=up0.apply(this,arguments);
    if(jump){ sldEnd(); return r; }   // pulo cancela o deslize (e mantém o embalo)
    SLD.t+=dt; const q=SLD.t/SLD.dur; SLD.v=SLD.v0*Math.exp(-2.1*SLD.t);
    // um pouco de direção: puxa para onde a câmera olha
    const ly=-Math.sin(P.yaw), lz=-Math.cos(P.yaw); const st=Math.min(1,dt*1.4); SLD.dx+=(ly-SLD.dx)*st*0.35; SLD.dz+=(lz-SLD.dz)*st*0.35; const l=Math.hypot(SLD.dx,SLD.dz)||1; SLD.dx/=l; SLD.dz/=l;
    const tx=SLD.dx*SLD.v*dt, tz=SLD.dz*SLD.v*dt; const ex=tx-(P.pos.x-x0), ez=tz-(P.pos.z-z0); const n=Math.ceil(Math.hypot(ex,ez)/0.18)||1;
    for(let i=0;i<n;i++){ P.pos.x+=ex/n; P.pos.z+=ez/n; collide(P.pos,0.36,solidIn,true); }
    P.vx=SLD.dx*SLD.v; P.vz=SLD.dz*SLD.v; P.crouch=Math.max(P.crouch,0.95); P.sprinting=false;
    // poeira nos pés
    SLD.dustT-=dt; if(SLD.dustT<=0){ SLD.dustT=0.05; try{ emit('dust',P.pos.x-SLD.dx*0.3,floorAt(P.pos.x,P.pos.z)+0.08,P.pos.z-SLD.dz*0.3,2,1.2,0.5); }catch(e){} }
    if(q>=1||SLD.v<sldSprintSpd()*0.42) sldEnd();
    return r; }; }
// câmera: abaixa, inclina e abre um pouco o campo de visão
{ const vc0=v9Cam; v9Cam=function(dt){ const r=vc0.apply(this,arguments); if(SLD.k>0.01&&G.state==='playing'){ const k=SLD.k; camera.rotateZ(0.07*k); camera.position.y-=0.1*k; camera.fov+=6*k; camera.updateProjectionMatrix(); } return r; }; }
// arma deitada no deslize
V9VM.push(()=>{ if(SLD.k<0.01) return; const k=SLD.k; vmRoot.rotation.z+=0.28*k; vmRoot.position.y-=0.025*k; vmRoot.position.x-=0.012*k; });
v9On('reset',()=>{ SLD.on=false; SLD.k=0; SLD.cd=0; });
