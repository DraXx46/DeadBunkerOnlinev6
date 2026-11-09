'use strict';
/* Launcher do Bunker dos Mortos.
   1. Consulta o manifesto da última versão do jogo (release "game-latest" no GitHub).
   2. Se houver versão nova, baixa o zip, confere o SHA-256 e substitui a pasta do jogo.
   3. Abre o jogo numa janela própria, servido pelo esquema bunker:// (sem servidor local). */
const { app, BrowserWindow, ipcMain, net, protocol } = require('electron');
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
    launcherWin.webContents.send('status', { text, percent, error });
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

    launchGame();
  } catch (err) {
    status(err.message || String(err), null, true);
  } finally {
    busy = false;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

/* Ctrl+W fecharia a janela (comportamento padrão do Electron). Bloqueia para não fechar o jogo sem querer. */
function blockCtrlW(win) {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.control && input.key.toLowerCase() === 'w') {
      event.preventDefault();
    }
  });
}

function launchGame() {
  gameWin = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 800,
    minHeight: 500,
    backgroundColor: '#0a0606',
    title: 'Bunker dos Mortos',
    autoHideMenuBar: true,
    webPreferences: { sandbox: true, contextIsolation: true }
  });

  // O jogo só deve navegar dentro do próprio esquema; links externos ficam fora da janela.
  gameWin.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(`${SCHEME}://`)) event.preventDefault();
  });
  gameWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  blockCtrlW(gameWin);
  gameWin.loadURL(GAME_URL);
  gameWin.on('closed', () => { gameWin = null; });

  if (launcherWin && !launcherWin.isDestroyed()) launcherWin.close();
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

  app.whenReady().then(() => {
    gameDir = path.join(app.getPath('userData'), 'game');
    stagingDir = path.join(app.getPath('userData'), 'game-new');
    installedFile = path.join(app.getPath('userData'), 'installed.json');

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

    launcherWin = new BrowserWindow({
      width: 560,
      height: 340,
      resizable: false,
      maximizable: false,
      backgroundColor: '#0a0606',
      title: 'Bunker dos Mortos - Launcher',
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        sandbox: true,
        contextIsolation: true
      }
    });
    blockCtrlW(launcherWin);
    launcherWin.loadFile(path.join(__dirname, 'index.html'));
    launcherWin.on('closed', () => { launcherWin = null; });
    launcherWin.webContents.once('did-finish-load', () => update());
  });
}

app.on('window-all-closed', () => app.quit());
