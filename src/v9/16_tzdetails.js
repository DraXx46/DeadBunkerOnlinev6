/* ================= v9 · TRANZITCH: construções mais detalhadas =================
   Por cima do que já existe: caixas de ar-condicionado, antenas e caixas d'água nos telhados, calhas e canos nas quinas,
   cartazes e pichações nas fachadas, sacos de lixo, papelão, paletes, fios entre os postes e poças. */
const TZ_BLD=[[0,31,4,45,21],[1,30,8,44,17],[2,33,3,43,11],[2,33,15,41,22],[3,31,6,44,19],[4,30,3,40,10],[4,30,15,40,22]];
function tzDetails(){ const M3=TZG.M; if(!M3) return;
  const metal=v9Mat('tzdMetal',{color:0x8a8e92,shininess:50}), dark=v9Mat('tzdDark',{color:0x2a2c2e,shininess:20}), rust=v9Mat('tzdRust',{color:0x6a3a22,shininess:10}), bag=v9Mat('tzdBag',{color:0x101214,shininess:60,specular:0x444444}),
    card=new THREE.MeshLambertMaterial({color:0x9a7a4a}), pal=new THREE.MeshLambertMaterial({color:0x7a5a3a}), pud=new THREE.MeshPhongMaterial({color:0x0a0c10,shininess:140,specular:0x8899aa,transparent:true,opacity:0.8});
  const posters=['PROCURA-SE','EVACUAÇÃO','LINHA 115','VOTE ZÉ','NÃO ABRA','TOQUE DE RECOLHER','SALVE-SE QUEM PUDER'].map((t,i)=>new THREE.MeshLambertMaterial({map:tex(128,180,(c,w,h)=>{ c.fillStyle=['#d8d0b8','#c8b890','#e8e0c8','#b8c8d0'][i%4]; c.fillRect(0,0,w,h); c.fillStyle='#1a1410'; c.font='bold 18px Impact'; c.textAlign='center'; c.fillText(t,w/2,30); c.fillStyle='rgba(0,0,0,.6)'; c.fillRect(20,44,w-40,90); for(let k=0;k<40;k++){ c.fillStyle=`rgba(80,60,40,${Math.random()*.3})`; c.fillRect(Math.random()*w,Math.random()*h,8,8); } c.font='12px monospace'; c.fillText('—— '+(1980+i)+' ——',w/2,160); }),transparent:true}));
  const graf=['ZUMBI','SOCORRO','115','FIM','RAMOS ESTEVE AQUI','X'].map(t=>new THREE.MeshBasicMaterial({map:tex(256,96,(c,w,h)=>{ c.clearRect(0,0,w,h); c.font='bold 54px Impact'; c.fillStyle=pick(['#c02a1a','#2a8ac0','#e8c43a','#2ac06a','#e8e8e8']); c.globalAlpha=0.8; c.translate(w/2,h/2); c.rotate(rand(-0.15,0.15)); c.textAlign='center'; c.textBaseline='middle'; c.fillText(t,0,0); }),transparent:true,depthWrite:false}));
  for(let k=0;k<TZ_N;k++){ const sg=TZG.sec[k]; if(!sg) continue; ROOT=sg; BATCH=new Batch(); const s=tzSec(k);
    for(const b of TZ_BLD){ if(b[0]!==k) continue; const [,x0,r0,x1,r1]=b; const X0=x0*S, X1=(x1+1)*S, Z0=(s+r0)*S, Z1=(s+r1+1)*S, top=WH+0.35;
      // telhado: ar-condicionado, caixa d'água ou antena
      for(let i=0;i<2;i++){ const g=G3(rand(X0+2,X1-2),top,rand(Z0+2,Z1-2),rand(0,6)); tzBx(g,1.1,0.7,0.8,metal,0,0.35,0); for(let j=0;j<5;j++) tzBx(g,0.02,0.5,0.82,dark,-0.4+j*0.2,0.35,0); tzBx(g,0.6,0.06,0.6,dark,0,0.73,0); bake(g); }
      if(Math.random()<0.6){ const g=G3(rand(X0+2,X1-2),top,rand(Z0+2,Z1-2)); for(const [dx,dz] of [[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]]) tzBx(g,0.08,1.4,0.08,rust,dx,0.7,dz); const tank=new THREE.Mesh(new THREE.CylinderGeometry(0.75,0.75,1.1,14),metal); tank.position.y=1.95; g.add(tank); bake(g); }
      else { const g=G3(rand(X0+1,X1-1),top,rand(Z0+1,Z1-1)); tzBx(g,0.05,2.6,0.05,metal,0,1.3,0); for(const y of [1.6,2.0,2.4]) tzBx(g,0.9-y*0.2,0.03,0.03,metal,0,y,0); bake(g); }
      // calhas e canos nas quinas
      for(const [x,z] of [[X0-0.08,Z0-0.08],[X1+0.08,Z0-0.08],[X0-0.08,Z1+0.08],[X1+0.08,Z1+0.08]]){ const g=G3(x,0,z); tzBx(g,0.1,top,0.1,rust,0,top/2,0); tzBx(g,0.2,0.08,0.2,rust,0,0.04,0); bake(g); }
      // cartazes e pichações nas paredes de fora
      for(let i=0;i<5;i++){ const side=Math.floor(Math.random()*4); let x,z,ry; if(side===0){ x=X0-0.03; z=rand(Z0+0.5,Z1-0.5); ry=-Math.PI/2; } else if(side===1){ x=X1+0.03; z=rand(Z0+0.5,Z1-0.5); ry=Math.PI/2; } else if(side===2){ z=Z0-0.03; x=rand(X0+0.5,X1-0.5); ry=Math.PI; } else { z=Z1+0.03; x=rand(X0+0.5,X1-0.5); ry=0; }
        const cX=Math.floor(x/S), cZ=Math.floor(z/S); if(at(cX,cZ)==='W'||at(cX,cZ)==='D') continue;
        if(i<3){ const p=new THREE.Mesh(new THREE.PlaneGeometry(0.55,0.78),pick(posters)); p.position.set(x,rand(1.2,1.9),z); p.rotation.set(0,ry,rand(-0.08,0.08)); sg.add(p); }
        else { const p=new THREE.Mesh(new THREE.PlaneGeometry(rand(1.6,2.6),0.9),pick(graf)); p.position.set(x,rand(0.8,1.6),z); p.rotation.y=ry; sg.add(p); } }
      // lixo, papelão e paletes encostados
      for(let i=0;i<6;i++){ const side=Math.random()<0.5; const x=side?(Math.random()<0.5?X0-0.5:X1+0.5):rand(X0,X1), z=side?rand(Z0,Z1):(Math.random()<0.5?Z0-0.5:Z1+0.5); const cX=Math.floor(x/S), cZ=Math.floor(z/S); if(!inB(cX,cZ)||grid[cZ][cX]!=='.') continue;
        const g=G3(x,0,z,rand(0,6)); const r=Math.random(); if(r<0.45){ const bgm=new THREE.Mesh(new THREE.SphereGeometry(0.28,8,6),bag); bgm.scale.set(1,0.8,0.9); bgm.position.y=0.22; g.add(bgm); const b2=new THREE.Mesh(new THREE.SphereGeometry(0.22,8,6),bag); b2.position.set(0.3,0.18,0.1); g.add(b2); }
        else if(r<0.75){ tzBx(g,0.5,0.4,0.4,card,0,0.2,0); tzBx(g,0.4,0.3,0.35,card,0.1,0.55,0.05).rotation.y=0.4; } else { for(let j=0;j<3;j++) tzBx(g,1.1,0.04,0.12,pal,0,0.1,-0.4+j*0.4); for(let j=0;j<3;j++) tzBx(g,0.12,0.08,1.0,pal,-0.45+j*0.45,0.04,0); g.rotation.z=Math.random()<0.4?1.2:0; }
        bake(g); } }
    // poças na rua
    for(let i=0;i<5;i++){ const p=new THREE.Mesh(new THREE.CircleGeometry(rand(0.6,1.6),18),pud); p.rotation.x=-Math.PI/2; p.scale.y=rand(0.4,0.8); p.position.set(cx(rand(19,26)),0.02,cx(s+rand(1,24))); sg.add(p); }
    // fios entre os postes do lado da rua
    const wire=new THREE.LineBasicMaterial({color:0x111111}); for(let r=1;r<24;r+=6){ const pts=[]; for(let t=0;t<=10;t++){ const z=cx(s+r)+t*1.2; pts.push(new THREE.Vector3(cx(19)+0.2,4.4-Math.sin(t/10*Math.PI)*0.5,z)); } sg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wire)); }
    BATCH.flush(sg); }
}
