P=[]
P.append(("""const CFG_DEF={vol:0.7,""","""const CFG_DEF={realLight:false,hdTex:true,mblur:false,mblurAmt:0.55,grain:false,chroma:false,bloom:false,sharp:false,flShadow:false,vol:0.7,"""))
P.append(("""      <button type="button" class="sw" role="switch" data-k="potato"><span>Modo PC fraco""","""      <p class="file" style="margin:14px 0 4px">Gráficos avançados</p>
      <button type="button" class="sw" role="switch" data-k="realLight"><span>Iluminação realista (tonemapping de cinema, luzes e cores mais naturais)</span><i></i></button>
      <button type="button" class="sw" role="switch" data-k="flShadow"><span>Sombras da lanterna (zumbis e objetos projetam sombra — pesa mais)</span><i></i></button>
      <button type="button" class="sw" role="switch" data-k="hdTex"><span>Texturas HD (filtro anisotrópico máximo, texturas nítidas de longe)</span><i></i></button>
      <button type="button" class="sw" role="switch" data-k="mblur"><span>Desfoque de movimento</span><i></i></button>
      <label class="sl"><span>Intensidade do desfoque</span><input type="range" data-k="mblurAmt" data-fmt="pct" min="0.1" max="1" step="0.05"><output></output></label>
      <button type="button" class="sw" role="switch" data-k="bloom"><span>Brilho (bloom) em luzes, fogo e tiros</span><i></i></button>
      <button type="button" class="sw" role="switch" data-k="sharp"><span>Nitidez extra</span><i></i></button>
      <button type="button" class="sw" role="switch" data-k="grain"><span>Granulação de filme</span><i></i></button>
      <button type="button" class="sw" role="switch" data-k="chroma"><span>Aberração cromática nas bordas</span><i></i></button>
      <button type="button" class="sw" role="switch" data-k="potato"><span>Modo PC fraco"""))
P.append(("""  renderer.clear(); if(!menuScene) renderer.render(scene,camera);""","""  renderer.clear(); if(!menuScene){ if(v9PostOn()) v9RenderPost(rawDt); else renderer.render(scene,camera); }"""))
