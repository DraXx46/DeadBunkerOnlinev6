/* ================= v9 · PESO DAS ARMAS: BARRETT, GLOCK E VOLUME DAS VOZES =================
   Barrett M107:
   - Luneta com animação própria: a borda escura do tubo fecha sobre a tela enquanto o olho encosta,
     o retículo de mil-dots entra desfocado e gira de leve até alinhar; ao terminar, um ajuste de foco curto.
   - Tiro pela luneta: a imagem pula para cima e treme antes de sair da mira.
   - Tiro sem luneta: coice enorme (câmera sobe, o ombro é empurrado para trás, tela treme), com retorno parcial.
   Glock: mais recuo e um tranco visível na mão. Vozes dos personagens mais altas. */
WEAPONS.m1911.recoil=0.032;

v9Css(`
#bscope{position:absolute;inset:0;pointer-events:none;z-index:4;display:none;--o:0;--k:0;--f:0;--R:min(46vh,46vw)}
#bscope.on{display:block}
#bscope .tube{position:absolute;inset:-12%;transform:translate(calc(var(--k)*0px),calc(var(--k)*-4.5vh)) rotate(calc(var(--k)*-1.25deg)) scale(calc(1 + (1 - var(--o))*.35));
  background:radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 0,rgba(0,0,0,0) calc(var(--R) + (1 - var(--o))*95vmax - 30px),rgba(8,10,12,.7) calc(var(--R) + (1 - var(--o))*95vmax - 8px),#030405 calc(var(--R) + (1 - var(--o))*95vmax),#030405 100%)}
#bscope .glass{position:absolute;left:50%;top:50%;width:calc(var(--R)*2);height:calc(var(--R)*2);margin:calc(var(--R)*-1) 0 0 calc(var(--R)*-1);border-radius:50%;
  transform:translateY(calc(var(--k)*-4.5vh)) rotate(calc(var(--k)*-1.25deg));
  backdrop-filter:blur(calc((1 - var(--o))*7px + var(--f)*3px + var(--k)*2.5px));-webkit-backdrop-filter:blur(calc((1 - var(--o))*7px + var(--f)*3px + var(--k)*2.5px));
  background:radial-gradient(circle at 38% 34%,rgba(160,210,255,.10) 0,rgba(0,0,0,0) 30%),radial-gradient(circle at 50% 50%,rgba(0,0,0,0) 60%,rgba(20,40,60,.35) 96%);
  box-shadow:inset 0 0 0 2px rgba(0,0,0,.85),inset 0 0 40px 8px rgba(0,0,0,.55)}
#bscope .ret{position:absolute;inset:0;border-radius:50%;opacity:calc(var(--o)*var(--o));transform:rotate(calc((1 - var(--o))*24deg)) scale(calc(1.25 - var(--o)*.25))}
#bscope .ret i{position:absolute;background:#050505}
#bscope .ret .h{left:0;right:0;top:50%;height:2px;margin-top:-1px;background:linear-gradient(90deg,#050505 0 30%,rgba(5,5,5,.9) 30% 48%,transparent 48% 52%,rgba(5,5,5,.9) 52% 70%,#050505 70%)}
#bscope .ret .v{top:0;bottom:0;left:50%;width:2px;margin-left:-1px;background:linear-gradient(180deg,#050505 0 30%,rgba(5,5,5,.9) 30% 48%,transparent 48% 52%,rgba(5,5,5,.9) 52% 70%,#050505 70%)}
#bscope .ret .md{width:5px;height:5px;border-radius:50%;margin:-2.5px 0 0 -2.5px}
#bscope .ret .c{left:50%;top:50%;width:4px;height:4px;margin:-2px 0 0 -2px;border-radius:50%;background:#e01a10;box-shadow:0 0 6px #ff3020}
#bscope .txt{position:absolute;left:50%;bottom:calc(50% - var(--R) + 7%);transform:translateX(-50%);font:600 10px/1 var(--f-type,monospace);letter-spacing:.22em;color:rgba(255,190,120,.75);opacity:var(--o);text-shadow:0 0 4px rgba(0,0,0,.9)}
body.barscope #scope{display:none!important}
`);
{ const hud=document.getElementById('scope')?.parentElement||document.body; const b=document.createElement('div'); b.id='bscope';
  let dots=''; for(let i=1;i<=4;i++){ const p=50+i*4.5, m=50-i*4.5; dots+=`<i class="md" style="left:${p}%;top:50%"></i><i class="md" style="left:${m}%;top:50%"></i><i class="md" style="left:50%;top:${p}%"></i><i class="md" style="left:50%;top:${m}%"></i>`; }
  b.innerHTML=`<div class="tube"></div><div class="glass"><div class="ret"><i class="h"></i><i class="v"></i>${dots}<i class="c"></i></div><div class="txt">M107 · .50 BMG</div></div>`;
  hud.appendChild(b); }

const HV={kick:0, post:0, wasScoped:false, focus:0, vm:0, recov:0, recovLeft:0, glock:0, shove:0, last:false};
v9On('fire',(s,d)=>{
  if(s.id==='ptrs'){
    if(HV.wasScoped){ HV.kick=1; HV.post=0.32; shake(0.22); try{ padRumble(1,0.9,220); }catch(e){} }
    else{ // sem luneta: o coice da .50 joga a arma e a câmera
      const k=1-P.crouch*0.35; P.pitch=clamp(P.pitch+0.075*k,-1.45,1.45); P.yaw+=rand(-1,1)*0.0225*k;
      HV.recovLeft=0.075*k*0.55; HV.vm=1; HV.shove=1; shake(0.55); try{ padRumble(1,1,320); }catch(e){} v9Flash('#ffb060',0.18,0.18);
    }
  } else if(s.id==='m1911'){ HV.glock=1; }
});
v9On('frame',dt=>{
  const s=curSlot(), isB=!!(s&&s.id==='ptrs');
  HV.wasScoped=!!(Wp.scoped&&isB);
  // retorno parcial da câmera depois do coice sem luneta
  if(HV.recovLeft>0){ const st=Math.min(HV.recovLeft,dt*0.55); P.pitch-=st; HV.recovLeft-=st; }
  HV.kick=Math.max(0,HV.kick-dt*4.5); HV.vm=Math.max(0,HV.vm-dt*2.6); HV.shove=Math.max(0,HV.shove-dt*4); HV.glock=Math.max(0,HV.glock-dt*7);
  if(HV.post>0) HV.post-=dt;
  // luneta da Barrett: aparece enquanto abre (V9B.open), fica durante a mira e um instante depois do tiro
  const opening=isB&&IN.ads&&!busy()&&!Wp.reloading&&V9B.cyc<=0&&P.ads>0.35&&(G.state==='playing')&&!P.down;
  const scoped=HV.wasScoped&&(G.state==='playing'||G.state==='paused')&&!P.down;
  if(scoped&&!HV.last){ HV.focus=1; }
  HV.last=scoped; HV.focus=Math.max(0,HV.focus-dt*5);
  const show=isB&&(opening||scoped||HV.post>0);
  const el=document.getElementById('bscope'); if(!el) return;
  el.classList.toggle('on',show); document.body.classList.toggle('barscope',show);
  if(show){ const o=scoped?1:HV.post>0?1:Math.max(0,Math.min(1,(P.ads-0.35)/0.5*0.5+V9B.open*0.5));
    el.style.setProperty('--o',o.toFixed(3)); el.style.setProperty('--k',HV.kick.toFixed(3)); el.style.setProperty('--f',HV.focus.toFixed(3));
    el.style.opacity=HV.post>0&&!scoped?Math.min(1,HV.post/0.2).toFixed(2):'1'; }
});
// viewmodel: tranco da Barrett sem luneta, puxada para o olho ao mirar e tranco da Glock
V9VM.push(dt=>{
  const s=curSlot(); if(!s) return;
  if(s.id==='ptrs'){
    if(HV.vm>0){ const a=Math.sin(Math.min(1,HV.vm)*Math.PI*0.5); vmRoot.position.z+=a*0.12; vmRoot.position.y+=a*0.015; vmRoot.rotation.x+=a*0.31; vmRoot.rotation.z+=a*0.06; vmRoot.rotation.y+=a*0.03; }
    if(IN.ads&&V9B.cyc<=0&&!Wp.scoped){ const a=Math.max(0,P.ads-0.3); vmRoot.rotation.z+=a*0.09*(1-V9B.open); vmRoot.position.z-=a*0.04*V9B.open; vmRoot.position.y+=Math.sin(G.t*14)*0.002*a; }
  } else if(s.id==='m1911'&&HV.glock>0){ const a=HV.glock*HV.glock; vmRoot.rotation.x+=a*0.22; vmRoot.position.z+=a*0.05; vmRoot.position.y+=a*0.012; }
});
// o ombro é empurrado para trás no coice sem luneta
{ const v9Cam0=v9Cam; v9Cam=function(dt){ const r=v9Cam0.apply(this,arguments); if(HV.shove>0&&G.state==='playing'){ const a=HV.shove*HV.shove; camera.translateZ(a*0.08); camera.rotateZ(a*0.015); } return r; }; }

// vozes dos personagens mais altas (gravadas e sintéticas)
voxRecVol=function(){ const v=CFG.voice==null?1:+CFG.voice||0, s=Math.max(0.05,CFG.sfx==null?1:+CFG.sfx||0); return clamp(2.0*v/s,0,5); };

/* Luneta física no modelo da Barrett (M107): tubo, sinos, anéis, torres e lentes. Some quando a luneta 2D abre. */
function hvScope3d(){
  const G3=new THREE.Group(); G3.name='hvScope3d';
  const met=new THREE.MeshStandardMaterial({color:0x191b1d,metalness:0.65,roughness:0.42});
  const met2=new THREE.MeshStandardMaterial({color:0x26292c,metalness:0.55,roughness:0.55});
  const lens=new THREE.MeshPhongMaterial({color:0x10263a,specular:0x9fd4ff,shininess:110,emissive:0x0a2238,emissiveIntensity:0.35,transparent:true,opacity:0.92});
  const cyl=(r1,r2,l,m,seg)=>{ const g=new THREE.CylinderGeometry(r1,r2,l,seg||20,1); g.rotateX(Math.PI/2); return new THREE.Mesh(g,m); };
  const Y=0.104;
  const add=(m,x,y,z)=>{ m.position.set(x,y,z); G3.add(m); return m; };
  add(cyl(0.0165,0.0165,0.25,met),0,Y,-0.02);                 // tubo principal
  add(cyl(0.029,0.0165,0.07,met),0,Y,-0.18);                  // transição do sino da objetiva
  add(cyl(0.029,0.029,0.06,met),0,Y,-0.245);                  // sino da objetiva
  add(cyl(0.031,0.031,0.012,met2),0,Y,-0.272);                // aro da objetiva
  add(cyl(0.0165,0.024,0.05,met),0,Y,0.13);                   // transição da ocular
  add(cyl(0.024,0.024,0.05,met2,24),0,Y,0.18);                // ocular
  add(cyl(0.026,0.026,0.012,met),0,Y,0.205);                  // borracha da ocular
  const lo=new THREE.Mesh(new THREE.CircleGeometry(0.026,24),lens); lo.position.set(0,Y,-0.279); lo.rotation.y=Math.PI; G3.add(lo);
  const le=new THREE.Mesh(new THREE.CircleGeometry(0.021,24),lens); le.position.set(0,Y,0.2115); G3.add(le);
  const tur=new THREE.CylinderGeometry(0.011,0.011,0.024,16);
  add(new THREE.Mesh(tur,met2),0,Y+0.027,-0.03);              // torre de elevação
  const tw=new THREE.Mesh(tur,met2); tw.rotation.z=Math.PI/2; add(tw,0.027,Y,-0.03); // torre de deriva
  const tp=new THREE.Mesh(new THREE.CylinderGeometry(0.0125,0.0125,0.004,16),met); add(tp,0,Y+0.041,-0.03);
  const pz=new THREE.Mesh(new THREE.CylinderGeometry(0.009,0.009,0.02,14),met2); pz.rotation.z=-Math.PI/2; add(pz,-0.024,Y,-0.03); // paralaxe
  for(const z of [-0.12,0.07]){                                // anéis + bases no trilho
    add(cyl(0.021,0.021,0.022,met2),0,Y,z);
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.022,0.034,0.022),met2); add(b,0,Y-0.026,z);
    const c=new THREE.Mesh(new THREE.BoxGeometry(0.036,0.008,0.03),met); add(c,0,0.072,z);
    for(const sx of [-1,1]){ const sc=new THREE.Mesh(new THREE.CylinderGeometry(0.003,0.003,0.006,8),met); sc.rotation.z=Math.PI/2; add(sc,sx*0.02,0.072,z); }
  }
  G3.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.receiveShadow=false; o.frustumCulled=false; } });
  return G3;
}
{ const sgm0=setGunModel; setGunModel=function(){ const r=sgm0.apply(this,arguments);
  try{ const s=curSlot(); if(s&&s.id==='ptrs'&&gunModel&&!gunModel.userData.scope3d){ const g=hvScope3d(); gunModel.add(g); gunModel.userData.scope3d=g; gunModel.updateMatrixWorld(true); } }catch(e){ console.warn('[Bunker] luneta 3d',e); }
  return r; }; }
v9On('frame',()=>{ const g=gunModel&&gunModel.userData.scope3d; if(g) g.visible=!(typeof V9B!=='undefined'&&V9B.open>0.55); });
