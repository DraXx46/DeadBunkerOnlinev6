/* ================= v9 · RECOMPENSAS A CADA 3 RODADAS + TELA DE MORTE COM ANEL DE XP ================= */
function v9BoxSvg(col,size){ size=size||86; const c=col||'#a7adb3';
  return `<svg class="v9box" width="${size}" height="${size}" viewBox="0 0 100 100"><defs><linearGradient id="bxg${c.slice(1)}" x1="0" x2="1"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="#1a1712"/></linearGradient></defs>
  <polygon points="50,14 88,32 50,50 12,32" fill="${c}" opacity=".9"/><polygon points="12,32 50,50 50,92 12,74" fill="#2c2820"/><polygon points="88,32 50,50 50,92 88,74" fill="url(#bxg${c.slice(1)})"/>
  <polygon points="30,23 68,41 68,49 30,31" fill="#0d0b08" opacity=".55"/><path d="M12 32 L50 50 L88 32 M50 50 L50 92" stroke="#0d0b08" stroke-width="2" fill="none"/>
  <rect x="44" y="56" width="12" height="10" rx="2" fill="#d8c070"/><circle cx="50" cy="61" r="2" fill="#2a2010"/></svg>`; }
function v9RewardWeights(R){ return [Math.max(4,60-2.4*R),30,10+0.9*R,2+0.65*R,0.35+0.32*R,0.02+0.03*R]; }
/* dá a recompensa da rodada; devolve um texto curto. Também guarda para a tela de morte */
function v9GiveReward(R,quiet){
  const roll=Math.random(); let entry;
  if(roll<0.55){ const t=randomBoxType(R); const b=BOX_BY[t]; giveBox(t); entry={kind:'box',label:b.name,col:b.col,html:v9BoxSvg(b.col,64)}; }
  else if(roll<0.8){ const r=Math.min(5,pickW(v9RewardWeights(R))); const it=rollItem(r); PROG.items.push(it); saveProg(); const rr=itemRar(it); let img=''; try{ img=knifeThumb(it,118,54); }catch(e){}
    entry={kind:'knife',label:`${KTYPES[it.t].name} | ${(SKINS[it.s]||SKINS.padrao).name}`,col:rr.col,rar:rr.name,html:img?`<img alt="" src="${img}" style="width:96px">`:v9BoxSvg(rr.col,64)}; }
  else { const r=Math.min(5,pickW(v9RewardWeights(R))); const a=rollArtifact(r); PROG.arts.push(a); saveProg(); entry={kind:'art',label:artName(a),col:RAR[r].col,rar:RAR[r].name,html:artIcon(a,60)}; }
  V9.boxesWon.push(entry); if(!quiet) rewardToast(entry); try{ renderDrax(); }catch(e){} sysLog('Recompensa: '+entry.label);
  return entry.label; }
function rewardToast(e){
  const el=v9El('div','v9rew',`<div class="rw-ring"><i></i><i></i></div><div class="rw-art">${e.html}</div><div class="rw-tx"><small>${e.kind==='box'?'CAIXA GANHA':e.kind==='knife'?'FACA GANHA':'ARTEFATO GANHO'}</small><b style="color:${e.col}">${e.label}</b>${e.rar?`<em>${e.rar}</em>`:''}<span>guardado no inventário</span></div>`);
  el.style.setProperty('--rc',e.col); document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('on'));
  try{ Snd.sample('reward_pop',{vol:0.8,prio:true})||Snd.ui('unlock'); }catch(x){}
  setTimeout(()=>el.classList.remove('on'),4300); setTimeout(()=>el.remove(),5200); }
v9Css(`.v9rew{position:fixed;left:0;top:44%;transform:translate(-110%,-50%);z-index:30;display:flex;align-items:center;gap:12px;padding:12px 22px 12px 16px;background:linear-gradient(90deg,rgba(8,10,8,.92),rgba(8,10,8,.6) 80%,transparent);border-left:3px solid var(--rc);transition:transform .7s cubic-bezier(.2,1.3,.4,1);pointer-events:none}
.v9rew.on{transform:translate(0,-50%)}
.v9rew .rw-art{position:relative;width:100px;height:86px;display:flex;align-items:center;justify-content:center;animation:rwBob 1.4s ease-in-out infinite alternate}
.v9rew .rw-ring{position:absolute;left:12px;top:50%;width:110px;height:110px;transform:translateY(-50%)}
.v9rew .rw-ring i{position:absolute;inset:0;border-radius:50%;border:3px solid transparent;border-top-color:#3aff6a;border-left-color:rgba(58,255,106,.35);filter:drop-shadow(0 0 6px #3aff6a);animation:rwSpin 1.6s linear infinite}
.v9rew .rw-ring i+i{inset:12px;border-top-color:transparent;border-bottom-color:#3aff6a;animation-duration:2.3s;animation-direction:reverse}
.v9rew .rw-tx{display:flex;flex-direction:column;gap:2px;min-width:180px}.v9rew small{font:11px "Special Elite",monospace;letter-spacing:.25em;color:#9fdca8}
.v9rew b{font:700 20px "Stardos Stencil",Impact,sans-serif;letter-spacing:.04em;text-shadow:0 0 12px rgba(0,0,0,.8)}.v9rew em{font:12px "Special Elite",monospace;color:var(--rc);font-style:normal}.v9rew span{font-size:11px;color:#8a8478}
@keyframes rwSpin{to{transform:rotate(360deg)}}@keyframes rwBob{from{transform:translateY(-3px) rotate(-2deg)}to{transform:translateY(3px) rotate(2deg)}}
.v9dx{display:inline-block;font:700 44px Impact;color:#5fb0ff;text-shadow:0 0 14px #2f7fd8}.v9dx.big{font-size:96px}`);
v9On('roundEnd',R=>{ if(R>0&&R%3===0&&!x1Live()&&CUR!=='sandbox'&&!CHEAT.on) setTimeout(()=>{ if(v9Live()) v9GiveReward(R); },1800); });

/* ---- tela de morte: anel de XP com faísca girando; cada fonte de XP aparece uma por uma; caixas ganhas ---- */
pgAnimate=function(S){
  const host=$('#xpsum'); if(!host) return; host.hidden=false; host.textContent='';
  if(!S){ host.hidden=true; return; }
  if(S.cheat){ host.innerHTML='<p class="pgnote">Cheats ligados: esta partida não rende XP (pg_cheatxp 1 no console libera).</p>'; return; }
  const R=G.round|0, K=G.kills|0, H=G.heads|0, E=G.earned|0;
  const parts=[['Rodadas sobrevividas',45*R],['Abates',3*K],['Tiros na cabeça',2*H],['Pontos ganhos',Math.round(E/150)]].filter(p=>p[1]>0);
  const sumP=parts.reduce((a,p)=>a+p[1],0)||1, scale=(S.char1-S.char0)/sumP;
  const lv=x=>charLv(Math.floor(x));
  host.innerHTML=`<div class="v9xp"><div class="xr-wrap"><p class="xr-t">XP DE PERSONAGEM</p><div class="xr"><svg viewBox="0 0 200 200"><circle class="tr" cx="100" cy="100" r="84"/><circle class="pr" cx="100" cy="100" r="84"/></svg><div class="xr-spark"><i></i><i></i><i></i><i></i></div>
    <div class="xr-c"><b class="xr-n">0/0</b><small class="xr-l">Nv 1</small><small class="xr-ch">${curVar().name}</small></div></div></div>
    <div class="xr-side"><ul class="xr-list"></ul><div class="xr-acc"><span>Conta</span><b>Nv 1</b><div class="pgbar"><i></i></div></div>${S.z?'<div class="xr-ab"><span>Habilidades</span><b></b></div>':''}
    <div class="xr-boxes"><span>Ganhos na partida</span><div class="xr-bl"></div></div><div class="pgdrax"><span>Drax recebidos</span><b>◆ 0</b></div></div></div>`;
  const C=2*Math.PI*84, pr=host.querySelector('.pr'), spark=host.querySelector('.xr-spark'), num=host.querySelector('.xr-n'), lvl=host.querySelector('.xr-l'), list=host.querySelector('.xr-list');
  pr.style.strokeDasharray=C;
  const setRing=x=>{ const s=lv(x); const f=clamp(s.cur/s.need,0,1); pr.style.strokeDashoffset=(C*(1-f)).toFixed(2); num.textContent=`${v9Fmt(s.cur)}/${v9Fmt(s.need)}`; lvl.textContent='Nv '+s.L; const a=-Math.PI/2+f*Math.PI*2; spark.style.transform=`translate(${(Math.cos(a)*84/200*100).toFixed(2)}%,${(Math.sin(a)*84/200*100).toFixed(2)}%)`; return s; };
  let cur=S.char0, last=setRing(cur); const accEl=host.querySelector('.xr-acc'), drEl=host.querySelector('.pgdrax b');
  const setAcc=x=>{ const r=accLv(Math.floor(x)); accEl.querySelector('b').textContent='Nv '+r.L; accEl.querySelector('i').style.width=(r.cur/r.need*100).toFixed(1)+'%'; return r; };
  let accLast=setAcc(S.acc0); if(S.z){ const ab=host.querySelector('.xr-ab b'); ab.textContent=`Z Nv ${abLvAx(S.ax1,1)} · X ${abLvUx(S.ax1,1)?'Nv '+abLvUx(S.ax1,1):'🔒'}`; }
  const bl=host.querySelector('.xr-bl'); const won=V9.boxesWon.slice();
  let done=false, timers=[]; const T=f=>timers.push(setTimeout(f,0));
  const finish=()=>{ if(done) return; done=true; timers.forEach(clearTimeout); list.innerHTML=parts.map(p=>`<li class="on"><span>${p[0]}</span><b>+${v9Fmt(p[1]*scale)} XP</b></li>`).join(''); setRing(S.char1); setAcc(S.acc1); bl.innerHTML=won.length?won.map(w=>`<div class="xb on" style="--rc:${w.col}" title="${w.label}">${w.html}<small>${w.label}</small></div>`).join(''):'<em>Nenhuma caixa desta vez</em>'; drEl.textContent='◆ '+v9Fmt(S.matchDrax+S.bonusDrax); };
  pgAnimSkip=finish; host.onclick=finish;
  // sequência: cada linha entra e o anel corre com ela
  let t0=400; const ease=k=>1-Math.pow(1-k,3);
  const runSeg=(a,b,dur,cb)=>{ const st=performance.now(); let lt=0; const step=now=>{ if(done) return; const k=Math.min(1,(now-st)/dur), x=a+(b-a)*ease(k); const s=setRing(x); if(s.L>last.L){ host.querySelector('.xr').classList.remove('up'); void host.offsetWidth; host.querySelector('.xr').classList.add('up'); pgSparks(host.querySelector('.xr-wrap'),'#ff9a3a'); Snd.ui('levelup'); pgToast(host,'Personagem Nv '+s.L+'!',false); } last=s; if(now-lt>65&&k<1){ lt=now; Snd.ui('tick'); } if(k<1) requestAnimationFrame(step); else cb&&cb(); }; requestAnimationFrame(step); };
  const seq=parts.map(p=>p[1]*scale); let acc=S.char0, i=0;
  const next=()=>{ if(done) return; if(i>=parts.length){ afterRing(); return; } const p=parts[i], li=v9El('li','',`<span>${p[0]}</span><b>+${v9Fmt(seq[i])} XP</b>`); list.appendChild(li); requestAnimationFrame(()=>li.classList.add('on')); try{ Snd.ui('tab'); }catch(e){} const a=acc; acc+=seq[i]; i++; runSeg(a,acc,750,()=>setTimeout(next,220)); };
  const afterRing=()=>{ // conta, depois caixas uma por uma, depois drax
    const st=performance.now(); const step=now=>{ if(done) return; const k=Math.min(1,(now-st)/900); const r=setAcc(S.acc0+(S.acc1-S.acc0)*ease(k)); if(r.L>accLast.L){ Snd.ui('levelup'); pgToast(host,'Conta Nv '+r.L+'!',true); } accLast=r; if(k<1) requestAnimationFrame(step); else boxes(0); }; requestAnimationFrame(step); };
  const boxes=j=>{ if(done) return; if(!won.length){ bl.innerHTML='<em>Nenhuma caixa desta vez</em>'; return drax(); } if(j>=won.length) return drax(); const w=won[j]; const d=v9El('div','xb',`${w.html}<small>${w.label}</small>`); d.style.setProperty('--rc',w.col); d.title=w.label; bl.appendChild(d); requestAnimationFrame(()=>d.classList.add('on')); try{ Snd.sample('reward_pop',{vol:0.6})||Snd.ui('unlock'); }catch(e){} setTimeout(()=>boxes(j+1),520); };
  const drax=()=>{ const tot=S.matchDrax+S.bonusDrax, st=performance.now(); let lt=0; const step=now=>{ if(done) return; const k=Math.min(1,(now-st)/1000); drEl.textContent='◆ '+v9Fmt(tot*ease(k)); if(now-lt>60&&k<1){ lt=now; Snd.ui('tick'); } if(k<1) requestAnimationFrame(step); else { done=true; Snd.ui('buy'); } }; requestAnimationFrame(step); };
  setTimeout(next,t0);
};
v9Css(`.v9xp{display:flex;gap:26px;align-items:center;flex-wrap:wrap;justify-content:center;margin:6px 0 4px}
.v9xp .xr-wrap{position:relative;text-align:center}.v9xp .xr-t{margin:0 0 6px;font:700 22px "Stardos Stencil",Impact,sans-serif;letter-spacing:.08em;color:#f4ead2}
.v9xp .xr{position:relative;width:210px;height:210px}.v9xp .xr svg{width:100%;height:100%;transform:rotate(-90deg)}
.v9xp .tr{fill:none;stroke:#0b0a08;stroke-width:16}.v9xp .pr{fill:none;stroke:#2fbf4a;stroke-width:11;stroke-linecap:butt;filter:drop-shadow(0 0 6px rgba(60,255,100,.5));transition:stroke .3s}
.v9xp .xr.up .pr{animation:xrUp .6s ease}@keyframes xrUp{0%{stroke:#fff}100%{stroke:#2fbf4a}}
.v9xp .xr-spark{position:absolute;left:50%;top:50%;width:0;height:0;pointer-events:none}
.v9xp .xr-spark i{position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle,#fff 0,#ffb040 35%,rgba(255,90,10,0) 70%);animation:xrSp .5s linear infinite}
.v9xp .xr-spark i:nth-child(2){animation-delay:-.12s;transform:scale(.7)}.v9xp .xr-spark i:nth-child(3){animation-delay:-.25s}.v9xp .xr-spark i:nth-child(4){animation-delay:-.38s;transform:scale(1.3)}
@keyframes xrSp{0%{opacity:1;translate:0 0}100%{opacity:0;translate:calc((var(--r,1) - .5) * 30px) -18px;scale:.3}}
.v9xp .xr-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}.v9xp .xr-n{font:700 22px "Special Elite",monospace;color:#f4ead2}.v9xp .xr-l{font:700 16px "Stardos Stencil",Impact;color:#ffb040;letter-spacing:.1em}.v9xp .xr-ch{font-size:11px;color:#8a8478}
.v9xp .xr-side{min-width:260px;max-width:360px;display:flex;flex-direction:column;gap:9px}
.v9xp .xr-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px}.v9xp .xr-list li{display:flex;justify-content:space-between;font:13px "Special Elite",monospace;color:#cfc6b2;opacity:0;transform:translateX(-14px);transition:all .35s ease}.v9xp .xr-list li.on{opacity:1;transform:none}.v9xp .xr-list b{color:#6aff8a}
.v9xp .xr-acc,.v9xp .xr-ab{display:grid;grid-template-columns:1fr auto;gap:3px;font-size:12px;color:#a59c8a}.v9xp .xr-acc .pgbar{grid-column:1/3}
.v9xp .xr-boxes>span{font:11px "Special Elite",monospace;letter-spacing:.2em;color:#8a8478;text-transform:uppercase}.v9xp .xr-bl{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;min-height:40px}.v9xp .xr-bl em{font-size:12px;color:#6a645a}
.v9xp .xb{width:76px;display:flex;flex-direction:column;align-items:center;gap:2px;opacity:0;transform:scale(.4) rotate(-12deg);transition:all .45s cubic-bezier(.2,1.5,.4,1);border-bottom:2px solid var(--rc)}.v9xp .xb.on{opacity:1;transform:none}.v9xp .xb img{width:72px}.v9xp .xb small{font-size:9px;color:#cfc6b2;text-align:center;line-height:1.1}`);
