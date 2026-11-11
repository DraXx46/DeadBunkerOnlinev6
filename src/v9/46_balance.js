/* ================= v9 · BALANÇO DO NORMAL, ALERTA DE HITKILL E ACELERAR COM RUBIS =================
   1) Dificuldade Normal (a do meio): zumbis com menos vida e menos dano. Difícil e Pesadelo ficam como estavam.
   2) Quando um único golpe de algum zumbi vivo já derruba o jogador, a barra de vida mostra "ALERTA DE HITKILL".
   3) Níveis da habilidade/ultimate e a maestria podem ser comprados com rubis (preço alto), para quem quer acelerar. */
const BAL={normal:{hp:0.78,dmg:0.7}};
function balDiff(){ if(NET.mode&&NET.roomMeta&&NET.roomMeta.difficulty) return NET.roomMeta.difficulty; return NET.mode?'normal':SOLO_DIFF; }
v9On('always',()=>{ const B=BAL[balDiff()]; V9DIFF.hp=B?B.hp:1; V9DIFF.dmg=B?B.dmg:1; });

/* ---- alerta de hitkill ---- */
{ const st=document.createElement('style'); st.textContent=
  '#hpkill{display:none;margin-left:8px;padding:1px 7px;font-size:11px;font-weight:700;letter-spacing:.16em;color:#fff;background:#b3140c;border-radius:3px;text-shadow:none;animation:hpkillBlink .7s steps(2,start) infinite}'+
  '#hpw.hitkill #hpkill{display:inline-block} #hpw.hitkill .hpbar{box-shadow:0 0 0 1px #ff3a2a,0 0 14px rgba(255,40,20,.75)}'+
  '@keyframes hpkillBlink{to{opacity:.35}}';
  document.head.appendChild(st);
  const row=document.querySelector('#hpw .hprow'), s=document.createElement('span'); s.id='hpkill'; s.textContent='ALERTA DE HITKILL';
  if(row){ const ref=document.getElementById('hpst'); row.insertBefore(s,ref||null); } }
function balHitOf(z){ if(z.boss) return 85; if(z.kind==='dog') return 25; if(z.zdmg!=null) return +z.zdmg||0; if(z.kind==='bomber') return 45; if(z.kind==='fat') return 65; if(z.kind==='brute') return 85; return z.crawl?40:55; }
const BALK={t:0,on:false};
v9On('always',dt=>{
  BALK.t-=dt; if(BALK.t>0) return; BALK.t=0.2;
  let on=false;
  if(G.state==='playing'&&!P.down&&!CHEAT.god&&!x1Live()){
    let worst=0; for(const z of zlist()){ if(!z||z.dead) continue; const h=balHitOf(z); if(h>worst) worst=h; }
    if(worst>0){ let k=1; try{ k=Mod.taken*threatDmg()*abTaken()*V9DIFF.dmg*v9TakenK(); }catch(e){}
      const shield=+P.shield||0; on=worst*k>=P.hp+shield && !(Mod.secondChance&&!G.usedChance) && !CHEAT.buddha; }
  }
  if(on!==BALK.on){ BALK.on=on; const w=document.getElementById('hpw'); if(w) w.classList.toggle('hitkill',on); }
});

/* ---- acelerar habilidade e maestria com rubis ---- */
const PGR={lvBase:250, lvPerXp:0.8, masteryK:0.5};
function pgRubyLv(ax){ const nx=pgNextAbXp(ax); if(nx==null) return null; return {nx,price:Math.ceil((PGR.lvBase+(nx-ax)*PGR.lvPerXp)/50)*50}; }
function pgRubyMastery(id){ return Math.ceil((PG.mastery[id]||8000)*PGR.masteryK/100)*100; }
function pgRubySpend(n){ if((PROG.rubies|0)<n){ Snd.ui('deny'); toast(`Faltam ♦ ${(n-(PROG.rubies|0)).toLocaleString('pt-BR')} rubis.`,{bad:true}); return false; } PROG.rubies-=n; renderDrax(); return true; }
// botão com confirmação em dois cliques (o gasto é alto)
function pgRubyBtn(label,price,onBuy){ const fmt=n=>n.toLocaleString('pt-BR'); const b=pgEl('button','cta small ruby',`${label} · ♦ ${fmt(price)}`); b.type='button'; b.dataset.snd='none';
  b.style.cssText='margin-top:6px;background:#5a0f2a;border-color:#d0336a';
  b.disabled=(PROG.rubies|0)<price; let armed=false;
  b.addEventListener('click',()=>{ if(!armed){ armed=true; b.textContent=`Confirmar: gastar ♦ ${fmt(price)} rubis?`; setTimeout(()=>{ if(armed&&b.isConnected){ armed=false; b.textContent=`${label} · ♦ ${fmt(price)}`; } },4000); return; } armed=false; onBuy(); });
  return b; }
const pgCharPanel0=pgCharPanel;
pgCharPanel=function(id,info,rerender){
  const r=pgCharPanel0.apply(this,arguments);
  try{
    const p=pgC(id); if(!p.own) return r;
    const boxes=info.querySelectorAll('.chpas'), abBox=boxes[boxes.length-3], mBox=boxes[boxes.length-1];
    const la=abLvA(id), lu=abLvU(id), q=pgRubyLv(p.ax);
    if(abBox&&la>=0&&q&&!(la>=4&&lu>=3)){
      const nextName=PG.aXp.includes(q.nx)?`Habilidade Nv ${PG.aXp.indexOf(q.nx)}`:`Ultimate Nv ${PG.uXp.indexOf(q.nx)+1}`;
      abBox.appendChild(pgRubyBtn('Acelerar: '+nextName,q.price,()=>{ if(!pgRubySpend(q.price)) return; const prev={la:abLvA(id),lu:abLvU(id)}; p.ax=Math.max(p.ax,q.nx); saveProg(); Snd.ui('levelup');
        try{ abApplyLevels(); }catch(e){} const la2=abLvA(id), lu2=abLvU(id);
        toast(lu2>prev.lu?(lu2===1?'Ultimate desbloqueada!':'Ultimate Nv '+lu2+'!'):la2>prev.la?'Habilidade Nv '+la2+'!':'Nível comprado!');
        if(la2>=4&&lu2>=3) toast('Tudo no máximo: a Maestria está à venda!'); rerender(); }));
    }
    if(mBox&&!p.m&&pgMaxed(id)){ const price=pgRubyMastery(id);
      mBox.appendChild(pgRubyBtn('Comprar maestria com rubis',price,()=>{ if(!pgRubySpend(price)) return; p.m=1; saveProg(); Snd.ui('levelup'); try{ abApplyLevels(); }catch(e){} toast(`Maestria ${MASTERY[id].name} ativa!`); rerender(); })); }
  }catch(e){ console.warn('[Bunker v9] rubis',e); }
  return r;
};
