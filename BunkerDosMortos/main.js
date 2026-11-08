'use strict';

const { app, BrowserWindow } = require('electron');
const http = require('http');
const path = require('path');

let gameWindow;

function waitForServer(attempt = 0) {
  return new Promise((resolve, reject) => {
    const req = http.get('http://127.0.0.1:3000/api/health', (res) => {
      res.resume();
      if (res.statusCode === 200) resolve();
      else retry();
    });
    req.setTimeout(1000, () => req.destroy());
    req.on('error', retry);
    function retry() {
      if (attempt >= 40) reject(new Error('O servidor local não iniciou na porta 3000.'));
      else setTimeout(() => waitForServer(attempt + 1).then(resolve, reject), 250);
    }
  });
}

function createWindow() {
  gameWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: 'Bunker dos Mortos',
    backgroundColor: '#08090b',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Impede que Ctrl+W (ou Cmd+W) feche a janela durante os testes.
  gameWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === 'w') {
      event.preventDefault();
    }
  });

  gameWindow.loadURL('http://127.0.0.1:3000/');
  gameWindow.on('closed', () => { gameWindow = null; });
}

app.whenReady().then(async () => {
  // O servidor HTTP + WebSocket existente roda dentro do processo Electron.
  require(path.join(__dirname, 'server.js'));
  try {
    await waitForServer();
    createWindow();
  } catch (error) {
    const { dialog } = require('electron');
    dialog.showErrorBox('Bunker dos Mortos', error.message);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());
