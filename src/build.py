"""Monta o jogo: injeta os módulos de src/v9/*.js no BunkerDosMortos/index.html (entre /*<V9>*/ e /*</V9>*/).
Uso: python src/build.py   (depois rode: node --check em um extrato do script, ou python tests/smoke.py)"""
import glob, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F=os.path.join(ROOT,'BunkerDosMortos','index.html')
s=open(F,encoding='utf-8').read(); B='/*<V9>*/'; E='/*</V9>*/'
if B not in s:
    a='/* ================= MAIN LOOP ================= */'; assert s.count(a)==1; s=s.replace(a,B+'\n'+E+'\n'+a)
i=s.index(B)+len(B); j=s.index(E)
parts=['\n/* ---- '+os.path.basename(f)+' ---- */\n'+open(f,encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(ROOT,'src','v9','*.js')))]
s=s[:i]+''.join(parts)+'\n'+s[j:]; open(F,'w',encoding='utf-8').write(s); print('módulos injetados:',len(parts))
