/* ================= v9 · DESLIZAR =================
   Correndo, aperte agachar (C / Ctrl · ○ no controle): o personagem desliza no chão com o embalo da corrida, a câmera
   abaixa e inclina, a arma deita um pouco, levanta poeira e faz o som de arrasto. Dá para atirar deslizando.
   Pular no meio do deslize faz o SALTO DE DESLIZE: sai mais alto que o pulo normal e mantém (e aumenta) o embalo no ar.
   No fim, se ainda estiver segurando agachar, continua agachado; senão levanta. Recarga curta entre deslizadas. */
// ajuste fino: boost = velocidade inicial (x corrida), decay = quanto freia por segundo, fim = velocidade (x corrida) em que acaba
const SLDK={boost:1.55,decay:1.15,fim:0.36,jumpVy:6.6,jumpBoost:1.18,airDecay:0.22,airSteer:0.9};
const SLD={on:false,t:0,dur:1.3,dx:0,dz:0,v0:0,v:0,cd:0,k:0,roll:0,ct0:false,kc:false,dustT:0};
function sldSprintSpd(){ try{ return BASE_SPD*abSpeed(G.adren>0?1.35:1)*Mod.speed*v9SpeedK(); }catch(e){ return BASE_SPD*1.5; } }
function sldCan(){ return G.state==='playing'&&!P.down&&P.y<=0.001&&SLD.cd<=0&&!SLD.on&&(SPRINT.on||SPRINT.b>0.55)&&Math.hypot(P.vx,P.vz)>BASE_SPD*1.05&&!CHEAT.noclip&&!(typeof x1Frozen==='function'&&x1Frozen())&&!(typeof DOGQ!=='undefined'&&DOGQ.on)&&!(typeof FIN!=='undefined'&&FIN.on); }
function sldStart(){ if(!sldCan()) return false; const sp=Math.hypot(P.vx,P.vz); SLD.on=true; SLD.t=0; SLD.dx=P.vx/sp; SLD.dz=P.vz/sp; SLD.v0=Math.max(sp,sldSprintSpd())*SLDK.boost; SLD.v=SLD.v0;
  SPRINT.on=false; SPRINT.raise=0; try{ SPRINT.st=Math.max(0,SPRINT.st-0.08); }catch(e){}
  try{ Snd.sample('jump_land',{vol:0.45,rate:1.35,prio:1}); Snd.sample('knife_whoosh',{vol:0.3,rate:0.55,prio:1});
    const o=Snd.out(0.65,0,0.15,null); if(o){ const t=Snd.now; Snd.burstTo(o,{t,type:'bandpass',freq:1500,q:0.9,dur:1.05,gain:0.32,attack:0.02}); Snd.burstTo(o,{t,type:'lowpass',freq:420,dur:0.8,gain:0.25,attack:0.01}); } }catch(e){}
  try{ padRumble(0.45,0.2,90); for(let i=1;i<10;i++) setTimeout(()=>{ if(SLD.on) padRumble(0.12,0.22,45); },i*110); }catch(e){}
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
    if(jump){ sldJump(); return r; }   // salto de deslize
    SLD.t+=dt; const q=SLD.t/SLD.dur; SLD.v=SLD.v0*Math.exp(-SLDK.decay*SLD.t);
    // um pouco de direção: puxa para onde a câmera olha
    const ly=-Math.sin(P.yaw), lz=-Math.cos(P.yaw); const st=Math.min(1,dt*1.4); SLD.dx+=(ly-SLD.dx)*st*0.35; SLD.dz+=(lz-SLD.dz)*st*0.35; const l=Math.hypot(SLD.dx,SLD.dz)||1; SLD.dx/=l; SLD.dz/=l;
    const tx=SLD.dx*SLD.v*dt, tz=SLD.dz*SLD.v*dt; const ex=tx-(P.pos.x-x0), ez=tz-(P.pos.z-z0); const n=Math.ceil(Math.hypot(ex,ez)/0.18)||1;
    for(let i=0;i<n;i++){ P.pos.x+=ex/n; P.pos.z+=ez/n; collide(P.pos,0.36,solidIn,true); }
    P.vx=SLD.dx*SLD.v; P.vz=SLD.dz*SLD.v; P.crouch=Math.max(P.crouch,0.95); P.sprinting=false;
    // poeira nos pés
    SLD.dustT-=dt; if(SLD.dustT<=0){ SLD.dustT=0.05; try{ emit('dust',P.pos.x-SLD.dx*0.3,floorAt(P.pos.x,P.pos.z)+0.08,P.pos.z-SLD.dz*0.3,2,1.2,0.5); }catch(e){} }
    if(q>=1||SLD.v<sldSprintSpd()*SLDK.fim) sldEnd();
    return r; }; }
/* ---- salto de deslize ----
   O pulo normal é bloqueado agachado; aqui o salto sai do deslize com mais altura e o embalo do deslize (com um bônus).
   No ar o embalo quase não freia e dá para virar um pouco com a câmera/direcional; acaba ao tocar o chão ou bater numa parede. */
const SJ={on:false,vx:0,vz:0,air:false};
function sldJump(){ const v=Math.max(SLD.v,sldSprintSpd())*SLDK.jumpBoost, dx=SLD.dx, dz=SLD.dz; sldEnd(); SLD.cd=0.25;
  SJ.on=true; SJ.air=false; SJ.vx=dx*v; SJ.vz=dz*v; P.vx=SJ.vx; P.vz=SJ.vz; P.vy=SLDK.jumpVy; P.crouch=Math.min(P.crouch,0.4);
  try{ Snd.sample('knife_whoosh',{vol:0.35,rate:0.75,prio:1}); Snd.sample('jump_land',{vol:0.3,rate:1.5,prio:1}); padRumble(0.3,0.15,70); }catch(e){}
  try{ emit('dust',P.pos.x,floorAt(P.pos.x,P.pos.z)+0.08,P.pos.z,8,2,0.5); }catch(e){} }
{ const up1=updatePlayer; updatePlayer=function(dt){ if(!SJ.on||SLD.on) return up1.apply(this,arguments);
    if(P.down||G.state!=='playing'||CHEAT.noclip){ SJ.on=false; return up1.apply(this,arguments); }
    const x0=P.pos.x, z0=P.pos.z; P.vx=SJ.vx; P.vz=SJ.vz;
    const r=up1.apply(this,arguments);
    if(P.y>0.001) SJ.air=true; else if(SJ.air||P.vy<=0){ SJ.on=false; return r; }   // pousou: o jogo volta ao controle normal
    // um pouco de controle no ar: vira o embalo para onde o jogador quer ir (direcional) ou para onde olha
    let fx=0,fz=0; if(keys.KeyW||keys.ArrowUp) fz-=1; if(keys.KeyS||keys.ArrowDown) fz+=1; if(keys.KeyA||keys.ArrowLeft) fx-=1; if(keys.KeyD||keys.ArrowRight) fx+=1; fx+=IN.mx||0; fz+=IN.my||0;
    const sp=Math.hypot(SJ.vx,SJ.vz)*Math.exp(-SLDK.airDecay*dt);
    if(Math.hypot(fx,fz)>0.1&&sp>0.01){ const sy=Math.sin(P.yaw), cy=Math.cos(P.yaw); let wx=fx*cy+fz*sy, wz=-fx*sy+fz*cy; const wl=Math.hypot(wx,wz); wx/=wl; wz/=wl;
      const k=Math.min(1,dt*SLDK.airSteer); let dx=SJ.vx/sp+(wx-SJ.vx/sp)*k, dz=SJ.vz/sp+(wz-SJ.vz/sp)*k; const l=Math.hypot(dx,dz)||1; SJ.vx=dx/l*sp; SJ.vz=dz/l*sp; }
    else { const l=Math.hypot(SJ.vx,SJ.vz)||1; SJ.vx=SJ.vx/l*sp; SJ.vz=SJ.vz/l*sp; }
    // garante o deslocamento do embalo (o jogo base freia no ar em direção à velocidade de andar)
    const tx=SJ.vx*dt, tz=SJ.vz*dt, ex=tx-(P.pos.x-x0), ez=tz-(P.pos.z-z0); const n=Math.ceil(Math.hypot(ex,ez)/0.18)||1;
    for(let i=0;i<n;i++){ P.pos.x+=ex/n; P.pos.z+=ez/n; collide(P.pos,0.36,solidIn,true); }
    const mv=Math.hypot(P.pos.x-x0,P.pos.z-z0), want=Math.hypot(tx,tz);
    if(want>1e-4&&mv<want*0.5){ SJ.on=false; P.vx=(P.pos.x-x0)/dt; P.vz=(P.pos.z-z0)/dt; return r; }   // bateu numa parede
    P.vx=SJ.vx; P.vz=SJ.vz; P.sprinting=false; return r; }; }
// câmera: abaixa, inclina e abre um pouco o campo de visão
{ const vc0=v9Cam; v9Cam=function(dt){ const r=vc0.apply(this,arguments); if(SLD.k>0.01&&G.state==='playing'){ const k=SLD.k; camera.rotateZ(0.07*k); camera.position.y-=0.1*k; camera.fov+=6*k; camera.updateProjectionMatrix(); } return r; }; }
// arma deitada no deslize
V9VM.push(()=>{ if(SLD.k<0.01) return; const k=SLD.k; vmRoot.rotation.z+=0.28*k; vmRoot.position.y-=0.025*k; vmRoot.position.x-=0.012*k; });
v9On('reset',()=>{ SLD.on=false; SLD.k=0; SLD.cd=0; SJ.on=false; });
