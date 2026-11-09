'use strict';
const { contextBridge, ipcRenderer } = require('electron');

/* Ponte mínima entre a tela do launcher e o processo principal. */
contextBridge.exposeInMainWorld('launcher', {
  onStatus: (callback) => ipcRenderer.on('status', (_event, data) => callback(data)),
  retry: () => ipcRenderer.send('retry')
});
