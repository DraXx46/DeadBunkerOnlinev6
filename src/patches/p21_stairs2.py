P=[("""    { const Zf0=hz(1)*S, Zf1=(hz(22)+1)*S+0.06, fy0=ROOM_CEIL+0.1; bx(g,X1-X0+0.1,top-fy0,Zf1-Zf0,fac,(X0+X1)/2,(top+fy0)/2,(Zf0+Zf1)/2);""",
"""    { const Zf0=hz(1)*S, Zf1=(hz(22)+1)*S+0.06, fy0=ROOM_CEIL+0.1;
      // v9: o bloco da fachada não pode atravessar o poço da escada 1 (hx 0..3, hz 1..4): divide em 3 peças em volta dele
      { const XS=(hx(3)+1)*S, ZS=hz(5)*S, sy0=HF2+ROOM_CEIL+0.3;
        bx(g,X1-XS+0.05,top-fy0,Zf1-Zf0,fac,(XS+X1)/2,(top+fy0)/2,(Zf0+Zf1)/2);
        bx(g,XS-X0+0.05,top-fy0,Zf1-ZS,fac,(X0+XS)/2,(top+fy0)/2,(ZS+Zf1)/2);
        bx(g,XS-X0+0.05,top-sy0,ZS-Zf0,fac,(X0+XS)/2,(top+sy0)/2,(Zf0+ZS)/2); }""")]
