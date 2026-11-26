/* ================= v9 · SARGENTO VIVO — gestos humanos quando parado + rosto com expressões =================
   Vale para o modelo 3D com esqueleto (71_sarge). Três partes:
   1) ROSTO — a frente da cabeça é subdividida (a malha da Meshy tem só 3–5 vértices em volta de cada olho), e sobre
      ela são criados "morph targets" que deformam a própria pintura: piscar (cada olho), apertar os olhos, levantar
      as sobrancelhas, franzir, levantar uma sobrancelha só, meio sorriso de canto, abrir a boca e desviar o olhar.
      A boca aberta ganha um fundo escuro com a borda dos dentes. Pisca sozinho, com intervalo irregular e às vezes
      duas vezes seguidas.
   2) BRAÇOS POR IK — os gestos dizem onde a palma vai (e para onde apontam dedos e palma); um IK de dois ossos
      calcula ombro, cotovelo e punho, com o cotovelo puxado para um "polo". Dedos fecham por dedo (o indicador fica
      reto fora do gatilho quando segura a pistola).
   3) GESTOS — coldre com a pistola no quadril direito. Na fila: saca a pistola, olha, confere a câmara puxando o
      ferrolho, bate no carregador, vira para ver o outro lado e guarda de volta; bate a poeira das mangas e das
      coxas e ajeita a farda; massageia a nuca estalando o pescoço; puxa o cinto; olha o relógio; vigia em volta;
      estala os dedos. Entre um e outro: respiração, troca de apoio, cabeça viva e microexpressões. */
const SGL={on:true,force:null,now:null,smooth:8,S:0.82,gp:{n:0.006,f:0.044,u:-0.014,rake:0.3,roll:0}};
const _sa=new THREE.Vector3(), _sb=new THREE.Vector3(), _sc=new THREE.Vector3(), _sd=new THREE.Vector3(), _se=new THREE.Vector3();
const _sq1=new THREE.Quaternion(), _sq2=new THREE.Quaternion(), _sq3=new THREE.Quaternion(), _sm1=new THREE.Matrix4();
const SV3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
const sgSm=x=>{ x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); };
const sgBand=(x,a,b,c,d)=>x<=a||x>=d?0:x<b?sgSm((x-a)/(b-a)):x<=c?1:sgSm((d-x)/(d-c));   // trapézio suave

/* ======================= 1) ROSTO ======================= */
const SGF={eyeX:0.031,eyeY:1.588,mouthX:0.003,mouthY:1.531,names:['blinkL','blinkR','browUp','browIn','browOne','smirk','jaw','squint','look']};
/* campos de deslocamento (espaço de ligação, metros). Cada um devolve [dx,dy,dz] para um ponto do rosto. */
function sgFields(){
  const eye=(x,y,s)=>{ const ex=s*SGF.eyeX, u=Math.abs(x-ex)/0.0145; return u>=1?0:u<0.55?1:sgSm((1-u)/0.45); };
  const blink=s=>(x,y,z)=>{ const w=eye(x,y,s); if(!w||z<0.03) return null; const yb=1.5842, yt=1.5936, yf=1.5968; let dy=0;
      if(y>yb&&y<=yt) dy=-(y-yb)*0.5; else if(y>yt&&y<yf) dy=-(yt-yb)*0.5*(1-sgSm((y-yt)/(yf-yt)));
      else if(y<=yb&&y>yb-0.004) dy=0.0011*sgSm((y-(yb-0.004))/0.004);      // pálpebra de baixo sobe um tiquinho
      return dy?[0,dy*w,-Math.abs(dy)*0.12*w]:null; };
  const browX=(x,s,a,b,c,d)=>{ const ax=x*s; return ax<=0?0:sgBand(ax,a,b,c,d); };
  const browY=y=>sgBand(y,1.5895,1.597,1.611,1.628);
  return [
    blink(-1), blink(1),
    (x,y,z)=>{ if(z<0.02) return null; const w=sgBand(Math.abs(x),0.004,0.014,0.05,0.068)*browY(y); return w?[0,0.0042*w,0.0006*w]:null; },                      // browUp
    (x,y,z)=>{ if(z<0.02) return null; const ax=Math.abs(x), w=sgBand(ax,0.0,0.007,0.022,0.04)*browY(y); return w?[-Math.sign(x)*0.0016*w,-0.0022*w,0.0008*w]:null; },   // browIn
    (x,y,z)=>{ if(z<0.02||x>-0.002) return null; const w=browX(x,-1,0.006,0.018,0.048,0.066)*browY(y); return w?[0,0.0055*w,0.0006*w]:null; },                   // browOne (olho direito dele)
    (x,y,z)=>{ if(z<0.02) return null; const dx=x+0.028, dy=y-1.529, r=Math.hypot(dx/1.25,dy*1.1)/0.021; if(r>=1) return null; const w=sgSm(1-r); return [-0.0018*w,0.0056*w,0.0008*w]; },   // smirk
    (x,y,z)=>{ if(z<0.0) return null; const ax=Math.abs(x-SGF.mouthX), wx=ax<0.034?1:ax<0.058?sgSm((0.058-ax)/0.024):0; if(!wx) return null;
      const m=SGF.mouthY; let wy=0; if(y<m-0.0025) wy=y>1.474?1:sgSm((y-1.446)/0.028); else if(y<m) wy=sgSm((m-y)/0.0025); if(!wy) return null; const w=wx*wy; return [0,-0.0078*w,-0.0026*w]; },   // jaw
    (x,y,z)=>{ if(z<0.03) return null; let o=null; for(const s of [-1,1]){ const w=eye(x,y,s); if(!w) continue; const yc=1.5888; let dy=0;
        if(y>1.580&&y<1.5975) dy=(yc-y)*0.42; else if(y>=1.5975&&y<1.6035) dy=(yc-1.5975)*0.42*(1-sgSm((y-1.5975)/0.006)); else if(y<=1.580&&y>1.571) dy=(yc-1.580)*0.42*sgSm((y-1.571)/0.009);
        if(dy) o=[0,dy*w,0]; } return o; },                                                                                                                  // squint
    (x,y,z)=>{ if(z<0.03) return null; let o=null; for(const s of [-1,1]){ const ex=s*SGF.eyeX, u=Math.hypot((x-ex)/0.011,(y-1.5885)/0.0065); if(u>=1) continue; o=[0.0017*sgSm(1-u),0,0]; } return o; }   // look (+x)
  ]; }
function sgSubdivideFace(D){
  const g=D.geo, idx=g.index.array, P=g.attributes.position, N=g.attributes.normal, UV=g.attributes.uv, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight;
  const n=8, sel=[], keep=[];
  const va=new THREE.Vector3(), vb=new THREE.Vector3(), vc=new THREE.Vector3();
  for(let t=0;t<idx.length;t+=3){ const a=idx[t],b=idx[t+1],c=idx[t+2]; va.fromBufferAttribute(P,a); vb.fromBufferAttribute(P,b); vc.fromBufferAttribute(P,c);
    const inn=v=>Math.abs(v.x)<0.092&&v.y>1.425&&v.y<1.662&&v.z>0.012; if(inn(va)||inn(vb)||inn(vc)) sel.push(a,b,c); else keep.push(a,b,c); }
  const tris=sel.length/3, per=(n+1)*(n+2)/2, base=P.count, nv=base+tris*per;
  const pos=new Float32Array(nv*3), nor=new Float32Array(nv*3), uv=new Float32Array(nv*2), si=new Uint16Array(nv*4), sw=new Float32Array(nv*4);
  pos.set(P.array); nor.set(N.array); uv.set(UV.array); for(let i=0;i<SI.array.length;i++) si[i]=SI.array[i]; sw.set(SW.array);
  const out=keep.slice(); let w=base; const acc=new Map();
  for(let t=0;t<sel.length;t+=3){ const T=[sel[t],sel[t+1],sel[t+2]], start=w, rowStart=[];
    for(let i=0;i<=n;i++){ rowStart.push(w); for(let j=0;j<=n-i;j++){ const b0=1-(i+j)/n, b1=i/n, b2=j/n, B=[b0,b1,b2];
        for(let k=0;k<3;k++){ pos[w*3+k]=B[0]*P.array[T[0]*3+k]+B[1]*P.array[T[1]*3+k]+B[2]*P.array[T[2]*3+k]; nor[w*3+k]=B[0]*N.array[T[0]*3+k]+B[1]*N.array[T[1]*3+k]+B[2]*N.array[T[2]*3+k]; }
        for(let k=0;k<2;k++) uv[w*2+k]=B[0]*UV.array[T[0]*2+k]+B[1]*UV.array[T[1]*2+k]+B[2]*UV.array[T[2]*2+k];
        acc.clear(); for(let v=0;v<3;v++) for(let k=0;k<4;k++){ const bi=SI.array[T[v]*4+k], bw=SW.array[T[v]*4+k]*B[v]; if(bw>0) acc.set(bi,(acc.get(bi)||0)+bw); }
        const top=[...acc.entries()].sort((p,q)=>q[1]-p[1]).slice(0,4); let s=0; for(const e of top) s+=e[1]; for(let k=0;k<4;k++){ si[w*4+k]=top[k]?top[k][0]:0; sw[w*4+k]=top[k]?top[k][1]/(s||1):0; }
        const ln=Math.hypot(nor[w*3],nor[w*3+1],nor[w*3+2])||1; for(let k=0;k<3;k++) nor[w*3+k]/=ln; w++; } }
    const id=(i,j)=>rowStart[i]+j;
    for(let i=0;i<n;i++) for(let j=0;j<n-i;j++){ out.push(id(i,j),id(i+1,j),id(i,j+1)); if(j<n-i-1) out.push(id(i+1,j),id(i+1,j+1),id(i,j+1)); } }
  const ng=new THREE.BufferGeometry();
  ng.setAttribute('position',new THREE.BufferAttribute(pos,3)); ng.setAttribute('normal',new THREE.BufferAttribute(nor,3)); ng.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  ng.setAttribute('skinIndex',new THREE.BufferAttribute(si,4)); ng.setAttribute('skinWeight',new THREE.BufferAttribute(sw,4));
  ng.setIndex(nv>65535?new THREE.BufferAttribute(new Uint32Array(out),1):new THREE.BufferAttribute(new Uint16Array(out),1));
  // morphs: deslocamento suave em função da posição de descanso (vértices iguais em triângulos vizinhos andam juntos)
  const F=sgFields(), morph=[];
  for(const f of F){ const arr=new Float32Array(nv*3); for(let i=base;i<nv;i++){ const r=f(pos[i*3],pos[i*3+1],pos[i*3+2]); if(r){ arr[i*3]=r[0]; arr[i*3+1]=r[1]; arr[i*3+2]=r[2]; } } morph.push(new THREE.BufferAttribute(arr,3)); }
  ng.morphAttributes.position=morph; ng.morphTargetsRelative=true;
  ng.computeBoundingSphere(); ng.computeBoundingBox();
  D.geo=ng; D.mat.morphTargets=true; D.mat.needsUpdate=true;
  D.face={tris:tris,verts:nv-base};
}
/* superfície do rosto vista de frente: devolve z, uv e normal num ponto (x,y) */
function sgSurf(D){ if(D.surf) return D.surf; const g=D.geo0, P=g.attributes.position, UV=g.attributes.uv, idx=g.index.array, tris=[];
  for(let t=0;t<idx.length;t+=3){ const a=idx[t],b=idx[t+1],c=idx[t+2]; if(Math.max(P.getZ(a),P.getZ(b),P.getZ(c))>0.04&&P.getY(a)>1.47&&P.getY(a)<1.66) tris.push([a,b,c]); }
  const tri=new THREE.Triangle(), pt=new THREE.Vector3(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(), bar=new THREE.Vector3(), A3=new THREE.Vector3(), B3=new THREE.Vector3(), C3=new THREE.Vector3();
  let img=null; try{ const im=D.tex&&D.tex.image; if(im){ const cv=document.createElement('canvas'); cv.width=im.width; cv.height=im.height; const cx=cv.getContext('2d'); cx.drawImage(im,0,0); img={d:cx.getImageData(0,0,cv.width,cv.height).data,w:cv.width,h:cv.height}; } }catch(e){}
  const at=(x,y)=>{ let best=null; for(const T of tris){ a.fromBufferAttribute(P,T[0]); b.fromBufferAttribute(P,T[1]); c.fromBufferAttribute(P,T[2]); A3.copy(a); B3.copy(b); C3.copy(c);
      a.z=b.z=c.z=0; tri.set(a,b,c); pt.set(x,y,0); if(!tri.containsPoint(pt)) continue; tri.getBarycoord(pt,bar);
      const z=bar.x*A3.z+bar.y*B3.z+bar.z*C3.z; if(!best||z>best.z){ const n=new THREE.Vector3().crossVectors(B3.clone().sub(A3),C3.clone().sub(A3)).normalize(); if(n.z<0) n.negate();
        best={z,n,u:bar.x*UV.getX(T[0])+bar.y*UV.getX(T[1])+bar.z*UV.getX(T[2]),v:bar.x*UV.getY(T[0])+bar.y*UV.getY(T[1])+bar.z*UV.getY(T[2])}; } } return best; };
  const col=(x,y)=>{ const h=at(x,y); if(!h||!img) return null; const fy=D.tex.flipY===false?h.v:1-h.v; const px=Math.max(0,Math.min(img.w-1,Math.round(h.u*img.w))), py=Math.max(0,Math.min(img.h-1,Math.round(fy*img.h))); const i=(py*img.w+px)*4; return [img.d[i]/255,img.d[i+1]/255,img.d[i+2]/255]; };
  D.surf={at,col}; return D.surf; }
/* pálpebras: tira cor de pele (tirada da própria textura em volta do olho) com a linha dos cílios embaixo */
function sgLidsBuild(D,headBone){ const S=sgSurf(D); const hi=D.idx.Head; const inv=new THREE.Matrix4().compose(D.rp[hi],D.rq[hi],new THREE.Vector3(1,1,1)).invert(); const lids=[];
  for(const s of [-1,1]){ const ex=s*SGF.eyeX; const samp=[]; for(const [dx,yy] of [[0,1.5775],[-0.006,1.5785],[0.006,1.5785],[s*0.0155,1.5905],[0,1.6005]]){ const c=S.col(ex+dx,yy); if(c) samp.push(c); }
    const sk=samp.length?[0,1,2].map(k=>samp.reduce((a,c)=>a+c[k],0)/samp.length):[0.86,0.6,0.5];
    const nc=12, rows=[0,0.5,0.86,1], nv=(nc+1)*rows.length; const geo=new THREE.BufferGeometry();
    const pos=new Float32Array(nv*3), nor=new Float32Array(nv*3), colr=new Float32Array(nv*3); const ix=[];
    for(let r=0;r<rows.length;r++){ const sh=r===0?0.86:r===1?0.97:r===2?0.9:0.22; for(let i=0;i<=nc;i++){ const k=r*(nc+1)+i; colr[k*3]=sk[0]*sh; colr[k*3+1]=sk[1]*sh*(r===3?0.85:1); colr[k*3+2]=sk[2]*sh*(r===3?0.85:1); } }
    for(let r=0;r<rows.length-1;r++) for(let i=0;i<nc;i++){ const a=r*(nc+1)+i, b=a+1, c=a+nc+1, d=c+1; ix.push(a,c,b, b,c,d); }
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); geo.setAttribute('normal',new THREE.BufferAttribute(nor,3)); geo.setAttribute('color',new THREE.BufferAttribute(colr,3)); geo.setIndex(ix);
    const m=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({vertexColors:true,shininess:8,specular:0x161616,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    m.frustumCulled=false; m.visible=false; m.userData={ex,s,nc,rows,inv,S,last:-1}; headBone.add(m); lids.push(m); }
  return lids; }
function sgLidUpdate(m,b){ const U=m.userData; if(Math.abs(b-U.last)<0.004) return; U.last=b; const P=m.geometry.attributes.position.array, N=m.geometry.attributes.normal.array, v=new THREE.Vector3(), n=new THREE.Vector3();
  const nrm=new THREE.Matrix3().setFromMatrix4(U.inv);
  for(let r=0;r<U.rows.length;r++) for(let i=0;i<=U.nc;i++){ const u=i/U.nc*2-1, k=r*(U.nc+1)+i; const x=U.ex+u*0.0128;
    const inner=u*U.s<0?1:0; const yt=1.5958-0.0042*u*u+(inner?0.0006*Math.abs(u):0), yc=1.5846+0.0021*u*u; const yb=yt-b*(yt-yc); const y=yt+(yb-yt)*U.rows[r];
    const h=U.S.at(x,y)||{z:0.08,n:new THREE.Vector3(0,0,1)}; v.set(x,y,h.z).addScaledVector(h.n,0.0009+0.0005*b).applyMatrix4(U.inv); P[k*3]=v.x; P[k*3+1]=v.y; P[k*3+2]=v.z;
    n.copy(h.n).applyMatrix3(nrm).normalize(); N[k*3]=n.x; N[k*3+1]=n.y; N[k*3+2]=n.z; }
  m.geometry.attributes.position.needsUpdate=true; m.geometry.attributes.normal.needsUpdate=true; m.geometry.computeBoundingSphere(); }
/* pesos dos ombros: o auto-rig deixa o deltoide quase todo num osso só, e o braço caído dobra em quina.
   Suaviza (Laplaciano sobre a malha soldada) só a parte dos pesos que é de tronco/clavícula/braço, perto do ombro. */
function sgSmoothShoulders(D,iters,alpha){ const g=D.geo, P=g.attributes.position, SI=g.attributes.skinIndex, SW=g.attributes.skinWeight, idx=g.index.array, n=P.count;
  const weld=new Int32Array(n), key=new Map(); let nw=0;
  for(let i=0;i<n;i++){ const k=Math.round(P.getX(i)*2e4)+','+Math.round(P.getY(i)*2e4)+','+Math.round(P.getZ(i)*2e4); let w=key.get(k); if(w==null){ w=nw++; key.set(k,w); } weld[i]=w; }
  const nb=Array.from({length:nw},()=>new Set()); for(let t=0;t<idx.length;t+=3){ const a=weld[idx[t]],b=weld[idx[t+1]],c=weld[idx[t+2]]; nb[a].add(b).add(c); nb[b].add(a).add(c); nb[c].add(a).add(b); }
  for(const side of [D.lSide,D.rSide]){ const set=['Spine1','Spine2',side+'Shoulder',side+'Arm'].map(k=>D.idx[k]).filter(v=>v!=null); const arm=D.pos(side+'Arm');
    // pesos por vértice soldado (só os ossos do conjunto), e quais entram
    const W=Array.from({length:nw},()=>new Float32Array(set.length)), act=new Uint8Array(nw), fall=new Float32Array(nw), rep=new Int32Array(nw).fill(-1);
    for(let i=0;i<n;i++){ const w=weld[i]; if(rep[w]>=0) continue; rep[w]=i; const d=Math.hypot(P.getX(i)-arm.x,(P.getY(i)-arm.y)*1.15,P.getZ(i)-arm.z); if(d<0.17){ act[w]=1; fall[w]=d<0.09?1:sgSm((0.17-d)/0.08); }
      for(let k=0;k<4;k++){ const j=set.indexOf(SI.array[i*4+k]); if(j>=0) W[w][j]+=SW.array[i*4+k]; } }
    const sum=w=>W[w].reduce((a,b)=>a+b,0);
    for(let it=0;it<iters;it++){ const nwW=W.map(x=>x.slice());
      for(let w=0;w<nw;w++){ if(!act[w]) continue; const m=sum(w); if(m<1e-4) continue; const avg=new Float32Array(set.length); let c=0;
        for(const o of nb[w]){ const mo=sum(o); if(mo<1e-4) continue; for(let j=0;j<set.length;j++) avg[j]+=W[o][j]/mo; c++; } if(!c) continue;
        const a=alpha*fall[w]; for(let j=0;j<set.length;j++) nwW[w][j]=(1-a)*W[w][j]+a*m*avg[j]/c; }
      for(let w=0;w<nw;w++) W[w]=nwW[w]; }
    // grava de volta (mantém os outros ossos, fica com os 4 maiores)
    for(let i=0;i<n;i++){ const w=weld[i]; if(!act[w]) continue; const acc=new Map();
      for(let k=0;k<4;k++){ const b=SI.array[i*4+k], v=SW.array[i*4+k]; if(v>0&&set.indexOf(b)<0) acc.set(b,(acc.get(b)||0)+v); }
      for(let j=0;j<set.length;j++) if(W[w][j]>1e-4) acc.set(set[j],(acc.get(set[j])||0)+W[w][j]);
      const top=[...acc.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4); let s=0; for(const e of top) s+=e[1];
      for(let k=0;k<4;k++){ SI.array[i*4+k]=top[k]?top[k][0]:0; SW.array[i*4+k]=top[k]?top[k][1]/(s||1):0; } } }
  SI.needsUpdate=true; SW.needsUpdate=true; }
/* boca aberta: fundo escuro + borda dos dentes, colados na superfície (presos ao osso da cabeça) */
function sgMouthGeo(D){ // grade de profundidade do rosto em volta da boca (raio de frente contra a malha original)
  const g=D.geo0, P=g.attributes.position, idx=g.index.array, tris=[];
  for(let t=0;t<idx.length;t+=3){ const a=idx[t],b=idx[t+1],c=idx[t+2]; const z=Math.max(P.getZ(a),P.getZ(b),P.getZ(c)), y=P.getY(a); if(z>0.05&&y>1.49&&y<1.57) tris.push([a,b,c]); }
  const tri=new THREE.Triangle(), pt=new THREE.Vector3(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(), bar=new THREE.Vector3();
  const zAt=(x,y)=>{ let best=-1; for(const T of tris){ a.fromBufferAttribute(P,T[0]); b.fromBufferAttribute(P,T[1]); c.fromBufferAttribute(P,T[2]);
      a.z=b.z=c.z=0; tri.set(a,b,c); pt.set(x,y,0); if(!tri.containsPoint(pt)) continue; tri.getBarycoord(pt,bar);
      const z=bar.x*P.getZ(T[0])+bar.y*P.getZ(T[1])+bar.z*P.getZ(T[2]); if(z>best) best=z; } return best; };
  return zAt; }

/* ======================= 2) BRAÇOS POR IK ======================= */
function sgArmInfo(D,g){ const side=g==='L'?D.lSide:D.rSide, C=D.corr[g], r=k=>D.pos(side+k);
  const shR=r('Arm'), el=r('ForeArm'), wr=r('Hand'), piv=r('Shoulder'), sx=Math.sign(shR.x-piv.x)||1;
  const clavB=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,sx*MXC.clavFwd,-sx*MXC.clavDrop,'YXZ'));
  const sh=shR.clone().sub(piv).applyQuaternion(clavB).add(piv);
  const u1=el.clone().sub(sh).applyQuaternion(C), u2=wr.clone().sub(el).applyQuaternion(C);
  const mid=r('HandMiddle1'); const F0=mid.clone().sub(wr).applyQuaternion(C).normalize();
  const A=r('HandIndex1').sub(r('HandPinky1')); let N=new THREE.Vector3().crossVectors(A,mid.clone().sub(wr)); if(N.y>0) N.negate(); N.applyQuaternion(C);
  N.sub(F0.clone().multiplyScalar(N.dot(F0))).normalize();
  const A0=A.applyQuaternion(C); A0.sub(F0.clone().multiplyScalar(A0.dot(F0))).sub(N.clone().multiplyScalar(A0.dot(N))).normalize();
  const hl=mid.distanceTo(wr);
  const palm=F0.clone().multiplyScalar(hl*0.62).add(N.clone().multiplyScalar(0.012));       // centro da palma, a partir do punho
  const B0=new THREE.Matrix4().makeBasis(F0,N,new THREE.Vector3().crossVectors(F0,N));
  return {g,sh,shR,piv,clavB,u1,u2,L1:u1.length(),L2:u2.length(),F0,N0:N,A0,palm,B0,B0i:B0.clone().transpose(),hl}; }
/* rotação da mão (espaço do "up") que leva o descanso (F0,N0) para (F,N) */
function sgHandQ(A,F,N,out){ const f=_sa.copy(F).normalize(), nn=_sb.copy(N); nn.sub(_sc.copy(f).multiplyScalar(nn.dot(f))); if(nn.lengthSq()<1e-8) nn.set(0,0,1); nn.normalize();
  _sm1.makeBasis(f,nn,_sc.crossVectors(f,nn)).multiply(A.B0i); return out.setFromRotationMatrix(_sm1); }
const _qx=new THREE.Quaternion(), _ax=new THREE.Vector3(1,0,0);
function sgIKlen(A,phi){ _qx.setFromAxisAngle(_ax,phi); return _sd.copy(A.u2).applyQuaternion(_qx).add(A.u1).length(); }
/* resolve o braço: palma em P (espaço "up"), dedos F, palma N, cotovelo para o polo */
function sgSolve(A,arm,P,F,N,pole,res,Qin){ const Qd=Qin?res.qh.copy(Qin):sgHandQ(A,F,N,res.qh);
  const wr=_se.copy(A.palm).applyQuaternion(Qd).multiplyScalar(-1).add(P);        // punho = palma - offset
  // clavícula: quando o alvo passa do alcance (ou vai muito à frente/cruzado), o ombro avança/sobe até ~5,5 cm
  const U0=arm.userData; let sh=A.sh;
  if(U0&&U0.piv&&U0.sh0){ const reach=(A.L1+A.L2)*0.97, ex=_sb.copy(wr).sub(A.sh).length()-reach;
    // ombro acompanha: avança quando estica, sobe quando a mão vai alto (sobe junto com o cotovelo)
    const dy0=(wr.y-A.sh.y)/Math.max(1e-4,_sb.copy(wr).sub(A.sh).length()); const amt=Math.min(0.055,Math.max(0,ex+0.045))*Math.max(sgSm((dy0+0.75)/0.45),sgSm((ex-0.015)/0.02)), up=Math.max(0,Math.min(0.03,(wr.y-(A.sh.y-0.08))*0.12));
    const cl=_sc.copy(A.sh).sub(U0.piv), clen=cl.length(); const dir=_sb.copy(wr).sub(A.sh).normalize().multiplyScalar(amt).add(_sd.set(0,up,0)); dir.sub(_sd.copy(cl).multiplyScalar(dir.dot(cl)/(clen*clen)));
    const ang=Math.min(0.42,dir.length()/clen);
    if(ang>0.004){ const ax2=_sd.crossVectors(cl,dir).normalize(); U0.clav=(U0.clav||new THREE.Quaternion()).setFromAxisAngle(ax2,ang).multiply(A.clavB);
        arm.position.copy(A.shR).sub(U0.piv).applyQuaternion(U0.clav).add(U0.piv); sh=arm.position; }
    else if(U0.clav){ U0.clav=null; arm.position.copy(U0.sh0); } }
  const d=wr.sub(sh); let dist=d.length(); const dn=d.normalize();
  dist=Math.min(Math.max(dist,Math.abs(A.L1-A.L2)+0.03),(A.L1+A.L2)*0.997);
  let lo=-2.75, hi=0; for(let i=0;i<22;i++){ const m=(lo+hi)/2; if(sgIKlen(A,m)>dist) hi=m; else lo=m; }
  const phi=(lo+hi)/2; const qfo=res.qf.setFromAxisAngle(_ax,phi);
  const v=_sd.copy(A.u2).applyQuaternion(qfo).add(A.u1).normalize(); const Q=res.qa.setFromUnitVectors(v,dn);
  const e=_sa.copy(A.u1).applyQuaternion(Q); e.sub(_sb.copy(dn).multiplyScalar(e.dot(dn)));
  const pl=_sb.set(pole[0],pole[1],pole[2]); pl.sub(_sc.copy(dn).multiplyScalar(pl.dot(dn)));
  if(e.lengthSq()>1e-8&&pl.lengthSq()>1e-8){ const ang=Math.atan2(_sc.crossVectors(e,pl).dot(dn),e.dot(pl)); _sq1.setFromAxisAngle(dn,ang); Q.premultiply(_sq1); }
  arm.quaternion.copy(Q); arm.userData.fo.quaternion.copy(qfo);
  _sq2.copy(Q).multiply(qfo).invert(); arm.userData.hand.quaternion.copy(_sq2).multiply(Qd);
  res.elbow=(res.elbow||new THREE.Vector3()).copy(A.u1).applyQuaternion(Q).add(sh);
  res.wrist=(res.wrist||new THREE.Vector3()).copy(A.u2).applyQuaternion(qfo).add(A.u1).applyQuaternion(Q).add(sh);
  if(SGL.dbg) res.err=_sa.copy(A.palm).applyQuaternion(Qd).add(res.wrist).distanceTo(P);
  return res; }
/* FK do descanso do jogo (braços caídos) → mesma descrição de palma/dedos/polo usada nos gestos */
function sgRestHand(A,eul){ const Qa=new THREE.Quaternion().setFromEuler(new THREE.Euler(...eul[0])), Qf=new THREE.Quaternion().setFromEuler(new THREE.Euler(...eul[1]));
  const Q=Qa.clone().multiply(Qf); const wr=A.u2.clone().applyQuaternion(Qf).add(A.u1).applyQuaternion(Qa).add(A.sh);
  const el=A.u1.clone().applyQuaternion(Qa).add(A.sh); const p=A.palm.clone().applyQuaternion(Q).add(wr);
  const mid=wr.clone().lerp(A.sh,0.5); const pole=el.clone().sub(mid).normalize();
  return {p:p.toArray(),F:A.F0.clone().applyQuaternion(Q).toArray(),N:A.N0.clone().applyQuaternion(Q).toArray(),pole:pole.toArray(),c:0.3}; }

/* ======================= 3) PISTOLA E COLDRE ======================= */
/* pontos da M1911 (modelo do jogo, sem escala): cano em -Z, topo em +Y */
const SGG={grip:[0,-0.058,0.072],slideRear:[0,0.058,0.088],slideTop:[0,0.062,0.02],magBase:[0,-0.13,0.1],muzzle:[0,0.016,-0.136]};
function sgGunInHand(A){ // orientação/posição da pistola no grupo da mão (descanso)
  const B=A.F0.clone(), U=A.A0.clone(); // cano ao longo do dorso da mão, topo do lado do indicador
  // inclinação natural do cabo (a pistola "deita" uns 14° para cima no punho)
  const gp=SGL.gp; B.applyAxisAngle(new THREE.Vector3().crossVectors(B,U).normalize(),gp.rake);
  U.sub(B.clone().multiplyScalar(U.dot(B))).normalize(); if(gp.roll){ U.applyAxisAngle(B,gp.roll); }
  const zg=B.clone().negate(), yg=U, xg=new THREE.Vector3().crossVectors(yg,zg);
  const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xg,yg,zg));
  const S=SGL.S, gc=SV3(SGG.grip).multiplyScalar(S).applyQuaternion(q);
  const gripAt=A.palm.clone().add(A.N0.clone().multiplyScalar(gp.n)).add(A.F0.clone().multiplyScalar(gp.f)).add(A.A0.clone().multiplyScalar(gp.u));
  return {q,pos:gripAt.sub(gc)}; }
/* coldre no quadril direito (lado x<0), um pouco à frente para não bater no braço; cano para baixo, cabo para trás */
const SGH={grip:[-0.19,0.965,0.085],cant:-0.3};
function sgHolsterGun(){ const B=new THREE.Vector3(0,-1,0), U=new THREE.Vector3(0,0,1); const qc=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),SGH.cant); B.applyQuaternion(qc); U.applyQuaternion(qc);
  const tilt=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),0.1); B.applyQuaternion(tilt); U.applyQuaternion(tilt);   // acompanha o quadril
  const zg=B.clone().negate(), yg=U, xg=new THREE.Vector3().crossVectors(yg,zg); const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xg,yg,zg));
  const S=SGL.S, pos=SV3(SGH.grip).sub(SV3(SGG.grip).multiplyScalar(S).applyQuaternion(q)); return {q,pos}; }
function sgHolsterMesh(){ const S=SGL.S, g=new THREE.Group();
  const lea=new THREE.MeshLambertMaterial({color:0x3b2416}), lea2=new THREE.MeshLambertMaterial({color:0x2a180e}), met=new THREE.MeshLambertMaterial({color:0x8a7a5a});
  // corpo do coldre (cobre ferrolho e cano até antes do guarda-mato), em coordenadas da pistola
  const sh=new THREE.Shape(); const pts=[[0.07,0.08],[-0.15,0.08],[-0.162,0.056],[-0.162,-0.028],[-0.035,-0.036],[0.0,-0.058],[0.03,-0.032],[0.045,-0.004],[0.07,-0.002]];
  sh.moveTo(pts[0][0],pts[0][1]); for(const p of pts.slice(1)) sh.lineTo(p[0],p[1]);    // (x = eixo do cano, y = altura)
  const geo=new THREE.ExtrudeGeometry(sh,{depth:0.034,bevelEnabled:true,bevelThickness:0.008,bevelSize:0.006,bevelSegments:3,steps:1}); geo.translate(0,0,-0.017);
  const body=new THREE.Mesh(geo,lea); body.rotation.set(0,-Math.PI/2,0);        // forma → espaço da pistola
  const hold=new THREE.Group(); hold.add(body); hold.scale.setScalar(S); g.add(hold);
  // presilha do cinto e aba com botão
  const loop=new THREE.Mesh(new THREE.BoxGeometry(0.066,0.05,0.012),lea2); loop.position.set(0,0.04*S,0.05*S); g.add(loop);
  const flap=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.012,0.07),lea2); flap.position.set(0.026*S,0.075*S,0.06*S); g.add(flap);
  const snap=new THREE.Mesh(new THREE.CylinderGeometry(0.0055,0.0055,0.004,8),met); snap.rotation.z=Math.PI/2; snap.position.set(0.045*S,0.075*S,0.05*S); g.add(snap);
  g.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.frustumCulled=false; } });
  return g; }

/* ======================= 4) GESTOS ======================= */
/* Cada gesto é uma lista de chaves no tempo. Canais: L/R (mão: p palma, F dedos, N palma, pole, c fechar, fc por dedo
   [polegar,indicador,médio,anelar,mínimo], ou 'rest'), hd (cabeça x,y,z), ch (tronco), lk/lw (olhar para um ponto),
   fx (rosto), kn (dobra os joelhos), g (pistola: 0 no coldre, 1 na mão). Chave sem canal herda a anterior. */
const SG_FX=['bu','bi','b1','sm','jw','sq','ey','lx'];
const SG_REST={hd:[0,0,0],ch:[0,0,0],lk:[0,1.5,1],lw:0,kn:0,fx:{}};
const S_IDX={middle:0};
function sgGestures(K){ // K: helpers com pontos já calculados
  const R='rest', Gp=K.gripPre, Gg=K.grip;
  const G={};
  /* --- saca a pistola, confere e guarda --- */
  const front=K.gunPose([-0.02,1.2,0.27],[0.22,-0.42,0.88],[0.05,0.91,0.41]);
  const front2=K.gunPose([-0.035,1.21,0.28],[0.12,-0.3,0.95],[-0.72,0.66,0.2]);
  const lkGun=[-0.01,1.21,0.31];
  const tap=K.gunPose([0.03,1.17,0.25],[0.3,-0.25,0.92],[0.25,0.9,0.3]);
  G.pistol={dur:9.2,keys:[
    {t:0,L:R,R:R,g:0,fx:{}},
    {t:0.55,L:Object.assign({},Gp,{c:0.25,fc:null}),lk:SGH.grip,lw:0.75,ch:[0.06,-0.08,0],fx:{bi:0.2}},
    {t:0.95,L:Object.assign({},Gg,{c:0.85,fc:[0.55,0.12,0.9,0.95,0.95]}),e:1},
    {t:1.15,L:Object.assign({},Gg,{c:0.9,fc:[0.62,0.14,0.98,1,1]}),g:1},
    {t:1.45,L:Object.assign({},Gp),lw:0.6},
    {t:1.95,L:front,lk:lkGun,lw:0.9,ch:[0.03,-0.08,0],hd:[0,0,0.05],fx:{bi:0.35,sq:0.15}},
    {t:2.12,R:K.pose('R',[0.1,1.1,0.24],[-0.35,0.25,0.9],[-0.55,-0.75,0.1],[1,-0.6,-0.4],0.3)},
    {t:2.38,R:K.onGun(front,[0.0,0.095,0.06],[-1,0,0],[0,-1,0],0.55,[0.65,0.5,0.55,0.6,0.65])},
    {t:2.6,R:K.onGun(front,[0.0,0.088,0.075],[-1,0,0],[0,-1,0],0.55,[0.7,0.45,0.5,0.55,0.6]),e:1},
    {t:2.85,R:K.onGun(front,[0.0,0.088,0.11],[-1,0,0],[0,-1,0],0.6,[0.75,0.5,0.55,0.6,0.65]),ch:[0.11,-0.1,0],hd:[0.1,0.05,0.08],fx:{sq:0.65,b1:0.55,bi:0.15},e:1},
    {t:3.25,e:1},
    {t:3.45,R:K.onGun(front,[0.0,0.088,0.07],[-1,0,0],[0,-1,0],0.6,[0.6,0.5,0.55,0.6,0.65]),fx:{sq:0.3,b1:0.25}},
    {t:3.75,L:tap,R:K.onGun(tap,[0,-0.19,0.125],[-0.15,0,1],[0,1,0],0.15,null),ch:[0.05,-0.06,0]},
    {t:3.9,R:K.onGun(tap,[0,-0.158,0.115],[-0.15,0,1],[0,1,0],0.2,null),e:1},
    {t:4.05,R:K.onGun(tap,[0,-0.215,0.12],[-0.15,0,1],[0,1,0],0.15,null)},
    {t:4.5,R:R,L:front2,lk:[-0.04,1.22,0.31],fx:{sm:0.35,bi:0.1,b1:0.2,sq:0.1}},
    {t:5.25,L:K.gunPose([-0.05,1.21,0.29],[0.1,-0.25,0.96],[-0.4,0.86,0.3]),hd:[0.02,0.02,-0.04]},
    {t:5.7,L:front,fx:{sm:0.5,bi:0,b1:0}},
    {t:6.15,L:K.gunPose([-0.16,1.08,0.22],[0.05,-0.85,0.5],[0,0.5,0.86]),lk:SGH.grip,lw:0.55,ch:[0.04,-0.06,0]},
    {t:6.6,L:Object.assign({},Gp)},
    {t:7.0,L:Object.assign({},Gg),e:1,lw:0.7},
    {t:7.15,g:0,L:Object.assign({},Gg,{c:0.3,fc:null})},
    {t:7.45,L:K.offset(Gg,[-0.025,-0.005,0.0],{c:0.15}),e:1},
    {t:7.65,L:K.offset(Gg,[-0.018,-0.01,0.0],{c:0.15})},
    {t:8.3,L:R,lw:0,ch:[0,0,0],hd:[0,0,0],fx:{sm:0.25}},
    {t:9.2,fx:{}}]};
  /* --- bate a poeira: manga esquerda, manga direita, coxas, ajeita a farda --- */
  const armUpR=K.pose('R',[0.03,1.08,0.27],[-0.98,0.05,0.2],[0.05,-0.25,-0.97],[1,-0.4,-0.6],0.35);
  const armUpL=K.pose('L',[0.06,1.1,0.25],[0.98,0.05,0.2],[-0.05,-0.25,-0.97],[-1,-0.4,-0.6],0.35);
  const strokes=[];
  for(let i=0;i<3;i++){ const t0=0.75+i*0.36; strokes.push({t:t0,L:K.brush(armUpR,'R',0.28,0.032,0.12),fx:{bi:0.25,sq:0.2}},{t:t0+0.18,L:K.brush(armUpR,'R',0.82,0.026,0.06),e:i===2?1:0}); }
  const strokes2=[];
  for(let i=0;i<2;i++){ const t0=2.45+i*0.36; strokes2.push({t:t0,R:K.brush(armUpL,'L',0.62,0.03,0.1)},{t:t0+0.18,R:K.brush(armUpL,'L',0.95,0.024,0.05)}); }
  const thigh=(s,y,c)=>K.pose(s,[s==='L'?-0.125:0.125,y,0.15],[0,-0.55,0.84],[0,-0.1,-1],[s==='L'?-1:1,0.2,-0.4],c||0.05,'body');
  G.dust={dur:7.7,keys:[
    {t:0,L:R,R:R,fx:{}},
    {t:0.45,R:armUpR,lk:[0.08,1.05,0.3],lw:0.7,ch:[0.08,0.12,0],L:K.brush(armUpR,'R',0.25,0.06,0.12)},
    ...strokes,
    {t:2.05,R:R,L:armUpL,lk:[-0.08,1.05,0.3],ch:[0.08,-0.12,0]},
    ...strokes2,
    {t:3.35,R:K.brush(armUpL,'L',0.92,0.045,0.08),L:R,ch:[0.06,0,0]},
    {t:3.7,R:R,L:R,lk:[0,0.9,0.4],lw:0.6,ch:[0.24,0,0],kn:0.5,fx:{bi:0.1,jw:0.1}},
    {t:3.95,L:thigh('L',0.905),R:thigh('R',0.905),ch:[0.34,0,0],kn:0.9},
    {t:4.12,L:thigh('L',0.875),R:thigh('R',0.875),e:1},
    {t:4.3,L:thigh('L',0.925),R:thigh('R',0.925)},
    {t:4.47,L:thigh('L',0.87),R:thigh('R',0.87),e:1},
    {t:4.65,L:thigh('L',0.93),R:thigh('R',0.93)},
    {t:5.0,L:K.pose('L',[-0.07,1.07,0.3],[0.2,0.5,0.4],[0.3,0.1,-1],[-1,-0.5,-0.3],0.1),R:K.pose('R',[0.07,1.07,0.3],[-0.2,0.5,0.4],[-0.3,0.1,-1],[1,-0.5,-0.3],0.1),ch:[0.1,0,0],kn:0.25,lw:0.4,lk:[0,1.0,0.5]},
    {t:5.4,L:K.pose('L',[-0.075,1.29,0.2],[0.25,-0.2,0.15],[0.3,0,-1],[-1,-0.5,-0.3],0.05),R:K.pose('R',[0.075,1.29,0.2],[-0.25,-0.2,0.15],[-0.3,0,-1],[1,-0.5,-0.3],0.05),ch:[-0.03,0,0],kn:0,lw:0.35,lk:[0,1.1,0.5],fx:{jw:0.25,bu:0.35}},
    {t:5.95,L:K.pose('L',[-0.08,1.09,0.21],[0.25,-0.6,0.1],[0.3,0,-1],[-1,-0.5,-0.3],0.05),R:K.pose('R',[0.08,1.09,0.21],[-0.25,-0.6,0.1],[-0.3,0,-1],[1,-0.5,-0.3],0.05),fx:{jw:0,bu:0.15,sm:0.15}},
    {t:6.75,L:R,R:R,lw:0,ch:[0,0,0],fx:{sm:0.2}},
    {t:7.7,fx:{}}]};
  /* --- massageia a nuca e estala o pescoço --- */
  const nape=(dx,dy)=>K.pose('L',[-0.04+dx,1.45+dy,-0.08],[0.6,0.7,0.15],[0.05,-0.15,1],[-1,0.15,0.2],0.45);
  G.neck={dur:5.2,keys:[
    {t:0,L:R,R:R,fx:{}},
    {t:0.32,L:K.pose('L',[-0.19,1.3,0.1],[0.15,0.95,-0.1],[0.6,0,0.8],[-0.8,-0.6,0],0.4)},
    {t:0.68,L:nape(0,0),hd:[0.18,0,0],fx:{ey:0.4,bi:0.15}},
    {t:0.95,L:nape(0.012,0.008)},{t:1.25,L:nape(-0.006,-0.004)},{t:1.55,L:nape(0.012,0.006)},
    {t:1.95,hd:[0.05,0,0.36],fx:{ey:1,jw:0.18,bi:0.35},e:1},
    {t:2.25,hd:[0.04,0,0.4]},
    {t:2.75,hd:[0.04,0,-0.38],L:nape(0,0.004),fx:{ey:1,jw:0.12,bi:0.4}},
    {t:3.05,hd:[0.04,0,-0.42],e:1},
    {t:3.35,hd:[0.02,0,-0.1],L:K.pose('L',[-0.2,1.24,0.08],[0.15,-0.6,0.6],[0.7,0,0.7],[-0.8,-0.6,0],0.35),fx:{ey:0,jw:0,bu:0.2}},
    {t:3.75,hd:[0,0,0],L:R,fx:{ey:0,jw:0,bu:0.25,sm:0.25}},
    {t:4.2,ch:[-0.04,0,0]},
    {t:5.2,ch:[0,0,0],fx:{}}]};
  /* --- puxa o cinto para cima (polegares no cinto) --- */
  const belt=(s,dy)=>K.pose(s,[s==='L'?-0.105:0.105,0.985+dy,0.17],[s==='L'?0.25:-0.25,-0.95,0.1],[0,0.05,-1],[s==='L'?-1:1,-0.2,-0.6],0.45,'body',[0.15,0.7,0.75,0.8,0.8]);
  G.belt={dur:4.4,keys:[
    {t:0,L:R,R:R,fx:{}},
    {t:0.6,L:belt('L',0),R:belt('R',0),lk:[0,1.0,0.6],lw:0.35,fx:{bi:0.15}},
    {t:0.9,L:belt('L',0.03),R:belt('R',0.03),ch:[-0.05,0,0],fx:{jw:0.12,bu:0.2}},
    {t:1.1,L:belt('L',0.005),R:belt('R',0.005)},
    {t:1.3,L:belt('L',0.03),R:belt('R',0.03),ch:[-0.06,0,0.04]},
    {t:1.9,ch:[-0.02,0,-0.05],lw:0,hd:[-0.06,0.15,0],fx:{sm:0.4,jw:0,bu:0}},
    {t:2.9,L:R,R:R,ch:[0,0,0],hd:[0,0,0]},
    {t:4.4,fx:{}}]};
  /* --- olha o relógio no punho esquerdo --- */
  const watch=K.pose('R',[0.03,1.27,0.25],[-0.95,0.05,0.3],[0.15,-0.75,-0.64],[1,-0.6,-0.3],0.35);
  G.watch={dur:4.0,keys:[
    {t:0,L:R,R:R,fx:{}},
    {t:0.6,R:watch,lk:[0.02,1.29,0.26],lw:0.95,fx:{bu:0.15}},
    {t:0.75,R:K.offset(watch,[0,0.01,0],{})},
    {t:1.25,L:K.pose('L',[-0.01,1.275,0.3],[0.9,0.1,0.4],[-0.2,-0.8,-0.6],[-1,-0.6,-0.3],0.55,'up',[0.6,0.05,0.85,0.9,0.9]),fx:{bu:0.3,sq:0.2}},
    {t:1.4,L:K.pose('L',[-0.005,1.27,0.29],[0.9,0.1,0.4],[-0.2,-0.8,-0.6],[-1,-0.6,-0.3],0.55,'up',[0.6,0.05,0.85,0.9,0.9])},
    {t:1.55,L:K.pose('L',[-0.01,1.275,0.3],[0.9,0.1,0.4],[-0.2,-0.8,-0.6],[-1,-0.6,-0.3],0.55,'up',[0.6,0.05,0.85,0.9,0.9])},
    {t:2.1,L:R,fx:{bu:0,bi:0.3,sm:0}},
    {t:2.6,R:R,lw:0,lk:[0,1.5,2],fx:{bi:0.2}},
    {t:4.0,fx:{}}]};
  /* --- vigia em volta (mão no cabo da pistola) --- */
  const rest2=K.offset(Gg,[-0.01,0.02,-0.012],{c:0.4,fc:[0.3,0.4,0.5,0.55,0.6]});
  G.scan={dur:5.6,keys:[
    {t:0,L:R,R:R,fx:{}},
    {t:0.7,L:rest2,hd:[0.02,0.75,0],ch:[0,0.22,0],fx:{sq:0.45,bi:0.3,lx:0.6}},
    {t:1.6,hd:[0.04,0.82,0.02],e:1},
    {t:2.6,hd:[-0.02,-0.72,0],ch:[0,-0.2,0],fx:{sq:0.5,bi:0.35,lx:-0.7}},
    {t:3.5,hd:[0.0,-0.78,-0.02],e:1},
    {t:4.3,hd:[0,0,0],ch:[0,0,0],L:R,fx:{sq:0.1,bi:0.1,lx:0}},
    {t:5.6,fx:{}}]};
  /* --- estala os dedos (mãos entrelaçadas, braços para frente) --- */
  const kn=(s,z)=>K.pose(s,[s==='L'?-0.012:0.012,1.2,z],[s==='L'?0.95:-0.95,0.25,0.15],[s==='L'?0.25:-0.25,0.1,0.96],[s==='L'?-1:1,-0.7,0],0.75);
  G.knuckles={dur:3.6,keys:[
    {t:0,L:R,R:R,fx:{}},
    {t:0.6,L:kn('L',0.28),R:kn('R',0.28),lk:[0,1.2,0.4],lw:0.4,fx:{bi:0.2}},
    {t:1.05,L:kn('L',0.4),R:kn('R',0.4),ch:[0.03,0,0],fx:{ey:1,jw:0.15,bi:0.3},e:1},
    {t:1.35,L:kn('L',0.36),R:kn('R',0.36)},
    {t:1.6,L:kn('L',0.41),R:kn('R',0.41),e:1},
    {t:2.25,L:R,R:R,lw:0,ch:[0,0,0],fx:{ey:0,jw:0,sm:0.35}},
    {t:3.6,fx:{}}]};
  return G; }
/* ordem dos gestos (com descanso entre eles) */
const SG_SEQ=[['pistol',2.6],['scan',3.2],['dust',2.8],['neck',3.4],['belt',2.4],['watch',3.0],['pistol',2.2],['knuckles',3.4],['dust',2.6],['scan',2.6]];

/* ---------- prepara por modelo ---------- */
function sgPrep(D){ if(D.sg) return D.sg; const A={L:sgArmInfo(D,'L'),R:sgArmInfo(D,'R')};
  const rest={L:Object.assign(sgRestHand(A.L,SG_RESTE.L),{c:SG_RESTC.L[0],fc:SG_RESTC.L[1]}),R:Object.assign(sgRestHand(A.R,SG_RESTE.R),{c:SG_RESTC.R[0],fc:SG_RESTC.R[1]})};
  const gih=sgGunInHand(A.L), hol=sgHolsterGun();
  const sp=D.pos('Spine');
  const toUp=(p,ch)=>{ const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(ch[0],ch[1],ch[2])).invert(); return SV3(p).sub(sp).applyQuaternion(q).add(sp); };
  const dirUp=(v,ch)=>{ const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(ch[0],ch[1],ch[2])).invert(); return SV3(v).applyQuaternion(q); };
  // mão na pegada da pistola que está no coldre: mão = pistola * inversa(pistola na mão)
  const handForGun=(gq,gpos)=>{ const Qd=gq.clone().multiply(gih.q.clone().invert()); const wr=gpos.clone().sub(gih.pos.clone().applyQuaternion(Qd));
    return {p:A.L.palm.clone().applyQuaternion(Qd).add(wr).toArray(),F:A.L.F0.clone().applyQuaternion(Qd).toArray(),N:A.L.N0.clone().applyQuaternion(Qd).toArray(),Qd}; };
  const hg=handForGun(hol.q,hol.pos);
  const K={
    grip:{p:hg.p,F:hg.F,N:hg.N,pole:[-0.6,0.1,-0.8],c:0.85,sp:'body'},
    gripPre:null,
    pose:(s,p,F,N,pole,c,sp2,fc)=>({p,F,N,pole,c,sp:sp2||'up',fc:fc||null}),
    offset:(h,d,o)=>Object.assign({},h,{p:[h.p[0]+d[0],h.p[1]+d[1],h.p[2]+d[2]]},o),
    // pistola na frente: posição da pegada, direção do cano, topo → mão
    gunPose:(gp,B,U)=>{ const b=SV3(B).normalize(), u=SV3(U); u.sub(b.clone().multiplyScalar(u.dot(b))).normalize(); const zg=b.clone().negate(), xg=new THREE.Vector3().crossVectors(u,zg);
      const q=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xg,u,zg)); const pos=SV3(gp).sub(SV3(SGG.grip).multiplyScalar(SGL.S).applyQuaternion(q));
      const h=handForGun(q,pos); return {p:h.p,F:h.F,N:h.N,pole:[-0.9,-0.6,-0.2],c:0.92,fc:[0.65,0.12,0.98,1,1],sp:'up',gq:q.toArray(),gpos:pos.toArray()}; },
    // mão de apoio relativa à pistola (ponto no espaço da pistola, dedos/palma no espaço da pistola)
    onGun:(gun,pt,F,N,c,fc)=>{ const q=new THREE.Quaternion().fromArray(gun.gq), pos=SV3(gun.gpos); const p=SV3(pt).multiplyScalar(SGL.S).applyQuaternion(q).add(pos);
      const f=SV3(F).applyQuaternion(q), n=SV3(N).applyQuaternion(q); const wr=p.clone().sub(n.clone().multiplyScalar(0.013));
      return {p:wr.toArray(),F:f.toArray(),N:n.toArray(),pole:[1,-0.7,-0.3],c,fc:fc||null,sp:'up'}; },
    // escovada ao longo do antebraço do outro braço (fração da manga, altura acima, afastamento)
    brush:(other,side,frac,up,back)=>({brush:{other,side,frac,up,back}}),
  };
  K.gripPre=K.offset(K.grip,[0,0.13,-0.012],{c:0.9});
  const G=sgGestures(K);
  // resolve cada chave: herda canais, converte para o espaço "up" e achata num vetor para interpolar
  const out={};
  for(const name in G){ const gst=G[name]; let cur={L:rest.L,R:rest.R,hd:[0,0,0],ch:[0,0,0],lk:[0,1.5,1],lw:0,kn:0,fx:{},g:0};
    const keys=[]; const prevQ={};
    for(const k of gst.keys){ const c=Object.assign({},cur);
      for(const ch of ['hd','ch','lk','lw','kn','g']) if(k[ch]!=null) c[ch]=k[ch];
      if(k.fx) c.fx=Object.assign({},k.fx);
      for(const s of ['L','R']) if(k[s]!=null) c[s]=k[s]==='rest'?rest[s]:k[s];
      // escovadas: o alvo depende do braço que está sendo escovado (FK dele nesta chave)
      for(const s of ['L','R']) if(c[s]&&c[s].brush){ const b=c[s].brush, o=b.other, oA=A[b.side]; const res=sgSolve(oA,{quaternion:new THREE.Quaternion(),userData:{fo:{quaternion:new THREE.Quaternion()},hand:{quaternion:new THREE.Quaternion()}}},SV3(o.p),SV3(o.F),SV3(o.N),o.pole,{qa:new THREE.Quaternion(),qf:new THREE.Quaternion(),qh:new THREE.Quaternion()});
          const el=res.elbow, wr=res.wrist; const pt=el.clone().lerp(wr,b.frac); const along=wr.clone().sub(el).normalize();
          const out2=new THREE.Vector3(0,1,0).sub(along.clone().multiplyScalar(along.y)).normalize();
          const back=new THREE.Vector3(0,0,1).sub(along.clone().multiplyScalar(along.z)); back.sub(out2.clone().multiplyScalar(back.dot(out2))).normalize();
          const p=pt.add(out2.clone().multiplyScalar(b.up)).add(back.clone().multiplyScalar(b.back*0.25));
          const F=along.clone().multiplyScalar(b.side==='R'?1:-1).add(new THREE.Vector3(0,0,0.25)).normalize();
          c[s]={p:p.toArray(),F:F.toArray(),N:out2.clone().negate().toArray(),pole:s==='L'?[-1,-0.6,-0.2]:[1,-0.6,-0.2],c:0.08,sp:'up'}; }
      const vec=[];
      for(const s of ['L','R']){ const h=c[s]; const chs=c.ch;
        const p=h.sp==='body'?toUp(h.p,chs):SV3(h.p), F=h.sp==='body'?dirUp(h.F,chs):SV3(h.F), N=h.sp==='body'?dirUp(h.N,chs):SV3(h.N);
        // orientação da mão como quaternion (no mesmo hemisfério da chave anterior → caminho mais curto)
        const q=sgHandQ(A[s],F,N,new THREE.Quaternion()); const pq=prevQ[s]; if(pq&&pq.dot(q)<0){ q.x=-q.x; q.y=-q.y; q.z=-q.z; q.w=-q.w; } prevQ[s]=q.clone();
        vec.push(...p.toArray(),q.x,q.y,q.z,q.w,0,0,...h.pole,h.c!=null?h.c:0.3,...(h.fc||[-1,-1,-1,-1,-1])); }
      vec.push(...c.hd,...c.ch,...c.lk,c.lw,c.kn,...SG_FX.map(f=>c.fx[f]||0));
      keys.push({t:k.t,v:vec,e:!!k.e,g:c.g}); cur=c; }
    out[name]={dur:gst.dur,keys}; }
    let cyc=0; const seq=SG_SEQ.map(([n,gap])=>{ const s={n,t0:cyc+gap,dur:out[n].dur}; cyc+=gap+out[n].dur; return s; });
  D.sg={A,rest,gih,hol,G:out,seq,cyc,sp}; return D.sg; }

/* interpolação Hermite (Catmull-Rom com tempos irregulares; chave com e=1 para "parar") */
function sgEval(G,lt,out){ const ks=G.keys; let i=0; while(i<ks.length-2&&lt>ks[i+1].t) i++;
  const a=ks[i], b=ks[i+1]; const h=Math.max(1e-4,b.t-a.t), s=Math.max(0,Math.min(1,(lt-a.t)/h));
  const p0=ks[i-1]||a, p3=ks[i+2]||b; const n=a.v.length;
  const s2=s*s, s3=s2*s, h00=2*s3-3*s2+1, h10=s3-2*s2+s, h01=-2*s3+3*s2, h11=s3-s2;
  for(let k=0;k<n;k++){ const va=a.v[k], vb=b.v[k];
    const ma=(a.e||i===0)?0:(vb-p0.v[k])/Math.max(1e-4,b.t-p0.t)*h*0.85, mb=(b.e||i+1===ks.length-1)?0:(p3.v[k]-va)/Math.max(1e-4,p3.t-a.t)*h*0.85;
    out[k]=h00*va+h10*ma+h01*vb+h11*mb; }
  out.g=lt>=b.t?b.g:a.g; return out; }

/* ---------- aplica no personagem ---------- */
const _sv=[], _res={L:{qa:new THREE.Quaternion(),qf:new THREE.Quaternion(),qh:new THREE.Quaternion()},R:{qa:new THREE.Quaternion(),qf:new THREE.Quaternion(),qh:new THREE.Quaternion()}};
/* postura de descanso: braços diferentes entre si, cotovelo solto, giro interno leve e mão relaxada (dedos em degradê) */
const SG_RESTE={L:[[0.05,0.15,-0.115],[-0.2,0,0.05]],R:[[0.09,-0.13,0.105],[-0.3,0,-0.05]]};
const SG_RESTC={L:[0.34,[0.32,0.28,0.4,0.5,0.6]],R:[0.4,[0.36,0.34,0.46,0.56,0.66]]};
const sgHash=n=>{ const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
/* para onde a cabeça olha no descanso: troca de ponto a cada 2,5–4,5 s, gira suave, os olhos chegam antes */
function sgGaze(t){ let k=Math.floor(t/3.3), t0=k*3.3+sgHash(k)*0.9; if(t<t0){ k--; t0=k*3.3+sgHash(k)*0.9; }
  const tg=j=>[ (sgHash(j*3+1)-0.5)*0.5, (sgHash(j*3+2)-0.45)*0.13 ]; const a=tg(k-1), b=tg(k); const u=sgSm((t-t0)/0.55);
  const yaw=a[0]+(b[0]-a[0])*u, pit=a[1]+(b[1]-a[1])*u; const eye=Math.max(-1,Math.min(1,(b[0]-yaw)*3.2))*(1-sgSm((t-t0-0.35)/0.6))+yaw*0.9;
  return {yaw,pit,eye}; }
function sgIdle(p,t){ const D=MXC.data[p.cid]; if(!D||!p.sgOn) return; const S=sgPrep(D);
  // qual gesto agora
  let name=null, lt=0; if(SGL.force){ name=SGL.force.g; lt=SGL.force.t; }
  else if(t>=1){ const tt=((t+(p.sgPh||0))%S.cyc+S.cyc)%S.cyc; for(const q of S.seq) if(tt>=q.t0&&tt<q.t0+q.dur){ name=q.n; lt=tt-q.t0; break; } }   // t<1: miniaturas ficam em pé, neutras
  const tq=t+(p.sgPh||0), br=Math.sin(tq*1.55)*0.75+Math.sin(tq*0.71)*0.25;     // respiração irregular
  // apoio num pé só (troca devagar): quadril desce do lado solto, ombros compensam ao contrário, pés ficam no chão
  const ws=Math.sin(tq*0.085+0.6), w=Math.sign(ws)*sgSm(Math.min(1,Math.abs(ws)*1.8)), th=0.03*w;
  p.body.rotation.set(0,0.04*w,th); p.body.position.set(0.02*w+0.9*th+Math.sin(tq*0.47)*0.003,0,0);
  const lz=-(0.02*w)/0.88-th, fL=Math.max(0,w), fR=Math.max(0,-w);
  const fx=p.sgFx||(p.sgFx={}); for(const f of SG_FX) fx[f]=0;
  const mic=Math.sin(tq*0.23+1.3)*Math.sin(tq*0.61); fx.bu=Math.max(0,mic-0.55)*0.9; fx.bi=Math.max(0,-mic-0.6)*0.8;
  const gz=sgGaze(tq);
  const v=name?sgEval(S.G[name],lt,_sv):null; const dur=name?S.G[name].dur:1;
  const env=name?Math.min(sgSm(lt/0.6),sgSm((dur-lt)/0.8)):0;     // quanto o gesto manda na cabeça
  // pernas: joelho do lado solto dobra; agacha quando o gesto pede
  const kn=v?Math.max(0,v[36+10]):0;
  p.legL.rotation.set(-0.32*kn-0.1*fL,0,lz); p.legR.rotation.set(-0.32*kn-0.1*fR,0,lz);
  p.legL.children[1].rotation.x=0.597*kn+0.21*fL; p.legR.children[1].rotation.x=0.597*kn+0.21*fR; p.body.position.y=-0.032*kn-0.005*(fL+fR); p.sgLegs=1;
  // tronco
  const ch=v?[v[36+3],v[36+4],v[36+5]]:[0,0,0];
  _sq3.setFromEuler(new THREE.Euler(ch[0]-0.014*br-0.015,ch[1]-0.03*w,ch[2]-th*1.3)); p.chest.quaternion.copy(_sq3);
  // braços
  if(!v){ for(const [s,arm] of [['L',p.armL],['R',p.armR]]){ const E=SG_RESTE[s], sd=s==='L'?-1:1;
      arm.rotation.set(E[0][0],E[0][1],E[0][2]+sd*br*0.006); arm.userData.fo.rotation.set(E[1][0]-br*0.01,E[1][1],E[1][2]); arm.userData.hand.rotation.set(0,0,0);
      const U=arm.userData; if(U.clav){ U.clav=null; arm.position.copy(U.sh0); } U.curl=SG_RESTC[s][0]; U.fc=SG_RESTC[s][1].slice(); } }
  else for(const [s,o,arm] of [['L',0,p.armL],['R',18,p.armR]]){ const A=S.A[s];
    const P=_sa.set(v[o],v[o+1],v[o+2]).clone(), Qd=new THREE.Quaternion(v[o+3],v[o+4],v[o+5],v[o+6]).normalize();
    sgSolve(A,arm,P,null,null,[v[o+9],v[o+10],v[o+11]],_res[s],Qd);
    const U=arm.userData; U.curl=Math.max(0,Math.min(1,v[o+12])); if(v[o+13]>=-0.5){ U.fc=(U.fc&&U.fc.length===5)?U.fc:[0,0,0,0,0]; for(let k=0;k<5;k++) U.fc[k]=Math.max(0,Math.min(1.05,v[o+13+k])); } else U.fc=null; }
  // cabeça: olhar do descanso misturado com o do gesto
  const hRest=new THREE.Quaternion().setFromEuler(new THREE.Euler(gz.pit-0.03+Math.sin(tq*0.6)*0.012,gz.yaw,th*0.6+Math.sin(tq*0.37)*0.012,'YXZ'));
  if(v){ const hd=[v[36],v[36+1],v[36+2]], lw=Math.max(0,Math.min(1,v[36+9]));
    _sq1.setFromEuler(new THREE.Euler(hd[0],hd[1],hd[2]));
    if(lw>0.001){ const dx=v[36+6], dy=v[36+7]-1.585, dz=v[36+8]-0.06; const yaw=Math.max(-1.1,Math.min(1.1,Math.atan2(dx,dz))), pit=Math.max(-0.45,Math.min(0.8,Math.atan2(-dy,Math.hypot(dx,dz))));
      _sq2.setFromAxisAngle(_ax,pit); const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw).multiply(_sq2);
      const inv=_sq3.clone().invert(); qy.premultiply(inv); _sq1.slerp(qy,lw); }   // olhar em espaço do corpo, descontando o tronco
    p.head.quaternion.copy(hRest).slerp(_sq1,env); }
  else p.head.quaternion.copy(hRest);
  fx.lx=gz.eye*(1-env);
  if(v) for(let k=0;k<SG_FX.length;k++) fx[SG_FX[k]]=Math.max(fx[SG_FX[k]]*(1-env*0.6),k===7?v[36+11+k]+fx.lx:v[36+11+k]);
  sgGun(p,v?v.g:0); }

const sgNow=()=>SGL.now!=null?SGL.now:performance.now()/1000;
/* pistola: no coldre ou na mão */
function sgGun(p,inHand){ const gun=p.sgGun; if(!gun) return; const want=inHand?p.armL.userData.hand:p.sgHolster; if(gun.parent===want) return;
  const D=MXC.data[p.cid], S=sgPrep(D); want.add(gun);
  if(inHand){ gun.position.copy(S.gih.pos); gun.quaternion.copy(S.gih.q); } else { gun.position.copy(S.hol.pos); gun.quaternion.copy(S.hol.q); } }

/* ---------- rosto: piscar sozinho + expressões do gesto ---------- */
function sgFace(p,now){ const sm=p.mxSm; if(!sm||!sm.morphTargetInfluences) return;
  if(p.sgFxOv){ const I=sm.morphTargetInfluences; for(let k=0;k<I.length;k++) I[k]=p.sgFxOv[k]||0; const m=p.sgMouth; if(m){ m.visible=I[6]>0.02; if(m.visible) sgMouthUpdate(m,I[6]); } sgLids(p,Math.max(I[0],I[7]*0.3)); return; } const f=p.sgFace||(p.sgFace={next:now+1+Math.random()*3,bt:-9,dbl:0});
  if(now>f.next){ f.bt=now; f.dbl=Math.random()<0.22?1:0; f.next=now+1.6+Math.random()*4.2; }
  const bl=(dt)=>dt<0?0:dt<0.055?dt/0.055:dt<0.09?1:dt<0.2?1-(dt-0.09)/0.11:0;
  let b=bl(now-f.bt); if(f.dbl) b=Math.max(b,bl(now-f.bt-0.26));
  const fx=(p.sgFxT&&now-p.sgFxT<0.5&&p.sgFx)||{}; const g=k=>fx[k]||0;
  const I=sm.morphTargetInfluences, sq=g('sq');
  const blink=Math.min(1,Math.max(b,g('ey'))*(1-sq*0.35));
  I[0]=blink; I[1]=blink; I[2]=g('bu'); I[3]=g('bi'); I[4]=g('b1'); I[5]=g('sm'); I[6]=g('jw'); I[7]=sq*(1-blink); I[8]=g('lx');
  sgLids(p,Math.max(blink,sq*0.3));
  // boca: fundo escuro acompanha a abertura
  const m=p.sgMouth; if(m){ const j=g('jw'); m.visible=j>0.02; if(m.visible) sgMouthUpdate(m,j); } }
function sgLids(p,b){ if(!p.sgLids) return; for(const m of p.sgLids){ m.visible=b>0.04; if(m.visible) sgLidUpdate(m,Math.min(1,b)); } }
function sgMouthBuild(D,headBone){ const zAt=sgMouthGeo(D); const W=0.026, cx=SGF.mouthX, my=SGF.mouthY; const nx=14;
  // grade de profundidade para o contorno
  const grid=[]; for(let i=0;i<=nx;i++){ const x=cx-W+2*W*i/nx; const col=[]; for(let j=0;j<=6;j++){ const y=my+0.002-j*0.0016; col.push(zAt(x,y)); } grid.push(col); }
  const zf=(x,y)=>{ const fi=Math.max(0,Math.min(nx-1e-3,(x-(cx-W))/(2*W)*nx)), fj=Math.max(0,Math.min(6-1e-3,(my+0.002-y)/0.0016)); const i=Math.floor(fi), j=Math.floor(fj), a=fi-i, b=fj-j;
    const z=(grid[i][j]*(1-a)+grid[i+1][j]*a)*(1-b)+(grid[i][j+1]*(1-a)+grid[i+1][j+1]*a)*b; return z>0?z:0.098; };
  const seg=20, geo=new THREE.BufferGeometry(); const pos=new Float32Array((seg*2+2)*3); geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const ix=[]; for(let i=0;i<seg;i++){ ix.push(i*2,i*2+1,i*2+2, i*2+1,i*2+3,i*2+2); } geo.setIndex(ix);
  const mat=new THREE.MeshBasicMaterial({color:0x2a0e0b,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  const teeth=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial({color:0xd8d0bc,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  const tp=new Float32Array((seg+1)*2*3); teeth.geometry.setAttribute('position',new THREE.BufferAttribute(tp,3)); const tix=[]; for(let i=0;i<seg;i++) tix.push(i*2,i*2+1,i*2+2, i*2+1,i*2+3,i*2+2); teeth.geometry.setIndex(tix);
  const m=new THREE.Mesh(geo,mat); m.add(teeth); m.frustumCulled=false; teeth.frustumCulled=false;
  // do espaço de ligação para o espaço do osso da cabeça
  const hi=D.idx.Head; const inv=new THREE.Matrix4().compose(D.rp[hi],D.rq[hi],new THREE.Vector3(1,1,1)).invert();
  m.userData={zf,seg,W:0.0175,cx,my,inv,teeth}; headBone.add(m); m.visible=false; return m; }
function sgMouthUpdate(m,j){ const U=m.userData, P=m.geometry.attributes.position.array, T=U.teeth.geometry.attributes.position.array, v=new THREE.Vector3();
  for(let i=0;i<=U.seg;i++){ const u=i/U.seg*2-1, x=U.cx+u*U.W*(0.75+0.25*j), e=Math.sqrt(Math.max(0,1-u*u));
    const yTop=U.my+0.0006-0.0012*u*u, yBot=U.my-0.0005-j*0.0082*e;
    for(const [k,y] of [[0,yTop],[1,yBot]]){ v.set(x,y,Math.max(U.zf(x,y),U.zf(x,U.my+0.0004))+0.0012+0.0028*(k?j:0)).applyMatrix4(U.inv); P[(i*2+k)*3]=v.x; P[(i*2+k)*3+1]=v.y; P[(i*2+k)*3+2]=v.z; }
    const th=Math.min(1,j*2.2)*0.0012*e; for(const [k,y] of [[0,yTop-0.0002],[1,yTop-0.0002-th]]){ v.set(x*0.96+U.cx*0.04,y,Math.max(U.zf(x,y),U.zf(x,U.my+0.0004))+0.0016).applyMatrix4(U.inv); T[(i*2+k)*3]=v.x; T[(i*2+k)*3+1]=v.y; T[(i*2+k)*3+2]=v.z; } }
  m.geometry.attributes.position.needsUpdate=true; U.teeth.geometry.attributes.position.needsUpdate=true; m.geometry.computeBoundingSphere(); }

/* ======================= ligações ======================= */
{ const mp=mxPrep; mxPrep=function(gl){ const D=mp(gl); try{ if(SGL.smooth) sgSmoothShoulders(D,SGL.smooth,0.55); }catch(e){ console.warn('[Bunker] ombros',e); } try{ D.geo0=D.geo; sgSubdivideFace(D); console.log('[Bunker] rosto do sargento: +'+D.face.verts+' vértices, '+SGF.names.length+' expressões'); }catch(e){ console.warn('[Bunker] rosto',e); } return D; }; }
{ const mb=mxBuild; mxBuild=function(id,vk,L,opts){ const root=mb.apply(this,arguments); const p=root.userData; if(!SGL.on||id!=='moreira') return root;
    try{ const D=MXC.data[id], S=sgPrep(D);
      // coldre + pistola no quadril
      const hol=sgHolsterMesh(); const hf=new THREE.Group(); hf.position.copy(S.hol.pos); hf.quaternion.copy(S.hol.q); hf.add(hol); p.body.add(hf);
      const hs=new THREE.Group(); p.body.add(hs); p.sgHolster=hs;
      const gun=buildGun('m1911',0); gun.scale.setScalar(SGL.S); gun.traverse(o=>{ if(o.isMesh) o.frustumCulled=false; }); p.sgGun=gun; hs.add(gun); gun.position.copy(S.hol.pos); gun.quaternion.copy(S.hol.q);
      // boca
      if(D.geo0){ p.sgMouth=sgMouthBuild(D,p.mxBones[D.idx.Head]); p.sgLids=sgLidsBuild(D,p.mxBones[D.idx.Head]); }
      p.sgOn=true; p.sgPh=Math.random()*40;
      const umw=root.updateMatrixWorld; root.updateMatrixWorld=function(f){ try{ sgFace(p,sgNow()); }catch(e){} return umw.call(this,f); };
    }catch(e){ console.warn('[Bunker] sargento vivo',e); }
    return root; }; }
{ const pc=poseChar; poseChar=function(p,pose,t){
    const mine=p&&p.mx&&p.sgOn&&SGL.on;
    if(mine&&pose==='idle'){ const c=p.cid; p.cid='_sg'; let r; try{ r=pc.apply(this,arguments); } finally{ p.cid=c; }   // sem os gestos antigos: os novos cuidam do parado
      try{ sgIdle(p,t); p.sgFxT=sgNow(); p.sgUsed=1; }catch(e){ if(!SGL.err){ SGL.err=1; console.warn('[Bunker] gesto',e); } } return r; }
    const r=pc.apply(this,arguments);
    if(p&&p.mx&&p.sgOn){ sgGun(p,0); p.sgFxT=0; if(p.sgUsed){ p.sgUsed=0; p.armL.userData.hand.quaternion.identity(); p.armR.userData.hand.quaternion.identity(); if(p.sgLegs){ p.legL.rotation.set(0,0,0); p.legR.rotation.set(0,0,0); p.legL.children[1].rotation.x=p.legR.children[1].rotation.x=0; p.body.position.set(0,0,0); p.body.rotation.set(0,0,0); p.sgLegs=0; } } }
    return r; }; }
CMDS.sargento={cheat:1,d:'sargento [gesto|auto|off] · gestos do sargento 3D (pistol, dust, neck, belt, watch, scan, knuckles)',f:a=>{ const g=a[0]||'auto';
  if(g==='off'){ SGL.on=false; cprint('gestos do sargento: desligados'); return; } SGL.on=true;
  if(g==='auto'){ SGL.force=null; cprint('gestos do sargento: automáticos'); return; }
  const D=MXC.data.moreira; if(!D){ cprint('modelo ainda carregando'); return; } const S=sgPrep(D); if(!S.G[g]){ cprint('gestos: '+Object.keys(S.G).join(', ')); return; }
  const t0=performance.now()/1000; SGL.force={g,t:0}; const iv=setInterval(()=>{ const lt=performance.now()/1000-t0; if(!SGL.force||SGL.force.g!==g){ clearInterval(iv); return; } if(lt>S.G[g].dur){ SGL.force=null; clearInterval(iv); return; } SGL.force.t=lt; },30);
  cprint('sargento: '+g); }};
