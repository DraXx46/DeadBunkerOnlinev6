/* Mapa do ônibus: chefe só aparece durante as paradas (ônibus parado, portas abertas).
   Nunca no ônibus nem com ele andando. Se a rodada de chefe cair na estrada, o chefe fica guardado
   e surge na próxima parada, pelo chão da parada (nunca pelas janelas do ônibus nem pela estrada). */
const TZBOSS={held:null};
function tzbStopOk(){ return CUR==='tz'&&TZB.present&&TZB.ph==='stop'; }
function tzbHold(){ if(G.bossNext){ TZBOSS.held={k:'n',b:G.bossNext}; G.bossNext=null; }
  else if(G.surgeBossPending){ TZBOSS.held={k:'s',name:G.surgeBossName}; G.surgeBossPending=false; } }
function tzbName(){ const h=TZBOSS.held; return !h?'':h.k==='n'?h.b.name:(h.name||'O Guardião'); }
function tzbRelease(){ const h=TZBOSS.held; if(!h) return; TZBOSS.held=null;
  if(h.k==='n') G.bossNext=h.b; else { G.surgeBossPending=true; G.surgeBossName=h.name; }
  if(!(G.roundGap>0)) G.toSpawn=Math.max(1,(G.toSpawn|0)+1); G.spawnT=Math.min(G.spawnT||0,2.5);
  banner(tzbName().toUpperCase(),'O chefe apareceu na parada!','red'); }

{ const sz0=spawnZombie; spawnZombie=function(){
    if(CUR!=='tz'||NET.mode==='client') return sz0.apply(this,arguments);
    if(!tzbStopOk()){ tzbHold(); return sz0.apply(this,arguments); }
    if(!(G.bossNext||G.surgeBossPending)) return sz0.apply(this,arguments);
    // chefe na parada: só pontos no chão da parada
    const sp0=spawnPoints; spawnPoints=function(){ const a=sp0.apply(this,arguments); const f=a.filter(s=>!(s.win&&s.win.bus)&&!s.road&&!s.bus&&!tzInBus(s.x,s.z,1.5)); return f.length?f:a; };
    try{ return sz0.apply(this,arguments); } finally{ spawnPoints=sp0; } }; }

{ const sr0=startRound; startRound=function(r){ const out=sr0.apply(this,arguments);
    if(CUR==='tz'&&NET.mode!=='client'&&(G.bossNext||G.surgeBossPending)&&!tzbStopOk()) tzbHold();
    return out; }; }

// banner do chefe quando a rodada começa fora da parada
{ const bn0=banner; banner=function(t,sub,cls){
    if(CUR==='tz'&&TZBOSS.held&&!tzbStopOk()&&t===tzbName().toUpperCase()) return bn0.call(this,'CHEFE NA PRÓXIMA PARADA',tzbName()+' só aparece quando o ônibus parar.','red');
    return bn0.apply(this,arguments); }; }

// chefe vivo que fica para trás na estrada não some: volta para a fila e aparece na próxima parada
{ const rz0=removeZombie; removeZombie=function(z){
    if(CUR==='tz'&&NET.mode!=='client'&&z&&!z.dead&&!TZBOSS.held){
      if(z.bossKi!=null) TZBOSS.held={k:'n',b:{B:BOSS_KINDS[z.bossKi],n:z.bossN||1,name:z.name,ki:z.bossKi}};
      else if(z.boss) TZBOSS.held={k:'s',name:z.name}; }
    return rz0.apply(this,arguments); }; }

v9On('frame',()=>{ if(CUR!=='tz'||NET.mode==='client'||!TZBOSS.held||G.state!=='playing') return;
  if(tzbStopOk()&&TZB.t>2) tzbRelease(); });
v9On('reset',()=>{ TZBOSS.held=null; });
