P=[("""function loft(rings,N,o){
  o=o||{}; const pos=[],uv=[],idx=[]; const R=rings.length;""",
"""/* v9: modelos mais detalhados — o dobro de lados, anéis intermediários suavizados (Catmull-Rom) e normais suaves, sem facetas */
function loftSmooth(rings){ if(rings.length<3) return rings; const out=[]; const g=(i)=>rings[Math.max(0,Math.min(rings.length-1,i))];
  for(let i=0;i<rings.length-1;i++){ out.push(rings[i]); const p0=g(i-1),p1=g(i),p2=g(i+1),p3=g(i+2); const m=[]; for(let f=0;f<7;f++){ const a=p0[f]||0,b=p1[f]||0,c=p2[f]||0,d=p3[f]||0; m.push(f===6?((b||2)+(c||2))/2:0.5*(2*b+(-a+c)*0.5+(2*a-5*b+4*c-d)*0.25+(-a+3*b-3*c+d)*0.125)); } m[0]=(p1[0]+p2[0])/2; out.push(m); }
  out.push(rings[rings.length-1]); return out; }
function loft(rings,N,o){
  o=o||{}; rings=loftSmooth(rings); N=Math.max(16,N*2); const pos=[],uv=[],idx=[]; const R=rings.length;"""),
("""  if(o.top) cap(0,true); if(o.bot) cap(R-1,false);
  let g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx);
  g=g.toNonIndexed(); g.computeVertexNormals(); return g;""",
"""  if(o.top) cap(0,true); if(o.bot) cap(R-1,false);
  let g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx);
  g.computeVertexNormals(); const nn=g.attributes.normal; for(let r=0;r<R;r++){ const a=r*(N+1), b=a+N; const x=nn.getX(a)+nn.getX(b), y=nn.getY(a)+nn.getY(b), z=nn.getZ(a)+nn.getZ(b), l=Math.hypot(x,y,z)||1; nn.setXYZ(a,x/l,y/l,z/l); nn.setXYZ(b,x/l,y/l,z/l); } return g;"""),
("""  g=g||new THREE.SphereGeometry(1,14,12); sc=sc||1; const p=g.attributes.position;""",
"""  const own=!g; g=g||new THREE.SphereGeometry(1,32,26); sc=sc||1; const p=g.attributes.position;"""),
("""    if(y<-0.75&&z>0.2) { z+=0.06; y-=0.02; }
    p.setXYZ(i,""","""    if(y<-0.75&&z>0.2) { z+=0.06; y-=0.02; }
    if(z>0.7&&Math.abs(x)<0.32&&y>-0.5&&y<-0.28){ const k=1-Math.abs(y+0.39)/0.11; z+=0.035*k*(1-Math.abs(x)/0.32); }   // v9: lábios
    if(z>0.5&&Math.abs(x)<0.6&&y>0.3&&y<0.5) z+=0.02;   // v9: testa/sobrancelha mais marcada
    if(Math.abs(x)>0.6&&z>0&&z<0.6&&y>-0.55&&y<-0.1) x*=0.97;   // v9: bochecha funda
    p.setXYZ(i,"""),
("""    p.setXYZ(i,x*(fem?0.08:0.085)*sc,y*0.112*sc,z*0.098*sc); }
  const n=g.toNonIndexed(); n.computeVertexNormals(); return n;""",
"""    p.setXYZ(i,x*(fem?0.08:0.085)*sc,y*0.112*sc,z*0.098*sc); }
  if(own){ g.computeVertexNormals(); return g; } const n=g.toNonIndexed(); n.computeVertexNormals(); return n;"""),
("""  const La=o=>new THREE.MeshLambertMaterial(Object.assign({side:THREE.DoubleSide},o)), Ph=o=>new THREE.MeshPhongMaterial(Object.assign({side:THREE.DoubleSide},o));""",
"""  /* v9: tecido e pele com relevo (bump a partir da própria textura pintada): costuras, dobras e bolsos saltam na luz */
  const La=o=>{ const m=new THREE.MeshPhongMaterial(Object.assign({side:THREE.DoubleSide,shininess:5,specular:0x0e0e0e},o)); if(o.map){ m.bumpMap=o.map; m.bumpScale=0.012; } return m; }, Ph=o=>{ const m=new THREE.MeshPhongMaterial(Object.assign({side:THREE.DoubleSide},o)); if(o.map){ m.bumpMap=o.map; m.bumpScale=0.01; } return m; };""")]
