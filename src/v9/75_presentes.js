/* ================= v9 · PRESENTES DE DESENVOLVEDOR (com animação) =================
   O servidor guarda o presente até o jogador confirmar; ele chega toda vez que a conta entra (login automático ao abrir o
   jogo). Aqui o presente é aplicado uma vez (drax, rubis, faca, personagem no máximo, níveis de conta) e entra numa fila
   de "abrir presente" salva no progresso: a animação toca no menu, e se o jogador fechar antes de ver, toca na próxima vez.
   Envio (conta de administrador, console):
     presente <jogador> [drax N] [rubi N] [faca tipo [acabamento]] [max personagem] [conta N] [msg texto...]
     presente_dev <jogador>  → pacote padrão: karambit lendária, 25.000 drax, 300 rubis, Sargento no máximo, +10 níveis */
const GIFTFX={busy:false};
function giftAccAdd(n){ const L0=accLv(PROG.acc.xp|0).L, L1=Math.min(PG.accMax,L0+n); PROG.acc.xp=Math.max(PROG.acc.xp|0,pgXpFor(L1,400,120)); return {L0,L1:accLv(PROG.acc.xp).L}; }
function giftCharMax(id){ const p=pgC(id); const L0=charLv(p.xp|0).L; Object.assign(p,{own:1,z:1,m:1,ax:Math.max(p.ax|0,PG.aXp[4],PG.uXp[2]),xp:Math.max(p.xp|0,pgXpFor(PG.charMax,250,90))}); return {L0,L1:charLv(p.xp).L}; }
applyGifts=function(items){
  if(!Array.isArray(items)) return; PROG.gdone=PROG.gdone||[]; PROG.giftShow=PROG.giftShow||[]; const got=[];
  for(const g of items){ if(!g||!g.id) continue;
    if(!PROG.gdone.includes(g.id)){ const show={id:g.id,from:g.from||'',dev:!!g.dev,msg:g.msg||'',drax:g.drax|0,rubi:g.rubi|0};
      PROG.drax=(PROG.drax|0)+(g.drax|0); PROG.rubies=(PROG.rubies|0)+(g.rubi|0);
      if(g.knife&&KTYPES[g.knife.t]){ const it=rollItem(clamp(g.knife.r==null?4:g.knife.r|0,0,5),null,g.knife.t); if(g.knife.s&&SKINS[g.knife.s]) it.s=g.knife.s; it.wear=Math.min(it.wear,0.05); it.gift=1; PROG.items.push(it); show.knife=it.uid; }
      if(g.charMax&&CHARS[g.charMax]){ show.charMax=g.charMax; show.char=giftCharMax(g.charMax); }
      if(g.acc){ show.acc=giftAccAdd(g.acc|0); }
      PROG.gdone.push(g.id); PROG.giftShow.push(show); got.push(g); }
    netSendRaw({type:'giftAck',ids:[g.id]}); }
  if(got.length){ PROG.gdone=PROG.gdone.slice(-300); saveProg(); try{ pgRefresh(); }catch(e){} try{ recomputeMods(); }catch(e){}
    cprint(`Presente recebido${got[0].from?' de '+got[0].from:''}`,'ok'); giftTryShow(); }
};
/* ---- animação ---- */
(function(){ const css=document.createElement('style'); css.textContent=`
#giftfx{position:fixed;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 45%,rgba(60,30,90,.55),rgba(2,2,4,.93) 70%);font-family:var(--f-display,inherit);color:#f3ecdc;overflow:hidden;opacity:0;transition:opacity .4s}
#giftfx.on{opacity:1}
#giftfx .gtitle{font-size:clamp(26px,4.4vw,54px);letter-spacing:.06em;text-align:center;text-shadow:0 0 24px rgba(214,184,255,.55);transform:translateY(-10px);opacity:0;transition:all .6s .15s}
#giftfx .gsub{font-size:clamp(14px,1.6vw,20px);color:#d6b8ff;letter-spacing:.18em;text-transform:uppercase;margin-top:6px;opacity:0;transition:opacity .6s .35s}
#giftfx .gmsg{font-family:inherit;font-size:15px;color:#cfc6b4;margin-top:10px;max-width:560px;text-align:center;opacity:0;transition:opacity .6s .5s}
#giftfx.on .gtitle{transform:none;opacity:1} #giftfx.on .gsub,#giftfx.on .gmsg{opacity:1}
#giftfx .gstage{position:relative;width:min(1100px,94vw);height:min(420px,52vh);margin-top:18px;display:flex;align-items:center;justify-content:center}
#giftfx .gbox{position:absolute;width:150px;height:150px;cursor:pointer;animation:gbob 1.6s ease-in-out infinite;filter:drop-shadow(0 18px 30px rgba(0,0,0,.6))}
#giftfx .gbox.shake{animation:gshake .5s ease-in-out 3}
#giftfx .gbox .gb{position:absolute;left:8px;right:8px;bottom:0;height:104px;background:linear-gradient(135deg,#7a2bd6,#4a1490);border-radius:6px;box-shadow:inset 0 -10px 24px rgba(0,0,0,.35)}
#giftfx .gbox .gl{position:absolute;left:0;right:0;top:12px;height:38px;background:linear-gradient(135deg,#9a45f0,#5c1cae);border-radius:6px;box-shadow:0 6px 10px rgba(0,0,0,.35);transition:transform .7s cubic-bezier(.2,.9,.3,1.3),opacity .7s;transform-origin:50% 100%}
#giftfx .gbox .rv{position:absolute;left:50%;width:22px;margin-left:-11px;top:12px;bottom:0;background:linear-gradient(90deg,#f4c03a,#ffe28a,#e0a51e)}
#giftfx .gbox .rh{position:absolute;left:8px;right:8px;top:82px;height:20px;background:linear-gradient(180deg,#f4c03a,#ffe28a,#e0a51e)}
#giftfx .gbox .bow{position:absolute;left:50%;top:-14px;width:80px;height:34px;margin-left:-40px;transition:transform .7s cubic-bezier(.2,.9,.3,1.3),opacity .7s}
#giftfx .gbox .bow:before,#giftfx .gbox .bow:after{content:'';position:absolute;top:2px;width:36px;height:28px;border:6px solid #f4c03a;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;box-sizing:border-box}
#giftfx .gbox .bow:before{left:0;transform:rotate(-18deg)} #giftfx .gbox .bow:after{right:0;transform:rotate(18deg)}
#giftfx .gbox.open .gl,#giftfx .gbox.open .bow{transform:translateY(-140px) rotate(-24deg);opacity:0}
#giftfx .gbox.open{animation:gdrop .9s .5s forwards}
#giftfx .gburst{position:absolute;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle,#fff,rgba(214,184,255,.9) 30%,rgba(160,90,255,0) 70%);opacity:0;pointer-events:none}
#giftfx .gburst.go{animation:gburst 1.1s ease-out forwards}
#giftfx .gconf{position:absolute;width:8px;height:14px;top:50%;left:50%;opacity:0;pointer-events:none}
#giftfx .gcards{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;pointer-events:none}
#giftfx .gcard{pointer-events:auto;width:180px;min-height:212px;padding:12px 10px 14px;box-sizing:border-box;border-radius:10px;background:linear-gradient(180deg,rgba(28,24,36,.96),rgba(12,10,16,.96));border:1px solid var(--rc,#6a5a8a);box-shadow:0 0 0 1px rgba(0,0,0,.6),0 0 26px -6px var(--rc,#6a5a8a);display:flex;flex-direction:column;align-items:center;text-align:center;opacity:0;transform:translateY(60px) scale(.6) rotate(var(--rot,0deg))}
#giftfx .gcard.in{animation:gcard .7s cubic-bezier(.2,.9,.3,1.25) forwards}
#giftfx .gcard .ic{height:96px;display:flex;align-items:center;justify-content:center;font-size:64px;line-height:1}
#giftfx .gcard .ic img{max-width:160px;max-height:96px;object-fit:contain}
#giftfx .gcard .ic img.face{width:88px;height:88px;border-radius:50%;object-fit:cover;border:2px solid var(--rc,#6a5a8a)}
#giftfx .gcard .t{font-size:20px;margin-top:8px;letter-spacing:.03em}
#giftfx .gcard .d{font-family:inherit;font-size:12.5px;color:#bdb4a2;margin-top:4px;line-height:1.35}
#giftfx .gcard .tag{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--rc,#d6b8ff);margin-top:6px}
#giftfx .gbtn{margin-top:18px;font:inherit;font-size:20px;letter-spacing:.08em;padding:12px 34px;border-radius:8px;border:1px solid #d6b8ff;background:rgba(122,43,214,.35);color:#fff;cursor:pointer;opacity:0;transition:opacity .5s;pointer-events:none}
#giftfx .gbtn.on{opacity:1;pointer-events:auto} #giftfx .gbtn:hover{background:rgba(122,43,214,.6)}
#giftfx .ghint{position:absolute;bottom:-34px;left:50%;transform:translateX(-50%);font-size:13px;color:#a99cc4;letter-spacing:.12em;white-space:nowrap}
@keyframes gbob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
@keyframes gshake{0%,100%{transform:rotate(0)}20%{transform:rotate(-9deg) scale(1.04)}40%{transform:rotate(8deg)}60%{transform:rotate(-6deg) scale(1.06)}80%{transform:rotate(5deg)}}
@keyframes gdrop{to{transform:translateY(40px) scale(.7);opacity:0}}
@keyframes gburst{0%{opacity:1;transform:scale(1)}60%{opacity:.85}100%{opacity:0;transform:scale(28)}}
@keyframes gcard{0%{opacity:0;transform:translateY(60px) scale(.6) rotate(var(--rot,0deg))}100%{opacity:1;transform:translateY(0) scale(1) rotate(0)}}
@keyframes gconf{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--r))}}
`; document.head.appendChild(css); })();
function giftCards(s){ const out=[]; const fmt=n=>(n|0).toLocaleString('pt-BR');
  if(s.knife){ const it=(PROG.items||[]).find(i=>i.uid===s.knife); if(it){ const rar=itemRar(it); let img=''; try{ img=knifeThumb(it,200,90); }catch(e){}
      out.push({rc:rar.col,ic:img?`<img alt="" src="${img}">`:'🗡',t:KTYPES[it.t].name,d:(SKINS[it.s]||{name:''}).name+(it.pas&&it.pas.length?'<br>'+it.pas.map(fmtPas).join(' · '):''),tag:rar.name}); } }
  if(s.charMax&&CHARS[s.charMax]){ const C=CHARS[s.charMax], vk=varKeys(s.charMax)[0], nm=(C.vars&&C.vars[vk]&&C.vars[vk].name)||C.name||s.charMax;
    out.push({rc:'#f4c03a',ic:`<img class="face" alt="" src="${charFace(s.charMax)}" onerror="this.replaceWith(document.createTextNode('★'))">`,t:nm,d:`Nível ${PG.charMax} · habilidade Nv 4<br>ultimate Nv 3 · maestria`,tag:'Tudo no máximo'}); }
  if(s.acc) out.push({rc:'#5fb0ef',ic:'⬆',t:`+${s.acc.L1-s.acc.L0} níveis`,d:`Conta Nv ${s.acc.L0} → Nv ${s.acc.L1}`,tag:'Conta'});
  if(s.drax) out.push({rc:'#b45cff',ic:'<span style="color:#d6b8ff">◆</span>',t:fmt(s.drax),d:'drax',tag:'Moeda'});
  if(s.rubi) out.push({rc:'#ff4a5a',ic:'<span style="color:#ff6a7a">♦</span>',t:fmt(s.rubi),d:'rubis',tag:'Moeda'});
  return out; }
function giftShowOne(s,done){ GIFTFX.busy=true; const root=document.createElement('div'); root.id='giftfx';
  const dev=s.dev||/^dev/i.test(s.from||'');
  root.innerHTML=`<div class="gtitle">VOCÊ RECEBEU UM PRESENTE</div><div class="gsub">${dev?'de um desenvolvedor':'de '+(s.from||'alguém')}</div>${s.msg?`<div class="gmsg">“${s.msg.replace(/[<>&]/g,'')}”</div>`:''}
    <div class="gstage"><div class="gburst"></div><div class="gbox"><div class="gb"></div><div class="rv"></div><div class="rh"></div><div class="gl"></div><div class="bow"></div><div class="ghint">CLIQUE PARA ABRIR</div></div><div class="gcards"></div></div>
    <button class="gbtn" type="button">PEGAR PRESENTES</button>`;
  document.body.appendChild(root); requestAnimationFrame(()=>root.classList.add('on'));
  try{ if(document.pointerLockElement) document.exitPointerLock(); }catch(e){}
  const box=root.querySelector('.gbox'), burst=root.querySelector('.gburst'), cards=root.querySelector('.gcards'), btn=root.querySelector('.gbtn'), stage=root.querySelector('.gstage');
  let opened=false;
  const open=()=>{ if(opened) return; opened=true; box.querySelector('.ghint').remove(); box.classList.add('shake'); try{ sfx('box_open'); }catch(e){}
    setTimeout(()=>{ box.classList.remove('shake'); box.classList.add('open'); burst.classList.add('go'); try{ sfx('powerup_win'); }catch(e){}
      const cols=['#f4c03a','#d6b8ff','#7a2bd6','#ff6a7a','#5fb0ef','#ffffff'];
      for(let i=0;i<70;i++){ const c=document.createElement('div'); c.className='gconf'; const a=Math.random()*Math.PI*2, r=180+Math.random()*420;
        c.style.background=cols[i%cols.length]; c.style.setProperty('--dx',Math.cos(a)*r+'px'); c.style.setProperty('--dy',(Math.sin(a)*r*0.7+160)+'px'); c.style.setProperty('--r',(Math.random()*900-450)+'deg');
        c.style.animation=`gconf ${1.2+Math.random()*1.1}s cubic-bezier(.15,.7,.4,1) ${Math.random()*0.15}s forwards`; stage.appendChild(c); }
      const list=giftCards(s);
      list.forEach((k,i)=>{ const el=document.createElement('div'); el.className='gcard'; el.style.setProperty('--rc',k.rc); el.style.setProperty('--rot',(i%2?8:-8)+'deg');
        el.innerHTML=`<div class="ic">${k.ic}</div><div class="t">${k.t}</div><div class="d">${k.d}</div><div class="tag">${k.tag}</div>`; cards.appendChild(el);
        setTimeout(()=>{ el.classList.add('in'); try{ sfx(i===0?'levelup':'cash',{vol:0.6}); }catch(e){} },650+i*380); });
      setTimeout(()=>btn.classList.add('on'),900+list.length*380); },1500); };
  box.addEventListener('click',open); setTimeout(open,4500);
  const close=()=>{ if(!btn.classList.contains('on')) return; root.classList.remove('on'); setTimeout(()=>{ root.remove(); GIFTFX.busy=false; done&&done(); },420); };
  btn.addEventListener('click',close);
}
/* toca quando o jogador está no menu (nunca no meio da partida); um presente de cada vez */
function giftTryShow(){ if(GIFTFX.busy) return; const q=PROG.giftShow; if(!q||!q.length) return;
  if(typeof G==='undefined'||G.state!=='menu'||$('#menu').hidden||!$('#login').hidden) return;
  const s=q[0]; giftShowOne(s,()=>{ PROG.giftShow=(PROG.giftShow||[]).filter(x=>x.id!==s.id); saveProg(); try{ renderDrax(); menuLabels(); }catch(e){} setTimeout(giftTryShow,300); }); }
setInterval(()=>{ try{ giftTryShow(); }catch(e){} },1200);
/* ---- envio (só a conta de administrador consegue: o servidor confere) ---- */
CMDS.presente={d:'presente <jogador> [drax N] [rubi N] [faca tipo [acabamento]] [max personagem] [conta N] [msg texto…] · envia um presente com animação (administrador)',f:a=>{
  const to=a[0]; if(!to){ cprint('Uso: presente <jogador> drax 25000 rubi 300 faca karambit max moreira conta 10 msg Obrigado por jogar!','err'); return; }
  const pack={}; let drax=0, rubi=0;
  for(let i=1;i<a.length;i++){ const k=(a[i]||'').toLowerCase();
    if(k==='drax') drax=num(a[++i],0)|0; else if(k==='rubi'||k==='rubis') rubi=num(a[++i],0)|0;
    else if(k==='faca'){ const t=(a[++i]||'').toLowerCase(); if(!KTYPES[t]){ cprint('Tipos de faca: '+KT_KEYS.join(', '),'err'); return; } pack.knife={t,r:4}; const s2=(a[i+1]||'').toLowerCase(); if(SKINS[s2]){ pack.knife.s=s2; pack.knife.r=Math.max(0,SKINS[s2].r); i++; } }
    else if(k==='max'){ const c=(a[++i]||'').toLowerCase(); if(!CHARS[c]){ cprint('Personagens: '+CHAR_KEYS.join(', '),'err'); return; } pack.charMax=c; }
    else if(k==='conta') pack.acc=num(a[++i],0)|0;
    else if(k==='msg'){ pack.msg=a.slice(i+1).join(' '); break; } }
  serverReq('adminGive',{to,drax,rubi,pack}); }};
CMDS.presente_dev={d:'presente_dev <jogador> · pacote de desenvolvedor: karambit lendária, 25.000 drax, 300 rubis, Sargento no máximo e +10 níveis de conta',f:a=>{
  if(!a[0]){ cprint('Uso: presente_dev <jogador>','err'); return; }
  serverReq('adminGive',{to:a[0],drax:25000,rubi:300,pack:{knife:{t:'karambit',r:4},charMax:'moreira',acc:10,msg:'Valeu por jogar o Dead Bunker!'}}); }};
CMDS.presente_teste={d:'presente_teste mostra a animação de presente com um pacote de exemplo (não dá nada)',f:()=>{
  const it=rollItem(4,null,'karambit'); PROG.items.push(it); const s={id:'t',dev:true,msg:'Valeu por jogar o Dead Bunker!',drax:25000,rubi:300,knife:it.uid,charMax:'moreira',acc:{L0:7,L1:17}};
  giftShowOne(s,()=>{ PROG.items=PROG.items.filter(x=>x.uid!==it.uid); }); }};
/* avisa o servidor que esta versão sabe abrir o pacote completo; versões antigas não recebem o pacote de desenvolvedor
   (ficaria só o drax/rubi e o resto se perderia) — o servidor segura até o jogador atualizar */
{ const nr=netRequest; netRequest=function(type,payload){ if(type==='login'){ payload=Object.assign({},payload||{}); payload.caps=['gift2']; } return nr.call(this,type,payload); }; }
