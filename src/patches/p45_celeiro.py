# p45: celeiro da fazenda — botijão saiu da frente da janela sul; lampião do jirau em cima da caixa de ração (flutuava)
P=[("""for(const [x,r] of [[16.65,24.7],[27.6,52.7],[19.2,75.3],[37.8,45.2],[44.6,47.8]]) if(phPlace('propane_tank'""",
    """for(const [x,r] of [[16.65,24.7],[27.6,52.7],[22.1,75.3],[37.8,45.2],[44.6,47.8]]) if(phPlace('propane_tank'"""),
   # jirau: caminho livre do alto da escada (latão de leite e fardo saíram da boca da escada), viga baixa que cruzava a escada encurtada,
   # pilar que ficava no meio do degrau de cima encostado na parede, forcados que entravam na parede
   ("""for(const zz of [65,67.5,70]) bx(g,0.3,0.3,12.4,M.beam,cx(29),L-0.15,FR(zz));""","""for(const zz of [65,67.5]) bx(g,0.3,0.3,12.4,M.beam,cx(29),L-0.15,FR(zz)); bx(g,0.3,0.3,9.2,M.beam,cx(29)-1.6,L-0.15,FR(70));"""),
   ("""for(const x of [26,29,32]) for(const r of [65,69]) bx(g,0.28,6.0,0.28,M.beam,cx(x)+(x===26?-0.85:0),3.0,FR(r)+(r===65?-0.85:0.85));""","""for(const x of [26,29,32]) for(const r of [65,69]) bx(g,0.28,6.0,0.28,M.beam,cx(x)+(x===26?-0.85:x===32?0.85:0),3.0,FR(r)+(r===65?-0.85:0.85));"""),
   ("""hayBale(cx(30.5),FR(68.8),0.4,true); sacks(cx(28),FR(68.6)); milkCans(cx(31.8),FR(68.5));""","""hayBale(cx(29.3),FR(69.0),0.4,true); sacks(cx(28),FR(68.6)); milkCans(cx(31.2),FR(65.3));"""),
   ("""const t=G3(cx(32.8),0,FR(69)-i*0.4);""","""const t=G3(cx(32.4),0,FR(67.9)-i*0.4);"""),
   ("""for(const [x,r] of [[27.6,65.4],[28.8,65.4],[32,66.6],[30.5,68.8],[28,68.6],[31.8,68.5],[30,65.3],[27.3,67.6]]) addPropBox(cx(x),FR(r),0.6,0.4);""","""for(const [x,r] of [[27.6,65.4],[28.8,65.4],[32,66.6],[29.3,69.0],[28,68.6],[31.2,65.3],[30,65.3],[27.3,67.6]]) addPropBox(cx(x),FR(r),0.6,0.4);""")]
if __name__=='__main__':
    import os; F=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),'BunkerDosMortos','index.html')
    s=open(F,encoding='utf-8').read()
    for a,b in P: assert s.count(a)==1,a[:60]; s=s.replace(a,b)
    open(F,'w',encoding='utf-8').write(s); print('p45 aplicado')
