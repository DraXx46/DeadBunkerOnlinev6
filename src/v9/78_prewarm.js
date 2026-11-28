/* ================= v9 · AQUECIMENTO NA TELA DE CARREGAMENTO =================
   Enquanto a tela de carregamento cobre o jogo, monta e desenha escondido tudo o que costuma travar na primeira vez:
   · os modelos de todas as armas (comprar arma na parede, caixa misteriosa, afinador)
   · os efeitos das habilidades e ultimates de todos os personagens, explosões, faíscas, sangue, arcos elétricos
   · e manda para a placa de vídeo todas as texturas do mapa (máquinas, portas, caixa, carro, máquina do tempo…)
   Nada toca som, nada vai pela rede e nada mexe na partida: é só desenho, atrás da tela de carregamento. */
const PWM={key:null,q:[],i:0,rt:null,done:0,ms:0,tex:0,guns:0};
function pwmTexOf(m,out){ for(const k of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','aoMap','bumpMap','specularMap','lightMap']){ const t=m[k]; if(t&&t.isTexture&&!t.isCubeTexture&&!t.isRenderTargetTexture) out.add(t); } }
function pwmPlan(){ const Q=[];
  // 1) armas: o modelo da primeira pessoa de cada uma (as que dependem do Arsenal só quando ele já carregou)
  for(const id in WEAPONS){ const w=WEAPONS[id]; if(!w||w.sprite) continue; const key=id+'+L0'; if(vmCache[key]) continue; if(GUN_ASSET_MAP[id]&&!GUN_ASSETS[id]) continue; Q.push(['gun',id]); }
  Q.push(['gunsDraw']);
  // 2) efeitos: todos os tipos de partícula, bola de fogo, arco elétrico, anéis das habilidades de cada personagem
  Q.push(['fx']);
  // 3) texturas de tudo que está no mapa (inclusive o que ainda está escondido), em lotes
  Q.push(['texScan']);
  Q.push(['compile']);
  return Q; }
function pwmFront(d){ const f=new THREE.Vector3(); camera.getWorldDirection(f); f.y=0; if(f.lengthSq()<1e-4) f.set(0,0,-1); f.normalize(); return camera.position.clone().addScaledVector(f,d||3.5); }
function pwmStep(){ const it=PWM.q[PWM.i]; if(!it) return false; const t0=performance.now();
  try{
    if(it[0]==='gun'){ const id=it[1], key=id+'+L0'; if(!vmCache[key]){ vmCache[key]=buildGun(id,lvTier(0)); try{ gunGlow(vmCache[key],0); }catch(e){} PWM.guns++; }
 }
    else if(it[0]==='gunsDraw'){ // desenha uma vez, num alvo minúsculo, todas as armas da cache que ainda não estão na mão
      const g=new THREE.Group(); const used=gunModel; for(const k in vmCache){ const m=vmCache[k]; if(!m||m===used||m.parent) continue; g.add(m); }
      if(g.children.length){ if(!PWM.rt) PWM.rt=new THREE.WebGLRenderTarget(64,64); vmScene.add(g); const cam=vmCam.clone(); cam.position.set(0,0,2); cam.lookAt(0,0,0);
        try{ renderer.compile(vmScene,cam); renderer.setRenderTarget(PWM.rt); renderer.clear(); renderer.render(vmScene,cam); } finally{ renderer.setRenderTarget(null); vmScene.remove(g); for(const m of [...g.children]) g.remove(m); } } }
    else if(it[0]==='fx'){ const p=pwmFront(3.5), y=(typeof floorAt==='function'?floorAt(p.x,p.z):0)+1;
      for(const k in PM) try{ emit(k,p.x,y,p.z,2,0.5,0.25,0); }catch(e){}
      try{ fireball(p.x,y,p.z,0.4,0xff8a30); fireball(p.x,y,p.z,0.3,0x5af0ff); }catch(e){}
      try{ arcFx(new THREE.Vector3(p.x-0.4,y,p.z),new THREE.Vector3(p.x+0.4,y+0.3,p.z)); }catch(e){}
      try{ for(const c in ABFX_STYLE) abFxRing(p.x,p.z,ABFX_STYLE[c].col,1.2,0.35); }catch(e){}
      try{ if(typeof warmShaders==='function') warmShaders(); }catch(e){} }
    else if(it[0]==='texScan'){ const S=new Set(); const add=o=>{ const m=o.material; if(!m) return; if(Array.isArray(m)) m.forEach(x=>pwmTexOf(x,S)); else pwmTexOf(m,S); };
      scene.traverse(add); vmScene.traverse(add); for(const k in vmCache) vmCache[k].traverse(add);
      const L=[...S].filter(t=>t.image&&(t.image.complete!==false)&&(t.image.width||t.image.videoWidth||t.image.data)); for(let j=0;j<L.length;j+=24) PWM.q.splice(PWM.i+1+j/24,0,['tex',L.slice(j,j+24)]); }
    else if(it[0]==='tex'){ for(const t of it[1]){ try{ renderer.initTexture(t); PWM.tex++; }catch(e){} } }
    else if(it[0]==='compile'){ try{ renderer.compile(scene,camera); renderer.compile(vmScene,vmCam); }catch(e){} }
  }catch(e){ console.warn('[v9] aquecimento',it[0],e); }
  PWM.ms+=performance.now()-t0; PWM.i++; return true; }
// roda só com a tela de carregamento na frente e o mapa já montado; um passo por quadro (a barra continua andando)
v9On('always',()=>{ if(typeof MLD==='undefined'||!MLD.on||MLD.started) return; const key=MLD.t0+'|'+MLD.map; if(!(MAPS[MLD.map]&&CUR===MLD.map)) return;
  if(PWM.key!==key){ PWM.key=key; PWM.q=pwmPlan(); PWM.i=0; PWM.ms=0; PWM.tex=0; PWM.guns=0; }
  if(PWM.i<PWM.q.length){ const t=performance.now(); while(PWM.i<PWM.q.length&&performance.now()-t<12){ if(!pwmStep()) break; } if(PWM.i>=PWM.q.length) PWM.done++; } });
// a etapa "Aquecendo os gráficos" só termina quando o aquecimento acabou
{ const mr0=mldReal; mldReal=function(){ const r=mr0.apply(this,arguments); if(PWM.q.length&&PWM.i<PWM.q.length&&PWM.key===MLD.t0+'|'+MLD.map){ r.ready=false; r.p=Math.min(r.p,0.9); } return r; }; }
CMDS.aquecer={d:'aquecer · mostra o que foi pré-carregado na última tela de carregamento',f:()=>{ try{ cprint(`aquecimento: ${PWM.i}/${PWM.q.length} passos · ${PWM.guns} armas montadas · ${PWM.tex} texturas enviadas · ${PWM.ms.toFixed(0)} ms`); }catch(e){} }};
