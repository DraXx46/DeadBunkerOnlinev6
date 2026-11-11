'use strict';
/* Launcher do Dead Bunker.
   1. Consulta o manifesto da última versão do jogo (release "game-latest" no GitHub).
   2. Se houver versão nova, baixa o zip, confere o SHA-256 e substitui a pasta do jogo.
   3. Abre o jogo numa janela própria, servido pelo esquema bunker:// (sem servidor local). */
const { app, BrowserWindow, ipcMain, net, protocol, screen, shell } = require('electron');
/* O jogo agora se chama Dead Bunker, mas a pasta de dados continua a antiga ("Bunker dos Mortos"):
   assim quem já tinha o launcher não perde o jogo baixado nem o progresso salvo (localStorage fica nessa pasta). */
try { app.setPath('userData', require('path').join(app.getPath('appData'), 'Bunker dos Mortos')); } catch (e) {}
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { Readable, Transform } = require('stream');
const { pipeline } = require('stream/promises');
const { pathToFileURL } = require('url');

const REPO = 'DraXx46/DeadBunkerOnlinev6';
const MANIFEST_URL = `https://github.com/${REPO}/releases/download/game-latest/manifest.json`;
const SCHEME = 'bunker';
const GAME_URL = `${SCHEME}://jogo/index.html`;
const SITE_URL = 'https://draxx46.github.io/DeadBunkerOnlinev6/';
const HEALTH_URL = 'https://bunker-server.wincklerleonardo12.workers.dev/api/health';
let ready = false;
let readyVersion = null;

/* Precisa ser registrado antes de app.whenReady(). "standard" + "secure" deixa o jogo usar
   localStorage, fetch e áudio como faria numa página https. */
protocol.registerSchemesAsPrivileged([
  { scheme: SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }
]);

let launcherWin = null;
let gameWin = null;
let busy = false;
let gameDir = '';
let stagingDir = '';
let installedFile = '';

function status(text, percent = null, error = false) {
  if (launcherWin && !launcherWin.isDestroyed()) {
    launcherWin.webContents.send('status', { text, percent, error, ready, version: readyVersion });
  }
}

function hasGameInstalled() {
  return fs.existsSync(path.join(gameDir, 'index.html'));
}

function readInstalledVersion() {
  try {
    return JSON.parse(fs.readFileSync(installedFile, 'utf8')).version || null;
  } catch {
    return null;
  }
}

async function fetchManifest() {
  // O parâmetro evita o cache do CDN do GitHub logo após uma nova release.
  const res = await net.fetch(`${MANIFEST_URL}?t=${Date.now()}`);
  if (!res.ok) throw new Error(`manifesto indisponível (HTTP ${res.status})`);
  const manifest = await res.json();
  if (!manifest.version || !manifest.url || !manifest.sha256) throw new Error('manifesto inválido');
  return manifest;
}

async function downloadAndVerify(manifest, zipPath) {
  const res = await net.fetch(manifest.url);
  if (!res.ok || !res.body) throw new Error(`download falhou (HTTP ${res.status})`);

  const total = manifest.size || Number(res.headers.get('content-length')) || 0;
  const hash = crypto.createHash('sha256');
  let received = 0;
  const meter = new Transform({
    transform(chunk, _enc, cb) {
      hash.update(chunk);
      received += chunk.length;
      if (total) {
        status(
          `Baixando o jogo... ${Math.floor(received / 1048576)} de ${Math.floor(total / 1048576)} MB`,
          Math.floor((received / total) * 100)
        );
      }
      cb(null, chunk);
    }
  });

  await pipeline(Readable.fromWeb(res.body), meter, fs.createWriteStream(zipPath));

  if (hash.digest('hex') !== manifest.sha256.toLowerCase()) {
    fs.rmSync(zipPath, { force: true });
    throw new Error('o arquivo baixado está corrompido (hash não confere)');
  }
}

/* Expand-Archive já vem no Windows, então não precisa de dependência extra no launcher. */
function extractZip(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    const args = [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command',
      'Expand-Archive -LiteralPath $env:BDM_ZIP -DestinationPath $env:BDM_DEST -Force'
    ];
    const env = { ...process.env, BDM_ZIP: zipPath, BDM_DEST: destDir };
    execFile('powershell.exe', args, { windowsHide: true, env }, (err) => {
      if (err) reject(new Error('falha ao extrair o jogo'));
      else resolve();
    });
  });
}

async function update() {
  if (busy) return;
  busy = true;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bdm-'));
  try {
    status('Verificando atualizações...');

    let manifest = null;
    try {
      manifest = await fetchManifest();
    } catch (err) {
      console.warn('Sem manifesto:', err.message);
    }

    const installed = readInstalledVersion();
    const upToDate = manifest && installed === manifest.version && hasGameInstalled();

    if (manifest && !upToDate) {
      const zipPath = path.join(tmp, 'game.zip');
      await downloadAndVerify(manifest, zipPath);

      status('Instalando a atualização...');
      fs.rmSync(stagingDir, { recursive: true, force: true });
      await extractZip(zipPath, stagingDir);
      if (!fs.existsSync(path.join(stagingDir, 'index.html'))) {
        throw new Error('o pacote do jogo não tem index.html');
      }

      // Troca em duas etapas: se algo falhar, a versão antiga continua no lugar.
      const oldDir = `${gameDir}.old`;
      fs.rmSync(oldDir, { recursive: true, force: true });
      if (fs.existsSync(gameDir)) fs.renameSync(gameDir, oldDir);
      fs.renameSync(stagingDir, gameDir);
      fs.rmSync(oldDir, { recursive: true, force: true });

      fs.writeFileSync(installedFile, JSON.stringify({ version: manifest.version }));
    } else if (!manifest && !hasGameInstalled()) {
      throw new Error('sem conexão para baixar o jogo. Verifique a internet e tente de novo.');
    } else if (!manifest) {
      status('Sem conexão: abrindo a última versão instalada.');
    }

    /* não abre sozinho: o jogador aperta JOGAR na tela do launcher */
    ready = true;
    readyVersion = readInstalledVersion() || (manifest && manifest.version) || null;
    status(manifest ? 'Pronto para jogar' : 'Sem conexão · a última versão instalada está pronta', 100);
  } catch (err) {
    status(err.message || String(err), null, true);
  } finally {
    busy = false;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/* DualSense (PS5) por WebHID: gatilhos adaptativos, vibração e luz. No Electron o acesso ao controle
   precisa ser liberado aqui, senão o jogo nunca vê o controle. Só aceitamos o controle da Sony (vendor 0x054c). */
const SONY_VENDOR_ID = 0x054c;
const ALLOWED_PERMISSIONS = new Set(['hid', 'fullscreen', 'pointerLock']);
function allowDualSense(win) {
  const ses = win.webContents.session;
  ses.setPermissionCheckHandler((_wc, permission) => ALLOWED_PERMISSIONS.has(permission));
  ses.setPermissionRequestHandler((_wc, permission, callback) => callback(ALLOWED_PERMISSIONS.has(permission)));
  ses.setDevicePermissionHandler((details) => details.deviceType === 'hid' && details.device.vendorId === SONY_VENDOR_ID);
  win.webContents.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    const pad = details.deviceList.find((d) => d.vendorId === SONY_VENDOR_ID);
    callback(pad ? pad.deviceId : '');
  });
}

/* Ctrl+W fecharia a janela (comportamento padrão do Electron). Bloqueia para não fechar o jogo sem querer. */
function blockCtrlW(win) {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.control && input.key.toLowerCase() === 'w') {
      event.preventDefault();
    }
  });
}

/* Modo de tela do jogo: guardado em display.json na pasta de dados. Começa em tela cheia. */
let displayFile = null;
function readDisplay() {
  try { const d = JSON.parse(fs.readFileSync(displayFile, 'utf8')); if (d && typeof d === 'object') return d; } catch (e) {}
  return { mode: 'full', w: 0, h: 0 };
}
function writeDisplay(d) { try { fs.writeFileSync(displayFile, JSON.stringify(d)); } catch (e) {} }
function applyDisplay(win, d) {
  if (!win || win.isDestroyed()) return;
  if (d.mode === 'full') { win.setFullScreen(true); return; }
  if (win.isFullScreen()) win.setFullScreen(false);
  if (d.mode === 'max') { setTimeout(() => { if (!win.isDestroyed()) win.maximize(); }, 60); return; }
  if (win.isMaximized()) win.unmaximize();
  const area = screen.getDisplayMatching(win.getBounds()).workAreaSize;
  const w = Math.min(d.w || 1280, area.width), h = Math.min(d.h || 720, area.height);
  setTimeout(() => { if (win.isDestroyed()) return; win.setContentSize(w, h); win.center(); }, 60);
}
ipcMain.handle('display:get', () => {
  const d = readDisplay(); const p = screen.getPrimaryDisplay();
  return Object.assign({}, d, { screenW: Math.round(p.size.width * p.scaleFactor), screenH: Math.round(p.size.height * p.scaleFactor), full: !!(gameWin && gameWin.isFullScreen()) });
});
ipcMain.handle('display:set', (_e, opts) => {
  const cur = readDisplay();
  const d = { mode: ['full', 'window', 'max'].includes(opts && opts.mode) ? opts.mode : cur.mode, w: Math.max(0, (opts && opts.w) | 0), h: Math.max(0, (opts && opts.h) | 0) };
  writeDisplay(d); applyDisplay(gameWin, d); return d;
});

function launchGame() {
  const disp = readDisplay();
  gameWin = new BrowserWindow({
    width: disp.mode === 'window' && disp.w ? disp.w : 1280,
    height: disp.mode === 'window' && disp.h ? disp.h : 720,
    useContentSize: true,
    fullscreen: disp.mode === 'full',
    show: false,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#0a0606',
    title: 'Dead Bunker',
    icon: path.join(__dirname, 'build', process.platform==='win32'?'icon.ico':'icon.png'),
    autoHideMenuBar: true,
    webPreferences: { sandbox: true, contextIsolation: true, preload: path.join(__dirname, 'gamepreload.js') }
  });
  gameWin.once('ready-to-show', () => { if (disp.mode === 'max') gameWin.maximize(); gameWin.show(); });
  // F11 alterna tela cheia a qualquer momento
  gameWin.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') { event.preventDefault(); const d = readDisplay(); d.mode = gameWin.isFullScreen() ? 'window' : 'full'; writeDisplay(d); applyDisplay(gameWin, d); }
  });

  // O jogo só deve navegar dentro do próprio esquema; links externos ficam fora da janela.
  gameWin.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${SCHEME}://`)) event.preventDefault();
  });
  gameWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  blockCtrlW(gameWin);
  allowDualSense(gameWin);
  gameWin.loadURL(GAME_URL);
  /* enquanto o jogo roda o launcher fica escondido; ao fechar o jogo, ele volta */
  gameWin.on('closed', () => { gameWin = null; if (launcherWin && !launcherWin.isDestroyed()) { launcherWin.show(); launcherWin.focus(); } else app.quit(); });

  if (launcherWin && !launcherWin.isDestroyed()) launcherWin.hide();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (launcherWin && !launcherWin.isDestroyed()) {
      if (launcherWin.isMinimized()) launcherWin.restore();
      launcherWin.focus();
    }
  });

  // no Windows a barra de tarefas usa o mesmo ícone do atalho (o id precisa ser igual ao appId do instalador)
  if (process.platform === 'win32') app.setAppUserModelId('com.draxx46.bunkerdosmortos.launcher');
  app.whenReady().then(() => {
    gameDir = path.join(app.getPath('userData'), 'game');
    stagingDir = path.join(app.getPath('userData'), 'game-new');
    installedFile = path.join(app.getPath('userData'), 'installed.json');
    displayFile = path.join(app.getPath('userData'), 'display.json');

    protocol.handle(SCHEME, (req) => {
      const { pathname } = new URL(req.url);
      const rel = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
      const file = path.resolve(gameDir, rel);
      if (file !== gameDir && !file.startsWith(gameDir + path.sep)) {
        return new Response('Proibido', { status: 403 });
      }
      return net.fetch(pathToFileURL(file).toString());
    });

    ipcMain.on('retry', () => update());
    ipcMain.on('play', () => { if (ready && !gameWin) launchGame(); else if (gameWin) gameWin.focus(); });
    ipcMain.on('site', () => { shell.openExternal(SITE_URL); });
    ipcMain.on('win', (_e, a) => {
      if (!launcherWin || launcherWin.isDestroyed()) return;
      if (a === 'min') launcherWin.minimize();
      else if (a === 'max') { if (launcherWin.isMaximized()) launcherWin.unmaximize(); else launcherWin.maximize(); }
      else if (a === 'close') { if (gameWin) launcherWin.hide(); else app.quit(); }
    });
    ipcMain.handle('info', () => ({ launcher: app.getVersion(), game: readInstalledVersion(), ready, playing: !!gameWin }));
    ipcMain.handle('health', async () => {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 5000);
      try { const r = await net.fetch(HEALTH_URL, { signal: ctl.signal }); if (!r.ok) return { ok: false }; const j = await r.json(); return { ok: !!j.ok, clients: j.clients | 0, rooms: j.rooms | 0 }; }
      catch (e) { return { ok: false }; } finally { clearTimeout(t); }
    });

    launcherWin = new BrowserWindow({
      width: 1280,
      height: 760,
      minWidth: 1000,
      minHeight: 620,
      frame: false,
      show: false,
      backgroundColor: '#0a0606',
      title: 'Dead Bunker - Launcher',
      icon: path.join(__dirname, 'build', process.platform==='win32'?'icon.ico':'icon.png'),
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        sandbox: true,
        contextIsolation: true
      }
    });
    blockCtrlW(launcherWin);
    launcherWin.once('ready-to-show', () => launcherWin.show());
    launcherWin.loadFile(path.join(__dirname, 'index.html'));
    launcherWin.on('closed', () => { launcherWin = null; });
    launcherWin.webContents.once('did-finish-load', () => update());
  });
}

app.on('window-all-closed', () => app.quit());
