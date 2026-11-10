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
const MAPS = new Set(['bunker', 'hosp', 'farm', 'x1', 'tz']);
const DIFFICULTIES = new Set(['normal', 'hard', 'nightmare']);
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8', '.woff': 'font/woff', '.woff2': 'font/woff2'
};

/* ---- contas, amigos e grupo ----
   As contas ficam só na memória do servidor (o navegador de cada jogador guarda nome e senha e
   refaz o login sozinho se o servidor reiniciar). Senha guardada como hash scrypt com sal. */
const users = new Map();      // nome em minúsculas -> { name, salt, hash }
const online = new Map();     // nome em minúsculas -> client
const parties = new Map();    // id -> { id, leader: clientId, members: [clientId] }
const PARTY_MAX = 4;
const CHAR_IDS = ['recruta', 'helena', 'moreira', 'tomas', 'iara', 'viktor'];
const PICK_MS = 30000, PICK_ALL_MS = 5000;
/* escolha de personagem antes da partida: 30 s; quando todos escolhem, cai para 5 s; ninguém repete personagem */
function pickPayload(room) {
  const pk = room.pick; return { type: 'pickState', left: Math.max(0, pk.ends - Date.now()), picks: Object.fromEntries(pk.picks), players: Array.from(room.players.values()).map(p => ({ id: p.id, name: p.name })) };
}
function broadcastPick(room) { const pl = pickPayload(room); for (const p of room.players.values()) send(p.ws, pl); }
function finishPick(room) {
  const pk = room.pick; if (!pk) return; room.pick = null;
  const taken = new Set(pk.picks.values());
  for (const p of room.players.values()) {
    if (pk.picks.has(p.id)) continue;
    const own = (pk.own.get(p.id) || []).filter(c => CHAR_IDS.includes(c));
    const c = own.find(c => !taken.has(c)) || CHAR_IDS.find(c => !taken.has(c)) || 'recruta';
    pk.picks.set(p.id, c); taken.add(c);
  }
  const msg = { type: 'pickDone', picks: Object.fromEntries(pk.picks) };
  for (const p of room.players.values()) send(p.ws, msg);
}
setInterval(() => { const now = Date.now(); for (const room of rooms.values()) if (room.pick && now >= room.pick.ends) finishPick(room); }, 250).unref();
const keyOf = n => String(n || '').trim().toLowerCase();
function hashPass(pass, salt) { return crypto.scryptSync(String(pass), salt, 32).toString('hex'); }
function validName(n) { return /^[\p{L}\p{N} _.\-]{3,18}$/u.test(n); }
function friendStatus(c) {
  if (!c) return 'offline';
  if (c.roomCode) { const r = rooms.get(c.roomCode); return r && r.started ? 'em partida' : 'no lobby'; }
  return c.partyId && (parties.get(c.partyId) || { members: [] }).members.length > 1 ? 'em grupo' : 'no menu';
}
function sendSocial(c) {
  if (!c || !c.user) return;
  const list = Array.from(c.friends || []).slice(0, 100).map(k => {
    const f = online.get(k); return { name: f ? f.user : k, key: k, online: !!f, status: friendStatus(f), sameParty: !!(f && c.partyId && f.partyId === c.partyId) };
  });
  send(c.ws, { type: 'social', friends: list });
}
let socialTimer = null;
function socialChanged() {
  if (socialTimer) return;
  socialTimer = setTimeout(() => { socialTimer = null; for (const c of online.values()) sendSocial(c); }, 250);
}
function partyState(party) {
  if (!party) return null;
  return { id: party.id, leader: (clients.get(party.leader) || {}).user || '', members: party.members.map(id => clients.get(id)).filter(Boolean).map(c => ({
    id: c.id, name: c.user || c.name, look: c.look || null, leader: c.id === party.leader, status: friendStatus(c) })) };
}
function broadcastParty(party) {
  if (!party) return;
  const st = partyState(party);
  for (const id of party.members) { const c = clients.get(id); if (c) send(c.ws, { type: 'party', party: st }); }
  socialChanged();
}
function leaveParty(c, silent) {
  const party = c.partyId ? parties.get(c.partyId) : null;
  c.partyId = null;
  if (!party) return;
  party.members = party.members.filter(id => id !== c.id);
  if (!silent) send(c.ws, { type: 'party', party: null });
  if (party.members.length <= 1) {
    for (const id of party.members) { const o = clients.get(id); if (o) { o.partyId = null; send(o.ws, { type: 'party', party: null, note: (c.user || 'Seu amigo') + ' saiu do grupo' }); } }
    parties.delete(party.id);
  } else {
    if (party.leader === c.id) party.leader = party.members[0];
    for (const id of party.members) { const o = clients.get(id); if (o) send(o.ws, { type: 'partyNote', text: (c.user || 'Alguém') + ' saiu do grupo' }); }
    broadcastParty(party);
  }
  socialChanged();
}
function ensureParty(c) {
  let party = c.partyId ? parties.get(c.partyId) : null;
  if (!party) { party = { id: crypto.randomUUID(), leader: c.id, members: [c.id] }; parties.set(party.id, party); c.partyId = party.id; }
  return party;
}

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
  rooms.delete(room.code); socialChanged();
  for (const p of room.players.values()) {
    p.roomCode = null; p.role = 'player'; p.ready = false; p.presence = null;
    send(p.ws, { type: 'roomClosed', reason });
  }
}
function removeClient(client, reason = 'left', dropConnection = true) {
  if (dropConnection) {
    leaveParty(client, true);
    if (client.user && online.get(keyOf(client.user)) === client) { online.delete(keyOf(client.user)); socialChanged(); }
  }
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
      broadcastRoom(room); socialChanged();
      return;
    }
    if (msg.type === 'joinRoom') {
      if (roomOf(client)) { sendError(ws, reqId, 'Você já está em uma sala. Saia dela antes de entrar em outra.'); return; }
      const code = String(msg.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const room = rooms.get(code);
      if (!room) { sendError(ws, reqId, 'Não encontramos uma sala com esse código. Confira e tente novamente.'); return; }
      if (room.started || room.pick) { sendError(ws, reqId, 'Essa partida já começou. Peça ao anfitrião para criar outra sala.'); return; }
      if (room.players.size >= room.maxPlayers) { sendError(ws, reqId, 'Essa sala está cheia.'); return; }
      client.name = cleanName(msg.name || client.name);
      client.roomCode = room.code; client.role = 'player'; client.ready = false; client.presence = null;
      room.players.set(client.id, client);
      send(ws, { type: 'roomJoined', reqId, room: publicRoom(room) });
      broadcastRoom(room); socialChanged();
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
      // só o estado deste jogador vai para os outros (antes a sala inteira era reenviada a cada pacote: muitos dados e travadas)
      const json = data ? JSON.stringify(data) : 'null';
      const out = '{"type":"pres","id":' + JSON.stringify(client.id) + ',"data":' + json + '}';
      for (const p of room.players.values()) if (p !== client && p.ws && p.ws.readyState === WebSocket.OPEN) { try { p.ws.send(out); } catch (_) {} }
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
    if (msg.type === 'pickStart') {
      const room = roomOf(client);
      if (!room || room.hostId !== client.id) { sendError(ws, reqId, 'Somente o anfitrião pode iniciar a partida.'); return; }
      if (room.started || room.pick) { sendError(ws, reqId, 'A escolha já começou.'); return; }
      const notReady = Array.from(room.players.values()).filter(p => p.id !== room.hostId && !p.ready);
      if (notReady.length) { sendError(ws, reqId, 'Ainda há jogadores que não estão prontos.'); return; }
      room.pick = { ends: Date.now() + PICK_MS, picks: new Map(), own: new Map() };
      send(ws, { type: 'ok', reqId }); broadcastPick(room); return;
    }
    if (msg.type === 'pick' || msg.type === 'pickOwn') {
      const room = roomOf(client); if (!room || !room.pick) return;
      if (msg.type === 'pickOwn') { room.pick.own.set(client.id, (Array.isArray(msg.own) ? msg.own : []).map(String).slice(0, 12)); return; }
      const c = String(msg.c || '');
      if (!CHAR_IDS.includes(c)) return;
      for (const [id, v] of room.pick.picks) if (v === c && id !== client.id) { send(ws, { type: 'pickTaken', c }); broadcastPick(room); return; }
      room.pick.picks.set(client.id, c);
      if (Array.from(room.players.keys()).every(id => room.pick.picks.has(id))) room.pick.ends = Math.min(room.pick.ends, Date.now() + PICK_ALL_MS);
      broadcastPick(room); return;
    }
    if (msg.type === 'startRoom') {
      const room = roomOf(client);
      if (!room || room.hostId !== client.id) { sendError(ws, reqId, 'Somente o anfitrião pode iniciar a partida.'); return; }
      if (room.started) { sendError(ws, reqId, 'A partida já foi iniciada.'); return; }
      const notReady = Array.from(room.players.values()).filter(p => p.id !== room.hostId && !p.ready);
      if (notReady.length) { sendError(ws, reqId, 'Ainda há jogadores que não estão prontos.'); return; }
      room.started = true; socialChanged();
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
      socialChanged();
      return;
    }
    if (msg.type === 'login') {
      const name = String(msg.name || '').replace(/\s+/g, ' ').trim().slice(0, 18), pass = String(msg.pass || '');
      if (!validName(name)) { sendError(ws, reqId, 'Use de 3 a 18 letras ou números no nome.'); return; }
      if (pass.length < 3 || pass.length > 64) { sendError(ws, reqId, 'A senha precisa ter pelo menos 3 caracteres.'); return; }
      const k = keyOf(name); let u = users.get(k);
      if (u) { if (hashPass(pass, u.salt) !== u.hash) { sendError(ws, reqId, 'Esse nome já está em uso com outra senha.'); return; } }
      else { if (users.size > 5000) { sendError(ws, reqId, 'Servidor cheio. Tente mais tarde.'); return; } const salt = crypto.randomBytes(12).toString('hex'); u = { name, salt, hash: hashPass(pass, salt) }; users.set(k, u); }
      const old = online.get(k);
      if (old && old !== client) { send(old.ws, { type: 'kicked', reason: 'Sua conta entrou em outro lugar.' }); leaveParty(old, true); old.user = null; }
      if (client.user && keyOf(client.user) !== k) { leaveParty(client, true); online.delete(keyOf(client.user)); }
      client.user = u.name; client.name = u.name; online.set(k, client);
      if (Array.isArray(msg.friends)) client.friends = new Set(msg.friends.map(keyOf).filter(f => f && f !== k).slice(0, 100));
      else if (!client.friends) client.friends = new Set();
      if (msg.look && typeof msg.look === 'object') client.look = { c: String(msg.look.c || '').slice(0, 24), v: String(msg.look.v || '').slice(0, 24), lvl: Math.max(0, Math.min(999, Number(msg.look.lvl) || 0)) };
      send(ws, { type: 'loginOk', reqId, name: u.name });
      sendSocial(client); socialChanged();
      return;
    }
    if (!client.user && ['friends', 'friendReq', 'friendAnswer', 'partyInvite', 'partyAnswer', 'partyLeave', 'partyKick', 'partyGo', 'look'].includes(msg.type)) {
      sendError(ws, reqId, 'Entre com sua conta primeiro.'); return;
    }
    if (msg.type === 'friends') {
      client.friends = new Set((Array.isArray(msg.list) ? msg.list : []).map(keyOf).filter(f => f && f !== keyOf(client.user)).slice(0, 100));
      sendSocial(client); return;
    }
    if (msg.type === 'look') {
      const l = msg.look || {}; client.look = { c: String(l.c || '').slice(0, 24), v: String(l.v || '').slice(0, 24), lvl: Math.max(0, Math.min(999, Number(l.lvl) || 0)) };
      if (client.partyId) broadcastParty(parties.get(client.partyId)); return;
    }
    if (msg.type === 'friendReq') {
      const t = online.get(keyOf(msg.to));
      if (!t || t === client) { sendError(ws, reqId, t ? 'Você não pode se adicionar.' : 'Esse jogador não está online agora. O pedido só chega para quem está no jogo.'); return; }
      send(t.ws, { type: 'friendReq', from: client.user });
      send(ws, { type: 'ok', reqId, text: 'Pedido enviado para ' + t.user + '.' }); return;
    }
    if (msg.type === 'friendAnswer') {
      const t = online.get(keyOf(msg.to));
      if (msg.accept && t) {
        client.friends = client.friends || new Set(); t.friends = t.friends || new Set();
        client.friends.add(keyOf(t.user)); t.friends.add(keyOf(client.user));
        send(ws, { type: 'friendAdded', name: t.user }); send(t.ws, { type: 'friendAdded', name: client.user });
        socialChanged();
      } else if (t) send(t.ws, { type: 'partyNote', text: client.user + ' recusou o pedido de amizade.' });
      return;
    }
    if (msg.type === 'partyInvite') {
      const t = online.get(keyOf(msg.to));
      if (!t || t === client) { sendError(ws, reqId, 'Esse jogador não está online.'); return; }
      const party = ensureParty(client);
      if (party.members.includes(t.id)) { sendError(ws, reqId, t.user + ' já está no seu grupo.'); return; }
      if (party.members.length >= PARTY_MAX) { sendError(ws, reqId, 'O grupo já está cheio (4 jogadores).'); return; }
      send(t.ws, { type: 'partyInvite', from: client.user, pid: party.id });
      send(ws, { type: 'ok', reqId, text: 'Convite enviado para ' + t.user + '.' });
      broadcastParty(party); return;
    }
    if (msg.type === 'partyAnswer') {
      const party = parties.get(String(msg.pid || ''));
      if (!msg.accept) { if (party) { const l = clients.get(party.leader); if (l) send(l.ws, { type: 'partyNote', text: client.user + ' recusou o convite.' }); } return; }
      if (!party) { sendError(ws, reqId, 'Esse grupo não existe mais.'); return; }
      if (party.members.length >= PARTY_MAX) { sendError(ws, reqId, 'O grupo já está cheio.'); return; }
      if (client.partyId === party.id) return;
      leaveParty(client, true);
      party.members.push(client.id); client.partyId = party.id;
      for (const id of party.members) { const o = clients.get(id); if (o && o !== client) send(o.ws, { type: 'partyNote', text: client.user + ' entrou no grupo' }); }
      broadcastParty(party); return;
    }
    if (msg.type === 'partyLeave') { leaveParty(client); return; }
    if (msg.type === 'partyKick') {
      const party = client.partyId ? parties.get(client.partyId) : null;
      if (!party || party.leader !== client.id) { sendError(ws, reqId, 'Só o líder pode remover alguém do grupo.'); return; }
      const t = online.get(keyOf(msg.name)); if (!t || t.partyId !== party.id || t === client) return;
      send(t.ws, { type: 'party', party: null, note: 'Você foi removido do grupo.' });
      leaveParty(t, true); return;
    }
    if (msg.type === 'partyGo') {
      // o líder criou a sala: os outros membros do grupo recebem o código e entram sozinhos
      const party = client.partyId ? parties.get(client.partyId) : null; const room = roomOf(client);
      if (!party || party.leader !== client.id || !room) return;
      for (const id of party.members) { const o = clients.get(id); if (o && o !== client) send(o.ws, { type: 'partyGo', code: room.code, map: room.map }); }
      return;
    }
    if (msg.type === 'chat') {
      // chat de texto e registro de ações da partida: repassado para os outros jogadores da mesma sala
      const room = roomOf(client);
      if (!room) return;
      const text = String(msg.text || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
      if (!text) return;
      if (!client.chatWindow || now - client.chatWindow > 4000) { client.chatWindow = now; client.chatCount = 0; }
      client.chatCount = (client.chatCount || 0) + 1;
      if (client.chatCount > 12) return;
      const k = msg.k === 'act' ? 'act' : 'msg';
      const payload = { type: 'chat', from: client.id, name: client.name, k, text, at: now };
      for (const p of room.players.values()) if (p.id !== client.id) send(p.ws, payload);
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
  console.log(`Dead Bunker v6 online em http://${HOST}:${PORT}`);
  console.log('WebSocket: /ws');
});

process.on('SIGTERM', () => { clearInterval(cleanup); server.close(() => process.exit(0)); });
process.on('SIGINT', () => { clearInterval(cleanup); server.close(() => process.exit(0)); });
