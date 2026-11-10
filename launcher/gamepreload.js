'use strict';
const { contextBridge, ipcRenderer } = require('electron');
/* Ponte da janela do jogo: modo de tela (tela cheia, janela, maximizada) e tamanho da janela. */
contextBridge.exposeInMainWorld('deadBunker', {
  getDisplay: () => ipcRenderer.invoke('display:get'),
  setDisplay: (opts) => ipcRenderer.invoke('display:set', opts)
});
