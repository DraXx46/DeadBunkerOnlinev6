/* ================= v9 · GRAMA DENSA =================
   Folhas de grama de verdade (instanciadas) em volta de cada tufo de grama que o mapa já tem: hospício, fazenda,
   Tranzitch, cidade e o barro do bunker. Cada pedaço do mapa vira uma malha só (descarte por câmera funciona) e
   o vento balança as pontas no shader. Opção em Configurações › Gráficos avançados (desligada no modo batata). */
const GRM={per:{grass:64,dry:28},rad:1.5,minR:.9,done:0,meshes:[],mat:null,matDry:null,base:null,t:0,on:null,off:false};
if(CFG.grass===undefined) CFG.grass=true;
try{ CFG_DEF.grass=true; }catch(e){}
function grmGeo(){ // folha afinando, com uma dobra no meio (5 vértices, 3 triângulos); cor mais escura na base
  const g=new THREE.BufferGeometry(); const P=[-.5,0,0, .5,0,0, -.32,.55,.02, .32,.55,.02, 0,1,.09], C=[.55,.55,.55, .55,.55,.55, .9,.9,.9, .9,.9,.9, 1.2,1.2,1.12];
  g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(C,3)); g.setIndex([0,1,2, 1,3,2, 2,3,4]); g.computeVertexNormals();
  const n=g.attributes.normal; for(let i=0;i<n.count;i++) n.setXYZ(i,0,1,0.25);   // normal para cima: luz parecida com a do chão, sem folhas pretas de costas
  return g; }
function grmMat(dry){ const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true,side:THREE.DoubleSide});
  m.onBeforeCompile=sh=>{ sh.uniforms.uGT={value:0}; m.userData.sh=sh;
    sh.vertexShader='uniform float uGT;\n'+sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
      #ifdef USE_INSTANCING
      vec3 ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);
      float sw=sin(uGT*1.7+ip.x*.35+ip.z*.27)*.6+sin(uGT*3.1+ip.x*1.3-ip.z*.9)*.25;
      float k=position.y*position.y; transformed.x+=sw*.16*k; transformed.z+=sw*.09*k;
      #endif`); };
  m.customProgramCacheKey=()=>'grm'+(dry?1:0); return m; }
const GRM_COLS={grass:[0x4a5a28,0x3a4a22,0x62652f,0x55492a,0x77703c,0x46582c],dry:[0x6b5a36,0x7a6a40,0x5c4a2c,0x8a7a4a,0x4a3f22]};
function grmBuild(){ if(GRM.done>=VEG.chunks.length) return; // novos pedaços (a cidade e o Tranzitch podem montar depois)
  const M=vegMats(); if(!GRM.base){ GRM.base=grmGeo(); GRM.mat=grmMat(false); GRM.matDry=grmMat(true); } const base=GRM.base;
  const q=CFG.quality<0.85?0.45:CFG.autoRes?0.75:1; const list=VEG.chunks.slice(GRM.done); GRM.done=VEG.chunks.length;
  const d=new THREE.Object3D(), c=new THREE.Color();
  for(const ch of list){ const kind=ch.material===M.grass?'grass':ch.material===M.dry?'dry':null; if(!kind||!ch.parent) continue;
    const pa=ch.geometry.attributes.position, tufts=pa.count/12|0; if(!tufts) continue;
    const per=Math.round(GRM.per[kind]*q), n=tufts*per, im=new THREE.InstancedMesh(base.clone(),kind==='grass'?GRM.mat:GRM.matDry,n);
    let k=0, mnx=1e9,mnz=1e9,mxx=-1e9,mxz=-1e9,y0=0;
    for(let t=0;t<tufts;t++){ const i=t*12; const bx=(pa.getX(i)+pa.getX(i+1))/2, bz=(pa.getZ(i)+pa.getZ(i+1))/2, by=pa.getY(i)+0.02;
      const w=Math.hypot(pa.getX(i+1)-pa.getX(i),pa.getZ(i+1)-pa.getZ(i)), r=Math.max(GRM.minR,w*GRM.rad), hh=Math.max(.18,(pa.getY(i+2)-pa.getY(i))*.62);
      for(let j=0;j<per;j++){ const a=Math.random()*6.283, rr=Math.sqrt(Math.random())*r, x=bx+Math.cos(a)*rr, z=bz+Math.sin(a)*rr;
        const h=hh*(.45+Math.random()*Math.random()*1.25)*(1-rr/r*.35);
        d.position.set(x,by,z); d.rotation.set((Math.random()-.5)*.55,Math.random()*6.283,(Math.random()-.5)*.55); d.scale.set(.05+Math.random()*.05,h,1); d.updateMatrix(); im.setMatrixAt(k,d.matrix);
        const L=GRM_COLS[kind]; c.setHex(L[(Math.random()*L.length)|0]).multiplyScalar(.75+Math.random()*.5); im.setColorAt(k,c); k++;
        if(x<mnx) mnx=x; if(x>mxx) mxx=x; if(z<mnz) mnz=z; if(z>mxz) mxz=z; y0=by; } }
    im.count=k; im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true;
    im.geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3((mnx+mxx)/2,y0+.5,(mnz+mxz)/2),Math.hypot(mxx-mnx,mxz-mnz)/2+1.5);   // descarte por câmera do pedaço inteiro
    im.position.copy(ch.position); im.quaternion.copy(ch.quaternion); im.scale.copy(ch.scale); im.receiveShadow=false; im.castShadow=false; im.userData.grm=1;
    ch.parent.add(im); GRM.meshes.push(im); }
  grmApply(); }
function grmApply(){ const on=!!CFG.grass&&!CFG.potato; GRM.on=on; for(const m of GRM.meshes) m.visible=on; }
v9On('always',dt=>{ if(GRM.off) return; if(GRM.done<VEG.chunks.length){ try{ grmBuild(); }catch(e){ console.warn('[v9] grama',e); GRM.off=true; } return; }
  if(GRM.on!==(!!CFG.grass&&!CFG.potato)) grmApply(); if(!GRM.on) return;
  GRM.t+=dt||0.016; for(const m of [GRM.mat,GRM.matDry]) if(m&&m.userData.sh) m.userData.sh.uniforms.uGT.value=GRM.t; });
/* opção nas configurações */
(function(){ const ref=document.querySelector('#settings .sw[data-k="hdTex"]'); if(!ref) return;
  const b=v9El('button','sw','<span>Grama densa (folhas de grama balançando com o vento nas áreas abertas)</span><i></i>'); b.type='button'; b.setAttribute('role','switch'); b.dataset.k='grass';
  ref.after(b); const sync=()=>b.setAttribute('aria-checked',CFG.grass?'true':'false'); sync();
  b.addEventListener('click',()=>{ try{ cfgSet('grass',!CFG.grass); }catch(e){ CFG.grass=!CFG.grass; } sync(); grmApply(); }); })();
CMDS.grama={d:'grama 0/1 · liga ou desliga a grama densa · grama refaz [folhas] [raio]',f:a=>{ if(a[0]==='refaz'){ for(const m of GRM.meshes){ if(m.parent) m.parent.remove(m); m.geometry.dispose(); } GRM.meshes=[]; GRM.done=0; if(a[1]) GRM.per.grass=+a[1]; if(a[2]) GRM.rad=+a[2]; return; } if(a[0]!=null) CFG.grass=a[0]!=='0'; grmApply(); try{ cprint('Grama densa: '+(CFG.grass?'ligada':'desligada')+' · '+GRM.meshes.length+' pedaços'); }catch(e){} }};
