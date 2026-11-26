/* ================= v9 · PEGADA DAS ARMAS POR CONTATO (mãos em primeira pessoa) =================
   O ajuste antigo fechava cada dedo inteiro de uma vez e parava quando a LINHA CENTRAL do osso batia na arma: com os dedos
   grossos da malha nova (72_fphands) a pele atravessava a arma, e o dedo parava cedo (aberto) quando a ponta batia antes.
   Agora, por arma e por mão:
   1) a palma avança (ou recua) pela direção da palma até a pele encostar no cabo/guarda-mão;
   2) cada dedo fecha junta por junta: as três juntas dobram juntas e, quando uma falange encosta (testada como um
      cilindro com a grossura real daquele dedo), aquela junta e as de trás travam e as da frente continuam até a ponta
      encostar — o dedo "abraça" a peça;
   3) o indicador da mão do gatilho é posto com a polpa na face do gatilho, sem a falange de baixo entrar no guarda-mato;
   4) o polegar fecha pelo mesmo contato.
   O resultado é cozido em GRIP5_BAKE (gerado pelo comando "pegada_ajustar") e, para arma nova, calculado na primeira vez. */
const GF={on:true,mesh:false,last:null,step:0.03,smax:1.75,key:'bdm_grip5_',lim:{index:[1.55,1.7,1.25],middle:[1.55,1.7,1.25],ring:[1.55,1.7,1.25],pinky:[1.55,1.65,1.25],thumb:[1.1,1.0,0.9]},
  rad:{index:0.0116,middle:0.0121,ring:0.0113,pinky:0.0099,thumb:0.0165},taper:[1,0.9,0.8],palmHalf:0.0175,dbg:0};
if(GRIP_SPEC.bar) GRIP_SPEC.bar.L={z:-0.105};   // a BAR é uma peça só: em -0,17 só tem o cano fino; o guarda-mão de madeira fica mais atrás
GRIP_SPEC.doom=GRIP_SPEC.doom||{R:{},L:{z:-0.19}};   // AA-12: guarda-mão entre -0,14 e -0,23
if(GRIP_SPEC.mg42) GRIP_SPEC.mg42.L={z:-0.11};   // MG42: a camisa do cano é furada (os raios passam); a mão vai na parte maciça logo à frente do receptor
if(GRIP_SPEC.trench) GRIP_SPEC.trench.R={wrist:1,dz:0.035};   // escopeta sem cabo de pistola: a mão vai no punho da coronha, atrás do gatilho
GRIP_SPEC.stg44=Object.assign(GRIP_SPEC.stg44||{},{grip:{top:[0.0125,-0.027,0.093],bot:[0.0125,-0.058,0.104],hw:0.0078}});   // o cabo curto da StG44 não aparece nos raios ao longo do cano
{ const ga=gripAuto; gripAuto=function(id){ const o=ga.apply(this,arguments); const S=GRIP_SPEC[id];
    if(o&&o.R&&S&&S.grip){ const top=SV3a(S.grip.top), bot=SV3a(S.grip.bot), hw=S.grip.hw; const A=bot.clone().sub(top).normalize(); const Fw=new THREE.Vector3(0,0,-1).addScaledVector(A,-A.dot(new THREE.Vector3(0,0,-1))).normalize();
      const len=top.distanceTo(bot); const pc=top.clone().addScaledVector(A,Math.min(0.026,len*0.42)).add(new THREE.Vector3(hw+0.0115,0,0));
      o.R.p=pc.toArray(); o.R.f=Fw.clone().multiplyScalar(0.92).add(new THREE.Vector3(-0.18,-0.1,0)).addScaledVector(A,0.12).normalize().toArray(); o.R.b=new THREE.Vector3(1,0.18,0.12).normalize().toArray(); o.R.top=top.toArray(); o.R.bot=bot.toArray(); o.R.hw=hw; }
    return o; }; }
{ const rp=rigPoseHand; rigPoseHand=function(sd,cfg,gh,scl){ const r=rp.apply(this,arguments); const c=cfg&&(cfg.c||(typeof cfg.curl==='object'?cfg.curl:null));
    if(c&&c.iA){ const Qw=cfg.q?gunHolder.getWorldQuaternion(new THREE.Quaternion()).multiply(cfg.q):sd.hand.getWorldQuaternion(new THREE.Quaternion()); const n=new THREE.Vector3(0,0,1).applyQuaternion(Qw).normalize();
      const b=sd.fingers.index[0]; const wq=b.getWorldQuaternion(new THREE.Quaternion()); rigSetWorldQuat(b,new THREE.Quaternion().setFromAxisAngle(n,c.iA*(sd.S==='R'?1:-1)).multiply(wq)); }
    if(c&&c.tA){ const Qw=new THREE.Quaternion(); sd.hand.getWorldQuaternion(Qw); const n=new THREE.Vector3(0,0,1).applyQuaternion(cfg.q?gunHolder.getWorldQuaternion(new THREE.Quaternion()).multiply(cfg.q):Qw).normalize();
      const b=sd.fingers.thumb[0]; const wq=b.getWorldQuaternion(new THREE.Quaternion()); rigSetWorldQuat(b,new THREE.Quaternion().setFromAxisAngle(n,c.tA*(sd.S==='R'?1:-1)).multiply(wq)); }
    return r; }; }
{ const hl=hcLerp; hcLerp=function(a,b,u,out){ const o=hl(a,b,u,out); for(const k of ['tA','iA']){ const ta=(a&&a[k])||0, tb=(b&&b[k])||0; if(ta||tb) o[k]=ta+(tb-ta)*u; else if(o[k]) o[k]=0; } return o; }; }
let GRIP5_BAKE={
  m1911:{"R":{"p":[0.0283,-0.0463,0.0369],"f":[-0.1803,-0.5685,-0.8027],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.197,1.317,0.898],"ring":[1.031,1.134,0.773],"pinky":[1.372,1.509,1.029],"index":[1.294,1.423,0.97],"thumb":[-0.253,-0.114,-0.076]}},"L":{"p":[-0.0277,-0.0549,0.0338],"f":[0.2494,-0.5486,-0.798],"b":[-0.921,-0.1535,0.3582],"c":{"middle":[1.22,1.7,1.25],"ring":[1.167,1.7,1.25],"pinky":[0.79,1.234,0.938],"index":[1.02,1.594,1.211],"thumb":[0.239,0.406,0.311]}}},
  python:{"R":{"p":[0.0295,-0.059,0.0432],"f":[-0.18,-0.5839,-0.7916],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.253,1.378,0.94],"ring":[1.028,1.131,0.771],"pinky":[1.359,1.033,0.653],"index":[1.21,1.7,1.25],"thumb":[-0.083,-0.141,-0.108]}},"L":{"p":[-0.0303,-0.0683,0.0411],"f":[0.2494,-0.5486,-0.798],"b":[-0.921,-0.1535,0.3582],"c":{"middle":[1.135,1.7,1.25],"ring":[1.241,1.365,0.93],"pinky":[1.363,1.499,1.022],"index":[1.053,1.158,0.79],"thumb":[0.719,0.323,0.216]}}},
  kar98k:{"R":{"p":[0.0615,-0.0464,0.0273],"f":[-0.1751,-0.8438,-0.5073],"b":[0.9774,0.1759,0.1173],"c":{"middle":[0.088,0.137,0.104],"ring":[1.066,0.81,0.512],"pinky":[1.387,1.054,0.666],"index":[0.475,0.713,0.463],"thumb":[-0.158,-0.268,-0.205],"iA":0.1}},"L":{"p":[0.0375,-0.0678,-0.3002],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.723,0.549,0.347],"ring":[0.675,1.055,0.802],"pinky":[1.375,1.045,0.66],"index":[0.5,0.55,0.375],"thumb":[0.2,0.168,0.126],"tA":-0.1}}},
  garand:{"R":{"p":[0.0371,-0.0127,0.0631],"f":[-0.1829,-0.4343,-0.882],"b":[0.9774,0.1759,0.1173],"c":{"middle":[0.515,0.805,0.612],"ring":[1.281,0.974,0.615],"pinky":[1.336,1.015,0.641],"index":[1.375,1.65,1.117],"thumb":[-1.1,-0.5,-0.35],"iA":0.1}},"L":{"p":[0.0233,-0.0034,-0.095],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.834,0.918,0.626],"ring":[1.344,1.021,0.645],"pinky":[1.168,0.888,0.561],"index":[0.781,0.859,0.586],"thumb":[0.4,0.144,0.108],"tA":-0.3}}},
  db:{"R":{"p":[0.0733,-0.0684,0.07],"f":[-0.1834,-0.4057,-0.8954],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.219,1.341,0.914],"ring":[1.258,0.956,0.604],"pinky":[0.927,1.449,1.101],"index":[1.3,1.625,1.056],"thumb":[-0.228,-0.103,-0.068],"iA":-0.2}},"L":{"p":[0.0399,-0.0595,-0.1931],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.77,1.203,0.914],"ring":[1.344,1.478,1.008],"pinky":[1.031,1.134,0.773],"index":[0.797,0.877,0.598],"thumb":[0.6,0.216,0.162],"tA":0.1}}},
  thompson:{"R":{"p":[0.0505,-0.0453,0.0302],"f":[-0.1834,-0.4057,-0.8954],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.06,1.656,1.25],"ring":[1.147,1.262,0.86],"pinky":[1.375,1.513,1.031],"index":[1.375,1.375,0.894],"thumb":[-1.1,-0.5,-0.35],"iA":-0.1}},"L":{"p":[0.0479,-0.0326,-0.1503],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.817,1.277,0.971],"ring":[1.325,1.458,0.994],"pinky":[0.95,1.045,0.712],"index":[1.016,1.117,0.762],"thumb":[0.4,0.144,0.108],"tA":-0.55}}},
  mp40:{"R":{"p":[0.052,-0.0378,-0.0239],"f":[-0.1834,-0.4057,-0.8954],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.297,0.986,0.623],"ring":[1.369,1.506,1.027],"pinky":[1.402,1.066,0.673],"index":[1.3,1.625,1.056],"thumb":[-0.853,-0.384,-0.256],"iA":-0.35}},"L":{"p":[0.0249,-0.0401,-0.115],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.676,0.514,0.324],"ring":[0.534,0.588,0.401],"pinky":[0.57,0.891,0.677],"index":[0.806,0.887,0.605],"thumb":[0.6,0.216,0.162],"tA":-0.55}}},
  ppsh:{"R":{"p":[0.0504,-0.012,0.0213],"f":[-0.1834,-0.4057,-0.8954],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.347,1.482,1.01],"ring":[0.957,0.727,0.459],"pinky":[-0.188,-0.142,-0.09],"index":[1.375,1.65,1.117],"thumb":[-0.813,-0.366,-0.244],"iA":-0.1}},"L":{"p":[0.0276,-0.0395,-0.1351],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.914,0.695,0.439],"ring":[0.7,1.094,0.831],"pinky":[0.717,1.121,0.852],"index":[0.685,1.07,0.813],"thumb":[0.2,0.072,0.054],"tA":-0.8}}},
  stg44:{"R":{"p":[0.0421,-0.0272,0.0736],"f":[-0.1811,-0.5241,-0.8322],"b":[0.9774,0.1759,0.1173],"c":{"middle":[0.447,0.492,0.335],"ring":[0.075,0.117,0.089],"pinky":[1.359,1.033,0.653],"index":[1.225,1.65,1.194],"thumb":[-1.1,0.8,0.5599999999999999],"iA":0}},"L":{"p":[0.0326,-0.0345,-0.1503],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[1.003,1.103,0.752],"ring":[0.925,1.445,1.098],"pinky":[1.238,0.941,0.594],"index":[0.938,1.031,0.703],"thumb":[0.2,0.168,0.126],"tA":-0.1}}},
  trench:{"R":{"p":[0.0724,-0.0267,0.0785],"f":[-0.1751,-0.8438,-0.5073],"b":[0.9774,0.1759,0.1173],"c":{"middle":[0.336,0.255,0.161],"ring":[0.844,0.928,0.633],"pinky":[0.428,0.668,0.508],"index":[0.625,0.625,0.406],"thumb":[-0.152,-0.114,-0.086],"iA":0.35}},"L":{"p":[0.0372,-0.0794,-0.209],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.791,0.87,0.593],"ring":[0.863,0.949,0.647],"pinky":[0.8,1.25,0.95],"index":[0.242,0.379,0.288],"thumb":[0,0,0],"tA":0.3}}},
  bar:{"R":{"p":[0.0494,-0.0509,0.09],"f":[-0.1839,-0.3844,-0.9047],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.277,0.971,0.613],"ring":[1.35,1.485,1.013],"pinky":[1.336,1.015,0.641],"index":[1.15,1.65,1.121],"thumb":[-0.847,-0.381,-0.254],"iA":-0.35}},"L":{"p":[0.0309,-0.0382,-0.1051],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.938,0.712,0.45],"ring":[1.341,1.475,1.005],"pinky":[1.056,1.162,0.792],"index":[1.431,1.574,1.073],"thumb":[0.8,0.672,0.504],"tA":-1.1}}},
  mg42:{"R":{"p":[0.052,-0.0265,0.0596],"f":[-0.1834,-0.4057,-0.8954],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.222,1.344,0.916],"ring":[1.199,0.911,0.576],"pinky":[0.888,1.387,1.054],"index":[1.375,1.65,1.117],"thumb":[-0.613,-0.276,-0.184],"iA":0.1}},"L":{"p":[0.0254,-0.0195,-0.11],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.657,1.027,0.781],"ring":[0.73,1.141,0.867],"pinky":[1.016,0.772,0.487],"index":[0.448,0.699,0.531],"thumb":[0.8,0.288,0.216],"tA":-0.8}}},
  ptrs:{"R":{"p":[0.0706,-0.1243,0.044],"f":[-0.1909,-0.1061,-0.9759],"b":[0.9774,0.1759,0.1173],"c":{"middle":[0.82,1.281,0.974],"ring":[-0.129,-0.098,-0.062],"pinky":[0.95,1.045,0.712],"index":[0.1,0.15,0.098],"thumb":[0.644,0.29,0.193],"iA":0.35}},"L":{"p":[0.0562,-0.0495,-0.2702],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.763,1.191,0.905],"ring":[1.344,1.021,0.645],"pinky":[1.152,0.876,0.553],"index":[0.747,0.822,0.56],"thumb":[0.6,0.216,0.162],"tA":-0.1}}},
  ray:{"R":{"p":[0.0306,-0.0627,0.0304],"f":[-0.1834,-0.4057,-0.8954],"b":[0.9774,0.1759,0.1173],"c":{"middle":[1.23,1.7,1.25],"ring":[1.035,1.617,1.229],"pinky":[1.293,0.983,0.621],"index":[1.375,1.65,1.117],"thumb":[0.431,0.733,0.561],"iA":-0.2}},"L":{"p":[0.0041,-0.045,-0.17],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[1.363,1.499,1.022],"ring":[1.019,1.121,0.764],"pinky":[0.966,1.062,0.724],"index":[1.473,1.119,0.707],"thumb":[0.2,0.168,0.126],"tA":-0.3}}},
  doom:{"R":{"p":[0.0755,-0.0536,0.0164],"f":[-0.1834,-0.4057,-0.8954],"b":[0.9774,0.1759,0.1173],"c":{"middle":[0.575,0.633,0.431],"ring":[1.353,1.488,1.015],"pinky":[1.012,1.114,0.759],"index":[1.375,1.375,0.894],"thumb":[-0.544,-0.245,-0.163],"iA":-0.35}},"L":{"p":[0.0414,-0.0718,-0.19],"f":[0.8437,0.2978,-0.4467],"b":[0.3011,-0.9536,0],"c":{"middle":[0.684,0.52,0.328],"ring":[0.824,0.626,0.396],"pinky":[0.803,0.883,0.602],"index":[0.448,0.699,0.531],"thumb":[-0.24,0,0],"tA":-0.55}}}
};
const SV3a=a=>new THREE.Vector3(a[0],a[1],a[2]);
const _gfv=[0,1,2,3,4,5,6,7].map(()=>new THREE.Vector3()), _gfr=new THREE.Raycaster(); _gfr.layers.enable(5); _gfr.layers.enable(7);
/* escala bind→mundo das mãos rigadas (as grossuras da malha nova são medidas em bind) */
function gfRatio(sd){ const m=RIG.meshes&&RIG.meshes[sd.S]; if(!m) return RIG.s; const sk=m.skeleton, b0=sd.fingers.middle[0], b1=sd.fingers.middle[1];
  const i0=sk.bones.indexOf(b0), i1=sk.bones.indexOf(b1); if(i0<0||i1<0) return RIG.s;
  const p0=new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().copy(sk.boneInverses[i0]).invert()), p1=new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().copy(sk.boneInverses[i1]).invert());
  const w=b0.getWorldPosition(_gfv[0]).distanceTo(b1.getWorldPosition(_gfv[1])); return w/Math.max(1e-6,p0.distanceTo(p1)); }
/* malhas da arma perto de um ponto (corta o custo dos raios) */
function gfNear(meshes,c,r){ const out=[], bs=new THREE.Sphere(); for(const m of meshes){ if(!m.geometry.boundingSphere) m.geometry.computeBoundingSphere(); bs.copy(m.geometry.boundingSphere).applyMatrix4(m.matrixWorld); if(bs.center.distanceTo(c)<bs.radius+r) out.push(m); } return out; }
/* cilindro a→b de raio r encosta/entra na arma? (linha central + 6 linhas na casca) */
function gfCaps(a,b,r,meshes,ext){ const d=_gfv[2].subVectors(b,a); const L=d.length(); if(L<1e-5) return false; d.multiplyScalar(1/L);
  const u=_gfv[3].crossVectors(d,Math.abs(d.y)<0.9?_gfv[4].set(0,1,0):_gfv[4].set(1,0,0)).normalize(), v=_gfv[5].crossVectors(d,u);
  for(let k=0;k<7;k++){ const o=_gfv[6].copy(a); if(k){ const t=(k-1)/6*Math.PI*2; o.addScaledVector(u,Math.cos(t)*r).addScaledVector(v,Math.sin(t)*r); }
    _gfr.set(o,d); _gfr.far=L+(ext?r:0); if(_gfr.intersectObjects(meshes,false).length) return true; }
  return false; }
/* pontos das falanges (juntas + ponta) */
function gfPts(chain,tipLen){ const pts=chain.map(b=>b.getWorldPosition(new THREE.Vector3())); const q=chain[2].getWorldQuaternion(new THREE.Quaternion()); pts.push(pts[2].clone().add(new THREE.Vector3(0,1,0).applyQuaternion(q).multiplyScalar(tipLen))); return pts; }
function gfSolveHand(sd,frame,shape,meshes,trig,thumb){
  const gh=gunHolder.matrixWorld; const k=gfRatio(sd); const cur={}; for(const f of HCF) cur[f]=[0,0,0];
  const pose=()=>rigPoseHand(sd,{p:frame.p,q:frame.q,c:cur},gh);
  pose(); const hc=sd.hand.getWorldPosition(new THREE.Vector3()); const near=gfNear(meshes,hc,0.22);
  const res={};
  const solve=(f,sh,lim,rad,skipTip)=>{ const tl=sd.fingers[f][1].getWorldPosition(_gfv[0]).distanceTo(sd.fingers[f][2].getWorldPosition(_gfv[1]))*0.85;
    let fz=-1; const a=[0,0,0]; let stuck=false;
    cur[f]=[0,0,0]; pose(); { const pts=gfPts(sd.fingers[f],tl); for(let j=0;j<3;j++) if(gfCaps(pts[j],pts[j+1],rad[j]*0.85,near,j===2)){ stuck=true; break; } }
    if(stuck) return {a:null,stuck:true};
    for(let s=GF.step;s<=GF.smax&&fz<2;s+=GF.step){ const prev=a.slice();
      for(let j=fz+1;j<3;j++) a[j]=Math.min(lim[j],sh[j]*s);
      cur[f]=a.slice(); pose(); const pts=gfPts(sd.fingers[f],tl);
      let hit=-1; for(let j=fz+1;j<3;j++){ if(skipTip&&j===2) continue; if(gfCaps(pts[j],pts[j+1],rad[j],near,j===2)){ hit=j; break; } }
      if(hit>=0){ for(let j=fz+1;j<=hit;j++) a[j]=prev[j]; fz=hit; cur[f]=a.slice(); }
      else if(a.every((v,j)=>j<=fz||v>=lim[j]-1e-4)) break; }
    return {a:a.map(v=>+v.toFixed(3)),stuck:false}; };
  const R=f=>GF.taper.map(t=>t*GF.rad[f]*k);
  // dedos (o indicador do gatilho é tratado à parte)
  for(const f of ['middle','ring','pinky','index']){
    if(f==='index'&&trig){ const T=trig.clone().applyMatrix4(gh); const tl=sd.fingers.index[1].getWorldPosition(_gfv[0]).distanceTo(sd.fingers.index[2].getWorldPosition(_gfv[1]))*0.85;
      let best=null, bd=1e9; const r=R('index');
      for(let s1=0.1;s1<=1.5;s1+=0.05) for(const sp of [0.6,0.9,1.2,1.5]){ const a=[s1,Math.min(1.6,s1*sp),Math.min(1.1,s1*sp*0.6)]; cur.index=a; pose(); const pts=gfPts(sd.fingers.index,tl);
        if(gfCaps(pts[0],pts[1],r[0]*0.9,near,false)||gfCaps(pts[1],pts[2],r[1]*0.85,near,false)) continue;
        // polpa do dedo (ponta, lado da palma) encostando no gatilho
        const pad=pts[2].clone().lerp(pts[3],0.55); const d=Math.abs(pad.distanceTo(T)-r[2]*0.9); if(d<bd){ bd=d; best=a.map(v=>+v.toFixed(3)); } }
      res.index=best||shape.index.map(v=>v*0.6); cur.index=res.index; continue; }
    const o=solve(f,shape[f],GF.lim[f],R(f)); res[f]=o.a; res[f+'_s']=o.stuck; if(o.a) cur[f]=o.a; }
  // dedo que já nasce encostado: copia a média dos vizinhos (e recua um pouco)
  const nf=['index','middle','ring','pinky']; for(let i=0;i<4;i++){ const f=nf[i]; if(res[f]) continue; const nb=[nf[i-1],nf[i+1]].filter(x=>x&&res[x]); res[f]=nb.length?[0,1,2].map(j=>+(nb.reduce((a,x)=>a+res[x][j],0)/nb.length*0.85).toFixed(3)):[0.3,0.3,0.2]; cur[f]=res[f]; }
  for(const f of nf) delete res[f+'_s'];
  // polegar
  const th=thumb||[0.6,0.4,0.3]; const ot=solve('thumb',th.map(v=>v/Math.max(th[0],1e-3)),GF.lim.thumb.map((l,j)=>Math.min(l,th[j]*1.6+0.05)),R('thumb'));
  res.thumb=ot.a||th.map(v=>+(v*0.5).toFixed(3));
  return res; }
/* palma encostada: mede a distância da pele da palma até a arma (vários pontos da palma) e corrige pela normal da palma */
function gfPalm(spec,ms,ratio,side){ const q=handQ(spec.f,spec.b); const X=new THREE.Vector3(1,0,0).applyQuaternion(q), Y=new THREE.Vector3(0,1,0).applyQuaternion(q), n=new THREE.Vector3(0,0,-1).applyQuaternion(q);
  const p=V3(spec.p); let dmin=1e9, cnt=0; const half=GF.palmHalf*ratio;
  for(const dx of [-0.02,0,0.02]) for(const dy of [-0.022,0,0.016]){ const o=p.clone().addScaledVector(X,dx*ratio/0.85).addScaledVector(Y,dy*ratio/0.85);
    const hs=lineHits(ms,o.toArray(),n.toArray()); const h=hs.find(v=>v>-0.012); if(h!=null&&h<0.06){ dmin=Math.min(dmin,h); cnt++; } }
  if(cnt<2) return 0;
  const delta=Math.max(-0.015,Math.min(0.03,dmin-half-0.0008)); spec.p=p.addScaledVector(n,delta).toArray(); return delta; }
/* refino na malha de verdade: pele por dedo (vértices skinados), "dentro" = paridade de raios em dois eixos.
   pen = pontos da pele (recuada 0,6 mm) dentro da arma; con = pontos (inflados 1,6 mm) que encostam. */
const _gfRay=new THREE.Raycaster(); _gfRay.layers.enable(5); _gfRay.layers.enable(7);
const _gfD=[new THREE.Vector3(1,0.013,0.007).normalize(),new THREE.Vector3(-0.011,1,0.009).normalize()];
/* dentro de alguma peça: só testa as peças cuja caixa contém o ponto, e conta a paridade por peça */
function gfBoxes(near){ if(near._bx) return near._bx; const bx=near.map(m=>{ if(!m.geometry.boundingBox) m.geometry.computeBoundingBox(); return new THREE.Box3().copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld).expandByScalar(0.0005); }); near._bx=bx; return bx; }
function gfInside(p,near){ const bx=gfBoxes(near);
  for(let i=0;i<near.length;i++){ if(!bx[i].containsPoint(p)) continue; let ok=true;
    for(const d of _gfD){ _gfRay.set(p,d); _gfRay.far=0.6; if(near[i].raycast.length&&false){} const hs=[]; near[i].raycast(_gfRay,hs); if(hs.length%2===0){ ok=false; break; } }
    if(ok) return true; }
  return false; }
const GFV={};
function gfVerts(S){ if(GFV[S]&&GFV[S].geo===RIG.meshes[S].geometry) return GFV[S]; const sd=RIG.sides[S]; const reg=gfRegion(sd); const by={}; const n=reg.length;
  for(let i=0;i<n;i++){ const r=reg[i]; if(!r) continue; (by[r]||(by[r]=[])).push(i); }
  for(const k in by){ const a=by[k], st=Math.max(1,Math.round(a.length/70)); by[k]=a.filter((_,j)=>j%st===0); }
  return GFV[S]={geo:RIG.meshes[S].geometry,by}; }
function gfEvalPart(S,part,near){ GF.nev=(GF.nev||0)+1; const sd=RIG.sides[S], m=RIG.meshes[S], V=gfVerts(S).by[part]; if(!V) return {pen:0,con:0};
  const chain=part==='palm'?null:gfPts(sd.fingers[part],sd.fingers[part][1].getWorldPosition(_gfv[0]).distanceTo(sd.fingers[part][2].getWorldPosition(_gfv[1]))*0.85);
  const hp=sd.hand.getWorldPosition(new THREE.Vector3()), kp=sd.fingers.middle[0].getWorldPosition(new THREE.Vector3());
  const v=new THREE.Vector3(), c=new THREE.Vector3(), nrm=new THREE.Vector3(), seg=new THREE.Line3(); let pen=0, con=0;
  for(const i of V){ m.boneTransform(i,v); v.applyMatrix4(m.matrixWorld);
    if(chain){ let bd=1e9; for(let j=0;j<3;j++){ seg.set(chain[j],chain[j+1]); const q=seg.closestPointToPoint(v,true,_gfv[7]); const d=q.distanceToSquared(v); if(d<bd){ bd=d; c.copy(q); } } }
    else { seg.set(hp,kp); seg.closestPointToPoint(v,true,c); }
    nrm.subVectors(v,c); const L=nrm.length(); if(L<1e-6) continue; nrm.multiplyScalar(1/L);
    if(gfInside(_gfv[6].copy(v).addScaledVector(nrm,-0.0006),near)) pen++; else if(gfInside(_gfv[6].copy(v).addScaledVector(nrm,0.0022),near)) con++; }
  return {pen,con,n:V.length}; }
function gfRefine(S,frame,c,near,only){ const sd=RIG.sides[S]; const gh=gunHolder.matrixWorld; const cur=JSON.parse(JSON.stringify(c));
  const pose=()=>rigPoseHand(sd,{p:frame.p,q:frame.q,c:cur},gh);
  const log={};
  for(const f of (only||['index','middle','ring','pinky','thumb'])){ let best=null, minP=null;
    if(f==='index'&&GF.bk&&GF.bk.trig&&S==='R'){ const T=GF.bk.trig.clone().applyMatrix4(gh); const tl=sd.fingers.index[1].getWorldPosition(_gfv[0]).distanceTo(sd.fingers.index[2].getWorldPosition(_gfv[1]))*0.85;
      const cand=[]; for(let s1=0.1;s1<=1.45;s1+=0.075) for(const sp of [0.5,0.75,1,1.25,1.5]) for(const iA of [-0.35,-0.2,-0.1,0,0.1,0.2,0.35]){ const a=[s1,Math.min(1.65,s1*sp),Math.min(1.2,s1*sp*0.65)]; cur.index=a; cur.iA=iA; pose(); const pts=gfPts(sd.fingers.index,tl);
          const d=pts[2].clone().lerp(pts[3],0.6).distanceTo(T); cand.push({a,iA,d}); }
      cand.sort((x,y)=>Math.abs(x.d-0.0115)-Math.abs(y.d-0.0115));
      for(const C of cand.slice(0,40)){ cur.index=C.a; cur.iA=C.iA; pose(); const e=gfEvalPart(S,'index',near); const sc=-e.pen*30-Math.abs(C.d-0.0115)*400+e.con*0.3; if(!best||sc>best.sc) best={sc,a:C.a.map(v=>+v.toFixed(3)),iA:C.iA,e:Object.assign({trig:+C.d.toFixed(4),iA:C.iA},e)}; }
      if(best){ cur.index=best.a; cur.iA=best.iA; log.index=best.e; continue; } delete cur.iA; }
    if(f==='thumb'&&S==='L'&&GF.bk&&!GF.bk.A.L.pistol){ // polegar da mão de apoio: deita no lado de cá do guarda-mão (abdução + curva)
      const tl=sd.fingers.thumb[1].getWorldPosition(_gfv[0]).distanceTo(sd.fingers.thumb[2].getWorldPosition(_gfv[1]))*0.85; const rT=GF.rad.thumb*gfRatio(sd)*0.8;
      const gap=pts=>{ let g=1; for(const P of [pts[3],pts[2].clone().lerp(pts[3],0.5)]) for(const d of [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1]]){ _gfr.set(P,_gfv[5].set(...d).transformDirection(gh)); _gfr.far=0.06; const h=_gfr.intersectObjects(near,false)[0]; if(h) g=Math.min(g,h.distance-rT); } return Math.max(0,g); };
      for(const tA of [-1.1,-0.8,-0.55,-0.3,-0.1,0.1,0.3,0.55,0.8]) for(const u of [-0.3,0,0.25,0.5,0.75,1.0]) for(const j2 of [0.3,0.7]){ const a=[0.8*u,0.6*Math.max(u,0)*j2*1.6,0.45*Math.max(u,0)*j2*1.6]; cur.thumb=a; cur.tA=tA; pose();
          const pts=gfPts(sd.fingers.thumb,tl); const g=gap(pts); if(g>0.03) continue; const e=gfEvalPart(S,'thumb',near); const sc=e.con-30*e.pen-g*250-Math.abs(tA)*0.4; if(!best||sc>best.sc) best={sc,a:a.map(v=>+v.toFixed(3)),tA,e:Object.assign({tA,gap:+g.toFixed(4)},e)}; }
      if(best&&best.e.pen===0){ cur.thumb=best.a; cur.tA=best.tA; log.thumb=best.e; continue; } delete cur.tA; best=null; }
    const dists=f==='thumb'?[[0.8,0.6,0.45],[1,0.45,0.3],[0.5,0.85,0.65]]:[[1,1.1,0.75],[1.25,0.95,0.6],[0.8,1.25,0.95]];
    const at=(D,u)=>D.map((v,j)=>Math.max(-0.9,Math.min(GF.lim[f][j],v*u)));
    const ev=(D,u)=>{ cur[f]=at(D,u); pose(); return gfEvalPart(S,f,near); };
    for(const D of dists){ const us=[]; for(let u=(f==='thumb'?-1.0:-0.15);u<=1.6001;u+=0.1) us.push(+u.toFixed(3));
      const pv=us.map(u=>{ const e=ev(D,u); if(!minP||e.pen<minP.pen||(e.pen===minP.pen&&e.con>minP.con)) minP={pen:e.pen,con:e.con,a:at(D,u).map(v=>+v.toFixed(3)),e}; return e.pen; }); const pen=pv.map(x=>x>0);
      const edges=[]; // bordas: último válido antes de entrar / primeiro válido depois de sair
      for(let i=0;i<us.length;i++){ if(pen[i]) continue; const a=i>0&&pen[i-1], b=i<us.length-1&&pen[i+1];
        if(b){ let lo=us[i], hi=us[i+1]; for(let k=0;k<5;k++){ const m=(lo+hi)/2; if(ev(D,m).pen>0) hi=m; else lo=m; } edges.push(lo); }
        if(a){ let lo=us[i-1], hi=us[i]; for(let k=0;k<5;k++){ const m=(lo+hi)/2; if(ev(D,m).pen>0) lo=m; else hi=m; } edges.push(hi); } }
      if(!edges.length){ const ok=us.filter((u,i)=>!pen[i]); if(!ok.length) continue; edges.push(ok.reduce((p,u)=>Math.abs(u-1)<Math.abs(p-1)?u:p)); }
      for(const u of edges){ const e=ev(D,u); const sc=e.con-30*e.pen-Math.abs(u-1)*0.6; if(!best||sc>best.sc) best={sc,a:at(D,u).map(v=>+v.toFixed(3)),e}; } }
    if(!best&&f==='thumb'){ // nenhuma curva serve: procura junta por junta (inclusive dobrando para trás) a que menos entra e mais encosta
      for(const j1 of [-1.1,-0.8,-0.5,-0.25,0,0.25,0.5,0.8,1.05]) for(const j2 of [-0.5,-0.2,0.1,0.4,0.8]){ const a=[j1,j2,j2*0.7]; cur[f]=a; pose(); const e=gfEvalPart(S,f,near); const sc=e.con-30*e.pen; if(!best||sc>best.sc) best={sc,a,e}; } }
    if(!best&&minP){ best=minP; best.e=Object.assign({min:1},minP.e); }
    if(best){ cur[f]=best.a; log[f]=best.e; } else { cur[f]=c[f]; log[f]='keep'; } }
  pose(); return {c:cur,log}; }
function gfPalmMesh(S,spec,near){ const sd=RIG.sides[S]; const gh=gunHolder.matrixWorld; const q=handQ(spec.f,spec.b); const n=new THREE.Vector3(0,0,-1).applyQuaternion(q); const p0=V3(spec.p);
  let best=null; for(let d=-0.016;d<=0.012;d+=0.002){ const p=p0.clone().addScaledVector(n,d); rigPoseHand(sd,{p,q,c:HC.open},gh); const e=gfEvalPart(S,'palm',near); const sc=e.con-30*e.pen-Math.abs(d)*40; if(!best||sc>best.sc) best={sc,d,e}; }
  spec.p=p0.addScaledVector(n,best.d).toArray(); return best; }
gripSolve=function(id){
  if(!gunModel||!RIG.ok) return null; const s=curSlot(); if(!s||s.id!==id) return null;
  const A=gripAuto(id); const ms=gunMeshes(); RIG.root.visible=true; RIG.s=0.85; RIG.root.scale.setScalar(RIG.s);
  const sh=RIG_SHOULDER; RIG.root.position.set(sh[0],sh[1]-1.4453*RIG.s,sh[2]-0.104*RIG.s); RIG.root.updateMatrixWorld(true); gunHolder.updateMatrixWorld(true);
  const G=gunModel.userData.vmp; const trig=A.R.trig&&G.trig?new THREE.Vector3(G.trig.c.x,G.trig.c.y-0.002,G.trig.min.z+0.002):null;
  const shapeR={index:[1,1.05,0.7],middle:[1,1.1,0.75],ring:[1,1.12,0.78],pinky:[1,1.1,0.75],thumb:[0.8,0.6,0.45]};
  const info={};
  for(const S of ['R','L']){ const spec=A[S]; if(!spec) continue; const sd=RIG.sides[S];
    rigPoseHand(sd,{p:spec.p,q:handQ(spec.f,spec.b),c:HC.open},gunHolder.matrixWorld); const ratio=gfRatio(sd);
    info[S]={ray:gfPalm(spec,ms,ratio,S)};
    const near=gfNear(ms,V3(spec.p).applyMatrix4(gunHolder.matrixWorld),0.25);
    if(GF.mesh&&RIG.meshes[S]&&FPH.built){ info[S].palm=gfPalmMesh(S,spec,near); }
    const fr=gripFrame(spec);
    const thumb=S==='R'?(spec.pistol?[0.55,0.4,0.3]:[0.8,0.55,0.4]):(spec.pistol?[0.2,0.12,0.08]:(spec.sup?[0.95,0.7,0.5]:[0.45,0.3,0.2]));
    spec.c=gfSolveHand(sd,fr,shapeR,ms,S==='R'?trig:null,thumb);
    if(GF.mesh&&RIG.meshes[S]&&FPH.built){ const r=gfRefine(S,fr,spec.c,near); spec.c=r.c; info[S].fing=r.log; } }
  GF.last=info;
  if(GF.dbg) console.log('[grip5]',id,JSON.stringify(info));
  const r=n=>Array.isArray(n)?n.map(v=>+(+v).toFixed(4)):n;
  const pack=h=>h&&({p:r(h.p),f:r(h.f),b:r(h.b),c:h.c});
  return {R:pack(A.R),L:pack(A.L)}; };
gripGet=function(id){
  if(GRIPF[id]) return GRIPF[id];
  let B=GF.on?GRIP5_BAKE[id]:GRIP_BAKE[id]; const LK=GF.key+id; if(!B&&!GRIPL.nocache){ try{ const j=localStorage.getItem(LK); if(j) B=JSON.parse(j); }catch(e){} }
  if(!B){ try{ B=gripSolve(id); if(B) try{ localStorage.setItem(LK,JSON.stringify(B)); }catch(e){} }catch(e){ console.warn('[Bunker] ajuste de pegada',e); } }
  if(!B) return null;
  const mk=h=>h?{p:V3(h.p),q:handQ(h.f,h.b),c:h.c||HC.grab}:null;
  return GRIPF[id]={R:mk(B.R),L:mk(B.L),s:0.85}; };
CMDS.pegada_ajustar={cheat:1,d:'pegada_ajustar · refaz a pegada da arma atual por contato (mostra o resultado no console)',f:()=>{ const s=curSlot(); if(!s){ cprint('sem arma'); return; }
  delete GRIPF[s.id]; delete GRIP5_BAKE[s.id]; try{ localStorage.removeItem(GF.key+s.id); }catch(e){} const t0=performance.now(); const B=gripSolve(s.id); if(B){ GRIP5_BAKE[s.id]=B; delete GRIPF[s.id]; }
  cprint(`${s.id}: ${(performance.now()-t0|0)} ms`); console.log(JSON.stringify(B)); }};
/* medição (teste): por dedo, quantos pontos da pele estão DENTRO da arma e a folga da ponta até a superfície */
function gfRegion(sd){ // vértice → dedo dominante (pelo osso com mais peso)
  const m=RIG.meshes[sd.S], si=m.geometry.attributes.skinIndex, sw=m.geometry.attributes.skinWeight, bones=m.skeleton.bones; const map={};
  for(const f of HCF) for(const b of sd.fingers[f]) map[bones.indexOf(b)]=f; map[bones.indexOf(sd.hand)]='palm';
  const reg=new Array(si.count); for(let i=0;i<si.count;i++){ let best=-1,bw=0; for(let k=0;k<4;k++){ const w=sw.array[i*4+k]; if(w>bw){ bw=w; best=si.array[i*4+k]; } } reg[i]=map[best]||null; } return reg; }
function gfMeasure(S){ const sd=RIG.sides[S], m=RIG.meshes[S]; if(!m||!m.visible) return null; vmScene.updateMatrixWorld(true); m.skeleton.update();
  const ms=gunMeshes(); const reg=gfRegion(sd); const v=new THREE.Vector3(); const out={}; const ray=new THREE.Raycaster(); ray.layers.enable(5); ray.layers.enable(7);
  const hc=sd.hand.getWorldPosition(new THREE.Vector3()); const near=gfNear(ms,hc,0.25);
  const dirs=[new THREE.Vector3(1,0.013,0.007).normalize(),new THREE.Vector3(-0.011,1,0.009).normalize()];
  const n=m.geometry.attributes.position.count;
  for(let i=0;i<n;i+=3){ const r=reg[i]; if(!r) continue; m.boneTransform(i,v); v.applyMatrix4(m.matrixWorld); const o=out[r]||(out[r]={n:0,in:0,near:9});
    o.n++; let inside=true; for(const d of dirs){ ray.set(v,d); ray.far=1; const hs=ray.intersectObjects(near,false); if(hs.length%2===0){ inside=false; break; } } if(inside) o.in++;
    if(!inside){ for(const d of [dirs[0],dirs[1]]) for(const sgn of [1,-1]){ ray.set(v,d.clone().multiplyScalar(sgn)); ray.far=0.03; const hs=ray.intersectObjects(near,false); if(hs.length) o.near=Math.min(o.near,hs[0].distance); } } }
  for(const k in out){ out[k].pin=+(out[k].in/out[k].n*100).toFixed(1); out[k].near=+out[k].near.toFixed(4); delete out[k].in; delete out[k].n; }
  return out; }
CMDS.pegada_medir={cheat:1,d:'pegada_medir · % da pele de cada dedo dentro da arma e folga até a superfície',f:()=>{ const o={R:gfMeasure('R'),L:gfMeasure('L')}; console.log(JSON.stringify(o)); cprint(JSON.stringify(o)); }};

/* cozimento (ferramenta de teste): uma mão por chamada, para não travar a página */
function gfBakeStart(id){ const s=curSlot(); if(!s||s.id!==id||!gunModel) return 'sem arma';
  const A=gripAuto(id); RIG.root.visible=true; RIG.s=0.85; RIG.root.scale.setScalar(RIG.s); const sh=RIG_SHOULDER; RIG.root.position.set(sh[0],sh[1]-1.4453*RIG.s,sh[2]-0.104*RIG.s); RIG.root.updateMatrixWorld(true); gunHolder.updateMatrixWorld(true);
  const G=gunModel.userData.vmp; GF.bk={id,A,trig:A.R.trig&&G.trig?new THREE.Vector3(G.trig.c.x,G.trig.c.y-0.002,G.trig.min.z+0.002):null,info:{}}; return 'ok'; }
function gfBakeSide(S){ const B=GF.bk; const spec=B.A[S]; if(!spec) return S+':-'; const sd=RIG.sides[S]; const ms=gunMeshes();
  RIG.root.updateMatrixWorld(true); gunHolder.updateMatrixWorld(true);
  rigPoseHand(sd,{p:spec.p,q:handQ(spec.f,spec.b),c:HC.open},gunHolder.matrixWorld); const ratio=gfRatio(sd);
  const inf=B.info[S]={};
  // mão do gatilho: sobe/avança no cabo até a polpa do indicador alcançar o gatilho
  if(S==='R'&&B.trig&&spec.top&&spec.bot){ const up=SV3a(spec.top).sub(SV3a(spec.bot)).normalize(), fw=new THREE.Vector3(0,0,-1).addScaledVector(up,-up.z).normalize(); const T=B.trig.clone().applyMatrix4(gunHolder.matrixWorld);
    const q=handQ(spec.f,spec.b), p0=SV3a(spec.p); let bst=null; const tl0=()=>sd.fingers.index[1].getWorldPosition(_gfv[0]).distanceTo(sd.fingers.index[2].getWorldPosition(_gfv[1]))*0.85;
    for(const du of [-0.006,0,0.008,0.016,0.024,0.032,0.04,0.048,0.055]) for(const dv of [-0.012,0,0.01,0.02,0.03]){ const p=p0.clone().addScaledVector(up,du).addScaledVector(fw,dv); let md=1e9;
      for(let s1=0.2;s1<=1.4;s1+=0.1) for(const sp of [0.6,1,1.4]) for(const iA of [-0.3,0,0.3]){ const c=JSON.parse(JSON.stringify(HC.open)); c.index=[s1,Math.min(1.65,s1*sp),Math.min(1.2,s1*sp*0.65)]; c.iA=iA; rigPoseHand(sd,{p,q,c},gunHolder.matrixWorld); const pts=gfPts(sd.fingers.index,tl0()); md=Math.min(md,pts[2].clone().lerp(pts[3],0.6).distanceTo(T)); }
      const sc=Math.abs(md-0.0115)+Math.hypot(du,dv)*0.25; if(!bst||sc<bst.sc) bst={sc,du,dv,md}; }
    spec.p=p0.addScaledVector(up,bst.du).addScaledVector(fw,bst.dv).toArray(); inf.trigFit={du:bst.du,dv:bst.dv,md:+bst.md.toFixed(4)}; }
  inf.ray=+gfPalm(spec,ms,ratio,S).toFixed(4);
  const near=gfNear(ms,V3(spec.p).applyMatrix4(gunHolder.matrixWorld),0.25);
  inf.palm=gfPalmMesh(S,spec,near).d;
  const fr=gripFrame(spec); const shapeR={index:[1,1.05,0.7],middle:[1,1.1,0.75],ring:[1,1.12,0.78],pinky:[1,1.1,0.75],thumb:[0.8,0.6,0.45]};
  const thumb=S==='R'?(spec.pistol?[0.55,0.4,0.3]:[0.8,0.55,0.4]):(spec.pistol?[0.2,0.12,0.08]:(spec.sup?[0.95,0.7,0.5]:[0.45,0.3,0.2]));
  spec.c=gfSolveHand(sd,fr,shapeR,ms,S==='R'?B.trig:null,thumb);
  B.fr=B.fr||{}; B.fr[S]={fr,near}; inf.fing={}; return S+':ok'; }
function gfBakeFinger(S,f){ const B=GF.bk; const spec=B.A[S]; if(!spec) return '-'; const {fr,near}=B.fr[S]; RIG.root.updateMatrixWorld(true); gunHolder.updateMatrixWorld(true);
  const r=gfRefine(S,fr,spec.c,near,[f]); spec.c=r.c; B.info[S].fing[f]=r.log[f]; return S+f; }
function gfBakeEnd(){ const B=GF.bk; const r=n=>Array.isArray(n)?n.map(v=>+(+v).toFixed(4)):n; const pack=h=>h&&({p:r(h.p),f:r(h.f),b:r(h.b),c:h.c});
  const out={R:pack(B.A.R),L:pack(B.A.L)}; GRIP5_BAKE[B.id]=out; delete GRIPF[B.id]; return out; }
