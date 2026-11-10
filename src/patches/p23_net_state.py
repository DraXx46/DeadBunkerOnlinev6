P=[]
P.append((",gn:NET.gen,mp:CUR==='hosp'?1:CUR==='farm'?2:CUR==='x1'?4:CUR==='tz'?5:0,",",gn:NET.gen,v9:v9HostState(),mp:CUR==='hosp'?1:CUR==='farm'?2:CUR==='x1'?4:CUR==='tz'?5:CUR==='city'?6:0,"))
P.append(("g.mp===1?'hosp':g.mp===2?'farm':g.mp===4?'x1':g.mp===5?'tz':'bunker';","g.mp===1?'hosp':g.mp===2?'farm':g.mp===4?'x1':g.mp===5?'tz':g.mp===6?'city':'bunker'; if(g.v9) try{ v9ApplyHost(g.v9); }catch(e){}"))
