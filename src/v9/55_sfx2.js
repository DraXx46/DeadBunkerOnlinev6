/* ================= v9 · SONS QUE FALTAVAM =================
   Trocar de arma, ser derrubado (baque no chão + zumbido no ouvido), fim de jogo
   e amigo do grupo ficando pronto no menu. Áudios do Artlist em audio/sfx. */
const SFX2=['weapon_draw','body_fall','tinnitus','game_over','party_ready'];
{ let done=false; v9On('always',()=>{ if(done||!Snd.ctx) return; done=true; for(const n of SFX2) try{ if(!Snd.hasSample(n)) Snd.sample(n,{vol:0}); }catch(e){} }); }

// trocar de arma
{ const sw=switchTo; switchTo=function(i){ const before=Wp.cur, k=Wp.knifeOut; const r=sw.apply(this,arguments);
  if((Wp.cur!==before||k&&!Wp.knifeOut)&&Wp.inv[Wp.cur]) try{ Snd.sample('weapon_draw',{vol:0.75,rate:rand(0.94,1.06),prio:true}); }catch(e){}
  return r; }; }

// derrubado: baque do corpo e zumbido no ouvido
{ const gd=goDown; goDown=function(){ const was=P.down; const r=gd.apply(this,arguments);
  if(!was&&P.down) try{ Snd.sample('body_fall',{vol:1,prio:true}); setTimeout(()=>{ try{ Snd.sample('tinnitus',{vol:0.32,prio:true,wet:0}); }catch(e){} },120); }catch(e){}
  return r; }; }

// fim de jogo
{ const go=gameOver; gameOver=function(){ try{ Snd.sample('game_over',{vol:1,prio:true,wet:0.2}); }catch(e){} return go.apply(this,arguments); }; }

// grupo: avisa com um "ding" quando um amigo fica pronto no menu
{ const sm=socialMsg; let prev=null; socialMsg=function(m){ const r=sm.apply(this,arguments);
  if(m&&m.type==='party'){ const me=fkey((SOC.acc&&SOC.acc.name)||pgPlayerName()), now=new Set((m.party&&m.party.members||[]).filter(x=>x.ready&&!x.leader&&fkey(x.name)!==me).map(x=>fkey(x.name)));
    if(prev&&[...now].some(n=>!prev.has(n))&&G.state==='menu') try{ Snd.sample('party_ready',{vol:0.8,prio:true}); }catch(e){}
    prev=m.party?now:null; }
  return r; }; }
