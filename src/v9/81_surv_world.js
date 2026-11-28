/* ================= v9 · SOBREVIVÊNCIA · ETAPA 1: MUNDO PRÓPRIO E CIDADE =================
   O modo tem uma grade só dele, bem maior que a dos outros mapas, que ENTRA NO LUGAR da grade global quando o mapa
   'surv' é ligado (setMap) e é devolvida quando qualquer outro mapa volta. Os mapas atuais ficam intocados.
   · a cidade começa na coluna SV.OX (x ≥ 112 m): todos os mapas atuais vivem em x < 96 m, então nada deles
     (caixas de colisão, portas, máquinas) aparece dentro da cidade.
   · cidade gerada por semente (cada campanha = uma cidade): avenidas e ruas, calçadas, quarteirões; centro comercial com
     delegacia, bombeiros, hospital, mercado, farmácia, loja de armas, igreja, escola; bairros de casas com quintal e cerca;
     zona industrial (armazéns, oficina, posto); base do exército cercada num canto; parques; mata em volta.
   · desenho em pedaços de SV.CK×SV.CK células: chão pintado numa textura por pedaço e o resto em malhas instanciadas.
     Só os pedaços perto do jogador aparecem (a neblina esconde a borda); cada pedaço é montado na primeira vez que chega perto.
   · caminho dos zumbis com raio limitado (a grade é enorme).
   Grade: '.' chão livre · '#' parede/árvore · 'W' janela (bala passa no meio) · 'k' cerca/bomba (bala passa por cima) · 'c' carro. */
const SV={in:false,OX:56,CW:384,CH:384,CK:32,R:2,seed:0,gen:false,save:null,bld:[],chunks:new Map(),GK:null,SK:null,BI:null,rx:[],rz:[],isRX:null,isRZ:null,spawn:null,specials:{}};
const SVG={grass:0,road:1,side:2,floor:3,conc:4,dirt:5,forest:6,park:7};
const SVS={none:0,wall:1,win:2,fence:3,tree:4,car:5,pump:6};
const SVT={   // tipos de prédio: nome na placa, cor da parede, cor do chão, cor do telhado
  casa:{n:'',w:[0xb9a88c,0x9fb0a4,0xc4b49a,0xa89a8a,0xb8a080,0x8f9faa],f:'#6b4f36',r:0x5a3a2c},
  loja:{n:'',w:[0x8c7a6a,0x9a8f84,0x7d6f62],f:'#7d7a72',r:0x3a3634},
  bar:{n:'BAR',w:[0x6a4a3a],f:'#5a3c28',r:0x2e2622},
  escritorio:{n:'',w:[0x8a8f96,0x7c838c],f:'#7a7a76',r:0x36383c},
  delegacia:{n:'DELEGACIA',w:[0x5a6a86],f:'#8a8a84',r:0x2a3240},
  bombeiros:{n:'BOMBEIROS',w:[0x9a3a2e],f:'#7a7670',r:0x3a2220},
  hospital:{n:'HOSPITAL',w:[0xd8d6d0],f:'#a8aba8',r:0x5a5e60},
  mercado:{n:'MERCADO',w:[0xc8b890],f:'#9a968a',r:0x4a4436},
  farmacia:{n:'FARMÁCIA',w:[0xcfd8cf],f:'#a0a6a0',r:0x3e4a44},
  armas:{n:'ARMAS & CAÇA',w:[0x5c5040],f:'#6e5a44',r:0x2a241c},
  igreja:{n:'IGREJA',w:[0xe0dccc],f:'#7a6650',r:0x6a3a2a},
  escola:{n:'ESCOLA',w:[0xd6c280],f:'#8a8678',r:0x6a4030},
  posto:{n:'POSTO',w:[0xe0e0d8],f:'#8a8a86',r:0xb02a20},
  oficina:{n:'OFICINA',w:[0x6e6e6a],f:'#5e5e5a',r:0x2e2e2c},
  armazem:{n:'',w:[0x7a7e82,0x8a7a6a],f:'#666662',r:0x44484c},
  quartel:{n:'',w:[0x5e6448],f:'#6a6a5e',r:0x3a3e2c},
  arsenal:{n:'ARSENAL',w:[0x4e5440],f:'#5e5e52',r:0x2e3224},
  hangar:{n:'',w:[0x6a6e60],f:'#5e5e58',r:0x484c40},
  comando:{n:'EXÉRCITO',w:[0x5a6248],f:'#6a6a5e',r:0x34382a}
};
function svRng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }

/* ---------------- gerador ---------------- */
function svGen(seed){
  const W=SV.CW, H=SV.CH, N=W*H, R=svRng(seed), ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pk=a=>a[Math.floor(R()*a.length)];
  const GK=new Uint8Array(N).fill(SVG.forest), SK=new Uint8Array(N), BI=new Int16Array(N).fill(-1), WD=new Uint8Array(N);   // WD: direção da parede/cerca (1 = corre em x, 2 = corre em z)
  const id=(u,v)=>v*W+u, inC=(u,v)=>u>=0&&v>=0&&u<W&&v<H;
  const setG=(u0,v0,u1,v1,k)=>{ for(let v=v0;v<=v1;v++) for(let u=u0;u<=u1;u++) if(inC(u,v)) GK[id(u,v)]=k; };
  const bld=[]; SV.specials={};
  const M=22;   // mata em volta da cidade
  setG(M,M,W-1-M,H-1-M,SVG.grass);
  // ---- ruas: linhas em x (correm em z) e em z (correm em x); a última faixa em x e a primeira em z são largas (base do exército no canto)
  const lines=(lo,hi,bigFirst,bigLast)=>{ const L=[]; let p=lo; let i=0;
    while(true){ const w=(i%3===0)?6:4; L.push({p,w}); const big=(bigFirst&&i===0)||(bigLast&&p+w+60>=hi-4);
      const step=big?60:ri(28,38); if(p+w+step+6>hi){ break; } p+=w+step; i++; }
    const last=L[L.length-1]; if(hi-(last.p+last.w)>8) L.push({p:hi-5,w:5}); return L; };
  const rx=lines(M,W-M,false,true), rz=lines(M,H-M,true,false);
  const isRX=new Uint8Array(W), isRZ=new Uint8Array(H);
  for(const r of rx){ for(let u=r.p;u<r.p+r.w;u++) if(u>=0&&u<W) isRX[u]=1; setG(r.p,M,r.p+r.w-1,H-1-M,SVG.road); }
  for(const r of rz){ for(let v=r.p;v<r.p+r.w;v++) if(v>=0&&v<H) isRZ[v]=1; setG(M,r.p,W-1-M,r.p+r.w-1,SVG.road); }
  // saídas de terra pela mata (duas, em lados opostos)
  { const a=rz[Math.floor(rz.length/2)], b=rx[Math.floor(rx.length/2)]; setG(0,a.p+1,M-1,a.p+a.w-2,SVG.dirt); setG(b.p+1,H-M,b.p+b.w-2,H-1,SVG.dirt); }
  // ---- quarteirões
  const blocks=[];
  for(let i=0;i+1<rx.length;i++) for(let j=0;j+1<rz.length;j++){
    const u0=rx[i].p+rx[i].w, u1=rx[i+1].p-1, v0=rz[j].p+rz[j].w, v1=rz[j+1].p-1; if(u1-u0<8||v1-v0<8) continue;
    setG(u0,v0,u1,v0,SVG.side); setG(u0,v1,u1,v1,SVG.side); setG(u0,v0,u0,v1,SVG.side); setG(u1,v0,u1,v1,SVG.side);
    const cu=(u0+u1)/2, cv=(v0+v1)/2; const d=Math.max(Math.abs(cu-W/2),Math.abs(cv-H/2))/(W/2);
    blocks.push({i,j,u0:u0+1,v0:v0+1,u1:u1-1,v1:v1-1,cu,cv,d,used:false}); }
  // ---- prédios
  const wallsOf=(b)=>{ for(let u=b.x0;u<=b.x1;u++) for(const v of [b.z0,b.z1]){ const k=id(u,v); SK[k]=SVS.wall; WD[k]=1; BI[k]=b.n; }
    for(let v=b.z0;v<=b.z1;v++) for(const u of [b.x0,b.x1]){ const k=id(u,v); SK[k]=SVS.wall; WD[k]=2; BI[k]=b.n; } };
  function mkB(type,x0,z0,x1,z1,side,doorW){
    const T=SVT[type]; const b={n:bld.length,type,x0,z0,x1,z1,col:pk(T.w),side,door:null,name:T.n}; bld.push(b);
    for(let v=z0;v<=z1;v++) for(let u=x0;u<=x1;u++){ const k=id(u,v); GK[k]=SVG.floor; BI[k]=b.n; SK[k]=SVS.none; }
    wallsOf(b);
    // janelas: a cada 3 células da parede de fora (sem cantos)
    for(let u=x0+1;u<x1;u++) for(const v of [z0,z1]){ if((u-x0)%3===2){ SK[id(u,v)]=SVS.win; } }
    for(let v=z0+1;v<z1;v++) for(const u of [x0,x1]){ if((v-z0)%3===2){ SK[id(u,v)]=SVS.win; } }
    // porta: abertura no meio do lado virado para a rua (side: 0 norte z0, 1 sul z1, 2 oeste x0, 3 leste x1)
    const dw=doorW||1, mu=Math.floor((x0+x1)/2), mv=Math.floor((z0+z1)/2); const cells=[];
    for(let k=0;k<dw;k++){ const o=k-Math.floor((dw-1)/2);
      if(side===0) cells.push([mu+o,z0]); else if(side===1) cells.push([mu+o,z1]); else if(side===2) cells.push([x0,mv+o]); else cells.push([x1,mv+o]); }
    for(const [u,v] of cells){ const k=id(u,v); SK[k]=SVS.none; GK[k]=SVG.floor; }
    b.door=cells[Math.floor(cells.length/2)];
    // divisórias internas com passagem
    const w=x1-x0, d=z1-z0;
    if(w>=10){ const sx=x0+Math.floor(w/2); for(let v=z0+1;v<z1;v++){ const k=id(sx,v); SK[k]=SVS.wall; WD[k]=2; } const g=z0+1+Math.floor(R()*(d-2)); SK[id(sx,g)]=SVS.none; if(d>12) SK[id(sx,Math.min(z1-1,g+Math.floor(d/2)))]=SVS.none; }
    if(d>=12){ const sz=z0+Math.floor(d/2); for(let u=x0+1;u<x1;u++){ const k=id(u,sz); if(SK[k]===SVS.none&&!(w>=10&&u===x0+Math.floor(w/2))) { SK[k]=SVS.wall; WD[k]=1; } } for(const gu of [x0+2,x1-2]) SK[id(gu,sz)]=SVS.none; }
    // nada encostado do lado de fora da porta
    const [du,dv]=b.door, out=side===0?[0,-1]:side===1?[0,1]:side===2?[-1,0]:[1,0];
    for(let s=1;s<=2;s++){ const k=id(du+out[0]*s,dv+out[1]*s); if(inC(du+out[0]*s,dv+out[1]*s)&&SK[k]!==SVS.wall) SK[k]=SVS.none; }
    if(T.n) SV.specials[type]=SV.specials[type]||b;
    return b; }
  const faceSide=(B,x0,z0,x1,z1)=>{ // lado do lote mais perto da calçada do quarteirão
    const ds=[z0-B.v0,B.v1-z1,x0-B.u0,B.u1-x1]; let s=0; for(let k=1;k<4;k++) if(ds[k]<ds[s]) s=k; return s; };
  const fenceRect=(x0,z0,x1,z1,gate)=>{ for(let u=x0;u<=x1;u++) for(const v of [z0,z1]){ const k=id(u,v); if(SK[k]===SVS.none){ SK[k]=SVS.fence; WD[k]=1; } }
    for(let v=z0;v<=z1;v++) for(const u of [x0,x1]){ const k=id(u,v); if(SK[k]===SVS.none){ SK[k]=SVS.fence; WD[k]=2; } }
    if(gate) for(const [u,v] of gate) SK[id(u,v)]=SVS.none; };
  const trees=(x0,z0,x1,z1,p)=>{ for(let v=z0;v<=z1;v++) for(let u=x0;u<=x1;u++){ const k=id(u,v); if(SK[k]===SVS.none&&(GK[k]===SVG.grass||GK[k]===SVG.park||GK[k]===SVG.forest)&&R()<p) SK[k]=SVS.tree; } };
  // ---- base do exército: junta os 2×2 quarteirões do canto de cima à direita (a rua entre eles vira pátio)
  const nbx=rx.length-1;
  if(nbx>=3&&rz.length>=3){ const U0=rx[nbx-2].p+rx[nbx-2].w, U1=rx[nbx].p-1, V0=rz[0].p+rz[0].w, V1=rz[2].p-1;
    for(const B of blocks) if(B.i>=nbx-2&&B.j<=1) B.used=true;
    setG(U0,V0,U1,V1,SVG.conc); for(let v=V0;v<=V1;v++) for(let u=U0;u<=U1;u++) SK[id(u,v)]=SVS.none;
    const B={u0:U0+1,v0:V0+1,u1:U1-1,v1:V1-1}; const gm=Math.floor((B.u0+B.u1)/2), gate=[]; for(let o=-2;o<=2;o++) gate.push([gm+o,B.v1]);
    fenceRect(B.u0,B.v0,B.u1,B.v1,gate);
    for(const [u,v] of [[B.u0+1,B.v0+1],[B.u1-2,B.v0+1],[B.u0+1,B.v1-2],[B.u1-2,B.v1-2],[gm-4,B.v1-2],[gm+3,B.v1-2]]) for(let a=0;a<2;a++) for(let c=0;c<2;c++){ const k=id(u+a,v+c); SK[k]=SVS.wall; WD[k]=1; BI[k]=-2; }   // torres de vigia
    const iu0=B.u0+4, iv0=B.v0+4, iu1=B.u1-4, iv1=B.v1-7, w=iu1-iu0, d=iv1-iv0;
    mkB('comando',gm-8,iv1-10,gm+8,iv1,1,2);
    mkB('arsenal',iu1-10,iv1-9,iu1,iv1,1,1);
    const hw=Math.min(26,Math.floor(w*0.4)); mkB('hangar',iu0,iv0,iu0+hw,iv0+Math.min(20,Math.floor(d*0.45)),1,4);
    for(let k=0,bx=iu0+hw+4;k<5&&bx+7<=iu1;k++,bx+=10) mkB('quartel',bx,iv0,bx+7,iv0+Math.min(20,Math.floor(d*0.45)),1,1);
    // caminhões militares no pátio
    for(let k=0;k<4;k++){ const u=iu0+2+k*4, v=iv1-4; for(const dv of [0,1]){ const kk=id(u,v+dv); if(!SK[kk]){ SK[kk]=SVS.car; WD[kk]=2; BI[kk]=-3; } } }
  }
  // ---- locais especiais no centro (mais perto do meio primeiro)
  const free=()=>blocks.filter(b=>!b.used);
  const central=free().sort((a,b)=>a.d-b.d);
  const SPECIALS=['delegacia','bombeiros','hospital','mercado','farmacia','armas','igreja','escola'];
  let si=0;
  for(const B of central){ if(si>=SPECIALS.length) break; const type=SPECIALS[si++]; B.used=true; setG(B.u0,B.v0,B.u1,B.v1,SVG.conc);
    const bw=B.u1-B.u0, bd=B.v1-B.v0; const big=type==='hospital'||type==='mercado'||type==='escola';
    const w=big?bw-2:Math.min(bw-2,ri(14,18)), d=big?bd-4:Math.min(bd-4,ri(12,16));
    const x0=B.u0+1+Math.floor((bw-2-w)/2), z0=B.v0+1; const side=0;
    mkB(type,x0,z0,x0+w,z0+d,side,type==='bombeiros'?4:type==='hospital'||type==='mercado'?2:1);
    if(!big) trees(B.u0,z0+d+2,B.u1,B.v1,0.06); }
  // ---- zona industrial (um lado da cidade) e posto
  let postoDone=false;
  for(const B of free()){ const indus=B.d>0.55&&B.cu<W*0.4&&B.cv>H*0.5; if(!indus) continue; B.used=true; setG(B.u0,B.v0,B.u1,B.v1,SVG.conc);
    const bw=B.u1-B.u0, bd=B.v1-B.v0;
    if(!postoDone){ postoDone=true; const b=mkB('posto',B.u0+2,B.v0+2,B.u0+10,B.v0+8,0,1); b.canopy={u0:B.u0+12,v0:B.v0+2,u1:Math.min(B.u1-2,B.u0+24),v1:B.v0+10};
      for(let u=b.canopy.u0+2;u<=b.canopy.u1-2;u+=4) for(const v of [b.canopy.v0+3,b.canopy.v1-3]) SK[id(u,v)]=SVS.pump;
      mkB('oficina',B.u0+2,B.v1-12,B.u0+14,B.v1-2,1,3); continue; }
    const w=Math.min(bw-6,ri(18,26)), d=Math.min(bd-6,ri(14,20)); mkB('armazem',B.u0+3,B.v0+3,B.u0+3+w,B.v0+3+d,0,3);
    fenceRect(B.u0,B.v0,B.u1,B.v1,[[Math.floor((B.u0+B.u1)/2),B.v1],[Math.floor((B.u0+B.u1)/2)+1,B.v1],[Math.floor((B.u0+B.u1)/2)-1,B.v1]]); }
  // ---- o resto: comércio perto do centro, parques salpicados, casas no resto
  for(const B of free()){ B.used=true; const bw=B.u1-B.u0, bd=B.v1-B.v0;
    if(R()<0.07){ setG(B.u0,B.v0,B.u1,B.v1,SVG.park); const mu=Math.floor((B.u0+B.u1)/2), mv=Math.floor((B.v0+B.v1)/2); setG(mu,B.v0,mu+1,B.v1,SVG.conc); setG(B.u0,mv,B.u1,mv+1,SVG.conc); trees(B.u0,B.v0,B.u1,B.v1,0.16); continue; }
    if(B.d<0.42){ // comércio: 2-3 prédios lado a lado, viradas para a rua de cima e de baixo
      setG(B.u0,B.v0,B.u1,B.v1,SVG.conc); const n=bw>34?3:2, lw=Math.floor((bw+1)/n);
      for(let k=0;k<n;k++){ const x0=B.u0+k*lw+1, x1=Math.min(B.u1-1,x0+lw-3); if(x1-x0<6) continue; const half=Math.floor(bd/2);
        mkB(R()<0.15?'bar':R()<0.5?'loja':'escritorio',x0,B.v0+1,x1,B.v0+Math.min(half-1,ri(9,13)),0,1);
        if(bd>=24) mkB(R()<0.6?'loja':'escritorio',x0,B.v1-Math.min(half-2,ri(9,12)),x1,B.v1-1,1,1); }
      continue; }
    // casas: lotes de 12-14 de largura, uma fileira virada para cada rua (cima e baixo) se couber
    const rows=bd>=24?[0,1]:[0];
    for(const row of rows){ let u=B.u0; const depth=rows.length===2?Math.floor((bd+1)/2):bd+1;
      while(u+11<=B.u1){ const lw=Math.min(ri(12,14),B.u1-u+1); if(lw<11) break;
        const lz0=row===0?B.v0:B.v1-depth+1, lz1=row===0?B.v0+depth-1:B.v1; const x0=u, x1=u+lw-1;
        // cerca do lote com portão na frente
        const front=row===0?lz0:lz1, gm=Math.floor((x0+x1)/2);
        fenceRect(x0,lz0,x1,lz1,[[gm,front],[gm+1,front]]);
        const hw=Math.min(lw-4,ri(8,10)), hd=Math.min(depth-6,ri(7,9)); const hx0=x0+Math.floor((lw-hw)/2);
        const hz0=row===0?lz0+3:lz1-3-hd;
        if(hd>=6) mkB('casa',hx0,hz0,hx0+hw-1,hz0+hd,row===0?0:1,1);
        // caminho do portão até a porta
        for(let s=1;s<=3;s++){ const vv=row===0?front+s:front-s; const k=id(gm,vv); if(GK[k]===SVG.grass) GK[k]=SVG.conc; }
        trees(x0+1,lz0+1,x1-1,lz1-1,0.05);
        u+=lw; } } }
  // ---- carros parados nas ruas (perto da guia, fora dos cruzamentos)
  const car=(u,v,du,dv)=>{ const a=id(u,v), b=id(u+du,v+dv); if(!inC(u+du,v+dv)) return; if(GK[a]!==SVG.road||GK[b]!==SVG.road||SK[a]||SK[b]) return; SK[a]=SK[b]=SVS.car; WD[a]=WD[b]=du?1:2; };
  for(const r of rx) for(let v=M;v<H-M-1;v+=ri(5,11)){ if(isRZ[v]||isRZ[v+1]) continue; if(R()<0.35) car(R()<0.5?r.p:r.p+r.w-1,v,0,1); }
  for(const r of rz) for(let u=M;u<W-M-1;u+=ri(5,11)){ if(isRX[u]||isRX[u+1]) continue; if(R()<0.35) car(u,R()<0.5?r.p:r.p+r.w-1,1,0); }
  // ---- mata
  for(let v=0;v<H;v++) for(let u=0;u<W;u++){ const k=id(u,v); if(GK[k]===SVG.forest&&!SK[k]&&R()<0.11) SK[k]=SVS.tree; }
  // ---- onde o jogador nasce: dentro de uma casa a meio caminho entre o centro e a borda
  const casas=bld.filter(b=>b.type==='casa'); casas.sort((a,b)=>Math.abs(Math.hypot((a.x0+a.x1)/2-W/2,(a.z0+a.z1)/2-H/2)-W*0.3)-Math.abs(Math.hypot((b.x0+b.x1)/2-W/2,(b.z0+b.z1)/2-H/2)-W*0.3));
  const home=casas[Math.floor(R()*Math.min(6,casas.length))]||bld[0];
  SV.spawn={u:Math.floor((home.x0+home.x1)/2)+0.5, v:Math.floor((home.z0+home.z1)/2)+0.5, home};
  // garante que o centro da casa está livre (pode cair numa divisória)
  for(const [du,dv] of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){ const k=id(Math.floor(SV.spawn.u)+du,Math.floor(SV.spawn.v)+dv); if(!SK[k]){ SV.spawn.u=Math.floor(SV.spawn.u)+du+0.5; SV.spawn.v=Math.floor(SV.spawn.v)+dv+0.5; break; } }
  Object.assign(SV,{seed,gen:true,GK,SK,BI,WD,bld,rx,rz,isRX,isRZ}); SV.chunks.forEach(c=>{ try{ MAPG.surv.remove(c.g); svDispose(c.g); }catch(e){} }); SV.chunks.clear();
  const wx=u=>(u+SV.OX)*S, wz=v=>v*S;
  MAPS.surv.start=[wx(SV.spawn.u),wz(SV.spawn.v)]; MAPS.surv.start2=[wx(SV.spawn.u)+0.8,wz(SV.spawn.v)]; MAPS.surv.menu={x:wx(SV.spawn.u),z:wz(SV.spawn.v),yaw:0};
  return SV; }
MAPS.surv={name:'Sobrevivência',start:[0,0],start2:[0,0],room:'SO',menu:{x:0,z:0,yaw:0},fog:0x8c949e,fogD:0.0135,bg:0x8c949e,sky:'farm'};
MAPG.surv=new THREE.Group(); scene.add(MAPG.surv); MAPG.surv.visible=false;
OUTR.add('SO');

/* ---------------- troca de grade ---------------- */
function svSwapIn(){ if(SV.in) return; if(!SV.gen) svGen((Date.now()^0x5bd1e995)>>>0);
  // altura = a maior entre a cidade e a grade normal: o reinício das portas/janelas dos outros mapas escreve nas linhas deles
  // (sempre em colunas < 48, que aqui são a faixa vazia antes da cidade), então essas linhas precisam existir
  const W=SV.OX+SV.CW, H=Math.max(SV.CH,MH);
  SV.save={MW,MH,grid:grid.splice(0),roomOf:roomOf.splice(0),FH,CH,RAMPC,indoor,propCell,flow};
  MW=W; MH=H;
  for(let z=0;z<H;z++){ const row=new Array(W).fill('#'), rr=new Array(W).fill(null);
    if(z<SV.CH) for(let u=0;u<SV.CW;u++){ const k=z*SV.CW+u, s=SV.SK[k], x=u+SV.OX;
      row[x]=s===SVS.none?'.':s===SVS.win?'W':s===SVS.fence||s===SVS.pump?'k':s===SVS.car?'c':'#';
      rr[x]=(SV.GK[k]===SVG.floor&&SV.BI[k]>=0)?'SB'+SV.BI[k]:'SO'; }
    grid.push(row); roomOf.push(rr); }
  FH=new Float32Array(W*H); CH=new Float32Array(W*H).fill(WH); RAMPC=new Int16Array(W*H).fill(-1); propCell=new Uint8Array(W*H);
  indoor=new Uint8Array(W*H); for(let z=0;z<H;z++) for(let x=0;x<W;x++){ const r=roomOf[z][x]; if(r&&!OUTR.has(r)) indoor[z*W+x]=1; }
  flow=new Int16Array(W*H).fill(-1); flowDirty=true; flowCell=-1;
  try{ for(const rp of NET.players.values()) rp.flow=new Int16Array(W*H).fill(-1); }catch(e){}
  SV.in=true; }
function svSwapOut(){ if(!SV.in) return; const s=SV.save; MW=s.MW; MH=s.MH; grid.splice(0); roomOf.splice(0); for(const r of s.grid) grid.push(r); for(const r of s.roomOf) roomOf.push(r);
  FH=s.FH; CH=s.CH; RAMPC=s.RAMPC; indoor=s.indoor; propCell=s.propCell; flow=s.flow; flowDirty=true; flowCell=-1;
  try{ for(const rp of NET.players.values()) rp.flow=new Int16Array(MW*MH).fill(-1); }catch(e){}
  SV.save=null; SV.in=false; }
{ const sm0=setMap; setMap=function(k){ try{ if(k==='surv') svSwapIn(); else if(SV.in) svSwapOut(); }catch(e){ console.warn('[Bunker] sobrevivência: troca de grade',e); }
    const r=sm0.apply(this,arguments); try{ svSky(k==='surv'); }catch(e){} return r; }; }
// dia nublado: céu liso sem estrelas nem lua, luz ambiente forte e um sol baixo (só neste mapa)
const SVL={sun:null,sky:null};
function svSky(on){ if(!SVL.sun){ SVL.sun=new THREE.DirectionalLight(0xfff0dc,0.75); SVL.sun.position.set(-0.6,1,0.35); MAPG.surv.add(SVL.sun); MAPG.surv.add(SVL.sun.target); }
  if(typeof skyMat!=='undefined'&&skyMat){ if(on){ if(!SVL.sky) SVL.sky={map:skyMat.map,col:skyMat.color?skyMat.color.getHex():null}; skyMat.map=null; if(skyMat.color) skyMat.color.setHex(0x9aa4b0); skyMat.needsUpdate=true; }
    else if(SVL.sky){ if(skyMat.color&&SVL.sky.col!=null) skyMat.color.setHex(SVL.sky.col); SVL.sky=null; skyMat.needsUpdate=true; } }
  if(on&&typeof skyStars!=='undefined'&&skyStars) skyStars.visible=false;   // fora daqui o setMap normal já decide
  if(typeof skyMoon!=='undefined'&&skyMoon) skyMoon.visible=!on; }
{ const ul0=updateLights; updateLights=function(dt){ const r=ul0.apply(this,arguments); if(CUR==='surv'&&hemi){ hemi.color.setHex(0xd4dae4); hemi.groundColor.setHex(0x5a5040); hemi.intensity=1.35; if(SVL.sun) SVL.sun.position.set(P.pos.x-60,100,P.pos.z+35), SVL.sun.target.position.set(P.pos.x,0,P.pos.z); } return r; }; }
// caminho dos zumbis: na cidade, busca só até ~140 m do alvo
{ const cf0=computeFlowAt; computeFlowAt=function(arr,px,pz){ if(!SV.in) return cf0.apply(this,arguments);
    arr.fill(-1); if(!inB(px,pz)) return; const q=[px+pz*MW]; arr[q[0]]=0; let h=0; const LIM=70;
    while(h<q.length){ const i=q[h++], d=arr[i]; if(d>=LIM) continue; const x=i%MW, z=(i/MW)|0;
      for(const [dx,dz] of N8){ if(!canStep(x,z,dx,dz)) continue; const j=(x+dx)+(z+dz)*MW; if(arr[j]<0){ arr[j]=d+1; q.push(j); } } } }; }
// sem rodadas na cidade
{ const sr0=startRound; startRound=function(r){ if(CUR==='surv'){ G.round=Math.max(1,r|0); G.toSpawn=0; return; } return sr0.apply(this,arguments); }; }

/* ---------------- desenho em pedaços ---------------- */
const SVM={};
function svMats(){ if(SVM.wall) return SVM;
  SVM.box=new THREE.BoxGeometry(1,1,1); SVM.cyl=new THREE.CylinderGeometry(0.22,0.32,1,6); SVM.ico=new THREE.IcosahedronGeometry(1,0);
  SVM.wall=new THREE.MeshLambertMaterial({color:0xffffff}); SVM.glass=new THREE.MeshLambertMaterial({color:0x2a3440,emissive:0x0c1218});
  SVM.fence=new THREE.MeshLambertMaterial({color:0x6a5a46}); SVM.trunk=new THREE.MeshLambertMaterial({color:0x4a3626}); SVM.leaf=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true});
  SVM.car=new THREE.MeshLambertMaterial({color:0xffffff}); SVM.carTop=new THREE.MeshLambertMaterial({color:0x22262a}); SVM.roof=new THREE.MeshLambertMaterial({color:0xffffff});
  SVM.pump=new THREE.MeshLambertMaterial({color:0xc83a2a}); return SVM; }
function svDispose(g){ g.traverse(o=>{ if(o.isInstancedMesh) o.dispose&&o.dispose(); if(o.material&&o.material.map){ o.material.map.dispose(); o.material.dispose(); } if(o.geometry&&o.geometry.isPlaneGeometry) o.geometry.dispose(); }); }
const _svO=new THREE.Object3D(), _svC=new THREE.Color();
function svInst(geo,mat,list,g){ if(!list.length) return; const m=new THREE.InstancedMesh(geo,mat,list.length);
  list.forEach((it,i)=>{ _svO.position.set(it[0],it[1],it[2]); _svO.rotation.set(0,it[6]||0,0); _svO.scale.set(it[3],it[4],it[5]); _svO.updateMatrix(); m.setMatrixAt(i,_svO.matrix); if(it[7]!=null) m.setColorAt(i,_svC.setHex(it[7])); });
  m.instanceMatrix.needsUpdate=true; if(m.instanceColor) m.instanceColor.needsUpdate=true; g.add(m); return m; }
function svGroundTex(u0,v0){ const n=SV.CK, PX=8, W=SV.CW; const cv=document.createElement('canvas'); cv.width=cv.height=n*PX; const c=cv.getContext('2d');
  const R=svRng((SV.seed^(u0*73856093)^(v0*19349663))>>>0);
  const col=(k,b)=>k===SVG.road?'#2c2d30':k===SVG.side?'#7a766e':k===SVG.grass?'#3f4a2c':k===SVG.park?'#42502e':k===SVG.conc?'#5f5f5b':k===SVG.dirt?'#5a4a36':k===SVG.forest?'#2f3a22':k===SVG.floor?(b>=0&&SV.bld[b]?SVT[SV.bld[b].type].f:'#6b4f36'):'#333';
  for(let v=0;v<n;v++) for(let u=0;u<n;u++){ const gu=u0+u, gv=v0+v; if(gu>=W||gv>=SV.CH) continue; const k=gv*W+gu; c.fillStyle=col(SV.GK[k],SV.BI[k]); c.fillRect(u*PX,v*PX,PX,PX); }
  // grão
  for(let i=0;i<n*n*1.5;i++){ c.globalAlpha=R()*0.16; c.fillStyle=R()<0.5?'#000':'#fff'; c.fillRect(R()*n*PX,R()*n*PX,1+R()*2,1+R()*2); } c.globalAlpha=1;
  // faixas no meio das ruas (tracejado), fora dos cruzamentos
  c.fillStyle='#c9b24a';
  for(const r of SV.rx){ const mid=r.p+r.w/2; if(mid<u0||mid>u0+n) continue; const x=(mid-u0)*PX-1; for(let v=0;v<n;v++){ const gv=v0+v; if(gv<22||gv>=SV.CH-22||SV.isRZ[gv]||SV.GK[gv*W+Math.floor(mid)]!==SVG.road) continue; if(gv%3!==0) c.fillRect(x,v*PX,2,PX); } }
  for(const r of SV.rz){ const mid=r.p+r.w/2; if(mid<v0||mid>v0+n) continue; const y=(mid-v0)*PX-1; for(let u=0;u<n;u++){ const gu=u0+u; if(gu<22||gu>=SV.CW-22||SV.isRX[gu]||SV.GK[Math.floor(mid)*W+gu]!==SVG.road) continue; if(gu%3!==0) c.fillRect(u*PX,y,PX,2); } }
  const t=new THREE.CanvasTexture(cv); t.anisotropy=Math.min(4,maxAniso); return t; }
function svSign(text,col){ const cv=document.createElement('canvas'); cv.width=512; cv.height=112; const c=cv.getContext('2d');
  c.fillStyle='#14110e'; c.fillRect(0,0,512,112); c.strokeStyle=col; c.lineWidth=6; c.strokeRect(6,6,500,100);
  c.fillStyle='#efe6d2'; c.font='bold 58px Impact, "Stardos Stencil", sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(text,256,60);
  const t=new THREE.CanvasTexture(cv); return new THREE.Mesh(new THREE.PlaneGeometry(4.4,0.96),new THREE.MeshLambertMaterial({map:t,emissive:0x1a1612,side:THREE.DoubleSide})); }
function svBuildChunk(ci,cj){ const M=svMats(), n=SV.CK, u0=ci*n, v0=cj*n, W=SV.CW, g=new THREE.Group();
  const wx=u=>(u+SV.OX)*S+S/2, wz=v=>v*S+S/2;
  // chão
  const gm=new THREE.Mesh(new THREE.PlaneGeometry(n*S,n*S),new THREE.MeshLambertMaterial({map:svGroundTex(u0,v0)}));
  gm.rotation.x=-Math.PI/2; gm.position.set((u0+SV.OX)*S+n*S/2,0,v0*S+n*S/2); gm.receiveShadow=false; g.add(gm);
  const walls=[], glass=[], fence=[], trunk=[], leaf=[], cars=[], tops=[], roofs=[], pumps=[];
  const R=svRng((SV.seed*31+ci*977+cj*131)>>>0);
  for(let v=v0;v<Math.min(v0+n,SV.CH);v++) for(let u=u0;u<Math.min(u0+n,W);u++){ const k=v*W+u, s=SV.SK[k]; if(!s) continue; const x=wx(u), z=wz(v);
    const b=SV.BI[k], colW=b>=0&&SV.bld[b]?SV.bld[b].col:0x6a6e60;
    if(s===SVS.wall) walls.push([x,WH/2,z,S,WH,S,0,colW]);
    else if(s===SVS.win){ const along=SV.WD[k]===2?Math.PI/2:0; walls.push([x,0.45,z,S,0.9,S,0,colW]); walls.push([x,2.8,z,S,0.8,S,0,colW]); glass.push([x,1.65,z,S,1.5,0.08,along]); }
    else if(s===SVS.fence){ const along=SV.WD[k]===2?Math.PI/2:0; fence.push([x,0.6,z,S,1.2,0.14,along]); }
    else if(s===SVS.tree){ const h=2.4+R()*1.8, r=1.4+R()*1.2; trunk.push([x,h/2,z,1,h,1,0]); const gc=[0x3c5a2a,0x4a6230,0x34502a,0x56602e][Math.floor(R()*4)]; leaf.push([x,h+r*0.55,z,r,r*1.15,r,R()*6,gc]); }
    else if(s===SVS.car){ const along=SV.WD[k]===1; const kn=along?k+1:k+W; if(along?(u+1>=W||SV.SK[kn]!==SVS.car):(v+1>=SV.CH||SV.SK[kn]!==SVS.car)) continue;   // desenha só pela 1ª das duas células
      const cxp=along?x+S/2:x, czp=along?z:z+S/2, ry=along?Math.PI/2:0; const cc=SV.BI[k]===-3?0x4a5232:[0x6a2a22,0x2a3a5a,0x8a8a86,0x2a2a2a,0x5a5a3a,0x9a7a3a,0x3a4a3a][Math.floor(R()*7)];
      cars.push([cxp,0.62,czp,1.85,0.8,4.2,ry,cc]); tops.push([cxp,1.28,czp+(along?0:-0.2),1.6,0.6,2.1,ry]); }
    else if(s===SVS.pump){ pumps.push([x,0.7,z,0.6,1.4,0.9,0]); } }
  // telhados (pelo pedaço onde fica o centro do prédio)
  for(const b of SV.bld){ const cu=(b.x0+b.x1)/2, cv=(b.z0+b.z1)/2; if(cu<u0||cu>=u0+n||cv<v0||cv>=v0+n) continue;
    const T=SVT[b.type]; roofs.push([((b.x0+b.x1)/2+SV.OX)*S+S/2,WH+0.15,(b.z0+b.z1)/2*S+S/2,(b.x1-b.x0+1)*S+0.3,0.3,(b.z1-b.z0+1)*S+0.3,0,T.r]);
    if(b.canopy){ const C=b.canopy; roofs.push([((C.u0+C.u1)/2+SV.OX)*S+S/2,4.2,(C.v0+C.v1)/2*S+S/2,(C.u1-C.u0+1)*S,0.35,(C.v1-C.v0+1)*S,0,0xd8d8d0]); }
    if(b.name&&b.door){ const sg=svSign(b.name,'#'+new THREE.Color(T.w[0]).getHexString()); const [du,dv]=b.door; const side=b.side, off=S/2+0.06;
      sg.position.set(wx(du)+(side===2?-off:side===3?off:0),WH-0.55,wz(dv)+(side===0?-off:side===1?off:0)); sg.rotation.y=side===0?Math.PI:side===1?0:side===2?-Math.PI/2:Math.PI/2; g.add(sg); } }
  svInst(M.box,M.wall,walls,g); svInst(M.box,M.glass,glass,g); svInst(M.box,M.fence,fence,g); svInst(M.cyl,M.trunk,trunk,g); svInst(M.ico,M.leaf,leaf,g);
  svInst(M.box,M.car,cars,g); svInst(M.box,M.carTop,tops,g); svInst(M.box,M.roof,roofs,g); svInst(M.box,M.pump,pumps,g);
  g.traverse(o=>{ if(o.isMesh){ o.matrixAutoUpdate=o.isInstancedMesh?false:o.matrixAutoUpdate; } });
  return g; }
function svChunksFrame(){ if(CUR!=='surv'||!SV.gen) return; const n=SV.CK, pu=Math.floor(P.pos.x/S)-SV.OX, pv=Math.floor(P.pos.z/S);
  const pci=Math.floor(pu/n), pcj=Math.floor(pv/n), NC=Math.ceil(SV.CW/n), NR=Math.ceil(SV.CH/n), R=SV.R; let built=0; const want=[];
  for(let dj=-R;dj<=R;dj++) for(let di=-R;di<=R;di++){ const ci=pci+di, cj=pcj+dj; if(ci<0||cj<0||ci>=NC||cj>=NR) continue; want.push([ci,cj,Math.abs(di)+Math.abs(dj)]); }
  want.sort((a,b)=>a[2]-b[2]); const on=new Set();
  for(const [ci,cj] of want){ const key=ci+','+cj; on.add(key); let c=SV.chunks.get(key);
    if(!c){ if(built>=2) continue; c={g:svBuildChunk(ci,cj)}; SV.chunks.set(key,c); MAPG.surv.add(c.g); built++; }
    c.g.visible=true; }
  for(const [key,c] of SV.chunks) if(!on.has(key)) c.g.visible=false; }
v9On('frame',()=>{ try{ svChunksFrame(); }catch(e){ console.warn('[Bunker] sobrevivência: pedaços',e); } });

/* ---------------- entrar / sair (etapa 1: pelo console) ---------------- */
function svStart(){ for(const z of zombies.slice()) removeZombie(z); G.toSpawn=0; G.round=1; setMap('surv'); G.rooms=new Set(['SO']);
  const [x,z]=MAPS.surv.start; P.pos.set(x,0,z); P.y=0; P.vy=0; P.yaw=0; try{ resetMotion(); }catch(e){} flowDirty=true; svChunksFrame();
  banner('SOBREVIVÊNCIA','Cidade nº '+(SV.seed%100000)+' · etapa 1: explore a cidade','gold'); }
function svEnter(newCity){ if(NET.mode){ cprint('Sobrevivência por enquanto é só no solo (o cooperativo vem depois).','err'); return; }
  if(newCity||!SV.gen) svGen((Date.now()^0x5bd1e995)>>>0);
  try{ closeConsole(); }catch(e){} setMap('surv'); (typeof MLD!=='undefined'&&MLD.sg?MLD.sg:startGame)();   // pula a tela de carregamento (ela não conhece este mapa)
  const t0=Date.now(); const iv=setInterval(()=>{ if(G.state==='playing'&&CUR==='surv'){ clearInterval(iv); try{ svStart(); }catch(e){ console.warn('[Bunker] sobrevivência',e); } } else if(Date.now()-t0>20000) clearInterval(iv); },150); }
CMDS.sobrevivencia={d:'sobrevivencia [nova] · entra na cidade do modo Sobrevivência (etapa 1: explorar) · "nova" sorteia outra cidade',f:a=>{ svEnter(a[0]==='nova'); }};
CMDS.sv_ir={cheat:1,d:'sv_ir <delegacia|bombeiros|hospital|mercado|farmacia|armas|igreja|escola|posto|oficina|comando|arsenal|casa> · vai até o local na cidade',f:a=>{
  if(CUR!=='surv'){ cprint('Entre na sobrevivência primeiro (comando sobrevivencia).','err'); return; } const t=String(a[0]||'').toLowerCase();
  const b=t==='casa'?SV.spawn.home:SV.bld.find(q=>q.type===t); if(!b){ cprint('Locais: '+Object.keys(SV.specials).concat(['posto','oficina','comando','arsenal','casa']).join(', '),'err'); return; }
  const [du,dv]=b.door, side=b.side, o=side===0?[0,-2.5]:side===1?[0,2.5]:side===2?[-2.5,0]:[2.5,0];
  P.pos.set((du+SV.OX)*S+S/2+o[0]*S/2.5*1.2,0,dv*S+S/2+o[1]*S/2.5*1.2); P.y=0; P.yaw=side===0?0:side===1?Math.PI:side===2?-Math.PI/2:Math.PI/2; try{ resetMotion(); }catch(e){} flowDirty=true; cprint('na porta: '+t); }};
/* mapa da cidade inteira (depuração; a base do item Mapa da etapa 2) */
function svDrawMap(c,px){ const W=SV.CW, H=SV.CH; c.canvas.width=W*px; c.canvas.height=H*px;
  const col=(g,s,b)=>s===SVS.wall||s===SVS.win?(b>=0&&SV.bld[b]&&SVT[SV.bld[b].type].n?'#c8452e':'#2a2622'):s===SVS.fence?'#8a7a5a':s===SVS.tree?'#24361c':s===SVS.car?'#9a9a90':s===SVS.pump?'#c8452e':
    g===SVG.road?'#55565a':g===SVG.side?'#8a867e':g===SVG.grass?'#4d5a36':g===SVG.park?'#557040':g===SVG.conc?'#6e6e6a':g===SVG.dirt?'#6a5a40':g===SVG.forest?'#33402a':'#a08a6a';
  for(let v=0;v<H;v++) for(let u=0;u<W;u++){ const k=v*W+u; c.fillStyle=col(SV.GK[k],SV.SK[k],SV.BI[k]); c.fillRect(u*px,v*px,px,px); }
  c.font=`bold ${Math.max(10,px*5)}px sans-serif`; c.textAlign='center'; c.fillStyle='#fff'; c.strokeStyle='#000'; c.lineWidth=3;
  for(const b of SV.bld){ const T=SVT[b.type]; if(!T.n) continue; const x=(b.x0+b.x1)/2*px, y=(b.z0+b.z1)/2*px; c.strokeText(T.n,x,y); c.fillText(T.n,x,y); }
  const u=P.pos.x/S-SV.OX, v=P.pos.z/S; if(CUR==='surv'){ c.fillStyle='#ffdc3a'; c.beginPath(); c.arc(u*px,v*px,px*2.5,0,7); c.fill(); } }
CMDS.sv_mapa={d:'sv_mapa · mostra a cidade inteira (depuração)',f:()=>{ if(!SV.gen) svGen((Date.now()^0x5bd1e995)>>>0); let el=document.getElementById('svmap'); if(el){ el.remove(); return; }
  el=document.createElement('canvas'); el.id='svmap'; el.style.cssText='position:fixed;inset:0;margin:auto;max-width:96vmin;max-height:96vmin;z-index:9999;border:2px solid #c9a24a;background:#000;image-rendering:pixelated';
  svDrawMap(el.getContext('2d'),3); el.onclick=()=>el.remove(); document.body.appendChild(el); cprint('Cidade nº '+(SV.seed%100000)+': '+SV.bld.length+' prédios. Clique no mapa para fechar.'); }};
