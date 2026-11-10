"""Teste de fumaça: abre o jogo num Chrome sem tela, entra em cada mapa, joga algumas rodadas e acusa erros.
Requisitos: pip install playwright && playwright install chromium
Uso: python tests/smoke.py   (sobe um servidor local na pasta BunkerDosMortos sozinho)"""
import asyncio, os, sys, threading, http.server, functools
ROOT=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),'BunkerDosMortos')
PORT=8799
def serve():
    h=functools.partial(http.server.SimpleHTTPRequestHandler,directory=ROOT); h.log_message=lambda *a: None
    http.server.ThreadingHTTPServer(('127.0.0.1',PORT),h).serve_forever()
threading.Thread(target=serve,daemon=True).start()
MAPS=['bunker','hosp','farm','tz','cidade','lab']
async def main():
    from playwright.async_api import async_playwright
    fails=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--mute-audio'])
        pg=await b.new_page(viewport={'width':1280,'height':720}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e)[:300]))
        await pg.goto(f'http://127.0.0.1:{PORT}/index.html'); await pg.wait_for_timeout(12000)
        D=lambda c: pg.evaluate('(c)=>{ try{ return String(__v9dbg(c)); }catch(e){ return "ERR "+e.message } }',c)
        await pg.evaluate("()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Jogar offline/.test(x.textContent)); if(b) b.click(); }")
        await pg.wait_for_timeout(1000); await D("CHEAT.on=true; SOC.admin=true")
        for m in MAPS:
            await D(f"CMDS.map.f(['{m}'])"); await pg.wait_for_timeout(16000)
            st=await D("CUR+'|'+G.state"); await D("G.state='playing'; CMDS.mp_round.f(['5'])"); await pg.wait_for_timeout(8000)
            z=await D("zlist().length"); hk=await D('JSON.stringify(Object.keys(V9.hooks).map(k=>k+":"+V9.hooks[k].filter(f=>f._err).length).filter(s=>!s.endsWith(":0")))')
            ok=('ERR' not in st) and hk=='[]'; print(f'{m:8s} {st:20s} zumbis={z:4s} hooks={hk} {"OK" if ok else "FALHOU"}'); 
            if not ok: fails.append(m)
        if errs: print('ERROS DE PÁGINA:'); [print(' ',e) for e in errs[:20]]
        await b.close()
    sys.exit(1 if fails or errs else 0)
asyncio.run(main())
