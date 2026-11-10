/* ================= v9 · FORJA DO AFIADOR: arma no nível máximo fica 5 rodadas na máquina e volta MUITO mais forte ================= */
const FORGE_COST=60000;
function v9AfText(af,s){ const F=G.forge;
  if(F&&F.af===af){ if(F.left>0) return `${(WEAPONS[F.s.id]||{}).name||'Arma'} está na forja · pronta em ${F.left} rodada${F.left>1?'s':''}`; return `${PRESS} para pegar a ${wstat(F.s).name.replace(' ✦ Forjada','')} FORJADA`; }
  if(F) return undefined;
  if(s&&!Wp.knifeOut&&(s.lvl|0)>=MAXLV&&!s.ov) return `${PRESS} para deixar ${wstat(s).name} na forja por 5 rodadas [${price(FORGE_COST)}]`;
  return undefined; }
function v9AfUse(af,s){ const F=G.forge;
  if(F&&F.af===af){ if(F.left>0){ Snd.deny(); flashPrompt(); return true; }
    const sl=F.s; sl.ov=1; const st=wstat(sl); sl.mag=st.mag; sl.reserve=st.reserve; G.forge=null;
    if(Wp.inv.length>=v9Slots()) Wp.inv[Wp.cur]=sl; else { Wp.inv.push(sl); Wp.cur=Wp.inv.length-1; } Wp.knifeOut=false; Wp.swapT=0.6; setGunModel(); hudAmmo();
    banner(st.name.toUpperCase(),'Saiu da forja: dano ×6, pente maior e explosões em cada acerto','gold'); v9Flash('#ffd24a',0.4,0.9); shake(0.4); try{ Snd.reveal(4); Snd.grind(); }catch(e){} forgeVis(af,null); actLog(`{n} pegou a ${st.name} na forja`); return true; }
  if(F) return false;
  if(s&&!Wp.knifeOut&&(s.lvl|0)>=MAXLV&&!s.ov){ if(Wp.upT>0||Wp.drinkT>0) return true; if(!spend(FORGE_COST)) return true;
    const i=Wp.inv.indexOf(s); Wp.inv.splice(i,1); if(!Wp.inv.length) giveWeapon('m1911',0); Wp.cur=clamp(Wp.cur,0,Wp.inv.length-1); setGunModel(); hudAmmo();
    G.forge={s,af,left:5}; forgeVis(af,s); try{ Snd.grind(); }catch(e){} banner('ARMA NA FORJA','Volte em 5 rodadas para buscar — ela vai voltar muito mais forte','gold'); actLog(`{n} deixou a ${wstat(s).name} na forja`); return true; }
  return false; }
function forgeVis(af,s){ if(af.fv){ af.fv.parent&&af.fv.parent.remove(af.fv); af.fv=null; } if(!s) return;
  const g=new THREE.Group(); const m=buildGun(s.id,4); m.scale.setScalar(1.6); g.add(m); const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color:0xffb030,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,opacity:0.7})); gl.scale.set(2.2,1.2,1); g.add(gl);
  g.position.set(af.x,floorAt(af.x,af.z)+2.1,af.z); scene.add(g); af.fv=g; g.userData.gl=gl; }
v9On('roundEnd',()=>{ const F=G.forge; if(!F||F.left<=0) return; F.left--; if(F.left===0){ banner('A FORJA TERMINOU',`${(WEAPONS[F.s.id]||{}).name} está pronta no afiador`,'gold'); try{ Snd.ui('unlock'); }catch(e){} } else toast(`Forja: faltam ${F.left} rodada${F.left>1?'s':''}`); });
v9On('always',dt=>{ const F=G.forge; if(!F||!F.af||!F.af.fv) return; const g=F.af.fv; g.rotation.y+=dt*(F.left>0?0.6:2.2); g.position.y=floorAt(F.af.x,F.af.z)+2.1+Math.sin(G.t*2)*0.06; g.userData.gl.material.opacity=F.left>0?0.35+Math.sin(G.t*4)*0.1:0.8+Math.sin(G.t*9)*0.2;
  if(Math.random()<dt*(F.left>0?8:20)) emit('spark',F.af.x+rand(-0.4,0.4),floorAt(F.af.x,F.af.z)+1.6,F.af.z+rand(-0.3,0.3),2,3,0.4,6); });
v9On('reset',()=>{ if(G.forge&&G.forge.af) forgeVis(G.forge.af,null); G.forge=null; for(const af of AFS) forgeVis(af,null); });
/* arma forjada brilha em dourado intenso na mão */
v9On('fire',(s,d)=>{ if(s.ov){ worldFlash.color.setHex(0xffc030); } });
