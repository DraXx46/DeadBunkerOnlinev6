# p46: suavização da mira desligada por padrão (quem quiser liga no console: mouse_suave 10)
P=[("""  const tau=CFG.mouseSmooth===0?0:(CFG.mouseSmooth||0.010);""","""  const tau=CFG.mouseSmooth||0;"""),
   ("""  mouse_suave:{d:'mouse_suave N suavização da mira em milissegundos (0 desliga; padrão 10)',""","""  mouse_suave:{d:'mouse_suave N suavização da mira em milissegundos (padrão 0 = desligada; ex.: mouse_suave 10 liga)',"""),
   ("""cprint('Suavização da mira: '+Math.round((CFG.mouseSmooth===0?0:(CFG.mouseSmooth||0.010))*1000)+' ms""","""cprint('Suavização da mira: '+Math.round((CFG.mouseSmooth||0)*1000)+' ms""")]
if __name__=='__main__':
    import os; F=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),'BunkerDosMortos','index.html')
    s=open(F,encoding='utf-8').read()
    for a,b in P: assert s.count(a)==1,a[:60]; s=s.replace(a,b)
    open(F,'w',encoding='utf-8').write(s); print('p46 aplicado')
