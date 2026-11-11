# p38: (1) o save passa a guardar os dados da v9 (antes eram descartados ao carregar); (2) teclas remapeáveis (tradução da tecla física antes de qualquer outro atalho)
P=[("""loadCharProg(d); loadPgFrom(d); PROG.run=validRun(d.run)||null; }""",
"""loadCharProg(d); loadPgFrom(d); PROG.run=validRun(d.run)||null; for(const k in d) if(/^v9/.test(k)&&d[k]!=null&&(typeof d[k]==='object'||typeof d[k]==='number')) PROG[k]=d[k]; }"""),
("""addEventListener('keydown',e=>{
  if(e.isTrusted&&PAD.active) padIdle();""",
"""/* v9: teclas remapeáveis — a tecla física vira a tecla padrão da ação antes de qualquer outro atalho do jogo */
const KBIND={map:{},fwd:{},block:new Set(),cap:false,
  load(){ try{ this.map=JSON.parse(localStorage.getItem('db_keys')||'{}')||{}; }catch(e){ this.map={}; } this.rev(); },
  save(){ try{ localStorage.setItem('db_keys',JSON.stringify(this.map)); }catch(e){} this.rev(); },
  rev(){ this.fwd={}; this.block=new Set(); for(const d in this.map){ const p=this.map[d]; if(p&&p!==d){ this.fwd[p]=d; this.block.add(d); } } for(const p in this.fwd) this.block.delete(p); },
  keyOf(c){ return /^Key[A-Z]$/.test(c)?c.slice(3).toLowerCase():/^Digit\\d$/.test(c)?c.slice(5):c==='Space'?' ':c; }};
KBIND.load();
function kbXlate(e){ if(!e.isTrusted||KBIND.cap) return; const t=e.target; if(t&&/INPUT|TEXTAREA|SELECT/.test(t.tagName||'')) return;
  const to=KBIND.fwd[e.code]; if(to){ e.stopImmediatePropagation(); e.preventDefault(); dispatchEvent(new KeyboardEvent(e.type,{code:to,key:KBIND.keyOf(to),repeat:e.repeat,bubbles:true,cancelable:true})); return; }
  if(KBIND.block.has(e.code)){ e.stopImmediatePropagation(); e.preventDefault(); } }
addEventListener('keydown',kbXlate,true); addEventListener('keyup',kbXlate,true);
addEventListener('keydown',e=>{
  if(e.isTrusted&&PAD.active) padIdle();""")]
