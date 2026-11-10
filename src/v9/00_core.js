/* ================= v9 · NÚCLEO DAS NOVIDADES =================
   Ganchos que o jogo antigo chama em pontos-chave (quadro, reset, rodada, abate, tiro). Cada sistema novo se pendura aqui,
   então um erro num sistema novo nunca derruba a partida: ele é registrado uma vez no console e o resto segue. */
const V9NET={ev:{},act:{}};
const V9DIFF={hp:1,dmg:1,spd:1,cost:1,pts:1};
const V9={hooks:{frame:[],always:[],reset:[],roundStart:[],roundEnd:[],kill:[],hit:[],fire:[],start:[],menu:[]},boxesWon:[],t:0};
function v9On(k,fn){ (V9.hooks[k]||(V9.hooks[k]=[])).push(fn); }
function v9Run(k,a,b,c,d,e,f){ const L=V9.hooks[k]; if(!L) return; for(const fn of L){ try{ fn(a,b,c,d,e,f); }catch(err){ if(!fn._err){ fn._err=1; console.warn('[Bunker v9] '+k,err); } } } }
function v9Frame(dt){ V9.t+=dt; v9Run('frame',dt); }
function v9Always(dt,raw){ v9Run('always',dt,raw); }
function v9Reset(){ V9.boxesWon=[]; v9Run('reset'); }
function v9RoundStart(r){ v9Run('roundStart',r); }
function v9RoundEnd(r){ v9Run('roundEnd',r); }
/* abate feito por ESTE jogador (anfitrião: na hora; convidado: quando o anfitrião confirma) */
function v9OnKill(x,z,kind,part,src,zz){ v9Run('kill',x,z,kind,part,src,zz); }
const v9Live=()=>G.state==='playing'||G.state==='paused';
const v9Solo=()=>!NET.mode;
/* pequenos utilitários de interface */
function v9El(tag,cls,html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function v9Css(css){ const s=document.createElement('style'); s.textContent=css; document.head.appendChild(s); }
function v9Fmt(n){ return Math.floor(n).toLocaleString('pt-BR'); }
/* "1 em 12.500": chance em texto, como pedido para as caixas, facas, skins e artefatos */
function v9Odds(p){ if(!(p>0)) return '—'; const n=Math.max(1,Math.round(1/p)); return '1 em '+n.toLocaleString('pt-BR'); }
/* material Phong simples com cache */
const V9M={}; function v9Mat(key,o){ return V9M[key]||(V9M[key]=new THREE.MeshPhongMaterial(o)); }
function v9Mesh(geo,mat,par,x,y,z,rx,ry,rz){ const m=new THREE.Mesh(geo,mat); m.position.set(x||0,y||0,z||0); m.rotation.set(rx||0,ry||0,rz||0); if(par) par.add(m); return m; }
/* tela que pisca com uma cor (eventos, viagem no tempo, chefe) */
function v9Flash(col,op,dur){ let f=document.getElementById('v9flash'); if(!f){ f=v9El('div'); f.id='v9flash'; document.body.appendChild(f); }
  f.style.transition='none'; f.style.background=col||'#fff'; f.style.opacity=op==null?0.8:op; void f.offsetWidth; f.style.transition=`opacity ${dur||0.8}s ease`; f.style.opacity=0; }
v9Css(`#v9flash{position:fixed;inset:0;pointer-events:none;z-index:60;opacity:0}`);
window.__v9dbg=code=>eval(code);   // depuração (console): __v9dbg('G.round')
let V9NX=0; function v9NetExtra(){ return V9NX; }
function v9NoPause(){ return (typeof SREV!=='undefined'&&SREV.offer)||(typeof INV!=='undefined'&&INV.inGame)||(typeof TM!=='undefined'&&TM.cine); }
/* estado extra que o anfitrião manda junto (máquina do tempo, carro, cidade, chefe da cidade) */
const V9HS={get:{},set:{}};
function v9HostState(){ const o={}; for(const k in V9HS.get){ try{ o[k]=V9HS.get[k](); }catch(e){} } return o; }
function v9ApplyHost(o){ for(const k in o){ if(V9HS.set[k]) try{ V9HS.set[k](o[k]); }catch(e){} } }
