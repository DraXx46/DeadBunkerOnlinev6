P=[]
P.append(("""tzBox(0,31,7,41,18,'ZB0');
for(const [x,r] of [[41,10],[41,15],[36,7],[36,18]]) TZWIN.push([x,tzSec(0)+r]);""",
"""tzBox(0,31,4,45,21,'ZB0');   // v9: posto maior, com estoque e oficina nos fundos (duas portas por dentro)
for(let r=5;r<=20;r++) if(r!==8&&r!==9&&r!==16&&r!==17) TZS_(0,40,r,'#'); for(let x=41;x<=44;x++) TZS_(0,x,13,'#');
TZC(0,41,5,44,12,'.','ZB0S'); TZC(0,41,14,44,20,'.','ZB0O'); TZS_(0,40,8,'#'); TZS_(0,40,9,'#'); TZS_(0,40,16,'#'); TZS_(0,40,17,'#');
for(const [x,r] of [[45,8],[45,18],[36,4],[36,21],[33,4]]) TZWIN.push([x,tzSec(0)+r]);"""))
P.append(("""for(let k=0;k<TZ_N;k++) for(const [x,r] of [[44,2],[44,23],[4,3],[4,22],[12,2],[12,23],[45,12],[2,12],[24,2],[24,23]])""",
"""for(let k=0;k<TZ_N;k++) for(const [x,r] of [[44,2],[44,23],[4,3],[4,22],[12,2],[12,23],[46,12],[2,12],[24,2],[24,23]])"""))
P.append(("""const TZDOORS=[{cells:[[31,tzSec(0)+12],[31,tzSec(0)+13]],cost:0,noMult:true,rooms:['ZB0','Z0'],label:'a porta de aço',tzQuest:true,look:'garage'}];""",
"""const TZDOORS=[{cells:[[31,tzSec(0)+12],[31,tzSec(0)+13]],cost:0,noMult:true,rooms:['ZB0','Z0'],label:'a porta de aço',tzQuest:true,look:'garage'},
  {cells:[[40,tzSec(0)+8],[40,tzSec(0)+9]],cost:750,noMult:true,rooms:['ZB0','ZB0S'],label:'o estoque do posto',look:'ward',msg:'O estoque está aberto',sub:'Prateleiras e caixas lá atrás'},
  {cells:[[40,tzSec(0)+16],[40,tzSec(0)+17]],cost:1000,noMult:true,rooms:['ZB0','ZB0O'],label:'a oficina do posto',look:'garage',msg:'A oficina está aberta',sub:'Ferramentas, pneus e uma bancada'}];"""))
P.append(("""  tzWalls(k,M3.conc,M3.tiles); tzRoofed(31,s+7,41,s+18,M3.floorT,M3.ceil,M3.roof,{trim:M3.red});""",
"""  tzWalls(k,M3.conc,M3.tiles); tzRoofed(31,s+4,45,s+21,M3.floorT,M3.ceil,M3.roof,{trim:M3.red});"""))
P.append(("""  tzProp('metal_office_desk',k,33,9,Math.PI,1.6); tzProp('metal_toolbox',k,40,16,0.3,0.6); tzProp('Barrel_01',k,40,8,0,0.7); tzProp('metal_jerrycan',k,39.6,8.6,0.5,0.4);
  tzProp('hand_truck',k,32.2,17,0.6,0.8); tzProp('old_tyre',k,40.3,13.5,0,0.8,{box:false});""",
"""  tzProp('metal_office_desk',k,33,9,Math.PI,1.6); tzProp('metal_toolbox',k,43.5,15.2,0.3,0.6); tzProp('Barrel_01',k,44,6,0,0.7); tzProp('metal_jerrycan',k,39.2,8.6,0.5,0.4);
  tzProp('hand_truck',k,32.2,17,0.6,0.8); tzProp('old_tyre',k,42,18,0,0.8,{box:false}); tzProp('old_tyre',k,42.4,18.6,0.6,0.8,{box:false});
  // v9: estoque (prateleiras) e oficina (bancada, pneus, macaco) nos fundos
  tzProp('steel_frame_shelves_01',k,42.5,6.5,Math.PI/2,1.9,{byH:false}); tzProp('steel_frame_shelves_01',k,42.5,10.5,Math.PI/2,1.9,{byH:false}); tzProp('ammo_box',k,44,11,0.3,0.5);
  tzProp('metal_office_desk',k,43,19.5,0,1.5); tzProp('propane_tank',k,44.2,14.6,0,0.9); hangingBulb(cx(42.5),cx(s+8.5),'ZB0S','tz'); hangingBulb(cx(42.5),cx(s+17),'ZB0O','tz');"""))
P.append(("""const TZ_PSPOTS=[[33,9.2,0.95],[34.5,10,1.6],[37,15,1.6],[34.5,15,0.9],[40,16.4,0.05],[39.6,8.3,0.05],[32.6,16.8,0.05],[37,10,0.9],[40.3,12.2,0.05],[35.8,12.5,0.05]];""",
"""const TZ_PSPOTS=[[33,9.2,0.95],[34.5,10,1.6],[37,15,1.6],[42.5,6.5,1.6],[44.4,11.6,0.05],[43,19.5,0.9],[41.4,15.2,0.05],[42.5,10.5,0.9],[32.4,19.6,0.05],[38.6,20.4,0.05],[44.3,5.4,0.05],[39.4,5.4,0.05]];   // v9: mais escondidas (estoque e oficina)"""))
P.append(("""glow:new THREE.MeshBasicMaterial({color:0x8ff0ff,transparent:true,opacity:0.35,depthWrite:false})""","""glow:new THREE.MeshBasicMaterial({color:0xffcc40,transparent:true,opacity:0.18,depthWrite:false,blending:THREE.AdditiveBlending})"""))
P.append(("""const halo=new THREE.Mesh(new THREE.SphereGeometry(0.42,12,8),tzManMats().glow);""","""const halo=new THREE.Mesh(new THREE.SphereGeometry(0.3,12,8),tzManMats().glow);"""))
P.append(("""const bs=[{cells:[[37,s(0)+17],[38,s(0)+17]],n:[0,-1],room:'ZB0',tz:0}""","""const bs=[{cells:[[37,s(0)+20],[38,s(0)+20]],n:[0,-1],room:'ZB0',tz:0}"""))
P.append(("""  LEVER_SPOTS.push({x:44,z:s(3)+9,n:[-1,0]});""","""  LEVER_SPOTS.push({x:44,z:s(3)+9,n:[-1,0]});
  LEVER_SPOTS.push({x:31,z:s(0)+6,n:[-1,0]});   // v9: chave de luz do lado de fora do posto
  AF_SPOTS.push({cells:[[33,s(0)+20],[34,s(0)+20]],n:[0,-1]},{cells:[[35,s(2)+21],[36,s(2)+21]],n:[0,-1]});   // v9: afiador a cada 2 paradas (posto, fazenda, vila)
  AMMO_SPOTS.push({x:31,z:s(0)+18,n:[-1,0],map:'tz'},{x:33,z:s(2)+4,n:[-1,0],map:'tz'},{x:30,z:s(4)+9,n:[-1,0],map:'tz'});   // v9: munição em todas as paradas"""))
