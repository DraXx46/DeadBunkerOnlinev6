/* ================= v9 · MÃOS NOVAS (PRIMEIRA PESSOA) =================
   Mesma lógica e arquitetura de antes: o mesmo esqueleto do "Rigged Hand.glb", o mesmo IK por arma, as mesmas
   pegadas e animações de recarga. Só o MODELO muda:
   · uma malha só por mão (~2,4 mil vértices em vez de 690), construída em cima da posição de cada osso:
     antebraço/pulso, palma com eminência do polegar e do mindinho, nós dos dedos saltados, falanges com
     dobras nas juntas, polpa na ponta, unha achatada e ponta arredondada, polegar com metacarpo.
   · pesos de pele calculados por segmento, com transição suave em cada junta (pulso, nós, falanges).
   · UMA textura pintada por personagem (cores diferentes na mesma malha): pele com tom do personagem, unhas,
     cutícula, dobras dos dedos e da palma, tendões e veias no dorso; ou luva tática, de couro, de látex, sem dedos,
     cibernética. Tem mapa de relevo para as dobras e costuras pegarem luz.
   As mangas continuam as mesmas. Se o GLB não carregar, as mãos procedurais antigas seguem de reserva. */
const FPH={on:true,built:false,geo:{},layout:{},mats:new Map(),cur:null,tries:0};
const FPH_RAD={index:0.0116,middle:0.0121,ring:0.0113,pinky:0.0099};
const FPH_UV={palm:[0,0,0.55,0.55],index:[0.00,0.56,0.11,1],middle:[0.11,0.56,0.22,1],ring:[0.22,0.56,0.33,1],pinky:[0.33,0.56,0.44,1],thumb:[0.56,0,0.72,0.5]};
const fphG=(x,c,w)=>Math.exp(-((x-c)/w)*((x-c)/w));
function fphBuildSide(mesh,S){
  const sk=mesh.skeleton, B={}; sk.bones.forEach((b,i)=>B[b.name]=i);
  const W=sk.boneInverses.map(m=>new THREE.Matrix4().copy(m).invert());
  const bi=n=>{ const i=B[THREE.PropertyBinding.sanitizeNodeName(n)]; if(i==null) throw new Error('osso '+n); return i; };
  const P=n=>new THREE.Vector3().setFromMatrixPosition(W[bi(n)]);
  const hp=P('hand.'+S), fp=P('forearm.'+S);
  const F={}; for(const f of ['index','middle','ring','pinky']) F[f]=[1,2,3].map(k=>P('finger_'+f+'.0'+k+'.'+S));
  const T=[1,2,3].map(k=>P('thumb.0'+k+'.'+S));
  const kc=new THREE.Vector3(); for(const f in F) kc.add(F[f][0]); kc.multiplyScalar(0.25);
  const Y=kc.clone().sub(hp).normalize();
  const X=F.pinky[0].clone().sub(F.index[0]); X.addScaledVector(Y,-X.dot(Y)).normalize();   // índice -> mindinho
  let N=new THREE.Vector3().crossVectors(X,Y).normalize(); if(S==='L') N.negate();          // dorso
  const flip=S==='L'?-1:1;
  const pos=[], nor=[], uv=[], si=[], sw=[], idx=[];
  const addV=(p,u,v,w)=>{ pos.push(p.x,p.y,p.z); uv.push(u,v); const e=Object.entries(w).sort((a,b)=>b[1]-a[1]).slice(0,4); let t=0; for(const [,x] of e) t+=x; for(let k=0;k<4;k++){ si.push(e[k]?+e[k][0]:0); sw.push(e[k]?e[k][1]/t:0); } return pos.length/3-1; };
  /* tubo genérico: centro(t), tangente(t), raio(θ,t) -> [rx,ry,bulge]; θ=0 palmar, π dorso, π/2 lado do mindinho */
  function tube(name,n,m,center,tangent,dorsal,radius,weights,seam,closeTip){
    const R=FPH_UV[name], start=pos.length/3, ring=[];
    for(let i=0;i<=n;i++){ const t=i/n, c=center(t), d=tangent(t).normalize(); const nd=dorsal(t).clone(); nd.addScaledVector(d,-nd.dot(d)).normalize(); const s=new THREE.Vector3().crossVectors(d,nd).normalize().multiplyScalar(flip);
      const w=weights(t); const row=[];
      for(let j=0;j<=m;j++){ const th=j/m*Math.PI*2; const [rx,ry,k,wo]=radius(th,t); const p=c.clone().addScaledVector(nd,-Math.cos(th)*ry*k).addScaledVector(s,Math.sin(th)*rx*k);
        let u=((th-(seam||0))/(Math.PI*2))%1; if(u<0) u+=1; if(j===m) u=1; row.push(addV(p,R[0]+u*(R[2]-R[0]),R[1]+t*(R[3]-R[1]),wo?wo(th):w)); }
      ring.push(row); }
    const tri=[]; for(let i=0;i<n;i++) for(let j=0;j<m;j++){ const a=ring[i][j], b=ring[i][j+1], c=ring[i+1][j], e=ring[i+1][j+1]; tri.push(a,c,b, b,c,e); }
    if(closeTip){ const c=center(1), w=weights(1); const tip=addV(c,(R[0]+R[2])/2,R[3],w); const last=ring[n]; for(let j=0;j<m;j++) tri.push(last[j],tip,last[j+1]); }
    // sentido dos triângulos: normal para fora
    const v=(k)=>new THREE.Vector3(pos[k*3],pos[k*3+1],pos[k*3+2]); const i0=Math.floor(n/2), A=v(ring[i0][0]), Bv=v(ring[i0][1]), C=v(ring[i0+1][0]);
    const nrm=new THREE.Vector3().crossVectors(C.clone().sub(A),Bv.clone().sub(A)); const out=A.clone().sub(center(i0/n));
    if(nrm.dot(out)<0) for(let k=0;k<tri.length;k+=3){ const t=tri[k+1]; tri[k+1]=tri[k+2]; tri[k+2]=t; }
    idx.push(...tri); return {start,end:pos.length/3}; }
  const iFore=bi('forearm.'+S), iHand=bi('hand.'+S);
  /* ---- palma + pulso ---- */
  const L=kc.distanceTo(hp), p0=hp.clone().addScaledVector(Y,-0.075), p1=kc.clone().addScaledVector(Y,0.006);
  const tW=0.075/(0.075+L+0.006);   // posição do pulso no tubo da palma
  const prof=[[0,0.031,0.027,2],[tW*0.6,0.031,0.023,2.2],[tW,0.033,0.0205,2.4],[tW+0.3*(1-tW),0.046,0.019,2.7],[tW+0.7*(1-tW),0.05,0.0176,2.9],[0.93,0.051,0.0162,3.1],[1,0.048,0.013,3]];
  const pf=t=>{ for(let i=0;i<prof.length-1;i++){ const a=prof[i], b=prof[i+1]; if(t<=b[0]){ const k=(t-a[0])/(b[0]-a[0]), e=k*k*(3-2*k); return [a[1]+(b[1]-a[1])*e,a[2]+(b[2]-a[2])*e,a[3]+(b[3]-a[3])*e]; } } return prof[prof.length-1].slice(1); };
  const fingersAcross=['index','middle','ring','pinky'].map(f=>({f,x:F[f][0].clone().sub(kc).dot(X)*flip,b:bi('finger_'+f+'.01.'+S)}));
  const palmCenter=t=>{ const c=p0.clone().lerp(p1,t); return c; };
  tube('palm',30,32,palmCenter,()=>Y.clone(),()=>N,(th,t)=>{ const [hw,ht,ex]=pf(t); const ct=Math.cos(th), st=Math.sin(th);
      // superelipse: borda mais quadrada na palma
      const e=2/ex, k=Math.pow(Math.pow(Math.abs(ct),ex)+Math.pow(Math.abs(st),ex),-1/ex);
      let bul=1; const tm=(t-tW)/(1-tW);
      // eminência tenar (lado do polegar, palmar) e hipotenar (lado do mindinho)
      const thumbSide=Math.max(0,-st), pinkSide=Math.max(0,st), palmar=Math.max(0,ct), dorso=Math.max(0,-ct);
      bul+=0.42*thumbSide*palmar*fphG(tm,0.28,0.26)+0.16*pinkSide*palmar*fphG(tm,0.4,0.3);
      // nós dos dedos no dorso, um calombo por dedo
      if(t>0.8){ for(const q of fingersAcross){ const x=st*hw; bul+=0.22*dorso*fphG(x,q.x,0.0085)*fphG(t,0.95,0.06); } }
      // concavidade no meio da palma
      bul-=0.06*palmar*fphG(st,0,0.5)*fphG(tm,0.5,0.25);
      // ponta da palma (nós): parte do peso vai para o dedo mais próximo, para os nós acompanharem o dedo
      let wo=null; if(t>0.8){ const x=st*hw; let q=fingersAcross[0], bd=1e9; for(const c of fingersAcross){ const d=Math.abs(c.x-x); if(d<bd){ bd=d; q=c; } } const bb=Math.min(1,(t-0.8)/0.2)*0.45; wo=()=>({[iHand]:1-bb,[q.b]:bb}); }
      return [hw,ht,bul*k,wo]; },
    t=>{ const w={}; const wf=1-(t<tW-0.04?0:t>tW+0.03?1:(t-(tW-0.04))/0.07); if(wf>0) w[iFore]=wf; if(1-wf>0) w[iHand]=1-wf; return w; },
    3*Math.PI/2,false);
  /* ---- dedos ---- */
  const fl={};
  for(const f of ['index','middle','ring','pinky']){ const ch=F[f], tip=ch[2].clone().add(ch[2].clone().sub(ch[1]).multiplyScalar(0.9)); const base=ch[0].clone().addScaledVector(Y,-0.014);
    const pts=[base,ch[0],ch[1],ch[2],tip]; const crv=new THREE.CatmullRomCurve3(pts,false,'centripetal');
    const len=[0]; for(let i=1;i<pts.length;i++) len.push(len[i-1]+pts[i].distanceTo(pts[i-1])); const Ltot=len[len.length-1]; const tj=len.map(x=>x/Ltot);   // [0,mcp,pip,dip,1]
    const b1=bi('finger_'+f+'.01.'+S), b2=bi('finger_'+f+'.02.'+S), b3=bi('finger_'+f+'.03.'+S);
    const R0=FPH_RAD[f], capT=1-0.95*R0/Ltot; fl[f]=tj;
    tube(f,34,18,t=>crv.getPointAt(t),t=>crv.getTangentAt(t),()=>N,(th,t)=>{ const ct=Math.cos(th), st=Math.sin(th);
        let r=R0*(1-0.2*Math.max(0,(t-tj[1])/(1-tj[1])));
        r*=1+0.075*fphG(t,tj[2],0.04)+0.055*fphG(t,tj[3],0.035)-0.03*fphG(t,(tj[2]+tj[3])/2,0.05);   // juntas mais grossas, falange afina no meio
        const dorso=Math.max(0,-ct), palmar=Math.max(0,ct);
        let k=1;
        k+=0.28*dorso*dorso*fphG(t,tj[1],0.05);                         // nó do dedo (MCP)
        k+=0.1*palmar*palmar*fphG(t,(tj[3]+1)/2,0.06);                  // polpa da ponta
        if(t>tj[3]+0.3*(1-tj[3])&&dorso>0.55) k-=0.05*(dorso-0.55)/0.45;  // unha achatada
        if(t>capT){ const q=(t-capT)/(1-capT); k*=Math.sqrt(Math.max(0.0001,1-q*q)); }
        return [r*1.08,r*0.92,k,null]; },
      t=>{ const w={}; const bl=(x,c,h)=>Math.min(1,Math.max(0,(x-c+h)/(2*h)));
        const a=bl(t,tj[2],0.04), b=bl(t,tj[3],0.035); w[b1]=(1-a); w[b2]=a*(1-b); w[b3]=a*b;
        const h=1-bl(t,tj[1]+0.02,0.05); if(h>0){ for(const k in w) w[k]*=1-h*0.5; w[iHand]=(w[iHand]||0)+h*0.5; }
        return w; },
      0,true); }
  /* ---- polegar ---- */
  { const tip=T[2].clone().add(T[2].clone().sub(T[1]).multiplyScalar(0.95)); const base=T[0].clone().addScaledVector(Y,-0.008).addScaledVector(X,0.006*flip);
    const pts=[base,T[0],T[1],T[2],tip]; const crv=new THREE.CatmullRomCurve3(pts,false,'centripetal');
    const len=[0]; for(let i=1;i<pts.length;i++) len.push(len[i-1]+pts[i].distanceTo(pts[i-1])); const Ltot=len[len.length-1]; const tj=len.map(x=>x/Ltot); fl.thumb=tj;
    const thumbDorsal=N.clone().multiplyScalar(0.45).addScaledVector(X,-0.9*flip).normalize();
    const b1=bi('thumb.01.'+S), b2=bi('thumb.02.'+S), b3=bi('thumb.03.'+S), capT=1-0.0122/Ltot;
    tube('thumb',34,18,t=>crv.getPointAt(t),t=>crv.getTangentAt(t),()=>thumbDorsal,(th,t)=>{ const ct=Math.cos(th);
        const r=t<tj[2]?0.019+(0.0137-0.019)*Math.min(1,t/tj[2]):0.0137-0.0018*(t-tj[2])/(1-tj[2]);
        const dorso=Math.max(0,-ct), palmar=Math.max(0,ct); let k=1+0.08*fphG(t,tj[2],0.05)+0.06*fphG(t,tj[3],0.04);
        k+=0.12*palmar*palmar*fphG(t,(tj[3]+1)/2,0.07); if(t>tj[3]+0.3*(1-tj[3])&&dorso>0.55) k-=0.05*(dorso-0.55)/0.45;
        if(t>capT){ const q=(t-capT)/(1-capT); k*=Math.sqrt(Math.max(0.0001,1-q*q)); }
        return [r*1.1,r*0.95,k,null]; },
      t=>{ const w={}; const bl=(x,c,h)=>Math.min(1,Math.max(0,(x-c+h)/(2*h))); const a=bl(t,tj[2],0.05), b=bl(t,tj[3],0.04);
        w[b1]=1-a; w[b2]=a*(1-b); w[b3]=a*b; const h=1-bl(t,0.18,0.12); if(h>0){ for(const k in w) w[k]*=1-h*0.6; w[iHand]=(w[iHand]||0)+h*0.6; } return w; },
      0,true); }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4)); g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4)); g.setIndex(idx);
  g.computeVertexNormals(); g.computeBoundingBox(); g.computeBoundingSphere();
  FPH.layout[S]=fl; return g; }

/* ---------- textura pintada por personagem ---------- */
const FPH_TS=1024;
function fphRect(name){ const R=FPH_UV[name], S=FPH_TS; return {x:R[0]*S,y:(1-R[3])*S,w:(R[2]-R[0])*S,h:(R[3]-R[1])*S}; }
function fphCol(h,k,a){ const c=new THREE.Color(h); if(k!=null) c.multiplyScalar(k); return `rgba(${Math.min(255,c.r*255)|0},${Math.min(255,c.g*255)|0},${Math.min(255,c.b*255)|0},${a==null?1:a})`; }
function fphPaint(style,skin){
  const S=FPH_TS, cv=document.createElement('canvas'); cv.width=cv.height=S; const g=cv.getContext('2d');
  const bv=document.createElement('canvas'); bv.width=bv.height=S; const b=bv.getContext('2d'); b.fillStyle='#808080'; b.fillRect(0,0,S,S);
  const lay=FPH.layout.R||FPH.layout.L; const R=lay?lay:{};
  const sk=new THREE.Color(skin||'#c89474');
  const rnd=(()=>{ let s=12345; return ()=>{ s=(s*16807)%2147483647; return s/2147483647; }; })();
  const at=(r,u,v)=>[r.x+u*r.w,r.y+(1-v)*r.h];
  const line=(ctx,r,pts,col,w)=>{ ctx.strokeStyle=col; ctx.lineWidth=w; ctx.lineCap='round'; ctx.beginPath(); pts.forEach(([u,v],i)=>{ const [x,y]=at(r,u,v); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.stroke(); };
  const fillSkin=(r,palmarU)=>{ // pele: base + palmar mais clara/rosada + poros
    g.fillStyle=fphCol(sk); g.fillRect(r.x,r.y,r.w,r.h);
    const gr=g.createLinearGradient(r.x,0,r.x+r.w,0); for(let i=0;i<=8;i++){ const u=i/8; let d=Math.abs(((u-palmarU+1.5)%1)-0.5)*2; /* 0 palmar, 1 dorso */ gr.addColorStop(u,d<0.5?fphCol(new THREE.Color(sk).lerp(new THREE.Color('#f2c6b0'),0.35*(1-d*2)),1,0.55):fphCol(sk,0.9+0.04*d,0.35)); }
    g.fillStyle=gr; g.fillRect(r.x,r.y,r.w,r.h);
    for(let i=0;i<r.w*r.h/18;i++){ g.fillStyle=rnd()<0.5?fphCol(sk,0.88,0.12):fphCol(sk,1.12,0.1); g.fillRect(r.x+rnd()*r.w,r.y+rnd()*r.h,1.2,1.2); } };
  const fabric=(r,col,col2,weave)=>{ g.fillStyle=col; g.fillRect(r.x,r.y,r.w,r.h); g.globalAlpha=0.16; for(let y=r.y;y<r.y+r.h;y+=weave){ g.fillStyle=col2; g.fillRect(r.x,y,r.w,weave*0.45); } g.globalAlpha=0.08; for(let x=r.x;x<r.x+r.w;x+=weave*1.3){ g.fillStyle='#000'; g.fillRect(x,r.y,weave*0.4,r.h); } g.globalAlpha=1;
    for(let i=0;i<r.w*r.h/40;i++){ g.fillStyle=rnd()<0.5?'rgba(0,0,0,.08)':'rgba(255,255,255,.05)'; g.fillRect(r.x+rnd()*r.w,r.y+rnd()*r.h,2,2); } };
  const glove={tac:['#3a3c33','#55584a',5],leather:['#5e3d24','#7a5232',3],latex:['#5d74c8','#7d92e0',0],finger:['#4c4c3c','#6a6a52',5],cyber:['#3a3e44','#5a6068',0]}[style];
  const fingers=['index','middle','ring','pinky','thumb'];
  /* ---------- palma ---------- */
  const rp=fphRect('palm'), tW=0.075/(0.075+0.075+0.006);
  if(!glove||style==='finger') fillSkin(rp,0.25); else fabric(rp,glove[0],glove[1],glove[2]||4);
  if(glove&&style!=='finger'){ // punho da luva
    g.fillStyle=fphCol(glove[0],0.7); const [x,y]=at(rp,0,tW*0.55); g.fillRect(rp.x,y,rp.w,rp.h*tW*0.35); b.fillStyle='#a0a0a0'; b.fillRect(rp.x,y,rp.w,rp.h*tW*0.35); }
  if(style==='finger'){ fabric({x:rp.x,y:at(rp,0,1)[1],w:rp.w,h:rp.h*(1-tW*0.5)},glove[0],glove[1],5); g.fillStyle='rgba(0,0,0,.35)'; const [x,y]=at(rp,0,1); g.fillRect(x,y,rp.w,4); }
  if(!glove){ // dorso: tendões e veias; palma: linhas da mão; pulso: dobras
    for(const [u0] of [[0.88],[0.8],[0.71],[0.62]]){ line(g,rp,[[0.75+(u0-0.75)*0.3,tW+0.05],[u0,0.92]],fphCol(sk,1.08,0.25),5); line(b,rp,[[0.75+(u0-0.75)*0.3,tW+0.05],[u0,0.92]],'rgba(255,255,255,.25)',5); }
    for(let i=0;i<5;i++){ const u=0.62+rnd()*0.26, pts=[]; let uu=u; for(let v=tW;v<0.8;v+=0.08){ uu+=(rnd()-0.5)*0.03; pts.push([uu,v]); } line(g,rp,pts,'rgba(70,80,120,.12)',3); line(b,rp,pts,'rgba(255,255,255,.18)',3); }
    const cr='rgba(90,50,40,.28)', bc='rgba(0,0,0,.35)';
    for(const [pts] of [[[[0.47,0.86],[0.38,0.88],[0.27,0.87],[0.16,0.84]]],[[[0.45,0.74],[0.32,0.72],[0.2,0.7],[0.08,0.72]]],[[[0.1,0.84],[0.09,0.7],[0.11,0.55],[0.17,tW+0.06]]]]){ line(g,rp,pts,cr,3); line(b,rp,pts,bc,3); }
    for(let i=0;i<3;i++){ const v=tW-0.01+i*0.018; line(g,rp,[[0.05,v],[0.25,v+0.004],[0.45,v]],'rgba(90,50,40,.18)',2); line(b,rp,[[0.05,v],[0.25,v+0.004],[0.45,v]],'rgba(0,0,0,.25)',2); }
    // nós no dorso (calombos avermelhados)
    for(const u of [0.88,0.8,0.71,0.62]){ const [x,y]=at(rp,u,0.95); const rg=g.createRadialGradient(x,y,1,x,y,16); rg.addColorStop(0,fphCol(new THREE.Color(sk).lerp(new THREE.Color('#d48a7a'),0.3),1,0.45)); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(x-16,y-16,32,32); for(let k=0;k<3;k++) line(g,rp,[[u-0.025,0.935+k*0.012],[u,0.94+k*0.012],[u+0.025,0.935+k*0.012]],'rgba(90,50,40,.22)',1.6); }
  }
  if(style==='tac'){ // protetor de nós + palma emborrachada
    g.fillStyle='#1d1e1a'; const [x,y]=at(rp,0.56,0.99); g.fillRect(x,y,rp.w*0.4,rp.h*0.14); b.fillStyle='#d0d0d0'; b.fillRect(x,y,rp.w*0.4,rp.h*0.14);
    for(let i=0;i<4;i++){ const [xx,yy]=at(rp,0.58+i*0.09,0.97); g.fillStyle='#2a2b26'; g.fillRect(xx,yy,rp.w*0.07,rp.h*0.08); b.fillStyle='#f0f0f0'; b.fillRect(xx,yy,rp.w*0.07,rp.h*0.08); }
    g.fillStyle='#262622'; const [px,py]=at(rp,0.02,0.95); g.fillRect(px,py,rp.w*0.46,rp.h*0.6); for(let i=0;i<500;i++){ const xx=px+rnd()*rp.w*0.46, yy=py+rnd()*rp.h*0.6; g.fillStyle='rgba(255,255,255,.06)'; g.beginPath(); g.arc(xx,yy,1.6,0,7); g.fill(); b.fillStyle='rgba(255,255,255,.4)'; b.beginPath(); b.arc(xx,yy,1.6,0,7); b.fill(); }
    // velcro no punho
    const [vx,vy]=at(rp,0.55,tW*0.85); g.fillStyle='#24251f'; g.fillRect(vx,vy,rp.w*0.42,rp.h*0.07); }
  if(style==='leather'){ for(let i=0;i<3000;i++){ g.fillStyle=rnd()<0.5?'rgba(0,0,0,.1)':'rgba(255,220,180,.05)'; g.fillRect(rp.x+rnd()*rp.w,rp.y+rnd()*rp.h,2,1); }
    for(const u of [0.86,0.77,0.68]){ line(g,rp,[[u,0.55],[u,0.99]],'rgba(30,18,10,.6)',2); line(b,rp,[[u,0.55],[u,0.99]],'rgba(0,0,0,.5)',2); }
    for(const u of [0.88,0.8,0.71,0.62]){ const [x,y]=at(rp,u,0.95); const rg=g.createRadialGradient(x,y,1,x,y,18); rg.addColorStop(0,'rgba(200,150,100,.35)'); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(x-18,y-18,36,36); } }
  if(style==='latex'){ for(let i=0;i<14;i++){ const v=tW+rnd()*(1-tW); line(g,rp,[[rnd()*0.4,v],[0.1+rnd()*0.5,v+0.01]],'rgba(20,30,80,.12)',1.5); } const [x,y]=at(rp,0,tW*0.7); g.fillStyle='#7d92e0'; g.fillRect(rp.x,y,rp.w,rp.h*0.04); b.fillStyle='#e0e0e0'; b.fillRect(rp.x,y,rp.w,rp.h*0.04); }
  if(style==='cyber'){ for(let i=0;i<4;i++){ const v=tW+0.05+i*(1-tW)/4.2; line(g,rp,[[0,v],[1,v]],'rgba(0,0,0,.6)',2); line(b,rp,[[0,v],[1,v]],'rgba(0,0,0,.7)',2); }
    for(const u of [0.66,0.84]){ line(g,rp,[[u,tW+0.05],[u,0.9]],'#22e8ff',2.5); } for(const u of [0.5]){ line(g,rp,[[u,0],[u,1]],'rgba(0,0,0,.5)',2); line(b,rp,[[u,0],[u,1]],'rgba(0,0,0,.6)',2); } }
  /* ---------- dedos e polegar ---------- */
  for(const f of fingers){ const r=fphRect(f), tj=(R[f]||[0,0.15,0.5,0.78,1]); const pip=tj[2], dip=tj[3], mcp=tj[1];
    const bareFrom=style==='finger'?(f==='thumb'?dip-0.05:pip+0.06):(glove?2:0);
    // base
    if(bareFrom>=1) fabric(r,glove[0],glove[1],glove[2]||4); else { fillSkin(r,0); if(bareFrom>0){ const sub={x:r.x,y:r.y+(1-bareFrom)*r.h,w:r.w,h:bareFrom*r.h}; fabric(sub,glove[0],glove[1],5); g.fillStyle='rgba(0,0,0,.4)'; g.fillRect(r.x,sub.y-3,r.w,4); b.fillStyle='#c8c8c8'; b.fillRect(r.x,sub.y-4,r.w,5); } }
    const bare=bareFrom<1;
    if(bare){ // dobras no dorso das juntas, dobras palmares, unha
      for(const [v,n] of [[pip,4],[dip,3]]){ if(v<bareFrom) continue;
        { const [kx,ky]=at(r,0.5,v); const rg=g.createRadialGradient(kx,ky,1,kx,ky,r.w*0.28); rg.addColorStop(0,fphCol(new THREE.Color(sk).lerp(new THREE.Color('#c9786a'),0.25),1,0.4)); rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg; g.fillRect(kx-r.w*0.3,ky-r.w*0.3,r.w*0.6,r.w*0.6); }
        for(let k=0;k<n;k++){ const vv=v-0.025+k*0.014+(rnd()-0.5)*0.006, a=0.4+rnd()*0.06, c=0.6-rnd()*0.06, bow=0.004+rnd()*0.006; line(g,r,[[a,vv],[0.5,vv+bow],[c,vv]],`rgba(80,45,35,${0.1+rnd()*0.08})`,1.1); line(b,r,[[a,vv],[0.5,vv+bow],[c,vv]],'rgba(0,0,0,.22)',1.2); }
        line(g,r,[[0,v],[0.1,v]],'rgba(90,50,40,.22)',1.6); line(g,r,[[0.9,v],[1,v]],'rgba(90,50,40,.22)',1.6); line(b,r,[[0,v],[0.1,v]],'rgba(0,0,0,.35)',1.6); line(b,r,[[0.9,v],[1,v]],'rgba(0,0,0,.35)',1.6); }
      { const [x0,y0]=at(r,0,1), [x1,y1]=at(r,1,dip); const lg=g.createLinearGradient(0,y1,0,y0); lg.addColorStop(0,'rgba(0,0,0,0)'); lg.addColorStop(1,fphCol(new THREE.Color(sk).lerp(new THREE.Color('#e08a80'),0.3),1,0.35)); g.fillStyle=lg; g.fillRect(x0,y0,x1-x0,y1-y0); }
      const n0=dip+0.32*(1-dip), n1=0.985, nw=0.15; const [x0,y1]=at(r,0.5-nw,n0), [x1,y0]=at(r,0.5+nw,n1);
      const nailCol=style==='vamp'?'#2a0c12':fphCol(new THREE.Color(sk).lerp(new THREE.Color('#eab0a6'),0.5),1.04);
      g.fillStyle=nailCol; g.beginPath(); g.roundRect?g.roundRect(x0,y0,x1-x0,y1-y0,[(x1-x0)*0.45,(x1-x0)*0.45,(x1-x0)*0.25,(x1-x0)*0.25]):g.rect(x0,y0,x1-x0,y1-y0); g.fill();
      if(style!=='vamp'){ g.fillStyle='rgba(255,248,236,.5)'; g.fillRect(x0+2,y0,x1-x0-4,(y1-y0)*0.09); const [lx,ly]=at(r,0.5,n0+0.04); g.fillStyle='rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(lx,ly,(x1-x0)*0.3,(y1-y0)*0.12,0,0,7); g.fill(); }
      else { g.fillStyle='rgba(255,255,255,.15)'; g.fillRect(x0+3,y0+2,(x1-x0)*0.2,(y1-y0)*0.7); }
      g.strokeStyle='rgba(90,40,35,.45)'; g.lineWidth=1.6; g.beginPath(); g.moveTo(x0,y1); g.quadraticCurveTo((x0+x1)/2,y1+5,x1,y1); g.stroke();
      b.fillStyle='#b0b0b0'; b.fillRect(x0,y0,x1-x0,y1-y0); b.strokeStyle='#202020'; b.lineWidth=2; b.strokeRect(x0,y0,x1-x0,y1-y0);
      if(style==='finger'||!glove){ // polpa com digital (bem sutil)
        for(let k=0;k<7;k++){ const [cx,cy]=at(r,0.0,(dip+1)/2); b.strokeStyle='rgba(0,0,0,.05)'; b.lineWidth=1; b.beginPath(); b.ellipse(cx,cy,6+k*3,10+k*3,0,-1.4,1.4); b.stroke(); b.beginPath(); b.ellipse(cx+r.w,cy,6+k*3,10+k*3,0,Math.PI-1.4,Math.PI+1.4); b.stroke(); } }
    } else {
      // luva inteira: costuras nas laterais, dobras de tecido nas juntas, reforços
      for(const u of [0.25,0.75]){ line(g,r,[[u,0],[u,1]],'rgba(0,0,0,.45)',2); line(b,r,[[u,0],[u,1]],'rgba(0,0,0,.55)',2); for(let v=0.02;v<1;v+=0.04) line(g,r,[[u-0.02,v],[u+0.02,v+0.015]],'rgba(255,255,255,.12)',1); }
      for(const v of [pip,dip]) for(let k=0;k<2;k++){ const vv=v-0.012+k*0.022+(rnd()-0.5)*0.008, a=0.36+rnd()*0.06, c=0.64-rnd()*0.06; line(g,r,[[a,vv],[0.5,vv+0.008],[c,vv]],'rgba(0,0,0,.16)',1.6); line(b,r,[[a,vv],[0.5,vv+0.008],[c,vv]],'rgba(0,0,0,.28)',1.6); }
      if(style==='tac'){ for(const [a,c] of [[mcp+0.02,pip-0.04],[pip+0.04,dip-0.03]]){ const [x0,y1]=at(r,0.36,a), [x1,y0]=at(r,0.64,c); g.fillStyle='#22231e'; g.fillRect(x0,y0,x1-x0,y1-y0); b.fillStyle='#e0e0e0'; b.fillRect(x0,y0,x1-x0,y1-y0); }
        const [x0,y0]=at(r,0,1); g.fillStyle='#262622'; g.fillRect(x0,y0,r.w*0.14,r.h); g.fillRect(x0+r.w*0.86,y0,r.w*0.14,r.h); }
      if(style==='leather'){ const [x0,y1]=at(r,0.38,dip+0.25*(1-dip)), [x1,y0]=at(r,0.62,0.99); g.fillStyle='rgba(255,220,180,.12)'; g.fillRect(x0,y0,x1-x0,y1-y0); }
      if(style==='cyber'){ for(const v of [mcp,pip,dip]){ line(g,r,[[0,v],[1,v]],'rgba(0,0,0,.7)',3); line(b,r,[[0,v],[1,v]],'rgba(0,0,0,.8)',3); } line(g,r,[[0.5,mcp+0.05],[0.5,dip]],'#22e8ff',2); const [nx,ny]=at(r,0.5,0.92); g.fillStyle='#22e8ff'; g.beginPath(); g.arc(nx,ny,3,0,7); g.fill(); }
    }
  }
  const t=new THREE.CanvasTexture(cv); t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); t.flipY=true;
  const bt=new THREE.CanvasTexture(bv); bt.flipY=true;
  return {map:t,bump:bt}; }
function fphMat(look){ const H=(look&&look.hands)||'tac', skin=(look&&look.skin)||'#c89474'; const style=H==='bare'?'bare':H==='vamp'?'vamp':H; const key=style+':'+skin;
  let m=FPH.mats.get(key); if(m) return m;
  const T=fphPaint(style==='vamp'?'vamp':style,style==='vamp'?'#c7b9c3':skin);
  const sp={latex:[0x5a6488,34],cyber:[0x7a848e,44],leather:[0x3a2a1a,26],tac:[0x1a1a16,8],finger:[0x2a221c,12],bare:[0x2a221c,14],vamp:[0x2a2228,18]}[style]||[0x222222,12];
  m=new THREE.MeshPhongMaterial({map:T.map,bumpMap:T.bump,bumpScale:0.011,specular:sp[0],shininess:sp[1],skinning:true});
  m.userData.fph=1; FPH.mats.set(key,m); return m; }
function fphApply(){ if(!FPH.built) return; let look=null; try{ look=curVar().look; }catch(e){} const m=fphMat(look); FPH.cur=m;
  for(const S of ['R','L']){ const ms=RIG.meshes&&RIG.meshes[S]; if(ms){ ms.material=m; } } try{ if(typeof CINE_HANDS!=='undefined'&&CINE_HANDS.off) m.visible=false; else m.visible=true; }catch(e){} }
function fphBuild(){ if(FPH.built||!FPH.on||!RIG.ok||!RIG.meshes) return;
  try{ for(const S of ['R','L']){ const ms=RIG.meshes[S]; if(!ms) continue; const g=fphBuildSide(ms,S); FPH.geo[S]=g; FPH.old=FPH.old||{}; FPH.old[S]={geo:ms.geometry,mat:ms.material}; ms.geometry=g; }
    for(const S of ['R','L']){ const sl=RIG.sleeves&&RIG.sleeves[S]&&RIG.sleeves[S][0]; if(sl){ sl.userData.fphY0=sl.position.y; sl.position.y-=0.02; } }   // barra da manga 2 cm para trás: o pulso aparece
    FPH.built=true; fphApply(); console.log('[Bunker] mãos novas prontas',FPH.geo.R&&FPH.geo.R.attributes.position.count,'vértices por mão'); }
  catch(e){ console.warn('[Bunker] mãos novas',e); if(FPH.old) for(const S in FPH.old){ const ms=RIG.meshes[S]; ms.geometry=FPH.old[S].geo; ms.material=FPH.old[S].mat; } FPH.built=false; FPH.on=false; } }
{ const ah=applyHands; applyHands=function(){ const r=ah.apply(this,arguments); try{ fphApply(); }catch(e){} return r; }; }
{ const rs=rigSyncMats; rigSyncMats=function(){ const r=rs.apply(this,arguments); try{ fphApply(); }catch(e){} return r; }; }
{ const cm=cineMats; cineMats=function(){ const a=cm.apply(this,arguments); if(FPH.cur) a.push(FPH.cur); return a; }; }
{ const iv=setInterval(()=>{ if(FPH.built||!FPH.on||++FPH.tries>400){ clearInterval(iv); return; } if(RIG.ok&&RIG.meshes) fphBuild(); },150); }
CMDS.maos={cheat:1,d:'maos [on|off] · mãos novas detalhadas na primeira pessoa',f:a=>{ const on=(a[0]||'on')!=='off';
  if(!on&&FPH.built){ for(const S in FPH.old){ const ms=RIG.meshes[S]; ms.geometry=FPH.old[S].geo; ms.material=FPH.old[S].mat; const sl=RIG.sleeves[S]&&RIG.sleeves[S][0]; if(sl&&sl.userData.fphY0!=null) sl.position.y=sl.userData.fphY0; } FPH.built=false; FPH.on=false; }
  else if(on&&!FPH.built){ FPH.on=true; fphBuild(); } cprint('mãos novas: '+(FPH.built?'ligadas':'desligadas')); }};
