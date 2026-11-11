# ônibus: não sai com zumbi vivo; sem cães perto/no ônibus durante a viagem
P=[
("  if(kind==='bomber'&&tzBusBusy()) kind='normal';   // v9: sem homem-bomba enquanto tem gente no ônibus",
 "  if(kind==='bomber'&&tzBusBusy()) kind='normal';   // v9: sem homem-bomba enquanto tem gente no ônibus\n  if(kind==='dog'&&CUR==='tz'&&TZB.present&&(TZB.ph==='leave'||TZB.ph==='depart'||TZB.ph==='road'||tzBusBusy())) kind='normal';   // sem cachorros na viagem"),
("      case 'leave': if(B.t>=B.dur){ tzStartPhase('depart',5.5);",
 "      case 'leave': if(B.t>=B.dur&&tzPeopleNear(70)&&!tzRoundClear()){ B.t=B.dur; B.holdT=(B.holdT||0)-dt; if(B.holdT<=0){ B.holdT=9; if(tzPeopleNear(40)) banner('O ÔNIBUS ESTÁ ESPERANDO','Ele só sai quando não sobrar nenhum zumbi vivo','gold'); } break; }\n        if(B.t>=B.dur){ tzStartPhase('depart',5.5);"),
]
