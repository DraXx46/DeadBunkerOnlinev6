'use strict';
/* Dead Bunker — servidor online na Cloudflare (Worker + Durable Object).
   Porte do server.js do Render: mesma lógica de salas, contas, amigos e grupo.
   Um único Durable Object ("lobby") guarda tudo na memória; as contas ficam salvas no storage dele. */
let STORE = null;
const MAX_PAYLOAD = 16 * 1024;
/* Única conta com acesso aos comandos de administrador (comparado em minúsculas). */
const ADMIN_KEY = 'dev_draxx';
/* Saldo de drax/rubi é entregue por "presentes": o servidor guarda até o cliente confirmar (giftAck).
   Códigos de resgate valem uma vez. Tudo é salvo no storage do Durable Object. */
const gifts = new Map();  // conta (minúsculas) -> [{ id, drax, rubi, from }]
const codes = new Map();  // código -> { drax, rubi, used, usedBy }
function giftPut(k, g) {
  const arr = (gifts.get(k) || []).concat([g]);
  gifts.set(k, arr); STORE && STORE.put('g:' + k, arr).catch(() => {});
  const c = online.get(k); if (c) send(c.ws, { type: 'gifts', items: [g] });
}
const rooms = new Map();
const clients = new Map();
const CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const MAPS = new Set(['bunker', 'hosp', 'farm', 'x1', 'tz']);
const DIFFICULTIES = new Set(['normal', 'hard', 'nightmare']);

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
  room.charOf = new Map(pk.picks);   // guardado para quem reconectar no meio da partida
  const msg = { type: 'pickDone', picks: Object.fromEntries(pk.picks) };
  for (const p of room.players.values()) send(p.ws, msg);
}
function pickTick() { const now = Date.now(); for (const room of rooms.values()) if (room.pick && now >= room.pick.ends) finishPick(room); }
const keyOf = n => String(n || '').trim().toLowerCase();
async function hashPass(pass, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(pass)), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(salt), iterations: 100000 }, key, 256);
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
}
function randHex(n) { return Array.from(crypto.getRandomValues(new Uint8Array(n)), b => b.toString(16).padStart(2, '0')).join(''); }
function randInt(max) { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % max; }
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
    id: c.id, name: c.user || c.name, look: c.look || null, leader: c.id === party.leader, status: friendStatus(c), ready: c.id === party.leader || !!c.partyReady })) };
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
  if (ws && ws.readyState === 1) {
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
    for (let i = 0; i < 5; i++) code += CODE_CHARS[randInt(CODE_CHARS.length)];
    if (!codeExists(code)) return code;
  }
  throw new Error('Não foi possível gerar um código livre. Tente novamente.');
}
function setRid(client, rid) {
  rid = String(rid || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
  if (rid.length >= 8) client.rid = rid;
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
    public: !!room.public,
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

async function onMessage(client, ws, buffer) {
  if ((typeof buffer === 'string' ? buffer.length : buffer.byteLength) > MAX_PAYLOAD) { sendError(ws, 0, 'Mensagem grande demais.'); return; }

    const now = Date.now();
    if (now - client.messageWindow > 1000) { client.messageWindow = now; client.messageCount = 0; }
    client.messageCount++;
    if (client.messageCount > 90) { send(ws, { type: 'requestError', error: 'Muitas mensagens em pouco tempo.' }); return; }

    let msg;
    try { msg = JSON.parse(typeof buffer === 'string' ? buffer : new TextDecoder().decode(buffer)); }
    catch (_) { sendError(ws, 0, 'Mensagem inválida.'); return; }
    if (!msg || typeof msg.type !== 'string') return;
    const reqId = Number(msg.reqId) || 0;

    if (msg.type === 'hello') {
      client.name = cleanName(msg.name); setRid(client, msg.rid);
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
        started: false, createdAt: now, players: new Map(), public: !!msg.public && map !== 'x1'
      };
      client.name = cleanName(msg.name || client.name); setRid(client, msg.rid);
      client.roomCode = code; client.role = 'host'; client.ready = true; client.presence = null;
      room.players.set(client.id, client); rooms.set(code, room);
      send(ws, { type: 'roomCreated', reqId, room: publicRoom(room) });
      broadcastRoom(room); socialChanged();
      return;
    }
    if (msg.type === 'listRooms') {
      /* salas públicas: só as que ainda estão no lobby e têm vaga */
      const list = [];
      for (const r of rooms.values()) {
        if (!r.public || r.started || r.pick || r.players.size >= r.maxPlayers) continue;
        const host = r.players.get(r.hostId);
        list.push({ code: r.code, map: r.map, difficulty: r.difficulty, players: r.players.size, max: r.maxPlayers, host: host ? (host.user || host.name) : '', age: Math.round((now - r.createdAt) / 1000) });
        if (list.length >= 40) break;
      }
      send(ws, { type: 'ok', reqId, rooms: list });
      return;
    }
    if (msg.type === 'setPublic') {
      const room = roomOf(client);
      if (!room || room.hostId !== client.id) { sendError(ws, reqId, 'Somente o anfitrião pode mudar isso.'); return; }
      room.public = !!msg.public && room.map !== 'x1';
      send(ws, { type: 'ok', reqId, public: room.public });
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'joinRoom') {
      if (roomOf(client)) { sendError(ws, reqId, 'Você já está em uma sala. Saia dela antes de entrar em outra.'); return; }
      const code = String(msg.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      const room = rooms.get(code);
      if (!room) { sendError(ws, reqId, 'Não encontramos uma sala com esse código. Confira e tente novamente.'); return; }
      setRid(client, msg.rid);
      /* reconexão: quem começou a partida pode voltar para ela mesmo com o jogo em andamento */
      const seat = room.started && client.rid && room.seats ? room.seats.get(client.rid) : null;
      if (room.pick) { sendError(ws, reqId, 'A escolha de personagens está acontecendo. Tente de novo em alguns segundos.'); return; }
      if (room.started && !seat) { sendError(ws, reqId, 'Essa partida já começou. Só quem começou a partida pode voltar para ela.'); return; }
      if (seat) for (const old of Array.from(room.players.values())) if (old !== client && old.rid === client.rid && old.id !== room.hostId) {
        room.players.delete(old.id); old.roomCode = null; old.presence = null;   // conexão antiga que ainda não caiu
      }
      if (room.players.size >= room.maxPlayers) { sendError(ws, reqId, 'Essa sala está cheia.'); return; }
      client.name = cleanName(msg.name || client.name);
      client.roomCode = room.code; client.role = 'player'; client.ready = !!seat; client.presence = null;
      room.players.set(client.id, client);
      send(ws, { type: 'roomJoined', reqId, room: publicRoom(room), rejoin: !!seat, char: seat ? seat.char || null : null, you: client.id });
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
      for (const p of room.players.values()) if (p !== client && p.ws && p.ws.readyState === 1) { try { p.ws.send(out); } catch (_) {} }
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
      room.seats = new Map();
      for (const p of room.players.values()) if (p.rid) room.seats.set(p.rid, { name: p.name, char: room.charOf ? room.charOf.get(p.id) || null : null });
      for (const p of room.players.values()) send(p.ws, { type: 'roomStarted', room: publicRoom(room) });
      send(ws, { type: 'startAck', reqId });
      broadcastRoom(room);
      return;
    }
    if (msg.type === 'backToLobby') {
      const room = roomOf(client);
      if (!room || room.hostId !== client.id) { sendError(ws, reqId, 'Somente o anfitrião pode voltar ao lobby.'); return; }
      room.started = false; room.seats = null;
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
      if (u) { if ((await hashPass(pass, u.salt)) !== u.hash) { sendError(ws, reqId, 'Esse nome já está em uso com outra senha.'); return; } }
      else { if (users.size > 5000) { sendError(ws, reqId, 'Servidor cheio. Tente mais tarde.'); return; } const salt = randHex(12); const hash = await hashPass(pass, salt); if (users.has(k)) { sendError(ws, reqId, 'Tente de novo.'); return; } u = { name, salt, hash }; users.set(k, u); STORE && STORE.put('u:' + k, u).catch(() => {}); }
      const old = online.get(k);
      if (old && old !== client) { send(old.ws, { type: 'kicked', reason: 'Sua conta entrou em outro lugar.' }); leaveParty(old, true); old.user = null; }
      if (client.user && keyOf(client.user) !== k) { leaveParty(client, true); online.delete(keyOf(client.user)); }
      client.user = u.name; client.name = u.name; online.set(k, client);
      if (Array.isArray(msg.friends)) client.friends = new Set(msg.friends.map(keyOf).filter(f => f && f !== k).slice(0, 100));
      else if (!client.friends) client.friends = new Set();
      if (msg.look && typeof msg.look === 'object') client.look = { c: String(msg.look.c || '').slice(0, 24), v: String(msg.look.v || '').slice(0, 24), lvl: Math.max(0, Math.min(999, Number(msg.look.lvl) || 0)) };
      send(ws, { type: 'loginOk', reqId, name: u.name, admin: k === ADMIN_KEY });
      if ((gifts.get(k) || []).length) send(ws, { type: 'gifts', items: gifts.get(k) });
      sendSocial(client); socialChanged();
      return;
    }
    if (!client.user && ['friends', 'friendReq', 'friendAnswer', 'partyInvite', 'partyAnswer', 'partyLeave', 'partyKick', 'partyGo', 'look', 'giftAck', 'adminGive', 'codeCreate', 'redeem'].includes(msg.type)) {
      sendError(ws, reqId, 'Entre com sua conta primeiro.'); return;
    }
    if (msg.type === 'giftAck') {
      const k = keyOf(client.user), ids = new Set((Array.isArray(msg.ids) ? msg.ids : []).map(String));
      const left = (gifts.get(k) || []).filter(g => !ids.has(g.id));
      if (left.length) { gifts.set(k, left); STORE && STORE.put('g:' + k, left).catch(() => {}); }
      else { gifts.delete(k); STORE && STORE.delete('g:' + k).catch(() => {}); }
      return;
    }
    if (msg.type === 'adminGive' || msg.type === 'codeCreate') {
      if (keyOf(client.user) !== ADMIN_KEY) { sendError(ws, reqId, 'Comando restrito ao administrador.'); return; }
      const drax = Math.max(0, Math.min(1000000, Math.floor(Number(msg.drax) || 0)));
      const rubi = Math.max(0, Math.min(1000000, Math.floor(Number(msg.rubi) || 0)));
      if (!drax && !rubi) { sendError(ws, reqId, 'Informe uma quantidade maior que zero.'); return; }
      if (msg.type === 'adminGive') {
        const to = keyOf(String(msg.to || ''));
        if (!users.has(to)) { sendError(ws, reqId, 'Jogador não encontrado.'); return; }
        giftPut(to, { id: randHex(8), drax, rubi, from: client.user });
        send(ws, { type: 'ok', reqId, text: `Enviado: ${drax} drax e ${rubi} rubi para ${users.get(to).name}.` });
        return;
      }
      const code = randHex(5).toUpperCase();
      codes.set(code, { drax, rubi, used: false });
      STORE && STORE.put('c:' + code, codes.get(code)).catch(() => {});
      send(ws, { type: 'ok', reqId, text: `Código ${code}: ${drax} drax e ${rubi} rubi. Vale uma vez.` });
      return;
    }
    if (msg.type === 'redeem') {
      const code = String(msg.code || '').trim().toUpperCase(), c = codes.get(code), me = keyOf(client.user);
      if (!c || c.used) { sendError(ws, reqId, 'Código inválido ou já usado.'); return; }
      c.used = true; c.usedBy = me; STORE && STORE.put('c:' + code, c).catch(() => {});
      giftPut(me, { id: 'c' + code, drax: c.drax, rubi: c.rubi, from: 'código' });
      send(ws, { type: 'ok', reqId, text: 'Código resgatado! O saldo aparece agora.' });
      return;
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
      party.members.push(client.id); client.partyId = party.id; client.partyReady = false;
      for (const id of party.members) { const o = clients.get(id); if (o && o !== client) send(o.ws, { type: 'partyNote', text: client.user + ' entrou no grupo' }); }
      broadcastParty(party); return;
    }
    if (msg.type === 'partyLeave') { client.partyReady = false; leaveParty(client); return; }
    if (msg.type === 'partyReady') {
      // "Estou pronto" no menu: o grupo inteiro vê quem já está pronto antes do líder escolher o mapa
      const party = client.partyId ? parties.get(client.partyId) : null; if (!party) return;
      client.partyReady = !!msg.ready; broadcastParty(party); return;
    }
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
      for (const id of party.members) { const o = clients.get(id); if (o) o.partyReady = false; }   // na próxima partida cada um confirma de novo
      broadcastParty(party); return;
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
  
}

function cleanupTick() {
  const now = Date.now();
  for (const room of rooms.values()) {
    if (room.players.size === 0 || now - room.createdAt > 6 * 60 * 60 * 1000) closeRoom(room, 'A sala expirou.');
  }
}

const CORS = { 'access-control-allow-origin': '*', 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8' };

export class Lobby {
  constructor(state) {
    this.state = state; STORE = state.storage; this.timers = null;
    state.blockConcurrencyWhile(async () => {
      const all = await state.storage.list({ prefix: 'u:' });
      for (const [key, u] of all) users.set(key.slice(2), u);
      for (const [key, v] of await state.storage.list({ prefix: 'g:' })) gifts.set(key.slice(2), v);
      for (const [key, v] of await state.storage.list({ prefix: 'c:' })) codes.set(key.slice(2), v);
    });
  }
  startTimers() {
    if (this.timers) return;
    this.timers = [setInterval(pickTick, 250), setInterval(cleanupTick, 60000)];
  }
  stopTimersIfIdle() {
    if (clients.size || !this.timers) return;
    for (const t of this.timers) clearInterval(t); this.timers = null;
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/api/health') return new Response(JSON.stringify({ ok: true, service: 'bunker-dos-mortos-cf', rooms: rooms.size, clients: clients.size, users: users.size }), { headers: CORS });
    if (url.pathname === '/api/rooms') return new Response(JSON.stringify(Array.from(rooms.values()).filter(r => !r.started).map(publicRoom)), { headers: CORS });
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Esperado WebSocket', { status: 426 });
    const pair = new WebSocketPair(); const ws = pair[1];
    ws.accept();
    const client = {
      id: crypto.randomUUID(), ws, name: 'Sobrevivente', roomCode: null,
      presence: null, ready: false, role: 'player', messageWindow: Date.now(), messageCount: 0
    };
    clients.set(client.id, client);
    this.startTimers();
    send(ws, { type: 'welcome', id: client.id });
    let queue = Promise.resolve();
    ws.addEventListener('message', ev => { queue = queue.then(() => onMessage(client, ws, ev.data)).catch(() => {}); });
    let gone = false;
    const bye = () => { if (gone) return; gone = true; removeClient(client, 'disconnect'); this.stopTimersIfIdle(); };
    ws.addEventListener('close', bye); ws.addEventListener('error', bye);
    return new Response(null, { status: 101, webSocket: pair[0] });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/ws' || url.pathname.startsWith('/api/')) {
      if (request.method === 'OPTIONS') return new Response(null, { headers: { ...CORS, 'access-control-allow-methods': 'GET', 'access-control-allow-headers': '*' } });
      const stub = env.LOBBY.get(env.LOBBY.idFromName('lobby'));
      return stub.fetch(request);
    }
    return Response.redirect('https://bunker-dos-mortos.pages.dev/', 302);
  }
};
