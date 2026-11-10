# Como mexer no Dead Bunker

- `BunkerDosMortos/index.html` é o jogo publicado (um arquivo só, three.js r128).
- Tudo que entrou na v9 está separado em módulos em `src/v9/NN_nome.js` (um sistema por arquivo).
  Depois de editar um módulo, rode `python src/build.py` para injetar os módulos no `index.html`.
- `src/patches/*.py` são as alterações pontuais feitas no código antigo (registro do que mudou e onde).
- Antes de publicar: `python tests/smoke.py` abre o jogo sem tela, entra em todos os mapas, joga até a rodada 5
  e acusa erros. Saída 0 = tudo certo.
- Console do jogo (`'` ou F1, com `sv_cheats 1`): digite `v9` para ver os comandos de teste
  (mapas, tp, carro/máquina montados, chefes, eventos, relíquias, carregar habilidade, etc.).
