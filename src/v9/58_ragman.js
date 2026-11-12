/* ================= v9 · PARQUE 4FUN · LABORATÓRIO DE FÍSICA: o homem de testes =================
   Ragdoll ativo de corpos rígidos (estilo Euphoria / GTA V / RDR2), feito do zero:
   - 16 ossos rígidos (bacia, abdômen, tórax, cabeça+pescoço, braço, antebraço, mão, coxa, canela, pé), cada um com
     massa e inércia reais, posição, rotação e velocidade angular. Física XPBD (Müller 2020) em subpassos de ~1 ms.
   - 15 articulações com limites anatômicos (balanço em elipse + torção): joelho e cotovelo só dobram para o lado certo,
     ombro não vai para trás demais, quadril, coluna, pescoço, punho e tornozelo com faixas reais.
   - Colisão de todas as partes entre si (cápsula contra cápsula, com atrito) e com o chão (atrito estático e dinâmico,
     sem quique), então braço e perna não atravessam o corpo.
   - Músculos em cada articulação (mola + amortecimento) seguindo poses; força muda com o estado (em pé, caindo, caído,
     morto) e cede no lugar do tiro. Equilíbrio ativo: tronco seguro em pé, pés plantados, ponto de captura decide os
     passos para não cair; se não dá, ele cai protegendo o corpo com os braços.
   - Coice físico: cada tiro empurra no ponto exato com a força da arma (pistola recua pouco, escopeta arremessa).
   Gore: sangue pulsando com o coração, mão tampando a ferida, poça, membros arrancados na junta, cabeça explode,
   barriga abre com órgãos e intestino pendurado, peito abre com costelas, pulmões e coração batendo. */

/* ---------- matemática em objetos simples (sem alocar dentro do laço da física) ---------- */
function rmv(x,y,z){ return {x:x||0,y:y||0,z:z||0}; }
function rmq(x,y,z,w){ return {x:x||0,y:y||0,z:z||0,w:w==null?1:w}; }
function vcp(o,a){ o.x=a.x; o.y=a.y; o.z=a.z; return o; }
function vsc(o,a,s){ o.x=a.x*s; o.y=a.y*s; o.z=a.z*s; return o; }
function vdot(a,b){ return a.x*b.x+a.y*b.y+a.z*b.z; }
function vcross(o,a,b){ const x=a.y*b.z-a.z*b.y, y=a.z*b.x-a.x*b.z, z=a.x*b.y-a.y*b.x; o.x=x; o.y=y; o.z=z; return o; }
function vlen(a){ return Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z); }
function qcp(o,a){ o.x=a.x; o.y=a.y; o.z=a.z; o.w=a.w; return o; }
function qmul(o,a,b){ const x=a.w*b.x+a.x*b.w+a.y*b.z-a.z*b.y, y=a.w*b.y-a.x*b.z+a.y*b.w+a.z*b.x, z=a.w*b.z+a.x*b.y-a.y*b.x+a.z*b.w, w=a.w*b.w-a.x*b.x-a.y*b.y-a.z*b.z; o.x=x; o.y=y; o.z=z; o.w=w; return o; }
function qcj(o,a){ o.x=-a.x; o.y=-a.y; o.z=-a.z; o.w=a.w; return o; }
function qnrm(q){ const l=Math.sqrt(q.x*q.x+q.y*q.y+q.z*q.z+q.w*q.w)||1; q.x/=l; q.y/=l; q.z/=l; q.w/=l; return q; }
function qrot(o,q,v){ const tx=2*(q.y*v.z-q.z*v.y), ty=2*(q.z*v.x-q.x*v.z), tz=2*(q.x*v.y-q.y*v.x);
  const x=v.x+q.w*tx+(q.y*tz-q.z*ty), y=v.y+q.w*ty+(q.z*tx-q.x*tz), z=v.z+q.w*tz+(q.x*ty-q.y*tx); o.x=x; o.y=y; o.z=z; return o; }
function qroti(o,q,v){ const qx=-q.x, qy=-q.y, qz=-q.z, qw=q.w; const tx=2*(qy*v.z-qz*v.y), ty=2*(qz*v.x-qx*v.z), tz=2*(qx*v.y-qy*v.x);
  const x=v.x+qw*tx+(qy*tz-qz*ty), y=v.y+qw*ty+(qz*tx-qx*tz), z=v.z+qw*tz+(qx*ty-qy*tx); o.x=x; o.y=y; o.z=z; return o; }
function qrv(o,x,y,z){ const a=Math.sqrt(x*x+y*y+z*z); if(a<1e-9){ o.x=x*0.5; o.y=y*0.5; o.z=z*0.5; o.w=1; return qnrm(o); } const s=Math.sin(a*0.5)/a; o.x=x*s; o.y=y*s; o.z=z*s; o.w=Math.cos(a*0.5); return o; }
function qtorv(o,q){ let x=q.x,y=q.y,z=q.z,w=q.w; if(w<0){ x=-x; y=-y; z=-z; w=-w; } const s=Math.sqrt(x*x+y*y+z*z); if(s<1e-9){ o.x=2*x; o.y=2*y; o.z=2*z; return o; } const k=2*Math.atan2(s,w)/s; o.x=x*k; o.y=y*k; o.z=z*k; return o; }
function qaddrv(q,x,y,z){ const qx=q.x,qy=q.y,qz=q.z,qw=q.w; q.x+=0.5*(x*qw+y*qz-z*qy); q.y+=0.5*(y*qw+z*qx-x*qz); q.z+=0.5*(z*qw+x*qy-y*qx); q.w+=0.5*(-x*qx-y*qy-z*qz); return qnrm(q); }
function qbasis(o,X,Y,Z){ const m00=X.x,m10=X.y,m20=X.z,m01=Y.x,m11=Y.y,m21=Y.z,m02=Z.x,m12=Z.y,m22=Z.z, tr=m00+m11+m22;
  if(tr>0){ const s=0.5/Math.sqrt(tr+1); o.w=0.25/s; o.x=(m21-m12)*s; o.y=(m02-m20)*s; o.z=(m10-m01)*s; }
  else if(m00>m11&&m00>m22){ const s=2*Math.sqrt(1+m00-m11-m22); o.w=(m21-m12)/s; o.x=0.25*s; o.y=(m01+m10)/s; o.z=(m02+m20)/s; }
  else if(m11>m22){ const s=2*Math.sqrt(1+m11-m00-m22); o.w=(m02-m20)/s; o.x=(m01+m10)/s; o.y=0.25*s; o.z=(m12+m21)/s; }
  else { const s=2*Math.sqrt(1+m22-m00-m11); o.w=(m10-m01)/s; o.x=(m02+m20)/s; o.y=(m12+m21)/s; o.z=0.25*s; }
  return qnrm(o); }
function qslerp(o,a,b,t){ let bx=b.x,by=b.y,bz=b.z,bw=b.w; let c=a.x*bx+a.y*by+a.z*bz+a.w*bw; if(c<0){ c=-c; bx=-bx; by=-by; bz=-bz; bw=-bw; }
  let k0,k1; if(c>0.9995){ k0=1-t; k1=t; } else { const th=Math.acos(c), s=Math.sin(th); k0=Math.sin((1-t)*th)/s; k1=Math.sin(t*th)/s; }
  o.x=a.x*k0+bx*k1; o.y=a.y*k0+by*k1; o.z=a.z*k0+bz*k1; o.w=a.w*k0+bw*k1; return qnrm(o); }
const rmCl=(v,a,b)=>v<a?a:v>b?b:v;
const RMD2R=Math.PI/180;

/* ---------- esqueleto em pé (metros; olhando +z, +x = lado esquerdo dele) ---------- */
const RMSK={ ank:[0.10,0.085,0.0], kn:[0.10,0.50,0.025], hip:[0.095,0.925,0.0], heel:[0.10,0.045,-0.05], toe:[0.11,0.042,0.175],
  sh:[0.185,1.425,-0.025], el:[0.215,1.155,-0.045], wr:[0.232,0.905,-0.005], fing:[0.236,0.725,0.015],
  sp0:[0,1.02,-0.02], sp1:[0,1.185,-0.02], neck:[0,1.47,-0.025], head:[0,1.655,0.01] };
function rmSk(n,s){ const p=RMSK[n]; return rmv(p[0]*(s||1),p[1],p[2]); }
function rmLerp3(a,b,t){ return rmv(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,a.z+(b.z-a.z)*t); }
function rmDir3(a,b){ const x=b.x-a.x, y=b.y-a.y, z=b.z-a.z, l=Math.hypot(x,y,z)||1; return rmv(x/l,y/l,z/l); }
function rmInset(a,b,d){ return rmLerp3(a,b,d/(Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)||1)); }
// corpos: nome, centro de massa (pose em pé), massa (kg), caixa para a inércia [l,a,p], formas de colisão {a,b,r,tag}, parte, lado
function rmBodyDefs(){ const B=[], P=rmv;
  const body=(name,com,m,box,shapes,part,side)=>B.push({name,com,m,box,shapes,part,side});
  body('pelvis',P(0,0.955,-0.01),11.5,[0.33,0.2,0.24],[{a:P(-0.07,0.955,-0.01),b:P(0.07,0.955,-0.01),r:0.108,tag:'pelvis'}],'pelvis',0);
  body('abdomen',P(0,1.10,-0.012),8.5,[0.31,0.17,0.21],[{a:P(-0.04,1.10,-0.012),b:P(0.04,1.10,-0.012),r:0.113,tag:'belly'}],'belly',0);
  body('chest',P(0,1.31,-0.02),16,[0.37,0.32,0.23],[{a:P(-0.07,1.365,-0.025),b:P(0.07,1.365,-0.025),r:0.118,tag:'chest'},{a:P(0,1.215,-0.015),b:P(0,1.29,-0.015),r:0.122,tag:'chest'}],'chest',0);
  body('head',P(0,1.62,0.0),5.5,[0.19,0.3,0.22],[{a:P(0,1.66,0.015),b:P(0,1.66,0.015),r:0.104,tag:'head'},{a:P(0,1.49,-0.025),b:P(0,1.56,-0.012),r:0.05,tag:'neck'}],'head',0);
  for(const s of [1,-1]){ const S=s>0?'L':'R', k=n=>rmSk(n,s);
    const sh=k('sh'), el=k('el'), wr=k('wr'), fi=k('fing'), hp=k('hip'), kn=k('kn'), an=k('ank'), he=k('heel'), to=k('toe');
    body('uarm'+S,rmLerp3(sh,el,0.45),2.2,[0.095,0.28,0.095],[{a:rmInset(sh,el,0.045),b:el,r:0.045,tag:'uarm'}],'arm',s);
    body('farm'+S,rmLerp3(el,wr,0.43),1.4,[0.08,0.26,0.08],[{a:el,b:wr,r:0.038,tag:'farm'}],'arm',s);
    body('hand'+S,rmLerp3(wr,fi,0.42),0.55,[0.035,0.18,0.09],[{a:rmInset(wr,fi,0.025),b:rmInset(fi,wr,0.03),r:0.033,tag:'hand'}],'hand',s);
    body('thigh'+S,rmLerp3(hp,kn,0.42),9.5,[0.15,0.43,0.15],[{a:rmInset(hp,kn,0.035),b:kn,r:0.07,tag:'thigh'}],'leg',s);
    body('shin'+S,rmLerp3(kn,an,0.42),4.0,[0.1,0.42,0.1],[{a:kn,b:an,r:0.049,tag:'shin'}],'leg',s);
    body('foot'+S,P(0.105*s,0.06,0.055),1.2,[0.1,0.08,0.25],[{a:he,b:to,r:0.042,tag:'foot'}],'foot',s); }
  return B; }
// articulações: nome, pai, filho, ponto, direção do osso filho, direção de flexão(+), lado(+), flexão [min,max], lado [min,max], torção [min,max] (graus), força muscular (N·m/rad), grupo
function rmJointDefs(){ const J=[], P=rmv, UP=P(0,1,0), FW=P(0,0,1), LF=P(1,0,0);
  const jt=(name,p,c,at,d,f,out,fr,sr,tr,k,grp)=>J.push({name,p,c,at,d,f,out,fr,sr,tr,k,grp});
  jt('sp0','pelvis','abdomen',rmSk('sp0'),UP,FW,LF,[-20,35],[-20,20],[-15,15],900,'spine');
  jt('sp1','abdomen','chest',rmSk('sp1'),UP,FW,LF,[-20,30],[-20,20],[-25,25],800,'spine');
  jt('neck','chest','head',rmSk('neck'),UP,FW,LF,[-40,55],[-35,35],[-70,70],85,'neck');
  for(const s of [1,-1]){ const S=s>0?'L':'R', k=n=>rmSk(n,s), OUT=P(s,0,0);
    jt('sh'+S,'chest','uarm'+S,k('sh'),rmDir3(k('sh'),k('el')),FW,OUT,[-50,170],[-30,160],[-80,80],90,'arm');
    jt('el'+S,'uarm'+S,'farm'+S,k('el'),rmDir3(k('el'),k('wr')),FW,OUT,[-12,145],[-4,4],[-80,80],55,'arm');
    jt('wr'+S,'farm'+S,'hand'+S,k('wr'),rmDir3(k('wr'),k('fing')),P(-s,0,0),FW,[-70,80],[-30,20],[-6,6],12,'wrist');
    jt('hip'+S,'pelvis','thigh'+S,k('hip'),rmDir3(k('hip'),k('kn')),FW,OUT,[-20,125],[-25,45],[-40,40],620,'leg');
    jt('kn'+S,'thigh'+S,'shin'+S,k('kn'),rmDir3(k('kn'),k('ank')),P(0,0,-1),OUT,[-3,150],[-3,3],[-12,12],540,'leg');
    jt('an'+S,'shin'+S,'foot'+S,k('ank'),rmDir3(k('heel'),k('toe')),UP,OUT,[-45,25],[-20,20],[-25,25],520,'leg'); }
  return J; }

/* ---------- montagem da física ---------- */
const RMPH={B:[],J:[],byName:{},pairs:[],cts:[],scts:[],h:1/960};
function rmPhysBuild(){ const BD=rmBodyDefs(), JD=rmJointDefs(); RMPH.B=[]; RMPH.J=[]; RMPH.byName={};
  for(const d of BD){ const [w,h,dp]=d.box, m=d.m;
    const b={name:d.name,part:d.part,side:d.side,m,im:1/m,iI:rmv(12/(m*(h*h+dp*dp)),12/(m*(w*w+dp*dp)),12/(m*(w*w+h*h))),com:vcp(rmv(),d.com),
      shapes:d.shapes.map(s=>({a:rmv(s.a.x-d.com.x,s.a.y-d.com.y,s.a.z-d.com.z),b:rmv(s.b.x-d.com.x,s.b.y-d.com.y,s.b.z-d.com.z),r:s.r,r0:s.r,tag:s.tag,sph:s.a.x===s.b.x&&s.a.y===s.b.y&&s.a.z===s.b.z})),
      x:rmv(),q:rmq(),v:rmv(),w:rmv(),xp:rmv(),qp:rmq(),att:true,idx:RMPH.B.length,mu:d.part==='foot'?1.0:0.8,kin:false};
    b.iI0=vcp(rmv(),b.iI);
    b.br=0; for(const s of b.shapes) b.br=Math.max(b.br,vlen(s.a)+s.r,vlen(s.b)+s.r);
    RMPH.B.push(b); RMPH.byName[b.name]=b; }
  for(const d of JD){ const P=RMPH.byName[d.p], C=RMPH.byName[d.c];
    const x=vcp(rmv(),d.d), fd=rmv(d.f.x-x.x*vdot(x,d.f),d.f.y-x.y*vdot(x,d.f),d.f.z-x.z*vdot(x,d.f)); const fl=vlen(fd); fd.x/=fl; fd.y/=fl; fd.z/=fl;
    const z=vcross(rmv(),x,fd); const JC=qbasis(rmq(),x,fd,z);
    const sideSign=(-z.x*d.out.x-z.y*d.out.y-z.z*d.out.z)>0?1:-1;
    const fc=(d.fr[0]+d.fr[1])/2*RMD2R, sc=(d.sr[0]+d.sr[1])/2*RMD2R, lf=(d.fr[1]-d.fr[0])/2*RMD2R, ls=(d.sr[1]-d.sr[0])/2*RMD2R;
    const Qc=qrv(rmq(),0,sideSign*sc,fc); const JP=qmul(rmq(),JC,Qc);
    const j={name:d.name,P,C,grp:d.grp,rp:rmv(d.at.x-P.com.x,d.at.y-P.com.y,d.at.z-P.com.z),rc:rmv(d.at.x-C.com.x,d.at.y-C.com.y,d.at.z-C.com.z),at:vcp(rmv(),d.at),
      d:x,JC,JP,sideSign,lf,ls,ell:lf>0.35&&ls>0.35,elz:lf*1.25,ely:ls*1.25,tmin:d.tr[0]*RMD2R,tmax:d.tr[1]*RMD2R,k:d.k,on:true,
      tq:rmq(),tg:rmq(),str:0,strG:0,relax:0,damp:10};
    RMPH.J.push(j); RMPH.byName['j_'+d.name]=j; }
  // pares de colisão entre partes: todos, menos os ligados por junta e os que já se encostam em pé
  RMPH.pairs=[]; const B=RMPH.B; const linked=new Set(RMPH.J.map(j=>j.P.idx+'|'+j.C.idx));
  const tmp={a0:rmv(),a1:rmv(),b0:rmv(),b1:rmv()};
  for(let i=0;i<B.length;i++) for(let k=i+1;k<B.length;k++){ const A=B[i], C=B[k]; if(linked.has(i+'|'+k)||linked.has(k+'|'+i)) continue;
    let over=false; for(const sa of A.shapes) for(const sb of C.shapes){ const a0=rmv(A.com.x+sa.a.x,A.com.y+sa.a.y,A.com.z+sa.a.z), a1=rmv(A.com.x+sa.b.x,A.com.y+sa.b.y,A.com.z+sa.b.z), b0=rmv(C.com.x+sb.a.x,C.com.y+sb.a.y,C.com.z+sb.a.z), b1=rmv(C.com.x+sb.b.x,C.com.y+sb.b.y,C.com.z+sb.b.z);
      const r=rmSegSeg(a0,a1,b0,b1); if(r.d<sa.r+sb.r-0.004) over=true; }
    if(!over) RMPH.pairs.push([A,C]); else RMPH.skip=(RMPH.skip||[]).concat([A.name+'-'+C.name]); }
}
// menor distância entre dois segmentos (devolve parâmetros e distância)
const RMSS={s:0,t:0,d:0};
function rmSegSeg(p0,p1,q0,q1){ const d1x=p1.x-p0.x, d1y=p1.y-p0.y, d1z=p1.z-p0.z, d2x=q1.x-q0.x, d2y=q1.y-q0.y, d2z=q1.z-q0.z, rx=p0.x-q0.x, ry=p0.y-q0.y, rz=p0.z-q0.z;
  const a=d1x*d1x+d1y*d1y+d1z*d1z, e=d2x*d2x+d2y*d2y+d2z*d2z, f=d2x*rx+d2y*ry+d2z*rz; let s,t;
  if(a<1e-9&&e<1e-9){ s=0; t=0; }
  else if(a<1e-9){ s=0; t=rmCl(f/e,0,1); }
  else { const c=d1x*rx+d1y*ry+d1z*rz; if(e<1e-9){ t=0; s=rmCl(-c/a,0,1); } else { const b=d1x*d2x+d1y*d2y+d1z*d2z, den=a*e-b*b; s=den>1e-9?rmCl((b*f-c*e)/den,0,1):0; t=(b*s+f)/e; if(t<0){ t=0; s=rmCl(-c/a,0,1); } else if(t>1){ t=1; s=rmCl((b-c)/a,0,1); } } }
  const px=p0.x+d1x*s-(q0.x+d2x*t), py=p0.y+d1y*s-(q0.y+d2y*t), pz=p0.z+d1z*s-(q0.z+d2z*t); RMSS.s=s; RMSS.t=t; RMSS.d=Math.sqrt(px*px+py*py+pz*pz); return RMSS; }
// pose → rotação relativa alvo (no referencial do pai): JC · (balanço·torção) · JC⁻¹
function rmPoseQ(o,j,f,s,t){ const A=rmq(), T=rmq(); qrv(A,0,j.sideSign*s*RMD2R,f*RMD2R); T.x=Math.sin(t*RMD2R/2); T.w=Math.cos(t*RMD2R/2); qmul(A,A,T); qmul(o,j.JC,A); qcj(T,j.JC); return qmul(o,o,T); }
/* ---------- solver XPBD de corpos rígidos ---------- */
const RMT={e:rmv(),d:rmv(),n:rmv(),p:rmv(),r1:rmv(),r2:rmv(),a:rmv(),b:rmv(),c:rmv(),u:rmv()};
const RMLQ={a:rmq(),b:rmq(),c:rmq(),t:rmq(),s:rmq(),v:rmv()};
let RMIH2=960*960;
// inércia inversa no mundo (matriz 3x3 guardada por subpasso: R·diag·Rᵀ)
function rmIwUpd(b){ const q=b.q, x=q.x,y=q.y,z=q.z,w=q.w; const r00=1-2*(y*y+z*z), r01=2*(x*y-z*w), r02=2*(x*z+y*w), r10=2*(x*y+z*w), r11=1-2*(x*x+z*z), r12=2*(y*z-x*w), r20=2*(x*z-y*w), r21=2*(y*z+x*w), r22=1-2*(x*x+y*y);
  const a=b.iI.x, bb=b.iI.y, c=b.iI.z, M=b.Iw||(b.Iw=new Float64Array(9));
  M[0]=r00*r00*a+r01*r01*bb+r02*r02*c; M[1]=r00*r10*a+r01*r11*bb+r02*r12*c; M[2]=r00*r20*a+r01*r21*bb+r02*r22*c;
  M[3]=M[1]; M[4]=r10*r10*a+r11*r11*bb+r12*r12*c; M[5]=r10*r20*a+r11*r21*bb+r12*r22*c; M[6]=M[2]; M[7]=M[5]; M[8]=r20*r20*a+r21*r21*bb+r22*r22*c; }
function rmIIw(b,v,o){ const M=b.Iw, x=v.x,y=v.y,z=v.z; o.x=M[0]*x+M[1]*y+M[2]*z; o.y=M[3]*x+M[4]*y+M[5]*z; o.z=M[6]*x+M[7]*y+M[8]*z; return o; }
function rmGW(b,r,n){ if(!b) return 0; const t=RMT.e, u=RMT.d; vcross(t,r,n); rmIIw(b,t,u); return b.im+vdot(t,u); }
function rmPosApply(b,r,P,s){ b.x.x+=P.x*b.im*s; b.x.y+=P.y*b.im*s; b.x.z+=P.z*b.im*s; const t=RMT.e, u=RMT.d; vcross(t,r,P); rmIIw(b,t,u); qaddrv(b.q,u.x*s,u.y*s,u.z*s); }
// restrição de posição: leva o ponto 1 (corpo b1, braço r1) em +d e o ponto 2 em -d, dividido pelas massas; alpha = complacência (1/rigidez)
function rmPosC(b1,r1,b2,r2,dx,dy,dz,alpha){ const c=Math.sqrt(dx*dx+dy*dy+dz*dz); if(c<1e-9) return 0; const n=RMT.n; n.x=dx/c; n.y=dy/c; n.z=dz/c;
  const w=rmGW(b1,r1,n)+rmGW(b2,r2,n); if(w<=0) return 0; const dl=c/(w+alpha*RMIH2); const P=RMT.p; P.x=n.x*dl; P.y=n.y*dl; P.z=n.z*dl;
  if(b1) rmPosApply(b1,r1,P,1); if(b2) rmPosApply(b2,r2,P,-1); return dl; }
// restrição angular: gira b2 em +e e b1 em -e (dividido pela inércia)
function rmAngC(b1,b2,ex,ey,ez,alpha){ const th=Math.sqrt(ex*ex+ey*ey+ez*ez); if(th<1e-9) return 0; const n=RMT.n; n.x=ex/th; n.y=ey/th; n.z=ez/th; const u=RMT.d;
  let w=0; if(b1){ rmIIw(b1,n,u); w+=vdot(n,u); } if(b2){ rmIIw(b2,n,u); w+=vdot(n,u); } if(w<=0) return 0;
  const dl=th/(w+alpha*RMIH2); const P=RMT.p; P.x=n.x*dl; P.y=n.y*dl; P.z=n.z*dl;
  if(b2){ rmIIw(b2,P,u); qaddrv(b2.q,u.x,u.y,u.z); } if(b1){ rmIIw(b1,P,u); qaddrv(b1.q,-u.x,-u.y,-u.z); } return dl; }
function rmJointPos(j){ const P=j.P, C=j.C, r1=RMT.r1, r2=RMT.r2; qrot(r1,P.q,j.rp); qrot(r2,C.q,j.rc);
  rmPosC(P,r1,C,r2,(C.x.x+r2.x)-(P.x.x+r1.x),(C.x.y+r2.y)-(P.x.y+r1.y),(C.x.z+r2.z)-(P.x.z+r1.z),0); }
// limite anatômico: decompõe a rotação relativa em balanço (elipse/caixa) + torção e corrige o que passar
function rmJointLimit(j){ const P=j.P, C=j.C, A=RMLQ.a, Bq=RMLQ.b, R=RMLQ.c, T=RMLQ.t, S=RMLQ.s, v=RMLQ.v;
  qmul(A,P.q,j.JP); qmul(Bq,C.q,j.JC); qcj(R,A); qmul(R,R,Bq);
  const tl=Math.sqrt(R.w*R.w+R.x*R.x); if(tl<1e-6){ T.x=0; T.y=0; T.z=0; T.w=1; } else { T.x=R.x/tl; T.y=0; T.z=0; T.w=R.w/tl; }
  qcj(S,T); qmul(S,R,S); let phi=2*Math.atan2(T.x,T.w); if(phi>Math.PI) phi-=2*Math.PI; else if(phi<-Math.PI) phi+=2*Math.PI;
  qtorv(v,S); const sy=v.y, sz=v.z; let ny=sy<-j.ls?-j.ls:sy>j.ls?j.ls:sy, nz=sz<-j.lf?-j.lf:sz>j.lf?j.lf:sz;
  if(j.ell){ const ey=ny/j.ely, ez=nz/j.elz, e=ey*ey+ez*ez; if(e>1){ const k=1/Math.sqrt(e); ny*=k; nz*=k; } }
  const nphi=phi<j.tmin?j.tmin:phi>j.tmax?j.tmax:phi;
  if(Math.abs(ny-sy)<1e-5&&Math.abs(nz-sz)<1e-5&&Math.abs(nphi-phi)<1e-5) return;
  qrv(S,0,ny,nz); T.x=Math.sin(nphi*0.5); T.y=0; T.z=0; T.w=Math.cos(nphi*0.5); qmul(R,S,T);
  qmul(Bq,A,R); qcj(S,j.JC); qmul(Bq,Bq,S); qcj(S,C.q); qmul(Bq,Bq,S); qtorv(v,Bq); rmAngC(P,C,v.x,v.y,v.z,0); }
// músculo: mola angular até a pose alvo (complacência 1/k)
function rmMuscle(j,k){ if(k<=0.5) return; const P=j.P, C=j.C, A=RMLQ.a, Bq=RMLQ.b, v=RMLQ.v; qmul(A,P.q,j.tq); qcj(Bq,C.q); qmul(A,A,Bq); qtorv(v,A); rmAngC(P,C,v.x,v.y,v.z,1/k); }
// atrito/amortecimento da junta (velocidade angular relativa)
function rmJointDampV(j,c,h){ const P=j.P, C=j.C; const dx=C.w.x-P.w.x, dy=C.w.y-P.w.y, dz=C.w.z-P.w.z, m=Math.sqrt(dx*dx+dy*dy+dz*dz); if(m<1e-7) return;
  const n=RMT.n, u=RMT.d, p=RMT.p; n.x=dx/m; n.y=dy/m; n.z=dz/m; rmIIw(P,n,u); let w=vdot(n,u); rmIIw(C,n,u); w+=vdot(n,u); if(w<=0) return;
  const pl=m*Math.min(1,c*h)/w; p.x=n.x*pl; p.y=n.y*pl; p.z=n.z*pl; rmIIw(P,p,u); P.w.x+=u.x; P.w.y+=u.y; P.w.z+=u.z; rmIIw(C,p,u); C.w.x-=u.x; C.w.y-=u.y; C.w.z-=u.z; }
// impulso de velocidade num ponto (r = braço no mundo)
function rmVelImp(b,r,px,py,pz){ b.v.x+=px*b.im; b.v.y+=py*b.im; b.v.z+=pz*b.im; const t=RMT.e, u=RMT.d; t.x=r.y*pz-r.z*py; t.y=r.z*px-r.x*pz; t.z=r.x*py-r.y*px; rmIIw(b,t,u); b.w.x+=u.x; b.w.y+=u.y; b.w.z+=u.z; }
function rmPtVel(o,b,r){ o.x=b.v.x+(b.w.y*r.z-b.w.z*r.y); o.y=b.v.y+(b.w.z*r.x-b.w.x*r.z); o.z=b.v.z+(b.w.x*r.y-b.w.y*r.x); return o; }

/* contatos com o chão (y=0) e entre as partes do corpo */
const RMCT=[]; let RMCTn=0; const RMSC=[]; let RMSCn=0;
function rmCtNew(){ if(RMCTn>=RMCT.length) RMCT.push({b:null,lp:rmv(),r:0,ln:0,vn:0,mu:0.8}); return RMCT[RMCTn++]; }
function rmScNew(){ if(RMSCn>=RMSC.length) RMSC.push({A:null,B:null,ra:rmv(),rb:rmv(),nx:0,ny:0,nz:0,ln:0}); return RMSC[RMSCn++]; }
function rmGroundPt(b,lp,r,mu){ const E=RMT.a, rw=RMT.r1, vv=RMT.c; qrot(E,b.q,lp); const ey=b.x.y+E.y; const depth=r-ey; if(depth<=0) return;
  rw.x=E.x; rw.y=E.y-r; rw.z=E.z; rmPtVel(vv,b,rw); const vn=vv.y;
  const ln=rmPosC(b,rw,null,null,0,depth,0,0);
  if(b.part==='chest'||b.part==='belly'||b.part==='pelvis'||b.part==='head') RM.groundT=RM.t;
  // atrito estático: desfaz o deslize do ponto de contato neste subpasso se a força normal segura
  const Pp=RMT.b; qrot(Pp,b.qp,lp); const px=b.xp.x+Pp.x, pz=b.xp.z+Pp.z; qrot(E,b.q,lp); rw.x=E.x; rw.y=E.y-r; rw.z=E.z;
  const dtx=(b.x.x+E.x)-px, dtz=(b.x.z+E.z)-pz, dl=Math.sqrt(dtx*dtx+dtz*dtz);
  if(dl>1e-7){ const n=RMT.u; n.x=dtx/dl; n.y=0; n.z=dtz/dl; const wt=rmGW(b,rw,n); if(wt>0&&dl/wt<mu*ln) rmPosC(b,rw,null,null,-dtx,0,-dtz,0); }
  const c=rmCtNew(); c.b=b; vcp(c.lp,lp); c.r=r; c.ln=ln; c.vn=vn; c.mu=mu; }
function rmSelfCol(){ const pr=RMPH.pairs, a0=RMT.a, a1=RMT.b, b0=RMT.c, b1=RMT.u;
  for(let i=0;i<pr.length;i++){ const A=pr[i][0], B=pr[i][1]; const dx=A.x.x-B.x.x, dy=A.x.y-B.x.y, dz=A.x.z-B.x.z, rr=A.br+B.br; if(dx*dx+dy*dy+dz*dz>rr*rr) continue;
    for(const sa of A.shapes){ if(sa.r<0.01) continue; for(const sb of B.shapes){ if(sb.r<0.01) continue;
      qrot(a0,A.q,sa.a); a0.x+=A.x.x; a0.y+=A.x.y; a0.z+=A.x.z; if(sa.sph) vcp(a1,a0); else { qrot(a1,A.q,sa.b); a1.x+=A.x.x; a1.y+=A.x.y; a1.z+=A.x.z; }
      qrot(b0,B.q,sb.a); b0.x+=B.x.x; b0.y+=B.x.y; b0.z+=B.x.z; if(sb.sph) vcp(b1,b0); else { qrot(b1,B.q,sb.b); b1.x+=B.x.x; b1.y+=B.x.y; b1.z+=B.x.z; }
      const R=rmSegSeg(a0,a1,b0,b1), rs=sa.r+sb.r; if(R.d>=rs) continue;
      const pAx=a0.x+(a1.x-a0.x)*R.s, pAy=a0.y+(a1.y-a0.y)*R.s, pAz=a0.z+(a1.z-a0.z)*R.s, pBx=b0.x+(b1.x-b0.x)*R.t, pBy=b0.y+(b1.y-b0.y)*R.t, pBz=b0.z+(b1.z-b0.z)*R.t;
      let nx=pAx-pBx, ny=pAy-pBy, nz=pAz-pBz; const d=R.d; if(d>1e-6){ nx/=d; ny/=d; nz/=d; } else { nx=0; ny=1; nz=0; }
      const pen=rs-d; const ra=RMT.r1, rb=RMT.r2; ra.x=pAx-nx*sa.r-A.x.x; ra.y=pAy-ny*sa.r-A.x.y; ra.z=pAz-nz*sa.r-A.x.z; rb.x=pBx+nx*sb.r-B.x.x; rb.y=pBy+ny*sb.r-B.x.y; rb.z=pBz+nz*sb.r-B.x.z;
      const ln=rmPosC(A,ra,B,rb,nx*pen,ny*pen,nz*pen,0);
      const c=rmScNew(); c.A=A; c.B=B; qroti(c.ra,A.q,ra); qroti(c.rb,B.q,rb); c.nx=nx; c.ny=ny; c.nz=nz; c.ln=ln; } } } }
/* ---------- um subpasso de física ---------- */
function rmSubstep(h){ const B=RMPH.B, J=RMPH.J; RMIH2=1/(h*h);
  const lin=1-0.015*h, ang=1-0.25*h;
  for(let i=0;i<B.length;i++){ const b=B[i]; if(b.kin){ vcp(b.xp,b.x); qcp(b.qp,b.q); continue; } b.v.y-=9.81*h; b.v.x*=lin; b.v.y*=lin; b.v.z*=lin; b.w.x*=ang; b.w.y*=ang; b.w.z*=ang;
    vcp(b.xp,b.x); b.x.x+=b.v.x*h; b.x.y+=b.v.y*h; b.x.z+=b.v.z*h; qcp(b.qp,b.q); qaddrv(b.q,b.w.x*h,b.w.y*h,b.w.z*h); }
  for(let i=0;i<B.length;i++) rmIwUpd(B[i]);
  rmCtrlSub(h);
  RMCTn=0; RMSCn=0; rmSelfCol();
  const slip=RM.thrownT>0?0.3:1;
  for(let i=0;i<B.length;i++){ const b=B[i], mu=b.mu*slip; for(const s of b.shapes){ if(s.r<0.01) continue; rmGroundPt(b,s.a,s.r,mu); if(!s.sph) rmGroundPt(b,s.b,s.r,mu); } }
  for(let i=J.length-1;i>=0;i--) if(J[i].on) rmJointPos(J[i]);
  for(let i=0;i<J.length;i++) if(J[i].on) rmJointPos(J[i]);
  for(let i=0;i<J.length;i++) if(J[i].on) rmJointLimit(J[i]);
  // velocidades a partir das posições
  const ih=1/h, dq=RMLQ.a;
  for(let i=0;i<B.length;i++){ const b=B[i]; if(b.kin){ b.v.x=b.v.y=b.v.z=0; b.w.x=b.w.y=b.w.z=0; continue; } b.v.x=(b.x.x-b.xp.x)*ih; b.v.y=(b.x.y-b.xp.y)*ih; b.v.z=(b.x.z-b.xp.z)*ih;
    qcj(dq,b.qp); qmul(dq,b.q,dq); const s=dq.w<0?-2*ih:2*ih; b.w.x=dq.x*s; b.w.y=dq.y*s; b.w.z=dq.z*s; }
  rmVelPass(h); rmCtrlVel(h);
  for(let i=0;i<B.length;i++){ const b=B[i]; const v=Math.sqrt(b.v.x*b.v.x+b.v.y*b.v.y+b.v.z*b.v.z); if(v>28){ const k=28/v; b.v.x*=k; b.v.y*=k; b.v.z*=k; }
    const w=Math.sqrt(b.w.x*b.w.x+b.w.y*b.w.y+b.w.z*b.w.z); if(w>40){ const k=40/w; b.w.x*=k; b.w.y*=k; b.w.z*=k; } } }
function rmVelPass(h){ const rw=RMT.r1, vv=RMT.c, ih2=1/(h*h);
  for(let i=0;i<RMCTn;i++){ const c=RMCT[i], b=c.b; qrot(rw,b.q,c.lp); rw.y-=c.r; rmPtVel(vv,b,rw);
    const vtx=vv.x, vtz=vv.z, vt=Math.sqrt(vtx*vtx+vtz*vtz);
    if(vt>1e-6){ const dv=Math.min(h*c.mu*0.85*c.ln*ih2,vt); const n=RMT.u; n.x=-vtx/vt; n.y=0; n.z=-vtz/vt; const w=rmGW(b,rw,n); if(w>0){ const p=dv/w; rmVelImp(b,rw,n.x*p,0,n.z*p); } }
    rmPtVel(vv,b,rw); const want=c.vn<-3?-0.08*c.vn:0; if(vv.y<want){ const n=RMT.u; n.x=0; n.y=1; n.z=0; const w=rmGW(b,rw,n); if(w>0) rmVelImp(b,rw,0,(want-vv.y)/w,0); } }
  // atrito entre as partes do corpo (braço não escorrega no tronco como sabão)
  for(let i=0;i<RMSCn;i++){ const c=RMSC[i], A=c.A, Bb=c.B, ra=RMT.r1, rb=RMT.r2, va=RMT.a, vb=RMT.b; qrot(ra,A.q,c.ra); qrot(rb,Bb.q,c.rb); rmPtVel(va,A,ra); rmPtVel(vb,Bb,rb);
    let rx=va.x-vb.x, ry=va.y-vb.y, rz=va.z-vb.z; const vn=rx*c.nx+ry*c.ny+rz*c.nz; rx-=c.nx*vn; ry-=c.ny*vn; rz-=c.nz*vn; const vt=Math.sqrt(rx*rx+ry*ry+rz*rz); if(vt<1e-6) continue;
    const dv=Math.min(h*0.6*c.ln*ih2,vt); const n=RMT.u; n.x=-rx/vt; n.y=-ry/vt; n.z=-rz/vt; const w=rmGW(A,ra,n)+rmGW(Bb,rb,n); if(w<=0) continue; const p=dv/w;
    rmVelImp(A,ra,n.x*p,n.y*p,n.z*p); rmVelImp(Bb,rb,-n.x*p,-n.y*p,-n.z*p); }
  for(let i=0;i<RMPH.J.length;i++){ const j=RMPH.J[i]; if(j.on) rmJointDampV(j,j.damp,h); } }
/* ---------- estado e controle (músculos, equilíbrio, passos, reações) ---------- */
const RM={built:false,on:false,g:null,dyn:null,st:'stand',blood:100,t:0,acc:0,A:1,hurt:0,yaw:0,yaw0:0,x:0,z:0,
  plant:[null,null],step:null,steps:[],fallT:0,fallDir:'F',groundT:0,landed:false,deadT:0,crumple:0,thrownT:0,legs:[1,1],
  wounds:[],acc:{},shot:-1,shotJ:0,lastHit:-9,headGone:false,openB:false,openC:false,gut:null,guard:[null,null],cov:1,
  drops:[],splat:0,pools:[],gibs:[],marks:[],sleep:false,sleepT:0,hipH:0.955,comOff:rmv(),com:rmv(),comV:rmv(),why:''};
// poses (graus: flexão, lado, torção); chave sem L/R vale para os dois lados
const RMPOSE={
  stand:{sp0:[3,0,0],sp1:[3,0,0],neck:[-2,0,0],sh:[3,6,0],el:[14,0,0],wr:[10,0,0],hip:[8,2,0],kn:[13,0,0],an:[5,0,0]},
  hurt:{sp0:[16,0,0],sp1:[20,0,0],neck:[16,0,0],sh:[22,12,0],el:[55,0,0],wr:[15,0,0],hip:[22,4,0],kn:[30,0,0],an:[9,0,0]},
  fallF:{sp0:[0,0,0],sp1:[-6,0,0],neck:[-28,0,0],sh:[95,24,0],el:[20,0,0],wr:[-45,0,0],hip:[22,8,0],kn:[28,0,0],an:[0,0,0]},
  fallB:{sp0:[24,0,0],sp1:[22,0,0],neck:[42,0,0],sh:[22,62,0],el:[55,0,0],wr:[12,0,0],hip:[48,10,0],kn:[58,0,0],an:[0,0,0]},
  collapse:{sp0:[26,0,0],sp1:[16,0,0],neck:[26,0,0],sh:[8,6,0],el:[24,0,0],wr:[15,0,0],hip:[62,6,0],kn:[118,0,0],an:[22,0,0]},
  down:{sp0:[8,0,0],sp1:[6,0,0],neck:[16,0,0],sh:[14,22,0],el:[45,0,0],wr:[20,0,0],hip:[30,10,0],kn:[52,0,0],an:[-15,0,0]},
  curl:{sp0:[26,0,0],sp1:[22,0,0],neck:[30,0,0],sh:[38,10,0],el:[100,0,0],wr:[25,0,0],hip:[78,5,0],kn:[105,0,0],an:[-20,0,0]} };
// força dos músculos por grupo e estado (fração da força máxima da junta)
const RMSTR={stand:{spine:1,neck:1,arm:0.42,wrist:0.4,leg:1},fall:{spine:0.32,neck:0.5,arm:0.55,wrist:0.3,leg:0.2},
  down:{spine:0.16,neck:0.3,arm:0.16,wrist:0.14,leg:0.13},collapse:{spine:0.3,neck:0.25,arm:0.12,wrist:0.1,leg:0.4}};
function rmPA(name,jn){ const P=RMPOSE[name]; return P[jn]||P[jn.replace(/[LR]$/,'')]||[0,0,0]; }
const RMTQ=rmq();
function rmYawQ(o,y){ o.x=0; o.y=Math.sin(y/2); o.z=0; o.w=Math.cos(y/2); return o; }
function rmRotY(o,x,y,z,yaw){ const c=Math.cos(yaw), s=Math.sin(yaw); o.x=x*c+z*s; o.y=y; o.z=-x*s+z*c; return o; }
function rmBodyYaw(b){ const f=qrot(rmv(),b.q,rmv(0,0,1)); return Math.atan2(f.x,f.z); }
function rmCom(){ let m=0,x=0,y=0,z=0,vx=0,vy=0,vz=0; for(const b of RMPH.B){ if(!b.att) continue; m+=b.m; x+=b.x.x*b.m; y+=b.x.y*b.m; z+=b.x.z*b.m; vx+=b.v.x*b.m; vy+=b.v.y*b.m; vz+=b.v.z*b.m; }
  RM.com.x=x/m; RM.com.y=y/m; RM.com.z=z/m; RM.comV.x=vx/m; RM.comV.y=vy/m; RM.comV.z=vz/m; return RM.com; }
// pés: centro do pé (no chão) e giro; o pé plantado fica preso em posição e orientação (sem rolar)
const RMFOOT={x:0.105,y:0.06,z:0.055};
function rmFootIdeal(ox,oz,yaw,fi){ const o=rmRotY(rmv(),RMFOOT.x*(fi?-1:1),0,RMFOOT.z,yaw); return {x:rmv(ox+o.x,RMFOOT.y,oz+o.z),yaw}; }
// origem atual do "homem" (centro entre os pés, sem o deslocamento da ponta) e o ponto onde o centro de massa deve ficar
function rmOrigin(){ let x=0,z=0,n=0; for(let fi=0;fi<2;fi++){ const p=RM.plant[fi]; if(!p) continue; const S=RM.step&&RM.step.f===fi?RM.step:null; const c=S?S.cx:p.x, y=S?S.cy:p.yaw;
    const off=rmRotY(rmv(),RMFOOT.x*(fi?-1:1),0,RMFOOT.z,y); x+=c.x-off.x; z+=c.z-off.z; n++; }
  if(!n){ const c=RM.com; return rmv(c.x,0,c.z); } return rmv(x/n,0,z/n); }
// pé plantado vira "cinemático": preso no chão (massa infinita), só a perna se mexe em cima dele
function rmFootLock(fi,on){ const b=RMPH.byName[fi?'footR':'footL']; if(!b) return; if(on&&b.att){ b.kin=true; b.im=0; b.iI.x=b.iI.y=b.iI.z=0; b.v.x=b.v.y=b.v.z=0; b.w.x=b.w.y=b.w.z=0; }
  else if(b.kin){ b.kin=false; b.im=1/b.m; vcp(b.iI,b.iI0); } }
function rmPlant(fi){ const b=RMPH.byName[fi?'footR':'footL']; RM.plant[fi]={x:rmv(b.x.x,RMFOOT.y,b.x.z),yaw:rmBodyYaw(b)}; rmFootLock(fi,true); }
function rmUnplantAll(){ RM.plant=[null,null]; rmFootLock(0,false); rmFootLock(1,false); }
function rmFall(why){ if(RM.st!=='stand') return; RM.why=why; RM.st='fall'; RM.fallT=0; RM.step=null; rmUnplantAll(); RM.A=0; RM.landed=false;
  // para que lado cai: velocidade do centro de massa (ou inclinação do peito) no referencial do quadril
  const c=RM.comV, ch=RMPH.byName.chest, up=qrot(rmv(),ch.q,rmv(0,1,0)); let dx=c.x+up.x*2, dz=c.z+up.z*2; const f=rmRotY(rmv(),0,0,1,RM.yaw), l=rmRotY(rmv(),1,0,0,RM.yaw);
  const fw=dx*f.x+dz*f.z, sd=dx*l.x+dz*l.z; RM.fallDir=Math.abs(fw)>=Math.abs(sd)*0.8?(fw>0?'F':'B'):(sd>0?'L':'R'); }
function rmKill(){ if(RM.st==='dead') return; RM.crumple=RM.st==='stand'?1:RM.st==='fall'?0.4:0.25; RM.st='dead'; RM.deadT=0; RM.step=null; rmUnplantAll(); RM.A=0; RM.sleep=false; RM.sleepT=0; }
// ângulos da pose atual de cada junta
function rmPoseNow(j,out){ const jn=j.name, st=RM.st; let a;
  if(st==='stand'){ const s=rmPA('stand',jn), h=rmPA('hurt',jn), k=RM.hurt; a=[s[0]+(h[0]-s[0])*k,s[1]+(h[1]-s[1])*k,s[2]+(h[2]-s[2])*k];
    if(jn==='sp1'||jn==='sp0') a[0]+=Math.sin(RM.t*1.6)*1.2;   // respiração
    if(jn==='neck'&&RM.look) { a[2]+=RM.look.t; a[0]+=RM.look.f; }
    if(j.C.side&&j.grp==='leg'){ const lg=1-RM.legs[j.C.side>0?0:1]; if(jn.startsWith('kn')) a[0]+=lg*38; else if(jn.startsWith('hip')) a[0]+=lg*20; else if(jn.startsWith('an')) a[0]+=lg*12; }
    const S=RM.step; if(S&&(j.C.side===(S.f?-1:1))){ const w=Math.sin(Math.PI*S.s); if(jn.startsWith('hip')) a[0]+=24*w; else if(jn.startsWith('kn')) a[0]+=48*w; else if(jn.startsWith('an')) a[0]+=12*w; } }
  else if(st==='fall'){ const d=RM.fallDir; if(d==='F'||d==='B') a=rmPA(d==='F'?'fallF':'fallB',jn).slice();
    else { a=rmPA('fallF',jn).slice(); const side=d==='L'?1:-1; if(jn==='sh'+(side>0?'L':'R')){ a=[35,85,0]; } else if(jn.startsWith('sh')) a=[30,20,0]; if(jn==='sp1') a[1]=-12*side; } }
  else if(st==='down'){ const d=rmPA('down',jn), c=rmPA('curl',jn); const w=rmCl(RM.curlW||0,0,1); a=[d[0]+(c[0]-d[0])*w,d[1]+(c[1]-d[1])*w,d[2]+(c[2]-d[2])*w];
    const side=j.C.side||0, ph=side>0?0:2.1, wr=RM.writhe||0;
    if(jn.startsWith('hip')) a[0]+=wr*28*Math.sin(RM.t*0.55+ph); else if(jn.startsWith('kn')) a[0]+=wr*40*Math.sin(RM.t*0.55+ph+0.7); else if(jn==='sp0') a[0]+=wr*8*Math.sin(RM.t*0.4); else if(jn==='neck') a[0]+=wr*12*Math.sin(RM.t*0.35+1); }
  else a=rmPA('collapse',jn).slice();
  return out?(out[0]=a[0],out[1]=a[1],out[2]=a[2],out):a; }
function rmStrengthNow(j){ if(!j.on||!j.C.att) return 0; const g=j.grp, st=RM.st; let s;
  if(st==='stand') s=RMSTR.stand[g]; else if(st==='fall') s=RMSTR.fall[g]*(RM.landed?0.55:1); else if(st==='down') s=RMSTR.down[g]*rmCl(RM.blood/70,0.2,1); else s=RMSTR.collapse[g]*RM.crumple;
  if(st!=='dead') s*=rmCl(RM.blood/55,0.3,1);
  if(g==='leg'&&j.C.side) s*=0.3+0.7*RM.legs[j.C.side>0?0:1];
  if((g==='arm'||g==='wrist')&&j.C.side&&RM.guard[j.C.side>0?0:1]) s*=0.22;
  s*=1-0.8*j.relax; return s*j.k; }
// ---- quadro a quadro: decide estado, poses, passos e quedas ----
function rmCtrl(dt){ const J=RMPH.J, st=RM.st; rmCom();
  RM.A=st==='stand'?Math.min(1,RM.A+dt*(RM.step?0.6:1.4)):0; RM.thrownT=Math.max(0,RM.thrownT-dt);
  RM.hurt=Math.max(RM.blood<60?0.45:RM.wounds.length?0.15:0,RM.hurt-dt*0.18);
  for(const j of J){ j.relax=Math.max(0,j.relax-dt*2.5); }
  // olhar o jogador quando calmo
  RM.look=null; if(st==='stand'&&typeof P!=='undefined'&&P&&P.pos){ const hd=RMPH.byName.head; const dx=P.pos.x-hd.x.x, dz=P.pos.z-hd.x.z; let a=Math.atan2(dx,dz)-RM.yaw; a=Math.atan2(Math.sin(a),Math.cos(a)); if(Math.abs(a)<2.2) RM.look={t:rmCl(a/RMD2R,-55,55),f:0}; }
  RM.pelT=null; if(st==='stand'){ rmBalance(dt); if(RM.st==='stand'){ const O=rmOrigin(), pel=RMPH.byName.pelvis, off=rmRotY(rmv(),pel.com.x,0,pel.com.z-RM.hurt*0.05,RM.yaw); RM.pelT={x:O.x+off.x,z:O.z+off.z}; } }
  else if(st==='fall'){ RM.fallT+=dt; const tors=RM.t-RM.groundT<0.15; if(tors&&!RM.landed){ RM.landed=true; const sp=Math.hypot(RM.comV.x,RM.comV.y,RM.comV.z); try{ if(typeof Snd!=='undefined'&&Snd.sample) Snd.sample('body_fall',{vol:rmCl(0.35+sp*0.25,0.3,1),x:RM.com.x,z:RM.com.z,range:30}); }catch(e){} }
    if(RM.landed&&RM.fallT>0.7&&Math.hypot(RM.comV.x,RM.comV.y,RM.comV.z)<0.6) RM.st='down'; }
  else if(st==='down'){ RM.writhe=rmCl((RM.blood-15)/50,0,1)*(0.6+0.4*Math.sin(RM.t*0.23)); RM.curlW=rmCl((90-RM.blood)/60,0,0.8)*(0.6+0.4*Math.sin(RM.t*0.17+1)); }
  else if(st==='dead'){ RM.deadT+=dt; RM.crumple=Math.max(0,RM.crumple-dt*1.5); }
  // alvo e força de cada músculo (a pose muda suave, sem tranco)
  const rate=st==='fall'?9:st==='stand'?7:3, k=1-Math.exp(-rate*dt), a=[0,0,0];
  for(const j of J){ rmPoseNow(j,a); rmPoseQ(j.tg,j,a[0],a[1],a[2]); qslerp(j.tq,j.tq,j.tg,k);
    j.kEff=rmStrengthNow(j); const g=j.grp; j.damp=!j.C.att?3.5:st==='stand'?(g==='arm'||g==='wrist'?6:16):st==='fall'?6.5:st==='down'?8:4.5; }
  rmGuardPick(); }
function rmBalance(dt){ const c=RM.com, cv=RM.comV; const hgt=Math.max(0.5,c.y); const k=Math.sqrt(hgt/9.81);
  const O=rmOrigin(); const off=rmRotY(rmv(),RM.comOff.x,0,RM.comOff.z,RM.yaw); const bx=O.x+off.x, bz=O.z+off.z;
  const ex=c.x+cv.x*k-bx, ez=c.z+cv.z*k-bz, e=Math.hypot(ex,ez); RM.capE=e;
  const ch=RMPH.byName.chest, up=qrot(rmv(),ch.q,rmv(0,1,0));
  const legBad=['footL','footR','shinL','shinR','thighL','thighR'].some(n=>!RMPH.byName[n].att);
  RM.steps=RM.steps.filter(t=>RM.t-t<1.6);
  if(legBad) return rmFall('perna'); if(e>0.85||up.y<0.64) return rmFall('equilíbrio'); if(RM.steps.length>=5) return rmFall('tropeço');
  if(Math.min(RM.legs[0],RM.legs[1])<0.4||RM.legs[0]+RM.legs[1]<1.1) return rmFall('perna'); if(RM.blood<35) return rmFall('sangue');
  // passo em andamento
  const S=RM.step; if(S){ S.s=Math.min(1,S.s+dt/S.dur); const w=S.s*S.s*(3-2*S.s), lift=Math.sin(Math.PI*S.s)*0.1;
    S.cx.x=S.x0.x+(S.x1.x-S.x0.x)*w; S.cx.z=S.x0.z+(S.x1.z-S.x0.z)*w; S.cx.y=RMFOOT.y+lift; let dy=S.y1-S.y0; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); S.cy=S.y0+dy*w;
    S.pitch=Math.sin(Math.PI*Math.min(1,S.s*1.25))*0.35*(1-S.s);   // tira o calcanhar primeiro e pousa reto
    if(S.s>=1){ RM.plant[S.f]={x:vcp(rmv(),S.x1),yaw:S.y1}; rmFootLock(S.f,true); RM.step=null; } return; }
  // calmo: vira devagar para o jogador
  if(RM.t-RM.lastHit>3&&RM.A>0.9&&typeof P!=='undefined'&&P&&P.pos){ const want=Math.atan2(P.pos.x-c.x,P.pos.z-c.z); let d=want-RM.yaw; d=Math.atan2(Math.sin(d),Math.cos(d)); if(Math.abs(d)>0.25) RM.yaw+=rmCl(d,-0.7*dt,0.7*dt); }
  // precisa dar passo? (ponto de captura fora do apoio, ou os pés ficaram tortos depois de virar)
  let ox=O.x, oz=O.z, urgent=false; if(e>0.1){ const L=Math.min(e*1.15,0.6); ox+=ex/e*L; oz+=ez/e*L; urgent=true; }
  let best=-1, bd=0, tgt=null; for(let fi=0;fi<2;fi++){ const p=RM.plant[fi]; if(!p) continue; const I=rmFootIdeal(ox,oz,RM.yaw,fi); let dy=I.yaw-p.yaw; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); const d=Math.hypot(I.x.x-p.x.x,I.x.z-p.x.z)+Math.abs(dy)*0.22; if(d>bd){ bd=d; best=fi; tgt=I; } }
  if(best>=0&&(urgent?bd>0.07:bd>0.17)){ const p=RM.plant[best]; RM.step={f:best,s:0,dur:urgent?rmCl(0.34-e*0.12,0.22,0.34):0.42,x0:vcp(rmv(),p.x),x1:tgt.x,y0:p.yaw,y1:tgt.yaw,cx:vcp(rmv(),p.x),cy:p.yaw,pitch:0}; rmFootLock(best,false); RM.steps.push(RM.t); } }
// mãos no ferimento: escolhe a ferida mais recente que a mão alcança (não no próprio braço)
function rmGuardPick(){ RM.guard=[null,null]; if(RM.st==='dead'||RM.st==='fall') return; const W=RM.wounds;
  for(const hi of [0,1]){ const side=hi?-1:1, hand=RMPH.byName[hi?'handR':'handL']; if(!hand.att) continue;
    for(let k=W.length-1;k>=0;k--){ const w=W[k]; if(w.stump||!w.b.att) continue; const p=w.b.part; if(p==='head'&&w.tag!=='neck') continue; if(p==='foot') continue; if((p==='arm'||p==='hand')&&w.b.side===side) continue;
      if(hi===1&&RM.guard[0]===w&&!(p==='belly'||p==='chest'||w.tag==='neck')) continue; RM.guard[hi]=w; break; } } }
// ---- dentro do subpasso: músculos, equilíbrio, pés, mãos ----
const RMCQ=rmq(), RMCV=rmv(), RMCR=rmv(), RMCR2=rmv();
function rmCtrlSub(h){ const J=RMPH.J, B=RMPH.byName, st=RM.st;
  for(let i=0;i<J.length;i++){ const j=J[i]; if(j.kEff>0.5) rmMuscle(j,j.kEff); }
  if(st==='stand'&&RM.A>0.01){ const pel=B.pelvis, A=RM.A;
    // tronco em pé (orientação da bacia) e peito acompanhando a pose da coluna
    rmYawQ(RMCQ,RM.yaw); qcj(RMLQ.b,pel.q); qmul(RMLQ.b,RMCQ,RMLQ.b); qtorv(RMCV,RMLQ.b); rmAngC(null,pel,RMCV.x,RMCV.y,RMCV.z,1/(2600*A));
    const ch=B.chest; qmul(RMLQ.c,RMCQ,J[0].tq); qmul(RMLQ.c,RMLQ.c,J[1].tq); qcj(RMLQ.b,ch.q); qmul(RMLQ.b,RMLQ.c,RMLQ.b); qtorv(RMCV,RMLQ.b); rmAngC(null,ch,RMCV.x,RMCV.y,RMCV.z,1/(700*A));
    // centro de massa em cima do apoio e altura do quadril (como as pernas fariam)
    RMCR.x=0; RMCR.y=0; RMCR.z=0; const hz=RM.hurt*0.05; if(RM.pelT) rmPosC(pel,RMCR,null,null,RM.pelT.x-pel.x.x,0,RM.pelT.z-pel.x.z,1/(1600*A));
    rmPosC(pel,RMCR,null,null,0,(RM.hipH-hz)-pel.x.y,0,1/(5200*A));
    // pés plantados (o que está no ar segue a trajetória do passo)
    for(let fi=0;fi<2;fi++){ const p=RM.plant[fi]; if(!p) continue; const ft=B[fi?'footR':'footL']; if(!ft.att) continue; const S=RM.step&&RM.step.f===fi?RM.step:null;
      if(!S){ if(ft.kin){ vcp(ft.x,p.x); rmYawQ(ft.q,p.yaw); } continue; }
      rmPosC(ft,RMCR,null,null,S.cx.x-ft.x.x,S.cx.y-ft.x.y,S.cx.z-ft.x.z,1/9000);
      rmYawQ(RMCQ,S.cy); if(S.pitch){ qrv(RMLQ.t,-S.pitch,0,0); qmul(RMCQ,RMCQ,RMLQ.t); } qcj(RMLQ.b,ft.q); qmul(RMLQ.b,RMCQ,RMLQ.b); qtorv(RMCV,RMLQ.b); rmAngC(null,ft,RMCV.x,RMCV.y,RMCV.z,1/400); } }
  // mão no ferimento (força interna: a mão puxa e o corpo é puxado de volta)
  if(st==='stand'||st==='down'){ const K=st==='stand'?320:140*rmCl(RM.blood/60,0.3,1);
    for(let hi=0;hi<2;hi++){ const w=RM.guard[hi]; if(!w) continue; const hand=B[hi?'handR':'handL'], wb=w.b; const side=hi?-1:1;
      RMCR.x=-side*0.018; RMCR.y=-0.01; RMCR.z=0.0; qrot(RMCR,hand.q,RMCR); qrot(RMCR2,wb.q,w.lp); qrot(RMCV,wb.q,w.ln);
      RMCR2.x+=RMCV.x*0.035; RMCR2.y+=RMCV.y*0.035; RMCR2.z+=RMCV.z*0.035;
      rmPosC(hand,RMCR,wb,RMCR2,(wb.x.x+RMCR2.x)-(hand.x.x+RMCR.x),(wb.x.y+RMCR2.y)-(hand.x.y+RMCR.y),(wb.x.z+RMCR2.z)-(hand.x.z+RMCR.z),1/K); } } }
const RMARMS=['uarmL','farmL','handL','uarmR','farmR','handR'];
function rmCtrlVel(h){ if(RM.st==='stand'||RM.st==='down'){ // tônus muscular: braço vivo não fica balançando sozinho
    const ch=RMPH.byName.chest, k=Math.min(1,(RM.st==='stand'?3.5:1.5)*h); for(const n of RMARMS){ const b=RMPH.byName[n]; if(!b.att) continue; b.v.x+=(ch.v.x-b.v.x)*k; b.v.y+=(ch.v.y-b.v.y)*k; b.v.z+=(ch.v.z-b.v.z)*k; } }
  if(RM.st!=='stand'||RM.A<0.01) return; const pel=RMPH.byName.pelvis, ch=RMPH.byName.chest, A=RM.A;
  const kv=1-Math.min(1,5*h*A), kw=1-Math.min(1,9*h*A); pel.v.x*=kv; pel.v.z*=kv; pel.w.x*=kw; pel.w.y*=kw; pel.w.z*=kw; const kc=1-Math.min(1,4*h*A); ch.w.x*=kc; ch.w.y*=kc; ch.w.z*=kc; }
// reconecta quem ainda está preso à bacia (depois de arrancar uma parte)
function rmAttach(){ for(const b of RMPH.B) b.att=false; const st=[RMPH.byName.pelvis]; st[0].att=true; while(st.length){ const b=st.pop(); for(const j of RMPH.J){ if(!j.on) continue; const o=j.P===b?j.C:j.C===b?j.P:null; if(o&&!o.att){ o.att=true; st.push(o); } } } }
// passo de tempo inteiro
function rmPhysStep(dt){ const h=RMPH.h; RM.acc+=Math.min(dt,0.05); let n=0; RM._O=null;
  if(RM.st==='stand') RM._O=rmOrigin();
  while(RM.acc>=h&&n<48){ rmSubstep(h); RM.acc-=h; n++; } if(n>=48) RM.acc=0; return n; }
// coice físico do tiro: impulso no ponto exato (gira e empurra), parte do corpo cede, equilíbrio balança
const RMKB={pistol:15,revolver:40,smg:11,rifle:36,lmg:21,shotgun:36,sniper:170,ray:0};
function rmKnock(b,hp,dir,J,cls){ if(J<=0) return; RM.sleep=false; RM.sleepT=0;
  const up=cls==='shotgun'?0.24:cls==='sniper'?0.2:0.05; let dx=dir.x, dy=dir.y+up, dz=dir.z; const l=Math.hypot(dx,dy,dz)||1; dx/=l; dy/=l; dz/=l;
  // parte vai para o corpo inteiro (empurra), o resto no ponto atingido (gira a parte)
  const whole=cls==='shotgun'?0.5:cls==='sniper'?0.38:0.12; let M=0; for(const o of RMPH.B) if(o.att===b.att) M+=o.m;
  for(const o of RMPH.B){ if(o.att!==b.att||o.kin) continue; const dv=J*whole/M; o.v.x+=dx*dv; o.v.y+=dy*dv; o.v.z+=dz*dv; }
  const r=rmv(hp.x-b.x.x,hp.y-b.x.y,hp.z-b.x.z); if(!b.kin) rmVelImp(b,r,dx*J*(1-whole),dy*J*(1-whole),dz*J*(1-whole));
  // músculos perto do tiro cedem
  for(const j of RMPH.J) if(j.P===b||j.C===b) j.relax=Math.min(1,j.relax+0.35+J/40);
  if(RM.shot!==RM._shotId){ RM.shot=RM._shotId; RM.shotJ=0; } RM.shotJ+=J; RM.lastHit=RM.t;
  if(RM.st==='stand'){ RM.A=Math.min(RM.A,1-rmCl(J/45,0.2,0.85)); if(b.part==='chest'||b.part==='belly'||b.part==='pelvis') RM.hurt=Math.min(1,RM.hurt+0.25+J/90);
    if(RM.shotJ>=70){ RM.thrownT=cls==='shotgun'||cls==='sniper'?0.45:0.25; rmFall('impacto'); } }
  else if(RM.st==='down'||RM.st==='fall'){ RM.hurt=Math.min(1,RM.hurt+0.2); } }
// reset puro (sem gráficos) — também usado pelo jogo
function rmPhysReset(x0,z0,yaw){ const B=RMPH.B, J=RMPH.J; const q=rmYawQ(rmq(),yaw);
  for(const b of B){ const p=rmRotY(rmv(),b.com.x,b.com.y,b.com.z,yaw); b.x.x=x0+p.x; b.x.y=p.y; b.x.z=z0+p.z; qcp(b.q,q); b.v.x=b.v.y=b.v.z=0; b.w.x=b.w.y=b.w.z=0; vcp(b.xp,b.x); qcp(b.qp,b.q); b.att=true; b.kin=false; b.im=1/b.m; vcp(b.iI,b.iI0); for(const s of b.shapes) s.r=s.r0; }
  for(const j of J){ j.on=true; j.tq.x=j.tq.y=j.tq.z=0; j.tq.w=1; qcp(j.tg,j.tq); j.relax=0; j.kEff=0; }
  // centro de massa em pé relativo à origem (entre os pés)
  let m=0,cx=0,cz=0; for(const b of B){ m+=b.m; cx+=b.com.x*b.m; cz+=b.com.z*b.m; } RM.comOff.x=cx/m; RM.comOff.z=cz/m;
  Object.assign(RM,{st:'stand',blood:100,acc:0,A:1,hurt:0,yaw:yaw,yaw0:yaw,step:null,steps:[],fallT:0,landed:false,deadT:0,crumple:0,thrownT:0,legs:[1,1],
    wounds:[],acc2:{},shot:-1,shotJ:0,lastHit:-9,headGone:false,openB:false,openC:false,gut:null,guard:[null,null],sleep:false,sleepT:0,groundT:-9,why:'',hipH:0.943});
  rmCom(); rmPlant(0); rmPlant(1); }
/* ---------- visual: cada osso é um grupo (centro de massa + rotação) com a malha da roupa/pele ---------- */
const RMV=new THREE.Vector3(), RMV2=new THREE.Vector3(), RMO=new THREE.Object3D(), RMY=new THREE.Vector3(0,1,0);
function rmMat(c,o){ return new THREE.MeshPhongMaterial(Object.assign({color:c,shininess:12},o||{})); }
const RMMAT={};
function rmMats(){ if(RMMAT.skin) return RMMAT; Object.assign(RMMAT,{skin:rmMat(0xd9a982,{emissive:0x2a1e16}),shirt:rmMat(0x8fb3cf,{emissive:0x1a222a}),jeans:rmMat(0x3a4d6e,{emissive:0x0e1420}),
  shoe:rmMat(0x3a2a1e,{shininess:30}),sole:rmMat(0x1c1612),sock:rmMat(0xd8d4cc),belt:rmMat(0x3a2414,{shininess:40}),buckle:rmMat(0xb8a878,{shininess:90,specular:0x887755}),hair:rmMat(0x2a1d14),
  eye:rmMat(0x15100c,{shininess:80}),white:rmMat(0xeeeae0,{shininess:60}),lip:rmMat(0xa8645a),brow:rmMat(0x2a1d14),nail:rmMat(0xe8c0a8),
  flesh:rmMat(0x8a1414,{shininess:60}),meat:rmMat(0xa83030,{shininess:70}),cav:new THREE.MeshPhongMaterial({color:0x4a0808,shininess:50,side:THREE.BackSide}),bone:rmMat(0xe9e0cf,{shininess:30}),
  gut:rmMat(0xc27a74,{shininess:90,specular:0x664444}),liver:rmMat(0x5a1212,{shininess:80}),stom:rmMat(0xc48a86,{shininess:80}),lung:rmMat(0xd29a9a,{shininess:60}),heart:rmMat(0x8a0f12,{shininess:90}),
  brain:rmMat(0xd8a6a0,{shininess:60}),wound:new THREE.MeshBasicMaterial({color:0x2a0000}),stain:new THREE.MeshBasicMaterial({color:0x6a0606,transparent:true,opacity:0.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}),
  drop:new THREE.MeshBasicMaterial({color:0x8a0000}),splat:new THREE.MeshBasicMaterial({color:0x520202,transparent:true,opacity:0.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}),
  pool:new THREE.MeshLambertMaterial({color:0x4a0303,transparent:true,opacity:0.88,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4})}); return RMMAT; }
// osso com perfil de revolução [raio, fração do comprimento] entre dois pontos do esqueleto
function rmLimb(a,b,prof,mat,seg){ const L=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z); const g=new THREE.LatheGeometry(prof.map(([r,t])=>new THREE.Vector2(Math.max(1e-4,r),t*L)),seg||14); g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat); m.quaternion.setFromUnitVectors(RMY,RMV.set(b.x-a.x,b.y-a.y,b.z-a.z).normalize()); m.position.set(a.x,a.y,a.z); return m; }
function rmShell(prof,mat,zs,cz,phiS,phiL){ const g=new THREE.LatheGeometry(prof.map(([r,y])=>new THREE.Vector2(Math.max(1e-4,r),y)),26,phiS||0,phiL||Math.PI*2); g.scale(1,1,zs); g.translate(0,0,cz); g.computeVertexNormals(); return new THREE.Mesh(g,mat); }
function rmBall(r,mat,p,sx,sy,sz){ const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat); m.scale.set(sx||1,sy||1,sz||1); m.position.set(p.x,p.y,p.z); return m; }
function rmBox(w,h,d,mat,p){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(p.x,p.y,p.z); return m; }
// coloca a malha (feita na pose em pé) no grupo do osso (origem = centro de massa)
function rmPut(b,m){ m.position.x-=b.com.x; m.position.y-=b.com.y; m.position.z-=b.com.z; b.g.add(m); return m; }
function rmBuildVisuals(){ const M=rmMats(), N=RMPH.byName, P=rmv;
  for(const b of RMPH.B){ b.g=new THREE.Group(); RM.g.add(b.g); }
  // bacia: jeans, cinto e fivela
  rmPut(N.pelvis,rmShell([[1e-4,0.842],[0.085,0.848],[0.142,0.872],[0.162,0.922],[0.158,0.972],[0.153,1.004],[0.151,1.012]],M.jeans,0.68,-0.01));
  { const t=new THREE.Mesh(new THREE.TorusGeometry(0.154,0.011,6,30),M.belt); t.rotation.x=Math.PI/2; t.scale.set(1,0.69,1); t.position.set(0,0.998,-0.01); rmPut(N.pelvis,t); rmPut(N.pelvis,rmBox(0.05,0.03,0.012,M.buckle,P(0,0.998,0.097))); }
  // abdômen: camisa (frente sai quando a barriga abre), cavidade e órgãos
  { const prof=[[0.153,0.99],[0.151,1.03],[0.147,1.09],[0.15,1.15],[0.157,1.205]]; const b=N.abdomen;
    rmPut(b,rmShell(prof,M.shirt,0.64,-0.012,Math.PI/2,Math.PI)); RM.bellyFront=rmPut(b,rmShell(prof,M.shirt,0.64,-0.012,-Math.PI/2,Math.PI));
    RM.bellyCav=rmPut(b,rmShell(prof.map(([r,y])=>[r*0.93,y]),M.cav,0.64,-0.012)); RM.bellyCav.visible=false;
    const org=new THREE.Group(); RM.bellyOrg=org; org.visible=false; b.g.add(org); const o=(m)=>{ m.position.x-=b.com.x; m.position.y-=b.com.y; m.position.z-=b.com.z; org.add(m); };
    o(rmBall(0.07,M.liver,P(-0.05,1.165,0.025),1.3,0.6,0.7)); o(rmBall(0.05,M.stom,P(0.06,1.16,0.035),1.2,0.9,0.8));
    const pts=[]; for(let row=0;row<6;row++){ const y=1.13-row*0.025; for(let k=0;k<=8;k++){ const u=row%2?1-k/8:k/8; pts.push(new THREE.Vector3((u-0.5)*0.2,y+Math.sin(k*1.7+row)*0.008,0.02+Math.sin(k*2.3+row*1.3)*0.018)); } }
    o(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),160,0.017,7,false),M.gut)); }
  // tórax: camisa com gola, cavidade, costelas, pulmões e coração
  { const prof=[[0.157,1.185],[0.168,1.25],[0.178,1.33],[0.176,1.40],[0.156,1.44],[0.105,1.466],[0.062,1.474],[1e-4,1.478]]; const b=N.chest;
    rmPut(b,rmShell(prof,M.shirt,0.62,-0.02,Math.PI/2,Math.PI)); RM.chestFront=rmPut(b,rmShell(prof,M.shirt,0.62,-0.02,-Math.PI/2,Math.PI));
    { const t=new THREE.Mesh(new THREE.TorusGeometry(0.058,0.009,6,20),M.shirt); t.rotation.x=Math.PI/2; t.scale.set(1,0.85,1); t.position.set(0,1.468,-0.022); rmPut(b,t); }
    RM.chestCav=rmPut(b,rmShell(prof.map(([r,y])=>[r*0.93,y]),M.cav,0.62,-0.02)); RM.chestCav.visible=false;
    const org=new THREE.Group(); RM.chestOrg=org; org.visible=false; b.g.add(org); const o=(m)=>{ m.position.x-=b.com.x; m.position.y-=b.com.y; m.position.z-=b.com.z; org.add(m); return m; };
    for(const sx of [-1,1]) o(rmBall(0.066,M.lung,P(sx*0.075,1.345,-0.025),1,1.9,0.85));
    RM.heart=o(rmBall(0.046,M.heart,P(0.028,1.305,0.02),1,1.25,0.95)); RM.heart.rotation.z=-0.4;
    for(let i=0;i<6;i++){ const y=1.225+i*0.045, r=0.165-Math.abs(i-2.5)*0.006; const rb=new THREE.Mesh(new THREE.TorusGeometry(r,0.007,5,16,Math.PI),M.bone); rb.rotation.x=Math.PI/2; rb.scale.set(1,0.62,1); rb.position.set(0,y,-0.02); o(rb); } }
  // cabeça e pescoço
  { const b=N.head; rmPut(b,rmLimb(rmSk('neck'),P(0,1.588,-0.006),[[0.053,0],[0.051,0.5],[0.049,1]],M.skin));
    const hg=new THREE.Group(); RM.headG=hg; const H=rmSk('head'); hg.position.set(H.x-b.com.x,H.y-b.com.y,H.z-b.com.z); b.g.add(hg); const a=m=>{ hg.add(m); return m; };
    a(rmBall(0.1,M.skin,P(0,0,0),0.92,1.12,1)); const hair=a(rmBall(0.104,M.hair,P(0,0.03,-0.012),0.95,0.9,1.02));
    a(rmBall(0.07,M.skin,P(0,-0.058,0.028),1.05,0.8,1)); a(rmBall(0.03,M.skin,P(0,-0.095,0.052),1.2,0.7,0.8));
    const nose=new THREE.Mesh(new THREE.ConeGeometry(0.016,0.042,8),M.skin); nose.rotation.x=Math.PI/2; nose.position.set(0,-0.005,0.104); a(nose);
    a(rmBox(0.036,0.006,0.01,M.lip,P(0,-0.052,0.088)));
    for(const sx of [-1,1]){ a(rmBall(0.013,M.white,P(sx*0.035,0.02,0.085),1,0.8,0.6)); a(rmBall(0.0065,M.eye,P(sx*0.035,0.02,0.093))); const br=a(rmBox(0.028,0.006,0.008,M.brow,P(sx*0.036,0.043,0.09))); br.rotation.z=-sx*0.12;
      a(rmBall(0.025,M.skin,P(sx*0.093,0,0),0.45,1,0.8)); } }
  // braços, mãos, pernas e pés
  for(const s of [1,-1]){ const S=s>0?'L':'R', k=n=>rmSk(n,s), sh=k('sh'), el=k('el'), wr=k('wr'), fi=k('fing'), hp=k('hip'), kn=k('kn'), an=k('ank');
    const ua=N['uarm'+S], fa=N['farm'+S], ha=N['hand'+S], th=N['thigh'+S], sn=N['shin'+S], ft=N['foot'+S];
    rmPut(ua,rmLimb(sh,el,[[0.044,0],[0.049,0.32],[0.046,0.62],[0.04,1]],M.skin)); rmPut(ua,rmLimb(sh,rmLerp3(sh,el,0.46),[[0.062,0],[0.059,0.5],[0.055,1]],M.shirt)); rmPut(ua,rmBall(0.063,M.shirt,sh,1,0.95,1));
    rmPut(fa,rmLimb(el,wr,[[0.04,0],[0.042,0.25],[0.035,0.7],[0.03,1]],M.skin)); rmPut(fa,rmBall(0.041,M.skin,el));
    { rmPut(ha,rmBall(0.03,M.skin,wr,1,0.9,1.1)); const d=rmDir3(wr,fi); const g=new THREE.Group(); g.position.set(wr.x,wr.y,wr.z); g.quaternion.setFromUnitVectors(RMY,RMV.set(-d.x,-d.y,-d.z));
      // a mão aponta para -y do grupo: palma para o centro do corpo, polegar para a frente
      const palm=new THREE.Mesh(new THREE.BoxGeometry(0.026,0.092,0.074),M.skin); palm.position.set(0,-0.052,0.004); g.add(palm);
      for(let i=0;i<4;i++){ const fz=-0.026+i*0.0175, fl=[0.07,0.078,0.074,0.062][i]; const f=new THREE.Mesh(new THREE.BoxGeometry(0.02,fl,0.016),M.skin); f.position.set(-s*0.006,-0.098-fl/2+0.006,fz); f.rotation.z=-s*0.28; g.add(f); }
      const tb=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.055,0.02),M.skin); tb.position.set(-s*0.012,-0.04,0.045); tb.rotation.x=0.5; g.add(tb); rmPut(ha,g); }
    rmPut(th,rmLimb(hp,kn,[[0.082,0],[0.085,0.25],[0.072,0.65],[0.058,1]],M.jeans)); rmPut(th,rmBall(0.086,M.jeans,hp));
    rmPut(sn,rmLimb(kn,an,[[0.058,0],[0.061,0.3],[0.05,0.7],[0.046,1]],M.jeans)); rmPut(sn,rmBall(0.06,M.jeans,kn));
    { rmPut(ft,rmBall(0.045,M.sock,an,1,0.9,1)); const c=P(0.105*s,0.042,0.06); const shoe=rmBox(0.096,0.068,0.215,M.shoe,c); rmPut(ft,shoe); rmPut(ft,rmBall(0.049,M.shoe,P(0.11*s,0.04,0.165),1.0,0.72,1.0));
      rmPut(ft,rmBall(0.048,M.shoe,P(0.1*s,0.045,-0.045),1.0,0.8,0.9)); rmPut(ft,rmBox(0.102,0.014,0.27,M.sole,P(0.105*s,0.007,0.06))); } }
  // gotas e manchas (instanciadas)
  const root=MAPG.fun; RM.dropIM=new THREE.InstancedMesh(new THREE.SphereGeometry(1,5,4),RMMAT.drop,1400); RM.dropIM.count=0; RM.dropIM.frustumCulled=false; root.add(RM.dropIM);
  RM.splIM=new THREE.InstancedMesh(new THREE.CircleGeometry(1,11),RMMAT.splat,700); RM.splIM.count=0; RM.splIM.frustumCulled=false; root.add(RM.splIM);
  for(const b of RMPH.B) b.g.traverse(o=>{ if(o.isMesh){ o.castShadow=false; o.frustumCulled=false; } }); }
function rmDraw(){ for(const b of RMPH.B){ b.g.position.set(b.x.x,b.x.y,b.x.z); b.g.quaternion.set(b.q.x,b.q.y,b.q.z,b.q.w); }
  if(RM.heart&&RM.chestOrg.visible){ const bt=RM.st==='dead'?0:Math.pow(Math.max(0,Math.sin(RM.t*Math.PI*2*(1.1+(100-RM.blood)/60))),4); RM.heart.scale.set(1+bt*0.12,1.25*(1+bt*0.12),0.95*(1+bt*0.12)); }
  const D=RM.drops, IM=RM.dropIM, n=Math.min(D.length,1400); for(let i=0;i<n;i++){ const d=D[i]; const sp=Math.hypot(d.vx,d.vy,d.vz); RMO.position.set(d.x,d.y,d.z);
    if(sp>0.5){ RMV.set(d.vx/sp,d.vy/sp,d.vz/sp); RMO.quaternion.setFromUnitVectors(RMY,RMV); } else RMO.quaternion.identity(); RMO.scale.set(d.r,d.r*(1+Math.min(3,sp*0.35)),d.r); RMO.updateMatrix(); IM.setMatrixAt(i,RMO.matrix); }
  IM.count=n; IM.instanceMatrix.needsUpdate=true;
  if(RM.gut){ const Nn=RM.gut.nodes, Ms=RM.gut.meshes; for(let i=0;i<Nn.length-1;i++){ const A=Nn[i], B=Nn[i+1]; const m=Ms[i*2], k=Ms[i*2+1]; RMV.set(B.x-A.x,B.y-A.y,B.z-A.z); const L=RMV.length()||1e-4;
    m.position.set((A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2); m.quaternion.setFromUnitVectors(RMY,RMV.divideScalar(L)); m.scale.set(1,L,1); k.position.set(B.x,B.y,B.z); } } }
/* ---------- tiros, feridas, sangue e gore ---------- */
const RMZ=new THREE.Vector3(0,0,1);
function rmWPos(w,o){ qrot(o,w.b.q,w.lp); o.x+=w.b.x.x; o.y+=w.b.x.y; o.z+=w.b.x.z; return o; }
function rmMark(b,lp,ln,r,mat,off){ const m=new THREE.Mesh(new THREE.CircleGeometry(r,12),mat); m.position.set(lp.x+ln.x*off,lp.y+ln.y*off,lp.z+ln.z*off); m.quaternion.setFromUnitVectors(RMZ,RMV.set(ln.x,ln.y,ln.z)); b.g.add(m); RM.marks.push(m); return m; }
function rmAddWound(b,tag,hp,n,dmg,artery){ const lp=qroti(rmv(),b.q,rmv(hp.x-b.x.x,hp.y-b.x.y,hp.z-b.x.z)), ln=qroti(rmv(),b.q,n);
  const w={b,tag,lp,ln,rate:rmCl(dmg/40,0.6,4)*(artery?2.6:1),artery,age:0,acc:0,stump:false};
  RM.wounds.push(w); if(RM.wounds.length>40) RM.wounds.shift(); const M=rmMats();
  rmMark(b,lp,ln,rmCl(0.008+dmg/9000,0.008,0.03),M.wound,0.004); w.stain=rmMark(b,lp,ln,0.03,M.stain,0.002); return w; }
function rmSpray(x,y,z,dx,dy,dz,n,spd,spread,size){ for(let i=0;i<n;i++){ if(RM.drops.length>=1400) RM.drops.shift();
    const v=spd*(0.5+Math.random()*0.7); RM.drops.push({x,y,z,vx:dx*v+(Math.random()-0.5)*spread,vy:dy*v+(Math.random()-0.5)*spread+0.4*Math.random(),vz:dz*v+(Math.random()-0.5)*spread,r:(size||0.012)*(0.6+Math.random()*0.9)}); } }
// raio contra as cápsulas do corpo
function rmRayCap(o,d,A,B,r,maxT){ const ux=B.x-A.x, uy=B.y-A.y, uz=B.z-A.z; const wx=o.x-A.x, wy=o.y-A.y, wz=o.z-A.z;
  const b=d.x*ux+d.y*uy+d.z*uz, c=ux*ux+uy*uy+uz*uz, dd=d.x*wx+d.y*wy+d.z*wz, e=ux*wx+uy*wy+uz*wz; const den=c-b*b;
  let tc=den>1e-9?(e-b*dd)/den:0; tc=rmCl(tc,0,1); let sc=b*tc-dd; if(sc<0) sc=0;
  const qx=wx+d.x*sc-ux*tc, qy=wy+d.y*sc-uy*tc, qz=wz+d.z*sc-uz*tc; const d2=qx*qx+qy*qy+qz*qz; if(d2>r*r) return -1;
  const t=sc-Math.sqrt(r*r-d2); return t<0||t>maxT?-1:t; }
function rmRay(o,d,maxT){ let best=null; const a=rmv(), bb=rmv();
  for(const b of RMPH.B){ const ox=b.x.x-o.x, oy=b.x.y-o.y, oz=b.x.z-o.z, t0=ox*d.x+oy*d.y+oz*d.z; if(t0<-b.br||t0>maxT+b.br) continue; const px=ox-d.x*t0, py=oy-d.y*t0, pz=oz-d.z*t0; if(px*px+py*py+pz*pz>(b.br+0.03)*(b.br+0.03)) continue;
    for(const s of b.shapes){ if(s.r<0.01) continue; qrot(a,b.q,s.a); a.x+=b.x.x; a.y+=b.x.y; a.z+=b.x.z; if(s.sph) vcp(bb,a); else { qrot(bb,b.q,s.b); bb.x+=b.x.x; bb.y+=b.x.y; bb.z+=b.x.z; }
      const t=rmRayCap(o,d,a,bb,s.r,best?best.t:maxT); if(t>=0) best={b,s,t,A:vcp(rmv(),a),B:vcp(rmv(),bb)}; } }
  return best; }
// onde corta: a junta mais perto do ponto atingido
const RMSEV={uarm:['sh','el'],farm:['el','wr'],hand:['wr','wr'],thigh:['hip','kn'],shin:['kn','an'],foot:['an','an']};
function rmHitBullet(h,o,d,dmg,wid,base){ const b=h.b, s=h.s, tag=s.tag; const hp=rmv(o.x+d.x*h.t,o.y+d.y*h.t,o.z+d.z*h.t);
  const ux=h.B.x-h.A.x, uy=h.B.y-h.A.y, uz=h.B.z-h.A.z, L2=ux*ux+uy*uy+uz*uz; const tc=L2>1e-9?rmCl(((hp.x-h.A.x)*ux+(hp.y-h.A.y)*uy+(hp.z-h.A.z)*uz)/L2,0,1):0;
  const n=rmv(hp.x-(h.A.x+ux*tc),hp.y-(h.A.y+uy*tc),hp.z-(h.A.z+uz*tc)); const nl=vlen(n); if(nl<1e-6){ n.x=-d.x; n.y=-d.y; n.z=-d.z; } else { n.x/=nl; n.y/=nl; n.z/=nl; }
  RM._shotId=typeof NET!=='undefined'?NET.fs:(RM._shotId||0)+1; if(RM.dshot!==RM._shotId){ RM.dshot=RM._shotId; RM.dacc={}; }
  const key=b.name+':'+tag; RM.dacc[key]=(RM.dacc[key]||0)+dmg; b.tot=(b.tot||0)+dmg; const acc=RM.dacc[key];
  // coice
  const cls=(typeof WEAPONS!=='undefined'&&WEAPONS[wid]&&WEAPONS[wid].snd)||'rifle'; const J=(RMKB[cls]!=null?RMKB[cls]:20)*rmCl(dmg/(base||dmg),0.25,1.3); rmKnock(b,hp,d,J,cls);
  // ferida e sangue (entrada volta para quem atirou; saída sai pelas costas nos tiros fortes)
  const sd=b.side>0?'L':'R', part=b.part;
  const artery=tag==='neck'||(tag==='thigh'&&tc<0.45&&Math.random()<0.6)||(tag==='uarm'&&tc<0.35&&Math.random()<0.4);
  const w=rmAddWound(b,tag,hp,n,dmg,artery);
  rmSpray(hp.x,hp.y,hp.z,n.x-d.x*0.5,n.y-d.y*0.5,n.z-d.z*0.5,Math.round(rmCl(dmg/6,8,40)),1.6,0.8,0.011);
  if(dmg>=100){ const ex=rmv(hp.x+d.x*0.2,hp.y+d.y*0.2,hp.z+d.z*0.2); rmSpray(ex.x,ex.y,ex.z,d.x,d.y,d.z,Math.round(rmCl(dmg/8,12,60)),3.2,1.2,0.013); }
  try{ Snd.flesh(hp.x,hp.z); }catch(e){}
  if(RM.st==='dead'){ RM.sleep=false; RM.sleepT=0; }
  // dano: sangue, perna, órgãos vitais
  RM.blood-=dmg*0.045*(tag==='pelvis'?1.3:1);
  if(part==='leg'||part==='foot'){ const i=b.side>0?0:1; RM.legs[i]=Math.max(0,RM.legs[i]-dmg/210); } if(tag==='pelvis'){ RM.legs[0]=Math.max(0,RM.legs[0]-dmg/500); RM.legs[1]=Math.max(0,RM.legs[1]-dmg/500); }
  // gore
  if(tag==='head'){ if((acc>=240||b.tot>=520)&&!RM.headGone) rmHeadBoom(d); rmKill(); }
  else if(tag==='neck'){ w.rate*=2.2; if(acc>=300) rmSever('neck',d); else if(dmg>=100) rmKill(); }
  else if(RMSEV[tag]){ const lim=tag==='hand'||tag==='foot'?160:part==='leg'?300:260, tot=tag==='hand'||tag==='foot'?500:part==='leg'?1000:900;
    if(acc>=lim||b.tot>=tot) rmSever(RMSEV[tag][tc<0.5?0:1]+sd,d); }
  else if(tag==='belly'){ if((acc>=300||b.tot>=420)&&!RM.openB) rmOpenBelly(d); }
  else if(tag==='chest'){ if((acc>=340||b.tot>=520)&&!RM.openC) rmOpenChest(d);
    const hl=rmv(0.028-b.com.x,1.305-b.com.y,0.02-b.com.z); if(w.lp.x>0.005&&Math.hypot(w.lp.x-hl.x,w.lp.y-hl.y,(w.lp.z-hl.z)*0.4)<0.032){ RM.blood=Math.min(RM.blood,40); w.rate*=3.5; w.artery=true; RM.hurt=1; } }
  if(RM.blood<=0) rmKill();
  try{ hitmarker(RM.st==='dead',tag==='head'); }catch(e){} }
function rmBlast(p,dmg,rad){ if(!RM.on) return; const R=rad*2.2; let hit=0;
  for(const b of RMPH.B){ const d=Math.hypot(b.x.x-p.x,b.x.y-p.y,b.x.z-p.z); if(d<R) hit=Math.max(hit,dmg*(1-d/R)); } if(hit<=0) return;
  RM.sleep=false; RM.sleepT=0; if(RM.st==='stand'&&hit>30){ RM.thrownT=0.4; rmFall('explosão'); }
  for(const b of RMPH.B){ if(b.kin) continue; let dx=b.x.x-p.x, dy=b.x.y-p.y+0.5, dz=b.x.z-p.z; const d=Math.hypot(b.x.x-p.x,b.x.y-p.y,b.x.z-p.z); if(d>=R) continue; const l=Math.hypot(dx,dy,dz)||1; const dv=Math.min(7,dmg*0.006*(1-d/R));
    b.v.x+=dx/l*dv; b.v.y+=dy/l*dv; b.v.z+=dz/l*dv; b.w.x+=(Math.random()-0.5)*dv*2; b.w.y+=(Math.random()-0.5)*dv*2; b.w.z+=(Math.random()-0.5)*dv*2; }
  RM.blood-=hit*0.06; RM.lastHit=RM.t;
  if(hit>260){ const c=RM.com, dir=rmv(c.x-p.x,0.6,c.z-p.z); const l=vlen(dir); dir.x/=l; dir.y/=l; dir.z/=l; const keys=['shL','shR','elL','elR','hipL','hipR','knL','knR','wrL','wrR','anL','anR']; const k=hit>700?3:hit>450?2:1;
    for(let i=0;i<k;i++) rmSever(keys[(Math.random()*keys.length)|0],dir); if(hit>500&&!RM.openB) rmOpenBelly(dir); }
  if(RM.blood<=0) rmKill(); }
function rmStump(b,lp,dir,big){ const M=rmMats(); const g=new THREE.Group(); g.add(rmBall(big?0.058:0.043,M.flesh,rmv(0,0,0),1,0.42,1)); g.add(rmBall(big?0.05:0.036,M.meat,rmv(0,0.008,0),1,0.3,1));
  const bn=new THREE.Mesh(new THREE.CylinderGeometry(0.011,0.013,0.05,8),M.bone); bn.position.y=0.02; g.add(bn);
  g.position.set(lp.x,lp.y,lp.z); g.quaternion.setFromUnitVectors(RMY,RMV.set(dir.x,dir.y,dir.z).normalize()); b.g.add(g); RM.marks.push(g); return g; }
function rmSever(jn,dir){ const j=RMPH.byName['j_'+jn]; if(!j||!j.on) return; const P=j.P, C=j.C;
  if(C.kin) rmFootLock(C.side>0?0:1,false); j.on=false; rmAttach(); RM.sleep=false; RM.sleepT=0;
  const at=qrot(rmv(),P.q,j.rp); at.x+=P.x.x; at.y+=P.x.y; at.z+=P.x.z;
  const big=jn==='neck'||jn.startsWith('hip')||jn.startsWith('sh');
  rmStump(P,j.rp,j.d,big); rmStump(C,j.rc,rmv(-j.d.x,-j.d.y,-j.d.z),false);
  RM.wounds.push({b:P,tag:'stump',lp:vcp(rmv(),j.rp),ln:vcp(rmv(),j.d),rate:big?5.5:3.5,artery:true,age:0,acc:0,stump:true});
  RM.wounds.push({b:C,tag:'stump',lp:vcp(rmv(),j.rc),ln:rmv(-j.d.x,-j.d.y,-j.d.z),rate:2.2,artery:true,age:0,acc:0,stump:true});
  for(const b of RMPH.B) if(!b.att&&!b.kin){ b.v.x+=dir.x*1.5; b.v.y+=0.8+dir.y; b.v.z+=dir.z*1.5; }
  rmSpray(at.x,at.y,at.z,dir.x,0.6,dir.z,90,3,1.8,0.014);
  RM.blood-=jn==='neck'?100:big?22:12; if(jn==='neck') rmKill(); else if(RM.st==='stand') rmFall('membro');
  try{ Snd.flesh(at.x,at.z); Snd.flesh(at.x,at.z); }catch(e){} }
function rmGib(x,y,z,mat,r,v){ const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,0),mat); m.position.set(x,y,z); m.rotation.set(Math.random()*6,Math.random()*6,0); RM.dyn.add(m);
  RM.gibs.push({m,vx:v.x,vy:v.y,vz:v.z,r,rest:false,spin:(Math.random()-0.5)*14}); if(RM.gibs.length>90){ const g=RM.gibs.shift(); RM.dyn.remove(g.m); } }
function rmHeadBoom(dir){ const hb=RMPH.byName.head; RM.headGone=true; RM.headG.visible=false; hb.shapes[0].r=0.001; const H=qrot(rmv(),hb.q,rmv(0,0.035,0.01)); H.x+=hb.x.x; H.y+=hb.x.y; H.z+=hb.x.z; const M=rmMats();
  for(let i=0;i<24;i++){ const mat=i<7?M.brain:i<11?M.bone:i<16?M.flesh:i<20?M.skin:M.hair; rmGib(H.x+rand(-0.05,0.05),H.y+rand(-0.04,0.06),H.z+rand(-0.05,0.05),mat,rand(0.014,0.042),rmv(dir.x*rand(2,6)+rand(-2,2),rand(1,4),dir.z*rand(2,6)+rand(-2,2))); }
  rmSpray(H.x,H.y,H.z,dir.x,0.5,dir.z,170,4.5,2.6,0.014);
  const top=rmv(0-hb.com.x,1.585-hb.com.y,-0.007-hb.com.z); rmStump(hb,top,rmv(0,1,0),true);
  RM.wounds.push({b:hb,tag:'stump',lp:top,ln:rmv(0,1,0),rate:6,artery:true,age:0,acc:0,stump:true});
  try{ Snd.flesh(H.x,H.z); Snd.flesh(H.x,H.z); }catch(e){} }
function rmOpenBelly(dir){ const b=RMPH.byName.abdomen; RM.openB=true; RM.bellyFront.visible=false; RM.bellyCav.visible=true; RM.bellyOrg.visible=true; RM.hurt=1; RM.blood-=18;
  const anchor=rmv(0-b.com.x,1.07-b.com.y,0.09-b.com.z); const nodes=[]; for(let i=0;i<18;i++){ const lp=rmv(Math.sin(i*1.3)*0.05,anchor.y+Math.cos(i*0.9)*0.03,0.06+i*0.004-b.com.z*0); const wp=qrot(rmv(),b.q,lp); wp.x+=b.x.x; wp.y+=b.x.y; wp.z+=b.x.z; nodes.push({x:wp.x,y:wp.y,z:wp.z,ox:wp.x-dir.x*0.01,oy:wp.y,oz:wp.z-dir.z*0.01}); }
  const M=rmMats(), meshes=[], geo=new THREE.CylinderGeometry(0.02,0.02,1,8,1,true); for(let i=0;i<17;i++){ const m=new THREE.Mesh(geo,M.gut); RM.dyn.add(m); meshes.push(m); const k=rmBall(0.021,M.gut,rmv()); RM.dyn.add(k); meshes.push(k); }
  RM.gut={nodes,meshes,b,anchor};
  const c=qrot(rmv(),b.q,rmv(0,0,0.1)); c.x+=b.x.x; c.y+=b.x.y; c.z+=b.x.z; rmSpray(c.x,c.y,c.z,dir.x,0.2,dir.z,120,2.2,1.6,0.014);
  RM.wounds.push({b,tag:'belly',lp:rmv(0,-0.03,0.09),ln:rmv(0,0,1),rate:4,artery:false,age:0,acc:0,stump:false});
  if(RM.st==='stand') rmFall('barriga'); }
function rmOpenChest(dir){ const b=RMPH.byName.chest; RM.openC=true; RM.chestFront.visible=false; RM.chestCav.visible=true; RM.chestOrg.visible=true; RM.blood-=25;
  const c=qrot(rmv(),b.q,rmv(0,0.02,0.1)); c.x+=b.x.x; c.y+=b.x.y; c.z+=b.x.z; const M=rmMats();
  for(let i=0;i<8;i++) rmGib(c.x,c.y,c.z,i<4?M.bone:M.flesh,rand(0.01,0.025),rmv(dir.x*rand(1,4)+rand(-1,1),rand(0.5,2.5),dir.z*rand(1,4)+rand(-1,1)));
  rmSpray(c.x,c.y,c.z,dir.x,0.3,dir.z,140,3,1.8,0.014); RM.wounds.push({b,tag:'chest',lp:rmv(0.028,0.0,0.09),ln:rmv(0,0,1),rate:4.5,artery:true,age:0,acc:0,stump:false});
  if(RM.st==='stand') rmFall('peito'); }
function rmGutStep(dt){ const G0=RM.gut, Nn=G0.nodes; const a=qrot(rmv(),G0.b.q,G0.anchor); a.x+=G0.b.x.x; a.y+=G0.b.x.y; a.z+=G0.b.x.z;
  for(let i=1;i<Nn.length;i++){ const p=Nn[i]; const vx=(p.x-p.ox)*0.985, vy=(p.y-p.oy)*0.985, vz=(p.z-p.oz)*0.985; p.ox=p.x; p.oy=p.y; p.oz=p.z; p.x+=vx; p.y+=vy-9.8*dt*dt; p.z+=vz; }
  Nn[0].x=a.x; Nn[0].y=a.y; Nn[0].z=a.z;
  for(let it=0;it<8;it++){ for(let i=0;i<Nn.length-1;i++){ const A=Nn[i], B=Nn[i+1]; const dx=B.x-A.x, dy=B.y-A.y, dz=B.z-A.z, L=Math.hypot(dx,dy,dz)||1e-6, f=(L-0.055)/L; const wa=i===0?0:0.5, wb=i===0?1:0.5;
      A.x+=dx*f*wa; A.y+=dy*f*wa; A.z+=dz*f*wa; B.x-=dx*f*wb; B.y-=dy*f*wb; B.z-=dz*f*wb; }
    for(const p of Nn){ if(p.y<0.02){ p.y=0.02; p.ox+=(p.x-p.ox)*0.4; p.oz+=(p.z-p.oz)*0.4; } } } }
// sangue: jatos no ritmo do coração, mão tampando, gotas, manchas, poças e pedaços
function rmBlood(dt){ const alive=RM.st!=='dead', hr=alive?1.1+(100-RM.blood)/60:0, beat=Math.pow(Math.max(0,Math.sin(RM.t*Math.PI*2*hr)),3);
  const pos=rmv(), nrm=rmv(), palm=rmv(); let cov=1;
  for(const w of RM.wounds){ w.age+=dt; rmWPos(w,pos); qrot(nrm,w.b.q,w.ln);
    let covered=false; for(let hi=0;hi<2;hi++){ if(RM.guard[hi]!==w) continue; const hd=RMPH.byName[hi?'handR':'handL']; if(Math.hypot(hd.x.x-pos.x,hd.x.y-pos.y,hd.x.z-pos.z)<0.12) covered=true; } if(covered) cov*=0.85;
    const decay=w.stump?Math.max(0.15,1-w.age/14):Math.max(0.12,1-w.age/22), bf=rmCl(RM.blood/100,0.1,1);
    const pump=alive?(w.artery?0.25+beat*1.6:0.5+beat*0.5):0.12*Math.max(0,1-RM.deadT/20);
    const rate=w.rate*decay*bf*pump*(covered?0.3:1)*18; w.acc+=rate*dt; const k=Math.min(8,w.acc|0); w.acc-=k;
    const sp=covered?0.25:(w.artery?1.4+beat*2.6:0.6+beat*0.8);
    for(let i=0;i<k;i++) rmSpray(pos.x+nrm.x*0.015,pos.y+nrm.y*0.015,pos.z+nrm.z*0.015,covered?0:nrm.x,covered?-0.5:nrm.y,covered?0:nrm.z,1,sp,covered?0.15:0.35,0.009);
    if(w.stain&&w.stain.scale.x<3.2) w.stain.scale.multiplyScalar(1+dt*0.06*decay);
    if(pos.y<0.35&&RM.st!=='stand'&&w.rate*decay>0.4) rmPool(pos.x,pos.z,dt*w.rate*decay*(w.artery?0.012:0.004)); }
  RM.cov=cov;
  if(alive){ let loss=0; for(const w of RM.wounds) loss+=w.rate*(w.artery?0.55:0.12)*Math.max(0.15,1-w.age/25); RM.blood-=loss*dt*cov; if(RM.blood<=0) rmKill(); }
  const D=RM.drops; let j=0; for(let i=0;i<D.length;i++){ const d=D[i]; d.vy-=9.8*dt; d.vx*=0.995; d.vz*=0.995; d.x+=d.vx*dt; d.y+=d.vy*dt; d.z+=d.vz*dt;
    if(d.y<=0.004){ if(Math.random()<0.55) rmSplat(d.x,d.z,d.r*rand(3,7)*(1+Math.min(2,Math.hypot(d.vx,d.vz)*0.15))); continue; } D[j++]=d; } D.length=j;
  for(const g of RM.gibs){ if(g.rest) continue; g.vy-=9.8*dt; g.m.position.x+=g.vx*dt; g.m.position.y+=g.vy*dt; g.m.position.z+=g.vz*dt; g.m.rotation.x+=g.spin*dt; g.m.rotation.y+=g.spin*0.7*dt;
    if(g.m.position.y<g.r){ g.m.position.y=g.r; g.vy=-g.vy*0.25; g.vx*=0.6; g.vz*=0.6; g.spin*=0.6; if(Math.random()<0.5) rmSplat(g.m.position.x,g.m.position.z,g.r*3); if(Math.abs(g.vy)<0.3&&Math.hypot(g.vx,g.vz)<0.15) g.rest=true; } } }
function rmSplat(x,z,r){ const i=RM.splat%700; RM.splat++; RMO.position.set(x,0.006+(i%50)*0.00008,z); RMO.rotation.set(-Math.PI/2,0,Math.random()*6.28); const sx=r*(0.7+Math.random()*0.6); RMO.scale.set(sx,r,1); RMO.updateMatrix(); RM.splIM.setMatrixAt(i,RMO.matrix); RM.splIM.count=Math.min(700,RM.splat); RM.splIM.instanceMatrix.needsUpdate=true; }
function rmPool(x,z,add){ let p=RM.pools.find(q=>Math.hypot(q.x-x,q.z-z)<0.35); if(!p){ if(RM.pools.length>=8) return; const m=new THREE.Mesh(new THREE.CircleGeometry(1,28),RMMAT.pool); m.rotation.x=-Math.PI/2; m.position.set(x,0.009+RM.pools.length*0.0006,z); m.scale.setScalar(0.02); m.userData.frs=1; MAPG.fun.add(m); p={x,z,v:0,m}; RM.pools.push(p); }
  p.v+=add; const r=Math.min(0.6,Math.sqrt(p.v)*0.9); p.m.scale.set(r,r*0.85,1); }
/* ---------- lugar no parque, reset e laço ---------- */
function rmBuild(){ if(RM.built) return; RM.built=true; rmMats();
  RM.x=FX(13)-3; RM.z=FZ(44); RM.yaw0=Math.PI/2;
  const root=MAPG.fun; RM.g=new THREE.Group(); root.add(RM.g); RM.dyn=new THREE.Group(); root.add(RM.dyn);
  const pad=new THREE.Mesh(new THREE.CircleGeometry(4.2,48),new THREE.MeshBasicMaterial({color:0x1e0a2a})); pad.rotation.x=-Math.PI/2; pad.position.set(RM.x,0.012,RM.z); root.add(pad);
  const ring=new THREE.Mesh(new THREE.RingGeometry(4.1,4.25,64),funGlow(NEON.green)); ring.rotation.x=-Math.PI/2; ring.position.set(RM.x,0.02,RM.z); root.add(ring);
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(5.4,1.1),funSign('LAB DE FÍSICA',5.4,1.1,'#4bff8a')); sg.position.set(RM.x-4.6,3.1,RM.z); sg.rotation.y=Math.PI/2; root.add(sg);
  neonBar(root,[RM.x-4.6,0,RM.z-2.6],[RM.x-4.6,3.6,RM.z-2.6],NEON.green,0.06); neonBar(root,[RM.x-4.6,0,RM.z+2.6],[RM.x-4.6,3.6,RM.z+2.6],NEON.green,0.06);
  const bx=RM.x+2.4, bz=RM.z-3.2; const cg=G3(bx,0,bz); const ped=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.0,0.5),funMat(0x2a2a34)); ped.position.y=0.5; cg.add(ped);
  const top=new THREE.Mesh(new THREE.BoxGeometry(0.62,0.08,0.62),funMat(0xffe14a,{e:0x302800})); top.position.y=1.04; cg.add(top);
  const btn=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.15,0.09,20),new THREE.MeshPhongMaterial({color:0xff1a1a,emissive:0x550000,shininess:90})); btn.position.y=1.12; cg.add(btn); RM.btn=btn;
  const lb=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.35),funSign('RESETAR',1.4,0.35,'#ff4040')); lb.position.set(0,1.55,0); lb.rotation.y=Math.PI*0.75; cg.add(lb); root.add(cg);
  funItem('rmreset',bx,bz,1.5,'Resetar o homem do laboratório',()=>{ rmReset(); btn.position.y=1.09; setTimeout(()=>btn.position.y=1.12,180); try{ Snd.ui('select'); }catch(e){} });
  rmPhysBuild(); rmBuildVisuals(); rmReset(); try{ if(typeof funReskin==='function') funReskin(); }catch(e){} }
function rmReset(){ if(!RM.built) return; rmPhysReset(RM.x,RM.z,RM.yaw0);
  RM.chestFront.visible=RM.bellyFront.visible=true; RM.chestOrg.visible=RM.bellyOrg.visible=RM.chestCav.visible=RM.bellyCav.visible=false; RM.headG.visible=true;
  const kill=o=>{ o.traverse(q=>{ if(q.geometry) q.geometry.dispose(); }); o.parent&&o.parent.remove(o); };   // libera a memória das marcas, cotos e pedaços
  for(const m of RM.marks) kill(m); RM.marks=[]; while(RM.dyn.children.length) kill(RM.dyn.children[0]);
  RM.drops.length=0; RM.dropIM.count=0; RM.splat=0; RM.splIM.count=0; for(const p of RM.pools){ p.m.geometry.dispose(); p.m.parent&&p.m.parent.remove(p.m); } RM.pools=[]; RM.gibs=[]; RM.dacc={}; RM.dshot=-1;
  for(const b of RMPH.B) b.tot=0; RM.on=true; rmDraw(); }
function rmUpdate(dt){ if(!RM.on) return; dt=Math.min(dt,0.05); RM.t+=dt;
  if(RM.sleep&&typeof P!=='undefined'&&P&&P.pos){ const c=RMPH.byName.pelvis.x; if(Math.hypot(P.pos.x-c.x,P.pos.z-c.z)<1.3) RM.sleep=false; }
  if(!RM.sleep){ rmCtrl(dt); rmPhysStep(dt);
    if(RM.st==='dead'){ let mv=0; for(const b of RMPH.B) mv=Math.max(mv,vlen(b.v),vlen(b.w)*0.12); RM.sleepT=mv<0.06?(RM.sleepT||0)+dt:0; if(RM.sleepT>1&&RM.deadT>2.5) RM.sleep=true; } }
  if(RM.gut) rmGutStep(dt);
  rmPlayerTouch(dt); rmBlood(dt); rmDraw(); }
// jogador: em pé ele é sólido (e balança se for empurrado); caído o jogador passa por cima e só mexe de leve braço, perna e cabeça
function rmPlayerTouch(dt){ if(typeof P==='undefined'||!P||!P.pos||G.state!=='playing') return; const py=(P.base||0)+(P.y||0);
  if(RM.st==='stand'){ for(const n of ['pelvis','chest']){ const b=RMPH.byName[n]; const dx=P.pos.x-b.x.x, dz=P.pos.z-b.x.z, d=Math.hypot(dx,dz), R=0.44; if(d<R&&d>1e-4){ const nx=dx/d, nz=dz/d; P.pos.x=b.x.x+nx*R; P.pos.z=b.x.z+nz*R;
      const sp=Math.hypot(P.vx||0,P.vz||0); if(sp>0.5){ const ch=RMPH.byName.chest; ch.v.x-=nx*0.25*dt*60*0.1; ch.v.z-=nz*0.25*dt*60*0.1; RM.A=Math.min(RM.A,0.75); } } } return; }
  for(const b of RMPH.B){ if(b.m>6||b.kin) continue; if(b.x.y<py-0.1||b.x.y>py+1.8) continue; const dx=b.x.x-P.pos.x, dz=b.x.z-P.pos.z, d=Math.hypot(dx,dz), R=0.3+b.br*0.4; if(d>=R||d<1e-4) continue;
    const nx=dx/d, nz=dz/d, vn=b.v.x*nx+b.v.z*nz; if(vn<0.45){ b.v.x+=nx*(0.45-vn)*0.25; b.v.z+=nz*(0.45-vn)*0.25; } RM.sleep=false; RM.sleepT=0; } }
/* ---------- ganchos no jogo ---------- */
const RMF={on:false,d:null,s:null};
{ const f0=fire; fire=function(){ if(CUR!=='fun'||!RM.on) return f0.apply(this,arguments); RMF.on=true; try{ RMF.s=curSlot(); RMF.d=RMF.s?wstat(RMF.s):null; return f0.apply(this,arguments); } finally{ RMF.on=false; } }; }
{ const rw0=rayWall; rayWall=function(o,d,max){ const t=rw0.apply(this,arguments); if(!RMF.on||!RM.on||CUR!=='fun'||!RMF.d) return t; const h=rmRay(o,d,t);
    if(!h) return t; if(RMF.d.proj) return h.t; RH.kind='none';
    const dmg=RMF.d.dmg*(RMF.d.range?rmCl(1.25-h.t/RMF.d.range,0.25,1):1); try{ rmHitBullet(h,o,d,dmg,RMF.s&&RMF.s.id,RMF.d.dmg); }catch(e){ console.warn('[Bunker] homem de testes',e); } return h.t; }; }
{ const ex0=explodeSplash; explodeSplash=function(p,dmg,rad){ const r=ex0.apply(this,arguments); if(CUR==='fun'&&RM.on) try{ rmBlast(p,dmg,rad); }catch(e){} return r; }; }
v9On('frame',dt=>{ if(CUR!=='fun') return; if(!RM.built){ try{ rmBuild(); }catch(e){ console.warn('[Bunker] lab de física',e); RM.built=true; return; } } try{ rmUpdate(dt); }catch(e){ if(!RM._err){ RM._err=1; console.warn('[Bunker] homem de testes',e); } } });
CMDS.homem={d:'homem · reseta o homem do laboratório de física (Parque 4FUN)',f:()=>{ if(CUR!=='fun'){ cprint('Só no Parque 4FUN.','err'); return; } if(!RM.built) rmBuild(); rmReset(); cprint('Homem resetado.'); }};
