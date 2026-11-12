/* ================= v9 · ESCOLHA DE PERSONAGEM INTERATIVA =================
   Os cartões inclinam e brilham seguindo o mouse, o retrato se mexe em paralaxe, e ao passar o mouse
   abre um painel com o estilo do personagem (ex.: "Bruto · Tanque · Dano em área"), habilidade (Z),
   ultimate (X), passiva, dificuldade e atributos. No controle/teclado o painel acompanha o foco. */
const PKX={
  recruta:{tags:['Versátil','Munição para o time','Ataque aéreo'],line:'O soldado completo: recarrega rápido, mantém o time armado e chama a aviação.',diff:1,st:[3,3,3,3],
    u:{name:'Apoio Aéreo',desc:'Marca o ponto para onde você olha: um caça bombardeia a linha e todo o time recebe munição cheia.'}},
  helena:{tags:['Suporte','Cura em área','Reanima de longe'],line:'Mantém todo mundo de pé. Levanta aliados caídos até a 40 m, uma vez por minuto.',diff:2,st:[3,2,2,5]},
  moreira:{tags:['Bruto','Tanque','Dano em área'],line:'Linha de frente: aguenta o tranco e atropela quem estiver no caminho.',diff:1,st:[5,4,2,1],
    u:{name:'Fúria do Blindado',desc:'Por alguns segundos: munição infinita, tiros mais fortes, mais velocidade e pulo mais alto.'}},
  tomas:{tags:['Corpo a corpo','Fogo sagrado','Faca devastadora'],line:'Água benta, fogo e uma faca que resolve tudo de perto.',diff:2,st:[3,4,2,2]},
  iara:{tags:['Precisão','Marca alvos','Tiro na cabeça'],line:'Atiradora paciente: marca os zumbis e transforma qualquer tiro em headshot.',diff:3,st:[2,5,3,2]},
  viktor:{tags:['Velocidade','Choque elétrico','Controle de grupo'],line:'Rápido e elétrico: paralisa grupos inteiros, mas superaquece.',diff:3,st:[3,3,5,2]}
};
const PKX_ST=['Resistência','Dano','Mobilidade','Suporte'], PKX_DIFF=['','Fácil','Média','Difícil'];

v9Css(`
#pk-grid{perspective:900px}
.pkc{transform-style:preserve-3d;will-change:transform;--mx:50%;--my:50%;transition:transform .18s ease-out,border-color .15s,box-shadow .2s!important}
.pkc::before{content:'';position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity .2s;background:radial-gradient(circle at var(--mx) var(--my),rgba(255,230,180,.22),rgba(255,230,180,0) 55%)}
.pkc:hover::before,.pkc:focus-visible::before{opacity:1}
.pkc img{transition:transform .2s ease-out,filter .2s;transform:translateZ(18px)}
.pkc:hover:not(.off) img{filter:brightness(1.12) contrast(1.05)}
.pkc b,.pkc small,.pkc .tag{transform:translateZ(10px)}
.pkc .pkt{display:flex;flex-wrap:wrap;justify-content:center;gap:4px;min-height:18px}
.pkc .pkt i{font-style:normal;font-size:9.5px;letter-spacing:.06em;padding:2px 6px;border-radius:9px;background:rgba(240,210,138,.12);color:#e9cf93;border:1px solid rgba(240,210,138,.25)}
.pkc.hov:not(.off){border-color:#f0d28a;box-shadow:0 14px 36px rgba(0,0,0,.6),0 0 22px rgba(240,180,90,.18)}
#pk-info{position:relative;display:grid;grid-template-columns:150px 1fr 220px;gap:18px;align-items:start;padding:14px 18px;border:1px solid rgba(240,210,138,.25);background:linear-gradient(180deg,rgba(26,14,8,.92),rgba(8,6,5,.92));min-height:150px;opacity:.35;transition:opacity .25s}
#pk-info.on{opacity:1}
#pk-info .art{width:150px;height:150px;object-fit:cover;border:1px solid rgba(240,210,138,.3);animation:pkxIn .35s ease-out}
#pk-info h3{margin:0;font:26px var(--f-display);color:#f3ebe2;letter-spacing:.03em}
#pk-info .role{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#c9a35c;margin:2px 0 8px}
#pk-info .tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
#pk-info .tags i{font-style:normal;font-size:12px;font-weight:600;padding:3px 10px;border-radius:12px;background:#7a1410;color:#fff;box-shadow:0 0 10px rgba(200,40,20,.35);animation:pkxIn .3s ease-out backwards}
#pk-info .tags i:nth-child(2){animation-delay:.05s}#pk-info .tags i:nth-child(3){animation-delay:.1s}
#pk-info .line{font-size:13px;color:#e4d9cb;margin:0 0 8px;line-height:1.4}
#pk-info .ab{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;font-size:12px;color:#cfc3b6;line-height:1.35}
#pk-info .ab kbd{font:700 11px var(--f-type);color:#0b0909;background:#d9a441;border-radius:3px;padding:1px 6px;height:fit-content}
#pk-info .ab b{color:#f0e4d6}
#pk-info .side{font-size:11px;color:#a99c8f;letter-spacing:.08em}
#pk-info .side .df{margin-bottom:10px;text-transform:uppercase;letter-spacing:.18em}
#pk-info .side .df b{color:#f0d28a}
#pk-info .bar{display:grid;grid-template-columns:86px 1fr;align-items:center;gap:8px;margin:5px 0;text-transform:uppercase;font-size:10px;letter-spacing:.14em}
#pk-info .bar u{display:flex;gap:3px}#pk-info .bar u s{flex:1;height:6px;background:rgba(255,255,255,.12);text-decoration:none}
#pk-info .bar u s.f{background:linear-gradient(90deg,#b8321f,#f08a4a);box-shadow:0 0 6px rgba(240,120,60,.5)}
#pk-info .ps{margin-top:8px;color:#cfc3b6;font-size:12px}#pk-info .ps b{color:#e9cf93}
#pk-info .hint{position:absolute;right:14px;bottom:8px;font-size:10px;letter-spacing:.2em;color:#7d7268;text-transform:uppercase}
@keyframes pkxIn{from{opacity:0;transform:translateY(6px)}}
@media (max-width:820px){#pk-info{grid-template-columns:1fr}#pk-info .art{display:none}}
`);
function pkxInfoEl(){ let el=document.getElementById('pk-info'); if(!el){ el=document.createElement('div'); el.id='pk-info'; const pl=document.getElementById('pk-players'); pl.parentNode.insertBefore(el,pl); } return el; }
function pkxShow(c){
  const el=pkxInfoEl(), C=CHARS[c], X=PKX[c]||{tags:[],line:'',diff:2,st:[3,3,3,3]}, D=AB_DEF[c]||{}, A=D.a||{}, U=X.u||D.u||{};
  if(!C) return; if(el.dataset.c===c&&el.classList.contains('on')) return; el.dataset.c=c;
  let art=''; try{ art=CHAR_ART[c]?charFace(c):charThumb(c,pickVar(c)); }catch(e){}
  const nm=(C.vars[pickVar(c)]||{}).name||C.name;
  el.innerHTML=`<img class="art" src="${art}" alt="">
   <div><h3>${nm}</h3><div class="role">${C.role||''}</div><div class="tags">${X.tags.map(t=>`<i>${t}</i>`).join('')}</div>
   <p class="line">${X.line}</p>
   <div class="ab"><kbd>Z</kbd><span><b>${A.name||'Habilidade'}</b> · ${A.desc||''}</span><kbd>X</kbd><span><b>${U.name||'Ultimate'}</b> · ${U.desc||''}</span></div>
   ${C.passive?`<div class="ps">Passiva: <b>${C.passive.name}</b></div>`:''}</div>
   <div class="side"><div class="df">Dificuldade <b>${PKX_DIFF[X.diff]||''}</b></div>${PKX_ST.map((s,i)=>`<div class="bar"><span>${s}</span><u>${[1,2,3,4,5].map(n=>`<s class="${n<=X.st[i]?'f':''}"></s>`).join('')}</u></div>`).join('')}</div>
   <div class="hint">${pickAllowed(c)?'Clique para escolher':'Indisponível'}</div>`;
  el.classList.add('on');
}
const renderPick0=renderPick;
renderPick=function(){
  const r=renderPick0.apply(this,arguments);
  try{
    const ids=pickIds(), cards=document.querySelectorAll('#pk-grid .pkc');
    cards.forEach((b,i)=>{ const c=ids[i]; if(!c) return; b.dataset.c=c; const X=PKX[c];
      if(X){ const t=document.createElement('div'); t.className='pkt'; t.innerHTML=X.tags.slice(0,2).map(s=>`<i>${s}</i>`).join(''); b.querySelector('small')?.after(t); }
      const im=b.querySelector('img');
      b.addEventListener('pointermove',ev=>{ const R=b.getBoundingClientRect(), x=(ev.clientX-R.left)/R.width, y=(ev.clientY-R.top)/R.height;
        b.style.setProperty('--mx',(x*100).toFixed(1)+'%'); b.style.setProperty('--my',(y*100).toFixed(1)+'%');
        if(!b.classList.contains('off')) b.style.transform=`translateY(-6px) rotateX(${((0.5-y)*14).toFixed(2)}deg) rotateY(${((x-0.5)*16).toFixed(2)}deg) scale(1.03)`;
        if(im) im.style.transform=`translateZ(18px) translate(${((x-0.5)*-8).toFixed(1)}px,${((y-0.5)*-6).toFixed(1)}px) scale(1.06)`; });
      const enter=()=>{ b.classList.add('hov'); pkxShow(c); try{ Snd.ui('hover'); }catch(e){} };
      const leave=()=>{ b.classList.remove('hov'); b.style.transform=''; if(im) im.style.transform=''; const mine=PICK.picks&&PICK.picks[PICK.me]; if(mine) pkxShow(mine); };
      b.addEventListener('pointerenter',enter); b.addEventListener('focus',enter); b.addEventListener('pointerleave',leave); b.addEventListener('blur',leave);
    });
    const mine=PICK.picks&&PICK.picks[PICK.me], el=pkxInfoEl();
    if(mine) pkxShow(mine); else if(!el.dataset.c){ el.classList.remove('on'); el.innerHTML='<div style="grid-column:1/-1;align-self:center;text-align:center;color:#a99c8f;font-size:13px;letter-spacing:.12em">Passe o mouse num personagem para ver o estilo de jogo dele</div>'; }
    else pkxShow(el.dataset.c);
  }catch(e){ console.warn('[Bunker v9] pick',e); }
  return r;
};
