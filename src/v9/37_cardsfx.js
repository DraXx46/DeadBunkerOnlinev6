/* ================= v9 · SONS DAS CARTAS + LUNETA DA BESTA =================
   Carta comum: estalo de papel, "pop" e um sininho subindo.  Pacto: grave escuro, batida de coração, sino desafinado
   e um gemido distante — dá para sentir que tem um preço.  A luneta da Besta Carcará agora funciona como mira de verdade. */
function cardSfx(pact){ try{ const t=Snd.now; if(!Snd.ctx) return; const smp=(n,o)=>{ try{ Snd.sample(n,Object.assign({prio:1,wet:0.2},o)); }catch(e){} };
  if(!pact){ smp('knife_whoosh',{vol:0.32,rate:1.7}); smp('reward_pop',{vol:0.55,rate:1.05});
    const o=Snd.out(0.5,0,0.35,null); [[659,0.05],[988,0.13],[1319,0.21]].forEach(([f,d])=>Snd.oscTo(o,{t:t+d,type:'sine',freq:f,dur:0.45,gain:0.16,attack:0.004}));
    Snd.burstTo(o,{t,type:'highpass',freq:3000,dur:0.06,gain:0.25});
  } else { smp('knife_whoosh',{vol:0.45,rate:0.6}); smp('z_groan_big',{vol:0.28,rate:0.55,wet:0.6});
    const o=Snd.out(0.8,0,0.6,null);
    Snd.oscTo(o,{t,type:'sawtooth',freq:55,freqEnd:41,dur:1.8,gain:0.22,attack:0.08,lp:260});            // grave escuro
    Snd.oscTo(o,{t,type:'sine',freq:58.3,freqEnd:43,dur:1.8,gain:0.18,attack:0.08});
    for(const d of [0.12,0.38]) Snd.oscTo(o,{t:t+d,type:'sine',freq:70,freqEnd:36,dur:0.22,gain:0.7,attack:0.003});   // tum-tum
    [[311,0.5],[329.6,0.52],[466,0.56]].forEach(([f,d])=>Snd.oscTo(o,{t:t+d,type:'triangle',freq:f,freqEnd:f*0.985,dur:1.3,gain:0.07,attack:0.005}));   // sino desafinado
    Snd.burstTo(o,{t:t+0.5,type:'bandpass',freq:900,q:0.7,dur:1.0,gain:0.12,attack:0.3});
  } }catch(e){} }
{ const _pc=pickCard; pickCard=function(i){ let pact=false, ok=false; try{ const o=G.cardOffer&&G.cardOffer[i]; ok=!!(G.cardsOpen&&o); pact=!!(o&&o.c&&o.c.pact); }catch(e){} const r=_pc.apply(this,arguments); if(ok) cardSfx(pact); return r; }; }
// luneta da besta: mira por dentro da luneta (com o 2º nível de zoom na rodinha), como na Barrett
WEAPONS.xbow.scope=true;
CMDS.som_carta={d:'som_carta [pacto] · toca o som de escolher carta',f:a=>cardSfx(a[0]==='pacto')};
