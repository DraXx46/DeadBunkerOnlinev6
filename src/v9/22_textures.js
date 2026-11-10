/* ================= v9 · TEXTURAS DO PACOTE DE TERROR E MANGAS EM PRIMEIRA PESSOA =================
   1) Troca as texturas desenhadas no código pelas fotos do pacote "SBS Horror Texture Pack" (img/tex) onde elas encaixam:
      tijolos do bunker, paredes, piso e teto do hospício, fachada, metais e ferrugem, chão de chapa do laboratório,
      e as manchas de sangue no chão e nas paredes.
   2) Mangas e braços em primeira pessoa: no lugar do cilindro liso, uma manga de tecido com dobras, barra na altura do
      punho, volume de músculo no antebraço e relevo de trama. */
const V9TEX={L:null,c:{}};
function v9Tex(name,cb){ const k=name; if(V9TEX.c[k]){ if(V9TEX.c[k].image) cb&&cb(V9TEX.c[k]); else (V9TEX.c[k].cbs=V9TEX.c[k].cbs||[]).push(cb); return V9TEX.c[k]; }
  if(!V9TEX.L) V9TEX.L=new THREE.TextureLoader(); const t=V9TEX.L.load('img/tex/'+name,tt=>{ try{ cb&&cb(tt); (tt.cbs||[]).forEach(f=>f&&f(tt)); }catch(e){} },undefined,()=>{});
  t.wrapS=t.wrapT=THREE.RepeatWrapping; try{ t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); }catch(e){} V9TEX.c[k]=t; return t; }
function v9SetMap(mat,name,rep){ if(!mat) return; v9Tex(name,t=>{ const u=t.clone(); u.needsUpdate=true; const old=mat.map; if(rep) u.repeat.set(rep[0],rep[1]); else if(old&&old.repeat) u.repeat.copy(old.repeat); u.wrapS=u.wrapT=THREE.RepeatWrapping; mat.map=u; mat.needsUpdate=true; }); }
function v9ApplyHorrorTex(){
  try{
    v9SetMap(M.brick,'brick_01.jpg');
    v9SetMap(M.hwall,'wall_02.jpg');
    if(Array.isArray(M.hwallV)) M.hwallV.forEach((m,i)=>v9SetMap(m,['wall_02.jpg','wall_08.jpg','wall_09.jpg','wall_13.jpg','wall_14.jpg'][i%5]));
    v9SetMap(M.hfloor,'floor_12.jpg'); v9SetMap(M.hceil,'stone_11.jpg'); v9SetMap(M.ceil,'stone_01.jpg');
    v9SetMap(M.facade,'brick_11.jpg'); v9SetMap(M.metal,'metal_11.jpg'); v9SetMap(M.rust,'metal_14.jpg'); v9SetMap(M.sheet,'metal_06.jpg'); v9SetMap(M.tank,'metal_12.jpg');
    // cidade: estátua e ferro velho com textura de pedra e ferrugem
    if(typeof V9M!=='undefined'){ if(V9M.cityStone) v9SetMap(V9M.cityStone,'stone_11.jpg',[1,1]); if(V9M.cityRust) v9SetMap(V9M.cityRust,'metal_03.jpg',[1,1]); if(V9M.tzdRust) v9SetMap(V9M.tzdRust,'metal_14.jpg',[1,1]); if(V9M.tzdMetal) v9SetMap(V9M.tzdMetal,'metal_12.jpg',[1,1]); }
  }catch(e){ console.warn('[Bunker v9] texturas',e); } }
// as texturas novas entram assim que o mundo é montado (o mapa continua o mesmo, só a pele muda)
const _v9bw=buildWorld; buildWorld=function(){ const r=_v9bw.apply(this,arguments); v9ApplyHorrorTex(); return r; };
// manchas de sangue: as poças no chão e os respingos nas paredes usam as manchas do pacote
const STAINS=['stain_01.png','stain_02.png','stain_03.png'].map(n=>v9Tex(n));
const _v9bpool=bloodPool; bloodPool=function(x,z,size){ const r=_v9bpool.apply(this,arguments); try{ const d=decals[decals.length-1]; if(d&&STAINS[0].image){ const t=pick(STAINS); if(d.m.material.map!==t){ d.m.material.map=t; d.m.material.color.setHex(0xffffff); d.m.material.needsUpdate=true; } } }catch(e){} return r; };
const _v9wblood=v9WallBlood; v9WallBlood=function(p,nx,ny,nz){ const r=_v9wblood.apply(this,arguments); try{ if(V9BLOOD&&STAINS[0].image&&!V9BLOOD.v9s){ V9BLOOD.v9s=true; V9BLOOD.mats.forEach((m,i)=>{ m.map=STAINS[i%3]; m.color.setHex(0xffffff); m.needsUpdate=true; }); } }catch(e){} return r; };

/* ---- mangas ---- */
// trama do tecido (relevo) para a manga
const SLEEVE_BUMP=(()=>{ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d'); g.fillStyle='#808080'; g.fillRect(0,0,256,256);
  for(let y=0;y<256;y+=3){ g.fillStyle=`rgba(255,255,255,${0.08+Math.random()*0.06})`; g.fillRect(0,y,256,1); } for(let x=0;x<256;x+=3){ g.fillStyle=`rgba(0,0,0,${0.08+Math.random()*0.06})`; g.fillRect(x,0,1,256); }
  for(let i=0;i<40;i++){ g.strokeStyle=`rgba(0,0,0,${0.15+Math.random()*0.2})`; g.lineWidth=1+Math.random()*2; g.beginPath(); const y=Math.random()*256; g.moveTo(0,y); g.bezierCurveTo(80,y+rand(-14,14),170,y+rand(-14,14),256,y+rand(-8,8)); g.stroke(); }
  g.strokeStyle='rgba(0,0,0,.5)'; g.setLineDash([4,3]); g.lineWidth=1.5; g.beginPath(); g.moveTo(128,0); g.lineTo(128,256); g.stroke();   // costura
  const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(1,1); t.minFilter=THREE.LinearMipmapLinearFilter; return t; })();
const V9SLEEVE=new THREE.MeshPhongMaterial({color:0x4d5534,shininess:6,specular:0x111111,side:THREE.DoubleSide,bumpMap:SLEEVE_BUMP,bumpScale:0.003});
V9SLEEVE.skinning=false;
function v9SleeveSync(){ try{ V9SLEEVE.color.copy(VMSLEEVE.color); V9SLEEVE.map=VMSLEEVE.map||null; V9SLEEVE.needsUpdate=true; }catch(e){} }
const _v9rsm=rigSyncMats; rigSyncMats=function(){ _v9rsm(); v9SleeveSync(); };
/* manga torneada no eixo do osso (y=0 no cotovelo/ombro, y=len no punho/cotovelo), com dobras e barra */
function v9SleeveGeo(len,rTop,rBot,fore){
  const pts=[], N=26; for(let i=0;i<=N;i++){ const t=i/N, y=-0.012+t*(len+0.024);
    let r=rBot+(rTop-rBot)*t;
    if(fore){ r*=1+0.1*Math.exp(-Math.pow((t-0.3)/0.22,2)); if(t>0.86) r*=1+0.11*Math.sin((t-0.86)/0.14*Math.PI*0.5); }   // músculo do antebraço e barra dobrada no punho
    else { r*=1+0.06*Math.exp(-Math.pow((t-0.55)/0.3,2)); }
    pts.push(new THREE.Vector2(r,y)); }
  const g=new THREE.LatheGeometry(pts,28); const p=g.attributes.position;
  for(let i=0;i<p.count;i++){ const x=p.getX(i), y=p.getY(i), z=p.getZ(i), r=Math.hypot(x,z)||1, a=Math.atan2(x,z), t=y/len;
    // dobras: amassado perto do punho e do cotovelo, vincos em espiral ao longo da manga
    const bunch=fore?Math.max(Math.exp(-Math.pow((t-0.8)/0.12,2)),0.6*Math.exp(-Math.pow(t/0.15,2))):Math.exp(-Math.pow((t-0.92)/0.1,2));
    const fold=Math.sin(y*160+a*2)*0.5+Math.sin(a*5+y*60)*0.35+Math.sin(a*3-y*95)*0.25;
    const k=1+(0.035*bunch+0.012)*fold; p.setXYZ(i,x*k,y,z*k); }
  g.computeVertexNormals(); return g; }
