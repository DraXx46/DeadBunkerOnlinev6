/* ================= v9 · PERSONAGENS RETRABALHADOS (lobby e os outros jogadores no online) =================
   Nada muda na primeira pessoa. Em terceira pessoa:
   · malha única com esqueleto: as peças (coxa, canela, braço, antebraço, mão, tronco, pescoço, cabeça) viram uma
     malha só, e perto de cada junta os vértices se dividem entre os dois ossos (quadril, joelho, ombro, cotovelo,
     punho, pescoço). Dobrou o joelho ou o cotovelo: o tecido acompanha, sem buraco e sem peça solta.
   · texturas 4× mais finas e suaves no lugar dos pixels: trama de tecido, costuras, sombra de dobra, desgaste.
   · rosto pintado de novo: olho com íris, pupila e brilho, pálpebra e cílios, sobrancelha em fios, sombra do nariz,
     lábios com volume, olheira e maçã do rosto; barba por fazer em pontos finos.
   · orelhas de verdade (antes eram caixinhas) e mãos com volume.
   O sósia (zumbi vestido de jogador) continua no sistema dos zumbis. */
const CHX={on:true,K:4,skip:0,stat:{n:0,fail:0}};

/* ---------- texturas em alta ---------- */
function chxPost(c,g,kind){ const W=c.width, H=c.height, K=CHX.K;
  // suaviza os blocos de pixel mantendo um pouco do desenho nítido (costuras, botões)
  const c2=document.createElement('canvas'); c2.width=W; c2.height=H; const g2=c2.getContext('2d');
  g2.filter=`blur(${kind==='face'?K*0.55:K*0.42}px)`; g2.drawImage(c,0,0); g2.filter='none'; g2.globalAlpha=kind==='face'?0.18:0.32; g2.drawImage(c,0,0); g2.globalAlpha=1;
  if(kind!=='face'&&kind!=='emis'){
    // trama do tecido: fios finos nas duas direções + manchas e desgaste
    g2.globalAlpha=0.06; g2.fillStyle='#000'; for(let y=0;y<H;y+=2) g2.fillRect(0,y,W,1);
    g2.globalAlpha=0.035; g2.fillStyle='#fff'; for(let x=0;x<W;x+=3) g2.fillRect(x,0,1,H);
    g2.globalAlpha=1;
    for(let i=0;i<W*H/900;i++){ const x=Math.random()*W, y=Math.random()*H, r=rand(3,14)*K/4; const gr=g2.createRadialGradient(x,y,0,x,y,r); const d=Math.random()<0.5;
      gr.addColorStop(0,d?'rgba(20,14,8,0.10)':'rgba(255,250,235,0.06)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g2.fillStyle=gr; g2.fillRect(x-r,y-r,r*2,r*2); }
    // sombra de dobra (faixas horizontais suaves, mais fortes perto da cintura e do joelho)
    for(let i=0;i<6;i++){ const y=rand(0,H), h=rand(2,6)*K; const gr=g2.createLinearGradient(0,y-h,0,y+h); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(0.5,'rgba(0,0,0,0.10)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g2.fillStyle=gr; g2.fillRect(0,y-h,W,h*2); }
  }
  return c2; }
function chxTexMake(w,h,draw,kind){ const K=CHX.K, c=document.createElement('canvas'); c.width=w*K; c.height=h*K; const g=c.getContext('2d'); g.imageSmoothingEnabled=false;
  g.save(); g.scale(K,K); draw(g,w,h);
  // rosto: apaga os pixels de olho/boca/barba antigos da frente (o rosto novo é pintado por cima); barba cheia fica
  if(kind==='face'&&CHX.faceL){ const L=CHX.faceL, full=L.beard==='full'||L.beard==='gray', y0=L.hat?17:20; g.fillStyle=L.skin; g.fillRect(9,y0,46,(full?37:62)-y0); if(!L.hat) g.fillRect(9,15,46,6); }
  g.restore();
  const c2=chxPost(c,g,kind); if(kind==='face'&&CHX.faceL){ const g2=c2.getContext('2d'); g2.save(); g2.scale(K,K); try{ chxFace(g2,CHX.faceL); }catch(e){ console.warn('[Bunker] rosto',e); } g2.restore(); }
  const t=new THREE.CanvasTexture(c2); t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter; try{ t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); }catch(e){} return t; }
{ const ct0=charTexs; charTexs=function(id,vk,L){ const key=id+':'+vk; if(!CHX.on||charTexCache.has(key)) return ct0.apply(this,arguments);
    const pt0=pixTex; let n=0; const kinds=['face','emis','top','legs'];
    pixTex=function(w,h,draw){ let k=kinds[n++]||'cloth'; if(k==='emis'&&!L.glow) k=kinds[n++]||'cloth'; if(k==='face') CHX.faceL=L; try{ return chxTexMake(w,h,draw,k); } finally{ CHX.faceL=null; } };
    try{ return ct0.apply(this,arguments); } finally{ pixTex=pt0; } }; }
// manga camuflada e outras texturas do material também em alta
{ const cm0=charMats; charMats=function(id,vk,L){ const key=id+':'+vk; if(!CHX.on||charMatCache.has(key)) return cm0.apply(this,arguments);
    const pt0=pixTex; pixTex=function(w,h,draw){ return chxTexMake(w,h,draw,'cloth'); };
    let m; try{ m=cm0.apply(this,arguments); } finally{ pixTex=pt0; }
    try{ for(const k in m){ const mt=m[k]; if(mt&&mt.bumpMap&&mt.map){ mt.bumpScale=0.006; } } if(m.skin){ m.skin.shininess=14; m.skin.specular=new THREE.Color(0x1a1410); } if(m.face){ m.face.shininess=14; m.face.specular=new THREE.Color(0x1a1410); } }catch(e){}
    return m; }; }

/* rosto: mesmo mapa (128×64, frente do rosto em x=32), pintado em cima com detalhe de verdade */
function chxFace(g,L){ const cx=32, skin=L.skin, fem=!!L.fem;
  const rg=(x,y,r,stops)=>{ const gr=g.createRadialGradient(x,y,0,x,y,r); for(const [o,c] of stops) gr.addColorStop(o,c); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); };
  const dk=a=>`rgba(40,22,14,${a})`, lt=a=>`rgba(255,236,220,${a})`;
  // volume: testa e maçãs claras, têmporas, olheiras e queixo com sombra
  rg(cx,24,10,[[0,lt(0.10)],[1,lt(0)]]); for(const s of [-1,1]){ rg(cx+s*9,36,6,[[0,lt(0.10)],[1,lt(0)]]); rg(cx+s*15,30,7,[[0,dk(0.16)],[1,dk(0)]]); rg(cx+s*7,33,3.2,[[0,dk(0.14)],[1,dk(0)]]); }
  rg(cx,47,9,[[0,dk(0.10)],[1,dk(0)]]);
  if(fem) for(const s of [-1,1]) rg(cx+s*9,37,4.5,[[0,'rgba(200,80,70,0.10)'],[1,'rgba(200,80,70,0)']]);
  // nariz: ponte clara, laterais e base com sombra, narinas
  g.fillStyle=lt(0.12); g.fillRect(cx-0.6,24,1.2,11);
  for(const s of [-1,1]){ g.fillStyle=dk(0.16); g.beginPath(); g.ellipse(cx+s*1.9,33,0.9,4,s*0.1,0,7); g.fill(); g.fillStyle=dk(0.45); g.beginPath(); g.ellipse(cx+s*1.3,36.6,0.6,0.35,0,0,7); g.fill(); }
  g.fillStyle=dk(0.18); g.beginPath(); g.ellipse(cx,37.4,2.6,0.6,0,0,7); g.fill();
  // olhos
  const brow=L.hair2==='gray'||L.beard==='gray'?'#8a867e':L.vamp?'#cfc9c4':L.hair;
  for(const s of [-1,1]){ const ex=cx+s*7, ey=29.9;
    rg(ex,ey-0.4,3.6,[[0,dk(0.18)],[1,dk(0)]]);                                              // cavidade
    g.fillStyle='#e9e2d8'; g.beginPath(); g.ellipse(ex,ey,2.3,0.95,0,0,7); g.fill();            // esclera
    g.save(); g.beginPath(); g.ellipse(ex,ey,2.3,0.95,0,0,7); g.clip();
    g.fillStyle=L.glow?(L.eye||'#ff3030'):L.eye||'#4a3020'; g.beginPath(); g.arc(ex-s*0.15,ey+0.05,1.05,0,7); g.fill();
    g.fillStyle='rgba(0,0,0,0.35)'; g.beginPath(); g.arc(ex-s*0.15,ey+0.05,1.05,Math.PI*1.05,Math.PI*1.95); g.lineTo(ex-s*0.15,ey+0.05); g.fill();
    g.fillStyle=L.glow?'#fff3d0':'#0c0806'; g.beginPath(); g.arc(ex-s*0.15,ey+0.05,0.45,0,7); g.fill();
    g.fillStyle='rgba(60,30,20,0.45)'; g.fillRect(ex-2.6,ey-1.1,5.2,0.75); g.restore();
    g.fillStyle='rgba(255,255,255,0.9)'; g.beginPath(); g.arc(ex-s*0.15+0.35,ey-0.3,0.22,0,7); g.fill();
    // pálpebra de cima / cílios
    g.strokeStyle=fem?'#120a06':'rgba(30,18,12,0.85)'; g.lineWidth=fem?0.5:0.35; g.beginPath(); g.ellipse(ex,ey+0.05,2.6,1.15,0,Math.PI*1.08,Math.PI*1.92); g.stroke();
    if(fem){ g.lineWidth=0.25; for(let i=0;i<4;i++){ const a=Math.PI*(1.15+i*0.2), x=ex+Math.cos(a)*2.6, y=ey+Math.sin(a)*1.15; g.beginPath(); g.moveTo(x,y); g.lineTo(x+s*0.2*(i-1.5)*0.6-0.1*s,y-0.6); g.stroke(); } }
    g.strokeStyle=dk(0.25); g.lineWidth=0.3; g.beginPath(); g.ellipse(ex,ey-0.2,2.7,1.6,0,Math.PI*1.12,Math.PI*1.88); g.stroke();           // vinco da pálpebra
    g.strokeStyle=dk(0.15); g.beginPath(); g.ellipse(ex,ey+0.4,2.3,1.2,0,Math.PI*0.15,Math.PI*0.85); g.stroke();                             // olheira
    // sobrancelha em fios
    g.strokeStyle=brow; g.lineCap='round';
    for(let i=0;i<14;i++){ const t=i/13, x=ex-s*2.9+s*t*6.2, y=25.9-Math.sin(t*Math.PI)*0.9+(fem?0.3:0)-(t>0.7?0:0); g.globalAlpha=fem?0.55:0.7; g.lineWidth=(fem?0.35:0.55)*(1-t*0.5);
      g.beginPath(); g.moveTo(x,y+0.6); g.lineTo(x+s*0.9,y-0.15); g.stroke(); }
    g.globalAlpha=1; }
  // boca
  const lip=L.lips||shadeCol(skin,0.72);
  g.fillStyle=lip; g.globalAlpha=fem?0.95:0.55;
  g.beginPath(); g.moveTo(cx-4.6,41.3); g.quadraticCurveTo(cx-2,40,cx,40.7); g.quadraticCurveTo(cx+2,40,cx+4.6,41.3); g.quadraticCurveTo(cx,41.9,cx-4.6,41.3); g.fill();
  g.beginPath(); g.moveTo(cx-4.2,41.4); g.quadraticCurveTo(cx,44.2,cx+4.2,41.4); g.quadraticCurveTo(cx,42.2,cx-4.2,41.4); g.fill(); g.globalAlpha=1;
  g.strokeStyle='rgba(50,18,14,0.75)'; g.lineWidth=0.35; g.beginPath(); g.moveTo(cx-4.6,41.35); g.quadraticCurveTo(cx,42.1,cx+4.6,41.35); g.stroke();
  g.fillStyle='rgba(255,255,255,0.18)'; g.beginPath(); g.ellipse(cx,42.7,1.6,0.35,0,0,7); g.fill();
  if(L.vamp){ g.fillStyle='#fff'; for(const s of [-1,1]){ g.beginPath(); g.moveTo(cx+s*2.4,41.6); g.lineTo(cx+s*2.0,43.4); g.lineTo(cx+s*1.6,41.6); g.fill(); } }
  // barba por fazer: pontos finos
  if(L.beard==='stubble'){ g.fillStyle=shadeCol(L.hair||'#2a1d14',1); for(let i=0;i<900;i++){ const x=cx+rand(-16,16), y=rand(37,54), dx=(x-cx)/16, dy=(y-45)/8.5; if(dx*dx+dy*dy>1.2) continue; if(y>39.6&&y<43.6&&Math.abs(x-cx)<5.2) continue; g.globalAlpha=rand(0.15,0.45); g.fillRect(x,y,0.3,0.3); } g.globalAlpha=1; }
  // pintura de guerra (Iara)
  if(L.paint){ g.fillStyle='rgba(38,44,22,0.85)'; for(const s of [-1,1]){ g.beginPath(); g.moveTo(cx+s*4.5,32.3); g.quadraticCurveTo(cx+s*10,31.6,cx+s*15.5,33.4); g.lineTo(cx+s*15,34.6); g.quadraticCurveTo(cx+s*10,33.2,cx+s*4.8,33.8); g.fill();
      g.beginPath(); g.moveTo(cx+s*6,35.6); g.quadraticCurveTo(cx+s*10,35,cx+s*13.5,36.4); g.lineTo(cx+s*13,37.2); g.quadraticCurveTo(cx+s*10,36.2,cx+s*6.2,36.6); g.fill(); } }
  // cicatrizes de novo, finas
  if(L.scars){ g.strokeStyle='rgba(255,220,210,0.55)'; g.lineWidth=0.5; g.beginPath(); g.moveTo(cx-13,22); g.lineTo(cx-5,36); g.stroke(); g.beginPath(); g.moveTo(cx+12,20); g.lineTo(cx+12.4,27); g.stroke(); }
}

/* nariz esculpido (antes era uma pirâmide de 5 faces) */
{ let NG=null; noseGeo=function(){ if(NG) return NG; const g=new THREE.SphereGeometry(1,14,12), a=g.attributes.position;
    for(let i=0;i<a.count;i++){ const x=a.getX(i), y=a.getY(i), z=a.getZ(i); const t=(1-y)/2;   // 0 em cima, 1 na ponta
      const w=0.005+0.008*t*t+(t>0.75?0.003*(t-0.75)/0.25:0), d=0.003+0.0115*Math.pow(t,1.5);
      a.setXYZ(i,x*w,y*0.02-0.008,0.094+Math.max(0,z)*d+Math.min(0,z)*0.004-(t>0.9?0.004*(t-0.9)/0.1:0)); }
    g.computeVertexNormals(); const uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,0.25,0.47); return NG=g; }; }

/* ---------- malha única com juntas suaves ---------- */
const _cxA=new THREE.Matrix4(), _cxN=new THREE.Matrix3(), _cxV=new THREE.Vector3(), _cxW=new THREE.Vector3();
function chxIsUnder(o,top){ for(let p=o;p;p=p.parent) if(p===top) return true; return false; }
function chxSkin(root){
  const P=root.userData; if(!P||!P.body||!P.chest||P.chx) return;
  root.updateMatrixWorld(true); const rInv=new THREE.Matrix4().copy(root.matrixWorld).invert();
  const up=P.chest.children.find(c=>!c.isMesh)||P.chest;
  const kneeOf=lg=>lg.children.find(c=>!c.isMesh);
  const rp=o=>new THREE.Vector3().setFromMatrixPosition(o.matrixWorld).applyMatrix4(rInv);
  const bones=[], bi=new Map(); const addB=o=>{ if(!bi.has(o)){ bi.set(o,bones.length); bones.push(o); } return bi.get(o); };
  // juntas: pai, filho, pivô, eixo (do pivô para a ponta do filho), raio de mistura, raio lateral, limite do pai
  const J=[];
  const joint=(par,ch,next,r,side,capP)=>{ if(!par||!ch) return; const pv=rp(ch), nx=next instanceof THREE.Vector3?next:rp(next); const ax=nx.clone().sub(pv); if(ax.lengthSq()<1e-8) ax.set(0,-1,0); ax.normalize(); J.push({par,ch,pv,ax,r,side,capP:capP==null?1:capP}); };
  for(const lg of [P.legL,P.legR]){ if(!lg) continue; const kn=kneeOf(lg); joint(up,lg,kn||lg,0.07,0.13,0.6); if(kn){ const foot=rp(kn).add(new THREE.Vector3(0,-0.45,0)); joint(lg,kn,foot,0.055,0.1); } }
  for(const a of [P.armL,P.armR]){ if(!a) continue; const fo=a.userData.fo, hd=a.userData.hand; joint(up,a,fo||a,0.05,0.085,0.45); if(fo&&hd){ joint(a,fo,hd,0.05,0.07); const tip=rp(hd).add(rp(hd).sub(rp(fo)).normalize().multiplyScalar(0.1)); joint(fo,hd,tip,0.028,0.055); } }
  if(P.head){ const hp=rp(P.head), base=hp.clone().add(new THREE.Vector3(0,-0.1,-0.005)); J.push({par:up,ch:P.head,pv:base,ax:new THREE.Vector3(0,1,0),r:0.04,side:0.09,capP:1}); }
  // peças que entram: malhas opacas comuns; ficam de fora a saia (que se deforma sozinha), a faca, vidros e luzes
  const skipTop=[P.knife,P.skirt].filter(Boolean);
  const groups=new Map(); const meshes=[];
  root.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||Array.isArray(o.material)||!o.material||!o.geometry||!o.geometry.attributes.position) return;
    const m=o.material; if(m.transparent||m.isShaderMaterial||m.isMeshBasicMaterial||!o.visible) return; if(skipTop.some(t=>chxIsUnder(o,t))) return;
    let owner=o.parent; while(owner&&owner.isMesh) owner=owner.parent; if(!owner) return;
    meshes.push(o); let gr=groups.get(m); if(!gr){ gr={m,parts:[],nv:0,ni:0}; groups.set(m,gr); } const ge=o.geometry, n=ge.attributes.position.count;
    gr.parts.push({o,owner,ge}); gr.nv+=n; gr.ni+=ge.index?ge.index.count:n; });
  if(meshes.length<6) return;
  for(const gr of groups.values()) for(const pt of gr.parts) addB(pt.owner); for(const j of J){ addB(j.par); addB(j.ch); }
  const invs=bones.map(b=>new THREE.Matrix4().copy(b.matrixWorld).invert());
  const skel=new THREE.Skeleton(bones,invs); const out=[];
  const ss=(a,b,x)=>{ const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); };
  for(const gr of groups.values()){
    const pos=new Float32Array(gr.nv*3), nor=new Float32Array(gr.nv*3), uv=new Float32Array(gr.nv*2), si=new Uint16Array(gr.nv*4), sw=new Float32Array(gr.nv*4), idx=new Uint32Array(gr.ni);
    let v0=0, i0=0;
    for(const pt of gr.parts){ const ge=pt.ge, Pp=ge.attributes.position, Nn=ge.attributes.normal, U=ge.attributes.uv, n=Pp.count;
      const M=_cxA.multiplyMatrices(rInv,pt.o.matrixWorld); _cxN.getNormalMatrix(M); const flip=M.determinant()<0; const ob=bi.get(pt.owner);
      const myJ=J.filter(j=>j.par===pt.owner||j.ch===pt.owner);
      for(let k=0;k<n;k++){ const V=_cxV.fromBufferAttribute(Pp,k).applyMatrix4(M); const o3=(v0+k)*3; pos[o3]=V.x; pos[o3+1]=V.y; pos[o3+2]=V.z;
        if(Nn){ _cxW.fromBufferAttribute(Nn,k).applyMatrix3(_cxN).normalize(); nor[o3]=_cxW.x; nor[o3+1]=_cxW.y; nor[o3+2]=_cxW.z; }
        if(U){ uv[(v0+k)*2]=U.getX(k); uv[(v0+k)*2+1]=U.getY(k); }
        let best=null, bs=1e9, bw=0;
        for(const j of myJ){ const dx=V.x-j.pv.x, dy=V.y-j.pv.y, dz=V.z-j.pv.z; const s=dx*j.ax.x+dy*j.ax.y+dz*j.ax.z; if(Math.abs(s)>j.r) continue;
          const px=dx-s*j.ax.x, py=dy-s*j.ax.y, pz=dz-s*j.ax.z; if(px*px+py*py+pz*pz>j.side*j.side) continue; const sc=Math.abs(s)/j.r; if(sc<bs){ bs=sc; best=j; bw=ss(-j.r,j.r,s); } }
        const o4=(v0+k)*4;
        if(best){ let w=bw; if(pt.owner===best.par) w=Math.min(w,best.capP);
          si[o4]=bi.get(best.par); sw[o4]=1-w; si[o4+1]=bi.get(best.ch); sw[o4+1]=w; }
        else { si[o4]=ob; sw[o4]=1; } }
      const I=ge.index; const cnt=I?I.count:n;
      for(let k=0;k<cnt;k+=3){ const a=I?I.getX(k):k, b=I?I.getX(k+1):k+1, c=I?I.getX(k+2):k+2; idx[i0+k]=v0+a; idx[i0+k+1]=v0+(flip?c:b); idx[i0+k+2]=v0+(flip?b:c); }
      v0+=n; i0+=cnt; }
    const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('normal',new THREE.BufferAttribute(nor,3)); geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
    geo.setAttribute('skinIndex',new THREE.BufferAttribute(si,4)); geo.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4)); geo.setIndex(new THREE.BufferAttribute(gr.nv>65535?idx:new Uint16Array(idx),1));
    geo.computeBoundingSphere(); geo.boundingSphere.radius+=1.2;
    const mt=gr.m; if(!mt.skinning){ mt.skinning=true; mt.needsUpdate=true; }
    const sm=new THREE.SkinnedMesh(geo,mt); sm.userData={chxSk:1}; sm.frustumCulled=false; root.add(sm); sm.bind(skel,root.matrixWorld.clone()); out.push(sm); }
  for(const o of meshes){ o.layers.set(ZSKIN_LAYER); o.userData.chxHid=1; }
  P.chx={meshes:out,skel};
  // clonar (rastro fantasma da habilidade) volta às peças normais congeladas: a malha com esqueleto não serve para cópia parada
  root.clone=function(rec){ const c=THREE.Object3D.prototype.clone.call(this,rec); const rm=[]; c.traverse(o=>{ if(o.userData&&o.userData.chxSk) rm.push(o); else if(o.isMesh&&o.userData&&o.userData.chxHid) o.layers.set(0); }); for(const o of rm) o.parent&&o.parent.remove(o); return c; };
  CHX.stat.n++;
}
// normais suaves em malhas sem índice (capacete, couro cabeludo, barba): some o facetado
function chxSmoothN(geo){ if(geo.userData&&geo.userData.chxS) return geo; const p=geo.attributes.position, n=geo.attributes.normal; if(!n||geo.index) return geo;
  const acc=new Map(), key=i=>Math.round(p.getX(i)*2e4)+','+Math.round(p.getY(i)*2e4)+','+Math.round(p.getZ(i)*2e4);
  for(let i=0;i<p.count;i++){ const k=key(i); let a=acc.get(k); if(!a){ a=[0,0,0]; acc.set(k,a); } a[0]+=n.getX(i); a[1]+=n.getY(i); a[2]+=n.getZ(i); }
  for(let i=0;i<p.count;i++){ const a=acc.get(key(i)), l=Math.hypot(a[0],a[1],a[2])||1; n.setXYZ(i,a[0]/l,a[1]/l,a[2]/l); } n.needsUpdate=true; geo.userData=geo.userData||{}; geo.userData.chxS=1; return geo; }
const CHX_ICO=new Map();
function chxHair(root){ const P=root.userData; if(!P||!P.head) return;
  P.head.traverse(m=>{ if(!m.isMesh||!m.geometry) return; const ge=m.geometry;
    if(ge.type==='BoxGeometry'){ const q=ge.parameters; if(q.width>=0.04&&q.width<=0.12&&q.height<0.03&&q.depth<0.035&&m.parent===P.head){   // bigode: caixa vira mecha arredondada
        const g=new THREE.SphereGeometry(1,16,8), a=g.attributes.position; for(let i=0;i<a.count;i++){ const x=a.getX(i), y=a.getY(i), z=a.getZ(i); a.setXYZ(i,x*q.width/2,y*q.height/2*(1-0.35*x*x)-Math.abs(x)*q.height*0.25,z*q.depth/2); } g.computeVertexNormals(); m.geometry=g; } return; }
    if(ge.type==='DodecahedronGeometry'){ const r=ge.parameters.radius; let g=CHX_ICO.get(r); if(!g){ g=new THREE.IcosahedronGeometry(r,2); CHX_ICO.set(r,g); } m.geometry=g; return; }   // mechas arredondadas
    if(ge.type==='BufferGeometry'&&!ge.index&&ge.attributes.normal&&ge.attributes.position.count>60){ if(!ge.userData||!ge.userData.chxS){ m.geometry=chxSmoothN(ge.clone()); } } }); }
// orelhas: as caixinhas viram concha de verdade
function chxEars(root){ const P=root.userData; if(!P||!P.head) return; let geo=null;
  for(const m of P.head.children){ if(!m.isMesh||!m.geometry||m.geometry.type!=='BoxGeometry') continue; const p=m.geometry.parameters; if(Math.abs(p.width-0.014)>1e-4||Math.abs(p.height-0.044)>1e-4) continue;
    if(!geo){ geo=new THREE.SphereGeometry(1,12,10); const a=geo.attributes.position; for(let i=0;i<a.count;i++){ let x=a.getX(i), y=a.getY(i), z=a.getZ(i); if(x>0.2) x=0.2+(x-0.2)*0.4; const rim=Math.max(0,1-Math.abs(x)*1.6); a.setXYZ(i,x*0.008,y*0.026*(y>0?1.05:0.92),z*0.017*(z<0?1:0.9)+rim*0.0); } geo.computeVertexNormals(); }
    m.geometry=geo; m.rotation.y*=0.5; m.position.x*=1.02; } }
{ const bc0=buildChar; buildChar=function(id,vk,opts){ const r=bc0.apply(this,arguments);
    if(CHX.on&&!CHX.skip){ try{ chxEars(r); }catch(e){} try{ chxHair(r); }catch(e){} try{ chxSkin(r); }catch(e){ CHX.stat.fail++; console.warn('[Bunker] personagem sem malha única',e); } }
    return r; }; }
if(typeof doppleDress==='function'){ const dd0=doppleDress; doppleDress=function(){ CHX.skip++; try{ return dd0.apply(this,arguments); } finally{ CHX.skip--; } }; }
CMDS.personagem_hd={cheat:1,d:'personagem_hd [on|off] · personagens em malha única + texturas novas (recarregue a tela de personagens)',f:a=>{ const c=(a[0]||'').toLowerCase(); CHX.on=c!=='off'; charTexCache.clear(); charMatCache.clear(); cprint('personagens HD: '+(CHX.on?'ligado':'desligado')+` · convertidos ${CHX.stat.n}, falhas ${CHX.stat.fail}`); }};
