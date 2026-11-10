/* ================= v9 · HABILIDADES: mãos, efeitos e sons =================
   Algumas habilidades abaixam a arma e mostram as mãos do personagem fazendo o gesto (palma pra frente, punhos, apontar),
   com fogo, raios ou brilho em volta. No mundo, cada uma ganha um efeito próprio (labaredas, descargas, esferas de cura).
   Também liga as amostras de som do padre, da médica, do choque, do fogo, do grunhido de dor e do clique de menu. */
const HFX={on:false,t:0,dur:1,c:null,ult:false,g:null,hands:null,parts:[],arcs:[],glow:null,light:null,kind:''};
const HFX_GESTURE={
  tomas:{a:{dur:1.05,pose:'palmR',fx:'fire'},u:{dur:1.5,pose:'palms',fx:'fire'}},
  helena:{a:{dur:0.95,pose:'cupped',fx:'heal'},u:{dur:1.25,pose:'down',fx:'heal'}},
  viktor:{u:{dur:1.3,pose:'palms',fx:'elec'}},
  moreira:{a:{dur:0.75,pose:'punch',fx:'dust'},u:{dur:1.2,pose:'fists',fx:'fire'}},
  iara:{a:{dur:0.85,pose:'point',fx:'mark'}},
  recruta:{u:{dur:1.0,pose:'signal',fx:'mark'}},
  _fin:{a:{dur:0.85,pose:'grab',fx:'none'}}   // finalização do golpe pesado: a mão esquerda agarra a cabeça do zumbi
};
const HFX_COL={fire:0xff8a2a,heal:0x6affb5,elec:0x6ae8ff,dust:0xffb070,mark:0xff9a59,none:0xffffff};
let hfxFlameTex=null;
function hfxTex(){ if(hfxFlameTex) return hfxFlameTex; hfxFlameTex=tex(64,64,(c,w,h)=>{ const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2); g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.25,'rgba(255,255,255,.8)'); g.addColorStop(0.6,'rgba(255,255,255,.22)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.fillRect(0,0,w,h); }); return hfxFlameTex; }
function hfxBuild(){ if(HFX.g) return; const g=new THREE.Group(); g.visible=false; vmScene.add(g); HFX.g=g;
  const R=makeHand(false,[0.15,0.1,0.05]), L=makeHand(true,[0.15,0.1,0.05]); g.add(R,L); HFX.hands={R,L};
  HFX.light=new THREE.PointLight(0xff8a2a,0,1.2,2); g.add(HFX.light);
  const sm=new THREE.SpriteMaterial({map:hfxTex(),color:0xff8a2a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  for(let i=0;i<34;i++){ const s=new THREE.Sprite(sm.clone()); s.visible=false; g.add(s); HFX.parts.push({s,t:0,life:0,v:new THREE.Vector3(),h:null}); }
  for(let i=0;i<4;i++){ const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(10*3),3)); const l=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xbff6ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false})); l.visible=false; g.add(l); HFX.arcs.push(l); }
}
function hfxCurl(h,c){ const f=h.userData.fingers; for(let i=0;i<4;i++){ const cc=Array.isArray(c[0])?c[i]:c; for(let k=0;k<3;k++) f[i][k].rotation.x=-(cc[k]||0); } }
function hfxStart(c,ult){ const G2=HFX_GESTURE[c]; const d=G2&&G2[ult?'u':'a']; if(!d) return; hfxBuild();
  Object.assign(HFX,{on:true,t:0,dur:d.dur,c,ult,pose:d.pose,kind:d.fx});
  const col=HFX_COL[d.fx]; HFX.light.color.setHex(col); for(const p of HFX.parts){ p.s.material.color.setHex(col); p.s.visible=false; p.life=0; }
  const open=[0.12,0.08,0.04], fist=[1.55,1.5,1.2], cup=[0.55,0.45,0.3];
  const {R,L}=HFX.hands; R.visible=L.visible=true;
  if(d.pose==='palmR'){ hfxCurl(R,open); L.visible=false; }
  else if(d.pose==='palms'||d.pose==='down'){ hfxCurl(R,open); hfxCurl(L,open); }
  else if(d.pose==='cupped'){ hfxCurl(R,cup); hfxCurl(L,cup); }
  else if(d.pose==='punch'){ hfxCurl(R,fist); L.visible=false; }
  else if(d.pose==='fists'){ hfxCurl(R,fist); hfxCurl(L,fist); }
  else if(d.pose==='grab'){ hfxCurl(L,[0.2,0.15,0.1]); R.visible=false; }
  else if(d.pose==='point'||d.pose==='signal'){ hfxCurl(L,[[0.05,0.05,0],fist,fist,fist]); R.visible=false; }
}
function hfxHand(h,x,y,z,rx,ry,rz){ h.position.set(x*1.3,y*1.15,z*1.4); h.rotation.set(rx,ry,rz); }
const _hv=new THREE.Vector3();
function hfxFrame(dt){ if(!HFX.on||!HFX.g) return; HFX.t+=dt; const k=HFX.t/HFX.dur; if(k>=1||P.down||G.state!=='playing'){ HFX.on=false; HFX.g.visible=false; HFX.light.intensity=0; return; }
  HFX.g.visible=true; const up=smooth(clamp(k/0.22,0,1))*(1-smooth(clamp((k-0.78)/0.22,0,1))), y0=-0.42, act=Math.sin(clamp((k-0.15)/0.6,0,1)*Math.PI), {R,L}=HFX.hands, t=HFX.t;
  const pose=HFX.pose, bob=Math.sin(t*9)*0.004;
  if(pose==='palmR') hfxHand(R,0.07,lerp(y0,-0.1,up)+bob,-0.32-act*0.08,-0.15,-0.25,0.12);
  else if(pose==='palms'){ hfxHand(R,0.11,lerp(y0,-0.08,up)+bob,-0.34-act*0.06,-0.1,-0.35,0.2); hfxHand(L,-0.11,lerp(y0,-0.08,up)-bob,-0.34-act*0.06,-0.1,0.35,-0.2); }
  else if(pose==='down'){ hfxHand(R,0.1,lerp(y0,-0.17,up),-0.3,-1.25+act*0.3,-0.2,0.1); hfxHand(L,-0.1,lerp(y0,-0.17,up),-0.3,-1.25+act*0.3,0.2,-0.1); }
  else if(pose==='cupped'){ hfxHand(R,0.05,lerp(y0,-0.15,up)+bob,-0.3,-0.9,-0.6,0.9); hfxHand(L,-0.05,lerp(y0,-0.15,up)+bob,-0.3,-0.9,0.6,-0.9); }
  else if(pose==='punch'){ const p=smooth(clamp((k-0.2)/0.18,0,1))*(1-smooth(clamp((k-0.5)/0.4,0,1))); hfxHand(R,0.1-p*0.06,lerp(y0,-0.14,up)+p*0.03,-0.24-p*0.26,-1.45,0,-0.15); }
  else if(pose==='fists'){ const sh=Math.sin(t*40)*0.004*act; hfxHand(R,0.1+sh,lerp(y0,-0.12,up),-0.3,-1.35,-0.2,0.2); hfxHand(L,-0.1-sh,lerp(y0,-0.12,up),-0.3,-1.35,0.2,-0.2); }
  else if(pose==='grab'){ const g=smooth(clamp((k-0.12)/0.25,0,1)); hfxHand(L,-0.05+g*0.04,lerp(y0,-0.02,up),-0.3-g*0.06,-0.35-g*0.3,0.35,-0.5); hfxCurl(L,[0.2+g*0.9,0.15+g*0.8,0.1+g*0.6]); }
  else if(pose==='point'||pose==='signal'){ hfxHand(L,-0.06,lerp(y0,-0.1,up),-0.34-act*0.04,-0.2+(pose==='signal'?Math.sin(t*12)*0.15*act:0),0.3,-0.25); }
  // brilho e partículas saindo das palmas
  const hs=[R,L].filter(h=>h.visible); HFX.light.intensity=HFX.kind==='none'?0:up*(1.6+Math.sin(t*25)*0.4); hs[0].getWorldPosition(_hv); HFX.g.worldToLocal(_hv); HFX.light.position.copy(_hv).add(new THREE.Vector3(0,0.05,-0.05));
  const kind=HFX.kind; const rate=kind==='elec'||kind==='none'?0:kind==='dust'?40:70;
  HFX.acc=(HFX.acc||0)+dt*rate*up; while(HFX.acc>=1){ HFX.acc--; const p=HFX.parts.find(q=>q.life<=0); if(!p) break; const h=pick(hs); h.getWorldPosition(_hv); HFX.g.worldToLocal(_hv);
    p.s.position.set(_hv.x+rand(-0.03,0.03),_hv.y+rand(0.0,0.06),_hv.z+rand(-0.03,0.03)); p.life=p.t=rand(0.25,0.5); p.sz=kind==='fire'?rand(0.04,0.08):rand(0.025,0.05);
    if(kind==='fire') p.v.set(rand(-0.05,0.05),rand(0.25,0.45),rand(-0.12,-0.02)); else if(kind==='heal') p.v.set(Math.cos(t*7+p.sz*99)*0.12,rand(0.1,0.25),Math.sin(t*7+p.sz*99)*0.12); else p.v.set(rand(-0.15,0.15),rand(-0.05,0.15),rand(-0.3,-0.1));
    p.s.visible=true; }
  for(const p of HFX.parts){ if(p.life<=0) continue; p.life-=dt; const a=Math.max(0,p.life/p.t); p.s.position.addScaledVector(p.v,dt); p.s.material.opacity=a*(kind==='fire'?0.9:0.7); const sz=p.sz*(kind==='fire'?(0.6+a*0.6):1); p.s.scale.set(sz,sz*(kind==='fire'?1.5:1),1);
    if(kind==='fire') p.s.material.color.setHSL(0.03+a*0.08,1,0.45+a*0.2); if(p.life<=0) p.s.visible=false; }
  // raios entre os dedos e pra frente (Viktor)
  for(let i=0;i<HFX.arcs.length;i++){ const l=HFX.arcs[i]; const on=kind==='elec'&&up>0.3&&Math.random()<0.75; l.visible=on; if(!on) continue;
    const a=new THREE.Vector3(), b=new THREE.Vector3(); R.getWorldPosition(a); L.getWorldPosition(b); HFX.g.worldToLocal(a); HFX.g.worldToLocal(b); a.y+=0.05; b.y+=0.05;
    if(i>=2){ b.copy(a).lerp(b,0.5); b.z-=rand(0.6,1.2); b.x+=rand(-0.3,0.3); b.y+=rand(-0.1,0.2); }
    const pa=l.geometry.attributes.position; for(let j=0;j<10;j++){ const f=j/9; pa.setXYZ(j,lerp(a.x,b.x,f)+(j&&j<9?rand(-0.02,0.02):0),lerp(a.y,b.y,f)+(j&&j<9?rand(-0.025,0.025):0),lerp(a.z,b.z,f)+(j&&j<9?rand(-0.02,0.02):0)); } pa.needsUpdate=true; l.material.opacity=0.6+Math.random()*0.4; }
  HFX.down=up; }
V9VM.push(dt=>{ hfxFrame(dt);
  // enquanto as mãos da habilidade estão na tela, a arma e os braços dela somem (antes ficavam os dois pares de braços sobrepostos)
  const hide=HFX.on&&HFX.pose!=='grab'&&(HFX.down||0)>0.02; if(hide){ if(vmRoot.visible){ vmRoot.visible=false; HFX.hid=true; } } else if(HFX.hid){ vmRoot.visible=true; HFX.hid=false; }
  if(!HFX.on||HFX.pose==='grab') return; const d=HFX.down||0; vmRoot.position.y-=d*0.42; vmRoot.rotation.x-=d*0.55; vmRoot.position.x+=d*0.08; });
// a arma está abaixada: não atira nem mira enquanto as mãos estão na tela
const _busyHfx=busy; busy=function(){ return _busyHfx()||(HFX.on&&HFX.pose!=='grab'&&HFX.t>0.05&&HFX.t<HFX.dur-0.15); };

/* ---- efeitos no mundo ---- */
const WFX=[]; let wfxMat=null;
function wfxBurst(x,z,col,n,r,up,life,sz){ if(!wfxMat) wfxMat=new THREE.SpriteMaterial({map:hfxTex(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
  const y=floorAt(x,z); for(let i=0;i<n;i++){ if(WFX.length>140) break; const s=new THREE.Sprite(wfxMat.clone()); s.material.color.setHex(col); const a=rand(0,6.28), rr=Math.sqrt(Math.random())*r; s.position.set(x+Math.cos(a)*rr,y+rand(0.1,0.6),z+Math.sin(a)*rr); scene.add(s);
    WFX.push({s,t:0,life:life*rand(0.7,1.2),v:new THREE.Vector3(Math.cos(a)*rand(0.2,1),up*rand(0.6,1.4),Math.sin(a)*rand(0.2,1)),sz:sz*rand(0.7,1.3),fire:col===0xff8a2a}); } }
function wfxRing(x,z,col,r,n,sz){ const y=floorAt(x,z); for(let i=0;i<n;i++){ if(WFX.length>160) break; if(!wfxMat) wfxBurst(x,z,col,0,0,0,0,0); const s=new THREE.Sprite(wfxMat.clone()); s.material.color.setHex(col); const a=i/n*6.283; s.position.set(x+Math.cos(a)*0.6,y+0.25,z+Math.sin(a)*0.6); scene.add(s);
    WFX.push({s,t:0,life:0.7,v:new THREE.Vector3(Math.cos(a)*r/0.7,0.4,Math.sin(a)*r/0.7),sz,fire:col===0xff8a2a}); } }
function wfxBolt(x,z){ try{ const top=new THREE.Vector3(x+rand(-1,1),floorAt(x,z)+9,z+rand(-1,1)), bot=new THREE.Vector3(x,floorAt(x,z)+0.2,z); arcFx(top,bot); }catch(e){} }
v9On('always',dt=>{ for(let i=WFX.length-1;i>=0;i--){ const q=WFX[i]; q.t+=dt; const a=1-q.t/q.life; if(a<=0){ scene.remove(q.s); q.s.material.dispose(); WFX.splice(i,1); continue; }
  q.s.position.addScaledVector(q.v,dt); q.v.multiplyScalar(1-dt*1.5); if(q.fire){ q.v.y+=dt*1.6; q.s.material.color.setHSL(0.02+a*0.09,1,0.4+a*0.25); } q.s.material.opacity=Math.min(1,a*1.6)*0.85; const s=q.sz*(q.fire?0.5+a*0.7:1); q.s.scale.set(s,s*(q.fire?1.6:1),1); } });
v9On('reset',()=>{ for(const q of WFX){ scene.remove(q.s); q.s.material.dispose(); } WFX.length=0; HFX.on=false; if(HFX.g) HFX.g.visible=false; });
function abWorldFx(kind,x,z,ch){ try{
  if(kind==='holy'){ wfxRing(x,z,0xff8a2a,AB_CFG.tomas.range*0.9,26,0.9); wfxBurst(x,z,0xffdf8a,14,1.2,2.4,0.9,0.7); }
  else if(kind==='exo'){ wfxBurst(x,z,0xff8a2a,30,AB_CFG.tomas.auraR,2.2,1.1,0.9); wfxRing(x,z,0xffdf8a,AB_CFG.tomas.auraR,30,0.7); }
  else if(kind==='emp'){ wfxRing(x,z,0x6ae8ff,AB_CFG.viktor.empR,32,0.6); for(let i=0;i<4;i++) setTimeout(()=>wfxBolt(x+rand(-4,4),z+rand(-4,4)),i*90); }
  else if(kind==='ha'||kind==='hf'){ wfxBurst(x,z,0x6affb5,kind==='hf'?30:16,kind==='hf'?AB_CFG.helena.fieldR:1.5,1.4,1.3,0.45); }
  else if(kind==='shove'){ wfxRing(x,z,0xffb070,AB_CFG.moreira.range,20,0.8); }
  else if(kind==='ult'&&ch==='moreira'){ wfxBurst(x,z,0xff8a2a,26,1.4,2.8,1.0,0.8); }
  else if(kind==='mark'){ wfxBurst(x,z,0xff9a59,10,0.8,1.6,0.7,0.35); }
}catch(e){} }

/* ---- sons ---- */
const V9SFX={ch:null,ultH:null,ultEnd:0,hurtT:0,teslaT:0};
const _abUse=abUse; abUse=function(){ const c=abc(), before=AB.cd; V9SFX.ch=c; try{ return _abUse.apply(this,arguments); }finally{ V9SFX.ch=null; if(before<=0&&AB.cd>0) hfxStart(c,false); } };
const _abUlt=abUlt; abUlt=function(){ const c=abc(), u0=AB.ult; V9SFX.ch=c; try{ return _abUlt.apply(this,arguments); }finally{ V9SFX.ch=null; if(u0>=100&&AB.ult===0){ hfxStart(c,true); } } };
const _abOnEv=abOnEv; abOnEv=function(peer,kind,x,z,ch,info){ const prev=V9SFX.ch; V9SFX.ch=CHARS[ch]?ch:prev; try{ return _abOnEv.apply(this,arguments); }finally{ V9SFX.ch=prev; if(!(peer&&String(peer)===String(NET.me))) abWorldFx(kind,x,z,ch); } };
// os efeitos no mundo de quem usa a habilidade (o próprio jogador) passam pelo abSend → abOnEv com peer = eu, que retorna cedo: chamamos aqui
const _abSend=abSend; abSend=function(kind,x,z,info){ try{ abWorldFx(kind,x,z,abc()); }catch(e){} return _abSend.apply(this,arguments); };
const _sAbil=Snd.abil.bind(Snd);
Snd.abil=function(k,x,z){ const ch=V9SFX.ch, o=x!=null?{x,z,range:45,minVol:0.15}:{prio:true};
  try{
    if(k==='holy'&&ch==='tomas'&&!(V9SFX.ultH&&!V9SFX.ultH.dead)){ if(Snd.sample('padre_ability',Object.assign({vol:0.95},o))) return; }
    if(k==='ult'&&ch==='tomas'){ const h=Snd.sample('padre_ult',Object.assign({vol:0.9},o)); if(h){ if(V9SFX.ultH) V9SFX.ultH.stop(0.3); V9SFX.ultH=h; V9SFX.ultEnd=performance.now()/1000+(AB_CFG.tomas.auraT||8)+0.4; V9SFX.ultLocal=x==null; return; } }
    if(k==='ult'&&ch==='helena'){ if(Snd.sample('medic_ult',Object.assign({vol:0.95},o))) return; }
    if(k==='ult'&&ch==='moreira') Snd.sample('fire_burst',Object.assign({vol:0.8},o));
    if(k==='emp'){ Snd.sample('elec_zap',Object.assign({vol:0.9},o)); }
    if(k==='tesla'){ const n=performance.now(); if(n-V9SFX.teslaT>260){ V9SFX.teslaT=n; Snd.sample('elec_zap',Object.assign({vol:0.35,rate:rand(1.1,1.4)},o)); } }
    if(k==='end'&&V9SFX.ultH&&V9SFX.ultLocal){ V9SFX.ultH.stop(1.4); V9SFX.ultH=null; }
  }catch(e){}
  return _sAbil(k,x,z); };
v9On('always',()=>{ const h=V9SFX.ultH; if(!h) return; const n=performance.now()/1000; if(h.dead){ V9SFX.ultH=null; return; }
  if((V9SFX.ultLocal&&AB.ultAct<=0&&n>V9SFX.ultEnd-((AB_CFG.tomas.auraT||8)-0.6))||n>V9SFX.ultEnd||G.state==='menu'){ h.stop(1.4); V9SFX.ultH=null; } });
const _sHurt=Snd.hurt.bind(Snd); Snd.hurt=function(){ _sHurt(); const n=performance.now(); if(n-V9SFX.hurtT>650&&Math.random()<0.55){ V9SFX.hurtT=n; try{ Snd.sample('hurt_grunt',{vol:0.6,rate:rand(0.92,1.08),prio:true}); }catch(e){} } };
const _sUi=Snd.ui; Snd.ui=function(k){ if(k==='tab'||k==='select'||k==='confirm'||k==='back'){ try{ if(Snd.sample('ui_click',{vol:k==='tab'?0.45:0.6,rate:k==='back'?0.85:k==='confirm'?1.1:1,master:true,wet:0})&&k==='tab') return; }catch(e){} } return _sUi(k); };
// fogo: quando o padre ou a fúria incendeiam zumbis, um "fuuump" de vez em quando
let v9IgnT=0; const _ign=igniteZ; igniteZ=function(z){ const r=_ign.apply(this,arguments); const n=performance.now(); if(n-v9IgnT>700&&z&&z.pos){ v9IgnT=n; try{ Snd.sample('fire_burst',{vol:0.35,x:z.pos.x,z:z.pos.z,range:30,rate:rand(1.1,1.3)}); }catch(e){} } return r; };
