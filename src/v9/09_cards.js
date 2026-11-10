/* ================= v9 · CARTAS DE FIM DE JOGO (depois da rodada 15) =================
   Cada personagem tem as dele (habilidade Z, ultimate X e passiva), e há cartas de impacto para todos:
   tiro que congela, tiro que vira granada e o empurrão nos zumbis (até 30 cm por tiro — bem menos nos chefes). */
ICONS.ice='<path d="M12 2v20M4.9 7l14.2 10M19.1 7L4.9 17"/><path d="M9 4l3 2 3-2M9 20l3-2 3 2"/>';
ICONS.push='<path d="M3 12h11M10 7l5 5-5 5"/><path d="M18 5v14M21 8v8"/>';
const V9CARDS=[
  {id:'e_ice',endgame:1,name:'Balas de Gelo',icon:'ice',lv:[0.04,0.07,0.12],pros:v=>[`${PCT(v)} de chance de congelar o zumbi por 2 s`,'Congelados recebem +25% de dano'],apply:(m,v)=>{ m.freezeC=(m.freezeC||0)+v; }},
  {id:'e_nade',endgame:1,name:'Projétil Granada',icon:'grenade',lv:[0.03,0.05,0.09],pros:v=>[`${PCT(v)} de chance do tiro explodir como granada`],apply:(m,v)=>{ m.nadeC=(m.nadeC||0)+v; }},
  {id:'e_push',endgame:1,name:'Impacto',icon:'push',lv:[0.1,0.2,0.3],pros:v=>[`Cada tiro empurra o zumbi ${Math.round(v*100)} cm`,'Nos chefes, só 1/5 disso'],apply:(m,v)=>{ m.knock=Math.max(m.knock||0,v); }},
  {id:'e_ult',endgame:1,name:'Adrenalina Pura',icon:'bolt',lv:[1.3,1.6,2.2],pros:v=>[`A ultimate carrega ${String(v).replace('.',',')}× mais rápido`],apply:(m,v)=>{ m.ultK=(m.ultK||1)*v; }},
  // ---- por personagem: Z (habilidade), X (ultimate), P (passiva)
  {id:'c_rec_a',char:'recruta',endgame:1,name:'Munição de Elite',icon:'mag',lv:[1.3,1.6,2.2],pros:v=>[`Recarga Tática dura ${String(v).replace('.',',')}× mais`,'e dá ainda mais dano'],apply:(m,v)=>{ abMul(m,'buff',v); abAdd(m,'dmgBuff',0.15*v); }},
  {id:'c_rec_u',char:'recruta',endgame:1,name:'Barragem Pesada',icon:'flame',lv:[1.3,1.6,2.1],pros:v=>[`Morteiros com ${PCT(v-1)} mais dano e raio`,'+3 disparos na barragem'],apply:(m,v)=>{ abMul(m,'dmg',v); abMul(m,'radius',Math.sqrt(v)); abAdd(m,'shells',3); }},
  {id:'c_rec_p',char:'recruta',endgame:1,name:'Veterano',icon:'star',lv:[0.3,0.5,0.9],pros:v=>[`+${PCT(v)} de munição reserva`,'+1 granada a cada rodada'],apply:(m,v)=>{ m.reserve*=1+v; m.nadeRound+=1; }},
  {id:'c_hel_a',char:'helena',endgame:1,name:'Dose Dupla',icon:'drop',lv:[1.4,1.8,2.5],pros:v=>[`A injeção cura ${String(v).replace('.',',')}× mais`,'Recarrega 25% mais rápido'],apply:(m,v)=>{ abMul(m,'heal',v); abMul(m,'cd',0.75); }},
  {id:'c_hel_u',char:'helena',endgame:1,name:'Protocolo Estendido',icon:'heart',lv:[1.3,1.5,1.9],pros:v=>[`Campo ${PCT(v-1)} maior e mais longo`],apply:(m,v)=>{ abMul(m,'fieldT',v); abMul(m,'fieldR',Math.sqrt(v)); abMul(m,'fieldDmg',v); }},
  {id:'c_hel_p',char:'helena',endgame:1,name:'Plantão Eterno',icon:'lungs',lv:[1.6,2.2,3.2],pros:v=>[`A vida volta ${String(v).replace('.',',')}× mais rápido`],apply:(m,v)=>{ m.regen*=v; }},
  {id:'c_mor_a',char:'moreira',endgame:1,name:'Aríete',icon:'push',lv:[1.4,1.8,2.6],pros:v=>[`Investida com ${String(v).replace('.',',')}× dano`,'e 30% mais alcance'],apply:(m,v)=>{ abMul(m,'dmg',v); abMul(m,'range',1.3); }},
  {id:'c_mor_u',char:'moreira',endgame:1,name:'Blindado Total',icon:'scale',lv:[1.3,1.6,2],pros:v=>[`Fúria dura ${String(v).replace('.',',')}× mais`,'e recebe ainda menos dano'],apply:(m,v)=>{ abMul(m,'furyT',v); abMul(m,'taken',0.7); }},
  {id:'c_mor_p',char:'moreira',endgame:1,name:'Pele de Couraça',icon:'heart',lv:[40,70,120],pros:v=>[`+${v} de vida máxima`,'Faca 50% mais forte'],apply:(m,v)=>{ m.hp+=v; m.knife*=1.5; }},
  {id:'c_tom_a',char:'tomas',endgame:1,name:'Fogo Santo',icon:'flame',lv:[1.4,1.8,2.6],pros:v=>[`Água Benta com ${String(v).replace('.',',')}× dano e fogo`],apply:(m,v)=>{ abMul(m,'dmg',v); abMul(m,'burn',v); }},
  {id:'c_tom_u',char:'tomas',endgame:1,name:'Exorcismo Maior',icon:'star',lv:[1.3,1.6,2.1],pros:v=>[`Aura ${PCT(v-1)} maior, mais longa e mais forte`],apply:(m,v)=>{ abMul(m,'auraR',Math.sqrt(v)); abMul(m,'auraT',v); abMul(m,'auraDmg',v); }},
  {id:'c_tom_p',char:'tomas',endgame:1,name:'Fé Inabalável',icon:'flame',lv:[0.3,0.5,0.9],pros:v=>[`+${PCT(v)} de dano de fogo e explosões`],apply:(m,v)=>{ m.fireDmg*=1+v; }},
  {id:'c_iar_a',char:'iara',endgame:1,name:'Marca Profunda',icon:'eye',lv:[1.3,1.6,2],pros:v=>[`Marcados recebem ainda mais dano e por mais tempo`],apply:(m,v)=>{ abMul(m,'mark',1+(v-1)*0.5); abMul(m,'markT',v); }},
  {id:'c_iar_u',char:'iara',endgame:1,name:'Ricochete Mortal',icon:'crosshair',lv:[1,2,3],pros:v=>[`+${v} ricochete${v>1?'s':''} na ultimate`,'Ultimate dura 40% mais'],apply:(m,v)=>{ abAdd(m,'ricoN',v); abMul(m,'ultT',1.4); }},
  {id:'c_iar_p',char:'iara',endgame:1,name:'Olho de Raposa',icon:'eye',lv:[0.25,0.45,0.8],pros:v=>[`+${PCT(v)} de dano na cabeça`],apply:(m,v)=>{ m.head*=1+v; }},
  {id:'c_vik_a',char:'viktor',endgame:1,name:'Overclock+',icon:'bolt',lv:[1.3,1.6,2],pros:v=>[`Overclock dura ${String(v).replace('.',',')}× mais`,'e acelera ainda mais'],apply:(m,v)=>{ abMul(m,'dur',v); abAdd(m,'speed',0.1*v); }},
  {id:'c_vik_u',char:'viktor',endgame:1,name:'Tempestade Elétrica',icon:'bolt',lv:[1.4,1.8,2.5],pros:v=>[`Pulso EMP ${String(v).replace('.',',')}× mais forte`,'+2 raios na tempestade'],apply:(m,v)=>{ abMul(m,'empDmg',v); abMul(m,'empR',Math.sqrt(v)); abAdd(m,'teslaN',2); }},
  {id:'c_vik_p',char:'viktor',endgame:1,name:'Refrigeração Líquida',icon:'hourglass',lv:[0.8,0.65,0.5],pros:v=>[`Habilidade recarrega ${PCT(1-v)} mais rápido`],apply:(m,v)=>{ abMul(m,'cd',v); abMul(m,'heat',v); }},
];
function abMul(m,k,v){ (m.abMul||(m.abMul={}))[k]=((m.abMul[k])||1)*v; }
function abAdd(m,k,v){ (m.abAdd||(m.abAdd={}))[k]=((m.abAdd[k])||0)+v; }
for(const c of V9CARDS) CARD_BY[c.id]=c;
function v9EndCard(offer){ const used=c=>offer.some(o=>o&&o.c===c); const ch=abc();
  const pool=V9CARDS.filter(c=>(!c.char||c.char===ch)&&!used(c)&&(!G.cards.includes(c.id)||cardLv(c.id)<3)); if(!pool.length) return null;
  // cartas do próprio personagem aparecem mais
  const w=pool.map(c=>c.char?2.2:1); let r=Math.random()*w.reduce((a,b)=>a+b,0), c=pool[0]; for(let i=0;i<pool.length;i++){ r-=w[i]; if(r<=0){ c=pool[i]; break; } }
  return {c,l:G.cards.includes(c.id)?cardLv(c.id)+1:1}; }
/* aplica os multiplicadores das cartas de personagem por cima dos níveis normais da habilidade */
const _v9abApply=abApplyLevels;
abApplyLevels=function(){ _v9abApply(); try{ const C=AB_CFG[abc()]; if(!C) return; const mm=Mod.abMul||{}, aa=Mod.abAdd||{};
  for(const k in mm) if(typeof C[k]==='number') C[k]*=mm[k]; for(const k in aa) if(typeof C[k]==='number') C[k]+=aa[k];
  if(Mod.ultK&&AB_CFG.ult){ AB_CFG.ult.perKill*=Mod.ultK; AB_CFG.ult.perSec*=Mod.ultK; } }catch(e){} };
const _v9rm=recomputeMods;
recomputeMods=function(){ _v9rm(); try{ abApplyLevels(); }catch(e){} };
/* carta com marcador de fim de jogo + personagem */
v9Css(`.card.v9end{border-color:#5af0ff!important;box-shadow:0 0 22px rgba(90,240,255,.25)}.card.v9end .seal{background:#0b2a30;color:#5af0ff}`);
const _v9cardHTML=cardHTML;
cardHTML=function(o,i){ let h=_v9cardHTML(o,i); if(o&&o.c&&o.c.endgame){ const tag=o.c.char?`FIM DE JOGO · ${(CHARS[o.c.char]||{}).name||''}`:'FIM DE JOGO'; h=h.replace('class="card','class="card v9end').replace('<span class="ck">',`<span class="seal">${tag}</span><span class="ck">`); } return h; };
/* ---- efeitos: congelar e granada ---- */
v9On('hit',(z,part,pt,dir,dmg,s)=>{
  if(Mod.freezeC>0&&Math.random()<Mod.freezeC&&!z.dead){ freezeZ(z,isBossZ(z)?1:2); if(NET.mode==='client') netAct(['frz',z.id]); }
  if(Mod.nadeC>0&&Math.random()<Mod.nadeC&&pt){ const p={x:pt.x,y:pt.y,z:pt.z}; setTimeout(()=>{ if(NET.mode==='client') netAct(['gr',r10(p.x),r10(p.z),Math.round(dmg*1.4)]); else explode({x:p.x,y:0.2,z:p.z},3.6,dmg*1.4+G.zhp*0.4,'grenade',false,null,null); },60); }
});
V9NET.act.frz=(peer,a)=>{ const z=zombies.find(q=>q.id===a[2]); if(z) freezeZ(z,isBossZ(z)?1:2); };
function freezeZ(z,t){ z.frozenT=Math.max(z.frozenT||0,t); if(z.mats) z.mats.forEach(m=>{ if(m.emissive) m.emissive.setHex(0x2a6aa0); }); z.flashT=Math.max(z.flashT||0,0.01);
  const y=zy(z)+1.1; emit('chip',z.pos.x,y,z.pos.z,10,2.5,0.6,6); wPuff(z.pos.x,y,z.pos.z,3,0xcfeaff,0.22,1.0,0.3,0.5);
  if(!z._iceS||G.t-z._iceS>1.5){ z._iceS=G.t; Snd.sample('freeze_hit',{x:z.pos.x,z:z.pos.z,range:35,vol:0.7}); } }
v9On('always',dt=>{ for(const z of zlist()){ if(!(z.frozenT>0)) continue; z.frozenT-=dt; if(z.mats&&z.frozenT>0) z.mats.forEach(m=>{ if(m.emissive) m.emissive.setHex(0x2a6aa0); });
  if(z.frozenT<=0&&z.mats) z.mats.forEach(m=>{ if(m.emissive) m.emissive.setHex(0); }); if(Math.random()<dt*6) emit('chip',z.pos.x+rand(-.2,.2),zy(z)+rand(0.4,1.6),z.pos.z+rand(-.2,.2),1,0.6,0.5,6); } });
