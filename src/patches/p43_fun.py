# mapa 4FUN: região do grid, início sem zumbis e montagem
P=[
("CZ0=TZR1+1, CZN=60, CZ1=CZ0+CZN-1, MH=CZ1+1;","CZ0=TZR1+1, CZN=60, CZ1=CZ0+CZN-1, FUN0=CZ1+1, FUNN=58, FUN1=FUN0+FUNN-1, MH=FUN1+1;"),
("for(const [x,r] of [[23,33],[24,33],[23,34],[24,34]]) set(x,czr(r),'k');   // estátua da praça",
 "for(const [x,r] of [[23,33],[24,33],[23,34],[24,34]]) set(x,czr(r),'k');   // estátua da praça\n"
 "// v9 · PARQUE 4FUN: área aberta + salão de jogos (FS) + arena de parkour; sem zumbis\n"
 "carve(0,FUN0,47,FUN1,'T'); carve(1,FUN0+1,46,FUN1-1,'.','FN'); OUTR.add('FN');\n"
 "carve(2,FUN0+3,18,FUN0+22,'#'); carve(3,FUN0+4,17,FUN0+21,'.','FS'); carve(18,FUN0+11,18,FUN0+14,'.','FS');"),
("  else if(CUR==='x1'){ x1Begin();","  else if(CUR==='fun'){ try{ funBegin(); }catch(e){ console.warn('[Bunker v9] 4fun',e); } }\n  else if(CUR==='x1'){ x1Begin();"),
("  if(NET.mode!=='client'&&CUR!=='x1') farmStart();","  if(NET.mode!=='client'&&CUR!=='x1'&&CUR!=='fun') farmStart();"),
("  try{ ROOT=MAPG.city; BATCH=new Batch(); buildCity(); BATCH.flush(MAPG.city); }catch(e){ console.warn('[Bunker v9] cidade',e); } ROOT=MAPG.bunker;",
 "  try{ ROOT=MAPG.city; BATCH=new Batch(); buildCity(); BATCH.flush(MAPG.city); }catch(e){ console.warn('[Bunker v9] cidade',e); } ROOT=MAPG.bunker;\n  try{ ROOT=MAPG.fun; BATCH=new Batch(); buildFun(); BATCH.flush(MAPG.fun); }catch(e){ console.warn('[Bunker v9] 4fun',e); } ROOT=MAPG.bunker;"),
]
