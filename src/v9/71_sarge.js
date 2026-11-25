/* ================= v9 · PERSONAGENS 3D COM ESQUELETO MIXAMO (Meshy) — 1º: SARGENTO MOREIRA =================
   O modelo vem da Meshy com auto-rig no padrão Mixamo: 66 ossos, inclusive 5 dedos com 3 falanges em cada mão,
   e os pesos de cada osso já pintados na malha. Aqui ele é ligado às poses e animações que o jogo já tem:
   · o jogo continua mexendo nos mesmos grupos de sempre (quadril, tronco, cabeça, ombro, cotovelo, punho, coxa,
     joelho), só que invisíveis; a cada quadro cada osso do Mixamo copia a rotação do grupo correspondente
     (retarget por rotação no espaço do personagem). Lobby, gestos, andar/correr/agachar/mirar no online: tudo vale.
   · o modelo foi riggado em pose T; os braços recebem uma correção fixa para "caírem" ao lado do corpo, que é a
     pose de descanso que o jogo espera.
   · dedos: cada mão tem um "fechar" de 0 a 1 (firme segurando arma, leve parado). As falanges dobram em direção à
     palma; o polegar dobra menos. Dá para ajustar com parts.armL/armR.userData.curl.
   Só o visual base (sem skin comprada) usa o modelo novo. */
const MXC={on:true,defs:{moreira:{url:'chars/sargento.glb',vk:null}},data:{},loading:{}};
const MX_FING=['Thumb','Index','Middle','Ring','Pinky'];
const _mq=new THREE.Quaternion(), _mq2=new THREE.Quaternion(), _mv=new THREE.Vector3(), _mv2=new THREE.Vector3(), _mm=new THREE.Matrix4();

/* ---------- carga: guarda geometria, material, inversas e o descanso de cada osso ---------- */
function mxLoad(id){ const def=MXC.defs[id]; if(!def||MXC.data[id]||MXC.loading[id]||!THREE.GLTFLoader) return; MXC.loading[id]=true;
  new THREE.GLTFLoader().load(def.url,gl=>{ try{ MXC.data[id]=mxPrep(gl); console.log('[Bunker] personagem 3D',id,'pronto:',MXC.data[id].names.length,'ossos'); mxRefresh(id); }catch(e){ console.warn('[Bunker] personagem 3D',id,e); } },
    null,e=>{ console.warn('[Bunker] personagem 3D não carregou',id,e); }); }
function mxPrep(gl){ let sm=null; gl.scene.traverse(o=>{ if(o.isSkinnedMesh&&!sm) sm=o; }); if(!sm) throw new Error('GLB sem malha com esqueleto');
  gl.scene.updateMatrixWorld(true);
  const sk=sm.skeleton, bones=sk.bones, n=bones.length, names=bones.map(b=>b.name.replace(/^mixamorig:?/,''));
  const idx={}; names.forEach((nm,i)=>idx[nm]=i);
  const par=bones.map(b=>{ const i=bones.indexOf(b.parent); return i; });
  // descanso (pose do rig) no espaço do personagem = inversa da inversa de ligação
  const restW=sk.boneInverses.map(m=>new THREE.Matrix4().copy(m).invert());
  const rq=[], rp=[], lq=[], lp=[], ls=[];
  for(let i=0;i<n;i++){ const p=new THREE.Vector3(), q=new THREE.Quaternion(), s=new THREE.Vector3(); restW[i].decompose(p,q,s); rp.push(p); rq.push(q);
    const local=par[i]>=0?new THREE.Matrix4().copy(restW[par[i]]).invert().multiply(restW[i]):restW[i].clone(); const p2=new THREE.Vector3(), q2=new THREE.Quaternion(), s2=new THREE.Vector3(); local.decompose(p2,q2,s2); lp.push(p2); lq.push(q2); ls.push(s2); }
  // lado: no jogo o "L" fica em x<0; descobre qual lado do Mixamo cai em x<0
  const lSide=rp[idx.LeftArm].x<0?'Left':'Right', rSide=lSide==='Left'?'Right':'Left';
  // correção dos braços: da pose T para caídos ao lado do corpo (leve abertura)
  const corr={};
  for(const [g,side,sx] of [['L',lSide,-1],['R',rSide,1]]){ const a=rp[idx[side+'Arm']], e=rp[idx[side+'ForeArm']]; const dir=e.clone().sub(a).normalize(); const tgt=new THREE.Vector3(sx*0.13,-1,0.02).normalize(); corr[g]=new THREE.Quaternion().setFromUnitVectors(dir,tgt); }
  // dedos: eixo de dobra no descanso (palma para baixo na pose T)
  const fingers=[];
  for(const [g,side] of [['L',lSide],['R',rSide]]) for(const f of MX_FING) for(let k=1;k<=3;k++){ const i=idx[side+'Hand'+f+k], c=idx[side+'Hand'+f+(k+1)]; if(i==null||c==null) continue;
    const d=rp[c].clone().sub(rp[i]).normalize(); const nrm=new THREE.Vector3(0,-1,0);
    // polegar: dobra na direção da base do dedo médio e um pouco para a palma (fecha por cima dos dedos)
    if(f==='Thumb'){ const m=rp[idx[side+'HandMiddle2']]||rp[idx[side+'HandMiddle1']]; nrm.copy(m).sub(rp[i]).normalize().add(new THREE.Vector3(0,-0.5,0)).normalize(); }
    const ax=new THREE.Vector3().crossVectors(d,nrm); if(ax.lengthSq()<1e-6) continue; ax.normalize(); fingers.push({i,g,f,k,ax,fi:MX_FING.indexOf(f)}); }
  const tex=sm.material&&sm.material.map; if(tex){ tex.encoding=THREE.LinearEncoding; tex.needsUpdate=true; try{ tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); }catch(e){} }
  const mat=new THREE.MeshPhongMaterial({map:tex,skinning:true,shininess:8,specular:0x161616});
  const pos=k=>rp[idx[k]].clone();
  return {geo:sm.geometry,mat,tex,bindMatrix:sm.bindMatrix.clone(),boneInverses:sk.boneInverses.map(m=>m.clone()),names,idx,par,rq,rp,lq,lp,ls,lSide,rSide,corr,fingers,anims:gl.animations||[],pos}; }

/* ---------- monta uma instância ---------- */
function mxBuild(id,vk,L,opts){ const D=MXC.data[id]; opts=opts||{};
  const root=new THREE.Group(), body=new THREE.Group(); root.add(body);
  const P=k=>D.pos(k);
  // grupos do jogo (invisíveis), nas mesmas juntas do modelo
  const legs=[], arms=[];
  for(const [g,side] of [['L',D.lSide],['R',D.rSide]]){ const up=P(side+'UpLeg'), kn=P(side+'Leg');
    const lg=new THREE.Group(); lg.position.copy(up); body.add(lg); lg.add(new THREE.Object3D());   // filho 0: lugar da coxa (o online pega o joelho como filho 1)
    const k=new THREE.Group(); k.position.set(0,kn.y-up.y,0); lg.add(k); legs.push({lg,kn:k}); }
  const sp=P('Spine'), chest=new THREE.Group(); chest.position.copy(sp); body.add(chest); const up=new THREE.Group(); up.position.copy(sp).negate(); chest.add(up);
  const head=new THREE.Group(); head.position.copy(P('Head')); up.add(head);
  for(const [g,side] of [['L',D.lSide],['R',D.rSide]]){ const sh=P(side+'Arm'), el=P(side+'ForeArm'), wr=P(side+'Hand'), C=D.corr[g];
    const a=new THREE.Group(); a.position.copy(sh); up.add(a);
    const fo=new THREE.Group(); fo.position.copy(el.clone().sub(sh).applyQuaternion(C)); a.add(fo);
    const hand=new THREE.Group(); hand.position.copy(wr.clone().sub(el).applyQuaternion(C)); fo.add(hand);
    a.userData={fo,hand,curl:0.3}; arms.push({a,fo,hand}); }
  // esqueleto próprio desta instância
  const bones=D.names.map((nm,i)=>{ const b=new THREE.Bone(); b.name=nm; b.position.copy(D.lp[i]); b.quaternion.copy(D.lq[i]); b.scale.copy(D.ls[i]); return b; });
  const arm=new THREE.Group(); root.add(arm); bones.forEach((b,i)=>{ (D.par[i]>=0?bones[D.par[i]]:arm).add(b); });
  const skel=new THREE.Skeleton(bones,D.boneInverses);
  const sm=new THREE.SkinnedMesh(D.geo,D.mat); sm.frustumCulled=false; root.add(sm); sm.bind(skel,D.bindMatrix); sm.userData.mx=1;
  const parts={root,body,chest,head,legL:legs[0].lg,legR:legs[1].lg,armL:arms[0].a,armR:arms[1].a,fem:false,look:L,spine:null,skirt:null,S:1.14,cid:id,mx:1,mxBones:bones,mxSm:sm};
  // liga grupo do jogo -> osso
  const I=k=>D.idx[k];
  const map=[[I('Hips'),'body'],[I('Spine'),'chest'],[I('Head'),'head'],
    [I(D.lSide+'UpLeg'),'legL'],[I(D.lSide+'Leg'),'kneeL'],[I(D.rSide+'UpLeg'),'legR'],[I(D.rSide+'Leg'),'kneeR'],
    [I(D.lSide+'Arm'),'armL'],[I(D.lSide+'ForeArm'),'foL'],[I(D.lSide+'Hand'),'handL'],[I(D.rSide+'Arm'),'armR'],[I(D.rSide+'ForeArm'),'foR'],[I(D.rSide+'Hand'),'handR']];
  const drive=new Array(bones.length).fill(null); for(const [i,k] of map) if(i!=null) drive[i]=k;
  const clavOf=new Array(bones.length).fill(null); clavOf[I(D.lSide+'Shoulder')]=arms[0].a.userData; clavOf[I(D.rSide+'Shoulder')]=arms[1].a.userData;   // clavícula opcional (userData.clav)
  arms[0].a.userData.sh0=arms[0].a.position.clone(); arms[1].a.userData.sh0=arms[1].a.position.clone();
  arms[0].a.userData.piv=P(D.lSide+'Shoulder'); arms[1].a.userData.piv=P(D.rSide+'Shoulder');
  const corrOf=new Array(bones.length).fill(null); for(const [g,side] of [['L',D.lSide],['R',D.rSide]]) for(const k of ['Arm','ForeArm','Hand']) corrOf[I(side+k)]=D.corr[g];
  const G={}, W=bones.map(()=>new THREE.Quaternion()), curlQ=new THREE.Quaternion(), tmp=new THREE.Quaternion();
  const hipRest=D.lp[I('Hips')].clone();
  function sync(){ // rotações acumuladas dos grupos do jogo (espaço do personagem)
    G.body=body.quaternion.clone(); G.chest=G.body.clone().multiply(chest.quaternion); const Qup=G.chest.clone().multiply(up.quaternion); G.head=Qup.clone().multiply(head.quaternion);
    for(const [g,A] of [['L',arms[0]],['R',arms[1]]]){ G['arm'+g]=Qup.clone().multiply(A.a.quaternion); G['fo'+g]=G['arm'+g].clone().multiply(A.fo.quaternion); G['hand'+g]=G['fo'+g].clone().multiply(A.hand.quaternion); }
    for(const [g,Lg] of [['L',legs[0]],['R',legs[1]]]){ G['leg'+g]=G.body.clone().multiply(Lg.lg.quaternion); G['knee'+g]=G['leg'+g].clone().multiply(Lg.kn.quaternion); }
    const UL=arms[0].a.userData, UR=arms[1].a.userData;
    for(let i=0;i<bones.length;i++){ const p=D.par[i], key=drive[i], cv=clavOf[i]&&clavOf[i].clav;
      if(key){ W[i].copy(G[key]); if(corrOf[i]) W[i].multiply(corrOf[i]); W[i].multiply(D.rq[i]); }
      else if(cv){ W[i].copy(Qup).multiply(cv).multiply(D.rq[i]); }
      else { W[i].copy(p>=0?W[p]:_mq2.identity()).multiply(D.lq[i]); }
      // local = inversa(pai) * mundo
      if(key||cv){ bones[i].quaternion.copy(p>=0?tmp.copy(W[p]).invert():tmp.identity()).multiply(W[i]); } else bones[i].quaternion.copy(D.lq[i]); }
    // dedos: dobra em volta do eixo de descanso
    for(const F of D.fingers){ const U=F.g==='L'?UL:UR; const c=U.fc?U.fc[F.fi]:U.curl; if(c<=0.001) continue; const amt=(F.f==='Thumb'?[0.55,0.5,0.45]:[0.85,1.15,0.8])[F.k-1]*c;
      curlQ.setFromAxisAngle(F.ax,amt); const b=bones[F.i]; // local = descanso * (inv(R)*rot*R)
      tmp.copy(D.rq[F.i]).invert().multiply(curlQ).multiply(D.rq[F.i]); b.quaternion.multiply(tmp); }
    const hb=bones[I('Hips')]; if(hb) hb.position.copy(hipRest).applyQuaternion(body.quaternion).add(body.position);   // gira em volta do mesmo pivô do grupo do jogo
  }
  const umw=root.updateMatrixWorld.bind(root); root.updateMatrixWorld=function(f){ try{ sync(); }catch(e){} return umw(f); };
  parts.mxSync=sync;
  try{ poseChar(parts,opts.pose||'idle',0); }catch(e){}
  if(opts.knife){ try{ const k=buildKnifeModel(opts.knife,false); k.scale.setScalar(1.2); k.rotation.set(-Math.PI/2+0.25,0,0); k.position.set(0,-0.06,0.02); arms[1].hand.add(k); parts.knife=k; }catch(e){} }
  root.userData=parts;
  // cópia (rastro fantasma de habilidade): congela a pose do momento numa malha comum
  root.clone=function(){ const c=new THREE.Group(); c.position.copy(this.position); c.quaternion.copy(this.quaternion); c.scale.copy(this.scale);
    try{ this.updateMatrixWorld(true); const g=mxSnapshot(sm); const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({map:D.tex})); m.applyMatrix4(new THREE.Matrix4().copy(this.matrixWorld).invert()); c.add(m); }catch(e){} return c; };
  return root; }
function mxSnapshot(sm){ const g=sm.geometry, P=g.attributes.position, n=P.count, out=new Float32Array(n*3), v=new THREE.Vector3();
  for(let i=0;i<n;i++){ v.fromBufferAttribute(P,i); sm.boneTransform(i,v); v.applyMatrix4(sm.matrixWorld); out[i*3]=v.x; out[i*3+1]=v.y; out[i*3+2]=v.z; }
  const ng=new THREE.BufferGeometry(); ng.setAttribute('position',new THREE.BufferAttribute(out,3)); ng.setAttribute('uv',g.attributes.uv); ng.setIndex(g.index); ng.computeVertexNormals(); return ng; }

/* ---------- dedos por pose ---------- */
{ const pc=poseChar; poseChar=function(p,pose,t){ const r=pc.apply(this,arguments);
    if(p&&p.mx){ const L=p.armL.userData, R=p.armR.userData; L.fc=null; R.fc=null; for(const [a,U] of [[p.armL,L],[p.armR,R]]) if(U.clav){ U.clav=null; if(U.sh0) a.position.copy(U.sh0); } if(pose==='gun'){ L.curl=0.8; R.curl=0.95; } else if(pose==='knife'){ L.curl=0.35; R.curl=1; } else { L.curl=0.3; R.curl=0.3; } }
    return r; }; }

/* ---------- troca no buildChar ---------- */
function mxWants(id,vk){ if(!MXC.on) return false; const def=MXC.defs[id]; if(!def) return false; const ks=varKeys(id); return !vk||vk===(def.vk||ks[0])||!CHARS[id].vars[vk]; }
{ const bc=buildChar; buildChar=function(id,vk,opts){
    if(!(typeof CHX!=='undefined'&&CHX.skip)&&mxWants(id,vk)){ if(MXC.data[id]){ try{ const C=CHARS[id], k=vk&&C.vars[vk]?vk:varKeys(id)[0]; return mxBuild(id,k,C.vars[k].look,opts); }catch(e){ console.warn('[Bunker] personagem 3D',id,e); } } else mxLoad(id); }
    return bc.apply(this,arguments); }; }
/* quando termina de carregar, troca onde o personagem já aparece (menu, vitrine, miniaturas, outros jogadores) */
function mxRefresh(id){ try{ for(const k of [...CTH.cache.keys()]) if(k.startsWith(id+':')) CTH.cache.delete(k); }catch(e){}
  try{ if(CP.key&&(String(CP.key).includes(id)||CP.mode==='squad')){ const md=CP.mode; CP.key=null; if(md==='squad') cpShowSquad(); else if(md==='char') cpShowChar(id,varKeys(id)[0]); } }catch(e){}
  try{ for(const rp of NET.players.values()) if(rp.ch===id||rp.cid===id||(rp.parts&&rp.parts.cid===id)) setAvatarBody(rp,id,rp.cv); }catch(e){}
  try{ if(typeof renderChars==='function'&&$('#chars')&&!$('#chars').hidden) renderChars(); }catch(e){} }
for(const id in MXC.defs) mxLoad(id);
CMDS.personagem3d={cheat:1,d:'personagem3d [on|off] · personagens com modelo 3D novo (sargento)',f:a=>{ MXC.on=(a[0]||'on')!=='off'; for(const id in MXC.defs) mxRefresh(id); cprint('personagens 3D: '+(MXC.on?'ligados':'desligados')); }};
