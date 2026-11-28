# p44: coice na mira (ADS) vai para trás e volta para a frente, em vez de levantar o cano; a câmera sobe bem menos mirando
P=[("""pz=lerp(hip[2],aim[2],P.ads)+Wp.kick*0.06;""",
"""pz=lerp(hip[2],aim[2],P.ads)+Wp.kick*0.06*(1-P.ads)+P.ads*(Wp.kick*0.085-Math.sin(Wp.kick*Math.PI)*(1-Wp.kick)*0.03); py-=P.ads*Wp.kick*0.0035;"""),
("""      rx=lerp(hr[0],ar[0],P.ads)+Wp.kick*0.12;""",
"""      rx=lerp(hr[0],ar[0],P.ads)+Wp.kick*lerp(0.12,0.012,P.ads);"""),
("""P.pitch=clamp(P.pitch+d.recoil*(1-P.ads*0.4)*(1-cr*0.5),-1.45,1.45); P.yaw+=rand(-1,1)*d.recoil*0.3*(1-cr*0.5);""",
"""P.pitch=clamp(P.pitch+d.recoil*(1-P.ads*0.72)*(1-cr*0.5),-1.45,1.45); P.yaw+=rand(-1,1)*d.recoil*0.3*(1-P.ads*0.5)*(1-cr*0.5);""")]
if __name__=='__main__':
    import os; F=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),'BunkerDosMortos','index.html')
    s=open(F,encoding='utf-8').read()
    for a,b in P: assert s.count(a)==1,a[:60]; s=s.replace(a,b)
    open(F,'w',encoding='utf-8').write(s); print('p44 aplicado')
