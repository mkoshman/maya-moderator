(function () {
  const { h, PALETTE, img, U } = Core;

  Games.flasks = function (body, opt = {}) {
    const pair = !!opt.pair;
    const colors = PALETTE.slice(0, 4);
    let state, sel, moves, turn, busy, hist, timers = [], dead = false;

    const later = (fn, ms) => { const t = setTimeout(() => { if (!dead) fn(); }, ms); timers.push(t); };
    function fresh() {
      let flasks;
      do {
        const units = U.shuffle([].concat(...colors.map((_, i) => [i, i, i, i])));
        flasks = [0, 1, 2, 3].map((i) => units.slice(i * 4, i * 4 + 4));
        flasks.push([], []);
      } while (flasks.some((f) => f.length && f.every((x) => x === f[0])));
      return flasks;
    }
    const done = (f) => f.length === 4 && f.every((x) => x === f[0]);
    function reset() {
      state = fresh(); sel = null; moves = 0; turn = 'me'; busy = false; hist = [];
      render();
    }
    function canPour(a, b) {
      const A = state[a], B = state[b];
      if (a === b || !A.length || done(A) || B.length >= 4) return 0;
      if (B.length && B[B.length - 1] !== A[A.length - 1]) return 0;
      let run = 0;
      for (let i = A.length - 1; i >= 0 && A[i] === A[A.length - 1]; i--) run++;
      return Math.min(run, 4 - B.length);
    }

    function flaskEl(f, i) {
      const el = h('div', { class: 'fl' + (sel === i ? ' sel' : ''), onclick: () => tap(i) });
      el.append(h('div', { class: 'lip' }));
      const glass = h('div', { class: 'glass' });
      if (done(f)) {
        const p = colors[f[0]];
        glass.append(h('div', { class: 'seg', style: { background: p.c, height: '100%', opacity: .2 } }));
        const d = h('div', { class: 'done' });
        d.append(h('div', { html: img(p.id, 52) }), h('small', {}, p.name));
        glass.append(d);
      } else {
        f.forEach((c) => glass.append(h('div', { class: 'seg', style: { background: colors[c].c } })));
      }
      el.append(glass);
      return el;
    }

    function animatePour(a, b, n, cb) {
      const grid = body.querySelector('.flasks');
      const A = grid.children[a], B = grid.children[b];
      const ar = A.getBoundingClientRect(), br = B.getBoundingClientRect(), gr = grid.getBoundingClientRect();
      const col = colors[state[a][state[a].length - 1]].c;
      const st = h('div', { class: 'stream', style: {
        left: (ar.left + ar.width / 2 - gr.left) + 'px',
        top: (Math.min(ar.top, br.top) - gr.top + 20) + 'px',
        height: Math.abs(br.left - ar.left) ? Math.hypot(br.left - ar.left, br.top - ar.top) + 'px' : '40px',
        background: col,
        transform: `rotate(${Math.atan2(br.top - ar.top, br.left - ar.left) * 180 / Math.PI - 90}deg)`,
        transformOrigin: 'top center',
      } });
      grid.append(st);
      later(() => { st.remove(); cb(); }, 380);
    }

    function pour(a, b) {
      const n = canPour(a, b);
      if (!n) return false;
      hist.push(JSON.stringify(state));
      busy = true;
      animatePour(a, b, n, () => {
        for (let i = 0; i < n; i++) state[b].push(state[a].pop());
        moves++; busy = false; sel = null;
        render();
        if (doneCount() === 4) later(() => Core.result(body, {
          win: true,
          text: pair ? 'Банки собрали вместе. Ходов: ' + moves : 'Все банки залиты за ' + moves + ' ходов.',
          onRetry: reset,
        }), 400);
        else if (pair) { turn = 'friend'; later(bot, 900); }
      });
      return true;
    }
    const doneCount = () => state.filter(done).length;
    function bot() {
      let best = null, score = -1;
      for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) {
        const n = canPour(a, b);
        if (!n) continue;
        let sc = state[b].length ? 10 + n : (new Set(state[a]).size > 1 ? 3 : -1);
        if (sc > score) { score = sc; best = [a, b]; }
      }
      turn = 'me';
      if (best) pour(best[0], best[1]);
      else { busy = false; render(); }
    }
    function tap(i) {
      if (busy || turn !== 'me') return;
      if (sel == null) { if (state[i].length && !done(state[i])) { sel = i; render(); } return; }
      if (sel === i) { sel = null; render(); return; }
      if (!pour(sel, i)) { sel = null; render(); }
    }
    function undo() {
      if (!hist.length || busy) return;
      state = JSON.parse(hist.pop()); moves = Math.max(0, moves - 1); sel = null; render();
    }
    function render() {
      body.innerHTML = '';
      body.append(h('div', { class: 'g-top' },
        h('span', {}, 'Собрано: ', h('b', {}, doneCount() + ' / 4')),
        pair ? h('span', { class: 'role ' + (turn === 'me' ? 'me' : '') }, turn === 'me' ? 'Твой ход' : 'Ход подруги') : h('span', {}, 'Ходов: ', h('b', {}, moves))));
      body.append(h('div', { class: 'g-note' }, 'Сначала колбы прозрачные. Перелей жидкость цвета банки. Когда колба полная одного цвета, она становится нашей банкой.'));
      const grid = h('div', { class: 'flasks' });
      state.forEach((f, i) => grid.append(flaskEl(f, i)));
      body.append(grid);
      body.append(h('div', { class: 'row-btns' }, h('button', { class: 'btn sm', onclick: undo }, '↶ Назад'), h('button', { class: 'btn sm', onclick: reset }, 'Заново')));
    }
    reset();
    return () => { dead = true; timers.forEach(clearTimeout); };
  };
})();
