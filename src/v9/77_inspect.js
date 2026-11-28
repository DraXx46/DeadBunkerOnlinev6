/* ================= v9 · INSPECIONAR A ARMA (T) =================
   T levanta a arma, vira um lado para a câmera, gira para o outro e volta, com o mundo levemente desfocado atrás
   (a arma e as mãos continuam nítidas). Atirar, mirar, recarregar, trocar de arma, correr ou tomar dano cancela. */
const INS={on:false,t:0,dur:3.3,k:0,slot:null,snd:0};
// quadros-chave: [tempo 0..1, x, y, z, rx, ry, rz]  (soma na pose da arma; as mãos seguem a arma)
const INS_KF=[[0,0,0,0,0,0,0],[0.16,-0.035,0.03,0.05,0.16,0.95,0.5],[0.43,-0.045,0.036,0.056,0.22,1.06,0.58],[0.6,0.018,0.022,0.042,-0.08,-0.62,-0.85],[0.8,0.026,0.026,0.046,-0.12,-0.72,-0.98],[1,0,0,0,0,0,0]];
const insEase=u=>u<0.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2;
function insSample(k,out){ let i=1; while(i<INS_KF.length-1&&INS_KF[i][0]<k) i++; const a=INS_KF[i-1], b=INS_KF[i]; const u=insEase(Math.min(1,Math.max(0,(k-a[0])/((b[0]-a[0])||1))));
  for(let j=1;j<7;j++) out[j-1]=a[j]+(b[j]-a[j])*u; return out; }
function insCan(){ const s=curSlot(); return G.state==='playing'&&s&&!P.down&&!Wp.knifeOut&&!Wp.reloading&&Wp.swapT<=0&&!Wp.scoped&&P.ads<0.05&&!P.sprinting&&!(WEAPONS[s.id]&&WEAPONS[s.id].sprite)&&!(typeof FIN!=='undefined'&&FIN.on); }
function insStart(){ if(INS.on||!insCan()) return; INS.on=true; INS.t=0; INS.slot=curSlot(); INS.snd=0; try{ Snd.sample('rl_slide',{vol:0.18,rate:0.85}); }catch(e){} }
function insStop(){ INS.on=false; }
addEventListener('keydown',e=>{ if(e.code!=='KeyT'||e.repeat||CON.open||(typeof CHAT!=='undefined'&&CHAT.open)) return; if(G.state!=='playing') return; if(INS.on) insStop(); else insStart(); });
const INS_O=[0,0,0,0,0,0];
{ const vf0=vmaFrame; vmaFrame=function(dt){ const r=vf0.apply(this,arguments);
    try{ if(INS.on){ const s=curSlot(); if(!insCan()||s!==INS.slot||IN.fire||IN.ads||VMA.on) insStop(); }
      if(INS.on){ INS.t+=dt||0; const k=INS.t/INS.dur; if(k>=1) insStop(); else { insSample(k,INS_O);
          // respiração leve enquanto segura parado
          const br=Math.sin(INS.t*2.1)*0.0025; const g=VMA.gun||(VMA.gun={x:0,y:0,z:0,rx:0,ry:0,rz:0});
          g.x=(g.x||0)+INS_O[0]; g.y=(g.y||0)+INS_O[1]+br; g.z=(g.z||0)+INS_O[2]; g.rx=(g.rx||0)+INS_O[3]; g.ry=(g.ry||0)+INS_O[4]; g.rz=(g.rz||0)+INS_O[5];
          if(k>0.52&&INS.snd<1){ INS.snd=1; try{ Snd.sample('rl_arm',{vol:0.14,rate:1.1}); }catch(e){} } } } }catch(e){ INS.on=false; }
    return r; }; }
// cancela ao levar dano
{ const hp0=hurtPlayer; hurtPlayer=function(){ if(INS.on) insStop(); return hp0.apply(this,arguments); }; }
// desfoque do mundo e mira escondida enquanto inspeciona
v9On('always',dt=>{ const ck=typeof chkBlur==='function'?chkBlur():0; const want=INS.on?Math.sin(Math.min(1,INS.t/INS.dur)*Math.PI)*1.6:ck; const tg=Math.min(1,want)*0.85;
  V9BLUR.k+=(tg-V9BLUR.k)*Math.min(1,(dt||0.016)*(ck>0?4:8)); if(V9BLUR.k<0.002&&!INS.on&&!ck) V9BLUR.k=0;
  document.body.classList.toggle('v9insp',INS.on||ck>0); });
v9Css(`body.v9insp #cross{visibility:hidden!important}`);
try{ const i=KB_ACT.findIndex(a=>a[0]==='KeyF'); KB_ACT.splice(i+1,0,['KeyT','Inspecionar a arma']); kbRender(); }catch(e){}
CMDS.inspecionar={d:'inspecionar · inspeciona a arma atual (o mesmo que T)',f:()=>insStart()};
