/* ================= v9 · CARTAS COM EFEITO PRÓPRIO =================
   Ao escolher, a carta vira o próprio assunto: Balas Incendiárias explode e queima até virar cinza, Balas Elétricas leva
   choque e some num estalo, Gelo congela e estilhaça, Granadeiro tem o pino puxado e explode, Sangue escorre, Moedas
   jorram, Lâmina corta a carta ao meio, Roleta Russa gira o tambor e dispara… Cada tema tem som, partículas, luz na tela
   e vibração próprios no DualSense. Tudo é local, por cima do jogo, e some em ~1,5 s. */
const CFX={L:null,cv:null,g:null,w:0,h:0,dpr:1,P:[],run:[],raf:0,last:0};
v9Css(`#cfxl{position:fixed;inset:0;z-index:70;pointer-events:none;overflow:hidden}
#cfxl canvas{position:absolute;inset:0;width:100%;height:100%}
#cfxl .card{position:fixed;margin:0;transform-origin:50% 50%;will-change:transform,clip-path,filter,opacity;pointer-events:none;animation:none!important;transition:none!important}
#cfxl .cfxov{position:absolute;inset:0;border-radius:inherit;pointer-events:none}`);
function cfxEnsure(){ if(CFX.L) return; const L=document.createElement('div'); L.id='cfxl'; const cv=document.createElement('canvas'); L.appendChild(cv); document.body.appendChild(L);
  CFX.L=L; CFX.cv=cv; CFX.g=cv.getContext('2d'); const rs=()=>{ CFX.dpr=Math.min(2,devicePixelRatio||1); CFX.w=innerWidth; CFX.h=innerHeight; cv.width=CFX.w*CFX.dpr|0; cv.height=CFX.h*CFX.dpr|0; }; rs(); addEventListener('resize',rs); }
const cr=(a,b)=>a+Math.random()*(b-a), cl01=v=>v<0?0:v>1?1:v, eo=k=>1-Math.pow(1-k,3), ei=k=>k*k*k;
/* ---- sons e vibração ---- */
function cfxS(n,o,d){ const f=()=>{ try{ Snd.sample(n,Object.assign({prio:1,wet:0.15},o||{})); }catch(e){} }; if(d) setTimeout(f,d*1000); else f(); }
function cfxSyn(fn,d){ const f=()=>{ try{ if(!Snd.ctx) return; const o=Snd.out(0.7,0,0.25,null); if(o) fn(o,Snd.now); }catch(e){} }; if(d) setTimeout(f,d*1000); else f(); }
function cfxR(s,w,ms,d){ if(typeof PAD==='undefined'||!PAD.active) return; const f=()=>{ try{ padRumble(s,w,ms); }catch(e){} }; if(d) setTimeout(f,d*1000); else f(); }
function cfxHeart(d){ cfxSyn((o,t)=>{ for(const dd of [0,0.17]) Snd.oscTo(o,{t:t+dd,type:'sine',freq:72,freqEnd:38,dur:0.2,gain:0.75,attack:0.003}); },d); cfxR(0.65,0,70,d||0); cfxR(0.4,0,60,(d||0)+0.17); }
function cfxCrackle(dur,gain,freq){ cfxSyn((o,t)=>{ for(let i=0;i<Math.round(dur*28);i++) Snd.burstTo(o,{t:t+Math.random()*dur,type:'bandpass',freq:(freq||2400)*cr(0.6,1.5),q:3,dur:cr(0.01,0.03),gain:(gain||0.25)*cr(0.4,1)}); }); }
/* ---- partículas ---- */
function cfxP(o){ if(CFX.P.length>900) return; CFX.P.push(Object.assign({vx:0,vy:0,ay:0,drag:0,life:1,max:1,size:3,rot:0,vr:0,col:'#fff',type:'spark',add:false},o)); }
function cfxBurst(n,x,y,f){ for(let i=0;i<n;i++) cfxP(f(i,x,y)); }
function cfxDrawP(g,p){ const a=cl01(p.life/p.max); g.globalCompositeOperation=p.add?'lighter':'source-over'; g.fillStyle=p.col; g.strokeStyle=p.col;
  switch(p.type){
    case 'spark': { g.globalAlpha=a; g.lineWidth=p.size; g.beginPath(); g.moveTo(p.x,p.y); g.lineTo(p.x-p.vx*0.035,p.y-p.vy*0.035); g.stroke(); break; }
    case 'ember': case 'dot': { g.globalAlpha=a; g.beginPath(); g.arc(p.x,p.y,p.size*(p.type==='ember'?(0.5+a*0.5):1),0,6.283); g.fill(); break; }
    case 'flame': { const r=p.size*(1.4-a*0.6); const gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,r); gr.addColorStop(0,p.c0||'rgba(255,240,180,'+a+')'); gr.addColorStop(0.4,p.c1||'rgba(255,140,30,'+(a*0.8)+')'); gr.addColorStop(1,'rgba(120,20,0,0)'); g.globalAlpha=1; g.fillStyle=gr; g.beginPath(); g.arc(p.x,p.y,r,0,6.283); g.fill(); break; }
    case 'smoke': { const r=p.size*(2-a); g.globalAlpha=a*0.35; g.beginPath(); g.arc(p.x,p.y,r,0,6.283); g.fill(); break; }
    case 'shard': { g.globalAlpha=a; g.save(); g.translate(p.x,p.y); g.rotate(p.rot); g.beginPath(); g.moveTo(-p.size,-p.size*0.4); g.lineTo(p.size*0.9,-p.size*0.7); g.lineTo(p.size*0.2,p.size); g.closePath(); g.fill(); if(p.edge){ g.strokeStyle=p.edge; g.lineWidth=1; g.stroke(); } g.restore(); break; }
    case 'drop': { g.globalAlpha=a; const sp=Math.hypot(p.vx,p.vy), k=Math.min(3,1+sp/260); g.save(); g.translate(p.x,p.y); g.rotate(Math.atan2(p.vy,p.vx)); g.beginPath(); g.ellipse(0,0,p.size*k,p.size,0,0,6.283); g.fill(); g.restore(); break; }
    case 'coin': { g.globalAlpha=a; const sx=Math.abs(Math.cos(p.rot)); g.save(); g.translate(p.x,p.y); g.scale(Math.max(0.12,sx),1); g.beginPath(); g.arc(0,0,p.size,0,6.283); g.fillStyle='#f6c945'; g.fill(); g.lineWidth=1.5; g.strokeStyle='#9c6a12'; g.stroke(); g.fillStyle='#fff3b0'; g.globalAlpha=a*0.8*sx; g.beginPath(); g.arc(-p.size*0.3,-p.size*0.3,p.size*0.3,0,6.283); g.fill(); g.restore(); break; }
    case 'leaf': { g.globalAlpha=a; g.save(); g.translate(p.x,p.y); g.rotate(p.rot); g.fillStyle=p.col; for(let i=0;i<3;i++){ const an=i*2.094; g.beginPath(); g.arc(Math.cos(an)*p.size*0.6,Math.sin(an)*p.size*0.6,p.size*0.55,0,6.283); g.fill(); } g.restore(); break; }
    case 'star': { g.globalAlpha=a; g.save(); g.translate(p.x,p.y); g.rotate(p.rot); const s=p.size*(0.6+0.4*Math.sin(p.life*30)); g.beginPath(); for(let i=0;i<8;i++){ const r=i%2?s*0.28:s, an=i*0.785; g.lineTo(Math.cos(an)*r,Math.sin(an)*r); } g.closePath(); g.fill(); g.restore(); break; }
    case 'heart': { g.globalAlpha=a; g.save(); g.translate(p.x,p.y); const s=p.size/10; g.scale(s,s); g.beginPath(); g.moveTo(0,4); g.bezierCurveTo(-10,-4,-5,-12,0,-6); g.bezierCurveTo(5,-12,10,-4,0,4); g.fill(); g.restore(); break; }
    case 'casing': { g.globalAlpha=a; g.save(); g.translate(p.x,p.y); g.rotate(p.rot); g.fillStyle='#d8a640'; g.fillRect(-p.size,-p.size*0.35,p.size*2,p.size*0.7); g.fillStyle='#8a5a18'; g.fillRect(p.size*0.7,-p.size*0.35,p.size*0.3,p.size*0.7); g.restore(); break; }
    case 'frost': { g.globalAlpha=a; g.save(); g.translate(p.x,p.y); g.rotate(p.rot); g.lineWidth=1.2; g.beginPath(); for(let i=0;i<3;i++){ const an=i*1.047; g.moveTo(-Math.cos(an)*p.size,-Math.sin(an)*p.size); g.lineTo(Math.cos(an)*p.size,Math.sin(an)*p.size); } g.stroke(); g.restore(); break; }
    case 'ring': { const k=1-a; g.globalAlpha=a*0.9; g.lineWidth=Math.max(1,p.lw*(1-k)); g.beginPath(); g.arc(p.x,p.y,p.size+p.grow*k,0,6.283); g.stroke(); break; }
    case 'plus': { g.globalAlpha=a; const s=p.size; g.fillRect(p.x-s,p.y-s*0.3,s*2,s*0.6); g.fillRect(p.x-s*0.3,p.y-s,s*0.6,s*2); break; }
    case 'bubble': { g.globalAlpha=a*0.7; g.lineWidth=1.2; g.beginPath(); g.arc(p.x,p.y,p.size,0,6.283); g.stroke(); break; }
  } }
function cfxBolt(g,x0,y0,x1,y1,col,w,depth){ const pts=[[x0,y0]]; const n=8+(Math.random()*6|0); const dx=x1-x0, dy=y1-y0, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
  for(let i=1;i<n;i++){ const t=i/n, off=(Math.random()-0.5)*L*0.22; pts.push([x0+dx*t+nx*off,y0+dy*t+ny*off]); } pts.push([x1,y1]);
  g.globalCompositeOperation='lighter'; g.strokeStyle=col; g.shadowColor=col; g.shadowBlur=14; g.lineJoin='round';
  for(const [lw,al] of [[w*3,0.25],[w,1]]){ g.globalAlpha=al; g.lineWidth=lw; g.beginPath(); pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.stroke(); }
  g.shadowBlur=0; if(depth>0&&Math.random()<0.6){ const p=pts[(Math.random()*pts.length)|0]; cfxBolt(g,p[0],p[1],p[0]+cr(-60,60),p[1]+cr(-60,60),col,w*0.6,depth-1); } return pts; }
function cfxVig(g,col,a){ if(a<=0.005) return; const w=CFX.w,h=CFX.h; const gr=g.createRadialGradient(w/2,h/2,Math.min(w,h)*0.3,w/2,h/2,Math.max(w,h)*0.75); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,col); g.globalCompositeOperation='source-over'; g.globalAlpha=cl01(a); g.fillStyle=gr; g.fillRect(0,0,w,h); }
/* ---- a carta clonada ---- */
function cfxSet(st){ const e=st.el; e.style.transform=`translate(${st.tx}px,${st.ty}px) rotate(${st.rot}deg) rotateY(${st.ry||0}deg) skewX(${st.sk||0}deg) scale(${st.sc})`; e.style.opacity=st.op; e.style.filter=st.f||'none'; }
function cfxPts(st){ const r=st.r; return {x:r.left,y:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}; }
function cfxRandOn(st,pad){ const b=cfxPts(st); return [b.x+cr(-(pad||0),b.w+(pad||0)),b.y+cr(-(pad||0),b.h+(pad||0))]; }
function cfxEdge(st){ const b=cfxPts(st), s=Math.random()*4|0, t=Math.random(); return s===0?[b.x+b.w*t,b.y]:s===1?[b.x+b.w,b.y+b.h*t]:s===2?[b.x+b.w*t,b.y+b.h]:[b.x,b.y+b.h*t]; }
// borda irregular que sobe (para queimar, congelar, rachar)
function cfxJag(st,yFromTop,amp,seed){ const b=cfxPts(st), n=14, pts=[]; for(let i=0;i<=n;i++){ const x=i/n; const j=(Math.sin(x*17+seed+st.t*7)*0.5+Math.sin(x*41+seed*2.3-st.t*11)*0.35+Math.sin(x*7+seed*5)*0.4)*amp; pts.push([x*100,yFromTop+j/b.h*100]); } return pts; }
function cfxShards(st,n,cols,edge,spd){ const b=cfxPts(st); for(let i=0;i<n;i++){ const x=b.x+Math.random()*b.w, y=b.y+Math.random()*b.h, an=Math.atan2(y-b.cy,x-b.cx)+cr(-0.4,0.4), sp=cr(spd*0.4,spd);
  cfxP({type:'shard',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-cr(60,200),ay:900,drag:0.6,life:cr(0.7,1.3),max:1.3,size:cr(6,18),rot:Math.random()*6,vr:cr(-12,12),col:cols[i%cols.length],edge}); } }
/* ---- temas ---- */
const CFXT={};
// FOGO: queima de baixo para cima, chamas e brasas na borda, vira cinza
function cfxFireTheme(gold,boom){ return { dur:boom?1.45:1.35,
  init(st){ if(boom){ cfxS('expl_sharp',{vol:0.75}); cfxS('fire_burst',{vol:0.8},0.08); cfxR(1,0.8,160); st.flash=1; shake&&shake(0.18); cfxBurst(26,st.c.cx,st.c.cy,(i,x,y)=>{ const an=Math.random()*6.283, sp=cr(150,520); return {type:'spark',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,ay:500,life:cr(0.3,0.6),max:0.6,size:2,col:'#ffd27a',add:true}; }); }
    else cfxS('fire_burst',{vol:0.8,rate:gold?1.15:1});
    if(gold){ cfxSyn((o,t)=>{ [[880,0],[1320,0.12],[1760,0.26]].forEach(([f,d])=>Snd.oscTo(o,{t:t+d,type:'sine',freq:f,dur:1.1,gain:0.12,attack:0.005})); }); }
    cfxCrackle(1.2,0.22,1800); cfxR(0.25,0.55,220,boom?0.15:0); cfxR(0.55,0.4,300,0.4); cfxR(0.15,0.5,420,0.75); st.ch=document.createElement('div'); st.ch.className='cfxov'; st.el.appendChild(st.ch); },
  tick(st,dt,g){ const k=st.k, start=boom?0.12:0.04, p=cl01((k-start)/(1-start-0.08)), b=st.c; if(boom&&k<0.12){ st.tx=cr(-6,6); st.ty=cr(-6,6); }
    const line=100-eo(p)*112; const pts=cfxJag(st,line,10,st.seed);
    st.el.style.clipPath=`polygon(0% -20%,100% -20%,${pts.slice().reverse().map(q=>q[0]+'% '+q[1]+'%').join(',')})`;
    st.ch.style.background=`linear-gradient(to top,rgba(10,4,0,.95) ${100-line-2}%,rgba(90,30,0,.55) ${100-line+6}%,rgba(0,0,0,0) ${100-line+22}%)`;
    st.f=`sepia(${0.2+p*0.5}) brightness(${1-p*0.25})`+(boom&&k<0.2?' brightness(1.6)':'');
    if(p>0&&p<1){ const n=Math.ceil(dt*120); for(let i=0;i<n;i++){ const q=pts[(Math.random()*pts.length)|0]; const x=b.x+q[0]/100*b.w, y=b.y+q[1]/100*b.h;
        cfxP({type:'flame',x,y,vx:cr(-20,20),vy:cr(-140,-60),life:cr(0.25,0.55),max:0.55,size:cr(8,18),add:true,c0:gold?'rgba(255,255,230,1)':undefined,c1:gold?'rgba(255,210,90,.8)':undefined});
        if(Math.random()<0.5) cfxP({type:'ember',x,y,vx:cr(-60,60),vy:cr(-260,-90),ay:-40,drag:0.4,life:cr(0.5,1.1),max:1.1,size:cr(1,2.4),col:gold?'#fff1a8':'#ffb347',add:true});
        if(Math.random()<0.18) cfxP({type:'smoke',x,y:y-10,vx:cr(-15,15),vy:cr(-70,-40),life:cr(0.8,1.4),max:1.4,size:cr(10,22),col:'#2a2420'}); } }
    if(st.flash>0){ st.flash-=dt*3; g.globalCompositeOperation='lighter'; g.globalAlpha=cl01(st.flash)*0.5; const gr=g.createRadialGradient(b.cx,b.cy,0,b.cx,b.cy,Math.max(b.w,b.h)*1.6); gr.addColorStop(0,'#fff2c0'); gr.addColorStop(1,'rgba(255,120,0,0)'); g.fillStyle=gr; g.fillRect(0,0,CFX.w,CFX.h); }
    cfxVig(g,gold?'rgba(255,200,80,1)':'rgba(255,90,10,1)',0.22*Math.sin(Math.PI*k)); } }; }
CFXT.fire=cfxFireTheme(false,false); CFXT.fireboom=cfxFireTheme(false,true); CFXT.holyfire=cfxFireTheme(true,false);
// CHOQUE: raios em volta, a carta treme e pisca e some num estalo
CFXT.shock={dur:1.25, init(st){ cfxS('elec_zap',{vol:0.85}); cfxS('elec_zap',{vol:0.6,rate:1.35},0.38); cfxS('elec_zap',{vol:0.9,rate:0.8},0.95);
    cfxSyn((o,t)=>{ Snd.oscTo(o,{t,type:'sawtooth',freq:96,freqEnd:120,dur:1.0,gain:0.12,attack:0.01,lp:900}); Snd.oscTo(o,{t,type:'square',freq:48,dur:1.0,gain:0.06,attack:0.01,lp:400}); });
    cfxCrackle(1.1,0.35,4200); for(let i=0;i<9;i++) cfxR(cr(0.2,0.9),cr(0.3,1),cr(25,55),i*0.075+Math.random()*0.03); cfxR(1,1,120,0.95); },
  tick(st,dt,g){ const k=st.k, b=st.c; const on=Math.random()<0.45;
    st.tx=cr(-3,3)*(k<0.75?1:2); st.ty=cr(-3,3)*(k<0.75?1:2);
    st.f=on?'brightness(2.2) saturate(0) drop-shadow(0 0 14px #8fd0ff)':'brightness(1.05) drop-shadow(0 0 10px #4aa8ff)';
    if(k>0.72){ const q=(k-0.72)/0.28; st.sc=1-ei(q)*0.95; st.f='brightness('+(2+q*4)+') saturate(0) drop-shadow(0 0 24px #bfe6ff)'; }
    const nb=k<0.75?(1+(Math.random()*3|0)):1; for(let i=0;i<nb;i++){ const a=cfxEdge(st), an=Math.random()*6.283, L=cr(40,140); const p=cfxBolt(g,a[0],a[1],a[0]+Math.cos(an)*L,a[1]+Math.sin(an)*L,'#9fd8ff',2,1);
      if(Math.random()<0.5){ const e=p[p.length-1]; cfxBurst(3,e[0],e[1],(j,x,y)=>({type:'spark',x,y,vx:cr(-300,300),vy:cr(-300,300),ay:400,life:cr(0.15,0.35),max:0.35,size:1.6,col:'#dff3ff',add:true})); } }
    if(Math.random()<0.35){ const a=cfxRandOn(st), c=cfxRandOn(st); cfxBolt(g,a[0],a[1],c[0],c[1],'#e8f6ff',1.4,0); }
    if(Math.random()<0.25){ g.globalCompositeOperation='lighter'; g.globalAlpha=0.07; g.fillStyle='#8fc8ff'; g.fillRect(0,0,CFX.w,CFX.h); }
    if(k>0.93&&!st.pop){ st.pop=1; cfxBurst(40,b.cx,b.cy,(i,x,y)=>{ const an=Math.random()*6.283, sp=cr(200,700); return {type:'spark',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,drag:1.2,life:cr(0.3,0.6),max:0.6,size:2,col:'#cfeeff',add:true}; }); cfxP({type:'ring',x:b.cx,y:b.cy,size:10,grow:220,lw:5,life:0.4,max:0.4,col:'#bfe6ff',add:true}); }
    cfxVig(g,'rgba(80,160,255,1)',0.2*Math.sin(Math.PI*k)); } };
// EXPLOSÃO: pino puxado, a carta treme e esquenta, explode em estilhaços
CFXT.boom={dur:1.35, init(st){ cfxS('helmet_ping',{vol:0.7,rate:1.7}); cfxS('rl_arm',{vol:0.5,rate:1.4},0.05); cfxR(0.1,0.5,40); cfxS('expl_big',{vol:0.95},0.42); cfxR(1,1,260,0.42); cfxR(0.45,0.7,380,0.7); },
  tick(st,dt,g){ const k=st.k, b=st.c, T=0.31;
    if(k<T){ const q=k/T; st.tx=cr(-1,1)*q*6; st.ty=cr(-1,1)*q*6; st.f=`brightness(${1+q*0.6}) sepia(${q*0.6}) drop-shadow(0 0 ${q*22}px rgba(255,80,20,${q}))`; st.sc=1+Math.sin(q*40)*0.01*q; }
    else if(!st.ex){ st.ex=1; st.op=0; try{ shake(0.35); }catch(e){}
      cfxShards(st,30,['#2b211b','#3c2c22','#5b3f2c','#1b1512'],'rgba(255,150,60,.5)',900);
      cfxBurst(40,b.cx,b.cy,(i,x,y)=>{ const an=Math.random()*6.283, sp=cr(120,700); return {type:i%3?'ember':'spark',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,ay:300,drag:1.4,life:cr(0.4,0.9),max:0.9,size:cr(1.5,3),col:i%2?'#ffcf6a':'#ff7a2a',add:true}; });
      cfxBurst(14,b.cx,b.cy,(i,x,y)=>{ const an=Math.random()*6.283, sp=cr(40,160); return {type:'smoke',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp-30,drag:1.2,life:cr(0.9,1.5),max:1.5,size:cr(18,36),col:'#2b2622'}; });
      cfxP({type:'ring',x:b.cx,y:b.cy,size:20,grow:520,lw:10,life:0.5,max:0.5,col:'#ffd9a0',add:true}); st.fl=1; }
    if(st.fl>0){ st.fl-=dt*2.6; g.globalCompositeOperation='lighter'; g.globalAlpha=cl01(st.fl); const gr=g.createRadialGradient(b.cx,b.cy,0,b.cx,b.cy,Math.max(CFX.w,CFX.h)*0.6*(1.2-st.fl*0.4)); gr.addColorStop(0,'#fff6d8'); gr.addColorStop(0.25,'rgba(255,170,60,.9)'); gr.addColorStop(1,'rgba(255,60,0,0)'); g.fillStyle=gr; g.fillRect(0,0,CFX.w,CFX.h); }
    cfxVig(g,'rgba(255,90,20,1)',k>T?0.35*(1-k):0); } };
// GELO: o gelo cobre a carta e ela estilhaça
CFXT.ice={dur:1.35, init(st){ cfxS('freeze_hit',{vol:0.85}); cfxCrackle(0.8,0.18,6000); for(let i=0;i<6;i++) cfxR(0.15,0.35,30,i*0.11); cfxS('shield_break',{vol:0.8,rate:1.35},0.8); cfxR(0.7,0.9,120,0.8);
    st.ov=document.createElement('div'); st.ov.className='cfxov'; st.el.appendChild(st.ov); },
  tick(st,dt,g){ const k=st.k, b=st.c, T=0.6;
    if(k<T){ const q=eo(k/T); st.ov.style.background=`radial-gradient(ellipse at 50% 50%,rgba(220,245,255,${q*0.2}) ${Math.max(0,60-q*60)}%,rgba(200,235,255,${0.35+q*0.55}) ${Math.max(5,100-q*70)}%)`; st.ov.style.boxShadow=`inset 0 0 ${10+q*40}px rgba(230,250,255,${0.4+q*0.5})`;
      st.f=`saturate(${1-q*0.75}) hue-rotate(${q*25}deg) brightness(${1+q*0.25})`;
      if(Math.random()<dt*40){ const e=cfxEdge(st); cfxP({type:'frost',x:e[0]+cr(-6,6),y:e[1]+cr(-6,6),life:cr(0.6,1.2),max:1.2,size:cr(4,9),rot:Math.random()*3,col:'#e8f8ff'}); } }
    else if(k<0.62){ st.tx=cr(-2,2); }
    else if(!st.sh){ st.sh=1; st.op=0; cfxShards(st,34,['rgba(200,235,255,.85)','rgba(170,220,255,.7)','rgba(240,252,255,.9)'],'rgba(255,255,255,.9)',700);
      cfxBurst(30,b.cx,b.cy,(i,x,y)=>({type:'dot',x:x+cr(-b.w/2,b.w/2),y:y+cr(-b.h/2,b.h/2),vx:cr(-80,80),vy:cr(-60,40),ay:60,life:cr(0.6,1.2),max:1.2,size:cr(1,2),col:'#f2fbff'})); }
    cfxVig(g,'rgba(160,215,255,1)',0.3*Math.sin(Math.PI*k)); } };
// SANGUE: escorre pela carta, respingos e coração batendo
CFXT.blood={dur:1.5, init(st){ cfxS('gore_splat',{vol:0.7}); cfxHeart(0.05); cfxHeart(0.8); st.drips=Array.from({length:7},()=>({x:Math.random(),len:0,sp:cr(0.5,1.3),w:cr(3,7)}));
    const b=st.c; cfxBurst(18,b.cx,b.y+b.h*0.25,(i,x,y)=>({type:'drop',x:x+cr(-b.w*0.4,b.w*0.4),y,vx:cr(-160,160),vy:cr(-240,-40),ay:900,life:cr(0.5,0.9),max:0.9,size:cr(2,4),col:'#8a0d0d'})); },
  tick(st,dt,g){ const k=st.k, b=st.c; g.globalCompositeOperation='source-over'; g.fillStyle='#7a0a0a';
    for(const d of st.drips){ d.len=Math.min(1.3,d.len+dt*d.sp*(0.5+Math.random())); const x=b.x+d.x*b.w, y0=b.y, y1=b.y+Math.min(b.h,d.len*b.h); g.globalAlpha=0.92*(k<0.8?1:1-(k-0.8)/0.2); g.fillRect(x-d.w/2,y0,d.w,y1-y0); g.beginPath(); g.arc(x,y1,d.w*0.75,0,6.283); g.fill();
      if(d.len>=1&&Math.random()<dt*6) cfxP({type:'drop',x,y:y1,vy:cr(80,160),ay:900,life:0.5,max:0.5,size:cr(2,3),col:'#7a0a0a'}); }
    st.f=`sepia(${k*0.6}) hue-rotate(-20deg) saturate(${1+k*1.5}) brightness(${1-k*0.3})`;
    if(k>0.75){ const q=(k-0.75)/0.25; st.ty=ei(q)*90; st.op=1-q; }
    const beat=Math.max(Math.exp(-Math.pow((k-0.06)*12,2)),Math.exp(-Math.pow((k-0.56)*12,2))); st.sc=1+beat*0.05; cfxVig(g,'rgba(140,0,0,1)',0.2+beat*0.3); } };
// CORAÇÃO: pulsa, brilho vermelho e corações subindo
CFXT.heart={dur:1.3, init(st){ cfxHeart(0); cfxHeart(0.5); cfxS('levelup',{vol:0.45,rate:1.2},0.1); },
  tick(st,dt,g){ const k=st.k, b=st.c; const beat=Math.max(Math.exp(-Math.pow((k-0.04)*14,2)),Math.exp(-Math.pow((k-0.42)*14,2))); st.sc=1+beat*0.09; st.f=`drop-shadow(0 0 ${8+beat*26}px rgba(255,60,80,.9))`;
    if(Math.random()<dt*22){ const p=cfxRandOn(st); cfxP({type:'heart',x:p[0],y:p[1],vx:cr(-20,20),vy:cr(-120,-60),life:cr(0.7,1.2),max:1.2,size:cr(8,15),col:Math.random()<0.5?'#ff4d6d':'#ff8fa3'}); }
    if(k>0.8){ const q=(k-0.8)/0.2; st.op=1-q; st.ty=-q*30; } cfxVig(g,'rgba(255,40,80,1)',beat*0.25); } };
// MOEDAS: jorram moedas, brilho dourado varrendo a carta
CFXT.coin={dur:1.35, init(st){ cfxS('cash',{vol:0.85}); for(let i=0;i<7;i++){ cfxSyn((o,t)=>Snd.oscTo(o,{t,type:'triangle',freq:cr(2200,3400),dur:0.12,gain:0.08,attack:0.002})); } for(let i=0;i<7;i++) cfxSyn((o,t)=>Snd.oscTo(o,{t,type:'sine',freq:cr(2600,3800),dur:0.18,gain:0.06,attack:0.002}),0.15+i*0.08); for(let i=0;i<6;i++) cfxR(0,0.45,25,i*0.07);
    const b=st.c; cfxBurst(40,b.cx,b.cy,(i,x,y)=>({type:'coin',x:x+cr(-b.w*0.3,b.w*0.3),y:y+cr(-b.h*0.2,b.h*0.2),vx:cr(-320,320),vy:cr(-700,-250),ay:1400,life:cr(0.9,1.4),max:1.4,size:cr(6,10),rot:Math.random()*6,vr:cr(-14,14)}));
    st.ov=document.createElement('div'); st.ov.className='cfxov'; st.el.appendChild(st.ov); },
  tick(st,dt,g){ const k=st.k; const x=-60+k*260; st.ov.style.background=`linear-gradient(115deg,rgba(255,255,255,0) ${x-20}%,rgba(255,236,150,.75) ${x}%,rgba(255,255,255,0) ${x+20}%)`; st.f=`drop-shadow(0 0 ${14*Math.sin(Math.PI*k)}px rgba(255,200,60,.9)) sepia(${0.4*k}) saturate(${1+k})`;
    st.ty=-eo(k)*24; if(k>0.75) st.op=1-(k-0.75)/0.25; if(Math.random()<dt*20){ const p=cfxRandOn(st); cfxP({type:'star',x:p[0],y:p[1],life:0.4,max:0.4,size:cr(4,8),col:'#fff1b0',add:true}); } cfxVig(g,'rgba(255,200,60,1)',0.15*Math.sin(Math.PI*k)); } };
// LÂMINA: um corte atravessa e a carta se parte em duas
function cfxSlashTheme(red){ return {dur:1.05, init(st){ cfxS('knife_whoosh',{vol:0.9,rate:1.2}); cfxS(red?'knife_twist':'knife_stab2',{vol:0.8},0.12); if(red) cfxS('gore_splat',{vol:0.5},0.15); cfxR(0.85,0.25,70,0.12);
    const b2=st.el.cloneNode(true); CFX.L.appendChild(b2); st.el2=b2; b2.style.left=st.el.style.left; b2.style.top=st.el.style.top; b2.style.width=st.el.style.width; b2.style.height=st.el.style.height; st.el.style.clipPath='polygon(0 0,100% 0,100% 0,0 100%)'; b2.style.clipPath='polygon(100% 0,100% 100%,0 100%,0 100%)'; b2.style.opacity='0'; },
  tick(st,dt,g){ const k=st.k, b=st.c, T=0.2; const x0=b.x+b.w+20, y0=b.y-20, x1=b.x-20, y1=b.y+b.h+20;
    if(k<T){ const q=eo(k/T); g.globalCompositeOperation='lighter'; g.strokeStyle=red?'#ff6a6a':'#ffffff'; g.shadowColor=g.strokeStyle; g.shadowBlur=18; g.lineWidth=4; g.globalAlpha=1; g.beginPath(); g.moveTo(x0,y0); g.lineTo(x0+(x1-x0)*q,y0+(y1-y0)*q); g.stroke(); g.shadowBlur=0;
      if(Math.random()<0.8) cfxP({type:'spark',x:x0+(x1-x0)*q,y:y0+(y1-y0)*q,vx:cr(-200,200),vy:cr(-200,200),ay:500,life:0.3,max:0.3,size:1.5,col:'#fff',add:true}); }
    else { const q=eo((k-T)/(1-T)); st.el2.style.opacity=String(1-q); st.op=1-q; st.tx=-q*70; st.ty=-q*40; st.rot=-q*14; st.el2.style.transform=`translate(${q*70}px,${q*60}px) rotate(${q*12}deg)`;
      if(red&&Math.random()<dt*30) cfxP({type:'drop',x:b.cx+cr(-30,30),y:b.cy+cr(-30,30),vx:cr(-100,100),vy:cr(-80,40),ay:900,life:0.6,max:0.6,size:cr(2,3),col:'#900'}); }
    if(k<0.35){ g.globalCompositeOperation='lighter'; g.globalAlpha=0.12*(1-k/0.35); g.fillStyle=red?'#ff3030':'#ffffff'; g.fillRect(0,0,CFX.w,CFX.h); } },
  end(st){ if(st.el2) st.el2.remove(); } }; }
CFXT.slash=cfxSlashTheme(false); CFXT.berserk=cfxSlashTheme(true);
// MIRA: retícula fecha na carta e dispara (furo de bala com rachaduras)
CFXT.aim={dur:1.15, init(st){ cfxSyn((o,t)=>{ for(const d of [0,0.12,0.24]) Snd.oscTo(o,{t:t+d,type:'sine',freq:1900,dur:0.06,gain:0.12,attack:0.002}); }); cfxS('gun_rifle',{vol:0.55},0.4); cfxR(0,0.3,30); cfxR(0,0.3,30,0.12); cfxR(0,0.3,30,0.24); cfxR(0.8,0.5,90,0.4); },
  tick(st,dt,g){ const k=st.k, b=st.c, T=0.35; g.globalCompositeOperation='source-over';
    if(k<T){ const q=eo(k/T), R=Math.max(b.w,b.h)*(1.6-q*1.25); g.globalAlpha=0.9; g.strokeStyle='#ff4a3a'; g.lineWidth=2; g.beginPath(); g.arc(b.cx,b.cy,R,0,6.283); g.stroke(); g.beginPath(); g.arc(b.cx,b.cy,R*0.55,0,6.283); g.stroke();
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ g.beginPath(); g.moveTo(b.cx+dx*R*1.15,b.cy+dy*R*1.15); g.lineTo(b.cx+dx*R*0.7,b.cy+dy*R*0.7); g.stroke(); } }
    else { if(!st.sh){ st.sh=1; st.cr=Array.from({length:9},()=>({a:Math.random()*6.283,l:cr(20,b.w*0.6)})); cfxBurst(18,b.cx,b.cy,(i,x,y)=>({type:'spark',x,y,vx:cr(-400,400),vy:cr(-400,400),drag:1.5,life:0.35,max:0.35,size:1.6,col:'#ffe0a0',add:true})); cfxBurst(16,b.cx,b.cy,(i,x,y)=>({type:'shard',x,y,vx:cr(-260,260),vy:cr(-260,100),ay:900,life:0.8,max:0.8,size:cr(3,6),rot:Math.random()*6,vr:cr(-10,10),col:'#c9bfa8'})); }
      const q=(k-T)/(1-T); st.ty=-Math.exp(-q*8)*10; st.rot=Math.exp(-q*8)*-4; if(k>0.75) st.op=1-(k-0.75)/0.25;
      g.globalAlpha=st.op; g.fillStyle='#0b0907'; g.beginPath(); g.arc(b.cx,b.cy+st.ty,7,0,6.283); g.fill(); g.strokeStyle='rgba(20,15,10,.85)'; g.lineWidth=1.3;
      for(const c of st.cr){ g.beginPath(); g.moveTo(b.cx,b.cy+st.ty); g.lineTo(b.cx+Math.cos(c.a)*c.l*eo(Math.min(1,q*3)),b.cy+st.ty+Math.sin(c.a)*c.l*eo(Math.min(1,q*3))); g.stroke(); } } } };
// OLHO: varredura de escaneamento, colchetes de mira, a carta "foca" e some
CFXT.eye={dur:1.2, init(st){ cfxSyn((o,t)=>{ Snd.oscTo(o,{t,type:'sine',freq:500,freqEnd:1900,dur:0.7,gain:0.1,attack:0.02}); Snd.oscTo(o,{t:t+0.7,type:'sine',freq:2400,dur:0.25,gain:0.1,attack:0.003}); }); cfxS('helmet_ping',{vol:0.5,rate:1.4},0.72); cfxR(0.05,0.3,650); },
  tick(st,dt,g){ const k=st.k, b=st.c; const y=b.y+eo(cl01(k/0.65))*b.h; g.globalCompositeOperation='lighter'; g.globalAlpha=0.9*(k<0.7?1:0); const gr=g.createLinearGradient(0,y-16,0,y+4); gr.addColorStop(0,'rgba(90,240,255,0)'); gr.addColorStop(1,'rgba(150,250,255,.9)'); g.fillStyle=gr; g.fillRect(b.x-8,y-16,b.w+16,20);
    g.globalCompositeOperation='source-over'; g.strokeStyle='#5af0ff'; g.lineWidth=2; g.globalAlpha=0.9; const m=10+Math.sin(k*20)*2, L=18;
    for(const [x,yy,sx,sy] of [[b.x-m,b.y-m,1,1],[b.x+b.w+m,b.y-m,-1,1],[b.x-m,b.y+b.h+m,1,-1],[b.x+b.w+m,b.y+b.h+m,-1,-1]]){ g.beginPath(); g.moveTo(x,yy+sy*L); g.lineTo(x,yy); g.lineTo(x+sx*L,yy); g.stroke(); }
    st.f=`hue-rotate(${k<0.7?Math.sin(k*40)*10:0}deg) drop-shadow(0 0 12px rgba(90,240,255,.7))`; if(k>0.7){ const q=(k-0.7)/0.3; st.sc=1+q*0.25; st.op=1-q; st.f+=` blur(${q*6}px)`; } } };
// VELOCIDADE: a carta dispara para o lado com rastro
CFXT.speed={dur:0.85, init(st){ cfxS('knife_whoosh',{vol:0.9,rate:0.75}); cfxS('step_run2',{vol:0.6},0.02); cfxR(0.2,0.6,40); cfxR(0.2,0.6,40,0.09); const b=st.c; cfxBurst(12,b.x,b.y+b.h,(i,x,y)=>({type:'smoke',x:x+cr(0,b.w),y,vx:cr(-120,-30),vy:cr(-30,0),life:0.7,max:0.7,size:cr(8,14),col:'#8a7d6a'})); },
  tick(st,dt,g){ const k=st.k, b=st.c; const q=ei(cl01((k-0.12)/0.88)); st.tx=q*(CFX.w-b.x+60); st.sk=-q*22; st.f=`blur(${q*4}px)`; if(k<0.12){ st.tx=-eo(k/0.12)*14; }
    g.globalCompositeOperation='lighter'; g.strokeStyle='#ffe9b8'; for(let i=0;i<5;i++){ const y=b.y+cr(0,b.h); g.globalAlpha=cr(0.2,0.6)*(1-k); g.lineWidth=cr(1,3); g.beginPath(); g.moveTo(b.x+st.tx-cr(20,60),y); g.lineTo(b.x+st.tx-cr(160,360),y); g.stroke(); } } };
// MUNIÇÃO (bolso): as balas pulam da carta e caem
CFXT.ammo={dur:1.2, init(st){ cfxS('rl_mag_in',{vol:0.7}); for(let i=0;i<4;i++) cfxS('shell_drop',{vol:0.5,rate:cr(0.9,1.2)},0.25+i*0.13); for(let i=0;i<5;i++) cfxR(0,0.35,20,0.25+i*0.1);
    const b=st.c; cfxBurst(26,b.cx,b.y+10,(i,x,y)=>({type:'casing',x:x+cr(-b.w*0.3,b.w*0.3),y,vx:cr(-260,260),vy:cr(-650,-300),ay:1500,life:cr(0.8,1.2),max:1.2,size:cr(5,8),rot:Math.random()*6,vr:cr(-18,18)})); },
  tick(st,dt,g){ const k=st.k; st.ty=Math.sin(k*30)*3*(1-k); st.sc=1+Math.sin(k*Math.PI)*0.04; if(k>0.7) st.op=1-(k-0.7)/0.3; } };
// PENTE: entra como um carregador, clique, cápsulas ejetadas
CFXT.mag={dur:1.1, init(st){ cfxS('rl_mag_out',{vol:0.7}); cfxS('rl_mag_in',{vol:0.85},0.28); cfxS('rl_slide',{vol:0.75},0.55); cfxR(0.5,0.2,50,0.28); cfxR(0.6,0.3,60,0.55); },
  tick(st,dt,g){ const k=st.k, b=st.c; if(k<0.25) st.ty=eo(k/0.25)*40; else if(k<0.3) st.ty=40-12; else st.ty=28+ei((k-0.3)/0.7)*(CFX.h-b.y);
    if(k>0.5&&!st.ej){ st.ej=1; cfxBurst(6,b.x+b.w,b.cy,(i,x,y)=>({type:'casing',x,y,vx:cr(150,420),vy:cr(-520,-260),ay:1500,life:1,max:1,size:6,rot:Math.random()*6,vr:cr(-20,20)})); }
    st.op=k>0.6?1-(k-0.6)/0.4:1; } };
// MÃOS RÁPIDAS: giro acrobático e some
CFXT.hands={dur:0.9, init(st){ cfxS('rl_slide',{vol:0.7,rate:1.2}); cfxS('knife_whoosh',{vol:0.7,rate:1.5},0.1); for(let i=0;i<4;i++) cfxR(0,0.4,22,i*0.08); },
  tick(st,dt,g){ const k=st.k; st.ry=eo(k)*720; st.ty=-Math.sin(k*Math.PI)*60; if(k>0.65) st.op=1-(k-0.65)/0.35; if(Math.random()<dt*30){ const p=cfxRandOn(st); cfxP({type:'star',x:p[0],y:p[1]+st.ty,life:0.35,max:0.35,size:4,col:'#fff',add:true}); } } };
// SORTE: trevos e brilhos verdes, a carta vira
CFXT.luck={dur:1.35, init(st){ cfxS('slot_ding',{vol:0.75}); cfxSyn((o,t)=>{ [[1046,0.05],[1318,0.15],[1568,0.25],[2093,0.38]].forEach(([f,d])=>Snd.oscTo(o,{t:t+d,type:'sine',freq:f,dur:0.6,gain:0.1,attack:0.004})); }); for(let i=0;i<3;i++) cfxR(0,0.4,40,0.05+i*0.12); },
  tick(st,dt,g){ const k=st.k, b=st.c; st.ry=eo(cl01(k/0.6))*360; st.f=`drop-shadow(0 0 ${16*Math.sin(Math.PI*k)}px rgba(90,230,120,.9))`;
    if(Math.random()<dt*28){ const an=k*12+Math.random(), r=Math.max(b.w,b.h)*0.7; cfxP({type:Math.random()<0.5?'leaf':'star',x:b.cx+Math.cos(an)*r,y:b.cy+Math.sin(an)*r,vx:cr(-30,30),vy:cr(-90,-30),vr:cr(-4,4),rot:Math.random()*6,life:cr(0.6,1.1),max:1.1,size:cr(5,9),col:Math.random()<0.5?'#3fbf5a':'#a6f0a0',add:false}); }
    if(k>0.75){ st.op=1-(k-0.75)/0.25; st.ty=-(k-0.75)*120; } } };
// FÔLEGO: a carta respira e solta névoa
CFXT.breath={dur:1.5, init(st){ cfxSyn((o,t)=>{ Snd.burstTo(o,{t,type:'bandpass',freq:700,q:0.8,dur:0.7,gain:0.22,attack:0.35}); Snd.burstTo(o,{t:t+0.75,type:'bandpass',freq:450,q:0.8,dur:0.7,gain:0.18,attack:0.1}); }); cfxR(0,0.2,500); cfxR(0,0.15,500,0.75); },
  tick(st,dt,g){ const k=st.k, b=st.c; st.sc=1+Math.sin(cl01(k/0.8)*Math.PI)*0.07; if(k>0.45&&Math.random()<dt*40) cfxP({type:'smoke',x:b.cx+cr(-b.w*0.4,b.w*0.4),y:b.y+b.h*cr(0.3,1),vx:cr(-40,40),vy:cr(-60,-20),life:cr(0.8,1.4),max:1.4,size:cr(10,20),col:'#d8eef8'});
    if(k>0.8) st.op=1-(k-0.8)/0.2; cfxVig(g,'rgba(200,235,255,1)',0.12*Math.sin(Math.PI*k)); } };
// ESTRELA: explosão de brilhos
CFXT.star={dur:1.0, init(st){ cfxS('levelup',{vol:0.6,rate:1.1}); cfxSyn((o,t)=>{ for(let i=0;i<6;i++) Snd.oscTo(o,{t:t+i*0.05,type:'sine',freq:1800+i*260,dur:0.25,gain:0.06,attack:0.003}); }); cfxR(0.2,0.6,80);
    const b=st.c; cfxBurst(34,b.cx,b.cy,(i,x,y)=>{ const an=Math.random()*6.283, sp=cr(120,520); return {type:'star',x,y,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,drag:2,life:cr(0.5,0.9),max:0.9,size:cr(4,10),rot:Math.random()*6,vr:cr(-6,6),col:i%2?'#fff3c0':'#ffffff',add:true}; }); },
  tick(st,dt,g){ const k=st.k; st.f=`brightness(${1+Math.exp(-k*10)*1.5})`; st.ty=-eo(k)*40; st.op=1-ei(k); } };
// CAVEIRA: racha e vira pó
CFXT.skull={dur:1.2, init(st){ cfxS('hit_punch',{vol:0.8,rate:0.7}); cfxS('body_fall',{vol:0.5,rate:1.3},0.55); cfxR(0.7,0.1,50); cfxR(0.4,0,200,0.55); const b=st.c; st.cr=[]; let x=b.cx, y=b.cy; for(let i=0;i<14;i++){ const an=Math.random()*6.283, l=cr(10,38); st.cr.push([x,y,x+Math.cos(an)*l,y+Math.sin(an)*l]); if(Math.random()<0.6){ x+=Math.cos(an)*l; y+=Math.sin(an)*l; } } },
  tick(st,dt,g){ const k=st.k, b=st.c; const q=cl01(k/0.4); g.globalCompositeOperation='source-over'; g.strokeStyle='rgba(10,8,8,.9)'; g.lineWidth=1.5; g.globalAlpha=k<0.55?1:0; const n=Math.ceil(q*st.cr.length); for(let i=0;i<n;i++){ const c=st.cr[i]; g.beginPath(); g.moveTo(c[0],c[1]); g.lineTo(c[2],c[3]); g.stroke(); }
    st.f=`grayscale(${q}) brightness(${1-q*0.35})`; if(k>0.5){ if(!st.dust){ st.dust=1; st.op=0; cfxBurst(90,b.cx,b.cy,(i,x,y)=>({type:'dot',x:b.x+Math.random()*b.w,y:b.y+Math.random()*b.h,vx:cr(-40,40),vy:cr(-30,30),ay:420,life:cr(0.6,1.2),max:1.2,size:cr(1.2,3),col:Math.random()<0.5?'#5a5550':'#2e2a27'})); } } } };
// AJOELHADO: a carta abaixa com um baque e poeira
CFXT.kneel={dur:0.95, init(st){ cfxS('jump_land',{vol:0.85,rate:0.9},0.12); cfxR(0.85,0,90,0.12); },
  tick(st,dt,g){ const k=st.k, b=st.c; if(k<0.15) st.ty=eo(k/0.15)*70; else st.ty=70+Math.sin((k-0.15)*40)*3*(1-k);
    if(k>0.15&&!st.d){ st.d=1; cfxBurst(18,b.cx,b.y+b.h+70,(i,x,y)=>({type:'smoke',x:x+cr(-b.w*0.5,b.w*0.5),y,vx:cr(-160,160),vy:cr(-50,-5),drag:2,life:0.8,max:0.8,size:cr(8,14),col:'#7d6e5c'})); }
    if(k>0.6) st.op=1-(k-0.6)/0.4; } };
// VIDRO: trinca e estilhaça
CFXT.glass={dur:1.05, init(st){ cfxS('shield_break',{vol:0.9},0.3); cfxSyn((o,t)=>Snd.burstTo(o,{t,type:'highpass',freq:5000,dur:0.05,gain:0.3})); cfxR(0.3,0.4,40); cfxR(0.6,0.9,110,0.3); const b=st.c; st.cr=Array.from({length:12},()=>({a:Math.random()*6.283,l:cr(30,Math.max(b.w,b.h)*0.7)})); },
  tick(st,dt,g){ const k=st.k, b=st.c; if(k<0.28){ const q=eo(k/0.28); g.globalCompositeOperation='source-over'; g.strokeStyle='rgba(230,245,255,.95)'; g.lineWidth=1.4; g.globalAlpha=1; for(const c of st.cr){ g.beginPath(); g.moveTo(b.cx,b.cy); g.lineTo(b.cx+Math.cos(c.a)*c.l*q,b.cy+Math.sin(c.a)*c.l*q); g.stroke(); } st.tx=cr(-1.5,1.5); }
    else if(!st.sh){ st.sh=1; st.op=0; cfxShards(st,40,['rgba(200,225,240,.55)','rgba(235,248,255,.7)','rgba(160,200,225,.5)'],'rgba(255,255,255,.95)',800); } } };
// ARMADURA: brilho de aço, rebites e um "clang" com faíscas
CFXT.armor={dur:1.15, init(st){ cfxS('door_metal',{vol:0.75,rate:1.1},0.25); cfxS('hit_metal',{vol:0.7},0.25); cfxR(1,0.3,110,0.25); st.ov=document.createElement('div'); st.ov.className='cfxov'; st.el.appendChild(st.ov); },
  tick(st,dt,g){ const k=st.k, b=st.c; const x=-50+cl01(k/0.6)*200; st.ov.style.background=`linear-gradient(120deg,rgba(150,160,170,.35),rgba(60,65,72,.35)),linear-gradient(105deg,rgba(255,255,255,0) ${x-15}%,rgba(235,240,255,.8) ${x}%,rgba(255,255,255,0) ${x+15}%)`;
    st.f=`grayscale(${cl01(k*2)*0.7}) contrast(1.15)`; g.globalCompositeOperation='source-over'; g.fillStyle='#c9ced6'; g.globalAlpha=k<0.85?1:1-(k-0.85)/0.15; for(const [px,py] of [[0.08,0.06],[0.92,0.06],[0.08,0.94],[0.92,0.94]]){ g.beginPath(); g.arc(b.x+px*b.w,b.y+py*b.h+st.ty,4,0,6.283); g.fill(); }
    if(k>0.22&&!st.c2){ st.c2=1; st.kick=1; cfxBurst(24,b.cx,b.cy,(i,x,y)=>({type:'spark',x:x+cr(-20,20),y:y+cr(-20,20),vx:cr(-500,500),vy:cr(-500,200),ay:900,life:cr(0.25,0.5),max:0.5,size:1.8,col:'#ffe7a8',add:true})); }
    if(st.kick>0){ st.kick-=dt*5; st.tx=cr(-1,1)*st.kick*8; st.sc=1-st.kick*0.04; } if(k>0.8) st.op=1-(k-0.8)/0.2; } };
// TEMPO: a carta volta no tempo, areia caindo, ondas
CFXT.time={dur:1.5, init(st){ cfxS('timewarp',{vol:0.85}); cfxR(0.3,0.1,600); cfxR(0.1,0.3,500,0.6); },
  tick(st,dt,g){ const k=st.k, b=st.c; st.rot=-eo(k)*360; st.sc=1-Math.sin(Math.PI*k)*0.12; st.f=`sepia(${Math.sin(Math.PI*k)*0.8}) saturate(${1-Math.sin(Math.PI*k)*0.5})`;
    if(Math.random()<dt*60) cfxP({type:'dot',x:b.cx+cr(-6,6),y:b.y-10,vy:cr(120,240),ay:200,life:cr(0.5,0.9),max:0.9,size:cr(0.8,1.6),col:'#e8c98a'});
    if(Math.random()<dt*4) cfxP({type:'ring',x:b.cx,y:b.cy,size:Math.max(b.w,b.h)*0.5,grow:-Math.max(b.w,b.h)*0.45,lw:2,life:0.6,max:0.6,col:'#e8d6a8'}); if(k>0.8) st.op=1-(k-0.8)/0.2; } };
// ROLETA RUSSA: o tambor gira, clique, clique… BANG
CFXT.roulette={dur:1.65, init(st){ cfxS('roulette_spin',{vol:0.5,rate:1.4}); cfxS('dry_fire',{vol:0.85},0.35); cfxS('dry_fire',{vol:0.85},0.7); cfxS('gun_revolver',{vol:0.95},1.05); cfxR(0.2,0,30,0.35); cfxR(0.2,0,30,0.7); cfxR(1,0.7,150,1.05); },
  tick(st,dt,g){ const k=st.k, b=st.c, T=1.05/1.65;
    if(k<T){ st.ry=Math.sin(k*30)*12*(1-k); st.rot=Math.floor(k/T*6)*60*0.08; }
    else { if(!st.bang){ st.bang=1; st.fl=1; try{ shake(0.2); }catch(e){} cfxBurst(30,b.cx,b.cy,(i,x,y)=>({type:'spark',x,y,vx:cr(-600,600),vy:cr(-600,600),drag:1.6,life:0.4,max:0.4,size:2,col:'#ffd890',add:true})); cfxBurst(20,b.cx,b.cy,(i,x,y)=>({type:'drop',x,y,vx:cr(-300,300),vy:cr(-300,100),ay:900,life:0.7,max:0.7,size:cr(2,3.5),col:'#8a0d0d'})); }
      const q=(k-T)/(1-T); st.tx=eo(q)*-180; st.rot=-eo(q)*40; st.op=1-q; }
    if(st.fl>0){ st.fl-=dt*4; g.globalCompositeOperation='lighter'; g.globalAlpha=cl01(st.fl)*0.6; g.fillStyle='#fff0d0'; g.fillRect(0,0,CFX.w,CFX.h); } } };
// IMPACTO: onda de choque empurra a carta para longe
CFXT.push={dur:0.9, init(st){ cfxS('hit_punch',{vol:0.95}); cfxS('knife_whoosh',{vol:0.6,rate:0.6},0.05); cfxR(1,0.4,90); const b=st.c; for(const d of [0,0.06,0.12]) setTimeout(()=>cfxP({type:'ring',x:b.cx,y:b.cy,size:10,grow:Math.max(b.w,b.h)*1.4,lw:6,life:0.5,max:0.5,col:'#f2e6d0'}),d*1000); },
  tick(st,dt,g){ const k=st.k; const q=eo(k); st.sc=1-q*0.7; st.ty=-q*80; st.rot=q*8; st.op=1-ei(k); st.f=`blur(${q*3}px)`; } };
// MÉDICO: cruz verde, sinais de mais subindo
CFXT.medic={dur:1.25, init(st){ cfxS('drink_open',{vol:0.6,rate:1.2}); cfxSyn((o,t)=>{ [[784,0],[988,0.1],[1175,0.2]].forEach(([f,d])=>Snd.oscTo(o,{t:t+d,type:'sine',freq:f,dur:0.5,gain:0.1,attack:0.004})); },0.1); cfxR(0,0.4,60); cfxR(0,0.4,60,0.25); },
  tick(st,dt,g){ const k=st.k; st.f=`drop-shadow(0 0 ${16*Math.sin(Math.PI*k)}px rgba(80,255,140,.9))`; st.sc=1+Math.sin(Math.PI*k)*0.04;
    if(Math.random()<dt*24){ const p=cfxRandOn(st); cfxP({type:'plus',x:p[0],y:p[1],vy:cr(-120,-50),life:cr(0.6,1),max:1,size:cr(4,8),col:'#5cff9a',add:true}); } if(k>0.75) st.op=1-(k-0.75)/0.25; cfxVig(g,'rgba(60,255,140,1)',0.12*Math.sin(Math.PI*k)); } };
// SAGRADO: raios de luz dourada e sino
CFXT.holy={dur:1.35, init(st){ cfxS('padre_ability',{vol:0.6}); cfxSyn((o,t)=>{ [[523,0],[784,0.02],[1046,0.04]].forEach(([f,d])=>Snd.oscTo(o,{t:t+d,type:'sine',freq:f,dur:1.4,gain:0.09,attack:0.01})); }); cfxR(0.2,0.3,500); },
  tick(st,dt,g){ const k=st.k, b=st.c; g.globalCompositeOperation='lighter'; for(let i=0;i<10;i++){ const an=i*0.628+k*0.8; g.globalAlpha=0.18*Math.sin(Math.PI*k); g.fillStyle='#ffe9a8'; g.beginPath(); g.moveTo(b.cx,b.cy); g.arc(b.cx,b.cy,Math.max(CFX.w,CFX.h),an,an+0.12); g.closePath(); g.fill(); }
    st.f=`brightness(${1+Math.sin(Math.PI*k)*0.6}) drop-shadow(0 0 20px rgba(255,230,150,.9))`; st.ty=-eo(k)*30; if(k>0.7) st.op=1-(k-0.7)/0.3; } };
/* ---- qual tema cada carta usa ---- */
const CFX_ID={incend:'fireboom',zap:'shock',e_ice:'ice',e_nade:'boom',nader:'boom',c_rec_u:'boom',blood:'blood',vamp:'blood',leech:'blood',glass:'glass',roulette:'roulette',berserk:'berserk',blade:'slash',
  c_hel_a:'medic',c_hel_u:'medic',c_hel_p:'breath',second:'time',c_vik_p:'time',e_push:'push',c_mor_a:'push',cannon:'fire',hot:'fire',trigger:'shock',x_cad:'shock',lamp:'shock',e_ult:'shock',
  c_vik_a:'shock',c_vik_u:'shock',c_tom_a:'holyfire',c_tom_p:'holyfire',c_tom_u:'holy',miser:'coin',greed:'coin',x_pts:'coin',x_def:'armor',c_mor_u:'armor',thick:'heart',x_vida:'heart',c_mor_p:'armor',
  steady:'aim',x_dano:'aim',c_iar_u:'aim',clinic:'eye',eagle:'eye',x_crit:'eye',c_iar_a:'eye',c_iar_p:'eye',light:'speed',x_vel:'speed',deep:'ammo',longmag:'mag',x_rec:'mag',c_rec_a:'mag',c_rec_p:'ammo',
  hands:'hands',luck:'luck',breath:'breath',precise:'star',x_critd:'star',weak:'skull',kneel:'kneel'};
const CFX_ICON={flame:'fire',bolt:'shock',grenade:'boom',ice:'ice',fang:'blood',drop:'blood',heart:'heart',coin:'coin',knife:'slash',crosshair:'aim',eye:'eye',boot:'speed',bag:'ammo',mag:'mag',hand:'hands',
  clover:'luck',lungs:'breath',star:'star',skull:'skull',knee:'kneel',glass:'glass',scale:'armor',hourglass:'time',dice:'roulette',push:'push'};
function cfxThemeOf(c){ if(!c) return 'star'; return CFX_ID[c.id]||CFX_ICON[c.icon]||'star'; }
/* ---- execução ---- */
function cfxRun(cardEl,c){ cfxEnsure(); const r=cardEl.getBoundingClientRect(); if(r.width<10) return; const name=cfxThemeOf(c), T=CFXT[name]||CFXT.star;
  const el=cardEl.cloneNode(true); el.removeAttribute('id'); el.classList.remove('picked','gone','swapin'); el.classList.add('cfxcard'); for(const x of el.querySelectorAll('[id]')) x.removeAttribute('id');
  Object.assign(el.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',position:'fixed'}); CFX.L.appendChild(el); cardEl.style.visibility='hidden';
  const st={el,r,c:null,t:0,dur:T.dur,k:0,tx:0,ty:0,rot:0,ry:0,sk:0,sc:1,op:1,f:'',seed:Math.random()*10,T,name,card:c};
  st.c=cfxPts(st);
  if(c&&c.pact){ cfxBurst(16,st.c.cx,st.c.cy,(i,x,y)=>({type:'smoke',x:x+cr(-r.width/2,r.width/2),y:y+cr(-r.height/2,r.height/2),vx:cr(-40,40),vy:cr(-60,-10),life:cr(0.9,1.5),max:1.5,size:cr(14,26),col:'#2a0a2a'})); }
  try{ T.init&&T.init(st); }catch(e){ console.warn('[Bunker] efeito da carta',e); }
  cfxSet(st); CFX.run.push(st); cfxLoop(); }
function cfxLoop(){ if(CFX.raf) return; CFX.last=performance.now(); const step=now=>{ const dt=Math.min(0.05,(now-CFX.last)/1000); CFX.last=now; const g=CFX.g, d=CFX.dpr;
    g.setTransform(d,0,0,d,0,0); g.globalCompositeOperation='source-over'; g.globalAlpha=1; g.clearRect(0,0,CFX.w,CFX.h);
    for(let i=CFX.run.length-1;i>=0;i--){ const st=CFX.run[i]; st.t+=dt; st.k=cl01(st.t/st.dur); try{ st.T.tick(st,dt,g); }catch(e){} g.globalAlpha=1; g.globalCompositeOperation='source-over'; cfxSet(st);
      if(st.t>=st.dur){ try{ st.T.end&&st.T.end(st); }catch(e){} st.el.remove(); CFX.run.splice(i,1); } }
    for(let i=CFX.P.length-1;i>=0;i--){ const p=CFX.P[i]; p.life-=dt; if(p.life<=0){ CFX.P.splice(i,1); continue; } const dr=Math.exp(-(p.drag||0)*dt); p.vx*=dr; p.vy*=dr; p.vy+=(p.ay||0)*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.rot+=(p.vr||0)*dt; cfxDrawP(g,p); }
    g.globalAlpha=1; g.globalCompositeOperation='source-over';
    if(CFX.run.length||CFX.P.length) CFX.raf=requestAnimationFrame(step); else { CFX.raf=0; g.clearRect(0,0,CFX.w,CFX.h); } };
  CFX.raf=requestAnimationFrame(step); }
{ const pk0=pickCard; pickCard=function(i){ let el=null, c=null; try{ if(G.cardsOpen&&G.cardOffer&&G.cardOffer[i]){ c=G.cardOffer[i].c; el=document.querySelector('#cardrow .card[data-i="'+i+'"]'); } }catch(e){}
    const r=pk0.apply(this,arguments); if(el&&c){ try{ cfxRun(el,c); }catch(e){ console.warn('[Bunker] efeito da carta',e); } } return r; }; }
CMDS.carta_fx={d:'carta_fx <tema|id> · mostra o efeito de escolher uma carta (temas: '+Object.keys(CFXT).join(', ')+')',f:a=>{ const k=(a[0]||'fireboom').toLowerCase(); let c=CARD_BY[k]||{id:'_',icon:'',name:k}; if(!CARD_BY[k]) CFX_ID._=k;
  const d=document.createElement('button'); d.className='card'; d.innerHTML=`<span class="ctier">teste</span><h3>${c.name||k}</h3><ul><li class="pro">${cfxThemeOf(c)}</li></ul>`; Object.assign(d.style,{position:'fixed',left:'calc(50% - 110px)',top:'30%',width:'220px',height:'300px',zIndex:69}); document.body.appendChild(d);
  setTimeout(()=>{ cfxRun(d,c); setTimeout(()=>d.remove(),50); },30); cprint('efeito: '+cfxThemeOf(c)); } };
