'use strict';
const { contextBridge, ipcRenderer } = require('electron');

/* Ponte entre a tela do launcher e o processo principal. */
contextBridge.exposeInMainWorld('launcher', {
  onStatus: (callback) => ipcRenderer.on('status', (_event, data) => callback(data)),
  retry: () => ipcRenderer.send('retry'),
  play: () => ipcRenderer.send('play'),
  site: () => ipcRenderer.send('site'),
  win: (a) => ipcRenderer.send('win', String(a)),
  info: () => ipcRenderer.invoke('info'),
  health: () => ipcRenderer.invoke('health'),
  displayGet: () => ipcRenderer.invoke('display:get'),
  displaySet: (opts) => ipcRenderer.invoke('display:set', opts)
});
