P=[]
P.append(("TZR1=TZR0+33, MH=TZR1+1;","TZR1=TZR0+33, CZ0=TZR1+1, CZN=60, CZ1=CZ0+CZN-1, MH=CZ1+1;   // v9: cidade destruída (60 linhas) depois do Tranzitch"))
P.append(("const mapAtRow=z=>z>=TZ0?'tz':","const mapAtRow=z=>z>=CZ0?'city':z>=TZ0?'tz':"))
P.append(("""for(const g of TZ_GSP) GSPAWN.push(g);
""","""for(const g of TZ_GSP) GSPAWN.push(g);
/* ================= v9 · CIDADE DESTRUÍDA (grade) =================
   Rua principal norte-sul (colunas 18–29) com calçadas, praça no meio (onde o chefe aparece), duas transversais e seis lojas
   em que dá para entrar: mercado, farmácia e armaria a oeste; bar, delegacia e banco a leste. O carro chega pelo sul. */
const czr=r=>CZ0+r;
const CITYWIN=[], CITY_GSP=[];
carve(0,CZ0,47,CZ1,'T'); carve(1,czr(1),46,czr(CZN-2),'.','CS'); OUTR.add('CS');
const CITY_SHOPS=[
  {id:'CM',name:'Mercado Popular',x0:2,x1:16,r0:2,r1:13,door:[[16,7],[16,8]],side:1},
  {id:'CF',name:'Farmácia São Lucas',x0:2,x1:16,r0:18,r1:28,door:[[16,22],[16,23]],side:1},
  {id:'CA',name:'Armaria do Tonho',x0:2,x1:16,r0:44,r1:56,door:[[16,49],[16,50]],side:1},
  {id:'CB',name:'Bar Esquina',x0:31,x1:45,r0:2,r1:13,door:[[31,7],[31,8]],side:-1},
  {id:'CP',name:'Delegacia',x0:31,x1:45,r0:18,r1:30,door:[[31,23],[31,24]],side:-1},
  {id:'CK',name:'Banco Central',x0:31,x1:45,r0:44,r1:56,door:[[31,49],[31,50]],side:-1}];
for(const s of CITY_SHOPS){ carve(s.x0,czr(s.r0),s.x1,czr(s.r1),'#'); carve(s.x0+1,czr(s.r0+1),s.x1-1,czr(s.r1-1),'.',s.id); }
// divisória interna com passagem (estoque/fundos) no mercado, na delegacia e no banco
for(const [id,x] of [['CM',8],['CP',38],['CK',38]]){ const s=CITY_SHOPS.find(q=>q.id===id); for(let r=s.r0+1;r<s.r1;r++) if(r!==s.r0+3&&r!==s.r0+4) set(x,czr(r),'#'); }
// janelas das lojas para a rua (zumbis entram por elas) e janelas dos fundos
for(const s of CITY_SHOPS){ const fx=s.side>0?s.x1:s.x0, bx2=s.side>0?s.x0:s.x1; CITYWIN.push([fx,czr(s.r0+2)],[fx,czr(s.r1-2)]); CITYWIN.push([bx2,czr(Math.round((s.r0+s.r1)/2))]); }
// carcaças de carros, ônibus tombado, barricadas e entulho na rua
for(const [x0,r0,x1,r1] of [[20,6,21,8],[26,12,27,15],[19,24,20,26],[27,41,28,43],[21,47,22,48],[25,52,26,53]]) carve(x0,czr(r0),x1,czr(r1),'x');
for(const [x,r] of [[23,20],[24,20],[23,21],[22,44],[23,44],[26,33],[21,37],[30,16],[17,16],[17,40],[30,40]]) set(x,czr(r),'s');
for(const [x,r] of [[23,33],[24,33],[23,34],[24,34]]) set(x,czr(r),'k');   // estátua da praça
for(const [x,r] of [[1,16],[46,16],[1,40],[46,40]]) set(x,czr(r),'.');
for(const [x,r] of [[3,15],[44,15],[3,41],[44,41],[10,33],[38,33],[24,3],[24,57],[12,16],[36,16],[12,40],[36,40]]) CITY_GSP.push({x:cx(x),z:cx(czr(r)),room:'CS',map:'city'});
for(const s of CITY_SHOPS) CITY_GSP.push({x:cx(s.side>0?s.x0+2:s.x1-2),z:cx(czr(s.r0+2)),room:s.id,map:'city'});
for(const g of CITY_GSP) GSPAWN.push(g);
setFH(0,CZ0,47,CZ1,0,40); for(let z=CZ0;z<=CZ1;z++) for(let x=0;x<MW;x++){ const r=roomOf[z][x]; if(r&&!OUTR.has(r)) CH[z*MW+x]=ROOM_CEIL; }
"""))
P.append(("""const WIN_DEF=[[5,3],[9,3],[18,3],[26,7],[26,16],[2,24]""","""const WIN_DEF=CITYWIN.concat([[5,3],[9,3],[18,3],[26,7],[26,16],[2,24]]).concat([[5,3]]).slice(0,0).concat(CITYWIN.length?[]:[]).concat([[5,3],[9,3],[18,3],[26,7],[26,16],[2,24]"""))
