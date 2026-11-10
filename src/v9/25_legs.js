/* ================= v9 · PERNAS QUEBRADAS =================
   Tiro na perna quebra aquela perna: o zumbi passa a mancar (anda mais devagar, arrasta a perna quebrada e o corpo pende
   para o lado dela). Tiro nas duas pernas: ele desaba no chão e continua vindo se arrastando com os braços, as pernas
   quebradas arrastando atrás (sem arrancar as pernas). Não vale para chefes, cachorros e brutamontes caem só com as duas. */
const _lv=new THREE.Vector3();
function legSide(z,pt){ if(!pt) return Math.random()<0.5?-1:1; const dx=pt.x-z.pos.x, dz=pt.z-z.pos.z; const rx=Math.cos(z.yaw), rz=-Math.sin(z.yaw); return dx*rx+dz*rz>=0?1:-1; }   // +1 = perna direita do zumbi
v9On('hit',(z,part,pt,dir,dmg,s)=>{ if(!z||part!=='legs'||z.dead||z.crawl||z.kind==='dog'||isBossZ(z)||NET.mode==='client'||z.state==='rise') return;
  const side=legSide(z,pt); z.legBroke=z.legBroke||{}; if(z.legBroke[side]) return;
  z.legBroke[side]=true; const both=z.legBroke[1]&&z.legBroke[-1];
  emit('blood',pt?pt.x:z.pos.x,pt?pt.y:0.5,pt?pt.z:z.pos.z,8,2.4,0.6);
  try{ zvoice(z,'pain',1.1); }catch(e){}
  if(both){ z.dropT=1.15; z.stagT=Math.max(z.stagT||0,1.2); }   // primeiro desaba devagar (joelhos cedem, mãos no chão), depois rasteja
  else { z.limp=side; z.limpPh=0; if(!z.limpSpd0){ z.limpSpd0=z.speed; z.speed*=0.42; } z.stagT=Math.max(z.stagT||0,0.6); } });
v9On('frame',dt=>{ for(const z of zombies){ if(!z.dropT||z.dead) continue; z.dropT-=dt; z.stagT=Math.max(z.stagT||0,0.2); if(z.dropT<=0){ z.dropT=0; crawlerize(z,false); z.legL.th.visible=true; z.legR.th.visible=true; z.brokeCrawl=true; z.limp=0; } } });
// pose por cima da animação normal
const _v9anim=animateZombie; animateZombie=function(z,dt){ _v9anim.apply(this,arguments); if(z.dead||z.kind==='dog') return;
  if(z.limp&&!z.crawl&&z.moving&&!z.dropT) z.animT-=dt*(z.runner?11:5.2)*0.55;   // passada mais lenta: o ciclo de andar acompanha o mancar
  try{
    if(z.dropT>0){ // desabando: os joelhos cedem, o tronco tomba para a frente e as mãos vão ao chão
      const k=smooth(clamp(1-z.dropT/1.15,0,1)), aL=z.armL, aR=z.armR;
      z.hips.position.y=0.95-0.77*k; z.spine.rotation.x=1.42*k*k; z.headP.rotation.x=-1.15*k; z.g.rotation.z=Math.sin(k*Math.PI)*0.12*(z.limp||1);
      for(const L of [z.legL,z.legR]){ L.th.rotation.x=-0.9*Math.sin(k*Math.PI*0.5)+1.4*k*k; L.kn.rotation.x=1.6*Math.sin(k*Math.PI)*0.8; }
      aL.sh.rotation.x=-0.6-1.9*k; aR.sh.rotation.x=-0.5-2.0*k; aL.el.rotation.x=-0.3; aR.el.rotation.x=-0.3; return; }
    if(z.brokeCrawl&&z.crawl){ z.g.rotation.z=0; for(const L of [z.legL,z.legR]){ L.th.visible=true; L.th.rotation.x=1.38+Math.sin((z.animT||0)*0.9+(L===z.legL?0:1.5))*0.05; L.th.rotation.z=(L===z.legL?-1:1)*0.1; L.kn.rotation.x=0.12; } return; }
    if(z.limp&&!z.crawl){ const t=z.animT||0, L=z.limp>0?z.legR:z.legL, sw=Math.sin(t);
      // a perna quebrada fica dura e torta, arrastando; o quadril e o tronco caem para o lado dela a cada passo
      L.th.rotation.x=0.15+Math.max(0,sw)*0.25; L.th.rotation.z=z.limp*0.18; L.kn.rotation.x=0.05; if(L.ft) L.ft.rotation.x=0.4;
      z.hips.position.y-=Math.max(0,-sw)*0.09; z.spine.rotation.z+=z.limp*(0.18+Math.max(0,-sw)*0.14); z.g.rotation.z=z.limp*Math.max(0,-sw)*0.06; }
  }catch(e){} };
/* ---- pulando a janela: agarra o parapeito, joga uma perna, passa o tronco e cai do outro lado ---- */
const _v9animC=animateZombie; animateZombie=function(z,dt){ _v9animC.apply(this,arguments); if(z.state!=='climb'||z.dead||z.kind==='dog'||z.crawl){ if(z._clb&&!z.dead){ z._clb=false; z.g.rotation.x=0; } return; } z._clb=true;
  try{ const k=z.climbK||0, aL=z.armL, aR=z.armR, L=z.legL, R=z.legR;
    const grab=k<0.4?smooth(k/0.4):1-smooth(Math.min(1,(k-0.55)/0.3)), over=Math.sin(Math.min(1,Math.max(0,(k-0.3)/0.45))*Math.PI), land=k>0.8?Math.sin((k-0.8)/0.2*Math.PI):0;
    // braços: esticados para a frente e para baixo apoiando no parapeito; depois se abrem para amortecer a queda
    aL.sh.rotation.set(-1.5*grab+0.4*over-0.6*land,0,-0.25-0.2*land); aR.sh.rotation.set(-1.4*grab+0.4*over-0.6*land,0,0.25+0.2*land); aL.el.rotation.x=-0.5*grab; aR.el.rotation.x=-0.6*grab;
    // tronco dobra por cima do parapeito; cabeça olha para baixo
    z.spine.rotation.x=0.25*grab+0.85*over-0.15*land; z.headP.rotation.x=0.3*over+0.2*grab;
    // pernas: uma sobe dobrada (joelho alto), a outra vem depois; na queda, os dois joelhos dobram
    const l1=smooth(Math.min(1,k/0.45))*(1-smooth(Math.max(0,(k-0.6)/0.25))), l2=smooth(Math.min(1,Math.max(0,(k-0.25)/0.35)))*(1-smooth(Math.max(0,(k-0.7)/0.25)));
    L.th.rotation.x=-1.3*l1-0.5*land; L.kn.rotation.x=1.7*l1+1.0*land; R.th.rotation.x=-1.1*l2+0.4*(1-l2)*over-0.5*land; R.kn.rotation.x=1.5*l2+1.0*land;
    z.hips.position.y=0.95-0.25*land; z.g.rotation.x=0.35*over; } catch(e){} };
