/* ================= v9 · EXPLOSÃO AO RENASCER =================
   Quando o jogador volta de morto (nova rodada no cooperativo, auto-reviver no solo, Soro da Vida), sai uma onda de
   choque de onde ele está: pouco dano, mas joga os zumbis em volta para longe e deixa todos atordoados um instante.
   Não acontece quando o parceiro te levanta, nem na Arena X1. No online quem aplica é o anfitrião (mensagem 'rsb'). */
const RSB={R:7,force:60,stag:1.6,last:0,lastSt:'',wasSrev:false,pend:-1};
const rsbDmg=()=>Math.round(40+(G.round|0)*8);   // pouco dano: só derruba os mais fracos de perto
function rsbApply(x,z,shooter){ const dmg=rsbDmg();
  for(const q of zlist()){ if(q.dead||q.ghost) continue; const dx=q.pos.x-x, dz=q.pos.z-z, d=Math.hypot(dx,dz); if(d>=RSB.R) continue;
    const ux=d>0.05?dx/d:Math.cos(Math.random()*6.28), uz=d>0.05?dz/d:Math.sin(Math.random()*6.28), k=1-d/RSB.R;
    const boss=q.bossKi!=null, heavy=boss||q.kind==='brute', f=(RSB.force*k+8)*(boss?0.25:heavy?0.55:1);
    try{ zHitReact(q,dx,dz,dmg*2,'body','splash'); }catch(e){}
    try{ damageZombie(q,dmg*(0.5+0.5*k),'body','splash',null,shooter||null); }catch(e){}
    // o empurrão vem DEPOIS do dano: a reação normal de tiro limita o empurrão a 3,2 m/s e apagaria este
    if(q.dead&&q.state!=='dying') continue; q.kbx=ux*f; q.kbz=uz*f; q.stagT=Math.max(q.stagT||0,RSB.stag*(heavy?0.5:1)); q.attackT=0; q.hitDone=false; } }
function rsbFx(x,z){ try{ explodeFx({x,y:0.2,z},RSB.R*0.55); }catch(e){}
  try{ emit('dust',x,0.25,z,40,9,1.4,1); emit('spark',x,1,z,30,7,0.6,0); }catch(e){}
  try{ padRumble(0.9,0.6,320); }catch(e){} }
function rsbFire(){ const x=P.pos.x, z=P.pos.z; rsbFx(x,z);
  if(NET.mode==='client'){ netAct(['rsb',r10(x),r10(z)]); return; }
  rsbApply(x,z,null); pushEv(['rsb',r10(x),r10(z),NET.me||'']); }
V9NET.act.rsb=(peer,a)=>{ const x=(+a[2]||0)/10, z=(+a[3]||0)/10; rsbFx(x,z); rsbApply(x,z,peer); pushEv(['rsb',a[2],a[3],peer]); };
V9NET.ev.rsb=(e,me)=>{ if(e[4]!==me) rsbFx((+e[2]||0)/10,(+e[3]||0)/10); };
// detecta a volta: morto (2) -> de pé, ou o auto-reviver terminando. Espera um instante (o Soro/rodada nova reposiciona antes)
v9On('frame',dt=>{ const st=G.state, d=P.down|0;
  const x1=(typeof x1Live==='function'&&x1Live())||CUR==='x1';
  if(st==='playing'&&RSB.lastSt==='playing'&&d===0&&!x1&&(RSB.last===2||(RSB.last===1&&RSB.wasSrev))) RSB.pend=0.12;
  RSB.last=d; RSB.lastSt=st; RSB.wasSrev=!!(typeof SREV!=='undefined'&&SREV.on);
  if(RSB.pend>=0){ RSB.pend-=dt; if(RSB.pend<0&&G.state==='playing'&&!P.down) rsbFire(); } });
v9On('reset',()=>{ RSB.pend=-1; RSB.last=0; });
CMDS.renascer_fx={cheat:1,d:'renascer_fx · solta a explosão de renascer onde você está (teste)',f:()=>{ rsbFire(); cprint('explosão de renascer: '+rsbDmg()+' de dano, raio '+RSB.R+' m'); }};
