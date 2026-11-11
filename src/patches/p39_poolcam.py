# p39: gancho para câmeras especiais (sinuca) logo depois de o jogo posicionar a câmera do jogador
P=[("""(G.state==='dying'?Math.min(P.downT,1)*0.6:(P.down?0.25:0))+(ss?rand(-1,1)*ss*0.03:0));""",
"""(G.state==='dying'?Math.min(P.downT,1)*0.6:(P.down?0.25:0))+(ss?rand(-1,1)*ss*0.03:0)); try{ if(V9CAM.fn) V9CAM.fn(dt); }catch(e){ console.warn('[v9] cam',e); }""")]
