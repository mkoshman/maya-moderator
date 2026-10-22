(function () {
  const { h, U } = Core;
  const POOLS = [
    ['Шампунь', 'Смыть', 'Полотенце'],
    ['Шампунь', 'Пилинг', 'Смыть', 'Маска'],
    ['Шампунь', 'Смыть', 'Пилинг', 'Смыть', 'Полотенце', 'Маска'],
    ['Шампунь', 'Смыть', 'Пилинг', 'Смыть', 'Полотенце', 'Маска', 'Термозащита', 'Фен'],
  ];

  Games.steps = function (body) {
    let round = 0, dead = false, timers = [];
    const later = (fn, ms) => timers.push(setTimeout(() => !dead && fn(), ms));

    function play() {
      const labels = POOLS[Math.min(round, POOLS.length - 1)];
      const seq = [];
      const len = 2 + round;
      for (let i = 0; i < len; i++) seq.push(U.ri(0, labels.length - 1));
      let phase = 'show', player = [], over = false;
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('span', {}, 'Повтори последовательность'), h('b', {}, 'раунд ' + (round + 1))));
      const note = h('div', { class: 'g-note' }, 'Смотри, какие кнопки загорятся. Потом нажми то же самое.');
      const grid = h('div', { class: 'simon' });
      const btns = labels.map((lab, i) => {
        const b = h('button', {}, lab);
        b.onclick = () => {
          if (phase !== 'play' || over) return;
          flash(i, 220);
          player.push(i);
          const k = player.length - 1;
          if (player[k] !== seq[k]) {
            over = true; phase = 'done';
            later(() => Core.result(body, { win: false, title: 'Сбилась', text: 'Последовательность другая. В приложении попытка одна, здесь можно ещё раз.', onRetry: () => { round = 0; play(); } }), 500);
            return;
          }
          if (player.length === seq.length) {
            if (round >= 3) later(() => Core.result(body, { win: true, text: 'Четыре раунда. Кнопок стало больше, последовательность длиннее.', onRetry: () => { round = 0; play(); } }), 400);
            else { round++; later(play, 700); }
          }
        };
        grid.append(b);
        return b;
      });
      body.append(note, grid);
      function flash(i, ms) {
        btns[i].classList.add('lit');
        later(() => btns[i].classList.remove('lit'), ms);
      }
      function show(k) {
        if (k >= seq.length) { phase = 'play'; note.textContent = 'Теперь повтори.'; return; }
        later(() => { flash(seq[k], 420); later(() => show(k + 1), 520); }, 280);
      }
      show(0);
    }
    play();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
})();
