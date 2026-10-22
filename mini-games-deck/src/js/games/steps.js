(function () {
  const { h, U } = Core;
  const PADS = [
    { name: 'Шампунь', sub: 'сначала', bg: '#3ec6ff' },
    { name: 'Пилинг', sub: 'на влажную кожу', bg: '#7ed321' },
    { name: 'Маска', sub: 'по длине', bg: '#ffd23a', ink: '#3a2a00' },
    { name: 'Термозащита', sub: 'перед феном', bg: '#ff5b6a' },
  ];

  Games.steps = function (body) {
    let round = 0, dead = false, timers = [];
    const later = (fn, ms) => timers.push(setTimeout(() => !dead && fn(), ms));

    function play() {
      const len = round + 1;
      const seq = Array.from({ length: len }, (_, i) => i % PADS.length);
      let phase = 'show', player = [], over = false;
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' }, h('span', {}, 'Повтори порядок ухода'), h('b', {}, 'раунд ' + (round + 1))));
      const note = h('div', { class: 'g-note' }, 'Смотри, какие кнопки загорятся.');
      const wheel = h('div', { class: 'simon-wheel' });
      const btns = PADS.map((p, i) => {
        const b = h('button', { style: { background: p.bg, color: p.ink || '#fff' } }, h('b', {}, p.name), h('small', {}, p.sub));
        b.onclick = () => {
          if (phase !== 'play' || over) return;
          flash(i, 180);
          player.push(i);
          const k = player.length - 1;
          if (player[k] !== seq[k]) {
            over = true; phase = 'done';
            later(() => Core.result(body, { win: false, title: 'Сбилась', text: 'Порядок другой: шампунь, пилинг, маска, термозащита.', onRetry: () => { round = 0; play(); } }), 420);
            return;
          }
          if (player.length === seq.length) {
            if (round >= 3) later(() => Core.result(body, { win: true, text: 'Порядок ухода повторён до конца: шампунь, пилинг, маска, термозащита.', onRetry: () => { round = 0; play(); } }), 400);
            else { round++; later(play, 650); }
          }
        };
        wheel.append(b);
        return b;
      });
      wheel.append(h('div', { class: 'simon-hub' }, h('small', {}, 'ОЧКИ'), h('b', {}, String(round))));
      body.append(note, wheel);
      function flash(i, ms) {
        btns[i].classList.add('lit');
        later(() => btns[i].classList.remove('lit'), ms);
      }
      function show(k) {
        if (k >= seq.length) { phase = 'play'; note.textContent = 'Теперь нажми то же самое.'; return; }
        later(() => { flash(seq[k], 420); later(() => show(k + 1), 560); }, 260);
      }
      show(0);
    }
    play();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
})();
