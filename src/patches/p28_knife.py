P=[("""function kfSample(keys,k,out){ let i=0; while(i<keys.length-2&&k>keys[i+1][0]) i++; const [t0,a]=keys[i], [t1,b]=keys[i+1]; const e=smooth(clamp((k-t0)/Math.max(1e-4,t1-t0),0,1)); for(const f of KF_FIELDS) out[f]=lerp(a[f]||0,b[f]||0,e); }""",
"""/* v9: interpolação Hermite (Catmull-Rom) entre as poses — a mão passa pelas chaves sem parar em cada uma, como no CS */
function kfSample(keys,k,out){ let i=0; while(i<keys.length-2&&k>keys[i+1][0]) i++; const [t0,a]=keys[i], [t1,b]=keys[i+1]; const pa=keys[i-1], pb=keys[i+2];
  const h=Math.max(1e-4,t1-t0), u=clamp((k-t0)/h,0,1), u2=u*u, u3=u2*u, h00=2*u3-3*u2+1, h10=u3-2*u2+u, h01=-2*u3+3*u2, h11=u3-u2;
  for(const f of KF_FIELDS){ const A=a[f]||0, B=b[f]||0; const mA=pa?(B-(pa[1][f]||0))/Math.max(1e-4,t1-pa[0])*h*0.8:0, mB=pb?((pb[1][f]||0)-A)/Math.max(1e-4,pb[0]-t0)*h*0.8:0; out[f]=h00*A+h10*mA+h01*B+h11*mB; } }"""),
("""  else if(act==='slash'){ const a=Math.sin(clamp(k*1.3,0,1)*KF_PI); const s=clamp(k*1.6,0,1); out.x=0.12-s*0.3; out.y=0.04*a; out.z=-0.16*a; out.rz=-0.9+s*1.6; out.ry=0.3-s*0.9; out.rx=-0.2*a; }""",
"""  else if(act==='slash'){ const wind=smooth(clamp(k/0.16,0,1)), sw=clamp((k-0.1)/0.28,0,1), e=1-Math.pow(1-sw,3), arc=Math.sin(sw*KF_PI), rec=smooth(clamp((k-0.48)/0.52,0,1)), hold=1-rec;
    out.x=(0.1+0.04*wind-e*0.34)*hold; out.y=(0.03*wind+0.045*arc)*hold; out.z=(-0.17*arc-0.03*wind)*(1-rec*0.6); out.rz=(-0.75-0.25*wind+e*1.65)*hold; out.ry=(0.28+0.12*wind-e*1.0)*hold; out.rx=-0.22*arc+0.06*wind*hold; out.fl=-0.25*arc; }""")]
