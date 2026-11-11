'use strict';
const $ = (s) => document.querySelector(s);
const L = window.launcher;

/* ---------- janela sem moldura ---------- */
for (const b of document.querySelectorAll('[data-w]')) b.addEventListener('click', () => L.win(b.dataset.w));

/* ---------- carrossel do topo ---------- */
const SLIDES = [
  { tag: 'TEMPORADA 1', title: 'Cinzas', text: 'O passe de temporada chegou: 50 níveis de recompensas, a camuflagem Cinzas e o título Cinzento. Chegue ao nível 100 e prestigie.' },
  { tag: 'NOVO MAPA', title: 'A cidade destruída', text: 'Conserte o carro no bunker e dirija até a cidade: delegacia, hospital, mercado e o Mutante Ácido esperando no meio do caos.' },
  { tag: '2087', title: 'Laboratório de testes', text: 'Junte as peças da máquina do tempo no Hospício Vale Negro e veja o que fizeram com ele no futuro.' },
  { tag: 'ONLINE', title: 'Chame o esquadrão', text: 'Até 4 sobreviventes por sala. Use um código para chamar amigos ou entre numa sala pública.' }
];
const sl = [...document.querySelectorAll('.hero .sl')];
const dots = $('#dots');
let cur = -1, timer = 0;
SLIDES.forEach((_, i) => { const b = document.createElement('button'); b.innerHTML = '<i></i>'; b.addEventListener('click', () => show(i)); dots.appendChild(b); });
function show(i) {
  cur = (i + SLIDES.length) % SLIDES.length; const s = SLIDES[cur];
  sl.forEach((e, k) => e.classList.toggle('on', k === cur));
  [...dots.children].forEach((d, k) => { d.classList.remove('on'); if (k === cur) { void d.offsetWidth; d.classList.add('on'); } });
  $('#s-tag').textContent = s.tag; $('#s-title').textContent = s.title; $('#s-text').textContent = s.text;
  clearTimeout(timer); timer = setTimeout(() => show(cur + 1), 7000);
}
show(0);
// a imagem acompanha o mouse de leve
$('.hero').addEventListener('mousemove', (e) => { const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; sl[cur].style.transform = `translate(${-x * 18}px,${-y * 12}px)`; });

/* ---------- brasas e cinzas subindo ---------- */
const cv = $('#fx'), cx = cv.getContext('2d'); let W = 0, H = 0; const P = [];
function rs() { W = cv.width = cv.clientWidth; H = cv.height = cv.clientHeight; }
addEventListener('resize', rs); rs();
for (let i = 0; i < 70; i++) P.push(spawn(true));
function spawn(any) { return { x: Math.random() * W, y: any ? Math.random() * H : H + 10, r: Math.random() * 2.2 + 0.4, vy: Math.random() * 28 + 10, vx: Math.random() * 12 - 6, a: Math.random() * 0.7 + 0.2, ember: Math.random() < 0.45, t: Math.random() * 6 }; }
let last = performance.now();
(function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; cx.clearRect(0, 0, W, H);
  for (let i = 0; i < P.length; i++) { const p = P[i]; p.t += dt; p.y -= p.vy * dt; p.x += (p.vx + Math.sin(p.t * 1.3) * 10) * dt;
    if (p.y < -10) P[i] = spawn(false);
    const fl = p.ember ? 0.6 + Math.sin(p.t * 9) * 0.4 : 1;
    cx.fillStyle = p.ember ? `rgba(255,${110 + (p.r * 30 | 0)},40,${p.a * fl})` : `rgba(190,180,170,${p.a * 0.5})`;
    cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); }
  requestAnimationFrame(loop);
})(last);

/* ---------- atualização e botão JOGAR ---------- */
const play = $('#play'), playT = $('#play-t'), playF = $('#play-f');
const txt = $('#txt'), bar = $('#bar'), fill = $('#fill'), pct = $('#pct'), retry = $('#retry'), stat = $('#stat');
L.onStatus(({ text, percent, error, ready, version }) => {
  txt.textContent = text; stat.classList.toggle('err', !!error); retry.hidden = !error;
  if (percent === null || percent === undefined) { bar.classList.add('ind'); fill.style.width = ''; pct.textContent = ''; }
  else { bar.classList.remove('ind'); fill.style.width = percent + '%'; pct.textContent = ready ? '' : percent + '%'; }
  if (ready) { play.disabled = false; play.classList.add('ready'); playT.textContent = 'Jogar'; playF.style.width = '0'; bar.style.visibility = 'hidden'; if (version) $('#v-game').textContent = 'jogo ' + version; }
  else if (error) { play.disabled = true; playT.textContent = 'Erro'; }
  else { play.disabled = true; play.classList.remove('ready'); playT.textContent = percent != null && percent < 100 ? `Atualizando ${percent}%` : 'Verificando…'; playF.style.width = (percent || 0) + '%'; }
});
play.addEventListener('click', () => { if (play.disabled) return; playT.textContent = 'Abrindo…'; L.play(); setTimeout(() => { playT.textContent = 'Jogar'; }, 4000); });
retry.addEventListener('click', () => { retry.hidden = true; L.retry(); });
$('#site').addEventListener('click', () => L.site());
$('#seenotes').addEventListener('click', () => go('notes'));
for (const n of document.querySelectorAll('.note')) n.addEventListener('click', () => { go('top'); show(+n.dataset.s); });
for (const n of document.querySelectorAll('.mp')) n.addEventListener('click', () => { go('top'); show(n.querySelector('b').textContent.includes('Cidade') ? 1 : n.querySelector('b').textContent.includes('Hosp') ? 2 : 0); });
addEventListener('keydown', (e) => { if (e.key === 'Enter' && !play.disabled && $('#cfg').hidden) play.click(); });

/* ---------- trilho de navegação ---------- */
function go(k) {
  if (k === 'site') { L.site(); return; }
  if (k === 'cfg') { openCfg(); return; }
  const el = document.getElementById(k); if (el) $('#main').scrollTo({ top: k === 'top' ? 0 : el.offsetTop - 10, behavior: 'smooth' });
  for (const b of document.querySelectorAll('.rail .nv')) b.classList.toggle('on', b.dataset.go === k);
}
for (const b of document.querySelectorAll('.rail .nv')) b.addEventListener('click', () => go(b.dataset.go));

/* ---------- painel da direita ---------- */
for (const b of document.querySelectorAll('.tabs button')) b.addEventListener('click', () => {
  for (const x of document.querySelectorAll('.tabs button')) x.classList.toggle('on', x === b);
  $('#p1').hidden = b.dataset.p !== 'p1'; $('#p2').hidden = b.dataset.p !== 'p2';
});
const SEASON_END = Date.UTC(2027, 1, 1);
function tick() { const s = Math.max(0, SEASON_END - Date.now()) / 1000; const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
  $('#cd').innerHTML = [[d, 'dias'], [h, 'horas'], [m, 'min']].map(([v, n]) => `<div><b class="disp">${v}</b><br><small>${n}</small></div>`).join(''); }
tick(); setInterval(tick, 30000);
const TIPS = [
  'Correr gasta fôlego: solte o Shift antes de virar a esquina para já chegar mirando.',
  'Tiro na perna quebra: o zumbi manca. Nas duas, ele cai e se arrasta.',
  'Com bala no pente a recarga é mais rápida. Não espere esvaziar.',
  'Golpe pesado de faca pelas costas vira uma finalização na cabeça.',
  'Desafios completos ficam esperando no menu: clique em Receber.',
  'Rodadas especiais aparecem na 5, 15, 25…: cães, neblina ou gigantes.',
  'Aperte N durante a partida para mandar frases rápidas ao esquadrão.'
];
let ti = Math.floor(Math.random() * TIPS.length);
function tip() { const el = $('#tipx'); el.style.opacity = 0; setTimeout(() => { el.textContent = TIPS[ti++ % TIPS.length]; el.style.opacity = 1; }, 400); }
tip(); setInterval(tip, 9000);
async function health() {
  let h = { ok: false }; try { h = await L.health(); } catch (e) {}
  $('#led').className = 'led ' + (h.ok ? 'on' : 'off'); $('#srv').textContent = h.ok ? 'Servidores online' : 'Servidor fora do ar';
  $('#online').innerHTML = h.ok ? `<b style="font-size:20px">${h.clients}</b> conectado${h.clients === 1 ? '' : 's'} · <b>${h.rooms}</b> sala${h.rooms === 1 ? '' : 's'} aberta${h.rooms === 1 ? '' : 's'}` : 'Não foi possível falar com o servidor agora. O modo offline continua funcionando.';
}
health(); setInterval(health, 30000);
L.info().then((i) => { $('#v-l').textContent = 'launcher ' + i.launcher; if (i.game) $('#v-game').textContent = 'jogo ' + i.game; }).catch(() => {});

/* ---------- configurações (modo de tela do jogo) ---------- */
async function openCfg() {
  $('#cfg').hidden = false;
  try { const d = await L.displayGet(); $('#c-mode').value = d.mode || 'full'; if (d.w) $('#c-res').value = `${d.w}x${d.h}`; } catch (e) {}
}
async function saveCfg() { const [w, h] = $('#c-res').value.split('x').map(Number); try { await L.displaySet({ mode: $('#c-mode').value, w, h }); } catch (e) {} }
$('#c-mode').addEventListener('change', saveCfg); $('#c-res').addEventListener('change', saveCfg);
$('#c-close').addEventListener('click', () => { $('#cfg').hidden = true; go('top'); });
$('#cfg').addEventListener('click', (e) => { if (e.target.id === 'cfg') { $('#cfg').hidden = true; go('top'); } });
