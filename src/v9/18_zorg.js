/* ================= v9 · ZUMBIS MAIS ORGÂNICOS =================
   Troca as peças de caixa e cilindro liso do corpo dos zumbis por formas torneadas (músculo, panturrilha, cintura),
   arredonda mãos, dedos, mandíbula e botas e deixa a pele irregular com um ruído fixo por posição (sem rachar nas emendas). */
function v9OrganicZG(ZG){
  const T=THREE; const hsh=(x,y,z)=>{ const s=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return s-Math.floor(s); };
  const lathe=(prof,seg,translateTop)=>{ const pts=prof.map(([r,y])=>new T.Vector2(Math.max(0,r),y)); const g=new T.LatheGeometry(pts,seg,Math.PI,Math.PI*2); g.computeVertexNormals(); return g; };
  const lump=(g,amt)=>{ const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const r=Math.hypot(x,z); if(r<1e-4) continue; const n=(hsh(Math.round(x*400)/400,Math.round(y*400)/400,Math.round(z*400)/400)-0.5)*amt+Math.sin(y*38+Math.atan2(x,z)*3)*amt*0.35; p.setXYZ(i,x*(1+n/r),y,z*(1+n/r)); } g.computeVertexNormals(); return g; };
  const rbox=(w,h,d,r,seg)=>{ const g=new T.BoxGeometry(w,h,d,seg||4,seg||4,seg||4); const p=g.attributes.position, hx=w/2-r, hy=h/2-r, hz=d/2-r, v=new T.Vector3(), c=new T.Vector3();
    for(let i=0;i<p.count;i++){ v.set(p.getX(i),p.getY(i),p.getZ(i)); c.set(Math.max(-hx,Math.min(hx,v.x)),Math.max(-hy,Math.min(hy,v.y)),Math.max(-hz,Math.min(hz,v.z))); const dd=v.clone().sub(c); const l=dd.length(); if(l>1e-6) dd.multiplyScalar(r/l); p.setXYZ(i,c.x+dd.x,c.y+dd.y,c.z+dd.z); } g.computeVertexNormals(); return g; };
  const limb=(top,mid,bot,h,bulgeAt)=>{ const prof=[[0,0],[top*0.8,-0.004],[top,-h*0.06],[mid,-h*bulgeAt],[ (mid+bot)/2, -h*0.72],[bot,-h*0.94],[bot*0.75,-h],[0,-h-0.002]]; return lump(lathe(prof.map(([r,y])=>[r,y]).reverse(),14),0.004); };
  // torso: lathe de cintura a ombro (0 → 0.56), mesma altura e raio do cilindro original
  ZG.torso=lump(lathe([[0,0],[0.162,0.004],[0.172,0.06],[0.166,0.15],[0.172,0.24],[0.19,0.34],[0.208,0.43],[0.215,0.5],[0.208,0.555],[0,0.562]],18),0.006);
  ZG.hips=lump(lathe([[0,-0.09],[0.15,-0.088],[0.168,-0.04],[0.172,0.03],[0.17,0.09],[0,0.092]],16),0.004);
  ZG.uarm=limb(0.054,0.057,0.044,0.3,0.35); ZG.farm=limb(0.047,0.049,0.034,0.27,0.25);
  ZG.thigh=limb(0.08,0.082,0.058,0.44,0.3); ZG.shin=limb(0.058,0.066,0.044,0.42,0.28);
  ZG.neck=lump(lathe([[0,0],[0.07,0.002],[0.064,0.05],[0.06,0.1],[0,0.104]],12),0.003);
  ZG.palm=rbox(0.068,0.085,0.034,0.014); ZG.palm.translate(0,-0.045,0);
  ZG.finger=rbox(0.013,0.065,0.014,0.006,2); ZG.finger.translate(0,-0.032,0);
  ZG.boot=rbox(0.1,0.09,0.24,0.03); ZG.boot.translate(0,-0.045,0.045);
  ZG.jaw=rbox(0.105,0.035,0.09,0.014); ZG.jaw.translate(0,-0.02,0.05);
  // cabeça: crânio mais alongado, maçãs do rosto, testa e queixo
  const hd=new T.SphereGeometry(0.13,28,22), p=hd.attributes.position; for(let i=0;i<p.count;i++){ let x=p.getX(i),y=p.getY(i),z=p.getZ(i); const ny=y/0.13, nz=z/0.13, nx=x/0.13;
    if(ny<-0.2){ const k=(-ny-0.2)/0.8; x*=1-0.22*k; } if(nz<-0.1) z*=1.06; y*=1.05; if(nz>0.6&&ny>0.15&&ny<0.4) z+=0.006; if(nz>0.5&&Math.abs(nx)>0.45&&ny>-0.3&&ny<0.05) x*=1.04;
    const n=(hsh(Math.round(x*500),Math.round(y*500),Math.round(z*500))-0.5)*0.004; p.setXYZ(i,x+nx*n,y+ny*n,z+nz*n); }
  hd.computeVertexNormals(); hd.translate(0,0.13,0); ZG.head=hd;
}
