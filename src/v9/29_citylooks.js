/* ================= v9 · CIDADE: CADA PRÉDIO COM CARA PRÓPRIA =================
   Delegacia, mercado, farmácia, armaria, bar e banco deixam de ser a mesma caixa com letreiro: cada um ganha fachada, letreiro,
   objetos na calçada, pintura interna e móveis do seu tipo. Tudo respeita portas, janelas, pontos de compra e de nascimento. */
const CL={anim:[],t:0,spots:{},used:{}};
const clM=(k,o)=>v9Mat('cl_'+k,o);
const clEm=(k,c,e)=>v9Mat('cl_'+k,{color:c,emissive:e==null?c:e,shininess:30});
const clBX=(g,w,h,d,m,x,y,z,ry)=>tzBx(g,w,h,d,m,x,y,z,ry);
const clCY=(g,rt,rb,h,m,x,y,z,seg,rx,rz)=>{ const c=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||10),m); c.position.set(x,y,z); if(rx) c.rotation.x=rx; if(rz) c.rotation.z=rz; g.add(c); return c; };
const clPL=(g,w,h,m,x,y,z,ry,rx)=>tzPl(g,w,h,m,x,y,z,rx||0,ry||0);
function clTex(w,h,fn){ return tex(w,h,fn); }
function clSignTex(txt,o){ o=o||{}; return clTex(Math.round((o.w||1024)/2),Math.round((o.h||192)/2),(c,w,h)=>{ if(o.bg){ c.fillStyle=o.bg; c.fillRect(0,0,w,h); } else c.clearRect(0,0,w,h);
  if(o.border){ c.strokeStyle=o.border; c.lineWidth=5; c.strokeRect(4,4,w-8,h-8); }
  c.font=`${o.weight||'bold'} ${(o.size||96)/2}px ${o.font||'"Stardos Stencil", Impact, sans-serif'}`; c.textAlign='center'; c.textBaseline='middle';
  { let sz=(o.size||96)/2; while(sz>10&&c.measureText(txt).width>w*0.9){ sz-=2; c.font=`${o.weight||'bold'} ${sz}px ${o.font||'"Stardos Stencil", Impact, sans-serif'}`; } }
  if(o.glow){ c.shadowColor=o.glow; c.shadowBlur=15; } c.fillStyle=o.fg||'#fff'; c.fillText(txt,w/2+(o.dx||0)/2,h/2+(o.dy||0)/2);
  if(o.sub){ c.shadowBlur=0; c.font=`bold ${(o.subSize||40)/2}px sans-serif`; c.fillStyle=o.subFg||o.fg||'#fff'; c.fillText(o.sub,w/2,h*0.82); }
  if(o.grime!==false){ c.globalCompositeOperation='source-atop'; for(let i=0;i<60;i++){ c.fillStyle=`rgba(20,12,6,${Math.random()*0.25})`; c.beginPath(); c.arc(Math.random()*w,Math.random()*h,Math.random()*20,0,6.28); c.fill(); } c.globalCompositeOperation='source-over'; } }); }
function clGrime(c,w,h,a){ for(let i=0;i<90;i++){ c.fillStyle=`rgba(${20+Math.random()*20|0},${12+Math.random()*12|0},6,${Math.random()*(a||0.18)})`; c.beginPath(); c.ellipse(Math.random()*w,Math.random()*h,Math.random()*60+10,Math.random()*30+6,Math.random()*3,0,6.28); c.fill(); }
  const g=c.createLinearGradient(0,h*0.55,0,h); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(20,12,6,.55)'); c.fillStyle=g; c.fillRect(0,0,w,h); }
/* fachadas e paredes internas desenhadas para cada tipo de prédio */
const CL_FACADE={
  CP:()=>clTex(256,256,(c,w,h)=>{ c.fillStyle='#c9ccc8'; c.fillRect(0,0,w,h); c.fillStyle='#1d3a7a'; c.fillRect(0,h*0.58,w,h*0.16); c.fillStyle='#e8eae6'; c.fillRect(0,h*0.74,w,h*0.04); for(let y=0;y<h;y+=32){ c.fillStyle='rgba(0,0,0,.06)'; c.fillRect(0,y,w,1); } clGrime(c,w,h); }),
  CM:()=>clTex(256,256,(c,w,h)=>{ c.fillStyle='#d8c69a'; c.fillRect(0,0,w,h); c.fillStyle='#b8261c'; c.fillRect(0,h*0.08,w,h*0.1); c.fillStyle='#e8c04a'; c.fillRect(0,h*0.18,w,h*0.03); clGrime(c,w,h,0.22); }),
  CF:()=>clTex(256,256,(c,w,h)=>{ c.fillStyle='#e6ece6'; c.fillRect(0,0,w,h); c.strokeStyle='#a8b4ac'; c.lineWidth=2; for(let y=0;y<=h;y+=32) { c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); } for(let x=0;x<=w;x+=32){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); } c.fillStyle='#1a8a4a'; c.fillRect(0,h*0.86,w,h*0.06); clGrime(c,w,h,0.2); }),
  CA:()=>clTex(256,256,(c,w,h)=>{ for(let x=0;x<w;x+=16){ const g=c.createLinearGradient(x,0,x+16,0); g.addColorStop(0,'#3a3f3a'); g.addColorStop(0.5,'#5a605a'); g.addColorStop(1,'#2a2e2a'); c.fillStyle=g; c.fillRect(x,0,16,h); }
    for(let i=0;i<14;i++){ c.fillStyle=`rgba(${110+Math.random()*40|0},${50+Math.random()*20|0},20,${0.2+Math.random()*0.35})`; c.beginPath(); c.ellipse(Math.random()*w,Math.random()*h,Math.random()*30+6,Math.random()*50+10,0,0,6.28); c.fill(); } clGrime(c,w,h,0.15); }),
  CB:()=>clTex(256,256,(c,w,h)=>{ for(let x=0;x<w;x+=32){ c.fillStyle=['#3a2414','#442a18','#32200f'][x/32%3]; c.fillRect(x,0,32,h); c.fillStyle='rgba(0,0,0,.35)'; c.fillRect(x,0,2,h); for(let k=0;k<6;k++){ c.fillStyle='rgba(0,0,0,.12)'; c.fillRect(x+4+Math.random()*24,Math.random()*h,1,40+Math.random()*60); } } clGrime(c,w,h,0.12); }),
  CK:()=>clTex(256,256,(c,w,h)=>{ c.fillStyle='#b8ae98'; c.fillRect(0,0,w,h); c.strokeStyle='#8a8270'; c.lineWidth=3; for(let y=0,i=0;y<h;y+=42,i++){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); for(let x=(i%2)*48;x<w;x+=96){ c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+42); c.stroke(); } } clGrime(c,w,h,0.22); })};
const CL_WALL={ // faixa interna (barrado) de cada prédio
  CP:{low:0x1d3a7a,up:0xd8d8d0}, CM:{low:0x6a6a62,up:0xe8e2cc}, CF:{low:0xe8f0ec,up:0xf0f4f0,tile:true}, CA:{low:0x2c3428,up:0x5a5a50}, CB:{low:0x3a2414,up:0x5a1e2a}, CK:{low:0x6a5a44,up:0xcfc6b0,marble:true}};
function clWallMat(id,part){ const w=CL_WALL[id]; return clM(id+part,{color:part==='low'?w.low:w.up,shininess:w.marble?70:w.tile?60:8,specular:w.marble||w.tile?0x444444:0x111111}); }

/* ---- utilidades de grade: células reservadas (portas, janelas, compras, nascimentos…) ---- */
function clReserved(){ const R=new Set(); const add=(x,z,r)=>{ r=r==null?1:r; for(let dx=-r;dx<=r;dx++) for(let dz=-r;dz<=r;dz++) R.add((x+dx)+','+(z+dz)); };
  const city=z=>z>=CZ0&&z<=CZ1;
  for(const w of V9_WB) if(city(w.cell[1])) add(w.cell[0],w.cell[1]);
  for(const k in PERK_BY) for(const sp of (PERK_BY[k].spots||[])) if(sp.cell&&city(sp.cell[1])) add(sp.cell[0],sp.cell[1]);
  for(const b of BOX.spots) for(const c of (b.cells||[])) if(city(c[1])) add(c[0],c[1]);
  for(const a of AF_SPOTS) for(const c of (a.cells||[])) if(city(c[1])) add(c[0],c[1]);
  for(const l of LEVER_SPOTS) if(city(l.z)) add(l.x,l.z); for(const a of AMMO_SPOTS) if(city(a.z)) add(a.x,a.z);
  for(const g of GSPAWN){ const x=Math.floor(g.x/S), z=Math.floor(g.z/S); if(city(z)) add(x,z,1); }
  for(const w of CITYWIN) add(w[0],w[1],1);
  for(const d of doors) for(const c of d.cells) if(city(c[1])) add(c[0],c[1],2);
  for(let z=CZ0;z<=CZ1;z++) for(let x=0;x<MW;x++){ const ch=grid[z][x]; if(ch!=='.'&&ch!=='#') add(x,z,1); }
  return R; }
// células junto à parede, livres, de um prédio: devolve {x,z,n:[nx,nz]} com n apontando para dentro da sala
const CL_DIV={CM:8,CP:38,CK:38};
function clInBack(s,c){ const d=CL_DIV[s.id]; if(d==null) return false; return s.side>0?c.x<d:c.x>d; }
function clWallCells(s,R){ const out=[];
  for(let r=s.r0+1;r<s.r1;r++) for(let c=s.x0+1;c<s.x1;c++){ const z=czr(r); if(grid[z][c]!=='.'||R.has(c+','+z)||propCell[z*MW+c]) continue;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) if(grid[z+dz]&&grid[z+dz][c+dx]==='#'){ const q={x:c,z,n:[-dx,-dz]}; q.room=clInBack(s,q)?s.id+'2':s.id; out.push(q); break; } }
  return out; }
function clTake(list,used,n,want){ // pega uma sequência de n células na mesma parede (mesma normal), ainda não usadas
  const key=c=>c.x+','+c.z; const ok=c=>!used.has(key(c));
  const cand=list.filter(c=>ok(c)&&(!want||want(c)));
  for(let i=cand.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [cand[i],cand[j]]=[cand[j],cand[i]]; }
  for(const c of cand){ const tx=c.n[1]!==0?1:0, tz=c.n[0]!==0?1:0; const run=[c];
    for(let k=1;k<n;k++){ const nx=c.x+tx*k, nz=c.z+tz*k; const d=list.find(q=>q.x===nx&&q.z===nz&&q.n[0]===c.n[0]&&q.n[1]===c.n[1]&&ok(q)); if(!d) break; run.push(d); }
    if(run.length>=n){ for(const q of run){ used.add(key(q)); for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) used.add((q.x+dx*(q.n[0]?1:0))+','+(q.z+dz*(q.n[1]?1:0))); } return run; } }
  return null; }
// coloca um móvel encostado na parede: builder recebe um grupo com origem no meio da sequência, chão em y=0, parede em z=-(S/2) e frente para +z
function clWallProp(run,builder,fd,coll){ const a=run[0], b=run[run.length-1]; const mx=(cx(a.x)+cx(b.x))/2, mz=(cx(a.z)+cx(b.z))/2; const n=a.n; const ry=Math.atan2(n[0],n[1]);
  const g=G3(mx,0,mz,ry); builder(g,run.length*S); bake(g);
  if(coll!==false){ const fw=run.length*S; const cxw=mx-n[0]*(S/2-fd/2), czw=mz-n[1]*(S/2-fd/2); if(n[0]) addPropBox(cxw,czw,fd/2,fw/2-0.05); else addPropBox(cxw,czw,fw/2-0.05,fd/2); }
  return g; }

/* ---- móveis e objetos (montados em blocos simples) ---- */
const CLP={
  shelf(g,w,cols){ const m=clM('shelfMetal',{color:0x6a6e70,shininess:40}); clBX(g,w-0.1,2.1,0.05,m,0,1.05,-0.95); clBX(g,0.05,2.1,0.6,m,-w/2+0.08,1.05,-0.7); clBX(g,0.05,2.1,0.6,m,w/2-0.08,1.05,-0.7);
    for(let y=0.15;y<2.1;y+=0.48){ clBX(g,w-0.12,0.04,0.6,m,0,y,-0.7); if(cols) for(let x=-w/2+0.25;x<w/2-0.2;x+=rand(0.14,0.3)){ if(Math.random()<0.18) continue; const hh=rand(0.12,0.34); clBX(g,rand(0.1,0.22),hh,rand(0.15,0.3),clM('prod'+(Math.random()*cols.length|0)+cols.join(''),{color:pick(cols),shininess:30}),x,y+0.02+hh/2,-0.72+rand(-0.08,0.08)); } } },
  counter(g,w,top,front){ clBX(g,w-0.1,1.0,0.7,clM('ctr'+front,{color:front,shininess:20}),0,0.5,-0.55); clBX(g,w,0.06,0.8,clM('ctrTop'+top,{color:top,shininess:70,specular:0x666666}),0,1.03,-0.55); },
  glass(){ return clM('glass',{color:0x9ab8c0,transparent:true,opacity:0.22,shininess:120,specular:0xffffff,depthWrite:false,side:THREE.DoubleSide}); },
  poster(g,x,y,z,w,h,draw,ry){ const t=clTex(256,Math.round(256*h/w),draw); const m=new THREE.MeshLambertMaterial({map:t}); clPL(g,w,h,m,x,y,z,ry||0); },
  crate(g,x,y,z,s,col){ const m=clM('crate'+col,{color:col,shininess:5}); clBX(g,s,s*0.8,s,m,x,y+s*0.4,z); clBX(g,s+0.02,0.04,s+0.02,clM('crateBand',{color:0x2a2018}),x,y+s*0.7,z); },
  chair(g,x,z,ry,col){ const c=G3(x,0,z,ry); const m=clM('chair'+col,{color:col,shininess:20}); clBX(c,0.42,0.05,0.42,m,0,0.45,0); clBX(c,0.42,0.45,0.04,m,0,0.7,-0.2); for(const [a,b] of [[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]]) clBX(c,0.035,0.45,0.035,m,a,0.22,b); g.add(c); return c; },
  table(g,x,z,r,col){ const m=clM('table'+col,{color:col,shininess:25}); clCY(g,r,r,0.05,m,x,0.74,z,18); clCY(g,0.05,0.05,0.72,m,x,0.37,z,8); clCY(g,0.25,0.3,0.04,m,x,0.02,z,12); },
  rifle(g,x,y,z,ry,s){ const r=G3(x,y,z,ry); const dk=clM('gunDark',{color:0x161616,shininess:50}), wd=clM('gunWood',{color:0x5a3418,shininess:20}); s=s||1;
    clBX(r,0.9*s,0.06*s,0.04,dk,0.1*s,0,0); clBX(r,0.32*s,0.1*s,0.045,wd,-0.5*s,-0.02*s,0); clBX(r,0.06*s,0.14*s,0.04,dk,0.0,-0.09*s,0); clBX(r,0.3*s,0.05*s,0.035,dk,0.15*s,0.07*s,0); g.add(r); return r; },
  bulbs(g,x0,x1,y,z,n,col){ const m=clEm('bulb'+col,col); for(let i=0;i<=n;i++){ const t=i/n, x=x0+(x1-x0)*t; const yy=y-Math.sin(t*Math.PI*3)*0.18; const b=new THREE.Mesh(new THREE.SphereGeometry(0.05,6,5),m); b.position.set(x,yy,z); g.add(b); }
    const w=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,Math.abs(x1-x0),4),clM('wire',{color:0x111111})); w.rotation.z=Math.PI/2; w.position.set((x0+x1)/2,y-0.09,z); g.add(w); },
  sandbags(g,x,z,len,ry,rows){ const s=G3(x,0,z,ry); const m=clM('sandbag',{color:0x7a6a4a,shininess:3}); rows=rows||3; for(let r=0;r<rows;r++) for(let k=0;k<len/0.55;k++){ const b=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.22,0.32),m); b.position.set(-len/2+0.27+k*0.55+(r%2)*0.27,0.11+r*0.21,0); b.scale.set(1,1,1+rand(-0.08,0.08)); b.rotation.y=rand(-0.06,0.06); s.add(b); } g.add(s); },
  cone(g,x,z){ clCY(g,0.02,0.16,0.5,clM('cone',{color:0xe0601a,shininess:30}),x,0.25,z,10); clCY(g,0.09,0.12,0.08,clM('coneW',{color:0xeeeeee}),x,0.28,z,10); clBX(g,0.36,0.03,0.36,clM('coneB',{color:0x1a1a1a}),x,0.015,z); },
  sawhorse(g,x,z,ry){ const s=G3(x,0,z,ry); const t=clTex(256,32,(c,w,h)=>{ for(let i=-2;i<12;i++){ c.fillStyle=i%2?'#f0f0f0':'#1d3a9a'; c.beginPath(); c.moveTo(i*28,0); c.lineTo(i*28+28,0); c.lineTo(i*28+12,h); c.lineTo(i*28-16,h); c.fill(); } });
    clBX(s,1.6,0.22,0.04,new THREE.MeshLambertMaterial({map:t}),0,0.85,0); for(const a of [-0.65,0.65]){ const l1=clBX(s,0.05,0.95,0.05,clM('sawLeg',{color:0x888888}),a,0.45,0.12); l1.rotation.x=0.25; const l2=clBX(s,0.05,0.95,0.05,clM('sawLeg',{color:0x888888}),a,0.45,-0.12); l2.rotation.x=-0.25; } g.add(s); }
};
/* carro de polícia (preto e branco, giroflex que pisca) */
function clPoliceCar(root,anim,x,z,ry){ const g=G3(x,0,z,ry); const blk=clM('pcBlack',{color:0x111214,shininess:90,specular:0x555555}), wht=clM('pcWhite',{color:0xe8e8e4,shininess:90,specular:0x555555}), gl=clM('pcGlass',{color:0x0a1014,shininess:120,specular:0x888888}), tire=clM('pcTire',{color:0x111111,shininess:5});
  clBX(g,1.8,0.55,4.4,blk,0,0.6,0); clBX(g,1.82,0.4,2.0,wht,0,0.62,-0.2); clBX(g,1.6,0.55,2.2,gl,0,1.12,-0.1); clBX(g,1.62,0.08,2.0,wht,0,1.42,-0.1); clBX(g,1.7,0.18,0.12,clM('pcBump',{color:0x222222}),0,0.45,2.22); clBX(g,1.7,0.18,0.12,clM('pcBump',{color:0x222222}),0,0.45,-2.22);
  const door=clSignTex('POLÍCIA',{w:512,h:128,bg:'#e8e8e4',fg:'#1d3a7a',size:80,grime:true}); clPL(g,1.4,0.32,new THREE.MeshLambertMaterial({map:door}),0.915,0.66,-0.2,Math.PI/2); clPL(g,1.4,0.32,new THREE.MeshLambertMaterial({map:door}),-0.915,0.66,-0.2,-Math.PI/2);
  for(const [wx,wz] of [[0.85,1.35],[-0.85,1.35],[0.85,-1.35],[-0.85,-1.35]]) clCY(g,0.34,0.34,0.24,tire,wx,0.34,wz,14,0,Math.PI/2);
  for(const sx of [0.55,-0.55]){ clBX(g,0.3,0.1,0.04,clEm('pcHead',0xfff0c0),sx,0.68,2.29); clBX(g,0.3,0.1,0.04,clEm('pcTail',0x8a0a0a),sx,0.68,-2.29); }
  clBX(g,1.2,0.1,0.32,clM('pcBarBase',{color:0x1a1a1a}),0,1.5,0.1); bake(g);
  const lb=G3(x,0,z,ry); const red=new THREE.MeshBasicMaterial({color:0xff1010}), blue=new THREE.MeshBasicMaterial({color:0x1040ff});
  const r=clBX(lb,0.55,0.12,0.28,red,-0.3,1.6,0.1), b=clBX(lb,0.55,0.12,0.28,blue,0.3,1.6,0.1); root.add(lb); anim.push({k:'flash',a:r,b,ma:red,mb:blue,ph:Math.random()*6});
  addPropBox(x,z,Math.abs(Math.sin(ry))*2.2+Math.abs(Math.cos(ry))*0.95,Math.abs(Math.cos(ry))*2.2+Math.abs(Math.sin(ry))*0.95); }

/* ---- cada prédio ---- */
function clShop(s,M3){ const side=s.side, frontW=side>0?(s.x1+1)*S:s.x0*S, zA=cx(czr(s.r0)), zB=cx(czr(s.r1)), zm=(zA+zB)/2, W=(s.r1-s.r0+1)*S, D=(s.x1-s.x0+1)*S;
  const ry=side>0?Math.PI/2:-Math.PI/2; const lxOf=r=>(cx(czr(r))-zm)*(side>0?-1:1);
  const F=G3(frontW,0,zm,ry);            // fachada (assada): +z = rua, x ao longo da frente
  const A=G3(frontW,0,zm,ry); MAPG.city.add(A);   // partes que piscam/animam
  const doorX=s.door.map(d=>lxOf(d[1])), winX=[lxOf(s.r0+2),lxOf(s.r1-2)];
  const clearAt=(x,hw)=>!doorX.some(d=>Math.abs(x-d)<hw+1.6)&&!winX.some(w=>Math.abs(x-w)<hw+1.3);
  const H=WH+0.65;
  // 1) revestimento da fachada só nas paredes cheias (portas e janelas ficam livres) + faixa de cima inteira
  const fT=CL_FACADE[s.id](); fT.wrapS=fT.wrapT=THREE.RepeatWrapping; const fM=new THREE.MeshLambertMaterial({map:fT});
  const fx=side>0?s.x1:s.x0;
  for(let r=s.r0;r<=s.r1;r++){ if(grid[czr(r)][fx]!=='#') continue; const m=clPL(F,S,2.95,fM,lxOf(r),1.475,0.03,0); m.material=fM; }
  { const band=new THREE.MeshLambertMaterial({map:fT.clone()}); band.map.repeat.set(W/4,0.35); band.map.needsUpdate=true; clPL(F,W,H-2.95+0.4,band,0,2.95+(H-2.95+0.4)/2-0.2,0.035,0); }
  clBX(F,W+0.3,0.18,0.5,clM('cornice'+s.id,{color:s.id==='CK'?0xa8a090:0x2a2622,shininess:10}),0,H+0.1,0.1);
  // 2) por dentro: barrado (faixa baixa) e parede de cima com a cor do lugar, só nas paredes cheias
  { const g=new THREE.Group(); const zr0=czr(s.r0), zr1=czr(s.r1);
    for(let r=s.r0;r<=s.r1;r++) for(let c=s.x0;c<=s.x1;c++){ const z=czr(r); if(grid[z][c]!=='#') continue;
      for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ const zz=z+dz, xx=c+dx; if(!grid[zz]||grid[zz][xx]!=='.'||xx<=s.x0||xx>=s.x1||zz<=zr0||zz>=zr1) continue;
        const px=cx(c)+dx*(S/2+0.03), pz=cx(z)+dz*(S/2+0.03), a=Math.atan2(dx,dz);
        tzPl(g,S,1.15,clWallMat(s.id,'low'),px,0.575,pz,0,a); tzPl(g,S,ROOM_CEIL-1.15,clWallMat(s.id,'up'),px,1.15+(ROOM_CEIL-1.15)/2,pz,0,a);
        tzBx(g,dx?0.04:S,0.06,dz?0.04:S,clM('trim'+s.id,{color:0x1a1612}),px,1.15,pz); } }
    bake(g); }
  // 3) o tema
  const R=clReserved(); const wall=clWallCells(s,R); const used=new Set(); CL.used[s.id]=used; CL.wall=CL.wall||{}; CL.wall[s.id]=wall;
  const atWall=(n,fn,fd,want,coll,tag)=>{ const run=clTake(wall,used,n,want); if(run){ clWallProp(run,fn,fd,coll); if(tag) CL.spots[tag]={run,fd}; } return !!run; };
  const back=c=>(side>0?c.x<=s.x0+2:c.x>=s.x1-2), front=c=>(side>0?c.x>=s.x1-2:c.x<=s.x0+2), sideW=c=>c.n[0]===0;
  const T=CL_THEME[s.id]; if(T) T({s,F,A,M3,W,D,H,side,zm,frontW,lxOf,clearAt,atWall,back,front,sideW,R,used,wall});
  bake(F);
  hangingBulb(cx((s.x0+s.x1)/2),cx(czr((s.r0+s.r1)/2)),s.id,'city');
  // prédios grandes: mais duas lâmpadas (frente e fundos) para dar para ver o que tem dentro
  for(const f of [0.22,0.78]) try{ hangingBulb(cx(Math.round(s.x0+(s.x1-s.x0)*f)),cx(czr(Math.round(s.r0+(s.r1-s.r0)*(f<0.5?0.3:0.7)))),s.id,'city'); }catch(e){} }

const CL_THEME={
  /* ---------- DELEGACIA ---------- */
  CP(o){ const {F,A,W,H,clearAt,atWall,back,sideW}=o;
    const sign=clSignTex('DELEGACIA DE POLÍCIA',{w:1024,h:200,bg:'#14306a',fg:'#ffffff',size:84,border:'#e8e8e8',sub:'POLÍCIA CIVIL · 14ª DP',subSize:30,dy:-14});
    clBX(F,W*0.62,1.0,0.22,clM('cpSignBox',{color:0x0e2050}),0,H-0.2,0.2); clPL(F,W*0.6,0.94,new THREE.MeshLambertMaterial({map:sign,emissive:0x0a1a40,emissiveMap:sign}),0,H-0.2,0.32,0);
    // brasão
    const badge=clTex(256,256,(c,w,h)=>{ c.clearRect(0,0,w,h); c.fillStyle='#c9a24a'; c.beginPath(); for(let i=0;i<10;i++){ const a=i/10*Math.PI*2-Math.PI/2, r=i%2?60:118; c.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r); } c.fill(); c.fillStyle='#14306a'; c.beginPath(); c.arc(w/2,h/2,48,0,6.28); c.fill(); c.fillStyle='#fff'; c.font='bold 30px sans-serif'; c.textAlign='center'; c.fillText('PC',w/2,h/2+10); });
    clPL(F,1.2,1.2,new THREE.MeshLambertMaterial({map:badge,transparent:true}),-W*0.31-0.9,H-0.2,0.33,0); clPL(F,1.2,1.2,new THREE.MeshLambertMaterial({map:badge,transparent:true}),W*0.31+0.9,H-0.2,0.33,0);
    // giroflex em cima da porta
    for(const dx of o.s.door.map(d=>o.lxOf(d[1])).slice(0,1)){ const x=dx+(o.lxOf(o.s.door[1][1])-dx)/2; clBX(F,2.4,0.14,0.5,clM('cpBar',{color:0x111111}),x,2.98,0.3);
      const red=new THREE.MeshBasicMaterial({color:0xff1010}), blue=new THREE.MeshBasicMaterial({color:0x1040ff}); const r=clBX(A,0.9,0.14,0.36,red,x-0.55,3.12,0.3), b=clBX(A,0.9,0.14,0.36,blue,x+0.55,3.12,0.3); CL.anim.push({k:'flash',a:r,b,ma:red,mb:blue,ph:0});
      // marquise da entrada
      clBX(F,4.4,0.12,1.6,clM('cpCanopy',{color:0x1d3a7a,shininess:30}),x,2.9,0.8); for(const px of [-2.05,2.05]) clCY(F,0.06,0.06,2.9,clM('steelPole',{color:0x8a8e90,shininess:60}),x+px,1.45,1.5,8); }
    // mastro com bandeira
    if(clearAt(W/2-1.4,0.5)){ const x=W/2-1.4; clCY(F,0.05,0.07,7,clM('steelPole',{color:0x8a8e90,shininess:60}),x,3.5,1.6,8); const fl=clTex(192,128,(c,w,h)=>{ c.fillStyle='#14306a'; c.fillRect(0,0,w,h); c.fillStyle='#c9a24a'; c.font='bold 30px sans-serif'; c.textAlign='center'; c.fillText('POLÍCIA',w/2,h/2+10); });
      const flag=new THREE.Mesh(new THREE.PlaneGeometry(1.5,1.0,8,1),new THREE.MeshLambertMaterial({map:fl,side:THREE.DoubleSide})); flag.position.set(x-0.78,6.4,1.6); A.add(flag); CL.anim.push({k:'flag',m:flag}); }
    // calçada: cavaletes, cones e sacos de areia
    for(const [x,z,r] of [[-W*0.18,2.2,0.1],[W*0.18,2.4,-0.12]]) if(clearAt(x,1)) CLP.sawhorse(F,x,z,r);
    for(let i=0;i<5;i++){ const x=rand(-W/2+1,W/2-1); if(clearAt(x,0.3)) CLP.cone(F,x,rand(1.4,2.6)); }
    if(clearAt(-W/2+2.2,1.4)) CLP.sandbags(F,-W/2+2.2,1.6,2.6,0,3);
    // viaturas paradas na rua
    const P=(lx,lz)=>[o.frontW+lz*o.side,o.zm+lx*(o.side>0?-1:1)];
    for(const [lx,lz,a] of [[-W*0.28,5.2,0.08],[W*0.25,5.6,-0.25]]){ const [wx,wz]=P(lx,lz); const gx=Math.floor(wx/S), gz=Math.floor(wz/S); if(grid[gz]&&grid[gz][gx]==='.') clPoliceCar(MAPG.city,CL.anim,wx,wz,o.side>0?Math.PI/2+a:-Math.PI/2+a); }
    // por dentro: balcão de atendimento com vidro, bancos de espera, cartazes de procurado
    atWall(3,(g,w)=>{ CLP.counter(g,w,0x6a6a66,0x1d3a7a); const gl=CLP.glass(); clPL(g,w,1.0,gl,0,1.56,-0.25,0); clBX(g,w,0.05,0.05,clM('steelPole',{color:0x8a8e90,shininess:60}),0,2.08,-0.25);
      clBX(g,0.5,0.35,0.06,clM('monitor',{color:0x111111,shininess:60}),-w/4,1.3,-0.7); clPL(g,0.44,0.28,clEm('screenBlue',0x0a2a5a,0x0a2a6a),-w/4,1.3,-0.665,0); },1.0,c=>!back(c),undefined,'cp_counter');
    atWall(2,(g,w)=>{ const m=clM('benchSeat',{color:0x3a4a6a,shininess:20}); for(let x=-w/2+0.4;x<w/2-0.3;x+=0.55){ clBX(g,0.48,0.06,0.45,m,x,0.46,-0.6); clBX(g,0.48,0.45,0.05,m,x,0.72,-0.82); } clBX(g,w-0.4,0.05,0.4,clM('steelPole',{color:0x8a8e90,shininess:60}),0,0.4,-0.6); },0.6,c=>!back(c));
    for(let i=0;i<3;i++) atWall(1,(g)=>{ for(let k=-1;k<=1;k++) CLP.poster(g,k*0.6,1.65+rand(-0.08,0.08),-0.93,0.5,0.66,(c,w,h)=>{ c.fillStyle='#e8dcc0'; c.fillRect(0,0,w,h); c.fillStyle='#1a1a1a'; c.font='bold 40px Impact'; c.textAlign='center'; c.fillText('PROCURADO',w/2,46); c.fillStyle='#3a3530'; c.beginPath(); c.arc(w/2,150,52,0,6.28); c.fill(); c.fillRect(w/2-70,200,140,90); c.fillStyle='#1a1a1a'; c.font='bold 22px sans-serif'; c.fillText('RECOMPENSA',w/2,h-36); clGrime(c,w,h,0.2); }); },0.1,null,false);
    // fundos: celas com grade, mesas com computadores, arquivos e armário de armas
    atWall(3,(g,w)=>{ const bar=clM('jailBar',{color:0x4a4e50,shininess:70,specular:0x777777}); const d=1.9; for(let x=-w/2+0.1;x<=w/2-0.05;x+=0.16) clCY(g,0.022,0.022,ROOM_CEIL-0.1,bar,x,(ROOM_CEIL-0.1)/2,-0.95+d,6);
      for(const y of [0.1,1.2,ROOM_CEIL-0.25]) clBX(g,w,0.06,0.06,bar,0,y,-0.95+d); for(const x of [-w/2+0.03,w/2-0.03]) clBX(g,0.06,ROOM_CEIL-0.1,d,bar,x,(ROOM_CEIL-0.1)/2,-0.95+d/2);
      clBX(g,1.9,0.4,0.75,clM('cot',{color:0x4a4a40}),-w/4,0.25,-0.5); clBX(g,1.8,0.1,0.7,clM('mattress',{color:0x8a8270}),-w/4,0.5,-0.5); clCY(g,0.22,0.18,0.42,clM('steelToilet',{color:0xa8acb0,shininess:90}),w/3,0.21,-0.6,12);
      const sg=clSignTex('CELA 2',{w:256,h:64,bg:'#d8d8d0',fg:'#14306a',size:44}); clPL(g,0.6,0.16,new THREE.MeshLambertMaterial({map:sg}),0,2.4,-0.94+d+0.03,0); },2.0,back);
    for(let i=0;i<2;i++) atWall(2,(g,w)=>{ const dk=clM('deskGray',{color:0x5a5e60,shininess:30}); clBX(g,w-0.6,0.05,0.8,dk,0,0.75,-0.5); clBX(g,0.05,0.75,0.75,dk,-w/2+0.35,0.37,-0.5); clBX(g,0.5,0.7,0.7,dk,w/2-0.6,0.36,-0.5);
      clBX(g,0.48,0.34,0.05,clM('monitor',{color:0x111111,shininess:60}),-0.3,1.0,-0.75); clPL(g,0.42,0.26,clEm('screenGreen',0x0a3a1a,0x0a4a1a),-0.3,1.0,-0.72,0); clBX(g,0.4,0.03,0.14,clM('kbd',{color:0x222222}),-0.3,0.79,-0.42);
      for(let k=0;k<4;k++) clBX(g,0.22,0.01,0.3,clM('paper',{color:0xe8e4d8}),rand(0,0.6),0.785+k*0.01,rand(-0.6,-0.3),rand(-0.4,0.4)); CLP.chair(g,-0.3,0.15,Math.PI,0x2a2a2a); },1.0,back);
    atWall(1,(g)=>{ const m=clM('fileCab',{color:0x6a7068,shininess:40}); for(const x of [-0.5,0.5]){ clBX(g,0.9,1.4,0.6,m,x,0.7,-0.65); for(let y=0.25;y<1.4;y+=0.35) clBX(g,0.25,0.04,0.03,clM('steelPole',{color:0x8a8e90,shininess:60}),x,y,-0.34); } },0.7,back);
    atWall(1,(g)=>{ clBX(g,1.6,1.8,0.3,clM('gunRack',{color:0x2a2a28,shininess:20}),0,1.2,-0.8); for(let k=0;k<4;k++) CLP.rifle(g,-0.5+k*0.33,1.3,-0.62,0,1).rotation.z=Math.PI/2; },0.4,back); },

  /* ---------- MERCADO ---------- */
  CM(o){ const {F,A,W,H,clearAt,atWall,back,front}=o;
    const sign=clSignTex('MERCADO POPULAR',{w:1024,h:200,bg:'#f0c020',fg:'#b8180c',size:104,border:'#b8180c',dy:-6,grime:true});
    clBX(F,W*0.7,1.1,0.3,clM('cmBox',{color:0xd0a010}),0,H-0.15,0.25); clPL(F,W*0.68,1.02,new THREE.MeshLambertMaterial({map:sign,emissive:0x2a1a00,emissiveMap:sign}),0,H-0.15,0.41,0);
    const off=clSignTex('OFERTAS',{w:512,h:256,bg:'#b8180c',fg:'#fff4a0',size:110,sub:'R$ 2,99',subSize:60,subFg:'#fff'}); for(const x of [-W*0.4,W*0.4]) if(clearAt(x,0.6)) clPL(F,1.2,0.6,new THREE.MeshLambertMaterial({map:off}),x,2.2,0.05,0);
    // toldo listrado
    const st=clTex(256,64,(c,w,h)=>{ for(let x=0;x<w;x+=32){ c.fillStyle=(x/32)%2?'#e8e0c8':'#b8180c'; c.fillRect(x,0,32,h); } clGrime(c,w,h,0.3); }); st.wrapS=THREE.RepeatWrapping; st.repeat.set(W/2,1);
    const aw=new THREE.Mesh(new THREE.PlaneGeometry(W*0.86,1.6),new THREE.MeshLambertMaterial({map:st,side:THREE.DoubleSide})); aw.position.set(0,2.75,0.72); aw.rotation.x=-1.05; F.add(aw);
    // carrinhos tombados e banca de frutas
    const cart=(x,z,ry,tip)=>{ const c=G3(x,0,z,ry); const m=clM('cartWire',{color:0x9aa0a4,shininess:60}); const bx=new THREE.Group(); clBX(bx,0.55,0.03,0.85,m,0,0.5,0); for(const sx of [-0.27,0.27]) clBX(bx,0.02,0.4,0.85,m,sx,0.7,0); clBX(bx,0.55,0.4,0.02,m,0,0.7,0.42); clBX(bx,0.55,0.4,0.02,m,0,0.7,-0.42); clBX(bx,0.55,0.03,0.03,clM('cartRed',{color:0xb8180c}),0,0.95,-0.5);
      for(const [a,b] of [[-.22,-.35],[.22,-.35],[-.22,.35],[.22,.35]]) clCY(bx,0.06,0.06,0.04,clM('pcTire',{color:0x111111}),a,0.06,b,8,0,Math.PI/2); if(tip){ bx.rotation.z=Math.PI/2; bx.position.y=0.3; } c.add(bx); F.add(c); };
    for(let i=0;i<3;i++){ const x=rand(-W/2+1.5,W/2-1.5); if(clearAt(x,0.6)) cart(x,rand(1.3,2.6),rand(0,6),Math.random()<0.6); }
    { const x=W/2-2.4; if(clearAt(x,1.4)){ clBX(F,2.2,0.8,0.9,clM('woodStand',{color:0x6a4a28}),x,0.4,1.2); for(let k=0;k<3;k++){ const col=[0xc8301a,0xe0a020,0x3a8a20][k]; CLP.crate(F,x-0.7+k*0.7,0.8,1.2,0.6,0x7a5a30); for(let q=0;q<9;q++){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.07,6,5),clM('fruit'+col,{color:col,shininess:40})); b.position.set(x-0.7+k*0.7+rand(-0.2,0.2),1.3+rand(0,0.08),1.2+rand(-0.2,0.2)); F.add(b); } } } }
    // dentro: gôndolas, caixas registradoras, geladeiras e estoque
    const PRODS=[0xc8301a,0xe0a020,0x3a8a20,0x2a5ab8,0xe8e0c8,0x8a2a8a,0xf0f0f0];
    for(let i=0;i<4;i++) atWall(3,(g,w)=>CLP.shelf(g,w,PRODS),0.8,c=>!front(c)&&c.room==='CM');
    for(let i=0;i<2;i++) atWall(2,(g,w)=>{ const m=clM('fridge',{color:0xd8dcdc,shininess:60}); clBX(g,w-0.1,2.2,0.8,m,0,1.1,-0.55); const gl=clEm('fridgeGlow',0xc8e8ff,0x5a7a8a); for(let x=-w/2+0.5;x<w/2-0.3;x+=0.95){ clPL(g,0.85,1.8,gl,x,1.15,-0.14,0); clBX(g,0.04,0.5,0.06,clM('steelPole',{color:0x8a8e90,shininess:60}),x+0.38,1.2,-0.1); } },0.85,c=>c.room==='CM',undefined,'cm_fridge');
    atWall(2,(g,w)=>{ CLP.counter(g,w,0x2a2a2a,0x8a1a10); clBX(g,w-0.4,0.04,0.45,clM('belt',{color:0x111111}),0,1.07,-0.55); clBX(g,0.4,0.25,0.35,clM('register',{color:0x2a2e30,shininess:40}),w/2-0.4,1.2,-0.6); clPL(g,0.3,0.12,clEm('regScreen',0x2aff6a,0x0a6a2a),w/2-0.4,1.33,-0.42,0); },0.85,front);
    for(let i=0;i<3;i++) atWall(1,(g)=>{ const m=clM('pallet',{color:0x7a5a30}); clBX(g,1.2,0.14,1.0,m,0,0.07,-0.4); for(let k=0;k<6;k++) CLP.crate(g,rand(-0.35,0.35),0.14+Math.floor(k/2)*0.45,-0.4+rand(-0.2,0.2),0.5,0x8a6a40); },1.0,c=>c.room==='CM2');
    // produtos caídos no chão
    { const g=new THREE.Group(); for(let i=0;i<60;i++){ const c0=rand(o.s.x0+1.5,o.s.x1-0.5)*S, r=cx(czr(Math.floor(rand(o.s.r0+1,o.s.r1)))); const z=r+rand(-0.8,0.8); const gx=Math.floor(c0/S), gz=Math.floor(z/S); if(!grid[gz]||grid[gz][gx]!=='.') continue; const b=clBX(g,rand(0.08,0.22),rand(0.06,0.2),rand(0.08,0.2),clM('prod'+i%7,{color:PRODS[i%7],shininess:30}),c0,0.06,z); b.rotation.set(rand(0,1.5),rand(0,6),rand(0,1.5)); } bake(g); } },

  /* ---------- FARMÁCIA ---------- */
  CF(o){ const {F,A,W,H,clearAt,atWall,back,front}=o;
    const sign=clSignTex('FARMÁCIA SÃO LUCAS',{w:1024,h:200,bg:'#0e6a38',fg:'#ffffff',size:92,dy:-4});
    clBX(F,W*0.68,1.06,0.2,clM('cfBox',{color:0x0a4a28}),0,H-0.15,0.3); clPL(F,W*0.66,1.0,new THREE.MeshLambertMaterial({map:sign,emissive:0x052a14,emissiveMap:sign}),0,H-0.15,0.41,0);
    const s24=clSignTex('24 HORAS',{w:512,h:128,bg:'#ffffff',fg:'#0e6a38',size:76}); if(clearAt(W/2-1.6,0.6)) clPL(F,1.4,0.36,new THREE.MeshLambertMaterial({map:s24}),W/2-1.6,2.35,0.05,0);
    // cruz verde de neon, saindo da parede (dos dois lados), piscando
    { const x=-W/2+1.4; clBX(F,0.12,0.12,1.2,clM('steelPole',{color:0x8a8e90,shininess:60}),x,H-0.4,0.6); const cr=new THREE.Group(); cr.position.set(x,H-1.0,1.25);
      const on=new THREE.MeshBasicMaterial({color:0x20ff60}); clBX(cr,0.12,1.3,0.42,on,0,0,0); clBX(cr,0.12,0.42,1.3,on,0,0,0); clBX(cr,0.1,1.38,0.5,clM('crossFrame',{color:0x0a2a14}),0,0,0); A.add(cr); CL.anim.push({k:'neon',m:on,base:0x20ff60,ph:0}); }
    for(let i=0;i<2;i++){ const x=rand(-W/2+2,W/2-2); if(clearAt(x,0.4)) CLP.poster(F,x,1.6,0.05,0.7,1.0,(c,w,h)=>{ c.fillStyle='#ffffff'; c.fillRect(0,0,w,h); c.fillStyle='#0e6a38'; c.fillRect(w/2-20,40,40,120); c.fillRect(w/2-60,80,120,40); c.font='bold 28px sans-serif'; c.textAlign='center'; c.fillText('VACINAÇÃO',w/2,h-70); clGrime(c,w,h,0.25); }); }
    // dentro: prateleiras brancas de remédio, balcão com vidro, maca, cadeira de rodas e soro
    const PILLS=[0xf0f0f0,0x2a6ab8,0xd8302a,0xe8e0a0,0x7ac8a0];
    for(let i=0;i<4;i++) atWall(2,(g,w)=>{ const m=clM('pharmShelf',{color:0xeef2ee,shininess:40}); clBX(g,w-0.1,2.3,0.05,m,0,1.15,-0.95); for(let y=0.2;y<2.3;y+=0.36){ clBX(g,w-0.12,0.03,0.4,m,0,y,-0.78); for(let x=-w/2+0.15;x<w/2-0.1;x+=rand(0.08,0.16)){ if(Math.random()<0.25) continue; clBX(g,0.07,rand(0.1,0.18),0.12,clM('pill'+(Math.random()*5|0),{color:pick(PILLS),shininess:40}),x,y+0.1,-0.8); } } },0.5,c=>!front(c));
    atWall(3,(g,w)=>{ CLP.counter(g,w,0xe8eee8,0x0e6a38); const gl=CLP.glass(); clPL(g,w-0.2,0.5,gl,0,1.3,-0.2,0); clBX(g,0.38,0.26,0.32,clM('register',{color:0x2a2e30,shininess:40}),-w/3,1.2,-0.6); const sg=clSignTex('MEDICAMENTOS',{w:1024,h:128,bg:'#0e6a38',fg:'#fff',size:80}); clPL(g,w*0.8,0.4,new THREE.MeshLambertMaterial({map:sg}),0,2.9,-0.94,0); },0.85,back,undefined,'cf_counter');
    atWall(2,(g,w)=>{ const st=clM('steelPole',{color:0x8a8e90,shininess:60}); clBX(g,1.9,0.08,0.7,st,0,0.85,-0.45); clBX(g,1.85,0.12,0.65,clM('stretcher',{color:0x5a8aa0,shininess:30}),0,0.95,-0.45); for(const [a,b] of [[-.85,-.75],[.85,-.75],[-.85,-.15],[.85,-.15]]) clBX(g,0.04,0.85,0.04,st,a,0.42,b);
      clCY(g,0.015,0.015,1.9,st,w/2-0.3,0.95,-0.3,6); const bag=clBX(g,0.16,0.26,0.05,clM('ivBag',{color:0xc8e0f0,transparent:true,opacity:0.7}),w/2-0.3,1.8,-0.3); bag.rotation.z=0.1; },0.8,c=>!front(c));
    atWall(1,(g)=>{ const m=clM('wheelchair',{color:0x2a2a2a,shininess:40}); clCY(g,0.3,0.3,0.03,m,-0.28,0.3,-0.4,16,0,Math.PI/2); clCY(g,0.3,0.3,0.03,m,0.28,0.3,-0.4,16,0,Math.PI/2); clBX(g,0.5,0.05,0.45,clM('wcSeat',{color:0x2a3a6a}),0,0.5,-0.4); clBX(g,0.5,0.5,0.05,clM('wcSeat',{color:0x2a3a6a}),0,0.78,-0.63); },0.6,null,false);
    { const g=new THREE.Group(); for(let i=0;i<40;i++){ const x=rand(o.s.x0+1.4,o.s.x1-0.6)*S, z=cx(czr(Math.floor(rand(o.s.r0+1,o.s.r1)))+rand(-0.8,0.8)); const gx=Math.floor(x/S), gz=Math.floor(z/S); if(!grid[gz]||grid[gz][gx]!=='.') continue; const p=clCY(g,0.025,0.025,0.012,clM('pill'+(i%5),{color:PILLS[i%5],shininess:40}),x,0.008,z,8); p.rotation.x=rand(-0.2,0.2); } bake(g); } },

  /* ---------- ARMARIA ---------- */
  CA(o){ const {F,A,W,H,clearAt,atWall,back,front}=o;
    const sign=clSignTex('ARMARIA DO TONHO',{w:1024,h:200,bg:'#1a1a18',fg:'#ff7a1a',size:96,border:'#ff7a1a',glow:'#ff5a00'});
    clBX(F,W*0.66,1.05,0.2,clM('caSignBox',{color:0x2a2a26,shininess:30}),0,H-0.15,0.15); const sm=new THREE.MeshBasicMaterial({map:sign}); clPL(F,W*0.64,0.98,sm,0,H-0.15,0.26,0); CL.anim.push({k:'flicker',m:sm,base:0xffffff,ph:0});
    for(const sx of [-1,1]){ const x=sx*(W*0.32+1.0); CLP.rifle(F,x-0.3,H-0.15,0.3,0,1.6).rotation.z=sx*0.5; CLP.rifle(F,x+0.3,H-0.15,0.32,0,1.6).rotation.z=-sx*0.5; }
    // portas de enrolar meio abaixadas (acima das aberturas) e placa de aviso
    for(const dx of o.s.door.slice(0,1).map(d=>o.lxOf(d[1]))){ const x=dx+(o.lxOf(o.s.door[1][1])-dx)/2; const rt=clTex(256,128,(c,w,h)=>{ for(let y=0;y<h;y+=8){ c.fillStyle=(y/8)%2?'#5a5e5a':'#4a4e4a'; c.fillRect(0,y,w,8); } clGrime(c,w,h,0.3); });
      clPL(F,4.2,1.0,new THREE.MeshLambertMaterial({map:rt}),x,2.55,0.12,0); clBX(F,4.4,0.3,0.3,clM('rollBox',{color:0x2a2e2a,shininess:20}),x,3.1,0.18); }
    const warn=clSignTex('ENTRADA SÓ COM AUTORIZAÇÃO',{w:1024,h:160,bg:'#e8c020',fg:'#111',size:58}); { const x=W/2-2.2; if(clearAt(x,1)) clPL(F,1.8,0.3,new THREE.MeshLambertMaterial({map:warn}),x,2.1,0.05,0); }
    for(const x of [-W/2+2.4,W/2-2.0]) if(clearAt(x,1.4)) CLP.sandbags(F,x,1.3,2.6,0,4);
    for(let i=0;i<3;i++){ const x=rand(-W/2+1,W/2-1); if(clearAt(x,0.5)) CLP.crate(F,x,0,rand(1.2,2.4),0.6,0x3a4a2a); }
    // dentro: parede de fuzis, vitrine de pistolas, caixas de munição, bancada e alvos
    for(let i=0;i<3;i++) atWall(2,(g,w)=>{ const pb=clTex(256,256,(c,w2,h2)=>{ c.fillStyle='#8a7050'; c.fillRect(0,0,w2,h2); c.fillStyle='#4a3a28'; for(let y=8;y<h2;y+=16) for(let x=8;x<w2;x+=16){ c.beginPath(); c.arc(x,y,2.5,0,6.28); c.fill(); } }); pb.wrapS=pb.wrapT=THREE.RepeatWrapping; pb.repeat.set(w/1.2,1.5);
      clPL(g,w-0.2,2.2,new THREE.MeshLambertMaterial({map:pb}),0,1.6,-0.93,0); for(let y=1.0;y<2.6;y+=0.5) for(let x=-w/2+0.5;x<w/2-0.4;x+=0.9){ if(Math.random()<0.15) continue; CLP.rifle(g,x,y,-0.85,0,1.1); clBX(g,0.04,0.05,0.12,clM('steelPole',{color:0x8a8e90,shininess:60}),x-0.25,y-0.06,-0.88); clBX(g,0.04,0.05,0.12,clM('steelPole',{color:0x8a8e90,shininess:60}),x+0.35,y-0.06,-0.88); } },0.3,c=>!front(c),false);
    atWall(3,(g,w)=>{ const m=clM('caCase',{color:0x2a2622,shininess:40}); clBX(g,w-0.1,0.9,0.75,m,0,0.45,-0.55); const gl=CLP.glass(); clBX(g,w-0.12,0.35,0.73,gl,0,1.08,-0.55); clBX(g,w-0.12,0.02,0.7,clM('felt',{color:0x6a1a14}),0,0.91,-0.55);
      for(let x=-w/2+0.35;x<w/2-0.3;x+=0.45){ const p=G3(x,0.95,-0.55,rand(-0.4,0.4)); clBX(p,0.22,0.05,0.035,clM('gunDark',{color:0x161616,shininess:50}),0,0,0); clBX(p,0.05,0.035,0.11,clM('gunDark',{color:0x161616,shininess:50}),-0.07,0,0.06); g.add(p); } },0.85,back,undefined,'ca_case');
    for(let i=0;i<2;i++) atWall(1,(g)=>{ for(let k=0;k<5;k++) CLP.crate(g,rand(-0.4,0.4),Math.floor(k/2)*0.36,-0.55+rand(-0.15,0.15),0.45,0x3a4a2a); const lb=clSignTex('7.62',{w:256,h:128,bg:'#3a4a2a',fg:'#e8e0a0',size:70,grime:false}); clPL(g,0.4,0.2,new THREE.MeshLambertMaterial({map:lb}),0,0.2,-0.32,0); },0.8,null);
    atWall(2,(g,w)=>{ const wd=clM('workbench',{color:0x5a4228}); clBX(g,w-0.3,0.08,0.75,wd,0,0.9,-0.5); for(const x of [-w/2+0.3,w/2-0.3]) clBX(g,0.08,0.9,0.7,wd,x,0.45,-0.5); clBX(g,0.25,0.18,0.2,clM('vise',{color:0x3a5a8a,shininess:50}),-w/3,1.03,-0.4); CLP.rifle(g,0.2,0.97,-0.5,0.3,1); clBX(g,0.4,0.1,0.25,clM('toolbox',{color:0xb8180c,shininess:30}),w/3,1.0,-0.6); },0.8,back);
    atWall(1,(g)=>{ CLP.poster(g,0,1.7,-0.93,0.8,1.1,(c,w,h)=>{ c.fillStyle='#f0ead8'; c.fillRect(0,0,w,h); c.fillStyle='#1a1a1a'; c.beginPath(); c.arc(w/2,80,46,0,6.28); c.fill(); c.beginPath(); c.moveTo(w/2-90,h); c.lineTo(w/2-70,150); c.lineTo(w/2+70,150); c.lineTo(w/2+90,h); c.fill(); c.strokeStyle='#e8e0d0'; c.lineWidth=4; for(let r=20;r<120;r+=24){ c.beginPath(); c.arc(w/2,190,r,0,6.28); c.stroke(); } c.fillStyle='#c81d1d'; for(let i=0;i<7;i++){ c.beginPath(); c.arc(w/2+rand(-40,40),rand(60,230),5,0,6.28); c.fill(); } }); },0.1,null,false); },

  /* ---------- BAR ---------- */
  CB(o){ const {F,A,W,H,clearAt,atWall,back,front}=o;
    // letreiro de neon rosa escrito à mão e caneca de chope, piscando
    const nt=clTex(1024,256,(c,w,h)=>{ c.clearRect(0,0,w,h); c.font='italic bold 130px "Brush Script MT", "Segoe Script", cursive'; c.textAlign='center'; c.textBaseline='middle'; c.shadowColor='#ff3ab0'; c.shadowBlur=40; c.strokeStyle='#ff9ae0'; c.lineWidth=6; c.strokeText('Bar Esquina',w/2,h/2); c.fillStyle='#ffd0f0'; c.fillText('Bar Esquina',w/2,h/2); });
    const nm=new THREE.MeshBasicMaterial({map:nt,transparent:true,depthWrite:false,fog:false}); clPL(F,W*0.6,1.5,nm,0,H-0.1,0.45,0); CL.anim.push({k:'flicker',m:nm,base:0xffffff,ph:2});
    const mug=clTex(256,256,(c,w,h)=>{ c.clearRect(0,0,w,h); c.shadowColor='#ffb020'; c.shadowBlur=24; c.strokeStyle='#ffd060'; c.lineWidth=10; c.strokeRect(70,70,100,140); c.beginPath(); c.arc(185,140,34,-1.4,1.4); c.stroke(); c.strokeStyle='#ffffff'; c.beginPath(); c.arc(95,62,22,0,6.28); c.arc(135,56,26,0,6.28); c.arc(160,64,18,0,6.28); c.stroke(); });
    const mm=new THREE.MeshBasicMaterial({map:mug,transparent:true,depthWrite:false,fog:false}); clPL(F,1.3,1.3,mm,W*0.36,H-0.1,0.46,0); CL.anim.push({k:'flicker',m:mm,base:0xffffff,ph:5});
    CLP.bulbs(F,-W/2+0.6,W/2-0.6,2.95,0.25,22,0xffd890);
    // mesas de plástico e engradados na calçada
    for(let i=0;i<3;i++){ const x=-W/2+3+i*(W-6)/2; if(!clearAt(x,1.2)) continue; const tm=clM('plastic',{color:0xe8e8e4,shininess:30}); clBX(F,0.8,0.04,0.8,tm,x,0.74,1.6); for(const [a,b] of [[-.35,-.35],[.35,-.35],[-.35,.35],[.35,.35]]) clBX(F,0.04,0.72,0.04,tm,x+a,0.36,1.6+b);
      for(let k=0;k<3;k++) CLP.chair(F,x+Math.cos(k*2.1)*0.75,1.6+Math.sin(k*2.1)*0.75,k*2.1+rand(-0.4,0.4),0xe8e8e4); for(let k=0;k<3;k++) clCY(F,0.035,0.035,0.24,clM('bottle',{color:0x5a3a10,transparent:true,opacity:0.85,shininess:90}),x+rand(-0.2,0.2),0.88,1.6+rand(-0.2,0.2),8); }
    { const x=W/2-1.3; if(clearAt(x,0.8)) for(let k=0;k<6;k++) CLP.crate(F,x+(k%2)*0.5-0.25,Math.floor(k/2)*0.3,1.0,0.45,0xe0b020); }
    // dentro: balcão com banquetas, prateleira de garrafas, sinuca, alvo de dardos, jukebox e mesas
    atWall(4,(g,w)=>{ const wd=clM('barWood',{color:0x3a2010,shininess:40}); clBX(g,w-0.2,1.1,0.6,wd,0,0.55,0.3); clBX(g,w,0.07,0.8,clM('barTop',{color:0x1a0c06,shininess:90,specular:0x664422}),0,1.13,0.3);
      const sh=clM('barShelf',{color:0x2a1608}); for(const y of [1.3,1.75,2.2]){ clBX(g,w-0.4,0.04,0.3,sh,0,y,-0.8); for(let x=-w/2+0.4;x<w/2-0.35;x+=rand(0.12,0.2)){ const col=pick([0x2a6a2a,0x5a3010,0xc8c8b0,0x8a1a1a,0x1a4a6a]); const b=clCY(g,0.035,0.04,rand(0.22,0.32),clM('bt'+col,{color:col,transparent:true,opacity:0.85,shininess:110,specular:0xffffff}),x,y+0.15,-0.78,8); } }
      clPL(g,w-0.4,1.3,clEm('barBack',0x2a0a14,0x3a0818),0,1.75,-0.94,0);
      for(let x=-w/2+0.6;x<w/2-0.4;x+=0.85){ clCY(g,0.2,0.2,0.06,clM('stool',{color:0x8a1a1a,shininess:40}),x,0.75,1.0,12); clCY(g,0.03,0.03,0.72,clM('steelPole',{color:0x8a8e90,shininess:60}),x,0.37,1.0,6); } },1.7,back,true,'cb_bar');
    atWall(2,(g,w)=>{ const m=clM('jukebox',{color:0x5a1a10,shininess:60}); clBX(g,0.8,1.5,0.5,m,-w/4,0.75,-0.65); const jt=new THREE.MeshBasicMaterial({color:0xffa040}); clPL(g,0.6,0.5,jt,-w/4,1.2,-0.39,0); CL.anim.push({k:'neon',m:jt,base:0xffa040,ph:1});
      clBX(g,1.0,0.6,0.06,clM('tv',{color:0x111111,shininess:60}),w/4,2.2,-0.9); clPL(g,0.92,0.52,clEm('tvStatic',0x6a7a8a,0x2a3038),w/4,2.2,-0.865,0); },0.6,null,false);
    atWall(1,(g)=>{ const db=clTex(256,256,(c,w,h)=>{ const cols=['#111','#e8d8b0']; for(let i=0;i<20;i++){ c.fillStyle=cols[i%2]; c.beginPath(); c.moveTo(w/2,h/2); c.arc(w/2,h/2,120,i/20*6.28,(i+1)/20*6.28); c.fill(); } c.strokeStyle='#c81d1d'; c.lineWidth=10; c.beginPath(); c.arc(w/2,h/2,80,0,6.28); c.stroke(); c.fillStyle='#2a8a2a'; c.beginPath(); c.arc(w/2,h/2,14,0,6.28); c.fill(); });
      const d=new THREE.Mesh(new THREE.CircleGeometry(0.28,24),new THREE.MeshLambertMaterial({map:db})); d.position.set(0,1.75,-0.93); g.add(d); },0.1,null,false);
    // sinuca no meio
    { const c=o.wall.find(q=>!o.used.has(q.x+','+q.z)&&!front(q)); const cxx=cx(Math.round((o.s.x0+o.s.x1)/2)), czz=cx(czr(Math.round((o.s.r0+o.s.r1)/2))); const gx=Math.floor(cxx/S), gz=Math.floor(czz/S);
      if(grid[gz][gx]==='.'&&!o.R.has(gx+','+gz)){ poolPlace(cxx,czz,o.side>0?Math.PI/2:-Math.PI/2); } }   /* mesa de sinuca de verdade (31_pool.js) */
    for(let i=0;i<2;i++) atWall(1,(g)=>{ CLP.table(g,0,0.1,0.4,0x3a2010); CLP.chair(g,-0.5,0.1,Math.PI/2,0x3a2010); CLP.chair(g,0.5,0.1,-Math.PI/2,0x3a2010); },1.2,c=>!back(c),false); },

  /* ---------- BANCO ---------- */
  CK(o){ const {F,A,W,H,clearAt,atWall,back,front}=o;
    // colunas, frontão e letras douradas
    const st=clM('stoneCol',{color:0xb8ae98,shininess:15});
    for(let i=0;i<6;i++){ const x=-W/2+1.2+i*(W-2.4)/5; if(!clearAt(x,0.25)) continue; clCY(F,0.32,0.36,H-0.5,st,x,(H-0.5)/2+0.25,0.55,14); clBX(F,0.9,0.25,0.9,st,x,0.12,0.55); clBX(F,0.9,0.22,0.9,st,x,H-0.15,0.55); }
    clBX(F,W,0.9,1.3,st,0,H+0.3,0.55); clBX(F,W*0.7,0.4,1.1,st,0,H+0.95,0.45); clBX(F,W*0.4,0.35,1.0,st,0,H+1.3,0.4);
    const gold=clTex(1024,160,(c,w,h)=>{ c.clearRect(0,0,w,h); c.font='bold 100px "Times New Roman", Georgia, serif'; c.textAlign='center'; c.textBaseline='middle'; const g=c.createLinearGradient(0,20,0,h-20); g.addColorStop(0,'#fff0b0'); g.addColorStop(0.5,'#c9a24a'); g.addColorStop(1,'#7a5a1a'); c.fillStyle=g; c.fillText('BANCO CENTRAL',w/2,h/2+4); });
    clPL(F,W*0.6,0.9,new THREE.MeshPhongMaterial({map:gold,transparent:true,shininess:100,specular:0xffe0a0}),0,H+0.3,1.22,0);
    // degraus da entrada
    { const dx=o.lxOf(o.s.door[0][1]), x=dx+(o.lxOf(o.s.door[1][1])-dx)/2; for(let k=0;k<3;k++) clBX(F,4.6-k*0.4,0.08*(k+1),0.5,st,x,0.04*(k+1),0.25+(2-k)*0.45); }
    // caixas eletrônicos quebrados, frades e câmera
    for(const x of [-W/2+1.8,W/2-1.8]) if(clearAt(x,0.6)){ clBX(F,0.8,1.6,0.5,clM('atm',{color:0x3a3e42,shininess:50}),x,0.8,0.3); const scr=new THREE.MeshBasicMaterial({color:0x2a7aff}); clPL(F,0.4,0.3,scr,x,1.25,0.56,0); CL.anim.push({k:'flicker',m:scr,base:0x2a7aff,ph:x}); clBX(F,0.5,0.05,0.12,clM('atmSlot',{color:0x111111}),x,0.95,0.56); }
    for(let i=0;i<5;i++){ const x=-W/2+2.5+i*(W-5)/4; if(clearAt(x,0.3)) clCY(F,0.12,0.14,0.8,clM('bollard',{color:0x2a2a2a,shininess:30}),x,0.4,2.3,10); }
    { const x=W/2-0.8; clBX(F,0.3,0.18,0.4,clM('cam',{color:0xd8d8d0,shininess:50}),x,3.2,0.35); }
    // dentro: guichês com vidro, cordões de fila, cofre redondo, parede de cofrinhos, dinheiro espalhado
    atWall(4,(g,w)=>{ CLP.counter(g,w,0x3a2a1a,0x5a4430); const gl=CLP.glass(); clPL(g,w,1.2,gl,0,1.66,-0.2,0); for(let x=-w/2;x<=w/2+0.01;x+=w/4) clBX(g,0.06,1.2,0.06,clM('brass',{color:0xb8902a,shininess:90,specular:0xffe0a0}),x,1.66,-0.2);
      for(let x=-w/2+w/8;x<w/2;x+=w/4){ const n=clSignTex('CAIXA',{w:256,h:64,bg:'#1a1208',fg:'#c9a24a',size:44,grime:false}); clPL(g,0.5,0.13,new THREE.MeshLambertMaterial({map:n}),x,2.35,-0.19,0); } },1.0,c=>c.room==='CK');
    atWall(3,(g,w)=>{ const st2=clM('vaultSteel',{color:0x8a8e92,shininess:110,specular:0xbbbbbb}); clBX(g,w-0.2,ROOM_CEIL-0.2,0.3,clM('vaultFrame',{color:0x4a4e52,shininess:60}),0,(ROOM_CEIL-0.2)/2,-0.85);
      const door=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.25,0.35,32),st2); door.rotation.x=Math.PI/2; door.position.set(0,1.5,-0.6); g.add(door); const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,0.08,8,32),clM('vaultRing',{color:0x5a5e62,shininess:90})); ring.position.set(0,1.5,-0.42); g.add(ring);
      const wheel=new THREE.Group(); wheel.position.set(0,1.5,-0.38); for(let k=0;k<3;k++){ const sp=clBX(wheel,0.9,0.06,0.06,clM('brass',{color:0xb8902a,shininess:90}),0,0,0); sp.rotation.z=k*Math.PI/3; } clCY(wheel,0.12,0.12,0.12,clM('brass',{color:0xb8902a,shininess:90}),0,0,0,12,Math.PI/2); g.add(wheel);
      for(let k=0;k<8;k++) clCY(g,0.07,0.07,0.1,st2,Math.cos(k/8*6.28)*1.05,1.5+Math.sin(k/8*6.28)*1.05,-0.4,10,Math.PI/2); },0.7,c=>c.room==='CK2',undefined,'ck_vault');
    atWall(2,(g,w)=>{ const m=clM('depositBox',{color:0x9a8a5a,shininess:80,specular:0x887755}); for(let y=0.35;y<2.9;y+=0.32) for(let x=-w/2+0.3;x<w/2-0.2;x+=0.42){ clBX(g,0.38,0.28,0.05,m,x,y,-0.93); clCY(g,0.02,0.02,0.03,clM('brass',{color:0xb8902a,shininess:90}),x+0.12,y,-0.89,6,Math.PI/2); } },0.15,c=>c.room==='CK2',false);
    atWall(1,(g)=>{ const bag=clM('moneyBag',{color:0x8a7a50,shininess:5}); for(let k=0;k<4;k++){ const b=new THREE.Mesh(new THREE.SphereGeometry(0.28,10,8),bag); b.scale.set(1,1.15,1); b.position.set(rand(-0.5,0.5),0.3,-0.5+rand(-0.2,0.2)); g.add(b); } for(let k=0;k<6;k++) clBX(g,0.25,0.08,0.12,clM('goldBar',{color:0xd8a830,shininess:120,specular:0xffe080,emissive:0x2a1a00}),rand(-0.3,0.3),0.04+Math.floor(k/3)*0.08,-0.2+rand(-0.1,0.1)); },0.9,c=>c.room==='CK2');
    // cordões de fila (postes de latão)
    for(let i=0;i<2;i++) atWall(2,(g,w)=>{ const br=clM('brass',{color:0xb8902a,shininess:90,specular:0xffe0a0}); for(const x of [-w/2+0.4,0,w/2-0.4]){ clCY(g,0.03,0.03,0.95,br,x,0.48,0.6,8); clCY(g,0.15,0.15,0.04,br,x,0.02,0.6,12); } const rope=clCY(g,0.022,0.022,w-0.8,clM('velvet',{color:0x8a0a1a}),0,0.85,0.6,6,0,Math.PI/2); },0.2,c=>c.room==='CK'&&!back(c),false);
    { const g=new THREE.Group(); const bill=clTex(128,64,(c,w,h)=>{ c.fillStyle='#4a7a4a'; c.fillRect(0,0,w,h); c.strokeStyle='#2a4a2a'; c.lineWidth=4; c.strokeRect(4,4,w-8,h-8); c.fillStyle='#2a4a2a'; c.beginPath(); c.arc(w/2,h/2,14,0,6.28); c.fill(); }); const bm=new THREE.MeshLambertMaterial({map:bill,side:THREE.DoubleSide});
      for(let i=0;i<70;i++){ const x=rand(o.s.x0+1.3,o.s.x1-0.6)*S, z=cx(czr(Math.floor(rand(o.s.r0+1,o.s.r1))))+rand(-0.8,0.8); const gx=Math.floor(x/S), gz=Math.floor(z/S); if(!grid[gz]||grid[gz][gx]!=='.') continue; const p=clPL(g,0.16,0.07,bm,x,0.006+Math.random()*0.01,z,rand(0,6),-Math.PI/2); } bake(g); } }
};
// troca a montagem antiga (todas iguais) pela temática
cityShop=function(s,M3){ try{ clShop(s,M3); }catch(e){ console.warn('[Bunker v9] cidade: prédio '+s.id,e); try{ hangingBulb(cx((s.x0+s.x1)/2),cx(czr((s.r0+s.r1)/2)),s.id,'city'); }catch(_){} } };
// pisca-pisca: giroflex, neon e letreiros
v9On('always',dt=>{ if(CUR!=='city'||!CL.anim.length) return; CL.t+=dt; const t=CL.t;
  for(const a of CL.anim){ if(a.k==='flash'){ const on=Math.floor((t+a.ph)*4)%2===0; a.ma.color.setHex(on?0xff1010:0x300000); a.mb.color.setHex(on?0x0a0a30:0x1040ff); }
    else if(a.k==='neon'){ const f=Math.sin((t+a.ph)*2.2)>-0.85||Math.random()<0.3?1:0.15; a.m.color.setHex(a.base).multiplyScalar(f); }
    else if(a.k==='flicker'){ const f=Math.random()<0.012?0.25:1; a.m.color.setHex(a.base).multiplyScalar(f); }
    else if(a.k==='flag'){ const p=a.m.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i)+0.75; p.setZ(i,Math.sin(t*3+x*3)*0.12*(1.5-x)); } p.needsUpdate=true; } } });
