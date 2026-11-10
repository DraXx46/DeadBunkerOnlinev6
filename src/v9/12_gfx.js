/* ================= v9 · GRÁFICOS: iluminação realista, sombras da lanterna, texturas HD, desfoque de movimento, bloom,
   nitidez, granulação e aberração cromática (um pós-processamento único e barato, só liga o que estiver marcado) ================= */
const PP={rt:null,accA:null,accB:null,q:null,mat:null,cam:null,scn:null,lastYaw:0,lastPitch:0,w:0,h:0,t:0};
function v9PostOn(){ return !!(CFG.mblur||CFG.bloom||CFG.sharp||CFG.grain||CFG.chroma)&&!CFG.potato; }
function ppEnsure(){ const sz=renderer.getDrawingBufferSize(new THREE.Vector2()); const w=sz.x|0, h=sz.y|0;
  if(PP.rt&&PP.w===w&&PP.h===h) return; PP.w=w; PP.h=h; for(const r of [PP.rt,PP.accA,PP.accB]) if(r) r.dispose();
  const o={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat};
  PP.rt=new THREE.WebGLRenderTarget(w,h,Object.assign({depthBuffer:true},o)); PP.accA=new THREE.WebGLRenderTarget(w,h,o); PP.accB=new THREE.WebGLRenderTarget(w,h,o);
  if(!PP.mat){ PP.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1); PP.scn=new THREE.Scene();
    PP.blend=new THREE.ShaderMaterial({uniforms:{tCur:{value:null},tPrev:{value:null},uW:{value:0}},depthTest:false,depthWrite:false,
      vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader:'uniform sampler2D tCur; uniform sampler2D tPrev; uniform float uW; varying vec2 vUv; void main(){ vec4 c=texture2D(tCur,vUv); vec4 p=texture2D(tPrev,vUv); gl_FragColor=vec4(mix(c.rgb,p.rgb,uW),1.); }'});
    PP.mat=new THREE.ShaderMaterial({uniforms:{tCol:{value:null},uRes:{value:new THREE.Vector2()},uT:{value:0},uBloom:{value:0},uSharp:{value:0},uGrain:{value:0},uChroma:{value:0}},depthTest:false,depthWrite:false,
      vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader:`uniform sampler2D tCol; uniform vec2 uRes; uniform float uT,uBloom,uSharp,uGrain,uChroma; varying vec2 vUv;
        float rnd(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
        void main(){ vec2 px=1./uRes; vec2 d=vUv-.5; vec3 c;
          if(uChroma>0.){ float k=dot(d,d)*uChroma*0.012; c=vec3(texture2D(tCol,vUv+d*k).r,texture2D(tCol,vUv).g,texture2D(tCol,vUv-d*k).b); } else c=texture2D(tCol,vUv).rgb;
          if(uSharp>0.){ vec3 n=texture2D(tCol,vUv+vec2(px.x,0.)).rgb+texture2D(tCol,vUv-vec2(px.x,0.)).rgb+texture2D(tCol,vUv+vec2(0.,px.y)).rgb+texture2D(tCol,vUv-vec2(0.,px.y)).rgb; c=c+(c-n*.25)*.55*uSharp; }
          if(uBloom>0.){ vec3 b=vec3(0.); float tw=0.; for(int i=-3;i<=3;i++) for(int j=-3;j<=3;j++){ vec2 o=vec2(float(i),float(j))*px*3.5; vec3 s=texture2D(tCol,vUv+o).rgb; float l=max(max(s.r,s.g),s.b); float w=1./(1.+float(i*i+j*j)*.25); b+=max(vec3(0.),s-vec3(.62))*w*smoothstep(.55,1.,l); tw+=w; } c+=b/tw*2.6*uBloom; }
          if(uGrain>0.){ c+= (rnd(vUv*uRes+fract(uT)*91.)-.5)*.07*uGrain; }
          gl_FragColor=vec4(clamp(c,0.,1.),1.); }`});
    PP.q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),PP.mat); PP.q.frustumCulled=false; PP.scn.add(PP.q); } }
function v9RenderPost(dt){ ppEnsure(); PP.t+=dt||0.016;
  renderer.setRenderTarget(PP.rt); renderer.clear(); renderer.render(scene,camera);
  let src=PP.rt.texture;
  if(CFG.mblur){ // desfoque proporcional à velocidade de giro da câmera (e um pouco ao correr)
    const dy=Math.abs(angLerp(PP.lastYaw,P.yaw,1)-PP.lastYaw)+Math.abs(P.pitch-PP.lastPitch); PP.lastYaw=P.yaw; PP.lastPitch=P.pitch;
    const sp=dy/Math.max(0.004,dt||0.016); const w=clamp((sp-0.6)*0.09+(P.sprinting?0.12:0),0,0.72)*CFG.mblurAmt*(G.state==='playing'?1:0.4);
    PP.q.material=PP.blend; PP.blend.uniforms.tCur.value=PP.rt.texture; PP.blend.uniforms.tPrev.value=PP.accA.texture; PP.blend.uniforms.uW.value=w;
    renderer.setRenderTarget(PP.accB); renderer.render(PP.scn,PP.cam); const t=PP.accA; PP.accA=PP.accB; PP.accB=t; src=PP.accA.texture; }
  PP.q.material=PP.mat; const U=PP.mat.uniforms; U.tCol.value=src; U.uRes.value.set(PP.w,PP.h); U.uT.value=PP.t; U.uBloom.value=CFG.bloom?1:0; U.uSharp.value=CFG.sharp?1:0; U.uGrain.value=CFG.grain?1:0; U.uChroma.value=CFG.chroma?1:0;
  renderer.setRenderTarget(null); renderer.render(PP.scn,PP.cam); }
/* iluminação realista, sombras e texturas HD: aplicados quando a opção muda e quando o mapa é montado */
const GFX={tone:null,shadow:null,hd:null};
function v9ApplyGfx(force){
  const tone=!!CFG.realLight&&!CFG.potato; if(force||tone!==GFX.tone){ GFX.tone=tone; renderer.toneMapping=tone?THREE.ACESFilmicToneMapping:THREE.NoToneMapping; renderer.toneMappingExposure=tone?1.55:1; v9MatsDirty(); }
  const sh=!!CFG.flShadow&&!CFG.potato; if(force||sh!==GFX.shadow){ GFX.shadow=sh; renderer.shadowMap.enabled=sh; renderer.shadowMap.type=THREE.PCFSoftShadowMap; flashL.castShadow=sh; flashL.shadow.mapSize.set(1024,1024); flashL.shadow.bias=-0.0008; flashL.shadow.camera.near=0.2; flashL.shadow.camera.far=30;
    scene.traverse(o=>{ if(o.isMesh||o.isSkinnedMesh){ o.receiveShadow=sh; o.castShadow=sh&&!(o.material&&o.material.transparent); } }); v9MatsDirty(); }
  const hd=!!CFG.hdTex; if(force||hd!==GFX.hd){ GFX.hd=hd; const an=hd?renderer.capabilities.getMaxAnisotropy():1; const seen=new Set();
    scene.traverse(o=>{ const ms=o.material?[].concat(o.material):[]; for(const m of ms) for(const k of ['map','normalMap','emissiveMap','roughnessMap']){ const t=m[k]; if(t&&!seen.has(t)){ seen.add(t); t.anisotropy=an; t.needsUpdate=true; } } }); } }
function v9MatsDirty(){ scene.traverse(o=>{ const ms=o.material?[].concat(o.material):[]; for(const m of ms) m.needsUpdate=true; }); }
const _v9applyCfg=applyCfg;
applyCfg=function(path){ _v9applyCfg(path); try{ if(!path||/realLight|flShadow|hdTex|potato/.test(path)) v9ApplyGfx(!path); }catch(e){ console.warn('[Bunker v9] gráficos',e); } };
/* zumbis novos também projetam sombra quando a opção está ligada */
v9On('always',()=>{ if(!GFX.shadow) return; for(const z of zlist()) if(z.root&&!z._sh){ z._sh=true; z.root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); } });
