'use strict';
const txt = document.getElementById('txt');
const fill = document.getElementById('fill');
const pct = document.getElementById('pct');
const retry = document.getElementById('retry');

window.launcher.onStatus(({ text, percent, error }) => {
  txt.textContent = text;
  txt.className = error ? 'err' : '';

  if (percent === null || percent === undefined) {
    fill.classList.add('indet');
    fill.style.width = '';
    pct.textContent = '';
  } else {
    fill.classList.remove('indet');
    fill.style.width = `${percent}%`;
    pct.textContent = `${percent}%`;
  }

  retry.hidden = !error;
});

retry.addEventListener('click', () => {
  retry.hidden = true;
  window.launcher.retry();
});
