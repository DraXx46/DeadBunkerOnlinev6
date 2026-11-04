'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { WebSocketServer, WebSocket } = require('ws');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const MAX_PAYLOAD = 16 * 1024;
const rooms = new Map();
const clients = new Map();
const CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const MAPS = new Set(['bunker', 'hosp', 'farm', 'x1']);
const DIFFICULTIES = new Set(['normal', 'hard', 'nightmare']);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.woff': 'font/woff', '.woff2': 'font/woff2'
};

function cleanName(value) {
  const name = String(value || '')
    .replace(/[<>\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 18);
  return name || 'Sobrevivente';
}
function send(ws, payload) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    try { ws.send(JSON.stringify(payload)); } catch (_) { /* socket may be closing */ }
  }
}
function sendError(ws, reqId, message) {
  send(ws, { type: 'requestError', reqId: Number(reqId) || 0, error: message });
}
function codeExists(code) { return rooms.has(code); }
function makeCode() {
  for (let attempt = 0; attempt < 200; attempt++) {
    let code = '';
    for (let i = 0; i < 5; i++) code += CODE_CHARS[crypto.randomInt(0, CODE_CHARS.length)];
    if (!codeExists(code)) return code;
  }
  throw new Error('Não foi possível gerar um código livre. Tente novamente.');
}
function roomOf(client) {
  return client && client.roomCode ? rooms.get(client.roomCode) || null : null;
}
function publicRoom(room) {
  return {
    code: room.code,
    map: room.map,
    maxPlayers: room.maxPlayers,
    difficulty: room.difficulty,
    hostId: room.hostId,
    started: room.started,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id, name: p.name, role: p.role, ready: p.ready, presence: p.presence || null
    }))
  };
}
function broadcastRoom(room) {
  const payload = { type: 'roomState', room: publicRoom(room) };
  for (const player of room.players.values()) send(player.ws, payload);
}
function closeRoom(room, reason = 'A sala foi encerrada pelo anfitrião.') {
  if (!room) return;
  rooms.delete(room.code);
  for (const p of room.players.values()) {
    p.roomCode = null; p.role = 'player'; p.ready = false; p.presence = null;
    send(p.ws, { type: 'roomClosed', reason });
  }
}
function removeClient(client, reason = 'left', dropConnection = true) {
  const room = roomOf(client);
  if (room) {
    if (client.id === room.hostId) {
      closeRoom(room, 'O anfitrião saiu. A sala foi encerrada.');
    } else {
      room.players.delete(client.id);
      client.roomCode = null;
      broadcastRoom(room);
    }
  }
  if (dropConnection) clients.delete(client.id);
}
function serveStatic(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (_) { res.writeHead(400); res.end('Bad request'); return; }
  if (pathname === '/api/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify({ ok: true, service: 'bunker-dos-mortos-v6', rooms: rooms.size, clients: clients.size }));
    return;
  }
  if (pathname === '/api/rooms') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify(Array.from(rooms.values()).filter(r => !r.started).map(publicRoom)));
    return;
  }
  if (pathname === '/') pathname = '/index.html';
  const target = path.resolve(ROOT, '.' + pathname);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(target, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      'content-type': MIME[ext] || 'application/octet-stream',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'cache-control': ext === '.html' ? 'no-store, max-age=0' : 'public, max-age=3600'
    });
    fs.createReadStream(target).pipe(res);
  });
}

const server = http.createServer(serveStatic);
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: MAX_PAYLOAD });

wss.on('connection', (ws) => {
  const client = {
    id: crypto.randomUUID(), ws, name: 'Sobrevivente', roomCode: null,
    presence: null, ready: false, role: 'player', messageWindow: Date.now(), messageCount: 0
  };
  ws.client = client;
  clients.set(client.id, client);
  send(ws, { type: 'welcome', id: client.id });

  ws.on('message', (buffer) => {
    const now = Date.now();
    if (now - client.messageWindow > 1000) { client.messageWindow = now; client.messageCount = 0; }
    client.messageCount++;
    if (client.messageCount > 90) { send(ws, { type: 'requestError', error: 'Muitas mensagens em pouco tempo.' }); return; }

    let msg;
    try { msg = JSON.parse(buffer.toString()); }
    catch (_) { sendError(ws, 0, 'Mensagem inválida.'); return; }
    if (!msg || typeof msg.type !== 'string') return;
    const reqId = Number(msg.reqId) || 0;

    if (msg.type === 'hello') {
      client.name = cleanName(msg.name);
      const room = roomOf(client);
      if (room) broadcastRoom(room);
      return;
    }
    if (msg.type === 'createRoom') {
      if (roomOf(client)) { sendError(ws, reqId, 'Você já está em uma sala. Saia dela antes de criar outra.'); return; }
      const map = MAPS.has(msg.map) ? msg.map : 'bunker';
      const maxPlayers = map === 'x1' ? 2 : Math.max(2, Math.min(4, Math.round(Number(msg.maxPlayers) || 2)));
      const difficulty = DIFFICULTIES.has(msg.difficulty) ? msg.difficulty : 'normal';
      let code;
      try { code = makeCode(); }
      catch (e) { sendError(ws, reqId, e.message); return; }
      const room = {
        code, map, maxPlayers, difficulty, hostId: client.id,
        started: false, createdAt: now, players: new Map()
      };
      client.name = cleanName(msg.name || client.name);
      client.roomCode = code; client.role = 'host'; client.ready = true; client.presence = null;
      room.players.set(client.id, client); rooms.set(code, room);
      send(ws, { type: 'roomCreated', reqId, room: publicRoom(room) });
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'joinRoom') {
      if (roomOf(client)) { sendError(ws, reqId, 'Você já está em uma sala. Saia dela antes de entrar em outra.'); return; }
      const code = String(msg.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const room = rooms.get(code);
      if (!room) { sendError(ws, reqId, 'Não encontramos uma sala com esse código. Confira e tente novamente.'); return; }
      if (room.started) { sendError(ws, reqId, 'Essa partida já começou. Peça ao anfitrião para criar outra sala.'); return; }
      if (room.players.size >= room.maxPlayers) { sendError(ws, reqId, 'Essa sala está cheia.'); return; }
      client.name = cleanName(msg.name || client.name);
      client.roomCode = room.code; client.role = 'player'; client.ready = false; client.presence = null;
      room.players.set(client.id, client);
      send(ws, { type: 'roomJoined', reqId, room: publicRoom(room) });
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'presence') {
      const room = roomOf(client);
      if (!room) return;
      let data = msg.data;
      if (!data || typeof data !== 'object' || Array.isArray(data)) data = null;
      if (data) {
        const json = JSON.stringify(data);
        if (json.length > 12000) { sendError(ws, reqId, 'Estado de jogo muito grande.'); return; }
      }
      client.presence = data;
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'ready') {
      const room = roomOf(client);
      if (!room || client.role === 'host') { sendError(ws, reqId, 'Não foi possível alterar o estado de pronto.'); return; }
      client.ready = !!msg.ready;
      send(ws, { type: 'readyAck', reqId, ready: client.ready });
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'startRoom') {
      const room = roomOf(client);
      if (!room || room.hostId !== client.id) { sendError(ws, reqId, 'Somente o anfitrião pode iniciar a partida.'); return; }
      if (room.started) { sendError(ws, reqId, 'A partida já foi iniciada.'); return; }
      const notReady = Array.from(room.players.values()).filter(p => p.id !== room.hostId && !p.ready);
      if (notReady.length) { sendError(ws, reqId, 'Ainda há jogadores que não estão prontos.'); return; }
      room.started = true;
      for (const p of room.players.values()) send(p.ws, { type: 'roomStarted', room: publicRoom(room) });
      send(ws, { type: 'startAck', reqId });
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'backToLobby') {
      const room = roomOf(client);
      if (!room || room.hostId !== client.id) { sendError(ws, reqId, 'Somente o anfitrião pode voltar ao lobby.'); return; }
      room.started = false;
      for (const p of room.players.values()) p.ready = p.id === room.hostId;
      send(ws, { type: 'startAck', reqId });
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'leave') {
      removeClient(client, 'leave', false);
      client.roomCode = null;
      client.role = 'player'; client.ready = false; client.presence = null;
      send(ws, { type: 'leftRoom' });
      return;
    }
    if (msg.type === 'ping') { send(ws, { type: 'pong', at: now }); return; }
  });

  ws.on('close', () => removeClient(client, 'disconnect'));
  ws.on('error', () => removeClient(client, 'socket error'));
});

// Remove abandoned empty rooms and stale sockets periodically.
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (room.players.size === 0 || now - room.createdAt > 6 * 60 * 60 * 1000) closeRoom(room, 'A sala expirou.');
  }
}, 60_000);
if (cleanup.unref) cleanup.unref();

server.listen(PORT, HOST, () => {
  console.log(`Bunker dos Mortos v6 online em http://${HOST}:${PORT}`);
  console.log('WebSocket: /ws');
});

process.on('SIGTERM', () => { clearInterval(cleanup); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { clearInterval(cleanup); server.close(() => process.exit(0)); });
